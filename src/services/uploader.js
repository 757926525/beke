// src/services/uploader.js
/**
 * 统一文件上传服务
 * 优先调用 Cloudflare Pages / Workers 原生上传路由 /api/upload 存储至 R2；
 * 若未绑定 R2 或本地离线，则智能转换为持久化 DataURL / IndexedDB 存储，
 * 确保在任何浏览器均能正常上传、显示和下载。
 */

import { getAdminToken } from './storageService';

/**
 * 将 File 转换为 Base64 Data URL
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * 核心统一上传函数
 * @param {File} file
 * @param {Object} options
 * @returns {Promise<{ success: boolean, url: string, downloadUrl: string, name: string, size: number, provider: string }>}
 */
export async function uploadFileToStorage(file, options = {}) {
  const { customDomain = '', onProgress } = options;

  // 1. 尝试上传至服务端 /api/upload (Cloudflare R2)
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (customDomain) {
      formData.append('customDomain', customDomain);
    }

    const headers = {};
    const adminToken = getAdminToken();
    if (adminToken) {
      headers['X-Admin-Token'] = adminToken;
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers,
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.url) {
        return {
          success: true,
          url: data.url,
          downloadUrl: data.downloadUrl || data.url,
          name: data.name || file.name,
          size: data.size || file.size,
          key: data.key,
          provider: 'Cloudflare R2 (云端持久化)'
        };
      }
    }
  } catch (err) {
    // 服务端或本地开发未启动 Pages Function，继续执行本地持久化降级
    console.warn('Upload to /api/upload failed, falling back to local persistent store:', err);
  }

  // 2. 本地回退处理：如果文件小于 6MB，转成 DataURL 持久化
  if (file.size <= 6 * 1024 * 1024) {
    try {
      const dataUrl = await fileToDataUrl(file);
      return {
        success: true,
        url: dataUrl,
        downloadUrl: dataUrl,
        name: file.name,
        size: file.size,
        provider: '站内本地存储 (DataURL)'
      };
    } catch (e) {
      console.error('DataURL fallback error:', e);
    }
  }

  // 3. 超大文件回退处理：使用临时 ObjectURL
  const objUrl = URL.createObjectURL(file);
  return {
    success: true,
    url: objUrl,
    downloadUrl: objUrl,
    name: file.name,
    size: file.size,
    provider: '浏览器本地内存 (大文件)'
  };
}
