import type {
  AvailabilityStatus,
  CityName,
  CourierPublicProfile,
  RatingRecord,
  ServiceCategory,
  TariffMode,
} from '../types/synk';

export function getCourierCategories(
  courier: Pick<CourierPublicProfile, 'serviceCategory' | 'serviceCategories'>
): ServiceCategory[] {
  if (Array.isArray(courier.serviceCategories) && courier.serviceCategories.length > 0) {
    return courier.serviceCategories.filter((c) => Boolean(CATEGORY_INFO[c]));
  }
  return CATEGORY_INFO[courier.serviceCategory] ? [courier.serviceCategory] : ['motomandado'];
}

export function getCategoryInfo(category: ServiceCategory | string) {
  return CATEGORY_INFO[category as ServiceCategory] || CATEGORY_INFO.motomandado;
}

export function computeCourierPoints(
  completedCount: number,
  ratings: RatingRecord[],
  storedPoints?: number
): number {
  const fiveStarCount = ratings.filter((r) => r.score === 5).length;
  const derived = completedCount * 10 + fiveStarCount * 5;
  if (typeof storedPoints === 'number') {
    return Math.max(storedPoints, derived);
  }
  return derived;
}

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

export interface CategoryMeta {
  id: ServiceCategory;
  label: string;
  shortDesc: string;
  vehicleExamples: string;
  keywords: string[];
  group: 'Envíos, Traslados y Vehículos' | 'Hogar, Terrenos y Oficios' | 'Cuidado, Limpieza y Tecnología';
}

