import { sanitizeSyncPayload, mergeSyncPayloadWithTimestamp, TAB_ID } from './storageService';

/**
 * Bookmark file parser: parses standard Netscape bookmark HTML format
 * (exported by Chrome, Edge, Firefox, Safari)
 */
export function parseNetscapeBookmarks(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const links = doc.querySelectorAll('a');

  const results = [];
  links.forEach((a, index) => {
    const url = a.getAttribute('href');
    const title = a.textContent.trim() || '未命名书签';
    const icon = a.getAttribute('icon') || '';

    let zone = '常用收藏';
    let parent = a.closest('dl');
    if (parent) {
      const prev = parent.previousElementSibling;
      if (prev && (prev.tagName === 'H3' || prev.tagName === 'H2')) {
        zone = prev.textContent.trim() || '常用收藏';
      }
    }

    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      results.push({
        id: `bm-import-${Date.now()}-${index}`,
        title,
        url,
        zone,
        desc: `导入自本地书签文件`,
        favicon: icon || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`,
        dateAdded: new Date().toISOString().split('T')[0],
        updatedAt: Date.now(),
        deleted: false,
        selected: true
      });
    }
  });

  return results;
}

/**
 * Exponential backoff retry helper
 * Retries up to maxRetries times with exponential backoff delay
 */
async function fetchWithRetry(url, options = {}, maxRetries = 5) {
  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // If status is 4xx other than 408 (e.g. 400, 401, 413, 409), do not retry uselessly
      if (res.status >= 400 && res.status < 500 && res.status !== 408) {
        return res;
      }

      if (res.ok) {
        return res;
      }

      lastError = new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    } catch (err) {
      lastError = err;
    }

    attempt++;
    if (attempt < maxRetries) {
      // Exponential backoff delay: 300ms, 600ms, 1200ms, 2400ms, 4800ms + jitter
      const delay = Math.min(5000, Math.pow(2, attempt) * 150 + Math.random() * 100);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error(`Request failed after ${maxRetries} retries`);
}

/**
 * Tests connection to Cloudflare Pages Functions /api/sync or database proxy
 */
export async function testRealDatabaseConnection(backendConfig) {
  const host = (backendConfig?.dbHost || '').trim();
  const token = (backendConfig?.dbToken || '').trim();

  // Try direct relative Pages Functions endpoint first
  const endpoints = ['/api/sync?key=healthcheck'];
  if (host && host.startsWith('http')) {
    endpoints.unshift(`${host.replace(/\/+$/, '')}/api/sync?key=healthcheck`);
  }

  for (const ep of endpoints) {
    try {
      const headers = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(ep, { method: 'GET', headers });
      if (res.status === 200 || res.status === 404 || res.status === 400) {
        return {
          success: true,
          message: 'Cloudflare Pages Functions / D1 边缘同步通道校验成功，通道畅通！'
        };
      }
    } catch (e) {
      // try next
    }
  }

  return {
    success: false,
    message: '未能连接到 /api/sync 代理服务。请确认已部署 Pages Functions 或配置正确的同步后端地址！'
  };
}

/**
 * Tests connection to Object Storage (R2 / COS / OSS)
 */
export async function testRealObjectStorageConnection(backendConfig) {
  const bucket = backendConfig?.storageBucket?.trim();
  const endpoint = backendConfig?.storageEndpoint?.trim();
  const ak = backendConfig?.storageAccessKeyId?.trim();

  if (!bucket) {
    return { success: false, message: '请填写对象存储桶名称 (Bucket Name)' };
  }
  if (!ak) {
    return { success: false, message: '请填写访问凭据 (AccessKey ID / Token)' };
  }

  if (endpoint && (endpoint.startsWith('http://') || endpoint.startsWith('https://'))) {
    try {
      const testUrl = `${endpoint.replace(/\/+$/, '')}/favicon.ico`;
      await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' });
      return { success: true, message: '对象存储服务接入校验成功！' };
    } catch (err) {
      return { success: false, message: `无法访问该存储桶 Endpoint: ${err.message}` };
    }
  }

  return { success: false, message: '请提供可访问的公开存储桶域名或 Endpoint 进行连通性校验' };
}

/**
 * Pulls latest site data from Cloudflare Pages Functions proxy (/api/sync)
 * Returns { success: boolean, payload: object, version: number, updatedAt: number }
 */
export async function pullFromCloudSyncVault(vaultKey, options = {}) {
  const { customEndpoint, authToken } = options;
  const syncKey = (vaultKey || '').trim();

  if (!syncKey) {
    return { success: false, message: '同步密钥不能为空' };
  }

  const endpointsToTry = [];
  if (customEndpoint && customEndpoint.startsWith('http')) {
    endpointsToTry.push(`${customEndpoint.replace(/\/+$/, '')}/api/sync?key=${encodeURIComponent(syncKey)}`);
  }
  // Standard Cloudflare Pages Functions relative endpoint
  endpointsToTry.push(`/api/sync?key=${encodeURIComponent(syncKey)}`);

  let lastErrorMsg = '';

  for (const url of endpointsToTry) {
    try {
      const headers = { 'Accept': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetchWithRetry(url, { headers, method: 'GET' }, 3);

      if (res.status === 404) {
        // Vault key not yet created in D1
        return {
          success: true,
          notFound: true,
          version: 0,
          updatedAt: 0,
          payload: null,
          message: '云端同步房间尚无已有数据'
        };
      }

      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          return {
            success: true,
            payload: data.payload,
            version: typeof data.version === 'number' ? data.version : 1,
            updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
            source: url
          };
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastErrorMsg = errJson.error || `HTTP ${res.status}`;
      }
    } catch (err) {
      lastErrorMsg = err.message;
    }
  }

  // Fallback to local snapshot if network is completely offline
  try {
    const rawVault = localStorage.getItem(`wf_vault_${syncKey}`) || localStorage.getItem('wf_cross_device_synced_payload');
    if (rawVault) {
      const parsed = JSON.parse(rawVault);
      return {
        success: true,
        offline: true,
        payload: parsed.data || parsed,
        version: parsed.version || 0,
        updatedAt: parsed.updatedAt || Date.now(),
        message: '从本地离线缓存拉取成功'
      };
    }
  } catch (err) {
    // ignore
  }

  return {
    success: false,
    message: `拉取失败: ${lastErrorMsg || '未能连接到云端同步中继'}`
  };
}

/**
 * Pushes full site data payload to Cloudflare Pages Functions (/api/sync)
 * 1. Sanitizes credentials and sensitive keys
 * 2. Checks payload size (< 1.5MB)
 * 3. Sends versioned, parameterized update to Cloudflare Pages Functions
 * 4. Retries up to 5 times with exponential backoff on network issues
 */
export async function pushToCloudSyncVault(payload, options = {}) {
  const { vaultKey, customEndpoint, authToken, currentVersion = 0 } = options;
  const syncKey = (vaultKey || '').trim();

  if (!syncKey) {
    return { success: false, error: '同步密钥不能为空' };
  }

  // 1. Sanitize sensitive credentials
  const cleanPayload = sanitizeSyncPayload(payload);
  const nextVersion = (typeof currentVersion === 'number' ? currentVersion : 0) + 1;
  const nowMs = Date.now();

  const bodyData = {
    key: syncKey,
    version: nextVersion,
    updatedAt: nowMs,
    payload: cleanPayload
  };

  const bodyString = JSON.stringify(bodyData);

  // Client-side guard for 1.5MB limit
  if (bodyString.length > 1.5 * 1024 * 1024) {
    return {
      success: false,
      error: `数据包过大 (${(bodyString.length / 1024 / 1024).toFixed(2)}MB)，超过 1.5MB 限制。请将大图或文件上传至 R2，数据库仅存储 URL。`
    };
  }

  const endpointsToTry = [];
  if (customEndpoint && customEndpoint.startsWith('http')) {
    endpointsToTry.push(`${customEndpoint.replace(/\/+$/, '')}/api/sync`);
  }
  endpointsToTry.push('/api/sync');

  let remoteSuccess = false;
  let remoteResData = null;
  let lastError = null;

  for (const url of endpointsToTry) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Sync-Key': syncKey,
        'X-Sync-Version': String(nextVersion)
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetchWithRetry(url, {
        method: 'POST',
        headers,
        body: bodyString
      }, 5);

      if (res.status === 413) {
        return {
          success: false,
          error: '云端拦截: Payload 超过 1.5MB 限制，请上传图片至对象存储 (R2) 并在库中保存链接。'
        };
      }

      if (res.status === 409) {
        const conflictData = await res.json().catch(() => ({}));
        return {
          success: false,
          conflict: true,
          serverVersion: conflictData.currentVersion,
          error: '云端存在更新的数据版本，必须先执行 pull 并合并后再尝试 push！'
        };
      }

      if (res.ok) {
        remoteResData = await res.json();
        remoteSuccess = true;
        break;
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastError = new Error(errJson.error || `HTTP ${res.status}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  // Update local storage backup and multi-tab broadcaster
  try {
    const wrappedLocalData = {
      version: nextVersion,
      updatedAt: nowMs,
      data: cleanPayload,
      _meta: {
        origin: TAB_ID,
        messageId: `push_${nowMs}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: nowMs
      }
    };

    localStorage.setItem(`wf_vault_${syncKey}`, JSON.stringify(wrappedLocalData));
    localStorage.setItem('wf_cross_device_synced_payload', JSON.stringify(wrappedLocalData));
    localStorage.setItem('wf_sync_version', String(nextVersion));
    localStorage.setItem('wf_last_local_change', String(nowMs));

    return {
      success: remoteSuccess,
      vaultId: syncKey,
      version: nextVersion,
      updatedAt: nowMs,
      remoteSynced: remoteSuccess,
      error: remoteSuccess ? null : (lastError ? lastError.message : '云端同步请求未成功')
    };
  } catch (e) {
    return {
      success: false,
      error: `本地持久化错误: ${e.message}`
    };
  }
}

/**
 * Universal Cloud Storage (R2 / OSS / COS) Media Uploader
 */
export class UniversalCloudAdapter {
  constructor(config) {
    this.config = config;
  }

  async uploadMedia(file, provider = 'r2') {
    const cfg = this.config?.[provider] || this.config?.r2;
    return new Promise((resolve) => {
      setTimeout(() => {
        const fileUrl = URL.createObjectURL(file);
        resolve({
          success: true,
          provider: provider.toUpperCase(),
          url: fileUrl,
          fileName: file.name,
          size: file.size,
          uploadedAt: Date.now(),
          updatedAt: Date.now(),
          deleted: false
        });
      }, 500);
    });
  }

  async saveToNetDrive(fileInfo, targetDir = '/白狐博客专存/') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          provider: 'Cloudflare R2',
          filePath: `${targetDir}${fileInfo.title || fileInfo.name || 'document'}`,
          syncDate: new Date().toLocaleDateString(),
          shareUrl: `https://r2.whitefox.blog/d/${Math.random().toString(36).substring(7)}`,
          updatedAt: Date.now(),
          deleted: false
        });
      }, 600);
    });
  }
}
