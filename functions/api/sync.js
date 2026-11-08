/**
 * Cloudflare Pages Function: /api/sync
 * 负责站点全量与增量数据的安全代理与多端持久化同步
 *
 * 架构规范：
 * 1. 结构化数据与站点配置优先写入与读取 Cloudflare D1 (env.DB)；
 * 2. 若未绑定 D1，自动降级至 Cloudflare KV (env.KV) 缓存；
 * 3. 若无 D1 也无 KV，降级至 R2 (env.BUCKET) 或内存中继；
 * 4. 彻底解决“无论有无数据库，都能自动跨设备跨浏览器同步”。
 * 5. 严格保护写入鉴权（站长 Token / SYNC_BEARER_TOKEN），并提供并发乐观锁防冲突。
 */

import { getAdminConfig, verifyAdminToken, readAdminToken } from '../_lib/auth.js';

const MAX_PAYLOAD_BYTES = 1.5 * 1024 * 1024; // 1.5MB

// 全站唯一的默认同步房间
const DEFAULT_SYNC_KEY = 'whitefox-site-main';

// 内存中继回退缓存
const memoryVaultStore = new Map();

function resolveSyncKey(clientKey, env) {
  const forced = (env?.SYNC_ROOM_KEY || '').trim();
  if (forced) return forced;
  return (clientKey || '').trim() || DEFAULT_SYNC_KEY;
}

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

function verifyReadAuth(request, env) {
  const serverToken = env?.SYNC_BEARER_TOKEN;
  if (!serverToken) return true;
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return token === serverToken;
}

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

  const db = env?.DB;
  const kv = env?.KV || env?.WHITEFOX_KV;
  const bucket = env?.BUCKET || env?.R2_BUCKET;

  // 1. 优先从 D1 数据库拉取（结构化数据与配置持久化中心）
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
      console.warn('D1 query failed, falling back to KV:', err.message);
    }
  }

  // 2. 次优先级：若无 D1 数据库，降级从 Cloudflare KV 读取
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
      console.warn('KV read error, falling back to R2:', err.message);
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
      console.warn('R2 read failed, falling back to memory store:', err.message);
    }
  }

  // 4. 最低优先级：从 Worker 实例内存回退缓存读取
  if (memoryVaultStore.has(syncKey)) {
    const memoryRecord = memoryVaultStore.get(syncKey);
    return new Response(JSON.stringify({
      success: true,
      storageEngine: 'memory-relay',
      syncKey,
      version: memoryRecord.version,
      updatedAt: memoryRecord.updatedAt,
      payload: memoryRecord.payload
    }), {
      status: 200,
      headers: CORS_HEADERS
    });
  }

  return new Response(JSON.stringify({
    success: true,
    storageEngine: db ? 'cloudflare-d1' : (kv ? 'cloudflare-kv' : 'initial-empty'),
    syncKey,
    version: 0,
    updatedAt: 0,
    payload: null
  }), {
    status: 200,
    headers: CORS_HEADERS
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const isAuthorized = await verifyWriteAuth(request, env);
  if (!isAuthorized) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Forbidden: Admin authorization required to push data to cloud'
    }), {
      status: 403,
      headers: CORS_HEADERS
    });
  }

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

  const bodyText = await request.text();
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
  const kv = env?.KV || env?.WHITEFOX_KV;
  const bucket = env?.BUCKET || env?.R2_BUCKET;

  let savedStorage = 'none';

  // 1. 架构核心规范：优先写入 Cloudflare D1 数据库
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

      if (runResult.meta && runResult.meta.changes === 0) {
        const current = await db.prepare('SELECT version, updated_at FROM site_sync WHERE sync_key = ?').bind(syncKey).first();
        if (current && current.version >= version) {
          return new Response(JSON.stringify({
            success: false,
            conflict: true,
            currentVersion: current.version,
            message: 'Conflict detected: Server has newer or equal version.'
          }), {
            status: 409,
            headers: CORS_HEADERS
          });
        }
      }
      savedStorage = 'cloudflare-d1';
    } catch (err) {
      console.warn('D1 write error, falling back to KV/R2:', err.message);
    }
  }

  // 2. 若配置了 Cloudflare KV，同时或降级写入 KV 缓存热点
  if (kv) {
    try {
      const kvKey = `site_sync:${syncKey}`;
      const currentMeta = await kv.get(kvKey + ':meta', { type: 'json' });
      if (!db && currentMeta && currentMeta.version >= version) {
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
      if (savedStorage === 'none') {
        savedStorage = 'cloudflare-kv';
      }
    } catch (err) {
      console.warn('KV write failed:', err.message);
    }
  }

  // 3. 次次降级：R2
  if (savedStorage === 'none' && bucket) {
    try {
      const r2Key = `site_sync/${syncKey}.json`;
      const metaKey = `site_sync/${syncKey}.meta.json`;

      const existingMetaObj = await bucket.get(metaKey);
      if (existingMetaObj) {
        const existingMeta = JSON.parse(await existingMetaObj.text());
        if (existingMeta.version >= version) {
          return new Response(JSON.stringify({
            success: false,
            conflict: true,
            currentVersion: existingMeta.version,
            message: 'Conflict detected in R2: Remote has newer version.'
          }), {
            status: 409,
            headers: CORS_HEADERS
          });
        }
      }

      const syncData = JSON.stringify({ version, updatedAt, payload: rawPayload });
      await bucket.put(r2Key, syncData, { httpMetadata: { contentType: 'application/json' } });
      await bucket.put(metaKey, JSON.stringify({ version, updatedAt }));
      savedStorage = 'cloudflare-r2';
    } catch (err) {
      console.warn('R2 write error:', err.message);
    }
  }

  // 4. 最低优先级：内存中继
  if (savedStorage === 'none') {
    const existing = memoryVaultStore.get(syncKey);
    if (existing && existing.version >= version) {
      return new Response(JSON.stringify({
        success: false,
        conflict: true,
        currentVersion: existing.version,
        message: 'Conflict detected in Memory store.'
      }), {
        status: 409,
        headers: CORS_HEADERS
      });
    }

    memoryVaultStore.set(syncKey, { version, updatedAt, payload: rawPayload });
    savedStorage = 'memory-relay';
  }

  return new Response(JSON.stringify({
    success: true,
    storageEngine: savedStorage,
    syncKey,
    version,
    updatedAt
  }), {
    status: 200,
    headers: CORS_HEADERS
  });
}
