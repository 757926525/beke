import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BlogView from './components/BlogView';
import BookshelfView from './components/BookshelfView';
import GalleryView from './components/GalleryView';
import MediaPlayerView from './components/MediaPlayerView';
import BrowserAndBookmarksView from './components/BrowserAndBookmarksView';
import DownloaderView from './components/DownloaderView';
import CloudSyncView from './components/CloudSyncView';
import AdminSettingsView from './components/AdminSettingsView';
import AuthModal from './components/AuthModal';
import NewArticleModal from './components/NewArticleModal';

import { StorageService } from './services/storageService';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('blog');

  // Core Data States
  const [articles, setArticles] = useState(StorageService.getArticles);
  const [books, setBooks] = useState(StorageService.getBooks);
  const [photos, setPhotos] = useState(StorageService.getPhotos);
  const [playlist, setPlaylist] = useState(StorageService.getPlaylist);
  const [bookmarks, setBookmarks] = useState(StorageService.getBookmarks);
  const [zones, setZones] = useState(StorageService.getZones);
  const [downloads, setDownloads] = useState(StorageService.getDownloads);
  const [cloudConfig, setCloudConfig] = useState(StorageService.getCloudConfig);
  const [systemSettings, setSystemSettings] = useState(StorageService.getSystemSettings);
  const [users, setUsers] = useState(StorageService.getUsers);
  const [currentUser, setCurrentUser] = useState(StorageService.getCurrentUser);

  // Modals & Async States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNewArticleOpen, setIsNewArticleOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [globalBanner, setGlobalBanner] = useState(null);

  // Apply dark class to html document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync with D1 Database
  const handleSyncD1 = async () => {
    setIsSyncing(true);
    try {
      const res = await StorageService.syncWithD1();
      setGlobalBanner(`D1 数据库跨端同步已完成！已同步 ${res.recordsCount.articles} 篇文章、${res.recordsCount.bookmarks} 个书签及藏书`);
      setTimeout(() => setGlobalBanner(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  // 1-Click Bookmark for Articles
  const handleToggleArticleBookmark = (id) => {
    const updated = articles.map((a) =>
      a.id === id ? { ...a, isBookmarked: !a.isBookmarked } : a
    );
    setArticles(updated);
    StorageService.saveArticles(updated);
    const target = updated.find((a) => a.id === id);
    if (target?.isBookmarked) {
      StorageService.addHistory({ title: `收藏文章：${target.title}`, type: 'bookmark' });
    }
  };

  // Save new article
  const handleSaveArticle = (newArt) => {
    const updated = [newArt, ...articles];
    setArticles(updated);
    StorageService.saveArticles(updated);
    setGlobalBanner(`新文章《${newArt.title}》已成功发布并入库！`);
    setTimeout(() => setGlobalBanner(null), 3500);
  };

  // Bookshelf handlers
  const handleAddBook = (book) => {
    const updated = [book, ...books];
    setBooks(updated);
    StorageService.saveBooks(updated);
  };

  const handleRemoveBook = (id) => {
    const updated = books.filter((b) => b.id !== id);
    setBooks(updated);
    StorageService.saveBooks(updated);
  };

  // Gallery handlers
  const handleAddPhoto = (photo) => {
    const updated = [photo, ...photos];
    setPhotos(updated);
    StorageService.savePhotos(updated);
  };

  const handleRemovePhoto = (id) => {
    const updated = photos.filter((p) => p.id !== id);
    setPhotos(updated);
    StorageService.savePhotos(updated);
  };

  // Media Player handlers
  const handleAddMedia = (item) => {
    const updated = [item, ...playlist];
    setPlaylist(updated);
    StorageService.savePlaylist(updated);
  };

  const handleRemoveMedia = (id) => {
    const updated = playlist.filter((m) => m.id !== id);
    setPlaylist(updated);
    StorageService.savePlaylist(updated);
  };

  // Bookmarks handlers
  const handleAddBookmark = (bm) => {
    const updated = [bm, ...bookmarks];
    setBookmarks(updated);
    StorageService.saveBookmarks(updated);
    StorageService.addHistory({ title: `加入网络收藏：${bm.title}`, type: 'bookmark' });
  };

  const handleBatchAddBookmarks = (newItems) => {
    const updated = [...newItems, ...bookmarks];
    setBookmarks(updated);
    StorageService.saveBookmarks(updated);
  };

  const handleRemoveBookmark = (id) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    StorageService.saveBookmarks(updated);
  };

  // Downloads handlers
  const handleAddDownload = (dl) => {
    const updated = [dl, ...downloads];
    setDownloads(updated);
    StorageService.saveDownloads(updated);
  };

  const handleRemoveDownload = (id) => {
    const updated = downloads.filter((d) => d.id !== id);
    setDownloads(updated);
    StorageService.saveDownloads(updated);
  };

  // NetDrive Unified Save
  const handleSaveToNetDrive = async (item) => {
    return await StorageService.saveToNetDrive(item, cloudConfig.netDrive.targetFolder);
  };

  // Cloud Config Save
  const handleSaveCloudConfig = (cfg) => {
    setCloudConfig(cfg);
    StorageService.saveCloudConfig(cfg);
  };

  // System Settings Save
  const handleSaveSystemSettings = (stg) => {
    setSystemSettings(stg);
    StorageService.saveSystemSettings(stg);
  };

  // Auth
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user);
    setGlobalBanner(`欢迎回来，${user.username}！`);
    setTimeout(() => setGlobalBanner(null), 3000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    StorageService.setCurrentUser(null);
  };

  const handleRegisterUser = (newUser) => {
    const updated = [...users, newUser];
    setUsers(updated);
    StorageService.saveUsers(updated);
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onSyncD1={handleSyncD1}
        isSyncing={isSyncing}
      />

      {/* Global Sync Notification Banner */}
      {globalBanner && (
        <div className="bg-linear-to-r from-rose-500 to-indigo-600 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium shadow-sm transition-all flex items-center justify-center gap-2">
          <span>✨</span>
          <span>{globalBanner}</span>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'blog' && (
          <BlogView
            articles={articles}
            onToggleBookmark={handleToggleArticleBookmark}
            onSaveToNetDrive={handleSaveToNetDrive}
            onNewArticle={() => setIsNewArticleOpen(true)}
          />
        )}

        {activeTab === 'bookshelf' && (
          <BookshelfView
            books={books}
            onAddBook={handleAddBook}
            onRemoveBook={handleRemoveBook}
            onSaveToNetDrive={handleSaveToNetDrive}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryView
            photos={photos}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
            onSaveToNetDrive={handleSaveToNetDrive}
          />
        )}

        {activeTab === 'media' && (
          <MediaPlayerView
            playlist={playlist}
            onAddMedia={handleAddMedia}
            onRemoveMedia={handleRemoveMedia}
            onSaveToNetDrive={handleSaveToNetDrive}
          />
        )}

        {activeTab === 'browser' && (
          <BrowserAndBookmarksView
            bookmarks={bookmarks}
            zones={zones}
            onAddBookmark={handleAddBookmark}
            onRemoveBookmark={handleRemoveBookmark}
            onBatchAddBookmarks={handleBatchAddBookmarks}
          />
        )}

        {activeTab === 'downloader' && (
          <DownloaderView
            downloads={downloads}
            onAddDownload={handleAddDownload}
            onRemoveDownload={handleRemoveDownload}
            onSaveToNetDrive={handleSaveToNetDrive}
          />
        )}

        {activeTab === 'cloud' && (
          <CloudSyncView
            cloudConfig={cloudConfig}
            onSaveCloudConfig={handleSaveCloudConfig}
            onSyncD1={handleSyncD1}
            isSyncing={isSyncing}
          />
        )}

        {activeTab === 'admin' && (
          <AdminSettingsView
            systemSettings={systemSettings}
            onSaveSystemSettings={handleSaveSystemSettings}
            users={users}
          />
        )}
      </main>

      {/* Aesthetic Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg fox-gradient flex items-center justify-center text-white font-serif-sc font-bold">
              狐
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                白狐博客 (WhiteFox Blog)
              </p>
              <p>灵动美学 · 云边协同 · 优雅全能数字空间</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button onClick={() => setActiveTab('blog')} className="hover:text-rose-500">
              博客文章
            </button>
            <button onClick={() => setActiveTab('bookshelf')} className="hover:text-rose-500">
              藏书阁
            </button>
            <button onClick={() => setActiveTab('gallery')} className="hover:text-rose-500">
              光影相册
            </button>
            <button onClick={() => setActiveTab('browser')} className="hover:text-rose-500">
              探索与收藏
            </button>
            <button onClick={() => setActiveTab('cloud')} className="hover:text-rose-500">
              多云中枢
            </button>
          </div>

          <div className="text-right">
            <p>Cloudflare Pages · 腾讯云 · 阿里云多端快速就绪</p>
            <p className="font-mono text-[11px] text-slate-400">
              Zero Egress Fees · Serverless Ready
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        systemSettings={systemSettings}
        onLoginSuccess={handleLoginSuccess}
        onRegisterUser={handleRegisterUser}
      />

      <NewArticleModal
        isOpen={isNewArticleOpen}
        onClose={() => setIsNewArticleOpen(false)}
        onSave={handleSaveArticle}
      />
    </div>
  );
}
