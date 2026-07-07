import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, BookOpen, AlertCircle, RefreshCw, Feather, Sparkles, Type, Minus, Plus, RotateCcw, X, MessageSquare } from 'lucide-react';
import { Book, AuthorBio, Language, UiTexts, Post } from './types';
import { defaultUiTexts } from './data/defaultUiTexts';
import Header from './components/Header';
import PostsSection from './components/PostsSection';
import Hero from './components/Hero';
import BookCard from './components/BookCard';
import AuthorSection from './components/AuthorSection';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';

export default function App() {
  const [lang, setLang] = useState<Language>('ar'); // Default to Arabic as requested for "رحلتي غيبوبة"
  const [books, setBooks] = useState<Book[]>([]);
  const [author, setAuthor] = useState<AuthorBio | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [uiTexts, setUiTexts] = useState<UiTexts>(defaultUiTexts);
  
  // App UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'posts'>('home');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPostsBanner, setShowPostsBanner] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('books-section');

  // Synchronize language selection with document direction
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('coma_theme') as 'dark' | 'light') || 'dark';
  });

  // Synchronize theme with document class list
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('coma_theme', theme);
  }, [theme]);

  // Synchronize Creamy Elegant Theme Mode dynamically
  useEffect(() => {
    if (uiTexts.creamyThemeMode) {
      document.documentElement.classList.add('creamy-theme');
    } else {
      document.documentElement.classList.remove('creamy-theme');
    }
  }, [uiTexts.creamyThemeMode]);

  // Synchronize Reader Font Size & Contrast dynamically from global admin uiTexts
  useEffect(() => {
    try {
      const fontSize = uiTexts.globalFontSize || 100;
      document.documentElement.style.fontSize = `${fontSize}%`;
    } catch (e) {
      console.error(e);
    }
  }, [uiTexts.globalFontSize]);

  // Prevent active view from being posts if posts are hidden
  useEffect(() => {
    if (uiTexts.hidePostsSection && activeView === 'posts') {
      setActiveView('home');
    }
  }, [uiTexts.hidePostsSection, activeView]);

  // Check initial admin authorization on load
  useEffect(() => {
    const token = sessionStorage.getItem('coma_admin_token');
    if (token === 'coma_secure_token_2026') {
      setIsAdmin(true);
    }
  }, [isAdminOpen]);

  // Fetch all site content
  const fetchData = async () => {
    try {
      setError('');
      // Parallel fetch for speed
      const [booksRes, authorRes, uiTextsRes, postsRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/author'),
        fetch('/api/uitexts'),
        fetch('/api/posts').catch(() => null)
      ]);

      if (!booksRes.ok || !authorRes.ok || !uiTextsRes.ok) {
        throw new Error('Database loading mismatch / فشل في مزامنة قاعدة البيانات');
      }

      const booksData = await booksRes.json();
      const authorData = await authorRes.json();
      const uiTextsData = await uiTextsRes.json();
      const postsData = postsRes && postsRes.ok ? await postsRes.json() : [];

      setBooks(booksData);
      setAuthor(authorData);
      setUiTexts({ ...defaultUiTexts, ...uiTextsData });
      setPosts(postsData);
    } catch (err: any) {
      console.error(err);
      setError(lang === 'ar' ? 'فشل تحميل محتوى الموقع. يرجى تصفح الرابط لاحقاً.' : 'Could not fetch site contents. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPostsOnly = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const postsData = await res.json();
        setPosts(postsData);
      }
    } catch (err) {
      console.error('Error polling posts:', err);
    }
  };

  // Real-time polling interval for smooth and fast update of view/like counts for all users
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPostsOnly();
    }, 4000); // Check every 4 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Increment site visitor counter on initial visit
    fetch('/api/visitor/increment', { method: 'POST' })
      .catch((err) => console.error('Error incrementing visitor counter:', err));
    fetchData();

    // Small non-intrusive banner popup regarding posts list
    if (uiTexts.disablePostsNotifications === true) return;
    const alreadyNotified = sessionStorage.getItem('coma_posts_notified');
    if (!alreadyNotified) {
      const timer = setTimeout(() => {
        setShowPostsBanner(true);
        // Automatically hide after 7 seconds
        const hideTimer = setTimeout(() => {
          setShowPostsBanner(false);
        }, 7000);
        sessionStorage.setItem('coma_posts_notified', 'true');
        return () => clearTimeout(hideTimer);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [uiTexts.disablePostsNotifications]);

  // Synchronize activeSection with activeView and scroll position
  useEffect(() => {
    if (activeView === 'posts') {
      setActiveSection('posts-section');
    } else {
      setActiveSection('books-section');
    }
  }, [activeView]);

  useEffect(() => {
    if (activeView !== 'home') return;

    const handleScroll = () => {
      const booksEl = document.getElementById('books-section');
      const authorEl = document.getElementById('author-section');
      
      const scrollPos = window.scrollY + 200; // Offset for better detection
      
      if (authorEl && scrollPos >= authorEl.offsetTop) {
        setActiveSection('author-section');
      } else if (booksEl && scrollPos >= booksEl.offsetTop) {
        setActiveSection('books-section');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeView]);

  const handleLogout = () => {
    sessionStorage.removeItem('coma_admin_token');
    setIsAdmin(false);
    setIsAdminOpen(false);
    fetchData();
  };

  // Live trigger to update download counter in-place
  const handleDownloadStarted = (bookId: string) => {
    // Optimistic download count increment on client for immediate visual feedback
    setBooks(prevBooks => 
      prevBooks.map(b => b.id === bookId ? { ...b, downloadCount: (b.downloadCount || 0) + 1 } : b)
    );
    // Refresh database from server in the background after a brief delay
    setTimeout(() => {
      fetchData();
    }, 2500);
  };

  // Section navigation helper
  const handleNavigateToSection = (sectionId: string) => {
    setIsAdminOpen(false); // Make sure admin dashboard is closed to focus on the regular layout
    if (sectionId === 'posts-section') {
      if (uiTexts.hidePostsSection) return;
      setActiveView('posts');
      setActiveSection('posts-section');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveView('home');
      setActiveSection(sectionId);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (sectionId === 'hero-section') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Extracted unique categories based on active language
  const uniqueCategories = ['all', ...Array.from(new Set(books.map(b => 
    lang === 'ar' ? b.categoryAr || b.categoryEn : b.categoryEn || b.categoryAr
  )))];

  // Filtering Logic
  const filteredBooks = books.filter(book => {
    const title = lang === 'ar' ? book.titleAr : book.titleEn;
    const desc = lang === 'ar' ? book.descriptionAr : book.descriptionEn;
    const cat = lang === 'ar' ? book.categoryAr : book.categoryEn;
    
    const matchesSearch = 
      title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = 
      selectedCategory === 'all' || 
      cat === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const isRtl = lang === 'ar';

  const t = {
    searchPlaceholder: isRtl ? uiTexts.searchPlaceholderAr : uiTexts.searchPlaceholderEn,
    allCategories: isRtl ? uiTexts.allCategoriesAr : uiTexts.allCategoriesEn,
    featuredTitle: isRtl ? uiTexts.featuredTitleAr : uiTexts.featuredTitleEn,
    mainShelfTitle: isRtl ? uiTexts.mainShelfTitleAr : uiTexts.mainShelfTitleEn,
    mainShelfSub: isRtl ? uiTexts.mainShelfSubAr : uiTexts.mainShelfSubEn,
    noBooksFound: isRtl ? uiTexts.noBooksFoundAr : uiTexts.noBooksFoundEn,
    connecting: isRtl ? uiTexts.connectingAr : uiTexts.connectingEn,
    retry: isRtl ? uiTexts.retryAr : uiTexts.retryEn,
    featuredBadge: isRtl ? uiTexts.featuredBadgeAr : uiTexts.featuredBadgeEn
  };

  return (
    <div className={`min-h-screen bg-brand-ink text-slate-100 selection:bg-brand-gold selection:text-brand-ink ${uiTexts.globalContrast === 'soft' ? 'reader-text-soft' : uiTexts.globalContrast === 'high' ? 'reader-text-high' : ''}`}>
      


      {/* Dynamic Bilingual Header */}
      <Header
        lang={lang}
        setLang={setLang}
        onNavigateToSection={handleNavigateToSection}
        uiTexts={uiTexts}
        author={author}
        onContactClick={() => setShowContactModal(true)}
        showPostsBanner={showPostsBanner}
        setShowPostsBanner={setShowPostsBanner}
        activeSection={activeSection}
      />

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: PRIVATE SECURE ADMINISTRATOR CONTROL PANEL */}
        {isAdminOpen ? (
          <motion.div
            key="admin-panel"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            {author && (
              <AdminDashboard
                lang={lang}
                books={books}
                author={author}
                posts={posts}
                onRefreshData={fetchData}
                onClose={() => setIsAdminOpen(false)}
                uiTexts={uiTexts}
                currentTheme={theme}
                onToggleTheme={setTheme}
              />
            )}
          </motion.div>
        ) : (
          
          /* VIEW 2: PRIMARY READER BOOK PLATFORM */
          /* VIEW 2: PRIMARY READER BOOK PLATFORM */
          <motion.div
            key={`main-platform-${activeView}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeView === 'posts' ? (
              <>
                {author && (
                  <PostsSection
                    lang={lang}
                    posts={posts}
                    author={author}
                    uiTexts={uiTexts}
                    onRefreshData={fetchData}
                    isAdmin={isAdmin}
                    isDedicatedPage={true}
                    onBackToHome={() => setActiveView('home')}
                  />
                )}
                {/* Artistic Literary Footer */}
                <Footer 
                  lang={lang} 
                  uiTexts={uiTexts} 
                  isAdmin={isAdmin}
                  onAdminClick={() => setIsAdminOpen(true)}
                  onLogout={handleLogout}
                />
              </>
            ) : (
              <>
                {/* Elegant Atmospheric Hero Screen */}
                <Hero 
                  lang={lang} 
                  onExploreClick={() => handleNavigateToSection('books-section')} 
                  uiTexts={uiTexts}
                  author={author}
                  onContactClick={() => setShowContactModal(true)}
                />

                {/* MAIN E-BOOKS DIRECTORY & SEARCH SECTION */}
                <main id="books-section" className="mx-auto max-w-7xl px-6 py-24 scroll-mt-12">
                  
                  {/* Dynamic Connection/Loading Indicator */}
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <RefreshCw className="h-8 w-8 text-brand-gold animate-spin" />
                      <p className="text-sm text-slate-400 font-mono tracking-wide">{t.connecting}</p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 max-w-md mx-auto">
                      <AlertCircle className="h-12 w-12 text-brand-crimson mb-4" />
                      <p className="text-sm text-slate-400 mb-6">{error}</p>
                      <button
                        onClick={fetchData}
                        className="rounded-lg bg-brand-gold px-6 py-2.5 text-xs font-bold text-brand-ink cursor-pointer"
                      >
                        {t.retry}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-16">
                      
                      {/* SEARCH & FILTERS BAR */}
                      {uiTexts.hideSearchFilters !== true && (
                        <div className={`flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 pb-8 border-b border-white/10 ${isRtl ? 'lg:flex-row-reverse' : ''}`}>
                          
                          {/* Search Field */}
                          <div className="relative flex-grow max-w-xl">
                            <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 ${isRtl ? 'right-4' : 'left-4'}`} />
                            <input
                              id="books-search-bar"
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder={t.searchPlaceholder}
                              className={`w-full rounded-sm border border-white/10 bg-white/5 py-3.5 text-sm text-white focus:border-brand-gold focus:outline-none focus:ring-0 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`}
                            />
                          </div>

                          {/* Filter Category Buttons */}
                          <div className={`flex flex-wrap gap-2 items-center ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Filter className="h-4 w-4 text-brand-gold/60 shrink-0 mx-1" />
                            {uniqueCategories.map((cat) => (
                              <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`rounded-sm px-4 py-1.5 text-[11px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                                  selectedCategory === cat
                                    ? 'bg-brand-gold text-black'
                                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                                }`}
                              >
                                 {cat === 'all' ? t.allCategories : cat}
                              </button>
                            ))}
                          </div>

                        </div>
                      )}

                      {/* FEATURED BOOKS BANNER (Only shows when search/filter is clean) */}
                      {searchQuery === '' && selectedCategory === 'all' && books.some(b => b.isFeatured) && (
                        <div className="space-y-8 animate-fade-in">
                          <h3 className={`font-serif text-xl font-light tracking-widest text-white uppercase flex items-center gap-2 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                            <Sparkles className="h-4 w-4 text-brand-gold" />
                            <span>{t.featuredTitle}</span>
                          </h3>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {books.filter(b => b.isFeatured).map((book) => (
                              <motion.div
                                key={`featured-${book.id}`}
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                              >
                                <BookCard
                                  book={book}
                                  lang={lang}
                                  onDownloadStarted={handleDownloadStarted}
                                  uiTexts={uiTexts}
                                />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* GENERAL LIBRARY BOOKSHELF LIST */}
                      {uiTexts.showDirectDownloadLibrary !== false && (
                        <div className="space-y-8">
                          <div className={isRtl ? 'text-right' : 'text-left'}>
                            <h3 className="font-serif text-2xl font-light tracking-widest text-white uppercase">
                              {t.mainShelfTitle}
                            </h3>
                            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold">
                              {t.mainShelfSub}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-8">
                            {filteredBooks.map((book, index) => (
                              <motion.div
                                key={`library-${book.id}`}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05, duration: 0.4 }}
                              >
                                <BookCard
                                  book={book}
                                  lang={lang}
                                  onDownloadStarted={handleDownloadStarted}
                                  uiTexts={uiTexts}
                                />
                              </motion.div>
                            ))}
                          </div>

                          {filteredBooks.length === 0 && (
                            <div className="flex flex-col items-center justify-center text-center py-24 rounded-sm border border-dashed border-white/10 bg-white/5">
                              <BookOpen className="h-10 w-10 text-slate-700 mb-3" />
                              <p className="text-sm text-slate-500 font-mono uppercase">{t.noBooksFound}</p>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                </main>

                {/* Immersive Author Portrait and Philosophy Section */}
                {author && (
                  <AuthorSection 
                    bio={author} 
                    lang={lang} 
                    uiTexts={uiTexts}
                    showContactModal={showContactModal}
                    setShowContactModal={setShowContactModal}
                  />
                )}

                {/* Artistic Literary Footer */}
                <Footer 
                  lang={lang} 
                  uiTexts={uiTexts} 
                  isAdmin={isAdmin}
                  onAdminClick={() => setIsAdminOpen(true)}
                  onLogout={handleLogout}
                />
              </>
            )}
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
