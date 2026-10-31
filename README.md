# 🦊 白狐博客 (WhiteFox Blog) - 全能极简多云云原生博客系统

> 翡翠竹韵（绿与白）雅致美学 · 响应式多设备切换 · Cloudflare D1 边缘数据库实时同步 · Cloudflare Pages / 腾讯云 EdgeOne / 阿里云 ESA 一键拉取与一键上传全支持

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 项目介绍

**白狐博客 (WhiteFox Blog)** 是一款专为极客、学者与创作者打造的高质感、全功能多云个人数字化知识中枢。系统默认采用**翡翠竹韵（绿与白）**为主的纯净高质感美学配色，支持多语言国际化（中文简繁、英语、日语、法语、西班牙语、德语、韩语等），融合了现代现代云原生 Serverless 架构与多端设备仿真技术。

不仅包含完整的博文发布、电子书阁、光影图床、多画幅影音播放器、网址导航与站内免代理浏览器，更完整支持了 **Cloudflare Pages**、**腾讯云 EdgeOne Pages / COS**、**阿里云 ESA Pages / OSS**、**Docker 独立部署**与 **Pages 一键上传文件部署**。

---

## ✨ 核心特性矩阵

### 1. 权限分级与安全访问控制
- **系统管理** 与 **网盘与多云** 顶级标签页受身份权限保护，**仅对系统管理员可见**。普通注册访客仅可浏览公开博文、藏书、相册、播放器与网址导航。
- 顶部导航栏直观提供 **管理员标识徽章** 与身份快速切换。

### 2. 翡翠绿白雅致美学与全站个性化
- **默认主题色调**：翡翠竹韵（绿与白为主），清新脱俗。
- **一键主题配色按键**：预设 5 套高质感配色方案（翡翠绿白、灵狐玄赤、沧海烟岚、紫霄仙隐、水墨素雅），支持顶部与后台一键切换。
- **调色板与背景自定义**：后台支持任意十六进制颜色选择器自定义全局背景色，支持输入全站背景壁纸 URL、站长专属头像 URL 与首页介绍区 Hero 照片 URL。
- **可收拢折叠面板**：管理后台所有自定义模块（主题调色、用户管理、D1 同步、网盘文件管理）均采用优雅手风琴折叠卡片。

### 3. 设备模式一键切换
- 页面右下角悬浮 **电脑宽屏** 与 **手机视图** 切换按键。
- 切换至手机视图时，自动模拟主流现代手机外壳视口与安全边框，一键预览移动端真实呈现效果。

### 4. Cloudflare D1 边缘数据库全域实时同步
- 管理中枢集成 Cloudflare D1 分布式 SQLite 边缘数据库同步面板。
- 一键执行博文、阅读进度、藏书、网址收藏、相册与网盘配置的全息双向同步，零延迟全球边缘生效。

### 5. 已注册用户全景管理 (管理员专属)
- 管理员可在后台实时查看所有注册成员姓名、邮箱、权限角色与注册日期。
- 支持快速新增成员、授权或删除成员。

### 6. 对象存储与多云网盘文件管理
- 支持集中索引与调度上传至 **Cloudflare R2**、**腾讯云 COS**、**阿里云 OSS** 与 **AList / WebDAV 挂载网盘** 的资源。
- 支持站内直接引用与新窗口高速预览。

### 7. 8 国语言全球化 (i18n)
- 导航栏内置多语言下拉切换：
  - 🇨🇳 简体中文 (`zh-CN`)
  - 🇭🇰 繁體中文 (`zh-TW`)
  - 🇺🇸 English (`en-US`)
  - 🇯🇵 日本語 (`ja-JP`)
  - 🇫🇷 Français (`fr-FR`)
  - 🇪🇸 Español (`es-ES`)
  - 🇩🇪 Deutsch (`de-DE`)
  - 🇰🇷 한국어 (`ko-KR`)

### 8. 网址导航与内置免代理浏览器
- 分类收录云控制台、技术文档、实用工具与 AI 智能中枢。
- **内置安全浏览器沙盒**：直接在站内 IFrame 中浏览外部文档与网页。
- **站内搜索反代网关**：内置带动态呼吸状态指示灯的免代理开关，解决大陆网络直连访问 Google 等海外搜索源的需求。

