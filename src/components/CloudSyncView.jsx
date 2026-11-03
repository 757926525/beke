import React, { useState } from 'react';
import {
  Cloud,
  Database,
  HardDrive,
  FolderOpen,
  FolderSync,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Server,
  Save,
  Link as LinkIcon,
  UploadCloud,
  RefreshCw
} from 'lucide-react';

export default function CloudSyncView({
  cloudConfig,
  onSaveCloudConfig,
  onSyncD1,
  isSyncing
}) {
  const [config, setConfig] = useState(cloudConfig);
  const [activeTab, setActiveTab] = useState('d1');
  const [toastMsg, setToastMsg] = useState(null);

  // NetDrive manual quote/reference state
  const [quoteInputUrl, setQuoteInputUrl] = useState('');
  const [quotedFiles, setQuotedFiles] = useState([
    {
      id: 'q-1',
      title: '青丘全景壁纸集.zip',
      url: 'https://pan.whitefox.blog/d/青丘全景壁纸集.zip',
      source: '网盘引用',
      folder: '/白狐博客专存/媒体与电子书/'
    },
    {
      id: 'q-2',
      title: '分布式高并发架构精要.epub',
      url: 'https://pan.whitefox.blog/d/分布式高并发架构精要.epub',
      source: '网盘引用',
      folder: '/白狐博客专存/媒体与电子书/'
    }
  ]);

  const handleSave = (e) => {
    e.preventDefault();
    onSaveCloudConfig(config);
    setToastMsg('多云配置与网盘连接参数已成功保存！');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddQuote = (e) => {
    e.preventDefault();
    if (!quoteInputUrl.trim()) return;

    const newQuote = {
      id: `q-${Date.now()}`,
      title: quoteInputUrl.split('/').pop() || '网盘引用文件',
      url: quoteInputUrl.trim(),
      source: '网盘外链引用',
      folder: config.netDrive.targetFolder
    };
    setQuotedFiles([newQuote, ...quotedFiles]);
    setQuoteInputUrl('');
    setToastMsg(`网盘文件《${newQuote.title}》已成功引用到站内！`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-semibold text-sm mb-1">
            <Cloud className="w-4 h-4" />
            <span>网盘与多云中枢</span>
          </div>
          <h2 className="font-serif-sc text-3xl font-bold text-slate-900 dark:text-white">
            Cloudflare D1/R2、腾讯云 COS、阿里云 OSS 与网盘集成
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            实现收藏、浏览历史、相册和文章的分布式多云同步，登录网盘一键双向保存与站内文件引用。
          </p>
        </div>

        <button
          onClick={onSyncD1}
          disabled={isSyncing}
          className="px-5 py-2.5 rounded-xl fox-gradient text-white font-medium text-sm shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          <FolderSync className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? '正在同步 D1 数据库...' : '立即同步 D1 数据库'}</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('d1')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'd1'
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Cloudflare D1 数据库</span>
        </button>

        <button
          onClick={() => setActiveTab('r2')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'r2'
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Cloudflare R2 对象存储</span>
        </button>

        <button
          onClick={() => setActiveTab('tencent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'tencent'
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>腾讯云 COS</span>
        </button>

        <button
          onClick={() => setActiveTab('aliyun')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'aliyun'
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>阿里云 OSS</span>
        </button>

        <button
          onClick={() => setActiveTab('pan')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'pan'
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>内置网盘与文件引用</span>
        </button>
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSave} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        {/* D1 Configuration */}
        {activeTab === 'd1' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-sc font-bold text-lg text-slate-900 dark:text-white">
                  Cloudflare D1 边缘 SQL 数据库
                </h3>
                <p className="text-xs text-slate-500">
                  用于存储博客元数据、浏览历史轨迹与全网收藏书签的分布式跨地域同步
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.d1.enabled}
                  onChange={(e) =>
                    setConfig({ ...config, d1: { ...config.d1, enabled: e.target.checked } })
                  }
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-sm font-medium">启用 D1 数据库同步</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Cloudflare Account ID
                </label>
                <input
                  type="text"
                  value={config.d1.accountId}
                  onChange={(e) =>
                    setConfig({ ...config, d1: { ...config.d1, accountId: e.target.value } })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  D1 Database ID / Name
                </label>
                <input
                  type="text"
                  value={config.d1.databaseId}
                  onChange={(e) =>
                    setConfig({ ...config, d1: { ...config.d1, databaseId: e.target.value } })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Cloudflare API Token (D1 Edit Permissions)
                </label>
                <input
                  type="password"
                  value={config.d1.apiToken}
                  onChange={(e) =>
                    setConfig({ ...config, d1: { ...config.d1, apiToken: e.target.value } })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* R2 Configuration */}
        {activeTab === 'r2' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-sc font-bold text-lg text-slate-900 dark:text-white">
                  Cloudflare R2 对象存储 (S3 兼容协议 · 零出口费用)
                </h3>
                <p className="text-xs text-slate-500">
                  用于相册、电子书、音频视频与站点附件文件的永久存储
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.r2.enabled}
                  onChange={(e) =>
                    setConfig({ ...config, r2: { ...config.r2, enabled: e.target.checked } })
                  }
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-sm font-medium">启用 R2 对象存储</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Bucket Name
                </label>
                <input
                  type="text"
                  value={config.r2.bucketName}
                  onChange={(e) =>
                    setConfig({ ...config, r2: { ...config.r2, bucketName: e.target.value } })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  自定义访问域名 (Custom Domain)
                </label>
                <input
                  type="text"
                  value={config.r2.customDomain}
                  onChange={(e) =>
                    setConfig({ ...config, r2: { ...config.r2, customDomain: e.target.value } })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  R2 Access Key ID
                </label>
                <input
                  type="text"
                  value={config.r2.accessKeyId}
                  onChange={(e) =>
                    setConfig({ ...config, r2: { ...config.r2, accessKeyId: e.target.value } })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  R2 Secret Access Key
                </label>
                <input
                  type="password"
                  value={config.r2.secretAccessKey}
                  onChange={(e) =>
                    setConfig({ ...config, r2: { ...config.r2, secretAccessKey: e.target.value } })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tencent COS */}
        {activeTab === 'tencent' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-sc font-bold text-lg text-slate-900 dark:text-white">
                  腾讯云 COS 对象存储
                </h3>
                <p className="text-xs text-slate-500">
                  国内低延迟访问首选，配合 EdgeOne 或 CDN 实现高速媒体托管
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.tencentCos.enabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tencentCos: { ...config.tencentCos, enabled: e.target.checked }
                    })
                  }
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-sm font-medium">启用腾讯云 COS</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Bucket 存储桶名 (格式: name-appid)
                </label>
                <input
                  type="text"
                  value={config.tencentCos.bucket}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tencentCos: { ...config.tencentCos, bucket: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Region 所在地域 (例如: ap-guangzhou / ap-beijing)
                </label>
                <input
                  type="text"
                  value={config.tencentCos.region}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tencentCos: { ...config.tencentCos, region: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  SecretId
                </label>
                <input
                  type="text"
                  value={config.tencentCos.secretId}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tencentCos: { ...config.tencentCos, secretId: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  SecretKey
                </label>
                <input
                  type="password"
                  value={config.tencentCos.secretKey}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tencentCos: { ...config.tencentCos, secretKey: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Aliyun OSS */}
        {activeTab === 'aliyun' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-sc font-bold text-lg text-slate-900 dark:text-white">
                  阿里云 OSS 对象存储
                </h3>
                <p className="text-xs text-slate-500">
                  与阿里云 ESA 边缘安全加速联动，提供高可用、多可用区对象存储
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.aliyunOss.enabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      aliyunOss: { ...config.aliyunOss, enabled: e.target.checked }
                    })
                  }
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-sm font-medium">启用阿里云 OSS</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Bucket 存储桶名
                </label>
                <input
                  type="text"
                  value={config.aliyunOss.bucket}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      aliyunOss: { ...config.aliyunOss, bucket: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Region 地域 Endpoint (例如: oss-cn-hangzhou)
                </label>
                <input
                  type="text"
                  value={config.aliyunOss.region}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      aliyunOss: { ...config.aliyunOss, region: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  AccessKey ID
                </label>
                <input
                  type="text"
                  value={config.aliyunOss.accessKeyId}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      aliyunOss: { ...config.aliyunOss, accessKeyId: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  AccessKey Secret
                </label>
                <input
                  type="password"
                  value={config.aliyunOss.accessKeySecret}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      aliyunOss: { ...config.aliyunOss, accessKeySecret: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* NetDrive & WebDAV / In-site Reference */}
        {activeTab === 'pan' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-sc font-bold text-lg text-slate-900 dark:text-white">
                  内置云网盘绑定与一键转存
                </h3>
                <p className="text-xs text-slate-500">
                  支持连接 AList、WebDAV、百度网盘、夸克等，指定站内文件一键保存目标文件夹，并可一键引用网盘文件
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 text-xs font-semibold">
                ● 网盘状态已联通
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  网盘服务提供商
                </label>
                <input
                  type="text"
                  value={config.netDrive.provider}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      netDrive: { ...config.netDrive, provider: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  网盘服务器/挂载地址
                </label>
                <input
                  type="text"
                  value={config.netDrive.serverUrl}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      netDrive: { ...config.netDrive, serverUrl: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  站内文件一键保存的网盘指定文件夹路径
                </label>
                <input
                  type="text"
                  value={config.netDrive.targetFolder}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      netDrive: { ...config.netDrive, targetFolder: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
                />
              </div>
            </div>

            {/* In-Site File Reference Area */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-serif-sc font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-rose-500" />
                <span>一键引用网盘内的文件或网址到站内</span>
              </h4>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="输入网盘直链或分享网址（例如：https://pan.whitefox.blog/d/wallpaper.png）..."
                  value={quoteInputUrl}
                  onChange={(e) => setQuoteInputUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddQuote}
                  className="px-4 py-2 rounded-xl fox-gradient text-white text-xs font-semibold"
                >
                  一键引用入站
                </button>
              </div>

              {/* Quoted files preview */}
              <div className="space-y-2">
                {quotedFiles.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <HardDrive className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {q.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                        ({q.folder})
                      </span>
                    </div>

                    <a
                      href={q.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
                    >
                      <span>打开网盘文件</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl fox-gradient text-white font-medium text-sm shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>保存全部云端与网盘配置</span>
          </button>
        </div>
      </form>
    </div>
  );
}
