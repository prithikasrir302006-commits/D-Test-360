export interface Operator {
  username: string;
  badgeNumber: string;
  agency: string;
  role: string;
  loginTime: string;
  isDemo: boolean;
}

export interface ColorSwatch {
  hex: string;
  rgb: { r: number; g: number; b: number };
  name: string;
}

export interface ReagentTransition {
  expectedHex: string;
  expectedRgb: { r: number; g: number; b: number };
  indication: 'Positive' | 'Negative' | 'Intermediate';
  substanceName: string;
  description: string;
}

export interface ReagentProfile {
  id: string;
  name: string;
  chemicalName: string;
  targetCategory: string;
  testSteps: string[];
  referenceColors: ReagentTransition[];
  negativeExpectedColor: { hex: string; description: string };
  forensicStandard: string; // e.g., 'SWGDRUG Category C Colorimetric'
}

export interface ImageQualityReport {
  brightness: number; // 0-255
  brightnessStatus: 'Optimal' | 'Under-Exposed' | 'Over-Exposed / Glare';
  contrast: number; // Std Dev
  sharpnessVariance: number; // Laplacian variance
  sharpnessStatus: 'Sharp' | 'Slightly Soft' | 'Blurry / Unreliable';
  glareDetected: boolean;
  resolution: { width: number; height: number; megapixels: number };
  isAcceptable: boolean;
  qualityScore: number; // 0-100
  issues: string[];
}

export interface LocationEvidence {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  isAvailable: boolean;
}

export interface CustodyLogEntry {
  action: string;
  timestamp: string;
  actor: string;
  details: string;
}

export type PreliminaryResultType =
  | 'Presumptive Positive'
  | 'Presumptive Negative'
  | 'Inconclusive / Retake';

export interface FieldTestRecord {
  id: string; // e.g. FC-2026-9841
  caseReference?: string;
  agency: string;
  operator: {
    username: string;
    badgeNumber: string;
  };
  timestamp: string;
  reagentProfile: ReagentProfile;
  imageDataUrl: string; // base64 preview
  imageQuality: ImageQualityReport;
  extractedSampleColor: ColorSwatch;
  matchedReferenceColor?: ColorSwatch;
  colorDistanceDeltaE: number;
  preliminaryResult: PreliminaryResultType;
  presumptiveSubstance: string;
  confidenceScore: number; // 0-100%
  operatorNotes?: string;
  location?: LocationEvidence;
  integrityHash: string; // SHA-256 hash of canonical evidence payload
  chainOfCustody: CustodyLogEntry[];
  isDemoData: boolean;
}

export interface FilterOptions {
  searchQuery: string;
  reagentId: string;
  resultStatus: string;
  dateRange: string;
}
