import React, { useState } from 'react';
import {
  Briefcase,
  MapPin,
  Plus,
  RefreshCw,
  Send,
  Store,
} from 'lucide-react';
import type {
  CityName,
  Contract,
  CourierPublicProfile,
  CurrentSession,
  JobOpportunity,
  MerchantProfile,
  ServiceCategory,
} from '../types/synk';
import {
  CATEGORY_INFO,
  CITIES,
  MERCHANT_CATEGORIES,
  formatDateAR,
} from '../utils/formatters';
import { CourierCard } from './CourierCard';

interface MerchantWorkspaceViewProps {
  session: CurrentSession;
  merchant?: MerchantProfile;
  couriers: CourierPublicProfile[];
  favorites: string[];
  contracts: Contract[];
  jobOpportunities: JobOpportunity[];
  onOpenMerchantAuth: () => void;
  onUpdateMerchantProfile: (
    patch: Partial<
      Pick<
        MerchantProfile,
        'businessName' | 'ownerName' | 'address' | 'city' | 'category' | 'description'
      >
    >
  ) => Promise<void>;
  onCreateJob: (input: {
    title: string;
    description: string;
    serviceCategory: ServiceCategory;
    modality: 'puntual' | 'recurrente' | 'turno';
    paySummary: string;
  }) => Promise<void>;
  onToggleJobStatus: (jobId: string) => Promise<void>;
  onToggleFavorite: (courierId: string) => void;
  onViewCourierProfile: (courierId: string) => void;
  onContactCourier: (courier: CourierPublicProfile, presetMessage?: string) => void;
}

