import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Send,
  CheckCircle2
} from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  systemSettings,
  onLoginSuccess,
  onRegisterUser
}) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerType, setRegisterType] = useState('username'); // 'username' | 'email'

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Check if logging in as Admin
    if (username === 'admin') {
      if (password === systemSettings.adminPassword) {
        onLoginSuccess({
          id: 'user-admin',
          username: 'admin',
          role: 'admin',
          email: 'admin@whitefox.blog'
        });
        onClose();
        return;
      } else {
        setErrorMsg('管理员密码错误！请检查输入或部署时设置的环境变量。');
        return;
      }
    }

    // Regular registered user check
    onLoginSuccess({
      id: `user-${Date.now()}`,
      username: username.trim(),
      role: 'user',
      email: `${username.trim()}@user.blog`
    });
    onClose();
  };

  // Send simulated verification code
  const handleSendCode = () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('请输入正确的邮箱地址！');
      return;
    }
    setErrorMsg('');
    setIsCodeSent(true);
    setSuccessMsg(`验证码已自动回复发送至 ${email}，请查收！（演示验证码：${systemSettings.emailVerifyCode}）`);
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  // Handle Register
  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!systemSettings.allowRegistration) {
      setErrorMsg('当前系统已关闭新用户注册通道，请联系管理员！');
      return;
    }

    if (registerType === 'email') {
      if (!systemSettings.emailRegistrationEnabled) {
        setErrorMsg('管理员暂未开启邮箱注册通道。');
        return;
      }
      if (verificationCode.trim() !== systemSettings.emailVerifyCode) {
        setErrorMsg(`邮箱验证码不匹配！正确验证码已发送至该邮箱或参考演示码：${systemSettings.emailVerifyCode}`);
        return;
      }
    }

    const newUser = {
      id: `user-${Date.now()}`,
      username: username.trim(),
      password,
      email: registerType === 'email' ? email.trim() : '',
      role: 'user',
      registeredAt: new Date().toISOString().split('T')[0]
    };

    onRegisterUser(newUser);
    onLoginSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="space-y-1 mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl fox-gradient text-white flex items-center justify-center mx-auto shadow-md">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-serif-sc font-bold text-2xl text-slate-900 dark:text-white mt-2">
            {isRegisterMode ? '加入白狐空间' : '登录白狐账号'}
          </h3>
          <p className="text-xs text-slate-500">
            {isRegisterMode
              ? '创建属于你的数字书阁与多云同步中心'
              : '管理员默认密码通过部署环境变量预设'}
          </p>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!isRegisterMode ? (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                用户名
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="admin 或 注册用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                密码
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-[11px] text-slate-500 space-y-1">
              <p>💡 管理员账号：<code className="font-mono text-rose-500">admin</code></p>
              <p>💡 管理员密码：由部署环境变量 <code className="font-mono text-rose-500">VITE_ADMIN_PASSWORD</code> 指定（默认 whitefox2025）</p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl fox-gradient text-white font-medium text-sm shadow-md hover:opacity-95 transition-opacity"
            >
              立即登录
            </button>

            <div className="pt-2 text-center text-xs">
              <span className="text-slate-500">还没有账号？</span>{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setIsRegisterMode(true);
                }}
                className="font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                立即注册
              </button>
            </div>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Registration Disabled Banner */}
            {!systemSettings.allowRegistration && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                ⚠️ 当前管理员已关闭全站新用户注册功能。
              </div>
            )}

            {/* Registration Type Select */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs">
              <button
                type="button"
                onClick={() => setRegisterType('username')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  registerType === 'username'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                默认用户名密码注册
              </button>
              <button
                type="button"
                onClick={() => setRegisterType('email')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  registerType === 'email'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                邮箱验证码注册
              </button>
            </div>

            {/* Note on No Password Recovery */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-[11px] leading-relaxed">
              <span className="font-bold">⚠️ 重要提示：</span>
              白狐博客遵循零知识极简安全架构，本站
              <span className="font-bold underline text-rose-600 dark:text-rose-400">
                不支持密码找回功能
              </span>
              。请您务必妥善记录并保管好您的登录密码。
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                设定用户名
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="字母或汉字用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Email Field if email mode */}
            {registerType === 'email' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    注册邮箱
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="your-name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendCode}
                      className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-50 text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap"
                    >
                      发送验证码
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    邮箱验证码
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="请输入收到的 6 位验证码"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                设定密码 (请务必牢记)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="请妥善保管密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!systemSettings.allowRegistration}
              className="w-full py-2.5 rounded-xl fox-gradient text-white font-medium text-sm shadow-md hover:opacity-95 transition-opacity disabled:opacity-40"
            >
              确认注册并登录
            </button>

            <div className="pt-2 text-center text-xs">
              <span className="text-slate-500">已有账号？</span>{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setIsRegisterMode(false);
                }}
                className="font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                返回登录
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
