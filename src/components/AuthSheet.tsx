import React, { useState } from 'react';
import { ArrowLeft, Check, Store, Truck } from 'lucide-react';
import type {
  CourierRegistrationInput,
  MerchantRegistrationInput,
} from '../services/synkStore';
import type { CityName, ServiceCategory } from '../types/synk';
import { CATEGORY_GROUPS, CITIES, MERCHANT_CATEGORIES, getCategoryInfo } from '../utils/formatters';

interface AuthSheetProps {
  initialType: 'courier' | 'merchant';
  defaultCity: CityName;
  onBack: () => void;
  onRegisterCourier: (input: CourierRegistrationInput) => Promise<void>;
  onRegisterMerchant: (input: MerchantRegistrationInput) => Promise<void>;
  onLogin: (email: string, password: string) => Promise<'courier' | 'merchant'>;
  onResetPassword: (email: string) => Promise<void>;
  onSuccessNavigate: (role: 'courier' | 'merchant') => void;
}

export const AuthSheet: React.FC<AuthSheetProps> = ({
  initialType,
  defaultCity,
  onBack,
  onRegisterCourier,
  onRegisterMerchant,
  onLogin,
  onResetPassword,
  onSuccessNavigate,
}) => {
  const [accountType, setAccountType] = useState<'courier' | 'merchant'>(initialType);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login & reset password state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showResetBox, setShowResetBox] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // Courier register state
  const [cFirstName, setCFirstName] = useState('');
  const [cLastName, setCLastName] = useState('');
  const [cPublicName, setCPublicName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [cCategories, setCCategories] = useState<ServiceCategory[]>(['motomandado']);
  const [cVehicle, setCVehicle] = useState('');
  const [cCity, setCCity] = useState<CityName>(defaultCity);
  const [cWorkZone, setCWorkZone] = useState('');
  const [cDescription, setCDescription] = useState('');

  // Merchant register state
  const [mBusinessName, setMBusinessName] = useState('');
  const [mOwnerName, setMOwnerName] = useState('');
  const [mPhone, setMPhone] = useState('');
  const [mEmail, setMEmail] = useState('');
  const [mPassword, setMPassword] = useState('');
  const [mAddress, setMAddress] = useState('');
  const [mCity, setMCity] = useState<CityName>(defaultCity);
  const [mCategory, setMCategory] = useState(MERCHANT_CATEGORIES[0]);

  const toggleCourierCategory = (catId: ServiceCategory) => {
    setCCategories((prev) => {
      if (prev.includes(catId)) {
        return prev.length > 1 ? prev.filter((c) => c !== catId) : prev;
      }
      return [...prev, catId];
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccessMsg(null);
    setLoading(true);
    try {
      const role = await onLogin(loginEmail, loginPassword);
      onSuccessNavigate(role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = (resetEmail || loginEmail).trim();
    if (!targetEmail) {
      setError('Ingresá tu correo electrónico para recuperar la contraseña.');
      return;
    }
    setError(null);
    setResetSuccessMsg(null);
    setResetSending(true);
    try {
      await onResetPassword(targetEmail);
      setResetSuccessMsg(
        `Te enviamos un correo de recuperación a ${targetEmail}. Revisá tu bandeja de entrada o spam para restablecer tu contraseña.`
      );
      setShowResetBox(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el correo de recuperación.');
    } finally {
      setResetSending(false);
    }
  };

  const handleRegisterCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (cPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (cCategories.length === 0) {
      setError('Seleccioná al menos un rubro o categoría de servicio.');
      return;
    }
    setLoading(true);
    try {
      await onRegisterCourier({
        firstName: cFirstName,
        lastName: cLastName,
        publicName: cPublicName,
        phone: cPhone,
        email: cEmail,
        password: cPassword,
        serviceCategory: cCategories[0],
        serviceCategories: cCategories,
        vehicle: cVehicle,
        city: cCity,
        workZone: cWorkZone,
        description: cDescription,
      });
      onSuccessNavigate('courier');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await onRegisterMerchant({
        businessName: mBusinessName,
        ownerName: mOwnerName,
        phone: mPhone,
        email: mEmail,
        password: mPassword,
        address: mAddress,
        city: mCity,
        category: mCategory,
      });
      onSuccessNavigate('merchant');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el comercio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFA] pb-24 dark:bg-[#07181E]">
      <div className="sticky top-14 z-20 flex items-center gap-2 border-b border-[#E2E8F0] bg-white/95 px-4 py-2.5 backdrop-blur-md dark:border-[#1E4452] dark:bg-[#0D252E]/95">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 items-center gap-1.5 pr-2 text-sm font-semibold text-[#063642] dark:text-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver</span>
        </button>
        <h1 className="font-display text-base font-bold text-[#063642] dark:text-white">
          {accountType === 'courier' ? 'Ofrezco Servicios' : 'Acceso Comercios'}
        </h1>
      </div>

      <div className="p-4">
        {/* Account Type Selector */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#E2E8F0] bg-white p-1 dark:border-[#1E4452] dark:bg-[#0D252E]">
          <button
            type="button"
            onClick={() => {
              setAccountType('courier');
              setError(null);
              setResetSuccessMsg(null);
            }}
            className={`flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold transition ${
              accountType === 'courier'
                ? 'bg-[#008B8B] text-white shadow-xs'
                : 'text-slate-600 hover:bg-[#F8FAFA] dark:text-slate-300 dark:hover:bg-[#13323D]'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Prestador</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAccountType('merchant');
              setError(null);
              setResetSuccessMsg(null);
            }}
            className={`flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold transition ${
              accountType === 'merchant'
                ? 'bg-[#063642] text-white shadow-xs dark:bg-[#13323D] dark:text-[#2DD4BF]'
                : 'text-slate-600 hover:bg-[#F8FAFA] dark:text-slate-300 dark:hover:bg-[#13323D]'
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Comercio</span>
          </button>
        </div>

        {/* Register / Login Toggle */}
        <div className="mt-4 flex items-center justify-center gap-6 border-b border-[#E2E8F0] dark:border-[#1E4452]">
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setError(null);
              setResetSuccessMsg(null);
              setShowResetBox(false);
            }}
            className={`border-b-2 pb-2.5 text-sm font-bold transition ${
              authMode === 'register'
                ? 'border-[#008B8B] text-[#063642] dark:border-[#2DD4BF] dark:text-white'
                : 'border-transparent text-slate-400 dark:text-slate-500'
            }`}
          >
            Crear cuenta
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError(null);
            }}
            className={`border-b-2 pb-2.5 text-sm font-bold transition ${
              authMode === 'login'
                ? 'border-[#008B8B] text-[#063642] dark:border-[#2DD4BF] dark:text-white'
                : 'border-transparent text-slate-400 dark:text-slate-500'
            }`}
          >
            Iniciar sesión
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {resetSuccessMsg && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            {resetSuccessMsg}
          </div>
        )}

        {authMode === 'login' ? (
          <div className="mt-5 space-y-4">
            {!showResetBox ? (
              <form
                onSubmit={handleLogin}
                className="space-y-4 rounded-3xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#1E4452] dark:bg-[#0D252E]"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nombre@ejemplo.com"
                    className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3.5 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(loginEmail);
                        setShowResetBox(true);
                        setError(null);
                        setResetSuccessMsg(null);
                      }}
                      className="text-xs font-semibold text-[#008B8B] hover:underline dark:text-[#2DD4BF]"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3.5 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-[#063642] text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60 dark:bg-[#008B8B] dark:hover:bg-[#007676]"
                >
                  {loading ? 'Ingresando...' : 'Iniciar sesión'}
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleSendPasswordReset}
                className="space-y-3.5 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#1E4452] dark:bg-[#0D252E]"
              >
                <div>
                  <h2 className="font-display text-sm font-bold text-[#063642] dark:text-white">
                    Recuperar contraseña
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Ingresá el correo con el que te registraste y te enviaremos un enlace para
                    restablecer tu contraseña.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3.5 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetBox(false);
                      setError(null);
                    }}
                    className="h-11 flex-1 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-slate-600 dark:border-[#1E4452] dark:bg-[#13323D] dark:text-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resetSending}
                    className="h-11 flex-1 rounded-xl bg-[#008B8B] text-xs font-bold text-white disabled:opacity-60"
                  >
                    {resetSending ? 'Enviando...' : 'Enviar correo'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : accountType === 'courier' ? (
          <form
            onSubmit={handleRegisterCourier}
            className="mt-5 space-y-3.5 rounded-3xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#1E4452] dark:bg-[#0D252E]"
          >
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Creá tu perfil público en AlaMano. Luego podrás subir tu foto, configurar tarifas y
              activar tu jornada laboral.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={cFirstName}
                  onChange={(e) => setCFirstName(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                  Apellido
                </label>
                <input
                  type="text"
                  required
                  value={cLastName}
                  onChange={(e) => setCLastName(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                Nickname o nombre público
              </label>
              <input
                type="text"
                required
                value={cPublicName}
                onChange={(e) => setCPublicName(e.target.value)}
                placeholder="Ej: Juan Moto Trelew"
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                  Teléfono
                </label>
                <input
                  type="tel"
                  required
                  value={cPhone}
                  onChange={(e) => setCPhone(e.target.value)}
                  placeholder="280 4..."
                  className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                  Ciudad
                </label>
                <select
                  value={cCity}
                  onChange={(e) => setCCity(e.target.value as CityName)}
                  className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-2.5 text-sm text-[#063642] outline-none focus:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF]"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={cEmail}
                onChange={(e) => setCEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                Contraseña (mín. 6 caracteres)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={cPassword}
                onChange={(e) => setCPassword(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                Rubros de servicio (podés elegir uno o más)
              </label>
              <div className="mt-2 space-y-3">
                {CATEGORY_GROUPS.map((group) => (
                  <div key={group.title}>
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {group.title}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {group.items.map((catId) => {
                        const active = cCategories.includes(catId);
                        return (
                          <button
                            key={catId}
                            type="button"
                            onClick={() => toggleCourierCategory(catId)}
                            aria-pressed={active}
                            className={`flex min-h-11 items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs font-bold transition ${
                              active
                                ? 'border-[#008B8B] bg-[#008B8B]/10 text-[#063642] dark:border-[#2DD4BF] dark:bg-[#008B8B]/20 dark:text-white'
                                : 'border-[#E2E8F0] bg-[#F8FAFA] text-slate-600 dark:border-[#1E4452] dark:bg-[#13323D] dark:text-slate-300'
                            }`}
                          >
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                active
                                  ? 'border-[#008B8B] bg-[#008B8B] text-white'
                                  : 'border-slate-300 bg-white dark:border-slate-500 dark:bg-[#0D252E]'
                              }`}
                            >
                              {active && <Check className="h-3 w-3" />}
                            </span>
                            <span className="leading-tight">{getCategoryInfo(catId).label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                Vehículo o equipamiento
              </label>
              <input
                type="text"
                required
                value={cVehicle}
                onChange={(e) => setCVehicle(e.target.value)}
                placeholder="Ej: Moto 110cc / Herramientas de plomería"
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                Zona de trabajo / barrios
              </label>
              <input
                type="text"
                required
                value={cWorkZone}
                onChange={(e) => setCWorkZone(e.target.value)}
                placeholder="Ej: Centro, Pueblo de Luis, Corradi"
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                Descripción
              </label>
              <textarea
                rows={3}
                required
                value={cDescription}
                onChange={(e) => setCDescription(e.target.value)}
                placeholder="Contá qué tipo de trabajos realizás y tu experiencia..."
                className="mt-1 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] p-3 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-[#008B8B] text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60 hover:bg-[#007676]"
            >
              {loading ? 'Creando cuenta...' : 'Registrarme y entrar a Modo Trabajo'}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleRegisterMerchant}
            className="mt-5 space-y-3.5 rounded-3xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#1E4452] dark:bg-[#0D252E]"
          >
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Registrá tu comercio para gestionar envíos puntuales o recurrentes, guardar
              repartidores de confianza y publicar oportunidades laborales.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                Nombre del comercio
              </label>
              <input
                type="text"
                required
                value={mBusinessName}
                onChange={(e) => setMBusinessName(e.target.value)}
                placeholder="Ej: Farmacia del Sur"
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                Nombre del responsable
              </label>
              <input
                type="text"
                required
                value={mOwnerName}
                onChange={(e) => setMOwnerName(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                  Teléfono
                </label>
                <input
                  type="tel"
                  required
                  value={mPhone}
                  onChange={(e) => setMPhone(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                  Ciudad
                </label>
                <select
                  value={mCity}
                  onChange={(e) => setMCity(e.target.value as CityName)}
                  className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-2.5 text-sm text-[#063642] outline-none focus:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF]"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                Dirección
              </label>
              <input
                type="text"
                required
                value={mAddress}
                onChange={(e) => setMAddress(e.target.value)}
                placeholder="Ej: Rivadavia 420"
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none placeholder:text-slate-400 focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                Categoría comercial
              </label>
              <select
                value={mCategory}
                onChange={(e) => setMCategory(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-2.5 text-sm text-[#063642] outline-none focus:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF]"
              >
                {MERCHANT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={mEmail}
                onChange={(e) => setMEmail(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#063642] dark:text-slate-200">
                Contraseña (mín. 6 caracteres)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={mPassword}
                onChange={(e) => setMPassword(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFA] px-3 text-sm text-[#063642] outline-none focus:border-[#008B8B] focus:bg-white dark:border-[#1E4452] dark:bg-[#13323D] dark:text-white dark:focus:border-[#2DD4BF] dark:focus:bg-[#13323D]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-[#063642] text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60 dark:bg-[#008B8B] dark:hover:bg-[#007676]"
            >
              {loading ? 'Registrando comercio...' : 'Registrar comercio'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
