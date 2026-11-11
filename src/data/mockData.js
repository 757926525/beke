// Storage keys
const STORAGE_KEYS = {
  ARTICLES: 'wf_articles',
  BOOKMARKED_ARTICLES: 'wf_bookmarked_articles',
  BOOKS: 'wf_books',
  PHOTOS: 'wf_photos',
  PLAYLIST: 'wf_playlist',
  DOWNLOADS: 'wf_downloads',
  WEB_BOOKMARKS: 'wf_web_bookmarks',
  HISTORY: 'wf_history',
  CONFIG: 'wf_cloud_config',
  AUTH: 'wf_auth_state',
  USERS: 'wf_registered_users',
  SYSTEM_SETTINGS: 'wf_system_settings'
};

// Initial system settings
export const defaultSystemSettings = {
  allowRegistration: true,
  adminUsername: (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_ADMIN_USERNAME || import.meta.env?.VITE_INITIAL_ADMIN_USERNAME)) || 'fox',
  adminPassword: (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_PASSWORD || import.meta.env?.PASSWORD || import.meta.env?.VITE_ADMIN_PASSWORD || import.meta.env?.VITE_INITIAL_ADMIN_PASSWORD)) || '123456',
  emailRegistrationEnabled: true,
  emailVerifyCode: '668822',
  smtpServer: 'smtp.qcloudmail.com',
  smtpEmail: 'noreply@whitefox.blog',
  smtpAuthKey: '********'
};

