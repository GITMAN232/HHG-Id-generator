import React from 'react';
import { Download, Share2, RotateCw, Users, Image as ImageIcon } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface CardControlsProps {
  isFlipped: boolean;
  onToggleFlip: () => void;
  onDownloadPng: () => void;
  onDownloadJpeg: () => void;
  onShare: () => void;
  onAddTeammate: () => void;
}

export const CardControls: React.FC<CardControlsProps> = ({
  isFlipped,
  onToggleFlip,
  onDownloadPng,
  onDownloadJpeg,
  onShare,
  onAddTeammate,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 pt-2">
      {/* Main Action Buttons Grid — Optimized for Mobile Touch Targets */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        {/* Flip Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onToggleFlip();
          }}
          className="min-h-[44px] py-3 px-2 sm:px-3 rounded-xl bg-goa-medium/80 border border-sand-gold/40 text-sand-gold font-mono font-bold text-xs uppercase tracking-wider hover:bg-goa-medium active:scale-98 transition flex items-center justify-center space-x-1.5 shadow-md"
        >
          <RotateCw className="w-4 h-4 shrink-0" />
          <span className="truncate">{isFlipped ? 'FRONT' : 'FLIP 3D'}</span>
        </button>

        {/* Download PNG Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onDownloadPng();
          }}
          className="min-h-[44px] py-3 px-2 sm:px-3 rounded-xl bg-gradient-to-r from-sand-gold to-sand-warm text-goa-darkest font-mono font-black text-xs uppercase tracking-wider shadow-gold-glow active:scale-98 transition flex items-center justify-center space-x-1.5"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>PNG</span>
        </button>

        {/* Download JPEG Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onDownloadJpeg();
          }}
          className="min-h-[44px] py-3 px-2 sm:px-3 rounded-xl bg-goa-light border border-sand-gold/50 text-sand-gold font-mono font-bold text-xs uppercase tracking-wider hover:border-sand-gold active:scale-98 transition flex items-center justify-center space-x-1.5 shadow-md"
        >
          <ImageIcon className="w-4 h-4 shrink-0" />
          <span>JPEG</span>
        </button>

        {/* Share to X Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onShare();
          }}
          className="min-h-[44px] py-3 px-2 sm:px-3 rounded-xl bg-pink-neon text-white font-mono font-bold text-xs uppercase tracking-wider shadow-pink-glow active:scale-98 transition flex items-center justify-center space-x-1.5"
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span>SHARE</span>
        </button>

        {/* Add Teammate Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onAddTeammate();
          }}
          className="col-span-2 xs:col-span-1 min-h-[44px] py-3 px-2 sm:px-3 rounded-xl bg-goa-light border border-cyber-cyan/50 text-cyber-cyan font-mono font-bold text-xs uppercase tracking-wider hover:border-cyber-cyan active:scale-98 transition flex items-center justify-center space-x-1.5 shadow-md"
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>+ TEAM</span>
        </button>
      </div>
    </div>
  );
};