### 9. 全画幅多媒体播放器 (支持竖屏短视频)
- 原生支持 **16:9 宽屏**、**9:16 手机短视频/竖屏视频**、**4:3**、**1:1** 等任意比例自适应切换与播放。
- 完美契合移动端短视频、播客与长视频影视需求。

### 10. 上传与下载实时进度条
- 资源中心提供下载与上传动态进度条，支持实时百分比显示与传输状态监控。

### 11. 手机端全屏沉浸阅读器
- 电子书阁阅读模式支持一键开启 **手机沉浸全屏阅读**。
- 采用 `env(safe-area-inset-top)` 安全区自适应，完美避开手机刘海与前置摄像头，顶部工具栏不发生遮挡。

---

## 🚀 部署指南 (多云与多平台全覆盖)

部署说明已**同步集成在博客首页专属的「部署与指南」导航选项卡中**，用户在站点前台即可边查阅边操作！

### 一、Cloudflare Pages 一键拉取部署 (最高优先级推荐 · 零成本全球 CDN)

1. 将本项目 Fork 或推送到您的 GitHub / GitLab 仓库。
2. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，在左侧导航进入 **Workers 和 Pages (Workers & Pages)**。
3. 点击 **创建 (Create application) &gt; Pages &gt; 连接到 Git (Connect to Git)**。
4. 选择您的 `whitefox-blog` 仓库，点击 **开始设置 (Begin setup)**。
5. 在构建设置中填入以下参数：
   - **框架预设 (Framework preset)**: `Vite` (或选择 `None`)
   - **构建命令 (Build command)**: `npm run build`
   - **构建输出目录 (Build output directory)**: `dist`
6. *(可选)* 绑定 Cloudflare D1 边缘数据库：
   - 在 Pages 项目设置中进入 **Settings &gt; Functions &gt; D1 Database Bindings**。
   - 变量名称填写 `DB`，关联您创建的 D1 数据库实例。
7. 点击 **保存并部署 (Save and Deploy)**，等待 1 分钟即可生成类似 `https://whitefox-blog.pages.dev` 的全球 Anycast 加速网站！

---

### 二、腾讯云 EdgeOne Pages / COS 静态托管部署

#### 方案 A：腾讯云 EdgeOne Pages 一键拉取 (国内加速推荐)
1. 登录腾讯云控制台，进入 **边缘安全加速平台 EdgeOne &gt; EdgeOne Pages**。
2. 点击 **新建项目**，绑定 GitHub 账户并授权白狐博客代码仓库。
3. 配置构建环境：
   - **构建命令**: `npm run build`
   - **输出目录**: `dist`
   - **Node.js 版本**: `18.x` 或更高
4. 点击完成部署，即刻坐拥中国境内 3200+ 边缘加速节点与全套 WAF 安全防护。

#### 方案 B：腾讯云 COS 对象存储静态网站托管
1. 进入腾讯云 COS 控制台，创建名为 `whitefox-blog` 的存储桶（读写权限设为 **公有读私有写**）。
2. 在存储桶侧边栏进入 **基础配置 &gt; 静态网站**，开启静态网站托管：
   - **索引文档**: `index.html`
   - **错误文档**: `index.html` (确保 SPA 单页路由刷新正常)
3. 在本地或 CI 中执行 `npm run build`，使用 `coscmd` 或控制台直接将 `dist/` 目录中的全部文件上传至存储桶根路径即可。

---

### 三、阿里云 ESA Pages / OSS 静态托管部署

#### 方案 A：阿里云 ESA (Edge Security Acceleration) Pages 一键拉取
1. 登录阿里云控制台，进入 **边缘安全加速 ESA &gt; Pages 托管平台**。
2. 关联 GitHub 仓库，选择 `whitefox-blog`。
3. 构建脚本指定为 `npm install && npm run build`，输出目录设置为 `dist`。
4. 提交部署，自动同步至全球边缘节点。

#### 方案 B：阿里云 OSS 对象存储托管
1. 创建 OSS Bucket，读写权限配置为 **公共读**。
2. 在 **数据管理 &gt; 静态页面** 中开启功能：
   - 默认首页：`index.html`
   - 默认 404 规则页：`index.html`
