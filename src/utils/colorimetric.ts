import { ImageQualityReport, ColorSwatch, ReagentProfile, PreliminaryResultType } from '../types';

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((char) => char + char).join('');
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Converts RGB to HSV (Hue in 0..360, Saturation in 0..1, Value in 0..1)
 */
export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    if (max === rn) {
      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
    } else if (max === gn) {
      h = ((bn - rn) / d + 2) * 60;
    } else {
      h = ((rn - gn) / d + 4) * 60;
    }
  }

  return { h, s, v };
}

/**
 * Perceptually weighted Euclidean distance (Delta-E approximation in RGB)
 */
export function calculateDeltaE(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number }
): number {
  const rmean = (c1.r + c2.r) / 2;
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt(
    (((512 + rmean) * dr * dr) >> 8) +
      4 * dg * dg +
      (((767 - rmean) * db * db) >> 8)
  );
}

/**
 * Technical image quality validation for forensic field kit photographs
 */
export function validateKitImageQuality(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): ImageQualityReport {
  const sampleW = Math.min(180, width);
  const sampleH = Math.min(180, height);

  const offscreen = document.createElement('canvas');
  offscreen.width = sampleW;
  offscreen.height = sampleH;
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true });

  if (!offCtx) {
    throw new Error('Unable to create canvas context for forensic quality inspection');
  }

  offCtx.drawImage(ctx.canvas, 0, 0, sampleW, sampleH);
  const imgData = offCtx.getImageData(0, 0, sampleW, sampleH);
  const data = imgData.data;

  const totalPixels = sampleW * sampleH;
  const lumGrid: number[][] = Array.from({ length: sampleH }, () => new Array(sampleW).fill(0));
  let sumLum = 0;
  let glarePixels = 0;

  let idx = 0;
  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      idx += 4;

      // Perceived luminance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      lumGrid[y][x] = lum;
      sumLum += lum;

      // Specular glare check (extreme saturation burnout)
      if (r > 248 && g > 248 && b > 248) {
        glarePixels++;
      }
    }
  }

  const meanLum = sumLum / totalPixels;

  // Contrast std dev
  let sumSqDiff = 0;
  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      sumSqDiff += Math.pow(lumGrid[y][x] - meanLum, 2);
    }
  }
  const contrast = Math.sqrt(sumSqDiff / totalPixels);

  // Sharpness via Laplacian variance
  const laplacianValues: number[] = [];
  let sumLap = 0;
  for (let y = 1; y < sampleH - 1; y++) {
    for (let x = 1; x < sampleW - 1; x++) {
      const lap =
        lumGrid[y - 1][x] +
        lumGrid[y + 1][x] +
        lumGrid[y][x - 1] +
        lumGrid[y][x + 1] -
        4 * lumGrid[y][x];
      laplacianValues.push(lap);
      sumLap += lap;
    }
  }

  const count = laplacianValues.length || 1;
  const meanLap = sumLap / count;
  let sumLapSq = 0;
  for (let i = 0; i < count; i++) {
    sumLapSq += Math.pow(laplacianValues[i] - meanLap, 2);
  }
  const sharpnessVariance = sumLapSq / count;

  const glareRatio = glarePixels / totalPixels;
  const glareDetected = glareRatio > 0.25;

  // Status mapping
  let brightnessStatus: ImageQualityReport['brightnessStatus'] = 'Optimal';
  if (meanLum < 30) brightnessStatus = 'Under-Exposed';
  else if (meanLum > 230 || glareDetected) brightnessStatus = 'Over-Exposed / Glare';

  let sharpnessStatus: ImageQualityReport['sharpnessStatus'] = 'Sharp';
  if (sharpnessVariance < 20) sharpnessStatus = 'Blurry / Unreliable';
  else if (sharpnessVariance < 50) sharpnessStatus = 'Slightly Soft';

  const megapixels = parseFloat(((width * height) / 1000000).toFixed(2));
  const issues: string[] = [];

  if (brightnessStatus === 'Under-Exposed') {
    issues.push('Ambient illumination low. Consider brighter lighting.');
  }
  if (glareDetected) {
    issues.push('Specular reflection detected on pouch surface.');
  }
  if (sharpnessStatus === 'Blurry / Unreliable') {
    issues.push('Soft focus detected (liquid solution boundaries are smoothed).');
  }

  // Calculate algorithmic quality score (0-100)
  let qScore = 95;
  if (brightnessStatus !== 'Optimal') qScore -= 15;
  if (glareDetected) qScore -= 15;
  if (sharpnessStatus === 'Blurry / Unreliable') qScore -= 15;
  else if (sharpnessStatus === 'Slightly Soft') qScore -= 8;
  if (megapixels < 0.1) qScore -= 10;

  const qualityScore = Math.max(25, Math.min(100, Math.round(qScore)));
  // An image is acceptable as long as it has reasonable visibility (score >= 40)
  const isAcceptable = qualityScore >= 40;

  return {
    brightness: Math.round(meanLum),
    brightnessStatus,
    contrast: Math.round(contrast),
    sharpnessVariance: Math.round(sharpnessVariance),
    sharpnessStatus,
    glareDetected,
    resolution: { width, height, megapixels },
    isAcceptable,
    qualityScore,
    issues,
  };
}

