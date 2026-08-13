/**
 * deviceCapability.ts
 * 
 * Lightweight capability and device tier detection for Mobile-First optimization.
 * Classifies devices into HIGH, MEDIUM, LOW performance tiers.
 */

export type PerformanceTier = 'HIGH' | 'MEDIUM' | 'LOW';

export interface DeviceProfile {
  isMobile: boolean;
  tier: PerformanceTier;
  maxDpr: number;
  prefersReducedMotion: boolean;
  maxTextureSize: number;
  shadowsEnabled: boolean;
}

let cachedProfile: DeviceProfile | null = null;

export function getDeviceProfile(): DeviceProfile {
  if (cachedProfile) return cachedProfile;

  const isServer = typeof window === 'undefined';
  if (isServer) {
    return {
      isMobile: false,
      tier: 'HIGH',
      maxDpr: 1.5,
      prefersReducedMotion: false,
      maxTextureSize: 1024,
      shadowsEnabled: true,
    };
  }

  const userAgent = navigator.userAgent || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || window.innerWidth < 768;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hardware concurrency & Memory heuristics
  const concurrency = navigator.hardwareConcurrency || 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;

  let tier: PerformanceTier = 'HIGH';

  if (isMobile) {
    if (concurrency <= 4 || memory <= 2) {
      tier = 'LOW';
    } else {
      tier = 'MEDIUM';
    }
  } else {
    if (concurrency <= 2 || memory <= 2) {
      tier = 'MEDIUM';
    }
  }

  // Determine DPR cap based on tier
  let maxDpr = 1.5;
  if (tier === 'LOW') {
    maxDpr = 1.0;
  } else if (tier === 'MEDIUM') {
    maxDpr = 1.25;
  } else {
    maxDpr = Math.min(window.devicePixelRatio || 1, 1.5);
  }

  // Max texture size & shadow toggles
  const maxTextureSize = tier === 'LOW' ? 1024 : 1536;
  const shadowsEnabled = tier !== 'LOW';

  cachedProfile = {
    isMobile,
    tier,
    maxDpr,
    prefersReducedMotion,
    maxTextureSize,
    shadowsEnabled,
  };

  return cachedProfile;
}
