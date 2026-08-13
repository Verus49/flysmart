import React, { useState, useMemo } from "react";
import { 
  Search, 
  Calendar, 
  MapPin, 
  SlidersHorizontal, 
  TrendingUp, 
  Sparkles, 
  ChevronDown, 
  ArrowRightLeft, 
  Compass, 
  Clock, 
  Check, 
  AlertCircle, 
  Bell, 
  User, 
  Languages, 
  ArrowRight,
  Plane,
  X,
  CloudSun,
  Shield,
  HelpCircle,
  Menu,
  Terminal,
  ExternalLink,
  ChevronRight,
  Info,
  Activity
} from "lucide-react";

// --- FLIGHT DATABASE ---
const FLIGHT_ROUTES = [
  { id: "f1", carrier: "Delta Air Lines", logo: "DL", code: "DL-402", from: "New York (JFK)", to: "London (LHR)", price: 420, originalPrice: 650, duration: "7h 15m", stops: "Non-stop", confidence: "94% Buy Now", score: 9.2, type: "cheapest", trend: "decreasing" },
  { id: "f2", carrier: "Delta Air Lines", logo: "DL", code: "DL-110", from: "New York (JFK)", to: "Paris (CDG)", price: 380, originalPrice: 510, duration: "7h 40m", stops: "Non-stop", confidence: "92% Buy Now", score: 9.5, type: "cheapest", trend: "decreasing" },
  { id: "f3", carrier: "United Airlines", logo: "UA", code: "UA-903", from: "New York (JFK)", to: "Tokyo (HND)", price: 810, originalPrice: 1120, duration: "14h 10m", stops: "Non-stop", confidence: "89% Buy Now", score: 8.9, type: "recommended", trend: "stable" },
  { id: "f4", carrier: "Emirates", logo: "EK", code: "EK-201", from: "New York (JFK)", to: "Dubai (DXB)", price: 690, originalPrice: 940, duration: "12h 30m", stops: "Non-stop", confidence: "86% Wait 4 Days", score: 8.7, type: "recommended", trend: "increasing" },
  { id: "f5", carrier: "Japan Airlines", logo: "JL", code: "JL-005", from: "New York (JFK)", to: "Tokyo (HND)", price: 950, originalPrice: 1250, duration: "14h 05m", stops: "Non-stop", confidence: "95% Buy Now", score: 9.8, type: "premium", trend: "decreasing" },
  { id: "f6", carrier: "British Airways", logo: "BA", code: "BA-178", from: "New York (JFK)", to: "London (LHR)", price: 460, originalPrice: 580, duration: "7h 20m", stops: "Non-stop", confidence: "91% Buy Now", score: 9.0, type: "cheapest", trend: "decreasing" },
  { id: "f7", carrier: "Air France", logo: "AF", code: "AF-015", from: "New York (JFK)", to: "Paris (CDG)", price: 395, originalPrice: 480, duration: "7h 55m", stops: "Non-stop", confidence: "88% Buy Now", score: 9.1, type: "cheapest", trend: "stable" },
  { id: "f8", carrier: "United Airlines", logo: "UA", code: "UA-121", from: "New York (JFK)", to: "Barcelona (BCN)", price: 350, originalPrice: 590, duration: "8h 15m", stops: "1 Stop", confidence: "96% Buy Now", score: 9.4, type: "cheapest", trend: "decreasing" },
  { id: "f9", carrier: "Emirates", logo: "EK", code: "EK-318", from: "New York (JFK)", to: "Sydney (SYD)", price: 1190, originalPrice: 1480, duration: "21h 35m", stops: "1 Stop", confidence: "74% Wait 9 Days", score: 8.4, type: "recommended", trend: "increasing" },
  { id: "f10", carrier: "Air France", logo: "AF", code: "AF-291", from: "New York (JFK)", to: "Barcelona (BCN)", price: 410, originalPrice: 520, duration: "8h 30m", stops: "Non-stop", confidence: "90% Buy Now", score: 9.3, type: "recommended", trend: "decreasing" },
];

