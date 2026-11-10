import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Settings as SettingsIcon, Sun, Moon, Eye, Type, Shield, Trash2, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    t, 
    theme, 
    setTheme, 
    textScale, 
    setTextScale,
    reduceMotion,
    setReduceMotion 
  } = useApp();

  if (activeTab !== 'settings') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="w-full max-w-xl bg-white dark:bg-darkCard rounded-card shadow-float border border-yolBorder dark:border-darkBorder p-6 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-yolBorder dark:border-darkBorder">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orangeTint text-accentOrange flex items-center justify-center">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-title" className="text-xl font-bold text-textPrimary dark:text-darkText">
                {t('accessibility.title')}
              </h2>
              <span className="text-xs text-textSecondary dark:text-darkTextSec">
                {t('accessibility.subtitle')}
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('map')}
            aria-label={t('common.close')}
            className="w-10 h-10 rounded-full bg-innerSoftArea dark:bg-gray-800 flex items-center justify-center text-textSecondary dark:text-darkTextSec hover:text-textPrimary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* 1. Text & UI Scaling Controls */}
          <div className="p-4 rounded-2xl bg-innerSoftArea dark:bg-gray-800 border border-yolBorder dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-textPrimary dark:text-darkText flex items-center gap-2">
                <Type className="w-4 h-4 text-accentOrange" />
                <span>Interfeys va Matn o'lchami (Kattalashtirish)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-accentOrange text-white shadow-xs">
                  {Math.round(textScale * 100)}%
                </span>
                {textScale !== 1 && (
                  <button
                    type="button"
                    onClick={() => setTextScale(1)}
                    title="100% standartga qaytarish"
                    className="p-1 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Slider with [-] and [+] step buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTextScale(Math.max(0.85, Math.round((textScale - 0.05) * 100) / 100))}
                title="Kichraytirish (-5%)"
                disabled={textScale <= 0.85}
                className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-textPrimary dark:text-darkText hover:border-accentOrange disabled:opacity-40 transition-colors shrink-0 spring-btn active:scale-90"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <input
                type="range"
                min="0.85"
                max="1.40"
                step="0.05"
                value={textScale}
                onChange={(e) => setTextScale(parseFloat(e.target.value))}
                className="w-full accent-accentOrange cursor-pointer h-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
              />

              <button
                type="button"
                onClick={() => setTextScale(Math.min(1.40, Math.round((textScale + 0.05) * 100) / 100))}
                title="Kattalashtirish (+5%)"
                disabled={textScale >= 1.40}
                className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-textPrimary dark:text-darkText hover:border-accentOrange disabled:opacity-40 transition-colors shrink-0 spring-btn active:scale-90"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-[11px] font-semibold text-textSecondary mr-1">O'lchamlar:</span>
              {[
                { label: '90%', val: 0.90 },
                { label: '100% (Standart)', val: 1.00 },
                { label: '115%', val: 1.15 },
                { label: '130%', val: 1.30 },
                { label: '140% (Katta)', val: 1.40 }
              ].map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setTextScale(preset.val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    Math.abs(textScale - preset.val) < 0.02
                      ? 'bg-accentOrange text-white shadow-xs'
                      : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Live Visual Preview */}
            <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-gray-900/60 border border-dashed border-gray-200 dark:border-gray-700 text-center">
              <span className="text-xs font-medium text-textSecondary dark:text-darkTextSec block">
                Namuna matn ko'rinishi:
              </span>
              <p className="font-bold text-textPrimary dark:text-darkText mt-0.5">
                NaviGo • Toshkent xaritasi va marshrut ko'rinishi
              </p>
            </div>
          </div>

          {/* 2. Color Theme Selection */}
          <div className="p-4 rounded-2xl bg-innerSoftArea dark:bg-gray-800 border border-yolBorder dark:border-gray-700">
            <label className="text-sm font-bold text-textPrimary dark:text-darkText block mb-3">
              {t('accessibility.theme')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                  theme === 'light'
                    ? 'border-accentOrange bg-white dark:bg-darkCard shadow-sm text-textPrimary'
                    : 'border-transparent text-textSecondary'
                }`}
              >
                <Sun className="w-5 h-5 text-accentOrange" />
                <span>{t('accessibility.themeLight')}</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                  theme === 'dark'
                    ? 'border-accentOrange bg-white dark:bg-darkCard shadow-sm text-textPrimary dark:text-white'
                    : 'border-transparent text-textSecondary'
                }`}
              >
                <Moon className="w-5 h-5 text-yellow-400" />
                <span>{t('accessibility.themeDark')}</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('high-contrast')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                  theme === 'high-contrast'
                    ? 'border-yellow-400 bg-black text-yellow-400 shadow-sm'
                    : 'border-transparent text-textSecondary'
                }`}
              >
                <Eye className="w-5 h-5 text-yellow-400" />
                <span>{t('accessibility.themeHighContrast')}</span>
              </button>
            </div>
          </div>

          {/* 3. Reduce Motion Switch */}
          <div className="p-4 rounded-2xl bg-innerSoftArea dark:bg-gray-800 border border-yolBorder dark:border-gray-700 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-textPrimary dark:text-darkText">
                {t('accessibility.reduceMotion')}
              </div>
              <div className="text-xs text-textSecondary dark:text-darkTextSec">
                {t('accessibility.reduceMotionDesc')}
              </div>
            </div>
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
              className="w-5 h-5 accent-accentOrange cursor-pointer"
            />
          </div>

          {/* 4. Privacy & Consent */}
          <div className="p-4 rounded-2xl bg-innerSoftArea dark:bg-gray-800 border border-yolBorder dark:border-gray-700 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-textPrimary dark:text-darkText">
              <Shield className="w-4 h-4 text-accentOrange" />
              <span>{t('accessibility.privacyTitle')}</span>
            </div>
            <p className="text-xs text-textSecondary dark:text-darkTextSec leading-relaxed">
              {t('accessibility.privacyDesc')}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => alert('Data export prepared.')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-darkCard text-xs font-bold text-textPrimary dark:text-darkText border border-yolBorder dark:border-gray-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('accessibility.exportData')}</span>
              </button>
              <button
                onClick={() => alert('Account data purged.')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-statusDangerBg text-statusDanger text-xs font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('accessibility.deleteAccount')}</span>
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('map')}
          className="mt-6 w-full py-3 rounded-full bg-blackPill text-white font-bold hover:bg-blackPillHover"
        >
          {t('common.save')}
        </button>
      </div>
    </div>
  );
};
