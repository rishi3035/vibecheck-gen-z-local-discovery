/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { Map, Navigation, Compass, Plus, Minus, Info, Sparkles } from "lucide-react";
import { Spot } from "../types";
import { motion } from "motion/react";

interface VibeMapProps {
  spots: Spot[];
  selectedSpot: Spot | null;
  onSelectSpot: (spot: Spot) => void;
  cityContext: string;
}

export default function VibeMap({ spots, selectedSpot, onSelectSpot, cityContext }: VibeMapProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [hoveredPin, setHoveredPin] = useState<Spot | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulated origin for our commutes (Center of town vibes)
  const origin = { x: 50, y: 50 };

  // Helper to project coordinates on a 2D canvas grid
  const getProjectedCoords = (spot: Spot) => {
    // Generate organic distinct localized coordinates for each spot based on their ID hash
    let hash = 0;
    for (let i = 0; i < spot.id.length; i++) {
      hash += spot.id.charCodeAt(i);
    }
    const x = 20 + (hash % 60); // 20% to 80% range
    const y = 25 + ((hash * 7) % 55); // 25% to 80% range
    return { x, y };
  };

  const getDistanceEmoji = (category: string) => {
    switch (category) {
      case "Cafe": return "🍵";
      case "Vinyl Bar": return "💿";
      case "Thrift Store": return "👗";
      case "Sunset Spot": return "🌅";
      case "Bookstore": return "📚";
      default: return "📍";
    }
  };

  return (
    <div className="flex flex-col border-4 border-black bg-white shadow-[8px_8px_0px_#000] w-full h-[380px] sm:h-[460px] font-sans relative overflow-hidden shrink-0">
      {/* Map Control Bar in Monospace style */}
      <div className="w-full bg-[#FF00FF] border-b-4 border-black p-3.5 flex items-center justify-between text-white font-mono text-xs select-none">
        <div className="flex items-center gap-2 font-black font-sans text-white">
          <Compass className="w-5 h-5 text-white animate-spin-slow" />
          <span>VIBE_RADAR_MAP_v2.05</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 font-black">
          <span>ACTIVE_NODES: {spots.length}</span>
          <span>CITY: {cityContext === "All" ? "GLOBAL" : cityContext.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setZoom(z => Math.max(z - 10, 60))}
            className="p-1 px-1.5 bg-black border-2 border-white text-white hover:bg-neutral-800 font-extrabold cursor-pointer"
          >
            -
          </button>
          <span className="font-black text-[10px] bg-black px-1.5 py-1 border-2 border-white shrink-0">{zoom}%</span>
          <button 
            onClick={() => setZoom(z => Math.min(z + 10, 150))}
            className="p-1 px-1.5 bg-black border-2 border-white text-white hover:bg-neutral-800 font-extrabold cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* Actual Map Canvas Area */}
      <div 
        ref={containerRef}
        className="relative flex-1 bg-[#F5F2EA] overflow-hidden neo-grid-pattern cursor-grab select-none"
      >
        {/* Core Center Bestie Origin */}
        <div 
          className="absolute z-20 w-8 h-8 flex items-center justify-center pointer-events-none"
          style={{ left: `${origin.x}%`, top: `${origin.y}%`, transform: "translate(-50%, -50%)" }}
        >
          <div className="absolute w-6 h-6 bg-[#00FF00] border-2 border-black rounded-full animate-ping opacity-60"></div>
          <div className="w-5 h-5 bg-[#00FF00] border-3 border-black rounded-full flex items-center justify-center shadow-md">
            <span className="text-[10px] font-black">🕺</span>
          </div>
        </div>

        {/* Laser commuting path from active to selected spot */}
        {selectedSpot && (() => {
          const projected = getProjectedCoords(selectedSpot);
          // Simple visual line linking origin to the pin
          return (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 animate-none">
              <line 
                x1={`${origin.x}%`} 
                y1={`${origin.y}%`} 
                x2={`${projected.x}%`} 
                y2={`${projected.y}%`} 
                stroke="#FF00FF" 
                strokeWidth="4" 
                strokeDasharray="6,6"
                className="animate-[dash_1.5s_linear_infinite]"
              />
            </svg>
          );
        })()}

        {/* Render interactive vector spots */}
        {spots.map((spot) => {
          const projected = getProjectedCoords(spot);
          const isSelected = selectedSpot?.id === spot.id;
          const isHovered = hoveredPin?.id === spot.id;

          return (
            <div
              key={spot.id}
              className="absolute z-20"
              style={{
                left: `${projected.x}%`,
                top: `${projected.y}%`,
                transform: `translateX(-50%) translateY(-100%) scale(${zoom / 100})`,
                transition: "all 0.15s ease-out-in"
              }}
              id={`marker-spot-${spot.id}`}
            >
              {/* Tapping trigger wrapper */}
              <button
                onClick={() => onSelectSpot(spot)}
                onMouseEnter={() => setHoveredPin(spot)}
                onMouseLeave={() => setHoveredPin(null)}
                className={`flex flex-col items-center group relative cursor-pointer`}
              >
                {/* Micro speechbubble spot tag on hover or selection */}
                {(isHovered || isSelected) && (
                  <motion.div 
                    initial={{ scale: 0.85, y: 5, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    className="absolute bottom-[48px] whitespace-nowrap bg-black text-white px-2.5 py-1 text-[10px] font-mono leading-none border-2 border-black shadow-[3px_3px_0px_#00FF00] z-40 flex items-center gap-1 rotate-[-1deg]"
                  >
                    <span>{getDistanceEmoji(spot.category)}</span>
                    <span className="font-bold uppercase">{spot.name}</span>
                    <span className="text-[#00FF00] font-extrabold">{spot.stats?.rating}/10</span>
                  </motion.div>
                )}

                {/* Styled Pin Marker Body */}
                <div className={`p-2 rounded-none border-4 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-transform duration-100 ${
                  isSelected 
                    ? "bg-[#FFF200] scale-110 -translate-y-1.5" 
                    : "bg-white group-hover:bg-[#00D1FF]"
                }`}>
                  <span className="text-sm font-black select-none">
                    {getDistanceEmoji(spot.category)}
                  </span>
                </div>

                {/* Drop indicator pointer */}
                <div className="w-[4px] h-[6px] bg-black"></div>
              </button>
            </div>
          );
        })}

        {/* Empty layout state check */}
        {spots.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-neutral-100/80 z-30 font-sans">
            <Info className="w-10 h-10 text-neutral-400 mb-2" />
            <p className="text-sm font-bold text-black uppercase leading-none">NO SPOTS ON THE RADAR</p>
            <p className="text-xs text-neutral-500 mt-1">Adjust your budget tier or check out the global state! ✨</p>
          </div>
        )}
      </div>

      {/* Interactive Map commuter feedback details */}
      <div className="w-full bg-[#111111] border-t-4 border-black p-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-white font-mono text-[10px] sm:text-xs tracking-wide">
        {selectedSpot ? (
          <>
            <div className="flex items-center gap-2 select-none">
              <span className="w-2.5 h-2.5 bg-[#FF00FF] border border-black animate-ping"></span>
              <span className="text-[#00FF00] font-black uppercase">// ROUTE CALIBRATED fr fr:</span>
              <span className="text-white font-sans font-black uppercase">{selectedSpot.name}</span>
            </div>
            <div className="flex items-center gap-4 mt-1.5 sm:mt-0 font-black bg-zinc-900 border-2 border-neutral-700 py-1 px-2.5 uppercase">
              <span>📏 {1.2 + (selectedSpot.id.charCodeAt(5) % 8) * 0.4} KM</span>
              <span className="text-[#00D1FF]">🛵 {(5 + (selectedSpot.name.length % 12))} Min Vespa runs</span>
              <span className="text-neutral-400">AURA +40XP</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-neutral-400 w-full justify-center text-center">
            <Sparkles className="w-4 h-4 text-[#FFF200] animate-bounce" />
            <span className="font-extrabold uppercase">// Select any node on the radar above to navigate... //</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
