import React, { useState } from 'react';
import {
  X, Image as ImageIcon, Upload, Check, Trash2, Plus
} from 'lucide-react';

export default function NewArticleModal({
  isOpen,
  onClose,
  onSave,
  photos = [],
  currentUser = null,
  initialData = null
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.category || '技术视界');
  const [tagsInput, setTagsInput] = useState(initialData?.tags ? initialData.tags.join(', ') : '白狐, 云原生, 架构');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [cover, setCover] = useState(initialData?.cover || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80');
  const [content, setContent] = useState(initialData?.content || '');

  // 博客配图区图片列表 (支持上传本地图片或选择转贴相册图片)
  const [articleImages, setArticleImages] = useState(initialData?.images || []);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);

  if (!isOpen) return null;

  // 上传本地配图并持久化至 R2/D1
  const handleUploadArticleImage = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      const { uploadFileWithFallback } = await import('../services/uploader');
      for (const file of files) {
        const uploadRes = await uploadFileWithFallback(file, { folder: 'article_images' });
        if (uploadRes.success) {
          const imgUrl = uploadRes.url || uploadRes.downloadUrl;
          setArticleImages((prev) => [...prev, {
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            url: imgUrl,
            title: file.name.replace(/\.[^/.]+$/, '')
          }]);
        }
      }
    } catch (err) {
      alert(`配图上传失败: ${err.message}`);
    } finally {
      e.target.value = '';
    }
  };

  // 选择相册转贴图片
  const handleSelectGalleryPhoto = (photo) => {
    const photoUrl = photo.url || photo.downloadUrl;
    if (!photoUrl) return;
    setArticleImages((prev) => [
      ...prev,
      {
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        url: photoUrl,
        title: photo.title || '相册转贴配图'
      }
    ]);
    setIsPhotoPickerOpen(false);
  };

  // 删除单张配图
  const handleRemoveArticleImage = (indexToRemove) => {
    setArticleImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const articleData = {
      id: initialData?.id || `post-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim() || title.trim(),
      content: content.trim(),
      images: articleImages,
      author: initialData?.author || (currentUser?.username ? currentUser.username : '白狐居士'),
      userId: initialData?.userId || currentUser?.id || 'guest',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      category,
      tags: tagsInput.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      cover: cover.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      views: initialData?.views || 1,
      likes: initialData?.likes || 1,
      comments: initialData?.comments || [],
      isBookmarked: initialData?.isBookmarked || false
    };

    onSave(articleData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-2xl text-slate-900 mb-1">
          {initialData ? '编辑白狐文章' : '撰写白狐新文'}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          支持 Markdown 排版撰写、专属博客配图区管理、封面自适应及全站实时同步。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              文章标题 *
            </label>
            <input
              type="text"
              required
              placeholder="例如：云原生多端同步架构深度实践"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                分类专栏
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              >
                <option value="技术视界">技术视界</option>
                <option value="灵感札记">灵感札记</option>
                <option value="生活微语">生活微语</option>
                <option value="读书心得">读书心得</option>
                <option value="影音评鉴">影音评鉴</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                文章标签 (逗号分隔)
              </label>
              <input
                type="text"
                placeholder="架构, 同步, 博客"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              >
              </input>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600">
                封面图 URL
              </label>
              <label className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer flex items-center space-x-1">
                <Upload className="w-3 h-3" />
                <span>上传本地图片作为封面</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const { uploadFileWithFallback } = await import('../services/uploader');
                      const uploadRes = await uploadFileWithFallback(file, { folder: 'covers' });
                      if (uploadRes.success) {
                        setCover(uploadRes.url || uploadRes.downloadUrl);
                      } else {
                        alert(uploadRes.message || '封面上传失败');
                      }
                    } catch (err) {
                      alert(err.message || '封面上传异常');
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="https://... 或点击右上方上传本地图片"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
              />
              {cover && (
                <div className="w-10 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                  <img src={cover} alt="封面预览" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              文章摘要简述
            </label>
            <textarea
              rows="2"
              placeholder="给读者的一句话核心提炼..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              文章正文 (支持 Markdown 排版)
            </label>
            <textarea
              rows="7"
              required
              placeholder="落墨成文，言由心生... 支持自由编写与排版"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono leading-relaxed"
            />
          </div>

          {/* 博客配图区 (置于博文正文下方) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">博客配图区 ({articleImages.length} 张配图)</span>
              </div>
              <div className="flex items-center space-x-2">
                <label className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs">
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>上传本地图片</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleUploadArticleImage}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setIsPhotoPickerOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>转贴相册图片</span>
                </button>
              </div>
            </div>

            {/* 配图缩略图列表与删除 */}
            {articleImages && articleImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {articleImages.map((img, idx) => (
                  <div key={img.id || idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white aspect-video shadow-2xs">
                    <img src={img.url} alt={img.title || '配图'} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveArticleImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-80 hover:opacity-100 cursor-pointer shadow-xs"
                      title="删除配图"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    {img.title && (
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 truncate text-center">
                        {img.title}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                暂无配图，点击上方按钮上传本地图片或选择转贴相册图片
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>{initialData ? '保存更新' : '发布文章'}</span>
            </button>
          </div>
        </form>

        {/* 转贴相册图片选择弹窗 */}
        {isPhotoPickerOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>选择相册图片转贴至配图区</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsPhotoPickerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto grid grid-cols-3 gap-2.5 p-1">
                {photos.length === 0 ? (
                  <div className="col-span-3 py-8 text-center text-slate-400 text-xs">相册中暂无照片</div>
                ) : (
                  photos.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectGalleryPhoto(p)}
                      className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square cursor-pointer hover:border-emerald-500 transition-all"
                    >
                      <img src={p.url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        点击转贴
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate text-center">
                        {p.title}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
