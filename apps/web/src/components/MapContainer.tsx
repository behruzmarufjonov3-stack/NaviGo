import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Navigation, 
  HelpCircle, 
  AlertTriangle, 
  Cone, 
  Car, 
  CloudSun,
  Layers,
  ArrowUp,
  ArrowUpRight,
  ArrowUpLeft,
  RotateCcw,
  Flag,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  X,
  Wind,
  Droplets,
  ShieldCheck,
  Edit2,
  Trash2,
  Save,
  Compass,
  ZoomIn,
  ZoomOut,
  ThumbsUp,
  ThumbsDown,
  Play,
  Pause,
  MapPin,
  Gauge,
  Camera,
  Fuel,
  Zap,
  Siren,
  Radio,
  Check,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { MapFeature, Report, GasStation } from '@yol/shared';
import { DistrictWeather } from '../context/AppContext';
import { mapRegistry } from '../lib/mapRegistry';

export const MapContainer: React.FC<{ variant?: 'default' | 'bare' }> = ({ variant = 'default' }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const navStepMarkerRef = useRef<maplibregl.Marker | null>(null);
  const routeStartMarkerRef = useRef<maplibregl.Marker | null>(null);
  const routeEndMarkerRef = useRef<maplibregl.Marker | null>(null);
  const routeEtaMarkerRef = useRef<maplibregl.Marker | null>(null);
  const clickedPinMarkerRef = useRef<maplibregl.Marker | null>(null);

  const { 
    userCoords, 
    setUserCoords, 
    focusedLocation,
    setFocusedLocation,
    features, 
    dismissFeature,
    userReports,
    mapMode, 
    setMapMode,
    locale,
    t, 
    locationStatus, 
    setLocationStatus,
    setIsReportingOpen,
    setIsLegendOpen,
    districtsWeather,
    selectedDistrict,
    setSelectedDistrict,

    // Navigation states
    activeRoute,
    originCoords,
    setOriginCoords,
    destinationCoords,
    setDestinationCoords,
    travelMode,
    requestRoute,
    isNavigating,
    stopNavigation,
    currentNavStep,
    setCurrentNavStep,
    isVoiceMuted,
    setIsVoiceMuted,
    speakInstruction,
    theme,
    user,
    token,
    refreshData,

    // Gas Stations & Live Pressure/Queue Telemetry (Idea 1)
    gasStations,
    gasFilter,
    setGasFilter,
    isGasLayerVisible,
    setIsGasLayerVisible,
    selectedGasStation,
    setSelectedGasStation,
    reportGasStationUpdate,

    // V2X Green Corridor Approaching Alert (Idea 2)
    approachingAlert,
    setApproachingAlert,
    triggerDemoV2XAlert,
    selectedFeature,
    setSelectedFeature
  } = useApp();

  const [selectedUserReport, setSelectedUserReport] = useState<Report | null>(null);
  const [isUpdatingGasStation, setIsUpdatingGasStation] = useState(false);

  // Yandex Maps & Waze Pro States
  const [is3DView, setIs3DView] = useState(false);
  const [isAutoDriving, setIsAutoDriving] = useState(true);
  const [simulatedCoordIdx, setSimulatedCoordIdx] = useState(0);
  const [liveSpeedKmh, setLiveSpeedKmh] = useState(52);
  const [roadSpeedLimit, setRoadSpeedLimit] = useState(60);
  const [clickedMapPoint, setClickedMapPoint] = useState<{ lat: number; lon: number; name?: string } | null>(null);
  const [featureVotes, setFeatureVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [isQuickHazardOpen, setIsQuickHazardOpen] = useState(false);
  const [quickHazardToast, setQuickHazardToast] = useState<string | null>(null);

  // Compute Yandex Maps 1-10 Ball Traffic Score dynamically
  const trafficScoreInfo = React.useMemo(() => {
    const relevant = activeRoute?.routeIncidents && activeRoute.routeIncidents.length > 0
      ? activeRoute.routeIncidents
      : features.filter(f => Math.hypot(f.latitude - userCoords.lat, f.longitude - userCoords.lon) <= 0.25);
    const trafficCount = relevant.filter(f => f.featureType === 'traffic' || f.featureType === 'accident' || f.featureType === 'closure').length;
    const score = Math.min(10, Math.max(2, 2 + trafficCount * 2));
    const avgSpeed = Math.max(16, 58 - score * 4);
    const colorClass = score <= 3 ? 'bg-blackPill' : score <= 6 ? 'bg-blackPill' : 'bg-accentOrange';
    const statusLabel = score <= 3
      ? (locale === 'ru' ? 'Дороги свободны' : locale === 'en' ? 'Roads clear' : "Yo'llar ochiq")
      : score <= 6
      ? (locale === 'ru' ? 'Средние пробки' : locale === 'en' ? 'Moderate traffic' : "O'rtacha tirbandlik")
      : (locale === 'ru' ? 'Сильные пробки' : locale === 'en' ? 'Heavy traffic' : 'Kuchli tirbandlik');
    return { score, avgSpeed, colorClass, statusLabel };
  }, [features, activeRoute, userCoords, locale]);

  // Road Engineer & Admin Editing State
  const [isEditingFeature, setIsEditingFeature] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSeverity, setEditSeverity] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [editType, setEditType] = useState<MapFeature['featureType']>('hazard');
  const [isSavingFeature, setIsSavingFeature] = useState(false);

  const handleDeleteFeature = async () => {
    if (!selectedFeature) return;
    const confirmMsg = locale === 'ru' 
      ? 'Вы уверены, что хотите удалить эту проблему с карты?' 
      : locale === 'en' 
      ? 'Are you sure you want to remove this problem from the map?' 
      : 'Haqiqatan ham bu muammoni xaritadan o\'chirmoqchimisiz?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/v1/map/features/${selectedFeature.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedFeature(null);
        setIsEditingFeature(false);
        refreshData();
      } else {
        alert('Xatolik: Muammoni o\'chirish imkoni bo\'lmadi.');
      }
    } catch (err) {
      console.error('Delete feature error:', err);
    }
  };

  const handleSaveEditFeature = async () => {
    if (!selectedFeature) return;
    setIsSavingFeature(true);
    try {
      const res = await fetch(`/api/v1/map/features/${selectedFeature.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          severity: editSeverity,
          featureType: editType
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedFeature(data.feature);
        setIsEditingFeature(false);
        refreshData();
      } else {
        alert('Xatolik: Tahrirlashni saqlab bo\'lmadi.');
      }
    } catch (err) {
      console.error('Update feature error:', err);
    } finally {
      setIsSavingFeature(false);
    }
  };

  const handleDeleteUserReport = async () => {
    if (!selectedUserReport) return;
    const confirmMsg = locale === 'ru' 
      ? 'Удалить это сообщение?' 
      : locale === 'en' 
      ? 'Delete this report?' 
      : 'Bu xabarni o\'chirmoqchimisiz?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/v1/reports/${selectedUserReport.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedUserReport(null);
        refreshData();
      }
    } catch (err) {
      console.error('Delete report error:', err);
    }
  };

  const handleDismissIncident = (featureId: string) => {
    dismissFeature(featureId);
    setQuickHazardToast(
      locale === 'ru' 
        ? 'Спасибо за подтверждение! Отметка снята с карты.' 
        : locale === 'en' 
        ? 'Thank you! The incident has been removed from the map.' 
        : "Rahmat! Yo'l hodisasi xaritadan olib tashlandi."
    );
    setTimeout(() => setQuickHazardToast(null), 3500);
  };

  // Initialize MapLibre (Mounted once, never destroyed on theme change!)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Official, reliable, 100% free OpenStreetMap global CDN tile servers (No API key required, zero watermarks)
    const osmTiles = [
      'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
    ];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: osmTiles,
            tileSize: 256,
            attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
          },
          'route-source': {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          },
          'route-traffic-source': {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          }
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
            paint: theme === 'dark' ? {
              'raster-brightness-max': 0.62,
              'raster-contrast': 0.35,
              'raster-saturation': -0.55
            } : {}
          },
          {
            id: 'route-casing',
            type: 'line',
            source: 'route-source',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#1E3A8A',
              'line-width': 11,
              'line-opacity': 0.92
            }
          },
          {
            id: 'route-line',
            type: 'line',
            source: 'route-source',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#2563EB',
              'line-width': 6.5,
              'line-opacity': 1.0
            }
          },
          {
            id: 'route-traffic-layer',
            type: 'line',
            source: 'route-traffic-source',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#EF4444',
              'line-width': 7,
              'line-opacity': 0.98
            }
          }
        ]
      },
      center: [userCoords.lon, userCoords.lat],
      zoom: 13,
      attributionControl: false
    });

    map.on('load', () => {
      if (activeRoute && activeRoute.coordinates && activeRoute.coordinates.length > 0) {
        const source = map.getSource('route-source') as maplibregl.GeoJSONSource;
        if (source) {
          source.setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: activeRoute.coordinates
            }
          });
        }
      }
    });

    // Click on map to drop Yandex/Waze quick destination pin
    if (variant !== 'bare') {
      map.on('click', (e) => {
        const target = e.originalEvent.target as HTMLElement | null;
        if (target && target.closest('.maplibregl-marker')) {
          return;
        }
        const lat = Number(e.lngLat.lat.toFixed(5));
        const lon = Number(e.lngLat.lng.toFixed(5));
        setClickedMapPoint({ lat, lon, name: `${lat.toFixed(4)}, ${lon.toFixed(4)}` });

        // Global reverse geocoding to resolve street or city name
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=uz,en`)
          .then(res => res.json())
          .then(data => {
            const addr = data.address || {};
            const placeTitle = addr.road || addr.suburb || addr.city || addr.town || addr.village || data.display_name?.split(',')?.[0] || 'Tanlangan manzil';
            setClickedMapPoint(prev => (prev && prev.lat === lat && prev.lon === lon ? { ...prev, name: placeTitle } : prev));
          })
          .catch(() => {});
      });
    }

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    mapRef.current = map;
    mapRegistry.register(map);

    return () => {
      mapRegistry.register(null);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Dynamically update dark/light theme on existing map tiles without destroying the map or markers!
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const applyTheme = () => {
      if (map.getLayer('osm-tiles-layer')) {
        if (theme === 'dark') {
          map.setPaintProperty('osm-tiles-layer', 'raster-brightness-max', 0.62);
          map.setPaintProperty('osm-tiles-layer', 'raster-contrast', 0.35);
          map.setPaintProperty('osm-tiles-layer', 'raster-saturation', -0.55);
        } else {
          map.setPaintProperty('osm-tiles-layer', 'raster-brightness-max', 1.0);
          map.setPaintProperty('osm-tiles-layer', 'raster-contrast', 0.0);
          map.setPaintProperty('osm-tiles-layer', 'raster-saturation', 0.0);
        }
      }
    };

    if (map.isStyleLoaded()) {
      applyTheme();
    } else {
      map.once('style.load', applyTheme);
    }
  }, [theme]);

  // Render temporary pin when user clicks on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!clickedMapPoint) {
      if (clickedPinMarkerRef.current) {
        clickedPinMarkerRef.current.remove();
        clickedPinMarkerRef.current = null;
      }
      return;
    }

    const pinHtml = `
      <div class="flex flex-col items-center animate-bounce select-none pointer-events-none">
        <div class="px-2.5 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black shadow-lg border border-white flex items-center gap-1.5">
          <svg class="w-3 h-3 text-accentOrange fill-current" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>${clickedMapPoint.lat.toFixed(4)}, ${clickedMapPoint.lon.toFixed(4)}</span>
        </div>
        <div class="w-2.5 h-2.5 bg-slate-900 rotate-45 -mt-1 border-r border-b border-white"></div>
      </div>
    `;

    if (!clickedPinMarkerRef.current) {
      const el = document.createElement('div');
      el.innerHTML = pinHtml;
      clickedPinMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([clickedMapPoint.lon, clickedMapPoint.lat])
        .addTo(map);
    } else {
      clickedPinMarkerRef.current.setLngLat([clickedMapPoint.lon, clickedMapPoint.lat]);
      clickedPinMarkerRef.current.getElement().innerHTML = pinHtml;
    }
  }, [clickedMapPoint]);

  // Handle flying to focused location
  useEffect(() => {
    if (focusedLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [focusedLocation.lon, focusedLocation.lat],
        zoom: 16,
        essential: true
      });
      setFocusedLocation(null);
    }
  }, [focusedLocation]);

  // Handle markers: Weather District Pins + Incidents + User's Own Reports
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // 1. "You are here" User marker
    const userEl = document.createElement('div');
    userEl.className = 'flex items-center justify-center';
    userEl.innerHTML = `
      <div class="relative flex items-center justify-center">
        <div class="relative rounded-full h-5 w-5 bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[9px] font-bold">
        </div>
      </div>
    `;

    const userMarker = new maplibregl.Marker({ element: userEl })
      .setLngLat([userCoords.lon, userCoords.lat])
      .addTo(mapRef.current);
    markersRef.current.push(userMarker);

    // 2. Weather & Air Quality District Pins (Mode A or Combined) - skip in bare/SOS variant
    if (variant !== 'bare' && (mapMode === 'weather' || mapMode === 'combined')) {
      const weatherListToRender = activeRoute && activeRoute.destinationWeather && destinationCoords
        ? [
            {
              name: activeRoute.destinationWeather.city || destinationCoords.name,
              lat: destinationCoords.lat + 0.008,
              lon: destinationCoords.lon + 0.008,
              temp: activeRoute.destinationWeather.temperatureC,
              aqi: activeRoute.destinationAirQuality?.aqi || 28,
              aqiLevel: (activeRoute.destinationAirQuality?.aqiLevel === 'Good'
                ? 'Good'
                : activeRoute.destinationAirQuality?.aqiLevel === 'Moderate'
                ? 'Moderate'
                : 'Unhealthy') as 'Good' | 'Moderate' | 'Unhealthy',
              wind: activeRoute.destinationWeather.windSpeedKmh || 10
            }
          ]
        : districtsWeather;

      weatherListToRender.forEach((district) => {
        const el = document.createElement('div');
        el.className = 'cursor-pointer transform hover:scale-110 transition-transform select-none';

        const aqiBg = district.aqiLevel === 'Good' 
          ? 'bg-blackPill text-white' 
          : district.aqiLevel === 'Moderate'
          ? 'bg-blackPill text-accentOrange'
          : 'bg-accentOrange text-white';

        el.innerHTML = `
          <div class="flex items-center gap-1 md:gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-white dark:bg-darkCard shadow-md text-[10px] md:text-xs font-bold border border-slate-200 dark:border-darkBorder">
            <svg class="w-3 h-3 md:w-3.5 md:h-3.5 text-accentOrange fill-current" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5"/>
              <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41"/>
            </svg>
            <span class="text-textPrimary dark:text-darkText font-black">${district.temp}°</span>
            <span class="px-1 md:px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-bold ${aqiBg}">AQI ${district.aqi}</span>
          </div>
        `;

        el.onclick = () => {
          setSelectedFeature(null);
          setSelectedUserReport(null);
          setSelectedDistrict(district);
        };

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([district.lon, district.lat])
          .addTo(mapRef.current!);

        markersRef.current.push(marker);
      });
    }

    // 3. Road Incident Markers (Mode B or Combined, or bare/SOS variant) - Formal vector circular icon badges
    if (variant === 'bare' || mapMode === 'roads' || mapMode === 'combined') {
      const visibleFeatures = variant === 'bare'
        ? features
        : (activeRoute
            ? (activeRoute.routeIncidents && activeRoute.routeIncidents.length > 0
                ? activeRoute.routeIncidents
                : features.filter(f =>
                    activeRoute.coordinates.some(([lon, lat]) => Math.hypot(f.latitude - lat, f.longitude - lon) <= 0.04)
                  ))
            : features);

      visibleFeatures.forEach((feature) => {
        const el = document.createElement('div');
        el.className = 'cursor-pointer select-none';

        let badgeBg = 'bg-accentOrange';
        let pinIconColor = 'text-white';
        let svgHtml = '';

        if (feature.featureType === 'traffic') {
          badgeBg = 'bg-[#151218]';
          pinIconColor = 'text-accentOrange';
          // Formal Car SVG with orange accent
          svgHtml = `<svg class="w-4 h-4 text-accentOrange fill-current" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`;
        } else if (feature.featureType === 'roadwork') {
          badgeBg = 'bg-[#151218]';
          pinIconColor = 'text-accentOrange';
          // Formal Roadwork Cone SVG with orange accent
          svgHtml = `<svg class="w-4 h-4 text-accentOrange fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2l4 14H8l4-14zm-7 18h14M8 12h8m-6 4h4"/></svg>`;
        } else if (feature.featureType === 'closure') {
          badgeBg = 'bg-accentOrange';
          pinIconColor = 'text-white';
          // Formal Road Closed No-Entry SVG
          svgHtml = `<svg class="w-4 h-4 text-white fill-none stroke-current stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" d="M8 12h8"/></svg>`;
        } else if (feature.featureType === 'accident') {
          badgeBg = 'bg-accentOrange';
          pinIconColor = 'text-white';
          // Formal Accident Alert SVG
          svgHtml = `<svg class="w-4 h-4 text-white fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
        } else {
          badgeBg = 'bg-accentOrange';
          pinIconColor = 'text-white';
          // Formal Hazard Warning SVG
          svgHtml = `<svg class="w-4 h-4 text-white fill-none stroke-current stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" d="M12 8v4m0 4h.01"/></svg>`;
        }

        // Clean, formal circular pin marker with pointer (NO emojis, NO text labels)
        el.title = feature.title;
        el.innerHTML = `
          <div class="relative flex flex-col items-center group cursor-pointer select-none" title="${feature.title}">
            <div class="w-8 h-8 rounded-full ${badgeBg} ${pinIconColor} shadow-md border-2 border-white flex items-center justify-center transition-transform hover:scale-110">
              ${svgHtml}
            </div>
            <div class="w-2 h-2 ${badgeBg} rotate-45 -mt-1 border-r border-b border-white shadow-xs"></div>
          </div>
        `;

        el.onclick = () => {
          setSelectedDistrict(null);
          setSelectedUserReport(null);
          setSelectedFeature(feature);
        };

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([feature.longitude, feature.latitude])
          .addTo(mapRef.current!);

        markersRef.current.push(marker);
      });

      // 4. User's Own Submitted Reports as Distinct NaviGo Pin (Formal, NO text label/emoji)
      userReports.forEach((rep) => {
        const repEl = document.createElement('div');
        repEl.className = 'cursor-pointer select-none';
        repEl.innerHTML = `
          <div class="relative flex flex-col items-center group cursor-pointer select-none">
            <div class="w-8 h-8 rounded-full bg-[#151218] text-accentOrange shadow-md border-2 border-white flex items-center justify-center transition-transform hover:scale-110">
              <svg class="w-4 h-4 text-accentOrange fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div class="w-2 h-2 bg-[#151218] rotate-45 -mt-1 border-r border-b border-white shadow-xs"></div>
          </div>
        `;

        repEl.onclick = () => {
          setSelectedDistrict(null);
          setSelectedFeature(null);
          setSelectedUserReport(rep);
        };

        const repMarker = new maplibregl.Marker({ element: repEl, anchor: 'bottom' })
          .setLngLat([rep.longitude, rep.latitude])
          .addTo(mapRef.current!);

        markersRef.current.push(repMarker);
      });

      // 5. Metan & Propan Gas Station Pins (Unified 3-Color Brand Pill)
      if (variant !== 'bare' && isGasLayerVisible) {
        gasStations.forEach((station) => {
          const el = document.createElement('div');
          el.className = 'cursor-pointer select-none';

          const isMetan = station.fuels.includes('metan');
          const isPropan = station.fuels.includes('propan');
          const pressure = station.pressureBar ?? 0;
          const isClosed = !station.isOpen;

          const badgeLabel = isClosed
            ? 'Yopiq'
            : isMetan && pressure > 0
            ? `${pressure} Bar`
            : isPropan
            ? 'Propan'
            : 'Benzin';

          el.innerHTML = `
            <div class="relative flex flex-col items-center group cursor-pointer select-none hover:scale-110 transition-transform">
              <div class="flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full ${isClosed ? 'bg-[#151218]/75 text-white/70' : 'bg-[#151218] text-white'} shadow-md border-2 border-white text-[9px] md:text-[10px] font-black tracking-tight whitespace-nowrap">
                <svg class="w-3 h-3 md:w-3.5 md:h-3.5 text-accentOrange fill-current" viewBox="0 0 24 24"><path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
                <span class="${isMetan && pressure > 0 ? 'text-accentOrange' : 'text-white'}">${badgeLabel}</span>
              </div>
              <div class="w-2 h-2 bg-[#151218] rotate-45 -mt-1 border-r border-b border-white shadow-xs"></div>
            </div>
          `;

          el.onclick = () => {
            setSelectedDistrict(null);
            setSelectedFeature(null);
            setSelectedUserReport(null);
            setSelectedGasStation(station);
          };

          const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([station.longitude, station.latitude])
            .addTo(mapRef.current!);

          markersRef.current.push(marker);
        });
      }
    }
  }, [features, userReports, districtsWeather, mapMode, userCoords, locale, activeRoute, destinationCoords, gasStations, isGasLayerVisible]);

  // Handle route display, casing, traffic segments, ETA callout & bounding box
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!activeRoute || !activeRoute.coordinates || activeRoute.coordinates.length === 0) {
      if (map.getSource('route-source')) {
        try {
          (map.getSource('route-source') as maplibregl.GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: []
          });
        } catch {}
      }
      if (map.getSource('route-traffic-source')) {
        try {
          (map.getSource('route-traffic-source') as maplibregl.GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: []
          });
        } catch {}
      }
      if (routeStartMarkerRef.current) {
        routeStartMarkerRef.current.remove();
        routeStartMarkerRef.current = null;
      }
      if (routeEndMarkerRef.current) {
        routeEndMarkerRef.current.remove();
        routeEndMarkerRef.current = null;
      }
      if (routeEtaMarkerRef.current) {
        routeEtaMarkerRef.current.remove();
        routeEtaMarkerRef.current = null;
      }
      return;
    }

    const coordinates = activeRoute.coordinates;

    // Build congested sub-segments near routeIncidents (Yandex/Waze red/amber traffic overlay)
    const congestedFeatures: GeoJSON.Feature<GeoJSON.LineString>[] = [];
    const incidents = activeRoute.routeIncidents || [];
    if (incidents.length > 0 && coordinates.length > 1) {
      for (let i = 0; i < coordinates.length - 1; i++) {
        const [lon1, lat1] = coordinates[i];
        const [lon2, lat2] = coordinates[i + 1];
        const midLon = (lon1 + lon2) / 2;
        const midLat = (lat1 + lat2) / 2;
        const nearIncident = incidents.some(
          inc => Math.hypot(inc.latitude - midLat, inc.longitude - midLon) <= 0.035
        );
        if (nearIncident) {
          congestedFeatures.push({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [coordinates[i], coordinates[i + 1]]
            }
          });
        }
      }
    }

    const renderRouteLayers = () => {
      if (!mapRef.current) return;
      const m = mapRef.current;

      const geojsonData: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates
            }
          }
        ]
      };

      const trafficGeojson: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
        type: 'FeatureCollection',
        features: congestedFeatures
      };

      const source = m.getSource('route-source') as maplibregl.GeoJSONSource;
      if (source) {
        try {
          source.setData(geojsonData);
        } catch (err) {
          console.warn('Error setting route data:', err);
        }
      } else {
        try {
          if (!m.getSource('route-source')) {
            m.addSource('route-source', {
              type: 'geojson',
              data: geojsonData
            });
          }
          if (!m.getLayer('route-casing')) {
            m.addLayer({
              id: 'route-casing',
              type: 'line',
              source: 'route-source',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#1E3A8A', 'line-width': 11, 'line-opacity': 0.95 }
            });
          }
          if (!m.getLayer('route-line')) {
            m.addLayer({
              id: 'route-line',
              type: 'line',
              source: 'route-source',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#2563EB', 'line-width': 6.5, 'line-opacity': 1.0 }
            });
          }
        } catch {}
      }

      const trafficSource = m.getSource('route-traffic-source') as maplibregl.GeoJSONSource;
      if (trafficSource) {
        try {
          trafficSource.setData(trafficGeojson);
        } catch {}
      }
    };

    if (map.getSource('route-source')) {
      renderRouteLayers();
    } else if (map.isStyleLoaded()) {
      renderRouteLayers();
    } else {
      map.once('load', renderRouteLayers);
      map.once('styledata', renderRouteLayers);
    }

    // Floating Yandex/Waze Route ETA Callout Pill at route midpoint
    const midCoord = coordinates[Math.floor(coordinates.length / 2)];
    if (midCoord) {
      const distKm = (activeRoute.distanceMeters / 1000).toFixed(1);
      const incCount = activeRoute.routeIncidents?.length || 0;
      const etaHtml = `
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/95 text-white shadow-2xl border-2 border-blue-400 text-xs font-black select-none pointer-events-none whitespace-nowrap">
          <svg class="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          <span>${activeRoute.durationMinutes} min</span>
          <span class="text-slate-400">•</span>
          <span class="text-blue-200">${distKm} km</span>
          ${incCount > 0 ? `<span class="ml-1 px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">${incCount}</span>` : ''}
        </div>
      `;
      if (!routeEtaMarkerRef.current) {
        const el = document.createElement('div');
        el.innerHTML = etaHtml;
        routeEtaMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(midCoord)
          .addTo(map);
      } else {
        routeEtaMarkerRef.current.setLngLat(midCoord);
        routeEtaMarkerRef.current.getElement().innerHTML = etaHtml;
      }
    }

    // Start point marker (Origin) - Formal Point A Pin (no green emoji/dot)
    const startCoord: [number, number] | null = originCoords
      ? [originCoords.lon, originCoords.lat]
      : (coordinates.length > 0 ? coordinates[0] : [userCoords.lon, userCoords.lat]);

    if (startCoord) {
      const defaultStart = locale === 'ru' ? 'Старт' : locale === 'en' ? 'Start' : 'Boshlanish';
      const startLabel = originCoords?.name || activeRoute.originName || defaultStart;
      const startHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer select-none">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700/80 hover:scale-105 transition-transform">
            <span class="w-4 h-4 rounded-md bg-white text-slate-900 font-black text-[10px] flex items-center justify-center shadow-xs">A</span>
            <span class="font-extrabold text-xs tracking-tight">${startLabel}</span>
          </div>
          <div class="w-2.5 h-2.5 bg-slate-900 rotate-45 -mt-1.5 border-r border-b border-slate-700/80 shadow-sm"></div>
        </div>
      `;
      if (!routeStartMarkerRef.current) {
        const wrapper = document.createElement('div');
        wrapper.className = 'cursor-pointer select-none';
        wrapper.innerHTML = startHtml;

        routeStartMarkerRef.current = new maplibregl.Marker({ element: wrapper, anchor: 'bottom' })
          .setLngLat(startCoord)
          .addTo(map);
      } else {
        routeStartMarkerRef.current.setLngLat(startCoord);
        const wrapper = routeStartMarkerRef.current.getElement();
        wrapper.innerHTML = startHtml;
      }
    }

    // Destination point marker (End) - Formal Point B Flag Pin
    const targetCoord: [number, number] | null = destinationCoords
      ? [destinationCoords.lon, destinationCoords.lat]
      : (coordinates.length > 0 ? coordinates[coordinates.length - 1] : null);

    if (targetCoord) {
      const defaultDest = locale === 'ru' ? 'Пункт назначения' : locale === 'en' ? 'Destination' : 'Manzil';
      const destTitle = destinationCoords?.name || activeRoute.destinationName || defaultDest;
      const destHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer select-none">
          <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xl border border-rose-400/60 hover:scale-105 transition-transform">
            <span class="w-4 h-4 rounded-md bg-white text-rose-600 font-black text-[10px] flex items-center justify-center shadow-xs">B</span>
            <span class="font-black text-xs tracking-tight">${destTitle}</span>
            <svg class="w-3.5 h-3.5 text-white fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" />
            </svg>
          </div>
          <div class="w-2.5 h-2.5 bg-rose-600 rotate-45 -mt-1.5 border-r border-b border-rose-400/60 shadow-sm"></div>
        </div>
      `;
      if (!routeEndMarkerRef.current) {
        const wrapper = document.createElement('div');
        wrapper.className = 'cursor-pointer select-none';
        wrapper.innerHTML = destHtml;

        routeEndMarkerRef.current = new maplibregl.Marker({ element: wrapper, anchor: 'bottom' })
          .setLngLat(targetCoord)
          .addTo(map);
      } else {
        routeEndMarkerRef.current.setLngLat(targetCoord);
        const wrapper = routeEndMarkerRef.current.getElement();
        wrapper.innerHTML = destHtml;
      }
    }

    // Fit map bounds to encompass the entire route smoothly
    const bounds = new maplibregl.LngLatBounds();
    coordinates.forEach(c => bounds.extend(c));
    if (targetCoord) bounds.extend(targetCoord);
    
    const leftPadding = typeof window !== 'undefined' && window.innerWidth > 1024 ? 400 : 60;
    map.fitBounds(bounds, {
      padding: { top: 80, bottom: 80, left: leftPadding, right: 70 },
      maxZoom: 14
    });
  }, [activeRoute, destinationCoords, originCoords]);

  // Reset simulated coordinate index & switch to 3D pitch when navigation starts
  useEffect(() => {
    if (!mapRef.current) return;
    if (isNavigating && activeRoute) {
      setSimulatedCoordIdx(0);
      setIsAutoDriving(true);
      setIs3DView(true);
      mapRef.current.easeTo({ pitch: 50, zoom: 16, duration: 900 });
    } else {
      setIs3DView(false);
      mapRef.current.easeTo({ pitch: 0, bearing: 0, duration: 600 });
      if (navStepMarkerRef.current) {
        navStepMarkerRef.current.remove();
        navStepMarkerRef.current = null;
      }
    }
  }, [isNavigating]);

  // Waze / Yandex Navigator Live Auto-Drive Simulation along activeRoute.coordinates
  useEffect(() => {
    if (!isNavigating || !isAutoDriving || !activeRoute || activeRoute.coordinates.length < 2) {
      return;
    }
    const timer = setInterval(() => {
      setSimulatedCoordIdx(prev => {
        const next = prev + 1;
        if (next >= activeRoute.coordinates.length) {
          setIsAutoDriving(false);
          return activeRoute.coordinates.length - 1;
        }
        // Sync step index proportionally
        const newStepIdx = Math.min(
          activeRoute.steps.length - 1,
          Math.floor((next / activeRoute.coordinates.length) * activeRoute.steps.length)
        );
        if (newStepIdx !== currentNavStep) {
          setCurrentNavStep(newStepIdx);
        }
        return next;
      });
      // Realistic speed telemetry (slow down near traffic incidents, cruise at 48-59 km/h otherwise)
      setLiveSpeedKmh(Math.floor(46 + Math.random() * 13));
      setRoadSpeedLimit(Math.random() > 0.75 ? 70 : 60);
    }, 1400);

    return () => clearInterval(timer);
  }, [isNavigating, isAutoDriving, activeRoute, currentNavStep]);

  // Handle active navigation vehicle marker & camera tracking
  useEffect(() => {
    if (!isNavigating || !activeRoute || !mapRef.current) {
      if (navStepMarkerRef.current) {
        navStepMarkerRef.current.remove();
        navStepMarkerRef.current = null;
      }
      return;
    }

    const coordIndex = isAutoDriving
      ? Math.min(simulatedCoordIdx, activeRoute.coordinates.length - 1)
      : Math.min(
          Math.floor((currentNavStep / Math.max(activeRoute.steps.length, 1)) * activeRoute.coordinates.length),
          activeRoute.coordinates.length - 1
        );
    const stepCoord = activeRoute.coordinates[coordIndex];

    if (stepCoord) {
      mapRef.current.easeTo({
        center: stepCoord,
        zoom: 16,
        pitch: is3DView ? 50 : 0,
        duration: 1100,
        essential: true
      });

      const navCarHtml = `
        <div class="relative flex items-center justify-center select-none">
          <div class="absolute w-14 h-14 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-900 text-white flex items-center justify-center border-2 border-white shadow-2xl">
            <svg class="w-6 h-6 text-white fill-current transform -rotate-45" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </div>
        </div>
      `;

      if (!navStepMarkerRef.current) {
        const el = document.createElement('div');
        el.innerHTML = navCarHtml;
        navStepMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat(stepCoord)
          .addTo(mapRef.current);
      } else {
        navStepMarkerRef.current.setLngLat(stepCoord);
      }
    }
  }, [isNavigating, currentNavStep, simulatedCoordIdx, isAutoDriving, activeRoute, is3DView]);

  const toggle3DView = () => {
    if (!mapRef.current) return;
    const next3D = !is3DView;
    setIs3DView(next3D);
    mapRef.current.easeTo({ pitch: next3D ? 50 : 0, duration: 500 });
  };

  const handleZoomIn = () => {
    mapRef.current?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut({ duration: 300 });
  };

  const handleResetCompass = () => {
    mapRef.current?.easeTo({ bearing: 0, pitch: 0, duration: 400 });
    setIs3DView(false);
  };

  const handleQuickHazardReport = async (type: 'traffic' | 'accident' | 'roadwork' | 'hazard', label: string) => {
    setIsQuickHazardOpen(false);
    setQuickHazardToast(`${label} xaritaga joylandi! (+5 ball)`);
    setTimeout(() => setQuickHazardToast(null), 3500);
    try {
      const targetLat = clickedMapPoint?.lat ?? userCoords.lat;
      const targetLon = clickedMapPoint?.lon ?? userCoords.lon;
      await fetch('/api/v1/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: label,
          description: `Haydovchi tezkor xabari (${label})`,
          category: type,
          severity: type === 'accident' ? 'high' : 'medium',
          latitude: targetLat,
          longitude: targetLon
        })
      });
      refreshData();
    } catch {}
  };

  const handleNextStep = () => {
    if (!activeRoute) return;
    setIsAutoDriving(false);
    if (currentNavStep < activeRoute.steps.length - 1) {
      const nextIdx = currentNavStep + 1;
      setCurrentNavStep(nextIdx);
      speakInstruction(activeRoute.steps[nextIdx].instruction);
    } else {
      speakInstruction(t('navigation.arrived'));
    }
  };

  const handlePrevStep = () => {
    if (!activeRoute) return;
    setIsAutoDriving(false);
    if (currentNavStep > 0) {
      const prevIdx = currentNavStep - 1;
      setCurrentNavStep(prevIdx);
      speakInstruction(activeRoute.steps[prevIdx].instruction);
    }
  };

  const handleRecenter = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserCoords(coords);
          setLocationStatus('granted');
          mapRef.current?.flyTo({ center: [coords.lon, coords.lat], zoom: 14 });
        },
        () => {
          setLocationStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const currentStep = activeRoute && isNavigating ? activeRoute.steps[currentNavStep] : null;

  return (
    <div className="relative w-full h-full rounded-panel overflow-hidden shadow-float border border-yolBorder dark:border-darkBorder bg-appPanel dark:bg-darkPanel">
      {/* 1. Main Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* 1B. Yandex Maps Style 1–10 Ball Live Traffic Indicator (Top-Left) */}
      {variant !== 'bare' && !isNavigating && (
        <div className="absolute top-14 left-2.5 md:top-4 md:left-4 z-10 flex items-center gap-2 md:gap-2.5 bg-white/95 dark:bg-darkCard/95 backdrop-blur-md px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-full shadow-float border border-yolBorder dark:border-darkBorder">
          <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full ${trafficScoreInfo.colorClass} text-white font-black text-[11px] md:text-xs flex items-center justify-center shadow-sm shrink-0`}>
            {trafficScoreInfo.score}
          </div>
          <div className="leading-tight pr-1">
            <div className="text-[11px] md:text-xs font-extrabold text-textPrimary dark:text-darkText flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
              <span>{trafficScoreInfo.score} ball</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span>{trafficScoreInfo.statusLabel}</span>
            </div>
            <div className="hidden sm:block text-[10px] font-bold text-textSecondary dark:text-darkTextSec">
              {locale === 'ru' ? 'Средняя скорость' : locale === 'en' ? 'Avg city speed' : "O'rtacha tezlik"}: ~{trafficScoreInfo.avgSpeed} {locale === 'ru' ? 'км/ч' : locale === 'en' ? 'km/h' : 'km/soat'}
            </div>
          </div>
        </div>
      )}

      {/* Quick Hazard Reported Toast */}
      {quickHazardToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-blackPill text-white border border-accentOrange px-5 py-2.5 rounded-full shadow-2xl text-xs font-black flex items-center gap-2 animate-bounce whitespace-nowrap">
          <ShieldCheck className="w-4 h-4 text-accentOrange" />
          <span>{quickHazardToast}</span>
        </div>
      )}

      {/* 1C. V2X Green Corridor Approaching Emergency Vehicle HUD Banner (Idea 2) */}
      {approachingAlert && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-4 rounded-2xl shadow-2xl border-2 border-white animate-bounce">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/40">
                <Siren className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-white text-rose-700 text-[10px] font-black uppercase tracking-wider">
                    V2X YASHIL YO'LAK
                  </span>
                  <span className="text-xs font-black text-amber-200">
                    {approachingAlert.direction === 'passed' ? "O'tib ketdi" : `${approachingAlert.distanceMeters} metr`}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black leading-tight mt-1 text-white">
                  {approachingAlert.messageUz}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-rose-100 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Svetoforlar "Yashil Yo'lak" rejimiga o'tkazildi • {approachingAlert.plateNumber}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setApproachingAlert(null)}
              className="text-white/80 hover:text-white p-1 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Top-Right Map Mode Pill Switcher */}
      {variant !== 'bare' && (
        <div className="absolute top-2.5 left-2.5 right-2.5 md:left-auto md:top-4 md:right-4 z-10 flex items-center justify-between md:justify-start bg-white dark:bg-darkCard p-1 md:p-1.5 rounded-full shadow-soft border border-yolBorder dark:border-darkBorder">
          <button
            onClick={() => {
              setMapMode('combined');
              setSelectedDistrict(null);
            }}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[11px] md:text-xs font-semibold whitespace-nowrap transition-all ${
              mapMode === 'combined'
                ? 'bg-blackPill text-white'
                : 'text-textSecondary dark:text-darkTextSec hover:text-textPrimary'
            }`}
          >
            <Layers className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />
            <span>{t('map.modeCombined')}</span>
          </button>

          <button
            onClick={() => {
              setMapMode('weather');
              setSelectedFeature(null);
            }}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[11px] md:text-xs font-semibold whitespace-nowrap transition-all ${
              mapMode === 'weather'
                ? 'bg-blackPill text-white'
                : 'text-textSecondary dark:text-darkTextSec hover:text-textPrimary'
            }`}
          >
            <CloudSun className="w-3 h-3 md:w-3.5 md:h-3.5 text-accentOrange shrink-0" />
            <span>{t('map.modeA')}</span>
          </button>

          <button
            onClick={() => {
              setMapMode('roads');
              setSelectedDistrict(null);
            }}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[11px] md:text-xs font-semibold whitespace-nowrap transition-all ${
              mapMode === 'roads'
                ? 'bg-blackPill text-white'
                : 'text-textSecondary dark:text-darkTextSec hover:text-textPrimary'
            }`}
          >
            <Car className="w-3 h-3 md:w-3.5 md:h-3.5 text-accentOrange shrink-0" />
            <span>{t('map.modeB')}</span>
          </button>
        </div>
      )}

      {/* 2B. Right-Side Yandex / Waze Professional Map Controls (2D/3D, Zoom +/-, Compass, Waze 1-Tap Hazard) */}
      {variant !== 'bare' && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 md:right-4 z-10 flex flex-col gap-1.5 md:gap-2">
          <button
            onClick={toggle3DView}
            title="2D / 3D Perspektiva"
            className={`w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl shadow-float border text-[11px] md:text-xs font-black transition-all flex items-center justify-center ${
              is3DView
                ? 'bg-blackPill text-white border-blackPill'
                : 'bg-white dark:bg-darkCard text-textPrimary dark:text-darkText border-yolBorder dark:border-darkBorder hover:border-accentOrange'
            }`}
          >
            {is3DView ? '3D' : '2D'}
          </button>

          <button
            onClick={handleZoomIn}
            title="Yaqinlashtirish (+)"
            className="hidden md:flex w-11 h-11 rounded-2xl bg-white dark:bg-darkCard shadow-float border border-yolBorder dark:border-darkBorder text-textPrimary dark:text-darkText hover:text-accentOrange items-center justify-center transition-all"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <button
            onClick={handleZoomOut}
            title="Uzoqlashtirish (-)"
            className="hidden md:flex w-11 h-11 rounded-2xl bg-white dark:bg-darkCard shadow-float border border-yolBorder dark:border-darkBorder text-textPrimary dark:text-darkText hover:text-accentOrange items-center justify-center transition-all"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <button
            onClick={handleResetCompass}
            title="Shimolga tekislash (Kompas)"
            className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-white dark:bg-darkCard shadow-float border border-yolBorder dark:border-darkBorder text-textPrimary dark:text-darkText hover:text-accentOrange flex items-center justify-center transition-all"
          >
            <Compass className="w-4 h-4 md:w-5 md:h-5 text-accentOrange" />
          </button>

          {/* Waze 1-Tap Hazard Quick Report Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsQuickHazardOpen(!isQuickHazardOpen)}
              title={locale === 'ru' ? 'Быстрое сообщение' : locale === 'en' ? 'Quick Report' : 'Tezkor xabar'}
              className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-accentOrange hover:bg-orange-600 text-white shadow-float border-2 border-white flex items-center justify-center transition-all"
            >
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {isQuickHazardOpen && (
              <div className="absolute right-12 md:right-14 bottom-0 bg-white dark:bg-darkCard p-2.5 rounded-2xl shadow-2xl border border-yolBorder dark:border-darkBorder w-48 space-y-1.5 animate-fade-in z-30">
                <div className="text-[10px] font-black uppercase tracking-wider text-textSecondary dark:text-darkTextSec px-1">
                  {locale === 'ru' ? 'Быстрое сообщение' : locale === 'en' ? 'Quick Report' : 'Tezkor xabar'}
                </div>
                <button
                  onClick={() => handleQuickHazardReport('traffic', 'Tirbandlik')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-orangeTint text-xs font-bold text-textPrimary dark:text-darkText transition-colors"
                >
                  <Car className="w-4 h-4 text-accentOrange shrink-0" />
                  <span>{locale === 'ru' ? 'Пробка' : locale === 'en' ? 'Traffic' : 'Tirbandlik'}</span>
                </button>
                <button
                  onClick={() => handleQuickHazardReport('accident', 'YTH / Avariya')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-orangeTint text-xs font-bold text-textPrimary dark:text-darkText transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-accentOrange shrink-0" />
                  <span>{locale === 'ru' ? 'ДТП' : locale === 'en' ? 'Accident' : 'YTH / Avariya'}</span>
                </button>
                <button
                  onClick={() => handleQuickHazardReport('roadwork', "Yo'l ta'miri")}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-orangeTint text-xs font-bold text-textPrimary dark:text-darkText transition-colors"
                >
                  <Cone className="w-4 h-4 text-accentOrange shrink-0" />
                  <span>{locale === 'ru' ? 'Ремонт дороги' : locale === 'en' ? 'Roadwork' : "Yo'l ta'miri"}</span>
                </button>
                <button
                  onClick={() => handleQuickHazardReport('hazard', 'Radar / Kamera')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-orangeTint text-xs font-bold text-textPrimary dark:text-darkText transition-colors"
                >
                  <Camera className="w-4 h-4 text-accentOrange shrink-0" />
                  <span>{locale === 'ru' ? 'Камера' : locale === 'en' ? 'Speed Camera' : 'Radar / Kamera'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Gas Stations Layer Toggle (Idea 1 - Metan & Propan) */}
          <button
            onClick={() => setIsGasLayerVisible(!isGasLayerVisible)}
            title={isGasLayerVisible ? "Metan/Propan zapravkalarini yashirish" : "Metan & Propan zapravkalarini ko'rsatish"}
            className={`w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl shadow-float border text-xs font-black transition-all flex items-center justify-center ${
              isGasLayerVisible
                ? 'bg-accentOrange text-white border-accentOrange shadow-md'
                : 'bg-white dark:bg-darkCard text-textPrimary dark:text-darkText border-yolBorder dark:border-darkBorder hover:border-accentOrange'
            }`}
          >
            <Fuel className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* V2X Green Corridor Emergency Siren Demo Button (Idea 2) */}
          <button
            onClick={() => triggerDemoV2XAlert('103')}
            title="V2X Yashil Yo'lak (Tez Yordam sirenasi sinovi)"
            className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-accentOrange hover:bg-orange-600 text-white shadow-float border-2 border-white flex items-center justify-center transition-all active:scale-95 group relative"
          >
            <Siren className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full animate-ping"></span>
          </button>

          {/* Mobile-only Recenter Button inside right stack so it is never hidden behind bottom sheet */}
          <button
            onClick={handleRecenter}
            aria-label={t('map.myLocation')}
            title={t('map.myLocation')}
            className="md:hidden w-9 h-9 rounded-xl bg-white dark:bg-darkCard shadow-float border border-yolBorder dark:border-darkBorder text-textPrimary dark:text-darkText flex items-center justify-center active:scale-95"
          >
            <Navigation className="w-4 h-4 text-accentOrange" />
          </button>
        </div>
      )}

      {/* 2C. Yandex Maps / Waze Click-on-Map Quick Action Bar */}
      {clickedMapPoint && !isNavigating && variant !== 'bare' && (
        <div className="absolute bottom-12 md:bottom-24 left-1/2 -translate-x-1/2 z-20 bg-blackPill/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-gray-700 flex flex-wrap items-center gap-2.5 max-w-lg animate-pop-in">
          <div className="flex items-center gap-1.5 pr-2 border-r border-gray-700 max-w-[200px]">
            <MapPin className="w-4 h-4 text-accentOrange shrink-0" />
            <div className="truncate">
              <span className="text-xs font-bold block truncate">
                {clickedMapPoint.name || `${clickedMapPoint.lat.toFixed(4)}, ${clickedMapPoint.lon.toFixed(4)}`}
              </span>
              <span className="text-[10px] text-gray-400 block font-mono">
                {clickedMapPoint.lat.toFixed(4)}, {clickedMapPoint.lon.toFixed(4)}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              const pt = clickedMapPoint;
              setClickedMapPoint(null);
              requestRoute(
                pt.lat,
                pt.lon,
                travelMode,
                pt.name || (locale === 'ru' ? 'Точка на карте' : locale === 'en' ? 'Pinned Location' : 'Xaritadagi nuqta')
              );
            }}
            className="px-3 py-1.5 rounded-xl bg-accentOrange hover:bg-orange-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all spring-btn active:scale-90"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{locale === 'ru' ? 'Сюда (Б)' : locale === 'en' ? 'Route Here (B)' : 'Bu yerga ketish (B)'}</span>
          </button>
          <button
            onClick={() => {
              const pt = clickedMapPoint;
              setClickedMapPoint(null);
              const originLabel = pt.name || (locale === 'ru' ? 'Точка А на карте' : locale === 'en' ? 'Point A on Map' : 'Xaritadagi A nuqta');
              setOriginCoords({ lat: pt.lat, lon: pt.lon, name: originLabel });
              if (destinationCoords) {
                requestRoute(destinationCoords.lat, destinationCoords.lon, travelMode, destinationCoords.name, pt.lat, pt.lon, originLabel);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-600 transition-all flex items-center gap-1.5 spring-btn active:scale-90"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            <span>{locale === 'ru' ? 'Отсюда (А)' : locale === 'en' ? 'Start Here (A)' : 'Shu yerdan (A)'}</span>
          </button>
          <button
            onClick={() => setClickedMapPoint(null)}
            className="text-slate-400 hover:text-white px-2 py-1 text-xs font-bold rounded-lg hover:bg-slate-800 spring-btn active:scale-90"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Turn-by-Turn Navigation HUD Overlay + Waze Speedometer */}
      {isNavigating && activeRoute && currentStep && (
        <>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-xl bg-slate-900/95 text-white p-4 rounded-card shadow-2xl border-2 border-blue-500 animate-fade-in">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  {currentStep.maneuverType === 'turn-right' ? (
                    <ArrowUpRight className="w-7 h-7 stroke-[3] text-white" />
                  ) : currentStep.maneuverType === 'turn-left' ? (
                    <ArrowUpLeft className="w-7 h-7 stroke-[3] text-white" />
                  ) : currentStep.maneuverType === 'arrive' ? (
                    <Flag className="w-6 h-6 text-emerald-300" />
                  ) : (
                    <ArrowUp className="w-7 h-7 stroke-[3] text-white" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-wider block">
                    {t('navigation.nextManeuver')} ({currentNavStep + 1} / {activeRoute.steps.length})
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                    {currentStep.instruction}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-300 font-bold">
                    <span className="text-amber-400 font-black">{currentStep.distanceMeters} m</span>
                    <span>•</span>
                    <span>{activeRoute.durationMinutes} min ({(activeRoute.distanceMeters / 1000).toFixed(1)} km)</span>
                    <span>•</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Flag className="w-3.5 h-3.5" />
                      <span>{new Date(Date.now() + activeRoute.durationMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Auto-Drive Toggle, Voice Mute & Exit Button */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsAutoDriving(!isAutoDriving)}
                  className={`px-3 py-2 rounded-full text-xs font-black flex items-center gap-1 transition-all ${
                    isAutoDriving ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-600'
                  }`}
                  title="Avto-harakat simulyatsiyasi"
                >
                  {isAutoDriving ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isAutoDriving ? 'Auto' : 'Pauza'}</span>
                </button>
                <button
                  onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${
                    isVoiceMuted ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-blue-600/30 text-blue-300 border-blue-400'
                  }`}
                  title={isVoiceMuted ? t('navigation.soundOff') : t('navigation.soundOn')}
                >
                  {isVoiceMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={stopNavigation}
                  className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition-colors"
                  title={t('navigation.stopNav')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-700">
              <button
                onClick={handlePrevStep}
                disabled={currentNavStep === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-slate-200 text-xs font-bold disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t('common.back')}</span>
              </button>

              <span className="text-xs font-mono font-bold text-slate-300">
                {currentNavStep + 1} / {activeRoute.steps.length} • 3D Navigator
              </span>

              <button
                onClick={handleNextStep}
                disabled={currentNavStep >= activeRoute.steps.length - 1}
                className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 disabled:opacity-40"
              >
                <span>{t('common.next')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Waze / Yandex Navigator Live Speedometer & Speed Limit Sign (Bottom-Left) */}
          <div className="absolute bottom-20 left-6 z-20 flex items-center gap-2.5 animate-fade-in">
            {/* Digital Speedometer Circle */}
            <div className="w-16 h-16 rounded-full bg-slate-900/95 text-white border-2 border-blue-400 shadow-2xl flex flex-col items-center justify-center">
              <span className="text-xl font-black leading-none">{liveSpeedKmh}</span>
              <span className="text-[9px] font-bold text-slate-300 uppercase mt-0.5">{locale === 'ru' ? 'км/ч' : locale === 'en' ? 'km/h' : 'km/soat'}</span>
            </div>
            {/* Standard Road Speed Limit Sign (Red Border Circle) */}
            <div className="w-13 h-13 rounded-full bg-white text-slate-900 border-[4px] border-rose-600 shadow-2xl flex items-center justify-center font-black text-base">
              {roadSpeedLimit}
            </div>
          </div>
        </>
      )}

      {/* 4. Non-blocking Location Prompt Banner */}
      {locationStatus === 'prompt' && !isNavigating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white dark:bg-darkCard px-5 py-3 rounded-2xl shadow-float border border-yolBorder dark:border-darkBorder flex items-center gap-4 max-w-md animate-fade-in">
          <Navigation className="w-5 h-5 text-accentOrange shrink-0" />
          <p className="text-sm text-textPrimary dark:text-darkText font-medium">
            {t('map.locationPrompt')}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRecenter}
              className="px-3 py-1.5 rounded-full bg-blackPill text-white text-xs font-bold hover:bg-blackPillHover"
            >
              {t('map.allowLocation')}
            </button>
            <button
              onClick={() => setLocationStatus('denied')}
              className="px-2.5 py-1.5 rounded-full text-xs text-textSecondary dark:text-darkTextSec hover:text-textPrimary"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 5. Bottom-Left Controls: Legend & List Alternative (Desktop) */}
      {variant !== 'bare' && (
        <div className="hidden md:flex absolute bottom-6 left-6 z-10 items-center gap-2">
          <button
            onClick={() => setIsLegendOpen(true)}
            className="flex items-center gap-2 bg-white dark:bg-darkCard px-4 py-2.5 rounded-full shadow-soft border border-yolBorder dark:border-darkBorder text-textPrimary dark:text-darkText hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-semibold transition-all"
          >
            <HelpCircle className="w-4 h-4 text-accentOrange" />
            <span>{t('map.whatMean')}</span>
          </button>
        </div>
      )}

      {/* 6. Bottom-Right Controls: Recenter & Formal Round Report FAB (Desktop) */}
      <div className="hidden md:flex absolute bottom-6 right-6 z-10 items-center gap-3">
        <button
          onClick={handleRecenter}
          aria-label={t('map.myLocation')}
          title={t('map.myLocation')}
          className="w-13 h-13 p-3.5 rounded-full bg-white dark:bg-darkCard shadow-float border border-yolBorder dark:border-darkBorder text-textPrimary dark:text-darkText hover:text-accentOrange transition-all flex items-center justify-center active:scale-95"
        >
          <Navigation className="w-6 h-6 text-accentOrange" />
        </button>

        {variant !== 'bare' && (
          <button
            onClick={() => setIsReportingOpen(true)}
            aria-label={t('map.reportProblem')}
            title={t('map.reportProblem')}
            className="w-13 h-13 rounded-full bg-slate-900 dark:bg-darkCard hover:bg-black text-white shadow-float border border-slate-700/80 dark:border-darkBorder flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
          >
            <Plus className="w-6 h-6 text-accentOrange group-hover:scale-110 transition-transform stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* 7. Selected District Weather Popover Card (Mode A Fix) */}
      {selectedDistrict && (
        <div className="absolute bottom-12 md:bottom-24 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-sm bg-white dark:bg-darkCard p-4 md:p-5 rounded-card shadow-float border-2 border-accentOrange animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accentOrange">
                {t('weather.districtAir')}
              </span>
              <h3 className="font-extrabold text-base text-textPrimary dark:text-darkText leading-tight mt-0.5">
                {selectedDistrict.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedDistrict(null)}
              className="text-textSecondary hover:text-textPrimary p-1"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-between my-3">
            <div>
              <div className="text-3xl font-extrabold text-textPrimary dark:text-darkText">
                +{selectedDistrict.temp}°C
              </div>
              <span className="text-xs text-textSecondary dark:text-darkTextSec font-medium">
                {t('weather.wind')}: {selectedDistrict.wind} km/h
              </span>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              selectedDistrict.aqiLevel === 'Good'
                ? 'bg-statusSuccessBg text-statusSuccess border border-green-300'
                : 'bg-statusWarningBg text-statusWarning border border-amber-300'
            }`}>
              AQI {selectedDistrict.aqi} • {selectedDistrict.aqiLevel === 'Good' ? (locale === 'ru' ? 'Хорошее' : locale === 'en' ? 'Good' : 'A\'lo') : (locale === 'ru' ? 'Умеренное' : locale === 'en' ? 'Moderate' : 'O\'rtacha')}
            </div>
          </div>

          <p className="text-xs text-textSecondary dark:text-darkTextSec leading-relaxed">
            {locale === 'ru'
              ? (selectedDistrict.aqiLevel === 'Good'
                  ? 'Качество воздуха отличное. Благоприятно для прогулок на открытом воздухе.'
                  : 'Качество воздуха умеренное. Городское движение стабильное.')
              : locale === 'en'
              ? (selectedDistrict.aqiLevel === 'Good'
                  ? 'Excellent air quality. Great for outdoor walks and open windows.'
                  : 'Moderate air quality. Standard urban traffic conditions.')
              : (selectedDistrict.aqiLevel === 'Good'
                  ? 'Havo sifati a\'lo darajada. Ochiq havoda sayr qilish va derazalarni ochish tavsiya etiladi.'
                  : 'Havo sifati o\'rtacha. Shahar bo\'ylab transport harakati barqaror.')}
          </p>

          <button
            onClick={() => setSelectedDistrict(null)}
            className="mt-3 w-full py-2 rounded-full bg-blackPill text-white text-xs font-bold hover:bg-blackPillHover"
          >
            {t('common.close')}
          </button>
        </div>
      )}

      {/* 8. Selected Incident Modal Popup */}
      {selectedFeature && (
        <div className="absolute bottom-12 md:bottom-24 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-md max-h-[60vh] md:max-h-none overflow-y-auto bg-white dark:bg-darkCard p-4 md:p-5 rounded-card shadow-float border border-yolBorder dark:border-darkBorder animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orangeTint flex items-center justify-center text-accentOrange shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-textPrimary dark:text-darkText leading-tight">
                  {selectedFeature.title}
                </h3>
                <span className="text-xs text-textSecondary dark:text-darkTextSec">
                  {t('map.sourceLabel')}:{' '}
                  <span className="font-semibold text-accentOrange">
                    [{selectedFeature.source}]
                  </span>
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedFeature(null);
                setIsEditingFeature(false);
              }}
              className="text-textSecondary hover:text-textPrimary p-1"
            >
              ✕
            </button>
          </div>

          {!isEditingFeature ? (
            <>
              <p className="text-sm text-textSecondary dark:text-darkTextSec mt-3 leading-relaxed">
                {selectedFeature.description}
              </p>

              {/* Waze Community Confirmation ("Hali ham shu yerdami? 👍 Ha / 👎 Yo'q") */}
              <div className="mt-3 p-2.5 rounded-2xl bg-innerSoftArea dark:bg-gray-800 border border-yolBorder dark:border-gray-700 flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-textPrimary dark:text-darkText">
                  {locale === 'ru' ? 'Всё ещё там?' : locale === 'en' ? 'Still there?' : 'Hali ham shu yerdami?'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFeatureVotes(prev => ({ ...prev, [selectedFeature.id]: 'up' }))}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black transition-all ${
                      featureVotes[selectedFeature.id] === 'up'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-gray-600'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{locale === 'ru' ? 'Да' : locale === 'en' ? 'Yes' : 'Ha'} ({12 + (featureVotes[selectedFeature.id] === 'up' ? 1 : 0)})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDismissIncident(selectedFeature.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all bg-rose-600 hover:bg-rose-700 text-white shadow-sm spring-btn active:scale-90"
                    title={locale === 'ru' ? 'Подтвердить, что проблемы уже нет' : locale === 'en' ? 'Confirm hazard is resolved' : "Muammo yo'qligini tasdiqlash"}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{locale === 'ru' ? 'Нет' : locale === 'en' ? 'No' : "Yo'qoldi"}</span>
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-yolBorder dark:border-darkBorder flex items-center justify-between">
                <span className="text-xs text-textSecondary dark:text-darkTextSec">
                  {t('map.verifiedAt')}: {new Date(selectedFeature.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="px-4 py-2 rounded-full bg-blackPill text-white text-xs font-bold hover:bg-blackPillHover"
                >
                  {t('roads.findAnotherWay')}
                </button>
              </div>

              {/* Road Engineer & Admin Controls */}
              {user && (user.role === 'ADMIN' || user.role === 'EDITOR') && (
                <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-accentOrange bg-orangeTint/50 px-2 py-0.5 rounded-md">
                    {user.role === 'ADMIN' ? 'Boshqaruv' : "Yo'l muhandisi"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditTitle(selectedFeature.title);
                        setEditDescription(selectedFeature.description);
                        setEditSeverity(selectedFeature.severity);
                        setEditType(selectedFeature.featureType);
                        setIsEditingFeature(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-innerSoftArea dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Tahrirlash</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteFeature}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-innerSoftArea dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>O'chirish</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Inline Edit Form for Road Engineer and Admin */
            <div className="mt-3 space-y-2.5">
              <div>
                <label className="text-[10px] font-black text-textSecondary uppercase tracking-wider block mb-1">
                  Sarlavha
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-innerSoftArea dark:bg-gray-800 border border-yolBorder dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-textPrimary dark:text-darkText focus:outline-none focus:ring-2 focus:ring-accentOrange"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-textSecondary uppercase tracking-wider block mb-1">
                  Batafsil izoh
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-innerSoftArea dark:bg-gray-800 border border-yolBorder dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-medium text-textPrimary dark:text-darkText focus:outline-none focus:ring-2 focus:ring-accentOrange"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-textSecondary uppercase tracking-wider block mb-1">
                    Muammo turi
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full bg-innerSoftArea dark:bg-gray-800 border border-yolBorder dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-textPrimary dark:text-darkText focus:outline-none"
                  >
                    <option value="accident">Avtohalokat (Accident)</option>
                    <option value="traffic">Tirbandlik (Traffic)</option>
                    <option value="roadwork">Yo'l ta'mirlash (Roadwork)</option>
                    <option value="closure">Yo'l yopilishi (Closure)</option>
                    <option value="hazard">Xavfli to'siq (Hazard)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-textSecondary uppercase tracking-wider block mb-1">
                    Xavf darajasi
                  </label>
                  <select
                    value={editSeverity}
                    onChange={(e) => setEditSeverity(e.target.value as any)}
                    className="w-full bg-innerSoftArea dark:bg-gray-800 border border-yolBorder dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-textPrimary dark:text-darkText focus:outline-none"
                  >
                    <option value="low">Past (Low)</option>
                    <option value="medium">O'rtacha (Medium)</option>
                    <option value="high">Yuqori (High)</option>
                    <option value="urgent">Shoshilinch (Urgent)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingFeature(false)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-textSecondary hover:text-textPrimary"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  disabled={isSavingFeature}
                  onClick={handleSaveEditFeature}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blackPill hover:bg-blackPillHover text-white text-xs font-bold shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingFeature ? 'Saqlanmoqda...' : 'Saqlash'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 9. Selected User Report Popup */}
      {selectedUserReport && (
        <div className="absolute bottom-12 md:bottom-24 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-md max-h-[60vh] md:max-h-none overflow-y-auto bg-white dark:bg-darkCard p-4 md:p-5 rounded-card shadow-float border border-yolBorder dark:border-darkBorder animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orangeTint text-accentOrange flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-accentOrange uppercase">
                  {t('map.yourReport')} ({selectedUserReport.id})
                </span>
                <h3 className="font-bold text-base text-textPrimary dark:text-darkText leading-tight">
                  {selectedUserReport.title}
                </h3>
              </div>
            </div>
            <button
              onClick={() => setSelectedUserReport(null)}
              className="text-textSecondary hover:text-textPrimary p-1"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-textSecondary dark:text-darkTextSec mt-2">
            {selectedUserReport.description || t('myReports.noDetails')}
          </p>

          <div className="mt-3 p-2 rounded-xl bg-innerSoftArea dark:bg-gray-800 text-xs flex justify-between items-center">
            <span>Status:</span>
            <span className="font-bold text-accentOrange uppercase">
              {t(`myReports.statuses.${selectedUserReport.status}`) || selectedUserReport.status}
            </span>
          </div>

          {user && (user.role === 'ADMIN' || user.role === 'EDITOR' || user.id === selectedUserReport.reporterId) && (
            <div className="flex justify-end pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={handleDeleteUserReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 text-xs font-bold hover:bg-red-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>O'chirish</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 10. Selected Gas Station Modal / Card (Real-time Fuel Telemetry & Queue) */}
      {selectedGasStation && (() => {
        const hasMetan = selectedGasStation.fuels.includes('metan') && Boolean(
          (selectedGasStation.pressureBar && selectedGasStation.pressureBar > 0) || 
          selectedGasStation.pricePerUnit?.metan || 
          selectedGasStation.prices?.metan
        );
        const hasPetrol = selectedGasStation.fuels.includes('petrol') || Boolean(
          selectedGasStation.pricePerUnit?.ai92 || 
          selectedGasStation.pricePerUnit?.ai80 || 
          selectedGasStation.prices?.ai92
        );

        return (
          <div className="absolute bottom-12 md:bottom-24 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-md max-h-[60vh] md:max-h-none overflow-y-auto bg-white dark:bg-darkCard p-4 md:p-5 rounded-card shadow-float border border-yolBorder dark:border-darkBorder animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  !selectedGasStation.isOpen
                    ? 'bg-innerSoftArea text-textSecondary dark:bg-gray-800'
                    : 'bg-orangeTint text-accentOrange dark:bg-orange-950/60'
                }`}>
                  <Fuel className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-innerSoftArea dark:bg-gray-800 text-textPrimary dark:text-darkText">
                      {selectedGasStation.brand}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      selectedGasStation.isOpen
                        ? 'bg-blackPill text-white border border-blackPill'
                        : 'bg-innerSoftArea text-textSecondary border border-yolBorder'
                    }`}>
                      {selectedGasStation.isOpen ? "Ochiq (24/7)" : "Vaqtincha yopiq"}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-textPrimary dark:text-darkText leading-tight mt-1">
                    {selectedGasStation.name}
                  </h3>
                  <p className="text-xs text-textSecondary dark:text-darkTextSec line-clamp-1">
                    {selectedGasStation.address}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGasStation(null)}
                className="text-textSecondary hover:text-textPrimary p-1.5 rounded-full hover:bg-innerSoftArea dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Telemetry Row: Live Metan Pressure OR Benzin Status & Live Queue */}
            <div className="grid grid-cols-2 gap-2.5 my-3.5">
              {hasMetan ? (
                /* Metan Pressure Meter */
                <div className="p-3 rounded-2xl bg-innerSoftArea dark:bg-gray-800 border border-yolBorder dark:border-gray-700 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-bold text-textSecondary dark:text-darkTextSec">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-accentOrange" />
                      Metan Bosimi
                    </span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                      (selectedGasStation.pressureBar ?? 0) >= 190
                        ? 'bg-blackPill text-white'
                        : 'bg-accentOrange text-white'
                    }`}>
                      {(selectedGasStation.pressureBar ?? 0) >= 190 ? "A'lo" : (selectedGasStation.pressureBar ?? 0) >= 170 ? "O'rtacha" : "Past"}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-textPrimary dark:text-darkText">
                      {selectedGasStation.pressureBar ?? 0}
                    </span>
                    <span className="text-xs font-bold text-textSecondary dark:text-darkTextSec">Bar</span>
                  </div>
                  {/* Pressure Bar Visual Gauge */}
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                    <div 
                      className="h-full rounded-full transition-all duration-500 bg-accentOrange"
                      style={{ width: `${Math.min(100, Math.max(10, ((selectedGasStation.pressureBar ?? 0) / 240) * 100))}%` }}
                    />
                  </div>
                </div>
              ) : (
                /* Benzin / AQS Status Box (NO Metan shown) */
                <div className="p-3 rounded-2xl bg-innerSoftArea dark:bg-gray-800 border border-yolBorder dark:border-gray-700 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-bold text-textSecondary dark:text-darkTextSec">
                    <span className="flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-accentOrange" />
                      Benzin Holati
                    </span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blackPill text-white">
                      Mavjud
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="text-base font-black text-textPrimary dark:text-darkText">
                      AI-92 / AI-95
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-accentOrange mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-accentOrange shrink-0" />
                    <span className="truncate">{selectedGasStation.statusNote ? "Sifat kafolatlangan" : "Zaxirada to'liq"}</span>
                  </div>
                </div>
              )}

              {/* Live Queue & Waiting Time */}
              <div className="p-3 rounded-2xl bg-innerSoftArea dark:bg-gray-800 border border-yolBorder dark:border-gray-700 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-textSecondary dark:text-darkTextSec">
                  <span className="flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-accentOrange" />
                    Jonli Navbat
                  </span>
                  <span className="text-[10px] font-bold text-accentOrange">
                    ~{selectedGasStation.estimatedWaitMinutes || selectedGasStation.waitMinutesEstimated || 5} daqiqa
                  </span>
                </div>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-textPrimary dark:text-darkText">
                    {selectedGasStation.queueCarsCount}
                  </span>
                  <span className="text-xs font-bold text-textSecondary dark:text-darkTextSec">ta mashina</span>
                </div>
                <div className="text-[10px] text-textSecondary dark:text-darkTextSec mt-2 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-accentOrange animate-pulse" />
                  <span>Yangilandi: {selectedGasStation.updatedAt ? new Date(selectedGasStation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${selectedGasStation.lastReportedMinutesAgo || 3} daqiqa oldin`}</span>
                </div>
              </div>
            </div>

            {/* Fuel Types & Pricing Badges */}
            {(() => {
              const rawMetan = selectedGasStation.prices?.metan || selectedGasStation.pricePerUnit?.metan;
              const metanPrice = hasMetan ? ((rawMetan && rawMetan >= 5000) ? rawMetan : (selectedGasStation.fuels.includes('metan') ? 5750 : null)) : null;

              const rawPropan = selectedGasStation.prices?.propan || selectedGasStation.pricePerUnit?.propan;
              const propanPrice = (rawPropan && rawPropan >= 7000) ? rawPropan : (selectedGasStation.fuels.includes('propan') ? 9500 : null);

              const rawAi80 = selectedGasStation.prices?.ai80 || selectedGasStation.pricePerUnit?.ai80;
              const ai80Price = (rawAi80 && rawAi80 >= 8500) ? rawAi80 : (['UNG Petro', 'Saneg', 'Mustang', 'Poytaxt Oil'].includes(selectedGasStation.brand) ? 9100 : null);

              const rawAi92 = selectedGasStation.prices?.ai92 || selectedGasStation.pricePerUnit?.ai92 || selectedGasStation.pricePerUnit?.petrolAi92;
              const ai92Price = (rawAi92 && rawAi92 >= 10500) ? rawAi92 : (hasPetrol ? (selectedGasStation.brand === 'Lukoil' ? 13800 : selectedGasStation.brand === 'Tatneft' ? 13000 : 11900) : null);

              const rawAi95 = selectedGasStation.prices?.ai95 || selectedGasStation.pricePerUnit?.ai95;
              const ai95Price = (rawAi95 && rawAi95 >= 15000) ? rawAi95 : (hasPetrol ? (['Lukoil', 'Tatneft'].includes(selectedGasStation.brand) ? 21000 : 19500) : null);

              const rawAi98 = selectedGasStation.prices?.ai98 || selectedGasStation.pricePerUnit?.ai98;
              const ai98Price = (rawAi98 && rawAi98 >= 20000) ? rawAi98 : (selectedGasStation.brand === 'Lukoil' ? 28000 : selectedGasStation.brand === 'Tatneft' ? 27000 : null);

              const rawDiesel = selectedGasStation.prices?.diesel || selectedGasStation.pricePerUnit?.diesel;
              const dieselPrice = (rawDiesel && rawDiesel >= 14000) ? rawDiesel : (hasPetrol && ['UNG Petro', 'Lukoil', 'Tatneft', 'Saneg'].includes(selectedGasStation.brand) ? (selectedGasStation.brand === 'Lukoil' ? 18500 : 17500) : null);

              return (
                <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                  {hasMetan && metanPrice && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orangeTint dark:bg-orange-950/40 text-accentOrange border border-orange-200 dark:border-orange-800 text-xs font-bold">
                      <span>Metan:</span>
                      <span className="font-extrabold">{metanPrice.toLocaleString()} so'm/m³</span>
                    </div>
                  )}
                  {propanPrice && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-innerSoftArea dark:bg-gray-800 text-textPrimary dark:text-darkText border border-yolBorder dark:border-gray-700 text-xs font-bold">
                      <span>Propan:</span>
                      <span className="font-extrabold">{propanPrice.toLocaleString()} so'm/L</span>
                    </div>
                  )}
                  {ai80Price && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-innerSoftArea dark:bg-gray-800 text-textPrimary dark:text-darkText border border-yolBorder dark:border-gray-700 text-xs font-bold">
                      <span>AI-80:</span>
                      <span className="font-extrabold">{ai80Price.toLocaleString()} so'm</span>
                    </div>
                  )}
                  {ai92Price && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-innerSoftArea dark:bg-gray-800 text-textPrimary dark:text-darkText border border-yolBorder dark:border-gray-700 text-xs font-bold">
                      <span>AI-92:</span>
                      <span className="font-extrabold">{ai92Price.toLocaleString()} so'm</span>
                    </div>
                  )}
                  {ai95Price && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-innerSoftArea dark:bg-gray-800 text-textPrimary dark:text-darkText border border-yolBorder dark:border-gray-700 text-xs font-bold">
                      <span>AI-95:</span>
                      <span className="font-extrabold">{ai95Price.toLocaleString()} so'm</span>
                    </div>
                  )}
                  {ai98Price && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-innerSoftArea dark:bg-gray-800 text-textPrimary dark:text-darkText border border-yolBorder dark:border-gray-700 text-xs font-bold">
                      <span>AI-98:</span>
                      <span className="font-extrabold">{ai98Price.toLocaleString()} so'm</span>
                    </div>
                  )}
                  {dieselPrice && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-innerSoftArea dark:bg-gray-800 text-textPrimary dark:text-darkText border border-yolBorder dark:border-gray-700 text-xs font-bold">
                      <span>Dizel:</span>
                      <span className="font-extrabold">{dieselPrice.toLocaleString()} so'm</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Driver 1-Tap Telemetry Feedback (Crowdsource) */}
            <div className="p-3 rounded-2xl bg-innerSoftArea dark:bg-gray-800/80 border border-yolBorder dark:border-gray-700 mb-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-textPrimary dark:text-darkText uppercase tracking-wider">
                  Haydovchilar tasdiqlashi (1-Tap):
                </span>
                <span className="text-[10px] font-bold text-accentOrange">
                  +{selectedGasStation.communityVotes?.goodPressure || 0} ovoz
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {hasMetan ? (
                  <button
                    type="button"
                    disabled={isUpdatingGasStation}
                    onClick={async () => {
                      setIsUpdatingGasStation(true);
                      await reportGasStationUpdate(selectedGasStation.id, {
                        pressureBar: 205,
                        voteType: 'good_pressure'
                      });
                      setIsUpdatingGasStation(false);
                    }}
                    className="py-1.5 px-2 rounded-xl bg-white dark:bg-darkCard hover:bg-orangeTint text-accentOrange border border-yolBorder dark:border-gray-700 text-xs font-bold flex flex-col items-center gap-0.5 transition-all active:scale-95"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="text-[10px] leading-tight font-extrabold">Bosim a'lo (200+)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isUpdatingGasStation}
                    onClick={async () => {
                      setIsUpdatingGasStation(true);
                      await reportGasStationUpdate(selectedGasStation.id, {
                        voteType: 'good_pressure'
                      });
                      setIsUpdatingGasStation(false);
                    }}
                    className="py-1.5 px-2 rounded-xl bg-white dark:bg-darkCard hover:bg-orangeTint text-accentOrange border border-yolBorder dark:border-gray-700 text-xs font-bold flex flex-col items-center gap-0.5 transition-all active:scale-95"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="text-[10px] leading-tight font-extrabold">Yoqilg'i bor</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={isUpdatingGasStation}
                  onClick={async () => {
                    setIsUpdatingGasStation(true);
                    await reportGasStationUpdate(selectedGasStation.id, {
                      queueCarsCount: Math.max(1, selectedGasStation.queueCarsCount - 3),
                      voteType: 'low_queue'
                    });
                    setIsUpdatingGasStation(false);
                  }}
                  className="py-1.5 px-2 rounded-xl bg-white dark:bg-darkCard hover:bg-innerSoftArea text-textPrimary dark:text-darkText border border-yolBorder dark:border-gray-700 text-xs font-bold flex flex-col items-center gap-0.5 transition-all active:scale-95"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span className="text-[10px] leading-tight font-extrabold">Navbat kam (2-5)</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdatingGasStation}
                  onClick={async () => {
                    setIsUpdatingGasStation(true);
                    await reportGasStationUpdate(selectedGasStation.id, {
                      queueCarsCount: selectedGasStation.queueCarsCount + 5,
                      voteType: 'high_queue'
                    });
                    setIsUpdatingGasStation(false);
                  }}
                  className="py-1.5 px-2 rounded-xl bg-white dark:bg-darkCard hover:bg-orangeTint text-accentOrange border border-yolBorder dark:border-gray-700 text-xs font-bold flex flex-col items-center gap-0.5 transition-all active:scale-95"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-[10px] leading-tight font-extrabold">Navbat ko'p (15+)</span>
                </button>
              </div>
            </div>

            {/* Action Button: Route to Gas Station */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const sLat = originCoords ? originCoords.lat : userCoords.lat;
                  const sLon = originCoords ? originCoords.lon : userCoords.lon;
                  const sName = originCoords ? originCoords.name : 'Mening joylashuvim';
                  setDestinationCoords({ lat: selectedGasStation.latitude, lon: selectedGasStation.longitude, name: selectedGasStation.name });
                  requestRoute(
                    selectedGasStation.latitude,
                    selectedGasStation.longitude,
                    'car',
                    selectedGasStation.name,
                    sLat,
                    sLon,
                    sName
                  );
                  setSelectedGasStation(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-full bg-blackPill hover:bg-blackPillHover text-white text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Navigation className="w-4 h-4 fill-current text-accentOrange" />
                <span>Yo'nalish olish (B nuqta)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedGasStation(null)}
                className="py-2.5 px-4 rounded-full bg-innerSoftArea hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-textPrimary dark:text-darkText text-xs font-bold transition-colors border border-yolBorder dark:border-gray-700"
              >
                Yopish
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
