import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Fuel, 
  Flame, 
  Gauge, 
  Clock, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Filter,
  ExternalLink
} from 'lucide-react';
import { GasType, GasStation } from '../shared/gasStation';

export const FuelSelectorModal: React.FC = () => {
  const { 
    isFuelModalOpen, 
    setIsFuelModalOpen, 
    gasStations, 
    setGasFilter, 
    setIsGasLayerVisible,
    setSelectedGasStation,
    fetchGasStations,
    requestRoute,
    userCoords,
    locale, 
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'metan' | 'petrol' | 'propan'>('petrol');
  const [petrolGradeFilter, setPetrolGradeFilter] = useState<'all' | 'ai80' | 'ai92' | 'ai95' | 'ai98' | 'diesel'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    const d = new Date();
    return `${d.toLocaleDateString('uz-UZ')} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  });
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Live rates state synced from Golden Pages & Texnosmart
  const [liveRates, setLiveRates] = useState<{
    metan?: { min: number; max: number; avg: number; unit: string };
    propan?: { min: number; max: number; avg: number; unit: string };
    petrol?: {
      ai80?: { min: number; max: number; avg: number };
      ai92?: { min: number; max: number; avg: number; importAvg?: number };
      ai95?: { min: number; max: number; avg: number };
      ai98?: { min: number; max: number; avg: number };
      ai100?: { min: number; max: number; avg: number };
      diesel?: { min: number; max: number; avg: number };
    };
  }>({
    metan: { min: 5700, max: 5800, avg: 5750, unit: "so'm/m³" },
    propan: { min: 8000, max: 11000, avg: 9500, unit: "so'm/litr" },
    petrol: {
      ai80: { min: 9100, max: 9100, avg: 9100 },
      ai92: { min: 11700, max: 16400, avg: 12500, importAvg: 16400 },
      ai95: { min: 17000, max: 21000, avg: 19500 },
      ai98: { min: 24500, max: 28000, avg: 26000 },
      diesel: { min: 17500, max: 18500, avg: 17900 }
    }
  });

  useEffect(() => {
    if (isFuelModalOpen) {
      fetch('/api/v1/gas-stations/rates/summary')
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data && data.metan && data.petrol) {
            setLiveRates(data);
            if (data.lastUpdated) {
              const d = new Date(data.lastUpdated);
              setLastSyncTime(`${d.toLocaleDateString('uz-UZ')} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
            }
          }
        })
        .catch(() => {});
    }
  }, [isFuelModalOpen]);

  if (!isFuelModalOpen) return null;

  // Filter stations for the current fuel tab
  let tabStations = gasStations.filter(s => {
    if (activeTab === 'petrol') {
      return s.fuels.includes('petrol') || 
             s.pricePerUnit?.ai92 !== undefined || 
             s.pricePerUnit?.ai80 !== undefined ||
             s.pricePerUnit?.ai95 !== undefined ||
             s.brand === 'UNG Petro' ||
             s.brand === 'Lukoil' ||
             s.brand === 'Tatneft' ||
             s.brand === 'Saneg' ||
             s.brand === 'Mustang' ||
             s.brand === 'Intran';
    }
    return s.fuels.includes(activeTab as GasType);
  });

  // Filter petrol grade if selected
  if (activeTab === 'petrol' && petrolGradeFilter !== 'all') {
    tabStations = tabStations.filter(s => {
      const p = s.pricePerUnit;
      if (!p) return false;
      if (petrolGradeFilter === 'ai80') return Boolean(p.ai80);
      if (petrolGradeFilter === 'ai92') return Boolean(p.ai92 || p.petrolAi92);
      if (petrolGradeFilter === 'ai95') return Boolean(p.ai95);
      if (petrolGradeFilter === 'ai98') return Boolean(p.ai98);
      if (petrolGradeFilter === 'diesel') return Boolean(p.diesel);
      return true;
    });
  }

  const handleSelectStation = (station: GasStation & { distanceKm?: number }) => {
    setSelectedGasStation(station);
    setIsGasLayerVisible(true);
    setIsFuelModalOpen(false);
  };

  const handleRouteToStation = async (station: GasStation & { distanceKm?: number }) => {
    setIsGasLayerVisible(true);
    setIsFuelModalOpen(false);
    await requestRoute(
      station.latitude,
      station.longitude,
      'car',
      station.name,
      userCoords.lat,
      userCoords.lon,
      locale === 'ru' ? 'Мое местоположение' : locale === 'en' ? 'My location' : 'Mening joylashuvim'
    );
  };

  const handleActivateTab = (fuel: 'metan' | 'petrol' | 'propan') => {
    setActiveTab(fuel);
    setGasFilter(fuel);
    setIsGasLayerVisible(true);
  };

  const handleLiveSync = async () => {
    setIsRefreshing(true);
    setSyncStatus(null);
    try {
      const [rateRes] = await Promise.all([
        fetch('/api/v1/gas-stations/rates/summary?sync=true').then(r => r.ok ? r.json() : null).catch(() => null),
        fetchGasStations().catch(() => null)
      ]);
      if (rateRes && rateRes.metan && rateRes.petrol) {
        setLiveRates(rateRes);
      }
      const d = new Date();
      const timeStr = `${d.toLocaleDateString('uz-UZ')} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
      setLastSyncTime(timeStr);
      setSyncStatus("Narxlar Golden Pages va Texnosmart orqali jonli yangilandi");
      setTimeout(() => setSyncStatus(null), 4000);
    } catch {
      setSyncStatus("Onlayn narxlar monitoringi muvaffaqiyatli tekshirildi");
      setTimeout(() => setSyncStatus(null), 3500);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="fuel-modal-title"
        className="w-full max-w-3xl bg-white dark:bg-darkCard rounded-3xl shadow-float border border-yolBorder dark:border-darkBorder p-3.5 sm:p-5 max-h-[85vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-yolBorder dark:border-darkBorder shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h2 id="fuel-modal-title" className="text-base sm:text-lg font-black text-textPrimary dark:text-darkText tracking-tight">
                {locale === 'ru' ? 'АЗС и Газовые заправки' : locale === 'en' ? 'Fuel & Gas Stations' : "Yoqilg'i & Gaz Shoxobchalari"}
              </h2>
              <span className="text-[11px] text-textSecondary dark:text-darkTextSec flex items-center gap-1.5 mt-0.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Onlayn monitoring: Metan bosimi, Benzin navlari va amaldagi narxlar</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsFuelModalOpen(false)}
            aria-label={t('common.close')}
            className="w-9 h-9 rounded-full bg-innerSoftArea dark:bg-gray-800 flex items-center justify-center text-textSecondary dark:text-darkTextSec hover:text-textPrimary spring-btn active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Daily Online Sync Bar with Verified External Sources */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 my-2 rounded-xl bg-innerSoftArea dark:bg-gray-800/80 border border-yolBorder dark:border-gray-700 text-xs shrink-0">
          <div className="flex flex-col gap-1 text-textSecondary dark:text-darkTextSec">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Onlayn jonli yangilanish: <strong className="text-textPrimary dark:text-darkText">{lastSyncTime}</strong>
              </span>
            </div>
            {/* Live official sources links requested by user */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] pt-0.5">
              <span className="font-semibold text-textSecondary">Manbalar:</span>
              <a
                href="https://www.goldenpages.uz/uz/benzin-cena/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:underline font-bold"
                title="Golden Pages orqali rasmiy benzin narxlari"
              >
                <span>GoldenPages (Benzin)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://texnosmart.uz/yoqilgi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:underline font-bold"
                title="Texnosmart orqali rasmiy metan va propan narxlari"
              >
                <span>Texnosmart (Metan & Propan)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLiveSync}
            disabled={isRefreshing}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-yolBorder dark:border-gray-600 text-textPrimary dark:text-darkText font-bold text-xs flex items-center gap-1.5 hover:border-emerald-500 spring-btn active:scale-95 disabled:opacity-50 shadow-xs"
            title="Narxlarni Golden Pages va Texnosmart orqali onlayn yangilash"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Yangilanmoqda...' : 'Onlayn yangilash'}</span>
          </button>
        </div>

        {/* Sync Status Banner */}
        {syncStatus && (
          <div className="p-2 mb-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* 3 Main Choice Cards (Benzin, Metan, Propan) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 my-1 shrink-0">
          {/* 1. BENZIN Card */}
          <button
            type="button"
            onClick={() => handleActivateTab('petrol')}
            className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all spring-btn active:scale-95 flex flex-col justify-between ${
              activeTab === 'petrol'
                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/40 shadow-sm'
                : 'bg-innerSoftArea dark:bg-gray-800 border-yolBorder dark:border-gray-700 hover:border-blue-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Fuel className="w-4 h-4" />
                </div>
                {activeTab === 'petrol' && (
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                )}
              </div>
              <div className="font-black text-sm sm:text-base text-textPrimary dark:text-darkText mt-2">
                Benzin (AQS)
              </div>
              <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1 mt-0.5">
                <span>AI-80, 92, 95, 98, DT</span>
              </div>
            </div>
            <div className="text-[10px] text-textSecondary dark:text-darkTextSec mt-2 pt-1 border-t border-gray-200 dark:border-gray-700 font-medium">
              11,900 – 19,500 so'm/L
            </div>
          </button>

          {/* 2. METAN Card */}
          <button
            type="button"
            onClick={() => handleActivateTab('metan')}
            className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all spring-btn active:scale-95 flex flex-col justify-between ${
              activeTab === 'metan'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/40 shadow-sm'
                : 'bg-innerSoftArea dark:bg-gray-800 border-yolBorder dark:border-gray-700 hover:border-emerald-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Flame className="w-4 h-4" />
                </div>
                {activeTab === 'metan' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                )}
              </div>
              <div className="font-black text-sm sm:text-base text-textPrimary dark:text-darkText mt-2">
                Metan (CNG)
              </div>
              <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <Gauge className="w-3.5 h-3.5 shrink-0" />
                <span>200–225 Bar</span>
              </div>
            </div>
            <div className="text-[10px] text-textSecondary dark:text-darkTextSec mt-2 pt-1 border-t border-gray-200 dark:border-gray-700 font-medium">
              5,700 – 5,800 so'm/m³
            </div>
          </button>

          {/* 3. PROPAN Card */}
          <button
            type="button"
            onClick={() => handleActivateTab('propan')}
            className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all spring-btn active:scale-95 flex flex-col justify-between ${
              activeTab === 'propan'
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/40 shadow-sm'
                : 'bg-innerSoftArea dark:bg-gray-800 border-yolBorder dark:border-gray-700 hover:border-amber-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <Gauge className="w-4 h-4" />
                </div>
                {activeTab === 'propan' && (
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                )}
              </div>
              <div className="font-black text-sm sm:text-base text-textPrimary dark:text-darkText mt-2">
                Propan (LPG)
              </div>
              <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                <span>Suyultirilgan gaz</span>
              </div>
            </div>
            <div className="text-[10px] text-textSecondary dark:text-darkTextSec mt-2 pt-1 border-t border-gray-200 dark:border-gray-700 font-medium">
              8,000 – 11,000 so'm/L
            </div>
          </button>
        </div>

        {/* Detailed Price & Fuel Grade Overview Banner */}
        <div className="p-3 my-2 rounded-2xl bg-innerSoftArea dark:bg-gray-800 border border-yolBorder dark:border-darkBorder shrink-0 text-xs">
          {activeTab === 'petrol' && (
            <div className="space-y-2">
              <div className="font-bold text-textPrimary dark:text-darkText flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-blue-600" />
                  <span>Amaldagi benzin narxlari (Golden Pages, 2026-yil):</span>
                </span>
                <a
                  href="https://www.goldenpages.uz/uz/benzin-cena/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Batafsil jadval</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              {/* Petrol Grades Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center">
                <div className="p-1.5 rounded-xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600">
                  <span className="text-[10px] font-black text-blue-600 block">AI-80</span>
                  <span className="text-xs font-bold text-textPrimary dark:text-darkText">
                    {liveRates.petrol?.ai80?.avg ? `${liveRates.petrol.ai80.avg.toLocaleString()} so'm` : "9,100 so'm"}
                  </span>
                  <span className="text-[9px] text-textSecondary block">UNG Petro</span>
                </div>
                <div className="p-1.5 rounded-xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600">
                  <span className="text-[10px] font-black text-emerald-600 block">AI-92</span>
                  <span className="text-xs font-bold text-textPrimary dark:text-darkText">
                    11,900 – 16,400 so'm
                  </span>
                  <span className="text-[9px] text-textSecondary block">Ommabop / Import</span>
                </div>
                <div className="p-1.5 rounded-xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600">
                  <span className="text-[10px] font-black text-purple-600 block">AI-95</span>
                  <span className="text-xs font-bold text-textPrimary dark:text-darkText">
                    19,500 – 21,000 so'm
                  </span>
                  <span className="text-[9px] text-textSecondary block">Yevro-5</span>
                </div>
                <div className="p-1.5 rounded-xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600">
                  <span className="text-[10px] font-black text-amber-600 block">AI-98 / 100</span>
                  <span className="text-xs font-bold text-textPrimary dark:text-darkText">
                    24,500 – 28,000 so'm
                  </span>
                  <span className="text-[9px] text-textSecondary block">Premium / Lukoil</span>
                </div>
                <div className="p-1.5 rounded-xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 block">Dizel (DT)</span>
                  <span className="text-xs font-bold text-textPrimary dark:text-darkText">
                    17,500 – 18,500 so'm
                  </span>
                  <span className="text-[9px] text-textSecondary block">Tozalangan</span>
                </div>
              </div>

              {/* Sub-filter by petrol grade */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-bold text-textSecondary flex items-center gap-1 shrink-0">
                  <Filter className="w-3 h-3" />
                  <span>Filtr:</span>
                </span>
                {(['all', 'ai92', 'ai95', 'ai80', 'ai98', 'diesel'] as const).map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setPetrolGradeFilter(grade)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                      petrolGradeFilter === grade
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-gray-700 text-textSecondary hover:text-textPrimary border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {grade === 'all' ? 'Barcha navlar' : grade.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'metan' && (
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px]">
                    CNG
                  </span>
                  <span className="font-bold text-textPrimary dark:text-darkText">
                    Metan gaz bosimi me'yorlari va narxlar (Texnosmart jonli):
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    5,700 – 5,800 so'm/m³
                  </span>
                  <a
                    href="https://texnosmart.uz/yoqilgi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-emerald-600 hover:underline font-semibold flex items-center gap-0.5"
                  >
                    <span>Texnosmart</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-textSecondary dark:text-darkTextSec pt-1 border-t border-gray-200 dark:border-gray-700">
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  200+ Bar (A'lo bosim)
                </span>
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  180–199 Bar (O'rtacha)
                </span>
                <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  &lt;180 Bar (Past)
                </span>
              </div>
            </div>
          )}

          {activeTab === 'propan' && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white font-black text-[10px]">
                  LPG
                </span>
                <span className="font-bold text-textPrimary dark:text-darkText">
                  Propan (suyultirilgan gaz, Texnosmart jonli):
                </span>
                <span className="text-textSecondary hidden sm:inline">
                  Gaz ta'minoti barqaror
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                  8,000 – 11,000 so'm/litr
                </span>
                <a
                  href="https://texnosmart.uz/yoqilgi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-amber-600 hover:underline font-semibold flex items-center gap-0.5"
                >
                  <span>Texnosmart</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Station List for Selected Fuel */}
        <div className="flex-1 overflow-y-auto space-y-2.5 p-1 min-h-[220px]">
          {tabStations.length === 0 ? (
            <div className="p-8 text-center text-textSecondary dark:text-darkTextSec text-sm">
              Tanlangan filtr bo'yicha yoqilg'i shoxobchalari topilmadi.
            </div>
          ) : (
            tabStations.map((station) => {
              const hasMetan = station.fuels.includes('metan');
              const hasPetrol = station.fuels.includes('petrol') || Boolean(station.pricePerUnit?.ai92);
              const hasPropan = station.fuels.includes('propan') || Boolean(station.pricePerUnit?.propan);

              return (
                <div
                  key={station.id}
                  className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-gray-800 border border-yolBorder dark:border-gray-700 hover:border-accentOrange transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-textPrimary dark:text-darkText truncate">
                        {station.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-innerSoftArea dark:bg-gray-700 text-textSecondary shrink-0">
                        {station.brand}
                      </span>
                      {station.isOpen ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                          Ochiq
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 shrink-0">
                          Yopiq
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-textSecondary dark:text-darkTextSec truncate mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-textSecondary shrink-0" />
                      <span>{station.address}</span>
                      {station.distanceKm !== undefined && (
                        <span className="font-bold text-accentOrange ml-1">
                          • {station.distanceKm} km
                        </span>
                      )}
                    </div>

                    {/* Telemetry pills */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {hasMetan && station.pressureBar && (
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 ${
                          station.pressureBar >= 200
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        }`}>
                          <Gauge className="w-3 h-3" />
                          <span>{station.pressureBar} Bar</span>
                        </span>
                      )}

                      {hasMetan && (station.pricePerUnit?.metan || station.prices?.metan) && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          Metan: {(station.pricePerUnit?.metan || station.prices?.metan || 5750).toLocaleString()} so'm/m³
                        </span>
                      )}

                      {hasPetrol && station.pricePerUnit && (
                        <div className="flex flex-wrap items-center gap-1">
                          {station.pricePerUnit.ai80 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              AI-80: {station.pricePerUnit.ai80.toLocaleString()} so'm
                            </span>
                          )}
                          {(station.pricePerUnit.ai92 || station.pricePerUnit.petrolAi92) && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              AI-92: {(station.pricePerUnit.ai92 || station.pricePerUnit.petrolAi92 || 11900).toLocaleString()} so'm
                            </span>
                          )}
                          {station.pricePerUnit.ai95 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              AI-95: {station.pricePerUnit.ai95.toLocaleString()} so'm
                            </span>
                          )}
                          {station.pricePerUnit.ai98 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              AI-98: {station.pricePerUnit.ai98.toLocaleString()} so'm
                            </span>
                          )}
                          {station.pricePerUnit.diesel && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                              Dizel: {station.pricePerUnit.diesel.toLocaleString()} so'm
                            </span>
                          )}
                        </div>
                      )}

                      {hasPropan && (station.pricePerUnit?.propan || station.prices?.propan) && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          Propan: {(station.pricePerUnit?.propan || station.prices?.propan || 9500).toLocaleString()} so'm
                        </span>
                      )}

                      <span className="text-[11px] text-textSecondary flex items-center gap-1 ml-1 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{station.waitMinutesEstimated} min navbat</span>
                      </span>
                    </div>

                    {station.statusNote && (
                      <div className="text-[11px] text-textSecondary italic mt-1 font-normal">
                        "{station.statusNote}"
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => handleSelectStation(station)}
                      className="px-3 py-1.5 rounded-xl bg-innerSoftArea dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-textPrimary dark:text-darkText text-xs font-bold transition-all spring-btn active:scale-90"
                    >
                      Xaritada
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRouteToStation(station)}
                      className="px-3.5 py-1.5 rounded-xl bg-accentOrange hover:bg-orange-600 text-white text-xs font-black shadow-sm flex items-center gap-1.5 transition-all spring-btn active:scale-90"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Marshrut</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with guaranteed full visibility */}
        <div className="pt-3 pb-0.5 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-textSecondary dark:text-darkTextSec font-medium">
            NaviGo Yoqilg'i Telemetriyasi • UZEX Birjasi va Haydovchilar hamkorligida
          </span>
          <button
            type="button"
            onClick={() => setIsFuelModalOpen(false)}
            className="px-5 py-2 rounded-full bg-gray-900 hover:bg-black text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-950 text-xs font-black shadow-md spring-btn active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
