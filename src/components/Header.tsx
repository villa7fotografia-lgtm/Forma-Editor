import React from 'react';
import {
  Sliders,
  FileSpreadsheet,
  Download,
  RefreshCw,
  MessageSquare,
  BarChart3,
  Camera,
  Layers,
  Split,
  Copy,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export type TabType = 'upload' | 'develop' | 'loupe' | 'summary' | 'charts' | 'discrepancies' | 'table' | 'chat' | 'admin';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  hasData: boolean;
  onExportPDF: () => void;
  onReset: () => void;
  isAnalyzing: boolean;
  onOpenSyncModal: () => void;
  onOpenExportModal: () => void;
  photoCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasData,
  onExportPDF,
  onReset,
  isAnalyzing,
  onOpenSyncModal,
  onOpenExportModal,
  photoCount,
}) => {
  return (
    <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40 shadow-xl text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Zone: Forma Vale / Forma Editor Logo em Destaque */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-zinc-950 border border-zinc-700/80 p-1 flex items-center justify-center shadow-2xl ring-1 ring-white/15 overflow-hidden shrink-0 group hover:border-zinc-500 transition-all">
            <img src="/logo_white.png" alt="Logomarca Oficial" className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform" />
          </div>
          <div>
            <a href="#" className="text-sm font-black tracking-tight text-white flex items-center gap-2 font-display">
              FORMA VALE
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-700 font-mono">
                EDITOR
              </span>
            </a>
            <p className="text-[10px] text-zinc-400 -mt-0.5 font-sans">Suíte de Revelação & Edição Profissional</p>
          </div>
        </div>

        {/* Navigation Modules */}
        <nav className="hidden lg:flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'upload'
                ? 'bg-zinc-100 text-zinc-950 shadow font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Biblioteca ({photoCount})
          </button>

          <button
            onClick={() => setActiveTab('develop')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'develop'
                ? 'bg-zinc-100 text-zinc-950 shadow font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Revelação (Develop)
          </button>

          <button
            onClick={() => setActiveTab('loupe')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'loupe'
                ? 'bg-zinc-100 text-zinc-950 shadow font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            Comparativo
          </button>

          {hasData && (
            <>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'summary'
                    ? 'bg-zinc-100 text-zinc-950 shadow font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Resumo
              </button>

              <button
                onClick={() => setActiveTab('charts')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'charts'
                    ? 'bg-zinc-100 text-zinc-950 shadow font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Gráficos
              </button>

              <button
                onClick={() => setActiveTab('table')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'table'
                    ? 'bg-zinc-100 text-zinc-950 shadow font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Tabela
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'chat'
                    ? 'bg-zinc-100 text-zinc-950 shadow font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                IA
              </button>
            </>
          )}
        </nav>

        {/* Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'admin'
                ? 'bg-zinc-100 text-zinc-950 shadow font-bold'
                : 'text-zinc-300 bg-zinc-900 hover:bg-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Admin
          </button>

          <PWAInstallButton />

          <button
            onClick={onOpenSyncModal}
            className="hidden sm:flex px-3.5 py-2 text-xs font-bold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-colors items-center gap-1.5"
            title="Sincronizar edição no lote"
          >
            <Copy className="w-3.5 h-3.5 text-zinc-300" /> Sincronizar Edição
          </button>

          <button
            onClick={onOpenExportModal}
            className="px-4 py-2 text-xs font-bold text-zinc-950 bg-zinc-100 hover:bg-white rounded-xl transition-all shadow flex items-center gap-2 shrink-0 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-zinc-950" />
            Exportar Lote
          </button>

          {hasData && (
            <button
              onClick={onReset}
              disabled={isAnalyzing}
              className="p-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-800"
              title="Limpar / Novo Ensaio"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
