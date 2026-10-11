import { FieldTestRecord, Operator } from '../types';
import { REAGENT_PROFILES } from '../utils/reagents';

const STORAGE_KEY_OPERATOR = 'dtest360_operator_v1';
const STORAGE_KEY_TESTS = 'dtest360_records_v1';
const STORAGE_KEY_BOTTOM_BORDER = 'dtest360_bottom_border_v1';
const STORAGE_KEY_LOGO = 'dtest360_logo_v1';
const STORAGE_KEY_BORDER_MODE = 'dtest360_border_mode_v1';

export function getStoredOperator(): Operator | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OPERATOR);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveOperator(op: Operator): void {
  try {
    localStorage.setItem(STORAGE_KEY_OPERATOR, JSON.stringify(op));
  } catch (e) {
    console.error('Error saving operator session', e);
  }
}

export function clearOperator(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_OPERATOR);
  } catch (e) {
    console.error('Error clearing operator session', e);
  }
}

// Custom Bottom Border Asset Storage
export function getStoredCustomBottomBorder(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_BOTTOM_BORDER);
  } catch {
    return null;
  }
}

export function saveCustomBottomBorder(dataUrl: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_BOTTOM_BORDER, dataUrl);
    window.dispatchEvent(new Event('dtest360_asset_updated'));
  } catch (e) {
    console.error('Error saving bottom border image', e);
  }
}

export function clearCustomBottomBorder(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_BOTTOM_BORDER);
    window.dispatchEvent(new Event('dtest360_asset_updated'));
  } catch (e) {
    console.error('Error clearing bottom border image', e);
  }
}

// Custom Logo Asset Storage
export function getStoredCustomLogo(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_LOGO);
  } catch {
    return null;
  }
}

export function saveCustomLogo(dataUrl: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOGO, dataUrl);
    window.dispatchEvent(new Event('dtest360_asset_updated'));
  } catch (e) {
    console.error('Error saving custom logo', e);
  }
}

export function clearCustomLogo(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_LOGO);
    window.dispatchEvent(new Event('dtest360_asset_updated'));
  } catch (e) {
    console.error('Error clearing custom logo', e);
  }
}

export function getStoredBorderMode(): 'landing_only' | 'all_pages' | 'hidden' {
  try {
    const mode = localStorage.getItem(STORAGE_KEY_BORDER_MODE);
    if (mode === 'landing_only' || mode === 'hidden') return mode;
    return 'all_pages';
  } catch {
    return 'all_pages';
  }
}

export function saveBorderMode(mode: 'landing_only' | 'all_pages' | 'hidden'): void {
  try {
    localStorage.setItem(STORAGE_KEY_BORDER_MODE, mode);
    window.dispatchEvent(new Event('dtest360_asset_updated'));
  } catch (e) {
    console.error('Error saving border mode', e);
  }
}

export function getStoredFieldTests(): FieldTestRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TESTS);
    if (!raw) {
      const demo = getInitialDemoRecords();
      localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(demo));
      return demo;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialDemoRecords();
  }
}

export function saveFieldTest(test: FieldTestRecord): void {
  try {
    const existing = getStoredFieldTests();
    const updated = [test, ...existing.filter((t) => t.id !== test.id)];
    localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving test record', e);
  }
}

export function deleteFieldTest(id: string): void {
  try {
    const existing = getStoredFieldTests();
    const updated = existing.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting test record', e);
  }
}

