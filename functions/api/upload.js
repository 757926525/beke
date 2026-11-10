/**
 * Cloudflare Pages Function: /api/upload
 * 负责全站多媒体（图片、电子书、音视频等）流式上传、存储桶路由及 D1 备用存储持久化
 *
 * 存储路由策略：
 * 1. 优先路由至 Cloudflare R2 对象存储桶 (env.BUCKET 或 env.R2_BUCKET)；
 * 2. 当未绑定存储桶时：
 *    - 文件 <= 1.5MB：持久化暂存至 D1 数据库 (site_files 表)；
 *    - 文件 > 1.5MB：严格拦截并返回 413 (STORAGE_BUCKET_REQUIRED)，提示绑定对象存储桶。
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Filename, X-File-Type, X-Folder',
  'Content-Type': 'application/json; charset=utf-8'
};

const MAX_D1_FALLBACK_BYTES = 1.5 * 1024 * 1024; // 1.5MB

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const bucket = env?.BUCKET || env?.R2_BUCKET;
  const db = env?.DB;

  let formData = null;
  let file = null;

  try {
    formData = await request.formData();
    file = formData.get('file');
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: '无法解析上传表单数据: ' + err.message
    }), {
      status: 400,
      headers: CORS_HEADERS
    });
  }

  if (!file || !(file instanceof File || file instanceof Blob)) {
    return new Response(JSON.stringify({
      success: false,
      error: '未接收到上传的文件内容'
    }), {
      status: 400,
      headers: CORS_HEADERS
    });
  }

  const rawFilename = request.headers.get('x-filename')
    ? decodeURIComponent(request.headers.get('x-filename'))
    : (file.name || 'uploaded_file');
  const folder = (request.headers.get('x-folder') || 'general').replace(/[^a-zA-Z0-9_\-\/]/g, '');
  const mimeType = request.headers.get('x-file-type') || file.type || 'application/octet-stream';
  const fileSize = file.size;

  // 生成对象 Key
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const cleanFilename = rawFilename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const objectKey = `${folder}/${timestamp}_${randomStr}_${cleanFilename}`;

  // 1. 若配置了 R2 存储桶，直接流式写入 R2
  if (bucket) {
    try {
      const fileBuffer = await file.arrayBuffer();
      await bucket.put(objectKey, fileBuffer, {
        httpMetadata: {
          contentType: mimeType
        },
        customMetadata: {
          originalName: rawFilename,
          uploadedAt: String(timestamp)
        }
      });

      // 构造公网直链 URL
      const customDomain = env?.R2_CUSTOM_DOMAIN || env?.VITE_CF_R2_CUSTOM_DOMAIN;
      let fileUrl = '';
      if (customDomain) {
        fileUrl = `https://${customDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '')}/${objectKey}`;
      } else {
        // 使用 Pages Function 本地流式回放 /api/files/:key
        const host = new URL(request.url).origin;
        fileUrl = `${host}/api/files/${encodeURIComponent(objectKey)}`;
      }

      // 若同时绑定了 D1，将元数据登记入 files_metadata
      if (db) {
        try {
          await db.prepare(`
            CREATE TABLE IF NOT EXISTS files_metadata (
              key TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              mime_type TEXT NOT NULL,
              size INTEGER NOT NULL,
              url TEXT NOT NULL,
              storage_type TEXT NOT NULL,
              created_at INTEGER NOT NULL
            )
          `).run();

          await db.prepare(`
            INSERT INTO files_metadata (key, name, mime_type, size, url, storage_type, created_at)
            VALUES (?, ?, ?, ?, ?, 'r2', ?)
            ON CONFLICT(key) DO UPDATE SET
              url = excluded.url,
              size = excluded.size
          `).bind(objectKey, rawFilename, mimeType, fileSize, fileUrl, timestamp).run();
        } catch (dbErr) {
          console.warn('Metadata record failed:', dbErr.message);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        storage: 'r2',
        key: objectKey,
        url: fileUrl,
        filename: rawFilename,
        size: fileSize,
        message: '已成功存入 Cloudflare R2 对象存储桶'
      }), {
        status: 200,
        headers: CORS_HEADERS
      });
    } catch (r2Err) {
      return new Response(JSON.stringify({
        success: false,
        error: '写入 R2 存储桶失败: ' + r2Err.message
      }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }
  }

  // 2. 未配置 R2 时：
  // 若文件超出 1.5MB 规范限制，拒绝上传并指导配置存储桶
  if (fileSize > MAX_D1_FALLBACK_BYTES) {
    return new Response(JSON.stringify({
      success: false,
      code: 'STORAGE_BUCKET_REQUIRED',
      error: `文件超出1.5兆则提示上传无效，请绑定存储桶！当前文件 ${(fileSize / (1024 * 1024)).toFixed(2)} MB。`
    }), {
      status: 413,
      headers: CORS_HEADERS
    });
  }

  // 小于等于 1.5MB 且存在 D1 绑定，持久化存入 D1 site_files
  if (db) {
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS site_files (
          key TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          mime_type TEXT NOT NULL,
          size INTEGER NOT NULL,
          data BLOB,
          created_at INTEGER NOT NULL
        )
      `).run();

      const arrayBuffer = await file.arrayBuffer();
      // 在 D1 中存储二进制
      await db.prepare(`
        INSERT INTO site_files (key, name, mime_type, size, data, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          data = excluded.data,
          size = excluded.size
      `).bind(objectKey, rawFilename, mimeType, fileSize, arrayBuffer, timestamp).run();

      const host = new URL(request.url).origin;
      const fileUrl = `${host}/api/files/${encodeURIComponent(objectKey)}`;

      return new Response(JSON.stringify({
        success: true,
        storage: 'd1_fallback',
        key: objectKey,
        url: fileUrl,
        filename: rawFilename,
        size: fileSize,
        message: '文件已持久化至 D1 数据库备用存储'
      }), {
        status: 200,
        headers: CORS_HEADERS
      });
    } catch (d1Err) {
      return new Response(JSON.stringify({
        success: false,
        error: '写入 D1 备用数据库失败: ' + d1Err.message
      }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }
  }

  // 既无 R2 也无 D1
  return new Response(JSON.stringify({
    success: false,
    code: 'STORAGE_BUCKET_REQUIRED',
    error: 'Cloudflare Pages 尚未绑定 R2 存储桶 (BUCKET) 或 D1 数据库 (DB)，请前往控制台绑定！'
  }), {
    status: 503,
    headers: CORS_HEADERS
  });
}
