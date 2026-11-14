import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  MapPin,
  MessageSquare,
  Star,
} from 'lucide-react';
import type { CourierPublicProfile } from '../types/synk';
import {
  CATEGORY_INFO,
  TARIFF_MODE_LABELS,
  formatARSCompact,
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
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <article className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:border-slate-300">
      <div className="flex items-start gap-3.5">
        <button
          type="button"
          onClick={() => onViewProfile(courier.id)}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#1A2E4A] text-white"
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onViewProfile(courier.id)}
                  className="truncate text-left font-display text-base font-bold text-[#1A2E4A] hover:underline"
                >
                  {courier.publicName}
                </button>
                {courier.isDemo && (
                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                    Demo
                  </span>
                )}
              </div>

              <p className="mt-0.5 truncate text-xs text-slate-600">
                {CATEGORY_INFO[courier.serviceCategory].label} · {courier.vehicle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onToggleFavorite(courier.id)}
              className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-50 active:scale-90"
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite ? 'fill-[#FF6B00] text-[#FF6B00]' : 'text-slate-400'
                }`}
              />
            </button>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate max-w-[175px]">
                {courier.workZone} ({courier.city})
              </span>
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
            <div className="flex items-center gap-3 text-xs">
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  courier.isAvailable ? 'text-[#16A34A]' : 'text-[#DC2626]'
                }`}
              >
                {courier.isAvailable ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-[#EF4444]" />
                )}
                <span>{courier.isAvailable ? 'Disponible' : 'Ocupado'}</span>
              </span>

              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>

              <span className="inline-flex items-center gap-1 font-semibold text-slate-800 tabular-nums">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {courier.ratingCount > 0 ? (
                  <>
                    <span>{courier.ratingAverage.toFixed(1)}</span>
                    <span className="font-normal text-slate-400">({courier.ratingCount})</span>
                  </>
                ) : (
                  <span className="font-normal text-slate-500">Nuevo</span>
                )}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400">Desde </span>
              <span className="font-mono text-sm font-semibold text-[#1A2E4A] tabular-nums">
                {formatARSCompact(courier.startingPriceArs)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions + Expandable tariff drawer */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-[#1A2E4A] transition hover:bg-slate-100"
          aria-expanded={expanded}
        >
          <span>{expanded ? 'Ocultar tarifas' : `Ver tarifas (${courier.tariffs.length})`}</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onViewProfile(courier.id)}
          className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-[#1A2E4A] transition hover:bg-slate-50 whitespace-nowrap"
        >
          Ver perfil
        </button>

        <button
          type="button"
          onClick={() => onContact(courier)}
          className={`flex h-11 items-center justify-center gap-1.5 rounded-xl px-3.5 text-xs font-bold transition active:scale-[0.98] whitespace-nowrap ${
            courier.isAvailable
              ? 'bg-[#FF6B00] text-white hover:bg-[#e56000]'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Contactar</span>
        </button>
      </div>

      {expanded && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Tarifas publicadas
          </p>
          {courier.tariffs.length === 0 ? (
            <p className="mt-1.5 text-xs text-slate-500">
              Tarifa a convenir por chat según el recorrido.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-200/70">
              {courier.tariffs.map((tariff) => (
                <li key={tariff.id} className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900">{tariff.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {TARIFF_MODE_LABELS[tariff.mode]}
                      {tariff.zoneName ? ` · ${tariff.zoneName}` : ''}
                      {tariff.unitLabel ? ` · ${tariff.unitLabel}` : ''}
                    </p>
                    {tariff.notes && (
                      <p className="mt-0.5 text-[11px] text-slate-500">{tariff.notes}</p>
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-xs font-semibold text-[#1A2E4A] tabular-nums">
                    {formatARSCompact(tariff.priceArs)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
};
