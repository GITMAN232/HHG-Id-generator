/**
 * cardRenderer2D.ts — Exact Master Illustrated Goa Builder Pass Renderer
 * 
 * Layer 1: MASTER 2D ARTWORK (SINGLE SOURCE OF TRUTH)
 * Output size is strictly 1600x1008 px (Landscape).
 * 
 * Aesthetic: 100% Exact Match to Reference Design + Live Dynamic User Data
 */

import QRCode from 'qrcode';
import { BuilderData } from '../types/builder';

export const CARD_WIDTH = 1600;
export const CARD_HEIGHT = 1008;

// ─── Font Loading ────────────────────────────────────────────────────────────

let fontsLoaded = false;
export async function loadFonts(): Promise<void> {
  if (fontsLoaded) return;
  try {
    await document.fonts.ready;
    fontsLoaded = true;
  } catch (err) {
    console.warn('Font loading error:', err);
  }
}

// ─── Preload Background Template Image ──────────────────────────────────────

let cachedTemplateImage: HTMLImageElement | null = null;

async function getTemplateImage(): Promise<HTMLImageElement | null> {
  if (cachedTemplateImage) return cachedTemplateImage;
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = '/card-template.png';
    });
    cachedTemplateImage = img;
    return img;
  } catch (err) {
    console.warn('Failed to load card-template.png asset:', err);
    return null;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function fitTextToBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  box: { x: number; y: number; w: number; h: number },
  baseFontSize: number,
  minFontSize: number,
  fontFamily: string,
  fontWeight: string,
  fillStyle: string,
  textAlign: CanvasTextAlign = 'left'
): number {
  ctx.save();
  let fontSize = baseFontSize;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = textAlign;

  while (ctx.measureText(text).width > box.w && fontSize > minFontSize) {
    fontSize -= 2;
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  }

  ctx.textBaseline = 'middle';
  ctx.fillStyle = fillStyle;
  
  let drawX = box.x;
  if (textAlign === 'center') drawX = box.x + box.w / 2;
  else if (textAlign === 'right') drawX = box.x + box.w;
  
  ctx.fillText(text, drawX, box.y + box.h / 2);
  ctx.restore();
  
  return fontSize;
}

// ─── Color Tokens ────────────────────────────────────────────────────────────

const CREAM = '#FAF5E8';
const DEEP_GREEN = '#08261E';
const SUN_YELLOW = '#FFD166';
const HOT_PINK = '#FF2A85';

// ─── Procedural Fallback Renderer (In case image fails) ─────────────────────

function drawProceduralBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, w, h);

  const margin = 36;
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 14;
  roundRect(ctx, margin, margin, w - margin * 2, h - margin * 2, 26);
  ctx.stroke();

  ctx.strokeStyle = SUN_YELLOW;
  ctx.lineWidth = 3;
  roundRect(ctx, margin + 12, margin + 12, w - (margin + 12) * 2, h - (margin + 12) * 2, 18);
  ctx.stroke();
}

// ─── Core Card Rendering Engine ──────────────────────────────────────────────

let staticBackCache: HTMLCanvasElement | null = null;

