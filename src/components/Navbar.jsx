import React, { useState } from 'react';
import {
  BookOpen, Library, Image as ImageIcon, Music, Compass,
  Download, Cloud, Shield, Globe, Smartphone, Monitor, LogIn,
  LogOut, Palette, ChevronDown, Check, Rocket
} from 'lucide-react';
import { languages, themePresets, translations } from '../services/i18nAndTheme';

export const Navbar = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  lang,
  setLang,
  currentTheme,
  setCurrentTheme,
  deviceMode,
  setDeviceMode,
  onSyncD1,
  avatarImage,
  t
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  // Internationalized texts
  const currentDict = translations[lang] || translations['zh-CN'];

  // Base tabs for all users
  const baseTabs = [
    { id: 'home', label: currentDict.blog || '博客文章', icon: BookOpen },
    { id: 'guide', label: currentDict.deploymentGuide || '部署与指南', icon: Rocket },
    { id: 'books', label: currentDict.bookshelf || '藏书阁', icon: Library },
    { id: 'gallery', label: currentDict.gallery || '光影视界', icon: ImageIcon },
    { id: 'media', label: currentDict.player || '媒体影音', icon: Music },
    { id: 'bookmarks', label: currentDict.bookmarks || '探索与收藏', icon: Compass },
    { id: 'download', label: currentDict.downloader || '云端下载', icon: Download },
  ];

  // Admin-only tabs (Notice: ONLY visible if currentUser.role === 'admin')
  const adminTabs = [
    { id: 'cloud', label: currentDict.cloud || '网盘与多云', icon: Cloud },
    { id: 'admin', label: currentDict.admin || '系统管理', icon: Shield }
  ];

  const visibleTabs = currentUser?.role === 'admin'
    ? [...baseTabs, ...adminTabs]
    : baseTabs;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-xs flex items-center justify-center transition-transform group-hover:scale-105 border border-slate-200 bg-emerald-50">
              {avatarImage ? (
                <img src={avatarImage} alt="Fox Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">🦊</span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight">
                  {currentDict.appName}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  v2.0 · 绿与白
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {currentDict.subtitle}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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
          </nav>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2">
            {/* Quick Theme Presets Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setThemeMenuOpen(!themeMenuOpen);
                  setLangMenuOpen(false);
                }}
                title={currentDict.theme}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center"
              >
                <Palette className="w-4 h-4 text-emerald-600" />
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-xs font-semibold text-slate-400 border-b border-slate-100 mb-1">
                    {currentDict.theme}
                  </div>
                  {themePresets.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => {
                        setCurrentTheme(th);
                        setThemeMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: th.primary }} />
                        <span className={currentTheme.id === th.id ? 'font-bold text-slate-900' : ''}>
                          {th.name}
                        </span>
                      </div>
                      {currentTheme.id === th.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangMenuOpen(!langMenuOpen);
                  setThemeMenuOpen(false);
                }}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center space-x-1"
                title="选择语言 / Language"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">
                  {languages.find((l) => l.code === lang)?.flag || '🌐'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
                  <div className="px-3 py-1 text-xs font-semibold text-slate-400 border-b border-slate-100 mb-1">
                    Language / 语言
                  </div>
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLang(item.code);
                        setLangMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span>
                        {item.flag} {item.label}
                      </span>
                      {lang === item.code && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cloudflare D1 Sync Button */}
            <button
              onClick={onSyncD1}
              title={currentDict.syncD1}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center space-x-1"
            >
              <Cloud className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">{currentDict.syncD1}</span>
            </button>

            {/* User Profile / Admin Switcher */}
            <div className="flex items-center space-x-2 pl-1">
              <button
                onClick={() => {
                  // Quick toggle between admin & member for testing access control
                  const nextRole = currentUser.role === 'admin' ? 'member' : 'admin';
                  setCurrentUser({
                    ...currentUser,
                    role: nextRole,
                    username: nextRole === 'admin' ? '白狐 (站长)' : '访客小狐'
                  });
                }}
                className={`text-xs font-semibold px-2.5 py-1 rounded-xl border flex items-center space-x-1 transition-all ${
                  currentUser.role === 'admin'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title="点击切换角色权限 (站长管理员 / 普通访客)"
              >
                <span>{currentUser.username}</span>
                {currentUser.role === 'admin' && (
                  <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                    {currentDict.adminBadge}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Scrolling Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-1 no-scrollbar border-t border-slate-100">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? currentTheme.navActive
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
