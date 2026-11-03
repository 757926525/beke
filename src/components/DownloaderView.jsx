import React, { useState } from 'react';
import {
  Download, Link as LinkIcon, Video, Music, CheckCircle2,
  RefreshCw, Sparkles, Film, FileDown, AlertCircle, Play
} from 'lucide-react';

export const DownloaderView = ({ t }) => {
  const [downloadUrl, setDownloadUrl] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Downloaded items history
  const [downloadHistory, setDownloadHistory] = useState([
    {
      id: 'dl-1',
      title: 'Cloudflare_Edge_Architecture_Masterclass.mp4',
      quality: '4K UltraHD (60fps)',
      bitrate: '18.5 Mbps',
      size: '1.2 GB',
      url: 'https://cdn.example.com/videos/masterclass_4k.mp4',
      status: 'completed',
      date: '2025-05-18 11:20'
    },
    {
      id: 'dl-2',
      title: 'Tencent_EdgeOne_Global_Acceleration.mp4',
      quality: '1080p FHD',
      bitrate: '6.2 Mbps',
      size: '420 MB',
      url: 'https://cdn.example.com/videos/edgeone_1080p.mp4',
      status: 'completed',
      date: '2025-05-17 16:45'
    },
    {
      id: 'dl-3',
      title: 'Guqin_Bamboo_Ambience_Master.flac',
      quality: '无损音频 (FLAC 320kbps)',
      bitrate: '320 kbps',
      size: '48 MB',
      url: 'https://cdn.example.com/audio/guqin.flac',
      status: 'completed',
      date: '2025-05-16 09:12'
    }
  ]);

  const bitrateOptions = [
    { id: '4k', label: '4K 2160p 原画极清', bitrate: '24 Mbps', format: 'MP4 / H.265' },
    { id: '2k', label: '2K 1440p 2K高清', bitrate: '12 Mbps', format: 'MP4 / H.264' },
    { id: '1080p60', label: '1080p 60帧 高帧率', bitrate: '8.5 Mbps', format: 'MP4 / H.264' },
    { id: '1080p', label: '1080p 全高清 (推荐)', bitrate: '5.0 Mbps', format: 'MP4' },
    { id: '720p', label: '720p 高清省流', bitrate: '2.5 Mbps', format: 'MP4' },
    { id: 'audio', label: '仅提取音频 (320kbps FLAC/MP3)', bitrate: '320 kbps', format: 'MP3 / FLAC' }
  ];

  const handleStartDownload = (e) => {
    e.preventDefault();
    if (!downloadUrl.trim()) return;

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadSpeed('12.4 MB/s');
    setStatusMessage('正在解析视频流并建立多线程下载连接...');

    const chosenOption = bitrateOptions.find((b) => b.id === selectedQuality) || bitrateOptions[3];

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setDownloadProgress(current);

      if (current >= 30 && current < 70) {
        setDownloadSpeed('24.8 MB/s');
        setStatusMessage('正在分片并发下载音视频轨...');
      } else if (current >= 70 && current < 100) {
        setDownloadSpeed('18.2 MB/s');
        setStatusMessage('正在自动混流音视频数据与元信息封装...');
      } else if (current >= 100) {
        clearInterval(interval);
        setIsDownloading(false);
        setDownloadProgress(100);
        setStatusMessage('下载与封装完成！文件已存入云端下载库。');

        // Extract filename from URL or fallback
        const urlPart = downloadUrl.split('/').pop().split('?')[0] || 'WhiteFox_Stream_Media.mp4';
        const newRecord = {
          id: 'dl-' + Date.now(),
          title: urlPart.includes('.') ? urlPart : `${urlPart}_${chosenOption.id}.mp4`,
          quality: chosenOption.label,
          bitrate: chosenOption.bitrate,
          size: selectedQuality === '4k' ? '1.8 GB' : selectedQuality === 'audio' ? '35 MB' : '380 MB',
          url: downloadUrl,
          status: 'completed',
          date: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };

        setDownloadHistory([newRecord, ...downloadHistory]);
        setDownloadUrl('');

        setTimeout(() => {
          setStatusMessage('');
        }, 4000);
      }
    }, 280);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Download className="w-3.5 h-3.5" />
              <span>全能云端下载 · 仅下载纯净体验</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              云端文件与音视频解析下载
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              输入任意互联网音视频或文件网址，支持多码率（4K / 2K / 1080p60 / 音频提取）高速多线程并发下载。
            </p>
          </div>
        </div>
      </div>

      {/* URL Input & Bitrate Selector Form */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
          <LinkIcon className="w-4 h-4 text-emerald-600" />
          <span>输入下载网址与选择输出码率</span>
        </h2>

        <form onSubmit={handleStartDownload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              互联网下载直链或视频网页 URL
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://example.com/video.mp4 或 bilibili/youtube/通用网络直链..."
                className="w-full pl-4 pr-3 py-3 rounded-2xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400 font-mono shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">
              视频解析与音频码率档位
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {bitrateOptions.map((opt) => {
                const isSelected = selectedQuality === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setSelectedQuality(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{opt.label}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {opt.bitrate}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">格式：{opt.format}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Download Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isDownloading || !downloadUrl.trim()}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>正在高速多线程下载中... ({downloadProgress}%)</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>解析并立即开始下载</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Progress Bar when downloading */}
        {isDownloading && (
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-800 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{statusMessage}</span>
              </span>
              <div className="flex items-center space-x-3 text-slate-500 font-mono">
                <span>{downloadSpeed}</span>
                <span className="font-bold text-emerald-600">{downloadProgress}%</span>
              </div>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden p-0.5">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {statusMessage && !isDownloading && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Download History List */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
            <Film className="w-4 h-4 text-emerald-600" />
            <span>已下载媒体与文件库 ({downloadHistory.length})</span>
          </h3>
          <span className="text-xs text-slate-400">已就绪高速缓存</span>
        </div>

        <div className="divide-y divide-slate-100">
          {downloadHistory.map((item) => (
            <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                  <FileDown className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="truncate max-w-sm sm:max-w-md">{item.title}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                    {item.quality}
                  </span>
                  <span>码率: {item.bitrate}</span>
                  <span>•</span>
                  <span>文件大小: {item.size}</span>
                  <span>•</span>
                  <span>下载时间: {item.date}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-xs text-slate-600 font-semibold flex items-center space-x-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>导出本地</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
