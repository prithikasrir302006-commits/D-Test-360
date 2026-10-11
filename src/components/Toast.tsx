import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start justify-between gap-3 backdrop-blur-md transition-all ${
            toast.type === 'success'
              ? 'bg-[#EBF7EE] border-emerald-400 text-emerald-950'
              : toast.type === 'error'
              ? 'bg-[#FAF0ED] border-[#A85F4B] text-[#8B3A28]'
              : 'bg-[#F5F0EA] border-[#D3C7BD] text-[#30302E]'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#A85F4B] shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-[#A85F4B] shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-xs font-bold text-[#30302E]">{toast.title}</div>
              {toast.message && (
                <div className="text-[11px] text-[#77716C] mt-0.5">{toast.message}</div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="text-[#666] hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
