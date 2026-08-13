import React, { Suspense, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { CardMesh } from './CardMesh';
import { CardPreview } from './CardPreview';
import { BuilderData } from '../../types/builder';
import { getDeviceProfile } from '../../utils/deviceCapability';

interface CardCanvasProps {
  data: BuilderData;
  isFlipped: boolean;
  isMaterializing: boolean;
  onMaterializeComplete?: () => void;
  onCardClick?: () => void;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, WebGLErrorBoundaryState> {
  state: WebGLErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): WebGLErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[WebGL Fallback] WebGL rendering error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const CardCanvas: React.FC<CardCanvasProps> = ({
  data,
  isFlipped,
  isMaterializing,
  onMaterializeComplete,
  onCardClick,
}) => {
  const profile = useMemo(() => getDeviceProfile(), []);

  const flatFallback = (
    <div className="w-full h-full p-2 flex flex-col items-center justify-center cursor-pointer" onClick={onCardClick}>
      <CardPreview data={data} className="w-full max-w-lg shadow-2xl" />
      <p className="mt-2 text-xs font-mono text-sand-gold">2D FLAT PREVIEW (WEBGL FALLBACK ACTIVE)</p>
    </div>
  );

  return (
    <div
      className="relative w-full h-[320px] xs:h-[360px] sm:h-[440px] md:h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden rounded-2xl touch-pan-y"
      style={{ touchAction: 'pan-y' }}
    >
      <WebGLErrorBoundary fallback={flatFallback}>
        <Canvas
          camera={{ position: [0, 0, profile.isMobile ? 4.8 : 4.5], fov: 45 }}
          dpr={profile.maxDpr}
          gl={{
            preserveDrawingBuffer: true,
            antialias: profile.tier !== 'LOW',
            powerPreference: profile.isMobile ? 'low-power' : 'high-performance',
          }}
          onClick={onCardClick}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              console.warn('[WebGL] Context lost');
            });
          }}
        >
          <ambientLight intensity={profile.tier === 'LOW' ? 2.2 : 1.8} />
          <directionalLight
            position={[5, 6, 5]}
            intensity={2.0}
            castShadow={profile.shadowsEnabled}
            shadow-mapSize-width={profile.tier === 'HIGH' ? 1024 : 512}
            shadow-mapSize-height={profile.tier === 'HIGH' ? 1024 : 512}
          />
          <pointLight position={[-6, -4, -2]} intensity={0.9} color="#FAF6EE" />
          <pointLight position={[6, -4, 3]} intensity={1.2} color="#E3C578" />

          <Suspense fallback={null}>
            <CardMesh
              data={data}
              isFlipped={isFlipped}
              isMaterializing={isMaterializing}
              onMaterializeComplete={onMaterializeComplete}
              profile={profile}
            />
          </Suspense>

          {/* Soft shadow floor */}
          {profile.shadowsEnabled && (
            <mesh position={[0, -2.0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[12, 12]} />
              <shadowMaterial opacity={0.25} />
            </mesh>
          )}
        </Canvas>
      </WebGLErrorBoundary>

      {/* Floating 3D Interaction Hint overlay */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-goa-darkest/90 border border-sand-gold/40 text-sand-gold text-[11px] xs:text-xs font-mono backdrop-blur-md shadow-lg pointer-events-none flex items-center space-x-2 max-w-[90%] justify-center text-center">
        <span className="w-2 h-2 rounded-full bg-pink-neon animate-pulse shrink-0" />
        <span className="truncate">SWIPE TO ROTATE • TAP TO FLIP</span>
      </div>
    </div>
  );
};
