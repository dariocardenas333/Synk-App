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
  AVAILABILITY_META,
  CITIES,
  MERCHANT_CATEGORIES,
  ORDERED_CATEGORIES,
  formatDateAR,
  getCategoryInfo,
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
    <div className="bg-[#F8FAFA] pb-24 dark:bg-[#07181E]">
      <div className="border-b border-[#E2E8F0] bg-white px-4 pb-3 pt-3 dark:border-[#1E4452] dark:bg-[#0D252E]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-lg font-extrabold text-[#063642] dark:text-white">
              {isMerchant ? merchant?.businessName : 'Espacio Comercios'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isMerchant
                ? `${merchant?.category} · ${merchant?.city}`
                : 'Envíos puntuales, recurrentes y oportunidades laborales'}
            </p>
          </div>
          {!isMerchant && (
            <button
              type="button"
              onClick={onOpenMerchantAuth}
              className="h-10 shrink-0 rounded-xl bg-[#063642] px-3.5 text-xs font-bold text-white dark:bg-[#008B8B] dark:hover:bg-[#007676]"
            >
              Soy comercio
            </button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] p-1 dark:border-[#1E4452] dark:bg-[#13323D]">
          <button
            type="button"
            onClick={() => setSubTab('dispatch')}
            className={`h-10 rounded-lg text-xs font-bold transition ${
              subTab === 'dispatch'
                ? 'bg-white text-[#063642] shadow-xs dark:bg-[#0D252E] dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Prestadores
          </button>
          <button
            type="button"
            onClick={() => setSubTab('jobs')}
            className={`h-10 rounded-lg text-xs font-bold transition ${
              subTab === 'jobs'
                ? 'bg-white text-[#063642] shadow-xs dark:bg-[#0D252E] dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Oportunidades
          </button>
          <button
            type="button"
            onClick={() => setSubTab('profile')}
            className={`h-10 rounded-lg text-xs font-bold transition ${
              subTab === 'profile'
                ? 'bg-white text-[#063642] shadow-xs dark:bg-[#0D252E] dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
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
                  <RefreshCw className="h-4 w-4 text-[#008B8B] dark:text-[#2DD4BF]" />
                  <h2 className="font-display text-sm font-bold text-[#063642] dark:text-white">
                    Volver a contratar prestadores conocidos
                  </h2>
                </div>
                <div className="mt-2.5 flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                  {knownCouriers.map((c) => {
                    const meta = AVAILABILITY_META[c.availabilityStatus];
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setDispatchCourier(c)}
                        className="min-w-[170px] shrink-0 rounded-2xl border border-[#E2E8F0] bg-white p-3 text-left dark:border-[#1E4452] dark:bg-[#0D252E]"
                      >
                        <p className="truncate font-display text-xs font-bold text-[#063642] dark:text-white">
                          {c.publicName}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {getCategoryInfo(c.serviceCategory).label}
                        </p>
                        <p className={`mt-1.5 text-[11px] font-bold ${meta.textClass}`}>
                          {c.availabilityStatus === 'available'
                            ? 'Disponible · Solicitar'
                            : meta.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {favoriteCouriers.length > 0 && (
              <section>
                <h2 className="font-display text-sm font-bold text-[#063642] dark:text-white">
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
              <h2 className="font-display text-sm font-bold text-[#063642] dark:text-white">
                Prestadores en {session.city} ({cityCouriers.length})
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Consultá tarifas y solicitá envíos puntuales o recorridos recurrentes.
              </p>
              {cityCouriers.length === 0 ? (
                <div className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white p-5 text-center text-xs text-slate-500 dark:border-[#1E4452] dark:bg-[#0D252E] dark:text-slate-400">
                  Todavía no hay prestadores registrados en {session.city}.
                </div>
              ) : (
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
              )}
            </section>
          </div>
        )}

        {subTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-3.5 dark:border-[#1E4452] dark:bg-[#0D252E]">
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-[#063642] dark:text-white">
                  Oportunidades laborales
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Búsquedas de prestadores publicadas por comercios.
                </p>
              </div>
              {isMerchant ? (
                <button
                  type="button"
                  onClick={() => setShowJobForm((p) => !p)}
                  className="flex h-10 shrink-0 items-center gap-1 rounded-xl bg-[#008B8B] px-3 text-xs font-bold text-white hover:bg-[#007676]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Publicar</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenMerchantAuth}
                  className="h-10 shrink-0 rounded-xl bg-[#063642] px-3 text-xs font-bold text-white dark:bg-[#008B8B] dark:hover:bg-[#007676]"
                >
                  Publicar como comercio
                </button>
              )}
            </div>

            {showJobForm && isMerchant && (
              <form
                onSubmit={handleCreateJob}
                className="space-y-3 rounded-2xl border border-[#008B8B]/30 bg-white p-4 dark:border-[#2DD4BF]/40 dark:bg-[#0D252E]"
              >
                <h3 className="font-display text-sm font-bold text-[#063642] dark:text-white">
                  Nueva búsqueda de prestador
                </h3>
                <input
                  type="text"
                  required
                  value={jTitle}
                  onChange={(e) => setJTitle(e.target.value)}
                  placeholder="Ej: Motomandado turno noche"
                  className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
                />
                <textarea
                  rows={2}
                  required
                  value={jDesc}
                  onChange={(e) => setJDesc(e.target.value)}
                  placeholder="Días, horarios, zona de cobertura y requisitos..."
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] p-3 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <select
                    value={jCat}
                    onChange={(e) => setJCat(e.target.value as ServiceCategory)}
                    className="h-11 rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-2.5 text-sm text-[#063642] outline-none focus:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF]"
                  >
                    {ORDERED_CATEGORIES.map((catId) => (
                      <option key={catId} value={catId}>
                        {getCategoryInfo(catId).label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={jMod}
                    onChange={(e) => setJMod(e.target.value as 'puntual' | 'recurrente' | 'turno')}
                    className="h-11 rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-2.5 text-sm text-[#063642] outline-none focus:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF]"
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
                  className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
                />
                <button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-[#008B8B] text-xs font-bold text-white hover:bg-[#007676]"
                >
                  Publicar oportunidad
                </button>
              </form>
            )}

            <div className="space-y-3">
              {jobOpportunities.length === 0 && (
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center text-xs text-slate-500 dark:border-[#1E4452] dark:bg-[#0D252E] dark:text-slate-400">
                  Todavía no hay búsquedas laborales publicadas por comercios.
                </div>
              )}
              {jobOpportunities.map((job) => {
                const isMine = job.merchantId === session.uid;
                return (
                  <article
                    key={job.id}
                    className="rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-[#1E4452] dark:bg-[#0D252E]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-sm font-bold text-[#063642] dark:text-white">
                          {job.title}
                        </h3>
                        <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                          {job.merchantName} · {job.merchantCategory}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          job.status === 'open'
                            ? 'bg-[#22C55E]/15 text-[#15803D] dark:bg-[#22C55E]/20 dark:text-[#4ADE80]'
                            : 'bg-slate-100 text-slate-500 dark:bg-[#13323D] dark:text-slate-400'
                        }`}
                      >
                        {job.status === 'open' ? 'Activa' : 'Cerrada'}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {job.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs dark:border-[#1E4452]">
                      <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-[#008B8B] dark:text-[#2DD4BF]" />
                        {job.city} · {getCategoryInfo(job.serviceCategory).label}
                      </span>
                      <span className="font-mono font-semibold text-[#063642] dark:text-slate-100">
                        {job.paySummary}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                      <span className="tabular-nums">Publicada {formatDateAR(job.createdAt)}</span>
                      {isMine && (
                        <button
                          type="button"
                          onClick={() => onToggleJobStatus(job.id)}
                          className="font-semibold text-[#008B8B] hover:underline dark:text-[#2DD4BF]"
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
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center dark:border-[#1E4452] dark:bg-[#0D252E]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#063642] text-white dark:bg-[#13323D] dark:text-[#2DD4BF]">
                  <Store className="h-6 w-6" />
                </div>
                <h2 className="mt-3 font-display text-base font-bold text-[#063642] dark:text-white">
                  Cuenta exclusiva para comercios
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  Registrá tu local para administrar tu perfil comercial, guardar prestadores
                  favoritos, solicitar servicios puntuales o recurrentes y publicar búsquedas.
                </p>
                <button
                  type="button"
                  onClick={onOpenMerchantAuth}
                  className="mt-4 h-11 rounded-xl bg-[#008B8B] px-5 text-xs font-bold text-white hover:bg-[#007676]"
                >
                  Crear cuenta de comercio / Ingresar
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSaveMerchantProfile}
                className="space-y-3.5 rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-[#1E4452] dark:bg-[#0D252E]"
              >
                {profileSaved && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
                    Perfil de comercio actualizado.
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                    Nombre del comercio
                  </label>
                  <input
                    type="text"
                    required
                    value={bName}
                    onChange={(e) => setBName(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                    Responsable
                  </label>
                  <input
                    type="text"
                    required
                    value={oName}
                    onChange={(e) => setOName(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                      Ciudad
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value as CityName)}
                      className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-2.5 text-sm text-[#063642] outline-none focus:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF]"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                      Rubro
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-2.5 text-sm text-[#063642] outline-none focus:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF]"
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
                  <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                    Dirección
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                    Notas de logística del comercio
                  </label>
                  <textarea
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Horarios de despacho, tipo de paquetes..."
                    className="mt-1 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] p-3 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-[#063642] text-sm font-bold text-white dark:bg-[#008B8B] dark:hover:bg-[#007676]"
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-xs sm:items-center dark:bg-black/70">
          <form
            onSubmit={handleDispatchSubmit}
            className="w-full max-w-[398px] space-y-3.5 rounded-3xl bg-white p-5 shadow-2xl dark:border dark:border-[#1E4452] dark:bg-[#0D252E]"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-[#063642] dark:text-white">
                  Solicitar servicio a {dispatchCourier.publicName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Elegí si es un envío puntual o un recorrido recurrente.
                </p>
              </div>
              <Briefcase className="h-5 w-5 text-[#008B8B] dark:text-[#2DD4BF]" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDispatchModality('puntual')}
                className={`h-10 rounded-xl border text-xs font-bold ${
                  dispatchModality === 'puntual'
                    ? 'border-[#008B8B] bg-[#008B8B]/10 text-[#008B8B] dark:border-[#2DD4BF] dark:bg-[#008B8B]/20 dark:text-[#2DD4BF]'
                    : 'border-[#E2E8F0] text-slate-600 dark:border-[#1E4452] dark:text-slate-300'
                }`}
              >
                Servicio puntual
              </button>
              <button
                type="button"
                onClick={() => setDispatchModality('recurrente')}
                className={`h-10 rounded-xl border text-xs font-bold ${
                  dispatchModality === 'recurrente'
                    ? 'border-[#008B8B] bg-[#008B8B]/10 text-[#008B8B] dark:border-[#2DD4BF] dark:bg-[#008B8B]/20 dark:text-[#2DD4BF]'
                    : 'border-[#E2E8F0] text-slate-600 dark:border-[#1E4452] dark:text-slate-300'
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
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] p-3 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDispatchCourier(null)}
                className="h-11 flex-1 rounded-xl border border-[#E2E8F0] text-xs font-bold text-slate-600 dark:border-[#1E4452] dark:bg-[#13323D] dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#008B8B] text-xs font-bold text-white hover:bg-[#007676]"
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
