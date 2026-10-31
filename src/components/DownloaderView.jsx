import React, { useState } from 'react';
import {
  Download,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  ArrowDownCircle,
  Trash2,
  UploadCloud,
  FileDown,
  Layers
} from 'lucide-react';

export default function DownloaderView({
  downloads,
  onAddDownload,
  onRemoveDownload,
  onSaveToNetDrive
}) {
  const [downloadUrl, setDownloadUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const handleStartDownload = (e) => {
    e.preventDefault();
    if (!downloadUrl.trim()) return;

    setIsProcessing(true);
    const parsedName = customName.trim() || downloadUrl.split('/').pop().split('?')[0] || 'remote-file.dat';

    // Simulate multi-stage progressive direct fetch
    setTimeout(() => {
      const newDl = {
        id: `dl-${Date.now()}`,
        filename: parsedName,
        url: downloadUrl.trim(),
        size: '18.4 MB',
        progress: 100,
        status: 'completed',
        date: new Date().toLocaleString()
      };
      onAddDownload(newDl);
      setIsProcessing(false);
      setDownloadUrl('');
      setCustomName('');
      setToastMsg(`文件《${parsedName}》已成功下载并就绪！`);
      setTimeout(() => setToastMsg(null), 3500);

      // Trigger standard browser download for user convenience
      try {
        const fakeAnchor = document.createElement('a');
        fakeAnchor.href = downloadUrl.trim();
        fakeAnchor.download = parsedName;
        fakeAnchor.target = '_blank';
        // In case CORS forbids direct trigger, it's also saved in the download center
        fakeAnchor.click();
      } catch (err) {
        // Fallback
      }
    }, 1200);
  };

  const handleNetDriveSave = async (item) => {
    const res = await onSaveToNetDrive(item);
    setToastMsg(`已一键将下载文件存入网盘：${res.path}`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-semibold text-sm mb-1">
            <Download className="w-4 h-4" />
            <span>云端下载站</span>
          </div>
          <h2 className="font-serif-sc text-3xl font-bold text-slate-900 dark:text-white">
            输入文件网址 · 一键下载与网盘离线存储
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            支持输入任意互联网静态文件、安装包或影音链接，支持在浏览器端直达下载或一键中转至专属云网盘。
          </p>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* URL Input Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-lg">
        <form onSubmit={handleStartDownload} className="space-y-4 max-w-3xl mx-auto">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              文件下载地址 URL
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                placeholder="https://example.com/files/dataset.zip 或 .mp4/.pdf/.apk..."
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                自定义保存文件名（选填）
              </label>
              <input
                type="text"
                placeholder="例如：my-backup-2025.zip"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-xl fox-gradient text-white font-medium text-sm shadow-md hover:shadow-rose-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ArrowDownCircle className={`w-4 h-4 ${isProcessing ? 'animate-bounce' : ''}`} />
                <span>{isProcessing ? '正在建立流下载...' : '一键启动下载'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Downloaded History Tasks */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="font-serif-sc font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <FileDown className="w-5 h-5 text-rose-500" />
          <span>下载任务记录与文件归档</span>
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {downloads.map((item) => (
            <div
              key={item.id}
              className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {item.filename}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300">
                    已就绪
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono truncate max-w-md">{item.url}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>大小：{item.size}</span>
                  <span>•</span>
                  <span>时间：{item.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNetDriveSave(item)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>一键存入网盘</span>
                </button>

                <a
                  href={item.url}
                  download={item.filename}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>重新下载</span>
                </a>

                <button
                  onClick={() => onRemoveDownload(item.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500"
                  title="删除记录"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
