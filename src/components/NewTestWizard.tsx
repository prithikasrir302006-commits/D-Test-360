import React, { useState, useRef, useEffect } from 'react';
import {
  Operator,
  ReagentProfile,
  FieldTestRecord,
  LocationEvidence,
  ImageQualityReport,
  ColorSwatch,
  PreliminaryResultType,
} from '../types';
import { REAGENT_PROFILES } from '../utils/reagents';
import {
  validateKitImageQuality,
  extractReactionColor,
  evaluateColorimetricTest,
} from '../utils/colorimetric';
import { generateRecordHash } from '../utils/crypto';
import { generateForensicPdfReport } from '../utils/pdfReport';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Camera,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Sparkles,
  Info,
  X,
  VideoOff,
  Download,
} from 'lucide-react';

interface NewTestWizardProps {
  operator: Operator;
  onCancel: () => void;
  onCompleteTest: (record: FieldTestRecord) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const NewTestWizard: React.FC<NewTestWizardProps> = ({
  operator,
  onCancel,
  onCompleteTest,
  onShowToast,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1: Case Details
  const [testId] = useState<string>(() => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `FT-${year}-${rand}`;
  });
  const [caseReference, setCaseReference] = useState<string>('NCB/DZU/CR-2026-');
  const [agency, setAgency] = useState<string>(operator.agency);
  const [operatorNotes, setOperatorNotes] = useState<string>('');
  const [location, setLocation] = useState<LocationEvidence | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // STEP 2: Reagent Selection
  const [selectedReagent, setSelectedReagent] = useState<ReagentProfile>(REAGENT_PROFILES[0]);

  // STEP 3: Image Input
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // STEP 4 & 5: Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [qualityReport, setQualityReport] = useState<ImageQualityReport | null>(null);
  const [extractedColor, setExtractedColor] = useState<ColorSwatch | null>(null);
  const [matchedRefColor, setMatchedRefColor] = useState<ColorSwatch | undefined>(undefined);
  const [colorDeltaE, setColorDeltaE] = useState<number>(0);
  const [preliminaryResult, setPreliminaryResult] = useState<PreliminaryResultType>('Inconclusive / Retake');
  const [presumptiveSubstance, setPresumptiveSubstance] = useState<string>('');
  const [confidenceScore, setConfidenceScore] = useState<number>(0);

  // STEP 6: Sealing
  const [generatedHash, setGeneratedHash] = useState<string | null>(null);
  const [isSealing, setIsSealing] = useState<boolean>(false);

  // Cleanup camera stream
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Request browser Geolocation API
  const handleCaptureLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation API not supported by browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date(pos.timestamp).toISOString(),
          isAvailable: true,
        });
        onShowToast('success', 'Location Logged', `GPS: ${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}°`);
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Failed to acquire location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied by user. You can proceed without GPS.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please retry.';
        }
        setLocationError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Start Camera
  const handleStartCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API not accessible in this environment.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      const error = err as Error;
      setCameraError(`Camera initialisation failed: ${error.message || 'Permission denied'}`);
    }
  };

  // Capture Camera Frame to Canvas
  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const w = v.videoWidth || 1280;
    const h = v.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(v, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setImageDataUrl(dataUrl);
    setImageDimensions({ width: w, height: h });

    canvas.toBlob((blob) => {
      if (blob) {
        setImageFile(new File([blob], `capture_${testId}.jpg`, { type: 'image/jpeg' }));
      }
    }, 'image/jpeg');

    stopCameraStream();
    onShowToast('info', 'Frame Captured', 'Pouch image ready for quality check.');
  };

  // Handle uploaded file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setImageFile(file);
        setImageDataUrl(dataUrl);
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Preset Benchmark Specimens for 1-click test simulation
  const handleLoadBenchmark = (type: 'cocaine-positive' | 'opiate-positive' | 'negative' | 'glare-retake') => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 750;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Neutral background
    ctx.fillStyle = '#E4D8CE';
    ctx.fillRect(0, 0, 1000, 750);

    // Test pouch envelope
    ctx.fillStyle = '#F5F0EA';
    ctx.strokeStyle = '#D3C7BD';
    ctx.lineWidth = 4;
    ctx.strokeRect(100, 80, 800, 590);
    ctx.fillRect(100, 80, 800, 590);

    // Reference Card Strip on right
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(680, 120, 180, 500);
    ctx.strokeStyle = '#30302E';
    ctx.lineWidth = 1;
    ctx.strokeRect(680, 120, 180, 500);

    if (type === 'cocaine-positive') {
      setSelectedReagent(REAGENT_PROFILES[0]); // Scott
      // Central reaction chamber - Deep Cobalt Blue
      ctx.fillStyle = '#0D3B66';
      ctx.fillRect(200, 200, 420, 350);

      // Gradient for liquid depth
      const grad = ctx.createLinearGradient(200, 200, 620, 550);
      grad.addColorStop(0, '#104575');
      grad.addColorStop(1, '#082848');
      ctx.fillStyle = grad;
      ctx.fillRect(210, 210, 400, 330);

      // Reference swatch on card
      ctx.fillStyle = '#0D3B66';
      ctx.fillRect(700, 180, 140, 80);
    } else if (type === 'opiate-positive') {
      setSelectedReagent(REAGENT_PROFILES[1]); // Marquis
      // Central reaction chamber - Deep Purple/Violet
      ctx.fillStyle = '#6A1B9A';
      ctx.fillRect(200, 200, 420, 350);

      const grad = ctx.createLinearGradient(200, 200, 620, 550);
      grad.addColorStop(0, '#7520A8');
      grad.addColorStop(1, '#53127A');
      ctx.fillStyle = grad;
      ctx.fillRect(210, 210, 400, 330);

      ctx.fillStyle = '#6A1B9A';
      ctx.fillRect(700, 180, 140, 80);
    } else if (type === 'negative') {
      setSelectedReagent(REAGENT_PROFILES[1]); // Marquis
      // Pale Yellow unreacted fluid
      ctx.fillStyle = '#F9E79F';
      ctx.fillRect(200, 200, 420, 350);
    } else {
      // Glare / Blurry / Overexposed Pouch
      setSelectedReagent(REAGENT_PROFILES[0]);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(150, 150, 520, 450);
      // Harsh white glare burnout
      const glare = ctx.createRadialGradient(400, 350, 20, 400, 350, 250);
      glare.addColorStop(0, '#FFFFFF');
      glare.addColorStop(0.6, '#FFFFFF');
      glare.addColorStop(1, '#EFEFEF');
      ctx.fillStyle = glare;
      ctx.fillRect(150, 150, 520, 450);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setImageDataUrl(dataUrl);
    setImageDimensions({ width: 1000, height: 750 });
    canvas.toBlob((blob) => {
      if (blob) {
        setImageFile(new File([blob], `benchmark_${type}.jpg`, { type: 'image/jpeg' }));
      }
    }, 'image/jpeg');

    onShowToast('info', 'Specimen Loaded', `Benchmark test canvas generated for ${type}.`);
  };

  // Run Real Canvas Image Analysis (Steps 4 & 5)
  const runAnalysis = () => {
    if (!imageDataUrl) return;

    setIsAnalyzing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 1. Technical Image Quality Check
      const quality = validateKitImageQuality(ctx, canvas.width, canvas.height);
      setQualityReport(quality);

      // 2. Extract Sample Reaction Color
      const sample = extractReactionColor(ctx, canvas.width, canvas.height);
      setExtractedColor(sample);

      // 3. Colorimetric Match & Confidence Scoring
      const evaluation = evaluateColorimetricTest(sample, selectedReagent, quality);
      setPreliminaryResult(evaluation.preliminaryResult);
      setPresumptiveSubstance(evaluation.presumptiveSubstance);
      setMatchedRefColor(evaluation.matchedReferenceColor);
      setColorDeltaE(evaluation.colorDistanceDeltaE);
      setConfidenceScore(evaluation.confidenceScore);

      setIsAnalyzing(false);
      setCurrentStep(4); // Advance to results inspection
    };
    img.src = imageDataUrl;
  };

  // Advance to Step 6 (Final Sealing) & Compute SHA-256
  const advanceToSealing = async () => {
    if (!qualityReport || !extractedColor) return;

    setIsSealing(true);
    const hash = await generateRecordHash({
      id: testId,
      caseReference,
      operator: { username: operator.username, badgeNumber: operator.badgeNumber },
      timestamp: new Date().toISOString(),
      reagentProfileId: selectedReagent.id,
      preliminaryResult,
      presumptiveSubstance,
      sampleHex: extractedColor.hex,
      qualityScore: qualityReport.qualityScore,
    });

    setGeneratedHash(hash);
    setIsSealing(false);
    setCurrentStep(5);
  };

  // Finalize & Save Field Test Record
  const handleFinalizeRecord = (downloadPdfImmediately: boolean = false) => {
    if (!qualityReport || !extractedColor || !generatedHash) return;

    const newRecord: FieldTestRecord = {
      id: testId,
      caseReference: caseReference.trim() || undefined,
      agency: agency.trim() || operator.agency,
      operator: {
        username: operator.username,
        badgeNumber: operator.badgeNumber,
      },
      timestamp: new Date().toISOString(),
      reagentProfile: selectedReagent,
      imageDataUrl: imageDataUrl || '',
      imageQuality: qualityReport,
      extractedSampleColor: extractedColor,
      matchedReferenceColor: matchedRefColor,
      colorDistanceDeltaE: colorDeltaE,
      preliminaryResult,
      presumptiveSubstance,
      confidenceScore,
      operatorNotes: operatorNotes.trim() || undefined,
      location: location || undefined,
      integrityHash: generatedHash,
      chainOfCustody: [
        {
          action: 'Field Acquisition & Processing',
          timestamp: new Date().toISOString(),
          actor: operator.username,
          details: `Processed under ${selectedReagent.name} protocol`,
        },
        {
          action: 'Cryptographic SHA-256 Seal',
          timestamp: new Date().toISOString(),
          actor: 'D-Test 360 Traceability Enclave',
          details: `Digest: ${generatedHash.slice(0, 16)}...`,
        },
      ],
      isDemoData: false,
    };

    onCompleteTest(newRecord);

    if (downloadPdfImmediately) {
      generateForensicPdfReport(newRecord);
      onShowToast('success', 'Evidence Sealed & PDF Downloaded', `Record ${testId} registered.`);
    } else {
      onShowToast('success', 'Evidence Record Sealed', `Record ${testId} registered.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header with Step Progress */}
      <div className="bg-[#F5F0EA] border border-[#D3C7BD] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#D3C7BD]">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs text-[#A85F4B] bg-[#E4D8CE] px-2 py-0.5 rounded border border-[#D3C7BD]">
              {testId}
            </span>
            <span className="text-xs text-[#77716C]">·</span>
            <span className="text-xs text-[#77716C] font-semibold uppercase tracking-wider">
              Field Test Wizard
            </span>
          </div>

          <button
            onClick={onCancel}
            className="text-xs font-semibold text-[#77716C] hover:text-[#30302E] transition-colors cursor-pointer"
          >
            Cancel Assay
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            { num: 1, label: 'Case Info' },
            { num: 2, label: 'Reagent Kit' },
            { num: 3, label: 'Image Scan' },
            { num: 4, label: 'Match Analysis' },
            { num: 5, label: 'Crypto Seal' },
          ].map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div
                key={s.num}
                className={`py-2.5 px-1.5 rounded-xl border text-[11px] font-medium transition-all duration-200 flex items-center justify-center gap-1.5 shadow-2xs ${
                  isCurrent
                    ? 'bg-[#A85F4B] text-white border-[#A85F4B] font-semibold shadow-sm scale-[1.02]'
                    : isCompleted
                    ? 'bg-[#EAE4DC] text-[#30302E] border-[#D3C7BD] font-medium'
                    : 'bg-white text-[#999] border-[#E0D7CE]'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                ) : (
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${isCurrent ? 'bg-white/20 text-white' : 'bg-[#EAE4DC] text-[#777]'}`}>
                    {s.num}
                  </span>
                )}
                <span className="hidden sm:inline truncate">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Case Information */}
      {currentStep === 1 && (
        <div className="bg-[#F5F0EA] border border-[#D3C7BD] rounded-xl p-6 shadow-xs space-y-5">
          <div className="border-b border-[#D3C7BD] pb-3">
            <h3 className="font-heading font-bold text-base text-[#30302E]">
              Step 1: Case Identification & Field Metadata
            </h3>
            <p className="text-xs text-[#77716C]">
              Specify unique case identifiers and capture verified device coordinates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#30302E] uppercase mb-1">
                Generated Test ID (Immutable)
              </label>
              <input
                type="text"
                disabled
                value={testId}
                className="w-full px-3 py-2 bg-[#EAE4DC] border border-[#D3C7BD] rounded-lg text-xs font-mono font-bold text-[#30302E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#30302E] uppercase mb-1">
                Agency Case Reference
              </label>
              <input
                type="text"
                value={caseReference}
                onChange={(e) => setCaseReference(e.target.value)}
                placeholder="e.g. CR-99210-B"
                className="w-full px-3 py-2 bg-white border border-[#D3C7BD] rounded-lg text-xs text-[#30302E] focus:outline-none focus:border-[#A85F4B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#30302E] uppercase mb-1">
                Authorized Agency / Division
              </label>
              <input
                type="text"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D3C7BD] rounded-lg text-xs text-[#30302E] focus:outline-none focus:border-[#A85F4B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#30302E] uppercase mb-1">
                Operator Identity & Badge
              </label>
              <input
                type="text"
                disabled
                value={`${operator.username} (${operator.badgeNumber})`}
                className="w-full px-3 py-2 bg-[#EAE4DC] border border-[#D3C7BD] rounded-lg text-xs text-[#555] font-mono"
              />
            </div>
          </div>

          {/* Optional Geolocation Capture */}
          <div className="pt-3 border-t border-[#D3C7BD]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-[#D3C7BD]">
              <div>
                <div className="text-xs font-bold text-[#30302E] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#A85F4B]" />
                  <span>Acquisition Geolocation (Browser Geolocation API)</span>
                </div>
                <p className="text-[11px] text-[#77716C] mt-0.5 leading-snug">
                  {location?.isAvailable
                    ? `Logged: ${location.latitude.toFixed(6)}°, ${location.longitude.toFixed(6)}° (±${location.accuracy.toFixed(1)}m)`
                    : 'Attach verified GPS coordinates to the evidentiary chain-of-custody.'}
                </p>
                {locationError && (
                  <p className="text-[11px] text-[#A85F4B] mt-1">{locationError}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleCaptureLocation}
                disabled={isLocating}
                className="px-3.5 py-1.5 bg-[#F5F0EA] hover:bg-[#EAE4DC] border border-[#D3C7BD] text-xs font-semibold text-[#30302E] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-[#A85F4B]' : ''}`} />
                <span>{location?.isAvailable ? 'Refresh GPS' : 'Capture Location'}</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 bg-[#A85F4B] hover:bg-[#965240] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Next: Select Reagent Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Reagent Selection */}
      {currentStep === 2 && (
        <div className="bg-[#F5F0EA] border border-[#D3C7BD] rounded-xl p-6 shadow-xs space-y-5">
          <div className="border-b border-[#D3C7BD] pb-3">
            <h3 className="font-heading font-bold text-base text-[#30302E]">
              Step 2: Select Colourimetric Test Kit Profile
            </h3>
            <p className="text-xs text-[#77716C]">
              Select the specific chemical test kit used in the field. Target chromatic thresholds adapt automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {REAGENT_PROFILES.map((r) => {
              const isSelected = selectedReagent.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReagent(r)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#A85F4B] shadow-xs ring-1 ring-[#A85F4B]'
                      : 'bg-white/70 hover:bg-white border-[#D3C7BD]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-heading font-bold text-sm text-[#30302E]">
                        {r.name}
                      </div>
                      <div className="text-[11px] text-[#A85F4B] font-semibold mt-0.5">
                        Target: {r.targetCategory}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#A85F4B] shrink-0 mt-0.5" />
                    )}
                  </div>

                  <p className="text-[11px] text-[#77716C] mt-2 leading-relaxed">
                    Chemistry: {r.chemicalName}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-[#EAE4DC]">
                    <span className="text-[10px] text-[#888] uppercase">Positive Swatches:</span>
                    <div className="flex items-center gap-1">
                      {r.referenceColors.map((c, i) => (
                        <span
                          key={i}
                          title={`${c.substanceName}: ${c.expectedHex}`}
                          className="w-3.5 h-3.5 rounded-xs border border-black/15 inline-block"
                          style={{ backgroundColor: c.expectedHex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-[#D3C7BD] bg-white text-xs font-semibold text-[#30302E] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 bg-[#A85F4B] hover:bg-[#965240] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Next: Image Input</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Image Input (Upload & Camera) */}
      {currentStep === 3 && (
        <div className="bg-[#F5F0EA] border border-[#D3C7BD] rounded-xl p-6 shadow-xs space-y-5">
          <div className="border-b border-[#D3C7BD] pb-3">
            <h3 className="font-heading font-bold text-base text-[#30302E]">
              Step 3: Test Pouch & Calibration Card Image Input
            </h3>
            <p className="text-xs text-[#77716C]">
              Capture or upload a clear, focused photograph of the reaction chamber and the reference color card.
            </p>
          </div>

          {/* Active Image Preview or Capture View */}
          {imageDataUrl ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#D3C7BD] bg-[#1A1A18] flex items-center justify-center max-h-[380px] group shadow-inner">
                <img
                  src={imageDataUrl}
                  alt="Field Kit Specimen"
                  className="max-h-[380px] w-auto max-w-full object-contain mx-auto"
                />

                {/* Animated Forensic Laser Scanner Line */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#A85F4B] to-transparent shadow-[0_0_12px_#A85F4B] animate-scanner pointer-events-none z-10" />

                {/* Forensic Targeting Brackets */}
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#A85F4B] pointer-events-none" />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#A85F4B] pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#A85F4B] pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#A85F4B] pointer-events-none" />

                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-[10px] text-white font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Optical Frame Calibrated</span>
                </div>

                <button
                  onClick={() => {
                    setImageDataUrl(null);
                    setImageFile(null);
                  }}
                  className="absolute top-3 right-3 z-20 p-2 bg-black/70 hover:bg-black/90 text-white rounded-xl transition-all hover:scale-110"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#D3C7BD] flex items-center justify-between text-xs">
                <span className="font-medium text-[#30302E]">
                  Dimensions: {imageDimensions.width} × {imageDimensions.height} px
                </span>
                <span className="text-[#77716C] font-mono">
                  {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : 'Direct Capture'}
                </span>
                <button
                  onClick={() => {
                    setImageDataUrl(null);
                    setImageFile(null);
                  }}
                  className="text-[#A85F4B] font-semibold hover:underline"
                >
                  Retake / Replace
                </button>
              </div>
            </div>
          ) : isCameraActive ? (
            /* Live Camera Stream */
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-16/10 flex items-center justify-center">
                {cameraError ? (
                  <div className="p-6 text-center text-white max-w-sm">
                    <VideoOff className="w-8 h-8 mx-auto mb-2 text-[#A85F4B]" />
                    <p className="text-xs mb-3">{cameraError}</p>
                    <button
                      onClick={handleStartCamera}
                      className="px-3 py-1.5 bg-[#A85F4B] text-xs font-semibold rounded"
                    >
                      Retry Camera
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded border border-white/20">
                      Live Video Stream
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={stopCameraStream}
                  className="px-3.5 py-1.5 bg-white border border-[#D3C7BD] text-xs font-medium text-[#30302E] rounded-lg"
                >
                  Cancel Camera
                </button>
                <button
                  onClick={handleCaptureFrame}
                  disabled={!!cameraError}
                  className="px-5 py-2 bg-[#A85F4B] hover:bg-[#965240] text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
              </div>
            </div>
          ) : (
            /* Choice of Upload or Camera */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: File Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-[#FAF6F2] border-2 border-dashed border-[#D3C7BD] hover:border-[#A85F4B] rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2.5"
              >
                <div className="w-12 h-12 rounded-full bg-[#F5F0EA] flex items-center justify-center text-[#A85F4B]">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-semibold text-xs text-[#30302E]">
                  Upload Kit Photograph
                </div>
                <p className="text-[11px] text-[#77716C]">
                  JPG, JPEG, PNG, or WebP up to 25MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Option B: Open Camera */}
              <div
                onClick={handleStartCamera}
                className="bg-white hover:bg-[#FAF6F2] border-2 border-dashed border-[#D3C7BD] hover:border-[#A85F4B] rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2.5"
              >
                <div className="w-12 h-12 rounded-full bg-[#F5F0EA] flex items-center justify-center text-[#A85F4B]">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="font-semibold text-xs text-[#30302E]">
                  Open Device Camera
                </div>
                <p className="text-[11px] text-[#77716C]">
                  Direct optical capture of pouch & color card
                </p>
              </div>
            </div>
          )}

          {/* Quick Benchmark Specimen Buttons (Academic Convenience) */}
          <div className="pt-3 border-t border-[#D3C7BD]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-[#30302E] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#A85F4B]" />
                <span>Academic Benchmark Specimens (1-Click Simulators):</span>
              </span>
              <span className="text-[10px] text-[#77716C] font-mono">Synthetic Reagent Canvases</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleLoadBenchmark('cocaine-positive')}
                className="px-2.5 py-1.5 bg-white hover:bg-[#FAF6F2] border border-[#D3C7BD] rounded text-[#30302E] text-left truncate"
              >
                Cocaine (Cobalt Blue)
              </button>
              <button
                type="button"
                onClick={() => handleLoadBenchmark('opiate-positive')}
                className="px-2.5 py-1.5 bg-white hover:bg-[#FAF6F2] border border-[#D3C7BD] rounded text-[#30302E] text-left truncate"
              >
                Opiates (Violet/Purple)
              </button>
              <button
                type="button"
                onClick={() => handleLoadBenchmark('negative')}
                className="px-2.5 py-1.5 bg-white hover:bg-[#FAF6F2] border border-[#D3C7BD] rounded text-[#30302E] text-left truncate"
              >
                Unreacted Negative
              </button>
              <button
                type="button"
                onClick={() => handleLoadBenchmark('glare-retake')}
                className="px-2.5 py-1.5 bg-white hover:bg-[#FAF6F2] border border-[#D3C7BD] rounded text-[#30302E] text-left truncate"
              >
                Glare / Blurry Pouch
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 border border-[#D3C7BD] bg-white text-xs font-semibold text-[#30302E] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              disabled={!imageDataUrl || isAnalyzing}
              onClick={runAnalysis}
              className="px-5 py-2.5 bg-[#A85F4B] hover:bg-[#965240] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Canvas...</span>
                </>
              ) : (
                <>
                  <span>Run Quality Check & Colour Match</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Technical Quality Check & Colorimetric Match Results */}
      {currentStep === 4 && qualityReport && extractedColor && (
        <div className="bg-[#F5F0EA] border border-[#D3C7BD] rounded-xl p-6 shadow-xs space-y-6">
          <div className="border-b border-[#D3C7BD] pb-3">
            <h3 className="font-heading font-bold text-base text-[#30302E]">
              Step 4: Technical Image Quality & Preliminary Result
            </h3>
            <p className="text-xs text-[#77716C]">
              Measurable photometric parameters, objective chromatic distance (ΔE), and preliminary classification.
            </p>
          </div>

          {/* Section A: Technical Image Quality Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#30302E] uppercase tracking-wider">
                1. Technical Image Quality Diagnostics
              </span>
              <span className="font-mono text-[11px] text-[#77716C]">
                Laplacian ∇² & Luminance Variance
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-[#D3C7BD]">
                <span className="text-[10px] text-[#77716C] uppercase block">Exposure / Lum</span>
                <span className="font-bold text-[#30302E] block mt-0.5">
                  {qualityReport.brightnessStatus}
                </span>
                <span className="text-[10px] font-mono text-[#999]">
                  {qualityReport.brightness}/255
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#D3C7BD]">
                <span className="text-[10px] text-[#77716C] uppercase block">Sharpness / Blur</span>
                <span className="font-bold text-[#30302E] block mt-0.5">
                  {qualityReport.sharpnessStatus}
                </span>
                <span className="text-[10px] font-mono text-[#999]">
                  Var {qualityReport.sharpnessVariance}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#D3C7BD]">
                <span className="text-[10px] text-[#77716C] uppercase block">Specular Glare</span>
                <span className="font-bold text-[#30302E] block mt-0.5">
                  {qualityReport.glareDetected ? 'Burnout Detected' : 'None Detected'}
                </span>
                <span className="text-[10px] font-mono text-[#999]">
                  {qualityReport.glareDetected ? 'Severe' : 'Nominal'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#D3C7BD]">
                <span className="text-[10px] text-[#77716C] uppercase block">Quality Index</span>
                <span className="font-bold font-mono text-base block mt-0.5 text-[#30302E]">
                  {qualityReport.qualityScore}/100
                </span>
                <span className="text-[10px] text-[#77716C]">
                  {qualityReport.isAcceptable ? 'Acceptable' : 'Deficient'}
                </span>
              </div>
            </div>

            {qualityReport.issues.length > 0 && (
              <div className="p-3 bg-[#FAF0ED] rounded-lg border border-[#A85F4B]/30 text-xs text-[#8B3A28] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#A85F4B]" />
                  <span>Quality Deficiencies Identified:</span>
                </div>
                <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-1">
                  {qualityReport.issues.map((iss, i) => (
                    <li key={i}>{iss}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section B: Colourimetric Match & Preliminary Result */}
          <div className="space-y-3 pt-3 border-t border-[#D3C7BD]">
            <div className="font-bold text-xs text-[#30302E] uppercase tracking-wider">
              2. Colourimetric Analysis & Reference Comparison
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#D3C7BD] space-y-4">
              {/* Preliminary Result Banner */}
              <div className={`p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                preliminaryResult === 'Presumptive Positive'
                  ? 'bg-[#FAF0ED] border-[#A85F4B] text-[#A85F4B]'
                  : preliminaryResult === 'Presumptive Negative'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                  : 'bg-amber-50 border-amber-400 text-amber-900'
              }`}>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider">
                    Computed Preliminary Classification
                  </div>
                  <div className="text-lg font-heading font-extrabold mt-0.5">
                    {preliminaryResult}
                  </div>
                  <div className="text-xs text-[#555] mt-0.5">
                    {presumptiveSubstance}
                  </div>
                </div>

                <div className="px-3 py-1.5 bg-white/80 rounded border border-black/10 text-right">
                  <div className="text-[10px] text-[#777] uppercase font-semibold">Confidence Rating</div>
                  <div className="text-base font-bold font-mono text-[#30302E]">{confidenceScore}%</div>
                </div>
              </div>

              {/* Swatch Side-by-Side Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div className="flex items-center gap-3 p-3 bg-[#F5F0EA] rounded-lg border border-[#D3C7BD]">
                  <div
                    className="w-12 h-12 rounded-lg border border-black/20 shrink-0"
                    style={{ backgroundColor: extractedColor.hex }}
                  />
                  <div>
                    <span className="text-[10px] text-[#777] uppercase block font-semibold">
                      Sample Reaction Pigment
                    </span>
                    <span className="font-bold text-[#30302E] block">{extractedColor.hex}</span>
                    <span className="text-[10px] font-mono text-[#777]">
                      RGB({extractedColor.rgb.r}, {extractedColor.rgb.g}, {extractedColor.rgb.b})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#F5F0EA] rounded-lg border border-[#D3C7BD]">
                  <div
                    className="w-12 h-12 rounded-lg border border-black/20 shrink-0"
                    style={{ backgroundColor: matchedRefColor?.hex || '#CCCCCC' }}
                  />
                  <div>
                    <span className="text-[10px] text-[#777] uppercase block font-semibold">
                      Reference Card Standard
                    </span>
                    <span className="font-bold text-[#30302E] block">
                      {matchedRefColor?.hex || 'N/A'}
                    </span>
                    <span className="text-[10px] font-mono text-[#777]">
                      ΔE Deviation: {colorDeltaE}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-3">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 border border-[#D3C7BD] bg-white text-xs font-semibold text-[#30302E] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back / Retake</span>
            </button>
            <button
              disabled={isSealing}
              onClick={advanceToSealing}
              className="px-5 py-2.5 bg-[#A85F4B] hover:bg-[#965240] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>Next: Cryptographic Sealing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Cryptographic Sealing & Finalization */}
      {currentStep === 5 && generatedHash && (
        <div className="bg-[#F5F0EA] border border-[#D3C7BD] rounded-xl p-6 shadow-xs space-y-6">
          <div className="border-b border-[#D3C7BD] pb-3">
            <h3 className="font-heading font-bold text-base text-[#30302E]">
              Step 5: Cryptographic Sealing & Evidence Finalization
            </h3>
            <p className="text-xs text-[#77716C]">
              Seal the record with an immutable SHA-256 digital digest for tamper detection and courtroom defensibility.
            </p>
          </div>

          {/* Cryptographic SHA-256 Digest Box */}
          <div className="bg-white p-4 rounded-xl border border-[#D3C7BD] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#A85F4B] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>SHA-256 Evidence Integrity Seal</span>
              </span>
              <span className="text-[10px] font-mono text-[#777] bg-[#F5F0EA] px-2 py-0.5 rounded border border-[#D3C7BD]">
                Deterministic Enclave Hash
              </span>
            </div>
            <div className="p-3 bg-[#F5F0EA] rounded-lg font-mono text-[11px] text-[#30302E] break-all border border-[#D3C7BD] select-all">
              {generatedHash}
            </div>
            <p className="text-[11px] text-[#77716C] leading-relaxed">
              Any post-hoc modification to the Test ID, Case Reference, extracted pigment, or result will invalidate this cryptographic signature.
            </p>
          </div>

          {/* Operator Field Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#30302E] uppercase mb-1.5">
              Operator Field Observations & Chain-of-Custody Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              placeholder="e.g. Suspect white crystalline residue observed in compartment. Initial blue flakes appeared immediately..."
              className="w-full p-3 bg-white border border-[#D3C7BD] rounded-lg text-xs text-[#30302E] focus:outline-none focus:border-[#A85F4B]"
            />
          </div>

          {/* Final Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#D3C7BD]">
            <button
              onClick={() => setCurrentStep(4)}
              className="w-full sm:w-auto px-4 py-2 border border-[#D3C7BD] bg-white text-xs font-semibold text-[#30302E] rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quality Results</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleFinalizeRecord(false)}
                className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-[#EAE4DC] border border-[#D3C7BD] text-xs font-bold text-[#30302E] rounded-lg transition-colors cursor-pointer"
              >
                Save Record
              </button>

              <button
                onClick={() => handleFinalizeRecord(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#A85F4B] hover:bg-[#965240] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save & Download PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
