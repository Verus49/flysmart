import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Globe, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Database, 
  Search, 
  RefreshCw, 
  Sliders, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  Zap, 
  Languages, 
  CheckCircle2, 
  Trash2, 
  Layers, 
  Activity, 
  Info, 
  Terminal, 
  Layout, 
  UserCheck, 
  Accessibility, 
  Code, 
  Download, 
  History,
  TrendingUp,
  Cpu,
  CornerDownRight,
  Sparkles
} from "lucide-react";

// --- TYPES ---
type PlatformType = "nextjs" | "flutter";
type SubModuleType = "offline_sync" | "state_cache" | "search_scroll" | "a11y_i18n" | "performance" | "specs";

interface SimulatedBooking {
  id: string;
  flightNumber: string;
  passenger: string;
  destination: string;
  status: "optimistic_pending" | "synced" | "failed";
  timestamp: string;
  isOptimistic: boolean;
}

interface OutboxItem {
  id: string;
  type: string;
  payload: any;
  retryCount: number;
}

interface AnalyticsLog {
  id: string;
  event: string;
  params: string;
  timestamp: string;
}

// i18n Translation Dictionary
const TRANSLATIONS = {
  en: {
    dashboardTitle: "Enterprise Passenger Console",
    bookingButton: "Book Flight (Optimistic UI)",
    searchPlaceholder: "Search global routes (JFK, LHR, CDG...)",
    statusLabel: "System Status",
    online: "Online Cloud Mesh Active",
    offline: "Offline Cache Fallback Mode",
    activeBookings: "Active Dynamic Bookings",
    passenger: "Passenger",
    pending: "Pending Sync",
    synced: "Synced to GKE Mesh",
    loadMore: "Simulate Scroll (Load More)",
    resultsCount: "Viewing {count} of {total} routes"
  },
  es: {
    dashboardTitle: "Consola de Pasajeros de la Empresa",
    bookingButton: "Reservar Vuelo (IU Optimista)",
    searchPlaceholder: "Buscar rutas globales (JFK, LHR, CDG...)",
    statusLabel: "Estado del Sistema",
    online: "Red en la Nube Activa",
    offline: "Modo de Reserva de Caché Desconectado",
    activeBookings: "Reservas Dinámicas Activas",
    passenger: "Pasajero",
    pending: "Sincronización Pendiente",
    synced: "Sincronizado con GKE Mesh",
    loadMore: "Simular Desplazamiento (Cargar Más)",
    resultsCount: "Mostrando {count} de {total} rutas"
  },
  fr: {
    dashboardTitle: "Console Passagers Entreprise",
    bookingButton: "Réserver un vol (UI Optimiste)",
    searchPlaceholder: "Rechercher des liaisons (JFK, LHR, CDG...)",
    statusLabel: "État du Système",
    online: "Réseau Cloud Actif",
    offline: "Mode de Secours Hors-ligne",
    activeBookings: "Réservations Actives",
    passenger: "Passager",
    pending: "Sincronisation en attente",
    synced: "Synchronisé avec le Mesh GKE",
    loadMore: "Simuler le défilement (Charger plus)",
    resultsCount: "Affichage de {count} sur {total} liaisons"
  },
  de: {
    dashboardTitle: "Enterprise Passagier-Konsole",
    bookingButton: "Flug buchen (Optimistische UI)",
    searchPlaceholder: "Globale Routen suchen (JFK, LHR, CDG...)",
    statusLabel: "Systemstatus",
    online: "Online-Cloud-Mesh aktiv",
    offline: "Offline-Cache-Ausweichmodus",
    activeBookings: "Aktive dynamische Buchungen",
    passenger: "Passagier",
    pending: "Wartet auf Sync",
    synced: "Synchronisiert mit GKE Mesh",
    loadMore: "Scrollen simulieren (Mehr laden)",
    resultsCount: "Anzeige von {count} von {total} Routen"
  },
  ja: {
    dashboardTitle: "エンタープライズ旅客コンソール",
    bookingButton: "フライト予約 (楽観的UI)",
    searchPlaceholder: "グローバル路線を検索 (JFK, LHR, CDG...)",
    statusLabel: "システムステータス",
    online: "オンライン・クラウド・メッシュ稼働中",
    offline: "オフライン・キャッシュ・フォールバック",
    activeBookings: "有効な動的予約",
    passenger: "乗客",
    pending: "同期保留中",
    synced: "GKEメッシュに同期済み",
    loadMore: "スクロールをシミュレート (さらに読み込む)",
    resultsCount: "{total}件中{count}件の路線を表示中"
  }
};

