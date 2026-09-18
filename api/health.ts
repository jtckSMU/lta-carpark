import type { Request, Response } from 'express';

/**
 * Serverless / Express health check endpoint
 * Path: /api/health
 */
export default async function handler(req: Request, res: Response) {
  const ltaKey = process.env.LTA_ACCOUNT_KEY || process.env.LTA_DATAMALL_KEY || process.env.LTA_API_KEY;
  const isLtaConfigured = Boolean(ltaKey && ltaKey.trim().length > 0);

  const payload = {
    status: 'ok',
    service: 'Singapore Carpark Finder Serverless API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    ltaDataMall: {
      endpoint: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
      accountKeyConfigured: isLtaConfigured,
      requiredHeader: 'AccountKey: <LTA_ACCOUNT_KEY>',
      message: isLtaConfigured
        ? 'LTA_ACCOUNT_KEY is configured. Ready to fetch live carpark lots.'
        : 'LTA_ACCOUNT_KEY is not configured. Please supply your LTA DataMall AccountKey in environment variables.',
    },
  };

  if (res && typeof res.status === 'function') {
    return res.status(200).json(payload);
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
