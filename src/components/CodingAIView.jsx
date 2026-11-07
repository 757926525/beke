import React, { useState } from 'react';
import {
  Sparkles, Code, Play, Copy, Check, Terminal,
  Cpu, Zap, Send, RotateCcw, Download, Key, ShieldCheck, AlertCircle
} from 'lucide-react';

export const CodingAIView = ({ currentUser, t }) => {
  const [selectedModel, setSelectedModel] = useState('cf-deepseek');
  const [prompt, setPrompt] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cfAccountId, setCfAccountId] = useState(() => localStorage.getItem('wf_cf_ai_account_id') || '');
  const [cfApiToken, setCfApiToken] = useState(() => localStorage.getItem('wf_cf_ai_api_token') || '');
  const [openaiApiKey, setOpenaiApiKey] = useState(() => localStorage.getItem('wf_ai_openai_token') || '');
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState(() => localStorage.getItem('wf_ai_openai_base') || 'https://api.openai.com/v1');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'settings'

  const models = [
    { id: 'cf-deepseek', name: 'Cloudflare Workers AI: DeepSeek R1 Distill', desc: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', provider: 'cloudflare' },
    { id: 'cf-llama', name: 'Cloudflare Workers AI: Llama 3.3 70B', desc: '@cf/meta/llama-3.3-70b-instruct', provider: 'cloudflare' },
    { id: 'cf-qwen', name: 'Cloudflare Workers AI: Qwen 2.5 Coder', desc: '@cf/qwen/qwen2.5-coder-32b-instruct', provider: 'cloudflare' },
    { id: 'custom-deepseek', name: 'DeepSeek Official API /兼容接口', desc: 'deepseek-chat / deepseek-coder', provider: 'openai' },
    { id: 'custom-openai', name: 'OpenAI / Claude / 兼容接口', desc: 'gpt-4o / gpt-4o-mini / claude-3-5', provider: 'openai' }
  ];

  const presets = [
    { label: 'React 现代化组件', text: '请编写一个支持自适应暗黑模式和玻璃拟态卡片效果的 React 组件，带平滑加载动画。' },
    { label: 'Cloudflare Worker 边缘脚本', text: '编写一个 Cloudflare Worker 脚本，实现自动反向代理、CORS 响应头添加与缓存控制。' },
    { label: 'Tailwind CSS 页面布局', text: '编写一段高质量的 HTML + Tailwind CSS 响应式博客主页网格布局，带 Hero Banner。' },
    { label: '数据算法与 TypeScript 类型', text: '用 TypeScript 实现带乐观锁与毫秒级时间戳合并冲突的数据同步算法，并添加严谨注释。' }
  ];

  const saveSettings = () => {
    localStorage.setItem('wf_cf_ai_account_id', cfAccountId.trim());
    localStorage.setItem('wf_cf_ai_api_token', cfApiToken.trim());
    localStorage.setItem('wf_ai_openai_token', openaiApiKey.trim());
    localStorage.setItem('wf_ai_openai_base', openaiBaseUrl.trim());
    alert('AI 编程配置已成功保存！');
    setActiveTab('editor');
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setOutputCode('');

    try {
      const currentModelObj = models.find((m) => m.id === selectedModel);

      // 1. OpenAI / 兼容第三方接口 (包含 DeepSeek API)
      if (currentModelObj?.provider === 'openai' && openaiApiKey.trim()) {
        const endpoint = `${openaiBaseUrl.replace(/\/+$/, '')}/chat/completions`;
        const modelName = selectedModel === 'custom-deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey.trim()}`
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: '你是一位顶级的软件工程师与架构专家，专门编写优雅、健壮、可直接运行的代码。' },
              { role: 'user', content: prompt }
            ],
            stream: false
          })
        });

        if (!res.ok) {
          throw new Error(`API 响应报错 HTTP ${res.status}`);
        }
        const data = await res.json();
        const generated = data.choices?.[0]?.message?.content || '// 未能获取返回内容';
        setOutputCode(generated);
      } else if (currentModelObj?.provider === 'cloudflare' && cfAccountId.trim() && cfApiToken.trim()) {
        // 2. Cloudflare Workers AI REST API
        const modelEndpoint = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId.trim()}/ai/run/${currentModelObj.desc}`;
        const res = await fetch(modelEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfApiToken.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are an expert AI code generator. Provide clean, well-formatted code.' },
              { role: 'user', content: prompt }
            ]
          })
        });

        if (!res.ok) {
          throw new Error(`Cloudflare AI API 报错 HTTP ${res.status}`);
        }
        const data = await res.json();
        const content = data.result?.response || JSON.stringify(data.result, null, 2);
        setOutputCode(content);
      } else {
        // 3. 模拟极速智能代码生成引擎（开箱即用模式）
        await new Promise((r) => setTimeout(r, 1200));
        let mockSnippet = `// 🦊 白狐 AI 智能编程中枢生成代码\n// 模型: ${currentModelObj?.name}\n// 任务: ${prompt}\n\n`;
        if (prompt.includes('Worker') || prompt.includes('Cloudflare')) {
          mockSnippet += `export default {\n  async fetch(request, env, ctx) {\n    const url = new URL(request.url);\n    return new Response(JSON.stringify({\n      status: 'ok',\n      path: url.pathname,\n      timestamp: Date.now()\n    }), {\n      headers: {\n        'Content-Type': 'application/json',\n        'Access-Control-Allow-Origin': '*'\n      }\n    });\n  }\n};`;
        } else if (prompt.includes('React') || prompt.includes('组件')) {
          mockSnippet += `import React, { useState } from 'react';\n\nexport const SmartCard = ({ title = '白狐卡片', desc }) => {\n  const [active, setActive] = useState(false);\n  return (\n    <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300">\n      <h3 className="text-lg font-bold text-slate-800">{title}</h3>\n      <p className="text-sm text-slate-500 mt-2">{desc || '优雅数字空间组件'}</p>\n      <button \n        onClick={() => setActive(!active)}\n        className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"\n      >\n        {active ? '已激活' : '点击体验'}\n      </button>\n    </div>\n  );\n};`;
        } else {
          mockSnippet += `/**\n * 核心算法逻辑实现\n */\nexport function resolveAdaptiveSync(localPayload, remotePayload) {\n  const merged = { ...localPayload };\n  Object.keys(remotePayload || {}).forEach((key) => {\n    if (remotePayload[key]?.updatedAt > (merged[key]?.updatedAt || 0)) {\n      merged[key] = remotePayload[key];\n    }\n  });\n  return merged;\n}\n\nconsole.log('算法模块就绪');`;
        }
        setOutputCode(mockSnippet);
      }
    } catch (err) {
      setOutputCode(`// AI 请求出错: ${err.message}\n// 提示：如需直连 Cloudflare 或 DeepSeek/OpenAI，请点击上方「模型接口设置」配置您的 API 密钥与 Account ID。`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>全域智能 · AI 编程与边缘模型中心</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI 编程中枢 (Cloudflare AI & 多模型)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              可接入 Cloudflare Workers AI (DeepSeek R1、Qwen 2.5 Coder、Llama 3.3) 及 OpenAI/兼容接口，提供一键代码生成与提示词工程支持。
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5 inline mr-1" />
              <span>编程工作台</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5 inline mr-1" />
              <span>模型接口设置</span>
            </button>
          </div>
        </div>

        {activeTab === 'settings' ? (
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-5">
            <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 text-xs text-purple-900 flex items-start space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">本地端到端安全存储</p>
                <p className="text-purple-700 mt-0.5">您的 API 密钥与账号仅保存在本地当前浏览器中，绝不会向全站公共云端同步泄露，请放心配置。</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Cloudflare Workers AI 接口</span>
                </h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Cloudflare Account ID (账户 ID)
                  </label>
                  <input
                    type="text"
                    value={cfAccountId}
                    onChange={(e) => setCfAccountId(e.target.value)}
                    placeholder="在 Cloudflare Dashboard 右侧获取"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Cloudflare API Token (具有 Workers AI 权限)
                  </label>
                  <input
                    type="password"
                    value={cfApiToken}
                    onChange={(e) => setCfApiToken(e.target.value)}
                    placeholder="Bearer Token"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Cpu className="w-4 h-4 text-purple-600" />
                  <span>DeepSeek / OpenAI 兼容接口</span>
                </h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    API Base URL (接口基址)
                  </label>
                  <input
                    type="text"
                    value={openaiBaseUrl}
                    onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                    placeholder="https://api.deepseek.com 或 https://api.openai.com/v1"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    API Key (密钥)
                  </label>
                  <input
                    type="password"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveSettings}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                保存 AI 配置并开始编程
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            {/* Model Selector & Presets */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <label className="text-xs font-bold text-slate-700 shrink-0">选择推理模型:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[11px] text-slate-400 font-semibold shrink-0">提示词模版:</span>
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(p.text)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 text-[11px] font-medium text-slate-600 shrink-0 transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Output */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  输入编程需求 / 提示词 Prompt:
                </label>
                <textarea
                  rows="3"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="例如：请用 React 和 Tailwind CSS 实现一个自适应画幅的相册图片轮播组件，带淡入淡出动画..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-sans focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setPrompt('');
                    setOutputCode('');
                  }}
                  className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center space-x-1 hover:bg-slate-100 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>清空输入</span>
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 cursor-pointer transition-all"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>模型正在深度推理生成...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>执行 AI 编程生成</span>
                    </>
                  )}
                </button>
              </div>

              {/* Output Editor */}
              {outputCode && (
                <div className="mt-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
                  <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-mono text-purple-400">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>AI Code Generation Output</span>
                    </div>

                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">已复制代码</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>一键复制代码</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-96">
                    <code>{outputCode}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingAIView;
