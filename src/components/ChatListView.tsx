import React from 'react';
import { CheckCircle2, Clock, MessageSquare, PackageCheck } from 'lucide-react';
import type { Contract, Conversation, CourierPublicProfile, CurrentSession } from '../types/synk';
import { CATEGORY_INFO, formatTimeAR, getInitials } from '../utils/formatters';

interface ChatListViewProps {
  session: CurrentSession;
  conversations: Conversation[];
  contracts: Contract[];
  couriers: CourierPublicProfile[];
  onOpenConversation: (conversationId: string) => void;
  onGoSearch: () => void;
}

export const ChatListView: React.FC<ChatListViewProps> = ({
  session,
  conversations,
  contracts,
  couriers,
  onOpenConversation,
  onGoSearch,
}) => {
  return (
    <div className="pb-24">
      <div className="border-b border-slate-100 bg-white px-4 pb-3 pt-3">
        <h1 className="font-display text-lg font-extrabold text-[#1A2E4A]">
          Conversaciones y mandados
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Acordá condiciones y tarifas directo por chat privado.
        </p>
      </div>

      <div className="p-4">
        {conversations.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A2E4A]/10 text-[#1A2E4A]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-bold text-[#1A2E4A]">
              Todavía no tenés conversaciones
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Elegí un repartidor disponible, revisá sus tarifas e iniciá un chat para coordinar tu
              mandado.
            </p>
            <button
              type="button"
              onClick={onGoSearch}
              className="mt-4 h-11 rounded-xl bg-[#FF6B00] px-5 text-xs font-bold text-white"
            >
              Buscar repartidores
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {conversations.map((conv) => {
              const isCourierUser = session.uid === conv.courierId;
              const counterpartName = isCourierUser ? conv.clientName : conv.courierName;
              const courier = couriers.find((c) => c.id === conv.courierId);
              const latestContract = contracts.find((ct) => ct.conversationId === conv.id);

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => onOpenConversation(conv.id)}
                  className="flex w-full items-center gap-3 p-3.5 text-left transition hover:bg-slate-50 active:bg-slate-100"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-[#1A2E4A] text-white">
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
                      <p className="truncate font-display text-sm font-bold text-[#1A2E4A]">
                        {counterpartName}
                      </p>
                      <span className="shrink-0 text-[11px] text-slate-400 tabular-nums">
                        {formatTimeAR(conv.lastMessageAt)}
                      </span>
                    </div>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {conv.lastMessage}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-[11px]">
                      <span className="font-medium text-slate-400">
                        {CATEGORY_INFO[conv.courierCategory]?.label || 'Mandado'}
                      </span>
                      {latestContract && (
                        <>
                          <span className="text-slate-300" aria-hidden="true">
                            ·
                          </span>
                          {latestContract.status === 'accepted' && (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#EF4444]">
                              <Clock className="h-3 w-3" />
                              Mandado en curso
                            </span>
                          )}
                          {latestContract.status === 'proposed' && (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#FF6B00]">
                              Propuesta pendiente
                            </span>
                          )}
                          {latestContract.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#16A34A]">
                              <PackageCheck className="h-3 w-3" />
                              Completado
                            </span>
                          )}
                          {latestContract.status === 'cancelled' && (
                            <span className="font-medium text-slate-400">Cancelado</span>
                          )}
                        </>
                      )}
                      {!latestContract && courier && (
                        <>
                          <span className="text-slate-300" aria-hidden="true">
                            ·
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              courier.isAvailable ? 'text-[#16A34A]' : 'text-[#DC2626]'
                            }`}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {courier.isAvailable ? 'Disponible' : 'Ocupado'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
