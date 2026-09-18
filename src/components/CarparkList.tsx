import React from 'react';
import { Carpark, VehicleType, FilterOptions } from '../types';
import { CarparkCard } from './CarparkCard';
import {
  SlidersHorizontal,
  RefreshCw,
  Car,
  Bike,
  Truck,
  Zap,
  Shield,
  ArrowUpDown,
  AlertCircle,
} from 'lucide-react';

interface CarparkListProps {
  carparks: Carpark[];
  filters: FilterOptions;
  onUpdateFilters: (filters: Partial<FilterOptions>) => void;
  onSelectCarpark: (carpark: Carpark) => void;
  onNavigate: (carpark: Carpark) => void;
  onToggleFavorite: (id: string) => void;
  onOpenDetails: (carpark: Carpark) => void;
  onRefreshRealtime: () => void;
  isRefreshing: boolean;
  lastUpdatedTime: Date;
  searchLocationName?: string;
}

export const CarparkList: React.FC<CarparkListProps> = ({
  carparks,
  filters,
  onUpdateFilters,
  onSelectCarpark,
  onNavigate,
  onToggleFavorite,
  onOpenDetails,
  onRefreshRealtime,
  isRefreshing,
  lastUpdatedTime,
  searchLocationName = 'Singapore',
}) => {
  // Filter logic
  let filtered = carparks.filter((cp) => {
    // Agency filter
    if (filters.agency !== 'all' && cp.agency !== filters.agency) {
      return false;
    }
    // Min lots
    if (cp.lots_available < filters.minLotsAvailable) {
      return false;
    }
    // Sheltered
    if (filters.shelteredOnly && !cp.features.sheltered) {
      return false;
    }
    // EV Charger
    if (filters.hasEvCharger && !cp.features.ev_chargers) {
      return false;
    }
    return true;
  });

  // Sort logic
  filtered.sort((a, b) => {
    if (filters.sortBy === 'distance') {
      return (a.distanceMeters ?? 999999) - (b.distanceMeters ?? 999999);
    }
    if (filters.sortBy === 'availability') {
      return b.lots_available - a.lots_available;
    }
    if (filters.sortBy === 'price') {
      return a.rates.per_half_hour_est - b.rates.per_half_hour_est;
    }
    return 0;
  });

  const totalAvailableLots = filtered.reduce((acc, curr) => acc + curr.lots_available, 0);

  return (
    <div className="w-full flex flex-col h-full bg-slate-50">
      {/* Sticky Filter Bar */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-3 sticky top-0 z-10 shadow-xs">
        <div className="max-w-5xl mx-auto space-y-3">
          {/* Top Row: Vehicle Switcher & Real-time Live Refresh */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Vehicle Mode Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                id="vehicle-tab-car"
                onClick={() => onUpdateFilters({ vehicleType: 'car' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filters.vehicleType === 'car'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Cars</span>
              </button>
              <button
                type="button"
                id="vehicle-tab-motorcycle"
                onClick={() => onUpdateFilters({ vehicleType: 'motorcycle' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filters.vehicleType === 'motorcycle'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Motorcycle</span>
              </button>
              <button
                type="button"
                id="vehicle-tab-heavy"
                onClick={() => onUpdateFilters({ vehicleType: 'heavy' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filters.vehicleType === 'heavy'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Heavy</span>
              </button>
            </div>

            {/* Real-time Refresh Action */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Live simulated feed
              </span>
              <button
                id="refresh-live-lots-btn"
                type="button"
                onClick={onRefreshRealtime}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                title="Refresh real-time lot availability"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-blue-600 ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                <span className="font-semibold text-slate-800">
                  {isRefreshing ? 'Updating...' : 'Live Refresh'}
                </span>
              </button>
            </div>
          </div>

          {/* Second Row: Filters & Sort */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pt-1">
            {/* Agency Pills */}
            <div className="flex items-center gap-1.5 shrink-0">
              {(['all', 'HDB', 'URA', 'Commercial'] as const).map((agencyOption) => (
                <button
                  key={agencyOption}
                  id={`agency-filter-${agencyOption.toLowerCase()}`}
                  type="button"
                  onClick={() => onUpdateFilters({ agency: agencyOption })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                    filters.agency === agencyOption
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {agencyOption === 'all' ? 'All Agencies' : agencyOption}
                </button>
              ))}

              <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

              {/* EV Filter */}
              <button
                id="filter-ev-chargers"
                type="button"
                onClick={() => onUpdateFilters({ hasEvCharger: !filters.hasEvCharger })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                  filters.hasEvCharger
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Zap className="w-3 h-3 text-emerald-600" />
                <span>EV Charging</span>
              </button>

              {/* Lots > 30 filter */}
              <button
                id="filter-min-lots"
                type="button"
                onClick={() =>
                  onUpdateFilters({
                    minLotsAvailable: filters.minLotsAvailable > 0 ? 0 : 30,
                  })
                }
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                  filters.minLotsAvailable > 0
                    ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                &gt; 30 Lots
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="sort-carparks-select"
                value={filters.sortBy}
                onChange={(e) =>
                  onUpdateFilters({ sortBy: e.target.value as FilterOptions['sortBy'] })
                }
                className="bg-white border border-slate-200 text-xs rounded-lg px-2 py-1 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="distance">Nearest Distance</option>
                <option value="availability">Most Available Lots</option>
                <option value="price">Lowest Est. Rate</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Counter Banner */}
      <div className="max-w-5xl mx-auto w-full px-4 pt-3 pb-1 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <strong className="text-slate-800">{filtered.length}</strong> carparks near{' '}
          <strong className="text-slate-800">{searchLocationName}</strong>
        </div>
        <div className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          {totalAvailableLots.toLocaleString()} lots available
        </div>
      </div>

      {/* Carpark Cards Grid */}
      <div className="max-w-5xl mx-auto w-full p-4 flex-1">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
            {filtered.map((carpark) => (
              <CarparkCard
                key={carpark.id}
                carpark={carpark}
                onSelect={onSelectCarpark}
                onNavigate={onNavigate}
                onToggleFavorite={onToggleFavorite}
                onOpenDetails={onOpenDetails}
                isFavorite={!!carpark.is_favorite}
                vehicleType={filters.vehicleType}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No carparks match filters</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try changing your minimum lots requirement or clearing agency filters.
            </p>
            <button
              type="button"
              onClick={() =>
                onUpdateFilters({
                  agency: 'all',
                  minLotsAvailable: 0,
                  hasEvCharger: false,
                  shelteredOnly: false,
                })
              }
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