// Default initial articles
export const initialArticles = [
  {
    id: 'post-1',
    title: '青丘夜雪：白狐博客的设计哲学与云原生构建指南',
    summary: '白狐 (WhiteFox) 致力于融合东方古典意蕴与前沿现代云原生技术架构。本篇文章探讨现代博客与云边协同存储的深度实践。',
    content: `## 缘起与美学构建

白狐，灵动而纯粹。在信息爆炸的今天，个人博客早已超越了单纯的文字记录工具，它是思想的殿堂，亦是个人的数字化记忆核心。

本博客平台采用 **React 19 + Vite + Tailwind CSS** 精致打造，具有独特的东方灵狐视觉格调与超流畅的流体响应式交互。

### 云原生与多平台适配
无论身处何处，白狐博客都能在秒级之内就绪：
- **Cloudflare Pages**：全球 Anycast 边缘网络，一键从 GitHub 拉取构建部署，或通过我们精心编写的打包脚本一键上传直推；
- **腾讯云 (EdgeOne / COS / 轻量服务器)**：极速国内 CDN 加速，低时延，高吞吐；
- **阿里云 (ESA / OSS / ECS)**：多可用区容灾，结合对象存储实现静态页面超低成本托管；
- **云端持久化协同**：支持 Cloudflare D1 分布式 SQL 数据库及 R2 / 阿里云 OSS / 腾讯云 COS 对象存储。

### 内置多模态数字空间
1. **智能书架**：支持本地 ePub / PDF / TXT 电子书一键上架，记录阅读进度；
2. **多媒体流光播放器**：支持本地音视频导入播放与外部网络链接直连；
3. **极速下载站**：输入任意网络链接，即可在浏览器端或云端直接进行拉取调度；
4. **全网导航收藏与模拟浏览器**：内置搜索引擎，一键将检索到的好站收录到书架与收藏区。

愿每一位造访这里的游人，都能在白狐的静谧庭院中找到心之所向。`,
    author: '白狐馆主',
    date: '2025-05-18',
    category: '技术视界',
    tags: ['Cloudflare', '多云部署', 'UI美学', 'React'],
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    views: 1280,
    likes: 89,
    isBookmarked: false
  },
  {
    id: 'post-2',
    title: '多云时代的对象存储实践：R2、OSS 与 COS 的互联互通',
    summary: '深入对比 Cloudflare R2、阿里云 OSS 和腾讯云 COS 在静态托管与媒体存储中的性能表现、计费优势及 API 统一封装实践。',
    content: `## 对象存储：数字化世界的基石

在现代 Web 架构中，静态资源与动态运算分离已成为标准范式。白狐博客架构设计之初便确立了“多端兼容、去供应商绑定”的设计准则。

### 1. Cloudflare R2: 零出口费用的破局者
R2 凭借其 **S3 API 兼容性** 和 **零出口流量费 (Zero Egress Fees)** 成为全球媒体分发的理想选择。无论是图片相册还是电子书文件，放置于 R2 上均可免除昂贵流量账单的后顾之忧。

### 2. 腾讯云 COS & 阿里云 OSS: 国内访问的极速之选
针对国内用户群体，腾讯云 COS 配合 EdgeOne 或内容分发网络 CDN，阿里云 OSS 配合 ESA 能够带来低于 30ms 的极速加载体验。

### 3. 白狐统一适配层 (Universal Storage Engine)
白狐博客在前端和服务端构建了透明抽象层：
\`\`\`javascript
const storage = getStorageAdapter({
  provider: 'r2', // 'cos' | 'oss' | 'd1'
  bucket: 'whitefox-media',
  endpoint: 'https://xxx.r2.cloudflarestorage.com'
});
await storage.uploadFile(file);
\`\`\`
所有相册照片、电子书以及导出的书签配置，皆可一键安全备份至你的专属云空间。`,
    author: '白狐馆主',
    date: '2025-05-15',
    category: '云原生实践',
    tags: ['对象存储', 'R2', 'COS', 'OSS'],
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    views: 860,
    likes: 64,
    isBookmarked: false
  },
  {
    id: 'post-3',
    title: '数字花园漫步：构建随身私有书架与网络收藏枢纽',
    summary: '信息碎片化时代，如何将高质量电子书、网络长文、影视媒体高效整合并永久保存？白狐个人数字中心全攻略。',
    content: `## 告别信息焦虑，建立你的私人书房

现代人的阅读习惯经常分散在微信读书、Kindle、各种浏览器书签以及各大社交平台的收藏夹中。白狐博客不仅是一座发表思考的展示台，更是属于你个人的全能信息枢纽。

### 书架功能与本地化管理
- 随时上传本地的 ePub、PDF、TXT 读物；
- 阅读进度离线缓存，并可通过 Cloudflare D1 数据库跨端漫游；
- 书摘笔记随心记，支持 Markdown 格式导出。

### 强大的网络收藏与书签解析
你是否曾经为了把各大浏览器里的书签整理导入而头痛？白狐博客支持：
1. **浏览器 HTML 书签文件批量上传解析**；
2. **可视化的分区选择**：支持勾选、分类筛选，一键按需入库；
3. **内置模拟网页浏览与搜索**：浏览网络时，点击收藏按钮即可立即把目标网址、Favicon 图标和页面摘要永久留存。`,
    author: '灵狐逸仙',
    date: '2025-05-10',
    category: '数字生活',
    tags: ['书架', '书签管理', '知识库'],
    cover: 'https://images.unsplash.com/photo-1507842229453-64426362fca2?auto=format&fit=crop&w=1200&q=80',
    views: 2150,
    likes: 172,
    isBookmarked: false
  }
];

