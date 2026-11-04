# 🦊 白狐博客 (WhiteFox Blog)

> **极简·敏捷·多云边缘驱动的现代全能博客、文创商城与编程 AI 系统**
> 东方雅致翡翠绿白美学视觉体系，原生适配全球边缘网络与主流云服务商（Cloudflare Pages、腾讯云 EdgeOne / COS、阿里云 ESA / OSS 与 Docker 自建环境）。

---

## 🌟 核心特色与架构一览

- **🎨 东方翡翠绿白美学视觉体系**：以温润翠竹与素雅白为基调，支持一键切换五大东方主题配色，全局排版布局自由切换（经典网格、杂志瀑布流、极简文字、紧凑清单）与 4 档全局字体调节。
- **🌐 彻底有效解决多端同步难题 (Cloudflare Edge Sync Relay)**：
  - 突破传统本地浏览器存储孤岛，通过内置的 `/api/sync` 边缘中继网关与 Cloudflare D1 双向通信，全站配置、博客文章、书架文档、相册照片、文创商品订单、编程 AI 会话历史均可在手机、平板、多台电脑间**秒级全息双向同步**。
- **🤖 编程 AI 智识与代码工作台**：
  - **实时锁定仓库与分支**：对话面板顶部实时展示当前连接的代码仓库与实时生效分支（如 `whitefox-blog [main]`）。
  - **多平台仓库跳转授权**：支持一键跳转 GitHub、GitLab、Gitee、Cloudflare Pages 官方 OAuth 完成授权，支持随时连接或断开仓库。
  - **编程历史同步与管理**：全量历史会话云端双向同步，随时查看提问、一键恢复历史对话至提问框、单个删除或批量清空。
  - **提示词草稿箱 (Prompt Drafts)**：替代常用指令，支持保存结构化提示词草稿、一键复制填入对话框。
  - **模型状态指示灯与 10 大免费模型**：具备活跃状态指示灯，预设 10 大永久免费开源模型（Meta Llama-3、DeepSeek R1、Qwen 2.5 Coder、Mistral 等），支持一键搜索与全网更新。
  - **多模态写码支持**：支持上传项目 `.zip` 压缩包与界面原型截图，一键下载项目源码压缩包。
  - **移动端全屏防遮挡布局**：专为手机触控优化的弹性安全视口与非遮挡交互键盘输入条。
- **🛍️ 甄选文创与数字艺术商城**：
  - **多图展示管理**：支持上传与删除多张高清展示图片，多选区分类切换。
  - **完备订单提交流程**：选购商品必须完整填写收件人姓名、**联系电话**、**电子邮箱**与**详细收货地址**。
  - **站长专属收费通道管理**：预留 **PayPal**、**万里汇 (WorldFirst)**、**微信支付 (WeChat Pay)**、**支付宝 (Alipay)** 接口参数设置与客户订单管理列表（仅系统管理员可见）。
- **🛡️ 站长文件专区与存储桶站内直管**：
  - **存储桶站内直管**：站内直接切换浏览与管理 Cloudflare R2、腾讯云 COS、阿里云 OSS 与坚果云 WebDAV 的全部内容。
  - **虚拟目录管理**：支持在存储桶内一键新建虚拟子目录、进入子目录归档管理文件。
  - **前缀隔离与文件显示修复**：强制应用标准 `admin/` 隔离前缀与文件扩展名动态检测机制，彻底解决文件不能显示或显示错误的问题。
- **📚 墨香书阁 (4 档显示与全格式支持)**：
  - 支持 **大图、中图、小图、详情** 4 种显示模式自由切换。
  - 支持纯文本与电子书格式（`.txt`、`.md`、`.pdf`、`.epub`、`.mobi`、`.azw3`、`.docx`、`.html`、`.json`、`.csv`），明确标识网页沉浸式阅读与专用下载模式。
  - 支持图书**批量勾选、批量下载、批量转存 WebDAV 与批量删除**。
- **🖼️ 光影视界 (相册 4 档显示)**：
  - 支持相册文件夹管理与双列全景模式，支持**大图、中图、小图、详情**切换。
  - 支持照片批量选择、批量下载与批量转存。
- **🎬 媒体影音中枢**：
  - 默认采用**自适应 (Auto)** 全画幅模式，完美兼容 16:9 宽屏、9:16 短视频竖屏、21:9 影院超宽屏与 4:3 经典画幅。
- **☁️ 网盘与 WebDAV 多云调度中枢**：
  - **坚果云 WebDAV 预留接口**：在坚果云开启第三方应用授权生成“应用密码”，在博客网盘区填入服务器地址（`https://dav.jianguoyun.com/dav/`）、账号与应用密码即可直通挂载。
  - **一键 WebDAV 转存**：博客文章、书架图书、相册图片、媒体音视频均支持一键转存至 WebDAV 外接网盘，带有**流式上传实时进度条**。
  - 支持 Cloudflare R2、腾讯云 COS、阿里云 OSS、AList、Backblaze B2、MinIO、AWS S3、华为云 OBS、又拍云 USS 集中管理。
  - **彻底移除过时站内存储池**，网盘文件支持批量勾选管理。
- **🌍 12 种全球主流语言无死角实时切换**：
  - 简体中文、繁體中文、English、日本語、한국어、Français、Español、Deutsch、Русский、العربية、Português、Italiano。
