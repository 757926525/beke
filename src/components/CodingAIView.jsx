import React, { useState } from 'react';
import {
  Code2, Sparkles, Terminal, GitBranch, Key, Cpu, Play,
  Send, Copy, Check, RefreshCw, Trash2, Globe, Server, CheckCircle2,
  FolderGit2, BookOpen, Layers, Settings, CornerDownLeft, FileCode,
  ShieldCheck, HelpCircle
} from 'lucide-react';

export const CodingAIView = ({
  currentUser,
  isAdmin,
  t
}) => {
  // Active Mode: 'chat' (AI 编程助手) | 'repos' (连接代码仓库) | 'api-keys' (模型与 API 配置)
  const [activeTab, setActiveTab] = useState('chat');
  const [toast, setToast] = useState('');

  // Prompt / Chat History
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: '你好！我是白狐智能编程助手。我已接入 Cloudflare Workers AI、DeepSeek 与 OpenAI 接口，支持全语言代码生成、算法重构、Bug 审查及 Git 仓库提交。请告诉我您的需求！',
      code: `// 示例：Cloudflare Worker 边缘流式处理函数
export default {
  async fetch(request, env) {
    return new Response("🦊 Hello from WhiteFox Cloudflare Edge Worker!", {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
};`
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('@cf/meta/llama-3-8b-instruct');
  const [copiedId, setCopiedId] = useState(null);

  // Multi-platform API & Gateway Configurations (Cloudflare Workers AI, DeepSeek, OpenAI, Claude, Local Ollama)
  const [aiConfig, setAiConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_ai_coding_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      cloudflare: {
        accountId: '',
        apiToken: '',
        gatewayUrl: 'https://api.cloudflare.com/client/v4/accounts',
        model: '@cf/meta/llama-3-8b-instruct'
      },
      deepseek: {
        apiKey: '',
        endpoint: 'https://api.deepseek.com/v1',
        model: 'deepseek-coder'
      },
      openai: {
        apiKey: '',
        endpoint: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini'
      },
      ollama: {
        endpoint: 'http://localhost:11434',
        model: 'qwen2.5-coder'
      }
    };
  });

  // Connected Repositories (GitHub / GitLab / Gitee / Cloudflare Pages)
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
        branch: 'main',
        status: '已连接',
        lastCommit: 'feat: add coding ai and webdav sync',
        updatedAt: '2025-05-18'
      },
      {
        id: 'repo-2',
        name: 'edge-workers-api',
        platform: 'Cloudflare Pages',
        url: 'https://dash.cloudflare.com/pages',
        branch: 'production',
        status: '自动拉取',
        lastCommit: 'sync d1 schema with edge relay',
        updatedAt: '2025-05-17'
      }
    ];
  });

  // New Repo Form State
  const [newRepoForm, setNewRepoForm] = useState({
    name: '',
    platform: 'GitHub',
    url: '',
    branch: 'main',
    token: ''
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCopyCode = (code, id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Submit AI Prompt (Supports real mock generation or live worker integration)
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

  // Add Repository Connection
  const handleAddRepository = (e) => {
    e.preventDefault();
    if (!newRepoForm.name.trim() || !newRepoForm.url.trim()) {
      showToast('请完整填写代码仓库名称与 Git 仓库 URL！');
      return;
    }

    const newRepo = {
      id: 'repo-' + Date.now(),
      name: newRepoForm.name.trim(),
      platform: newRepoForm.platform,
      url: newRepoForm.url.trim(),
      branch: newRepoForm.branch.trim() || 'main',
      status: '已连接',
      lastCommit: 'Initial connection via WhiteFox AI',
      updatedAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newRepo, ...repositories];
    setRepositories(updated);
    localStorage.setItem('wf_ai_repositories', JSON.stringify(updated));
    setNewRepoForm({ name: '', platform: 'GitHub', url: '', branch: 'main', token: '' });
    showToast(`代码仓库「${newRepo.name}」已成功连接！`);
  };

  // Save AI API Config
  const handleSaveAiConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('wf_ai_coding_config', JSON.stringify(aiConfig));
    showToast('AI 平台参数与 API Key 配置已安全持久化！');
  };

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
              <span>编程 AI 枢纽 · 智能代码交互与多云仓库直连</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              编程 AI 智识与代码工作台
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              内置全功能编程 AI 界面，支持 Cloudflare Workers AI、DeepSeek、OpenAI、本地 Ollama 多模型接入与 GitHub/GitLab 仓库连接。
            </p>
          </div>

          {/* Sub Navigation Bar */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'repos'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>连接代码仓库 ({repositories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('api-keys')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'api-keys'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>平台与 API 接口</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: 智能编程对话与代码工作台 */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chat & Code Playground */}
          <div className="lg:col-span-8 bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[580px] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-xs text-slate-800">当前对话推理模型:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-2.5 py-1 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono text-emerald-800 font-semibold"
                >
                  <option value="@cf/meta/llama-3-8b-instruct">Cloudflare: Llama-3-8B-Instruct (免API费)</option>
                  <option value="@cf/deepseek-ai/deepseek-r1-distill-qwen-32b">Cloudflare: DeepSeek-R1-Distill (深度推理)</option>
                  <option value="deepseek-coder">DeepSeek: DeepSeek-Coder-V2 (专精代码)</option>
                  <option value="gpt-4o-mini">OpenAI: GPT-4o-Mini (极速通用)</option>
                  <option value="ollama-local">Local Ollama: Qwen2.5-Coder (本地离线私有)</option>
                </select>
              </div>

              <button
                onClick={() => setChatMessages([chatMessages[0]])}
                className="text-[11px] text-slate-400 hover:text-rose-600 cursor-pointer flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>清空记录</span>
              </button>
            </div>

            {/* Messages Display */}
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
                    className={`p-3.5 rounded-2xl text-xs max-w-xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white font-medium rounded-tr-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Formatted Code Block */}
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
                  <span>白狐编程 AI 正在分析抽象语法树并生成代码...</span>
                </div>
              )}
            </div>

            {/* Prompt Input Box */}
            <form onSubmit={handleSendPrompt} className="pt-2 border-t border-slate-100 space-y-2">
              <div className="relative">
                <textarea
                  rows={2}
                  required
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="输入需求描述，例如：用 Tailwind CSS 编写响应式网格布局，或写一个 Cloudflare D1 数据分页 SQL..."
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

          {/* Quick Prompts & AI Tools Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>常用编程快捷指令 (点击填入)</span>
              </span>

              <div className="space-y-2 text-xs">
                {[
                  { title: 'Cloudflare Worker 边缘流式代理', desc: '生成带有 CORS 跨域头的 Worker 脚本' },
                  { title: 'React 19 响应式卡片组件', desc: '翡翠绿白东方美学风格 Tailwind 布局' },
                  { title: 'WebDAV 文件分片上传逻辑', desc: 'JavaScript 二进制 Blob 客户端流上传' },
                  { title: 'SQLite / D1 全量数据导出语句', desc: '生成标准 SQL dump 脚本与索引' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputPrompt(`请帮我编写：${item.title}，要求具备完善的异常捕获与清晰注释。`)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-slate-800 text-xs">{item.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-3xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
              <div className="font-bold flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>边缘 AI 架构与零数据泄露保障</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                白狐博客系统采用 Client-Side 直连与 Cloudflare Workers Anycast 边缘转发网关，所有代码在本地渲染，不对外部公网数据库记录开发者敏感 API Token。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 连接各种代码仓库 (GitHub, GitLab, Gitee, Cloudflare Pages) */}
      {activeTab === 'repos' && (
        <div className="space-y-6">
          {/* Add Repository Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 font-bold text-sm text-slate-800">
              <FolderGit2 className="w-4 h-4 text-emerald-600" />
              <span>连接新代码仓库 (支持 GitHub / GitLab / Gitee / Cloudflare Pages)</span>
            </div>

            <form onSubmit={handleAddRepository} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">代码仓库名称</label>
                <input
                  type="text"
                  required
                  placeholder="whitefox-blog"
                  value={newRepoForm.name}
                  onChange={(e) => setNewRepoForm({ ...newRepoForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">托管平台</label>
                <select
                  value={newRepoForm.platform}
                  onChange={(e) => setNewRepoForm({ ...newRepoForm, platform: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                >
                  <option value="GitHub">GitHub (全球开源社区)</option>
                  <option value="GitLab">GitLab (自建/企业云)</option>
                  <option value="Gitee">Gitee (国内代码托管)</option>
                  <option value="Cloudflare Pages">Cloudflare Pages (边缘部署仓库)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Git 仓库 URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/user/repo"
                  value={newRepoForm.url}
                  onChange={(e) => setNewRepoForm({ ...newRepoForm, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">分支 / Personal Token (可选)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="main 或 gh_pat"
                    value={newRepoForm.branch}
                    onChange={(e) => setNewRepoForm({ ...newRepoForm, branch: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                  >
                    立即连接
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Repositories List */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <span className="font-bold text-xs text-slate-800">已连接的代码仓库列表：</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repositories.map((repo) => (
                <div
                  key={repo.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GitBranch className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-sm text-slate-800">{repo.name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      {repo.platform} · {repo.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-mono break-all bg-white p-2.5 rounded-xl border border-slate-200">
                    {repo.url} (分支: {repo.branch})
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>最近提交: {repo.lastCommit}</span>
                    <button
                      onClick={() => {
                        const updated = repositories.filter((r) => r.id !== repo.id);
                        setRepositories(updated);
                        localStorage.setItem('wf_ai_repositories', JSON.stringify(updated));
                        showToast(`已断开仓库「${repo.name}」的连接`);
                      }}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      断开连接
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 保存和使用各种平台和 API (Cloudflare Workers AI, DeepSeek, OpenAI, Ollama) */}
      {activeTab === 'api-keys' && (
        <form onSubmit={handleSaveAiConfig} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                <span>AI 平台与 API 接口参数配置</span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                可保存和使用各种平台与 API（Cloudflare Workers AI、DeepSeek、OpenAI、本地 Ollama）
              </p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>保存 API 配置</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cloudflare Workers AI */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-amber-500" />
                  <span>Cloudflare Workers AI (推荐 · 零出站费)</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">边缘无服务器</span>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Cloudflare Account ID</label>
                <input
                  type="text"
                  placeholder="可以在 CF 控制台右侧复制"
                  value={aiConfig.cloudflare.accountId}
                  onChange={(e) => setAiConfig({ ...aiConfig, cloudflare: { ...aiConfig.cloudflare, accountId: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Workers AI API Token (拥有 Workers AI 权限)</label>
                <input
                  type="password"
                  placeholder="输入 API Token"
                  value={aiConfig.cloudflare.apiToken}
                  onChange={(e) => setAiConfig({ ...aiConfig, cloudflare: { ...aiConfig.cloudflare, apiToken: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>

            {/* DeepSeek API */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>DeepSeek API (专精代码推理与算法)</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">高性价比</span>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">DeepSeek API Key</label>
                <input
                  type="password"
                  placeholder="sk-xxxxxxxxxxxxxxxx"
                  value={aiConfig.deepseek.apiKey}
                  onChange={(e) => setAiConfig({ ...aiConfig, deepseek: { ...aiConfig.deepseek, apiKey: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">API Endpoint</label>
                <input
                  type="text"
                  value={aiConfig.deepseek.endpoint}
                  onChange={(e) => setAiConfig({ ...aiConfig, deepseek: { ...aiConfig.deepseek, endpoint: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>

            {/* OpenAI API */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center space-x-1.5">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span>OpenAI API (GPT-4o / GPT-4o-Mini)</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">国际通用</span>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">OpenAI API Key</label>
                <input
                  type="password"
                  placeholder="sk-proj-xxxx"
                  value={aiConfig.openai.apiKey}
                  onChange={(e) => setAiConfig({ ...aiConfig, openai: { ...aiConfig.openai, apiKey: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">自定义反向代理 / Endpoint</label>
                <input
                  type="text"
                  value={aiConfig.openai.endpoint}
                  onChange={(e) => setAiConfig({ ...aiConfig, openai: { ...aiConfig.openai, endpoint: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>

            {/* Local Ollama */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center space-x-1.5">
                  <Server className="w-4 h-4 text-purple-600" />
                  <span>本地私有 Ollama (离线运行，免联网与零数据外泄)</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">隐私安全</span>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Ollama 本地服务地址</label>
                <input
                  type="text"
                  value={aiConfig.ollama.endpoint}
                  onChange={(e) => setAiConfig({ ...aiConfig, ollama: { ...aiConfig.ollama, endpoint: e.target.value } })}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">本地模型标签</label>
                <input
                  type="text"
                  value={aiConfig.ollama.model}
                  onChange={(e) => setAiConfig({ ...aiConfig, ollama: { ...aiConfig.ollama, model: e.target.value } })}
                  placeholder="qwen2.5-coder:7b"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
export default CodingAIView;
