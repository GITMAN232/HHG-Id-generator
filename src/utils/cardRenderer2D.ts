/**
 * cardRenderer2D.ts — Illustrated Goa Builder Field Pass (Canvas 2D Engine)
 * 
 * Layer 1: MASTER 2D ARTWORK (SINGLE SOURCE OF TRUTH)
 * Output size is strictly 1600x1008 px (Landscape).
 * 
 * Aesthetic: Goa Travel Pass × Builder Field Pass × Collectible Postcard
 * Colors: Warm Cream (#FAF5E8), Deep Goa Green (#08261E), Sun Yellow (#FFD166), Hot Pink (#FF2A85)
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

// ─── Illustrated Drawing Primitives ──────────────────────────────────────────

const CREAM = '#FAF5E8';
const DEEP_GREEN = '#08261E';
const MID_GREEN = '#0D382C';
const SUN_YELLOW = '#FFD166';
const HOT_PINK = '#FF2A85';
const CORAL_ORANGE = '#FF6B35';

function drawSecurityBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // 1. Warm Cream Paper Background
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, w, h);

  // Subtle Paper Dot Grid
  ctx.fillStyle = 'rgba(8, 38, 30, 0.035)';
  for (let x = 20; x < w; x += 32) {
    for (let y = 20; y < h; y += 32) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  // 2. Outer Frame (Deep Green)
  const margin = 40;
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 12;
  roundRect(ctx, margin, margin, w - margin * 2, h - margin * 2, 28);
  ctx.stroke();

  // 3. Inner Accent Lines (Yellow & Pink registration)
  ctx.strokeStyle = SUN_YELLOW;
  ctx.lineWidth = 3;
  roundRect(ctx, margin + 12, margin + 12, w - (margin + 12) * 2, h - (margin + 12) * 2, 20);
  ctx.stroke();

  // Pink Corner Crosshairs
  const crX = [margin + 20, w - margin - 20];
  const crY = [margin + 20, h - margin - 20];
  ctx.strokeStyle = HOT_PINK;
  ctx.lineWidth = 2;
  crX.forEach((cx) => {
    crY.forEach((cy) => {
      ctx.beginPath(); ctx.moveTo(cx - 10, cy); ctx.lineTo(cx + 10, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy + 10); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fillStyle = HOT_PINK; ctx.fill();
    });
  });

  // Perimeter Microtext Line
  ctx.fillStyle = 'rgba(8, 38, 30, 0.4)';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'left';
  const marginText = '28 - 31 OCT 2026 • GOA, INDIA • BUILD / HACK / SHIP / REPEAT • HACKER HOUSE GOA • ';
  ctx.fillText(marginText.repeat(5), 70, 72);
}

function drawVintageStamp(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Serrated Postage Stamp Edge (Goa India Stamp)
  const sw = 140;
  const sh = 100;
  ctx.fillStyle = '#FFFDF8';
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 3;

  // Stamp base
  ctx.fillRect(0, 0, sw, sh);
  ctx.strokeRect(0, 0, sw, sh);

  // Inner Stamp Graphic
  ctx.fillStyle = MID_GREEN;
  ctx.fillRect(8, 8, sw - 16, sh - 16);

  // Palm & Sun in Stamp
  ctx.fillStyle = SUN_YELLOW;
  ctx.beginPath(); ctx.arc(sw / 2, 45, 18, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#FFFDF8';
  ctx.font = '900 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GOA • INDIA', sw / 2, sh - 16);

  // Red Wavy Cancellation Mark over stamp
  ctx.strokeStyle = 'rgba(255, 42, 133, 0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let waveX = -20; waveX < sw + 20; waveX += 10) {
    ctx.lineTo(waveX, 25 + Math.sin(waveX * 0.15) * 8);
  }
  ctx.stroke();

  ctx.beginPath();
  for (let waveX = -20; waveX < sw + 20; waveX += 10) {
    ctx.lineTo(waveX, 45 + Math.sin(waveX * 0.15) * 8);
  }
  ctx.stroke();

  ctx.restore();
}

function drawCircularSeal(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.08);

  ctx.strokeStyle = 'rgba(8, 38, 30, 0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, 52, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI * 2); ctx.stroke();

  ctx.fillStyle = DEEP_GREEN;
  ctx.font = '900 10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Circular text
  ctx.fillText('★ BUILD IN GOA ★', 0, -22);
  ctx.fillText('SHIP FROM PARADISE', 0, 0);
  ctx.fillText('2026 OFFICIAL', 0, 22);

  ctx.restore();
}

function drawCuteGoaDoodles(ctx: CanvasRenderingContext2D) {
  ctx.save();

  // 1. Cute Smiling Sun (Top Center-Right)
  ctx.save();
  ctx.translate(1120, 115);
  ctx.fillStyle = SUN_YELLOW;
  ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 2.5; ctx.stroke();

  // Ray doodles
  ctx.strokeStyle = SUN_YELLOW; ctx.lineWidth = 3;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 28, Math.sin(a) * 28);
    ctx.lineTo(Math.cos(a) * 38, Math.sin(a) * 38);
    ctx.stroke();
  }
  // Cute Face: eyes and smile
  ctx.fillStyle = DEEP_GREEN;
  ctx.beginPath(); ctx.arc(-7, -4, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7, -4, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 3, 6, 0, Math.PI); ctx.stroke();
  ctx.restore();

  // 2. Cute Retro Scooter Doodle (Right side below QR)
  ctx.save();
  ctx.translate(1220, 560);
  
  // Body (Pink/Yellow scooter)
  ctx.fillStyle = HOT_PINK;
  roundRect(ctx, 0, 15, 85, 30, 10);
  ctx.fill();
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 2.5; ctx.stroke();

  // Seat
  ctx.fillStyle = DEEP_GREEN;
  roundRect(ctx, 25, 6, 40, 12, 4); ctx.fill();

  // Wheels
  ctx.fillStyle = DEEP_GREEN;
  ctx.beginPath(); ctx.arc(20, 48, 14, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(70, 48, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = CREAM;
  ctx.beginPath(); ctx.arc(20, 48, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(70, 48, 6, 0, Math.PI * 2); ctx.fill();

  // Headlight
  ctx.fillStyle = SUN_YELLOW;
  ctx.beginPath(); ctx.arc(84, 12, 7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = DEEP_GREEN; ctx.stroke();

  // Cute Label note: "ANJUNA RIDE 🛵"
  ctx.fillStyle = DEEP_GREEN;
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ANJUNA RIDE 🛵', 42, -5);
  ctx.restore();

  // 3. Cute Sleeping Beach Dog (Left side near signpost)
  ctx.save();
  ctx.translate(100, 620);
  ctx.fillStyle = SUN_YELLOW;
  ctx.beginPath(); ctx.arc(25, 20, 18, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(38, 12, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = HOT_PINK;
  ctx.beginPath(); ctx.ellipse(44, 16, 5, 8, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = DEEP_GREEN;
  ctx.font = 'bold 11px monospace';
  ctx.fillText('zzZ', 48, -2);
  ctx.fillText('SUSEGAD 🐶', 22, 48);
  ctx.restore();

  // 4. Cute Fresh Coconut Drink
  ctx.save();
  ctx.translate(450, 530);
  ctx.fillStyle = MID_GREEN;
  ctx.beginPath(); ctx.arc(20, 20, 18, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.strokeStyle = HOT_PINK; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(20, 5); ctx.lineTo(32, -12); ctx.stroke();
  ctx.fillStyle = SUN_YELLOW;
  ctx.beginPath(); ctx.arc(10, 0, 12, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = DEEP_GREEN;
  ctx.font = 'bold 10px monospace';
  ctx.fillText('100% FRESH 🌴', -5, 48);
  ctx.restore();

  // 5. Flying Seabirds
  ctx.strokeStyle = 'rgba(8, 38, 30, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(480, 120, 10, Math.PI, 0, true); ctx.arc(500, 120, 10, Math.PI, 0, true); ctx.stroke();
  ctx.beginPath(); ctx.arc(510, 105, 7, Math.PI, 0, true); ctx.arc(524, 105, 7, Math.PI, 0, true); ctx.stroke();

  ctx.restore();
}

function drawSignpost(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Pole
  ctx.fillStyle = '#8B5A2B';
  ctx.fillRect(40, 0, 16, 210);
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 0, 16, 210);

  // Arrow 1: BUILD (Yellow)
  ctx.fillStyle = SUN_YELLOW;
  roundRect(ctx, 0, 15, 110, 42, 8);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = DEEP_GREEN;
  ctx.font = '900 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BUILD →', 55, 42);

  // Arrow 2: SHIP (Pink)
  ctx.fillStyle = HOT_PINK;
  roundRect(ctx, -15, 75, 115, 42, 8);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FFFDF8';
  ctx.font = '900 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SHIP →', 42, 102);

  // Arrow 3: REPEAT (Green)
  ctx.fillStyle = MID_GREEN;
  roundRect(ctx, 5, 135, 120, 42, 8);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = SUN_YELLOW;
  ctx.font = '900 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('REPEAT →', 65, 162);

  ctx.restore();
}

function drawHeader(ctx: CanvasRenderingContext2D, box: { x: number; y: number; w: number; h: number }) {
  // Left Vintage Stamp
  drawVintageStamp(ctx, box.x + 10, box.y);

  // Center Main Title: HACKER [गोवा] HOUSE
  let cx = box.x + 230;
  ctx.font = '900 54px sans-serif';
  ctx.fillStyle = DEEP_GREEN;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('HACKER', cx, box.y + 45);
  cx += ctx.measureText('HACKER').width + 18;

  // Devanagari Goa Badge
  ctx.fillStyle = HOT_PINK;
  roundRect(ctx, cx, box.y + 14, 96, 56, 12);
  ctx.fill();
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 3; ctx.stroke();

  ctx.fillStyle = CREAM;
  ctx.font = '900 28px serif';
  ctx.textAlign = 'center';
  ctx.fillText('गोवा', cx + 48, box.y + 44);
  cx += 96 + 18;

  ctx.font = '900 54px sans-serif';
  ctx.fillStyle = DEEP_GREEN;
  ctx.textAlign = 'left';
  ctx.fillText('HOUSE', cx, box.y + 45);
  cx += ctx.measureText('HOUSE').width + 20;

  ctx.fillStyle = CORAL_ORANGE;
  ctx.font = '900 42px sans-serif';
  ctx.fillText('2026', cx, box.y + 45);

  // Subtitle line
  ctx.fillStyle = 'rgba(8, 38, 30, 0.7)';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('28 - 31 OCT 2026 • ANJUNA BEACH, GOA • BUILDER FIELD PASS', box.x + 230, box.y + 88);

  // Right Travel Seal
  drawCircularSeal(ctx, box.x + box.w - 110, box.y + 50);

  // Hairline separator
  ctx.strokeStyle = 'rgba(8, 38, 30, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(box.x, box.y + box.h - 5); ctx.lineTo(box.x + box.w, box.y + box.h - 5); ctx.stroke();
}

function drawPortrait(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, imageObj?: HTMLImageElement | null) {
  // Layered Concentric Rings (Yellow, Pink, Green)
  ctx.save();
  ctx.translate(cx, cy);

  // Sunburst Ray Doodles behind photo
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.6)';
  ctx.lineWidth = 3;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (radius + 8), Math.sin(a) * (radius + 8));
    ctx.lineTo(Math.cos(a) * (radius + 22), Math.sin(a) * (radius + 22));
    ctx.stroke();
  }

  // Outer Yellow ring
  ctx.strokeStyle = SUN_YELLOW;
  ctx.lineWidth = 14;
  ctx.beginPath(); ctx.arc(0, 0, radius + 7, 0, Math.PI * 2); ctx.stroke();

  // Pink ring
  ctx.strokeStyle = HOT_PINK;
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(0, 0, radius + 2, 0, Math.PI * 2); ctx.stroke();

  // Green inner border
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(0, 0, radius - 2, 0, Math.PI * 2); ctx.stroke();

  // Circular Clip for Photo
  ctx.beginPath();
  ctx.arc(0, 0, radius - 6, 0, Math.PI * 2);
  ctx.clip();

  if (imageObj && imageObj.complete && imageObj.naturalWidth > 0) {
    const size = (radius - 6) * 2;
    const imgRatio = imageObj.naturalWidth / imageObj.naturalHeight;
    let drawW = size;
    let drawH = size;
    let drawX = -radius + 6;
    let drawY = -radius + 6;

    if (imgRatio > 1) {
      drawW = size * imgRatio;
      drawX = -drawW / 2;
    } else {
      drawH = size / imgRatio;
      drawY = -drawH / 2;
    }
    ctx.drawImage(imageObj, drawX, drawY, drawW, drawH);
  } else {
    ctx.fillStyle = MID_GREEN;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    ctx.fillStyle = SUN_YELLOW;
    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏝️', 0, -10);
  }

  ctx.restore();
}

// ─── Core Card Rendering Engine ──────────────────────────────────────────────

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

  // Draw Static Base Layer or retrieve from cache
  if (!staticFrontCache) {
    staticFrontCache = document.createElement('canvas');
    staticFrontCache.width = w;
    staticFrontCache.height = h;
    const sCtx = staticFrontCache.getContext('2d');
    if (sCtx) {
      drawSecurityBackground(sCtx, w, h);
      drawHeader(sCtx, { x: 70, y: 55, w: w - 140, h: 110 });
      drawSignpost(sCtx, 90, 240);
      drawCuteGoaDoodles(sCtx);
    }
  }
  ctx.drawImage(staticFrontCache, 0, 0);

  // Dynamic Layer Composition

  // 1. Center Hero Portrait (cx: 800, cy: 370, radius: 170px)
  drawPortrait(ctx, 800, 370, 170, loadedImg);

  // 2. Nameplate Ribbon below photo
  const nameBoxW = 540;
  const nameBoxX = 800 - nameBoxW / 2;
  const nameBoxY = 560;
  ctx.fillStyle = DEEP_GREEN;
  roundRect(ctx, nameBoxX, nameBoxY, nameBoxW, 64, 16);
  ctx.fill();
  ctx.strokeStyle = SUN_YELLOW;
  ctx.lineWidth = 3;
  ctx.stroke();

  const nameText = (data.name || 'SANTHOSH KUMAR').toUpperCase();
  fitTextToBox(ctx, nameText, { x: nameBoxX, y: nameBoxY, w: nameBoxW, h: 64 }, 44, 24, 'sans-serif', '900', CREAM, 'center');

  // 3. Role Pill below nameplate
  const roleBoxW = 420;
  const roleBoxX = 800 - roleBoxW / 2;
  const roleBoxY = 636;
  ctx.fillStyle = SUN_YELLOW;
  roundRect(ctx, roleBoxX, roleBoxY, roleBoxW, 44, 12);
  ctx.fill();
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  const roleText = `⚡ ${(data.role || 'FULLSTACK DEVELOPER').toUpperCase()} ⚡`;
  fitTextToBox(ctx, roleText, { x: roleBoxX, y: roleBoxY, w: roleBoxW, h: 44 }, 20, 13, 'monospace', '900', DEEP_GREEN, 'center');

  // 4. Dynamic Y Reflow Cursor for Metadata
  let leftY = 480;
  const leftX = 90;
  const leftW = 380;

  // Stack Tags (Left Column below signpost)
  ctx.fillStyle = DEEP_GREEN;
  ctx.font = '900 13px monospace';
  ctx.fillText('⚡ TECHNICAL SPECS', leftX, leftY);
  leftY += 24;

  const stackStr = (data.stack || 'PYTHON · AI · REACT').toUpperCase();
  fitTextToBox(ctx, stackStr, { x: leftX, y: leftY, w: leftW, h: 32 }, 18, 12, 'monospace', 'bold', DEEP_GREEN, 'left');
  leftY += 45;

  // CONDITIONAL TEAM NAME DISPLAY (Left Column)
  if (data.teamName && data.teamName.trim().length > 0) {
    ctx.fillStyle = HOT_PINK;
    ctx.font = '900 12px monospace';
    ctx.fillText('🚩 TEAM EXPEDITION', leftX, leftY);
    leftY += 22;

    const teamText = `[ ${data.teamName.trim().toUpperCase()} ]`;
    fitTextToBox(ctx, teamText, { x: leftX, y: leftY, w: leftW, h: 32 }, 22, 14, 'monospace', '900', DEEP_GREEN, 'left');
    leftY += 45;
  }

  // 5. Right Column (QR Code & Location Sticker)
  const rightX = 1180;
  const rightY = 240;
  const qrW = 270;

  // QR Container Stamp Box
  ctx.fillStyle = CREAM;
  ctx.fillRect(rightX, rightY, qrW, qrW);
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 4;
  ctx.strokeRect(rightX, rightY, qrW, qrW);

  try {
    const qrPayload = JSON.stringify({
      passport: data.passportNumber,
      name: data.name,
      role: data.role,
      team: data.teamName || null,
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 250,
      color: { dark: '#08261E', light: '#FAF5E8' },
    });
    const img = new Image();
    await new Promise((res) => { img.onload = res; img.src = qrDataUrl; });
    ctx.drawImage(img, rightX + 10, rightY + 10, qrW - 20, qrW - 20);
  } catch (err) {
    ctx.fillStyle = DEEP_GREEN;
    fitTextToBox(ctx, 'SCAN BUILDER', { x: rightX, y: rightY, w: qrW, h: qrW }, 22, 14, 'monospace', 'bold', DEEP_GREEN, 'center');
  }

  ctx.fillStyle = DEEP_GREEN;
  ctx.font = '900 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SCAN TO VERIFY PASSPORT', rightX + qrW / 2, rightY + qrW + 24);

  // Sticker: LET'S BUILD!
  ctx.save();
  ctx.translate(rightX + qrW - 20, rightY + 30);
  ctx.rotate(0.18);
  ctx.fillStyle = SUN_YELLOW;
  roundRect(ctx, -55, -20, 110, 40, 8);
  ctx.fill();
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = DEEP_GREEN;
  ctx.font = '900 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText("LET'S BUILD!", 0, 2);
  ctx.restore();

  // 6. Bottom Row: Currently Building / Tagline
  let bottomY = 705;
  const centerW = 600;
  const centerX = 800 - centerW / 2;

  if (data.tagline && data.tagline.trim()) {
    ctx.fillStyle = 'rgba(8, 38, 30, 0.7)';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✦ CURRENTLY SHIPPING ✦', 800, bottomY);
    bottomY += 20;

    fitTextToBox(ctx, `"${data.tagline.trim()}"`, { x: centerX, y: bottomY, w: centerW, h: 36 }, 22, 14, 'serif', 'italic', HOT_PINK, 'center');
    bottomY += 45;
  }

  // Builder Loadout Chips
  ctx.fillStyle = DEEP_GREEN;
  ctx.font = '900 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('✦ BUILDER LOADOUT / FIELD KIT ✦', 800, bottomY);
  bottomY += 25;

  const loadout = data.loadout || ['⚡ PYTHON', '💻 VS CODE', '☕ GOA ESPRESSO', '🏖️ BEACH VIBES'];
  let loadX = 800 - 320;
  loadout.slice(0, 4).forEach((item) => {
    ctx.font = 'bold 13px monospace';
    const itemW = ctx.measureText(item).width + 24;
    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = DEEP_GREEN;
    ctx.lineWidth = 2;
    roundRect(ctx, loadX, bottomY, itemW, 32, 6);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = DEEP_GREEN;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(item, loadX + itemW / 2, bottomY + 16);
    loadX += itemW + 12;
  });

  // 7. Footer Bar (y: 890)
  const ftY = 890;
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(70, ftY); ctx.lineTo(w - 70, ftY); ctx.stroke();

  // Builder ID Text
  ctx.fillStyle = DEEP_GREEN;
  ctx.font = '900 13px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('BUILDER ID:', 80, ftY + 30);

  const passportNumber = data.passportNumber || 'HHG26-8942-SF';
  fitTextToBox(ctx, passportNumber, { x: 80, y: ftY + 48, w: 320, h: 36 }, 30, 16, 'monospace', '900', DEEP_GREEN, 'left');

  // Barcode Banner
  const bX = 460;
  const bW = 380;
  const bH = 54;
  const bY = ftY + 22;
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

  // Hot Pink #FRAMEINGOA Banner
  const tagW = 280;
  const tagX = w - 80 - tagW;
  ctx.fillStyle = HOT_PINK;
  roundRect(ctx, tagX, ftY + 22, tagW, 54, 12);
  ctx.fill();
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = CREAM;
  ctx.font = '900 22px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('#FRAMEINGOA', tagX + tagW / 2, ftY + 22 + 27);

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
      drawSecurityBackground(sCtx, w, h);
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
  ctx.fillStyle = MID_GREEN;
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