export async function createCardFrontCanvas(
  data: BuilderData,
  imageObj?: HTMLImageElement | null
): Promise<HTMLCanvasElement> {
  await loadFonts();

  const w = CARD_WIDTH;
  const h = CARD_HEIGHT;
  
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Draw Exact Reference Template Background
  const templateImg = await getTemplateImage();
  if (templateImg && templateImg.complete && templateImg.naturalWidth > 0) {
    ctx.drawImage(templateImg, 0, 0, w, h);
  } else {
    drawProceduralBackground(ctx, w, h);
  }

  // 2. Load User Photo
  let loadedImg = imageObj;
  if (!loadedImg && data.photoUrl) {
    try {
      loadedImg = new Image();
      loadedImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        if (!loadedImg) return reject();
        loadedImg.onload = resolve;
        loadedImg.onerror = reject;
        loadedImg.src = data.photoUrl!;
      });
    } catch (e) {
      console.warn('Failed to load builder photo', e);
      loadedImg = null;
    }
  }

  // 3. Dynamic User Photo (Center Circle: cx: 800, cy: 375, r: 160)
  if (loadedImg && loadedImg.complete && loadedImg.naturalWidth > 0) {
    const cx = 800;
    const cy = 375;
    const radius = 160;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
    ctx.clip();

    const size = (radius - 4) * 2;
    const imgRatio = loadedImg.naturalWidth / loadedImg.naturalHeight;
    let drawW = size;
    let drawH = size;
    let drawX = cx - radius + 4;
    let drawY = cy - radius + 4;

    if (imgRatio > 1) {
      drawW = size * imgRatio;
      drawX = cx - drawW / 2;
    } else {
      drawH = size / imgRatio;
      drawY = cy - drawH / 2;
    }
    ctx.drawImage(loadedImg, drawX, drawY, drawW, drawH);
    ctx.restore();

    // Re-draw inner ring line over photo boundary for seamless integration
    ctx.strokeStyle = DEEP_GREEN;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 4. Dynamic Nameplate (SANTHOSH KUMAR)
  const nameBoxW = 560;
  const nameBoxX = 800 - nameBoxW / 2;
  const nameBoxY = 556;
  const nameBoxH = 64;

  ctx.fillStyle = DEEP_GREEN;
  roundRect(ctx, nameBoxX, nameBoxY, nameBoxW, nameBoxH, 16);
  ctx.fill();
  ctx.strokeStyle = SUN_YELLOW;
  ctx.lineWidth = 3;
  ctx.stroke();

  const nameText = (data.name || 'SANTHOSH KUMAR').toUpperCase();
  fitTextToBox(ctx, nameText, { x: nameBoxX, y: nameBoxY, w: nameBoxW, h: nameBoxH }, 44, 24, 'sans-serif', '900', CREAM, 'center');

  // 5. Dynamic Role Pill (⚡ FULLSTACK DEVELOPER ⚡)
  const roleBoxW = 460;
  const roleBoxX = 800 - roleBoxW / 2;
  const roleBoxY = 636;
  const roleBoxH = 42;

  ctx.fillStyle = SUN_YELLOW;
  roundRect(ctx, roleBoxX, roleBoxY, roleBoxW, roleBoxH, 12);
  ctx.fill();
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  const roleText = `⚡ ${(data.role || 'FULLSTACK DEVELOPER').toUpperCase()} ⚡`;
  fitTextToBox(ctx, roleText, { x: roleBoxX, y: roleBoxY, w: roleBoxW, h: roleBoxH }, 20, 13, 'monospace', '900', DEEP_GREEN, 'center');

  // 6. Dynamic Stack Section (Left Upper Area)
  const leftX = 180;
  const stackY = 485;
  const stackW = 280;

  // Clear original static text area cleanly with parchment cream
  ctx.fillStyle = CREAM;
  ctx.fillRect(leftX, stackY, stackW, 50);

  ctx.fillStyle = HOT_PINK;
  ctx.font = '900 13px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('STACK', leftX, stackY);

  const stackStr = (data.stack || 'PYTHON, AI, REACT, CYBERSECURITY').toUpperCase();
  fitTextToBox(ctx, stackStr, { x: leftX, y: stackY + 16, w: stackW, h: 32 }, 15, 11, 'monospace', 'bold', DEEP_GREEN, 'left');

  // 7. Dynamic Team Section (Left Upper Area below Stack)
  const teamY = 555;
  ctx.fillStyle = CREAM;
  ctx.fillRect(leftX, teamY, stackW, 50);

  if (data.teamName && data.teamName.trim().length > 0) {
    ctx.fillStyle = HOT_PINK;
    ctx.font = '900 13px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('TEAM', leftX, teamY);

    const teamText = `[ ${data.teamName.trim().toUpperCase()} ]`;
    fitTextToBox(ctx, teamText, { x: leftX, y: teamY + 16, w: stackW, h: 32 }, 19, 13, 'monospace', '900', DEEP_GREEN, 'left');
  }

  // 8. Dynamic Tagline (Hot Pink Italic Quote)
  const centerW = 600;
  const centerX = 800 - centerW / 2;
  const tagY = 692;

  ctx.fillStyle = CREAM;
  ctx.fillRect(centerX, tagY, centerW, 36);

  if (data.tagline && data.tagline.trim()) {
    fitTextToBox(ctx, `"${data.tagline.trim()}"`, { x: centerX, y: tagY, w: centerW, h: 36 }, 20, 13, 'serif', 'italic', HOT_PINK, 'center');
  }

  // 9. Dynamic Loadout Chips (Center Lower Area)
  const loadY = 760;
  ctx.fillStyle = CREAM;
  ctx.fillRect(800 - 330, loadY, 660, 36);

  const loadout = data.loadout || ['PYTHON', 'AI FUEL', 'LO-FI BEATS', 'BEACH VIBES'];
  let loadX = 800 - 320;
  loadout.slice(0, 4).forEach((item, idx) => {
    const icons = ['💻', '🥤', '🎧', '🏄'];
    const label = `${icons[idx % 4]} ${item.replace(/[^\w\s]/gi, '').trim()}`;
    ctx.font = 'bold 12px monospace';
    const itemW = ctx.measureText(label).width + 20;

    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = DEEP_GREEN;
    ctx.lineWidth = 2;
    roundRect(ctx, loadX, loadY, itemW, 32, 6);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = DEEP_GREEN;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(label, loadX + itemW / 2, loadY + 16);
    loadX += itemW + 10;
  });

  // 10. Dynamic QR Code (Upper Right Stamp Box)
  const qrX = 1205;
  const qrY = 250;
  const qrW = 230;

  ctx.fillStyle = CREAM;
  ctx.fillRect(qrX, qrY, qrW, qrW);
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 4;
  ctx.strokeRect(qrX, qrY, qrW, qrW);

  try {
    const qrPayload = JSON.stringify({
      passport: data.passportNumber,
      name: data.name,
      role: data.role,
      team: data.teamName || null,
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 220,
      color: { dark: '#08261E', light: '#FAF5E8' },
    });
    const img = new Image();
    await new Promise((res) => { img.onload = res; img.src = qrDataUrl; });
    ctx.drawImage(img, qrX + 5, qrY + 5, qrW - 10, qrW - 10);
  } catch (err) {
    ctx.fillStyle = DEEP_GREEN;
    fitTextToBox(ctx, 'SCAN ME', { x: qrX, y: qrY, w: qrW, h: qrW }, 22, 14, 'monospace', 'bold', DEEP_GREEN, 'center');
  }

  // Sticker: SCAN ME
  ctx.save();
  ctx.translate(qrX + qrW - 15, qrY + 15);
  ctx.rotate(0.18);
  ctx.fillStyle = SUN_YELLOW;
  roundRect(ctx, -45, -16, 90, 32, 6);
  ctx.fill();
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = DEEP_GREEN;
  ctx.font = '900 11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SCAN ME', 0, 2);
  ctx.restore();

  // 11. Dynamic Builder ID (Bottom Left)
  const ftY = 890;
  const idX = 70;
  const idY = ftY + 36;

  ctx.fillStyle = CREAM;
  ctx.fillRect(idX, idY, 280, 36);

  const passportNumber = data.passportNumber || 'HHG26-9216-MG';
  fitTextToBox(ctx, passportNumber, { x: idX, y: idY, w: 280, h: 36 }, 28, 16, 'monospace', '900', DEEP_GREEN, 'left');

  // 12. Dynamic Barcode Banner
  const bX = 420;
  const bW = 380;
  const bH = 50;
  const bY = ftY + 16;

  ctx.fillStyle = CREAM;
  ctx.fillRect(bX, bY, bW, bH);
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 2;
  ctx.strokeRect(bX, bY, bW, bH);

  ctx.fillStyle = DEEP_GREEN;
  let bPos = bX + 12;
  const seed = passportNumber.charCodeAt(0) || 1;
  for (let i = 0; i < 36; i++) {
    const bw = ((i * 3 + seed) % 4 === 0) ? 6 : 3;
    if (i % 5 !== 0) ctx.fillRect(bPos, bY + 8, bw, bH - 16);
    bPos += bw + 4;
    if (bPos > bX + bW - 16) break;
  }

  return canvas;
}

