import React from 'react';
import {
  Briefcase,
  ChevronRight,
  Heart,
  LogOut,
  ShieldCheck,
  Store,
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
  onOpenMerchantAuthOrPanel: () => void;
  onOpenFavorites: () => void;
  onOpenProfile: () => void;
  onOpenJobs: () => void;
  onLogout: () => Promise<void>;
}

export const UserMenuSheet: React.FC<UserMenuSheetProps> = ({
  open,
  session,
  favoritesCount,
  firebaseConnected,
  onClose,
  onOpenCourierAuthOrPanel,
  onOpenMerchantAuthOrPanel,
  onOpenFavorites,
  onOpenProfile,
  onOpenJobs,
  onLogout,
}) => {
  if (!open) return null;

  const roleLabel =
    session.role === 'courier'
      ? 'Cuenta de repartidor'
      : session.role === 'merchant'
      ? 'Cuenta de comercio'
      : 'Cliente invitado';

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/50 backdrop-blur-xs">
      <div className="relative flex h-full w-full max-w-[430px] flex-col justify-end">
        <div
          className="flex-1"
          onClick={onClose}
          aria-hidden="true"
        />
        <div className="max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" />

          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1A2E4A] text-white">
                <UserCircle2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-base font-bold text-[#1A2E4A]">
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
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProfile();
              }}
              className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-slate-50 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <UserCircle2 className="h-5 w-5 text-[#1A2E4A]" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Mi perfil</p>
                  <p className="text-xs text-slate-500">
                    {session.role === 'client'
                      ? 'Editar tu nickname y ciudad'
                      : 'Administrar tus datos públicos y tarifas'}
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
              className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-slate-50 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-[#FF6B00]" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Mis favoritos ({favoritesCount})
                  </p>
                  <p className="text-xs text-slate-500">
                    Repartidores guardados para volver a contratar
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
              className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-slate-50 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-[#FF6B00]" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {session.role === 'courier'
                      ? 'Mi panel de repartidor'
                      : 'Quiero ofrecer servicios'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {session.role === 'courier'
                      ? 'Gestionar disponibilidad, tarifas y mandados'
                      : 'Registrate o iniciá sesión como repartidor'}
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
              className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-slate-50 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-[#1A2E4A]" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
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
              className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-slate-50 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-slate-700" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Oportunidades laborales</p>
                  <p className="text-xs text-slate-500">
                    Búsquedas publicadas por comercios locales
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
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

            <div className="flex items-start gap-2.5 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1A2E4A]" />
              <div>
                <p className="font-semibold text-[#1A2E4A]">
                  {firebaseConnected
                    ? 'Conectado a Firebase Auth y Cloud Firestore'
                    : 'Modo Demo local activo'}
                </p>
                {!firebaseConnected && (
                  <p className="mt-0.5 leading-relaxed text-slate-500">
                    Tus pruebas se guardan en este dispositivo. Para sincronizar en la nube, pegá tus
                    credenciales en <code className="font-mono text-[11px]">src/firebase/config.ts</code>.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
