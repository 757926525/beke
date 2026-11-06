/**
 * IndexedDB 本地文件与媒体保险库 (src/services/indexedDbVault.js)
 *
 * 解决问题：
 * 1. 本地存储 (localStorage) 配额仅约 5MB，若存入文件 Base64 会导致 QuotaExceededError 崩溃
 * 2. 使用 URL.createObjectURL(file) 只是内存指针，页面刷新、关闭标签页或重新进入后全部失效（无法显示、无法播放、无法下载）
 * 3. 通过浏览器原生 IndexedDB，提供数十 GB 级别的离线持久化能力；即使无网络、未接入 R2，刷新页面依然可直接下载与预览！
 */

const DB_NAME = 'whitefox_file_vault';
const DB_VERSION = 1;
const STORE_NAME = 'vault_files';

let dbPromise = null;

function getDB() {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is not supported in this environment'));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

/**
 * 存储文件/Blob 到 IndexedDB
 * @param {string} id 唯一文件标识
 * @param {Blob|File} blobData 文件或 Blob
 * @param {object} meta 元信息（name, type, size 等）
 */
export async function storeFileInVault(id, blobData, meta = {}) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record = {
        id,
        blob: blobData,
        name: meta.name || 'file',
        type: meta.type || blobData.type || 'application/octet-stream',
        size: blobData.size || 0,
        createdAt: Date.now()
      };

      const req = store.put(record);
      req.onsuccess = () => resolve({ id, success: true });
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('storeFileInVault error:', err);
    return { id, success: false, error: err.message };
  }
}

/**
 * 从 IndexedDB 获取文件
 * @param {string} id
 * @returns {Promise<{id, blob, name, type, size}|null>}
 */
export async function getFileFromVault(id) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('getFileFromVault error:', err);
    return null;
  }
}

/**
 * 删除 IndexedDB 中的文件
 */
export async function deleteFileFromVault(id) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('deleteFileFromVault error:', err);
    return false;
  }
}
