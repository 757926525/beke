import * as esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';

/**
 * Vite 插件：在构建结束后自动将 src/_worker.js 编译并打包至 dist/_worker.js
 * 使得 Cloudflare Pages 无论使用 Direct Upload (上传 Zip/拖拽) 还是 Git 部署，
 * 均能以 Advanced Mode 自动接管全部 /api/* 请求，彻底避免 405 Method Not Allowed。
 */
export function cloudflareWorkerPlugin() {
  return {
    name: 'cloudflare-worker-bundler',
    apply: 'build',
    async closeBundle() {
      const rootDir = process.cwd();
      const entry = path.join(rootDir, 'src', '_worker.js');
      const outfile = path.join(rootDir, 'dist', '_worker.js');

      if (!fs.existsSync(entry)) {
        console.warn('⚠️ [Vite Plugin] src/_worker.js 不存在，跳过 _worker.js 打包');
        return;
      }

      console.log('⚡ [Vite Plugin] 正在编译生成 Cloudflare Pages _worker.js 全功能边缘入口...');
      try {
        await esbuild.build({
          entryPoints: [entry],
          bundle: true,
          outfile,
          format: 'esm',
          platform: 'browser',
          target: 'es2022',
          minify: false
        });
        console.log('✅ [Vite Plugin] dist/_worker.js 构建成功！');
      } catch (err) {
        console.error('❌ [Vite Plugin] 编译 dist/_worker.js 失败:', err);
      }
    }
  };
}
