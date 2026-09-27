import React, { useState } from 'react';
import { LightroomSettings } from './LightroomDevelopPanel';
import { calcLightroomCssFilter } from '../utils/photoCanvasRenderer';
import {
  ZoomIn,
  ZoomOut,
  Eye,
  Camera,
  Maximize2,
  Wand2,
  Sliders,
  FileImage,
  Sparkles,
} from 'lucide-react';

interface PhotoCanvasViewerProps {
  photoUrl?: string;
  originalPhotoUrl?: string;
  photoName?: string;
  settings: LightroomSettings;
  onOpenObjectRemover?: () => void;
  onOpenDevelopPanel?: () => void;
  onOpenImportModal?: () => void;
}

export const PhotoCanvasViewer: React.FC<PhotoCanvasViewerProps> = ({
  photoUrl,
  originalPhotoUrl,
  photoName = 'Foto em Edição',
  settings,
  onOpenObjectRemover,
  onOpenDevelopPanel,
  onOpenImportModal,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  // Compute live CSS filters from Lightroom Settings (-100 to +100 sliders)
  const calcFilterString = (lr: LightroomSettings) => {
    const brightness = 100 + lr.exposure * 0.5 + lr.highlights * 0.2 + lr.shadows * 0.2;
    const contrast = 100 + lr.contrast * 0.5;
    const saturate = Math.max(0, 100 + lr.saturation + lr.vibrance * 0.5);
    const hueRotate = lr.tint * 0.5;
    const sepia = lr.temp > 5500 ? Math.min(30, (lr.temp - 5500) / 100) : 0;

    return `brightness(${brightness.toFixed(0)}%) contrast(${contrast.toFixed(0)}%) saturate(${saturate.toFixed(
      0
    )}%) hue-rotate(${hueRotate.toFixed(0)}deg) sepia(${sepia.toFixed(0)}%)`;
  };

  const activeSrc = photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80';
  const rawOriginalSrc = originalPhotoUrl || activeSrc;

  if (!photoUrl) {
    return (
      <div className="w-full h-[calc(100vh-140px)] flex items-center justify-center p-6">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-12 text-center space-y-5 max-w-xl shadow-2xl backdrop-blur-xl">
          <div className="w-24 h-24 rounded-3xl bg-zinc-950 border border-zinc-700/80 p-2 flex items-center justify-center mx-auto shadow-2xl ring-1 ring-white/15 overflow-hidden">
            <img src="/logo_white.png" alt="Logomarca Oficial" className="w-full h-full object-contain filter drop-shadow" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white font-display tracking-tight">
              Nenhuma Foto Carregada no Lote
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
              Carregue suas fotos locais para iniciar a edição com menus flutuantes, filtros XMP e borrachas mágicas de forma totalmente livre.
            </p>
          </div>
          <button
            onClick={onOpenImportModal}
            className="px-6 py-3.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-2xl transition-all shadow-xl inline-flex items-center gap-2 font-display"
          >
            <Camera className="w-4 h-4 text-zinc-950" />
            Importar Fotos RAW & Locais (CR2, CR3, ARW, NEF, RAF, DNG, JPG)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-140px)] bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800/80 shadow-2xl flex flex-col items-center justify-center select-none group">
      {/* Top Floating Overlay Info Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="bg-zinc-900/90 text-white text-xs font-bold px-3.5 py-1.5 rounded-2xl backdrop-blur-xl border border-zinc-700/80 shadow-xl flex items-center gap-2 font-mono">
          <FileImage className="w-3.5 h-3.5 text-zinc-300" />
          <span className="truncate max-w-[200px] sm:max-w-xs">{photoName}</span>
        </div>

        {showOriginal ? (
          <div className="bg-zinc-100 text-zinc-950 text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 font-display border border-white">
            <Eye className="w-3.5 h-3.5 text-zinc-950" />
            100% ORIGINAL (BRUTO)
          </div>
        ) : (
          <div className="bg-zinc-900/80 text-zinc-300 text-[10px] font-bold uppercase px-3 py-1.5 rounded-2xl backdrop-blur-md border border-zinc-700 shadow flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            RAWND ENGINE · {settings.temp}K
          </div>
        )}
      </div>

      {/* Top Right Quick Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Toggle Original Button */}
        <button
          onMouseDown={() => setShowOriginal(true)}
          onMouseUp={() => setShowOriginal(false)}
          onTouchStart={() => setShowOriginal(true)}
          onTouchEnd={() => setShowOriginal(false)}
          className="px-3.5 py-2 bg-zinc-900/90 hover:bg-zinc-800 text-white font-bold text-xs rounded-2xl backdrop-blur-xl border border-zinc-700/80 shadow-xl transition-all flex items-center gap-1.5"
          title="Segure para comparar com a foto 100% original sem edições"
        >
          <Eye className="w-3.5 h-3.5 text-zinc-300" />
          <span className="hidden sm:inline">Segurar p/ Original</span>
        </button>

        {/* Zoom Controls */}
        <div className="flex items-center bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/80 rounded-2xl p-1 shadow-xl">
          <button
            onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
            className="p-1.5 text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            title="Reduzir zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono font-bold text-zinc-200 px-2">
            {zoomLevel}%
          </span>
          <button
            onClick={() => setZoomLevel(Math.min(250, zoomLevel + 25))}
            className="p-1.5 text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport Canvas Container */}
      <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden relative">
        <img
          src={showOriginal ? rawOriginalSrc : activeSrc}
          alt={photoName}
          className="max-w-full max-h-full object-contain transition-all duration-200 shadow-2xl rounded-xl"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            filter: showOriginal ? 'none' : calcLightroomCssFilter(settings),
          }}
        />
      </div>

      {/* Quick Action Overlay Floating Bar at Canvas Bottom Center */}
      <div className="absolute bottom-6 z-20 flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
        {onOpenDevelopPanel && (
          <button
            onClick={onOpenDevelopPanel}
            className="px-3.5 py-2 bg-zinc-900/90 hover:bg-zinc-800 text-white font-bold text-xs rounded-2xl backdrop-blur-xl border border-zinc-700/80 shadow-xl transition-all flex items-center gap-2"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-100" />
            <span>Abrir Revelação</span>
          </button>
        )}

        {onOpenObjectRemover && (
          <button
            onClick={onOpenObjectRemover}
            className="px-3.5 py-2 bg-zinc-900/90 hover:bg-zinc-800 text-white font-bold text-xs rounded-2xl backdrop-blur-xl border border-zinc-700/80 shadow-xl transition-all flex items-center gap-2"
          >
            <Wand2 className="w-3.5 h-3.5 text-zinc-100" />
            <span>Borracha Mágica</span>
          </button>
        )}
      </div>
    </div>
  );
};
