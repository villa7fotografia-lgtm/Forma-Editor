import { LightroomSettings } from '../components/LightroomDevelopPanel';

export type PhotoFlag = 'pick' | 'reject' | 'none';
export type ColorLabel = 'none' | 'red' | 'yellow' | 'green' | 'blue' | 'purple';

export interface PhotoExif {
  camera: string;
  lens: string;
  focalLength: string;
  aperture: string;
  shutter: string;
  iso: string;
  dateTime?: string;
}

export interface PhotoItem {
  id: string;
  name: string;
  url: string;
  originalUrl?: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  rating: number; // 0 to 5
  flag: PhotoFlag;
  colorLabel: ColorLabel;
  settings: LightroomSettings;
  exif: PhotoExif;
  editedAt?: string;
}

export interface SyncOptions {
  basicWB: boolean; // Temp & Tint
  basicTone: boolean; // Exposure, Contrast, Highlights, Shadows, Whites, Blacks
  basicPresence: boolean; // Texture, Clarity, Dehaze, Vibrance, Saturation
  toneCurve: boolean;
  hslColor: boolean;
  detail: boolean; // Sharpening & Noise Reduction
  optics: boolean; // Lens profile & Vignette
}

export const DEFAULT_SYNC_OPTIONS: SyncOptions = {
  basicWB: true,
  basicTone: true,
  basicPresence: true,
  toneCurve: true,
  hslColor: true,
  detail: true,
  optics: true,
};
