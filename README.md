# 白狐 (WhiteFox) 博客系统

> 🦊 东方美学设计 · 极简敏捷 · 翡翠绿与纯白质感 · 多云边缘计算知识空间

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?logo=cloudflare)](https://pages.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## 🌟 核心分层存储与同步架构 (彻底解决多端同步)

白狐博客采用业界领先的**分层协同存储与自动增量同步架构**，无论是否绑定关系型数据库，全站数据均可实现秒级跨端自动同步：

1. **Cloudflare R2（或其他对象存储桶，如腾讯云 COS、阿里云 OSS）：**
   - **职责：负责存文件实体。** 图片、音视频、电子书、附件等所有二进制静态资产一律写入存储桶。
   - 彻底解除电子书与文档格式限制（支持 PDF, EPUB, MOBI, AZW3, TXT, DOC, DOCX, FB2, CBZ, CBR, ZIP 等）。
   - 优先使用存储桶；未绑定存储桶时，<=1.5MB 文件自动降级写入 D1 附件表，>1.5MB 严格拦截提示：`文件超出1.5兆则提示上传无效，请绑定存储桶`。
2. **Cloudflare D1（或其他数据库，如 MySQL、PostgreSQL、Supabase）：**
   - **职责：负责存文件元信息（Metadata）和正确 URL，以及结构化业务数据。**
   - 存储博文、分类、评论、商品订单、在线客服聊天、配置等结构化数据。
   - 各端同步载荷严格不包含大文件 Base64，彻底保证数据库与同步 payload 的轻量与毫秒级传输。
3. **Cloudflare KV（高速边缘缓存）：**
   - **职责：仅用于缓存热点文章索引与文件列表，以及访问计数。** 不存文件本身，避免配额溢出。
4. **多端自适应冲突避免与无感增量同步：**
   - 彻底移除无意义的定时空轮询，仅在用户发生增删改实体操作时触发 1.5 秒防抖提交。
   - 采用 ID + 毫秒级时间戳（updatedAt）+ 软删除墓碑（deleted）算法，实现跨设备、多浏览器标签页间的无缝合并，彻底杜绝数据覆盖冲突。

---

## ✨ 核心特色与功能专区

### 1. 博客视界与文章配图区
- **画幅自适应居中容器：** 彻底杜绝博客封面在不同屏幕下的拉伸裁剪变形。
- **博文专属配图区：** 正文下方配备专属“博客配图区”，支持本地批量多图上传与从相册一键转贴，配图支持实时预览、缩略图展示与一键删除。
- **正文多媒体随心嵌入：** 自动将 Markdown 语法配图、外部图片直链渲染为响应式画幅图片。

### 2. 全格式沉浸式书架 (Bookshelf)
- 解除所有电子书格式限制，支持 PDF、EPUB、MOBI、AZW3、TXT、DOC、DOCX、FB2 等多种格式。
- 支持单本上架与批量多选导入，自动流式持久化至存储桶，支持在线全本解析与流式原件极速下载。
- 提供大图、卡片、紧凑、详细列表 4 种浏览排版，支持全屏沉浸阅读。

### 3. 可视化存储桶文件管理
- 画廊相册、多媒体影音中心、书架及网盘外接备份列表中，每个文件项均带有清晰的存储桶来源徽标。
- 支持一键复制存储桶直链、高速流式下载及可视化删除。

### 4. AI 编程区 (已连接仓库与在线代码编辑)
- 移除杂乱的多仓库列表，精炼为单一明确的“已连接仓库”面板，支持真实远程仓库网络探测握手。
- 提供**仓库站点代码在线编辑器**：内置核心文件树，支持在浏览器中实时查看、修改、保存站点代码并生效。

### 5. 商品文创展台与客服订单管理
- **在线客服聊天窗口：** 访客可在前台点击“联系在线客服”针对具体商品实时咨询，站长可在后台客服咨询中心实时查看并直接回复，配备自动应答机制。
- **订单分类管理后台：** 订单中心支持对【全部订单 / 已支付 / 未支付】进行精准分类筛选与状态流转管理。

### 6. 外接备份与全站一键快照
- 原生支持坚果云 Nutstore、WebDAV 云盘及 R2/COS/OSS 对象存储挂载。
- 提供博客全站数据一键 JSON 备份导出与一键还原，并配备实时操作进度条。

---

## 🚀 部署指南 (多平台全面支持)

### 方案 A：Cloudflare Pages 一键全自动部署 (推荐)

1. Fork 或克隆本仓库到您的 GitHub 账户。
2. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**。
3. 选择克隆的代码仓库：
   - **Framework preset (框架预设)**: `Vite`
   - **Build command (构建命令)**: `npm run build`
   - **Build output directory (构建输出目录)**: `dist`
4. 在 Pages 项目的 **Settings** -> **Functions** 中绑定资源：
   - **D1 数据库绑定**：变量名填写 `DB`，绑定到创建的 D1 数据库，并执行 `deploy/cloudflare-d1-schema.sql` 建表。
   - **R2 对象存储绑定**：变量名填写 `BUCKET`，绑定到您的 R2 存储桶。
   - **KV 命名空间绑定**：变量名填写 `KV`，绑定到创建的 KV 命名空间。
   - **环境变量**：设置 `ADMIN_USERNAME` (默认 `fox`) 与 `ADMIN_PASSWORD` (默认 `whitefox2025`)。
5. 点击保存并重新部署，秒级上线！

> 💡 **提示**：根目录提供 `wrangler.toml.example` 作为标准绑定配置参考。

### 方案 B：自建 VPS / Node.js 独立服务运行

项目内置轻量生产级独立服务端 `server.js`，无需依赖任何云平台即可完全离线自建：
```bash
# 1. 安装依赖并构建前端静态资源
npm install
npm run build

# 2. 启动独立服务 (包含全功能 API 与数据本地持久化)
node server.js
```
默认监听 `http://localhost:3000`，所有上传附件自动存入 `data/uploads/`，全站数据持久化于 `data/site_sync.json`。

### 方案 C：Docker / Docker-Compose 一键部署

```bash
docker compose up -d
```
服务将在 80 端口运行，并通过数据卷挂载 `./data` 目录保证数据永久安全。

---

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 启动本地开发服务
npm run dev

# 构建生产版本
npm run build
```

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源。欢迎贡献代码与 Issue 交流！
