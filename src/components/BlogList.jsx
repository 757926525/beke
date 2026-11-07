import React, { useState, useRef } from 'react';
import {
  Bookmark, BookmarkCheck, Calendar, Eye, Search,
  PlusCircle, Trash2, Copy, CheckCircle2, ArrowRight,
  Edit3, LayoutGrid, Layers, AlignLeft, List,
  History, Clock, X, ChevronRight, HardDrive, Sparkles,
  Camera, Check, AlertCircle
} from 'lucide-react';

import NewArticleModal from './NewArticleModal';
import { formatBytes, calculateUsedStorageBytes } from '../services/storageService';

export const BlogList = ({
  posts,
  setPosts,
  currentUser,
  onSelectPost,
  isAdmin,
  layout = 'grid',
  fontSize = 'standard',
  cloudFiles = [],
  bookmarks = [],
  photos = [],
  siteName = 'fox',
  heroIntro,
  setHeroIntro,
  browsingHistory = [],
  setBrowsingHistory,
  activeStorageEngine = 'cloudflare-kv',
  t
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState(false);
  const [blogViewMode, setBlogViewMode] = useState(layout || 'grid'); // 'grid' (大图) | 'magazine' (中图) | 'minimal' (小图) | 'compact' (详情列表)
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [toast, setToast] = useState('');

  // Hero Intro editing state
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [heroForm, setHeroForm] = useState({
    title: heroIntro?.title || '极简敏捷与多云边缘博客',
    badge: heroIntro?.badge || '灵狐踏雪 · 随心而述 · 云端无界',
    desc: heroIntro?.desc || '原生适配多云边缘 Pages（Cloudflare / 腾讯云 / 阿里云），一键拉取与构建，集成 D1 边缘数据库与全功能媒体中枢。',
    heroImage: heroIntro?.heroImage || 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80'
  });
  const heroFileRef = useRef(null);

  const categories = ['全部', '技术视界', '多云架构', '数字生活', '边缘计算'];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setPosts(
      posts.map((p) => (p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p))
    );
  };

  // 1-Click Copy Post Content
  const handleCopyPost = (post, e) => {
    e.stopPropagation();
    const markdown = `# ${post.title}\n\n> 摘要：${post.summary}\n\n${post.content}\n\n---\n*标签: ${post.tags ? post.tags.join(', ') : ''}*`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(markdown);
      showToast(`《${post.title}》全文 Markdown 已复制到剪贴板！`);
    }
  };

  // Delete Post - only admin or author can delete
  const canDeletePost = (post) => {
    if (isAdmin) return true;
    if (currentUser && post.author && (post.author === currentUser.username || post.userId === currentUser.id)) {
      return true;
    }
    return false;
  };

  const handleDeletePost = (id, title, e) => {
    e.stopPropagation();
    const target = posts.find((p) => p.id === id);
    if (!canDeletePost(target)) {
      alert('权限不足：仅管理员或文章作者可删除此文章');
      return;
    }
    if (confirm(`确定彻底删除博文《${title}》吗？`)) {
      setPosts(posts.filter((p) => p.id !== id));
      showToast('文章已删除');
    }
  };

  // Select article & record to browsing history
  const handlePostClick = (post) => {
    // Record to history
    const historyItem = {
      id: post.id,
      title: post.title,
      category: post.category,
      cover: post.cover,
      visitedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [
      historyItem,
      ...browsingHistory.filter((h) => h.id !== post.id)
    ].slice(0, 15);
    setBrowsingHistory(updated);
    onSelectPost(post.id);
  };

  const handleDeleteHistoryItem = (id, e) => {
    e.stopPropagation();
    setBrowsingHistory(browsingHistory.filter((h) => h.id !== id));
  };

  const handleClearAllHistory = () => {
    if (confirm('确定要清空全部浏览历史记录吗？')) {
      setBrowsingHistory([]);
      showToast('浏览历史记录已全部清空');
    }
  };

  // Save edited hero text/photo
  const handleSaveHeroIntro = (e) => {
    e.preventDefault();
    setHeroIntro({
      ...heroIntro,
      ...heroForm
    });
    setIsEditingHero(false);
    showToast('首页介绍区已成功更新并持久化！');
  };

  // Hero image upload with canvas compression
  const handleHeroImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        setHeroForm((prev) => ({ ...prev, heroImage: dataUrl }));
        setHeroIntro((prev) => ({ ...prev, heroImage: dataUrl }));
        showToast('首页介绍区封面照片更换成功并生效！');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    if (heroFileRef.current) heroFileRef.current.value = '';
  };

  // Save new or edited post from NewArticleModal
  const handleSaveArticle = (articleData) => {
    if (editingPost) {
      setPosts(posts.map((p) => (p.id === articleData.id ? { ...p, ...articleData } : p)));
      showToast(`文章「${articleData.title}」已成功更新！`);
      setEditingPost(null);
    } else {
      setPosts([articleData, ...posts]);
      showToast(`文章「${articleData.title}」已成功发布！`);
    }
  };

  const filteredPosts = posts.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.tags && art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCategory =
      selectedCategory === '全部' || art.category === selectedCategory;
    const matchesBookmark = filterBookmarkedOnly ? art.isBookmarked : true;
    return matchesSearch && matchesCategory && matchesBookmark;
  });

  // Calculate storage numbers
  const usedStorageBytes = calculateUsedStorageBytes();
  const totalCapacityBytes = heroIntro?.totalCapacityBytes || 10 * 1024 * 1024 * 1024; // 10 GB
  const usedStorageStr = formatBytes(usedStorageBytes);
  const totalStorageStr = formatBytes(totalCapacityBytes);
  const usedPercent = usedStorageBytes > 0 ? Math.min(100, Math.max(0.1, ((usedStorageBytes / totalCapacityBytes) * 100).toFixed(1))) : 0;

  // Font size class mapping
  const fontSizeClasses = {
    compact: 'text-xs',
    standard: 'text-sm',
    large: 'text-base',
    extra: 'text-lg'
  };

  return (
    <div className={`space-y-6 ${fontSizeClasses[fontSize] || 'text-sm'}`}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Intro Section - Customizable Text, Visual Background Image and Live Storage Monitor */}
      <div
        className="relative rounded-3xl overflow-hidden text-white p-6 sm:p-10 shadow-lg border border-emerald-700/30 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: heroIntro?.heroImage
            ? `linear-gradient(to right, rgba(6, 78, 59, 0.92), rgba(15, 23, 42, 0.85)), url("${heroIntro.heroImage}")`
            : undefined
        }}
      >
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center space-x-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>{heroIntro?.badge || '灵狐踏雪 · 随心而述 · 云端无界'}</span>
            </div>
            {isAdmin && !isEditingHero && (
              <button
                onClick={() => {
                  setHeroForm({
                    title: heroIntro?.title || '极简敏捷与多云边缘博客',
                    badge: heroIntro?.badge || '灵狐踏雪 · 随心而述 · 云端无界',
                    desc: heroIntro?.desc || '原生适配多云边缘 Pages（Cloudflare / 腾讯云 / 阿里云），一键拉取与构建，集成 D1 边缘数据库与全功能媒体中枢。',
                    heroImage: heroIntro?.heroImage || 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80'
                  });
                  setIsEditingHero(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                title="修改首页介绍区文字与照片"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t('editHero')}</span>
              </button>
            )}
          </div>

          {isEditingHero ? (
            /* Inline Hero Editor */
            <form onSubmit={handleSaveHeroIntro} className="bg-slate-900/90 border border-emerald-500/40 p-4 rounded-2xl space-y-3 text-xs">
              <div>
                <label className="block text-emerald-300 font-semibold mb-1">介绍区主标题</label>
                <input
                  type="text"
                  value={heroForm.title}
                  onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-emerald-300 font-semibold mb-1">标签微徽标</label>
                <input
                  type="text"
                  value={heroForm.badge}
                  onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-emerald-300 font-semibold mb-1">详细描述介绍</label>
                <textarea
                  rows={2}
                  value={heroForm.desc}
                  onChange={(e) => setHeroForm({ ...heroForm, desc: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white leading-relaxed"
                  required
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => heroFileRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>上传更换封面照片</span>
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingHero(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold cursor-pointer"
                  >
                    {t('saveHero')}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight capitalize">
                {heroIntro?.title || `${siteName} 极简敏捷与多云边缘博客`}
              </h1>
              <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
                {heroIntro?.desc || '原生适配多云边缘 Pages（Cloudflare / 腾讯云 / 阿里云），一键拉取与构建，集成 D1 边缘数据库与全功能媒体中枢。'}
              </p>
            </>
          )}

          {/* Site Storage Capacity Real-time Indicator (总容量与已用容量) */}
          <div className="pt-2">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-emerald-500/20 max-w-md space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-1.5 text-emerald-200 font-semibold">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>网站存储容量 (Cloudflare R2 / 边缘节点)</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-300">
                  {usedStorageStr} / {totalStorageStr}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-emerald-900">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-teal-300 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span>{t('usedCapacity')}: {usedStorageStr} ({usedPercent}%)</span>
                <span>{t('totalCapacity')}: 10 GB ({t('freeQuota')})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Hero Image with direct photo upload trigger */}
        <div className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-transparent to-transparent z-10" />
          <img
            src={heroIntro?.heroImage || 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80'}
            alt="Hero Decoration"
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity hover:opacity-90 hover:mix-blend-normal transition-all duration-700"
          />
        </div>

        <input
          type="file"
          ref={heroFileRef}
          onChange={handleHeroImageUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Main Two-Column Layout: Left History Sidebar + Right Blog Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Browsing History (浏览历史记录选区，可删除记录和一键直达) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3 sticky top-24">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-1.5 text-slate-800 font-bold text-xs sm:text-sm">
                <History className="w-4 h-4 text-emerald-600" />
                <span>{t('readingHistory')}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full">
                  {browsingHistory.length}
                </span>
              </div>
              {browsingHistory.length > 0 && (
                <button
                  onClick={handleClearAllHistory}
                  className="text-[11px] text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
                  title="清空全部历史"
                >
                  {t('clearHistory')}
                </button>
              )}
            </div>

            {/* History List */}
            {browsingHistory.length > 0 ? (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {browsingHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectPost(item.id)}
                    className="group relative p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2 space-y-0.5">
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                        <Clock className="w-2.5 h-2.5 text-emerald-600" />
                        <span>{item.visitedAt}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">{item.category}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 truncate">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        title="删除该条历史"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                <Clock className="w-6 h-6 text-slate-300 mx-auto" />
                <p>{t('noHistory')}</p>
                <p className="text-[10px] text-slate-400">点击任意博文后将自动收录于此，支持一键直达与删除</p>
              </div>
            )}
          </div>
        </aside>

        {/* Right Area: Article List & Controls */}
        <section className="lg:col-span-9 space-y-6">
          {/* Filter and Action Bar */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="搜索博文、标签与摘要..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* 4 种视图模式切换：大图 (grid)、中图 (magazine)、小图 (minimal)、详细列表 (compact) */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                <button
                  onClick={() => setBlogViewMode('grid')}
                  title="大图网格视图"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${blogViewMode === 'grid' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setBlogViewMode('magazine')}
                  title="中图杂志视图"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${blogViewMode === 'magazine' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setBlogViewMode('minimal')}
                  title="小图卡片视图"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${blogViewMode === 'minimal' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setBlogViewMode('compact')}
                  title="详情列表视图"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${blogViewMode === 'compact' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setFilterBookmarkedOnly(!filterBookmarkedOnly)}
                className={`p-2 rounded-xl border text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                  filterBookmarkedOnly
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="只看已收藏文章"
              >
                <BookmarkCheck className="w-4 h-4" />
              </button>

              {currentUser && (
                <button
                  onClick={() => setShowNewModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-xs whitespace-nowrap transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>写新博文</span>
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Layout Rendering */}
          {/* 1. Classic Grid Layout (大图) */}
          {blogViewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className="group cursor-pointer bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Cover & Actions */}
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={post.cover}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold">
                          {post.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-mono shadow-xs backdrop-blur-xs">
                          {activeStorageEngine.includes('kv') ? 'KV存储' : activeStorageEngine.includes('d1') ? 'D1数据库' : '本地存储'}
                        </span>
                      </div>

                      {/* Actions (Bookmark, 1-Click Copy, Delete) */}
                      <div className="absolute top-3 right-3 flex items-center space-x-1.5">
                        <button
                          onClick={(e) => handleCopyPost(post, e)}
                          title="一键复制文章 Markdown"
                          className="p-1.5 rounded-xl bg-black/50 text-white hover:bg-emerald-600 backdrop-blur-xs transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => toggleBookmark(post.id, e)}
                          title={post.isBookmarked ? '取消收藏' : '一键收藏'}
                          className={`p-1.5 rounded-xl backdrop-blur-xs transition-all cursor-pointer ${
                            post.isBookmarked ? 'bg-emerald-500 text-white' : 'bg-black/50 text-white hover:bg-black/80'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${post.isBookmarked ? 'fill-white' : ''}`} />
                        </button>
                        {canDeletePost(post) && (
                          <button
                            onClick={(e) => handleDeletePost(post.id, post.title, e)}
                            title="删除博文"
                            className="p-1.5 rounded-xl bg-black/50 text-white hover:bg-rose-600 backdrop-blur-xs transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{post.date}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.views} 阅读</span>
                        </span>
                      </div>

                      <h2 className="font-bold text-slate-800 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-slate-500 line-clamp-3 leading-relaxed">
                        {post.summary}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {post.tags && post.tags.map((tg) => (
                          <span
                            key={tg}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">fox 原创精选</span>
                    <span className="font-semibold text-emerald-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                      <span>阅读全文</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* 2. Magazine Waterfall Layout (中图) */}
          {blogViewMode === 'magazine' && (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className="group cursor-pointer bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 grid grid-cols-1 md:grid-cols-12"
                >
                  <div className="md:col-span-5 relative h-56 md:h-full bg-slate-100 overflow-hidden">
                    <img
                      src={post.cover}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-semibold">
                        {post.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-mono shadow-xs backdrop-blur-xs">
                        {activeStorageEngine.includes('kv') ? 'KV存储' : activeStorageEngine.includes('d1') ? 'D1数据库' : '本地存储'}
                      </span>
                    </div>
                  </div>
                  <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{post.date}</span>
                        </span>
                        <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleCopyPost(post, e)}
                            title="复制 Markdown"
                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => toggleBookmark(post.id, e)}
                            className={`p-1 rounded-lg cursor-pointer ${post.isBookmarked ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-emerald-600' : ''}`} />
                          </button>
                          {canDeletePost(post) && (
                            <button
                              onClick={(e) => handleDeletePost(post.id, post.title, e)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                        {post.summary}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex gap-1">
                        {post.tags && post.tags.slice(0, 3).map((tg) => (
                          <span key={tg} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                            #{tg}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                        <span>阅读文章</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* 3. Minimal Stream Layout (小图) */}
          {blogViewMode === 'minimal' && (
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className="group cursor-pointer bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                        {post.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-mono">
                        {activeStorageEngine.includes('kv') ? 'KV' : activeStorageEngine.includes('d1') ? 'D1' : '本地'}
                      </span>
                      <span className="text-slate-400">{post.date}</span>
                    </div>
                    <h2 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-slate-500 line-clamp-1 text-xs">
                      {post.summary}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleCopyPost(post, e)}
                      title="复制全文"
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-emerald-600 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => toggleBookmark(post.id, e)}
                      className={`p-1.5 rounded-xl border border-slate-200 cursor-pointer ${post.isBookmarked ? 'bg-emerald-50 text-emerald-600 border-emerald-300' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${post.isBookmarked ? 'fill-emerald-600' : ''}`} />
                    </button>
                    {canDeletePost(post) && (
                      <button
                        onClick={(e) => handleDeletePost(post.id, post.title, e)}
                        className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* 4. Compact List Layout (详细列表) */}
          {blogViewMode === 'compact' && (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className="group cursor-pointer px-5 py-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 flex-shrink-0">
                      {post.category}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 flex-shrink-0">
                      {activeStorageEngine.includes('kv') ? 'KV存储' : activeStorageEngine.includes('d1') ? 'D1数据库' : '本地'}
                    </span>
                    <span className="font-semibold text-slate-800 truncate group-hover:text-emerald-600">
                      {post.title}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-slate-400 font-mono hidden sm:inline">{post.date}</span>
                    <button
                      onClick={(e) => handleCopyPost(post, e)}
                      title="一键复制"
                      className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => toggleBookmark(post.id, e)}
                      className={`p-1 cursor-pointer ${post.isBookmarked ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${post.isBookmarked ? 'fill-emerald-600' : ''}`} />
                    </button>
                    {canDeletePost(post) && (
                      <button
                        onClick={(e) => handleDeletePost(post.id, post.title, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* New / Edit Article Modal */}
      <NewArticleModal
        isOpen={showNewModal || !!editingPost}
        onClose={() => {
          setShowNewModal(false);
          setEditingPost(null);
        }}
        onSave={handleSaveArticle}
        cloudFiles={cloudFiles}
        bookmarks={bookmarks}
        photos={photos}
        currentUser={currentUser}
        initialData={editingPost}
      />
    </div>
  );
};

export default BlogList;
