import { useState, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { BuilderForm } from './components/BuilderForm';
import { CardCanvas } from './components/IDCard3D/CardCanvas';
import { CardControls } from './components/CardControls';
import { TeamBuilder } from './components/TeamBuilder';
import { ShareModal } from './components/ShareModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { BuilderData } from './types/builder';
import { generatePassportNumber, generateDNAStats, generateLoadout } from './utils/builderClassGenerator';
import { downloadCardImage } from './utils/exportCard';
import { sounds } from './utils/soundEffects';

export function App() {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isMaterializing, setIsMaterializing] = useState<boolean>(false);

  // Modals state
  const [showTeamModal, setShowTeamModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState<boolean>(false);

  const builderZoneRef = useRef<HTMLDivElement>(null);

  // Initial Default Builder State
  const [builderData, setBuilderData] = useState<BuilderData>(() => {
    const initialRole = 'Fullstack Developer';
    const initialStack = 'Python, AI, React, Cybersecurity';
    return {
      id: 'builder-1',
      name: 'SANTHOSH KUMAR',
      role: initialRole,
      stack: initialStack,
      teamName: 'WE3',
      tagline: 'Building the future of autonomous intelligence.',
      xHandle: '@santhosh_dev',
      photoUrl: null,
      passportNumber: generatePassportNumber('SANTHOSH KUMAR'),
      issueDate: '2026-03-15',
      loadout: generateLoadout(initialStack),
      dnaStats: generateDNAStats(initialRole, initialStack),
    };
  });

  // Handle Form Change with Live Re-computation
  const handleDataChange = (updates: Partial<BuilderData>) => {
    setBuilderData((prev) => {
      const next = { ...prev, ...updates };
      if (updates.name !== undefined) {
        next.passportNumber = generatePassportNumber(next.name);
      }
      if (updates.stack !== undefined) {
        next.loadout = generateLoadout(next.stack);
      }
      next.dnaStats = generateDNAStats(next.role, next.stack);
      return next;
    });
  };

  // Submit trigger -> trigger 3D fly-in entrance
  const handleSubmitForm = () => {
    sounds.playMaterialize();
    setIsMaterializing(true);
    builderZoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleDownloadPng = async () => {
    await downloadCardImage(builderData, isFlipped, 'png');
  };

  const handleDownloadJpeg = async () => {
    await downloadCardImage(builderData, isFlipped, 'jpeg');
  };

  const scrollToBuilder = () => {
    builderZoneRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans text-slate-100 selection:bg-pink-neon selection:text-white">
      {/* Background Particle & Ambient Canvas */}
      <BackgroundCanvas />

      {/* Navbar Header */}
      <Navbar
        onOpenHowItWorks={() => setShowHowItWorksModal(true)}
        onOpenTeam={() => setShowTeamModal(true)}
        teamCount={1}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Landing Hero */}
        <LandingHero onStartClick={scrollToBuilder} />

        {/* Builder Studio Section */}
        <section id="builder-zone" ref={builderZoneRef} className="pt-8 pb-20 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Configurator Form */}
            <div className="lg:col-span-5 w-full order-2 lg:order-1">
              <BuilderForm
                data={builderData}
                onChange={handleDataChange}
                onSubmit={handleSubmitForm}
              />
            </div>

            {/* Right Column: 3D Canvas Preview */}
            <div className="lg:col-span-7 w-full order-1 lg:order-2 space-y-4">
              <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-sand-gold/30 shadow-2xl relative">
                {/* Header Status */}
                <div className="flex items-center justify-between border-b border-sand-gold/15 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-bold text-sand-gold tracking-widest uppercase">
                      LIVE 3D PASSPORT PREVIEW
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-pink-neon uppercase tracking-widest font-bold hidden sm:block">
                    HH GOA 2026 - BUILDER PASSPORT
                  </span>
                </div>

                {/* 3D Canvas Container */}
                <CardCanvas
                  data={builderData}
                  isFlipped={isFlipped}
                  isMaterializing={isMaterializing}
                  onMaterializeComplete={() => setIsMaterializing(false)}
                  onCardClick={() => setIsFlipped(!isFlipped)}
                />

                {/* Action Controls Bar */}
                <CardControls
                  isFlipped={isFlipped}
                  onToggleFlip={() => setIsFlipped(!isFlipped)}
                  onDownloadPng={handleDownloadPng}
                  onDownloadJpeg={handleDownloadJpeg}
                  onShare={() => setShowShareModal(true)}
                  onAddTeammate={() => setShowTeamModal(true)}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-sand-gold/15 bg-goa-darkest/90 backdrop-blur-md py-8 text-center text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-sand-gold font-bold">HACKER HOUSE GOA 2026</span> // BUILDER PASSPORT GENERATOR
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                sounds.playClick();
                setShowHowItWorksModal(true);
              }}
              className="hover:text-sand-gold transition"
            >
              HOW IT WORKS
            </button>
            <span>•</span>
            <span className="text-pink-neon">#FRAMEINGOA</span>
            <span>•</span>
            <span>GOA, INDIA</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showTeamModal && (
        <TeamBuilder
          currentBuilder={builderData}
          onClose={() => setShowTeamModal(false)}
        />
      )}

      {showShareModal && (
        <ShareModal
          data={builderData}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showHowItWorksModal && (
        <HowItWorksModal
          onClose={() => setShowHowItWorksModal(false)}
        />
      )}
    </div>
  );
}

export default App;
