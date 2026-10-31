import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BlogList } from './components/BlogList';
import { BlogPostView } from './components/BlogPostView';
import { NetDriveView } from './components/NetDriveView';
import { BookshelfView } from './components/BookshelfView';
import { GalleryView } from './components/GalleryView';
import { BrowserAndBookmarksView } from './components/BrowserAndBookmarksView';
import { MediaPlayerView } from './components/MediaPlayerView';
import { DownloaderView } from './components/DownloaderView';
import { DeploymentGuideView } from './components/DeploymentGuideView';
import { AdminSettingsView } from './components/AdminSettingsView';
import {
  initialPosts,
  initialBooks,
  initialBookmarks,
  initialCloudConfig,
  initialCloudFiles,
  initialUsers,
  defaultAppearance,
  defaultSystemSettings,
  defaultSearchProxy,
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS
} from './services/storageService';
import { getTranslation, themePresets } from './services/i18nAndTheme';
import { Smartphone, Monitor } from 'lucide-react';

export function App() {
  // Navigation & Role States
  const [activeTab, setActiveTab] = useState('home');
  const [activePostId, setActivePostId] = useState(null);
  const [currentUser, setCurrentUser] = useState(() =>
    loadFromStorage(STORAGE_KEYS.AUTH, {
      role: 'admin',
      username: '白狐 (站长)'
    })
  );

  // Internationalization & Theme
  const [lang, setLang] = useState(() => loadFromStorage(STORAGE_KEYS.LANG, 'zh-CN'));
  const [themeId, setThemeId] = useState(() => loadFromStorage(STORAGE_KEYS.THEME, 'emerald-white'));
  const [appearance, setAppearance] = useState(() => loadFromStorage(STORAGE_KEYS.APPEARANCE, defaultAppearance));
  const [systemSettings, setSystemSettings] = useState(() => loadFromStorage(STORAGE_KEYS.SYSTEM_SETTINGS, defaultSystemSettings));
  const [searchProxy, setSearchProxy] = useState(() => loadFromStorage(STORAGE_KEYS.SEARCH_PROXY, defaultSearchProxy));

  // Device view simulation (desktop vs mobile viewport)
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop' | 'mobile'

  // Application Data States
  const [posts, setPosts] = useState(() => loadFromStorage(STORAGE_KEYS.POSTS, initialPosts));
  const [books, setBooks] = useState(() => loadFromStorage(STORAGE_KEYS.BOOKS, initialBooks));
  const [bookmarks, setBookmarks] = useState(() => loadFromStorage(STORAGE_KEYS.BOOKMARKS, initialBookmarks));
  const [cloudConfig, setCloudConfig] = useState(() => loadFromStorage(STORAGE_KEYS.CLOUD_CONFIG, initialCloudConfig));
  const [cloudFiles, setCloudFiles] = useState(() => loadFromStorage(STORAGE_KEYS.CLOUD_FILES, initialCloudFiles));
  const [users, setUsers] = useState(() => loadFromStorage(STORAGE_KEYS.USERS, initialUsers));

  // Persist States
  useEffect(() => saveToStorage(STORAGE_KEYS.AUTH, currentUser), [currentUser]);
  useEffect(() => saveToStorage(STORAGE_KEYS.LANG, lang), [lang]);
  useEffect(() => saveToStorage(STORAGE_KEYS.THEME, themeId), [themeId]);
  useEffect(() => saveToStorage(STORAGE_KEYS.APPEARANCE, appearance), [appearance]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SYSTEM_SETTINGS, systemSettings), [systemSettings]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SEARCH_PROXY, searchProxy), [searchProxy]);
  useEffect(() => saveToStorage(STORAGE_KEYS.POSTS, posts), [posts]);
  useEffect(() => saveToStorage(STORAGE_KEYS.BOOKS, books), [books]);
  useEffect(() => saveToStorage(STORAGE_KEYS.BOOKMARKS, bookmarks), [bookmarks]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CLOUD_CONFIG, cloudConfig), [cloudConfig]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CLOUD_FILES, cloudFiles), [cloudFiles]);
  useEffect(() => saveToStorage(STORAGE_KEYS.USERS, users), [users]);

  // Current active theme object
  const currentTheme = themePresets.find((t) => t.id === themeId) || themePresets[0];

  // Helper translation function
  const t = (key) => getTranslation(lang, key);

  // Cloudflare D1 Sync simulation
  const handleSyncD1 = () => {
    alert('正在与 Cloudflare D1 边缘节点执行全域双向同步...\n\n- 文章库: 同步成功\n- 藏书阁: 同步成功\n- 网址导航: 同步成功\n- 对象存储与网盘配置: 同步成功\n\n边缘数据库状态：已就绪 (Zero-latency Active)');
  };

  // If a non-admin attempts to view admin-only tab, redirect
  useEffect(() => {
    if (currentUser.role !== 'admin' && (activeTab === 'admin' || activeTab === 'cloud')) {
      setActiveTab('home');
    }
  }, [currentUser, activeTab]);

  const activePost = posts.find((p) => p.id === activePostId);

  return (
    <div
      className="min-h-screen font-sans transition-colors duration-300 relative text-slate-800"
      style={{
        backgroundColor: appearance.bgColor || '#f8fafc',
        backgroundImage: appearance.bgImage ? `url(${appearance.bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      {/* Device Mode Switch Overlay (Bottom Floating) */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center bg-white/90 backdrop-blur-md rounded-full border border-slate-200/80 p-1 shadow-lg">
        <button
          onClick={() => setDeviceMode('desktop')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            deviceMode === 'desktop'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="切换至电脑桌面模式"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">电脑宽屏</span>
        </button>
        <button
          onClick={() => setDeviceMode('mobile')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            deviceMode === 'mobile'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="切换至手机界面模拟视口"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">手机视图</span>
        </button>
      </div>

      {/* Main Container Wrapper - If mobile view simulated, constrain width like a modern phone */}
      <div
        className={`mx-auto transition-all duration-300 ${
          deviceMode === 'mobile'
            ? 'max-w-[420px] my-6 border-[8px] border-slate-800 rounded-[44px] shadow-2xl overflow-hidden bg-white/95 min-h-[840px]'
            : 'w-full'
        }`}
      >
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setActivePostId(null);
          }}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          lang={lang}
          setLang={setLang}
          currentTheme={currentTheme}
          setCurrentTheme={(th) => {
            setThemeId(th.id);
            setAppearance((prev) => ({ ...prev, themeId: th.id }));
          }}
          deviceMode={deviceMode}
          setDeviceMode={setDeviceMode}
          onSyncD1={handleSyncD1}
          t={t}
        />

        {/* Hero Section if on Home */}
        {activeTab === 'home' && !activePostId && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 sm:p-10 shadow-lg">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-medium mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <span>白狐技术空间 · 翡翠绿与纯白质感</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  极简、敏捷与无限可能的云端博客
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
                    onClick={() => setActiveTab('bookmarks')}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all border border-white/20"
                  >
                    网址导航与站内浏览器
                  </button>
                </div>
              </div>

              {/* Decorative Hero Image */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
                <img
                  src={appearance.heroImage || 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80'}
                  alt="Hero Decoration"
                  className="w-full h-full object-cover"
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
              isAdmin={currentUser.role === 'admin'}
              t={t}
            />
          )}

          {activeTab === 'home' && activePostId && activePost && (
            <BlogPostView
              post={activePost}
              onBack={() => setActivePostId(null)}
              currentUser={currentUser}
              onAddComment={(comment) => {
                const updated = posts.map((p) =>
                  p.id === activePost.id
                    ? { ...p, comments: [...(p.comments || []), comment] }
                    : p
                );
                setPosts(updated);
              }}
              t={t}
            />
          )}

          {activeTab === 'guide' && <DeploymentGuideView t={t} />}

          {activeTab === 'books' && <BookshelfView books={books} setBooks={setBooks} t={t} />}

          {activeTab === 'gallery' && <GalleryView t={t} />}

          {activeTab === 'bookmarks' && (
            <BrowserAndBookmarksView
              bookmarks={bookmarks}
              setBookmarks={setBookmarks}
              searchProxy={searchProxy}
              setSearchProxy={setSearchProxy}
              t={t}
            />
          )}

          {activeTab === 'media' && <MediaPlayerView t={t} />}

          {activeTab === 'download' && <DownloaderView t={t} />}

          {/* Admin Only Tabs */}
          {activeTab === 'cloud' && currentUser.role === 'admin' && (
            <NetDriveView
              cloudConfig={cloudConfig}
              setCloudConfig={setCloudConfig}
              cloudFiles={cloudFiles}
              setCloudFiles={setCloudFiles}
              t={t}
            />
          )}

          {activeTab === 'admin' && currentUser.role === 'admin' && (
            <AdminSettingsView
              appearance={appearance}
              setAppearance={setAppearance}
              systemSettings={systemSettings}
              setSystemSettings={setSystemSettings}
              cloudFiles={cloudFiles}
              setCloudFiles={setCloudFiles}
              users={users}
              setUsers={setUsers}
              cloudConfig={cloudConfig}
              setCloudConfig={setCloudConfig}
              onSyncD1={handleSyncD1}
              currentTheme={currentTheme}
              setCurrentTheme={(th) => {
                setThemeId(th.id);
                setAppearance((prev) => ({ ...prev, themeId: th.id }));
              }}
              t={t}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-200/80 bg-white/60 backdrop-blur-md py-8">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
            <p className="text-xs text-slate-500 font-medium">
              白狐博客系统 · 翡翠绿与纯白新纪元 | 多云边缘部署 Cloudflare Pages & 腾讯云 & 阿里云
            </p>
            <p className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} WhiteFox Blog. Powered by Cloudflare D1, R2, COS & OSS.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
