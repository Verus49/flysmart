import React, { useState, useMemo } from "react";
import { INTELLIGENCE_FEATURES, IntelligenceFeatureDoc } from "../data/intelligenceDocs";
import { 
  TrendingUp, 
  AlertCircle, 
  BarChart3, 
  MapPin, 
  Layers, 
  Compass, 
  Grid, 
  Calendar, 
  CalendarDays, 
  Coffee, 
  ThumbsUp, 
  Briefcase, 
  RefreshCw, 
  Leaf, 
  ShieldAlert,
  ChevronRight,
  Database,
  Cpu,
  CheckCircle2,
  Workflow,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  Flame,
  PlaneTakeoff
} from "lucide-react";

// Helper function to map dynamic string icons to Lucide components
const getFeatureIcon = (iconName: string) => {
  switch (iconName) {
    case "TrendingUp": return <TrendingUp className="w-4 h-4" />;
    case "AlertCircle": return <AlertCircle className="w-4 h-4" />;
    case "BarChart3": return <BarChart3 className="w-4 h-4" />;
    case "MapPin": return <MapPin className="w-4 h-4" />;
    case "Layers": return <Layers className="w-4 h-4" />;
    case "Compass": return <Compass className="w-4 h-4" />;
    case "Grid": return <Grid className="w-4 h-4" />;
    case "Calendar": return <Calendar className="w-4 h-4" />;
    case "CalendarDays": return <CalendarDays className="w-4 h-4" />;
    case "Coffee": return <Coffee className="w-4 h-4" />;
    case "ThumbsUp": return <ThumbsUp className="w-4 h-4" />;
    case "Briefcase": return <Briefcase className="w-4 h-4" />;
    case "RefreshCw": return <RefreshCw className="w-4 h-4" />;
    case "Leaf": return <Leaf className="w-4 h-4" />;
    case "ShieldAlert": return <ShieldAlert className="w-4 h-4" />;
    default: return <Cpu className="w-4 h-4" />;
  }
};

