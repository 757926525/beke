import React, { useState } from 'react';
import {
  FolderLock, HardDrive, Mail, Upload, Download, Trash2, Edit3,
  FileText, Plus, Eye, CheckCircle2, AlertCircle, ExternalLink,
  ShieldAlert, LogIn, Lock, User, RefreshCw, Key, Globe, Search,
  X, Layers, Film, Music, FileCode, Check, Server, Database, Shield,
  Folder, FolderPlus, ArrowLeft, ArrowUpRight, Copy, Share2
} from 'lucide-react';
import { downloadFile } from '../services/documentConverter';

export const AdminFileAndPortalView = ({
  currentUser,
  isAdmin,
  cloudFiles = [],
  setCloudFiles,
  t
}) => {
  const [viewMode, setViewMode] = useState('medium'); // 'medium' (中图) | 'small' (小图) | 'list' (详细信息)
  const [toast, setToast] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [selectedFileIds, setSelectedFileIds] = useState([]);

  // In-site bucket manager: active bucket & path navigation
  const [activeBucket, setActiveBucket] = useState('all'); // 'all' | 'r2' | 'cos' | 'oss' | 'jianguoyun'
  const [currentFolder, setCurrentFolder] = useState(''); // '' (root) or 'subfolder/'
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Target bucket for new uploads
  const [uploadTargetBucket, setUploadTargetBucket] = useState('r2');
  const adminPrefix = 'admin/';

  // Preview & Edit modal state
  const [previewFile, setPreviewFile] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', size: '', provider: '', url: '' });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  if (!isAdmin) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-slate-200 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">权限受限：仅系统管理员可见</h2>
        <p className="text-xs text-slate-500">
          该高级特权文件选区仅对站长开放，已应用前缀隔离与指定存储桶保护。
        </p>
      </div>
    );
  }

  const bucketOptions = [
    { id: 'all', name: '全部存储桶文件', desc: '统一查看与调度全部对象存储' },
    { id: 'r2', name: 'Cloudflare R2', desc: '免出站流量费 · 0出站' },
    { id: 'cos', name: '腾讯云 COS', desc: '国内极速 CDN 加速节点' },
    { id: 'oss', name: '阿里云 OSS', desc: '高可用企业级分布式存储' },
    { id: 'jianguoyun', name: '坚果云 WebDAV', desc: '应用密码直连外接网盘' }
  ];

  // Fix file display issues: robust fallback matching
  const getDisplayType = (file) => {
    if (file.type && file.type !== 'file') return file.type;
    const name = (file.name || '').toLowerCase();
    if (name.match(/\.(mp4|webm|mov|avi)$/)) return 'video';
    if (name.match(/\.(mp3|wav|flac|aac)$/)) return 'audio';
    if (name.match(/\.(png|jpg|jpeg|webp|gif|svg)$/)) return 'image';
    if (name.match(/\.(zip|rar|7z|tar|gz)$/)) return 'archive';
    return 'document';
  };

  // Upload handler with prefix isolation and active bucket binding
  const handleUploadFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const readAsDataUrl = (file) =>
      new Promise((resolve) => {
        if (file.size > 5 * 1024 * 1024) {
          resolve(URL.createObjectURL(file));
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = () => resolve(URL.createObjectURL(file));
        reader.readAsDataURL(file);
      });

    const chosenBucket = uploadTargetBucket === 'all' ? 'r2' : uploadTargetBucket;
    const chosenBucketName = bucketOptions.find((b) => b.id === chosenBucket)?.name || 'Cloudflare R2';
    const newItems = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = getDisplayType(file);
      const fileData = await readAsDataUrl(file);

      // Path composition with folder and prefix
      const fileNameWithFolder = currentFolder ? `${currentFolder}${file.name}` : file.name;
      const isolatedName = fileNameWithFolder.startsWith(adminPrefix) ? fileNameWithFolder : `${adminPrefix}${fileNameWithFolder}`;

      newItems.push({
        id: `admin-f-${Date.now()}-${i}`,
        name: isolatedName,
        rawName: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type,
        thumbnail: type === 'image' ? fileData : '',
        provider: chosenBucketName,
        bucketKey: chosenBucket,
        isAdminFile: true,
        pathPrefix: adminPrefix,
        folderPath: currentFolder,
        url: fileData,
        uploadedBy: currentUser?.username || '站长',
        userId: currentUser?.id || 'admin',
        uploadedAt: new Date().toISOString().split('T')[0]
      });
    }

    if (setCloudFiles) {
      setCloudFiles((prev) => [...newItems, ...prev]);
    }
    showToast(`成功将 ${newItems.length} 个特权文件存入【${chosenBucketName}】(路径: ${adminPrefix}${currentFolder})！`);
    e.target.value = '';
  };

  // Create folder inside current bucket
  const handleCreateFolder = (e) => {
    e.preventDefault();
    const cleanFolder = newFolderName.trim().replace(/[\/\\]+/g, '') + '/';
    if (!cleanFolder || cleanFolder === '/') return;

    setCurrentFolder(cleanFolder);
    setShowNewFolderModal(false);
    setNewFolderName('');
    showToast(`已进入虚拟目录「${cleanFolder}」，新上传文件将自动归档至此目录！`);
  };

  // Delete File
  const handleDeleteFile = (id, name) => {
    if (confirm(`确认彻底删除「${name}」？`)) {
      if (setCloudFiles) {
        setCloudFiles(cloudFiles.filter((f) => f.id !== id));
      }
      setSelectedFileIds(selectedFileIds.filter((fId) => fId !== id));
      showToast(`已成功删除文件！`);
    }
  };

  // Batch Delete
  const handleBatchDelete = () => {
    if (!selectedFileIds.length) {
      showToast('请先勾选需要批量删除的文件！');
      return;
    }
    if (confirm(`确认批量彻底删除选中的 ${selectedFileIds.length} 个文件？`)) {
      if (setCloudFiles) {
        setCloudFiles(cloudFiles.filter((f) => !selectedFileIds.includes(f.id)));
      }
      setSelectedFileIds([]);
      showToast('批量删除成功！');
    }
  };

  // Batch Download
  const handleBatchDownload = () => {
    if (!selectedFileIds.length) {
      showToast('请先勾选需要批量下载的文件！');
      return;
    }
    const targets = cloudFiles.filter((f) => selectedFileIds.includes(f.id));
    targets.forEach((f, idx) => {
      setTimeout(() => {
        downloadFile(f.url, f.name.replace(/^admin\//, ''));
      }, idx * 250);
    });
    showToast(`已启动批量下载 ${targets.length} 个文件！`);
  };

  // Toggle selection
  const toggleSelect = (id) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Open Edit File Modal
  const handleOpenEdit = (file) => {
    setEditingFile(file);
    setEditForm({
      name: file.name,
      size: file.size,
      provider: file.provider || '站内专享',
      url: file.url
    });
  };

  // Save Edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;

    if (setCloudFiles) {
      setCloudFiles(
        cloudFiles.map((f) => (f.id === editingFile.id ? { ...f, ...editForm } : f))
      );
    }
    showToast(`文件「${editForm.name}」元数据已更新！`);
    setEditingFile(null);
  };

  // Filter files by bucket, type, search query, and currentFolder
  // (Fix: Include both admin-isolated files and bucket-allocated files cleanly)
  const filteredFiles = cloudFiles
    .filter((f) => {
      // 1. Bucket matching
      if (activeBucket !== 'all') {
        const matchesKey = f.bucketKey === activeBucket;
        const matchesProvider = (f.provider || '').toLowerCase().includes(activeBucket.toLowerCase());
        if (!matchesKey && !matchesProvider) return false;
      }
      // 2. Folder matching
      if (currentFolder) {
        if (!f.name.includes(currentFolder) && f.folderPath !== currentFolder) return false;
      }
      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!f.name.toLowerCase().includes(q) && !(f.provider || '').toLowerCase().includes(q)) return false;
      }
      // 4. File type
      if (selectedFileType !== 'all') {
        if (getDisplayType(f) !== selectedFileType) return false;
      }
      return true;
    });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-2">
              <FolderLock className="w-3.5 h-3.5" />
              <span>站长特权 · 存储桶内容站内直管中枢</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              站长文件专区与多存储桶管理
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              站内直接管理 Cloudflare R2、腾讯云 COS、阿里云 OSS 与坚果云 WebDAV 内容；修复显示与前缀隔离，解决文件跨端同步问题。
            </p>
          </div>

          {/* Quick Upload Action */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-emerald-600" />
              <span>新建目录</span>
            </button>

            <label className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>上传文件到存储桶</span>
              <input
                type="file"
                multiple
                onChange={handleUploadFiles}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* In-Site Bucket Switcher Cards (站内管理各存储桶内容) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {bucketOptions.map((b) => {
          const isSelected = activeBucket === b.id;
          const count = cloudFiles.filter((f) => {
            if (b.id === 'all') return true;
            return f.bucketKey === b.id || (f.provider || '').toLowerCase().includes(b.id.toLowerCase());
          }).length;
          return (
            <button
              key={b.id}
              onClick={() => {
                setActiveBucket(b.id);
                if (b.id !== 'all') setUploadTargetBucket(b.id);
                setCurrentFolder('');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 truncate">{b.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                  {count}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">{b.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Breadcrumb Path & Folder Navigation */}
      {currentFolder && (
        <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Folder className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-400">当前虚拟目录：</span>
            <span className="font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {currentFolder}
            </span>
          </div>
          <button
            onClick={() => setCurrentFolder('')}
            className="text-slate-500 hover:text-emerald-700 flex items-center space-x-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回存储桶根目录</span>
          </button>
        </div>
      )}

      {/* Action and Search Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="搜索站长文件或存储桶..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <select
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-semibold"
          >
            <option value="all">全类型文件</option>
            <option value="video">视频文件</option>
            <option value="audio">音频文件</option>
            <option value="image">图像文件</option>
            <option value="document">文档资料</option>
            <option value="archive">压缩包</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto text-xs">
          {/* Batch operations */}
          {selectedFileIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBatchDownload}
                className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>批量下载 ({selectedFileIds.length})</span>
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>批量删除</span>
              </button>
            </div>
          )}

          {/* 3-Tier View Mode */}
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

      {/* Files Display: Robust display resolving previous display errors */}
      {filteredFiles.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white/60 rounded-3xl border border-dashed border-slate-200 space-y-2">
          <FolderLock className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
          <p className="text-xs font-semibold">当前存储桶暂无文件</p>
          <p className="text-[11px] text-slate-400">点击右上角“上传文件到存储桶”即可在此管理</p>
        </div>
      ) : viewMode === 'medium' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => {
            const fType = getDisplayType(file);
            return (
              <div
                key={file.id}
                className="group bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between relative"
              >
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedFileIds.includes(file.id)}
                    onChange={() => toggleSelect(file.id)}
                    className="rounded text-emerald-600 cursor-pointer"
                  />
                </div>
                <div className="pl-6">
                  {/* Thumbnail / Icon Display */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold overflow-hidden border border-slate-200">
                      {fType === 'image' && file.url ? (
                        <img src={file.thumbnail || file.url} alt="Thumb" className="w-full h-full object-cover" />
                      ) : fType === 'video' ? (
                        <Film className="w-5 h-5 text-indigo-600" />
                      ) : fType === 'audio' ? (
                        <Music className="w-5 h-5 text-pink-600" />
                      ) : fType === 'archive' ? (
                        <Layers className="w-5 h-5 text-amber-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-emerald-600" />
                      )}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold truncate max-w-[120px]">
                      {file.provider || 'Cloudflare R2'}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs text-slate-800 line-clamp-2 leading-relaxed" title={file.name}>
                    {file.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1 font-mono">
                    <span>{file.size || '2.5 MB'}</span>
                    <span>•</span>
                    <span>{file.uploadedAt || '近期'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                  <button onClick={() => setPreviewFile(file)} className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 cursor-pointer" title="在线预览"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleOpenEdit(file)} className="p-1 rounded-lg text-slate-400 hover:text-amber-600 cursor-pointer" title="编辑信息"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => downloadFile(file.url, file.name.replace(/^admin\//, ''))} className="p-1 rounded-lg text-slate-400 hover:text-sky-600 cursor-pointer" title="下载"><Download className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteFile(file.id, file.name)} className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer" title="删除"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'small' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 flex flex-col justify-between text-xs space-y-1 relative"
            >
              <div className="flex items-center justify-between">
                <input
                  type="checkbox"
                  checked={selectedFileIds.includes(file.id)}
                  onChange={() => toggleSelect(file.id)}
                  className="rounded text-emerald-600 cursor-pointer"
                />
                <span className="text-[9px] font-mono text-slate-400">{file.size}</span>
              </div>
              <div className="truncate font-semibold text-slate-800 text-[11px]" title={file.name}>{file.name}</div>
              <div className="flex items-center justify-end space-x-1 pt-1 border-t border-slate-100">
                <button onClick={() => setPreviewFile(file)} className="p-0.5 text-slate-400 hover:text-emerald-600 cursor-pointer" title="预览"><Eye className="w-3 h-3" /></button>
                <button onClick={() => downloadFile(file.url, file.name.replace(/^admin\//, ''))} className="p-0.5 text-slate-400 hover:text-sky-600 cursor-pointer" title="下载"><Download className="w-3 h-3" /></button>
                <button onClick={() => handleDeleteFile(file.id, file.name)} className="p-0.5 text-slate-400 hover:text-rose-600 cursor-pointer" title="删除"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={filteredFiles.length > 0 && filteredFiles.every((f) => selectedFileIds.includes(f.id))}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedFileIds(filteredFiles.map((f) => f.id));
                      else setSelectedFileIds([]);
                    }}
                  />
                </th>
                <th className="py-2.5 px-3">文件名</th>
                <th className="py-2.5 px-3">类型</th>
                <th className="py-2.5 px-3">文件大小</th>
                <th className="py-2.5 px-3">存储桶 / 提供商</th>
                <th className="py-2.5 px-3">同步日期</th>
                <th className="py-2.5 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3">
                    <input
                      type="checkbox"
                      checked={selectedFileIds.includes(file.id)}
                      onChange={() => toggleSelect(file.id)}
                    />
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate max-w-[280px]">{file.name}</span>
                  </td>
                  <td className="py-2.5 px-3 uppercase text-[10px] font-mono">{getDisplayType(file)}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{file.size}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                      {file.provider || 'Cloudflare R2'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{file.uploadedAt}</td>
                  <td className="py-2.5 px-4 text-right space-x-2">
                    <button onClick={() => setPreviewFile(file)} className="text-emerald-600 hover:underline cursor-pointer">预览</button>
                    <button onClick={() => handleOpenEdit(file)} className="text-amber-600 hover:underline cursor-pointer">编辑</button>
                    <button onClick={() => downloadFile(file.url, file.name.replace(/^admin\//, ''))} className="text-sky-600 hover:underline cursor-pointer">下载</button>
                    <button onClick={() => handleDeleteFile(file.id, file.name)} className="text-rose-600 hover:underline cursor-pointer">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-1.5">
                <FolderPlus className="w-4 h-4 text-emerald-600" />
                <span>新建存储桶虚拟目录</span>
              </h3>
              <button onClick={() => setShowNewFolderModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateFolder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">目录名称</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="如: assets / backups / docs"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  确认进入目录
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 truncate">特权文件预览: {previewFile.name}</h3>
              <button onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 p-2 flex items-center justify-center min-h-[200px]">
              {getDisplayType(previewFile) === 'image' && previewFile.url ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-h-[300px] object-contain rounded-xl" />
              ) : getDisplayType(previewFile) === 'video' && previewFile.url ? (
                <video src={previewFile.url} controls className="max-h-[300px] w-full rounded-xl" />
              ) : getDisplayType(previewFile) === 'audio' && previewFile.url ? (
                <audio src={previewFile.url} controls className="w-full" />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <FileText className="w-12 h-12 text-emerald-600 mx-auto" />
                  <p className="text-xs text-slate-500">文档或通用二进制文件，可直接下载</p>
                </div>
              )}
            </div>
            <div className="text-xs space-y-1 text-slate-600">
              <p><strong>文件格式：</strong>{getDisplayType(previewFile)}</p>
              <p><strong>文件大小：</strong>{previewFile.size}</p>
              <p><strong>所属存储桶：</strong>{previewFile.provider}</p>
              <p className="font-mono text-[11px] break-all bg-slate-50 p-2 rounded-xl"><strong>直链地址：</strong>{previewFile.url}</p>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => downloadFile(previewFile.url, previewFile.name.replace(/^admin\//, ''))}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
              >
                下载此文件
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">编辑特权文件元数据</h3>
              <button onClick={() => setEditingFile(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">文件名</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">文件大小描述</label>
                <input
                  type="text"
                  value={editForm.size}
                  onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">存储平台提供商</label>
                <input
                  type="text"
                  value={editForm.provider}
                  onChange={(e) => setEditForm({ ...editForm, provider: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingFile(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminFileAndPortalView;
