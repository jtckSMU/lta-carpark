import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Carpark, VehicleType } from '../types';
import { Navigation, Compass, Plus, Minus, Layers, Zap, Car, ShieldCheck } from 'lucide-react';
import { formatDistance, getAvailabilityStatus } from '../data/singaporeCarparks';

interface MapViewProps {
  carparks: Carpark[];
  center: { lat: number; lng: number };
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark | null) => void;
  onNavigate: (carpark: Carpark) => void;
  onOpenDetails: (carpark: Carpark) => void;
  userLocation: { lat: number; lng: number } | null;
  onRecenterSingapore: () => void;
  vehicleType: VehicleType;
}

export const MapView: React.FC<MapViewProps> = ({
  carparks,
  center,
  selectedCarpark,
  onSelectCarpark,
  onNavigate,
  onOpenDetails,
  userLocation,
  onRecenterSingapore,
  vehicleType,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Default Singapore center
    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    // Custom layer group for markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Deselect carpark when clicking empty map area
    map.on('click', () => {
      onSelectCarpark(null);
    });

    // Invalidate size on mount after short delay to ensure full container rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lng], 14, {
        animate: true,
      });
    }
  }, [center.lat, center.lng]);

  // Update User Location Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-md"></span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(mapInstanceRef.current);
      }
    } else if (userMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  // Update Carpark Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    carparks.forEach((cp) => {
      const isSelected = selectedCarpark?.id === cp.id;
      const status = getAvailabilityStatus(cp.lots_available, cp.total_lots);

      let colorClass = 'bg-emerald-600 text-white border-white';
      let badgeBg = 'bg-emerald-500';
      if (status === 'moderate') {
        colorClass = 'bg-amber-500 text-white border-white';
        badgeBg = 'bg-amber-500';
      } else if (status === 'few') {
        colorClass = 'bg-rose-500 text-white border-white';
        badgeBg = 'bg-rose-500';
      } else if (status === 'full') {
        colorClass = 'bg-slate-500 text-slate-100 border-white';
        badgeBg = 'bg-slate-400';
      }

      const lotsText = cp.lots_available.toString();
      const markerHtml = `
        <div class="group cursor-pointer flex flex-col items-center transform transition-transform duration-200 ${
          isSelected ? 'scale-115 z-50' : 'hover:scale-105'
        }">
          <div class="flex items-center gap-1 px-2.5 py-1 rounded-full shadow-lg border-2 ${colorClass} font-bold text-xs ${
        isSelected ? 'ring-4 ring-blue-500 ring-offset-1' : ''
      }">
            <span class="text-[10px] tracking-wider uppercase font-semibold opacity-90">${cp.carpark_number.slice(0, 4)}</span>
            <span class="w-1 h-1 rounded-full bg-white/70"></span>
            <span>${lotsText}</span>
          </div>
          <div class="w-2 h-2 -mt-1 transform rotate-45 ${badgeBg} border-r border-b border-white"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-carpark-pin',
        html: markerHtml,
        iconSize: [64, 34],
        iconAnchor: [32, 34],
      });

      const marker = L.marker([cp.coordinates.lat, cp.coordinates.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 500 : 10,
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectCarpark(cp);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([cp.coordinates.lat, cp.coordinates.lng], {
            animate: true,
          });
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [carparks, selectedCarpark, vehicleType]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="relative w-full h-full min-h-[400px] flex-1 overflow-hidden">
      {/* Map Container */}
      <div
        id="singapore-leaflet-map-canvas"
        ref={mapContainerRef}
        className="w-full h-full absolute inset-0 bg-slate-100"
      />

      {/* Floating Map Controls (Right Side) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          id="map-recenter-btn"
          type="button"
          onClick={onRecenterSingapore}
          className="p-2.5 bg-white rounded-xl shadow-md border border-slate-200/80 text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
          title="Recenter Singapore City Centre"
        >
          <Compass className="w-5 h-5" />
        </button>

        <div className="bg-white rounded-xl shadow-md border border-slate-200/80 flex flex-col overflow-hidden">
          <button
            id="map-zoom-in-btn"
            type="button"
            onClick={handleZoomIn}
            className="p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors border-b border-slate-100"
            title="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            id="map-zoom-out-btn"
            type="button"
            onClick={handleZoomOut}
            className="p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            title="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Carpark Bottom Preview Sheet - Positioned cleanly above bottom nav */}
      {selectedCarpark ? (
        <div className="absolute bottom-16 sm:bottom-18 left-3 right-3 max-w-md mx-auto z-20 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3.5">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {selectedCarpark.carpark_number}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      selectedCarpark.agency === 'HDB'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : selectedCarpark.agency === 'URA'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {selectedCarpark.agency}
                  </span>
                  {selectedCarpark.distanceMeters !== undefined && (
                    <span className="text-[11px] text-slate-500">
                      {formatDistance(selectedCarpark.distanceMeters)}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug truncate">
                  {selectedCarpark.name}
                </h3>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {selectedCarpark.address}
                </p>
              </div>

              {/* Big Availability Counter & Dismiss */}
              <div className="flex flex-col items-end shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectCarpark(null)}
                  className="text-slate-400 hover:text-slate-700 p-0.5 -mt-1 -mr-1 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Close preview [Esc]"
                >
                  <span className="sr-only">Close</span>
                  <span className="text-base leading-none font-bold">×</span>
                </button>
                <div className="flex items-baseline justify-end gap-1 mt-0.5">
                  <span className="text-xl font-black text-slate-900">
                    {selectedCarpark.lots_available}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    /{selectedCarpark.total_lots}
                  </span>
                </div>
                <span
                  className={`inline-block px-1.5 py-0.2 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                    selectedCarpark.lots_available > 30
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedCarpark.lots_available > 10
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedCarpark.lots_available > 30
                    ? 'Plenty'
                    : selectedCarpark.lots_available > 10
                    ? 'Filling'
                    : 'Few'}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-100">
              <button
                id="preview-details-btn"
                type="button"
                onClick={() => onOpenDetails(selectedCarpark)}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors text-center"
              >
                Rates & Details
              </button>
              <button
                id="preview-navigate-btn"
                type="button"
                onClick={() => onNavigate(selectedCarpark)}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                Navigate
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Subtle Availability Pill (Bottom Left) when no carpark is selected */
        <div className="absolute bottom-16 sm:bottom-18 left-3 z-10 bg-white/90 backdrop-blur-xs rounded-full shadow-sm border border-slate-200/80 px-2.5 py-1 text-[10px] text-slate-600 flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> &gt;30
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> 10-30
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> &lt;10
          </span>
        </div>
      )}
    </div>
  );
};
