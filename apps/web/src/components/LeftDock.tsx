import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sun, 
  Moon, 
  LogOut, 
  Eye, 
  Truck, 
  Fuel, 
  UtensilsCrossed, 
  ShoppingBag, 
  HeartPulse,
  Navigation,
  MapPin,
  X,
  Star,
  Clock,
  ExternalLink
} from 'lucide-react';

interface PopularPlace {
  id: string;
  name: string;
  category: 'restaurant' | 'shop' | 'hospital';
  address: string;
  lat: number;
  lon: number;
  rating: number;
  status: string;
  approxKm: number;
  highlight: string;
}

const POPULAR_PLACES: PopularPlace[] = [
  // Restoranlar & Kafelar
  {
    id: 'rest-rayhon',
    name: 'Rayhon Milliy Taomlar',
    category: 'restaurant',
    address: 'Amir Temur shoh ko‘chasi, 42',
    lat: 41.3325,
    lon: 69.2842,
    rating: 4.8,
    status: 'Ochiq (24/7)',
    approxKm: 1.8,
    highlight: 'Milliy taomlar, palov, somsa'
  },
  {
    id: 'rest-oqtepa',
    name: 'Oqtepa Lavash (Markaz)',
    category: 'restaurant',
    address: 'Oybek ko‘chasi, 18-uy',
    lat: 41.2985,
    lon: 69.2780,
    rating: 4.7,
    status: 'Ochiq (09:00 - 03:00)',
    approxKm: 1.4,
    highlight: 'Fast food, pitsa, lavash'
  },
  {
    id: 'rest-caravan',
    name: 'Caravan Art Cafe & Restoran',
    category: 'restaurant',
    address: 'Yakkasaroy, Abdulla Qahhor ko‘chasi, 22',
    lat: 41.2890,
    lon: 69.2550,
    rating: 4.9,
    status: 'Ochiq (11:00 - 23:00)',
    approxKm: 2.6,
    highlight: 'Milliy va Yevropa oshxonasi'
  },
  {
    id: 'rest-evos',
    name: 'EVOS Fast Food (Bunyodkor)',
    category: 'restaurant',
    address: 'Chilonzor tumani, Bunyodkor shoxi, 15',
    lat: 41.2750,
    lon: 69.2150,
    rating: 4.6,
    status: 'Ochiq (24/7)',
    approxKm: 2.9,
    highlight: 'Burger, lavash, salqin ichimliklar'
  },
  {
    id: 'rest-tc-lounge',
    name: 'Tashkent City Lounge & Grill',
    category: 'restaurant',
    address: 'Tashkent City Park hududi',
    lat: 41.3140,
    lon: 69.2520,
    rating: 4.9,
    status: 'Ochiq (10:00 - 02:00)',
    approxKm: 1.2,
    highlight: 'Park manzarali premium restoran'
  },

  // Do'konlar & Bozorlar
  {
    id: 'shop-chorsu',
    name: 'Chorsu Tarixiy Bozori',
    category: 'shop',
    address: 'Eski shahar, Zarkaynar ko‘chasi',
    lat: 41.3275,
    lon: 69.2345,
    rating: 4.9,
    status: 'Ochiq (07:00 - 19:00)',
    approxKm: 3.2,
    highlight: 'Sharqona bozor, meva, suvenirlar'
  },
  {
    id: 'shop-korzinka',
    name: 'Korzinka Supermarket (Oybek)',
    category: 'shop',
    address: 'Mirobod tumani, Oybek ko‘chasi, 14',
    lat: 41.2990,
    lon: 69.2790,
    rating: 4.8,
    status: 'Ochiq (24/7)',
    approxKm: 1.3,
    highlight: 'Oziq-ovqat, shirinliklar, xarid'
  },
  {
    id: 'shop-makro',
    name: 'Makro Supermarket (Bunyodkor)',
    category: 'shop',
    address: 'Chilonzor, Bunyodkor ko‘chasi, 28',
    lat: 41.2710,
    lon: 69.2080,
    rating: 4.6,
    status: 'Ochiq (08:00 - 23:00)',
    approxKm: 2.7,
    highlight: 'Katta supermarket, maishiy buyumlar'
  },
  {
    id: 'shop-darvoza',
    name: 'Samarqand Darvoza Mall',
    category: 'shop',
    address: 'Shayxontohur tumani, Qoratosh ko‘chasi, 5A',
    lat: 41.3160,
    lon: 69.2290,
    rating: 4.8,
    status: 'Ochiq (10:00 - 22:00)',
    approxKm: 2.8,
    highlight: 'Brend do‘konlar, kinoteatr, fudkort'
  },
  {
    id: 'shop-tc-mall',
    name: 'Tashkent City Mall',
    category: 'shop',
    address: 'Botir Zokirov ko‘chasi, 7',
    lat: 41.3150,
    lon: 69.2480,
    rating: 4.9,
    status: 'Ochiq (10:00 - 23:00)',
    approxKm: 1.1,
    highlight: 'O‘zbekistondagi eng yirik savdo markazi'
  },

  // Shifoxonalar & Dorixonalar
  {
    id: 'hosp-16',
    name: 'Respublika Shoshilinch Tibbiy Markazi (16-gor)',
    category: 'hospital',
    address: 'Chilonzor tumani, Kichik halqa yo‘li, 2',
    lat: 41.2780,
    lon: 69.2120,
    rating: 4.7,
    status: '24/7 Shoshilinch',
    approxKm: 3.4,
    highlight: 'Tez tibbiy yordam va reanimatsiya'
  },
  {
    id: 'hosp-shahar-1',
    name: 'Toshkent Shahar 1-son Shifoxonasi',
    category: 'hospital',
    address: 'Yunusobod, Amir Temur shoxi, 114',
    lat: 41.3520,
    lon: 69.2880,
    rating: 4.6,
    status: '24/7 Statsionar',
    approxKm: 2.5,
    highlight: 'Ko‘p tarmoqli shahar poliklinikasi'
  },
  {
    id: 'hosp-akfa',
    name: 'Akfa Medline Xususiy Klinikasi',
    category: 'hospital',
    address: 'Olmazor tumani, Kichik halqa yo‘li, 5A',
    lat: 41.3480,
    lon: 69.2150,
    rating: 4.9,
    status: 'Ochiq (24/7)',
    approxKm: 4.1,
    highlight: 'Yuqori texnologiyali diagnostika'
  },
  {
    id: 'hosp-oximed',
    name: 'OxiMed Tibbiyot Klinikasi',
    category: 'hospital',
    address: 'Yakkasaroy, Shota Rustaveli ko‘chasi, 58',
    lat: 41.2910,
    lon: 69.2490,
    rating: 4.8,
    status: 'Ochiq (08:00 - 20:00)',
    approxKm: 2.1,
    highlight: 'Kardiologiya va tahlillar'
  },
  {
    id: 'hosp-grand-dorixona',
    name: 'Grand Dorixona 24/7',
    category: 'hospital',
    address: 'Mirobod tumani, Nukus ko‘chasi, 29',
    lat: 41.2980,
    lon: 69.2710,
    rating: 4.9,
    status: 'Tunu-kun 24/7',
    approxKm: 1.0,
    highlight: 'Barcha dori-darmonlar mavjud'
  }
];

