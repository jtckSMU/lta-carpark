import React from 'react';
import { NavTab, VehicleType } from '../types';
import { Map, List, Bookmark, HelpCircle, Activity, Radio, Sparkles } from 'lucide-react';

interface SystemStatusBarProps {
  activeTab: NavTab;
  locationName: string;
  vehicleType: VehicleType;
  totalCarparks: number;
  totalLotsAvailable: number;
  lastUpdated: Date;
  isIdle?: boolean;
  serverlessReady?: boolean;
  onOpenHelp?: () => void;
}

export const SystemStatusBar: React.FC<SystemStatusBarProps> = ({
  activeTab,
  locationName,
  vehicleType,
  totalCarparks,
  totalLotsAvailable,
  lastUpdated,
  isIdle = false,
  serverlessReady = true,
  onOpenHelp,
}) => {
  const tabConfig: Record<NavTab, { step: string; label: string; icon: any }> = {
    map: { step: '1/4', label: 'MAP VIEW', icon: Map },
    list: { step: '2/4', label: 'NEARBY LIST', icon: List },
    saved: { step: '3/4', label: 'SAVED LOTS', icon: Bookmark },
    info: { step: '4/4', label: 'RATES & RULES', icon: HelpCircle },
  };

  const currentTab = tabConfig[activeTab];
  const CurrentIcon = currentTab.icon;

  const vehicleLabel =
    vehicleType === 'motorcycle'
      ? 'MOTORCYCLES'
      : vehicleType === 'heavy'
      ? 'HEAVY VEHICLES'
      : 'CARS';

  // Format relative seconds
  const secondsAgo = Math.max(1, Math.round((Date.now() - lastUpdated.getTime()) / 1000));

  return (
    <aside
      id="singapore-system-status-bar"
      aria-label="System Telemetry and Live Status"
      className={`fixed bottom-14 left-0 right-0 z-30 transition-opacity duration-300 pointer-events-none ${
        isIdle ? 'opacity-35 hover:opacity-100' : 'opacity-100'
      }`}
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-4">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md text-white rounded-xl shadow-lg border border-slate-700/60 px-3 py-1.5 flex items-center justify-between gap-2 text-[11px] select-none">
          {/* Section & Mode (Principle 1) */}
          <div className="flex items-center gap-2 overflow-hidden">
            {/* View identifier */}
            <div className="flex items-center gap-1.5 font-bold tracking-wider text-blue-400 shrink-0">
              <CurrentIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>{currentTab.label}</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                {currentTab.step}
              </span>
            </div>

            <span className="text-slate-600 hidden sm:inline">•</span>

            {/* Mode & Target Location */}
            <div className="flex items-center gap-1.5 text-slate-300 truncate">
              <span className="font-semibold text-amber-300 shrink-0">{vehicleLabel}</span>
              <span className="text-slate-500 hidden md:inline">|</span>
              <span className="truncate hidden md:inline text-slate-400">
                Near: <span className="text-slate-200">{locationName}</span>
              </span>
            </div>
          </div>

          {/* Counts & Live Telemetry (Principle 1 & Principle 4) */}
          <div className="flex items-center gap-2.5 shrink-0 text-slate-300">
            {/* Monitored count */}
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-slate-400 font-medium">Spots:</span>
              <strong className="text-white">{totalCarparks}</strong>
            </div>

            {/* Vacancy indicator */}
            <div className="flex items-center gap-1.5 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-700/60 text-emerald-300 font-semibold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>{totalLotsAvailable.toLocaleString()} open</span>
            </div>

            {/* Sync Age */}
            <span className="text-[10px] text-slate-400 hidden lg:inline">
              Sync: {secondsAgo}s ago
            </span>

            {/* Serverless Feed Status */}
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]"
              title="LTA DataMall & Local Serverless API Engine Ready"
            >
              <Radio className="w-2.5 h-2.5 text-teal-400 animate-pulse" />
              <span className="text-teal-300 font-medium hidden sm:inline">LTA Feed</span>
            </div>

            {/* Help trigger pill */}
            {onOpenHelp && (
              <button
                type="button"
                onClick={onOpenHelp}
                className="px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] transition-colors"
                title="Open Shortcuts & Usability Guide [?]"
              >
                [?] Help
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
