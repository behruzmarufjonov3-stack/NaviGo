import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Fuel, Flame, Gauge, Clock, MapPin, Navigation, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { GasType, GasStation } from '../shared/gasStation';

export const FuelSelectorModal: React.FC = () => {
  const { 
    isFuelModalOpen, 
    setIsFuelModalOpen, 
    gasStations, 
    gasFilter, 
    setGasFilter, 
    setIsGasLayerVisible,
    setSelectedGasStation,
    requestRoute,
    userCoords,
    locale,
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'metan' | 'petrol' | 'propan'>('metan');

  if (!isFuelModalOpen) return null;

  // Filter stations for the current tab
  const tabStations = gasStations.filter(s => s.fuels.includes(activeTab as GasType));

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

  const handleActivateFilter = (fuel: 'metan' | 'petrol' | 'propan') => {
    setActiveTab(fuel);
    setGasFilter(fuel);
    setIsGasLayerVisible(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="fuel-modal-title"
        className="w-full max-w-2xl bg-white dark:bg-darkCard rounded-panel shadow-float border border-yolBorder dark:border-darkBorder p-4 sm:p-6 max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-yolBorder dark:border-darkBorder shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <h2 id="fuel-modal-title" className="text-lg sm:text-xl font-black text-textPrimary dark:text-darkText tracking-tight">
                {locale === 'ru' ? 'АЗС и Газовые заправки' : locale === 'en' ? 'Fuel & Gas Stations' : "Yoqilg'i & Gaz Shoxobchalari"}
              </h2>
              <span className="text-xs text-textSecondary dark:text-darkTextSec flex items-center gap-1.5 mt-0.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{locale === 'ru' ? 'Давление метана, наличие бензина и цены в реальном времени' : locale === 'en' ? 'Live CNG pressure, petrol grades & prices' : "Real vaqtdagi metan bosimi, benzin navlari va narxlar"}</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsFuelModalOpen(false)}
            aria-label={t('common.close')}
            className="w-10 h-10 rounded-full bg-innerSoftArea dark:bg-gray-800 flex items-center justify-center text-textSecondary dark:text-darkTextSec hover:text-textPrimary spring-btn active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Main Choice Cards (Metan, Benzin, Propan) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 my-3 sm:my-4 shrink-0">
          {/* 1. METAN Card */}
          <button
            type="button"
            onClick={() => handleActivateFilter('metan')}
            className={`p-2.5 sm:p-3.5 rounded-2xl border text-left transition-all spring-btn active:scale-95 flex flex-col justify-between ${
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
            <div className="text-[10px] text-textSecondary dark:text-darkTextSec mt-2 pt-1 border-t border-gray-200 dark:border-gray-700">
              ~3,750 so'm / m³
            </div>
          </button>

          {/* 2. BENZIN Card */}
          <button
            type="button"
            onClick={() => handleActivateFilter('petrol')}
            className={`p-2.5 sm:p-3.5 rounded-2xl border text-left transition-all spring-btn active:scale-95 flex flex-col justify-between ${
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
                <span>AI-80, 92, 95, DT</span>
              </div>
            </div>
            <div className="text-[10px] text-textSecondary dark:text-darkTextSec mt-2 pt-1 border-t border-gray-200 dark:border-gray-700">
              8,500 – 12,500 so'm
            </div>
          </button>

          {/* 3. PROPAN Card */}
          <button
            type="button"
            onClick={() => handleActivateFilter('propan')}
            className={`p-2.5 sm:p-3.5 rounded-2xl border text-left transition-all spring-btn active:scale-95 flex flex-col justify-between ${
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
            <div className="text-[10px] text-textSecondary dark:text-darkTextSec mt-2 pt-1 border-t border-gray-200 dark:border-gray-700">
              5,200 so'm / litr
            </div>
          </button>
        </div>

        {/* Detailed Price & Fuel Grade Overview Banner */}
        <div className="p-3 rounded-2xl bg-innerSoftArea dark:bg-gray-800 border border-yolBorder dark:border-darkBorder shrink-0 mb-3 text-xs">
          {activeTab === 'metan' && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px]">
                  CNG
                </span>
                <span className="font-bold text-textPrimary dark:text-darkText">
                  Metan gaz bosimi me'yorlari:
                </span>
                <span className="text-textSecondary">
                  🟢 200+ Bar (A'lo) • 🟡 180–199 Bar (O'rtacha) • 🔴 &lt;180 Bar (Past)
                </span>
              </div>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                3,750 – 3,800 so'm/m³
              </span>
            </div>
          )}

          {activeTab === 'petrol' && (
            <div className="space-y-1.5">
              <div className="font-bold text-textPrimary dark:text-darkText flex items-center justify-between">
                <span>Benzin turlari va amaldagi o'rtacha narxlar:</span>
                <span className="text-[10px] text-textSecondary">Toshkent & Respublika</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center">
                <div className="p-1.5 rounded-xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600">
                  <span className="text-[10px] font-black text-blue-600 block">AI-80</span>
                  <span className="text-xs font-bold text-textPrimary dark:text-darkText">8,500 so'm</span>
                </div>
                <div className="p-1.5 rounded-xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600">
                  <span className="text-[10px] font-black text-emerald-600 block">AI-92</span>
                  <span className="text-xs font-bold text-textPrimary dark:text-darkText">9,800 so'm</span>
                </div>
                <div className="p-1.5 rounded-xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600">
                  <span className="text-[10px] font-black text-purple-600 block">AI-95</span>
                  <span className="text-xs font-bold text-textPrimary dark:text-darkText">12,500 so'm</span>
                </div>
                <div className="p-1.5 rounded-xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600">
                  <span className="text-[10px] font-black text-amber-600 block">AI-98</span>
                  <span className="text-xs font-bold text-textPrimary dark:text-darkText">14,800 so'm</span>
                </div>
                <div className="p-1.5 rounded-xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 block">Dizel</span>
                  <span className="text-xs font-bold text-textPrimary dark:text-darkText">11,500 so'm</span>
                </div>
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
                  Propan (suyultirilgan gaz):
                </span>
                <span className="text-textSecondary">
                  Gaz ta'minoti barqaror, barcha shoxobchalarda mavjud
                </span>
              </div>
              <span className="font-mono font-black text-amber-600 dark:text-amber-400">
                5,200 – 5,400 so'm/litr
              </span>
            </div>
          )}
        </div>

        {/* Station List for Selected Fuel */}
        <div className="flex-1 overflow-y-auto space-y-2.5 p-1 min-h-[220px]">
          {tabStations.length === 0 ? (
            <div className="p-8 text-center text-textSecondary dark:text-darkTextSec text-sm">
              Ushbu turdagi yoqilg'i shoxobchalari topilmadi.
            </div>
          ) : (
            tabStations.map((station) => {
              const hasMetan = station.fuels.includes('metan');
              const hasPetrol = station.fuels.includes('petrol');
              const hasPropan = station.fuels.includes('propan');

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

                    <div className="text-xs text-textSecondary dark:text-darkTextSec truncate mt-0.5">
                      {station.address}
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

                      {hasPetrol && (
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            AI-92: {station.pricePerUnit.ai92 || station.pricePerUnit.petrolAi92 || 9800} so'm
                          </span>
                          {station.pricePerUnit.ai95 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                              AI-95: {station.pricePerUnit.ai95} so'm
                            </span>
                          )}
                        </div>
                      )}

                      {hasPropan && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          Propan: {station.pricePerUnit.propan || 5200} so'm
                        </span>
                      )}

                      <span className="text-[11px] text-textSecondary flex items-center gap-1 ml-1">
                        <Clock className="w-3 h-3" />
                        <span>{station.waitMinutesEstimated} min navbat</span>
                      </span>
                    </div>
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

        {/* Footer */}
        <div className="pt-3 border-t border-yolBorder dark:border-darkBorder flex items-center justify-between shrink-0">
          <span className="text-[11px] text-textSecondary dark:text-darkTextSec">
            NaviGo Yoqilg'i Telemetriyasi • Haydovchilar tomonidan tekshirilgan
          </span>
          <button
            type="button"
            onClick={() => setIsFuelModalOpen(false)}
            className="px-4 py-2 rounded-full bg-blackPill text-white text-xs font-bold spring-btn active:scale-95"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
