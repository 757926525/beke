import {
  initialArticles,
  initialBooks as rawInitialBooks,
  initialPhotos as rawInitialPhotos,
  initialMedia as rawInitialMedia,
  initialWebBookmarks,
  initialBookmarkZones,
  defaultCloudConfig,
  defaultSystemSettings
} from '../data/mockData';

// Helper for localStorage with fallback
export const loadFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage key "${key}":`, e);
    return fallback;
  }
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving localStorage key "${key}":`, e);
  }
};

export const STORAGE_KEYS = {
  AUTH: 'wf_auth_user',
  SITE_NAME: 'wf_site_name',
  SITE_LAYOUT: 'wf_site_layout',
  FONT_SIZE: 'wf_font_size',
  DARK_MODE: 'wf_dark_mode',
  HEADER_COLLAPSED: 'wf_header_collapsed',
  LANG: 'wf_lang',
  THEME: 'wf_theme',
  APPEARANCE: 'wf_appearance',
  SYSTEM_SETTINGS: 'wf_system_settings',
  SEARCH_PROXY: 'wf_search_proxy',
  POSTS: 'wf_posts',
  BOOKS: 'wf_books',
  BOOKMARKS: 'wf_bookmarks',
  CLOUD_CONFIG: 'wf_cloud_config',
  CLOUD_FILES: 'wf_cloud_files',
  BACKEND_CONFIG: 'wf_backend_config',
  USERS: 'wf_users',
  PHOTOS: 'wf_photos',
  MEDIA_LIST: 'wf_media_list',
  EMAIL_SETTINGS: 'wf_email_settings',
  MAIL_MESSAGES: 'wf_mail_messages',
  PRODUCTS: 'wf_shop_products',
  ORDERS: 'wf_shop_orders',
  PAYMENT_SETTINGS: 'wf_payment_settings',
  BROWSING_HISTORY: 'wf_browsing_history',
  HERO_INTRO: 'wf_hero_intro',
  SYNC_VERSION: 'wf_sync_version',
  LAST_LOCAL_CHANGE: 'wf_last_local_change',
  CF_ROOM_KEY: 'wf_cf_room_key'
};

/**
 * 同步房间密钥策略（修复“同一项目同一管理员密码，不同设备进入不同界面”）：
 *
 * 旧逻辑：每个浏览器首次打开都随机生成一个 wf-xxxx 房间密钥 ->
 *         每台设备读写 D1 里不同的 site_sync 记录 -> 各设备界面/内容互不相同。
 * 新逻辑：同一个项目的所有设备默认共用同一个固定房间密钥；
 *         只有站长在设置中手动指定过自定义密钥（带 custom 标记）才会使用自定义值。
 *         服务端若配置了 SYNC_ROOM_KEY 环境变量，则以服务端为准（见 functions/api/sync.js）。
 */
export const DEFAULT_SHARED_SYNC_KEY = 'whitefox-site-main';
const ROOM_KEY_CUSTOM_FLAG = 'wf_cf_room_key_custom';
const LEGACY_ROOM_KEY_ALIAS = 'wf_cross_device_sync_key';

/**
 * Generate cryptographically secure random sync key (>= 128 bits)
 * 仅用于站长主动“生成独立房间密钥”的场景，不再自动调用
 */
