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
  Home,
  Briefcase,
  Search,
  Check,
  Edit3,
  Trash2,
  Crosshair,
  Sparkles
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

export interface SavedPlaceData {
  address: string;
  lat: number;
  lon: number;
  updatedAt?: string;
}

export interface UserSavedPlaces {
  home: SavedPlaceData | null;
  work: SavedPlaceData | null;
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

// Mashhur tezkor variantlar (Toshkent bo'yicha)
const HOME_PRESETS = [
  { label: "Chilonzor 9-mavze", address: "Chilonzor tumani, 9-mavze, 24-uy", lat: 41.2721, lon: 69.2045 },
  { label: "Yunusobod 19-mavze", address: "Yunusobod tumani, 19-mavze, 12-uy", lat: 41.3654, lon: 69.2912 },
  { label: "Buyuk Ipak Yo'li", address: "Mirzo Ulug'bek tumani, Buyuk Ipak Yo'li, 45", lat: 41.3255, lon: 69.3312 },
  { label: "Shota Rustaveli", address: "Yakkasaroy tumani, Shota Rustaveli ko'chasi, 32", lat: 41.2882, lon: 69.2520 },
  { label: "Sergeli Yangi Choshtepa", address: "Sergeli tumani, Yangi Choshtepa mavzesi", lat: 41.2250, lon: 69.2150 }
];

const WORK_PRESETS = [
  { label: "Tashkent City Biznes Markaz", address: "Tashkent City Xalqaro Biznes Markazi, Botir Zokirov 7", lat: 41.3145, lon: 69.2510 },
  { label: "Amir Temur Shohi (Markaz)", address: "Amir Temur shoh ko'chasi, 107B", lat: 41.3380, lon: 69.2840 },
  { label: "Afrosiyob Biznes Markazi", address: "Mirobod tumani, Oybek ko'chasi, 38", lat: 41.2995, lon: 69.2785 },
  { label: "IT Park Uzbekistan", address: "Mirzo Ulug'bek tumani, Tepamasjid ko'chasi, 4", lat: 41.3412, lon: 69.3354 },
  { label: "Navoiy ko'chasi (Vazirliklar)", address: "Shayxontohur tumani, Alisher Navoiy ko'chasi, 30", lat: 41.3210, lon: 69.2450 }
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

  // Popular Places Popout State
  const [activeCategory, setActiveCategory] = useState<'restaurant' | 'shop' | 'hospital' | null>(null);
  const popoutRef = useRef<HTMLDivElement>(null);

  // Saved Home / Work Addresses State (Stored in localStorage)
  const [savedPlaces, setSavedPlaces] = useState<UserSavedPlaces>(() => {
    try {
      const raw = localStorage.getItem('navigo_saved_places');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse saved places', e);
    }
    return { home: null, work: null };
  });

  const [activeAddressType, setActiveAddressType] = useState<'home' | 'work' | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [addressCoords, setAddressCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [searchResults, setSearchResults] = useState<Array<{ address: string; lat: number; lon: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const addressPopoutRef = useRef<HTMLDivElement>(null);

  // Close popouts on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoutRef.current && !popoutRef.current.contains(e.target as Node)) {
        setActiveCategory(null);
      }
      if (addressPopoutRef.current && !addressPopoutRef.current.contains(e.target as Node)) {
        setActiveAddressType(null);
      }
    };
    if (activeCategory || activeAddressType) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [activeCategory, activeAddressType]);

