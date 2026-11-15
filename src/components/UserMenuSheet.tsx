import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  Briefcase,
  Check,
  ChevronRight,
  Copy,
  Eye,
  Heart,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Moon,
  ShieldCheck,
  Store,
  Sun,
  Tags,
  Trophy,
  Truck,
  UserCircle2,
  X,
} from 'lucide-react';
import type { CurrentSession } from '../types/synk';
import type { AppNotificationPermission } from '../utils/notifications';
import { PWAInstallButton } from './PWAInstallButton';

interface UserMenuSheetProps {
  open: boolean;
  session: CurrentSession;
  favoritesCount: number;
  firebaseConnected: boolean;
  isDark: boolean;
  notificationPermission: AppNotificationPermission;
  onRequestNotifications: () => Promise<void>;
  onToggleTheme: () => void;
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
  isDark,
  notificationPermission,
  onRequestNotifications,
  onToggleTheme,
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
  const [copiedCode, setCopiedCode] = useState(false);

  if (!open) return null;

  const isProvider = session.role === 'courier';

  const roleLabel = isProvider
    ? 'Prestador · Modo Trabajo'
    : session.role === 'merchant'
    ? 'Cuenta de comercio'
    : 'Cliente invitado';

  const handleCopyCode = async () => {
    if (!session.recoveryCode) return;
    try {
      await navigator.clipboard.writeText(session.recoveryCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      setCopiedCode(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/50 backdrop-blur-xs">
      <div className="relative flex h-full w-full max-w-[430px] flex-col justify-end">
        <div className="flex-1" onClick={onClose} aria-hidden="true" />
        <div className="max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl dark:border-t dark:border-[#1E4452] dark:bg-[#0D252E]">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 dark:bg-[#1E4452]" />

          <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4 dark:border-[#1E4452]">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#063642] text-white dark:bg-[#13323D]">
                <UserCircle2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-base font-bold text-[#063642] dark:text-white">
                  {session.displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {roleLabel} · {session.city}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-[#F8FAFA] dark:text-slate-400 dark:hover:bg-[#13323D]"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Client Recovery Code Quick Card */}
          {session.role === 'client' && session.recoveryCode && (
            <div className="mt-4 rounded-2xl border border-[#008B8B]/30 bg-[#F8FAFA] p-3.5 dark:border-[#2DD4BF]/30 dark:bg-[#13323D]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-[#008B8B] dark:text-[#2DD4BF]" />
                  <span className="text-xs font-bold text-[#063642] dark:text-white">
                    Código de recuperación
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#063642] px-2.5 text-[11px] font-bold text-white transition active:scale-95 dark:bg-[#008B8B]"
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar código</span>
                    </>
                  )}
                </button>
              </div>
              <p className="mt-1.5 font-mono text-base font-extrabold tracking-widest text-[#008B8B] dark:text-[#2DD4BF]">
                {session.recoveryCode}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-slate-600 dark:text-slate-300">
                Guardá este código para recuperar tus chats y favoritos si cambiás de celular o
                borrás el historial.
              </p>
            </div>
          )}

          <div className="mt-4 divide-y divide-slate-100 dark:divide-[#1E4452]">
            {/* Dark/Light Theme Switch Row */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99] dark:hover:bg-[#13323D]/60"
            >
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Sun className="h-5 w-5 text-[#F5A623]" />
                ) : (
                  <Moon className="h-5 w-5 text-[#063642]" />
                )}
                <div>
                  <p className="text-sm font-semibold text-[#063642] dark:text-white">
                    Apariencia: {isDark ? 'Modo oscuro' : 'Modo claro'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tocá para cambiar a {isDark ? 'modo claro' : 'modo oscuro'}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
                  isDark ? 'bg-[#008B8B]' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    isDark ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>

            {/* Notifications Status / Permission Row */}
            {notificationPermission !== 'unsupported' && (
              <button
                type="button"
                onClick={onRequestNotifications}
                disabled={notificationPermission === 'granted'}
                className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99] disabled:opacity-90 dark:hover:bg-[#13323D]/60"
              >
                <div className="flex items-center gap-3">
                  {notificationPermission === 'granted' ? (
                    <Bell className="h-5 w-5 text-[#22C55E]" />
                  ) : (
                    <BellOff className="h-5 w-5 text-[#F5A623]" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-[#063642] dark:text-white">
                      Notificaciones:{' '}
                      {notificationPermission === 'granted'
                        ? 'Activadas'
                        : notificationPermission === 'denied'
                        ? 'Bloqueadas en navegador'
                        : 'Desactivadas'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {notificationPermission === 'granted'
                        ? 'Recibirás alertas de mensajes incluso en segundo plano'
                        : notificationPermission === 'denied'
                        ? 'Habilitalas desde la configuración del sitio en tu navegador'
                        : 'Tocá para activar alertas con sonido y vibración'}
                    </p>
                  </div>
                </div>
                {notificationPermission === 'default' && (
                  <span className="shrink-0 rounded-lg bg-[#008B8B] px-2.5 py-1 text-[11px] font-bold text-white">
                    Activar
                  </span>
                )}
              </button>
            )}

            {isProvider ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCourierAuthOrPanel();
                  }}
                  className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99] dark:hover:bg-[#13323D]/60"
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="h-5 w-5 text-[#063642] dark:text-[#2DD4BF]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063642] dark:text-white">
                        Mi Panel de Jornada
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
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
                  className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99] dark:hover:bg-[#13323D]/60"
                >
                  <div className="flex items-center gap-3">
                    <Tags className="h-5 w-5 text-[#008B8B] dark:text-[#2DD4BF]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063642] dark:text-white">
                        Mis Servicios y Tarifas
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
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
                  className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99] dark:hover:bg-[#13323D]/60"
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-[#F5A623]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063642] dark:text-white">
                        Ranking AlaMano
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
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
                  className="flex w-full items-center justify-between py-3 text-left text-slate-600 transition hover:bg-[#F8FAFA] active:scale-[0.99] dark:text-slate-300 dark:hover:bg-[#13323D]/60"
                >
                  <div className="flex items-center gap-3">
                    <Eye className="h-4 w-4 text-[#008B8B] dark:text-[#2DD4BF]" />
                    <div>
                      <p className="text-xs font-semibold text-[#063642] dark:text-white">
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
                  className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99] dark:hover:bg-[#13323D]/60"
                >
                  <div className="flex items-center gap-3">
                    <UserCircle2 className="h-5 w-5 text-[#063642] dark:text-[#2DD4BF]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063642] dark:text-white">
                        Mi perfil
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {session.role === 'client'
                          ? 'Editar nickname, ciudad y código de recuperación'
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
                  className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99] dark:hover:bg-[#13323D]/60"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-[#008B8B] dark:text-[#2DD4BF]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063642] dark:text-white">
                        Mis favoritos ({favoritesCount})
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
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
                  className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99] dark:hover:bg-[#13323D]/60"
                >
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-[#008B8B] dark:text-[#2DD4BF]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063642] dark:text-white">
                        Ofrezco servicios
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
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
                  className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99] dark:hover:bg-[#13323D]/60"
                >
                  <div className="flex items-center gap-3">
                    <Store className="h-5 w-5 text-[#063642] dark:text-[#2DD4BF]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063642] dark:text-white">
                        {session.role === 'merchant' ? 'Mi panel de comercio' : 'Soy un comercio'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
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
                  className="flex w-full items-center justify-between py-3.5 text-left transition hover:bg-[#F8FAFA] active:scale-[0.99] dark:hover:bg-[#13323D]/60"
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-[#F5A623]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063642] dark:text-white">
                        Oportunidades laborales
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
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
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión y volver a cliente</span>
              </button>
            )}

            <div className="flex items-start gap-2.5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFA] p-3 text-xs text-slate-600 dark:border-[#1E4452] dark:bg-[#13323D] dark:text-slate-300">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#008B8B] dark:text-[#2DD4BF]" />
              <p className="font-semibold text-[#063642] dark:text-white">
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
