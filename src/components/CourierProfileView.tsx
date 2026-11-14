import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  MessageSquare,
  PackageCheck,
  ShieldAlert,
  Star,
} from 'lucide-react';
import type { CourierPublicProfile, RatingRecord } from '../types/synk';
import {
  CATEGORY_INFO,
  TARIFF_MODE_LABELS,
  formatARS,
  formatDateAR,
  getInitials,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface CourierProfileViewProps {
  courier: CourierPublicProfile;
  ratings: RatingRecord[];
  isFavorite: boolean;
  isOwnProfile: boolean;
  onBack: () => void;
  onToggleFavorite: (courierId: string) => void;
  onStartChat: (courier: CourierPublicProfile) => void;
  onGoToOwnPanel: () => void;
}

export const CourierProfileView: React.FC<CourierProfileViewProps> = ({
  courier,
  ratings,
  isFavorite,
  isOwnProfile,
  onBack,
  onToggleFavorite,
  onStartChat,
  onGoToOwnPanel,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="pb-24">
      {/* Sub-header */}
      <div className="sticky top-14 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-2.5 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 items-center gap-1.5 pr-3 text-sm font-semibold text-[#1A2E4A]"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleFavorite(courier.id)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition active:scale-95"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? 'fill-[#FF6B00] text-[#FF6B00]' : 'text-slate-500'
            }`}
          />
        </button>
      </div>

      {/* Hero Profile Block */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl bg-[#1A2E4A] text-white shadow-sm">
            {courier.photoUrl && !imgError ? (
              <img
                src={courier.photoUrl}
                alt={courier.publicName}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-display text-2xl font-bold">
                {getInitials(courier.publicName)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-extrabold text-[#1A2E4A]">
                {courier.publicName}
              </h1>
              {courier.isDemo && (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  Demo
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <CategoryIcon category={courier.serviceCategory} className="h-4 w-4 text-[#FF6B00]" />
              <span>{CATEGORY_INFO[courier.serviceCategory].label}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{courier.vehicle}</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                  courier.isAvailable
                    ? 'bg-[#22C55E]/12 text-[#15803D]'
                    : 'bg-[#EF4444]/12 text-[#B91C1C]'
                }`}
              >
                {courier.isAvailable ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-[#EF4444]" />
                )}
                <span>{courier.isAvailable ? 'Disponible ahora' : 'Ocupado en mandado'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50 py-3">
          <div className="px-2 text-center">
            <div className="flex items-center justify-center gap-1 font-display text-base font-extrabold text-[#1A2E4A] tabular-nums">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{courier.ratingCount > 0 ? courier.ratingAverage.toFixed(1) : '—'}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500 tabular-nums">
              {courier.ratingCount} {courier.ratingCount === 1 ? 'opinión' : 'opiniones'}
            </p>
          </div>
          <div className="px-2 text-center">
            <div className="flex items-center justify-center gap-1 font-display text-base font-extrabold text-[#1A2E4A] tabular-nums">
              <PackageCheck className="h-4 w-4 text-[#FF6B00]" />
              <span>{courier.completedCount}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">Completados</p>
          </div>
          <div className="px-2 text-center">
            <div className="font-mono text-sm font-bold text-[#1A2E4A] tabular-nums">
              {courier.startingPriceArs
                ? `$${courier.startingPriceArs.toLocaleString('es-AR')}`
                : 'A convenir'}
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">Tarifa base</p>
          </div>
        </div>

        {!courier.isAvailable && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" />
            <p className="leading-relaxed">
              Este repartidor se encuentra realizando otro mandado. Podés consultar sus tarifas y
              perfil, pero para contratar ahora contactá a un repartidor disponible.
            </p>
          </div>
        )}

        {/* Description */}
        <section className="mt-6">
          <h2 className="font-display text-sm font-bold text-[#1A2E4A]">Sobre el servicio</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {courier.description || 'Repartidor independiente habilitado en la zona.'}
          </p>
        </section>

        {/* Coverage & Schedule */}
        <section className="mt-6 space-y-3 border-t border-slate-100 pt-5">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B00]" />
            <div>
              <p className="text-xs font-bold text-[#1A2E4A]">Ciudad y zonas de cobertura</p>
              <p className="mt-0.5 text-sm text-slate-600">
                {courier.city} · {courier.coverageZones.length > 0 ? courier.coverageZones.join(' · ') : courier.workZone}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B00]" />
            <div>
              <p className="text-xs font-bold text-[#1A2E4A]">Horarios habituales</p>
              <p className="mt-0.5 text-sm text-slate-600">{courier.schedule}</p>
            </div>
          </div>
        </section>

        {/* Tariffs */}
        <section className="mt-6 border-t border-slate-100 pt-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-sm font-bold text-[#1A2E4A]">Tarifas</h2>
            <span className="text-xs text-slate-400">Expresadas en ARS</span>
          </div>

          {courier.tariffs.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              Tarifas a convenir directamente con el repartidor.
            </p>
          ) : (
            <div className="mt-3 space-y-2.5">
              {courier.tariffs.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{t.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {TARIFF_MODE_LABELS[t.mode]}
                      {t.zoneName ? ` · ${t.zoneName}` : ''}
                      {t.unitLabel ? ` · ${t.unitLabel}` : ''}
                    </p>
                    {t.notes && <p className="mt-1 text-xs text-slate-600">{t.notes}</p>}
                  </div>
                  <span className="shrink-0 font-mono text-sm font-bold text-[#1A2E4A] tabular-nums">
                    {formatARS(t.priceArs)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Extra services */}
        {courier.extraServices.length > 0 && (
          <section className="mt-6 border-t border-slate-100 pt-5">
            <h2 className="font-display text-sm font-bold text-[#1A2E4A]">
              Servicios adicionales
            </h2>
            <ul className="mt-2 space-y-1.5">
              {courier.extraServices.map((srv, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
                  <span>{srv}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Verified Reviews */}
        <section className="mt-6 border-t border-slate-100 pt-5">
          <h2 className="font-display text-sm font-bold text-[#1A2E4A]">
            Valoraciones de mandados completados
          </h2>
          {ratings.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              Todavía no tiene reseñas registradas.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {ratings.map((r) => (
                <div
                  key={r.contractId}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#1A2E4A]">{r.clientName}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 tabular-nums">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {r.score.toFixed(1)}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{r.comment}</p>
                  )}
                  <p className="mt-1.5 text-[11px] text-slate-400 tabular-nums">
                    {formatDateAR(r.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-16 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 bg-gradient-to-t from-white via-white to-white/0 px-4 pb-3 pt-4">
        {isOwnProfile ? (
          <button
            type="button"
            onClick={onGoToOwnPanel}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#1A2E4A] text-sm font-bold text-white shadow-md transition active:scale-[0.98]"
          >
            Administrar mi perfil y tarifas
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onStartChat(courier)}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold shadow-md transition active:scale-[0.98] ${
              courier.isAvailable
                ? 'bg-[#FF6B00] text-white hover:bg-[#e56000]'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>
              {courier.isAvailable ? 'Iniciar conversación' : 'Repartidor ocupado'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
