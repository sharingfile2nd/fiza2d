import React, { useEffect, useRef } from 'react';
import { Terminal, X, Loader2 } from 'lucide-react';
import { TerminalLog } from '../types';

interface SystemLogModalProps {
  isOpen: boolean;
  logs: TerminalLog[];
  status: string;
  isStreaming: boolean;
  onClose: () => void;
}

export const SystemLogModal: React.FC<SystemLogModalProps> = ({
  isOpen,
  logs,
  status,
  isStreaming,
  onClose,
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  const getTypeColor = (type: TerminalLog['type']) => {
    switch (type) {
      case 'SYS':
        return 'text-[#00d2fe]';
      case 'AI':
        return 'text-purple-400';
      case 'MATH':
        return 'text-cyan-300';
      case 'PROC':
        return 'text-sky-400';
      case 'DONE':
        return 'text-emerald-400';
      case 'WARN':
        return 'text-amber-400';
      case 'ERR':
        return 'text-rose-400';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#05070d] border border-white/[0.08] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col transform transition-all duration-300 animate-in fade-in zoom-in-95">
        {/* Terminal Header */}
        <div className="bg-[#020305] px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#00f2fe] animate-pulse" />
            <h3 className="text-xs font-mono font-bold text-[#00f2fe] tracking-wider uppercase">
              System Terminal // AI Core Engine
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 mr-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            {!isStreaming && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Terminal Logs Output */}
        <div
          ref={logContainerRef}
          className="p-5 h-80 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col gap-2 bg-[#010102] selection:bg-[#00f2fe]/20"
        >
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2">
              <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
              <span className={`font-bold shrink-0 ${getTypeColor(log.type)}`}>
                [{log.type}]
              </span>
              <span className="text-slate-300 whitespace-pre-wrap">{log.message}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-slate-600 italic">Initializing procedural link...</div>
          )}
        </div>

        {/* Terminal Footer */}
        <div className="bg-[#020305] px-4 py-2.5 flex justify-between items-center border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span>STATUS:</span>
            <span
              className={`font-bold ${
                status.includes('SUCCESS')
                  ? 'text-emerald-400'
                  : status.includes('ERROR')
                  ? 'text-rose-400'
                  : 'text-amber-400 animate-pulse'
              }`}
            >
              {status}
            </span>
          </div>
          {isStreaming && (
            <div className="flex items-center gap-2 text-[11px] text-[#00f2fe]">
              <Loader2 className="w-4 h-4 animate-spin text-[#00f2fe]" />
              <span className="text-[10px] font-mono">Synthesizing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
