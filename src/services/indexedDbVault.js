/**
 * IndexedDB Universal Vault for large binary files and persistent offline caches
 * Stores files, media blobs, and book content so that downloads, refreshes,
 * and cross-tab sync always have access to full file data even beyond localStorage's 5MB limit.
 */

const DB_NAME = 'whitefox_vault_db';
const DB_VERSION = 1;
const STORE_NAME = 'file_blobs';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeFileInVault(id, fileOrBlob, metadata = {}) {
  try {
    const db = await openDatabase();
    if (!db) return null;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        id,
        blob: fileOrBlob,
        name: metadata.name || '',
        type: fileOrBlob.type || metadata.type || 'application/octet-stream',
        size: fileOrBlob.size || metadata.size || 0,
        updatedAt: Date.now()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('storeFileInVault error:', err);
    return null;
  }
}

export async function getFileFromVault(id) {
  try {
    const db = await openDatabase();
    if (!db) return null;

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

export async function deleteFileFromVault(id) {
  try {
    const db = await openDatabase();
    if (!db) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {}
}
