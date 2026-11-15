import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, FIRESTORE_COLLECTIONS, isFirebaseConfigured } from '../firebase/config';
import type {
  AvailabilityStatus,
  ChatMessage,
  CityName,
  Contract,
  Conversation,
  CourierPublicProfile,
  CurrentSession,
  JobOpportunity,
  MerchantProfile,
  RatingRecord,
  ServiceCategory,
  TariffItem,
} from '../types/synk';
import { computeCourierPoints, generateRandomNickname, normalizeNickname } from '../utils/formatters';

const STORAGE_KEYS = {
  GUEST_PROFILE: 'synk_guest_profile_v1',
  LOCAL_SESSION: 'synk_local_session_v1',
  LOCAL_ACCOUNTS: 'synk_local_accounts_v1',
  LOCAL_COURIERS: 'synk_local_couriers_v1',
  LOCAL_MERCHANTS: 'synk_local_merchants_v1',
  LOCAL_FAVORITES: 'synk_local_favorites_v1',
  LOCAL_CONVERSATIONS: 'synk_local_conversations_v1',
  LOCAL_MESSAGES: 'synk_local_messages_v1',
  LOCAL_CONTRACTS: 'synk_local_contracts_v1',
  LOCAL_RATINGS: 'synk_local_ratings_v1',
  LOCAL_JOBS: 'synk_local_jobs_v1',
  FIRST_JOB_PREFIX: 'alamano_first_job_celebrated_',
} as const;

interface LocalAccount {
  uid: string;
  email: string;
  passwordHash: string;
  role: 'courier' | 'merchant';
  phone: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
}

interface StoredGuest {
  id: string;
  nickname: string;
  city: CityName;
  onboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourierRegistrationInput {
  firstName: string;
  lastName: string;
  publicName: string;
  phone: string;
  email: string;
  password: string;
  serviceCategory: ServiceCategory;
  serviceCategories?: ServiceCategory[];
  vehicle: string;
  city: CityName;
  workZone: string;
  description: string;
}

export interface MerchantRegistrationInput {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  city: CityName;
  category: string;
}

export interface SynkStateSnapshot {
  ready: boolean;
  firebaseConnected: boolean;
  needsOnboarding: boolean;
  firstJobCelebrationPending: boolean;
  session: CurrentSession;
  couriers: CourierPublicProfile[];
  merchants: MerchantProfile[];
  favorites: string[];
  conversations: Conversation[];
  messagesByConv: Record<string, ChatMessage[]>;
  contracts: Contract[];
  ratings: RatingRecord[];
  jobOpportunities: JobOpportunity[];
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Error saving local state:', err);
  }
}

async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `fb_${Math.abs(hash)}`;
}

function makeId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 12)}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function computeStartingPrice(tariffs: TariffItem[]): number | null {
  const prices = tariffs
    .map((t) => t.priceArs)
    .filter((p): p is number => typeof p === 'number' && p > 0);
  if (prices.length === 0) return null;
  return Math.min(...prices);
}

function resolveAvailabilityStatus(data: Record<string, unknown>): AvailabilityStatus {
  const raw = data.availabilityStatus;
  if (raw === 'available' || raw === 'busy' || raw === 'offline') {
    return raw;
  }
  return data.isAvailable === false ? 'busy' : 'available';
}

function sanitizeFirestoreValue(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeFirestoreValue(item));
  }
  if (Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitizeFirestoreValue(v);
    }
    return out;
  }
  return value;
}

function sanitizeFirestoreData<T extends Record<string, unknown>>(payload: T): Record<string, unknown> {
  return sanitizeFirestoreValue(payload) as Record<string, unknown>;
}

class SynkStore {
  private listeners = new Set<(state: SynkStateSnapshot) => void>();
  private channel: BroadcastChannel | null = null;
  private initialized = false;
  private fbUnsubs: Array<() => void> = [];
  private fbConvUnsubs: Array<() => void> = [];

  private state: SynkStateSnapshot = {
    ready: false,
    firebaseConnected: isFirebaseConfigured,
    needsOnboarding: false,
    firstJobCelebrationPending: false,
    session: {
      uid: 'guest-pending',
      role: 'client',
      displayName: '@invitado',
      city: 'Trelew',
      isAnonymous: true,
    },
    couriers: [],
    merchants: [],
    favorites: [],
    conversations: [],
    messagesByConv: {},
    contracts: [],
    ratings: [],
    jobOpportunities: [],
  };

  subscribe(listener: (state: SynkStateSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    if (!this.initialized) {
      this.init();
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): SynkStateSnapshot {
    return this.state;
  }

  private emit(): void {
    this.state = { ...this.state };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  private broadcastSync(): void {
    this.channel?.postMessage({ type: 'refresh' });
  }

  private ensureGuestRecord(): StoredGuest {
    const existing = readJSON<StoredGuest | null>(STORAGE_KEYS.GUEST_PROFILE, null);
    if (existing && existing.id && existing.nickname) {
      return existing;
    }
    const now = new Date().toISOString();
    const fresh: StoredGuest = {
      id: makeId('guest'),
      nickname: generateRandomNickname(),
      city: 'Trelew',
      onboarded: false,
      createdAt: now,
      updatedAt: now,
    };
    writeJSON(STORAGE_KEYS.GUEST_PROFILE, fresh);
    return fresh;
  }

  private loadLocalCollections(): void {
    const guest = this.ensureGuestRecord();
    const rawCouriers = readJSON<CourierPublicProfile[]>(STORAGE_KEYS.LOCAL_COURIERS, []);
    const localCouriers = rawCouriers.map((c) => {
      const availabilityStatus = resolveAvailabilityStatus(c as unknown as Record<string, unknown>);
      return {
        ...c,
        availabilityStatus,
        isAvailable: availabilityStatus === 'available',
        points: typeof c.points === 'number' ? c.points : c.completedCount * 10,
      };
    });

    const localMerchants = readJSON<MerchantProfile[]>(STORAGE_KEYS.LOCAL_MERCHANTS, []);
    const allFavs = readJSON<Record<string, string[]>>(STORAGE_KEYS.LOCAL_FAVORITES, {});
    const localConversations = readJSON<Conversation[]>(STORAGE_KEYS.LOCAL_CONVERSATIONS, []);
    const localMessages = readJSON<Record<string, ChatMessage[]>>(STORAGE_KEYS.LOCAL_MESSAGES, {});
    const localContracts = readJSON<Contract[]>(STORAGE_KEYS.LOCAL_CONTRACTS, []);
    const localRatings = readJSON<RatingRecord[]>(STORAGE_KEYS.LOCAL_RATINGS, []);
    const localJobs = readJSON<JobOpportunity[]>(STORAGE_KEYS.LOCAL_JOBS, []);

    const activeLocalSession = readJSON<CurrentSession | null>(STORAGE_KEYS.LOCAL_SESSION, null);
    const session: CurrentSession = activeLocalSession || {
      uid: guest.id,
      role: 'client',
      displayName: guest.nickname,
      city: guest.city || 'Trelew',
      isAnonymous: true,
    };

    const userFavorites = allFavs[session.uid] || [];
    const userConversations = localConversations
      .filter((c) => c.participantIds.includes(session.uid) || (session.role === 'client' && c.clientId === guest.id))
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));

    const userContracts = localContracts
      .filter((c) => c.clientId === session.uid || c.courierId === session.uid)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    this.state = {
      ...this.state,
      ready: true,
      firebaseConnected: false,
      needsOnboarding: session.role === 'client' && !guest.onboarded,
      session,
      couriers: localCouriers,
      merchants: localMerchants,
      favorites: userFavorites,
      conversations: userConversations,
      messagesByConv: localMessages,
      contracts: userContracts,
      ratings: localRatings,
      jobOpportunities: [...localJobs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    };
    this.emit();
  }

  private async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel('alamano_sync');
      this.channel.onmessage = () => {
        if (!isFirebaseConfigured) {
          this.loadLocalCollections();
        }
      };
    }

    if (!isFirebaseConfigured || !auth || !db) {
      this.loadLocalCollections();
      return;
    }

    // Real Firebase Initialization
    onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        try {
          await signInAnonymously(auth!);
        } catch (err) {
          console.error('Error en autenticación anónima:', err);
          this.loadLocalCollections();
        }
        return;
      }

