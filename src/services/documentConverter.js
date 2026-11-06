// src/services/documentConverter.js
// 100% pure browser-safe document conversion & Word-compatible document generator
// Free of any Node.js runtime/Buffer dependencies to prevent browser crash

/**
 * Convert a File object or ArrayBuffer of a document into plain text
 * @param {File|ArrayBuffer} fileOrBuffer
 * @returns {Promise<{text: string, html: string, rawText: string}>}
 */
export async function convertDocxToText(fileOrBuffer) {
  if (fileOrBuffer instanceof File) {
    const text = await fileOrBuffer.text();
    return {
      text: text.trim(),
      html: `<pre>${text}</pre>`,
      messages: []
    };
  }

  if (fileOrBuffer instanceof ArrayBuffer) {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(fileOrBuffer);
    return {
      text: text.trim(),
      html: `<pre>${text}</pre>`,
      messages: []
    };
  }

  return { text: '', html: '', messages: [] };
}

/**
 * Generate a Word-compatible .doc/.docx Blob cleanly in the browser
 * Uses standard Microsoft Word HTML/XML representation with rich styling
 * @param {{ title: string, author?: string, content: string, tags?: string[], category?: string, date?: string }} article
 * @returns {Promise<Blob>}
 */
export async function generateDocxBlob(article) {
  const title = article.title || '白狐博客文章';
  const author = article.author || '白狐站长';
  const category = article.category || '默认';
  const date = article.date || new Date().toISOString().slice(0, 10);
  const bodyContent = (article.content || '')
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return `<h1 style="color:#0f172a; font-size:22pt; margin-top:16pt; margin-bottom:8pt;">${trimmed.replace(/^#\s+/, '')}</h1>`;
      }
      if (trimmed.startsWith('## ')) {
        return `<h2 style="color:#047857; font-size:16pt; margin-top:14pt; margin-bottom:6pt;">${trimmed.replace(/^##\s+/, '')}</h2>`;
      }
      if (trimmed.startsWith('### ')) {
        return `<h3 style="color:#334155; font-size:13pt; margin-top:12pt; margin-bottom:4pt;">${trimmed.replace(/^###\s+/, '')}</h3>`;
      }
      if (!trimmed) {
        return '<p style="margin:0; height:10pt;">&nbsp;</p>';
      }
      return `<p style="font-size:11pt; line-height:1.75; margin-bottom:6pt; color:#1e293b;">${line}</p>`;
    })
    .join('');

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Microsoft YaHei', -apple-system, sans-serif; padding: 40px; color: #1e293b; }
        .meta { color: #64748b; font-size: 10pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 8pt; margin-bottom: 16pt; }
      </style>
    </head>
    <body>
      <h1 style="font-size: 24pt; color: #047857; margin-bottom: 8pt;">${title}</h1>
      <div class="meta">作者: ${author} &nbsp;|&nbsp; 分类: ${category} &nbsp;|&nbsp; 发布时间: ${date}</div>
      <div>${bodyContent}</div>
    </body>
    </html>
  `;

  return new Blob([wordHtml], { type: 'application/msword' });
}

/**
 * Trigger download of a Blob or text content
 * @param {Blob|string} content
 * @param {string} filename
 * @param {string} mimeType
 */
/**
 * Safely trigger download for a Blob, data URL, http(s) URL, or string content
 * @param {Blob|string} contentOrUrl
 * @param {string} filename
 * @param {string} mimeType
 */
import { getFileFromVault } from './indexedDbVault';

export async function downloadFile(contentOrUrl, filename, mimeType = 'application/octet-stream') {
  try {
    if (typeof contentOrUrl === 'string') {
      // 1. 如果是 vault://{fileId} 格式，从本地 IndexedDB 保险库读取原始 Blob 下载
      if (contentOrUrl.startsWith('vault://')) {
        const fileId = contentOrUrl.replace(/^vault:\/\//, '');
        const record = await getFileFromVault(fileId);
        if (record && record.blob) {
          const objUrl = URL.createObjectURL(record.blob);
          const a = document.createElement('a');
          a.href = objUrl;
          a.download = filename || record.name || 'download';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(objUrl), 1000);
          return;
        }
      }

      // 2. 如果是 data: URL
      if (contentOrUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = contentOrUrl;
        a.download = filename || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      // 3. 如果是 blob: URL (尝试 fetch 或直接下载)
      if (contentOrUrl.startsWith('blob:')) {
        try {
          const a = document.createElement('a');
          a.href = contentOrUrl;
          a.download = filename || 'download';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          return;
        } catch (e) {
          console.warn('Blob URL download error, trying fallback:', e);
        }
      }

      // 4. 如果是 HTTP/HTTPS 远程 URL 或 /api/upload 相对 URL
      if (contentOrUrl.startsWith('http://') || contentOrUrl.startsWith('https://') || contentOrUrl.startsWith('/api/')) {
        let downloadTargetUrl = contentOrUrl;
        // 如果是 /api/upload 路径，自动附带 ?download=1 参数以获得 Content-Disposition: attachment 强制下载
        if (contentOrUrl.includes('/api/upload') && !contentOrUrl.includes('download=')) {
          downloadTargetUrl += (contentOrUrl.includes('?') ? '&' : '?') + 'download=1';
        }

        try {
          const resp = await fetch(downloadTargetUrl, { mode: 'cors' });
          if (resp.ok) {
            const blob = await resp.blob();
            const objUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objUrl;
            a.download = filename || 'download';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(objUrl), 1000);
            return;
          }
        } catch {
          // If fetch fails (e.g. CORS), fallback to browser direct download link
        }

        const a = document.createElement('a');
        a.href = downloadTargetUrl;
        a.download = filename || 'download';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      // 5. Fallback: raw text content
      const blob = new Blob([contentOrUrl], { type: mimeType });
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = filename || 'download.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objUrl), 1000);
      return;
    }

    if (contentOrUrl instanceof Blob) {
      const objUrl = URL.createObjectURL(contentOrUrl);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = filename || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);
    }
  } catch (e) {
    console.error('Download error:', e);
    // Ultimate fallback: open in new tab
    if (typeof contentOrUrl === 'string') {
      window.open(contentOrUrl, '_blank');
    }
  }
}
