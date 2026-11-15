import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="mx-auto flex w-full max-w-[430px] items-center justify-center gap-2 bg-[#F5A623] px-4 py-1.5 text-xs font-bold text-[#063642]">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>Sin conexión — Mostrando datos guardados en caché</span>
    </div>
  );
};
