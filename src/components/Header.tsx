import React from 'react';
import { BookOpen, User, ShieldAlert, Globe, Feather, Menu, X, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, UiTexts, AuthorBio } from '../types';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onAdminClick?: () => void;
  isAdmin?: boolean;
  onLogout?: () => void;
  onNavigateToSection: (sectionId: string) => void;
  uiTexts: UiTexts;
  author?: AuthorBio | null;
  onContactClick?: () => void;
  showPostsBanner?: boolean;
  setShowPostsBanner?: (val: boolean) => void;
  activeSection?: string;
}

export default function Header({
  lang,
  setLang,
  onNavigateToSection,
  uiTexts,
  author,
  onContactClick,
  showPostsBanner,
  setShowPostsBanner,
  activeSection = 'books-section'
}: HeaderProps) {
  const isRtl = lang === 'ar';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Play a soft, pleasant 3D crystal chime sound using the browser's Web Audio API
  React.useEffect(() => {
    if (showPostsBanner && uiTexts.disablePostsNotifications !== true) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
          const now = ctx.currentTime;
          
          const playTone = (freq: number, time: number, duration: number, vol: number) => {
            const osc = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);
            
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(freq * 1.498, time); // Sleek pleasant fifth ratio
            
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(vol, time + 0.04); // Extra soft pleasant attack
            gain.gain.exponentialRampToValueAtTime(0.0001, time + duration); // Long elegant decay
            
            osc.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(time);
            osc2.start(time);
            osc.stop(time + duration);
            osc2.stop(time + duration);
          };
          
          // Play a gorgeous soft arpeggiated chime
          playTone(987.77, now, 0.5, 0.04); // B5 note (distinctive soft chime)
          playTone(1318.51, now + 0.065, 0.6, 0.035); // E6 note (harmonic fourth, very elegant)
        }
      } catch (e) {
        console.warn('Sleek notification chime blocked by browser policy:', e);
      }
    }
  }, [showPostsBanner]);

  const t = {
    title: isRtl ? uiTexts.titleAr : uiTexts.titleEn,
    tagline: isRtl ? uiTexts.taglineAr : uiTexts.taglineEn,
    books: isRtl ? uiTexts.booksAr : uiTexts.booksEn,
    about: isRtl ? uiTexts.aboutAr : uiTexts.aboutEn,
    dashboard: isRtl ? uiTexts.dashboardAr : uiTexts.dashboardEn,
    logout: isRtl ? uiTexts.logoutAr : uiTexts.logoutEn,
    logoPlaceholder: isRtl ? 'مساحة الشعار الخاص بك' : 'Your Custom Logo'
  };

  return (
    <header className="h-20 border-b border-white/10 flex items-center px-3 sm:px-6 md:px-12 justify-between bg-brand-ink z-50 sticky top-0 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        
        {/* LEFT: Branding & Custom Logo Placeholder */}
        <div className={`flex items-center gap-2 sm:gap-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          
          {/* Logo Placeholder - elegant square golden border from Artistic Flair */}
          <div 
            id="custom-logo-container"
            title={t.logoPlaceholder}
            className="w-8 h-8 md:w-10 md:h-10 border border-brand-gold md:border-2 flex items-center justify-center font-bold text-brand-gold bg-transparent transition-all duration-300 hover:brightness-110 cursor-pointer overflow-hidden"
          >
            {uiTexts.logoUrl ? (
              <img 
                src={uiTexts.logoUrl} 
                alt="Logo" 
                className="w-full h-full object-contain p-0.5" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="font-serif text-xs md:text-sm tracking-widest">{uiTexts.logoText}</span>
            )}
          </div>

          {/* Site Title Text */}
          <div className={`flex flex-col ${isRtl ? 'text-right' : 'text-left'}`}>
            <h1 className="text-xs sm:text-base md:text-lg lg:text-xl tracking-[0.05em] sm:tracking-[0.15em] font-light leading-none text-white font-serif uppercase flex items-center gap-1.5">
              <span>{t.title}</span>
              {uiTexts.showVerifiedBadgeInHeader && (
                <svg className="h-4 w-4 shrink-0 inline-block align-middle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" title="Verified Publisher">
                  <path 
                    d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" 
                    fill="#1877F2" 
                  />
                  <path 
                    d="m9 12 2 2 4-4" 
                    stroke="white" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </svg>
              )}
            </h1>
            <p className="text-[7px] sm:text-[9px] md:text-[10px] tracking-[0.1em] sm:tracking-[0.25em] text-brand-gold uppercase mt-1 leading-none">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* MIDDLE: Navigation Links */}
        <nav className={`hidden md:flex items-center gap-10 text-[11px] uppercase tracking-widest font-sans ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <button 
            id="nav-books-btn"
            onClick={() => onNavigateToSection('books-section')}
            className={`relative py-1.5 font-medium transition-colors duration-200 cursor-pointer ${
              activeSection === 'books-section' ? 'text-slate-100' : 'text-slate-400 hover:text-brand-gold'
            }`}
          >
            <span>{t.books}</span>
            {activeSection === 'books-section' && (
              <motion.div
                layoutId="header-active-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
          </button>

          {uiTexts.hidePostsSection !== true && (
            <div className="relative flex items-center">
              <button 
                id="nav-posts-btn"
                onClick={() => onNavigateToSection('posts-section')}
                className={`relative py-1.5 font-medium transition-colors duration-200 cursor-pointer ${
                  activeSection === 'posts-section' ? 'text-slate-100' : 'text-slate-400 hover:text-brand-gold'
                }`}
              >
                <span>{isRtl ? 'المنشورات' : 'Posts'}</span>
                {activeSection === 'posts-section' && (
                  <motion.div
                    layoutId="header-active-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
              </button>

              {/* Sleek, 3D-like Desktop Notification popping up right below this button */}
              <AnimatePresence>
                {showPostsBanner && uiTexts.disablePostsNotifications !== true && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.82, y: -10, rotateX: -15 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -6, rotateX: -10 }}
                    transition={{ type: 'spring', damping: 14, stiffness: 200 }}
                    style={{ perspective: 1000 }}
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-3.5 z-[100] w-72 rounded-lg border border-brand-gold/40 bg-gradient-to-b from-[#161a1d] to-[#0a0c0e] p-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.9),_0_0_20px_rgba(212,175,55,0.2),_inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md ${
                      isRtl ? 'text-right' : 'text-left'
                    }`}
                  >
                    {/* Subtle Top Caret Arrow pointing at button */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#161a1d] border-t border-l border-brand-gold/40" />
                    
                    {/* Compact Close Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPostsBanner?.(false);
                      }}
                      className={`absolute top-2 p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer ${
                        isRtl ? 'left-2' : 'right-2'
                      }`}
                      title={isRtl ? 'إغلاق' : 'Close'}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <div className={`flex gap-2.5 items-start ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <div className="p-1.5 rounded bg-brand-gold/15 text-brand-gold shrink-0 border border-brand-gold/25 shadow-md">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0 pr-1 pl-1">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
                          </span>
                          <h4 className="text-[9.5px] font-bold uppercase tracking-widest text-brand-gold font-mono leading-none">
                            {isRtl ? 'منصة التفاعل والخواطر' : 'Live Social Feed'}
                          </h4>
                        </div>
                        <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans font-medium">
                          {isRtl 
                            ? 'اكتشف منشوراتنا وخواطرنا الأدبية وشاركنا تفاعلك.' 
                            : 'Explore our latest notes, literature updates, and community talk.'}
                        </p>
                        <div className={`mt-3 flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToSection('posts-section');
                              setShowPostsBanner?.(false);
                            }}
                            className="rounded-sm bg-brand-gold border border-brand-gold hover:bg-transparent hover:text-brand-gold px-3.5 py-1 text-[9px] font-bold text-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-[0_2px_8px_rgba(212,175,55,0.3)] hover:shadow-none"
                          >
                            {isRtl ? 'عرض المنشورات' : 'Explore Feed'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          <button 
            id="nav-about-btn"
            onClick={() => onNavigateToSection('author-section')}
            className={`relative py-1.5 font-medium transition-colors duration-200 cursor-pointer ${
              activeSection === 'author-section' ? 'text-slate-100' : 'text-slate-400 hover:text-brand-gold'
            }`}
          >
            <span>{t.about}</span>
            {activeSection === 'author-section' && (
              <motion.div
                layoutId="header-active-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
          </button>

          {author?.contactFeature?.enableFeature && author?.contactFeature?.showInHeader && (
            <button 
              id="nav-contact-btn"
              onClick={onContactClick}
              className="relative py-1.5 text-slate-400 font-medium transition-colors duration-200 hover:text-brand-gold cursor-pointer"
            >
              <span>{isRtl ? (author.contactFeature.titleAr || 'اتصل بالكاتب') : (author.contactFeature.titleEn || 'Contact the Author')}</span>
            </button>
          )}
        </nav>

        {/* RIGHT: Actions (Admin Button) */}
        <div className={`flex items-center gap-1.5 sm:gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>

          {/* Posts Option (Visible on Mobile Only, next to control panel) */}
          {uiTexts.hidePostsSection !== true && (
            <div className="relative md:hidden">
              <button
                id="mobile-posts-shortcut"
                onClick={() => onNavigateToSection('posts-section')}
                className="flex items-center justify-center gap-1 px-2 py-1 rounded-sm border border-brand-gold/25 bg-brand-gold/5 text-brand-gold hover:bg-brand-gold/10 transition-all duration-200 text-[9px] uppercase tracking-wider font-semibold cursor-pointer"
              >
                <span>{isRtl ? 'المنشورات' : 'Posts'}</span>
              </button>

              {/* Sleek, 3D-like Mobile Notification popping up right below this shortcut */}
              <AnimatePresence>
                {showPostsBanner && uiTexts.disablePostsNotifications !== true && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.82, y: -10, rotateX: -15 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -6, rotateX: -10 }}
                    transition={{ type: 'spring', damping: 14, stiffness: 200 }}
                    style={{ perspective: 1000 }}
                    className={`absolute top-full right-0 mt-3.5 z-[100] w-64 rounded-lg border border-brand-gold/40 bg-gradient-to-b from-[#161a1d] to-[#0a0c0e] p-3 shadow-[0_12px_30px_rgba(0,0,0,0.9),_0_0_20px_rgba(212,175,55,0.2),_inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md ${
                      isRtl ? 'text-right' : 'text-left'
                    }`}
                  >
                    {/* Subtle Top Caret Arrow pointing at mobile button */}
                    <div className="absolute -top-1.5 right-6 w-3 h-3 rotate-45 bg-[#161a1d] border-t border-l border-brand-gold/40" />
                    
                    {/* Compact Close Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPostsBanner?.(false);
                      }}
                      className={`absolute top-2 p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer ${
                        isRtl ? 'left-2' : 'right-2'
                      }`}
                      title={isRtl ? 'إغلاق' : 'Close'}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <div className={`flex gap-2 items-start ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <div className="p-1 rounded bg-brand-gold/15 text-brand-gold shrink-0 border border-brand-gold/25 shadow-sm">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0 pr-0.5 pl-0.5">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-gold"></span>
                          </span>
                          <h4 className="text-[9px] font-bold uppercase tracking-widest text-brand-gold font-mono leading-none">
                            {isRtl ? 'منصة التفاعل' : 'Live Feed'}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed font-sans font-medium">
                          {isRtl 
                            ? 'اكتشف منشوراتنا الأدبية وتفاعل معنا.' 
                            : 'Explore our latest notes and join the talk.'}
                        </p>
                        <div className={`mt-2.5 flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToSection('posts-section');
                              setShowPostsBanner?.(false);
                            }}
                            className="rounded-sm bg-brand-gold border border-brand-gold hover:bg-transparent hover:text-brand-gold px-3 py-1 text-[8.5px] font-bold text-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-[0_2px_8px_rgba(212,175,55,0.3)] hover:shadow-none"
                          >
                            {isRtl ? 'المنشورات' : 'Feed'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}



          {/* Mobile Menu Toggle Button */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-1.5 rounded-sm border border-white/10 bg-white/5 text-slate-400 hover:text-brand-gold hover:border-brand-gold transition-all duration-200 cursor-pointer"
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-20 left-0 right-0 border-b border-white/10 bg-brand-ink/95 backdrop-blur-md md:hidden z-40 overflow-hidden"
          >
            <nav className={`flex flex-col p-6 gap-5 text-xs uppercase tracking-widest font-sans ${isRtl ? 'text-right' : 'text-left'}`}>
              <button 
                id="mobile-nav-books-btn"
                onClick={() => {
                  onNavigateToSection('books-section');
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2.5 font-medium transition-colors duration-200 hover:text-brand-gold border-b border-white/5 flex items-center gap-2 ${isRtl ? 'flex-row-reverse text-right' : ''} ${
                  activeSection === 'books-section' ? 'text-brand-gold font-semibold' : 'text-slate-400'
                }`}
              >
                <span>{t.books}</span>
              </button>

              {uiTexts.hidePostsSection !== true && (
                <button 
                  id="mobile-nav-posts-btn"
                  onClick={() => {
                    onNavigateToSection('posts-section');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-2.5 font-medium transition-colors duration-200 hover:text-brand-gold border-b border-white/5 flex items-center gap-2 ${isRtl ? 'flex-row-reverse text-right' : ''} ${
                    activeSection === 'posts-section' ? 'text-brand-gold font-semibold' : 'text-slate-400'
                  }`}
                >
                  <span>{isRtl ? 'المنشورات' : 'Posts'}</span>
                </button>
              )}
              
              <button 
                id="mobile-nav-about-btn"
                onClick={() => {
                  onNavigateToSection('author-section');
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2.5 font-medium transition-colors duration-200 hover:text-brand-gold border-b border-white/5 flex items-center gap-2 ${isRtl ? 'flex-row-reverse text-right' : ''} ${
                  activeSection === 'author-section' ? 'text-brand-gold font-semibold' : 'text-slate-400'
                }`}
              >
                <span>{t.about}</span>
              </button>

              {author?.contactFeature?.enableFeature && author?.contactFeature?.showInHeader && (
                <button 
                  id="mobile-nav-contact-btn"
                  onClick={() => {
                    if (onContactClick) onContactClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-2.5 text-slate-400 font-medium transition-colors duration-200 hover:text-brand-gold flex items-center gap-2 ${isRtl ? 'flex-row-reverse text-right' : ''}`}
                >
                  <span>{isRtl ? (author.contactFeature.titleAr || 'اتصل بالكاتب') : (author.contactFeature.titleEn || 'Contact the Author')}</span>
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
