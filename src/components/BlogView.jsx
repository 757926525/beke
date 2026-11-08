import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Heart,
  Share2,
  Calendar,
  Eye,
  User,
  Tag,
  Search,
  ExternalLink,
  PlusCircle,
  X,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import { handleImageError } from '../services/utils';

export default function BlogView({
  articles,
  onToggleBookmark,
  onSaveToNetDrive,
  onNewArticle
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [activeArticle, setActiveArticle] = useState(null);
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState(false);
  const [netDriveStatus, setNetDriveStatus] = useState(null);

  const categories = ['全部', '技术视界', '云原生实践', '数字生活'];

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === '全部' || art.category === selectedCategory;
    const matchesBookmark = filterBookmarkedOnly ? art.isBookmarked : true;
    return matchesSearch && matchesCategory && matchesBookmark;
  });

  const handleNetDriveSave = async (art) => {
    setNetDriveStatus('saving');
    const res = await onSaveToNetDrive(art);
    setNetDriveStatus(res);
    setTimeout(() => setNetDriveStatus(null), 3500);
  };

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-rose-900 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-rose-300 text-xs font-medium">
            <span>❄️</span>
            <span>灵狐踏雪 · 随心而述 · 云端无界</span>
          </div>
          <h1 className="font-serif-sc text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            白狐博客 · 个人数字化智识空间
          </h1>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
            支持一键收藏文章、内置随身书架与相册、网络音视频播放器与极速下载。原生无缝连接 Cloudflare D1/R2 与腾讯云/阿里云对象存储。
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNewArticle()}
              className="px-5 py-2.5 rounded-xl fox-gradient text-white font-medium text-sm shadow-lg hover:shadow-rose-500/30 hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>撰写新文</span>
            </button>
            <button
              onClick={() => setFilterBookmarkedOnly(!filterBookmarkedOnly)}
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                filterBookmarkedOnly
                  ? 'bg-rose-500/30 border-rose-400 text-white'
                  : 'bg-white/10 border-white/20 text-slate-200 hover:bg-white/15'
              }`}
            >
              <BookmarkCheck className="w-4 h-4 text-rose-400" />
              <span>{filterBookmarkedOnly ? '查看全部文章' : '仅看已收藏文章'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* NetDrive Toast Feedback */}
      {netDriveStatus && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl glass-panel shadow-2xl border border-rose-200 dark:border-rose-900/60 max-w-sm animate-bounce">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-slate-800 dark:text-slate-100">已一键保存至云网盘！</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-all">
                路径：{netDriveStatus.path}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索文章标题、标签或内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => {
          return (
            <article
              key={article.id}
              className="group glass-panel rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                {/* Cover Image */}
                <div
                  className="relative h-48 overflow-hidden cursor-pointer"
                  onClick={() => setActiveArticle(article)}
                >
                  <img
                    src={article.cover}
                    alt={article.title}
                    loading="lazy"
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-medium">
                    {article.category}
                  </div>
                  {/* Quick 1-click Bookmark on Card */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(article.id);
                    }}
                    title={article.isBookmarked ? '取消收藏' : '一键收藏此文'}
                    className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
                      article.isBookmarked
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-black/50 text-white hover:bg-black/80'
                    }`}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${article.isBookmarked ? 'fill-white' : ''}`}
                    />
                  </button>
                </div>

                {/* Content info */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {article.views} 次浏览
                    </span>
                  </div>

                  <h3
                    className="font-serif-sc font-bold text-lg text-slate-900 dark:text-white line-clamp-2 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors"
                    onClick={() => setActiveArticle(article)}
                  >
                    {article.title}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {article.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNetDriveSave(article)}
                    title="一键转存至网盘指定文件夹"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors flex items-center gap-1"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>存入网盘</span>
                  </button>
                </div>

                <button
                  onClick={() => setActiveArticle(article)}
                  className="font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <span>阅读全文</span>
                  <span>→</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Article Detail Reading Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>

            {/* Article Header */}
            <div className="space-y-4 pr-10">
              <div className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-semibold">
                {activeArticle.category}
              </div>
              <h2 className="font-serif-sc text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {activeArticle.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {activeArticle.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {activeArticle.date}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {activeArticle.views} 次浏览
                </span>
              </div>
            </div>

            {/* Cover in modal */}
            {activeArticle.cover && (
              <img
                src={activeArticle.cover}
                alt={activeArticle.title}
                onError={handleImageError}
                className="w-full h-64 sm:h-80 object-cover rounded-2xl my-6 shadow-md"
              />
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 my-4 text-sm">
              <button
                onClick={() => onToggleBookmark(activeArticle.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  activeArticle.isBookmarked
                    ? 'bg-rose-600 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${activeArticle.isBookmarked ? 'fill-white' : ''}`} />
                <span>{activeArticle.isBookmarked ? '已收藏到白狐' : '一键收藏文章'}</span>
              </button>

              <button
                onClick={() => handleNetDriveSave(activeArticle)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                <span>一键转存至网盘</span>
              </button>
            </div>

            {/* Markdown-like article body */}
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 space-y-4 text-base leading-relaxed py-4 whitespace-pre-line font-sans">
              {activeArticle.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
