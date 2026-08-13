import React, { useState, useEffect, useMemo } from "react";
import { 
  PersonalizationProfile, 
  RecommendableItem, 
  BehavioralEvent, 
  INITIAL_PROFILE, 
  RECOMMENDABLE_ITEMS, 
  BEHAVIORAL_EVENTS_CATALOG 
} from "../data/personalizationDocs";
import { 
  User, 
  Shuffle, 
  Sliders, 
  Mail, 
  Search, 
  Heart, 
  Shield, 
  Coins, 
  Compass, 
  Sun, 
  Briefcase, 
  Users, 
  CheckSquare, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle,
  Send,
  RefreshCw,
  Database,
  Lock,
  Layers,
  Inbox,
  ArrowRight,
  Plane,
  FileText
} from "lucide-react";

export default function PersonalizationExplorer() {
  // Personalization States
  const [profile, setProfile] = useState<PersonalizationProfile>(() => {
    // Deep clone the initial profile
    return JSON.parse(JSON.stringify(INITIAL_PROFILE));
  });

  const [activeTab, setActiveTab] = useState<"recommendations" | "search" | "newsletter">("recommendations");
  const [lastTriggeredEvent, setLastTriggeredEvent] = useState<string | null>(null);
  const [showColdStartForm, setShowColdStartForm] = useState<boolean>(false);

  // Platform logs console
  const [platformLogs, setPlatformLogs] = useState<string[]>([
    "[INIT] Personalization engine core online. Embedding tensor metrics.",
    "[COLLABORATIVE] Pre-computed user-item matrix factorization vectors synced from Spark.",
    "[PRIVACY] Local differential privacy (LDP) active. User profile state strictly client-held."
  ]);

  const addLog = (msg: string) => {
    const ts = new Date().toISOString().split("T")[1].substring(0, 8);
    setPlatformLogs(prev => [`[${ts}] ${msg}`, ...prev.slice(0, 19)]);
  };

  // Behavioral Template Profiles for quick selection
  const handleSelectTemplate = (type: "luxury" | "budget" | "business" | "family") => {
    addLog(`[PROFILE] Injected template profile for '${type}' traveler.`);
    if (type === "luxury") {
      setProfile({
        favoriteAirlines: ["Singapore Airlines", "Emirates"],
        preferredAirports: ["JFK", "SIN"],
        maxBudgetUSD: 8000,
        cabinClass: "First",
        travelFrequency: "road_warrior",
        destinationInterests: ["Culinary", "Cultural"],
        weatherPreference: "Mild",
        persona: "Solo",
        behaviorScores: {
          businessWeight: 30,
          leisureWeight: 70,
          budgetSensitivity: 10,
          premiumAffinity: 95
        }
      });
    } else if (type === "budget") {
      setProfile({
        favoriteAirlines: ["Frontier Airlines", "Spirit Airlines"],
        preferredAirports: ["MCO", "OAK"],
        maxBudgetUSD: 300,
        cabinClass: "Economy",
        travelFrequency: "leisure",
        destinationInterests: ["Beach", "Adventure"],
        weatherPreference: "Warm",
        persona: "Solo",
        behaviorScores: {
          businessWeight: 0,
          leisureWeight: 100,
          budgetSensitivity: 95,
          premiumAffinity: 5
        }
      });
    } else if (type === "business") {
      setProfile({
        favoriteAirlines: ["Delta Air Lines", "United Airlines"],
        preferredAirports: ["LHR", "JFK"],
        maxBudgetUSD: 3500,
        cabinClass: "Business",
        travelFrequency: "road_warrior",
        destinationInterests: ["Culinary"],
        weatherPreference: "Any",
        persona: "Business",
        behaviorScores: {
          businessWeight: 90,
          leisureWeight: 10,
          budgetSensitivity: 25,
          premiumAffinity: 80
        }
      });
    } else if (type === "family") {
      setProfile({
        favoriteAirlines: ["Delta Air Lines", "JetBlue"],
        preferredAirports: ["LGA", "MCO"],
        maxBudgetUSD: 1200,
        cabinClass: "Economy",
        travelFrequency: "leisure",
        destinationInterests: ["Beach", "Ski"],
        weatherPreference: "Warm",
        persona: "Family",
        behaviorScores: {
          businessWeight: 5,
          leisureWeight: 95,
          budgetSensitivity: 75,
          premiumAffinity: 30
        }
      });
    }
  };

  // Trigger behavior actions simulation
  const handleTriggerEvent = (evt: BehavioralEvent) => {
    setLastTriggeredEvent(evt.eventName);
    addLog(`[BEHAVIOR-TRACKER] Captured stream event: "${evt.eventName}" from ${evt.actionSource}.`);

    // Mutate state with behavioral impacts
    setProfile(prev => {
      const cloned = { ...prev };
      
      if (evt.id === "event-first-class") {
        cloned.cabinClass = "First";
        cloned.behaviorScores.premiumAffinity = Math.min(100, cloned.behaviorScores.premiumAffinity + 35);
        cloned.behaviorScores.budgetSensitivity = Math.max(0, cloned.behaviorScores.budgetSensitivity - 25);
      } else if (evt.id === "event-budget-sort") {
        cloned.behaviorScores.budgetSensitivity = Math.min(100, cloned.behaviorScores.budgetSensitivity + 40);
        cloned.behaviorScores.premiumAffinity = Math.max(0, cloned.behaviorScores.premiumAffinity - 20);
        cloned.maxBudgetUSD = Math.min(cloned.maxBudgetUSD, 400);
        cloned.cabinClass = "Economy";
      } else if (evt.id === "event-family-search") {
        cloned.persona = "Family";
        cloned.behaviorScores.leisureWeight = 95;
        cloned.behaviorScores.businessWeight = 5;
        if (!cloned.destinationInterests.includes("Beach")) {
          cloned.destinationInterests = [...cloned.destinationInterests, "Beach"];
        }
      } else if (evt.id === "event-business-wifi") {
        cloned.persona = "Business";
        cloned.behaviorScores.businessWeight = 90;
        cloned.behaviorScores.leisureWeight = 10;
        cloned.cabinClass = "Business";
      } else if (evt.id === "event-cold-aspen") {
        cloned.weatherPreference = "Cold";
        if (!cloned.destinationInterests.includes("Ski")) {
          cloned.destinationInterests = [...cloned.destinationInterests, "Ski"];
        }
      }

      return cloned;
    });

    setTimeout(() => {
      setLastTriggeredEvent(null);
    }, 2000);
  };

  // Toggle dynamic interests list
  const toggleInterest = (interest: string) => {
    setProfile(prev => {
      const current = prev.destinationInterests;
      const updated = current.includes(interest)
        ? current.filter(i => i !== interest)
        : [...current, interest];
      addLog(`[PROFILE] Destination interest altered: [${updated.join(", ")}]`);
      return { ...prev, destinationInterests: updated };
    });
  };

  // Live personalization score calculation for Recommendable Items
  const scoredItems = useMemo(() => {
    return RECOMMENDABLE_ITEMS.map((item) => {
      let score = 50; // base score
      const reasons: string[] = [];

      // 1. Cabin Class Match Check
      if (item.cabinClass === profile.cabinClass) {
        score += 25;
        reasons.push(`Perfect Cabin Class Match (${profile.cabinClass})`);
      } else if (
        (profile.cabinClass === "First" && item.cabinClass === "Business") ||
        (profile.cabinClass === "Business" && item.cabinClass === "Premium Economy")
      ) {
        score += 15;
        reasons.push(`Acceptable alternative cabin level (${item.cabinClass})`);
      } else {
        score -= 10;
      }

      // 2. Favorite Airlines Check
      const isFavAirline = profile.favoriteAirlines.some(fav => fav.toLowerCase().includes(item.carrier.toLowerCase()) || item.carrier.toLowerCase().includes(fav.toLowerCase()));
      if (isFavAirline) {
        score += 20;
        reasons.push(`Serviced by designated Favorite Airline (${item.carrier})`);
      }

      // 3. Destination Interests Intersection Match
      const matchingInterests = item.tags.filter(tag => profile.destinationInterests.includes(tag));
      if (matchingInterests.length > 0) {
        score += matchingInterests.length * 15;
        reasons.push(`Interest overlap in: ${matchingInterests.join(", ")}`);
      }

      // 4. Budget Compatibility
      if (item.priceUSD <= profile.maxBudgetUSD) {
        score += 15;
        // Boost score if budget sensitivity is high and price is exceptionally low
        if (profile.behaviorScores.budgetSensitivity > 70) {
          score += 15;
          reasons.push(`Highly matches Budget-sensitive behavior`);
        }
      } else {
        const excess = item.priceUSD - profile.maxBudgetUSD;
        const budgetPenalty = Math.min(60, Math.round(excess / 20));
        score -= budgetPenalty;
        reasons.push(`Exceeds maximum specified budget limit (-${budgetPenalty}pts)`);
      }

      // 5. Travel Persona tag alignment
      const personaMap: { [key: string]: string } = {
        Solo: "Solo",
        Business: "Business",
        Family: "Family",
        Couple: "Couple"
      };
      const personaTag = personaMap[profile.persona];
      if (personaTag && item.tags.includes(personaTag)) {
        score += 20;
        reasons.push(`Tailored layout for travelers with ${profile.persona} persona`);
      }

      // 6. Weather Preference Alignment
      if (profile.weatherPreference !== "Any") {
        if (item.weatherType === profile.weatherPreference) {
          score += 15;
          reasons.push(`Matches weather preference of ${profile.weatherPreference}`);
        } else {
          score -= 10;
        }
      }

      // Premium Affinity adjustments
      if (profile.behaviorScores.premiumAffinity > 75 && (item.cabinClass === "First" || item.cabinClass === "Business")) {
        score += 15;
        reasons.push(`Premium Affinity model weights applied`);
      }

      // Clamp score between 5 and 99
      const finalScore = Math.max(5, Math.min(99, score));

      return {
        ...item,
        score: finalScore,
        reasons
      };
    }).sort((a, b) => b.score - a.score);
  }, [profile]);

  // Cold start trigger simulator
  const handleResetColdStart = () => {
    setShowColdStartForm(true);
    addLog("[COLD-START] Active traveler questionnaire opened. Initializing profiling pipeline...");
  };

  const submitColdStart = (surveyAnswers: any) => {
    setProfile({
      favoriteAirlines: ["Singapore Airlines"],
      preferredAirports: ["SFO"],
      maxBudgetUSD: surveyAnswers.budget,
      cabinClass: surveyAnswers.cabin,
      travelFrequency: surveyAnswers.freq,
      destinationInterests: surveyAnswers.interests,
      weatherPreference: surveyAnswers.weather,
      persona: surveyAnswers.persona,
      behaviorScores: {
        businessWeight: surveyAnswers.persona === "Business" ? 85 : 10,
        leisureWeight: surveyAnswers.persona !== "Business" ? 90 : 15,
        budgetSensitivity: surveyAnswers.cabin === "Economy" ? 80 : 30,
        premiumAffinity: surveyAnswers.cabin === "First" || surveyAnswers.cabin === "Business" ? 90 : 35
      }
    });
    setShowColdStartForm(false);
    addLog("[COLD-START] Questionnaire processed successfully. Multi-collaborative matrices updated!");
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="personalization-root">
      
      {/* Top Header Overview Banner */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-mono font-black uppercase max-w-max">
            Behavioral Personalization Subsystem
          </div>
          <h2 className="text-lg font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            Adaptive Traveler Personalization & Ranking Platform
          </h2>
          <p className="text-xs text-slate-400">
            A real-time behavioral personalization workspace. Customize profiles, trigger streaming click-events to dynamically recalculate travel affinity weights, preview customized email newsletter constructs, and watch search results re-rank using collaborative filters.
          </p>
        </div>

        {/* Dynamic State Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-slate-950/85 border border-slate-900 px-3 py-2.5 rounded-xl text-center min-w-[100px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">User Segment</span>
            <span className="text-xs font-black text-indigo-450 font-mono capitalize">{profile.persona} Travel</span>
          </div>
          <div className="bg-slate-950/85 border border-slate-900 px-3 py-2.5 rounded-xl text-center min-w-[100px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Fav Carrier</span>
            <span className="text-xs font-black text-emerald-450 font-mono truncate max-w-[90px] inline-block">
              {profile.favoriteAirlines[0] || "None"}
            </span>
          </div>
          <div className="bg-slate-950/85 border border-slate-900 px-3 py-2.5 rounded-xl text-center min-w-[100px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Affinity Latency</span>
            <span className="text-xs font-black text-sky-400 font-mono">1.2ms</span>
          </div>
          <div className="bg-slate-950/85 border border-slate-900 px-3 py-2.5 rounded-xl text-center min-w-[100px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Privacy Status</span>
            <span className="text-xs font-black text-indigo-400 font-mono flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              LDP OK
            </span>
          </div>
        </div>
      </div>

      {/* Main Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Profile Controls & Behavioral Streams */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Profile Calibration Dashboard */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                  Customer Profile Calibration
                </h3>
              </div>
              <button
                onClick={handleResetColdStart}
                className="text-[9px] font-mono text-indigo-400 hover:text-indigo-300 transition-colors uppercase cursor-pointer"
              >
                [Reset Cold-Start Survey]
              </button>
            </div>

            {/* Template shortcuts */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Preset Behavioral Personas</span>
              <div className="grid grid-cols-4 gap-1">
                {["luxury", "budget", "business", "family"].map(t => (
                  <button
                    key={t}
                    onClick={() => handleSelectTemplate(t as any)}
                    className="py-1 rounded bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:border-slate-700 text-[9px] font-bold text-slate-400 uppercase cursor-pointer text-center"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Controls */}
            <div className="space-y-4 text-xs font-semibold">
              
              {/* Select Cabin Class & Persona Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase">Cabin Preference</label>
                  <select
                    value={profile.cabinClass}
                    onChange={(e) => {
                      setProfile(prev => ({ ...prev, cabinClass: e.target.value as any }));
                      addLog(`[PROFILE] Explicitly altered cabin preference to: ${e.target.value}`);
                    }}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded-lg text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Premium Economy">Premium Economy</option>
                    <option value="Business">Business</option>
                    <option value="First">First Class</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase">Travel Persona</label>
                  <select
                    value={profile.persona}
                    onChange={(e) => {
                      setProfile(prev => ({ ...prev, persona: e.target.value as any }));
                      addLog(`[PROFILE] Explicitly set persona constraint: ${e.target.value}`);
                    }}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded-lg text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="Solo">Solo Traveler</option>
                    <option value="Business">Business corporate</option>
                    <option value="Family">Family Travel (Children)</option>
                    <option value="Couple">Romantic Couple</option>
                  </select>
                </div>
              </div>

              {/* Slider for Max Budget */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-slate-400 uppercase">Maximum Budget Allocation</span>
                  <span className="text-indigo-400 font-bold">${profile.maxBudgetUSD.toLocaleString()} USD</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={profile.maxBudgetUSD}
                  onChange={(e) => setProfile(prev => ({ ...prev, maxBudgetUSD: parseInt(e.target.value) }))}
                  className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Weather Preferences & Favorite Airline */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase">Weather Preference</label>
                  <select
                    value={profile.weatherPreference}
                    onChange={(e) => setProfile(prev => ({ ...prev, weatherPreference: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded-lg text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="Warm">Warm / Tropical</option>
                    <option value="Cold">Cold / Snow lodges</option>
                    <option value="Mild">Mild / Historical</option>
                    <option value="Any">No Preference</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase">Favorite Airlines</label>
                  <input
                    type="text"
                    value={profile.favoriteAirlines.join(", ")}
                    onChange={(e) => setProfile(prev => ({ ...prev, favoriteAirlines: e.target.value.split(",").map(s => s.trim()) }))}
                    placeholder="E.g. Singapore Airlines, Delta"
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded-lg text-slate-350 focus:outline-none"
                  />
                </div>
              </div>

              {/* Destination Interest chips */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Affinity Interests</span>
                <div className="flex flex-wrap gap-1.5">
                  {["Beach", "Cultural", "Adventure", "Ski", "Culinary"].map(interest => {
                    const isSelected = profile.destinationInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-indigo-950 text-indigo-300 border-indigo-800" 
                            : "bg-slate-950 text-slate-500 border-slate-900 hover:text-slate-300"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Machine learning Weights breakdown */}
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 space-y-2 text-[10px] font-mono">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Inferred Tensor Weights (Latent Vector)</span>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>Corporate / Business Weight:</span>
                    <span className="text-slate-300 font-bold">{profile.behaviorScores.businessWeight}%</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${profile.behaviorScores.businessWeight}%` }} />
                  </div>

                  <div className="flex justify-between">
                    <span>Leisure / Vacation Weight:</span>
                    <span className="text-slate-300 font-bold">{profile.behaviorScores.leisureWeight}%</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${profile.behaviorScores.leisureWeight}%` }} />
                  </div>

                  <div className="flex justify-between">
                    <span>Premium Flight Affinity Score:</span>
                    <span className="text-slate-300 font-bold">{profile.behaviorScores.premiumAffinity}%</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${profile.behaviorScores.premiumAffinity}%` }} />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Behavior Event Simulator Panel */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 backdrop-blur-sm space-y-3.5">
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Shuffle className="w-4 h-4 text-indigo-400" />
                Live Behavior Event Stream Simulator
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal mt-0.5 font-semibold">
                Click a mock user-action below to dispatch telemetry. Watch the profile weights modify on the fly!
              </p>
            </div>

            <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
              {BEHAVIORAL_EVENTS_CATALOG.map(evt => (
                <button
                  key={evt.id}
                  onClick={() => handleTriggerEvent(evt)}
                  className="w-full text-left p-2.5 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-xl transition-all cursor-pointer flex items-start gap-2 text-xs group"
                >
                  <div className="p-1 rounded bg-slate-900 shrink-0 text-slate-400 group-hover:text-indigo-400">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-250 flex justify-between">
                      <span>{evt.eventName}</span>
                      <span className="text-[7px] font-mono text-slate-500 font-normal uppercase">{evt.actionSource}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold leading-normal">{evt.description}</p>
                    <p className="text-[9px] text-indigo-450 font-mono font-bold">{evt.impact}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Personalization sandbox tabs & display recommendations */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Output Selector Tab Bar */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 backdrop-blur-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-900">
                <button
                  onClick={() => setActiveTab("recommendations")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase cursor-pointer transition-all ${
                    activeTab === "recommendations" 
                      ? "bg-indigo-950 text-indigo-400 border border-indigo-900/40" 
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Personalized Feed
                </button>
                <button
                  onClick={() => setActiveTab("search")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase cursor-pointer transition-all ${
                    activeTab === "search" 
                      ? "bg-indigo-950 text-indigo-400 border border-indigo-900/40" 
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Search Personalizer
                </button>
                <button
                  onClick={() => setActiveTab("newsletter")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase cursor-pointer transition-all ${
                    activeTab === "newsletter" 
                      ? "bg-indigo-950 text-indigo-400 border border-indigo-900/40" 
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Newsletter API
                </button>
              </div>

              <span className="text-[8px] font-mono text-slate-500 uppercase">
                {activeTab === "recommendations" ? "Content Ranking (RecSys)" : activeTab === "search" ? "Search Personalizer API" : "Email Personalizer /api/v1/newsletter"}
              </span>
            </div>

            {/* TAB CONTENT 1: RECOMMENDED ITEMS FEED */}
            {activeTab === "recommendations" && (
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>Dynamic Content ranking algorithm re-ranks items based on relevance coefficients</span>
                  <span>{scoredItems.length} options computed</span>
                </div>

                <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                  {scoredItems.map((item) => {
                    const hasHighMatch = item.score >= 80;
                    return (
                      <div 
                        key={item.id} 
                        className="bg-slate-950 border border-slate-900 p-4 rounded-xl relative overflow-hidden flex flex-col sm:flex-row justify-between gap-4"
                      >
                        {/* High match shine */}
                        {hasHighMatch && (
                          <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-500/10 to-transparent w-24 h-full pointer-events-none" />
                        )}

                        <div className="space-y-2 max-w-sm sm:max-w-md">
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                              item.category === "hotel_package" 
                                ? "bg-amber-950 text-amber-400 border-amber-900/40" 
                                : "bg-sky-950 text-sky-450 border-sky-900/40"
                            }`}>
                              {item.category.replace("_", " ")}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-400">{item.carrier}</span>
                          </div>

                          <h4 className="text-sm font-black text-slate-200">{item.title}</h4>
                          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed font-sans">{item.description}</p>
                          
                          {/* Reasoning metrics */}
                          <div className="flex flex-wrap gap-1 items-center">
                            <span className="text-[8px] font-mono text-slate-500 uppercase mr-1">Rank Reasons:</span>
                            {item.reasons.slice(0, 3).map((r, idx) => (
                              <span key={idx} className="bg-slate-900/60 border border-slate-900 px-1.5 py-0.2 rounded text-[8px] font-medium text-slate-450">
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Match Score Gauge */}
                        <div className="shrink-0 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end border-t sm:border-t-0 sm:border-l border-slate-900 pt-3 sm:pt-0 sm:pl-4 min-w-[90px] gap-2">
                          <div className="text-right">
                            <span className="text-[9px] font-mono text-slate-500 block uppercase">Match Score</span>
                            <span className={`text-xl font-black font-mono tracking-tight ${
                              item.score >= 80 
                                ? "text-indigo-400" 
                                : item.score >= 55 
                                  ? "text-emerald-400" 
                                  : "text-rose-500"
                            }`}>
                              {item.score}%
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] font-mono text-slate-500 block uppercase">Value Est</span>
                            <span className="text-xs font-bold text-slate-100 font-mono">${item.priceUSD} USD</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: SEARCH PERSONALIZATION */}
            {activeTab === "search" && (
              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-3 font-semibold text-xs text-slate-400 leading-normal">
                  <h4 className="text-xs font-mono font-bold text-slate-250 uppercase tracking-wide flex items-center gap-1">
                    <Search className="w-4 h-4 text-indigo-400" />
                    Adaptive Search Re-ranking (Standard vs. Personalization Match)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Standard search engines sort purely by raw metrics (such as Price ascending). FlySmart Personalization ranks on a weighted tensor overlay combining favorite carriers, user class compatibility, and localized interests.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Column 1: Standard Raw Listing */}
                    <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl space-y-2">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Standard Query Output (Sort: Asc Price)</span>
                      
                      <div className="space-y-1.5 text-[10px] font-mono">
                        {RECOMMENDABLE_ITEMS.slice().sort((a,b) => a.priceUSD - b.priceUSD).map((item, idx) => (
                          <div key={item.id} className="flex justify-between items-center p-1.5 bg-slate-950/60 border border-slate-900/40 rounded">
                            <span className="text-slate-400 truncate max-w-[120px]">{idx+1}. {item.title}</span>
                            <b className="text-slate-300 font-bold">${item.priceUSD}</b>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: Personalization Weighted rank */}
                    <div className="bg-slate-900 border border-indigo-950 p-3 rounded-xl space-y-2 relative">
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                        <span className="text-[7px] font-mono text-indigo-450 font-bold">ACTIVE</span>
                      </div>
                      <span className="text-[9px] font-mono text-indigo-400 uppercase block font-bold">FlySmart Personalized Re-rank</span>
                      
                      <div className="space-y-1.5 text-[10px] font-mono">
                        {scoredItems.slice(0, 5).map((item, idx) => (
                          <div key={item.id} className="flex justify-between items-center p-1.5 bg-slate-950 border border-indigo-950/30 rounded">
                            <span className="text-slate-200 truncate max-w-[120px] font-bold">{idx+1}. {item.title}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[8px] text-indigo-400">Match: {item.score}%</span>
                              <b className="text-emerald-450">${item.priceUSD}</b>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-[8.5px] font-mono text-slate-500 bg-slate-900 p-2 rounded">
                    ELASTICSEARCH INTEGRATION: The search engine executes standard filtering in Elasticsearch, then queries Redis for active user personalization weights vector, performing a fast memory cosine-similarity scoring step within 8ms.
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: PERSONALIZED NEWSLETTER */}
            {activeTab === "newsletter" && (
              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-4 text-xs font-semibold leading-relaxed">
                  
                  {/* Mock Newsletter Layout */}
                  <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-900 max-w-lg mx-auto">
                    <div className="bg-indigo-950 border-b border-indigo-900 p-4 text-center">
                      <Plane className="w-6 h-6 text-indigo-400 mx-auto mb-1 animate-pulse" />
                      <h3 className="font-mono text-xs font-black text-slate-150 uppercase tracking-widest">
                        FlySmart Bespoke Digest
                      </h3>
                      <span className="text-[9px] text-slate-400 font-mono">Bespoke luxury recommendations compiled specifically for you</span>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="text-center font-mono text-[9px] text-indigo-400 pb-2 border-b border-slate-850/60">
                        COMPILED SEGMENT: &ldquo;{profile.persona.toUpperCase()} TRAVEL / COGNITIVE RETRANSLATION&rdquo;
                      </div>

                      {/* Top matched item in email format */}
                      {scoredItems.length > 0 && (
                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
                          <span className="text-[8px] bg-indigo-950 text-indigo-400 px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                            Your Elite Flight Choice
                          </span>
                          <h4 className="text-xs font-black text-slate-200">{scoredItems[0].title}</h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-sans font-semibold">{scoredItems[0].description}</p>
                          <div className="flex justify-between items-baseline font-mono text-[10px] pt-1.5 border-t border-slate-900">
                            <span>Bespoke Rate: <b className="text-slate-200">${scoredItems[0].priceUSD}</b></span>
                            <span className="text-indigo-400 font-bold">{scoredItems[0].score}% Match Rating</span>
                          </div>
                        </div>
                      )}

                      {/* Alternate item */}
                      {scoredItems.length > 1 && (
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-400">
                          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-900 space-y-1">
                            <span className="text-[8px] text-slate-500 font-mono uppercase">Alternate destination</span>
                            <h5 className="font-black text-slate-300 truncate">{scoredItems[1].title}</h5>
                            <span className="font-mono text-[9px] block text-emerald-450">${scoredItems[1].priceUSD}</span>
                          </div>

                          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-900 space-y-1">
                            <span className="text-[8px] text-slate-500 font-mono uppercase">Secondary interest</span>
                            <h5 className="font-black text-slate-300 truncate">{scoredItems[2]?.title || scoredItems[1].title}</h5>
                            <span className="font-mono text-[9px] block text-emerald-450">${scoredItems[2]?.priceUSD || scoredItems[1].priceUSD}</span>
                          </div>
                        </div>
                      )}

                    </div>

                    <div className="bg-slate-950 text-center py-2.5 border-t border-slate-850 text-[9px] text-slate-500 font-mono">
                      Safe unsubscribe | FlySmart respects privacy (No telemetry cross-tracking)
                    </div>
                  </div>

                  {/* Active code description */}
                  <div className="text-[8.5px] font-mono text-slate-500 flex justify-between items-center bg-slate-900/50 p-2 rounded">
                    <span>CRON SCHEDULER: Newsletter compiles nightly for active members. Retries skipped if profile inactivity &gt; 14 days.</span>
                    <span className="text-emerald-400 font-bold text-[7px] uppercase">EMAIL DISPATCH READY</span>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Cold Start Questionnaire Modal Popup Overlay (Conditional) */}
      {showColdStartForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scaleUp">
            
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-400 animate-spin" />
                Traveler Cold-Start Setup Survey
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Initialize your persona properties to pre-prime FlySmart collaborative matrix clustering indices.
              </p>
            </div>

            {/* Simple survey simulation */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const surveyAnswers = {
                  persona: data.get("persona") || "Solo",
                  cabin: data.get("cabin") || "Premium Economy",
                  budget: parseInt(data.get("budget") as string || "1500"),
                  weather: data.get("weather") || "Warm",
                  freq: data.get("freq") || "regular",
                  interests: data.getAll("interests") as string[]
                };
                if (surveyAnswers.interests.length === 0) surveyAnswers.interests = ["Beach"];
                submitColdStart(surveyAnswers);
              }}
              className="space-y-4 text-xs font-semibold text-slate-300"
            >
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block font-mono">Persona</label>
                  <select name="persona" className="w-full bg-slate-950 border border-slate-800 p-2 rounded">
                    <option value="Solo">Solo Leisure</option>
                    <option value="Business">Business Professional</option>
                    <option value="Family">Family Vacationer</option>
                    <option value="Couple">Couple / HoneyMoon</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block font-mono">Desired Cabin</label>
                  <select name="cabin" className="w-full bg-slate-950 border border-slate-800 p-2 rounded">
                    <option value="Economy">Economy</option>
                    <option value="Premium Economy">Premium Economy</option>
                    <option value="Business">Business Class</option>
                    <option value="First">First Class Suites</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block font-mono">Weather Style</label>
                  <select name="weather" className="w-full bg-slate-950 border border-slate-800 p-2 rounded">
                    <option value="Warm">Tropical Beaches (Warm)</option>
                    <option value="Cold">Snowy Resorts (Cold)</option>
                    <option value="Mild">European Mild (Mild)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block font-mono">Approx Max Budget</label>
                  <input name="budget" type="number" defaultValue="2500" className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded" />
                </div>
              </div>

              {/* Interests checklist */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-mono">Destination Interests (Check multiple)</label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-2.5 rounded border border-slate-800">
                  {["Beach", "Cultural", "Adventure", "Ski", "Culinary"].map(i => (
                    <label key={i} className="flex items-center gap-1 cursor-pointer text-[11px]">
                      <input type="checkbox" name="interests" value={i} defaultChecked={i === "Beach" || i === "Culinary"} className="accent-indigo-500" />
                      <span>{i}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowColdStartForm(false)}
                  className="w-1/2 py-2 bg-slate-950 hover:bg-slate-900 text-slate-400 font-mono rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-mono rounded cursor-pointer"
                >
                  Compile Profile
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Production Architecture Specifications */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-slate-250 uppercase font-mono tracking-wide flex items-center gap-1.5">
            <FileText className="w-4.5 h-4.5 text-indigo-400" />
            Adaptive Traveler Personalization Engine Production Guidelines
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            System blueprint for behavior tracking, ranking estimators, collaborative matrix updates, and client-side differential privacy rules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed font-semibold">
          
          {/* Bento Box 1 */}
          <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-450" />
              1. Behavioral Tracking & Vectoring
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              Live click streams (flight views, filter toggles, GDS searches) emit zero-PII metrics to a Kafka buffer. The metrics mutate user state tensors in Redis, updating preferred airlines and cabin budgets within sub-second intervals.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>Session decay coefficient updates weights hourly.</li>
              <li>Outliers suppressed to prevent erratic recommendations.</li>
              <li>Sub-second weights retrieval in memory (Redis).</li>
            </ul>
          </div>

          {/* Bento Box 2 */}
          <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-450" />
              2. Matrix Factorization & Re-ranking
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              The collaborative filter constructs a user-item cosine-similarity rank matrix on Spark. Standard flight searches get dynamic re-ranking via search-personalization filters based on user premium flight indices.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>Matrix dimensions factorization runs nightly.</li>
              <li>SVD model validation achieves MSE target &lt; 0.12.</li>
              <li>Search query rank interpolation limit: 12ms.</li>
            </ul>
          </div>

          {/* Bento Box 3 */}
          <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-450" />
              3. Privacy, Local Storage & GDPR compliance
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              Adheres to privacy-first directives. Profile tensors are calculated using Local Differential Privacy (LDP) with noise injections. User metadata resides exclusively in browser local structures unless expressly consented.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>GDPR / CCPA zero-PII tracking vectors.</li>
              <li>Differential privacy epsilon &epsilon; calibration: 1.5.</li>
              <li>Autonomous client local-storage fallback keys.</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}
