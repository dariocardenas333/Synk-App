import React from 'react';
import { Award, Crown, Flame, Medal, Sparkles, Trophy } from 'lucide-react';
import type { CourierPublicProfile } from '../types/synk';
import { getCategoryInfo, getInitials } from '../utils/formatters';

interface RankingViewProps {
  couriers: CourierPublicProfile[];
  currentCourierId: string;
}

export const RankingView: React.FC<RankingViewProps> = ({
  couriers,
  currentCourierId,
}) => {
  const ranked = [...couriers]
    .map((c) => {
      const pts = typeof c.points === 'number' ? c.points : c.completedCount * 10;
      return { courier: c, points: pts };
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.courier.completedCount !== a.courier.completedCount) {
        return b.courier.completedCount - a.courier.completedCount;
      }
      if (b.courier.ratingAverage !== a.courier.ratingAverage) {
        return b.courier.ratingAverage - a.courier.ratingAverage;
      }
      return a.courier.publicName.localeCompare(b.courier.publicName);
    });

  const myIndex = ranked.findIndex((r) => r.courier.id === currentCourierId);
  const myEntry = myIndex >= 0 ? ranked[myIndex] : null;

  return (
    <div className="bg-[#F8FAFA] pb-24">
      {/* Leaderboard Banner */}
      <div className="bg-gradient-to-br from-[#063642] to-[#0B4F60] px-4 pb-5 pt-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#F5A623]">
              <Trophy className="h-3.5 w-3.5" />
              <span>Tabla de prestadores</span>
            </div>
            <h1 className="mt-2 font-display text-xl font-extrabold tracking-tight">
              Ranking AlaMano
            </h1>
            <p className="mt-1 text-xs text-slate-200">
              Sumás <span className="font-bold text-[#F5A623]">+10 pts</span> por trabajo
              finalizado y <span className="font-bold text-[#F5A623]">+5 pts</span> por cada
              valoración de 5 estrellas.
            </p>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F5A623] text-[#063642] shadow-md">
            <Crown className="h-7 w-7" />
          </div>
        </div>

        {myEntry && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-xs">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5A623] font-display text-sm font-extrabold text-[#063642] tabular-nums">
                #{myIndex + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">Tu posición actual</p>
                <p className="text-[11px] text-slate-200 tabular-nums">
                  {myEntry.courier.completedCount}{' '}
                  {myEntry.courier.completedCount === 1
                    ? 'trabajo completado'
                    : 'trabajos completados'}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono text-base font-extrabold text-[#F5A623] tabular-nums">
                {myEntry.points} pts
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Transparency Note */}
      <div className="mx-4 mt-4 flex items-start gap-2.5 rounded-2xl border border-[#F5A623]/40 bg-[#F5A623]/10 p-3 text-xs text-[#063642]">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#F5A623]" />
        <p className="leading-relaxed">
          Reconocimiento simbólico interno exclusivo para prestadores. No modifica ni altera el
          orden en que los clientes ven tu perfil.
        </p>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2.5 p-4">
        {ranked.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center text-xs text-slate-500">
            Todavía no hay prestadores registrados en el ranking.
          </div>
        ) : (
          ranked.map((entry, idx) => {
            const rank = idx + 1;
            const isMe = entry.courier.id === currentCourierId;

            const rankBadge =
              rank === 1 ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5A623] text-[#063642]">
                  <Crown className="h-5 w-5" />
                </div>
              ) : rank === 2 ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-[#063642]">
                  <Medal className="h-5 w-5" />
                </div>
              ) : rank === 3 ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5A623]/25 text-[#9A5B00]">
                  <Award className="h-5 w-5" />
                </div>
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFA] font-display text-xs font-extrabold text-slate-600 tabular-nums">
                  {rank}
                </span>
              );

            return (
              <div
                key={entry.courier.id}
                className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition ${
                  isMe
                    ? 'border-[#008B8B] bg-[#008B8B]/5 shadow-xs'
                    : 'border-[#E2E8F0] bg-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {rankBadge}

                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#063642] text-white">
                    {entry.courier.photoUrl ? (
                      <img
                        src={entry.courier.photoUrl}
                        alt={entry.courier.publicName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-display text-xs font-bold">
                        {getInitials(entry.courier.publicName)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-display text-sm font-bold text-[#063642]">
                        {entry.courier.publicName}
                      </p>
                      {isMe && (
                        <span className="shrink-0 rounded bg-[#008B8B] px-1.5 py-0.5 text-[10px] font-bold text-white">
                          Vos
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[11px] text-slate-500">
                      {getCategoryInfo(entry.courier.serviceCategory).label} ·{' '}
                      {entry.courier.completedCount}{' '}
                      {entry.courier.completedCount === 1 ? 'trabajo' : 'trabajos'}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 font-mono text-sm font-extrabold text-[#063642] tabular-nums">
                  <Flame className="h-4 w-4 text-[#F5A623]" />
                  <span>{entry.points}</span>
                  <span className="text-[11px] font-semibold text-slate-400">pts</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
