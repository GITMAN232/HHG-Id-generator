/**
 * cardRenderer2D.ts — Master 2D Card Renderer (Canvas 2D)
 * 
 * Layer 1: MASTER 2D ARTWORK
 * This is the SINGLE SOURCE OF TRUTH for the ID card design.
 * Output size is strictly 1600x1008 px (Landscape).
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

/**
 * Text fitting utility. Fits text into a bounding box.
 * 1. Try the intended font size.
 * 2. Measure text width.
 * 3. Reduce font size if necessary.
 * 4. Stop at a minimum readable size.
 */
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

  // Draw text vertically centered within the box.
  // We use textBaseline = 'middle' and y = box.y + box.h/2
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fillStyle;
  
  let drawX = box.x;
  if (textAlign === 'center') drawX = box.x + box.w / 2;
  else if (textAlign === 'right') drawX = box.x + box.w;
  
  ctx.fillText(text, drawX, box.y + box.h / 2);
  ctx.restore();
  
  return fontSize;
}

// ─── Drawing Primitives ──────────────────────────────────────────────────────

function drawSecurityBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Base background (Deep Hacker House Goa green)
  const bgGrad = ctx.createRadialGradient(
    w * 0.5, h * 0.4, h * 0.05,
    w * 0.5, h * 0.5, Math.max(w, h) * 0.8
  );
  bgGrad.addColorStop(0, '#0D382C');
  bgGrad.addColorStop(0.6, '#08261E');
  bgGrad.addColorStop(1, '#041611');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Outer frame safe margin (60px)
  const margin = 60;
  ctx.strokeStyle = 'rgba(227,197,120,0.35)'; // gold
  ctx.lineWidth = 3;
  ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);
  
  ctx.strokeStyle = 'rgba(227,197,120,0.15)';
  ctx.lineWidth = 2;
  const margin2 = 75; // critical-content safe zone
  ctx.strokeRect(margin2, margin2, w - margin2 * 2, h - margin2 * 2);

  // Corner dots
  const cr = 10;
  [[margin, margin], [w - margin, margin], [margin, h - margin], [w - margin, h - margin]].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(227,197,120,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Microtext
  ctx.fillStyle = 'rgba(227,197,120,0.08)';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'left';
  const secStr = 'HH GOA 2026 • BUILD / HACK / SHIP / CREATE • GOA INDIA • ';
  ctx.fillText(secStr.repeat(6), 80, 105);
  
  // Wave decoration at bottom
  ctx.strokeStyle = 'rgba(227,197,120,0.05)';
  ctx.lineWidth = 2;
  for (let y = h - 220; y < h - 90; y += 20) {
    ctx.beginPath();
    ctx.moveTo(80, y);
    for (let x = 80; x < w - 80; x += 40) {
      ctx.quadraticCurveTo(x + 20, y + (x % 80 === 0 ? 15 : -15), x + 40, y);
    }
    ctx.stroke();
  }

  // Stamp
  ctx.save();
  ctx.translate(w - 200, 160);
  ctx.rotate(0.12);
  ctx.strokeStyle = 'rgba(255,42,133,0.3)'; // pink
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 44, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,42,133,0.4)';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GOA IMMIGRATION', 0, -18);
  ctx.fillText('PASSED', 0, 0);
  ctx.fillText('2026 • HHG', 0, 18);
  ctx.restore();
}

function drawHeader(ctx: CanvasRenderingContext2D, box: {x: number, y: number, w: number, h: number}) {
  const gold = '#E3C578';
  const cream = '#FAF6EE';
  const pink = '#FF2A85';

  // HH Logo Box
  ctx.fillStyle = 'rgba(255,42,133,0.15)';
  ctx.strokeStyle = pink;
  ctx.lineWidth = 3;
  roundRect(ctx, box.x, box.y + 15, 70, 70, 12);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = pink;
  ctx.textBaseline = 'middle';
  ctx.font = '900 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HH', box.x + 35, box.y + 15 + 35);

  // HACKER [गोवा] HOUSE 2026
  let cx = box.x + 95;
  ctx.font = '900 42px sans-serif';
  ctx.fillStyle = cream;
  ctx.textAlign = 'left';
  ctx.fillText('HACKER', cx, box.y + 50);
  cx += ctx.measureText('HACKER').width + 16;
  
  ctx.fillStyle = pink;
  roundRect(ctx, cx, box.y + 26, 80, 48, 8);
  ctx.fill();
  ctx.fillStyle = cream;
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('गोवा', cx + 40, box.y + 50);
  cx += 80 + 16;

  ctx.font = '900 42px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('HOUSE', cx, box.y + 50);
  cx += ctx.measureText('HOUSE').width + 20;
  ctx.fillStyle = gold;
  ctx.fillText('2026', cx, box.y + 50);
  cx += ctx.measureText('2026').width + 40;
  
  // Badge
  const badgeX = cx;
  ctx.fillStyle = 'rgba(227,197,120,0.12)';
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  roundRect(ctx, badgeX, box.y + 26, 260, 48, 8);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = gold;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BUILDER PASSPORT', badgeX + 130, box.y + 50);

  // Hairline separator
  ctx.strokeStyle = 'rgba(227,197,120,0.3)';
  ctx.beginPath(); ctx.moveTo(box.x, box.y + box.h - 5); ctx.lineTo(box.x + box.w, box.y + box.h - 5); ctx.stroke();
}

