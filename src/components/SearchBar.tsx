import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Navigation, History, Sparkles } from 'lucide-react';
import { LocationPreset } from '../types';
import { POPULAR_LOCATIONS } from '../data/singaporeCarparks';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectLocation: (location: LocationPreset) => void;
  onUseCurrentLocation: () => void;
  isLocating?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSelectLocation,
  onUseCurrentLocation,
  isLocating = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPresets = POPULAR_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full z-30" ref={dropdownRef}>
      <div className="flex items-center bg-white rounded-2xl shadow-lg border border-slate-200/80 px-3.5 py-2.5 transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        <Search className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
        <input
          id="singapore-carpark-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search location (e.g. Orchard, Bugis, MBS, Tampines)..."
          className="w-full bg-transparent text-sm md:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />

        {searchQuery && (
          <button
            id="clear-search-btn"
            type="button"
            onClick={() => {
              onSearchChange('');
            }}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 mr-1 transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="h-5 w-px bg-slate-200 mx-1.5 shrink-0" />

        <button
          id="use-current-location-btn"
          type="button"
          onClick={onUseCurrentLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 text-xs font-semibold shrink-0 transition-colors"
          title="Use current GPS position"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-blue-600' : ''}`} />
          <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'Near Me'}</span>
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-40 max-h-80 overflow-y-auto">
          <div className="p-2 border-b border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400 px-3">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Singapore Destinations
            </span>
            <span>Tap to jump</span>
          </div>

          <div className="p-1">
            {filteredPresets.length > 0 ? (
              filteredPresets.map((loc) => (
                <button
                  key={loc.name}
                  id={`preset-loc-${loc.name.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => {
                    onSelectLocation(loc);
                    onSearchChange(loc.name);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-3 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 text-slate-500 mt-0.5 transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-800 group-hover:text-blue-600 truncate transition-colors">
                        {loc.name}
                      </span>
                      {loc.popular && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 rounded border border-amber-200">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{loc.description}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-6 text-center text-slate-400 text-sm">
                No matching Singapore locations found. Press enter or search nearby.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