3. 使用 `ossutil` 命令行工具或 OSS 控制台，将 `dist/` 文件夹下生成的内容一键上传至 Bucket 根目录。

---

### 四、Pages 压缩包一键上传部署 (获取上传包的方式)

若您不希望关联 Git 仓库，或者云平台支持**直接上传资产压缩包**（如 Cloudflare Pages Direct Upload、腾讯云 EdgeOne 上传离线包、Vercel 拖拽部署等），请按以下方式获取打包文件：

#### 获取上传包的步骤：
```bash
# 1. 克隆仓库并进入项目根目录
git clone https://github.com/your-username/whitefox-blog.git
cd whitefox-blog

# 2. 安装项目依赖并执行构建
npm install
npm run build

# 3. 将生成的 dist 目录下的所有文件压缩为 zip 包
cd dist
zip -r ../whitefox-pages-deploy.zip ./*
cd ..
```
执行完毕后，项目根目录下生成的 **`whitefox-pages-deploy.zip`** 即为纯静态一键部署包！

#### 上传使用：
- **Cloudflare Pages**: 点击 **Create application &gt; Pages &gt; Upload assets**，直接把解压后的 `dist` 文件夹拖入网页，或使用 Wrangler 命令行：
  ```bash
  npx wrangler pages deploy dist --project-name whitefox-blog
  ```
- **腾讯云 EdgeOne / 阿里云 ESA**: 在控制台选择上传离线部署包，上传 `whitefox-pages-deploy.zip` 即可。

---

### 五、Docker / 私有云 VPS 容器化部署

本项目已提供内置 Nginx 高性能反代配置与多阶段构建 `Dockerfile`：

```bash
# 构建镜像
docker build -t whitefox-blog:latest .

# 启动容器
docker run -d -p 8080:80 --name whitefox-blog-container whitefox-blog:latest
```
访问 `http://<服务器IP>:8080` 即可开始使用。

---

## 🛠️ 构建说明 (Build Instructions)

### 本地开发
```bash
# 安装依赖
npm install

# 启动本地热重载开发服务器
npm run dev
```
开发服务器将运行在 `http://localhost:5173/`。

### 生产环境打包
```bash
npm run build
```
生产环境打包产物将输出在 `dist/` 目录下，包含经过严格 Tree-shaking 优化的纯静态 HTML、CSS 与 JS 资源。

### 本地预览生产构建产物
```bash
npm run preview
```

---

## ⚙️ 环境变量清单 (Environment Variables)

在部署到 Cloudflare Pages、腾讯云、阿里云或本地开发时，可通过根目录下的 `.env` 文件或云平台控制台中的 **Environment Variables (环境变量)** 进行配置：

| 变量名称 | 默认值 | 必填 | 说明 |
| :--- | :--- | :---: | :--- |
| `VITE_SITE_TITLE` | `白狐博客 · 翡翠竹韵` | 否 | 站点标题与顶栏品牌名称 |
| `VITE_ADMIN_PASSWORD` | `whitefox888` | 否 | 管理员专属访问密码 |
| `VITE_CF_D1_DATABASE` | `whitefox-d1-db` | 否 | Cloudflare D1 边缘数据库名称 |
| `VITE_ENABLE_REGISTRATION` | `true` | 否 | 是否开放外部访客注册新账号 |
| `VITE_SEARCH_PROXY_URL` | `https://proxy-search.whitefox.blog/api` | 否 | 站内搜索反代网关服务地址 |

---

## 🎨 界面视觉与调色系统

- **Emerald & White (翡翠竹韵 - 默认)**: `#10b981` 与纯净透亮底白，象征灵动脱俗、清澈深邃的数字空间。
- **Cyber Fox (灵狐玄赤)**: `#f43f5e` 灵狐火赤。
- **Ocean Cyan (沧海烟岚)**: `#0284c7` 苍蓝澄澈。
- **Amethyst Purple (紫霄仙隐)**: `#8b5cf6` 幽紫流光。
- **Ink Minimal (水墨素雅)**: `#334155` 玄素墨韵。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源。欢迎 Star、Fork 与提 Issue！
