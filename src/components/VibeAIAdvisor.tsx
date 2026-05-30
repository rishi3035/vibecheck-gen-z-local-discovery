/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, MessageCircle, RefreshCw, Send, HelpCircle, Eye, AlertCircle } from "lucide-react";
import { Spot } from "../types";
import { motion } from "motion/react";

interface VibeAIAdvisorProps {
  spots: Spot[];
  currentCity: string;
}

export default function VibeAIAdvisor({ spots, currentCity }: VibeAIAdvisorProps) {
  const [query, setQuery] = useState("");
  const [responseHtml, setResponseHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const suggestionChips = [
    "Somewhere quiet to code and drink matcha fr fr",
    "Underground vintage vinyl spot for a late date",
    "Cheapest thrifting racks with high aura",
    "Melancholy spots to play my playlist in Mumbai"
  ];

  const loadingPhrases = [
    "Consulting the bestie oracle... 🔮",
    "Measuring ceremonial matcha bubbles... 🍵",
    "Tuning record needles for analog warmth... 💿",
    "Sourcing high-contrast shadows... 🌤️",
    "Assembling the slangs fr fr... 💅"
  ];

  const handleSuggestClick = (suggestion: string) => {
    setQuery(suggestion);
    triggerSearch(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    triggerSearch(query);
  };

  const triggerSearch = async (userPrompt: string) => {
    setLoading(true);
    setResponseHtml("");
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingPhrases.length);
    }, 1500);

    try {
      const res = await fetch("/api/gemini/vibe-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          city: currentCity === "All" ? "" : currentCity,
          spots: spots
        })
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setResponseHtml(data.text);
      } else {
        setResponseHtml(`### ⚠️ VIBE COLLAPSED\n\nSomething went wrong translating your query: *"${data.error || "Mid network signal detected"}"*.\n\nTry sending the chat again high keys!`);
      }
    } catch (err: any) {
      setResponseHtml(`### ⚠️ OFFLINE SIGNAL\n\nCould not secure connections. Confirm the development server has booted correctly!`);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  // Convert raw markdown titles to basic html blocks easily so we are clean
  const renderMarkdownText = (text: string) => {
    if (!text) return "";
    // Basic regex formatting for subtitles, bold terms, list items
    return text
      .replace(/### (.*)/g, '<h4 class="text-base font-black uppercase text-black mt-4 leading-none select-none">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-black">$1</strong>')
      .replace(/ - (.*)/g, '<li class="text-xs pl-2 text-neutral-800 list-disc ml-4 mt-1 leading-normal uppercase font-black">$1</li>')
      .replace(/\n\n/g, '<p class="text-xs text-neutral-700 leading-relaxed mt-2"></p>');
  };

  return (
    <div className="border-4 border-black bg-white shadow-[8px_8px_0px_#000] p-4 sm:p-5 flex flex-col gap-4 font-sans shrink-0">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[#FF00FF] animate-pulse" />
        <span className="font-mono text-xs font-black uppercase tracking-wider bg-black text-white px-2 py-0.5">
          // AI VIBE ADVISOR //
        </span>
      </div>

      <h3 className="text-2xl font-black text-black leading-none uppercase select-none">
        ASK ME ANYTHING FR FR
      </h3>
      <p className="text-xs text-black/75 -mt-2 leading-relaxed uppercase font-black">
        Describe your mood, craving, or desired vibe (or pick a suggestions card) and let Gemini translate it into matching spots.
      </p>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-1.5 my-1">
        {suggestionChips.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSuggestClick(chip)}
            className="px-3 py-2.5 bg-white hover:bg-[#FFF200] border-4 border-black font-black text-[10px] sm:text-xs leading-none transition-all cursor-pointer hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_#000] active:translate-y-[1px]"
          >
            💬 {chip}
          </button>
        ))}
      </div>

      {/* Query Forms */}
      <form onSubmit={handleSubmit} className="flex gap-2 border-t-4 border-dashed border-black pt-4">
        <input 
          type="text"
          placeholder="E.g., I want an extreme aesthetic vinyl bar in Mumbai..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          className="flex-1 px-3 py-2.5 border-4 border-black font-sans text-xs font-bold focus:ring-0 focus:outline-none bg-white text-black placeholder:text-neutral-500 disabled:opacity-50 uppercase tracking-wide"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 bg-[#00FF00] text-black border-4 border-black hover:bg-[#00e35a] shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] font-black uppercase text-xs tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          id="ai-submit-btn"
        >
          <Send className="w-3.5 h-3.5" />
          Slay
        </button>
      </form>

      {/* AI Response Display Card */}
      {(loading || responseHtml) && (
        <div className="border-4 border-black bg-neutral-50/55 p-4 relative mt-1 min-h-[140px] flex flex-col justify-center shadow-[4px_4px_0px_#000]">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-6 text-center select-none">
              <RefreshCw className="w-8 h-8 text-[#FF00FF] animate-spin mb-3" />
              <p className="text-xs font-mono font-black uppercase tracking-wider text-black">
                {loadingPhrases[loadingStep]}
              </p>
              <span className="text-[10px] text-neutral-400 mt-1 italic font-mono uppercase font-black">No cap, genius is cooking...</span>
            </div>
          ) : (
            <div className="font-sans text-left space-y-2">
              <div className="flex items-center gap-1 border-b-4 border-black pb-1 mb-2 select-none">
                <span className="w-2 h-2 rounded-full bg-[#00FF00] animate-pulse"></span>
                <span className="text-[10px] font-mono font-black uppercase text-black">// BESTIE INSIGHT REPORT //</span>
              </div>
              <div 
                className="prose prose-sm leading-relaxed text-xs text-neutral-850"
                dangerouslySetInnerHTML={{ __html: renderMarkdownText(responseHtml) }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
