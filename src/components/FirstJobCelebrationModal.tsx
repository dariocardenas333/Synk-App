import React from 'react';
import { Award, PartyPopper, Sparkles, Trophy } from 'lucide-react';

interface FirstJobCelebrationModalProps {
  onClose: () => void;
  onGoToRanking: () => void;
}

export const FirstJobCelebrationModal: React.FC<FirstJobCelebrationModalProps> = ({
  onClose,
  onGoToRanking,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-job-title"
    >
      <div className="w-full max-w-[380px] overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Festive Top Header */}
        <div className="relative bg-gradient-to-br from-[#063642] to-[#008B8B] px-6 pb-8 pt-8 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5A623] text-[#063642] shadow-lg">
            <Trophy className="h-9 w-9" />
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
            <PartyPopper className="h-3.5 w-3.5 text-[#F5A623]" />
            <span>Primer logro desbloqueado</span>
          </div>
          <h2
            id="first-job-title"
            className="mt-3 font-display text-xl font-extrabold leading-snug"
          >
            ¡Felicitaciones por tu primer trabajo en AlaMano!
          </h2>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6 text-center">
          <p className="text-sm leading-relaxed text-slate-600">
            Completaste tu primer servicio confirmado. Ya sumaste tus primeros puntos en el
            Ranking de prestadores de la ciudad.
          </p>

          <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#F5A623]/40 bg-[#F5A623]/10 p-3.5">
            <Award className="h-6 w-6 text-[#F5A623]" />
            <div className="text-left">
              <p className="font-display text-sm font-extrabold text-[#063642]">
                +10 puntos sumados
              </p>
              <p className="text-xs text-slate-600">
                Cada trabajo completado suma +10 pts
              </p>
            </div>
            <Sparkles className="h-5 w-5 text-[#F5A623]" />
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={onGoToRanking}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#008B8B] text-sm font-bold text-white transition active:scale-[0.98]"
            >
              <Trophy className="h-4 w-4 text-[#F5A623]" />
              <span>Ver mi puesto en Ranking</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-slate-600 hover:bg-[#F8FAFA]"
            >
              Seguir trabajando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