function drawPortrait(ctx: CanvasRenderingContext2D, box: {x: number, y: number, w: number, h: number}, imageObj?: HTMLImageElement | null) {
  const gold = '#E3C578';
  const pink = '#FF2A85';
  const cream = '#FAF6EE';

  // Passport photo frame
  ctx.fillStyle = 'rgba(10,41,32,0.95)';
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 4;
  ctx.strokeRect(box.x - 4, box.y - 4, box.w + 8, box.h + 8);
  ctx.strokeStyle = pink;
  ctx.lineWidth = 2;
  ctx.strokeRect(box.x + 4, box.y + 4, box.w - 8, box.h - 8);

  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x + 8, box.y + 8, box.w - 16, box.h - 16);
  ctx.clip();
  if (imageObj && imageObj.complete && imageObj.naturalWidth > 0) {
    // Smart Object Cover: center crop
    const imgRatio = imageObj.naturalWidth / imageObj.naturalHeight;
    const boxRatio = (box.w - 16) / (box.h - 16);
    let drawW, drawH, drawX, drawY;
    if (imgRatio > boxRatio) {
      drawH = box.h - 16;
      drawW = drawH * imgRatio;
      drawX = box.x + 8 - (drawW - (box.w - 16)) / 2;
      drawY = box.y + 8;
    } else {
      drawW = box.w - 16;
      drawH = drawW / imgRatio;
      drawX = box.x + 8;
      drawY = box.y + 8 - (drawH - (box.h - 16)) / 2;
    }
    ctx.drawImage(imageObj, drawX, drawY, drawW, drawH);
  } else {
    ctx.fillStyle = '#062018';
    ctx.fillRect(box.x + 8, box.y + 8, box.w - 16, box.h - 16);
    ctx.fillStyle = gold;
    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏝️', box.x + box.w / 2, box.y + box.h / 2 - 20);
  }
  ctx.restore();

  const ribbonH = 45;
  const ribbonY = box.y + box.h - ribbonH;
  ctx.fillStyle = 'rgba(13,56,44,0.95)';
  ctx.fillRect(box.x + 8, ribbonY, box.w - 16, ribbonH);
  ctx.fillStyle = cream;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GOA 2026 VERIFIED', box.x + box.w / 2, ribbonY + ribbonH / 2);
}

// ─── Core Card Rendering ─────────────────────────────────────────────────────

