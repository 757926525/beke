import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Maximize2,
  MapPin,
  Calendar,
  X,
  FolderPlus,
  Folder,
  FolderOpen,
  Layers,
  Download,
  CheckSquare,
  Square,
  ArrowLeft
} from 'lucide-react';
import { downloadFile } from '../services/documentConverter';

export const GalleryView = ({
  photos,
  setPhotos,
  currentUser,
  isAdmin,
  onWebDAVTransfer,
  t
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('全部');
  const [folders, setFolders] = useState(['全部', '白狐物语', '风景山水', '云端随想']);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);

  // 4-Tier View Modes: 大图 (large), 中图 (medium), 小图 (small), 详情 (list)
  const [viewMode, setViewMode] = useState('large');

  const fileInputRef = useRef(null);
  const batchFileInputRef = useRef(null);

  // Handle creating a new folder
  const handleCreateFolder = (e) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    if (folders.includes(trimmed)) {
      alert('文件夹名称已存在！');
      return;
    }
    setFolders([...folders, trimmed]);
    setCurrentFolder(trimmed);
    setNewFolderName('');
    setShowNewFolderModal(false);
    setUploadStatus(`新建文件夹「${trimmed}」成功！`);
    setTimeout(() => setUploadStatus(null), 3000);
  };

  const canManagePhoto = (photo) => {
    if (isAdmin) return true;
    if (currentUser && photo.userId && photo.userId === currentUser.id) return true;
    if (currentUser && photo.author && photo.author === currentUser.username) return true;
    return false;
  };

  const processAndUploadFile = (file, targetFolder) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

          resolve({
            id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title: file.name.replace(/\.[^/.]+$/, ""),
            desc: `上传至文件夹「${targetFolder}」，已安全记录至云相册。`,
            url: dataUrl,
            category: targetFolder,
            folder: targetFolder,
            author: currentUser?.username || '站长',
            userId: currentUser?.id || 'admin',
            date: new Date().toISOString().split('T')[0],
            location: '随拍记录'
          });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const targetFolder = currentFolder === '全部' ? '白狐物语' : currentFolder;
    const newPhotos = [];

    for (const file of files) {
      const photoItem = await processAndUploadFile(file, targetFolder);
      newPhotos.push(photoItem);
    }

    setPhotos([...newPhotos, ...photos]);
    setUploadStatus(`成功上传 ${newPhotos.length} 张照片存入文件夹「${targetFolder}」！`);
    setTimeout(() => setUploadStatus(null), 3000);

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (batchFileInputRef.current) batchFileInputRef.current.value = '';
  };

  const handleRemovePhoto = (id) => {
    const target = photos.find((p) => p.id === id);
    if (!canManagePhoto(target)) {
      alert('权限不足：仅管理员或上传者可删除该照片');
      return;
    }
    setPhotos(photos.filter((p) => p.id !== id));
    setSelectedPhotoIds(selectedPhotoIds.filter((pId) => pId !== id));
  };

  // 1-Click Single Photo Download
  const handleDownloadPhoto = (photo, e) => {
    if (e) e.stopPropagation();
    downloadFile(photo.url, `${photo.title || 'photo'}.jpg`, 'image/jpeg');
    setUploadStatus(`照片《${photo.title}》已启动下载！`);
    setTimeout(() => setUploadStatus(null), 3000);
  };

  // Toggle selection for batch operations
  const toggleSelectPhoto = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedPhotoIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  // Select all or deselect all in current view
  const toggleSelectAll = () => {
    const currentIds = filteredPhotos.map((p) => p.id);
    const allSelected = currentIds.every((id) => selectedPhotoIds.includes(id));
    if (allSelected) {
      setSelectedPhotoIds(selectedPhotoIds.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedPhotoIds(Array.from(new Set([...selectedPhotoIds, ...currentIds])));
    }
  };

  // Batch Download Selected Photos
  const handleBatchDownload = () => {
    const targets = photos.filter((p) => selectedPhotoIds.includes(p.id));
    if (!targets.length) {
      alert('请先勾选需要批量下载的照片！');
      return;
    }
    targets.forEach((p, idx) => {
      setTimeout(() => {
        downloadFile(p.url, `${p.title || `photo-${idx + 1}`}.jpg`, 'image/jpeg');
      }, idx * 250);
    });
    setUploadStatus(`已启动批量下载 ${targets.length} 张图片！`);
    setTimeout(() => setUploadStatus(null), 3000);
  };

  // Batch Delete Selected Photos
  const handleBatchDelete = () => {
    const targets = photos.filter((p) => selectedPhotoIds.includes(p.id));
    if (!targets.length) {
      alert('请先勾选需要批量删除的照片！');
      return;
    }
    const nonDeletable = targets.filter((p) => !canManagePhoto(p));
    if (nonDeletable.length > 0) {
      alert(`权限不足：选中的照片中有 ${nonDeletable.length} 张属于其他用户，无法删除。`);
      return;
    }
    if (confirm(`确认批量彻底删除选中的 ${targets.length} 张照片？`)) {
      setPhotos(photos.filter((p) => !selectedPhotoIds.includes(p.id)));
      setSelectedPhotoIds([]);
      setUploadStatus(`已成功批量删除 ${targets.length} 张照片！`);
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const filteredPhotos = photos.filter(
    (p) => currentFolder === '全部' || p.category === currentFolder || p.folder === currentFolder
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>光影视界 · 文件夹相册与双列全景</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            白狐光影视觉集与云相册
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            支持新建文件夹分类归档、上传照片进专属文件夹。界面布局每排两张全面适配手机与触控浏览。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser && (
            <>
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-emerald-600" />
                <span>新建文件夹</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{currentFolder === '全部' ? '上传照片' : `上传至「${currentFolder}」`}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {uploadStatus && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Folders Tabs Navigation & Batch Toolbar */}
      <div className="space-y-3">
        <div className="bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-1 text-xs text-slate-400 font-semibold px-2 flex-shrink-0">
              <Folder className="w-3.5 h-3.5 text-emerald-600" />
              <span>相册文件夹:</span>
            </div>
            {folders.map((f) => {
              const count = photos.filter(
                (p) => f === '全部' || p.category === f || p.folder === f
              ).length;
              const isActive = currentFolder === f;
              return (
                <button
                  key={f}
                  onClick={() => setCurrentFolder(f)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 flex-shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {isActive ? <FolderOpen className="w-3.5 h-3.5" /> : <Folder className="w-3.5 h-3.5 opacity-60" />}
                  <span>{f}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {currentFolder !== '全部' && (
            <button
              onClick={() => setCurrentFolder('全部')}
              className="text-xs text-slate-500 hover:text-emerald-700 flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>返回全部相册</span>
            </button>
          )}
        </div>

        {/* Batch Operations & 4-Tier View Switcher Bar */}
        <div className="bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center space-x-1.5 text-slate-700 hover:text-slate-900 cursor-pointer font-bold"
            >
              {filteredPhotos.length > 0 && filteredPhotos.every((p) => selectedPhotoIds.includes(p.id)) ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>全选 ({selectedPhotoIds.length}/{filteredPhotos.length})</span>
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400 font-mono">
              当前「{currentFolder}」共 {filteredPhotos.length} 张图片
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {selectedPhotoIds.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBatchDownload}
                  className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>批量下载 ({selectedPhotoIds.length})</span>
                </button>

                <button
                  onClick={() => {
                    const targets = photos.filter((p) => selectedPhotoIds.includes(p.id));
                    if (onWebDAVTransfer) {
                      onWebDAVTransfer(targets.map(p => ({
                        name: `${p.title || 'photo'}.jpg`,
                        size: '800 KB',
                        type: 'image',
                        url: p.url
                      })));
                    } else {
                      setUploadStatus(`已将选中的 ${targets.length} 张图片加入 WebDAV 上传队列！`);
                    }
                  }}
                  className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-semibold flex items-center space-x-1 cursor-pointer"
                  title="转存至 WebDAV 外接网盘"
                >
                  <span>转存至 WebDAV</span>
                </button>

                {currentUser && (
                  <button
                    onClick={handleBatchDelete}
                    className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>批量删除</span>
                  </button>
                )}
              </div>
            )}

            {/* 4-Tier View Switcher: 大图 / 中图 / 小图 / 详情 */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-medium">显示模式:</span>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('large')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    viewMode === 'large' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  大图
                </button>
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
        </div>
      </div>

      {/* 4-Tier Photos Rendering */}
      {viewMode === 'large' && (
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all duration-300"
            >
              <div
                className="relative aspect-4/3 sm:aspect-16/10 overflow-hidden cursor-pointer bg-slate-100"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={(e) => toggleSelectPhoto(photo.id, e)}
                  className="absolute top-2 left-2 z-10 p-1 rounded-lg bg-black/50 backdrop-blur-md text-white hover:bg-black/70 cursor-pointer transition-colors"
                >
                  {selectedPhotoIds.includes(photo.id) ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-white/80" />
                  )}
                </button>
                <div className="absolute top-2 right-2 p-1 rounded-lg bg-black/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3 h-3" />
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentFolder(photo.folder || photo.category || '全部');
                  }}
                  className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-semibold flex items-center space-x-1 hover:bg-emerald-700/80 transition-colors cursor-pointer"
                >
                  <Folder className="w-2.5 h-2.5 text-emerald-300" />
                  <span>{photo.folder || photo.category || '默认'}</span>
                </div>
              </div>

              <div className="p-2.5 sm:p-4 space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between text-[9px] sm:text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1 truncate max-w-[50%]">
                    <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
                    <span className="truncate">{photo.location}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>{photo.date}</span>
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                  {photo.title}
                </h4>
                <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-1 leading-relaxed">
                  {photo.desc}
                </p>

                <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-600 font-semibold hidden sm:inline">
                    大图模式
                  </span>
                  <div className="flex items-center space-x-1 ml-auto">
                    <button
                      onClick={(e) => handleDownloadPhoto(photo, e)}
                      title="一键下载此图片"
                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {canManagePhoto(photo) && (
                      <button
                        onClick={() => handleRemovePhoto(photo.id)}
                        title="删除照片"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'medium' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded-2xl p-2.5 border border-slate-200 hover:border-emerald-300 shadow-xs flex flex-col justify-between space-y-2 group relative"
            >
              <div
                className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <button
                  onClick={(e) => toggleSelectPhoto(photo.id, e)}
                  className="absolute top-1.5 left-1.5 p-1 rounded-md bg-black/50 text-white cursor-pointer"
                >
                  {selectedPhotoIds.includes(photo.id) ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-white/80" />
                  )}
                </button>
              </div>
              <div>
                <p className="font-bold text-xs text-slate-800 truncate">{photo.title}</p>
                <p className="text-[10px] text-slate-400 truncate">{photo.folder || photo.category}</p>
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                <button onClick={(e) => handleDownloadPhoto(photo, e)} className="p-1 text-slate-400 hover:text-emerald-600">
                  <Download className="w-3.5 h-3.5" />
                </button>
                {canManagePhoto(photo) && (
                  <button onClick={() => handleRemovePhoto(photo.id)} className="p-1 text-slate-400 hover:text-rose-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'small' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="bg-white rounded-xl p-1.5 border border-slate-200 hover:border-emerald-400 cursor-pointer flex flex-col justify-between space-y-1 relative group"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
              </div>
              <p className="font-semibold text-[10px] text-slate-800 truncate">{photo.title}</p>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">勾选</th>
                <th className="py-2.5 px-3">缩略图与标题</th>
                <th className="py-2.5 px-3">所属文件夹</th>
                <th className="py-2.5 px-3">拍摄地点</th>
                <th className="py-2.5 px-3">日期</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPhotos.map((photo) => (
                <tr key={photo.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3">
                    <button
                      onClick={(e) => toggleSelectPhoto(photo.id, e)}
                      className="cursor-pointer text-slate-400 hover:text-slate-600"
                    >
                      {selectedPhotoIds.includes(photo.id) ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 flex items-center space-x-2">
                    <img src={photo.url} alt="Thumb" className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                    <span className="truncate max-w-[200px]">{photo.title}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                      {photo.folder || photo.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{photo.location}</td>
                  <td className="py-3 px-3 text-slate-400">{photo.date}</td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button onClick={() => setSelectedPhoto(photo)} className="text-emerald-600 hover:text-emerald-700 font-bold">
                      查看大图
                    </button>
                    <button onClick={(e) => handleDownloadPhoto(photo, e)} className="text-sky-600 hover:text-sky-700">
                      下载
                    </button>
                    {canManagePhoto(photo) && (
                      <button onClick={() => handleRemovePhoto(photo.id)} className="text-rose-500 hover:text-rose-700">
                        删除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredPhotos.length === 0 && (
        <div className="p-12 text-center bg-white/50 rounded-3xl border border-dashed border-slate-200 space-y-2">
          <Folder className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">当前文件夹暂无照片</p>
          <p className="text-xs text-slate-400">点击右上角“上传照片”即可直接存入「{currentFolder}」文件夹</p>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-emerald-600" />
                <span>新建相册文件夹</span>
              </h3>
              <button onClick={() => setShowNewFolderModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateFolder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">文件夹名称</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="如：青丘初雪 / 旅行集 / 摄影志"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  创建并进入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <div className="mt-4 text-center text-white space-y-1">
              <h3 className="text-lg font-bold">{selectedPhoto.title}</h3>
              <p className="text-xs text-slate-300 max-w-xl">{selectedPhoto.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryView;
