import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, Maximize, Smartphone, Monitor, Film, Music } from 'lucide-react';

export const MediaPlayerView = ({ t }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9'); // '16:9', '9:16', '4:3', '1:1'
  const [activeMedia, setActiveMedia] = useState({
    title: '白狐博客宣传片 · 竖屏与横屏全适配演示',
    type: 'video',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    duration: '00:10'
  });

  const mediaList = [
    {
      id: 1,
      title: '横屏展示片 (16:9 宽屏)',
      type: 'video',
      aspect: '16:9',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      poster: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      duration: '00:10'
    },
    {
      id: 2,
      title: '手机短视频 / 抖音竖屏 (9:16 沉浸)',
      type: 'video',
      aspect: '9:16',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
      duration: '00:10'
    },
    {
      id: 3,
      title: '极客播客音频: 多云架构访谈',
      type: 'audio',
      aspect: '1:1',
      url: 'https://www.w3schools.com/html/horse.mp3',
      poster: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=80',
      duration: '01:25'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Film className="w-3.5 h-3.5" />
              <span>全画幅播放器 · 竖屏短视频任意比例</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              多媒体影视与播客视听
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              原生支持 16:9 宽屏、9:16 手机短视频竖屏、4:3、1:1 等任意视频宽高比自适应播放。
            </p>
          </div>

          {/* Aspect Ratio Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 ${
                aspectRatio === '16:9' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>16:9 宽屏</span>
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 ${
                aspectRatio === '9:16' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16 竖屏短视频</span>
            </button>
            <button
              onClick={() => setAspectRatio('4:3')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                aspectRatio === '4:3' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              4:3
            </button>
          </div>
        </div>
      </div>

      {/* Main Player Display Area */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-800">{activeMedia.title}</h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-mono font-bold">
            当前画幅: {aspectRatio}
          </span>
        </div>

        {/* Video Canvas Container with dynamic aspect ratio */}
        <div
          className={`relative rounded-3xl overflow-hidden bg-black shadow-2xl transition-all duration-300 flex items-center justify-center ${
            aspectRatio === '9:16'
              ? 'w-full max-w-[340px] aspect-[9/16]'
              : aspectRatio === '4:3'
              ? 'w-full max-w-[640px] aspect-[4/3]'
              : 'w-full max-w-[800px] aspect-[16/9]'
          }`}
        >
          {activeMedia.type === 'video' ? (
            <video
              src={activeMedia.url}
              poster={activeMedia.poster}
              controls
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-white space-y-4">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/40">
                <Music className="w-10 h-10 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-base">{activeMedia.title}</p>
                <p className="text-xs text-slate-400 mt-1">音频广播播放流</p>
              </div>
              <audio src={activeMedia.url} controls className="mt-4 w-64" />
            </div>
          )}
        </div>
      </div>

      {/* Media Playlist */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800">媒体节目单与短片库</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mediaList.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                setActiveMedia(m);
                if (m.aspect) setAspectRatio(m.aspect);
              }}
              className="group cursor-pointer rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 hover:bg-white hover:border-emerald-400 transition-all p-3 flex space-x-3 items-center"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200">
                <img src={m.poster} alt={m.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white drop-shadow-md" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">
                  {m.title}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[10px] text-slate-400 font-mono">{m.duration}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
                    {m.aspect}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
