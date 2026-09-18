export type VehicleType = 'car' | 'motorcycle' | 'heavy';
export type CarparkAgency = 'HDB' | 'URA' | 'LTA' | 'Commercial';
export type AvailabilityStatus = 'plenty' | 'moderate' | 'few' | 'full';

export interface LotTypeData {
  available: number;
  total: number;
}

export interface RatesInfo {
  weekday: string;
  saturday: string;
  sunday_ph: string;
  grace_period_mins: number;
  per_half_hour_est: number; // approximate rate for sorting
  night_parking_cap?: string;
  free_parking_window?: string;
}

export interface Carpark {
  id: string;
  carpark_number: string;
  name: string;
  address: string;
  agency: CarparkAgency;
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceMeters?: number;
  total_lots: number;
  lots_available: number;
  lot_types: {
    car: LotTypeData;
    motorcycle?: LotTypeData;
    heavy?: LotTypeData;
  };
  rates: RatesInfo;
  height_clearance_m: number;
  features: {
    ev_chargers?: number;
    sheltered: boolean;
    electronic_parking: boolean; // EPS
    washing_bay?: boolean;
    accessible_lots?: number;
  };
  updated_at: string;
  category: 'Shopping' | 'Residential' | 'CBD' | 'Food & Cultural' | 'Transport Hub';
  is_favorite?: boolean;
}

export interface LocationPreset {
  name: string;
  area: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  popular?: boolean;
}

export interface FilterOptions {
  vehicleType: VehicleType;
  minLotsAvailable: number;
  agency: 'all' | CarparkAgency;
  shelteredOnly: boolean;
  hasEvCharger: boolean;
  sortBy: 'distance' | 'availability' | 'price';
}

export type NavTab = 'map' | 'list' | 'saved' | 'info';
