import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { ToastInfo } from '../types';

interface ToastProps {
  toast: ToastInfo | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all duration-300 text-xs font-semibold backdrop-blur-md border ${
        toast.isError
          ? 'bg-rose-950/90 text-rose-200 border-rose-800/40 shadow-rose-950/50'
          : 'bg-[#00f2fe] text-[#05070d] border-[#00f2fe]/40 shadow-[#00f2fe]/20'
      }`}
    >
      {toast.isError ? (
        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
      ) : (
        <CheckCircle2 className="w-4 h-4 shrink-0 text-[#05070d]" />
      )}
      <span>{toast.message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
