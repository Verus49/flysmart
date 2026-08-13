export interface PersonalizationProfile {
  favoriteAirlines: string[];
  preferredAirports: string[];
  maxBudgetUSD: number;
  cabinClass: "Economy" | "Premium Economy" | "Business" | "First";
  travelFrequency: "leisure" | "regular" | "road_warrior";
  destinationInterests: string[]; // "Beach", "Cultural", "Adventure", "Ski", "Culinary"
  weatherPreference: "Warm" | "Cold" | "Mild" | "Any";
  persona: "Solo" | "Business" | "Family" | "Couple";
  behaviorScores: {
    businessWeight: number; // 0-100
    leisureWeight: number;  // 0-100
    budgetSensitivity: number; // 0-100
    premiumAffinity: number; // 0-100
  };
}

export interface RecommendableItem {
  id: string;
  title: string;
  category: "flight" | "destination" | "hotel_package";
  carrier: string;
  origin: string;
  destination: string;
  priceUSD: number;
  cabinClass: "Economy" | "Premium Economy" | "Business" | "First";
  tags: string[]; // e.g. ["Beach", "Family", "Premium", "Business", "Culinary", "Warm"]
  weatherType: "Warm" | "Cold" | "Mild";
  description: string;
}

export interface BehavioralEvent {
  id: string;
  eventName: string;
  actionSource: "Search Bar" | "Flight Click" | "Newsletter Opt-in" | "Filter Toggle";
  description: string;
  impact: string;
}

export const INITIAL_PROFILE: PersonalizationProfile = {
  favoriteAirlines: ["Delta Air Lines", "Singapore Airlines"],
  preferredAirports: ["JFK", "SFO"],
  maxBudgetUSD: 1500,
  cabinClass: "Premium Economy",
  travelFrequency: "regular",
  destinationInterests: ["Beach", "Culinary"],
  weatherPreference: "Warm",
  persona: "Couple",
  behaviorScores: {
    businessWeight: 20,
    leisureWeight: 80,
    budgetSensitivity: 50,
    premiumAffinity: 60
  }
};

export const RECOMMENDABLE_ITEMS: RecommendableItem[] = [
  {
    id: "rec-001",
    title: "Exclusive Maldives Overwater Escape",
    category: "hotel_package",
    carrier: "Singapore Airlines",
    origin: "SIN",
    destination: "MLE",
    priceUSD: 2450,
    cabinClass: "Business",
    tags: ["Beach", "Warm", "Premium", "Couple", "Culinary"],
    weatherType: "Warm",
    description: "Ultra-luxury private villas, fine dining under the sea, and couples spa packages. Powered by high-comfort airlines partnerships."
  },
  {
    id: "rec-002",
    title: "Fast-Track Business Shuttle to London",
    category: "flight",
    carrier: "Delta Air Lines",
    origin: "JFK",
    destination: "LHR",
    priceUSD: 950,
    cabinClass: "Premium Economy",
    tags: ["Business", "Solo", "Mild", "FastTrack"],
    weatherType: "Mild",
    description: "Daily evening departures with onboard Wi-Fi, lie-flat lounges access, and expedited corporate immigration clearing."
  },
  {
    id: "rec-003",
    title: "Family Ski Adventures in Aspen",
    category: "hotel_package",
    carrier: "Delta Air Lines",
    origin: "LGA",
    destination: "ASE",
    priceUSD: 850,
    cabinClass: "Economy",
    tags: ["Family", "Ski", "Cold", "Adventure"],
    weatherType: "Cold",
    description: "Slopeside family cabins with children ski instructors, gear rental credits, and warm fireside hot-chocolate circles."
  },
  {
    id: "rec-004",
    title: "First-Class Tokyo Cultural Culinary Tour",
    category: "hotel_package",
    carrier: "Singapore Airlines",
    origin: "LAX",
    destination: "NRT",
    priceUSD: 6500,
    cabinClass: "First",
    tags: ["Cultural", "Premium", "Culinary", "Mild"],
    weatherType: "Mild",
    description: "Michelin-starred private kitchen bookings, traditional tea-ceremonies, and premier first-class suite travel."
  },
  {
    id: "rec-005",
    title: "Budget Beach Exploration in Cancun",
    category: "flight",
    carrier: "Frontier Airlines",
    origin: "MCO",
    destination: "CUN",
    priceUSD: 120,
    cabinClass: "Economy",
    tags: ["Beach", "Warm", "Solo", "Budget"],
    weatherType: "Warm",
    description: "Unbeatable low fares to pristine tropical sandbars. Best fit for spontaneous leisure weekenders."
  },
  {
    id: "rec-006",
    title: "Chateaux & Historic Castles of France",
    category: "hotel_package",
    carrier: "Air France",
    origin: "JFK",
    destination: "CDG",
    priceUSD: 1600,
    cabinClass: "Premium Economy",
    tags: ["Cultural", "Couple", "Mild", "Culinary"],
    weatherType: "Mild",
    description: "Boutique countryside manor stays, guided royal garden tours, and regional wine-tasting excursions."
  }
];

export const BEHAVIORAL_EVENTS_CATALOG: BehavioralEvent[] = [
  {
    id: "event-first-class",
    eventName: "Viewed Singapore First Class Suites",
    actionSource: "Flight Click",
    description: "User browsed high-end first-class tickets for over 5 minutes without exiting.",
    impact: "+35 Premium Affinity, Cabin Class set to First"
  },
  {
    id: "event-budget-sort",
    eventName: "Applied 'Sort by Lowest Price' Filter",
    actionSource: "Filter Toggle",
    description: "User specifically locked search responses strictly in order of ascending cost.",
    impact: "+40 Budget Sensitivity, -20 Premium Affinity, Max Budget capped at $400"
  },
  {
    id: "event-family-search",
    eventName: "Searched with 2 Adult, 2 Child Passengers",
    actionSource: "Search Bar",
    description: "The user entered multi-passenger attributes reflecting family travel profiles.",
    impact: "Persona set to Family, Leisure Weight increased to 95%"
  },
  {
    id: "event-business-wifi",
    eventName: "Checked Onboard Corporate High-Speed Wi-Fi Filter",
    actionSource: "Filter Toggle",
    description: "Selected filters filtering for power outlets, reliable workspace, and fast satellite linkups.",
    impact: "+45 Business Weight, Persona set to Business"
  },
  {
    id: "event-cold-aspen",
    eventName: "Clicked 'Winter Cozy Getaways' Banner",
    actionSource: "Newsletter Opt-in",
    description: "Clicked an email promotion highlighting snow lodges, ski lifts, and alpine environments.",
    impact: "Weather Preference set to Cold, Interest added: Ski"
  }
];
