import React from 'react';
import { Layers, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface LandingHeroProps {
  onStartClick: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStartClick }) => {
  return (
    <section className="relative min-h-[calc(100svh-5rem)] max-w-6xl mx-auto px-4 pt-6 sm:pt-10 pb-8 sm:pb-10 flex flex-col justify-center text-center overflow-hidden">
      <div className="inline-flex self-center items-center space-x-2 px-3.5 py-1.5 rounded-full bg-goa-medium/80 border border-sand-gold/40 text-sand-gold font-mono text-[11px] sm:text-xs tracking-widest uppercase mb-4 sm:mb-6 shadow-lg backdrop-blur-md max-w-full truncate">
        <Sparkles className="w-3.5 h-3.5 text-pink-neon animate-spin shrink-0" />
        <span className="truncate">2:47 PM Studio // Hacker House Goa 2026</span>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <h1 className="text-3xl xs:text-4xl sm:text-7xl md:text-8xl font-black font-display tracking-wider text-sand-gold uppercase leading-none drop-shadow-2xl flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span>Hacker</span>
          <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-pink-neon text-sand-light font-serif text-2xl xs:text-3xl sm:text-5xl md:text-6xl border-2 border-sand-gold shadow-pink-glow">
            गोवा
          </span>
          <span>House</span>
        </h1>
        <div className="text-xl xs:text-2xl sm:text-4xl font-black font-display tracking-widest text-white uppercase">
          Builder Passport
        </div>
      </div>

      <p className="mt-4 sm:mt-6 text-lg sm:text-2xl font-serif italic text-slate-200 max-w-2xl mx-auto tracking-wide">
        Your build. <span className="text-sand-gold">Your identity.</span> Your Goa.
      </p>

      <p className="mt-2.5 sm:mt-3 text-xs sm:text-base font-mono text-slate-300 max-w-2xl mx-auto leading-relaxed px-2">
        Materialize a 3D digital passport collectible for Hacker House Goa (28 - 31 Oct 2026), complete with security seals, Builder Class DNA, crew posters, and print-ready PNG export.
      </p>

      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => {
            sounds.playClick();
            onStartClick();
          }}
          className="w-full sm:w-auto px-8 py-4 min-h-[48px] rounded-2xl bg-gradient-to-r from-sand-gold via-sand-warm to-pink-neon text-goa-darkest font-black font-mono text-sm sm:text-base tracking-wider uppercase shadow-gold-glow hover:scale-105 active:scale-95 transition duration-200 flex items-center justify-center space-x-2"
        >
          <Zap className="w-5 h-5 fill-current shrink-0" />
          <span>Create My Builder ID</span>
        </button>
      </div>

      <div className="mt-6 text-xs font-mono text-slate-300 flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2.5">
        <span className="flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>No login required</span>
        </span>
        <span className="text-sand-gold hidden xs:inline">•</span>
        <span className="flex items-center space-x-1.5">
          <Layers className="w-4 h-4 text-pink-neon shrink-0" />
          <span>Instant 3D rendering</span>
        </span>
        <span className="text-sand-gold hidden xs:inline">•</span>
        <span className="text-sand-gold font-bold">28 - 31 Oct 2026</span>
      </div>
    </section>
  );
};
