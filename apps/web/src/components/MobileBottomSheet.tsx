import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ChevronUp, 
  ChevronDown, 
  MapPin, 
  FileText, 
  HelpCircle, 
  Settings, 
  Plus,
  Truck,
  Fuel
} from 'lucide-react';

export const MobileBottomSheet: React.FC = () => {
  const { 
    features, 
    weather, 
    airQuality, 
    activeRoute,
    userCoords,
    setFocusedLocation,
    activeTab, 
    setActiveTab, 
    setIsReportingOpen,
    setIsFuelModalOpen,
    t 
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);

  const activeWeather = activeRoute?.destinationWeather || weather;
  const activeAqi = activeRoute?.destinationAirQuality || airQuality;
  const displayedFeatures = activeRoute
    ? (activeRoute.routeIncidents || [])
    : features.filter(
        f => Boolean(f.linkedReportId) || Math.hypot(f.latitude - userCoords.lat, f.longitude - userCoords.lon) <= 0.25
      );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none">
      {/* Compact Floating Action Pills on Mobile: SOS, Zapravka & Report */}
      <div className="mb-2 px-3 w-full flex items-center justify-center gap-2 pointer-events-auto">
        <a
          href="#/ambulance"
          className="flex items-center gap-1.5 bg-accentOrange hover:bg-orange-600 text-white px-3 py-1.5 rounded-full shadow-md font-extrabold text-[11px] border border-white/40 whitespace-nowrap active:scale-95 transition-all"
        >
          <Truck className="w-3.5 h-3.5 text-white shrink-0" />
          <span>SOS (103)</span>
        </a>

        <button
          onClick={() => setIsFuelModalOpen(true)}
          className="flex items-center gap-1.5 bg-white dark:bg-darkCard text-textPrimary dark:text-darkText px-3 py-1.5 rounded-full shadow-md font-extrabold text-[11px] border border-yolBorder dark:border-darkBorder whitespace-nowrap active:scale-95 transition-all"
        >
          <Fuel className="w-3.5 h-3.5 text-accentOrange shrink-0" />
          <span>Zapravka</span>
        </button>

        <button
          onClick={() => setIsReportingOpen(true)}
          className="flex items-center gap-1.5 bg-blackPill text-white px-3 py-1.5 rounded-full shadow-md font-bold text-[11px] border border-white/20 whitespace-nowrap active:scale-95 transition-all"
        >
          <div className="w-4 h-4 rounded-full bg-accentOrange flex items-center justify-center text-white shrink-0">
            <Plus className="w-3 h-3 stroke-[3]" />
          </div>
          <span>Xabar berish</span>
        </button>
      </div>

      {/* Bottom Sheet Card */}
      <div className="w-full bg-white dark:bg-darkCard rounded-t-[24px] shadow-float border-t border-yolBorder dark:border-darkBorder transition-all duration-300 pointer-events-auto">
        {/* Drag Handle & Summary Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full pt-2.5 pb-2 px-4 flex flex-col items-center justify-center text-center cursor-pointer"
        >
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700 mb-1.5"></div>
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1.5 text-left min-w-0">
              <span className="w-2 h-2 rounded-full bg-accentOrange animate-ping shrink-0"></span>
              <span className="text-xs font-extrabold text-textPrimary dark:text-darkText truncate">
                {displayedFeatures.length} {t('roads.summarySuffix')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {activeWeather && (
                <span className="text-[11px] font-bold text-textSecondary dark:text-darkTextSec whitespace-nowrap">
                  {activeWeather.city}: {activeWeather.temperatureC > 0 ? '+' : ''}{activeWeather.temperatureC}°C
                </span>
              )}
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-textSecondary shrink-0" />
              ) : (
                <ChevronUp className="w-4 h-4 text-textSecondary shrink-0" />
              )}
            </div>
          </div>
        </button>

        {/* Expanded Drawer Content */}
        {isExpanded && (
          <div className="px-5 py-3 max-h-[50vh] overflow-y-auto space-y-3">
            {/* Weather & AQI Mini Card */}
            {activeWeather && (
              <div className="p-3.5 rounded-2xl bg-innerSoftArea dark:bg-gray-800 border border-yolBorder dark:border-gray-700">
                <div className="flex justify-between items-center text-xs font-bold text-textPrimary dark:text-darkText">
                  <span>{activeWeather.city}</span>
                  <span className="text-statusSuccess">AQI: {activeAqi?.aqi || 28} ({activeAqi?.aqiLevel || 'Good'})</span>
                </div>
                <div className="text-xl font-extrabold text-textPrimary dark:text-darkText mt-1">
                  {activeWeather.temperatureC > 0 ? '+' : ''}{activeWeather.temperatureC}°C
                </div>
                <p className="text-[11px] text-textSecondary dark:text-darkTextSec mt-1">
                  {activeAqi?.advice}
                </p>
              </div>
            )}

            {/* Road Incidents List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-textSecondary uppercase">
                {activeRoute ? "Yo'nalishdagi muammolar" : t('roads.title')}
              </span>
              {displayedFeatures.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setFocusedLocation({ lat: item.latitude, lon: item.longitude });
                    setIsExpanded(false);
                  }}
                  className="p-3 rounded-xl bg-innerSoftArea dark:bg-gray-800 border border-yolBorder dark:border-gray-700 text-xs cursor-pointer"
                >
                  <div className="flex justify-between items-center font-bold text-textPrimary dark:text-darkText">
                    <span>{item.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orangeTint text-accentOrange">
                      {item.source}
                    </span>
                  </div>
                  <p className="text-[11px] text-textSecondary mt-0.5">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Floating Nav Bar (Mobile Tabs) */}
        <nav 
          aria-label="Mobile Navigation"
          className="flex items-center justify-around py-3 px-2 border-t border-yolBorder dark:border-darkBorder"
        >
          <button
            onClick={() => { setActiveTab('map'); setIsExpanded(false); }}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'map' ? 'text-accentOrange font-bold' : 'text-textSecondary'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[10px]">{t('nav.map')}</span>
          </button>

          <button
            onClick={() => { setActiveTab('my-reports'); setIsExpanded(false); }}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'my-reports' ? 'text-accentOrange font-bold' : 'text-textSecondary'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px]">{t('nav.myReports')}</span>
          </button>

          <button
            onClick={() => { setActiveTab('help'); setIsExpanded(false); }}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'help' ? 'text-accentOrange font-bold' : 'text-textSecondary'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-[10px]">{t('nav.help')}</span>
          </button>

          <button
            onClick={() => { setActiveTab('settings'); setIsExpanded(false); }}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'settings' ? 'text-accentOrange font-bold' : 'text-textSecondary'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px]">{t('nav.settings')}</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
