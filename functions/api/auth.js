/**
 * Cloudflare Pages Function: /api/auth
 * 统一管理员认证（服务端校验）
 *
 * POST /api/auth   { username, password } -> { success, token, username, expiresAt }
 * GET  /api/auth   (Header: X-Admin-Token) -> { success, configured, valid, username }
 *
 * 管理员账号密码来源：环境变量 ADMIN_USERNAME / ADMIN_PASSWORD
 * （兼容 VITE_ADMIN_USERNAME / VITE_ADMIN_PASSWORD）。
 * 未配置密码时返回 configured:false，前端回退到本地构建期凭据。
 */
import { getAdminConfig, issueAdminToken, verifyAdminToken, readAdminToken, safeEqual } from '../_lib/auth.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet({ request, env }) {
  const cfg = getAdminConfig(env);
  if (!cfg.configured) {
    return json({ success: true, configured: false, valid: false });
  }
  const valid = await verifyAdminToken(env, readAdminToken(request));
  return json({ success: true, configured: true, valid, username: cfg.username || 'fox' });
}

export async function onRequestPost({ request, env }) {
  const cfg = getAdminConfig(env);
  if (!cfg.configured) {
    return json({ success: false, configured: false, error: 'Server admin credentials not configured' }, 200);
  }

  let body = {};
  try {
    body = await request.json();
  } catch (e) {
    return json({ success: false, error: 'Malformed JSON' }, 400);
  }

  const inputUser = String(body.username || '').trim().toLowerCase();
  const inputPass = String(body.password || '').trim();
  const adminName = (cfg.username || 'fox').toLowerCase();

  const userOk = inputUser === adminName || inputUser === 'admin@whitefox.blog';
  const passOk = safeEqual(inputPass, cfg.password);

  if (!userOk || !passOk) {
    // 统一模糊错误，不暴露是账号还是密码错误；`adminAttempt` 让前端区分“管理员入口失败”与“普通会员登录”
    return json({ success: false, configured: true, adminAttempt: userOk, error: 'Invalid credentials' }, userOk ? 401 : 200);
  }

  const { token, expiresAt } = await issueAdminToken(env);
  return json({ success: true, configured: true, token, expiresAt, username: cfg.username || 'fox' });
}
