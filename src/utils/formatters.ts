import type { CityName, ServiceCategory, TariffMode } from '../types/synk';

export const CITIES: CityName[] = [
  'Trelew',
  'Rawson',
  'Puerto Madryn',
  'Comodoro Rivadavia',
];

export const CITY_NEIGHBORHOODS: Record<CityName, string[]> = {
  Trelew: [
    'Centro',
    'Pueblo de Luis',
    'San Martín',
    'Corradi',
    'Malvinas Argentinas',
    'Progreso',
    'Parque Industrial',
    'Villa Italia',
  ],
  Rawson: [
    'Centro',
    'Playa Unión',
    'Área 16',
    'Área 12',
    'Gregorio Mayo',
    'Puerto Rawson',
  ],
  'Puerto Madryn': [
    'Centro',
    'Sur / El Golfito',
    'Norte / Parque Industrial',
    'Güemes',
    'Roque Sáenz Peña',
    'Solanas',
  ],
  'Comodoro Rivadavia': [
    'Centro',
    'Rada Tilly',
    'Km 3 / General Mosconi',
    'Km 5',
    'Km 8',
    'Pueyrredón',
    'Roca',
  ],
};

export const CATEGORY_INFO: Record<
  ServiceCategory,
  {
    id: ServiceCategory;
    label: string;
    shortDesc: string;
    vehicleExamples: string;
  }
> = {
  motomandado: {
    id: 'motomandado',
    label: 'Motomandado',
    shortDesc: 'Trámites, comida, farmacia y envíos rápidos',
    vehicleExamples: 'Moto 110cc / 150cc / Scooter',
  },
  bicimandado: {
    id: 'bicimandado',
    label: 'Bicimandado',
    shortDesc: 'Entregas urbanas sustentables en zona céntrica',
    vehicleExamples: 'Bicicleta urbana / Cargo bike',
  },
  automandado: {
    id: 'automandado',
    label: 'Automandado',
    shortDesc: 'Cajas medianas, compras grandes y días de viento',
    vehicleExamples: 'Auto sedán / Hatchback / Utilitario chico',
  },
  flete: {
    id: 'flete',
    label: 'Flete',
    shortDesc: 'Cargas voluminosas, electrodomésticos y mudanzas',
    vehicleExamples: 'Camioneta / Kangoo / Furgón',
  },
};

export const TARIFF_MODE_LABELS: Record<TariffMode, string> = {
  fixed: 'Precio fijo',
  distance: 'Precio por distancia',
  zone: 'Precio por zona',
  negotiable: 'Precio a convenir',
};

export const MERCHANT_CATEGORIES = [
  'Gastronomía',
  'Farmacia',
  'Indumentaria',
  'Ferretería',
  'Supermercado / Almacén',
  'Mensajería / Oficina',
  'Librería / Papelería',
  'Otro',
];

export function formatARS(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount) || amount <= 0) {
    return 'A convenir';
  }
  return (
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount) + ' ARS'
  );
}

export function formatARSCompact(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount) || amount <= 0) {
    return 'A convenir';
  }
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateAR(isoString: string | Date): string {
  const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('day')}/${get('month')}/${get('year')} ${get('hour')}:${get('minute')}`;
}

export function formatTimeAR(isoString: string | Date): string {
  const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('hour')}:${get('minute')}`;
}

const GUEST_NAMES = [
  'mateo',
  'sofia',
  'lucas',
  'cami',
  'tomas',
  'valen',
  'santi',
  'martu',
  'juli',
  'franco',
  'lola',
  'bruno',
  'mica',
  'nico',
];

export function generateRandomNickname(): string {
  const name = GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `@${name}${num}`;
}

export function normalizeNickname(input: string): string {
  const trimmed = input.trim().replace(/\s+/g, '').toLowerCase();
  if (!trimmed) return generateRandomNickname();
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

export function getInitials(name: string): string {
  const clean = name.replace(/^@/, '').trim();
  if (!clean) return 'SY';
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export async function resizeImageToDataUrl(file: File, maxSize = 360): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = () => reject(new Error('Archivo de imagen inválido'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Error leyendo el archivo'));
    reader.readAsDataURL(file);
  });
}
