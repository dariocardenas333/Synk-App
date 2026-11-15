export type AppNotificationPermission = NotificationPermission | 'unsupported';

export function isNotificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): AppNotificationPermission {
  if (!isNotificationsSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<AppNotificationPermission> {
  if (!isNotificationsSupported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function playNotificationSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number, gainPeak: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(587.33, now, 0.12, 0.08);
    playTone(880, now + 0.11, 0.18, 0.08);
    setTimeout(() => {
      ctx.close().catch(() => undefined);
    }, 450);
  } catch {
    // Audio playback may be restricted before user gesture
  }
}

export async function showIncomingNotification(input: {
  title: string;
  body: string;
  conversationId?: string;
  tag?: string;
}): Promise<void> {
  playNotificationSound();

  if (!isNotificationsSupported() || Notification.permission !== 'granted') {
    return;
  }

  const cleanBody =
    input.body.length > 140 ? `${input.body.slice(0, 137)}...` : input.body;
  const tag = input.tag || (input.conversationId ? `conv-${input.conversationId}` : 'alamano-msg');

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        const options: NotificationOptions & { vibrate?: number[]; renotify?: boolean } = {
          body: cleanBody,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          vibrate: [200, 100, 200],
          tag,
          renotify: true,
          silent: false,
          data: {
            conversationId: input.conversationId || '',
            url: input.conversationId
              ? `/?conversationId=${encodeURIComponent(input.conversationId)}`
              : '/',
          },
        };
        await reg.showNotification(input.title, options);
        return;
      }
    }
  } catch {
    // Fallback to standard Window Notification below
  }

  try {
    const n = new Notification(input.title, {
      body: cleanBody,
      icon: '/pwa-192x192.png',
      tag,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    // Ignore if platform blocks direct Notification constructor
  }
}
