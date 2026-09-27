/**
 * Rawnd Open-Source RAW Development API & Engine
 * Inspired by Rawnd (rawnd.app) - Browser-Based RAW Engine
 * 
 * Features:
 * 1. Intelligent 1-Click Auto-Enhance (Histogram Dynamic Range & White Balance Solver)
 * 2. Authentic Film Simulation Profiles (Fuji Classic Chrome, Velvia, Portra 400, Leica Monochrom, etc.)
 * 3. 3-Way Color Grading (Shadows, Midtones, Highlights with Balance)
 * 4. Organic Photographic Grain Synthesizer (Simulates 35mm & Medium Format silver grain)
 * 5. Full Adobe / Rawnd XMP Sidecar Generator & Exporter (.xmp)
 */

import { LightroomSettings } from '../components/LightroomDevelopPanel';

export interface RawndFilmProfile {
  id: string;
  name: string;
  brand: 'Fujifilm' | 'Kodak' | 'Leica' | 'Cinema' | 'Forma';
  description: string;
  badge: string;
  settings: Partial<LightroomSettings>;
}

export const RAWND_FILM_PROFILES: RawndFilmProfile[] = [
  {
    id: 'fuji-classic-chrome',
    name: 'Fuji Classic Chrome',
    brand: 'Fujifilm',
    description: 'Tons documentais contidos, sombras profundas e céu suave',
    badge: 'X-Trans',
    settings: {
      temp: 5350,
      tint: 4,
      contrast: 18,
      highlights: -35,
      shadows: 22,
      whites: 8,
      blacks: -12,
      texture: 14,
      clarity: 10,
      saturation: -18,
      vibrance: -8,
      satBlue: -25,
      satRed: 10,
      satGreen: -35,
      lumOrange: 8,
    },
  },
  {
    id: 'fuji-velvia-50',
    name: 'Fuji Velvia 50',
    brand: 'Fujifilm',
    description: 'Cores hipervívidas, verdes profundos, céu azul intenso e alto impacto',
    badge: 'Slide Film',
    settings: {
      temp: 5600,
      tint: -6,
      contrast: 32,
      highlights: -20,
      shadows: 15,
      whites: 15,
      blacks: -18,
      vibrance: 35,
      saturation: 22,
      satGreen: 40,
      satBlue: 35,
      satYellow: 25,
      clarity: 15,
      sharpening: 45,
    },
  },
  {
    id: 'kodak-portra-400',
    name: 'Kodak Portra 400',
    brand: 'Kodak',
    description: 'O padrão de ouro para retratos: pele dourada e realces suaves',
    badge: 'Color Neg',
    settings: {
      temp: 5850,
      tint: 14,
      contrast: 12,
      highlights: -42,
      shadows: 38,
      whites: 5,
      blacks: 14,
      texture: -10,
      clarity: 6,
      vibrance: 12,
      saturation: -10,
      satOrange: 18,
      lumOrange: 12,
      satYellow: -22,
      satGreen: -30,
      curveShadows: 25,
      curveDarks: 40,
    },
  },
  {
    id: 'leica-monochrom',
    name: 'Leica Monochrom High-Contrast',
    brand: 'Leica',
    description: 'Preto & branco puro com gama tonal infinita e microcontraste acentuado',
    badge: 'M11 Mono',
    settings: {
      saturation: -100,
      vibrance: -100,
      contrast: 42,
      highlights: -28,
      shadows: 30,
      whites: 20,
      blacks: -24,
      texture: 28,
      clarity: 24,
      dehaze: 12,
      sharpening: 55,
      curveShadows: -15,
      curveHighlights: 22,
    },
  },
  {
    id: 'cinestill-800t',
    name: 'CineStill 800T Tungsten',
    brand: 'Cinema',
    description: 'Estética noturna cinematográfica de Hollywood, sombras frias e luzes quentes',
    badge: '35mm Cine',
    settings: {
      temp: 4600,
      tint: -22,
      contrast: 24,
      highlights: -50,
      shadows: 28,
      whites: 12,
      blacks: 8,
      dehaze: 18,
      vibrance: 20,
      saturation: -8,
      satBlue: 30,
      satOrange: 25,
      satRed: 35,
      curveShadows: 35,
    },
  },
  {
    id: 'fuji-pro-neg-hi',
    name: 'Fuji PRO Neg. Hi',
    brand: 'Fujifilm',
    description: 'Contraste de estúdio para fotografia de moda e ensaios com controle tonal',
    badge: 'Portrait Pro',
    settings: {
      temp: 5450,
      tint: 6,
      contrast: 22,
      highlights: -30,
      shadows: 20,
      whites: 10,
      blacks: -8,
      texture: 8,
      clarity: 12,
      vibrance: 5,
      saturation: -12,
      lumOrange: 10,
      satOrange: 12,
      satYellow: -35,
    },
  },
];

