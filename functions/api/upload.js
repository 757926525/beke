/**
 * Cloudflare Pages Function: /api/upload
 *
 * 存储与上传核心架构处理：
 * 1. 优先使用 Cloudflare R2 对象存储 (env.BUCKET / env.R2_BUCKET)
 * 2. 若未绑定存储桶 (R2):
 *    - 文件 <= 1.5MB (1,572,864 字节): 自动降级存入 D1 数据库 (site_files 附件表)
 *    - 文件 > 1.5MB: 直接拒绝并提示用户：“文件超过1.5MB且未绑定存储桶，上传无效，请在控制台绑定R2存储桶”
 * 3. 支持 GET /api/upload?key=... 流式读取与下载 (支持 R2 和 D1 降级文件)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Filename, X-File-Type',
  'Access-Control-Max-Age': '86400'
};

const MAX_D1_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5MB in bytes

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

// 确保 D1 files_metadata 和 site_files 表存在
async function ensureD1Tables(db) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS files_metadata (
        key TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        content_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        url TEXT NOT NULL,
        storage_type TEXT DEFAULT 'r2',
        module TEXT DEFAULT 'general',
        etag TEXT,
        created_at INTEGER NOT NULL
      )
    `).run();
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS site_files (
        key TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        content_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        data_base64 TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `).run();
  } catch (e) {
    console.error('ensureD1Tables failed:', e.message);
  }
}

/**
 * GET /api/upload?key=...&download=1
 * 获取或下载 R2 / D1 文件
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  const action = url.searchParams.get('action'); // 'list' | null
  const isDownload = url.searchParams.get('download') === '1';

  // 1. Workers 处理文件列表查询：有 D1 优先读 D1，无 D1 降级读 KV
  if (action === 'list') {
    if (env?.DB) {
      try {
        await ensureD1Tables(env.DB);
        const { results } = await env.DB.prepare('SELECT * FROM files_metadata ORDER BY created_at DESC LIMIT 100').all();
        return new Response(JSON.stringify({ success: true, source: 'd1', files: results || [] }), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        console.warn('D1 files list failed, falling back to KV:', err.message);
      }
    }

    const kv = env?.KV || env?.WHITEFOX_KV;
    if (kv) {
      try {
        const cached = await kv.get('files_metadata_cache', 'json');
        return new Response(JSON.stringify({ success: true, source: 'kv', files: cached || [] }), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      } catch (kvErr) {
        console.warn('KV files list failed:', kvErr.message);
      }
    }

    return new Response(JSON.stringify({ success: true, source: 'empty', files: [] }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }

  if (!key) {
    return new Response(JSON.stringify({ error: 'Missing file key' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }

  const bucket = env?.BUCKET || env?.R2_BUCKET;

  // 1. 优先从 R2 检索（支持视频流式 Range 请求与大文件流式下载）
  if (bucket) {
    try {
      const rangeHeader = request.headers.get('range');
      let range;
      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        range = {
          offset: parseInt(parts[0], 10),
          length: parts[1] ? parseInt(parts[1], 10) - parseInt(parts[0], 10) + 1 : undefined
        };
      }

      const object = await bucket.get(key, { range });
      if (object) {
        const headers = new Headers(CORS_HEADERS);
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Accept-Ranges', 'bytes');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        // 正确的 Content-Type 补充，杜绝图片与音视频渲染失败
        const ext = key.split('.').pop()?.toLowerCase();
        const mimeMap = {
          png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml',
          mp4: 'video/mp4', webm: 'video/webm', mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
          pdf: 'application/pdf', epub: 'application/epub+zip', txt: 'text/plain; charset=utf-8'
        };
        if (ext && mimeMap[ext] && !headers.get('Content-Type')) {
          headers.set('Content-Type', mimeMap[ext]);
        }

        if (isDownload) {
          const rawFilename = key.split('/').pop() || 'download';
          headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(rawFilename)}"`);
        }

        const status = rangeHeader ? 206 : 200;
        return new Response(object.body, { status, headers });
      }
    } catch (err) {
      console.warn('R2 read failed, checking D1:', err.message);
    }
  }

  // 2. 若 R2 未找到或未绑定，从 D1 site_files 降级表中检索
  if (env?.DB) {
    try {
      await ensureD1Tables(env.DB);
      const row = await env.DB.prepare('SELECT * FROM site_files WHERE key = ?').bind(key).first();
      if (row && row.data_base64) {
        // 解码 Base64
        const binaryStr = atob(row.data_base64);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        const headers = new Headers(CORS_HEADERS);
        headers.set('Content-Type', row.content_type || 'application/octet-stream');
        headers.set('Content-Length', String(len));
        headers.set('Cache-Control', 'public, max-age=86400');
        if (isDownload) {
          const filename = encodeURIComponent(row.filename || key.split('/').pop() || 'download');
          headers.set('Content-Disposition', `attachment; filename="${filename}"`);
        }
        return new Response(bytes.buffer, { headers });
      }
    } catch (err) {
      console.error('D1 file fetch failed:', err.message);
    }
  }

  return new Response(JSON.stringify({ error: 'File not found' }), {
    status: 404,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

/**
 * POST /api/upload
 * 接收文件上传
 */
