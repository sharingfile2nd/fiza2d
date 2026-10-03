import React, { useRef } from 'react';
import { Cpu, Settings, Upload, Trash2, Save, Sparkles, FileCode, CheckCircle2 } from 'lucide-react';

interface SettingsViewProps {
  provider: 'gemini' | 'clariohub';
  setProvider: (p: 'gemini' | 'clariohub') => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  onSaveCredentials: () => void;
  customEngineName: string | null;
  onUploadEngine: (file: File) => void;
  onClearEngine: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  provider,
  setProvider,
  apiKey,
  setApiKey,
  selectedModel,
  setSelectedModel,
  onSaveCredentials,
  customEngineName,
  onUploadEngine,
  onClearEngine,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadEngine(file);
      e.target.value = '';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020305] p-6 sm:p-10 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
            <Settings className="w-6 h-6 text-[#00f2fe]" /> Pengaturan Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Konfigurasi provider AI, model generator, dan custom render runtime.
          </p>
        </div>

        {/* API Credentials Card */}
        <div className="bg-[#05070d] border border-white/[0.06] rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#00f2fe]/10 border border-[#00f2fe]/20 flex items-center justify-center text-[#00f2fe] shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                Kredensial API & Model Generator
              </h3>
              <p className="text-xs text-slate-400">
                Pilih provider bawaan FizaGen Core atau ClarioHub API.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Provider Picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Provider AI
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as 'gemini' | 'clariohub')}
                className="w-full bg-black/40 border border-white/[0.08] focus:border-[#00f2fe]/50 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#00f2fe] cursor-pointer"
              >
                <option value="gemini" className="bg-[#0b1120] text-slate-200">
                  FizaGen Core (Built-in Gemini AI - Ready)
                </option>
                <option value="clariohub" className="bg-[#0b1120] text-slate-200">
                  ClarioHub API (Custom Key & Multi-model)
                </option>
              </select>
            </div>

            {/* API Key */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>API Key</span>
                {provider === 'gemini' && (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ● Terhubung Otomatis
                  </span>
                )}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  provider === 'gemini'
                    ? 'Default Gemini API Key aktif dari environment'
                    : 'sk-...'
                }
                className="w-full bg-black/40 border border-white/[0.08] focus:border-[#00f2fe]/50 rounded-xl px-4 py-3 text-sm text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-[#00f2fe]"
              />
            </div>

            {/* Model Selector */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">
                Target Model AI
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] focus:border-[#00f2fe]/50 rounded-xl px-4 py-3 text-sm text-[#00f2fe] font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-[#00f2fe] cursor-pointer"
              >
                <optgroup label="Auto Models (Disarankan)">
                  <option value="clario/gemini-3.7-flash-auto" className="bg-[#0b1120] text-slate-200">
                    Gemini 3.7 Flash (Auto)
                  </option>
                  <option value="clario/deepseek-v4.1-flash-auto" className="bg-[#0b1120] text-slate-200">
                    DeepSeek V4.1 Flash (Auto)
                  </option>
                  <option value="clario/glm-5.3-flash-auto" className="bg-[#0b1120] text-slate-200">
                    GLM 5.3 Flash (Auto)
                  </option>
                </optgroup>
                <optgroup label="Standard Models">
                  <option value="clario/deepseek-v4-flash" className="bg-[#0b1120] text-slate-200">
                    DeepSeek V4 Flash
                  </option>
                  <option value="clario/gpt-5.6-sol" className="bg-[#0b1120] text-slate-200">
                    GPT-5.6 Sol
                  </option>
                  <option value="clario/opus-5" className="bg-[#0b1120] text-slate-200">
                    Claude Opus 5
                  </option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={onSaveCredentials}
              className="bg-[#00f2fe]/10 hover:bg-[#00f2fe]/20 border border-[#00f2fe]/30 text-[#00f2fe] font-bold px-6 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 glow-btn"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Kredensial</span>
            </button>
          </div>
        </div>

        {/* Custom Engine Card */}
        <div className="bg-[#05070d] border border-white/[0.06] rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                Mesin Animasi Custom (.JS)
              </h3>
              <p className="text-xs text-slate-400">
                Unggah modul algoritma eksternal untuk memperluas pustaka render.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".js"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex-1 w-full bg-black/40 border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <FileCode className="w-8 h-8 text-slate-500 mb-2" />
              <p
                className={`text-sm font-semibold ${
                  customEngineName ? 'text-purple-400' : 'text-slate-400'
                }`}
              >
                {customEngineName
                  ? `Aktif: ${customEngineName}`
                  : 'Mesin Render Default (Aktif)'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {customEngineName
                  ? 'Script eksternal disuntikkan ke runtime window'
                  : 'Menggunakan Canvas 2D Procedural Engine teroptimasi'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 w-full md:w-52">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 font-medium px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload .JS</span>
              </button>
              {customEngineName && (
                <button
                  onClick={onClearEngine}
                  className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-medium px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Mesin</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
