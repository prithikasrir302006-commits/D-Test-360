import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Trash2,
  Image as ImageIcon,
  Sliders,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  getStoredCustomLogo,
  saveCustomLogo,
  clearCustomLogo,
  getStoredCustomBottomBorder,
  saveCustomBottomBorder,
  clearCustomBottomBorder,
  getStoredBorderMode,
  saveBorderMode,
} from '../services/storage';
import pillEvidenceBand from '../assets/images/pill_border_band_1791697746010.jpg';

export const SecurityKeysView: React.FC = () => {
  const [customLogo, setCustomLogo] = useState<string | null>(() => getStoredCustomLogo());
  const [bottomBorder, setBottomBorder] = useState<string | null>(() =>
    getStoredCustomBottomBorder()
  );
  const [borderMode, setBorderMode] = useState<'landing_only' | 'all_pages' | 'hidden'>(() =>
    getStoredBorderMode()
  );

  const logoInputRef = useRef<HTMLInputElement>(null);
  const borderInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, SVG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        saveCustomLogo(result);
        setCustomLogo(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBorderUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        saveCustomBottomBorder(result);
        setBottomBorder(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-[#F5F0EA] border border-[#D3C7BD] rounded-2xl p-6 shadow-xs transition-all">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A85F4B] mb-1 font-mono">
          <KeyRound className="w-4 h-4" />
          <span>Evidentiary Governance</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#30302E] tracking-tight">
          Security, Cryptography & Forensic Standards
        </h2>
        <p className="text-xs text-[#77716C] mt-1 max-w-xl leading-relaxed">
          Architectural documentation of cryptographic sealing, SWGDRUG compliance guidelines, and mathematical integrity guarantees.
        </p>
      </div>

      {/* 3 Core Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Pillar 1: SHA-256 Digest */}
        <div className="bg-[#F5F0EA] p-5 rounded-2xl border border-[#D3C7BD] space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <div className="w-9 h-9 rounded-xl bg-white border border-[#D3C7BD] flex items-center justify-center text-[#A85F4B] shadow-2xs">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-heading font-bold text-sm text-[#30302E]">
            1. Cryptographic Sealing
          </h3>
          <p className="text-[#77716C] leading-relaxed">
            Every field assay generates a canonical JSON payload hashed with the W3C Web Cryptography API (SHA-256). Any post-hoc record modification creates an irreversible hash collision mismatch.
          </p>
        </div>

        {/* Pillar 2: SWGDRUG Cat. C */}
        <div className="bg-[#F5F0EA] p-5 rounded-2xl border border-[#D3C7BD] space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <div className="w-9 h-9 rounded-xl bg-white border border-[#D3C7BD] flex items-center justify-center text-[#A85F4B] shadow-2xs">
            <FileCode className="w-4 h-4" />
          </div>
          <h3 className="font-heading font-bold text-sm text-[#30302E]">
            2. SWGDRUG & NDPS Protocol
          </h3>
          <p className="text-[#77716C] leading-relaxed">
            Colour tests are strictly classified under Category C (presumptive techniques). D-Test 360 explicitly prohibits definitive chemical claims without confirmatory laboratory GC-MS/LC-MS.
          </p>
        </div>

        {/* Pillar 3: Chain-of-Custody Audit */}
        <div className="bg-[#F5F0EA] p-5 rounded-2xl border border-[#D3C7BD] space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <div className="w-9 h-9 rounded-xl bg-white border border-[#D3C7BD] flex items-center justify-center text-[#A85F4B] shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-heading font-bold text-sm text-[#30302E]">
            3. Chain-of-Custody Audit
          </h3>
          <p className="text-[#77716C] leading-relaxed">
            Immutable timestamps, badge numbers, verified GPS coordinates, and camera optical telemetry are recorded at the point of capture, establishing a transparent evidentiary custody trail.
          </p>
        </div>
      </div>

      {/* D-TEST 360 CUSTOM ASSET MANAGEMENT */}
      <div className="bg-[#F5F0EA] p-6 rounded-xl border border-[#D3C7BD] space-y-5">
        <div>
          <h3 className="font-heading font-bold text-sm text-[#30302E] flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#A85F4B]" />
            <span>D-Test 360 System Asset Management</span>
          </h3>
          <p className="text-xs text-[#77716C] mt-1">
            Manage the official D-Test 360 logo and custom bottom border footer banner. All images retain original proportions, colours, and transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Logo Management */}
          <div className="bg-white p-4.5 rounded-xl border border-[#D3C7BD] space-y-3">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleLogoUpload(e.target.files[0]);
                }
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#30302E]">
                Official D-Test 360 Logo
              </span>
              {customLogo && (
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Custom Asset Active
                </span>
              )}
            </div>

            <div className="h-20 bg-[#FAF7F3] border border-[#E4D8CE] rounded-lg flex items-center justify-center p-2 overflow-hidden">
              {customLogo ? (
                <img
                  src={customLogo}
                  alt="Official D-Test 360 Logo"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-xs text-[#8C8680] text-center">
                  Using default vector D-Test 360 insignia
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => logoInputRef.current?.click()}
                className="flex-1 py-2 px-3 bg-[#A85F4B] hover:bg-[#965240] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Logo File</span>
              </button>
              {customLogo && (
                <button
                  onClick={() => {
                    clearCustomLogo();
                    setCustomLogo(null);
                  }}
                  className="p-2 border border-[#D3C7BD] hover:bg-[#FAF7F3] text-[#77716C] hover:text-[#FF414B] rounded-lg cursor-pointer"
                  title="Reset to default logo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#77716C] leading-snug">
              Displays across login screen, sidebar, dashboard, and generated PDF reports with preserved proportions.
            </p>
          </div>

          {/* Bottom Border Banner Management */}
          <div className="bg-white p-4.5 rounded-xl border border-[#D3C7BD] space-y-3">
            <input
              ref={borderInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleBorderUpload(e.target.files[0]);
                }
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#30302E]">
                Bottom Footer Border Banner
              </span>
              {bottomBorder && (
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Custom Banner Active
                </span>
              )}
            </div>

            <div className="h-20 bg-[#FAF7F3] border border-[#E4D8CE] rounded-lg flex items-center justify-center p-1 overflow-hidden">
              <img
                src={bottomBorder || pillEvidenceBand}
                alt="Active Bottom Border Banner"
                className="w-full h-full object-cover rounded"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => borderInputRef.current?.click()}
                className="flex-1 py-2 px-3 bg-[#A85F4B] hover:bg-[#965240] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Border Banner</span>
              </button>
              {bottomBorder && (
                <button
                  onClick={() => {
                    clearCustomBottomBorder();
                    setBottomBorder(null);
                  }}
                  className="p-2 border border-[#D3C7BD] hover:bg-[#FAF7F3] text-[#77716C] hover:text-[#FF414B] rounded-lg cursor-pointer"
                  title="Reset border image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#E4D8CE] text-[11px] text-[#77716C]">
              <span>Display Scope:</span>
              <select
                value={borderMode}
                onChange={(e) => {
                  const m = e.target.value as 'landing_only' | 'all_pages' | 'hidden';
                  saveBorderMode(m);
                  setBorderMode(m);
                }}
                className="bg-[#FAF7F3] border border-[#D3C7BD] rounded px-2 py-1 text-xs text-[#30302E]"
              >
                <option value="landing_only">Landing Page Only (Recommended)</option>
                <option value="all_pages">All Application Pages</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Canonical Payload Specification */}
      <div className="bg-[#F5F0EA] p-6 rounded-xl border border-[#D3C7BD] space-y-3">
        <h3 className="font-heading font-bold text-sm text-[#30302E]">
          Canonical Evidence String Normalization Schema
        </h3>
        <p className="text-xs text-[#77716C]">
          The deterministic template used to calculate the SHA-256 cryptographic digest across test instances:
        </p>

        <pre className="p-3.5 bg-[#30302E] text-[#F5F0EA] rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed">
{`{
  "id": "FT-2026-XXXX",
  "caseRef": "NCB/DZU/CR-448/2026",
  "operator": "ncb_officer_verma#NCB-ZO-4819",
  "timestamp": "ISO-8601-UTC",
  "reagent": "scott-cocaine",
  "result": "Presumptive Positive | Presumptive Negative | Inconclusive / Retake",
  "substance": "Presumptive Controlled Substance Target",
  "sampleColor": "#0E3C68",
  "qualityScore": 94
}`}
        </pre>
      </div>

      {/* Legal & Methodological Disclaimer */}
      <div className="bg-white p-5 rounded-xl border border-[#D3C7BD] space-y-2 text-xs text-[#555]">
        <div className="font-bold text-[#A85F4B] flex items-center gap-1.5 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          <span>Evidentiary Limitation & Judicial Notice</span>
        </div>
        <p className="leading-relaxed">
          Colourimetric reactions are screening assays subject to chromatic interference from adulterants, cutting agents, lighting temperatures, and chemical degradation. This application provides objective digital companion assistance to aid field documentation, not definitive laboratory identification.
        </p>
      </div>
    </div>
  );
};
