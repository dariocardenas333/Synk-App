import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, RefreshCw, Store, Truck } from 'lucide-react';
import type { CityName, Contract, CurrentSession } from '../types/synk';
import { CITIES, formatARS, formatDateAR, generateRandomNickname } from '../utils/formatters';

interface GuestProfileViewProps {
  session: CurrentSession;
  contracts: Contract[];
  onBack: () => void;
  onSaveGuest: (nickname: string, city: CityName) => Promise<void>;
  onOpenAuth: (type: 'courier' | 'merchant') => void;
  onOpenChat: (conversationId: string) => void;
}

export const GuestProfileView: React.FC<GuestProfileViewProps> = ({
  session,
  contracts,
  onBack,
  onSaveGuest,
  onOpenAuth,
  onOpenChat,
}) => {
  const [nickname, setNickname] = useState(session.displayName);
  const [city, setCity] = useState<CityName>(session.city);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveGuest(nickname, city);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="pb-24">
      <div className="sticky top-14 z-20 flex items-center gap-2 border-b border-slate-100 bg-white/95 px-4 py-2.5 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 items-center gap-1.5 pr-2 text-sm font-semibold text-[#1A2E4A]"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver</span>
        </button>
        <h1 className="font-display text-base font-bold text-[#1A2E4A]">Mi perfil</h1>
      </div>

      <div className="space-y-5 p-4">
        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div>
            <h2 className="font-display text-sm font-bold text-[#1A2E4A]">
              Identidad de cliente
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              No necesitás correo ni contraseña para buscar y contratar repartidores.
            </p>
          </div>

          {saved && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Cambios guardados en tu sesión.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">Nickname</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                required
                maxLength={24}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none focus:border-[#FF6B00] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setNickname(generateRandomNickname())}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
                aria-label="Generar nickname aleatorio"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Ciudad</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value as CityName)}
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00]"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-[#FF6B00] text-xs font-bold text-white"
          >
            Guardar cambios
          </button>
        </form>

        {/* History of Contracts */}
        <section>
          <h2 className="font-display text-sm font-bold text-[#1A2E4A]">
            Historial de mandados ({contracts.length})
          </h2>
          {contracts.length === 0 ? (
            <p className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              Todavía no registraste contrataciones en esta sesión.
            </p>
          ) : (
            <div className="mt-2.5 space-y-2.5">
              {contracts.map((ct) => (
                <div
                  key={ct.id}
                  className="rounded-2xl border border-slate-200 bg-white p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-sm font-bold text-[#1A2E4A]">
                      {ct.courierName}
                    </p>
                    <span className="text-[11px] font-bold text-slate-600">
                      {ct.status === 'proposed' && 'Propuesto'}
                      {ct.status === 'accepted' && 'En curso'}
                      {ct.status === 'completed' && 'Completado'}
                      {ct.status === 'cancelled' && 'Cancelado'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{ct.description}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="tabular-nums">
                      {formatARS(ct.agreedPriceArs)} · {formatDateAR(ct.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenChat(ct.conversationId)}
                      className="font-semibold text-[#FF6B00] hover:underline"
                    >
                      Ver chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Role Upgrade Links */}
        <section className="space-y-2.5 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-500">
            ¿Querés trabajar o publicar envíos comerciales?
          </p>
          <button
            type="button"
            onClick={() => onOpenAuth('courier')}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#1A2E4A] hover:bg-slate-50"
          >
            <Truck className="h-4 w-4 text-[#FF6B00]" />
            <span>Quiero ofrecer servicios como repartidor</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAuth('merchant')}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#1A2E4A] hover:bg-slate-50"
          >
            <Store className="h-4 w-4 text-[#1A2E4A]" />
            <span>Soy un comercio</span>
          </button>
        </section>
      </div>
    </div>
  );
};
