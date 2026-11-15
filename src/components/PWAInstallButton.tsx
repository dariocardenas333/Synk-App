import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={
          compact
            ? 'flex items-center gap-1.5 rounded-lg bg-[#008B8B] px-3 py-2 text-xs font-semibold text-white transition active:scale-[0.98] whitespace-nowrap shrink-0'
            : 'flex w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#063642] transition hover:border-[#008B8B] hover:text-[#008B8B] active:scale-[0.98]'
        }
      >
        <Download className="h-4 w-4 shrink-0 text-[#008B8B]" />
        <span>Instalar aplicación</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={
            compact
              ? 'flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#063642] transition active:scale-[0.98] whitespace-nowrap shrink-0'
              : 'flex w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#063642] transition hover:border-[#008B8B] active:scale-[0.98]'
          }
        >
          <Share className="h-4 w-4 shrink-0 text-[#008B8B]" />
          <span>Instalar en iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
            <div className="w-full max-w-[398px] rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-bold text-[#063642]">
                  Instalar AlaMano en iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                  aria-label="Cerrar guía"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                <li>
                  1. Tocá el botón <strong className="text-[#063642]">Compartir</strong> en la barra
                  inferior de Safari.
                </li>
                <li>
                  2. Deslizá hacia abajo y elegí{' '}
                  <strong className="text-[#063642]">Agregar a inicio</strong>.
                </li>
                <li>
                  3. Confirmá tocando <strong className="text-[#063642]">Agregar</strong> para
                  abrir AlaMano como aplicación nativa.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#063642] py-3 text-sm font-semibold text-white transition active:scale-[0.98]"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
