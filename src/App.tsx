import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { MapView } from './components/MapView';
import { CarparkList } from './components/CarparkList';
import { SavedLotsView } from './components/SavedLotsView';
import { RatesGuideView } from './components/RatesGuideView';
import { BottomNavigation } from './components/BottomNavigation';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { carparkService } from './services/carparkService';
import { Carpark, LocationPreset, FilterOptions, NavTab } from './types';
import { SINGAPORE_DEFAULT_CENTER, POPULAR_LOCATIONS } from './data/singaporeCarparks';
import { MapPin, Navigation, Compass, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [center, setCenter] = useState(SINGAPORE_DEFAULT_CENTER);
  const [searchLocationName, setSearchLocationName] = useState('Central Singapore (Orchard)');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [detailModalCarpark, setDetailModalCarpark] = useState<Carpark | null>(null);

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

  // Retrieve current carparks with distances relative to the center and vehicle type
  const allCarparks = useMemo(() => {
    // refreshTrigger is used to force re-computation on simulateRealtimeUpdate
    void refreshTrigger;
    return carparkService.getCarparks(center, filters.vehicleType);
  }, [center, filters.vehicleType, refreshTrigger]);

  // Filter carparks based on search text if entered
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
    showToast(`Showing parking near ${loc.name}`);
  }, [showToast]);

  // Recenter to Singapore default
  const handleRecenterSingapore = useCallback(() => {
    setCenter(SINGAPORE_DEFAULT_CENTER);
    setSearchLocationName('Central Singapore');
    setSearchQuery('');
    setSelectedCarpark(null);
    showToast('Recentered to Singapore City Centre');
  }, [showToast]);

  // Use current GPS location
  const handleUseCurrentLocation = useCallback(() => {
    setIsLocating(true);
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
          console.warn('Geolocation failed or permission denied, using Downtown SG:', error);
          // Fallback to Singapore Downtown / Raffles Place
          const fallback = { lat: 1.2830, lng: 103.8513 };
          setUserLocation(fallback);
          setCenter(fallback);
          setSearchLocationName('Raffles Place (Downtown)');
          setIsLocating(false);
          showToast('GPS preview: Set to Central Downtown Singapore');
        },
        { timeout: 8000 }
      );
    } else {
      setIsLocating(false);
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
      showToast('Real-time lot availability refreshed');
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

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top duration-200">
          <div className="px-4 py-2 bg-slate-900/90 text-white rounded-full shadow-lg text-xs font-medium backdrop-blur-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        totalCarparks={allCarparks.length}
        totalLotsAvailable={totalLotsAvailable}
        lastUpdated={lastUpdated}
        onRefresh={handleRefreshRealtime}
        isRefreshing={isRefreshing}
      />

      {/* Main View Area */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        {activeTab === 'map' && (
          <div className="relative w-full h-full flex flex-col">
            {/* Floating Top Search Bar Overlay */}
            <div className="absolute top-3 left-3 right-3 max-w-xl mx-auto z-30 pointer-events-auto">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectLocation={handleSelectLocation}
                onUseCurrentLocation={handleUseCurrentLocation}
                isLocating={isLocating}
              />

              {/* Quick Area Filter Pills */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
                {POPULAR_LOCATIONS.slice(0, 5).map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => handleSelectLocation(loc)}
                    className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-slate-700 shadow-sm border border-slate-200/80 hover:bg-slate-50 hover:text-blue-600 transition-colors whitespace-nowrap shrink-0"
                  >
                    {loc.name.split(' ')[0]}
                  </button>
                ))}
              </div>
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
          <div className="w-full h-full flex flex-col overflow-y-auto">
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
                setActiveTab('map');
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
          <div className="w-full h-full overflow-y-auto">
            <SavedLotsView
              savedCarparks={savedCarparks}
              onSelectCarpark={(cp) => {
                setSelectedCarpark(cp);
                setCenter(cp.coordinates);
                setActiveTab('map');
              }}
              onNavigate={handleNavigate}
              onToggleFavorite={handleToggleFavorite}
              onOpenDetails={setDetailModalCarpark}
              onExploreCarparks={() => setActiveTab('map')}
              vehicleType={filters.vehicleType}
            />
          </div>
        )}

        {activeTab === 'info' && (
          <div className="w-full h-full overflow-y-auto">
            <RatesGuideView />
          </div>
        )}
      </main>

      {/* Detail Modal for Full Carpark Information */}
      <CarparkDetailModal
        carpark={detailModalCarpark}
        onClose={() => setDetailModalCarpark(null)}
        onNavigate={handleNavigate}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={detailModalCarpark ? carparkService.isFavorite(detailModalCarpark.id) : false}
        vehicleType={filters.vehicleType}
      />

      {/* Clean Bottom Navigation Bar */}
      <BottomNavigation
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          // If switching back to map, reset modal
          if (tab === 'map') {
            window.dispatchEvent(new Event('resize'));
          }
        }}
        savedCount={savedCarparks.length}
      />
    </div>
  );
}
