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
const getStorageItem = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage key "${key}":`, e);
    return fallback;
  }
};

const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving localStorage key "${key}":`, e);
  }
};

export const StorageService = {
  // Articles
  getArticles: () => getStorageItem('wf_articles', initialArticles),
  saveArticles: (articles) => setStorageItem('wf_articles', articles),

  // Bookshelf
  getBooks: () => getStorageItem('wf_books', initialBooks),
  saveBooks: (books) => setStorageItem('wf_books', books),

  // Photos
  getPhotos: () => getStorageItem('wf_photos', initialPhotos),
  savePhotos: (photos) => setStorageItem('wf_photos', photos),

  // Media
  getPlaylist: () => getStorageItem('wf_playlist', initialMedia),
  savePlaylist: (playlist) => setStorageItem('wf_playlist', playlist),

  // Bookmarks
  getBookmarks: () => getStorageItem('wf_web_bookmarks', initialWebBookmarks),
  saveBookmarks: (bms) => setStorageItem('wf_web_bookmarks', bms),

  getZones: () => getStorageItem('wf_bookmark_zones', initialBookmarkZones),
  saveZones: (zones) => setStorageItem('wf_bookmark_zones', zones),

  // Downloads
  getDownloads: () => getStorageItem('wf_downloads', [
    {
      id: 'dl-1',
      filename: 'whitefox-pages-dist.zip',
      url: 'https://whitefox.blog/releases/whitefox-pages-dist.zip',
      size: '2.4 MB',
      progress: 100,
      status: 'completed',
      date: '2025-05-18 10:20'
    }
  ]),
  saveDownloads: (dls) => setStorageItem('wf_downloads', dls),

  // History
  getHistory: () => getStorageItem('wf_history', [
    { id: 'h-1', title: '青丘夜雪：白狐博客的设计哲学与云原生构建指南', type: 'article', timestamp: new Date(Date.now() - 3600000).toLocaleString() },
    { id: 'h-2', title: 'Cloudflare 控制台与 Pages', type: 'website', timestamp: new Date(Date.now() - 7200000).toLocaleString() }
  ]),
  addHistory: (item) => {
    const list = getStorageItem('wf_history', []);
    const updated = [{ ...item, id: 'h-' + Date.now(), timestamp: new Date().toLocaleString() }, ...list.slice(0, 49)];
    setStorageItem('wf_history', updated);
  },
  clearHistory: () => setStorageItem('wf_history', []),

  // Cloud & DB Configuration
  getCloudConfig: () => getStorageItem('wf_cloud_config', defaultCloudConfig),
  saveCloudConfig: (cfg) => setStorageItem('wf_cloud_config', cfg),

  // System Settings (Admin Password, Registration Switch, Email Verification)
  getSystemSettings: () => getStorageItem('wf_system_settings', defaultSystemSettings),
  saveSystemSettings: (settings) => setStorageItem('wf_system_settings', settings),

  // User Authentication
  getUsers: () => getStorageItem('wf_users', [
    {
      id: 'user-admin',
      username: 'admin',
      email: 'admin@whitefox.blog',
      role: 'admin',
      registeredAt: '2025-05-01'
    }
  ]),
  saveUsers: (users) => setStorageItem('wf_users', users),

  getCurrentUser: () => getStorageItem('wf_current_user', null),
  setCurrentUser: (user) => setStorageItem('wf_current_user', user),

  // Cloud Sync Simulation (D1 Database Sync)
  syncWithD1: async () => {
    // Simulating Cloudflare D1 distributed synchronization latency & SQL queries
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      syncedAt: new Date().toLocaleString(),
      recordsCount: {
        articles: (StorageService.getArticles()).length,
        bookmarks: (StorageService.getBookmarks()).length,
        books: (StorageService.getBooks()).length,
        photos: (StorageService.getPhotos()).length
      }
    };
  },

  // NetDrive (AList/WebDAV/Baidu/Quark) Save & Reference
  saveToNetDrive: async (item, targetFolder = '/白狐博客专存/媒体与电子书/') => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return {
      success: true,
      path: `${targetFolder}${item.title || item.name || 'file'}.${item.format ? item.format.toLowerCase() : 'dat'}`,
      shareUrl: `https://pan.whitefox.blog/d/${encodeURIComponent(item.title || 'file')}`
    };
  }
};
