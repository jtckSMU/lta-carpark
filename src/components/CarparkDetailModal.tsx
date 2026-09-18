import React from 'react';
import { Carpark, VehicleType } from '../types';
import {
  X,
  Navigation,
  MapPin,
  Bookmark,
  BookmarkCheck,
  Zap,
  ShieldCheck,
  Clock,
  Car,
  Bike,
  Truck,
  DollarSign,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { formatDistance, getAvailabilityStatus } from '../data/singaporeCarparks';

interface CarparkDetailModalProps {
  carpark: Carpark | null;
  onClose: () => void;
  onNavigate: (carpark: Carpark) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
  vehicleType: VehicleType;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  onClose,
  onNavigate,
  onToggleFavorite,
  isFavorite,
  vehicleType,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!carpark) return null;

  const status = getAvailabilityStatus(carpark.lots_available, carpark.total_lots);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${carpark.name}, ${carpark.address}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`;
  const wazeUrl = `https://waze.com/ul?ll=${carpark.coordinates.lat},${carpark.coordinates.lng}&navigate=yes`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/70">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-xs">
                Code: {carpark.carpark_number}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                  carpark.agency === 'HDB'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : carpark.agency === 'URA'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {carpark.agency} Carpark
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                {carpark.category}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 leading-snug">{carpark.name}</h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{carpark.address}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="detail-modal-bookmark-btn"
              type="button"
              onClick={() => onToggleFavorite(carpark.id)}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
              }`}
              title="Save to favorites"
            >
              {isFavorite ? (
                <BookmarkCheck className="w-4 h-4 fill-amber-500" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            <button
              id="detail-modal-close-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Live Lots Availability Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Live Lots Status
                </span>
                <div className="text-sm font-bold text-slate-800">
                  Updated: {carpark.updated_at}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  status === 'plenty'
                    ? 'bg-emerald-100 text-emerald-800'
                    : status === 'moderate'
                    ? 'bg-amber-100 text-amber-800'
                    : status === 'few'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {status === 'plenty'
                  ? 'Plenty Lots'
                  : status === 'moderate'
                  ? 'Filling Up'
                  : status === 'few'
                  ? 'Limited Lots'
                  : 'Full'}
              </span>
            </div>

            {/* Breakdown by vehicle type */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                  <Car className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cars</span>
                </div>
                <div className="font-black text-lg text-slate-900">
                  {carpark.lot_types.car.available}
                </div>
                <div className="text-[10px] text-slate-400">/{carpark.lot_types.car.total} total</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                  <Bike className="w-3.5 h-3.5 text-amber-600" />
                  <span>Motorcycles</span>
                </div>
                <div className="font-black text-lg text-slate-900">
                  {carpark.lot_types.motorcycle ? carpark.lot_types.motorcycle.available : 'N/A'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {carpark.lot_types.motorcycle
                    ? `/${carpark.lot_types.motorcycle.total} total`
                    : 'No lots'}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                  <Truck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Heavy</span>
                </div>
                <div className="font-black text-lg text-slate-900">
                  {carpark.lot_types.heavy ? carpark.lot_types.heavy.available : '0'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {carpark.lot_types.heavy ? `/${carpark.lot_types.heavy.total} total` : 'None'}
                </div>
              </div>
            </div>
          </div>

          {/* Rates Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Singapore Parking Rates & Charges
            </h3>
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
              <div className="p-3 flex items-start justify-between gap-4">
                <span className="font-semibold text-slate-700 shrink-0">Monday – Friday</span>
                <span className="text-slate-600 text-right">{carpark.rates.weekday}</span>
              </div>
              <div className="p-3 flex items-start justify-between gap-4">
                <span className="font-semibold text-slate-700 shrink-0">Saturday</span>
                <span className="text-slate-600 text-right">{carpark.rates.saturday}</span>
              </div>
              <div className="p-3 flex items-start justify-between gap-4">
                <span className="font-semibold text-slate-700 shrink-0">Sunday & Public Hols</span>
                <span className="text-slate-600 text-right font-medium text-emerald-700">
                  {carpark.rates.sunday_ph}
                </span>
              </div>
              <div className="p-3 flex items-start justify-between gap-4 bg-slate-50">
                <span className="font-semibold text-slate-700 shrink-0">Grace Period</span>
                <span className="text-slate-600 text-right font-medium">
                  {carpark.rates.grace_period_mins} minutes free drop-off
                </span>
              </div>
              {carpark.rates.night_parking_cap && (
                <div className="p-3 flex items-start justify-between gap-4 bg-blue-50/50">
                  <span className="font-semibold text-blue-900 shrink-0">Night Parking Cap</span>
                  <span className="text-blue-800 text-right font-medium">
                    {carpark.rates.night_parking_cap}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Specifications & Amenities */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Carpark Specifications & Amenities
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0">
                  {carpark.height_clearance_m}m
                </div>
                <div>
                  <div className="font-bold text-slate-800">Clearance Height</div>
                  <div className="text-slate-400 text-[11px]">Check vehicle height</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">EV Fast Charging</div>
                  <div className="text-slate-400 text-[11px]">
                    {carpark.features.ev_chargers
                      ? `${carpark.features.ev_chargers} ports available`
                      : 'No chargers'}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Carpark Type</div>
                  <div className="text-slate-400 text-[11px]">
                    {carpark.features.sheltered ? 'Multi-storey (Sheltered)' : 'Open-Air Surface'}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Gantry System</div>
                  <div className="text-slate-400 text-[11px]">
                    {carpark.features.electronic_parking ? 'Electronic Parking (EPS)' : 'Coupon / App'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center gap-2.5">
          <button
            id="copy-address-btn"
            type="button"
            onClick={handleCopyAddress}
            className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
            title="Copy address"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <a
            id="open-waze-btn"
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Waze</span>
          </a>

          <a
            id="open-gmaps-btn"
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
};
