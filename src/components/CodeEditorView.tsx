import React, { useRef, useEffect } from 'react';
import { Play, Copy, Check, RotateCcw, ClipboardPaste, Code2 } from 'lucide-react';

interface CodeEditorViewProps {
  code: string;
  onChange: (newCode: string) => void;
  onRunCode: () => void;
  onClear: () => void;
  onPaste: () => void;
  onCopy: () => void;
  copied: boolean;
}

export const CodeEditorView: React.FC<CodeEditorViewProps> = ({
  code,
  onChange,
  onRunCode,
  onClear,
  onPaste,
  onCopy,
  copied,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const linesCount = code.split('\n').length;
  const charsCount = code.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRunCode]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020305] overflow-hidden relative">
      {/* Editor Subheader */}
      <div className="bg-[#05070d] px-4 py-2 border-b border-white/[0.04] flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Code2 className="w-3.5 h-3.5 text-[#00f2fe]" /> Canvas JavaScript Loop
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-[11px] text-slate-400">
            {linesCount} baris · {charsCount} karakter
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[10px] text-slate-500 font-mono">
            Shortcut: Ctrl + Enter untuk run
          </span>
          <button
            onClick={onClear}
            className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded text-xs transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
          <button
            onClick={onPaste}
            className="px-2 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded text-xs transition-colors flex items-center gap-1"
          >
            <ClipboardPaste className="w-3 h-3" />
            <span>Paste</span>
          </button>
          <button
            onClick={onCopy}
            className="px-2 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded text-xs transition-colors flex items-center gap-1"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={onRunCode}
            className="px-3 py-1 bg-[#00f2fe] hover:bg-[#00d2fe] text-[#05070d] font-bold rounded text-xs transition-all flex items-center gap-1.5 glow-btn"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Terapkan</span>
          </button>
        </div>
      </div>

      {/* Editor Textarea with line numbers */}
      <div className="flex-1 flex relative overflow-hidden bg-[#010203]">
        {/* Line Numbers Column */}
        <div className="w-12 bg-[#030508] py-4 select-none text-right pr-3 font-mono text-[11px] text-slate-600 border-r border-white/[0.04] leading-relaxed hidden sm:block overflow-hidden">
          {Array.from({ length: Math.min(linesCount, 1200) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="flex-1 h-full bg-transparent text-slate-200 p-4 code-font text-xs sm:text-sm resize-none focus:outline-none leading-relaxed overflow-y-auto selection:bg-[#00f2fe]/20 selection:text-[#00f2fe]"
          placeholder="// Tulis kode animasi Canvas 2D disini..."
        />
      </div>
    </div>
  );
};
