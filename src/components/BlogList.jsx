import React, { useState } from 'react';
import {
  Bookmark, BookmarkCheck, Calendar, Eye, Search,
  PlusCircle, Trash2, Copy, CheckCircle2, ArrowRight,
  Edit3, LayoutGrid, Layers, AlignLeft, List
} from 'lucide-react';

export const BlogList = ({
  posts,
  setPosts,
  onSelectPost,
  isAdmin,
  layout = 'grid',
  fontSize = 'standard',
  t
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [toast, setToast] = useState('');

  // Form states for creating a new post
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('技术视界');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('架构, 边缘计算');
  const [newCover, setNewCover] = useState('');

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

  // Delete Post
  const handleDeletePost = (id, title, e) => {
    e.stopPropagation();
    if (confirm(`确定彻底删除博文《${title}》吗？`)) {
      setPosts(posts.filter((p) => p.id !== id));
      showToast('文章已删除');
    }
  };

  // Create Post
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const post = {
      id: 'p-' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      summary: newSummary.trim() || newContent.slice(0, 100) + '...',
      content: newContent.trim(),
      date: new Date().toISOString().split('T')[0],
      author: 'fox (站长)',
      views: 1,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      cover: newCover.trim() || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      isBookmarked: false,
      comments: []
    };
    setPosts([post, ...posts]);
    setShowNewModal(false);
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    setNewCover('');
    showToast('新博文发布成功！');
  };

  // Local image upload for cover
  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewCover(reader.result);
      };
      reader.readAsDataURL(file);
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

      {/* Filter and Action Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
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

          <button
            onClick={() => setFilterBookmarkedOnly(!filterBookmarkedOnly)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all flex items-center space-x-1 ${
              filterBookmarkedOnly
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="只看已收藏文章"
          >
            <BookmarkCheck className="w-4 h-4" />
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowNewModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-xs whitespace-nowrap transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>写新博文</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Layout Rendering */}
      {/* 1. Classic Grid Layout */}
      {layout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => onSelectPost(post.id)}
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
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold">
                    {post.category}
                  </div>

                  {/* Actions (Bookmark, 1-Click Copy, Delete) */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1.5">
                    <button
                      onClick={(e) => handleCopyPost(post, e)}
                      title="一键复制文章 Markdown"
                      className="p-1.5 rounded-xl bg-black/50 text-white hover:bg-emerald-600 backdrop-blur-xs transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => toggleBookmark(post.id, e)}
                      title={post.isBookmarked ? '取消收藏' : '一键收藏'}
                      className={`p-1.5 rounded-xl backdrop-blur-xs transition-all ${
                        post.isBookmarked ? 'bg-emerald-500 text-white' : 'bg-black/50 text-white hover:bg-black/80'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${post.isBookmarked ? 'fill-white' : ''}`} />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeletePost(post.id, post.title, e)}
                        title="删除博文"
                        className="p-1.5 rounded-xl bg-black/50 text-white hover:bg-rose-600 backdrop-blur-xs transition-colors"
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

      {/* 2. Magazine Waterfall Layout */}
      {layout === 'magazine' && (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => onSelectPost(post.id)}
              className="group cursor-pointer bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 grid grid-cols-1 md:grid-cols-12"
            >
              <div className="md:col-span-5 relative h-56 md:h-full bg-slate-100 overflow-hidden">
                <img
                  src={post.cover}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-semibold">
                  {post.category}
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
                        className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => toggleBookmark(post.id, e)}
                        className={`p-1 rounded-lg ${post.isBookmarked ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-emerald-600' : ''}`} />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={(e) => handleDeletePost(post.id, post.title, e)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100"
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

      {/* 3. Minimal Stream Layout */}
      {layout === 'minimal' && (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => onSelectPost(post.id)}
              className="group cursor-pointer bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                    {post.category}
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
                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-emerald-600"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => toggleBookmark(post.id, e)}
                  className={`p-1.5 rounded-xl border border-slate-200 ${post.isBookmarked ? 'bg-emerald-50 text-emerald-600 border-emerald-300' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${post.isBookmarked ? 'fill-emerald-600' : ''}`} />
                </button>
                {isAdmin && (
                  <button
                    onClick={(e) => handleDeletePost(post.id, post.title, e)}
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* 4. Compact List Layout */}
      {layout === 'compact' && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onSelectPost(post.id)}
              className="group cursor-pointer px-5 py-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 flex-shrink-0">
                  {post.category}
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
                  className="p-1 text-slate-400 hover:text-emerald-600"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => toggleBookmark(post.id, e)}
                  className={`p-1 ${post.isBookmarked ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${post.isBookmarked ? 'fill-emerald-600' : ''}`} />
                </button>
                {isAdmin && (
                  <button
                    onClick={(e) => handleDeletePost(post.id, post.title, e)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Post Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Edit3 className="w-5 h-5 text-emerald-600" />
              <span>撰写新博文 (fox 博客创作中心)</span>
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">文章标题</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="标题..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">专栏分类</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="技术视界">技术视界</option>
                    <option value="多云架构">多云架构</option>
                    <option value="边缘计算">边缘计算</option>
                    <option value="数字生活">数字生活</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">标签 (逗号分隔)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="如: Cloudflare, D1, 腾讯云"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">文章封面 (URL 或本地上传)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newCover}
                    onChange={(e) => setNewCover(e.target.value)}
                    placeholder="https://... 封面图片直链"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer text-slate-600 font-semibold">
                    <span>本地上传</span>
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">文章摘要</label>
                <textarea
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="文章简要介绍..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">正文内容 (Markdown / 纯文本)</label>
                <textarea
                  rows={8}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="支持完整的 Markdown 格式..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                >
                  立即发布博文
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
