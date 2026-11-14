import React from 'react';
import { Home, MessageSquare, Search, Store } from 'lucide-react';

export type MainTab = 'home' | 'search' | 'chats' | 'merchants';

interface BottomNavProps {
  activeTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
  activeChatsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  activeChatsCount,
}) => {
  const items: Array<{ id: MainTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Inicio', icon: <Home className="h-5 w-5" /> },
    { id: 'search', label: 'Buscar', icon: <Search className="h-5 w-5" /> },
    {
      id: 'chats',
      label: 'Chats',
      icon: (
        <div className="relative">
          <MessageSquare className="h-5 w-5" />
          {activeChatsCount > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF6B00] px-1 text-[10px] font-bold text-white tabular-nums">
              {activeChatsCount > 9 ? '9+' : activeChatsCount}
            </span>
          )}
        </div>
      ),
    },
    { id: 'merchants', label: 'Comercios', icon: <Store className="h-5 w-5" /> },
  ];

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-slate-200 bg-white/95 backdrop-blur-md pb-safe"
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
                isActive ? 'text-[#FF6B00]' : 'text-slate-500 hover:text-[#1A2E4A]'
              }`}
            >
              {item.icon}
              <span className={`text-[11px] leading-none whitespace-nowrap ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
