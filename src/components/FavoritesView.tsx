import React from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import type { CourierPublicProfile } from '../types/synk';
import { CourierCard } from './CourierCard';

interface FavoritesViewProps {
  couriers: CourierPublicProfile[];
  favorites: string[];
  onBack: () => void;
  onToggleFavorite: (courierId: string) => void;
  onViewProfile: (courierId: string) => void;
  onContact: (courier: CourierPublicProfile) => void;
  onGoSearch: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  couriers,
  favorites,
  onBack,
  onToggleFavorite,
  onViewProfile,
  onContact,
  onGoSearch,
}) => {
  const favoriteCouriers = couriers.filter((c) => favorites.includes(c.id));

  return (
    <div className="bg-[#F8FAFA] pb-24 dark:bg-[#07181E]">
      <div className="sticky top-14 z-20 flex items-center gap-2 border-b border-[#E2E8F0] bg-white/95 px-4 py-2.5 backdrop-blur-md dark:border-[#1E4452] dark:bg-[#0D252E]/95">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 items-center gap-1.5 pr-2 text-sm font-semibold text-[#063642] dark:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver</span>
        </button>
        <h1 className="font-display text-base font-bold text-[#063642] dark:text-white">
          Mis favoritos
        </h1>
      </div>

      <div className="p-4">
        {favoriteCouriers.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center dark:border-[#1E4452] dark:bg-[#0D252E]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#008B8B]/10 text-[#008B8B] dark:bg-[#008B8B]/20 dark:text-[#2DD4BF]">
              <Heart className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-bold text-[#063642] dark:text-white">
              Todavía no guardaste prestadores
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Tocá el corazón en cualquier tarjeta o perfil para tener tus contactos de confianza
              siempre a mano.
            </p>
            <button
              type="button"
              onClick={onGoSearch}
              className="mt-4 h-11 rounded-xl bg-[#063642] px-5 text-xs font-bold text-white dark:bg-[#008B8B]"
            >
              Explorar prestadores
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {favoriteCouriers.map((courier) => (
              <CourierCard
                key={courier.id}
                courier={courier}
                isFavorite={true}
                onToggleFavorite={onToggleFavorite}
                onViewProfile={onViewProfile}
                onContact={onContact}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
