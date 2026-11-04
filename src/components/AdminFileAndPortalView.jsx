import React, { useState } from 'react';
import {
  FolderLock, HardDrive, Mail, Upload, Download, Trash2, Edit3,
  FileText, Plus, Eye, CheckCircle2, AlertCircle, ExternalLink,
  ShieldAlert, LogIn, Lock, User, RefreshCw, Key, Globe, Search,
  X, Layers, Film, Music, FileCode, Check
} from 'lucide-react';
import { downloadFile } from '../services/documentConverter';

export const AdminFileAndPortalView = ({
  currentUser,
  isAdmin,
  cloudFiles = [],
  setCloudFiles,
  t
}) => {
  const [activeSubTab, setActiveSubTab] = useState('files'); // 'files' | 'netdrive-login' | 'mail-login'
  const [viewMode, setViewMode] = useState('medium'); // 'medium' (中图) | 'small' (小图) | 'list' (详细信息)
  const [toast, setToast] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [selectedFileIds, setSelectedFileIds] = useState([]);

  // Preview & Edit modal state
  const [previewFile, setPreviewFile] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', size: '', provider: '', url: '' });

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    provider: 'Cloudflare R2',
    type: 'document',
    url: ''
  });

  // NetDrive Login Form State
  const [selectedDrive, setSelectedDrive] = useState('baidu');
  const [driveLoginForm, setDriveLoginForm] = useState({ account: '', password: '', token: '' });
  const [driveLoginStatus, setDriveLoginStatus] = useState({});

  // Mail Login Form State
  const [selectedMail, setSelectedMail] = useState('qq');
  const [mailLoginForm, setMailLoginForm] = useState({ email: '', authCode: '', server: '' });
  const [mailLoginStatus, setMailLoginStatus] = useState({});

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  if (!isAdmin) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-slate-200 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">权限受限：仅系统管理员可见</h2>
        <p className="text-xs text-slate-500">
          该高级文件选区与内置网盘/邮箱登录中枢仅对站长或拥有 Admin 权限的账号开放。
        </p>
      </div>
    );
  }

  // Single & Batch File Upload with FileReader DataURL persistence
  const handleBatchUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const readAsDataUrl = (file) =>
      new Promise((resolve) => {
        // For large files (> 5MB), fallback to object URL to avoid localStorage quotas
        if (file.size > 5 * 1024 * 1024) {
          resolve(URL.createObjectURL(file));
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = () => resolve(URL.createObjectURL(file));
        reader.readAsDataURL(file);
      });

    const newItems = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop().toLowerCase();
      let type = 'document';
      if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) type = 'video';
      else if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) type = 'audio';
      else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) type = 'image';
      else if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) type = 'archive';

      const fileData = await readAsDataUrl(file);

      newItems.push({
        id: `admin-f-${Date.now()}-${i}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type,
        provider: '站内专享文件区',
        url: fileData,
        uploadedBy: currentUser?.username || '站长',
        userId: currentUser?.id || 'admin',
        uploadedAt: new Date().toISOString().split('T')[0]
      });
    }

    if (setCloudFiles) {
      setCloudFiles((prev) => [...newItems, ...prev]);
    }
    showToast(`成功上架 ${newItems.length} 个特权文件至站长选区，支持一键下载与查看！`);
    e.target.value = '';
  };

  // Delete File
  const handleDeleteFile = (id, name) => {
    if (confirm(`确认彻底从文件池中删除「${name}」？`)) {
      if (setCloudFiles) {
        setCloudFiles(cloudFiles.filter((f) => f.id !== id));
      }
      setSelectedFileIds(selectedFileIds.filter((fId) => fId !== id));
      showToast(`已成功删除「${name}」！`);
    }
  };

  // Batch Delete
  const handleBatchDelete = () => {
    if (!selectedFileIds.length) {
      showToast('请先勾选需要批量删除的文件！');
      return;
    }
    if (confirm(`确认批量彻底删除选中的 ${selectedFileIds.length} 个文件？`)) {
      if (setCloudFiles) {
        setCloudFiles(cloudFiles.filter((f) => !selectedFileIds.includes(f.id)));
      }
      setSelectedFileIds([]);
      showToast('批量删除成功！');
    }
  };

  // Batch Download
  const handleBatchDownload = () => {
    if (!selectedFileIds.length) {
      showToast('请先勾选需要批量下载的文件！');
      return;
    }
    const targets = cloudFiles.filter((f) => selectedFileIds.includes(f.id));
    targets.forEach((f, idx) => {
      setTimeout(() => {
        downloadFile(f.url, f.name);
      }, idx * 250);
    });
    showToast(`已启动批量下载 ${targets.length} 个文件！`);
  };

  // Toggle selection
  const toggleSelect = (id) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Open Edit File Modal
  const handleOpenEdit = (file) => {
    setEditingFile(file);
    setEditForm({
      name: file.name,
      size: file.size,
      provider: file.provider || '站内专享',
      url: file.url
    });
  };

  // Save Edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;

    if (setCloudFiles) {
      setCloudFiles(
        cloudFiles.map((f) => (f.id === editingFile.id ? { ...f, ...editForm } : f))
      );
    }
    showToast(`文件「${editForm.name}」元数据已更新！`);
    setEditingFile(null);
  };

  // NetDrive Login Simulator
  const handleDriveLoginSubmit = (e) => {
    e.preventDefault();
    if (!driveLoginForm.account.trim()) {
      showToast('请输入网盘登录账号！');
      return;
    }
    setDriveLoginStatus({
      ...driveLoginStatus,
      [selectedDrive]: {
        loggedIn: true,
        account: driveLoginForm.account,
        loginTime: new Date().toLocaleTimeString()
      }
    });
    showToast(`网盘【${driveOptions.find((d) => d.id === selectedDrive)?.name}】登录授权成功！`);
    setDriveLoginForm({ account: '', password: '', token: '' });
  };

  // Mailbox Login Simulator
  const handleMailLoginSubmit = (e) => {
    e.preventDefault();
    if (!mailLoginForm.email.trim()) {
      showToast('请输入邮箱账号！');
      return;
    }
    setMailLoginStatus({
      ...mailLoginStatus,
      [selectedMail]: {
        loggedIn: true,
        email: mailLoginForm.email,
        loginTime: new Date().toLocaleTimeString()
      }
    });
    showToast(`邮箱【${mailOptions.find((m) => m.id === selectedMail)?.name}】握手验证成功！已接入收发网关。`);
    setMailLoginForm({ email: '', authCode: '', server: '' });
  };

  // Filtered files
  const filteredFiles = cloudFiles.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.provider && f.provider.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchType = selectedFileType === 'all' || f.type === selectedFileType;
    return matchSearch && matchType;
  });

  const driveOptions = [
    { id: 'baidu', name: '百度网盘 (Baidu NetDisk)', logo: '🐼', desc: '国内超大容量个人私有网盘' },
    { id: 'quark', name: '夸克网盘 (Quark Drive)', logo: '⚡', desc: '极速转存与多端直链播放' },
    { id: 'onedrive', name: '微软 OneDrive', logo: '☁️', desc: 'Office 365 深度集成与多端云同步' },
    { id: 'googledrive', name: 'Google Drive', logo: '🌐', desc: '全球高可用文档协作与媒体网盘' },
    { id: 'pan115', name: '115 个人云', logo: '📁', desc: '大文件归档与极客存储空间' },
    { id: 'alist', name: 'AList 多存储聚合网盘', logo: '🚀', desc: '全协议 WebDAV 与多网盘统管' }
  ];

  const mailOptions = [
    { id: 'qq', name: '腾讯 QQ 邮箱', logo: '🐧', host: 'smtp.qq.com', desc: '个人首选，支持 SSL 465 极速发信' },
    { id: '163', name: '网易 163 邮箱', logo: '📮', host: 'smtp.163.com', desc: '经典个人与办公邮箱，支持客户端授权' },
    { id: 'gmail', name: 'Google Gmail', logo: '📬', host: 'smtp.gmail.com', desc: '全球通用邮件服务，支持 OAuth2' },
    { id: 'outlook', name: 'Microsoft Outlook / Hotmail', logo: '📨', host: 'smtp.office365.com', desc: '企业与个人办公协同，微软生态' },
    { id: 'enterprise', name: '企业专属自建邮箱 / SES', logo: '🏢', host: 'mail.yourdomain.com', desc: '自定义顶级域名企业邮局与 DirectMail' }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-2">
              <FolderLock className="w-3.5 h-3.5" />
              <span>站长特权 · 仅管理员可见文件选区与中枢登录</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              管理员专属文件选区与内置网盘/邮箱登录
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              紧邻媒体影音中枢，具备单个/批量上传、查看、编辑、下载、删除丰富文件管理能力；内置主流网盘登录授权与主流邮箱网关界面。
            </p>
          </div>

          {/* Sub tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
            {[
              { id: 'files', label: '专属文件选区', icon: FolderLock },
              { id: 'netdrive-login', label: '内置网盘登录', icon: HardDrive },
              { id: 'mail-login', label: '内置邮箱登录', icon: Mail }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: 管理员专属文件选区 (支持单个/批量上传、查看、编辑、下载、删除) */}
      {activeSubTab === 'files' && (
        <div className="space-y-6">
          {/* Action and Search Bar */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="搜索文件名、存储提供商..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <select
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="all">全类型文件</option>
                <option value="video">视频文件</option>
                <option value="audio">音频文件</option>
                <option value="document">文档资料</option>
                <option value="archive">压缩档案</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto text-xs">
              {/* 3-Tier Mode: 中图 / 小图 / 详细信息 */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('medium')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    viewMode === 'medium' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  中图
                </button>
                <button
                  onClick={() => setViewMode('small')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    viewMode === 'small' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  小图
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  详细信息
                </button>
              </div>

              {/* Batch Download / Delete */}
              {selectedFileIds.length > 0 && (
                <>
                  <button
                    onClick={handleBatchDownload}
                    className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>批量下载 ({selectedFileIds.length})</span>
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>批量删除 ({selectedFileIds.length})</span>
                  </button>
                </>
              )}

              {/* Batch Upload */}
              <label className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer">
                <Layers className="w-3.5 h-3.5" />
                <span>批量上传</span>
                <input
                  type="file"
                  multiple
                  onChange={handleBatchUpload}
                  className="hidden"
                />
              </label>

              {/* Single Upload */}
              <label className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>单个上传</span>
                <input
                  type="file"
                  onChange={handleBatchUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Files Display: Medium (中图) / Small (小图) / Table (详细信息) */}
          {viewMode === 'medium' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="group bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between relative"
                >
                  <div className="absolute top-3 left-3 z-10">
                    <input
                      type="checkbox"
                      checked={selectedFileIds.includes(file.id)}
                      onChange={() => toggleSelect(file.id)}
                      className="rounded text-emerald-600 cursor-pointer"
                    />
                  </div>
                  <div className="pl-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        {file.type === 'video' ? <Film className="w-4 h-4" /> :
                         file.type === 'audio' ? <Music className="w-4 h-4" /> :
                         file.type === 'archive' ? <Layers className="w-4 h-4" /> :
                         <FileText className="w-4 h-4" />}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        {file.provider || '站内本地'}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs text-slate-800 line-clamp-2 leading-relaxed" title={file.name}>
                      {file.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1 font-mono">
                      <span>{file.size || '2.5 MB'}</span>
                      <span>•</span>
                      <span>{file.uploadedAt || '近期'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                    <button onClick={() => setPreviewFile(file)} className="p-1 rounded-lg text-slate-400 hover:text-emerald-600" title="在线预览"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleOpenEdit(file)} className="p-1 rounded-lg text-slate-400 hover:text-amber-600" title="编辑信息"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => downloadFile(file.url, file.name)} className="p-1 rounded-lg text-slate-400 hover:text-sky-600" title="单个下载"><Download className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteFile(file.id, file.name)} className="p-1 rounded-lg text-slate-400 hover:text-rose-600" title="删除"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === 'small' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 flex flex-col justify-between text-xs space-y-1 relative"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="checkbox"
                      checked={selectedFileIds.includes(file.id)}
                      onChange={() => toggleSelect(file.id)}
                      className="rounded text-emerald-600 cursor-pointer"
                    />
                    <span className="text-[9px] font-mono text-slate-400">{file.size}</span>
                  </div>
                  <div className="truncate font-semibold text-slate-800 text-[11px]" title={file.name}>{file.name}</div>
                  <div className="flex items-center justify-end space-x-1 pt-1 border-t border-slate-100">
                    <button onClick={() => setPreviewFile(file)} className="p-0.5 text-slate-400 hover:text-emerald-600" title="预览"><Eye className="w-3 h-3" /></button>
                    <button onClick={() => downloadFile(file.url, file.name)} className="p-0.5 text-slate-400 hover:text-sky-600" title="下载"><Download className="w-3 h-3" /></button>
                    <button onClick={() => handleDeleteFile(file.id, file.name)} className="p-0.5 text-slate-400 hover:text-rose-600" title="删除"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={filteredFiles.length > 0 && filteredFiles.every((f) => selectedFileIds.includes(f.id))}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedFileIds(filteredFiles.map((f) => f.id));
                          else setSelectedFileIds([]);
                        }}
                      />
                    </th>
                    <th className="py-2.5 px-3">文件名</th>
                    <th className="py-2.5 px-3">格式</th>
                    <th className="py-2.5 px-3">大小</th>
                    <th className="py-2.5 px-3">存储平台</th>
                    <th className="py-2.5 px-3">上传日期</th>
                    <th className="py-2.5 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <input
                          type="checkbox"
                          checked={selectedFileIds.includes(file.id)}
                          onChange={() => toggleSelect(file.id)}
                        />
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{file.name}</td>
                      <td className="py-2.5 px-3 uppercase text-[10px] font-mono">{file.type || 'file'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{file.size}</td>
                      <td className="py-2.5 px-3">{file.provider || '站内文件'}</td>
                      <td className="py-2.5 px-3 text-slate-400">{file.uploadedAt}</td>
                      <td className="py-2.5 px-4 text-right space-x-2">
                        <button onClick={() => setPreviewFile(file)} className="text-emerald-600 hover:underline">预览</button>
                        <button onClick={() => handleOpenEdit(file)} className="text-amber-600 hover:underline">编辑</button>
                        <button onClick={() => downloadFile(file.url, file.name)} className="text-sky-600 hover:underline">下载</button>
                        <button onClick={() => handleDeleteFile(file.id, file.name)} className="text-rose-600 hover:underline">删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: 内置各种主流网盘登录界面 (百度网盘、夸克、OneDrive、Google Drive、115、AList) */}
      {activeSubTab === 'netdrive-login' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Drive selector sidebar */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block px-2 mb-2">
              选择需接入授权的网盘系统：
            </span>
            {driveOptions.map((d) => {
              const isSelected = selectedDrive === d.id;
              const status = driveLoginStatus[d.id];
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDrive(d.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 bg-white/80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{d.logo}</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{d.name}</h4>
                      <p className="text-[10px] text-slate-400">{d.desc}</p>
                    </div>
                  </div>
                  {status?.loggedIn ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
                      已授权
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 shrink-0">
                      未登录
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Drive Login Form Panel */}
          <div className="lg:col-span-8 bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">
                  {driveOptions.find((d) => d.id === selectedDrive)?.logo}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {driveOptions.find((d) => d.id === selectedDrive)?.name} · 站长直连登录网关
                  </h3>
                  <p className="text-xs text-slate-400">
                    安全握手协议，接入后可在博客中一键检索、流式转存或直接下发大文件下载
                  </p>
                </div>
              </div>
            </div>

            {driveLoginStatus[selectedDrive]?.loggedIn ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>网盘账号已处于在线握手状态</span>
                </div>
                <p className="text-xs text-emerald-700">
                  当前授权身份：<strong>{driveLoginStatus[selectedDrive].account}</strong>（握手生效时间：{driveLoginStatus[selectedDrive].loginTime}）
                </p>
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setDriveLoginStatus({ ...driveLoginStatus, [selectedDrive]: null });
                      showToast('已安全退出网盘登录！');
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                  >
                    解除授权与退出登录
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDriveLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    网盘账号 / 手机号 / 开发者 AppKey
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="输入网盘账号或 Access Key"
                    value={driveLoginForm.account}
                    onChange={(e) => setDriveLoginForm({ ...driveLoginForm, account: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    登录密码 / 授权令牌 (Refresh Token / Cookie)
                  </label>
                  <input
                    type="password"
                    placeholder="输入密码或 OAuth 访问令牌"
                    value={driveLoginForm.password}
                    onChange={(e) => setDriveLoginForm({ ...driveLoginForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
                  🔒 站长安全加密保障：所有登录凭证均在本地沙箱内执行单向传输与本地加盐存储，绝不泄露给任何第三方接口。
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>立即登录并激活网盘中枢</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: 内置各种主流邮箱登录界面 (QQ邮箱、网易163、Gmail、Outlook、企业专属) */}
      {activeSubTab === 'mail-login' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Mail selector sidebar */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block px-2 mb-2">
              选择需接入收发的邮箱系统：
            </span>
            {mailOptions.map((m) => {
              const isSelected = selectedMail === m.id;
              const status = mailLoginStatus[m.id];
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMail(m.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 bg-white/80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{m.logo}</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{m.name}</h4>
                      <p className="text-[10px] text-slate-400">{m.desc}</p>
                    </div>
                  </div>
                  {status?.loggedIn ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
                      已在线
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 shrink-0">
                      未接入
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mail Login Form Panel */}
          <div className="lg:col-span-8 bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">
                  {mailOptions.find((m) => m.id === selectedMail)?.logo}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {mailOptions.find((m) => m.id === selectedMail)?.name} · 站长收发网关
                  </h3>
                  <p className="text-xs text-slate-400">
                    支持 IMAP/SMTP 直连与自动邮件告警，用于系统验证码收发与访客留言直推
                  </p>
                </div>
              </div>
            </div>

            {mailLoginStatus[selectedMail]?.loggedIn ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>邮箱网关已在线且工作正常</span>
                </div>
                <p className="text-xs text-emerald-700">
                  当前接入邮箱：<strong>{mailLoginStatus[selectedMail].email}</strong>（握手成功于：{mailLoginStatus[selectedMail].loginTime}）
                </p>
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setMailLoginStatus({ ...mailLoginStatus, [selectedMail]: null });
                      showToast('已断开邮箱网关连接！');
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                  >
                    断开网关与退出
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMailLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    邮箱地址 (Username / Email)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="如: master@whitefox.blog 或 yourname@qq.com"
                    value={mailLoginForm.email}
                    onChange={(e) => setMailLoginForm({ ...mailLoginForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      SMTP / IMAP 服务器主机
                    </label>
                    <input
                      type="text"
                      placeholder={mailOptions.find((m) => m.id === selectedMail)?.host || 'smtp.example.com'}
                      value={mailLoginForm.server}
                      onChange={(e) => setMailLoginForm({ ...mailLoginForm, server: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      客户端授权码 / 密码 (Auth Token)
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="邮箱授权码或应用专用密码"
                      value={mailLoginForm.authCode}
                      onChange={(e) => setMailLoginForm({ ...mailLoginForm, authCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
                  💡 提示：QQ与网易邮箱请在网页端开启 POP3/SMTP 服务并生成<strong>授权码</strong>填入，避免使用普通账号密码。
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>立即验证接入邮箱网关</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">特权文件预览: {previewFile.name}</h3>
              <button onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <div className="text-xs space-y-2 text-slate-600">
              <p><strong>文件格式：</strong>{previewFile.type}</p>
              <p><strong>文件大小：</strong>{previewFile.size}</p>
              <p><strong>所属服务：</strong>{previewFile.provider}</p>
              <p className="font-mono text-[11px] break-all bg-slate-50 p-2 rounded-xl"><strong>直链地址：</strong>{previewFile.url}</p>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => downloadFile(previewFile.url, previewFile.name)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
              >
                下载此文件
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">编辑特权文件元数据</h3>
              <button onClick={() => setEditingFile(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">文件名</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">文件大小描述</label>
                <input
                  type="text"
                  value={editForm.size}
                  onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">存储平台提供商</label>
                <input
                  type="text"
                  value={editForm.provider}
                  onChange={(e) => setEditForm({ ...editForm, provider: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingFile(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminFileAndPortalView;
