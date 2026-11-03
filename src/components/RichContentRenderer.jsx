import React from 'react';
import { ExternalLink, Play, Music, Film, FileText, Download } from 'lucide-react';

/**
 * RichContentRenderer parses markdown and rich embedded blocks:
 * - Images: ![alt](url)
 * - Videos: 🎬 [title](url) or HTML5 video tags / links
 * - Audios: 🎵 [title](url) or HTML5 audio tags / links
 * - Website Citations / External links: [title](url) -> rendered as clickable interactive badge/link opening in new tab
 * - Standard paragraphs, blockquotes, code blocks, and headings
 */
export const RichContentRenderer = ({ content = '' }) => {
  if (!content) return null;

  // Split content into blocks by double newline
  const blocks = content.split(/\n\s*\n/);

  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();

        // 1. Video block pattern: 🎬 [title](url)
        const videoMatch = trimmed.match(/^🎬\s*\[(.*?)\]\((.*?)\)$/);
        if (videoMatch) {
          const [, title, url] = videoMatch;
          return (
            <div key={idx} className="my-4 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md p-3">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold mb-2 px-1">
                <Film className="w-4 h-4" />
                <span>嵌入视频：{title}</span>
              </div>
              <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center aspect-video max-h-96">
                <video
                  src={url}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain"
                >
                  您的浏览器不支持视频播放。
                </video>
              </div>
            </div>
          );
        }

        // 2. Audio block pattern: 🎵 [title](url)
        const audioMatch = trimmed.match(/^🎵\s*\[(.*?)\]\((.*?)\)$/);
        if (audioMatch) {
          const [, title, url] = audioMatch;
          return (
            <div key={idx} className="my-4 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">{title}</h4>
                  <p className="text-[10px] text-emerald-700">白狐原声音频流 · 支持在线试听与播放</p>
                </div>
              </div>
              <audio
                src={url}
                controls
                className="w-full sm:w-64 accent-emerald-600"
              >
                您的浏览器不支持音频播放。
              </audio>
            </div>
          );
        }

        // 3. Image block: ![alt](url)
        const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imageMatch) {
          const [, alt, url] = imageMatch;
          return (
            <div key={idx} className="my-4 space-y-1.5">
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                <img
                  src={url}
                  alt={alt}
                  className="w-full max-h-[500px] object-contain mx-auto"
                />
              </div>
              {alt && (
                <p className="text-center text-[11px] text-slate-400 italic">
                  {alt}
                </p>
              )}
            </div>
          );
        }

        // 4. NetDrive / File Hub attachment block: 📦 [title](url)
        const fileMatch = trimmed.match(/^📦\s*\[(.*?)\]\((.*?)\)$/);
        if (fileMatch) {
          const [, title, url] = fileMatch;
          return (
            <div key={idx} className="my-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{title}</h4>
                  <p className="text-[10px] text-slate-400">多云调度中枢资源 · 点击即可直达下载</p>
                </div>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>获取文件</span>
              </a>
            </div>
          );
        }

        // 5. Website citation block: 🌐 **引用网站**：[title](url)
        if (trimmed.startsWith('🌐')) {
          // Parse title & url
          const linkExtract = trimmed.match(/\[(.*?)\]\((.*?)\)/);
          if (linkExtract) {
            const [, siteTitle, siteUrl] = linkExtract;
            const noteExtract = trimmed.match(/> 来源备注:\s*(.*)/);
            const note = noteExtract ? noteExtract[1] : '';

            return (
              <div key={idx} className="my-4 p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-emerald-50/60 border border-sky-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-bold text-sky-900">
                    <span>🌐 引用站点：</span>
                    <a
                      href={siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-sky-700 font-extrabold flex items-center gap-1"
                    >
                      <span>{siteTitle}</span>
                      <ExternalLink className="w-3.5 h-3.5 inline" />
                    </a>
                  </div>
                  {note && (
                    <p className="text-[11px] text-slate-500">{note}</p>
                  )}
                  <p className="text-[10px] font-mono text-slate-400 truncate max-w-sm">{siteUrl}</p>
                </div>
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-white border border-sky-300 text-sky-700 hover:bg-sky-600 hover:text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-all shrink-0"
                >
                  <span>立即跳转访问</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          }
        }

        // 6. Blockquote
        if (trimmed.startsWith('>')) {
          return (
            <blockquote key={idx} className="border-l-4 border-emerald-500 pl-4 py-1.5 my-3 italic text-slate-600 bg-emerald-50/30 rounded-r-xl text-xs sm:text-sm">
              {trimmed.replace(/^>\s*/, '')}
            </blockquote>
          );
        }

        // 7. Headings (#, ##, ###)
        if (trimmed.startsWith('### ')) {
          return <h3 key={idx} className="text-base sm:text-lg font-bold text-slate-800 mt-4 mb-2">{trimmed.replace('### ', '')}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={idx} className="text-lg sm:text-xl font-bold text-slate-900 mt-5 mb-2 pb-1 border-b border-slate-100">{trimmed.replace('## ', '')}</h2>;
        }
        if (trimmed.startsWith('# ')) {
          return <h1 key={idx} className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-6 mb-3">{trimmed.replace('# ', '')}</h1>;
        }

        // 8. General paragraph with inline markdown links [title](url) rendered as clickable <a>
        const renderInlineLinks = (text) => {
          const parts = [];
          const regex = /\[(.*?)\]\((.*?)\)/g;
          let lastIndex = 0;
          let match;

          while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
              parts.push(text.substring(lastIndex, match.index));
            }
            parts.push(
              <a
                key={match.index}
                href={match[2]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 font-semibold hover:underline inline-flex items-center gap-0.5 mx-0.5"
              >
                <span>{match[1]}</span>
                <ExternalLink className="w-3 h-3 inline opacity-70" />
              </a>
            );
            lastIndex = regex.lastIndex;
          }

          if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
          }

          return parts;
        };

        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineLinks(trimmed)}
          </p>
        );
      })}
    </div>
  );
};
