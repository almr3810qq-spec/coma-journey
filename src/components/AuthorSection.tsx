import React from 'react';
import { 
  Mail, ArrowRight, ArrowLeft, Twitter, Instagram, Facebook, Award, PenTool, Lightbulb, 
  Video, Phone, Globe, X, Linkedin, Youtube, Send, MessageSquare, AtSign, Disc, Smile, Twitch, Github
} from 'lucide-react';
import { AuthorBio, Language, UiTexts } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AuthorSectionProps {
  bio: AuthorBio;
  lang: Language;
  uiTexts: UiTexts;
  showContactModal?: boolean;
  setShowContactModal?: (val: boolean) => void;
}

export default function AuthorSection({ 
  bio, 
  lang, 
  uiTexts,
  showContactModal: propShowContactModal,
  setShowContactModal: propSetShowContactModal
}: AuthorSectionProps) {
  const isRtl = lang === 'ar';

  const t = {
    sectionTitleEn: uiTexts.sectionTitleEn,
    sectionTitleAr: uiTexts.sectionTitleAr,
    philosophyEn: uiTexts.philosophyEn,
    philosophyAr: uiTexts.philosophyAr,
    philosophyBodyEn: uiTexts.philosophyBodyEn,
    philosophyBodyAr: uiTexts.philosophyBodyAr,
    contact: isRtl ? uiTexts.authorContactAr : uiTexts.authorContactEn,
    accoladesTitle: isRtl ? uiTexts.accoladesTitleAr : uiTexts.accoladesTitleEn,
    award1: isRtl ? uiTexts.award1Ar : uiTexts.award1En,
    award2: isRtl ? uiTexts.award2Ar : uiTexts.award2En,
    award3: isRtl ? uiTexts.award3Ar : uiTexts.award3En
  };

  const name = isRtl ? bio.nameAr : bio.nameEn;
  const title = isRtl ? bio.titleAr : bio.titleEn;
  const bioText = isRtl ? bio.bioAr : bio.bioEn;
  const quote = isRtl ? bio.quoteAr : bio.quoteEn;

  // Set up the images array for the slideshow
  const images = bio.avatars && bio.avatars.length > 0
    ? bio.avatars
    : bio.avatar ? [bio.avatar] : [];

  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [showAccoladesMenu, setShowAccoladesMenu] = React.useState(false);
  const [localShowContactModal, setLocalShowContactModal] = React.useState(false);
  
  const showContactModal = propShowContactModal !== undefined ? propShowContactModal : localShowContactModal;
  const setShowContactModal = propSetShowContactModal !== undefined ? propSetShowContactModal : setLocalShowContactModal;

  const boxSizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[bio.contactFeature?.boxSize || 'xl'] || 'max-w-xl';

  const getPlatformDetails = (platformName: string) => {
    switch (platformName.toLowerCase()) {
      case 'facebook':
        return {
          icon: <Facebook className="h-4 w-4" />,
          bgColor: 'bg-blue-600/10',
          textColor: 'text-blue-400',
          hoverColor: 'hover:border-blue-500/30 hover:bg-blue-600/5',
          labelEn: 'Facebook',
          labelAr: 'فيسبوك'
        };
      case 'instagram':
        return {
          icon: <Instagram className="h-4 w-4" />,
          bgColor: 'bg-pink-500/10',
          textColor: 'text-pink-400',
          hoverColor: 'hover:border-pink-500/30 hover:bg-pink-500/5',
          labelEn: 'Instagram',
          labelAr: 'إنستغرام'
        };
      case 'threads':
        return {
          icon: <AtSign className="h-4 w-4" />,
          bgColor: 'bg-zinc-500/10',
          textColor: 'text-zinc-400',
          hoverColor: 'hover:border-zinc-500/30 hover:bg-zinc-500/5',
          labelEn: 'Threads',
          labelAr: 'ثريدز'
        };
      case 'tiktok':
        return {
          icon: (
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.94-1.74-.22-.22-.4-.47-.58-.73v6.56c.04 4.11-2.68 8.04-6.85 8.92-4.16.94-8.74-1.44-10-5.51-1.39-4.28 1.02-9.28 5.37-10.28 1.44-.34 2.97-.16 4.31.5v4.3c-1.09-.53-2.39-.63-3.5-.11-2.11.95-3.11 3.65-2.06 5.78 1.03 2.19 3.82 3.12 5.92 1.94 1.25-.68 1.95-2.02 1.91-3.44V.02z" />
            </svg>
          ),
          bgColor: 'bg-purple-500/10',
          textColor: 'text-purple-400',
          hoverColor: 'hover:border-purple-500/30 hover:bg-purple-500/5',
          labelEn: 'TikTok',
          labelAr: 'تيك توك'
        };
      case 'youtube':
        return {
          icon: <Youtube className="h-4 w-4" />,
          bgColor: 'bg-red-500/10',
          textColor: 'text-red-400',
          hoverColor: 'hover:border-red-500/30 hover:bg-red-500/5',
          labelEn: 'YouTube',
          labelAr: 'يوتيوب'
        };
      case 'twitter':
        return {
          icon: <Twitter className="h-4 w-4" />,
          bgColor: 'bg-sky-500/10',
          textColor: 'text-sky-400',
          hoverColor: 'hover:border-sky-500/30 hover:bg-sky-500/5',
          labelEn: 'X (Twitter)',
          labelAr: 'إكس (تويتر)'
        };
      case 'linkedin':
        return {
          icon: <Linkedin className="h-4 w-4" />,
          bgColor: 'bg-blue-700/10',
          textColor: 'text-blue-400',
          hoverColor: 'hover:border-blue-700/30 hover:bg-blue-700/5',
          labelEn: 'LinkedIn',
          labelAr: 'لينكد إن'
        };
      case 'pinterest':
        return {
          icon: (
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.63 11.16-.09-.94-.18-2.39.04-3.41.2-.93 1.28-5.42 1.28-5.42s-.33-.66-.33-1.62c0-1.52.88-2.66 1.99-2.66.94 0 1.39.71 1.39 1.56 0 .95-.6 2.37-.92 3.69-.26 1.09.55 1.98 1.62 1.98 1.95 0 3.44-2.06 3.44-5.03 0-2.63-1.89-4.47-4.59-4.47-3.13 0-4.96 2.35-4.96 4.77 0 .95.36 1.96.82 2.51.09.11.1.21.07.33-.08.33-.26 1.05-.29 1.19-.05.18-.16.22-.36.13-1.34-.62-2.18-2.58-2.18-4.16 0-3.39 2.46-6.5 7.1-6.5 3.73 0 6.62 2.66 6.62 6.2 0 3.71-2.34 6.7-5.58 6.7-1.09 0-2.11-.57-2.46-1.24l-.67 2.56c-.24.93-.9 2.1-1.35 2.82C10.73 23.82 11.36 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
            </svg>
          ),
          bgColor: 'bg-red-700/10',
          textColor: 'text-red-500',
          hoverColor: 'hover:border-red-700/30 hover:bg-red-700/5',
          labelEn: 'Pinterest',
          labelAr: 'بينتيريست'
        };
      case 'snapchat':
        return {
          icon: <Smile className="h-4 w-4" />,
          bgColor: 'bg-yellow-500/10',
          textColor: 'text-yellow-400',
          hoverColor: 'hover:border-yellow-500/30 hover:bg-yellow-500/5',
          labelEn: 'Snapchat',
          labelAr: 'سناب شات'
        };
      case 'whatsapp':
        return {
          icon: <MessageSquare className="h-4 w-4" />,
          bgColor: 'bg-emerald-600/10',
          textColor: 'text-emerald-400',
          hoverColor: 'hover:border-emerald-600/30 hover:bg-emerald-600/5',
          labelEn: 'WhatsApp',
          labelAr: 'واتساب'
        };
      case 'telegram':
        return {
          icon: <Send className="h-4 w-4" />,
          bgColor: 'bg-sky-600/10',
          textColor: 'text-sky-400',
          hoverColor: 'hover:border-sky-600/30 hover:bg-sky-600/5',
          labelEn: 'Telegram',
          labelAr: 'تليغرام'
        };
      case 'discord':
        return {
          icon: <Disc className="h-4 w-4" />,
          bgColor: 'bg-indigo-600/10',
          textColor: 'text-indigo-400',
          hoverColor: 'hover:border-indigo-600/30 hover:bg-indigo-600/5',
          labelEn: 'Discord',
          labelAr: 'ديسكورد'
        };
      case 'reddit':
        return {
          icon: (
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.23-1.72l1.09-3.43 3.58.77c.11.85.84 1.5 1.73 1.5 1.1 0 2-.9 2-2s-.9-2-2-2c-.81 0-1.49.49-1.8 1.18l-3.99-.86c-.35-.08-.7.14-.8.49L9.25 9.1c-2.43.04-4.68.68-6.34 1.71-.56-.76-1.46-1.24-2.42-1.24-1.65 0-3 1.35-3 3 0 1.2 1.12 2.19 2.5 2.55-.06.28-.1.57-.1.86 0 4.14 4.8 7.5 10.75 7.5s10.75-3.36 10.75-7.5c0-.29-.04-.58-.11-.86 1.38-.36 2.5-1.35 2.5-2.55zm-19 1c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm12 3.5c-1.75 1.75-5.5 1.75-7.25 0-.29-.29-.29-.77 0-1.06.29-.29.77-.29 1.06 0 1.17 1.17 3.96 1.17 5.13 0 .29-.29.77-.29 1.06 0 .29.29.29.77 0 1.06zm-1.5-1.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
          ),
          bgColor: 'bg-orange-600/10',
          textColor: 'text-orange-400',
          hoverColor: 'hover:border-orange-600/30 hover:bg-orange-600/5',
          labelEn: 'Reddit',
          labelAr: 'ريديت'
        };
      case 'twitch':
        return {
          icon: <Twitch className="h-4 w-4" />,
          bgColor: 'bg-violet-600/10',
          textColor: 'text-violet-400',
          hoverColor: 'hover:border-violet-600/30 hover:bg-violet-600/5',
          labelEn: 'Twitch',
          labelAr: 'تويتش'
        };
      case 'github':
        return {
          icon: <Github className="h-4 w-4" />,
          bgColor: 'bg-zinc-700/10',
          textColor: 'text-zinc-200',
          hoverColor: 'hover:border-zinc-700/30 hover:bg-zinc-700/5',
          labelEn: 'GitHub',
          labelAr: 'جيتهاب'
        };
      case 'phone':
        return {
          icon: <Phone className="h-4 w-4" />,
          bgColor: 'bg-blue-500/10',
          textColor: 'text-blue-400',
          hoverColor: 'hover:border-blue-500/30 hover:bg-blue-600/5',
          labelEn: 'Phone',
          labelAr: 'الهاتف'
        };
      case 'email':
        return {
          icon: <Mail className="h-4 w-4" />,
          bgColor: 'bg-emerald-500/10',
          textColor: 'text-emerald-400',
          hoverColor: 'hover:border-emerald-500/30 hover:bg-emerald-500/5',
          labelEn: 'Email',
          labelAr: 'البريد الإلكتروني'
        };
      case 'website':
        return {
          icon: <Globe className="h-4 w-4" />,
          bgColor: 'bg-amber-500/10',
          textColor: 'text-amber-400',
          hoverColor: 'hover:border-amber-500/30 hover:bg-amber-500/5',
          labelEn: 'Website',
          labelAr: 'الموقع الإلكتروني'
        };
      default:
        return {
          icon: <Globe className="h-4 w-4" />,
          bgColor: 'bg-slate-500/10',
          textColor: 'text-slate-300',
          hoverColor: 'hover:border-slate-500/30 hover:bg-slate-500/5',
          labelEn: 'Other',
          labelAr: 'منصة أخرى'
        };
    }
  };

  React.useEffect(() => {
    if (images.length <= 1 || bio.showSlideshow === false) return;
    const intervalTime = (bio.slideshowSpeed || 4) * 1000;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [images.length, bio.showSlideshow, bio.slideshowSpeed]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % images.length);
  };

  const hasVideo = !!bio.videoUrl;
  const leftColSpan = hasVideo ? 'lg:col-span-6' : 'lg:col-span-5';
  const rightColSpan = hasVideo ? 'lg:col-span-6' : 'lg:col-span-7';

  const renderVideo = (url: string) => {
    if (!url) return null;
    
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    const isVimeo = url.includes('vimeo.com');
    
    if (isYoutube) {
      let embedUrl = url;
      if (url.includes('watch?v=')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      return (
        <iframe
          src={embedUrl}
          title="Author Video"
          className="w-full h-full object-cover"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    
    if (isVimeo) {
      let embedUrl = url;
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match && match[1]) {
        embedUrl = `https://player.vimeo.com/video/${match[1]}`;
      }
      return (
        <iframe
          src={embedUrl}
          title="Author Video"
          className="w-full h-full object-cover"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }
    
    return (
      <video
        src={url}
        controls
        preload="metadata"
        poster={images[0] || ''}
        className="w-full h-full object-cover"
      />
    );
  };

  return (
    <section id="author-section" className="relative w-full border-t border-white/10 bg-brand-ink px-6 py-24 scroll-mt-12">
      
      {/* Visual background lights */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-brand-gold/5 blur-[100px]" />
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-brand-gold/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        
        {/* Section Heading */}
        <div className="mb-16 text-center">
          <h2 className="font-serif text-3xl font-bold text-white tracking-widest md:text-4xl uppercase">
            {isRtl ? t.sectionTitleAr : t.sectionTitleEn}
          </h2>
          <div className="mx-auto mt-4 h-[1px] w-16 bg-brand-gold" />
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-start ${isRtl ? 'lg:flex-row-reverse' : ''}`}>
          
          {/* LEFT: Author Silhouette Frame & Video (Takes 5 or 6 cols depending on video) */}
          <div className={`${leftColSpan} flex flex-col items-center`}>
            
            <div className={`flex flex-col ${hasVideo ? 'md:flex-row lg:flex-col xl:flex-row' : ''} gap-6 justify-center items-center w-full`}>
              
              {/* Image Frame with Automatic Slideshow */}
              <div className="relative group overflow-hidden rounded-sm border border-white/10 bg-brand-deep p-4 shadow-2xl transition-all duration-500 hover:border-brand-gold shrink-0">
                <div className="relative h-96 w-72 overflow-hidden rounded-sm bg-[#0c0c0c] flex items-center justify-center">
                  
                  {images.length > 0 ? (
                    <div className="relative h-full w-full">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={currentIdx}
                          src={images[currentIdx]}
                          alt={name}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          style={{
                            opacity: (bio.imageOpacity ?? 100) / 100,
                            filter: `blur(${bio.imageBlur ?? 0}px) contrast(${bio.imageContrast ?? 100}%) brightness(${bio.imageBrightness ?? 100}%)`,
                          }}
                        />
                      </AnimatePresence>

                      {/* Manual Navigation Controls */}
                      {images.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={isRtl ? handleNext : handlePrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 border border-white/10 p-2 text-white hover:bg-brand-gold hover:text-black transition-all cursor-pointer z-20"
                            aria-label="Previous Slide"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={isRtl ? handlePrev : handleNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 border border-white/10 p-2 text-white hover:bg-brand-gold hover:text-black transition-all cursor-pointer z-20"
                            aria-label="Next Slide"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>

                          {/* Dot Indicators */}
                          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/40 px-2.5 py-1 rounded-full">
                            {images.map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setCurrentIdx(i)}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                  i === currentIdx ? 'w-4 bg-brand-gold' : 'w-1.5 bg-white/40 hover:bg-white'
                                }`}
                                aria-label={`Go to slide ${i + 1}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="absolute bottom-12 h-44 w-44 rounded-full bg-brand-gold/5 blur-2xl group-hover:bg-brand-gold/10 transition-colors duration-300" />
                      <svg className="h-64 w-64 text-slate-800 opacity-60 transition-transform duration-500 group-hover:scale-105" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z"/>
                      </svg>
                    </>
                  )}

                  {/* Overlaid Literary Graphics */}
                  <div className="keep-light absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-5 text-center z-10">
                    <p className="font-serif text-sm font-semibold tracking-wider text-brand-gold leading-none">
                      {name}
                    </p>
                    <p className="mt-1.5 text-[9px] text-slate-400 font-mono tracking-widest uppercase">
                      {title}
                    </p>
                  </div>

                  {/* Feather Floating Indicator */}
                  <div className="absolute top-4 right-4 rounded-sm bg-black/60 border border-white/10 p-2 text-brand-gold z-10">
                    <PenTool className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Video Player Card (Rendered if URL exists) */}
              {hasVideo && (
                <div className="relative group overflow-hidden rounded-sm border border-white/10 bg-brand-deep p-4 shadow-2xl transition-all duration-500 hover:border-brand-gold shrink-0">
                  <div className="relative h-96 w-72 overflow-hidden rounded-sm bg-[#0c0c0c] flex items-center justify-center">
                    
                    {renderVideo(bio.videoUrl!)}

                    {/* Overlaid Video Greeting Info */}
                    <div className="keep-light absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-5 text-center pointer-events-none z-10">
                      <p className="font-serif text-sm font-semibold tracking-wider text-brand-gold leading-none">
                        {isRtl ? 'عرض مرئي للكاتب' : 'Video Greeting'}
                      </p>
                      <p className="mt-1.5 text-[9px] text-slate-400 font-mono tracking-widest uppercase">
                        {isRtl ? 'بصوت ورؤية الكاتب' : 'In the voice of the Author'}
                      </p>
                    </div>

                    {/* Video Camera Floating Indicator */}
                    <div className="absolute top-4 right-4 rounded-sm bg-black/60 border border-white/10 p-2 text-brand-gold z-10 pointer-events-none">
                      <Video className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Social Channels Link Row */}
            {bio.showSocialLinks !== false && (
              <div className="mt-6 flex items-center gap-4">
                <a 
                  href={bio.socialLinks.twitter} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="rounded-sm border border-white/10 bg-white/5 p-2.5 text-slate-400 transition-colors hover:border-brand-gold hover:text-brand-gold"
                  aria-label="Twitter Account"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a 
                  href={bio.socialLinks.instagram} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="rounded-sm border border-white/10 bg-white/5 p-2.5 text-slate-400 transition-colors hover:border-brand-gold hover:text-brand-gold"
                  aria-label="Instagram Account"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a 
                  href={bio.socialLinks.facebook} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="rounded-sm border border-white/10 bg-white/5 p-2.5 text-slate-400 transition-colors hover:border-brand-gold hover:text-brand-gold"
                  aria-label="Facebook Account"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a 
                  href={`mailto:${bio.socialLinks.email}`} 
                  className="rounded-sm border border-white/10 bg-white/5 p-2.5 text-slate-400 transition-colors hover:border-brand-gold hover:text-brand-gold"
                  aria-label="Send Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>

          {/* RIGHT: Biographical & Philosophical Details (Takes 7 or 6 cols depending on video) */}
          <div className={`${rightColSpan} flex flex-col justify-center ${isRtl ? 'text-right' : 'text-left'}`}>
            
            {/* Author Name Display */}
            <h3 className="font-serif text-2xl font-bold text-brand-gold leading-tight md:text-3xl">
              {name}
            </h3>
            <p className="mt-2 text-xs font-mono tracking-widest text-slate-400 uppercase font-bold">
              {title}
            </p>

            {/* Main Bio Text */}
            <div className="mt-6 border-l border-brand-gold/20 pl-4 text-sm md:text-base text-slate-300 leading-relaxed font-bold space-y-4">
              <p>{bioText}</p>
            </div>

            {/* Philosophy Accent Box */}
            <div className="mt-8 rounded-sm border border-white/10 bg-white/5 p-6">
              <h4 className="flex items-center gap-2 font-serif text-sm font-semibold text-brand-gold mb-2">
                <Lightbulb className="h-4 w-4 text-brand-gold" />
                <span>{isRtl ? t.philosophyAr : t.philosophyEn}</span>
              </h4>
              <p className="text-xs leading-relaxed text-slate-400 font-bold font-sans">
                {isRtl ? t.philosophyBodyAr : t.philosophyBodyEn}
              </p>
            </div>

            {/* Accolades Section */}
            <div className="mt-8 relative">
              <h4 
                onClick={() => {
                  if (bio.contactFeature?.enableFeature) {
                    setShowAccoladesMenu(!showAccoladesMenu);
                  }
                }}
                className={`flex items-center gap-2 font-serif text-sm font-semibold text-white mb-4 select-none ${bio.contactFeature?.enableFeature ? 'cursor-pointer hover:text-brand-gold/90 transition-colors group' : ''}`}
              >
                <Award className={`h-4 w-4 text-brand-gold transition-transform duration-300 ${bio.contactFeature?.enableFeature ? 'group-hover:scale-110' : ''}`} />
                <span>{t.accoladesTitle}</span>
                {bio.contactFeature?.enableFeature && (
                  <span className="text-[10px] text-brand-gold font-mono font-light bg-brand-gold/10 px-1.5 py-0.5 rounded transition-all group-hover:bg-brand-gold/20">
                    {showAccoladesMenu ? '▲' : '▼'}
                  </span>
                )}
              </h4>

              <AnimatePresence>
                {showAccoladesMenu && bio.contactFeature?.enableFeature && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute z-30 mt-1 w-60 rounded-md border border-brand-gold/30 bg-brand-deep/95 p-1.5 shadow-2xl backdrop-blur-md ${isRtl ? 'right-0' : 'left-0'}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowContactModal(true);
                        setShowAccoladesMenu(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-xs text-slate-200 hover:bg-brand-gold hover:text-black transition-all cursor-pointer font-medium ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                    >
                      <Mail className="h-4 w-4 shrink-0" />
                      <span>{isRtl ? (bio.contactFeature?.titleAr || 'اتصل بالكاتب') : (bio.contactFeature?.titleEn || 'Contact the Author')}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <ul className={`space-y-2 text-xs md:text-sm text-slate-400 font-bold ${isRtl ? 'list-none' : 'list-none'}`}>
                <li className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span className="h-1 w-1 shrink-0 bg-brand-gold" />
                  <span>{t.award1}</span>
                </li>
                <li className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span className="h-1 w-1 shrink-0 bg-brand-gold" />
                  <span>{t.award2}</span>
                </li>
                <li className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span className="h-1 w-1 shrink-0 bg-brand-gold" />
                  <span>{t.award3}</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Poetic Quote Highlight */}
        {quote && (
          <div className="mt-20 border-t border-white/10 pt-10 text-center">
            <blockquote className="mx-auto max-w-3xl font-serif text-lg md:text-xl lg:text-2xl font-bold italic leading-relaxed text-white">
              {quote}
            </blockquote>
            <p className="mt-4 text-[10px] tracking-[0.4em] text-brand-gold font-mono uppercase font-bold">
              — {name}
            </p>
          </div>
        )}

        {/* Contact the Author Modal Overlay */}
        <AnimatePresence>
          {showContactModal && bio.contactFeature?.enableFeature && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowContactModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className={`relative w-full ${boxSizeClass} rounded-xl border border-white/10 bg-[#0c0c0c] p-6 md:p-8 shadow-2xl z-10 overflow-hidden group hover:border-brand-gold/30 transition-all duration-500 text-center`}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} rounded-full bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer z-20`}
                  aria-label="Close Contact Modal"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Subtle glow background */}
                <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-brand-gold/5 blur-xl pointer-events-none" />

                <div className="relative z-10">
                  <h4 className="font-serif text-xl md:text-2xl font-medium text-brand-gold tracking-wide">
                    {isRtl ? bio.contactFeature.titleAr : bio.contactFeature.titleEn}
                  </h4>
                  
                  {(isRtl ? bio.contactFeature.descriptionAr : bio.contactFeature.descriptionEn) && (
                    <p className="mt-3 text-xs md:text-sm text-slate-400 font-light leading-relaxed">
                      {isRtl ? bio.contactFeature.descriptionAr : bio.contactFeature.descriptionEn}
                    </p>
                  )}

                  <div className={`mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                    {/* Phone number */}
                    {bio.contactFeature.phone?.visible && bio.contactFeature.phone?.value && (
                      <a 
                        href={`tel:${bio.contactFeature.phone.value}`}
                        className={`flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.01] px-4 py-3 hover:border-brand-gold/30 hover:bg-white/[0.03] transition-all group/item cursor-pointer ${isRtl ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="rounded-full bg-blue-500/10 p-2 text-blue-400 transition-colors group-hover/item:bg-blue-500/20 group-hover/item:text-brand-gold">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div className="overflow-hidden">
                          <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">{isRtl ? 'الهاتف' : 'Phone'}</span>
                          <span className="block text-xs font-semibold text-white group-hover/item:text-brand-gold transition-colors font-sans truncate">
                            {bio.contactFeature.phone.value}
                          </span>
                        </div>
                      </a>
                    )}

                    {/* Email address */}
                    {bio.contactFeature.email?.visible && bio.contactFeature.email?.value && (
                      <a 
                        href={`mailto:${bio.contactFeature.email.value}`}
                        className={`flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.01] px-4 py-3 hover:border-brand-gold/30 hover:bg-white/[0.03] transition-all group/item cursor-pointer ${isRtl ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-400 transition-colors group-hover/item:bg-emerald-500/20 group-hover/item:text-brand-gold">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="overflow-hidden">
                          <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">{isRtl ? 'البريد الإلكتروني' : 'Email'}</span>
                          <span className="block text-xs font-semibold text-white group-hover/item:text-brand-gold transition-colors font-sans truncate">
                            {bio.contactFeature.email.value}
                          </span>
                        </div>
                      </a>
                    )}

                    {/* Instagram */}
                    {bio.contactFeature.instagram?.visible && bio.contactFeature.instagram?.value && (
                      <a 
                        href={bio.contactFeature.instagram.value} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.01] px-4 py-3 hover:border-brand-gold/30 hover:bg-white/[0.03] transition-all group/item cursor-pointer ${isRtl ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="rounded-full bg-pink-500/10 p-2 text-pink-400 transition-colors group-hover/item:bg-pink-500/20 group-hover/item:text-brand-gold">
                          <Instagram className="h-4 w-4" />
                        </div>
                        <div className="overflow-hidden">
                          <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">Instagram</span>
                          <span className="block text-xs font-semibold text-white group-hover/item:text-brand-gold transition-colors font-sans truncate">
                            {bio.contactFeature.instagram.value.replace(/^https?:\/\/(www\.)?/, '')}
                          </span>
                        </div>
                      </a>
                    )}

                    {/* Facebook */}
                    {bio.contactFeature.facebook?.visible && bio.contactFeature.facebook?.value && (
                      <a 
                        href={bio.contactFeature.facebook.value} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.01] px-4 py-3 hover:border-brand-gold/30 hover:bg-white/[0.03] transition-all group/item cursor-pointer ${isRtl ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="rounded-full bg-blue-600/10 p-2 text-blue-400 transition-colors group-hover/item:bg-blue-600/20 group-hover/item:text-brand-gold">
                          <Facebook className="h-4 w-4" />
                        </div>
                        <div className="overflow-hidden">
                          <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">Facebook</span>
                          <span className="block text-xs font-semibold text-white group-hover/item:text-brand-gold transition-colors font-sans truncate">
                            {bio.contactFeature.facebook.value.replace(/^https?:\/\/(www\.)?/, '')}
                          </span>
                        </div>
                      </a>
                    )}

                    {/* TikTok */}
                    {bio.contactFeature.tiktok?.visible && bio.contactFeature.tiktok?.value && (
                      <a 
                        href={bio.contactFeature.tiktok.value} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.01] px-4 py-3 hover:border-brand-gold/30 hover:bg-white/[0.03] transition-all group/item cursor-pointer ${isRtl ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="rounded-full bg-purple-500/10 p-2 text-purple-400 transition-colors group-hover/item:bg-purple-500/20 group-hover/item:text-brand-gold">
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.94-1.74-.22-.22-.4-.47-.58-.73v6.56c.04 4.11-2.68 8.04-6.85 8.92-4.16.94-8.74-1.44-10-5.51-1.39-4.28 1.02-9.28 5.37-10.28 1.44-.34 2.97-.16 4.31.5v4.3c-1.09-.53-2.39-.63-3.5-.11-2.11.95-3.11 3.65-2.06 5.78 1.03 2.19 3.82 3.12 5.92 1.94 1.25-.68 1.95-2.02 1.91-3.44V.02z" />
                          </svg>
                        </div>
                        <div className="overflow-hidden">
                          <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">TikTok</span>
                          <span className="block text-xs font-semibold text-white group-hover/item:text-brand-gold transition-colors font-sans truncate">
                            {bio.contactFeature.tiktok.value.replace(/^https?:\/\/(www\.)?/, '')}
                          </span>
                        </div>
                      </a>
                    )}

                    {/* Other platform */}
                    {bio.contactFeature.other?.visible && bio.contactFeature.other?.value && (
                      <a 
                        href={bio.contactFeature.other.value} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.01] px-4 py-3 hover:border-brand-gold/30 hover:bg-white/[0.03] transition-all group/item cursor-pointer ${isRtl ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="rounded-full bg-amber-500/10 p-2 text-amber-400 transition-colors group-hover/item:bg-amber-500/20 group-hover/item:text-brand-gold">
                          <Globe className="h-4 w-4" />
                        </div>
                        <div className="overflow-hidden">
                          <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                            {isRtl ? bio.contactFeature.otherLabelAr : bio.contactFeature.otherLabelEn}
                          </span>
                          <span className="block text-xs font-semibold text-white group-hover/item:text-brand-gold transition-colors font-sans truncate">
                            {bio.contactFeature.other.value.replace(/^https?:\/\/(www\.)?/, '')}
                          </span>
                        </div>
                      </a>
                    )}

                    {/* Dynamic Custom Platforms (Unlimited) */}
                    {bio.contactFeature.customPlatforms && bio.contactFeature.customPlatforms.map((plat) => {
                      if (!plat.visible || !plat.value) return null;
                      const details = getPlatformDetails(plat.platform);
                      
                      // Resolve bilingual labels
                      let label = isRtl ? details.labelAr : details.labelEn;
                      if (plat.platform === 'custom') {
                        label = isRtl ? (plat.labelAr || label) : (plat.labelEn || label);
                      }
                      
                      // Detect mailto or tel links
                      let href = plat.value;
                      if (plat.platform === 'email' && !href.startsWith('mailto:')) {
                        href = `mailto:${plat.value}`;
                      } else if (plat.platform === 'phone' && !href.startsWith('tel:')) {
                        href = `tel:${plat.value}`;
                      }
                      
                      // For display, trim https?://
                      const displayVal = plat.value.replace(/^https?:\/\/(www\.)?/, '');

                      return (
                        <a 
                          key={plat.id}
                          href={href}
                          target={plat.platform === 'email' || plat.platform === 'phone' ? undefined : '_blank'}
                          rel="noreferrer"
                          className={`flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.01] px-4 py-3 hover:border-brand-gold/30 hover:bg-white/[0.03] transition-all group/item cursor-pointer ${isRtl ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`rounded-full ${details.bgColor} p-2 ${details.textColor} transition-colors group-hover/item:${details.bgColor.replace('/10', '/20')} group-hover/item:text-brand-gold`}>
                            {details.icon}
                          </div>
                          <div className="overflow-hidden">
                            <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                              {label}
                            </span>
                            <span className="block text-xs font-semibold text-white group-hover/item:text-brand-gold transition-colors font-sans truncate font-semibold">
                              {displayVal}
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>

    </section>
  );
}
