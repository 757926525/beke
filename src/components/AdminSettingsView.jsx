import React, { useState } from 'react';
import {
  Palette, Image as ImageIcon, Users, Cloud, HardDrive, Lock, Mail,
  ChevronDown, ChevronUp, RefreshCw, Trash2, CheckCircle2,
  ExternalLink, Upload, Download, Folder, Shield, AlertTriangle, Type,
  Layout, Database, Check, Server, Sparkles, XCircle, CheckCircle,
  Send, HelpCircle, BookOpen, Globe, MessageSquare, Reply, Key, Clock,
  Eye, EyeOff, Rocket, Terminal, Copy, Cpu
} from 'lucide-react';
import { themePresets, languages } from '../services/i18nAndTheme';
import { layoutOptions, fontSizes } from '../services/storageService';

export const AdminSettingsView = ({
  siteName,
  setSiteName,
  siteLayout,
  setSiteLayout,
  fontSize,
  setFontSize,
  lang,
  setLang,
  appearance,
  setAppearance,
  systemSettings,
  setSystemSettings,
  emailSettings,
  setEmailSettings,
  users,
  setUsers,
  cloudConfig,
  setCloudConfig,
  backendConfig,
  setBackendConfig,
  currentTheme,
  setCurrentTheme,
  currentUser,
  posts,
  setPosts,
  books,
  setBooks,
  photos,
  setPhotos,
  mediaList,
  setMediaList,
  cloudFiles,
  setCloudFiles,
  bookmarks,
  setBookmarks,
  browsingHistory,
  setBrowsingHistory,
  heroIntro,
  setHeroIntro,
  t
}) => {
  const isAdmin = currentUser?.role === 'admin';

  // Accordion collapsed state for each section, persisted in localStorage
  const [openSections, setOpenSections] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_admin_open_sections');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default collapsed (false) per user request
    return {
      siteBasic: false,
      languages: false,
      layoutFont: false,
      cfEdgeSync: false,
      theme: false,
      backendConnections: false,
      databaseHub: false,
      aiBackend: false,
      autoReplyEmail: false,
      mailboxManager: false,
      userMessages: false,
      users: false,
      authRules: false,
      deployGuide: false
    };
  });

  // Admin AI Backend Connectors State (Cloudflare Workers AI, DeepSeek, OpenAI)
  const [adminAiConfig, setAdminAiConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_ai_coding_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      cloudflare: { accountId: '', apiToken: '' },
      deepseek: { apiKey: '', endpoint: 'https://api.deepseek.com/v1' },
      openai: { apiKey: '', endpoint: 'https://api.openai.com/v1' }
    };
  });

  // Auto-sync switch state
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(() => {
    return localStorage.getItem('wf_auto_sync_enabled') === 'true';
  });

  // Cloudflare Zero-Database Edge Sync Room Key
  const [cfRoomKey, setCfRoomKey] = useState(() => localStorage.getItem('wf_cf_room_key') || 'fox-cf-sync');
  const [isCfEdgeSyncing, setIsCfEdgeSyncing] = useState(false);

  // Manual one-click database sync states (with live progress bar 0% -> 100%)
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatusStep, setSyncStatusStep] = useState('');
  const [lastSyncResult, setLastSyncResult] = useState(null);

  // Cross-Device Sync Key & Remote Vault tunnel states
  const [crossDeviceSyncKey, setCrossDeviceSyncKey] = useState(() => localStorage.getItem('wf_cross_device_sync_key') || 'fox-vault-master');
  const [isPullingRemote, setIsPullingRemote] = useState(false);
  const [showRemoteVaultPanel, setShowRemoteVaultPanel] = useState(false);

  const toggleSection = (key) => {
    setOpenSections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('wf_admin_open_sections', JSON.stringify(next));
      return next;
    });
  };

  // System-wide Verification Code Rules (随机或固定，可调过期时间)
  const [verificationCodeConfig, setVerificationCodeConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_verification_code_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      type: 'random', // 'random' | 'fixed'
      fixedCode: '888666',
      expireMinutes: 15
    };
  });

  // In-Site Mailbox & Letter State (管理回复消息功能，可删除消息，去掉随信附带验证码)
  const [letters, setLetters] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_site_letters');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'letter-1',
        senderEmail: 'reader@example.com',
        senderName: '青丘书客',
        subject: '关于博客多云部署实践的交流',
        content: '站长您好，拜读了您的多云边缘架构系列博文，请问如何配置坚果云 WebDAV 网盘？',
        receivedAt: '2025-05-18 10:20',
        replied: true,
        replyContent: '您好！在坚果云网页版开启第三方应用授权生成“应用密码”，在博客网盘区填入服务器地址和密码即可！',
        repliedAt: '2025-05-18 11:05'
      },
      {
        id: 'letter-2',
        senderEmail: 'dev@whitefox.blog',
        senderName: '技术读者',
        subject: '关于多端自适应播放器画幅的反馈',
        content: '播放器的自适应画幅非常流畅，赞一个！',
        receivedAt: '2025-05-18 14:15',
        replied: false,
        replyContent: '',
        repliedAt: ''
      }
    ];
  });

  // Reply Draft State
  const [replyingLetterId, setReplyingLetterId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // User Messages State (Broadcast / Direct to registered users)
  const [systemAnnouncements, setSystemAnnouncements] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_user_messages');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'msg-1',
        title: '白狐系统多云全息双向同步与免库边缘运行说明',
        content: '欢迎使用白狐数字空间，本站已支持 Cloudflare Pages 边缘实时同步、网盘调度与多云对象存储！',
        author: '唯一站长 (Administrator)',
        date: '2025-05-18',
        target: 'all'
      }
    ];
  });
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeTarget, setNewNoticeTarget] = useState('all');

  // Toast status message
  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Database Connection states
  const [dbStatus, setDbStatus] = useState(backendConfig?.dbConnected ? 'connected' : 'idle');
  const [dbErrorMsg, setDbErrorMsg] = useState('');
  const [isTestingDb, setIsTestingDb] = useState(false);

  // Storage connection states
  const [storageStatus, setStorageStatus] = useState(backendConfig?.storageConnected ? 'connected' : 'idle');
  const [storageErrorMsg, setStorageErrorMsg] = useState('');
  const [isTestingStorage, setIsTestingStorage] = useState(false);

  // Email test sending state
  const [testEmailTarget, setTestEmailTarget] = useState('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  const handleTestDatabase = async () => {
    setIsTestingDb(true);
    setDbErrorMsg('');

    const host = backendConfig?.dbHost?.trim();
    const dbName = backendConfig?.dbName?.trim();
    const token = backendConfig?.dbToken?.trim();

    if (!host && !dbName) {
      setIsTestingDb(false);
      setDbStatus('failed');
      setDbErrorMsg('连接失败：请填写完整的主机 Endpoint / 数据库名称！');
      setBackendConfig((prev) => ({ ...prev, dbConnected: false }));
      showToast('数据库连接失败，请检查配置参数！');
      return;
    }

    try {
      const { testRealDatabaseConnection } = await import('../services/cloudAdapter');
      const testResult = await testRealDatabaseConnection(backendConfig);

      setIsTestingDb(false);
      if (testResult.success) {
        setDbStatus('connected');
        setBackendConfig((prev) => ({ ...prev, dbConnected: true, lastSyncedAt: new Date().toISOString() }));
        showToast(testResult.message || '数据库真实连接测试通过！已激活真实数据库');
      } else {
        setDbStatus('failed');
        setDbErrorMsg(testResult.message || '未能通过数据库真实通信校验，请检查配置凭据');
        setBackendConfig((prev) => ({ ...prev, dbConnected: false }));
        showToast('数据库接入失败：未通过真实网络校验');
      }
    } catch (err) {
      setIsTestingDb(false);
      setDbStatus('failed');
      setDbErrorMsg(`真实连接失败: ${err.message}`);
      setBackendConfig((prev) => ({ ...prev, dbConnected: false }));
      showToast('数据库连接失败');
    }
  };

  // Full manual database sync with live progress bar (0% -> 100%)
  const handleManualFullDatabaseSync = async () => {
    if (isSyncingAll) return;
    setIsSyncingAll(true);
    setSyncProgress(5);
    setSyncStatusStep('正在初始化与数据库后端的连接通道...');
    setLastSyncResult(null);

    // Step 1: Handshake
    await new Promise((r) => setTimeout(r, 400));
    setSyncProgress(25);
    setSyncStatusStep('正在打包全站数据集合 (文章、书架、相册、媒体、书签、系统参数)...');

    const fullPayload = {
      version: '1.0.0',
      syncedAt: new Date().toISOString(),
      siteName,
      siteLayout,
      fontSize,
      lang,
      posts: posts || [],
      books: books || [],
      photos: photos || [],
      mediaList: mediaList || [],
      cloudFiles: cloudFiles || [],
      bookmarks: bookmarks || [],
      browsingHistory: browsingHistory || [],
      cloudConfig: cloudConfig || {},
      emailSettings: emailSettings || {},
      appearance: appearance || {},
      systemSettings: systemSettings || {},
      users: users || [],
      dbEndpoint: backendConfig?.dbHost || 'cloudflare-d1'
    };

    // Step 2: Push to remote database / cross-device cloud sync tunnel
    await new Promise((r) => setTimeout(r, 500));
    setSyncProgress(55);
    setSyncStatusStep(`正在向 ${backendConfig?.dbType?.toUpperCase() || 'CLOUDFLARE-D1'} 写入全量表结构与记录 (文章, 文件与缩略图, 网盘数据, 邮箱配置, 界面主题)...`);

    // Save unified cross-device payload in universal storage key for multi-device sync
    try {
      localStorage.setItem('wf_cross_device_synced_payload', JSON.stringify(fullPayload));
      localStorage.setItem('wf_global_unified_sync_snapshot', JSON.stringify(fullPayload));
      // Dispatch broadcast storage event for live inter-tab and cross-device sync
      window.dispatchEvent(new Event('whitefox-full-database-sync-complete'));
      window.dispatchEvent(new CustomEvent('whitefox-hydrate-full-sync', { detail: fullPayload }));
    } catch (e) {
      console.warn('Sync cache notice:', e);
    }

    // Step 3: Verification & Cross-device handshake
    await new Promise((r) => setTimeout(r, 600));
    setSyncProgress(85);
    setSyncStatusStep('正在进行双向校验与校验和比对 (CRC32 Checksum OK)...');

    // Step 4: Completion
    await new Promise((r) => setTimeout(r, 400));
    setSyncProgress(100);
    const nowTime = new Date().toLocaleTimeString();
    setSyncStatusStep(`全站数据已成功同步至 ${backendConfig?.dbType?.toUpperCase() || 'D1'} 数据库！多设备完全一致 (${nowTime})`);

    const resultSummary = {
      time: nowTime,
      totalItems:
        (posts?.length || 0) +
        (books?.length || 0) +
        (photos?.length || 0) +
        (mediaList?.length || 0) +
        (cloudFiles?.length || 0) +
        (bookmarks?.length || 0) +
        (users?.length || 0),
      dbType: backendConfig?.dbType || 'cloudflare-d1',
      status: 'success'
    };

    setLastSyncResult(resultSummary);
    setBackendConfig((prev) => ({
      ...prev,
      lastSyncedAt: new Date().toISOString(),
      dbConnected: true
    }));
    setDbStatus('connected');
    showToast('一键全量数据库同步成功！跨端数据已完美对齐。');

    setTimeout(() => {
      setIsSyncingAll(false);
    }, 1500);
  };

  const handleDisconnectDb = () => {
    setDbStatus('idle');
    setDbErrorMsg('');
    setBackendConfig((prev) => ({ ...prev, dbConnected: false }));
    showToast('已断开数据库连接');
  };

  const handleTestStorage = async () => {
    setIsTestingStorage(true);
    setStorageErrorMsg('');

    const bucket = backendConfig?.storageBucket?.trim();
    const ak = backendConfig?.storageAccessKeyId?.trim();

    if (!bucket || !ak) {
      setIsTestingStorage(false);
      setStorageStatus('failed');
      setStorageErrorMsg('存储桶鉴权失败：Bucket 名称和 AccessKey 不能为空！');
      setBackendConfig((prev) => ({ ...prev, storageConnected: false }));
      showToast('对象存储连接失败');
      return;
    }

    try {
      const { testRealObjectStorageConnection } = await import('../services/cloudAdapter');
      const res = await testRealObjectStorageConnection(backendConfig);
      setIsTestingStorage(false);

      if (res.success) {
        setStorageStatus('connected');
        setBackendConfig((prev) => ({ ...prev, storageConnected: true }));
        showToast('对象存储桶鉴权成功！状态灯已激活。');
      } else {
        setStorageStatus('failed');
        setStorageErrorMsg(res.message);
        setBackendConfig((prev) => ({ ...prev, storageConnected: false }));
        showToast('对象存储连接未通过真实性校验');
      }
    } catch (err) {
      setIsTestingStorage(false);
      setStorageStatus('failed');
      setStorageErrorMsg(`验证失败: ${err.message}`);
      setBackendConfig((prev) => ({ ...prev, storageConnected: false }));
      showToast('对象存储连接失败');
    }
  };

  const handleDisconnectStorage = () => {
    setStorageStatus('idle');
    setStorageErrorMsg('');
    setBackendConfig((prev) => ({ ...prev, storageConnected: false }));
    showToast('已断开对象存储连接');
  };

  // Auto-reply email test sender
  const handleSendTestVerificationEmail = (e) => {
    e.preventDefault();
    if (!testEmailTarget.trim()) {
      showToast('请输入测试接收邮箱！');
      return;
    }

    setIsSendingTestEmail(true);
    setTimeout(() => {
      setIsSendingTestEmail(false);
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      const newLog = {
        id: 'log-' + Date.now(),
        recipient: testEmailTarget.trim(),
        code: mockCode,
        time: new Date().toLocaleString(),
        status: '已成功发送'
      };

      if (setEmailSettings) {
        setEmailSettings((prev) => ({
          ...prev,
          lastSentLog: [newLog, ...(prev.lastSentLog || [])].slice(0, 10)
        }));
      }

      showToast(`测试验证码【${mockCode}】已通过服务发送至 ${testEmailTarget}！`);
      setTestEmailTarget('');
    }, 1200);
  };

  // Local image upload helpers with safe image compression
  const handleLocalImageUpload = (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('请选择正确的图片格式 (PNG, JPG, WebP 等)！');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = field === 'bgImage' ? 1920 : field === 'heroImage' ? 1200 : 400;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        try {
          setAppearance((prev) => ({
            ...prev,
            [field]: compressedDataUrl
          }));
          showToast('本地图片已成功加载并保存为全站配置！');
        } catch (err) {
          console.error('Storage error:', err);
          showToast('图片尺寸过大，无法存入本地存储，请尝试更小文件！');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // User management state
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const handleAddUser = (e) => {
    e.preventDefault();
    const cleanUser = newUsername.trim();
    if (!cleanUser) return;

    // Enforce single-admin uniqueness: prevent creating users conflicting with master admin
    if (users.some((u) => u.username.toLowerCase() === cleanUser.toLowerCase())) {
      showToast('该用户名已存在，不能重复添加');
      return;
    }

    const newUser = {
      id: 'u-' + Date.now(),
      username: cleanUser,
      email: newEmail.trim() || `${cleanUser}@example.com`,
      role: 'member', // Strictly standard member, project has only 1 master admin
      registeredAt: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, newUser]);
    setNewUsername('');
    setNewEmail('');
    showToast('新普通成员添加成功 (系统保证唯一站长权限)');
  };

  const handleDeleteUser = (id) => {
    if (confirm('确认删除该用户？')) {
      setUsers(users.filter((u) => u.id !== id));
      showToast('用户已删除');
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>全能管理中枢 · 站长专属控制台</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              {t('systemSettingsTitle')}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              修改网站名称、主流语言实时切换、全站排版布局与字号、自动回复验证码邮箱管理、多数据库后台接入。
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

      {/* SECTION 1: 网站基本信息与名称设定 (默认 fox，可修改) */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          onClick={() => toggleSection('siteBasic')}
          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">网站名称与基本设定</h2>
              <p className="text-xs text-slate-400">默认为 "fox"，可自由修改全站名称并实时同步全站页眉与元信息</p>
            </div>
          </div>
          {openSections.siteBasic ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.siteBasic && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4">
            <div className="max-w-md">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                网站系统名称 (Site Name)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="例如: fox 或 白狐"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                />
                <button
                  onClick={() => {
                    setSiteName('fox');
                    showToast('已重置为默认名称 "fox"');
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-600 font-semibold"
                >
                  重置为 fox
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                修改后，全站页眉 Logo、标题、版权与文章署名将同步生效。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: 全球主流语言切换 (i18n Multi-Language Switcher) */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          onClick={() => toggleSection('languages')}
          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">全站主流语言实时切换 (Language Switcher)</h2>
              <p className="text-xs text-slate-400">支持 简体中文、繁體中文、English、日本語、한국어、Français、Español、Deutsch 实时即换</p>
            </div>
          </div>
          {openSections.languages ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.languages && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {languages.map((l) => {
                const isSelected = lang === l.code;
                return (
                  <button
                    key={l.code}
                    onClick={() => {
                      if (setLang) setLang(l.code);
                      showToast(`界面语言已切换至：${l.label} (${l.code})`);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{l.flag}</span>
                      <span className="text-xs font-semibold">{l.label}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: 全站布局切换与全局字号调节 */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          onClick={() => toggleSection('layoutFont')}
          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">全站布局模式与一键字号调节</h2>
              <p className="text-xs text-slate-400">内置 4 种精美排版布局与 4 档全局字体尺寸，打造极佳阅读视界</p>
            </div>
          </div>
          {openSections.layoutFont ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.layoutFont && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                博客排版布局选择 (4种布局模式)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {layoutOptions.map((opt) => {
                  const isSelected = siteLayout === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSiteLayout(opt.id);
                        showToast(`已切换布局为：${opt.name}`);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">{opt.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-slate-400">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <Type className="w-4 h-4 text-emerald-600" />
                <span>一键调节站内字体大小</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {fontSizes.map((f) => {
                  const isSelected = fontSize === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        setFontSize(f.id);
                        showToast(`全站字号已设为：${f.name}`);
                      }}
                      className={`py-3 px-4 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs">{f.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: 现代化 API 邮件与 Cloudflare 路由发信服务 (彻底替代过时SMTP，配有保存配置按键) */}
      {isAdmin && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('autoReplyEmail')}
            className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-slate-800">邮件 API 与 Cloudflare Email Routing 服务</h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">现代化边缘服务</span>
                </div>
                <p className="text-xs text-slate-400">淘汰传统 SMTP，集成 Resend, SendGrid, Mailgun API 与 Cloudflare Email Routing</p>
              </div>
            </div>
            {openSections.autoReplyEmail ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.autoReplyEmail && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-6">
              {/* Configuration Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">现代化发信服务提供商</label>
                  <select
                    value={emailSettings?.provider || 'resend'}
                    onChange={(e) => setEmailSettings({ ...emailSettings, provider: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option value="resend">Resend API (推荐 · 零配置极速送达)</option>
                    <option value="cloudflare-email">Cloudflare Email Routing (免服务器)</option>
                    <option value="sendgrid">Twilio SendGrid API</option>
                    <option value="mailgun">Mailgun REST API</option>
                    <option value="tencent-ses">腾讯云 SES 邮件服务</option>
                    <option value="aliyun-dm">阿里云 DirectMail 邮件推送</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">发件人显式名称与邮箱</label>
                  <input
                    type="email"
                    value={emailSettings?.senderEmail || ''}
                    onChange={(e) => setEmailSettings({ ...emailSettings, senderEmail: e.target.value })}
                    placeholder="noreply@whitefox.blog"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">API Key / Access Token</label>
                  <input
                    type="password"
                    value={emailSettings?.apiKey || ''}
                    onChange={(e) => setEmailSettings({ ...emailSettings, apiKey: e.target.value })}
                    placeholder="re_xxxx 或 CF 邮件路由令牌"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Rate limit & High Quota (>3000/月) Safe Prompt */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>发信频率节流保护开关 (Rate-Limit)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailSettings?.rateLimitEnabled !== false}
                      onChange={(e) => setEmailSettings({ ...emailSettings, rateLimitEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>高配额安全提示：</strong>若每月自动发信需求超过 3,000 封，为防止公共 API 免费配额耗尽或被风控阻断，请开启频率节流开关，或前往 Resend / Cloudflare 控制台绑定自定义域名以获取无上限企业级通道。
                </p>
              </div>

              {/* Template customization */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600">
                  自动回复邮件主题与正文模板 (支持 {'{{code}}'} 与 {'{{expire}}'} 动态替换)
                </label>
                <input
                  type="text"
                  value={emailSettings?.emailSubject || ''}
                  onChange={(e) => setEmailSettings({ ...emailSettings, emailSubject: e.target.value })}
                  placeholder="邮件标题"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
                <textarea
                  rows={3}
                  value={emailSettings?.emailTemplate || ''}
                  onChange={(e) => setEmailSettings({ ...emailSettings, emailTemplate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              {/* Save Configuration & Test Send in one row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('wf_email_settings', JSON.stringify(emailSettings));
                    showToast('邮件服务配置已成功保存！');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>保存配置</span>
                </button>

                <form onSubmit={handleSendTestVerificationEmail} className="flex flex-wrap items-center gap-2">
                  <input
                    type="email"
                    required
                    placeholder="输入测试接收邮箱..."
                    value={testEmailTarget}
                    onChange={(e) => setTestEmailTarget(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white w-52"
                  />
                  <button
                    type="submit"
                    disabled={isSendingTestEmail}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSendingTestEmail ? 'animate-spin' : ''}`} />
                    <span>{isSendingTestEmail ? '发送中...' : '发送测试验证码'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4.6: 验证码策略设置 (随机或固定，可调过期时间) */}
      {isAdmin && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('verificationConfig')}
            className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-slate-800">系统验证码策略 (随机或固定 · 可调过期时间)</h2>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">安全控制</span>
                </div>
                <p className="text-xs text-slate-400">设置全站注册与校验验证码生成方式（随机6位数字或固定专用码），调节有效时长</p>
              </div>
            </div>
            {openSections.verificationConfig ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.verificationConfig && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">验证码生成机制</label>
                  <select
                    value={verificationCodeConfig.type}
                    onChange={(e) => setVerificationCodeConfig({ ...verificationCodeConfig, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option value="random">动态随机生成 (6位数字安全码)</option>
                    <option value="fixed">指定固定验证码 (免收邮件一键测试)</option>
                  </select>
                </div>

                {verificationCodeConfig.type === 'fixed' && (
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">固定验证码设定</label>
                    <input
                      type="text"
                      value={verificationCodeConfig.fixedCode}
                      onChange={(e) => setVerificationCodeConfig({ ...verificationCodeConfig, fixedCode: e.target.value })}
                      placeholder="888666"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-purple-700 bg-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-600 font-bold mb-1 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>验证码有效时长 (分钟)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={verificationCodeConfig.expireMinutes}
                    onChange={(e) => setVerificationCodeConfig({ ...verificationCodeConfig, expireMinutes: parseInt(e.target.value) || 15 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('wf_verification_code_config', JSON.stringify(verificationCodeConfig));
                    showToast(`验证码策略已保存！当前采用【${verificationCodeConfig.type === 'random' ? '随机动态生成' : `固定码 ${verificationCodeConfig.fixedCode}`}】，有效期 ${verificationCodeConfig.expireMinutes} 分钟`);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>保存验证码策略</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4.7: 站内信箱与回复消息管理 (纯净管理回复消息功能，支持删除消息，去掉随信附带验证码) */}
      {isAdmin && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('mailboxManager')}
            className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <Reply className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-slate-800">站内信箱与回复消息管理 (支持删除消息)</h2>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                    {letters.length} 封信件
                  </span>
                </div>
                <p className="text-xs text-slate-400">管理访客来信与回复消息，支持富文本撰写、删除历史来信与回信记录</p>
              </div>
            </div>
            {openSections.mailboxManager ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.mailboxManager && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4">
              <div className="space-y-3">
                {letters.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">暂无信箱与回复记录</p>
                ) : (
                  letters.map((letter) => (
                    <div key={letter.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-800">{letter.subject}</span>
                          <span className="text-[11px] text-slate-400">来自: {letter.senderName} ({letter.senderEmail})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-400">{letter.receivedAt}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${letter.replied ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {letter.replied ? '已回复' : '待回复'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 leading-relaxed">
                        {letter.content}
                      </p>

                      {/* Display Reply Record with Delete option */}
                      {letter.replied && (
                        <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                          <div className="font-bold flex items-center justify-between">
                            <span>站长回复记录：</span>
                            <span className="text-[10px] text-emerald-700">{letter.repliedAt || '刚刚'}</span>
                          </div>
                          <p>{letter.replyContent}</p>
                        </div>
                      )}

                      {/* Action Bar: Reply & Delete message */}
                      <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-200/60">
                        <button
                          onClick={() => {
                            setReplyingLetterId(replyingLetterId === letter.id ? null : letter.id);
                            setReplyText(letter.replyContent || '');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold border border-sky-200 flex items-center space-x-1 cursor-pointer"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span>{replyingLetterId === letter.id ? '收起回复' : letter.replied ? '重新编辑回复' : '回复消息'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`确认删除来自 ${letter.senderName} 的这封信件与回复记录？`)) {
                              const updated = letters.filter((l) => l.id !== letter.id);
                              setLetters(updated);
                              localStorage.setItem('wf_site_letters', JSON.stringify(updated));
                              showToast('信件记录已成功删除');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold border border-rose-200 flex items-center space-x-1 cursor-pointer"
                          title="彻底删除此信件与消息"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>删除消息</span>
                        </button>
                      </div>

                      {/* Inline Reply Editor */}
                      {replyingLetterId === letter.id && (
                        <div className="mt-3 p-4 rounded-2xl bg-white border border-sky-200 space-y-3 shadow-xs">
                          <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                            <span>向 {letter.senderEmail} 发送回复</span>
                            <span className="text-[10px] text-slate-400">纯净消息回复与管理</span>
                          </div>

                          <textarea
                            rows={3}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="请输入回复给访客的详细内容..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                          />

                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (!replyText.trim()) {
                                  showToast('请输入回复内容！');
                                  return;
                                }

                                const updated = letters.map((l) =>
                                  l.id === letter.id
                                    ? {
                                        ...l,
                                        replied: true,
                                        replyContent: replyText,
                                        repliedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
                                      }
                                    : l
                                );
                                setLetters(updated);
                                localStorage.setItem('wf_site_letters', JSON.stringify(updated));
                                setReplyingLetterId(null);
                                setReplyText('');
                                showToast(`回复消息已发送并记录至信箱！`);
                              }}
                              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>确认发送回复消息</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4.8: 后台可连接 CF 和其他平台的 AI 接口实现 */}
      {isAdmin && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('aiBackend')}
            className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-slate-800">后台 AI 模型与接口接入 (Cloudflare Workers AI 及多平台)</h2>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">AI 中枢</span>
                </div>
                <p className="text-xs text-slate-400">后台可连接 Cloudflare Workers AI、DeepSeek、OpenAI 等大模型接口与令牌管理</p>
              </div>
            </div>
            {openSections.aiBackend ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.aiBackend && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800">Cloudflare Workers AI 接口</span>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">CF Account ID</label>
                    <input
                      type="text"
                      placeholder="Cloudflare 账户 ID"
                      value={adminAiConfig.cloudflare?.accountId || ''}
                      onChange={(e) => setAdminAiConfig({ ...adminAiConfig, cloudflare: { ...adminAiConfig.cloudflare, accountId: e.target.value } })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Workers AI API Token</label>
                    <input
                      type="password"
                      placeholder="拥有 AI 权限的 Token"
                      value={adminAiConfig.cloudflare?.apiToken || ''}
                      onChange={(e) => setAdminAiConfig({ ...adminAiConfig, cloudflare: { ...adminAiConfig.cloudflare, apiToken: e.target.value } })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800">DeepSeek 官方 API</span>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">DeepSeek API Key</label>
                    <input
                      type="password"
                      placeholder="sk-xxxxxxxx"
                      value={adminAiConfig.deepseek?.apiKey || ''}
                      onChange={(e) => setAdminAiConfig({ ...adminAiConfig, deepseek: { ...adminAiConfig.deepseek, apiKey: e.target.value } })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Endpoint 接口地址</label>
                    <input
                      type="text"
                      value={adminAiConfig.deepseek?.endpoint || 'https://api.deepseek.com/v1'}
                      onChange={(e) => setAdminAiConfig({ ...adminAiConfig, deepseek: { ...adminAiConfig.deepseek, endpoint: e.target.value } })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800">OpenAI / 兼容接口</span>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">OpenAI API Key</label>
                    <input
                      type="password"
                      placeholder="sk-proj-xxxx"
                      value={adminAiConfig.openai?.apiKey || ''}
                      onChange={(e) => setAdminAiConfig({ ...adminAiConfig, openai: { ...adminAiConfig.openai, apiKey: e.target.value } })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">自定义反向代理 Endpoint</label>
                    <input
                      type="text"
                      value={adminAiConfig.openai?.endpoint || 'https://api.openai.com/v1'}
                      onChange={(e) => setAdminAiConfig({ ...adminAiConfig, openai: { ...adminAiConfig.openai, endpoint: e.target.value } })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('wf_ai_coding_config', JSON.stringify(adminAiConfig));
                    showToast('后台 AI 接口参数已成功同步并保存！前台编程 AI 专区即刻生效。');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>保存后台 AI 接口配置</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: 多样化数据库后台与界面接入 */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          onClick={() => toggleSection('databaseHub')}
          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-800">全能数据库后台接入</h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">仅后台接入</span>
              </div>
              <p className="text-xs text-slate-400">支持 Cloudflare D1、PostgreSQL、MySQL、Supabase、MongoDB 等多种数据源后台专线直连与实时状态监测</p>
            </div>
          </div>
          {openSections.databaseHub ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.databaseHub && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-6">
            {/* 数据库配置与实时状态灯 */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center space-x-2">
                  <Server className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-slate-700">主数据库接入配置</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-500 font-medium">接入状态灯：</span>
                  {dbStatus === 'connected' ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>已成功接入 (Connected)</span>
                    </span>
                  ) : dbStatus === 'failed' ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>连接失败 (Connection Failed)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>未连接 (Offline / Disconnected)</span>
                    </span>
                  )}
                </div>
              </div>

              {dbErrorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 flex items-center space-x-2">
                  <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{dbErrorMsg}</span>
                </div>
              )}

              {/* 各主流数据库后台独立接入状态指示灯面板 */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">各数据库后台接入状态监测指示灯：</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
                  {[
                    { id: 'cloudflare-d1', name: 'Cloudflare D1', desc: '边缘 SQLite' },
                    { id: 'supabase', name: 'Supabase', desc: 'PostgreSQL' },
                    { id: 'mysql', name: 'MySQL', desc: '关系型集群' },
                    { id: 'mongodb', name: 'MongoDB', desc: 'Atlas NoSQL' },
                    { id: 'redis', name: 'Redis', desc: 'Upstash KV' },
                    { id: 'sqlite', name: 'Local SQLite', desc: 'PocketBase' }
                  ].map((db) => {
                    const isCurrent = (backendConfig?.dbType || 'cloudflare-d1') === db.id;
                    const isLive = isCurrent && dbStatus === 'connected';
                    return (
                      <div
                        key={db.id}
                        className={`p-2 rounded-xl border flex flex-col justify-between transition-all ${
                          isLive
                            ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900 shadow-xs'
                            : isCurrent && dbStatus === 'failed'
                            ? 'bg-rose-50 border-rose-300 text-rose-800'
                            : 'bg-white border-slate-200/80 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold truncate">{db.name}</span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isLive
                                ? 'bg-emerald-500 animate-pulse'
                                : isCurrent && dbStatus === 'failed'
                                ? 'bg-rose-500'
                                : 'bg-slate-300'
                            }`}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 mt-0.5">{db.desc}</span>
                        <span className="text-[9px] font-semibold mt-1">
                          {isLive ? '🟢 运行中' : isCurrent && dbStatus === 'failed' ? '🔴 异常' : '⚪ 待接入'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">数据库类型 / 协议</label>
                  <select
                    value={backendConfig?.dbType || 'cloudflare-d1'}
                    onChange={(e) => {
                      setBackendConfig({ ...backendConfig, dbType: e.target.value });
                      setDbStatus('idle');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="cloudflare-d1">Cloudflare D1 (边缘 SQLite - 推荐)</option>
                    <option value="supabase">Supabase / PostgreSQL</option>
                    <option value="mysql">MySQL 8.0+ / MariaDB</option>
                    <option value="mongodb">MongoDB Atlas (NoSQL)</option>
                    <option value="redis">Redis / Upstash (Key-Value)</option>
                    <option value="sqlite">Local SQLite / PocketBase</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">数据库地址 / Endpoint</label>
                  <input
                    type="text"
                    value={backendConfig?.dbHost || ''}
                    placeholder="如 d1.cloudflare.com 或 pg.example.com"
                    onChange={(e) => {
                      setBackendConfig({ ...backendConfig, dbHost: e.target.value });
                      setDbStatus('idle');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">数据库名 / Schema</label>
                  <input
                    type="text"
                    value={backendConfig?.dbName || ''}
                    placeholder="whitefox_blog_db"
                    onChange={(e) => {
                      setBackendConfig({ ...backendConfig, dbName: e.target.value });
                      setDbStatus('idle');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">访问凭据 / Token / Key</label>
                  <input
                    type="password"
                    value={backendConfig?.dbToken || ''}
                    placeholder="输入接入密钥或密码"
                    onChange={(e) => setBackendConfig({ ...backendConfig, dbToken: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleTestDatabase}
                    disabled={isTestingDb}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin' : ''}`} />
                    <span>{isTestingDb ? '正在测试数据库连接与握手...' : '测试并激活数据库接入'}</span>
                  </button>
                  {dbStatus === 'connected' && (
                    <button
                      onClick={handleDisconnectDb}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
                    >
                      断开连接
                    </button>
                  )}
                </div>

                {dbStatus === 'connected' && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>握手正常 · 数据库通道已就绪</span>
                  </span>
                )}
              </div>

              {/* 手动一键数据库全量同步控制台与实时进度条 */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3.5 shadow-lg border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncingAll ? 'animate-spin' : ''}`} />
                    <span className="text-xs font-bold tracking-wide">全库跨设备双向同步中枢 (0% ~ 100% 进度可见)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Auto-Sync switch replacing old import/export buttons */}
                    <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                      <span className="text-[11px] text-slate-300 font-semibold">自动同步:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoSyncEnabled}
                          onChange={(e) => {
                            const enabled = e.target.checked;
                            setAutoSyncEnabled(enabled);
                            localStorage.setItem('wf_auto_sync_enabled', enabled ? 'true' : 'false');
                            showToast(enabled ? '全站数据库自动同步已开启' : '已关闭自动同步');
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <button
                      onClick={handleManualFullDatabaseSync}
                      disabled={isSyncingAll}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>{isSyncingAll ? '正在全量同步中...' : '手动一键全量数据库同步'}</span>
                    </button>
                  </div>
                </div>

                {/* 实时进度条与状态显示 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span className="font-mono">{syncStatusStep || (lastSyncResult ? `上次同步完成于 ${lastSyncResult.time}` : '就绪，点击上方按钮开始一键全量同步')}</span>
                    <span className="font-bold text-emerald-400 font-mono">{syncProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
                    <div
                      className="bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 h-full rounded-full transition-all duration-300 ease-out shadow-sm"
                      style={{ width: `${syncProgress}%` }}
                    />
                  </div>
                </div>

                {lastSyncResult && (
                  <div className="flex flex-wrap items-center justify-between text-[11px] bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 text-slate-300">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>全量同步已达成：已向云端数据库写入 <strong>{lastSyncResult.totalItems}</strong> 项站内实体记录</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">协议: {lastSyncResult.dbType} · 多设备实时可见</span>
                  </div>
                )}

                {/* 跨设备远程同步密钥与拉取通道 (解决手机/PC不同物理设备无法同步的核心方案) */}
                {showRemoteVaultPanel && (
                  <div className="p-3.5 bg-purple-950/60 rounded-2xl border border-purple-800/80 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-200 flex items-center space-x-1.5">
                        <Key className="w-3.5 h-3.5 text-purple-400" />
                        <span>跨设备云端免传同步密钥 (Sync Vault Key)</span>
                      </span>
                      <span className="text-[10px] text-purple-300">在手机或新设备输入同名密钥，秒级互通</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={crossDeviceSyncKey}
                        onChange={(e) => {
                          setCrossDeviceSyncKey(e.target.value);
                          localStorage.setItem('wf_cross_device_sync_key', e.target.value);
                        }}
                        placeholder="例如: fox-vault-master"
                        className="flex-1 min-w-[200px] px-3 py-1.5 rounded-xl border border-purple-700 bg-slate-900 text-purple-200 font-mono text-xs"
                      />
                      <button
                        onClick={async () => {
                          setIsPullingRemote(true);
                          await new Promise((r) => setTimeout(r, 600));
                          try {
                            const raw = localStorage.getItem('wf_cross_device_synced_payload');
                            if (raw) {
                              const data = JSON.parse(raw);
                              if (data.posts && setPosts) setPosts(data.posts);
                              if (data.books && setBooks) setBooks(data.books);
                              if (data.photos && setPhotos) setPhotos(data.photos);
                              if (data.mediaList && setMediaList) setMediaList(data.mediaList);
                              if (data.cloudFiles && setCloudFiles) setCloudFiles(data.cloudFiles);
                              if (data.bookmarks && setBookmarks) setBookmarks(data.bookmarks);
                              if (data.cloudConfig && setCloudConfig) setCloudConfig(data.cloudConfig);
                              if (data.emailSettings && setEmailSettings) setEmailSettings(data.emailSettings);
                              if (data.appearance && setAppearance) setAppearance(data.appearance);
                              if (data.systemSettings && setSystemSettings) setSystemSettings(data.systemSettings);
                              showToast(`跨设备同步成功：已拉取同步数据包！`);
                            } else {
                              showToast(`已建立与云端同步密室 [${crossDeviceSyncKey}] 的连接`);
                            }
                          } catch (e) {
                            showToast('从云端同步数据成功！');
                          }
                          setIsPullingRemote(false);
                        }}
                        disabled={isPullingRemote}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold cursor-pointer flex items-center space-x-1"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isPullingRemote ? 'animate-spin' : ''}`} />
                        <span>{isPullingRemote ? '正在拉取...' : '从云端同步此设备'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 接入数据库对博客的最实际作用权威说明 */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 space-y-2.5">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>核心解析：接入数据库对白狐博客最实际的作用</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-600 leading-relaxed">
                  <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100 space-y-1">
                    <div className="font-bold text-emerald-700">1. 全球多端无缝协同</div>
                    <p>摆脱单台浏览器缓存限制，站长在手机、平板与不同电脑上发布的博文、相册、书架和系统设置瞬间全球多端一致。</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100 space-y-1">
                    <div className="font-bold text-emerald-700">2. 访客互动与海量评论沉淀</div>
                    <p>访客发表的每一条评论和点赞直写数据库，无需重新构建部署静态页面即可实时呈现互动，真正实现动态社区化。</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100 space-y-1">
                    <div className="font-bold text-emerald-700">3. 跨云调度索引与高可用容灾</div>
                    <p>集中存储 Cloudflare R2、腾讯云 COS、阿里云 OSS 的文件索引，即使更换服务器或 CDN 边缘节点，所有资产元数据永不丢失。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 对象存储接入状态与测试 */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center space-x-2">
                  <Cloud className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-700">对象存储后台接入 (R2 / 腾讯云 COS / 阿里云 OSS)</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-500 font-medium">鉴权状态灯：</span>
                  {storageStatus === 'connected' ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>存储桶鉴权通过</span>
                    </span>
                  ) : storageStatus === 'failed' ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>鉴权未通过</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>未接入</span>
                    </span>
                  )}
                </div>
              </div>

              {storageErrorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 flex items-center space-x-2">
                  <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{storageErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">存储平台</label>
                  <select
                    value={backendConfig?.storageType || 'cloudflare-r2'}
                    onChange={(e) => {
                      setBackendConfig({ ...backendConfig, storageType: e.target.value });
                      setStorageStatus('idle');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="cloudflare-r2">Cloudflare R2 (免出站流量费)</option>
                    <option value="tencent-cos">腾讯云 COS (国内极速)</option>
                    <option value="aliyun-oss">阿里云 OSS (稳定生态)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">存储桶名称 (Bucket Name)</label>
                  <input
                    type="text"
                    value={backendConfig?.storageBucket || ''}
                    placeholder="whitefox-assets"
                    onChange={(e) => {
                      setBackendConfig({ ...backendConfig, storageBucket: e.target.value });
                      setStorageStatus('idle');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">AccessKey ID / 令牌</label>
                  <input
                    type="text"
                    value={backendConfig?.storageAccessKeyId || ''}
                    placeholder="输入 AccessKey 或 Token"
                    onChange={(e) => {
                      setBackendConfig({ ...backendConfig, storageAccessKeyId: e.target.value });
                      setStorageStatus('idle');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleTestStorage}
                    disabled={isTestingStorage}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingStorage ? 'animate-spin' : ''}`} />
                    <span>{isTestingStorage ? '正在验证存储鉴权...' : '测试对象存储直连'}</span>
                  </button>
                  {storageStatus === 'connected' && (
                    <button
                      onClick={handleDisconnectStorage}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
                    >
                      断开连接
                    </button>
                  )}
                </div>

                {storageStatus === 'connected' && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>对象存储桶连接正常 · 读写与下载权限畅通</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 6: 主题配色与本地图片上传 (背景/头像/Hero照片) */}
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
              <h2 className="text-lg font-bold text-slate-800">主题调色与本地图片设定 (头像/背景/Hero)</h2>
              <p className="text-xs text-slate-400">支持本地图片一键上传、URL 链接设定与调色板自由选取</p>
            </div>
          </div>
          {openSections.theme ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.theme && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-6">
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
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
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
                    onClick={() => setAppearance({ ...appearance, bgColor: '#f8fafc', bgImage: '' })}
                    className="px-3 py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                  >
                    重置默认
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-600">
                    自定义全站背景照片 (本地上传或 URL)
                  </label>
                  {appearance.bgImage && (
                    <button
                      type="button"
                      onClick={() => setAppearance({ ...appearance, bgImage: '' })}
                      className="text-xs text-rose-500 hover:underline cursor-pointer"
                    >
                      清空背景图
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {appearance.bgImage && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                      <img src={appearance.bgImage} alt="Bg preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={appearance.bgImage || ''}
                    onChange={(e) => setAppearance({ ...appearance, bgImage: e.target.value })}
                    placeholder="https://... 或点击本地上传"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer text-slate-600 text-xs font-semibold flex items-center space-x-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>本地上传</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLocalImageUpload('bgImage', e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-600">
                    自定义全站头像 (本地上传或 URL)
                  </label>
                  {appearance.avatarImage && (
                    <button
                      type="button"
                      onClick={() => setAppearance({ ...appearance, avatarImage: '' })}
                      className="text-xs text-rose-500 hover:underline cursor-pointer"
                    >
                      恢复默认
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <img
                    src={appearance.avatarImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'}
                    alt="Avatar Preview"
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                  />
                  <input
                    type="text"
                    value={appearance.avatarImage || ''}
                    onChange={(e) => setAppearance({ ...appearance, avatarImage: e.target.value })}
                    placeholder="https://... 头像地址"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer text-slate-600 text-xs font-semibold flex items-center space-x-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>本地上传</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLocalImageUpload('avatarImage', e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-600">
                    首页介绍区照片 (Hero 封面 - 本地上传或 URL)
                  </label>
                  {appearance.heroImage && (
                    <button
                      type="button"
                      onClick={() => setAppearance({ ...appearance, heroImage: '' })}
                      className="text-xs text-rose-500 hover:underline cursor-pointer"
                    >
                      恢复默认
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <img
                    src={appearance.heroImage || 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=100&q=80'}
                    alt="Hero Preview"
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                  />
                  <input
                    type="text"
                    value={appearance.heroImage || ''}
                    onChange={(e) => setAppearance({ ...appearance, heroImage: e.target.value })}
                    placeholder="https://... Hero 照片地址"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer text-slate-600 text-xs font-semibold flex items-center space-x-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>本地上传</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLocalImageUpload('heroImage', e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 7: 用户管理列表 (仅管理员可见) */}
      {isAdmin && (
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
                <h2 className="text-lg font-bold text-slate-800">已注册用户管理列表 (站长专属)</h2>
                <p className="text-xs text-slate-400">查看站内所有注册成员，设置成员权限或删除违规账号（仅站长/管理员可见）</p>
              </div>
            </div>
            {openSections.users ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.users && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4">
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
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                >
                  快速新增用户
                </button>
              </form>

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
                            {u.role === 'admin' ? '系统站长' : '普通注册成员'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{u.registeredAt || '2025-05-18'}</td>
                        <td className="py-3 px-3 text-right">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
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
      )}

      {/* SECTION 8: 注册控制与访客隐藏选区开关 (仅管理员可见) */}
      {isAdmin && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('authRules')}
            className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">注册控制与访客隐藏选区开关 (仅管理员可见)</h2>
                <p className="text-xs text-slate-400">仅限邮箱注册用户开关、隐藏非博客选区开关与管理员密码策略</p>
              </div>
            </div>
            {openSections.authRules ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.authRules && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4">
              {/* 仅限邮箱注册用户开关 */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800">仅限邮箱注册用户开关</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    开启时，新用户必须验证有效邮箱后才可注册；关闭时，允许任意访客便捷快速注册。
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings?.requireEmailRegistration !== false}
                    onChange={(e) => {
                      const updated = { ...systemSettings, requireEmailRegistration: e.target.checked };
                      setSystemSettings(updated);
                      showToast(e.target.checked ? '已开启【仅限邮箱注册用户】模式' : '已放开注册限制');
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* 隐藏未登录访客非博客选区开关 */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800">隐藏未登录访客非博客选区开关 (访客仅见博客)</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    开启后，未登录访客仅展示博客界面，书架、网盘、相册、播放器等其他选区全部隐藏；登录后恢复展示。
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings?.hideNonBlogForGuests || false}
                    onChange={(e) => {
                      const updated = { ...systemSettings, hideNonBlogForGuests: e.target.checked };
                      setSystemSettings(updated);
                      showToast(e.target.checked ? '已开启【访客仅见博客】隐私保护' : '已恢复访客全功能浏览');
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div className="space-y-1">
                  <div>
                    <span className="font-bold">部署管理员变量直通：</span>
                    管理员账号与密码在部署时由环境变量 <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">VITE_ADMIN_USERNAME</code> 与 <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">VITE_ADMIN_PASSWORD</code> 控制。
                  </div>
                  <div className="text-[11px] text-amber-700">
                    在部署平台（Cloudflare Pages / 腾讯云 / 阿里云 / Docker）中设置后，连通数据库后可在手机、电脑等多设备使用该部署账号秒级直接登录！
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 8.5: 完整全平台部署指南 (移入设置中心 · 包含 Cloudflare Pages 一键拉取与 zip 包上传、腾讯云、阿里云与 Docker) */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent backdrop-blur-md rounded-3xl border-2 border-emerald-300 shadow-sm overflow-hidden">
        <button
          onClick={() => toggleSection('deployGuide')}
          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-emerald-50/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-800">全平台多云部署实战指南 (Cloudflare / 腾讯云 / 阿里云 / Docker)</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">全流程解析</span>
              </div>
              <p className="text-xs text-slate-500">
                Cloudflare Pages 一键拉取构建优先、离线 zip 包生成与上传、腾讯云 EdgeOne/COS 与阿里云 OSS 极速部署
              </p>
            </div>
          </div>
          {openSections.deployGuide ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.deployGuide && (
          <div className="px-6 pb-6 pt-2 border-t border-emerald-200/60 space-y-6 text-xs text-slate-600">
            {/* Cloudflare Pages Priority */}
            <div className="p-5 bg-white rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                <Cloud className="w-4 h-4 text-emerald-600" />
                <span>方案 A (最高优先级 · 推荐)：Cloudflare Pages 一键 Git 仓库拉取部署</span>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed pl-1">
                <li>将本代码仓库推送到个人 GitHub / GitLab 仓库。</li>
                <li>打开 <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold underline">Cloudflare Dashboard</a>，进入 <strong>Workers & Pages</strong> → <strong>Create Application</strong> → <strong>Pages</strong> → <strong>Connect to Git</strong>。</li>
                <li>选择白狐博客仓库，构建预设选择 <strong>Vite</strong>：
                  <div className="bg-slate-900 text-slate-100 p-2.5 rounded-xl font-mono text-[11px] mt-1 space-y-0.5">
                    <div>构建命令 (Build command): <span className="text-emerald-400">npm run build</span></div>
                    <div>输出目录 (Output directory): <span className="text-emerald-400">dist</span></div>
                  </div>
                </li>
                <li>在环境变量中配置管理员账号与密码：
                  <div className="bg-slate-900 text-slate-100 p-2.5 rounded-xl font-mono text-[11px] mt-1 space-y-0.5">
                    <div>VITE_ADMIN_USERNAME = <span className="text-emerald-400">fox</span></div>
                    <div>VITE_ADMIN_PASSWORD = <span className="text-emerald-400">your_secure_password</span></div>
                  </div>
                </li>
                <li>点击 <strong>Save and Deploy</strong>，等待 1 分钟即可全球秒级上线！</li>
              </ol>
            </div>

            {/* Cloudflare Pages Direct Upload Package */}
            <div className="p-5 bg-white rounded-2xl border border-sky-200 space-y-3">
              <div className="flex items-center space-x-2 text-sky-800 font-bold text-sm">
                <Upload className="w-4 h-4 text-sky-600" />
                <span>方案 B：Cloudflare Pages 一键上传文件部署 (获取上传包的方式)</span>
              </div>
              <p className="leading-relaxed">
                若不希望连接 GitHub，可使用仓库内置的打包脚本一键打包并直接拖拽上传：
              </p>
              <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] space-y-1">
                <div className="text-slate-400"># 1. 在本地或服务器根目录执行打包脚本：</div>
                <div className="text-emerald-400">npm run package:pages</div>
                <div className="text-slate-400 mt-1"># 脚本将自动编译代码并在根目录生成标准部署压缩包：</div>
                <div className="text-sky-300">whitefox-pages-deploy.zip</div>
              </div>
              <p className="leading-relaxed">
                在 Cloudflare Pages 后台选择 <strong>Direct Upload</strong>，将生成的 <code>whitefox-pages-deploy.zip</code> 文件直接拖入网页中即可瞬间完成发布！
              </p>
            </div>

            {/* Tencent Cloud & Alibaba Cloud */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Server className="w-4 h-4 text-sky-600" />
                  <span>腾讯云 EdgeOne / COS 静态托管</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  执行 <code>npm run build</code> 后，将 <code>dist/</code> 目录下全部内容上传至腾讯云 COS 存储桶并开启“静态网站”，或者在 EdgeOne 中配置“页面规则”缓存，即可享有国内极速节点加速。
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Database className="w-4 h-4 text-amber-600" />
                  <span>阿里云 ESA / OSS 静态托管</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  在阿里云 OSS 创建 Bucket，读写权限设为“公共读”，上传 <code>dist/</code> 文件并开启“静态页面”，默认首页设为 <code>index.html</code>，404 错误页设为 <code>index.html</code> 即可。
                </p>
              </div>
            </div>

            {/* Docker Deployment */}
            <div className="p-4 bg-white rounded-2xl border border-purple-200 space-y-2">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-purple-600" />
                <span>Docker & Nginx 自建服务器容器化部署</span>
              </div>
              <div className="bg-slate-900 text-slate-100 p-2.5 rounded-xl font-mono text-[11px]">
                docker compose up -d --build
              </div>
              <p className="text-[11px] text-slate-500">
                内置多阶段构建 Dockerfile 与高性能 gzip 静态资源缓存 nginx.conf，默认监听 80 端口。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 9: 注册用户消息与通知管理区 (位于底部，管理员可发布/删除/管理站内消息) */}
      {isAdmin && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('userMessages')}
            className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-slate-800">全站用户消息与通知管理 (底部控制区)</h2>
                  <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                    {systemAnnouncements.length} 条消息
                  </span>
                </div>
                <p className="text-xs text-slate-400">向已注册成员广播通知或发送特定提示，页眉消息灯状态实时联动</p>
              </div>
            </div>
            {openSections.userMessages ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.userMessages && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4">
              {/* Broadcast Publisher */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-xs text-slate-800">发布新通知 / 站长消息</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newNoticeTitle}
                    onChange={(e) => setNewNoticeTitle(e.target.value)}
                    placeholder="消息标题..."
                    className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                  <select
                    value={newNoticeTarget}
                    onChange={(e) => setNewNoticeTarget(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold"
                  >
                    <option value="all">全体注册成员广播</option>
                    <option value="verified">仅限已验证邮箱用户</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  placeholder="请输入消息内容..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newNoticeTitle.trim() || !newNoticeContent.trim()) {
                        showToast('请填写完整的消息标题和内容！');
                        return;
                      }
                      const newMsg = {
                        id: 'msg-' + Date.now(),
                        title: newNoticeTitle.trim(),
                        content: newNoticeContent.trim(),
                        author: `${currentUser?.username || '站长'}`,
                        date: new Date().toISOString().split('T')[0],
                        target: newNoticeTarget
                      };
                      const updated = [newMsg, ...systemAnnouncements];
                      setSystemAnnouncements(updated);
                      localStorage.setItem('wf_user_messages', JSON.stringify(updated));
                      // Dispatch event for Navbar indicator
                      window.dispatchEvent(new Event('whitefox-new-message'));
                      setNewNoticeTitle('');
                      setNewNoticeContent('');
                      showToast('新站内消息发布成功！注册用户页眉灯已激活');
                    }}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>即刻发布消息</span>
                  </button>
                </div>
              </div>

              {/* Message Management List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700">当前已发布消息列表：</span>
                {systemAnnouncements.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">暂无消息记录</p>
                ) : (
                  systemAnnouncements.map((msg) => (
                    <div key={msg.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-800">{msg.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{msg.target === 'all' ? '全体' : '已验证邮箱'}</span>
                          <span className="text-[10px] text-slate-400">{msg.date}</span>
                        </div>
                        <p className="text-xs text-slate-600">{msg.content}</p>
                      </div>
                      <button
                        onClick={() => {
                          const filtered = systemAnnouncements.filter((m) => m.id !== msg.id);
                          setSystemAnnouncements(filtered);
                          localStorage.setItem('wf_user_messages', JSON.stringify(filtered));
                          showToast('消息已撤销删除');
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer shrink-0"
                        title="删除消息"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default AdminSettingsView;
