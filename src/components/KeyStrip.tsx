import React from 'react';
import { NavTab, VehicleType } from '../types';
import {
  Map,
  List,
  Bookmark,
  HelpCircle,
  Car,
  Bike,
  Truck,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

interface KeyStripProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  vehicleType: VehicleType;
  onChangeVehicle: (type: VehicleType) => void;
  onFocusSearch: () => void;
  onRefresh: () => void;
  onOpenHelp: () => void;
  onCycleAgency?: () => void;
  isIdle?: boolean;
  isRefreshing?: boolean;
}

export const KeyStrip: React.FC<KeyStripProps> = ({
  activeTab,
  onChangeTab,
  vehicleType,
  onChangeVehicle,
  onFocusSearch,
  onRefresh,
  onOpenHelp,
  onCycleAgency,
  isIdle = false,
  isRefreshing = false,
}) => {
  return (
    <div
      id="singapore-interactive-key-strip"
      role="toolbar"
      aria-label="Action and Shortcut Strip"
      className={`fixed bottom-[5.75rem] left-0 right-0 z-30 transition-opacity duration-300 pointer-events-none ${
        isIdle ? 'opacity-30 hover:opacity-100' : 'opacity-100'
      }`}
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-4">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 p-1.5 flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {/* Primary View Keys (M, L, S, R) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              id="keystrip-btn-map"
              onClick={() => onChangeTab('map')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Press [M] or [1] for Map View"
            >
              <kbd className="font-mono text-[10px] px-1 rounded bg-black/20 text-current">M</kbd>
              <span className="hidden sm:inline">Map</span>
            </button>

            <button
              type="button"
              id="keystrip-btn-list"
              onClick={() => onChangeTab('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'list'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Press [L] or [2] for List View"
            >
              <kbd className="font-mono text-[10px] px-1 rounded bg-black/20 text-current">L</kbd>
              <span className="hidden sm:inline">List</span>
            </button>

            <button
              type="button"
              id="keystrip-btn-saved"
              onClick={() => onChangeTab('saved')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'saved'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Press [S] or [3] for Saved Lots"
            >
              <kbd className="font-mono text-[10px] px-1 rounded bg-black/20 text-current">S</kbd>
              <span className="hidden sm:inline">Saved</span>
            </button>

            <button
              type="button"
              id="keystrip-btn-rates"
              onClick={() => onChangeTab('info')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'info'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Press [R] or [4] for SG Rates Guide"
            >
              <kbd className="font-mono text-[10px] px-1 rounded bg-black/20 text-current">R</kbd>
              <span className="hidden sm:inline">Rates</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 shrink-0 hidden md:block" />

          {/* Vehicle Mode Keys (C, K, H) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              id="keystrip-btn-cars"
              onClick={() => onChangeVehicle('car')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                vehicleType === 'car'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
              title="Press [C] for Cars"
            >
              <kbd className="font-mono text-[10px] px-1 rounded bg-black/15 text-current">C</kbd>
              <Car className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Cars</span>
            </button>

            <button
              type="button"
              id="keystrip-btn-bike"
              onClick={() => onChangeVehicle('motorcycle')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                vehicleType === 'motorcycle'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
              title="Press [K] for Motor-Bikes"
            >
              <kbd className="font-mono text-[10px] px-1 rounded bg-black/15 text-current">K</kbd>
              <Bike className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Bikes</span>
            </button>

            <button
              type="button"
              id="keystrip-btn-heavy"
              onClick={() => onChangeVehicle('heavy')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                vehicleType === 'heavy'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
              title="Press [H] for Heavy Vehicles"
            >
              <kbd className="font-mono text-[10px] px-1 rounded bg-black/15 text-current">H</kbd>
              <Truck className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Heavy</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 shrink-0 hidden sm:block" />

          {/* Action Keys (/, U, ?) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              id="keystrip-btn-search"
              onClick={onFocusSearch}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              title="Press [/] to Search Singapore location"
            >
              <kbd className="font-mono text-[10px] px-1 rounded bg-slate-200 text-slate-800">/</kbd>
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline text-[11px]">Search</span>
            </button>

            <button
              type="button"
              id="keystrip-btn-update"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              title="Press [U] to Update Live Lot Vacancy"
            >
              <kbd className="font-mono text-[10px] px-1 rounded bg-slate-200 text-slate-800">U</kbd>
              <RefreshCw
                className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span className="hidden md:inline text-[11px]">Update</span>
            </button>

            <button
              type="button"
              id="keystrip-btn-help"
              onClick={onOpenHelp}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors"
              title="Press [?] for Usability Heuristics & Shortcuts"
            >
              <kbd className="font-mono text-[10px] px-1 rounded bg-amber-200/80 text-amber-900 font-bold">
                ?
              </kbd>
              <span className="text-[11px]">Guide</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