export const LeftDock: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    user, 
    logout, 
    setIsAuthOpen,
    setIsFuelModalOpen,
    requestRoute,
    setDestinationCoords,
    setFocusedLocation,
    userCoords,
    locale,
    t 
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'restaurant' | 'shop' | 'hospital' | null>(null);
  const popoutRef = useRef<HTMLDivElement>(null);

  // Close popout on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoutRef.current && !popoutRef.current.contains(e.target as Node)) {
        setActiveCategory(null);
      }
    };
    if (activeCategory) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [activeCategory]);

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('high-contrast');
    else setTheme('light');
  };

  const handleToggleCategory = (cat: 'restaurant' | 'shop' | 'hospital') => {
    setActiveCategory(prev => prev === cat ? null : cat);
  };

  const handleRouteToPlace = async (place: PopularPlace) => {
    setActiveCategory(null);
    setDestinationCoords({ lat: place.lat, lon: place.lon, name: place.name });
    setFocusedLocation({ lat: place.lat, lon: place.lon });
    await requestRoute(
      place.lat,
      place.lon,
      'car',
      place.name,
      userCoords.lat,
      userCoords.lon,
      locale === 'ru' ? 'Мое местоположение' : locale === 'en' ? 'My location' : 'Mening joylashuvim'
    );
  };

  const handleViewOnMap = (place: PopularPlace) => {
    setActiveCategory(null);
    setFocusedLocation({ lat: place.lat, lon: place.lon });
  };

  const filteredPlaces = activeCategory 
    ? POPULAR_PLACES.filter(p => p.category === activeCategory)
    : [];

  return (
    <>
      <aside 
        aria-label="Navigation Dock"
        className="hidden xl:flex flex-col items-center justify-between py-5 px-2 w-16 bg-white dark:bg-darkCard rounded-full shadow-soft border border-yolBorder dark:border-darkBorder my-4 ml-4 z-20"
      >
        {/* Top Dock Items */}
        <div className="flex flex-col items-center gap-4">
          {/* Favqulodda Xizmatlar (103, 102, 101, 104, 1050) Navigation Pill */}
          <a
            href="#/ambulance"
            title="Favqulodda Xizmatlar (103, 102, 101, 104, 1050)"
            className="flex flex-col items-center gap-1 group transition-transform active:scale-95"
          >
            <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md group-hover:bg-red-700 transition-colors">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-tight">
              SOS
            </span>
          </a>

          {/* Yoqilg'i & Gaz Shoxobchalari */}
          <button
            onClick={() => setIsFuelModalOpen(true)}
            title="Yoqilg'i & Zapravkalar (Metan bosimi, Benzin navlari va narxlari, Propan)"
            className="flex flex-col items-center gap-1 group transition-transform active:scale-95"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:bg-emerald-700 transition-colors spring-btn">
              <Fuel className="w-5 h-5 text-white" />
            </div>
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight text-center leading-tight">
              Zapravka
            </span>
          </button>

          {/* Theme / Contrast Toggle */}
          <button
            onClick={toggleTheme}
            title={`Mavzu: ${theme}`}
            className="flex flex-col items-center gap-1 group text-textSecondary dark:text-darkTextSec hover:text-accentOrange transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-innerSoftArea dark:bg-gray-800 flex items-center justify-center group-hover:bg-orangeTint transition-colors">
              {theme === 'light' ? (
                <Sun className="w-5 h-5 text-accentOrange" />
              ) : theme === 'dark' ? (
                <Moon className="w-5 h-5 text-yellow-400" />
              ) : (
                <Eye className="w-5 h-5 text-yellow-500" />
              )}
            </div>
            <span className="text-[10px] font-semibold tracking-tight uppercase">
              {theme === 'light' ? t('dock.day') : theme === 'dark' ? t('dock.night') : t('dock.contrast')}
            </span>
          </button>

          {/* Divider */}
          <div className="w-8 h-px bg-yolBorder dark:bg-gray-700 my-1"></div>

          {/* 1. RESTORAN & KAFELAR (Animated) */}
          <button
            onClick={() => handleToggleCategory('restaurant')}
            title="Ko'p boriladigan Restoran & Kafelar"
            className={`relative flex flex-col items-center gap-1 group transition-all spring-btn active:scale-90 ${activeCategory === 'restaurant' ? 'scale-105' : ''}`}
          >
            <div className={`relative w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 ${
              activeCategory === 'restaurant' 
                ? 'bg-gradient-to-tr from-amber-600 to-orange-500 ring-2 ring-orange-400 shadow-orange-500/50' 
                : 'bg-gradient-to-tr from-amber-500 to-orange-500 group-hover:shadow-orange-500/40'
            }`}>
              <UtensilsCrossed className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              {/* Animated pulse badge */}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-300 border-2 border-white dark:border-darkCard animate-ping"></span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white dark:border-darkCard"></span>
            </div>
            <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tight text-center leading-tight">
              Restoran
            </span>
          </button>

          {/* 2. DO'KONLAR & BOZOR (Animated) */}
          <button
            onClick={() => handleToggleCategory('shop')}
            title="Do'konlar, Bozorlar va Supermarketlar"
            className={`relative flex flex-col items-center gap-1 group transition-all spring-btn active:scale-90 ${activeCategory === 'shop' ? 'scale-105' : ''}`}
          >
            <div className={`relative w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 ${
              activeCategory === 'shop' 
                ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 ring-2 ring-blue-400 shadow-blue-500/50' 
                : 'bg-gradient-to-tr from-blue-500 to-indigo-600 group-hover:shadow-blue-500/40'
            }`}>
              <ShoppingBag className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-300 border-2 border-white dark:border-darkCard animate-pulse"></span>
            </div>
            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight text-center leading-tight">
              Do'kon
            </span>
          </button>

          {/* 3. SHIFOXONA & TIBBIYOT (Animated Heartbeat) */}
          <button
            onClick={() => handleToggleCategory('hospital')}
            title="Shifoxonalar, Klinikalar va Dorixonalar"
            className={`relative flex flex-col items-center gap-1 group transition-all spring-btn active:scale-90 ${activeCategory === 'hospital' ? 'scale-105' : ''}`}
          >
            <div className={`relative w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 ${
              activeCategory === 'hospital' 
                ? 'bg-gradient-to-tr from-rose-600 to-red-600 ring-2 ring-rose-400 shadow-rose-500/50' 
                : 'bg-gradient-to-tr from-rose-500 to-red-600 group-hover:shadow-rose-500/40'
            }`}>
              <HeartPulse className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-300 border-2 border-white dark:border-darkCard animate-ping"></span>
            </div>
            <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight text-center leading-tight">
              Shifoxona
            </span>
          </button>
        </div>

        {/* Bottom Dock Items */}
        <div className="flex flex-col items-center gap-4">
          {user ? (
            <button
              onClick={logout}
              title={t('dock.exit')}
              className="flex flex-col items-center gap-1 group text-textSecondary dark:text-darkTextSec hover:text-statusDanger transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-innerSoftArea dark:bg-gray-800 flex items-center justify-center group-hover:bg-statusDangerBg transition-colors spring-btn active:scale-90">
                <LogOut className="w-5 h-5 text-statusDanger" />
              </div>
              <span className="text-[10px] font-semibold text-statusDanger">{t('dock.exit')}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              title={t('dock.login')}
              className="flex flex-col items-center gap-1 group text-textSecondary dark:text-darkTextSec hover:text-accentOrange transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-innerSoftArea dark:bg-gray-800 flex items-center justify-center group-hover:bg-orangeTint transition-colors spring-btn active:scale-90">
                <LogOut className="w-5 h-5 rotate-180 text-accentOrange" />
              </div>
              <span className="text-[10px] font-semibold">{t('dock.login')}</span>
            </button>
          )}
        </div>
      </aside>

      {/* Popular Locations Floating Popout Card */}
      {activeCategory && (
        <div 
          ref={popoutRef}
          role="dialog"
          aria-label="Popular Places"
          className="fixed left-24 top-20 sm:top-24 z-50 w-80 sm:w-96 bg-white dark:bg-darkCard rounded-3xl shadow-float border border-yolBorder dark:border-darkBorder p-4 sm:p-5 flex flex-col max-h-[82vh] overflow-hidden animate-scale-up backdrop-blur-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-yolBorder dark:border-gray-700">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-xs ${
                activeCategory === 'restaurant'
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                  : activeCategory === 'shop'
                  ? 'bg-gradient-to-tr from-blue-500 to-indigo-600'
                  : 'bg-gradient-to-tr from-rose-500 to-red-600'
              }`}>
                {activeCategory === 'restaurant' && <UtensilsCrossed className="w-4 h-4" />}
                {activeCategory === 'shop' && <ShoppingBag className="w-4 h-4" />}
                {activeCategory === 'hospital' && <HeartPulse className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="font-black text-sm text-textPrimary dark:text-darkText leading-tight">
                  {activeCategory === 'restaurant' && "Ommabop Restoran & Kafelar"}
                  {activeCategory === 'shop' && "Do'konlar, Bozorlar & Savdo"}
                  {activeCategory === 'hospital' && "Shifoxona & Tibbiyot Markazlari"}
                </h3>
                <span className="text-[10px] text-textSecondary dark:text-darkTextSec font-medium">
                  Toshkent bo'yicha eng ko'p tashrif buyuriladigan joylar
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveCategory(null)}
              className="w-8 h-8 rounded-full bg-innerSoftArea dark:bg-gray-800 flex items-center justify-center text-textSecondary dark:text-darkTextSec hover:text-textPrimary spring-btn active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Place Items List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 my-3 pr-1">
            {filteredPlaces.map(place => (
              <div 
                key={place.id}
                className="p-3 rounded-2xl bg-innerSoftArea dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 hover:border-accentOrange transition-all flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-textPrimary dark:text-darkText">
                      {place.name}
                    </h4>
                    <span className="text-[11px] text-textSecondary dark:text-darkTextSec flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{place.address}</span>
                    </span>
                    <p className="text-[10px] text-accentOrange font-medium mt-1">
                      {place.highlight}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-[10px]">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>{place.rating}</span>
                    </span>
                    <span className="text-[10px] font-bold text-textSecondary block mt-1">
                      ~{place.approxKm} km
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 text-xs">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{place.status}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleViewOnMap(place)}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-textPrimary dark:text-darkText font-bold text-[11px] hover:border-accentOrange spring-btn active:scale-95"
                    >
                      Xaritada
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRouteToPlace(place)}
                      className="px-3 py-1 rounded-xl bg-accentOrange hover:bg-orange-600 text-white font-black text-[11px] flex items-center gap-1 shadow-xs spring-btn active:scale-95"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Marshrut</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-yolBorder dark:border-gray-700 flex items-center justify-between text-[10px] text-textSecondary dark:text-darkTextSec">
            <span>NaviGo GPS Yo'naltirgichi</span>
            <button
              onClick={() => setActiveCategory(null)}
              className="font-bold hover:underline"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </>
  );
};