      const guest = this.ensureGuestRecord();
      let session: CurrentSession = {
        uid: fbUser.uid,
        role: 'client',
        displayName: guest.nickname,
        city: guest.city || 'Trelew',
        isAnonymous: fbUser.isAnonymous,
      };
      let needsOnboarding = false;

      if (fbUser.isAnonymous) {
        const guestRef = doc(db!, FIRESTORE_COLLECTIONS.GUEST_CLIENTS, fbUser.uid);
        try {
          const snap = await getDoc(guestRef);
          if (snap.exists()) {
            const data = snap.data();
            session.displayName = data.nickname || guest.nickname;
            session.city = (data.city as CityName) || guest.city || 'Trelew';
            needsOnboarding = !guest.onboarded;
          } else {
            needsOnboarding = !guest.onboarded;
            await setDoc(
              guestRef,
              sanitizeFirestoreData({
                id: fbUser.uid,
                nickname: guest.nickname || '@invitado',
                city: guest.city || 'Trelew',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              })
            );
          }
        } catch (err) {
          console.error('Error leyendo guest_clients:', err);
          needsOnboarding = !guest.onboarded;
        }
      } else {
        try {
          const privSnap = await getDoc(doc(db!, FIRESTORE_COLLECTIONS.USERS_PRIVATE, fbUser.uid));
          if (privSnap.exists()) {
            const priv = privSnap.data();
            const role = priv.role as 'courier' | 'merchant';
            session = {
              uid: fbUser.uid,
              role,
              displayName:
                role === 'courier'
                  ? `${priv.firstName || ''} ${priv.lastName || ''}`.trim()
                  : priv.businessName || 'Comercio',
              city: guest.city || 'Trelew',
              isAnonymous: false,
              email: priv.email || fbUser.email || undefined,
              phone: priv.phone,
            };
            if (role === 'courier') {
              const pubSnap = await getDoc(doc(db!, FIRESTORE_COLLECTIONS.COURIERS_PUBLIC, fbUser.uid));
              if (pubSnap.exists()) {
                session.displayName = pubSnap.data().publicName || session.displayName;
                session.city = (pubSnap.data().city as CityName) || session.city;
              }
            } else if (role === 'merchant') {
              const mSnap = await getDoc(doc(db!, FIRESTORE_COLLECTIONS.MERCHANTS, fbUser.uid));
              if (mSnap.exists()) {
                session.displayName = mSnap.data().businessName || session.displayName;
                session.city = (mSnap.data().city as CityName) || session.city;
              }
            }
          }
        } catch (err) {
          console.error('Error leyendo users_private:', err);
        }
      }

