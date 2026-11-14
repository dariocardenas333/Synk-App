import React from 'react';
import { ArrowRight, Briefcase, CheckCircle2, ChevronRight, Clock } from 'lucide-react';
import type {
  Contract,
  CourierPublicProfile,
  CurrentSession,
  ServiceCategory,
} from '../types/synk';
import { CATEGORY_INFO } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface HomeViewProps {
  session: CurrentSession;
  couriers: CourierPublicProfile[];
  activeContracts: Contract[];
  onSelectCategory: (category: ServiceCategory) => void;
  onOpenChat: (conversationId: string) => void;
  onOpenCourierDashboard: () => void;
  onOpenJobs: () => void;
}

const ORDERED_CATEGORIES: ServiceCategory[] = [
  'motomandado',
  'bicimandado',
  'automandado',
  'flete',
];

export const HomeView: React.FC<HomeViewProps> = ({
  session,
  couriers,
  activeContracts,
  onSelectCategory,
  onOpenChat,
  onOpenCourierDashboard,
  onOpenJobs,
}) => {
  const cityCouriers = couriers.filter((c) => c.city === session.city);
  const myCourierProfile =
    session.role === 'courier' ? couriers.find((c) => c.id === session.uid) : undefined;

  return (
    <div className="pb-24">
      {/* Courier Quick Status Bar when logged in as Courier */}
      {myCourierProfile && (
        <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[#1A2E4A] p-3.5 text-white">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold">
              Hola, {myCourierProfile.publicName}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs">
              {myCourierProfile.isAvailable ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />
                  <span className="text-emerald-300">Estás Disponible</span>
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5 text-[#EF4444]" />
                  <span className="text-red-300">Estás Ocupado</span>
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCourierDashboard}
            className="flex h-10 shrink-0 items-center gap-1 rounded-xl bg-[#FF6B00] px-3 text-xs font-bold text-white"
          >
            <span>Mi panel</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Hero Title */}
      <section className="px-4 pb-2 pt-5">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#1A2E4A] text-balance">
          Encontrá tu repartidor
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          Elegí el servicio que necesitás y encontrá personas disponibles
        </p>
      </section>

      {/* Active Contracts Quick Strip */}
      {activeContracts.length > 0 && (
        <section className="px-4 pt-3">
          {activeContracts.slice(0, 1).map((ct) => (
            <button
              key={ct.id}
              type="button"
              onClick={() => onOpenChat(ct.conversationId)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#FF6B00]/30 bg-[#FF6B00]/5 p-3.5 text-left transition hover:bg-[#FF6B00]/10"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#FF6B00]">
                  {ct.status === 'accepted' ? 'Mandado en curso' : 'Propuesta pendiente'}
                </p>
                <p className="truncate text-sm font-bold text-[#1A2E4A]">
                  {session.uid === ct.courierId ? ct.clientName : ct.courierName} · {ct.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#FF6B00]" />
            </button>
          ))}
        </section>
      )}

      {/* 4 Main Categories Grid */}
      <section className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          {ORDERED_CATEGORIES.map((catId) => {
            const info = CATEGORY_INFO[catId];
            const availCount = cityCouriers.filter(
              (c) => c.serviceCategory === catId && c.isAvailable
            ).length;
            const totalCount = cityCouriers.filter((c) => c.serviceCategory === catId).length;

            return (
              <button
                key={catId}
                type="button"
                onClick={() => onSelectCategory(catId)}
                className="group flex flex-col items-start justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xs transition hover:border-[#FF6B00]/50 active:scale-[0.98]"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] transition group-hover:bg-[#FF6B00] group-hover:text-white">
                    <CategoryIcon category={catId} className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#FF6B00]" />
                </div>

                <div className="mt-3.5">
                  <h2 className="font-display text-base font-bold text-[#1A2E4A]">
                    {info.label}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                    {availCount > 0 ? (
                      <span className="font-semibold text-[#16A34A]">
                        {availCount} {availCount === 1 ? 'disponible' : 'disponibles'}
                      </span>
                    ) : (
                      <span>{totalCount} en {session.city}</span>
                    )}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Job Opportunities Shortcut */}
      <section className="px-4 pt-6">
        <button
          type="button"
          onClick={onOpenJobs}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1A2E4A] text-white">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-[#1A2E4A]">
                Oportunidades laborales
              </p>
              <p className="truncate text-xs text-slate-500">
                Comercios que buscan repartidores por turno o fijos
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </section>
    </div>
  );
};
