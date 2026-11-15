import React from 'react';
import {
  Briefcase,
  ChevronRight,
  Eye,
  Heart,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Store,
  Tags,
  Trophy,
  Truck,
  UserCircle2,
  X,
} from 'lucide-react';
import type { CurrentSession } from '../types/synk';
import { PWAInstallButton } from './PWAInstallButton';

interface UserMenuSheetProps {
  open: boolean;
  session: CurrentSession;
  favoritesCount: number;
  firebaseConnected: boolean;
  onClose: () => void;
  onOpenCourierAuthOrPanel: () => void;
  onOpenCourierServices: () => void;
  onOpenPublicPreview: () => void;
  onOpenMerchantAuthOrPanel: () => void;
  onOpenFavorites: () => void;
  onOpenProfile: () => void;
  onOpenJobs: () => void;
  onOpenRanking: () => void;
  onLogout: () => Promise<void>;
}

export const UserMenuSheet: React.FC<UserMenuSheetProps> = ({
  open,
  session,
  favoritesCount,
  firebaseConnected,
  onClose,
  onOpenCourierAuthOrPanel,
  onOpenCourierServices,
  onOpenPublicPreview,
  onOpenMerchantAuthOrPanel,
  onOpenFavorites,
  onOpenProfile,
  onOpenJobs,
  onOpenRanking,
  onLogout,
}) => {
  if (!open) return null;

  const isProvider = session.role === 'courier';

  const roleLabel = isProvider
    ? 'Prestador · Modo Trabajo'
    : session.role === 'merchant'
    ? 'Cuenta de comercio'
    : 'Cliente invitado';

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/50 backdrop-blur-xs">
      <div className="relative flex h-full w-full max-w-[430px] flex-col justify-end">
        <div className="flex-1" onClick={onClose} aria-hidden="true" />
        <div className="max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" />

          <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#063642] text-white">
                <UserCircle2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-base font-bold text-[#063642]">
                  {session.displayName}
                </p>
                <p className="text-xs text-slate-500">
                  {roleLabel} · {session.city}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-[#F8FAFA]"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {isProvider ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCourierAuthOrPanel();
                  }}
                  className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="h-5 w-5 text-[#063642]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063642]">Mi Panel de Jornada</p>
                      <p className="text-xs text-slate-500">
                        Controlar estado Disponible / Ocupado / Desconectado
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCourierServices();
                  }}
                  className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <Tags className="h-5 w-5 text-[#008B8B]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063642]">
                        Mis Servicios y Tarifas
                      </p>
                      <p className="text-xs text-slate-500">
                        14 rubros, precios personalizados, foto y horarios
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRanking();
                  }}
                  className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-[#F5A623]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063642]">Ranking AlaMano</p>
                      <p className="text-xs text-slate-500">
                        +10 pts por trabajo · +5 pts por 5 estrellas
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPublicPreview();
                  }}
                  className="flex w-full items-center justify-between py-3 text-left text-slate-600 transition hover:bg-[#F8FAFA] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <Eye className="h-4 w-4 text-[#008B8B]" />
                    <div>
                      <p className="text-xs font-semibold text-[#063642]">
                        Ver cómo me ven los clientes
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Vista previa de tu perfil público en modo lectura
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenProfile();
                  }}
                  className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <UserCircle2 className="h-5 w-5 text-[#063642]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063642]">Mi perfil</p>
                      <p className="text-xs text-slate-500">
                        {session.role === 'client'
                          ? 'Editar tu nickname y ciudad'
                          : 'Administrar perfil de comercio'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFavorites();
                  }}
                  className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-[#008B8B]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063642]">
                        Mis favoritos ({favoritesCount})
                      </p>
                      <p className="text-xs text-slate-500">
                        Prestadores guardados para volver a contactar
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCourierAuthOrPanel();
                  }}
                  className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-[#008B8B]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063642]">Ofrezco servicios</p>
                      <p className="text-xs text-slate-500">
                        Registrate o iniciá sesión para activar Modo Trabajo
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMerchantAuthOrPanel();
                  }}
                  className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <Store className="h-5 w-5 text-[#063642]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063642]">
                        {session.role === 'merchant' ? 'Mi panel de comercio' : 'Soy un comercio'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {session.role === 'merchant'
                          ? 'Administrar local, recontratar y publicar búsquedas'
                          : 'Cuenta comercial para envíos puntuales o recurrentes'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenJobs();
                  }}
                  className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-[#F5A623]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063642]">Oportunidades laborales</p>
                      <p className="text-xs text-slate-500">
                        Búsquedas publicadas por comercios locales
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <PWAInstallButton />

            {!session.isAnonymous && (
              <button
                type="button"
                onClick={async () => {
                  await onLogout();
                  onClose();
                }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión y volver a cliente</span>
              </button>
            )}

            <div className="flex items-start gap-2.5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFA] p-3 text-xs text-slate-600">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#008B8B]" />
              <p className="font-semibold text-[#063642]">
                {firebaseConnected
                  ? 'AlaMano · Sincronizado en tiempo real con Firebase'
                  : 'AlaMano · Almacenamiento local activo'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
