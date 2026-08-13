import confetti from 'canvas-confetti';
import { BuilderData } from '../types/builder';
import { createCardFrontCanvas, loadFonts } from './cardRenderer2D';
import { sounds } from './soundEffects';

export async function downloadCrewManifest(
  crew: BuilderData[],
  format: 'png' | 'jpeg' = 'png'
): Promise<boolean> {
  try {
    sounds.playSuccess();
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD166', '#FF2A85', '#00F0FF', '#164E43']
    });

    await loadFonts();

    // Export Master Composition Canvas: 2400 x 1600
    const w = 2400;
    const h = 1600;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context failed');

    // Background
    const bgGrad = ctx.createRadialGradient(w/2, h/2, h*0.1, w/2, h/2, w*0.8);
    bgGrad.addColorStop(0, '#0D382C');
    bgGrad.addColorStop(1, '#03100B');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Decorative Borders
    ctx.strokeStyle = 'rgba(227,197,120,0.3)';
    ctx.lineWidth = 4;
    ctx.strokeRect(80, 80, w - 160, h - 160);
    ctx.strokeStyle = 'rgba(255,42,133,0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 100, w - 200, h - 200);

    // Check optional team name
    const teamNameStr = (crew.find((m) => m.teamName && m.teamName.trim().length > 0)?.teamName || '').trim().toUpperCase();

    // Title Section
    ctx.fillStyle = '#FAF6EE';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '900 76px sans-serif';
    
    if (teamNameStr) {
      ctx.fillText(`THE BUILD CREW // ${teamNameStr}`, w / 2, 135);
    } else {
      ctx.fillText('THE BUILD CREW', w / 2, 135);
    }
    
    ctx.fillStyle = '#E3C578';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`HACKER HOUSE GOA 2026 // SQUAD OF ${crew.length.toString().padStart(2, '0')} BUILDERS`, w / 2, 235);

    // Grid Layout for Cards
    const cols = crew.length > 4 ? 3 : crew.length > 1 ? 2 : 1;
    const rows = Math.ceil(crew.length / cols);
    
    // Scale card based on grid size
    const availableWidth = w - 400;
    const availableHeight = h - 600; // leaves room for header and footer
    
    let cardW = Math.min(600, availableWidth / cols - 40);
    let cardH = cardW / 1.5873;
    
    if (cardH * rows > availableHeight) {
      cardH = availableHeight / rows - 40;
      cardW = cardH * 1.5873;
    }

    const startX = (w - (cardW * cols + (cols - 1) * 40)) / 2;
    const startY = 320 + (availableHeight - (cardH * rows + (rows - 1) * 40)) / 2;

    for (let i = 0; i < crew.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + 40);
      const y = startY + row * (cardH + 40);

      const cardCanvas = await createCardFrontCanvas(crew[i]);
      
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
      ctx.drawImage(cardCanvas, x, y, cardW, cardH);
      ctx.shadowColor = 'transparent';
    }

    // Footer
    ctx.fillStyle = '#FF2A85';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('#FRAMEINGOA', w / 2, h - 180);
    
    ctx.fillStyle = 'rgba(227,197,120,0.6)';
    ctx.font = '16px monospace';
    ctx.fillText('41 Vagator Beach Rd, Anjuna, Goa 403509 • 28 - 31 OCT 2026', w / 2, h - 120);

    // Download
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpeg' ? 0.95 : undefined;
    
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mimeType, quality);
    });

    if (!blob) throw new Error('Canvas toBlob failed');

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `HHG-2026-TheBuildCrew-Manifest.${format}`;
    link.href = url;
    link.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    return true;
  } catch (err) {
    console.error('Failed to export crew manifest:', err);
    return false;
  }
}
