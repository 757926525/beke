/**
 * 统一文件上传器与解析调度中心 (src/services/uploader.js)
 *
 * 核心设计：
 * 1. 优先尝试通过 POST /api/upload 上传到 Cloudflare R2 对象存储，获取永久 URL 与下载直链
 * 2. 同时将文件安全缓存至本地 IndexedDB 保险库（避免跨端或刷新后临时 blob: 失效导致无法下载）
 * 3. 对图片支持 Canvas 智能轻量化压缩
 * 4. 彻底解决“图片/文件不能上传下载、只能保存不能下同步”的问题
 */

import { storeFileInVault, getFileFromVault } from './indexedDbVault';
import { getAdminToken } from './storageService';

/**
 * 压缩图片至合适的尺寸与体积
 */
export async function compressImage(file, maxDimension = 1280, quality = 0.85) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * 统一文件上传函数
 * @param {File|Blob} file 待上传的文件
 * @param {object} options 选项 { compress: boolean, maxDimension: number, fileId: string }
 * @returns {Promise<{success: boolean, url: string, downloadUrl: string, storage: string, fileId: string, name: string, size: number, type: string}>}
 */
export async function uploadFileUniversal(file, options = {}) {
  let processedFile = file;
  const isImage = file.type && file.type.startsWith('image/');
  const fileName = file.name || options.fileName || `file_${Date.now()}`;
  const fileId = options.fileId || `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // 1. 如果是图片且允许压缩，先行轻量化
  if (isImage && options.compress !== false) {
    try {
      processedFile = await compressImage(file, options.maxDimension || 1280);
    } catch (e) {
      console.warn('Image compression warning, using original:', e);
    }
  }

  // 2. 存入本地持久化 IndexedDB 保险库（保证即便无外网也能永久离线查看和下载，不随刷新丢失）
  await storeFileInVault(fileId, processedFile, {
    name: fileName,
    type: processedFile.type || file.type,
    size: processedFile.size
  });

  // 3. 尝试向服务端 /api/upload 提交（直传 R2）
  let serverResult = null;
  try {
    const formData = new FormData();
    formData.append('file', processedFile, fileName);

    const headers = {};
    const adminToken = getAdminToken();
    if (adminToken) headers['X-Admin-Token'] = adminToken;

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers,
      body: formData
    });

    if (res.ok) {
      serverResult = await res.json();
    }
  } catch (err) {
    // 服务端不可达或本地预览环境
    console.warn('Upload to server API notice:', err.message);
  }

  // 4. 服务端成功返回（R2 直链 或 DataURL）
  if (serverResult && serverResult.success && serverResult.url) {
    return {
      success: true,
      fileId,
      url: serverResult.url,
      downloadUrl: serverResult.downloadUrl || serverResult.url,
      storage: serverResult.storage || 'r2',
      name: fileName,
      size: processedFile.size,
      type: processedFile.type
    };
  }

  // 5. 若未配置 R2 或离线环境：
  // 对于小于 500KB 的小文件/图片，转成 Data URL，方便全网同步与离线跨端展示
  if (processedFile.size < 500 * 1024) {
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(processedFile);
    });

    if (dataUrl) {
      return {
        success: true,
        fileId,
        url: dataUrl,
        downloadUrl: dataUrl,
        storage: 'local_dataurl',
        name: fileName,
        size: processedFile.size,
        type: processedFile.type
      };
    }
  }

  // 6. 对于较大文件且无 R2 绑定时，使用 IndexedDB 专用协议 URL: `vault://{fileId}`
  // 并在当前页面提供基于 blob 的快速预览链接，同时保证 downloadFile 遇到 vault:// 时能从 IndexedDB 读取下载！
  const localBlobUrl = URL.createObjectURL(processedFile);
  return {
    success: true,
    fileId,
    url: localBlobUrl, // 当前会话预览
    vaultUrl: `vault://${fileId}`, // 持久化引用
    downloadUrl: localBlobUrl,
    storage: 'indexeddb_vault',
    name: fileName,
    size: processedFile.size,
    type: processedFile.type
  };
}
