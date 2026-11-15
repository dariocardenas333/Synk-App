import React, { useState } from 'react';
import {
  Camera,
  Check,
  CheckCircle2,
  Pencil,
  Phone,
  Plus,
  Tags,
  Trash2,
  X,
} from 'lucide-react';
import type {
  CityName,
  CourierPublicProfile,
  ServiceCategory,
  TariffItem,
  TariffMode,
} from '../types/synk';
import {
  CATEGORY_GROUPS,
  CITIES,
  TARIFF_MODE_LABELS,
  formatARS,
  getCategoryInfo,
  getCourierCategories,
  getInitials,
  resizeImageToDataUrl,
} from '../utils/formatters';

interface CourierServicesViewProps {
  courier: CourierPublicProfile;
  onUpdateProfile: (
    patch: Partial<
      Pick<
        CourierPublicProfile,
        | 'publicName'
        | 'photoUrl'
        | 'contactPhone'
        | 'vehicle'
        | 'city'
        | 'workZone'
        | 'coverageZones'
        | 'schedule'
        | 'description'
        | 'extraServices'
        | 'serviceCategory'
        | 'serviceCategories'
      >
    >
  ) => Promise<void>;
  onSaveTariff: (tariff: Omit<TariffItem, 'id' | 'courierId'> & { id?: string }) => Promise<void>;
  onDeleteTariff: (tariffId: string) => Promise<void>;
}

