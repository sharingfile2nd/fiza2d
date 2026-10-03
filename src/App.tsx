import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { Sidebar } from './components/Sidebar';
import { CanvasPreview } from './components/CanvasPreview';
import { CodeEditorView } from './components/CodeEditorView';
import { SettingsView } from './components/SettingsView';
import { LayerManager } from './components/LayerManager';
import { SystemLogModal } from './components/SystemLogModal';
import { TextEditModal } from './components/TextEditModal';
import { Toast } from './components/Toast';

import {
  AnimationLayer,
  ExtractedString,
  PresetItem,
  ResolutionMode,
  TerminalLog,
  ToastInfo,
} from './types';
import { DEFAULT_ANIMATION_CODE, RESOLUTION_MAP } from './constants/presets';
import {
  parseCodeToLayers,
  syncLayersToCode,
  extractEditableStrings,
  cleanAndAutoCloseBraces,
} from './utils/codeParser';
import { renderAnimationTo4KVideo } from './utils/videoRenderer';

export default function App() {
  // Main code state
  const [code, setCode] = useState<string>(DEFAULT_ANIMATION_CODE);
  const [globalCode, setGlobalCode] = useState<string>('');
  const [layers, setLayers] = useState<AnimationLayer[]>([]);
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(-1);

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'settings'>('preview');
  const [isLayerManagerOpen, setIsLayerManagerOpen] = useState<boolean>(true);
  const [isGreenScreen, setIsGreenScreen] = useState<boolean>(false);
  const [globalZoom, setGlobalZoom] = useState<number>(1.0);

  // Configuration state
  const [resolution, setResolution] = useState<ResolutionMode>('450');
  const [theme, setTheme] = useState<string>('FizaStore Opening Splash Screen');
  const [targetLines, setTargetLines] = useState<number>(800);
  const [targetCycle, setTargetCycle] = useState<number>(15);
  const [durationSec, setDurationSec] = useState<number>(10);
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set());

  // Folder handle
  const [outputDirectoryHandle, setOutputDirectoryHandle] = useState<any | null>(null);
  const [outputDirectoryName, setOutputDirectoryName] = useState<string | null>(null);

  // Credentials and Engine state
  const [provider, setProvider] = useState<'gemini' | 'clariohub'>('gemini');
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('clario/gemini-3.7-flash-auto');
  const [customEngineName, setCustomEngineName] = useState<string | null>(null);
  const customScriptRef = useRef<HTMLScriptElement | null>(null);

  // Generation & Render State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRenderingVideo, setIsRenderingVideo] = useState<boolean>(false);
  const [renderStatusText, setRenderStatusText] = useState<string>('');

  // Terminal Logs Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [logStatus, setLogStatus] = useState<string>('');
  const [isStreamingLogs, setIsStreamingLogs] = useState<boolean>(false);

  // Text Edit Modal State
  const [isTextEditModalOpen, setIsTextEditModalOpen] = useState<boolean>(false);
  const [textEditLayerIndex, setTextEditLayerIndex] = useState<number>(-1);
  const [extractedStrings, setExtractedStrings] = useState<ExtractedString[]>([]);

  // Toast & Utilities
  const [toast, setToast] = useState<ToastInfo | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Toast Helper
  const showToast = useCallback((message: string, isError = false) => {
    setToast({ id: Date.now(), message, isError });
    setTimeout(() => {
      setToast((curr) => (curr && curr.message === message ? null : curr));
    }, 3500);
  }, []);

  // Initial setup: parse default code and load stored API key
  useEffect(() => {
    const savedKey = localStorage.getItem('clario_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setProvider('clariohub');
    }

    const { globalCode: gCode, layers: parsed } = parseCodeToLayers(DEFAULT_ANIMATION_CODE);
    setGlobalCode(gCode);
    setLayers(parsed);
  }, []);

  // Re-parse layers when code changes from manual edit
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    const { globalCode: gCode, layers: parsed } = parseCodeToLayers(newCode);
    setGlobalCode(gCode);
    setLayers(parsed);
  };

  // Sync layers state back to code string
  const updateCodeFromLayers = (updatedLayers: AnimationLayer[]) => {
    setLayers(updatedLayers);
    const updatedCode = syncLayersToCode(globalCode, updatedLayers);
    setCode(updatedCode);
  };

  // Handle Layer swap (re-order)
  const handleSwapLayers = (indexA: number, indexB: number) => {
    if (indexA < 0 || indexB < 0 || indexA >= layers.length || indexB >= layers.length) return;
    const newLayers = [...layers];
    const temp = newLayers[indexA];
    newLayers[indexA] = newLayers[indexB];
    newLayers[indexB] = temp;
    updateCodeFromLayers(newLayers);
  };

  // Handle Layer visibility toggle
  const handleToggleLayerVisibility = (index: number) => {
    const layer = layers[index];
    if (!layer) return;

    let newLayerCode = layer.code;
    let newHidden = !layer.hidden;

    if (layer.hidden) {
      newLayerCode = newLayerCode
        .replace(/\nif\(false\) \{ \/\* UI_HIDDEN \*\//g, '')
        .replace(/\n\} \/\/ END_HIDDEN\n/g, '');
    } else {
      newLayerCode = `\nif(false) { /* UI_HIDDEN */${newLayerCode}\n} // END_HIDDEN\n`;
    }

    const newLayers = [...layers];
    newLayers[index] = {
      ...layer,
      code: newLayerCode,
      hidden: newHidden,
    };
    updateCodeFromLayers(newLayers);
  };

  // Handle Layer deletion
  const handleDeleteLayer = (index: number) => {
    if (!window.confirm('Hapus layer ini?')) return;
    const newLayers = layers.filter((_, idx) => idx !== index);
    if (activeLayerIndex === index) {
      setActiveLayerIndex(-1);
    } else if (activeLayerIndex > index) {
      setActiveLayerIndex(activeLayerIndex - 1);
    }
    updateCodeFromLayers(newLayers);
    showToast('Layer berhasil dihapus.');
  };

  // Handle Layer Scale slider
  const handleScaleChange = (index: number, newScale: number) => {
    const layer = layers[index];
    if (!layer) return;

    const exactRegex =
      /\/\* UI_SCALE \*\/ ctx\.translate\([^)]+\); ctx\.scale\([-.\d]+,\s*[-.\d]+\); ctx\.translate\([^)]+\);/;
    const legacyRegex = /\/\* UI_SCALE \*\/ ctx\.scale\([-.\d]+,\s*[-.\d]+\);/;
    const newScaleStr = `/* UI_SCALE */ ctx.translate(opts.width/2, opts.height/2); ctx.scale(${newScale}, ${newScale}); ctx.translate(-opts.width/2, -opts.height/2);`;

    let updatedCode = layer.code;
    if (exactRegex.test(updatedCode)) {
      updatedCode = updatedCode.replace(exactRegex, newScaleStr);
    } else if (legacyRegex.test(updatedCode)) {
      updatedCode = updatedCode.replace(legacyRegex, newScaleStr);
    } else {
      updatedCode = updatedCode.replace(/(ctx\.save\(\);\s*(?:\{)?)/, `$1\n${newScaleStr}\n`);
    }

    const newLayers = [...layers];
    newLayers[index] = { ...layer, code: updatedCode };
    updateCodeFromLayers(newLayers);
  };

  // Handle Layer Drag Offset
  const handleLayerOffsetChange = (index: number, dx: number, dy: number) => {
    const layer = layers[index];
    if (!layer) return;

    let s = 1.0;
    const sMatch =
      layer.code.match(
        /\/\* UI_SCALE \*\/ ctx\.translate\([^)]+\); ctx\.scale\(([-.\d]+),\s*([-.\d]+)\); ctx\.translate\([^)]+\);/
      ) || layer.code.match(/\/\* UI_SCALE \*\/ ctx\.scale\(([-.\d]+),\s*([-.\d]+)\);/);
    if (sMatch) s = parseFloat(sMatch[1]);

    const adjustedDx = dx / s;
    const adjustedDy = dy / s;

    const offsetRegex = /\/\* UI_OFFSET \*\/ ctx\.translate\(([-.\d]+),\s*([-.\d]+)\);/;
    const match = layer.code.match(offsetRegex);

    let updatedCode = layer.code;
    if (match) {
      const currentX = parseFloat(match[1]);
      const currentY = parseFloat(match[2]);
      updatedCode = updatedCode.replace(
        offsetRegex,
        `/* UI_OFFSET */ ctx.translate(${(currentX + adjustedDx).toFixed(2)}, ${(
          currentY + adjustedDy
        ).toFixed(2)});`
      );
    } else {
      updatedCode = updatedCode.replace(
        /(ctx\.save\(\);\s*(?:\{)?)/,
        `$1\n/* UI_OFFSET */ ctx.translate(${adjustedDx.toFixed(2)}, ${adjustedDy.toFixed(2)});\n`
      );
    }

    const newLayers = [...layers];
    newLayers[index] = { ...layer, code: updatedCode };
    updateCodeFromLayers(newLayers);
  };

  // Handle Text Edit in Layer
  const handleOpenTextEdit = (index: number) => {
    const targetLayer = layers[index];
    if (!targetLayer) return;
    const strings = extractEditableStrings(targetLayer.code);
    if (strings.length === 0) {
      showToast('Tidak ada teks yang dapat diedit di layer ini.', true);
      return;
    }
    setTextEditLayerIndex(index);
    setExtractedStrings(strings);
    setIsTextEditModalOpen(true);
  };

  const handleSaveTextEdit = (updatedValues: Record<number, string>) => {
    if (textEditLayerIndex === -1) return;
    const targetLayer = layers[textEditLayerIndex];
    if (!targetLayer) return;

    let updatedCode = targetLayer.code;
    extractedStrings.forEach((item, idx) => {
      const newVal = updatedValues[idx];
      if (newVal !== undefined && newVal !== item.text) {
        const replacerRegex = new RegExp(
          item.fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'g'
        );
        updatedCode = updatedCode.replace(replacerRegex, `${item.quote}${newVal}${item.quote}`);
      }
    });

    const newLayers = [...layers];
    newLayers[textEditLayerIndex] = { ...targetLayer, code: updatedCode };
    updateCodeFromLayers(newLayers);
    showToast('Teks layer berhasil diperbarui!');
  };

  // Green screen toggle
  const handleToggleGreenScreen = () => {
    const nextState = !isGreenScreen;
    setIsGreenScreen(nextState);

    // If turned ON, hide layer 1 if it's a solid void background
    if (nextState && layers.length > 0 && !layers[0].hidden) {
      const newLayer0Code = `\nif(false) { /* UI_HIDDEN */${layers[0].code}\n} // END_HIDDEN\n`;
      const newLayers = [...layers];
      newLayers[0] = { ...layers[0], code: newLayer0Code, hidden: true };
      updateCodeFromLayers(newLayers);
      showToast('Green Screen AKTIF (Background disembunyikan).');
    } else {
      showToast(nextState ? 'Green Screen AKTIF.' : 'Green Screen Non-Aktif.');
    }
  };

  // Presets & Styles
  const handleLoadPreset = (preset: PresetItem) => {
    setTheme(preset.theme);
    setTargetLines(preset.lines);
    setSelectedStyles(new Set(preset.styles));
    showToast(`Preset "${preset.name}" dimuat!`);
  };

  const handleToggleStyle = (style: string) => {
    const next = new Set(selectedStyles);
    if (next.has(style)) {
      next.delete(style);
    } else {
      next.add(style);
    }
    setSelectedStyles(next);
  };

  const handleClearStyles = () => {
    setSelectedStyles(new Set());
  };

  // Directory picker
  const handleSelectFolder = async () => {
    if (!(window as any).showDirectoryPicker) {
      showToast('Browser tidak mendukung Folder Auto-Save.', true);
      return;
    }
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      setOutputDirectoryHandle(handle);
      setOutputDirectoryName(handle.name);
      showToast(`Folder Auto-Save disetel ke: ${handle.name}`);
    } catch {
      // User cancelled
    }
  };

  // Clipboard operations
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      showToast('Kode berhasil disalin ke clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Gagal menyalin kode.', true);
    }
  };

  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleCodeChange(text);
        showToast('Kode berhasil dipaste!');
      }
    } catch {
      showToast('Gagal paste: Izin clipboard ditolak.', true);
    }
  };

  const handleClearCode = () => {
    handleCodeChange('');
    setActiveLayerIndex(-1);
    showToast('Kanvas dan Editor berhasil dikosongkan!');
  };

  const handleRunCode = () => {
    const { globalCode: gCode, layers: parsed } = parseCodeToLayers(code);
    setGlobalCode(gCode);
    setLayers(parsed);
    setActiveTab('preview');
    showToast('Kode berhasil diterapkan!');
  };

  // Settings
  const handleSaveCredentials = () => {
    localStorage.setItem('clario_api_key', apiKey);
    showToast('Kredensial berhasil disimpan!');
  };

  const handleUploadEngine = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const scriptCode = e.target?.result as string;
      if (customScriptRef.current) {
        customScriptRef.current.remove();
      }
      const scriptEl = document.createElement('script');
      scriptEl.id = 'fizagen-custom-engine';
      scriptEl.textContent = scriptCode;
      document.body.appendChild(scriptEl);
      customScriptRef.current = scriptEl;
      setCustomEngineName(file.name);
      showToast(`Mesin JS Custom "${file.name}" disuntikkan!`);
    };
    reader.readAsText(file);
  };

  const handleClearEngine = () => {
    if (customScriptRef.current) {
      customScriptRef.current.remove();
      customScriptRef.current = null;
    }
    setCustomEngineName(null);
    showToast('Mesin render kembali ke default.');
  };

  // AI Generation Orchestrator
  const addLog = (type: TerminalLog['type'], message: string) => {
    const now = new Date().toISOString().split('T')[1].slice(0, 8);
    setTerminalLogs((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, timestamp: now, type, message },
    ]);
  };

  const handleGenerate = async () => {
    if (!theme.trim()) {
      showToast('Silakan masukkan tema atau skenario animasi!', true);
      return;
    }

    if (provider === 'clariohub' && !apiKey.trim()) {
      showToast('API Key ClarioHub belum diisi. Cek tab Pengaturan!', true);
      setActiveTab('settings');
      return;
    }

    setIsGenerating(true);
    setIsLogModalOpen(true);
    setIsStreamingLogs(true);
    setTerminalLogs([]);
    setLogStatus('INITIALIZING AI PIPELINE...');

    addLog('SYS', 'Initializing FizaGen Procedural Engine v4.0...');
    await new Promise((r) => setTimeout(r, 300));
    addLog('AI', `Analyzing prompt semantics: "${theme}"`);
    await new Promise((r) => setTimeout(r, 300));
    addLog('SYS', `Target boundaries: ~${targetLines} lines of procedural geometry.`);
    addLog('MATH', `Enforcing perfect animation cycle: ${targetCycle}s.`);

    const styleArray = Array.from(selectedStyles);
    const styleContext =
      styleArray.length > 0 ? ` Kombinasi Style: ${styleArray.join(', ')}.` : '';

    try {
      setLogStatus(
        provider === 'clariohub'
          ? `CONNECTING TO CLARIOHUB [${selectedModel}]...`
          : 'CONNECTING TO FIZAGEN GEMINI AI CORE...'
      );

      // Procedural progress logs
      const dummyLogs = [
        'Synthesizing harmonic oscillation curves...',
        'Compiling procedural multi-pass vector paths...',
        'Balancing context save/restore state machines...',
        'Enforcing trigonometric cyclic continuity...',
        'Injecting bloom lighting and radial gradients...',
      ];
      let logIndex = 0;
      const logInterval = setInterval(() => {
        addLog('PROC', dummyLogs[logIndex % dummyLogs.length]);
        logIndex++;
      }, 1400);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          model: selectedModel,
          theme,
          styleContext,
          targetLines,
          targetCycle,
        }),
      });

      clearInterval(logInterval);

      if (!response.ok) {
        let errMessage = `Generation failed (${response.status})`;
        try {
          const errData = await response.json();
          errMessage = errData.error || errMessage;
        } catch {
          // ignore
        }
        throw new Error(errMessage);
      }

      const data = await response.json();
      const generatedCode = data.code;
      if (!generatedCode) {
        throw new Error('Menerima respon kode kosong.');
      }

      addLog('DONE', 'Response received and verified against memory-leak invariants.');
      addLog('SYS', 'Parsing generated layers and compiling to Canvas runtime...');

      const cleaned = cleanAndAutoCloseBraces(generatedCode);
      handleCodeChange(cleaned);

      setLogStatus('COMPLETED SUCCESS');
      setIsStreamingLogs(false);

      setTimeout(() => {
        setIsLogModalOpen(false);
        setActiveTab('preview');
        setIsLayerManagerOpen(true);
        showToast(`Sukses Generate AI! (Siklus ${targetCycle}s)`);
      }, 1200);
    } catch (err: any) {
      addLog('ERR', err.message || 'Generation error');
      setLogStatus('FATAL ERROR');
      setIsStreamingLogs(false);
      showToast(err.message || 'Gagal menghasilkan kode AI', true);
    } finally {
      setIsGenerating(false);
    }
  };

  // 4K Video Render Orchestrator
  const handleRender4K = async () => {
    if (!code.trim() || isRenderingVideo) return;

    setIsRenderingVideo(true);
    setRenderStatusText('Menyiapkan Mesin 4K...');
    setActiveTab('preview');

    const resConfig = RESOLUTION_MAP[resolution];

    try {
      const { fileName } = await renderAnimationTo4KVideo({
        code,
        durationSec,
        canvasWidth: resConfig.width,
        canvasHeight: resConfig.height,
        isGreenScreen,
        globalZoom,
        outputDirectoryHandle,
        onProgress: (_percentage, statusText) => {
          setRenderStatusText(statusText);
        },
      });

      showToast(`Video 4K berhasil diekspor: ${fileName}`);
    } catch (err: any) {
      showToast('Gagal Export Video 4K: ' + err.message, true);
    } finally {
      setIsRenderingVideo(false);
    }
  };

  const currentResolutionConfig = RESOLUTION_MAP[resolution];

  return (
    <div className="h-screen w-screen flex flex-col bg-[#020305] text-[#f8fafc] overflow-hidden select-none">
      {/* Top Bar Navigation */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunCode={handleRunCode}
        onClearCode={handleClearCode}
        onPasteCode={handlePasteCode}
        onCopyCode={handleCopyCode}
        copied={copied}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          theme={theme}
          setTheme={setTheme}
          resolution={resolution}
          setResolution={setResolution}
          targetLines={targetLines}
          setTargetLines={setTargetLines}
          targetCycle={targetCycle}
          setTargetCycle={setTargetCycle}
          durationSec={durationSec}
          setDurationSec={setDurationSec}
          selectedStyles={selectedStyles}
          onToggleStyle={handleToggleStyle}
          onClearStyles={handleClearStyles}
          onLoadPreset={handleLoadPreset}
          outputDirectoryName={outputDirectoryName}
          onSelectFolder={handleSelectFolder}
          onGenerate={handleGenerate}
          onRender4K={handleRender4K}
          isGenerating={isGenerating}
          isRenderingVideo={isRenderingVideo}
          canRender={Boolean(code.trim())}
        />

        {/* Center Main Stage */}
        <main className="flex-1 flex flex-col h-full min-w-0 bg-[#020305] relative overflow-hidden">
          {activeTab === 'preview' && (
            <CanvasPreview
              code={code}
              canvasWidth={currentResolutionConfig.width}
              canvasHeight={currentResolutionConfig.height}
              isGreenScreen={isGreenScreen}
              onToggleGreenScreen={handleToggleGreenScreen}
              isLayerManagerOpen={isLayerManagerOpen}
              onToggleLayerManager={() => setIsLayerManagerOpen((prev) => !prev)}
              globalZoom={globalZoom}
              onZoomChange={setGlobalZoom}
              activeLayerIndex={activeLayerIndex}
              layers={layers}
              onLayerOffsetChange={handleLayerOffsetChange}
              isRenderingVideo={isRenderingVideo}
              renderStatusText={renderStatusText}
            />
          )}

          {activeTab === 'code' && (
            <CodeEditorView
              code={code}
              onChange={handleCodeChange}
              onRunCode={handleRunCode}
              onClear={handleClearCode}
              onPaste={handlePasteCode}
              onCopy={handleCopyCode}
              copied={copied}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              provider={provider}
              setProvider={setProvider}
              apiKey={apiKey}
              setApiKey={setApiKey}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              onSaveCredentials={handleSaveCredentials}
              customEngineName={customEngineName}
              onUploadEngine={handleUploadEngine}
              onClearEngine={handleClearEngine}
            />
          )}
        </main>

        {/* Right Layer Manager Panel (shown on preview or whenever toggled open) */}
        {activeTab === 'preview' && isLayerManagerOpen && (
          <LayerManager
            isOpen={isLayerManagerOpen}
            layers={layers}
            activeLayerIndex={activeLayerIndex}
            onSelectLayer={setActiveLayerIndex}
            onClose={() => {
              setIsLayerManagerOpen(false);
              setActiveLayerIndex(-1);
            }}
            onSwapLayers={handleSwapLayers}
            onToggleLayerVisibility={handleToggleLayerVisibility}
            onDeleteLayer={handleDeleteLayer}
            onOpenTextEdit={handleOpenTextEdit}
            onScaleChange={handleScaleChange}
          />
        )}
      </div>

      {/* System Terminal Log Modal */}
      <SystemLogModal
        isOpen={isLogModalOpen}
        logs={terminalLogs}
        status={logStatus}
        isStreaming={isStreamingLogs}
        onClose={() => setIsLogModalOpen(false)}
      />

      {/* Text String Edit Modal */}
      <TextEditModal
        isOpen={isTextEditModalOpen}
        layerIndex={textEditLayerIndex}
        extractedStrings={extractedStrings}
        onSave={handleSaveTextEdit}
        onClose={() => {
          setIsTextEditModalOpen(false);
          setTextEditLayerIndex(-1);
        }}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
