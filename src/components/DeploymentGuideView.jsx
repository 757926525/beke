import React, { useState } from 'react';
import {
  Rocket, Cloud, Server, Database, Terminal, FileCode,
  CheckCircle2, Copy, ExternalLink, Download, Layers, ShieldCheck,
  HardDrive, Key
} from 'lucide-react';

export const DeploymentGuideView = ({ siteName = 'fox', t }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (text, index) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Rocket className="w-3.5 h-3.5" />
              <span>多云原生 · 零成本高性能部署手册</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight capitalize">
              {siteName} 博客多平台部署与后台连接指南
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              优先推荐 <strong>Cloudflare Pages 一键拉取与构建</strong>，同时全面支持 <strong>Pages 一键拖拽上传部署</strong>、<strong>腾讯云 EdgeOne / COS</strong>、<strong>阿里云 ESA / OSS</strong>、Docker 容器以及后台数据库与对象存储直连。
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-mono font-semibold border border-emerald-200">
              Vite 6 + React 19 + Tailwind 4
            </span>
          </div>
        </div>
      </div>

      {/* Cloudflare Pages 一键拉取部署优先推荐 */}
      <section className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-bold text-emerald-300">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight">Cloudflare Pages 一键拉取部署 (最高优先级推荐)</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-extrabold text-[10px]">
                  官方推荐
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                全球 Anycast 边缘网络，无限免费带宽，内置自动化 Git CI/CD 持续交付流水线。
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-2">
            <span className="font-bold text-emerald-300 block">步骤 1: 关联 GitHub 仓库</span>
            <p className="text-emerald-100 text-[11px] leading-relaxed">
              登录 Cloudflare Dashboard，进入 <strong>Workers & Pages</strong> -&gt; <strong>Create application</strong> -&gt; 选择 <strong>Pages</strong> -&gt; 点击 <strong>Connect to Git</strong>。
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-2">
            <span className="font-bold text-emerald-300 block">步骤 2: 填写构建预设</span>
            <p className="text-emerald-100 text-[11px] leading-relaxed">
              框架预设选择 <strong>Vite</strong><br />
              构建命令: <code className="bg-emerald-950/80 px-1 py-0.5 rounded font-mono">npm run build</code><br />
              输出目录: <code className="bg-emerald-950/80 px-1 py-0.5 rounded font-mono">dist</code>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-2">
            <span className="font-bold text-emerald-300 block">步骤 3: 立即上线</span>
            <p className="text-emerald-100 text-[11px] leading-relaxed">
              点击 <strong>Save and Deploy</strong>，等待 40 秒即可生成专属的 <code>.pages.dev</code> 域名并支持自定义专属顶级域名。
            </p>
          </div>
        </div>
      </section>

      {/* Pages 一键上传文件部署 (获取上传包说明) */}
      <section className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Pages 一键上传文件部署与获取上传包方式</h2>
            <p className="text-xs text-slate-400">无需绑定代码仓库，直接将打包文件拖拽上传即可完成边缘部署</p>
          </div>
        </div>

        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-slate-700 space-y-3">
          <p className="font-bold text-amber-900">📦 如何获取 Pages 上传包：</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-amber-200">
              <span className="font-bold text-emerald-700 block mb-1">方式 1：使用仓库内现成包 (无需本地编译)</span>
              <p className="text-[11px] text-slate-600">
                本仓库根目录下已内置预编译好的 <code>whitefox-pages-deploy.zip</code> 产物包（大小约 120KB），可直接用于上传。
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-amber-200">
              <span className="font-bold text-emerald-700 block mb-1">方式 2：自行执行一键打包命令</span>
              <p className="text-[11px] text-slate-600 mb-1">在项目根目录下运行专属打包指令：</p>
              <code className="block bg-slate-900 text-emerald-400 p-2 rounded-lg font-mono text-[11px]">
                npm run package:pages
              </code>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-600 space-y-1">
            <p><strong>部署上传步骤：</strong></p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>在 Cloudflare Pages 或腾讯云 EdgeOne Pages 控制台选择 <strong>Direct Upload (直接上传资产)</strong></li>
              <li>将 <code>whitefox-pages-deploy.zip</code> 内的文件或解压后的 <code>dist</code> 文件夹直接拖拽入上传框</li>
              <li>点击 <strong>Deploy site</strong>，秒级全球同步生效！</li>
            </ol>
          </div>
        </div>
      </section>

      {/* 腾讯云 & 阿里云 平台部署 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 腾讯云 EdgeOne & COS */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">腾讯云 EdgeOne / COS 部署</h2>
              <p className="text-xs text-slate-400">国内首选极速访问体验与安全防护</p>
            </div>
          </div>
          <div className="text-xs text-slate-600 space-y-2 pt-2">
            <p><strong>1. EdgeOne Pages 部署：</strong></p>
            <p className="text-[11px] text-slate-500">
              控制台进入「Pages 边缘页面托管」，新建项目并连接 Git。构建命令填 <code>npm run build</code>，发布目录填 <code>dist</code>。
            </p>
            <p><strong>2. COS 对象存储静态托管：</strong></p>
            <p className="text-[11px] text-slate-500">
              创建存储桶并开启「静态网站」，索引与错误文档均填写 <code>index.html</code>，将 <code>dist/</code> 目录下所有静态资源上传到根目录。
            </p>
          </div>
        </section>

        {/* 阿里云 ESA & OSS */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">阿里云 ESA / OSS 部署</h2>
              <p className="text-xs text-slate-400">高可用分布式对象存储与 Anycast 边缘路由</p>
            </div>
          </div>
          <div className="text-xs text-slate-600 space-y-2 pt-2">
            <p><strong>1. 阿里云 ESA Pages 托管：</strong></p>
            <p className="text-[11px] text-slate-500">
              进入阿里云 ESA 边缘安全加速控制台，在 Pages 管理中导入 Git 仓库，设置输出路径为 <code>dist</code>。
            </p>
            <p><strong>2. OSS 静态网页托管：</strong></p>
            <p className="text-[11px] text-slate-500">
              在 OSS Bucket 基础设置中开启「静态页面」，使用 <code>ossutil</code> 命令行工具一键同步本地 <code>dist/</code> 文件。
            </p>
          </div>
        </section>
      </div>

      {/* 后台数据库与对象存储配置 */}
      <section className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">数据库与对象存储后台连接与配置流程</h2>
            <p className="text-xs text-slate-400">在站内「系统设置」中即可一键配置与测试连通性</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block">1. 边缘数据库 (Cloudflare D1) 初始化</span>
            <p className="text-[11px] leading-relaxed">
              在 Cloudflare 命令行执行建表初始化：
            </p>
            <code className="block bg-slate-900 text-emerald-400 p-2 rounded-xl font-mono text-[10px]">
              npx wrangler d1 execute whitefox-db --file=./deploy/cloudflare-d1-schema.sql
            </code>
            <p className="text-[11px]">
              支持与 MySQL 8.0+ 和 Supabase 数据库直连。
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block">2. 多云对象存储鉴权 (R2 / COS / OSS)</span>
            <p className="text-[11px] leading-relaxed">
              在系统设置面板中填入 Bucket 存储桶名与 API 凭据，系统自动建立 S3/REST 直传通道，支持大文件切片上传与防盗链直链分发。
            </p>
          </div>
        </div>
      </section>

      {/* 环境变量列表 */}
      <section className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-emerald-600" />
          <span>核心环境变量参数对照表</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">环境变量名</th>
                <th className="py-2.5 px-3">默认/推荐值</th>
                <th className="py-2.5 px-3">说明</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              <tr>
                <td className="py-2.5 px-3 text-emerald-700 font-bold">VITE_SITE_NAME</td>
                <td className="py-2.5 px-3">fox</td>
                <td className="py-2.5 px-3 font-sans text-slate-500">网站系统默认名称，可在设置区自由修改</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-emerald-700 font-bold">VITE_ADMIN_PASSWORD</td>
                <td className="py-2.5 px-3">password123</td>
                <td className="py-2.5 px-3 font-sans text-slate-500">站长管理员后台默认密码</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-emerald-700 font-bold">VITE_CF_ACCOUNT_ID</td>
                <td className="py-2.5 px-3">cf_account_demo_888</td>
                <td className="py-2.5 px-3 font-sans text-slate-500">Cloudflare Account ID</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-emerald-700 font-bold">VITE_R2_BUCKET_NAME</td>
                <td className="py-2.5 px-3">whitefox-assets</td>
                <td className="py-2.5 px-3 font-sans text-slate-500">Cloudflare R2 存储桶名</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-emerald-700 font-bold">VITE_TENCENT_COS_BUCKET</td>
                <td className="py-2.5 px-3">whitefox-1250000000</td>
                <td className="py-2.5 px-3 font-sans text-slate-500">腾讯云 COS 存储桶名称</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-emerald-700 font-bold">VITE_ALIYUN_OSS_BUCKET</td>
                <td className="py-2.5 px-3">whitefox-oss-bucket</td>
                <td className="py-2.5 px-3 font-sans text-slate-500">阿里云 OSS 存储桶名称</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
