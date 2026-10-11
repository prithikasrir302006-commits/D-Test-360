import React, { useState } from 'react';
import { Operator } from '../types';
import { DTestLogo } from './DTestLogo';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  Fingerprint,
  Activity,
  Sparkles,
  KeyRound,
  Compass
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (operator: Operator) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('ncb_officer_verma');
  const [password, setPassword] = useState('dtest360pass');
  const [badgeNumber, setBadgeNumber] = useState('NCB-ZO-4819');
  const [agency, setAgency] = useState('Narcotics Control Bureau (NCB) — Delhi Zonal Unit');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setErrorMessage('Please enter an authorized NCB officer username.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage(`Password must contain at least 8 characters (current: ${password.length}).`);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        username: trimmedUser,
        badgeNumber: badgeNumber.trim() || 'NCB-ZO-4819',
        agency: agency.trim() || 'Narcotics Control Bureau (NCB)',
        role: 'NCB Field Seizure Officer',
        loginTime: new Date().toISOString(),
        isDemo: true,
      });
    }, 450);
  };

  const handleQuickFill = (role: 'field' | 'hq') => {
    if (role === 'field') {
      setUsername('ncb_officer_verma');
      setPassword('dtest360pass');
      setBadgeNumber('NCB-ZO-4819');
      setAgency('Narcotics Control Bureau (NCB) — Delhi Zonal Unit');
    } else {
      setUsername('supt_k_sharma');
      setPassword('dtest360pass');
      setBadgeNumber('NCB-HQ-1042');
      setAgency('Narcotics Control Bureau (NCB) — Headquarters Division');
    }
    setErrorMessage(null);
  };

  return (
    <div className="relative min-h-screen bg-[#E4D8CE] flex flex-col justify-between selection:bg-[#A85F4B] selection:text-white overflow-hidden">
      {/* Background Image with 45% transparency */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ opacity: 0.45 }}
      >
        <img
          src="/login-bg.jpg"
          alt="Forensic officer crime scene background"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-[#D3C7BD]/80 bg-[#E4D8CE]/85 backdrop-blur-md px-6 py-4 animate-slide-down">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <DTestLogo size="sm" showSubtitle={true} />
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#30302E] bg-[#F5F0EA] px-3 py-1.5 rounded-lg border border-[#D3C7BD] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-semibold text-[#A85F4B]">NCB Secure Enclave</span>
              <span className="text-[#8C8680] hidden sm:inline">· TLS 1.3</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Header Identity & Shield */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="relative group">
                <DTestLogo size="xl" showSubtitle={false} />
                <div className="absolute -inset-1 rounded-full bg-[#A85F4B]/15 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0ED] border border-[#A85F4B]/30 text-[#A85F4B] text-[11px] font-mono uppercase tracking-wider mb-2.5 shadow-2xs animate-fade-in">
              <Fingerprint className="w-3.5 h-3.5 text-[#A85F4B]" />
              <span>Officer Verification Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#30302E] tracking-tight">
              Sign In to D-Test 360
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#5B5550] max-w-sm mx-auto leading-relaxed">
              Field drug testing support system, reagent colourimetry, and digital chain of custody.
            </p>
          </div>

          {/* Frosted Glass Login Container */}
          <div className="bg-[#F5F0EA]/95 backdrop-blur-md border border-[#D3C7BD] rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-300 hover:shadow-2xl">
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-[#FAF0ED] border border-[#A85F4B]/40 text-xs text-[#8B3A28] flex items-start gap-2.5 animate-slide-down">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#A85F4B]" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#30302E] uppercase tracking-wider">
                  Officer Username
                </label>
                <div className="relative group">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77716C] group-focus-within:text-[#A85F4B] transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. ncb_officer_verma"
                    className="w-full pl-10 pr-3 py-2.5 bg-white/95 border border-[#D3C7BD] rounded-xl text-sm text-[#30302E] placeholder-[#999] focus:outline-none focus:border-[#A85F4B] focus:ring-2 focus:ring-[#A85F4B]/20 transition-all shadow-2xs"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#30302E] uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-[#77716C] font-mono">
                    Min. 8 chars
                  </span>
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77716C] group-focus-within:text-[#A85F4B] transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter password (≥ 8 characters)"
                    className="w-full pl-10 pr-10 py-2.5 bg-white/95 border border-[#D3C7BD] rounded-xl text-sm text-[#30302E] placeholder-[#999] focus:outline-none focus:border-[#A85F4B] focus:ring-2 focus:ring-[#A85F4B]/20 transition-all font-mono shadow-2xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77716C] hover:text-[#30302E] p-1 rounded-md transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password.length > 0 && password.length < 8 && (
                  <p className="text-[11px] text-[#A85F4B] font-medium animate-fadeIn">
                    Password needs at least 8 characters ({password.length}/8).
                  </p>
                )}
                {password.length >= 8 && (
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-mono font-medium animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Security threshold met ({password.length} chars)
                  </p>
                )}
              </div>

              {/* Badge & Agency info */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#77716C] uppercase tracking-wide">
                    Officer / Badge ID
                  </label>
                  <input
                    type="text"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    placeholder="NCB-ZO-4819"
                    className="w-full px-3 py-2 bg-white/95 border border-[#D3C7BD] rounded-xl text-xs text-[#30302E] font-mono shadow-2xs focus:outline-none focus:border-[#A85F4B] transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#77716C] uppercase tracking-wide">
                    Zonal Unit
                  </label>
                  <input
                    type="text"
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                    placeholder="NCB Delhi Zonal Unit"
                    className="w-full px-3 py-2 bg-white/95 border border-[#D3C7BD] rounded-xl text-xs text-[#30302E] shadow-2xs focus:outline-none focus:border-[#A85F4B] transition-colors"
                  />
                </div>
              </div>

              {/* Quick Fill Preset Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-[#D3C7BD]/70">
                <span className="text-[10px] text-[#77716C] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-[#A85F4B]" />
                  Quick Fill:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('field')}
                    className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-white hover:bg-[#FAF0ED] text-[#30302E] hover:text-[#A85F4B] border border-[#D3C7BD] shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    Field Officer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('hq')}
                    className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-white hover:bg-[#FAF0ED] text-[#30302E] hover:text-[#A85F4B] border border-[#D3C7BD] shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    HQ Super
                  </button>
                </div>
              </div>

              {/* Submit CTA with smooth hover and loading animation */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 py-3 px-4 bg-[#A85F4B] hover:bg-[#965240] active:scale-[0.99] text-white font-medium text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials & Session...</span>
                  </div>
                ) : (
                  <>
                    <span>Authorize Session & Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Official Security Standards Notice */}
            <div className="mt-5 pt-4 border-t border-[#D3C7BD] text-xs text-[#77716C] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[#30302E] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Compliance Standard:
                </span>
                <span className="text-[10px] uppercase font-mono text-[#A85F4B] font-semibold bg-[#FAF0ED] px-2 py-0.5 rounded border border-[#A85F4B]/20">
                  SWGDRUG Cat-C Verified
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#77716C]">
                Tamper-evident SHA-256 evidence logging with GPS geotagging & objective colourimetry.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Global Footer - No borders or banners */}
      <footer className="relative z-10 border-t border-[#D3C7BD]/80 bg-[#E4D8CE]/90 backdrop-blur-md py-4 px-6 text-center text-xs text-[#77716C]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div>
            <span className="font-heading font-bold text-[#30302E]">D-TEST 360</span>
            <span> · Narcotics Control Bureau (NCB) Field Drug Testing Support System</span>
          </div>
          <div className="font-mono text-[#8C8680]">
            Law Enforcement Enclave · Digital Traceability
          </div>
        </div>
      </footer>
    </div>
  );
};
