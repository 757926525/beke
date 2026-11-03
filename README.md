# 白狐 (WhiteFox) 博客系统

> 🦊 东方美学设计 · 极简敏捷 · 翡翠绿与纯白质感 · 多云边缘计算知识空间

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?logo=cloudflare)](https://pages.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## 🌟 项目介绍

**白狐博客 (WhiteFox Blog)** 是一套专为极客、学者与创作者打造的全功能多云边缘博客系统。以**翡翠竹韵（绿白美学）**为默认基调，支持暗黑模式与多套东方典雅配色，支持四种博文排版与全站字体调节。

### ✨ 核心功能矩阵

1. **站内免代理浏览器 (国内直通 Google 搜索与海外网站)：**
   - 真正实现在中国境内直接访问 Google 搜索与境外技术站点。
   - 大气不遮挡的全局搜索框，支持直接输入关键词搜索或键入目标网址。
   - 大尺寸手机界面沉浸视窗，完美贴合移动端触控体验，亦可一键切换桌面宽屏。
2. **专属文件夹相册与双列全景 (光影视界)：**
   - 支持自由创建相册文件夹进行分类归档。
   - 支持上传照片直接保存至指定文件夹，Canvas 智能压缩与持久化存储。
   - 照片界面严格采用**每排两张（双列瀑布网格）**，全面适应手机小屏与桌面端。
3. **首页介绍区动态编辑与容量全景监测：**
   - 首页介绍区主标题、微徽标、描述语均可在线修改并持久化保存。
   - 介绍区封面照片可一键本地上传替换并实时生效。
   - 动态监测并显示网站的**总容量与已用容量**（如 R2 免费额度 10 GB 与实时存储占用）。
4. **左侧浏览历史记录专区：**
   - 博客文章左侧常驻浏览历史记录选区。
   - 记录访问时间、博文分类，支持**一键直达**与**逐条/批量清空记录**。
5. **八国主流语言实时切换 (默认简体中文)：**
   - 支持简体中文、繁體中文、English、日本語、한국어、Français、Español、Deutsch。
   - 切换即时生效，持久化写入本地配置。
6. **双模高可用同步机制 (接或不接数据库均有效)：**
   - **离线/单机模式：** 即使未接入后端数据库，所有文章、书架进度、相册、配置均本地持久化，点击同步即可完成本地高可用镜像快照保存，数据 100% 不丢失。
   - **数据库模式：** 支持在系统设置中一键接入 Cloudflare D1、MySQL、PostgreSQL 或 Supabase。
7. **极简 TXT 藏书阁与纯云端下载中心：**
   - 书架严格遵循纯 TXT 格式，支持单本/批量上传，专为手机刘海屏（Safe Area）适配。
   - 纯云端下载中枢，支持多分辨率与音视频分离提取。

---

## 📌 Cloudflare Pages 免费计划配额与存储说明

```text
[Cloudflare Pages 免费计划 的话：不连数据库时，一个 Pages 项目最多能存 20,000 个文件。

另外还有两个硬限制：

单文件最大 25 MiB，超过这个大小不能直接放进 Pages 站点资源里。

总文件数限制按项目算，不是按账号算；一个账号最多可以有 100 个 Pages 项目。
R2 的文件数量没有明确上限，但受 10 GB 存储 限制；KV 虽然 key 数量不限，但总存储只有 1 GB。

所以如果你只是部署静态站点，20,000 个文件、每个不超过 25 MiB 就是 Pages 免费版的文件上限。超过的话，建议把大文件、图片、视频类资源挪到 R2。]
```

---

## 🚀 构建与部署指南

### 本地构建与快速预览

```bash
# 1. 克隆代码并安装依赖
git clone <repo-url>
cd whitefox-blog
npm install

# 2. 启动本地开发服务
npm run dev

# 3. 生产环境构建打包
npm run build
```

---

### 方案一：Cloudflare Pages 一键拉取自动部署 (首选推荐 ⭐⭐⭐⭐⭐)

Cloudflare Pages 与 Git 仓库无缝集成，全球 330+ Anycast 边缘节点加速，具备零元建站、秒级构建与无限流量的优势。

1. 打开 [Cloudflare 仪表盘](https://dash.cloudflare.com/)。
2. 导航至 **Workers & Pages** -> 点击 **Create application** -> 选择 **Pages** -> **Connect to Git**。
3. 选择托管白狐项目的 GitHub / GitLab 仓库。
4. 在构建配置（Build settings）中填入：
   - **Framework preset (框架预设)**: `Vite`
   - **Build command (构建命令)**: `npm run build`
   - **Build output directory (输出目录)**: `dist`
   - **Environment variables (环境变量)**:
     - 添加 `NODE_VERSION` = `20`
     - 添加 `VITE_ADMIN_USERNAME` = `fox` (可自定义设定唯一系统站长账号)
     - 添加 `VITE_ADMIN_PASSWORD` = `your_strong_password` (设定站长密码)
     - *提示：后续也可在 Cloudflare Pages 项目后台 `Settings` -> `Environment variables` 中随时修改变量，跨设备登录无缝自动同步！*
5. 点击 **Save and Deploy**，即可在 1 分钟内完成全球自动化部署！后续向 `main` 分支提交代码均会自动触发增量更新。

---

### 方案二：Cloudflare Pages 一键上传压缩包部署 (免 Git 绑定)

如果您希望直接上传预构建包而无需关联 Git 仓库：

#### 📦 获取/生成上传部署包的方式

在项目根目录下运行白狐定制打包指令：

```bash
npm run package:pages
```

该命令会自动完成 Vite 生产构建，并将 `dist` 静态资源封装为标准的 **`whitefox-pages-deploy.zip`** 压缩包。

#### 部署步骤：
1. 登录 Cloudflare Dashboard -> **Workers & Pages** -> **Create application** -> **Pages**。
2. 选择 **Upload assets (直接上传资产)** 选项卡。
3. 输入您的项目名称（例如 `whitefox`）。
4. 将生成的 **`whitefox-pages-deploy.zip`** 解压后直接拖入网页上传区域（或直接拖入 zip 内的全部文件）。
5. 点击 **Deploy site**，秒级全球上线！

---

### 方案三：腾讯云 EdgeOne / COS 对象存储部署

适合对中国大陆境内访问速度有极致要求的备案域名站点：

1. **构建静态产物：**
   ```bash
   npm run build
   ```
2. **上传到腾讯云 COS：**
   使用腾讯云官方 `coscli` 命令行工具将 `dist/` 目录同步到目标存储桶：
   ```bash
   coscli sync ./dist/ cos://whitefox-bucket/ -r
   ```
3. **开启静态网站托管：**
   在 COS 控制台中开启“静态网站”，索引文档与错误文档均填写 `index.html`。
4. **绑定 EdgeOne 边缘加速：**
   在腾讯云 EdgeOne 中添加已备案自定义域名，源站选择 COS 存储桶，开启全球 Anycast 边缘缓存与免费 SSL 证书。

---

### 方案四：阿里云 ESA / OSS 对象存储部署

1. **构建静态产物：**
   ```bash
   npm run build
   ```
2. **上传到阿里云 OSS：**
   使用 `ossutil` 命令行工具同步到 Bucket：
   ```bash
   ossutil sync ./dist/ oss://whitefox-bucket/ -u
   ```
3. **配置 OSS 静态页面：**
   将默认首页与 404 错误页均设为 `index.html`。
4. **配置 ESA (边缘安全加速平台)：**
   在阿里云 ESA 中绑定域名，加速源站指向 OSS，享受企业级 WAF、DDoS 防护与国内 CDN 极速加速。

---

### 方案五：Vercel / Netlify / Railway 多平台云托管部署

白狐博客基于标准 React 19 + Vite 构建，可无缝部署至全球主流静态与 Serverless 云托管平台：

- **Vercel**：在 [vercel.com](https://vercel.com) 导入项目，构建命令填写 `npm run build`，输出目录填写 `dist`。
- **Netlify**：在 [netlify.com](https://app.netlify.com) 选择 Import from Git，构建命令 `npm run build`，发布目录 `dist`。
- **Railway**：直接连接 GitHub 仓库，Railway 将自动读取仓库根目录的 `Dockerfile` 进行容器化秒级发布。

---

### 方案六：Docker & Nginx 私有化部署

针对独立 VPS / 云服务器环境：

```bash
# 启动容器
docker compose up -d --build

# 访问博客
http://<服务器IP>:80
```

---

## 🗄️ 数据库接入与 Cloudflare 原生直绑指南

白狐博客支持**Cloudflare Pages 后台原生直接绑定**与**各大外部数据库/对象存储直接接入**：

### 1. Cloudflare Dashboard 原生直绑（首选推荐 · 零硬编码配置）

无需在代码或 `wrangler.toml` 中填写敏感 UUID 或访问密钥，直接在 Cloudflare 控制台添加绑定：

1. **创建 D1 数据库与 R2 存储桶**：
   - 打开 Cloudflare Dashboard -> **Storage & Databases** -> **D1 SQL Database** -> 创建名为 `whitefox-db` 的数据库。
   - 在其 **Console** 中执行 `deploy/cloudflare-d1-schema.sql` 完成表结构初始化。
   - （可选）在 **R2 Object Storage** 中创建名为 `whitefox-assets` 的存储桶。
2. **在 Pages 项目后台添加原生绑定**：
   - 打开 Pages 项目 -> **Settings** -> **Functions**。
   - 在 **D1 database bindings** 点击添加：变量名称填 **`DB`**，选择刚创建的 `whitefox-db`。
   - 在 **R2 bucket bindings** 点击添加：变量名称填 **`BUCKET`**，选择刚创建的 `whitefox-assets`。
   - 保存并重新部署，站内后台状态指示灯将自动识别为 **绿色已接入 (Connected)**，全站数据实现毫秒级持久化与多端极速自动同步！

### 2. 外部数据库与对象存储接入（腾讯云 / 阿里云 / Supabase / MySQL / AWS S3）

在博客右上角 **系统设置** -> **全能数据库后台与管理界面接入** 中：
- 下拉选择数据库类型（Cloudflare D1、Supabase / PostgreSQL、MySQL、腾讯云 TDSQL、阿里云 PolarDB、MongoDB Atlas、Redis）。
- 填入 Endpoint 与访问凭证，点击 **测试并激活数据库接入**，状态指示灯将实时反映真实通信连通性。
- 同理可接入 Cloudflare R2、腾讯云 COS、阿里云 OSS、Amazon S3 或七牛云 Kodo。

### 3. 无遮挡透明背景与主题定制

- 在 **系统设置** -> **主题调色与本地图片设定** 中提供了 **通透亚克力** 与 **纯净冰晶** 两套半透明玻璃主题预设。
- 开启 **无遮挡透明区块模式 (Transparent Glass)** 后，卡片容器与页面区块将呈现通透的高级亚克力磨砂玻璃质感，自定义背景大图将尽收眼底、通透无遮挡。

---

## 🗄️ 存储与同步模式说明

白狐博客原生支持**纯本地文件离线模式**与**真实云端数据库同步模式**：
- **未连接数据库时（纯本地文件模式）：** 取消向远端发起无意义的无库同步尝试，所有博文、阅读进度、相册、自定义配置均严格存放在当前浏览器本地文件中，支持在后台一键导出 JSON 完整镜像或导入本地备份，安全可靠。
- **连接数据库后（多端实时同步模式）：** 接入 Cloudflare D1 或外部数据库后，系统自动激活实时跨设备同步，博文、相册、配置等多端秒级对齐。

### 统一同步房间与服务端安全认证架构

1. **统一同步房间（whitefox-site-main）：**
   - 所有设备默认共用统一房间 `whitefox-site-main`，旧设备的随机密钥自动迁移并合并至该共享房间，彻底解决因各设备随机密钥导致写入不同记录而“进入不同界面”的根源。也可在 Cloudflare 后台设置 `SYNC_ROOM_KEY` 变量自定义指定。
2. **服务端鉴权与防伪会话令牌（/api/auth）：**
   - 站长密码验证移至 Cloudflare Pages Functions 服务端（`ADMIN_PASSWORD` 环境变量），验证通过后通过 HMAC-SHA256 签发 30 天有效期的防伪会话令牌。
   - 改密码后旧令牌自动失效，本地残留若无效自动降级为访客。
3. **保护写入与公开读取：**
   - `/api/sync` 读取公开供访客浏览博文与相册，POST 写入必须携带合法的站长令牌，防止公共房间数据被未经授权覆盖。
4. **默认身份安全访客化：**
   - 首次访问或未登录时，默认身份严格为访客（游客模式），点击登录并成功通过服务端验证后方激活系统站长管理面板。

### 初始化 Cloudflare D1 数据库：
```bash
# 1. 在 Cloudflare 控制台创建 D1 数据库 whitefox-db 或使用命令行：
npx wrangler d1 create whitefox-db

# 2. 执行建表 SQL (位于 deploy/cloudflare-d1-schema.sql)
npx wrangler d1 execute whitefox-db --file=./deploy/cloudflare-d1-schema.sql
```

进入站点右上角 **系统设置** -> **全能数据库后台与管理界面接入** 即可查看状态灯。

---

## ⚙️ 环境变量说明 (`.env.example`)

| 变量名 | 说明 | 示例值 |
| :--- | :--- | :--- |
| `ADMIN_USERNAME` / `VITE_ADMIN_USERNAME` | 唯一系统站长管理员账号（可随时在 CF 后台修改动态生效） | `fox` |
| `ADMIN_PASSWORD` / `VITE_ADMIN_PASSWORD` | 唯一系统站长管理员密码（可随时在 CF 后台修改动态生效） | `whitefox2025` |
| `VITE_SITE_NAME` | 博客系统默认名称 | `fox` |
| `VITE_DEFAULT_LANG` | 默认语言 | `zh-CN` |
| `VITE_CLOUDFLARE_D1_DATABASE_ID` | Cloudflare D1 边缘数据库 ID | `your-d1-db-uuid` |
| `VITE_CLOUDFLARE_R2_BUCKET` | Cloudflare R2 存储桶名称 | `whitefox-assets` |
| `VITE_SEARCH_PROXY_URL` | 国内免代理直连海外反代接口 | `https://proxy.whitefox.blog/api` |
| `VITE_TENCENT_COS_BUCKET` | 腾讯云 COS 存储桶 | `whitefox-cos-125000` |
| `VITE_ALIYUN_OSS_BUCKET` | 阿里云 OSS 存储桶 | `whitefox-oss` |
