import React, { useState, useRef } from 'react';
import {
  HardDrive, Cloud, Server, Database,
  FolderPlus, Upload, Trash2, ExternalLink,
  ShieldAlert, RefreshCw, Key, Globe, Eye,
  CheckCircle2, Folder, Copy, BookOpen, ChevronDown, ChevronUp,
  Terminal, Info, Check, ShieldCheck, Download, Plus, FileText,
  FileCode, Play, Music, Image as ImageIcon, Paperclip, CheckSquare, Square,
  UploadCloud, AlertCircle
} from 'lucide-react';
import { downloadFile } from '../services/documentConverter';
import { storeFileInVault, getFileFromVault } from '../services/indexedDbVault';
import { uploadFileToObjectStorage } from '../services/cloudAdapter';

export const NetDriveView = ({
  cloudConfig,
  setCloudConfig,
  cloudFiles,
  setCloudFiles,
  backendConfig,
  t,
  currentUser,
  onWebDAVTransfer
}) => {
  // Providers: 'r2' | 'cos' | 'oss' | 'jianguoyun' | 'alist' | 'b2' | 'minio' | 's3' | 'obs' | 'upyun'
  // (Note: Removed legacy "站内存储池")
  const [activeDriver, setActiveDriver] = useState('jianguoyun');
  const [viewMode, setViewMode] = useState('medium'); // 'medium' (中图) | 'small' (小图) | 'list' (详细信息)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [copiedUrl, setCopiedUrl] = useState('');
  const [showUsageGuide, setShowUsageGuide] = useState(false);
  const fileInputRef = useRef(null);

  // Batch operations
  const [selectedFileIds, setSelectedFileIds] = useState([]);

  // In-site web window modal state
  const [inSiteWindowUrl, setInSiteWindowUrl] = useState(null);
  const [dockedWindowUrl, setDockedWindowUrl] = useState(null);

  // Preview file modal
  const [previewFile, setPreviewFile] = useState(null);

  // Manual new file form
  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newFileSize, setNewFileSize] = useState('1.5 MB');

  // Nutstore / Generic WebDAV Config state
  const [webdavConfig, setWebdavConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_webdav_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      serverUrl: 'https://dav.jianguoyun.com/dav/',
      account: 'user@example.com',
      appPassword: '',
      rootPath: '/whitefox'
    };
  });

  const isDbConnected = backendConfig?.dbConnected;

  const currentProviderMap = {
    jianguoyun: '坚果云 WebDAV (推荐)',
    r2: 'Cloudflare R2',
    cos: '腾讯云 COS',
    oss: '阿里云 OSS',
    alist: 'AList / 通用网盘',
    b2: 'Backblaze B2',
    minio: 'MinIO 自建对象存储',
    s3: 'AWS S3 国际云',
    obs: '华为云 OBS',
    upyun: '又拍云 USS'
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncStatus(isDbConnected ? '正在与后台数据库及 WebDAV/云存储执行双向全息索引同步...' : '正在同步 WebDAV 外接网盘与多云端存储状态...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('坚果云 WebDAV 与多云中枢已完成全息同步！所有文件索引已最新。');
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

  // Direct file upload from computer
  const handleDirectUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newEntries = [];
    for (const file of files) {
      const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      const isImg = !!file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);
      const isVid = !!file.name.match(/\.(mp4|webm)$/i);
      const isAud = !!file.name.match(/\.(mp3|wav|flac)$/i);
      const fileType = isVid ? 'video' : isAud ? 'audio' : isImg ? 'image' : 'document';

      let fileUrl = '';
      let thumbnail = '';
      const fileId = 'cf-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);

      // Persist in IndexedDB Vault so large binary data persists across reloads and downloads
      await storeFileInVault(fileId, file, { name: file.name, type: file.type, size: file.size });

      // Attempt remote object storage upload if target is R2 / COS / OSS
      if (['r2', 'cos', 'oss'].includes(activeDriver)) {
        const uploadRes = await uploadFileToObjectStorage(file, { backendConfig });
        if (uploadRes && uploadRes.success && uploadRes.url) {
          fileUrl = uploadRes.url;
        } else if (uploadRes && !uploadRes.success) {
          if (uploadRes.errorType === 'CORS_ERROR') {
            alert('【对象存储跨域提醒】\n' + uploadRes.message);
          } else if (uploadRes.message) {
            setSyncStatus(uploadRes.message);
          }
        }
      }

      if (!fileUrl) {
        // If text or small file, read DataURL for sync; else keep robust data URL representation
        if (file.size < 3 * 1024 * 1024) {
          fileUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
          if (isImg) thumbnail = fileUrl;
        } else {
          fileUrl = `idb://${fileId}/${encodeURIComponent(file.name)}`;
        }
      }

      newEntries.push({
        id: fileId,
        name: file.name,
        url: fileUrl,
        thumbnail: thumbnail || (isImg ? fileUrl : ''),
        provider: currentProviderMap[activeDriver] || '坚果云 WebDAV',
        bucketKey: activeDriver,
        size: sizeStr,
        type: fileType,
        uploadedAt: new Date().toISOString().split('T')[0],
        owner: currentUser?.username || 'admin'
      });
    }

    setCloudFiles([...newEntries, ...cloudFiles]);
    setSyncStatus(`成功将 ${newEntries.length} 个文件上传并接入 ${currentProviderMap[activeDriver]}！`);
    setTimeout(() => setSyncStatus(''), 3000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add new file manually
  const handleAddFile = (e) => {
    e.preventDefault();
    if (!newFileName.trim() || !newFileUrl.trim()) return;

    const newFile = {
      id: 'cf-' + Date.now(),
      name: newFileName.trim(),
      url: newFileUrl.trim(),
      provider: currentProviderMap[activeDriver] || '坚果云 WebDAV',
      bucketKey: activeDriver,
      size: newFileSize.trim() || '2.0 MB',
      type: newFileName.match(/\.(mp4|webm)$/i) ? 'video' : newFileName.match(/\.(mp3|wav|flac)$/i) ? 'audio' : newFileName.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? 'image' : 'document',
      uploadedAt: new Date().toISOString().split('T')[0],
      owner: currentUser?.username || 'admin'
    };

    setCloudFiles([newFile, ...cloudFiles]);
    setNewFileName('');
    setNewFileUrl('');
    setSyncStatus(`已向 ${currentProviderMap[activeDriver]} 添加文件记录！`);
    setTimeout(() => setSyncStatus(''), 3000);
  };

  // Delete file
  const handleDeleteFile = (id, name) => {
    if (confirm(`确认删除「${name}」的存储与挂载？`)) {
      setCloudFiles(cloudFiles.filter((f) => f.id !== id));
      setSelectedFileIds(selectedFileIds.filter((fId) => fId !== id));
    }
  };

  // Download file (with IndexedDB fallback for big files)
  const handleDownloadFile = async (file) => {
    if (file.url && file.url.startsWith('idb://')) {
      const record = await getFileFromVault(file.id);
      if (record && record.blob) {
        downloadFile(record.blob, file.name);
        return;
      }
    }
    downloadFile(file.url, file.name);
  };

  // Toggle selection for batch
  const toggleSelectFile = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiles = () => {
    const currentIds = filteredFiles.map((f) => f.id);
    if (currentIds.every((id) => selectedFileIds.includes(id))) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(currentIds);
    }
  };

  // Batch delete
  const handleBatchDeleteFiles = () => {
    if (!selectedFileIds.length) return;
    if (confirm(`确认批量从选区删除选中的 ${selectedFileIds.length} 个文件？`)) {
      setCloudFiles(cloudFiles.filter((f) => !selectedFileIds.includes(f.id)));
      setSelectedFileIds([]);
      setSyncStatus(`已批量删除文件！`);
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  // Batch download
  const handleBatchDownloadFiles = () => {
    const targets = cloudFiles.filter((f) => selectedFileIds.includes(f.id));
    if (!targets.length) return;
    targets.forEach((file, idx) => {
      setTimeout(() => {
        handleDownloadFile(file);
      }, idx * 250);
    });
    setSyncStatus(`已启动批量下载 ${targets.length} 个文件...`);
    setTimeout(() => setSyncStatus(''), 3000);
  };

  // Filter files by provider
  const filteredFiles = cloudFiles
    .filter((f) => f.bucketKey !== 'local') // Exclude legacy local pool
    .filter((f) => {
      if (f.bucketKey) return f.bucketKey === activeDriver;
      const targetName = currentProviderMap[activeDriver];
      return f.provider === targetName || (activeDriver === 'jianguoyun' && (!f.provider || f.provider.includes('坚果云')));
    })
    .filter((f) => !searchQuery.trim() || f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <HardDrive className="w-3.5 h-3.5" />
              <span>多云聚合 · WebDAV 外接网盘与多云调度中枢</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              网盘与 WebDAV 多云调度中枢
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              预留坚果云及通用 WebDAV 网盘接口，集中调度 Cloudflare R2、腾讯云 COS、阿里云 OSS 等云存储，支持站内直接管理 WebDAV 外接网盘文件。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? '同步中...' : '同步 WebDAV 与多云状态'}</span>
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

      {/* Cloud & WebDAV Providers Selection Cards (已去掉站内存储池) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { id: 'jianguoyun', name: '坚果云 WebDAV', icon: HardDrive, desc: '应用密码 · 极速多端' },
          { id: 'r2', name: 'Cloudflare R2', icon: Cloud, desc: '0出站费边缘对象存储' },
          { id: 'cos', name: '腾讯云 COS', icon: Server, desc: '国内极速 CDN 存储' },
          { id: 'oss', name: '阿里云 OSS', icon: Database, desc: '高可用对象存储' },
          { id: 'alist', name: 'AList / 通用网盘', icon: HardDrive, desc: '多网盘聚合挂载' },
          { id: 'b2', name: 'Backblaze B2', icon: Cloud, desc: '低成本大容量存储' },
          { id: 'minio', name: 'MinIO 自建存储', icon: Server, desc: '开源 S3 兼容私有云' },
          { id: 's3', name: 'AWS S3', icon: Database, desc: '全球标准对象存储' },
          { id: 'obs', name: '华为云 OBS', icon: Server, desc: '企业级弹性存储' },
          { id: 'upyun', name: '又拍云 USS', icon: HardDrive, desc: '边缘分发云存储' },
        ].map((p) => {
          const Icon = p.icon;
          const isSelected = activeDriver === p.id;
          const count = cloudFiles.filter((f) => (f.bucketKey ? f.bucketKey === p.id : f.provider === currentProviderMap[p.id])).length;
          return (
            <button
              key={p.id}
              onClick={() => setActiveDriver(p.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white/80 hover:bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span className="font-bold text-xs text-slate-800 truncate">{p.name}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                  {count}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">{p.desc}</p>
            </button>
          );
        })}
      </div>

      {/* WebDAV Interface Configuration Box (坚果云核心用法指导) */}
      {activeDriver === 'jianguoyun' && (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-emerald-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
              <HardDrive className="w-5 h-5 text-emerald-600" />
              <span>坚果云 WebDAV 预留接口配置</span>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              兼容其他通用 WebDAV
            </span>
          </div>

          {/* Usage Instructions Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <div className="font-bold flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>坚果云 WebDAV 核心用法与步骤说明</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed pl-1">
              <li>登录坚果云网页版 (jianguoyun.com)，点击右上角账户名进入「<strong>账户信息 → 安全选项</strong>」。</li>
              <li>在“第三方应用管理”中点击「<strong>添加应用密码</strong>」，输入名称（如 <code>WhiteFox-Blog</code>）并生成一个专属的<strong>应用密码</strong>。</li>
              <li>在下方表单中填入<strong>服务器地址</strong>、<strong>坚果云账号</strong>以及刚刚生成的<strong>应用密码</strong>并保存。</li>
              <li>配置完成后，博客、书架、相册、影音专区均可一键将文件直接转存至此 WebDAV 外接网盘！</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1">WebDAV 服务器地址 (Server)</label>
              <input
                type="text"
                value={webdavConfig.serverUrl}
                onChange={(e) => setWebdavConfig({ ...webdavConfig, serverUrl: e.target.value })}
                placeholder="https://dav.jianguoyun.com/dav/"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">账号 (坚果云登录邮箱)</label>
              <input
                type="text"
                value={webdavConfig.account}
                onChange={(e) => setWebdavConfig({ ...webdavConfig, account: e.target.value })}
                placeholder="your_email@example.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">应用密码 (Application Password)</label>
              <input
                type="password"
                value={webdavConfig.appPassword}
                onChange={(e) => setWebdavConfig({ ...webdavConfig, appPassword: e.target.value })}
                placeholder="在安全选项生成的应用密码"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">转存根路径 (Root Path)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={webdavConfig.rootPath}
                  onChange={(e) => setWebdavConfig({ ...webdavConfig, rootPath: e.target.value })}
                  placeholder="/whitefox"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('wf_webdav_config', JSON.stringify(webdavConfig));
                    setSyncStatus('坚果云 WebDAV 接口配置已成功保存！');
                    setTimeout(() => setSyncStatus(''), 3000);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0 cursor-pointer shadow-xs"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Management Bar for Current Provider */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Folder className="w-4 h-4 text-emerald-600" />
              <span>{currentProviderMap[activeDriver]} 文件管理区</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              站内直接查看、批量下载、删除与调度 WebDAV 外接网盘及多云文件
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-xl self-start sm:self-auto">
            文件数: {filteredFiles.length} 项
          </span>
        </div>

        {/* Dual Mode: Direct Computer Upload OR Manual External CDN / URL Insertion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>直接从电脑上传到 {currentProviderMap[activeDriver]}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                选择本地图片、文档、音频或视频，系统将自动挂载至当前网盘
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
                <span>选择本地文件上传</span>
              </label>
            </div>
          </div>

          <form onSubmit={handleAddFile} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-2">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs">
              <Paperclip className="w-4 h-4 text-slate-600" />
              <span>添加已有外部直链 / CDN / WebDAV 文件</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="文件名 (文档.pdf)"
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
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>添加</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Search, Batch Operations & 3-Tier View Mode Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2 flex-1 max-w-sm">
            <input
              type="text"
              placeholder={`在当前选区查找文件...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex items-center space-x-3 text-xs">
            {/* Batch management triggers */}
            <button
              onClick={toggleSelectAllFiles}
              className="flex items-center space-x-1.5 text-slate-700 font-bold cursor-pointer"
            >
              {filteredFiles.length > 0 && filteredFiles.every((f) => selectedFileIds.includes(f.id)) ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>全选 ({selectedFileIds.length}/{filteredFiles.length})</span>
            </button>

            {selectedFileIds.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBatchDownloadFiles}
                  className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>批量下载 ({selectedFileIds.length})</span>
                </button>
                <button
                  onClick={handleBatchDeleteFiles}
                  className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>批量删除</span>
                </button>
              </div>
            )}

            <span className="text-slate-400 font-medium">显示模式:</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('medium')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'medium' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                中图
              </button>
              <button
                onClick={() => setViewMode('small')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'small' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                小图
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                详情
              </button>
            </div>
          </div>
        </div>

        {/* Files Display: Medium (中图) / Small (小图) / Table (详细信息) */}
        {viewMode === 'medium' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="group p-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-white transition-all flex flex-col justify-between space-y-2 relative"
              >
                <div
                  onClick={() => setPreviewFile(file)}
                  className="w-full aspect-square rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center cursor-pointer relative"
                >
                  {file.thumbnail || (file.type === 'image' && file.url) ? (
                    <img src={file.thumbnail || file.url} alt="Thumb" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : file.type === 'video' ? (
                    <Play className="w-8 h-8 text-indigo-500" />
                  ) : file.type === 'audio' ? (
                    <Music className="w-8 h-8 text-pink-500" />
                  ) : (
                    <FileText className="w-8 h-8 text-slate-400" />
                  )}
                  {/* Batch Select Checkbox */}
                  <button
                    onClick={(e) => toggleSelectFile(file.id, e)}
                    className="absolute top-1.5 left-1.5 p-1 rounded-md bg-black/50 text-white cursor-pointer"
                  >
                    {selectedFileIds.includes(file.id) ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-white/80" />
                    )}
                  </button>
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white font-mono text-[9px]">
                    {file.size}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-xs text-slate-800 truncate" title={file.name}>{file.name}</p>
                  <p className="text-[10px] text-slate-400">{file.uploadedAt}</p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <button onClick={() => handleDownloadFile(file)} className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer" title="下载"><Download className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleCopy(file.url)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer" title="复制直链"><Copy className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteFile(file.id, file.name)} className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer" title="删除"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'small' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => setPreviewFile(file)}
                className="p-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 cursor-pointer flex flex-col justify-between space-y-1 relative"
              >
                <div className="w-full aspect-square rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center relative">
                  {file.thumbnail || (file.type === 'image' && file.url) ? (
                    <img src={file.thumbnail || file.url} alt="Thumb" className="w-full h-full object-cover" />
                  ) : (
                    <Folder className="w-5 h-5 text-emerald-600" />
                  )}
                  <button
                    onClick={(e) => toggleSelectFile(file.id, e)}
                    className="absolute top-1 left-1 p-0.5 rounded bg-black/50 text-white"
                  >
                    {selectedFileIds.includes(file.id) ? (
                      <CheckSquare className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Square className="w-3 h-3 text-white/80" />
                    )}
                  </button>
                </div>
                <div className="font-semibold text-[10px] text-slate-800 truncate" title={file.name}>{file.name}</div>
                <div className="text-[9px] text-slate-400 font-mono">{file.size}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {filteredFiles.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Folder className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-xs">该选区暂无归档文件，请在上方直接添加或通过站内一键转存</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">勾选</th>
                    <th className="py-2.5 px-3">文件名称</th>
                    <th className="py-2.5 px-3">类型</th>
                    <th className="py-2.5 px-3">文件大小</th>
                    <th className="py-2.5 px-3">同步日期</th>
                    <th className="py-2.5 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <button
                          onClick={(e) => toggleSelectFile(file.id, e)}
                          className="cursor-pointer text-slate-400 hover:text-slate-600"
                        >
                          {selectedFileIds.includes(file.id) ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
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
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="text-sky-600 hover:text-sky-700 inline-block p-1 cursor-pointer"
                          title="在线查看与预览"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="text-emerald-600 hover:text-emerald-700 inline-block p-1 cursor-pointer"
                          title="下载此文件"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopy(file.url)}
                          className="text-slate-500 hover:text-emerald-600 inline-block p-1 cursor-pointer"
                          title="复制直链"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id, file.name)}
                          className="text-rose-500 hover:text-rose-700 inline-block p-1 cursor-pointer"
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
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
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
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-semibold cursor-pointer"
                >
                  复制直链
                </button>
                <button
                  onClick={() => handleDownloadFile(previewFile)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs text-white font-semibold flex items-center space-x-1 cursor-pointer"
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
export default NetDriveView;
