import React, { useState } from 'react';
import { ArrowLeft, Store, Truck } from 'lucide-react';
import type {
  CourierRegistrationInput,
  MerchantRegistrationInput,
} from '../services/synkStore';
import type { CityName, ServiceCategory } from '../types/synk';
import { CATEGORY_INFO, CITIES, MERCHANT_CATEGORIES } from '../utils/formatters';

interface AuthSheetProps {
  initialType: 'courier' | 'merchant';
  defaultCity: CityName;
  onBack: () => void;
  onRegisterCourier: (input: CourierRegistrationInput) => Promise<void>;
  onRegisterMerchant: (input: MerchantRegistrationInput) => Promise<void>;
  onLogin: (email: string, password: string) => Promise<'courier' | 'merchant'>;
  onSuccessNavigate: (role: 'courier' | 'merchant') => void;
}

export const AuthSheet: React.FC<AuthSheetProps> = ({
  initialType,
  defaultCity,
  onBack,
  onRegisterCourier,
  onRegisterMerchant,
  onLogin,
  onSuccessNavigate,
}) => {
  const [accountType, setAccountType] = useState<'courier' | 'merchant'>(initialType);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Courier register state
  const [cFirstName, setCFirstName] = useState('');
  const [cLastName, setCLastName] = useState('');
  const [cPublicName, setCPublicName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [cCategory, setCCategory] = useState<ServiceCategory>('motomandado');
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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

  const handleRegisterCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (cPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
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
        serviceCategory: cCategory,
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
    <div className="pb-24">
      <div className="sticky top-14 z-20 flex items-center gap-2 border-b border-slate-100 bg-white/95 px-4 py-2.5 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 items-center gap-1.5 pr-2 text-sm font-semibold text-[#1A2E4A]"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver</span>
        </button>
        <h1 className="font-display text-base font-bold text-[#1A2E4A]">
          Acceso de cuentas
        </h1>
      </div>

      <div className="p-4">
        {/* Account Type Selector */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setAccountType('courier');
              setError(null);
            }}
            className={`flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold transition ${
              accountType === 'courier'
                ? 'bg-white text-[#FF6B00] shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Repartidor</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAccountType('merchant');
              setError(null);
            }}
            className={`flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold transition ${
              accountType === 'merchant'
                ? 'bg-white text-[#1A2E4A] shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Comercio</span>
          </button>
        </div>

        {/* Register / Login Toggle */}
        <div className="mt-4 flex items-center justify-center gap-6 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setError(null);
            }}
            className={`border-b-2 pb-2.5 text-sm font-bold transition ${
              authMode === 'register'
                ? 'border-[#FF6B00] text-[#1A2E4A]'
                : 'border-transparent text-slate-400'
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
                ? 'border-[#FF6B00] text-[#1A2E4A]'
                : 'border-transparent text-slate-400'
            }`}
          >
            Iniciar sesión
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="nombre@ejemplo.com"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none focus:border-[#FF6B00] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Contraseña</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none focus:border-[#FF6B00] focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-[#1A2E4A] text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
        ) : accountType === 'courier' ? (
          <form onSubmit={handleRegisterCourier} className="mt-5 space-y-3.5">
            <p className="text-xs leading-relaxed text-slate-500">
              Creá tu perfil público de repartidor independiente. Luego podrás subir tu foto,
              configurar tarifas y administrar tu disponibilidad.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Nombre</label>
                <input
                  type="text"
                  required
                  value={cFirstName}
                  onChange={(e) => setCFirstName(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Apellido</label>
                <input
                  type="text"
                  required
                  value={cLastName}
                  onChange={(e) => setCLastName(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Nickname o nombre público
              </label>
              <input
                type="text"
                required
                value={cPublicName}
                onChange={(e) => setCPublicName(e.target.value)}
                placeholder="Ej: Juan Moto Trelew"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Teléfono</label>
                <input
                  type="tel"
                  required
                  value={cPhone}
                  onChange={(e) => setCPhone(e.target.value)}
                  placeholder="280 4..."
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Ciudad</label>
                <select
                  value={cCity}
                  onChange={(e) => setCCity(e.target.value as CityName)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-sm outline-none focus:border-[#FF6B00]"
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
              <label className="block text-xs font-semibold text-slate-700">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={cEmail}
                onChange={(e) => setCEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Contraseña (mín. 6 caracteres)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={cPassword}
                onChange={(e) => setCPassword(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Tipo de servicio
                </label>
                <select
                  value={cCategory}
                  onChange={(e) => setCCategory(e.target.value as ServiceCategory)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-sm outline-none focus:border-[#FF6B00]"
                >
                  {Object.values(CATEGORY_INFO).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Vehículo</label>
                <input
                  type="text"
                  required
                  value={cVehicle}
                  onChange={(e) => setCVehicle(e.target.value)}
                  placeholder="Ej: Moto 110cc"
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Zona de trabajo / barrios
              </label>
              <input
                type="text"
                required
                value={cWorkZone}
                onChange={(e) => setCWorkZone(e.target.value)}
                placeholder="Ej: Centro, Pueblo de Luis, Corradi"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Descripción</label>
              <textarea
                rows={3}
                required
                value={cDescription}
                onChange={(e) => setCDescription(e.target.value)}
                placeholder="Contá qué tipo de mandados realizás y tu experiencia..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-[#FF6B00] text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? 'Creando cuenta...' : 'Registrarme como repartidor'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterMerchant} className="mt-5 space-y-3.5">
            <p className="text-xs leading-relaxed text-slate-500">
              Registrá tu comercio para gestionar envíos puntuales o recurrentes, guardar
              repartidores de confianza y publicar oportunidades laborales.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Nombre del comercio
              </label>
              <input
                type="text"
                required
                value={mBusinessName}
                onChange={(e) => setMBusinessName(e.target.value)}
                placeholder="Ej: Farmacia del Sur"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Nombre del responsable
              </label>
              <input
                type="text"
                required
                value={mOwnerName}
                onChange={(e) => setMOwnerName(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Teléfono</label>
                <input
                  type="tel"
                  required
                  value={mPhone}
                  onChange={(e) => setMPhone(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Ciudad</label>
                <select
                  value={mCity}
                  onChange={(e) => setMCity(e.target.value as CityName)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-sm outline-none focus:border-[#FF6B00]"
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
              <label className="block text-xs font-semibold text-slate-700">Dirección</label>
              <input
                type="text"
                required
                value={mAddress}
                onChange={(e) => setMAddress(e.target.value)}
                placeholder="Ej: Rivadavia 420"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Categoría comercial
              </label>
              <select
                value={mCategory}
                onChange={(e) => setMCategory(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-sm outline-none focus:border-[#FF6B00]"
              >
                {MERCHANT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={mEmail}
                onChange={(e) => setMEmail(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Contraseña (mín. 6 caracteres)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={mPassword}
                onChange={(e) => setMPassword(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-[#1A2E4A] text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? 'Registrando comercio...' : 'Registrar comercio'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
