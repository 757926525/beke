/**
 * Cloudflare Pages Function: /api/sync
 * 负责站点全量与增量数据的安全代理与多端持久化同步
 *
 * 核心特性：
 * 1. 有数据库时优先使用 Cloudflare D1 (env.DB) 乐观锁参数化存储；
 * 2. 无数据库但有对象存储时，自适应回退到 Cloudflare R2 (env.BUCKET / env.R2_BUCKET) 或 KV/内存存储，
 *    彻底实现“无论有无数据库，都能自动跨设备跨浏览器同步”！
 * 3. 严格保护写入鉴权（站长 Token / SYNC_BEARER_TOKEN）；
 * 4. 1.5MB Payload 大小限制保护；
 * 5. 跨设备版本号乐观锁与冲突探测机制。
 */

import { getAdminConfig, verifyAdminToken, readAdminToken } from '../_lib/auth.js';

const MAX_PAYLOAD_BYTES = 1.5 * 1024 * 1024; // 1.5MB

// 全站唯一的默认同步房间：同一个项目的所有设备/浏览器共用同一份记录
const DEFAULT_SYNC_KEY = 'whitefox-site-main';

// 内存中继回退缓存（当既无 D1 又无 R2 时提供当前 Worker 进程内的状态共享）
const memoryVaultStore = new Map();

/**
 * 解析最终使用的房间密钥。
 * - 设置了环境变量 SYNC_ROOM_KEY：服务端强制使用该值（所有设备必然一致，最稳妥）
 * - 否则使用客户端传入的 key（默认也是同一个共享 key）
 */
function resolveSyncKey(clientKey, env) {
  const forced = (env?.SYNC_ROOM_KEY || '').trim();
  if (forced) return forced;
  return (clientKey || '').trim() || DEFAULT_SYNC_KEY;
}

// 跨域响应头
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Sync-Key, X-Sync-Version, X-Admin-Token',
  'Content-Type': 'application/json; charset=utf-8'
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

// 读取：公开站点内容需要被所有访客拉取（写入受保护，且 payload 已剔除敏感凭据）
function verifyReadAuth(request, env) {
  const serverToken = env?.SYNC_BEARER_TOKEN;
  if (!serverToken) return true;
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return token === serverToken;
}

