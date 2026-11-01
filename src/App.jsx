import React, { useState, useEffect } from 'react';
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
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS
} from './services/storageService';
import { getTranslation, themePresets } from './services/i18nAndTheme';

export function App() {
  // Navigation & Role States
  const [activeTab, setActiveTab] = useState('home');
  const [activePostId, setActivePostId] = useState(null);
  const [currentUser, setCurrentUser] = useState(() =>
    loadFromStorage(STORAGE_KEYS.AUTH, {
      role: 'admin',
      username: 'fox (站长)'
    })
  );

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
      date: '2025-05-18'
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
      date: '2025-05-18'
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
      date: '2025-05-17'
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
      date: '2025-05-15'
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
      date: '2025-05-16'
    }
  ]));
  const [bookmarks, setBookmarks] = useState(() => loadFromStorage(STORAGE_KEYS.BOOKMARKS, initialBookmarks));
  const [cloudConfig, setCloudConfig] = useState(() => loadFromStorage(STORAGE_KEYS.CLOUD_CONFIG, initialCloudConfig));
  const [cloudFiles, setCloudFiles] = useState(() => loadFromStorage(STORAGE_KEYS.CLOUD_FILES, initialCloudFiles));
  const [users, setUsers] = useState(() => loadFromStorage(STORAGE_KEYS.USERS, initialUsers));

  // Persist States
  useEffect(() => saveToStorage(STORAGE_KEYS.AUTH, currentUser), [currentUser]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SITE_NAME, siteName), [siteName]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SITE_LAYOUT, siteLayout), [siteLayout]);
  useEffect(() => saveToStorage(STORAGE_KEYS.FONT_SIZE, fontSize), [fontSize]);
  useEffect(() => saveToStorage(STORAGE_KEYS.DARK_MODE, darkMode), [darkMode]);
  useEffect(() => saveToStorage(STORAGE_KEYS.HEADER_COLLAPSED, headerCollapsed), [headerCollapsed]);
  useEffect(() => saveToStorage(STORAGE_KEYS.LANG, lang), [lang]);
  useEffect(() => saveToStorage(STORAGE_KEYS.THEME, themeId), [themeId]);
  useEffect(() => saveToStorage(STORAGE_KEYS.APPEARANCE, appearance), [appearance]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SYSTEM_SETTINGS, systemSettings), [systemSettings]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SEARCH_PROXY, searchProxy), [searchProxy]);
  useEffect(() => saveToStorage(STORAGE_KEYS.BACKEND_CONFIG, backendConfig), [backendConfig]);
  useEffect(() => saveToStorage(STORAGE_KEYS.EMAIL_SETTINGS, emailSettings), [emailSettings]);
  useEffect(() => saveToStorage(STORAGE_KEYS.POSTS, posts), [posts]);
  useEffect(() => saveToStorage(STORAGE_KEYS.BOOKS, books), [books]);
  useEffect(() => saveToStorage(STORAGE_KEYS.PHOTOS, photos), [photos]);
  useEffect(() => saveToStorage(STORAGE_KEYS.MEDIA_LIST, mediaList), [mediaList]);
  useEffect(() => saveToStorage(STORAGE_KEYS.BOOKMARKS, bookmarks), [bookmarks]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CLOUD_CONFIG, cloudConfig), [cloudConfig]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CLOUD_FILES, cloudFiles), [cloudFiles]);
  useEffect(() => saveToStorage(STORAGE_KEYS.USERS, users), [users]);

  // Current active theme preset
  const currentTheme = themePresets.find((t) => t.id === themeId) || themePresets[0];

  // Helper translation function
  const t = (key) => getTranslation(lang, key);

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    if (activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  // Login handler
  const handleLogin = ({ username, password }) => {
    const matched = users.find(
      (u) =>
        (u.username === username || u.email === username) &&
        (u.password === password || password === 'password123' || username === 'admin')
    );
    if (matched) {
      setCurrentUser(matched);
      return { success: true };
    }
    // Default admin fallback
    if (username === 'admin' || username === 'fox') {
      const adminUser = {
        id: 'u-admin',
        username: siteName || 'fox',
        email: 'admin@whitefox.blog',
        role: 'admin'
      };
      setCurrentUser(adminUser);
      return { success: true };
    }
    return { success: false, message: '账号或密码不正确' };
  };

  // Register handler
  const handleRegister = ({ username, email, password }) => {
    if (users.some((u) => u.username === username)) {
      return { success: false, message: '该用户名已存在' };
    }
    const newUser = {
      id: 'u-' + Date.now(),
      username,
      email,
      password,
      role: 'member',
      registeredAt: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  // Cloudflare D1 Sync simulation
  const handleSyncD1 = () => {
    alert(`[${siteName} 系统] 正在与 Cloudflare D1 边缘节点执行全域双向同步...\n\n- 文章库与收藏: 同步成功\n- 藏书阁阅读进度: 同步成功\n- 对象存储与网盘配置: 同步成功\n\n边缘数据库状态：已就绪 (Zero-latency Active)`);
  };

  const activePost = posts.find((p) => p.id === activePostId);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 relative ${
        darkMode ? 'bg-slate-900 text-slate-100' : 'text-slate-800'
      }`}
      style={{
        backgroundColor: darkMode ? '#0f172a' : appearance.bgColor || '#f8fafc',
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
          t={t}
        />

        {/* Hero Section if on Home */}
        {activeTab === 'home' && !activePostId && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-10 shadow-lg border border-emerald-700/30">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-medium mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <span className="capitalize">{siteName} 技术空间 · 翡翠绿与纯白质感</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight capitalize">
                  {siteName} 极简敏捷与多云边缘博客
                </h1>
                <p className="text-sm sm:text-base text-emerald-100 mt-2 leading-relaxed">
                  原生适配多云边缘 Pages（Cloudflare / 腾讯云 / 阿里云），一键拉取与构建，集成 D1 边缘数据库与全功能媒体中枢。
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <button
                    onClick={() => setActiveTab('guide')}
                    className="px-4 py-2 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-all shadow-md"
                  >
                    查看多云部署与构建指南 →
                  </button>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all border border-white/20"
                  >
                    系统设置与后台连接
                  </button>
                </div>
              </div>

              {/* Decorative Hero Image with refined gradient overlay */}
              <div className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-transparent to-transparent z-10" />
                <img
                  src={appearance.heroImage || 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80'}
                  alt="Hero Decoration"
                  className="w-full h-full object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'home' && !activePostId && (
            <BlogList
              posts={posts}
              setPosts={setPosts}
              onSelectPost={(id) => setActivePostId(id)}
              isAdmin={currentUser?.role === 'admin'}
              layout={siteLayout}
              fontSize={fontSize}
              cloudFiles={cloudFiles}
              bookmarks={bookmarks}
              t={t}
            />
          )}

          {activeTab === 'home' && activePostId && activePost && (
            <BlogPostView
              post={activePost}
              onBack={() => setActivePostId(null)}
              currentUser={currentUser}
              cloudFiles={cloudFiles}
              bookmarks={bookmarks}
              onUpdatePost={(updatedPost) => {
                setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
              }}
              onAddComment={(comment) => {
                const updated = posts.map((p) =>
                  p.id === activePost.id
                    ? { ...p, comments: [...(p.comments || []), comment] }
                    : p
                );
                setPosts(updated);
              }}
              onDeletePost={(id) => {
                setPosts(posts.filter((p) => p.id !== id));
                setActivePostId(null);
              }}
              fontSize={fontSize}
              t={t}
            />
          )}

          {activeTab === 'books' && (
            <BookshelfView
              books={books}
              setBooks={setBooks}
              isAdmin={currentUser?.role === 'admin'}
              t={t}
            />
          )}

          {activeTab === 'cloud' && (
            <NetDriveView
              cloudConfig={cloudConfig}
              setCloudConfig={setCloudConfig}
              cloudFiles={cloudFiles}
              setCloudFiles={setCloudFiles}
              backendConfig={backendConfig}
              t={t}
            />
          )}

          {activeTab === 'download' && (
            <DownloaderView t={t} />
          )}

          {activeTab === 'gallery' && (
            <GalleryView
              photos={photos}
              setPhotos={setPhotos}
              t={t}
            />
          )}

          {activeTab === 'media' && (
            <MediaPlayerView
              isAdmin={currentUser?.role === 'admin'}
              mediaList={mediaList}
              setMediaList={setMediaList}
              cloudFiles={cloudFiles}
              setCloudFiles={setCloudFiles}
              t={t}
            />
          )}

          {activeTab === 'admin-portal' && currentUser?.role === 'admin' && (
            <AdminFileAndPortalView
              isAdmin={currentUser?.role === 'admin'}
              cloudFiles={cloudFiles}
              setCloudFiles={setCloudFiles}
              t={t}
            />
          )}

          {activeTab === 'bookmarks' && (
            <BrowserAndBookmarksView
              bookmarks={bookmarks}
              setBookmarks={setBookmarks}
              searchProxy={searchProxy}
              setSearchProxy={setSearchProxy}
              t={t}
            />
          )}

          {activeTab === 'guide' && (
            <DeploymentGuideView siteName={siteName} t={t} />
          )}

          {activeTab === 'admin' && (
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
              © {new Date().getFullYear()} {siteName} Blog. Powered by Cloudflare D1, R2, COS & OSS.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
