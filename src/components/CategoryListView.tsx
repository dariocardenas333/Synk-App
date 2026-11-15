import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, PowerOff } from 'lucide-react';
import type { AvailabilityStatus, CityName, CourierPublicProfile, ServiceCategory } from '../types/synk';
import { getCategoryInfo, getCourierCategories } from '../utils/formatters';
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

type FilterMode = 'all' | AvailabilityStatus;

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
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [cityFilterOnly, setCityFilterOnly] = useState<boolean>(true);

  const catInfo = getCategoryInfo(category);
  const byCategory = couriers.filter((c) => getCourierCategories(c).includes(category));
  const byCity = cityFilterOnly ? byCategory.filter((c) => c.city === currentCity) : byCategory;

  const availableList = byCity.filter((c) => c.availabilityStatus === 'available');
  const busyList = byCity.filter((c) => c.availabilityStatus === 'busy');
  const offlineList = byCity.filter((c) => c.availabilityStatus === 'offline');

  const showAvailable = filterMode === 'all' || filterMode === 'available';
  const showBusy = filterMode === 'all' || filterMode === 'busy';
  const showOffline = filterMode === 'all' || filterMode === 'offline';

  const visibleCount =
    (showAvailable ? availableList.length : 0) +
    (showBusy ? busyList.length : 0) +
    (showOffline ? offlineList.length : 0);

  return (
    <div className="bg-[#F8FAFA] pb-24 dark:bg-[#07181E]">
      <div className="sticky top-14 z-20 border-b border-[#E2E8F0] bg-white/95 px-4 pb-3 pt-2 backdrop-blur-md dark:border-[#1E4452] dark:bg-[#0D252E]/95">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 items-center gap-1.5 pr-2 text-sm font-semibold text-[#063642] dark:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Rubros</span>
          </button>

          <button
            type="button"
            onClick={() => setCityFilterOnly((prev) => !prev)}
            className="h-9 rounded-lg border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-xs font-semibold text-[#063642] transition hover:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#13323D] dark:text-slate-100 dark:hover:border-[#2DD4BF]"
          >
            {cityFilterOnly ? `Solo ${currentCity}` : 'Todas las ciudades'}
          </button>
        </div>

        <div className="mt-1 flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#008B8B]/10 text-[#008B8B] dark:bg-[#008B8B]/20 dark:text-[#2DD4BF]">
            <CategoryIcon category={category} className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-extrabold text-[#063642] dark:text-white">
              {catInfo.label}
            </h1>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {catInfo.shortDesc}
            </p>
          </div>
        </div>

        {/* Filter Chips: Todos / Disponibles / Ocupados / Desconectados */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`h-9 shrink-0 rounded-lg px-3 text-xs font-bold transition ${
              filterMode === 'all'
                ? 'bg-[#063642] text-white dark:bg-[#008B8B]'
                : 'bg-[#F8FAFA] text-slate-600 hover:bg-slate-200/60 dark:bg-[#13323D] dark:text-slate-300 dark:hover:bg-[#1A4352]'
            }`}
          >
            Todos ({byCity.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('available')}
            className={`flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${
              filterMode === 'available'
                ? 'bg-[#22C55E] text-white'
                : 'bg-[#22C55E]/10 text-[#15803D] dark:bg-[#22C55E]/20 dark:text-[#4ADE80]'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Disponibles ({availableList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('busy')}
            className={`flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${
              filterMode === 'busy'
                ? 'bg-[#EF4444] text-white'
                : 'bg-[#EF4444]/10 text-[#B91C1C] dark:bg-[#EF4444]/20 dark:text-[#F87171]'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Ocupados ({busyList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('offline')}
            className={`flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${
              filterMode === 'offline'
                ? 'bg-slate-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-[#13323D] dark:text-slate-300'
            }`}
          >
            <PowerOff className="h-3.5 w-3.5" />
            <span>Desconectados ({offlineList.length})</span>
          </button>
        </div>
      </div>

      <div className="space-y-6 p-4">
        {visibleCount === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center dark:border-[#1E4452] dark:bg-[#0D252E]">
            <p className="text-sm font-semibold text-[#063642] dark:text-white">
              No hay prestadores registrados en {catInfo.label} para{' '}
              {cityFilterOnly ? currentCity : 'esta búsqueda'}.
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {cityFilterOnly && byCategory.length > 0
                ? 'Podés ver prestadores registrados en ciudades cercanas.'
                : 'A medida que se sumen prestadores locales aparecerán acá en tiempo real.'}
            </p>
            {cityFilterOnly && byCategory.length > 0 && (
              <button
                type="button"
                onClick={() => setCityFilterOnly(false)}
                className="mt-4 h-10 rounded-xl bg-[#008B8B] px-4 text-xs font-bold text-white"
              >
                Ver en todas las ciudades ({byCategory.length})
              </button>
            )}
          </div>
        ) : (
          <>
            {/* 1. DISPONIBLES */}
            {showAvailable && availableList.length > 0 && (
              <section>
                <div className="mb-2.5 flex items-center justify-between">
                  <h2 className="flex items-center gap-1.5 font-display text-sm font-extrabold text-[#15803D] dark:text-[#4ADE80]">
                    <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                    <span>Disponibles ({availableList.length})</span>
                  </h2>
                  <span className="text-[11px] font-medium text-slate-400">
                    Listos para responder
                  </span>
                </div>
                <div className="space-y-3">
                  {availableList.map((courier) => (
                    <CourierCard
                      key={courier.id}
                      courier={courier}
                      activeCategory={category}
                      isFavorite={favorites.includes(courier.id)}
                      onToggleFavorite={onToggleFavorite}
                      onViewProfile={onViewProfile}
                      onContact={onContact}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 2. OCUPADOS */}
            {showBusy && busyList.length > 0 && (
              <section>
                <div className="mb-2.5 flex items-center justify-between">
                  <h2 className="flex items-center gap-1.5 font-display text-sm font-extrabold text-[#B91C1C] dark:text-[#F87171]">
                    <Clock className="h-4 w-4 text-[#EF4444]" />
                    <span>Ocupados ({busyList.length})</span>
                  </h2>
                  <span className="text-[11px] font-medium text-slate-400">
                    En medio de un trabajo
                  </span>
                </div>
                <div className="space-y-3">
                  {busyList.map((courier) => (
                    <CourierCard
                      key={courier.id}
                      courier={courier}
                      activeCategory={category}
                      isFavorite={favorites.includes(courier.id)}
                      onToggleFavorite={onToggleFavorite}
                      onViewProfile={onViewProfile}
                      onContact={onContact}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 3. DESCONECTADOS */}
            {showOffline && offlineList.length > 0 && (
              <section className="border-t border-[#E2E8F0] pt-5 dark:border-[#1E4452]">
                <div className="mb-2.5">
                  <h2 className="flex items-center gap-1.5 font-display text-sm font-extrabold text-slate-500 dark:text-slate-300">
                    <PowerOff className="h-4 w-4 text-[#9CA3AF]" />
                    <span>Desconectados ({offlineList.length})</span>
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Fuera de horario laboral / descansando. Es posible que no respondan de inmediato.
                  </p>
                </div>
                <div className="space-y-3">
                  {offlineList.map((courier) => (
                    <CourierCard
                      key={courier.id}
                      courier={courier}
                      activeCategory={category}
                      isFavorite={favorites.includes(courier.id)}
                      onToggleFavorite={onToggleFavorite}
                      onViewProfile={onViewProfile}
                      onContact={onContact}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};
