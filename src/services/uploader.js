/**
 * 统一文件上传核心服务 (Uploader Service)
 * 严格执行存储策略：
 * 1. 优先调用后端 /api/upload 存储至 Cloudflare R2
 * 2. 若未绑定存储桶：
 *    - 文件 <= 1.5MB: 自动降级存入 D1 数据库
 *    - 文件 > 1.5MB: 立即拦截并提示“文件大小超过1.5MB且未绑定存储桶，上传无效，请绑定存储桶”
 * 3. 涵盖所有板块：光影视界、博客文章、书架、商品周边、信件中心、AI编程、媒体影音
 */

export const MAX_INLINE_OR_D1_SIZE = 1.5 * 1024 * 1024; // 1.5MB

/**
 * 将 File 转换为 Base64 DataURL (用于纯离线演示降级)
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 统一文件上传核心方法
 * @param {File} file - 待上传的文件对象
 * @param {Object} options - 配置参数
 * @param {Function} [options.onProgress] - 上传进度回调 (0-100)
 * @param {boolean} [options.isR2Bound] - 前端当前已知的 R2 绑定状态
 * @returns {Promise<{ url: string, key?: string, storage: string, filename: string, size: number }>}
 */
export async function uploadUnifiedFile(file, options = {}) {
  if (!file) {
    throw new Error('未选择任何文件');
  }

  const { onProgress, isR2Bound } = options;
  const size = file.size;
  const name = file.name || 'unnamed_file';
  const type = file.type || 'application/octet-stream';

  // 1. 若前端已知未绑定 R2 存储桶，且文件超 1.5MB，提前在客户端进行友好阻断
  if (isR2Bound === false && size > MAX_INLINE_OR_D1_SIZE) {
    const mb = (size / (1024 * 1024)).toFixed(2);
    throw new Error(`【上传拦截】当前文件大小为 ${mb}MB，超过了无存储桶时的 1.5MB 上传限制。请先在 Cloudflare Pages 后台绑定 R2 存储桶 (BUCKET)！`);
  }

  if (onProgress) onProgress(10);

  // 2. 尝试向后端 /api/upload 发起上传
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'x-filename': encodeURIComponent(name),
        'x-file-type': type
      }
    });

    if (onProgress) onProgress(70);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // 若后端返回 413 STORAGE_BUCKET_REQUIRED
      if (response.status === 413 || data.code === 'STORAGE_BUCKET_REQUIRED') {
        throw new Error(data.error || '文件超过 1.5MB 且未绑定存储桶，上传无效，请绑定存储桶');
      }
      throw new Error(data.error || `上传失败 (HTTP ${response.status})`);
    }

    if (onProgress) onProgress(100);

    return {
      url: data.url,
      key: data.key,
      storage: data.storage, // 'r2' | 'd1' | 'inline'
      filename: data.filename || name,
      size: data.size || size,
      message: data.message
    };
  } catch (err) {
    // 如果是明确的超额或权限错误，直接往外抛
    if (err.message.includes('存储桶') || err.message.includes('1.5MB')) {
      throw err;
    }

    // 3. 网络无法连通后端 /api/upload 时的本地纯离线兜底判定
    if (size > MAX_INLINE_OR_D1_SIZE) {
      const mb = (size / (1024 * 1024)).toFixed(2);
      throw new Error(`【上传无效】文件 (${mb}MB) 超出 1.5MB 限制，且无法连接存储桶服务端。请绑定 Cloudflare R2 存储桶后再试！`);
    }

    // 小于等于 1.5MB 本地转 DataURL 兜底
    console.warn('后端上传接口不可用，转为本地轻量离线 DataURL 模式:', err.message);
    const dataUrl = await fileToDataUrl(file);
    if (onProgress) onProgress(100);

    return {
      url: dataUrl,
      key: `local_${Date.now()}_${name}`,
      storage: 'inline_fallback',
      filename: name,
      size: size,
      message: '本地离线模式：文件已暂存本地'
    };
  }
}

export { uploadUnifiedFile as uploadFileWithFallback };
export default uploadUnifiedFile;
