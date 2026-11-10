/**
 * 白狐博客 (WhiteFox Blog) 原生 Node.js 全功能后端服务器
 * 支持 VPS、容器、Docker 自建部署，提供静态资源托管与 /api 接口服务
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DIST_DIR = path.join(__dirname, 'dist');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

// 确保数据与上传目录存在
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const SYNC_FILE = path.join(DATA_DIR, 'sync_data.json');

function readSyncData() {
  try {
    if (fs.existsSync(SYNC_FILE)) {
      return JSON.parse(fs.readFileSync(SYNC_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to read sync file:', e);
  }
  return {};
}

function writeSyncData(data) {
  fs.writeFileSync(SYNC_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
  '.epub': 'application/epub+zip',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // 跨域设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Sync-Key, X-Sync-Version, X-Admin-Token, Range');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // 1. 健康检测 /api/health
  if (pathname === '/api/health') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({
      success: true,
      platform: 'Standalone Node.js Server',
      timestamp: Date.now(),
      d1: { bound: true, healthy: true, message: 'Node.js 本地文件数据库已就绪' },
      r2: { bound: true, healthy: true, message: 'Node.js 本地多媒体持久化存储已就绪' }
    }));
  }

  // 2. 数据同步 /api/sync
  if (pathname === '/api/sync') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method === 'GET') {
      const syncKey = url.searchParams.get('key') || 'whitefox-site-main';
      const store = readSyncData();
      const record = store[syncKey];

      if (!record) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ success: false, notFound: true, message: 'No sync data found' }));
      }

      return res.end(JSON.stringify({
        success: true,
        syncKey,
        version: record.version || 1,
        updatedAt: record.updatedAt || Date.now(),
        payload: record.payload
      }));
    }

    if (req.method === 'POST') {
      let bodyText = '';
      req.on('data', chunk => { bodyText += chunk; });
      req.on('end', () => {
        try {
          const body = JSON.parse(bodyText);
          const syncKey = body.key || 'whitefox-site-main';
          const store = readSyncData();

          store[syncKey] = {
            version: body.version || 1,
            updatedAt: body.updatedAt || Date.now(),
            payload: body.payload
          };

          writeSyncData(store);

          res.end(JSON.stringify({
            success: true,
            syncKey,
            version: body.version || 1,
            updatedAt: body.updatedAt || Date.now(),
            message: 'Sync payload persisted successfully'
          }));
        } catch (e) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload: ' + e.message }));
        }
      });
      return;
    }
  }

  // 3. 多媒体文件流式读取 /api/files/:key
  if (pathname.startsWith('/api/files/')) {
    const rawFilename = decodeURIComponent(pathname.replace('/api/files/', ''));
    const filePath = path.join(UPLOAD_DIR, path.basename(rawFilename));

    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      return res.end('File not found');
    }

    const stat = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // HTTP Range 分片支持
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = (end - start) + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType
      });
      return fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes'
      });
      return fs.createReadStream(filePath).pipe(res);
    }
  }

  // 4. 上传通道 /api/upload
  if (pathname === '/api/upload' && req.method === 'POST') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const filename = req.headers['x-filename'] ? decodeURIComponent(req.headers['x-filename']) : `file_${Date.now()}`;
      const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      const savePath = path.join(UPLOAD_DIR, safeName);

      fs.writeFileSync(savePath, buffer);

      const fileUrl = `/api/files/${encodeURIComponent(safeName)}`;
      res.end(JSON.stringify({
        success: true,
        storage: 'local_server',
        key: safeName,
        url: fileUrl,
        filename,
        size: buffer.length,
        message: '已成功存入服务器存储'
      }));
    });
    return;
  }

  // 5. 静态文件前端服务 SPA
  let safePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);

  if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
    const ext = path.extname(safePath).toLowerCase();
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    return fs.createReadStream(safePath).pipe(res);
  }

  // SPA fallback to index.html
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return fs.createReadStream(indexPath).pipe(res);
  }

  res.statusCode = 404;
  res.end('Not found. Please build frontend first via: npm run build');
});

server.listen(PORT, () => {
  console.log(`🚀 [WhiteFox Server] 白狐博客独立全栈服务已在端口 ${PORT} 启动！`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
});