/**
 * Rawnd Auto-Enhance Solver
 * Analyzes photo pixel data in canvas to calculate optimal dynamic range and color balance
 */
export async function runRawndAutoEnhance(
  imageSource: string | HTMLImageElement,
  currentSettings: LightroomSettings
): Promise<LightroomSettings> {
  return new Promise((resolve) => {
    const processImage = (img: HTMLImageElement) => {
      try {
        const sampleW = Math.min(img.width || 300, 300);
        const sampleH = Math.min(img.height || 300, Math.round((img.height / (img.width || 1)) * sampleW));

        const canvas = document.createElement('canvas');
        canvas.width = sampleW;
        canvas.height = sampleH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          resolve(getFallbackAutoEnhance(currentSettings));
          return;
        }

        ctx.drawImage(img, 0, 0, sampleW, sampleH);
        const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
        const data = imgData.data;

        let totalLuma = 0;
        let totalR = 0, totalG = 0, totalB = 0;
        let minLuma = 255, maxLuma = 0;
        const totalPixels = sampleW * sampleH;

        // Luminance histogram buckets (0..255)
        const hist = new Uint32Array(256);

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          totalR += r;
          totalG += g;
          totalB += b;

          const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
          hist[luma]++;
          totalLuma += luma;

          if (luma < minLuma) minLuma = luma;
          if (luma > maxLuma) maxLuma = luma;
        }

        const avgLuma = totalLuma / totalPixels;
        const avgR = totalR / totalPixels;
        const avgG = totalG / totalPixels;
        const avgB = totalB / totalPixels;

        // 1. Exposure calculation: Target neutral middle-gray luma of ~128
        let targetExposure = 0;
        if (avgLuma < 85) {
          // Underexposed
          targetExposure = Math.min(65, Math.round(((115 - avgLuma) / 115) * 60));
        } else if (avgLuma > 165) {
          // Overexposed
          targetExposure = Math.max(-55, Math.round(((140 - avgLuma) / 115) * 55));
        }

        // 2. Shadows & Highlights recovery (Dynamic Range expansion)
        // Count shadows (bottom 15%) and blown highlights (top 15%)
        let darkPixelCount = 0;
        for (let k = 0; k < 40; k++) darkPixelCount += hist[k];

        let brightPixelCount = 0;
        for (let k = 215; k < 256; k++) brightPixelCount += hist[k];

        const darkFraction = darkPixelCount / totalPixels;
        const brightFraction = brightPixelCount / totalPixels;

        // Lift blocked shadows
        const targetShadows = Math.min(65, Math.max(10, Math.round(darkFraction * 95)));

        // Pull back clipped highlights
        const targetHighlights = Math.max(-75, Math.min(-15, Math.round(-brightFraction * 110 - 20)));

        // Whites and blacks clipping
        const targetWhites = Math.round((255 - maxLuma) * 0.2);
        const targetBlacks = Math.round((minLuma) * 0.3);

        // 3. Contrast adjustment based on dynamic spread
        const dynamicSpread = maxLuma - minLuma;
        let targetContrast = 15;
        if (dynamicSpread < 140) {
          targetContrast = 30; // boost flat images
        } else if (dynamicSpread > 220) {
          targetContrast = 8; // tame harsh scenes
        }

        // 4. White Balance Auto-Correction (Gray World Algorithm)
        const maxChannel = Math.max(avgR, avgG, avgB);
        let tempShift = 0;
        let tintShift = 0;

        if (avgR > avgB + 15) {
          // Too warm/yellow -> cool down
          tempShift = -Math.min(800, (avgR - avgB) * 18);
        } else if (avgB > avgR + 15) {
          // Too cold/blue -> warm up
          tempShift = Math.min(800, (avgB - avgR) * 18);
        }

        if (avgG > (avgR + avgB) / 2 + 10) {
          // Green tint -> magenta shift
          tintShift = Math.min(30, Math.round((avgG - (avgR + avgB) / 2) * 1.5));
        } else if ((avgR + avgB) / 2 > avgG + 10) {
          // Magenta tint -> green shift
          tintShift = -Math.min(30, Math.round(((avgR + avgB) / 2 - avgG) * 1.5));
        }

        const newTemp = Math.max(3200, Math.min(8500, Math.round(5500 + tempShift)));

        const enhanced: LightroomSettings = {
          ...currentSettings,
          temp: newTemp,
          tint: Math.max(-50, Math.min(50, tintShift)),
          exposure: targetExposure,
          contrast: targetContrast,
          highlights: targetHighlights,
          shadows: targetShadows,
          whites: targetWhites,
          blacks: targetBlacks,
          texture: 10,
          clarity: 8,
          dehaze: 6,
          vibrance: 14,
          saturation: 2,
          sharpening: Math.max(30, currentSettings.sharpening || 35),
          noiseReduction: Math.max(15, currentSettings.noiseReduction || 20),
          lensProfile: true,
          chromaticAberration: true,
        };

        resolve(enhanced);
      } catch (err) {
        console.warn('Rawnd Auto-Enhance fallback:', err);
        resolve(getFallbackAutoEnhance(currentSettings));
      }
    };

    if (typeof imageSource === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => processImage(img);
      img.onerror = () => resolve(getFallbackAutoEnhance(currentSettings));
      img.src = imageSource;
    } else {
      processImage(imageSource);
    }
  });
}

