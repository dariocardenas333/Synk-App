import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  FileCheck2,
  Flame,
  PowerOff,
  SlidersHorizontal,
  Star,
  Trophy,
  XCircle,
} from 'lucide-react';
import type { AvailabilityStatus, Contract, CourierPublicProfile } from '../types/synk';
import {
  AVAILABILITY_META,
  formatARS,
  getCategoryInfo,
  getCourierCategories,
  getInitials,
} from '../utils/formatters';

interface CourierDashboardViewProps {
  courier: CourierPublicProfile;
  contracts: Contract[];
  rankingPosition: number;
  onChangeAvailability: (nextStatus: AvailabilityStatus) => Promise<void>;
  onAcceptContract: (contractId: string) => Promise<void>;
  onCompleteContract: (contractId: string) => Promise<void>;
  onCancelContract: (contractId: string) => Promise<void>;
  onOpenChat: (conversationId: string) => void;
  onOpenServices: () => void;
  onOpenRanking: () => void;
}

const SHIFT_STATES: Array<{
  status: AvailabilityStatus;
  label: string;
  sub: string;
  activeBg: string;
  activeBorder: string;
  icon: React.ReactNode;
}> = [
  {
    status: 'available',
    label: 'Disponible',
    sub: 'Listo para trabajar',
    activeBg: 'bg-[#22C55E] text-white',
    activeBorder: 'border-[#22C55E]',
    icon: <CheckCircle2 className="h-6 w-6" />,
  },
  {
    status: 'busy',
    label: 'Ocupado',
    sub: 'En un trabajo',
    activeBg: 'bg-[#EF4444] text-white',
    activeBorder: 'border-[#EF4444]',
    icon: <Clock className="h-6 w-6" />,
  },
  {
    status: 'offline',
    label: 'Desconectado',
    sub: 'Fuera de horario',
    activeBg: 'bg-[#9CA3AF] text-white',
    activeBorder: 'border-[#9CA3AF]',
    icon: <PowerOff className="h-6 w-6" />,
  },
];

