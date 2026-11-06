import React, { useState } from 'react';
import {
  Cloud,
  Server,
  Zap,
  Globe,
  UploadCloud,
  FileCode,
  Copy,
  CheckCircle2,
  AlertTriangle,
  FolderArchive,
  Download,
  Terminal,
  Database,
  ShieldCheck,
  Cpu,
  Layers,
  Info
} from 'lucide-react';

export const DeploymentGuideView = ({ siteName = 'fox', t }) => {
  const [activeTab, setActiveTab] = useState('cf-pages');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2500);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>全域自动化 · 多云架构部署中枢</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight capitalize">
              {siteName} 博客多云部署与构建全景指南
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              首选推荐 Cloudflare Pages Git 一键拉取自动持续部署，亦全面支持腾讯云 EdgeOne / COS、阿里云 ESA / OSS 与 Docker 私有容器化部署。
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>零元构建 · 秒级上线</span>
            </span>
          </div>
        </div>

        {/* Cloud Platforms Selection Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('cf-pages')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'cf-pages'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Cloudflare Pages (首选一键拉取)</span>
          </button>

          <button
            onClick={() => setActiveTab('cf-upload')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'cf-upload'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Pages 一键上传压缩包</span>
          </button>

          <button
            onClick={() => setActiveTab('tencent-edgeone')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'tencent-edgeone'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>腾讯云 EdgeOne / COS</span>
          </button>

          <button
            onClick={() => setActiveTab('aliyun-esa')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'aliyun-esa'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>阿里云 ESA / OSS</span>
          </button>

          <button
            onClick={() => setActiveTab('docker')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'docker'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Docker & Nginx 私有化</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel-netlify')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'vercel-netlify'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Vercel / Netlify / Railway</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'database'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Cloudflare D1 & R2 后台直绑指南</span>
          </button>
        </div>
      </div>

      {/* Cloudflare Pages Free Tier Limit Official Notice (要求必须原样增加的区块) */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-amber-900 font-bold text-base sm:text-lg">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>Cloudflare Pages 免费计划配额与存储说明</span>
        </div>
        <div className="text-slate-800 text-sm leading-relaxed space-y-3 font-sans bg-white/70 p-5 rounded-2xl border border-amber-200/60">
          <p className="font-semibold text-amber-950">
            [Cloudflare Pages 免费计划 的话：不连数据库时，一个 Pages 项目最多能存 20,000 个文件。
          </p>
          <p>
            另外还有两个硬限制：
          </p>
          <p className="pl-4 border-l-2 border-amber-400">
            单文件最大 25 MiB，超过这个大小不能直接放进 Pages 站点资源里。
          </p>
          <p className="pl-4 border-l-2 border-amber-400">
            总文件数限制按项目算，不是按账号算；一个账号最多可以有 100 个 Pages 项目。
          </p>
          <p>
            R2 的文件数量没有明确上限，但受 10 GB 存储 限制；KV 虽然 key 数量不限，但总存储只有 1 GB。
          </p>
          <p className="font-semibold text-amber-950">
            所以如果你只是部署静态站点，20,000 个文件、每个不超过 25 MiB 就是 Pages 免费版的文件上限。超过的话，建议把大文件、图片、视频类资源挪到 R2。]
          </p>
        </div>
      </div>

      {/* 1. Cloudflare Pages Git Pull Priority */}
      {activeTab === 'cf-pages' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Cloud className="w-5 h-5 text-emerald-600" />
                <span>方案一：Cloudflare Pages 一键 Git 拉取部署（推荐首选）</span>
              </h2>
              <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                自动 CI/CD · 永久免费
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              这是官方最为推荐的部署方式。每次向 Git 仓库（GitHub / GitLab）推送代码，Cloudflare 全球边缘网络将自动拉取、构建并分发到全球 330+ 数据中心，零运维、高安全。
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700">1. 进入 Cloudflare 仪表盘</p>
                <p className="text-xs text-slate-500">
                  访问 <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-emerald-600 font-semibold underline">dash.cloudflare.com</a>，点击左侧导航 <strong>Workers & Pages</strong>，选择 <strong>Create application</strong> -&gt; <strong>Pages</strong> -&gt; <strong>Connect to Git</strong>。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-700">2. 配置构建预设参数（Build Settings）</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Framework preset (框架预设)</span>
                    <span className="text-emerald-700 font-bold">Vite</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Build command (构建命令)</span>
                    <span className="text-emerald-700 font-bold">npm run build</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Build output directory (输出目录)</span>
                    <span className="text-emerald-700 font-bold">dist</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Node.js Version (环境变量)</span>
                    <span className="text-emerald-700 font-bold">NODE_VERSION = 20</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700">3. 绑定环境变量 (可选但推荐)</p>
                <p className="text-xs text-slate-500">
                  在 Pages 项目 <strong>Settings</strong> -&gt; <strong>Environment variables</strong> 中添加 <code>.env.example</code> 中的配置，即可无缝连通 D1 边缘数据库与 R2 存储桶。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Cloudflare Pages Direct Zip Upload */}
      {activeTab === 'cf-upload' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <FolderArchive className="w-5 h-5 text-emerald-600" />
                <span>方案二：Pages 一键上传压缩包部署（免 Git 绑定）</span>
              </h2>
              <span className="text-xs px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-full">
                免安装 Git · 拖拽秒传
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              如果您无需绑定 GitHub/GitLab 仓库，可直接使用白狐项目内置打包工具生成现成 zip 文件，拖入 Cloudflare Pages 控制台即可直接上线！
            </p>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <h3 className="text-xs font-bold text-emerald-900 flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-700" />
                  <span>获取/生成 Cloudflare Pages 上传压缩包的方法：</span>
                </h3>

                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs relative overflow-x-auto">
                  <code># 步骤 1: 构建并自动输出上传专用压缩包{'\n'}npm run package:pages{'\n\n'}# 执行后将在仓库根目录生成：whitefox-pages-deploy.zip</code>
                  <button
                    onClick={() => copyToClipboard('npm run package:pages', 101)}
                    className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center space-x-1"
                  >
                    {copiedIndex === 101 ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>复制命令</span>
                  </button>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>• 本地执行完 <code>npm run package:pages</code> 后，会自动在项目根目录生成 <strong>whitefox-pages-deploy.zip</strong>。</p>
                  <p>• 该压缩包包含经过生产级 Tree-shaking 压缩的纯静态前端及重定向规则，无需任何后端环境。</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700">在控制台拖拽部署操作步骤：</p>
                <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 pl-2">
                  <li>打开 <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-emerald-600 font-semibold underline">Cloudflare 控制台</a> -&gt; <strong>Workers & Pages</strong>。</li>
                  <li>点击 <strong>Create application</strong> -&gt; 选择 <strong>Pages</strong> 选项卡。</li>
                  <li>选择 <strong>Upload assets (直接上传资产)</strong>。</li>
                  <li>为项目起名（如 <code>whitefox-blog</code>）。</li>
                  <li>直接拖拽 <strong>whitefox-pages-deploy.zip</strong> 解压后的整个目录或文件到上传框中。</li>
                  <li>点击 <strong>Deploy site</strong>，10 秒内即可全球上线并获得 <code>*.pages.dev</code> 免费域名！</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tencent Cloud EdgeOne / COS */}
      {activeTab === 'tencent-edgeone' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                <span>方案三：腾讯云 EdgeOne / COS 静态托管部署</span>
              </h2>
              <span className="text-xs px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full">
                国内超低延迟 · 极速备案节点
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              适合已有国内 ICP 备案且对国内网络访问速度有极高要求的用户。将打包产物托管于腾讯云 COS 对象存储，并通过 EdgeOne 边缘加速提供全球访问。
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-700">1. 构建静态产物并上传 COS</p>
                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs relative overflow-x-auto">
                  <code># 编译 Vite 静态资源{'\n'}npm run build{'\n\n'}# 使用腾讯云官方 coscli 上传 dist 目录到存储桶{'\n'}coscli sync ./dist/ cos://whitefox-bucket/ -r</code>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700">2. COS 静态网站配置</p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
                  <li>进入 COS 存储桶管理 -&gt; <strong>基础配置</strong> -&gt; <strong>静态网站</strong>。</li>
                  <li>开启静态网站，索引文档填写 <code>index.html</code>，错误文档填写 <code>index.html</code> (确保 SPA 单页路由支持)。</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700">3. 开启 EdgeOne 边缘加速与一键 HTTPS</p>
                <p className="text-xs text-slate-500">
                  在 EdgeOne 添加已备案域名，源站选择上述 COS 存储桶源站域名，开启边缘缓存、Brotli 压缩与自动免费 SSL 证书。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Alibaba Cloud ESA / OSS */}
      {activeTab === 'aliyun-esa' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Server className="w-5 h-5 text-emerald-600" />
                <span>方案四：阿里云 ESA (边缘安全加速) / OSS 静态托管</span>
              </h2>
              <span className="text-xs px-3 py-1 bg-purple-100 text-purple-800 font-bold rounded-full">
                高可用对象存储 · 阿里云全生态
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              将构建文件上传至阿里云 OSS 存储桶，并通过阿里云 ESA (边缘安全加速平台) 提供全球节点加速与抗 DDoS/WAF 安全防护。
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-700">1. 构建并上传 OSS</p>
                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs relative overflow-x-auto">
                  <code># 编译 Vite 项目{'\n'}npm run build{'\n\n'}# 使用 ossutil 命令行同步到 OSS Bucket{'\n'}ossutil sync ./dist/ oss://whitefox-bucket/ -u</code>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700">2. OSS 静态页面设置</p>
                <p className="text-xs text-slate-500">
                  在 OSS 控制台 -&gt; <strong>数据管理</strong> -&gt; <strong>静态页面</strong> 中开启设置，默认首页设为 <code>index.html</code>，404 错误页同样设为 <code>index.html</code>。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700">3. 配置 ESA 域名加速</p>
                <p className="text-xs text-slate-500">
                  在 ESA 控制台添加站点与自定义域名，源站选择 OSS 域名，配置全站 HTTPS 与智能压缩。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Docker & Nginx */}
      {activeTab === 'docker' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                <span>方案五：Docker & Nginx 独立服务器私有化部署</span>
              </h2>
              <span className="text-xs px-3 py-1 bg-slate-200 text-slate-800 font-bold rounded-full">
                轻量容器化 · 跨平台通用
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              适合拥有独立 VPS (如搬瓦工、Linode、腾讯云 CVM、阿里云 ECS) 的极客用户。仓库内已包含生产级 Dockerfile、docker-compose.yml 与高并发 gzip 配置的 Nginx 配置文件。
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-700">1. 使用 Docker Compose 一键启动</p>
                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs relative overflow-x-auto">
                  <code># 在项目根目录执行{'\n'}docker compose up -d --build{'\n\n'}# 容器就绪后即可通过 http://&lt;服务器IP&gt;:80 访问</code>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-700">2. 原生 Docker 命令构建</p>
                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs relative overflow-x-auto">
                  <code>docker build -t whitefox-blog:latest .{'\n'}docker run -d -p 80:80 --name whitefox whitefox-blog:latest</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Vercel & Netlify & Railway Deployment Guide */}
      {activeTab === 'vercel-netlify' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>Vercel / Netlify / Railway 多平台云托管部署</span>
              </h2>
              <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                自动化 Git CI/CD
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              白狐博客系统基于纯标准 React 19 + Vite 构建，可无缝部署至全球任何静态与 Serverless 云托管平台：
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-700">1. Vercel 极速部署</p>
                <p className="text-xs text-slate-600">
                  访问 <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-600 font-semibold underline">vercel.com</a>，点击 <strong>Add New Project</strong>，导入 GitHub 仓库。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-white p-3 rounded-xl border border-slate-200">
                  <div><span className="text-slate-400">Build Command:</span> <span className="font-bold text-emerald-700">npm run build</span></div>
                  <div><span className="text-slate-400">Output Directory:</span> <span className="font-bold text-emerald-700">dist</span></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-700">2. Netlify 部署</p>
                <p className="text-xs text-slate-600">
                  访问 <a href="https://app.netlify.com" target="_blank" rel="noreferrer" className="text-emerald-600 font-semibold underline">app.netlify.com</a>，选择 <strong>Import from Git</strong>。构建命令填 <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">npm run build</code>，发布目录填 <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">dist</code>。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700">3. Railway / VPS 容器部署</p>
                <p className="text-xs text-slate-600">
                  直接连接 GitHub 仓库，Railway 将自动识别根目录的 <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">Dockerfile</code> 进行多阶段快速打包上线。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Cloudflare D1 & R2 Direct Binding Guide */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>Cloudflare 控制台后台直接绑定 D1 数据库与 R2 对象存储</span>
              </h2>
              <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                免填 UUID · 免暴露密钥 · 原生直绑
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              无需在代码或配置文件中硬编码数据库 UUID 或密钥！您可直接在 Cloudflare Dashboard 控制台完成 D1 数据库与 R2 存储桶的一键原生绑定，系统状态灯将自动识别点亮为绿色 Connected。
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2.5">
                <p className="text-xs font-bold text-emerald-900">第一步：在 Cloudflare Dashboard 控制台创建 D1 与 R2</p>
                <ol className="list-decimal list-inside text-xs text-emerald-800 space-y-1.5 pl-1 leading-relaxed">
                  <li>登录 <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="underline font-bold">Cloudflare Dashboard</a> -&gt; 进入 <strong>Storage &amp; Databases</strong>。</li>
                  <li>点击 <strong>D1 SQL Database</strong> -&gt; <strong>Create database</strong>，名称填 <code className="font-mono bg-white/70 px-1 py-0.5 rounded">whitefox-db</code>。</li>
                  <li>进入该数据库的 <strong>Console (控制台)</strong>，粘贴执行仓库提供的 <code className="font-mono bg-white/70 px-1 py-0.5 rounded">deploy/cloudflare-d1-schema.sql</code> 即可完成建表。</li>
                  <li>（可选）点击 <strong>R2 Object Storage</strong> -&gt; <strong>Create bucket</strong>，名称填 <code className="font-mono bg-white/70 px-1 py-0.5 rounded">whitefox-assets</code>。</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <p className="text-xs font-bold text-slate-700">第二步：在 Pages 项目后台一键配置原生绑定 (Direct Binding)</p>
                <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 pl-1 leading-relaxed">
                  <li>在 Cloudflare 控制台打开您的 Pages 项目 (如 <code className="font-mono bg-white px-1 py-0.5 rounded">whitefox-blog</code>)。</li>
                  <li>点击 <strong>Settings (设置)</strong> -&gt; <strong>Functions (函数)</strong>。</li>
                  <li>向下滚动到 <strong>D1 database bindings (D1 数据库绑定)</strong> -&gt; 点击 <strong>Add binding (添加绑定)</strong>：
                    <ul className="list-disc list-inside pl-4 text-slate-700 font-mono mt-1 space-y-0.5">
                      <li>Variable name (变量名称): <strong>DB</strong> （必须为大写字母 DB）</li>
                      <li>D1 database (选择数据库): 选择刚创建的 <strong>whitefox-db</strong></li>
                    </ul>
                  </li>
                  <li>向下滚动到 <strong>R2 bucket bindings (R2 存储桶绑定)</strong> -&gt; 点击 <strong>Add binding (添加绑定)</strong>：
                    <ul className="list-disc list-inside pl-4 text-slate-700 font-mono mt-1 space-y-0.5">
                      <li>Variable name (变量名称): <strong>BUCKET</strong> （必须为大写字母 BUCKET）</li>
                      <li>R2 bucket (选择存储桶): 选择刚创建的 <strong>whitefox-assets</strong></li>
                    </ul>
                  </li>
                  <li>点击 <strong>Save (保存)</strong> 并触发一次重新部署。完成后，站内数据库与存储桶状态灯将自动点亮，全站数据实现持久化与多端极速同步！</li>
                </ol>

                <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <p className="font-bold mb-1">⚡ 为什么上传/登录曾返回 405 Method Not Allowed？</p>
                  <p>若使用 Zip/文件夹直接上传 (Direct Upload)，Pages 默认仅将文件作为纯静态托管，不会自动编译 functions 目录。现构建流程已内置 <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">_worker.js</code> 与 <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">_routes.json</code>，双模自动接管全部 POST 请求，彻底杜绝 405 错误！</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
                <p className="text-xs font-bold text-amber-900">第三步：CORS 跨域与下载验证排查</p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  系统内部内置了标准 CORS 响应头和 /api/upload 流式下载通道。如果您在 R2 存储桶绑定了自定义域名并出现跨域报错，请在 Cloudflare R2 存储桶设置中的 <strong>CORS Policy</strong> 添加允许 Origin 为 <code className="font-mono bg-white px-1 py-0.5 rounded">*</code>，Methods 包含 <code className="font-mono bg-white px-1 py-0.5 rounded">GET, HEAD, POST, PUT</code> 即可。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700">各大外部云平台数据库接入（Supabase / MySQL / TDSQL / PolarDB）：</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  如果您使用的是腾讯云 TDSQL、阿里云 PolarDB 或 Supabase，只需在站内 <strong>系统设置</strong> -&gt; <strong>全能数据库后台与管理界面接入</strong> 中下拉选择对应的数据库或对象存储平台，填入访问 Endpoint 与安全口令，点击“测试并激活数据库接入”，实时指示灯即可立即检验握手状态！
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentGuideView;
