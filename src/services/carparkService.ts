import { Carpark, VehicleType } from '../types';
import { INITIAL_CARPARKS, calculateDistanceMeters } from '../data/singaporeCarparks';

const SAVED_CARPARKS_STORAGE_KEY = 'sg_carparks_favorites_v1';

/**
 * Carpark Service
 * Handles data retrieval, distance calculations, real-time lot simulations,
 * and prepared adapters for Singapore Data.gov.sg / LTA DataMall APIs.
 */
class CarparkService {
  private carparks: Carpark[] = [];
  private savedIds: Set<string> = new Set();
  private lastUpdated: Date = new Date();

  constructor() {
    this.carparks = JSON.parse(JSON.stringify(INITIAL_CARPARKS));
    this.loadSavedFromStorage();
  }

  private loadSavedFromStorage() {
    try {
      const stored = localStorage.getItem(SAVED_CARPARKS_STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored);
        if (Array.isArray(ids)) {
          this.savedIds = new Set(ids);
        }
      }
    } catch {
      this.savedIds = new Set(['CP_ORC_01', 'CP_BUG_02']);
    }

    // sync flag
    this.carparks.forEach((cp) => {
      cp.is_favorite = this.savedIds.has(cp.id);
    });
  }

  private saveToStorage() {
    try {
      localStorage.setItem(
        SAVED_CARPARKS_STORAGE_KEY,
        JSON.stringify(Array.from(this.savedIds))
      );
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  public getCarparks(
    centerCoordinates?: { lat: number; lng: number },
    vehicleType: VehicleType = 'car'
  ): Carpark[] {
    const list = this.carparks.map((cp) => {
      let distanceMeters: number | undefined = undefined;
      if (centerCoordinates) {
        distanceMeters = calculateDistanceMeters(
          centerCoordinates.lat,
          centerCoordinates.lng,
          cp.coordinates.lat,
          cp.coordinates.lng
        );
      }

      // Determine available lots based on vehicle type
      let available = cp.lots_available;
      let total = cp.total_lots;
      if (vehicleType === 'motorcycle' && cp.lot_types.motorcycle) {
        available = cp.lot_types.motorcycle.available;
        total = cp.lot_types.motorcycle.total;
      } else if (vehicleType === 'heavy' && cp.lot_types.heavy) {
        available = cp.lot_types.heavy.available;
        total = cp.lot_types.heavy.total;
      }

      return {
        ...cp,
        lots_available: available,
        total_lots: total,
        distanceMeters,
        is_favorite: this.savedIds.has(cp.id),
      };
    });

    return list;
  }

  public toggleFavorite(id: string): boolean {
    if (this.savedIds.has(id)) {
      this.savedIds.delete(id);
    } else {
      this.savedIds.add(id);
    }
    this.saveToStorage();
    this.carparks.forEach((cp) => {
      if (cp.id === id) {
        cp.is_favorite = this.savedIds.has(id);
      }
    });
    return this.savedIds.has(id);
  }

  public isFavorite(id: string): boolean {
    return this.savedIds.has(id);
  }

  /**
   * Simulates a live real-time API push / poll
   * Slightly fluctuates lot numbers so the user sees live carpark movement
   */
  public simulateRealtimeUpdate(): Carpark[] {
    this.carparks = this.carparks.map((cp) => {
      // randomly adjust lots slightly
      const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
      const newAvail = Math.max(0, Math.min(cp.total_lots, cp.lots_available + delta));

      const updatedLotTypes = { ...cp.lot_types };
      if (updatedLotTypes.car) {
        updatedLotTypes.car.available = newAvail;
      }
      if (updatedLotTypes.motorcycle) {
        const motoDelta = Math.floor(Math.random() * 3) - 1;
        updatedLotTypes.motorcycle.available = Math.max(
          0,
          Math.min(
            updatedLotTypes.motorcycle.total,
            updatedLotTypes.motorcycle.available + motoDelta
          )
        );
      }

      return {
        ...cp,
        lots_available: newAvail,
        lot_types: updatedLotTypes,
        updated_at: 'Just now',
      };
    });

    this.lastUpdated = new Date();
    return this.carparks;
  }

  public getLastUpdated(): Date {
    return this.lastUpdated;
  }

  /**
   * Check Serverless API Health Status
   * Endpoint: /api/health
   */
  public async checkServerlessHealth(): Promise<{
    ok: boolean;
    status?: string;
    ltaConfigured?: boolean;
    message?: string;
  }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return { ok: false, message: `Status ${res.status}` };
      const json = await res.json();
      return {
        ok: true,
        status: json.status,
        ltaConfigured: Boolean(json.ltaDataMall?.accountKeyConfigured),
        message: json.ltaDataMall?.message,
      };
    } catch (e: any) {
      return { ok: false, message: e?.message || 'Failed to reach /api/health' };
    }
  }

  /**
   * Fetch Live Lots from Serverless LTA DataMall Endpoint
   * Endpoint: /api/carpark-availability
   * Endpoint feed: https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
   * Note: No total lots in this feed (available lots only)
   */
  public async fetchFromLtaDataMall(): Promise<{
    success: boolean;
    configured: boolean;
    count?: number;
    message?: string;
  }> {
    try {
      const res = await fetch('/api/carpark-availability');
      const json = await res.json();

      if (!json.configured) {
        return {
          success: false,
          configured: false,
          message: json.message || 'LTA_ACCOUNT_KEY not configured',
        };
      }

      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const liveMap = new Map<string, any>();
        json.data.forEach((item: any) => {
          if (item.carparkNumber) {
            liveMap.set(item.carparkNumber.toUpperCase(), item);
          }
        });

        // Update carparks with real-time lots from LTA feed
        let matchedCount = 0;
        this.carparks = this.carparks.map((cp) => {
          const live = liveMap.get(cp.carpark_number.toUpperCase());
          if (live) {
            matchedCount++;
            return {
              ...cp,
              lots_available: live.availableLots,
              updated_at: 'Live LTA DataMall',
            };
          }
          return cp;
        });

        this.lastUpdated = new Date();
        return {
          success: true,
          configured: true,
          count: json.data.length,
          message: `Received ${json.data.length} lots from LTA DataMall (${matchedCount} matched local spots)`,
        };
      }

      return {
        success: false,
        configured: true,
        message: json.error || 'No records returned from LTA DataMall',
      };
    } catch (e: any) {
      return {
        success: false,
        configured: true,
        message: e?.message || 'Failed to connect to /api/carpark-availability',
      };
    }
  }

  /**
   * =========================================================================
   * SG GOV API ADAPTER HOOK (For user's future live API plug-in)
   * =========================================================================
   * To connect to Singapore Data.gov.sg or LTA DataMall API:
   * 1. Data.gov.sg Real-Time Endpoint:
   *    GET https://api.data.gov.sg/v1/transport/carpark-availability
   *    Response: items[0].carpark_data[] -> { carpark_number, carpark_info: [{ total_lots, lot_type, lots_available }] }
   * 2. LTA DataMall Endpoint:
   *    GET http://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
   *    Headers: { AccountKey: 'YOUR_LTA_KEY' }
   */
  public async fetchFromDataGovSg(): Promise<boolean> {
    try {
      const response = await fetch('https://api.data.gov.sg/v1/transport/carpark-availability');
      if (!response.ok) return false;
      const data = await response.json();
      const carparkData = data.items?.[0]?.carpark_data;

      if (Array.isArray(carparkData)) {
        const mapByCode = new Map<string, any>();
        carparkData.forEach((item: any) => {
          mapByCode.set(item.carpark_number, item);
        });

        // Merge into current list if matching code exists
        this.carparks = this.carparks.map((cp) => {
          const live = mapByCode.get(cp.carpark_number);
          if (live && live.carpark_info?.length > 0) {
            const info = live.carpark_info[0];
            const avail = parseInt(info.lots_available, 10) || cp.lots_available;
            const total = parseInt(info.total_lots, 10) || cp.total_lots;
            return {
              ...cp,
              lots_available: avail,
              total_lots: total,
              updated_at: 'Live gov API',
            };
          }
          return cp;
        });

        this.lastUpdated = new Date();
        return true;
      }
      return false;
    } catch {
      // Graceful fallback to frontend state
      return false;
    }
  }
}

export const carparkService = new CarparkService();
