/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Spot, LiveTip } from "../types";
import { 
  Heart, X, Compass, ThumbsUp, ThumbsDown, MessageSquareCode, 
  Clock, Coffee, Bookmark, CheckCircle2, User, Sparkles,
  ShieldAlert, Flag, MapPin, Navigation
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SpotDetailDrawerProps {
  spot: Spot | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  liveTips: LiveTip[];
  onSubmitTip: (text: string, isHype: boolean) => void;
  allSpots?: Spot[];
  onSelectSpotById?: (id: string) => void;
  onIncreaseUserAura?: (pts: number) => void;
}

export default function SpotDetailDrawer({ 
  spot, 
  onClose, 
  isSaved, 
  onToggleSave, 
  liveTips, 
  onSubmitTip,
  allSpots = [],
  onSelectSpotById,
  onIncreaseUserAura
}: SpotDetailDrawerProps) {
  const [tipText, setTipText] = useState("");
  const [tipIsHype, setTipIsHype] = useState(true);
  const [hasVotedHype, setHasVotedHype] = useState(false);
  const [hasVotedMid, setHasVotedMid] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [votesCount, setVotesCount] = useState({ hype: 0, mid: 0 });
  const [auraFeedback, setAuraFeedback] = useState<string | null>(null);

  if (!spot) return null;

  // Compute total dynamic votes combining mock and interactive
  const currentHypeVotes = spot.votesHype + (hasVotedHype ? 1 : 0) + votesCount.hype;
  const currentMidVotes = spot.votesMid + (hasVotedMid ? 1 : 0) + votesCount.mid;

  const triggerAuraToast = (msg: string) => {
    setAuraFeedback(msg);
    setTimeout(() => {
      setAuraFeedback(null);
    }, 4500);
  };

  const handleVoteHype = () => {
    if (hasVotedHype) return;
    setHasVotedHype(true);
    triggerAuraToast("🎉 HYPE MULTIPLIER ACTIVE! CREATOR AURA RISING (+25 AURA)!");
    onIncreaseUserAura?.(25);
    if (hasVotedMid) {
      setHasVotedMid(false);
      setVotesCount(prev => ({ hype: prev.hype + 1, mid: Math.max(0, prev.mid - 1) }));
    } else {
      setVotesCount(prev => ({ ...prev, hype: prev.hype + 1 }));
    }
  };

  const handleVoteMid = () => {
    if (hasVotedMid) return;
    setHasVotedMid(true);
    triggerAuraToast("👎 MID COUNT RECEIVED. CREATOR REPUTATION BALANCED (-10 AURA)!");
    onIncreaseUserAura?.(-10);
    if (hasVotedHype) {
      setHasVotedHype(false);
      setVotesCount(prev => ({ mid: prev.mid + 1, hype: Math.max(0, prev.hype - 1) }));
    } else {
      setVotesCount(prev => ({ ...prev, mid: prev.mid + 1 }));
    }
  };

  const handleCheckIn = () => {
    if (hasCheckedIn) return;
    setHasCheckedIn(true);
    triggerAuraToast("🧗 CHECK-IN CONFIRMED FOR THIS AREA! YOUR PERSONAL AURA BOOSTED (+100 AURA)!");
    onIncreaseUserAura?.(100);
  };

  const handleReportSpam = () => {
    if (hasReported) return;
    setHasReported(true);
    triggerAuraToast("🚨 REPORT FILED. OUR LOCAL MODS SENT TO INVESTIGATE FR (-50 CREATOR AURA)!");
    onIncreaseUserAura?.(-25);
  };

  const handleTipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipText.trim()) return;
    onSubmitTip(tipText, tipIsHype);
    triggerAuraToast("💬 TIP ADDED TO CHRONOLOGY! AURATIC HEALING COMPLETED (+50 AURA)!");
    onIncreaseUserAura?.(50);
    setTipText("");
  };

  const filteredNearby = allSpots.filter(s => {
    // If the spot has explicit nearby IDs defined
    if (spot.nearbyDiscoveries && spot.nearbyDiscoveries.includes(s.id)) return true;
    // Otherwise fallback fallback to spots in same city and category
    return s.id !== spot.id && s.city === spot.city && s.category === spot.category;
  }).slice(0, 2);

  return (
    <div className="w-full bg-white border-4 border-black shadow-[8px_8px_0px_#000] flex flex-col font-sans shrink-0 overflow-hidden relative">
      
      {/* Dynamic Feedback HUD alerts */}
      <AnimatePresence>
        {auraFeedback && (
          <motion.div 
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="absolute top-[52px] left-0 right-0 z-50 bg-[#00FF00] border-b-4 border-black text-black font-mono text-xs uppercase font-black p-3.5 flex items-center gap-2 select-none"
          >
            <Sparkles className="w-4 h-4 shrink-0 animate-spin" />
            <span>{auraFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Drawer header bar */}
      <div className="w-full bg-black text-white p-3.5 flex items-center justify-between border-b-4 border-black select-none z-10">
        <div className="flex items-center gap-1.5 font-bold text-xs font-mono uppercase tracking-widest text-[#00D1FF]">
          <Compass className="w-4.5 h-4.5 text-[#FF00FF] animate-spin-slow" />
          <span>VIBEPAGE: {spot.category.toUpperCase()} REPORT</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 px-1.5 bg-[#FF00FF] text-white hover:bg-[#ff33ff] border-2 border-black shadow-[1px_1px_0px_#fff] cursor-pointer"
          id="spot-drawer-close"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-black overflow-y-auto max-h-[600px] lg:max-h-[680px]">
        {/* Left Column: Visuals & Metrics */}
        <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col gap-4">
          <div className="relative border-4 border-black shadow-[4px_4px_0px_#000] aspect-[16/10] overflow-hidden bg-neutral-100">
            <img 
              referrerPolicy="no-referrer"
              src={spot.imageUrl} 
              alt={spot.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            
            {/* ONLY LOCALS KNOW EMBLEM */}
            {(spot.gatekept || spot.onlyLocalsKnow) && (
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#FFF200] border-2 border-black text-black font-sans text-[10px] font-black uppercase rotate-[-3deg] shadow-[2px_2px_0px_#000] animate-none shrink-0">
                ⭐️ ONLY LOCALS KNOW fr
              </span>
            )}

            <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-[#FF00FF] text-white border border-black font-mono text-[10px] font-black uppercase shadow-sm">
              {spot.priceRange}
            </span>
          </div>

          {/* Core Spot Header */}
          <div>
            <h2 className="text-3xl font-black text-black leading-none uppercase">{spot.name}</h2>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-xs font-mono font-black uppercase px-2 py-0.5 bg-black text-[#00FF00] border-2 border-black flex items-center gap-1 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#00FF00]" /> {spot.city} ● {spot.neighborhood}
              </span>
              <span className="text-xs font-mono bg-neutral-50 border border-black/25 px-2 py-0.5 text-neutral-800 uppercase font-extrabold shrink-0">
                {spot.category}
              </span>
            </div>
          </div>

          {/* Creator tag */}
          <div className="flex items-center gap-2 border-2 border-black p-2 bg-neutral-50 shrink-0">
            <div className="w-6 h-6 rounded-full bg-zinc-300 border border-black overflow-hidden flex items-center justify-center font-black text-[10px]">
              👤
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase leading-none">Shared by Trusted Local</span>
              <span className="text-[9px] font-mono text-[#FF00FF] font-bold">Recommended with absolute integrity</span>
            </div>
          </div>

          <p className="text-xs text-black font-sans font-bold uppercase leading-relaxed bg-[#FFF200]/10 border-2 border-black p-3.5 rounded-none">
            {spot.description}
          </p>

          {/* Dynamic Vibe Stats Checklist */}
          <div className="border-4 border-black bg-white p-3.5 shadow-[4px_4px_0px_#000] font-mono shrink-0">
            <p className="text-xs font-black text-black uppercase mb-2 flex items-center gap-1.5 border-b-4 border-black pb-1">
              📊 RAW VIBE METRICS:
            </p>
            <div className="space-y-1.5 text-[11px] leading-tight text-neutral-800 font-black uppercase">
              <div className="flex justify-between">
                <span>Vibe Score:</span>
                <span className="text-[#FF00FF] font-black">{spot.stats?.rating}/10</span>
              </div>
              {spot.stats?.matchaScore && spot.stats?.matchaScore !== "Not Served" && (
                <div className="flex justify-between">
                  <span>Matcha Quality:</span>
                  <span className="text-neutral-900 font-black">{spot.stats?.matchaScore}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Speed check:</span>
                <span className="text-neutral-900 font-black">{spot.stats?.wifiClass}</span>
              </div>
              <div className="flex justify-between">
                <span>Shadow hour:</span>
                <span className="text-amber-600 font-black">{spot.stats?.goldenHour}</span>
              </div>
              <div className="flex justify-between">
                <span>Acoustic tier:</span>
                <span className="text-neutral-900 font-black">{spot.stats?.noiseLevel}</span>
              </div>
            </div>
          </div>

          {/* Interactive Hype meter buttons */}
          <div className="bg-white border-4 border-black p-3.5 flex items-center justify-between shadow-[4px_4px_0px_#000] font-mono shrink-0">
            <p className="text-[11px] font-black uppercase tracking-tight text-black flex items-center gap-1 leading-none shrink-0">
              <Sparkles className="w-4 h-4 text-[#FF00FF]" /> HYPE CHECK:
            </p>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handleVoteHype}
                className={`py-1 px-2.5 border-2 border-black text-xs font-black flex items-center gap-0.5 cursor-pointer transition-all ${
                  hasVotedHype 
                    ? "bg-[#00FF00] text-black shadow-[1px_1px_0px_rgba(0,0,0,1)] translate-y-[1.5px]" 
                    : "bg-white text-black hover:bg-neutral-50 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-0.5px]"
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" /> HYPE ({currentHypeVotes})
              </button>
              <button 
                onClick={handleVoteMid}
                className={`py-1 px-2.5 border-2 border-black text-xs font-black flex items-center gap-0.5 cursor-pointer transition-all ${
                  hasVotedMid 
                    ? "bg-red-400 text-black shadow-[1px_1px_0px_rgba(0,0,0,1)] translate-y-[1.5px]" 
                    : "bg-white text-black hover:bg-neutral-50 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-0.5px]"
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" /> MID ({currentMidVotes})
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Recommendations & Live Community Tips */}
        <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col gap-4">
          
          {/* Quick actions top card */}
          <div className="flex flex-wrap items-center gap-2">
            <button
               onClick={onToggleSave}
               className={`flex-1 py-3 px-4 border-4 border-black text-xs uppercase font-black tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[4px_4px_0px_#000] ${
                isSaved 
                  ? "bg-[#00D1FF] text-black translate-y-[1.5px] shadow-[2px_2px_0px_#000]" 
                  : "bg-white text-black hover:bg-neutral-50 hover:translate-y-[-1.5px] hover:shadow-[5px_5px_0px_#000]"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
              {isSaved ? "Saved to List! fr" : "Save to my VibeList"}
            </button>

            {/* Check-In Button */}
            <button
              onClick={handleCheckIn}
              disabled={hasCheckedIn}
              className={`py-3 px-4 border-4 border-black text-xs uppercase font-black tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[4px_4px_0px_#000] ${
                hasCheckedIn 
                  ? "bg-[#00FF00] text-black translate-y-[1.5px] shadow-[2px_2px_0px_#000] opacity-90" 
                  : "bg-white text-black hover:bg-neutral-50 hover:translate-y-[-1.5px] hover:shadow-[5px_5px_0px_#000]"
              }`}
            >
              <Navigation className="w-4 h-4 fill-none" />
              {hasCheckedIn ? "Checked-In! 🎒" : "Claim Check-In"}
            </button>

            {/* Spam Flag Button */}
            <button
              onClick={handleReportSpam}
              title="Report misleading, outdated or spam content fr fr"
              className={`p-3 border-4 border-black text-xs transition-all cursor-pointer shadow-[4px_4px_0px_#000] ${
                hasReported 
                  ? "bg-red-400 text-white translate-y-[1.5px] shadow-[2px_2px_0px_#000]" 
                  : "bg-white text-neutral-600 hover:bg-neutral-50 hover:translate-y-[-1.5px] hover:shadow-[5px_5px_0px_#000]"
              }`}
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>

          {/* Tourist Trap Warnings Banner Section */}
          <div className="border-4 border-black bg-red-50 p-4 shadow-[4px_4px_0px_#000] flex flex-col gap-1.5 shrink-0">
            <h4 className="font-extrabold text-red-600 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5 select-none">
              <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse shrink-0" />
              🛡️ COMPILATIONS: TOURIST TRAP WARNINGS
            </h4>
            <p className="text-[11px] text-zinc-900 leading-relaxed uppercase font-black">
              {spot.touristTrapWarning || "No verified scam vectors detected in immediate surroundings. Stand ground on standard pricing tiers."}
            </p>
          </div>

          {/* Curated Recommendations Card */}
          <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_#000] flex flex-col gap-3 shrink-0">
            <h4 className="font-extrabold text-[#FF00FF] text-xs font-mono uppercase tracking-widest flex items-center gap-1 border-b-4 border-black pb-1.5 select-none">
              💅 CREATOR RECOMMENDATION PACK:
            </h4>

            <div>
              <p className="text-xs font-black text-black font-sans uppercase flex items-center gap-1">
                📍 Why Go:
              </p>
              <p className="text-xs text-neutral-800 mt-1 pl-4 leading-relaxed border-l-4 border-[#FF00FF] uppercase font-black">
                {spot.whyGo}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-black text-black font-sans uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Golden Hour:
                </p>
                <p className="text-xs text-neutral-800 mt-1 pl-4 leading-relaxed border-l-4 border-[#00D1FF] uppercase font-black">
                  {spot.bestTime}
                </p>
              </div>

              <div>
                <p className="text-xs font-black text-black font-sans uppercase flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5" /> Order Assignment:
                </p>
                <p className="text-xs text-neutral-800 mt-1 pl-4 leading-relaxed border-l-4 border-[#00FF00] uppercase font-black">
                  {spot.whatToOrder}
                </p>
              </div>
            </div>
          </div>

          {/* Nearby Discoveries Section inside the city Context */}
          {filteredNearby.length > 0 && (
            <div className="border-4 border-black bg-white p-3.5 shadow-[4px_4px_0px_#000] flex flex-col gap-2 shrink-0">
              <h4 className="font-extrabold text-[#00D1FF] text-[11px] font-mono uppercase tracking-widest flex items-center gap-1 pb-1 border-b-2 border-black/15 select-none text-left">
                🎒 EXCLUSIVE HIGH-AURA SPOTS NEARBY:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {filteredNearby.map((nearby) => (
                  <button
                    key={nearby.id}
                    onClick={() => onSelectSpotById?.(nearby.id)}
                    className="p-2 border-2 border-black bg-white hover:bg-neutral-50 transition-all flex items-center gap-2 text-left cursor-pointer select-none rounded-none w-full"
                  >
                    <div className="w-8 h-8 rounded-none border border-black overflow-hidden shrink-0">
                      <img referrerPolicy="no-referrer" src={nearby.imageUrl} alt={nearby.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-black truncate uppercase leading-none">{nearby.name}</p>
                      <p className="text-[8px] font-mono text-zinc-500 uppercase leading-none mt-1">{nearby.neighborhood} ● {nearby.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Community Tips Section */}
          <div className="flex-1 flex flex-col min-h-[180px]">
            <h4 className="font-black text-black text-xs font-mono uppercase tracking-widest flex items-center gap-1 pb-1.5 border-b-4 border-black select-none">
              💬 REAL LIVE COMMUNITY TIPS:
            </h4>

            {/* Scrollable list of Tips */}
            <div className="flex-1 overflow-y-auto max-h-[140px] bg-neutral-50/55 p-2 border-4 border-black my-2 space-y-2">
              <AnimatePresence>
                {liveTips.filter(t => t.spotId === spot.id).length === 0 ? (
                  <p className="text-[11px] text-neutral-500 font-extrabold italic font-mono text-center py-4 select-none uppercase">
                    No community tea spilled here yet fr. Be the first to verify this spot! ☕️
                  </p>
                ) : (
                  liveTips
                    .filter(t => t.spotId === spot.id)
                    .map((tip) => (
                      <motion.div 
                        key={tip.id} 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2.5 border-2 border-black bg-white flex flex-col gap-1 text-[11px] relative shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase font-mono font-bold"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-black text-[#FF00FF]">
                              {tip.user}
                            </span>
                            <span className="text-[9px] text-neutral-400 font-extrabold">
                              {tip.handle}
                            </span>
                          </div>
                          {tip.isHype ? (
                            <span className="text-[8px] bg-[#00FF00] border-2 border-black font-mono font-bold px-1 uppercase scale-90">
                              HYPE
                            </span>
                          ) : (
                            <span className="text-[8px] bg-red-300 border-2 border-black font-mono font-bold px-1 uppercase scale-90">
                              MID
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-800 font-sans leading-normal font-black">
                          {tip.text}
                        </p>
                        <span className="text-[8px] text-neutral-400 text-right mt-0.5">
                          {tip.timestamp}
                        </span>
                      </motion.div>
                    ))
                )}
              </AnimatePresence>
            </div>

            {/* Submit Tip form */}
            <form onSubmit={handleTipSubmit} className="flex gap-2 shrink-0">
              <input 
                type="text"
                placeholder="Share your experience fr..."
                value={tipText}
                onChange={(e) => setTipText(e.target.value)}
                maxLength={100}
                className="flex-1 px-3 py-2 border-4 border-black text-xs font-bold focus:ring-0 focus:outline-none bg-white font-sans text-black placeholder:text-neutral-500 uppercase tracking-wide"
              />
              <button
                type="button"
                onClick={() => setTipIsHype(!tipIsHype)}
                className={`px-3 py-2 shrink-0 border-4 border-black font-mono text-xs font-black uppercase transition-all cursor-pointer shadow-[3px_3px_0px_#000] ${
                  tipIsHype ? "bg-[#00FF00] text-black" : "bg-red-400 text-black"
                }`}
              >
                {tipIsHype ? "🤩 Hype" : "😐 Mid"}
              </button>
              <button 
                type="submit"
                className="px-4 py-2 shrink-0 bg-black text-white border-4 border-black hover:bg-neutral-800 font-black uppercase font-mono text-xs shadow-[3px_3px_0px_#000] cursor-pointer"
              >
                Tip
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
