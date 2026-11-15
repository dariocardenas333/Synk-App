import React from 'react';
import { Home, LayoutDashboard, MessageSquare, Search, Store, Tags, Trophy } from 'lucide-react';

export type MainTab =
  | 'home'
  | 'search'
  | 'chats'
  | 'merchants'
  | 'work_panel'
  | 'work_services'
  | 'work_ranking'
  | 'work_chats';

interface BottomNavProps {
  mode: 'client' | 'provider';
  activeTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
  activeChatsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  mode,
  activeTab,
  onChangeTab,
  activeChatsCount,
}) => {
  const chatsIcon = (
    <div className="relative">
      <MessageSquare className="h-5 w-5" />
      {activeChatsCount > 0 && (
        <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#008B8B] px-1 text-[10px] font-bold text-white tabular-nums">
          {activeChatsCount > 9 ? '9+' : activeChatsCount}
        </span>
      )}
    </div>
  );

  const items: Array<{ id: MainTab; label: string; icon: React.ReactNode }> =
    mode === 'provider'
      ? [
          { id: 'work_panel', label: 'Mi Panel', icon: <LayoutDashboard className="h-5 w-5" /> },
          { id: 'work_services', label: 'Servicios', icon: <Tags className="h-5 w-5" /> },
          { id: 'work_ranking', label: 'Ranking', icon: <Trophy className="h-5 w-5" /> },
          { id: 'work_chats', label: 'Chats', icon: chatsIcon },
        ]
      : [
          { id: 'home', label: 'Inicio', icon: <Home className="h-5 w-5" /> },
          { id: 'search', label: 'Buscar', icon: <Search className="h-5 w-5" /> },
          { id: 'chats', label: 'Chats', icon: chatsIcon },
          { id: 'merchants', label: 'Comercios', icon: <Store className="h-5 w-5" /> },
        ];

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-[#E2E8F0] bg-white/95 backdrop-blur-md pb-safe dark:border-[#1E4452] dark:bg-[#0D252E]/95"
    >
      <div className="grid h-16 grid-cols-4 items-center">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id)}
              className={`flex h-full flex-col items-center justify-center gap-1 transition active:scale-95 ${
                isActive
                  ? 'text-[#008B8B] dark:text-[#2DD4BF]'
                  : 'text-slate-500 hover:text-[#063642] dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {item.icon}
              <span
                className={`text-[11px] leading-none whitespace-nowrap ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
