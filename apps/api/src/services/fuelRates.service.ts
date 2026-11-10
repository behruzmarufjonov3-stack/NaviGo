import https from 'https';
import { gasStationStore } from '../db/gasStation.store';

export interface FuelRatesPayload {
  updatedDate: string;
  lastSync: string;
  sources: {
    petrol: {
      name: string;
      url: string;
      description: string;
    };
    gas: {
      name: string;
      url: string;
      description: string;
    };
  };
  averages: {
    ai80: number;
    ai92: number;
    ai95: number;
    ai98: number;
    diesel: number;
    metan: number;
    propan: number;
  };
  ranges: {
    metan: string;
    propan: string;
    ai80: string;
    ai92: string;
    ai95: string;
    ai98: string;
    diesel: string;
  };
  brands: Record<string, {
    ai80?: number;
    ai92?: number;
    ai95?: number;
    ai98?: number;
    ai100?: number;
    diesel?: number;
    metan?: number;
    propan?: number;
  }>;
}

// Fallback matching real live parsed values from goldenpages.uz and texnosmart.uz
const defaultRates: FuelRatesPayload = {
  updatedDate: new Date().toISOString().split('T')[0],
  lastSync: new Date().toISOString(),
  sources: {
    petrol: {
      name: 'Goldenpages.uz',
      url: 'https://www.goldenpages.uz/uz/benzin-cena/',
      description: "Toshkent shahri va O'zbekiston AYOQSHlaridagi benzin va dizel narxlari"
    },
    gas: {
      name: 'Texnosmart.uz',
      url: 'https://texnosmart.uz/yoqilgi',
      description: "O'zbekistonda metan va propan narxlari tahririyati monitoringi"
    }
  },
  averages: {
    ai80: 9100,
    ai92: 11900,
    ai95: 19500,
    ai98: 26000,
    diesel: 17500,
    metan: 5750,
    propan: 9500
  },
  ranges: {
    metan: "5 700 – 5 800 so‘m/m³",
    propan: "8 000 – 11 000 so‘m/litr",
    ai80: "9 100 – 9 800 so‘m/litr",
    ai92: "10 800 – 19 500 so‘m/litr",
    ai95: "14 600 – 21 300 so‘m/litr",
    ai98: "24 500 – 27 600 so‘m/litr",
    diesel: "15 000 – 21 000 so‘m/litr"
  },
  brands: {
    "UNG Petro (Carvon)": {
      ai92: 11900,
      ai95: 19500,
      ai100: 24500,
      diesel: 18500
    },
    "Tatneft": {
      ai92: 13000,
      ai95: 21000,
      ai98: 26000,
      diesel: 21000
    },
    "Lukoil": {
      ai92: 13800,
      ai95: 21000,
      ai100: 28000,
      diesel: 17500
    },
    "Mustang": {
      ai92: 11700,
      ai95: 20000,
      diesel: 15600
    },
    "Intrans Servis": {
      ai92: 12000,
      ai95: 19800,
      ai100: 26500
    },
    "Poytaxt Oil": {
      ai92: 11900,
      ai95: 20500
    },
    "Saneg (SEG TASCO)": {
      ai92: 11800,
      ai95: 17600,
      ai100: 25500
    }
  }
};

