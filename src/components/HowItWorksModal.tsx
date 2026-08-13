import React from 'react';
import { HelpCircle, Upload, Dna, RotateCw, Download, X, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface HowItWorksModalProps {
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onClose }) => {
  const steps = [
    {
      num: '01',
      title: 'UPLOAD AVATAR',
      desc: 'Upload your photo (JPG, PNG, WEBP, HEIC). Automatic fitting handles aspect ratios without manual cropping.',
      icon: Upload,
    },
    {
      num: '02',
      title: 'BUILD IDENTITY',
      desc: 'Enter your name, role, stack, and optional team name. Your loadout, QR, and skill DNA metrics are generated live.',
      icon: Dna,
    },
    {
      num: '03',
      title: '3D MATERIALIZE',
      desc: 'Watch your passport fly into view with spring physics, metallic lighting, and holographic security seals.',
      icon: RotateCw,
    },
    {
      num: '04',
      title: 'INTERACT & EXPORT',
      desc: 'Drag to rotate 3D angles, tap/click to flip to the back stats & QR code, and export high-res print PNGs.',
      icon: Download,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-goa-darkest/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-2xl w-full glass-panel-dark p-6 sm:p-8 rounded-3xl border border-sand-gold/40 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-goa-medium text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-sand-gold/20 pb-4">
          <div className="w-10 h-10 rounded-xl bg-sand-gold/20 border border-sand-gold/40 flex items-center justify-center text-sand-gold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl font-black font-display uppercase tracking-wider text-white">
              HOW IT WORKS
            </h3>
            <p className="text-xs font-mono text-sand-gold">
              HACKER HOUSE GOA 2026 // PASSPORT GENERATION PROTOCOL
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-5 rounded-2xl bg-goa-medium/40 border border-sand-gold/20 space-y-2 hover:border-sand-gold/50 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-pink-neon">STEP {step.num}</span>
                  <Icon className="w-5 h-5 text-sand-gold" />
                </div>
                <h4 className="text-sm font-bold font-mono text-white uppercase tracking-wide">
                  {step.title}
                </h4>
                <p className="text-xs font-mono text-slate-300 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-2xl bg-sand-gold/10 border border-sand-gold/30 text-center space-y-1">
          <div className="text-xs font-mono font-bold text-sand-gold flex items-center justify-center space-x-1.5">
            <Sparkles className="w-4 h-4" />
            <span>100% PRIVACY FIRST</span>
          </div>
          <p className="text-xs font-mono text-slate-300">
            All rendering happens client-side directly in your browser. No photos or data are uploaded to servers.
          </p>
        </div>
      </div>
    </div>
  );
};