export default function IntelligenceExplorer() {
  const [activeCategory, setActiveCategory] = useState<"all" | "pricing" | "routing" | "quality" | "sustainability_safety">("all");
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>("price-prediction");
  
  // Interactive Simulation states
  const [selectedSim, setSelectedSim] = useState<"pricing_predict" | "comfort_layover" | "sustainability">("pricing_predict");
  
  // Simulation 1: Pricing
  const [simRoute, setSimRoute] = useState<string>("FRA-JFK");
  const [simDaysToDepart, setSimDaysToDepart] = useState<number>(45);
  const [simCurrentPrice, setSimCurrentPrice] = useState<number>(680);
  const [isSimulatingPricing, setIsSimulatingPricing] = useState<boolean>(false);
  const [pricingResult, setPricingResult] = useState<any>(null);

  // Simulation 2: Comfort / Quality
  const [simAircraft, setSimAircraft] = useState<string>("A350-900");
  const [simCabin, setSimCabin] = useState<string>("business");
  const [simLayoverTime, setSimLayoverTime] = useState<number>(150); // minutes
  const [simLayoverAirport, setSimLayoverAirport] = useState<string>("SIN");
  const [comfortResult, setComfortResult] = useState<any>(null);
  
  // Simulation 3: Sustainability & Hidden-city
  const [simGreenRoute, setSimGreenRoute] = useState<string>("CDG-SIN");
  const [simGreenCabin, setSimGreenCabin] = useState<string>("economy");
  const [sustainabilityResult, setSustainabilityResult] = useState<any>(null);

  // Filter features
  const filteredFeatures = useMemo(() => {
    if (activeCategory === "all") return INTELLIGENCE_FEATURES;
    return INTELLIGENCE_FEATURES.filter(f => f.category === activeCategory);
  }, [activeCategory]);

  const selectedFeature = useMemo(() => {
    return INTELLIGENCE_FEATURES.find(f => f.id === selectedFeatureId) || INTELLIGENCE_FEATURES[0];
  }, [selectedFeatureId]);

  // Set default selected feature on category filter change
  React.useEffect(() => {
    if (filteredFeatures.length > 0) {
      setSelectedFeatureId(filteredFeatures[0].id);
    }
  }, [activeCategory, filteredFeatures]);

  // Pricing Simulator Handler
  const handleSimulatePricing = () => {
    setIsSimulatingPricing(true);
    setPricingResult(null);
    setTimeout(() => {
      // Calculate realistic dynamic price curve
      const points = [];
      let baseline = simRoute === "FRA-JFK" ? 500 : simRoute === "LHR-CDG" ? 180 : 850;
      
      // If late booking, price goes up
      if (simDaysToDepart < 14) {
        baseline = baseline * 1.5;
      }
      
      // Calculate daily points for the last 14 days and next 14 days
      for (let i = -7; i <= 7; i++) {
        const factor = 1 + Math.sin(i / 3) * 0.08 + (i > 0 ? (i / 15) * (simDaysToDepart < 14 ? 0.3 : 0.05) : -(i / 20) * 0.02);
        const dayPrice = Math.round(baseline * factor);
        points.push({
          dayOffset: i,
          price: dayPrice,
          label: i === 0 ? "Today" : i < 0 ? `${Math.abs(i)}d ago` : `in ${i}d`
        });
      }

      const currentPointPrice = points[7].price; // Today's index
      const minPoint = Math.min(...points.map(p => p.price));
      const maxPoint = Math.max(...points.map(p => p.price));

      let recommendation: "BUY" | "WAIT" = "BUY";
      let confidence = 85;
      let savings = 0;
      let rationale = "";

      if (simDaysToDepart < 10) {
        recommendation = "BUY";
        confidence = 98;
        savings = 0;
        rationale = "Ticket sales are in the critical late-booking window. Historical records show a 98% probability of severe airline seat inventory depletion and fare escalation within 48 hours.";
      } else if (simCurrentPrice > baseline * 1.15) {
        recommendation = "WAIT";
        confidence = 78;
        savings = Math.round(simCurrentPrice - baseline);
        rationale = "Current quotes reside inside the 92nd percentile pricing band. Real-time dynamic indexes predict a regression to standard carrier median levels within 6 days.";
      } else {
        recommendation = "BUY";
        confidence = 82;
        savings = 0;
        rationale = "This price matches historic median floors for the requested season. Seat vacancy metrics are dropping; locking current rates immediately is advised.";
      }

      setPricingResult({
        points,
        recommendation,
        confidence,
        expectedSavings: savings,
        rationale,
        minExpected: Math.round(baseline * 0.95),
        maxExpected: Math.round(baseline * 1.4)
      });
      setIsSimulatingPricing(false);
    }, 800);
  };

  // Comfort Simulator Handler
  const handleSimulateComfort = () => {
    // Aircraft scores
    let aircraftScore = 85;
    let desc = "";
    if (simAircraft === "B787-9") {
      aircraftScore = 88;
      desc = "Boeing Dreamliner: Advanced humidifiers & low altitude cabin pressurization reduce jetlag symptoms by 40%.";
    } else if (simAircraft === "A350-900") {
      aircraftScore = 94;
      desc = "Airbus A350: Ultra-silent engines, dynamic LED mood lighting, spacious overhead storage, and 100% composite airframe.";
    } else {
      aircraftScore = 55;
      desc = "Legacy Narrow-body: Sourced from aging regional fleets, noisy cabin profile, higher pressurization altitudes.";
    }

    // Cabin class multiplier
    let cabinScore = 50;
    if (simCabin === "first") cabinScore = 98;
    else if (simCabin === "business") cabinScore = 88;
    else if (simCabin === "premium_eco") cabinScore = 72;

    // Layover score calculation
    let airportScore = 80;
    let airportAmenities: string[] = [];
    if (simLayoverAirport === "SIN") {
      airportScore = 96;
      airportAmenities = ["Jewel Singapore botanical gardens", "Free 24/7 rest zones", "Free cinema halls", "Rooftop swimming pool"];
    } else if (simLayoverAirport === "DXB") {
      airportScore = 88;
      airportAmenities = ["Luxury Zen gardens", "SnoozeCube sleeping pods", "Premium thermal showers", "In-terminal transit hotel"];
    } else if (simLayoverAirport === "LHR") {
      airportScore = 74;
      airportAmenities = ["Inter-terminal Heathrow Express link", "Bespoke fine-dining outlets", "Day-use rest rooms"];
    } else {
      airportScore = 58;
      airportAmenities = ["Standard duty-free shops", "Limited charging stations", "Priority Pass lounge (capacity restricted)"];
    }

    // Layover duration impact
    let layoverMetric = "Optimal";
    let layoverPenalty = 0;
    if (simLayoverTime < 60) {
      layoverMetric = "High Stress (Under Minimum Connection Time)";
      layoverPenalty = 30;
    } else if (simLayoverTime > 360) {
      layoverMetric = "Exhausting (Excessive wait time)";
      layoverPenalty = 15;
    } else if (simLayoverTime >= 90 && simLayoverTime <= 180) {
      layoverMetric = "Comfortable Transit Buffer";
      layoverPenalty = 0;
    } else {
      layoverMetric = "Acceptable Connection Window";
      layoverPenalty = 5;
    }

    const netLayoverScore = Math.max(10, airportScore - layoverPenalty);
    const overallScore = Math.round((aircraftScore * 0.3) + (cabinScore * 0.4) + (netLayoverScore * 0.3));

    setComfortResult({
      overallScore,
      aircraftScore,
      aircraftDesc: desc,
      cabinScore,
      layoverScore: netLayoverScore,
      layoverStatus: layoverMetric,
      amenities: airportAmenities
    });
  };

  // Sustainability Simulator Handler
  const handleSimulateSustainability = () => {
    // Distance
    let km = simGreenRoute === "CDG-SIN" ? 10400 : simGreenRoute === "FRA-JFK" ? 6200 : 980;
    
    // Base fuel burn rates per km (A350/B787 averages)
    let emissionsPerKm = 0.12; // kg CO2 per passenger km in economy
    if (simGreenCabin === "business") {
      emissionsPerKm = emissionsPerKm * 2.9; // business occupies 2.9x physical space share
    } else if (simGreenCabin === "first") {
      emissionsPerKm = emissionsPerKm * 4.0;
    }

    const totalEmissions = Math.round(km * emissionsPerKm);
    
    // Green option compare
    const greenDifference = simGreenRoute === "CDG-SIN" ? -22 : simGreenRoute === "FRA-JFK" ? -14 : -35;
    const offsetTreeYears = Math.round(totalEmissions / 22); // One tree absorbs roughly 22kg CO2 per year

    // Hidden city check
    let hiddenCity = null;
    if (simGreenRoute === "FRA-JFK") {
      hiddenCity = {
        route: "FRA ➔ JFK ➔ MIA (Flight LH430 / UA110)",
        throughPrice: 420,
        directPrice: 650,
        savings: 230,
        rationale: "By reserving a ticket ending in Miami (MIA) with a stopover in New York (JFK), passengers can simply exit at New York, saving $230 on the direct reservation. Carry-on luggage is strictly mandatory."
      };
    }

    setSustainabilityResult({
      totalEmissions,
      savingRatio: Math.abs(greenDifference),
      offsetTrees: offsetTreeYears,
      hiddenCity
    });
  };

  // Trigger default sims
  React.useEffect(() => {
    handleSimulatePricing();
    handleSimulateComfort();
    handleSimulateSustainability();
  }, [simRoute, simDaysToDepart, simCurrentPrice, simAircraft, simCabin, simLayoverAirport, simLayoverTime, simGreenRoute, simGreenCabin]);

  return (
    <div className="space-y-6 animate-fadeIn" id="intelligence-explorer-root">
      
      {/* Simulation Playground Panel */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <div className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded-full font-mono font-bold uppercase max-w-max">
              Interactive AI Logic Sandbox
            </div>
            <h2 className="text-lg font-black text-slate-100 tracking-tight mt-1.5 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              Dynamic Flight Intelligence Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Toggle between mathematical models representing our advanced routing pipelines, user comfort indexes, and sustainability calculators.
            </p>
          </div>

          {/* Sub-simulation selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setSelectedSim("pricing_predict")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedSim === "pricing_predict"
                  ? "bg-slate-900 text-sky-400 border border-slate-800/80"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              1. Price Prediction
            </button>
            <button
              onClick={() => setSelectedSim("comfort_layover")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedSim === "comfort_layover"
                  ? "bg-slate-900 text-sky-400 border border-slate-800/80"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              2. Comfort & Layover
            </button>
            <button
              onClick={() => setSelectedSim("sustainability")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedSim === "sustainability"
                  ? "bg-slate-900 text-sky-400 border border-slate-800/80"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              3. Green & Hidden-City
            </button>
          </div>
        </div>

        {/* Selected simulation execution block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form input inputs */}
          <div className="lg:col-span-4 bg-slate-950/60 border border-slate-900 rounded-xl p-5 space-y-4">
            <div className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wide">
              Pipeline Parameters
            </div>

            {selectedSim === "pricing_predict" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-mono uppercase">Select Travel Corridor</label>
                  <select
                    value={simRoute}
                    onChange={(e) => setSimRoute(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 p-2.5 outline-none font-semibold focus:border-sky-500/45"
                  >
                    <option value="FRA-JFK">Frankfurt (FRA) ➔ New York (JFK) [Long-Haul]</option>
                    <option value="LHR-CDG">London Heathrow (LHR) ➔ Paris (CDG) [Regional]</option>
                    <option value="CDG-SYD">Paris (CDG) ➔ Sydney (SYD) [Extreme Long-Haul]</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono uppercase">
                    <label className="text-slate-500">Days to Departure</label>
                    <span className="text-sky-400 font-bold">{simDaysToDepart} days</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="180"
                    value={simDaysToDepart}
                    onChange={(e) => setSimDaysToDepart(parseInt(e.target.value))}
                    className="w-full accent-sky-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-600 font-mono">
                    <span>2 days</span>
                    <span>180 days</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono uppercase">
                    <label className="text-slate-500">Current Price Quote</label>
                    <span className="text-emerald-400 font-bold">${simCurrentPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="10"
                    value={simCurrentPrice}
                    onChange={(e) => setSimCurrentPrice(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-600 font-mono">
                    <span>$100</span>
                    <span>$2,000</span>
                  </div>
                </div>

                <button
                  onClick={handleSimulatePricing}
                  disabled={isSimulatingPricing}
                  className="w-full py-2 bg-sky-950 border border-sky-800 hover:bg-sky-900/40 text-sky-400 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingPricing ? "animate-spin" : ""}`} />
                  {isSimulatingPricing ? "COMPUTING MODEL..." : "RE-RUN PREDICTION"}
                </button>
              </div>
            )}

            {selectedSim === "comfort_layover" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-mono uppercase">Aircraft Equipment</label>
                  <select
                    value={simAircraft}
                    onChange={(e) => setSimAircraft(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 p-2.5 outline-none font-semibold focus:border-sky-500/45"
                  >
                    <option value="A350-900">Airbus A350-900 (High-Spec Suite)</option>
                    <option value="B787-9">Boeing 787-9 Dreamliner (Humidified Cabin)</option>
                    <option value="B737-800">Boeing 737-800 (Standard Regional)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-mono uppercase">Seating Class</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["economy", "premium_eco", "business", "first"].map((cls) => (
                      <button
                        key={cls}
                        onClick={() => setSimCabin(cls)}
                        className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border cursor-pointer transition-all uppercase ${
                          simCabin === cls 
                            ? "bg-sky-950 border-sky-600/50 text-sky-400" 
                            : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {cls.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-mono uppercase">Transit Airport</label>
                  <select
                    value={simLayoverAirport}
                    onChange={(e) => setSimLayoverAirport(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 p-2.5 outline-none font-semibold focus:border-sky-500/45"
                  >
                    <option value="SIN">Changi Singapore (SIN) - Rated Best Airport</option>
                    <option value="DXB">Dubai International (DXB) - Rated Excellent</option>
                    <option value="LHR">London Heathrow (LHR) - Average Hub</option>
                    <option value="ORD">Chicago O'Hare (ORD) - Busy, Congested Hub</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono uppercase">
                    <label className="text-slate-500">Connection Duration</label>
                    <span className="text-sky-400 font-bold">{simLayoverTime} mins ({Math.floor(simLayoverTime / 60)}h {simLayoverTime % 60}m)</span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="500"
                    step="5"
                    value={simLayoverTime}
                    onChange={(e) => setSimLayoverTime(parseInt(e.target.value))}
                    className="w-full accent-sky-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-600 font-mono">
                    <span>35 mins (Tight)</span>
                    <span>500 mins (Long)</span>
                  </div>
                </div>
              </div>
            )}

            {selectedSim === "sustainability" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-mono uppercase">Flight Sector</label>
                  <select
                    value={simGreenRoute}
                    onChange={(e) => setSimGreenRoute(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 p-2.5 outline-none font-semibold focus:border-sky-500/45"
                  >
                    <option value="CDG-SIN">Paris CDG ➔ Singapore SIN (10,400km)</option>
                    <option value="FRA-JFK">Frankfurt FRA ➔ New York JFK (6,200km)</option>
                    <option value="CDG-LHR">Paris CDG ➔ London Heathrow LHR (340km)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-mono uppercase">Emission Class Factor</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["economy", "business", "first"].map((cls) => (
                      <button
                        key={cls}
                        onClick={() => setSimGreenCabin(cls)}
                        className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border cursor-pointer transition-all uppercase ${
                          simGreenCabin === cls 
                            ? "bg-emerald-950 border-emerald-600/50 text-emerald-400" 
                            : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg text-[10px] text-slate-500 leading-relaxed space-y-1">
                  <div className="font-bold text-emerald-400/90 flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5" />
                    How weight factors emission share:
                  </div>
                  <span>Business class tickets occupy ~3x more space than economy cabins on a widebody, thus they are allocated up to 3x higher direct carbon penalties by global ICAO indices.</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Display Pane */}
          <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-xl p-5 min-h-[300px] flex flex-col justify-between">
            {selectedSim === "pricing_predict" && pricingResult && (
              <div className="space-y-4 animate-fadeIn">
                {/* Score panel */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Monte Carlo Recommendation Engine</div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`px-4 py-1.5 rounded-xl font-black text-xs tracking-wider uppercase border ${
                        pricingResult.recommendation === "BUY"
                          ? "bg-emerald-950 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-950/20"
                          : "bg-amber-950 border-amber-500/30 text-amber-400 shadow-lg shadow-amber-950/20"
                      }`}>
                        {pricingResult.recommendation === "BUY" ? "BUY NOW ADVISED" : "WAIT FOR LOWER PRICES"}
                      </span>
                      <span className="text-xs text-slate-300 font-mono">
                        Confidence Factor: <strong className="text-sky-400">{pricingResult.confidence}%</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-900 sm:pl-4">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Estimated Savings Potential</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                      {pricingResult.expectedSavings > 0 ? `$${pricingResult.expectedSavings}` : "$0"}
                    </div>
                  </div>
                </div>

                {/* Simulated Chart visualization using simple responsive HTML columns */}
                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-slate-500 uppercase flex justify-between">
                    <span>14-Day Expected Fare Trajectory Chart</span>
                    <span>Current Price Quote: <strong className="text-emerald-400">${simCurrentPrice}</strong></span>
                  </div>
                  
                  <div className="bg-slate-900/40 border border-slate-900/60 rounded-xl p-4 h-[120px] flex items-end justify-between gap-2 pt-8">
                    {pricingResult.points.map((pt: any, idx: number) => {
                      // Normalize heights between 20% and 95%
                      const valMax = pricingResult.maxExpected;
                      const valMin = pricingResult.minExpected;
                      const span = valMax - valMin || 100;
                      const heightPercent = Math.max(20, Math.min(95, ((pt.price - valMin) / span) * 100));
                      const isCurrent = pt.dayOffset === 0;

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer relative">
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-1 bg-slate-900 border border-slate-800 text-[9px] font-mono font-bold text-sky-400 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            ${pt.price}
                          </div>
                          <div 
                            className={`w-full rounded-t-sm transition-all duration-300 ${
                              isCurrent
                                ? "bg-sky-500 shadow-md shadow-sky-500/10"
                                : pt.dayOffset > 0
                                ? "bg-slate-700/85 hover:bg-slate-600"
                                : "bg-slate-800/65"
                            }`}
                            style={{ height: `${heightPercent}px` }}
                          />
                          <span className={`text-[8px] font-mono ${isCurrent ? "text-sky-400 font-bold" : "text-slate-500"}`}>
                            {pt.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rationale description box */}
                <div className="bg-slate-900/50 border border-slate-900 rounded-xl p-3.5 flex gap-2.5 items-start leading-relaxed text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-slate-200">Algorithmic Assessment:</div>
                    <div className="text-slate-400">{pricingResult.rationale}</div>
                  </div>
                </div>
              </div>
            )}

            {selectedSim === "comfort_layover" && comfortResult && (
              <div className="space-y-5 animate-fadeIn">
                {/* Score index indicator */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-4 gap-4 flex-wrap">
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Composite Passenger Comfort Index</div>
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="text-3xl font-black text-sky-400 font-mono">
                        {comfortResult.overallScore}
                      </span>
                      <span className="text-slate-500 text-xs font-mono">/ 100 pts</span>
                      <span className="text-xs text-slate-400 font-semibold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded ml-2">
                        Grade: {comfortResult.overallScore >= 85 ? "Excellent (A)" : comfortResult.overallScore >= 70 ? "Good (B)" : "Average (C)"}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Meter bar */}
                  <div className="w-full sm:w-44 bg-slate-900 border border-slate-800/80 rounded-full h-3 overflow-hidden shrink-0">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        comfortResult.overallScore >= 85
                          ? "bg-emerald-500"
                          : comfortResult.overallScore >= 70
                          ? "bg-sky-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${comfortResult.overallScore}%` }}
                    />
                  </div>
                </div>

                {/* Breakdowns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-3.5 space-y-1">
                    <div className="text-[9px] font-mono text-slate-500 uppercase">AIRCRAFT WEIGHT</div>
                    <div className="text-lg font-black text-slate-200 font-mono">{comfortResult.aircraftScore}%</div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{comfortResult.aircraftDesc}</p>
                  </div>
                  <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-3.5 space-y-1">
                    <div className="text-[9px] font-mono text-slate-500 uppercase">CABIN COMFORT SHARE</div>
                    <div className="text-lg font-black text-slate-200 font-mono">{comfortResult.cabinScore}%</div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {simCabin === "economy" ? "Economy seat pitch limited to standard 30-31 inches. Limited recline." : "Premium layout, lie-flat or enhanced legroom (minimum 36-64 inch pitch)."}
                    </p>
                  </div>
                  <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-3.5 space-y-1">
                    <div className="text-[9px] font-mono text-slate-500 uppercase">LAYOVER & TRANSIT RATING</div>
                    <div className="text-lg font-black text-slate-200 font-mono">{comfortResult.layoverScore}%</div>
                    <p className="text-[10px] text-sky-400 font-mono">{comfortResult.layoverStatus}</p>
                  </div>
                </div>

                {/* Amenities highlight */}
                <div className="bg-slate-900/50 border border-slate-900 rounded-xl p-3.5 space-y-2">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-sky-400" />
                    Available Transit Amenities at {simLayoverAirport}:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {comfortResult.amenities.map((amenity: string, index: number) => (
                      <span key={index} className="text-[10px] bg-slate-950 border border-slate-800/80 px-2.5 py-1 rounded-lg text-slate-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedSim === "sustainability" && sustainabilityResult && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Calculated Flight Carbon Footprint</div>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-3xl font-black text-emerald-400 font-mono">
                        {sustainabilityResult.totalEmissions}
                      </span>
                      <span className="text-slate-500 text-xs font-mono">kg CO₂</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded ml-2 font-mono">
                        {sustainabilityResult.savingRatio}% Greener than average flight
                      </span>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-900 sm:pl-4">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Environmental Offset Equivalent</div>
                    <div className="text-md font-bold text-slate-300 mt-1 flex items-center gap-1 justify-end">
                      <Leaf className="w-4 h-4 text-emerald-400" />
                      Requires planting {sustainabilityResult.offsetTrees} tree-years
                    </div>
                  </div>
                </div>

                {/* Skiplagged Opportunity Card */}
                {sustainabilityResult.hiddenCity ? (
                  <div className="bg-amber-950/20 border border-amber-600/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Hidden-City Booking Opportunity Detected!
                      </span>
                      <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded font-mono">Skiplagged</span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {sustainabilityResult.hiddenCity.rationale}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-amber-900/20 pt-3">
                      <div>
                        <div className="text-[9px] text-slate-500 font-mono">Alternative Through Ticket</div>
                        <div className="text-xs font-bold text-slate-300 font-mono">{sustainabilityResult.hiddenCity.route}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 font-mono">Through Ticket Cost</div>
                        <div className="text-xs font-bold text-emerald-400 font-mono">${sustainabilityResult.hiddenCity.throughPrice}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 font-mono">Direct Segment Cost</div>
                        <div className="text-xs font-bold text-rose-400/80 font-mono">${sustainabilityResult.hiddenCity.directPrice}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 font-mono">Net Pocket Savings</div>
                        <div className="text-xs font-black text-amber-400 font-mono">Save ${sustainabilityResult.hiddenCity.savings}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-8 text-center text-slate-500 text-xs py-14">
                    No active hidden-city pricing anomalies detected for the route {simGreenRoute}. Standard routing pricing models remain optimal.
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-slate-900 pt-3 mt-4 text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
              <Workflow className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Real-time models consume ClickHouse data and compute features in under 12ms inside GKE-based inference worker clusters.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 15 Feature Specifications Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
              <Filter className="w-4 h-4 text-sky-400" />
              Intelligence Features Registry
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Analyze the precise technical blueprint, input parameters, and processing pipelines of our 15 flight enrichment services.
            </p>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800/60">
            {[
              { id: "all", label: "All" },
              { id: "pricing", label: "Pricing" },
              { id: "routing", label: "Routing" },
              { id: "quality", label: "Comfort" },
              { id: "sustainability_safety", label: "Green & Safety" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id as any);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-sans transition-all cursor-pointer uppercase ${
                  activeCategory === cat.id 
                    ? "bg-slate-900 text-sky-400 border border-slate-800/80" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Feature buttons */}
          <div className="space-y-1.5 max-h-[350px] overflow-y-auto scrollbar-thin">
            {filteredFeatures.map((f) => {
              const isSelected = f.id === selectedFeatureId;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFeatureId(f.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all border flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-sky-950/30 border-sky-500/30 text-sky-400 shadow-lg shadow-sky-950/20"
                      : "bg-slate-950/30 border-slate-800/60 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800 hover:text-slate-200"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? "bg-sky-900/40 text-sky-400" : "bg-slate-900 text-slate-500"}`}>
                    {getFeatureIcon(f.icon)}
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs tracking-wide block">
                      {f.name}
                    </span>
                    <span className="text-[9px] text-slate-500 line-clamp-1">
                      {f.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected feature technical blueprint panel */}
        <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] bg-sky-950 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase max-w-max">
                Feature Category: {selectedFeature.category.replace("_", " & ")}
              </div>
              <h2 className="text-xl font-black text-slate-100 tracking-tight mt-1.5">
                {selectedFeature.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {selectedFeature.description}
              </p>
            </div>
            
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900/80 text-sky-400 shrink-0">
              {getFeatureIcon(selectedFeature.icon)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Inputs & Outputs */}
            <div className="space-y-4">
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                  <PlaneTakeoff className="w-3.5 h-3.5 text-sky-400" />
                  Model Pipeline Inputs
                </h4>
                <ul className="space-y-1.5 pl-1">
                  {selectedFeature.inputs.map((inp, idx) => (
                    <li key={idx} className="text-xs text-slate-400 flex gap-2">
                      <span className="text-sky-500">•</span>
                      <span>{inp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Structured JSON Output
                </h4>
                <div className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-900 overflow-x-auto leading-relaxed">
                  {selectedFeature.output}
                </div>
              </div>
            </div>

            {/* Pipeline Execution */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5 text-indigo-400" />
                Processing Pipeline Nodes
              </h4>
              <div className="space-y-3 pl-1">
                {selectedFeature.pipeline.map((step, idx) => (
                  <div key={idx} className="flex gap-3 items-start text-xs leading-relaxed">
                    <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-indigo-400 shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-400">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ML, Data, and Improvements */}
          <div className="border-t border-slate-800/80 pt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/25 border border-slate-900 rounded-xl p-4 space-y-2">
              <h5 className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wide">
                Machine Learning Opportunities
              </h5>
              <ul className="space-y-2">
                {selectedFeature.mlOpportunities.map((ml, idx) => (
                  <li key={idx} className="text-[11px] text-slate-400 leading-relaxed flex gap-1.5">
                    <span className="text-sky-500 shrink-0">•</span>
                    <span>{ml}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950/25 border border-slate-900 rounded-xl p-4 space-y-2">
              <h5 className="text-[10px] font-mono font-bold text-emerald-400/90 uppercase tracking-wide">
                Underlying Data Requirements
              </h5>
              <ul className="space-y-2">
                {selectedFeature.dataRequirements.map((data, idx) => (
                  <li key={idx} className="text-[11px] text-slate-400 leading-relaxed flex gap-1.5">
                    <span className="text-emerald-500 shrink-0">•</span>
                    <span>{data}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950/25 border border-slate-900 rounded-xl p-4 space-y-2">
              <h5 className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wide">
                Future Platform Improvements
              </h5>
              <ul className="space-y-2">
                {selectedFeature.futureImprovements.map((imp, idx) => (
                  <li key={idx} className="text-[11px] text-slate-400 leading-relaxed flex gap-1.5">
                    <span className="text-indigo-500 shrink-0">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
