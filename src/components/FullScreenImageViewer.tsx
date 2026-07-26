import React, { useEffect } from 'react';
import { X, ZoomIn, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FullScreenImageViewerProps {
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
  isRtl?: boolean;
}

export default function FullScreenImageViewer({ imageUrl, title, onClose, isRtl }: FullScreenImageViewerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (imageUrl) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/95 backdrop-blur-xl">
        {/* Backdrop click to dismiss */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 cursor-pointer"
        />

        {/* Top Floating Control Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2">
            {title && (
              <span className="px-3 py-1.5 rounded-full bg-black/60 border border-white/20 text-xs font-semibold text-white backdrop-blur-md max-w-[200px] sm:max-w-md truncate">
                {title}
              </span>
            )}
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="p-2.5 rounded-full bg-black/60 hover:bg-white/20 border border-white/20 text-white transition-all backdrop-blur-md cursor-pointer"
              title={isRtl ? 'تحميل الصورة' : 'Download Image'}
            >
              <Download className="h-5 w-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-red-600/80 hover:bg-red-600 border border-red-400/30 text-white shadow-lg transition-all backdrop-blur-md cursor-pointer"
              title={isRtl ? 'إغلاق (Esc)' : 'Close (Esc)'}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Full-Screen Image Container */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 max-w-full max-h-full flex items-center justify-center p-2 select-none"
        >
          <img
            src={imageUrl}
            alt={title || 'Full screen preview'}
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.9)] border border-white/10"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Clean View - No Overlay Text on Image */}
      </div>
    </AnimatePresence>
  );
}