// Initial Bookshelf
export const initialBooks = [
  {
    id: 'book-1',
    title: '道德经真义',
    author: '老子 / 选注',
    category: '古典哲学',
    format: 'EPUB',
    size: '1.2 MB',
    progress: 42,
    totalChapters: 3,
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    description: '道生一，一生二，二生三，三生万物。万物负阴而抱阳，冲气以为和。天地不仁，以万物为刍狗；圣人不仁，以百姓为刍狗。',
    dateAdded: '2025-05-01',
    chapters: [
      {
        title: '第一章 · 体道',
        content: `道可道，非常道；名可名，非常名。\n无名，天地之始；有名，万物之母。\n故常无欲，以观其妙；常有欲，以观其徼。\n此两者，同出而异名，同谓之玄。玄之又玄，众妙之门。`
      },
      {
        title: '第二章 · 养身',
        content: `天下皆知美之为美，斯恶已；皆知善之为善，斯不善已。\n故有无相生，难易相成，长短相形，高下相盈，音声相和，前后相随。\n是以圣人处无为之事，行不言之教；万物作而弗始，生而弗有，为而弗恃，功成而弗居。夫唯弗居，是以不去。`
      },
      {
        title: '第三章 · 安民',
        content: `不尚贤，使民不争；不贵难得之货，使民不为盗；不见可欲，使民心不乱。\n是以圣人之治，虚其心，实其腹，弱其志，强其骨。常使民无知无欲。使夫智者不敢为也。为无为，则无不治。`
      }
    ]
  },
  {
    id: 'book-2',
    title: '云原生实战架构手册',
    author: 'WhiteFox Team',
    category: '计算机科学',
    format: 'PDF',
    size: '14.8 MB',
    progress: 80,
    totalChapters: 2,
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    description: '系统化讲解 Edge Computing、Serverless 架构设计以及全球多云边缘容灾实践指南。',
    dateAdded: '2025-05-05',
    chapters: [
      {
        title: '第 1 章 · 边缘计算与全球多云统一编排',
        content: `随着全球 Anycast 边缘网络的发展，传统单一数据中心架构正迅速向分布式边缘云迁移。\n通过 Cloudflare Pages 与腾讯云 EdgeOne 的协同调度，静态资源与动态 Worker 脚本可在靠近用户的 300+ 边缘节点毫秒级执行。\n本章将深入解析边缘缓存驱逐协议与多云 DNS 动态切换。`
      },
      {
        title: '第 2 章 · 零出口流量费对象存储架构',
        content: `在云架构中，网络出口带宽往往成为最昂贵的基础设施支出。\n借助 Cloudflare R2 与 S3 协议互通的特点，结合本地轻量网盘与 AList 代理中枢，开发者能够实现 0 出口带宽成本的全球多媒体流分发网络。`
      }
    ]
  },
  {
    id: 'book-3',
    title: '聊斋志异之白狐篇',
    author: '蒲松龄',
    category: '古典文学',
    format: 'TXT',
    size: '640 KB',
    progress: 100,
    totalChapters: 2,
    cover: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
    description: '夜色苍茫，雪落无声。山斋有白狐，聪颖如雪，与书生研墨论道，风雪夜归，留香盈室。',
    dateAdded: '2025-05-12',
    chapters: [
      {
        title: '卷一 · 寒斋雪客',
        content: `太原王生，早行遇一女子，抱袱独步，甚蹇于行。生见其容色绝丽，心动，遂问所往。\n女曰：“行道之人，不能解愁，何劳致诘？”生固诘之。女自陈为荒野白狐所化，因慕人间文墨，愿为书生研墨添香。`
      },
      {
        title: '卷二 · 灵狐夜话',
        content: `是夜，风雪骤紧，松涛怒号。狐女挑灯夜读，指点古今兴衰。\n生惊叹曰：“子虽为异类，识见乃过腐儒万倍！”\n女莞尔笑曰：“天地广阔，灵气所钟，何分人狐。但存仁心，皆成大道。”`
      }
    ]
  }
];

// Initial Gallery Photos
export const initialPhotos = [
  {
    id: 'photo-1',
    title: '雪域灵狐',
    desc: '晨光穿透极北森林，灵狐在初雪中回眸。',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    category: '白狐物语',
    date: '2025-05-16',
    location: '极北雪境'
  },
  {
    id: 'photo-2',
    title: '青丘夜色',
    desc: '繁星如沸，江水悠悠，静听山风呼啸。',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    category: '风景山水',
    date: '2025-05-10',
    location: '青丘古峰'
  },
  {
    id: 'photo-3',
    title: '云端彼岸',
    desc: '数据洪流汇入无垠之云，赛博朋克与传统风韵相映生辉。',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    category: '云端随想',
    date: '2025-05-01',
    location: 'Cloud Space'
  },
  {
    id: 'photo-4',
    title: '古刹听雨',
    desc: '檐下落雨成珠，青石台阶上青苔生辉。',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    category: '风景山水',
    date: '2025-04-28',
    location: '江南水乡'
  }
];

