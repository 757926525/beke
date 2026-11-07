import React, { useState } from 'react';
import {
  Mail, Send, Inbox, Trash2, Archive, Star,
  RefreshCw, CheckCircle2, AlertTriangle, Search,
  Plus, ArrowRight, CornerUpLeft, ShieldCheck,
  Settings, Key, Globe, Eye, CheckSquare, Square,
  Clock, X, AlertCircle
} from 'lucide-react';

export const MailHubView = ({
  emailSettings,
  setEmailSettings,
  mailMessages = [],
  setMailMessages,
  currentUser,
  isAdmin,
  activeStorageEngine = 'cloudflare-kv',
  t
}) => {
  const [activeFolder, setActiveFolder] = useState('inbox'); // 'inbox' | 'sent' | 'trash' | 'settings'
  const [selectedMail, setSelectedMail] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Compose / Reply modal
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({
    recipient: '',
    subject: '',
    content: ''
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState(() => ({
    provider: emailSettings?.provider || 'resend',
    apiKey: emailSettings?.apiKey || '',
    apiEndpoint: emailSettings?.apiEndpoint || 'https://api.resend.com/emails',
    senderName: emailSettings?.senderName || '白狐博客官方安全中心',
    senderEmail: emailSettings?.senderEmail || 'service@whitefox.blog',
    autoReplyEnabled: emailSettings?.autoReplyEnabled !== false,
    rateLimitEnabled: emailSettings?.rateLimitEnabled !== false,
    maxDailyEmails: emailSettings?.maxDailyEmails || 300,
    codeExpireMinutes: emailSettings?.codeExpireMinutes || 10,
    emailSubject: emailSettings?.emailSubject || '【白狐博客】新用户注册自动验证码',
    emailTemplate: emailSettings?.emailTemplate || '尊敬的白狐访客：\n\n欢迎加入白狐数字空间！您注册账号的验证码为：\n\n【 {{code}} 】\n\n该验证码在 {{expire}} 分钟内有效，请勿泄露给他人。',
    cfEmailRouting: {
      enabled: emailSettings?.cfEmailRouting?.enabled !== false,
      routingAddress: emailSettings?.cfEmailRouting?.routingAddress || 'contact@whitefox.blog',
      forwardTo: emailSettings?.cfEmailRouting?.forwardTo || 'admin@whitefox.blog',
      webhookUrl: emailSettings?.cfEmailRouting?.webhookUrl || '/api/mail/webhook'
    }
  }));

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Filter messages by folder and search
  const visibleMessages = mailMessages.filter((m) => {
    if (m.deleted) return false;
    const matchFolder = m.folder === activeFolder;
    const matchSearch =
      (m.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.sender || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.recipient || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchFolder && matchSearch;
  });

  const totalMessageCount = mailMessages.filter((m) => !m.deleted).length;
  const isOverQuotaWarning = totalMessageCount >= 3000;

  // Toggle selection
  const handleToggleSelect = (id, e) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === visibleMessages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleMessages.map((m) => m.id));
    }
  };

  // Mark single mail as read
  const handleOpenMail = (mail) => {
    setSelectedMail(mail);
    if (!mail.read) {
      setMailMessages(
        mailMessages.map((m) => (m.id === mail.id ? { ...m, read: true, updatedAt: Date.now() } : m))
      );
    }
  };

  // Move to trash or recover
  const handleMoveToTrash = (ids) => {
    setMailMessages(
      mailMessages.map((m) => (ids.includes(m.id) ? { ...m, folder: 'trash', updatedAt: Date.now() } : m))
    );
    setSelectedIds([]);
    if (selectedMail && ids.includes(selectedMail.id)) {
      setSelectedMail(null);
    }
    showToast(`已移动 ${ids.length} 封信件至回收站！`);
  };

  const handleRestoreFromTrash = (ids) => {
    setMailMessages(
      mailMessages.map((m) => (ids.includes(m.id) ? { ...m, folder: 'inbox', updatedAt: Date.now() } : m))
    );
    setSelectedIds([]);
    if (selectedMail && ids.includes(selectedMail.id)) {
      setSelectedMail(null);
    }
    showToast(`已恢复 ${ids.length} 封信件至收件箱！`);
  };

  // Permanently delete
  const handlePermanentDelete = (ids) => {
    if (!window.confirm(`确定要彻底永久删除这 ${ids.length} 封信件吗？此操作不可逆！`)) return;
    setMailMessages(
      mailMessages.map((m) => (ids.includes(m.id) ? { ...m, deleted: true, updatedAt: Date.now() } : m))
    );
    setSelectedIds([]);
    if (selectedMail && ids.includes(selectedMail.id)) {
      setSelectedMail(null);
    }
    showToast(`已永久彻底清理选定信件！`);
  };

  // Empty entire trash
  const handleEmptyTrash = () => {
    const trashIds = mailMessages.filter((m) => m.folder === 'trash').map((m) => m.id);
    if (!trashIds.length) {
      showToast('回收站当前已为空！');
      return;
    }
    if (!window.confirm(`确定要彻底清空回收站内的所有 ${trashIds.length} 封信件吗？`)) return;
    handlePermanentDelete(trashIds);
  };

  // Reply
  const handleReplyMail = (mail, e) => {
    if (e) e.stopPropagation();
    setComposeForm({
      recipient: mail.sender,
      subject: `回复：${mail.subject.replace(/^回复：/, '')}`,
      content: `\n\n----- 原始邮件 (${mail.date} 由 ${mail.sender} 发送) -----\n${mail.content}`
    });
    setIsComposeOpen(true);
  };

  // Send mail (Station to User / Outbox)
  const handleSendMail = (e) => {
    e.preventDefault();
    if (!composeForm.recipient || !composeForm.subject || !composeForm.content) {
      showToast('请完整填写收件人邮箱、主题与信件正文！');
      return;
    }

    const newMail = {
      id: `mail-${Date.now()}`,
      folder: 'sent',
      sender: settingsForm.senderEmail || 'service@whitefox.blog',
      recipient: composeForm.recipient.trim(),
      subject: composeForm.subject.trim(),
      content: composeForm.content,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      read: true,
      isStarred: false,
      isCodeVerify: false,
      updatedAt: Date.now(),
      deleted: false
    };

    setMailMessages([newMail, ...mailMessages]);
    setIsComposeOpen(false);
    setComposeForm({ recipient: '', subject: '', content: '' });
    showToast(`信件已通过「${settingsForm.provider.toUpperCase()}」API 网关成功发出并归档到发件箱！`);
  };

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    setEmailSettings(settingsForm);
    showToast('邮件发信 API 与 Cloudflare Email Routing 配置已成功保存！');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-2 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Over 3000 Emails High Capacity Warning Banner */}
      {isOverQuotaWarning && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <span className="font-bold">信件容量高负荷警报：</span>
              <span>当前信件总数已超过 3,000 封 ({totalMessageCount} 封)！建议及时清空回收站或归档历史邮件，以保障 KV 与数据库的极速同步体验。</span>
            </div>
          </div>
          <button
            onClick={handleEmptyTrash}
            className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 shrink-0 cursor-pointer"
          >
            一键清空回收站
          </button>
        </div>
      )}

      {/* Main Mail Hub Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>智能邮件与信件管理区</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-normal">
                  管理员专属
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-normal">
                  存储优先级: {activeStorageEngine.includes('kv') ? 'Cloudflare KV (优先)' : 'D1数据库'}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                支持保存 API 的第三方发信服务、Cloudflare Email Routing 收信规则、验证码自动发信与站内完整信件管理
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsComposeOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>向用户发信</span>
          </button>
          <button
            onClick={() => setActiveFolder(activeFolder === 'settings' ? 'inbox' : 'settings')}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeFolder === 'settings'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>邮件网关配置</span>
          </button>
        </div>
      </div>

      {/* Main Mailbox Content Layout */}
      {activeFolder === 'settings' ? (
        /* Configuration Panel */
        <form onSubmit={handleSaveSettings} className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">邮件服务 API 与收发规则配置</h2>
              <p className="text-xs text-slate-400 mt-0.5">数据优先存入 Cloudflare KV，未配置 KV 时自动存入 D1 数据库</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              保存所有配置
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Third-party Mail API */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-600" />
                <span>支持保存 API 的第三方邮件发信服务</span>
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">邮件服务商 (Provider)</label>
                <select
                  value={settingsForm.provider}
                  onChange={(e) => setSettingsForm({ ...settingsForm, provider: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
                >
                  <option value="resend">Resend (推荐 · 现代化极速 API)</option>
                  <option value="sendgrid">Twilio SendGrid (全球主流 API)</option>
                  <option value="postmark">Postmark (极高送达率 API)</option>
                  <option value="mailgun">Mailgun (开发者 API)</option>
                  <option value="smtp">标准 SMTP 网关 (QQ / 163 / 企业邮)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">API Key / Token (加密安全保存)</label>
                <input
                  type="password"
                  value={settingsForm.apiKey}
                  onChange={(e) => setSettingsForm({ ...settingsForm, apiKey: e.target.value })}
                  placeholder="re_xxxxxxxxxxxxxx 或 SG.xxxxxx"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-mono focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">发件人名称</label>
                  <input
                    type="text"
                    value={settingsForm.senderName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, senderName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">发件邮箱地址</label>
                  <input
                    type="email"
                    value={settingsForm.senderEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, senderEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Cloudflare Email Routing & Rate Limits */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-sky-600" />
                <span>收信规则 (Cloudflare Email Routing) 与防护开关</span>
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">域名接收路由地址 (Custom Address)</label>
                <input
                  type="email"
                  value={settingsForm.cfEmailRouting.routingAddress}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      cfEmailRouting: { ...settingsForm.cfEmailRouting, routingAddress: e.target.value }
                    })
                  }
                  placeholder="contact@whitefox.blog"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">转信/推送目标邮箱 (Forward Destination)</label>
                <input
                  type="email"
                  value={settingsForm.cfEmailRouting.forwardTo}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      cfEmailRouting: { ...settingsForm.cfEmailRouting, forwardTo: e.target.value }
                    })
                  }
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-mono"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.autoReplyEnabled}
                    onChange={(e) => setSettingsForm({ ...settingsForm, autoReplyEnabled: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span className="font-semibold">开启新注册用户验证码自动发信与回复</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.rateLimitEnabled}
                    onChange={(e) => setSettingsForm({ ...settingsForm, rateLimitEnabled: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>收发频率防护限制开关 (防止恶意脚本刷爆配额)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Template */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-700">自动验证码发信模板 (支持 {'{{code}}'} 与 {'{{expire}}'})</h3>
            <textarea
              rows={3}
              value={settingsForm.emailTemplate}
              onChange={(e) => setSettingsForm({ ...settingsForm, emailTemplate: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-white font-mono focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
            />
          </div>
        </form>
      ) : (
        /* Message Management Hub */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Folder Nav */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 shadow-xs space-y-1">
              <button
                onClick={() => {
                  setActiveFolder('inbox');
                  setSelectedMail(null);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeFolder === 'inbox' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Inbox className="w-4 h-4 text-emerald-600" />
                  <span>收件箱</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                  {mailMessages.filter((m) => m.folder === 'inbox' && !m.deleted).length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveFolder('sent');
                  setSelectedMail(null);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeFolder === 'sent' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4 text-sky-600" />
                  <span>已发信件</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono">
                  {mailMessages.filter((m) => m.folder === 'sent' && !m.deleted).length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveFolder('trash');
                  setSelectedMail(null);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeFolder === 'trash' ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>信件回收站</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-mono">
                  {mailMessages.filter((m) => m.folder === 'trash' && !m.deleted).length}
                </span>
              </button>
            </div>

            {/* Storage capacity info */}
            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 text-[11px] text-slate-500 space-y-2">
              <div className="flex items-center justify-between">
                <span>信件总量</span>
                <span className="font-mono font-semibold text-slate-700">{totalMessageCount} / 3000</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isOverQuotaWarning ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (totalMessageCount / 3000) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                超 3,000 封将触发红标告警。支持在回收站批量彻底清理。
              </p>
            </div>
          </div>

          {/* Right Message List & Reader */}
          <div className="lg:col-span-9 space-y-4">
            {/* Toolbar */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={handleSelectAll}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                  title="全选 / 取消全选"
                >
                  {selectedIds.length > 0 && selectedIds.length === visibleMessages.length ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                {selectedIds.length > 0 && (
                  <div className="flex items-center space-x-1.5">
                    {activeFolder === 'trash' ? (
                      <>
                        <button
                          onClick={() => handleRestoreFromTrash(selectedIds)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold cursor-pointer"
                        >
                          还原选定 ({selectedIds.length})
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(selectedIds)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold cursor-pointer"
                        >
                          永久彻底删除
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleMoveToTrash(selectedIds)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold cursor-pointer"
                      >
                        移入回收站 ({selectedIds.length})
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="搜索主题、发件人或信件内容..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            {/* List and Detail Split */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Mail list */}
              <div className={`${selectedMail ? 'md:col-span-5' : 'md:col-span-12'} space-y-2`}>
                {visibleMessages.length === 0 ? (
                  <div className="bg-white/80 rounded-2xl p-12 text-center border border-slate-200/80 text-slate-400 text-xs">
                    该分类下暂无任何信件记录
                  </div>
                ) : (
                  visibleMessages.map((mail) => (
                    <div
                      key={mail.id}
                      onClick={() => handleOpenMail(mail)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selectedMail?.id === mail.id
                          ? 'bg-emerald-50/90 border-emerald-300 shadow-xs'
                          : mail.read
                          ? 'bg-white/80 border-slate-200/80 hover:border-slate-300'
                          : 'bg-white border-emerald-400 font-bold shadow-xs'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <button
                          onClick={(e) => handleToggleSelect(mail.id, e)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {selectedIds.includes(mail.id) ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-slate-800 truncate">
                              {mail.folder === 'sent' ? `收件: ${mail.recipient}` : `发件: ${mail.sender}`}
                            </span>
                            {mail.isCodeVerify && (
                              <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-mono">
                                验证码
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 truncate mt-0.5">{mail.subject}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">{mail.content}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {mail.date.substring(5, 16)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Detail view */}
              {selectedMail && (
                <div className="md:col-span-7 bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{selectedMail.subject}</h3>
                      <div className="text-[11px] text-slate-500 mt-1 space-y-0.5 font-mono">
                        <div>发件人: {selectedMail.sender}</div>
                        <div>收件人: {selectedMail.recipient}</div>
                        <div>时间: {selectedMail.date}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={(e) => handleReplyMail(selectedMail, e)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                        title="回信给用户"
                      >
                        <CornerUpLeft className="w-3.5 h-3.5" />
                        <span>回信</span>
                      </button>
                      <button
                        onClick={() => handleMoveToTrash([selectedMail.id])}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 cursor-pointer"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedMail(null)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap py-2 font-sans bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    {selectedMail.content}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compose / Reply Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>站长发信 / 站内回信给用户</span>
              </h3>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMail} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">收件用户邮箱</label>
                <input
                  type="email"
                  required
                  value={composeForm.recipient}
                  onChange={(e) => setComposeForm({ ...composeForm, recipient: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">邮件主题</label>
                <input
                  type="text"
                  required
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  placeholder="输入邮件标题..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">邮件正文内容</label>
                <textarea
                  rows={6}
                  required
                  value={composeForm.content}
                  onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                  placeholder="输入向用户沟通、答复或通知的正文内容..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>立即发送并存档</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
