/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Guide, Spot } from "../types";
import { Sparkles, MessageSquareCode, Bookmark, BookmarkCheck, Heart, MapPin, Play, Clock, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface GuidesAndListsProps {
  guides: Guide[];
  spots: Spot[];
  onSelectGuide: (guide: Guide) => void;
  activeGuideId: string | null;
  savedSpots: Spot[];
  onSelectSpot: (spot: Spot) => void;
}

export default function GuidesAndLists({ 
  guides, 
  spots, 
  onSelectGuide, 
  activeGuideId,
  savedSpots,
  onSelectSpot
}: GuidesAndListsProps) {
  
  const getCreatorHandle = (creatorId: string) => {
    switch (creatorId) {
      case "sofia": return "@sofi_escapes";
      case "ananya": return "@ananya_codes_vibes";
      case "marcus": return "@m_lee_travels";
      default: return "@local_bestie";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans shrink-0">
      
      {/* LEFT COLUMN: Curated Creator Guides (Section 5.6) */}
      <div className="flex flex-col border-4 border-black bg-white p-4 sm:p-5 shadow-[8px_8px_0px_#000]">
        <div className="flex items-center gap-1.5 mb-3 select-none">
          <Sparkles className="w-4 h-4 text-[#FF00FF]" />
          <span className="font-mono text-xs font-black uppercase py-0.5 px-2 bg-black text-[#00FF00] border border-black">
            // CURATED CREATOR GUIDES //
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-none mb-1 uppercase select-none">
          CREATOR GUIDES
        </h3>
        <p className="text-xs text-black/70 mb-5 leading-relaxed uppercase font-black">
          Pre-planned, sequenced walks and outings designed by local trust partners. Tap to map the route!
        </p>

        <div className="space-y-4">
          {guides.map((guide) => {
            const isActive = activeGuideId === guide.id;
            return (
              <div 
                key={guide.id}
                onClick={() => onSelectGuide(guide)}
                className={`border-4 border-black p-3.5 transition-all cursor-pointer flex flex-col gap-3 relative rounded-none select-none ${
                  isActive 
                    ? "bg-[#FFF200] shadow-[4px_4px_0px_#000] translate-y-[2px]" 
                    : "bg-white hover:bg-neutral-50 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]"
                }`}
              >
                {/* Active check indicator */}
                {isActive && (
                  <span className="absolute top-2.5 right-2.5 py-0.5 px-1.5 text-[8px] bg-black text-[#00FF00] font-mono font-black border-2 border-black uppercase rotate-[3deg] shadow-sm">
                    ⚡ ROUTE LOADED fr
                  </span>
                )}

                <div className="flex gap-3">
                  <div className="w-16 h-16 shrink-0 border-2 border-black overflow-hidden bg-zinc-200">
                    <img 
                      referrerPolicy="no-referrer"
                      src={guide.coverUrl} 
                      alt={guide.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-mono bg-black text-[#00D1FF] px-1.5 py-0.5 border border-black font-black uppercase">
                      {guide.totalCostBudget}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-black mt-2 leading-tight line-clamp-2 uppercase">
                      {guide.title}
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-650 font-bold block mt-0.5 uppercase">
                      BY {getCreatorHandle(guide.creatorId)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-750 font-black leading-normal line-clamp-2 uppercase">
                  {guide.description}
                </p>

                {/* Commute metadata summary row */}
                <div className="flex items-center justify-between border-t-2 border-black pt-2.5 text-[10px] font-mono font-black uppercase">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Duration: {guide.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#FF00FF]">
                    <span>🎯 {guide.spots.length} Spots</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: User Saved List (Section 5.7) */}
      <div className="flex flex-col border-4 border-black bg-white p-4 sm:p-5 shadow-[8px_8px_0px_#000]">
        <div className="flex items-center gap-1.5 mb-3 select-none">
          <BookmarkCheck className="w-4 h-4 text-[#00D1FF]" />
          <span className="font-mono text-xs font-black uppercase py-0.5 px-2 bg-black text-white border border-black">
            // PERSONAL DIRECTORIES //
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-none mb-1 uppercase select-none">
          MY VIBELIST
        </h3>
        <p className="text-xs text-black/70 mb-5 leading-relaxed uppercase font-black">
          Your saved spots and bucket lists for offline checkups. Click any item below to view detail reports!
        </p>

        {/* Saved spots list */}
        <div className="flex-1 flex flex-col gap-2.5 min-h-[160px] overflow-y-auto max-h-[300px]">
          {savedSpots.length === 0 ? (
            <div className="flex-1 border-4 border-dashed border-zinc-400 p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl mb-1 select-none">🥐💼</span>
              <p className="text-xs font-mono font-black text-zinc-550 uppercase">
                VibeList is vacant fr fr
              </p>
              <p className="text-[10px] text-zinc-400 font-extrabold mt-1 uppercase max-w-[200px]">
                Click on spots in the directory to save them here for easy transport planning!
              </p>
            </div>
          ) : (
            savedSpots.map((spot) => (
              <div
                key={spot.id}
                onClick={() => onSelectSpot(spot)}
                className="p-3 border-4 border-black bg-white hover:bg-neutral-50 transition-all cursor-pointer flex items-center justify-between shadow-[3px_3px_0px_#000] hover:translate-y-[-1.5px] hover:shadow-[4px_4px_0px_#000] select-none rounded-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 border-2 border-black overflow-hidden bg-neutral-200">
                    <img 
                      referrerPolicy="no-referrer"
                      src={spot.imageUrl} 
                      alt={spot.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-black truncate leading-tight uppercase">
                      {spot.name}
                    </h4>
                    <span className="text-[9px] font-mono text-neutral-500 font-black uppercase">
                      {spot.neighborhood} ● {spot.category}
                    </span>
                  </div>
                </div>

                <div className="px-2 py-0.5 bg-black border border-black text-[#00FF00] font-mono text-[10px] font-black leading-none">
                  {spot.stats?.rating}/10
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
