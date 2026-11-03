import React, { useState } from 'react';
import {
  X, Image as ImageIcon, Video, Music, Tag, Send, HardDrive,
  Globe, Film, Upload, Check, ChevronRight, FileText
} from 'lucide-react';

export default function NewArticleModal({
  isOpen,
  onClose,
  onSave,
  cloudFiles = [],
  bookmarks = [],
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

  // Active Picker Modal State: null | 'cloud' | 'bookmark' | 'media'
  const [activePicker, setActivePicker] = useState(null);

  if (!isOpen) return null;

  // Insert helper text into content
  const insertTextAtCursor = (text) => {
    setContent((prev) => prev ? `${prev}\n\n${text}` : text);
  };

  // 1. Handle local file insert (Image / Video / Audio)
  const handleLocalFileInsert = (type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    if (type === 'image') {
      insertTextAtCursor(`![${file.name}](${objectUrl})`);
    } else if (type === 'video') {
      insertTextAtCursor(`🎬 [视频: ${file.name}](${objectUrl})`);
    } else if (type === 'audio') {
      insertTextAtCursor(`🎵 [音频: ${file.name}](${objectUrl})`);
    }
    e.target.value = '';
  };

  // 2. Select Cloud File from Hub
  const handleSelectCloudFile = (file) => {
    if (file.type === 'video' || file.name.match(/\.(mp4|webm)$/i)) {
      insertTextAtCursor(`🎬 [云端视频: ${file.name}](${file.url})`);
    } else if (file.type === 'audio' || file.name.match(/\.(mp3|wav|flac)$/i)) {
      insertTextAtCursor(`🎵 [云端音频: ${file.name}](${file.url})`);
    } else if (file.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      insertTextAtCursor(`![${file.name}](${file.url})`);
    } else {
      insertTextAtCursor(`📦 [调度中枢文件: ${file.name}](${file.url})`);
    }
    setActivePicker(null);
  };

  // 3. Select Bookmark / Search site cite
  const handleSelectBookmark = (b) => {
    insertTextAtCursor(`🌐 **引用网站**：[${b.title}](${b.url})\n> 来源备注: ${b.desc || '白狐搜索中心与收藏夹'}`);
    setActivePicker(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const articleData = {
      id: initialData?.id || `post-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim() || title.trim(),
      content: content.trim(),
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
          支持 Markdown 排版、一键插入本地音视频图片、多云网盘文件引用、搜索中心网站引用及媒体影音文件联动。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              文章标题
            </label>
            <input
              type="text"
              required
              placeholder="请输入灵动深刻的文章标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500"
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
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              >
                <option value="技术视界">技术视界</option>
                <option value="云原生实践">云原生实践</option>
                <option value="数字生活">数字生活</option>
                <option value="青丘随笔">青丘随笔</option>
                <option value="多云架构">多云架构</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                标签 (逗号分隔)
              </label>
              <input
                type="text"
                placeholder="Cloudflare, 存储, 前端"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600">
                封面配图 (可填外部/R2/OSS/COS链接，或直接上传本地图片)
              </label>
              <label className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center space-x-1">
                <Upload className="w-3.5 h-3.5" />
                <span>上传本地封面图片</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setCover(ev.target.result);
                    };
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex items-center space-x-2">
              {cover && (
                <img src={cover} alt="Cover Preview" className="w-12 h-8 object-cover rounded-lg border border-slate-200 shrink-0" />
              )}
              <input
                type="text"
                placeholder="https://... 或点击右上方直接上传本地文件"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
              />
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

          {/* Quick Insert Toolbar */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              快捷插入与站内资源联动：
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* 1-click select photo from Cloud Gallery */}
              <button
                type="button"
                onClick={() => setActivePicker('gallery')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>一键选择插入云相册图片</span>
              </button>

              {/* Insert local image */}
              <label className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>上传本地图片</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLocalFileInsert('image', e)}
                  className="hidden"
                />
              </label>

              {/* Insert local video */}
              <label className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-2xs">
                <Video className="w-3.5 h-3.5 text-sky-600" />
                <span>插入本地视频</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleLocalFileInsert('video', e)}
                  className="hidden"
                />
              </label>

              {/* Insert local audio */}
              <label className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-2xs">
                <Music className="w-3.5 h-3.5 text-purple-600" />
                <span>插入本地音乐</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleLocalFileInsert('audio', e)}
                  className="hidden"
                />
              </label>

              {/* 1-click select NetDrive & Multi-Cloud files */}
              <button
                type="button"
                onClick={() => setActivePicker('cloud')}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs"
              >
                <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                <span>一键插入网盘与多云文件</span>
              </button>

              {/* 1-click cite search center bookmarks */}
              <button
                type="button"
                onClick={() => setActivePicker('bookmark')}
                className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs"
              >
                <Globe className="w-3.5 h-3.5 text-sky-600" />
                <span>一键引用搜索中心网站</span>
              </button>

              {/* 1-click insert Media Library File */}
              <button
                type="button"
                onClick={() => setActivePicker('media')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs"
              >
                <Film className="w-3.5 h-3.5 text-amber-600" />
                <span>一键插入媒体影音文件</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              文章正文 (支持 Markdown 排版)
            </label>
            <textarea
              rows="8"
              required
              placeholder="落墨成文，言由心生... 支持自由编写、编辑与插入多媒体"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono leading-relaxed"
            />
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
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{initialData ? '保存修改' : '发表文章'}</span>
            </button>
          </div>
        </form>

        {/* Modal Pickers: Cloud Gallery Photos (支持从相册各文件夹中一键插入) */}
        {activePicker === 'gallery' && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>从云相册选择插入配图 ({photos.length} 张可用)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setActivePicker(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto flex-1 pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-xs text-slate-400">
                    云相册暂无照片，请先在「光影视界」相册中上传
                  </div>
                ) : (
                  photos.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        insertTextAtCursor(`![${p.title}](${p.url})\n*图注: ${p.title} (${p.folder || p.category || '云相册'})*`);
                        setActivePicker(null);
                      }}
                      className="group cursor-pointer rounded-2xl border border-slate-200 hover:border-emerald-500 overflow-hidden bg-slate-50 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                        <img
                          src={p.url}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-semibold">
                          {p.folder || p.category || '相册'}
                        </span>
                      </div>
                      <div className="p-2.5 space-y-1">
                        <div className="font-bold text-xs text-slate-800 truncate">{p.title}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold flex items-center justify-between">
                          <span>点击一键插入</span>
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Pickers: NetDrive Files */}
        {activePicker === 'cloud' && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-emerald-600" />
                  <span>选择网盘与多云调度中枢文件</span>
                </h4>
                <button onClick={() => setActivePicker(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {cloudFiles.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">调度中枢暂无文件，可在网盘选区新增</p>
                ) : (
                  cloudFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleSelectCloudFile(file)}
                      className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer flex items-center justify-between transition-all"
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-800 truncate max-w-[280px]">{file.name}</div>
                        <div className="text-[10px] text-slate-400">{file.provider} · {file.size}</div>
                      </div>
                      <span className="text-xs text-emerald-600 font-semibold flex items-center">
                        选择插入 <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Pickers: Search Center Bookmarks */}
        {activePicker === 'bookmark' && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-sky-600" />
                  <span>选择引用搜索中心保存的网站</span>
                </h4>
                <button onClick={() => setActivePicker(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {bookmarks.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">暂无保存的网站书签</p>
                ) : (
                  bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      onClick={() => handleSelectBookmark(bm)}
                      className="p-3 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 cursor-pointer flex items-center justify-between transition-all"
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-800">{bm.title}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[280px]">{bm.url}</div>
                      </div>
                      <span className="text-xs text-sky-600 font-semibold flex items-center">
                        引用网址 <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Pickers: Media Center Files */}
        {activePicker === 'media' && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                  <Film className="w-4 h-4 text-amber-600" />
                  <span>选择媒体影音中心保存的文件</span>
                </h4>
                <button onClick={() => setActivePicker(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {[
                  { title: '白狐博客宣传片 · 竖屏与横屏全适配演示', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', type: 'video' },
                  { title: '极速边缘 · 手机短视频竖屏演示 (9:16 沉浸画幅)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', type: 'video' },
                  { title: '东方风韵 · 宽荧幕电影感演示 (21:9 超宽屏)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', type: 'video' },
                  { title: '青丘幽引 · 东方禅意氛围原声曲', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', type: 'audio' },
                  { title: '白狐技术电台: 从单体到多云全球边缘架构', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', type: 'audio' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (item.type === 'video') {
                        insertTextAtCursor(`🎬 [媒体影音: ${item.title}](${item.url})`);
                      } else {
                        insertTextAtCursor(`🎵 [媒体原声: ${item.title}](${item.url})`);
                      }
                      setActivePicker(null);
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-800">{item.title}</div>
                      <div className="text-[10px] text-slate-400">{item.type === 'video' ? '高清视频' : '原声音频'}</div>
                    </div>
                    <span className="text-xs text-amber-600 font-semibold flex items-center">
                      插入媒体 <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
