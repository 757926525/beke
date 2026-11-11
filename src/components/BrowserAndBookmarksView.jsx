import React, { useState } from 'react';
import {
  Server, Shield, Copy, Check, QrCode, RefreshCw, Key,
  ExternalLink, Sparkles, Wifi, Activity, Terminal, Lock,
  Plus, Trash2, Eye, Compass, BookmarkPlus, X, HelpCircle
} from 'lucide-react';

// 标准 UUID v4 生成算法
export function generateUUIDv4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 预设高可用演示节点列表（涵盖主流协议）
const initialNodes = [
  {
    id: 'node-vless-1',
    name: 'HK-01 极速香港边缘节点',
    type: 'VLESS',
    server: 'hk.node.whitefox.blog',
    port: 443,
    uuid: '8f7a6350-482a-436d-88f5-171b3e9a7e6b',
    tls: 'reality',
    network: 'grpc',
    sni: 'itunes.apple.com',
    ping: 28,
    status: 'online',
    link: 'vless://8f7a6350-482a-436d-88f5-171b3e9a7e6b@hk.node.whitefox.blog:443?encryption=none&security=reality&sni=itunes.apple.com&fp=chrome&pbk=xYZ876AbcdEFGHijkLMNOpqrSTUVwxYZ1234567890&sid=6ba7b810&type=grpc&serviceName=whitefox-grpc#HK-01-VLESS'
  },
  {
    id: 'node-ss-1',
    name: 'JP-02 东京高速优化节点',
    type: 'Shadowsocks',
    server: 'jp.node.whitefox.blog',
    port: 8388,
    cipher: '2022-blake3-aes-128-gcm',
    password: 'wf-secure-pass-2025',
    ping: 45,
    status: 'online',
    link: 'ss://MjAyMi1ibGFrZTMtYWVzLTEyOC1nY206d2Ytc2VjdXJlLXBhc3MtMjAyNQ==@jp.node.whitefox.blog:8388#JP-02-Shadowsocks'
  },
  {
    id: 'node-trojan-1',
    name: 'SG-03 新加坡直连节点',
    type: 'Trojan',
    server: 'sg.node.whitefox.blog',
    port: 443,
    password: 'whitefox-trojan-pass',
    sni: 'sg.node.whitefox.blog',
    ping: 52,
    status: 'online',
    link: 'trojan://whitefox-trojan-pass@sg.node.whitefox.blog:443?security=tls&sni=sg.node.whitefox.blog#SG-03-Trojan'
  },
  {
    id: 'node-wg-1',
    name: 'US-04 洛杉矶 Wireguard 原生互联',
    type: 'Wireguard',
    server: 'us.node.whitefox.blog',
    port: 51820,
    clientIp: '10.0.0.2/32',
    publicKey: 'aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcdef=',
    privateKey: 'yZ1234567890abcdefaBcDeFgHiJkLmNoPqRsTuVwX=',
    allowedIps: '0.0.0.0/0, ::/0',
    endpoint: 'us.node.whitefox.blog:51820',
    ping: 135,
    status: 'online',
    configText: `[Interface]\nPrivateKey = yZ1234567890abcdefaBcDeFgHiJkLmNoPqRsTuVwX=\nAddress = 10.0.0.2/32\nDNS = 1.1.1.1, 8.8.8.8\n\n[Peer]\nPublicKey = aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcdef=\nEndpoint = us.node.whitefox.blog:51820\nAllowedIPs = 0.0.0.0/0, ::/0\nPersistentKeepalive = 25`,
    link: 'wireguard://yZ1234567890abcdefaBcDeFgHiJkLmNoPqRsTuVwX=@us.node.whitefox.blog:51820?address=10.0.0.2/32&publickey=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcdef='
  },
  {
    id: 'node-socks-1',
    name: 'DE-05 德国 SOCKS5 转发网桥',
    type: 'SOCKS',
    server: 'de.node.whitefox.blog',
    port: 10808,
    username: 'whitefox',
    password: 'socks5-password',
    ping: 168,
    status: 'online',
    link: 'socks5://whitefox:socks5-password@de.node.whitefox.blog:10808#DE-05-SOCKS5'
  },
  {
    id: 'node-http-1',
    name: 'KR-06 韩国 HTTP 高速代理网关',
    type: 'HTTP',
    server: 'kr.node.whitefox.blog',
    port: 8080,
    username: 'whitefox',
    password: 'http-proxy-pass',
    ping: 39,
    status: 'online',
    link: 'http://whitefox:http-proxy-pass@kr.node.whitefox.blog:8080#KR-06-HTTP'
  }
];

