/**
 * Cloudflare Pages Function: /api/health
 * 实时监测 Cloudflare Pages 原生 D1 数据库与 R2 对象存储桶绑定状态
 * 供系统设置中心、状态灯、多云网盘进行自动状态诊断
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8'
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

export async function onRequestGet(context) {
  const { env } = context;

  const kvBound = Boolean(env && (env.KV || env.WHITEFOX_KV));
  const d1Bound = Boolean(env && env.DB);
  const r2Bound = Boolean(env && (env.BUCKET || env.R2_BUCKET));

  let kvHealthy = false;
  let kvMessage = '';

  if (kvBound) {
    try {
      const kv = env.KV || env.WHITEFOX_KV;
      await kv.list({ limit: 1 });
      kvHealthy = true;
      kvMessage = 'Cloudflare KV 键值存储绑定就绪 (KV bound)';
    } catch (e) {
      kvHealthy = false;
      kvMessage = `Cloudflare KV 已绑定但探测报错: ${e.message}`;
    }
  } else {
    kvMessage = '未在 Cloudflare Pages 绑定 KV (变量名需为 "KV")';
  }

  let d1Healthy = false;
  let d1Message = '';

  if (d1Bound) {
    try {
      await env.DB.prepare('SELECT 1 as alive').first();
      d1Healthy = true;
      d1Message = 'Cloudflare D1 原生绑定就绪且通信正常 (DB bound)';
    } catch (e) {
      d1Healthy = false;
      d1Message = `Cloudflare D1 已绑定但查询报错: ${e.message}`;
    }
  } else {
    d1Message = '未在 Cloudflare Pages 绑定 D1 (变量名需为 "DB")';
  }

  let r2Healthy = false;
  let r2Message = '';

  if (r2Bound) {
    try {
      const bucket = env.BUCKET || env.R2_BUCKET;
      await bucket.list({ limit: 1 });
      r2Healthy = true;
      r2Message = 'Cloudflare R2 原生对象存储绑定就绪 (BUCKET bound)';
    } catch (e) {
      r2Healthy = false;
      r2Message = `Cloudflare R2 已绑定但探测报错: ${e.message}`;
    }
  } else {
    r2Message = '未在 Cloudflare Pages 绑定 R2 (变量名需为 "BUCKET")';
  }

  const adminUsername = env?.ADMIN_USERNAME || env?.VITE_ADMIN_USERNAME || '';

  return new Response(JSON.stringify({
    success: true,
    platform: 'Cloudflare Pages',
    timestamp: Date.now(),
    adminUsername: adminUsername || undefined,
    kv: {
      bound: kvBound,
      healthy: kvHealthy,
      message: kvMessage
    },
    d1: {
      bound: d1Bound,
      healthy: d1Healthy,
      message: d1Message
    },
    r2: {
      bound: r2Bound,
      healthy: r2Healthy,
      message: r2Message
    }
  }), {
    status: 200,
    headers: CORS_HEADERS
  });
}
