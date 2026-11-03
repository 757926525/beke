/**
 * Cloudflare Pages Function: /api/auth
 * 服务端站长登录验证与会话令牌核对接口
 */

import { getAdminCredentials, createAdminToken, verifyAdminToken } from '../_lib/auth.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8'
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

// GET: 核对当前请求携带的 Bearer 令牌有效性
export async function onRequestGet(context) {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return new Response(JSON.stringify({ valid: false, message: 'No token provided' }), {
      status: 200,
      headers: CORS_HEADERS
    });
  }

  const session = await verifyAdminToken(token, env);
  if (session) {
    return new Response(JSON.stringify({
      valid: true,
      user: {
        id: 'u-admin',
        username: `${session.username} (站长)`,
        email: 'admin@whitefox.blog',
        role: 'admin'
      }
    }), {
      status: 200,
      headers: CORS_HEADERS
    });
  }

  return new Response(JSON.stringify({ valid: false, message: 'Invalid or expired token' }), {
    status: 200,
    headers: CORS_HEADERS
  });
}

// POST: 站长登录认证，核对环境变量并签发 30 天安全令牌
export async function onRequestPost(context) {
  const { request, env } = context;

  let body = {};
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ success: false, message: 'Malformed JSON' }), {
      status: 400,
      headers: CORS_HEADERS
    });
  }

  const inputUsername = (body.username || '').trim().toLowerCase();
  const inputPassword = (body.password || '').trim();

  const { username: configuredUsername, password: configuredPassword } = getAdminCredentials(env);
  const adminNameClean = configuredUsername.toLowerCase();

  const isUserMatch =
    inputUsername === adminNameClean ||
    inputUsername === 'admin' ||
    inputUsername === 'fox' ||
    inputUsername === 'admin@whitefox.blog';

  const isPassMatch = inputPassword === configuredPassword;

  if (isUserMatch && isPassMatch) {
    const token = await createAdminToken(configuredUsername, env);
    return new Response(JSON.stringify({
      success: true,
      token,
      user: {
        id: 'u-admin',
        username: `${configuredUsername} (站长)`,
        email: 'admin@whitefox.blog',
        role: 'admin'
      }
    }), {
      status: 200,
      headers: CORS_HEADERS
    });
  }

  return new Response(JSON.stringify({
    success: false,
    message: '账号或管理员密码不正确'
  }), {
    status: 401,
    headers: CORS_HEADERS
  });
}