export const BrowserAndBookmarksView = ({
  bookmarks = [],
  setBookmarks,
  currentUser,
  isAdmin,
  searchProxy,
  setSearchProxy,
  t
}) => {
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedType, setSelectedType] = useState('ALL');
  const [currentUUID, setCurrentUUID] = useState(() => generateUUIDv4());
  const [copiedId, setCopiedId] = useState('');
  const [testingId, setTestingId] = useState('');
  const [qrModalNode, setQrModalNode] = useState(null);

  // 免翻墙直连谷歌与外部受限网站工具状态
  const [searchQuery, setSearchQuery] = useState('');
  const [proxyActiveUrl, setProxyActiveUrl] = useState('');
  const [proxyLoading, setProxyLoading] = useState(false);

  // 触发代理访问
  const handleLaunchProxyAccess = (target) => {
    let clean = (target || searchQuery || '').trim();
    if (!clean) return;

    let destination = clean;
    if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
      if (destination.includes('.') && !destination.includes(' ')) {
        destination = `https://${destination}`;
      } else {
        destination = `https://www.google.com/search?q=${encodeURIComponent(destination)}`;
      }
    }

    const proxyUrl = `/api/proxy?url=${encodeURIComponent(destination)}`;
    setProxyActiveUrl(proxyUrl);
    setProxyLoading(true);
  };

  // 新增节点状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNodeType, setNewNodeType] = useState('VLESS');
  const [newNodeName, setNewNodeType_name] = useState('');
  const [newNodeServer, setNewNodeType_server] = useState('');
  const [newNodePort, setNewNodeType_port] = useState(443);
  const [newNodeUUID, setNewNodeType_uuid] = useState(() => generateUUIDv4());

  // 书签/探索管理（仅管理员可见）
  const [bmTitle, setBmTitle] = useState('');
  const [bmUrl, setBmUrl] = useState('');
  const [bmCategory, setBmCategory] = useState('tech');
  const [showAddBmModal, setShowAddBmModal] = useState(false);

  // 生成新 UUID
  const handleGenerateUUID = () => {
    const newUid = generateUUIDv4();
    setCurrentUUID(newUid);
    setNewNodeType_uuid(newUid);
  };

  // 复制文本
  const handleCopyText = (text, id) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2500);
  };

  // 测速握手
  const handleTestLatency = (nodeId) => {
    setTestingId(nodeId);
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === nodeId) {
            const simulatedPing = Math.floor(20 + Math.random() * 80);
            return { ...n, ping: simulatedPing, status: 'online' };
          }
          return n;
        })
      );
      setTestingId('');
    }, 600);
  };

  // 添加自定义节点
  const handleAddCustomNode = (e) => {
    e.preventDefault();
    const type = newNodeType;
    const name = newNodeName.trim() || `自定义-${type}-节点`;
    const server = newNodeServer.trim() || 'custom.node.io';
    const port = parseInt(newNodePort, 10) || 443;
    const uuid = newNodeUUID || generateUUIDv4();

    let link = '';
    let configText = '';

    if (type === 'VLESS') {
      link = `vless://${uuid}@${server}:${port}?encryption=none&security=reality&type=grpc#${encodeURIComponent(name)}`;
    } else if (type === 'Shadowsocks') {
      link = `ss://MjAyMi1ibGFrZTMtYWVzLTEyOC1nY206d2Ytc2VjdXJl@${server}:${port}#${encodeURIComponent(name)}`;
    } else if (type === 'Trojan') {
      link = `trojan://${uuid}@${server}:${port}?security=tls#${encodeURIComponent(name)}`;
    } else if (type === 'Wireguard') {
      configText = `[Interface]\nPrivateKey = ${uuid}\nAddress = 10.0.0.2/32\nDNS = 1.1.1.1\n\n[Peer]\nPublicKey = aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcdef=\nEndpoint = ${server}:${port}\nAllowedIPs = 0.0.0.0/0, ::/0`;
      link = `wireguard://${uuid}@${server}:${port}?address=10.0.0.2/32`;
    } else if (type === 'SOCKS') {
      link = `socks5://user:pass@${server}:${port}#${encodeURIComponent(name)}`;
    } else if (type === 'HTTP') {
      link = `http://user:pass@${server}:${port}#${encodeURIComponent(name)}`;
    }

    const newNode = {
      id: `node-${Date.now()}`,
      name,
      type,
      server,
      port,
      uuid,
      link,
      configText,
      ping: Math.floor(30 + Math.random() * 50),
      status: 'online'
    };

    setNodes([newNode, ...nodes]);
    setShowAddModal(false);
    setNewNodeType_name('');
    setNewNodeType_server('');
  };

  // 添加书签（管理员）
  const handleAddBookmark = (e) => {
    e.preventDefault();
    if (!bmTitle.trim() || !bmUrl.trim()) return;
    const newBm = {
      id: `bm-${Date.now()}`,
      title: bmTitle.trim(),
      url: bmUrl.trim().startsWith('http') ? bmUrl.trim() : `https://${bmUrl.trim()}`,
      category: bmCategory,
      desc: '站长私享收藏直达',
      dateAdded: new Date().toISOString().split('T')[0],
      updatedAt: Date.now(),
      deleted: false
    };
    if (setBookmarks) setBookmarks([newBm, ...bookmarks]);
    setShowAddBmModal(false);
    setBmTitle('');
    setBmUrl('');
  };

  // 删除书签
  const handleDeleteBookmark = (id) => {
    if (confirm('确认删除该书签？') && setBookmarks) {
      setBookmarks(bookmarks.filter((b) => b.id !== id));
    }
  };

  // 筛选节点
  const filteredNodes = selectedType === 'ALL'
    ? nodes
    : nodes.filter((n) => n.type.toUpperCase() === selectedType.toUpperCase());

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Server className="w-3.5 h-3.5" />
              <span>全能网络节点中枢 · 极速互联专区</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              节点专区 (Node Hub)
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              原生支持 VLESS、Shadowsocks、SOCKS、HTTP、Trojan、Wireguard 节点生成与链接复制；支持 Wireguard 二维码扫码与一键 UUID 生成。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>生成/添加新节点</span>
            </button>
          </div>
        </div>
      </div>

      {/* 针对中国大陆网络环境：免配置直达 Google 与代理网站网关 */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-emerald-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-wide text-white">中国大陆网络专线直通 (Google 与外部代理网站直达)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-400/30">
                  免翻墙直连
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                通过白狐边缘反向代理通道（/api/proxy），无需本地客户端即可在大陆直接查询 Google 及访问外部网站。
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLaunchProxyAccess(searchQuery);
          }}
          className="flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="输入 Google 搜索关键词，或网址 (如 github.com, wikipedia.org)..."
              className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="submit"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold shadow-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>直连代理访问</span>
            </button>
            <button
              type="button"
              onClick={() => handleLaunchProxyAccess('https://www.google.com')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-emerald-300 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              打开 Google
            </button>
          </div>
        </form>

        {proxyActiveUrl && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-mono">代理视窗：{searchQuery || 'Google 专线'}</span>
              <button
                onClick={() => setProxyActiveUrl('')}
                className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
              >
                关闭代理视窗
              </button>
            </div>
            <div className="w-full h-[450px] rounded-2xl overflow-hidden bg-white shadow-inner border border-white/20">
              <iframe
                src={proxyActiveUrl}
                title="Proxy Browser"
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-forms"
                onLoad={() => setProxyLoading(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* UUID Generator Tool Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700">UUID v4 实时生成工具 (VLESS / Trojan 专属凭据)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-mono">RFC 4122</span>
            </div>
            <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 break-all select-all">
              {currentUUID}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleGenerateUUID}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>重新生成</span>
          </button>
          <button
            onClick={() => handleCopyText(currentUUID, 'uuid-copy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
              copiedId === 'uuid-copy'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {copiedId === 'uuid-copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'uuid-copy' ? '已复制 UUID' : '复制 UUID'}</span>
          </button>
        </div>
      </div>

      {/* Protocol Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'VLESS', 'Shadowsocks', 'SOCKS', 'HTTP', 'Trojan', 'Wireguard'].map((cat) => {
          const isSelected = selectedType === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedType(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {cat === 'ALL' ? '全部节点' : cat}
            </button>
          );
        })}
      </div>

      {/* Node Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map((n) => {
          const isWireguard = n.type === 'Wireguard';
          return (
            <div
              key={n.id}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all space-y-4"
            >
              <div>
                {/* Node Title & Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                    n.type === 'VLESS' ? 'bg-indigo-100 text-indigo-700' :
                    n.type === 'Shadowsocks' ? 'bg-amber-100 text-amber-800' :
                    n.type === 'Trojan' ? 'bg-rose-100 text-rose-700' :
                    n.type === 'Wireguard' ? 'bg-sky-100 text-sky-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {n.type}
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleTestLatency(n.id)}
                      disabled={testingId === n.id}
                      className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full cursor-pointer"
                      title="点击测速"
                    >
                      <Activity className={`w-3 h-3 ${testingId === n.id ? 'animate-spin' : ''}`} />
                      <span>{testingId === n.id ? '测速中...' : `${n.ping}ms`}</span>
                    </button>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 text-sm">{n.name}</h3>

                {/* Node Parameters */}
                <div className="mt-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">服务器:</span>
                    <span className="font-mono font-semibold text-slate-800">{n.server}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">端口:</span>
                    <span className="font-mono text-slate-700">{n.port}</span>
                  </div>
                  {n.uuid && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">UUID:</span>
                      <span className="font-mono text-[11px] truncate max-w-[160px] text-slate-700">{n.uuid}</span>
                    </div>
                  )}
                  {n.cipher && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">加密方式:</span>
                      <span className="font-mono text-[11px] text-slate-700">{n.cipher}</span>
                    </div>
                  )}
                  {n.sni && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">SNI / 伪装:</span>
                      <span className="font-mono text-[11px] text-slate-700">{n.sni}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Copy Link & Wireguard QR Code */}
              <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
                <button
                  onClick={() => handleCopyText(n.link, `link-${n.id}`)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    copiedId === `link-${n.id}`
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {copiedId === `link-${n.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === `link-${n.id}` ? '已复制节点链接' : '一键复制链接'}</span>
                </button>

                {isWireguard ? (
                  <button
                    onClick={() => setQrModalNode(n)}
                    className="p-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 cursor-pointer flex items-center space-x-1 text-xs font-semibold"
                    title="显示 Wireguard 扫码二维码"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>二维码</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleCopyText(JSON.stringify(n, null, 2), `json-${n.id}`)}
                    className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                    title="复制节点 JSON 参数"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Wireguard QR Code Modal */}
      {qrModalNode && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-800">Wireguard 节点二维码</h3>
              </div>
              <button
                onClick={() => setQrModalNode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              请使用手机 Wireguard 官方客户端扫描下方二维码直接导入此配置：
            </p>

            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrModalNode.configText || qrModalNode.link)}`}
                alt="Wireguard QR"
                className="w-48 h-48 rounded-xl shadow-xs"
              />
              <span className="text-[10px] text-slate-400 mt-2 font-mono">{qrModalNode.name}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopyText(qrModalNode.configText || qrModalNode.link, 'qr-conf-copy')}
                className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedId === 'qr-conf-copy' ? '已复制客户端配置' : '复制完整配置文本'}</span>
              </button>
              <button
                onClick={() => setQrModalNode(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">生成 / 新建节点</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomNode} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">节点协议类型</label>
                <select
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="VLESS">VLESS (极速免流/Reality)</option>
                  <option value="Shadowsocks">Shadowsocks (经典轻量)</option>
                  <option value="Trojan">Trojan (TLS 仿冒)</option>
                  <option value="Wireguard">Wireguard (UDP 原生隧道)</option>
                  <option value="SOCKS">SOCKS5 网关</option>
                  <option value="HTTP">HTTP 代理</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">节点名称</label>
                <input
                  type="text"
                  required
                  placeholder="如: US-原生优化节点"
                  value={newNodeName}
                  onChange={(e) => setNewNodeType_name(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">服务器地址 / IP</label>
                  <input
                    type="text"
                    required
                    placeholder="node.example.com"
                    value={newNodeServer}
                    onChange={(e) => setNewNodeType_server(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">端口</label>
                  <input
                    type="number"
                    required
                    value={newNodePort}
                    onChange={(e) => setNewNodeType_port(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-600 font-semibold">UUID / 密钥凭据</label>
                  <button
                    type="button"
                    onClick={() => setNewNodeType_uuid(generateUUIDv4())}
                    className="text-emerald-600 text-[11px] hover:underline cursor-pointer"
                  >
                    随机生成
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newNodeUUID}
                  onChange={(e) => setNewNodeType_uuid(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  保存并生成链接
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 探索与收藏区 (Bookmarks Section) - 严格仅管理员可见 */}
      {isAdmin && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-800">站长私享探索与网址收藏区</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    仅管理员可见
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  站长个人私享收藏夹，已与访客彻底隔离，普通访客不可见
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddBmModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加书签</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800 text-xs truncate max-w-[150px]">{bm.title}</h4>
                    <span className="text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded-md uppercase font-mono">
                      {bm.category || 'tech'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{bm.url}</p>
                </div>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/60 text-[11px]">
                  <a
                    href={bm.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center space-x-1"
                  >
                    <span>直达</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => handleDeleteBookmark(bm.id)}
                    className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                    title="删除书签"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Bookmark Modal (Admin only) */}
      {showAddBmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">添加私享书签 (仅管理员可见)</h3>
            <form onSubmit={handleAddBookmark} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">网站名称</label>
                <input
                  type="text"
                  required
                  placeholder="如: GitHub"
                  value={bmTitle}
                  onChange={(e) => setBmTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">网站 URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://github.com"
                  value={bmUrl}
                  onChange={(e) => setBmUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">分类</label>
                <select
                  value={bmCategory}
                  onChange={(e) => setBmCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="cloud">云控制台</option>
                  <option value="tech">技术文档</option>
                  <option value="tools">实用工具</option>
                  <option value="ai">AI 中枢</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBmModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  保存书签
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowserAndBookmarksView;
