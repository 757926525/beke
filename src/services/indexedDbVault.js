// src/services/indexedDbVault.js
// Universal IndexedDB File Vault for WhiteFox Blog
// Safely stores large Blobs (videos, audios, ebooks, high-res photos)
// completely bypassing the 5MB localStorage limit and preventing broken Blob URLs across refreshes.

const DB_NAME = 'whitefox_vault_db';
const DB_VERSION = 1;
const STORE_FILES = 'vault_files';

/**
 * Open or upgrade the IndexedDB instance
 * @returns {Promise<IDBDatabase>}
 */
export function openVaultDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Store a File or Blob in IndexedDB with an associated identifier
 * @param {string} id Unique file ID (e.g., 'media-xxx', 'book-xxx')
 * @param {Blob|File} blob Binary content
 * @param {Object} metadata Extra metadata (name, type, size, etc.)
 * @returns {Promise<boolean>}
 */
export async function saveVaultFile(id, blob, metadata = {}) {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      const record = {
        id,
        blob,
        name: metadata.name || 'file',
        type: metadata.type || blob.type || 'application/octet-stream',
        size: metadata.size || blob.size || 0,
        savedAt: Date.now()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error(`Failed to save file to IndexedDB [${id}]:`, err);
    return false;
  }
}

/**
 * Get a File or Blob by ID from IndexedDB
 * @param {string} id
 * @returns {Promise<{id: string, blob: Blob, name: string, type: string, size: number}|null>}
 */
export async function getVaultFile(id) {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, 'readonly');
      const store = tx.objectStore(STORE_FILES);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error(`Failed to get file from IndexedDB [${id}]:`, err);
    return null;
  }
}

/**
 * Delete a file by ID from IndexedDB
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteVaultFile(id) {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error(`Failed to delete file from IndexedDB [${id}]:`, err);
    return false;
  }
}

// In-memory cache for created Object URLs to prevent memory leaks and reuse URLs
const activeBlobUrlMap = new Map();

/**
 * Load or create a persistent Object URL for a given vault file ID
 * @param {string} id
 * @returns {Promise<string|null>} Returns a fresh blob: URL or null if not found
 */
export async function getVaultFileUrl(id) {
  if (activeBlobUrlMap.has(id)) {
    return activeBlobUrlMap.get(id);
  }

  const record = await getVaultFile(id);
  if (!record || !record.blob) return null;

  const url = URL.createObjectURL(record.blob);
  activeBlobUrlMap.set(id, url);
  return url;
}

/**
 * Revoke an active Object URL from cache
 * @param {string} id
 */
export function revokeVaultFileUrl(id) {
  if (activeBlobUrlMap.has(id)) {
    URL.revokeObjectURL(activeBlobUrlMap.get(id));
    activeBlobUrlMap.delete(id);
  }
}
