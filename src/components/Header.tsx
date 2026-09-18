import React from 'react';
import { Car, Bike, Truck, RefreshCw, HelpCircle } from 'lucide-react';
import { NavTab, VehicleType } from '../types';

interface HeaderProps {
  activeTab: NavTab;
  totalCarparks: number;
  totalLotsAvailable: number;
  lastUpdated: Date;
  vehicleType: VehicleType;
  onChangeVehicle: (type: VehicleType) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  totalCarparks,
  totalLotsAvailable,
  lastUpdated,
  vehicleType,
  onChangeVehicle,
  onRefresh,
  isRefreshing,
  onOpenHelp,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 px-3 sm:px-4 py-2.5 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Singapore Identity */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-black shadow-xs text-xs tracking-wider">
            SG
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                ParkFinder
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none hidden sm:block">
              LTA DataMall & HDB
            </p>
          </div>
        </div>

        {/* Clean Vehicle Mode Toggle (Segmented control) */}
        <div
          role="radiogroup"
          aria-label="Select Vehicle Type"
          className="bg-slate-100 p-0.5 sm:p-1 rounded-xl flex items-center gap-0.5 border border-slate-200/60"
        >
          <button
            type="button"
            id="vehicle-car-btn"
            onClick={() => onChangeVehicle('car')}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              vehicleType === 'car'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Cars [C]"
          >
            <Car className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Cars</span>
          </button>

          <button
            type="button"
            id="vehicle-bike-btn"
            onClick={() => onChangeVehicle('motorcycle')}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              vehicleType === 'motorcycle'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Motorcycles [K]"
          >
            <Bike className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Bikes</span>
          </button>

          <button
            type="button"
            id="vehicle-heavy-btn"
            onClick={() => onChangeVehicle('heavy')}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              vehicleType === 'heavy'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Heavy Vehicles [H]"
          >
            <Truck className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px] sm:text-xs">Heavy</span>
          </button>
        </div>

        {/* Live Lots Availability & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick open lots indicator */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
            title="Total lots currently available in active zone"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{totalLotsAvailable.toLocaleString()} open</span>
          </div>

          {/* Refresh Button */}
          <button
            id="header-refresh-btn"
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            title="Refresh live vacancies [U]"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Help & Guide Button */}
          {onOpenHelp && (
            <button
              id="header-help-btn"
              type="button"
              onClick={onOpenHelp}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-bold text-xs flex items-center gap-1"
              title="Help & Shortcuts [?]"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
              <span className="hidden lg:inline text-xs font-semibold">Help</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
