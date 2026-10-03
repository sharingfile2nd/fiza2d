import React from 'react';
import {
  Layers,
  X,
  ArrowUp,
  ArrowDown,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  Move,
  Sliders,
} from 'lucide-react';
import { AnimationLayer } from '../types';

interface LayerManagerProps {
  isOpen: boolean;
  layers: AnimationLayer[];
  activeLayerIndex: number;
  onSelectLayer: (index: number) => void;
  onClose: () => void;
  onSwapLayers: (indexA: number, indexB: number) => void;
  onToggleLayerVisibility: (index: number) => void;
  onDeleteLayer: (index: number) => void;
  onOpenTextEdit: (index: number) => void;
  onScaleChange: (index: number, scale: number) => void;
}

export const LayerManager: React.FC<LayerManagerProps> = ({
  isOpen,
  layers,
  activeLayerIndex,
  onSelectLayer,
  onClose,
  onSwapLayers,
  onToggleLayerVisibility,
  onDeleteLayer,
  onOpenTextEdit,
  onScaleChange,
}) => {
  if (!isOpen) return null;

  const getCurrentScale = (code: string): number => {
    const sMatch =
      code.match(
        /\/\* UI_SCALE \*\/ ctx\.translate\([^)]+\); ctx\.scale\(([-.\d]+),\s*([-.\d]+)\); ctx\.translate\([^)]+\);/
      ) || code.match(/\/\* UI_SCALE \*\/ ctx\.scale\(([-.\d]+),\s*([-.\d]+)\);/);
    if (sMatch) {
      return parseFloat(sMatch[1]);
    }
    return 1.0;
  };

  return (
    <aside className="w-80 bg-[#05070d] border-l border-white/[0.05] flex flex-col h-full shrink-0 z-30 transition-all duration-300">
      {/* Header */}
      <div className="p-4 flex justify-between items-center shrink-0 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00f2fe]" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Panel Layer ({layers.length})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          title="Tutup Panel Layer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Guide */}
      <div className="p-3 text-[10px] text-slate-400 bg-black/30 border-b border-white/[0.04] leading-relaxed shrink-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe]" />
          <span>Panah naik/turun mengatur urutan tumpukan render.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Klik ikon Pena untuk mengubah teks layer tanpa coding.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span>Pilih layer lalu drag kanvas untuk mengatur posisi offset.</span>
        </div>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
        {layers.length === 0 ? (
          <div className="text-[11px] text-slate-500 text-center py-10 px-4">
            Tidak ada layer terformat. Animasi dieksekusi secara global.
          </div>
        ) : (
          layers.map((layer, index) => {
            const isActive = index === activeLayerIndex;
            const currentScale = getCurrentScale(layer.code);

            return (
              <div
                key={layer.id || index}
                className={`flex flex-col p-2.5 rounded-xl transition-all border ${
                  isActive
                    ? 'bg-[#00f2fe]/10 border-[#00f2fe]/40 shadow-lg shadow-[#00f2fe]/5'
                    : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'
                }`}
              >
                {/* Top Row */}
                <div
                  className="flex items-center justify-between gap-2 cursor-pointer"
                  onClick={() => onSelectLayer(isActive ? -1 : index)}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-[#00f2fe] text-[#05070d] font-bold'
                          : 'bg-white/[0.05] text-slate-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`text-xs font-semibold truncate ${
                        isActive ? 'text-[#00f2fe]' : 'text-slate-200'
                      } ${layer.hidden ? 'line-through opacity-40' : ''}`}
                      title={layer.title}
                    >
                      {layer.title}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      disabled={index === 0}
                      onClick={() => onSwapLayers(index, index - 1)}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20 rounded transition-colors"
                      title="Geser Naik"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === layers.length - 1}
                      onClick={() => onSwapLayers(index, index + 1)}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20 rounded transition-colors"
                      title="Geser Turun"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenTextEdit(index)}
                      className="p-1 text-amber-400 hover:text-amber-300 rounded transition-colors"
                      title="Edit Teks Layer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleLayerVisibility(index)}
                      className={`p-1 rounded transition-colors ${
                        layer.hidden ? 'text-slate-500 hover:text-slate-300' : 'text-slate-300 hover:text-white'
                      }`}
                      title={layer.hidden ? 'Tampilkan Layer' : 'Sembunyikan Layer'}
                    >
                      {layer.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onDeleteLayer(index)}
                      className="p-1 text-rose-400 hover:text-rose-300 rounded transition-colors"
                      title="Hapus Layer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Active Layer Inspector (Drag & Scale) */}
                {isActive && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex flex-col gap-2.5">
                    <div className="text-[10px] text-[#00f2fe] bg-[#00f2fe]/10 p-2 rounded-lg flex items-center gap-2">
                      <Move className="w-3.5 h-3.5 shrink-0" />
                      <span>Klik & Drag kanvas langsung untuk geser posisi layer.</span>
                    </div>

                    <div className="flex flex-col gap-1.5 bg-black/40 p-2.5 rounded-xl border border-white/[0.04]">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-semibold text-slate-400 flex items-center gap-1">
                          <Sliders className="w-3 h-3 text-[#00f2fe]" /> Skala Ukuran
                        </span>
                        <span className="font-mono text-[#00f2fe] font-bold">
                          {currentScale.toFixed(1)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="5.0"
                        step="0.1"
                        value={currentScale}
                        onChange={(e) => onScaleChange(index, parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#00f2fe]"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
