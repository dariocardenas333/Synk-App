export type ServiceCategory =
  | 'motomandado'
  | 'bicimandado'
  | 'automandado'
  | 'flete'
  | 'auxilio_vehicular'
  | 'urgencias_cerrajeria'
  | 'jardineria_poda'
  | 'fumigacion_plagas'
  | 'limpieza_terrenos'
  | 'plomeria_gas'
  | 'electricidad'
  | 'electrodomesticos_clima'
  | 'reparacion_electrodomesticos'
  | 'cuidado_mascotas'
  | 'ninera'
  | 'limpieza_domestica'
  | 'soporte_tecnico_pc'
  | 'fotografia'
  | 'clases_apoyo';

export type TutoringLevel = 'Primaria' | 'Secundaria' | 'Universidad';

export type AvailabilityStatus = 'available' | 'busy' | 'offline';

export type CityName =
  | 'Trelew'
  | 'Rawson'
  | 'Puerto Madryn'
  | 'Comodoro Rivadavia'
  | 'Rada Tilly'
  | 'Esquel'
  | 'Trevelin'
  | 'Gaiman'
  | 'Dolavon'
  | '28 de Julio'
  | 'Sarmiento'
  | 'Lago Puelo'
  | 'El Hoyo'
  | 'Epuyén'
  | 'El Maitén'
  | 'Cholila'
  | 'Camarones'
  | 'Río Mayo'
  | 'Gobernador Costa'
  | 'José de San Martín'
  | 'Alto Río Senguer'
  | 'Paso de Indios'
  | 'Gastre'
  | 'Gan Gan'
  | 'Telsen';

export type TariffMode = 'fixed' | 'distance' | 'zone' | 'negotiable';

export type UserRole = 'client' | 'courier' | 'merchant';

export type ContractStatus = 'proposed' | 'accepted' | 'completed' | 'cancelled';

export interface TariffItem {
  id: string;
  courierId: string;
  serviceCategory?: ServiceCategory | null;
  title: string;
  mode: TariffMode;
  priceArs: number | null;
  unitLabel?: string | null;
  zoneName?: string | null;
  notes?: string | null;
}

export interface CourierPublicProfile {
  id: string;
  publicName: string;
  photoUrl?: string | null;
  contactPhone?: string | null;
  serviceCategory: ServiceCategory;
  serviceCategories?: ServiceCategory[];
  tutoringLevels?: TutoringLevel[];
  tutoringSubjects?: string;
  vehicle: string;
  city: CityName;
  workZone: string;
  coverageZones: string[];
  schedule: string;
  description: string;
  extraServices: string[];
  startingPriceArs: number | null;
  availabilityStatus: AvailabilityStatus;
  isAvailable: boolean;
  activeContractId?: string | null;
  ratingAverage: number;
  ratingCount: number;
  completedCount: number;
  points?: number;
  tariffs: TariffItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MerchantProfile {
  id: string;
  businessName: string;
  ownerName: string;
  address: string;
  city: CityName;
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrivateUserRecord {
  id: string;
  role: 'courier' | 'merchant';
  email: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestClient {
  id: string;
  nickname: string;
  city: CityName;
  recoveryCode: string;
  favorites?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  clientId: string;
  clientName: string;
  clientRole: 'client' | 'merchant';
  clientRecoveryCode?: string | null;
  courierId: string;
  courierName: string;
  courierCategory: ServiceCategory;
  courierPhotoUrl?: string | null;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageSenderId?: string | null;
  unreadCount?: Record<string, number>;
  typingBy?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole | 'system';
  text: string;
  messageType: 'text' | 'contract_proposal' | 'contract_status';
  contractId?: string | null;
  createdAt: string;
}

export interface Contract {
  id: string;
  conversationId: string;
  clientId: string;
  clientName: string;
  clientRole: 'client' | 'merchant';
  clientRecoveryCode?: string | null;
  courierId: string;
  courierName: string;
  serviceCategory: ServiceCategory;
  description: string;
  agreedPriceArs: number | null;
  modality: 'puntual' | 'recurrente';
  status: ContractStatus;
  rated: boolean;
  ratingValue?: number | null;
  createdAt: string;
  acceptedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  updatedAt: string;
}

export interface RatingRecord {
  contractId: string;
  courierId: string;
  clientId: string;
  clientName: string;
  serviceCategory?: ServiceCategory;
  score: number;
  comment: string;
  createdAt: string;
}

export interface JobOpportunity {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantCategory: string;
  city: CityName;
  title: string;
  description: string;
  serviceCategory: ServiceCategory;
  modality: 'puntual' | 'recurrente' | 'turno';
  paySummary: string;
  status: 'open' | 'closed';
  createdAt: string;
}

export interface CurrentSession {
  uid: string;
  role: UserRole;
  displayName: string;
  city: CityName;
  isAnonymous: boolean;
  emailVerified?: boolean;
  recoveryCode?: string;
  email?: string;
  phone?: string;
}
