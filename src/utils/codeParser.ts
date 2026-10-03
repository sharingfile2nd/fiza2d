import { AnimationLayer, ExtractedString } from '../types';

export function parseCodeToLayers(code: string): { globalCode: string; layers: AnimationLayer[] } {
  const layerSplit = code.split(/(\/\/ --- Layer \d+:[^\n]*---)/i);
  if (layerSplit.length <= 1) {
    return { globalCode: code, layers: [] };
  }

  const globalCode = layerSplit[0];
  const layers: AnimationLayer[] = [];

  for (let i = 1; i < layerSplit.length; i += 2) {
    const rawTitle = layerSplit[i];
    const layerCode = layerSplit[i + 1] || '';
    const cleanTitle = rawTitle.replace(/\/\/ --- Layer \d+:/i, '').replace('---', '').trim();
    const isHidden = layerCode.includes('/* UI_HIDDEN */');

    layers.push({
      id: `layer-${(i - 1) / 2}-${Date.now()}`,
      title: cleanTitle || `Layer ${(i + 1) / 2}`,
      rawTitle,
      code: layerCode,
      hidden: isHidden,
    });
  }

  return { globalCode, layers };
}

export function syncLayersToCode(globalCode: string, layers: AnimationLayer[]): string {
  let newCode = globalCode;
  layers.forEach((layer, idx) => {
    const titleParts = layer.rawTitle.split(':');
    const updatedRawTitle =
      titleParts.length > 1
        ? `// --- Layer ${idx + 1}:${titleParts.slice(1).join(':')}`
        : `// --- Layer ${idx + 1}: ${layer.title} ---`;
    newCode += updatedRawTitle + layer.code;
  });
  return newCode;
}

export function extractEditableStrings(code: string): ExtractedString[] {
  const regex = /(["'`])([^"'`\n]+)\1/g;
  const matches: ExtractedString[] = [];
  let match: RegExpExecArray | null;

  const ignoreList = [
    'screen',
    'lighter',
    'multiply',
    'monospace',
    'sans-serif',
    'center',
    'left',
    'right',
    'bold',
    'italic',
    'transparent',
    'source-over',
    'use strict',
  ];

  while ((match = regex.exec(code)) !== null) {
    const quote = match[1];
    const text = match[2];

    if (
      text.length <= 1 ||
      text.startsWith('#') ||
      text.startsWith('rgba') ||
      text.startsWith('rgb(') ||
      !isNaN(Number(text)) ||
      text.includes('${') ||
      ignoreList.includes(text.toLowerCase())
    ) {
      continue;
    }

    if (!matches.find((m) => m.text === text)) {
      matches.push({ quote, text, fullMatch: match[0] });
    }
  }

  return matches;
}

export function cleanAndAutoCloseBraces(text: string): string {
  let cleanCode = text;
  const match = text.match(/```(?:javascript|js)?\s*\n([\s\S]*?)(?:```|$)/i);
  if (match) cleanCode = match[1];

  cleanCode = cleanCode.replace(/^```(javascript|js)?/i, '').replace(/```$/i, '');
  cleanCode = cleanCode.replace(/<script[^>]*>/gi, '').replace(/<\/script>/gi, '');
  cleanCode = cleanCode.trim();

  const openBraces = (cleanCode.match(/\{/g) || []).length;
  const closeBraces = (cleanCode.match(/\}/g) || []).length;

  if (openBraces > closeBraces) {
    const diff = openBraces - closeBraces;
    for (let i = 0; i < diff; i++) {
      cleanCode += '\n}\nif(typeof ctx !== "undefined") { ctx.restore(); }\n';
    }
  }

  return cleanCode;
}
