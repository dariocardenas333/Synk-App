import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  MapPin,
  MessageSquare,
  PowerOff,
  Star,
} from 'lucide-react';
import type { CourierPublicProfile } from '../types/synk';
import {
  AVAILABILITY_META,
  TARIFF_MODE_LABELS,
  formatARSCompact,
  getCategoryInfo,
  getCourierCategories,
  getInitials,
} from '../utils/formatters';

interface CourierCardProps {
  courier: CourierPublicProfile;
  isFavorite: boolean;
  onToggleFavorite: (courierId: string) => void;
  onViewProfile: (courierId: string) => void;
  onContact: (courier: CourierPublicProfile) => void;
}

export const CourierCard: React.FC<CourierCardProps> = ({
  courier,
  isFavorite,
  onToggleFavorite,
  onViewProfile,
  onContact,
}) => {
  const [showAllTariffs, setShowAllTariffs] = useState(false);
  const [imgError, setImgError] = useState(false);

  const status = courier.availabilityStatus;
  const statusMeta = AVAILABILITY_META[status];
  const isOffline = status === 'offline';
  const categoriesLabel = getCourierCategories(courier)
    .map((id) => getCategoryInfo(id).label)
    .filter(Boolean)
    .join(' · ');

  const visibleTariffs = showAllTariffs ? courier.tariffs : courier.tariffs.slice(0, 3);
  const extraTariffsCount = Math.max(0, courier.tariffs.length - 3);

  return (
    <article
      className={`rounded-2xl border bg-white p-4 transition dark:bg-[#0D252E] ${
        isOffline
          ? 'border-[#E2E8F0] opacity-65 hover:border-slate-300 dark:border-[#1E4452] dark:hover:border-slate-600'
          : 'border-[#E2E8F0] hover:border-[#008B8B]/50 dark:border-[#1E4452] dark:hover:border-[#2DD4BF]/50'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <button
          type="button"
          onClick={() => onViewProfile(courier.id)}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#063642] text-white dark:bg-[#13323D]"
          aria-label={`Ver perfil de ${courier.publicName}`}
        >
          {courier.photoUrl && !imgError ? (
            <img
              src={courier.photoUrl}
              alt={courier.publicName}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-display text-lg font-bold">
              {getInitials(courier.publicName)}
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onViewProfile(courier.id)}
                className="block truncate text-left font-display text-base font-bold text-[#063642] hover:underline dark:text-white"
              >
                {courier.publicName}
              </button>

              <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-300">
                {categoriesLabel}
                {courier.vehicle ? ` · ${courier.vehicle}` : ''}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onToggleFavorite(courier.id)}
              className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-[#F8FAFA] active:scale-90 dark:hover:bg-[#13323D]"
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite
                    ? 'fill-[#008B8B] text-[#008B8B] dark:fill-[#2DD4BF] dark:text-[#2DD4BF]'
                    : 'text-slate-400'
                }`}
              />
            </button>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#008B8B] dark:text-[#2DD4BF]" />
              <span className="max-w-[175px] truncate">
                {courier.workZone} ({courier.city})
              </span>
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0]/70 pt-2.5 dark:border-[#1E4452]">
            <div className="flex items-center gap-2.5 text-xs">
              <span className={`inline-flex items-center gap-1 font-semibold ${statusMeta.textClass}`}>
                {status === 'available' && <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />}
                {status === 'busy' && <Clock className="h-3.5 w-3.5 text-[#EF4444]" />}
                {status === 'offline' && <PowerOff className="h-3.5 w-3.5 text-[#9CA3AF]" />}
                <span>{statusMeta.label}</span>
              </span>

              <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                ·
              </span>

              <span className="inline-flex items-center gap-1 font-semibold text-[#063642] tabular-nums dark:text-white">
                <Star className="h-3.5 w-3.5 fill-[#F5A623] text-[#F5A623]" />
                {courier.ratingCount > 0 ? (
                  <>
                    <span>{courier.ratingAverage.toFixed(1)}</span>
                    <span className="font-normal text-slate-400">({courier.ratingCount})</span>
                  </>
                ) : (
                  <span className="font-normal text-slate-500 dark:text-slate-400">Nuevo</span>
                )}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400">Desde </span>
              <span className="font-mono text-sm font-semibold text-[#063642] tabular-nums dark:text-white">
                {formatARSCompact(courier.startingPriceArs)}
              </span>
            </div>
          </div>

          {isOffline && (
            <p className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Fuera de horario laboral · Respuesta diferida
            </p>
          )}
        </div>
      </div>

      {/* Directly visible tariff list inside card */}
      <div className="mt-3 rounded-xl border border-[#E2E8F0]/70 bg-[#F8FAFA] p-3 dark:border-[#1E4452] dark:bg-[#13323D]/70">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Tarifas publicadas
        </p>
        {courier.tariffs.length === 0 ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tarifa a convenir por chat según el trabajo o recorrido.
          </p>
        ) : (
          <>
            <ul className="mt-2 divide-y divide-[#E2E8F0] dark:divide-[#1E4452]">
              {visibleTariffs.map((tariff) => (
                <li
                  key={tariff.id}
                  className="flex items-start justify-between gap-3 py-1.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#063642] dark:text-slate-100">
                      {tariff.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {TARIFF_MODE_LABELS[tariff.mode]}
                      {tariff.zoneName ? ` · ${tariff.zoneName}` : ''}
                      {tariff.unitLabel ? ` · ${tariff.unitLabel}` : ''}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs font-bold text-[#063642] tabular-nums dark:text-white">
                    {formatARSCompact(tariff.priceArs)}
                  </span>
                </li>
              ))}
            </ul>
            {extraTariffsCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAllTariffs((prev) => !prev)}
                className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#008B8B] hover:underline dark:text-[#2DD4BF]"
              >
                <span>
                  {showAllTariffs
                    ? 'Ver menos tarifas'
                    : `Ver ${extraTariffsCount} ${extraTariffsCount === 1 ? 'tarifa más' : 'tarifas más'}`}
                </span>
                {showAllTariffs ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onViewProfile(courier.id)}
          className="flex h-11 flex-1 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-[#063642] transition hover:border-[#063642] whitespace-nowrap dark:border-[#1E4452] dark:bg-[#13323D] dark:text-slate-100 dark:hover:border-[#2DD4BF]"
        >
          Ver perfil completo
        </button>

        <button
          type="button"
          onClick={() => onContact(courier)}
          className={`flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-3.5 text-xs font-bold transition active:scale-[0.98] whitespace-nowrap ${
            status === 'available'
              ? 'bg-[#008B8B] text-white hover:bg-[#007676]'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-[#13323D] dark:text-slate-400 dark:hover:bg-[#1A4352]'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Contactar</span>
        </button>
      </div>
    </article>
  );
};