  // Real-time Geocoding Search
  useEffect(() => {
    if (!addressInput.trim() || addressInput.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        let results: Array<{ address: string; lat: number; lon: number }> = [];
        // 1. Backend Geocoding API
        try {
          const res = await fetch(`/api/v1/map/geocode?q=${encodeURIComponent(addressInput)}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              results = data.map((item: any) => ({
                address: item.displayName || item.name || item.address,
                lat: Number(item.lat),
                lon: Number(item.lon)
              }));
            }
          }
        } catch {
          // fallback
        }

        // 2. Fallback Nominatim
        if (results.length === 0) {
          const osmRes = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressInput)}&format=json&limit=5&accept-language=uz,en`
          );
          if (osmRes.ok) {
            const osmData = await osmRes.json();
            results = osmData.map((item: any) => ({
              address: item.display_name,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon)
            }));
          }
        }
        setSearchResults(results);
      } catch (err) {
        console.error('Geocoding search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [addressInput]);

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('high-contrast');
    else setTheme('light');
  };

  const handleToggleCategory = (cat: 'restaurant' | 'shop' | 'hospital') => {
    setActiveAddressType(null);
    setActiveCategory(prev => prev === cat ? null : cat);
  };

  const handleOpenAddressModal = (type: 'home' | 'work') => {
    setActiveCategory(null);
    setActiveAddressType(type);
    const existing = savedPlaces[type];
    if (existing) {
      setAddressInput(existing.address);
      setAddressCoords({ lat: existing.lat, lon: existing.lon });
      setIsEditingAddress(false);
    } else {
      setAddressInput('');
      setAddressCoords(null);
      setIsEditingAddress(true);
    }
  };

  const handleSaveAddress = () => {
    if (!activeAddressType || !addressInput.trim()) return;

    const lat = addressCoords?.lat ?? (userCoords.lat || 41.2995);
    const lon = addressCoords?.lon ?? (userCoords.lon || 69.2401);

    const updated: UserSavedPlaces = {
      ...savedPlaces,
      [activeAddressType]: {
        address: addressInput.trim(),
        lat,
        lon,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };

    setSavedPlaces(updated);
    try {
      localStorage.setItem('navigo_saved_places', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2000);
    setIsEditingAddress(false);
  };

  const handleDeleteAddress = (type: 'home' | 'work') => {
    const updated = {
      ...savedPlaces,
      [type]: null
    };
    setSavedPlaces(updated);
    try {
      localStorage.setItem('navigo_saved_places', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setAddressInput('');
    setAddressCoords(null);
    setIsEditingAddress(true);
  };

  const handleRouteToSavedPlace = async (type: 'home' | 'work') => {
    const place = savedPlaces[type];
    if (!place) return;
    setActiveAddressType(null);
    setDestinationCoords({ lat: place.lat, lon: place.lon, name: place.address });
    setFocusedLocation({ lat: place.lat, lon: place.lon });
    await requestRoute(
      place.lat,
      place.lon,
      'car',
      type === 'home' ? `Uy (${place.address})` : `Ishxona (${place.address})`,
      userCoords.lat,
      userCoords.lon,
      locale === 'ru' ? 'Мое местоположение' : locale === 'en' ? 'My location' : 'Mening joylashuvim'
    );
  };

  const handleViewSavedOnMap = (type: 'home' | 'work') => {
    const place = savedPlaces[type];
    if (!place) return;
    setActiveAddressType(null);
    setFocusedLocation({ lat: place.lat, lon: place.lon });
  };

  const handleUseCurrentLocation = () => {
    setAddressCoords({ lat: userCoords.lat, lon: userCoords.lon });
    setAddressInput(
      activeAddressType === 'home' 
        ? "Mening hozirgi joylashuvim (Uy)" 
        : "Mening hozirgi joylashuvim (Ish)"
    );
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
        className="hidden xl:flex flex-col items-center justify-between py-4 px-2 w-16 bg-white dark:bg-darkCard rounded-full shadow-soft border border-yolBorder dark:border-darkBorder my-2 ml-4 z-20 max-h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar"
      >
        {/* Top Dock Items */}
        <div className="flex flex-col items-center gap-3">
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

          {/* UY (Home) Manzili Tugmasi */}
          <button
            onClick={() => handleOpenAddressModal('home')}
            title={savedPlaces.home ? `Uy manzili: ${savedPlaces.home.address}` : "Uy manzilini kiritish / Marshrut"}
            className={`relative flex flex-col items-center gap-1 group transition-all spring-btn active:scale-90 ${activeAddressType === 'home' ? 'scale-105' : ''}`}
          >
            <div className={`relative w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 ${
              activeAddressType === 'home'
                ? 'bg-gradient-to-tr from-teal-600 to-emerald-600 ring-2 ring-emerald-400 shadow-emerald-500/50'
                : 'bg-gradient-to-tr from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700'
            }`}>
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {savedPlaces.home ? (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-white dark:border-darkCard"></span>
              ) : (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-white dark:border-darkCard animate-pulse"></span>
              )}
            </div>
            <span className="text-[10px] font-black text-teal-700 dark:text-teal-400 uppercase tracking-tight">
              Uy
            </span>
          </button>

          {/* ISH (Work) Manzili Tugmasi */}
          <button
            onClick={() => handleOpenAddressModal('work')}
            title={savedPlaces.work ? `Ishxona manzili: ${savedPlaces.work.address}` : "Ishxona manzilini kiritish / Marshrut"}
            className={`relative flex flex-col items-center gap-1 group transition-all spring-btn active:scale-90 ${activeAddressType === 'work' ? 'scale-105' : ''}`}
          >
            <div className={`relative w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 ${
              activeAddressType === 'work'
                ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 ring-2 ring-violet-400 shadow-violet-500/50'
                : 'bg-gradient-to-tr from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700'
            }`}>
              <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {savedPlaces.work ? (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-violet-300 border-2 border-white dark:border-darkCard"></span>
              ) : (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-white dark:border-darkCard animate-pulse"></span>
              )}
            </div>
            <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-tight">
              Ish
            </span>
          </button>

          {/* Divider */}
          <div className="w-8 h-px bg-yolBorder dark:bg-gray-700 my-0.5"></div>

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
        <div className="flex flex-col items-center gap-3 pt-2">
          {/* Theme / Contrast Toggle (Moved to very bottom as requested) */}
          <button
            onClick={toggleTheme}
            title={`Yorug'lik / Kontrast: ${theme}`}
            className="flex flex-col items-center gap-1 group text-textSecondary dark:text-darkTextSec hover:text-accentOrange transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-innerSoftArea dark:bg-gray-800 flex items-center justify-center group-hover:bg-orangeTint transition-colors spring-btn active:scale-90 shadow-xs border border-gray-200 dark:border-gray-700">
              {theme === 'light' ? (
                <Sun className="w-5 h-5 text-accentOrange" />
              ) : theme === 'dark' ? (
                <Moon className="w-5 h-5 text-yellow-400" />
              ) : (
                <Eye className="w-5 h-5 text-yellow-500" />
              )}
            </div>
            <span className="text-[9px] font-black tracking-tight uppercase">
              {theme === 'light' ? t('dock.day') : theme === 'dark' ? t('dock.night') : t('dock.contrast')}
            </span>
          </button>

          {/* Chiqish / Kirish */}
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

      {/* UY VA ISH MANZILI FLOATING POPOUT MODAL */}
      {activeAddressType && (
        <div 
          ref={addressPopoutRef}
          role="dialog"
          aria-label={activeAddressType === 'home' ? "Uy manzili" : "Ishxona manzili"}
          className="fixed left-24 top-16 sm:top-20 z-50 w-84 sm:w-96 bg-white dark:bg-darkCard rounded-3xl shadow-float border border-yolBorder dark:border-darkBorder p-4 sm:p-5 flex flex-col max-h-[85vh] overflow-hidden animate-scale-up backdrop-blur-md"
        >
          {/* Header & Tabs */}
          <div className="flex items-center justify-between pb-3 border-b border-yolBorder dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenAddressModal('home')}
                className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all ${
                  activeAddressType === 'home'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-innerSoftArea dark:bg-gray-800 text-textSecondary dark:text-darkTextSec hover:text-textPrimary'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Uy manzili</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenAddressModal('work')}
                className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all ${
                  activeAddressType === 'work'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-innerSoftArea dark:bg-gray-800 text-textSecondary dark:text-darkTextSec hover:text-textPrimary'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Ishxona</span>
              </button>
            </div>
            <button
              onClick={() => setActiveAddressType(null)}
              className="w-8 h-8 rounded-full bg-innerSoftArea dark:bg-gray-800 flex items-center justify-center text-textSecondary dark:text-darkTextSec hover:text-textPrimary spring-btn active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Success Toast Banner */}
          {saveSuccessMsg && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-scale-up">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {activeAddressType === 'home' ? 'Uy manzili' : 'Ishxona manzili'} muvaffaqiyatli saqlandi!
              </span>
            </div>
          )}

          {/* VIEW MODE: If address already saved and not in edit mode */}
          {!isEditingAddress && savedPlaces[activeAddressType] ? (
            <div className="flex-1 overflow-y-auto space-y-4 my-3 pr-1">
              {/* Saved Address Info Card */}
              <div className="p-4 rounded-2xl bg-innerSoftArea dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs ${
                    activeAddressType === 'home'
                      ? 'bg-gradient-to-tr from-teal-500 to-emerald-600'
                      : 'bg-gradient-to-tr from-indigo-500 to-violet-600'
                  }`}>
                    {activeAddressType === 'home' ? <Home className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary dark:text-darkTextSec">
                      {activeAddressType === 'home' ? 'Saqlangan Uy manzili' : 'Saqlangan Ishxona manzili'}
                    </span>
                    <h4 className="font-extrabold text-sm text-textPrimary dark:text-darkText leading-tight mt-0.5 break-words">
                      {savedPlaces[activeAddressType]?.address}
                    </h4>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-textSecondary dark:text-darkTextSec font-medium">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 font-mono">
                        <MapPin className="w-2.5 h-2.5" />
                        {savedPlaces[activeAddressType]?.lat.toFixed(4)}, {savedPlaces[activeAddressType]?.lon.toFixed(4)}
                      </span>
                      {savedPlaces[activeAddressType]?.updatedAt && (
                        <span>So'nggi yangilanish: {savedPlaces[activeAddressType]?.updatedAt}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Route Button */}
                <button
                  type="button"
                  onClick={() => handleRouteToSavedPlace(activeAddressType)}
                  className={`w-full py-2.5 px-4 rounded-2xl text-white font-black text-xs flex items-center justify-center gap-2 shadow-md spring-btn active:scale-95 transition-all ${
                    activeAddressType === 'home'
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-violet-500/30'
                  }`}
                >
                  <Navigation className="w-4 h-4" />
                  <span>
                    {activeAddressType === 'home' ? "Uyga marshrut tuzish (Borish)" : "Ishxonaga marshrut tuzish (Borish)"}
                  </span>
                </button>

                {/* Secondary Actions: Map view, Edit, Delete */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 text-xs">
                  <button
                    type="button"
                    onClick={() => handleViewSavedOnMap(activeAddressType)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-textPrimary dark:text-darkText font-bold text-[11px] hover:border-accentOrange spring-btn active:scale-95 flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-accentOrange" />
                    <span>Xaritada</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(true)}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-textPrimary dark:text-darkText font-bold text-[11px] hover:bg-gray-200 dark:hover:bg-gray-600 spring-btn active:scale-95 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3 text-textSecondary" />
                      <span>Tahrirlash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(activeAddressType)}
                      title="Manzilni o'chirish"
                      className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 spring-btn active:scale-90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT / INPUT MODE: Enter address */
            <div className="flex-1 overflow-y-auto space-y-3.5 my-3 pr-1">
              <div>
                <label className="block text-xs font-black text-textPrimary dark:text-darkText mb-1.5">
                  {activeAddressType === 'home' 
                    ? "Uy manzilingizni kiriting:" 
                    : "Ishxona manzilingizni kiriting:"}
                </label>
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-textSecondary absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder={activeAddressType === 'home' ? "Masalan: Chilonzor 9-mavze, 24-uy" : "Masalan: Tashkent City, 7-bino"}
                    className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-innerSoftArea dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-textPrimary dark:text-darkText focus:outline-hidden focus:ring-2 focus:ring-accentOrange transition-all"
                  />
                  {addressInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setAddressInput('');
                        setAddressCoords(null);
                        setSearchResults([]);
                      }}
                      className="absolute right-2.5 p-1 rounded-full text-textSecondary hover:text-textPrimary"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Use current GPS button */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="w-full py-2 px-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-accentOrange font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors spring-btn active:scale-95"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Mening hozirgi joylashuvimni belgilash</span>
              </button>

              {/* Live Search Results */}
              {isSearching && (
                <div className="py-2 text-center text-xs text-textSecondary flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-accentOrange border-t-transparent rounded-full animate-spin"></div>
                  <span>Manzillar qidirilmoqda...</span>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-textSecondary dark:text-darkTextSec">
                    Topilgan manzillar:
                  </span>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {searchResults.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAddressInput(item.address);
                          setAddressCoords({ lat: item.lat, lon: item.lon });
                          setSearchResults([]);
                        }}
                        className="w-full p-2 text-left rounded-xl bg-innerSoftArea dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-700 border border-transparent hover:border-accentOrange transition-all text-xs font-semibold flex items-center gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-accentOrange shrink-0" />
                        <span className="truncate">{item.address}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Presets */}
              {searchResults.length === 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase text-textSecondary dark:text-darkTextSec flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Tezkor tanlovlar (Toshkent):</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(activeAddressType === 'home' ? HOME_PRESETS : WORK_PRESETS).map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAddressInput(p.address);
                          setAddressCoords({ lat: p.lat, lon: p.lon });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-innerSoftArea dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-[11px] font-semibold text-textPrimary dark:text-darkText transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Save & Cancel */}
              <div className="flex items-center gap-2 pt-2 border-t border-yolBorder dark:border-gray-700">
                {savedPlaces[activeAddressType] && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingAddress(false);
                      setAddressInput(savedPlaces[activeAddressType]?.address || '');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-textSecondary dark:text-darkTextSec font-bold text-xs hover:text-textPrimary transition-colors"
                  >
                    Bekor qilish
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  disabled={!addressInput.trim()}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
                    addressInput.trim()
                      ? activeAddressType === 'home'
                        ? 'bg-teal-600 hover:bg-teal-700 spring-btn active:scale-95'
                        : 'bg-indigo-600 hover:bg-indigo-700 spring-btn active:scale-95'
                      : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Manzilni saqlash</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="pt-2 border-t border-yolBorder dark:border-gray-700 flex items-center justify-between text-[10px] text-textSecondary dark:text-darkTextSec">
            <span>NaviGo Shaxsiy Manzillar</span>
            <button
              onClick={() => setActiveAddressType(null)}
              className="font-bold hover:underline"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* POPULAR LOCATIONS FLOATING POPOUT CARD */}
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
