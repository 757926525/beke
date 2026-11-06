/**
 * Cloudflare Pages Advanced Mode _worker.js
 *
 * 作用：无论用户采用 Cloudflare Pages Git 自动化集成，还是在 Dashboard 直接拖拽/上传 Zip 包 (Direct Upload)，
 * 本 _worker.js 均作为入口接管全部 /api/* 请求，确保 /api/auth、/api/upload、/api/sync、/api/health
 * 始终由真实边缘逻辑与 D1/R2 处理，彻底根除静态服务器拦截导致的 "POST 405 Method Not Allowed" 问题。
 * 对于非 /api/* 请求，自动交由 env.ASSETS.fetch(request) 极速下发前端静态资产与单页应用。
 */

import { onRequestPost as authPost, onRequestOptions as authOptions } from '../functions/api/auth.js';
import { onRequestGet as healthGet, onRequestOptions as healthOptions } from '../functions/api/health.js';
import { onRequestGet as syncGet, onRequestPost as syncPost, onRequestOptions as syncOptions } from '../functions/api/sync.js';
import { onRequestGet as uploadGet, onRequestPost as uploadPost, onRequestOptions as uploadOptions } from '../functions/api/upload.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // 1. 处理 API 路由
    if (pathname.startsWith('/api/')) {
      const context = { request, env, params: {}, waitUntil: ctx?.waitUntil ? ctx.waitUntil.bind(ctx) : () => {} };

      // /api/auth
      if (pathname === '/api/auth' || pathname === '/api/auth/') {
        if (method === 'OPTIONS') return authOptions(context);
        if (method === 'POST') return authPost(context);
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // /api/health
      if (pathname === '/api/health' || pathname === '/api/health/') {
        if (method === 'OPTIONS') return healthOptions(context);
        if (method === 'GET') return healthGet(context);
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // /api/sync
      if (pathname === '/api/sync' || pathname === '/api/sync/') {
        if (method === 'OPTIONS') return syncOptions(context);
        if (method === 'GET') return syncGet(context);
        if (method === 'POST') return syncPost(context);
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // /api/upload
      if (pathname === '/api/upload' || pathname === '/api/upload/') {
        if (method === 'OPTIONS') return uploadOptions(context);
        if (method === 'GET') return uploadGet(context);
        if (method === 'POST') return uploadPost(context);
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // 未知 API 路径
      if (method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token'
          }
        });
      }

      return new Response(JSON.stringify({ error: `Not Found: ${pathname}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 2. 非 /api/* 请求，回退到 Cloudflare Pages 静态资产
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    return new Response('Asset Fetcher Not Found', { status: 404 });
  }
};
