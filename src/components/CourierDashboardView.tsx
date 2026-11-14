import React, { useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Camera,
  CheckCircle2,
  Clock,
  FileCheck2,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import type {
  CityName,
  Contract,
  CourierPublicProfile,
  ServiceCategory,
  TariffItem,
  TariffMode,
} from '../types/synk';
import {
  CATEGORY_INFO,
  CITIES,
  TARIFF_MODE_LABELS,
  formatARS,
  getInitials,
  resizeImageToDataUrl,
} from '../utils/formatters';

interface CourierDashboardViewProps {
  courier: CourierPublicProfile;
  contracts: Contract[];
  onBack: () => void;
  onUpdateProfile: (
    patch: Partial<
      Pick<
        CourierPublicProfile,
        | 'publicName'
        | 'photoUrl'
        | 'vehicle'
        | 'city'
        | 'workZone'
        | 'coverageZones'
        | 'schedule'
        | 'description'
        | 'extraServices'
        | 'serviceCategory'
      >
    >
  ) => Promise<void>;
  onToggleAvailability: (nextAvailable: boolean) => Promise<void>;
  onSaveTariff: (tariff: Omit<TariffItem, 'id' | 'courierId'> & { id?: string }) => Promise<void>;
  onDeleteTariff: (tariffId: string) => Promise<void>;
  onAcceptContract: (contractId: string) => Promise<void>;
  onCompleteContract: (contractId: string) => Promise<void>;
  onCancelContract: (contractId: string) => Promise<void>;
  onOpenChat: (conversationId: string) => void;
  onOpenJobs: () => void;
}

export const CourierDashboardView: React.FC<CourierDashboardViewProps> = ({
  courier,
  contracts,
  onBack,
  onUpdateProfile,
  onToggleAvailability,
  onSaveTariff,
  onDeleteTariff,
  onAcceptContract,
  onCompleteContract,
  onCancelContract,
  onOpenChat,
  onOpenJobs,
}) => {
  const [tab, setTab] = useState<'contracts' | 'profile' | 'tariffs'>('contracts');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Profile form state
  const [publicName, setPublicName] = useState(courier.publicName);
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>(courier.serviceCategory);
  const [vehicle, setVehicle] = useState(courier.vehicle);
  const [city, setCity] = useState<CityName>(courier.city);
  const [workZone, setWorkZone] = useState(courier.workZone);
  const [coverageText, setCoverageText] = useState(courier.coverageZones.join(', '));
  const [schedule, setSchedule] = useState(courier.schedule);
  const [description, setDescription] = useState(courier.description);
  const [extraText, setExtraText] = useState(courier.extraServices.join(', '));
  const [savingProfile, setSavingProfile] = useState(false);

  // New tariff state
  const [tTitle, setTTitle] = useState('');
  const [tMode, setTMode] = useState<TariffMode>('fixed');
  const [tPrice, setTPrice] = useState('');
  const [tZone, setTZone] = useState('');
  const [tUnit, setTUnit] = useState('');
  const [tNotes, setTNotes] = useState('');

  const myContracts = contracts.filter((c) => c.courierId === courier.id);
  const activeContracts = myContracts.filter(
    (c) => c.status === 'proposed' || c.status === 'accepted'
  );

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 360);
      await onUpdateProfile({ photoUrl: dataUrl });
      setFeedback('Fotografía actualizada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la foto.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setError(null);
    setFeedback(null);
    try {
      await onUpdateProfile({
        publicName: publicName.trim(),
        serviceCategory,
        vehicle: vehicle.trim(),
        city,
        workZone: workZone.trim(),
        coverageZones: coverageText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        schedule: schedule.trim(),
        description: description.trim(),
        extraServices: extraText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setFeedback('Perfil guardado correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tTitle.trim()) return;
    setError(null);
    try {
      await onSaveTariff({
        title: tTitle,
        mode: tMode,
        priceArs: tMode === 'negotiable' ? null : Number(tPrice) || null,
        zoneName: tMode === 'zone' ? tZone : undefined,
        unitLabel: tMode === 'distance' ? tUnit : undefined,
        notes: tNotes || undefined,
      });
      setTTitle('');
      setTPrice('');
      setTZone('');
      setTUnit('');
      setTNotes('');
      setFeedback('Tarifa agregada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar tarifa.');
    }
  };

  const handleAvailabilitySwitch = async () => {
    setError(null);
    setFeedback(null);
    try {
      await onToggleAvailability(!courier.isAvailable);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la disponibilidad.');
    }
  };

  return (
    <div className="pb-24">
      <div className="sticky top-14 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-2.5 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 items-center gap-1.5 pr-2 text-sm font-semibold text-[#1A2E4A]"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Inicio</span>
        </button>
        <h1 className="font-display text-sm font-bold text-[#1A2E4A]">Panel de repartidor</h1>
        <button
          type="button"
          onClick={onOpenJobs}
          className="flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-[#1A2E4A]"
        >
          <Briefcase className="h-3.5 w-3.5 text-[#FF6B00]" />
          <span>Búsquedas</span>
        </button>
      </div>

      <div className="p-4">
        {/* Availability Control Card */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-[#1A2E4A] text-white">
              {courier.photoUrl ? (
                <img
                  src={courier.photoUrl}
                  alt={courier.publicName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-display text-sm font-bold">
                  {getInitials(courier.publicName)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-[#1A2E4A]">
                {courier.publicName}
              </p>
              <p
                className={`mt-0.5 inline-flex items-center gap-1 text-xs font-bold ${
                  courier.isAvailable ? 'text-[#16A34A]' : 'text-[#DC2626]'
                }`}
              >
                {courier.isAvailable ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-[#EF4444]" />
                )}
                <span>{courier.isAvailable ? 'Disponible' : 'Ocupado'}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAvailabilitySwitch}
            className={`h-10 shrink-0 rounded-xl px-3.5 text-xs font-bold text-white transition active:scale-95 ${
              courier.isAvailable ? 'bg-[#EF4444]' : 'bg-[#22C55E]'
            }`}
          >
            {courier.isAvailable ? 'Pasar a Ocupado' : 'Pasar a Disponible'}
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}
        {feedback && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
            {feedback}
          </div>
        )}

        {/* Section Tabs */}
        <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab('contracts')}
            className={`h-10 rounded-lg text-xs font-bold transition ${
              tab === 'contracts' ? 'bg-white text-[#1A2E4A] shadow-xs' : 'text-slate-600'
            }`}
          >
            Mandados ({activeContracts.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('tariffs')}
            className={`h-10 rounded-lg text-xs font-bold transition ${
              tab === 'tariffs' ? 'bg-white text-[#1A2E4A] shadow-xs' : 'text-slate-600'
            }`}
          >
            Tarifas ({courier.tariffs.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={`h-10 rounded-lg text-xs font-bold transition ${
              tab === 'profile' ? 'bg-white text-[#1A2E4A] shadow-xs' : 'text-slate-600'
            }`}
          >
            Mi perfil
          </button>
        </div>

        {tab === 'contracts' && (
          <div className="mt-4 space-y-3">
            {myContracts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                Cuando un cliente o comercio te envíe una propuesta de mandado por chat, aparecerá
                acá para que puedas aceptarla o completarla.
              </div>
            ) : (
              myContracts.map((ct) => (
                <div
                  key={ct.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-sm font-bold text-[#1A2E4A]">
                        {ct.clientName}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600">{ct.description}</p>
                      <p className="mt-1 font-mono text-xs font-semibold text-[#1A2E4A] tabular-nums">
                        {formatARS(ct.agreedPriceArs)} ·{' '}
                        {ct.modality === 'recurrente' ? 'Recurrente' : 'Puntual'}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                      {ct.status === 'proposed' && 'Propuesto'}
                      {ct.status === 'accepted' && 'En curso'}
                      {ct.status === 'completed' && 'Completado'}
                      {ct.status === 'cancelled' && 'Cancelado'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {ct.status === 'proposed' && (
                      <button
                        type="button"
                        onClick={async () => {
                          setError(null);
                          try {
                            await onAcceptContract(ct.id);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Error');
                          }
                        }}
                        className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#22C55E] px-3 text-xs font-bold text-white"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Aceptar mandado</span>
                      </button>
                    )}

                    {ct.status === 'accepted' && (
                      <button
                        type="button"
                        onClick={async () => {
                          setError(null);
                          try {
                            await onCompleteContract(ct.id);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Error');
                          }
                        }}
                        className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1A2E4A] px-3 text-xs font-bold text-white"
                      >
                        <FileCheck2 className="h-4 w-4" />
                        <span>Mandado completado</span>
                      </button>
                    )}

                    {(ct.status === 'proposed' || ct.status === 'accepted') && (
                      <button
                        type="button"
                        onClick={() => onCancelContract(ct.id)}
                        className="flex h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Cancelar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenChat(ct.conversationId)}
                      className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-[#1A2E4A]"
                    >
                      Ir al chat
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'tariffs' && (
          <div className="mt-4 space-y-4">
            <form
              onSubmit={handleAddTariff}
              className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <h2 className="font-display text-sm font-bold text-[#1A2E4A]">
                Agregar nueva tarifa
              </h2>
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Nombre de la tarifa
                </label>
                <input
                  type="text"
                  required
                  value={tTitle}
                  onChange={(e) => setTTitle(e.target.value)}
                  placeholder="Ej: Envío estándar Centro"
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Modalidad</label>
                  <select
                    value={tMode}
                    onChange={(e) => setTMode(e.target.value as TariffMode)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-sm outline-none focus:border-[#FF6B00]"
                  >
                    {Object.entries(TARIFF_MODE_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {tMode !== 'negotiable' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Precio (ARS)
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      step={50}
                      value={tPrice}
                      onChange={(e) => setTPrice(e.target.value)}
                      placeholder="2500"
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white tabular-nums"
                    />
                  </div>
                )}
              </div>

              {tMode === 'zone' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Zona / barrio específico
                  </label>
                  <input
                    type="text"
                    value={tZone}
                    onChange={(e) => setTZone(e.target.value)}
                    placeholder="Ej: Corradi / Malvinas"
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00]"
                  />
                </div>
              )}

              {tMode === 'distance' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Unidad</label>
                  <input
                    type="text"
                    value={tUnit}
                    onChange={(e) => setTUnit(e.target.value)}
                    placeholder="Ej: por km recorrido"
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Aclaración (opcional)
                </label>
                <input
                  type="text"
                  value={tNotes}
                  onChange={(e) => setTNotes(e.target.value)}
                  placeholder="Ej: Hasta 5 kg, entrega en el día"
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00]"
                />
              </div>

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-[#FF6B00] text-xs font-bold text-white"
              >
                <Plus className="h-4 w-4" />
                <span>Guardar tarifa</span>
              </button>
            </form>

            <div className="space-y-2.5">
              {courier.tariffs.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.title}</p>
                    <p className="text-xs text-slate-500">
                      {TARIFF_MODE_LABELS[t.mode]}
                      {t.zoneName ? ` · ${t.zoneName}` : ''}
                      {t.unitLabel ? ` · ${t.unitLabel}` : ''}
                    </p>
                    {t.notes && <p className="mt-0.5 text-xs text-slate-500">{t.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1A2E4A] tabular-nums">
                      {formatARS(t.priceArs)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteTariff(t.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Eliminar tarifa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="mt-4 space-y-3.5">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5">
              <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-slate-100 px-3.5 text-xs font-bold text-[#1A2E4A] hover:bg-slate-200">
                <Camera className="h-4 w-4 text-[#FF6B00]" />
                <span>Subir fotografía de perfil</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Nombre público</label>
              <input
                type="text"
                required
                value={publicName}
                onChange={(e) => setPublicName(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Categoría</label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-sm outline-none focus:border-[#FF6B00]"
                >
                  {Object.values(CATEGORY_INFO).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Ciudad</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value as CityName)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-sm outline-none focus:border-[#FF6B00]"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Vehículo</label>
              <input
                type="text"
                required
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Zona principal de trabajo
              </label>
              <input
                type="text"
                required
                value={workZone}
                onChange={(e) => setWorkZone(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Zonas de cobertura (separadas por coma)
              </label>
              <input
                type="text"
                value={coverageText}
                onChange={(e) => setCoverageText(e.target.value)}
                placeholder="Centro, Pueblo de Luis, Corradi"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Horarios</label>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="Lun a Sáb 08:30 a 21:00"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Servicios adicionales (separados por coma)
              </label>
              <input
                type="text"
                value={extraText}
                onChange={(e) => setExtraText(e.target.value)}
                placeholder="Cobro en destino, Espera en trámites"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Descripción</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#FF6B00]"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="h-12 w-full rounded-xl bg-[#FF6B00] text-sm font-bold text-white disabled:opacity-60"
            >
              {savingProfile ? 'Guardando cambios...' : 'Guardar perfil'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
