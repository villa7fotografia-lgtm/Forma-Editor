import React, { useState } from 'react';
import { Download, Smartphone, X, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0"
        title="Instalar aplicativo no seu dispositivo"
      >
        <Download className="w-3.5 h-3.5 text-amber-300" />
        Instalar App
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-500/30 rounded-lg transition-all flex items-center gap-1.5 shrink-0"
        >
          <Smartphone className="w-3.5 h-3.5" />
          Instalar no iPhone
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  Instalar no iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <p className="flex items-start gap-2">
                  <span className="font-bold text-indigo-400 shrink-0">1.</span>
                  <span>Toque no botão <strong className="text-white">Compartilhar</strong> <Share className="w-3.5 h-3.5 inline text-indigo-400" /> na barra do Safari.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-indigo-400 shrink-0">2.</span>
                  <span>Role para baixo e selecione <strong className="text-white">Adicionar à Tela de Início</strong>.</span>
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback trigger button if user clicks directly or if browser suppresses ambient banner
  return (
    <button
      onClick={install}
      className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-all flex items-center gap-1.5 shrink-0"
      title="Instalar aplicativo"
    >
      <Download className="w-3.5 h-3.5 text-indigo-400" />
      Instalar App
    </button>
  );
};