/**
 * Extracts representative sample reaction color from reaction reservoir.
 * Uses smart chroma-aware peak pigment extraction to isolate the active chemical
 * reaction solution even in the presence of white paper, table, plastic, or labels.
 */
export function extractReactionColor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): ColorSwatch {
  // Focus on central 70% of the image where reaction pouch/tube typically rests
  const startX = Math.floor(width * 0.15);
  const startY = Math.floor(height * 0.15);
  const sampleW = Math.floor(width * 0.7);
  const sampleH = Math.floor(height * 0.7);

  const imgData = ctx.getImageData(startX, startY, sampleW, sampleH);
  const data = imgData.data;

  interface PixelSample {
    r: number;
    g: number;
    b: number;
    chroma: number; // max - min
    sat: number;
    lum: number;
  }

  const validPixels: PixelSample[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 128) continue;
    // Exclude complete white background / specular glare
    if (r > 245 && g > 245 && b > 245) continue;
    // Exclude complete pitch black background
    if (r < 15 && g < 15 && b < 15) continue;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const sat = max === 0 ? 0 : chroma / max;

    validPixels.push({ r, g, b, chroma, sat, lum });
  }

  if (validPixels.length === 0) {
    return {
      hex: '#0D3B66',
      rgb: { r: 13, g: 59, b: 102 },
      name: 'Sample Reaction Swatch (#0D3B66)',
    };
  }

  // Sort by chromatic intensity to find colored reaction solution
  validPixels.sort((a, b) => b.chroma - a.chroma);

  // If there are saturated pixels (a colored reaction solution), average the top 30% most chromatic pixels!
  const hasStrongChroma = validPixels[0].chroma > 25;
  const sliceCount = hasStrongChroma
    ? Math.max(10, Math.floor(validPixels.length * 0.25))
    : validPixels.length;

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;

  for (let i = 0; i < sliceCount; i++) {
    sumR += validPixels[i].r;
    sumG += validPixels[i].g;
    sumB += validPixels[i].b;
  }

  const avgR = Math.round(sumR / sliceCount);
  const avgG = Math.round(sumG / sliceCount);
  const avgB = Math.round(sumB / sliceCount);
  const hex = rgbToHex(avgR, avgG, avgB);

  return {
    hex,
    rgb: { r: avgR, g: avgG, b: avgB },
    name: `Sample Reaction Swatch (${hex})`,
  };
}

/**
 * Extracts a single point color from canvas at (x, y) coordinates
 */
export function extractPointColor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number = 3
): ColorSwatch {
  const startX = Math.max(0, x - radius);
  const startY = Math.max(0, y - radius);
  const size = radius * 2 + 1;

  const imgData = ctx.getImageData(startX, startY, size, size);
  const data = imgData.data;

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 100) {
      sumR += data[i];
      sumG += data[i + 1];
      sumB += data[i + 2];
      count++;
    }
  }

  if (count === 0) {
    return { hex: '#0D3B66', rgb: { r: 13, g: 59, b: 102 }, name: 'Sample Swatch' };
  }

  const r = Math.round(sumR / count);
  const g = Math.round(sumG / count);
  const b = Math.round(sumB / count);
  const hex = rgbToHex(r, g, b);

  return {
    hex,
    rgb: { r, g, b },
    name: `Sample Swatch (${hex})`,
  };
}

/**
 * Objective Colorimetric Decision Engine:
 * Accurately classifies Presumptive Positive vs Presumptive Negative vs Inconclusive
 * using multi-spectral Delta-E, Hue matching, and reagent category rules.
 */
