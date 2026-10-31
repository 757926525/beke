import React from 'react';
import {
  Sparkles,
  BookOpen,
  Library,
  Image,
  Music,
  Compass,
  Download,
  Cloud,
  Shield,
  Sun,
  Moon,
  User,
  LogOut,
  FolderSync
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  currentUser,
  onOpenAuth,
  onLogout,
  onSyncD1,
  isSyncing
}) {
  const navItems = [
    { id: 'blog', label: '博客文章', icon: BookOpen },
    { id: 'bookshelf', label: '藏书阁', icon: Library },
    { id: 'gallery', label: '光影相册', icon: Image },
    { id: 'media', label: '留声影音', icon: Music },
    { id: 'browser', label: '探索与收藏', icon: Compass },
    { id: 'downloader', label: '云端下载', icon: Download },
    { id: 'cloud', label: '网盘与多云', icon: Cloud },
    { id: 'admin', label: '系统管理', icon: Shield }
  ];

  return (
    <header className="sticky top-0 z-50 glass-nav transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('blog')}
          >
            <div className="w-10 h-10 rounded-2xl fox-gradient flex items-center justify-center text-white shadow-md cyber-fox-glow transform group-hover:scale-105 transition-all">
              <span className="font-serif-sc font-bold text-xl">狐</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-sc text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  白狐博客
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-mono font-medium">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans hidden sm:block">
                WhiteFox · 优雅全能数字知识枢纽
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-500' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick D1 Sync Button */}
            <button
              onClick={onSyncD1}
              disabled={isSyncing}
              title="一键同步至 Cloudflare D1 分布式数据库"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-500 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              <FolderSync className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-rose-500' : ''}`} />
              <span>{isSyncing ? '同步中...' : 'D1同步'}</span>
            </button>

            {/* Dark Mode Switch */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="切换明暗主题"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* User Account / Auth */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 flex items-center justify-center font-bold text-xs">
                    {currentUser.username[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:inline-block max-w-[80px] truncate">{currentUser.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  title="登出账号"
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold fox-gradient text-white shadow-sm hover:opacity-95 transition-opacity"
              >
                <User className="w-3.5 h-3.5" />
                <span>登录 / 注册</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2.5 gap-2 border-t border-slate-200/50 dark:border-slate-800/50 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
