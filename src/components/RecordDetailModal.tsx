import React from 'react';
import { FieldTestRecord } from '../types';
import { generateForensicPdfReport } from '../utils/pdfReport';
import {
  X,
  Download,
  ShieldCheck,
  MapPin,
  Calendar,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface RecordDetailModalProps {
  record: FieldTestRecord | null;
  onClose: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  onClose,
  onShowToast,
}) => {
  if (!record) return null;

  const handleDownload = () => {
    generateForensicPdfReport(record);
    onShowToast('success', 'D-TEST 360 Report Downloaded', `Saved D-Test_360_Field_Report_${record.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 selection:bg-[#A85F4B] selection:text-white animate-fade-in">
      <div className="bg-[#F5F0EA] border border-[#D3C7BD] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#EAE4DC] border-b border-[#D3C7BD] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs text-[#A85F4B] bg-white px-2 py-0.5 rounded border border-[#D3C7BD]">
              {record.id}
            </span>
            <span className="text-xs text-[#77716C]">·</span>
            <span className="font-heading font-bold text-sm text-[#30302E]">
              Evidence Dossier
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#77716C] hover:text-[#30302E] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Classification Banner */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              record.preliminaryResult === 'Presumptive Positive'
                ? 'bg-[#FAF0ED] border-[#A85F4B] text-[#A85F4B]'
                : record.preliminaryResult === 'Presumptive Negative'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider">
                Preliminary Classification (SWGDRUG Cat. C)
              </div>
              <div className="text-lg font-heading font-extrabold mt-0.5">
                {record.preliminaryResult}
              </div>
              <div className="text-xs text-[#555] mt-0.5">
                {record.presumptiveSubstance}
              </div>
            </div>

            <div className="px-3 py-1.5 bg-white/80 rounded border border-black/10 text-right">
              <div className="text-[10px] text-[#777] uppercase font-semibold">Confidence</div>
              <div className="text-base font-bold font-mono text-[#30302E]">
                {record.confidenceScore}%
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-[#D3C7BD] text-xs">
            <div>
              <span className="text-[10px] text-[#77716C] uppercase block font-semibold">Case Ref</span>
              <span className="font-mono text-[#30302E] font-medium">{record.caseReference || 'UNASSIGNED'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#77716C] uppercase block font-semibold">Date & Time</span>
              <span className="text-[#30302E]">{new Date(record.timestamp).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#77716C] uppercase block font-semibold">Operator</span>
              <span className="text-[#30302E]">{record.operator.username}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#77716C] uppercase block font-semibold">Agency</span>
              <span className="text-[#30302E] truncate block">{record.agency}</span>
            </div>
          </div>

          {/* Image & Swatches Comparison */}
          <div className="bg-white p-5 rounded-xl border border-[#D3C7BD] space-y-4">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#30302E]">
              Photometric & Chromatic Analysis
            </h4>

            {record.imageDataUrl && (
              <div className="rounded-lg overflow-hidden border border-[#D3C7BD] bg-black max-h-[260px] flex items-center justify-center">
                <img
                  src={record.imageDataUrl}
                  alt="Captured Kit Specimen"
                  className="max-h-[260px] w-auto max-w-full object-contain"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F5F0EA] rounded-lg border border-[#D3C7BD] flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded border border-black/20 shrink-0"
                  style={{ backgroundColor: record.extractedSampleColor.hex }}
                />
                <div>
                  <span className="text-[10px] text-[#777] uppercase block font-semibold">
                    Reaction Swatch
                  </span>
                  <span className="font-bold text-[#30302E]">{record.extractedSampleColor.hex}</span>
                  <span className="text-[10px] font-mono text-[#777]">
                    RGB({record.extractedSampleColor.rgb.r}, {record.extractedSampleColor.rgb.g}, {record.extractedSampleColor.rgb.b})
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#F5F0EA] rounded-lg border border-[#D3C7BD] flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded border border-black/20 shrink-0"
                  style={{ backgroundColor: record.matchedReferenceColor?.hex || '#CCCCCC' }}
                />
                <div>
                  <span className="text-[10px] text-[#777] uppercase block font-semibold">
                    Reference Standard
                  </span>
                  <span className="font-bold text-[#30302E]">{record.matchedReferenceColor?.hex || 'N/A'}</span>
                  <span className="text-[10px] font-mono text-[#777]">
                    ΔE Distance: {record.colorDistanceDeltaE}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quality Diagnostics & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Quality Summary */}
            <div className="bg-white p-4 rounded-xl border border-[#D3C7BD] space-y-2">
              <span className="font-bold text-[#30302E] block uppercase tracking-wider text-[11px]">
                Image Quality Diagnostics
              </span>
              <div className="space-y-1 text-[#555]">
                <div className="flex justify-between">
                  <span>Exposure:</span>
                  <span className="font-semibold text-[#30302E]">{record.imageQuality.brightnessStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sharpness:</span>
                  <span className="font-semibold text-[#30302E]">{record.imageQuality.sharpnessStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span>Glare:</span>
                  <span className="font-semibold text-[#30302E]">
                    {record.imageQuality.glareDetected ? 'Burnout' : 'Nominal'}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#EAE4DC]">
                  <span>Technical Score:</span>
                  <span className="font-mono font-bold text-[#30302E]">{record.imageQuality.qualityScore}/100</span>
                </div>
              </div>
            </div>

            {/* Geolocation */}
            <div className="bg-white p-4 rounded-xl border border-[#D3C7BD] space-y-2">
              <span className="font-bold text-[#30302E] block uppercase tracking-wider text-[11px]">
                Capture Geolocation
              </span>
              {record.location && record.location.isAvailable ? (
                <div className="space-y-1.5 text-[#555]">
                  <div>
                    <span className="text-[10px] text-[#777] block">Coordinates:</span>
                    <span className="font-mono font-bold text-[#30302E]">
                      {record.location.latitude.toFixed(6)}°, {record.location.longitude.toFixed(6)}°
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#777] block">Accuracy:</span>
                    <span className="text-[#30302E]">±{record.location.accuracy.toFixed(1)} metres</span>
                  </div>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${record.location.latitude}&mlon=${record.location.longitude}#map=16/${record.location.latitude}/${record.location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A85F4B] hover:underline pt-1"
                  >
                    <span>View on OpenStreetMap</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <div className="text-[#888] pt-2">No GPS metadata logged for this field capture.</div>
              )}
            </div>
          </div>

          {/* Cryptographic SHA-256 Digest */}
          <div className="bg-white p-4 rounded-xl border border-[#D3C7BD] space-y-1.5 text-xs">
            <span className="font-bold text-[#A85F4B] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>SHA-256 Evidentiary Seal</span>
            </span>
            <div className="p-2.5 bg-[#F5F0EA] rounded font-mono text-[10px] text-[#30302E] break-all border border-[#D3C7BD]">
              {record.integrityHash}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-[#EAE4DC] border-t border-[#D3C7BD] px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#D3C7BD] text-xs font-semibold text-[#30302E] rounded-lg"
          >
            Close Dossier
          </button>

          <button
            onClick={handleDownload}
            className="px-5 py-2.5 bg-[#A85F4B] hover:bg-[#965240] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download D-Test 360 PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
