import React, { useState } from 'react';
import { CheckCircle2, LogOut, MailCheck, RefreshCw, Send } from 'lucide-react';

interface EmailVerificationViewProps {
  email?: string;
  onCheckVerified: () => Promise<boolean>;
  onResendEmail: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export const EmailVerificationView: React.FC<EmailVerificationViewProps> = ({
  email,
  onCheckVerified,
  onResendEmail,
  onLogout,
}) => {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    setChecking(true);
    setFeedback(null);
    setError(null);
    try {
      const verified = await onCheckVerified();
      if (!verified) {
        setError(
          'Tu correo todavía figura sin confirmar. Hacé clic en el enlace que te enviamos y volvé a presionar Actualizar.'
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No pudimos verificar el estado de tu correo.'
      );
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setFeedback(null);
    setError(null);
    try {
      await onResendEmail();
      setFeedback('Reenviamos el correo de confirmación. Revisá tu bandeja de entrada o spam.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Esperá unos instantes antes de volver a reenviar el correo.'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col justify-center bg-[#F8FAFA] p-5 dark:bg-[#07181E]">
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 text-center shadow-sm dark:border-[#1E4452] dark:bg-[#0D252E]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#008B8B]/12 text-[#008B8B] dark:bg-[#008B8B]/20 dark:text-[#2DD4BF]">
          <MailCheck className="h-8 w-8" />
        </div>

        <h1 className="mt-4 font-display text-xl font-extrabold text-[#063642] dark:text-white">
          Confirmá tu correo para activar tu cuenta
        </h1>

        {email && (
          <p className="mt-2 inline-block rounded-lg bg-[#F8FAFA] px-3 py-1 font-mono text-xs font-semibold text-[#008B8B] dark:bg-[#13323D] dark:text-[#2DD4BF]">
            {email}
          </p>
        )}

        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Te enviamos un correo de confirmación a tu Gmail. Revisá tu bandeja de entrada o spam y
          hacé clic en el enlace para activar tu cuenta
        </p>

        {feedback && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-left text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-xs font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </div>
        )}

        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#008B8B] px-4 text-sm font-bold text-white transition hover:bg-[#007676] active:scale-[0.98] disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Verificando...' : 'Ya confirmé mi correo (Actualizar)'}</span>
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-4 text-xs font-bold text-[#063642] transition hover:border-[#008B8B] disabled:opacity-60 dark:border-[#1E4452] dark:bg-[#13323D] dark:text-slate-100 dark:hover:border-[#2DD4BF]"
          >
            <Send className="h-3.5 w-3.5 text-[#008B8B] dark:text-[#2DD4BF]" />
            <span>{resending ? 'Reenviando...' : 'Reenviar correo'}</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="mt-2 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-[#13323D] dark:hover:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
