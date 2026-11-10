/**
 * Cloudflare Pages Function: /api/files/:key
 * 负责流式回放和下载存储在 R2 存储桶或 D1 数据库 (site_files) 中的多媒体文件
 * 原生支持 HTTP Range 分片播放音视频
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Range, Content-Type, Authorization',
  'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges'
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

export async function onRequestGet(context) {
  const { request, env, params } = context;

  const rawKey = params.key;
  if (!rawKey) {
    return new Response('File key is required', { status: 400, headers: CORS_HEADERS });
  }

  const objectKey = decodeURIComponent(rawKey);
  const bucket = env?.BUCKET || env?.R2_BUCKET;
  const db = env?.DB;

  // 1. 优先从 R2 检索并流式返回
  if (bucket) {
    try {
      const rangeHeader = request.headers.get('Range');
      let object = null;

      if (rangeHeader) {
        object = await bucket.get(objectKey, {
          range: request.headers
        });
      } else {
        object = await bucket.get(objectKey);
      }

      if (object) {
        const headers = new Headers(CORS_HEADERS);
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Accept-Ranges', 'bytes');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        const status = rangeHeader ? 206 : 200;
        return new Response(object.body, {
          headers,
          status
        });
      }
    } catch (r2Err) {
      console.warn('R2 get error:', r2Err.message);
    }
  }

  // 2. 从 D1 site_files 备用存储检索
  if (db) {
    try {
      const fileRecord = await db.prepare(
        'SELECT name, mime_type, size, data FROM site_files WHERE key = ? LIMIT 1'
      ).bind(objectKey).first();

      if (fileRecord && fileRecord.data) {
        const headers = new Headers(CORS_HEADERS);
        headers.set('Content-Type', fileRecord.mime_type || 'application/octet-stream');
        headers.set('Content-Length', String(fileRecord.size));
        headers.set('Cache-Control', 'public, max-age=86400');
        headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(fileRecord.name)}"`);

        return new Response(fileRecord.data, {
          headers,
          status: 200
        });
      }
    } catch (d1Err) {
      console.warn('D1 get error:', d1Err.message);
    }
  }

  return new Response('File not found', { status: 404, headers: CORS_HEADERS });
}
