import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { BuilderData } from '../../types/builder';
import { DeviceProfile } from '../../utils/deviceCapability';
import { sounds } from '../../utils/soundEffects';
import { createCardFrontCanvas, createCardBackCanvas, CARD_WIDTH, CARD_HEIGHT } from '../../utils/cardRenderer2D';

interface CardMeshProps {
  data: BuilderData;
  isFlipped: boolean;
  isMaterializing: boolean;
  onMaterializeComplete?: () => void;
  profile?: DeviceProfile;
}

export const CardMesh: React.FC<CardMeshProps> = ({
  data,
  isFlipped,
  isMaterializing,
  onMaterializeComplete,
  profile,
}) => {
  const { gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);

  // 1. Persistent textures (created once, updated in place)
  const frontCanvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = CARD_WIDTH;
    c.height = CARD_HEIGHT;
    return c;
  }, []);

  const backCanvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = CARD_WIDTH;
    c.height = CARD_HEIGHT;
    return c;
  }, []);

  const frontTexture = useMemo(() => {
    const tex = new THREE.CanvasTexture(frontCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [frontCanvas]);

  const backTexture = useMemo(() => {
    const tex = new THREE.CanvasTexture(backCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [backCanvas]);

  // Dispose textures on unmount
  useEffect(() => {
    return () => {
      frontTexture.dispose();
      backTexture.dispose();
    };
  }, [frontTexture, backTexture]);

  // 2. Render Canvas Textures via the Canvas Engine
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const renderTextures = async () => {
      try {
        const renderedFront = await createCardFrontCanvas(data);
        if (!cancelled) {
          const fCtx = frontCanvas.getContext('2d');
          if (fCtx) {
            fCtx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
            fCtx.drawImage(renderedFront, 0, 0);
            frontTexture.needsUpdate = true;
          }
        }

        const renderedBack = await createCardBackCanvas(data);
        if (!cancelled) {
          const bCtx = backCanvas.getContext('2d');
          if (bCtx) {
            bCtx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
            bCtx.drawImage(renderedBack, 0, 0);
            backTexture.needsUpdate = true;
          }
        }
      } catch (err) {
        console.error('[CardMesh] Canvas render failed:', err);
      }
    };

    // Initial render immediately, debounce subsequent data updates
    const renderTexturesImmediate = async () => {
      await renderTextures();
    };

    renderTexturesImmediate();

    const debounceTime = profile?.isMobile ? 100 : 120;
    timer = setTimeout(renderTextures, debounceTime);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [data, frontCanvas, backCanvas, frontTexture, backTexture, profile]);

  // 3. Animation State in Refs
  const animProgressRef = useRef<number>(1);
  const targetRotY = useRef<number>(0);
  const targetRotX = useRef<number>(0);
  const currentRotY = useRef<number>(0);
  const currentRotX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const previousMouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (isMaterializing) {
      // Faster entrance animation on mobile / reduced motion
      animProgressRef.current = profile?.prefersReducedMotion ? 0.8 : 0;
      sounds.playMaterialize();
    }
  }, [isMaterializing, profile]);

  useEffect(() => {
    targetRotY.current = isFlipped ? Math.PI : 0;
    sounds.playFlip();
  }, [isFlipped]);

  // Touch & Pointer event handling — TARGETED ONLY to canvas DOM element
  useEffect(() => {
    const domElement = gl.domElement;
    if (!domElement) return;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMouse.current.x;
      const deltaY = e.clientY - previousMouse.current.y;
      previousMouse.current = { x: e.clientX, y: e.clientY };
      
      const sensitivity = profile?.isMobile ? 0.008 : 0.006;
      targetRotY.current += deltaX * sensitivity;
      targetRotX.current += deltaY * sensitivity;
      targetRotX.current = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotX.current));
    };

    const handlePointerUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (!isFlipped) {
        targetRotY.current = Math.max(-0.6, Math.min(0.6, targetRotY.current));
      } else {
        targetRotY.current = Math.max(Math.PI - 0.6, Math.min(Math.PI + 0.6, targetRotY.current));
      }
      targetRotX.current *= 0.3;
    };

    domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [gl, isFlipped, profile]);

  // 4. Render loop
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (animProgressRef.current < 1) {
      const speed = profile?.isMobile ? 1.8 : 1.2;
      animProgressRef.current = Math.min(1, animProgressRef.current + delta * speed);
      const p = animProgressRef.current;
      const springEase = Math.sin(p * Math.PI * 0.5) + Math.sin(p * Math.PI * 1.5) * 0.08 * (1 - p);

      groupRef.current.position.z = -12 * (1 - springEase);
      groupRef.current.position.y = Math.sin(p * Math.PI) * 0.3;

      const s = 0.25 + 0.75 * springEase;
      groupRef.current.scale.set(s, s, s);

      currentRotY.current = -Math.PI * 0.5 * (1 - springEase) + targetRotY.current * springEase;
      currentRotX.current = targetRotX.current * springEase;

      if (animProgressRef.current >= 1 && onMaterializeComplete) {
        onMaterializeComplete();
      }
    } else {
      const damp = profile?.isMobile ? 0.18 : 0.12;
      currentRotY.current += (targetRotY.current - currentRotY.current) * damp;
      currentRotX.current += (targetRotX.current - currentRotX.current) * damp;

      // Subtle float effect (disabled if prefersReducedMotion)
      if (!profile?.prefersReducedMotion) {
        const t = state.clock.getElapsedTime();
        groupRef.current.position.y = Math.sin(t * 1.4) * 0.04;
        groupRef.current.position.x = Math.cos(t * 1.1) * 0.02;
      } else {
        groupRef.current.position.y = 0;
        groupRef.current.position.x = 0;
      }
      groupRef.current.position.z = 0;
      groupRef.current.scale.set(1, 1, 1);
    }

    groupRef.current.rotation.y = currentRotY.current;
    groupRef.current.rotation.x = currentRotX.current;

    if (spotLightRef.current && !profile?.isMobile) {
      const t = state.clock.getElapsedTime();
      spotLightRef.current.position.x = Math.sin(t * 2.2) * 5;
      spotLightRef.current.position.y = Math.cos(t * 1.8) * 3;
    }
  });

  // 1600x1008 is exactly 1.587:1
  const cardWidth = 3.6;
  const cardHeight = cardWidth / 1.5873;
  const cardThickness = 0.08;
  const edgeColor = '#E3C578';

  return (
    <group ref={groupRef}>
      {!profile?.isMobile && (
        <spotLight
          ref={spotLightRef}
          position={[3, 4, 5]}
          intensity={2.8}
          angle={0.6}
          penumbra={0.8}
          color="#FF2A85"
        />
      )}

      <mesh ref={meshRef} castShadow={profile?.shadowsEnabled} receiveShadow={profile?.shadowsEnabled}>
        <boxGeometry args={[cardWidth, cardHeight, cardThickness]} />

        <meshStandardMaterial attach="material-0" color={edgeColor} metalness={0.85} roughness={0.15} />
        <meshStandardMaterial attach="material-1" color={edgeColor} metalness={0.85} roughness={0.15} />
        <meshStandardMaterial attach="material-2" color={edgeColor} metalness={0.85} roughness={0.15} />
        <meshStandardMaterial attach="material-3" color={edgeColor} metalness={0.85} roughness={0.15} />

        <meshStandardMaterial attach="material-4" map={frontTexture} roughness={0.3} metalness={0.05} />
        <meshStandardMaterial attach="material-5" map={backTexture} roughness={0.3} metalness={0.05} />
      </mesh>
    </group>
  );
};
