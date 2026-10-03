import React from 'react';
import {
  Code2,
  Play,
  Settings,
  Sparkles,
  RotateCcw,
  ClipboardPaste,
  Copy,
  Check,
} from 'lucide-react';

interface HeaderNavProps {
  activeTab: 'preview' | 'code' | 'settings';
  setActiveTab: (tab: 'preview' | 'code' | 'settings') => void;
  onRunCode: () => void;
  onClearCode: () => void;
  onPasteCode: () => void;
  onCopyCode: () => void;
  copied: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  onRunCode,
  onClearCode,
  onPasteCode,
  onCopyCode,
  copied,
}) => {
  return (
    <header className="h-14 bg-[#05070d] border-b border-white/[0.05] px-4 flex items-center justify-between shrink-0 select-none z-20">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00d2fe] to-[#4facfe] flex items-center justify-center shadow-lg shadow-[#00f2fe]/20">
          <Sparkles className="w-4 h-4 text-[#05070d]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
            FizaGen Animasi 2D
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono text-[#00f2fe] bg-[#00f2fe]/10 px-2 py-0.5 rounded-md border border-[#00f2fe]/20">
            4K Studio
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation tabs */}
      <nav className="flex items-center gap-1 bg-[#020305] p-1 rounded-xl border border-white/[0.04]">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'preview'
              ? 'bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Live Preview</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'code'
              ? 'bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Raw Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Pengaturan</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        {activeTab === 'code' && (
          <div className="flex items-center gap-1.5 animate-in fade-in">
            <button
              onClick={onClearCode}
              className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg text-xs transition-colors flex items-center gap-1.5"
              title="Clear Canvas and Editor"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Clear</span>
            </button>
            <button
              onClick={onPasteCode}
              className="px-2.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-lg text-xs transition-colors flex items-center gap-1.5"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Paste</span>
            </button>
            <button
              onClick={onCopyCode}
              className="px-2.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-lg text-xs transition-colors flex items-center gap-1.5"
              title="Copy code"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 hidden md:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Copy</span>
                </>
              )}
            </button>
            <button
              onClick={onRunCode}
              className="px-3.5 py-1.5 bg-[#00f2fe] hover:bg-[#00d2fe] text-[#05070d] font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 glow-btn"
              title="Terapkan dan compile kode ke Canvas"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Terapkan</span>
            </button>
          </div>
        )}

        {activeTab !== 'code' && (
          <button
            onClick={onCopyCode}
            className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-lg text-xs transition-colors flex items-center gap-1.5"
            title="Salin source code JS"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Copy JS'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
