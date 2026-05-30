/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SPOTS, CREATORS, GUIDES } from "./data";
import { Spot, Creator, Guide, LiveTip, SavedList } from "./types";
import Header from "./components/Header";
import OnboardingQuiz from "./components/OnboardingQuiz";
import VibeMap from "./components/VibeMap";
import SpotDetailDrawer from "./components/SpotDetailDrawer";
import VibeAIAdvisor from "./components/VibeAIAdvisor";
import AddDiscoveryModal from "./components/AddDiscoveryModal";
import { 
  Sparkles, SlidersHorizontal, MapPin, Search, ArrowRight, 
  Map, Info, Check, Plus, Trash2, Wifi, MessageSquare, Compass,
  Flame, Heart, Eye, ShieldAlert, BadgeCheck, Users, Trophy, BookMarked, ToggleLeft, ToggleRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  auth, 
  db, 
  signInWithGoogle, 
  logoutUser, 
  OperationType, 
  handleFirestoreError 
} from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from "firebase/firestore";

export default function App() {
  // Navigation & tab slots
  const [activeTab, setActiveTab] = useState<"feed" | "search" | "radar" | "creators">("feed");
  const [cityContext, setCityContext] = useState<"Bangalore" | "Mumbai" | "Delhi" | "Goa" | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [vibeQuizToggled, setVibeQuizToggled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Onboarding Quiz state filters
  const [vibeFilter, setVibeFilter] = useState<string | null>(null);
  const [budgetFilter, setVibeFilterBudget] = useState<string | null>(null);

  // Dynamic Data Lists (React States supporting newly added items and metrics)
  const [spotsList, setSpotsList] = useState<Spot[]>(SPOTS);
  const [creatorsList, setCreatorsList] = useState<Creator[]>(CREATORS);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(SPOTS[0]);
  const [activeGuideId, setActiveGuideId] = useState<string | null>(null);

  // Aura reputation score for user
  const [userAuraPoints, setUserAuraPoints] = useState<number>(1200);

  // Saved Lists folders (Explorer goal)
  const [saveLists, setSaveLists] = useState<SavedList[]>([
    { id: "sl-1", name: "Weekend Plans", spotIds: ["spot-1", "spot-5"], emoji: "📅" },
    { id: "sl-2", name: "Food Bucket List", spotIds: ["spot-3"], emoji: "🍔" },
    { id: "sl-3", name: "Date Night List", spotIds: ["spot-2", "spot-7"], emoji: "💖" },
    { id: "sl-4", name: "Solo Adventures", spotIds: ["spot-4"], emoji: "🧗" }
  ]);
  const [newListName, setNewListName] = useState("");
  const [newListEmoji, setNewListEmoji] = useState("🎒");
  const [selectedListId, setSelectedListId] = useState<string>("sl-1");

  // "Only Locals Know" strict filter
  const [onlyLocalsKnowActive, setOnlyLocalsKnowActive] = useState<boolean>(false);

  // Followed creators ids
  const [followedCreatorIds, setFollowedCreatorIds] = useState<string[]>(["marcus"]);

  // Share Discovery Modal state
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);

  // Authentication State
  const [user, setUser] = useState<any>(null);

  // Saved catalogs fallback (or linked to Default saved spots collection)
  const [savedSpotIds, setSavedSpotIds] = useState<string[]>(["spot-1", "spot-5"]);

  // Dynamic live community tips state
  const [liveTips, setLiveTips] = useState<LiveTip[]>([]);

  // 1. Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Create user profile doc if needed
        try {
          await setDoc(doc(db, "users", currentUser.uid), {
            uid: currentUser.uid,
            email: currentUser.email || "",
            createdAt: new Date().toISOString()
          }, { merge: true });
        } catch (error) {
          console.error("Failed to create user profile doc:", error);
        }

        // Real-time synchronization of saved spot IDs
        const savedQuery = collection(db, "users", currentUser.uid, "savedSpots");
        const unsubscribeSaved = onSnapshot(savedQuery, (snapshot) => {
          const ids = snapshot.docs.map(doc => doc.id);
          setSavedSpotIds(ids);
          // Sync default lists
          setSaveLists(prev => prev.map(list => {
            if (list.id === "sl-1") {
              return { ...list, spotIds: [...new Set([...list.spotIds, ...ids])] };
            }
            return list;
          }));
        }, (error) => {
          console.error("Failed to fetch saved spots:", error);
        });

        return () => {
          unsubscribeSaved();
        };
      } else {
        // Fallback static
        setSavedSpotIds(["spot-1", "spot-5"]);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time synchronization of public community tips
  useEffect(() => {
    const tipsCollection = collection(db, "liveTips");
    const unsubscribeTips = onSnapshot(tipsCollection, async (snapshot) => {
      if (snapshot.empty) {
        // Seeding the clean DB instance from the original hardcoded mock data
        try {
          const batch = writeBatch(db);
          const initialTips = [
            {
              id: "spot-1-tip-1",
              spotId: "spot-1",
              user: "MatchaRider",
              handle: "@matcha_rider",
              text: "The ceremonial grade lavender espresso float actually made me emotional fr fr. 🧊💜 10/10.",
              isVerified: true,
              timestamp: "Today, 4:12 PM",
              isHype: true
            },
            {
              id: "spot-1-tip-2",
              spotId: "spot-1",
              user: "RetroVandal",
              handle: "@retro_digs",
              text: "Extremely quiet on early Tuesdays. Snag the concrete wall seat for maximum shadow light.",
              isVerified: true,
              timestamp: "Yesterday",
              isHype: true
            },
            {
              id: "spot-2-tip-1",
              spotId: "spot-2",
              user: "SpinBestie",
              handle: "@vinyl_bestie",
              text: "Zero signal inside, which is an absolute blessing. Sip slowly and let the audio horn wash over you.",
              isVerified: true,
              timestamp: "2 days ago",
              isHype: true
            },
            {
              id: "spot-3-tip-1",
              spotId: "spot-3",
              user: "StreetDrip_99",
              handle: "@street_drip",
              text: "Most vintage thrift stores are overpriced, but this place drop prices to absolute steals fr. 🔥",
              isVerified: true,
              timestamp: "Just now",
              isHype: true
            },
            {
              id: "spot-7-tip-1",
              spotId: "spot-7",
              user: "SunsetSeeker",
              handle: "@sunset_slay",
              text: "Gatekept level is 99 on this rocky spot. Seriously, don't scream about this on TikTok.",
              isVerified: false,
              timestamp: "Today, 11:32 AM",
              isHype: true
            }
          ];

          for (const item of initialTips) {
            batch.set(doc(db, "liveTips", item.id), item);
          }
          await batch.commit();
        } catch (err) {
          console.error("Failed to seed initial tips:", err);
        }
      } else {
        const tips = snapshot.docs.map(doc => doc.data() as LiveTip);
        setLiveTips(tips);
      }
    }, (error) => {
      console.error("Failed to sync live tips:", error);
    });

    return () => unsubscribeTips();
  }, []);

  // Handle saving spots to general catalog vs customized list state
  const handleToggleSave = async (spotId: string) => {
    // Add dynamic aura points
    increaseAuraPoints(80);

    const isCurrentlySaved = savedSpotIds.includes(spotId);

    // Sync state lists
    setSaveLists(prev => prev.map(list => {
      if (list.id === "sl-1") {
        const alreadyIn = list.spotIds.includes(spotId);
        return {
          ...list,
          spotIds: alreadyIn ? list.spotIds.filter(id => id !== spotId) : [...list.spotIds, spotId]
        };
      }
      return list;
    }));

    if (!auth.currentUser) {
      setSavedSpotIds(prev => 
        prev.includes(spotId) 
          ? prev.filter(id => id !== spotId) 
          : [...prev, spotId]
      );
      return;
    }

    const userId = auth.currentUser.uid;
    const saveRef = doc(db, "users", userId, "savedSpots", spotId);

    try {
      if (isCurrentlySaved) {
        await deleteDoc(saveRef);
      } else {
        await setDoc(saveRef, {
          userId,
          spotId,
          savedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/savedSpots/${spotId}`);
    }
  };

  // Submit community tip
  const handleSubmitTip = async (text: string, isHype: boolean) => {
    if (!selectedSpot) return;

    if (!auth.currentUser) {
      // Offline fallback community tip contribution
      const tipId = `${selectedSpot.id}-tip-${Date.now()}`;
      const newTip: LiveTip = {
        id: tipId,
        spotId: selectedSpot.id,
        user: "LocalSlayer",
        handle: "@local_slayer_fr",
        text: text,
        isVerified: false,
        timestamp: "Just Now",
        isHype: isHype
      };
      setLiveTips(prev => [newTip, ...prev]);
      increaseAuraPoints(60);
      return;
    }

    const tipId = `${selectedSpot.id}-tip-${Date.now()}`;
    const newTip: LiveTip = {
      id: tipId,
      spotId: selectedSpot.id,
      user: auth.currentUser.displayName || auth.currentUser.email?.split("@")[0] || "anon",
      handle: `@${auth.currentUser.email?.split("@")[0] || "local_bestie"}`,
      text: text,
      isVerified: true,
      timestamp: "Just Now fr",
      isHype: isHype
    };

    try {
      await setDoc(doc(db, "liveTips", tipId), newTip);
      increaseAuraPoints(60);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `liveTips/${tipId}`);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Sign-in failed:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  };

  // Dynamic Aura Reputation increments
  const increaseAuraPoints = (pts: number) => {
    setUserAuraPoints(prev => Math.max(0, prev + pts));
  };

  // Switch custom Save list folders
  const handleCreateCustomList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const newList: SavedList = {
      id: `custom-list-${Date.now()}`,
      name: newListName.trim(),
      spotIds: selectedSpot ? [selectedSpot.id] : [],
      emoji: newListEmoji
    };
    setSaveLists(prev => [...prev, newList]);
    setNewListName("");
    increaseAuraPoints(150);
  };

  const handleAddSpotToCustomList = (listId: string, spotId: string) => {
    setSaveLists(prev => prev.map(list => {
      if (list.id === listId) {
        const exists = list.spotIds.includes(spotId);
        return {
          ...list,
          spotIds: exists ? list.spotIds.filter(id => id !== spotId) : [...list.spotIds, spotId]
        };
      }
      return list;
    }));
    increaseAuraPoints(50);
  };

  // Handling creator follows toggles
  const handleToggleFollow = (creatorId: string) => {
    const isFollowing = followedCreatorIds.includes(creatorId);
    if (isFollowing) {
      setFollowedCreatorIds(prev => prev.filter(id => id !== creatorId));
      setCreatorsList(prev => prev.map(c => c.id === creatorId ? { ...c, followers: c.followers - 1 } : c));
      increaseAuraPoints(-100);
    } else {
      setFollowedCreatorIds(prev => [...prev, creatorId]);
      setCreatorsList(prev => prev.map(c => c.id === creatorId ? { ...c, followers: c.followers + 1, aura: c.aura + 150 } : c));
      increaseAuraPoints(100);
    }
  };

  // Handling user spot creations (Deploys spot straight onto dynamic list)
  const handleAddUserSpot = (newSpot: Spot) => {
    setSpotsList(prev => [newSpot, ...prev]);
    // update creators list state incrementing spots count for Sofia as active or default
    setCreatorsList(prev => prev.map(c => c.id === "sofia" ? { ...c, discoveriesCount: c.discoveriesCount + 1, aura: c.aura + 500 } : c));
    setAddModalOpen(false);
    setSelectedSpot(newSpot);
    // Switch straight to the map view so they can see their pin lit on the VibeRadar
    setActiveTab("radar");
    increaseAuraPoints(300);
  };

  // Retrieve user reputation labels based on Aura metrics
  const getReputationLabel = (pts: number) => {
    if (pts < 1400) return { title: "Baby Explorer", badge: "🥐", border: "border-[#FF00FF]", text: "text-[#FF00FF]" };
    if (pts < 2000) return { title: "Matcha Sleuth", badge: "🍵", border: "border-[#00D1FF]", text: "text-[#00D1FF]" };
    return { title: "Chief Aesthetic Officer", badge: "👑", border: "border-[#00FF00]", text: "text-[#00FF00]" };
  };

  // Compiling category emoji
  const getEmojiForCategory = (cat: string) => {
    switch (cat) {
      case "Cafe": return "🍵";
      case "Vinyl Bar": return "💿";
      case "Thrift Store": return "👗";
      case "Sunset Spot": return "🌅";
      case "Bookstore": return "📚";
      default: return "📍";
    }
  };

  // Filter dynamic spots list
  const filteredSpots = spotsList.filter((spot) => {
    // City filter
    if (cityContext !== "All" && spot.city.toLowerCase() !== cityContext.toLowerCase()) {
      return false;
    }

    // Category Quick filter
    if (activeCategory !== "All" && spot.category !== activeCategory) {
      return false;
    }

    // ONLY LOCALS KNOW strict gatekeeping trigger
    if (onlyLocalsKnowActive && !spot.onlyLocalsKnow && !spot.gatekept) {
      return false;
    }

    // Card search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = spot.name.toLowerCase().includes(query);
      const matchNhood = spot.neighborhood.toLowerCase().includes(query);
      const matchWhy = spot.whyGo.toLowerCase().includes(query);
      const matchCat = spot.category.toLowerCase().includes(query);
      const matchVibe = spot.vibes.some(v => v.toLowerCase().includes(query));
      if (!matchName && !matchNhood && !matchWhy && !matchCat && !matchVibe) {
        return false;
      }
    }

    // Onboarding Match Vibe Filters
    if (vibeFilter) {
      if (vibeFilter === "Matcha" && !spot.vibes.includes("Matcha Heaven")) return false;
      if (vibeFilter === "Vinyl Only" && !spot.vibes.includes("Vinyl Only")) return false;
      if (vibeFilter === "Y2K Vintage" && !spot.vibes.includes("Y2K Vintage")) return false;
      if (vibeFilter === "Sunset Spot" && spot.category !== "Sunset Spot") return false;
      if (vibeFilter === "Quiet Slay" && !spot.vibes.includes("Quiet Slay")) return false;
    }

    // Onboarding Budget Filters
    if (budgetFilter && spot.priceRange !== budgetFilter) {
      return false;
    }

    return true;
  });

  // Calculate active categories count for quick tabs
  const getCategoryCount = (cat: string) => {
    return spotsList.filter(s => {
      const cityMatch = cityContext === "All" || s.city.toLowerCase() === cityContext.toLowerCase();
      const localsMatch = !onlyLocalsKnowActive || s.onlyLocalsKnow || s.gatekept;
      const catMatch = cat === "All" || s.category === cat;
      return cityMatch && localsMatch && catMatch;
    }).length;
  };

  const reputationState = getReputationLabel(userAuraPoints);

  return (
    <div className="min-h-screen bg-[#FFF200] neo-grid-pattern text-black font-sans flex flex-col pb-16 selection:bg-[#FF00FF] selection:text-white">
      
      {/* Dynamic Navigation Header with authenticated parameters */}
      <Header 
        currentCity={cityContext} 
        onCityChange={(city) => {
          setCityContext(city);
          setActiveGuideId(null);
        }} 
        savedCount={savedSpotIds.length}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Primary Layout Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

        {/* NEO-BRUTALIST TAB SELECTORS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-sans select-none shrink-0">
          <button
            onClick={() => setActiveTab("feed")}
            className={`py-3 px-4 border-4 border-black text-xs md:text-sm font-black uppercase transition-all tracking-wider cursor-pointer shadow-[6px_6px_0px_#000] flex items-center justify-center gap-1.5 ${
              activeTab === "feed" 
                ? "bg-[#FF00FF] text-white translate-y-[2px] shadow-[2px_2px_0px_#000]" 
                : "bg-white text-black hover:bg-neutral-50 hover:translate-y-[-1px] hover:shadow-[7px_7px_0px_#000]"
            }`}
          >
            🏝️ Vibe Feed
          </button>
          
          <button
            onClick={() => setActiveTab("search")}
            className={`py-3 px-4 border-4 border-black text-xs md:text-sm font-black uppercase transition-all tracking-wider cursor-pointer shadow-[6px_6px_0px_#000] flex items-center justify-center gap-1.5 ${
              activeTab === "search" 
                ? "bg-[#00D1FF] text-black translate-y-[2px] shadow-[2px_2px_0px_#000]" 
                : "bg-white text-black hover:bg-neutral-50 hover:translate-y-[-1px] hover:shadow-[7px_7px_0px_#000]"
            }`}
          >
            🧠 AI & Experience
          </button>

          <button
            onClick={() => setActiveTab("radar")}
            className={`py-3 px-4 border-4 border-black text-xs md:text-sm font-black uppercase transition-all tracking-wider cursor-pointer shadow-[6px_6px_0px_#000] flex items-center justify-center gap-1.5 ${
              activeTab === "radar" 
                ? "bg-[#00FF00] text-black translate-y-[2px] shadow-[2px_2px_0px_#000]" 
                : "bg-white text-black hover:bg-neutral-50 hover:translate-y-[-1px] hover:shadow-[7px_7px_0px_#000]"
            }`}
          >
            🗺️ Radar & PlacePage
          </button>

          <button
            onClick={() => setActiveTab("creators")}
            className={`py-3 px-4 border-4 border-black text-xs md:text-sm font-black uppercase transition-all tracking-wider cursor-pointer shadow-[6px_6px_0px_#000] flex items-center justify-center gap-1.5 ${
              activeTab === "creators" 
                ? "bg-white text-black outline-none ring-4 ring-black translate-y-[2px] shadow-[2px_2px_0px_#000]" 
                : "bg-white text-black hover:bg-neutral-50 hover:translate-y-[-1px] hover:shadow-[7px_7px_0px_#000]"
            }`}
          >
            🎒 VibeList & Creators
          </button>
        </div>

        {/* Dynamic Vibe shift calibrator active bar notifications */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-4 border-black bg-[#00D1FF] p-4.5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-sans gap-4 select-none shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce leading-none">🧠</span>
            <div>
              <p className="text-xs font-mono font-black uppercase text-black leading-none tracking-wider">
                // SYSTEM_HUD STATUS: ACTIVE //
              </p>
              <p className="text-[11px] text-black font-extrabold mt-1.5 uppercase leading-relaxed">
                Reputation Tier: <span className={`font-black underline ${reputationState.text}`}>{reputationState.title} {reputationState.badge}</span> ● Score: <span className="font-black bg-black text-[#00FF00] px-1 py-0.5 font-mono">+{userAuraPoints} XP</span> points fr fr
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2.5 bg-black text-[#00FF00] hover:bg-neutral-900 text-xs font-black uppercase border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4 text-[#00FF00]" /> Post discovery
            </button>
            <button
              onClick={() => setVibeQuizToggled(!vibeQuizToggled)}
              className="px-4 py-2.5 bg-white text-black text-xs font-black uppercase border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer shrink-0"
            >
              {vibeQuizToggled ? "Retract Filter Guide" : "Filter guide"}
            </button>
          </div>
        </div>

        {/* Collapsible Onboarding Filter Quiz */}
        <AnimatePresence>
          {vibeQuizToggled && (
            <div className="w-full flex justify-center shrink-0">
              <OnboardingQuiz 
                onMatch={(filters) => {
                  setVibeFilter(filters.vibe);
                  setVibeFilterBudget(filters.budget);
                  setVibeQuizToggled(false);
                }} 
                onClose={() => setVibeQuizToggled(false)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* VIEW 1: DISCOVERY TIMELINE FEED */}
        {activeTab === "feed" && (
          <div className="flex flex-col gap-6">
            
            {/* ONLY LOCALS KNOW SINGLE PRODUCT PRINCIPLE CONTROL CHECKBOX */}
            <div className="border-4 border-black p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[6px_6px_0px_#000] select-none shrink-0 font-sans">
              <div className="flex items-center gap-3">
                <span className="text-3xl animate-pulse">🤫</span>
                <div className="flex flex-col text-left">
                  <h4 className="text-sm font-black uppercase text-black leading-none flex items-center gap-1.5">
                    "ONLY LOCALS KNOW" CONTROLS
                  </h4>
                  <p className="text-[10px] sm:text-xs text-neutral-500 font-extrabold uppercase mt-1">
                    Bypass standard commercial locations. Filter to highly gatekept, neighborhood gems!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOnlyLocalsKnowActive(!onlyLocalsKnowActive)}
                className={`py-2 px-3.5 border-4 border-black font-sans text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-2 shadow-[3px_3px_0px_#000] ${
                  onlyLocalsKnowActive 
                    ? "bg-[#FFF200] text-black" 
                    : "bg-white text-neutral-600"
                }`}
              >
                {onlyLocalsKnowActive ? "⭐️ ACTIVE: GATED MODE ON fr" : "☆ DEACTIVATED: SHOWING GLOBAL LISTS"}
              </button>
            </div>

            {/* Quick Category filters */}
            <div className="flex flex-col gap-2 select-none shrink-0">
              <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1 font-mono text-[10px]">
                <span className="font-extrabold uppercase">// CATEGORIES:</span>
                <span className="font-extrabold uppercase text-[#FF00FF]">Filter matching: {filteredSpots.length} gems</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["All", "Cafe", "Vinyl Bar", "Thrift Store", "Sunset Spot", "Bookstore"].map((cat) => {
                  const isCatActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 border-2 border-black text-[10px] md:text-xs font-black uppercase cursor-pointer transition-all ${
                        isCatActive 
                          ? "bg-[#FF00FF] text-white shadow-[2px_2px_0px_#000]" 
                          : "bg-white hover:bg-neutral-50 text-black"
                      }`}
                    >
                      {cat === "All" ? "🍵 All ({}) " : `${getEmojiForCategory(cat)} ${cat}`} ({getCategoryCount(cat)})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feed items stack */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
              {filteredSpots.map((spot) => {
                const isSaved = savedSpotIds.includes(spot.id);
                const creator = creatorsList.find(c => c.id === spot.creatorId) || creatorsList[0];
                const isCreatorFollowed = followedCreatorIds.includes(creator.id);

                return (
                  <div 
                    key={spot.id}
                    className="border-4 border-black bg-white shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col justify-between select-none"
                  >
                    
                    {/* Header: Creator Profile Metadata inside feed */}
                    <div className="p-3 border-b-4 border-black bg-neutral-50 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <img 
                          referrerPolicy="no-referrer"
                          src={creator.avatarUrl} 
                          alt={creator.name}
                          className="w-8 h-8 rounded-full border-2 border-black object-cover shrink-0" 
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <h4 className="text-xs font-black uppercase text-black leading-none truncate">{creator.name}</h4>
                            <BadgeCheck className="w-3.5 h-3.5 text-[#00D1FF] fill-none shrink-0" />
                          </div>
                          <p className="text-[9px] font-mono font-bold text-zinc-500 leading-none mt-1 truncate">
                            {creator.handle} ● Aura: +{creator.aura}
                          </p>
                        </div>
                      </div>

                      {/* Follow feedback triggers */}
                      <button
                        onClick={() => handleToggleFollow(creator.id)}
                        className={`py-1 px-2 border-2 border-black text-[9px] font-black uppercase cursor-pointer leading-none transition-all ${
                          isCreatorFollowed 
                            ? "bg-[#00FF00] text-black" 
                            : "bg-white hover:bg-[#FFF200] text-black"
                        }`}
                      >
                        {isCreatorFollowed ? "Following" : "+ Follow"}
                      </button>
                    </div>

                    {/* Spot Preview Area */}
                    <div className="relative h-48 bg-neutral-100 border-b-4 border-black overflow-hidden">
                      <img 
                        referrerPolicy="no-referrer"
                        src={spot.imageUrl} 
                        alt={spot.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                      />
                      
                      {/* Only locals know badge */}
                      {(spot.onlyLocalsKnow || spot.gatekept) ? (
                        <span className="absolute top-3 left-3 px-2 py-0.5 bg-[#FFF200] border-2 border-black text-black font-mono text-[9px] font-black uppercase rotate-[-2deg] shadow-sm select-none">
                          ⭐️ ONLY LOCALS KNOW
                        </span>
                      ) : (
                        <span className="absolute top-3 left-3 px-2 py-0.5 bg-black border border-white text-white font-mono text-[9px] font-black uppercase select-none">
                          🌱 LOCAL TIP
                        </span>
                      )}

                      <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-[#FF00FF] border border-black text-white text-[10px] font-black uppercase">
                        {spot.priceRange}
                      </span>
                    </div>

                    {/* Description Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3 text-left">
                      <div>
                        <div className="flex justify-between items-center bg-neutral-50 border border-black px-1.5 py-0.5 text-[9px] font-mono leading-none font-black text-[#FF00FF] uppercase mb-1.5 truncate">
                          <span>📍 {spot.neighborhood}, {spot.city}</span>
                          <span className="text-black">{spot.category}</span>
                        </div>
                        <h3 className="text-lg font-black uppercase text-black leading-tight truncate">{spot.name}</h3>
                        <p className="text-xs text-neutral-800 font-bold mt-1 uppercase line-clamp-3 leading-relaxed">
                          {spot.description}
                        </p>
                      </div>

                      {/* Display Creator Specialties & Badges */}
                      <div className="flex flex-wrap gap-1 border-t border-black/10 pt-2 shrink-0">
                        {creator.badges.map((badge, i) => (
                          <span key={i} className="text-[8px] font-mono font-black border border-black bg-neutral-150 px-1 py-0.5 uppercase">
                            👑 {badge}
                          </span>
                        ))}
                      </div>

                      {/* Active Actions */}
                      <div className="border-t-2 border-black pt-3 flex items-center gap-1.5 mt-1">
                        <button
                          onClick={() => {
                            setSelectedSpot(spot);
                            setActiveTab("radar");
                            increaseAuraPoints(40);
                          }}
                          className="flex-1 py-1.5 bg-black text-white hover:bg-neutral-800 border-2 border-black text-[10px] md:text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-1 cursor-pointer"
                        >
                          INSPECT PLACE <ArrowRight className="w-3.5 h-3.5 text-[#00FF00]" />
                        </button>

                        <button
                          onClick={() => handleToggleSave(spot.id)}
                          className={`p-1.5 border-2 border-black text-xs font-black shrink-0 cursor-pointer ${
                            isSaved ? "bg-[#00D1FF]" : "bg-white hover:bg-neutral-100"
                          }`}
                          title="Save to list"
                        >
                          🥐
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}

              {/* Vacant directory fallback */}
              {filteredSpots.length === 0 && (
                <div className="col-span-full border-4 border-dashed border-black p-12 bg-white text-center flex flex-col items-center justify-center">
                  <span className="text-4xl mb-2 select-none">🤫🏮</span>
                  <h3 className="text-base font-mono font-black text-black uppercase leading-none">
                    NO DRAFT SECRET GEMS fr
                  </h3>
                  <p className="text-xs text-neutral-600 mt-2 max-w-sm font-sans font-bold leading-relaxed uppercase">
                    Adjust city or category parameters to unlock some verified high aura neighborhood spots!
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 2: AI & EXPERIENCE SEARCH */}
        {activeTab === "search" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
            
            {/* Quick Experience Search prompts checklist: Left section */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="border-4 border-black bg-white p-4 sm:p-5 shadow-[6px_6px_0px_#000] flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 border-b-2 border-black pb-1.5 select-none text-left">
                  <SlidersHorizontal className="w-4 h-4 text-[#FF00FF]" />
                  <span className="font-mono text-[10px] font-black uppercase">// EXPERIENCE SEARCH //</span>
                </div>
                <h3 className="text-base font-black uppercase text-black leading-none text-left my-1 select-none">
                  SEARCH DESIRED EMOTIONS
                </h3>
                <p className="text-[11px] font-bold text-zinc-500 uppercase leading-relaxed text-left pb-2">
                  Avoid dry tags. Pick preset authentic mood alignments to query immediately:
                </p>

                {/* Mood Alignment fast queries */}
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { title: "Quiet coffee shops to read/code", icon: "🍵", query: "matcha quiet" },
                    { title: "Scenic sunset places with zero tourists", icon: "🌅", query: "cliff sunset" },
                    { title: "Secret analogue rooms playing fine vinyls", icon: "💿", query: "listening sanctuary vinyl" },
                    { title: "Deep space dates layout", icon: "💖", query: "aesthetic date night" },
                    { title: "Low key affordable thrifting hacks", icon: "👗", query: "thrift pricing" },
                    { title: "Spots that feel like a cinema movie", icon: "🎬", query: "jungle typewriter vintage" }
                  ].map((mo, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchQuery(mo.query);
                        increaseAuraPoints(20);
                      }}
                      className="p-2 border-2 border-black bg-[#FFF200]/10 hover:bg-[#FFF200]/410 transition-all text-[11px] font-black uppercase text-left flex items-center justify-between rounded-none cursor-pointer w-full"
                    >
                      <span>{mo.icon} {mo.title}</span>
                      <ArrowRight className="w-3 h-3 text-[#FF00FF]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Advisor grounded component: Right section */}
            <div className="lg:col-span-8">
              <VibeAIAdvisor 
                spots={spotsList}
                currentCity={cityContext}
              />
            </div>

            {/* Compiled Dynamic Query Search list section */}
            <div className="lg:col-span-12 flex flex-col gap-3">
              <div className="border-4 border-black shadow-[6px_6px_0px_#000] relative overflow-hidden shrink-0">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none select-none">
                  <Search className="w-4.5 h-4.5 text-black" />
                </div>
                <input 
                  type="text"
                  placeholder="Type any customized keyword (e.g., matcha, Bandra, vintage, lo-fi beats, rain)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-white text-xs font-sans font-black text-black focus:outline-none focus:ring-0 leading-none placeholder:text-neutral-500 uppercase tracking-wide border-0"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-3 flex items-center text-xs font-mono font-black text-black hover:text-[#FF00FF] uppercase cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
              </div>

              {/* Spot Grid representing directory search filter results */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                {filteredSpots.map((spot) => (
                  <div 
                    key={spot.id}
                    onClick={() => {
                      setSelectedSpot(spot);
                      setActiveTab("radar");
                    }}
                    className={`border-4 border-black p-3.5 bg-white shadow-[4px_4px_0px_#000] hover:translate-y-[-1px] transition-all cursor-pointer select-none text-left flex items-center gap-3.5`}
                  >
                    <div className="w-12 h-12 rounded-none border-2 border-black overflow-hidden bg-zinc-200 shrink-0">
                      <img referrerPolicy="no-referrer" src={spot.imageUrl} alt={spot.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase text-black leading-tight truncate">{spot.name}</p>
                      <p className="text-[10px] font-mono font-bold text-zinc-500 leading-none uppercase mt-1">
                        {spot.neighborhood} ● {getEmojiForCategory(spot.category)} {spot.category}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1 shrink-0">
                        {spot.vibes.slice(0, 2).map((v, i) => (
                          <span key={i} className="text-[8px] font-mono bg-neutral-100 px-1 py-0.5 border border-black uppercase">
                            #{v.replace(" ", "")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* VIEW 3: RADAR MAP & DETAILED PLACE PAGES */}
        {activeTab === "radar" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
            
            {/* Interactive Location Vector Map */}
            <div className="lg:col-span-6 xl:col-span-6 h-full flex flex-col justify-between">
              <VibeMap 
                spots={filteredSpots} 
                selectedSpot={selectedSpot} 
                onSelectSpot={(spot) => {
                  setSelectedSpot(spot);
                  increaseAuraPoints(30);
                }}
                cityContext={cityContext}
              />

              {/* Dynamic local guide routes lists row */}
              <div className="border-4 border-black bg-white p-3.5 shadow-[6px_6px_0px_#000] mt-4 flex flex-col gap-2 relative">
                <span className="font-mono text-[9px] font-black uppercase bg-black text-[#00FF00] px-2 py-0.5 border border-black self-start">
                  // VERIFIED CREATOR GUIDES //
                </span>
                <p className="text-[11px] text-zinc-600 font-extrabold uppercase text-left">
                  Sequenced walking walks compiled by experts:
                </p>
                <div className="grid grid-cols-1 gap-2 mt-1">
                  {GUIDES.map((guide) => {
                    const isGuideActive = activeGuideId === guide.id;
                    return (
                      <button
                        key={guide.id}
                        onClick={() => {
                          setActiveGuideId(isGuideActive ? null : guide.id);
                          if (guide.spots.length > 0) {
                            const match = spotsList.find(s => s.id === guide.spots[0]);
                            if (match) setSelectedSpot(match);
                          }
                          increaseAuraPoints(150);
                        }}
                        className={`p-2.5 border-2 border-black text-left font-sans text-xs font-black uppercase cursor-pointer flex items-center justify-between rounded-none transition-all ${
                          isGuideActive ? "bg-[#FFF200]" : "bg-neutral-50 hover:bg-neutral-100"
                        }`}
                      >
                        <div>
                          <p className="font-black leading-none">{guide.title}</p>
                          <p className="text-[9px] font-mono text-zinc-500 font-normal mt-1 lowercase leading-none">by trusted local ● duration: {guide.duration}</p>
                        </div>
                        <span className="text-[10px] bg-black text-[#00FF00] font-mono font-black border border-black px-1.5 py-0.5 shrink-0 scale-90">
                          {isGuideActive ? "★ ACTIVE" : "⚡ LAUNCH"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Persistent Spot Detail Place Page */}
            <div className="lg:col-span-6 xl:col-span-6 h-full flex flex-col justify-between">
              {selectedSpot ? (
                <SpotDetailDrawer 
                  spot={selectedSpot} 
                  onClose={() => setSelectedSpot(null)}
                  isSaved={savedSpotIds.includes(selectedSpot.id)}
                  onToggleSave={() => handleToggleSave(selectedSpot.id)}
                  liveTips={liveTips}
                  onSubmitTip={handleSubmitTip}
                  allSpots={spotsList}
                  onSelectSpotById={(id) => {
                    const match = spotsList.find(s => s.id === id);
                    if (match) setSelectedSpot(match);
                  }}
                  onIncreaseUserAura={increaseAuraPoints}
                />
              ) : (
                <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center flex flex-col items-center justify-center min-h-[460px] font-sans">
                  <Compass className="w-12 h-12 text-[#FF00FF] animate-pulse mb-3" />
                  <h3 className="text-lg font-black text-black uppercase select-none leading-none">// SELECT SPOT SPOT ON MAP //</h3>
                  <p className="text-xs font-bold uppercase text-neutral-500 mt-2 max-w-[280px]">
                    Tap any node pin marker on the radar above or switch city context contexts to inspect full Place details with tourist warnings fr fr!
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 4: CREATOR REGISTRY & VIBELISTS */}
        {activeTab === "creators" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
            
            {/* LEFT SIDE: CREATORS DIRECTORY REGISTRY */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="border-4 border-black bg-white p-4 sm:p-5 shadow-[8px_8px_0px_#000] flex flex-col gap-1.5 text-left">
                <div className="flex items-center gap-1.5 border-b-2 border-black pb-1.5 select-none text-left">
                  <Trophy className="w-5 h-5 text-[#FFF200]" />
                  <span className="font-mono text-[10px] font-black uppercase">// TRUSTED LOCAL VOICES //</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-black leading-none select-none my-1">
                  CREATOR REGISTRY
                </h3>
                <p className="text-xs text-zinc-500 font-extrabold uppercase leading-normal pb-4 mb-1">
                  Discover discoveries through certified people, not sponsored booking engines:
                </p>

                {/* Creators profile row loops */}
                <div className="space-y-4">
                  {creatorsList.map((creator) => {
                    const isFollowed = followedCreatorIds.includes(creator.id);
                    return (
                      <div 
                        key={creator.id} 
                        className="p-3 border-4 border-black bg-neutral-50 shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative select-none rounded-none"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img 
                            referrerPolicy="no-referrer"
                            src={creator.avatarUrl} 
                            alt={creator.name}
                            className="w-14 h-14 rounded-full border-4 border-black object-cover shrink-0" 
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-base font-black uppercase text-black truncate leading-none">{creator.name}</h4>
                              <span className="text-[9px] font-mono bg-black text-[#00FF00] border border-black font-black px-1 py-0.5 leading-none shrink-0">
                                Aura: +{creator.aura}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-[#FF00FF] font-bold uppercase tracking-wide leading-none mt-1 truncate">{creator.handle}</p>
                            <p className="text-xs font-sans text-neutral-800 font-bold lowercase leading-tight mt-1.5">{creator.bio}</p>
                            
                            {/* Badges list */}
                            <div className="flex flex-wrap gap-1.5 mt-2 shrink-0">
                              {creator.badges.map((b, i) => (
                                <span key={i} className="text-[8px] font-mono bg-white border border-black font-extrabold uppercase px-1 leading-none shadow-[1.5px_1.5px_0px_#000]">
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end gap-2 shrink-0 border-t sm:border-0 border-black/15 pt-2 sm:pt-0">
                          <div className="hidden sm:block text-right">
                            <span className="text-xs font-mono text-zinc-500 font-black leading-none block uppercase">Followers</span>
                            <span className="text-base font-mono font-black text-black leading-none">{creator.followers.toLocaleString()}</span>
                          </div>
                          
                          <button
                            onClick={() => handleToggleFollow(creator.id)}
                            className={`py-2 px-3.5 border-2 border-black font-sans text-xs font-black uppercase transition-all cursor-pointer shadow-[2px_2px_0px_#000] active:translate-y-[1.5px] ${
                              isFollowed 
                                ? "bg-[#00FF00] text-black" 
                                : "bg-white text-black hover:bg-neutral-50"
                            }`}
                          >
                            {isFollowed ? "✓ Following" : "+ Follow"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* RIGHT SIDE: CUSTOM LISTS & USER DIRECTORY MANAGERS */}
            <div className="lg:col-span-5 flex flex-col gap-4 text-left">
              
              {/* Profile Card Summary */}
              <div className="border-4 border-black bg-black text-white p-4.5 shadow-[8px_8px_0px_#FFF200]">
                <div className="flex items-center gap-3 select-none">
                  <div className="w-12 h-12 bg-[#FF00FF] border-2 border-white rounded-full flex items-center justify-center font-black text-xl">
                    👑
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono text-[#00FF00] font-black uppercase leading-none">// LOGGED IN BESTIE PROFILE //</p>
                    <p className="text-lg font-black uppercase tracking-tight text-white mt-1 leading-none">
                      {user ? user.email?.split("@")[0] : "Local Guest Voyager"}
                    </p>
                    <p className="text-xs font-mono text-zinc-350 font-bold uppercase mt-1">
                      Class Level: <span className="text-[#00FF00] font-black underline">{reputationState.title}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t-2 border-dashed border-zinc-750 pt-3 flex justify-between items-center text-xs font-mono font-black uppercase text-[#00D1FF]">
                  <span>Total Aura XP:</span>
                  <span className="bg-white text-black border-2 border-black px-2 py-0.5">+{userAuraPoints} XP</span>
                </div>
              </div>

              {/* customized folder structures list creator list */}
              <div className="border-4 border-black bg-white p-4 sm:p-5 shadow-[8px_8px_0px_#000] flex flex-col gap-3">
                <div className="flex items-center gap-1.5 border-b-2 border-black pb-1.5 select-none">
                  <BookMarked className="w-5 h-5 text-[#00D1FF]" />
                  <span className="font-mono text-[10px] font-black uppercase">// MANAGE VIBELISTS //</span>
                </div>
                <h3 className="text-xl font-black uppercase text-black leading-none">
                  DYNAMIC FOLDERS
                </h3>
                <p className="text-xs text-zinc-500 font-extrabold uppercase">
                  Sort discoveries inside custom designated bucket checklists (Weekend plans, Food goals):
                </p>

                {/* Create folder form */}
                <form onSubmit={handleCreateCustomList} className="flex gap-1.5 border-t-2 border-dashed border-black pt-3">
                  <select
                    value={newListEmoji}
                    onChange={(e) => setNewListEmoji(e.target.value)}
                    className="px-2 border-2 border-black font-sans text-xs font-bold leading-none bg-white text-black shrink-0 cursor-pointer"
                  >
                    <option value="🎒">🎒</option>
                    <option value="📅">📅</option>
                    <option value="🥞">🥞</option>
                    <option value="💖">💖</option>
                    <option value="🧗">🧗</option>
                    <option value="💸">💸</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="New list name (e.g. Vintage finds)..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="flex-1 px-3 py-2 border-2 border-black font-sans text-xs font-bold focus:outline-none bg-white text-black text-transform-uppercase"
                  />
                  <button 
                    type="submit"
                    className="py-2 px-3 bg-black text-[#00FF00] font-mono text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer hover:bg-neutral-900"
                  >
                    Create
                  </button>
                </form>

                {/* Folder selectors block */}
                <div className="space-y-2.5 mt-2">
                  {saveLists.map((list) => {
                    const isListActive = selectedListId === list.id;
                    return (
                      <div key={list.id} className="border-2 border-black p-2 bg-neutral-50 flex flex-col gap-1.5">
                        <div 
                          onClick={() => setSelectedListId(isListActive ? "" : list.id)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-base select-none leading-none">{list.emoji}</span>
                            <span className="text-xs font-black uppercase text-black tracking-wide">{list.name}</span>
                          </div>
                          <span className="text-[10px] font-mono bg-black text-white px-2 py-0.5 font-bold shrink-0">
                            {list.spotIds.length} spots
                          </span>
                        </div>

                        {/* List spots expander */}
                        {isListActive && (
                          <div className="pl-3 border-l-2 border-[#FF00FF] space-y-1 mt-1 pr-1">
                            {list.spotIds.length === 0 ? (
                              <p className="text-[9px] text-zinc-400 font-bold uppercase italic font-mono">No spots compiled here yet. Save items from the feed to fill fr fr!</p>
                            ) : (
                              list.spotIds.map((id) => {
                                const found = spotsList.find(s => s.id === id);
                                if (!found) return null;
                                return (
                                  <div key={id} className="flex items-center justify-between bg-white border border-black p-1 text-[10px] uppercase font-mono">
                                    <span className="truncate max-w-[150px] font-black">{found.name}</span>
                                    <div className="flex gap-1 shrink-0 scale-90">
                                      <button 
                                        onClick={() => {
                                          setSelectedSpot(found);
                                          setActiveTab("radar");
                                        }}
                                        className="text-[#00D1FF] font-black hover:underline px-1 uppercase"
                                      >
                                        Inspect
                                      </button>
                                      <button 
                                        onClick={() => handleAddSpotToCustomList(list.id, found.id)}
                                        className="text-red-500 font-black hover:underline px-1 uppercase"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* RENDER COMPILABLE STATE MODAL DETECTS SHARE A DISCOVERY */}
      {addModalOpen && (
        <AddDiscoveryModal 
          onClose={() => setAddModalOpen(false)}
          onAdd={handleAddUserSpot}
          currentUser={user}
        />
      )}

    </div>
  );
}
