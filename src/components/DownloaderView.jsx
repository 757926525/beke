import React, { useState } from 'react';
import { Download, Upload, CheckCircle2, FileText, HardDrive, RefreshCw } from 'lucide-react';

export const DownloaderView = ({ t }) => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Trigger simulated download with live animated progress bar
  const handleStartDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  // Trigger simulated upload with live animated progress bar
  const handleStartUpload = () => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 15;
      });
    }, 200);
  };

  const files = [
    {
      name: 'whitefox-blog-pages-dist.zip',
      size: '1.8 MB',
      date: '2025-05-18',
      desc: 'Pages 静态文件一键解压部署包（全平台开箱即用）'
    },
    {
      name: 'whitefox-theme-pack-emerald.json',
      size: '12 KB',
      date: '2025-05-18',
      desc: '白狐翡翠绿与白高质感定制主题预设包'
    },
    {
      name: 'cloudflare-d1-schema-init.sql',
      size: '8 KB',
      date: '2025-05-18',
      desc: 'Cloudflare D1 边缘数据库建表与初始数据脚本'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Download className="w-3.5 h-3.5" />
              <span>极速传输 · 上传下载双向进度中枢</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              资源下载与文件上传中枢
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              提供 Pages 部署产物包、离线数据备份包，集成带动态实时百分比的上传与下载进度条。
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bars Demonstration Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Download Progress Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-800">高速多线程下载</h2>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">
              {downloadProgress}%
            </span>
          </div>

          <p className="text-xs text-slate-500">
            支持断点续传、CDN 边缘加速下载，实时监控下载速率与进度。
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-200 ease-out shadow-xs"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>

          <button
            onClick={handleStartDownload}
            disabled={isDownloading}
            className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-xs"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>正在高速下载中 ({downloadProgress}%)...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>测试下载部署产物包</span>
              </>
            )}
          </button>
        </div>

        {/* Upload Progress Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-sky-600" />
              <h2 className="text-base font-bold text-slate-800">对象存储直传通道</h2>
            </div>
            <span className="text-xs font-mono font-bold text-sky-600">
              {uploadProgress}%
            </span>
          </div>

          <p className="text-xs text-slate-500">
            支持一键直传 Cloudflare R2 / 腾讯云 COS / 阿里云 OSS / AList 驱动网盘。
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-200 ease-out shadow-xs"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <button
            onClick={handleStartUpload}
            disabled={isUploading}
            className="w-full py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-xs"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>正在秒速上传中 ({uploadProgress}%)...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>测试上传至多云存储</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Available Packages */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800">可下载资源包与配置文件</h3>
        <div className="divide-y divide-slate-100">
          {files.map((f, i) => (
            <div key={i} className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800 font-mono">{f.name}</div>
                  <div className="text-[11px] text-slate-400">{f.desc}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xs font-mono text-slate-400">{f.size}</span>
                <button
                  onClick={handleStartDownload}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-xs text-slate-600 font-semibold flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
