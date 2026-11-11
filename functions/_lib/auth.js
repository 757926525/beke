/**
 * 服务端统一管理员认证工具（Cloudflare Pages Functions 共享模块）
 *
 * 目的：管理员账号/密码以 Cloudflare 环境变量为唯一权威来源，
 * 所有设备、所有浏览器都由服务端校验，不再依赖各设备本地构建/缓存的凭据，
 * 从根本上避免“同一项目同一管理员密码，在不同设备进入不同界面”。
 */

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 天

export function getAdminConfig(env) {
  const username = (env?.ADMIN_USERNAME || env?.VITE_ADMIN_USERNAME || env?.USERNAME || env?.VITE_USERNAME || '').trim();
  // 优先支持 PASSWORD / VITE_PASSWORD，兼容 ADMIN_PASSWORD / VITE_ADMIN_PASSWORD，默认密码为 123456
  const password = (
    env?.PASSWORD ||
    env?.VITE_PASSWORD ||
    env?.ADMIN_PASSWORD ||
    env?.VITE_ADMIN_PASSWORD ||
    '123456'
  ).trim();
  return { username: username || 'fox', password, configured: true };
}

const encoder = new TextEncoder();

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(message)));
}

// 常量时间字符串比较，防止时序攻击
export function safeEqual(a, b) {
  const x = String(a ?? '');
  const y = String(b ?? '');
  let diff = x.length ^ y.length;
  const len = Math.max(x.length, y.length);
  for (let i = 0; i < len; i++) {
    diff |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  }
  return diff === 0;
}

/** 签发管理员会话令牌：exp.signature；密码一旦修改，旧令牌自动全部失效 */
export async function issueAdminToken(env) {
  const { username, password } = getAdminConfig(env);
  const exp = Date.now() + SESSION_TTL_MS;
  const sig = await hmac(`wf-session:${password}`, `${username}|${exp}`);
  return { token: `${exp}.${sig}`, expiresAt: exp };
}

export async function verifyAdminToken(env, token) {
  const { username, password, configured } = getAdminConfig(env);
  if (!configured || !token || typeof token !== 'string') return false;
  const [expStr, sig] = token.split('.');
  const exp = parseInt(expStr, 10);
  if (!exp || !sig || exp < Date.now()) return false;
  const expected = await hmac(`wf-session:${password}`, `${username}|${exp}`);
  return safeEqual(sig, expected);
}

export function readAdminToken(request) {
  return (request.headers.get('X-Admin-Token') || '').trim();
}
