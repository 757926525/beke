import {
  initialArticles,
  initialBooks,
  initialPhotos,
  initialMedia,
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
  BROWSING_HISTORY: 'wf_browsing_history',
  HERO_INTRO: 'wf_hero_intro'
};

export const defaultHeroIntro = {
  badge: '灵狐踏雪 · 随心而述 · 云端无界',
  title: '极简敏捷与多云边缘博客',
  desc: '原生适配多云边缘 Pages（Cloudflare / 腾讯云 / 阿里云），一键拉取与构建，集成 D1 边缘数据库与全功能媒体中枢。',
  heroImage: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
  totalCapacityBytes: 10 * 1024 * 1024 * 1024 // 10 GB
};

export const initialPosts = initialArticles;
export { initialBooks, initialPhotos, initialMedia };

export const defaultEmailSettings = {
  enabled: true,
  provider: 'smtp',
  smtpHost: 'smtp.whitefox.blog',
  smtpPort: 465,
  smtpUser: 'service@whitefox.blog',
  smtpPass: '••••••••••••',
  senderName: '白狐博客官方安全中心',
  senderEmail: 'service@whitefox.blog',
  codeExpireMinutes: 10,
  emailSubject: '【白狐博客】新用户注册自动验证码',
  emailTemplate: `尊敬的白狐访客：\n\n欢迎加入白狐数字空间！您注册账号的验证码为：\n\n【 {{code}} 】\n\n该验证码在 {{expire}} 分钟内有效，请勿泄露给他人。如非本人操作，请忽略此邮件。\n\n—— 白狐 (WhiteFox) 博客团队`,
  lastSentLog: [
    { id: 'log-1', recipient: 'cloudgeek@example.com', code: '849201', time: '2025-05-18 10:14:22', status: '已成功发送' },
    { id: 'log-2', recipient: 'visitor@example.com', code: '392184', time: '2025-05-17 19:30:05', status: '已成功发送' }
  ]
};

export const initialBookmarks = [
  {
    id: 'bm-1',
    title: 'Cloudflare Pages & Workers',
    url: 'https://dash.cloudflare.com',
    category: 'cloud',
    desc: '全球 Anycast 边缘计算与静态托管中枢'
  },
  {
    id: 'bm-2',
    title: '腾讯云 EdgeOne / COS',
    url: 'https://console.cloud.tencent.com/cos',
    category: 'cloud',
    desc: '极速国内 CDN 与对象存储服务'
  },
  {
    id: 'bm-3',
    title: '阿里云 ESA / OSS',
    url: 'https://oss.console.aliyun.com',
    category: 'cloud',
    desc: '高可用分布式对象存储控制台'
  },
  {
    id: 'bm-4',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    category: 'tech',
    desc: '权威 Web 开发技术标准文档与参考'
  },
  {
    id: 'bm-5',
    title: 'GitHub 开源社区',
    url: 'https://github.com',
    category: 'tech',
    desc: '代码托管与 CI/CD 自动化流水线'
  },
  {
    id: 'bm-6',
    title: 'DeepSeek / OpenAI AI 智识',
    url: 'https://chat.deepseek.com',
    category: 'ai',
    desc: '新一代推理与代码大语言模型'
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
    uploadedAt: '2025-05-18'
  },
  {
    id: 'cf-2',
    name: '青丘落雪背景视频.mp4',
    size: '24.5 MB',
    type: 'video',
    provider: 'Tencent COS',
    url: 'https://cos.whitefox.blog/snow_fox.mp4',
    uploadedAt: '2025-05-17'
  },
  {
    id: 'cf-3',
    name: '古琴琴韵与竹林清风.mp3',
    size: '8.2 MB',
    type: 'audio',
    provider: 'Alibaba OSS',
    url: 'https://oss.whitefox.blog/guqin.mp3',
    uploadedAt: '2025-05-16'
  },
  {
    id: 'cf-4',
    name: '白狐原画壁纸集.zip',
    size: '45.1 MB',
    type: 'archive',
    provider: 'AList / WebDAV',
    url: 'https://pan.whitefox.blog/d/whitefox_art.zip',
    uploadedAt: '2025-05-15'
  }
];

