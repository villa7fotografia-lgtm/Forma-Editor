import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-medium text-slate-950 shadow-2xl border border-amber-300 animate-pulse">
      <WifiOff className="w-4 h-4 text-slate-950 shrink-0" />
      <span>Modo Offline — Exibindo dados em cache local.</span>
    </div>
  );
};
