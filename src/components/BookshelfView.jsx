import React, { useState } from 'react';
import {
  BookOpen, ChevronRight, ChevronLeft,
  Maximize2, Minimize2, ArrowLeft,
  BookMarked, Download, Upload, Trash2, Edit3,
  Plus, X, FileText, CheckCircle2, List, Layers,
  RefreshCw, Check, AlertCircle
} from 'lucide-react';
import { downloadFile } from '../services/documentConverter';
import { handleImageError } from '../services/utils';
import { saveVaultFile, getVaultFile, deleteVaultFile } from '../services/indexedDbVault';

export const BookshelfView = ({ books, setBooks, currentUser, isAdmin, t }) => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [mobileFullscreen, setMobileFullscreen] = useState(false);
  const [readerFontSize, setReaderFontSize] = useState('text-base');
  const [showChapterMenu, setShowChapterMenu] = useState(false);

  // Admin / Upload / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);

  // Batch upload state (Any Ebook format: PDF, EPUB, TXT, etc.)
  const [batchFiles, setBatchFiles] = useState([]);
  const [isImportingBatch, setIsImportingBatch] = useState(false);

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    category: '技术专著',
    format: 'TXT',
    description: '',
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    content: '',
    vaultId: null,
    fileExt: 'txt'
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

  // Download book function (all formats: PDF, EPUB, MOBI, TXT, etc.)
  const handleDownloadBook = async (book, e) => {
    if (e) e.stopPropagation();
    try {
      // 1. If stored in IndexedDB Vault
      if (book.vaultId) {
        const fileRecord = await getVaultFile(book.vaultId);
        if (fileRecord && fileRecord.blob) {
          const ext = book.fileExt || book.format?.toLowerCase() || 'bin';
          downloadFile(fileRecord.blob, `${book.title}_白狐藏书.${ext}`, fileRecord.type || 'application/octet-stream');
          showToast(`《${book.title}》文件已从本地保险箱开始高速导出！`);
          return;
        }
      }

      // 2. If it's pure TXT or chapters
      let bookText = `# ${book.title}\n作者：${book.author}\n分类：${book.category}\n\n简介：\n${book.description || ''}\n\n`;
      if (book.chapters && book.chapters.length > 0) {
        book.chapters.forEach((chap, idx) => {
          bookText += `\n========================================\n第 ${idx + 1} 章 · ${chap.title}\n========================================\n\n${chap.content}\n\n`;
        });
      } else if (book.content) {
        bookText += book.content;
      }

      const formatExt = (book.format || 'TXT').toLowerCase();
      downloadFile(bookText, `${book.title}_白狐书架.${formatExt}`, 'text/plain;charset=utf-8');
      showToast(`《${book.title}》已成功开始下载！`);
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
  const handleDeleteBook = async (id, title, e) => {
    if (e) e.stopPropagation();
    const target = books.find((b) => b.id === id);
    if (!canManageBook(target)) {
      showToast('权限不足：仅管理员或上传者可下架自己的图书！');
      return;
    }
    if (window.confirm(`确定要从白狐书架彻底删除《${title}》吗？`)) {
      if (target?.vaultId) {
        await deleteVaultFile(target.vaultId);
      }
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

  // Local file upload parser supporting all formats (TXT, PDF, EPUB, MOBI, DOCX, etc.)
  const handleLocalFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extMatch = file.name.match(/\.([^.]+)$/);
    const ext = extMatch ? extMatch[1].toUpperCase() : 'TXT';
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    const isTxt = ext === 'TXT' || file.type.includes('text');

    // Store binary in IndexedDB Vault
    const vaultId = `book-vault-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await saveVaultFile(vaultId, file, { name: file.name, type: file.type, size: file.size });

    if (isTxt) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawText = event.target.result;
        setBookForm((prev) => ({
          ...prev,
          title: prev.title || fileName,
          format: 'TXT',
          content: typeof rawText === 'string' ? rawText : '',
          vaultId,
          fileExt: 'txt'
        }));
        showToast(`已成功载入本地 TXT 文本「${file.name}」！`);
      };
      reader.readAsText(file);
    } else {
      // Non-TXT format (PDF, EPUB, MOBI, DOCX, etc.)
      setBookForm((prev) => ({
        ...prev,
        title: prev.title || fileName,
        format: ext,
        content: `【${ext} 电子书文档】\n已安全存入本地高可用保险箱 (大小: ${(file.size / (1024 * 1024)).toFixed(2)} MB)。\n支持点击导出下载与外部阅读器打开。`,
        vaultId,
        fileExt: ext.toLowerCase()
      }));
      showToast(`已成功载入本地 ${ext} 文档「${file.name}」并存入本地保险箱！`);
    }
  };

  // Batch file select handler (supports all document formats)
  const handleBatchFilesSelect = (e) => {
    const allFiles = Array.from(e.target.files || []);
    if (!allFiles.length) return;

    setBatchFiles(allFiles);
    showToast(`已选入 ${allFiles.length} 份电子书文档！`);
  };

  // Batch import files directly to bookshelf with IndexedDB backing
  const handleProcessBatchImport = async () => {
    if (!batchFiles.length) {
      showToast('请先选择需要批量导入的电子书！');
      return;
    }

    setIsImportingBatch(true);
    const newBooksToAdd = [];

    try {
      for (const file of batchFiles) {
        const extMatch = file.name.match(/\.([^.]+)$/);
        const ext = extMatch ? extMatch[1].toUpperCase() : 'TXT';
        const isTxt = ext === 'TXT' || file.type.includes('text');
        const vaultId = `book-vault-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        await saveVaultFile(vaultId, file, { name: file.name, type: file.type, size: file.size });

        let chapters = [];
        let bookDesc = `批量上传导入的 ${ext} 电子书 (${file.name})。`;

        if (isTxt) {
          const content = await file.text();
          const lines = content.split('\n');
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
        } else {
          chapters = [{
            title: `全书概览 (${ext})`,
            content: `【${ext} 格式原装文档】\n已持久化保存在白狐本地数字保险箱中。\n文件大小：${(file.size / (1024 * 1024)).toFixed(2)} MB。\n点击详情或下载按钮可随时导出原件。`
          }];
        }

        const newBook = {
          id: `book-batch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          author: currentUser?.username || '批量上架',
          userId: currentUser?.id || 'guest',
          category: '经典文集',
          format: ext,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          progress: 0,
          totalChapters: chapters.length,
          cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
          description: bookDesc,
          dateAdded: new Date().toISOString().split('T')[0],
          chapters: chapters,
          vaultId,
          fileExt: ext.toLowerCase()
        };

        newBooksToAdd.push(newBook);
      }

      setBooks([...newBooksToAdd, ...books]);
      showToast(`成功批量上架 ${newBooksToAdd.length} 本电子书至书架！`);
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

    const bookFormat = bookForm.format || 'TXT';

    if (editingBookId) {
      // Update existing book
      setBooks(books.map((b) => b.id === editingBookId ? {
        ...b,
        title: bookForm.title,
        author: bookForm.author || '佚名',
        category: bookForm.category,
        format: bookFormat,
        description: bookForm.description,
        cover: bookForm.cover,
        chapters: chapters,
        totalChapters: chapters.length,
        vaultId: bookForm.vaultId || b.vaultId,
        fileExt: bookForm.fileExt || b.fileExt || bookFormat.toLowerCase()
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
        format: bookFormat,
        size: `${(new Blob([rawContent]).size / (1024 * 1024)).toFixed(2)} MB`,
        progress: 0,
        totalChapters: chapters.length,
        cover: bookForm.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        description: bookForm.description || `用户上传入库的 ${bookFormat} 藏书。`,
        dateAdded: new Date().toISOString().split('T')[0],
        chapters: chapters,
        vaultId: bookForm.vaultId,
        fileExt: bookForm.fileExt || bookFormat.toLowerCase()
      };
      setBooks([newBook, ...books]);
      showToast(`成功将《${newBook.title}》(${bookFormat}) 上架到白狐书架！`);
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
              <span>墨香书阁 · 纯文本阅读与书库管理</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              书架精选专区
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              汇聚技术专著与古籍文学，仅支持 TXT 格式纯文本图书。提供纯净沉浸式阅读与离线下载。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Batch TXT Upload - only for logged-in users */}
            {currentUser && (
              <>
                <button
                  onClick={() => setIsBatchModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>批量上传电子书</span>
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
      <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-4 flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            全格式藏书阁已就绪：全面支持 <strong>PDF、EPUB、MOBI、AZW3、TXT、DOC、DOCX</strong> 等格式上传。文件通过本地数字保险箱持久化存储，离线不丢失，一键高速导出！
          </span>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-emerald-200/60 font-mono text-[11px] font-bold text-emerald-800">
          ALL FORMATS SUPPORTED
        </span>
      </div>

      {/* Book Grid */}
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
                  loading="lazy"
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-white font-mono uppercase">
                  {book.format || 'TXT'} · {book.size || '1.0 MB'}
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-emerald-600 text-[10px] text-white font-mono">
                  {book.chapters?.length || book.totalChapters || 1} 章节
                </div>

                {/* Owner or Admin Quick Action Floating Buttons */}
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
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>进入沉浸阅读</span>
              </button>
              <button
                onClick={(e) => handleDownloadBook(book, e)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-emerald-700 text-xs font-semibold flex items-center justify-center transition-colors"
                title="导出下载到本地"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Batch Upload Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-base">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>批量上传电子书文档至书架</span>
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
                  支持同时选择多份电子书文档 (PDF, EPUB, MOBI, TXT, DOCX 等)
                </p>
                <p className="text-[11px] text-slate-500">
                  所有文档将安全持久化存储于本地数字保险箱中，刷新不丢失，支持离线高速下载与沉浸阅读。
                </p>
                <div>
                  <label className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>选择多个电子书文件</span>
                    <input
                      type="file"
                      multiple
                      accept="*/*"
                      onChange={handleBatchFilesSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {batchFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-semibold text-slate-700">
                    <span>已选电子书文件 ({batchFiles.length})</span>
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

      {/* Book Upload / Edit Modal for Admins (All formats) */}
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
              {/* Local File Selector */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">读取本地电子书文件</span>
                  <label className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-semibold flex items-center space-x-1 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>选择文件 (全格式)</span>
                    <input
                      type="file"
                      accept="*/*"
                      onChange={handleLocalFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-emerald-700">
                  全面支持 PDF、EPUB、MOBI、TXT、DOCX 等文件格式，自动保存入本地保险箱，刷新不丢失。
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
                    value={bookForm.format || 'TXT'}
                    onChange={(e) => setBookForm({ ...bookForm, format: e.target.value.toUpperCase() })}
                    placeholder="如：PDF, EPUB, TXT, MOBI"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-[11px]"
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
