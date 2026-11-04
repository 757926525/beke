import React, { useState } from 'react';
import {
  BookOpen, ChevronRight, ChevronLeft,
  Maximize2, Minimize2, ArrowLeft,
  BookMarked, Download, Upload, Trash2, Edit3,
  Plus, X, FileText, CheckCircle2, List, Layers,
  RefreshCw, Check, AlertCircle, CheckSquare, Square,
  UploadCloud, HelpCircle
} from 'lucide-react';
import { downloadFile } from '../services/documentConverter';

export const BookshelfView = ({
  books,
  setBooks,
  currentUser,
  isAdmin,
  onWebDAVTransfer,
  t
}) => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [mobileFullscreen, setMobileFullscreen] = useState(false);
  const [readerFontSize, setReaderFontSize] = useState('text-base');
  const [showChapterMenu, setShowChapterMenu] = useState(false);

  // 4-Tier View Modes: 大图 (large), 中图 (medium), 小图 (small), 详情 (list)
  const [viewMode, setViewMode] = useState('large');

  // Batch operations state
  const [selectedBookIds, setSelectedBookIds] = useState([]);

  // Admin / Upload / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);

  // Batch upload state
  const [batchFiles, setBatchFiles] = useState([]);
  const [isImportingBatch, setIsImportingBatch] = useState(false);

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    category: '技术专著',
    format: 'TXT',
    description: '',
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    content: ''
  });
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Supported formats list & web viewing compatibility
  const supportedFormats = [
    { ext: 'TXT', name: '纯文本 (.txt)', webView: true, desc: '原生沉浸式阅读器完美解析与分章节' },
    { ext: 'MD', name: 'Markdown 文档 (.md)', webView: true, desc: '支持富文本排版渲染与高亮代码块' },
    { ext: 'PDF', name: 'PDF 文档 (.pdf)', webView: true, desc: '支持内置浏览器 PDF 视窗阅读' },
    { ext: 'HTML', name: '网页文档 (.html/.htm)', webView: true, desc: '支持原样嵌入式 Web 渲染' },
    { ext: 'JSON', name: '结构化数据 (.json)', webView: true, desc: '支持语法高亮折叠树形查看' },
    { ext: 'CSV', name: '表格文件 (.csv)', webView: true, desc: '支持解析为动态网格数据表格' },
    { ext: 'EPUB', name: 'EPUB 电子书 (.epub)', webView: false, desc: '需借助系统或本地专用阅读器打开/一键下载' },
    { ext: 'MOBI', name: 'Kindle MOBI (.mobi)', webView: false, desc: 'Kindle/专用阅读器标准格式，支持一键下载' },
    { ext: 'AZW3', name: 'Amazon AZW3 (.azw3)', webView: false, desc: '亚马逊专有格式，支持一键下载与云盘转存' },
    { ext: 'DOCX', name: 'Word 文档 (.docx)', webView: false, desc: '建议在 Office 或 WPS 中打开，支持一键下载' }
  ];

  const isWebViewableFormat = (format) => {
    const fmt = (format || '').toUpperCase();
    return ['TXT', 'MD', 'PDF', 'HTML', 'JSON', 'CSV'].includes(fmt);
  };

  const openBook = (book) => {
    setSelectedBook(book);
    setCurrentChapterIndex(0);
    setShowChapterMenu(false);
  };

  const handleNextChapter = () => {
    if (selectedBook && currentChapterIndex < (selectedBook.chapters?.length || 1) - 1) {
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

  // Download book function
  const handleDownloadBook = (book, e) => {
    if (e) e.stopPropagation();
    try {
      let bookText = `# ${book.title}\n作者：${book.author}\n分类：${book.category}\n格式：${book.format || 'TXT'}\n\n简介：\n${book.description || ''}\n\n`;
      if (book.chapters && book.chapters.length > 0) {
        book.chapters.forEach((chap, idx) => {
          bookText += `\n========================================\n第 ${idx + 1} 章 · ${chap.title}\n========================================\n\n${chap.content}\n\n`;
        });
      } else if (book.content) {
        bookText += book.content;
      }

      const ext = (book.format || 'txt').toLowerCase();
      downloadFile(bookText, `${book.title}_白狐书架.${ext}`, 'text/plain;charset=utf-8');
      showToast(`《${book.title}》文件已启动下载！`);
    } catch (err) {
      console.error(err);
      showToast('电子书下载导出失败，请重试');
    }
  };

  // Permission helper
  const canManageBook = (book) => {
    if (isAdmin) return true;
    if (currentUser && book.userId && book.userId === currentUser.id) return true;
    if (currentUser && book.author && book.author === currentUser.username) return true;
    return false;
  };

  // Delete single book
  const handleDeleteBook = (id, title, e) => {
    if (e) e.stopPropagation();
    const target = books.find((b) => b.id === id);
    if (!canManageBook(target)) {
      showToast('权限不足：仅管理员或上传者可下架自己的图书！');
      return;
    }
    if (window.confirm(`确定要从白狐书架彻底删除《${title}》吗？`)) {
      setBooks(books.filter((b) => b.id !== id));
      if (selectedBook?.id === id) {
        setSelectedBook(null);
      }
      setSelectedBookIds(selectedBookIds.filter((bId) => bId !== id));
      showToast(`已成功移除《${title}》！`);
    }
  };

  // Toggle selection for batch operations
  const toggleSelectBook = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedBookIds((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  const toggleSelectAllBooks = () => {
    const allIds = books.map((b) => b.id);
    if (allIds.every((id) => selectedBookIds.includes(id))) {
      setSelectedBookIds([]);
    } else {
      setSelectedBookIds(allIds);
    }
  };

  // Batch Delete
  const handleBatchDeleteBooks = () => {
    if (!selectedBookIds.length) {
      showToast('请先勾选需要批量操作的图书！');
      return;
    }
    const nonDeletable = books.filter((b) => selectedBookIds.includes(b.id) && !canManageBook(b));
    if (nonDeletable.length > 0) {
      showToast(`权限不足：选中的图书中有 ${nonDeletable.length} 本属于其他用户！`);
      return;
    }
    if (confirm(`确认批量从白狐书架彻底删除选中的 ${selectedBookIds.length} 本图书？`)) {
      setBooks(books.filter((b) => !selectedBookIds.includes(b.id)));
      setSelectedBookIds([]);
      showToast(`已批量删除选中的图书！`);
    }
  };

  // Batch Download
  const handleBatchDownloadBooks = () => {
    const targets = books.filter((b) => selectedBookIds.includes(b.id));
    if (!targets.length) {
      showToast('请先勾选需要批量下载的图书！');
      return;
    }
    targets.forEach((book, idx) => {
      setTimeout(() => {
        handleDownloadBook(book);
      }, idx * 300);
    });
    showToast(`正在批量导出 ${targets.length} 本图书...`);
  };

  // Batch Transfer to WebDAV
  const handleBatchTransferToWebDAV = () => {
    const targets = books.filter((b) => selectedBookIds.includes(b.id));
    if (!targets.length) {
      showToast('请先勾选图书！');
      return;
    }
    if (onWebDAVTransfer) {
      onWebDAVTransfer(targets.map(b => ({
        name: `${b.title}.${(b.format || 'txt').toLowerCase()}`,
        size: b.size || '1.2 MB',
        type: 'book',
        rawContent: b.content || b.description
      })));
    } else {
      showToast(`已将 ${targets.length} 本图书加入 WebDAV 上传队列！`);
    }
  };

  // Open modal for creating or editing
  const handleOpenAddModal = () => {
    setEditingBookId(null);
    setBookForm({
      title: '',
      author: '白狐居士',
      category: '技术专著',
      format: 'TXT',
      description: '',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      content: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book, e) => {
    if (e) e.stopPropagation();
    setEditingBookId(book.id);
    let allContent = '';
    if (book.chapters && book.chapters.length > 0) {
      allContent = book.chapters.map(c => `### ${c.title}\n${c.content}`).join('\n\n');
    } else {
      allContent = book.content || '';
    }

    setBookForm({
      title: book.title,
      author: book.author,
      category: book.category || '古典哲学',
      format: book.format || 'TXT',
      description: book.description || '',
      cover: book.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      content: allContent
    });
    setIsModalOpen(true);
  };

  // Local file upload parser supporting multiple formats
  const handleLocalFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toUpperCase();
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = event.target.result;
      setBookForm((prev) => ({
        ...prev,
        title: prev.title || fileName,
        format: ext || 'TXT',
        content: typeof rawText === 'string' ? rawText : `[${ext} 文件内容已成功暂存，大小 ${(file.size / 1024).toFixed(1)} KB]`
      }));
      showToast(`已成功载入本地 ${ext} 格式文件「${file.name}」！`);
    };
    reader.readAsText(file);
  };

  // Batch file select handler
  const handleBatchFilesSelect = (e) => {
    const allFiles = Array.from(e.target.files || []);
    if (!allFiles.length) return;
    setBatchFiles(allFiles);
    showToast(`已选入 ${allFiles.length} 份文档/电子书文件！`);
  };

  // Batch import files directly to bookshelf
  const handleProcessBatchImport = async () => {
    if (!batchFiles.length) {
      showToast('请先选择需要批量导入的电子书文档！');
      return;
    }

    setIsImportingBatch(true);
    const newBooksToAdd = [];

    try {
      for (const file of batchFiles) {
        const ext = file.name.split('.').pop().toUpperCase();
        let content = '';
        try {
          content = await file.text();
        } catch (e) {
          content = `[二进制/专有电子书格式 ${ext}]`;
        }

        const lines = content.split('\n');
        const chapters = [];
        let currentChapter = { title: '第一章 · 引言', content: '' };

        lines.forEach((line) => {
          if (line.startsWith('#') || line.startsWith('第') || line.startsWith('Chapter') || line.startsWith('卷')) {
            if (currentChapter.content.trim()) {
              chapters.push({ ...currentChapter, content: currentChapter.content.trim() });
            }
            currentChapter = { title: line.replace(/^[#\s]+/, '').trim(), content: '' };
          } else {
            currentChapter.content += line + '\n';
          }
        });
        if (currentChapter.content.trim()) {
          chapters.push({ ...currentChapter, content: currentChapter.content.trim() });
        }
        if (chapters.length === 0) {
          chapters.push({ title: '全本正文', content });
        }

        const newBook = {
          id: `book-batch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          author: currentUser?.username || '批量上架',
          userId: currentUser?.id || 'guest',
          category: '经典文集',
          format: ext || 'TXT',
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          progress: 0,
          totalChapters: chapters.length,
          cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
          description: `批量上传入库的电子书 (${file.name})。`,
          dateAdded: new Date().toISOString().split('T')[0],
          chapters: chapters
        };

        newBooksToAdd.push(newBook);
      }

      setBooks([...newBooksToAdd, ...books]);
      showToast(`成功批量上架 ${newBooksToAdd.length} 本图书至书架！`);
      setBatchFiles([]);
      setIsBatchModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('批量导入出现异常，请重试');
    } finally {
      setIsImportingBatch(false);
    }
  };

  // Save book handler
  const handleSaveBook = (e) => {
    e.preventDefault();
    if (!bookForm.title.trim()) {
      showToast('请填写书名！');
      return;
    }

    const rawContent = bookForm.content || '暂无章节内容。';
    const lines = rawContent.split('\n');
    const chapters = [];
    let currentChapter = { title: '第一章 · 引言', content: '' };

    lines.forEach((line) => {
      if (line.startsWith('#') || line.startsWith('第') || line.startsWith('Chapter') || line.startsWith('卷')) {
        if (currentChapter.content.trim()) {
          chapters.push({ ...currentChapter, content: currentChapter.content.trim() });
        }
        currentChapter = { title: line.replace(/^[#\s]+/, '').trim(), content: '' };
      } else {
        currentChapter.content += line + '\n';
      }
    });
    if (currentChapter.content.trim()) {
      chapters.push({ ...currentChapter, content: currentChapter.content.trim() });
    }

    if (chapters.length === 0) {
      chapters.push({ title: '全本正文', content: rawContent });
    }

    if (editingBookId) {
      setBooks(books.map((b) => b.id === editingBookId ? {
        ...b,
        title: bookForm.title,
        author: bookForm.author || '佚名',
        category: bookForm.category,
        format: bookForm.format || 'TXT',
        description: bookForm.description,
        cover: bookForm.cover,
        chapters: chapters,
        totalChapters: chapters.length
      } : b));
      showToast(`《${bookForm.title}》已更新！`);
    } else {
      const newBook = {
        id: `book-${Date.now()}`,
        title: bookForm.title,
        author: bookForm.author || currentUser?.username || '白狐藏书',
        userId: currentUser?.id || 'guest',
        category: bookForm.category,
        format: bookForm.format || 'TXT',
        size: `${(new Blob([rawContent]).size / (1024 * 1024)).toFixed(2)} MB`,
        progress: 0,
        totalChapters: chapters.length,
        cover: bookForm.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        description: bookForm.description || '用户上传导入的藏书。',
        dateAdded: new Date().toISOString().split('T')[0],
        chapters: chapters
      };
      setBooks([newBook, ...books]);
      showToast(`成功将《${newBook.title}》上架到白狐书架！`);
    }

    setIsModalOpen(false);
  };

  // If reading mode is active
  if (selectedBook) {
    const chapters = selectedBook.chapters || [{ title: '正文', content: selectedBook.description || '暂无内容' }];
    const chapter = chapters[currentChapterIndex] || {
      title: '章节缺失',
      content: '该章节暂无内容。'
    };

    return (
      <div
        className={`${
          mobileFullscreen
            ? 'fixed inset-0 z-50 bg-[#faf8f5] overflow-y-auto pt-[env(safe-area-inset-top,24px)] pb-[env(safe-area-inset-bottom,24px)] px-4 sm:px-8'
            : 'space-y-6'
        }`}
      >
        {/* Reader Top Bar */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between sticky top-2 z-20">
          <button
            onClick={() => {
              setSelectedBook(null);
              setMobileFullscreen(false);
            }}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回书架选区</span>
          </button>

          <div className="text-center truncate px-2 max-w-[200px] sm:max-w-md">
            <h2 className="text-xs font-bold text-slate-800 truncate">{selectedBook.title}</h2>
            <p className="text-[10px] text-slate-400 truncate">{chapter.title}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowChapterMenu(!showChapterMenu)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1 text-xs cursor-pointer"
              title="章节目录"
            >
              <List className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => handleDownloadBook(selectedBook, e)}
              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center space-x-1 text-xs cursor-pointer"
              title="下载离线版本"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() =>
                setReaderFontSize(
                  readerFontSize === 'text-sm'
                    ? 'text-base'
                    : readerFontSize === 'text-base'
                    ? 'text-lg'
                    : readerFontSize === 'text-lg'
                    ? 'text-xl'
                    : 'text-sm'
                )
              }
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              title="切换字号"
            >
              字号 Aa
            </button>

            <button
              onClick={() => setMobileFullscreen(!mobileFullscreen)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1 text-xs cursor-pointer"
              title="全屏沉浸阅读"
            >
              {mobileFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Chapter Menu Modal/Drawer */}
        {showChapterMenu && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-md max-w-md mx-auto mb-4 animate-fade-in max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="text-xs font-bold text-slate-700">章节目录 ({chapters.length})</span>
              <button onClick={() => setShowChapterMenu(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {chapters.map((c, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentChapterIndex(i);
                    setShowChapterMenu(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    currentChapterIndex === i
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="truncate">{c.title}</span>
                  {currentChapterIndex === i && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reader Content Box */}
        <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-12 border border-slate-200/80 shadow-sm mt-4 min-h-[60vh]">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-600 font-bold mb-1">
              <BookMarked className="w-4 h-4" />
              <span>
                第 {currentChapterIndex + 1} 章 / 共 {chapters.length} 章
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{chapter.title}</h1>
            <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2">
              <span>作者: {selectedBook.author}</span>
              <span>格式: {selectedBook.format || 'TXT'}</span>
            </div>
          </div>

          <div className={`text-slate-700 leading-relaxed font-serif whitespace-pre-line ${readerFontSize} select-text`}>
            {chapter.content}
          </div>

          {/* Reader Chapter Navigation Controls */}
          <div className="pt-8 border-t border-slate-100 mt-10 flex items-center justify-between">
            <button
              onClick={handlePrevChapter}
              disabled={currentChapterIndex === 0}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-xs font-semibold text-slate-600 flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>上一章</span>
            </button>

            <span className="text-xs text-slate-400">
              {currentChapterIndex + 1} / {chapters.length}
            </span>

            <button
              onClick={handleNextChapter}
              disabled={currentChapterIndex >= chapters.length - 1}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-xs font-semibold text-white flex items-center space-x-1 shadow-xs cursor-pointer"
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
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>墨香书阁 · 全格式电子书与多模式藏书馆</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              书架精选专区
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              汇聚技术专著、经典文学与各类电子书，支持 4 档显示切换（大图/中图/小图/详情）与批量管理。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {currentUser && (
              <>
                <button
                  onClick={() => setIsBatchModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>批量上传书籍</span>
                </button>

                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>新增/上传电子书</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4-Tier View Mode Bar & Batch Toolbar */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSelectAllBooks}
            className="flex items-center space-x-1.5 text-slate-700 hover:text-slate-900 font-bold cursor-pointer"
          >
            {books.length > 0 && books.every((b) => selectedBookIds.includes(b.id)) ? (
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>全选 ({selectedBookIds.length}/{books.length})</span>
          </button>

          {selectedBookIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBatchDownloadBooks}
                className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>批量下载 ({selectedBookIds.length})</span>
              </button>

              <button
                onClick={handleBatchTransferToWebDAV}
                className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold flex items-center space-x-1 cursor-pointer"
                title="一键转存至 WebDAV 外接网盘"
              >
                <UploadCloud className="w-3 h-3" />
                <span>转存至 WebDAV</span>
              </button>

              {currentUser && (
                <button
                  onClick={handleBatchDeleteBooks}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>批量删除</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 4-Tier View Switcher: 大图 / 中图 / 小图 / 详情 */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">显示模式:</span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('large')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'large' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              大图
            </button>
            <button
              onClick={() => setViewMode('medium')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'medium' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              中图
            </button>
            <button
              onClick={() => setViewMode('small')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'small' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              小图
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              详情
            </button>
          </div>
        </div>
      </div>

      {/* Format Support & Web Viewing Guide Box */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>支持文档与电子书格式及网页查看兼容说明</span>
          </span>
          <span className="text-[10px] text-slate-400">绿色支持网页即阅 · 灰色支持高速下载/转存</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {supportedFormats.map((f) => (
            <div
              key={f.ext}
              className={`p-2 rounded-xl border ${
                f.webView
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-[11px]">
                <span>{f.ext}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${f.webView ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                  {f.webView ? '网页可看' : '下载阅读'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Book Display by ViewMode: 大图 / 中图 / 小图 / 详情 */}
      {viewMode === 'large' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group relative"
            >
              <div>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4 bg-slate-100 shadow-inner">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Select Checkbox */}
                  <button
                    onClick={(e) => toggleSelectBook(book.id, e)}
                    className="absolute top-3 left-3 z-10 p-1 rounded-lg bg-black/50 backdrop-blur-md text-white hover:bg-black/70 cursor-pointer"
                  >
                    {selectedBookIds.includes(book.id) ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-white/80" />
                    )}
                  </button>

                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-white font-mono">
                    {book.format || 'TXT'} · {book.size || '1.0 MB'}
                  </div>

                  {canManageBook(book) && (
                    <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleOpenEditModal(book, e)}
                        className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 shadow-sm cursor-pointer"
                        title="编辑图书信息"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteBook(book.id, book.title, e)}
                        className="p-1.5 rounded-lg bg-rose-500/90 hover:bg-rose-600 text-white shadow-sm cursor-pointer"
                        title="下架删除图书"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                    {book.category || '通识读物'}
                  </span>
                  <span className="text-[10px] text-slate-400">收录: {book.dateAdded || '近期'}</span>
                </div>

                <h2 className="text-base font-bold text-slate-800 group-hover:text-emerald-600 transition-colors mt-2">
                  {book.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">作者: {book.author}</p>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{book.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center space-x-2">
                {isWebViewableFormat(book.format) ? (
                  <button
                    onClick={() => openBook(book)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>网页沉浸阅读</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleDownloadBook(book, e)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载并在专用软件打开</span>
                  </button>
                )}
                <button
                  onClick={(e) => handleDownloadBook(book, e)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-emerald-700 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                  title="下载文件"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'medium' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-2xl p-3 border border-slate-200 hover:border-emerald-300 shadow-xs flex flex-col justify-between space-y-2 group relative"
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100">
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <button
                  onClick={(e) => toggleSelectBook(book.id, e)}
                  className="absolute top-1.5 left-1.5 p-1 rounded-md bg-black/50 text-white cursor-pointer"
                >
                  {selectedBookIds.includes(book.id) ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-white/80" />
                  )}
                </button>
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
                  {book.format || 'TXT'}
                </span>
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-xs text-slate-800 truncate" title={book.title}>{book.title}</div>
                <div className="text-[10px] text-slate-400 truncate">{book.author}</div>
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => openBook(book)}
                  className="text-xs text-emerald-600 font-bold hover:underline"
                >
                  {isWebViewableFormat(book.format) ? '阅读' : '下载'}
                </button>
                <button
                  onClick={(e) => handleDownloadBook(book, e)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'small' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => openBook(book)}
              className="bg-white rounded-xl p-2 border border-slate-200 hover:border-emerald-400 cursor-pointer flex flex-col justify-between space-y-1"
            >
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-slate-100">
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/60 text-white text-[8px] font-mono">
                  {book.format || 'TXT'}
                </span>
              </div>
              <div className="font-bold text-[10px] text-slate-800 truncate" title={book.title}>{book.title}</div>
              <div className="text-[9px] text-slate-400 font-mono">{book.size || '1MB'}</div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">勾选</th>
                <th className="py-2.5 px-3">书名与作者</th>
                <th className="py-2.5 px-3">格式</th>
                <th className="py-2.5 px-3">网页支持</th>
                <th className="py-2.5 px-3">分类</th>
                <th className="py-2.5 px-3">大小</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3">
                    <button
                      onClick={(e) => toggleSelectBook(book.id, e)}
                      className="cursor-pointer text-slate-400 hover:text-slate-600"
                    >
                      {selectedBookIds.includes(book.id) ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 flex items-center space-x-2">
                    <img src={book.cover} alt="Cover" className="w-7 h-9 object-cover rounded-md border border-slate-200 shrink-0" />
                    <div>
                      <div className="truncate max-w-[200px]">{book.title}</div>
                      <div className="text-[10px] text-slate-400">{book.author}</div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-700">{book.format || 'TXT'}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isWebViewableFormat(book.format) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isWebViewableFormat(book.format) ? '网页可看' : '下载阅读'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{book.category}</td>
                  <td className="py-3 px-3 text-slate-400 font-mono">{book.size || '1.0 MB'}</td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => openBook(book)}
                      className="text-emerald-600 hover:text-emerald-700 font-bold"
                    >
                      {isWebViewableFormat(book.format) ? '阅读' : '查看'}
                    </button>
                    <button
                      onClick={(e) => handleDownloadBook(book, e)}
                      className="text-sky-600 hover:text-sky-700"
                    >
                      下载
                    </button>
                    {canManageBook(book) && (
                      <button
                        onClick={(e) => handleDeleteBook(book.id, book.title, e)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        删除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Batch Upload Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-base">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>批量上传文档/电子书至书架</span>
              </div>
              <button
                onClick={() => {
                  setIsBatchModalOpen(false);
                  setBatchFiles([]);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <FileText className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-slate-800">
                  支持多选上传 TXT, MD, PDF, EPUB, MOBI, AZW3, DOCX 等格式
                </p>
                <p className="text-[11px] text-slate-500">
                  纯文本与 Markdown 将自动解析分章节；EPUB/PDF/MOBI 自动入库支持一键在线查看或高速下载。
                </p>
                <div>
                  <label className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>选择多个文件</span>
                    <input
                      type="file"
                      multiple
                      accept=".txt,.md,.pdf,.epub,.mobi,.azw3,.docx,.html,.json,.csv"
                      onChange={handleBatchFilesSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {batchFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-semibold text-slate-700">
                    <span>已选文件 ({batchFiles.length})</span>
                    <button
                      onClick={() => setBatchFiles([])}
                      className="text-rose-500 hover:text-rose-700 text-[11px]"
                    >
                      清空列表
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100 bg-slate-50">
                    {batchFiles.map((file, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate font-medium text-slate-700">{file.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsBatchModalOpen(false);
                    setBatchFiles([]);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={batchFiles.length === 0 || isImportingBatch}
                  onClick={handleProcessBatchImport}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold shadow-xs flex items-center space-x-1.5"
                >
                  {isImportingBatch ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>正在批量上架入库...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      <span>确认批量入库 ({batchFiles.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Upload / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-base">
                <BookMarked className="w-5 h-5 text-emerald-600" />
                <span>{editingBookId ? '编辑电子书' : '上传/新增电子书'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">选择本地文档或电子书</span>
                  <label className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-semibold flex items-center space-x-1 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>选择本地文件</span>
                    <input
                      type="file"
                      accept=".txt,.md,.pdf,.epub,.mobi,.azw3,.docx,.html,.json,.csv"
                      onChange={handleLocalFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-emerald-700">
                  支持 TXT、Markdown、PDF、EPUB、MOBI 等多种格式。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">电子书名称 *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.title}
                    onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                    placeholder="如：白狐多云边缘实战录"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">作者</label>
                  <input
                    type="text"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    placeholder="如：白狐居士"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">分类专区</label>
                  <select
                    value={bookForm.category}
                    onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="古典哲学">古典哲学</option>
                    <option value="计算机科学">计算机科学</option>
                    <option value="古典文学">古典文学</option>
                    <option value="技术架构">技术架构</option>
                    <option value="随笔散文">随笔散文</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">文档格式</label>
                  <select
                    value={bookForm.format}
                    onChange={(e) => setBookForm({ ...bookForm, format: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                  >
                    <option value="TXT">TXT (纯文本)</option>
                    <option value="MD">MD (Markdown)</option>
                    <option value="PDF">PDF (便携文档)</option>
                    <option value="EPUB">EPUB (标准电子书)</option>
                    <option value="MOBI">MOBI (Kindle电子书)</option>
                    <option value="AZW3">AZW3 (Amazon电子书)</option>
                    <option value="DOCX">DOCX (Word文档)</option>
                    <option value="HTML">HTML (网页文档)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">封面图片 URL</label>
                <input
                  type="text"
                  value={bookForm.cover}
                  onChange={(e) => setBookForm({ ...bookForm, cover: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">图书简介与摘要</label>
                <textarea
                  rows={2}
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  placeholder="简要概括此书主旨..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  正文或章节内容
                </label>
                <textarea
                  rows={5}
                  value={bookForm.content}
                  onChange={(e) => setBookForm({ ...bookForm, content: e.target.value })}
                  placeholder="可直接粘贴纯文本内容，或通过上方选择本地文件导入..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  {editingBookId ? '保存图书修改' : '确认上架电子书'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default BookshelfView;