export const CATEGORY_INFO: Record<ServiceCategory, CategoryMeta> = {
  motomandado: {
    id: 'motomandado',
    label: 'Motomandado',
    shortDesc: 'Trámites, comida, farmacia y envíos rápidos',
    vehicleExamples: 'Moto 110cc / 150cc / Scooter',
    keywords: ['moto', 'mandado', 'envio', 'envíos', 'cadete', 'cadetería', 'farmacia', 'trámite'],
    group: 'Envíos, Traslados y Vehículos',
  },
  bicimandado: {
    id: 'bicimandado',
    label: 'Bicimandado',
    shortDesc: 'Entregas urbanas sustentables en zona céntrica',
    vehicleExamples: 'Bicicleta urbana / Cargo bike',
    keywords: ['bici', 'bicicleta', 'mandado', 'centro', 'ecológico'],
    group: 'Envíos, Traslados y Vehículos',
  },
  automandado: {
    id: 'automandado',
    label: 'Automandado',
    shortDesc: 'Cajas medianas, compras grandes y días de viento',
    vehicleExamples: 'Auto sedán / Hatchback / Utilitario chico',
    keywords: ['auto', 'coche', 'compras', 'cajas', 'viento', 'mandado'],
    group: 'Envíos, Traslados y Vehículos',
  },
  flete: {
    id: 'flete',
    label: 'Flete y Mudanzas',
    shortDesc: 'Cargas voluminosas, electrodomésticos y mudanzas',
    vehicleExamples: 'Camioneta / Kangoo / Furgón',
    keywords: ['flete', 'mudanza', 'mudanzas', 'camioneta', 'furgón', 'carga', 'muebles'],
    group: 'Envíos, Traslados y Vehículos',
  },
  auxilio_vehicular: {
    id: 'auxilio_vehicular',
    label: 'Auxilio Vehicular',
    shortDesc: 'Batería, pinchaduras y remolque en ciudad/ruta',
    vehicleExamples: 'Auxilio móvil / Camión camilla / Pick-up',
    keywords: ['auxilio', 'batería', 'puente', 'pinchadura', 'gomero', 'remolque', 'grúa', 'ruta'],
    group: 'Envíos, Traslados y Vehículos',
  },
  urgencias_cerrajeria: {
    id: 'urgencias_cerrajeria',
    label: 'Cerrajería / Urgencias',
    shortDesc: 'Aperturas de puertas, vehículos y urgencias 24 hs',
    vehicleExamples: 'Unidad móvil equipada / Moto taller',
    keywords: ['cerrajería', 'cerrajero', 'llave', 'puerta', 'cerradura', 'urgencia', '24hs'],
    group: 'Hogar, Terrenos y Oficios',
  },
  jardineria_poda: {
    id: 'jardineria_poda',
    label: 'Jardinería y Poda',
    shortDesc: 'Corte de pasto, desmalezado y limpieza de patios',
    vehicleExamples: 'Motoguadaña / Cortadora de césped / Herramientas',
    keywords: ['jardinería', 'jardinero', 'poda', 'podar', 'pasto', 'césped', 'desmalezado', 'patio'],
    group: 'Hogar, Terrenos y Oficios',
  },
  fumigacion_plagas: {
    id: 'fumigacion_plagas',
    label: 'Fumigación / Control de Plagas',
    shortDesc: 'Desinsectación, desratización y fumigación domiciliaria',
    vehicleExamples: 'Pulverizador profesional / Equipo habilitado',
    keywords: ['fumigación', 'fumigador', 'plagas', 'insectos', 'cucarachas', 'roedores', 'hormigas'],
    group: 'Hogar, Terrenos y Oficios',
  },
  limpieza_terrenos: {
    id: 'limpieza_terrenos',
    label: 'Limpieza de Terrenos y Escombros',
    shortDesc: 'Despeje de lotes, retiro de ramas y escombros',
    vehicleExamples: 'Camioneta / Volquete / Herramientas de obra',
    keywords: ['terreno', 'terrenos', 'lote', 'escombros', 'ramas', 'limpieza', 'basura'],
    group: 'Hogar, Terrenos y Oficios',
  },
  plomeria_gas: {
    id: 'plomeria_gas',
    label: 'Plomería y Gas',
    shortDesc: 'Pérdidas, cañerías, termotanques, estufas y grifería',
    vehicleExamples: 'Caja de herramientas / Gasista y plomero móvil',
    keywords: ['plomería', 'plomero', 'gas', 'gasista', 'caño', 'pérdida', 'termotanque', 'estufa', 'agua'],
    group: 'Hogar, Terrenos y Oficios',
  },
  electricidad: {
    id: 'electricidad',
    label: 'Electricidad',
    shortDesc: 'Tableros, cortocircuitos, disyuntores e instalaciones',
    vehicleExamples: 'Instrumental eléctrico / Escalera / Herramientas',
    keywords: ['electricidad', 'electricista', 'luz', 'cortocircuito', 'tablero', 'disyuntor', 'enchufe'],
    group: 'Hogar, Terrenos y Oficios',
  },
  electrodomesticos_clima: {
    id: 'electrodomesticos_clima',
    label: 'Electrodomésticos y Climatización',
    shortDesc: 'Aires acondicionados, heladeras, lavarropas y calefacción',
    vehicleExamples: 'Herramental de refrigeración / Service técnico',
    keywords: ['aire', 'climatización', 'heladera', 'lavarropas', 'electrodomésticos', 'refrigeración', 'técnico'],
    group: 'Hogar, Terrenos y Oficios',
  },
  cuidado_mascotas: {
    id: 'cuidado_mascotas',
    label: 'Cuidado y Paseo de Mascotas',
    shortDesc: 'Paseos diarios, cuidado a domicilio y traslados',
    vehicleExamples: 'Paseador / Cuidador con experiencia',
    keywords: ['mascotas', 'perro', 'perros', 'gato', 'paseador', 'paseo', 'cuidado'],
    group: 'Cuidado, Limpieza y Tecnología',
  },
  limpieza_soporte_pc: {
    id: 'limpieza_soporte_pc',
    label: 'Limpieza por Hora y Soporte Técnico PC',
    shortDesc: 'Limpieza de hogares/oficinas y reparación de PC/notebooks',
    vehicleExamples: 'Insumos propios / Laboratorio técnico móvil',
    keywords: ['limpieza', 'hora', 'hogar', 'oficina', 'pc', 'computadora', 'notebook', 'soporte', 'técnico', 'informática'],
    group: 'Cuidado, Limpieza y Tecnología',
  },
};

