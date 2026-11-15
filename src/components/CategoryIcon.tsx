import React from 'react';
import {
  Baby,
  Bike,
  Bug,
  Camera,
  Car,
  Droplets,
  Fan,
  GraduationCap,
  Hammer,
  KeyRound,
  Laptop,
  PackageCheck,
  PawPrint,
  PlugZap,
  Scissors,
  Sparkles,
  Truck,
  Wrench,
  Zap,
} from 'lucide-react';
import type { ServiceCategory } from '../types/synk';

interface CategoryIconProps {
  category: ServiceCategory;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = 'h-6 w-6' }) => {
  switch (category) {
    case 'motomandado':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="5.5" cy="17.5" r="3" />
          <circle cx="18.5" cy="17.5" r="3" />
          <path d="M8.5 17.5h5.5l2.5-6h-5l-1.5 3.5H6.5" />
          <path d="M15 7h2.5l1.5 4.5" />
          <path d="M10 9h3.5" />
        </svg>
      );
    case 'bicimandado':
      return <Bike className={className} aria-hidden="true" />;
    case 'automandado':
      return <Car className={className} aria-hidden="true" />;
    case 'flete':
      return <Truck className={className} aria-hidden="true" />;
    case 'auxilio_vehicular':
      return <Wrench className={className} aria-hidden="true" />;
    case 'urgencias_cerrajeria':
      return <KeyRound className={className} aria-hidden="true" />;
    case 'jardineria_poda':
      return <Scissors className={className} aria-hidden="true" />;
    case 'fumigacion_plagas':
      return <Bug className={className} aria-hidden="true" />;
    case 'limpieza_terrenos':
      return <Hammer className={className} aria-hidden="true" />;
    case 'plomeria_gas':
      return <Droplets className={className} aria-hidden="true" />;
    case 'electricidad':
      return <Zap className={className} aria-hidden="true" />;
    case 'electrodomesticos_clima':
      return <Fan className={className} aria-hidden="true" />;
    case 'reparacion_electrodomesticos':
      return <PlugZap className={className} aria-hidden="true" />;
    case 'cuidado_mascotas':
      return <PawPrint className={className} aria-hidden="true" />;
    case 'ninera':
      return <Baby className={className} aria-hidden="true" />;
    case 'limpieza_domestica':
      return <Sparkles className={className} aria-hidden="true" />;
    case 'soporte_tecnico_pc':
      return <Laptop className={className} aria-hidden="true" />;
    case 'fotografia':
      return <Camera className={className} aria-hidden="true" />;
    case 'clases_apoyo':
      return <GraduationCap className={className} aria-hidden="true" />;
    default:
      return <PackageCheck className={className} aria-hidden="true" />;
  }
};
