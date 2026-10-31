import React, { useState } from 'react';
import { X, Image, Tag, Send } from 'lucide-react';

export default function NewArticleModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('技术视界');
  const [tagsInput, setTagsInput] = useState('白狐, 云原生, 架构');
  const [summary, setSummary] = useState('');
  const [cover, setCover] = useState('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newArticle = {
      id: `post-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim() || title.trim(),
      content: content.trim(),
      author: '白狐居士',
      date: new Date().toISOString().split('T')[0],
      category,
      tags: tagsInput.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      cover: cover.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      views: 1,
      likes: 1,
      isBookmarked: false
    };

    onSave(newArticle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-serif-sc font-bold text-2xl text-slate-900 dark:text-white mb-6">
          撰写白狐新文
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              文章标题
            </label>
            <input
              type="text"
              required
              placeholder="请输入灵动深刻的文章标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                分类专栏
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
              >
                <option value="技术视界">技术视界</option>
                <option value="云原生实践">云原生实践</option>
                <option value="数字生活">数字生活</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                标签 (逗号分隔)
              </label>
              <input
                type="text"
                placeholder="Cloudflare, 存储, 前端"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              封面配图 URL (可填 R2 / OSS / COS 链接)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              文章摘要简述
            </label>
            <textarea
              rows="2"
              placeholder="给读者的一句话核心提炼..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              文章正文 (支持 Markdown 排版)
            </label>
            <textarea
              rows="6"
              required
              placeholder="落墨成文，言由心生..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white font-serif-sc leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-400"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl fox-gradient text-white font-medium text-sm shadow-md flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>发表文章</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
