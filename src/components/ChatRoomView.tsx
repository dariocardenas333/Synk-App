import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileCheck2,
  Send,
  Star,
  XCircle,
} from 'lucide-react';
import type {
  ChatMessage,
  Contract,
  Conversation,
  CourierPublicProfile,
  CurrentSession,
} from '../types/synk';
import { formatARS, formatDateAR, formatTimeAR } from '../utils/formatters';

interface ChatRoomViewProps {
  session: CurrentSession;
  conversation: Conversation;
  messages: ChatMessage[];
  courier?: CourierPublicProfile;
  contracts: Contract[];
  onBack: () => void;
  onViewCourierProfile: (courierId: string) => void;
  onSendMessage: (text: string) => Promise<void>;
  onProposeContract: (input: {
    description: string;
    agreedPriceArs: number | null;
    modality: 'puntual' | 'recurrente';
  }) => Promise<void>;
  onAcceptContract: (contractId: string, allowDemoSimulation?: boolean) => Promise<void>;
  onCompleteContract: (contractId: string, allowDemoSimulation?: boolean) => Promise<void>;
  onCancelContract: (contractId: string) => Promise<void>;
  onSubmitRating: (contractId: string, score: number, comment: string) => Promise<void>;
  onSimulateDemoReply: (conversationId: string) => Promise<void>;
}

