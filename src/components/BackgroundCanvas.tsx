import React, { useEffect, useRef } from 'react';
import { getDeviceProfile } from '../utils/deviceCapability';

export const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const profile = getDeviceProfile();
    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Dynamic particle count based on device capability
    const particleCount = profile.prefersReducedMotion ? 0 : profile.tier === 'LOW' ? 12 : profile.isMobile ? 20 : 45;

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3 - 0.1,
      opacity: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.6 ? '#FFD166' : Math.random() > 0.3 ? '#FF2A85' : '#206B5E',
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep Goa ambient radial glow
      const radialGradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.3,
        50,
        width * 0.5,
        height * 0.3,
        Math.max(width, height) * 0.8
      );
      radialGradient.addColorStop(0, 'rgba(15, 56, 48, 0.45)');
      radialGradient.addColorStop(0.5, 'rgba(11, 43, 38, 0.8)');
      radialGradient.addColorStop(1, 'rgba(4, 21, 18, 0.98)');

      ctx.fillStyle = radialGradient;
      ctx.fillRect(0, 0, width, height);

      // Render floating particles
      if (particleCount > 0) {
        particles.forEach((p) => {
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fill();
        });
      }

      ctx.globalAlpha = 1;

      // On reduced motion, draw once and don't request frame loops
      if (!profile.prefersReducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};
