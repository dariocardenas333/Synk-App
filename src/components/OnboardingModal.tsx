import React, { useState } from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import type { CityName } from '../types/synk';
import { CITIES, generateRandomNickname } from '../utils/formatters';

interface OnboardingModalProps {
  initialNickname: string;
  initialCity: CityName;
  onComplete: (nickname: string, city: CityName) => Promise<void>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialNickname,
  initialCity,
  onComplete,
}) => {
  const [nickname, setNickname] = useState(initialNickname);
  const [city, setCity] = useState<CityName>(initialCity);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onComplete(nickname, city);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2E4A]/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-[398px] rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF6B00] text-lg font-extrabold text-white font-display">
            S
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-[#1A2E4A]">
              Bienvenido a Synk
            </h2>
            <p className="text-xs text-slate-500">
              Acceso libre · Sin contraseñas ni formularios largos
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Explorá repartidores independientes, compará tarifas en pesos argentinos y
          acordá tus mandados directo por chat.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="guest-nickname"
              className="block text-xs font-semibold text-[#1A2E4A]"
            >
              Tu nickname de cliente
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id="guest-nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={24}
                placeholder="@mateo482"
                className="h-12 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-900 outline-none focus:border-[#FF6B00] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setNickname(generateRandomNickname())}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 active:scale-95"
                title="Generar otro nickname"
                aria-label="Generar otro nickname"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Se guarda automáticamente para conservar tus favoritos y chats.
            </p>
          </div>

          <div>
            <label
              htmlFor="guest-city"
              className="block text-xs font-semibold text-[#1A2E4A]"
            >
              Tu ciudad
            </label>
            <div className="relative mt-1.5">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FF6B00]" />
              <select
                id="guest-city"
                value={city}
                onChange={(e) => setCity(e.target.value as CityName)}
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none focus:border-[#FF6B00] focus:bg-white"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}, Chubut
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="h-12 w-full rounded-xl bg-[#FF6B00] text-sm font-bold text-white shadow-sm transition hover:bg-[#e86200] active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Comenzar'}
          </button>
        </form>
      </div>
    </div>
  );
};