      this.state = {
        ...this.state,
        ready: true,
        firebaseConnected: true,
        needsOnboarding,
        session,
      };
      this.emit();
      this.attachFirebaseListeners(fbUser.uid);
    });
  }

  private clearFirebaseListeners(): void {
    this.fbUnsubs.forEach((u) => u());
    this.fbUnsubs = [];
    this.fbConvUnsubs.forEach((u) => u());
    this.fbConvUnsubs = [];
  }

  private attachFirebaseListeners(uid: string): void {
    if (!db) return;
    this.clearFirebaseListeners();

    // 1. Public Couriers + Tariffs subcollection
    const unsubCouriers = onSnapshot(
      collection(db, FIRESTORE_COLLECTIONS.COURIERS_PUBLIC),
      async (snapshot) => {
        const realCouriers: CourierPublicProfile[] = await Promise.all(
          snapshot.docs.map(async (d) => {
            const data = d.data();
            let tariffs: TariffItem[] = [];
            try {
              const tSnap = await getDocs(
                collection(
                  db!,
                  FIRESTORE_COLLECTIONS.COURIERS_PUBLIC,
                  d.id,
                  FIRESTORE_COLLECTIONS.TARIFFS_SUBCOLLECTION
                )
              );
              tariffs = tSnap.docs.map((td) => ({
                id: td.id,
                courierId: d.id,
                ...(td.data() as Omit<TariffItem, 'id' | 'courierId'>),
              }));
            } catch {
              tariffs = [];
            }
            const availabilityStatus = resolveAvailabilityStatus(data as Record<string, unknown>);
            const completedCount = Number(data.completedCount || 0);
            const primaryCat = (data.serviceCategory as ServiceCategory) || 'motomandado';
            const serviceCategories: ServiceCategory[] =
              Array.isArray(data.serviceCategories) && data.serviceCategories.length > 0
                ? (data.serviceCategories as ServiceCategory[])
                : [primaryCat];
            const courierRatings = this.state.ratings.filter((r) => r.courierId === d.id);
            const points = computeCourierPoints(
              completedCount,
              courierRatings,
              typeof data.points === 'number' ? data.points : undefined
            );

            return {
              id: d.id,
              publicName: data.publicName || 'Prestador',
              photoUrl: data.photoUrl || null,
              contactPhone: data.contactPhone || '',
              serviceCategory: serviceCategories[0] || primaryCat,
              serviceCategories,
              vehicle: data.vehicle || '',
              city: (data.city as CityName) || 'Trelew',
              workZone: data.workZone || '',
              coverageZones: Array.isArray(data.coverageZones) ? data.coverageZones : [],
              schedule: data.schedule || 'Horario a convenir',
              description: data.description || '',
              extraServices: Array.isArray(data.extraServices) ? data.extraServices : [],
              startingPriceArs:
                typeof data.startingPriceArs === 'number'
                  ? data.startingPriceArs
                  : computeStartingPrice(tariffs),
              availabilityStatus,
              isAvailable: availabilityStatus === 'available',
              activeContractId: data.activeContractId || null,
              ratingAverage:
                courierRatings.length > 0
                  ? Number(
                      (
                        courierRatings.reduce((acc, r) => acc + r.score, 0) /
                        courierRatings.length
                      ).toFixed(2)
                    )
                  : Number(data.ratingAverage || 0),
              ratingCount:
                courierRatings.length > 0
                  ? courierRatings.length
                  : Number(data.ratingCount || 0),
              completedCount,
              points,
              tariffs,
              createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
              updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
            };
          })
        );
        this.state = { ...this.state, couriers: realCouriers };
        this.emit();
      },
      (err) => console.error('Snapshot couriers_public error:', err)
    );
    this.fbUnsubs.push(unsubCouriers);

    // 2. Merchants
    const unsubMerchants = onSnapshot(
      collection(db, FIRESTORE_COLLECTIONS.MERCHANTS),
      (snapshot) => {
        const realMerchants: MerchantProfile[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            businessName: data.businessName || 'Comercio',
            ownerName: data.ownerName || '',
            address: data.address || '',
            city: (data.city as CityName) || 'Trelew',
            category: data.category || 'Otro',
            description: data.description || '',
            createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          };
        });
        this.state = { ...this.state, merchants: realMerchants };
        this.emit();
      },
      (err) => console.error('Snapshot merchants error:', err)
    );
    this.fbUnsubs.push(unsubMerchants);

    // 3. Favorites: users/{userId}/favorites/{courierId}
    const unsubFavs = onSnapshot(
      collection(db, FIRESTORE_COLLECTIONS.USERS_ROOT, uid, FIRESTORE_COLLECTIONS.FAVORITES_SUBCOLLECTION),
      (snapshot) => {
        this.state = { ...this.state, favorites: snapshot.docs.map((d) => d.id) };
        this.emit();
      },
      (err) => console.error('Snapshot favorites error:', err)
    );
    this.fbUnsubs.push(unsubFavs);

    // 4. Conversations + Messages
    const convQuery = query(
      collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS),
      where('participantIds', 'array-contains', uid)
    );
    const unsubConvs = onSnapshot(
      convQuery,
      (snapshot) => {
        const convs: Conversation[] = snapshot.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              participantIds: data.participantIds || [],
              clientId: data.clientId,
              clientName: data.clientName,
              clientRole: data.clientRole || 'client',
              courierId: data.courierId,
              courierName: data.courierName,
              courierCategory: data.courierCategory || 'motomandado',
              courierPhotoUrl: data.courierPhotoUrl || null,
              lastMessage: data.lastMessage || '',
              lastMessageAt:
                data.lastMessageAt?.toDate?.()?.toISOString?.() ||
                data.lastMessageAt ||
                new Date().toISOString(),
              createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
              updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
            };
          })
          .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));

        this.fbConvUnsubs.forEach((u) => u());
        this.fbConvUnsubs = [];

        convs.forEach((conv) => {
          const msgQuery = query(
            collection(
              db!,
              FIRESTORE_COLLECTIONS.CONVERSATIONS,
              conv.id,
              FIRESTORE_COLLECTIONS.MESSAGES_SUBCOLLECTION
            ),
            orderBy('createdAt', 'asc')
          );
          const unsubMsgs = onSnapshot(
            msgQuery,
            (msgSnap) => {
              const msgs: ChatMessage[] = msgSnap.docs.map((md) => {
                const m = md.data();
                return {
                  id: md.id,
                  conversationId: conv.id,
                  senderId: m.senderId,
                  senderName: m.senderName,
                  senderRole: m.senderRole,
                  text: m.text,
                  messageType: m.messageType || 'text',
                  contractId: m.contractId || null,
                  createdAt:
                    m.createdAt?.toDate?.()?.toISOString?.() ||
                    m.createdAt ||
                    new Date().toISOString(),
                };
              });
              this.state = {
                ...this.state,
                messagesByConv: { ...this.state.messagesByConv, [conv.id]: msgs },
              };
              this.emit();
            },
            (err) => console.error('Snapshot messages error:', err)
          );
          this.fbConvUnsubs.push(unsubMsgs);
        });

        this.state = {
          ...this.state,
          conversations: convs,
        };
        this.emit();
      },
      (err) => console.error('Snapshot conversations error:', err)
    );
    this.fbUnsubs.push(unsubConvs);

    // 5. Contracts
    const unsubContractsClient = onSnapshot(
      query(collection(db, FIRESTORE_COLLECTIONS.CONTRACTS), where('clientId', '==', uid)),
      (snap) => {
        this.mergeFirebaseContracts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error('Snapshot contracts (client) error:', err)
    );
    const unsubContractsCourier = onSnapshot(
      query(collection(db, FIRESTORE_COLLECTIONS.CONTRACTS), where('courierId', '==', uid)),
      (snap) => {
        this.mergeFirebaseContracts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error('Snapshot contracts (courier) error:', err)
    );
    this.fbUnsubs.push(unsubContractsClient, unsubContractsCourier);

    // 6. Ratings
    const unsubRatings = onSnapshot(
      collection(db, FIRESTORE_COLLECTIONS.RATINGS),
      (snap) => {
        const realRatings: RatingRecord[] = snap.docs.map((d) => {
          const r = d.data();
          return {
            contractId: d.id,
            courierId: r.courierId,
            clientId: r.clientId,
            clientName: r.clientName,
            score: Number(r.score || 5),
            comment: r.comment || '',
            createdAt: r.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          };
        });
        const enrichedCouriers = this.state.couriers.map((c) => {
          const cRatings = realRatings.filter((r) => r.courierId === c.id);
          const nextPoints = computeCourierPoints(c.completedCount, cRatings, c.points);
          if (cRatings.length === 0) {
            return { ...c, points: nextPoints };
          }
          const avg = Number(
            (cRatings.reduce((acc, r) => acc + r.score, 0) / cRatings.length).toFixed(2)
          );
          return {
            ...c,
            ratingAverage: avg,
            ratingCount: cRatings.length,
            points: nextPoints,
          };
        });
        this.state = { ...this.state, ratings: realRatings, couriers: enrichedCouriers };
        this.emit();
      },
      (err) => console.error('Snapshot ratings error:', err)
    );
    this.fbUnsubs.push(unsubRatings);

    // 7. Job Opportunities
    const unsubJobs = onSnapshot(
      collection(db, FIRESTORE_COLLECTIONS.JOB_OPPORTUNITIES),
      (snap) => {
        const realJobs: JobOpportunity[] = snap.docs.map((d) => {
          const j = d.data();
          return {
            id: d.id,
            merchantId: j.merchantId,
            merchantName: j.merchantName,
            merchantCategory: j.merchantCategory,
            city: j.city || 'Trelew',
            title: j.title,
            description: j.description,
            serviceCategory: j.serviceCategory || 'motomandado',
            modality: j.modality || 'puntual',
            paySummary: j.paySummary || 'A convenir',
            status: j.status || 'open',
            createdAt: j.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          };
        });
        this.state = {
          ...this.state,
          jobOpportunities: realJobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        };
        this.emit();
      },
      (err) => console.error('Snapshot job_opportunities error:', err)
    );
    this.fbUnsubs.push(unsubJobs);
  }

  private mergeFirebaseContracts(docs: Array<Record<string, unknown>>): void {
    const map = new Map<string, Contract>();
    this.state.contracts.forEach((c) => map.set(c.id, c));
    docs.forEach((raw) => {
      const id = String(raw.id);
      const toIso = (val: unknown) =>
        val && typeof (val as { toDate?: () => Date }).toDate === 'function'
          ? (val as { toDate: () => Date }).toDate().toISOString()
          : typeof val === 'string'
          ? val
          : new Date().toISOString();
      map.set(id, {
        id,
        conversationId: String(raw.conversationId || ''),
        clientId: String(raw.clientId || ''),
        clientName: String(raw.clientName || ''),
        clientRole: (raw.clientRole as 'client' | 'merchant') || 'client',
        courierId: String(raw.courierId || ''),
        courierName: String(raw.courierName || ''),
        serviceCategory: (raw.serviceCategory as ServiceCategory) || 'motomandado',
        description: String(raw.description || ''),
        agreedPriceArs: typeof raw.agreedPriceArs === 'number' ? raw.agreedPriceArs : null,
        modality: (raw.modality as 'puntual' | 'recurrente') || 'puntual',
        status: (raw.status as Contract['status']) || 'proposed',
        rated: Boolean(raw.rated),
        ratingValue: typeof raw.ratingValue === 'number' ? raw.ratingValue : null,
        createdAt: toIso(raw.createdAt),
        acceptedAt: raw.acceptedAt ? toIso(raw.acceptedAt) : null,
        completedAt: raw.completedAt ? toIso(raw.completedAt) : null,
        cancelledAt: raw.cancelledAt ? toIso(raw.cancelledAt) : null,
        updatedAt: toIso(raw.updatedAt),
      });
    });
    this.state = {
      ...this.state,
      contracts: Array.from(map.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    };
    this.emit();
  }

  // ---- GUEST & ONBOARDING ACTIONS ----
  async enterAsGuestClient(): Promise<void> {
    const guest = this.ensureGuestRecord();
    const nickname = guest.nickname || generateRandomNickname();
    await this.completeGuestOnboarding(nickname, guest.city || 'Trelew');
  }

  async completeGuestOnboarding(nicknameInput: string, city?: CityName): Promise<void> {
    const nickname = normalizeNickname(nicknameInput);
    const guest = this.ensureGuestRecord();
    const nextCity = city || guest.city || 'Trelew';
    const updated: StoredGuest = {
      ...guest,
      nickname,
      city: nextCity,
      onboarded: true,
      updatedAt: new Date().toISOString(),
    };
    writeJSON(STORAGE_KEYS.GUEST_PROFILE, updated);

    if (isFirebaseConfigured && db && this.state.session.isAnonymous) {
      await setDoc(
        doc(db, FIRESTORE_COLLECTIONS.GUEST_CLIENTS, this.state.session.uid),
        sanitizeFirestoreData({
          id: this.state.session.uid,
          nickname: nickname || '@invitado',
          city: nextCity || 'Trelew',
          updatedAt: serverTimestamp(),
        }),
        { merge: true }
      );
    }

    if (this.state.session.role === 'client') {
      this.state = {
        ...this.state,
        needsOnboarding: false,
        session: {
          ...this.state.session,
          displayName: nickname,
          city: nextCity,
        },
      };
      this.emit();
    } else {
      this.state = { ...this.state, needsOnboarding: false };
      this.emit();
    }
    this.broadcastSync();
  }

  async updateCity(city: CityName): Promise<void> {
    const guest = this.ensureGuestRecord();
    writeJSON(STORAGE_KEYS.GUEST_PROFILE, { ...guest, city, updatedAt: new Date().toISOString() });

    if (this.state.session.role === 'client' && isFirebaseConfigured && db) {
      await setDoc(
        doc(db, FIRESTORE_COLLECTIONS.GUEST_CLIENTS, this.state.session.uid),
        sanitizeFirestoreData({ city: city || 'Trelew', updatedAt: serverTimestamp() }),
        { merge: true }
      );
    }

    const activeLocal = readJSON<CurrentSession | null>(STORAGE_KEYS.LOCAL_SESSION, null);
    if (activeLocal) {
      writeJSON(STORAGE_KEYS.LOCAL_SESSION, { ...activeLocal, city });
    }

    this.state = {
      ...this.state,
      session: { ...this.state.session, city },
    };
    this.emit();
  }

  dismissFirstJobCelebration(): void {
    if (!this.state.firstJobCelebrationPending) return;
    this.state = { ...this.state, firstJobCelebrationPending: false };
    this.emit();
  }

  // ---- AUTH: REGISTER & LOGIN ----
  async registerCourier(input: CourierRegistrationInput): Promise<void> {
    const now = new Date().toISOString();
    const email = input.email.trim().toLowerCase();

    if (isFirebaseConfigured && auth && db) {
      const cred = await createUserWithEmailAndPassword(auth, email, input.password);
      const uid = cred.user.uid;
      const batch = writeBatch(db);
      batch.set(
        doc(db, FIRESTORE_COLLECTIONS.USERS_PRIVATE, uid),
        sanitizeFirestoreData({
          id: uid,
          role: 'courier',
          email,
          phone: input.phone?.trim() || '',
          firstName: input.firstName?.trim() || '',
          lastName: input.lastName?.trim() || '',
          businessName: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      const categories =
        input.serviceCategories && input.serviceCategories.length > 0
          ? input.serviceCategories
          : [input.serviceCategory];
      batch.set(
        doc(db, FIRESTORE_COLLECTIONS.COURIERS_PUBLIC, uid),
        sanitizeFirestoreData({
          id: uid,
          publicName:
            input.publicName?.trim() ||
            `${input.firstName?.trim() || ''} ${input.lastName?.trim() || ''}`.trim() ||
            'Prestador',
          photoUrl: null,
          contactPhone: input.phone?.trim() || '',
          serviceCategory: categories[0] || 'motomandado',
          serviceCategories: categories,
          vehicle: input.vehicle?.trim() || '',
          city: input.city || 'Trelew',
          workZone: input.workZone?.trim() || '',
          coverageZones: (input.workZone || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          schedule: 'Lun a Sáb 09:00 a 20:00',
          description: input.description?.trim() || '',
          extraServices: [],
          startingPriceArs: null,
          availabilityStatus: 'available',
          isAvailable: true,
          activeContractId: null,
          ratingAverage: 0,
          ratingCount: 0,
          completedCount: 0,
          points: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      await batch.commit();
      return;
    }

    // Local persistence mode (offline fallback)
    const accounts = readJSON<LocalAccount[]>(STORAGE_KEYS.LOCAL_ACCOUNTS, []);
    if (accounts.some((a) => a.email === email)) {
      throw new Error('Ya existe una cuenta registrada con ese correo electrónico.');
    }
    const uid = makeId('courier');
    const passwordHash = await hashPassword(input.password);
    accounts.push({
      uid,
      email,
      passwordHash,
      role: 'courier',
      phone: input.phone.trim(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
    });
    writeJSON(STORAGE_KEYS.LOCAL_ACCOUNTS, accounts);

    const couriers = readJSON<CourierPublicProfile[]>(STORAGE_KEYS.LOCAL_COURIERS, []);
    const publicName = input.publicName.trim() || `${input.firstName.trim()} ${input.lastName.trim()}`;
    const categories =
      input.serviceCategories && input.serviceCategories.length > 0
        ? input.serviceCategories
        : [input.serviceCategory];
    const newCourier: CourierPublicProfile = {
      id: uid,
      publicName,
      contactPhone: input.phone.trim(),
      serviceCategory: categories[0],
      serviceCategories: categories,
      vehicle: input.vehicle.trim(),
      city: input.city,
      workZone: input.workZone.trim(),
      coverageZones: input.workZone
        .split(/[,·]/)
        .map((s) => s.trim())
        .filter(Boolean),
      schedule: 'Lun a Sáb 09:00 a 20:00',
      description: input.description.trim(),
      extraServices: [],
      startingPriceArs: null,
      availabilityStatus: 'available',
      isAvailable: true,
      activeContractId: null,
      ratingAverage: 0,
      ratingCount: 0,
      completedCount: 0,
      points: 0,
      tariffs: [],
      createdAt: now,
      updatedAt: now,
    };
    couriers.unshift(newCourier);
    writeJSON(STORAGE_KEYS.LOCAL_COURIERS, couriers);

    const session: CurrentSession = {
      uid,
      role: 'courier',
      displayName: publicName,
      city: input.city,
      isAnonymous: false,
      email,
      phone: input.phone.trim(),
    };
    writeJSON(STORAGE_KEYS.LOCAL_SESSION, session);
    this.broadcastSync();
    this.loadLocalCollections();
  }

  async registerMerchant(input: MerchantRegistrationInput): Promise<void> {
    const now = new Date().toISOString();
    const email = input.email.trim().toLowerCase();

    if (isFirebaseConfigured && auth && db) {
      const cred = await createUserWithEmailAndPassword(auth, email, input.password);
      const uid = cred.user.uid;
      const batch = writeBatch(db);
      batch.set(
        doc(db, FIRESTORE_COLLECTIONS.USERS_PRIVATE, uid),
        sanitizeFirestoreData({
          id: uid,
          role: 'merchant',
          email,
          phone: input.phone?.trim() || '',
          firstName: '',
          lastName: '',
          businessName: input.businessName?.trim() || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      batch.set(
        doc(db, FIRESTORE_COLLECTIONS.MERCHANTS, uid),
        sanitizeFirestoreData({
          id: uid,
          businessName: input.businessName?.trim() || '',
          ownerName: input.ownerName?.trim() || '',
          address: input.address?.trim() || '',
          city: input.city || 'Trelew',
          category: input.category || 'Otro',
          description: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      await batch.commit();
      return;
    }

    const accounts = readJSON<LocalAccount[]>(STORAGE_KEYS.LOCAL_ACCOUNTS, []);
    if (accounts.some((a) => a.email === email)) {
      throw new Error('Ya existe una cuenta registrada con ese correo electrónico.');
    }
    const uid = makeId('merchant');
    const passwordHash = await hashPassword(input.password);
    accounts.push({
      uid,
      email,
      passwordHash,
      role: 'merchant',
      phone: input.phone.trim(),
      businessName: input.businessName.trim(),
    });
    writeJSON(STORAGE_KEYS.LOCAL_ACCOUNTS, accounts);

    const merchants = readJSON<MerchantProfile[]>(STORAGE_KEYS.LOCAL_MERCHANTS, []);
    const newMerchant: MerchantProfile = {
      id: uid,
      businessName: input.businessName.trim(),
      ownerName: input.ownerName.trim(),
      address: input.address.trim(),
      city: input.city,
      category: input.category,
      description: '',
      createdAt: now,
      updatedAt: now,
    };
    merchants.unshift(newMerchant);
    writeJSON(STORAGE_KEYS.LOCAL_MERCHANTS, merchants);

    const session: CurrentSession = {
      uid,
      role: 'merchant',
      displayName: input.businessName.trim(),
      city: input.city,
      isAnonymous: false,
      email,
      phone: input.phone.trim(),
    };
    writeJSON(STORAGE_KEYS.LOCAL_SESSION, session);
    this.broadcastSync();
    this.loadLocalCollections();
  }

  async loginWithEmail(emailInput: string, password: string): Promise<'courier' | 'merchant'> {
    const email = emailInput.trim().toLowerCase();

    if (isFirebaseConfigured && auth && db) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const priv = await getDoc(doc(db, FIRESTORE_COLLECTIONS.USERS_PRIVATE, cred.user.uid));
      return (priv.data()?.role as 'courier' | 'merchant') || 'courier';
    }

    const accounts = readJSON<LocalAccount[]>(STORAGE_KEYS.LOCAL_ACCOUNTS, []);
    const passwordHash = await hashPassword(password);
    const match = accounts.find((a) => a.email === email && a.passwordHash === passwordHash);
    if (!match) {
      throw new Error('Correo o contraseña incorrectos.');
    }

    let displayName = match.businessName || `${match.firstName || ''} ${match.lastName || ''}`.trim();
    let city: CityName = 'Trelew';
    if (match.role === 'courier') {
      const courier = readJSON<CourierPublicProfile[]>(STORAGE_KEYS.LOCAL_COURIERS, []).find(
        (c) => c.id === match.uid
      );
      if (courier) {
        displayName = courier.publicName;
        city = courier.city;
      }
    } else {
      const merchant = readJSON<MerchantProfile[]>(STORAGE_KEYS.LOCAL_MERCHANTS, []).find(
        (m) => m.id === match.uid
      );
      if (merchant) {
        displayName = merchant.businessName;
        city = merchant.city;
      }
    }

    const session: CurrentSession = {
      uid: match.uid,
      role: match.role,
      displayName,
      city,
      isAnonymous: false,
      email: match.email,
      phone: match.phone,
    };
    writeJSON(STORAGE_KEYS.LOCAL_SESSION, session);
    this.broadcastSync();
    this.loadLocalCollections();
    return match.role;
  }

  async sendPasswordReset(emailInput: string): Promise<void> {
    const email = emailInput.trim().toLowerCase();
    if (!email) {
      throw new Error('Ingresá tu correo electrónico para recuperar la contraseña.');
    }
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
      return;
    }
    const accounts = readJSON<LocalAccount[]>(STORAGE_KEYS.LOCAL_ACCOUNTS, []);
    if (!accounts.some((a) => a.email === email)) {
      throw new Error('No encontramos ninguna cuenta registrada con ese correo.');
    }
  }

  async logoutToGuest(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
      return;
    }
    localStorage.removeItem(STORAGE_KEYS.LOCAL_SESSION);
    this.broadcastSync();
    this.loadLocalCollections();
  }

  // ---- COURIER PROFILE & TARIFFS ----
  async updateOwnCourierProfile(
    courierId: string,
    patch: Partial<
      Pick<
        CourierPublicProfile,
        | 'publicName'
        | 'photoUrl'
        | 'contactPhone'
        | 'vehicle'
        | 'city'
        | 'workZone'
        | 'coverageZones'
        | 'schedule'
        | 'description'
        | 'extraServices'
        | 'serviceCategory'
        | 'serviceCategories'
      >
    >
  ): Promise<void> {
    if (this.state.session.uid !== courierId || this.state.session.role !== 'courier') {
      throw new Error('Solo podés modificar tu propio perfil de prestador.');
    }

    const cleanPatch: Record<string, unknown> = { ...patch };
    if ('photoUrl' in cleanPatch) {
      cleanPatch.photoUrl = cleanPatch.photoUrl || null;
    }
    if ('contactPhone' in cleanPatch) {
      cleanPatch.contactPhone = cleanPatch.contactPhone ?? '';
    }
    if ('description' in cleanPatch) {
      cleanPatch.description = cleanPatch.description ?? '';
    }
    if ('schedule' in cleanPatch) {
      cleanPatch.schedule = cleanPatch.schedule ?? '';
    }
    if (Array.isArray(cleanPatch.serviceCategories) && cleanPatch.serviceCategories.length > 0) {
      cleanPatch.serviceCategory = cleanPatch.serviceCategories[0];
    } else if (cleanPatch.serviceCategory && !cleanPatch.serviceCategories) {
      cleanPatch.serviceCategories = [cleanPatch.serviceCategory];
    }

    if (isFirebaseConfigured && db) {
      await updateDoc(
        doc(db, FIRESTORE_COLLECTIONS.COURIERS_PUBLIC, courierId),
        sanitizeFirestoreData({
          ...cleanPatch,
          updatedAt: serverTimestamp(),
        })
      );
      return;
    }

    const couriers = readJSON<CourierPublicProfile[]>(STORAGE_KEYS.LOCAL_COURIERS, []);
    const updated = couriers.map((c) =>
      c.id === courierId
        ? { ...c, ...(cleanPatch as Partial<CourierPublicProfile>), updatedAt: new Date().toISOString() }
        : c
    );
    writeJSON(STORAGE_KEYS.LOCAL_COURIERS, updated);
    if (cleanPatch.publicName || cleanPatch.city) {
      const active = readJSON<CurrentSession | null>(STORAGE_KEYS.LOCAL_SESSION, null);
      if (active) {
        writeJSON(STORAGE_KEYS.LOCAL_SESSION, {
          ...active,
          displayName: (cleanPatch.publicName as string) || active.displayName,
          city: (cleanPatch.city as CityName) || active.city,
        });
      }
    }
    this.broadcastSync();
    this.loadLocalCollections();
  }

  async setOwnAvailability(courierId: string, nextStatus: AvailabilityStatus): Promise<void> {
    if (this.state.session.uid !== courierId || this.state.session.role !== 'courier') {
      throw new Error('Solo podés cambiar tu propia disponibilidad.');
    }
    const activeContract = this.state.contracts.find(
      (c) => c.courierId === courierId && c.status === 'accepted'
    );
    if (nextStatus !== 'busy' && activeContract) {
      throw new Error(
        'Tenés un trabajo en curso. Marcalo como completado o cancelalo antes de cambiar tu estado.'
      );
    }

    const isAvailable = nextStatus === 'available';

    if (isFirebaseConfigured && db) {
      await updateDoc(
        doc(db, FIRESTORE_COLLECTIONS.COURIERS_PUBLIC, courierId),
        sanitizeFirestoreData({
          availabilityStatus: nextStatus,
          isAvailable,
          updatedAt: serverTimestamp(),
        })
      );
      return;
    }

    const couriers = readJSON<CourierPublicProfile[]>(STORAGE_KEYS.LOCAL_COURIERS, []);
    writeJSON(
      STORAGE_KEYS.LOCAL_COURIERS,
      couriers.map((c) =>
        c.id === courierId
          ? { ...c, availabilityStatus: nextStatus, isAvailable, updatedAt: new Date().toISOString() }
          : c
      )
    );
    this.broadcastSync();
    this.loadLocalCollections();
  }

  async saveCourierTariff(
    courierId: string,
    tariff: Omit<TariffItem, 'id' | 'courierId'> & { id?: string }
  ): Promise<void> {
    if (this.state.session.uid !== courierId || this.state.session.role !== 'courier') {
      throw new Error('Solo podés administrar tus propias tarifas.');
    }
    const tariffId = tariff.id || makeId('tariff');
    const cleanTariff: TariffItem = {
      id: tariffId,
      courierId,
      title: tariff.title.trim(),
      mode: tariff.mode,
      priceArs: tariff.mode === 'negotiable' ? null : (tariff.priceArs ?? null),
      unitLabel: tariff.unitLabel?.trim() || '',
      zoneName: tariff.zoneName?.trim() || '',
      notes: tariff.notes?.trim() || '',
    };

    if (isFirebaseConfigured && db) {
      await setDoc(
        doc(
          db,
          FIRESTORE_COLLECTIONS.COURIERS_PUBLIC,
          courierId,
          FIRESTORE_COLLECTIONS.TARIFFS_SUBCOLLECTION,
          tariffId
        ),
        sanitizeFirestoreData(cleanTariff as unknown as Record<string, unknown>)
      );
      const courier = this.state.couriers.find((c) => c.id === courierId);
      const nextTariffs = [
        ...(courier?.tariffs.filter((t) => t.id !== tariffId) || []),
        cleanTariff,
      ];
      await updateDoc(
        doc(db, FIRESTORE_COLLECTIONS.COURIERS_PUBLIC, courierId),
        sanitizeFirestoreData({
          startingPriceArs: computeStartingPrice(nextTariffs) ?? null,
          updatedAt: serverTimestamp(),
        })
      );
      return;
    }

    const couriers = readJSON<CourierPublicProfile[]>(STORAGE_KEYS.LOCAL_COURIERS, []);
    const updated = couriers.map((c) => {
      if (c.id !== courierId) return c;
      const nextTariffs = [...c.tariffs.filter((t) => t.id !== tariffId), cleanTariff];
      return {
        ...c,
        tariffs: nextTariffs,
        startingPriceArs: computeStartingPrice(nextTariffs),
        updatedAt: new Date().toISOString(),
      };
    });
    writeJSON(STORAGE_KEYS.LOCAL_COURIERS, updated);
    this.broadcastSync();
    this.loadLocalCollections();
  }

  async deleteCourierTariff(courierId: string, tariffId: string): Promise<void> {
    if (this.state.session.uid !== courierId || this.state.session.role !== 'courier') {
      throw new Error('Solo podés eliminar tus propias tarifas.');
    }

    if (isFirebaseConfigured && db) {
      await deleteDoc(
        doc(
          db,
          FIRESTORE_COLLECTIONS.COURIERS_PUBLIC,
          courierId,
          FIRESTORE_COLLECTIONS.TARIFFS_SUBCOLLECTION,
          tariffId
        )
      );
      const courier = this.state.couriers.find((c) => c.id === courierId);
      const nextTariffs = (courier?.tariffs || []).filter((t) => t.id !== tariffId);
      await updateDoc(
        doc(db, FIRESTORE_COLLECTIONS.COURIERS_PUBLIC, courierId),
        sanitizeFirestoreData({
          startingPriceArs: computeStartingPrice(nextTariffs) ?? null,
          updatedAt: serverTimestamp(),
        })
      );
      return;
    }

    const couriers = readJSON<CourierPublicProfile[]>(STORAGE_KEYS.LOCAL_COURIERS, []);
    const updated = couriers.map((c) => {
      if (c.id !== courierId) return c;
      const nextTariffs = c.tariffs.filter((t) => t.id !== tariffId);
      return {
        ...c,
        tariffs: nextTariffs,
        startingPriceArs: computeStartingPrice(nextTariffs),
        updatedAt: new Date().toISOString(),
      };
    });
    writeJSON(STORAGE_KEYS.LOCAL_COURIERS, updated);
    this.broadcastSync();
    this.loadLocalCollections();
  }

  // ---- MERCHANT PROFILE & JOBS ----
  async updateOwnMerchantProfile(
    merchantId: string,
    patch: Partial<
      Pick<MerchantProfile, 'businessName' | 'ownerName' | 'address' | 'city' | 'category' | 'description'>
    >
  ): Promise<void> {
    if (this.state.session.uid !== merchantId || this.state.session.role !== 'merchant') {
      throw new Error('Solo podés editar el perfil de tu propio comercio.');
    }

    if (isFirebaseConfigured && db) {
      await updateDoc(
        doc(db, FIRESTORE_COLLECTIONS.MERCHANTS, merchantId),
        sanitizeFirestoreData({
          ...patch,
          updatedAt: serverTimestamp(),
        })
      );
      return;
    }

    const merchants = readJSON<MerchantProfile[]>(STORAGE_KEYS.LOCAL_MERCHANTS, []);
    writeJSON(
      STORAGE_KEYS.LOCAL_MERCHANTS,
      merchants.map((m) =>
        m.id === merchantId ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m
      )
    );
    if (patch.businessName || patch.city) {
      const active = readJSON<CurrentSession | null>(STORAGE_KEYS.LOCAL_SESSION, null);
      if (active) {
        writeJSON(STORAGE_KEYS.LOCAL_SESSION, {
          ...active,
          displayName: patch.businessName || active.displayName,
          city: patch.city || active.city,
        });
      }
    }
    this.broadcastSync();
    this.loadLocalCollections();
  }

  async createJobOpportunity(input: {
    title: string;
    description: string;
    serviceCategory: ServiceCategory;
    modality: 'puntual' | 'recurrente' | 'turno';
    paySummary: string;
  }): Promise<void> {
    const { session } = this.state;
    if (session.role !== 'merchant') {
      throw new Error('Solo los comercios registrados pueden publicar oportunidades laborales.');
    }
    const merchant = this.state.merchants.find((m) => m.id === session.uid);
    const jobId = makeId('job');
    const now = new Date().toISOString();
    const record: JobOpportunity = {
      id: jobId,
      merchantId: session.uid,
      merchantName: merchant?.businessName || session.displayName,
      merchantCategory: merchant?.category || 'Comercio',
      city: merchant?.city || session.city,
      title: input.title.trim(),
      description: input.description.trim(),
      serviceCategory: input.serviceCategory,
      modality: input.modality,
      paySummary: input.paySummary.trim() || 'A convenir',
      status: 'open',
      createdAt: now,
    };

    if (isFirebaseConfigured && db) {
      await setDoc(
        doc(db, FIRESTORE_COLLECTIONS.JOB_OPPORTUNITIES, jobId),
        sanitizeFirestoreData({
          ...record,
          createdAt: serverTimestamp(),
        })
      );
      return;
    }

    const jobs = readJSON<JobOpportunity[]>(STORAGE_KEYS.LOCAL_JOBS, []);
    jobs.unshift(record);
    writeJSON(STORAGE_KEYS.LOCAL_JOBS, jobs);
    this.broadcastSync();
    this.loadLocalCollections();
  }

  async toggleJobOpportunityStatus(jobId: string): Promise<void> {
    const job = this.state.jobOpportunities.find((j) => j.id === jobId);
    if (!job || job.merchantId !== this.state.session.uid) {
      throw new Error('Solo el comercio creador puede modificar esta búsqueda.');
    }
    const nextStatus = job.status === 'open' ? 'closed' : 'open';

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, FIRESTORE_COLLECTIONS.JOB_OPPORTUNITIES, jobId), { status: nextStatus });
      return;
    }

    const jobs = readJSON<JobOpportunity[]>(STORAGE_KEYS.LOCAL_JOBS, []);
    writeJSON(
      STORAGE_KEYS.LOCAL_JOBS,
      jobs.map((j) => (j.id === jobId ? { ...j, status: nextStatus } : j))
    );
    this.broadcastSync();
    this.loadLocalCollections();
  }

  // ---- FAVORITES ----
  async toggleFavorite(courierId: string): Promise<void> {
    const uid = this.state.session.uid;
    const isFav = this.state.favorites.includes(courierId);

    if (isFirebaseConfigured && db) {
      const favRef = doc(
        db,
        FIRESTORE_COLLECTIONS.USERS_ROOT,
        uid,
        FIRESTORE_COLLECTIONS.FAVORITES_SUBCOLLECTION,
        courierId
      );
      if (isFav) {
        await deleteDoc(favRef);
      } else {
        await setDoc(favRef, { courierId, createdAt: serverTimestamp() });
      }
      return;
    }

    const allFavs = readJSON<Record<string, string[]>>(STORAGE_KEYS.LOCAL_FAVORITES, {});
    const current = allFavs[uid] || [];
    allFavs[uid] = isFav ? current.filter((id) => id !== courierId) : [...current, courierId];
    writeJSON(STORAGE_KEYS.LOCAL_FAVORITES, allFavs);
    this.broadcastSync();
    this.loadLocalCollections();
  }

  // ---- CONVERSATIONS & CHAT ----
  async startOrOpenConversation(courier: CourierPublicProfile, initialMessage?: string): Promise<string> {
    const { session } = this.state;
    if (session.uid === courier.id) {
      throw new Error('No podés iniciar una conversación con tu propio perfil.');
    }
    if (courier.availabilityStatus === 'busy') {
      throw new Error(
        'Este prestador se encuentra realizando otro trabajo. Contactá a un prestador disponible.'
      );
    }
    if (courier.availabilityStatus === 'offline') {
      throw new Error(
        'Este prestador está desconectado (fuera de horario laboral). Contactá a un prestador disponible.'
      );
    }

    const existing = this.state.conversations.find(
      (c) => c.clientId === session.uid && c.courierId === courier.id
    );
    if (existing) {
      if (initialMessage) {
        await this.sendMessage(existing.id, initialMessage);
      }
      return existing.id;
    }

    const convId = `${session.uid}__${courier.id}`;
    const now = new Date().toISOString();
    const conv: Conversation = {
      id: convId,
      participantIds: [session.uid, courier.id],
      clientId: session.uid,
      clientName: session.displayName || '@invitado',
      clientRole: session.role === 'merchant' ? 'merchant' : 'client',
      courierId: courier.id,
      courierName: courier.publicName || 'Prestador',
      courierCategory: courier.serviceCategory || 'motomandado',
      courierPhotoUrl: courier.photoUrl || null,
      lastMessage: initialMessage || 'Conversación iniciada',
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
      await setDoc(
        doc(db, FIRESTORE_COLLECTIONS.CONVERSATIONS, convId),
        sanitizeFirestoreData({
          ...conv,
          courierPhotoUrl: courier.photoUrl || null,
          lastMessageAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      if (initialMessage) {
        await this.sendMessage(convId, initialMessage);
      }
      return convId;
    }

    const convs = readJSON<Conversation[]>(STORAGE_KEYS.LOCAL_CONVERSATIONS, []);
    convs.unshift(conv);
    writeJSON(STORAGE_KEYS.LOCAL_CONVERSATIONS, convs);
    if (initialMessage) {
      await this.sendMessage(convId, initialMessage);
    } else {
      this.broadcastSync();
      this.loadLocalCollections();
    }
    return convId;
  }

  async sendMessage(
    conversationId: string,
    text: string,
    messageType: ChatMessage['messageType'] = 'text',
    contractId?: string
  ): Promise<void> {
    const clean = text.trim();
    if (!clean) return;
    const { session } = this.state;

    const msgId = makeId('msg');
    const now = new Date().toISOString();
    const msg: ChatMessage = {
      id: msgId,
      conversationId,
      senderId: session.uid,
      senderName: session.displayName || '@invitado',
      senderRole: session.role,
      text: clean,
      messageType,
      contractId: contractId || null,
      createdAt: now,
    };

    if (isFirebaseConfigured && db) {
      const batch = writeBatch(db);
      batch.set(
        doc(
          db,
          FIRESTORE_COLLECTIONS.CONVERSATIONS,
          conversationId,
          FIRESTORE_COLLECTIONS.MESSAGES_SUBCOLLECTION,
          msgId
        ),
        sanitizeFirestoreData({ ...msg, contractId: contractId || null, createdAt: serverTimestamp() })
      );
      batch.update(
        doc(db, FIRESTORE_COLLECTIONS.CONVERSATIONS, conversationId),
        sanitizeFirestoreData({
          lastMessage: clean,
          lastMessageAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      await batch.commit();
      return;
    }

    const allMsgs = readJSON<Record<string, ChatMessage[]>>(STORAGE_KEYS.LOCAL_MESSAGES, {});
    allMsgs[conversationId] = [...(allMsgs[conversationId] || []), msg];
    writeJSON(STORAGE_KEYS.LOCAL_MESSAGES, allMsgs);

    const convs = readJSON<Conversation[]>(STORAGE_KEYS.LOCAL_CONVERSATIONS, []);
    writeJSON(
      STORAGE_KEYS.LOCAL_CONVERSATIONS,
      convs.map((c) =>
        c.id === conversationId ? { ...c, lastMessage: clean, lastMessageAt: now, updatedAt: now } : c
      )
    );
    this.broadcastSync();
    this.loadLocalCollections();
  }

  // ---- CONTRACTS & AVAILABILITY STATE MACHINE ----
  async proposeContract(input: {
    conversationId: string;
    description: string;
    agreedPriceArs: number | null;
    modality: 'puntual' | 'recurrente';
  }): Promise<Contract> {
    const conv = this.state.conversations.find((c) => c.id === input.conversationId);
    if (!conv) throw new Error('Conversación no encontrada.');
    const courier = this.state.couriers.find((c) => c.id === conv.courierId);
    if (!courier) throw new Error('Prestador no encontrado.');
    if (courier.availabilityStatus === 'busy') {
      throw new Error(
        'Este prestador se encuentra realizando otro trabajo. Contactá a un prestador disponible.'
      );
    }
    if (courier.availabilityStatus === 'offline') {
      throw new Error(
        'Este prestador está desconectado (fuera de horario laboral). Contactá a un prestador disponible.'
      );
    }

    const contractId = makeId('contract');
    const now = new Date().toISOString();
    const contract: Contract = {
      id: contractId,
      conversationId: conv.id,
      clientId: conv.clientId,
      clientName: conv.clientName || '@invitado',
      clientRole: conv.clientRole || 'client',
      courierId: courier.id,
      courierName: courier.publicName || 'Prestador',
      serviceCategory: courier.serviceCategory || 'motomandado',
      description: input.description.trim(),
      agreedPriceArs: input.agreedPriceArs ?? null,
      modality: input.modality,
      status: 'proposed',
      rated: false,
      ratingValue: null,
      createdAt: now,
      acceptedAt: null,
      completedAt: null,
      cancelledAt: null,
      updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
      await setDoc(
        doc(db, FIRESTORE_COLLECTIONS.CONTRACTS, contractId),
        sanitizeFirestoreData({
          ...contract,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
    } else {
      const contracts = readJSON<Contract[]>(STORAGE_KEYS.LOCAL_CONTRACTS, []);
      contracts.unshift(contract);
      writeJSON(STORAGE_KEYS.LOCAL_CONTRACTS, contracts);
    }

    await this.sendMessage(
      conv.id,
      `Propuesta de servicio (${input.modality}): ${input.description.trim()}`,
      'contract_proposal',
      contractId
    );

    if (!isFirebaseConfigured) {
      this.broadcastSync();
      this.loadLocalCollections();
    }
    return contract;
  }

  async acceptContract(contractId: string): Promise<void> {
    const contract = this.state.contracts.find((c) => c.id === contractId);
    if (!contract) throw new Error('Contratación no encontrada.');
    if (contract.status !== 'proposed') {
      throw new Error('Esta propuesta ya fue procesada.');
    }

    const courier = this.state.couriers.find((c) => c.id === contract.courierId);
    if (!courier) throw new Error('Prestador no encontrado.');

    if (this.state.session.uid !== contract.courierId) {
      throw new Error('Solo el prestador asignado puede aceptar este trabajo.');
    }

    const activeOther = this.state.contracts.find(
      (c) => c.courierId === contract.courierId && c.status === 'accepted' && c.id !== contractId
    );
    if (courier.availabilityStatus !== 'available' || activeOther) {
      throw new Error('Debés estar Disponible y sin otro trabajo activo para aceptar una propuesta.');
    }

    const now = new Date().toISOString();

    if (isFirebaseConfigured && db) {
      await runTransaction(db, async (tx) => {
        const courierRef = doc(db!, FIRESTORE_COLLECTIONS.COURIERS_PUBLIC, courier.id);
        const contractRef = doc(db!, FIRESTORE_COLLECTIONS.CONTRACTS, contractId);
        const cSnap = await tx.get(courierRef);
        if (!cSnap.exists()) {
          throw new Error('Perfil de prestador no encontrado.');
        }
        const status = resolveAvailabilityStatus(cSnap.data() as Record<string, unknown>);
        if (status !== 'available') {
          throw new Error('Tu estado debe figurar Disponible para aceptar este trabajo.');
        }
        tx.update(contractRef, {
          status: 'accepted',
          acceptedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        tx.update(courierRef, {
          availabilityStatus: 'busy',
          isAvailable: false,
          activeContractId: contractId,
          updatedAt: serverTimestamp(),
        });
      });
    } else {
      const contracts = readJSON<Contract[]>(STORAGE_KEYS.LOCAL_CONTRACTS, []);
      writeJSON(
        STORAGE_KEYS.LOCAL_CONTRACTS,
        contracts.map((c) =>
          c.id === contractId ? { ...c, status: 'accepted', acceptedAt: now, updatedAt: now } : c
        )
      );
      const couriers = readJSON<CourierPublicProfile[]>(STORAGE_KEYS.LOCAL_COURIERS, []);
      writeJSON(
        STORAGE_KEYS.LOCAL_COURIERS,
        couriers.map((c) =>
          c.id === courier.id
            ? {
                ...c,
                availabilityStatus: 'busy',
                isAvailable: false,
                activeContractId: contractId,
                updatedAt: now,
              }
            : c
        )
      );
    }

    await this.sendMessage(
      contract.conversationId,
      `${courier.publicName} aceptó el trabajo. Estado actualizado a Ocupado.`,
      'contract_status',
      contractId
    );
  }

  async completeContract(contractId: string): Promise<void> {
    const contract = this.state.contracts.find((c) => c.id === contractId);
    if (!contract) throw new Error('Contratación no encontrada.');
    if (contract.status !== 'accepted') {
      throw new Error('Solo se pueden completar trabajos que estén en curso.');
    }
    const courier = this.state.couriers.find((c) => c.id === contract.courierId);
    if (!courier) throw new Error('Prestador no encontrado.');

    if (this.state.session.uid !== contract.courierId) {
      throw new Error('Solo el prestador asignado puede marcar el trabajo como completado.');
    }

    const now = new Date().toISOString();
    let isFirstCompletedJob = false;

    if (isFirebaseConfigured && db) {
      await runTransaction(db, async (tx) => {
        const courierRef = doc(db!, FIRESTORE_COLLECTIONS.COURIERS_PUBLIC, courier.id);
        const contractRef = doc(db!, FIRESTORE_COLLECTIONS.CONTRACTS, contractId);
        const cSnap = await tx.get(courierRef);
        const prevCount = Number(cSnap.data()?.completedCount || 0);
        const prevPoints =
          typeof cSnap.data()?.points === 'number' ? Number(cSnap.data()?.points) : prevCount * 10;
        if (prevCount === 0) {
          isFirstCompletedJob = true;
        }
        tx.update(contractRef, {
          status: 'completed',
          completedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        tx.update(courierRef, {
          availabilityStatus: 'available',
          isAvailable: true,
          activeContractId: null,
          completedCount: prevCount + 1,
          points: prevPoints + 10,
          updatedAt: serverTimestamp(),
        });
      });
    } else {
      const contracts = readJSON<Contract[]>(STORAGE_KEYS.LOCAL_CONTRACTS, []);
      writeJSON(
        STORAGE_KEYS.LOCAL_CONTRACTS,
        contracts.map((c) =>
          c.id === contractId ? { ...c, status: 'completed', completedAt: now, updatedAt: now } : c
        )
      );
      const couriers = readJSON<CourierPublicProfile[]>(STORAGE_KEYS.LOCAL_COURIERS, []);
      writeJSON(
        STORAGE_KEYS.LOCAL_COURIERS,
        couriers.map((c) => {
          if (c.id !== courier.id) return c;
          if (c.completedCount === 0) isFirstCompletedJob = true;
          const prevPoints = typeof c.points === 'number' ? c.points : c.completedCount * 10;
          return {
            ...c,
            availabilityStatus: 'available',
            isAvailable: true,
            activeContractId: null,
            completedCount: c.completedCount + 1,
            points: prevPoints + 10,
            updatedAt: now,
          };
        })
      );
    }

    if (isFirstCompletedJob) {
      const flagKey = `${STORAGE_KEYS.FIRST_JOB_PREFIX}${courier.id}`;
      try {
        if (!localStorage.getItem(flagKey)) {
          localStorage.setItem(flagKey, '1');
          this.state = { ...this.state, firstJobCelebrationPending: true };
          this.emit();
        }
      } catch {
        this.state = { ...this.state, firstJobCelebrationPending: true };
        this.emit();
      }
    }

    await this.sendMessage(
      contract.conversationId,
      `Trabajo completado (+10 pts). ${courier.publicName} volvió a estar Disponible. Ya podés dejar tu valoración.`,
      'contract_status',
      contractId
    );
  }

  async cancelContract(contractId: string): Promise<void> {
    const contract = this.state.contracts.find((c) => c.id === contractId);
    if (!contract) throw new Error('Contratación no encontrada.');
    if (contract.status === 'completed' || contract.status === 'cancelled') {
      throw new Error('Este trabajo ya finalizó.');
    }

    const courier = this.state.couriers.find((c) => c.id === contract.courierId);
    const wasAccepted = contract.status === 'accepted';
    const now = new Date().toISOString();

    if (isFirebaseConfigured && db) {
      const batch = writeBatch(db);
      batch.update(doc(db, FIRESTORE_COLLECTIONS.CONTRACTS, contractId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      if (wasAccepted && courier) {
        batch.update(doc(db, FIRESTORE_COLLECTIONS.COURIERS_PUBLIC, courier.id), {
          availabilityStatus: 'available',
          isAvailable: true,
          activeContractId: null,
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    } else {
      const contracts = readJSON<Contract[]>(STORAGE_KEYS.LOCAL_CONTRACTS, []);
      writeJSON(
        STORAGE_KEYS.LOCAL_CONTRACTS,
        contracts.map((c) =>
          c.id === contractId ? { ...c, status: 'cancelled', cancelledAt: now, updatedAt: now } : c
        )
      );
      if (wasAccepted && courier) {
        const couriers = readJSON<CourierPublicProfile[]>(STORAGE_KEYS.LOCAL_COURIERS, []);
        writeJSON(
          STORAGE_KEYS.LOCAL_COURIERS,
          couriers.map((c) =>
            c.id === courier.id
              ? {
                  ...c,
                  availabilityStatus: 'available',
                  isAvailable: true,
                  activeContractId: null,
                  updatedAt: now,
                }
              : c
          )
        );
      }
    }

    await this.sendMessage(
      contract.conversationId,
      wasAccepted
        ? `Trabajo cancelado. ${courier?.publicName || 'El prestador'} volvió a estar Disponible.`
        : 'La propuesta de servicio fue cancelada.',
      'contract_status',
      contractId
    );
  }

  // ---- VERIFIED RATINGS ----
  async submitRating(contractId: string, score: number, comment: string): Promise<void> {
    const contract = this.state.contracts.find((c) => c.id === contractId);
    if (!contract) throw new Error('Contratación no encontrada.');
    if (contract.status !== 'completed') {
      throw new Error('Solo podés calificar trabajos registrados como completados.');
    }
    if (contract.rated) {
      throw new Error('Este trabajo ya fue calificado.');
    }
    if (contract.clientId !== this.state.session.uid) {
      throw new Error('Solo el cliente contratante puede calificar este trabajo.');
    }

    const cleanScore = Math.max(1, Math.min(5, Math.round(score)));
    const courier = this.state.couriers.find((c) => c.id === contract.courierId);
    if (!courier) throw new Error('Prestador no encontrado.');

    const now = new Date().toISOString();
    const record: RatingRecord = {
      contractId,
      courierId: courier.id,
      clientId: this.state.session.uid,
      clientName: this.state.session.displayName || '@invitado',
      score: cleanScore,
      comment: comment.trim() || '',
      createdAt: now,
    };

    const nextCount = courier.ratingCount + 1;
    const nextAvg = Number(
      (((courier.ratingAverage || 0) * courier.ratingCount + cleanScore) / nextCount).toFixed(2)
    );

    const bonusPts = cleanScore === 5 ? 5 : 0;
    const prevPoints =
      typeof courier.points === 'number' ? courier.points : courier.completedCount * 10;

    if (isFirebaseConfigured && db) {
      const batch = writeBatch(db);
      batch.set(
        doc(db, FIRESTORE_COLLECTIONS.RATINGS, contractId),
        sanitizeFirestoreData({
          ...record,
          createdAt: serverTimestamp(),
        })
      );
      batch.update(
        doc(db, FIRESTORE_COLLECTIONS.CONTRACTS, contractId),
        sanitizeFirestoreData({
          rated: true,
          ratingValue: cleanScore,
          updatedAt: serverTimestamp(),
        })
      );
      await batch.commit();

      // Best-effort sync of aggregate fields on couriers_public (client state also enriches from ratings)
      try {
        await updateDoc(
          doc(db, FIRESTORE_COLLECTIONS.COURIERS_PUBLIC, courier.id),
          sanitizeFirestoreData({
            ratingAverage: nextAvg,
            ratingCount: nextCount,
            points: prevPoints + bonusPts,
            updatedAt: serverTimestamp(),
          })
        );
      } catch {
        // Ignore if Firestore rules restrict couriers_public writes to owner only
      }
      return;
    }

    const ratings = readJSON<RatingRecord[]>(STORAGE_KEYS.LOCAL_RATINGS, []);
    ratings.unshift(record);
    writeJSON(STORAGE_KEYS.LOCAL_RATINGS, ratings);

    const contracts = readJSON<Contract[]>(STORAGE_KEYS.LOCAL_CONTRACTS, []);
    writeJSON(
      STORAGE_KEYS.LOCAL_CONTRACTS,
      contracts.map((c) =>
        c.id === contractId ? { ...c, rated: true, ratingValue: cleanScore, updatedAt: now } : c
      )
    );

    const couriers = readJSON<CourierPublicProfile[]>(STORAGE_KEYS.LOCAL_COURIERS, []);
    writeJSON(
      STORAGE_KEYS.LOCAL_COURIERS,
      couriers.map((c) =>
        c.id === courier.id
          ? {
              ...c,
              ratingAverage: nextAvg,
              ratingCount: nextCount,
              points: prevPoints + bonusPts,
              updatedAt: now,
            }
          : c
      )
    );

    this.broadcastSync();
    this.loadLocalCollections();
  }
}

export const synkStore = new SynkStore();
