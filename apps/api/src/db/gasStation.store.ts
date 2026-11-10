import { GasStation, GasStationUpdatePayload, GasType } from '@yol/shared';

class GasStationStore {
  private stations: Map<string, GasStation> = new Map();

  constructor() {
    this.initDefaultStations();
  }

  private initDefaultStations() {
    const list: GasStation[] = [
      // ==========================================
      // BENZIN SHOHOBCHALARI (AQS) - TASHKENT & HIGHWAYS
      // ==========================================
      {
        id: 'petrol-ung-bunyodkor',
        name: 'UNG Petro AQS #15 (Bunyodkor)',
        brand: 'UNG Petro',
        fuels: ['petrol'],
        latitude: 41.2750,
        longitude: 69.2120,
        city: 'Toshkent',
        address: 'Chilonzor tumani, Bunyodkor shoh ko‘chasi, 27',
        isOpen: true,
        queueCarsCount: 3,
        waitMinutesEstimated: 4,
        pricePerUnit: { 
          ai80: 8200, 
          ai92: 9800, 
          ai95: 12500, 
          diesel: 11800 
        },
        lastReportedMinutesAgo: 2,
        verifiedByDriversCount: 142,
        statusNote: "Barcha yoqilg'i turlari (AI-80, 92, 95, Dizel) to'liq mavjud. To'lov karta va naqd."
      },
      {
        id: 'petrol-ung-sergeli',
        name: 'UNG Petro AQS #42 (Sergeli)',
        brand: 'UNG Petro',
        fuels: ['petrol'],
        latitude: 41.2210,
        longitude: 69.2150,
        city: 'Toshkent',
        address: 'Sergeli tumani, Yangi Sergeli ko‘chasi, 44',
        isOpen: true,
        queueCarsCount: 2,
        waitMinutesEstimated: 3,
        pricePerUnit: { 
          ai80: 8200, 
          ai92: 9800, 
          ai95: 12500, 
          diesel: 11800 
        },
        lastReportedMinutesAgo: 3,
        verifiedByDriversCount: 98,
        statusNote: "AI-92 va AI-95 yuqori sifat, navbatsiz xizmat."
      },
      {
        id: 'petrol-ung-yunusobod',
        name: 'UNG Petro AQS #08 (Amir Temur)',
        brand: 'UNG Petro',
        fuels: ['petrol'],
        latitude: 41.3520,
        longitude: 69.2880,
        city: 'Toshkent',
        address: 'Yunusobod tumani, Amir Temur shoh ko‘chasi, 114',
        isOpen: true,
        queueCarsCount: 4,
        waitMinutesEstimated: 5,
        pricePerUnit: { 
          ai80: 8200, 
          ai92: 9800, 
          ai95: 12500, 
          diesel: 11800 
        },
        lastReportedMinutesAgo: 5,
        verifiedByDriversCount: 124,
        statusNote: "Yunusobod markaziy filiali. AI-95 va AI-92 barqaror zaxirada."
      },
      {
        id: 'petrol-lukoil-skver',
        name: 'Lukoil Uzbekistan (Amir Temur shoxi)',
        brand: 'Lukoil',
        fuels: ['petrol'],
        latitude: 41.3180,
        longitude: 69.2840,
        city: 'Toshkent',
        address: 'Mirobod tumani, Amir Temur shox ko‘chasi, 31-uy',
        isOpen: true,
        queueCarsCount: 2,
        waitMinutesEstimated: 3,
        pricePerUnit: { 
          ai92: 10200, 
          ai95: 13200, 
          ai98: 15800, 
          diesel: 12400 
        },
        lastReportedMinutesAgo: 4,
        verifiedByDriversCount: 185,
        statusNote: "ECTO-92, ECTO-95, ECTO-100 va Dizel ECTO mavjud. Yevro-5 standart kafolati."
      },
      {
        id: 'petrol-lukoil-rohat',
        name: 'Lukoil Uzbekistan (Rohat aylanmasi)',
        brand: 'Lukoil',
        fuels: ['petrol'],
        latitude: 41.2820,
        longitude: 69.3750,
        city: 'Toshkent',
        address: 'Bektemir tumani, Rohat aylanma yo‘li, 1-bino',
        isOpen: true,
        queueCarsCount: 3,
        waitMinutesEstimated: 4,
        pricePerUnit: { 
          ai92: 10200, 
          ai95: 13200, 
          ai98: 15800, 
          diesel: 12400 
        },
        lastReportedMinutesAgo: 6,
        verifiedByDriversCount: 112,
        statusNote: "Vodiy yo'nalishidagi eng yirik Lukoil stansiyasi. ECTO navlari to'liq."
      },
      {
        id: 'petrol-tatneft-chilonzor',
        name: 'Tatneft AQS (Bunyodkor)',
        brand: 'Tatneft',
        fuels: ['petrol'],
        latitude: 41.2680,
        longitude: 69.1980,
        city: 'Toshkent',
        address: 'Chilonzor tumani, Bunyodkor ko‘chasi, 48',
        isOpen: true,
        queueCarsCount: 3,
        waitMinutesEstimated: 4,
        pricePerUnit: { 
          ai92: 10100, 
          ai95: 13000, 
          ai98: 15500, 
          diesel: 12200 
        },
        lastReportedMinutesAgo: 5,
        verifiedByDriversCount: 160,
        statusNote: "Taneco premium benzin va qishki Taneco dizel mavjud. Tezkor qatorlar."
      },
      {
        id: 'petrol-tatneft-rustaveli',
        name: 'Tatneft AQS (Shota Rustaveli)',
        brand: 'Tatneft',
        fuels: ['petrol'],
        latitude: 41.2890,
        longitude: 69.2450,
        city: 'Toshkent',
        address: 'Yakkasaroy tumani, Shota Rustaveli ko‘chasi, 82',
        isOpen: true,
        queueCarsCount: 2,
        waitMinutesEstimated: 3,
        pricePerUnit: { 
          ai92: 10100, 
          ai95: 13000, 
          ai98: 15500, 
          diesel: 12200 
        },
        lastReportedMinutesAgo: 7,
        verifiedByDriversCount: 89,
        statusNote: "AI-92, AI-95 Taneco va Dizel to'liq zaxirada. Qulay kafe xizmati."
      },
      {
        id: 'petrol-saneg-yashnobod',
        name: 'Saneg AQS (Farg‘ona yo‘li)',
        brand: 'Saneg',
        fuels: ['petrol'],
        latitude: 41.2940,
        longitude: 69.3120,
        city: 'Toshkent',
        address: 'Yashnobod tumani, Farg‘ona yo‘li ko‘chasi, 19',
        isOpen: true,
        queueCarsCount: 3,
        waitMinutesEstimated: 4,
        pricePerUnit: { 
          ai80: 8300, 
          ai92: 9800, 
          ai95: 12400, 
          diesel: 11900 
        },
        lastReportedMinutesAgo: 8,
        verifiedByDriversCount: 76,
        statusNote: "Sanoat Energetika Guruhi AQS. AI-92 va Dizel narxi hamyonbop."
      },
      {
        id: 'petrol-mustang-chilonzor',
        name: 'Mustang Petrol (Chilonzor 9)',
        brand: 'Mustang',
        fuels: ['petrol', 'propan'],
        latitude: 41.2650,
        longitude: 69.1950,
        city: 'Toshkent',
        address: 'Chilonzor 9-mavze, Kichik halqa yo‘li',
        isOpen: true,
        queueCarsCount: 4,
        waitMinutesEstimated: 5,
        pricePerUnit: { 
          ai80: 8350, 
          ai92: 9850, 
          ai95: 12500, 
          propan: 5200 
        },
        lastReportedMinutesAgo: 6,
        verifiedByDriversCount: 94,
        statusNote: "Mustang AQS: AI-92, AI-95 va Propan mavjud. Navbat 5 daqiqa."
      },
      {
        id: 'petrol-intran-oybek',
        name: 'Intran Service AQS (Oybek)',
        brand: 'Intran',
        fuels: ['petrol'],
        latitude: 41.2980,
        longitude: 69.2780,
        city: 'Toshkent',
        address: 'Mirobod tumani, Oybek ko‘chasi, 14',
        isOpen: true,
        queueCarsCount: 1,
        waitMinutesEstimated: 2,
        pricePerUnit: { 
          ai92: 10000, 
          ai95: 12800, 
          ai98: 15600, 
          diesel: 12000 
        },
        lastReportedMinutesAgo: 3,
        verifiedByDriversCount: 88,
        statusNote: "Shahar markazida navbatsiz premium benzin quyish imkoniyati."
      },
      {
        id: 'petrol-poytaxt-yunusobod',
        name: 'Poytaxt Neft AQS (19-mavze)',
        brand: 'Poytaxt Oil',
        fuels: ['petrol'],
        latitude: 41.3690,
        longitude: 69.2940,
        city: 'Toshkent',
        address: 'Yunusobod tumani, Yangi shahar ko‘chasi',
        isOpen: true,
        queueCarsCount: 3,
        waitMinutesEstimated: 4,
        pricePerUnit: { 
          ai80: 8300, 
          ai92: 9800, 
          ai95: 12400 
        },
        lastReportedMinutesAgo: 9,
        verifiedByDriversCount: 65,
        statusNote: "AI-92 va AI-95 to'liq. To'lov Click, Payme, Uzcard, Humo."
      },

      // ==========================================
      // METAN GAZ SHOXOBCHALARI (CNG)
      // ==========================================
      {
        id: 'cng-tash-chilonzor',
        name: 'Mustaqillik Metan Gaz (Kichik Halqa)',
        brand: 'Mustaqillik Gaz',
        fuels: ['metan', 'propan'],
        latitude: 41.2785,
        longitude: 69.2085,
        city: 'Toshkent',
        address: 'Chilonzor tumani, Kichik halqa yo‘li, 12-uy',
        isOpen: true,
        pressureBar: 205,
        queueCarsCount: 5,
        waitMinutesEstimated: 8,
        pricePerUnit: { metan: 3800, propan: 5200 },
        lastReportedMinutesAgo: 4,
        verifiedByDriversCount: 138,
        statusNote: "Bosim a'lo darajada (205 Bar). 8 ta kolonka ishlamoqda."
      },
      {
        id: 'cng-tash-sergeli',
        name: 'Yangi Hayot CNG Metan Station',
        brand: 'UNG Petro',
        fuels: ['metan'],
        latitude: 41.2210,
        longitude: 69.2150,
        city: 'Toshkent',
        address: 'Sergeli tumani, Yangi Sergeli ko‘chasi, 52',
        isOpen: true,
        pressureBar: 215,
        queueCarsCount: 2,
        waitMinutesEstimated: 4,
        pricePerUnit: { metan: 3750 },
        lastReportedMinutesAgo: 2,
        verifiedByDriversCount: 182,
        statusNote: "Navbat juda kam. Bosim 215 Bar. To'lov barcha usullarda."
      },
      {
        id: 'cng-tash-yunusobod',
        name: 'Real Gaz Metan & Propan',
        brand: 'Real Gaz',
        fuels: ['metan', 'propan'],
        latitude: 41.3642,
        longitude: 69.2891,
        city: 'Toshkent',
        address: 'Yunusobod tumani, Amir Temur ko‘chasi, 19-mavze',
        isOpen: true,
        pressureBar: 195,
        queueCarsCount: 8,
        waitMinutesEstimated: 12,
        pricePerUnit: { metan: 3800, propan: 5150 },
        lastReportedMinutesAgo: 5,
        verifiedByDriversCount: 94,
        statusNote: "Bosim barqaror (195 Bar). 6 ta kolonka to'liq quvvatda."
      },
      {
        id: 'cng-tash-rohat',
        name: 'Rohat Aylanmasi Carvon Metan',
        brand: 'Carvon Gaz',
        fuels: ['metan', 'propan'],
        latitude: 41.2850,
        longitude: 69.3780,
        city: 'Toshkent',
        address: 'Bektemir tumani, Rohat aylanma yo‘li',
        isOpen: true,
        pressureBar: 185,
        queueCarsCount: 14,
        waitMinutesEstimated: 18,
        pricePerUnit: { metan: 3800, propan: 5300 },
        lastReportedMinutesAgo: 7,
        verifiedByDriversCount: 129,
        statusNote: "Vodiy yo'nalishidagi mashinalar ko'p. Bosim 185 Bar."
      },
      {
        id: 'cng-tash-chinoz-m39',
        name: 'Chinoz M39 Trans-Gaz Metan',
        brand: 'Mustaqillik Gaz',
        fuels: ['metan', 'propan'],
        latitude: 40.9412,
        longitude: 68.7580,
        city: 'Toshkent viloyati',
        address: 'M39 xalqaro trassasi, Chinoz posti yaqinida',
        isOpen: true,
        pressureBar: 200,
        queueCarsCount: 6,
        waitMinutesEstimated: 9,
        pricePerUnit: { metan: 3800, propan: 5200 },
        lastReportedMinutesAgo: 5,
        verifiedByDriversCount: 101,
        statusNote: "Trassa bo'yida bosim yuqori (200 Bar), yengil mashinalar tez to'ldiriladi."
      },
      {
        id: 'cng-tash-angren-a373',
        name: 'Angren Qamchiqoldi Metan (A373)',
        brand: 'UNG Petro',
        fuels: ['metan'],
        latitude: 41.0180,
        longitude: 70.1350,
        city: 'Toshkent viloyati',
        address: 'A373 trassasi, Qamchiq dovoni kirishi',
        isOpen: true,
        pressureBar: 215,
        queueCarsCount: 12,
        waitMinutesEstimated: 16,
        pricePerUnit: { metan: 3800 },
        lastReportedMinutesAgo: 6,
        verifiedByDriversCount: 155,
        statusNote: "Dovonga chiqishdan oldin to'ldirib olish tavsiya etiladi (215 Bar)."
      },
      {
        id: 'cng-sam-m39',
        name: 'Samarqand M39 Buyuk Ipak Gaz',
        brand: 'Real Gaz',
        fuels: ['metan', 'propan'],
        latitude: 39.6750,
        longitude: 66.9210,
        city: 'Samarqand',
        address: 'M39 trassasi, Samarqand aylanma yo‘li',
        isOpen: true,
        pressureBar: 195,
        queueCarsCount: 7,
        waitMinutesEstimated: 10,
        pricePerUnit: { metan: 3800, propan: 5100 },
        lastReportedMinutesAgo: 8,
        verifiedByDriversCount: 82,
        statusNote: "Bosim 195 Bar. Katta navbat yo'q, xizmat ko'rsatish tez."
      },
      {
        id: 'cng-nam-chust',
        name: 'Chust Vodiy Metan Bazasi',
        brand: 'Mustaqillik Gaz',
        fuels: ['metan', 'propan'],
        latitude: 41.0080,
        longitude: 71.2210,
        city: 'Namangan',
        address: 'Chust shahri, Kosonsoy yo‘li yoqasi',
        isOpen: true,
        pressureBar: 205,
        queueCarsCount: 6,
        waitMinutesEstimated: 9,
        pricePerUnit: { metan: 3800, propan: 5300 },
        lastReportedMinutesAgo: 3,
        verifiedByDriversCount: 87,
        statusNote: "Bosim 205 Bar. Navbat tez o'tmoqda."
      },

      // ==========================================
      // PROPAN SHOXOBCHALARI (LPG)
      // ==========================================
      {
        id: 'propan-tash-mustang',
        name: 'Mustang Propan Servis (Chilonzor)',
        brand: 'Mustang',
        fuels: ['propan'],
        latitude: 41.2650,
        longitude: 69.1950,
        city: 'Toshkent',
        address: 'Chilonzor 9-mavze, Bunyodkor ko‘chasi',
        isOpen: true,
        queueCarsCount: 3,
        waitMinutesEstimated: 4,
        pricePerUnit: { propan: 5200 },
        lastReportedMinutesAgo: 4,
        verifiedByDriversCount: 78,
        statusNote: "Toza suyuqlashtirilgan gaz (LPG). 1 litr 5,200 so'm."
      },
      {
        id: 'propan-tash-rohat-lpg',
        name: 'Rohat Eko-Propan Carvon Gaz',
        brand: 'Carvon Gaz',
        fuels: ['propan'],
        latitude: 41.2850,
        longitude: 69.3780,
        city: 'Toshkent',
        address: 'Bektemir tumani, Rohat aylanmasi',
        isOpen: true,
        queueCarsCount: 5,
        waitMinutesEstimated: 6,
        pricePerUnit: { propan: 5300 },
        lastReportedMinutesAgo: 6,
        verifiedByDriversCount: 64,
        statusNote: "Vodiy yo'lidagi propan quyish nuqtasi. 1 litr 5,300 so'm."
      },
      {
        id: 'propan-tash-sergeli-lpg',
        name: 'Sergeli LPG Propan Servis',
        brand: 'Real Gaz',
        fuels: ['propan'],
        latitude: 41.2280,
        longitude: 69.2220,
        city: 'Toshkent',
        address: 'Sergeli tumani, Yangi Sergeli yo‘li',
        isOpen: true,
        queueCarsCount: 2,
        waitMinutesEstimated: 3,
        pricePerUnit: { propan: 5200 },
        lastReportedMinutesAgo: 5,
        verifiedByDriversCount: 52,
        statusNote: "Sifatli propan, navbatsiz xizmat."
      }
    ];

    list.forEach(s => {
      s.prices = s.prices || s.pricePerUnit;
      s.estimatedWaitMinutes = s.estimatedWaitMinutes ?? s.waitMinutesEstimated;
      s.updatedAt = s.updatedAt || new Date().toISOString();
      s.communityVotes = s.communityVotes || { goodPressure: 28, lowQueue: 14, highQueue: 3, closed: 0 };
      this.stations.set(s.id, s);
    });
  }

