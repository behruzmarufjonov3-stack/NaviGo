import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MapPin, 
  Bell, 
  User as UserIcon, 
  Shield, 
  Edit3, 
  BarChart3, 
  HelpCircle, 
  Settings, 
  FileText 
} from 'lucide-react';
import { SupportedLocale } from '@yol/shared';
import { NaviGoLogo } from './NaviGoLogo';

export const Header: React.FC = () => {
  const { 
    locale, 
    setLocale, 
    t, 
    activeTab, 
    setActiveTab, 
    user, 
    setIsAuthOpen,
    setIsNotificationsOpen,
    notifications
  } = useApp();

  const locales: SupportedLocale[] = ['uz', 'ru', 'en'];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navRef = useRef<HTMLElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const [navPill, setNavPill] = useState({ left: 0, width: 0, opacity: 0 });
  const [langPill, setLangPill] = useState({ left: 0, width: 0, opacity: 0 });

  // Smooth sliding pill calculation for main navigation
  useEffect(() => {
    if (!navRef.current) return;
    const activeEl = navRef.current.querySelector<HTMLButtonElement>(`[data-nav-id="${activeTab}"]`);
    if (activeEl) {
      const parentRect = navRef.current.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      setNavPill({
        left: elRect.left - parentRect.left,
        width: elRect.width,
        opacity: 1
      });
    } else {
      setNavPill(prev => ({ ...prev, opacity: 0 }));
    }
  }, [activeTab, user?.role]);

  // Smooth sliding pill calculation for language switcher
  useEffect(() => {
    if (!langRef.current) return;
    const activeEl = langRef.current.querySelector<HTMLButtonElement>(`[data-lang-id="${locale}"]`);
    if (activeEl) {
      const parentRect = langRef.current.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      setLangPill({
        left: elRect.left - parentRect.left,
        width: elRect.width,
        opacity: 1
      });
    }
  }, [locale]);

  return (
    <header className="w-full flex items-center justify-between px-3 md:px-6 py-2.5 z-30 select-none gap-2 xl:gap-4">
      {/* 1. Left Brand Pill */}
      <div 
        onClick={() => setActiveTab('map')}
        className="flex items-center gap-2.5 bg-white dark:bg-darkCard px-3.5 py-1.5 md:py-2 rounded-full shadow-soft cursor-pointer spring-btn border border-yolBorder dark:border-darkBorder group shrink-0"
      >
        <NaviGoLogo className="w-8 h-8 md:w-9 md:h-9 group-hover:scale-105 transition-transform shrink-0 drop-shadow-sm" />
        <span className="font-black text-xl tracking-tight text-textPrimary dark:text-darkText block leading-tight pr-1">
          Navi<span className="text-accentOrange">Go</span>
        </span>
      </div>

      {/* 2. Center Floating Navigation Pills with Fluid Sliding Pill (Desktop) */}
      <nav 
        ref={navRef}
        aria-label="Main Navigation"
        className="hidden lg:flex items-center relative gap-1 xl:gap-1.5 bg-white dark:bg-darkCard p-1 md:p-1.5 rounded-full shadow-soft border border-yolBorder dark:border-darkBorder shrink-0 overflow-hidden"
      >
        {/* Animated Background Sliding Pill */}
        <div
          className="sliding-pill-indicator absolute top-1 bottom-1 md:top-1.5 md:bottom-1.5 bg-blackPill rounded-full shadow-md pointer-events-none"
          style={{
            transform: `translateX(${navPill.left}px)`,
            width: `${navPill.width}px`,
            opacity: navPill.opacity
          }}
        />

        <button
          data-nav-id="map"
          onClick={() => setActiveTab('map')}
          className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 xl:px-4 xl:py-2 rounded-full font-semibold text-xs xl:text-sm whitespace-nowrap shrink-0 transition-colors duration-200 active:scale-95 ${
            activeTab === 'map'
              ? 'text-white'
              : 'text-textSecondary dark:text-darkTextSec hover:text-textPrimary dark:hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
          <span>{t('nav.map')}</span>
        </button>

        <button
          data-nav-id="my-reports"
          onClick={() => setActiveTab('my-reports')}
          className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 xl:px-4 xl:py-2 rounded-full font-semibold text-xs xl:text-sm whitespace-nowrap shrink-0 transition-colors duration-200 active:scale-95 ${
            activeTab === 'my-reports'
              ? 'text-white'
              : 'text-textSecondary dark:text-darkTextSec hover:text-textPrimary dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
          <span>{t('nav.myReports')}</span>
        </button>

        <button
          data-nav-id="help"
          onClick={() => setActiveTab('help')}
          className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 xl:px-4 xl:py-2 rounded-full font-semibold text-xs xl:text-sm whitespace-nowrap shrink-0 transition-colors duration-200 active:scale-95 ${
            activeTab === 'help'
              ? 'text-white'
              : 'text-textSecondary dark:text-darkTextSec hover:text-textPrimary dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
          <span>{t('nav.help')}</span>
        </button>

        <button
          data-nav-id="settings"
          onClick={() => setActiveTab('settings')}
          className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 xl:px-4 xl:py-2 rounded-full font-semibold text-xs xl:text-sm whitespace-nowrap shrink-0 transition-colors duration-200 active:scale-95 ${
            activeTab === 'settings'
              ? 'text-white'
              : 'text-textSecondary dark:text-darkTextSec hover:text-textPrimary dark:hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
          <span>{t('nav.settings')}</span>
        </button>

        {/* Staff-only Tabs */}
        {user && (user.role === 'EDITOR' || user.role === 'ADMIN') && (
          <button
            data-nav-id="editor"
            onClick={() => setActiveTab('editor')}
            className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-full font-semibold text-xs xl:text-sm whitespace-nowrap shrink-0 transition-colors duration-200 active:scale-95 ${
              activeTab === 'editor'
                ? 'text-white'
                : 'text-accentOrange hover:bg-orangeTint dark:hover:bg-opacity-20'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
            <span>{t('nav.editor')}</span>
          </button>
        )}

        {user && (user.role === 'ANALYST' || user.role === 'ADMIN') && (
          <button
            data-nav-id="analyst"
            onClick={() => setActiveTab('analyst')}
            className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-full font-semibold text-xs xl:text-sm whitespace-nowrap shrink-0 transition-colors duration-200 active:scale-95 ${
              activeTab === 'analyst'
                ? 'text-white'
                : 'text-accentOrange hover:bg-orangeTint dark:hover:bg-opacity-20'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
            <span>{t('nav.analyst')}</span>
          </button>
        )}

        {user && user.role === 'ADMIN' && (
          <button
            data-nav-id="admin"
            onClick={() => setActiveTab('admin')}
            className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-full font-semibold text-xs xl:text-sm whitespace-nowrap shrink-0 transition-colors duration-200 active:scale-95 ${
              activeTab === 'admin'
                ? 'text-white'
                : 'text-accentOrange hover:bg-orangeTint dark:hover:bg-opacity-20'
            }`}
          >
            <Shield className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
            <span>{t('nav.admin')}</span>
          </button>
        )}
      </nav>

      {/* 3. Right Action Controls */}
      <div className="flex items-center gap-2 xl:gap-2.5 shrink-0">
        {/* Language Switcher with Animated Sliding Pill */}
        <div 
          ref={langRef}
          className="flex items-center relative bg-white dark:bg-darkCard p-1 rounded-full shadow-soft border border-yolBorder dark:border-darkBorder shrink-0 overflow-hidden"
        >
          <div
            className="sliding-pill-indicator absolute top-1 bottom-1 bg-blackPill rounded-full shadow-sm pointer-events-none"
            style={{
              transform: `translateX(${langPill.left}px)`,
              width: `${langPill.width}px`,
              opacity: langPill.opacity
            }}
          />
          {locales.map((l) => (
            <button
              key={l}
              data-lang-id={l}
              onClick={() => setLocale(l)}
              className={`relative z-10 px-2.5 py-1 md:px-3 md:py-1.5 text-[11px] md:text-xs font-bold rounded-full transition-colors duration-200 uppercase active:scale-90 ${
                locale === l
                  ? 'text-white'
                  : 'text-textSecondary dark:text-darkTextSec hover:text-textPrimary'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Notifications Icon Button */}
        <div className="relative shrink-0">
          <button 
            onClick={() => setIsNotificationsOpen(true)}
            aria-label={t('topBar.notifications')}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white dark:bg-darkCard flex items-center justify-center shadow-soft border border-yolBorder dark:border-darkBorder spring-btn text-textPrimary dark:text-darkText relative"
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5 text-accentOrange" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 bg-accentOrange text-white text-[9px] md:text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-darkCard animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Account / Sign In Button */}
        <button
          onClick={() => setIsAuthOpen(true)}
          className="flex items-center gap-1.5 md:gap-2 bg-white dark:bg-darkCard px-3 py-1.5 md:px-3.5 md:py-2 rounded-full shadow-soft border border-yolBorder dark:border-darkBorder spring-btn text-textPrimary dark:text-darkText shrink-0 max-w-[150px] md:max-w-[200px]"
        >
          <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-innerSoftArea dark:bg-gray-800 flex items-center justify-center text-textSecondary dark:text-darkTextSec shrink-0">
            <UserIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </div>
          <span className="font-semibold text-xs md:text-sm truncate max-w-[70px] md:max-w-[100px]">
            {user ? user.name.split(' ')[0] : t('topBar.login')}
          </span>
          {user && (
            <span className="text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orangeTint text-accentOrange uppercase shrink-0">
              {user.role}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
