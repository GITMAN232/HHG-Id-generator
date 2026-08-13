import React, { useEffect, useState } from 'react';
import { BuilderData } from '../../types/builder';
import { createCardFrontCanvas } from '../../utils/cardRenderer2D';

interface CardPreviewProps {
  data: BuilderData;
  className?: string;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ data, className = '' }) => {
  const [imgUrl, setImgUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const generatePreview = async () => {
      try {
        const canvas = await createCardFrontCanvas(data);
        if (!cancelled) {
          setImgUrl(canvas.toDataURL('image/jpeg', 0.9));
        }
      } catch (err) {
        console.error('Failed to generate preview:', err);
      }
    };

    const timer = setTimeout(generatePreview, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [data]);

  if (!imgUrl) {
    return (
      <div className={`flex items-center justify-center bg-goa-darkest border border-sand-gold/20 rounded-xl aspect-[1.587] ${className}`}>
        <div className="text-sand-gold/50 font-mono text-sm uppercase animate-pulse">
          RENDERING ARTWORK...
        </div>
      </div>
    );
  }

  return (
    <img 
      src={imgUrl} 
      alt={`Passport for ${data.name}`}
      className={`rounded-xl shadow-lg border border-sand-gold/30 object-contain aspect-[1.587] ${className}`}
    />
  );
};
