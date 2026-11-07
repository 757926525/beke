import React, { useState, useRef } from 'react';
import {
  Play, Pause, RotateCcw, Volume2, Maximize, Smartphone, Monitor, Film, Music,
  Upload, Trash2, Plus, Download, CheckCircle2, Video, Radio, Layers, Eye, RefreshCw,
  FolderInput, HardDrive, Check, AlignLeft, List
} from 'lucide-react';
import { downloadFile } from '../services/documentConverter';

export const MediaPlayerView = ({
  currentUser,
  isAdmin,
  mediaList,
  setMediaList,
  cloudFiles,
  setCloudFiles,
  t
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('auto'); // 'auto', '16:9', '9:16', '4:3', '21:9', '1:1'
  const [viewMode, setViewMode] = useState('medium'); // 'large' | 'medium' | 'small' | 'detail'
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [toastMessage, setToastMessage] = useState('');

  const [activeMedia, setActiveMedia] = useState(mediaList[0] || {
    id: 'm-default',
    title: '白狐博客宣传片',
    desc: '东方美学设计，全平台响应式与边缘计算多云博客技术宣传片',
    type: 'video',
    aspect: '16:9',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    duration: '09:56',
    size: '12.4 MB',
    date: '2025-05-18'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Switch media item
  const handleSelectMedia = (m) => {
    setActiveMedia(m);
    if (m.aspect) {
      setAspectRatio(m.aspect);
    } else {
      setAspectRatio('auto');
    }
    setIsPlaying(false);
  };

  // Upload directly to URL / web storage entry
  const handleDirectWebUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video');
    const isAudio = file.type.startsWith('audio');

    if (!isVideo && !isAudio) {
      showToast('请选择有效的音视频文件（MP4、WebM、MP3等）！');
      return;
    }

    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const newMediaItem = {
        id: `media-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        desc: `上传的${isVideo ? '视频' : '音频'}媒体 (${sizeStr})`,
        type: isVideo ? 'video' : 'audio',
        aspect: 'auto',
        url: dataUrl,
        poster: isVideo
          ? 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        duration: '在线媒体',
        size: sizeStr,
        date: new Date().toISOString().split('T')[0],
        uploadedBy: currentUser?.username || '用户',
        userId: currentUser?.id || 'guest'
      };

      setMediaList([newMediaItem, ...mediaList]);
      setActiveMedia(newMediaItem);
      setAspectRatio('auto');
      showToast(`媒体「${file.name}」已上传挂载成功！`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Permission helper: admin can manage all, user can manage own uploaded media
  const canManageMedia = (m) => {
    if (isAdmin) return true;
    if (currentUser && m.userId && m.userId === currentUser.id) return true;
    if (currentUser && m.uploadedBy && m.uploadedBy === currentUser.username) return true;
    return false;
  };

  // Delete media item
  const handleDeleteMedia = (id, title, e) => {
    if (e) e.stopPropagation();
    const target = mediaList.find((m) => m.id === id);
    if (!canManageMedia(target)) {
      showToast('权限不足：仅管理员或上传者可删除该媒体！');
      return;
    }
    if (window.confirm(`确认删除媒体项目「${title}」吗？`)) {
      const remaining = mediaList.filter((m) => m.id !== id);
      setMediaList(remaining);
      if (activeMedia.id === id && remaining.length > 0) {
        setActiveMedia(remaining[0]);
      }
      showToast(`已成功移除「${title}」！`);
    }
  };

  // Download media file using universal downloadFile with progress bar
  const handleDownloadMedia = async (m, e) => {
    if (e) e.stopPropagation();
    try {
      const ext = m.type === 'video' ? 'mp4' : 'mp3';
      const cleanTitle = m.title.replace(/[\\/:*?"<>|]/g, '_');
      await downloadFile(m.url, `${cleanTitle}.${ext}`);
      showToast(`已开始下载媒体文件「${m.title}」！`);
    } catch (err) {
      console.error('Media download error:', err);
      // Fallback direct open
      window.open(m.url, '_blank');
      showToast(`已在新标签页打开媒体文件「${m.title}」进行直接保存！`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Film className="w-3.5 h-3.5" />
              <span>全画幅多媒体影视厅 · 视频影音中枢</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              白狐媒体影音中枢
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              支持自适应比例画幅、16:9 宽屏、9:16 手机短视频竖屏、21:9 影院超宽画幅与 4:3 比例切换；支持直传网盘与媒体库。
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {currentUser && (
              <label className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-2 shadow-xs cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>直传网盘与媒体库</span>
                <input
                  type="file"
                  accept="video/*,audio/*"
                  onChange={handleDirectWebUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Main Player Display Cinema Showcase */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center">
        {/* Top Control Bar with Aspect Ratio Switcher */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800">{activeMedia.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{activeMedia.desc}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Aspect Ratio Switcher Pills including Auto */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">画幅调节:</span>
              {[
                { id: 'auto', label: '自适应', icon: Maximize },
                { id: '16:9', label: '16:9 宽屏', icon: Monitor },
                { id: '9:16', label: '9:16 竖屏', icon: Smartphone },
                { id: '21:9', label: '21:9 影院', icon: Film },
                { id: '4:3', label: '4:3 经典', icon: Layers },
              ].map((ratio) => {
                const Icon = ratio.icon;
                const isActive = aspectRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{ratio.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="w-full flex justify-center py-2">
          <div
            className={`relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl transition-all duration-300 border border-slate-800 flex items-center justify-center ${
              aspectRatio === '9:16'
                ? 'w-full max-w-[360px] aspect-[9/16]'
                : aspectRatio === '21:9'
                ? 'w-full max-w-[960px] aspect-[21/9]'
                : aspectRatio === '4:3'
                ? 'w-full max-w-[680px] aspect-[4/3]'
                : aspectRatio === 'auto'
                ? 'w-full max-w-[920px] max-h-[580px]'
                : 'w-full max-w-[860px] aspect-[16/9]'
            }`}
          >
            {activeMedia.type === 'video' ? (
              <video
                ref={videoRef}
                key={activeMedia.url}
                src={activeMedia.url}
                poster={activeMedia.poster}
                controls
                playsInline
                className="w-full h-full max-h-[580px] object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-white space-y-5">
                <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-xl border border-emerald-500/30">
                  <img
                    src={activeMedia.poster}
                    alt={activeMedia.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-xs flex items-center justify-center">
                    <Music className="w-12 h-12 text-emerald-300 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-emerald-100">{activeMedia.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm">{activeMedia.desc}</p>
                </div>
                <audio
                  ref={audioRef}
                  key={activeMedia.url}
                  src={activeMedia.url}
                  controls
                  className="w-full max-w-md accent-emerald-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Playlist & File Management */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              白狐媒体节目库与文件管理 ({mediaList.length})
            </h3>
            <p className="text-xs text-slate-400">
              集中式在线媒体流，支持自适应比例与高清播放
            </p>
          </div>
          {/* 4 View Modes */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl space-x-1 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('large')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${viewMode === 'large' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              大图
            </button>
            <button
              type="button"
              onClick={() => setViewMode('medium')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${viewMode === 'medium' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              中图
            </button>
            <button
              type="button"
              onClick={() => setViewMode('small')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${viewMode === 'small' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              小图
            </button>
            <button
              type="button"
              onClick={() => setViewMode('detail')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${viewMode === 'detail' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              详细列表
            </button>
          </div>
        </div>

        {viewMode === 'detail' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">媒体标题</th>
                  <th className="py-2.5 px-3">类型</th>
                  <th className="py-2.5 px-3">时长</th>
                  <th className="py-2.5 px-3">大小</th>
                  <th className="py-2.5 px-3">日期</th>
                  <th className="py-2.5 px-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mediaList.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => handleSelectMedia(m)}>
                    <td className="py-3 px-3 font-semibold text-slate-800 flex items-center space-x-2">
                      <img src={m.poster} alt={m.title} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="truncate max-w-[200px]">{m.title}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px]">{m.type}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{m.duration}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{m.size}</td>
                    <td className="py-3 px-3 text-slate-400">{m.date}</td>
                    <td className="py-3 px-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDownloadMedia(m, e)}
                        className="p-1 rounded-lg text-slate-500 hover:text-emerald-600"
                        title="下载"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {canManageMedia(m) && (
                        <button
                          onClick={(e) => handleDeleteMedia(m.id, m.title, e)}
                          className="p-1 rounded-lg text-rose-400 hover:text-rose-600"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className={`grid gap-4 ${
              viewMode === 'large'
                ? 'grid-cols-1 sm:grid-cols-2'
                : viewMode === 'medium'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            }`}
          >
            {mediaList.map((m) => {
              const isSelected = activeMedia.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectMedia(m)}
                  className={`group cursor-pointer rounded-2xl border transition-all p-3 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'bg-white/80 hover:bg-white border-slate-200 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 mb-2">
                      <img
                        src={m.poster}
                        alt={m.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md">
                          <Play className="w-4 h-4 ml-0.5 text-emerald-700" />
                        </div>
                      </div>
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-mono">
                        {m.type === 'video' ? '视频' : '音频'}
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-emerald-300 font-mono">
                        {m.duration}
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {m.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {m.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{m.size}</span>
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDownloadMedia(m, e)}
                        className="p-1 rounded-lg text-slate-500 hover:text-emerald-600"
                        title="下载"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {canManageMedia(m) && (
                        <button
                          onClick={(e) => handleDeleteMedia(m.id, m.title, e)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default MediaPlayerView;
