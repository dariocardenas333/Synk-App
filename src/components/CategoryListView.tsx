import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import type { CityName, CourierPublicProfile, ServiceCategory } from '../types/synk';
import { CATEGORY_INFO } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { CourierCard } from './CourierCard';

interface CategoryListViewProps {
  category: ServiceCategory;
  currentCity: CityName;
  couriers: CourierPublicProfile[];
  favorites: string[];
  onBack: () => void;
  onToggleFavorite: (courierId: string) => void;
  onViewProfile: (courierId: string) => void;
  onContact: (courier: CourierPublicProfile) => void;
}

export const CategoryListView: React.FC<CategoryListViewProps> = ({
  category,
  currentCity,
  couriers,
  favorites,
  onBack,
  onToggleFavorite,
  onViewProfile,
  onContact,
}) => {
  const [availabilityTab, setAvailabilityTab] = useState<'available' | 'busy'>('available');
  const [cityFilterOnly, setCityFilterOnly] = useState<boolean>(true);

  const catInfo = CATEGORY_INFO[category];
  const byCategory = couriers.filter((c) => c.serviceCategory === category);
  const byCity = cityFilterOnly ? byCategory.filter((c) => c.city === currentCity) : byCategory;

  const availableList = byCity.filter((c) => c.isAvailable);
  const busyList = byCity.filter((c) => !c.isAvailable);
  const displayed = availabilityTab === 'available' ? availableList : busyList;

  return (
    <div className="pb-24">
      <div className="sticky top-14 z-20 border-b border-slate-100 bg-white/95 px-4 pb-3 pt-2 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 items-center gap-1.5 pr-2 text-sm font-semibold text-[#1A2E4A]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Categorías</span>
          </button>

          <button
            type="button"
            onClick={() => setCityFilterOnly((prev) => !prev)}
            className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-[#1A2E4A] transition hover:bg-slate-100"
          >
            {cityFilterOnly ? `Solo ${currentCity}` : 'Todas las ciudades'}
          </button>
        </div>

        <div className="mt-1 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B00]/10 text-[#FF6B00]">
            <CategoryIcon category={category} className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-lg font-extrabold text-[#1A2E4A]">
              {catInfo.label}
            </h1>
            <p className="text-xs text-slate-500">{catInfo.shortDesc}</p>
          </div>
        </div>

        {/* Segmented Tabs: DISPONIBLES / OCUPADOS */}
        <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setAvailabilityTab('available')}
            className={`flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition ${
              availabilityTab === 'available'
                ? 'bg-white text-[#16A34A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
            <span>DISPONIBLES ({availableList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setAvailabilityTab('busy')}
            className={`flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition ${
              availabilityTab === 'busy'
                ? 'bg-white text-[#DC2626] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-4 w-4 text-[#EF4444]" />
            <span>OCUPADOS ({busyList.length})</span>
          </button>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {displayed.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm font-semibold text-[#1A2E4A]">
              {availabilityTab === 'available'
                ? `No hay repartidores disponibles en ${cityFilterOnly ? currentCity : 'esta categoría'} ahora.`
                : `No hay repartidores ocupados en ${cityFilterOnly ? currentCity : 'esta categoría'}.`}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {cityFilterOnly && byCategory.length > 0
                ? 'Podés ver repartidores de ciudades cercanas.'
                : 'Probá explorando otra categoría o buscá en toda la provincia.'}
            </p>
            {cityFilterOnly && byCategory.length > 0 && (
              <button
                type="button"
                onClick={() => setCityFilterOnly(false)}
                className="mt-4 h-10 rounded-xl bg-[#1A2E4A] px-4 text-xs font-bold text-white"
              >
                Ver en todas las ciudades ({byCategory.length})
              </button>
            )}
          </div>
        ) : (
          displayed.map((courier) => (
            <CourierCard
              key={courier.id}
              courier={courier}
              isFavorite={favorites.includes(courier.id)}
              onToggleFavorite={onToggleFavorite}
              onViewProfile={onViewProfile}
              onContact={onContact}
            />
          ))
        )}
      </div>
    </div>
  );
};
