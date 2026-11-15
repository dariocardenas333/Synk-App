import React, { useState } from 'react';
import { ArrowRight, Briefcase, ShieldCheck, UserCheck } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface WelcomeViewProps {
  onSelectClient: () => Promise<void>;
  onSelectProvider: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onSelectClient,
  onSelectProvider,
}) => {
  const [loadingClient, setLoadingClient] = useState(false);

  const handleClientClick = async () => {
    setLoadingClient(true);
    try {
      await onSelectClient();
    } finally {
      setLoadingClient(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col justify-between bg-[#F8FAFA] px-6 pb-8 pt-10">
      {/* Top Brand Identity */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#063642] font-display text-2xl font-extrabold text-white shadow-sm">
            A
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#063642] leading-none">
              AlaMano
            </h1>
            <p className="mt-1 text-xs font-bold text-[#008B8B]">
              Servicios independientes, más cerca.
            </p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="mt-10">
          <h2 className="font-display text-[28px] font-extrabold leading-[1.15] tracking-tight text-[#063642] text-balance">
            Todo lo que necesitás resolver hoy, en tu ciudad.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Conectá directo con prestadores independientes en Trelew y Chubut, sin intermediarios
            ni comisiones.
          </p>
        </div>

        {/* Primary & Secondary Role CTAs */}
        <div className="mt-8 space-y-3.5">
          <button
            type="button"
            disabled={loadingClient}
            onClick={handleClientClick}
            className="group flex w-full items-center justify-between gap-4 rounded-2xl bg-[#063642] p-5 text-left text-white shadow-md transition hover:bg-[#052a34] active:scale-[0.98] disabled:opacity-70"
          >
            <div className="flex min-w-0 items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/12">
                <UserCheck className="h-6 w-6 text-[#F5A623]" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-extrabold leading-tight">
                  {loadingClient ? 'Ingresando...' : 'Soy Cliente'}
                </p>
                <p className="mt-1 text-xs leading-snug text-slate-200">
                  Explorá tarifas en ARS, compará prestadores reales y chateá al instante sin registro.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={onSelectProvider}
            className="group flex w-full items-center justify-between gap-4 rounded-2xl bg-[#008B8B] p-5 text-left text-white shadow-md transition hover:bg-[#007676] active:scale-[0.98]"
          >
            <div className="flex min-w-0 items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-extrabold leading-tight">
                  Ofrezco Servicios
                </p>
                <p className="mt-1 text-xs leading-snug text-teal-50">
                  Publicá tus tarifas, activá tu jornada y recibí pedidos directos en Modo Trabajo.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Footer Trust + PWA Install */}
      <div className="mt-8 space-y-3">
        <PWAInstallButton />
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-xs text-slate-600">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#008B8B]" />
          <span>Trato directo · Precios en pesos argentinos · Sin comisiones</span>
        </div>
      </div>
    </div>
  );
};
