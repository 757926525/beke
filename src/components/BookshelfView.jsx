import React, { useState } from 'react';
import {
  BookOpen, ChevronRight, ChevronLeft, Bookmark,
  Maximize2, Minimize2, ArrowLeft, Eye, Sparkles, Smartphone
} from 'lucide-react';

export const BookshelfView = ({ books, setBooks, t }) => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [mobileFullscreen, setMobileFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState('text-base');

  const openBook = (book) => {
    setSelectedBook(book);
    setCurrentChapterIndex(0);
  };

  const handleNextChapter = () => {
    if (selectedBook && currentChapterIndex < selectedBook.chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // If reading mode is active
  if (selectedBook) {
    const chapter = selectedBook.chapters[currentChapterIndex] || {
      title: '章节缺失',
      content: '该章节暂无内容。'
    };

    return (
      <div
        className={`${
          mobileFullscreen
            ? 'fixed inset-0 z-50 bg-[#faf8f5] overflow-y-auto pt-[env(safe-area-inset-top,20px)] pb-[env(safe-area-inset-bottom,20px)] px-4 sm:px-8'
            : 'space-y-6'
        }`}
      >
        {/* Reader Top Bar (Preserves Mobile Notch & avoids overlap) */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between sticky top-2 z-10">
          <button
            onClick={() => {
              setSelectedBook(null);
              setMobileFullscreen(false);
            }}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回书架</span>
          </button>

          <div className="text-center truncate px-2">
            <h2 className="text-xs font-bold text-slate-800 truncate">{selectedBook.title}</h2>
            <p className="text-[10px] text-slate-400 truncate">{chapter.title}</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Font size toggler */}
            <button
              onClick={() => setFontSize(fontSize === 'text-base' ? 'text-lg' : fontSize === 'text-lg' ? 'text-sm' : 'text-base')}
              className="px-2 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-700"
              title="切换字体大小"
            >
              Aa
            </button>

            {/* Mobile fullscreen notch-safe toggle */}
            <button
              onClick={() => setMobileFullscreen(!mobileFullscreen)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1 text-xs"
              title="手机沉浸全屏阅读模式（自适应安全区与刘海）"
            >
              {mobileFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Reader Content Box */}
        <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-12 border border-slate-200/80 shadow-sm mt-4 min-h-[60vh]">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-600 font-bold mb-1">
              <span>第 {currentChapterIndex + 1} 章 / 共 {selectedBook.chapters.length} 章</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{chapter.title}</h1>
          </div>

          <div className={`prose prose-slate max-w-none leading-relaxed text-slate-700 whitespace-pre-line ${fontSize}`}>
            {chapter.content}
          </div>

          {/* Chapter Navigation Buttons */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-12">
            <button
              onClick={handlePrevChapter}
              disabled={currentChapterIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-xs font-semibold text-slate-700 flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>上一章</span>
            </button>

            <span className="text-xs text-slate-400">
              {currentChapterIndex + 1} / {selectedBook.chapters.length}
            </span>

            <button
              onClick={handleNextChapter}
              disabled={currentChapterIndex >= selectedBook.chapters.length - 1}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-xs font-semibold text-white flex items-center space-x-1 shadow-xs"
            >
              <span>下一章</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>墨香书阁 · 沉浸式阅读器</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              白狐电子书阁与读书会
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              精选技术专著、云架构白皮书与原创长文，支持手机端安全区无遮挡沉浸全屏阅读。
            </p>
          </div>
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4 bg-slate-100 shadow-inner">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-white font-mono">
                  {book.chapters.length} 章节
                </div>
              </div>

              <h2 className="text-base font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                {book.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">作者: {book.author}</p>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{book.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <button
                onClick={() => openBook(book)}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>进入沉浸阅读</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
