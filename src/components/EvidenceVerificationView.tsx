import React, { useState } from 'react';
import { FieldTestRecord } from '../types';
import { verifyRecordIntegrity } from '../utils/crypto';
import { ShieldCheck, AlertOctagon, CheckCircle2, Search, ArrowRight, Lock, Key } from 'lucide-react';

interface EvidenceVerificationViewProps {
  tests: FieldTestRecord[];
  preselectedRecord?: FieldTestRecord | null;
}

export const EvidenceVerificationView: React.FC<EvidenceVerificationViewProps> = ({
  tests,
  preselectedRecord,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    preselectedRecord ? preselectedRecord.id : tests[0]?.id || ''
  );
  const [verificationResult, setVerificationResult] = useState<{
    status: 'idle' | 'verified' | 'mismatch';
    calculatedHash?: string;
    storedHash?: string;
  }>({ status: 'idle' });

  const activeRecord = tests.find((t) => t.id === selectedId) || null;

  const handleRunVerification = async () => {
    if (!activeRecord) return;

    const res = await verifyRecordIntegrity(
      {
        id: activeRecord.id,
        caseReference: activeRecord.caseReference,
        operator: activeRecord.operator,
        timestamp: activeRecord.timestamp,
        reagentProfileId: activeRecord.reagentProfile.id,
        preliminaryResult: activeRecord.preliminaryResult,
        presumptiveSubstance: activeRecord.presumptiveSubstance,
        sampleHex: activeRecord.extractedSampleColor.hex,
        qualityScore: activeRecord.imageQuality.qualityScore,
      },
      activeRecord.integrityHash
    );

    setVerificationResult({
      status: res.isValid ? 'verified' : 'mismatch',
      calculatedHash: res.calculatedHash,
      storedHash: res.storedHash,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#F5F0EA] border border-[#D3C7BD] rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A85F4B] mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Cryptographic Custody Auditing</span>
        </div>
        <h2 className="text-xl font-heading font-extrabold text-[#30302E]">
          Record Verification Enclave
        </h2>
        <p className="text-xs text-[#77716C] mt-1 max-w-xl leading-relaxed">
          Verify NCB digital chain-of-custody by recalculating the SHA-256 cryptographic digest of canonical field test payloads against the recorded D-Test 360 seal.
        </p>
      </div>

      {/* Record Selector */}
      <div className="bg-[#F5F0EA] p-5 rounded-xl border border-[#D3C7BD] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-[#30302E] uppercase tracking-wider">
            Select Evidence Record to Audit:
          </label>
          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setVerificationResult({ status: 'idle' });
            }}
            className="w-full sm:w-auto px-3.5 py-2 bg-white border border-[#D3C7BD] rounded-lg text-xs font-mono font-medium text-[#30302E] focus:outline-none focus:border-[#A85F4B]"
          >
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} — {t.caseReference || 'UNASSIGNED'} ({t.reagentProfile.name.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>

        {activeRecord && (
          <div className="bg-white p-4 rounded-lg border border-[#D3C7BD] space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-[#77716C] uppercase block">Test ID</span>
                <span className="font-mono font-bold text-[#30302E]">{activeRecord.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#77716C] uppercase block">Case Reference</span>
                <span className="font-mono text-[#30302E]">{activeRecord.caseReference || 'UNASSIGNED'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#77716C] uppercase block">Operator</span>
                <span className="text-[#30302E]">{activeRecord.operator.username}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#77716C] uppercase block">Reagent Protocol</span>
                <span className="text-[#30302E] truncate block">{activeRecord.reagentProfile.name.split(' ')[0]}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#EAE4DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-[10px] text-[#77716C] uppercase block">Stored Sealed Hash</span>
                <span className="font-mono text-[11px] text-[#30302E] break-all">
                  {activeRecord.integrityHash}
                </span>
              </div>

              <button
                onClick={handleRunVerification}
                className="px-4 py-2 bg-[#A85F4B] hover:bg-[#965240] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify SHA-256 Digest</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Verification Outcome Box */}
      {verificationResult.status !== 'idle' && (
        <div
          className={`p-6 rounded-xl border space-y-4 ${
            verificationResult.status === 'verified'
              ? 'bg-[#EBF7EE] border-emerald-400 text-emerald-950'
              : 'bg-[#FAF0ED] border-[#A85F4B] text-[#8B3A28]'
          }`}
        >
          <div className="flex items-start gap-3">
            {verificationResult.status === 'verified' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertOctagon className="w-6 h-6 text-[#A85F4B] shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-heading font-extrabold text-base">
                {verificationResult.status === 'verified'
                  ? 'EVIDENCE INTEGRITY CONFIRMED — RECORD UNTAMPERED'
                  : 'INTEGRITY MISMATCH DETECTED — POSSIBLE TAMPERING'}
              </div>
              <p className="text-xs mt-1 leading-relaxed text-[#555]">
                {verificationResult.status === 'verified'
                  ? 'The recalculation of the canonical evidence payload mathematically matches the stored cryptographic digest bit-for-bit. No subsequent field modifications have occurred.'
                  : 'The calculated hash does not match the stored evidence digest. The record data has been altered after sealing.'}
              </p>
            </div>
          </div>

          <div className="bg-white/80 p-3.5 rounded-lg border border-black/10 text-xs font-mono space-y-2">
            <div>
              <span className="text-[10px] text-[#777] uppercase block font-sans">
                Stored Digest (At Acquisition):
              </span>
              <span className="text-[#30302E] break-all">{verificationResult.storedHash}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#777] uppercase block font-sans">
                Calculated Digest (Real-Time In Enclave):
              </span>
              <span className="text-[#30302E] break-all">{verificationResult.calculatedHash}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
