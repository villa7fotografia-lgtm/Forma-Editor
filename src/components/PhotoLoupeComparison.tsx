import React, { useState } from 'react';
import { LightroomSettings } from './LightroomDevelopPanel';
import { calcLightroomCssFilter } from '../utils/photoCanvasRenderer';
import {
  Camera,
  Split,
  Columns,
  ZoomIn,
  Eye,
  Sliders,
  CheckCircle,
  FileImage,
} from 'lucide-react';

interface PhotoLoupeComparisonProps {
  settings: LightroomSettings;
  fileAName: string;
  fileBName: string;
  fileASummary?: string;
  fileBSummary?: string;
  photoUrl?: string;
  originalPhotoUrl?: string;
}

export const PhotoLoupeComparison: React.FC<PhotoLoupeComparisonProps> = ({
  settings,
  fileAName,
  fileBName,
  fileASummary,
  fileBSummary,
  photoUrl,
  originalPhotoUrl,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'sideBySide' | 'toggle'>('split');
  const [splitPos, setSplitPos] = useState<number>(50);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showOriginalOnly, setShowOriginalOnly] = useState<boolean>(false);

  const calcFilterString = (lr: LightroomSettings) => calcLightroomCssFilter(lr);

  const activePhotoSrc =
    photoUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80';

  const originalSrc = originalPhotoUrl || activePhotoSrc;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-5 space-y-5 text-zinc-100 font-sans">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Camera className="w-4 h-4 text-zinc-300" />
            Comparativo de Lupa & Revelação (Original Bruto vs Tratado)
          </h3>
          <p className="text-[11px] text-zinc-400">
            Compare o arquivo 100% original sem edições com a versão processada em tempo real
          </p>
        </div>

        {/* View Mode Toolbar */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 flex-wrap">
          <button
            onClick={() => {
              setViewMode('split');
              setShowOriginalOnly(false);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'split' && !showOriginalOnly
                ? 'bg-zinc-100 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5" /> Split Slider
          </button>

          <button
            onClick={() => {
              setViewMode('sideBySide');
              setShowOriginalOnly(false);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'sideBySide' && !showOriginalOnly
                ? 'bg-zinc-100 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" /> Lado a Lado
          </button>

          <button
            onClick={() => {
              setViewMode('toggle');
              setShowOriginalOnly((prev) => !prev);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              showOriginalOnly
                ? 'bg-zinc-100 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {showOriginalOnly ? 'Exibindo 100% Original' : 'Alternar Original/Tratado'}
          </button>

          <button
            onClick={() => setZoomLevel(zoomLevel === 100 ? 160 : 100)}
            className="px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors flex items-center gap-1"
            title="Lupa de Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" /> {zoomLevel}%
          </button>
        </div>
      </div>

      {/* Loupe Viewport Canvas */}
      <div className="bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 relative h-[440px] flex items-center justify-center select-none shadow-2xl">
        {/* Toggle Mode: 100% Original Full View */}
        {showOriginalOnly && (
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
            <img
              src={originalSrc}
              alt="Arquivo 100% Original Sem Tratamento"
              className="w-full h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                filter: 'none', // 100% Pure original file
              }}
            />
            <div className="absolute top-4 left-4 bg-zinc-900/90 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-xl backdrop-blur-md border border-zinc-700 pointer-events-none flex items-center gap-2 shadow-lg">
              <FileImage className="w-3.5 h-3.5 text-zinc-100" />
              ARQUIVO 100% ORIGINAL (SEM EDICÃO)
            </div>
          </div>
        )}

        {/* Split Viewport Mode */}
        {viewMode === 'split' && !showOriginalOnly && (
          <div className="relative w-full h-full overflow-hidden">
            {/* Base Background Image: 100% Original Unedited File */}
            <img
              src={originalSrc}
              alt="Arquivo Original"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                filter: 'none', // 100% Pure Original Raw File
              }}
            />
            <div className="absolute top-4 left-4 bg-zinc-900/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl backdrop-blur-md border border-zinc-700 pointer-events-none shadow">
              📷 ORIGINAL BRUTO
            </div>

            {/* Overlaid Edited Image: Processed with Forma Editor / Lightroom settings */}
            <div
              className="absolute inset-0 overflow-hidden border-r-2 border-white shadow-2xl transition-all"
              style={{ width: `${splitPos}%` }}
            >
              <img
                src={activePhotoSrc}
                alt="Versão Tratada Forma Editor"
                className="absolute top-0 left-0 w-full h-full object-cover max-w-none transition-transform duration-200"
                style={{
                  width: '100%',
                  height: '100%',
                  transform: `scale(${zoomLevel / 100})`,
                  filter: calcFilterString(settings),
                }}
              />
              <div className="absolute top-4 left-4 bg-zinc-100 text-zinc-950 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-lg pointer-events-none font-display">
                ✨ TRATADO FORMA EDITOR ({settings.temp}K)
              </div>
            </div>

            {/* Draggable Split Handle Slider */}
            <input
              type="range"
              min="0"
              max="100"
              value={splitPos}
              onChange={(e) => setSplitPos(Number(e.target.value))}
              className="absolute inset-x-0 bottom-4 mx-auto w-2/3 accent-zinc-100 cursor-pointer z-20 opacity-90 hover:opacity-100"
            />
          </div>
        )}

        {/* Side-by-Side Viewport Mode */}
        {viewMode === 'sideBySide' && !showOriginalOnly && (
          <div className="grid grid-cols-2 w-full h-full divide-x divide-zinc-800">
            {/* Left: 100% Pure Original Raw File */}
            <div className="relative overflow-hidden group">
              <img
                src={originalSrc}
                alt={fileAName}
                className="w-full h-full object-cover transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  filter: 'none', // 100% Pure Original
                }}
              />
              <div className="absolute top-3 left-3 bg-zinc-900/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl backdrop-blur-md border border-zinc-700 pointer-events-none shadow">
                📷 100% ORIGINAL (SEM EDICÃO)
              </div>
            </div>

            {/* Right: Processed Version */}
            <div className="relative overflow-hidden group">
              <img
                src={activePhotoSrc}
                alt={fileBName}
                className="w-full h-full object-cover transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  filter: calcFilterString(settings),
                }}
              />
              <div className="absolute top-3 left-3 bg-zinc-100 text-zinc-950 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl shadow pointer-events-none font-display">
                ✨ TRATADO FORMA EDITOR
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metadata Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
        <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between font-bold text-white">
            <span className="uppercase text-[10px] tracking-wider text-zinc-400">
              Arquivo 100% Original (Bruto)
            </span>
            <span className="text-zinc-200 font-mono text-[11px]">{fileAName}</span>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            {fileASummary || 'Imagem original sem filtros de cor ou edições aplicadas.'}
          </p>
        </div>

        <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between font-bold text-white">
            <span className="uppercase text-[10px] tracking-wider text-zinc-400">
              Versão Processada Forma Editor
            </span>
            <span className="text-zinc-100 font-bold font-mono text-[11px]">{fileBName}</span>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            {fileBSummary || 'Com parâmetros de temperatura, tom, curva HSL e remoção de objetos.'}
          </p>
        </div>
      </div>
    </div>
  );
};