  public getAll(fuel?: string, search?: string, userLat?: number, userLon?: number): (GasStation & { distanceKm?: number })[] {
    let result = Array.from(this.stations.values());

    if (fuel && fuel !== 'all') {
      result = result.filter(s => s.fuels.includes(fuel as GasType));
    }

    if (search) {
      const q = search.trim().toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.brand.toLowerCase().includes(q)
      );
    }

    // Attach distance if GPS given
    if (userLat !== undefined && userLon !== undefined) {
      return result.map(s => {
        const dLat = (s.latitude - userLat) * (Math.PI / 180);
        const dLon = (s.longitude - userLon) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(userLat * (Math.PI / 180)) *
            Math.cos(s.latitude * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const distanceKm = Number((6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
        return { ...s, distanceKm };
      }).sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }

    return result;
  }

  public getById(id: string): GasStation | undefined {
    return this.stations.get(id);
  }

  public updateReport(id: string, payload: GasStationUpdatePayload): GasStation | undefined {
    const station = this.stations.get(id);
    if (!station) return undefined;

    if (payload.isOpen !== undefined) {
      station.isOpen = payload.isOpen;
    }
    if (payload.pressureBar !== undefined) {
      station.pressureBar = payload.pressureBar;
    }
    if (payload.queueCarsCount !== undefined) {
      station.queueCarsCount = payload.queueCarsCount;
      station.waitMinutesEstimated = Math.max(2, Math.round(payload.queueCarsCount * 1.5));
    }
    if (payload.note) {
      station.statusNote = payload.note;
    }

    if (payload.voteType) {
      if (!station.communityVotes) {
        station.communityVotes = { goodPressure: 28, lowQueue: 14, highQueue: 3, closed: 0 };
      }
      if (payload.voteType === 'good_pressure') {
        station.communityVotes.goodPressure = (station.communityVotes.goodPressure || 0) + 1;
      } else if (payload.voteType === 'low_queue') {
        station.communityVotes.lowQueue = (station.communityVotes.lowQueue || 0) + 1;
      } else if (payload.voteType === 'high_queue') {
        station.communityVotes.highQueue = (station.communityVotes.highQueue || 0) + 1;
      }
    }

    station.lastReportedMinutesAgo = 0;
    station.verifiedByDriversCount += 1;
    station.updatedAt = new Date().toISOString();
    station.estimatedWaitMinutes = station.waitMinutesEstimated;
    station.prices = station.prices || station.pricePerUnit;
    this.stations.set(id, station);
    return station;
  }

  public updateGlobalRates(rates: {
    metan: number;
    propan: number;
    ai80: number;
    ai92: number;
    ai95: number;
    ai98: number;
    diesel: number;
  }) {
    for (const [id, station] of this.stations.entries()) {
      if (station.fuels.includes('metan') && station.pricePerUnit?.metan !== undefined) {
        station.pricePerUnit.metan = rates.metan;
        if (station.prices) station.prices.metan = rates.metan;
      }
      if (station.fuels.includes('propan') && station.pricePerUnit?.propan !== undefined) {
        station.pricePerUnit.propan = rates.propan;
        if (station.prices) station.prices.propan = rates.propan;
      }
      if (station.fuels.includes('petrol') && station.pricePerUnit) {
        if (station.pricePerUnit.ai80) station.pricePerUnit.ai80 = rates.ai80;
        if (station.pricePerUnit.ai92) {
          if (station.brand === 'Lukoil') station.pricePerUnit.ai92 = 13800;
          else if (station.brand === 'Tatneft') station.pricePerUnit.ai92 = 13000;
          else station.pricePerUnit.ai92 = rates.ai92;
        }
        if (station.pricePerUnit.ai95) {
          if (station.brand === 'Lukoil') station.pricePerUnit.ai95 = 21000;
          else if (station.brand === 'Tatneft') station.pricePerUnit.ai95 = 21000;
          else station.pricePerUnit.ai95 = rates.ai95;
        }
        if (station.pricePerUnit.diesel) station.pricePerUnit.diesel = rates.diesel;
        station.prices = { ...station.pricePerUnit };
      }
    }
  }
}

export const gasStationStore = new GasStationStore();
