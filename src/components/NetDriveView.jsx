import React, { useState } from 'react';
import {
  HardDrive, Cloud, Server, Database,
  FolderPlus, Upload, Trash2, ExternalLink,
  ShieldAlert, RefreshCw, Key, Globe, Eye,
  CheckCircle2, Folder, Copy
} from 'lucide-react';

export const NetDriveView = ({ cloudConfig, setCloudConfig, cloudFiles, setCloudFiles, t }) => {
  const [activeDriver, setActiveDriver] = useState('r2'); // 'r2' | 'cos' | 'oss' | 'alist'
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [copiedUrl, setCopiedUrl] = useState('');

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncStatus('正在与多云端存储与网盘同步状态...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('多云与网盘目录同步完成！所有存储节点正常响应。');
      setTimeout(() => setSyncStatus(''), 3000);
    }, 1000);
  };

  const handleCopy = (url) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <HardDrive className="w-3.5 h-3.5" />
              <span>多云聚合 · 云盘与对象存储选区</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              网盘与多云调度中枢
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              集中调度 Cloudflare R2、腾讯云 COS、阿里云 OSS 与 AList/WebDAV 挂载网盘，支持跨云文件管理与站内直链调度。
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-2 shadow-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? '同步中...' : '同步多云状态'}</span>
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

      {/* Cloud Providers Selection Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'r2', name: 'Cloudflare R2', icon: Cloud, desc: '0 出站费边缘存储' },
          { id: 'cos', name: '腾讯云 COS', icon: Server, desc: '国内极速 CDN 存储' },
          { id: 'oss', name: '阿里云 OSS', icon: Database, desc: '高可用对象存储' },
          { id: 'alist', name: 'AList / WebDAV', icon: HardDrive, desc: '多网盘聚合挂载' },
        ].map((p) => {
          const Icon = p.icon;
          const isSelected = activeDriver === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActiveDriver(p.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white/80 hover:bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span className="font-bold text-xs text-slate-800">{p.name}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{p.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Driver Configuration Form */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <Key className="w-4 h-4 text-emerald-600" />
          <span>当前存储源配置与密钥绑定</span>
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
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
                placeholder="https://r2.yourdomain.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cloud Files Listing */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">已调度网盘与对象存储文件 ({cloudFiles.length})</h2>
          <span className="text-xs text-slate-400">已就绪实时索引与站内直达</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">文件名</th>
                <th className="py-2.5 px-3">存储端</th>
                <th className="py-2.5 px-3">大小</th>
                <th className="py-2.5 px-3">日期</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cloudFiles.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-semibold text-slate-800 flex items-center space-x-2">
                    <Folder className="w-4 h-4 text-emerald-600" />
                    <span>{file.name}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono">
                      {file.provider}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{file.size}</td>
                  <td className="py-3 px-3 text-slate-400">{file.uploadedAt}</td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => handleCopy(file.url)}
                      className="text-slate-500 hover:text-emerald-600 inline-block p-1"
                      title="复制文件链接"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 inline-block p-1"
                      title="打开外链"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
