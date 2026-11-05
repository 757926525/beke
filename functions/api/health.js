/**
 * Cloudflare Pages Function: /api/health
 * Probes environment bindings (D1, R2, KV) and backend configuration
 * Reports live status and connectivity for Cloudflare D1 & R2
 */

export async function onRequestGet(context) {
  const { env } = context;

  let d1Healthy = false;
  let d1TablesCount = 0;
  let r2Healthy = false;

  // 1. Probe Cloudflare D1
  if (env && env.DB) {
    try {
      const res = await env.DB.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table'").first();
      d1Healthy = true;
      d1TablesCount = res?.count || 0;
    } catch (e) {
      console.warn('D1 health check warning:', e.message);
    }
  }

  // 2. Probe Cloudflare R2
  if (env && env.BUCKET) {
    try {
      await env.BUCKET.list({ limit: 1 });
      r2Healthy = true;
    } catch (e) {
      console.warn('R2 health check warning:', e.message);
    }
  }

  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cloudflare: {
      d1: { bound: !!(env && env.DB), healthy: d1Healthy, tablesCount: d1TablesCount },
      r2: { bound: !!(env && env.BUCKET), healthy: r2Healthy },
      kv: { bound: !!(env && env.KV_SYNC) }
    }
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
