import React, { useState } from 'react';
import {
  Zap,
  Film,
  FolderOpen,
  Search,
  RotateCcw,
  Sparkles,
  Waves,
  Crosshair,
  Activity,
  Layers,
  Check,
  X,
} from 'lucide-react';
import { PresetItem, ResolutionMode } from '../types';
import { PRESET_LIST, RESOLUTION_MAP, STYLE_DATABASE } from '../constants/presets';

interface SidebarProps {
  theme: string;
  setTheme: (t: string) => void;
  resolution: ResolutionMode;
  setResolution: (r: ResolutionMode) => void;
  targetLines: number;
  setTargetLines: (l: number) => void;
  targetCycle: number;
  setTargetCycle: (c: number) => void;
  durationSec: number;
  setDurationSec: (d: number) => void;
  selectedStyles: Set<string>;
  onToggleStyle: (style: string) => void;
  onClearStyles: () => void;
  onLoadPreset: (preset: PresetItem) => void;
  outputDirectoryName: string | null;
  onSelectFolder: () => void;
  onGenerate: () => void;
  onRender4K: () => void;
  isGenerating: boolean;
  isRenderingVideo: boolean;
  canRender: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  theme,
  setTheme,
  resolution,
  setResolution,
  targetLines,
  setTargetLines,
  targetCycle,
  setTargetCycle,
  durationSec,
  setDurationSec,
  selectedStyles,
  onToggleStyle,
  onClearStyles,
  onLoadPreset,
  outputDirectoryName,
  onSelectFolder,
  onGenerate,
  onRender4K,
  isGenerating,
  isRenderingVideo,
  canRender,
}) => {
  const [styleSearch, setStyleSearch] = useState('');

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shapes':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0" />;
      case 'Droplet':
        return <Waves className="w-3.5 h-3.5 text-purple-400 mr-1.5 shrink-0" />;
      case 'Crosshair':
        return <Crosshair className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />;
      case 'Activity':
        return <Activity className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-[#00f2fe] mr-1.5 shrink-0" />;
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-[#05070d] flex flex-col h-full shrink-0 z-20 border-r border-white/[0.04]">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/[0.04] shrink-0">
        <div>
          <h1 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00d2fe] to-[#4facfe] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00f2fe]" /> FizaGen Animasi 2D
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Studio Rendering 4K & Procedural Engine
          </p>
        </div>
      </div>

      {/* Scrollable controls */}
      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
        {/* Preset Cards */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Preset Animasi
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_LIST.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onLoadPreset(preset)}
                className="text-[11px] bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/[0.1] py-2 px-2.5 rounded-xl text-slate-200 transition-all text-left flex items-center truncate"
              >
                {getPresetIcon(preset.icon)}
                <span className="truncate">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Resolution */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Resolusi Output Canvas
          </label>
          <div className="relative">
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as ResolutionMode)}
              className="w-full bg-black/40 border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#00f2fe] cursor-pointer"
            >
              {(Object.keys(RESOLUTION_MAP) as ResolutionMode[]).map((key) => (
                <option key={key} value={key} className="bg-[#0b1120] text-slate-200">
                  {RESOLUTION_MAP[key].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Theme / Scenario Detail */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Detail Skenario Animasi
          </label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g. Opening YouTube, Cyber Grid, Intro Logo..."
            className="w-full bg-black/40 border border-white/[0.06] focus:border-[#00f2fe]/40 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#00f2fe]"
          />
        </div>

        {/* Complexity Slider */}
        <div className="flex flex-col gap-1.5 bg-black/25 p-3 rounded-2xl border border-white/[0.03]">
          <div className="flex justify-between items-end mb-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Target Kompleksitas
            </label>
            <span className="text-[11px] font-mono text-[#00f2fe] bg-[#00f2fe]/10 px-2 py-0.5 rounded-lg border border-[#00f2fe]/20">
              ~{targetLines} Baris
            </span>
          </div>
          <input
            type="range"
            min="200"
            max="1900"
            step="50"
            value={targetLines}
            onChange={(e) => setTargetLines(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00f2fe]"
          />
        </div>

        {/* Loop Duration */}
        <div className="flex flex-col gap-1.5 bg-black/25 p-3 rounded-2xl border border-white/[0.03]">
          <div className="flex justify-between items-end mb-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Durasi Looping Animasi
            </label>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
              {targetCycle} Detik
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="60"
            step="1"
            value={targetCycle}
            onChange={(e) => setTargetCycle(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Style Combinations Selector */}
        <div className="flex flex-col gap-2 bg-black/25 p-3 rounded-2xl border border-white/[0.03] min-h-[160px]">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Kombinasi Style ({selectedStyles.size})
            </label>
            {selectedStyles.size > 0 && (
              <button
                onClick={onClearStyles}
                className="text-[10px] text-slate-400 hover:text-[#00f2fe] flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={styleSearch}
              onChange={(e) => setStyleSearch(e.target.value)}
              placeholder="Cari style (ex: Bloom, Cyberpunk)..."
              className="w-full bg-black/50 border border-white/[0.06] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#00f2fe]"
            />
          </div>

          {/* Selected Styles Pills */}
          {selectedStyles.size > 0 && (
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto py-1">
              {Array.from(selectedStyles).map((style) => (
                <span
                  key={style}
                  className="inline-flex items-center gap-1 bg-[#00f2fe] text-[#05070d] text-[10px] font-bold px-2 py-0.5 rounded-full"
                >
                  <span>{style}</span>
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-white transition-colors"
                    onClick={() => onToggleStyle(style)}
                  />
                </span>
              ))}
            </div>
          )}

          {/* Style Categories List */}
          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-48 pr-1">
            {Object.entries(STYLE_DATABASE).map(([category, styles]) => {
              const filtered = styles.filter((s) =>
                s.toLowerCase().includes(styleSearch.toLowerCase())
              );
              if (filtered.length === 0) return null;

              return (
                <div key={category} className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {category}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {filtered.map((style) => {
                      const isSelected = selectedStyles.has(style);
                      return (
                        <button
                          key={style}
                          onClick={() => onToggleStyle(style)}
                          className={`text-[10px] px-2 py-1 rounded-lg transition-all text-left flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40 font-semibold'
                              : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08]'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                          <span>{style}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="bg-[#05070d] p-4 border-t border-white/[0.04] shrink-0 z-20 flex flex-col gap-2.5">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Durasi Video Export
          </label>
          <span className="text-xs font-mono text-[#00f2fe] font-bold">
            {durationSec} Detik
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="60"
          step="1"
          value={durationSec}
          onChange={(e) => setDurationSec(Number(e.target.value))}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00f2fe]"
        />

        <div className="flex flex-col gap-1 mt-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Folder Output MP4
          </label>
          <button
            onClick={onSelectFolder}
            className="bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] text-slate-200 px-3 py-2 rounded-xl text-[11px] transition-colors flex items-center justify-center gap-2"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{outputDirectoryName ? 'Ganti Folder' : 'Pilih Lokasi Save'}</span>
          </button>
          <p
            className={`text-[9px] truncate text-center ${
              outputDirectoryName ? 'text-[#00f2fe] font-mono' : 'text-slate-500'
            }`}
          >
            {outputDirectoryName
              ? `Folder: ${outputDirectoryName}`
              : 'Mode: Unduh Otomatis Browser'}
          </p>
        </div>

        <div className="flex gap-2 mt-1">
          <button
            onClick={onGenerate}
            disabled={isGenerating || isRenderingVideo}
            className="glow-btn flex-1 bg-[#00f2fe] hover:bg-[#00d2fe] disabled:opacity-50 text-[#05070d] font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-lg shadow-[#00f2fe]/20"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{isGenerating ? 'Generating...' : 'Generate AI'}</span>
          </button>
          <button
            onClick={onRender4K}
            disabled={!canRender || isRenderingVideo || isGenerating}
            className="flex-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 disabled:opacity-40 text-emerald-400 font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-all"
            title="Render video MP4 4K (3840x2160)"
          >
            <Film className="w-3.5 h-3.5" />
            <span>{isRenderingVideo ? 'Recording...' : 'Render 4K'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
