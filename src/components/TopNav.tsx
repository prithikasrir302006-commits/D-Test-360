import React from 'react';
import { Operator } from '../types';
import { Menu, LogOut, ShieldCheck, Wifi, UserCheck, Sparkles } from 'lucide-react';

interface TopNavProps {
  currentTab: string;
  operator: Operator;
  onLogout: () => void;
  onOpenMobileSidebar: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  operator,
  onLogout,
  onOpenMobileSidebar,
}) => {
  const getTabInfo = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return {
          title: 'Field Operations Dashboard',
          subtitle: 'Capture, assess, and document field-test observations with digital traceability.',
        };
      case 'new-test':
        return {
          title: 'New Field Test Assay',
          subtitle: 'Guided multi-step pouch screening and colorimetric calibration.',
        };
      case 'history':
        return {
          title: 'Evidence History Archive',
          subtitle: 'Complete audit trail of seized field test records with SHA-256 seals.',
        };
      case 'verification':
        return {
          title: 'Record Verification & Audit',
          subtitle: 'Cryptographic SHA-256 seal auditing and tamper validation.',
        };
      case 'security':
        return {
          title: 'Security, Standards & Keys',
          subtitle: 'SWGDRUG Category C scientific standards and NDPS evidentiary custody.',
        };
      default:
        return {
          title: 'Field Operations',
          subtitle: 'Field drug testing support system for NCB operations.',
        };
    }
  };

  const { title, subtitle } = getTabInfo(currentTab);

  return (
    <header className="sticky top-0 z-20 w-full bg-[#E4D8CE]/90 backdrop-blur-md border-b border-[#D3C7BD] px-4 sm:px-6 py-3.5 selection:bg-[#A85F4B] selection:text-white transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile trigger & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 text-[#30302E] hover:bg-[#D9CCC2] rounded-xl transition-colors cursor-pointer"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs text-[#77716C]">
              <span>NCB Operations</span>
              <span>/</span>
              <span className="font-semibold text-[#30302E] capitalize">
                {currentTab.replace('-', ' ')}
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-base sm:text-lg text-[#30302E] tracking-tight">
              {title}
            </h1>
            <p className="text-[11px] text-[#77716C] hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Honest System Status & Operator Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F5F0EA] border border-[#D3C7BD] text-[11px] text-[#77716C] font-mono shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Cryptographic Enclave Active</span>
          </div>

          {/* Mode Pill */}
          <div className="px-2.5 py-1 bg-[#FAF0ED] text-[#A85F4B] border border-[#A85F4B]/30 rounded-lg text-xs font-mono font-medium shadow-2xs">
            NCB Mode
          </div>

          {/* Operator Capsule */}
          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-[#D3C7BD]">
            <div className="w-8 h-8 rounded-xl bg-[#30302E] text-[#F5F0EA] flex items-center justify-center text-xs font-bold font-mono shadow-xs">
              {operator.username[0]?.toUpperCase() || 'O'}
            </div>
            <div className="text-left text-xs leading-tight">
              <span className="font-semibold text-[#30302E] block truncate max-w-[130px]">
                {operator.username}
              </span>
              <span className="text-[10px] text-[#77716C] font-mono">
                {operator.badgeNumber}
              </span>
            </div>
          </div>

          {/* Quick Logout with hover transition */}
          <button
            onClick={onLogout}
            className="p-2 text-[#77716C] hover:text-[#A85F4B] hover:bg-[#FAF0ED] rounded-xl transition-all cursor-pointer border border-transparent hover:border-[#D3C7BD]"
            title="Sign out of field session"
          >
            <LogOut className="w-4 h-4 text-[#A85F4B]" />
          </button>
        </div>
      </div>
    </header>
  );
};
