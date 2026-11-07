import React, { useState } from 'react';
import {
  BookOpen, ChevronRight, ChevronLeft,
  Maximize2, Minimize2, ArrowLeft,
  BookMarked, Download, Upload, Trash2, Edit3,
  Plus, X, FileText, CheckCircle2, List, Layers,
  RefreshCw, Check, AlertCircle, LayoutGrid, AlignLeft
} from 'lucide-react';
import { downloadFile } from '../services/documentConverter';

export const BookshelfView = ({ books, setBooks, currentUser, isAdmin, activeStorageEngine = 'cloudflare-kv', t }) => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [mobileFullscreen, setMobileFullscreen] = useState(false);
  const [readerFontSize, setReaderFontSize] = useState('text-base');
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (大图) | 'card' (中图) | 'compact' (小图) | 'detail' (详细列表)

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

  // Download book function (TXT format)
  const handleDownloadBook = (book, e) => {
    if (e) e.stopPropagation();
    try {
      let bookText = `# ${book.title}\n作者：${book.author}\n分类：${book.category}\n\n简介：\n${book.description || ''}\n\n`;
      if (book.chapters && book.chapters.length > 0) {
        book.chapters.forEach((chap, idx) => {
          bookText += `\n========================================\n第 ${idx + 1} 章 · ${chap.title}\n========================================\n\n${chap.content}\n\n`;
        });
      } else if (book.content) {
        bookText += book.content;
      }

      downloadFile(bookText, `${book.title}_白狐书架.txt`, 'text/plain;charset=utf-8');
      showToast(`《${book.title}》TXT 文件已成功开始下载！`);
    } catch (err) {
      console.error(err);
      showToast('电子书下载导出失败，请重试');
    }
  };

  // Permission helper: admin can manage all, user can manage own
  const canManageBook = (book) => {
    if (isAdmin) return true;
    if (currentUser && book.userId && book.userId === currentUser.id) return true;
    if (currentUser && book.author && book.author === currentUser.username) return true;
    return false;
  };

  // Delete book
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
      showToast(`已成功移除《${title}》！`);
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
      format: 'TXT',
      description: book.description || '',
      cover: book.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      content: allContent
    });
    setIsModalOpen(true);
  };

  // Local file upload parser supporting TXT, MD, PDF, EPUB, JSON, HTML
  const handleLocalFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toUpperCase() || 'TXT';
    const supportedExts = ['TXT', 'MD', 'PDF', 'EPUB', 'JSON', 'HTML', 'CSV'];

    if (!supportedExts.includes(ext)) {
      showToast(`温馨提示：书架支持 ${supportedExts.join(', ')} 格式文档！`);
      e.target.value = '';
      return;
    }

    const fileName = file.name.replace(/\.[^/.]+$/, '');
    const reader = new FileReader();

    if (ext === 'PDF' || ext === 'EPUB') {
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setBookForm((prev) => ({
          ...prev,
          title: prev.title || fileName,
          format: ext,
          fileUrl: dataUrl,
          content: `【${ext} 电子书文件已载入】\n文件名: ${file.name}\n大小: ${(file.size / 1024 / 1024).toFixed(2)} MB\n支持直接离线阅读与导出下载。`
        }));
        showToast(`已成功载入本地 ${ext} 格式图书「${file.name}」！`);
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (event) => {
        const rawText = event.target.result;
        setBookForm((prev) => ({
          ...prev,
          title: prev.title || fileName,
          format: ext,
          content: typeof rawText === 'string' ? rawText : ''
        }));
        showToast(`已成功载入本地 ${ext} 文档「${file.name}」！`);
      };
      reader.readAsText(file);
    }
  };

  // Batch file select handler supporting multiple formats
  const handleBatchFilesSelect = (e) => {
    const allFiles = Array.from(e.target.files || []);
    const validFiles = allFiles.filter(f => {
      const ext = f.name.split('.').pop()?.toUpperCase();
      return ['TXT', 'MD', 'PDF', 'EPUB', 'JSON', 'HTML', 'CSV'].includes(ext);
    });

    if (validFiles.length < allFiles.length) {
      showToast(`已过滤不兼容文档，支持 TXT/MD/PDF/EPUB/JSON/HTML 格式图书！`);
    }

    if (!validFiles.length) {
      showToast('请选择兼容格式电子书文件！');
      return;
    }

    setBatchFiles(validFiles);
    showToast(`已选入 ${validFiles.length} 份电子书文件！`);
  };

  // Batch import TXT files directly to bookshelf
  const handleProcessBatchImport = async () => {
    if (!batchFiles.length) {
      showToast('请先选择需要批量导入的 TXT 文档！');
      return;
    }

    setIsImportingBatch(true);
    const newBooksToAdd = [];

    try {
      for (const file of batchFiles) {
        const content = await file.text();
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
          format: 'TXT',
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          progress: 0,
          totalChapters: chapters.length,
          cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
          description: `批量上传入库的纯文本电子书 (${file.name})。`,
          dateAdded: new Date().toISOString().split('T')[0],
          chapters: chapters
        };

        newBooksToAdd.push(newBook);
      }

      setBooks([...newBooksToAdd, ...books]);
      showToast(`成功批量上架 ${newBooksToAdd.length} 本 TXT 图书至书架！`);
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

    // Parse chapters from content
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
      // Update existing book
      setBooks(books.map((b) => b.id === editingBookId ? {
        ...b,
        title: bookForm.title,
        author: bookForm.author || '佚名',
        category: bookForm.category,
        format: 'TXT',
        description: bookForm.description,
        cover: bookForm.cover,
        chapters: chapters,
        totalChapters: chapters.length
      } : b));
      showToast(`《${bookForm.title}》已更新！`);
    } else {
      // Add new book
      const newBook = {
        id: `book-${Date.now()}`,
        title: bookForm.title,
        author: bookForm.author || currentUser?.username || '白狐藏书',
        userId: currentUser?.id || 'guest',
        category: bookForm.category,
        format: 'TXT',
        size: `${(new Blob([rawContent]).size / (1024 * 1024)).toFixed(2)} MB`,
        progress: 0,
        totalChapters: chapters.length,
        cover: bookForm.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        description: bookForm.description || '用户上传导入的纯文本藏书。',
        dateAdded: new Date().toISOString().split('T')[0],
        chapters: chapters
      };
      setBooks([newBook, ...books]);
      showToast(`成功将 TXT 图书《${newBook.title}》上架到白狐书架！`);
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
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回书架选区</span>
          </button>

          <div className="text-center truncate px-2 max-w-[200px] sm:max-w-md">
            <h2 className="text-xs font-bold text-slate-800 truncate">{selectedBook.title}</h2>
            <p className="text-[10px] text-slate-400 truncate">{chapter.title}</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Chapter drawer toggle */}
            <button
              onClick={() => setShowChapterMenu(!showChapterMenu)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1 text-xs"
              title="章节目录"
            >
              <List className="w-4 h-4" />
            </button>

            {/* Download */}
            <button
              onClick={(e) => handleDownloadBook(selectedBook, e)}
              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center space-x-1 text-xs"
              title="下载 TXT 离线版本"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Font size toggler */}
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
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              title="切换字号"
            >
              字号 Aa
            </button>

            {/* Mobile fullscreen notch-safe toggle */}
            <button
              onClick={() => setMobileFullscreen(!mobileFullscreen)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1 text-xs"
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
              <span>格式: 纯文本 TXT</span>
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
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-xs font-semibold text-slate-600 flex items-center space-x-1"
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
              <span>墨香书阁 · 全格式电子书与云端藏书馆</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              书架精选专区
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              原生支持 TXT、Markdown、PDF、EPUB、JSON 等主流文档格式解析阅读、一键下载与批量导入。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* 4 种视图模式切换：大图 (grid)、中图 (card)、小图 (compact)、详细列表 (detail) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                title="大图封面"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                title="中图卡片"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'card' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                title="小图紧凑"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'compact' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('detail')}
                title="详细列表"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'detail' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Batch Upload - only for logged-in users */}
            {currentUser && (
              <>
                <button
                  onClick={() => setIsBatchModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>批量导入</span>
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

      {/* Format Notice Banner */}
      <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900">
        <div className="flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            书架格式与存储规范：支持 <strong>TXT、MD、PDF、EPUB、JSON、HTML</strong> 多格式文档解析与下载。电子书数据优先存储于对象存储桶 (R2/S3)，未绑定存储桶时自动降级存入数据库。
          </span>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-emerald-200/60 font-mono text-[11px] font-bold text-emerald-800 shrink-0">
          后端: {activeStorageEngine.includes('r2') ? 'R2存储桶' : 'D1数据库/KV'}
        </span>
      </div>

      {/* 4 种视图渲染 */}
      {/* 1. 大图封面网格 (grid) */}
      {viewMode === 'grid' && (
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
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-white font-mono">
                      {book.format || 'TXT'} · {book.size || '1.0 MB'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/90 text-[10px] text-white font-mono backdrop-blur-xs">
                      {activeStorageEngine.includes('r2') ? 'R2存储' : '数据库'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-emerald-600 text-[10px] text-white font-mono">
                    {book.chapters?.length || book.totalChapters || 1} 章节
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
                <button
                  onClick={() => openBook(book)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>进入沉浸阅读</span>
                </button>
                <button
                  onClick={(e) => handleDownloadBook(book, e)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-emerald-700 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                  title="导出下载到本地"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. 中图卡片列表 (card) */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex gap-4 items-center justify-between group"
            >
              <div className="flex items-center space-x-4 min-w-0">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-20 h-28 object-cover rounded-xl shadow-xs shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                      {book.format || 'TXT'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {activeStorageEngine.includes('r2') ? 'R2桶' : '数据库'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 truncate mt-1 group-hover:text-emerald-600">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">作者: {book.author}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{book.description}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => openBook(book)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>阅读</span>
                </button>
                <button
                  onClick={(e) => handleDownloadBook(book, e)}
                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center cursor-pointer"
                  title="下载"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. 小图紧凑网格 (compact) */}
      {viewMode === 'compact' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => openBook(book)}
              className="bg-white/80 backdrop-blur-md rounded-2xl p-2.5 border border-slate-200/80 shadow-xs hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 bg-slate-100 relative">
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded-md bg-black/60 text-white text-[9px] font-mono">
                  {book.format || 'TXT'}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-600">{book.title}</h4>
                <p className="text-[10px] text-slate-400 truncate">{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. 详细列表 (detail) */}
      {viewMode === 'detail' && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {books.map((book) => (
            <div
              key={book.id}
              className="px-5 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px]">
                  {book.format || 'TXT'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono text-[10px]">
                  {activeStorageEngine.includes('r2') ? 'R2存储' : 'D1/KV'}
                </span>
                <span className="font-bold text-slate-800 truncate">{book.title}</span>
                <span className="text-slate-400 hidden sm:inline">({book.author})</span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-slate-400 font-mono hidden md:inline">{book.size || '1.0MB'}</span>
                <button
                  onClick={() => openBook(book)}
                  className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold cursor-pointer"
                >
                  在线阅读
                </button>
                <button
                  onClick={(e) => handleDownloadBook(book, e)}
                  className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
                  title="下载"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Batch TXT Upload Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-base">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>批量上传 TXT 文档至书架</span>
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
                  支持同时选择多份纯文本 TXT 格式图书（仅支持 TXT 格式）
                </p>
                <p className="text-[11px] text-slate-500">
                  系统将自动解析章节目录结构（以第X章或#作为章节标志），批量完成书籍上架。
                </p>
                <div>
                  <label className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>选择多个 TXT 文件</span>
                    <input
                      type="file"
                      multiple
                      accept=".txt,text/plain"
                      onChange={handleBatchFilesSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {batchFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-semibold text-slate-700">
                    <span>已选 TXT 文件 ({batchFiles.length})</span>
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

      {/* Book Upload / Edit Modal for Admins (TXT only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-base">
                <BookMarked className="w-5 h-5 text-emerald-600" />
                <span>{editingBookId ? '管理员编辑电子书 (仅支持 TXT)' : '上传/新增 TXT 电子书'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4 text-xs">
              {/* Local TXT File Selector */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">快速读取本地 TXT 文件</span>
                  <label className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-semibold flex items-center space-x-1 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>选择本地 TXT</span>
                    <input
                      type="file"
                      accept=".txt,text/plain"
                      onChange={handleLocalFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-emerald-700">
                  支持自动解析标题、提取分章节目录，构建原汁原味的沉浸式阅读器。
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
                    placeholder="如：道德经真义"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">作者</label>
                  <input
                    type="text"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    placeholder="如：老子"
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
                  <label className="block text-slate-600 font-bold mb-1">电子书格式</label>
                  <input
                    type="text"
                    disabled
                    value="纯文本 TXT 格式 (规范标准)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono text-[11px]"
                  />
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
                  图书正文或章节内容 (以 # 或 第X章 作为新章节分割)
                </label>
                <textarea
                  rows={6}
                  value={bookForm.content}
                  onChange={(e) => setBookForm({ ...bookForm, content: e.target.value })}
                  placeholder="可直接粘贴纯文本 TXT 内容，或通过上方选择本地 TXT 文件导入..."
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
                  {editingBookId ? '保存图书修改' : '确认上架 TXT 图书'}
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
