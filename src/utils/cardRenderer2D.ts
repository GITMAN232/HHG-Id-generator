/**
 * cardRenderer2D.ts — Master Illustrated Goa Builder Pass (Canvas 2D Engine)
 * 
 * Layer 1: MASTER 2D ARTWORK (SINGLE SOURCE OF TRUTH)
 * Output size is strictly 1600x1008 px (Landscape).
 * 
 * Aesthetic: Hand-illustrated Goa Postcard × Builder Passport × Collectible Souvenir
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

// ─── Color Tokens ────────────────────────────────────────────────────────────

const CREAM = '#FAF5E8';
const DEEP_GREEN = '#08261E';
const MID_GREEN = '#0D382C';
const SUN_YELLOW = '#FFD166';
const HOT_PINK = '#FF2A85';
const CORAL_ORANGE = '#FF6B35';

// ─── Illustrated Drawing Primitives ──────────────────────────────────────────

function drawSecurityBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // 1. Warm Cream Background
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, w, h);

  // Paper Dot Grid Texture
  ctx.fillStyle = 'rgba(8, 38, 30, 0.035)';
  for (let x = 20; x < w; x += 32) {
    for (let y = 20; y < h; y += 32) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  // 2. Outer Frame (Deep Green)
  const margin = 36;
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 14;
  roundRect(ctx, margin, margin, w - margin * 2, h - margin * 2, 26);
  ctx.stroke();

  // 3. Inner Accent Lines (Yellow & Pink registration)
  ctx.strokeStyle = SUN_YELLOW;
  ctx.lineWidth = 3;
  roundRect(ctx, margin + 12, margin + 12, w - (margin + 12) * 2, h - (margin + 12) * 2, 18);
  ctx.stroke();

  // Corner Stars (Pink & Yellow)
  const crX = [margin + 20, w - margin - 20];
  const crY = [margin + 20, h - margin - 20];
  crX.forEach((cx) => {
    crY.forEach((cy) => {
      ctx.fillStyle = HOT_PINK;
      ctx.font = '900 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', cx, cy);
    });
  });

  // Perimeter Microtext Line
  ctx.fillStyle = 'rgba(8, 38, 30, 0.45)';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'left';
  const marginText = '28 - 31 OCT 2026 ◆ GOA, INDIA ◆ BUILD / HACK / SHIP / CREATE ◆ HACKER HOUSE GOA ◆ ';
  ctx.fillText(marginText.repeat(5), 70, 68);
}

function drawVintageStamp(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  const sw = 140;
  const sh = 100;
  ctx.fillStyle = '#FFFDF8';
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 3;

  ctx.fillRect(0, 0, sw, sh);
  ctx.strokeRect(0, 0, sw, sh);

  ctx.fillStyle = MID_GREEN;
  ctx.fillRect(8, 8, sw - 16, sh - 16);

  ctx.fillStyle = SUN_YELLOW;
  ctx.beginPath(); ctx.arc(sw / 2, 45, 18, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#FFFDF8';
  ctx.font = '900 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GOA • INDIA', sw / 2, sh - 16);

  // Red Wavy Cancellation Mark over stamp
  ctx.strokeStyle = 'rgba(255, 42, 133, 0.75)';
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

  ctx.strokeStyle = 'rgba(8, 38, 30, 0.75)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, 54, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.stroke();

  ctx.fillStyle = DEEP_GREEN;
  ctx.font = '900 10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillText('★ BUILD IN GOA ★', 0, -22);
  ctx.fillText('🌴', 0, -5);
  ctx.fillText('SHIP FROM PARADISE', 0, 15);
  ctx.fillText('2026 OFFICIAL', 0, 32);

  ctx.restore();
}

function drawHeader(ctx: CanvasRenderingContext2D, box: { x: number; y: number; w: number; h: number }) {
  // Left Vintage Postage Stamp
  drawVintageStamp(ctx, box.x + 10, box.y);

  // Center Main Title: HACKER [गोवा] HOUSE 2026
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
  ctx.fillStyle = 'rgba(8, 38, 30, 0.75)';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('28 - 31 OCT 2026 ◆ GOA, INDIA ◆ BUILD / HACK / SHIP / CREATE', box.x + 230, box.y + 88);

  // Right Circular Travel Seal
  drawCircularSeal(ctx, box.x + box.w - 110, box.y + 50);

  // Hairline separator
  ctx.strokeStyle = 'rgba(8, 38, 30, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(box.x, box.y + box.h - 5); ctx.lineTo(box.x + box.w, box.y + box.h - 5); ctx.stroke();
}

function drawLeftSignpost(ctx: CanvasRenderingContext2D, x: number, y: number) {
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

function drawRightSignpost(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Pole
  ctx.fillStyle = '#8B5A2B';
  ctx.fillRect(40, 0, 14, 180);
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(40, 0, 14, 180);

  // Arrow 1: BEACH (Pink)
  ctx.fillStyle = HOT_PINK;
  roundRect(ctx, -10, 15, 105, 36, 6);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FFFDF8';
  ctx.font = '900 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BEACH →', 42, 38);

  // Arrow 2: CODE (Green)
  ctx.fillStyle = MID_GREEN;
  roundRect(ctx, 5, 65, 98, 36, 6);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = SUN_YELLOW;
  ctx.font = '900 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CODE →', 54, 88);

  // Arrow 3: COCONUT (Yellow)
  ctx.fillStyle = SUN_YELLOW;
  roundRect(ctx, -15, 115, 115, 36, 6);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = DEEP_GREEN;
  ctx.font = '900 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('COCONUT →', 42, 138);

  ctx.restore();
}

function drawCoconutDrink(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Coconut shell
  ctx.fillStyle = '#8B5A2B';
  ctx.beginPath(); ctx.arc(30, 30, 24, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 3; ctx.stroke();

  // Coconut inner opening
  ctx.fillStyle = '#FFFDF8';
  ctx.beginPath(); ctx.arc(30, 14, 14, 0, Math.PI * 2); ctx.fill();

  // Straw (Pink)
  ctx.strokeStyle = HOT_PINK;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(30, 14); ctx.lineTo(44, -6); ctx.stroke();

  // Umbrella (Yellow)
  ctx.fillStyle = SUN_YELLOW;
  ctx.beginPath(); ctx.arc(16, 2, 12, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 2; ctx.stroke();

  ctx.restore();
}

function drawSmilingSun(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Sun Rays
  ctx.strokeStyle = SUN_YELLOW;
  ctx.lineWidth = 3;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 22, Math.sin(a) * 22);
    ctx.lineTo(Math.cos(a) * 32, Math.sin(a) * 32);
    ctx.stroke();
  }

  // Sun Circle
  ctx.fillStyle = SUN_YELLOW;
  ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 2.5; ctx.stroke();

  // Smiling Face
  ctx.fillStyle = DEEP_GREEN;
  ctx.beginPath(); ctx.arc(-6, -4, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6, -4, 2.5, 0, Math.PI * 2); ctx.fill();

  ctx.beginPath(); ctx.arc(0, 2, 8, 0, Math.PI); ctx.stroke();

  ctx.restore();
}

function drawGoaMapOutline(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(35, 5);
  ctx.lineTo(45, 25);
  ctx.lineTo(30, 55);
  ctx.lineTo(15, 60);
  ctx.lineTo(5, 40);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = HOT_PINK;
  ctx.font = '900 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GOA', 25, 26);
  ctx.fillText('♡ INDIA', 25, 38);

  ctx.restore();
}

function drawLeftBeachScene(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Waves
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-10, 140);
  for (let wx = -10; wx < 320; wx += 20) {
    ctx.quadraticCurveTo(wx + 10, 140 + (wx % 40 === 0 ? 6 : -6), wx + 20, 140);
  }
  ctx.stroke();

  // Palm Tree
  ctx.fillStyle = '#8B5A2B';
  ctx.fillRect(35, 20, 14, 120);
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 2.5; ctx.strokeRect(35, 20, 14, 120);

  // Palm Leaves
  ctx.fillStyle = MID_GREEN;
  [[-15, 10], [10, -10], [40, -15], [65, 5], [50, 25]].forEach(([lx, ly]) => {
    ctx.beginPath(); ctx.ellipse(42 + lx, 20 + ly, 28, 12, lx * 0.02, 0, Math.PI * 2); ctx.fill();
    ctx.stroke();
  });

  // Beach Shack with "CODE" sign
  ctx.fillStyle = SUN_YELLOW;
  ctx.fillRect(110, 60, 90, 75);
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 3; ctx.strokeRect(110, 60, 90, 75);

  // Roof
  ctx.fillStyle = '#8B5A2B';
  ctx.beginPath(); ctx.moveTo(95, 60); ctx.lineTo(155, 25); ctx.lineTo(215, 60); ctx.closePath(); ctx.fill(); ctx.stroke();

  // "CODE" Sign on shack
  ctx.fillStyle = MID_GREEN;
  roundRect(ctx, 130, 80, 50, 24, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = SUN_YELLOW;
  ctx.font = '900 12px monospace'; ctx.textAlign = 'center'; ctx.fillText('CODE', 155, 96);

  // Surfboard in sand
  ctx.save();
  ctx.translate(22, 50);
  ctx.rotate(-0.15);
  ctx.fillStyle = HOT_PINK;
  ctx.beginPath(); ctx.ellipse(0, 0, 14, 50, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.restore();

  // Laptop Table & Chair
  ctx.fillStyle = '#8B5A2B';
  ctx.fillRect(220, 95, 45, 40); ctx.strokeRect(220, 95, 45, 40);
  ctx.fillStyle = DEEP_GREEN;
  ctx.fillRect(230, 80, 25, 15); ctx.strokeRect(230, 80, 25, 15);

  ctx.restore();
}

function drawRightScooterScene(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Pink Vintage Goa Scooter
  ctx.fillStyle = HOT_PINK;
  roundRect(ctx, 30, 40, 100, 45, 16); ctx.fill();
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 3; ctx.stroke();

  // Scooter Wheels
  ctx.fillStyle = DEEP_GREEN;
  ctx.beginPath(); ctx.arc(45, 85, 22, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(115, 85, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = CREAM;
  ctx.beginPath(); ctx.arc(45, 85, 10, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(115, 85, 10, 0, Math.PI * 2); ctx.fill();

  // Scooter Handlebars & Headlight
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(110, 40); ctx.lineTo(125, 5); ctx.stroke();
  ctx.fillStyle = SUN_YELLOW;
  ctx.beginPath(); ctx.arc(125, 5, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // Surfboard attached to Scooter
  ctx.save();
  ctx.translate(60, 20);
  ctx.rotate(0.25);
  ctx.fillStyle = SUN_YELLOW;
  ctx.beginPath(); ctx.ellipse(0, 0, 12, 55, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function drawPortrait(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, imageObj?: HTMLImageElement | null) {
  ctx.save();
  ctx.translate(cx, cy);

  // Sawtooth Sunburst Ray Border (Yellow)
  ctx.fillStyle = SUN_YELLOW;
  const numTeeth = 28;
  ctx.beginPath();
  for (let i = 0; i < numTeeth; i++) {
    const angle1 = (i / numTeeth) * Math.PI * 2;
    const angle2 = ((i + 0.5) / numTeeth) * Math.PI * 2;
    const r1 = radius + 22;
    const r2 = radius + 8;
    ctx.lineTo(Math.cos(angle1) * r1, Math.sin(angle1) * r1);
    ctx.lineTo(Math.cos(angle2) * r2, Math.sin(angle2) * r2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 2.5; ctx.stroke();

  // Inner Hot Pink Ring
  ctx.strokeStyle = HOT_PINK;
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(0, 0, radius + 4, 0, Math.PI * 2); ctx.stroke();

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

// ─── Master Canvas Engine ───────────────────────────────────────────────────

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
      drawLeftSignpost(sCtx, 90, 240);
      drawRightSignpost(sCtx, 1400, 710);
      drawCoconutDrink(sCtx, 220, 240);
      drawSmilingSun(sCtx, 1080, 220);
      drawGoaMapOutline(sCtx, 1100, 480);
      drawLeftBeachScene(sCtx, 60, 710);
      drawRightScooterScene(sCtx, 1130, 710);
    }
  }
  ctx.drawImage(staticFrontCache, 0, 0);

  // Dynamic Layer Composition

  // 1. Center Hero Portrait (cx: 800, cy: 375, radius: 160px)
  drawPortrait(ctx, 800, 375, 160, loadedImg);

  // 2. Nameplate Ribbon below photo
  const nameBoxW = 560;
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
  const roleBoxW = 460;
  const roleBoxX = 800 - roleBoxW / 2;
  const roleBoxY = 636;
  ctx.fillStyle = SUN_YELLOW;
  roundRect(ctx, roleBoxX, roleBoxY, roleBoxW, 42, 12);
  ctx.fill();
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  const roleText = `⚡ ${(data.role || 'FULLSTACK DEVELOPER').toUpperCase()} ⚡`;
  fitTextToBox(ctx, roleText, { x: roleBoxX, y: roleBoxY, w: roleBoxW, h: 42 }, 20, 13, 'monospace', '900', DEEP_GREEN, 'center');

  // 4. Dynamic Y Reflow Cursor for Left Metadata
  let leftY = 480;
  const leftX = 220;
  const leftW = 280;

  // Stack Tags
  ctx.fillStyle = HOT_PINK;
  ctx.font = '900 13px monospace';
  ctx.fillText('STACK', leftX, leftY);
  leftY += 20;

  const stackStr = (data.stack || 'PYTHON, AI, REACT, CYBERSECURITY').toUpperCase();
  fitTextToBox(ctx, stackStr, { x: leftX, y: leftY, w: leftW, h: 32 }, 16, 11, 'monospace', 'bold', DEEP_GREEN, 'left');
  leftY += 42;

  // CONDITIONAL TEAM NAME DISPLAY
  if (data.teamName && data.teamName.trim().length > 0) {
    ctx.fillStyle = HOT_PINK;
    ctx.font = '900 13px monospace';
    ctx.fillText('TEAM', leftX, leftY);
    leftY += 20;

    const teamText = `[ ${data.teamName.trim().toUpperCase()} ]`;
    fitTextToBox(ctx, teamText, { x: leftX, y: leftY, w: leftW, h: 32 }, 20, 13, 'monospace', '900', DEEP_GREEN, 'left');
    leftY += 42;
  }

  // 5. Upper Right QR Code & Stamp Box
  const rightX = 1180;
  const rightY = 240;
  const qrW = 260;

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
      width: 240,
      color: { dark: '#08261E', light: '#FAF5E8' },
    });
    const img = new Image();
    await new Promise((res) => { img.onload = res; img.src = qrDataUrl; });
    ctx.drawImage(img, rightX + 10, rightY + 10, qrW - 20, qrW - 20);
  } catch (err) {
    ctx.fillStyle = DEEP_GREEN;
    fitTextToBox(ctx, 'SCAN ME', { x: rightX, y: rightY, w: qrW, h: qrW }, 22, 14, 'monospace', 'bold', DEEP_GREEN, 'center');
  }

  ctx.fillStyle = DEEP_GREEN;
  ctx.font = '900 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BUILDER PROFILE', rightX + qrW / 2, rightY + qrW + 20);

  // Sticker: SCAN ME
  ctx.save();
  ctx.translate(rightX + qrW - 15, rightY + 15);
  ctx.rotate(0.18);
  ctx.fillStyle = SUN_YELLOW;
  roundRect(ctx, -45, -16, 90, 32, 6);
  ctx.fill();
  ctx.strokeStyle = DEEP_GREEN; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = DEEP_GREEN;
  ctx.font = '900 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SCAN ME', 0, 2);
  ctx.restore();

  // 6. Center Lower Section (Tagline & Loadout)
  let bottomY = 695;
  const centerW = 560;
  const centerX = 800 - centerW / 2;

  if (data.tagline && data.tagline.trim()) {
    fitTextToBox(ctx, `"${data.tagline.trim()}"`, { x: centerX, y: bottomY, w: centerW, h: 32 }, 20, 13, 'serif', 'italic', HOT_PINK, 'center');
    bottomY += 38;
  }

  // Builder Loadout Header
  ctx.fillStyle = DEEP_GREEN;
  ctx.font = '900 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('✩ ✩ BUILDER LOADOUT ✩ ✩', 800, bottomY);
  bottomY += 22;

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
    roundRect(ctx, loadX, bottomY, itemW, 30, 6);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = DEEP_GREEN;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(label, loadX + itemW / 2, bottomY + 15);
    loadX += itemW + 10;
  });

  // 7. Footer Bar (y: 890)
  const ftY = 890;
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(60, ftY); ctx.lineTo(w - 60, ftY); ctx.stroke();

  // Builder ID Text
  ctx.fillStyle = HOT_PINK;
  ctx.font = '900 11px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('BUILDER ID', 70, ftY + 20);

  const passportNumber = data.passportNumber || 'HHG26-9216-MG';
  fitTextToBox(ctx, passportNumber, { x: 70, y: ftY + 36, w: 280, h: 32 }, 26, 16, 'monospace', '900', DEEP_GREEN, 'left');

  // Seashell Icon
  ctx.fillStyle = HOT_PINK;
  ctx.font = '18px sans-serif';
  ctx.fillText('🐚', 360, ftY + 36);

  // Barcode Banner
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

  // LIMITED EDITION Wavy Stamp
  ctx.save();
  ctx.translate(w - 380, ftY + 16);
  ctx.strokeStyle = HOT_PINK; ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 110, 48);
  ctx.fillStyle = HOT_PINK;
  ctx.font = '900 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LIMITED', 55, 18);
  ctx.fillText('EDITION', 55, 32);
  ctx.restore();

  // Hot Pink #FRAMEINGOA Banner
  const tagW = 240;
  const tagX = w - 60 - tagW;
  ctx.fillStyle = HOT_PINK;
  roundRect(ctx, tagX, ftY + 16, tagW, 48, 12);
  ctx.fill();
  ctx.strokeStyle = DEEP_GREEN;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = CREAM;
  ctx.font = '900 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🌴 #FRAMEINGOA 🌴', tagX + tagW / 2, ftY + 16 + 24);

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
