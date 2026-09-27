import React, { useState, useRef } from 'react';
import {
  Sliders,
  Sun,
  Eye,
  RotateCcw,
  Sparkles,
  Aperture,
  Layers,
  Palette,
  Maximize2,
  Check,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Copy,
  Clipboard,
  Wand2,
  Upload,
  FileCode,
  Zap,
  Download,
  Cpu,
  Film,
  Loader2,
} from 'lucide-react';
import { parseXmpPreset, applyXmpToSettings } from '../utils/xmpParser';
import {
  runRawndAutoEnhance,
  RAWND_FILM_PROFILES,
  downloadRawndXmpFile,
  RawndFilmProfile,
} from '../utils/rawndEngine';

export interface LightroomSettings {
  temp: number;
  tint: number;
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  texture: number;
  clarity: number;
  dehaze: number;
  vibrance: number;
  saturation: number;
  // Tone Curve / Parametric
  curveHighlights: number;
  curveLights: number;
  curveDarks: number;
  curveShadows: number;
  // HSL Hues
  hueRed: number;
  hueOrange: number;
  hueYellow: number;
  hueGreen: number;
  hueAqua: number;
  hueBlue: number;
  huePurple: number;
  hueMagenta: number;
  // HSL Saturation
  satRed: number;
  satOrange: number;
  satYellow: number;
  satGreen: number;
  satAqua: number;
  satBlue: number;
  satPurple: number;
  satMagenta: number;
  // HSL Luminance
  lumRed: number;
  lumOrange: number;
  lumYellow: number;
  lumGreen: number;
  lumAqua: number;
  lumBlue: number;
  lumPurple: number;
  lumMagenta: number;
  // Detail
  sharpening: number;
  noiseReduction: number;
  // Lens
  lensProfile: boolean;
  chromaticAberration: boolean;
  vignette: number;
}

export const DEFAULT_LR_SETTINGS: LightroomSettings = {
  temp: 5500,
  tint: 0,
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  texture: 0,
  clarity: 0,
  dehaze: 0,
  vibrance: 0,
  saturation: 0,
  curveHighlights: 0,
  curveLights: 0,
  curveDarks: 0,
  curveShadows: 0,
  hueRed: 0,
  hueOrange: 0,
  hueYellow: 0,
  hueGreen: 0,
  hueAqua: 0,
  hueBlue: 0,
  huePurple: 0,
  hueMagenta: 0,
  satRed: 0,
  satOrange: 0,
  satYellow: 0,
  satGreen: 0,
  satAqua: 0,
  satBlue: 0,
  satPurple: 0,
  satMagenta: 0,
  lumRed: 0,
  lumOrange: 0,
  lumYellow: 0,
  lumGreen: 0,
  lumAqua: 0,
  lumBlue: 0,
  lumPurple: 0,
  lumMagenta: 0,
  sharpening: 0,
  noiseReduction: 0,
  lensProfile: false,
  chromaticAberration: false,
  vignette: 0,
};

/**
 * Official Preset: Forma Color (Parsed from user Adobe XMP)
 */
export const FORMA_COLOR_PRESET: LightroomSettings = {
  temp: 5737,
  tint: 20,
  exposure: -35, // -1.77 EV
  contrast: 20,
  highlights: -53,
  shadows: 50,
  whites: 0,
  blacks: 16,
  texture: -12,
  clarity: 0,
  dehaze: 0,
  vibrance: 0,
  saturation: -31,
  curveHighlights: -14,
  curveLights: 5,
  curveDarks: 83,
  curveShadows: 34,
  hueRed: 10,
  hueOrange: 0,
  hueYellow: 0,
  hueGreen: 0,
  hueAqua: 10,
  hueBlue: -12,
  huePurple: 20,
  hueMagenta: 20,
  satRed: 0,
  satOrange: 20,
  satYellow: -72,
  satGreen: -52,
  satAqua: 0,
  satBlue: -38,
  satPurple: -35,
  satMagenta: -35,
  lumRed: 11,
  lumOrange: -15,
  lumYellow: -25,
  lumGreen: -79,
  lumAqua: -12,
  lumBlue: -21,
  lumPurple: 0,
  lumMagenta: 0,
  sharpening: 35,
  noiseReduction: 25,
  lensProfile: true,
  chromaticAberration: true,
  vignette: 0,
};

/**
 * Custom Double-Click Lockable Slider Component
 */
interface LrSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  unit?: string;
  accentClass?: string;
  trackGradient?: string;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
}

