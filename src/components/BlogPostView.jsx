import React, { useState } from 'react';
import {
  ArrowLeft, Calendar, Eye, User, Bookmark,
  Share2, MessageSquare, Send, CheckCircle2, HardDrive,
  Copy, Trash2, Edit3, Download, FileText
} from 'lucide-react';
import { generateDocxBlob, downloadFile } from '../services/documentConverter';
import { RichContentRenderer } from './RichContentRenderer';
import NewArticleModal from './NewArticleModal';

export const BlogPostView = ({
  post,
  onBack,
  currentUser,
  cloudFiles = [],
  bookmarks = [],
  onUpdatePost,
  onAddComment,
  onDeletePost,
  fontSize = 'standard',
  t
}) => {
  const [commentText, setCommentText] = useState('');
  const [toast, setToast] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const canEditOrDelete = isAdmin || (currentUser && post.author && (post.author === currentUser.username || post.userId === currentUser.id));

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

  // 1-Click TXT Download
  const handleDownloadTxt = () => {
    const fullText = `标题: ${post.title}\n作者: ${post.author}\n分类: ${post.category}\n发布日期: ${post.date}\n标签: ${(post.tags || []).join(', ')}\n\n正文:\n${post.content}\n\n---\n来源: 白狐 (WhiteFox) 博客系统`;
    downloadFile(fullText, `${post.title}.txt`, 'text/plain;charset=utf-8');
    showToast(`文章「${post.title}.txt」下载已启动！`);
  };

  // 1-Click DOCX Download
  const handleDownloadDocx = async () => {
    try {
      setIsExporting(true);
      showToast('正在生成 DOCX Word 文档排版...');
      const blob = await generateDocxBlob(post);
      downloadFile(blob, `${post.title}.docx`);
      setIsExporting(false);
      showToast(`文章「${post.title}.docx」生成完成并已下载！`);
    } catch (err) {
      setIsExporting(false);
      console.error('Docx generation error:', err);
      showToast('生成 DOCX 遇到错误，请尝试下载 TXT 格式！');
    }
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

  const handleDelete = () => {
    if (confirm(`确认删除文章「${post.title}」？`)) {
      onDeletePost(post.id);
    }
  };

  const handleSaveEditedArticle = (updatedData) => {
    if (onUpdatePost) {
      onUpdatePost(updatedData);
      showToast(`文章「${updatedData.title}」修改已实时保存！`);
    }
    setIsEditingModalOpen(false);
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-xs font-semibold text-slate-700 border border-slate-200 shadow-xs self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回博文列表</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* 1-Click Download Options: TXT & DOCX */}
          <button
            onClick={handleDownloadTxt}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs"
            title="一键下载为纯文本 TXT"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>下载 TXT</span>
          </button>

          <button
            onClick={handleDownloadDocx}
            disabled={isExporting}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs"
            title="一键下载为 Word 文档 DOCX"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>{isExporting ? '导出中...' : '下载 DOCX'}</span>
          </button>

          <button
            onClick={handleCopyContent}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs"
            title="一键复制文章 Markdown 全文"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-600" />
            <span>复制全文</span>
          </button>

          {/* Author or Admin Controls: Edit & Delete */}
          {canEditOrDelete && (
            <>
              <button
                onClick={() => setIsEditingModalOpen(true)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                title="编辑此文章"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span>编辑文章</span>
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                title="删除文章"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>删除文章</span>
              </button>
            </>
          )}

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
          <div className="rounded-3xl overflow-hidden max-h-[460px] w-full shadow-inner bg-slate-900/10 flex items-center justify-center border border-slate-200/50">
            <img
              src={post.cover}
              alt={post.title}
              className="w-full h-full object-contain max-h-[460px]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Rich Embedded Body Rendering (Media, Images, Citations, Links) */}
        <div className={`text-slate-700 leading-relaxed py-2 ${contentFontSizeClass}`}>
          <RichContentRenderer content={post.content} />
        </div>

        {/* 博客配图区展示 (位于博文正文下方) */}
        {post.images && post.images.length > 0 && (
          <div className="my-6 p-4 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>文章配图精选 ({post.images.length} 张)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {post.images.map((img, idx) => (
                <div key={img.id || idx} className="rounded-2xl overflow-hidden border border-slate-200/60 bg-white shadow-2xs group flex flex-col">
                  <div className="relative aspect-video overflow-hidden bg-slate-100 flex items-center justify-center">
                    <img
                      src={img.url}
                      alt={img.title || `配图 ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  {img.title && (
                    <div className="p-2 text-center text-xs font-medium text-slate-600 truncate bg-white">
                      {img.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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

      {/* Edit Article Modal */}
      {isEditingModalOpen && (
        <NewArticleModal
          isOpen={isEditingModalOpen}
          onClose={() => setIsEditingModalOpen(false)}
          onSave={handleSaveEditedArticle}
          cloudFiles={cloudFiles}
          bookmarks={bookmarks}
          currentUser={currentUser}
          initialData={post}
        />
      )}
    </div>
  );
};
export default BlogPostView;
