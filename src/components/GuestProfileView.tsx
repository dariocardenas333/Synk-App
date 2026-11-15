import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  RefreshCw,
  Store,
  Truck,
} from 'lucide-react';
import type { CityName, Contract, CurrentSession } from '../types/synk';
import { CITIES, formatARS, formatDateAR, generateRandomNickname } from '../utils/formatters';

interface GuestProfileViewProps {
  session: CurrentSession;
  contracts: Contract[];
  onBack: () => void;
  onSaveGuest: (nickname: string, city: CityName) => Promise<void>;
  onRecoverGuest: (recoveryCode: string) => Promise<{ nickname: string; recoveredChats: number }>;
  onOpenAuth: (type: 'courier' | 'merchant') => void;
  onOpenChat: (conversationId: string) => void;
}

export const GuestProfileView: React.FC<GuestProfileViewProps> = ({
  session,
  contracts,
  onBack,
  onSaveGuest,
  onRecoverGuest,
  onOpenAuth,
  onOpenChat,
}) => {
  const [nickname, setNickname] = useState(session.displayName);
  const [city, setCity] = useState<CityName>(session.city);
  const [saved, setSaved] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showRestoreBox, setShowRestoreBox] = useState(false);
  const [restoreInput, setRestoreInput] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);
  const [restoreErr, setRestoreErr] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveGuest(nickname, city);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopyCode = async () => {
    if (!session.recoveryCode) return;
    try {
      await navigator.clipboard.writeText(session.recoveryCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      setCopiedCode(false);
    }
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    setRestoreErr(null);
    setRestoreMsg(null);
    setRestoring(true);
    try {
      const res = await onRecoverGuest(restoreInput);
      setNickname(res.nickname);
      setRestoreMsg(
        `¡Cuenta ${res.nickname} vinculada! Se restauraron tus favoritos y ${res.recoveredChats} chat(s).`
      );
      setRestoreInput('');
      setShowRestoreBox(false);
    } catch (err) {
      setRestoreErr(err instanceof Error ? err.message : 'No se pudo recuperar ese código.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="bg-[#F8FAFA] pb-24 dark:bg-[#07181E]">
      <div className="sticky top-14 z-20 flex items-center gap-2 border-b border-[#E2E8F0] bg-white/95 px-4 py-2.5 backdrop-blur-md dark:border-[#1E4452] dark:bg-[#0D252E]/95">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 items-center gap-1.5 pr-2 text-sm font-semibold text-[#063642] dark:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver</span>
        </button>
        <h1 className="font-display text-base font-bold text-[#063642] dark:text-white">
          Mi perfil
        </h1>
      </div>

      <div className="space-y-5 p-4">
        {/* Recovery Code Card */}
        {session.recoveryCode && (
          <section className="rounded-2xl border border-[#008B8B]/30 bg-white p-4 shadow-2xs dark:border-[#2DD4BF]/30 dark:bg-[#0D252E]">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#008B8B]/12 text-[#008B8B] dark:bg-[#008B8B]/20 dark:text-[#2DD4BF]">
                <KeyRound className="h-4 w-4" />
              </div>
              <h2 className="font-display text-sm font-bold text-[#063642] dark:text-white">
                Tu Código de Recuperación
              </h2>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3.5 py-2.5 dark:border-[#1E4452] dark:bg-[#13323D]">
              <span className="font-mono text-lg font-extrabold tracking-widest text-[#063642] dark:text-[#2DD4BF]">
                {session.recoveryCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#063642] px-3 text-xs font-bold text-white transition active:scale-95 dark:bg-[#008B8B]"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar código</span>
                  </>
                )}
              </button>
            </div>

            <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Guardá este código para recuperar tus chats y favoritos si cambiás de celular o borrás
              el historial.
            </p>

            {restoreMsg && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
                {restoreMsg}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowRestoreBox((p) => !p);
                setRestoreErr(null);
              }}
              className="mt-2.5 text-xs font-semibold text-[#008B8B] hover:underline dark:text-[#2DD4BF]"
            >
              ¿Tenés un código anterior? Recuperar otra cuenta
            </button>

            {showRestoreBox && (
              <form onSubmit={handleRestore} className="mt-2.5 space-y-2">
                {restoreErr && (
                  <p className="rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-700 dark:bg-red-950/50 dark:text-red-200">
                    {restoreErr}
                  </p>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={restoreInput}
                    onChange={(e) => setRestoreInput(e.target.value.toUpperCase())}
                    placeholder="ALM-8492"
                    className="h-10 min-w-0 flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 font-mono text-sm font-bold uppercase tracking-wider text-[#063642] outline-none focus:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={restoring}
                    className="h-10 shrink-0 rounded-xl bg-[#008B8B] px-3.5 text-xs font-bold text-white disabled:opacity-60"
                  >
                    {restoring ? 'Buscando...' : 'Vincular'}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-[#1E4452] dark:bg-[#0D252E]"
        >
          <div>
            <h2 className="font-display text-sm font-bold text-[#063642] dark:text-white">
              Identidad de cliente
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              No necesitás correo ni contraseña para buscar y contactar prestadores.
            </p>
          </div>

          {saved && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Cambios guardados en tu sesión.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
              Nickname
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                required
                maxLength={24}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="h-11 flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm font-medium text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
              />
              <button
                type="button"
                onClick={() => setNickname(generateRandomNickname())}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-slate-600 hover:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#13323D] dark:text-slate-200 dark:hover:border-[#2DD4BF]"
                aria-label="Generar nickname aleatorio"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
              Ciudad
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value as CityName)}
              className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#13323D] dark:text-slate-100"
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
            className="h-11 w-full rounded-xl bg-[#063642] text-xs font-bold text-white dark:bg-[#008B8B]"
          >
            Guardar cambios
          </button>
        </form>

        {/* History of Contracts */}
        <section>
          <h2 className="font-display text-sm font-bold text-[#063642] dark:text-white">
            Historial de mandados ({contracts.length})
          </h2>
          {contracts.length === 0 ? (
            <p className="mt-2 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-xs text-slate-500 dark:border-[#1E4452] dark:bg-[#0D252E] dark:text-slate-400">
              Todavía no registraste contrataciones en esta sesión.
            </p>
          ) : (
            <div className="mt-2.5 space-y-2.5">
              {contracts.map((ct) => (
                <div
                  key={ct.id}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5 dark:border-[#1E4452] dark:bg-[#0D252E]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-sm font-bold text-[#063642] dark:text-white">
                      {ct.courierName}
                    </p>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      {ct.status === 'proposed' && 'Propuesto'}
                      {ct.status === 'accepted' && 'En curso'}
                      {ct.status === 'completed' && 'Completado'}
                      {ct.status === 'cancelled' && 'Cancelado'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {ct.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="tabular-nums">
                      {formatARS(ct.agreedPriceArs)} · {formatDateAR(ct.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenChat(ct.conversationId)}
                      className="font-semibold text-[#008B8B] hover:underline dark:text-[#2DD4BF]"
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
        <section className="space-y-2.5 border-t border-[#E2E8F0] pt-4 dark:border-[#1E4452]">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            ¿Querés trabajar o publicar envíos comerciales?
          </p>
          <button
            type="button"
            onClick={() => onOpenAuth('courier')}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#063642] hover:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#0D252E] dark:text-white dark:hover:border-[#2DD4BF]"
          >
            <Truck className="h-4 w-4 text-[#008B8B] dark:text-[#2DD4BF]" />
            <span>Quiero ofrecer servicios independientes</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAuth('merchant')}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#063642] hover:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#0D252E] dark:text-white dark:hover:border-[#2DD4BF]"
          >
            <Store className="h-4 w-4 text-[#063642] dark:text-[#2DD4BF]" />
            <span>Soy un comercio</span>
          </button>
        </section>
      </div>
    </div>
  );
};
