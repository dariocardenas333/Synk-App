import React from 'react';
import { ChevronDown, MapPin, User } from 'lucide-react';
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
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2 text-left transition active:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF6B00] font-display text-base font-extrabold text-white">
            S
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-[#1A2E4A] whitespace-nowrap">
            Synk
          </span>
        </button>

        <div className="relative flex items-center">
          <MapPin className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#FF6B00]" />
          <select
            aria-label="Seleccionar ciudad"
            value={session.city}
            onChange={(e) => onCityChange(e.target.value as CityName)}
            className="h-9 appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-7 pr-7 text-xs font-semibold text-[#1A2E4A] outline-none transition hover:bg-slate-100 focus:border-[#FF6B00]"
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-slate-400" />
        </div>

        <button
          type="button"
          onClick={onOpenUserMenu}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[#1A2E4A] transition hover:bg-slate-100 active:scale-95"
          aria-label="Abrir menú de usuario"
        >
          <User className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
