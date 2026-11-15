import React from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationPermissionBannerProps {
  visible: boolean;
  isProvider: boolean;
  onEnable: () => Promise<void>;
  onDismiss: () => void;
}

export const NotificationPermissionBanner: React.FC<NotificationPermissionBannerProps> = ({
  visible,
  isProvider,
  onEnable,
  onDismiss,
}) => {
  if (!visible) return null;

  return (
    <div className="mx-4 mt-3 rounded-2xl border border-[#008B8B]/30 bg-white p-3.5 shadow-xs dark:border-[#2DD4BF]/30 dark:bg-[#0D252E]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#008B8B]/12 text-[#008B8B] dark:bg-[#008B8B]/25 dark:text-[#2DD4BF]">
          <Bell className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xs font-extrabold text-[#063642] dark:text-white">
            Activá las notificaciones en tiempo real
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-600 dark:text-slate-300">
            {isProvider
              ? 'Enterate al instante cuando un cliente te escriba o envíe un pedido, incluso con la app minimizada.'
              : 'Enterate al instante cuando un prestador te responda o confirme tu pedido, incluso con la app minimizada.'}
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={onEnable}
              className="h-8 rounded-lg bg-[#008B8B] px-3 text-[11px] font-bold text-white transition hover:bg-[#007676] active:scale-95"
            >
              Activar alertas
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="h-8 rounded-lg px-2.5 text-[11px] font-semibold text-slate-500 hover:bg-[#F8FAFA] dark:text-slate-400 dark:hover:bg-[#13323D]"
            >
              Ahora no
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-[#F8FAFA] dark:hover:bg-[#13323D]"
          aria-label="Cerrar aviso de notificaciones"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