export const CourierServicesView: React.FC<CourierServicesViewProps> = ({
  courier,
  onUpdateProfile,
  onSaveTariff,
  onDeleteTariff,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Public profile state
  const [publicName, setPublicName] = useState(courier.publicName);
  const [contactPhone, setContactPhone] = useState(courier.contactPhone || '');
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>(() =>
    getCourierCategories(courier)
  );
  const [vehicle, setVehicle] = useState(courier.vehicle);
  const [city, setCity] = useState<CityName>(courier.city);
  const [workZone, setWorkZone] = useState(courier.workZone);
  const [coverageText, setCoverageText] = useState(courier.coverageZones.join(', '));
  const [schedule, setSchedule] = useState(courier.schedule);
  const [description, setDescription] = useState(courier.description);
  const [extraText, setExtraText] = useState(courier.extraServices.join(', '));
  const [savingProfile, setSavingProfile] = useState(false);

  // Custom tariffs CRUD state
  const [editingTariffId, setEditingTariffId] = useState<string | null>(null);
  const [tTitle, setTTitle] = useState('');
  const [tMode, setTMode] = useState<TariffMode>('fixed');
  const [tPrice, setTPrice] = useState('');
  const [tZone, setTZone] = useState('');
  const [tUnit, setTUnit] = useState('');
  const [tNotes, setTNotes] = useState('');
  const [savingTariff, setSavingTariff] = useState(false);

  const toggleCategory = (catId: ServiceCategory) => {
    setSelectedCategories((prev) => {
      if (prev.includes(catId)) {
        return prev.length > 1 ? prev.filter((c) => c !== catId) : prev;
      }
      return [...prev, catId];
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setFeedback(null);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 360);
      await onUpdateProfile({ photoUrl: dataUrl });
      setFeedback('Foto de perfil actualizada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la foto.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      setError('Elegí al menos una categoría de servicio.');
      return;
    }
    setSavingProfile(true);
    setError(null);
    setFeedback(null);
    try {
      await onUpdateProfile({
        publicName: publicName.trim(),
        contactPhone: contactPhone.trim(),
        serviceCategory: selectedCategories[0],
        serviceCategories: selectedCategories,
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
      setFeedback('Tu perfil público y categorías se guardaron correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const resetTariffForm = () => {
    setEditingTariffId(null);
    setTTitle('');
    setTMode('fixed');
    setTPrice('');
    setTZone('');
    setTUnit('');
    setTNotes('');
  };

  const startEditTariff = (tariff: TariffItem) => {
    setEditingTariffId(tariff.id);
    setTTitle(tariff.title);
    setTMode(tariff.mode);
    setTPrice(tariff.priceArs ? String(tariff.priceArs) : '');
    setTZone(tariff.zoneName || '');
    setTUnit(tariff.unitLabel || '');
    setTNotes(tariff.notes || '');
    setFeedback(null);
    setError(null);
  };

  const handleSaveTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tTitle.trim()) return;
    setSavingTariff(true);
    setError(null);
    setFeedback(null);
    try {
      await onSaveTariff({
        ...(editingTariffId ? { id: editingTariffId } : {}),
        title: tTitle.trim(),
        mode: tMode,
        priceArs: tMode === 'negotiable' ? null : Number(tPrice) || null,
        zoneName: tMode === 'zone' ? tZone.trim() : undefined,
        unitLabel: tMode === 'distance' ? tUnit.trim() : undefined,
        notes: tNotes.trim() || undefined,
      });
      setFeedback(editingTariffId ? 'Tarifa actualizada.' : 'Tarifa agregada a tu perfil.');
      resetTariffForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar tarifa.');
    } finally {
      setSavingTariff(false);
    }
  };

  return (
    <div className="bg-[#F8FAFA] pb-24">
      <div className="border-b border-[#E2E8F0] bg-white px-4 pb-3 pt-4">
        <h1 className="font-display text-lg font-extrabold text-[#063642]">
          Mis Servicios y Tarifas
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Configurá tus rubros, precios de referencia e información visible para los clientes.
        </p>
      </div>

      <div className="space-y-6 p-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}
        {feedback && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
            {feedback}
          </div>
        )}

        {/* Section 1: Public Profile & Multi-Category Selector */}
        <form
          onSubmit={handleSaveProfile}
          className="space-y-4 rounded-3xl border border-[#E2E8F0] bg-white p-4 shadow-xs"
        >
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#063642] text-white">
              {courier.photoUrl ? (
                <img
                  src={courier.photoUrl}
                  alt={courier.publicName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-display text-lg font-bold">
                  {getInitials(courier.publicName)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#063642]">Foto o avatar público</p>
              <label className="mt-1.5 inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3.5 text-xs font-bold text-[#063642] transition hover:border-[#008B8B]">
                <Camera className="h-4 w-4 text-[#008B8B]" />
                <span>Cambiar foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#063642]">
              Nombre o Apodo comercial
            </label>
            <input
              type="text"
              required
              value={publicName}
              onChange={(e) => setPublicName(e.target.value)}
              placeholder="Ej: Juan Moto Trelew"
              className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-[#063642]">
                Teléfono / WhatsApp
              </label>
              <div className="relative mt-1">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="280 4..."
                  className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] pl-9 pr-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#063642]">Ciudad</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as CityName)}
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-2.5 text-sm text-[#063642] outline-none focus:border-[#008B8B]"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Multi-category selector (14 Rubros grouped) */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#063642]">
                Rubros en los que trabajás ({selectedCategories.length}/14)
              </label>
              <span className="text-[11px] font-medium text-[#008B8B]">Selección múltiple</span>
            </div>
            <div className="mt-2.5 space-y-3">
              {CATEGORY_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {group.title}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((catId) => {
                      const active = selectedCategories.includes(catId);
                      return (
                        <button
                          key={catId}
                          type="button"
                          onClick={() => toggleCategory(catId)}
                          aria-pressed={active}
                          className={`flex min-h-11 items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs font-bold transition ${
                            active
                              ? 'border-[#008B8B] bg-[#008B8B]/10 text-[#063642]'
                              : 'border-[#E2E8F0] bg-[#F8FAFA] text-slate-600'
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              active
                                ? 'border-[#008B8B] bg-[#008B8B] text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {active && <Check className="h-3 w-3" />}
                          </span>
                          <span className="leading-tight">{getCategoryInfo(catId).label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#063642]">
              Vehículo o equipamiento
            </label>
            <input
              type="text"
              required
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="Ej: Moto 110cc / Kangoo / Herramental propio"
              className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#063642]">
              Horario habitual de trabajo
            </label>
            <input
              type="text"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="Ej: Lun a Sáb de 08:00 a 22:00"
              className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-[#063642]">
                Zona principal de trabajo
              </label>
              <input
                type="text"
                required
                value={workZone}
                onChange={(e) => setWorkZone(e.target.value)}
                placeholder="Ej: Centro y alrededores"
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#063642]">
                Barrios / zonas de cobertura (separados por coma)
              </label>
              <input
                type="text"
                value={coverageText}
                onChange={(e) => setCoverageText(e.target.value)}
                placeholder="Centro, Pueblo de Luis, Corradi, Villa Italia"
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#063642]">
              Servicios adicionales (separados por coma)
            </label>
            <input
              type="text"
              value={extraText}
              onChange={(e) => setExtraText(e.target.value)}
              placeholder="Cobro en destino, Guardia nocturna, Presupuesto sin cargo"
              className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#063642]">
              Breve descripción de tu experiencia
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contá tu experiencia, puntualidad y qué trabajos realizás..."
              className="mt-1 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] p-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="h-12 w-full rounded-xl bg-[#063642] text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
          >
            {savingProfile ? 'Guardando cambios...' : 'Guardar perfil público'}
          </button>
        </form>

        {/* Section 2: Custom Tariffs Manager */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-[#063642]">
              <Tags className="h-4 w-4 text-[#008B8B]" />
              <span>Tarifas personalizadas ({courier.tariffs.length})</span>
            </h2>
          </div>

          <form
            onSubmit={handleSaveTariff}
            className="space-y-3 rounded-3xl border border-[#E2E8F0] bg-white p-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-bold text-[#063642]">
                {editingTariffId ? 'Editar tarifa' : 'Agregar precio de referencia'}
              </p>
              {editingTariffId && (
                <button
                  type="button"
                  onClick={resetTariffForm}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#063642]"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancelar</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#063642]">
                Descripción del servicio o tarifa
              </label>
              <input
                type="text"
                required
                value={tTitle}
                onChange={(e) => setTTitle(e.target.value)}
                placeholder="Ej: Envío dentro del radio céntrico / Visita técnica"
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#063642]">Modalidad</label>
                <select
                  value={tMode}
                  onChange={(e) => setTMode(e.target.value as TariffMode)}
                  className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-2.5 text-sm text-[#063642] outline-none focus:border-[#008B8B]"
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
                  <label className="block text-xs font-semibold text-[#063642]">
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
                    className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white tabular-nums"
                  />
                </div>
              )}
            </div>

            {tMode === 'zone' && (
              <div>
                <label className="block text-xs font-semibold text-[#063642]">
                  Zona / barrio específico
                </label>
                <input
                  type="text"
                  value={tZone}
                  onChange={(e) => setTZone(e.target.value)}
                  placeholder="Ej: Radio céntrico / Corradi"
                  className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B]"
                />
              </div>
            )}

            {tMode === 'distance' && (
              <div>
                <label className="block text-xs font-semibold text-[#063642]">Unidad</label>
                <input
                  type="text"
                  value={tUnit}
                  onChange={(e) => setTUnit(e.target.value)}
                  placeholder="Ej: por km recorrido / por hora"
                  className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#063642]">
                Aclaración (opcional)
              </label>
              <input
                type="text"
                value={tNotes}
                onChange={(e) => setTNotes(e.target.value)}
                placeholder="Ej: Incluye puente y diagnóstico / Flete por hora"
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B]"
              />
            </div>

            <button
              type="submit"
              disabled={savingTariff}
              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-[#008B8B] text-xs font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              <span>
                {savingTariff
                  ? 'Guardando...'
                  : editingTariffId
                  ? 'Actualizar tarifa'
                  : 'Agregar tarifa'}
              </span>
            </button>
          </form>

          {courier.tariffs.length === 0 ? (
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 text-center text-xs text-slate-500">
              Todavía no cargaste tarifas. Agregá precios claros (ej: «Envío céntrico — $2.500»)
              para que los clientes te elijan con confianza.
            </div>
          ) : (
            <div className="space-y-2.5">
              {courier.tariffs.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-3.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#063642]">{t.title}</p>
                    <p className="text-xs text-slate-500">
                      {TARIFF_MODE_LABELS[t.mode]}
                      {t.zoneName ? ` · ${t.zoneName}` : ''}
                      {t.unitLabel ? ` · ${t.unitLabel}` : ''}
                    </p>
                    {t.notes && <p className="mt-0.5 text-xs text-slate-500">{t.notes}</p>}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <span className="mr-1 font-mono text-xs font-bold text-[#063642] tabular-nums">
                      {formatARS(t.priceArs)}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEditTariff(t)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-[#F8FAFA] hover:text-[#063642]"
                      aria-label={`Editar tarifa ${t.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTariff(t.id)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Eliminar tarifa ${t.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