export const generateSecureSyncKey = () => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16); // 128 bits
    crypto.getRandomValues(array);
    const hex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `wf-${hex}`;
  }
  return `wf-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
};

/**
 * 获取当前使用的同步房间密钥：默认共享密钥；仅当站长显式设置过自定义密钥时才使用自定义值
 */
export const getOrInitSecureSyncKey = () => {
  try {
    const isCustom = localStorage.getItem(ROOM_KEY_CUSTOM_FLAG) === 'true';
    const stored = localStorage.getItem(STORAGE_KEYS.CF_ROOM_KEY);
    if (isCustom && stored) {
      return stored;
    }
    // 迁移：丢弃旧版本自动生成的随机密钥，统一回到项目共享房间
    localStorage.setItem(STORAGE_KEYS.CF_ROOM_KEY, DEFAULT_SHARED_SYNC_KEY);
    localStorage.setItem(LEGACY_ROOM_KEY_ALIAS, DEFAULT_SHARED_SYNC_KEY);
  } catch (e) {
    // ignore storage errors
  }
  return DEFAULT_SHARED_SYNC_KEY;
};

/**
 * 站长手动设置同步房间密钥（留空或等于默认值即恢复为项目共享房间）
 */
export const setSyncRoomKeyPreference = (newKey) => {
  const key = (newKey || '').trim();
  try {
    if (!key || key === DEFAULT_SHARED_SYNC_KEY) {
      localStorage.setItem(ROOM_KEY_CUSTOM_FLAG, 'false');
      localStorage.setItem(STORAGE_KEYS.CF_ROOM_KEY, DEFAULT_SHARED_SYNC_KEY);
      localStorage.setItem(LEGACY_ROOM_KEY_ALIAS, DEFAULT_SHARED_SYNC_KEY);
      return DEFAULT_SHARED_SYNC_KEY;
    }
    localStorage.setItem(ROOM_KEY_CUSTOM_FLAG, 'true');
    localStorage.setItem(STORAGE_KEYS.CF_ROOM_KEY, key);
    localStorage.setItem(LEGACY_ROOM_KEY_ALIAS, key);
  } catch (e) {
    // ignore storage errors
  }
  return key;
};

// 管理员服务端会话令牌（由 /api/auth 签发，写入云端数据时携带）
export const ADMIN_TOKEN_KEY = 'wf_admin_session_token';
export const getAdminToken = () => {
  try { return localStorage.getItem(ADMIN_TOKEN_KEY) || ''; } catch (e) { return ''; }
};
export const setAdminToken = (token) => {
  try {
    if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
    else localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch (e) { /* ignore */ }
};

export const defaultHeroIntro = {
  badge: '灵狐踏雪 · 随心而述 · 云端无界',
  title: '极简敏捷与多云边缘博客',
  desc: '原生适配多云边缘 Pages（Cloudflare / 腾讯云 / 阿里云），一键拉取与构建，集成 D1 边缘数据库与全功能媒体中枢。',
  heroImage: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
  totalCapacityBytes: 10 * 1024 * 1024 * 1024 // 10 GB
};

// Seed initial items with millisecond timestamps Date.now() and deleted: false
const seedTimestamp = 1700000000000; // 固定基线时间戳，确保多端合并时远程或本地的真实用户修改始终优先覆盖种子初始数据

export const initialPosts = (initialArticles || []).map((p) => ({
  ...p,
  updatedAt: typeof p.updatedAt === 'number' ? p.updatedAt : seedTimestamp,
  deleted: Boolean(p.deleted)
}));

export const initialBooks = (rawInitialBooks || []).map((b) => ({
  ...b,
  updatedAt: typeof b.updatedAt === 'number' ? b.updatedAt : seedTimestamp,
  deleted: Boolean(b.deleted)
}));

export const initialPhotos = (rawInitialPhotos || []).map((ph) => ({
  ...ph,
  updatedAt: typeof ph.updatedAt === 'number' ? ph.updatedAt : seedTimestamp,
  deleted: Boolean(ph.deleted)
}));

export const initialMedia = (rawInitialMedia || []).map((m) => ({
  ...m,
  updatedAt: typeof m.updatedAt === 'number' ? m.updatedAt : seedTimestamp,
  deleted: Boolean(m.deleted)
}));

export const defaultEmailSettings = {
  enabled: true,
  provider: 'resend', // 'resend' | 'sendgrid' | 'postmark' | 'mailgun' | 'smtp'
  apiKey: '',
  apiEndpoint: 'https://api.resend.com/emails',
  smtpHost: 'smtp.whitefox.blog',
  smtpPort: 465,
  smtpUser: 'service@whitefox.blog',
  smtpPass: '••••••••••••',
  senderName: '白狐博客官方安全中心',
  senderEmail: 'service@whitefox.blog',
  autoReplyEnabled: true,
  rateLimitEnabled: true,
  maxDailyEmails: 300,
  codeExpireMinutes: 10,
  // Cloudflare Email Routing 配置预留
  cfEmailRouting: {
    enabled: true,
    routingAddress: 'contact@whitefox.blog',
    forwardTo: 'admin@example.com',
    webhookUrl: '/api/mail/webhook'
  },
  emailSubject: '【白狐博客】新用户注册自动验证码',
  emailTemplate: `尊敬的白狐访客：\n\n欢迎加入白狐数字空间！您注册账号的验证码为：\n\n【 {{code}} 】\n\n该验证码在 {{expire}} 分钟内有效，请勿泄露给他人。如非本人操作，请忽略此邮件。\n\n—— 白狐 (WhiteFox) 博客团队`,
  lastSentLog: [
    { id: 'log-1', recipient: 'cloudgeek@example.com', code: '849201', time: '2025-05-18 10:14:22', status: '已成功发送' },
    { id: 'log-2', recipient: 'visitor@example.com', code: '392184', time: '2025-05-17 19:30:05', status: '已成功发送' }
  ]
};

export const initialMailMessages = [
  {
    id: 'mail-1',
    folder: 'inbox', // 'inbox' | 'sent' | 'trash'
    sender: 'reader@example.com',
    recipient: 'service@whitefox.blog',
    subject: '关于博客中 Cloudflare D1 边缘多路同步的探讨',
    content: '站长您好，拜读了您的边缘架构博文，请问在无数据库模式下，R2 与 KV 的双写一致性是如何保障的呢？非常期待您的回复！',
    date: '2025-05-20 14:32:00',
    read: true,
    isStarred: true,
    isCodeVerify: false,
    updatedAt: seedTimestamp,
    deleted: false
  },
  {
    id: 'mail-2',
    folder: 'inbox',
    sender: 'newuser@163.com',
    recipient: 'service@whitefox.blog',
    subject: '新用户注册身份验证码请求',
    content: '用户请求注册验证码：668822，已由系统安全网关自动发放。',
    date: '2025-05-20 16:10:00',
    read: false,
    isStarred: false,
    isCodeVerify: true,
    code: '668822',
    updatedAt: seedTimestamp,
    deleted: false
  },
  {
    id: 'mail-3',
    folder: 'sent',
    sender: 'service@whitefox.blog',
    recipient: 'reader@example.com',
    subject: '回复：关于博客中 Cloudflare D1 边缘多路同步的探讨',
    content: '您好！我们采用乐观锁与时间戳合并策略（LWW），当 D1 离线时自动切换至 KV/R2 并在重新连通时进行增量聚合，确保无缝同步。',
    date: '2025-05-20 17:05:00',
    read: true,
    isStarred: false,
    isCodeVerify: false,
    updatedAt: seedTimestamp,
    deleted: false
  }
];

export const initialBookmarks = [
  {
    id: 'bm-1',
    title: 'Cloudflare Pages & Workers',
    url: 'https://dash.cloudflare.com',
    category: 'cloud',
    desc: '全球 Anycast 边缘计算与静态托管中枢',
    updatedAt: seedTimestamp,
    deleted: false
  },
  {
    id: 'bm-2',
    title: '腾讯云 EdgeOne / COS',
    url: 'https://console.cloud.tencent.com/cos',
    category: 'cloud',
    desc: '极速国内 CDN 与对象存储服务',
    updatedAt: seedTimestamp,
    deleted: false
  },
  {
    id: 'bm-3',
    title: '阿里云 ESA / OSS',
    url: 'https://oss.console.aliyun.com',
    category: 'cloud',
    desc: '高可用分布式对象存储控制台',
    updatedAt: seedTimestamp,
    deleted: false
  },
  {
    id: 'bm-4',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    category: 'tech',
    desc: '权威 Web 开发技术标准文档与参考',
    updatedAt: seedTimestamp,
    deleted: false
  },
  {
    id: 'bm-5',
    title: 'GitHub 开源社区',
    url: 'https://github.com',
    category: 'tech',
    desc: '代码托管与 CI/CD 自动化流水线',
    updatedAt: seedTimestamp,
    deleted: false
  },
  {
    id: 'bm-6',
    title: 'DeepSeek / OpenAI AI 智识',
    url: 'https://chat.deepseek.com',
    category: 'ai',
    desc: '新一代推理与代码大语言模型',
    updatedAt: seedTimestamp,
    deleted: false
  }
];

export const initialCloudConfig = defaultCloudConfig;

export const defaultBackendConfig = {
  dbType: 'cloudflare-d1',
  dbHost: '',
  dbPort: '3306',
  dbName: '',
  dbUser: '',
  dbPassword: '',
  dbToken: '',
  dbAccountId: '',
  dbConnected: false,
  storageType: 'cloudflare-r2',
  storageEndpoint: '',
  storageBucket: '',
  storageAccessKeyId: '',
  storageSecretAccessKey: '',
  storageConnected: false,
  status: 'disconnected',
  lastConnectedAt: ''
};

export const initialCloudFiles = [
  {
    id: 'cf-1',
    name: '白狐博客白皮书v1.pdf',
    size: '3.8 MB',
    type: 'document',
    provider: 'Cloudflare R2',
    url: 'https://r2.whitefox.blog/whitefox-v1.pdf',
    uploadedAt: '2025-05-18',
    updatedAt: seedTimestamp,
    deleted: false
  },
  {
    id: 'cf-2',
    name: '青丘落雪背景视频.mp4',
    size: '24.5 MB',
    type: 'video',
    provider: 'Tencent COS',
    url: 'https://cos.whitefox.blog/snow_fox.mp4',
    uploadedAt: '2025-05-17',
    updatedAt: seedTimestamp,
    deleted: false
  },
  {
    id: 'cf-3',
    name: '古琴琴韵与竹林清风.mp3',
    size: '8.2 MB',
    type: 'audio',
    provider: 'Alibaba OSS',
    url: 'https://oss.whitefox.blog/guqin.mp3',
    uploadedAt: '2025-05-16',
    updatedAt: seedTimestamp,
    deleted: false
  },
  {
    id: 'cf-4',
    name: '白狐原画壁纸集.zip',
    size: '45.1 MB',
    type: 'archive',
    provider: 'AList / WebDAV',
    url: 'https://pan.whitefox.blog/d/whitefox_art.zip',
    uploadedAt: '2025-05-15',
    updatedAt: seedTimestamp,
    deleted: false
  }
];

export const getDeploymentAdminCredentials = () => {
  const username =
    (typeof localStorage !== 'undefined' && localStorage.getItem('wf_cf_admin_username')) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_USERNAME) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_INITIAL_ADMIN_USERNAME) ||
    'fox';
  const password =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PASSWORD) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_INITIAL_ADMIN_PASSWORD) ||
    'whitefox2025';
  return { username, password };
};

const deploymentAdmin = getDeploymentAdminCredentials();

export const initialUsers = [
  {
    id: 'u-2',
    username: '青丘客',
    email: 'visitor@example.com',
    password: 'password123',
    role: 'member',
    registeredAt: '2025-05-10'
  },
  {
    id: 'u-3',
    username: '云端极客',
    email: 'cloudgeek@example.com',
    password: 'password123',
    role: 'member',
    registeredAt: '2025-05-12'
  }
];

export const defaultAppearance = {
  themeId: 'emerald-white',
  bgColor: '#f8fafc',
  bgImage: '',
  heroImage: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
  avatarImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  updatedAt: seedTimestamp
};

export { defaultSystemSettings };

export const defaultSearchProxy = {
  enabled: true,
  endpoint: 'https://proxy-search.whitefox.blog/api',
  notice: '站内免代理直连已启用'
};

export const layoutOptions = [
  { id: 'grid', name: '经典卡片网格 (Classic Grid)', desc: '标准自适应网格，突出封面与标签' },
  { id: 'magazine', name: '沉浸杂志流瀑 (Magazine Waterfall)', desc: '大图横向排版，优雅长文阅读体验' },
  { id: 'minimal', name: '极简流式信息条 (Minimal Stream)', desc: '去芜存菁，突出文章标题与时间' },
  { id: 'compact', name: '高密度紧凑列表 (Compact List)', desc: '最高信息容积，极客与速览首选' }
];

export const fontSizes = [
  { id: 'compact', name: '紧凑 (14px)', class: 'text-sm' },
  { id: 'standard', name: '标准 (16px)', class: 'text-base' },
  { id: 'large', name: '舒适大字 (18px)', class: 'text-lg' },
  { id: 'extra', name: '特大号清晰 (20px)', class: 'text-xl' }
];

// Helper to calculate total local & storage usage in bytes (默认值为 0，仅真实计算用户增量上传文件与数据大小)
export const calculateUsedStorageBytes = () => {
  let bytes = 0;
  try {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('wf_')) {
        bytes += (localStorage[key].length * 2);
      }
    }
  } catch (e) {
    // ignore
  }
  return bytes;
};

export const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Universal Multi-Channel Broadcast Sync System with tabId, origin & message deduplication
 */
const SYNC_BROADCAST_CHANNEL_NAME = 'whitefox_universal_sync_channel';

// Unique Tab ID per browser tab session
export const TAB_ID = typeof window !== 'undefined'
  ? (window.__whitefox_tab_id || (window.__whitefox_tab_id = 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now()))
  : 'server_tab';

class UniversalSyncBroadcaster {
  constructor() {
    this.channel = null;
    this.processedMessageIds = new Set();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(SYNC_BROADCAST_CHANNEL_NAME);
      } catch (e) {
        console.warn('BroadcastChannel initialization fallback:', e);
      }
    }
  }

  isProcessed(messageId) {
    if (!messageId) return false;
    if (this.processedMessageIds.has(messageId)) {
      return true;
    }
    this.processedMessageIds.add(messageId);
    // Keep max 200 items in deduplication cache
    if (this.processedMessageIds.size > 200) {
      const first = this.processedMessageIds.values().next().value;
      this.processedMessageIds.delete(first);
    }
    return false;
  }

  broadcast(type, payload, meta = {}) {
    if (typeof window === 'undefined') return;
    const messageId = meta.messageId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.processedMessageIds.add(messageId);

    const message = {
      type,
      payload,
      origin: TAB_ID,
      messageId,
      timestamp: typeof meta.timestamp === 'number' ? meta.timestamp : Date.now()
    };

    // 1. Post to BroadcastChannel (inter-tab)
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        console.warn('BroadcastChannel post error:', err);
      }
    }

    // 2. Dispatch in-window CustomEvent with meta
    try {
      window.dispatchEvent(new CustomEvent('whitefox-hydrate-full-sync', { detail: { payload, meta: message } }));
    } catch (err) {
      console.warn('Local CustomEvent dispatch error:', err);
    }
  }

  subscribe(callback) {
    if (typeof window === 'undefined') return () => {};

    const handleBroadcastMessage = (event) => {
      if (event && event.data && event.data.payload) {
        const { origin, messageId, payload } = event.data;
        // Ignore messages sent by own tab
        if (origin === TAB_ID) return;
        // Ignore duplicate messages
        if (messageId && this.isProcessed(messageId)) return;

        callback(payload, event.data);
      }
    };

    const handleStorageChange = (event) => {
      if (event.key === 'wf_cross_device_synced_payload' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          const meta = parsed._meta || {};
          if (meta.origin === TAB_ID) return;
          if (meta.messageId && this.isProcessed(meta.messageId)) return;

          callback(parsed.data || parsed, {
            type: 'storage_event',
            origin: meta.origin || 'storage',
            messageId: meta.messageId,
            timestamp: typeof meta.timestamp === 'number' ? meta.timestamp : Date.now()
          });
        } catch (e) {
          // ignore
        }
      }
    };

    const handleCustomSyncEvent = (event) => {
      if (event.detail && event.detail.payload) {
        const meta = event.detail.meta || {};
        if (meta.origin === TAB_ID) return;
        if (meta.messageId && this.isProcessed(meta.messageId)) return;
        callback(event.detail.payload, meta);
      }
    };

    if (this.channel) {
      this.channel.addEventListener('message', handleBroadcastMessage);
    }
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('whitefox-hydrate-full-sync', handleCustomSyncEvent);

    return () => {
      if (this.channel) {
        this.channel.removeEventListener('message', handleBroadcastMessage);
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('whitefox-hydrate-full-sync', handleCustomSyncEvent);
    };
  }
}

export const syncBroadcaster = new UniversalSyncBroadcaster();

/**
 * Universal Item-level Conflict Merge for any entity collection (posts, books, photos, bookmarks, cloudFiles, etc.)
 * - Matches by item id
 * - Compares millisecond updatedAt (Date.now())
 * - Takes newer version; respects tombstone (deleted: true)
 * - Returns array of active non-deleted items + retains internal tombstones for sync propagation
 */
export const mergeEntityCollection = (localList = [], remoteList = [], keepTombstones = true) => {
  const map = new Map();

  // Index local items
  (localList || []).forEach((item) => {
    if (!item || !item.id) return;
    map.set(item.id, {
      ...item,
      updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : 0,
      deleted: Boolean(item.deleted)
    });
  });

  // Merge remote items
  (remoteList || []).forEach((remoteItem) => {
    if (!remoteItem || !remoteItem.id) return;
    const remoteUpdated = typeof remoteItem.updatedAt === 'number' ? remoteItem.updatedAt : 0;
    const existing = map.get(remoteItem.id);

    if (!existing) {
      map.set(remoteItem.id, {
        ...remoteItem,
        updatedAt: remoteUpdated,
        deleted: Boolean(remoteItem.deleted)
      });
    } else {
      // Compare millisecond updatedAt
      if (remoteUpdated >= existing.updatedAt) {
        map.set(remoteItem.id, {
          ...existing,
          ...remoteItem,
          updatedAt: remoteUpdated,
          deleted: Boolean(remoteItem.deleted)
        });
      }
    }
  });

  const merged = Array.from(map.values());
  return keepTombstones ? merged : merged.filter((item) => !item.deleted);
};

/**
 * Sanitizes sync payload to strictly exclude sensitive credentials:
 * - Excludes `users` collection completely (passwords, emails, roles)
 * - Strips sensitive credentials from emailSettings (smtpPass)
 * - Strips sensitive secrets from cloudConfig (storageSecretAccessKey, dbToken, dbPassword)
 */
export const sanitizeSyncPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return {};

  const clean = { ...payload };

  // Exclude users completely from cloud sync payload
  delete clean.users;

  // Sanitize emailSettings
  if (clean.emailSettings) {
    clean.emailSettings = {
      ...clean.emailSettings,
      smtpPass: undefined,
      authSecret: undefined
    };
    delete clean.emailSettings.smtpPass;
    delete clean.emailSettings.authSecret;
  }

  // Sanitize cloudConfig
  if (clean.cloudConfig) {
    clean.cloudConfig = {
      ...clean.cloudConfig,
      r2SecretKey: undefined,
      cosSecretKey: undefined,
      ossSecretKey: undefined,
      token: undefined
    };
    delete clean.cloudConfig.r2SecretKey;
    delete clean.cloudConfig.cosSecretKey;
    delete clean.cloudConfig.ossSecretKey;
    delete clean.cloudConfig.token;
  }

  // Sanitize backendConfig
  if (clean.backendConfig) {
    clean.backendConfig = {
      ...clean.backendConfig,
      dbPassword: undefined,
      dbToken: undefined,
      storageSecretAccessKey: undefined
    };
    delete clean.backendConfig.dbPassword;
    delete clean.backendConfig.dbToken;
    delete clean.backendConfig.storageSecretAccessKey;
  }

  // 严格杜绝在数据库同步载荷中传输大文件本体/Base64：仅保留元数据与正确 URL
  const sanitizeCollectionUrls = (items) => {
    if (!Array.isArray(items)) return items;
    return items.map((item) => {
      if (!item || typeof item !== 'object') return item;
      const stripped = { ...item };
      // 若包含超过 50KB 的内联 Base64，移除并保留占位，要求走 R2/D1 URL 访问
      if (typeof stripped.url === 'string' && stripped.url.startsWith('data:') && stripped.url.length > 50000) {
        stripped.url = stripped.downloadUrl || stripped.storageKey ? `/api/upload?key=${encodeURIComponent(stripped.storageKey)}` : '';
      }
      if (typeof stripped.fileUrl === 'string' && stripped.fileUrl.startsWith('data:') && stripped.fileUrl.length > 50000) {
        stripped.fileUrl = stripped.downloadUrl || stripped.storageKey ? `/api/upload?key=${encodeURIComponent(stripped.storageKey)}` : '';
      }
      return stripped;
    });
  };

  if (clean.posts) clean.posts = sanitizeCollectionUrls(clean.posts);
  if (clean.photos) clean.photos = sanitizeCollectionUrls(clean.photos);
  if (clean.books) clean.books = sanitizeCollectionUrls(clean.books);
  if (clean.mediaList) clean.mediaList = sanitizeCollectionUrls(clean.mediaList);
  if (clean.cloudFiles) clean.cloudFiles = sanitizeCollectionUrls(clean.cloudFiles);

  return clean;
};

/**
 * Universal Site-Wide Sync Merge Strategy
 * Applies mergeEntityCollection across all collections and resolves scalar settings with millisecond timestamps
 */
export const mergeSyncPayloadWithTimestamp = (currentData, incomingData) => {
  if (!incomingData) return currentData || {};
  if (!currentData) return incomingData;

  const currentTs = typeof currentData.updatedAt === 'number'
    ? currentData.updatedAt
    : (typeof currentData.timestamp === 'number' ? currentData.timestamp : 0);

  const incomingTs = typeof incomingData.updatedAt === 'number'
    ? incomingData.updatedAt
    : (typeof incomingData.timestamp === 'number' ? incomingData.timestamp : (incomingData.updatedAt || 0));

  // Merge all entity collections using the unified tombstone & ID-based merge function
  const mergedPosts = mergeEntityCollection(currentData.posts, incomingData.posts, true);
  const mergedBooks = mergeEntityCollection(currentData.books, incomingData.books, true);
  const mergedPhotos = mergeEntityCollection(currentData.photos, incomingData.photos, true);
  const mergedMediaList = mergeEntityCollection(currentData.mediaList, incomingData.mediaList, true);
  const mergedCloudFiles = mergeEntityCollection(currentData.cloudFiles, incomingData.cloudFiles, true);
  const mergedBookmarks = mergeEntityCollection(currentData.bookmarks, incomingData.bookmarks, true);
  const mergedBrowsingHistory = mergeEntityCollection(currentData.browsingHistory, incomingData.browsingHistory, true);
  const mergedMailMessages = mergeEntityCollection(currentData.mailMessages, incomingData.mailMessages, true);
  const mergedShopOrders = mergeEntityCollection(currentData.shopOrders, incomingData.shopOrders, true);
  const mergedShopInquiries = mergeEntityCollection(currentData.shopInquiries, incomingData.shopInquiries, true);

  // Settings & appearance: take newer by payload timestamp
  const isIncomingNewer = incomingTs >= currentTs;

  return {
    ...currentData,
    ...incomingData,
    posts: mergedPosts,
    books: mergedBooks,
    photos: mergedPhotos,
    mediaList: mergedMediaList,
    cloudFiles: mergedCloudFiles,
    bookmarks: mergedBookmarks,
    browsingHistory: mergedBrowsingHistory,
    mailMessages: mergedMailMessages,
    shopOrders: mergedShopOrders,
    shopInquiries: mergedShopInquiries,
    // Sensitive configurations are retained locally and not blindly overwritten by stripped data
    emailSettings: currentData.emailSettings || incomingData.emailSettings || {},
    cloudConfig: currentData.cloudConfig || incomingData.cloudConfig || {},
    users: currentData.users || [],
    appearance: isIncomingNewer ? (incomingData.appearance || currentData.appearance) : currentData.appearance,
    systemSettings: isIncomingNewer ? (incomingData.systemSettings || currentData.systemSettings) : currentData.systemSettings,
    siteName: isIncomingNewer ? (incomingData.siteName || currentData.siteName) : currentData.siteName,
    siteLayout: isIncomingNewer ? (incomingData.siteLayout || currentData.siteLayout) : currentData.siteLayout,
    fontSize: isIncomingNewer ? (incomingData.fontSize || currentData.fontSize) : currentData.fontSize,
    lang: isIncomingNewer ? (incomingData.lang || currentData.lang) : currentData.lang,
    themeId: isIncomingNewer ? (incomingData.themeId || currentData.themeId) : currentData.themeId,
    version: Math.max(currentData.version || 0, incomingData.version || 0),
    updatedAt: Math.max(currentTs, incomingTs, Date.now())
  };
};
