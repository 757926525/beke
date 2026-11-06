import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const zipOutput = path.join(rootDir, 'whitefox-pages-deploy.zip');

console.log('🦊 [白狐博客] 开始打包 Cloudflare Pages 一键上传包...');

// 1. Always trigger fresh production build to ensure latest dist/_worker.js & assets
console.log('⚡ 正在执行 npm run build 生成最新前端与边缘 Worker 产物...');
execSync('npm run build', { stdio: 'inherit' });

// 2. Create archive
const output = fs.createWriteStream(zipOutput);
const archive = archiver('zip', {
  zlib: { level: 9 } // Highest compression
});

output.on('close', function () {
  const sizeMb = (archive.pointer() / (1024 * 1024)).toFixed(2);
  console.log(`\n======================================================`);
  console.log(`🎉 Cloudflare Pages 一键上传部署包生成成功！`);
  console.log(`📦 文件路径: ${zipOutput}`);
  console.log(`📊 压缩包大小: ${sizeMb} MB (${archive.pointer()} bytes)`);
  console.log(`🚀 部署使用方法:`);
  console.log(`   1. 打开 Cloudflare Dashboard -> Workers & Pages`);
  console.log(`   2. 点击 "Create application" -> 选择 "Pages" 选项卡`);
  console.log(`   3. 选择 "Upload assets" (直接上传资产)`);
  console.log(`   4. 项目名称填写 "whitefox" 或自定义`);
  console.log(`   5. 直接将本 zip 压缩包内的所有文件或解压后目录拖拽上传`);
  console.log(`   6. 点击 "Deploy site"，秒级全球 Anycast 边缘上线！`);
  console.log(`======================================================\n`);
});

archive.on('error', function (err) {
  throw err;
});

archive.pipe(output);

// Append files from dist directory
archive.directory(distDir, false);

archive.finalize();
