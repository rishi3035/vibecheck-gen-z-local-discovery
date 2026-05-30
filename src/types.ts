/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  specialty: string;
  vibeTitle: string; // e.g., "Matcha Connoisseur", "Vintage Sleuth"
  followers: number;
  aura: number; // Aura reputation points
  discoveriesCount: number;
  badges: string[];
  topPlacesShared: string[];
}

export interface HardcodedStats {
  rating: number; // overall vibe score (out of 10)
  matchaScore?: string; // "10/10" or "Mid"
  wifiClass: string; // e.g., "Lightning Fast", "Wfh-Ready", "Zero Signal"
  goldenHour: string; // e.g., "5:30 PM", "All Day Glow"
  noiseLevel: string; // e.g., "Whisper Mode Only", "Bass Boosted"
}

export interface Spot {
  id: string;
  name: string;
  city: "Bangalore" | "Mumbai" | "Delhi" | "Goa";
  neighborhood: string;
  category: "Cafe" | "Vinyl Bar" | "Thrift Store" | "Sunset Spot" | "Bookstore";
  vibes: string[]; // e.g., ["Aesthetic AF", "Main Character Energy", "Quiet Slay"]
  priceRange: "Broke Bestie" | "Comfy Enough" | "Treat Yourself" | "Trust Fund Baby";
  address: string;
  coords: { lat: number; lng: number };
  imageUrl: string;
  description: string;
  whyGo: string;
  bestTime: string;
  whatToOrder: string;
  stats: HardcodedStats;
  creatorId: string;
  gatekept: boolean; // whether it's super secret
  votesHype: number;
  votesMid: number;
  onlyLocalsKnow?: boolean; // Is it hidden from general tourists?
  touristTrapWarning?: string; // Warnings compiled by creators
  nearbyDiscoveries?: string[]; // IDs of other spots with high aura nearby
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  creatorId: string;
  spots: string[]; // Spot IDs
  duration: string; // e.g., "One Afternoon"
  totalCostBudget: string; // e.g., "Low Key Slay" or "Boujee Weekend"
  tags: string[];
}

export interface SavedList {
  id: string;
  name: string;
  spotIds: string[];
  emoji: string;
}

export interface LiveTip {
  id: string;
  spotId?: string;
  user: string;
  handle: string;
  text: string;
  isVerified: boolean;
  timestamp: string;
  isHype: boolean;
}