// Caching layer for static background
let staticFrontCache: HTMLCanvasElement | null = null;
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

  const gold = '#E3C578';
  const cream = '#FAF6EE';
  const subText = '#C0DACB';
  const pink = '#FF2A85';

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

  // Draw Static Layer or use cache
  if (!staticFrontCache) {
    staticFrontCache = document.createElement('canvas');
    staticFrontCache.width = w;
    staticFrontCache.height = h;
    const sCtx = staticFrontCache.getContext('2d');
    if (sCtx) {
      drawSecurityBackground(sCtx, w, h);
      drawHeader(sCtx, { x: 75, y: 75, w: w - 150, h: 100 });
      // Draw static footer lines
      const ftY = 870;
      sCtx.strokeStyle = 'rgba(227,197,120,0.3)';
      sCtx.beginPath(); sCtx.moveTo(75, ftY); sCtx.lineTo(w - 75, ftY); sCtx.stroke();
    }
  }
  ctx.drawImage(staticFrontCache, 0, 0);

  // Dynamic Layer
  
  // 1. Photo
  drawPortrait(ctx, { x: 75, y: 220, w: 380, h: 500 }, loadedImg);

  // 2. Info Column
  const infoX = 490;
  const infoW = 680;
  
  const nameText = (data.name || 'SANTHOSH KUMAR').toUpperCase();
  fitTextToBox(ctx, nameText, {x: infoX, y: 220, w: infoW, h: 70}, 64, 30, 'sans-serif', '900', cream, 'left');
  
  let currentY = 310;

  ctx.fillStyle = subText;
  ctx.font = 'bold 14px monospace';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  
  ctx.fillText('ROLE / TITLE', infoX, currentY);
  const roleText = (data.role || 'FULLSTACK BUILDER').toUpperCase();
  fitTextToBox(ctx, roleText, {x: infoX, y: currentY + 20, w: infoW, h: 35}, 28, 16, 'sans-serif', 'bold', gold, 'left');
  currentY += 65;

  ctx.fillStyle = subText;
  ctx.fillText('STACK', infoX, currentY);
  const stackText = (data.stack || 'PYTHON · AI · REACT').toUpperCase();
  fitTextToBox(ctx, stackText, {x: infoX, y: currentY + 20, w: infoW, h: 30}, 20, 14, 'monospace', 'bold', cream, 'left');
  currentY += 60;

  // CONDITIONAL TEAM NAME DISPLAY
  if (data.teamName && data.teamName.trim().length > 0) {
    ctx.fillStyle = subText;
    ctx.fillText('TEAM NAME', infoX, currentY);
    const teamText = data.teamName.trim().toUpperCase();
    fitTextToBox(ctx, teamText, {x: infoX, y: currentY + 20, w: infoW, h: 32}, 22, 14, 'monospace', '900', pink, 'left');
    currentY += 60;
  }
  
  if (data.tagline && data.tagline.trim()) {
    fitTextToBox(ctx, `"${data.tagline}"`, {x: infoX, y: currentY, w: infoW, h: 35}, 22, 14, 'serif', 'italic', gold, 'left');
    currentY += 50;
  }

  ctx.fillStyle = subText;
  ctx.fillText('BUILDER LOADOUT', infoX, currentY);
  const loadout = data.loadout || ['⚡ PYTHON', '💻 VS CODE', '🌴 GOA'];
  let loadX = infoX;
  let loadY = currentY + 25;
  ctx.font = 'bold 14px monospace';
  loadout.slice(0, 4).forEach((item) => {
    const itemW = ctx.measureText(item).width + 30;
    if (loadX + itemW > infoX + infoW) {
      loadX = infoX;
      loadY += 45;
    }
    ctx.fillStyle = 'rgba(13,56,44,0.9)';
    ctx.strokeStyle = 'rgba(227,197,120,0.4)';
    roundRect(ctx, loadX, loadY, itemW, 36, 6);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = gold;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(item, loadX + itemW / 2, loadY + 18);
    loadX += itemW + 12;
  });

  // 3. QR Code & Identity (Right column)
  const qrX = 1200;
  const qrY = 220;
  const qrW = 280;
  
  ctx.fillStyle = cream;
  ctx.fillRect(qrX, qrY, qrW, qrW);
  ctx.strokeStyle = gold;
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
      width: 260,
      color: { dark: '#08261E', light: '#FAF6EE' },
    });
    const img = new Image();
    await new Promise((res) => { img.onload = res; img.src = qrDataUrl; });
    ctx.drawImage(img, qrX + 10, qrY + 10, qrW - 20, qrW - 20);
  } catch (err) {
    ctx.fillStyle = '#08261E';
    fitTextToBox(ctx, 'QR PROFILE', {x: qrX, y: qrY, w: qrW, h: qrW}, 24, 16, 'monospace', 'bold', '#08261E', 'center');
  }
  
  const sealY = qrY + qrW + 140;
  const sealR = 80;
  const sealX = qrX + qrW / 2;
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.beginPath(); ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(227,197,120,0.6)';
  ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = gold;
  ctx.font = 'bold 12px monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText('HH GOA 2026', sealX, sealY - 45);
  ctx.fillText('VERIFIED', sealX, sealY + 55);

  // 4. Footer Row
  const ftY = 870;
  ctx.fillStyle = subText;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('BUILDER ID:', 90, ftY + 20);
  
  const passportNumber = data.passportNumber || 'HHG26-8942-SF';
  fitTextToBox(ctx, passportNumber, {x: 90, y: ftY + 40, w: 400, h: 40}, 34, 18, 'monospace', '900', gold, 'left');
  
  ctx.fillStyle = pink;
  fitTextToBox(ctx, '#FRAMEINGOA', {x: w - 300, y: ftY + 40, w: 225, h: 40}, 24, 16, 'monospace', 'bold', pink, 'right');

  // Barcode
  const bX = 520;
  const bW = 400;
  const bH = 60;
  const bY = ftY + 30;
  ctx.fillStyle = cream;
  ctx.fillRect(bX, bY, bW, bH);
  ctx.fillStyle = '#08261E';
  let bPos = bX + 15;
  const seed = passportNumber.charCodeAt(0) || 1;
  for (let i = 0; i < 40; i++) {
    const bw = ((i * 3 + seed) % 4 === 0) ? 6 : 3;
    if (i % 5 !== 0) ctx.fillRect(bPos, bY + 10, bw, bH - 20);
    bPos += bw + 4;
    if (bPos > bX + bW - 20) break;
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

  const gold = '#E3C578';
  const cream = '#FAF6EE';
  const subText = '#C0DACB';
  const pink = '#FF2A85';

  if (!staticBackCache) {
    staticBackCache = document.createElement('canvas');
    staticBackCache.width = w;
    staticBackCache.height = h;
    const sCtx = staticBackCache.getContext('2d');
    if (sCtx) {
      drawSecurityBackground(sCtx, w, h);
      sCtx.fillStyle = cream;
      sCtx.textBaseline = 'middle';
      sCtx.textAlign = 'left';
      sCtx.font = '900 36px sans-serif';
      sCtx.fillText('HH GOA 2026 — BUILDER PASSPORT', 75, 120);
      sCtx.fillStyle = gold;
      sCtx.font = 'bold 18px monospace';
      sCtx.textAlign = 'right';
      sCtx.fillText('PASSPORT CONTROL / BACK SIDE', w - 75, 120);
    
      sCtx.strokeStyle = 'rgba(227,197,120,0.3)';
      sCtx.beginPath(); sCtx.moveTo(75, 160); sCtx.lineTo(w - 75, 160); sCtx.stroke();
    }
  }
  ctx.drawImage(staticBackCache, 0, 0);

  // Profile Stats
  let cursorY = 240;
  ctx.fillStyle = gold;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = '900 24px sans-serif';
  ctx.fillText('BUILDER PROFILE SUMMARY', 75, cursorY);
  cursorY += 60;

  ctx.fillStyle = cream;
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

  cursorY += 80;
  ctx.fillStyle = gold;
  ctx.font = '900 24px sans-serif';
  ctx.fillText('BUILDER DNA & SKILL METRICS', 75, cursorY);
  cursorY += 60;

  const stats = data.dnaStats || { build: 92, hack: 86, ship: 94, create: 98 };
  const statRows: [string, number][] = [
    ['BUILD', stats.build],
    ['HACK', stats.hack],
    ['SHIP', stats.ship],
    ['CREATE', stats.create],
  ];
  
  statRows.forEach(([label, val]) => {
    ctx.fillStyle = subText;
    ctx.font = 'bold 16px monospace';
    ctx.fillText(label, 75, cursorY);
    ctx.fillStyle = 'rgba(250,246,238,0.15)';
    ctx.fillRect(200, cursorY - 10, 300, 20);
    ctx.fillStyle = gold;
    ctx.fillRect(200, cursorY - 10, 300 * (val / 100), 20);
    ctx.fillStyle = cream;
    ctx.fillText(`${val}%`, 520, cursorY);
    cursorY += 50;
  });

  // Right Side Decorative Panel
  const rX = 980;
  const rY = 220;
  const rW = 520;
  const rH = 550;
  ctx.fillStyle = 'rgba(10,41,32,0.8)';
  ctx.fillRect(rX, rY, rW, rH);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(rX, rY, rW, rH);
  
  ctx.fillStyle = gold;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('NON-TRANSFERABLE', rX + rW / 2, rY + 140);
  ctx.fillStyle = cream;
  ctx.font = 'bold 18px monospace';
  ctx.fillText('HACKER HOUSE GOA 2026', rX + rW / 2, rY + 260);
  ctx.fillText('OFFICIAL BUILDER ID', rX + rW / 2, rY + 320);
  ctx.fillStyle = pink;
  ctx.font = 'bold 24px monospace';
  ctx.fillText('#FRAMEINGOA', rX + rW / 2, rY + 440);

  // Footer
  const ftY = 880;
  ctx.strokeStyle = 'rgba(227,197,120,0.3)';
  ctx.beginPath(); ctx.moveTo(75, ftY); ctx.lineTo(w - 75, ftY); ctx.stroke();

  ctx.fillStyle = cream;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('PROPERTY OF: Hacker House Goa 2026', 75, ftY + 60);

  return canvas;
}
