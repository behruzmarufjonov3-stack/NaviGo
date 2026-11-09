import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Lock, 
  Server, 
  AlertTriangle, 
  Scale, 
  Check, 
  ExternalLink 
} from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms' | 'steps';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, defaultTab = 'privacy' }) => {
  const [tab, setTab] = useState<'privacy' | 'terms' | 'steps'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        className="w-full max-w-2xl bg-white dark:bg-darkCard rounded-panel shadow-float border border-yolBorder dark:border-darkBorder p-4 sm:p-6 max-h-[92vh] flex flex-col overflow-hidden text-textPrimary dark:text-darkText"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-yolBorder dark:border-darkBorder shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-base sm:text-lg font-black tracking-tight">
                Rasmiy Hujjatlar va Qonuniy Talablar
              </h2>
              <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                O'zbekiston Respublikasi Qonunchiligiga Muvofiq
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Yopish"
            className="w-8 h-8 rounded-full bg-innerSoftArea dark:bg-gray-800 flex items-center justify-center text-textSecondary dark:text-darkTextSec hover:text-textPrimary spring-btn active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-2 my-3 shrink-0">
          <button
            type="button"
            onClick={() => setTab('privacy')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all spring-btn active:scale-95 flex items-center justify-center gap-1.5 ${
              tab === 'privacy'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-innerSoftArea dark:bg-gray-800 text-textSecondary hover:text-textPrimary'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Maxfiylik Siyosati</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('terms')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all spring-btn active:scale-95 flex items-center justify-center gap-1.5 ${
              tab === 'terms'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-innerSoftArea dark:bg-gray-800 text-textSecondary hover:text-textPrimary'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Foydalanish Shartlari</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('steps')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all spring-btn active:scale-95 flex items-center justify-center gap-1.5 ${
              tab === 'steps'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-innerSoftArea dark:bg-gray-800 text-textSecondary hover:text-textPrimary'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>6 Qadam (Tekshiruv)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-1 py-2 space-y-4 text-xs leading-relaxed text-textSecondary dark:text-darkTextSec">
          {tab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                <div className="font-bold flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-300">
                  <Server className="w-4 h-4" />
                  <span>2026-yil mart qonunchiligi yangilanishi:</span>
                </div>
                <p className="mt-1 text-xs">
                  Biometrik ma'lumotlar (yuz tasviri, barmoq izi, ovoz) va foydalanuvchilarning shaxsiy ma'lumotlari <strong>FAQAT O'zbekiston Respublikasi hududidagi milliy serverlarda</strong> saqlanadi va xorijiy servislarga noqonuniy uzatilmaydi.
                </p>
              </div>

              <div>
                <h4 className="font-black text-sm text-textPrimary dark:text-darkText mb-1">
                  1. Yig'iladigan ma'lumotlar ro'yxati
                </h4>
                <p>
                  NaviGo platformasi xizmatlarni sifatli taqdim etish uchun quyidagi ma'lumotlarni yig'ishi mumkin:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Ism va familiya:</strong> Foydalanuvchi hisobini identifikatsiya qilish uchun.</li>
                  <li><strong>Elektron pochta va telefon raqami:</strong> Tizimga xavfsiz kirish va xabardor qilish uchun.</li>
                  <li><strong>Transport vositasi ma'lumotlari:</strong> Avtomobil rusumi va davlat raqami (tezkor navigatsiya qulayligi uchun).</li>
                  <li><strong>Geolokatsiya (GPS):</strong> Yaqin atrofdagi yo'l hodisalari, tirbandliklar, gaz bosimi va tez yordam dispetcherligini ta'minlash uchun.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-black text-sm text-textPrimary dark:text-darkText mb-1">
                  2. Ma'lumotlarni saqlash va xavfsizlik
                </h4>
                <p>
                  Barcha ma'lumotlar xavfsiz shifrlangan protokollar (HTTPS/TLS) orqali uzatiladi. Parollar kuchli kriptografik xeshlar (bcrypt) bilan himoyalangan bo'lib, ochiq holda saqlanmaydi.
                </p>
              </div>

              <div>
                <h4 className="font-black text-sm text-textPrimary dark:text-darkText mb-1">
                  3. Foydalanuvchi huquqlari
                </h4>
                <p>
                  Siz istalgan vaqtda o'z profilingizdagi ma'lumotlarni tahrirlashingiz, parolni o'zgartirishingiz yoki hisobingizni o'chirishni talab qilishingiz mumkin.
                </p>
              </div>
            </div>
          )}

          {tab === 'terms' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-black text-sm text-textPrimary dark:text-darkText mb-1">
                  1. Amal qilish qoidalari
                </h4>
                <p>
                  NaviGo platformasidan O'zbekiston Respublikasi fuqarolari, haydovchilar va sayyohlar shaxsiy hamda jamoat xavfsizligi maqsadida bepul foydalanishlari mumkin.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                <div className="font-bold flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span>2. Qat'iy taqiqlar (Cheklovlar):</span>
                </div>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
                  <li>Boshqa haydovchi yoki fuqarolarning shaxsiy ma'lumotlarini ruxsatsiz yig'ish va tarqatish;</li>
                  <li>Tizimga soxta, yolg'on YTH, noqonuniy radar yoki qasddan buzilgan xabarlarni yuborish;</li>
                  <li>Platforma kodini, API interfeyslarini buzish yoki noqonuniy botlardan foydalanish qat'iyan taqiqlanadi.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-black text-sm text-textPrimary dark:text-darkText mb-1">
                  3. Mas'uliyat doirasi
                </h4>
                <p>
                  Har bir foydalanuvchi o'z hisobidan yuborilgan ma'lumotlar, berilgan hisobotlar va yo'ldagi xatti-harakatlari uchun shaxsan javobgardir.
                </p>
              </div>
            </div>
          )}

          {tab === 'steps' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-gray-800 border border-yolBorder dark:border-gray-700">
                <span className="text-[11px] font-bold text-accentOrange uppercase block">
                  Ishga tushirishdan oldin 6 qadam (Deployment Checklist)
                </span>
                <p className="text-xs text-textSecondary dark:text-darkTextSec mt-0.5">
                  Loyiha ishlab chiqarish (production) muhitiga to'liq tayyor bo'lishi uchun quyidagi 6 ta asosiy qadam bajarilgan:
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    title: "1. Maxfiylik siyosati",
                    desc: "Ism, telefon, email va GPS ma'lumotlari. Biometrik ma'lumotlar faqat O'zbekistonda saqlanishi belgilangan.",
                    status: true
                  },
                  {
                    title: "2. Foydalanish shartlari",
                    desc: "Amal qilish tartibi, qat'iy taqiqlar va foydalanuvchi javobgarligi aniq shakllantirilgan.",
                    status: true
                  },
                  {
                    title: "3. Cookie siyosati va Consent Mode v2",
                    desc: "Saytda rasmiy rozilik banneri o'rnatilgan: 'Qabul qilaman' va 'Rad etaman' variantlari mavjud.",
                    status: true
                  },
                  {
                    title: "4. Google Search Console & Sitemap",
                    desc: "sitemap.xml va robots.txt qidiruv tizimlari indeksatsiyasi uchun to'liq moslashtirilgan.",
                    status: true
                  },
                  {
                    title: "5. Google Tag Manager / Analytics 4",
                    desc: "gtag consent mode v2 sozlamalari bilan birga kuzatuv tizimi xavfsiz integratsiya qilingan.",
                    status: true
                  },
                  {
                    title: "6. PageSpeed & Web Vitals (LCP < 2.5s, INP < 200ms)",
                    desc: "Interaktiv elementlar yengillashtirilgan, tezkor javob berish va layout shift (CLS < 0.1) ta'minlangan.",
                    status: true
                  }
                ].map((step, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 flex items-start gap-3 shadow-2xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <div className="font-black text-xs text-textPrimary dark:text-darkText">
                        {step.title}
                      </div>
                      <div className="text-[11px] text-textSecondary dark:text-darkTextSec mt-0.5">
                        {step.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-yolBorder dark:border-darkBorder flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-blackPill text-white text-xs font-bold spring-btn active:scale-95"
          >
            Tushundim
          </button>
        </div>
      </div>
    </div>
  );
};
