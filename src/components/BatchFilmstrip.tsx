import React from 'react';
import { PhotoItem, PhotoFlag, ColorLabel } from '../types/lightroom';
import {
  Star,
  Flag,
  CheckSquare,
  Square,
  Sliders,
  Camera,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface BatchFilmstripProps {
  photos: PhotoItem[];
  activePhotoId: string;
  onSelectActivePhoto: (id: string) => void;
  selectedPhotoIds: string[];
  onToggleSelectPhoto: (id: string) => void;
  onSelectAllPhotos: (state: boolean) => void;
  onUpdatePhotoRating: (id: string, rating: number) => void;
  onUpdatePhotoFlag: (id: string, flag: PhotoFlag) => void;
  onOpenSyncModal: () => void;
  onOpenImportModal: () => void;
  onOpenExportModal: () => void;
}

export const BatchFilmstrip: React.FC<BatchFilmstripProps> = ({
  photos,
  activePhotoId,
  onSelectActivePhoto,
  selectedPhotoIds,
  onToggleSelectPhoto,
  onSelectAllPhotos,
  onUpdatePhotoRating,
  onUpdatePhotoFlag,
  onOpenSyncModal,
  onOpenImportModal,
  onOpenExportModal,
}) => {
  const allSelected = photos.length > 0 && selectedPhotoIds.length === photos.length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-4 space-y-3 font-sans text-zinc-100">
      {/* Filmstrip Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-white text-xs font-display">
            <Camera className="w-4 h-4 text-zinc-300" />
            Filme do Lote ({photos.length} Fotos)
          </div>

          <button
            onClick={() => onSelectAllPhotos(!allSelected)}
            className="text-[11px] font-bold text-zinc-300 hover:text-white flex items-center gap-1 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 transition-colors"
          >
            {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-white" /> : <Square className="w-3.5 h-3.5" />}
            {allSelected ? 'Desmarcar Lote' : 'Selecionar Lote'} ({selectedPhotoIds.length})
          </button>
        </div>

        {/* Action Controls for Batch */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className="px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            Importar Fotos
          </button>

          <button
            onClick={onOpenSyncModal}
            disabled={photos.length <= 1}
            className="px-3.5 py-1.5 text-xs font-bold text-zinc-950 bg-zinc-100 hover:bg-white disabled:opacity-40 rounded-xl transition-all shadow flex items-center gap-1.5"
            title="Sincronizar os ajustes da foto ativa para as demais fotos do lote"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-950" />
            Sincronizar Edição no Lote
          </button>

          <button
            onClick={onOpenExportModal}
            className="px-3.5 py-1.5 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-all shadow flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            Exportar Lote
          </button>
        </div>
      </div>

      {/* Filmstrip Horizontal Scroll Gallery */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
        {photos.length === 0 ? (
          <div className="w-full py-4 text-center text-xs text-zinc-400 bg-zinc-950 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center gap-2">
            <span>Nenhuma foto no lote. Clique em</span>
            <button
              onClick={onOpenImportModal}
              className="text-white underline font-bold"
            >
              Importar Fotos
            </button>
          </div>
        ) : (
          photos.map((photo) => {
            const isActive = photo.id === activePhotoId;
            const isSelected = selectedPhotoIds.includes(photo.id);

            return (
              <div
                key={photo.id}
                onClick={() => onSelectActivePhoto(photo.id)}
                className={`group relative shrink-0 w-28 rounded-xl overflow-hidden border cursor-pointer transition-all ${
                  isActive
                    ? 'border-white ring-2 ring-white/50 shadow-2xl scale-105'
                    : isSelected
                    ? 'border-zinc-500 bg-zinc-800'
                    : 'border-zinc-800 opacity-70 hover:opacity-100 hover:border-zinc-600'
                }`}
              >
                {/* Thumbnail Image */}
                <div className="h-24 w-full bg-zinc-950 relative overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                  />

                  {/* Selection Checkbox overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelectPhoto(photo.id);
                    }}
                    className="absolute top-1 left-1 p-1 rounded bg-zinc-950/80 text-white hover:bg-zinc-900 transition-colors"
                    title={isSelected ? 'Desmarcar foto' : 'Selecionar foto para sincronizar'}
                  >
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>

                  {/* Active Indicator Badge */}
                  {isActive && (
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-white text-zinc-950 text-[9px] font-extrabold uppercase shadow">
                      Ativa
                    </div>
                  )}

                  {/* Flag Tag */}
                  {photo.flag === 'pick' && (
                    <div className="absolute bottom-1 right-1 p-0.5 rounded bg-zinc-100 text-zinc-950">
                      <Flag className="w-3 h-3 fill-zinc-950 text-zinc-950" />
                    </div>
                  )}
                </div>

                {/* Info & Rating bar */}
                <div className="p-1.5 bg-zinc-950 text-[10px] space-y-1">
                  <p className="font-semibold text-zinc-200 truncate">{photo.name}</p>

                  {/* Rating Stars */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdatePhotoRating(photo.id, star === photo.rating ? 0 : star);
                          }}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-2.5 h-2.5 ${
                              star <= photo.rating
                                ? 'fill-white text-white'
                                : 'text-zinc-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdatePhotoFlag(photo.id, photo.flag === 'pick' ? 'none' : 'pick');
                      }}
                      className={`text-[9px] font-bold ${
                        photo.flag === 'pick' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Sinalizar como Aprovada (Pick)"
                    >
                      {photo.flag === 'pick' ? '🚩 Pick' : '🏳️'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