export const getDeploymentAdminCredentials = () => {
  const username =
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
    id: 'u-1',
    username: deploymentAdmin.username,
    email: 'admin@whitefox.blog',
    password: deploymentAdmin.password,
    role: 'admin',
    registeredAt: '2025-05-01'
  },
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
  avatarImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
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

// Helper to calculate total local & storage usage in bytes
export const calculateUsedStorageBytes = () => {
  let bytes = 81.6 * 1024 * 1024; // baseline cloud media assets
  try {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        bytes += (localStorage[key].length * 2);
      }
    }
  } catch (e) {
    // ignore
  }
  return bytes;
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Universal Multi-Channel Broadcast Sync System
 * Supports BroadcastChannel API + Storage Events + In-Memory CustomEvents
 */
const SYNC_BROADCAST_CHANNEL_NAME = 'whitefox_universal_sync_channel';

class UniversalSyncBroadcaster {
  constructor() {
    this.channel = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(SYNC_BROADCAST_CHANNEL_NAME);
      } catch (e) {
        console.warn('BroadcastChannel initialization fallback:', e);
      }
    }
  }

  broadcast(type, payload, meta = {}) {
    if (typeof window === 'undefined') return;
    const message = {
      type,
      payload,
      timestamp: meta.timestamp || new Date().toISOString(),
      senderId: meta.senderId || window.__whitefox_session_id || 'tab-' + Math.random().toString(36).substring(2, 9)
    };

    // 1. Post to BroadcastChannel (inter-tab)
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        console.warn('BroadcastChannel post error:', err);
      }
    }

    // 2. Dispatch in-window CustomEvent
    try {
      window.dispatchEvent(new CustomEvent('whitefox-hydrate-full-sync', { detail: payload }));
    } catch (err) {
      console.warn('Local CustomEvent dispatch error:', err);
    }
  }

  subscribe(callback) {
    if (typeof window === 'undefined') return () => {};

    const handleBroadcastMessage = (event) => {
      if (event && event.data && event.data.payload) {
        callback(event.data.payload, event.data);
      }
    };

    const handleStorageChange = (event) => {
      if (event.key === 'wf_cross_device_synced_payload' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          callback(parsed, { type: 'storage_event', timestamp: new Date().toISOString() });
        } catch (e) {
          // ignore
        }
      }
    };

    const handleCustomSyncEvent = (event) => {
      if (event.detail) {
        callback(event.detail, { type: 'custom_event', timestamp: new Date().toISOString() });
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
 * Last-Write-Wins (Timestamp) Resolution & Merge for Site Data
 */
export const mergeSyncPayloadWithTimestamp = (currentData, incomingData) => {
  if (!incomingData) return currentData;
  if (!currentData) return incomingData;

  const currentTs = new Date(currentData.timestamp || currentData.syncedAt || 0).getTime();
  const incomingTs = new Date(incomingData.timestamp || incomingData.syncedAt || 0).getTime();

  // If incoming has newer timestamp or current has no timestamp, incoming wins
  if (incomingTs >= currentTs) {
    return {
      ...currentData,
      ...incomingData,
      posts: incomingData.posts || currentData.posts || [],
      books: incomingData.books || currentData.books || [],
      photos: incomingData.photos || currentData.photos || [],
      mediaList: incomingData.mediaList || currentData.mediaList || [],
      cloudFiles: incomingData.cloudFiles || currentData.cloudFiles || [],
      bookmarks: incomingData.bookmarks || currentData.bookmarks || [],
      browsingHistory: incomingData.browsingHistory || currentData.browsingHistory || [],
      cloudConfig: incomingData.cloudConfig || currentData.cloudConfig || {},
      emailSettings: incomingData.emailSettings || currentData.emailSettings || {},
      appearance: incomingData.appearance || currentData.appearance || {},
      systemSettings: incomingData.systemSettings || currentData.systemSettings || {},
      users: incomingData.users || currentData.users || [],
      siteName: incomingData.siteName || currentData.siteName,
      siteLayout: incomingData.siteLayout || currentData.siteLayout,
      fontSize: incomingData.fontSize || currentData.fontSize,
      lang: incomingData.lang || currentData.lang,
      themeId: incomingData.themeId || currentData.themeId,
      syncedAt: incomingData.syncedAt || new Date().toISOString()
    };
  }

  return currentData;
};
