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
            : 'flex w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#063642] transition hover:border-[#008B8B] hover:text-[#008B8B] active:scale-[0.98] dark:border-[#1E4452] dark:bg-[#0D252E] dark:text-slate-100 dark:hover:border-[#2DD4BF] dark:hover:text-[#2DD4BF]'
        }
      >
        <Download className="h-4 w-4 shrink-0 text-[#008B8B] dark:text-[#2DD4BF]" />
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
              ? 'flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#063642] transition active:scale-[0.98] whitespace-nowrap shrink-0 dark:border-[#1E4452] dark:bg-[#0D252E] dark:text-slate-100'
              : 'flex w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#063642] transition hover:border-[#008B8B] active:scale-[0.98] dark:border-[#1E4452] dark:bg-[#0D252E] dark:text-slate-100 dark:hover:border-[#2DD4BF]'
          }
        >
          <Share className="h-4 w-4 shrink-0 text-[#008B8B] dark:text-[#2DD4BF]" />
          <span>Instalar en iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
            <div className="w-full max-w-[398px] rounded-3xl bg-white p-6 shadow-xl dark:border dark:border-[#1E4452] dark:bg-[#0D252E]">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-bold text-[#063642] dark:text-white">
                  Instalar AlaMano en iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#13323D]"
                  aria-label="Cerrar guía"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <li>
                  1. Tocá el botón <strong className="text-[#063642] dark:text-white">Compartir</strong> en la barra
                  inferior de Safari.
                </li>
                <li>
                  2. Deslizá hacia abajo y elegí{' '}
                  <strong className="text-[#063642] dark:text-white">Agregar a inicio</strong>.
                </li>
                <li>
                  3. Confirmá tocando <strong className="text-[#063642] dark:text-white">Agregar</strong> para
                  abrir AlaMano como aplicación nativa.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#063642] py-3 text-sm font-semibold text-white transition active:scale-[0.98] dark:bg-[#008B8B]"
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
