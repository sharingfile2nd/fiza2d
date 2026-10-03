import { PresetItem, ResolutionConfig, ResolutionMode } from '../types';

export const RESOLUTION_MAP: Record<ResolutionMode, ResolutionConfig> = {
  '450': { width: 800, height: 450, label: 'Standard (800 x 450) - Optimal', badge: '800x450' },
  '720': { width: 1280, height: 720, label: 'HD (1280 x 720)', badge: '1280x720' },
  '1080': { width: 1920, height: 1080, label: 'Full HD (1920 x 1080)', badge: '1920x1080' },
};

export const STYLE_DATABASE: Record<string, string[]> = {
  '🎨 Palet Warna': [
    'Neon Cyberpunk',
    'Matrix Green',
    'Dark Mode Minimalist',
    'Deep Ocean Blue',
    'Bioluminescent',
    'Golden Hour',
  ],
  '✨ Efek Visual': [
    'Intense Bloom & Glow',
    'Radial Lighting Gradients',
    'Multi-Pass Parallax',
    'Chromatic Aberration',
  ],
  '📐 Bentuk & Struktur': [
    'Geometric Abstract',
    'Fluid / Liquid Organic',
    'Particle Swarm',
    'Digital Grid / Matrix',
  ],
  '🌀 Gerakan Halus': [
    'Harmonic Oscillation',
    'Smooth Easing & Inertia',
    'Pulsing Heartbeat',
    'Infinite Tunnel Zoom',
  ],
};

export const PRESET_LIST: PresetItem[] = [
  {
    name: 'Motion Graphics',
    theme: 'Motion Graphics Intro Logotype',
    styles: ['Smooth Easing & Inertia', 'Geometric Abstract', 'Dark Mode Minimalist'],
    lines: 500,
    icon: 'Shapes',
    color: 'text-cyan-400',
  },
  {
    name: 'Fluid Dynamics',
    theme: 'Fluid Dynamics Simulation & Particles',
    styles: ['Fluid / Liquid Organic', 'Particle Swarm', 'Deep Ocean Blue'],
    lines: 600,
    icon: 'Droplet',
    color: 'text-purple-400',
  },
  {
    name: 'Cyber HUD',
    theme: 'Cybernetic HUD Interface & Radar',
    styles: ['Neon Cyberpunk', 'Futuristic HUD/UI', 'Wireframe 3D'],
    lines: 550,
    icon: 'Crosshair',
    color: 'text-emerald-400',
  },
  {
    name: 'Sound Waves',
    theme: 'Audio Visualizer & Sound Waves',
    styles: ['Pulsing Heartbeat', 'Harmonic Oscillation', 'Neon Cyberpunk'],
    lines: 450,
    icon: 'Activity',
    color: 'text-amber-400',
  },
];

export const DEFAULT_ANIMATION_CODE = `// FizaGen - Opening Splash Screen
// Abstract Geometry & Deep Matte Theme

const centerX = opts.width / 2;
const centerY = opts.height / 2;
const baseSize = Math.min(opts.width, opts.height);

// --- Layer 1: Deep Matte Void ---
ctx.save();
{
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, opts.width, opts.height);
    
    const cycleT = (t % 15) / 15;
    const pulse = Math.sin(cycleT * Math.PI * 2) * 0.5 + 0.5;
    
    const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, opts.width * 0.8);
    grad.addColorStop(0, \`rgba(0, 150, 255, \${0.05 + pulse * 0.05})\`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, opts.width, opts.height);
}
ctx.restore();

// --- Layer 2: Abstract Bezier Grid ---
ctx.save();
{
    ctx.translate(centerX, centerY);
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
    ctx.lineWidth = 1;
    
    for(let i = 0; i < 360; i += 15) {
        const rad = (i * Math.PI) / 180 + t * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
            Math.cos(rad) * baseSize * 0.2, Math.sin(rad) * baseSize * 0.2,
            Math.cos(rad + Math.PI/4) * baseSize * 0.4, Math.sin(rad + Math.PI/4) * baseSize * 0.4,
            Math.cos(rad) * baseSize * 0.6, Math.sin(rad) * baseSize * 0.6
        );
        ctx.stroke();
    }
}
ctx.restore();

// --- Layer 3: FIZAGEN 3D Typography ---
ctx.save();
{
    ctx.translate(centerX, centerY - 20);
    const float = Math.sin((t % 15) / 15 * Math.PI * 2);
    ctx.translate(0, float * 15);
    
    const text = "FIZAGEN 2D";
    ctx.font = '900 64px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const depth = 8;
    for(let i = depth; i >= 0; i--) {
        ctx.save();
        ctx.translate(0, i * 1.5); 
        
        if (i === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#00f2fe';
            ctx.fillText(text, 0, 0);
        } else {
            ctx.fillStyle = \`rgba(0, 100, 150, \${1 - (i/depth)})\`;
            ctx.fillText(text, 0, 0);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#00f2fe';
            ctx.strokeText(text, 0, 0);
        }
        ctx.restore();
    }
}
ctx.restore();`;
