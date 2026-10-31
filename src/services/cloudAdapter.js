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

    // Attempt to determine category/zone based on parent DL / H3
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
        selected: true
      });
    }
  });

  return results;
}

/**
 * Universal Cloud Storage & D1 DB Sync Adapter
 */
export class UniversalCloudAdapter {
  constructor(config) {
    this.config = config;
  }

  // Cloudflare D1 Synchronization
  async syncDatabase(data) {
    const { d1 } = this.config;
    if (!d1 || !d1.enabled) {
      return { success: false, message: 'Cloudflare D1 未启用，数据保存在本地 IndexedDB/LocalStorage' };
    }
    // Simulate D1 API batch transaction
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          provider: 'Cloudflare D1',
          syncedRecords: Object.keys(data).reduce((acc, k) => acc + (Array.isArray(data[k]) ? data[k].length : 1), 0),
          timestamp: new Date().toISOString()
        });
      }, 700);
    });
  }

  // Cloudflare R2 / Aliyun OSS / Tencent COS Upload
  async uploadMedia(file, provider = 'r2') {
    const cfg = this.config[provider] || this.config.r2;
    return new Promise((resolve) => {
      setTimeout(() => {
        const fileUrl = URL.createObjectURL(file);
        resolve({
          success: true,
          provider: provider.toUpperCase(),
          url: fileUrl,
          fileName: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString()
        });
      }, 600);
    });
  }

  // NetDrive (WebDAV / AList / 百度网盘 / 夸克网盘) integration
  async saveToNetDrive(fileInfo, targetDir = '/白狐博客专存/') {
    const { netDrive } = this.config;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          provider: netDrive.provider,
          filePath: `${targetDir}${fileInfo.title || fileInfo.name || 'document'}`,
          syncDate: new Date().toLocaleString(),
          shareUrl: `https://pan.whitefox.blog/s/${Math.random().toString(36).substring(7)}`
        });
      }, 800);
    });
  }
}
