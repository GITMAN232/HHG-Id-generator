import React, { useState } from 'react';
import { Users, Plus, Trash2, Download, X, Sparkles, Shield, Compass, Image as ImageIcon } from 'lucide-react';
import { BuilderData } from '../types/builder';
import { CardPreview } from './IDCard3D/CardPreview';
import { UploadZone } from './UploadZone';
import { downloadCrewManifest } from '../utils/crewRenderer2D';
import { sounds } from '../utils/soundEffects';
import { generateLoadout } from '../utils/builderClassGenerator';

interface TeamBuilderProps {
  currentBuilder: BuilderData;
  onClose: () => void;
}

export const TeamBuilder: React.FC<TeamBuilderProps> = ({ currentBuilder, onClose }) => {
  const [crew, setCrew] = useState<BuilderData[]>([currentBuilder]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New teammate form state
  const [newName, setNewName] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('');
  const [newStack, setNewStack] = useState<string>('');
  const [newTeamName, setNewTeamName] = useState<string>(currentBuilder.teamName || '');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string | null>(null);

  const handleAddTeammate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRole) return;

    sounds.playSuccess();
    const stack = newStack || 'Fullstack, React, Python';

    const newMember: BuilderData = {
      id: 'member-' + Date.now(),
      name: newName,
      role: newRole,
      stack: stack,
      teamName: newTeamName || currentBuilder.teamName || '',
      tagline: 'Hacker House Goa Resident',
      xHandle: '',
      photoUrl: newPhotoUrl,
      passportNumber: `HHG26-${Math.floor(1000 + Math.random() * 9000)}-TW`,
      issueDate: '2026-03-15',
      loadout: generateLoadout(stack),
      dnaStats: { build: 92, hack: 88, ship: 95, create: 90 },
    };

    setCrew([...crew, newMember]);
    setNewName('');
    setNewRole('');
    setNewStack('');
    setNewPhotoUrl(null);
    setShowAddForm(false);
  };

  const handleRemoveMember = (id: string) => {
    sounds.playClick();
    setCrew(crew.filter((m) => m.id !== id));
  };

  const handleExportCrewPng = async () => {
    await downloadCrewManifest(crew, 'png');
  };

  const handleExportCrewJpeg = async () => {
    await downloadCrewManifest(crew, 'jpeg');
  };

  const gridColsClass =
    crew.length === 1
      ? 'grid-cols-1 max-w-2xl mx-auto'
      : crew.length === 2
      ? 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto';

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#041611] via-[#07251D] to-[#03100B] text-slate-100 overflow-y-auto font-sans selection:bg-pink-neon selection:text-white">
      {/* Background Guilloche Security Lines */}
      <div className="fixed inset-0 opacity-10 pointer-events-none bg-guilloche" />

      {/* Top Floating Navigation Header */}
      <header className="sticky top-0 z-40 bg-goa-darkest/85 backdrop-blur-md border-b border-sand-gold/20 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-pink-neon/20 border border-pink-neon flex items-center justify-center text-pink-neon font-mono font-bold text-xs">
              HH
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-sand-gold tracking-widest block uppercase">
                HACKER HOUSE GOA 2026
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                OFFICIAL CREW MANIFEST
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                sounds.playClick();
                setShowAddForm(true);
              }}
              className="px-4 py-2 rounded-xl bg-goa-medium/80 border border-sand-gold/40 text-sand-gold font-mono font-bold text-xs uppercase tracking-wider hover:border-sand-gold transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">+ TEAMMATE</span>
            </button>

            <button
              onClick={handleExportCrewPng}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sand-gold to-sand-warm text-goa-darkest font-mono font-black text-xs uppercase tracking-wider shadow-gold-glow hover:scale-102 transition flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PNG</span>
            </button>

            <button
              onClick={handleExportCrewJpeg}
              className="px-4 py-2 rounded-xl bg-goa-light border border-sand-gold/50 text-sand-gold font-mono font-bold text-xs uppercase tracking-wider hover:border-sand-gold transition flex items-center space-x-1.5"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">JPEG</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-goa-medium border border-sand-gold/20 text-slate-300 hover:text-white transition"
              title="Close Crew Poster"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Full-Bleed Editorial Poster Canvas */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Editorial Hero Banner */}
        <div className="text-center space-y-3 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-sand-gold/10 border border-sand-gold/30 text-sand-gold font-mono text-xs tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-pink-neon" />
            <span>2:47 PM STUDIO PRESENTS // CREW MANIFEST</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display uppercase tracking-wider text-white leading-none">
            THE BUILD <span className="text-sand-gold">CREW</span>
          </h1>

          <p className="text-sm sm:text-base font-mono font-bold text-pink-neon tracking-widest uppercase">
            {crew.length.toString().padStart(2, '0')} BUILDERS // 01 MISSION IN GOA
          </p>

          <p className="text-lg sm:text-xl font-serif italic text-slate-300">
            "BUILD TOGETHER. SHIP TOGETHER. <span className="text-sand-gold">SHIP FROM PARADISE.</span>"
          </p>
        </div>

        {/* Add Teammate Modal Overlay */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 bg-goa-darkest/90 backdrop-blur-xl flex items-center justify-center p-4">
            <form
              onSubmit={handleAddTeammate}
              className="max-w-md w-full glass-panel-dark p-6 sm:p-8 rounded-3xl border border-sand-gold/50 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-sand-gold/20 pb-3">
                <h3 className="text-xl font-black font-display text-white uppercase tracking-wider flex items-center space-x-2">
                  <Users className="w-5 h-5 text-sand-gold" />
                  <span>ADD TEAMMATE</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="p-1.5 rounded-lg bg-goa-medium text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-sand-gold uppercase mb-1">
                  FULL NAME *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. AARAV PATEL"
                  className="w-full px-4 py-2.5 rounded-xl bg-goa-darkest border border-sand-gold/30 text-white font-mono text-sm outline-none focus:border-sand-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-sand-gold uppercase mb-1">
                  ROLE / TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g. Smart Contract Engineer"
                  className="w-full px-4 py-2.5 rounded-xl bg-goa-darkest border border-sand-gold/30 text-white font-mono text-sm outline-none focus:border-sand-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-sand-gold uppercase mb-1">
                  STACK / SKILLS
                </label>
                <input
                  type="text"
                  value={newStack}
                  onChange={(e) => setNewStack(e.target.value)}
                  placeholder="e.g. Solidity, Rust, React"
                  className="w-full px-4 py-2.5 rounded-xl bg-goa-darkest border border-sand-gold/30 text-white font-mono text-sm outline-none focus:border-sand-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-sand-gold uppercase mb-1">
                  TEAM NAME (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. WE3"
                  className="w-full px-4 py-2.5 rounded-xl bg-goa-darkest border border-sand-gold/30 text-white font-mono text-sm outline-none focus:border-sand-gold"
                />
              </div>

              <div>
                <UploadZone
                  photoUrl={newPhotoUrl}
                  onPhotoSelect={setNewPhotoUrl}
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-pink-neon text-white font-mono font-bold text-xs uppercase tracking-wider shadow-pink-glow"
                >
                  ADD TO CREW MANIFEST
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-3 rounded-xl bg-goa-medium text-slate-300 font-mono text-xs uppercase"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Clean Non-Overlapping Member Grid */}
        <div className={`grid gap-8 ${gridColsClass}`}>
          {crew.map((member, idx) => (
            <div
              key={member.id}
              className="relative flex flex-col items-center space-y-3 group"
            >
              {/* Member Personality Tag */}
              <div className="w-full flex items-center justify-between px-2 text-xs font-mono">
                <div className="flex items-center space-x-2 text-sand-gold font-bold">
                  <span className="w-2 h-2 rounded-full bg-pink-neon" />
                  <span>{(idx + 1).toString().padStart(2, '0')} / {member.teamName ? member.teamName.toUpperCase() : 'BUILDER'}</span>
                </div>
                <span className="text-slate-400 font-semibold">{member.name.toUpperCase()}</span>
              </div>

              {/* ID Card Preview */}
              <div className="relative w-full transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:shadow-gold-glow rounded-xl">
                <CardPreview data={member} className="w-full" />

                {crew.length > 1 && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="absolute -top-3 -right-3 p-2 rounded-full bg-red-950/80 border border-red-500 text-red-400 opacity-0 group-hover:opacity-100 transition shadow-lg z-30"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Compact Mission Manifesto Block */}
        <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-goa-darkest/90 border border-sand-gold/30 text-center space-y-3 shadow-xl mt-12">
          <div className="flex items-center justify-center space-x-3 text-sand-gold text-xs font-mono font-bold uppercase tracking-widest">
            <Compass className="w-4 h-4 text-pink-neon" />
            <span>THE CREW MISSION // HACKER HOUSE GOA 2026</span>
          </div>

          <div className="flex justify-center items-center space-x-6 text-xl sm:text-2xl font-black font-display text-white uppercase tracking-wider">
            <span>BUILD</span>
            <span className="text-pink-neon">•</span>
            <span>HACK</span>
            <span className="text-pink-neon">•</span>
            <span>SHIP</span>
          </div>

          <p className="text-xs font-mono text-slate-300 max-w-lg mx-auto">
            41 Vagator Beach Rd, Anjuna, Goa 403509 • 28 - 31 OCT 2026
          </p>
        </div>
      </main>

      {/* Editorial Footer */}
      <footer className="relative z-10 border-t border-sand-gold/20 bg-goa-darkest/90 py-8 text-center text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-sand-gold" />
            <span className="text-sand-gold font-bold">HACKER HOUSE GOA 2026</span>
            <span>// OFFICIAL SQUAD MANIFEST</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-pink-neon font-bold">#FRAMEINGOA</span>
            <span>•</span>
            <span>GOA, INDIA</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
