import React, { useMemo, useState } from 'react';
import { ArrowUpDown, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import type { AvailabilityStatus, CityName, CourierPublicProfile, ServiceCategory } from '../types/synk';
import {
  CATEGORY_INFO,
  CITIES,
  CITY_NEIGHBORHOODS,
  ORDERED_CATEGORIES,
  getCourierCategories,
} from '../utils/formatters';
import { CourierCard } from './CourierCard';

interface SearchViewProps {
  couriers: CourierPublicProfile[];
  favorites: string[];
  defaultCity: CityName;
  onToggleFavorite: (courierId: string) => void;
  onViewProfile: (courierId: string) => void;
  onContact: (courier: CourierPublicProfile) => void;
}

type AvailabilityFilter = 'all' | AvailabilityStatus;
type SortMode = 'lowest_price' | 'best_rating' | 'most_completed';

export const SearchView: React.FC<SearchViewProps> = ({
  couriers,
  favorites,
  defaultCity,
  onToggleFavorite,
  onViewProfile,
  onContact,
}) => {
  const [queryText, setQueryText] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [category, setCategory] = useState<ServiceCategory | 'all'>('all');
  const [availability, setAvailability] = useState<AvailabilityFilter>('all');
  const [city, setCity] = useState<CityName | 'all'>(defaultCity);
  const [barrio, setBarrio] = useState('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortMode>('lowest_price');

  const neighborhoodOptions = useMemo(() => {
    if (city === 'all') {
      return Array.from(new Set(Object.values(CITY_NEIGHBORHOODS).flat()));
    }
    return CITY_NEIGHBORHOODS[city] || [];
  }, [city]);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    const b = barrio.trim().toLowerCase();
    const maxP = maxPrice ? Number(maxPrice) : null;

    const list = couriers.filter((c) => {
      const courierCats = getCourierCategories(c);
      if (category !== 'all' && !courierCats.includes(category)) return false;
      if (availability !== 'all' && c.availabilityStatus !== availability) return false;
      if (city !== 'all' && c.city !== city) return false;

      if (b) {
        const matchesBarrio =
          c.workZone.toLowerCase().includes(b) ||
          c.coverageZones.some((z) => z.toLowerCase().includes(b));
        if (!matchesBarrio) return false;
      }

      if (maxP !== null && !Number.isNaN(maxP) && maxP > 0) {
        if (c.startingPriceArs === null || c.startingPriceArs > maxP) return false;
      }

      if (minRating > 0 && c.ratingAverage < minRating) return false;

      if (q) {
        const catKeywords = courierCats
          .map((id) => {
            const info = CATEGORY_INFO[id];
            return info ? `${info.label} ${info.shortDesc} ${info.keywords.join(' ')}` : '';
          })
          .join(' ');
        const haystack = [
          c.publicName,
          c.vehicle,
          c.workZone,
          c.city,
          c.description,
          ...c.coverageZones,
          catKeywords,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    // Client visibility sort strictly by price, rating, or completed count
    return list.sort((a, bItem) => {
      if (sortBy === 'lowest_price') {
        const pa = a.startingPriceArs ?? Number.MAX_SAFE_INTEGER;
        const pb = bItem.startingPriceArs ?? Number.MAX_SAFE_INTEGER;
        return pa - pb;
      }
      if (sortBy === 'best_rating') {
        if (bItem.ratingAverage !== a.ratingAverage) {
          return bItem.ratingAverage - a.ratingAverage;
        }
        return bItem.ratingCount - a.ratingCount;
      }
      return bItem.completedCount - a.completedCount;
    });
  }, [couriers, queryText, category, availability, city, barrio, maxPrice, minRating, sortBy]);

  const resetFilters = () => {
    setQueryText('');
    setCategory('all');
    setAvailability('all');
    setCity('all');
    setBarrio('');
    setMaxPrice('');
    setMinRating(0);
    setSortBy('lowest_price');
  };

  return (
    <div className="bg-[#F8FAFA] pb-24">
      <div className="border-b border-[#E2E8F0] bg-white px-4 pb-4 pt-3">
        <h1 className="font-display text-lg font-extrabold text-[#063642]">
          Buscar servicios
        </h1>

        <div className="mt-2.5 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#008B8B]" />
            <input
              type="search"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Ej: plomero, fumigación, poda, moto..."
              className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] pl-10 pr-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((p) => !p)}
            className={`flex h-11 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition ${
              showFilters
                ? 'border-[#063642] bg-[#063642] text-white'
                : 'border-[#E2E8F0] bg-white text-[#063642]'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filtros</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 space-y-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFA] p-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">Rubro</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory | 'all')}
                  className="mt-1 h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs font-medium text-[#063642] outline-none focus:border-[#008B8B]"
                >
                  <option value="all">Todos los rubros (14)</option>
                  {ORDERED_CATEGORIES.map((catId) => (
                    <option key={catId} value={catId}>
                      {CATEGORY_INFO[catId].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600">Estado</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as AvailabilityFilter)}
                  className="mt-1 h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs font-medium text-[#063642] outline-none focus:border-[#008B8B]"
                >
                  <option value="all">Todos</option>
                  <option value="available">Disponibles</option>
                  <option value="busy">Ocupados</option>
                  <option value="offline">Desconectados</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600">Ciudad</label>
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value as CityName | 'all');
                    setBarrio('');
                  }}
                  className="mt-1 h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs font-medium text-[#063642] outline-none focus:border-[#008B8B]"
                >
                  <option value="all">Todas las ciudades</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600">Barrio</label>
                <select
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs font-medium text-[#063642] outline-none focus:border-[#008B8B]"
                >
                  <option value="">Todos los barrios</option>
                  {neighborhoodOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Tarifa máxima (ARS)
                </label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Ej: 5000"
                  className="mt-1 h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs font-medium text-[#063642] outline-none focus:border-[#008B8B] tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Calificación mínima
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="mt-1 h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs font-medium text-[#063642] outline-none focus:border-[#008B8B]"
                >
                  <option value={0}>Todas</option>
                  <option value={4}>4.0 o más</option>
                  <option value={4.5}>4.5 o más</option>
                  <option value={4.8}>4.8 o más</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-[#E2E8F0] pt-2.5">
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-[#008B8B]" />
                <select
                  aria-label="Ordenar resultados"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortMode)}
                  className="h-9 rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs font-semibold text-[#063642] outline-none"
                >
                  <option value="lowest_price">Ordenar: Menor precio</option>
                  <option value="best_rating">Ordenar: Mejor calificación</option>
                  <option value="most_completed">Ordenar: Más trabajos</option>
                </select>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="flex h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Limpiar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="mb-3 text-xs font-medium text-slate-500 tabular-nums">
          {filtered.length}{' '}
          {filtered.length === 1 ? 'prestador encontrado' : 'prestadores encontrados'}
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center">
            <p className="text-sm font-semibold text-[#063642]">
              No encontramos prestadores con esos filtros
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Probá ampliando el precio máximo, el barrio o la ciudad.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 h-10 rounded-xl bg-[#008B8B] px-4 text-xs font-bold text-white"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((courier) => (
              <CourierCard
                key={courier.id}
                courier={courier}
                isFavorite={favorites.includes(courier.id)}
                onToggleFavorite={onToggleFavorite}
                onViewProfile={onViewProfile}
                onContact={onContact}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
