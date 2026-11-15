import React from 'react';
import { Briefcase, ChevronDown, MapPin, Moon, Sun, User } from 'lucide-react';
import type { CityName, CurrentSession } from '../types/synk';
import { CITIES } from '../utils/formatters';

interface HeaderProps {
  session: CurrentSession;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenUserMenu: () => void;
  onCityChange: (city: CityName) => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  isDark,
  onToggleTheme,
  onOpenUserMenu,
  onCityChange,
  onGoHome,
}) => {
  const isProviderMode = session.role === 'courier';

  return (
    <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md dark:border-[#1E4452] dark:bg-[#0D252E]/95">
      <div className="flex h-14 items-center justify-between gap-1.5 px-3 sm:gap-2 sm:px-4">
        <button
          type="button"
          onClick={onGoHome}
          className="flex min-w-0 items-center gap-2 text-left transition active:opacity-80"
        >
          <div className="flex h-9 w-10 shrink-0 items-center justify-center dark:rounded-xl dark:bg-white dark:px-1 dark:py-0.5">
            <img
              src="/logo-alamano-icon.png"
              alt="AlaMano"
              className="h-full w-full object-contain mix-blend-multiply"
            />
          </div>
          <div className="min-w-0 leading-none">
            <span className="block font-display text-base font-extrabold tracking-tight text-[#063642] whitespace-nowrap dark:text-white">
              AlaMano
            </span>
            <span className="block truncate text-[10px] font-semibold text-[#008B8B] dark:text-[#2DD4BF]">
              Servicios independientes, más cerca.
            </span>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          {isProviderMode ? (
            <div className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#063642] px-2.5 text-[11px] font-bold text-white dark:border dark:border-[#1E4452] dark:bg-[#13323D]">
              <Briefcase className="h-3.5 w-3.5 text-[#F5A623]" />
              <span className="whitespace-nowrap">Modo Trabajo</span>
            </div>
          ) : (
            <div className="relative flex shrink-0 items-center">
              <MapPin className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-[#008B8B] dark:text-[#2DD4BF]" />
              <select
                aria-label="Seleccionar ciudad"
                value={session.city}
                onChange={(e) => onCityChange(e.target.value as CityName)}
                className="h-9 w-[96px] appearance-none truncate rounded-lg border border-[#E2E8F0] bg-[#F8FAFA] pl-6 pr-5 text-xs font-semibold text-[#063642] outline-none transition hover:bg-slate-100 focus:border-[#008B8B] dark:border-[#1E4452] dark:bg-[#13323D] dark:text-slate-100 dark:hover:bg-[#1A4352] sm:w-auto sm:max-w-[120px] sm:pr-6"
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
            onClick={onToggleTheme}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#F8FAFA] text-[#063642] transition hover:bg-slate-100 active:scale-95 dark:border-[#1E4452] dark:bg-[#13323D] dark:text-[#F5A623] dark:hover:bg-[#1A4352]"
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onOpenUserMenu}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#F8FAFA] text-[#063642] transition hover:bg-slate-100 active:scale-95 dark:border-[#1E4452] dark:bg-[#13323D] dark:text-slate-100 dark:hover:bg-[#1A4352]"
            aria-label="Abrir menú de usuario"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
