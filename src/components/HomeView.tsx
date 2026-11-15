import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Search,
  X,
} from 'lucide-react';
import type {
  Contract,
  CourierPublicProfile,
  CurrentSession,
  ServiceCategory,
} from '../types/synk';
import {
  CATEGORY_GROUPS,
  CATEGORY_INFO,
  FEATURED_CATEGORIES,
  ORDERED_CATEGORIES,
  getCourierCategories,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { CourierCard } from './CourierCard';

interface HomeViewProps {
  session: CurrentSession;
  couriers: CourierPublicProfile[];
  favorites: string[];
  activeContracts: Contract[];
  onSelectCategory: (category: ServiceCategory) => void;
  onOpenChat: (conversationId: string) => void;
  onOpenJobs: () => void;
  onOpenAdvancedSearch: () => void;
  onToggleFavorite: (courierId: string) => void;
  onViewProfile: (courierId: string) => void;
  onContactCourier: (courier: CourierPublicProfile) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  session,
  couriers,
  favorites,
  activeContracts,
  onSelectCategory,
  onOpenChat,
  onOpenJobs,
  onOpenAdvancedSearch,
  onToggleFavorite,
  onViewProfile,
  onContactCourier,
}) => {
  const [quickQuery, setQuickQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  const cityCouriers = useMemo(
    () => couriers.filter((c) => c.city === session.city),
    [couriers, session.city]
  );

  const normalizedQuery = quickQuery.trim().toLowerCase();

  const matchingCategories = useMemo(() => {
    if (!normalizedQuery) return [];
    return ORDERED_CATEGORIES.filter((catId) => {
      const info = CATEGORY_INFO[catId];
      const text = [info.label, info.shortDesc, ...info.keywords].join(' ').toLowerCase();
      return text.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const matchingCouriers = useMemo(() => {
    if (!normalizedQuery) return [];
    return cityCouriers.filter((c) => {
      const cats = getCourierCategories(c);
      const catText = cats
        .map((id) => {
          const info = CATEGORY_INFO[id];
          return info ? `${info.label} ${info.shortDesc} ${info.keywords.join(' ')}` : '';
        })
        .join(' ');
      const haystack = [
        c.publicName,
        c.vehicle,
        c.workZone,
        c.description,
        ...c.coverageZones,
        catText,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [cityCouriers, normalizedQuery]);

  const renderCategoryCard = (catId: ServiceCategory) => {
    const info = CATEGORY_INFO[catId];
    const availCount = cityCouriers.filter(
      (c) => getCourierCategories(c).includes(catId) && c.availabilityStatus === 'available'
    ).length;
    const totalCount = cityCouriers.filter((c) =>
      getCourierCategories(c).includes(catId)
    ).length;

    return (
      <button
        key={catId}
        type="button"
        onClick={() => onSelectCategory(catId)}
        className="group flex flex-col items-start justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition hover:border-[#008B8B] active:scale-[0.98] dark:border-[#1E4452] dark:bg-[#0D252E] dark:hover:border-[#2DD4BF]"
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#008B8B]/10 text-[#008B8B] transition group-hover:bg-[#008B8B] group-hover:text-white dark:bg-[#008B8B]/20 dark:text-[#2DD4BF]">
            <CategoryIcon category={catId} className="h-6 w-6" />
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#008B8B] dark:text-slate-500 dark:group-hover:text-[#2DD4BF]" />
        </div>

        <div className="mt-3.5">
          <h2 className="font-display text-sm font-bold leading-snug text-[#063642] dark:text-white">
            {info.label}
          </h2>
          <p className="mt-1 text-xs text-slate-500 tabular-nums dark:text-slate-400">
            {availCount > 0 ? (
              <span className="font-semibold text-[#16A34A] dark:text-[#4ADE80]">
                {availCount} {availCount === 1 ? 'disponible' : 'disponibles'}
              </span>
            ) : totalCount > 0 ? (
              <span>
                {totalCount} en {session.city}
              </span>
            ) : (
              <span>Explorar</span>
            )}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="bg-[#F8FAFA] pb-24 dark:bg-[#07181E]">
      {/* Always-visible Quick Search Bar */}
      <div className="sticky top-14 z-20 border-b border-[#E2E8F0] bg-white/95 px-4 py-3 backdrop-blur-md dark:border-[#1E4452] dark:bg-[#0D252E]/95">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#008B8B] dark:text-[#2DD4BF]" />
          <input
            type="search"
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            placeholder="Buscar (ej: plomero, fumigación, poda, moto...)"
            aria-label="Búsqueda rápida de rubros y prestadores"
            className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] pl-10 pr-10 text-sm text-[#063642] outline-none transition placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
          />
          {quickQuery && (
            <button
              type="button"
              onClick={() => setQuickQuery('')}
              className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#063642] dark:hover:bg-[#1E4452] dark:hover:text-white"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hero Title */}
      <section className="px-4 pb-1 pt-5">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#063642] text-balance dark:text-white">
          ¿Qué necesitás resolver hoy?
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Elegí un rubro y conectá directo con prestadores independientes en {session.city}.
        </p>
      </section>

      {/* Active Contracts Quick Strip */}
      {activeContracts.length > 0 && (
        <section className="px-4 pt-3">
          {activeContracts.slice(0, 1).map((ct) => (
            <button
              key={ct.id}
              type="button"
              onClick={() => onOpenChat(ct.conversationId)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#F5A623]/40 bg-[#F5A623]/10 p-3.5 text-left transition hover:bg-[#F5A623]/15 dark:bg-[#F5A623]/15"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#063642] dark:text-[#F5A623]">
                  {ct.status === 'accepted' ? 'Trabajo en curso' : 'Propuesta pendiente'}
                </p>
                <p className="truncate text-sm font-bold text-[#063642] dark:text-white">
                  {session.uid === ct.courierId ? ct.clientName : ct.courierName} · {ct.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#008B8B] dark:text-[#2DD4BF]" />
            </button>
          ))}
        </section>
      )}

      {/* Filtered Results when Quick Search is active */}
      {normalizedQuery ? (
        <div className="space-y-5 px-4 pt-4">
          <section>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="font-display text-sm font-extrabold text-[#063642] dark:text-white">
                Rubros coincidentes ({matchingCategories.length})
              </h2>
              <button
                type="button"
                onClick={onOpenAdvancedSearch}
                className="text-xs font-bold text-[#008B8B] hover:underline dark:text-[#2DD4BF]"
              >
                Filtros avanzados
              </button>
            </div>

            {matchingCategories.length === 0 ? (
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-xs text-slate-500 dark:border-[#1E4452] dark:bg-[#0D252E] dark:text-slate-400">
                No encontramos rubros con «{quickQuery}». Probá con palabras como moto, plomero,
                poda, flete o fumigación.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {matchingCategories.map((catId) => renderCategoryCard(catId))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-2.5 font-display text-sm font-extrabold text-[#063642] dark:text-white">
              Prestadores en {session.city} ({matchingCouriers.length})
            </h2>
            {matchingCouriers.length === 0 ? (
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 text-center text-xs text-slate-500 dark:border-[#1E4452] dark:bg-[#0D252E] dark:text-slate-400">
                Todavía no hay prestadores que coincidan con «{quickQuery}» en {session.city}.
              </div>
            ) : (
              <div className="space-y-3">
                {matchingCouriers.map((courier) => (
                  <CourierCard
                    key={courier.id}
                    courier={courier}
                    isFavorite={favorites.includes(courier.id)}
                    onToggleFavorite={onToggleFavorite}
                    onViewProfile={onViewProfile}
                    onContact={onContactCourier}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        /* Default Clean Home: 4 Featured Rubros + Ver más rubros (+10) */
        <section className="px-4 pt-4">
          {!showAllCategories ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {FEATURED_CATEGORIES.map((catId) => renderCategoryCard(catId))}
              </div>

              <button
                type="button"
                onClick={() => setShowAllCategories(true)}
                className="mt-3.5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#063642]/20 bg-white px-4 font-display text-sm font-bold text-[#063642] transition hover:border-[#008B8B] hover:text-[#008B8B] active:scale-[0.99] dark:border-[#1E4452] dark:bg-[#0D252E] dark:text-white dark:hover:border-[#2DD4BF] dark:hover:text-[#2DD4BF]"
              >
                <span>Ver más rubros (+10)</span>
                <ChevronDown className="h-4 w-4 text-[#008B8B] dark:text-[#2DD4BF]" />
              </button>
            </>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-extrabold text-[#063642] dark:text-white">
                  Todos los rubros (14)
                </p>
                <button
                  type="button"
                  onClick={() => setShowAllCategories(false)}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-bold text-[#008B8B] hover:bg-slate-50 dark:border-[#1E4452] dark:bg-[#0D252E] dark:text-[#2DD4BF] dark:hover:bg-[#13323D]"
                >
                  <span>Ver solo destacados</span>
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
              </div>

              {CATEGORY_GROUPS.map((group) => (
                <div key={group.title} className="space-y-2.5">
                  <h2 className="font-display text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {group.title}
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {group.items.map((catId) => renderCategoryCard(catId))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Job Opportunities Shortcut */}
      <section className="px-4 pt-6">
        <button
          type="button"
          onClick={onOpenJobs}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition hover:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#0D252E] dark:hover:border-[#2DD4BF]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#063642] text-white dark:bg-[#13323D]">
              <Briefcase className="h-5 w-5 text-[#F5A623]" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-[#063642] dark:text-white">
                Oportunidades laborales
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                Comercios que buscan prestadores por turno o fijos
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </section>
    </div>
  );
};
