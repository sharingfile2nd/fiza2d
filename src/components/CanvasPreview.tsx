import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Layers,
  Sparkles,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  Radio,
  Sliders,
} from 'lucide-react';
import { AnimationLayer } from '../types';

interface CanvasPreviewProps {
  code: string;
  canvasWidth: number;
  canvasHeight: number;
  isGreenScreen: boolean;
  onToggleGreenScreen: () => void;
  isLayerManagerOpen: boolean;
  onToggleLayerManager: () => void;
  globalZoom: number;
  onZoomChange: (newZoom: number) => void;
  activeLayerIndex: number;
  layers: AnimationLayer[];
  onLayerOffsetChange: (index: number, dx: number, dy: number) => void;
  isRenderingVideo: boolean;
  renderStatusText: string;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  code,
  canvasWidth,
  canvasHeight,
  isGreenScreen,
  onToggleGreenScreen,
  isLayerManagerOpen,
  onToggleLayerManager,
  globalZoom,
  onZoomChange,
  activeLayerIndex,
  layers,
  onLayerOffsetChange,
  isRenderingVideo,
  renderStatusText,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fps, setFps] = useState<number>(60);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Dragging state for layer offset
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const animFrameIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const framesCountRef = useRef<number>(0);
  const lastFpsTimeRef = useRef<number>(performance.now());

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setErrorText(null);
    let renderFn: Function | null = null;

    try {
      renderFn = new Function('ctx', 'opts', 't', code);
    } catch (err: any) {
      setErrorText('Syntax Error kompilasi:\n' + err.message);
      return;
    }

    if (isRenderingVideo) return;

    let isRunning = true;
    const realCtx = canvas.getContext('2d');
    if (!realCtx) return;

    const loop = (now: number) => {
      const t = (now - startTimeRef.current) / 1000;
      framesCountRef.current++;

      if (now - lastFpsTimeRef.current >= 1000) {
        setFps(framesCountRef.current);
        framesCountRef.current = 0;
        lastFpsTimeRef.current = now;
      }

      const opts = { width: canvas.width, height: canvas.height };

      realCtx.fillStyle = isGreenScreen ? '#00FF00' : '#000000';
      realCtx.fillRect(0, 0, opts.width, opts.height);

      realCtx.save();
      if (globalZoom !== 1.0) {
        realCtx.translate(opts.width / 2, opts.height / 2);
        realCtx.scale(globalZoom, globalZoom);
        realCtx.translate(-opts.width / 2, -opts.height / 2);
      }

      // Security Context Proxy: Prevents memory leaks / unbalance
      let ctxPushes = 0;
      const safeCtx = new Proxy(realCtx, {
        get(target: any, prop: string | symbol) {
          if (prop === 'save') {
            return () => {
              ctxPushes++;
              target.save();
            };
          }
          if (prop === 'restore') {
            return () => {
              if (ctxPushes > 0) {
                ctxPushes--;
                target.restore();
              }
            };
          }
          const val = target[prop];
          return typeof val === 'function' ? val.bind(target) : val;
        },
        set(target: any, prop: string | symbol, value: any) {
          target[prop] = value;
          return true;
        },
      });

      try {
        if (renderFn) {
          renderFn(safeCtx, opts, t);
        }
      } catch (err: any) {
        isRunning = false;
        setErrorText('Runtime Error saat eksekusi Loop:\n' + err.message);
        return;
      }

      while (ctxPushes > 0) {
        realCtx.restore();
        ctxPushes--;
      }
      realCtx.restore();

      if (isRunning && !isRenderingVideo) {
        animFrameIdRef.current = requestAnimationFrame(loop);
      }
    };

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }
    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [code, canvasWidth, canvasHeight, isGreenScreen, globalZoom, isRenderingVideo]);

  // Handle Canvas drag for moving the active layer
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (activeLayerIndex === -1 || layers[activeLayerIndex]?.hidden) return;
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    },
    [activeLayerIndex, layers]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDraggingRef.current || activeLayerIndex === -1) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width / globalZoom;
      const scaleY = canvas.height / rect.height / globalZoom;
      const dx = (e.clientX - dragStartRef.current.x) * scaleX;
      const dy = (e.clientY - dragStartRef.current.y) * scaleY;

      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        onLayerOffsetChange(activeLayerIndex, dx, dy);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
      }
    },
    [activeLayerIndex, globalZoom, onLayerOffsetChange]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  return (
    <div
      className="flex-1 flex bg-[#010203] relative items-center justify-center overflow-hidden w-full h-full select-none"
      onMouseUp={handleMouseUp}
    >
      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        className={`max-w-full max-h-full object-contain transition-transform shadow-2xl rounded-sm ${
          activeLayerIndex !== -1 ? 'cursor-move ring-1 ring-[#00f2fe]/40' : 'cursor-default'
        }`}
      />

      {/* Top Left Floating HUD Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-30">
        <div className="bg-black/70 backdrop-blur-md border border-white/[0.08] text-xs font-mono px-3.5 py-1.5 rounded-xl text-slate-300 flex items-center gap-4 shadow-xl">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>FPS:</span>
            <span className="text-[#00f2fe] font-bold">{fps}</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1">
            <span>RES:</span>
            <span className="text-[#00d2fe] font-bold">
              {canvasWidth}x{canvasHeight}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLayerManager}
            className={`font-semibold px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg ${
              isLayerManagerOpen
                ? 'bg-[#00f2fe] text-[#05070d] font-bold'
                : 'bg-black/70 hover:bg-black/90 text-slate-200 border border-white/[0.08]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Layer Manager</span>
          </button>

          <button
            onClick={onToggleGreenScreen}
            className={`font-semibold px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg border ${
              isGreenScreen
                ? 'bg-emerald-500 text-[#05070d] font-bold border-emerald-400 shadow-emerald-500/20'
                : 'bg-black/70 hover:bg-black/90 text-emerald-400 border-white/[0.08]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Green Screen</span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md border border-white/[0.08] p-1 rounded-xl w-fit shadow-xl">
          <button
            onClick={() => onZoomChange(Math.max(0.2, Number((globalZoom - 0.1).toFixed(1))))}
            className="p-1.5 bg-white/[0.04] hover:bg-white/[0.1] rounded-lg text-slate-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-[#00f2fe] font-bold w-12 text-center">
            {Math.round(globalZoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(3.0, Number((globalZoom + 0.1).toFixed(1))))}
            className="p-1.5 bg-white/[0.04] hover:bg-white/[0.1] rounded-lg text-slate-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4K Video Recording Overlay */}
      {isRenderingVideo && (
        <div className="absolute top-4 right-4 bg-rose-950/85 backdrop-blur-md border border-rose-600/40 text-rose-200 px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-3 shadow-2xl animate-pulse z-40">
          <Radio className="w-4 h-4 text-rose-500 animate-spin" />
          <span className="font-bold tracking-wider">{renderStatusText}</span>
        </div>
      )}

      {/* Layer Dragging Active Banner */}
      {activeLayerIndex !== -1 && !isRenderingVideo && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-[#00f2fe]/40 text-[#00f2fe] px-4 py-1.5 rounded-full text-xs font-mono flex items-center gap-2 shadow-2xl z-30">
          <Sliders className="w-3.5 h-3.5" />
          <span>Layer aktif: {layers[activeLayerIndex]?.title || `#${activeLayerIndex + 1}`} (Drag kanvas untuk offset)</span>
        </div>
      )}

      {/* Runtime / Syntax Error Overlay */}
      {errorText && (
        <div className="absolute inset-6 bg-rose-950/90 backdrop-blur-xl border border-rose-600/40 rounded-2xl p-6 flex flex-col justify-center overflow-auto z-40 shadow-2xl animate-in fade-in">
          <div className="flex items-center gap-2.5 text-rose-300 font-bold text-base mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <h3>Runtime Error Ditangani</h3>
          </div>
          <pre className="text-rose-200 text-xs font-mono whitespace-pre-wrap mb-4 bg-black/60 p-4 rounded-xl border border-rose-900/50 max-h-60 overflow-y-auto">
            {errorText}
          </pre>
          <p className="text-slate-400 text-xs">
            Proteksi kebocoran memori telah aktif. Silakan periksa sintaks atau struktur loop di Tab Raw Editor.
          </p>
        </div>
      )}
    </div>
  );
};