export async function createCardBackCanvas(data: BuilderData): Promise<HTMLCanvasElement> {
  await loadFonts();

  const w = CARD_WIDTH;
  const h = CARD_HEIGHT;
  
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  if (!staticBackCache) {
    staticBackCache = document.createElement('canvas');
    staticBackCache.width = w;
    staticBackCache.height = h;
    const sCtx = staticBackCache.getContext('2d');
    if (sCtx) {
      drawProceduralBackground(sCtx, w, h);
      sCtx.fillStyle = DEEP_GREEN;
      sCtx.textBaseline = 'middle';
      sCtx.textAlign = 'left';
      sCtx.font = '900 36px sans-serif';
      sCtx.fillText('HACKER HOUSE GOA 2026 — FIELD PASS', 75, 110);
      sCtx.fillStyle = HOT_PINK;
      sCtx.font = 'bold 18px monospace';
      sCtx.textAlign = 'right';
      sCtx.fillText('PASSPORT CONTROL / BACK SIDE', w - 75, 110);
    
      sCtx.strokeStyle = 'rgba(8, 38, 30, 0.3)';
      sCtx.beginPath(); sCtx.moveTo(75, 150); sCtx.lineTo(w - 75, 150); sCtx.stroke();
    }
  }
  ctx.drawImage(staticBackCache, 0, 0);

  // Profile Summary
  let cursorY = 220;
  ctx.fillStyle = DEEP_GREEN;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = '900 24px sans-serif';
  ctx.fillText('BUILDER PROFILE SUMMARY', 75, cursorY);
  cursorY += 50;

  ctx.fillStyle = DEEP_GREEN;
  ctx.font = 'bold 20px monospace';
  ctx.fillText(`NAME: ${(data.name || 'SANTHOSH KUMAR').toUpperCase()}`, 75, cursorY);
  cursorY += 45;
  ctx.fillText(`ROLE: ${(data.role || 'FULLSTACK BUILDER').toUpperCase()}`, 75, cursorY);
  cursorY += 45;
  if (data.teamName && data.teamName.trim().length > 0) {
    ctx.fillText(`TEAM: ${data.teamName.trim().toUpperCase()}`, 75, cursorY);
    cursorY += 45;
  }
  ctx.fillText(`PASSPORT ID: ${data.passportNumber || 'HHG26-8942-SF'}`, 75, cursorY);

  cursorY += 75;
  ctx.fillStyle = DEEP_GREEN;
  ctx.font = '900 24px sans-serif';
  ctx.fillText('BUILDER DNA & SKILL METRICS', 75, cursorY);
  cursorY += 55;

  const stats = data.dnaStats || { build: 92, hack: 86, ship: 94, create: 98 };
  const statRows: [string, number][] = [
    ['BUILD', stats.build],
    ['HACK', stats.hack],
    ['SHIP', stats.ship],
    ['CREATE', stats.create],
  ];
  
  statRows.forEach(([label, val]) => {
    ctx.fillStyle = DEEP_GREEN;
    ctx.font = 'bold 16px monospace';
    ctx.fillText(label, 75, cursorY);
    ctx.fillStyle = 'rgba(8, 38, 30, 0.12)';
    ctx.fillRect(200, cursorY - 10, 300, 20);
    ctx.fillStyle = HOT_PINK;
    ctx.fillRect(200, cursorY - 10, 300 * (val / 100), 20);
    ctx.fillStyle = DEEP_GREEN;
    ctx.fillText(`${val}%`, 520, cursorY);
    cursorY += 48;
  });

  // Right Side Decorative Panel
  const rX = 960;
  const rY = 200;
  const rW = 540;
  const rH = 580;
  ctx.fillStyle = CREAM;
  ctx.fillRect(rX, rY, rW, rH);
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 4;
  ctx.strokeRect(rX, rY, rW, rH);
  
  ctx.fillStyle = DEEP_GREEN;
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('NON-TRANSFERABLE ARTIFACT', rX + rW / 2, rY + 140);
  ctx.fillStyle = DEEP_GREEN;
  ctx.font = 'bold 20px monospace';
  ctx.fillText('HACKER HOUSE GOA 2026', rX + rW / 2, rY + 260);
  ctx.fillText('OFFICIAL BUILDER FIELD PASS', rX + rW / 2, rY + 320);
  ctx.fillStyle = HOT_PINK;
  ctx.font = '900 28px monospace';
  ctx.fillText('#FRAMEINGOA', rX + rW / 2, rY + 440);

  // Footer
  const ftY = 880;
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(75, ftY); ctx.lineTo(w - 75, ftY); ctx.stroke();

  ctx.fillStyle = DEEP_GREEN;
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('PROPERTY OF: Hacker House Goa 2026', 75, ftY + 60);

  return canvas;
}
