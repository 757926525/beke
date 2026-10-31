import React, { useState } from 'react';
import {
  Palette, Image as ImageIcon, Users, Cloud, HardDrive, Lock, Mail,
  ChevronDown, ChevronUp, RefreshCw, Trash2, CheckCircle2,
  ExternalLink, Upload, Folder, Shield, AlertTriangle
} from 'lucide-react';
import { themePresets } from '../services/i18nAndTheme';

export const AdminSettingsView = ({
  appearance,
  setAppearance,
  systemSettings,
  setSystemSettings,
  cloudFiles,
  setCloudFiles,
  users,
  setUsers,
  cloudConfig,
  setCloudConfig,
  onSyncD1,
  currentTheme,
  setCurrentTheme,
  t
}) => {
  // Accordion collapsed state for each section
  const [openSections, setOpenSections] = useState({
    theme: true,
    background: true,
    users: true,
    d1sync: true,
    files: true,
    authRules: false
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Status message
  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // User management state
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    const newUser = {
      id: 'u-' + Date.now(),
      username: newUsername.trim(),
      email: newEmail.trim() || `${newUsername.trim()}@example.com`,
      role: 'member',
      registeredAt: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, newUser]);
    setNewUsername('');
    setNewEmail('');
    showToast('新用户添加成功');
  };

  const handleDeleteUser = (id) => {
    if (confirm('确认删除该用户？')) {
      setUsers(users.filter((u) => u.id !== id));
      showToast('用户已删除');
    }
  };

  // Cloud files management
  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newFileProvider, setNewFileProvider] = useState('Cloudflare R2');

  const handleAddCloudFile = (e) => {
    e.preventDefault();
    if (!newFileName || !newFileUrl) return;
    const newFile = {
      id: 'cf-' + Date.now(),
      name: newFileName,
      url: newFileUrl,
      provider: newFileProvider,
      size: '1.2 MB',
      type: 'other',
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setCloudFiles([newFile, ...cloudFiles]);
    setNewFileName('');
    setNewFileUrl('');
    showToast('文件已记录并关联到网盘与对象存储');
  };

  const handleDeleteCloudFile = (id) => {
    setCloudFiles(cloudFiles.filter((f) => f.id !== id));
    showToast('文件记录已移除');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>全能管理中枢 · 管理员专属控制台</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              系统管理与个性化定制
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              自由定制主题色板、全局背景图、全域 D1 实时同步、用户名单以及对象存储与网盘文件管理。
            </p>
          </div>

          {toast && (
            <div className="inline-flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-medium shadow-md animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>{toast}</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: 主题调色与全局背景自定义选区 (可收拢/展开) */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          onClick={() => toggleSection('theme')}
          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">主题调色与全局背景自定义</h2>
              <p className="text-xs text-slate-400">一键快速配色，自定义背景调色板，头像与首页图片设定</p>
            </div>
          </div>
          {openSections.theme ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.theme && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-6">
            {/* 1. 一键快速主题配色 */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                一键主题配色按键 (默认翡翠绿白)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {themePresets.map((th) => {
                  const isSelected = currentTheme.id === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => {
                        setCurrentTheme(th);
                        setAppearance({ ...appearance, themeId: th.id });
                        showToast(`已切换主题：${th.name}`);
                      }}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-400/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: th.primary }} />
                        <span className="text-xs font-bold text-slate-700">{th.name.split(' ')[0]}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{th.name.split(' ')[1] || ''}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. 背景调色板与图片地址 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  自定义背景底色 (调色板)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={appearance.bgColor || '#f8fafc'}
                    onChange={(e) => setAppearance({ ...appearance, bgColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={appearance.bgColor || '#f8fafc'}
                    onChange={(e) => setAppearance({ ...appearance, bgColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                    placeholder="#f8fafc"
                  />
                  <button
                    onClick={() => setAppearance({ ...appearance, bgColor: '#f8fafc' })}
                    className="px-3 py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 text-slate-600"
                  >
                    重置默认白
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  自定义全站背景照片 (URL 图片链接)
                </label>
                <input
                  type="text"
                  value={appearance.bgImage || ''}
                  onChange={(e) => setAppearance({ ...appearance, bgImage: e.target.value })}
                  placeholder="如: https://images.unsplash.com/... 或留空使用纯净背景"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            {/* 3. 头像与首页介绍区照片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  自定义全站头像照片 (URL 链接)
                </label>
                <div className="flex items-center space-x-3">
                  <img
                    src={appearance.avatarImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'}
                    alt="Avatar Preview"
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                  <input
                    type="text"
                    value={appearance.avatarImage || ''}
                    onChange={(e) => setAppearance({ ...appearance, avatarImage: e.target.value })}
                    placeholder="https://... 头像地址"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  首页介绍区照片 (Hero 照片 URL)
                </label>
                <div className="flex items-center space-x-3">
                  <img
                    src={appearance.heroImage || 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=100&q=80'}
                    alt="Hero Preview"
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                  <input
                    type="text"
                    value={appearance.heroImage || ''}
                    onChange={(e) => setAppearance({ ...appearance, heroImage: e.target.value })}
                    placeholder="https://... 首页介绍照片"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: 已注册用户管理列表 (管理员专属，可折叠) */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          onClick={() => toggleSection('users')}
          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">已注册用户管理列表 (管理员专属)</h2>
              <p className="text-xs text-slate-400">查看站内所有注册成员，设置成员权限或删除违规账号</p>
            </div>
          </div>
          {openSections.users ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.users && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4">
            {/* Quick Add User */}
            <form onSubmit={handleAddUser} className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <input
                type="text"
                placeholder="新用户名"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white flex-1 min-w-[120px]"
              />
              <input
                type="email"
                placeholder="用户邮箱"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white flex-1 min-w-[160px]"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold"
              >
                快速新增用户
              </button>
            </form>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">用户名称</th>
                    <th className="py-2.5 px-3">注册邮箱</th>
                    <th className="py-2.5 px-3">角色权限</th>
                    <th className="py-2.5 px-3">注册日期</th>
                    <th className="py-2.5 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-semibold text-slate-800 flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                          {u.username[0]?.toUpperCase()}
                        </span>
                        <span>{u.username}</span>
                      </td>
                      <td className="py-3 px-3 font-mono">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-medium text-[10px] ${
                          u.role === 'admin'
                            ? 'bg-rose-100 text-rose-700 font-bold'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {u.role === 'admin' ? '系统管理员' : '普通注册用户'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{u.registeredAt || '2025-05-18'}</td>
                      <td className="py-3 px-3 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="删除用户"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Cloudflare D1 数据库实时同步选区 (可折叠) */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          onClick={() => toggleSection('d1sync')}
          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Cloudflare D1 边缘数据库实时同步</h2>
              <p className="text-xs text-slate-400">文章、藏书、网址收藏、网盘设定、相册及全站数据全息双向同步</p>
            </div>
          </div>
          {openSections.d1sync ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.d1sync && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Cloudflare Account ID</span>
                <span className="font-mono font-semibold text-slate-700">
                  {cloudConfig?.d1?.accountId || cloudConfig?.cloudflare?.accountId || 'cf_account_demo_888'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">D1 Database Name</span>
                <span className="font-mono font-semibold text-slate-700">
                  {cloudConfig?.d1?.databaseId || cloudConfig?.cloudflare?.d1DatabaseId || 'whitefox-d1-db'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">D1 边缘节点连接状态</span>
                <span className="font-semibold text-emerald-600 flex items-center space-x-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>实时就绪 (Zero Latency Edge)</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500">
                接入 D1 边缘数据库后，博客文章、阅读进度、网址收藏、相册记录即刻实现跨设备全息同步。
              </p>
              <button
                onClick={onSyncD1}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>立即执行 D1 全库双向同步</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: 对象存储和云盘文件管理选区 (可折叠) */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          onClick={() => toggleSection('files')}
          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">对象存储与网盘文件管理</h2>
              <p className="text-xs text-slate-400">管理上传到 R2、腾讯云 COS、阿里云 OSS 与 AList 网盘的文件并在站内引用</p>
            </div>
          </div>
          {openSections.files ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.files && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4">
            {/* Quick add file reference */}
            <form onSubmit={handleAddCloudFile} className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <input
                type="text"
                placeholder="文件名称 (如 宣传短片.mp4)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white flex-1 min-w-[140px]"
              />
              <input
                type="text"
                placeholder="文件直链 URL"
                value={newFileUrl}
                onChange={(e) => setNewFileUrl(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white flex-2 min-w-[200px]"
              />
              <select
                value={newFileProvider}
                onChange={(e) => setNewFileProvider(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value="Cloudflare R2">Cloudflare R2</option>
                <option value="Tencent COS">腾讯云 COS</option>
                <option value="Alibaba OSS">阿里云 OSS</option>
                <option value="AList / WebDAV">AList / WebDAV 网盘</option>
              </select>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold"
              >
                新增文件引用
              </button>
            </form>

            {/* Cloud Files List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">文件名称</th>
                    <th className="py-2 px-3">存储源 / 网盘</th>
                    <th className="py-2 px-3">大小</th>
                    <th className="py-2 px-3">上传时间</th>
                    <th className="py-2 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cloudFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center space-x-2">
                        <Folder className="w-4 h-4 text-amber-500" />
                        <span className="truncate max-w-[220px]">{file.name}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono">
                          {file.provider}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{file.size}</td>
                      <td className="py-2.5 px-3 text-slate-400">{file.uploadedAt}</td>
                      <td className="py-2.5 px-3 text-right space-x-2">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 p-1 inline-block"
                          title="在站内或新窗口引用预览"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteCloudFile(file.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="移除记录"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: 注册控制与管理员密码选区 (可折叠) */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          onClick={() => toggleSection('authRules')}
          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">注册控制与环境变量密码预设</h2>
              <p className="text-xs text-slate-400">开启/关闭全站新用户注册，配置邮箱注册自动回复验证码</p>
            </div>
          </div>
          {openSections.authRules ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.authRules && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <div>
                <span className="text-xs font-bold text-slate-700">开放新用户注册</span>
                <p className="text-[11px] text-slate-400">关闭后仅管理员可登录，阻断外部注册</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.allowRegistration}
                  onChange={(e) => setSystemSettings({ ...systemSettings, allowRegistration: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <span className="font-bold">部署变量提示：</span>
                管理员密码在部署时由环境变量 <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">VITE_ADMIN_PASSWORD</code> 控制。
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
