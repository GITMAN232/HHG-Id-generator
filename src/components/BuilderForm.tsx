import React from 'react';
import { User, Code2, Tag, Twitter, Briefcase, Sparkles, Users } from 'lucide-react';
import { UploadZone } from './UploadZone';
import { BuilderData } from '../types/builder';
import { sounds } from '../utils/soundEffects';

interface BuilderFormProps {
  data: BuilderData;
  onChange: (data: Partial<BuilderData>) => void;
  onSubmit: () => void;
}

export const BuilderForm: React.FC<BuilderFormProps> = ({ data, onChange, onSubmit }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-5 sm:p-8 rounded-3xl space-y-5 sm:space-y-6 shadow-2xl border border-sand-gold/30">
      <div className="border-b border-sand-gold/20 pb-3 sm:pb-4">
        <h2 className="text-xl sm:text-2xl font-black font-display uppercase tracking-wider text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-sand-gold shrink-0" />
          <span>PASSPORT CONFIGURATOR</span>
        </h2>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Configure your canonical Hacker House Goa 2026 Residency Passport.
        </p>
      </div>

      {/* Upload Zone */}
      <UploadZone
        photoUrl={data.photoUrl}
        onPhotoSelect={(url) => onChange({ photoUrl: url })}
      />

      {/* Inputs Grid */}
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-mono font-bold text-sand-gold tracking-widest uppercase mb-1.5 flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span>FULL NAME *</span>
          </label>
          <input
            type="text"
            required
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. SANTHOSH KUMAR"
            className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-goa-darkest/90 border border-sand-gold/30 text-white font-mono text-base sm:text-sm focus:border-sand-gold focus:ring-2 focus:ring-sand-gold/20 outline-none transition"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-mono font-bold text-sand-gold tracking-widest uppercase mb-1.5 flex items-center space-x-1.5">
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span>ROLE / TITLE *</span>
          </label>
          <input
            type="text"
            required
            value={data.role}
            onChange={(e) => onChange({ role: e.target.value })}
            placeholder="e.g. AI Engineer / Founder / Hacker"
            className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-goa-darkest/90 border border-sand-gold/30 text-white font-mono text-base sm:text-sm focus:border-sand-gold focus:ring-2 focus:ring-sand-gold/20 outline-none transition"
          />
        </div>

        {/* Stack */}
        <div>
          <label className="block text-xs font-mono font-bold text-sand-gold tracking-widest uppercase mb-1.5 flex items-center space-x-1.5">
            <Code2 className="w-3.5 h-3.5 shrink-0" />
            <span>STACK / SKILLS *</span>
          </label>
          <input
            type="text"
            required
            value={data.stack}
            onChange={(e) => onChange({ stack: e.target.value })}
            placeholder="e.g. Python, AI, React, Cybersecurity"
            className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-goa-darkest/90 border border-sand-gold/30 text-white font-mono text-base sm:text-sm focus:border-sand-gold focus:ring-2 focus:ring-sand-gold/20 outline-none transition"
          />
          <p className="text-[10px] font-mono text-slate-400 mt-1">
            Used to compute your loadout & skill DNA metrics.
          </p>
        </div>

        {/* Optional Team Name */}
        <div>
          <label className="block text-xs font-mono font-bold text-sand-gold tracking-widest uppercase mb-1.5 flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 shrink-0 text-pink-neon" />
            <span>TEAM NAME (OPTIONAL)</span>
          </label>
          <input
            type="text"
            value={data.teamName || ''}
            onChange={(e) => onChange({ teamName: e.target.value })}
            placeholder="e.g. WE3 or Team Chaos"
            className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-goa-darkest/90 border border-sand-gold/30 text-white font-mono text-base sm:text-sm focus:border-sand-gold focus:ring-2 focus:ring-sand-gold/20 outline-none transition"
          />
        </div>

        {/* Optional Tagline */}
        <div>
          <label className="block text-xs font-mono font-bold text-sand-gold tracking-widest uppercase mb-1.5 flex items-center space-x-1.5">
            <Tag className="w-3.5 h-3.5 shrink-0" />
            <span>PERSONAL TAGLINE (OPTIONAL)</span>
          </label>
          <input
            type="text"
            value={data.tagline}
            onChange={(e) => onChange({ tagline: e.target.value })}
            placeholder="e.g. Teaches machines to see tomorrow."
            className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-goa-darkest/90 border border-sand-gold/30 text-white font-mono text-base sm:text-sm focus:border-sand-gold focus:ring-2 focus:ring-sand-gold/20 outline-none transition"
          />
        </div>

        {/* Optional X Handle */}
        <div>
          <label className="block text-xs font-mono font-bold text-sand-gold tracking-widest uppercase mb-1.5 flex items-center space-x-1.5">
            <Twitter className="w-3.5 h-3.5 shrink-0" />
            <span>X / TWITTER HANDLE (OPTIONAL)</span>
          </label>
          <input
            type="text"
            value={data.xHandle}
            onChange={(e) => onChange({ xHandle: e.target.value })}
            placeholder="e.g. @santhosh_dev"
            className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-goa-darkest/90 border border-sand-gold/30 text-white font-mono text-base sm:text-sm focus:border-sand-gold focus:ring-2 focus:ring-sand-gold/20 outline-none transition"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-4 min-h-[48px] rounded-2xl bg-gradient-to-r from-sand-gold via-sand-warm to-pink-neon text-goa-darkest font-black font-mono text-sm sm:text-base tracking-widest uppercase shadow-gold-glow hover:scale-102 active:scale-98 transition duration-200 flex items-center justify-center space-x-2"
      >
        <Sparkles className="w-5 h-5 fill-current shrink-0" />
        <span>CREATE MY BUILDER ID</span>
      </button>
    </form>
  );
};
