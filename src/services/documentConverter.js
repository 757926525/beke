// src/services/documentConverter.js
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

/**
 * Convert a File object or ArrayBuffer of a .docx file into plain text or HTML
 * @param {File|ArrayBuffer} fileOrBuffer
 * @returns {Promise<{text: string, html: string, rawText: string}>}
 */
export async function convertDocxToText(fileOrBuffer) {
  let arrayBuffer;
  if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else if (fileOrBuffer && typeof fileOrBuffer.arrayBuffer === 'function') {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    throw new Error('无效的文件或数据流');
  }

  // Extract raw text
  const rawResult = await mammoth.extractRawText({ arrayBuffer });
  // Also extract HTML in case rich rendering is desired
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer });

  return {
    text: rawResult.value.trim(),
    html: htmlResult.value,
    messages: rawResult.messages || []
  };
}

/**
 * Generate a .docx blob from an article (title, author, content)
 * @param {{ title: string, author?: string, content: string, tags?: string[], category?: string, date?: string }} article
 * @returns {Promise<Blob>}
 */
export async function generateDocxBlob(article) {
  const lines = (article.content || '').split('\n');
  const paragraphs = [
    new Paragraph({
      text: article.title || '白狐博客文章',
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `作者: ${article.author || '白狐站长'}   |   分类: ${article.category || '默认'}   |   发布时间: ${article.date || new Date().toISOString().slice(0, 10)}`,
          italics: true,
          color: '666666',
          size: 20
        })
      ],
      spacing: { after: 300 }
    })
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      paragraphs.push(new Paragraph({
        text: trimmed.replace(/^#\s+/, ''),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 }
      }));
    } else if (trimmed.startsWith('## ')) {
      paragraphs.push(new Paragraph({
        text: trimmed.replace(/^##\s+/, ''),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }));
    } else if (trimmed.startsWith('### ')) {
      paragraphs.push(new Paragraph({
        text: trimmed.replace(/^###\s+/, ''),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 160, after: 80 }
      }));
    } else {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: line, size: 24 })],
        spacing: { after: 120, line: 360 }
      }));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs
      }
    ]
  });

  return await Packer.toBlob(doc);
}

/**
 * Trigger download of a Blob or text content
 * @param {Blob|string} content
 * @param {string} filename
 * @param {string} mimeType
 */
export function downloadFile(content, filename, mimeType = 'text/plain;charset=utf-8') {
  let blob;
  if (content instanceof Blob) {
    blob = content;
  } else {
    blob = new Blob([content], { type: mimeType });
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
