import React, { useState } from 'react';
import { X, Download, FileText, Loader2, Archive } from 'lucide-react';
import JSZip from 'jszip';
import { PhotoItem } from '../types/lightroom';
import { renderPhotoWithLightroomSettings } from '../utils/photoCanvasRenderer';

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: PhotoItem[];
  onExportPDF: () => void;
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  isOpen,
  onClose,
  photos,
  onExportPDF,
}) => {
  const [quality, setQuality] = useState<'high' | 'max' | 'medium'>('high');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleExportZip = async () => {
    setIsExporting(true);
    setProgress(0);

    const zip = new JSZip();
    const folder = zip.folder('FormaVale_Lote_Editado');

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      try {
        const dataUrl = await renderPhotoWithLightroomSettings(photo.url, photo.settings, 1920);
        const cleanName = photo.name.replace(/\.[^/.]+$/, '');

        if (dataUrl.startsWith('data:image/')) {
          const base64Data = dataUrl.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
          folder?.file(`FormaVale_${cleanName}.jpg`, base64Data, { base64: true });
        } else {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          folder?.file(`FormaVale_${cleanName}.jpg`, blob);
        }
      } catch (err) {
        console.warn('Handling photo zip export fallback for:', photo.name, err);
      }

      setProgress(Math.round(((i + 1) / photos.length) * 80));
    }

    const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
      setProgress(80 + Math.round((metadata.percent / 100) * 20));
    });

    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FormaVale_Lote_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExporting(false);
  };

  const handleExportPhotos = async () => {
    setIsExporting(true);
    setProgress(0);

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      try {
        const dataUrl = await renderPhotoWithLightroomSettings(photo.url, photo.settings, 1920);

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `FormaVale_${photo.name.replace(/\.[^/.]+$/, '')}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error('Error rendering photo:', photo.name, err);
      }

      setProgress(Math.round(((i + 1) / photos.length) * 100));
      await new Promise((r) => setTimeout(r, 300));
    }

    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans text-zinc-100">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-700/80 p-1 flex items-center justify-center shadow-lg ring-1 ring-white/10 overflow-hidden shrink-0">
              <img src="/logo_white.png" alt="Logomarca Oficial" className="w-full h-full object-contain filter drop-shadow" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Exportar Lote Processado
              </h3>
              <p className="text-xs text-zinc-400">
                {photos.length} fotos prontas no catálogo para download
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-300 uppercase tracking-wider text-[10px] font-mono">
              Qualidade de Exportação JPEG:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setQuality('high')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  quality === 'high'
                    ? 'bg-zinc-100 text-zinc-950 border-white shadow'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                Alta (90%)
              </button>
              <button
                onClick={() => setQuality('max')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  quality === 'max'
                    ? 'bg-zinc-100 text-zinc-950 border-white shadow'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                Máxima (100%)
              </button>
              <button
                onClick={() => setQuality('medium')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  quality === 'medium'
                    ? 'bg-zinc-100 text-zinc-950 border-white shadow'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                Média (80%)
              </button>
            </div>
          </div>

          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1 text-zinc-400 text-[11px]">
            <p className="font-bold text-white font-mono">Renderização em Resolução Nativa:</p>
            <p>
              As fotos serão processadas com todos os ajustes de temperatura, exposição, curvas HSL, nitidez, perfis Rawnd e vinheta aplicados.
            </p>
          </div>

          {/* Progress Bar */}
          {isExporting && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between font-mono text-[11px] font-bold text-white">
                <span>Processando fotos...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <button
            onClick={handleExportZip}
            disabled={isExporting}
            className="w-full py-2.5 bg-zinc-100 hover:bg-white disabled:opacity-50 text-zinc-950 rounded-xl text-xs font-black transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                Gerando Arquivo ZIP ({progress}%)...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4 text-zinc-950" />
                Baixar Lote Completo em .ZIP ({photos.length} Fotos)
              </>
            )}
          </button>

          <button
            onClick={handleExportPhotos}
            disabled={isExporting}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer"
          >
            <Download className="w-4 h-4 text-zinc-300" />
            Baixar Fotos Individuais Sequencialmente
          </button>

          <button
            onClick={() => {
              onExportPDF();
              onClose();
            }}
            disabled={isExporting}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-zinc-300" />
            Gerar Relatório do Catálogo em PDF
          </button>
        </div>
      </div>
    </div>
  );
};
