import React, { useState } from 'react';
import { Download, BookOpen, Calendar, HelpCircle, Star } from 'lucide-react';
import { Book, Language, UiTexts } from '../types';

interface BookCardProps {
  book: Book;
  lang: Language;
  onDownloadStarted?: (bookId: string) => void;
  uiTexts: UiTexts;
}

export default function BookCard({ book, lang, onDownloadStarted, uiTexts }: BookCardProps) {
  const isRtl = lang === 'ar';
  const [downloading, setDownloading] = useState(false);
  const [hasRated, setHasRated] = useState(() => {
    try {
      return localStorage.getItem(`has-rated-${book.id}`) === 'true';
    } catch {
      return false;
    }
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);

  const t = {
    pages: isRtl ? uiTexts.cardPagesAr : uiTexts.cardPagesEn,
    published: isRtl ? uiTexts.cardYearAr : uiTexts.cardYearEn,
    downloads: isRtl ? uiTexts.cardDownloadsAr : uiTexts.cardDownloadsEn,
    directDownload: isRtl ? uiTexts.cardDirectDownloadAr : uiTexts.cardDirectDownloadEn,
    preparing: isRtl ? uiTexts.cardPreparingAr : uiTexts.cardPreparingEn,
    featured: isRtl ? uiTexts.cardFeaturedAr : uiTexts.cardFeaturedEn,
    unnamedBook: isRtl ? uiTexts.cardUnnamedBookAr : uiTexts.cardUnnamedBookEn,
    author: isRtl ? uiTexts.cardAuthorAr : uiTexts.cardAuthorEn
  };

  const title = isRtl ? book.titleAr || book.titleEn : book.titleEn || book.titleAr;
  const description = isRtl ? book.descriptionAr || book.descriptionEn : book.descriptionEn || book.descriptionAr;
  const category = isRtl ? book.categoryAr || book.categoryEn : book.categoryEn || book.categoryAr;
  const author = isRtl ? book.authorAr || book.authorEn : book.authorEn || book.authorAr;

  // Render a majestic premium custom CSS cover when a solid image isn't available
  const hasCustomImageCover = book.coverImage && book.coverImage.startsWith('data:image');
  const coverStyle: React.CSSProperties = hasCustomImageCover
    ? { backgroundImage: `url(${book.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: book.coverImage || 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' };

  const handleDownloadClick = (e: React.MouseEvent) => {
    if (downloading) {
      e.preventDefault();
      return;
    }

    setDownloading(true);
    if (onDownloadStarted) {
      onDownloadStarted(book.id);
    }
    // Restore download button state after a brief delay
    setTimeout(() => {
      setDownloading(false);
    }, 4000);
  };

  const handleRateBook = async (rating: number) => {
    if (hasRated || isRatingSubmitting) return;
    setIsRatingSubmitting(true);
    try {
      const res = await fetch(`/api/books/rate/${book.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating })
      });
      if (res.ok) {
        localStorage.setItem(`has-rated-${book.id}`, 'true');
        setHasRated(true);
        if (onDownloadStarted) {
          onDownloadStarted(book.id); // Re-fetch data on the parent level to update average ratings count and scores
        }
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  return (
    <div 
      id={`book-card-${book.id}`}
      className="group flex flex-col md:flex-row gap-8 rounded-sm border border-white/10 bg-brand-deep p-6 backdrop-blur-sm transition-all duration-300 hover:border-brand-gold/40 hover:bg-brand-ink hover:shadow-2xl"
    >
      
      {/* 1. TACTILE 3D BOOK COVER PORTRAIT */}
      <div className={`relative mx-auto md:mx-0 flex h-72 w-48 shrink-0 select-none overflow-hidden rounded-sm border border-white/10 shadow-2xl transition-all duration-500 group-hover:scale-[1.03]`} style={coverStyle}>
        
        {/* Book Spine Texture Overlay (changes sides based on LTR/RTL reading habits) */}
        <div className={`absolute top-0 bottom-0 w-4 z-25 opacity-75 ${isRtl ? 'right-0 book-spine-right' : 'left-0 book-spine-left'}`} />

        {/* Shading paper texture */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/5 opacity-40 z-10" />

        {/* Render text-based cover layout if not a solid uploaded image cover */}
        {!hasCustomImageCover && (
          <div className={`keep-light absolute inset-0 flex flex-col justify-between p-5 text-center text-white z-20 ${isRtl ? 'font-serif' : 'font-serif'}`}>
            
            {/* Top Border & Small Details */}
            <div className="flex flex-col items-center border-b border-white/20 pb-2">
              <span className="text-[9px] tracking-[0.15em] text-brand-gold uppercase font-bold">
                {category}
              </span>
            </div>

            {/* Middle Book Title */}
            <div className="my-auto">
              <h3 className="text-xl font-light tracking-tight leading-snug text-slate-100 font-serif">
                {title}
              </h3>
              <div className="mx-auto my-2 h-0.5 w-8 bg-brand-gold/40" />
            </div>

            {/* Bottom Author name */}
            <div className="border-t border-white/20 pt-2">
              <p className="text-[9px] font-bold tracking-[0.15em] text-brand-gold/90 uppercase">
                {author || t.author}
              </p>
            </div>

          </div>
        )}

        {/* Featured Tag */}
        {book.isFeatured && (
          <span className={`absolute top-3 z-30 flex items-center rounded-none bg-[#c5a368] px-2.5 py-0.5 text-[9px] font-bold tracking-[0.2em] text-black uppercase shadow-md ${isRtl ? 'left-3' : 'right-3'}`}>
            {t.featured}
          </span>
        )}
      </div>

      {/* 2. BOOK INFORMATION & DOWNLOADS BUTTON */}
      <div className={`flex flex-col justify-between flex-grow ${isRtl ? 'text-right' : 'text-left'}`}>
        
        {/* CRITICAL: Direct PDF download button placed immediately ABOVE the book title/details */}
        <div className="mb-5">
          <a
            id={`direct-download-anchor-${book.id}`}
            href={`/api/books/download/${book.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDownloadClick}
            className={`inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-sm border border-brand-gold/30 text-brand-gold hover:bg-brand-gold hover:text-black bg-transparent px-6 py-3 text-[11px] font-bold uppercase tracking-widest shadow-lg transition-all duration-300 ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <Download className={`h-4 w-4 ${downloading ? 'animate-bounce' : ''}`} />
            <span>
              {downloading ? t.preparing : t.directDownload}
            </span>
          </a>
        </div>

        {/* Title, Category & Bio */}
        <div>
          <div className={`flex flex-wrap items-center gap-3 mb-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="rounded-sm bg-brand-teal/20 border border-brand-teal/30 px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-semibold text-brand-gold">
              {category}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              #{book.publishYear}
            </span>
            {uiTexts.showBookRatingFeature !== false && book.showRating !== false && book.ratingValue !== undefined && (
              <div className={`flex flex-wrap items-center gap-2 text-xs text-brand-gold font-mono ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Star className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" />
                  <span className="font-bold text-slate-200">{book.ratingValue.toFixed(1)}</span>
                  <span className="text-slate-500 text-[10px]">
                    ({book.ratingCount || 0} {isRtl ? 'تقييم' : 'ratings'})
                  </span>
                </div>
                
                <span className="text-slate-700 select-none">|</span>
                
                {hasRated ? (
                  <span className="text-[10px] text-emerald-400 font-sans font-medium">
                    {isRtl ? 'تم التقييم ✓' : 'Rated ✓'}
                  </span>
                ) : (
                  <div className={`flex items-center gap-0.5 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`} title={isRtl ? 'انقر لتقييم الرواية' : 'Click to rate this book'}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRateBook(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        disabled={isRatingSubmitting}
                        className="p-0.5 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                      >
                        <Star 
                          className={`h-3 w-3 transition-colors ${
                            (hoverRating !== null ? star <= hoverRating : false)
                              ? 'fill-brand-gold text-brand-gold'
                              : 'text-slate-600 hover:text-brand-gold'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <h3 className="mb-3 font-serif text-2xl font-light text-white tracking-wide leading-tight group-hover:text-brand-gold transition-colors duration-200">
            {title || t.unnamedBook}
          </h3>

          <p className="mb-6 text-sm leading-relaxed text-slate-400 font-light line-clamp-4">
            {description}
          </p>
        </div>

        {/* Metadata Details & Absolute Direct Download trigger */}
        <div>
          
          {/* Metadata Row */}
          <div className={`mb-2 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-4 text-[11px] text-slate-400 font-mono ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-brand-gold/70" />
              <span>{book.pages} {t.pages}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-brand-gold/70" />
              <span>{t.published}: {book.publishYear}</span>
            </div>
            {book.showDownloads !== false && uiTexts.hideDownloadStats !== true && (
              <div className="flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5 text-brand-gold/70" />
                <span>{book.downloadCount} {t.downloads}</span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
