import React, { useEffect, useRef } from 'react';
import { ChevronDown, Feather, Sparkles } from 'lucide-react';
import { Language, UiTexts, AuthorBio } from '../types';

interface HeroProps {
  lang: Language;
  onExploreClick: () => void;
  uiTexts: UiTexts;
  author?: AuthorBio | null;
  onContactClick?: () => void;
}

export default function Hero({ lang, onExploreClick, uiTexts, author, onContactClick }: HeroProps) {
  const isRtl = lang === 'ar';
  const videoRef = useRef<HTMLVideoElement>(null);

  const bgType = uiTexts.topCustomBgType || (uiTexts.topCustomVideoUrl ? 'video' : 'image');
  const DEFAULT_ANIMATED_VIDEO = 'https://assets.mixkit.co/videos/preview/mixkit-gold-particles-floating-in-the-dark-41527-large.mp4';
  const activeVideoUrl = uiTexts.topCustomVideoUrl || ((bgType === 'video' || bgType === 'animated_video') ? DEFAULT_ANIMATED_VIDEO : '');
  const isVideoMode = (bgType === 'video' || bgType === 'animated_video') && Boolean(activeVideoUrl);

  useEffect(() => {
    if (videoRef.current) {
      if (uiTexts.topCustomVideoSpeed) {
        videoRef.current.playbackRate = uiTexts.topCustomVideoSpeed;
      }
      videoRef.current.muted = uiTexts.topCustomVideoMuted !== false;
      videoRef.current.play().catch(() => {});
    }
  }, [uiTexts.topCustomVideoSpeed, activeVideoUrl, bgType, uiTexts.topCustomVideoMuted, uiTexts.topCustomVideoLoop]);

  const content = {
    badge: isRtl ? uiTexts.heroBadgeAr : uiTexts.heroBadgeEn,
    title: isRtl ? uiTexts.heroTitleAr : uiTexts.heroTitleEn,
    subtitle: isRtl ? uiTexts.heroSubtitleAr : uiTexts.heroSubtitleEn,
    description: isRtl ? uiTexts.heroDescriptionAr : uiTexts.heroDescriptionEn,
    cta: isRtl ? uiTexts.heroCtaAr : uiTexts.heroCtaEn,
    secondaryCta: isRtl ? uiTexts.heroSecondaryCtaAr : uiTexts.heroSecondaryCtaEn,
    philosophyQuote: isRtl ? uiTexts.heroPhilosophyQuoteAr : uiTexts.heroPhilosophyQuoteEn,
  };

  const opacityStyle = (uiTexts.topCustomImageOpacity !== undefined ? uiTexts.topCustomImageOpacity : 80) / 100;
  const filterStyle = `blur(${uiTexts.topCustomImageBlur || 0}px) contrast(${uiTexts.topCustomImageContrast !== undefined ? uiTexts.topCustomImageContrast : 100}%) brightness(${uiTexts.topCustomImageBrightness !== undefined ? uiTexts.topCustomImageBrightness : 100}%)`;

  return (
    <section className="relative flex min-h-[85vh] w-full flex-col items-center justify-center overflow-hidden border-b border-white/10 bg-brand-ink px-6 py-20 text-center">
      
      {/* Immersive Background Lighting Beam or Custom Background (Image / Video / Animated Video) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {isVideoMode ? (
          <>
            <video
              ref={videoRef}
              key={`video-bg-${activeVideoUrl}`}
              src={activeVideoUrl}
              autoPlay
              loop={uiTexts.topCustomVideoLoop !== false}
              muted={uiTexts.topCustomVideoMuted !== false}
              playsInline
              preload={uiTexts.topCustomVideoCompressed !== false ? "metadata" : "auto"}
              poster={uiTexts.topCustomImageUrl || undefined}
              className="absolute inset-0 h-full w-full object-cover pointer-events-none"
              style={{
                opacity: opacityStyle,
                filter: filterStyle,
                willChange: uiTexts.topCustomVideoCompressed !== false ? 'transform' : 'auto'
              }}
            />
            {/* Balanced gradient overlay to protect typography contrast without blacking out the video */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-ink/50 via-brand-ink/30 to-brand-ink/85 pointer-events-none" />
          </>
        ) : uiTexts.topCustomImageUrl ? (
          <>
            <img
              src={uiTexts.topCustomImageUrl}
              alt="Hero Background"
              className="absolute inset-0 h-full w-full object-cover pointer-events-none"
              style={{
                opacity: opacityStyle,
                filter: filterStyle,
              }}
              referrerPolicy="no-referrer"
            />
            {/* Balanced gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-ink/50 via-brand-ink/30 to-brand-ink/85 pointer-events-none" />
          </>
        ) : (
          <div className="absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/5 blur-[120px]" />
        )}
        {/* Optional background grid overlay (disabled by default for clean presentation) */}
        {uiTexts.topCustomShowGridPattern && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />
        )}
      </div>

      <div className="relative z-10 max-w-4xl animate-fade-in flex flex-col items-center">
        
        {/* Literary Badge */}
        {content.badge ? (
          <div className={`mb-6 flex items-center gap-2 rounded-sm border border-brand-gold/30 bg-brand-deep/80 px-4 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-brand-gold uppercase ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <Sparkles className="h-3 w-3 text-brand-gold" />
            <span>{content.badge}</span>
          </div>
        ) : null}

        {/* Masterpiece Main Title */}
        <h1 
          className="mb-4 font-serif text-5xl font-light tracking-wide text-white sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ fontSize: uiTexts.heroTitleFontSize ? `${uiTexts.heroTitleFontSize / 100}em` : undefined }}
        >
          {content.title}
        </h1>

        {/* Dynamic Subtitle */}
        <h2 className="mb-6 font-serif text-lg font-light italic text-[#c5a368] sm:text-xl md:text-2xl max-w-3xl leading-relaxed">
          {content.subtitle}
        </h2>

        {/* Description Paragraph */}
        {content.description ? (
          <p className="mb-10 text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg max-w-2xl font-light font-sans">
            {content.description}
          </p>
        ) : null}

        {/* Interlocking CTAs */}
        <div className={`mb-16 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-2xl ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
          
          <button
            id="hero-primary-cta"
            onClick={onExploreClick}
            className="group flex items-center justify-center gap-2 rounded-sm bg-brand-gold px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-black shadow-2xl transition-all duration-300 hover:brightness-110"
          >
            <Feather className="h-3.5 w-3.5" />
            <span>{content.cta}</span>
          </button>

          <button
            id="hero-secondary-cta"
            onClick={() => {
              const el = document.getElementById('author-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center justify-center gap-2 rounded-sm border border-white/20 bg-transparent px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-white/5"
          >
            <span>{content.secondaryCta}</span>
          </button>

          {author?.contactFeature?.enableFeature && author?.contactFeature?.showInHero && (
            <button
              id="hero-contact-cta"
              onClick={onContactClick}
              className="flex items-center justify-center gap-2 rounded-sm border border-brand-gold/40 bg-brand-gold/10 px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-brand-gold transition-all duration-300 hover:bg-brand-gold/20"
            >
              <span>{isRtl ? (author.contactFeature.titleAr || 'اتصل بالكاتب') : (author.contactFeature.titleEn || 'Contact the Author')}</span>
            </button>
          )}
        </div>

        {/* Interactive philosophy block quote */}
        {content.philosophyQuote ? (
          <div className="relative max-w-xl rounded-sm border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="font-serif text-xs md:text-sm italic leading-relaxed text-slate-400 font-light">
              {content.philosophyQuote}
            </p>
          </div>
        ) : null}

      </div>

      {/* Floating Animated Scroll Down Hint */}
      <div className="absolute bottom-8 z-10 animate-bounce">
        <button
          id="hero-scroll-indicator"
          onClick={onExploreClick}
          className="rounded-sm border border-white/10 bg-brand-ink p-2 text-slate-400 hover:border-brand-gold hover:text-brand-gold transition-colors"
          aria-label="Scroll to books"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

    </section>
  );
}
