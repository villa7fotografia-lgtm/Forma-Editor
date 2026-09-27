import React, { useState } from 'react';
import { Header, TabType } from './components/Header';
import { FileUploadSection } from './components/FileUploadSection';
import { FilePreviewModal } from './components/FilePreviewModal';
import { ExecutiveSummaryCard } from './components/ExecutiveSummaryCard';
import { MetricsGrid } from './components/MetricsGrid';
import { ComparativeCharts } from './components/ComparativeCharts';
import { DiscrepanciesTable } from './components/DiscrepanciesTable';
import { ConsolidatedDataTable } from './components/ConsolidatedDataTable';
import { AiChatDrawer } from './components/AiChatDrawer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LightroomDevelopPanel, DEFAULT_LR_SETTINGS, LightroomSettings } from './components/LightroomDevelopPanel';
import { PhotoLoupeComparison } from './components/PhotoLoupeComparison';
import { BatchFilmstrip } from './components/BatchFilmstrip';
import { SyncSettingsModal } from './components/SyncSettingsModal';
import { BatchImportModal } from './components/BatchImportModal';
import { BatchExportModal } from './components/BatchExportModal';
import { ObjectRemoverModal } from './components/ObjectRemoverModal';
import { PhotoCanvasViewer } from './components/PhotoCanvasViewer';
import { AdminPanel } from './components/AdminPanel';

