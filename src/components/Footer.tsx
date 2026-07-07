import React from 'react';
import { Feather, Heart, ShieldAlert } from 'lucide-react';
import { Language, UiTexts } from '../types';

interface FooterProps {
  lang: Language;
  uiTexts: UiTexts;
  isAdmin?: boolean;
  onAdminClick?: () => void;
  onLogout?: () => void;
}

export default function Footer({ 
  lang, 
  uiTexts,
  isAdmin,
  onAdminClick,
  onLogout
}: FooterProps) {
  const isRtl = lang === 'ar';

  const t = {
    taglineEn: uiTexts.footerTaglineEn,
    taglineAr: uiTexts.footerTaglineAr,
    allRightsEn: uiTexts.footerAllRightsEn,
    allRightsAr: uiTexts.footerAllRightsAr,
    byEn: uiTexts.footerByEn,
    byAr: uiTexts.footerByAr
  };

  return (
    <footer className="relative border-t border-white/5 bg-[#080808] py-16 px-6">
      <div className="mx-auto max-w-7xl flex flex-col items-center text-center">
        
        {/* Decorative Feather Quill or Footer Logo */}
        <div className="mb-6 rounded-sm bg-[#0c0c0c] border border-white/10 p-3 text-brand-gold/60 flex items-center justify-center overflow-hidden w-11 h-11">
          {uiTexts.footerLogoUrl ? (
            <img 
              src={uiTexts.footerLogoUrl} 
              alt="Footer Logo" 
              className="w-full h-full object-contain" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <Feather className="h-4 w-4" />
          )}
        </div>

        {/* Dynamic Philosophy Summary */}
        <p className="max-w-2xl font-serif text-sm italic leading-relaxed text-slate-400 font-light mb-8">
          {isRtl ? t.taglineAr : t.taglineEn}
        </p>

        {/* Split separator line */}
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent mb-8" />

        {/* Site Visitor Counter Feature (Toggleable from Admin Panel) */}
        {uiTexts.showVisitorCounter !== false && (
          <div className="mb-8 flex items-center gap-2 bg-[#0c0c0c] border border-white/10 rounded-full px-5 py-2 text-[10px] font-mono text-slate-400 select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {isRtl ? 'إجمالي زوار الموقع:' : 'Total Site Visitors:'}{' '}
              <span className="font-bold text-brand-gold text-xs">
                {(uiTexts.visitorCount !== undefined ? uiTexts.visitorCount : 1428).toLocaleString()}
              </span>
            </span>
          </div>
        )}

        {/* Licensing & Rights */}
        <div className="text-[9px] uppercase tracking-[0.25em] text-white/30 space-y-2 mb-6">
          <p className="text-brand-gold/70 tracking-[0.15em]">{isRtl ? t.byAr : t.byEn}</p>
          <p className="flex items-center justify-center gap-1">
            <span>{isRtl ? t.allRightsAr : t.allRightsEn}</span>
          </p>
        </div>

        {/* Subtle, hidden control panel option at the bottom so no one else notices it */}
        <div className="flex justify-center">
          {isAdmin ? (
            <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
              <button
                id="footer-admin-dashboard-btn"
                onClick={onAdminClick}
                className="inline-flex items-center gap-1.5 rounded-sm bg-brand-gold/10 border border-brand-gold/25 px-2.5 py-1.5 text-[9px] uppercase tracking-wider font-semibold text-brand-gold hover:bg-brand-gold hover:text-black transition-all cursor-pointer"
              >
                <ShieldAlert className="h-3 w-3" />
                <span>{isRtl ? 'لوحة التحكم' : 'Control Panel'}</span>
              </button>
              <button
                id="footer-logout-btn"
                onClick={onLogout}
                className="rounded-sm bg-brand-crimson/10 border border-brand-crimson/25 px-2.5 py-1.5 text-[9px] uppercase tracking-wider font-semibold text-red-400 hover:bg-brand-crimson/30 transition-all cursor-pointer"
              >
                {isRtl ? 'تسجيل الخروج' : 'Logout'}
              </button>
            </div>
          ) : (
            <button
              id="footer-login-btn"
              onClick={onAdminClick}
              className="inline-flex items-center justify-center p-2 rounded-full border border-white/5 bg-transparent text-slate-800 hover:text-brand-gold hover:border-brand-gold/20 hover:bg-white/[0.02] transition-all duration-300 opacity-25 hover:opacity-100 cursor-pointer"
              title={isRtl ? 'لوحة التحكم الخاصة' : 'Private Control Panel'}
            >
              <ShieldAlert className="h-4 w-4" />
            </button>
          )}
        </div>

      </div>
    </footer>
  );
}
