import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  Eye,
  Search,
  PlusCircle,
  UploadCloud,
  CheckCircle2,
  Tag,
  ArrowRight
} from 'lucide-react';

export const BlogList = ({ posts, setPosts, onSelectPost, isAdmin, t }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  // New post modal fields
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('技术视界');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('架构, 云计算');

  const categories = ['全部', '技术视界', '多云架构', '数字生活', '边缘计算'];

  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setPosts(
      posts.map((p) => (p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p))
    );
  };

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
      author: '白狐 (站长)',
      views: 1,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      isBookmarked: false,
      comments: []
    };
    setPosts([post, ...posts]);
    setShowNewModal(false);
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
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

  return (
    <div className="space-y-6">
      {/* Category filters & Search Bar */}
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
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-xs whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>写新博文</span>
            </button>
          )}
        </div>
      </div>

      {/* Post Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            onClick={() => onSelectPost(post.id)}
            className="group cursor-pointer bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Cover */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={post.cover}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold">
                  {post.category}
                </div>
                {/* 1-click bookmark toggle button */}
                <button
                  onClick={(e) => toggleBookmark(post.id, e)}
                  title={post.isBookmarked ? '取消收藏' : '一键收藏'}
                  className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
                    post.isBookmarked
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-black/50 text-white hover:bg-black/80'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${post.isBookmarked ? 'fill-white' : ''}`} />
                </button>
              </div>

              {/* Content Body */}
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

                <h2 className="text-base font-bold text-slate-800 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {post.title}
                </h2>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
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

            {/* Read footer */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-mono">白狐原创精选</span>
              <span className="font-semibold text-emerald-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>阅读文章</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* New Post Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">撰写新博文</h3>
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
              <div>
                <label className="block text-slate-600 font-semibold mb-1">分类专栏</label>
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
                  rows={6}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="开始您的写作..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
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
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold shadow-xs"
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
