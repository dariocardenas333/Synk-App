import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  FileCheck2,
  MessageSquare,
  PackageCheck,
  PowerOff,
} from 'lucide-react';
import type { Contract, Conversation, CourierPublicProfile, CurrentSession } from '../types/synk';
import { AVAILABILITY_META, formatTimeAR, getCategoryInfo, getInitials } from '../utils/formatters';

interface ChatListViewProps {
  session: CurrentSession;
  conversations: Conversation[];
  contracts: Contract[];
  couriers: CourierPublicProfile[];
  onOpenConversation: (conversationId: string) => void;
  onAcceptContract?: (contractId: string) => Promise<void>;
  onCompleteContract?: (contractId: string) => Promise<void>;
  onGoSearch?: () => void;
}

export const ChatListView: React.FC<ChatListViewProps> = ({
  session,
  conversations,
  contracts,
  couriers,
  onOpenConversation,
  onAcceptContract,
  onCompleteContract,
  onGoSearch,
}) => {
  const isProvider = session.role === 'courier';
  const [busyContractId, setBusyContractId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuickAction = async (contractId: string, fn: () => Promise<void>) => {
    setError(null);
    setBusyContractId(contractId);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el servicio.');
    } finally {
      setBusyContractId(null);
    }
  };

  return (
    <div className="bg-[#F8FAFA] pb-24 dark:bg-[#07181E]">
      <div className="border-b border-[#E2E8F0] bg-white px-4 pb-3 pt-3 dark:border-[#1E4452] dark:bg-[#0D252E]">
        <h1 className="font-display text-lg font-extrabold text-[#063642] dark:text-white">
          {isProvider ? 'Chats con clientes' : 'Conversaciones y servicios'}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {isProvider
            ? 'Respondé consultas y confirmá o cerrá tus servicios directo desde acá.'
            : 'Acordá condiciones y tarifas directo por chat privado.'}
        </p>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {conversations.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center dark:border-[#1E4452] dark:bg-[#0D252E]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#008B8B]/10 text-[#008B8B] dark:bg-[#008B8B]/20 dark:text-[#2DD4BF]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-bold text-[#063642] dark:text-white">
              Todavía no tenés conversaciones
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {isProvider
                ? 'Cuando un cliente o comercio te contacte para solicitar un servicio, la conversación aparecerá acá.'
                : 'Elegí un prestador disponible, revisá sus tarifas e iniciá un chat para coordinar.'}
            </p>
            {!isProvider && onGoSearch && (
              <button
                type="button"
                onClick={onGoSearch}
                className="mt-4 h-11 rounded-xl bg-[#063642] px-5 text-xs font-bold text-white dark:bg-[#008B8B]"
              >
                Buscar prestadores
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-2xl border border-[#E2E8F0] bg-white dark:divide-[#1E4452] dark:border-[#1E4452] dark:bg-[#0D252E]">
            {conversations.map((conv) => {
              const isCourierUser = session.uid === conv.courierId;
              const counterpartName = isCourierUser ? conv.clientName : conv.courierName;
              const courier = couriers.find((c) => c.id === conv.courierId);
              const convContracts = contracts
                .filter((ct) => ct.conversationId === conv.id)
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
              const latestContract = convContracts[0];
              const unread = conv.unreadCount?.[session.uid] || 0;
              const isUnread = unread > 0;
              const statusMeta = courier ? AVAILABILITY_META[courier.availabilityStatus] : null;
              const canQuickAccept =
                isCourierUser &&
                latestContract?.status === 'proposed' &&
                Boolean(onAcceptContract);
              const canQuickComplete =
                isCourierUser &&
                latestContract?.status === 'accepted' &&
                Boolean(onCompleteContract);

              return (
                <div
                  key={conv.id}
                  className={`p-3.5 transition hover:bg-[#F8FAFA] dark:hover:bg-[#13323D]/60 ${
                    isUnread ? 'bg-[#008B8B]/[0.04] dark:bg-[#2DD4BF]/[0.05]' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onOpenConversation(conv.id)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-[#063642] text-white dark:bg-[#13323D]">
                      {!isCourierUser && courier?.photoUrl ? (
                        <img
                          src={courier.photoUrl}
                          alt={counterpartName}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center font-display text-sm font-bold">
                          {getInitials(counterpartName)}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`truncate font-display text-sm text-[#063642] dark:text-white ${
                            isUnread ? 'font-extrabold' : 'font-bold'
                          }`}
                        >
                          {counterpartName}
                        </p>
                        <span
                          className={`shrink-0 text-[11px] tabular-nums ${
                            isUnread
                              ? 'font-bold text-[#EF4444]'
                              : 'text-slate-400'
                          }`}
                        >
                          {formatTimeAR(conv.lastMessageAt)}
                        </span>
                      </div>

                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-xs ${
                            isUnread
                              ? 'font-bold text-[#063642] dark:text-white'
                              : 'text-slate-500 dark:text-slate-300'
                          }`}
                        >
                          {conv.lastMessage}
                        </p>
                        {isUnread && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#EF4444] px-1.5 text-[11px] font-extrabold text-white tabular-nums">
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-[11px]">
                        <span className="font-medium text-slate-400">
                          {getCategoryInfo(conv.courierCategory).label}
                        </span>
                        {latestContract && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                              ·
                            </span>
                            {latestContract.status === 'accepted' && (
                              <span className="inline-flex items-center gap-1 font-semibold text-[#EF4444] dark:text-[#F87171]">
                                <Clock className="h-3 w-3" />
                                En curso
                              </span>
                            )}
                            {latestContract.status === 'proposed' && (
                              <span className="inline-flex items-center gap-1 font-semibold text-[#F5A623]">
                                Propuesta pendiente
                              </span>
                            )}
                            {latestContract.status === 'completed' && (
                              <span className="inline-flex items-center gap-1 font-semibold text-[#16A34A] dark:text-[#4ADE80]">
                                <PackageCheck className="h-3 w-3" />
                                Finalizado
                              </span>
                            )}
                            {latestContract.status === 'cancelled' && (
                              <span className="font-medium text-slate-400">Cancelado</span>
                            )}
                          </>
                        )}
                        {!latestContract && courier && statusMeta && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                              ·
                            </span>
                            <span className={`inline-flex items-center gap-1 font-semibold ${statusMeta.textClass}`}>
                              {courier.availabilityStatus === 'available' && (
                                <CheckCircle2 className="h-3 w-3 text-[#22C55E]" />
                              )}
                              {courier.availabilityStatus === 'busy' && (
                                <Clock className="h-3 w-3 text-[#EF4444]" />
                              )}
                              {courier.availabilityStatus === 'offline' && (
                                <PowerOff className="h-3 w-3 text-[#9CA3AF]" />
                              )}
                              {statusMeta.label}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>

                  {(canQuickAccept || canQuickComplete) && latestContract && (
                    <div className="mt-2.5 flex gap-2 pl-15">
                      {canQuickAccept && onAcceptContract && (
                        <button
                          type="button"
                          disabled={busyContractId === latestContract.id}
                          onClick={() =>
                            handleQuickAction(latestContract.id, () =>
                              onAcceptContract(latestContract.id)
                            )
                          }
                          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#22C55E] px-3 text-xs font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Confirmar servicio</span>
                        </button>
                      )}
                      {canQuickComplete && onCompleteContract && (
                        <button
                          type="button"
                          disabled={busyContractId === latestContract.id}
                          onClick={() =>
                            handleQuickAction(latestContract.id, () =>
                              onCompleteContract(latestContract.id)
                            )
                          }
                          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#008B8B] px-3 text-xs font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
                        >
                          <FileCheck2 className="h-3.5 w-3.5" />
                          <span>Marcar finalizado</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
