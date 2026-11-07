import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { BlogList } from './components/BlogList';
import { BlogPostView } from './components/BlogPostView';
import { NetDriveView } from './components/NetDriveView';
import { BookshelfView } from './components/BookshelfView';
import { GalleryView } from './components/GalleryView';
import { BrowserAndBookmarksView } from './components/BrowserAndBookmarksView';
import { MediaPlayerView } from './components/MediaPlayerView';
import { AdminFileAndPortalView } from './components/AdminFileAndPortalView';
import { DownloaderView } from './components/DownloaderView';
import { DeploymentGuideView } from './components/DeploymentGuideView';
import { AdminSettingsView } from './components/AdminSettingsView';
import { AuthModal } from './components/AuthModal';
import {
  initialPosts,
  initialBooks,
  initialPhotos,
  initialMedia,
  initialBookmarks,
  initialCloudConfig,
  initialCloudFiles,
  initialUsers,
  defaultAppearance,
  defaultSystemSettings,
  defaultEmailSettings,
  defaultSearchProxy,
  defaultBackendConfig,
  defaultHeroIntro,
  loadFromStorage,
  saveToStorage,
  getDeploymentAdminCredentials,
  syncBroadcaster,
  mergeSyncPayloadWithTimestamp,
  getOrInitSecureSyncKey,
  setSyncRoomKeyPreference,
  getAdminToken,
  setAdminToken,
  TAB_ID,
  STORAGE_KEYS
} from './services/storageService';
import { getTranslation, themePresets } from './services/i18nAndTheme';

