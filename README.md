# 🦊 白狐博客系统 (fox / WhiteFox Blog)

> **极简、高质感、现代化的多云边缘计算个人博客系统**
> 默认配色采用清雅怡人的 **翡翠绿与纯白（Emerald & White）** 东方美学质感。原生适配 **Cloudflare Pages / Workers、腾讯云 EdgeOne / COS、阿里云 ESA / OSS**，支持一键 Git 拉取部署、Pages 部署包上传、Docker 容器化与边缘数据库连接。

---

## 🌟 核心特性概览

1. **优雅界面与极简东方美学**
   - 默认经典「翡翠竹韵」绿白主题，支持 5 套高质感预设配色。
   - **自定义全站名称**：默认名称为 `fox`，站长可在设置面板实时修改全站名称并全域同步。
   - **一键切换排版布局**：支持 4 种专业布局（经典卡片网格、沉浸杂志流瀑、极简流式信息条、高密度紧凑列表）。
   - **一键调节站内字号**：紧凑 (14px)、标准 (16px)、舒适大字 (18px)、特大号 (20px) 极速自由切换。
   - **极简极净页眉**：页眉仅保留品牌、头像用户信息、夜间模式切换与退出按钮，支持**一键收拢/展开**导航栏。
   - **本地图片一键设定**：头像、全站背景、首页介绍区 Hero 封面均支持**本地图片上传**与 URL 链接设定。

2. **多云边缘架构 & 后台连接能力**
   - **Cloudflare Pages 一键优先部署**：极速 Anycast 边缘网络，0 秒冷启动。
   - **Pages 上传包一键生成**：提供一键自动化打包脚本与现成 ZIP 包，直接拖拽到 Cloudflare、腾讯云、阿里云 Pages 控制台即刻上线。
   - **腾讯云 EdgeOne / COS 与 阿里云 ESA / OSS**：原生支持国内主流云厂商边缘函数、静态站点托管与对象存储直传。
   - **数据库与对象存储后台连接**：支持 Cloudflare D1、MySQL 8.0+、Supabase PostgreSQL，以及 Cloudflare R2、腾讯云 COS、阿里云 OSS，支持控制台在线连通性测试。

3. **完整博文撰写与管理中枢**
   - 支持全功能 Markdown 写作、分类专栏、自定义标签与封面图本地上传。
   - 支持**一键复制全文 Markdown**、一键收藏、评论互动与文章安全删除。

4. **沉浸式书架与电子书完整管理**
   - **本地电子书上传解析**：支持 TXT / EPUB / PDF / MD 格式本地上传，自动提取标题与分章节结构。
   - **离线电子书一键导出下载**：可随时打包并下载书架藏书到本地设备。
   - **管理员完全管理功能**：站长管理员可自由上架新书、在线编辑章节内容或图书简介，以及下架删除藏书。
   - **沉浸式阅读器**：自适应手机端刘海屏与屏幕安全区（`env(safe-area-inset-top)`），无遮挡沉浸式全屏畅读、字号切换与章节目录抽屉。

5. **全画幅媒体影音与白狐宣传片**
   - **白狐博客宣传片演示**：全新升级影院级观影画幅，支持 16:9 宽屏、9:16 手机短视频竖屏、21:9 超宽电影级与 4:3 经典比例自由切换。
   - **本地音视频上传与播放**：支持拖拽或选择本地视频/音频文件即时载入播放器试听。
   - **完整的影音文件管理**：支持媒体文件按类型归档、一键下载至本地设备、节目单点播与媒体条目删除。

6. **网盘与多云调度中枢实战指南**
   - 内置**详细图文实战指南**，涵盖 Cloudflare R2（0 出口流量费）、腾讯云 COS、阿里云 OSS 与 AList / WebDAV 挂载全流程步骤。
   - 支持多云存储源密钥参数配置与连通性即时同步。

7. **纯净云端下载中枢**
   - 支持输入任意互联网文件或音视频网址进行多线程下载。
   - 独家支持**多码率解析与提取**（4K 2160p、2K 1440p、1080p60 高帧率、1080p 全高清、720p 以及纯音频提取），配备实时动态下载进度条与速度监控。

