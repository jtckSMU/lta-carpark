import React from 'react';
import { Carpark, VehicleType } from '../types';
import { CarparkCard } from './CarparkCard';
import { Bookmark, Sparkles, Navigation, Plus } from 'lucide-react';

interface SavedLotsViewProps {
  savedCarparks: Carpark[];
  onSelectCarpark: (carpark: Carpark) => void;
  onNavigate: (carpark: Carpark) => void;
  onToggleFavorite: (id: string) => void;
  onOpenDetails: (carpark: Carpark) => void;
  onExploreCarparks: () => void;
  vehicleType: VehicleType;
}

export const SavedLotsView: React.FC<SavedLotsViewProps> = ({
  savedCarparks,
  onSelectCarpark,
  onNavigate,
  onToggleFavorite,
  onOpenDetails,
  onExploreCarparks,
  vehicleType,
}) => {
  return (
    <div className="w-full flex-1 max-w-5xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <Bookmark className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Saved Parking Lots</h2>
            <p className="text-xs text-slate-500">
              Quickly monitor live vacancy before driving to your regular spots
            </p>
          </div>
        </div>
      </div>

      {savedCarparks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedCarparks.map((carpark) => (
            <CarparkCard
              key={carpark.id}
              carpark={carpark}
              onSelect={onSelectCarpark}
              onNavigate={onNavigate}
              onToggleFavorite={onToggleFavorite}
              onOpenDetails={onOpenDetails}
              isFavorite={true}
              vehicleType={vehicleType}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center max-w-sm mx-auto bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No saved parking lots yet</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Bookmark your frequent destinations like office, shopping malls, or home carpark to
            track live vacancies instantly.
          </p>
          <button
            id="explore-lots-from-saved-btn"
            type="button"
            onClick={onExploreCarparks}
            className="mt-5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Find & Save Nearby Lots</span>
          </button>
        </div>
      )}
    </div>
  );
};
