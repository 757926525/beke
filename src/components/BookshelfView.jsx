import React, { useState, useRef } from 'react';
import {
  Library,
  Book,
  Upload,
  Search,
  CheckCircle2,
  Trash2,
  Bookmark,
  Share2,
  FolderSync,
  FileText,
  ExternalLink,
  UploadCloud,
  FileUp
} from 'lucide-react';

export default function BookshelfView({
  books,
  onAddBook,
  onRemoveBook,
  onSaveToNetDrive
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [readingChapter, setReadingChapter] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [netDriveMsg, setNetDriveMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate reading local book (EPUB, PDF, TXT)
    setTimeout(() => {
      const ext = file.name.split('.').pop().toUpperCase();
      const newBook = {
        id: `book-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        author: '本地上传书目',
        category: '私藏电子书',
        format: ext,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        progress: 0,
        totalChapters: 30,
        cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        desc: `于 ${new Date().toLocaleDateString()} 上传至白狐藏书阁的本地电子书，格式为 ${ext}。`,
        dateAdded: new Date().toISOString().split('T')[0]
      };
      onAddBook(newBook);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 600);
  };

  const handleNetDrive = async (book) => {
    const res = await onSaveToNetDrive(book);
    setNetDriveMsg(`《${book.title}》已同步转存至网盘：${res.path}`);
    setTimeout(() => setNetDriveMsg(null), 4000);
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-semibold text-sm mb-1">
            <Library className="w-4 h-4" />
            <span>白狐藏书阁</span>
          </div>
          <h2 className="font-serif-sc text-3xl font-bold text-slate-900 dark:text-white">
            云端随身书架与电子书全景管理
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            支持 EPUB / PDF / TXT 本地电子书自由上传，记录阅读进度，支持一键保存至专属网盘。
          </p>
        </div>

        {/* Upload Trigger */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".epub,.pdf,.txt,.mobi,.azw3"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-5 py-2.5 rounded-xl fox-gradient text-white font-medium text-sm shadow-md hover:shadow-rose-500/25 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? '解析上传中...' : '上传本地电子书'}</span>
          </button>
        </div>
      </div>

      {netDriveMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>{netDriveMsg}</span>
        </div>
      )}

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          共藏书 <span className="font-semibold text-rose-500">{books.length}</span> 册
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="在书架中检索书名、作者..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="group glass-panel rounded-2xl p-3 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <div>
              {/* Book Cover */}
              <div
                onClick={() => setSelectedBook(book)}
                className="relative aspect-3/4 rounded-xl overflow-hidden cursor-pointer shadow-md bg-slate-200 dark:bg-slate-800"
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/70 text-white backdrop-blur-sm">
                  {book.format}
                </div>
                {/* Progress bar on bottom */}
                <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs p-1 text-[10px] text-white flex items-center justify-between">
                  <span>进度</span>
                  <span className="font-semibold text-rose-300">{book.progress}%</span>
                </div>
              </div>

              {/* Info */}
              <div className="mt-3 space-y-1">
                <h4
                  onClick={() => setSelectedBook(book)}
                  className="font-serif-sc font-bold text-sm text-slate-900 dark:text-white truncate cursor-pointer hover:text-rose-500"
                  title={book.title}
                >
                  {book.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {book.author}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => handleNetDrive(book)}
                title="一键转存至网盘"
                className="p-1 rounded-md text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <UploadCloud className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedBook(book)}
                className="font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                打开阅读
              </button>
              <button
                onClick={() => onRemoveBook(book.id)}
                title="从书架移除"
                className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Book className="w-5 h-5 text-rose-500" />
                <div>
                  <h3 className="font-serif-sc font-bold text-slate-900 dark:text-white">
                    {selectedBook.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    作者：{selectedBook.author} · 格式：{selectedBook.format} · 大小：{selectedBook.size}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-medium hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                退出阅读
              </button>
            </div>

            {/* Reading Content Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-12 font-serif-sc text-slate-800 dark:text-slate-200 leading-loose text-lg max-w-3xl mx-auto space-y-6">
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs uppercase tracking-widest text-rose-500 font-sans font-bold">
                  第 {readingChapter} 章 / 共 {selectedBook.totalChapters} 章
                </span>
                <h4 className="text-2xl font-bold mt-2">云岫白狐赋 · 卷之随想</h4>
              </div>

              <p>
                夫天高地迥，宇宙之浩瀚无垠；雪落青丘，白狐行于清寒之境。昔者以简帛载道，后以活字流芳；及至今兹，数字烟云蔚为大观。
              </p>
              <p>
                云端藏书，虽无重墨之沉，然指尖轻触，万卷尽现。将此书收归白狐书架，无论关山万里、岁月更迭，只要信步于云原生之界，书香常在，心安所寄。
              </p>
              <p className="text-slate-500 italic text-base">
                “道可道，非常道。名可名，非常名。无名天地之始，有名万物之母。”
              </p>
            </div>

            {/* Reader Footer Controls */}
            <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs sm:text-sm">
              <button
                disabled={readingChapter <= 1}
                onClick={() => setReadingChapter((c) => Math.max(1, c - 1))}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                上一章
              </button>

              <span className="text-slate-500">
                已阅读进度：{Math.round((readingChapter / selectedBook.totalChapters) * 100)}%
              </span>

              <button
                disabled={readingChapter >= selectedBook.totalChapters}
                onClick={() => setReadingChapter((c) => Math.min(selectedBook.totalChapters, c + 1))}
                className="px-4 py-2 rounded-xl fox-gradient text-white font-medium disabled:opacity-40 shadow-sm"
              >
                下一章
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
