/**
 * Cloudflare Pages Function: /api/upload
 * 支持文件流式上传至 Cloudflare R2 对象存储 (BUCKET)
 * 支持 GET 获取文件下载或流式预览，带统一 CORS 跨域支持
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token, Range',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Content-Type, Content-Disposition'
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * GET /api/upload?key=<storageKey>&download=1
 * 直接从 R2 检索并流式输出文件，支持媒体预览与文件强制下载
 */
export async function onRequestGet({ request, env }) {
  const bucket = env?.BUCKET || env?.R2_BUCKET;
  if (!bucket) {
    return json({ success: false, error: 'Cloudflare R2 (BUCKET) 未绑定' }, 503);
  }

  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  const isDownload = url.searchParams.get('download') === '1';

  if (!key) {
    return json({ success: false, error: '缺少 key 参数' }, 400);
  }

  try {
    const object = await bucket.get(key);
    if (!object) {
      return json({ success: false, error: '文件未找到或已被清理' }, 404);
    }

    const headers = new Headers(CORS_HEADERS);
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    const filename = object.customMetadata?.originalName || key.split('/').pop() || 'download';
    if (isDownload) {
      headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    } else {
      headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    }

    return new Response(object.body, {
      status: 200,
      headers
    });
  } catch (err) {
    return json({ success: false, error: `读取文件失败: ${err.message}` }, 500);
  }
}

/**
 * POST /api/upload
 * 接收 FormData (file, filename, customDomain) 或 raw body 流并保存至 R2
 */
export async function onRequestPost({ request, env }) {
  const bucket = env?.BUCKET || env?.R2_BUCKET;
  if (!bucket) {
    return json({
      success: false,
      error: 'R2 存储桶未绑定。请在 Cloudflare Pages 后台 Settings -> Functions -> R2 bucket bindings 绑定变量名 "BUCKET"'
    }, 503);
  }

  const contentType = request.headers.get('content-type') || '';

  try {
    let fileBuffer;
    let originalName = 'upload-' + Date.now();
    let mimeType = 'application/octet-stream';
    let customDomain = env?.VITE_CF_R2_CUSTOM_DOMAIN || env?.CF_R2_CUSTOM_DOMAIN || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file) {
        return json({ success: false, error: '未检测到上传文件字段 (file)' }, 400);
      }
      fileBuffer = await file.arrayBuffer();
      originalName = file.name || originalName;
      mimeType = file.type || mimeType;
      const domainInput = formData.get('customDomain');
      if (domainInput) customDomain = String(domainInput).trim();
    } else {
      fileBuffer = await request.arrayBuffer();
      const headerName = request.headers.get('X-File-Name');
      if (headerName) originalName = decodeURIComponent(headerName);
      mimeType = contentType.split(';')[0] || mimeType;
    }

    if (!fileBuffer || fileBuffer.byteLength === 0) {
      return json({ success: false, error: '上传文件内容为空' }, 400);
    }

    // 生成安全唯一存储路径: uploads/YYYY/MM/timestamp-hash-filename
    const now = new Date();
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const key = `uploads/${yearMonth}/${Date.now()}-${randomSuffix}-${cleanName}`;

    // 写入 R2
    await bucket.put(key, fileBuffer, {
      httpMetadata: {
        contentType: mimeType
      },
      customMetadata: {
        originalName: encodeURIComponent(originalName),
        uploadedAt: String(Date.now()),
        size: String(fileBuffer.byteLength)
      }
    });

    // 计算公开访问直链
    let publicUrl = '';
    if (customDomain) {
      publicUrl = `${customDomain.replace(/\/+$/, '')}/${key}`;
    } else {
      // 默认使用 Pages 自带的反代读取路由 /api/upload?key=...
      const requestUrl = new URL(request.url);
      publicUrl = `${requestUrl.origin}/api/upload?key=${encodeURIComponent(key)}`;
    }

    const downloadUrl = `${new URL(request.url).origin}/api/upload?key=${encodeURIComponent(key)}&download=1`;

    return json({
      success: true,
      key,
      url: publicUrl,
      downloadUrl,
      name: originalName,
      size: fileBuffer.byteLength,
      mimeType,
      uploadedAt: Date.now()
    }, 201);
  } catch (err) {
    return json({ success: false, error: `写入 R2 对象存储失败: ${err.message}` }, 500);
  }
}
