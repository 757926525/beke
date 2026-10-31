import React, { useState } from 'react';
import {
  ArrowLeft, Calendar, Eye, User, Bookmark,
  Share2, MessageSquare, Send, CheckCircle2, HardDrive,
  Copy, Trash2, Edit3
} from 'lucide-react';

export const BlogPostView = ({ post, onBack, currentUser, onAddComment, onDeletePost, fontSize = 'standard', t }) => {
  const [commentText, setCommentText] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('文章链接已复制到剪贴板！');
    }
  };

  const handleCopyContent = () => {
    const md = `# ${post.title}\n\n${post.content}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(md);
      showToast('文章全文 Markdown 已成功复制！');
    }
  };

  const handleSaveToCloud = () => {
    showToast(`文章已成功保存快照到多云网盘 (Cloud Snapshot)`);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newC = {
      id: 'c-' + Date.now(),
      author: currentUser?.username || '访客',
      date: new Date().toISOString().split('T')[0],
      content: commentText.trim()
    };
    onAddComment(newC);
    setCommentText('');
    showToast('评论发布成功！');
  };

  // Font size class mapping
  const contentFontSizeClass = {
    compact: 'text-xs sm:text-sm',
    standard: 'text-sm sm:text-base',
    large: 'text-base sm:text-lg',
    extra: 'text-lg sm:text-xl'
  }[fontSize] || 'text-sm sm:text-base';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Navigation bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-xs font-semibold text-slate-700 border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回博文列表</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyContent}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            title="一键复制文章 Markdown 全文"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-600" />
            <span>一键复制全文</span>
          </button>
          <button
            onClick={handleSaveToCloud}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>存至多云</span>
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="分享文章"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Article Content Card */}
      <article className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
            {post.category}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
            <span className="flex items-center space-x-1">
              <User className="w-3.5 h-3.5" />
              <span>{post.author}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.date}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{post.views} 次浏览</span>
            </span>
          </div>
        </div>

        {/* Cover */}
        {post.cover && (
          <div className="rounded-2xl overflow-hidden aspect-[16/9] max-h-96 w-full shadow-inner bg-slate-100">
            <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Body */}
        <div className={`prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line py-2 ${contentFontSizeClass}`}>
          {post.content}
        </div>

        {/* Tags */}
        {post.tags && (
          <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100">
            {post.tags.map((tg) => (
              <span key={tg} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">
                #{tg}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Interactive Comments Area */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-800">
            读者交流与评论 ({post.comments?.length || 0})
          </h2>
        </div>

        {/* Add comment input */}
        <form onSubmit={handleCommentSubmit} className="space-y-2">
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={`以 ${currentUser?.username || '访客'} 的身份发表见解...`}
            className="w-full p-3 rounded-2xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>发表评论</span>
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="divide-y divide-slate-100 pt-2">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((c) => (
              <div key={c.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{c.author}</span>
                  <span className="text-[10px] text-slate-400">{c.date}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{c.content}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">暂无评论，留下您的精彩思考吧！</p>
          )}
        </div>
      </div>
    </div>
  );
};
