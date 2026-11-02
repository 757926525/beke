/**
 * Cloudflare Pages Function: /api/sync
 * 负责站点全量与增量数据的安全代理与多端持久化同步
 *
 * 核心安全与控制能力：
 * 1. Bearer Token 鉴权（若服务端配置 SYNC_BEARER_TOKEN 环境变量）
 * 2. Payload 大小严格校验（服务端限制 1.5MB，超限返回 413 Payload Too Large）
 * 3. 参数化 SQL 防注入，禁止客户端直传 SQL
 * 4. 基于 version 乐观并发锁写入：
 *    INSERT INTO site_sync (sync_key, payload, version, updated_at)
 *    VALUES (?, ?, ?, ?)
 *    ON CONFLICT(sync_key) DO UPDATE SET
 *      payload = excluded.payload,
 *      version = excluded.version,
 *      updated_at = excluded.updated_at
 *    WHERE excluded.version > site_sync.version
 */

const MAX_PAYLOAD_BYTES = 1.5 * 1024 * 1024; // 1.5MB

// 跨域响应头
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Sync-Key, X-Sync-Version',
  'Content-Type': 'application/json; charset=utf-8'
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

function verifyAuth(request, env) {
  const serverToken = env?.SYNC_BEARER_TOKEN;
  if (!serverToken) {
    // 若服务端未配置强校验 token，允许通过房间密钥 sync_key 逻辑隔离
    return true;
  }
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return token === serverToken;
}

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!verifyAuth(request, env)) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized: Invalid Bearer Token' }), {
      status: 401,
      headers: CORS_HEADERS
    });
  }

  const url = new URL(request.url);
  const syncKey = (url.searchParams.get('key') || request.headers.get('X-Sync-Key') || '').trim();

  if (!syncKey) {
    return new Response(JSON.stringify({ success: false, error: 'Missing sync_key parameter' }), {
      status: 400,
      headers: CORS_HEADERS
    });
  }

  const db = env?.DB;
  if (!db) {
    return new Response(JSON.stringify({
      success: false,
      error: 'D1 Database binding "DB" is not configured in Cloudflare Pages'
    }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }

  try {
    // 参数化查询
    const query = `SELECT sync_key, payload, version, updated_at FROM site_sync WHERE sync_key = ? LIMIT 1`;
    const result = await db.prepare(query).bind(syncKey).first();

    if (!result) {
      return new Response(JSON.stringify({
        success: false,
        notFound: true,
        message: 'No sync data found for key: ' + syncKey
      }), {
        status: 404,
        headers: CORS_HEADERS
      });
    }

    let parsedPayload = null;
    try {
      parsedPayload = JSON.parse(result.payload);
    } catch (e) {
      parsedPayload = result.payload;
    }

    return new Response(JSON.stringify({
      success: true,
      syncKey: result.sync_key,
      version: result.version,
      updatedAt: result.updated_at,
      payload: parsedPayload
    }), {
      status: 200,
      headers: CORS_HEADERS
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Database query failed: ' + err.message
    }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!verifyAuth(request, env)) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized: Invalid Bearer Token' }), {
      status: 401,
      headers: CORS_HEADERS
    });
  }

  const db = env?.DB;
  if (!db) {
    return new Response(JSON.stringify({
      success: false,
      error: 'D1 Database binding "DB" is not configured in Cloudflare Pages'
    }), {
      status: 500,
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

  const syncKey = (body.key || request.headers.get('X-Sync-Key') || '').trim();
  const rawPayload = body.payload;
  const version = typeof body.version === 'number' ? body.version : parseInt(request.headers.get('X-Sync-Version') || '1', 10);
  const updatedAt = typeof body.updatedAt === 'number' ? body.updatedAt : Date.now();

  if (!syncKey || !rawPayload) {
    return new Response(JSON.stringify({ success: false, error: 'Missing sync key or payload' }), {
      status: 400,
      headers: CORS_HEADERS
    });
  }

  const payloadString = typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload);

  try {
    // 确保 site_sync 表结构就绪
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS site_sync (
        sync_key TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL
      )
    `).run();

    // 参数化 SQL 与乐观锁写入：仅当新 version > 已有 version 时才覆盖
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
      // 查询当前最新版本返回给前端，提示需先 pull
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

    return new Response(JSON.stringify({
      success: true,
      syncKey,
      version,
      updatedAt,
      message: 'Sync payload persisted successfully'
    }), {
      status: 200,
      headers: CORS_HEADERS
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Database write error: ' + err.message
    }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
}