function getInitialDemoRecords(): FieldTestRecord[] {
  const scott = REAGENT_PROFILES[0];
  const marquis = REAGENT_PROFILES[1];
  const duquenois = REAGENT_PROFILES[2];

  return [
    {
      id: 'FT-2026-0001',
      caseReference: 'NCB/DZU/CR-448/2026',
      agency: 'Narcotics Control Bureau (NCB) — Delhi Zonal Unit',
      operator: { username: 'ncb_officer_verma', badgeNumber: 'NCB-ZO-4819' },
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      reagentProfile: scott,
      imageDataUrl: '',
      imageQuality: {
        brightness: 126,
        brightnessStatus: 'Optimal',
        contrast: 60,
        sharpnessVariance: 145,
        sharpnessStatus: 'Sharp',
        glareDetected: false,
        resolution: { width: 1280, height: 720, megapixels: 0.92 },
        isAcceptable: true,
        qualityScore: 94,
        issues: [],
      },
      extractedSampleColor: { hex: '#0E3C68', rgb: { r: 14, g: 60, b: 104 }, name: 'Reaction Pigment' },
      matchedReferenceColor: { hex: '#0D3B66', rgb: { r: 13, g: 59, b: 102 }, name: 'Scott Reagent Positive Layer' },
      colorDistanceDeltaE: 2.1,
      preliminaryResult: 'Presumptive Positive',
      presumptiveSubstance: 'Presumptive Cocaine Base / Hydrochloride',
      confidenceScore: 95,
      operatorNotes: 'Seizure memo item #1. Off-white compressed brick. 3-step Scott reagent assay produced cobalt blue extraction in lower chloroform layer.',
      location: {
        latitude: 28.6139,
        longitude: 77.2090,
        accuracy: 6.2,
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        isAvailable: true,
      },
      integrityHash: '9a8b7c6d5e4f3210abcd1234ef567890abcdef1234567890abcdef1234567890',
      chainOfCustody: [
        { action: 'Field Screening Capture', timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), actor: 'ncb_officer_verma', details: 'Pouch photo documented at interdiction checkpoint' },
        { action: 'Cryptographic Sealing', timestamp: new Date(Date.now() - 1000 * 60 * 34).toISOString(), actor: 'D-Test 360 Enclave', details: 'SHA-256 seal registered for court evidence' },
      ],
      isDemoData: true,
    },
    {
      id: 'FT-2026-0002',
      caseReference: 'NCB/MZU/CR-312/2026',
      agency: 'Narcotics Control Bureau (NCB) — Mumbai Zonal Unit',
      operator: { username: 'ncb_officer_verma', badgeNumber: 'NCB-ZO-4819' },
      timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
      reagentProfile: marquis,
      imageDataUrl: '',
      imageQuality: {
        brightness: 115,
        brightnessStatus: 'Optimal',
        contrast: 62,
        sharpnessVariance: 130,
        sharpnessStatus: 'Sharp',
        glareDetected: false,
        resolution: { width: 1920, height: 1080, megapixels: 2.07 },
        isAcceptable: true,
        qualityScore: 92,
        issues: [],
      },
      extractedSampleColor: { hex: '#651A94', rgb: { r: 101, g: 26, b: 148 }, name: 'Reaction Pigment' },
      matchedReferenceColor: { hex: '#6A1B9A', rgb: { r: 106, g: 27, b: 154 }, name: 'Marquis Opiate Standard' },
      colorDistanceDeltaE: 6.4,
      preliminaryResult: 'Presumptive Positive',
      presumptiveSubstance: 'Presumptive Opiate (Morphine / Heroin / Codeine)',
      confidenceScore: 89,
      operatorNotes: 'Brown crystalline powder discovered in transit parcel. Rapid violet-purple shift recorded at 8s.',
      integrityHash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      chainOfCustody: [
        { action: 'Field Screening Capture', timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(), actor: 'ncb_officer_verma', details: 'Marquis test documented' },
      ],
      isDemoData: true,
    },
    {
      id: 'FT-2026-0003',
      caseReference: 'NCB/KZU/CR-189/2026',
      agency: 'Narcotics Control Bureau (NCB) — Kolkata Zonal Unit',
      operator: { username: 'supv_mukherjee', badgeNumber: 'NCB-ZO-1104' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      reagentProfile: duquenois,
      imageDataUrl: '',
      imageQuality: {
        brightness: 138,
        brightnessStatus: 'Optimal',
        contrast: 54,
        sharpnessVariance: 118,
        sharpnessStatus: 'Sharp',
        glareDetected: false,
        resolution: { width: 1280, height: 720, megapixels: 0.92 },
        isAcceptable: true,
        qualityScore: 88,
        issues: [],
      },
      extractedSampleColor: { hex: '#521641', rgb: { r: 82, g: 22, b: 65 }, name: 'Reaction Pigment' },
      matchedReferenceColor: { hex: '#581845', rgb: { r: 88, g: 24, b: 69 }, name: 'Duquenois-Levine Positive Layer' },
      colorDistanceDeltaE: 7.2,
      preliminaryResult: 'Presumptive Positive',
      presumptiveSubstance: 'Presumptive Tetrahydrocannabinol (THC / Cannabis)',
      confidenceScore: 88,
      operatorNotes: 'Compressed herbal brick. Duquenois-Levine organic extraction confirmed deep violet lower layer.',
      integrityHash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      chainOfCustody: [
        { action: 'Field Screening Capture', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), actor: 'supv_mukherjee', details: 'Duquenois organic transfer logged' },
      ],
      isDemoData: true,
    },
    {
      id: 'FT-2026-0004',
      caseReference: 'NCB/BZU/CR-092/2026',
      agency: 'Narcotics Control Bureau (NCB) — Bengaluru Zonal Unit',
      operator: { username: 'supv_mukherjee', badgeNumber: 'NCB-ZO-1104' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
      reagentProfile: marquis,
      imageDataUrl: '',
      imageQuality: {
        brightness: 145,
        brightnessStatus: 'Optimal',
        contrast: 48,
        sharpnessVariance: 112,
        sharpnessStatus: 'Sharp',
        glareDetected: false,
        resolution: { width: 1280, height: 720, megapixels: 0.92 },
        isAcceptable: true,
        qualityScore: 87,
        issues: [],
      },
      extractedSampleColor: { hex: '#F7E498', rgb: { r: 247, g: 228, b: 152 }, name: 'Reaction Pigment' },
      matchedReferenceColor: { hex: '#F9E79F', rgb: { r: 249, g: 231, b: 159 }, name: 'Marquis Negative Baseline' },
      colorDistanceDeltaE: 4.8,
      preliminaryResult: 'Presumptive Negative',
      presumptiveSubstance: 'No Target Chromatic Shift Detected (Negative Baseline)',
      confidenceScore: 92,
      operatorNotes: 'Excipient powder test. Unreacted pale yellow baseline observed over 60s.',
      integrityHash: 'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
      chainOfCustody: [
        { action: 'Field Screening Capture', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(), actor: 'supv_mukherjee', details: 'No reaction noted' },
      ],
      isDemoData: true,
    },
    {
      id: 'FT-2026-0005',
      caseReference: 'NCB/CHZU/CR-071/2026',
      agency: 'Narcotics Control Bureau (NCB) — Chandigarh Zonal Unit',
      operator: { username: 'officer_sharma', badgeNumber: 'NCB-ZO-3021' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 65).toISOString(),
      reagentProfile: scott,
      imageDataUrl: '',
      imageQuality: {
        brightness: 235,
        brightnessStatus: 'Over-Exposed / Glare',
        contrast: 30,
        sharpnessVariance: 24,
        sharpnessStatus: 'Blurry / Unreliable',
        glareDetected: true,
        resolution: { width: 640, height: 480, megapixels: 0.31 },
        isAcceptable: false,
        qualityScore: 32,
        issues: [
          'Excessive specular reflection/glare on test ampoule or plastic pouch.',
          'Camera blur detected (Laplacian variance low). Chemical boundaries are smoothed.',
        ],
      },
      extractedSampleColor: { hex: '#D2D8DF', rgb: { r: 210, g: 216, b: 223 }, name: 'Reaction Pigment' },
      colorDistanceDeltaE: 88.5,
      preliminaryResult: 'Inconclusive / Retake',
      presumptiveSubstance: 'Image Quality Unacceptable for Evidentiary Evaluation',
      confidenceScore: 0,
      operatorNotes: 'Flash flare on pouch window caused highlight clipping. Re-capture required under diffused daylight.',
      integrityHash: '8765432109fedcba8765432109fedcba8765432109fedcba8765432109fedcba',
      chainOfCustody: [
        { action: 'Field Screening Capture', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 65).toISOString(), actor: 'officer_sharma', details: 'Quality check flagged severe glare' },
      ],
      isDemoData: true,
    },
  ];
}
