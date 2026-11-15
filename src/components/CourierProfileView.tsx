import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  Heart,
  MapPin,
  MessageSquare,
  PackageCheck,
  Phone,
  PowerOff,
  ShieldAlert,
  Star,
} from 'lucide-react';
import type { CourierPublicProfile, RatingRecord } from '../types/synk';
import {
  AVAILABILITY_META,
  TARIFF_MODE_LABELS,
  formatARS,
  formatDateAR,
  getCategoryInfo,
  getCourierCategories,
  getInitials,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface CourierProfileViewProps {
  courier: CourierPublicProfile;
  ratings: RatingRecord[];
  isFavorite: boolean;
  isOwnProfile: boolean;
  isPreviewMode?: boolean;
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
  isPreviewMode = false,
  onBack,
  onToggleFavorite,
  onStartChat,
  onGoToOwnPanel,
}) => {
  const [imgError, setImgError] = useState(false);
  const status = courier.availabilityStatus;
  const statusMeta = AVAILABILITY_META[status];
  const categories = getCourierCategories(courier);

  return (
    <div className="bg-[#F8FAFA] pb-28">
      {/* Sub-header */}
      <div className="sticky top-14 z-20 flex items-center justify-between border-b border-[#E2E8F0] bg-white/95 px-4 py-2.5 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 items-center gap-1.5 pr-3 text-sm font-semibold text-[#063642]"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{isPreviewMode ? 'Volver a Modo Trabajo' : 'Volver'}</span>
        </button>

        {!isPreviewMode && (
          <button
            type="button"
            onClick={() => onToggleFavorite(courier.id)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-slate-600 transition active:scale-95"
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? 'fill-[#008B8B] text-[#008B8B]' : 'text-slate-500'
              }`}
            />
          </button>
        )}
      </div>

      {isPreviewMode && (
        <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[#063642]/20 bg-[#063642] px-3.5 py-2.5 text-xs text-white">
          <div className="flex min-w-0 items-center gap-2">
            <Eye className="h-4 w-4 shrink-0 text-[#F5A623]" />
            <span className="font-medium leading-snug">
              Vista previa en modo lectura · Así ven tu perfil los clientes.
            </span>
          </div>
        </div>
      )}

      {/* Hero Profile Block */}
      <div className="p-4">
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-4">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl bg-[#063642] text-white shadow-sm">
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
              <h1 className="font-display text-xl font-extrabold text-[#063642]">
                {courier.publicName}
              </h1>

              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-600">
                <CategoryIcon category={courier.serviceCategory} className="h-4 w-4 text-[#008B8B]" />
                <span>{categories.map((c) => getCategoryInfo(c).label).join(' · ')}</span>
                {courier.vehicle && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{courier.vehicle}</span>
                  </>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${statusMeta.bgSoftClass} ${statusMeta.textClass}`}
                >
                  {status === 'available' && <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />}
                  {status === 'busy' && <Clock className="h-3.5 w-3.5 text-[#EF4444]" />}
                  {status === 'offline' && <PowerOff className="h-3.5 w-3.5 text-[#9CA3AF]" />}
                  <span>{statusMeta.label}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="mt-5 grid grid-cols-3 divide-x divide-[#E2E8F0] rounded-2xl border border-[#E2E8F0] bg-[#F8FAFA] py-3">
            <div className="px-2 text-center">
              <div className="flex items-center justify-center gap-1 font-display text-base font-extrabold text-[#063642] tabular-nums">
                <Star className="h-4 w-4 fill-[#F5A623] text-[#F5A623]" />
                <span>{courier.ratingCount > 0 ? courier.ratingAverage.toFixed(1) : '—'}</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500 tabular-nums">
                {courier.ratingCount} {courier.ratingCount === 1 ? 'opinión' : 'opiniones'}
              </p>
            </div>
            <div className="px-2 text-center">
              <div className="flex items-center justify-center gap-1 font-display text-base font-extrabold text-[#063642] tabular-nums">
                <PackageCheck className="h-4 w-4 text-[#008B8B]" />
                <span>{courier.completedCount}</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">Completados</p>
            </div>
            <div className="px-2 text-center">
              <div className="font-mono text-sm font-bold text-[#063642] tabular-nums">
                {courier.startingPriceArs
                  ? `$${courier.startingPriceArs.toLocaleString('es-AR')}`
                  : 'A convenir'}
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">Tarifa base</p>
            </div>
          </div>
        </div>

        {status === 'busy' && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" />
            <p className="leading-relaxed">
              Este prestador se encuentra realizando otro trabajo. Podés consultar sus tarifas y
              perfil, pero para contratar ahora contactá a un prestador disponible.
            </p>
          </div>
        )}

        {status === 'offline' && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[#E2E8F0] bg-white p-3.5 text-xs text-slate-700">
            <PowerOff className="mt-0.5 h-4 w-4 shrink-0 text-[#9CA3AF]" />
            <p className="leading-relaxed">
              Este prestador está desconectado (fuera de horario laboral / descansando). Buscá un
              prestador disponible para atención inmediata.
            </p>
          </div>
        )}

        {/* Description */}
        <section className="mt-5 rounded-3xl border border-[#E2E8F0] bg-white p-4">
          <h2 className="font-display text-sm font-bold text-[#063642]">Sobre el servicio</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {courier.description || 'Prestador independiente habilitado en la zona.'}
          </p>

          {/* Coverage, Schedule & Contact */}
          <div className="mt-4 space-y-3 border-t border-[#E2E8F0] pt-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#008B8B]" />
              <div>
                <p className="text-xs font-bold text-[#063642]">Ciudad y zonas de cobertura</p>
                <p className="mt-0.5 text-sm text-slate-600">
                  {courier.city} ·{' '}
                  {courier.coverageZones.length > 0
                    ? courier.coverageZones.join(' · ')
                    : courier.workZone}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#008B8B]" />
              <div>
                <p className="text-xs font-bold text-[#063642]">Horarios habituales</p>
                <p className="mt-0.5 text-sm text-slate-600">{courier.schedule}</p>
              </div>
            </div>

            {courier.contactPhone && (
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#008B8B]" />
                <div>
                  <p className="text-xs font-bold text-[#063642]">Teléfono / WhatsApp</p>
                  <p className="mt-0.5 font-mono text-sm text-slate-700">{courier.contactPhone}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Tariffs */}
        <section className="mt-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-sm font-bold text-[#063642]">Tarifas</h2>
            <span className="text-xs text-slate-400">Expresadas en ARS</span>
          </div>

          {courier.tariffs.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              Tarifas a convenir directamente con el prestador.
            </p>
          ) : (
            <div className="mt-3 space-y-2.5">
              {courier.tariffs.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#063642]">{t.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {TARIFF_MODE_LABELS[t.mode]}
                      {t.zoneName ? ` · ${t.zoneName}` : ''}
                      {t.unitLabel ? ` · ${t.unitLabel}` : ''}
                    </p>
                    {t.notes && <p className="mt-1 text-xs text-slate-600">{t.notes}</p>}
                  </div>
                  <span className="shrink-0 font-mono text-sm font-bold text-[#063642] tabular-nums">
                    {formatARS(t.priceArs)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Extra services */}
        {courier.extraServices.length > 0 && (
          <section className="mt-5 rounded-3xl border border-[#E2E8F0] bg-white p-4">
            <h2 className="font-display text-sm font-bold text-[#063642]">
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
        <section className="mt-5">
          <h2 className="font-display text-sm font-bold text-[#063642]">
            Valoraciones de trabajos completados
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
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#063642]">{r.clientName}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#063642] tabular-nums">
                      <Star className="h-3.5 w-3.5 fill-[#F5A623] text-[#F5A623]" />
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
      <div className="fixed bottom-16 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 bg-gradient-to-t from-[#F8FAFA] via-[#F8FAFA] to-[#F8FAFA]/0 px-4 pb-3 pt-4">
        {isOwnProfile || isPreviewMode ? (
          <button
            type="button"
            onClick={onGoToOwnPanel}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#063642] text-sm font-bold text-white shadow-md transition active:scale-[0.98]"
          >
            {isPreviewMode ? 'Volver a Modo Trabajo' : 'Administrar mi perfil y tarifas'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onStartChat(courier)}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold shadow-md transition active:scale-[0.98] ${
              status === 'available'
                ? 'bg-[#063642] text-white hover:bg-[#052a34]'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>
              {status === 'available'
                ? 'Iniciar conversación'
                : status === 'busy'
                ? 'Prestador ocupado'
                : 'Fuera de horario (Desconectado)'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
