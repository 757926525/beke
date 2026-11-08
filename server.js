// ==============================================================================
// 自建服务器 / VPS / Node.js 生产环境轻量后端服务 (server.js)
// 支持纯本地持久化，无需任何云平台即可完整运行全站 API
// - /api/upload: 处理多媒体与文件上传，写入本地存储目录 data/uploads
// - /api/sync: 站点配置与数据全量持久化，写入 data/site_sync.json
// - /api/auth: 管理员鉴权与会话管理
// - /api/health: 健康检查与探针
// 静态托管: 托管 dist 目录前端静态资产并支持 SPA 回退
// ==============================================================================

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const SYNC_FILE = path.join(DATA_DIR, 'site_sync.json');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'fox';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'whitefox2025';

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.pdf': 'application/pdf',
  '.epub': 'application/epub+zip',
  '.zip': 'application/zip',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', err => reject(err));
  });
}

const server = http.createServer(async (req, res) => {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. 健康检查
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      mode: 'node-standalone',
      hasDb: true,
      hasBucket: true,
      hasKv: true,
      adminUsername: ADMIN_USERNAME
    }));
    return;
  }

  // 2. 鉴权接口
  if (pathname === '/api/auth') {
    if (req.method === 'POST') {
      const raw = await parseBody(req);
      try {
        const body = JSON.parse(raw.toString('utf-8'));
        if (body.username === ADMIN_USERNAME && body.password === ADMIN_PASSWORD) {
          const token = `token-${Date.now()}-${Math.random().toString(36).slice(2)}`;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, token, role: 'admin' }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: '用户名或密码错误' }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid payload' }));
      }
      return;
    }
  }

  // 3. 文件上传与下载
  if (pathname === '/api/upload') {
    if (req.method === 'POST') {
      const raw = await parseBody(req);
      const filenameHeader = req.headers['x-filename'] || `file-${Date.now()}`;
      const ext = path.extname(filenameHeader) || '.bin';
      const fileKey = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      const filePath = path.join(UPLOADS_DIR, fileKey);

      fs.writeFileSync(filePath, raw);

      const downloadUrl = `/api/upload?key=${encodeURIComponent(fileKey)}`;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        key: fileKey,
        url: downloadUrl,
        downloadUrl,
        size: raw.length
      }));
      return;
    }

    if (req.method === 'GET') {
      const key = parsedUrl.searchParams.get('key');
      if (!key) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing key' }));
        return;
      }
      const filePath = path.join(UPLOADS_DIR, path.basename(key));
      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'File not found' }));
        return;
      }

      const stat = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      const headers = {
        'Content-Type': contentType,
        'Content-Length': stat.size,
        'Cache-Control': 'public, max-age=31536000'
      };

      if (parsedUrl.searchParams.get('download') === '1') {
        headers['Content-Disposition'] = `attachment; filename="${path.basename(filePath)}"`;
      }

      res.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // 4. 全局数据同步
  if (pathname === '/api/sync') {
    if (req.method === 'GET') {
      if (fs.existsSync(SYNC_FILE)) {
        try {
          const content = fs.readFileSync(SYNC_FILE, 'utf-8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(content);
          return;
        } catch (e) {
          // ignore
        }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, payload: null, version: 0, updated_at: 0 }));
      return;
    }

    if (req.method === 'POST') {
      const raw = await parseBody(req);
      try {
        const body = JSON.parse(raw.toString('utf-8'));
        const toSave = {
          success: true,
          payload: body.payload || body,
          version: (body.version || 0) + 1,
          updated_at: Date.now()
        };
        fs.writeFileSync(SYNC_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, version: toSave.version, updated_at: toSave.updated_at }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: e.message }));
      }
      return;
    }
  }

  // 5. 静态资源托管 (dist 目录)
  const distDir = path.join(__dirname, 'dist');
  let localFile = path.join(distDir, pathname);

  if (fs.existsSync(localFile) && fs.statSync(localFile).isFile()) {
    const ext = path.extname(localFile).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(localFile).pipe(res);
    return;
  }

  // SPA fallback to index.html
  const indexHtml = path.join(distDir, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(indexHtml).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found - Build frontend with npm run build first');
  }
});

server.listen(PORT, () => {
  console.log(`WhiteFox Blog Server running at http://localhost:${PORT}`);
});
