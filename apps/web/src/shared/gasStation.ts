export type GasType = 'metan' | 'propan' | 'petrol';

export interface GasStationPrices {
  metan?: number; // UZS per m3 (e.g. 3800)
  propan?: number; // UZS per liter (e.g. 5200)
  ai80?: number; // UZS per liter (e.g. 8500)
  ai92?: number; // UZS per liter (e.g. 9800)
  ai95?: number; // UZS per liter (e.g. 12500)
  ai98?: number; // UZS per liter (e.g. 14800)
  diesel?: number; // UZS per liter (e.g. 11500)
  petrolAi92?: number;
}

export interface GasStationCommunityVotes {
  goodPressure?: number;
  lowQueue?: number;
  highQueue?: number;
  closed?: number;
}

export interface GasStation {
  id: string;
  name: string;
  brand: string;
  fuels: GasType[];
  latitude: number;
  longitude: number;
  city: string;
  address: string;
  isOpen: boolean;
  pressureBar?: number; // Metan pressure in bar: 180-220 (optimal), 130-170 (moderate), <120 (low)
  queueCarsCount: number;
  waitMinutesEstimated: number;
  estimatedWaitMinutes?: number;
  pricePerUnit: GasStationPrices;
  prices?: GasStationPrices;
  lastReportedMinutesAgo: number;
  verifiedByDriversCount: number;
  statusNote?: string;
  updatedAt?: string;
  communityVotes?: GasStationCommunityVotes;
  distanceKm?: number;
}

export interface GasStationUpdatePayload {
  stationId?: string;
  isOpen?: boolean;
  pressureBar?: number;
  queueCarsCount?: number;
  voteType?: string;
  note?: string;
}

export interface ApproachingEmergencyAlert {
  id: string;
  serviceType: '103' | '102' | '101' | '104' | '1050';
  serviceTitle: string;
  plateNumber: string;
  distanceMeters: number;
  direction: 'approaching_behind' | 'approaching_ahead' | 'passed';
  ambulanceLat: number;
  ambulanceLon: number;
  targetHospitalName?: string;
  messageUz: string;
  messageRu: string;
  messageEn: string;
  isGreenCorridorActive: boolean;
}
