import { LightroomSettings } from '../components/LightroomDevelopPanel';

/**
 * Unified CSS filter string calculation for LightroomDevelopPanel settings (-100 to +100)
 */
export function calcLightroomCssFilter(settings: LightroomSettings): string {
  // Brightness: Exposure (-100..+100), Highlights, Shadows, Whites, Blacks
  const exposureContrib = settings.exposure * 0.65;
  const highlightsContrib = settings.highlights * 0.15;
  const shadowsContrib = settings.shadows * 0.15;
  const whitesContrib = settings.whites * 0.1;
  const blacksContrib = settings.blacks * 0.05;

  const brightness = Math.max(
    10,
    100 + exposureContrib + highlightsContrib + shadowsContrib + whitesContrib + blacksContrib
  );

  // Contrast: Contrast (-100..+100) and Clarity/Texture
  const contrastContrib = settings.contrast * 0.6 + settings.clarity * 0.2;
  const contrast = Math.max(10, 100 + contrastContrib);

  // Saturation & Vibrance (-100..+100)
  const saturationContrib = settings.saturation + settings.vibrance * 0.5;
  const saturate = Math.max(0, 100 + saturationContrib);

  // Temperature & Tint
  const tempOffset = (settings.temp - 5500) / 100;
  const hueRotate = settings.tint * 0.4 + (tempOffset < 0 ? tempOffset * 0.2 : 0);
  const sepia = tempOffset > 0 ? Math.min(30, tempOffset * 0.6) : 0;

  return `brightness(${brightness.toFixed(1)}%) contrast(${contrast.toFixed(1)}%) saturate(${saturate.toFixed(
    1
  )}%) hue-rotate(${hueRotate.toFixed(1)}deg) sepia(${sepia.toFixed(1)}%)`;
}

/**
 * Robustly loads an image into an HTMLImageElement handling blob:, data:, and http(s): URLs cleanly.
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const isRemote = url.startsWith('http://') || url.startsWith('https://');

    if (isRemote) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => resolve(img);

    img.onerror = async () => {
      if (isRemote && img.crossOrigin) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => resolve(fallbackImg);
        fallbackImg.onerror = () => {
          fetchImageAsBlob(url)
            .then(resolve)
            .catch(() => reject(new Error(`Falha ao carregar imagem: ${url}`)));
        };
        fallbackImg.src = url;
        return;
      }

      fetchImageAsBlob(url)
        .then(resolve)
        .catch(() => reject(new Error(`Falha ao carregar imagem: ${url}`)));
    };

    img.src = url;
  });
}

async function fetchImageAsBlob(url: string): Promise<HTMLImageElement> {
  const response = await fetch(url);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = objectUrl;
  });
}

/**
 * Renders photo onto HTML5 canvas with exact Lightroom settings and exports high-res DataURL / JPEG Blob
 */
export async function renderPhotoWithLightroomSettings(
  imageUrl: string,
  settings: LightroomSettings,
  maxWidth = 2048
): Promise<string> {
  try {
    const img = await loadImage(imageUrl);

    const canvas = document.createElement('canvas');
    const aspect = img.height / (img.width || 1);
    const targetWidth = Math.min(img.width || 2048, maxWidth);
    const targetHeight = Math.round(targetWidth * (aspect || 1));

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context not available');
    }

    // 1. Calculate & apply unified CSS filter
    const filterString = calcLightroomCssFilter(settings);
    ctx.filter = filterString;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Reset filter for secondary passes
    ctx.filter = 'none';

    // 2. Apply HSL Color & Saturation adjustment pass if selective color changes exist
    if (
      settings.satYellow !== 0 ||
      settings.satGreen !== 0 ||
      settings.satBlue !== 0 ||
      settings.satOrange !== 0 ||
      settings.lumOrange !== 0 ||
      settings.lumGreen !== 0
    ) {
      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imgData.data;

      const yellowSatFactor = 1 + (settings.satYellow || 0) / 100;
      const greenSatFactor = 1 + (settings.satGreen || 0) / 100;
      const blueSatFactor = 1 + (settings.satBlue || 0) / 100;
      const orangeSatFactor = 1 + (settings.satOrange || 0) / 100;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Green desaturation / tint shift (e.g. foliage)
        if (g > r && g > b && greenSatFactor !== 1) {
          const avg = (r + g + b) / 3;
          data[i + 1] = Math.min(255, Math.max(0, Math.round(avg + (g - avg) * greenSatFactor)));
        }
        // Yellow desaturation / tint shift
        else if (r > b && g > b && yellowSatFactor !== 1) {
          const avg = (r + g + b) / 3;
          data[i] = Math.min(255, Math.max(0, Math.round(avg + (r - avg) * yellowSatFactor)));
          data[i + 1] = Math.min(255, Math.max(0, Math.round(avg + (g - avg) * yellowSatFactor)));
        }
        // Blue saturation / tint shift
        else if (b > r && b > g && blueSatFactor !== 1) {
          const avg = (r + g + b) / 3;
          data[i + 2] = Math.min(255, Math.max(0, Math.round(avg + (b - avg) * blueSatFactor)));
        }
        // Skin tone / Orange adjustment
        else if (r > g && g > b && orangeSatFactor !== 1) {
          const avg = (r + g + b) / 3;
          data[i] = Math.min(255, Math.max(0, Math.round(avg + (r - avg) * orangeSatFactor)));
        }
      }

      ctx.putImageData(imgData, 0, 0);
    }

    // 3. Apply Vignette overlay if configured
    if (settings.vignette !== 0) {
      const vignetteAmount = Math.abs(settings.vignette) / 100;
      const radius = Math.max(targetWidth, targetHeight) * 0.75;
      const isNegative = settings.vignette < 0;

      const grad = ctx.createRadialGradient(
        targetWidth / 2,
        targetHeight / 2,
        radius * (1 - vignetteAmount * 0.7),
        targetWidth / 2,
        targetHeight / 2,
        radius
      );

      if (isNegative) {
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, `rgba(0, 0, 0, ${(vignetteAmount * 0.85).toFixed(2)})`);
      } else {
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(1, `rgba(255, 255, 255, ${(vignetteAmount * 0.6).toFixed(2)})`);
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (err) {
    console.error('Error rendering photo for export:', err);
    return imageUrl;
  }
}
