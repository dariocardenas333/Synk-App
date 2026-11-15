import React, { useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  KeyRound,
  Moon,
  ShieldCheck,
  Sun,
  UserCheck,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface WelcomeViewProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onSelectClient: (customNickname?: string) => Promise<void>;
  onRecoverClient: (recoveryCode: string) => Promise<void>;
  onSelectProvider: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  isDark,
  onToggleTheme,
  onSelectClient,
  onRecoverClient,
  onSelectProvider,
}) => {
  const [nickname, setNickname] = useState('');
  const [loadingClient, setLoadingClient] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recovering, setRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const handleClientClick = async () => {
    setRecoveryError(null);
    setLoadingClient(true);
    try {
      await onSelectClient(nickname);
    } finally {
      setLoadingClient(false);
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode.trim()) return;
    setRecoveryError(null);
    setRecovering(true);
    try {
      await onRecoverClient(recoveryCode);
    } catch (err) {
      setRecoveryError(
        err instanceof Error ? err.message : 'No se pudo recuperar tu cuenta.'
      );
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col justify-between bg-[#F8FAFA] px-6 pb-8 pt-6 dark:bg-[#07181E]">
      {/* Top Bar with Theme Switch */}
      <div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#063642] shadow-2xs transition hover:border-[#008B8B] active:scale-95 dark:border-[#1E4452] dark:bg-[#0D252E] dark:text-slate-100"
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5 text-[#F5A623]" />
                <span>Claro</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-[#063642]" />
                <span>Oscuro</span>
              </>
            )}
          </button>
        </div>

        <div className="flex justify-center pt-3">
          <div className="dark:rounded-3xl dark:bg-white dark:p-3 dark:shadow-lg">
            <img
              src="/logo-alamano.png"
              alt="AlaMano — Servicios independientes, más cerca."
              className="h-36 w-36 object-contain mix-blend-multiply"
            />
          </div>
        </div>

        {/* Hero Copy */}
        <div className="mt-5">
          <h1 className="font-display text-[26px] font-extrabold leading-[1.15] tracking-tight text-[#063642] text-balance dark:text-white">
            Todo lo que necesitás resolver hoy, en tu ciudad.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Conectá directo con prestadores independientes en Trelew y Chubut, sin intermediarios
            ni comisiones.
          </p>
        </div>

        {/* Client Entry Card (Name + Soy Cliente + Recovery Option) */}
        <div className="mt-6 space-y-3.5">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5 shadow-sm dark:border-[#1E4452] dark:bg-[#0D252E]">
            <label
              htmlFor="guest-welcome-name"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Tu nombre o apodo para chatear (opcional)
            </label>
            <input
              id="guest-welcome-name"
              type="text"
              maxLength={24}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ej: @lucas o Lucía (si lo dejás vacío se genera uno)"
              className="mt-1.5 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3.5 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
            />

            <button
              type="button"
              disabled={loadingClient}
              onClick={handleClientClick}
              className="group mt-3 flex w-full items-center justify-between gap-4 rounded-xl bg-[#063642] p-4 text-left text-white shadow-sm transition hover:bg-[#052a34] active:scale-[0.98] disabled:opacity-70 dark:bg-[#13323D] dark:hover:bg-[#1A4352]"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/12">
                  <UserCheck className="h-5 w-5 text-[#F5A623]" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-base font-extrabold leading-tight">
                    {loadingClient ? 'Ingresando...' : 'Soy Cliente'}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-slate-200 dark:text-slate-300">
                    Explorá tarifas en ARS y chateá al instante sin registro.
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>

            <div className="mt-2.5 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowRecovery((prev) => !prev);
                  setRecoveryError(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008B8B] hover:underline dark:text-[#2DD4BF]"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>¿Ya tenés un código de recuperación? Ingresalo acá</span>
              </button>
            </div>

            {showRecovery && (
              <form
                onSubmit={handleRecoverSubmit}
                className="mt-3 space-y-2.5 rounded-xl border border-[#008B8B]/30 bg-[#F8FAFA] p-3 dark:border-[#2DD4BF]/30 dark:bg-[#13323D]"
              >
                <p className="text-[11px] leading-snug text-slate-600 dark:text-slate-300">
                  Ingresá tu código (ej. <span className="font-mono font-bold">ALM-8492</span>) para
                  recuperar tus chats y favoritos.
                </p>
                {recoveryError && (
                  <p className="rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-700 dark:bg-red-950/50 dark:text-red-200">
                    {recoveryError}
                  </p>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                    placeholder="ALM-8492"
                    className="h-10 min-w-0 flex-1 rounded-xl border border-[#E2E8F0] bg-white px-3 font-mono text-sm font-bold uppercase tracking-wider text-[#063642] outline-none focus:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#0D252E] dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={recovering || !recoveryCode.trim()}
                    className="h-10 shrink-0 rounded-xl bg-[#008B8B] px-3.5 text-xs font-bold text-white transition hover:bg-[#007676] disabled:opacity-60"
                  >
                    {recovering ? 'Buscando...' : 'Recuperar'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <button
            type="button"
            onClick={onSelectProvider}
            className="group flex w-full items-center justify-between gap-4 rounded-2xl bg-[#008B8B] p-4 text-left text-white shadow-md transition hover:bg-[#007676] active:scale-[0.98]"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-base font-extrabold leading-tight">
                  Ofrezco Servicios
                </p>
                <p className="mt-0.5 text-xs leading-snug text-teal-50">
                  Publicá tus tarifas, activá tu jornada y recibí pedidos en Modo Trabajo.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Footer Trust + PWA Install */}
      <div className="mt-6 space-y-3">
        <PWAInstallButton />
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-xs text-slate-600 dark:border-[#1E4452] dark:bg-[#0D252E] dark:text-slate-300">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#008B8B] dark:text-[#2DD4BF]" />
          <span>Trato directo · Precios en pesos argentinos · Sin comisiones</span>
        </div>
      </div>
    </div>
  );
};
