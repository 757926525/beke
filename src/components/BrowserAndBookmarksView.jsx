import React, { useState, useRef } from 'react';
import {
  Compass,
  Search,
  Globe,
  Bookmark,
  BookmarkPlus,
  ExternalLink,
  Plus,
  Trash2,
  Upload,
  CheckSquare,
  Square,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { parseNetscapeBookmarks } from '../services/cloudAdapter';

export default function BrowserAndBookmarksView({
  bookmarks,
  zones,
  onAddBookmark,
  onRemoveBookmark,
  onBatchAddBookmarks
}) {
  const [activeZone, setActiveZone] = useState('全部');
  const [searchEngineQuery, setSearchEngineQuery] = useState('');
  const [browserUrl, setBrowserUrl] = useState('https://github.com');
  const [simulatedPage, setSimulatedPage] = useState({
    title: 'GitHub: Let’s build from here',
    url: 'https://github.com',
    snippet: 'GitHub is where over 100 million developers shape the future of software, together.',
    zone: '开发者技术'
  });

  // Manual URL modal / state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualZone, setManualZone] = useState(zones[0] || '默认分区');
  const [manualDesc, setManualDesc] = useState('');

  // Local Bookmark File Import state
  const [importedBookmarks, setImportedBookmarks] = useState([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Search Results Simulation
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchEngineQuery.trim()) return;

    setHasSearched(true);
    const q = searchEngineQuery.trim();
    // Simulate real web search results
    const results = [
      {
        id: `sr-1-${Date.now()}`,
        title: `${q} - 官方门户与开发者社区`,
        url: `https://${q.toLowerCase().replace(/\s+/g, '')}.org`,
        snippet: `这里是关于 ${q} 的全方位深度探索，包含最权威的官方文档、开源规范及生态架构指南。`,
        zone: '开发者技术'
      },
      {
        id: `sr-2-${Date.now()}`,
        title: `深入浅出 ${q}：全方位架构实践`,
        url: `https://whitefox.blog/topics/${encodeURIComponent(q)}`,
        snippet: `由白狐博客精选收录的精品长文。探讨 ${q} 在多云协同和极速边缘部署中的深度落地经验。`,
        zone: '云原生与部署'
      },
      {
        id: `sr-3-${Date.now()}`,
        title: `${q} 极简在线工具导航站`,
        url: `https://tools.dev/${encodeURIComponent(q)}`,
        snippet: `一键在线使用 ${q} 相关的实用生产力工具，支持免配置跨端协同与数据同步。`,
        zone: '实用工具箱'
      }
    ];
    setSearchResults(results);
  };

  const handleSimulateBrowse = (result) => {
    setBrowserUrl(result.url);
    setSimulatedPage(result);
  };

  const handleBookmarkCurrentPage = (page = simulatedPage) => {
    const newBm = {
      id: `bm-${Date.now()}`,
      title: page.title,
      url: page.url,
      zone: page.zone || '常用收藏',
      desc: page.snippet || '来自白狐内置探索与搜索收录',
      favicon: `https://www.google.com/s2/favicons?domain=${page.url.replace(/^https?:\/\//, '')}&sz=32`,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    onAddBookmark(newBm);
    setToastMsg(`已将网站《${newBm.title}》一键加入收藏！`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Add Manual URL
  const handleSaveManual = (e) => {
    e.preventDefault();
    if (!manualUrl.trim() || !manualTitle.trim()) return;

    const newBm = {
      id: `bm-${Date.now()}`,
      title: manualTitle.trim(),
      url: manualUrl.trim(),
      zone: manualZone,
      desc: manualDesc.trim() || '手动录入的网址收藏',
      favicon: `https://www.google.com/s2/favicons?domain=${manualUrl.replace(/^https?:\/\//, '')}&sz=32`,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    onAddBookmark(newBm);
    setIsManualModalOpen(false);
    setManualTitle('');
    setManualUrl('');
    setManualDesc('');
    setToastMsg(`手动网址《${newBm.title}》已入库收藏！`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Parse Uploaded HTML Bookmark File
  const handleBookmarkFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const html = event.target.result;
      const parsed = parseNetscapeBookmarks(html);
      setImportedBookmarks(parsed);
      setIsImportModalOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Toggle selection in imported list
  const toggleImportItem = (id) => {
    setImportedBookmarks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Batch commit selected
  const handleConfirmImport = () => {
    const selected = importedBookmarks.filter((b) => b.selected);
    if (selected.length > 0) {
      onBatchAddBookmarks(selected);
      setToastMsg(`成功一键加入 ${selected.length} 个本地书签到白狐收藏！`);
      setTimeout(() => setToastMsg(null), 3500);
    }
    setIsImportModalOpen(false);
    setImportedBookmarks([]);
  };

  const filteredBookmarks = bookmarks.filter(
    (b) => activeZone === '全部' || b.zone === activeZone
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-semibold text-sm mb-1">
            <Compass className="w-4 h-4" />
            <span>探索与网络收藏枢纽</span>
          </div>
          <h2 className="font-serif-sc text-3xl font-bold text-slate-900 dark:text-white">
            内置搜索引擎、网页随览与分区书签中心
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            支持一键收录搜索结果、手动输入网址、本地 HTML 书签解析按需勾选导入，跨端同步至 D1 数据库。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Manual URL Button */}
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-medium text-xs sm:text-sm hover:bg-rose-100 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>手动收藏网址</span>
          </button>

          {/* Local Bookmark Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleBookmarkFileUpload}
            accept=".html,.htm"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl fox-gradient text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-rose-500/25 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>上传本地书签HTML</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Embedded Search Engine & Browser */}
      <div className="glass-panel p-6 rounded-3xl space-y-6">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h3 className="font-serif-sc text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <Globe className="w-5 h-5 text-rose-500" />
            <span>白狐灵犀网络搜索引擎</span>
          </h3>
          <p className="text-xs text-slate-500">
            检索互联网信息，支持将检索出的好站一键入库收纳至你的私有分区书签
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="输入关键字探索互联网（如：Cloudflare Pages / 深度求索 / Vite）..."
                value={searchEngineQuery}
                onChange={(e) => setSearchEngineQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl fox-gradient text-white font-medium text-sm shadow-sm"
            >
              检索
            </button>
          </form>
        </div>

        {/* Search Results Display */}
        {hasSearched && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              检索结果与一键收录
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {searchResults.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300">
                      {res.zone}
                    </span>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white hover:text-rose-500">
                      {res.title}
                    </h5>
                    <p className="text-xs text-slate-400 font-mono truncate">{res.url}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {res.snippet}
                    </p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <button
                      onClick={() => handleSimulateBrowse(res)}
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                    >
                      <span>随览预览</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleBookmarkCurrentPage(res)}
                      className="px-2.5 py-1 rounded-lg fox-gradient text-white text-xs font-medium flex items-center gap-1 shadow-xs"
                    >
                      <BookmarkPlus className="w-3 h-3" />
                      <span>一键收藏</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In-App Web Browser Viewport */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-900 text-slate-100">
          {/* Browser Address Bar */}
          <div className="p-3 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            </div>

            <div className="flex-1 max-w-xl mx-auto px-3 py-1.5 rounded-lg bg-slate-950 text-slate-300 font-mono text-xs flex items-center justify-between">
              <span className="truncate">{browserUrl}</span>
              <a
                href={browserUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white text-slate-400 ml-2"
                title="在真实新标签页中打开"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              onClick={() => handleBookmarkCurrentPage()}
              className="px-3 py-1 rounded-lg fox-gradient text-white text-xs font-medium flex items-center gap-1 shadow-sm shrink-0"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>一键加入收藏</span>
            </button>
          </div>

          {/* Browser Content Simulated Sandbox */}
          <div className="p-8 bg-slate-950/60 min-h-[220px] flex flex-col justify-center items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">{simulatedPage.title}</h4>
              <p className="text-xs text-rose-400 font-mono mt-0.5">{simulatedPage.url}</p>
            </div>
            <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
              {simulatedPage.snippet}
            </p>
            <div className="pt-2">
              <a
                href={simulatedPage.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white transition-colors"
              >
                <span>直达外部目标网站</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarks Section & Zone Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-500" />
            <h3 className="font-serif-sc text-xl font-bold text-slate-900 dark:text-white">
              我的网络收藏分区
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            共 {filteredBookmarks.length} 个收藏站点
          </span>
        </div>

        {/* Zones */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['全部', ...zones].map((z) => (
            <button
              key={z}
              onClick={() => setActiveZone(z)}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                activeZone === z
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'glass-panel text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {z}
            </button>
          ))}
        </div>

        {/* Bookmark Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((bm) => (
            <div
              key={bm.id}
              className="glass-panel p-4 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={bm.favicon}
                      alt=""
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                      className="w-5 h-5 rounded shrink-0 object-contain"
                    />
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {bm.title}
                    </h5>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 whitespace-nowrap shrink-0">
                    {bm.zone}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {bm.desc}
                </p>
                <p className="text-[11px] font-mono text-slate-400 truncate">{bm.url}</p>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <a
                  href={bm.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <span>立即访问</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      handleSimulateBrowse({
                        title: bm.title,
                        url: bm.url,
                        snippet: bm.desc,
                        zone: bm.zone
                      })
                    }
                    className="p-1 rounded text-slate-400 hover:text-blue-500"
                    title="在白狐随览中载入"
                  >
                    <Compass className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveBookmark(bm.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500"
                    title="移除书签"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual URL Input Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-serif-sc font-bold text-lg text-slate-900 dark:text-white mb-4">
              手动收藏网站网址
            </h3>

            <form onSubmit={handleSaveManual} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  网站名称
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：Cloudflare 控制台"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  目标网址 URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  所属分区
                </label>
                <select
                  value={manualZone}
                  onChange={(e) => setManualZone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                >
                  {zones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  网站简介备注
                </label>
                <textarea
                  rows="2"
                  placeholder="网站的功能描述或备忘..."
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl fox-gradient text-white font-medium text-sm shadow-md"
                >
                  保存入库
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selective Batch Import Modal for Uploaded Bookmark File */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-serif-sc font-bold text-lg text-slate-900 dark:text-white">
                  本地书签解析结果 · 选择性一键入库
                </h3>
                <p className="text-xs text-slate-500">
                  成功解析 {importedBookmarks.length} 个书签，可勾选要加入白狐收藏的条目
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setImportedBookmarks((prev) => prev.map((x) => ({ ...x, selected: true })))
                  }
                  className="text-xs text-rose-500 hover:underline"
                >
                  全选
                </button>
                <span>/</span>
                <button
                  onClick={() =>
                    setImportedBookmarks((prev) => prev.map((x) => ({ ...x, selected: false })))
                  }
                  className="text-xs text-slate-400 hover:underline"
                >
                  全不选
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {importedBookmarks.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleImportItem(item.id)}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    item.selected
                      ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/30'
                      : 'border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  {item.selected ? (
                    <CheckSquare className="w-5 h-5 text-rose-500 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 shrink-0" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-400 font-mono truncate">{item.url}</p>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                    {item.zone}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                已勾选 {importedBookmarks.filter((b) => b.selected).length} 项
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-400"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-5 py-2 rounded-xl fox-gradient text-white text-sm font-medium shadow-md"
                >
                  一键加入收藏库
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
