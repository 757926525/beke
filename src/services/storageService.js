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
  USERS: 'wf_users'
};

export const initialPosts = initialArticles;
export { initialBooks };

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

export const initialUsers = [
  {
    id: 'u-1',
    username: '白狐 (站长)',
    email: 'admin@whitefox.blog',
    role: 'admin',
    registeredAt: '2025-05-01'
  },
  {
    id: 'u-2',
    username: '青丘客',
    email: 'visitor@example.com',
    role: 'member',
    registeredAt: '2025-05-10'
  },
  {
    id: 'u-3',
    username: '云端极客',
    email: 'cloudgeek@example.com',
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

export const StorageService = {
  getArticles: () => loadFromStorage(STORAGE_KEYS.POSTS, initialArticles),
  saveArticles: (articles) => saveToStorage(STORAGE_KEYS.POSTS, articles),
  getBooks: () => loadFromStorage(STORAGE_KEYS.BOOKS, initialBooks),
  saveBooks: (books) => saveToStorage(STORAGE_KEYS.BOOKS, books),
  getPhotos: () => loadFromStorage('wf_photos', initialPhotos),
  savePhotos: (photos) => saveToStorage('wf_photos', photos),
  getCloudFiles: () => loadFromStorage(STORAGE_KEYS.CLOUD_FILES, initialCloudFiles),
  saveCloudFiles: (files) => saveToStorage(STORAGE_KEYS.CLOUD_FILES, files),
  getAppearance: () => loadFromStorage(STORAGE_KEYS.APPEARANCE, defaultAppearance),
  saveAppearance: (appr) => saveToStorage(STORAGE_KEYS.APPEARANCE, appr)
};
