import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

let lastSwCheck = 0;

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;

    const checkForUpdate = () => {
      const now = Date.now();
      if (now - lastSwCheck < 60_000) return;
      lastSwCheck = now;
      registration.update().catch(() => undefined);
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    });

    setInterval(checkForUpdate, 60 * 60 * 1000);
  },
});

createRoot(document.getElementById('root')!).render(<App />);