- **📬 现代邮件 API 与系统验证码策略**：
  - 支持 Resend、Cloudflare Email Routing、SendGrid、Mailgun API，具备频率节流保护与高配额告警。
  - 系统验证码可设为**动态随机生成**或**固定专用码**，并支持自由调节有效分钟数。
  - 站内信箱专注管理访客来信与回复消息，支持删除历史记录。
- **🔒 权限与隐私访问控制**：
  - 支持“仅限邮箱注册用户开关”与“未登录访客隐藏非博客选区开关”（开启后访客仅能浏览博文）。
  - 页眉配备站长消息中心与实时状态呼吸灯。

---

## 🚀 部署指南 (全平台多云实战)

> **注意：** 站内完整的部署说明已移至【系统设置】中心的【全平台多云部署实战指南】折叠区中。

### 1. Cloudflare Pages 一键 Git 拉取部署（最高优先级 · 推荐）

1. 将代码推送至个人的 GitHub 或 GitLab 仓库。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，进入 **Workers & Pages** → **Create Application** → **Pages** → **Connect to Git**。
3. 选择白狐博客仓库，填写构建参数：
   - **Framework preset (构建预设)**: `Vite`
   - **Build command (构建命令)**: `npm run build`
   - **Build output directory (输出目录)**: `dist`
4. 添加环境变量（可选，用于预设站长密码）：
   - `VITE_ADMIN_USERNAME`: `fox`
   - `VITE_ADMIN_PASSWORD`: `你的高强度站长密码`
5. 点击 **Save and Deploy**，1 分钟内全球 Anycast CDN 节点秒级就绪！

---

### 2. Cloudflare Pages 一键上传文件部署 (获取上传包的方式)

如果不希望关联 Git 仓库，可以使用仓库自带的打包工具生成部署 zip 包直接拖拽上传：

```bash
# 1. 安装依赖并执行上传包打包脚本
npm install
npm run package:pages
```

- 该命令会自动构建项目并在仓库根目录生成专用的标准压缩包：
  `whitefox-pages-deploy.zip`
- 登录 Cloudflare Pages 后台，选择 **Direct Upload (直接上传)**，将 `whitefox-pages-deploy.zip` 拖拽到网页中即可完成部署。

---

### 3. 腾讯云 EdgeOne / COS 静态网站托管

1. 本地执行构建：
   ```bash
   npm run build
   ```
2. 进入腾讯云 **对象存储 (COS)** 控制台，创建存储桶（如 `whitefox-assets`），访问权限设为 **公有读私有写**。
3. 在「基础配置 → 静态网站」中开启静态页面，默认索引文档设为 `index.html`。
4. 将 `dist/` 目录下的所有文件上传至存储桶根路径。
5. （推荐）进入 **EdgeOne** 绑定个人域名，开启全站加速和边缘缓存规则。

---

### 4. 阿里云 ESA / OSS 静态托管

1. 本地编译：`npm run build`。
2. 登录阿里云 **OSS 管理控制台**，新建存储桶（读写权限设为 **公共读**）。
3. 进入「数据管理 → 静态页面」，将默认首页和 404 错误页面均配置为 `index.html`。
4. 将 `dist/` 目录上传至 OSS 存储桶。
5. （推荐）在阿里云 **ESA (边缘安全加速)** 或 CDN 中绑定域名并配置 HTTPS 证书。

---

### 5. Docker & Nginx 容器化部署

本项目提供了完备的 `Dockerfile`、`docker-compose.yml` 和生产级 `nginx.conf`：

```bash
# 启动 Docker 容器服务（默认监听 80 端口）
docker compose up -d --build
```

访问 `http://localhost` 或绑定反向代理即可使用。

---

## 🛠️ 构建与本地开发说明

```bash
# 1. 克隆代码仓库
git clone <repository_url>
cd whitefox-blog

# 2. 安装项目依赖
npm install

# 3. 启动本地开发服务器 (默认端口 5173)
npm run dev

# 4. 生产环境编译
npm run build

# 5. 生成 Cloudflare Pages 上传压缩包
npm run package:pages
```

---

## ⚙️ 环境变量配置参考 (.env.example)

在部署平台后台添加以下环境变量即可直接生效：

```ini
# 系统基础与默认站长账号
VITE_SITE_NAME=fox
VITE_ADMIN_USERNAME=fox
VITE_ADMIN_PASSWORD=your_secure_password_2025

# 现代化邮件发信 API (Resend / Cloudflare Email Routing)
VITE_EMAIL_PROVIDER=resend
VITE_EMAIL_API_KEY=re_1234567890abcdef
VITE_EMAIL_SENDER=noreply@whitefox.blog

# Cloudflare D1 边缘数据库与 R2 对象存储
VITE_CF_D1_HOST=d1.cloudflare.com
VITE_CF_D1_TOKEN=your_cf_api_token
VITE_CF_R2_BUCKET=whitefox-assets
VITE_CF_R2_DOMAIN=https://r2.whitefox.blog

# 坚果云 WebDAV 接口
VITE_WEBDAV_SERVER=https://dav.jianguoyun.com/dav/
VITE_WEBDAV_USER=user@example.com
VITE_WEBDAV_APP_PASS=your_app_password

# 编程 AI 接口 (Cloudflare Workers AI & DeepSeek)
VITE_CF_AI_ACCOUNT_ID=your_cloudflare_account_id
VITE_CF_AI_TOKEN=your_workers_ai_token
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
```

---

## 📄 开源许可

本项目遵循 MIT 协议开源。
