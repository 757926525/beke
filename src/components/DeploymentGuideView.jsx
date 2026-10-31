import React, { useState } from 'react';
import {
  Server, Cloud, ShieldCheck, Terminal, Cpu,
  Copy, Check, ArrowRight, HelpCircle, Layers, Globe, ExternalLink, HardDrive
} from 'lucide-react';

export const DeploymentGuideView = ({ t }) => {
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('cloudflare'); // 'cloudflare' | 'tencent' | 'alibaba' | 'docker' | 'pages-zip'

  const copyCode = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Server className="w-3.5 h-3.5" />
              <span>多云全链路部署指南 · 一键拉取与构建</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              项目介绍、部署指南与环境变量说明
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              涵盖 Cloudflare Pages、腾讯云 EdgeOne / COS、阿里云 ESA / OSS 与 Docker 等多云部署方案。
            </p>
          </div>
        </div>

        {/* Cloud Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-100">
          {[
            { id: 'cloudflare', name: 'Cloudflare Pages (首选推荐 · Git一键拉取)' },
            { id: 'tencent', name: '腾讯云 (EdgeOne Pages / COS 部署)' },
            { id: 'alibaba', name: '阿里云 (ESA Pages / OSS 部署)' },
            { id: 'pages-zip', name: 'Pages 压缩包一键上传部署 (打包方式)' },
            { id: 'docker', name: 'Docker / 私有 VPS 容器化' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cloudflare Pages Section */}
      {activeTab === 'cloudflare' && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Cloudflare Pages 一键拉取部署 (最高优先级推荐)</h2>
              <p className="text-xs text-slate-400">零服务器成本、全球 Anycast CDN 加速、绑定 GitHub 仓库自动 CI/CD 构建</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-bold text-slate-800 text-sm">部署步骤：</p>
              <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                <li>Fork 或推送本项目到您的 GitHub 仓库。</li>
                <li>登录 <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">Cloudflare 控制台</a>，进入 <strong>Workers & Pages &gt; Create application &gt; Pages &gt; Connect to Git</strong>。</li>
                <li>选中您的 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">WhiteFox-Blog</code> 仓库并点击 <strong>Begin setup</strong>。</li>
                <li>在构建设置中配置以下参数（已预置免配置直接使用）：</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 block mb-1">构建命令 (Build Command)</span>
                <code className="text-sm font-mono text-emerald-950 block bg-white/80 p-2 rounded-xl border border-emerald-200">
                  npm run build
                </code>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 block mb-1">构建输出目录 (Output Directory)</span>
                <code className="text-sm font-mono text-emerald-950 block bg-white/80 p-2 rounded-xl border border-emerald-200">
                  dist
                </code>
              </div>
            </div>

            {/* D1 Binding */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-bold text-slate-800">Cloudflare D1 边缘数据库绑定：</p>
              <p className="text-slate-500">
                在 Pages 项目设置的 <strong>Settings &gt; Functions &gt; D1 Database Bindings</strong> 中绑定变量名 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">DB</code>，实现跨地域零延时无感实时同步。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tencent Cloud Section */}
      {activeTab === 'tencent' && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">腾讯云 EdgeOne Pages / 对象存储 COS 静态托管</h2>
              <p className="text-xs text-slate-400">国内高速备案节点加速、EdgeOne Pages Git 一键拉取或 COS 静态网页挂载</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-bold text-slate-800 text-sm">方案 A：腾讯云 EdgeOne Pages 一键拉取部署 (推荐)</p>
              <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                <li>进入腾讯云 EdgeOne 控制台，选择 <strong>EdgeOne Pages 边缘开发平台</strong>。</li>
                <li>关联 GitHub / Gitee 仓库，选择白狐博客项目仓库。</li>
                <li>构建预设选择 <strong>Vite</strong>，构建命令输入：<code className="bg-slate-200 px-1 py-0.5 rounded font-mono">npm run build</code>，产物目录填写：<code className="bg-slate-200 px-1 py-0.5 rounded font-mono">dist</code>。</li>
                <li>保存并触发部署，即可获得全国 3200+ 边缘加速节点支持。</li>
              </ol>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-bold text-slate-800 text-sm">方案 B：腾讯云 COS 对象存储静态托管</p>
              <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                <li>在腾讯云 COS 控制台新建存储桶（读写权限设为 <strong>公有读私有写</strong>）。</li>
                <li>开启 <strong>基础配置 &gt; 静态网站托管</strong>，设置索引文档为 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">index.html</code>，错误文档设为 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">index.html</code>（支持 SPA 单页路由）。</li>
                <li>使用 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">coscmd</code> 或控制台将本地 build 生成的 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">dist/</code> 目录下所有文件上传至根目录。</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Alibaba Cloud Section */}
      {activeTab === 'alibaba' && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">阿里云 ESA Pages / 对象存储 OSS 托管</h2>
              <p className="text-xs text-slate-400">阿里云边缘安全加速 ESA Pages 一键拉取或 OSS 静态页面托管</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-bold text-slate-800 text-sm">方案 A：阿里云 ESA Pages 一键拉取部署</p>
              <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                <li>登录阿里云控制台，开通 <strong>ESA (Edge Security Acceleration) 边缘安全加速</strong> 或 <strong>函数计算 FC / Web 托管</strong>。</li>
                <li>新建 Pages 静态项目，授权 GitHub 仓库白狐博客代码库。</li>
                <li>设置环境为 Node.js 18+，构建脚本输入 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">npm install && npm run build</code>，导出目录设为 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">dist</code>。</li>
                <li>点击部署，全网边缘节点自动生效。</li>
              </ol>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-bold text-slate-800 text-sm">方案 B：阿里云 OSS 对象存储托管</p>
              <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                <li>创建 OSS Bucket，权限设置为 <strong>公共读</strong>。</li>
                <li>在 <strong>数据管理 &gt; 静态页面</strong> 启用静态页面，默认首页为 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">index.html</code>，404 页面填入 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">index.html</code>。</li>
                <li>通过 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">ossutil</code> 工具或 OSS 浏览器一键上传 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">dist/</code> 内容。</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Pages ZIP manual upload instructions */}
      {activeTab === 'pages-zip' && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Pages 一键上传文件部署 (获取上传包方法)</h2>
              <p className="text-xs text-slate-400">无需绑定 Git 仓库，直接将打包编译后的 zip 压缩包上传至各大 Pages 服务</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
              <p className="font-bold text-emerald-900 text-sm">获取上传包的完整命令与操作步骤：</p>
              <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-xs overflow-x-auto space-y-1">
                <div className="text-slate-400"># 1. 克隆仓库并安装依赖</div>
                <div>git clone https://github.com/your-username/whitefox-blog.git</div>
                <div>cd whitefox-blog && npm install</div>
                <div className="text-slate-400 mt-2"># 2. 运行构建命令生成 dist 目录</div>
                <div>npm run build</div>
                <div className="text-slate-400 mt-2"># 3. 将 dist 目录内容压缩打包为 zip 文件</div>
                <div>cd dist && zip -r ../whitefox-pages-deploy.zip ./* && cd ..</div>
              </div>
              <p className="text-emerald-800">
                生成的 <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold">whitefox-pages-deploy.zip</code> 即为可以直接在 Cloudflare Pages、腾讯云 EdgeOne、Vercel 等平台直接拖拽上传的一键部署包！
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-bold text-slate-800">平台上传入口指引：</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li><strong>Cloudflare Pages:</strong> 在 Pages 创建页面选择 <strong>Upload Assets</strong>，直接拖入整个 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">dist</code> 文件夹即可。</li>
                <li><strong>腾讯云 EdgeOne / 阿里云 ESA:</strong> 在控制台上传静态资源包时选择生成的 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">whitefox-pages-deploy.zip</code>。</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Docker Section */}
      {activeTab === 'docker' && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Docker 容器化与独立服务器部署</h2>
              <p className="text-xs text-slate-400">利用 Nginx 高性能反代镜像，一键构建独立 Docker 容器</p>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto space-y-2">
            <div className="text-slate-400"># Docker 一键构建并启动</div>
            <div>docker build -t whitefox-blog .</div>
            <div>docker run -d -p 8080:80 --name whitefox whitefox-blog</div>
          </div>
        </div>
      )}

      {/* Environmental Variables Reference */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-800">环境变量全清单 (Environment Variables)</h2>
        </div>
        <p className="text-xs text-slate-500">
          在 Cloudflare Pages 设置中的 <strong>Settings &gt; Environment variables</strong> 或 <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">.env</code> 文件中指定：
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">变量名称</th>
                <th className="py-2.5 px-3">默认值</th>
                <th className="py-2.5 px-3">说明</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="py-2 px-3 font-bold text-emerald-600">VITE_SITE_TITLE</td>
                <td className="py-2 px-3 text-slate-400">白狐博客 · 翡翠绿白</td>
                <td className="py-2 px-3 font-sans">网站显示名称</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-emerald-600">VITE_ADMIN_PASSWORD</td>
                <td className="py-2 px-3 text-slate-400">whitefox888</td>
                <td className="py-2 px-3 font-sans">管理员专属登录与中枢密码</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-emerald-600">VITE_CF_D1_DATABASE</td>
                <td className="py-2 px-3 text-slate-400">whitefox-d1-db</td>
                <td className="py-2 px-3 font-sans">Cloudflare D1 边缘数据库名称</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-emerald-600">VITE_ENABLE_REGISTRATION</td>
                <td className="py-2 px-3 text-slate-400">true</td>
                <td className="py-2 px-3 font-sans">是否开放前台新成员注册</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
