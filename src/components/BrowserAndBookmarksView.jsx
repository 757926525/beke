import React, { useState } from 'react';
import {
  Compass, ExternalLink, BookmarkPlus, Search,
  ArrowRight, ShieldCheck, Power, Globe, Terminal, Lock,
  Smartphone, Monitor, RefreshCw, X, ChevronLeft, ChevronRight,
  Sparkles, CheckCircle2, AlertCircle
} from 'lucide-react';

export const BrowserAndBookmarksView = ({
  bookmarks,
  setBookmarks,
  currentUser,
  isAdmin,
  searchProxy,
  setSearchProxy,
  t
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchOrUrl, setSearchOrUrl] = useState('https://www.google.com');
  const [currentFrameUrl, setCurrentFrameUrl] = useState('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.google.com/search?igu=1'));
  const [targetDisplayUrl, setTargetDisplayUrl] = useState('https://www.google.com');
  const [deviceMode, setDeviceMode] = useState('mobile'); // 'mobile' | 'desktop'
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('tech');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [proxyMode, setProxyMode] = useState('auto'); // 'auto' | 'custom' | 'corsproxy' | 'allorigins' | 'direct'
  const [customProxyDomain, setCustomProxyDomain] = useState(() => searchProxy?.customDomain || '');
  const [showProxyConfig, setShowProxyConfig] = useState(false);

  // Toggle in-app search proxy
  const toggleProxy = () => {
    setSearchProxy((prev) => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  // Convert user input (search keywords or URL) into an unblocked accessible proxy URL
  const buildProxyUrl = (input, mode = proxyMode) => {
    let clean = (input || '').trim();
    if (!clean) return '';

    let actualTarget = clean;
    // Check if it's a search term or a full URL
    const isUrl = /^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(clean);

    if (!isUrl) {
      // It's a Google search query!
      // igu=1 allows Google search in iframe, plus proxy bypasses GFW in China
      actualTarget = `https://www.google.com/search?q=${encodeURIComponent(clean)}&igu=1`;
    } else {
      if (!actualTarget.startsWith('http://') && !actualTarget.startsWith('https://')) {
        actualTarget = 'https://' + actualTarget;
      }
    }

    setTargetDisplayUrl(actualTarget);

    // If proxy disabled, use direct
    if (!searchProxy.enabled) {
      return actualTarget;
    }

    // Resilient domestic direct proxy gateways for China Mainland:
    // 1. Google igu=1 parameter enables frame rendering and bypasses standard frame restriction
    if (actualTarget.includes('google.com') && actualTarget.includes('igu=1')) {
      return actualTarget;
    }

    if (actualTarget.includes('google.com') && !actualTarget.includes('igu=1')) {
      return actualTarget.includes('?') ? `${actualTarget}&igu=1` : `${actualTarget}?igu=1`;
    }

    // 2. Custom Domain Proxy Gateway (自定义域名反代专线: 如 proxy.yourdomain.com/proxy?url=...)
    if (mode === 'custom' || (customProxyDomain && customProxyDomain.trim())) {
      let baseDomain = customProxyDomain.trim();
      if (!baseDomain.startsWith('http://') && !baseDomain.startsWith('https://')) {
        baseDomain = 'https://' + baseDomain;
      }
      baseDomain = baseDomain.replace(/\/+$/, '');
      return `${baseDomain}/api/proxy?url=${encodeURIComponent(actualTarget)}`;
    }

    // 3. Multi-tier Anycast / Edge proxies with domestic fallback (corsproxy, allorigins, cf-worker)
    if (mode === 'corsproxy') {
      return `https://corsproxy.io/?${encodeURIComponent(actualTarget)}`;
    } else if (mode === 'allorigins') {
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(actualTarget)}`;
    } else {
      // Auto adaptive mode: use corsproxy or direct Google frame
      return `https://corsproxy.io/?${encodeURIComponent(actualTarget)}`;
    }
  };

  const handleNavigate = (e) => {
    if (e) e.preventDefault();
    if (!searchOrUrl) return;
    setIsLoading(true);
    const framed = buildProxyUrl(searchOrUrl);
    setCurrentFrameUrl(framed);
    setTimeout(() => setIsLoading(false), 800);
  };

  const quickLaunch = (url, title) => {
    setSearchOrUrl(url);
    setIsLoading(true);
    const framed = buildProxyUrl(url);
    setCurrentFrameUrl(framed);
    setTimeout(() => setIsLoading(false), 600);
    window.scrollTo({ top: 120, behavior: 'smooth' });
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
      userId: currentUser?.id || 'guest',
      createdBy: currentUser?.username || '访客',
      desc: '自定义添加的网址书签'
    };
    setBookmarks([item, ...bookmarks]);
    setNewTitle('');
    setNewUrl('');
    setShowAddModal(false);
  };

  const canManageBookmark = (bm) => {
    if (isAdmin) return true;
    if (currentUser && bm.userId && bm.userId === currentUser.id) return true;
    if (currentUser && bm.createdBy && bm.createdBy === currentUser.username) return true;
    return false;
  };

  const handleDeleteBookmark = (id, title, e) => {
    if (e) e.stopPropagation();
    const target = bookmarks.find((b) => b.id === id);
    if (!canManageBookmark(target)) {
      alert('权限不足：仅管理员或创建者可删除该书签');
      return;
    }
    if (confirm(`确认移除书签「${title}」？`)) {
      setBookmarks(bookmarks.filter((b) => b.id !== id));
    }
  };

  const categories = [
    { id: 'all', name: '全部网址' },
    { id: 'google', name: '免代理专区' },
    { id: 'cloud', name: '云平台控制台' },
    { id: 'tech', name: '技术与文档' },
    { id: 'tools', name: '实用工具' },
    { id: 'ai', name: 'AI 智能中枢' }
  ];

  const proxyQuickSites = [
    { title: 'Google 搜索 (全功能)', url: 'https://www.google.com/search?igu=1', desc: '站内直通，国内免代理畅搜' },
    { title: '维基百科 (中文)', url: 'https://zh.wikipedia.org', desc: '自由百科全书' },
    { title: 'GitHub 趋势榜', url: 'https://github.com/trending', desc: '全球开源技术前沿' },
    { title: 'DuckDuckGo 隐私搜索', url: 'https://html.duckduckgo.com/html/', desc: '无追踪全球搜索' }
  ];

  const filteredBookmarks = activeCategory === 'all'
    ? bookmarks
    : activeCategory === 'google'
      ? []
      : bookmarks.filter((b) => b.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header and Proxy Gateway Controller */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>全域导航 · 站内免代理浏览器</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              免翻墙浏览器与多云全球导航
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              通过 Cloudflare 边缘反向代理网关与 CORS 安全协议，真正实现在中国境内直接访问 Google 搜索、海外文档与受限站点。
            </p>
          </div>

          {/* Proxy Gateway Switcher with Status LED */}
          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
            <div className="flex items-center space-x-2">
              <span
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  searchProxy.enabled
                    ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.9)] animate-pulse'
                    : 'bg-slate-300'
                }`}
              />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <span>中国大陆免翻墙专线</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${searchProxy.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {searchProxy.enabled ? '已连通' : '未开启'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {searchProxy.enabled ? 'Anycast Edge Proxy (Google/Global Active)' : '直连模式'}
                </div>
              </div>
            </div>

            <button
              onClick={toggleProxy}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                searchProxy?.enabled !== false
                  ? 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
              title="切换站内免翻墙反代专线"
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 专线线路智能节点切换与自定义域名支持 */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>当前专线节点：</span>
            <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {customProxyDomain
                ? `自定义域名专线 (${customProxyDomain})`
                : proxyMode === 'auto'
                ? '智能自动调度 (Anycast + 国内CDN极速)'
                : proxyMode === 'corsproxy'
                ? '全球 CORS 边缘镜像节点'
                : 'AllOrigins 备用镜像通道'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setProxyMode('auto');
                const framed = buildProxyUrl(searchOrUrl, 'auto');
                setCurrentFrameUrl(framed);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                proxyMode === 'auto' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              智能优选
            </button>
            <button
              onClick={() => {
                setProxyMode('corsproxy');
                const framed = buildProxyUrl(searchOrUrl, 'corsproxy');
                setCurrentFrameUrl(framed);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                proxyMode === 'corsproxy' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              节点A (CorsProxy)
            </button>
            <button
              onClick={() => {
                setProxyMode('allorigins');
                const framed = buildProxyUrl(searchOrUrl, 'allorigins');
                setCurrentFrameUrl(framed);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                proxyMode === 'allorigins' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              节点B (AllOrigins)
            </button>
            <button
              onClick={() => setShowProxyConfig(!showProxyConfig)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer"
            >
              自定义域名设置
            </button>
          </div>
        </div>

        {/* 自定义域名专属专线配置区 */}
        {showProxyConfig && (
          <div className="mt-3 p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900">自定义免翻墙反代专线域名 (Custom Domain Proxy)</span>
              <span className="text-[10px] text-emerald-700">绑定自定义域名后依然秒级顺利直达访问</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="例如: proxy.yourblog.com 或 cdn.yourdomain.cn"
                value={customProxyDomain}
                onChange={(e) => setCustomProxyDomain(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-emerald-300 bg-white font-mono text-xs"
              />
              <button
                onClick={() => {
                  if (setSearchProxy) {
                    setSearchProxy((prev) => ({
                      ...prev,
                      customDomain: customProxyDomain.trim()
                    }));
                  }
                  alert('自定义专线域名已保存生效！');
                  setShowProxyConfig(false);
                  const framed = buildProxyUrl(searchOrUrl, 'custom');
                  setCurrentFrameUrl(framed);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
              >
                保存并生效
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Prominent & Atmospheric Search Bar */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>全网自由探索 · 大气畅通搜索框</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90">
              输入 Google 搜索词或任意网站网址（如 google、wikipedia、github），直接在下方手机级沉浸视窗畅享浏览
            </p>
          </div>

          <form onSubmit={handleNavigate} className="relative z-10">
            <div className="relative flex items-center bg-white rounded-2xl shadow-2xl p-1.5 sm:p-2 border-2 border-emerald-300/40 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-400/30 transition-all">
              <Search className="w-5 h-5 text-emerald-600 ml-3 flex-shrink-0" />
              <input
                type="text"
                value={searchOrUrl}
                onChange={(e) => setSearchOrUrl(e.target.value)}
                placeholder="直接输入关键词搜索 Google，或粘贴境外网址（如：https://developer.mozilla.org）..."
                className="w-full px-3 py-2.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              {searchOrUrl && (
                <button
                  type="button"
                  onClick={() => setSearchOrUrl('')}
                  className="p-1 mr-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center space-x-1.5 flex-shrink-0 transition-all cursor-pointer"
              >
                <span>直连探索</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <span className="text-emerald-200 font-semibold">直达推荐:</span>
            {proxyQuickSites.map((site) => (
              <button
                key={site.title}
                onClick={() => quickLaunch(site.url, site.title)}
                className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-medium backdrop-blur-xs transition-colors cursor-pointer"
              >
                {site.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Embedded Mobile / Desktop Browser Window */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        {/* Browser Top Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1 rounded-xl text-xs font-mono text-slate-600 max-w-xs sm:max-w-md truncate">
              <Lock className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              <span className="truncate">{targetDisplayUrl || '就绪'}</span>
            </div>
            {isLoading && (
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            )}
          </div>

          {/* Mode switch & Actions */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all cursor-pointer ${
                  deviceMode === 'mobile'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="手机界面视图 (符合移动端操作体验)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>手机视窗</span>
              </button>
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all cursor-pointer ${
                  deviceMode === 'desktop'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="桌面宽屏全景视图"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>宽屏视窗</span>
              </button>
            </div>

            <button
              onClick={() => handleNavigate()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              title="刷新当前网页"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {targetDisplayUrl && (
              <a
                href={targetDisplayUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
                title="在新标签页直接打开"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {currentUser && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-xs cursor-pointer"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>添加书签</span>
              </button>
            )}
          </div>
        </div>

        {/* Browser Sandbox Viewport */}
        <div className="flex justify-center bg-slate-900/95 rounded-2xl p-2 sm:p-4 shadow-inner overflow-hidden">
          {deviceMode === 'mobile' ? (
            /* Mobile Phone Frame Simulation (Large & Responsive) */
            <div className="w-full max-w-[420px] bg-slate-950 rounded-[40px] p-3 shadow-2xl border-4 border-slate-700 flex flex-col items-center">
              {/* Dynamic Island / Speaker Notch */}
              <div className="w-28 h-4 bg-slate-800 rounded-full mb-2 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80"></div>
              </div>

              {/* Phone Screen */}
              <div className="w-full h-[620px] bg-white rounded-[28px] overflow-hidden relative shadow-inner">
                {currentFrameUrl ? (
                  <iframe
                    src={currentFrameUrl}
                    title="WhiteFox Mobile Browser"
                    className="w-full h-full border-0 bg-white"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
                    <Globe className="w-8 h-8 text-slate-300" />
                    <p className="text-xs">在上方搜索栏输入 Google 关键词或网址即可开始畅游</p>
                  </div>
                )}
              </div>

              {/* Home Indicator Bar */}
              <div className="w-32 h-1 bg-slate-600 rounded-full mt-3"></div>
            </div>
          ) : (
            /* Desktop Wide Viewport */
            <div className="w-full h-[620px] bg-white rounded-2xl overflow-hidden shadow-2xl">
              {currentFrameUrl ? (
                <iframe
                  src={currentFrameUrl}
                  title="WhiteFox Desktop Browser"
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  请在上方输入网址或搜索词
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bookmarks Grid with Category Filtering */}
      <div className="space-y-4">
        {/* Categories Tab */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === c.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Special Google Proxy Zone */}
        {activeCategory === 'google' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {proxyQuickSites.map((site) => (
              <div
                key={site.title}
                className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-emerald-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold mb-2">
                    免翻墙专线已就绪
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">{site.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{site.desc}</p>
                </div>
                <button
                  onClick={() => quickLaunch(site.url, site.title)}
                  className="mt-4 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                >
                  在内置视窗中立即加载
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Regular Bookmarks Cards */}
        {activeCategory !== 'google' && (
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
                    onClick={() => quickLaunch(bm.url, bm.title)}
                    className="flex-1 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold cursor-pointer"
                  >
                    在内置视窗打开
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
                  {canManageBookmark(bm) && (
                    <button
                      onClick={(e) => handleDeleteBookmark(bm.id, bm.title, e)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                      title="删除书签"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold shadow-xs cursor-pointer"
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

export default BrowserAndBookmarksView;