8. **登录注册与权限体系**
   - 包含完整的用户登录与注册面板（支持站长开启/关闭公开注册）。
   - 退出登录按钮功能正常，站长管理员与普通注册成员权限严格隔离。

---

## 🚀 部署指南 (Deployment Guide)

### 🥇 方式一：Cloudflare Pages 一键拉取部署 (首选推荐)

这是最推荐、最简便且具备全球 Anycast 自动 CI/CD 的部署方式。

1. **Fork 或推送到 GitHub / GitLab** 仓库。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，在左侧导航栏点击 **Workers & Pages**。
3. 点击 **Create application** -> 选择 **Pages** -> 点击 **Connect to Git**。
4. 选中本仓库，进入构建配置页面填写以下参数：
   - **Project Name (项目名称)**: `fox` (或自定义)
   - **Framework Preset (框架预设)**: `Vite`
   - **Build Command (构建命令)**: `npm run build`
   - **Build Output Directory (构建输出目录)**: `dist`
   - **Node.js Version**: 在环境变量中添加 `NODE_VERSION = 20`
5. 点击 **Save and Deploy**，Cloudflare 将在 1 分钟内完成全自动构建与全球边缘部署上线！

---

### 📦 方式二：Pages 一键上传文件部署 (获取与使用上传包)

如果您希望不连接 Git，直接将构建产物上传至 Cloudflare Pages、腾讯云 EdgeOne Pages 或阿里云 ESA：

#### 1. 获取上传包的方式
本仓库已经为您提供了自动化打包工具，您可通过以下任意一种方式获取部署包：
- **方式 A (直接使用现成包)**：仓库根目录下已内置预编译好的 `whitefox-pages-deploy.zip`（内含所有静态编译文件与资源）。
- **方式 B (自行命令行构建)**：在本地执行以下命令：
  ```bash
  # 1. 安装项目依赖
  npm install

  # 2. 一键打包生成 Pages 专用压缩包
  npm run package:pages
  ```
  执行完毕后，控制台将在根目录生成 `whitefox-pages-deploy.zip`。

#### 2. 上传部署流程
1. 打开 **Cloudflare Dashboard** -> **Workers & Pages** -> **Create application** -> **Pages**。
2. 选择 **Upload assets (上传静态资产)**。
3. 输入项目名称（如 `fox-blog`）。
4. **将 `whitefox-pages-deploy.zip` 内的文件或解压后的 `dist` 目录拖拽到上传框中**。
5. 点击 **Deploy site**，秒级完成部署！

---

### ☁️ 方式三：腾讯云 EdgeOne Pages / COS 静态网站托管

1. **使用腾讯云 EdgeOne Pages**：
   - 打开 [腾讯云 EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)。
   - 进入 **Pages 边缘页面托管** -> **新建项目**。
   - 支持直接关联 GitHub 仓库（构建命令填 `npm run build`，输出目录填 `dist`），或者直接上传 `whitefox-pages-deploy.zip` 解压目录。
2. **使用腾讯云 COS 对象存储静态站点**：
   - 创建公有读权限存储桶（如 `whitefox-1250000000`）。
   - 在 **静态网站** 功能中开启托管，索引文档填 `index.html`，错误文档填 `index.html`。
   - 使用 COS Browser 或命令行工具将 `dist/` 目录中的全部文件上传至存储桶根路径。

---

### 🌐 方式四：阿里云 ESA Pages / OSS 静态托管

