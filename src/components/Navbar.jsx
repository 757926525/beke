import React, { useState } from 'react';
import {
  BookOpen, Library, Image as ImageIcon, Music, Compass,
  Download, Cloud, Shield, Moon, Sun, LogIn, LogOut,
  ChevronDown, ChevronUp, Rocket, Bell, Check, X
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
  systemSettings,
  t
}) => {
  // Message Center Modal & Indicator State
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [hasUnreadMessage, setHasUnreadMessage] = useState(true);

  // Load system announcements from storage
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_user_messages');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'msg-1',
        title: '白狐系统多云全息双向同步与免库边缘运行说明',
        content: '欢迎使用白狐数字空间，本站已支持 Cloudflare Pages 边缘实时同步、网盘调度与多云对象存储！',
        author: '唯一站长 (Administrator)',
        date: '2025-05-18',
        target: 'all'
      }
    ];
  });

  // Navigation tabs - check if guest non-blog tabs are hidden
  const hideNonBlogForGuests = !currentUser && systemSettings?.hideNonBlogForGuests;

  const baseTabs = [{ id: 'home', label: t('blog'), icon: BookOpen }];

  if (!hideNonBlogForGuests) {
    baseTabs.push(
      { id: 'books', label: t('bookshelf'), icon: Library },
      { id: 'cloud', label: t('cloud'), icon: Cloud },
      { id: 'shop', label: t('shop'), icon: BookOpen },
      { id: 'gallery', label: t('gallery'), icon: ImageIcon },
      { id: 'media', label: t('player'), icon: Music }
    );
  }

  if (currentUser?.role === 'admin') {
    baseTabs.push({ id: 'admin-portal', label: t('adminPortal'), icon: Shield, badge: '专属' });
  }

  if (!hideNonBlogForGuests) {
    baseTabs.push(
      { id: 'bookmarks', label: t('bookmarks'), icon: Compass }
    );
  }

  // 全能数据库后台、系统设置与部署指南仅管理员可见
  if (currentUser?.role === 'admin') {
    baseTabs.push({ id: 'admin', label: t('admin'), icon: Shield });
  }

  const handleOpenMessages = () => {
    setShowMessageCenter(true);
    setHasUnreadMessage(false);
    try {
      const saved = localStorage.getItem('wf_user_messages');
      if (saved) setMessages(JSON.parse(saved));
    } catch (e) {}
  };

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

                {/* Replaced '博客系统' with Message Viewing Button & Status LED */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenMessages();
                  }}
                  className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                  title="点击查看站长消息与全站通知"
                >
                  {/* Status LED: Green when read/idle, pulsating amber/red when unread */}
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hasUnreadMessage
                        ? 'bg-amber-500 animate-pulse ring-2 ring-amber-300'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span>消息中心</span>
                  <Bell className="w-3 h-3 text-emerald-700" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                优雅多云架构 · 白狐极简数字空间
              </p>
            </div>
          </div>

          {/* Clean Top Action Bar: Only Avatar/User, DarkMode, Logout / Login, and Collapse Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
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

      {/* Message Viewing Modal (站长消息与通知查看窗口) */}
      {showMessageCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">站长消息与通知中心</h3>
                  <p className="text-[10px] text-slate-400">来自站长给注册成员与访客的即时公告</p>
                </div>
              </div>
              <button
                onClick={() => setShowMessageCenter(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">暂无站长消息通知</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{m.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{m.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                      {m.content}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>发件人: {m.author}</span>
                      <span className="text-emerald-600 font-semibold">状态: 已接收送达</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">提示：注册用户可实时接收站长独家技术通知与版本更新</span>
              <button
                onClick={() => setShowMessageCenter(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
