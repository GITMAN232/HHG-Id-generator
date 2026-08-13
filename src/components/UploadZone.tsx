import React, { useRef, useState } from 'react';
import { Upload, Camera, RefreshCw, Trash2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { optimizeImageDataUrl } from '../utils/imageOptimizer';

interface UploadZoneProps {
  photoUrl: string | null;
  onPhotoSelect: (url: string | null) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ photoUrl, onPhotoSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const processFile = (file: File) => {
    setIsOptimizing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawUrl = event.target?.result as string;
      // Downscale photo to max 1024px to prevent WebGL texture degradation
      const optimizedUrl = await optimizeImageDataUrl(rawUrl, 1024);
      onPhotoSelect(optimizedUrl);
      setIsOptimizing(false);
      sounds.playSuccess();
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-mono font-bold text-sand-gold tracking-widest uppercase mb-2">
        1. PASSPORT AVATAR / PHOTO
      </label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp, image/heic"
        className="hidden"
      />

      {photoUrl ? (
        <div className="relative rounded-2xl border-2 border-sand-gold/50 p-4 bg-goa-darkest/80 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-4">
            <img
              src={photoUrl}
              alt="Uploaded avatar"
              className="w-16 h-16 rounded-xl object-cover border border-sand-gold/40 shadow-md"
            />
            <div>
              <div className="text-sm font-bold text-white font-mono flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>PHOTO LOADED & OPTIMIZED</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">1024px WebGL optimized preview</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                fileInputRef.current?.click();
              }}
              className="p-2 rounded-xl bg-goa-medium border border-sand-gold/30 text-sand-gold hover:border-sand-gold transition"
              title="Replace Photo"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onPhotoSelect(null);
              }}
              className="p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 hover:border-red-500 transition"
              title="Remove Photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            sounds.playClick();
            fileInputRef.current?.click();
          }}
          className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-3 ${
            isDragging
              ? 'border-pink-neon bg-pink-neon/10 scale-102'
              : 'border-sand-gold/30 bg-goa-medium/30 hover:border-sand-gold hover:bg-goa-medium/50'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-sand-gold/10 border border-sand-gold/30 flex items-center justify-center text-sand-gold">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200 font-mono">
              {isOptimizing ? 'OPTIMIZING PHOTO...' : 'UPLOAD BUILDER PASSPORT PHOTO'}
            </p>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Drag & drop or click • PNG, JPG, WEBP
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
