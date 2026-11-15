import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { AuthSheet } from './components/AuthSheet';
import { BottomNav, type MainTab } from './components/BottomNav';
import { CategoryListView } from './components/CategoryListView';
import { ChatListView } from './components/ChatListView';
import { ChatRoomView } from './components/ChatRoomView';
import { CourierDashboardView } from './components/CourierDashboardView';
import { CourierProfileView } from './components/CourierProfileView';
import { CourierServicesView } from './components/CourierServicesView';
import { FavoritesView } from './components/FavoritesView';
import { FirstJobCelebrationModal } from './components/FirstJobCelebrationModal';
import { GuestProfileView } from './components/GuestProfileView';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { MerchantWorkspaceView } from './components/MerchantWorkspaceView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { RankingView } from './components/RankingView';
import { SearchView } from './components/SearchView';
import { UserMenuSheet } from './components/UserMenuSheet';
import { WelcomeView } from './components/WelcomeView';
import { synkStore, type SynkStateSnapshot } from './services/synkStore';
import type { CourierPublicProfile, ServiceCategory } from './types/synk';

type ScreenState =
  | { name: 'home' }
  | { name: 'category'; category: ServiceCategory }
  | { name: 'profile'; courierId: string }
  | { name: 'search' }
  | { name: 'chats' }
  | { name: 'chatRoom'; conversationId: string }
  | { name: 'favorites' }
  | { name: 'auth'; initialType: 'courier' | 'merchant' }
  | { name: 'courierDashboard' }
  | { name: 'courierServices' }
  | { name: 'previewProfile' }
  | { name: 'ranking' }
  | { name: 'merchants' }
  | { name: 'guestProfile' };

const CLIENT_ONLY_SCREENS: ReadonlyArray<ScreenState['name']> = [
  'home',
  'category',
  'profile',
  'search',
  'favorites',
  'merchants',
  'guestProfile',
];

const PROVIDER_ONLY_SCREENS: ReadonlyArray<ScreenState['name']> = [
  'courierDashboard',
  'courierServices',
  'previewProfile',
  'ranking',
];

