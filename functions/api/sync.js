/**
 * Cloudflare Pages Function: /api/sync
 * 负责站点全量与增量数据的安全代理与多端持久化同步
 *
 * 核心特性：
 * 1. 有数据库时优先使用 Cloudflare D1 (env.DB) 乐观锁参数化存储；
 * 2. 无数据库但有对象存储时，使用 Cloudflare R2 (env.BUCKET / env.R2_BUCKET) 条件写入；
 * 3. 没有持久化存储时明确返回错误，不把 Worker 内存误报为跨设备同步。
 * 4. 严格保护写入鉴权（站长 Token / SYNC_BEARER_TOKEN）；
 * 5. 1.5MB Payload 大小限制保护。
 */

import { getAdminConfig, verifyAdminToken, readAdminToken } from '../_lib/auth.js';

const MAX_PAYLOAD_BYTES = 1.5 * 1024 * 1024; // 1.5MB

// 全站唯一的默认同步房间：同一个项目的所有设备/浏览器共用同一份记录
const DEFAULT_SYNC_KEY = 'whitefox-site-main';

function normalizeSyncNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

async function readR2SyncRecord(bucket, key) {
  const object = await bucket.get(key);
  if (!object) return null;

  const data = JSON.parse(await object.text());
  return {
    ...data,
    version: normalizeSyncNumber(object.customMetadata?.version, normalizeSyncNumber(data.version, 1)),
    updatedAt: normalizeSyncNumber(object.customMetadata?.updatedAt, normalizeSyncNumber(data.updatedAt, Date.now())),
    etag: object.etag
  };
}

async function writeR2SyncRecord(bucket, key, record) {
  const serialized = JSON.stringify(record);

  // R2 checks these ETag conditions atomically with the write. Retry when another
  // request wins the race, and never replace a record with an equal/older version.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await readR2SyncRecord(bucket, key);
    if (current && current.version >= record.version) {
      return { success: false, conflict: true, currentVersion: current.version };
    }

    const onlyIf = current
      ? { etagMatches: current.etag }
      : { etagDoesNotMatch: '*' };
    const stored = await bucket.put(key, serialized, {
      onlyIf,
      customMetadata: {
        version: String(record.version),
        updatedAt: String(record.updatedAt)
      }
    });

    if (stored) return { success: true };
  }

  const latest = await readR2SyncRecord(bucket, key);
  return {
    success: false,
    conflict: true,
    currentVersion: latest ? latest.version : 0
  };
}

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
  // 没有配置任何服务端写入凭据时必须 fail closed。
  return false;
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

  const db = env?.DB;
  const bucket = env?.BUCKET || env?.R2_BUCKET;

  let d1Record = null;

  // 1. 从 D1 数据库拉取；暂不立即返回，以便与 R2 降级副本比较版本。
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

        d1Record = {
          storageEngine: 'cloudflare-d1',
          syncKey: result.sync_key,
          version: normalizeSyncNumber(result.version),
          updatedAt: normalizeSyncNumber(result.updated_at, Date.now()),
          payload: parsedPayload
        };
      }
    } catch (err) {
      console.warn('D1 query failed, checking fallback:', err.message);
    }
  }

  let r2Record = null;

  // 2. 读取 R2 副本，即使 D1 有记录也要比较版本，避免降级写入被旧 D1 数据遮蔽。
  if (bucket) {
    try {
      const r2Key = `site_sync/${syncKey}.json`;
      const data = await readR2SyncRecord(bucket, r2Key);
      if (data) {
        r2Record = {
          storageEngine: 'cloudflare-r2',
          syncKey,
          version: data.version,
          updatedAt: data.updatedAt,
          payload: data.payload
        };
      }
    } catch (err) {
      console.warn('R2 sync read error:', err.message);
    }
  }

  // Keep D1 as the tie-breaker; a higher-version R2 record wins during failover.
  const latestRecord = [d1Record, r2Record]
    .filter(Boolean)
    .reduce((latest, candidate) => (
      !latest || candidate.version > latest.version ? candidate : latest
    ), null);

  if (latestRecord) {
    return new Response(JSON.stringify({
      success: true,
      ...latestRecord
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
  const db = env?.DB;
  const bucket = env?.BUCKET || env?.R2_BUCKET;

  // 方式 A: 若配置了 Cloudflare D1 数据库，写入 D1
  if (db) {
    if (bucket) {
      try {
        const r2Current = await readR2SyncRecord(bucket, `site_sync/${syncKey}.json`);
        if (r2Current && r2Current.version >= version) {
          return new Response(JSON.stringify({
            success: false,
            conflict: true,
            currentVersion: r2Current.version,
            message: 'Conflict detected: R2 has a newer or equal version. Please pull and merge first.'
          }), {
            status: 409,
            headers: CORS_HEADERS
          });
        }
      } catch (err) {
        console.warn('R2 version check failed before D1 write:', err.message);
        return new Response(JSON.stringify({
          success: false,
          error: 'Could not verify the R2 sync version. Please retry after storage recovers.'
        }), {
          status: 503,
          headers: CORS_HEADERS
        });
      }
    }

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

      // 同步一份快照给 R2（如果有），并通过 ETag 条件避免旧请求覆盖新版本。
      if (bucket) {
        try {
          const r2Key = `site_sync/${syncKey}.json`;
          const mirrored = await writeR2SyncRecord(bucket, r2Key, { version, updatedAt, payload: rawPayload });
          if (!mirrored.success) {
            return new Response(JSON.stringify({
              success: false,
              conflict: true,
              currentVersion: mirrored.currentVersion,
              message: 'Conflict detected while updating the R2 replica. Please pull and merge first.'
            }), {
              status: 409,
              headers: CORS_HEADERS
            });
          }
        } catch (e) {
          console.warn('R2 mirror write failed:', e.message);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        storageEngine: 'cloudflare-d1',
        syncKey,
        version,
        updatedAt,
        message: 'Sync payload persisted to Cloudflare D1 successfully'
      }), {
        status: 200,
        headers: CORS_HEADERS
      });
    } catch (err) {
      console.warn('D1 write failed, attempting R2 fallback:', err.message);
    }
  }

  // 方式 B: 无 D1 数据库但有 R2 对象存储桶，持久化写入 R2
  if (bucket) {
    try {
      const r2Key = `site_sync/${syncKey}.json`;
      const stored = await writeR2SyncRecord(bucket, r2Key, {
        version,
        updatedAt,
        payload: rawPayload
      });

      if (!stored.success) {
        return new Response(JSON.stringify({
          success: false,
          conflict: true,
          currentVersion: stored.currentVersion,
          message: 'Conflict detected in R2. Please pull and merge before retrying.'
        }), {
          status: 409,
          headers: CORS_HEADERS
        });
      }

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

  // No durable store means no cross-device sync. Do not report a memory-only
  // write as success because Workers do not share durable process memory.
  return new Response(JSON.stringify({
    success: false,
    notConfigured: true,
    error: 'Cloud sync storage is unavailable. Bind a D1 database (DB) or R2 bucket (BUCKET).'
  }), {
    status: 503,
    headers: CORS_HEADERS
  });
}
