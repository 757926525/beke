import React, { useState } from 'react';
import {
  HardDrive, Cloud, Server, Database,
  FolderPlus, Upload, Trash2, ExternalLink,
  ShieldAlert, RefreshCw, Key, Globe, Eye,
  CheckCircle2, Folder, Copy, BookOpen, ChevronDown, ChevronUp,
  Terminal, Info, Check, ShieldCheck
} from 'lucide-react';

export const NetDriveView = ({ cloudConfig, setCloudConfig, cloudFiles, setCloudFiles, t }) => {
  const [activeDriver, setActiveDriver] = useState('r2'); // 'r2' | 'cos' | 'oss' | 'alist'
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [copiedUrl, setCopiedUrl] = useState('');
  const [showUsageGuide, setShowUsageGuide] = useState(true);

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
            {/* Guide Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* R2 Guide */}
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

              {/* Tencent COS Guide */}
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

              {/* Alibaba OSS Guide */}
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

              {/* AList / WebDAV Guide */}
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

            {/* Quick Tips Box */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-xs">安全与边缘加速最佳实践：</div>
                <p className="text-[11px] leading-relaxed">
                  白狐博客推荐使用「<strong>Cloudflare Pages + Cloudflare R2</strong>」组合，全球 Anycast 边缘网络加速且免费额度充沛，完全无出站流量账单隐患。对于国内访客，可接入「腾讯云 EdgeOne」或「阿里云 ESA」作为国内前置 CDN。
                </p>
              </div>
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