export default function FrontendPlatformExplorer() {
  const [platform, setPlatform] = useState<PlatformType>("nextjs");
  const [subModule, setSubModule] = useState<SubModuleType>("offline_sync");

  // Global Simulator Settings
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [locale, setLocale] = useState<"en" | "es" | "fr" | "de" | "ja">("en");
  const [isA11ySimulated, setIsA11ySimulated] = useState<boolean>(false);
  
  // Custom states for Offline / Optimistic UI Simulator
  const [bookings, setBookings] = useState<SimulatedBooking[]>([
    { id: "B-1021", flightNumber: "FS-204", passenger: "Alex Rivera", destination: "London LHR", status: "synced", timestamp: "23:41:00", isOptimistic: false },
    { id: "B-1022", flightNumber: "FS-881", passenger: "Sarah Connor", destination: "Tokyo HND", status: "synced", timestamp: "23:42:15", isOptimistic: false }
  ]);
  const [outbox, setOutbox] = useState<OutboxItem[]>([]);
  
  // Analytics Log Engine
  const [analyticsLogs, setAnalyticsLogs] = useState<AnalyticsLog[]>([
    { id: "A-1", event: "app_initialized", params: JSON.stringify({ device: "Web-Desktop", platform: "NextJS-15", sw_status: "installed" }), timestamp: "23:40:01" }
  ]);

  // Infinite Scroll & Search Engine Simulator State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);
  const [debounceCount, setDebounceCount] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState<number>(3);
  const [totalRecords, setTotalRecords] = useState<number>(18);
  const [searchTriggerCount, setSearchTriggerCount] = useState<number>(0);
  
  // Simulated list of total routes
  const flightRoutes = useMemo(() => {
    return [
      { code: "FS-101", from: "JFK", to: "LHR", price: "$640", duration: "7h 15m", status: "On Time" },
      { code: "FS-202", from: "CDG", to: "HND", price: "$1,120", duration: "11h 40m", status: "Boarding" },
      { code: "FS-303", from: "DXB", to: "SIN", price: "$890", duration: "7h 35m", status: "Delayed" },
      { code: "FS-404", from: "SFO", to: "SYD", price: "$1,450", duration: "14h 50m", status: "On Time" },
      { code: "FS-505", from: "FRA", to: "ORD", price: "$720", duration: "8h 55m", status: "On Time" },
      { code: "FS-606", from: "LAX", to: "NRT", price: "$980", duration: "11h 10m", status: "On Time" },
      { code: "FS-707", from: "AMS", to: "CPT", price: "$1,050", duration: "11h 25m", status: "Delayed" },
      { code: "FS-808", from: "HKG", to: "LHR", price: "$870", duration: "12h 45m", status: "Boarding" },
      { code: "FS-909", from: "JFK", to: "CDG", price: "$580", duration: "6h 50m", status: "On Time" },
      { code: "FS-110", from: "SIN", to: "MEL", price: "$750", duration: "7h 20m", status: "On Time" },
      { code: "FS-111", from: "MAD", to: "MIA", price: "$680", duration: "9h 15m", status: "On Time" },
      { code: "FS-112", from: "IST", to: "JFK", price: "$910", duration: "10h 05m", status: "On Time" },
      { code: "FS-113", from: "HND", to: "SFO", price: "$1,190", duration: "9h 30m", status: "Boarding" },
      { code: "FS-114", from: "CDG", to: "DXB", price: "$810", duration: "6h 55m", status: "On Time" },
      { code: "FS-115", from: "LHR", to: "SIN", price: "$1,220", duration: "12h 40m", status: "On Time" },
      { code: "FS-116", from: "SFO", to: "CDG", price: "$850", duration: "10h 50m", status: "On Time" },
      { code: "FS-117", from: "ORD", to: "NRT", price: "$1,340", duration: "12h 15m", status: "On Time" },
      { code: "FS-118", from: "LHR", to: "LAX", price: "$790", duration: "11h 15m", status: "On Time" }
    ];
  }, []);

  // Filtered routes based on search query
  const filteredRoutes = useMemo(() => {
    if (!searchQuery) return flightRoutes;
    return flightRoutes.filter(
      r => r.from.toLowerCase().includes(searchQuery.toLowerCase()) || 
           r.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
           r.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, flightRoutes]);

  // Live simulation of debouncing
  useEffect(() => {
    if (!searchQuery) {
      setIsDebouncing(false);
      return;
    }
    
    setIsDebouncing(true);
    setDebounceCount(300); // 300ms countdown

    const timer = setTimeout(() => {
      setIsDebouncing(false);
      setDebounceCount(0);
      setSearchTriggerCount(prev => prev + 1);
      // Log Analytics Event
      pushAnalyticsEvent("search_query_entered", { query: searchQuery, results_found: filteredRoutes.length });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Trigger countdown ticks for debouncer visualization
  useEffect(() => {
    if (!isDebouncing) return;
    const tick = setInterval(() => {
      setDebounceCount(prev => Math.max(0, prev - 50));
    }, 50);
    return () => clearInterval(tick);
  }, [isDebouncing]);

  // Auto-Sync background loop when network is restored
  useEffect(() => {
    if (!isOnline || outbox.length === 0) return;

    // Simulate batch syncing items from queue
    const syncTimeout = setTimeout(() => {
      // Snyc the bookings in outbox to actual list
      setBookings(prev => {
        return prev.map(b => {
          const matchedInOutbox = outbox.find(o => o.payload.id === b.id);
          if (matchedInOutbox) {
            return { ...b, status: "synced", isOptimistic: false };
          }
          return b;
        });
      });
      
      // Log Analytics Event for Sync
      pushAnalyticsEvent("background_outbox_flushed", { 
        synced_count: outbox.length, 
        storage_engine: platform === "nextjs" ? "IndexedDB" : "Isar (Hive)" 
      });

      setOutbox([]);
    }, 1500);

    return () => clearTimeout(syncTimeout);
  }, [isOnline, outbox, platform]);

  // --- STATE AND ERROR SIMULATOR ---
  const [userToken, setUserToken] = useState<string | null>("jwt_payload_flight_expert_9420");
  const [simulatedError, setSimulatedError] = useState<string | null>(null);

  const pushAnalyticsEvent = (event: string, params: Record<string, any>) => {
    const time = new Date().toTimeString().split(' ')[0];
    const log: AnalyticsLog = {
      id: `A-${Math.floor(Math.random() * 900000) + 100000}`,
      event,
      params: JSON.stringify(params),
      timestamp: time
    };
    setAnalyticsLogs(prev => [log, ...prev].slice(0, 10)); // Keep last 10
  };

  // Trigger optimistic booking creation
  const handleCreateBooking = () => {
    const randomDestinations = ["Paris CDG", "Dubai DXB", "Singapore SIN", "Chicago ORD", "Madrid MAD"];
    const randomPassenger = ["Clara Oswald", "David Tennant", "Rose Tyler", "Amy Pond"][Math.floor(Math.random() * 4)];
    const randomFlight = `FS-${Math.floor(Math.random() * 800) + 100}`;
    const targetDest = randomDestinations[Math.floor(Math.random() * randomDestinations.length)];
    const time = new Date().toTimeString().split(' ')[0];
    const id = `B-${Math.floor(Math.random() * 9000) + 1000}`;

    const newBooking: SimulatedBooking = {
      id,
      flightNumber: randomFlight,
      passenger: randomPassenger,
      destination: targetDest,
      status: isOnline ? "synced" : "optimistic_pending",
      timestamp: time,
      isOptimistic: true
    };

    // 1. Immediately push to UI State (Optimistic Update)
    setBookings(prev => [newBooking, ...prev]);

    // 2. If Offline, push into Outbox (Service Worker / Local Engine queue)
    if (!isOnline) {
      const outboxItem: OutboxItem = {
        id: `O-${id}`,
        type: "CREATE_BOOKING",
        payload: newBooking,
        retryCount: 0
      };
      setOutbox(prev => [...prev, outboxItem]);
      pushAnalyticsEvent("booking_optimistic_offline_queued", { id, flight: randomFlight, storage: platform === "nextjs" ? "IndexedDB" : "Isar" });
    } else {
      pushAnalyticsEvent("booking_created_instant_sync", { id, flight: randomFlight });
    }
  };

  // Trigger artificial crash boundary
  const triggerErrorState = (type: "render" | "timeout") => {
    if (type === "render") {
      setSimulatedError("ReferenceError: Cannot read properties of undefined (reading 'subgraph_metrics')");
      pushAnalyticsEvent("error_boundary_triggered", { type: "javascript_render_crash", file: "NextLayoutErrorBoundary.tsx" });
    } else {
      setSimulatedError("NetworkTimeoutError: Upstream API failed to respond within 5000ms. Status Code: 504");
      pushAnalyticsEvent("api_timeout_logged", { route: "/api/v2/flights/search", timeout_threshold: "5000ms" });
    }
  };

  const handleResetError = () => {
    setSimulatedError(null);
    pushAnalyticsEvent("error_boundary_recovered", { status: "SLA_HEALTHY" });
  };

  // Clean-up booking list
  const clearBookings = () => {
    setBookings([
      { id: "B-1021", flightNumber: "FS-204", passenger: "Alex Rivera", destination: "London LHR", status: "synced", timestamp: "23:41:00", isOptimistic: false }
    ]);
    setOutbox([]);
    pushAnalyticsEvent("bookings_db_vacuumed", { size_freed_kb: 45.2 });
  };

  // i18n helper
  const t = TRANSLATIONS[locale];

  return (
    <div className="space-y-6" id="frontend-platform-architecture">
      
      {/* 1. Header & Live Global Controls */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-40 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? "bg-emerald-400" : "bg-rose-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? "bg-emerald-500" : "bg-rose-500"}`}></span>
              </span>
              <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${isOnline ? "text-emerald-400" : "text-rose-400"}`}>
                Client Connectivity: {isOnline ? "Cloud Connected" : "Local-First Fallback Mode"}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-100 mt-1 tracking-tight flex items-center gap-2">
              <Layout className="w-5 h-5 text-indigo-400" />
              <span>Omni-Channel Frontend Platform Architecture</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Cross-platform system design supporting web and mobile. Powered by Offline Sync Engines, Optimistic UI caching, debounced search filters, infinite scrolling, strict i18n / a11y standards, and client telemetry.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Online / Offline Toggle */}
            <button
              onClick={() => {
                setIsOnline(!isOnline);
                pushAnalyticsEvent("network_status_toggled", { to_state: !isOnline ? "ONLINE" : "OFFLINE" });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isOnline 
                  ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400" 
                  : "bg-rose-950/40 border-rose-500/20 text-rose-400"
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? "Force Offline" : "Restore Connection"}</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
              <Languages className="w-3.5 h-3.5 text-slate-500 mx-2" />
              <select
                value={locale}
                onChange={(e) => {
                  setLocale(e.target.value as any);
                  pushAnalyticsEvent("language_changed", { locale: e.target.value });
                }}
                className="bg-transparent border-none text-[10px] font-mono text-slate-300 focus:outline-none cursor-pointer pr-1"
              >
                <option value="en" className="bg-slate-950">English (EN)</option>
                <option value="es" className="bg-slate-950">Español (ES)</option>
                <option value="fr" className="bg-slate-950">Français (FR)</option>
                <option value="de" className="bg-slate-950">Deutsch (DE)</option>
                <option value="ja" className="bg-slate-950">日本語 (JA)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex border-t border-slate-800/40 mt-4 pt-4 justify-between items-center flex-wrap gap-2">
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => {
                setPlatform("nextjs");
                pushAnalyticsEvent("platform_switched", { platform: "nextjs" });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                platform === "nextjs"
                  ? "bg-slate-900 border border-slate-800 text-sky-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Next.js Web App Core (SSG/ISR/SSR)</span>
            </button>
            <button
              onClick={() => {
                setPlatform("flutter");
                pushAnalyticsEvent("platform_switched", { platform: "flutter" });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                platform === "flutter"
                  ? "bg-slate-900 border border-slate-800 text-teal-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Smartphone className="w-4 h-4 text-teal-400" />
              <span>Flutter Native Core (Android, iOS & Web)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-950/40 px-3 py-1.5 border border-slate-800/40 rounded-lg">
            <span>Framework target:</span>
            <strong className={platform === "nextjs" ? "text-sky-400" : "text-teal-400"}>
              {platform === "nextjs" ? "Next.js v15 (App Router)" : "Flutter v3.22 (BLoC Architecture)"}
            </strong>
          </div>
        </div>
      </div>

      {/* 2. Main Platform Blueprint Explorer & Interactive Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Technical Tabs */}
        <div className="lg:col-span-3 space-y-2">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-3 mb-2">
            Architecture Pillars
          </div>
          {[
            { id: "offline_sync", label: "Offline Sync & Optimistic UI", icon: Wifi, color: "text-amber-400" },
            { id: "state_cache", label: "State & Cache Engines", icon: Database, color: "text-sky-400" },
            { id: "search_scroll", label: "Smart Search & Infinite Scroll", icon: Search, color: "text-emerald-400" },
            { id: "a11y_i18n", label: "Accessibility & Localisation", icon: Accessibility, color: "text-indigo-400" },
            { id: "performance", label: "Performance & Error Handling", icon: Activity, color: "text-rose-400" },
            { id: "specs", label: "Production Target Code", icon: Code, color: "text-teal-400" }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setSubModule(item.id as SubModuleType)}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 border ${
                  subModule === item.id
                    ? "bg-slate-900 border-slate-800 text-indigo-400 shadow-xl"
                    : "border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Quick Stats Panel */}
          <div className="bg-slate-900/20 border border-slate-800 p-4 rounded-xl space-y-3.5 pt-4">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1.5">
              Client Core Vitals
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Offline Queue</span>
                <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${outbox.length > 0 ? "bg-amber-950 text-amber-400 border border-amber-500/20" : "text-slate-500 bg-slate-950"}`}>
                  {outbox.length} pending
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Cache hit ratio</span>
                <span className="font-mono text-sky-400 font-bold">94.8%</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Total Telemetry</span>
                <span className="font-mono text-slate-300">{analyticsLogs.length} events</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Tab Contents with Custom Dynamic Simulator */}
        <div className="lg:col-span-9 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm min-h-[480px]">
          
          {/* A. Offline Sync & Optimistic UI */}
          {subModule === "offline_sync" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-amber-400" />
                    <span>Resilient Offline Sync & Optimistic UI Sandbox</span>
                  </h3>
                  <span className="text-[10px] font-mono bg-slate-950 text-slate-400 px-2 py-1 rounded border border-slate-800">
                    Engine: {platform === "nextjs" ? "Workbox SW + IndexedDB" : "Hydrated Bloc + Hive Storage"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  How it works: Mutating state triggers an immediate "Optimistic Update" on the UI to keep interaction speed snappy. Simultaneously, the task enters a local Persistent Outbox. If connection fails, background queues cache transactions safely, automatically re-syncing to GKE when online.
                </p>
              </div>

              {/* Live Sandbox Playground */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Outbox Controller */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-amber-400" />
                        Persistent Outbox Queue
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Auto-Refills to GKE</span>
                    </div>

                    {outbox.length === 0 ? (
                      <div className="py-8 text-center bg-slate-900/30 rounded-lg border border-dashed border-slate-800/80 flex flex-col items-center justify-center">
                        <CheckCircle2 className="w-7 h-7 text-emerald-500/60 mb-2" />
                        <span className="text-xs text-slate-500">Queue is fully flushed. No pending offline edits.</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {outbox.map((item) => (
                          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono bg-amber-950/60 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                                {item.type}
                              </span>
                              <div className="text-xs font-semibold text-slate-300 mt-1">
                                Passenger: {item.payload.passenger} → {item.payload.destination}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-mono text-slate-500 block">Flight: {item.payload.flightNumber}</span>
                              <span className="text-[9px] text-amber-400 font-mono animate-pulse block mt-1">Waiting Online...</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleCreateBooking}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-bold py-2.5 px-4 rounded-lg text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{t.bookingButton}</span>
                    </button>
                    <div className="flex justify-between text-[10px] text-slate-500 px-1">
                      <span>Instant visual feedback on booking list</span>
                      <button onClick={clearBookings} className="hover:text-rose-400 transition-colors flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Reset list
                      </button>
                    </div>
                  </div>
                </div>

                {/* Optimistic Booking UI View */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Layout className="w-3.5 h-3.5 text-sky-400" />
                        {t.activeBookings}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Simulated App State</span>
                    </div>

                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {bookings.map((booking) => (
                        <div 
                          key={booking.id} 
                          className={`border rounded-xl p-3 flex justify-between items-center transition-all ${
                            booking.status === "optimistic_pending"
                              ? "bg-amber-950/20 border-amber-500/30"
                              : "bg-slate-900 border-slate-800"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-200">{booking.flightNumber}</span>
                              <span className="text-[10px] text-slate-500 font-mono">({booking.destination})</span>
                            </div>
                            <p className="text-[11px] text-slate-400">{t.passenger}: <strong className="text-slate-300">{booking.passenger}</strong></p>
                          </div>
                          
                          <div className="text-right">
                            {booking.status === "optimistic_pending" ? (
                              <span className="text-[10px] bg-amber-950/60 border border-amber-500/20 text-amber-400 font-bold font-mono px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                                <RefreshCw className="w-2.5 h-2.5 animate-spin" /> {t.pending}
                              </span>
                            ) : (
                              <span className="text-[10px] bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 font-bold font-mono px-2 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> {t.synced}
                              </span>
                            )}
                            <span className="text-[9px] text-slate-500 font-mono block mt-1">{booking.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3 mt-4 text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      Notice how the booking is added <strong>instantly</strong> when you click. State updates before GKE acknowledges. If offline, it waits in the outbox queue; once online, standard replication starts!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B. State & Cache Engines */}
          {subModule === "state_cache" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-sky-400" />
                  <span>Interactive State Management & Client Caching Models</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Compare how Web (Zustand/SWR/TanStack) and Mobile (BLoC/Isar) manage client persistence. View hot state slices and telemetry cache validation metrics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visualizer showing selected Platform Architecture */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                      {platform === "nextjs" ? "Zustand State Store Map" : "BLoC State Streams"}
                    </span>
                    <span className="text-[10px] font-mono text-sky-400">Memory Resident</span>
                  </div>

                  {platform === "nextjs" ? (
                    <div className="space-y-3">
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <strong className="text-slate-200">AuthStore (Persistent)</strong>
                          <span className="text-[9px] font-mono text-emerald-400">Hydrated (LocalStorage)</span>
                        </div>
                        <pre className="text-[10px] text-slate-400 font-mono bg-slate-950 p-2 rounded leading-normal">
                          {`token: "${userToken || "null"}"\nrole: "Staff-Architect"\nstatus: "AUTHENTICATED"`}
                        </pre>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <strong className="text-slate-200">FlightCacheStore (SWR/TanStack)</strong>
                          <span className="text-[9px] font-mono text-sky-400">IndexedDB Persisted</span>
                        </div>
                        <pre className="text-[10px] text-slate-400 font-mono bg-slate-950 p-2 rounded leading-normal">
                          {`queries: {\n  "search?from=JFK": { \n    data: Array(18),\n    staleAt: ${Date.now() + 60000}\n  }\n}`}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <strong className="text-slate-200">AuthenticationBloc (Streams)</strong>
                          <span className="text-[9px] font-mono text-emerald-400">Hydrated (SecureStorage)</span>
                        </div>
                        <pre className="text-[10px] text-slate-400 font-mono bg-slate-950 p-2 rounded leading-normal">
                          {`stream: AuthenticatedState(\n  token: "${userToken || "null"}",\n  expires: DateTime.now() + 1hr\n)`}
                        </pre>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <strong className="text-slate-200">LocalFlightsBloc</strong>
                          <span className="text-[9px] font-mono text-teal-400">Isar Database</span>
                        </div>
                        <pre className="text-[10px] text-slate-400 font-mono bg-slate-950 p-2 rounded leading-normal">
                          {`@Collection()\nclass LocalFlight {\n  Id id;\n  String flightCode;\n  bool isSynced;\n}`}
                        </pre>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center bg-slate-900/60 p-2.5 border border-slate-800/80 rounded-lg text-xs">
                    <span className="text-slate-400">Simulate OAuth Expire / Log-Out</span>
                    <button
                      onClick={() => {
                        const tokenState = userToken ? null : "jwt_payload_flight_expert_9420";
                        setUserToken(tokenState);
                        pushAnalyticsEvent("auth_token_changed", { active: !!tokenState });
                      }}
                      className={`font-semibold px-3 py-1 rounded text-[10px] font-mono border transition-all ${
                        userToken 
                          ? "bg-rose-950 text-rose-400 border-rose-500/20" 
                          : "bg-emerald-950 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {userToken ? "LOG-OUT CLIENT" : "HYDRATE TOKEN"}
                    </button>
                  </div>
                </div>

                {/* Local Storage Schema Details */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase block border-b border-slate-800 pb-2 mb-3">Enterprise State Engine Rules</span>
                    
                    <div className="space-y-4 text-xs text-slate-300">
                      <div className="flex items-start gap-2">
                        <div className="h-5 w-5 bg-sky-950 border border-sky-500/20 rounded-lg flex items-center justify-center text-sky-400 font-mono font-bold shrink-0 text-[10px]">1</div>
                        <div>
                          <strong className="text-slate-100 block">Single Source of Truth</strong>
                          <span className="text-[11px] text-slate-400">
                            Remote query results are never stored in generic global state variables. Always bind with cache management libraries to handle cache eviction, TTL, and pre-fetching.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="h-5 w-5 bg-indigo-950 border border-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-mono font-bold shrink-0 text-[10px]">2</div>
                        <div>
                          <strong className="text-slate-100 block">Hydration & Rehydration</strong>
                          <span className="text-[11px] text-slate-400">
                            All critical configurations, search history tokens, and current draft inputs are automatically persisted to local storage (IndexedDB for Next.js, Secure Hive for Flutter) and rehydrated during initial app boot.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="h-5 w-5 bg-emerald-950 border border-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 font-mono font-bold shrink-0 text-[10px]">3</div>
                        <div>
                          <strong className="text-slate-100 block">Encryption at Rest</strong>
                          <span className="text-[11px] text-slate-400">
                            Authentication credentials and flight telemetry logs containing passenger profiles are encrypted using AES-GCM before write-to-disk on devices.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 p-3 border border-slate-800/60 rounded-xl flex items-center gap-2 text-[11px] text-slate-400 leading-relaxed mt-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real-time persistence layer is isolated from render cycles to prevent browser UI freezing.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* C. Smart Search & Infinite Scroll */}
          {subModule === "search_scroll" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Search className="w-5 h-5 text-emerald-400" />
                  <span>Real-time Search Experience & Infinite Scroll Simulation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Experience performance optimizations: debounced input streams (preventing server-side query flooding) paired with virtualized infinite loading logic.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Search Sandbox */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block border-b border-slate-800 pb-2">Debounced Ingress Search Input</span>
                  
                  <div className="space-y-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-semibold"
                    />
                  </div>

                  {/* Debouncer Status bar */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Debouncing countdown timer:</span>
                      <span className="font-mono text-emerald-400 font-bold">{debounceCount}ms</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-400 transition-all duration-75"
                        style={{ width: `${isDebouncing ? (debounceCount / 300) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{isDebouncing ? "Waiting for user stop..." : "Idling / Query Flushed"}</span>
                      <span>Debounce limit: 300ms</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono bg-slate-900/40 p-2.5 border border-slate-800/80 rounded-lg">
                    <span>Upstream Query Hits:</span>
                    <strong className="text-slate-200">{searchTriggerCount} API Calls</strong>
                  </div>
                </div>

                {/* Infinite Scroll List */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                        Virtualized Virtual Dom List
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {t.resultsCount.replace("{count}", Math.min(visibleCount, filteredRoutes.length).toString()).replace("{total}", filteredRoutes.length.toString())}
                      </span>
                    </div>

                    {filteredRoutes.length === 0 ? (
                      <div className="py-12 text-center bg-slate-900/30 rounded-lg border border-dashed border-slate-800 flex flex-col items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-rose-500/60 mb-1" />
                        <span className="text-xs text-slate-400">No active flight routes match your search.</span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {filteredRoutes.slice(0, visibleCount).map((route) => (
                          <div key={route.code} className="bg-slate-900 border border-slate-800/80 rounded-lg p-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono bg-slate-950 text-sky-400 px-1.5 py-0.5 rounded border border-slate-800">
                                {route.code}
                              </span>
                              <strong className="text-slate-200">{route.from} → {route.to}</strong>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-300 font-semibold font-mono">{route.price}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{route.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {visibleCount < filteredRoutes.length && (
                    <button
                      onClick={() => {
                        setVisibleCount(prev => Math.min(filteredRoutes.length, prev + 3));
                        pushAnalyticsEvent("infinite_scroll_load_more", { loaded_to: Math.min(filteredRoutes.length, visibleCount + 3) });
                      }}
                      className="w-full mt-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.loadMore}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* D. Accessibility & Localisation */}
          {subModule === "a11y_i18n" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Accessibility className="w-5 h-5 text-indigo-400" />
                  <span>Strict Accessibility Compliance & Localization Testing</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Verify how your user interfaces comply with strict **WCAG 2.2 AA** criteria. Enable simulated screen-reader speech labels and dynamic ARIA tags.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* a11y Checker */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                      Screen-Reader Tag Simulator
                    </span>
                    <button
                      onClick={() => {
                        setIsA11ySimulated(!isA11ySimulated);
                        pushAnalyticsEvent("a11y_simulation_toggled", { enabled: !isA11ySimulated });
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                        isA11ySimulated 
                          ? "bg-indigo-950 text-indigo-400 border-indigo-500/20" 
                          : "bg-slate-950 border-slate-800/80 text-slate-500"
                      }`}
                    >
                      {isA11ySimulated ? "DISABLE A11Y MODE" : "ENABLE A11Y MODE"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-lg space-y-2">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase block">Simulated ARIA Code Element</span>
                      
                      <div className="space-y-2">
                        {isA11ySimulated ? (
                          <div className="p-2 bg-slate-950 rounded border border-dashed border-indigo-500/20 space-y-1">
                            <code className="text-[10px] text-emerald-400 font-mono block">
                              {`<button \n  aria-label="Confirm booking for ${bookings[0]?.passenger || "Client"}"\n  role="button"\n  aria-live="polite"\n  aria-disabled="${!isOnline}">`}
                            </code>
                          </div>
                        ) : (
                          <div className="p-2 bg-slate-950 rounded border border-slate-850">
                            <code className="text-[10px] text-slate-500 font-mono block">
                              {`<button onClick={handleCreateBooking}>`}
                            </code>
                          </div>
                        )}
                        <span className="text-[10px] text-slate-500 block leading-normal">
                          {isA11ySimulated 
                            ? "✅ ARIA live-regions are active! Screen readers will read the booking confirmations aloud." 
                            : "⚠️ Standard buttons lack speech context labels for impaired individuals."}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-3 border border-slate-800/60 rounded-xl space-y-1.5 text-xs text-slate-300">
                      <div className="font-bold text-slate-200">Contrast Validator:</div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-1.5 bg-slate-950 border border-slate-850 rounded">
                          <span className="text-slate-500 block">Contrast ratio:</span>
                          <strong className="text-emerald-400">7.2:1 (AAA)</strong>
                        </div>
                        <div className="p-1.5 bg-slate-950 border border-slate-850 rounded">
                          <span className="text-slate-500 block">Keyboard Focus:</span>
                          <strong className="text-emerald-400">Ring-2 outline</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Localisation Dashboard */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase block border-b border-slate-800 pb-2 mb-3">
                      i18n Dynamic Translation Catalog
                    </span>
                    
                    <div className="space-y-3 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                        <span className="text-xs font-mono text-slate-500">Active Language</span>
                        <strong className="text-xs text-sky-400 uppercase font-mono">{locale}</strong>
                      </div>

                      <div className="space-y-2.5 text-xs leading-normal">
                        <div>
                          <span className="text-[10px] text-slate-500 block font-mono">dashboardTitle:</span>
                          <span className="text-slate-200 font-semibold">{t.dashboardTitle}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block font-mono">bookingButton:</span>
                          <span className="text-slate-200 font-semibold">{t.bookingButton}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block font-mono">statusLabel:</span>
                          <span className="text-slate-200 font-semibold">{t.statusLabel}: <span className="text-emerald-400">{isOnline ? t.online : t.offline}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 p-3 border border-slate-800/60 rounded-xl flex items-center gap-2 text-[11px] text-slate-400 leading-relaxed mt-4">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Next.js parses locales dynamically on edge servers, bypassing browser-side translations. Flutter implements standard .arb dictionaries compiled to binary.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* E. Performance & Error Handling */}
          {subModule === "performance" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-500" />
                  <span>Performance Observatory & Error Boundaries</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Test React Error Boundaries and API recovery mechanics. Avoid crashing the entire application by encapsulating faulty components in elegant UI fallbacks.
                </p>
              </div>

              {simulatedError ? (
                <div className="bg-rose-950/20 border border-rose-500/20 p-5 rounded-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-rose-300">Resilient Boundary Triggered</h4>
                      <p className="text-xs text-slate-400">The crash was isolated inside the component boundary. Global operations remain completely active.</p>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                    <code className="text-xs text-rose-400 font-mono block leading-relaxed whitespace-pre-wrap">{simulatedError}</code>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleResetError}
                      className="bg-rose-900 hover:bg-rose-800 text-slate-100 font-bold py-1.5 px-4 rounded-lg text-xs tracking-wide transition-all cursor-pointer"
                    >
                      Reset Boundary State & Recover
                    </button>
                    <button
                      onClick={() => triggerErrorState("timeout")}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      Switch to Network Timeout Error
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Performance Metrics Panel */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4">
                    <span className="text-[11px] font-mono text-slate-400 uppercase block border-b border-slate-800 pb-2">
                      {platform === "nextjs" ? "Web Core Vitals Telemetry" : "Flutter Engine Frame Telemetry"}
                    </span>

                    {platform === "nextjs" ? (
                      <div className="space-y-3 font-mono text-xs">
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                          <span className="text-slate-400">Largest Contentful Paint (LCP)</span>
                          <strong className="text-emerald-400">1.1s (Excellent)</strong>
                        </div>
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                          <span className="text-slate-400">Interaction to Next Paint (INP)</span>
                          <strong className="text-emerald-400">22ms (Excellent)</strong>
                        </div>
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                          <span className="text-slate-400">Cumulative Layout Shift (CLS)</span>
                          <strong className="text-emerald-400">0.02 (Excellent)</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 font-mono text-xs">
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                          <span className="text-slate-400">Frame Rendering (FPS)</span>
                          <strong className="text-emerald-400">120 Hz (Metal/Impeller)</strong>
                        </div>
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                          <span className="text-slate-400">GPU Compile Time</span>
                          <strong className="text-emerald-400">0.8ms (Zero Shader Stutter)</strong>
                        </div>
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                          <span className="text-slate-400">Active Heap Footprint</span>
                          <strong className="text-sky-400">32.4 MB</strong>
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-900/50 p-3 border border-slate-850 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase block font-mono">Real-time Analytics Feed</span>
                      <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                        {analyticsLogs.slice(0, 4).map((log) => (
                          <div key={log.id} className="text-[10px] font-mono text-slate-400 flex items-start gap-1">
                            <span className="text-indigo-400 shrink-0">[{log.timestamp}]</span>
                            <span>
                              <strong className="text-slate-200">{log.event}</strong>: {log.params}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Error Boundary Simulator Trigger */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 uppercase block border-b border-slate-800 pb-2 mb-3">
                        Resiliency Fault Injector
                      </span>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Test how the application handles unexpected system crashes. Use the buttons below to inject errors directly. In a production environment, this triggers loggers to Sentry, keeping the surrounding platform stable.
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => triggerErrorState("render")}
                          className="bg-rose-950/40 hover:bg-rose-950/60 text-rose-300 font-semibold py-2 px-3 border border-rose-500/20 rounded-lg text-xs transition-all cursor-pointer"
                        >
                          Inject React Render Crash
                        </button>
                        <button
                          onClick={() => triggerErrorState("timeout")}
                          className="bg-amber-950/40 hover:bg-amber-950/60 text-amber-300 font-semibold py-2 px-3 border border-amber-500/20 rounded-lg text-xs transition-all cursor-pointer"
                        >
                          Inject API Timeout Crash
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 p-3 border border-slate-800/60 rounded-xl flex items-center gap-2 text-[11px] text-slate-400 leading-relaxed mt-4">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Never let a crash take down the host thread! Next.js handles this via Error Boundaries, Flutter via FlutterError.onError callbacks.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* F. Production Target Specs */}
          {subModule === "specs" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Code className="w-5 h-5 text-teal-400" />
                  <span>Production Target Architecture Specifications</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  View direct framework implementation paradigms for establishing standard production configurations on both web and mobile channels.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Next.js Code Spec */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                    <span className="text-xs font-mono text-sky-400 font-bold uppercase">Next.js Workbox Service Worker</span>
                    <span className="text-[10px] text-slate-500 font-mono">/src/sw.ts</span>
                  </div>

                  <pre className="text-[10px] text-slate-400 font-mono bg-slate-950 p-3 rounded-lg overflow-x-auto leading-normal max-h-[300px] overflow-y-auto">
                    {`import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';

// Cache Google Fonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new CacheFirst({ cacheName: 'google-fonts-cache' })
);

// NetworkFirst Strategy for Flight API
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/v2/flights'),
  new NetworkFirst({
    cacheName: 'flights-api-cache',
    plugins: [
      {
        fetchDidFail: async ({ request }) => {
          // Push to IndexedDB outbox queue
          await pushToOutbox(request);
        }
      }
    ]
  })
);`}
                  </pre>
                </div>

                {/* Flutter Bloc / Hive Code Spec */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                    <span className="text-xs font-mono text-teal-400 font-bold uppercase">Flutter BLoC Optimistic Sync</span>
                    <span className="text-[10px] text-slate-500 font-mono">flights_bloc.dart</span>
                  </div>

                  <pre className="text-[10px] text-slate-400 font-mono bg-slate-950 p-3 rounded-lg overflow-x-auto leading-normal max-h-[300px] overflow-y-auto">
                    {`class FlightsBloc extends Bloc<FlightsEvent, FlightsState> {
  final IsarDatabase localDb;
  final ApiClient apiClient;

  FlightsBloc(this.localDb, this.apiClient) : super(FlightsLoaded([])) {
    on<CreateBooking>((event, emit) async {
      final optimisticBooking = event.booking.copyWith(
        status: SyncStatus.pending,
      );
      
      // Update local cache immediately
      await localDb.saveBooking(optimisticBooking);
      emit(FlightsLoaded([optimisticBooking, ...state.bookings]));

      try {
        await apiClient.postBooking(event.booking);
        // Mark as synced
        final synced = optimisticBooking.copyWith(
          status: SyncStatus.synced,
        );
        await localDb.saveBooking(synced);
      } catch (e) {
        // Queue in Outbox table
        await localDb.saveToOutbox(event.booking);
      }
    });
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
