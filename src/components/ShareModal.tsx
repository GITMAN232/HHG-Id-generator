import React, { useState } from 'react';
import { Share2, Twitter, Copy, Check, X, RefreshCw, Sparkles } from 'lucide-react';
import { BuilderData } from '../types/builder';
import { generateCreativeCaption } from '../utils/captionGenerator';
import { sounds } from '../utils/soundEffects';

interface ShareModalProps {
  data: BuilderData;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ data, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [variantIndex, setVariantIndex] = useState<number>(0);

  const shareCaption = generateCreativeCaption(data, variantIndex);

  const handleRegenerate = () => {
    sounds.playClick();
    setVariantIndex((prev) => prev + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareCaption);
    setCopied(true);
    sounds.playSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTweet = () => {
    sounds.playClick();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareCaption)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hacker House Goa 2026 Builder Passport',
          text: shareCaption,
        });
      } catch {
        // Share cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-goa-darkest/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel-dark p-6 sm:p-8 rounded-3xl border border-sand-gold/40 shadow-2xl space-y-5 relative">
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-goa-medium text-slate-400 hover:text-white transition"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-pink-neon/20 border border-pink-neon/50 text-pink-neon mx-auto flex items-center justify-center shadow-pink-glow">
            <Share2 className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black font-display uppercase tracking-wider text-white">
            SHARE YOUR PASSPORT
          </h3>
          <p className="text-xs font-mono text-slate-400">
            Showcase your Hacker House Goa 2026 identity on X.
          </p>
        </div>

        {/* Share Text Preview Box Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono font-bold text-sand-gold uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-pink-neon" />
              <span>YOUR X CAPTION PREVIEW</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {shareCaption.length} / 280
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-sand-gold/30 font-mono text-xs text-slate-100 whitespace-pre-wrap leading-relaxed min-h-[110px] select-all shadow-inner">
            {shareCaption}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Post to X */}
          <button
            onClick={handleTweet}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sand-gold via-sand-warm to-pink-neon text-goa-darkest font-mono font-black text-xs uppercase tracking-wider shadow-gold-glow hover:scale-102 active:scale-98 transition flex items-center justify-center space-x-2"
          >
            <Twitter className="w-4 h-4 fill-current shrink-0" />
            <span>POST TO X (TWITTER)</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            {/* Regenerate Caption */}
            <button
              onClick={handleRegenerate}
              className="py-2.5 px-2 rounded-xl bg-goa-medium border border-sand-gold/40 text-sand-gold font-mono font-bold text-[11px] uppercase hover:border-sand-gold active:scale-98 transition flex items-center justify-center space-x-1"
              title="Generate a fresh caption style"
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              <span>REGENERATE</span>
            </button>

            {/* Copy Text */}
            <button
              onClick={handleCopy}
              className="py-2.5 px-2 rounded-xl bg-goa-medium border border-sand-gold/40 text-slate-200 font-mono font-bold text-[11px] uppercase hover:border-sand-gold active:scale-98 transition flex items-center justify-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
              <span>{copied ? 'COPIED!' : 'COPY'}</span>
            </button>

            {/* Native Web Share */}
            <button
              onClick={handleWebShare}
              className="py-2.5 px-2 rounded-xl bg-goa-medium border border-sand-gold/40 text-slate-200 font-mono font-bold text-[11px] uppercase hover:border-sand-gold active:scale-98 transition flex items-center justify-center space-x-1"
            >
              <Share2 className="w-3.5 h-3.5 shrink-0" />
              <span>MORE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
