import React from 'react';
import { Briefcase, ChevronDown, MapPin, User } from 'lucide-react';
import type { CityName, CurrentSession } from '../types/synk';
import { CITIES } from '../utils/formatters';

interface HeaderProps {
  session: CurrentSession;
  onOpenUserMenu: () => void;
  onCityChange: (city: CityName) => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  onOpenUserMenu,
  onCityChange,
  onGoHome,
}) => {
  const isProviderMode = session.role === 'courier';

  return (
    <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between gap-2 px-4">
        <button
          type="button"
          onClick={onGoHome}
          className="flex min-w-0 items-center gap-2 text-left transition active:opacity-80"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#063642] font-display text-base font-extrabold text-white">
            A
          </span>
          <div className="min-w-0 leading-none">
            <span className="block font-display text-base font-extrabold tracking-tight text-[#063642] whitespace-nowrap">
              AlaMano
            </span>
            <span className="block truncate text-[10px] font-semibold text-[#008B8B]">
              Servicios independientes, más cerca.
            </span>
          </div>
        </button>

        {isProviderMode ? (
          <div className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#063642] px-2.5 text-[11px] font-bold text-white">
            <Briefcase className="h-3.5 w-3.5 text-[#F5A623]" />
            <span className="whitespace-nowrap">Modo Trabajo</span>
          </div>
        ) : (
          <div className="relative flex shrink-0 items-center">
            <MapPin className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-[#008B8B]" />
            <select
              aria-label="Seleccionar ciudad"
              value={session.city}
              onChange={(e) => onCityChange(e.target.value as CityName)}
              className="h-9 max-w-[120px] appearance-none truncate rounded-lg border border-[#E2E8F0] bg-[#F8FAFA] pl-6 pr-6 text-xs font-semibold text-[#063642] outline-none transition hover:bg-slate-100 focus:border-[#008B8B]"
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        )}

        <button
          type="button"
          onClick={onOpenUserMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#F8FAFA] text-[#063642] transition hover:bg-slate-100 active:scale-95"
          aria-label="Abrir menú de usuario"
        >
          <User className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
