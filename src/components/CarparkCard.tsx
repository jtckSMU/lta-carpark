import React from 'react';
import { Carpark, VehicleType } from '../types';
import {
  MapPin,
  Navigation,
  Bookmark,
  BookmarkCheck,
  Zap,
  ShieldCheck,
  Clock,
  Car,
  ChevronRight,
  Info,
} from 'lucide-react';
import { formatDistance, getAvailabilityStatus } from '../data/singaporeCarparks';

interface CarparkCardProps {
  carpark: Carpark;
  onSelect: (carpark: Carpark) => void;
  onNavigate: (carpark: Carpark) => void;
  onToggleFavorite: (id: string) => void;
  onOpenDetails: (carpark: Carpark) => void;
  isFavorite: boolean;
  vehicleType: VehicleType;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  onSelect,
  onNavigate,
  onToggleFavorite,
  onOpenDetails,
  isFavorite,
  vehicleType,
}) => {
  const status = getAvailabilityStatus(carpark.lots_available, carpark.total_lots);
  const occupancyPercent = Math.min(
    100,
    Math.round(((carpark.total_lots - carpark.lots_available) / carpark.total_lots) * 100)
  );

  const walkingMinutes = carpark.distanceMeters
    ? Math.max(1, Math.round(carpark.distanceMeters / 80))
    : undefined;

  return (
    <div
      id={`carpark-card-${carpark.id}`}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between group"
    >
      <div>
        {/* Header Badges & Bookmark */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {carpark.carpark_number}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                carpark.agency === 'HDB'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : carpark.agency === 'URA'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {carpark.agency}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200/60">
              {carpark.category}
            </span>
          </div>

          <button
            id={`bookmark-btn-${carpark.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(carpark.id);
            }}
            className={`p-1.5 rounded-xl transition-colors ${
              isFavorite
                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={isFavorite ? 'Remove from saved' : 'Save carpark'}
          >
            {isFavorite ? (
              <BookmarkCheck className="w-4 h-4 fill-amber-500" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Title & Distance */}
        <div className="cursor-pointer" onClick={() => onSelect(carpark)}>
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
            {carpark.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{carpark.address}</span>
          </div>

          {carpark.distanceMeters !== undefined && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mt-1.5">
              <span className="text-blue-600">
                {formatDistance(carpark.distanceMeters)} away
              </span>
              {walkingMinutes && (
                <span className="text-slate-400 font-normal">
                  (~{walkingMinutes} min walk)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Live Lot Availability Gauge */}
        <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-600">
              {vehicleType === 'motorcycle'
                ? 'Motorcycle Lots'
                : vehicleType === 'heavy'
                ? 'Heavy Vehicle Lots'
                : 'Car Lots Available'}
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-xl font-black ${
                  status === 'plenty'
                    ? 'text-emerald-600'
                    : status === 'moderate'
                    ? 'text-amber-600'
                    : status === 'few'
                    ? 'text-rose-600'
                    : 'text-slate-500'
                }`}
              >
                {carpark.lots_available}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                /{carpark.total_lots}
              </span>
            </div>
          </div>

          {/* Occupancy Progress Bar */}
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                status === 'plenty'
                  ? 'bg-emerald-500'
                  : status === 'moderate'
                  ? 'bg-amber-500'
                  : status === 'few'
                  ? 'bg-rose-500'
                  : 'bg-slate-400'
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
            <span>{occupancyPercent}% Occupied</span>
            <span
              className={`font-semibold ${
                status === 'plenty'
                  ? 'text-emerald-700'
                  : status === 'moderate'
                  ? 'text-amber-700'
                  : status === 'few'
                  ? 'text-rose-700'
                  : 'text-slate-500'
              }`}
            >
              {status === 'plenty'
                ? 'Plenty Lots'
                : status === 'moderate'
                ? 'Moderate Space'
                : status === 'few'
                ? 'Almost Full'
                : 'Carpark Full'}
            </span>
          </div>
        </div>

        {/* Rates & Highlights */}
        <div className="mt-3 space-y-1.5 text-xs">
          <div className="flex items-start gap-1.5 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{carpark.rates.weekday}</span>
          </div>

          {carpark.rates.free_parking_window && (
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <span>Free Parking: {carpark.rates.free_parking_window}</span>
            </div>
          )}
        </div>

        {/* Feature Tags */}
        <div className="flex items-center gap-2 mt-3 flex-wrap text-[11px] text-slate-500">
          {carpark.features.sheltered && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              <ShieldCheck className="w-3 h-3 text-blue-500" />
              Sheltered ({carpark.height_clearance_m}m)
            </span>
          )}
          {carpark.features.ev_chargers ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium">
              <Zap className="w-3 h-3 text-emerald-600" />
              {carpark.features.ev_chargers} EV Ports
            </span>
          ) : null}
          {carpark.features.electronic_parking && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              EPS Barrier
            </span>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
        <button
          id={`details-btn-${carpark.id}`}
          type="button"
          onClick={() => onOpenDetails(carpark)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
        >
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>Full Rates</span>
        </button>

        <button
          id={`navigate-btn-${carpark.id}`}
          type="button"
          onClick={() => onNavigate(carpark)}
          className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Directions</span>
        </button>
      </div>
    </div>
  );
};
