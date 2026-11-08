-- ==============================================================================
-- 白狐博客 (WhiteFox Blog) Cloudflare D1 核心数据库建表语句
-- 架构职责：
-- D1：存储文章、评论、分类、订单、站内信件、站点配置与附件降级表
-- R2：作为对象存储，用于存放上传的图片、视频、电子书及附件
-- KV：仅用于缓存热点文章、站点配置和访问计数
-- 执行方式：wrangler d1 execute DB --file=deploy/cloudflare-d1-schema.sql
-- ==============================================================================

-- 1. 文章数据表 (Articles)
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT,
  cover TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  is_bookmarked INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER
);

-- 2. 评论数据表 (Comments)
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  parent_id TEXT,
  status TEXT DEFAULT 'approved',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 分类与标签表 (Categories)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 商品订单表 (Shop Orders)
CREATE TABLE IF NOT EXISTS shop_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price REAL NOT NULL DEFAULT 0.0,
  recipient_name TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid' 未支付 | 'paid' 已支付 | 'shipped' 已发货 | 'completed' 已完成
  payment_method TEXT,
  remarks TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER
);

-- 5. 商品在线客服/咨询消息表 (Shop Inquiries)
CREATE TABLE IF NOT EXISTS shop_inquiries (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  item_id TEXT,
  sender_role TEXT NOT NULL, -- 'user' | 'admin'
  sender_name TEXT,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. 书架图书表 (Bookshelf)
CREATE TABLE IF NOT EXISTS bookshelf (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  category TEXT,
  format TEXT,
  size TEXT,
  progress INTEGER DEFAULT 0,
  total_chapters INTEGER DEFAULT 1,
  cover TEXT,
  file_url TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. 光影视界画廊表 (Gallery)
CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  category TEXT,
  location TEXT,
  is_nsfw INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. 站内信件/留言中心表 (Mailbox / Messages)
CREATE TABLE IF NOT EXISTS mailbox_messages (
  id TEXT PRIMARY KEY,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  reply_content TEXT,
  replied_at INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. 站点全局配置与同步表 (Site Sync & Configuration)
CREATE TABLE IF NOT EXISTS site_sync (
  sync_key TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

-- 10. 文件与附件降级存储表 (<= 1.5MB 无 R2 时的降级存储)
CREATE TABLE IF NOT EXISTS site_files (
  key TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  data_base64 TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