// Initial Media Playlist
export const initialMedia = [
  {
    id: 'media-1',
    type: 'audio',
    title: '青丘幽引 · 古筝与雨声',
    artist: '白狐留声机',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: '06:12',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'media-2',
    type: 'audio',
    title: '空山灵雨 · 东方禅意氛围曲',
    artist: '白狐留声机',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '07:05',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'media-3',
    type: 'video',
    title: '白狐漫步雪原自然影像 (4K Ultra HD)',
    artist: 'Wild Fox Documentary',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '09:56',
    cover: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=800&q=80'
  }
];

// Initial Bookmarks & Categories
export const initialBookmarkZones = [
  '开发者技术',
  '云原生与部署',
  '设计与灵感',
  '实用工具箱',
  '阅读与探索'
];

export const initialWebBookmarks = [
  {
    id: 'bm-1',
    title: 'Cloudflare 控制台与 Pages',
    url: 'https://dash.cloudflare.com',
    zone: '云原生与部署',
    desc: '全球边缘托管、Workers、Pages、D1 数据库与 R2 对象存储总控平台。',
    favicon: 'https://www.cloudflare.com/favicon.ico',
    dateAdded: '2025-05-01'
  },
  {
    id: 'bm-2',
    title: '腾讯云 Cloud 官方控制台',
    url: 'https://console.cloud.tencent.com',
    zone: '云原生与部署',
    desc: '腾讯云 COS 对象存储、EdgeOne 安全边缘加速与轻量应用服务器。',
    favicon: 'https://cloud.tencent.com/favicon.ico',
    dateAdded: '2025-05-02'
  },
  {
    id: 'bm-3',
    title: '阿里云控制台',
    url: 'https://aliyun.com',
    zone: '云原生与部署',
    desc: '阿里云 OSS 静态托管、ESA 边缘安全加速与弹性计算 ECS。',
    favicon: 'https://www.aliyun.com/favicon.ico',
    dateAdded: '2025-05-03'
  },
  {
    id: 'bm-4',
    title: 'GitHub 开源社区',
    url: 'https://github.com',
    zone: '开发者技术',
    desc: '全球最大开源代码托管与协作平台，支持 CI/CD 与 Pages 自动化。',
    favicon: 'https://github.githubassets.com/favicons/favicon.png',
    dateAdded: '2025-05-04'
  },
  {
    id: 'bm-5',
    title: 'Unsplash 高清灵感图库',
    url: 'https://unsplash.com',
    zone: '设计与灵感',
    desc: '高质量无版权高清摄影图库，美学设计与灵感源泉。',
    favicon: 'https://unsplash.com/favicon.ico',
    dateAdded: '2025-05-05'
  }
];

// Cloud Storage & NetDrive Configurations
export const defaultCloudConfig = {
  // Cloudflare
  d1: {
    enabled: true,
    accountId: 'cf_account_demo_888',
    databaseId: 'whitefox-d1-db-guid',
    apiToken: '********'
  },
  r2: {
    enabled: true,
    accountId: 'cf_account_demo_888',
    bucketName: 'whitefox-r2-media',
    accessKeyId: 'r2_access_key_demo',
    secretAccessKey: '********',
    customDomain: 'https://media.whitefox.blog'
  },
  // Tencent Cloud COS
  tencentCos: {
    enabled: false,
    secretId: 'COS_SECRET_ID_DEMO',
    secretKey: '********',
    bucket: 'whitefox-cos-1250000000',
    region: 'ap-guangzhou'
  },
  // Alibaba Cloud OSS
  aliyunOss: {
    enabled: false,
    accessKeyId: 'OSS_ACCESS_KEY_DEMO',
    accessKeySecret: '********',
    bucket: 'whitefox-oss-bucket',
    region: 'oss-cn-hangzhou'
  },
  // NetDrive / WebDAV / AList
  netDrive: {
    enabled: true,
    provider: 'AList / WebDAV / 百度网盘 / 夸克',
    serverUrl: 'https://pan.whitefox.blog',
    targetFolder: '/白狐博客专存/媒体与电子书/',
    username: 'fox_admin',
    password: '********',
    connected: true
  }
};
