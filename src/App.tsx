import React, { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { AuthSheet } from './components/AuthSheet';
import { BottomNav, type MainTab } from './components/BottomNav';
import { CategoryListView } from './components/CategoryListView';
import { ChatListView } from './components/ChatListView';
import { ChatRoomView } from './components/ChatRoomView';
import { CourierDashboardView } from './components/CourierDashboardView';
import { CourierProfileView } from './components/CourierProfileView';
import { FavoritesView } from './components/FavoritesView';
import { GuestProfileView } from './components/GuestProfileView';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { MerchantWorkspaceView } from './components/MerchantWorkspaceView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OnboardingModal } from './components/OnboardingModal';
import { SearchView } from './components/SearchView';
import { UserMenuSheet } from './components/UserMenuSheet';
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
  | { name: 'merchants' }
  | { name: 'guestProfile' };

export default function App() {
  const [snap, setSnap] = useState<SynkStateSnapshot>(() => synkStore.getState());
  const [screen, setScreen] = useState<ScreenState>({ name: 'home' });
  const [history, setHistory] = useState<ScreenState[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    return synkStore.subscribe(setSnap);
  }, []);

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
      setScreen(previous);
    } else {
      setScreen({ name: 'home' });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBottomTabChange = (tab: MainTab) => {
    setHistory([]);
    if (tab === 'home') setScreen({ name: 'home' });
    else if (tab === 'search') setScreen({ name: 'search' });
    else if (tab === 'chats') setScreen({ name: 'chats' });
    else if (tab === 'merchants') setScreen({ name: 'merchants' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const activeBottomTab: MainTab =
    screen.name === 'search'
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
    if (!courier.isAvailable) {
      showToast(
        'Este repartidor se encuentra realizando otro mandado. Contactá a un repartidor disponible'
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
          : 'No se pudo iniciar la conversación con este repartidor.'
      );
    }
  };

  const activeContracts = snap.contracts.filter(
    (c) => c.status === 'proposed' || c.status === 'accepted'
  );

  const ownCourier =
    snap.session.role === 'courier'
      ? snap.couriers.find((c) => c.id === snap.session.uid)
      : undefined;
  const ownMerchant =
    snap.session.role === 'merchant'
      ? snap.merchants.find((m) => m.id === snap.session.uid)
      : undefined;

  return (
    <div className="min-h-dvh bg-slate-100 sm:py-4">
      {/* Centered 430px Mobile App Frame */}
      <div className="relative mx-auto min-h-dvh w-full max-w-[430px] bg-white shadow-xl sm:min-h-[calc(100dvh-2rem)] sm:overflow-hidden sm:rounded-[28px] sm:border sm:border-slate-200/80">
        <OfflineIndicator />

        <Header
          session={snap.session}
          onOpenUserMenu={() => setMenuOpen(true)}
          onCityChange={(city) => synkStore.updateCity(city)}
          onGoHome={() => {
            setHistory([]);
            setScreen({ name: 'home' });
          }}
        />

        {/* Non-blocking Alert Toast */}
        {toastMsg && (
          <div className="fixed left-1/2 top-16 z-50 w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2">
            <div className="flex items-start gap-2.5 rounded-2xl bg-[#1A2E4A] p-3.5 text-xs font-medium text-white shadow-xl">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B00]" />
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

        <main className="min-h-[calc(100dvh-120px)]">
          {screen.name === 'home' && (
            <HomeView
              session={snap.session}
              couriers={snap.couriers}
              activeContracts={activeContracts}
              onSelectCategory={(cat) => navigate({ name: 'category', category: cat })}
              onOpenChat={(convId) => navigate({ name: 'chatRoom', conversationId: convId })}
              onOpenCourierDashboard={() => navigate({ name: 'courierDashboard' })}
              onOpenJobs={() => navigate({ name: 'merchants' })}
            />
          )}

          {screen.name === 'category' && (
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

          {screen.name === 'profile' && (() => {
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

          {screen.name === 'search' && (
            <SearchView
              couriers={snap.couriers}
              favorites={snap.favorites}
              defaultCity={snap.session.city}
              onToggleFavorite={(id) => synkStore.toggleFavorite(id)}
              onViewProfile={(id) => navigate({ name: 'profile', courierId: id })}
              onContact={(c) => handleContactCourier(c)}
            />
          )}

          {screen.name === 'favorites' && (
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

          {screen.name === 'chats' && (
            <ChatListView
              session={snap.session}
              conversations={snap.conversations}
              contracts={snap.contracts}
              couriers={snap.couriers}
              onOpenConversation={(convId) =>
                navigate({ name: 'chatRoom', conversationId: convId })
              }
              onGoSearch={() => setScreen({ name: 'search' })}
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
                    className="mt-3 rounded-xl bg-[#1A2E4A] px-4 py-2 text-xs font-bold text-white"
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
                onViewCourierProfile={(id) => navigate({ name: 'profile', courierId: id })}
                onSendMessage={(txt) => synkStore.sendMessage(conv.id, txt)}
                onProposeContract={async (input) => {
                  await synkStore.proposeContract({
                    conversationId: conv.id,
                    ...input,
                  });
                }}
                onAcceptContract={(id, allowDemo) => synkStore.acceptContract(id, allowDemo)}
                onCompleteContract={(id, allowDemo) => synkStore.completeContract(id, allowDemo)}
                onCancelContract={(id) => synkStore.cancelContract(id)}
                onSubmitRating={(id, score, comment) => synkStore.submitRating(id, score, comment)}
                onSimulateDemoReply={(id) => synkStore.simulateDemoReply(id)}
              />
            );
          })()}

          {screen.name === 'auth' && (
            <AuthSheet
              initialType={screen.initialType}
              defaultCity={snap.session.city}
              onBack={goBack}
              onRegisterCourier={(input) => synkStore.registerCourier(input)}
              onRegisterMerchant={(input) => synkStore.registerMerchant(input)}
              onLogin={(email, pass) => synkStore.loginWithEmail(email, pass)}
              onSuccessNavigate={(role) => {
                setHistory([]);
                setScreen(
                  role === 'courier' ? { name: 'courierDashboard' } : { name: 'merchants' }
                );
              }}
            />
          )}

          {screen.name === 'courierDashboard' && ownCourier && (
            <CourierDashboardView
              courier={ownCourier}
              contracts={snap.contracts}
              onBack={() => setScreen({ name: 'home' })}
              onUpdateProfile={(patch) =>
                synkStore.updateOwnCourierProfile(ownCourier.id, patch)
              }
              onToggleAvailability={(next) =>
                synkStore.setOwnAvailability(ownCourier.id, next)
              }
              onSaveTariff={(tariff) => synkStore.saveCourierTariff(ownCourier.id, tariff)}
              onDeleteTariff={(tid) => synkStore.deleteCourierTariff(ownCourier.id, tid)}
              onAcceptContract={(id) => synkStore.acceptContract(id)}
              onCompleteContract={(id) => synkStore.completeContract(id)}
              onCancelContract={(id) => synkStore.cancelContract(id)}
              onOpenChat={(convId) => navigate({ name: 'chatRoom', conversationId: convId })}
              onOpenJobs={() => navigate({ name: 'merchants' })}
            />
          )}

          {screen.name === 'merchants' && (
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

          {screen.name === 'guestProfile' && (
            <GuestProfileView
              session={snap.session}
              contracts={snap.contracts}
              onBack={goBack}
              onSaveGuest={(nick, city) => synkStore.completeGuestOnboarding(nick, city)}
              onOpenAuth={(type) => navigate({ name: 'auth', initialType: type })}
              onOpenChat={(convId) => navigate({ name: 'chatRoom', conversationId: convId })}
            />
          )}
        </main>

        <BottomNav
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
            if (snap.session.role === 'courier') {
              navigate({ name: 'courierDashboard' });
            } else {
              navigate({ name: 'auth', initialType: 'courier' });
            }
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
            if (snap.session.role === 'courier') {
              navigate({ name: 'courierDashboard' });
            } else if (snap.session.role === 'merchant') {
              navigate({ name: 'merchants' });
            } else {
              navigate({ name: 'guestProfile' });
            }
          }}
          onOpenJobs={() => navigate({ name: 'merchants' })}
          onLogout={async () => {
            await synkStore.logoutToGuest();
            setHistory([]);
            setScreen({ name: 'home' });
          }}
        />

        {snap.ready && snap.needsOnboarding && (
          <OnboardingModal
            initialNickname={snap.session.displayName}
            initialCity={snap.session.city}
            onComplete={(nick, city) => synkStore.completeGuestOnboarding(nick, city)}
          />
        )}
      </div>
    </div>
  );
}