export const ChatRoomView: React.FC<ChatRoomViewProps> = ({
  session,
  conversation,
  messages,
  courier,
  contracts,
  onBack,
  onViewCourierProfile,
  onSendMessage,
  onProposeContract,
  onAcceptContract,
  onCompleteContract,
  onCancelContract,
  onSubmitRating,
  onSimulateDemoReply,
}) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalDesc, setProposalDesc] = useState('');
  const [proposalPrice, setProposalPrice] = useState('');
  const [proposalModality, setProposalModality] = useState<'puntual' | 'recurrente'>('puntual');
  const [actionError, setActionError] = useState<string | null>(null);

  // Rating state
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, contracts.length]);

  const isCourierUser = session.uid === conversation.courierId;
  const counterpartName = isCourierUser ? conversation.clientName : conversation.courierName;
  const isDemoCourier = Boolean(courier?.isDemo);

  const convContracts = contracts
    .filter((c) => c.conversationId === conversation.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const activeOrPendingContract = convContracts.find(
    (c) => c.status === 'proposed' || c.status === 'accepted'
  );
  const unratedCompletedContract = convContracts.find(
    (c) => c.status === 'completed' && !c.rated && c.clientId === session.uid
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setActionError(null);
    try {
      await onSendMessage(text);
      setText('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalDesc.trim()) return;
    setActionError(null);
    try {
      const numPrice = proposalPrice ? Number(proposalPrice) : null;
      await onProposeContract({
        description: proposalDesc,
        agreedPriceArs: numPrice && numPrice > 0 ? numPrice : null,
        modality: proposalModality,
      });
      setProposalDesc('');
      setProposalPrice('');
      setShowProposalForm(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo proponer el mandado.');
    }
  };

  const runContractAction = async (fn: () => Promise<void>) => {
    setActionError(null);
    try {
      await fn();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error procesando la operación.');
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent, contractId: string) => {
    e.preventDefault();
    setSubmittingRating(true);
    setActionError(null);
    try {
      await onSubmitRating(contractId, ratingScore, ratingComment);
      setRatingComment('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo guardar la calificación.');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col bg-slate-50 pb-16">
      {/* Chat Top Subheader */}
      <div className="sticky top-14 z-20 border-b border-slate-200 bg-white px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#1A2E4A] hover:bg-slate-100"
              aria-label="Volver a chats"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => !isCourierUser && onViewCourierProfile(conversation.courierId)}
                className="truncate text-left font-display text-sm font-bold text-[#1A2E4A]"
              >
                {counterpartName}
              </button>
              {courier && (
                <p className="text-[11px] font-medium">
                  <span className={courier.isAvailable ? 'text-[#16A34A]' : 'text-[#DC2626]'}>
                    {courier.isAvailable ? 'Disponible' : 'Ocupado'}
                  </span>
                  <span className="text-slate-400"> · {courier.city}</span>
                </p>
              )}
            </div>
          </div>

          {!isCourierUser && !activeOrPendingContract && courier?.isAvailable && (
            <button
              type="button"
              onClick={() => setShowProposalForm((p) => !p)}
              className="h-9 shrink-0 rounded-lg bg-[#1A2E4A] px-3 text-xs font-bold text-white transition hover:bg-[#132238]"
            >
              {showProposalForm ? 'Cerrar' : 'Acordar mandado'}
            </button>
          )}
        </div>

        {/* Active / Pending Contract Banner */}
        {activeOrPendingContract && (
          <div className="mt-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#1A2E4A]">
                  {activeOrPendingContract.status === 'proposed'
                    ? 'Propuesta de mandado pendiente'
                    : 'Mandado en curso'}
                </p>
                <p className="mt-0.5 text-xs text-slate-600">
                  {activeOrPendingContract.description}
                </p>
                <p className="mt-1 font-mono text-xs font-semibold text-[#1A2E4A] tabular-nums">
                  {formatARS(activeOrPendingContract.agreedPriceArs)} ·{' '}
                  {activeOrPendingContract.modality === 'recurrente' ? 'Recurrente' : 'Puntual'}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                  activeOrPendingContract.status === 'accepted'
                    ? 'bg-[#EF4444]/15 text-[#B91C1C]'
                    : 'bg-[#FF6B00]/15 text-[#C2410C]'
                }`}
              >
                {activeOrPendingContract.status === 'accepted' ? 'En curso' : 'Propuesto'}
              </span>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-2">
              {/* Courier Controls */}
              {isCourierUser && activeOrPendingContract.status === 'proposed' && (
                <button
                  type="button"
                  onClick={() =>
                    runContractAction(() => onAcceptContract(activeOrPendingContract.id, false))
                  }
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#22C55E] px-3 text-xs font-bold text-white transition hover:bg-[#16A34A]"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Aceptar mandado</span>
                </button>
              )}

              {isCourierUser && activeOrPendingContract.status === 'accepted' && (
                <button
                  type="button"
                  onClick={() =>
                    runContractAction(() => onCompleteContract(activeOrPendingContract.id, false))
                  }
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1A2E4A] px-3 text-xs font-bold text-white transition hover:bg-[#132238]"
                >
                  <FileCheck2 className="h-4 w-4" />
                  <span>Mandado completado</span>
                </button>
              )}

              {/* Demo Mode Interactive Tester for Demo Couriers */}
              {!isCourierUser && isDemoCourier && activeOrPendingContract.status === 'proposed' && (
                <button
                  type="button"
                  onClick={() =>
                    runContractAction(() => onAcceptContract(activeOrPendingContract.id, true))
                  }
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#22C55E] px-3 text-xs font-bold text-white"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Simular: Aceptar mandado (Demo)</span>
                </button>
              )}

              {!isCourierUser && isDemoCourier && activeOrPendingContract.status === 'accepted' && (
                <button
                  type="button"
                  onClick={() =>
                    runContractAction(() => onCompleteContract(activeOrPendingContract.id, true))
                  }
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1A2E4A] px-3 text-xs font-bold text-white"
                >
                  <FileCheck2 className="h-4 w-4" />
                  <span>Simular: Mandado completado (Demo)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  runContractAction(() => onCancelContract(activeOrPendingContract.id))
                }
                className="flex h-10 items-center justify-center gap-1 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <XCircle className="h-4 w-4 text-slate-500" />
                <span>Cancelar mandado</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {actionError && (
        <div className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
          {actionError}
        </div>
      )}

      {/* Proposal Form */}
      {showProposalForm && (
        <form
          onSubmit={handlePropose}
          className="mx-4 mt-3 space-y-3 rounded-2xl border border-[#FF6B00]/30 bg-white p-4 shadow-sm"
        >
          <p className="font-display text-sm font-bold text-[#1A2E4A]">
            Proponer mandado a {conversation.courierName}
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Detalle del envío o trámite
            </label>
            <textarea
              required
              rows={2}
              value={proposalDesc}
              onChange={(e) => setProposalDesc(e.target.value)}
              placeholder="Ej: Retirar sobre en Av. Fontana 240 y entregar en Barrio Pueblo de Luis."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-[#FF6B00] focus:bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Precio acordado (ARS)
              </label>
              <input
                type="number"
                min={0}
                step={100}
                value={proposalPrice}
                onChange={(e) => setProposalPrice(e.target.value)}
                placeholder="Opcional"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 outline-none focus:border-[#FF6B00] focus:bg-white tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Modalidad</label>
              <select
                value={proposalModality}
                onChange={(e) => setProposalModality(e.target.value as 'puntual' | 'recurrente')}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-900 outline-none focus:border-[#FF6B00]"
              >
                <option value="puntual">Puntual</option>
                <option value="recurrente">Recurrente</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-[#FF6B00] text-xs font-bold text-white"
          >
            Enviar propuesta de mandado
          </button>
        </form>
      )}

      {/* Messages Feed */}
      <div className="flex-1 space-y-3 p-4">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
            Escribí qué necesitás enviar, consultá el precio y coordiná los detalles acá.
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.senderId === session.uid;
          if (msg.messageType === 'contract_status' || msg.messageType === 'contract_proposal') {
            return (
              <div
                key={msg.id}
                className="mx-auto max-w-[92%] rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-center shadow-2xs"
              >
                <p className="text-xs font-semibold text-[#1A2E4A]">{msg.text}</p>
                <p className="mt-1 text-[10px] text-slate-400 tabular-nums">
                  {formatDateAR(msg.createdAt)}
                </p>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  isMine
                    ? 'rounded-br-sm bg-[#1A2E4A] text-white'
                    : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'
                }`}
              >
                <p>{msg.text}</p>
                <p
                  className={`mt-1 text-right text-[10px] tabular-nums ${
                    isMine ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {formatTimeAR(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        {/* Verified Rating Card after completed contract */}
        {unratedCompletedContract && (
          <form
            onSubmit={(e) => handleRatingSubmit(e, unratedCompletedContract.id)}
            className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
              <h3 className="font-display text-sm font-bold text-[#1A2E4A]">
                Calificá a {unratedCompletedContract.courierName}
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Tu mandado figura como completado. Dejá tu valoración verificada.
            </p>

            <div className="mt-3 flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingScore(star)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 transition hover:bg-amber-50"
                  aria-label={`${star} estrellas`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= ratingScore
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Contá cómo fue la puntualidad y atención (opcional)"
              className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-[#FF6B00] focus:bg-white"
            />

            <button
              type="submit"
              disabled={submittingRating}
              className="mt-3 h-11 w-full rounded-xl bg-[#FF6B00] text-xs font-bold text-white disabled:opacity-60"
            >
              {submittingRating ? 'Guardando...' : 'Enviar valoración'}
            </button>
          </form>
        )}

        {!isCourierUser && isDemoCourier && !activeOrPendingContract && (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => onSimulateDemoReply(conversation.id)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
            >
              Simular respuesta del repartidor (Demo)
            </button>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-16 z-20 flex items-center gap-2 border-t border-slate-200 bg-white px-3 py-2.5"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribí tu mensaje..."
          className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none focus:border-[#FF6B00] focus:bg-white"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF6B00] text-white transition active:scale-95 disabled:opacity-50"
          aria-label="Enviar mensaje"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
