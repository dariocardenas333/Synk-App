export type ServiceCategory = 'motomandado' | 'bicimandado' | 'automandado' | 'flete';

export type CityName = 'Trelew' | 'Rawson' | 'Puerto Madryn' | 'Comodoro Rivadavia';

export type TariffMode = 'fixed' | 'distance' | 'zone' | 'negotiable';

export type UserRole = 'client' | 'courier' | 'merchant';

export type ContractStatus = 'proposed' | 'accepted' | 'completed' | 'cancelled';

export interface TariffItem {
  id: string;
  courierId: string;
  title: string;
  mode: TariffMode;
  priceArs: number | null;
  unitLabel?: string;
  zoneName?: string;
  notes?: string;
}

export interface CourierPublicProfile {
  id: string;
  publicName: string;
  photoUrl?: string;
  serviceCategory: ServiceCategory;
  vehicle: string;
  city: CityName;
  workZone: string;
  coverageZones: string[];
  schedule: string;
  description: string;
  extraServices: string[];
  startingPriceArs: number | null;
  isAvailable: boolean;
  activeContractId?: string | null;
  ratingAverage: number;
  ratingCount: number;
  completedCount: number;
  tariffs: TariffItem[];
  isDemo?: boolean;
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
  isDemo?: boolean;
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
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  clientId: string;
  clientName: string;
  clientRole: 'client' | 'merchant';
  courierId: string;
  courierName: string;
  courierCategory: ServiceCategory;
  courierPhotoUrl?: string;
  lastMessage: string;
  lastMessageAt: string;
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
  contractId?: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  conversationId: string;
  clientId: string;
  clientName: string;
  clientRole: 'client' | 'merchant';
  courierId: string;
  courierName: string;
  serviceCategory: ServiceCategory;
  description: string;
  agreedPriceArs: number | null;
  modality: 'puntual' | 'recurrente';
  status: ContractStatus;
  rated: boolean;
  ratingValue?: number;
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
  isDemo?: boolean;
  createdAt: string;
}

export interface CurrentSession {
  uid: string;
  role: UserRole;
  displayName: string;
  city: CityName;
  isAnonymous: boolean;
  email?: string;
  phone?: string;
}
