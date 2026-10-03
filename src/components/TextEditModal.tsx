import React, { useState, useEffect } from 'react';
import { Edit3, X, Save } from 'lucide-react';
import { ExtractedString } from '../types';

interface TextEditModalProps {
  isOpen: boolean;
  layerIndex: number;
  extractedStrings: ExtractedString[];
  onSave: (updatedValues: Record<number, string>) => void;
  onClose: () => void;
}

export const TextEditModal: React.FC<TextEditModalProps> = ({
  isOpen,
  layerIndex,
  extractedStrings,
  onSave,
  onClose,
}) => {
  const [formValues, setFormValues] = useState<Record<number, string>>({});

  useEffect(() => {
    const initial: Record<number, string> = {};
    extractedStrings.forEach((item, idx) => {
      initial[idx] = item.text;
    });
    setFormValues(initial);
  }, [extractedStrings]);

  if (!isOpen) return null;

  const handleInputChange = (idx: number, val: string) => {
    setFormValues((prev) => ({ ...prev, [idx]: val }));
  };

  const handleSave = () => {
    onSave(formValues);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-[#05070d] border border-white/[0.08] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[#00f2fe]" />
            <h3 className="text-sm font-bold text-white">
              Edit Teks Layer {layerIndex + 1}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 flex-1 max-h-96 overflow-y-auto flex flex-col gap-4">
          {extractedStrings.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              Tidak ada string teks yang dapat diedit di layer ini.
            </p>
          ) : (
            extractedStrings.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  String #{idx + 1}
                </label>
                <input
                  type="text"
                  value={formValues[idx] ?? item.text}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.08] focus:border-[#00f2fe]/50 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00f2fe]"
                />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/30 border-t border-white/[0.06] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl text-xs font-medium text-slate-300 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={extractedStrings.length === 0}
            className="px-5 py-2 bg-[#00f2fe] hover:bg-[#00d2fe] disabled:opacity-50 text-[#05070d] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 glow-btn"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Teks</span>
          </button>
        </div>
      </div>
    </div>
  );
};
