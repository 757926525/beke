import React, { useState } from 'react';
import {
  BookOpen, Library, Image as ImageIcon, Music,
  Cloud, Shield, Moon, Sun, LogIn, LogOut,
  ChevronDown, ChevronUp, RefreshCw, Sparkles, Mail, ShoppingBag
} from 'lucide-react';

export const Navbar = ({
  siteName = 'fox',
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenAuth,
  darkMode,
  setDarkMode,
  avatarImage,
  headerCollapsed,
  setHeaderCollapsed,
  currentTheme,
  onManualSync,
  isSyncing,
  systemSettings,
  t
}) => {
  // Navigation tabs - 隐私开关模式下未登录访客仅展示博客文章
  const isGuestRestricted = Boolean(systemSettings?.hideNonBlogForGuests && !currentUser);

  const baseTabs = [
    { id: 'home', label: t('blog'), icon: BookOpen }
  ];

  if (!isGuestRestricted) {
    baseTabs.push(
      { id: 'books', label: t('bookshelf'), icon: Library },
      { id: 'gallery', label: t('gallery'), icon: ImageIcon },
      { id: 'media', label: t('player'), icon: Music },
      { id: 'shop', label: '商品周边', icon: ShoppingBag }
    );
  }

  // AI 编程区与智能信件管理区严格仅管理员可见
  if (currentUser?.role === 'admin') {
    baseTabs.push(
      { id: 'ai-coding', label: 'AI编程', icon: Sparkles },
      { id: 'mail-hub', label: '信件中心', icon: Mail }
    );
  }

  // 全能数据库后台与系统设置仅管理员可见
  if (currentUser?.role === 'admin') {
    baseTabs.push({ id: 'admin', label: t('admin'), icon: Shield });
  }

  const tabs = baseTabs;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name (Fox) */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-xs flex items-center justify-center transition-transform group-hover:scale-105 border border-slate-200 bg-emerald-50">
              {avatarImage ? (
                <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">🦊</span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight capitalize">
                  {siteName}
                </span>
                {/* 页眉博客系统四个字改为同步状态灯 */}
                <span
                  className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                  title="云端自动同步状态正常"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>同步就绪</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                优雅多云架构 · 白狐极简数字空间
              </p>
            </div>
          </div>

          {/* Clean Top Action Bar: Only Avatar/User, DarkMode, Logout / Login, and Collapse Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* 页眉增加手动同步按钮 */}
            {onManualSync && (
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                title="手动执行全站云端同步"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">手动同步</span>
              </button>
            )}

            {/* Header Collapse / Expand Toggle Button */}
            <button
              onClick={() => setHeaderCollapsed(!headerCollapsed)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center space-x-1 cursor-pointer"
              title={headerCollapsed ? '展开' : '收起'}
            >
              {headerCollapsed ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-semibold hidden sm:inline">展开</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-semibold hidden sm:inline">收起</span>
                </>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
              title={darkMode ? '切换至日间模式' : '切换至夜间模式'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Profile Avatar & Role Badge */}
            {currentUser ? (
              <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
                <div
                  onClick={() => setActiveTab('admin')}
                  className="flex items-center space-x-2 cursor-pointer p-1 rounded-xl hover:bg-slate-50 transition-colors"
                  title="点击进入设置与管理"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-400/60 bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-800">
                    {avatarImage ? (
                      <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      currentUser.username[0]?.toUpperCase() || '狐'
                    )}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser.username}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {currentUser.role === 'admin' ? '系统站长' : '注册成员'}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                  title={t('logout')}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('logout')}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-xs transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('login')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Navigation Menu Bar */}
        {!headerCollapsed && (
          <div className="py-2.5 border-t border-slate-100 overflow-x-auto no-scrollbar flex items-center space-x-1 transition-all duration-300">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? currentTheme.navActive
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-current' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
