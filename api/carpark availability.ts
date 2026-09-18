import type { Request, Response } from 'express';

// LTA DataMall CarParkAvailabilityv2 endpoint
const LTA_CARPARK_API_URL = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

// 60 seconds in-memory cache (LTA updates feeds approximately every 1 minute)
interface CacheEntry {
  timestamp: number;
  data: any[];
}

let memoryCache: CacheEntry | null = null;
const CACHE_TTL_MS = 60 * 1000;

export interface LTARawRecord {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string;
  AvailableLots: number;
  LotType: 'C' | 'H' | 'Y' | string;
  Agency: 'HDB' | 'LTA' | 'URA' | string;
}

export interface FormattedCarparkRecord {
  id: string;
  carparkNumber: string;
  development: string;
  area: string;
  agency: string;
  lotType: string;
  lotTypeDescription: string;
  availableLots: number;
  totalLots: null; // Explicitly null as LTA DataMall feed does not provide total capacity
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  rawLocation: string;
}

/**
 * Fetch a single page from LTA DataMall (up to 500 records)
 */
async function fetchLtaPage(accountKey: string, skip = 0): Promise<LTARawRecord[]> {
  const url = skip > 0 ? `${LTA_CARPARK_API_URL}?$skip=${skip}` : LTA_CARPARK_API_URL;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      AccountKey: accountKey.trim(),
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `LTA DataMall API responded with status ${response.status} (${response.statusText}): ${errorText}`
    );
  }

  const json: any = await response.json();
  return Array.isArray(json.value) ? json.value : [];
}

/**
 * Fetch all available carpark lots across pages from LTA DataMall
 */
async function fetchAllLtaRecords(accountKey: string): Promise<LTARawRecord[]> {
  const allRecords: LTARawRecord[] = [];
  const pageSize = 500;
  const maxPages = 6; // Up to 3,000 lots (Singapore currently has ~2,000+ records)

  for (let page = 0; page < maxPages; page++) {
    const skip = page * pageSize;
    const records = await fetchLtaPage(accountKey, skip);
    if (!records || records.length === 0) break;
    allRecords.push(...records);
    // If fewer than 500 records returned, we reached the end of the collection
    if (records.length < pageSize) break;
  }

  return allRecords;
}

/**
 * Parse coordinates string "latitude longitude" into numeric lat/lng
 */
function parseLocation(locStr: string): { lat: number; lng: number } | null {
  if (!locStr || typeof locStr !== 'string') return null;
  const parts = locStr.trim().split(/\s+/);
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng) && lat > 1.0 && lat < 1.5 && lng > 103.5 && lng < 104.1) {
      return { lat, lng };
    }
  }
  return null;
}

function getLotTypeDescription(code: string): string {
  switch (code.toUpperCase()) {
    case 'C':
      return 'Car';
    case 'H':
      return 'Heavy Vehicle';
    case 'Y':
      return 'Motorcycle';
    default:
      return code || 'Unknown';
  }
}

/**
 * Serverless / Express handler for Carpark Availability
 * Endpoint: /api/carpark-availability or /api/carpark availability.ts
 */
export default async function handler(req: Request, res: Response) {
  // Check for AccountKey from environment variable (do not hardcode)
  const accountKey =
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_DATAMALL_KEY ||
    process.env.LTA_API_KEY;

  // Handle case where user has not provided their API key yet
  if (!accountKey || accountKey.trim() === '') {
    const responsePayload = {
      success: false,
      configured: false,
      message:
        'LTA_ACCOUNT_KEY environment variable is not configured. Please supply your LTA DataMall AccountKey in .env or your deployment environment.',
      endpoint: LTA_CARPARK_API_URL,
      requiredHeader: 'AccountKey: <LTA_ACCOUNT_KEY>',
      notes:
        'Carpark lots across HDB, LTA and URA (no total lots in this feed). Feed returns available lots, agency, coordinates, and development name.',
      timestamp: new Date().toISOString(),
      totalRecords: 0,
      data: [],
    };

    if (res && typeof res.status === 'function') {
      return res.status(200).json(responsePayload);
    }
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const forceRefresh = req.query && (req.query.refresh === 'true' || req.query.fresh === '1');
    const now = Date.now();

    let rawRecords: LTARawRecord[] = [];

    // Serve from memory cache if fresh
    if (!forceRefresh && memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
      rawRecords = memoryCache.data;
    } else {
      // Fetch fresh data from LTA DataMall
      const skipParam = req.query && typeof req.query.skip === 'string' ? parseInt(req.query.skip, 10) : NaN;
      if (!isNaN(skipParam)) {
        rawRecords = await fetchLtaPage(accountKey, skipParam);
      } else {
        rawRecords = await fetchAllLtaRecords(accountKey);
        memoryCache = { timestamp: now, data: rawRecords };
      }
    }

    // Format and normalize the records
    let formatted: FormattedCarparkRecord[] = rawRecords.map((item) => ({
      id: `${item.Agency}_${item.CarParkID}_${item.LotType}`,
      carparkNumber: item.CarParkID,
      development: item.Development || 'Carpark',
      area: item.Area || 'Singapore',
      agency: item.Agency,
      lotType: item.LotType,
      lotTypeDescription: getLotTypeDescription(item.LotType),
      availableLots: typeof item.AvailableLots === 'number' ? item.AvailableLots : parseInt(String(item.AvailableLots), 10) || 0,
      totalLots: null, // As specified: no total lots in this feed
      coordinates: parseLocation(item.Location),
      rawLocation: item.Location,
    }));

    // Optional query filtering
    if (req.query) {
      if (typeof req.query.agency === 'string' && req.query.agency.trim() !== '') {
        const agencyFilter = req.query.agency.trim().toUpperCase();
        formatted = formatted.filter((item) => item.agency.toUpperCase() === agencyFilter);
      }
      if (typeof req.query.type === 'string' && req.query.type.trim() !== '') {
        const typeFilter = req.query.type.trim().toUpperCase();
        formatted = formatted.filter((item) => item.lotType.toUpperCase() === typeFilter);
      }
      if (typeof req.query.search === 'string' && req.query.search.trim() !== '') {
        const q = req.query.search.toLowerCase();
        formatted = formatted.filter(
          (item) =>
            item.development.toLowerCase().includes(q) ||
            item.area.toLowerCase().includes(q) ||
            item.carparkNumber.toLowerCase().includes(q)
        );
      }
    }

    const payload = {
      success: true,
      configured: true,
      source: 'LTA DataMall (CarParkAvailabilityv2)',
      endpoint: LTA_CARPARK_API_URL,
      notes: 'Carpark lots across HDB, LTA and URA (no total lots in this feed)',
      timestamp: new Date().toISOString(),
      cached: Boolean(memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS && !forceRefresh),
      totalRecords: formatted.length,
      data: formatted,
    };

    if (res && typeof res.status === 'function') {
      return res.status(200).json(payload);
    }
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching LTA DataMall carpark availability:', error);

    const errorPayload = {
      success: false,
      configured: true,
      error: error?.message || 'Failed to fetch data from LTA DataMall',
      endpoint: LTA_CARPARK_API_URL,
      timestamp: new Date().toISOString(),
      data: [],
    };

    if (res && typeof res.status === 'function') {
      return res.status(502).json(errorPayload);
    }
    return new Response(JSON.stringify(errorPayload), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
