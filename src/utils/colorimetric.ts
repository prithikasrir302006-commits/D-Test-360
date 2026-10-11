import { ImageQualityReport, ColorSwatch, ReagentProfile, PreliminaryResultType } from '../types';

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
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

      // Glare detection (harsh reflections on plastic pouches / glass ampoules)
      if (r > 240 && g > 240 && b > 240) {
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

  // Sharpness via Laplacian 2nd derivative operator
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
  const glareDetected = glareRatio > 0.12;

  // Status mapping
  let brightnessStatus: ImageQualityReport['brightnessStatus'] = 'Optimal';
  if (meanLum < 45) brightnessStatus = 'Under-Exposed';
  else if (meanLum > 205 || glareDetected) brightnessStatus = 'Over-Exposed / Glare';

  let sharpnessStatus: ImageQualityReport['sharpnessStatus'] = 'Sharp';
  if (sharpnessVariance < 45) sharpnessStatus = 'Blurry / Unreliable';
  else if (sharpnessVariance < 85) sharpnessStatus = 'Slightly Soft';

  const megapixels = parseFloat(((width * height) / 1000000).toFixed(2));
  const issues: string[] = [];

  if (brightnessStatus === 'Under-Exposed') {
    issues.push('Ambient illumination too low. Reaction pouch is underexposed.');
  }
  if (brightnessStatus === 'Over-Exposed / Glare' || glareDetected) {
    issues.push('Excessive specular reflection/glare on test ampoule or plastic pouch.');
  }
  if (sharpnessStatus === 'Blurry / Unreliable') {
    issues.push('Camera blur detected (Laplacian variance low). Chemical boundaries are smoothed.');
  }
  if (megapixels < 0.25) {
    issues.push('Resolution is below recommended standard for pouch reading.');
  }

  // Calculate algorithmic quality score (0-100)
  let qScore = 95;
  if (brightnessStatus !== 'Optimal') qScore -= 25;
  if (glareDetected) qScore -= 20;
  if (sharpnessStatus === 'Blurry / Unreliable') qScore -= 35;
  else if (sharpnessStatus === 'Slightly Soft') qScore -= 12;
  if (megapixels < 0.25) qScore -= 15;

  const qualityScore = Math.max(10, Math.min(100, Math.round(qScore)));
  const isAcceptable = qualityScore >= 60 && sharpnessStatus !== 'Blurry / Unreliable';

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
 * Extracts representative sample reaction color from reaction reservoir
 */
export function extractReactionColor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): ColorSwatch {
  // Focus on the central reaction chamber region (middle 50% of the image)
  const startX = Math.floor(width * 0.25);
  const startY = Math.floor(height * 0.25);
  const sampleW = Math.floor(width * 0.5);
  const sampleH = Math.floor(height * 0.5);

  const imgData = ctx.getImageData(startX, startY, sampleW, sampleH);
  const data = imgData.data;

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let validCount = 0;

  // Filter out specular highlights (glare) and extreme shadows to find true pigment
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 128) continue;
    // Exclude near-white glare (R,G,B > 240)
    if (r > 240 && g > 240 && b > 240) continue;
    // Exclude complete black background (R,G,B < 15)
    if (r < 15 && g < 15 && b < 15) continue;

    sumR += r;
    sumG += g;
    sumB += b;
    validCount++;
  }

  if (validCount === 0) {
    return {
      hex: '#808080',
      rgb: { r: 128, g: 128, b: 128 },
      name: 'Unresolved Pigment',
    };
  }

  const avgR = Math.round(sumR / validCount);
  const avgG = Math.round(sumG / validCount);
  const avgB = Math.round(sumB / validCount);

  return {
    hex: rgbToHex(avgR, avgG, avgB),
    rgb: { r: avgR, g: avgG, b: avgB },
    name: `Sample Reaction Swatch (${rgbToHex(avgR, avgG, avgB)})`,
  };
}

/**
 * Objective Colorimetric Decision Engine:
 * Compares extracted sample reaction against chosen Reagent Profile standard transitions.
 */
export function evaluateColorimetricTest(
  sampleColor: ColorSwatch,
  reagent: ReagentProfile,
  quality: ImageQualityReport
): {
  preliminaryResult: PreliminaryResultType;
  presumptiveSubstance: string;
  matchedReferenceColor?: ColorSwatch;
  colorDistanceDeltaE: number;
  confidenceScore: number;
} {
  // If technical image quality fails validation, immediately flag as Inconclusive / Retake
  if (!quality.isAcceptable) {
    return {
      preliminaryResult: 'Inconclusive / Retake',
      presumptiveSubstance: 'Image Quality Unacceptable for Evidentiary Evaluation',
      colorDistanceDeltaE: 99.9,
      confidenceScore: 0,
    };
  }

  let minPositiveDist = Infinity;
  let bestPositiveMatch: (typeof reagent.referenceColors)[0] | null = null;

  for (const ref of reagent.referenceColors) {
    const dist = calculateDeltaE(sampleColor.rgb, ref.expectedRgb);
    if (dist < minPositiveDist) {
      minPositiveDist = dist;
      bestPositiveMatch = ref;
    }
  }

  // Also calculate distance to negative/unreacted baseline
  const negRgb = hexToRgb(reagent.negativeExpectedColor.hex);
  const negativeDist = calculateDeltaE(sampleColor.rgb, negRgb);

  // Forensic threshold classification:
  // DeltaE <= 45 indicates strong chromatic affinity with positive reference standard
  const POSITIVE_THRESHOLD = 52;
  const NEGATIVE_THRESHOLD = 45;

  if (minPositiveDist <= POSITIVE_THRESHOLD && minPositiveDist < negativeDist) {
    // Matched Positive Reference
    const confidence = Math.max(45, Math.min(96, Math.round(100 - minPositiveDist * 0.8)));

    return {
      preliminaryResult: 'Presumptive Positive',
      presumptiveSubstance: bestPositiveMatch?.substanceName || 'Presumptive Controlled Substance',
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

  if (negativeDist <= NEGATIVE_THRESHOLD && negativeDist < minPositiveDist) {
    // Matched Negative Baseline
    const confidence = Math.max(50, Math.min(95, Math.round(100 - negativeDist * 0.9)));

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

  // Neither clearly positive nor standard negative baseline -> Inconclusive / Retake
  return {
    preliminaryResult: 'Inconclusive / Retake',
    presumptiveSubstance: 'Ambiguous Chromatic Value / Inconclusive Reaction',
    colorDistanceDeltaE: parseFloat(minPositiveDist.toFixed(1)),
    confidenceScore: 30,
  };
}
