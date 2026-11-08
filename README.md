# 白狐 (WhiteFox) 博客系统

> 🦊 东方美学设计 · 极简敏捷 · 翡翠绿与纯白质感 · 多云边缘计算知识空间

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?logo=cloudflare)](https://pages.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## 🌟 核心分层存储与同步架构 (彻底解决多端同步)

> ⚠️ **重要部署须知**：为了获得最完整和高速的运行体验，**强烈建议同时配置并绑定 Cloudflare R2 对象存储桶（或外部 S3/COS/OSS）与 Cloudflare D1 数据库**：
> - **对象存储桶 (R2/S3/OSS)**：专职存放图片、视频、音乐及大格式电子书等大文件实体。
> - **数据库 (D1/MySQL/PG)**：专职统一管理全站文件列表、文件元信息（`files_metadata`）和正确下载/直链 URL；小文件优先直存数据库。若无数据库则由 KV 边缘缓存兜底。

### 核心分工规范：
1. **所有文件列表由数据库统一管理 (无数据库则用 KV)**：
   - 无论是在相册、影音、书架还是网盘中，文件索引与元数据统一存入 D1 的 `files_metadata` 表。
   - 在未绑定 D1 数据库的环境下，自动降级至边缘 KV (`files_metadata_cache`) 管理列表，保证轻量高效。
2. **大文件实体（视频、音乐、图片）优先用对象存储桶**：
   - 静态媒体资源优先直传 Cloudflare R2 对象存储，未绑定存储桶时自动降级存入 D1 附件表（<= 1.5MB），超出 1.5MB 提示绑定存储桶。
3. **小文件优先存入数据库**：
   - <= 100KB 的小文本、离线文档、配置载荷优先存入 D1 数据库，减少存储桶请求频次。
4. **Cloudflare KV（高速边缘缓存）**：
   - 仅用于缓存文件列表与热点文章，不存大文件本身，保障边缘响应毫秒级。
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
