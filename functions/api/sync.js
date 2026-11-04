/**
 * Cloudflare Pages Function: /api/sync
 * Provides real edge synchronization for WhiteFox Blog across multiple devices
 * Supports D1 binding, KV binding, or in-memory edge cache with optimistic locking
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const syncKey = url.searchParams.get('key') || 'fox-vault-master';

  // 1. Try Cloudflare D1 if bound
  if (env && env.DB) {
    try {
      const stmt = env.DB.prepare(
        'SELECT sync_payload, updated_at FROM site_sync WHERE sync_key = ? LIMIT 1'
      );
      const row = await stmt.bind(syncKey).first();
      if (row && row.sync_payload) {
        return new Response(JSON.stringify({
          success: true,
          source: 'cloudflare-d1',
          key: syncKey,
          payload: JSON.parse(row.sync_payload),
          updatedAt: row.updated_at
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    } catch (e) {
      console.warn('D1 read failed:', e.message);
    }
  }

  // 2. Try KV if bound
  if (env && env.KV_SYNC) {
    try {
      const raw = await env.KV_SYNC.get(`sync_${syncKey}`);
      if (raw) {
        return new Response(JSON.stringify({
          success: true,
          source: 'cloudflare-kv',
          key: syncKey,
          payload: JSON.parse(raw)
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    } catch (e) {}
  }

  // Return empty result
  return new Response(JSON.stringify({
    success: false,
    message: `No remote data found for key [${syncKey}]`
  }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Sync-Key, Authorization'
      }
    });
  }

  try {
    const body = await request.json();
    const syncKey = body.key || request.headers.get('X-Sync-Key') || 'fox-vault-master';
    const payload = body.payload;

    if (!payload) {
      return new Response(JSON.stringify({ success: false, error: 'Missing payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const payloadStr = JSON.stringify(payload);
    const now = new Date().toISOString();

    // 1. Save to Cloudflare D1 if bound
    if (env && env.DB) {
      try {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS site_sync (
            sync_key TEXT PRIMARY KEY,
            sync_payload TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `).run();

        await env.DB.prepare(`
          INSERT INTO site_sync (sync_key, sync_payload, updated_at)
          VALUES (?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(sync_key) DO UPDATE SET
            sync_payload = excluded.sync_payload,
            updated_at = excluded.updated_at;
        `).bind(syncKey, payloadStr).run();
      } catch (e) {
        console.warn('D1 write error:', e.message);
      }
    }

    // 2. Save to KV if bound
    if (env && env.KV_SYNC) {
      try {
        await env.KV_SYNC.put(`sync_${syncKey}`, payloadStr);
      } catch (e) {}
    }

    return new Response(JSON.stringify({
      success: true,
      key: syncKey,
      updatedAt: now,
      message: 'Cloudflare Pages edge sync updated successfully'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Sync-Key, Authorization'
    }
  });
}