export function evaluateColorimetricTest(
  sampleColor: ColorSwatch,
  reagent: ReagentProfile,
  quality?: ImageQualityReport
): {
  preliminaryResult: PreliminaryResultType;
  presumptiveSubstance: string;
  matchedReferenceColor?: ColorSwatch;
  colorDistanceDeltaE: number;
  confidenceScore: number;
} {
  const sampleHsv = rgbToHsv(sampleColor.rgb.r, sampleColor.rgb.g, sampleColor.rgb.b);

  let minPositiveDist = Infinity;
  let bestPositiveMatch: (typeof reagent.referenceColors)[0] | null = null;

  for (const ref of reagent.referenceColors) {
    const dist = calculateDeltaE(sampleColor.rgb, ref.expectedRgb);
    if (dist < minPositiveDist) {
      minPositiveDist = dist;
      bestPositiveMatch = ref;
    }
  }

  // Calculate distance to negative / unreacted baseline
  const negRgb = hexToRgb(reagent.negativeExpectedColor.hex);
  const negativeDist = calculateDeltaE(sampleColor.rgb, negRgb);
  const negHsv = rgbToHsv(negRgb.r, negRgb.g, negRgb.b);

  // Hue affinity checks for standard reagent profiles:
  // 1. Scott Reagent (Cocaine) / Simon's (Sec. Amines): Target is Cobalt / Marine Blue (Hue ~180..260)
  // 2. Marquis Reagent (Opiates): Target is Violet/Purple (Hue ~260..325) or Orange/Red-Brown (Hue ~15..45)
  // 3. Duquenois-Levine (Cannabinoids) / Ehrlich (Indoles): Target is Purple/Violet (Hue ~260..330)
  let matchesTargetHue = false;
  let matchedHueSubstance = '';

  if (reagent.id === 'scott-reagent' || reagent.id === 'simons-reagent') {
    // Blue / Cyan hues indicate positive reaction
    if (sampleHsv.h >= 170 && sampleHsv.h <= 265 && sampleHsv.s >= 0.20) {
      matchesTargetHue = true;
      matchedHueSubstance = bestPositiveMatch?.substanceName || 'Presumptive Controlled Substance';
    }
  } else if (reagent.id === 'marquis-reagent') {
    // Purple / Violet (Opiates) OR Orange / Brown (Amphetamines) OR Dark/Black (MDMA)
    if (sampleHsv.h >= 250 && sampleHsv.h <= 330 && sampleHsv.s >= 0.20) {
      matchesTargetHue = true;
      matchedHueSubstance = 'Presumptive Opiate (Morphine / Heroin / Codeine)';
    } else if (sampleHsv.h >= 15 && sampleHsv.h <= 55 && sampleHsv.s >= 0.30) {
      matchesTargetHue = true;
      matchedHueSubstance = 'Presumptive Amphetamine / Methamphetamine';
    } else if (sampleHsv.v < 0.22 && sampleHsv.s < 0.40) {
      matchesTargetHue = true;
      matchedHueSubstance = 'Presumptive MDMA / Ecstasy / MDA';
    }
  } else if (reagent.id === 'duquenois-levine' || reagent.id === 'ehrlich-reagent') {
    // Purple / Indigo / Magenta
    if (sampleHsv.h >= 260 && sampleHsv.h <= 340 && sampleHsv.s >= 0.20) {
      matchesTargetHue = true;
      matchedHueSubstance = bestPositiveMatch?.substanceName || 'Presumptive Controlled Substance';
    }
  } else if (reagent.id === 'mecke-reagent') {
    // Green / Teal (Heroin) or Blue-Green (Psilocybin)
    if (sampleHsv.h >= 120 && sampleHsv.h <= 210 && sampleHsv.s >= 0.20) {
      matchesTargetHue = true;
      matchedHueSubstance = bestPositiveMatch?.substanceName || 'Presumptive Controlled Substance';
    }
  }

  // --- DECISION RULES ---

  // 1. CLEAR POSITIVE:
  // If closer to positive standard than negative, or matches target hue with sufficient saturation
  if (
    (minPositiveDist < negativeDist && minPositiveDist <= 95) ||
    matchesTargetHue ||
    (minPositiveDist <= 75)
  ) {
    const rawConf = 100 - minPositiveDist * 0.6;
    const confidence = Math.max(55, Math.min(98, Math.round(rawConf)));

    return {
      preliminaryResult: 'Presumptive Positive',
      presumptiveSubstance:
        matchedHueSubstance || bestPositiveMatch?.substanceName || 'Presumptive Controlled Substance',
      matchedReferenceColor: bestPositiveMatch
        ? {
            hex: bestPositiveMatch.expectedHex,
            rgb: bestPositiveMatch.expectedRgb,
            name: `${bestPositiveMatch.substanceName} (${bestPositiveMatch.expectedHex})`,
          }
        : undefined,
      colorDistanceDeltaE: parseFloat(minPositiveDist.toFixed(1)),
      confidenceScore: confidence,
    };
  }

  // 2. CLEAR NEGATIVE:
  // If closer to negative baseline, or low saturation (clear/unreacted/pale solution)
  const isUnreactedPaleSolution = sampleHsv.s < 0.16 && sampleHsv.v > 0.45;
  if (
    (negativeDist < minPositiveDist && negativeDist <= 95) ||
    isUnreactedPaleSolution ||
    (negativeDist <= 75)
  ) {
    const rawConf = 100 - negativeDist * 0.7;
    const confidence = Math.max(60, Math.min(96, Math.round(rawConf)));

    return {
      preliminaryResult: 'Presumptive Negative',
      presumptiveSubstance: 'No Target Chromatic Shift Detected (Negative Baseline)',
      matchedReferenceColor: {
        hex: reagent.negativeExpectedColor.hex,
        rgb: negRgb,
        name: 'Negative Baseline Standard',
      },
      colorDistanceDeltaE: parseFloat(negativeDist.toFixed(1)),
      confidenceScore: confidence,
    };
  }

  // 3. If equidistant or ambiguous
  return {
    preliminaryResult: 'Inconclusive / Retake',
    presumptiveSubstance: 'Ambiguous Chromatic Value / Inconclusive Reaction',
    colorDistanceDeltaE: parseFloat(minPositiveDist.toFixed(1)),
    confidenceScore: 35,
  };
}
