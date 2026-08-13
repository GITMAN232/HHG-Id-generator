import confetti from 'canvas-confetti';
import { sounds } from './soundEffects';
import { BuilderData } from '../types/builder';
import { createCardFrontCanvas, createCardBackCanvas } from './cardRenderer2D';

export async function downloadCardImage(
  data: BuilderData,
  isFlipped: boolean,
  format: 'png' | 'jpeg' = 'png'
): Promise<boolean> {
  try {
    sounds.playSuccess();
    
    // Trigger festive celebratory confetti on download!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#FFD166', '#FF2A85', '#00F0FF', '#164E43']
    });

    // 1. Generate the perfect 2D flat master artwork (1600x1008 px)
    const canvas = isFlipped 
      ? await createCardBackCanvas(data)
      : await createCardFrontCanvas(data);

    // 2. Export using blob to save memory
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpeg' ? 0.95 : undefined;
    
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mimeType, quality);
    });

    if (!blob) throw new Error('Canvas toBlob failed');

    // 3. Create sanitized filename
    const safeName = (data.name || 'Builder').replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
    const sideName = isFlipped ? 'BACK' : 'FRONT';
    const filename = `HHG-2026-${safeName}-${sideName}.${format}`;

    // 4. Trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    return true;
  } catch (err) {
    console.error('Failed to export card image:', err);
    return false;
  }
}

import { generateCreativeCaption } from './captionGenerator';

export function generateShareText(dataOrName: BuilderData | string, teamName?: string, xHandle?: string): string {
  if (typeof dataOrName === 'object') {
    return generateCreativeCaption(dataOrName, 0);
  }
  return generateCreativeCaption({
    id: 'temp',
    name: dataOrName,
    role: 'Builder',
    stack: 'Code, AI, Ship',
    teamName: teamName || '',
    tagline: '',
    xHandle: xHandle || '',
    photoUrl: null,
    passportNumber: 'HHG26-PASSPORT',
    issueDate: '2026-03-15',
    loadout: ['PYTHON', 'VS CODE', 'GOA'],
    dnaStats: { build: 95, hack: 90, ship: 95, create: 95 }
  }, 0);
}