export const MerchantWorkspaceView: React.FC<MerchantWorkspaceViewProps> = ({
  session,
  merchant,
  couriers,
  favorites,
  contracts,
  jobOpportunities,
  onOpenMerchantAuth,
  onUpdateMerchantProfile,
  onCreateJob,
  onToggleJobStatus,
  onToggleFavorite,
  onViewCourierProfile,
  onContactCourier,
}) => {
  const isMerchant = session.role === 'merchant' && Boolean(merchant);
  const [subTab, setSubTab] = useState<'dispatch' | 'jobs' | 'profile'>(
    isMerchant ? 'dispatch' : 'jobs'
  );

  // Dispatch request modal state
  const [dispatchCourier, setDispatchCourier] = useState<CourierPublicProfile | null>(null);
  const [dispatchDesc, setDispatchDesc] = useState('');
  const [dispatchModality, setDispatchModality] = useState<'puntual' | 'recurrente'>('puntual');

  // Merchant profile edit state
  const [bName, setBName] = useState(merchant?.businessName || '');
  const [oName, setOName] = useState(merchant?.ownerName || '');
  const [address, setAddress] = useState(merchant?.address || '');
  const [city, setCity] = useState<CityName>(merchant?.city || session.city);
  const [category, setCategory] = useState(merchant?.category || MERCHANT_CATEGORIES[0]);
  const [desc, setDesc] = useState(merchant?.description || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Job form state
  const [showJobForm, setShowJobForm] = useState(false);
  const [jTitle, setJTitle] = useState('');
  const [jDesc, setJDesc] = useState('');
  const [jCat, setJCat] = useState<ServiceCategory>('motomandado');
  const [jMod, setJMod] = useState<'puntual' | 'recurrente' | 'turno'>('turno');
  const [jPay, setJPay] = useState('');

  // Previously hired couriers for quick re-hire
  const knownCourierIds = Array.from(
    new Set(
      contracts
        .filter((c) => c.clientId === session.uid && c.status !== 'cancelled')
        .map((c) => c.courierId)
    )
  );
  const knownCouriers = couriers.filter((c) => knownCourierIds.includes(c.id));
  const favoriteCouriers = couriers.filter((c) => favorites.includes(c.id));
  const cityCouriers = couriers.filter((c) => c.city === session.city);

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchCourier || !dispatchDesc.trim()) return;
    const prefix =
      dispatchModality === 'recurrente'
        ? `[Servicio recurrente · ${merchant?.businessName || session.displayName}] `
        : `[Servicio puntual · ${merchant?.businessName || session.displayName}] `;
    onContactCourier(dispatchCourier, prefix + dispatchDesc.trim());
    setDispatchCourier(null);
    setDispatchDesc('');
  };

  const handleSaveMerchantProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateMerchantProfile({
      businessName: bName,
      ownerName: oName,
      address,
      city,
      category,
      description: desc,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jTitle.trim() || !jDesc.trim()) return;
    await onCreateJob({
      title: jTitle,
      description: jDesc,
      serviceCategory: jCat,
      modality: jMod,
      paySummary: jPay || 'A convenir',
    });
    setJTitle('');
    setJDesc('');
    setJPay('');
    setShowJobForm(false);
  };

  return (
    <div className="pb-24">
      <div className="border-b border-slate-100 bg-white px-4 pb-3 pt-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-lg font-extrabold text-[#1A2E4A]">
              {isMerchant ? merchant?.businessName : 'Espacio Comercios'}
            </h1>
            <p className="text-xs text-slate-500">
              {isMerchant
                ? `${merchant?.category} · ${merchant?.city}`
                : 'Envíos puntuales, recurrentes y oportunidades laborales'}
            </p>
          </div>
          {!isMerchant && (
            <button
              type="button"
              onClick={onOpenMerchantAuth}
              className="h-10 shrink-0 rounded-xl bg-[#1A2E4A] px-3.5 text-xs font-bold text-white"
            >
              Soy comercio
            </button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setSubTab('dispatch')}
            className={`h-10 rounded-lg text-xs font-bold transition ${
              subTab === 'dispatch' ? 'bg-white text-[#1A2E4A] shadow-xs' : 'text-slate-600'
            }`}
          >
            Repartidores
          </button>
          <button
            type="button"
            onClick={() => setSubTab('jobs')}
            className={`h-10 rounded-lg text-xs font-bold transition ${
              subTab === 'jobs' ? 'bg-white text-[#1A2E4A] shadow-xs' : 'text-slate-600'
            }`}
          >
            Oportunidades
          </button>
          <button
            type="button"
            onClick={() => setSubTab('profile')}
            className={`h-10 rounded-lg text-xs font-bold transition ${
              subTab === 'profile' ? 'bg-white text-[#1A2E4A] shadow-xs' : 'text-slate-600'
            }`}
          >
            {isMerchant ? 'Mi comercio' : 'Registrarme'}
          </button>
        </div>
      </div>

      <div className="p-4">
        {subTab === 'dispatch' && (
          <div className="space-y-5">
            {knownCouriers.length > 0 && (
              <section>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-[#FF6B00]" />
                  <h2 className="font-display text-sm font-bold text-[#1A2E4A]">
                    Volver a contratar repartidores conocidos
                  </h2>
                </div>
                <div className="mt-2.5 flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                  {knownCouriers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setDispatchCourier(c)}
                      className="min-w-[170px] shrink-0 rounded-2xl border border-slate-200 bg-white p-3 text-left"
                    >
                      <p className="truncate font-display text-xs font-bold text-[#1A2E4A]">
                        {c.publicName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {CATEGORY_INFO[c.serviceCategory].label}
                      </p>
                      <p
                        className={`mt-1.5 text-[11px] font-bold ${
                          c.isAvailable ? 'text-[#16A34A]' : 'text-[#DC2626]'
                        }`}
                      >
                        {c.isAvailable ? 'Disponible · Solicitar' : 'Ocupado'}
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {favoriteCouriers.length > 0 && (
              <section>
                <h2 className="font-display text-sm font-bold text-[#1A2E4A]">
                  Favoritos del comercio ({favoriteCouriers.length})
                </h2>
                <div className="mt-2.5 space-y-3">
                  {favoriteCouriers.map((c) => (
                    <CourierCard
                      key={c.id}
                      courier={c}
                      isFavorite={true}
                      onToggleFavorite={onToggleFavorite}
                      onViewProfile={onViewCourierProfile}
                      onContact={(target) => setDispatchCourier(target)}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="font-display text-sm font-bold text-[#1A2E4A]">
                Repartidores en {session.city} ({cityCouriers.length})
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Consultá tarifas y solicitá envíos puntuales o recorridos recurrentes.
              </p>
              <div className="mt-3 space-y-3">
                {cityCouriers.map((c) => (
                  <CourierCard
                    key={c.id}
                    courier={c}
                    isFavorite={favorites.includes(c.id)}
                    onToggleFavorite={onToggleFavorite}
                    onViewProfile={onViewCourierProfile}
                    onContact={(target) => setDispatchCourier(target)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {subTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-[#1A2E4A]">
                  Oportunidades laborales
                </p>
                <p className="text-xs text-slate-500">
                  Búsquedas de repartidores publicadas por comercios.
                </p>
              </div>
              {isMerchant ? (
                <button
                  type="button"
                  onClick={() => setShowJobForm((p) => !p)}
                  className="flex h-10 shrink-0 items-center gap-1 rounded-xl bg-[#FF6B00] px-3 text-xs font-bold text-white"
                >
                  <Plus className="h-4 w-4" />
                  <span>Publicar</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenMerchantAuth}
                  className="h-10 shrink-0 rounded-xl bg-[#1A2E4A] px-3 text-xs font-bold text-white"
                >
                  Publicar como comercio
                </button>
              )}
            </div>

            {showJobForm && isMerchant && (
              <form
                onSubmit={handleCreateJob}
                className="space-y-3 rounded-2xl border border-[#FF6B00]/30 bg-white p-4"
              >
                <h3 className="font-display text-sm font-bold text-[#1A2E4A]">
                  Nueva búsqueda de repartidor
                </h3>
                <input
                  type="text"
                  required
                  value={jTitle}
                  onChange={(e) => setJTitle(e.target.value)}
                  placeholder="Ej: Motomandado turno noche"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00]"
                />
                <textarea
                  rows={2}
                  required
                  value={jDesc}
                  onChange={(e) => setJDesc(e.target.value)}
                  placeholder="Días, horarios, zona de reparto y requisitos..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#FF6B00]"
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <select
                    value={jCat}
                    onChange={(e) => setJCat(e.target.value as ServiceCategory)}
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-sm outline-none"
                  >
                    {Object.values(CATEGORY_INFO).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={jMod}
                    onChange={(e) => setJMod(e.target.value as 'puntual' | 'recurrente' | 'turno')}
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-sm outline-none"
                  >
                    <option value="turno">Turno fijo</option>
                    <option value="recurrente">Recurrente</option>
                    <option value="puntual">Puntual</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={jPay}
                  onChange={(e) => setJPay(e.target.value)}
                  placeholder="Remuneración estimada (ej: $15.000 ARS/noche)"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00]"
                />
                <button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-[#FF6B00] text-xs font-bold text-white"
                >
                  Publicar oportunidad
                </button>
              </form>
            )}

            <div className="space-y-3">
              {jobOpportunities.map((job) => {
                const isMine = job.merchantId === session.uid;
                return (
                  <article
                    key={job.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-sm font-bold text-[#1A2E4A]">
                            {job.title}
                          </h3>
                          {job.isDemo && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                              Demo
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-slate-600">
                          {job.merchantName} · {job.merchantCategory}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          job.status === 'open'
                            ? 'bg-[#22C55E]/15 text-[#15803D]'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {job.status === 'open' ? 'Activa' : 'Cerrada'}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{job.description}</p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs">
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-[#FF6B00]" />
                        {job.city} · {CATEGORY_INFO[job.serviceCategory].label}
                      </span>
                      <span className="font-mono font-semibold text-[#1A2E4A]">
                        {job.paySummary}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="tabular-nums">Publicada {formatDateAR(job.createdAt)}</span>
                      {isMine && (
                        <button
                          type="button"
                          onClick={() => onToggleJobStatus(job.id)}
                          className="font-semibold text-[#FF6B00] hover:underline"
                        >
                          {job.status === 'open' ? 'Pausar búsqueda' : 'Reabrir búsqueda'}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {subTab === 'profile' && (
          <div>
            {!isMerchant ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A2E4A] text-white">
                  <Store className="h-6 w-6" />
                </div>
                <h2 className="mt-3 font-display text-base font-bold text-[#1A2E4A]">
                  Cuenta exclusiva para comercios
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Registrá tu local para administrar tu perfil comercial, guardar repartidores
                  favoritos, solicitar servicios puntuales o recurrentes y publicar búsquedas.
                </p>
                <button
                  type="button"
                  onClick={onOpenMerchantAuth}
                  className="mt-4 h-11 rounded-xl bg-[#FF6B00] px-5 text-xs font-bold text-white"
                >
                  Crear cuenta de comercio / Ingresar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveMerchantProfile} className="space-y-3.5">
                {profileSaved && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                    Perfil de comercio actualizado.
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Nombre del comercio
                  </label>
                  <input
                    type="text"
                    required
                    value={bName}
                    onChange={(e) => setBName(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Responsable</label>
                  <input
                    type="text"
                    required
                    value={oName}
                    onChange={(e) => setOName(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#FF6B00]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Ciudad</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value as CityName)}
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-sm outline-none"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Rubro</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-sm outline-none"
                    >
                      {MERCHANT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Dirección</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Notas de logística del comercio
                  </label>
                  <textarea
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Horarios de despacho, tipo de paquetes..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#FF6B00]"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-[#1A2E4A] text-sm font-bold text-white"
                >
                  Guardar cambios del comercio
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Modal to request Puntual or Recurrente service */}
      {dispatchCourier && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <form
            onSubmit={handleDispatchSubmit}
            className="w-full max-w-[398px] space-y-3.5 rounded-3xl bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-[#1A2E4A]">
                  Solicitar servicio a {dispatchCourier.publicName}
                </h3>
                <p className="text-xs text-slate-500">
                  Elegí si es un envío puntual o un recorrido recurrente.
                </p>
              </div>
              <Briefcase className="h-5 w-5 text-[#FF6B00]" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDispatchModality('puntual')}
                className={`h-10 rounded-xl border text-xs font-bold ${
                  dispatchModality === 'puntual'
                    ? 'border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00]'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Servicio puntual
              </button>
              <button
                type="button"
                onClick={() => setDispatchModality('recurrente')}
                className={`h-10 rounded-xl border text-xs font-bold ${
                  dispatchModality === 'recurrente'
                    ? 'border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00]'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Recurrente
              </button>
            </div>

            <textarea
              rows={3}
              required
              value={dispatchDesc}
              onChange={(e) => setDispatchDesc(e.target.value)}
              placeholder="Ej: Retirar pedido en el local a las 13:00 y entregar en Barrio San Martín."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDispatchCourier(null)}
                className="h-11 flex-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#FF6B00] text-xs font-bold text-white"
              >
                <Send className="h-4 w-4" />
                <span>Enviar al chat</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
