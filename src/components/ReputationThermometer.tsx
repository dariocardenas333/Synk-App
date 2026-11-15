import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { computeReputationLevel } from '../utils/formatters';

interface ReputationThermometerProps {
  completedCount: number;
  ratingAverage: number;
  ratingCount: number;
  compact?: boolean;
}

const SEGMENTS: Array<{ level: 1 | 2 | 3 | 4 | 5; activeColor: string; mutedColor: string }> = [
  { level: 1, activeColor: 'bg-[#EF4444]', mutedColor: 'bg-[#EF4444]/25 dark:bg-[#EF4444]/20' },
  { level: 2, activeColor: 'bg-[#F97316]', mutedColor: 'bg-[#F97316]/25 dark:bg-[#F97316]/20' },
  { level: 3, activeColor: 'bg-[#F5A623]', mutedColor: 'bg-[#F5A623]/25 dark:bg-[#F5A623]/20' },
  { level: 4, activeColor: 'bg-[#4ADE80]', mutedColor: 'bg-[#4ADE80]/25 dark:bg-[#4ADE80]/20' },
  { level: 5, activeColor: 'bg-[#16A34A]', mutedColor: 'bg-[#16A34A]/25 dark:bg-[#16A34A]/20' },
];

export const ReputationThermometer: React.FC<ReputationThermometerProps> = ({
  completedCount,
  ratingAverage,
  ratingCount,
  compact = false,
}) => {
  const rep = computeReputationLevel(completedCount, ratingAverage, ratingCount);

  if (compact) {
    return (
      <div className="mt-2.5 flex items-center justify-between gap-2.5">
        <div
          className="grid flex-1 grid-cols-5 items-center gap-1"
          aria-label={`Termómetro de reputación: ${rep.label}`}
        >
          {SEGMENTS.map((seg) => {
            const isActive = rep.level === seg.level;
            return (
              <span
                key={seg.level}
                className={`rounded-full transition-all ${
                  isActive
                    ? `h-2 ${seg.activeColor} ring-2 ring-offset-1 ring-[#063642]/15 dark:ring-white/25 dark:ring-offset-[#0D252E]`
                    : rep.level === 0
                    ? 'h-1.5 bg-slate-200 dark:bg-[#1E4452]'
                    : `h-1.5 ${seg.mutedColor}`
                }`}
              />
            );
          })}
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${rep.badgeClass}`}
        >
          {rep.label}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFA] p-3.5 dark:border-[#1E4452] dark:bg-[#13323D]/70">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-[#008B8B] dark:text-[#2DD4BF]" />
          <span className="text-xs font-bold text-[#063642] dark:text-white">
            Termómetro de reputación
          </span>
        </div>
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${rep.badgeClass}`}>
          {rep.label}
        </span>
      </div>

      <div
        className="mt-2.5 grid grid-cols-5 items-center gap-1.5"
        aria-label={`Nivel de reputación ${rep.level} de 5: ${rep.label}`}
      >
        {SEGMENTS.map((seg) => {
          const isActive = rep.level === seg.level;
          return (
            <span
              key={seg.level}
              className={`rounded-full transition-all ${
                isActive
                  ? `h-2.5 ${seg.activeColor} ring-2 ring-offset-1 ring-[#063642]/20 dark:ring-white/30 dark:ring-offset-[#0D252E]`
                  : rep.level === 0
                  ? 'h-2 bg-slate-200 dark:bg-[#1E4452]'
                  : `h-2 ${seg.mutedColor}`
              }`}
            />
          );
        })}
      </div>

      <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
        {rep.level === 0
          ? 'Todavía no registra trabajos finalizados ni valoraciones.'
          : `Basado en ${completedCount} ${
              completedCount === 1 ? 'trabajo completado' : 'trabajos completados'
            } y ${ratingCount} ${ratingCount === 1 ? 'opinión verificada' : 'opiniones verificadas'}.`}
      </p>
    </div>
  );
};