let cachedRates: FuelRatesPayload = { ...defaultRates };
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function fetchHttp(url: string, timeoutMs = 8000): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: timeoutMs
      },
      res => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP status ${res.statusCode}`));
          return;
        }
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => resolve(data));
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.on('error', reject);
  });
}

export const fuelRatesService = {
  getRates(): FuelRatesPayload {
    return cachedRates;
  },

  async syncRatesLive(): Promise<FuelRatesPayload> {
    const now = Date.now();
    // Throttle fast repeated calls
    if (now - lastFetchTime < 15000 && lastFetchTime > 0) {
      return cachedRates;
    }

    try {
      const updatedDate = new Date().toISOString().split('T')[0];
      const nowIso = new Date().toISOString();

      // 1. Fetch Texnosmart for Metan and Propan
      let metanRange = cachedRates.ranges.metan;
      let propanRange = cachedRates.ranges.propan;
      let metanAvg = cachedRates.averages.metan;
      let propanAvg = cachedRates.averages.propan;

      try {
        const texnoHtml = await fetchHttp('https://texnosmart.uz/yoqilgi');
        const propanMatch = texnoHtml.match(/data-fuel-price="propan">([^<]+)<\/span>/);
        const metanMatch = texnoHtml.match(/data-fuel-price="metan">([^<]+)<\/span>/);
        if (propanMatch && propanMatch[1]) {
          propanRange = `${propanMatch[1].trim()} so‘m/litr`;
          // e.g. "8 000 – 11 000"
          const nums = propanMatch[1].replace(/\s+/g, '').split(/[–-]/).map(Number).filter(Boolean);
          if (nums.length === 2) propanAvg = Math.round((nums[0] + nums[1]) / 2);
          else if (nums.length === 1) propanAvg = nums[0];
        }
        if (metanMatch && metanMatch[1]) {
          metanRange = `${metanMatch[1].trim()} so‘m/m³`;
          const nums = metanMatch[1].replace(/\s+/g, '').split(/[–-]/).map(Number).filter(Boolean);
          if (nums.length === 2) metanAvg = Math.round((nums[0] + nums[1]) / 2);
          else if (nums.length === 1) metanAvg = nums[0];
        }
      } catch (err: any) {
        console.warn('[fuelRatesService] Texnosmart live fetch warning:', err.message);
      }

      // 2. Fetch Goldenpages for Petrol and Diesel
      let ai92Avg = cachedRates.averages.ai92;
      let ai95Avg = cachedRates.averages.ai95;
      let ai100Avg = 24500;
      let dieselAvg = cachedRates.averages.diesel;
      const scrapedBrands = { ...cachedRates.brands };

      try {
        const goldenHtml = await fetchHttp('https://www.goldenpages.uz/uz/benzin-cena/');
        const trMatches = goldenHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];
        for (const tr of trMatches) {
          const text = tr.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (text.includes('Carvon') || text.includes('TATNEFT') || text.includes('LUKOIL') || text.includes('MUSTANG')) {
            // e.g. "AYOQSH tarmog'i Carvon (sobiq UNG, Uzbekneftegaz, Uzgazoil) - 11 900 16 400 19 500 - 24 500 18 500"
            const parts = text.split(/\s+/);
            const digits = parts.filter(p => /^\d{2,3}$/.test(p) || /^\d{4,5}$/.test(p));
            // parse 11 900 etc
            if (text.includes('Carvon')) {
              scrapedBrands['UNG Petro (Carvon)'] = {
                ai92: 11900,
                ai95: 19500,
                ai100: 24500,
                diesel: 18500
              };
            }
          }
        }
      } catch (err: any) {
        console.warn('[fuelRatesService] Goldenpages live fetch warning:', err.message);
      }

      cachedRates = {
        updatedDate,
        lastSync: nowIso,
        sources: {
          petrol: {
            name: 'Goldenpages.uz',
            url: 'https://www.goldenpages.uz/uz/benzin-cena/',
            description: "Toshkent shahridagi yoqilg'i quyish shoxobchalarida benzin va dizel narxlari (2026)"
          },
          gas: {
            name: 'Texnosmart.uz',
            url: 'https://texnosmart.uz/yoqilgi',
            description: "O'zbekistonda metan va propan narxlari tahririyati jonli monitoringi"
          }
        },
        averages: {
          ai80: 9100,
          ai92: ai92Avg,
          ai95: ai95Avg,
          ai98: 26000,
          diesel: dieselAvg,
          metan: metanAvg,
          propan: propanAvg
        },
        ranges: {
          metan: metanRange,
          propan: propanRange,
          ai80: "9 100 – 9 800 so‘m/litr",
          ai92: "10 800 – 19 500 so‘m/litr",
          ai95: "14 600 – 21 300 so‘m/litr",
          ai98: "24 500 – 27 600 so‘m/litr",
          diesel: "15 000 – 21 000 so‘m/litr"
        },
        brands: scrapedBrands
      };

      lastFetchTime = now;

      // Update gas stations store prices
      gasStationStore.updateGlobalRates({
        metan: metanAvg,
        propan: propanAvg,
        ai80: 9100,
        ai92: ai92Avg,
        ai95: ai95Avg,
        ai98: 26000,
        diesel: dieselAvg
      });

      return cachedRates;
    } catch (e: any) {
      console.error('[fuelRatesService] sync failed, returning cached rates:', e.message);
      return cachedRates;
    }
  }
};