export function App() {
  const deploymentAdmin = getDeploymentAdminCredentials();

  // Navigation & Role States
  const [activeTab, setActiveTab] = useState('home');
  const [activePostId, setActivePostId] = useState(null);
  // 未登录访客默认为 null（游客）；仅保留已登录的站长/会员会话。
  // 旧逻辑在无会话时默认伪造一个 admin，导致“退出后刷新/换设备直接进入站长界面”。
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = loadFromStorage(STORAGE_KEYS.AUTH, null);
    if (saved && saved.role === 'admin') {
      return {
        ...saved,
        id: 'u-admin',
        username: `${deploymentAdmin.username} (站长)`,
        email: 'admin@whitefox.blog',
        role: 'admin'
      };
    }
    return saved || null;
  });

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Site Configuration & Personalization
  const [siteName, setSiteName] = useState(() => loadFromStorage(STORAGE_KEYS.SITE_NAME, 'fox'));
  const [siteLayout, setSiteLayout] = useState(() => loadFromStorage(STORAGE_KEYS.SITE_LAYOUT, 'grid'));
  const [fontSize, setFontSize] = useState(() => loadFromStorage(STORAGE_KEYS.FONT_SIZE, 'standard'));
  const [darkMode, setDarkMode] = useState(() => loadFromStorage(STORAGE_KEYS.DARK_MODE, false));
  const [headerCollapsed, setHeaderCollapsed] = useState(() => loadFromStorage(STORAGE_KEYS.HEADER_COLLAPSED, false));

  // Theme & Appearance
  const [lang, setLang] = useState(() => loadFromStorage(STORAGE_KEYS.LANG, 'zh-CN'));
  const [themeId, setThemeId] = useState(() => loadFromStorage(STORAGE_KEYS.THEME, 'emerald-white'));
  const [appearance, setAppearance] = useState(() => loadFromStorage(STORAGE_KEYS.APPEARANCE, defaultAppearance));
  const [heroIntro, setHeroIntro] = useState(() => loadFromStorage(STORAGE_KEYS.HERO_INTRO, defaultHeroIntro));
  const [browsingHistory, setBrowsingHistory] = useState(() => loadFromStorage(STORAGE_KEYS.BROWSING_HISTORY, [
    {
      id: 'art-1',
      title: '从单体到全球边缘：白狐博客的多云架构设计实战',
      category: '多云架构',
      visitedAt: '10:24',
      updatedAt: Date.now(),
      deleted: false
    },
    {
      id: 'art-2',
      title: 'Cloudflare Pages 与 D1 边缘数据库极致优化指南',
      category: '边缘计算',
      visitedAt: '09:40',
      updatedAt: Date.now(),
      deleted: false
    }
  ]));
  const [systemSettings, setSystemSettings] = useState(() => loadFromStorage(STORAGE_KEYS.SYSTEM_SETTINGS, defaultSystemSettings));
  const [emailSettings, setEmailSettings] = useState(() => loadFromStorage(STORAGE_KEYS.EMAIL_SETTINGS, defaultEmailSettings));
  const [searchProxy, setSearchProxy] = useState(() => loadFromStorage(STORAGE_KEYS.SEARCH_PROXY, defaultSearchProxy));
  const [backendConfig, setBackendConfig] = useState(() => loadFromStorage(STORAGE_KEYS.BACKEND_CONFIG, defaultBackendConfig));

  // Application Data States
  const [posts, setPosts] = useState(() => loadFromStorage(STORAGE_KEYS.POSTS, initialPosts));
  const [books, setBooks] = useState(() => loadFromStorage(STORAGE_KEYS.BOOKS, initialBooks));
  const [photos, setPhotos] = useState(() => loadFromStorage(STORAGE_KEYS.PHOTOS, initialPhotos));
  const [mediaList, setMediaList] = useState(() => loadFromStorage(STORAGE_KEYS.MEDIA_LIST, [
    {
      id: 'm-promo-1',
      title: '白狐博客宣传片 · 竖屏与横屏全适配演示',
      desc: '东方美学设计，全平台响应式与边缘计算多云博客技术宣传片',
      type: 'video',
      aspect: '16:9',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      duration: '09:56',
      size: '12.4 MB',
      date: '2025-05-18',
      updatedAt: Date.now(),
      deleted: false
    },
    {
      id: 'm-promo-2',
      title: '极速边缘 · 手机短视频竖屏演示 (9:16 沉浸画幅)',
      desc: '专为移动端打造的 9:16 全屏沉浸体验',
      type: 'video',
      aspect: '9:16',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      duration: '00:15',
      size: '2.8 MB',
      date: '2025-05-18',
      updatedAt: Date.now(),
      deleted: false
    },
    {
      id: 'm-promo-3',
      title: '东方风韵 · 宽荧幕电影感演示 (21:9 超宽屏)',
      desc: '青丘古峰与数字空间，21:9 影院级超宽视角',
      type: 'video',
      aspect: '21:9',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      poster: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      duration: '00:15',
      size: '3.1 MB',
      date: '2025-05-17',
      updatedAt: Date.now(),
      deleted: false
    },
    {
      id: 'm-audio-1',
      title: '青丘幽引 · 东方禅意氛围原声曲',
      desc: '高品质无损音频，古筝、初雪与山涧风声相伴研墨',
      type: 'audio',
      aspect: '1:1',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      poster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      duration: '06:12',
      size: '5.8 MB',
      date: '2025-05-15',
      updatedAt: Date.now(),
      deleted: false
    },
    {
      id: 'm-audio-2',
      title: '白狐技术电台: 从单体到多云全球边缘架构',
      desc: '白狐博客开发者访谈播客第一期：Cloudflare + 腾讯云协同实践',
      type: 'audio',
      aspect: '1:1',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      poster: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=80',
      duration: '07:05',
      size: '6.5 MB',
      date: '2025-05-16',
      updatedAt: Date.now(),
      deleted: false
    }
  ]));
  const [bookmarks, setBookmarks] = useState(() => loadFromStorage(STORAGE_KEYS.BOOKMARKS, initialBookmarks));
  const [cloudConfig, setCloudConfig] = useState(() => loadFromStorage(STORAGE_KEYS.CLOUD_CONFIG, initialCloudConfig));
  const [cloudFiles, setCloudFiles] = useState(() => loadFromStorage(STORAGE_KEYS.CLOUD_FILES, initialCloudFiles));
  // 严格单一管理员约束：users 数据表中仅保留普通 member 用户，过滤任何企图伪造 admin 的条目
  const [users, setUsers] = useState(() => {
    const raw = loadFromStorage(STORAGE_KEYS.USERS, initialUsers);
    return (raw || []).filter((u) => u.role !== 'admin' && u.id !== 'u-admin');
  });

  // --- 关键同步状态管理 ---
  // 1. 首次加载与 hydration 标志：在首次 pull 并 merge 完成前，严格禁止触发任何 push，防止空白新设备覆盖云端
  const [hydrated, setHydrated] = useState(false);

  // 2. 远端数据应用期间标记：当正在合并应用来自远端/其它标签页的数据时，禁止触发自身的自动 push
  const isApplyingRemote = useRef(false);
  const localChangeAtStartup = useRef(
    parseInt(localStorage.getItem(STORAGE_KEYS.LAST_LOCAL_CHANGE) || '0', 10) || 0
  );

  // 3. 自动同步开关状态 (默认全局开启，彻底实现全自动跨设备与本地同步)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(() => {
    const val = localStorage.getItem('wf_auto_sync_enabled');
    return val !== 'false'; // 默认开启 true
  });

  // 4. 同步状态指示器 ('idle' | 'syncing' | 'success' | 'error')
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncStatusMessage, setSyncStatusMessage] = useState('');

  // 5. 版本跟踪
  const [currentVersion, setCurrentVersion] = useState(() => {
    const v = parseInt(localStorage.getItem(STORAGE_KEYS.SYNC_VERSION) || '0', 10);
    return isNaN(v) ? 0 : v;
  });

  // 确保具备非默认的安全随机密钥
  const [syncRoomKey, setSyncRoomKey] = useState(() => getOrInitSecureSyncKey());

  // 样式与字号生效
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-size-compact', 'font-size-standard', 'font-size-large', 'font-size-extra');
    root.classList.add(`font-size-${fontSize}`);
    document.body.classList.remove('font-size-compact', 'font-size-standard', 'font-size-large', 'font-size-extra');
    document.body.classList.add(`font-size-${fontSize}`);

    root.classList.remove('site-layout-grid', 'site-layout-magazine', 'site-layout-minimal', 'site-layout-compact');
    root.classList.add(`site-layout-${siteLayout}`);
  }, [fontSize, siteLayout]);

  // 通用本地状态合并更新函数
  const applyMergedDataToState = (merged) => {
    if (!merged) return;
    if (Array.isArray(merged.posts)) setPosts(merged.posts);
    if (Array.isArray(merged.books)) setBooks(merged.books);
    if (Array.isArray(merged.photos)) setPhotos(merged.photos);
    if (Array.isArray(merged.mediaList)) setMediaList(merged.mediaList);
    if (Array.isArray(merged.cloudFiles)) setCloudFiles(merged.cloudFiles);
    if (Array.isArray(merged.bookmarks)) setBookmarks(merged.bookmarks);
    if (Array.isArray(merged.browsingHistory)) setBrowsingHistory(merged.browsingHistory);

    if (merged.appearance) setAppearance(merged.appearance);
    if (merged.systemSettings) setSystemSettings(merged.systemSettings);
    if (merged.siteName) setSiteName(merged.siteName);
    if (merged.siteLayout) setSiteLayout(merged.siteLayout);
    if (merged.fontSize) setFontSize(merged.fontSize);
    if (merged.lang) setLang(merged.lang);
    if (merged.themeId) setThemeId(merged.themeId);

    if (typeof merged.version === 'number') {
      setCurrentVersion(merged.version);
      localStorage.setItem(STORAGE_KEYS.SYNC_VERSION, String(merged.version));
    }
  };

  // -------------------------------------------------------------
  // 核心逻辑 1: 首次加载时从可用的云端持久化存储拉取并合并数据
  // -------------------------------------------------------------
  useEffect(() => {
    let isCancelled = false;

    async function initialHydrationPull() {
      try {
        const { probePlatformNativeBindings, pullFromCloudSyncVault, pushToCloudSyncVault } = await import('./services/cloudAdapter');
        const health = await probePlatformNativeBindings();

        // 如果 Cloudflare Pages 传回了 ADMIN_USERNAME，动态对齐管理员名称
        if (health.success && health.adminUsername) {
          const remoteAdminName = health.adminUsername.trim();
          setCurrentUser((prev) => {
            if (prev && prev.role === 'admin') {
              return { ...prev, username: `${remoteAdminName} (站长)` };
            }
            return prev;
          });
        }

        // 服务端已配置管理员密码时，以服务端为唯一权威校验站长会话：
        // 本地残留的“站长”状态若没有有效的服务端令牌，一律降级为游客，避免各设备身份/界面不一致。
        try {
          const authRes = await fetch('/api/auth', {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'X-Admin-Token': getAdminToken() }
          });
          if (authRes.ok) {
            const authInfo = await authRes.json();
            if (authInfo && authInfo.configured) {
              if (authInfo.valid) {
                const serverAdminName = (authInfo.username || '').trim();
                if (serverAdminName) {
                  localStorage.setItem('wf_cf_admin_username', serverAdminName);
                  setCurrentUser((prev) =>
                    prev && prev.role === 'admin' ? { ...prev, username: `${serverAdminName} (站长)` } : prev
                  );
                }
              } else {
                setAdminToken('');
                setCurrentUser((prev) => (prev && prev.role === 'admin' ? null : prev));
              }
            }
          }
        } catch (e) {
          // 非 Pages 环境（本地开发）无 /api/auth，保持本地凭据模式
        }

        setSyncStatus('syncing');
        setSyncStatusMessage('正在自动同步全站最新数据...');

        const res = await pullFromCloudSyncVault(syncRoomKey, {
          customEndpoint: backendConfig?.dbHost?.startsWith('http') ? backendConfig.dbHost : undefined,
          authToken: backendConfig?.dbToken
        });

        if (isCancelled) return;

        if (res.success && res.payload) {
          isApplyingRemote.current = true;

          const localSnapshot = {
            posts,
            books,
            photos,
            mediaList,
            cloudFiles,
            bookmarks,
            browsingHistory,
            appearance,
            systemSettings,
            siteName,
            siteLayout,
            fontSize,
            lang,
            themeId,
            version: currentVersion,
            updatedAt: localChangeAtStartup.current
          };

          const merged = mergeSyncPayloadWithTimestamp(localSnapshot, res.payload);
          applyMergedDataToState(merged);
          setTimeout(() => {
            isApplyingRemote.current = false;
          }, 300);

          setSyncStatus('success');
          setSyncStatusMessage(`已同步至最新版本 (v${res.version || 1}${res.storageEngine ? ` · ${res.storageEngine}` : ''})`);

          // If this browser had a real local edit newer than the fetched snapshot,
          // persist the merged result instead of leaving those edits stranded locally.
          if (autoSyncEnabled && localSnapshot.updatedAt > (res.updatedAt || 0)) {
            const pushRes = await pushToCloudSyncVault(merged, {
              vaultKey: syncRoomKey,
              customEndpoint: backendConfig?.dbHost?.startsWith('http') ? backendConfig.dbHost : undefined,
              authToken: backendConfig?.dbToken,
              currentVersion: Math.max(currentVersion, res.version || 0)
            });
            if (pushRes.success) {
              setCurrentVersion(pushRes.version);
              localStorage.setItem(STORAGE_KEYS.SYNC_VERSION, String(pushRes.version));
              setSyncStatusMessage(`本地更新已合并并推送 (版本 v${pushRes.version})`);
            } else {
              setSyncStatus('error');
              setSyncStatusMessage(pushRes.error || '本地合并结果尚未推送到云端');
            }
          }
        } else {
          setSyncStatus('idle');
          setSyncStatusMessage('数据库通道就绪');
        }
      } catch (err) {
        console.warn('Initial hydration notice:', err);
        setSyncStatus('error');
        setSyncStatusMessage('拉取数据库失败: ' + err.message);
      } finally {
        if (!isCancelled) {
          setHydrated(true);
        }
      }
    }

    initialHydrationPull();

    return () => {
      isCancelled = true;
    };
  }, []);

  // -------------------------------------------------------------
  // 核心逻辑 2: 多标签页 / 跨窗口 BroadcastChannel 监听 (防回声 & 去重)
  // -------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = syncBroadcaster.subscribe((data, meta) => {
      if (!data) return;
      // 避免自身标签页回显或重复消息
      if (meta && meta.origin === TAB_ID) return;

      isApplyingRemote.current = true;

      const currentLocal = {
        posts,
        books,
        photos,
        mediaList,
        cloudFiles,
        bookmarks,
        browsingHistory,
        appearance,
        systemSettings,
        siteName,
        siteLayout,
        fontSize,
        lang,
        themeId,
        version: currentVersion,
        updatedAt: parseInt(localStorage.getItem(STORAGE_KEYS.LAST_LOCAL_CHANGE) || '0', 10)
      };

      const merged = mergeSyncPayloadWithTimestamp(currentLocal, data);
      applyMergedDataToState(merged);

      setTimeout(() => {
        isApplyingRemote.current = false;
      }, 300);
    });

    return () => unsubscribe();
  }, [posts, books, photos, mediaList, cloudFiles, bookmarks, browsingHistory, appearance, systemSettings, siteName, siteLayout, fontSize, lang, themeId, currentVersion]);

  // -------------------------------------------------------------
  // 核心逻辑 3: 本地修改持久化 & 更新本地 updatedAt / wf_last_local_change
  // -------------------------------------------------------------
  const recordLocalChange = () => {
    if (!isApplyingRemote.current) {
      localStorage.setItem(STORAGE_KEYS.LAST_LOCAL_CHANGE, String(Date.now()));
    }
  };

  useEffect(() => { saveToStorage(STORAGE_KEYS.AUTH, currentUser); }, [currentUser]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SITE_NAME, siteName); recordLocalChange(); }, [siteName]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SITE_LAYOUT, siteLayout); recordLocalChange(); }, [siteLayout]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.FONT_SIZE, fontSize); recordLocalChange(); }, [fontSize]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.DARK_MODE, darkMode); }, [darkMode]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.HEADER_COLLAPSED, headerCollapsed); }, [headerCollapsed]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.LANG, lang); recordLocalChange(); }, [lang]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.THEME, themeId); recordLocalChange(); }, [themeId]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.APPEARANCE, appearance); recordLocalChange(); }, [appearance]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.HERO_INTRO, heroIntro); recordLocalChange(); }, [heroIntro]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.BROWSING_HISTORY, browsingHistory); recordLocalChange(); }, [browsingHistory]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SYSTEM_SETTINGS, systemSettings); recordLocalChange(); }, [systemSettings]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SEARCH_PROXY, searchProxy); }, [searchProxy]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.BACKEND_CONFIG, backendConfig); }, [backendConfig]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.EMAIL_SETTINGS, emailSettings); }, [emailSettings]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.POSTS, posts); recordLocalChange(); }, [posts]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.BOOKS, books); recordLocalChange(); }, [books]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.PHOTOS, photos); recordLocalChange(); }, [photos]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.MEDIA_LIST, mediaList); recordLocalChange(); }, [mediaList]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.BOOKMARKS, bookmarks); recordLocalChange(); }, [bookmarks]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.CLOUD_CONFIG, cloudConfig); }, [cloudConfig]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.CLOUD_FILES, cloudFiles); recordLocalChange(); }, [cloudFiles]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.USERS, users); }, [users]);

  // -------------------------------------------------------------
  // 核心逻辑 4: 执行推送的封装函数 (含版本递增与状态反馈)
  // -------------------------------------------------------------
  const executePushToCloud = async (isManual = false) => {
    // 首次 hydrated 之前，坚决不 push
    if (!hydrated) return { success: false, reason: 'not_hydrated' };
    if (isApplyingRemote.current) return { success: false, reason: 'is_applying_remote' };

    setSyncStatus('syncing');
    setSyncStatusMessage('正在同步至云端...');

    const nowMs = Date.now();
    const payload = {
      posts,
      books,
      photos,
      mediaList,
      cloudFiles,
      bookmarks,
      browsingHistory,
      appearance,
      systemSettings,
      siteName,
      siteLayout,
      fontSize,
      lang,
      themeId,
      updatedAt: nowMs
    };

    // 广播至其它标签页
    syncBroadcaster.broadcast('STATE_UPDATE', payload, {
      timestamp: nowMs,
      origin: TAB_ID
    });

    try {
      const { pushToCloudSyncVault, pullFromCloudSyncVault } = await import('./services/cloudAdapter');

      let pushRes = await pushToCloudSyncVault(payload, {
        vaultKey: syncRoomKey,
        customEndpoint: backendConfig?.dbHost?.startsWith('http') ? backendConfig.dbHost : undefined,
        authToken: backendConfig?.dbToken,
        currentVersion
      });

      // 如果遇到版本冲突 (409 Conflict)，自动执行 pull -> merge -> push 重试
      if (!pushRes.success && pushRes.conflict) {
        setSyncStatusMessage('检测到云端有更新版本，正在执行智能合并...');
        const pullRes = await pullFromCloudSyncVault(syncRoomKey, {
          customEndpoint: backendConfig?.dbHost?.startsWith('http') ? backendConfig.dbHost : undefined,
          authToken: backendConfig?.dbToken
        });

        if (pullRes.success && pullRes.payload) {
          isApplyingRemote.current = true;
          const merged = mergeSyncPayloadWithTimestamp(payload, pullRes.payload);
          applyMergedDataToState(merged);
          isApplyingRemote.current = false;

          // 以更新后的新版本再次重试推送
          const retryVersion = Math.max(currentVersion, pullRes.version || 0);
          pushRes = await pushToCloudSyncVault(merged, {
            vaultKey: syncRoomKey,
            customEndpoint: backendConfig?.dbHost?.startsWith('http') ? backendConfig.dbHost : undefined,
            authToken: backendConfig?.dbToken,
            currentVersion: retryVersion
          });
        }
      }

      if (pushRes.success) {
        setSyncStatus('success');
        setSyncStatusMessage(`同步成功 (版本 v${pushRes.version})`);
        if (typeof pushRes.version === 'number') {
          setCurrentVersion(pushRes.version);
        }
        return { success: true, version: pushRes.version };
      } else {
        setSyncStatus('error');
        setSyncStatusMessage(pushRes.error || '云端同步失败');
        return { success: false, error: pushRes.error };
      }
    } catch (err) {
      setSyncStatus('error');
      setSyncStatusMessage(`同步异常: ${err.message}`);
      return { success: false, error: err.message };
    }
  };

  // -------------------------------------------------------------
  // 核心逻辑 5: 防抖自动同步 (1500ms，依赖完备，卸载清理)
  // -------------------------------------------------------------
  useEffect(() => {
    // 检查开启状态与 hydration 状态
    if (!autoSyncEnabled || !hydrated || isApplyingRemote.current) {
      return;
    }

    const timer = setTimeout(() => {
      executePushToCloud(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    autoSyncEnabled,
    hydrated,
    posts,
    books,
    photos,
    mediaList,
    cloudFiles,
    bookmarks,
    browsingHistory,
    appearance,
    systemSettings,
    siteName,
    siteLayout,
    fontSize,
    lang,
    themeId,
    currentVersion
  ]);

  // -------------------------------------------------------------
  // 核心逻辑 6: 页面可见性与网络恢复事件补做一次同步
  // -------------------------------------------------------------
  useEffect(() => {
    const handleVisibilityOrOnline = () => {
      if (document.visibilityState === 'visible' && navigator.onLine && autoSyncEnabled && hydrated) {
        // 重新切回或断网重连时，执行 pull -> merge 补齐
        (async () => {
          try {
            const { pullFromCloudSyncVault } = await import('./services/cloudAdapter');
            const res = await pullFromCloudSyncVault(syncRoomKey, {
              customEndpoint: backendConfig?.dbHost?.startsWith('http') ? backendConfig.dbHost : undefined,
              authToken: backendConfig?.dbToken
            });
            if (res.success && res.payload) {
              isApplyingRemote.current = true;
              const localSnapshot = {
                posts,
                books,
                photos,
                mediaList,
                cloudFiles,
                bookmarks,
                browsingHistory,
                appearance,
                systemSettings,
                siteName,
                siteLayout,
                fontSize,
                lang,
                themeId,
                version: currentVersion
              };
              const merged = mergeSyncPayloadWithTimestamp(localSnapshot, res.payload);
              applyMergedDataToState(merged);
              setTimeout(() => {
                isApplyingRemote.current = false;
              }, 200);
            }
          } catch (e) {
            // ignore
          }
        })();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityOrOnline);
    window.addEventListener('online', handleVisibilityOrOnline);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityOrOnline);
      window.removeEventListener('online', handleVisibilityOrOnline);
    };
  }, [autoSyncEnabled, hydrated, currentVersion, syncRoomKey, backendConfig]);

  // -------------------------------------------------------------
  // 顶部导航栏手动同步事件：只有返回 ok 时才提示成功
  // -------------------------------------------------------------
  const handleSyncD1 = async () => {
    const res = await executePushToCloud(true);
    if (res.success) {
      alert(`[${siteName} 系统] 云端多设备双向同步成功！\n\n✓ 状态：版本 v${res.version || currentVersion + 1} 已持久化\n✓ 同步通道：全站主通道就绪\n✓ 各类实体与墓碑已对齐\n✓ 多标签页与跨设备数据同步完成！`);
    } else {
      alert(`[${siteName} 系统] 云端同步未能完成：${res.error || res.reason || '网络无法连通或云端无响应'}\n\n本地数据已正常保存在当前浏览器存储中。`);
    }
  };

  // Current active theme preset
  const currentTheme = themePresets.find((t) => t.id === themeId) || themePresets[0];

  // Helper translation function
  const t = (key) => getTranslation(lang, key);

  // Logout handler
  const handleLogout = () => {
    setAdminToken('');
    setCurrentUser(null);
    if (activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  // Login handler - 站长身份由服务端（Cloudflare 环境变量）统一校验，所有设备/入口结果一致
  const handleLogin = async ({ username, password, isAdminLogin }) => {
    const cleanUser = (username || '').trim().toLowerCase();
    const inputPass = (password || '').trim();

    const grantAdmin = async (displayName) => {
      const adminUser = {
        id: 'u-admin',
        username: `${displayName || deploymentAdmin.username || 'fox'} (站长)`,
        email: 'admin@whitefox.blog',
        role: 'admin'
      };
      setCurrentUser(adminUser);
      saveToStorage(STORAGE_KEYS.AUTH, adminUser);

      // 管理员在任意浏览器登录成功后，立即主动从云端拉取全站最新权威数据并应用，
      // 保证不同浏览器登入后的文章、配置、外观、布局与云端最新状态完全一致。
      try {
        const { pullFromCloudSyncVault } = await import('./services/cloudAdapter');
        const pullRes = await pullFromCloudSyncVault(syncRoomKey, {
          customEndpoint: backendConfig?.dbHost?.startsWith('http') ? backendConfig.dbHost : undefined,
          authToken: backendConfig?.dbToken
        });
        if (pullRes && pullRes.success && pullRes.payload) {
          isApplyingRemote.current = true;
          // 以云端权威数据对齐本地当前状态
          applyMergedDataToState(pullRes.payload);
          if (typeof pullRes.version === 'number') {
            setCurrentVersion(pullRes.version);
            localStorage.setItem(STORAGE_KEYS.SYNC_VERSION, String(pullRes.version));
          }
          setTimeout(() => {
            isApplyingRemote.current = false;
          }, 200);
        }
      } catch (e) {
        // 静默捕获，不阻断正常登录流程
      }

      return { success: true };
    };

    // 1) 优先走服务端 /api/auth（Cloudflare Pages 部署）
    let serverConfigured = false;
    let serverAdminAttempt = false;
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: inputPass })
      });
      const data = await res.json().catch(() => null);
      if (data && data.configured) {
        serverConfigured = true;
        if (data.success && data.token) {
          setAdminToken(data.token);
          if (data.username) localStorage.setItem('wf_cf_admin_username', data.username);
          return grantAdmin(data.username);
        }
        serverAdminAttempt = Boolean(data.adminAttempt);
      }
    } catch (e) {
      // 无 Functions 环境（本地开发/纯静态托管），回退到本地构建期凭据
    }

    if (serverConfigured) {
      // 服务端为权威：账号匹配管理员但密码错误 -> 明确提示，且绝不降级为普通会员
      if (serverAdminAttempt || isAdminLogin) {
        return { success: false, message: '站长账号或密码不正确，请确认 Cloudflare 环境变量中设置的管理员密码。' };
      }
    } else {
      // 2) 回退：未配置服务端凭据时，使用构建期环境变量（仅本地开发/未配置场景）
      const adminConfigName = (deploymentAdmin.username || 'fox').trim().toLowerCase();
      const adminConfigPass = (deploymentAdmin.password || '').trim();
      const isAdminUserMatch = cleanUser === adminConfigName || cleanUser === 'admin@whitefox.blog';
      if (isAdminUserMatch || isAdminLogin) {
        if (adminConfigPass && inputPass === adminConfigPass) {
          return grantAdmin(deploymentAdmin.username);
        }
        return {
          success: false,
          message: `站长密码不正确。当前部署设定管理员账号为 [${deploymentAdmin.username}]，请确认管理密码。`
        };
      }
    }

    // 普通会员用户验证（非管理员账号，严禁管理员凭据降级流向普通成员）
    const matched = (users || []).find(
      (u) =>
        !u.deleted &&
        u.role !== 'admin' &&
        (u.username.toLowerCase() === cleanUser || (u.email && u.email.toLowerCase() === cleanUser)) &&
        u.password === inputPass
    );
    if (matched) {
      const memberUser = {
        id: matched.id,
        username: matched.username,
        email: matched.email || `${matched.username}@example.com`,
        role: 'member'
      };
      setAdminToken('');
      setCurrentUser(memberUser);
      saveToStorage(STORAGE_KEYS.AUTH, memberUser);
      return { success: true };
    }

    return { success: false, message: '账号或密码不正确' };
  };

  // Register handler - Enforce Single-Admin Constraint
  const handleRegister = ({ username, email, password }) => {
    const trimmedUsername = (username || '').trim();
    const adminName = deploymentAdmin.username.toLowerCase();

    if (
      trimmedUsername.toLowerCase() === adminName ||
      trimmedUsername.toLowerCase() === 'admin' ||
      trimmedUsername.toLowerCase() === 'fox' ||
      trimmedUsername.toLowerCase() === (siteName || '').toLowerCase()
    ) {
      return {
        success: false,
        message: '该用户名已受系统保护保留给唯一站长，不能重复注册或导致同名冲突'
      };
    }

    if (users.some((u) => u.username.toLowerCase() === trimmedUsername.toLowerCase())) {
      return { success: false, message: '该用户名已存在，请更换其他用户名' };
    }

    const newUser = {
      id: 'u-' + Date.now(),
      username: trimmedUsername,
      email: email.trim(),
      password,
      role: 'member',
      registeredAt: new Date().toISOString().split('T')[0],
      updatedAt: Date.now(),
      deleted: false
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const activePost = posts.find((p) => p.id === activePostId);

  const isTransparentTheme = Boolean(currentTheme?.isTransparent || appearance?.transparentLayout);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 relative ${
        isTransparentTheme ? 'theme-transparent' : ''
      } ${
        darkMode ? 'bg-slate-900/90 text-slate-100' : 'text-slate-800'
      }`}
      style={{
        backgroundColor: appearance.bgImage ? 'transparent' : (darkMode ? '#0f172a' : appearance.bgColor || '#f8fafc'),
        backgroundImage: appearance.bgImage ? `url(${appearance.bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        systemSettings={systemSettings}
      />

      <div className="w-full">
        {/* Navigation Bar */}
        <Navbar
          siteName={siteName}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setActivePostId(null);
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenAuth={() => setAuthModalOpen(true)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          avatarImage={appearance.avatarImage}
          headerCollapsed={headerCollapsed}
          setHeaderCollapsed={setHeaderCollapsed}
          currentTheme={currentTheme}
          onSync={handleSyncD1}
          syncStatus={syncStatus}
          t={t}
        />

        {/* Global Floating Sync Status Indicator */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <div className="flex items-center justify-between text-[11px] py-1 px-3 rounded-xl bg-white/70 border border-slate-200/60 shadow-xs backdrop-blur-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${
                syncStatus === 'syncing' ? 'bg-amber-500 animate-ping' :
                syncStatus === 'success' ? 'bg-emerald-500' :
                syncStatus === 'error' ? 'bg-rose-500' : 'bg-slate-400'
              }`} />
              <span className="font-medium">
                {syncStatus === 'syncing' ? '云端同步中...' :
                 syncStatus === 'success' ? '云端数据已同步 (实时畅通)' :
                 syncStatus === 'error' ? '同步连接受限' : '云端待命'}
              </span>
              {syncStatusMessage && (
                <span className="text-slate-400 border-l border-slate-200 pl-2 ml-1 hidden sm:inline">
                  {syncStatusMessage}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 text-slate-500 font-mono text-[10px]">
              <span>通道: 全站云端主通道</span>
              <span>版本: v{currentVersion}</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${autoSyncEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {autoSyncEnabled ? '自动同步开启' : '手动同步'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'home' && !activePostId && (
            <BlogList
              posts={posts.filter((p) => !p.deleted)}
              setPosts={(newPostsOrFn) => {
                const updated = typeof newPostsOrFn === 'function' ? newPostsOrFn(posts) : newPostsOrFn;
                const withTimestamps = (updated || []).map((p) => ({
                  ...p,
                  updatedAt: typeof p.updatedAt === 'number' ? p.updatedAt : Date.now(),
                  deleted: Boolean(p.deleted)
                }));
                setPosts(withTimestamps);
              }}
              currentUser={currentUser}
              onSelectPost={(id) => setActivePostId(id)}
              isAdmin={currentUser?.role === 'admin'}
              layout={siteLayout}
              fontSize={fontSize}
              cloudFiles={cloudFiles.filter((f) => !f.deleted)}
              bookmarks={bookmarks.filter((b) => !b.deleted)}
              photos={photos.filter((ph) => !ph.deleted)}
              siteName={siteName}
              heroIntro={heroIntro}
              setHeroIntro={setHeroIntro}
              browsingHistory={browsingHistory}
              setBrowsingHistory={setBrowsingHistory}
              t={t}
            />
          )}

          {activeTab === 'home' && activePostId && activePost && (
            <BlogPostView
              post={activePost}
              onBack={() => setActivePostId(null)}
              currentUser={currentUser}
              cloudFiles={cloudFiles.filter((f) => !f.deleted)}
              bookmarks={bookmarks.filter((b) => !b.deleted)}
              onUpdatePost={(updatedPost) => {
                const stamp = Date.now();
                setPosts(posts.map((p) => (p.id === updatedPost.id ? { ...updatedPost, updatedAt: stamp } : p)));
              }}
              onAddComment={(comment) => {
                const stamp = Date.now();
                const updated = posts.map((p) =>
                  p.id === activePost.id
                    ? { ...p, comments: [...(p.comments || []), comment], updatedAt: stamp }
                    : p
                );
                setPosts(updated);
              }}
              onDeletePost={(id) => {
                const stamp = Date.now();
                // 采用墓碑标记机制 deleted: true，使得删除动作能同步到其它设备
                setPosts(posts.map((p) => (p.id === id ? { ...p, deleted: true, updatedAt: stamp } : p)));
                setActivePostId(null);
              }}
              fontSize={fontSize}
              t={t}
            />
          )}

          {activeTab === 'books' && (
            <BookshelfView
              books={books.filter((b) => !b.deleted)}
              setBooks={(newBooksOrFn) => {
                const updated = typeof newBooksOrFn === 'function' ? newBooksOrFn(books) : newBooksOrFn;
                setBooks((updated || []).map((b) => ({ ...b, updatedAt: b.updatedAt || Date.now(), deleted: Boolean(b.deleted) })));
              }}
              currentUser={currentUser}
              isAdmin={currentUser?.role === 'admin'}
              t={t}
            />
          )}

          {activeTab === 'cloud' && (
            <NetDriveView
              cloudConfig={cloudConfig}
              setCloudConfig={setCloudConfig}
              cloudFiles={cloudFiles.filter((f) => !f.deleted)}
              setCloudFiles={(newFilesOrFn) => {
                const updated = typeof newFilesOrFn === 'function' ? newFilesOrFn(cloudFiles) : newFilesOrFn;
                setCloudFiles((updated || []).map((f) => ({ ...f, updatedAt: f.updatedAt || Date.now(), deleted: Boolean(f.deleted) })));
              }}
              currentUser={currentUser}
              isAdmin={currentUser?.role === 'admin'}
              backendConfig={backendConfig}
              t={t}
            />
          )}

          {activeTab === 'download' && (
            <DownloaderView currentUser={currentUser} t={t} />
          )}

          {activeTab === 'gallery' && (
            <GalleryView
              photos={photos.filter((p) => !p.deleted)}
              setPhotos={(newPhotosOrFn) => {
                const updated = typeof newPhotosOrFn === 'function' ? newPhotosOrFn(photos) : newPhotosOrFn;
                setPhotos((updated || []).map((p) => ({ ...p, updatedAt: p.updatedAt || Date.now(), deleted: Boolean(p.deleted) })));
              }}
              currentUser={currentUser}
              isAdmin={currentUser?.role === 'admin'}
              t={t}
            />
          )}

          {activeTab === 'media' && (
            <MediaPlayerView
              currentUser={currentUser}
              isAdmin={currentUser?.role === 'admin'}
              mediaList={mediaList.filter((m) => !m.deleted)}
              setMediaList={(newMediaOrFn) => {
                const updated = typeof newMediaOrFn === 'function' ? newMediaOrFn(mediaList) : newMediaOrFn;
                setMediaList((updated || []).map((m) => ({ ...m, updatedAt: m.updatedAt || Date.now(), deleted: Boolean(m.deleted) })));
              }}
              cloudFiles={cloudFiles.filter((f) => !f.deleted)}
              setCloudFiles={setCloudFiles}
              t={t}
            />
          )}

          {activeTab === 'admin-portal' && currentUser?.role === 'admin' && (
            <AdminFileAndPortalView
              currentUser={currentUser}
              isAdmin={currentUser?.role === 'admin'}
              cloudFiles={cloudFiles.filter((f) => !f.deleted)}
              setCloudFiles={setCloudFiles}
              t={t}
            />
          )}

          {activeTab === 'bookmarks' && (
            <BrowserAndBookmarksView
              bookmarks={bookmarks.filter((b) => !b.deleted)}
              setBookmarks={(newBookmarksOrFn) => {
                const updated = typeof newBookmarksOrFn === 'function' ? newBookmarksOrFn(bookmarks) : newBookmarksOrFn;
                setBookmarks((updated || []).map((b) => ({ ...b, updatedAt: b.updatedAt || Date.now(), deleted: Boolean(b.deleted) })));
              }}
              currentUser={currentUser}
              isAdmin={currentUser?.role === 'admin'}
              searchProxy={searchProxy}
              setSearchProxy={setSearchProxy}
              t={t}
            />
          )}

          {activeTab === 'guide' && (
            <DeploymentGuideView siteName={siteName} t={t} />
          )}

          {activeTab === 'admin' && currentUser?.role === 'admin' && (
            <AdminSettingsView
              siteName={siteName}
              setSiteName={setSiteName}
              siteLayout={siteLayout}
              setSiteLayout={setSiteLayout}
              fontSize={fontSize}
              setFontSize={setFontSize}
              lang={lang}
              setLang={setLang}
              appearance={appearance}
              setAppearance={setAppearance}
              systemSettings={systemSettings}
              setSystemSettings={setSystemSettings}
              emailSettings={emailSettings}
              setEmailSettings={setEmailSettings}
              users={users}
              setUsers={setUsers}
              cloudConfig={cloudConfig}
              setCloudConfig={setCloudConfig}
              backendConfig={backendConfig}
              setBackendConfig={setBackendConfig}
              currentTheme={currentTheme}
              setCurrentTheme={(th) => {
                setThemeId(th.id);
                setAppearance((prev) => ({ ...prev, themeId: th.id }));
              }}
              currentUser={currentUser}
              posts={posts}
              setPosts={setPosts}
              books={books}
              setBooks={setBooks}
              photos={photos}
              setPhotos={setPhotos}
              mediaList={mediaList}
              setMediaList={setMediaList}
              cloudFiles={cloudFiles}
              setCloudFiles={setCloudFiles}
              bookmarks={bookmarks}
              setBookmarks={setBookmarks}
              browsingHistory={browsingHistory}
              setBrowsingHistory={setBrowsingHistory}
              heroIntro={heroIntro}
              setHeroIntro={setHeroIntro}
              autoSyncEnabled={autoSyncEnabled}
              setAutoSyncEnabled={(val) => {
                setAutoSyncEnabled(val);
                localStorage.setItem('wf_auto_sync_enabled', val ? 'true' : 'false');
              }}
              syncStatus={syncStatus}
              syncRoomKey={syncRoomKey}
              setSyncRoomKey={(newKey) => {
                const applied = setSyncRoomKeyPreference(newKey);
                setSyncRoomKey(applied);
              }}
              onTriggerPush={() => executePushToCloud(true)}
              t={t}
            />
          )}
        </main>

        {/* Footer */}
        <footer className={`mt-16 border-t ${darkMode ? 'border-slate-800 bg-slate-900/80 text-slate-400' : 'border-slate-200/80 bg-white/60 text-slate-500'} backdrop-blur-md py-8`}>
          <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
            <p className="text-xs font-medium capitalize">
              {siteName} 博客系统 · 翡翠绿与纯白新纪元 | 多云边缘部署 Cloudflare Pages & 腾讯云 & 阿里云
            </p>
            <p className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} {siteName} Blog. Powered by Cloudflare Pages Functions, D1, R2, COS & OSS.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
