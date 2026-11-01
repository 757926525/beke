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
  Layers
} from 'lucide-react';

export const GalleryView = ({ photos, setPhotos, t }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('全部');
  const [folders, setFolders] = useState(['全部', '白狐物语', '风景山水', '云端随想']);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Use FileReader for base64 persistence to localStorage so it survives page reload
    const reader = new FileReader();
    reader.onload = (event) => {
      // Compress through HTML5 Canvas
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

        // Upload into currently selected folder, default to 白狐物语 if "全部" is selected
        const targetFolder = currentFolder === '全部' ? '白狐物语' : currentFolder;

        const newPhoto = {
          id: `photo-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          desc: `上传至文件夹「${targetFolder}」，已安全记录至相册与本地持久化存储。`,
          url: dataUrl,
          category: targetFolder,
          folder: targetFolder,
          date: new Date().toISOString().split('T')[0],
          location: '随拍记录'
        };

        setPhotos([newPhoto, ...photos]);
        setUploadStatus(`照片《${newPhoto.title}》已成功存入文件夹「${targetFolder}」！`);
        setTimeout(() => setUploadStatus(null), 3000);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (id) => {
    setPhotos(photos.filter((p) => p.id !== id));
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
            onChange={handleUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{currentFolder === '全部' ? '上传照片' : `上传照片至「${currentFolder}」`}</span>
          </button>
        </div>
      </div>

      {uploadStatus && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Folders Tabs Navigation */}
      <div className="bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 flex items-center gap-2 overflow-x-auto">
        <div className="flex items-center space-x-1 text-xs text-slate-400 font-semibold px-2 flex-shrink-0">
          <Folder className="w-3.5 h-3.5 text-emerald-600" />
          <span>文件夹:</span>
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
              <div className="absolute top-2 right-2 p-1 rounded-lg bg-black/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3 h-3" />
              </div>
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-semibold flex items-center space-x-1">
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
                <button
                  onClick={() => handleRemovePhoto(photo.id)}
                  title="删除照片"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
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
