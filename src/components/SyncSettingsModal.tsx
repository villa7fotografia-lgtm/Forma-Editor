import React, { useState } from 'react';
import { X, Sliders, Check, Copy, Layers } from 'lucide-react';
import { SyncOptions, DEFAULT_SYNC_OPTIONS } from '../types/lightroom';

interface SyncSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCount: number;
  onConfirmSync: (options: SyncOptions) => void;
}

export const SyncSettingsModal: React.FC<SyncSettingsModalProps> = ({
  isOpen,
  onClose,
  targetCount,
  onConfirmSync,
}) => {
  const [options, setOptions] = useState<SyncOptions>(DEFAULT_SYNC_OPTIONS);

  if (!isOpen) return null;

  const toggleAll = (state: boolean) => {
    setOptions({
      basicWB: state,
      basicTone: state,
      basicPresence: state,
      toneCurve: state,
      hslColor: state,
      detail: state,
      optics: state,
    });
  };

  const handleSync = () => {
    onConfirmSync(options);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 text-zinc-100 font-sans">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl space-y-4 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold shadow">
              <Sliders className="w-4 h-4 text-zinc-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Sincronizar Configurações no Lote
              </h3>
              <p className="text-xs text-zinc-400">
                Copiar ajustes da foto ativa para {targetCount} fotos do lote
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Select Buttons */}
        <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
          <span>Selecione os parâmetros para aplicar:</span>
          <div className="flex gap-2">
            <button
              onClick={() => toggleAll(true)}
              className="text-xs font-bold text-white hover:underline"
            >
              Marcar Todos
            </button>
            <span className="text-zinc-600">·</span>
            <button
              onClick={() => toggleAll(false)}
              className="text-xs font-semibold text-zinc-400 hover:text-white hover:underline"
            >
              Desmarcar
            </button>
          </div>
        </div>

        {/* Checkbox Groups */}
        <div className="space-y-3 py-1 text-xs">
          {/* Group 1: Básico */}
          <div className="space-y-2 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
            <div className="font-bold text-white uppercase tracking-wider text-[10px]">
              Grupo Básico
            </div>

            <label className="flex items-center gap-2 font-semibold text-zinc-300 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={options.basicWB}
                onChange={(e) => setOptions({ ...options, basicWB: e.target.checked })}
                className="rounded accent-zinc-100 cursor-pointer"
              />
              Balanço de Brancos (WB - Temperatura & Colorido)
            </label>

            <label className="flex items-center gap-2 font-semibold text-zinc-300 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={options.basicTone}
                onChange={(e) => setOptions({ ...options, basicTone: e.target.checked })}
                className="rounded accent-zinc-100 cursor-pointer"
              />
              Tom (Exposição, Contraste, Realces, Sombras, Brancos, Pretos)
            </label>

            <label className="flex items-center gap-2 font-semibold text-zinc-300 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={options.basicPresence}
                onChange={(e) => setOptions({ ...options, basicPresence: e.target.checked })}
                className="rounded accent-zinc-100 cursor-pointer"
              />
              Presença (Textura, Clareza, Desembaçar, Vibração, Saturação)
            </label>
          </div>

          {/* Group 2: Curva & Cor */}
          <div className="space-y-2 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
            <div className="font-bold text-white uppercase tracking-wider text-[10px]">
              Curva de Tons & Misturador HSL
            </div>

            <label className="flex items-center gap-2 font-semibold text-zinc-300 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={options.toneCurve}
                onChange={(e) => setOptions({ ...options, toneCurve: e.target.checked })}
                className="rounded accent-zinc-100 cursor-pointer"
              />
              Curva de Tons (Tone Curve)
            </label>

            <label className="flex items-center gap-2 font-semibold text-zinc-300 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={options.hslColor}
                onChange={(e) => setOptions({ ...options, hslColor: e.target.checked })}
                className="rounded accent-zinc-100 cursor-pointer"
              />
              Misturador HSL / Cores (Pele, Céu, Saturação de Laranja e Azul)
            </label>
          </div>

          {/* Group 3: Detalhe & Óptica */}
          <div className="space-y-2 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
            <div className="font-bold text-white uppercase tracking-wider text-[10px]">
              Detalhe & Correção de Lente
            </div>

            <label className="flex items-center gap-2 font-semibold text-zinc-300 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={options.detail}
                onChange={(e) => setOptions({ ...options, detail: e.target.checked })}
                className="rounded accent-zinc-100 cursor-pointer"
              />
              Nitidez (Sharpening) e Redução de Ruído
            </label>

            <label className="flex items-center gap-2 font-semibold text-zinc-300 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={options.optics}
                onChange={(e) => setOptions({ ...options, optics: e.target.checked })}
                className="rounded accent-zinc-100 cursor-pointer"
              />
              Óptica & Vinheta de Lente
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <p className="text-[11px] text-zinc-400">
            Afeta {targetCount} fotos selecionadas no lote
          </p>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancelar
            </button>

            <button
              onClick={handleSync}
              className="px-5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-zinc-950" />
              Sincronizar {targetCount} Fotos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
