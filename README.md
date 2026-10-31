# 🦊 白狐博客 (WhiteFox Blog)

> **灵动美学 · 云边协同 · 优雅全能的个人数字化博客与云端知识枢纽**

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![Tencent Cloud](https://img.shields.io/badge/Deploy-Tencent%20Cloud-0052D9?logo=tencent-cloud&logoColor=white)](https://cloud.tencent.com/)
[![Alibaba Cloud](https://img.shields.io/badge/Deploy-Alibaba%20Cloud-FF6A00?logo=alibaba-cloud&logoColor=white)](https://www.aliyun.com/)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📖 项目介绍 (Introduction)

**白狐博客 (WhiteFox Blog)** 是一款专为崇尚极致美学、注重数据主权与云原生多端协同的创作者打造的现代全能数字空间。

不仅拥有灵动清雅的东方雪狐视觉格调与毛玻璃流体响应式界面，更深度集成了**个人藏书阁、光影相册、全格式音视频留声机、云端极速下载站、搜索引擎与网页随览中心、全网分区书签、网盘一键双向存储及 Cloudflare D1/R2 / 腾讯云 COS / 阿里云 OSS 多云数据同步引擎**。

---

## ✨ 核心特性一览 (Features)

| 核心模块 | 功能描述 |
| :--- | :--- |
| 📝 **一键收藏博客** | 文章卡片与正文页支持毫秒级一键收藏与状态漫游，支持分类过滤与关键词即时检索。 |
| 📚 **内置藏书阁** | 支持本地 **EPUB / PDF / TXT** 电子书自由上传，记录阅读百分比进度与分页浏览，支持一键转存至网盘。 |
| 🖼️ **光影相册中枢** | 摄影作品瀑布流画廊，支持大图高清全屏 Lightbox 预览，直连 Cloudflare R2 / 腾讯云 COS / 阿里云 OSS 对象存储。 |
| 🎵 **多媒体流光播放器** | 可查找与播放本地音视频文件，支持直接输入 MP3/MP4/M3U8 等网络流媒体网址实时播放与网盘中转。 |
| 🚀 **网址一键下载站** | 输入任意互联网文件下载 URL，即可在浏览器端直达下载，支持离线转存至网盘对应目录。 |
| 🧭 **探索与网络收藏** | 内置**白狐灵犀搜索引擎**与**网页沙箱随览**，可在搜索与浏览时一键收录好站；支持手动录入网址与分类选区。 |
| 🔖 **本地书签解析导入** | 上传 Chrome / Edge / Firefox 导出的 HTML 书签文件，自动智能解析分区，支持**勾选式选择性一键加入收藏库**。 |
| ☁️ **多云数据库同步** | 原生对接 **Cloudflare D1** 边缘数据库，一键双向同步收藏、浏览历史、相册数据与文章。 |
| 📦 **对象存储对接** | 无缝支持 **Cloudflare R2** (零出口费)、**腾讯云 COS** 与 **阿里云 OSS**。 |
| 💾 **内置网盘双向互通** | 支持连接 AList / WebDAV / 百度网盘 / 夸克，将站内文件一键备份到网盘指定文件夹，或一键引用网盘文件/外链入站。 |
| 🔐 **管理员与安全架构** | 管理员密码即部署环境变量 `VITE_ADMIN_PASSWORD`；管理员拥有一键允许/不允许注册的总开关。 |
| 👥 **双轨注册与验证系统** | 支持用户名/密码极简注册（明确提示不支持密码找回，保护私密性）；支持邮箱注册与管理员自定义自动回复验证码。 |

---

## 🛠️ 构建说明 (Build Instructions)

本项目采用轻量高效的 Vite 构建引擎，Node.js 推荐版本为 `>= 18.0.0`。

```bash
# 1. 克隆本仓库到本地
git clone https://github.com/757926525/beke.git
cd beke

# 2. 安装项目依赖
npm install

# 3. 启动本地开发服务器 (支持热更新)
npm run dev
# 默认访问地址: http://localhost:3000

# 4. 执行生产环境标准构建
npm run build
# 生成的高性能生产静态产物位于 dist/ 目录

# 5. 本地预览生产构建产物
npm run preview
```

---

## 📦 获取 Pages 一键上传包方式 (CF Pages Upload Package)

为了让不熟悉命令行或希望零门槛在 **Cloudflare Pages** 直接上传 ZIP 包上线的用户获得最顺畅的体验，本项目内置了自动化打包脚本：

### 一键生成方式：
在终端执行以下命令：
```bash
npm run package:pages
```

### 生成结果与文件位置：
- 脚本会自动检测或触发 `npm run build`，并将经过极致压缩优化的 `dist/` 目录打包为：
  👉 **`whitefox-pages-deploy.zip`**（位于项目根目录）
- 在 Cloudflare Pages 控制台的“直接上传资产 (Upload assets)”页面中，直接将此压缩包或解压后的文件夹拖入即可秒级发布上线！

---

## 🔑 环境变量与配置字典 (Environment Variables)

所有以 `VITE_` 开头的变量在前端构建或运行时直接生效。你可以在根目录创建 `.env` 文件（参考 `.env.example`）或在各大云平台控制台中直接添加：

| 变量名 | 说明 | 默认值 / 示例 | 必须 |
| :--- | :--- | :--- | :---: |
| `VITE_ADMIN_PASSWORD` | **管理员密码**（登录后台、管理系统配置的唯一密钥） | `whitefox2025` | **是** |
| `VITE_ALLOW_REGISTRATION` | 是否允许全站新用户注册 (`true`/`false`) | `true` | 否 |
| `VITE_EMAIL_REGISTER_ENABLED` | 是否开启邮箱注册渠道 (`true`/`false`) | `true` | 否 |
| `VITE_EMAIL_VERIFY_CODE` | 邮箱注册时的默认核验/自动回复验证码 | `668822` | 否 |
| `VITE_SMTP_SERVER` | 自动回复发信邮箱 SMTP 服务器 | `smtp.qcloudmail.com` | 否 |
| `VITE_SMTP_EMAIL` | 自动回复发信邮箱地址 | `noreply@whitefox.blog` | 否 |
| `VITE_SMTP_AUTH_KEY` | SMTP 授权密钥 / 密码 | `********` | 否 |
| `VITE_CF_D1_ENABLED` | 是否启用 Cloudflare D1 分布式同步 | `true` | 否 |
| `VITE_CF_ACCOUNT_ID` | Cloudflare 账户 ID | `cf_account_id` | 否 |
| `VITE_CF_D1_DATABASE_ID` | Cloudflare D1 数据库 UUID | `d1_database_uuid` | 否 |
| `VITE_CF_API_TOKEN` | 具有 D1 读写权限的 Cloudflare API Token | `********` | 否 |
| `VITE_CF_R2_BUCKET` | Cloudflare R2 对象存储桶名称 | `whitefox-media` | 否 |
| `VITE_CF_R2_ACCESS_KEY_ID` | R2 S3 兼容 Access Key | `r2_key_id` | 否 |
| `VITE_CF_R2_SECRET_ACCESS_KEY`| R2 S3 兼容 Secret Key | `********` | 否 |
| `VITE_TENCENT_COS_BUCKET` | 腾讯云 COS 存储桶名称 | `whitefox-cos-1250000000` | 否 |
| `VITE_TENCENT_COS_REGION` | 腾讯云 COS 地域代码 | `ap-guangzhou` | 否 |
| `VITE_TENCENT_COS_SECRET_ID` | 腾讯云 SecretId | `COS_SECRET_ID` | 否 |
| `VITE_TENCENT_COS_SECRET_KEY`| 腾讯云 SecretKey | `********` | 否 |
| `VITE_ALIYUN_OSS_BUCKET` | 阿里云 OSS 存储桶名称 | `whitefox-oss-bucket` | 否 |
| `VITE_ALIYUN_OSS_REGION` | 阿里云 OSS 地域节点 | `oss-cn-hangzhou` | 否 |
| `VITE_ALIYUN_OSS_ACCESS_KEY_ID`| 阿里云 AccessKey ID | `OSS_KEY_ID` | 否 |
| `VITE_ALIYUN_OSS_ACCESS_KEY_SECRET`| 阿里云 AccessKey Secret | `********` | 否 |
| `VITE_NETDRIVE_SERVER_URL` | 网盘 / WebDAV / AList 服务地址 | `https://pan.whitefox.blog` | 否 |
| `VITE_NETDRIVE_TARGET_FOLDER`| 站内文件转存到网盘的指定目录 | `/白狐博客专存/媒体与电子书/` | 否 |

---

## 🚀 多平台全场景部署指南 (Deployment Guide)

---

### 一、Cloudflare 部署 (推荐优先使用)

#### 方案 A：Cloudflare Pages 一键从 Git 拉取部署（推荐首选 🌟）
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)；
2. 导航至 **Workers 与 Pages (Workers & Pages)** -> 点击 **创建应用程序 (Create application)**；
3. 选择 **Pages** 选项卡 -> 点击 **连接到 Git (Connect to Git)**；
4. 授权并选中你的白狐博客仓库；
5. 在构建设置中填入：
   - **项目名称**：`whitefox-blog`
   - **生产分支**：`main`（或您的当前开发分支）
   - **框架预设 (Framework preset)**：选择 `Vite` 或 `None`
   - **构建命令 (Build command)**：`npm run build`
   - **构建输出目录 (Build output directory)**：`dist`
6. 在 **环境变量 (Environment variables)** 中添加：
   - `VITE_ADMIN_PASSWORD` = `你的自定义管理员密码`
7. 点击 **保存并部署 (Save and Deploy)**，等待 1 分钟即可在全球边缘 Anycast 节点完成上线！

#### 方案 B：Cloudflare Pages 直接上传 ZIP 文件部署
如果你不想配置 Git 自动化构建，可直接上传静态包：
1. 本地执行命令生成上传包：
   ```bash
   npm run package:pages
   ```
   你将在项目根目录下获得 `whitefox-pages-deploy.zip`（大小仅约 0.1MB）。
2. 在 Cloudflare Dashboard -> **Workers & Pages** -> **Pages** -> 点击 **Upload assets (上传资产)**；
3. 输入项目名称（如 `whitefox`）；
4. 将 `whitefox-pages-deploy.zip` 中的全部文件（或解压出的目录）拖入上传区域；
5. 点击 **Deploy site**，秒级部署上线！

#### 方案 C：配套 Cloudflare D1 数据库初始化（可选）
如需启用全球边缘持久化同步，在本地或 Cloudflare 终端执行：
```bash
# 1. 创建 D1 数据库
npx wrangler d1 create whitefox-db

# 2. 执行内置 SQL 建表脚本
npx wrangler d1 execute whitefox-db --file=deploy/cloudflare-d1-schema.sql
```

---

### 二、腾讯云 (Tencent Cloud) 部署指南

#### 方案 A：腾讯云 COS 对象存储 + EdgeOne 边缘加速（极致低成本）
1. 登录 [腾讯云对象存储控制台](https://console.cloud.tencent.com/cos)；
2. 创建存储桶（权限设置为：**公有读私有写**）；
3. 在存储桶管理页面左侧导航栏中，点击 **基础配置** -> **静态网站**，开启静态网站功能：
   - 索引文档填入：`index.html`
   - 错误文档填入：`index.html`（实现 SPA 路由正常跳转）
4. 在本地打包项目：
   ```bash
   npm run build
   ```
5. 使用腾讯云 COS 控制台或 COSBrowser 工具，将本地 `dist/` 目录下的所有文件上传至该存储桶根目录；
6. （可选推荐）在 [腾讯云 EdgeOne 控制台](https://console.cloud.tencent.com/edgeone) 接入域名，配置回源到该 COS 存储桶，享受国内双栈 CDN 加速与防刷防御。

#### 方案 B：腾讯云轻量应用服务器 (Lighthouse) / 云服务器 (CVM)
1. 购买 Ubuntu / Debian 或 TencentOS 实例；
2. 在服务器上安装 Docker 与 Docker Compose：
   ```bash
   curl -fsSL https://get.docker.com | bash -s docker
   ```
3. 上传代码或克隆仓库至服务器：
   ```bash
   git clone https://github.com/757926525/beke.git
   cd beke
   ```
4. 启动容器：
   ```bash
   docker compose up -d --build
   ```
5. 访问服务器公网 IP，即可进入白狐博客！

---

### 三、阿里云 (Alibaba Cloud) 部署指南

#### 方案 A：阿里云 OSS 对象存储 + ESA 边缘安全加速
1. 登录 [阿里云 OSS 控制台](https://oss.console.aliyun.com/)；
2. 新建 Bucket，读写权限选择 **公共读**；
3. 进入 Bucket -> **数据管理** -> **静态页面**：
   - 默认首页设置为：`index.html`
   - 默认 404 规则选择：重定向至 `index.html`
4. 本地执行构建：
   ```bash
   npm run build
   ```
5. 使用阿里云 ossutil 工具或控制台，将 `dist/` 内的文件上传至 OSS Bucket 根目录；
6. （推荐）在 [阿里云 ESA 控制台](https://esa.console.aliyun.com/) 绑定自定义域名并开启全站缓存与静态加速。

#### 方案 B：阿里云 ECS 弹性计算服务
可使用系统自带的 `deploy/nginx.conf` 直接部署在 Nginx 中：
```bash
sudo apt update && sudo apt install -y nginx
npm run build
sudo cp -r dist/* /var/www/html/
sudo cp deploy/nginx.conf /etc/nginx/conf.d/whitefox.conf
sudo systemctl reload nginx
```

---

### 四、Docker 一键容器化部署

本项目已预置多阶段构建的高性能 `Dockerfile` 与 `docker-compose.yml`：

```bash
# 启动容器
docker compose up -d

# 查看运行状态
docker compose ps

# 停止服务
docker compose down
```

---

## 🔒 账号与安全规则说明

1. **管理员预设与控制台管理**
   - 默认管理员账号为：`admin`
   - 管理员密码由环境变量 `VITE_ADMIN_PASSWORD` 确定（若未配置环境变量，本地默认密码为 `whitefox2025`）；
   - 管理员登录后，可进入「**系统管理**」页面一键开启或关闭全站新用户注册，并可管理已注册用户与邮箱发件策略。

2. **双轨注册与安全性声明**
   - **默认注册模式**：仅需设定用户名与密码；
   - **⚠️ 零知识私密提醒**：白狐博客严密保护用户私隐，**明确不支持密码找回功能**。请用户在注册时务必牢记密码；
   - **邮箱注册模式**：支持输入验证码核验；管理员可在后台设定自动回复邮箱与核验码。

---

## 狐鸣九皋 · 欢迎贡献

白狐博客秉承开放自由与纯粹美学的精神构建。若在使用过程中有任何改进意见或多云适配建议，欢迎提交 Issue 或 Pull Request！
