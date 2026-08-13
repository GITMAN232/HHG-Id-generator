import React, { useState } from 'react';
import { HelpCircle, Sparkles, Users, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface NavbarProps {
  onOpenHowItWorks: () => void;
  onOpenTeam: () => void;
  teamCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHowItWorks,
  onOpenTeam,
  teamCount,
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(true);

  const handleToggleSound = () => {
    const newState = sounds.toggleSound();
    setSoundOn(newState);
    if (newState) sounds.playClick();
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-goa-deep/90 border-b border-sand-gold/20 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        <button
          className="min-w-0 flex items-center space-x-2 text-left group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
        >
          <div className="flex flex-col min-w-0">
            <div className="flex items-center space-x-1 font-display font-black text-base xs:text-lg sm:text-2xl text-sand-gold tracking-wider leading-none uppercase truncate">
              <span>Hacker</span>
              <span className="px-1.5 py-0.5 rounded-md bg-pink-neon text-sand-light text-[10px] sm:text-xs font-serif font-black border border-sand-gold/50">
                गोवा
              </span>
              <span>House</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-[10px] font-mono text-slate-300 tracking-widest mt-1 uppercase">
              <span>Goa, India</span>
              <span>•</span>
              <span className="text-sand-gold font-bold">28 - 31 Oct 2026</span>
              <span>•</span>
              <span className="text-pink-neon">2:47 PM Studio</span>
            </div>
          </div>
        </button>

        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          <button
            onClick={handleToggleSound}
            className="p-2 sm:p-2.5 rounded-xl bg-goa-medium/80 border border-sand-gold/30 text-sand-gold hover:bg-goa-medium hover:border-sand-gold transition"
            title={soundOn ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenHowItWorks();
            }}
            className="p-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-goa-medium/80 border border-sand-gold/30 text-xs font-mono font-semibold text-slate-200 hover:text-sand-gold hover:border-sand-gold transition flex items-center space-x-1.5"
            title="How It Works"
          >
            <HelpCircle className="w-4 h-4 text-sand-gold shrink-0" />
            <span className="hidden sm:inline">How It Works</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenTeam();
            }}
            className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-goa-light to-goa-medium border border-pink-neon text-xs font-mono font-bold text-white hover:shadow-pink-glow transition flex items-center space-x-1.5"
          >
            <Users className="w-4 h-4 text-pink-neon shrink-0" />
            <span className="hidden sm:inline">Build Crew</span>
            {teamCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-pink-neon text-white font-bold">
                {teamCount}
              </span>
            )}
          </button>

          <a
            href="#builder-zone"
            onClick={() => sounds.playClick()}
            className="hidden md:flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-sand-gold text-goa-darkest font-bold text-xs font-mono hover:bg-sand-warm transition shadow-gold-glow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Build My ID</span>
          </a>
        </div>
      </div>
    </header>
  );
};
