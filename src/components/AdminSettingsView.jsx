import React, { useState } from 'react';
import {
  Shield,
  Key,
  UserCheck,
  Mail,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Save,
  CheckCircle2,
  Users,
  Settings,
  Lock
} from 'lucide-react';

export default function AdminSettingsView({
  systemSettings,
  onSaveSystemSettings,
  users
}) {
  const [settings, setSettings] = useState(systemSettings);
  const [toastMsg, setToastMsg] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSystemSettings(settings);
    setToastMsg('管理员全局配置与注册策略已成功保存！');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-semibold text-sm mb-1">
            <Shield className="w-4 h-4" />
            <span>系统控制台与管理权限</span>
          </div>
          <h2 className="font-serif-sc text-3xl font-bold text-slate-900 dark:text-white">
            管理员密码、开放注册控制与邮箱验证中枢
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            管理员密码支持在部署时通过环境变量直接设定。内置注册开关与邮箱验证码自动回复服务。
          </p>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Registration Toggle Switch */}
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-rose-500" />
              <h3 className="font-serif-sc font-bold text-lg text-slate-900 dark:text-white">
                允许新用户注册开关
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              管理员可随时一键关闭或开启全站注册功能。开启后支持默认用户名/密码注册及邮箱验证码注册。
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSettings({ ...settings, allowRegistration: !settings.allowRegistration })
            }
            className={`p-2 rounded-2xl transition-all ${
              settings.allowRegistration
                ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/60'
                : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            {settings.allowRegistration ? (
              <ToggleRight className="w-10 h-10" />
            ) : (
              <ToggleLeft className="w-10 h-10" />
            )}
          </button>
        </div>

        {/* Admin Password Variable Info */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-rose-500" />
            <h3 className="font-serif-sc font-bold text-lg text-slate-900 dark:text-white">
              管理员密码设定 (环境变量: VITE_ADMIN_PASSWORD)
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-semibold">关于管理员密码与部署环境变量：</p>
              <p>
                管理员密码在部署时通过环境变量 <code className="px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 font-mono">VITE_ADMIN_PASSWORD</code> 或控制台变量进行预先配置。在此处亦可临时覆盖修改生效。
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              当前管理员密码
            </label>
            <input
              type="text"
              value={settings.adminPassword}
              onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Email Registration & Automated Verification Code Settings */}
        <div className="glass-panel p-6 rounded-3xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-rose-500" />
              <h3 className="font-serif-sc font-bold text-lg text-slate-900 dark:text-white">
                邮箱注册与验证码自动回复设定
              </h3>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailRegistrationEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, emailRegistrationEnabled: e.target.checked })
                }
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="text-sm font-medium">支持邮箱注册</span>
            </label>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            管理员可在此自定义设定注册时的验证码规则，以及配置自动回复发件邮箱 (SMTP)。用户使用邮箱注册时将收到此验证码。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                设定当前通用验证码 / 自动回复码
              </label>
              <input
                type="text"
                value={settings.emailVerifyCode}
                onChange={(e) => setSettings({ ...settings, emailVerifyCode: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                新用户注册输入该邮箱验证码即可通过核验
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                自动回复发信邮箱 (SMTP Email)
              </label>
              <input
                type="email"
                value={settings.smtpEmail}
                onChange={(e) => setSettings({ ...settings, smtpEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                SMTP 发信服务器地址 (如 smtp.qq.com / smtp.aliyun.com)
              </label>
              <input
                type="text"
                value={settings.smtpServer}
                onChange={(e) => setSettings({ ...settings, smtpServer: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                SMTP 授权码 / 密码
              </label>
              <input
                type="password"
                value={settings.smtpAuthKey}
                onChange={(e) => setSettings({ ...settings, smtpAuthKey: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Registered Users List */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-500" />
            <h3 className="font-serif-sc font-bold text-lg text-slate-900 dark:text-white">
              已注册用户列表 ({users.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{u.username}</span>
                  <span className="text-slate-400 ml-2">({u.email || '用户名直接注册'})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    {u.role}
                  </span>
                  <span className="text-slate-400">{u.registeredAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl fox-gradient text-white font-medium text-sm shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>保存系统全局配置</span>
          </button>
        </div>
      </form>
    </div>
  );
}