export const CourierDashboardView: React.FC<CourierDashboardViewProps> = ({
  courier,
  contracts,
  rankingPosition,
  onChangeAvailability,
  onAcceptContract,
  onCompleteContract,
  onCancelContract,
  onOpenChat,
  onOpenServices,
  onOpenRanking,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyContractId, setBusyContractId] = useState<string | null>(null);

  const myContracts = contracts
    .filter((c) => c.courierId === courier.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const activeContracts = myContracts.filter(
    (c) => c.status === 'proposed' || c.status === 'accepted'
  );
  const completedContracts = myContracts.filter(
    (c) => c.status === 'completed' || c.status === 'cancelled'
  );

  const points = typeof courier.points === 'number' ? courier.points : courier.completedCount * 10;
  const currentStatusMeta = AVAILABILITY_META[courier.availabilityStatus];
  const categoryLabels = getCourierCategories(courier)
    .map((id) => getCategoryInfo(id).label)
    .filter(Boolean)
    .join(' · ');

  const handleStatusChange = async (next: AvailabilityStatus) => {
    if (next === courier.availabilityStatus) return;
    setError(null);
    setFeedback(null);
    try {
      await onChangeAvailability(next);
      setFeedback(`Tu estado en vivo ahora es: ${AVAILABILITY_META[next].label}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar tu estado.');
    }
  };

  const runContractAction = async (contractId: string, fn: () => Promise<void>) => {
    setError(null);
    setFeedback(null);
    setBusyContractId(contractId);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar la acción.');
    } finally {
      setBusyContractId(null);
    }
  };

  return (
    <div className="bg-[#F8FAFA] pb-24 dark:bg-[#07181E]">
      <div className="space-y-4 p-4">
        {/* Giant 3-State Workday Selector */}
        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#1E4452] dark:bg-[#0D252E]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-[#063642] text-white dark:bg-[#13323D]">
                {courier.photoUrl ? (
                  <img
                    src={courier.photoUrl}
                    alt={courier.publicName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-display text-sm font-bold">
                    {getInitials(courier.publicName)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#008B8B] dark:text-[#2DD4BF]">
                  Modo Trabajo
                </p>
                <h1 className="truncate font-display text-base font-extrabold text-[#063642] dark:text-white">
                  {courier.publicName}
                </h1>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {categoryLabels} · {courier.city}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenServices}
              className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-xs font-bold text-[#063642] hover:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#13323D] dark:text-slate-100 dark:hover:border-[#2DD4BF]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#008B8B] dark:text-[#2DD4BF]" />
              <span>Tarifas</span>
            </button>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-[#1E4452]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Estado de tu jornada
              </p>
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${currentStatusMeta.bgSoftClass} ${currentStatusMeta.textClass}`}
              >
                {currentStatusMeta.label}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {SHIFT_STATES.map((item) => {
                const isActive = courier.availabilityStatus === item.status;
                return (
                  <button
                    key={item.status}
                    type="button"
                    onClick={() => handleStatusChange(item.status)}
                    aria-pressed={isActive}
                    className={`flex min-h-24 flex-col items-center justify-center rounded-2xl border-2 px-2 py-3 text-center transition active:scale-95 ${
                      isActive
                        ? `${item.activeBg} ${item.activeBorder} shadow-md`
                        : 'border-[#E2E8F0] bg-[#F8FAFA] text-slate-600 hover:bg-slate-100 dark:border-[#1E4452] dark:bg-[#13323D] dark:text-slate-300 dark:hover:bg-[#1A4352]'
                    }`}
                  >
                    {item.icon}
                    <span className="mt-2 font-display text-xs font-extrabold leading-tight">
                      {item.label}
                    </span>
                    <span
                      className={`mt-1 text-[10px] leading-tight ${
                        isActive ? 'text-white/95' : 'text-slate-400 dark:text-slate-400'
                      }`}
                    >
                      {item.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4 Quick Indicators: Completados, Puntaje, Posición Ranking, Estrellas */}
        <section className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5 dark:border-[#1E4452] dark:bg-[#0D252E]">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Trabajos completados
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold text-[#063642] tabular-nums dark:text-white">
              {courier.completedCount}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenRanking}
            className="rounded-2xl border border-[#F5A623]/40 bg-[#F5A623]/10 p-3.5 text-left transition hover:bg-[#F5A623]/15 active:scale-95 dark:bg-[#F5A623]/15 dark:hover:bg-[#F5A623]/20"
          >
            <p className="text-[11px] font-semibold text-[#063642] dark:text-[#FCD34D]">
              Puntaje actual
            </p>
            <div className="mt-1 flex items-center gap-1.5 font-display text-2xl font-extrabold text-[#063642] tabular-nums dark:text-white">
              <Flame className="h-5 w-5 text-[#F5A623]" />
              <span>{points}</span>
              <span className="text-xs font-bold text-[#008B8B] dark:text-[#2DD4BF]">pts</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenRanking}
            className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5 text-left transition hover:border-[#008B8B] active:scale-95 dark:border-[#1E4452] dark:bg-[#0D252E] dark:hover:border-[#2DD4BF]"
          >
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Posición en ranking
            </p>
            <div className="mt-1 flex items-center gap-1.5 font-display text-2xl font-extrabold text-[#063642] tabular-nums dark:text-white">
              <Trophy className="h-5 w-5 text-[#F5A623]" />
              <span>{rankingPosition > 0 ? `#${rankingPosition}` : '—'}</span>
            </div>
          </button>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5 dark:border-[#1E4452] dark:bg-[#0D252E]">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Promedio de estrellas
            </p>
            <div className="mt-1 flex items-center gap-1.5 font-display text-2xl font-extrabold text-[#063642] tabular-nums dark:text-white">
              <Star className="h-5 w-5 fill-[#F5A623] text-[#F5A623]" />
              <span>{courier.ratingCount > 0 ? courier.ratingAverage.toFixed(1) : '—'}</span>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}
        {feedback && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            {feedback}
          </div>
        )}

        {/* Active Contracts */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-extrabold text-[#063642] dark:text-white">
              Pedidos Activos ({activeContracts.length})
            </h2>
          </div>

          {activeContracts.length === 0 ? (
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center text-xs leading-relaxed text-slate-500 dark:border-[#1E4452] dark:bg-[#0D252E] dark:text-slate-400">
              No tenés contrataciones activas en este momento. Cuando un cliente o comercio te
              proponga un servicio desde el chat, aparecerá acá.
            </div>
          ) : (
            <div className="space-y-3">
              {activeContracts.map((ct) => {
                const isBusy = busyContractId === ct.id;
                return (
                  <div
                    key={ct.id}
                    className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#1E4452] dark:bg-[#0D252E]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-display text-sm font-bold text-[#063642] dark:text-white">
                          {ct.clientName}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                          {ct.description}
                        </p>
                        <p className="mt-1 font-mono text-xs font-bold text-[#063642] tabular-nums dark:text-[#2DD4BF]">
                          {formatARS(ct.agreedPriceArs)} ·{' '}
                          {ct.modality === 'recurrente' ? 'Recurrente' : 'Puntual'}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          ct.status === 'accepted'
                            ? 'bg-[#EF4444]/15 text-[#B91C1C] dark:bg-[#EF4444]/20 dark:text-[#F87171]'
                            : 'bg-[#F5A623]/20 text-[#9A5B00] dark:bg-[#F5A623]/20 dark:text-[#FCD34D]'
                        }`}
                      >
                        {ct.status === 'accepted' ? 'En curso' : 'Propuesto'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      {ct.status === 'proposed' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            runContractAction(ct.id, () => onAcceptContract(ct.id))
                          }
                          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-[#22C55E] px-3 text-xs font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Confirmar y aceptar trabajo</span>
                        </button>
                      )}

                      {ct.status === 'accepted' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            runContractAction(ct.id, () => onCompleteContract(ct.id))
                          }
                          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-[#008B8B] px-3 text-xs font-bold text-white transition active:scale-[0.98] disabled:opacity-60 hover:bg-[#007676]"
                        >
                          <FileCheck2 className="h-4 w-4" />
                          <span>Marcar trabajo como finalizado</span>
                        </button>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenChat(ct.conversationId)}
                          className="h-10 flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-xs font-semibold text-[#063642] dark:border-[#1E4452] dark:bg-[#13323D] dark:text-slate-100"
                        >
                          Ir al chat
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            runContractAction(ct.id, () => onCancelContract(ct.id))
                          }
                          className="flex h-10 items-center justify-center gap-1 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-slate-600 dark:border-[#1E4452] dark:bg-[#13323D] dark:text-slate-300"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Cancelar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent History */}
        {completedContracts.length > 0 && (
          <section className="space-y-2.5 pt-2">
            <h3 className="font-display text-sm font-bold text-slate-500 dark:text-slate-400">
              Historial reciente
            </h3>
            <div className="space-y-2">
              {completedContracts.slice(0, 6).map((ct) => (
                <div
                  key={ct.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-3 dark:border-[#1E4452] dark:bg-[#0D252E]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#063642] dark:text-white">
                      {ct.clientName}
                    </p>
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {ct.description}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      ct.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {ct.status === 'completed' ? 'Finalizado (+10 pts)' : 'Cancelado'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