const TRENDING_DESTINATIONS = [
  { id: "d1", city: "London", country: "United Kingdom", price: 420, img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80", bestMonth: "September", trend: "Decreasing", movement: "Save up to $150", score: "94%" },
  { id: "d2", city: "Tokyo", country: "Japan", price: 810, img: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80", bestMonth: "November", trend: "Highly Volatile", movement: "Book now, price rising", score: "88%" },
  { id: "d3", city: "Paris", country: "France", price: 380, img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80", bestMonth: "October", trend: "Decreasing", movement: "Save $90 next week", score: "92%" },
  { id: "d4", city: "Dubai", country: "United Arab Emirates", price: 690, img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80", bestMonth: "January", trend: "Stable", movement: "Ideal historic average", score: "87%" },
  { id: "d5", city: "Barcelona", country: "Spain", price: 350, img: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80", bestMonth: "May", trend: "Decreasing", movement: "Save up to $210", score: "96%" },
  { id: "d6", city: "Sydney", country: "Australia", price: 1190, img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80", bestMonth: "February", trend: "Increasing", movement: "Rising next week", score: "74%" }
];

const POPULAR_AIRLINES = [
  { name: "Delta Air Lines", reliability: "98.4%", delay: "4.2m", baggage: "Included (1 Carry-on)", cabin: "A++ (Excellent)", priceCompetitiveness: "Highly Competitive", active: true },
  { name: "United Airlines", reliability: "96.1%", delay: "8.5m", baggage: "Fee for basic economy", cabin: "A (Premium)", priceCompetitiveness: "Competitive", active: true },
  { name: "Air France", reliability: "97.5%", delay: "5.1m", baggage: "Included", cabin: "A+ (Premium Chef)", priceCompetitiveness: "Highly Competitive", active: true },
  { name: "Emirates", reliability: "99.1%", delay: "2.8m", baggage: "Included (30kg)", cabin: "S (World Class)", priceCompetitiveness: "Premium Choice", active: true },
  { name: "Japan Airlines", reliability: "99.3%", delay: "1.5m", baggage: "2 Checked Bags", cabin: "S (Unmatched Comfort)", priceCompetitiveness: "Premium Choice", active: true },
  { name: "British Airways", reliability: "95.8%", delay: "9.2m", baggage: "1 Carry-on", cabin: "A (Excellent)", priceCompetitiveness: "Competitive", active: true },
];

interface FlyBetterLandingPageProps {
  onSwitchToDeveloperTab: () => void;
  onSwitchToHealthTab?: () => void;
}

export default function FlyBetterLandingPage({ onSwitchToDeveloperTab, onSwitchToHealthTab }: FlyBetterLandingPageProps) {
  // --- STATE ---
  const [origin, setOrigin] = useState("New York (JFK)");
  const [destination, setDestination] = useState("Paris (CDG)");
  const [tripType, setTripType] = useState<"round" | "one-way" | "multi">("round");
  
  // Dynamic Inline Calendar state
  const [departDate, setDepartDate] = useState("May 20, 2026");
  const [returnDate, setReturnDate] = useState("May 28, 2026");
  const [showDepartCalendar, setShowDepartCalendar] = useState(false);
  const [showReturnCalendar, setShowReturnCalendar] = useState(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(20);
  const [selectedReturnDay, setSelectedReturnDay] = useState<number>(28);

  // Filters State
  const [maxPrice, setMaxPrice] = useState<number>(1200);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [stopsFilter, setStopsFilter] = useState<string>("Any");
  const [cabinClass, setCabinClass] = useState<string>("Economy");
  const [travelersCount, setTravelersCount] = useState<number>(1);
  const [showTravelerDropdown, setShowTravelerDropdown] = useState(false);

  // Search Results
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Notification popup state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);

  // Language selector
  const [currentLang, setCurrentLang] = useState("EN");
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Custom User Account menu
  const [accountOpen, setAccountOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(true);

  // AI Prompt search helper
  const [aiPrompt, setAiPrompt] = useState("");

  // Quick prompt presets
  const aiPrompts = [
    { text: "Find somewhere warm under $500 next month.", targetDest: "Barcelona (BCN)", priceLimit: 500 },
    { text: "Fly me to Japan in autumn with the absolute lowest delay.", targetDest: "Tokyo (HND)", priceLimit: 1000 },
    { text: "Weekend getaway to Europe with highest reliability score.", targetDest: "London (LHR)", priceLimit: 450 },
  ];

  const handleApplyAiPrompt = (promptText: string, targetDest: string, priceLimit: number) => {
    setAiPrompt(promptText);
    setDestination(targetDest);
    setMaxPrice(priceLimit);
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 600);
  };

  const handleToggleAirline = (name: string) => {
    if (selectedAirlines.includes(name)) {
      setSelectedAirlines(selectedAirlines.filter(a => a !== name));
    } else {
      setSelectedAirlines([...selectedAirlines, name]);
    }
  };

  const handleSelectDestination = (city: string) => {
    const routeObj = FLIGHT_ROUTES.find(r => r.to.includes(city));
    if (routeObj) {
      setDestination(routeObj.to);
      window.scrollTo({ top: document.getElementById("search-component")?.offsetTop || 100, behavior: "smooth" });
    }
  };

  // Filtered flights based on origin, destination, maxPrice, airline checkboxes, and stops
  const filteredFlights = useMemo(() => {
    return FLIGHT_ROUTES.filter(flight => {
      // Destination filter
      if (destination && !flight.to.toLowerCase().includes(destination.split(" ")[0].toLowerCase())) {
        return false;
      }
      // Origin filter
      if (origin && !flight.from.toLowerCase().includes(origin.split(" ")[0].toLowerCase())) {
        return false;
      }
      // Price range
      if (flight.price > maxPrice) {
        return false;
      }
      // Airline filter
      if (selectedAirlines.length > 0 && !selectedAirlines.includes(flight.carrier)) {
        return false;
      }
      // Stops filter
      if (stopsFilter !== "Any") {
        if (stopsFilter === "Non-stop" && flight.stops !== "Non-stop") return false;
        if (stopsFilter === "1 Stop" && flight.stops !== "1 Stop") return false;
      }
      return true;
    });
  }, [origin, destination, maxPrice, selectedAirlines, stopsFilter]);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans leading-normal selection:bg-slate-100 selection:text-slate-950">
      
      {/* 1. ARCHITECT BANNER FOR DEVELOPER REVIEWS */}
      <div className="bg-slate-950 text-slate-100 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-b border-slate-800 tracking-wide font-mono relative z-50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
          <span>
            <strong className="text-emerald-400">STAFF ARCHITECT NOTICE:</strong> Redesigning end-user landing page. Complex server frameworks and microservices are nested inside the secondary developer core.
          </span>
        </div>
        <button 
          onClick={onSwitchToDeveloperTab}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all text-[11px] cursor-pointer shadow-md shadow-emerald-950"
        >
          <span>Switch to Backend Systems Blueprint Console</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. STICKY NAVIGATION BAR */}
      <nav className="sticky top-0 bg-white/95 border-b border-slate-100 z-40 px-6 py-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <Plane className="w-6 h-6 text-slate-950 rotate-45 stroke-[2.5]" />
            <span className="text-xl font-black tracking-tighter text-slate-950">FlyBetter</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-bold uppercase ml-1">
              v2.8 REDESIGN
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 tracking-tight">
            <a href="#search-component" className="hover:text-slate-950 transition-colors">Flights</a>
            <a href="#trending-destinations" className="hover:text-slate-950 transition-colors">Destinations</a>
            <a href="#ai-search-anchor" className="hover:text-slate-950 transition-colors">Find Your Best Flight</a>
            <a href="#upcoming-trips" className="hover:text-slate-950 transition-colors">Upcoming Trips</a>
            <a href="#popular-airlines" className="hover:text-slate-950 transition-colors">Companies</a>
            {onSwitchToHealthTab && (
              <button 
                onClick={onSwitchToHealthTab}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold border border-emerald-200 transition-all cursor-pointer shadow-sm"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>System Health</span>
              </button>
            )}
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-3">
            
            {/* Search toggler */}
            <button className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition-all" title="Search">
              <Search className="w-4 h-4" />
            </button>

            {/* Notification triggers */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition-all relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-slate-950 rounded-full"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                    <span className="font-bold text-slate-950">Dynamic Alerts</span>
                    <button onClick={() => setNotificationsOpen(false)} className="text-slate-400 hover:text-slate-950">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-3 py-1">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        <span>Error Fare Alert</span>
                      </div>
                      <p className="text-slate-500 text-[10px] mt-0.5">JFK to LHR Premium Economy glitch found: $210</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                        <span>Price Movement Predictor</span>
                      </div>
                      <p className="text-slate-500 text-[10px] mt-0.5">Your tracked Paris leg has dropped by $45.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
                title="Language"
              >
                <Languages className="w-4 h-4" />
                <span>{currentLang}</span>
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-24 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 text-xs">
                  {["EN", "ES", "FR", "DE", "JA"].map((lang) => (
                    <button 
                      key={lang}
                      onClick={() => {
                        setCurrentLang(lang);
                        setLangMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                    >
                      {lang === "EN" ? "English" : lang === "ES" ? "Español" : lang === "FR" ? "Français" : lang === "DE" ? "Deutsch" : "日本語"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Placeholder (FlyBetter style remains bright white always) */}
            <div className="w-px h-5 bg-slate-100 mx-1"></div>

            {/* User Account Login */}
            <div className="relative">
              <button 
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer text-slate-950"
              >
                <User className="w-3.5 h-3.5" />
                <span>My Account</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 z-50 text-xs">
                  <div className="p-2 border-b border-slate-100 mb-2">
                    <p className="font-bold text-slate-900">Alex Rivera</p>
                    <p className="text-[10px] text-slate-500">alex.rivera@enterprise.com</p>
                  </div>
                  <div className="space-y-1">
                    <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 font-semibold text-slate-700">Passenger Console</button>
                    <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 font-semibold text-slate-700">Dynamic Alerts Settings</button>
                    <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 font-semibold text-slate-700">Saved Deal Watchlists</button>
                    <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 font-semibold text-slate-700">Company Portal Integration</button>
                    <hr className="border-slate-100 my-1" />
                    {onSwitchToHealthTab && (
                      <button onClick={onSwitchToHealthTab} className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        <span>System Health Dashboard</span>
                      </button>
                    )}
                    <button onClick={onSwitchToDeveloperTab} className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Developer Console</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <section className="bg-white py-16 md:py-24 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center px-6 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[11px] font-semibold text-slate-950 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-slate-950 shrink-0" />
            <span>Next-Generation Predictive Airfare Engine</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-950 leading-[1.05]">
            Find smarter flights,<br />
            not just cheaper ones.
          </h1>
          
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            Search millions of flights with zero GDS inventory markup. Predict future pricing trends with 94% accuracy. Discover hidden ticketing anomalies.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <a 
              href="#search-component"
              className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-sm shadow-slate-200 cursor-pointer flex items-center gap-1.5"
            >
              <span>Start Searching</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a 
              href="#trending-destinations"
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-sm px-6 py-3 rounded-xl transition-all cursor-pointer"
            >
              Explore Destinations
            </a>
          </div>
        </div>
      </section>

      {/* 4. UNIVERSAL FLIGHT SEARCH component */}
      <section id="search-component" className="py-12 bg-white border-b border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Main search box container */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
              
              {/* Trip type selector */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setTripType("round")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tripType === "round" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-950"}`}
                >
                  Round trip
                </button>
                <button 
                  onClick={() => setTripType("one-way")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tripType === "one-way" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-950"}`}
                >
                  One way
                </button>
                <button 
                  onClick={() => setTripType("multi")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tripType === "multi" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-950"}`}
                >
                  Multi-city
                </button>
              </div>

              {/* Cabin class selector */}
              <div className="flex items-center gap-3">
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                  {["Economy", "Business", "First"].map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setCabinClass(cls)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${cabinClass === cls ? "bg-white text-slate-950 border border-slate-200" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>

                {/* Travelers dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowTravelerDropdown(!showTravelerDropdown)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700"
                  >
                    <span>{travelersCount} Traveler{travelersCount > 1 ? "s" : ""}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>

                  {showTravelerDropdown && (
                    <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 pb-2 mb-2 border-b border-slate-100">
                        <span>Passenger count</span>
                        <span className="font-mono bg-slate-50 px-2 py-0.5 border rounded">{travelersCount}</span>
                      </div>
                      <div className="flex justify-between gap-1">
                        <button 
                          onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))}
                          className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-1 rounded font-bold"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => setTravelersCount(Math.min(9, travelersCount + 1))}
                          className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-1 rounded font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Origin */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Origin Airport</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <select 
                    value={origin} 
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-xs font-bold text-slate-950 focus:outline-none focus:border-slate-400 appearance-none"
                  >
                    <option value="New York (JFK)">New York (JFK)</option>
                    <option value="London (LHR)">London (LHR)</option>
                    <option value="Paris (CDG)">Paris (CDG)</option>
                    <option value="Tokyo (HND)">Tokyo (HND)</option>
                    <option value="Dubai (DXB)">Dubai (DXB)</option>
                    <option value="Barcelona (BCN)">Barcelona (BCN)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-4 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Interchanger button */}
              <div className="md:col-span-1 flex justify-center pt-5">
                <button 
                  onClick={() => {
                    const temp = origin;
                    setOrigin(destination);
                    setDestination(temp);
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all text-slate-600 hover:text-slate-950"
                  title="Swap Origin and Destination"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 rotate-90 md:rotate-0" />
                </button>
              </div>

              {/* Destination */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Destination Airport</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <select 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-xs font-bold text-slate-950 focus:outline-none focus:border-slate-400 appearance-none"
                  >
                    <option value="Paris (CDG)">Paris (CDG)</option>
                    <option value="London (LHR)">London (LHR)</option>
                    <option value="Tokyo (HND)">Tokyo (HND)</option>
                    <option value="Dubai (DXB)">Dubai (DXB)</option>
                    <option value="Barcelona (BCN)">Barcelona (BCN)</option>
                    <option value="Sydney (SYD)">Sydney (SYD)</option>
                    <option value="New York (JFK)">New York (JFK)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-4 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Depart Date with Calendar dropdown */}
              <div className="md:col-span-2.5 space-y-1.5 relative">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Depart Date</label>
                <button 
                  onClick={() => {
                    setShowDepartCalendar(!showDepartCalendar);
                    setShowReturnCalendar(false);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-bold text-slate-950 hover:bg-slate-50 transition-all flex items-center justify-between text-left"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{departDate}</span>
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showDepartCalendar && (
                  <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50">
                    <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100 text-xs">
                      <span className="font-bold text-slate-900">May 2026</span>
                      <button onClick={() => setShowDepartCalendar(false)} className="text-slate-400 hover:text-slate-900">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Minimal Grid representing month days */}
                    <div className="grid grid-cols-7 gap-1 text-[10px] text-center text-slate-400 font-mono mb-2">
                      <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {Array.from({ length: 31 }, (_, i) => {
                        const day = i + 1;
                        const isSelected = day === selectedCalendarDay;
                        return (
                          <button 
                            key={day}
                            onClick={() => {
                              setSelectedCalendarDay(day);
                              setDepartDate(`May ${day}, 2026`);
                              setShowDepartCalendar(false);
                            }}
                            className={`p-1 rounded font-semibold transition-all ${isSelected ? "bg-slate-950 text-white font-bold" : "hover:bg-slate-100 text-slate-700"}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Return Date with Calendar dropdown */}
              <div className="md:col-span-2.5 space-y-1.5 relative">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Return Date</label>
                <button 
                  onClick={() => {
                    setShowReturnCalendar(!showReturnCalendar);
                    setShowDepartCalendar(false);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-bold text-slate-950 hover:bg-slate-50 transition-all flex items-center justify-between text-left"
                  disabled={tripType === "one-way"}
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{tripType === "one-way" ? "N/A" : returnDate}</span>
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showReturnCalendar && tripType !== "one-way" && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50">
                    <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100 text-xs">
                      <span className="font-bold text-slate-900">May 2026</span>
                      <button onClick={() => setShowReturnCalendar(false)} className="text-slate-400 hover:text-slate-900">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Minimal Grid representing month days */}
                    <div className="grid grid-cols-7 gap-1 text-[10px] text-center text-slate-400 font-mono mb-2">
                      <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {Array.from({ length: 31 }, (_, i) => {
                        const day = i + 1;
                        const isSelected = day === selectedReturnDay;
                        const isDisabled = day < selectedCalendarDay;
                        return (
                          <button 
                            key={day}
                            disabled={isDisabled}
                            onClick={() => {
                              setSelectedReturnDay(day);
                              setReturnDate(`May ${day}, 2026`);
                              setShowReturnCalendar(false);
                            }}
                            className={`p-1 rounded font-semibold transition-all ${isDisabled ? "text-slate-200 cursor-not-allowed" : isSelected ? "bg-slate-950 text-white font-bold" : "hover:bg-slate-100 text-slate-700"}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Price Filter Slider & Stops Selection Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              
              {/* Draggable Price Filter */}
              <div className="md:col-span-4 space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span>Price threshold limit:</span>
                  <span className="font-mono text-slate-950">${maxPrice}</span>
                </div>
                <input 
                  type="range" 
                  min="300" 
                  max="1500" 
                  step="50"
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-slate-950 cursor-ew-resize bg-slate-200 h-1.5 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                  <span>$300 min</span>
                  <span>$900 target</span>
                  <span>$1,500 max</span>
                </div>
              </div>

              {/* Stops Filter */}
              <div className="md:col-span-3 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Max Stops</span>
                <div className="flex items-center gap-1.5">
                  {["Any", "Non-stop", "1 Stop"].map((stp) => (
                    <button
                      key={stp}
                      onClick={() => setStopsFilter(stp)}
                      className={`flex-1 text-[11px] font-bold py-1 px-2.5 rounded-lg border transition-all ${stopsFilter === stp ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}
                    >
                      {stp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Airline filter checkboxes */}
              <div className="md:col-span-5 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Filter by Company / Carrier</span>
                <div className="flex flex-wrap gap-2">
                  {["Delta Air Lines", "United Airlines", "Air France", "Emirates", "Japan Airlines"].map((airline) => {
                    const isChecked = selectedAirlines.includes(airline);
                    return (
                      <button
                        key={airline}
                        onClick={() => handleToggleAirline(airline)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${isChecked ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[2.5]" />}
                        <span>{airline.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* AI Sparkle Prompt Search box */}
            <div id="ai-search-anchor" className="border-t border-slate-100 pt-5 space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-slate-950 shrink-0 animate-pulse" />
                <span>AI Search Engine (Copilot Input)</span>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask in natural language (e.g. 'Find me somewhere warm under $500 next month...')"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-16 py-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-450 font-medium font-sans"
                />
                <button 
                  onClick={() => {
                    if (aiPrompt.toLowerCase().includes("warm") || aiPrompt.toLowerCase().includes("under")) {
                      handleApplyAiPrompt(aiPrompt, "Barcelona (BCN)", 500);
                    } else if (aiPrompt.toLowerCase().includes("japan") || aiPrompt.toLowerCase().includes("tokyo")) {
                      handleApplyAiPrompt(aiPrompt, "Tokyo (HND)", 1000);
                    } else {
                      setIsSearching(true);
                      setTimeout(() => setIsSearching(false), 500);
                    }
                  }}
                  className="absolute right-2 top-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Search className="w-3 h-3" />
                  <span>Run</span>
                </button>
              </div>

              {/* Sample AI prompt triggers */}
              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                <span className="text-slate-400 font-mono">Sample prompts:</span>
                {aiPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyAiPrompt(p.text, p.targetDest, p.priceLimit)}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg text-slate-600 transition-colors cursor-pointer text-[10px] font-medium"
                  >
                    "{p.text}"
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Search Result display container */}
          {hasSearched && (
            <div className="mt-8 space-y-4">
              
              {/* Header metrics */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-950 tracking-tight">
                    Dynamic Search Results
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Showing {filteredFlights.length} predictive options • Optimized for delay rate and baggage costs.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase">
                  <span>94.2% ML Confidence Rating</span>
                </div>
              </div>

              {/* Results Grid / List */}
              {isSearching ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <div className="w-6 h-6 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Querying Global Flight Cache...</p>
                </div>
              ) : filteredFlights.length === 0 ? (
                <div className="py-16 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-900">No flight matches found within your filters</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try increasing the price slider threshold (currently ${maxPrice}) or removing the carrier filters to see all available inventory.
                  </p>
                  <button 
                    onClick={() => {
                      setMaxPrice(1200);
                      setSelectedAirlines([]);
                      setStopsFilter("Any");
                      setDestination("Paris (CDG)");
                      setOrigin("New York (JFK)");
                    }}
                    className="mt-4 bg-slate-950 text-white font-bold text-xs px-4 py-2 rounded-lg"
                  >
                    Reset Search Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFlights.map((flight) => (
                    <div 
                      key={flight.id} 
                      className="bg-white border border-slate-200 hover:border-slate-400 transition-all rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200/60 uppercase">
                              {flight.code}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{flight.carrier}</span>
                          </div>
                          <div className="text-lg font-black text-slate-950 tracking-tight mt-1.5">
                            {flight.from} <span className="text-slate-400 font-normal">→</span> {flight.to}
                          </div>
                        </div>

                        {/* Recommendation badge */}
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                          flight.trend === "decreasing" 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                            : flight.trend === "stable"
                            ? "bg-slate-50 text-slate-700 border-slate-200"
                            : "bg-amber-50 text-amber-800 border-amber-100"
                        }`}>
                          {flight.confidence}
                        </span>
                      </div>

                      {/* Flight Details block */}
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{flight.duration}</span>
                        </div>
                        <div>
                          <span>{flight.stops}</span>
                        </div>
                        <div className="font-mono text-slate-650">
                          <span>Quality score: {flight.score}/10</span>
                        </div>
                      </div>

                      {/* Price & Book now action */}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-black text-slate-950 font-mono">${flight.price}</span>
                            <span className="text-xs text-slate-400 font-mono line-through">${flight.originalPrice}</span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-500">Uncompressed fare basis</p>
                        </div>

                        <button 
                          onClick={() => {
                            alert(`Booking Simulated successfully!\nRoute: ${flight.from} to ${flight.to}\nCarrier: ${flight.carrier}\nFare: $${flight.price}\n\nThis confirms Layer-1 presentation successfully hands off parameters to Layer-2 APIs.`);
                          }}
                          className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          Book Smart Fare
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>
      </section>

      {/* 5. TRENDING DESTINATIONS SECTION */}
      <section id="trending-destinations" className="py-16 bg-white border-b border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Trending Destinations
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Real-time geo-arbitrage routes monitored across our globally distributed indexing servers.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-950 hover:underline cursor-pointer flex items-center gap-1">
              <span>View all 148 tracked cities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRENDING_DESTINATIONS.map((dest) => (
              <div 
                key={dest.id}
                className="group border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-slate-400 transition-all flex flex-col justify-between"
              >
                {/* Destination Image (with referrer policy protection) */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img 
                    src={dest.img} 
                    alt={dest.city}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-slate-200/60 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-slate-950 uppercase">
                    Best: {dest.bestMonth}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-950 tracking-tight">{dest.city}</h3>
                      <p className="text-xs text-slate-500 font-semibold">{dest.country}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-mono font-semibold">Average Fare</p>
                      <p className="text-lg font-black text-slate-950 font-mono">${dest.price}</p>
                    </div>
                  </div>

                  {/* Trend Indicator details */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-xs font-semibold space-y-1.5 text-slate-600">
                    <div className="flex justify-between">
                      <span>Price trend direction:</span>
                      <strong className={`font-mono font-extrabold ${dest.trend === "Decreasing" ? "text-emerald-700" : dest.trend === "Stable" ? "text-slate-700" : "text-amber-700"}`}>
                        {dest.trend}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected action:</span>
                      <span className="text-slate-950 font-bold">{dest.movement}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectDestination(dest.city)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    <span>Inspect Cheap Flights</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. FLIGHT INTELLIGENCE SPECIFIC CARDS */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          
          <div className="max-w-2xl space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Flight Intelligence Features
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              We replace standard seat-brokering gimmicks with actual, high-performance data engineering metrics.
            </p>
          </div>

          {/* Grid of cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm hover:border-slate-400 transition-all">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-950 border border-slate-200">
                <TrendingUp className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-950">AI Price Prediction</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Our ML forecasting neural networks parse GDS historical charts, predicting fare fluctuations with a audited 94.2% precision metric.
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm hover:border-slate-400 transition-all">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-950 border border-slate-200">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-bold text-slate-950">Buy or Wait Recommendation</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Instantly compute whether you should purchase now or hold back. Our dynamic recommendation gauge helps you capture price troughs safely.
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm hover:border-slate-400 transition-all">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-950 border border-slate-200">
                <Compass className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-950">Hidden City Routing</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Leverage geographical pricing discrepancies by booking multi-segment itineraries with hidden layover terminations, saving up to 45%.
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm hover:border-slate-400 transition-all">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-950 border border-slate-200">
                <AlertCircle className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-950">Automated Error Fares</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Scans pricing feeds globally to discover immediate database input mistakes and airline price glitches before carriers flag and modify them.
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm hover:border-slate-400 transition-all">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-950 border border-slate-200">
                <Calendar className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-950">Flexible Date Multi-Axis</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Generate dynamic 30-day matrix queries displaying complete horizontal pricing grids, mapping ideal departures of optimal pricing.
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm hover:border-slate-400 transition-all">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-950 border border-slate-200">
                <MapPin className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-950">Nearby Aerodrome Savings</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Computes alternative routes using secondary regional runways, integrating train or public connection costs into your total travel budget.
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm hover:border-slate-400 transition-all">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-950 border border-slate-200">
                <Clock className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-950">Historical Fare Tracking</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Inspect actual recorded fare trends on any route over a rolling 5-year log, understanding seasonal fluctuations and base costs.
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm hover:border-slate-400 transition-all">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-950 border border-slate-200">
                <Bell className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-950">Slack & Custom Webhooks</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Establish robust programmatic alert triggers dispatching instant notifications directly to Slack or webhook APIs on drop parameters.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 7. UPCOMING TRIPS TIMELINE SECTION (IF LOGGED IN) */}
      <section id="upcoming-trips" className="py-16 bg-white border-b border-slate-100 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                Logged In Session Active
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Your Upcoming Itineraries
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500 font-mono uppercase">
              Current User: Alex Rivera
            </span>
          </div>

          {/* Timeline track */}
          <div className="relative border-l border-slate-200 pl-6 ml-4 space-y-12">
            
            {/* Timeline node 1 */}
            <div className="relative space-y-3">
              {/* Timeline bubble bullet */}
              <div className="absolute -left-[31px] top-1 w-4 h-4 bg-slate-950 border-2 border-white rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border font-bold">
                    NEXT MONTH
                  </span>
                  <h3 className="text-lg font-black text-slate-950 tracking-tight mt-1">Paris (CDG) Getaway</h3>
                </div>
                <div className="text-xs font-bold font-mono text-slate-500">
                  Departure: May 20, 2026 (In 12 Days)
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs font-semibold">
                <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Flight Status</span>
                  <strong className="text-emerald-700 font-bold block mt-0.5">On Time • Gate K34</strong>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Delta DL-110</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Destination Climate</span>
                  <strong className="text-slate-900 block mt-0.5 flex items-center gap-1">
                    <CloudSun className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>22°C • Partly Cloudy</span>
                  </strong>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Spring light breeze</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Booking Reference</span>
                  <strong className="text-slate-950 block mt-0.5 font-mono">B-1021-X29</strong>
                  <span className="text-[9px] text-slate-400 block mt-0.5">1 Pass • Economy Main</span>
                </div>
              </div>
            </div>

            {/* Timeline node 2 */}
            <div className="relative space-y-3">
              {/* Timeline bubble bullet */}
              <div className="absolute -left-[31px] top-1 w-4 h-4 bg-slate-200 border-2 border-white rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border font-bold">
                    IN 3 MONTHS
                  </span>
                  <h3 className="text-lg font-black text-slate-950 tracking-tight mt-1">Tokyo (HND) Autumn Session</h3>
                </div>
                <div className="text-xs font-bold font-mono text-slate-500">
                  Departure: Sept 12, 2026 (In 76 Days)
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs font-semibold">
                <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Flight Status</span>
                  <strong className="text-slate-500 block mt-0.5">Schedule Pending</strong>
                  <span className="text-[9px] text-slate-400 block mt-0.5">United UA-903</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Destination Climate</span>
                  <strong className="text-slate-900 block mt-0.5">19°C • Clear</strong>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Historic Autumn Average</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Booking Reference</span>
                  <strong className="text-slate-950 block mt-0.5 font-mono">B-8831-U05</strong>
                  <span className="text-[9px] text-slate-400 block mt-0.5">1 Pass • Business Upgrade</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 8. POPULAR AIRLINES COMPANIES GRID */}
      <section id="popular-airlines" className="py-16 bg-white border-b border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          
          <div className="max-w-2xl space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Airlines & Carrier Analytics
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              We audit airlines directly on delays, cabin baggage policies, and fare consistency to establish real value ratings.
            </p>
          </div>

          {/* Grid table representation */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 p-3.5 border-b border-slate-200 grid grid-cols-12 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              <span className="col-span-4 sm:col-span-3">Company Carrier</span>
              <span className="col-span-2 text-center">Reliability</span>
              <span className="col-span-2 text-center">Avg Delay</span>
              <span className="col-span-4 sm:col-span-3">Baggage Policy</span>
              <span className="hidden sm:block col-span-2 text-right">Cabin Quality</span>
            </div>
            
            <div className="divide-y divide-slate-150 text-xs font-semibold">
              {POPULAR_AIRLINES.map((airline) => (
                <div 
                  key={airline.name} 
                  className="p-4 grid grid-cols-12 items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="col-span-4 sm:col-span-3 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-950 text-white font-mono text-[10px] font-extrabold flex items-center justify-center">
                      {airline.name.substring(0, 2).toUpperCase()}
                    </span>
                    <strong className="text-slate-900">{airline.name}</strong>
                  </div>
                  <div className="col-span-2 text-center font-mono text-emerald-700 font-bold">
                    {airline.reliability}
                  </div>
                  <div className="col-span-2 text-center font-mono text-slate-700">
                    {airline.delay}
                  </div>
                  <div className="col-span-4 sm:col-span-3 text-slate-600">
                    {airline.baggage}
                  </div>
                  <div className="hidden sm:block col-span-2 text-right text-slate-900 font-bold">
                    {airline.cabin}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 9. TRAVEL INSIGHTS EDITORIAL CARDS */}
      <section id="travel-insights" className="py-16 bg-white border-b border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Travel Insights & Arbitrage Guides
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Our staff editors and automated algorithms catalog dynamic hacks on seasonal pricing anomalies.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-950 hover:underline cursor-pointer flex items-center gap-1">
              <span>Access full archives</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="border border-slate-200 rounded-2xl p-5 hover:border-slate-400 transition-all space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold">
                  SEASONAL RADAR
                </span>
                <h3 className="text-sm font-bold text-slate-950 leading-snug">
                  The Autumn Tokyo Arbitrage Window
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Dynamic analysis reveals flight tariffs drop by 34% immediately starting October 12, following the mid-year peak.
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-950 flex items-center gap-1 cursor-pointer hover:underline pt-2">
                <span>Read Analysis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5 hover:border-slate-400 transition-all space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold">
                  GEO-ARBITRAGE
                </span>
                <h3 className="text-sm font-bold text-slate-950 leading-snug">
                  Cheapest European Countries this Summer
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Spain and Portugal are showing optimal routing alternatives compared to heavy central-European nodes this cycle.
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-950 flex items-center gap-1 cursor-pointer hover:underline pt-2">
                <span>Read Analysis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5 hover:border-slate-400 transition-all space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold">
                  NOMAD MATRIX
                </span>
                <h3 className="text-sm font-bold text-slate-950 leading-snug">
                  Best Digital Nomad Hubs with sub-$300 legs
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  We compiled high-speed internet cities with optimized flight legs across various carrier networks.
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-950 flex items-center gap-1 cursor-pointer hover:underline pt-2">
                <span>Read Analysis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5 hover:border-slate-400 transition-all space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold">
                  AIRFARE SCIENCE
                </span>
                <h3 className="text-sm font-bold text-slate-950 leading-snug">
                  How dynamic algorithms price ticket segments
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  A high-fidelity deep dive explaining cookies, query surges, and browser telemetry manipulations.
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-950 flex items-center gap-1 cursor-pointer hover:underline pt-2">
                <span>Read Analysis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* 10. WHY CHOOSE US (COMPARISON TABLE) */}
      <section id="comparison-table" className="py-16 bg-white border-b border-slate-100 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Compare Platform Capabilities
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              We separate commercial flight agencies from dynamic SaaS aviation intelligence tools.
            </p>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="p-4">Feature Segment</th>
                  <th className="p-4 border-l border-slate-200">Traditional Sites</th>
                  <th className="p-4 border-l border-slate-200 bg-slate-950 text-white">FlyBetter Intelligence</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-150">
                <tr>
                  <td className="p-4 font-bold text-slate-950">GDS Query Markup</td>
                  <td className="p-4 border-l border-slate-200 text-slate-500">❌ Retains up to $45 extra basis points</td>
                  <td className="p-4 border-l border-slate-200 bg-slate-50/50 text-slate-950 font-extrabold">✅ Absolutely zero. True GDS pass-through</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-950">Price Predictions</td>
                  <td className="p-4 border-l border-slate-200 text-slate-500">❌ Static "price is high" tag without logs</td>
                  <td className="p-4 border-l border-slate-200 bg-slate-50/50 text-slate-950 font-extrabold">✅ 94.2% Audited neural network mapping</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-950">Hidden City Routing</td>
                  <td className="p-4 border-l border-slate-200 text-slate-500">❌ Suppressed to protect carrier contracts</td>
                  <td className="p-4 border-l border-slate-200 bg-slate-50/50 text-slate-950 font-extrabold">✅ Fully integrated multi-segment engine</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-950">Dynamic Alerts</td>
                  <td className="p-4 border-l border-slate-200 text-slate-500">❌ Spam emails prompting artificial urgency</td>
                  <td className="p-4 border-l border-slate-200 bg-slate-50/50 text-slate-950 font-extrabold">✅ Granular Slack integration & Webhook dispatches</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-950">Decision Support</td>
                  <td className="p-4 border-l border-slate-200 text-slate-500">❌ Limited to standard sorting dropdowns</td>
                  <td className="p-4 border-l border-slate-200 bg-slate-50/50 text-slate-950 font-extrabold">✅ Copilot query engines, custom risk factors</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* 11. DYNAMIC SYSTEM HEALTH & SEPARATION CONTEXT */}
      <section className="py-12 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl text-left">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-500 uppercase">
                <Shield className="w-4 h-4 text-slate-950" />
                <span>Boundary Isolation Proof</span>
              </div>
              <h3 className="text-lg font-black text-slate-950 tracking-tight">Decoupled Front-End Presentation Architecture</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                The visual components rendered above exist purely as a static, blazing-fast client presentation layer. State synchronization is orchestrated over structured type-safe JSON interfaces handshaking with our Kubernetes microservices mesh. Redesigning this UI will never affect deep database operations.
              </p>
            </div>
            <button 
              onClick={onSwitchToDeveloperTab}
              className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm shadow-slate-200"
            >
              <Terminal className="w-4 h-4" />
              <span>Inspect Backend Blueprint Maps</span>
            </button>
          </div>
        </div>
      </section>

      {/* 12. MINIMAL FOOTER */}
      <footer className="bg-white py-12 text-slate-500 text-xs font-semibold">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-slate-100 pb-10">
          
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <Plane className="w-5 h-5 text-slate-950 rotate-45 stroke-[2.5]" />
              <strong className="text-slate-900 text-base font-black tracking-tight">FlyBetter</strong>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              SaaS travel intelligence portal built for elite developers and performance travellers.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-[10px] font-mono text-slate-900 uppercase tracking-widest font-bold">Company</h4>
            <ul className="space-y-1.5 text-slate-500 text-[11px] font-medium">
              <li><a href="#" className="hover:text-slate-900">About Us</a></li>
              <li><a href="#" className="hover:text-slate-900">Premium Subscription</a></li>
              <li><a href="#" className="hover:text-slate-900">Enterprise Solutions</a></li>
              <li><a href="#" className="hover:text-slate-900">Partnership Hub</a></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-[10px] font-mono text-slate-900 uppercase tracking-widest font-bold">Developers</h4>
            <ul className="space-y-1.5 text-slate-500 text-[11px] font-medium">
              <li><a href="#" className="hover:text-slate-900">REST Airfare APIs</a></li>
              <li><a href="#" className="hover:text-slate-900">GraphQL Playground</a></li>
              <li><a href="#" className="hover:text-slate-900">Aviation Data Lake</a></li>
              <li><a href="#" className="hover:text-slate-900">System Status</a></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-[10px] font-mono text-slate-900 uppercase tracking-widest font-bold">Product</h4>
            <ul className="space-y-1.5 text-slate-500 text-[11px] font-medium">
              <li><a href="#" className="hover:text-slate-900">Price Prediction</a></li>
              <li><a href="#" className="hover:text-slate-900">Hidden Leg Hacks</a></li>
              <li><a href="#" className="hover:text-slate-900">Error Fare Feeds</a></li>
              <li><a href="#" className="hover:text-slate-900">SLA Dispatches</a></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-[10px] font-mono text-slate-900 uppercase tracking-widest font-bold">Contact</h4>
            <ul className="space-y-1.5 text-slate-500 text-[11px] font-medium">
              <li><a href="#" className="hover:text-slate-900">Support Desk</a></li>
              <li><a href="#" className="hover:text-slate-900">SLA Commitments</a></li>
              <li><a href="#" className="hover:text-slate-900">Corporate Portal</a></li>
              <li><a href="#" className="hover:text-slate-900">Chat with Architect</a></li>
            </ul>
          </div>

        </div>

        {/* Dynamic legal & status row */}
        <div className="max-w-7xl mx-auto px-6 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-slate-400">
          <span>© {new Date().getFullYear()} FlyBetter Technologies Inc. • Engineered with Decoupled Architecture</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Global API Mesh: Active</span>
            <span>Blueprints: Confid v2.8</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
