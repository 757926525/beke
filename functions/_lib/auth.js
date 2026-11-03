/**
 * Cloudflare Pages Functions: 服务端认证与 HMAC 令牌鉴权
 * 负责校验管理员账号密码并签发防伪防篡改 30 天会话令牌
 * 改密码后旧令牌自动失效
 */

export function getAdminCredentials(env) {
  const username = (env?.ADMIN_USERNAME || env?.VITE_ADMIN_USERNAME || 'fox').trim();
  const password = (env?.ADMIN_PASSWORD || env?.VITE_ADMIN_PASSWORD || 'whitefox2025').trim();
  return { username, password };
}

// 基于密码与密钥派生 HMAC 签名密钥
async function getSigningKey(password, secretSalt = 'whitefox-auth-salt') {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password + ':' + secretSalt),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(secretSalt),
      iterations: 10000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// 签发有效期 30 天的管理员令牌
export async function createAdminToken(username, env) {
  const { password } = getAdminCredentials(env);
  const now = Date.now();
  const exp = now + 30 * 24 * 60 * 60 * 1000; // 30 days
  const payload = JSON.stringify({ u: username, exp, iat: now });
  const payloadB64 = btoa(payload).replace(/=/g, '');

  const key = await getSigningKey(password);
  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  const sigHex = Array.from(new Uint8Array(sigBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  return `${payloadB64}.${sigHex}`;
}

// 验证令牌有效性
export async function verifyAdminToken(token, env) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sigHex] = parts;

  let payload;
  try {
    payload = JSON.parse(atob(payloadB64));
  } catch (e) {
    return null;
  }

  if (!payload || !payload.exp || Date.now() > payload.exp) {
    return null; // Expired
  }

  const { password, username: expectedAdminUser } = getAdminCredentials(env);
  const key = await getSigningKey(password);

  // 解析并比对签名
  const sigBytes = new Uint8Array(sigHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    sigBytes,
    new TextEncoder().encode(payloadB64)
  );

  if (!isValid) return null;

  return {
    username: expectedAdminUser || payload.u || 'fox',
    role: 'admin',
    exp: payload.exp
  };
}
