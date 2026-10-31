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
import { initialPhotos } from '../data/mockData';

export const GalleryView = ({ t }) => {
  const [photos, setPhotos] = useState(initialPhotos);
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
      desc: '本地上传的摄影照片，已安全记录至相册与云端存储。',
      url: URL.createObjectURL(file),
      category: '白狐物语',
      date: new Date().toISOString().split('T')[0],
      location: '随拍记录'
    };

    setPhotos([newPhoto, ...photos]);
    setUploadStatus(`照片《${newPhoto.title}》上传成功并入库！`);
    setTimeout(() => setUploadStatus(null), 3000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (id) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const filteredPhotos = photos.filter(
    (p) => selectedCategory === '全部' || p.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>光影视界 · 云端图床</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            白狐光影视觉集与云相册
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            无缝直连 Cloudflare R2 / 腾讯云 COS / 阿里云 OSS 对象存储，支持大图高清灯箱浏览。
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
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>上传照片至相册</span>
          </button>
        </div>
      </div>

      {uploadStatus && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === c
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="group bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all duration-300"
          >
            <div
              className="relative h-64 overflow-hidden cursor-pointer bg-slate-100"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <div className="text-white space-y-0.5">
                  <p className="font-bold text-xs">{photo.title}</p>
                  <p className="text-[10px] text-slate-300 line-clamp-1">{photo.desc}</p>
                </div>
              </div>
              <div className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="p-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{photo.location}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{photo.date}</span>
                </span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm">
                {photo.title}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {photo.desc}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => handleRemovePhoto(photo.id)}
                  title="删除照片"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500"
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
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white transition-colors"
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
