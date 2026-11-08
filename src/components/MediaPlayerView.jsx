import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, RotateCcw, Volume2, Maximize, Smartphone, Monitor, Film, Music,
  Upload, Trash2, Plus, Download, CheckCircle2, Video, Radio, Layers, Eye, RefreshCw,
  FolderInput, HardDrive, Check
} from 'lucide-react';
import { handleImageError } from '../services/utils';
import { saveVaultFile, getVaultFileUrl, deleteVaultFile, revokeVaultFileUrl } from '../services/indexedDbVault';

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
  const [aspectRatio, setAspectRatio] = useState('16:9'); // '16:9', '9:16', '4:3', '21:9', '1:1'
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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

  // Re-hydrate any IndexedDB vault-backed media URLs across reloads
  useEffect(() => {
    let isCancelled = false;

    const restoreVaultUrls = async () => {
      let hasUpdates = false;
      const updatedList = await Promise.all(
        mediaList.map(async (m) => {
          if (m.vaultId) {
            const vaultUrl = await getVaultFileUrl(m.vaultId);
            if (vaultUrl && vaultUrl !== m.url) {
              hasUpdates = true;
              return { ...m, url: vaultUrl };
            }
          }
          return m;
        })
      );

      if (!isCancelled && hasUpdates) {
        setMediaList(updatedList);
        if (activeMedia.vaultId) {
          const activeUpdated = updatedList.find((item) => item.id === activeMedia.id);
          if (activeUpdated) {
            setActiveMedia(activeUpdated);
          }
        }
      }
    };

    restoreVaultUrls();
    return () => {
      isCancelled = true;
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Switch media item
  const handleSelectMedia = async (m) => {
    let target = m;
    if (m.vaultId) {
      const vaultUrl = await getVaultFileUrl(m.vaultId);
      if (vaultUrl) {
        target = { ...m, url: vaultUrl };
      }
    }
    setActiveMedia(target);
    if (target.aspect) {
      setAspectRatio(target.aspect);
    }
    setIsPlaying(false);
  };

  // 1-Click transfer to in-site storage / NetDrive
  const handleTransferToStorage = (m, e) => {
    if (e) e.stopPropagation();
    if (setCloudFiles) {
      const newCloudFile = {
        id: 'cf-transfer-' + Date.now(),
        name: `${m.title}.${m.type === 'video' ? 'mp4' : 'mp3'}`,
        url: m.url,
        provider: '站内本地存储',
        bucketKey: 'local',
        size: m.size || '3.5 MB',
        type: m.type,
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      setCloudFiles((prev) => [newCloudFile, ...prev]);
      showToast(`已成功将「${m.title}」一键转存到站内存储池与调度中枢！`);
    } else {
      showToast(`已将「${m.title}」转存至站内媒体库！`);
    }
  };

  // Local media file upload - backed directly by IndexedDB Vault
  // Completely eliminates QuotaExceededError and broken Blob URLs
  const handleLocalMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video') || /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(file.name);
    const isAudio = file.type.startsWith('audio') || /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(file.name);

    if (!isVideo && !isAudio) {
      showToast('请选择有效的音视频文件（MP4、WebM、MOV、MP3、FLAC等）！');
      e.target.value = '';
      return;
    }

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = `${sizeMb} MB`;
    const mediaId = `media-${Date.now()}`;
    const vaultId = `media-vault-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    setIsUploading(true);
    showToast(`正在将「${file.name}」写入本地高可用保险箱 (${sizeStr})...`);

    try {
      // 1. Save binary directly to IndexedDB
      await saveVaultFile(vaultId, file, {
        name: file.name,
        type: file.type || (isVideo ? 'video/mp4' : 'audio/mp3'),
        size: file.size
      });

      // 2. Obtain a persistent managed Object URL
      const playableUrl = await getVaultFileUrl(vaultId);

      const newMediaItem = {
        id: mediaId,
        vaultId: vaultId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        desc: `本地持久保存的${isVideo ? '视频' : '音频'}媒体 (${sizeStr})`,
        type: isVideo ? 'video' : 'audio',
        aspect: isVideo ? '16:9' : '1:1',
        url: playableUrl,
        poster: isVideo
          ? 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        duration: '本地高清流',
        size: sizeStr,
        date: new Date().toISOString().split('T')[0],
        uploadedBy: currentUser?.username || '用户',
        userId: currentUser?.id || 'guest',
        isLocalUpload: true,
        updatedAt: Date.now(),
        deleted: false
      };

      const updated = [newMediaItem, ...mediaList];
      setMediaList(updated);
      setActiveMedia(newMediaItem);
      if (isVideo) setAspectRatio('16:9');
      showToast(`本地媒体「${file.name}」已存入保险箱，刷新页面不丢失！`);
    } catch (err) {
      console.error('Failed to upload media:', err);
      showToast('上传存储失败，请重试');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Permission helper: admin can manage all, user can manage own uploaded media
  const canManageMedia = (m) => {
    if (isAdmin) return true;
    if (currentUser && m.userId && m.userId === currentUser.id) return true;
    if (currentUser && m.uploadedBy && m.uploadedBy === currentUser.username) return true;
    return false;
  };

  // Delete media item
  const handleDeleteMedia = async (id, title, e) => {
    if (e) e.stopPropagation();
    const target = mediaList.find((m) => m.id === id);
    if (!canManageMedia(target)) {
      showToast('权限不足：仅管理员或上传者可删除该媒体！');
      return;
    }
    if (window.confirm(`确认删除媒体项目「${title}」吗？`)) {
      if (target?.vaultId) {
        revokeVaultFileUrl(target.vaultId);
        await deleteVaultFile(target.vaultId);
      }
      const remaining = mediaList.filter((m) => m.id !== id);
      setMediaList(remaining);
      if (activeMedia.id === id && remaining.length > 0) {
        setActiveMedia(remaining[0]);
      }
      showToast(`已成功移除「${title}」！`);
    }
  };

  // Download media file
  const handleDownloadMedia = (m, e) => {
    if (e) e.stopPropagation();
    const link = document.createElement('a');
    link.href = m.url;
    link.download = `${m.title}.${m.type === 'video' ? 'mp4' : 'mp3'}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`开始下载「${m.title}」！`);
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
              <span>全画幅多媒体影视厅 · 持久化媒体中枢</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              白狐媒体影音中枢
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              原生适配 16:9 宽屏、9:16 手机短视频竖屏、21:9 影院超宽画幅与 4:3 复古比例；上传音视频持久化保存，页面刷新不丢失。
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {currentUser && (
              <label className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-2 shadow-xs cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>上传本地音视频 (持久保存)</span>
                <input
                  type="file"
                  accept="video/*,audio/*"
                  onChange={handleLocalMediaUpload}
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
            {/* 1-click Transfer button */}
            <button
              onClick={(e) => handleTransferToStorage(activeMedia, e)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer"
              title="转存到站内存储池与调度中枢"
            >
              <FolderInput className="w-3.5 h-3.5 text-emerald-600" />
              <span>一键转存到站内</span>
            </button>

            {/* Aspect Ratio Switcher Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">画幅调节:</span>
              {[
                { id: '16:9', label: '16:9 宽屏', icon: Monitor },
                { id: '9:16', label: '9:16 竖屏短视频', icon: Smartphone },
                { id: '21:9', label: '21:9 影院超宽', icon: Film },
                { id: '4:3', label: '4:3 经典', icon: Layers },
              ].map((ratio) => {
                const Icon = ratio.icon;
                const isActive = aspectRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
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
            className={`relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl transition-all duration-500 border border-slate-800 flex items-center justify-center ${
              aspectRatio === '9:16'
                ? 'w-full max-w-[360px] aspect-[9/16]'
                : aspectRatio === '21:9'
                ? 'w-full max-w-[960px] aspect-[21/9]'
                : aspectRatio === '4:3'
                ? 'w-full max-w-[680px] aspect-[4/3]'
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
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-white space-y-5">
                <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-xl border border-emerald-500/30">
                  <img
                    src={activeMedia.poster}
                    alt={activeMedia.title}
                    onError={handleImageError}
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
              数据自动持久化到本地存储，页面刷新不丢失；支持一键转存至站内存储中枢
            </p>
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
            全域本地持久化已激活 · 实时同步
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mediaList.map((m) => {
            const isSelected = activeMedia.id === m.id;
            return (
              <div
                key={m.id}
                onClick={() => handleSelectMedia(m)}
                className={`group cursor-pointer rounded-2xl border transition-all p-3.5 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'bg-white/80 hover:bg-white border-slate-200 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 mb-3">
                    <img
                      src={m.poster}
                      alt={m.title}
                      loading="lazy"
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-0.5 text-emerald-700" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white font-mono uppercase">
                      {m.type === 'video' ? '视频' : '音频'} · {m.aspect}
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] text-emerald-300 font-mono">
                      {m.duration}
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {m.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span>{m.size}</span>
                    <span>•</span>
                    <span>{m.date}</span>
                  </div>

                  {/* Management Buttons */}
                  <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleTransferToStorage(m, e)}
                      className="p-1 rounded-lg hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 cursor-pointer"
                      title="一键转存到站内"
                    >
                      <FolderInput className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDownloadMedia(m, e)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-600 cursor-pointer"
                      title="下载本地媒体"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {canManageMedia(m) && (
                      <button
                        onClick={(e) => handleDeleteMedia(m.id, m.title, e)}
                        className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="删除此媒体"
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
      </div>
    </div>
  );
};
export default MediaPlayerView;
