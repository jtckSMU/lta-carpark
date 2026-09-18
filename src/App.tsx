import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { MapView } from './components/MapView';
import { CarparkList } from './components/CarparkList';
import { SavedLotsView } from './components/SavedLotsView';
import { RatesGuideView } from './components/RatesGuideView';
import { BottomNavigation } from './components/BottomNavigation';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { HelpShortcutsModal } from './components/HelpShortcutsModal';
import { carparkService } from './services/carparkService';
import { Carpark, LocationPreset, FilterOptions, NavTab, VehicleType } from './types';
import { SINGAPORE_DEFAULT_CENTER } from './data/singaporeCarparks';
import { AlertCircle, X, SlidersHorizontal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('map');
  const [tabHistory, setTabHistory] = useState<NavTab[]>(['map']);
  const [searchQuery, setSearchQuery] = useState('');
  const [center, setCenter] = useState(SINGAPORE_DEFAULT_CENTER);
  const [searchLocationName, setSearchLocationName] = useState('Central Singapore (Orchard)');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [detailModalCarpark, setDetailModalCarpark] = useState<Carpark | null>(null);
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);
  const [gpsErrorNotice, setGpsErrorNotice] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterOptions>({
    vehicleType: 'car',
    minLotsAvailable: 0,
    agency: 'all',
    shelteredOnly: false,
    hasEvCharger: false,
    sortBy: 'distance',
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(carparkService.getLastUpdated());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Show temporary toast message
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  // Safe tab change keeping track of history for Backspace return (Principle 3)
  const handleTabChange = useCallback((newTab: NavTab) => {
    setActiveTab((prev) => {
      if (prev !== newTab) {
        setTabHistory((hist) => [...hist.slice(-10), newTab]);
      }
      return newTab;
    });
    if (newTab === 'map') {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  }, []);

  // Retrieve current carparks with distances relative to center and vehicle type
  const allCarparks = useMemo(() => {
    void refreshTrigger;
    return carparkService.getCarparks(center, filters.vehicleType);
  }, [center, filters.vehicleType, refreshTrigger]);

  // Filter carparks based on search text
  const searchedCarparks = useMemo(() => {
    if (!searchQuery.trim()) return allCarparks;
    const q = searchQuery.toLowerCase();
    return allCarparks.filter(
      (cp) =>
        cp.name.toLowerCase().includes(q) ||
        cp.address.toLowerCase().includes(q) ||
        cp.carpark_number.toLowerCase().includes(q) ||
        cp.category.toLowerCase().includes(q)
    );
  }, [allCarparks, searchQuery]);

  // Saved carparks list
  const savedCarparks = useMemo(() => {
    return allCarparks.filter((cp) => cp.is_favorite);
  }, [allCarparks]);

  const totalLotsAvailable = useMemo(() => {
    return allCarparks.reduce((acc, curr) => acc + curr.lots_available, 0);
  }, [allCarparks]);

  // Toggle favorite / bookmark
  const handleToggleFavorite = useCallback((id: string) => {
    const isNowSaved = carparkService.toggleFavorite(id);
    setRefreshTrigger((prev) => prev + 1);
    showToast(isNowSaved ? 'Saved to bookmarks' : 'Removed from bookmarks');
  }, [showToast]);

  // Select location preset
  const handleSelectLocation = useCallback((loc: LocationPreset) => {
    setCenter(loc.coordinates);
    setSearchLocationName(loc.name);
    setSearchQuery(loc.name);
    setSelectedCarpark(null);
    setGpsErrorNotice(null);
    showToast(`Showing parking near ${loc.name}`);
  }, [showToast]);

  // Recenter to Singapore default
  const handleRecenterSingapore = useCallback(() => {
    setCenter(SINGAPORE_DEFAULT_CENTER);
    setSearchLocationName('Central Singapore (Orchard)');
    setSearchQuery('');
    setSelectedCarpark(null);
    setGpsErrorNotice(null);
    showToast('Recentered to Central Singapore');
  }, [showToast]);

  // Use current GPS location
  const handleUseCurrentLocation = useCallback(() => {
    setIsLocating(true);
    setGpsErrorNotice(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(coords);
          setCenter(coords);
          setSearchLocationName('My Current GPS Location');
          setSearchQuery('');
          setIsLocating(false);
          showToast('Located your current position');
        },
        (error) => {
          console.warn('Geolocation failed or permission denied:', error);
          const fallback = { lat: 1.2830, lng: 103.8513 };
          setUserLocation(fallback);
          setCenter(fallback);
          setSearchLocationName('Raffles Place (Downtown)');
          setIsLocating(false);
          setGpsErrorNotice('GPS access denied. Defaulted to Downtown Singapore (Raffles Place).');
          showToast('GPS preview: Set to Downtown Singapore');
        },
        { timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      setGpsErrorNotice('Geolocation is not supported in this browser.');
      showToast('Geolocation is not supported in this browser');
    }
  }, [showToast]);

  // Live real-time simulation refresh
  const handleRefreshRealtime = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      carparkService.simulateRealtimeUpdate();
      setLastUpdated(new Date());
      setRefreshTrigger((prev) => prev + 1);
      setIsRefreshing(false);
      showToast('Real-time lot availability refreshed [U]');
    }, 450);
  }, [showToast]);

  // Periodic automatic update (every 40 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      carparkService.simulateRealtimeUpdate();
      setLastUpdated(new Date());
      setRefreshTrigger((prev) => prev + 1);
    }, 40000);
    return () => clearInterval(timer);
  }, []);

  // Launch navigation
  const handleNavigate = useCallback((carpark: Carpark) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleUpdateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Cycle Agency Filter (Principle 2: Match Real World & Principle 7)
  const handleCycleAgency = useCallback(() => {
    const agencies: Array<FilterOptions['agency']> = ['all', 'HDB', 'URA', 'Commercial'];
    setFilters((prev) => {
      const idx = agencies.indexOf(prev.agency);
      const nextAgency = agencies[(idx + 1) % agencies.length];
      showToast(`Agency filter: ${nextAgency === 'all' ? 'All Agencies' : nextAgency} [F]`);
      return { ...prev, agency: nextAgency };
    });
  }, [showToast]);

  // Switch Vehicle Type with Feedback
  const handleChangeVehicle = useCallback((type: VehicleType) => {
    setFilters((prev) => ({ ...prev, vehicleType: type }));
    const label = type === 'motorcycle' ? 'Motor-Bikes [K]' : type === 'heavy' ? 'Heavy Vehicles [H]' : 'Cars [C]';
    showToast(`Vehicle mode: ${label}`);
  }, [showToast]);

  // Focus Search Bar
  const handleFocusSearch = useCallback(() => {
    const input = document.getElementById('singapore-carpark-search-input');
    if (input) {
      input.focus();
      showToast('Search destination [/]');
    }
  }, [showToast]);

  // Check if any non-default filter is active
  const hasActiveFilters =
    filters.agency !== 'all' ||
    filters.hasEvCharger ||
    filters.shelteredOnly ||
    filters.minLotsAvailable > 0 ||
    filters.sortBy !== 'distance';

  const handleResetFilters = useCallback(() => {
    setFilters({
      vehicleType: filters.vehicleType,
      minLotsAvailable: 0,
      agency: 'all',
      shelteredOnly: false,
      hasEvCharger: false,
      sortBy: 'distance',
    });
    showToast('Filters reset to default');
  }, [filters.vehicleType, showToast]);

  // =========================================================================
  // KEYBOARD SHORTCUTS & USABILITY HEURISTICS HANDLER
  // Principles 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
  // =========================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Principle 5: Error Prevention
      // Keys pause while an input, textarea, or select has focus!
      const activeEl = document.activeElement as HTMLElement | null;
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.isContentEditable);

      // Exception: Esc closes/blurs search input layer
      if (e.key === 'Escape') {
        e.preventDefault();
        // Principle 3: User Control and Freedom - Esc closes ONE layer at a time!
        if (helpModalOpen) {
          setHelpModalOpen(false);
          return;
        }
        if (detailModalCarpark) {
          setDetailModalCarpark(null);
          return;
        }
        if (selectedCarpark) {
          setSelectedCarpark(null);
          return;
        }
        if (isInputFocused) {
          activeEl.blur();
          return;
        }
        if (searchQuery) {
          setSearchQuery('');
          showToast('Search cleared [Esc]');
          return;
        }
        if (hasActiveFilters) {
          handleResetFilters();
          return;
        }
        return;
      }

      // If user is currently typing in search, ignore single letter shortcuts
      if (isInputFocused) {
        return;
      }

      // Principle 3: User Control and Freedom - Backspace returns to previous view
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (tabHistory.length > 1) {
          const prevTab = tabHistory[tabHistory.length - 2];
          setTabHistory((prev) => prev.slice(0, -1));
          setActiveTab(prevTab);
          showToast(`Returned to ${prevTab.toUpperCase()} view [Backspace]`);
          return;
        }
      }

      // Principle 10: Help & Documentation - ? opens full guide
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setHelpModalOpen((prev) => !prev);
        return;
      }

      // Principle 2: Match Between System & Real World (First letter mnemonics) & Principle 4 (1-4 numbers)
      const key = e.key.toLowerCase();

      // Navigation & Views
      if (e.key === '1' || key === 'm') {
        e.preventDefault();
        handleTabChange('map');
        showToast('Switched to Map View [M]');
        return;
      }
      if (e.key === '2' || key === 'l') {
        e.preventDefault();
        handleTabChange('list');
        showToast('Switched to Nearby List [L]');
        return;
      }
      if (e.key === '3' || key === 's') {
        e.preventDefault();
        handleTabChange('saved');
        showToast('Switched to Saved Lots [S]');
        return;
      }
      if (e.key === '4' || key === 'r') {
        e.preventDefault();
        handleTabChange('info');
        showToast('Switched to Rates & Rules [R]');
        return;
      }

      // Vehicle modes (C = Cars, K = Bikes, H = Heavy)
      if (key === 'c') {
        e.preventDefault();
        handleChangeVehicle('car');
        return;
      }
      if (key === 'k') {
        e.preventDefault();
        handleChangeVehicle('motorcycle');
        return;
      }
      if (key === 'h') {
        e.preventDefault();
        handleChangeVehicle('heavy');
        return;
      }

      // Search (/)
      if (e.key === '/') {
        e.preventDefault();
        handleFocusSearch();
        return;
      }

      // Update / Refresh (U)
      if (key === 'u') {
        e.preventDefault();
        handleRefreshRealtime();
        return;
      }

      // Cycle Agency Filter (F)
      if (key === 'f') {
        e.preventDefault();
        handleCycleAgency();
        return;
      }

      // Bookmark active carpark (B)
      if (key === 'b' && selectedCarpark) {
        e.preventDefault();
        handleToggleFavorite(selectedCarpark.id);
        return;
      }

      // Google directions (G)
      if (key === 'g' && selectedCarpark) {
        e.preventDefault();
        handleNavigate(selectedCarpark);
        return;
      }

      // Open details modal (Enter)
      if (e.key === 'Enter' && selectedCarpark) {
        e.preventDefault();
        setDetailModalCarpark(selectedCarpark);
        return;
      }

      // Step sequentially through carparks (Arrows)
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (searchedCarparks.length > 0) {
          const currentIdx = selectedCarpark
            ? searchedCarparks.findIndex((cp) => cp.id === selectedCarpark.id)
            : -1;
          const nextIdx = (currentIdx + 1) % searchedCarparks.length;
          const nextCp = searchedCarparks[nextIdx];
          setSelectedCarpark(nextCp);
          setCenter(nextCp.coordinates);
          showToast(`Selected: ${nextCp.name} [→]`);
        }
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (searchedCarparks.length > 0) {
          const currentIdx = selectedCarpark
            ? searchedCarparks.findIndex((cp) => cp.id === selectedCarpark.id)
            : 0;
          const prevIdx = (currentIdx - 1 + searchedCarparks.length) % searchedCarparks.length;
          const prevCp = searchedCarparks[prevIdx];
          setSelectedCarpark(prevCp);
          setCenter(prevCp.coordinates);
          showToast(`Selected: ${prevCp.name} [←]`);
        }
        return;
      }

      // Principle 9: Help Users Recognize, Diagnose, and Recover from Errors
      // "A key that does nothing says so and points you to the list of keys."
      if (/^[a-zA-Z0-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        showToast(`Key [${e.key.toUpperCase()}] is unassigned. Press [?] to view available shortcuts.`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTab,
    tabHistory,
    helpModalOpen,
    detailModalCarpark,
    selectedCarpark,
    searchQuery,
    hasActiveFilters,
    searchedCarparks,
    handleTabChange,
    handleChangeVehicle,
    handleFocusSearch,
    handleRefreshRealtime,
    handleCycleAgency,
    handleToggleFavorite,
    handleNavigate,
    handleResetFilters,
    showToast,
  ]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Toast Notification (Principle 1 & 9) */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top duration-200">
          <div className="px-4 py-2 bg-slate-900/95 text-white rounded-full shadow-xl text-xs font-medium backdrop-blur-md flex items-center gap-2 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Application Header with Segmented Vehicle Toggle & Live Lots */}
      <Header
        activeTab={activeTab}
        totalCarparks={allCarparks.length}
        totalLotsAvailable={totalLotsAvailable}
        lastUpdated={lastUpdated}
        vehicleType={filters.vehicleType}
        onChangeVehicle={handleChangeVehicle}
        onRefresh={handleRefreshRealtime}
        isRefreshing={isRefreshing}
        onOpenHelp={() => setHelpModalOpen(true)}
      />

      {/* Principle 9: GPS Permission Diagnosis & Recovery Banner */}
      {gpsErrorNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{gpsErrorNotice}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="px-2 py-0.5 rounded bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors"
            >
              Retry GPS
            </button>
            <button
              type="button"
              onClick={() => setGpsErrorNotice(null)}
              className="p-1 text-amber-600 hover:text-amber-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Chips (Principle 6: Recognition rather than recall) */}
      {hasActiveFilters && (
        <div className="bg-slate-100/90 border-b border-slate-200/80 px-4 py-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar z-20 text-xs">
          <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
            Active Filters:
          </span>

          {filters.agency !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-semibold">
              Agency: {filters.agency}
              <button
                type="button"
                onClick={() => handleUpdateFilters({ agency: 'all' })}
                className="hover:text-blue-950 ml-0.5"
              >
                ×
              </button>
            </span>
          )}

          {filters.hasEvCharger && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
              EV Ports
              <button
                type="button"
                onClick={() => handleUpdateFilters({ hasEvCharger: false })}
                className="hover:text-emerald-950 ml-0.5"
              >
                ×
              </button>
            </span>
          )}

          {filters.minLotsAvailable > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
              &gt; {filters.minLotsAvailable} Lots
              <button
                type="button"
                onClick={() => handleUpdateFilters({ minLotsAvailable: 0 })}
                className="hover:text-amber-950 ml-0.5"
              >
                ×
              </button>
            </span>
          )}

          {filters.shelteredOnly && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-semibold">
              Sheltered Only
              <button
                type="button"
                onClick={() => handleUpdateFilters({ shelteredOnly: false })}
                className="hover:text-purple-950 ml-0.5"
              >
                ×
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline ml-auto shrink-0"
          >
            Reset All [Esc]
          </button>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        {activeTab === 'map' && (
          <div className="relative w-full h-full flex flex-col">
            {/* Sleek, Non-intrusive Floating Top Search Bar */}
            <div className="absolute top-3 left-3 right-3 max-w-lg mx-auto z-20 pointer-events-auto">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectLocation={handleSelectLocation}
                onUseCurrentLocation={handleUseCurrentLocation}
                isLocating={isLocating}
              />
            </div>

            {/* Interactive Leaflet Map */}
            <MapView
              carparks={searchedCarparks}
              center={center}
              selectedCarpark={selectedCarpark}
              onSelectCarpark={setSelectedCarpark}
              onNavigate={handleNavigate}
              onOpenDetails={setDetailModalCarpark}
              userLocation={userLocation}
              onRecenterSingapore={handleRecenterSingapore}
              vehicleType={filters.vehicleType}
            />
          </div>
        )}

        {activeTab === 'list' && (
          <div className="w-full h-full flex flex-col overflow-y-auto pb-16">
            {/* Search bar inside list view */}
            <div className="bg-white px-4 pt-3 pb-2 border-b border-slate-100 max-w-5xl mx-auto w-full">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectLocation={handleSelectLocation}
                onUseCurrentLocation={handleUseCurrentLocation}
                isLocating={isLocating}
              />
            </div>

            <CarparkList
              carparks={searchedCarparks}
              filters={filters}
              onUpdateFilters={handleUpdateFilters}
              onSelectCarpark={(cp) => {
                setSelectedCarpark(cp);
                setCenter(cp.coordinates);
                handleTabChange('map');
              }}
              onNavigate={handleNavigate}
              onToggleFavorite={handleToggleFavorite}
              onOpenDetails={setDetailModalCarpark}
              onRefreshRealtime={handleRefreshRealtime}
              isRefreshing={isRefreshing}
              lastUpdatedTime={lastUpdated}
              searchLocationName={searchLocationName}
            />
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="w-full h-full overflow-y-auto pb-16">
            <SavedLotsView
              savedCarparks={savedCarparks}
              onSelectCarpark={(cp) => {
                setSelectedCarpark(cp);
                setCenter(cp.coordinates);
                handleTabChange('map');
              }}
              onNavigate={handleNavigate}
              onToggleFavorite={handleToggleFavorite}
              onOpenDetails={setDetailModalCarpark}
              onExploreCarparks={() => handleTabChange('map')}
              vehicleType={filters.vehicleType}
            />
          </div>
        )}

        {activeTab === 'info' && (
          <div className="w-full h-full overflow-y-auto pb-16">
            <RatesGuideView />
          </div>
        )}
      </main>

      {/* Principle 10: Help and Documentation Modal [?] */}
      <HelpShortcutsModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />

      {/* Detail Modal for Full Carpark Information */}
      <CarparkDetailModal
        carpark={detailModalCarpark}
        onClose={() => setDetailModalCarpark(null)}
        onNavigate={handleNavigate}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={detailModalCarpark ? carparkService.isFavorite(detailModalCarpark.id) : false}
        vehicleType={filters.vehicleType}
      />

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        savedCount={savedCarparks.length}
      />
    </div>
  );
}