import { FloatingDock, FloatingToolType } from './components/FloatingDock';
import { FloatingToolPanel } from './components/FloatingToolPanel';
import { PhotoItem, PhotoFlag, SyncOptions } from './types/lightroom';
import { ParsedFileResult, parseUploadedFile } from './utils/fileParser';
import { exportConsolidatedPDF, ReportData } from './utils/pdfExporter';
import { Download, Sparkles, Sliders, Camera, Split, Wand2, Copy, Plus } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('develop');
  const [activeFloatingTool, setActiveFloatingTool] = useState<FloatingToolType>('develop');

  // Batch Photos Catalog State
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [activePhotoId, setActivePhotoId] = useState<string>('');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);

  // Modals state
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isObjectRemoverOpen, setIsObjectRemoverOpen] = useState(false);

  // Document Dual Files State (For CSV/Excel Metadata Comparison)
  const [fileA, setFileA] = useState<ParsedFileResult | null>(null);
  const [fileB, setFileB] = useState<ParsedFileResult | null>(null);
  const [previewFile, setPreviewFile] = useState<ParsedFileResult | null>(null);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ReportData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Active Photo selection logic
  const activePhoto = photos.find((p) => p.id === activePhotoId) || photos[0];

  // Handle Photo Import
  const handleImportNewPhotos = (newPhotos: PhotoItem[]) => {
    setPhotos((prev) => [...prev, ...newPhotos]);
    if (newPhotos.length > 0 && !activePhotoId) {
      setActivePhotoId(newPhotos[0].id);
    }
    showToast(`${newPhotos.length} fotos importadas para a biblioteca local!`);
  };

  // Toggle Photo Selection
  const handleToggleSelectPhoto = (id: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Select All Photos
  const handleSelectAllPhotos = (state: boolean) => {
    if (state) {
      setSelectedPhotoIds(photos.map((p) => p.id));
    } else {
      setSelectedPhotoIds([]);
    }
  };

  // Rating & Flag Update
  const handleUpdateRating = (id: string, rating: number) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, rating } : p)));
  };

  const handleUpdateFlag = (id: string, flag: PhotoFlag) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, flag } : p)));
  };

  // Apply object removal edited image to active photo
  const handleApplyEditedPhoto = (newPhotoUrl: string) => {
    if (!activePhotoId && photos.length === 0) return;

    const targetId = activePhotoId || photos[0]?.id;
    setPhotos((prev) =>
      prev.map((p) => (p.id === targetId ? { ...p, url: newPhotoUrl } : p))
    );
    showToast('Objeto removido com sucesso da imagem!');
  };

  // Apply Lightroom settings to ALL photos in the catalog
  const handleApplyToAllPhotos = (newSettings: LightroomSettings) => {
    setPhotos((prev) =>
      prev.map((photo) => ({
        ...photo,
        settings: { ...newSettings },
      }))
    );
    showToast('Edição do Preset repassada para TODAS as fotos do lote!');
  };

  // Update active photo's Lightroom Develop Settings
  const handleUpdateActiveSettings = (newSettings: LightroomSettings) => {
    if (!activePhoto) return;

    setPhotos((prevPhotos) =>
      prevPhotos.map((photo) =>
        photo.id === (activePhotoId || activePhoto.id) ? { ...photo, settings: newSettings } : photo
      )
    );
  };

  // Sync Settings from Active Photo to Selected Batch
  const handleConfirmSync = (syncOpts: SyncOptions) => {
    if (!activePhoto) return;

    const source = activePhoto.settings;
    setPhotos((prev) =>
      prev.map((photo) => {
        if (selectedPhotoIds.includes(photo.id) && photo.id !== activePhoto.id) {
          const updatedSettings = { ...photo.settings };

          if (syncOpts.basicWB) {
            updatedSettings.temp = source.temp;
            updatedSettings.tint = source.tint;
          }
          if (syncOpts.basicTone) {
            updatedSettings.exposure = source.exposure;
            updatedSettings.contrast = source.contrast;
            updatedSettings.highlights = source.highlights;
            updatedSettings.shadows = source.shadows;
            updatedSettings.whites = source.whites;
            updatedSettings.blacks = source.blacks;
          }
          if (syncOpts.basicPresence) {
            updatedSettings.texture = source.texture;
            updatedSettings.clarity = source.clarity;
            updatedSettings.dehaze = source.dehaze;
            updatedSettings.vibrance = source.vibrance;
            updatedSettings.saturation = source.saturation;
          }
          if (syncOpts.toneCurve) {
            updatedSettings.curveHighlights = source.curveHighlights;
            updatedSettings.curveLights = source.curveLights;
            updatedSettings.curveDarks = source.curveDarks;
            updatedSettings.curveShadows = source.curveShadows;
          }
          if (syncOpts.hslColor) {
            updatedSettings.hueOrange = source.hueOrange;
            updatedSettings.satOrange = source.satOrange;
            updatedSettings.lumOrange = source.lumOrange;
            updatedSettings.hueBlue = source.hueBlue;
            updatedSettings.satBlue = source.satBlue;
            updatedSettings.lumBlue = source.lumBlue;
          }
          if (syncOpts.detail) {
            updatedSettings.sharpening = source.sharpening;
            updatedSettings.noiseReduction = source.noiseReduction;
          }
          if (syncOpts.optics) {
            updatedSettings.lensProfile = source.lensProfile;
            updatedSettings.chromaticAberration = source.chromaticAberration;
            updatedSettings.vignette = source.vignette;
          }

          return { ...photo, settings: updatedSettings };
        }
        return photo;
      })
    );

    showToast(`Configurações de edição aplicadas em ${selectedPhotoIds.length} fotos!`);
  };

  // File Upload Handlers for Data Analysis
  const handleFileUpload = async (file: File, target: 'A' | 'B') => {
    try {
      const parsed = await parseUploadedFile(file);
      if (target === 'A') setFileA(parsed);
      else setFileB(parsed);

      showToast(`Arquivo "${file.name}" carregado com sucesso!`);
    } catch (err) {
      console.error('Erro ao ler arquivo:', err);
      showToast('Erro ao processar o arquivo selecionado.');
    }
  };

  const handleSelectSamplePair = (pair: any) => {
    showToast(`Par de exemplo "${pair.title}" carregado.`);
  };

  const handleRemoveFile = (target: 'A' | 'B') => {
    if (target === 'A') setFileA(null);
    else setFileB(null);
  };

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      showToast('Análise consolidada concluída!');
    }, 1500);
  };

  const handleExportPDF = async () => {
    try {
      const dummyReport: ReportData = analysisResult || {
        fileA: { name: fileA?.name || activePhoto?.name || 'Arquivo A' },
        fileB: { name: fileB?.name || 'Lote Sincronizado' },
        executiveSummary: 'Relatório do catálogo de fotos processado.',
        fileASummary: 'Fotos originais importadas.',
        fileBSummary: 'Ajustes aplicados via Forma Editor.',
        keyInsights: ['Sincronização de tom concluída', 'Remoção de imperfeições ativa'],
        recommendations: ['Exportar lote em alta resolução'],
        consolidatedMetrics: [
          { metric: 'Total de Fotos', valA: String(photos.length), valB: String(photos.length), variance: '0' },
          { metric: 'Fotos Aprovadas (Pick)', valA: String(photos.filter(p => p.flag === 'pick').length), valB: String(photos.filter(p => p.flag === 'pick').length), variance: '0' },
        ],
        discrepancies: [],
        consolidatedRows: [],
      };

      await exportConsolidatedPDF(dummyReport);
      showToast('Download do PDF do Catálogo iniciado!');
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      showToast('Erro ao gerar o documento PDF.');
    }
  };

  const handleReset = () => {
    setFileA(null);
    setFileB(null);
    setAnalysisResult(null);
    setCustomInstructions('');
    setActiveTab('develop');
    setActiveFloatingTool('develop');
    showToast('Biblioteca pronta para novo lote.');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-white selection:text-zinc-950 overflow-hidden relative">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasData={!!analysisResult}
        onExportPDF={handleExportPDF}
        onReset={handleReset}
        isAnalyzing={isAnalyzing}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        photoCount={photos.length}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-zinc-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-zinc-700 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-white" />
          {toastMessage}
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full mx-auto px-2 sm:px-4 py-2 relative flex flex-col">
        {/* VIEW 4: Admin Panel */}
        {activeTab === 'admin' && (
          <div className="max-w-4xl mx-auto w-full pt-10">
            <AdminPanel />
          </div>
        )}

        {/* VIEW 1: Develop / Workspace - Centered Photo Canvas always visible */}
        {(activeTab === 'develop' || activeTab === 'loupe' || activeTab === 'upload') && (
          <div className="relative w-full flex-1 flex items-center justify-center">
            {/* Centered Photo Canvas Viewer */}
            <PhotoCanvasViewer
              photoUrl={activePhoto?.url}
              originalPhotoUrl={activePhoto?.originalUrl || activePhoto?.url}
              photoName={activePhoto?.name}
              settings={activePhoto?.settings || DEFAULT_LR_SETTINGS}
              onOpenObjectRemover={() => setIsObjectRemoverOpen(true)}
              onOpenDevelopPanel={() => setActiveFloatingTool('develop')}
              onOpenImportModal={() => setIsImportModalOpen(true)}
            />

            {/* FLOATING MENU PANEL 1: Revelação (Lightroom Develop Sliders) */}
            <FloatingToolPanel
              title="Módulo de Revelação"
              icon={<Sliders className="w-4 h-4 text-zinc-950" />}
              isOpen={activeFloatingTool === 'develop'}
              onClose={() => setActiveFloatingTool('none')}
              initialPosition="right"
              badge={activePhoto ? `${activePhoto.settings.temp}K` : '0'}
            >
              <LightroomDevelopPanel
                settings={activePhoto?.settings || DEFAULT_LR_SETTINGS}
                onChangeSettings={handleUpdateActiveSettings}
                fileAName={activePhoto?.name}
                photoUrl={activePhoto?.url}
                photoName={activePhoto?.name}
                onApplyPreset={(pName) => showToast(`Preset "${pName}" aplicado na foto!`)}
                onOpenObjectRemover={() => setIsObjectRemoverOpen(true)}
                onApplyToAllPhotos={handleApplyToAllPhotos}
              />
            </FloatingToolPanel>

            {/* FLOATING MENU PANEL 2: Presets & XMP Files */}
            <FloatingToolPanel
              title="Filtros & Presets XMP"
              icon={<Sparkles className="w-4 h-4 text-zinc-950" />}
              isOpen={activeFloatingTool === 'presets'}
              onClose={() => setActiveFloatingTool('none')}
              initialPosition="right"
            >
              <div className="p-2">
                <LightroomDevelopPanel
                  settings={activePhoto?.settings || DEFAULT_LR_SETTINGS}
                  onChangeSettings={handleUpdateActiveSettings}
                  fileAName={activePhoto?.name}
                  photoUrl={activePhoto?.url}
                  photoName={activePhoto?.name}
                  onApplyPreset={(pName) => showToast(`Preset "${pName}" aplicado!`)}
                  onOpenObjectRemover={() => setIsObjectRemoverOpen(true)}
                  onApplyToAllPhotos={handleApplyToAllPhotos}
                />
              </div>
            </FloatingToolPanel>

            {/* FLOATING MENU PANEL 3: Filme do Lote (Batch Filmstrip) */}
            <FloatingToolPanel
              title="Filme do Lote"
              icon={<Camera className="w-4 h-4 text-zinc-950" />}
              isOpen={activeFloatingTool === 'filmstrip'}
              onClose={() => setActiveFloatingTool('none')}
              initialPosition="left"
              badge={`${photos.length} fotos`}
            >
              <BatchFilmstrip
                photos={photos}
                activePhotoId={activePhotoId || photos[0]?.id}
                onSelectActivePhoto={setActivePhotoId}
                selectedPhotoIds={selectedPhotoIds}
                onToggleSelectPhoto={handleToggleSelectPhoto}
                onSelectAllPhotos={handleSelectAllPhotos}
                onUpdatePhotoRating={handleUpdateRating}
                onUpdatePhotoFlag={handleUpdateFlag}
                onOpenSyncModal={() => setIsSyncModalOpen(true)}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onOpenExportModal={() => setIsExportModalOpen(true)}
              />
            </FloatingToolPanel>

            {/* FLOATING MENU PANEL 4: Lupa Comparativa (Before/After) */}
            <FloatingToolPanel
              title="Lupa Comparativa (Antes / Depois)"
              icon={<Split className="w-4 h-4 text-zinc-950" />}
              isOpen={activeFloatingTool === 'loupe'}
              onClose={() => setActiveFloatingTool('none')}
              initialPosition="left"
            >
              <PhotoLoupeComparison
                photoUrl={activePhoto?.url}
                originalPhotoUrl={activePhoto?.originalUrl || activePhoto?.url}
                settings={activePhoto?.settings || DEFAULT_LR_SETTINGS}
                fileAName={`${activePhoto?.name || 'Foto'} (Original)`}
                fileBName={`${activePhoto?.name || 'Foto'} (Tratado)`}
              />
            </FloatingToolPanel>

            {/* FLOATING BOTTOM DOCK: Quick Toggle Bar ("Um comando por vez") */}
            <FloatingDock
              activeTool={activeFloatingTool}
              onSelectTool={setActiveFloatingTool}
              photoCount={photos.length}
              selectedCount={selectedPhotoIds.length}
              onOpenSyncModal={() => setIsSyncModalOpen(true)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onOpenObjectRemover={() => setIsObjectRemoverOpen(true)}
            />
          </div>
        )}

        {/* VIEW 2: Upload / Data Analysis Tab */}
        {activeTab === 'upload' && fileA && (
          <FileUploadSection
            fileA={fileA}
            fileB={fileB}
            onFileUpload={handleFileUpload}
            onSelectSamplePair={handleSelectSamplePair}
            onPreviewFile={setPreviewFile}
            onRemoveFile={handleRemoveFile}
            customInstructions={customInstructions}
            setCustomInstructions={setCustomInstructions}
            onStartAnalysis={handleStartAnalysis}
            isAnalyzing={isAnalyzing}
          />
        )}

        {/* VIEW 3: Results & Consolidation Views */}
        {analysisResult && (
          <div className="space-y-6 pt-4 max-w-7xl mx-auto w-full">
            {/* Tab: Resumo Executivo */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <ExecutiveSummaryCard
                  summary={analysisResult.executiveSummary}
                  fileAName={fileA?.name || activePhoto?.name || 'Arquivo A'}
                  fileASummary={analysisResult.fileASummary}
                  fileBName={fileB?.name || 'Lote Sincronizado'}
                  fileBSummary={analysisResult.fileBSummary}
                  keyInsights={analysisResult.keyInsights}
                />

                <MetricsGrid
                  metrics={analysisResult.consolidatedMetrics}
                  fileAName={fileA?.name || activePhoto?.name || 'Arquivo A'}
                  fileBName={fileB?.name || 'Lote Sincronizado'}
                />
              </div>
            )}

            {/* Tab: Gráficos */}
            {activeTab === 'charts' && (
              <ComparativeCharts
                chartData={(analysisResult as any).chartData || []}
                fileAName={fileA?.name || activePhoto?.name || 'Arquivo A'}
                fileBName={fileB?.name || 'Lote Sincronizado'}
              />
            )}

            {/* Tab: Discrepâncias */}
            {activeTab === 'discrepancies' && (
              <DiscrepanciesTable
                discrepancies={analysisResult.discrepancies}
                fileAName={fileA?.name || activePhoto?.name || 'Arquivo A'}
                fileBName={fileB?.name || 'Lote Sincronizado'}
              />
            )}

            {/* Tab: Tabela Consolidada */}
            {activeTab === 'table' && (
              <ConsolidatedDataTable
                rows={analysisResult.consolidatedRows || []}
                fileAName={fileA?.name || activePhoto?.name || 'Arquivo A'}
                fileBName={fileB?.name || 'Lote Sincronizado'}
              />
            )}

            {/* Tab: Chat / Perguntar à IA */}
            {activeTab === 'chat' && (
              <AiChatDrawer fileA={fileA} fileB={fileB} />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <SyncSettingsModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        targetCount={selectedPhotoIds.length || photos.length}
        onConfirmSync={handleConfirmSync}
      />

      <BatchImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportPhotos={handleImportNewPhotos}
      />

      <BatchExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        photos={photos}
        onExportPDF={handleExportPDF}
      />

      <ObjectRemoverModal
        isOpen={isObjectRemoverOpen}
        onClose={() => setIsObjectRemoverOpen(false)}
        photoUrl={activePhoto?.url || ''}
        photoName={activePhoto?.name || 'Foto Activa'}
        onApplyEditedPhoto={handleApplyEditedPhoto}
      />

      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />

      {/* Offline Status Indicator */}
      <OfflineIndicator />
    </div>
  );
}
