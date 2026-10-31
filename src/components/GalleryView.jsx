import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  FolderSync,
  UploadCloud,
  CheckCircle2,
  Maximize2,
  MapPin,
  Calendar,
  X
} from 'lucide-react';

export default function GalleryView({
  photos,
  onAddPhoto,
  onRemovePhoto,
  onSaveToNetDrive
}) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  const categories = ['全部', '白狐物语', '风景山水', '云端随想'];

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newPhoto = {
      id: `photo-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      desc: '本地上传的珍贵摄影照片。已妥善同步至本地及对象存储中枢。',
      url: URL.createObjectURL(file),
      category: '白狐物语',
      date: new Date().toISOString().split('T')[0],
      location: '随拍记录'
    };

    onAddPhoto(newPhoto);
    setUploadStatus(`照片《${newPhoto.title}》上传成功并已入库！`);
    setTimeout(() => setUploadStatus(null), 3000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNetDriveSave = async (photo) => {
    const res = await onSaveToNetDrive(photo);
    setUploadStatus(`照片已转存至网盘：${res.path}`);
    setTimeout(() => setUploadStatus(null), 3000);
  };

  const filteredPhotos = photos.filter(
    (p) => selectedCategory === '全部' || p.category === selectedCategory
  );

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-semibold text-sm mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>光影相册</span>
          </div>
          <h2 className="font-serif-sc text-3xl font-bold text-slate-900 dark:text-white">
            白狐光影视觉集与云端图床
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            无缝连接 Cloudflare R2 / 腾讯云 COS / 阿里云 OSS 对象存储，支持大图高清全屏浏览与网盘转存。
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl fox-gradient text-white font-medium text-sm shadow-md hover:shadow-rose-500/25 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>上传照片至相册</span>
          </button>
        </div>
      </div>

      {uploadStatus && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === c
                ? 'bg-rose-600 text-white shadow-sm'
                : 'glass-panel text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Photos Masonry/Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="group glass-panel rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300"
          >
            <div
              className="relative h-64 overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-800"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <div className="text-white space-y-1">
                  <p className="font-semibold text-sm">{photo.title}</p>
                  <p className="text-xs text-slate-300 line-clamp-1">{photo.desc}</p>
                </div>
              </div>
              <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {photo.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {photo.date}
                </span>
              </div>
              <h4 className="font-serif-sc font-bold text-slate-900 dark:text-white">
                {photo.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {photo.desc}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleNetDriveSave(photo)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>存入网盘</span>
                </button>

                <button
                  onClick={() => onRemovePhoto(photo.id)}
                  title="删除照片"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <div className="mt-4 text-center text-white space-y-1">
              <h3 className="font-serif-sc text-xl font-bold">{selectedPhoto.title}</h3>
              <p className="text-sm text-slate-300 max-w-xl">{selectedPhoto.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
