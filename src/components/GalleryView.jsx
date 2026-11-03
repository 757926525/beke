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

export const GalleryView = ({ photos, setPhotos, currentUser, isAdmin, t }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('全部');
  const [folders, setFolders] = useState(['全部', '白狐物语', '风景山水', '云端随想', '私享秘境']);
  const [sensitiveFolders, setSensitiveFolders] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_sensitive_folders');
      return saved ? JSON.parse(saved) : ['私享秘境'];
    } catch {
      return ['私享秘境'];
    }
  });
  const [unlockedFolders, setUnlockedFolders] = useState([]);
  const [showAgeWarningModal, setShowAgeWarningModal] = useState(false);
  const [pendingSensitiveFolder, setPendingSensitiveFolder] = useState(null);
  const [isNewFolderSensitive, setIsNewFolderSensitive] = useState(false);

  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
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
    const updatedFolders = [...folders, trimmed];
    setFolders(updatedFolders);
    if (isNewFolderSensitive) {
      const updatedSens = [...sensitiveFolders, trimmed];
      setSensitiveFolders(updatedSens);
      localStorage.setItem('wf_sensitive_folders', JSON.stringify(updatedSens));
    }
    setCurrentFolder(trimmed);
    setNewFolderName('');
    setIsNewFolderSensitive(false);
    setShowNewFolderModal(false);
    setUploadStatus(`新建文件夹「${trimmed}」成功！${isNewFolderSensitive ? ' (已标记为敏感内容文件夹)' : ''}`);
    setTimeout(() => setUploadStatus(null), 3000);
  };

  // Toggle sensitive flag on current folder
  const toggleFolderSensitive = (folderName) => {
    if (!isAdmin) return;
    const isSens = sensitiveFolders.includes(folderName);
    const updated = isSens
      ? sensitiveFolders.filter((f) => f !== folderName)
      : [...sensitiveFolders, folderName];
    setSensitiveFolders(updated);
    localStorage.setItem('wf_sensitive_folders', JSON.stringify(updated));
    setUploadStatus(`文件夹「${folderName}」已${isSens ? '取消' : '开启'}敏感内容标记！`);
    setTimeout(() => setUploadStatus(null), 3000);
  };

  // Switch folder with 18+ check
  const handleSelectFolder = (f) => {
    if (f !== '全部' && sensitiveFolders.includes(f) && !isAdmin && !unlockedFolders.includes(f)) {
      setPendingSensitiveFolder(f);
      setShowAgeWarningModal(true);
      return;
    }
    setCurrentFolder(f);
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
              const isSensitive = sensitiveFolders.includes(f);
              return (
                <div key={f} className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={() => handleSelectFolder(f)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      isActive
                        ? isSensitive
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {isActive ? <FolderOpen className="w-3.5 h-3.5" /> : <Folder className="w-3.5 h-3.5 opacity-60" />}
                    <span>{f}</span>
                    {isSensitive && (
                      <span className="text-[9px] px-1 py-0.2 bg-rose-500 text-white rounded font-bold">
                        18+
                      </span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>

                  {isAdmin && f !== '全部' && (
                    <button
                      onClick={() => toggleFolderSensitive(f)}
                      className={`p-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                        isSensitive
                          ? 'border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100'
                          : 'border-slate-200 text-slate-400 hover:text-slate-600 bg-white'
                      }`}
                      title={isSensitive ? '点击取消敏感标记' : '标记为敏感内容文件夹 (18+)'}
                    >
                      {isSensitive ? '已标记18+' : '标记18+'}
                    </button>
                  )}
                </div>
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

        {/* Batch Operations Bar */}
        <div className="bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 cursor-pointer font-semibold"
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
              当前文件夹「{currentFolder}」共 {filteredPhotos.length} 张图片
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleBatchDownload}
              disabled={selectedPhotoIds.length === 0}
              className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 disabled:opacity-40 border border-sky-200 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>批量下载 ({selectedPhotoIds.length})</span>
            </button>

            {currentUser && (
              <button
                onClick={handleBatchDelete}
                disabled={selectedPhotoIds.length === 0}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-40 border border-rose-200 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>批量删除 ({selectedPhotoIds.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Photos Grid - Strictly 2 Columns (每排两张，全面适应手机与各种屏幕) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="group bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all duration-300"
          >
            {/* Photo preview */}
            <div
              className="relative aspect-4/3 sm:aspect-16/10 overflow-hidden cursor-pointer bg-slate-100"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5 sm:p-4">
                <div className="text-white space-y-0.5">
                  <p className="font-bold text-xs sm:text-sm truncate">{photo.title}</p>
                  <p className="text-[10px] text-slate-300 line-clamp-1">{photo.desc}</p>
                </div>
              </div>
              {/* Batch Checkbox on Photo */}
              <button
                onClick={(e) => toggleSelectPhoto(photo.id, e)}
                className="absolute top-2 left-2 z-10 p-1 rounded-lg bg-black/50 backdrop-blur-md text-white hover:bg-black/70 cursor-pointer transition-colors"
                title={selectedPhotoIds.includes(photo.id) ? '取消勾选' : '勾选此照片'}
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
                title="点击进入该文件夹"
              >
                <Folder className="w-2.5 h-2.5 text-emerald-300" />
                <span>{photo.folder || photo.category || '默认'}</span>
              </div>
            </div>

            {/* Info and Actions */}
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
                  双列自适应
                </span>
                <div className="flex items-center space-x-1 ml-auto">
                  {/* Single Download Button */}
                  <button
                    onClick={(e) => handleDownloadPhoto(photo, e)}
                    title="一键下载此图片"
                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
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

              {isAdmin && (
                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                  <input
                    type="checkbox"
                    id="sensitive-folder-checkbox"
                    checked={isNewFolderSensitive}
                    onChange={(e) => setIsNewFolderSensitive(e.target.checked)}
                    className="rounded text-rose-600 cursor-pointer"
                  />
                  <label htmlFor="sensitive-folder-checkbox" className="text-xs text-rose-800 font-bold cursor-pointer">
                    标记为敏感内容文件夹 (非管理员须确认已满18岁方可见)
                  </label>
                </div>
              )}

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

      {/* 18+ Age Verification Modal */}
      {showAgeWarningModal && pendingSensitiveFolder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl font-black">
              18+
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-800">敏感内容与适龄访问提醒</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                文件夹「<strong>{pendingSensitiveFolder}</strong>」已被标记为敏感内容专区。根据规定，非管理员访客必须确认已满 18 周岁方可解锁浏览。
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-[11px] text-left">
              • 请确认您已达法定成年年龄并愿意自愿浏览本分类内的影像记录。
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => {
                  setShowAgeWarningModal(false);
                  setPendingSensitiveFolder(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                未满18岁 / 退出
              </button>
              <button
                onClick={() => {
                  setUnlockedFolders([...unlockedFolders, pendingSensitiveFolder]);
                  setCurrentFolder(pendingSensitiveFolder);
                  setShowAgeWarningModal(false);
                  setPendingSensitiveFolder(null);
                  setUploadStatus(`已确认年龄认证，已解锁「${pendingSensitiveFolder}」！`);
                  setTimeout(() => setUploadStatus(null), 3000);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                我已满 18 岁，继续查看
              </button>
            </div>
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