export async function onRequestPost(context) {
  const { request, env } = context;
  const contentType = request.headers.get('content-type') || '';
  const bucket = env?.BUCKET || env?.R2_BUCKET;
  const db = env?.DB;

  try {
    let fileBuffer;
    let fileName = request.headers.get('x-filename') || '';
    let fileMime = request.headers.get('x-file-type') || 'application/octet-stream';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file || typeof file === 'string') {
        return new Response(JSON.stringify({ error: '请选择有效文件' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      fileBuffer = await file.arrayBuffer();
      fileName = file.name || fileName || 'upload_' + Date.now();
      fileMime = file.type || fileMime;
    } else {
      fileBuffer = await request.arrayBuffer();
      fileName = fileName || 'upload_' + Date.now();
    }

    const fileSize = fileBuffer.byteLength;

    if (fileSize === 0) {
      return new Response(JSON.stringify({ error: '文件内容为空' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    // 格式化安全文件名与存储 Key
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const key = `uploads/${timestamp}_${randomStr}_${safeName}`;

    // 1. 优先使用 Cloudflare R2 对象存储桶
    if (bucket) {
      await bucket.put(key, fileBuffer, {
        httpMetadata: {
          contentType: fileMime
        },
        customMetadata: {
          originalName: fileName,
          uploadedAt: String(timestamp)
        }
      });

      // 如果配置了 R2 自定义域名，使用自定义域名，否则使用 /api/upload?key= 代理路径
      const r2Domain = env.R2_CUSTOM_DOMAIN || env.VITE_CF_R2_CUSTOM_DOMAIN || '';
      const fileUrl = r2Domain
        ? `${r2Domain.replace(/\/$/, '')}/${key}`
        : `/api/upload?key=${encodeURIComponent(key)}`;

      // 架构规范：D1 负责存文件元信息和正确 URL
      if (db) {
        try {
          await ensureD1Tables(db);
          await db.prepare(`
            INSERT OR REPLACE INTO files_metadata (key, filename, content_type, size, url, storage_type, module, created_at)
            VALUES (?, ?, ?, ?, ?, 'r2', 'general', ?)
          `).bind(key, fileName, fileMime, fileSize, fileUrl, timestamp).run();
        } catch (dbErr) {
          console.warn('Failed to record metadata to D1:', dbErr.message);
        }
      }

      // 架构规范：KV 仅缓存列表索引（不存文件本体）
      const kv = env.KV || env.WHITEFOX_KV;
      if (kv) {
        try {
          let list = [];
          const cached = await kv.get('files_metadata_cache', 'json');
          if (Array.isArray(cached)) list = cached;
          list.unshift({ key, filename: fileName, size: fileSize, url: fileUrl, createdAt: timestamp, contentType: fileMime });
          if (list.length > 500) list = list.slice(0, 500);
          await kv.put('files_metadata_cache', JSON.stringify(list));
        } catch (kvErr) {
          console.warn('Failed to cache metadata to KV:', kvErr.message);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        storage: 'r2',
        key,
        url: fileUrl,
        size: fileSize,
        filename: fileName,
        mime: fileMime,
        message: '成功保存至 Cloudflare R2 对象存储桶，元信息已入库'
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    // 2. 未绑定 R2 对象存储桶时的降级判定
    if (fileSize > MAX_D1_FILE_SIZE) {
      // 超过 1.5MB 拦截提示
      const mbSize = (fileSize / (1024 * 1024)).toFixed(2);
      return new Response(JSON.stringify({
        success: false,
        error: `上传无效：当前文件大小为 ${mbSize}MB，已超过数据库 1.5MB 限制，且系统未绑定 R2 存储桶。请在 Cloudflare Pages 后台绑定 R2 存储桶后再上传大文件。`,
        code: 'STORAGE_BUCKET_REQUIRED',
        size: fileSize,
        limit: MAX_D1_FILE_SIZE
      }), {
        status: 413,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    // 3. 小于等于 1.5MB 存入 D1 数据库降级附件表
    if (db) {
      await ensureD1Tables(db);

      // 转 Base64 存储
      let binary = '';
      const bytes = new Uint8Array(fileBuffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Data = btoa(binary);

      await db.prepare(`
        INSERT OR REPLACE INTO site_files (key, filename, content_type, size, data_base64, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(key, fileName, fileMime, fileSize, base64Data, timestamp).run();

      const fileUrl = `/api/upload?key=${encodeURIComponent(key)}`;

      await db.prepare(`
        INSERT OR REPLACE INTO files_metadata (key, filename, content_type, size, url, storage_type, module, created_at)
        VALUES (?, ?, ?, ?, ?, 'd1_fallback', 'general', ?)
      `).bind(key, fileName, fileMime, fileSize, fileUrl, timestamp).run();

      return new Response(JSON.stringify({
        success: true,
        storage: 'd1',
        key,
        url: fileUrl,
        size: fileSize,
        filename: fileName,
        mime: fileMime,
        message: '未绑定存储桶，文件(<=1.5MB)已自动降级保存至 D1 数据库并记录元数据'
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    // 4. 既无 R2 也无 D1 时，如果是小于 1.5MB 的纯前端/演示环境，返回内联 DataURL
    let binary = '';
    const bytes = new Uint8Array(fileBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const dataUrl = `data:${fileMime};base64,${btoa(binary)}`;

    return new Response(JSON.stringify({
      success: true,
      storage: 'inline',
      key,
      url: dataUrl,
      size: fileSize,
      filename: fileName,
      mime: fileMime,
      message: '本地离线模式：已转为内联 DataURL 保存'
    }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Upload handler error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: `上传服务异常: ${error.message || '未知错误'}`
    }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }
}
