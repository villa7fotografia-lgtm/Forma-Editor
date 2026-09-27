import { LightroomSettings } from '../components/LightroomDevelopPanel';

export interface XmpPresetResult {
  title: string;
  settings: Partial<LightroomSettings>;
  rawValues: Record<string, string>;
}

/**
 * Parses Adobe Lightroom .xmp preset XML content into LightroomSettings
 */
export function parseXmpPreset(xmlContent: string, fileName: string): XmpPresetResult {
  const cleanTitle = fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
  const settings: Partial<LightroomSettings> = {};
  const rawValues: Record<string, string> = {};

  // Helper to extract attribute or element value
  const getCrsValue = (key: string): string | null => {
    // 1. Try Attribute search: crs:Key="value" or crs:Key='+0.25'
    const attrRegex = new RegExp(`crs:${key}=["']([^"']+)["']`, 'i');
    const attrMatch = xmlContent.match(attrRegex);
    if (attrMatch && attrMatch[1]) {
      return attrMatch[1];
    }

    // 2. Try Element search: <crs:Key>value</crs:Key>
    const elemRegex = new RegExp(`<crs:${key}>([^<]+)</crs:${key}>`, 'i');
    const elemMatch = xmlContent.match(elemRegex);
    if (elemMatch && elemMatch[1]) {
      return elemMatch[1];
    }

    // 3. Try DOMParser fallback
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      const descriptions = xmlDoc.getElementsByTagName('rdf:Description');
      for (let i = 0; i < descriptions.length; i++) {
        const item = descriptions[i];
        if (item.hasAttribute(`crs:${key}`)) {
          return item.getAttribute(`crs:${key}`);
        }
      }
    } catch {
      /* ignore DOMParser errors */
    }

    return null;
  };

  const parseFloatVal = (key: string): number | undefined => {
    const valStr = getCrsValue(key);
    if (valStr !== null) {
      rawValues[key] = valStr;
      const parsed = parseFloat(valStr.replace('+', ''));
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    return undefined;
  };

  // Basic WB & Exposure
  const temp = parseFloatVal('Temperature');
  if (temp !== undefined) settings.temp = Math.min(12000, Math.max(2000, temp));

  const tint = parseFloatVal('Tint');
  if (tint !== undefined) settings.tint = tint;

  const exposureEV = parseFloatVal('Exposure2012') ?? parseFloatVal('Exposure');
  if (exposureEV !== undefined) {
    // Convert EV (-5..+5) to slider scale (-100..+100)
    settings.exposure = Math.round(exposureEV * 20);
  }

  const contrast = parseFloatVal('Contrast2012') ?? parseFloatVal('Contrast');
  if (contrast !== undefined) settings.contrast = contrast;

  const highlights = parseFloatVal('Highlights2012') ?? parseFloatVal('Highlights');
  if (highlights !== undefined) settings.highlights = highlights;

  const shadows = parseFloatVal('Shadows2012') ?? parseFloatVal('Shadows');
  if (shadows !== undefined) settings.shadows = shadows;

  const whites = parseFloatVal('Whites2012') ?? parseFloatVal('Whites');
  if (whites !== undefined) settings.whites = whites;

  const blacks = parseFloatVal('Blacks2012') ?? parseFloatVal('Blacks');
  if (blacks !== undefined) settings.blacks = blacks;

  const texture = parseFloatVal('Texture');
  if (texture !== undefined) settings.texture = texture;

  const clarity = parseFloatVal('Clarity2012') ?? parseFloatVal('Clarity');
  if (clarity !== undefined) settings.clarity = clarity;

  const dehaze = parseFloatVal('Dehaze');
  if (dehaze !== undefined) settings.dehaze = dehaze;

  const vibrance = parseFloatVal('Vibrance');
  if (vibrance !== undefined) settings.vibrance = vibrance;

  const saturation = parseFloatVal('Saturation');
  if (saturation !== undefined) settings.saturation = saturation;

  // Tone Curves / Parametric
  const curveHighlights = parseFloatVal('ParametricHighlights');
  if (curveHighlights !== undefined) settings.curveHighlights = curveHighlights;

  const curveLights = parseFloatVal('ParametricLights');
  if (curveLights !== undefined) settings.curveLights = curveLights;

  const curveDarks = parseFloatVal('ParametricDarks');
  if (curveDarks !== undefined) settings.curveDarks = curveDarks;

  const curveShadows = parseFloatVal('ParametricShadows');
  if (curveShadows !== undefined) settings.curveShadows = curveShadows;

  // HSL Hues
  if (parseFloatVal('HueAdjustmentRed') !== undefined) settings.hueRed = parseFloatVal('HueAdjustmentRed');
  if (parseFloatVal('HueAdjustmentOrange') !== undefined) settings.hueOrange = parseFloatVal('HueAdjustmentOrange');
  if (parseFloatVal('HueAdjustmentYellow') !== undefined) settings.hueYellow = parseFloatVal('HueAdjustmentYellow');
  if (parseFloatVal('HueAdjustmentGreen') !== undefined) settings.hueGreen = parseFloatVal('HueAdjustmentGreen');
  if (parseFloatVal('HueAdjustmentAqua') !== undefined) settings.hueAqua = parseFloatVal('HueAdjustmentAqua');
  if (parseFloatVal('HueAdjustmentBlue') !== undefined) settings.hueBlue = parseFloatVal('HueAdjustmentBlue');
  if (parseFloatVal('HueAdjustmentPurple') !== undefined) settings.huePurple = parseFloatVal('HueAdjustmentPurple');
  if (parseFloatVal('HueAdjustmentMagenta') !== undefined) settings.hueMagenta = parseFloatVal('HueAdjustmentMagenta');

  // HSL Saturation
  if (parseFloatVal('SaturationAdjustmentRed') !== undefined) settings.satRed = parseFloatVal('SaturationAdjustmentRed');
  if (parseFloatVal('SaturationAdjustmentOrange') !== undefined) settings.satOrange = parseFloatVal('SaturationAdjustmentOrange');
  if (parseFloatVal('SaturationAdjustmentYellow') !== undefined) settings.satYellow = parseFloatVal('SaturationAdjustmentYellow');
  if (parseFloatVal('SaturationAdjustmentGreen') !== undefined) settings.satGreen = parseFloatVal('SaturationAdjustmentGreen');
  if (parseFloatVal('SaturationAdjustmentAqua') !== undefined) settings.satAqua = parseFloatVal('SaturationAdjustmentAqua');
  if (parseFloatVal('SaturationAdjustmentBlue') !== undefined) settings.satBlue = parseFloatVal('SaturationAdjustmentBlue');
  if (parseFloatVal('SaturationAdjustmentPurple') !== undefined) settings.satPurple = parseFloatVal('SaturationAdjustmentPurple');
  if (parseFloatVal('SaturationAdjustmentMagenta') !== undefined) settings.satMagenta = parseFloatVal('SaturationAdjustmentMagenta');

  // HSL Luminance
  if (parseFloatVal('LuminanceAdjustmentRed') !== undefined) settings.lumRed = parseFloatVal('LuminanceAdjustmentRed');
  if (parseFloatVal('LuminanceAdjustmentOrange') !== undefined) settings.lumOrange = parseFloatVal('LuminanceAdjustmentOrange');
  if (parseFloatVal('LuminanceAdjustmentYellow') !== undefined) settings.lumYellow = parseFloatVal('LuminanceAdjustmentYellow');
  if (parseFloatVal('LuminanceAdjustmentGreen') !== undefined) settings.lumGreen = parseFloatVal('LuminanceAdjustmentGreen');
  if (parseFloatVal('LuminanceAdjustmentAqua') !== undefined) settings.lumAqua = parseFloatVal('LuminanceAdjustmentAqua');
  if (parseFloatVal('LuminanceAdjustmentBlue') !== undefined) settings.lumBlue = parseFloatVal('LuminanceAdjustmentBlue');
  if (parseFloatVal('LuminanceAdjustmentPurple') !== undefined) settings.lumPurple = parseFloatVal('LuminanceAdjustmentPurple');
  if (parseFloatVal('LuminanceAdjustmentMagenta') !== undefined) settings.lumMagenta = parseFloatVal('LuminanceAdjustmentMagenta');

  // Detail & Sharpening
  const sharpening = parseFloatVal('Sharpness');
  if (sharpening !== undefined) settings.sharpening = sharpening;

  const noiseReduction = parseFloatVal('ColorNoiseReduction') ?? parseFloatVal('LuminanceSmoothing');
  if (noiseReduction !== undefined) settings.noiseReduction = noiseReduction;

  const vignette = parseFloatVal('PostCropVignetteAmount') ?? parseFloatVal('VignetteAmount');
  if (vignette !== undefined) settings.vignette = vignette;

  return {
    title: cleanTitle || 'Preset Importado XMP',
    settings,
    rawValues,
  };
}

/**
 * Merge partial XMP settings with default Lightroom settings
 */
export function applyXmpToSettings(
  currentSettings: LightroomSettings,
  xmpPartial: Partial<LightroomSettings>
): LightroomSettings {
  return {
    ...currentSettings,
    ...xmpPartial,
  };
}
