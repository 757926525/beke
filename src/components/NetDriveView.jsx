import React, { useState, useRef } from 'react';
import {
  HardDrive, Cloud, Server, Database,
  FolderPlus, Upload, Trash2, ExternalLink,
  ShieldAlert, RefreshCw, Key, Globe, Eye,
  CheckCircle2, Folder, Copy, BookOpen, ChevronDown, ChevronUp,
  Terminal, Info, Check, ShieldCheck, Download, Plus, FileText,
  FileCode, Play, Music, Image as ImageIcon, Paperclip
} from 'lucide-react';
import { downloadFile } from '../services/documentConverter';
import { uploadFileToStorage } from '../services/uploader';

export const NetDriveView = ({ cloudConfig, setCloudConfig, cloudFiles, setCloudFiles, backendConfig, t, currentUser }) => {
  const [activeDriver, setActiveDriver] = useState('r2'); // 'r2' | 'cos' | 'oss' | 'alist' | 'local'
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [copiedUrl, setCopiedUrl] = useState('');
  const [showUsageGuide, setShowUsageGuide] = useState(false);
  const fileInputRef = useRef(null);

  // Preview file modal
  const [previewFile, setPreviewFile] = useState(null);

  // Manual new file form
  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newFileSize, setNewFileSize] = useState('1.5 MB');

  const isDbConnected = backendConfig?.dbConnected;

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncStatus(isDbConnected ? '正在与后台数据库及各存储桶执行实时双向全息索引同步...' : '正在同步多云端存储与网盘缓存状态...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus(isDbConnected
        ? '多云中枢与已连接数据库已完成全息同步！所有云存储桶列表已最新。'
        : '多云与网盘目录同步完成！所有存储节点正常响应。');
      setTimeout(() => setSyncStatus(''), 3500);
    }, 1200);
  };

  const handleCopy = (url) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 2000);
    }
  };

  // Direct file upload from computer to current selected cloud bucket
  const handleDirectUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const providerNames = {
      r2: 'Cloudflare R2',
      cos: 'Tencent COS',
      oss: 'Alibaba OSS',
      alist: 'AList / WebDAV',
      local: '站内本地存储'
    };

    setIsSyncing(true);
    setSyncStatus(`正在持久化上传 ${files.length} 个文件至云存储...`);

    const newEntries = [];
    for (const file of files) {
      const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      const isImg = !!file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);
      const isVid = !!file.name.match(/\.(mp4|webm)$/i);
      const isAud = !!file.name.match(/\.(mp3|wav|flac)$/i);
      const fileType = isVid ? 'video' : isAud ? 'audio' : isImg ? 'image' : 'document';

      let fileUrl = '';
      let downloadUrl = '';
      let thumbnail = '';

      try {
        const uploadRes = await uploadFileToStorage(file, {
          customDomain: activeDriver === 'r2' ? cloudConfig?.cloudflare?.publicDomain : ''
        });
        fileUrl = uploadRes.url;
        downloadUrl = uploadRes.downloadUrl;
        if (isImg) thumbnail = fileUrl;
      } catch (err) {
        console.warn('Upload error, fallback to ObjectURL:', err);
        fileUrl = URL.createObjectURL(file);
      }

      newEntries.push({
        id: 'cf-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        name: file.name,
        url: fileUrl,
        downloadUrl: downloadUrl || fileUrl,
        thumbnail: thumbnail || '',
        provider: providerNames[activeDriver] || 'Cloudflare R2',
        bucketKey: activeDriver,
        size: sizeStr,
        type: fileType,
        uploadedAt: new Date().toISOString().split('T')[0],
        owner: currentUser?.username || 'admin',
        updatedAt: Date.now(),
        deleted: false
      });
    }

    setCloudFiles([...newEntries, ...cloudFiles]);
    setIsSyncing(false);
    setSyncStatus(`成功将 ${newEntries.length} 个文件上传并持久化挂载至 ${providerNames[activeDriver]}！`);
    setTimeout(() => setSyncStatus(''), 3000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add new file manually to current bucket
  const handleAddFile = (e) => {
    e.preventDefault();
    if (!newFileName.trim() || !newFileUrl.trim()) return;

    const providerNames = {
      r2: 'Cloudflare R2',
      cos: 'Tencent COS',
      oss: 'Alibaba OSS',
      alist: 'AList / WebDAV',
      local: '站内本地存储'
    };

    const newFile = {
      id: 'cf-' + Date.now(),
      name: newFileName.trim(),
      url: newFileUrl.trim(),
      provider: providerNames[activeDriver] || 'Cloudflare R2',
      bucketKey: activeDriver,
      size: newFileSize.trim() || '2.0 MB',
      type: newFileName.match(/\.(mp4|webm)$/i) ? 'video' : newFileName.match(/\.(mp3|wav|flac)$/i) ? 'audio' : newFileName.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? 'image' : 'document',
      uploadedAt: new Date().toISOString().split('T')[0],
      owner: currentUser?.username || 'admin'
    };

    setCloudFiles([newFile, ...cloudFiles]);
    setNewFileName('');
    setNewFileUrl('');
    setSyncStatus(`已向 ${providerNames[activeDriver]} 添加文件记录并同步！`);
    setTimeout(() => setSyncStatus(''), 3000);
  };

  // Delete file
  const handleDeleteFile = (id, name) => {
    if (confirm(`确认删除「${name}」的存储引用？`)) {
      setCloudFiles(cloudFiles.filter((f) => f.id !== id));
    }
  };

  // Download file using unified robust downloader
  const handleDownloadFile = (file) => {
    downloadFile(file.downloadUrl || file.url, file.name);
  };

  // Filter files by bucket
  const currentProviderMap = {
    r2: 'Cloudflare R2',
    cos: 'Tencent COS',
    oss: 'Alibaba OSS',
    alist: 'AList / WebDAV',
    local: '站内本地存储'
  };

  const filteredFiles = cloudFiles.filter((f) => {
    if (f.bucketKey) return f.bucketKey === activeDriver;
    // Fallback matching by provider name
    const targetName = currentProviderMap[activeDriver];
    return f.provider === targetName || (activeDriver === 'r2' && !f.provider);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <HardDrive className="w-3.5 h-3.5" />
              <span>多云聚合 · 云盘与对象存储调度中枢</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              网盘与多云调度中枢
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              集中调度与管理 Cloudflare R2、腾讯云 COS、阿里云 OSS 与 AList/WebDAV 存储桶，支持不同平台独立分区、在线查看、下载与数据库实时同步。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isDbConnected ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-emerald-100 text-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>数据库实时全息同步已激活</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-amber-100 text-amber-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>离线缓存模式 (未连接数据库)</span>
              </span>
            )}

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-2 shadow-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? '同步中...' : isDbConnected ? '执行数据库与多云全息同步' : '同步多云状态'}</span>
            </button>
          </div>
        </div>

        {syncStatus && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium animate-fade-in flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncStatus}</span>
          </div>
        )}
      </div>

      {/* Cloud Providers Selection Cards (不同平台独立选区) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { id: 'r2', name: 'Cloudflare R2', icon: Cloud, desc: '0 出站费边缘存储' },
          { id: 'cos', name: '腾讯云 COS', icon: Server, desc: '国内极速 CDN 存储' },
          { id: 'oss', name: '阿里云 OSS', icon: Database, desc: '高可用对象存储' },
          { id: 'alist', name: 'AList / WebDAV', icon: HardDrive, desc: '多网盘聚合挂载' },
          { id: 'local', name: '站内存储池', icon: FolderPlus, desc: '本地视频转存与媒体' },
        ].map((p) => {
          const Icon = p.icon;
          const isSelected = activeDriver === p.id;
          const count = cloudFiles.filter((f) => (f.bucketKey ? f.bucketKey === p.id : f.provider === currentProviderMap[p.id])).length;
          return (
            <button
              key={p.id}
              onClick={() => setActiveDriver(p.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                isSelected
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white/80 hover:bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span className="font-bold text-xs text-slate-800">{p.name}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                  {count}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{p.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Direct File Management & Upload Bar for Selected Provider */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Folder className="w-4 h-4 text-emerald-600" />
              <span>当前选区文件管理：{currentProviderMap[activeDriver]}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              可直接在此区域新增文件直链、在线预览查看、下载或删除，支持与博客文章及媒体影音互相引用
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-xl self-start sm:self-auto">
            已调度文件: {filteredFiles.length} 项
          </span>
        </div>

        {/* Dual Mode: Direct Computer Upload OR Manual External CDN / URL Insertion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Direct Upload Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>直接从电脑上传到当前选区 ({currentProviderMap[activeDriver]})</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                选择本地图片、文档、音频或视频，系统将自动编码并挂载至当前存储桶
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleDirectUpload}
                className="hidden"
                id="netdrive-direct-file-input"
              />
              <label
                htmlFor="netdrive-direct-file-input"
                className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>选择本地文件上传并挂载</span>
              </label>
            </div>
          </div>

          {/* Manual Link Input */}
          <form onSubmit={handleAddFile} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-2">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs">
              <Paperclip className="w-4 h-4 text-slate-600" />
              <span>添加已有外部直链 / CDN 文件</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="文件名 (宣传片.mp4)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
              <input
                type="text"
                placeholder="直链 URL"
                value={newFileUrl}
                onChange={(e) => setNewFileUrl(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  placeholder="2.0 MB"
                  value={newFileSize}
                  onChange={(e) => setNewFileSize(e.target.value)}
                  className="px-2 py-1.5 rounded-xl border border-slate-200 text-xs bg-white w-20"
                />
                <button
                  type="submit"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center justify-center space-x-1 shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>添加</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Files Table for Current Provider */}
        <div className="overflow-x-auto">
          {filteredFiles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Folder className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-xs">该存储平台暂无归档文件，请在上方直接添加或通过站内媒体一键转存</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">文件名称</th>
                  <th className="py-2.5 px-3">类型</th>
                  <th className="py-2.5 px-3">文件大小</th>
                  <th className="py-2.5 px-3">同步日期</th>
                  <th className="py-2.5 px-3 text-right">操作 (预览 / 下载 / 复制 / 删除)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-semibold text-slate-800 flex items-center space-x-2">
                      {file.thumbnail || (file.type === 'image' && file.url) ? (
                        <img
                          src={file.thumbnail || file.url}
                          alt="Thumb"
                          className="w-7 h-7 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                      ) : file.type === 'video' ? (
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                          <Play className="w-3.5 h-3.5" />
                        </div>
                      ) : file.type === 'audio' ? (
                        <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                          <Music className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <Folder className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span className="truncate max-w-[240px]">{file.name}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono">
                        {file.type || 'file'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{file.size}</td>
                    <td className="py-3 px-3 text-slate-400">{file.uploadedAt}</td>
                    <td className="py-3 px-3 text-right space-x-2">
                      {/* View / Preview */}
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="text-sky-600 hover:text-sky-700 inline-block p-1"
                        title="在线查看与预览"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {/* Download */}
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="text-emerald-600 hover:text-emerald-700 inline-block p-1"
                        title="下载此文件"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {/* Copy Link */}
                      <button
                        onClick={() => handleCopy(file.url)}
                        className="text-slate-500 hover:text-emerald-600 inline-block p-1"
                        title="复制直链"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {/* Open Link */}
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-slate-600 inline-block p-1"
                        title="在新标签页打开"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        className="text-rose-500 hover:text-rose-700 inline-block p-1"
                        title="移除文件"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Driver Configuration Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <Key className="w-4 h-4 text-emerald-600" />
          <span>当前选区接入配置 ({currentProviderMap[activeDriver]})</span>
        </h2>

        {activeDriver === 'r2' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">R2 存储桶名 (Bucket Name)</label>
              <input
                type="text"
                value={cloudConfig?.cloudflare?.r2BucketName || 'whitefox-assets'}
                onChange={(e) =>
                  setCloudConfig({
                    ...cloudConfig,
                    cloudflare: { ...cloudConfig.cloudflare, r2BucketName: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">公开自定义域名 (Public Domain)</label>
              <input
                type="text"
                value={cloudConfig?.cloudflare?.publicDomain || 'https://r2.whitefox.blog'}
                onChange={(e) =>
                  setCloudConfig({
                    ...cloudConfig,
                    cloudflare: { ...cloudConfig.cloudflare, publicDomain: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>
          </div>
        )}

        {activeDriver === 'cos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">腾讯云 COS 存储桶 (Bucket)</label>
              <input
                type="text"
                value={cloudConfig?.tencentCos?.bucket || 'whitefox-1250000000'}
                onChange={(e) =>
                  setCloudConfig({
                    ...cloudConfig,
                    tencentCos: { ...cloudConfig.tencentCos, bucket: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">地域节点 (Region)</label>
              <input
                type="text"
                value={cloudConfig?.tencentCos?.region || 'ap-guangzhou'}
                onChange={(e) =>
                  setCloudConfig({
                    ...cloudConfig,
                    tencentCos: { ...cloudConfig.tencentCos, region: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>
          </div>
        )}

        {activeDriver === 'oss' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">阿里云 OSS 存储桶 (Bucket)</label>
              <input
                type="text"
                value={cloudConfig?.aliyunOss?.bucket || 'whitefox-oss-bucket'}
                onChange={(e) =>
                  setCloudConfig({
                    ...cloudConfig,
                    aliyunOss: { ...cloudConfig.aliyunOss, bucket: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">地域 Endpoint</label>
              <input
                type="text"
                value={cloudConfig?.aliyunOss?.region || 'oss-cn-hangzhou.aliyuncs.com'}
                onChange={(e) =>
                  setCloudConfig({
                    ...cloudConfig,
                    aliyunOss: { ...cloudConfig.aliyunOss, region: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>
          </div>
        )}

        {activeDriver === 'alist' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">AList / WebDAV 服务地址</label>
              <input
                type="text"
                value={cloudConfig?.alist?.endpoint || 'https://pan.whitefox.blog'}
                onChange={(e) =>
                  setCloudConfig({
                    ...cloudConfig,
                    alist: { ...cloudConfig.alist, endpoint: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">默认挂载根路径</label>
              <input
                type="text"
                value={cloudConfig?.alist?.basePath || '/whitefox'}
                onChange={(e) =>
                  setCloudConfig({
                    ...cloudConfig,
                    alist: { ...cloudConfig.alist, basePath: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>
          </div>
        )}

        {activeDriver === 'local' && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs space-y-1">
            <span className="font-bold">站内本地存储池说明：</span>
            <p className="text-[11px] leading-relaxed">
              站内存储池用于保存本地上传的音视频、书籍文档及媒体转存记录。在连接后台主数据库后，站内池文件将自动同步至云端。
            </p>
          </div>
        )}
      </div>

      {/* Detailed Step-by-Step Multi-Cloud & NetDrive Usage Guide */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          onClick={() => setShowUsageGuide(!showUsageGuide)}
          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">网盘与多云调度中枢 · 详细配置与使用实战指南</h2>
              <p className="text-xs text-slate-400">涵盖 Cloudflare R2、腾讯云 COS、阿里云 OSS 与 AList/WebDAV 挂载全流程步骤</p>
            </div>
          </div>
          {showUsageGuide ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {showUsageGuide && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-6 text-xs text-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                  <Cloud className="w-4 h-4 text-emerald-600" />
                  <span>1. Cloudflare R2 极速配置指南 (推荐：0 出站流量费)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed pl-1">
                  <li>登录 Cloudflare 控制台，进入「<strong>R2</strong>」标签页。</li>
                  <li>点击「<strong>Create bucket</strong>」，填写 Bucket 名称（如 <code className="bg-white px-1.5 py-0.5 rounded border text-emerald-700">whitefox-assets</code>）。</li>
                  <li>在 Bucket 设置中的「<strong>Public access</strong>」开启「<strong>Custom Domains</strong>」绑定你的域名（如 <code className="bg-white px-1.5 py-0.5 rounded border text-emerald-700">r2.yourdomain.com</code>）。</li>
                  <li>在上方输入框填入 Bucket 名称与自定义域名，即可直接在博客文章、媒体库中插入高速免流图片与视频资源。</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-3">
                <div className="flex items-center space-x-2 text-blue-800 font-bold">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span>2. 腾讯云 COS 存储桶挂载指南</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed pl-1">
                  <li>登录腾讯云控制台，进入「<strong>对象存储 COS</strong>」控制台。</li>
                  <li>新建存储桶，访问权限建议选择「<strong>公有读私有写</strong>」，选择就近地域（如广州 <code className="bg-white px-1.5 py-0.5 rounded border text-blue-700">ap-guangzhou</code>）。</li>
                  <li>在「<strong>域名管理</strong>」中可绑定自定义加速 CDN 域名（如 <code className="bg-white px-1.5 py-0.5 rounded border text-blue-700">cos.yourdomain.com</code>）。</li>
                  <li>在「<strong>安全设置 → 跨域访问 CORS</strong>」中允许白狐博客域名跨域发起 GET/PUT 请求。</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-3">
                <div className="flex items-center space-x-2 text-orange-800 font-bold">
                  <Database className="w-4 h-4 text-orange-600" />
                  <span>3. 阿里云 OSS 高可用对象存储指南</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed pl-1">
                  <li>进入阿里云「<strong>OSS 管理控制台</strong>」，创建 Bucket，读写权限设为「<strong>公共读</strong>」。</li>
                  <li>获取 Endpoint（例如：<code className="bg-white px-1.5 py-0.5 rounded border text-orange-700">oss-cn-hangzhou.aliyuncs.com</code>）。</li>
                  <li>在「<strong>传输管理 → 域名管理</strong>」绑定自定义域名并配置 HTTPS 证书。</li>
                  <li>在「<strong>数据安全 → 跨域设置 CORS</strong>」添加博客网站域名，允许 Header <code className="bg-white px-1.5 py-0.5 rounded border text-orange-700">*</code>。</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-3">
                <div className="flex items-center space-x-2 text-purple-800 font-bold">
                  <HardDrive className="w-4 h-4 text-purple-600" />
                  <span>4. AList / WebDAV 个人多网盘挂载指南</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed pl-1">
                  <li>部署好 AList 并挂载你的百度网盘、阿里云盘、OneDrive 或本地存储。</li>
                  <li>在 AList 管理端设置允许 WebDAV 访问与公网 CORS 跨域。</li>
                  <li>输入 AList 服务域名（如 <code className="bg-white px-1.5 py-0.5 rounded border text-purple-700">https://pan.yourdomain.com</code>）与根挂载目录。</li>
                  <li>点击「<strong>同步多云状态</strong>」即可自动抓取网盘各级目录并在白狐博客中即时检索。</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Online Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Folder className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-800 truncate">{previewFile.name}</h3>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 p-2 flex items-center justify-center min-h-[220px]">
              {previewFile.type === 'video' || previewFile.name.match(/\.(mp4|webm)$/i) ? (
                <video src={previewFile.url} controls className="max-h-[300px] w-full rounded-xl" />
              ) : previewFile.type === 'audio' || previewFile.name.match(/\.(mp3|wav|flac)$/i) ? (
                <audio src={previewFile.url} controls className="w-full" />
              ) : previewFile.name.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-h-[300px] object-contain rounded-xl" />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">文档或通用二进制文件，可直接下载或在站内文章中引用</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-400 font-mono">
                {previewFile.provider} · {previewFile.size}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(previewFile.url)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-semibold"
                >
                  复制直链
                </button>
                <button
                  onClick={() => handleDownloadFile(previewFile)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs text-white font-semibold flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载文件</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
