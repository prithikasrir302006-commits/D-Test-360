import React, { useState, useMemo } from 'react';
import { FieldTestRecord, FilterOptions } from '../types';
import { REAGENT_PROFILES } from '../utils/reagents';
import { generateForensicPdfReport } from '../utils/pdfReport';
import {
  Search,
  Filter,
  FileText,
  ShieldCheck,
  Download,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Eye,
} from 'lucide-react';

interface EvidenceHistoryViewProps {
  tests: FieldTestRecord[];
  onViewRecord: (record: FieldTestRecord) => void;
  onVerifyRecord: (record: FieldTestRecord) => void;
  onDeleteRecord: (id: string) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const EvidenceHistoryView: React.FC<EvidenceHistoryViewProps> = ({
  tests,
  onViewRecord,
  onVerifyRecord,
  onDeleteRecord,
  onShowToast,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    reagentId: 'all',
    resultStatus: 'all',
    dateRange: 'all',
  });

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      // Reagent kit filter
      if (filters.reagentId !== 'all' && t.reagentProfile.id !== filters.reagentId) {
        return false;
      }

      // Result filter
      if (filters.resultStatus !== 'all' && t.preliminaryResult !== filters.resultStatus) {
        return false;
      }

      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchId = t.id.toLowerCase().includes(q);
        const matchCase = (t.caseReference || '').toLowerCase().includes(q);
        const matchOp = t.operator.username.toLowerCase().includes(q);
        const matchSubstance = t.presumptiveSubstance.toLowerCase().includes(q);
        if (!matchId && !matchCase && !matchOp && !matchSubstance) return false;
      }

      return true;
    });
  }, [tests, filters]);

  const handleDownloadPdf = (record: FieldTestRecord) => {
    generateForensicPdfReport(record);
    onShowToast('success', 'D-TEST 360 Report Generated', `Downloaded D-Test_360_Field_Report_${record.id}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-[#F5F0EA] border border-[#D3C7BD] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#30302E] tracking-tight">
            Evidence History Archive
          </h2>
          <p className="text-xs text-[#77716C] mt-1 leading-relaxed">
            Audit-grade repository of colourimetric test records with tamper-evident cryptographic hashes ({tests.length} total records).
          </p>
        </div>

        {(filters.searchQuery || filters.reagentId !== 'all' || filters.resultStatus !== 'all') && (
          <button
            onClick={() =>
              setFilters({ searchQuery: '', reagentId: 'all', resultStatus: 'all', dateRange: 'all' })
            }
            className="text-xs font-semibold text-[#A85F4B] hover:text-[#8B3A28] px-3 py-1.5 rounded-lg bg-[#FAF0ED] border border-[#A85F4B]/30 transition-all hover:scale-105 cursor-pointer shadow-2xs"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-[#F5F0EA] p-4.5 rounded-2xl border border-[#D3C7BD] space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#30302E]">
          <Filter className="w-3.5 h-3.5 text-[#A85F4B]" />
          <span>Filter Records:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative group">
            <Search className="w-4 h-4 text-[#777] absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#A85F4B] transition-colors" />
            <input
              type="text"
              placeholder="Search Test ID, Case Ref, or Operator..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-3.5 py-2 bg-white border border-[#D3C7BD] rounded-xl text-xs text-[#30302E] placeholder-[#888] focus:outline-none focus:border-[#A85F4B] focus:ring-2 focus:ring-[#A85F4B]/20 transition-all shadow-2xs"
            />
          </div>

          {/* Reagent kit filter */}
          <select
            value={filters.reagentId}
            onChange={(e) => setFilters({ ...filters, reagentId: e.target.value })}
            className="w-full px-3.5 py-2 bg-white border border-[#D3C7BD] rounded-xl text-xs text-[#30302E] focus:outline-none focus:border-[#A85F4B] focus:ring-2 focus:ring-[#A85F4B]/20 transition-all shadow-2xs cursor-pointer"
          >
            <option value="all">All Reagent Kit Profiles</option>
            {REAGENT_PROFILES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Result Status filter */}
          <select
            value={filters.resultStatus}
            onChange={(e) => setFilters({ ...filters, resultStatus: e.target.value })}
            className="w-full px-3.5 py-2 bg-white border border-[#D3C7BD] rounded-xl text-xs text-[#30302E] focus:outline-none focus:border-[#A85F4B] focus:ring-2 focus:ring-[#A85F4B]/20 transition-all shadow-2xs cursor-pointer"
          >
            <option value="all">All Result Classifications</option>
            <option value="Presumptive Positive">Presumptive Positive</option>
            <option value="Presumptive Negative">Presumptive Negative</option>
            <option value="Inconclusive / Retake">Inconclusive / Retake</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      {filteredTests.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#77716C] bg-white rounded-xl border border-[#D3C7BD]">
          No evidence records match the current filter parameters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#D3C7BD] bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#ECE4DC] text-[#30302E] font-semibold text-[11px] uppercase tracking-wider border-b border-[#D3C7BD]">
              <tr>
                <th className="px-4 py-3">Test ID / Case Ref</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Kit Profile</th>
                <th className="px-4 py-3">Sample Swatch</th>
                <th className="px-4 py-3">Preliminary Result</th>
                <th className="px-4 py-3">SHA-256 Hash</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4D8CE]">
              {filteredTests.map((t) => (
                <tr key={t.id} className="hover:bg-[#FAF6F2] transition-colors">
                  {/* Test ID & Case */}
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-[#30302E]">{t.id}</div>
                    <div className="text-[10px] text-[#77716C] font-mono">
                      {t.caseReference || 'UNASSIGNED'}
                      {t.isDemoData && (
                        <span className="ml-1 text-[9px] text-[#A85F4B] font-sans font-medium">
                          · Demo
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td className="px-4 py-3 text-[#77716C] whitespace-nowrap">
                    <div>{new Date(t.timestamp).toLocaleDateString()}</div>
                    <div className="text-[10px] font-mono text-[#999]">
                      {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  {/* Kit Profile */}
                  <td className="px-4 py-3 max-w-[160px]">
                    <div className="font-medium text-[#30302E] truncate" title={t.reagentProfile.name}>
                      {t.reagentProfile.name}
                    </div>
                    <div className="text-[10px] text-[#77716C]">
                      Op: {t.operator.username}
                    </div>
                  </td>

                  {/* Swatch & Delta-E */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-xs border border-black/20 shrink-0"
                        style={{ backgroundColor: t.extractedSampleColor.hex }}
                        title={`Sample: ${t.extractedSampleColor.hex}`}
                      />
                      <span className="font-mono text-[11px] text-[#30302E]">
                        {t.extractedSampleColor.hex}
                      </span>
                      <span className="text-[10px] text-[#888]">
                        (ΔE {t.colorDistanceDeltaE})
                      </span>
                    </div>
                  </td>

                  {/* Result Badge */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {t.preliminaryResult === 'Presumptive Positive' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-[#FAF0ED] text-[#A85F4B] border border-[#A85F4B]/30">
                        <AlertOctagon className="w-3 h-3 text-[#A85F4B]" />
                        <span>Positive ({t.confidenceScore}%)</span>
                      </span>
                    )}
                    {t.preliminaryResult === 'Presumptive Negative' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>Negative</span>
                      </span>
                    )}
                    {t.preliminaryResult === 'Inconclusive / Retake' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                        <span>Inconclusive</span>
                      </span>
                    )}
                  </td>

                  {/* Hash */}
                  <td className="px-4 py-3 font-mono text-[10px] text-[#77716C] max-w-[120px] truncate" title={t.integrityHash}>
                    {t.integrityHash.slice(0, 12)}...
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewRecord(t)}
                        className="p-1.5 bg-[#F5F0EA] hover:bg-[#EAE4DC] border border-[#D3C7BD] text-[#30302E] rounded transition-colors cursor-pointer"
                        title="View Full Evidence Dossier"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#30302E]" />
                      </button>

                      <button
                        onClick={() => handleDownloadPdf(t)}
                        className="p-1.5 bg-[#FAF0ED] hover:bg-[#F2DFDA] border border-[#A85F4B]/40 text-[#A85F4B] rounded transition-colors cursor-pointer"
                        title="Download Forensic PDF Report"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onVerifyRecord(t)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded transition-colors cursor-pointer"
                        title="Run SHA-256 Hash Verification"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete evidence record ${t.id}?`)) {
                            onDeleteRecord(t.id);
                          }
                        }}
                        className="p-1.5 text-[#888] hover:text-[#A85F4B] hover:bg-[#FAF0ED] rounded transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
  );
};