1. **使用阿里云 ESA (Edge Security Acceleration) Pages**：
   - 登录 [阿里云 ESA 控制台](https://dcdn.console.aliyun.com/)。
   - 进入 **边缘 Pages 托管** -> **创建站点** -> 导入 Git 代码库或拖拽上传构建包。
2. **使用阿里云 OSS 静态托管**：
   - 新建 Bucket（读写权限设为公共读）。
   - 开启 **静态页面托管**，默认首页为 `index.html`，404 页面填 `index.html`（适配 SPA 单页路由）。
   - 使用 `ossutil` 上传：
     ```bash
     ossutil cp -r ./dist/ oss://your-whitefox-bucket/
     ```

---

### 🐳 方式五：Docker 容器化部署

本项目已预置生产环境 `Dockerfile`、`nginx.conf` 和 `docker-compose.yml`：

```bash
# 启动 Docker 容器 (默认映射宿主机 80 端口)
docker-compose up -d --build
```
启动后访问 `http://localhost` 即可体验。

---

## 🗄️ 后台数据库与对象存储连接流程

### 1. Cloudflare D1 边缘数据库连接
1. 在 Cloudflare 控制台创建 D1 数据库：
   ```bash
   npx wrangler d1 create whitefox-db
   ```
2. 执行建表脚本（位于仓库 `deploy/cloudflare-d1-schema.sql`）：
   ```bash
   npx wrangler d1 execute whitefox-db --file=./deploy/cloudflare-d1-schema.sql
   ```
3. 在站内「系统设置」->「数据库与对象存储后台连接」中，选择 `Cloudflare D1` 并填入 Account ID 与 Database ID，点击「测试数据库连接」即可完成握手。

### 2. MySQL / Supabase 后台连接
- **MySQL**: 填写数据库 IP/域名、端口 3306、数据库名 `whitefox_blog_db`、账号密码。
- **Supabase**: 填写 Supabase 项目 URL 与 Service Role Key / 数据库连接串。

### 3. 对象存储 (R2 / COS / OSS) 连接
- **Cloudflare R2**: 登录 Cloudflare -> R2 -> 创建 Bucket -> 生成 S3 API Token，在站内填入 Bucket 名及 AccessKey。
- **腾讯云 COS**: 在腾讯云访问管理 (CAM) 创建 API 密钥（SecretId / SecretKey），填入对应地域节点（如 `ap-guangzhou`）。
- **阿里云 OSS**: 在阿里云 RAM 控制台获取 AccessKey ID / AccessKey Secret，填入 Endpoint（如 `oss-cn-hangzhou.aliyuncs.com`）。

---

## 🛠️ 本地构建与开发说明

```bash
# 克隆代码
git clone https://github.com/your-username/whitefox-blog.git
cd whitefox-blog

# 安装依赖
npm install

# 启动本地实时热重载开发服务器
npm run dev

# 构建生产版本 (输出至 dist/)
npm run build

# 一键打包生成 Cloudflare / 腾讯云 / 阿里云 Pages 上传压缩包
npm run package:pages
```

---

## ⚙️ 环境变量说明 (Environment Variables)

复制 `.env.example` 为 `.env.production` 或在 Pages 控制台的环境变量面板配置：

| 变量名 | 说明 | 示例值 |
| :--- | :--- | :--- |
| `VITE_SITE_NAME` | 网站系统名称 (默认 fox) | `fox` |
| `VITE_ADMIN_PASSWORD` | 管理员后台初始登录密码 | `password123` |
| `VITE_CF_ACCOUNT_ID` | Cloudflare 账户 ID | `cf_account_demo_888` |
| `VITE_CF_D1_DATABASE_ID`| Cloudflare D1 边缘数据库名称 | `whitefox-d1-db` |
| `VITE_R2_BUCKET_NAME` | Cloudflare R2 存储桶名 | `whitefox-assets` |
| `VITE_TENCENT_COS_BUCKET`| 腾讯云 COS 存储桶名称 | `whitefox-1250000000` |
| `VITE_TENCENT_COS_REGION`| 腾讯云 COS 所在地域 | `ap-guangzhou` |
| `VITE_ALIYUN_OSS_BUCKET` | 阿里云 OSS 存储桶名称 | `whitefox-oss-bucket` |
| `VITE_ALIYUN_OSS_REGION` | 阿里云 OSS 地域节点 | `oss-cn-hangzhou.aliyuncs.com`|
| `VITE_ALIST_ENDPOINT` | AList / WebDAV 挂载网盘地址 | `https://pan.whitefox.blog` |

---

## 📄 开源许可

本项目遵循 MIT 协议开源。
