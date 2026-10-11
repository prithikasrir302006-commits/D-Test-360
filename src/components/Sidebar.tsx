import React from 'react';
import { Operator } from '../types';
import { DTestLogo } from './DTestLogo';
import {
  LayoutDashboard,
  PlusCircle,
  FileClock,
  ShieldCheck,
  KeyRound,
  LogOut,
  X,
  Radio,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  operator: Operator;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  totalRecords: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  operator,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  totalRecords,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-test', label: 'New Field Test', icon: PlusCircle, highlight: true },
    { id: 'history', label: 'Evidence History', icon: FileClock, badge: totalRecords },
    { id: 'verification', label: 'Record Verification', icon: ShieldCheck },
    { id: 'security', label: 'Security & Keys', icon: KeyRound },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between bg-[#30302E] text-[#F5F0EA] p-5 selection:bg-[#A85F4B] selection:text-white">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between pb-5 border-b border-[#444440]">
          <DTestLogo size="md" showSubtitle={true} inverted={true} />

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-[#A39D97] hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NCB Protocol Badge */}
        <div className="mt-4 px-3 py-1.5 bg-[#252523] rounded-xl border border-[#3E3E3B] flex items-center justify-between text-[11px] text-[#A39D97] shadow-inner">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>NCB Protocol</span>
          </div>
          <span className="text-[#A85F4B] font-mono font-medium">SWGDRUG Cat. C</span>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile();
                }}
                className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#A85F4B] text-white shadow-md font-semibold translate-x-1'
                    : item.highlight
                    ? 'bg-[#3C3C3A] hover:bg-[#464642] text-white border border-[#4D4D48] hover:translate-x-0.5'
                    : 'text-[#C7C0B8] hover:bg-[#3C3C3A] hover:text-white hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : item.highlight ? 'text-[#A85F4B]' : 'text-[#A39D97]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full transition-colors ${
                      isActive
                        ? 'bg-black/30 text-white font-bold'
                        : 'bg-[#252523] text-[#A39D97] border border-[#3E3E3B]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Operator Session Info & Logout */}
      <div className="pt-5 border-t border-[#444440] space-y-3">
        <div className="bg-[#262624] p-3.5 rounded-xl border border-[#3C3C39] text-xs transition-colors hover:border-[#4E4E49]">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-[#A39D97]">
              Active Seizure Officer
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Connected" />
          </div>
          <div className="font-bold text-white truncate mt-1">
            {operator.username}
          </div>
          <div className="text-[11px] font-mono text-[#A85F4B] truncate">
            ID: {operator.badgeNumber}
          </div>
          <div className="text-[10px] text-[#8C8680] truncate mt-0.5">
            {operator.agency}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-[#C7C0B8] hover:text-white hover:bg-[#3C3C3A] rounded-xl transition-all cursor-pointer border border-[#444440] active:scale-[0.98]"
        >
          <LogOut className="w-3.5 h-3.5 text-[#A85F4B]" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 border-r border-[#444440] shadow-sm z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-slide-down">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
