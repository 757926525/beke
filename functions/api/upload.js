/**
 * Cloudflare Pages Function: /api/upload
 * 负责全站图片、音视频、文档等文件的上传与流式下载代理
 *
 * 核心能力：
 * 1. 当环境绑定了 R2 (env.BUCKET) 时，将文件直接存入 R2 存储桶并返回永久直链 URL (/api/upload?key=...)
 * 2. GET 请求支持根据 key 读取 R2 文件，支持 ?download=1 附加 Content-Disposition: attachment 强制下载
 * 3. 完整的 CORS 响应头，确保跨域与所有浏览器均可直接访问和下载
 * 4. 具备文件大小、文件名安全清理与 MIME 类型判断机制
 */

import { getAdminConfig, verifyAdminToken, readAdminToken } from '../_lib/auth.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token, X-File-Name, X-File-Type',
  'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length, Content-Type'
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

function sanitizeFileName(filename) {
  if (!filename) return `file_${Date.now()}`;
  return filename.replace(/[^a-zA-Z0-9._\-\u4e00-\u9fa5]/g, '_');
}

/**
 * 校验上传权限：
 * 若配置了管理员密码，建议仅允许已登录的站长上传大文件；未配置时开放上传。
 */
async function verifyUploadAuth(request, env) {
  const admin = getAdminConfig(env);
  if (admin.configured) {
    const token = readAdminToken(request);
    return verifyAdminToken(env, token);
  }
  return true;
}

/**
 * POST /api/upload
 * 支持 FormData (field: 'file') 或原生二进制流上传 (搭配 Header: X-File-Name)
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  const isAuth = await verifyUploadAuth(request, env);
  if (!isAuth) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unauthorized: 仅系统管理员可上传文件到云端存储，请先登录站长账号'
      }),
      { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  const bucket = env?.BUCKET;

  let fileData = null;
  let fileName = '';
  let contentType = 'application/octet-stream';
  let fileSize = 0;

  const reqContentType = request.headers.get('content-type') || '';

  try {
    if (reqContentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing "file" in formData' }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' } }
        );
      }
      fileName = file.name || 'unnamed';
      contentType = file.type || 'application/octet-stream';
      fileData = await file.arrayBuffer();
      fileSize = fileData.byteLength;
    } else {
      fileName = decodeURIComponent(request.headers.get('X-File-Name') || 'unnamed_file');
      contentType = request.headers.get('X-File-Type') || reqContentType || 'application/octet-stream';
      fileData = await request.arrayBuffer();
      fileSize = fileData.byteLength;
    }

    if (!fileData || fileSize === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Empty file payload' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    const safeName = sanitizeFileName(fileName);
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const storageKey = `uploads/${datePrefix}/${Date.now()}_${randomSuffix}_${safeName}`;

    // 如果绑定了 R2 对象存储 (env.BUCKET)
    if (bucket && typeof bucket.put === 'function') {
      await bucket.put(storageKey, fileData, {
        httpMetadata: {
          contentType: contentType,
          contentDisposition: `inline; filename="${encodeURIComponent(safeName)}"`
        },
        customMetadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString()
        }
      });

      const urlObj = new URL(request.url);
      const publicUrl = `${urlObj.origin}/api/upload?key=${encodeURIComponent(storageKey)}`;

      return new Response(
        JSON.stringify({
          success: true,
          storage: 'r2',
          key: storageKey,
          fileName,
          size: fileSize,
          contentType,
          url: publicUrl,
          downloadUrl: `${publicUrl}&download=1`
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // 未绑定原生 R2 (本地开发或纯静态部署环境降级处理)
    // 对于小于 1MB 的图片/小文件转为 Data URL，方便本地即时保存与跨端轻量引用
    if (fileSize < 1024 * 1024) {
      const bytes = new Uint8Array(fileData);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      const dataUrl = `data:${contentType};base64,${base64}`;

      return new Response(
        JSON.stringify({
          success: true,
          storage: 'fallback_dataurl',
          warning: 'Cloudflare R2 (BUCKET) 未绑定，文件已安全编码为 DataURL。建议在 Cloudflare Pages 设置中绑定 R2 BUCKET 以获得最佳对象存储体验。',
          fileName,
          size: fileSize,
          contentType,
          url: dataUrl,
          downloadUrl: dataUrl
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        warning: '未绑定 Cloudflare R2 (BUCKET)，且大文件超过 1MB 无法直接存入 D1。请前往 Cloudflare Pages 后台 Settings -> Functions -> R2 Bucket Bindings 绑定名称为 BUCKET 的存储桶！',
        error: 'R2 bucket not bound for large file upload'
      }),
      { status: 503, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Upload failed: ' + err.message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
}

/**
 * GET /api/upload?key=...&download=1
 * 流式读取 R2 存储桶中的文件
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  const forceDownload = url.searchParams.get('download') === '1';

  if (!key) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing "key" parameter' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  const bucket = env?.BUCKET;
  if (!bucket || typeof bucket.get !== 'function') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'R2 bucket (BUCKET) is not bound in Cloudflare Pages Functions.'
      }),
      { status: 503, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  try {
    const object = await bucket.get(key);
    if (!object) {
      return new Response(
        JSON.stringify({ success: false, error: 'File not found in R2' }),
        { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    const headers = new Headers(CORS_HEADERS);
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    const originalName = object.customMetadata?.originalName || key.split('/').pop() || 'download';
    const dispositionType = forceDownload ? 'attachment' : 'inline';
    headers.set(
      'Content-Disposition',
      `${dispositionType}; filename="${encodeURIComponent(originalName)}"; filename*=UTF-8''${encodeURIComponent(originalName)}`
    );

    return new Response(object.body, {
      status: 200,
      headers
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to retrieve file: ' + err.message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
}