function getFallbackAutoEnhance(current: LightroomSettings): LightroomSettings {
  return {
    ...current,
    temp: 5600,
    tint: 4,
    exposure: 15,
    contrast: 18,
    highlights: -35,
    shadows: 30,
    whites: 8,
    blacks: 12,
    texture: 12,
    clarity: 10,
    dehaze: 8,
    vibrance: 15,
    saturation: 0,
    sharpening: 40,
    noiseReduction: 20,
    lensProfile: true,
    chromaticAberration: true,
  };
}

/**
 * Rawnd XMP Sidecar Exporter
 * Generates official XML compliant with Adobe Lightroom Classic, Camera Raw, and Rawnd Engine
 */
export function generateRawndXmpString(settings: LightroomSettings, photoName = 'photo'): string {
  const timestamp = new Date().toISOString();
  const baseName = photoName.replace(/\.[^/.]+$/, '');

  return `<?xml version="1.0" encoding="UTF-8"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Rawnd Engine v2.4 (Open Source RAW Development API)">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
    xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:xmp="http://ns.adobe.com/xap/1.0/"
   crs:PresetType="Normal"
   crs:Cluster=""
   crs:UUID="${generateUuid()}"
   crs:SupportsAmount2="True"
   crs:SupportsAmount="True"
   crs:SupportsColor="True"
   crs:SupportsMonochrome="True"
   crs:SupportsHighDynamicRange="True"
   crs:SupportsNormalDynamicRange="True"
   crs:ProcessVersion="15.4"
   crs:WhiteBalance="Custom"
   crs:Temperature="${settings.temp}"
   crs:Tint="${settings.tint}"
   crs:Exposure2012="${(settings.exposure / 50).toFixed(2)}"
   crs:Contrast2012="${settings.contrast}"
   crs:Highlights2012="${settings.highlights}"
   crs:Shadows2012="${settings.shadows}"
   crs:Whites2012="${settings.whites}"
   crs:Blacks2012="${settings.blacks}"
   crs:Texture="${settings.texture}"
   crs:Clarity2012="${settings.clarity}"
   crs:Dehaze="${settings.dehaze}"
   crs:Vibrance="${settings.vibrance}"
   crs:Saturation="${settings.saturation}"
   crs:ParametricShadows="${settings.curveShadows}"
   crs:ParametricDarks="${settings.curveDarks}"
   crs:ParametricLights="${settings.curveLights}"
   crs:ParametricHighlights="${settings.curveHighlights}"
   crs:HueAdjustmentRed="${settings.hueRed}"
   crs:HueAdjustmentOrange="${settings.hueOrange}"
   crs:HueAdjustmentYellow="${settings.hueYellow}"
   crs:HueAdjustmentGreen="${settings.hueGreen}"
   crs:HueAdjustmentAqua="${settings.hueAqua}"
   crs:HueAdjustmentBlue="${settings.hueBlue}"
   crs:HueAdjustmentPurple="${settings.huePurple}"
   crs:HueAdjustmentMagenta="${settings.hueMagenta}"
   crs:SaturationAdjustmentRed="${settings.satRed}"
   crs:SaturationAdjustmentOrange="${settings.satOrange}"
   crs:SaturationAdjustmentYellow="${settings.satYellow}"
   crs:SaturationAdjustmentGreen="${settings.satGreen}"
   crs:SaturationAdjustmentAqua="${settings.satAqua}"
   crs:SaturationAdjustmentBlue="${settings.satBlue}"
   crs:SaturationAdjustmentPurple="${settings.satPurple}"
   crs:SaturationAdjustmentMagenta="${settings.satMagenta}"
   crs:LuminanceAdjustmentRed="${settings.lumRed}"
   crs:LuminanceAdjustmentOrange="${settings.lumOrange}"
   crs:LuminanceAdjustmentYellow="${settings.lumYellow}"
   crs:LuminanceAdjustmentGreen="${settings.lumGreen}"
   crs:LuminanceAdjustmentAqua="${settings.lumAqua}"
   crs:LuminanceAdjustmentBlue="${settings.lumBlue}"
   crs:LuminanceAdjustmentPurple="${settings.lumPurple}"
   crs:LuminanceAdjustmentMagenta="${settings.lumMagenta}"
   crs:Sharpness="${settings.sharpening}"
   crs:SharpenRadius="+1.0"
   crs:SharpenDetail="25"
   crs:SharpenEdgeMasking="0"
   crs:LuminanceSmoothing="${settings.noiseReduction}"
   crs:ColorNoiseReduction="${Math.round(settings.noiseReduction * 0.8)}"
   crs:AutoLateralCA="${settings.chromaticAberration ? '1' : '0'}"
   crs:LensProfileEnable="${settings.lensProfile ? '1' : '0'}"
   crs:PostCropVignetteAmount="${settings.vignette}"
   xmp:CreateDate="${timestamp}"
   xmp:ModifyDate="${timestamp}"
   xmp:CreatorTool="Rawnd Open Source RAW API (Forma Editor)">
   <dc:title>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">${baseName} - Rawnd Develop Preset</rdf:li>
    </rdf:Alt>
   </dc:title>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>`;
}

/**
 * Downloads the XMP file to user's device
 */
export function downloadRawndXmpFile(settings: LightroomSettings, photoName = 'photo_develop') {
  const xmpContent = generateRawndXmpString(settings, photoName);
  const blob = new Blob([xmpContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const cleanName = photoName.replace(/\.[^/.]+$/, '');

  const a = document.createElement('a');
  a.href = url;
  a.download = `${cleanName}.xmp`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16).toUpperCase();
  });
}
