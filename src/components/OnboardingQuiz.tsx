/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Coffee, Library, Sparkles, X, HeartCrack, ChevronRight, Music, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface OnboardingQuizProps {
  onMatch: (filters: { vibe: string | null; budget: string | null }) => void;
  onClose: () => void;
}

export default function OnboardingQuiz({ onMatch, onClose }: OnboardingQuizProps) {
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);

  const filterVibes = [
    { name: "Coffee & Matcha Crawl", match: "Matcha", emoji: "🍵", color: "bg-[#00FF00]" },
    { name: "Vinyl & Rhythm Caves", match: "Vinyl Only", emoji: "💿", color: "bg-[#00D1FF]" },
    { name: "Thrifting & Streetwear Drops", match: "Y2K Vintage", emoji: "👗", color: "bg-[#FF00FF]" },
    { name: "Ocean Waves & Golden Hour Glow", match: "Sunset Spot", emoji: "🌅", color: "bg-[#FFF200]" },
    { name: "Quiet Study & Smells Like Ink", match: "Quiet Slay", emoji: "📚", color: "bg-white" }
  ];

  const pricingClasses = [
    { name: "Broke Bestie (Free/Cheap)", match: "Broke Bestie", emoji: "💸" },
    { name: "Comfy Enough (Moderate)", match: "Comfy Enough", emoji: "🍕" },
    { name: "Treat Yourself (Premium)", match: "Treat Yourself", emoji: "🍣" },
    { name: "Trust Fund Baby (Boujee)", match: "Trust Fund Baby", emoji: "💎" }
  ];

  const handleApply = () => {
    onMatch({ vibe: selectedVibe, budget: selectedBudget });
  };

  const handleReset = () => {
    setSelectedVibe(null);
    setSelectedBudget(null);
    onMatch({ vibe: null, budget: null });
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="p-5 sm:p-6 bg-white border-4 border-black shadow-[8px_8px_0px_#000] max-w-xl w-full relative shrink-0 font-sans"
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-1 bg-white border-2 border-black hover:bg-neutral-100 shadow-[2px_2px_0px_#000] text-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
        id="close-quiz-btn"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-[#FF00FF] animate-spin" />
        <span className="font-mono text-xs font-black uppercase tracking-wider bg-black text-white px-2 py-0.5">
          // STEP-BY-STEP VIBE MATCH //
        </span>
      </div>

      <h3 className="text-2xl font-black text-black tracking-tight leading-none mb-2 select-none uppercase">
        WHAT IS THE MISSION TODAY, BESTIE?
      </h3>
      <p className="text-xs text-black/70 mb-5 font-mono uppercase font-black">
        Filter spots instantly by matching your current budget tier and spatial energy.
      </p>

      {/* Vibe Selection */}
      <div className="mb-4">
        <label className="block text-xs font-black uppercase font-mono text-black mb-2 flex items-center gap-1.5">
          🧠 Choose your current mental state:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filterVibes.map((item) => {
            const isSelected = selectedVibe === item.match;
            return (
              <button
                key={item.name}
                onClick={() => setSelectedVibe(isSelected ? null : item.match)}
                className={`flex items-center gap-3 p-3 text-left text-xs font-black transition-all border-4 border-black rounded-none shadow-[4px_4px_0px_#000] cursor-pointer ${
                  isSelected 
                    ? `${item.color} text-black translate-y-[2px] shadow-[2px_2px_0px_#000]`
                    : "bg-white text-black hover:bg-neutral-50 hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000]"
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget Selector */}
      <div className="mb-6">
        <label className="block text-xs font-black uppercase font-mono text-black mb-2 flex items-center gap-1.5">
          💸 Wallet check status:
        </label>
        <div className="grid grid-cols-2 gap-2">
          {pricingClasses.map((item) => {
            const isSelected = selectedBudget === item.match;
            return (
              <button
                key={item.name}
                onClick={() => setSelectedBudget(isSelected ? null : item.match)}
                className={`flex items-center gap-2.5 p-3 text-left text-xs font-black transition-all border-4 border-black rounded-none shadow-[4px_4px_0px_#000] cursor-pointer ${
                  isSelected
                    ? "bg-[#FFF200] text-black translate-y-[2px] shadow-[2px_2px_0px_#000]"
                    : "bg-white text-black hover:bg-neutral-50 hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000]"
                }`}
              >
                <span className="text-sm">{item.emoji}</span>
                <span className="truncate">{item.match}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-3 border-t-4 border-dashed border-black pt-4">
        <button
          onClick={handleApply}
          className="flex-1 py-3 px-4 bg-[#00FF00] text-black text-xs font-black uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] transition-all flex items-center justify-center gap-2 rounded-none"
          id="match-vibe-apply-btn"
        >
          Match My Vibe <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-3 bg-white text-black text-xs font-black uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] transition-all flex items-center gap-1.5"
          id="reset-vibe-btn"
        >
          <HeartCrack className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
    </motion.div>
  );
}