export const FEATURED_CATEGORIES: ServiceCategory[] = [
  'motomandado',
  'flete',
  'auxilio_vehicular',
  'jardineria_poda',
];

export const ORDERED_CATEGORIES: ServiceCategory[] = [
  'motomandado',
  'bicimandado',
  'automandado',
  'flete',
  'auxilio_vehicular',
  'urgencias_cerrajeria',
  'jardineria_poda',
  'fumigacion_plagas',
  'limpieza_terrenos',
  'plomeria_gas',
  'electricidad',
  'electrodomesticos_clima',
  'cuidado_mascotas',
  'limpieza_soporte_pc',
];

export const CATEGORY_GROUPS: Array<{
  title: CategoryMeta['group'];
  items: ServiceCategory[];
}> = [
  {
    title: 'Envíos, Traslados y Vehículos',
    items: ['motomandado', 'bicimandado', 'automandado', 'flete', 'auxilio_vehicular'],
  },
  {
    title: 'Hogar, Terrenos y Oficios',
    items: [
      'urgencias_cerrajeria',
      'jardineria_poda',
      'fumigacion_plagas',
      'limpieza_terrenos',
      'plomeria_gas',
      'electricidad',
      'electrodomesticos_clima',
    ],
  },
  {
    title: 'Cuidado, Limpieza y Tecnología',
    items: ['cuidado_mascotas', 'limpieza_soporte_pc'],
  },
];

export const AVAILABILITY_META: Record<
  AvailabilityStatus,
  {
    status: AvailabilityStatus;
    label: string;
    shortDesc: string;
    colorHex: string;
    textClass: string;
    bgSoftClass: string;
  }
> = {
  available: {
    status: 'available',
    label: 'Disponible',
    shortDesc: 'Activo y listo para recibir pedidos',
    colorHex: '#22C55E',
    textClass: 'text-[#15803D] dark:text-[#4ADE80]',
    bgSoftClass: 'bg-[#22C55E]/12 dark:bg-[#22C55E]/20',
  },
  busy: {
    status: 'busy',
    label: 'Ocupado',
    shortDesc: 'En medio de un trabajo, activo en jornada',
    colorHex: '#EF4444',
    textClass: 'text-[#B91C1C] dark:text-[#F87171]',
    bgSoftClass: 'bg-[#EF4444]/12 dark:bg-[#EF4444]/20',
  },
  offline: {
    status: 'offline',
    label: 'Desconectado',
    shortDesc: 'Fuera de horario laboral / descansando',
    colorHex: '#9CA3AF',
    textClass: 'text-slate-600 dark:text-slate-300',
    bgSoftClass: 'bg-slate-200/70 dark:bg-slate-700/50',
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

const RECOVERY_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRecoveryCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += RECOVERY_CHARS[Math.floor(Math.random() * RECOVERY_CHARS.length)];
  }
  // Ensure at least one digit so it looks clearly alphanumeric
  if (!/[2-9]/.test(code)) {
    const digit = String(Math.floor(2 + Math.random() * 8));
    code = code.slice(0, 3) + digit;
  }
  return `ALM-${code}`;
}

export function normalizeRecoveryCode(input: string): string {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('ALM-')) return cleaned;
  if (cleaned.startsWith('ALM') && cleaned.length >= 7) {
    return `ALM-${cleaned.slice(3)}`;
  }
  return cleaned;
}

export function getInitials(name: string): string {
  const clean = name.replace(/^@/, '').trim();
  if (!clean) return 'AM';
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
