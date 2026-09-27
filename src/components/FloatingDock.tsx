import React from 'react';
import {
  Sliders,
  Sparkles,
  Camera,
  Split,
  Wand2,
  Copy,
  Download,
  Plus,
  Eye,
  Layers,
} from 'lucide-react';

export type FloatingToolType = 'none' | 'develop' | 'presets' | 'filmstrip' | 'loupe';

interface FloatingDockProps {
  activeTool: FloatingToolType;
  onSelectTool: (tool: FloatingToolType) => void;
  photoCount: number;
  selectedCount: number;
  onOpenSyncModal: () => void;
  onOpenExportModal: () => void;
  onOpenImportModal: () => void;
  onOpenObjectRemover: () => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  activeTool,
  onSelectTool,
  photoCount,
  selectedCount,
  onOpenSyncModal,
  onOpenExportModal,
  onOpenImportModal,
  onOpenObjectRemover,
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] font-sans">
      <div className="bg-zinc-950/90 backdrop-blur-2xl border border-zinc-700/80 p-1.5 rounded-2xl shadow-2xl flex items-center gap-1.5 overflow-x-auto no-scrollbar ring-1 ring-white/10 text-white">
        {/* Tool 1: Revelação (Develop) */}
        <button
          onClick={() => onSelectTool(activeTool === 'develop' ? 'none' : 'develop')}
          className={`px-3 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'develop'
              ? 'bg-zinc-100 text-zinc-950 shadow-lg scale-105'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
          }`}
          title="Abrir sliders e controles de revelação (-100 a +100)"
        >
          <Sliders className="w-4 h-4 shrink-0" />
          <span>Revelação</span>
        </button>

        {/* Tool 2: Presets & XMP */}
        <button
          onClick={() => onSelectTool(activeTool === 'presets' ? 'none' : 'presets')}
          className={`px-3 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'presets'
              ? 'bg-zinc-100 text-zinc-950 shadow-lg scale-105'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
          }`}
          title="Filtros e importação de presets .XMP do Lightroom"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>Presets & XMP</span>
        </button>

        {/* Tool 3: Filme do Lote (Filmstrip) */}
        <button
          onClick={() => onSelectTool(activeTool === 'filmstrip' ? 'none' : 'filmstrip')}
          className={`px-3 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'filmstrip'
              ? 'bg-zinc-100 text-zinc-950 shadow-lg scale-105'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
          }`}
          title="Navegar pelas fotos do lote importado"
        >
          <Camera className="w-4 h-4 shrink-0" />
          <span>Filme ({photoCount})</span>
        </button>

        {/* Tool 4: Comparativo Lupa */}
        <button
          onClick={() => onSelectTool(activeTool === 'loupe' ? 'none' : 'loupe')}
          className={`px-3 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'loupe'
              ? 'bg-zinc-100 text-zinc-950 shadow-lg scale-105'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
          }`}
          title="Comparar 100% original bruto com a versão tratada"
        >
          <Split className="w-4 h-4 shrink-0" />
          <span>Lupa Comparativa</span>
        </button>

        {/* Separator Divider */}
        <div className="w-[1px] h-6 bg-zinc-800 my-auto shrink-0" />

        {/* Action 1: Borracha Mágica */}
        <button
          onClick={onOpenObjectRemover}
          className="px-3 py-2 rounded-xl font-bold text-xs text-zinc-200 hover:text-white hover:bg-zinc-900 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
          title="Remover objetos da imagem"
        >
          <Wand2 className="w-4 h-4 text-zinc-100" />
          <span className="hidden sm:inline">Borracha</span>
        </button>

        {/* Action 2: Sincronizar Lote */}
        <button
          onClick={onOpenSyncModal}
          disabled={photoCount <= 1}
          className="px-3 py-2 rounded-xl font-bold text-xs text-zinc-200 hover:text-white hover:bg-zinc-900 disabled:opacity-40 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
          title="Sincronizar edição no lote"
        >
          <Copy className="w-4 h-4 text-zinc-100" />
          <span className="hidden sm:inline">Sincronizar ({selectedCount})</span>
        </button>

        {/* Action 3: Importar Fotos */}
        <button
          onClick={onOpenImportModal}
          className="px-3 py-2 rounded-xl font-bold text-xs text-zinc-200 hover:text-white hover:bg-zinc-900 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
          title="Importar novas fotos locais"
        >
          <Plus className="w-4 h-4 text-zinc-100" />
          <span className="hidden sm:inline">Importar</span>
        </button>

        {/* Action 4: Exportar Lote */}
        <button
          onClick={onOpenExportModal}
          className="px-3.5 py-2 rounded-xl font-extrabold text-xs text-zinc-950 bg-zinc-100 hover:bg-white shadow transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4 text-zinc-950" />
          <span>Exportar</span>
        </button>
      </div>
    </div>
  );
};
