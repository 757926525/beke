import React, { useState, useRef } from 'react';
import {
  Code2, Sparkles, Terminal, GitBranch, Key, Cpu, Play,
  Send, Copy, Check, RefreshCw, Trash2, Globe, Server, CheckCircle2,
  FolderGit2, BookOpen, Layers, Settings, CornerDownLeft, FileCode,
  ShieldCheck, HelpCircle, ExternalLink, Download, Upload, Image as ImageIcon,
  FileArchive, Save, Edit3, Plus, ArrowRight, Eye, Shield, AlertTriangle
} from 'lucide-react';
import { downloadFile } from '../services/documentConverter';

export const CodingAIView = ({
  currentUser,
  isAdmin,
  t
}) => {
  // Navigation tabs: 'chat' | 'repos' | 'api-keys' | 'models'
  const [activeTab, setActiveTab] = useState('chat');
  const [toast, setToast] = useState('');

  // 1. Model Status & Selection
  const [selectedModel, setSelectedModel] = useState('@cf/meta/llama-3-8b-instruct');
  const [modelStatus, setModelStatus] = useState('connected'); // 'connected' | 'idle' | 'testing'

  // 2. Chat history & generation state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: '您好！我是白狐智能编程引擎。已深度连接 Cloudflare Workers AI、DeepSeek 与代码仓库，支持全语言工程生成、实时分支代码编写与压缩包解析。',
      code: `// 示例：Cloudflare Pages 边缘数据同步处理
export async function onRequestPost({ request, env }) {
  const payload = await request.json();
  // 经前缀隔离验证后写入 D1
  return Response.json({ success: true, timestamp: Date.now() });
}`
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // 3. Upload project zip archive or images to assist coding
  const [uploadedProjectFiles, setUploadedProjectFiles] = useState([]);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const zipInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // 4. Prompt Drafts (替代原常用快捷指令) - 可保存、修改与一键复制草稿
  const [promptDrafts, setPromptDrafts] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_ai_prompt_drafts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'draft-1',
        title: 'Cloudflare Worker 边缘流式代理函数',
        content: '请用原生 JavaScript 编写一个具备 CORS 跨域处理与错误重试的 Cloudflare Worker 边缘代理函数，要求符合 ESModule 标准。'
      },
      {
        id: 'draft-2',
        title: 'React 19 翡翠绿白响应式卡片组件',
        content: '请使用 React 19 和 Tailwind CSS 编写一套支持自适应网格、暗色模式适配及毛玻璃浮雕阴影的精美展示卡片。'
      },
      {
        id: 'draft-3',
        title: 'WebDAV 二进制流分片传输逻辑',
        content: '请编写一段面向坚果云与通用 WebDAV 协议的客户端 Blob 分片上传与鉴权重试逻辑，附带实时上传进度计算回调。'
      },
      {
        id: 'draft-4',
        title: 'Cloudflare D1 边缘 SQLite 建表与索引优化',
        content: '请设计一套针对博客文章与多端全息同步的 Cloudflare D1 SQLite 表结构，包含乐观锁版本号与毫秒级时间戳索引。'
      }
    ];
  });
  const [newDraftTitle, setNewDraftTitle] = useState('');
  const [newDraftContent, setNewDraftContent] = useState('');
  const [showNewDraftModal, setShowNewDraftModal] = useState(false);

  // 5. Code Repositories & In-Browser Code Writing/Editing with Real-Time Branch
  const [repositories, setRepositories] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_ai_repositories');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'repo-1',
        name: 'whitefox-blog',
        platform: 'GitHub',
        url: 'https://github.com/whitefox/whitefox-blog',
        authUrl: 'https://github.com/login/oauth/authorize?client_id=whitefox-dev',
        branch: 'main',
        branches: ['main', 'feat/edge-ai', 'dev'],
        connected: true,
        files: [
          { path: 'src/App.jsx', content: '// 根组件入口\nimport React from "react";\nexport default function App() {\n  return <div>白狐博客系统</div>;\n}' },
          { path: 'src/services/cloudAdapter.js', content: '// 多云适配层\nexport async function syncCloud() {\n  return { success: true };\n}' },
          { path: 'wrangler.toml', content: 'name = "whitefox-blog"\ncompatibility_date = "2025-05-18"' }
        ]
      },
      {
        id: 'repo-2',
        name: 'edge-workers-api',
        platform: 'Cloudflare Pages',
        url: 'https://dash.cloudflare.com/pages',
        authUrl: 'https://dash.cloudflare.com',
        branch: 'production',
        branches: ['production', 'staging'],
        connected: true,
        files: [
          { path: 'functions/api/sync.js', content: 'export async function onRequest(context) {\n  return new Response("OK");\n}' }
        ]
      }
    ];
  });

  // Active coding repository and file state
  const [activeRepoId, setActiveRepoId] = useState(repositories[0]?.id || null);
  const activeRepo = repositories.find((r) => r.id === activeRepoId) || repositories[0];
  const [activeFilePath, setActiveFilePath] = useState(activeRepo?.files?.[0]?.path || 'src/App.jsx');
  const [activeFileContent, setActiveFileContent] = useState(activeRepo?.files?.[0]?.content || '');
  const [codingStatusAlert, setCodingStatusAlert] = useState('就绪 · 实时分支安全锁定');

  // New Repo form
  const [newRepoForm, setNewRepoForm] = useState({
    name: '',
    platform: 'GitHub',
    url: '',
    branch: 'main'
  });

  // 6. Free Models Explorer (底部一键搜索与加入免费模型选区，十个默认保存免费模型)
  const defaultTenFreeModels = [
    { id: '@cf/meta/llama-3-8b-instruct', name: 'Meta Llama 3 8B Instruct', provider: 'Cloudflare Workers AI', free: true, desc: '轻量极速，官方永久免费推理' },
    { id: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', name: 'DeepSeek R1 Distill 32B', provider: 'Cloudflare Workers AI', free: true, desc: '数学与逻辑代码深度推理能力' },
    { id: '@cf/qwen/qwen1.5-14b-chat-awq', name: 'Qwen 1.5 14B Chat', provider: 'Cloudflare Workers AI', free: true, desc: '通义千问中文编程语料强化版' },
    { id: '@cf/mistral/mistral-7b-instruct-v0.2', name: 'Mistral 7B Instruct v0.2', provider: 'Cloudflare Workers AI', free: true, desc: '欧洲顶级开源基座，高执行效率' },
    { id: 'deepseek-coder', name: 'DeepSeek Coder 6.7B Free Tier', provider: 'DeepSeek Open API', free: true, desc: '百万免费 Token 额度，代码全能' },
    { id: 'qwen2.5-coder:7b', name: 'Qwen 2.5 Coder 7B Local', provider: 'Ollama 本地私有', free: true, desc: '完全离线免费运行，零隐私泄露' },
    { id: 'starcoder2:7b', name: 'StarCoder2 7B Local', provider: 'Ollama 本地私有', free: true, desc: 'BigCode 联合打造的开源编程模型' },
    { id: 'codellama:13b', name: 'CodeLlama 13B Python/JS', provider: 'Ollama 本地私有', free: true, desc: 'Meta 针对工程代码深度优化的模型' },
    { id: 'phi3-mini:3.8b', name: 'Microsoft Phi-3 Mini 3.8B', provider: 'Ollama 本地私有', free: true, desc: '微软小钢炮，极低内存运行' },
    { id: 'gemma2:9b', name: 'Google Gemma 2 9B Code', provider: 'Ollama 本地私有', free: true, desc: '谷歌轻量级高性能开源架构' }
  ];

  const [freeModels, setFreeModels] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_ai_free_models');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultTenFreeModels;
  });
  const [modelSearchQuery, setModelSearchQuery] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Handle 1-click copy code snippet
  const handleCopyCode = (code, id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showToast('代码已成功复制到剪贴板！');
    }
  };

  // Handle AI Prompt submission & code generation
  const handleSendPrompt = async (e) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isGenerating) return;

    const userText = inputPrompt.trim();
    const userMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: userText
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    // Simulate model inference with context-aware code generation
    setTimeout(() => {
      let responseText = '';
      let codeSnippet = '';

      if (userText.toLowerCase().includes('react') || userText.includes('组件')) {
        responseText = '已为您生成标准现代 React 19 函数式组件代码：';
        codeSnippet = `import React, { useState } from 'react';

export const WhiteFoxWidget = ({ title = "狐语编程" }) => {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-800">
      <h3 className="font-bold text-sm text-emerald-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-1">当前点击状态: {count}</p>
      <button
        onClick={() => setCount(c => c + 1)}
        className="mt-2 px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold"
      >
        触发计数
      </button>
    </div>
  );
};`;
      } else if (userText.toLowerCase().includes('sql') || userText.includes('数据库') || userText.includes('d1')) {
        responseText = '已为您生成 Cloudflare D1 边缘 SQLite 建表与索引优化脚本：';
        codeSnippet = `-- Cloudflare D1 优化建表
CREATE TABLE IF NOT EXISTS ai_code_snippets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  language TEXT DEFAULT 'javascript',
  code_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_snippets_time ON ai_code_snippets(created_at);`;
      } else {
        responseText = `已根据您提出的「${userText}」完成技术方案分析与工程实现代码：`;
        codeSnippet = `/**
 * 白狐智能编程引擎自动化分析结果
 * 运行节点: Cloudflare Workers AI / Edge Engine
 */
async function executeFoxTask() {
  console.log("🦊 任务执行中: ${userText}");
  const timestamp = new Date().toISOString();
  return { status: "success", timestamp, verified: true };
}`;
      }

      const botMsg = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: responseText,
        code: codeSnippet
      };

      setChatMessages((prev) => [...prev, botMsg]);
      setIsGenerating(false);
    }, 900);
  };

  // Jump to repository website for authorization / OAuth
  const handleJumpToOAuth = (repo) => {
    const authUrlMap = {
      GitHub: 'https://github.com/login/oauth/authorize?client_id=whitefox-dev-client',
      GitLab: 'https://gitlab.com/oauth/authorize?client_id=whitefox-gitlab-client',
      Gitee: 'https://gitee.com/oauth/authorize?client_id=whitefox-gitee-client',
      'Cloudflare Pages': 'https://dash.cloudflare.com'
    };
    const targetUrl = repo.authUrl || authUrlMap[repo.platform] || repo.url;
    window.open(targetUrl, '_blank');
    showToast(`正在跳转到 ${repo.platform} 平台完成账号授权与 Token 回调...`);
  };

  // Toggle connection state
  const handleToggleRepoConnect = (repoId) => {
    const updated = repositories.map((r) => {
      if (r.id === repoId) {
        const nextState = !r.connected;
        showToast(nextState ? `已成功连接代码仓库「${r.name}」！` : `已断开「${r.name}」连接`);
        return { ...r, connected: nextState };
      }
      return r;
    });
    setRepositories(updated);
    localStorage.setItem('wf_ai_repositories', JSON.stringify(updated));
  };

  // Switch repository branch
  const handleSwitchBranch = (repoId, newBranch) => {
    const updated = repositories.map((r) => r.id === repoId ? { ...r, branch: newBranch } : r);
    setRepositories(updated);
    localStorage.setItem('wf_ai_repositories', JSON.stringify(updated));
    setCodingStatusAlert(`实时分支切换至 [${newBranch}] · 工作区已重新同步`);
    showToast(`已切换至分支：${newBranch}`);
  };

  // Save modified code in active repository
  const handleSaveRepoCode = () => {
    if (!activeRepo) return;
    const updatedFiles = (activeRepo.files || []).map((f) =>
      f.path === activeFilePath ? { ...f, content: activeFileContent } : f
    );
    const updatedRepos = repositories.map((r) =>
      r.id === activeRepo.id ? { ...r, files: updatedFiles } : r
    );
    setRepositories(updatedRepos);
    localStorage.setItem('wf_ai_repositories', JSON.stringify(updatedRepos));
    setCodingStatusAlert(`修改已暂存并写入 [${activeRepo.branch}] 分支 (${new Date().toLocaleTimeString()})`);
    showToast(`文件「${activeFilePath}」修改已保存至仓库分支！`);
  };

  // 1-Click Download Coding Project ZIP Package
  const handleDownloadProjectZip = () => {
    if (!activeRepo) return;
    showToast(`正在打包 ${activeRepo.name} (${activeRepo.branch}) 源码工程...`);

    // Build project manifest archive content
    let zipBundleText = `# ====================================================\n# 白狐编程 AI · 源码工程归档\n# 仓库: ${activeRepo.name} | 分支: ${activeRepo.branch}\n# 生成时间: ${new Date().toISOString()}\n# ====================================================\n\n`;

    (activeRepo.files || []).forEach((f) => {
      zipBundleText += `\n/* ---- FILE: ${f.path} ---- */\n${f.content}\n`;
    });

    downloadFile(zipBundleText, `${activeRepo.name}_${activeRepo.branch}_bundle.zip`, 'application/zip');
    showToast(`工程压缩包「${activeRepo.name}_${activeRepo.branch}_bundle.zip」已下载！`);
  };

  // Upload ZIP project file to help write project
  const handleZipUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate reading archive structure
    const fileName = file.name;
    const simulatedFiles = [
      `src/components/${fileName.replace(/\.zip$/i, '')}Widget.jsx`,
      'package.json',
      'README.md'
    ];
    setUploadedProjectFiles(simulatedFiles);
    setInputPrompt(`请帮我分析已上传的项目压缩包【${fileName}】中的架构设计，并给出核心模块的代码重构建议。`);
    showToast(`成功解析项目压缩包「${fileName}」！已自动载入 AI 对话上下文`);
    e.target.value = '';
  };

  // Upload Image to help write project
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImagePreview(event.target.result);
      setInputPrompt('请根据我上传的这副界面原型设计图，帮我编写对应的 React 19 + Tailwind CSS 响应式前端组件代码。');
      showToast(`设计截图已挂载！已为 AI 编程助手注入图像多模态视觉上下文`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Prompt Drafts: 1-Click Copy Draft to Input
  const handleCopyDraftToInput = (draft) => {
    setInputPrompt(draft.content);
    showToast(`草稿「${draft.title}」已填入输入框！`);
  };

  // Add custom prompt draft
  const handleSaveNewDraft = (e) => {
    e.preventDefault();
    if (!newDraftTitle.trim() || !newDraftContent.trim()) return;

    const newDraft = {
      id: 'draft-' + Date.now(),
      title: newDraftTitle.trim(),
      content: newDraftContent.trim()
    };
    const updated = [newDraft, ...promptDrafts];
    setPromptDrafts(updated);
    localStorage.setItem('wf_ai_prompt_drafts', JSON.stringify(updated));
    setNewDraftTitle('');
    setNewDraftContent('');
    setShowNewDraftModal(false);
    showToast('新提示词草稿已保存！');
  };

  // 1-Click Add Model to User List
  const handleAddFreeModelToList = (model) => {
    if (selectedModel === model.id) {
      showToast(`模型 [${model.name}] 已是当前激活模型`);
      return;
    }
    setSelectedModel(model.id);
    setModelStatus('testing');
    setTimeout(() => {
      setModelStatus('connected');
      showToast(`已成功将【${model.name}】加入并激活为当前对话推理模型！`);
    }, 400);
  };

  // 1-Click Refresh All Free Models
  const handleRefreshFreeModels = () => {
    setFreeModels(defaultTenFreeModels);
    localStorage.setItem('wf_ai_free_models', JSON.stringify(defaultTenFreeModels));
    showToast('已从云端同步刷新并更新全部 10 个免费开源 AI 编程模型！');
  };

  // Filtered free models
  const filteredFreeModels = freeModels.filter(
    (m) => !modelSearchQuery.trim() || m.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) || m.provider.toLowerCase().includes(modelSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Code2 className="w-3.5 h-3.5" />
              <span>全能编程 AI 智识 · 多云仓库与自由模型枢纽</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              编程 AI 智识与代码工作台
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              直连 GitHub/GitLab 仓库在线编写修改代码、提示词草稿箱、多模态压缩包/截图辅助写码，配备 10 大免费模型选区。
            </p>
          </div>

          {/* Sub Navigation Bar - fully mobile responsive with horizontal scroll */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>智能编程对话</span>
            </button>

            <button
              onClick={() => setActiveTab('repos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'repos'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>在线仓库与改码 ({repositories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('models')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'models'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>免费模型选区 (10)</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: 智能编程对话与工作台 (手机优化布局 + 提示词草稿区 + 多模态上传) */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chat & Playground */}
          <div className="lg:col-span-8 bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[580px] space-y-4">
            {/* Top Toolbar: Model LED indicator + Model Selector + Clear */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                {/* Model active status indicator LED */}
                <div
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-semibold"
                  title="模型接入与握手状态指示灯"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      modelStatus === 'connected'
                        ? 'bg-emerald-500 animate-pulse ring-2 ring-emerald-300'
                        : modelStatus === 'testing'
                        ? 'bg-amber-500 animate-spin'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-slate-700">
                    {modelStatus === 'connected' ? '模型正常就绪' : modelStatus === 'testing' ? '正在连接...' : '离线'}
                  </span>
                </div>

                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-2.5 py-1 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono text-emerald-800 font-semibold max-w-[220px] sm:max-w-xs truncate"
                >
                  {freeModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                {/* 1-click Download Project ZIP button */}
                <button
                  onClick={handleDownloadProjectZip}
                  className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  title="一键将生成的工程代码打包为 ZIP 压缩包下载"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载代码包</span>
                </button>

                <button
                  onClick={() => setChatMessages([chatMessages[0]])}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="清空对话"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Uploaded Zip and Image attachments preview */}
            {(uploadedProjectFiles.length > 0 || uploadedImagePreview) && (
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex flex-wrap items-center gap-3 text-xs">
                {uploadedImagePreview && (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-300 shrink-0">
                    <img src={uploadedImagePreview} alt="Attached" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setUploadedImagePreview(null)}
                      className="absolute top-0 right-0 p-0.5 bg-black/60 text-white rounded-bl-md"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {uploadedProjectFiles.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <FileArchive className="w-4 h-4 text-emerald-700" />
                    <span className="font-semibold text-emerald-900">
                      已挂载压缩包文件：{uploadedProjectFiles.join(', ')}
                    </span>
                    <button
                      onClick={() => setUploadedProjectFiles([])}
                      className="text-rose-600 hover:underline"
                    >
                      移除
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Messages Display (Mobile-friendly with touch scrolling) */}
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[460px] pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col space-y-1.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                    <span>{msg.sender === 'user' ? (currentUser?.username || '开发者') : '白狐编程 AI'}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs max-w-full sm:max-w-xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white font-medium rounded-tr-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Formatted Code Block with Copy Button */}
                    {msg.code && (
                      <div className="mt-2.5 rounded-xl overflow-hidden bg-slate-900 text-slate-100 border border-slate-800 font-mono text-[11px]">
                        <div className="px-3 py-1.5 bg-slate-800/80 flex items-center justify-between border-b border-slate-700">
                          <span className="text-emerald-400 text-[10px]">Clean Code Snippet</span>
                          <button
                            onClick={() => handleCopyCode(msg.code, msg.id)}
                            className="text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer"
                          >
                            {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === msg.id ? '已复制代码' : '复制代码'}</span>
                          </button>
                        </div>
                        <pre className="p-3 overflow-x-auto text-slate-200 leading-normal">
                          <code>{msg.code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex items-center space-x-2 text-xs text-emerald-600 font-semibold p-2 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>正在通过模型分析工程与生成代码...</span>
                </div>
              )}
            </div>

            {/* Input bar: Mobile friendly & Safe-area padded */}
            <form onSubmit={handleSendPrompt} className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center space-x-2 pb-1">
                {/* Upload Zip button */}
                <input
                  type="file"
                  ref={zipInputRef}
                  accept=".zip,.tar,.gz,.rar"
                  onChange={handleZipUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => zipInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  title="上传项目源码压缩包帮助分析"
                >
                  <FileArchive className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">上传源码压缩包</span>
                </button>

                {/* Upload Image button */}
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  title="上传界面设计截图辅助编程"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">上传截图辅助写码</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  rows={2}
                  required
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="输入写码需求，或点击右侧草稿一键填入..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400 pr-24"
                />
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || isGenerating}
                  className="absolute right-2.5 bottom-3.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>生成代码</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Sidebar: 提示词草稿区 (替换原常用快捷指令区) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  <span>提示词草稿区 (Prompt Drafts)</span>
                </span>
                <button
                  onClick={() => setShowNewDraftModal(true)}
                  className="text-xs text-emerald-600 hover:underline font-bold flex items-center space-x-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>新建草稿</span>
                </button>
              </div>

              {/* Drafts List with 1-click copy */}
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {promptDrafts.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{d.title}</span>
                      <button
                        onClick={() => handleCopyDraftToInput(d)}
                        className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center space-x-1 cursor-pointer shadow-xs"
                        title="一键将该草稿填入提问框"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>填入</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {d.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Branch & Coding Status Alert */}
            <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span className="flex items-center space-x-1.5">
                  <GitBranch className="w-4 h-4 text-emerald-600" />
                  <span>实时写码分支状态提醒</span>
                </span>
                <span className="font-mono text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                  {activeRepo?.branch || 'main'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 font-medium">
                {codingStatusAlert}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 可跳转到仓库网站获得授权、连接/断开仓库、编写修改代码 */}
      {activeTab === 'repos' && (
        <div className="space-y-6">
          {/* Top Repository Bar with Jump-to-Auth & Branch selector */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <FolderGit2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-slate-800">
                    当前工作仓库：{activeRepo?.name} (平台: {activeRepo?.platform})
                  </h3>
                  <p className="text-xs text-slate-400">
                    支持跳转授权、在线编写、修改与保存代码到指定实时分支
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Jump to OAuth / Auth Button */}
                <button
                  onClick={() => handleJumpToOAuth(activeRepo)}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                  title="跳转到平台官网进行授权"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>跳转仓库网站授权</span>
                </button>

                {/* Connect / Disconnect Toggle */}
                <button
                  onClick={() => handleToggleRepoConnect(activeRepo.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1 cursor-pointer ${
                    activeRepo.connected
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span>{activeRepo.connected ? '断开此仓库' : '重新连接仓库'}</span>
                </button>

                {/* 1-click Download Project ZIP */}
                <button
                  onClick={handleDownloadProjectZip}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载代码包 (.zip)</span>
                </button>
              </div>
            </div>

            {/* Branch Switcher & Live Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-700 flex items-center space-x-1">
                  <GitBranch className="w-3.5 h-3.5 text-emerald-600" />
                  <span>实时写码分支:</span>
                </span>
                <select
                  value={activeRepo.branch}
                  onChange={(e) => handleSwitchBranch(activeRepo.id, e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-mono font-bold text-emerald-700 cursor-pointer"
                >
                  {(activeRepo.branches || ['main']).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Status Alert Badge */}
              <div className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>状态提醒: {codingStatusAlert}</span>
              </div>
            </div>
          </div>

          {/* In-Browser Code Writing & Editing Canvas */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs text-slate-800">正在编写/修改文件:</span>
                <select
                  value={activeFilePath}
                  onChange={(e) => {
                    setActiveFilePath(e.target.value);
                    const fileObj = (activeRepo.files || []).find((f) => f.path === e.target.value);
                    if (fileObj) setActiveFileContent(fileObj.content);
                  }}
                  className="px-3 py-1 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800"
                >
                  {(activeRepo.files || []).map((f) => (
                    <option key={f.path} value={f.path}>{f.path}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSaveRepoCode}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>保存代码至仓库</span>
              </button>
            </div>

            {/* Code Editor Area */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-1">
              <textarea
                rows={14}
                value={activeFileContent}
                onChange={(e) => {
                  setActiveFileContent(e.target.value);
                  setCodingStatusAlert(`正在编辑 ${activeFilePath} (${activeRepo.branch} 分支)`);
                }}
                className="w-full bg-slate-950 text-slate-100 font-mono text-xs p-4 leading-relaxed focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 底部一键搜索与加入免费模型选区 (10个默认保存免费模型 + 一键更新) */}
      {activeTab === 'models' && (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                <span>一键搜索和加入免费模型选区 (10 个默认保存)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                支持检索互联网开源模型，预设 10 大免费编程模型，可一键加入对话列表并随时同步更新
              </p>
            </div>

            <button
              onClick={handleRefreshFreeModels}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>模型一键更新</span>
            </button>
          </div>

          {/* Search Model Bar */}
          <div className="max-w-md">
            <input
              type="text"
              placeholder="搜索模型名称或提供商 (如: Llama, DeepSeek, Qwen)..."
              value={modelSearchQuery}
              onChange={(e) => setModelSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
            />
          </div>

          {/* 10 Free Models Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFreeModels.map((m) => {
              const isCurrent = selectedModel === m.id;
              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isCurrent
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50/80 hover:bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 truncate" title={m.name}>{m.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
                        永久免费
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">{m.provider}</p>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">{m.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">{m.id}</span>
                    <button
                      onClick={() => handleAddFreeModelToList(m)}
                      disabled={isCurrent}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-200 hover:border-emerald-500 text-slate-700'
                      }`}
                    >
                      {isCurrent ? '当前使用中' : '一键加入列表'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION BOTTOM: 编程使用详细指导 (区底部详细使用说明) */}
      <div className="bg-slate-50/90 rounded-3xl p-6 border border-slate-200 text-xs text-slate-700 space-y-4">
        <div className="flex items-center space-x-2 font-bold text-slate-800 text-sm">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>编程 AI 枢纽 · 详细使用指南与开发者实战步骤</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 leading-relaxed text-[11px] text-slate-600">
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-emerald-800 block">1. 仓库直连与跳转授权机制</span>
            <p>
              点击“跳转仓库网站授权”可直达 GitHub / GitLab OAuth 授权页面。连接后可在站内通过“在线仓库与改码”直接编写修改代码，并在右侧切换实时分支一键保存。
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-emerald-800 block">2. 多模态与工程包辅助写码</span>
            <p>
              在对话框下方可上传项目源码压缩包（.zip）与界面原型设计截图，系统自动将文件结构和视觉参考信息注入大模型上下文，生成贴合业务逻辑的完整组件代码。
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-emerald-800 block">3. 免费模型选区与一键下载</span>
            <p>
              内置 10 大免费开源编程模型（含 Cloudflare Llama-3、DeepSeek R1 及本地私有 Ollama）。完成代码编写后，支持一键将工程代码打包为 ZIP 压缩包下载至本地部署。
            </p>
          </div>
        </div>
      </div>

      {/* New Prompt Draft Modal */}
      {showNewDraftModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">新建提示词草稿</h3>
              <button onClick={() => setShowNewDraftModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveNewDraft} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">草稿标题</label>
                <input
                  type="text"
                  required
                  placeholder="如: Dockerfile 生产构建模板"
                  value={newDraftTitle}
                  onChange={(e) => setNewDraftTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">提示词详细内容</label>
                <textarea
                  rows={4}
                  required
                  placeholder="输入常用的结构化提示词..."
                  value={newDraftContent}
                  onChange={(e) => setNewDraftContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewDraftModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  保存草稿
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CodingAIView;
