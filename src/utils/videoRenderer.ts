import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

export interface RenderProgressCallback {
  (percentage: number, statusText: string): void;
}

export async function renderAnimationTo4KVideo({
  code,
  durationSec,
  canvasWidth,
  canvasHeight,
  isGreenScreen,
  globalZoom,
  outputDirectoryHandle,
  onProgress,
}: {
  code: string;
  durationSec: number;
  canvasWidth: number;
  canvasHeight: number;
  isGreenScreen: boolean;
  globalZoom: number;
  outputDirectoryHandle: any | null;
  onProgress: RenderProgressCallback;
}): Promise<{ fileName: string; blob: Blob }> {
  let renderFn: Function;
  try {
    renderFn = new Function('ctx', 'opts', 't', code);
  } catch (err: any) {
    throw new Error('Syntax error during video preparation:\n' + err.message);
  }

  const exportWidth = 3840;
  const exportHeight = 2160;
  let fps = 60;

  if (typeof (window as any).VideoEncoder === 'undefined') {
    throw new Error('Your browser does not support WebCodecs (VideoEncoder is undefined).');
  }

  // Create canvas for 4K rendering
  let exportCanvas: HTMLCanvasElement | OffscreenCanvas;
  if (typeof OffscreenCanvas !== 'undefined') {
    exportCanvas = new OffscreenCanvas(exportWidth, exportHeight);
  } else {
    exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
  }

  const exportCtx = exportCanvas.getContext('2d', { alpha: false }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;

  if (!exportCtx) {
    throw new Error('Unable to create 2D context on 4K Export Canvas.');
  }

  const scaleX = exportWidth / canvasWidth;
  const scaleY = exportHeight / canvasHeight;

  const muxerTarget = new ArrayBufferTarget();
  const muxer = new Muxer({
    target: muxerTarget,
    video: {
      codec: 'avc',
      width: exportWidth,
      height: exportHeight,
    },
    fastStart: 'in-memory',
  });

  let encoderError: any = null;
  const videoEncoder = new (window as any).VideoEncoder({
    output: (chunk: any, meta: any) => muxer.addVideoChunk(chunk, meta),
    error: (e: any) => {
      console.error('VideoEncoder Runtime Error:', e);
      encoderError = e;
    },
  });

  let encoderConfig: any = {
    codec: 'avc1.640034',
    width: exportWidth,
    height: exportHeight,
    bitrate: 35_000_000,
    framerate: fps,
    hardwareAcceleration: 'prefer-hardware',
  };

  let support = await (window as any).VideoEncoder.isConfigSupported(encoderConfig);
  if (!support.supported) {
    fps = 30;
    encoderConfig.framerate = fps;
    encoderConfig.codec = 'avc1.42E034';
    encoderConfig.hardwareAcceleration = 'prefer-software';
    support = await (window as any).VideoEncoder.isConfigSupported(encoderConfig);
    if (!support.supported) {
      throw new Error('Hardware / software encoder rejected 4K recording profile.');
    }
  }

  videoEncoder.configure(encoderConfig);
  const totalFrames = durationSec * fps;
  let currentFrame = 0;

  onProgress(0, 'Preparing 4K Engine...');

  while (currentFrame < totalFrames) {
    if (encoderError) {
      throw new Error('Encoder encountered error: ' + (encoderError.message || encoderError));
    }

    const batchStartTime = performance.now();
    while (currentFrame < totalFrames && performance.now() - batchStartTime < 30) {
      if (videoEncoder.encodeQueueSize > 5) break;

      const t = currentFrame / fps;
      const opts = { width: canvasWidth, height: canvasHeight };

      exportCtx.fillStyle = isGreenScreen ? '#00FF00' : '#000000';
      exportCtx.fillRect(0, 0, exportWidth, exportHeight);

      exportCtx.save();
      exportCtx.scale(scaleX, scaleY);
      if (globalZoom !== 1.0) {
        exportCtx.translate(opts.width / 2, opts.height / 2);
        exportCtx.scale(globalZoom, globalZoom);
        exportCtx.translate(-opts.width / 2, -opts.height / 2);
      }

      let ctxPushes = 0;
      const safeExportCtx = new Proxy(exportCtx, {
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
        renderFn(safeExportCtx, opts, t);
      } catch (err: any) {
        while (ctxPushes > 0) {
          exportCtx.restore();
          ctxPushes--;
        }
        exportCtx.restore();
        throw new Error(`Render failed at frame ${currentFrame}:\n${err.message}`);
      }

      while (ctxPushes > 0) {
        exportCtx.restore();
        ctxPushes--;
      }
      exportCtx.restore();

      if (videoEncoder.state !== 'configured') {
        throw new Error('VideoEncoder terminated unexpectedly.');
      }

      const frame = new (window as any).VideoFrame(exportCanvas, {
        timestamp: (currentFrame * 1e6) / fps,
      });
      videoEncoder.encode(frame);
      frame.close();
      currentFrame++;
    }

    const pct = Math.round((currentFrame / totalFrames) * 100);
    onProgress(pct, `REC 4K: ${pct}%`);
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  onProgress(100, 'Encoding MP4 container...');
  await videoEncoder.flush();
  muxer.finalize();

  const blob = new Blob([muxerTarget.buffer], { type: 'video/mp4' });
  const fileName = `FizaGen-4K-${Date.now()}.mp4`;

  // Auto-save to directory handle if available
  if (outputDirectoryHandle && typeof outputDirectoryHandle.getFileHandle === 'function') {
    try {
      const fileHandle = await outputDirectoryHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { fileName, blob };
    } catch (fsErr) {
      console.warn('File System auto-save failed, triggering browser download:', fsErr);
      fallbackBrowserDownload(blob, fileName);
      return { fileName, blob };
    }
  } else {
    fallbackBrowserDownload(blob, fileName);
    return { fileName, blob };
  }
}

export function fallbackBrowserDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
