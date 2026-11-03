import React, { useState } from 'react';
import { X, LogIn, UserPlus, Shield, User, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, onLogin, onRegister, systemSettings }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'admin' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Deployment credentials
  const defaultAdminUsername =
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_ADMIN_USERNAME || import.meta.env?.VITE_INITIAL_ADMIN_USERNAME)) || 'fox';
  const defaultAdminPassword =
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_ADMIN_PASSWORD || import.meta.env?.VITE_INITIAL_ADMIN_PASSWORD)) || '';

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'login' || mode === 'admin') {
      if (!username.trim() || !password.trim()) {
        setError('请输入用户名和密码');
        return;
      }
      const res = onLogin({
        username: username.trim(),
        password: password.trim(),
        isAdminLogin: mode === 'admin'
      });
      if (res && res.success) {
        setSuccess(mode === 'admin' ? '系统站长认证成功！欢迎回来' : '登录成功！');
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setError(res?.message || (mode === 'admin' ? '管理员账号或密码不匹配，请核对部署环境变量' : '用户名或密码错误'));
      }
    } else if (mode === 'register') {
      if (systemSettings && !systemSettings.allowRegistration) {
        setError('本站当前已关闭新用户注册');
        return;
      }
      if (!username.trim() || !password.trim()) {
        setError('请填写完整的注册信息');
        return;
      }
      const res = onRegister({
        username: username.trim(),
        email: email.trim() || `${username.trim()}@example.com`,
        password: password.trim()
      });
      if (res && res.success) {
        setSuccess('注册成功并已自动登录！');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setError(res?.message || '注册失败，可能用户名已存在');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab switch: 普通登录 | 管理员登录 | 注册账号 */}
        <div className="flex border-b border-slate-100 pb-3 mb-4">
          <button
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              mode === 'login'
                ? 'border-emerald-500 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            普通登录
          </button>
          <button
            onClick={() => {
              setMode('admin');
              setError('');
              // Do NOT pre-fill credentials for security; keep fields clean and empty
              setUsername('');
              setPassword('');
            }}
            className={`flex-1 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center space-x-1 cursor-pointer ${
              mode === 'admin'
                ? 'border-purple-600 text-purple-700 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>管理员登录</span>
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              mode === 'register'
                ? 'border-emerald-500 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            注册账号
          </button>
        </div>

        {/* Admin login hint banner */}
        {mode === 'admin' && (
          <div className="mb-3 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-[11px] space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>唯一系统站长专享登录通道</span>
            </div>
            <p className="text-purple-700 leading-relaxed">
              部署环境变量：<code className="font-mono bg-purple-100 px-1 py-0.5 rounded text-[10px]">VITE_ADMIN_USERNAME</code> / <code className="font-mono bg-purple-100 px-1 py-0.5 rounded text-[10px]">VITE_ADMIN_PASSWORD</code>。可在 Cloudflare Pages 项目后台随时修改！
            </p>
          </div>
        )}

        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              {mode === 'admin' ? '管理员用户名' : '用户名 / 账号'}
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === 'admin' ? defaultAdminUsername : '例如: fox 或 用户名'}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-slate-600 font-semibold mb-1">电子邮箱 (选填)</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@domain.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-600 font-semibold mb-1">密码</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 mt-2 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              mode === 'admin'
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {mode === 'admin' ? (
              <>
                <Shield className="w-3.5 h-3.5" />
                <span>站长专属登录</span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>立即登录</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>立即注册</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
          安全提示：请使用部署或 Cloudflare 后台设置的专属管理员凭据登录
        </div>
      </div>
    </div>
  );
};
