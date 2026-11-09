import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X, FileText, ChevronRight } from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenLegalModal: (tab: 'privacy' | 'terms') => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenLegalModal }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [consentStatus, setConsentStatus] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('navigo_cookie_consent_v2');
      if (!saved) {
        // Show after a brief gentle delay
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      } else {
        setConsentStatus(saved);
      }
    } catch {}
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('navigo_cookie_consent_v2', 'granted');
      // Update gtag consent mode v2 if window.gtag exists
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'granted',
          analytics_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted'
        });
      }
    } catch {}
    setConsentStatus('granted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('navigo_cookie_consent_v2', 'denied');
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'denied',
          analytics_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
      }
    } catch {}
    setConsentStatus('denied');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside 
      aria-label="Cookie va maxfiylik roziligi"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl p-4 shadow-float border border-yolBorder dark:border-gray-700 animate-slide-up text-textPrimary dark:text-darkText"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-accentOrange/10 text-accentOrange flex items-center justify-center shrink-0 mt-0.5">
          <Cookie className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-textPrimary dark:text-darkText">
              Cookie va Maxfiylik Roziligi
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Consent Mode v2
            </span>
          </div>

          <p className="text-xs text-textSecondary dark:text-darkTextSec mt-1 leading-relaxed">
            NaviGo platformasi xaritalar, navigatsiya xizmati va statistik tahlillar uchun cookie-fayllardan foydalanadi. O'zbekiston qonunchiligiga muvofiq, ma'lumotlaringiz xavfsiz saqlanadi.
          </p>

          <div className="flex items-center gap-3 mt-2 text-[11px] text-textSecondary">
            <button
              type="button"
              onClick={() => onOpenLegalModal('privacy')}
              className="text-accentOrange hover:underline font-bold inline-flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              <span>Maxfiylik siyosati</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onOpenLegalModal('terms')}
              className="hover:underline"
            >
              Foydalanish shartlari
            </button>
          </div>

          {/* Action buttons matching the video specifications */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleDecline}
              className="py-2 px-3 rounded-xl bg-innerSoftArea dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-textSecondary dark:text-darkTextSec text-xs font-bold transition-all spring-btn active:scale-95"
            >
              Rad etaman
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="py-2 px-3 rounded-xl bg-accentOrange hover:bg-orange-600 text-white text-xs font-black shadow-sm transition-all spring-btn active:scale-95"
            >
              Qabul qilaman
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