export default function App() {
  const [snap, setSnap] = useState<SynkStateSnapshot>(() => synkStore.getState());
  const [screen, setScreen] = useState<ScreenState>({ name: 'home' });
  const [history, setHistory] = useState<ScreenState[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    return synkStore.subscribe(setSnap);
  }, []);

  const isProvider = snap.session.role === 'courier';

  // Strict role routing: providers stay strictly in Modo Trabajo; clients stay in catalog/chats
  useEffect(() => {
    if (!snap.ready) return;
    if (isProvider && CLIENT_ONLY_SCREENS.includes(screen.name)) {
      setHistory([]);
      setScreen({ name: 'courierDashboard' });
    } else if (!isProvider && PROVIDER_ONLY_SCREENS.includes(screen.name)) {
      setHistory([]);
      setScreen({ name: 'home' });
    }
  }, [snap.ready, isProvider, screen.name]);

  const showToast = (message: string) => {
    setToastMsg(message);
  };

  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 4500);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  const navigate = (next: ScreenState) => {
    setHistory((prev) => [...prev.slice(-8), screen]);
    setScreen(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const goBack = () => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      if (isProvider && CLIENT_ONLY_SCREENS.includes(previous.name)) {
        setScreen({ name: 'courierDashboard' });
      } else {
        setScreen(previous);
      }
    } else {
      setScreen(isProvider ? { name: 'courierDashboard' } : { name: 'home' });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBottomTabChange = (tab: MainTab) => {
    setHistory([]);
    if (tab === 'work_panel') setScreen({ name: 'courierDashboard' });
    else if (tab === 'work_services') setScreen({ name: 'courierServices' });
    else if (tab === 'work_ranking') setScreen({ name: 'ranking' });
    else if (tab === 'work_chats') setScreen({ name: 'chats' });
    else if (tab === 'home') setScreen({ name: 'home' });
    else if (tab === 'search') setScreen({ name: 'search' });
    else if (tab === 'chats') setScreen({ name: 'chats' });
    else if (tab === 'merchants') setScreen({ name: 'merchants' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const activeBottomTab: MainTab = isProvider
    ? screen.name === 'courierServices'
      ? 'work_services'
      : screen.name === 'ranking'
      ? 'work_ranking'
      : screen.name === 'chats' || screen.name === 'chatRoom'
      ? 'work_chats'
      : 'work_panel'
    : screen.name === 'search'
    ? 'search'
    : screen.name === 'chats' || screen.name === 'chatRoom'
    ? 'chats'
    : screen.name === 'merchants'
    ? 'merchants'
    : 'home';

  const handleContactCourier = async (
    courier: CourierPublicProfile,
    presetMessage?: string
  ) => {
    if (courier.availabilityStatus === 'busy') {
      showToast(
        'Este prestador se encuentra realizando otro trabajo. Contactá a un prestador disponible.'
      );
      return;
    }
    if (courier.availabilityStatus === 'offline') {
      showToast(
        'Este prestador está desconectado (fuera de horario laboral). Contactá a un prestador disponible.'
      );
      return;
    }
    try {
      const convId = await synkStore.startOrOpenConversation(courier, presetMessage);
      navigate({ name: 'chatRoom', conversationId: convId });
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : 'No se pudo iniciar la conversación con este prestador.'
      );
    }
  };

  const activeContracts = snap.contracts.filter(
    (c) => c.status === 'proposed' || c.status === 'accepted'
  );

  const ownCourier = isProvider
    ? snap.couriers.find((c) => c.id === snap.session.uid)
    : undefined;
  const ownMerchant =
    snap.session.role === 'merchant'
      ? snap.merchants.find((m) => m.id === snap.session.uid)
      : undefined;

  const rankingPosition = useMemo(() => {
    if (!isProvider || snap.couriers.length === 0) return 0;
    const sorted = [...snap.couriers].sort((a, b) => {
      const ptsA = typeof a.points === 'number' ? a.points : a.completedCount * 10;
      const ptsB = typeof b.points === 'number' ? b.points : b.completedCount * 10;
      if (ptsB !== ptsA) return ptsB - ptsA;
      if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
      if (b.ratingAverage !== a.ratingAverage) return b.ratingAverage - a.ratingAverage;
      return a.publicName.localeCompare(b.publicName);
    });
    const idx = sorted.findIndex((c) => c.id === snap.session.uid);
    return idx >= 0 ? idx + 1 : 0;
  }, [isProvider, snap.couriers, snap.session.uid]);

  const showWelcomeScreen =
    snap.ready &&
    snap.needsOnboarding &&
    snap.session.role === 'client' &&
    screen.name !== 'auth';

  return (
    <div className="min-h-dvh bg-[#F8FAFA] sm:py-4">
      {/* Centered 430px Mobile App Frame */}
      <div className="relative mx-auto min-h-dvh w-full max-w-[430px] bg-[#F8FAFA] shadow-xl sm:min-h-[calc(100dvh-2rem)] sm:overflow-hidden sm:rounded-[28px] sm:border sm:border-[#E2E8F0]">
        <OfflineIndicator />

        {!snap.ready ? (
          <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[#F8FAFA] p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#063642] font-display text-2xl font-extrabold text-white shadow-sm">
              A
            </div>
            <p className="font-display text-lg font-extrabold text-[#063642]">AlaMano</p>
            <p className="text-xs font-medium text-[#008B8B]">
              Servicios independientes, más cerca.
            </p>
          </div>
        ) : showWelcomeScreen ? (
          <WelcomeView
            onSelectClient={() => synkStore.enterAsGuestClient()}
            onSelectProvider={() => navigate({ name: 'auth', initialType: 'courier' })}
          />
        ) : (
          <>
            <Header
              session={snap.session}
              onOpenUserMenu={() => setMenuOpen(true)}
              onCityChange={(city) => synkStore.updateCity(city)}
              onGoHome={() => {
                setHistory([]);
                setScreen(isProvider ? { name: 'courierDashboard' } : { name: 'home' });
              }}
            />

            {/* Non-blocking Alert Toast */}
            {toastMsg && (
              <div className="fixed left-1/2 top-16 z-50 w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2">
                <div className="flex items-start gap-2.5 rounded-2xl bg-[#063642] p-3.5 text-xs font-medium text-white shadow-xl">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#F5A623]" />
                  <p className="flex-1 leading-relaxed">{toastMsg}</p>
                  <button
                    type="button"
                    onClick={() => setToastMsg(null)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-300 hover:bg-white/10"
                    aria-label="Cerrar aviso"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <main className="min-h-[calc(100dvh-120px)] bg-[#F8FAFA]">
              {/* Client / Merchant Views (strictly hidden for Providers) */}
              {!isProvider && screen.name === 'home' && (
                <HomeView
                  session={snap.session}
                  couriers={snap.couriers}
                  favorites={snap.favorites}
                  activeContracts={activeContracts}
                  onSelectCategory={(cat) => navigate({ name: 'category', category: cat })}
                  onOpenChat={(convId) => navigate({ name: 'chatRoom', conversationId: convId })}
                  onOpenJobs={() => navigate({ name: 'merchants' })}
                  onOpenAdvancedSearch={() => navigate({ name: 'search' })}
                  onToggleFavorite={(id) => synkStore.toggleFavorite(id)}
                  onViewProfile={(id) => navigate({ name: 'profile', courierId: id })}
                  onContactCourier={(c) => handleContactCourier(c)}
                />
              )}

              {!isProvider && screen.name === 'category' && (
                <CategoryListView
                  category={screen.category}
                  currentCity={snap.session.city}
                  couriers={snap.couriers}
                  favorites={snap.favorites}
                  onBack={goBack}
                  onToggleFavorite={(id) => synkStore.toggleFavorite(id)}
                  onViewProfile={(id) => navigate({ name: 'profile', courierId: id })}
                  onContact={(c) => handleContactCourier(c)}
                />
              )}

              {!isProvider && screen.name === 'profile' && (() => {
                const courier = snap.couriers.find((c) => c.id === screen.courierId);
                if (!courier) {
                  return (
                    <div className="p-6 text-center text-sm text-slate-500">
                      Perfil no encontrado.
                    </div>
                  );
                }
                const courierRatings = snap.ratings.filter((r) => r.courierId === courier.id);
                return (
                  <CourierProfileView
                    courier={courier}
                    ratings={courierRatings}
                    isFavorite={snap.favorites.includes(courier.id)}
                    isOwnProfile={snap.session.uid === courier.id}
                    onBack={goBack}
                    onToggleFavorite={(id) => synkStore.toggleFavorite(id)}
                    onStartChat={(c) => handleContactCourier(c)}
                    onGoToOwnPanel={() => navigate({ name: 'courierDashboard' })}
                  />
                );
              })()}

              {!isProvider && screen.name === 'search' && (
                <SearchView
                  couriers={snap.couriers}
                  favorites={snap.favorites}
                  defaultCity={snap.session.city}
                  onToggleFavorite={(id) => synkStore.toggleFavorite(id)}
                  onViewProfile={(id) => navigate({ name: 'profile', courierId: id })}
                  onContact={(c) => handleContactCourier(c)}
                />
              )}

              {!isProvider && screen.name === 'favorites' && (
                <FavoritesView
                  couriers={snap.couriers}
                  favorites={snap.favorites}
                  onBack={goBack}
                  onToggleFavorite={(id) => synkStore.toggleFavorite(id)}
                  onViewProfile={(id) => navigate({ name: 'profile', courierId: id })}
                  onContact={(c) => handleContactCourier(c)}
                  onGoSearch={() => setScreen({ name: 'search' })}
                />
              )}

              {!isProvider && screen.name === 'merchants' && (
                <MerchantWorkspaceView
                  session={snap.session}
                  merchant={ownMerchant}
                  couriers={snap.couriers}
                  favorites={snap.favorites}
                  contracts={snap.contracts}
                  jobOpportunities={snap.jobOpportunities}
                  onOpenMerchantAuth={() => navigate({ name: 'auth', initialType: 'merchant' })}
                  onUpdateMerchantProfile={(patch) =>
                    synkStore.updateOwnMerchantProfile(snap.session.uid, patch)
                  }
                  onCreateJob={(input) => synkStore.createJobOpportunity(input)}
                  onToggleJobStatus={(jobId) => synkStore.toggleJobOpportunityStatus(jobId)}
                  onToggleFavorite={(id) => synkStore.toggleFavorite(id)}
                  onViewCourierProfile={(id) => navigate({ name: 'profile', courierId: id })}
                  onContactCourier={(c, msg) => handleContactCourier(c, msg)}
                />
              )}

              {!isProvider && screen.name === 'guestProfile' && (
                <GuestProfileView
                  session={snap.session}
                  contracts={snap.contracts}
                  onBack={goBack}
                  onSaveGuest={(nick, city) => synkStore.completeGuestOnboarding(nick, city)}
                  onOpenAuth={(type) => navigate({ name: 'auth', initialType: type })}
                  onOpenChat={(convId) => navigate({ name: 'chatRoom', conversationId: convId })}
                />
              )}

              {/* Shared Chats & Chat Room */}
              {screen.name === 'chats' && (
                <ChatListView
                  session={snap.session}
                  conversations={snap.conversations}
                  contracts={snap.contracts}
                  couriers={snap.couriers}
                  onOpenConversation={(convId) =>
                    navigate({ name: 'chatRoom', conversationId: convId })
                  }
                  onAcceptContract={
                    isProvider ? (id) => synkStore.acceptContract(id) : undefined
                  }
                  onCompleteContract={
                    isProvider ? (id) => synkStore.completeContract(id) : undefined
                  }
                  onGoSearch={isProvider ? undefined : () => setScreen({ name: 'search' })}
                />
              )}

              {screen.name === 'chatRoom' && (() => {
                const conv = snap.conversations.find((c) => c.id === screen.conversationId);
                if (!conv) {
                  return (
                    <div className="p-6 text-center">
                      <p className="text-sm text-slate-500">Conversación no encontrada.</p>
                      <button
                        type="button"
                        onClick={() => setScreen({ name: 'chats' })}
                        className="mt-3 rounded-xl bg-[#063642] px-4 py-2 text-xs font-bold text-white"
                      >
                        Ir a mis chats
                      </button>
                    </div>
                  );
                }
                const courier = snap.couriers.find((c) => c.id === conv.courierId);
                return (
                  <ChatRoomView
                    session={snap.session}
                    conversation={conv}
                    messages={snap.messagesByConv[conv.id] || []}
                    courier={courier}
                    contracts={snap.contracts}
                    onBack={goBack}
                    onViewCourierProfile={(id) => {
                      if (!isProvider) {
                        navigate({ name: 'profile', courierId: id });
                      }
                    }}
                    onSendMessage={(txt) => synkStore.sendMessage(conv.id, txt)}
                    onProposeContract={async (input) => {
                      await synkStore.proposeContract({
                        conversationId: conv.id,
                        ...input,
                      });
                    }}
                    onAcceptContract={(id) => synkStore.acceptContract(id)}
                    onCompleteContract={(id) => synkStore.completeContract(id)}
                    onCancelContract={(id) => synkStore.cancelContract(id)}
                    onSubmitRating={(id, score, comment) =>
                      synkStore.submitRating(id, score, comment)
                    }
                  />
                );
              })()}

              {/* Auth Sheet */}
              {screen.name === 'auth' && (
                <AuthSheet
                  initialType={screen.initialType}
                  defaultCity={snap.session.city}
                  onBack={goBack}
                  onRegisterCourier={(input) => synkStore.registerCourier(input)}
                  onRegisterMerchant={(input) => synkStore.registerMerchant(input)}
                  onLogin={(email, pass) => synkStore.loginWithEmail(email, pass)}
                  onResetPassword={(email) => synkStore.sendPasswordReset(email)}
                  onSuccessNavigate={(role) => {
                    setHistory([]);
                    setScreen(
                      role === 'courier' ? { name: 'courierDashboard' } : { name: 'merchants' }
                    );
                  }}
                />
              )}

              {/* Provider Exclusive Modo Trabajo Views */}
              {isProvider && screen.name === 'courierDashboard' && ownCourier && (
                <CourierDashboardView
                  courier={ownCourier}
                  contracts={snap.contracts}
                  rankingPosition={rankingPosition}
                  onChangeAvailability={(nextStatus) =>
                    synkStore.setOwnAvailability(ownCourier.id, nextStatus)
                  }
                  onAcceptContract={(id) => synkStore.acceptContract(id)}
                  onCompleteContract={(id) => synkStore.completeContract(id)}
                  onCancelContract={(id) => synkStore.cancelContract(id)}
                  onOpenChat={(convId) => navigate({ name: 'chatRoom', conversationId: convId })}
                  onOpenServices={() => {
                    setHistory([]);
                    setScreen({ name: 'courierServices' });
                  }}
                  onOpenRanking={() => {
                    setHistory([]);
                    setScreen({ name: 'ranking' });
                  }}
                />
              )}

              {isProvider && screen.name === 'courierServices' && ownCourier && (
                <CourierServicesView
                  courier={ownCourier}
                  onUpdateProfile={(patch) =>
                    synkStore.updateOwnCourierProfile(ownCourier.id, patch)
                  }
                  onSaveTariff={(tariff) => synkStore.saveCourierTariff(ownCourier.id, tariff)}
                  onDeleteTariff={(tid) => synkStore.deleteCourierTariff(ownCourier.id, tid)}
                />
              )}

              {isProvider && screen.name === 'ranking' && (
                <RankingView
                  couriers={snap.couriers}
                  currentCourierId={snap.session.uid}
                />
              )}

              {isProvider && screen.name === 'previewProfile' && ownCourier && (
                <CourierProfileView
                  courier={ownCourier}
                  ratings={snap.ratings.filter((r) => r.courierId === ownCourier.id)}
                  isFavorite={false}
                  isOwnProfile={true}
                  isPreviewMode={true}
                  onBack={() => {
                    setHistory([]);
                    setScreen({ name: 'courierDashboard' });
                  }}
                  onToggleFavorite={() => {}}
                  onStartChat={() => {}}
                  onGoToOwnPanel={() => {
                    setHistory([]);
                    setScreen({ name: 'courierDashboard' });
                  }}
                />
              )}
            </main>

            <BottomNav
              mode={isProvider ? 'provider' : 'client'}
              activeTab={activeBottomTab}
              onChangeTab={handleBottomTabChange}
              activeChatsCount={activeContracts.length}
            />

            <UserMenuSheet
              open={menuOpen}
              session={snap.session}
              favoritesCount={snap.favorites.length}
              firebaseConnected={snap.firebaseConnected}
              onClose={() => setMenuOpen(false)}
              onOpenCourierAuthOrPanel={() => {
                if (isProvider) {
                  setHistory([]);
                  setScreen({ name: 'courierDashboard' });
                } else {
                  navigate({ name: 'auth', initialType: 'courier' });
                }
              }}
              onOpenCourierServices={() => {
                setHistory([]);
                setScreen({ name: 'courierServices' });
              }}
              onOpenPublicPreview={() => {
                setHistory([]);
                setScreen({ name: 'previewProfile' });
              }}
              onOpenMerchantAuthOrPanel={() => {
                if (snap.session.role === 'merchant') {
                  navigate({ name: 'merchants' });
                } else {
                  navigate({ name: 'auth', initialType: 'merchant' });
                }
              }}
              onOpenFavorites={() => navigate({ name: 'favorites' })}
              onOpenProfile={() => {
                if (isProvider) {
                  setHistory([]);
                  setScreen({ name: 'courierDashboard' });
                } else if (snap.session.role === 'merchant') {
                  navigate({ name: 'merchants' });
                } else {
                  navigate({ name: 'guestProfile' });
                }
              }}
              onOpenJobs={() => navigate({ name: 'merchants' })}
              onOpenRanking={() => {
                setHistory([]);
                setScreen({ name: 'ranking' });
              }}
              onLogout={async () => {
                await synkStore.logoutToGuest();
                setHistory([]);
                setScreen({ name: 'home' });
              }}
            />

            {snap.firstJobCelebrationPending && isProvider && (
              <FirstJobCelebrationModal
                onClose={() => synkStore.dismissFirstJobCelebration()}
                onGoToRanking={() => {
                  synkStore.dismissFirstJobCelebration();
                  setHistory([]);
                  setScreen({ name: 'ranking' });
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
