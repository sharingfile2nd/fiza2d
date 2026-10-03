import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// AI Generation route (supporting built-in Gemini and ClarioHub proxy)
app.post('/api/generate', async (req: Request, res: Response) => {
  const {
    provider = 'gemini',
    apiKey,
    model = 'gemini-2.5-flash',
    theme,
    styleContext = '',
    targetLines = 800,
    targetCycle = 15,
  } = req.body;

  if (!theme || typeof theme !== 'string') {
    return res.status(400).json({ error: 'Theme is required' });
  }

  const targetLayers = Math.max(3, Math.floor(targetLines / 60));

  const systemInstruction = `You are a Master HTML5 Canvas Procedural Animation Coder.
Your task is to write EXACTLY the raw Javascript code requested.
RULES:
1. ONLY output raw JavaScript. NO markdown formatting, NO html tags, NO conversational text.
2. The code will be run in a 60FPS loop where \`opts\` ({width, height}), \`t\` (time in seconds), and \`ctx\` (CanvasRenderingContext2D) are already defined globally.
3. CRITICAL LOOP & CONTEXT PROTECTION: You are generating up to ${targetLines} lines. To prevent memory leaks:
   - EVERY \`ctx.save()\` MUST have EXACTLY ONE matching \`ctx.restore()\` within the same block.
   - DO NOT create large arrays or objects inside the loop. Calculate positions purely procedurally based on 't'.
   - Maximum iterations for any 'for-loop' must not exceed 600 per layer frame to prevent browser freeze.
4. PERFECT ANIMATION CYCLE: The animation MUST perfectly loop every ${targetCycle} seconds. Use trigonometric functions tuned to this cycle.
5. Structure the animation into EXACTLY ${targetLayers} distinct layers using comments like \`// --- Layer 1: [Name] ---\`.
6. Make it look visually stunning, highly dense, premium, and extremely smooth.
7. To reach ${targetLines} lines, write exhaustive, highly detailed geometric path logic.
8. CRITICAL SYNTAX CHECK: Ensure every open bracket '{' or '(' is properly closed. The output MUST be a valid, runnable JavaScript code block without any truncation.`;

  const userPrompt = `Buatkan kode animasi canvas dengan Tema: "${theme}".${styleContext} Target Kerumitan: Sekitar ${targetLines} baris kode. Target Siklus Animasi (Perfect Loop): ${targetCycle} detik. Animasi ini sangat kompleks, dinamis bergantung pada waktu (t) dan mutlak bebas dari memory leak.`;

  try {
    // If ClarioHub provider is explicitly selected or if user supplied ClarioHub key
    if (provider === 'clariohub' || (apiKey && apiKey.startsWith('sk-') && provider !== 'gemini')) {
      if (!apiKey) {
        return res.status(400).json({ error: 'ClarioHub API Key is required when using ClarioHub provider' });
      }

      const clarioModel = model.startsWith('clario/') ? model : 'clario/gemini-3.7-flash-auto';
      const clarioResponse = await fetch('https://api-direct.clariohub.id/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: clarioModel,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!clarioResponse.ok) {
        let errMessage = `ClarioHub HTTP ${clarioResponse.status}: ${clarioResponse.statusText}`;
        try {
          const errData = await clarioResponse.json();
          errMessage = errData.error?.message || errData.message || errMessage;
        } catch {
          // ignore
        }
        return res.status(clarioResponse.status).json({ error: errMessage });
      }

      const data = await clarioResponse.json();
      const content = data.choices?.[0]?.message?.content || '';
      return res.json({ code: cleanGeneratedCode(content) });
    }

    // Default: Built-in Gemini Engine using injected environment key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in environment. Please supply a ClarioHub API Key in Settings or set GEMINI_API_KEY.',
      });
    }

    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const content = response.text || '';
    if (!content) {
      return res.status(500).json({ error: 'Model returned empty response' });
    }

    return res.json({ code: cleanGeneratedCode(content) });
  } catch (error: any) {
    console.error('Generation error:', error);
    return res.status(500).json({ error: error.message || 'Internal error during generation' });
  }
});

function cleanGeneratedCode(text: string): string {
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

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FizaGen 2D Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
