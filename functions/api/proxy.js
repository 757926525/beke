/**
 * Cloudflare Pages Function: /api/proxy
 * 边缘反向代理通道，专为中国大陆网络环境下免配置直接代理访问 Google 与外部受限网站而设计
 * 核心功能：
 * 1. 代理抓取目标网站并重写/转发 HTML、资源与 JSON，剥除反嵌入/CSP 限制；
 * 2. 模拟客户端与搜索引擎握手，提供稳定流式传输与 CORS 头部。
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range'
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }

  try {
    const parsedTarget = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsedTarget.protocol)) {
      return new Response('Invalid protocol', { status: 400, headers: CORS_HEADERS });
    }

    const forwardHeaders = new Headers();
    forwardHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    forwardHeaders.set('Accept', request.headers.get('Accept') || '*/*');
    forwardHeaders.set('Accept-Language', 'zh-CN,zh;q=0.9,en;q=0.8');

    const response = await fetch(parsedTarget.toString(), {
      method: 'GET',
      headers: forwardHeaders,
      redirect: 'follow'
    });

    const responseHeaders = new Headers(CORS_HEADERS);
    const contentType = response.headers.get('content-type') || 'text/html; charset=utf-8';
    responseHeaders.set('Content-Type', contentType);

    // 移除阻碍前端 iframe 嵌套的响应头
    responseHeaders.delete('x-frame-options');
    responseHeaders.delete('content-security-policy');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Proxy fetch failed',
      message: err.message
    }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }
}