export const LrSlider: React.FC<LrSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  defaultValue = 0,
  unit = '',
  accentClass = 'accent-zinc-100',
  trackGradient = 'bg-zinc-800',
  onChange,
  formatValue,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const displayVal = formatValue
    ? formatValue(value)
    : `${value > 0 && defaultValue === 0 ? '+' : ''}${
        typeof value === 'number' && step < 1 ? value.toFixed(2) : value
      }${unit}`;

  const handleDoubleClick = () => {
    if (!isUnlocked) {
      setIsUnlocked(true);
    } else {
      onChange(defaultValue);
    }
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`p-2 rounded-xl transition-all border select-none ${
        isUnlocked
          ? 'bg-zinc-800 border-zinc-700 ring-1 ring-zinc-500'
          : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-800/60 hover:border-zinc-700'
      }`}
      title="Clique 2 vezes para destravar ou redefinir o nível do ajuste"
    >
      <div className="flex items-center justify-between text-[11px] font-medium mb-1.5">
        <span className="text-zinc-200 font-bold flex items-center gap-1.5 cursor-pointer">
          {label}
          {!isUnlocked ? (
            <span className="text-[9px] text-zinc-400 font-semibold border border-zinc-700 px-1.5 py-0.5 rounded bg-zinc-950 flex items-center gap-1">
              🔒 2x clique p/ ajustar
            </span>
          ) : (
            <span className="text-[9px] text-zinc-950 font-bold border border-zinc-300 px-1.5 py-0.5 rounded bg-zinc-100 flex items-center gap-1 animate-pulse">
              🔓 Ativo (2x p/ redefinir)
            </span>
          )}
        </span>

        <button
          onClick={handleDoubleClick}
          className="font-mono text-white font-bold hover:text-zinc-300 bg-zinc-950 hover:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 transition-colors text-[11px]"
          title="Clique duas vezes para redefinir"
        >
          {displayVal}
        </button>
      </div>

      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={!isUnlocked}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-2 rounded cursor-pointer transition-all accent-zinc-100 ${trackGradient} ${
            !isUnlocked ? 'opacity-40 cursor-not-allowed filter grayscale' : 'opacity-100'
          }`}
        />
      </div>
    </div>
  );
};

interface CustomXmpPresetItem {
  id: string;
  name: string;
  settings: Partial<LightroomSettings>;
}

export interface LightroomDevelopPanelProps {
  settings: LightroomSettings;
  onChangeSettings: (newSettings: LightroomSettings) => void;
  fileAName?: string;
  fileBName?: string;
  photoUrl?: string;
  photoName?: string;
  onApplyPreset: (presetName: string) => void;
  onOpenObjectRemover?: () => void;
  onApplyToAllPhotos?: (newSettings: LightroomSettings) => void;
}

export const LightroomDevelopPanel: React.FC<LightroomDevelopPanelProps> = ({
  settings,
  onChangeSettings,
  fileAName = 'Arquivo A',
  fileBName = 'Arquivo B',
  photoUrl,
  photoName,
  onApplyPreset,
  onOpenObjectRemover,
  onApplyToAllPhotos,
}) => {
  const [openSection, setOpenSection] = useState<'basic' | 'rawnd' | 'curve' | 'hsl' | 'grading' | 'detail' | 'optics'>('basic');
  const [hslTab, setHslTab] = useState<'hue' | 'sat' | 'lum'>('sat');

  const [customPresets, setCustomPresets] = useState<CustomXmpPresetItem[]>([]);
  const [lastUploadedName, setLastUploadedName] = useState<string | null>(null);
  const [isAutoEnhancing, setIsAutoEnhancing] = useState(false);
  const [activeFilmProfile, setActiveFilmProfile] = useState<string | null>(null);

  const xmpInputRef = useRef<HTMLInputElement>(null);

  const updateSetting = <K extends keyof LightroomSettings>(key: K, val: LightroomSettings[K]) => {
    onChangeSettings({ ...settings, [key]: val });
  };

  const handleReset = () => {
    onChangeSettings(DEFAULT_LR_SETTINGS);
  };

  const handleRawndAutoEnhance = async () => {
    setIsAutoEnhancing(true);
    try {
      const enhanced = await runRawndAutoEnhance(photoUrl || '', settings);
      onChangeSettings(enhanced);
      onApplyPreset('Rawnd Auto-Enhance');
    } catch (err) {
      console.error('Erro no Rawnd Auto-Enhance:', err);
    } finally {
      setIsAutoEnhancing(false);
    }
  };

  const handleApplyFilmProfile = (profile: RawndFilmProfile) => {
    setActiveFilmProfile(profile.id);
    const updated = {
      ...settings,
      ...profile.settings,
    };
    onChangeSettings(updated);
    onApplyPreset(`Simulação Rawnd: ${profile.name}`);
  };

  const handleDownloadXmp = () => {
    downloadRawndXmpFile(settings, photoName || fileAName || 'revelacao_rawnd');
    onApplyPreset('Exportar XMP Sidecar');
  };

  const handleXmpFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const xmlText = event.target?.result as string;
      if (!xmlText) return;

      const parsed = parseXmpPreset(xmlText, file.name);
      const newSettings = applyXmpToSettings(settings, parsed.settings);

      onChangeSettings(newSettings);
      setLastUploadedName(parsed.title);

      const newPresetItem: CustomXmpPresetItem = {
        id: `xmp-${Date.now()}`,
        name: parsed.title,
        settings: parsed.settings,
      };

      setCustomPresets((prev) => [newPresetItem, ...prev.filter((p) => p.name !== parsed.title)]);
      onApplyPreset(`XMP: ${parsed.title}`);
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col text-zinc-100 text-xs font-sans overflow-hidden">
      {/* Top Header Bar Forma Vale Style */}
      <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-700/80 p-0.5 flex items-center justify-center shadow-lg ring-1 ring-white/10 overflow-hidden shrink-0">
            <img src="/logo_white.png" alt="Logomarca Oficial" className="w-full h-full object-contain filter drop-shadow" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight font-display">
              Módulo de Revelação
            </h3>
            <p className="text-[10px] text-zinc-400">
              Ajustes de -100 a +100 (0 neutro), HSL e suporte XMP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              localStorage.setItem('copied_lr_settings', JSON.stringify(settings));
              onApplyPreset('Copiar Configurações');
            }}
            className="px-2.5 py-1 text-[10px] font-bold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors flex items-center gap-1"
            title="Copiar todas as configurações de edição"
          >
            <Copy className="w-3 h-3 text-zinc-300" /> Copiar
          </button>

          <button
            onClick={() => {
              const saved = localStorage.getItem('copied_lr_settings');
              if (saved) {
                try {
                  const parsed = JSON.parse(saved);
                  onChangeSettings(parsed);
                  onApplyPreset('Colar Configurações');
                } catch {
                  /* ignore */
                }
              }
            }}
            className="px-2.5 py-1 text-[10px] font-bold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors flex items-center gap-1"
            title="Colar configurações"
          >
            <Clipboard className="w-3 h-3 text-zinc-300" /> Colar
          </button>

          <button
            onClick={handleReset}
            className="px-2.5 py-1 text-[10px] font-semibold text-zinc-400 bg-zinc-950 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors flex items-center gap-1"
            title="Zerar todos os comandos (Reset 0)"
          >
            <RotateCcw className="w-3 h-3 text-zinc-400" /> Zerar Tudo
          </button>
        </div>
      </div>

      {/* RAWND OPEN-SOURCE RAW DEVELOPMENT ENGINE SECTION */}
      <div className="p-3.5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold shadow">
              <Cpu className="w-3.5 h-3.5 text-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-xs text-white font-display tracking-tight">
                  Rawnd Engine API
                </h4>
                <span className="text-[9px] bg-zinc-800 text-zinc-200 font-mono px-1.5 py-0.5 rounded border border-zinc-700 font-semibold">
                  Open Source v2.4
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">
                Motor aberto de revelação RAW no navegador · Auto-Enhance & Simulação de Película
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadXmp}
            className="px-2.5 py-1 text-[11px] font-bold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="Baixar arquivo sidecar .XMP para Lightroom e Rawnd"
          >
            <Download className="w-3 h-3 text-zinc-300" />
            <span>Baixar .XMP</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleRawndAutoEnhance}
            disabled={isAutoEnhancing}
            className="p-2.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl font-black text-xs shadow flex items-center justify-center gap-2 transition-all cursor-pointer group"
            title="Otimiza automaticamente exposição, recuperação de altas-luzes/sombras e balanço tonal pelo motor Rawnd"
          >
            {isAutoEnhancing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                <span>Analisando Histograma...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-zinc-950 group-hover:scale-110 transition-transform" />
                <span>⚡ Rawnd Auto-Enhance (1 Clique)</span>
              </>
            )}
          </button>

          <button
            onClick={() => setOpenSection(openSection === 'rawnd' ? 'basic' : ('rawnd' as any))}
            className={`p-2.5 border rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              openSection === 'rawnd'
                ? 'bg-zinc-800 border-zinc-600 text-white'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-zinc-200" />
            <span>Simulações de Filme Rawnd ({RAWND_FILM_PROFILES.length})</span>
          </button>
        </div>
      </div>

      {/* HIGHLIGHTED PRESETS & ADOBE XMP FILE UPLOAD SECTION - 100% MONOCHROME */}
      <div className="p-4 bg-zinc-950 text-white border-b border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold">
              <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white font-display uppercase tracking-wider">
                Filtros em Destaque & Presets .XMP (Adobe LR)
              </h4>
              <p className="text-[10px] text-zinc-400">
                Suba seus arquivos .xmp do Lightroom ou clique para aplicar os filtros
              </p>
            </div>
          </div>

          <input
            type="file"
            accept=".xmp,.xml"
            ref={xmpInputRef}
            onChange={handleXmpFileUpload}
            className="hidden"
          />

          <button
            onClick={() => xmpInputRef.current?.click()}
            className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-[11px] rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-950" /> Subir Preset XMP
          </button>
        </div>

        {/* Quick Presets Grid with Fixed "Forma Color" */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {/* FIXED PRESET: FORMA COLOR */}
          <button
            onClick={() => {
              onApplyPreset('Forma Color');
              onChangeSettings({ ...FORMA_COLOR_PRESET });
            }}
            className="p-2.5 bg-zinc-100 text-zinc-950 hover:bg-white border border-white rounded-xl text-left transition-all group shadow-md"
          >
            <div className="text-[11px] font-black flex items-center justify-between">
              <span>✨ Forma Color</span>
              <span className="text-[8px] bg-zinc-950 text-white px-1.5 py-0.5 rounded uppercase font-mono font-bold">
                PRO
              </span>
            </div>
            <div className="text-[9px] text-zinc-700 font-bold mt-0.5">Preset Oficial · Temp 5737K</div>
          </button>

          <button
            onClick={() => {
              onApplyPreset('Villa7 Golden Warm');
              onChangeSettings({
                ...settings,
                temp: 6200,
                tint: 25,
                exposure: 30,
                highlights: -30,
                shadows: 35,
                vibrance: 25,
                satOrange: 20,
              });
            }}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-500 rounded-xl text-left transition-all group"
          >
            <div className="text-[11px] font-bold text-white group-hover:text-zinc-200">
              🌅 Golden Warm
            </div>
            <div className="text-[9px] text-zinc-400">Temp 6200K · Pele quente</div>
          </button>

          <button
            onClick={() => {
              onApplyPreset('Cool Editorial');
              onChangeSettings({
                ...settings,
                temp: 4800,
                tint: -15,
                contrast: 28,
                highlights: -45,
                shadows: 15,
                saturation: -15,
                satBlue: 25,
              });
            }}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-500 rounded-xl text-left transition-all group"
          >
            <div className="text-[11px] font-bold text-white group-hover:text-zinc-200">
              ❄️ Cool Editorial
            </div>
            <div className="text-[9px] text-zinc-400">Frio moderno · Alto tom</div>
          </button>

          <button
            onClick={() => {
              onApplyPreset('P&B Noir Dramático');
              onChangeSettings({
                ...settings,
                saturation: -100,
                vibrance: -100,
                contrast: 40,
                highlights: -20,
                shadows: 40,
                sharpening: 60,
              });
            }}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-500 rounded-xl text-left transition-all group"
          >
            <div className="text-[11px] font-bold text-white group-hover:text-zinc-200">
              🎞️ P&B Noir
            </div>
            <div className="text-[9px] text-zinc-400">Preto & Branco dramático</div>
          </button>

          <button
            onClick={() => {
              onApplyPreset('Retrato Suave');
              onChangeSettings({
                ...settings,
                temp: 5400,
                tint: 10,
                exposure: 15,
                highlights: -15,
                shadows: 20,
                texture: -25,
                clarity: 15,
                lumOrange: 25,
              });
            }}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-500 rounded-xl text-left transition-all group"
          >
            <div className="text-[11px] font-bold text-white group-hover:text-zinc-200">
              👤 Retrato Suave
            </div>
            <div className="text-[9px] text-zinc-400">Pele aveludada · Tom pastel</div>
          </button>

          <button
            onClick={() => {
              onApplyPreset('Cinema Moody');
              onChangeSettings({
                ...settings,
                temp: 5100,
                tint: -20,
                contrast: 32,
                highlights: -40,
                shadows: 25,
                dehaze: 35,
                satBlue: 30,
              });
            }}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-500 rounded-xl text-left transition-all group"
          >
            <div className="text-[11px] font-bold text-white group-hover:text-zinc-200">
              🎬 Cinema Moody
            </div>
            <div className="text-[9px] text-zinc-400">Tons cinematográficos</div>
          </button>

          {/* Render Imported Custom XMP Presets */}
          {customPresets.map((cp) => (
            <button
              key={cp.id}
              onClick={() => {
                const merged = applyXmpToSettings(settings, cp.settings);
                onChangeSettings(merged);
                onApplyPreset(`XMP: ${cp.name}`);
              }}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-left transition-all group"
            >
              <div className="text-[11px] font-bold text-white truncate flex items-center gap-1">
                <FileCode className="w-3 h-3 text-zinc-300 shrink-0" />
                {cp.name}
              </div>
              <div className="text-[9px] text-zinc-400">Preset XMP Personalizado</div>
            </button>
          ))}
        </div>

        {/* Action to Apply XMP to ALL photos in batch */}
        {onApplyToAllPhotos && (
          <div className="pt-2 flex items-center justify-between border-t border-zinc-800 text-[11px]">
            <span className="text-zinc-400">
              {lastUploadedName ? `Último XMP: "${lastUploadedName}"` : 'Repassar edição para o lote:'}
            </span>
            <button
              onClick={() => onApplyToAllPhotos(settings)}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl transition-all shadow flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-zinc-950" /> Aplicar Edição em Todas as Fotos
            </button>
          </div>
        )}
      </div>

      {/* AI Object Remover Feature Banner - 100% Black & White */}
      {onOpenObjectRemover && (
        <div className="p-3.5 bg-zinc-900 text-white border-b border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold shrink-0 shadow">
              <Wand2 className="w-4 h-4 text-zinc-950" />
            </div>
            <div>
              <h4 className="font-bold text-xs font-display text-white">
                Remover Objeto (Borracha Mágica)
              </h4>
              <p className="text-[10px] text-zinc-400">
                Pinte para apagar fios, pessoas ou imperfeições grátis
              </p>
            </div>
          </div>

          <button
            onClick={onOpenObjectRemover}
            className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-[11px] rounded-xl transition-all shadow shrink-0 flex items-center gap-1.5"
          >
            <Wand2 className="w-3.5 h-3.5 text-zinc-950" /> Abrir Borracha
          </button>
        </div>
      )}

      {/* Histogram SVG Visualization */}
      <div className="p-4 bg-zinc-950 text-white border-b border-zinc-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span>RGB 8-BIT</span>
          <span>ISO 100 · 85mm · f/1.4 · 1/1000s</span>
        </div>

        <div className="h-20 w-full bg-zinc-900 rounded-xl border border-zinc-800 relative overflow-hidden flex items-end">
          <svg className="w-full h-full absolute inset-0 opacity-80" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path
              d={`M 0,100 Q 15,${90 - settings.shadows / 3} 35,${70 - settings.contrast / 2} T 65,${
                50 - settings.exposure / 2
              } T 85,${40 + settings.highlights / 3} L 100,100 Z`}
              fill="rgba(255, 255, 255, 0.25)"
            />
            <path
              d={`M 0,100 Q 20,85 40,${60 - settings.temp / 200} Q 70,${40 - settings.vibrance / 3} 100,100 Z`}
              fill="rgba(255, 255, 255, 0.15)"
            />
          </svg>
          <div className="absolute top-1 left-2 text-[9px] text-zinc-500 font-mono">Sombras</div>
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] text-zinc-500 font-mono">Meios-Tons</div>
          <div className="absolute top-1 right-2 text-[9px] text-zinc-500 font-mono">Realces</div>
        </div>
      </div>

      {/* Accordion Panels with Double-Click Lockable Sliders (-100 to +100) */}
      <div className="divide-y divide-zinc-800 max-h-[550px] overflow-y-auto bg-zinc-900">
        {/* PANEL RAWND: SIMULAÇÕES DE FILME & CALIBRAÇÃO */}
        <div>
          <button
            onClick={() => setOpenSection(openSection === 'rawnd' ? ('' as any) : 'rawnd')}
            className="w-full px-4 py-3 bg-zinc-950 hover:bg-zinc-900 font-bold text-white flex items-center justify-between text-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <Film className="w-3.5 h-3.5 text-zinc-300" />
              <span>Simulações de Filme Rawnd (Perfis Analógicos)</span>
              <span className="text-[9px] bg-zinc-800 text-zinc-300 font-mono px-1.5 py-0.5 rounded border border-zinc-700">
                Rawnd API
              </span>
            </span>
            {openSection === 'rawnd' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {openSection === 'rawnd' && (
            <div className="p-4 space-y-3 bg-zinc-900">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {RAWND_FILM_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleApplyFilmProfile(profile)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      activeFilmProfile === profile.id
                        ? 'bg-zinc-100 text-zinc-950 border-white shadow-lg'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:bg-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{profile.name}</span>
                      <span
                        className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          activeFilmProfile === profile.id ? 'bg-zinc-950 text-white' : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {profile.badge}
                      </span>
                    </div>
                    <p
                      className={`text-[10px] line-clamp-2 ${
                        activeFilmProfile === profile.id ? 'text-zinc-800 font-medium' : 'text-zinc-400'
                      }`}
                    >
                      {profile.description}
                    </p>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  Processamento Local via Rawnd Web Engine
                </span>
                <button
                  onClick={handleDownloadXmp}
                  className="text-white hover:underline flex items-center gap-1 font-bold text-[11px] cursor-pointer"
                >
                  <Download className="w-3 h-3 text-zinc-300" /> Exportar Sidecar .XMP
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PANEL 1: BÁSICO */}
        <div>
          <button
            onClick={() => setOpenSection(openSection === 'basic' ? ('' as any) : 'basic')}
            className="w-full px-4 py-3 bg-zinc-950 hover:bg-zinc-900 font-bold text-white flex items-center justify-between text-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-zinc-300" /> Básico (Exposição, Balanço de Cores & Tom de -100 a +100)
            </span>
            {openSection === 'basic' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {openSection === 'basic' && (
            <div className="p-4 space-y-4 bg-zinc-900">
              {/* WB Preset dropdown */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <label className="text-[11px] font-semibold text-zinc-300">Balanço de Brancos:</label>
                <select
                  value={
                    settings.temp === 5737
                      ? 'forma_color'
                      : settings.temp === 5500
                      ? 'camera'
                      : settings.temp === 6500
                      ? 'cloudy'
                      : 'custom'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'forma_color') onChangeSettings({ ...FORMA_COLOR_PRESET });
                    else if (val === 'camera') updateSetting('temp', 5500);
                    else if (val === 'cloudy') updateSetting('temp', 6500);
                  }}
                  className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-[11px] font-medium text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="forma_color">Forma Color (5737K)</option>
                  <option value="camera">Neutro (5500K)</option>
                  <option value="cloudy">Nublado (6500K)</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              {/* Temp & Tint Sliders */}
              <div className="space-y-2.5">
                <LrSlider
                  label="Temperatura"
                  value={settings.temp}
                  min={2000}
                  max={10000}
                  step={50}
                  defaultValue={5500}
                  unit=" K"
                  accentClass="accent-zinc-100"
                  trackGradient="bg-zinc-800"
                  onChange={(val) => updateSetting('temp', val)}
                />

                <LrSlider
                  label="Colorido (Tint)"
                  value={settings.tint}
                  min={-100}
                  max={100}
                  defaultValue={0}
                  accentClass="accent-zinc-100"
                  trackGradient="bg-zinc-800"
                  onChange={(val) => updateSetting('tint', val)}
                />
              </div>

              {/* Tone Sliders (-100 to +100) */}
              <div className="space-y-2.5 pt-3 border-t border-zinc-800">
                <div className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider mb-1">
                  Tom (Tone) - De -100 a +100
                </div>

                <LrSlider
                  label="Exposição"
                  value={settings.exposure}
                  min={-100}
                  max={100}
                  defaultValue={0}
                  onChange={(val) => updateSetting('exposure', val)}
                />

                <LrSlider
                  label="Contraste"
                  value={settings.contrast}
                  min={-100}
                  max={100}
                  defaultValue={0}
                  onChange={(val) => updateSetting('contrast', val)}
                />

                <LrSlider
                  label="Realces (Highlights)"
                  value={settings.highlights}
                  min={-100}
                  max={100}
                  defaultValue={0}
                  onChange={(val) => updateSetting('highlights', val)}
                />

                <LrSlider
                  label="Sombras (Shadows)"
                  value={settings.shadows}
                  min={-100}
                  max={100}
                  defaultValue={0}
                  onChange={(val) => updateSetting('shadows', val)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <LrSlider
                    label="Brancos"
                    value={settings.whites}
                    min={-100}
                    max={100}
                    defaultValue={0}
                    onChange={(val) => updateSetting('whites', val)}
                  />

                  <LrSlider
                    label="Pretos"
                    value={settings.blacks}
                    min={-100}
                    max={100}
                    defaultValue={0}
                    onChange={(val) => updateSetting('blacks', val)}
                  />
                </div>
              </div>

              {/* Presence Sliders (-100 to +100) */}
              <div className="space-y-2.5 pt-3 border-t border-zinc-800">
                <div className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider mb-1">
                  Presença (Presence)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <LrSlider
                    label="Textura"
                    value={settings.texture}
                    min={-100}
                    max={100}
                    defaultValue={0}
                    onChange={(val) => updateSetting('texture', val)}
                  />

                  <LrSlider
                    label="Clareza"
                    value={settings.clarity}
                    min={-100}
                    max={100}
                    defaultValue={0}
                    onChange={(val) => updateSetting('clarity', val)}
                  />
                </div>

                <LrSlider
                  label="Desembaçar (Dehaze)"
                  value={settings.dehaze}
                  min={-100}
                  max={100}
                  defaultValue={0}
                  onChange={(val) => updateSetting('dehaze', val)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <LrSlider
                    label="Vibração"
                    value={settings.vibrance}
                    min={-100}
                    max={100}
                    defaultValue={0}
                    onChange={(val) => updateSetting('vibrance', val)}
                  />

                  <LrSlider
                    label="Saturação"
                    value={settings.saturation}
                    min={-100}
                    max={100}
                    defaultValue={0}
                    onChange={(val) => updateSetting('saturation', val)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PANEL 2: CURVA DE TONS */}
        <div>
          <button
            onClick={() => setOpenSection(openSection === 'curve' ? ('' as any) : 'curve')}
            className="w-full px-4 py-3 bg-zinc-950 hover:bg-zinc-900 font-bold text-white flex items-center justify-between text-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <Aperture className="w-3.5 h-3.5 text-zinc-300" /> Curva de Tons (-100 a +100)
            </span>
            {openSection === 'curve' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {openSection === 'curve' && (
            <div className="p-4 space-y-2.5 bg-zinc-900">
              <LrSlider
                label="Realces (Parametric Highlights)"
                value={settings.curveHighlights}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(val) => updateSetting('curveHighlights', val)}
              />
              <LrSlider
                label="Luzes (Parametric Lights)"
                value={settings.curveLights}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(val) => updateSetting('curveLights', val)}
              />
              <LrSlider
                label="Tons Escuros (Parametric Darks)"
                value={settings.curveDarks}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(val) => updateSetting('curveDarks', val)}
              />
              <LrSlider
                label="Sombras (Parametric Shadows)"
                value={settings.curveShadows}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(val) => updateSetting('curveShadows', val)}
              />
            </div>
          )}
        </div>

        {/* PANEL 3: MISTURADOR HSL COMPLETO (8 CANAIS DE COR) */}
        <div>
          <button
            onClick={() => setOpenSection(openSection === 'hsl' ? ('' as any) : 'hsl')}
            className="w-full px-4 py-3 bg-zinc-950 hover:bg-zinc-900 font-bold text-white flex items-center justify-between text-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-zinc-300" /> Misturador HSL Completo (8 Canais)
            </span>
            {openSection === 'hsl' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {openSection === 'hsl' && (
            <div className="p-4 space-y-3 bg-zinc-900">
              <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setHslTab('hue')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    hslTab === 'hue' ? 'bg-zinc-100 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Matiz (Hue)
                </button>
                <button
                  onClick={() => setHslTab('sat')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    hslTab === 'sat' ? 'bg-zinc-100 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Saturação
                </button>
                <button
                  onClick={() => setHslTab('lum')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    hslTab === 'lum' ? 'bg-zinc-100 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Luminância
                </button>
              </div>

              {/* Hue Tab */}
              {hslTab === 'hue' && (
                <div className="space-y-2 pt-1">
                  <LrSlider label="Matiz Vermelho" value={settings.hueRed} min={-100} max={100} onChange={(v) => updateSetting('hueRed', v)} />
                  <LrSlider label="Matiz Laranja" value={settings.hueOrange} min={-100} max={100} onChange={(v) => updateSetting('hueOrange', v)} />
                  <LrSlider label="Matiz Amarelo" value={settings.hueYellow} min={-100} max={100} onChange={(v) => updateSetting('hueYellow', v)} />
                  <LrSlider label="Matiz Verde" value={settings.hueGreen} min={-100} max={100} onChange={(v) => updateSetting('hueGreen', v)} />
                  <LrSlider label="Matiz Aqua" value={settings.hueAqua} min={-100} max={100} onChange={(v) => updateSetting('hueAqua', v)} />
                  <LrSlider label="Matiz Azul" value={settings.hueBlue} min={-100} max={100} onChange={(v) => updateSetting('hueBlue', v)} />
                  <LrSlider label="Matiz Púrpura" value={settings.huePurple} min={-100} max={100} onChange={(v) => updateSetting('huePurple', v)} />
                  <LrSlider label="Matiz Magenta" value={settings.hueMagenta} min={-100} max={100} onChange={(v) => updateSetting('hueMagenta', v)} />
                </div>
              )}

              {/* Saturation Tab */}
              {hslTab === 'sat' && (
                <div className="space-y-2 pt-1">
                  <LrSlider label="Saturação Vermelho" value={settings.satRed} min={-100} max={100} onChange={(v) => updateSetting('satRed', v)} />
                  <LrSlider label="Saturação Laranja (Pele)" value={settings.satOrange} min={-100} max={100} onChange={(v) => updateSetting('satOrange', v)} />
                  <LrSlider label="Saturação Amarelo" value={settings.satYellow} min={-100} max={100} onChange={(v) => updateSetting('satYellow', v)} />
                  <LrSlider label="Saturação Verde" value={settings.satGreen} min={-100} max={100} onChange={(v) => updateSetting('satGreen', v)} />
                  <LrSlider label="Saturação Aqua" value={settings.satAqua} min={-100} max={100} onChange={(v) => updateSetting('satAqua', v)} />
                  <LrSlider label="Saturação Azul (Céu)" value={settings.satBlue} min={-100} max={100} onChange={(v) => updateSetting('satBlue', v)} />
                  <LrSlider label="Saturação Púrpura" value={settings.satPurple} min={-100} max={100} onChange={(v) => updateSetting('satPurple', v)} />
                  <LrSlider label="Saturação Magenta" value={settings.satMagenta} min={-100} max={100} onChange={(v) => updateSetting('satMagenta', v)} />
                </div>
              )}

              {/* Luminance Tab */}
              {hslTab === 'lum' && (
                <div className="space-y-2 pt-1">
                  <LrSlider label="Luminância Vermelho" value={settings.lumRed} min={-100} max={100} onChange={(v) => updateSetting('lumRed', v)} />
                  <LrSlider label="Luminância Laranja (Pele)" value={settings.lumOrange} min={-100} max={100} onChange={(v) => updateSetting('lumOrange', v)} />
                  <LrSlider label="Luminância Amarelo" value={settings.lumYellow} min={-100} max={100} onChange={(v) => updateSetting('lumYellow', v)} />
                  <LrSlider label="Luminância Verde" value={settings.lumGreen} min={-100} max={100} onChange={(v) => updateSetting('lumGreen', v)} />
                  <LrSlider label="Luminância Aqua" value={settings.lumAqua} min={-100} max={100} onChange={(v) => updateSetting('lumAqua', v)} />
                  <LrSlider label="Luminância Azul" value={settings.lumBlue} min={-100} max={100} onChange={(v) => updateSetting('lumBlue', v)} />
                  <LrSlider label="Luminância Púrpura" value={settings.lumPurple} min={-100} max={100} onChange={(v) => updateSetting('lumPurple', v)} />
                  <LrSlider label="Luminância Magenta" value={settings.lumMagenta} min={-100} max={100} onChange={(v) => updateSetting('lumMagenta', v)} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* PANEL 4: DETALHE */}
        <div>
          <button
            onClick={() => setOpenSection(openSection === 'detail' ? ('' as any) : 'detail')}
            className="w-full px-4 py-3 bg-zinc-950 hover:bg-zinc-900 font-bold text-white flex items-center justify-between text-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-zinc-300" /> Detalhe (Nitidez & Ruído) (-100 a +100)
            </span>
            {openSection === 'detail' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {openSection === 'detail' && (
            <div className="p-4 space-y-2.5 bg-zinc-900">
              <LrSlider
                label="Nitidez (Sharpening)"
                value={settings.sharpening}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(val) => updateSetting('sharpening', val)}
              />
              <LrSlider
                label="Redução de Ruído"
                value={settings.noiseReduction}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(val) => updateSetting('noiseReduction', val)}
              />
            </div>
          )}
        </div>

        {/* PANEL 5: ÓPTICA & VINHETA */}
        <div>
          <button
            onClick={() => setOpenSection(openSection === 'optics' ? ('' as any) : 'optics')}
            className="w-full px-4 py-3 bg-zinc-950 hover:bg-zinc-900 font-bold text-white flex items-center justify-between text-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <Maximize2 className="w-3.5 h-3.5 text-zinc-300" /> Óptica & Vinheta (-100 a +100)
            </span>
            {openSection === 'optics' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {openSection === 'optics' && (
            <div className="p-4 space-y-3 bg-zinc-900">
              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-300 font-semibold">Correção de Perfil de Lente</span>
                <input
                  type="checkbox"
                  checked={settings.lensProfile}
                  onChange={(e) => updateSetting('lensProfile', e.target.checked)}
                  className="w-4 h-4 rounded accent-zinc-100 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-300 font-semibold">Remover Aberração Cromática</span>
                <input
                  type="checkbox"
                  checked={settings.chromaticAberration}
                  onChange={(e) => updateSetting('chromaticAberration', e.target.checked)}
                  className="w-4 h-4 rounded accent-zinc-100 cursor-pointer"
                />
              </div>

              <LrSlider
                label="Vinheta (Vignette)"
                value={settings.vignette}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(val) => updateSetting('vignette', val)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