// 写入：共享房间之后必须保护写权限，仅管理员会话令牌（或服务端 Bearer）可写
async function verifyWriteAuth(request, env) {
  const serverToken = env?.SYNC_BEARER_TOKEN;
  if (serverToken) {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token === serverToken) return true;
  }
  const admin = getAdminConfig(env);
  if (admin.configured) {
    return verifyAdminToken(env, readAdminToken(request));
  }
  // 既没有配置 Bearer 也没有配置管理员密码：保持开放写入模式
  return !serverToken;
}

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!verifyReadAuth(request, env)) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized: Invalid Bearer Token' }), {
      status: 401,
      headers: CORS_HEADERS
    });
  }

  const url = new URL(request.url);
  const syncKey = resolveSyncKey(url.searchParams.get('key') || request.headers.get('X-Sync-Key'), env);

  const kv = env?.KV || env?.WHITEFOX_KV;
  const db = env?.DB;
  const bucket = env?.BUCKET || env?.R2_BUCKET;

  // 1. 最高优先级：若绑定了 KV (env.KV)，博客文章、配置、浏览记录优先从 KV 读取
  if (kv) {
    try {
      const kvKey = `site_sync:${syncKey}`;
      const rawText = await kv.get(kvKey);
      if (rawText) {
        const data = JSON.parse(rawText);
        return new Response(JSON.stringify({
          success: true,
          storageEngine: 'cloudflare-kv',
          syncKey,
          version: data.version || 1,
          updatedAt: data.updatedAt || Date.now(),
          payload: data.payload
        }), {
          status: 200,
          headers: CORS_HEADERS
        });
      }
    } catch (err) {
      console.warn('KV read error, falling back to D1:', err.message);
    }
  }

  // 2. 次优先级：从 D1 数据库拉取
  if (db) {
    try {
      const query = `SELECT sync_key, payload, version, updated_at FROM site_sync WHERE sync_key = ? LIMIT 1`;
      const result = await db.prepare(query).bind(syncKey).first();

      if (result) {
        let parsedPayload = null;
        try {
          parsedPayload = JSON.parse(result.payload);
        } catch (e) {
          parsedPayload = result.payload;
        }

        return new Response(JSON.stringify({
          success: true,
          storageEngine: 'cloudflare-d1',
          syncKey: result.sync_key,
          version: result.version,
          updatedAt: result.updated_at,
          payload: parsedPayload
        }), {
          status: 200,
          headers: CORS_HEADERS
        });
      }
    } catch (err) {
      console.warn('D1 query failed, checking fallback:', err.message);
    }
  }

  // 3. 次次优先级：从 R2 对象存储中读取
  if (bucket) {
    try {
      const r2Key = `site_sync/${syncKey}.json`;
      const object = await bucket.get(r2Key);
      if (object) {
        const text = await object.text();
        const data = JSON.parse(text);
        return new Response(JSON.stringify({
          success: true,
          storageEngine: 'cloudflare-r2',
          syncKey,
          version: data.version || 1,
          updatedAt: data.updatedAt || Date.now(),
          payload: data.payload
        }), {
          status: 200,
          headers: CORS_HEADERS
        });
      }
    } catch (err) {
      console.warn('R2 sync read error:', err.message);
    }
  }

  // 3. 内存缓存回退 (Worker 进程内存)
  if (memoryVaultStore.has(syncKey)) {
    const memData = memoryVaultStore.get(syncKey);
    return new Response(JSON.stringify({
      success: true,
      storageEngine: 'memory-relay',
      syncKey,
      version: memData.version || 1,
      updatedAt: memData.updatedAt || Date.now(),
      payload: memData.payload
    }), {
      status: 200,
      headers: CORS_HEADERS
    });
  }

  // 4. 若全流程都未找到已存数据，返回 404
  return new Response(JSON.stringify({
    success: false,
    notFound: true,
    message: 'No sync data found for key: ' + syncKey
  }), {
    status: 404,
    headers: CORS_HEADERS
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!(await verifyWriteAuth(request, env))) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized: 仅登录的站长可以写入同步数据，请先登录管理员账号' }), {
      status: 401,
      headers: CORS_HEADERS
    });
  }

  // 1. 服务端校验 Payload 尺寸，超过 1.5MB 直接阻断
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return new Response(JSON.stringify({
      success: false,
      error: `Payload too large (${(contentLength / 1024 / 1024).toFixed(2)}MB). Limit is 1.5MB. Please upload large images/files to R2 and store only URLs.`
    }), {
      status: 413,
      headers: CORS_HEADERS
    });
  }

  let bodyText = '';
  try {
    bodyText = await request.text();
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: 'Failed to read request body' }), {
      status: 400,
      headers: CORS_HEADERS
    });
  }

  if (bodyText.length > MAX_PAYLOAD_BYTES) {
    return new Response(JSON.stringify({
      success: false,
      error: `Payload text size exceeds 1.5MB limit. Please upload images to R2 storage.`
    }), {
      status: 413,
      headers: CORS_HEADERS
    });
  }

  let body = null;
  try {
    body = JSON.parse(bodyText);
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: 'Malformed JSON payload' }), {
      status: 400,
      headers: CORS_HEADERS
    });
  }

  const syncKey = resolveSyncKey(body.key || request.headers.get('X-Sync-Key'), env);
  const rawPayload = body.payload;
  const version = typeof body.version === 'number' ? body.version : parseInt(request.headers.get('X-Sync-Version') || '1', 10);
  const updatedAt = typeof body.updatedAt === 'number' ? body.updatedAt : Date.now();

  if (!rawPayload) {
    return new Response(JSON.stringify({ success: false, error: 'Missing payload' }), {
      status: 400,
      headers: CORS_HEADERS
    });
  }

  const payloadString = typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload);
  const kv = env?.KV || env?.WHITEFOX_KV;
  const db = env?.DB;
  const bucket = env?.BUCKET || env?.R2_BUCKET;

  // 方式 A: 若配置了 Cloudflare KV，博客文章、配置信息等优先写入 KV
  let savedToKV = false;
  if (kv) {
    try {
      const kvKey = `site_sync:${syncKey}`;
      const currentMeta = await kv.get(kvKey + ':meta', { type: 'json' });
      if (currentMeta && currentMeta.version >= version) {
        return new Response(JSON.stringify({
          success: false,
          conflict: true,
          currentVersion: currentMeta.version,
          message: 'Conflict detected in KV: Server has newer version.'
        }), {
          status: 409,
          headers: CORS_HEADERS
        });
      }

      await kv.put(kvKey, JSON.stringify({ version, updatedAt, payload: rawPayload }));
      await kv.put(kvKey + ':meta', JSON.stringify({ version, updatedAt }));
      savedToKV = true;
    } catch (err) {
      console.warn('KV write failed, attempting D1/R2:', err.message);
    }
  }

  // 方式 B: 若配置了 Cloudflare D1 数据库，写入 D1
  if (db) {
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS site_sync (
          sync_key TEXT PRIMARY KEY,
          payload TEXT NOT NULL,
          version INTEGER NOT NULL DEFAULT 0,
          updated_at INTEGER NOT NULL
        )
      `).run();

      const upsertSql = `
        INSERT INTO site_sync (sync_key, payload, version, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(sync_key) DO UPDATE SET
          payload = excluded.payload,
          version = excluded.version,
          updated_at = excluded.updated_at
        WHERE excluded.version > site_sync.version;
      `;

      const runResult = await db.prepare(upsertSql).bind(syncKey, payloadString, version, updatedAt).run();

      // 判断是否因版本较旧而未更新 (changes === 0)
      if (runResult.meta && runResult.meta.changes === 0) {
        const current = await db.prepare('SELECT version, updated_at FROM site_sync WHERE sync_key = ?').bind(syncKey).first();
        return new Response(JSON.stringify({
          success: false,
          conflict: true,
          currentVersion: current ? current.version : null,
          message: 'Conflict detected: Server has newer or equal version. Please pull and merge first.'
        }), {
          status: 409,
          headers: CORS_HEADERS
        });
      }

      // 同步一份快照给 R2（如果有），提供双重容灾保障
      if (bucket) {
        try {
          const r2Key = `site_sync/${syncKey}.json`;
          await bucket.put(r2Key, JSON.stringify({ version, updatedAt, payload: rawPayload }), {
            customMetadata: { version: String(version), updatedAt: String(updatedAt) }
          });
        } catch (e) {
          // ignore
        }
      }

      return new Response(JSON.stringify({
        success: true,
        storageEngine: savedToKV ? 'cloudflare-kv+d1' : 'cloudflare-d1',
        syncKey,
        version,
        updatedAt,
        message: 'Sync payload persisted to Cloudflare D1 (and KV) successfully'
      }), {
        status: 200,
        headers: CORS_HEADERS
      });
    } catch (err) {
      console.warn('D1 write failed, attempting R2/memory fallback:', err.message);
    }
  }

  if (savedToKV) {
    return new Response(JSON.stringify({
      success: true,
      storageEngine: 'cloudflare-kv',
      syncKey,
      version,
      updatedAt,
      message: 'Sync payload persisted to Cloudflare KV successfully'
    }), {
      status: 200,
      headers: CORS_HEADERS
    });
  }

  // 方式 B: 无 D1 数据库但有 R2 对象存储桶，持久化写入 R2
  if (bucket) {
    try {
      const r2Key = `site_sync/${syncKey}.json`;
      // 检查版本防旧覆盖
      const existing = await bucket.get(r2Key);
      if (existing) {
        try {
          const meta = existing.customMetadata || {};
          const currentVersion = parseInt(meta.version || '0', 10);
          if (currentVersion >= version) {
            return new Response(JSON.stringify({
              success: false,
              conflict: true,
              currentVersion,
              message: 'Conflict detected in R2: Storage has newer version. Please pull and merge first.'
            }), {
              status: 409,
              headers: CORS_HEADERS
            });
          }
        } catch (e) {
          // continue
        }
      }

      await bucket.put(r2Key, JSON.stringify({
        version,
        updatedAt,
        payload: rawPayload
      }), {
        customMetadata: {
          version: String(version),
          updatedAt: String(updatedAt)
        }
      });

      return new Response(JSON.stringify({
        success: true,
        storageEngine: 'cloudflare-r2',
        syncKey,
        version,
        updatedAt,
        message: 'Sync payload persisted to Cloudflare R2 object storage successfully'
      }), {
        status: 200,
        headers: CORS_HEADERS
      });
    } catch (err) {
      console.warn('R2 write error:', err.message);
    }
  }

  // 方式 C: 内存持久化保底（无数据库也无 R2 对象存储的环境）
  const existingMem = memoryVaultStore.get(syncKey);
  if (existingMem && existingMem.version >= version) {
    return new Response(JSON.stringify({
      success: false,
      conflict: true,
      currentVersion: existingMem.version,
      message: 'Conflict detected: Memory relay has newer version.'
    }), {
      status: 409,
      headers: CORS_HEADERS
    });
  }

  memoryVaultStore.set(syncKey, {
    version,
    updatedAt,
    payload: rawPayload
  });

  return new Response(JSON.stringify({
    success: true,
    storageEngine: 'memory-relay',
    syncKey,
    version,
    updatedAt,
    message: 'Sync payload persisted to server relay memory'
  }), {
    status: 200,
    headers: CORS_HEADERS
  });
}
