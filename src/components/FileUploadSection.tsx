import React, { useRef } from 'react';
import { Upload, CheckCircle2, Eye, Camera, FileSpreadsheet, X, Sliders } from 'lucide-react';
import { ParsedFileResult } from '../utils/fileParser';

interface FileUploadSectionProps {
  fileA: ParsedFileResult | null;
  fileB: ParsedFileResult | null;
  onFileUpload: (file: File, fileTarget: 'A' | 'B') => void;
  onSelectSamplePair?: (pair: any) => void;
  onPreviewFile: (file: ParsedFileResult) => void;
  onRemoveFile: (fileTarget: 'A' | 'B') => void;
  customInstructions: string;
  setCustomInstructions: (val: string) => void;
  onStartAnalysis: () => void;
  isAnalyzing: boolean;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  fileA,
  fileB,
  onFileUpload,
  onPreviewFile,
  onRemoveFile,
  customInstructions,
  setCustomInstructions,
  onStartAnalysis,
  isAnalyzing,
}) => {
  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, target: 'A' | 'B') => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0], target);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6 font-sans text-zinc-100">
      {/* Studio Header Banner with Prominent Official Brand Logo */}
      <div className="text-center space-y-4">
        {/* Logomarca Oficial em Destaque */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-zinc-950 border border-zinc-700/80 p-3 flex items-center justify-center mx-auto shadow-2xl ring-1 ring-white/15 overflow-hidden group hover:border-zinc-500 transition-all">
          <img
            src="/logo_white.png"
            alt="Logomarca Oficial Forma Vale"
            className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
          />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold font-mono">
            <Camera className="w-3.5 h-3.5 text-zinc-300" />
            FORMA VALE · SUÍTE PROFISSIONAL DE REVELAÇÃO
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-display">
            Biblioteca & Consolidação de Ensaios
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Carregue catálogos de metadados, arquivos RAW/CSV, seleções de clientes ou relatórios orçamentários do estúdio para comparar valores, revelar fotos com ferramentas LR e exportar relatório consolidado.
          </p>
        </div>
      </div>

      {/* Dual Upload Cards Container - Monochromatic Black, White & Gray Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ARQUIVO A CARD */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 font-mono">
                Arquivo A (Original / Metadados Brutos)
              </span>
              {fileA && (
                <span className="text-xs text-zinc-200 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Carregado
                </span>
              )}
            </div>

            {fileA ? (
              <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-5 h-5 text-zinc-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate max-w-[200px]" title={fileA.name}>
                        {fileA.name}
                      </p>
                      <p className="text-xs text-zinc-400 font-mono">
                        {fileA.rowCount} registros · {(fileA.size / 1024).toFixed(1)} KB · {fileA.format.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveFile('A')}
                    className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Remover arquivo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => onPreviewFile(fileA)}
                    className="text-xs text-zinc-200 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Visualizar Conteúdo
                  </button>
                  <span className="text-zinc-600">·</span>
                  <span className="text-xs text-zinc-400">
                    {fileA.headers.length} colunas
                  </span>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'A')}
                onClick={() => fileInputARef.current?.click()}
                className="border-2 border-dashed border-zinc-800 hover:border-zinc-500 rounded-xl p-8 text-center cursor-pointer transition-all bg-zinc-950/60 hover:bg-zinc-950 group"
              >
                <input
                  type="file"
                  ref={fileInputARef}
                  onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0], 'A')}
                  accept=".cr2,.cr3,.arw,.nef,.raf,.dng,.orf,.rw2,.pef,image/*,.csv,.xlsx,.xls,.json,.txt,.md"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 group-hover:bg-zinc-100 group-hover:text-zinc-950 text-zinc-300 border border-zinc-800 flex items-center justify-center mx-auto mb-3 transition-colors shadow">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white">
                  Arraste ou clique para enviar o <span className="underline decoration-zinc-500">Arquivo A</span>
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Catálogos RAW, CSV, Excel, JSON ou Textos de Ensaio
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ARQUIVO B CARD */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 font-mono">
                Arquivo B (Seleção / Ajustes Comparados)
              </span>
              {fileB && (
                <span className="text-xs text-zinc-200 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Carregado
                </span>
              )}
            </div>

            {fileB ? (
              <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-5 h-5 text-zinc-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate max-w-[200px]" title={fileB.name}>
                        {fileB.name}
                      </p>
                      <p className="text-xs text-zinc-400 font-mono">
                        {fileB.rowCount} registros · {(fileB.size / 1024).toFixed(1)} KB · {fileB.format.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveFile('B')}
                    className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Remover arquivo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => onPreviewFile(fileB)}
                    className="text-xs text-zinc-200 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Visualizar Conteúdo
                  </button>
                  <span className="text-zinc-600">·</span>
                  <span className="text-xs text-zinc-400">
                    {fileB.headers.length} colunas
                  </span>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'B')}
                onClick={() => fileInputBRef.current?.click()}
                className="border-2 border-dashed border-zinc-800 hover:border-zinc-500 rounded-xl p-8 text-center cursor-pointer transition-all bg-zinc-950/60 hover:bg-zinc-950 group"
              >
                <input
                  type="file"
                  ref={fileInputBRef}
                  onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0], 'B')}
                  accept=".csv,.xlsx,.xls,.json,.txt,.md"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 group-hover:bg-zinc-100 group-hover:text-zinc-950 text-zinc-300 border border-zinc-800 flex items-center justify-center mx-auto mb-3 transition-colors shadow">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white">
                  Arraste ou clique para enviar o <span className="underline decoration-zinc-500">Arquivo B</span>
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Catálogos RAW, CSV, Excel, JSON ou Textos de Ensaio
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Focus Prompt Input */}
      <div className="bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-zinc-800 shadow-xl space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
          Instruções de Foco de Análise / Retoque (Opcional)
        </label>
        <input
          type="text"
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          placeholder="Ex: Identificar fotos com ISO alto, comparar divergências de preço do ensaio, listar solicitações do cliente..."
          className="w-full px-4 py-2.5 bg-zinc-950 text-white rounded-xl border border-zinc-800 focus:outline-none focus:border-zinc-500 text-xs placeholder-zinc-500"
        />
      </div>

      {/* Main Action CTA Button */}
      <div className="text-center">
        <button
          onClick={onStartAnalysis}
          disabled={!fileA || !fileB || isAnalyzing}
          className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-3 mx-auto shadow-2xl ${
            fileA && fileB && !isAnalyzing
              ? 'bg-zinc-100 hover:bg-white text-zinc-950 cursor-pointer shadow-white/10 scale-102 hover:scale-105'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              Processando e Analisando com IA...
            </>
          ) : (
            <>
              <Sliders className="w-4 h-4 text-zinc-950" />
              Analisar e Consolidar com IA
            </>
          )}
        </button>
        {(!fileA || !fileB) && (
          <p className="text-xs text-zinc-500 mt-2">
            Carregue os dois arquivos para habilitar a consolidação do estúdio.
          </p>
        )}
      </div>
    </div>
  );
};
