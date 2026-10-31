import React, { useState } from 'react';
import {
  Compass, ExternalLink, BookmarkPlus, Search,
  ArrowRight, ShieldCheck, Power, Globe, Terminal, Lock
} from 'lucide-react';

export const BrowserAndBookmarksView = ({ bookmarks, setBookmarks, searchProxy, setSearchProxy, t }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [browserUrl, setBrowserUrl] = useState('https://developer.mozilla.org');
  const [currentFrameUrl, setCurrentFrameUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('tech');
  const [showAddModal, setShowAddModal] = useState(false);

  // In-app search proxy toggle
  const toggleProxy = () => {
    setSearchProxy((prev) => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  const handleNavigate = (e) => {
    e.preventDefault();
    if (!browserUrl) return;
    let target = browserUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    setCurrentFrameUrl(target);
  };

  const handleAddBookmark = (e) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;
    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const item = {
      id: 'bm-' + Date.now(),
      title: newTitle,
      url: url,
      category: newCategory,
      desc: '自定义添加的网址书签'
    };
    setBookmarks([item, ...bookmarks]);
    setNewTitle('');
    setNewUrl('');
    setShowAddModal(false);
  };

  const categories = [
    { id: 'all', name: '全部网址' },
    { id: 'cloud', name: '云平台控制台' },
    { id: 'tech', name: '技术与文档' },
    { id: 'tools', name: '实用工具' },
    { id: 'ai', name: 'AI 智能中枢' }
  ];

  const filteredBookmarks = activeCategory === 'all'
    ? bookmarks
    : bookmarks.filter((b) => b.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header and Proxy Gateway Controller */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>全域导航 · 跨界浏览器</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              网址导航与站内免代理浏览器
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              精选多云控制台与开发者站点，集成大陆直连搜索反代网关与内置浏览器沙盒。
            </p>
          </div>

          {/* Proxy Gateway Switcher with Status LED */}
          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
            <div className="flex items-center space-x-2">
              <span
                className={`w-3 h-3 rounded-full transition-all ${
                  searchProxy.enabled
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse'
                    : 'bg-slate-300'
                }`}
              />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <span>搜索反代网关</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {searchProxy.enabled ? '(已开启连通)' : '(已停用)'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {searchProxy.enabled ? searchProxy.endpoint : '直连模式'}
                </div>
              </div>
            </div>

            <button
              onClick={toggleProxy}
              className={`p-2 rounded-xl transition-all ${
                searchProxy.enabled
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
              title="切换站内搜索反代（支持国内直通 Google 搜索）"
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Browser Sandbox */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800">内置安全浏览器</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              IFrame 沙盒保护
            </span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>添加网址书签</span>
          </button>
        </div>

        {/* Address bar */}
        <form onSubmit={handleNavigate} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={browserUrl}
              onChange={(e) => setBrowserUrl(e.target.value)}
              placeholder="输入网址（如 https://developer.mozilla.org）..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center space-x-1 shadow-xs"
          >
            <span>在内置窗口打开</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          {currentFrameUrl && (
            <a
              href={currentFrameUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs flex items-center space-x-1"
              title="新窗口弹出"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </form>

        {/* Browser Display */}
        {currentFrameUrl ? (
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
            <div className="bg-slate-800 px-4 py-1.5 flex items-center space-x-2 text-[11px] text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-mono text-slate-400 truncate ml-2">{currentFrameUrl}</span>
            </div>
            <iframe
              src={currentFrameUrl}
              title="WhiteFox In-App Browser"
              className="w-full h-[520px] bg-white border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
            在上方输入网址或点击下方精选书签，即可在内置浏览器沙盒中即时浏览
          </div>
        )}
      </div>

      {/* Bookmarks Grid with Category Filtering */}
      <div className="space-y-4">
        {/* Categories Tab */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === c.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Bookmark Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((bm) => (
            <div
              key={bm.id}
              className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">
                    {bm.title}
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 bg-slate-100 rounded-md">
                    {bm.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{bm.desc}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-2 truncate">{bm.url}</p>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-slate-100 mt-4">
                <button
                  onClick={() => {
                    setBrowserUrl(bm.url);
                    setCurrentFrameUrl(bm.url);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="flex-1 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold"
                >
                  内置沙盒浏览
                </button>
                <a
                  href={bm.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
                  title="新标签页直达"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Bookmark Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">添加精选书签</h3>
            <form onSubmit={handleAddBookmark} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">网站标题</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="如: GitHub"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">网址 URL</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://github.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">所属分类</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                >
                  <option value="cloud">云平台控制台</option>
                  <option value="tech">技术与文档</option>
                  <option value="tools">实用工具</option>
                  <option value="ai">AI 智能中枢</option>
                </select>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold shadow-xs"
                >
                  确定添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
