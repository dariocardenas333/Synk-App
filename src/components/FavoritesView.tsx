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
        <h1 className="font-display text-base font-bold text-[#1A2E4A]">Mis favoritos</h1>
      </div>

      <div className="p-4">
        {favoriteCouriers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00]">
              <Heart className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-bold text-[#1A2E4A]">
              Todavía no guardaste repartidores
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Tocá el corazón en cualquier tarjeta o perfil para tener tus contactos de confianza
              siempre a mano.
            </p>
            <button
              type="button"
              onClick={onGoSearch}
              className="mt-4 h-11 rounded-xl bg-[#FF6B00] px-5 text-xs font-bold text-white"
            >
              Explorar repartidores
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
