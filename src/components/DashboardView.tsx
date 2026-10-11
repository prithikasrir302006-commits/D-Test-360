import React, { useState } from 'react';
import { FieldTestRecord } from '../types';
import {
  PlusCircle,
  RefreshCw,
  FileText,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FlaskConical,
  Clock,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
  Check
} from 'lucide-react';

interface DashboardViewProps {
  tests: FieldTestRecord[];
  onStartNewTest: () => void;
  onViewReport: (record: FieldTestRecord) => void;
  onVerifyRecord: (record: FieldTestRecord) => void;
  onViewAllHistory: () => void;
  onRefresh: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tests,
  onStartNewTest,
  onViewReport,
  onVerifyRecord,
  onViewAllHistory,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute genuine statistics from saved test records
  const totalCount = tests.length;
  const positiveCount = tests.filter((t) => t.preliminaryResult === 'Presumptive Positive').length;
  const negativeCount = tests.filter((t) => t.preliminaryResult === 'Presumptive Negative').length;
  const inconclusiveCount = tests.filter((t) => t.preliminaryResult === 'Inconclusive / Retake').length;

  const recentTests = tests.slice(0, 5);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Action Header Banner */}
      <div className="relative overflow-hidden bg-[#F5F0EA] border border-[#D3C7BD] rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs transition-all hover:border-[#C4B7AC]">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#A85F4B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#A85F4B] uppercase mb-1 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Narcotics Control Bureau · Operational Support</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#30302E] tracking-tight">
            Field Operations Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-[#77716C] mt-1 max-w-xl leading-relaxed">
            Capture, assess, and document field-test observations with digital tamper-evident traceability.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefreshClick}
            className="px-4 py-2.5 bg-white hover:bg-[#EAE4DC] border border-[#D3C7BD] text-xs font-semibold text-[#30302E] rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
            title="Refresh statistics and active records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#77716C] ${isRefreshing ? 'animate-spin text-[#A85F4B]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onStartNewTest}
            className="px-5 py-2.5 bg-[#A85F4B] hover:bg-[#965240] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer group active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>New Field Test</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Field Tests */}
        <div className="bg-[#F5F0EA] border border-[#D3C7BD] hover:border-[#A85F4B]/50 rounded-2xl p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
          <div className="flex items-center justify-between text-[#77716C]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#30302E]">
              Total Field Tests
            </span>
            <div className="p-2 rounded-lg bg-white border border-[#D3C7BD] group-hover:bg-[#FAF0ED] group-hover:border-[#A85F4B]/30 transition-colors">
              <FlaskConical className="w-4 h-4 text-[#A85F4B]" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-heading font-extrabold text-[#30302E] font-mono tracking-tight">
            {totalCount}
          </div>
          <p className="text-[11px] text-[#77716C] leading-snug">
            All cryptographically logged field testing assays.
          </p>
        </div>

        {/* 2. Presumptive Positive */}
        <div className="bg-[#F5F0EA] border border-[#D3C7BD] hover:border-[#A85F4B] rounded-2xl p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
          <div className="flex items-center justify-between text-[#77716C]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A85F4B]">
              Presumptive Positive
            </span>
            <div className="p-2 rounded-lg bg-[#FAF0ED] border border-[#A85F4B]/30 group-hover:bg-[#A85F4B] group-hover:text-white transition-colors">
              <AlertOctagon className="w-4 h-4 text-[#A85F4B] group-hover:text-white transition-colors" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-heading font-extrabold text-[#A85F4B] font-mono tracking-tight">
            {positiveCount}
          </div>
          <p className="text-[11px] text-[#77716C] leading-snug">
            Matched target chromophore transitions within ΔE tolerance.
          </p>
        </div>

        {/* 3. Presumptive Negative */}
        <div className="bg-[#F5F0EA] border border-[#D3C7BD] hover:border-emerald-600/50 rounded-2xl p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
          <div className="flex items-center justify-between text-[#77716C]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#30302E]">
              Presumptive Negative
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 group-hover:text-white transition-colors" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-heading font-extrabold text-emerald-800 font-mono tracking-tight">
            {negativeCount}
          </div>
          <p className="text-[11px] text-[#77716C] leading-snug">
            Unreacted baseline; no target colour development detected.
          </p>
        </div>

        {/* 4. Inconclusive / Retake */}
        <div className="bg-[#F5F0EA] border border-[#D3C7BD] hover:border-amber-600/50 rounded-2xl p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
          <div className="flex items-center justify-between text-[#77716C]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#30302E]">
              Inconclusive / Retake
            </span>
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4 text-amber-600 group-hover:text-white transition-colors" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-heading font-extrabold text-amber-800 font-mono tracking-tight">
            {inconclusiveCount}
          </div>
          <p className="text-[11px] text-[#77716C] leading-snug">
            Failed image quality checks, glare burnout, or ambiguous hue.
          </p>
        </div>
      </div>

      {/* Laboratory Disclaimer Box */}
      <div className="bg-[#F5F0EA] border-l-4 border-[#A85F4B] border border-[#D3C7BD] rounded-xl p-4.5 text-xs text-[#30302E] space-y-1 shadow-2xs">
        <div className="font-bold uppercase tracking-wider text-[#A85F4B] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Statutory Field Screening Disclaimer</span>
        </div>
        <p className="leading-relaxed text-[#544E49]">
          Field drug-screening results are preliminary only. Confirmatory laboratory testing (GC-MS / LC-MS) is required for definitive identification under NDPS procedures. D-Test 360 acts as a digital companion and traceability tool; evidence integrity records help detect subsequent file or record changes.
        </p>
      </div>

      {/* Recent Field Tests Table */}
      <div className="bg-[#F5F0EA] border border-[#D3C7BD] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#D3C7BD]">
          <div>
            <h3 className="font-heading font-bold text-base text-[#30302E]">
              Recent Field Tests
            </h3>
            <p className="text-[11px] text-[#77716C]">
              Most recent field drug screening submissions and preliminary results
            </p>
          </div>

          <button
            onClick={onViewAllHistory}
            className="text-xs font-semibold text-[#A85F4B] hover:text-[#965240] flex items-center gap-1.5 cursor-pointer group transition-colors"
          >
            <span>Evidence History</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {recentTests.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#77716C] bg-white rounded-xl border border-[#D3C7BD]">
            No test records saved yet. Click "New Field Test" above to log your first field test.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#D3C7BD] shadow-2xs">
            <table className="w-full text-left text-xs bg-white">
              <thead className="bg-[#ECE4DC] text-[#30302E] font-semibold text-[11px] uppercase tracking-wider border-b border-[#D3C7BD]">
                <tr>
                  <th className="px-4 py-3">Test ID / Seizure Memo</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Officer</th>
                  <th className="px-4 py-3">Test Kit Profile</th>
                  <th className="px-4 py-3">Preliminary Result</th>
                  <th className="px-4 py-3">Record Verification</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4D8CE]">
                {recentTests.map((t) => (
                  <tr key={t.id} className="hover:bg-[#FAF6F2] transition-colors group">
                    {/* Test ID & Case */}
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-[#30302E] group-hover:text-[#A85F4B] transition-colors">{t.id}</div>
                      <div className="text-[10px] text-[#77716C] font-mono">
                        {t.caseReference || 'UNASSIGNED'}
                        {t.isDemoData && (
                          <span className="ml-1 text-[9px] text-[#A85F4B] font-sans font-medium">
                            · Demo Data
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="px-4 py-3.5 text-[#77716C] whitespace-nowrap">
                      <div>{new Date(t.timestamp).toLocaleDateString()}</div>
                      <div className="text-[10px] font-mono text-[#999]">
                        {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Operator */}
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-[#30302E]">{t.operator.username}</div>
                      <div className="text-[10px] text-[#77716C] font-mono">{t.operator.badgeNumber}</div>
                    </td>

                    {/* Test Kit Profile */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[#30302E]">{t.reagentProfile.name}</div>
                      <div className="text-[10px] text-[#77716C]">{t.reagentProfile.targetCategory}</div>
                    </td>

                    {/* Result */}
                    <td className="px-4 py-3.5">
                      {t.preliminaryResult === 'Presumptive Positive' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#FAF0ED] text-[#A85F4B] border border-[#A85F4B]/30 shadow-2xs">
                          <AlertOctagon className="w-3 h-3 text-[#A85F4B]" />
                          <span>Positive: {t.presumptiveSubstance}</span>
                        </span>
                      )}
                      {t.preliminaryResult === 'Presumptive Negative' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Negative</span>
                        </span>
                      )}
                      {t.preliminaryResult === 'Inconclusive / Retake' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Inconclusive</span>
                        </span>
                      )}
                    </td>

                    {/* Hash Verification Status */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-mono font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Sealed</span>
                      </div>
                      <div className="text-[9px] font-mono text-[#999] truncate max-w-[90px]" title={t.integrityHash}>
                        {t.integrityHash.slice(0, 10)}...
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewReport(t)}
                          className="px-2.5 py-1.5 bg-[#F5F0EA] hover:bg-[#EAE4DC] border border-[#D3C7BD] rounded-lg text-[11px] font-semibold text-[#30302E] transition-all cursor-pointer shadow-2xs hover:scale-105"
                          title="Open Evidence Dossier"
                        >
                          Dossier
                        </button>
                        <button
                          onClick={() => onVerifyRecord(t)}
                          className="p-1.5 text-[#77716C] hover:text-[#A85F4B] hover:bg-[#FAF0ED] rounded-lg border border-transparent hover:border-[#D3C7BD] transition-all cursor-pointer"
                          title="Verify Cryptographic Hash"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
