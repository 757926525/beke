import React, { useState, useRef } from 'react';
import {
  Music,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Upload,
  Link as LinkIcon,
  Plus,
  Trash2,
  CheckCircle2,
  UploadCloud,
  FolderOpen
} from 'lucide-react';

export default function MediaPlayerView({
  playlist,
  onAddMedia,
  onRemoveMedia,
  onSaveToNetDrive
}) {
  const [currentTrack, setCurrentTrack] = useState(playlist[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [mediaType, setMediaType] = useState('audio');
  const [toastMsg, setToastMsg] = useState(null);

  const localFileRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // Play / Pause toggle
  const togglePlay = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      if (currentTrack.type === 'audio' && audioRef.current) audioRef.current.pause();
      if (currentTrack.type === 'video' && videoRef.current) videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (currentTrack.type === 'audio' && audioRef.current) audioRef.current.play();
      if (currentTrack.type === 'video' && videoRef.current) videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Add via Web URL
  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    const newItem = {
      id: `media-url-${Date.now()}`,
      type: mediaType,
      title: customTitle.trim() || '网络流媒体资源',
      artist: '网络流媒体地址',
      src: customUrl.trim(),
      duration: '在线解析',
      cover: mediaType === 'video'
        ? 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'
    };

    onAddMedia(newItem);
    setCurrentTrack(newItem);
    setIsPlaying(true);
    setCustomUrl('');
    setCustomTitle('');
    setToastMsg(`已成功载入网络${mediaType === 'video' ? '视频' : '音频'}并加入列表！`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Add via Local File
  const handleLocalFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mkv|mov)$/i.test(file.name);
    const fileUrl = URL.createObjectURL(file);

    const newItem = {
      id: `media-file-${Date.now()}`,
      type: isVideo ? 'video' : 'audio',
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: '本地选入媒体',
      src: fileUrl,
      duration: '本地文件',
      cover: isVideo
        ? 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80'
    };

    onAddMedia(newItem);
    setCurrentTrack(newItem);
    setIsPlaying(true);
    setToastMsg(`本地${newItem.type === 'video' ? '视频' : '音频'}《${newItem.title}》已加载并播放！`);
    setTimeout(() => setToastMsg(null), 3500);
    if (localFileRef.current) localFileRef.current.value = '';
  };

  const handleNetDriveSave = async (item) => {
    const res = await onSaveToNetDrive(item);
    setToastMsg(`多媒体资源已转存至网盘：${res.path}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-semibold text-sm mb-1">
            <Music className="w-4 h-4" />
            <span>留声影音</span>
          </div>
          <h2 className="font-serif-sc text-3xl font-bold text-slate-900 dark:text-white">
            白狐多媒体音视频流光播放器
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            可查找和播放本地音频视频文件，也可直接输入网络音视频流媒体网址进行实时串流播放与网盘转存。
          </p>
        </div>

        {/* Local media upload trigger */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={localFileRef}
            onChange={handleLocalFile}
            accept="audio/*,video/*"
            className="hidden"
          />
          <button
            onClick={() => localFileRef.current?.click()}
            className="px-5 py-2.5 rounded-xl fox-gradient text-white font-medium text-sm shadow-md hover:shadow-rose-500/25 transition-all flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            <span>查找/播放本地文件</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Player Display */}
      {currentTrack && (
        <div className="glass-panel p-6 rounded-3xl border border-rose-200/50 dark:border-rose-900/30 overflow-hidden shadow-xl">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Visual Screen / Cover */}
            <div className="w-full lg:w-1/2 aspect-video bg-black rounded-2xl overflow-hidden relative flex items-center justify-center shadow-lg">
              {currentTrack.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={currentTrack.src}
                  controls
                  autoPlay={isPlaying}
                  muted={isMuted}
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={currentTrack.cover}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-black/40">
                    <div
                      className={`w-20 h-20 rounded-full fox-gradient flex items-center justify-center shadow-2xl ${
                        isPlaying ? 'animate-spin' : ''
                      }`}
                      style={{ animationDuration: '10s' }}
                    >
                      <Music className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-serif-sc font-bold text-xl mt-4">{currentTrack.title}</h3>
                    <p className="text-sm text-slate-300">{currentTrack.artist}</p>
                  </div>
                  {/* Invisible Audio Element */}
                  <audio
                    ref={audioRef}
                    src={currentTrack.src}
                    autoPlay={isPlaying}
                    muted={isMuted}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              )}
            </div>

            {/* Controls & Metadata */}
            <div className="w-full lg:w-1/2 space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  {currentTrack.type === 'video' ? '视频回放中' : '音频回放中'}
                </span>
                <span className="text-xs text-slate-400">时长：{currentTrack.duration}</span>
              </div>

              <div>
                <h3 className="font-serif-sc text-2xl font-bold text-slate-900 dark:text-white">
                  {currentTrack.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  来源：{currentTrack.artist}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                  流地址：{currentTrack.src}
                </p>
              </div>

              {/* Player buttons */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-2xl fox-gradient text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => handleNetDriveSave(currentTrack)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition-colors text-xs font-semibold flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>转存至专属网盘</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Network URL Box */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="font-serif-sc font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <LinkIcon className="w-4 h-4 text-rose-500" />
          <span>输入网络流媒体网址播放</span>
        </h3>

        <form onSubmit={handleAddUrl} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-3">
            <input
              type="text"
              placeholder="媒体标题（选填）"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
            />
          </div>
          <div className="sm:col-span-5">
            <input
              type="url"
              required
              placeholder="请输入 MP3 / MP4 / M3U8 / AAC 网址..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
            />
          </div>
          <div className="sm:col-span-2">
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
            >
              <option value="audio">音频 (Audio)</option>
              <option value="video">视频 (Video)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-xl fox-gradient text-white font-medium text-sm shadow-sm hover:opacity-95 transition-opacity"
            >
              添加并播放
            </button>
          </div>
        </form>
      </div>

      {/* Playlist Table */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif-sc font-bold text-lg text-slate-900 dark:text-white">
            媒体播放列表 ({playlist.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {playlist.map((item) => {
            const isCurrent = currentTrack && currentTrack.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setCurrentTrack(item);
                  setIsPlaying(true);
                }}
                className={`py-3 px-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-semibold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-800">
                    <img src={item.cover} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm truncate">{item.title}</p>
                    <p className="text-xs text-slate-400 truncate">{item.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {item.type.toUpperCase()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveMedia(item.id);
                    }}
                    title="从播放列表移除"
                    className="p-1 rounded text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
