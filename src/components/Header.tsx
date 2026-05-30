/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Flame, Sparkles, MapPin, Coffee, Volume2 } from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  currentCity: "Bangalore" | "Mumbai" | "Delhi" | "Goa" | "All";
  onCityChange: (city: "Bangalore" | "Mumbai" | "Delhi" | "Goa" | "All") => void;
  savedCount: number;
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function Header({ currentCity, onCityChange, savedCount, user, onSignIn, onSignOut }: HeaderProps) {
  const cities: Array<"All" | "Bangalore" | "Mumbai" | "Delhi" | "Goa"> = [
    "All",
    "Bangalore",
    "Mumbai",
    "Delhi",
    "Goa"
  ];

  return (
    <header className="w-full flex flex-col border-b-4 border-black bg-[#FFF200] shrink-0 font-sans">
      {/* Dynamic Marquee/Ticker strip */}
      <div className="w-full bg-black py-2.5 overflow-hidden border-b-4 border-black text-[#00FF00] text-xs font-mono tracking-widest uppercase flex select-none font-bold">
        <div className="flex gap-16 animate-[infinite-scroll_25s_linear_infinite] whitespace-nowrap shrink-0">
          <span>// NO CAP LOCAL GEMS GATED BY REAL ONES FR FR //</span>
          <span>●</span>
          <span>// ESTIMATED MATCHA RATINGS ON LOCK //</span>
          <span>●</span>
          <span>// 99.9% AURA BOOST DETECTED IN ALL NEIGHBORHOODS //</span>
          <span>●</span>
          <span>// SPINNING ANALOG VINYLS ONLY NO MID PLAYLISTS ALLOWED //</span>
          <span>●</span>
          <span>// ZERO SPONSORED TRAPS HERE //</span>
          <span>●</span>
        </div>
        <div className="flex gap-16 animate-[infinite-scroll_25s_linear_infinite] whitespace-nowrap shrink-0" aria-hidden="true">
          <span>// NO CAP LOCAL GEMS GATED BY REAL ONES FR FR //</span>
          <span>●</span>
          <span>// ESTIMATED MATCHA RATINGS ON LOCK //</span>
          <span>●</span>
          <span>// 99.9% AURA BOOST DETECTED IN ALL NEIGHBORHOODS //</span>
          <span>●</span>
          <span>// SPINNING ANALOG VINYLS ONLY NO MID PLAYLISTS ALLOWED //</span>
          <span>●</span>
          <span>// ZERO SPONSORED TRAPS HERE //</span>
          <span>●</span>
        </div>
      </div>

      {/* Main branding row */}
      <div className="px-4 py-5 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className="p-2.5 sm:p-3 bg-[#FF00FF] text-white border-4 border-black shadow-[6px_6px_0px_#000] rotate-[-2deg] rounded-none cursor-pointer"
            whileHover={{ rotate: 3, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Flame className="w-6 h-6 sm:w-8 sm:h-8 fill-current text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-black select-none flex items-center gap-1.5 leading-none">
              VIBE_CHECK
              <span className="text-xs font-mono font-bold px-1.5 py-0.5 bg-black text-[#00FF00] border-2 border-black rotate-[3deg] select-none shadow-[2px_2px_0px_#00FF00]">
                GEN_Z
              </span>
            </h1>
            <p className="text-xs sm:text-xs font-mono font-bold text-black uppercase tracking-wider mt-1.5">
              // curated by real ones ● zero gatekeeping //
            </p>
          </div>
        </div>

        {/* City selectors */}
        <div className="flex flex-wrap items-center gap-2 justify-center">
          <span className="text-xs font-bold uppercase font-mono px-3 py-1.5 bg-black text-white mr-1 flex items-center gap-1 shadow-sm rounded-none border-2 border-black select-none">
            <MapPin className="w-3.5 h-3.5 text-[#00FF00]" /> CITY:
          </span>
          {cities.map((city) => {
            const isActive = currentCity === city;
            return (
              <button
                key={city}
                onClick={() => onCityChange(city)}
                className={`px-3.5 py-2 font-black text-xs uppercase transition-all duration-100 border-4 border-black rounded-none shadow-[4px_4px_0px_#000] cursor-pointer ${
                  isActive
                    ? "bg-[#00D1FF] text-black translate-y-[2px] shadow-[2px_2px_0px_#000]"
                    : "bg-white text-black hover:bg-neutral-100 hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000]"
                }`}
                id={`city-tab-${city.toLowerCase()}`}
              >
                {city === "All" ? "🌍 Global" : city}
              </button>
            );
          })}
        </div>

        {/* Saved Count Indicator */}
        <div className="flex items-center gap-3 flex-wrap justify-center font-sans select-none">
          {user ? (
            <div className="flex items-center gap-2 border-4 border-black bg-[#FF00FF] text-white px-3 py-1.5 shadow-[4px_4px_0px_#000] font-sans text-xs font-black">
              {user.photoURL ? (
                <img referrerPolicy="no-referrer" src={user.photoURL} alt="Avatar" className="w-5 h-5 rounded-none border-2 border-black shrink-0" />
              ) : (
                <span className="text-sm">🔑</span>
              )}
              <span className="hidden sm:inline lowercase text-[10px] truncate max-w-[80px]">
                {user.email?.split("@")[0]}
              </span>
              <button 
                onClick={onSignOut}
                className="ml-1 px-1.5 py-0.5 bg-black text-[#00FF00] font-mono text-[9px] border border-black cursor-pointer hover:bg-zinc-800 transition-all uppercase leading-none"
              >
                Exit
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="px-3 py-2 bg-[#FF00FF] text-white border-4 border-black font-sans font-black text-xs shadow-[4px_4px_0px_#000] flex items-center gap-1.5 cursor-pointer hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] select-none"
            >
              🔐 Login
            </button>
          )}

          <div className="px-3.5 py-2 bg-[#00FF00] border-4 border-black font-mono font-black text-xs shadow-[4px_4px_0px_#000] flex items-center gap-1.5 select-none">
            <Sparkles className="w-4 h-4 text-black animate-pulse" />
            AURA: +{(savedCount * 120) + 1200}
          </div>

          <div className="px-3.5 py-2 bg-white border-4 border-black font-mono font-black text-xs shadow-[4px_4px_0px_#000] flex items-center gap-1.5 select-none">
            🍵 SAVED: {savedCount}
          </div>
        </div>
      </div>

      {/* Styled animation styles */}
      <style>{`
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </header>
  );
}
