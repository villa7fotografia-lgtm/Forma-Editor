import React, { useRef, useState } from 'react';
import { X, Upload, Camera, Check, FileImage, Cpu, Sparkles } from 'lucide-react';
import { PhotoItem } from '../types/lightroom';
import { DEFAULT_LR_SETTINGS } from './LightroomDevelopPanel';
import { decodePhotoFile, isRawFile } from '../utils/rawDecoder';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportPhotos: (photos: PhotoItem[]) => void;
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  onImportPhotos,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    setIsProcessing(true);
    setTotalToProcess(files.length);
    setProcessedCount(0);

    const importedPhotos: PhotoItem[] = [];

    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];
      const decoded = await decodePhotoFile(file);

      importedPhotos.push({
        id: `imported-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        url: decoded.url,
        originalUrl: decoded.url,
        size: file.size,
        type: file.type || `image/${file.name.split('.').pop()}`,
        rating: 0,
        flag: 'none',
        colorLabel: 'none',
        settings: { ...DEFAULT_LR_SETTINGS },
        exif: {
          camera: decoded.metadata.cameraModel,
          lens: decoded.metadata.lensModel,
          focalLength: decoded.metadata.focalLength,
          aperture: decoded.metadata.aperture,
          shutter: decoded.metadata.shutter,
          iso: `${decoded.metadata.iso} (${decoded.metadata.rawExtension || 'IMG'})`,
        },
      });

      setProcessedCount(idx + 1);
    }

    setIsProcessing(false);
    onImportPhotos(importedPhotos);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 font-sans text-zinc-100">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-700/80 p-1 flex items-center justify-center shadow-lg ring-1 ring-white/10 overflow-hidden shrink-0">
              <img src="/logo_white.png" alt="Logomarca Oficial" className="w-full h-full object-contain filter drop-shadow" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Importação de Arquivos RAW & Imagens
              </h3>
              <p className="text-xs text-zinc-400">
                Suporte nativo a Canon (.CR2, .CR3), Sony (.ARW), Nikon (.NEF), Fuji (.RAF), DNG e JPG
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RAW Camera Brands Grid - Monochromatic */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-zinc-300 font-mono">
          <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-white shrink-0" />
            Canon (.CR2 / .CR3)
          </div>
          <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-zinc-300 shrink-0" />
            Sony Alpha (.ARW)
          </div>
          <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
            Nikon (.NEF / .NRW)
          </div>
          <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-zinc-500 shrink-0" />
            Fujifilm (.RAF)
          </div>
        </div>

        {/* Upload Dropzone */}
        <div
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-zinc-700 hover:border-zinc-300 bg-zinc-950 hover:bg-zinc-900/80 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3 group ${
            isProcessing ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*,.cr2,.cr3,.arw,.nef,.raf,.dng,.orf,.rw2,.pef"
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-xl">
            {isProcessing ? (
              <Cpu className="w-7 h-7 text-zinc-100 animate-spin" />
            ) : (
              <Upload className="w-7 h-7 text-zinc-100" />
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-white font-display">
              {isProcessing
                ? `Decodificando RAW (${processedCount}/${totalToProcess})...`
                : 'Arraste ou clique para selecionar fotos RAW ou JPG'}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Decodificação rápida diretamente no seu navegador, sem perda de qualidade.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800 pt-3">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-zinc-100" /> Processamento direto no cliente
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
