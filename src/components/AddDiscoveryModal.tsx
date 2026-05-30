/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Sliders, MapPin, Sparkles, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Spot } from "../types";

interface AddDiscoveryModalProps {
  onClose: () => void;
  onAdd: (spot: Spot) => void;
  currentUser: any;
}

export default function AddDiscoveryModal({ onClose, onAdd, currentUser }: AddDiscoveryModalProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState<"Bangalore" | "Mumbai" | "Delhi" | "Goa">("Bangalore");
  const [neighborhood, setNeighborhood] = useState("");
  const [category, setCategory] = useState<"Cafe" | "Vinyl Bar" | "Thrift Store" | "Sunset Spot" | "Bookstore">("Cafe");
  const [priceRange, setPriceRange] = useState<"Broke Bestie" | "Comfy Enough" | "Treat Yourself" | "Trust Fund Baby">("Comfy Enough");
  const [description, setDescription] = useState("");
  const [whyGo, setWhyGo] = useState("");
  const [bestTime, setBestTime] = useState("");
  const [whatToOrder, setWhatToOrder] = useState("");
  const [touristWarning, setTouristWarning] = useState("");
  const [onlyLocalsKnow, setOnlyLocalsKnow] = useState(true);
  const [vibesInput, setVibesInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !neighborhood.trim() || !description.trim()) {
      alert("⚠️ Fill in the Name, Neighborhood and description to compile vibe fr!");
      return;
    }

    // Generate random coordinates inside appropriate geographic sectors
    const latBase = city === "Bangalore" ? 12.97 : city === "Mumbai" ? 19.05 : city === "Delhi" ? 28.55 : 15.59;
    const lngBase = city === "Bangalore" ? 77.64 : city === "Mumbai" ? 72.82 : city === "Delhi" ? 77.19 : 73.78;
    const lat = latBase + (Math.random() - 0.5) * 0.08;
    const lng = lngBase + (Math.random() - 0.5) * 0.08;

    const fallbackImages: Record<string, string> = {
      Cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600",
      "Vinyl Bar": "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=600",
      "Thrift Store": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=600",
      "Sunset Spot": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=600",
      Bookstore: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=600"
    };

    const parsedVibes = vibesInput
      ? vibesInput.split(",").map(v => v.trim()).filter(v => v.length > 0)
      : ["Main Character Energy", "Cozy Slay", "Real Local Spot"];

    const newSpot: Spot = {
      id: `spot-user-${Date.now()}`,
      name: name,
      city: city,
      neighborhood: neighborhood,
      category: category,
      priceRange: priceRange,
      address: `${neighborhood}, ${city}`,
      coords: { lat, lng },
      imageUrl: imageUrl.trim() || fallbackImages[category],
      description: description,
      whyGo: whyGo || "Recommended by trusted community partners.",
      bestTime: bestTime || "Weekday evening slots",
      whatToOrder: whatToOrder || "Ask the counter for daily specials fr.",
      stats: {
        rating: parseFloat((8.5 + Math.random() * 1.4).toFixed(1)),
        wifiClass: "Wfh-Ready Speed",
        goldenHour: bestTime || "5:00 PM Golden Light",
        noiseLevel: "Ambient Chords Only"
      },
      creatorId: currentUser ? currentUser.uid : "sofia",
      gatekept: onlyLocalsKnow,
      votesHype: 1,
      votesMid: 0,
      vibes: parsedVibes,
      onlyLocalsKnow: onlyLocalsKnow,
      touristTrapWarning: touristWarning || "Avoid commercial copycats next door; stay in the primary designated zone.",
      nearbyDiscoveries: []
    };

    onAdd(newSpot);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-xl bg-white border-4 border-black p-5 sm:p-6 shadow-[10px_10px_0px_#000] relative rounded-none select-none font-sans my-8">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-[#FF00FF] hover:bg-[#ff33ff] text-white border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-[#00FF00] animate-bounce" />
          <span className="font-mono text-xs font-black uppercase tracking-wider bg-black text-white px-2 py-0.5">
            // SUBMIT LOCAL DISCOVERY //
          </span>
        </div>

        <h3 className="text-2xl font-black text-black tracking-tight leading-none uppercase mb-2">
          SHARE A SECRET GEM fr fr
        </h3>
        <p className="text-xs text-neutral-600 mb-5 leading-normal uppercase font-black">
          Add an authentic discovery spot to our maps. Submitting awards you **+150 Aura points** immediately!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
          
          {/* Row 1: Name and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-black uppercase font-mono text-black mb-1">Spot Name *</label>
              <input 
                type="text"
                placeholder="E.g., The Chai Alchemist"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border-2 border-black font-sans text-xs font-bold focus:outline-none bg-white text-black text-transform-uppercase"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase font-mono text-black mb-1">Category *</label>
              <select 
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black font-sans text-xs font-bold focus:outline-none bg-white text-black"
              >
                <option value="Cafe">🍵 Cafe</option>
                <option value="Vinyl Bar">💿 Vinyl Bar</option>
                <option value="Thrift Store">👗 Thrift Store</option>
                <option value="Sunset Spot">🌅 Sunset Spot</option>
                <option value="Bookstore">📚 Bookstore</option>
              </select>
            </div>
          </div>

          {/* Row 2: City and Neighborhood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-black uppercase font-mono text-black mb-1">Select City *</label>
              <select 
                value={city}
                onChange={(e: any) => setCity(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black font-sans text-xs font-bold focus:outline-none bg-white text-black"
              >
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Goa">Goa</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase font-mono text-black mb-1">Neighborhood *</label>
              <input 
                type="text"
                placeholder="E.g., Bandra West or Indiranagar"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                required
                className="w-full px-3 py-2 border-2 border-black font-sans text-xs font-bold focus:outline-none bg-white text-black"
              />
            </div>
          </div>

          {/* Row 3: Price range and image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-black uppercase font-mono text-black mb-1">Price Class *</label>
              <select 
                value={priceRange}
                onChange={(e: any) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black font-sans text-xs font-bold focus:outline-none bg-white text-black"
              >
                <option value="Broke Bestie">Broke Bestie (💸 Cheap/Free)</option>
                <option value="Comfy Enough">Comfy Enough (🍕 Moderate)</option>
                <option value="Treat Yourself">Treat Yourself (🍣 Premium)</option>
                <option value="Trust Fund Baby">Trust Fund Baby (💎 Boujee)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase font-mono text-black mb-1">Optional Photo Link</label>
              <input 
                type="url"
                placeholder="https://images.unsplash.com/... or leave empty"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black font-sans text-xs font-bold focus:outline-none bg-white text-black"
              />
            </div>
          </div>

          {/* Row 4: Short Description & Why Go */}
          <div>
            <label className="block text-[11px] font-black uppercase font-mono text-black mb-1">Description (Mood Description) *</label>
            <textarea 
              placeholder="What's the energy here? Maximize the aesthetic descriptions fr fr."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              required
              className="w-full px-3 py-2 border-2 border-black font-sans text-xs font-bold focus:outline-none bg-white text-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-black uppercase font-mono text-black mb-1">Why Go</label>
              <input 
                type="text"
                placeholder="What is so unique about this?"
                value={whyGo}
                onChange={(e) => setWhyGo(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black font-sans text-xs font-bold focus:outline-none bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase font-mono text-black mb-1">Vibe Tags (Comma separated)</label>
              <input 
                type="text"
                placeholder="Aesthetic AF, Cozy, Lowkey Slay"
                value={vibesInput}
                onChange={(e) => setVibesInput(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black font-sans text-xs font-bold focus:outline-none bg-white text-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-black uppercase font-mono text-black mb-1">Best Time to Arrive</label>
              <input 
                type="text"
                placeholder="E.g., 5:15 PM for golden hours"
                value={bestTime}
                onChange={(e) => setBestTime(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black font-sans text-xs font-bold focus:outline-none bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase font-mono text-black mb-1">Bestie Order Assignment</label>
              <input 
                type="text"
                placeholder="E.g., Lavender matcha float"
                value={whatToOrder}
                onChange={(e) => setWhatToOrder(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black font-sans text-xs font-bold focus:outline-none bg-white text-black"
              />
            </div>
          </div>

          {/* Tourist warning & Only locals know Checkbox */}
          <div>
            <label className="block text-[11px] font-mono font-black uppercase text-black mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FF00FF]" /> Tourist Trap Warning:
            </label>
            <input 
              type="text"
              placeholder="E.g., Avoid the duplicate snack stand right on the signal corner!"
              value={touristWarning}
              onChange={(e) => setTouristWarning(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black font-sans text-xs font-bold focus:outline-none bg-white text-black"
            />
          </div>

          {/* Checkbox item */}
          <div className="p-3 border-4 border-black bg-[#FFF200]/20 flex items-center justify-between select-none">
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase text-black">Would a tourist normally find this place?</span>
              <span className="text-[10px] text-neutral-500 font-bold uppercase">No means it is listed as an 'Only Locals Know' gem.</span>
            </div>
            <button
              type="button"
              onClick={() => setOnlyLocalsKnow(!onlyLocalsKnow)}
              className={`w-10 h-10 border-4 border-black font-black text-xs uppercase flex items-center justify-center transition-all cursor-pointer ${
                onlyLocalsKnow ? "bg-[#00FF00] text-black" : "bg-white text-black"
              }`}
            >
              {onlyLocalsKnow ? "❌" : "✓"}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t-4 border-dashed border-black pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-black text-xs font-black uppercase border-4 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer"
            >
              Retract Spot
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-[#00FF00] text-black text-xs font-black uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Deploy Spot to Radar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
