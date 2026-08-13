import React, { useState, useEffect, useMemo } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Cpu, 
  ShieldAlert, 
  Activity, 
  Database, 
  Server, 
  Search, 
  MousePointerClick, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  Layers, 
  Terminal, 
  Sparkles, 
  BellRing, 
  RefreshCw, 
  ArrowRightLeft, 
  Settings, 
  HelpCircle, 
  FileSpreadsheet, 
  Flame, 
  Radio, 
  ArrowRight, 
  Play, 
  Filter, 
  Info, 
  Zap, 
  Network,
  Download,
  Percent,
  CheckCircle,
  AlertTriangle,
  FileCode,
  LineChart,
  GitBranch
} from "lucide-react";

// Real-time Mock Initial States
interface PerformanceMetrics {
  searches: number;
  clicks: number;
  bookings: number;
  revenue: number;
  avgOrderValue: number;
  conversionRate: number;
}

interface PartnerMetric {
  id: string;
  name: string;
  type: string;
  latencyMs: number;
  successRate: number;
  bookingVolume: number;
  status: "Healthy" | "Degraded" | "Outage";
}

interface CacheMetric {
  redisHits: number;
  redisMisses: number;
  hitRatio: number;
  avgReadMs: number;
  utilizationPercent: number;
  ttlActiveSeconds: number;
}

interface ApiLatencyMetric {
  route: string;
  p50Ms: number;
  p90Ms: number;
  p99Ms: number;
  requestsPerSecond: number;
}

interface PredictionMetric {
  modelName: string;
  mape: number; // Mean Absolute Percentage Error
  rmse: number;
  accuracyPercent: number;
  totalInferences: number;
}

interface NotificationMetric {
  channel: "SMS" | "Email" | "Push Notification";
  deliveredCount: number;
  deliveredSpeedSec: number;
  bounceRatePercent: number;
  clickThroughPercent: number;
}

interface FraudAlert {
  id: string;
  ip: string;
  country: string;
  score: number; // 0-100
  triggerReason: string;
  timestamp: string;
  action: "Flagged" | "Blocked" | "Cleared";
}

interface AbTestVariant {
  name: string;
  key: string;
  trafficSplit: number;
  searches: number;
  clicks: number;
  bookings: number;
  revenue: number;
  latencyMs: number;
  bounceRate: number;
}

export default function EnterpriseAnalyticsPlatform() {
  // Navigation tabs within Analytics Platform
  const [activeSubTab, setActiveSubTab] = useState<"executive" | "system" | "ab_testing" | "warehouse" | "bi_explorer">("executive");

  // Filter levels
  const [selectedTier, setSelectedTier] = useState<"All" | "Basic Traveler" | "Elite Frequent Flyer" | "Corporate Concierge">("All");
  const [selectedRegion, setSelectedRegion] = useState<"All" | "US-East" | "US-West" | "EU-Central" | "AP-Northeast">("All");
  const [timeWindow, setTimeWindow] = useState<"1h" | "24h" | "7d" | "30d">("24h");

  // Live dynamic counter ticks
  const [liveTicks, setLiveTicks] = useState<number>(0);
  const [platformMetrics, setPlatformMetrics] = useState<PerformanceMetrics>({
    searches: 854020,
    clicks: 198450,
    bookings: 24510,
    revenue: 11985400,
    avgOrderValue: 489,
    conversionRate: 2.87
  });

  // Partners Performance Metrics
  const [partners, setPartners] = useState<PartnerMetric[]>([
    { id: "p-1", name: "Sabre GDS", type: "Air GDS", latencyMs: 142, successRate: 99.88, bookingVolume: 12450, status: "Healthy" },
    { id: "p-2", name: "Amadeus NDC", type: "NDC Direct", latencyMs: 285, successRate: 98.42, bookingVolume: 6840, status: "Healthy" },
    { id: "p-3", name: "Travelport GDS", type: "Air GDS", latencyMs: 198, successRate: 99.12, bookingVolume: 3510, status: "Healthy" },
    { id: "p-4", name: "Delta Air Lines API", type: "Direct API", latencyMs: 98, successRate: 99.95, bookingVolume: 1420, status: "Healthy" },
    { id: "p-5", name: "Singapore Airlines", type: "Direct API", latencyMs: 420, successRate: 91.20, bookingVolume: 850, status: "Degraded" },
    { id: "p-6", name: "Lufthansa Group API", type: "NDC Direct", latencyMs: 1250, successRate: 74.50, bookingVolume: 440, status: "Outage" }
  ]);

  // Cache stats
  const [cache, setCache] = useState<CacheMetric>({
    redisHits: 3410250,
    redisMisses: 450120,
    hitRatio: 88.34,
    avgReadMs: 1.8,
    utilizationPercent: 64.2,
    ttlActiveSeconds: 180
  });

  // API latency routes
  const [apiRoutes, setApiRoutes] = useState<ApiLatencyMetric[]>([
    { route: "GET /api/v2/flights/search", p50Ms: 210, p90Ms: 480, p99Ms: 1200, requestsPerSecond: 280 },
    { route: "POST /api/v2/flights/book", p50Ms: 640, p90Ms: 1450, p99Ms: 3200, requestsPerSecond: 18 },
    { route: "GET /api/v2/personalization/deals", p50Ms: 35, p90Ms: 78, p99Ms: 185, requestsPerSecond: 320 },
    { route: "POST /api/v2/notifications/dispatch", p50Ms: 12, p90Ms: 28, p99Ms: 95, requestsPerSecond: 145 }
  ]);

  // Predictive Accuracy metrics for price forecasting ML model
  const [mlModels, setMlModels] = useState<PredictionMetric[]>([
    { modelName: "Fare_Trend_Regressor_v3.2", mape: 3.14, rmse: 14.50, accuracyPercent: 96.86, totalInferences: 450120 },
    { modelName: "Mistake_Fare_Classifier_v5.0", mape: 0.85, rmse: 2.10, accuracyPercent: 99.15, totalInferences: 212500 },
    { modelName: "User_LTV_Predictor_v1.1", mape: 5.42, rmse: 34.20, accuracyPercent: 94.58, totalInferences: 25400 }
  ]);

  // Notifications performance
  const [notificationPerformance, setNotificationPerformance] = useState<NotificationMetric[]>([
    { channel: "Push Notification", deliveredCount: 145200, deliveredSpeedSec: 0.8, bounceRatePercent: 1.2, clickThroughPercent: 14.2 },
    { channel: "SMS", deliveredCount: 84500, deliveredSpeedSec: 2.4, bounceRatePercent: 0.4, clickThroughPercent: 21.8 },
    { channel: "Email", deliveredCount: 224000, deliveredSpeedSec: 4.5, bounceRatePercent: 3.8, clickThroughPercent: 5.4 }
  ]);

  // Fraud detection alerts
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([
    { id: "FRD-9981", ip: "185.220.101.44", country: "NL", score: 92, triggerReason: "High-frequency parallel card authorization attempts", timestamp: "23:10:45", action: "Blocked" },
    { id: "FRD-9982", ip: "45.231.114.2", country: "UA", score: 84, triggerReason: "API credential stuffing from distributed proxy subnet", timestamp: "23:08:12", action: "Blocked" },
    { id: "FRD-9983", ip: "198.51.100.82", country: "US", score: 58, triggerReason: "Unusual multi-city routing searched in &lt;1 sec", timestamp: "23:05:01", action: "Flagged" },
    { id: "FRD-9984", ip: "203.0.113.195", country: "BR", score: 24, triggerReason: "Account sharing cross-continent session", timestamp: "22:54:18", action: "Cleared" }
  ]);

  // A/B Testing state
  const [abTests, setAbTests] = useState<{ [testKey: string]: AbTestVariant[] }>({
    "price_precision_rounding": [
      { name: "Control (Dynamic Cent Float)", key: "control", trafficSplit: 50, searches: 240000, clicks: 48000, bookings: 5400, revenue: 2640000, latencyMs: 240, bounceRate: 4.2 },
      { name: "Variant B (Clean Integer Psychological)", key: "variant_b", trafficSplit: 50, searches: 240000, clicks: 52400, bookings: 6120, revenue: 2992680, latencyMs: 215, bounceRate: 3.8 }
    ],
    "personalization_carousels": [
      { name: "Control (Static Geo Alerts)", key: "control", trafficSplit: 70, searches: 350000, clicks: 70000, bookings: 8400, revenue: 4116000, latencyMs: 145, bounceRate: 5.1 },
      { name: "Variant B (Spark-CF Real-time Embeddings)", key: "variant_b", trafficSplit: 30, searches: 150000, clicks: 42000, bookings: 5800, revenue: 2842000, latencyMs: 192, bounceRate: 3.2 }
    ]
  });

  const [activeAbTestKey, setActiveAbTestKey] = useState<string>("price_precision_rounding");

  // Dynamic Telemetry ticks (Simulated background workload)
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTicks(prev => prev + 1);

      // Fluctuate core stats
      setPlatformMetrics(prev => {
        const dSearch = Math.round((Math.random() - 0.4) * 8);
        const dClick = Math.round(dSearch * 0.23 + (Math.random() - 0.5) * 2);
        const dBooking = Math.round(dClick * 0.12);
        const dRevenue = dBooking * prev.avgOrderValue;
        const newSearches = prev.searches + Math.max(0, dSearch);
        const newClicks = prev.clicks + Math.max(0, dClick);
        const newBookings = prev.bookings + Math.max(0, dBooking);
        const newRev = prev.revenue + Math.max(0, dRevenue);
        return {
          searches: newSearches,
          clicks: newClicks,
          bookings: newBookings,
          revenue: newRev,
          avgOrderValue: prev.avgOrderValue,
          conversionRate: Number(((newBookings / newSearches) * 100).toFixed(2))
        };
      });

      // Update cache
      setCache(prev => {
        const hits = prev.redisHits + Math.round(Math.random() * 45);
        const misses = prev.redisMisses + Math.round(Math.random() * 6);
        return {
          ...prev,
          redisHits: hits,
          redisMisses: misses,
          hitRatio: Number(((hits / (hits + misses)) * 100).toFixed(2)),
          utilizationPercent: Math.min(98, Math.max(20, Number((prev.utilizationPercent + (Math.random() - 0.5) * 0.4).toFixed(1))))
        };
      });

      // Fluctuate partner latencies
      setPartners(prev => prev.map(p => {
        const diff = Math.round((Math.random() - 0.5) * 15);
        const newLat = Math.max(40, p.latencyMs + diff);
        let newStatus = p.status;
        if (newLat > 1100) newStatus = "Outage";
        else if (newLat > 380) newStatus = "Degraded";
        else newStatus = "Healthy";
        return {
          ...p,
          latencyMs: newLat,
          status: newStatus
        };
      }));

      // Fluctuate API latency routes
      setApiRoutes(prev => prev.map(r => {
        const f = (Math.random() - 0.5) * 12;
        return {
          ...r,
          p50Ms: Math.max(10, Math.round(r.p50Ms + f)),
          p90Ms: Math.max(20, Math.round(r.p90Ms + f * 1.8)),
          p99Ms: Math.max(50, Math.round(r.p99Ms + f * 3.5))
        };
      }));

      // Add occasionally a fraud warning
      if (Math.random() > 0.85) {
        const randomIPs = ["194.26.135.18", "92.118.39.2", "45.227.254.120", "185.156.74.88"];
        const countries = ["RU", "CN", "RO", "UA"];
        const reasons = ["Credential brute force on auth endpoint", "Automated mistake-fare endpoint stress scrape", "Proxy booking credit validation error", "Suspicious high-value seat locks"];
        const newAlert: FraudAlert = {
          id: `FRD-${Math.floor(1000 + Math.random() * 9000)}`,
          ip: randomIPs[Math.floor(Math.random() * randomIPs.length)],
          country: countries[Math.floor(Math.random() * countries.length)],
          score: Math.floor(65 + Math.random() * 35),
          triggerReason: reasons[Math.floor(Math.random() * reasons.length)],
          timestamp: new Date().toTimeString().split(' ')[0],
          action: Math.random() > 0.6 ? "Blocked" : "Flagged"
        };
        setFraudAlerts(prev => [newAlert, ...prev.slice(0, 5)]);
      }

    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Customer cohort metrics based on filter
  const cohortLTV = useMemo(() => {
    let multiplier = 1.0;
    if (selectedTier === "Basic Traveler") multiplier = 0.4;
    if (selectedTier === "Elite Frequent Flyer") multiplier = 1.8;
    if (selectedTier === "Corporate Concierge") multiplier = 4.2;
    return Math.round(1850 * multiplier);
  }, [selectedTier]);

  const cohortRentention = useMemo(() => {
    if (selectedTier === "Basic Traveler") return [82, 54, 38, 22, 14, 8];
    if (selectedTier === "Elite Frequent Flyer") return [95, 88, 81, 76, 72, 69];
    if (selectedTier === "Corporate Concierge") return [99, 97, 95, 94, 93, 91];
    return [88, 71, 59, 48, 42, 37]; // All
  }, [selectedTier]);

  // SQL Ad-hoc query builder data
  const sqlTemplates = [
    {
      name: "Total Revenue & Bookings by Tier",
      query: "SELECT user_tier, COUNT(id) as bookings, SUM(price_usd) as revenue_usd, AVG(price_usd) as aov \nFROM fct_bookings \nGROUP BY user_tier \nORDER BY revenue_usd DESC;"
    },
    {
      name: "Sabre GDS Latency vs Ticket Sales Trend",
      query: "SELECT DATE_TRUNC('hour', event_time) as hour, AVG(partner_latency_ms) as avg_latency, COUNT(*) as booking_count \nFROM stg_gds_searches \nWHERE partner_name = 'Sabre' AND status = 'SUCCESS' \nGROUP BY 1 ORDER BY 1 DESC LIMIT 24;"
    },
    {
      name: "Notification Delivery Speed & Funnel Conversion",
      query: "SELECT channel, COUNT(*) as sent, AVG(delivery_latency_sec) as speed, SUM(CASE WHEN click_through = TRUE THEN 1 ELSE 0 END) as clicks, SUM(CASE WHEN converted = TRUE THEN 1 ELSE 0 END) as sales \nFROM fct_notifications \nGROUP BY channel;"
    },
    {
      name: "High Threat IP Addresses Flagged in last 24h",
      query: "SELECT ip_address, country_code, COUNT(*) as threat_triggers, MAX(threat_score) as peak_score, MAX(event_time) as last_seen \nFROM stg_security_threats \nWHERE threat_score >= 70 \nGROUP BY ip_address, country_code \nORDER BY peak_score DESC;"
    }
  ];

  const [activeSqlQuery, setActiveSqlQuery] = useState<string>(sqlTemplates[0].query);
  const [queryProcessing, setQueryProcessing] = useState<boolean>(false);
  const [queryResults, setQueryResults] = useState<any[] | null>([
    { user_tier: "Corporate Concierge", bookings: 12450, revenue_usd: 6088050, aov: 489 },
    { user_tier: "Elite Frequent Flyer", bookings: 32510, revenue_usd: 15897390, aov: 489 },
    { user_tier: "Basic Traveler", bookings: 145100, revenue_usd: 70953900, aov: 489 }
  ]);
  const [queryColumns, setQueryColumns] = useState<string[]>(["user_tier", "bookings", "revenue_usd", "aov"]);

  const executeSqlQuery = () => {
    setQueryProcessing(true);
    setTimeout(() => {
      // Return a simulated structured response based on containing terms
      const lower = activeSqlQuery.toLowerCase();
      if (lower.includes("sabre")) {
        setQueryColumns(["hour", "avg_latency", "booking_count"]);
        setQueryResults([
          { hour: "2026-06-27 23:00", avg_latency: 142.5, booking_count: 512 },
          { hour: "2026-06-27 22:00", avg_latency: 148.2, booking_count: 480 },
          { hour: "2026-06-27 21:00", avg_latency: 139.1, booking_count: 520 },
          { hour: "2026-06-27 20:00", avg_latency: 201.8, booking_count: 310 }
        ]);
      } else if (lower.includes("notification")) {
        setQueryColumns(["channel", "sent", "speed", "clicks", "sales"]);
        setQueryResults([
          { channel: "Push Notification", sent: 145200, speed: 0.8, clicks: 20618, sales: 2900 },
          { channel: "SMS", sent: 84500, speed: 2.4, clicks: 18421, sales: 3410 },
          { channel: "Email", sent: 224000, speed: 4.5, clicks: 12096, sales: 1120 }
        ]);
      } else if (lower.includes("threat") || lower.includes("security")) {
        setQueryColumns(["ip_address", "country_code", "threat_triggers", "peak_score", "last_seen"]);
        setQueryResults([
          { ip_address: "185.220.101.44", country_code: "NL", threat_triggers: 184, peak_score: 92, last_seen: "23:10:45" },
          { ip_address: "45.231.114.2", country_code: "UA", threat_triggers: 142, peak_score: 84, last_seen: "23:08:12" },
          { ip_address: "194.26.135.18", country_code: "RU", threat_triggers: 98, peak_score: 79, last_seen: "23:04:11" }
        ]);
      } else {
        // default total revenue tier
        setQueryColumns(["user_tier", "bookings", "revenue_usd", "aov"]);
        setQueryResults([
          { user_tier: "Corporate Concierge", bookings: Math.floor(10000 + Math.random() * 5000), revenue_usd: 5850000, aov: 492 },
          { user_tier: "Elite Frequent Flyer", bookings: Math.floor(30000 + Math.random() * 10000), revenue_usd: 14700000, aov: 490 },
          { user_tier: "Basic Traveler", bookings: Math.floor(120000 + Math.random() * 30000), revenue_usd: 58800000, aov: 488 }
        ]);
      }
      setQueryProcessing(false);
    }, 800);
  };

  // Funnel calculations
  const funnelSteps = useMemo(() => {
    const s = platformMetrics.searches;
    const c = platformMetrics.clicks;
    const b = platformMetrics.bookings;
    const clickPct = Number(((c / s) * 100).toFixed(1));
    const bookPct = Number(((b / c) * 100).toFixed(1));
    const globalConversion = Number(((b / s) * 100).toFixed(2));
    
    return [
      { name: "1. Flight Search Request", count: s, percentage: 100, color: "bg-indigo-600" },
      { name: "2. Offer Selected (Click)", count: c, percentage: clickPct, color: "bg-indigo-500" },
      { name: "3. Direct GDS Booking", count: b, percentage: bookPct, color: "bg-sky-400" },
      { name: "Conversion Yield", count: `${globalConversion}%`, percentage: globalConversion, color: "bg-emerald-400" }
    ];
  }, [platformMetrics]);

  return (
    <div className="space-y-6 animate-fadeIn" id="enterprise-analytics-dashboard">
      
      {/* Enterprise Platform Header */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] bg-sky-950 text-sky-400 border border-sky-500/20 px-2.5 py-0.5 rounded-full font-mono font-black uppercase max-w-max flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            Active Real-time Business Intelligence Engine
          </div>
          <h2 className="text-lg font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Enterprise Analytics & Data Warehouse Platform (BI)
          </h2>
          <p className="text-xs text-slate-400">
            Monitor unified funnel yield, GDS cache hits, real-time fraud alerts, model prediction errors, and A/B variant cohorts. Powered by an underlying Apache Spark streaming lakehouse architecture.
          </p>
        </div>

        {/* Global Multi-Filter Strip */}
        <div className="flex flex-wrap items-center gap-2.5 bg-slate-950/80 p-3 rounded-xl border border-slate-850">
          
          <div className="space-y-0.5">
            <label className="text-[8px] font-mono font-bold text-slate-500 uppercase block">Client Tier</label>
            <select 
              value={selectedTier} 
              onChange={(e) => setSelectedTier(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[10.5px] font-mono text-slate-200 outline-none cursor-pointer"
            >
              <option value="All">All Tiers</option>
              <option value="Basic Traveler">Basic Traveler</option>
              <option value="Elite Frequent Flyer">Elite Frequent Flyer</option>
              <option value="Corporate Concierge">Corporate Concierge</option>
            </select>
          </div>

          <div className="space-y-0.5">
            <label className="text-[8px] font-mono font-bold text-slate-500 uppercase block">Cloud Region</label>
            <select 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[10.5px] font-mono text-slate-200 outline-none cursor-pointer"
            >
              <option value="All">All Nodes</option>
              <option value="US-East">US-East (Virginia)</option>
              <option value="US-West">US-West (Oregon)</option>
              <option value="EU-Central">EU-Central (Frankfurt)</option>
              <option value="AP-Northeast">AP-Northeast (Tokyo)</option>
            </select>
          </div>

          <div className="space-y-0.5">
            <label className="text-[8px] font-mono font-bold text-slate-500 uppercase block">Time Window</label>
            <select 
              value={timeWindow} 
              onChange={(e) => setTimeWindow(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[10.5px] font-mono text-slate-200 outline-none cursor-pointer"
            >
              <option value="1h">Last 60 Minutes</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Tab Navigation bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-850 pb-2">
        <button
          onClick={() => setActiveSubTab("executive")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "executive" 
              ? "bg-slate-900 border border-slate-850 text-indigo-400" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <span>Executive & Customer Cohorts</span>
        </button>

        <button
          onClick={() => setActiveSubTab("system")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "system" 
              ? "bg-slate-900 border border-slate-850 text-sky-400" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Cpu className="w-4 h-4 text-sky-400" />
          <span>System Latency & Cache Performance</span>
        </button>

        <button
          onClick={() => setActiveSubTab("ab_testing")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "ab_testing" 
              ? "bg-slate-900 border border-slate-850 text-amber-500" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <GitBranch className="w-4 h-4 text-amber-500" />
          <span>A/B Testing Impact Dashboard</span>
        </button>

        <button
          onClick={() => setActiveSubTab("warehouse")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "warehouse" 
              ? "bg-slate-900 border border-slate-850 text-emerald-400" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Lakehouse Data Pipeline Architecture</span>
        </button>

        <button
          onClick={() => setActiveSubTab("bi_explorer")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "bi_explorer" 
              ? "bg-slate-900 border border-slate-850 text-sky-400" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <FileCode className="w-4 h-4 text-indigo-400" />
          <span>BI Ad-hoc SQL Explorer</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: EXECUTIVE & CUSTOMER COHORTS */}
      {/* ==================================================== */}
      {activeSubTab === "executive" && (
        <div className="space-y-6">
          
          {/* Executive Row of Tickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[9px] font-mono uppercase font-bold">Accumulated Gross Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-black font-mono tracking-tight text-slate-100">
                ${platformMetrics.revenue.toLocaleString()}
              </p>
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Avg Order (AOV):</span>
                <span className="font-mono text-slate-300">${platformMetrics.avgOrderValue} USD</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[9px] font-mono uppercase font-bold">Total Flight Searches</span>
                <Search className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-xl font-black font-mono tracking-tight text-slate-100">
                {platformMetrics.searches.toLocaleString()}
              </p>
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Search to click speed:</span>
                <span className="font-mono text-slate-300">0.24 sec</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[9px] font-mono uppercase font-bold">Successful Bookings</span>
                <CheckCircle className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-xl font-black font-mono tracking-tight text-slate-100">
                {platformMetrics.bookings.toLocaleString()}
              </p>
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Direct partner syncs:</span>
                <span className="font-mono text-emerald-450">99.8% Success</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[9px] font-mono uppercase font-bold">Cohort Customer Lifetime Value</span>
                <Users className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl font-black font-mono tracking-tight text-slate-100">
                ${cohortLTV} <span className="text-xs text-slate-500 font-normal">avg</span>
              </p>
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Current Tier Filter:</span>
                <span className="font-bold text-indigo-400">{selectedTier}</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Direct Booking Yield Funnel */}
            <div className="lg:col-span-6 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Aggregated Click-to-Booking Funnel Conversion Yield
              </h3>

              <div className="space-y-3">
                {funnelSteps.map((step, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-350">{step.name}</span>
                      <span className="font-mono text-slate-200">{typeof step.count === 'number' ? step.count.toLocaleString() : step.count}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-950 border border-slate-900 h-6.5 rounded-lg overflow-hidden relative flex items-center">
                        <div 
                          className={`h-full ${step.color} opacity-85 transition-all duration-700`}
                          style={{ width: `${typeof step.percentage === 'number' ? step.percentage : 100}%` }}
                        />
                        <span className="absolute left-3 text-[10px] font-black font-mono text-slate-100 drop-shadow-md">
                          {typeof step.percentage === 'number' ? `${step.percentage}%` : step.percentage}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950 p-3 rounded-xl text-[10px] font-mono text-slate-450 leading-relaxed">
                <span className="text-[9px] text-indigo-400 uppercase font-black block mb-1">Conversion Optimization Insight</span>
                94% of search drops are due to Sabre/Amadeus GDS latency exceedance over 1200ms. Lowering timeout limits helps serve alternative low-latency direct API paths from low-cost carrier caches.
              </div>
            </div>

            {/* Retention & Cohort Decay Curves */}
            <div className="lg:col-span-6 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-450" />
                Customer Cohort Decay Curve (User Retention)
              </h3>

              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 h-[210px] flex items-end">
                <div className="relative w-full h-full flex flex-col justify-end">
                  
                  {/* Grid overlay */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                    {[100, 75, 50, 25, 0].map(v => (
                      <div key={v} className="border-b border-slate-200 w-full text-[8px] font-mono text-slate-450" />
                    ))}
                  </div>

                  {/* SVG retention line */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path 
                      d={`M 0,${40 - cohortRentention[0]*0.4} Q 20,${40 - cohortRentention[1]*0.4} 40,${40 - cohortRentention[2]*0.4} T 60,${40 - cohortRentention[3]*0.4} T 80,${40 - cohortRentention[4]*0.4} T 100,${40 - cohortRentention[5]*0.4}`} 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />
                    {cohortRentention.map((v, i) => (
                      <circle 
                        key={i}
                        cx={`${i * 20}`} 
                        cy={`${40 - v * 0.4}`} 
                        r="2" 
                        fill="#34d399" 
                      />
                    ))}
                  </svg>

                  {/* Timeline labels */}
                  <div className="w-full flex justify-between font-mono text-[9px] text-slate-500 pt-2 border-t border-slate-900 mt-2">
                    <span>Month 0</span>
                    <span>Month 1</span>
                    <span>Month 2</span>
                    <span>Month 3</span>
                    <span>Month 4</span>
                    <span>Month 5</span>
                  </div>

                </div>
              </div>

              {/* Data Table */}
              <div className="grid grid-cols-6 gap-1.5 text-center">
                {cohortRentention.map((v, i) => (
                  <div key={i} className="bg-slate-950/80 p-2 border border-slate-900 rounded-lg">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block">M{i}</span>
                    <span className="text-xs font-black font-mono text-slate-200">{v}%</span>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: SYSTEM LATENCY & CACHE */}
      {/* ==================================================== */}
      {activeSubTab === "system" && (
        <div className="space-y-6">
          
          {/* System Performance Ticker Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-1">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">Cache hit ratio</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black font-mono text-slate-100">{cache.hitRatio}%</span>
                <span className="text-[10px] text-emerald-400 font-mono">Hits: {(cache.redisHits / 1000000).toFixed(2)}M</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${cache.hitRatio}%` }} />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-1">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">Redis read latency</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black font-mono text-slate-100">{cache.avgReadMs} ms</span>
                <span className="text-[10px] text-slate-500 font-mono">Utilization: {cache.utilizationPercent}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400" style={{ width: `${cache.utilizationPercent}%` }} />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-1">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">Average ML Fare Prediction Error</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black font-mono text-indigo-400">
                  {mlModels[0].mape}% <span className="text-xs text-slate-500 font-normal">MAPE</span>
                </span>
                <span className="text-[10px] text-slate-450 font-mono">Accuracy: {mlModels[0].accuracyPercent}%</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono truncate">Model: {mlModels[0].modelName}</p>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-1">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">Notification dispatch lag</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black font-mono text-amber-500">
                  {notificationPerformance[0].deliveredSpeedSec}s <span className="text-xs text-slate-500 font-normal">Push</span>
                </span>
                <span className="text-[10px] text-slate-450 font-mono">SMS: {notificationPerformance[1].deliveredSpeedSec}s</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Bounce average: {notificationPerformance[0].bounceRatePercent}%</p>
            </div>

          </div>

          {/* Partner & Routes performance split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Partner API Health list */}
            <div className="lg:col-span-6 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Server className="w-4 h-4 text-sky-400" />
                Global Partner GDS & Direct API Performance
              </h3>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {partners.map(p => (
                  <div key={p.id} className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{p.name}</span>
                        <span className="text-[9px] font-mono text-slate-500">({p.type})</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">Latency: {p.latencyMs}ms • Success Rate: {p.successRate}%</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[9.5px] font-mono font-bold uppercase ${
                        p.status === "Healthy" 
                          ? "text-emerald-500" 
                          : p.status === "Degraded" 
                            ? "text-amber-500" 
                            : "text-rose-500"
                      }`}>
                        {p.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-300">Vol: {p.bookingVolume.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gateway API routes response time percentiles */}
            <div className="lg:col-span-6 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                Regional Gateway API Route Response Percentiles (Latency)
              </h3>

              <div className="space-y-3.5">
                {apiRoutes.map((route, i) => (
                  <div key={i} className="space-y-1.5 bg-slate-950 border border-slate-900 p-3 rounded-xl">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="font-mono text-indigo-400 truncate max-w-[280px]">{route.route}</span>
                      <span className="text-[10px] font-mono text-slate-500">{route.requestsPerSecond} QPS</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
                      <div className="bg-slate-900/50 p-1.5 border border-slate-850 rounded">
                        <span className="text-[8px] font-mono text-slate-500 uppercase block">P50 (Median)</span>
                        <span className="font-mono text-slate-200">{route.p50Ms}ms</span>
                      </div>
                      <div className="bg-slate-900/50 p-1.5 border border-slate-850 rounded">
                        <span className="text-[8px] font-mono text-slate-500 uppercase block">P90</span>
                        <span className="font-mono text-amber-500">{route.p90Ms}ms</span>
                      </div>
                      <div className="bg-slate-900/50 p-1.5 border border-slate-850 rounded">
                        <span className="text-[8px] font-mono text-slate-500 uppercase block">P99 (SLA Tail)</span>
                        <span className={`font-mono ${route.p99Ms > 1000 ? "text-rose-500" : "text-emerald-450"}`}>{route.p99Ms}ms</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Live Fraud Audit logs and Security Indexing */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                Real-time Fraud & API Abuse Security Audit Logs
              </h3>
              <span className="text-[9px] font-mono text-slate-500 uppercase">Gateway threat protection active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {fraudAlerts.map(alert => (
                <div key={alert.id} className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-500">{alert.timestamp} • IP {alert.ip}</span>
                    <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border ${
                      alert.action === "Blocked" 
                        ? "bg-rose-950 text-rose-400 border-rose-900/30" 
                        : alert.action === "Flagged" 
                          ? "bg-amber-950 text-amber-400 border-amber-900/30" 
                          : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}>
                      {alert.action}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-200 leading-tight">{alert.triggerReason}</p>
                  
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-900">
                    <span className="text-[10px] font-mono text-slate-450">Country: <span className="font-bold text-slate-300">{alert.country}</span></span>
                    <span className="text-[10.5px] font-mono font-bold text-rose-500">Threat score: {alert.score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: A/B TESTING IMPACT */}
      {/* ==================================================== */}
      {activeSubTab === "ab_testing" && (
        <div className="space-y-6">
          
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-amber-500" />
                  Cohort Split Testing Performance Matrix
                </h3>
                <p className="text-xs text-slate-400">Evaluate user conversion, retention, revenue lift, and system SLA impact per active variant.</p>
              </div>

              {/* Selector for active test */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setActiveAbTestKey("price_precision_rounding")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    activeAbTestKey === "price_precision_rounding" 
                      ? "bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold" 
                      : "bg-slate-950 border border-slate-900 text-slate-400"
                  }`}
                >
                  EXP-902: Fare Rounding Psychology
                </button>
                <button
                  onClick={() => setActiveAbTestKey("personalization_carousels")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    activeAbTestKey === "personalization_carousels" 
                      ? "bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold" 
                      : "bg-slate-950 border border-slate-900 text-slate-400"
                  }`}
                >
                  EXP-1014: Collaborative Filter Deals
                </button>
              </div>
            </div>

            {/* Active Test Variant Comparison details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {abTests[activeAbTestKey]?.map((variant, i) => {
                const isVariantB = variant.key === "variant_b";
                return (
                  <div key={i} className={`p-5 rounded-2xl border ${
                    isVariantB 
                      ? "bg-slate-900/60 border-indigo-500/30 shadow-indigo-950/20 shadow-md" 
                      : "bg-slate-950 border-slate-900"
                  } space-y-4`}>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          isVariantB ? "bg-indigo-950 text-indigo-400" : "bg-slate-900 text-slate-400"
                        }`}>
                          {variant.key.toUpperCase()} • {variant.trafficSplit}% Traffic Split
                        </span>
                        <h4 className="text-sm font-black text-slate-100 tracking-tight mt-1">{variant.name}</h4>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 font-mono block">REVENUE GENERATED</span>
                        <span className="text-sm font-black font-mono text-slate-200">${variant.revenue.toLocaleString()} USD</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-900 text-center">
                        <span className="text-[8px] font-mono text-slate-500 block uppercase">Conversion Yield</span>
                        <span className="text-lg font-black font-mono text-slate-100">
                          {((variant.bookings / variant.searches) * 100).toFixed(2)}%
                        </span>
                      </div>

                      <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-900 text-center">
                        <span className="text-[8px] font-mono text-slate-500 block uppercase">Gateway SLA Lag</span>
                        <span className="text-lg font-black font-mono text-slate-100">{variant.latencyMs}ms</span>
                      </div>

                      <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-900 text-center">
                        <span className="text-[8px] font-mono text-slate-500 block uppercase">Bounce Rate</span>
                        <span className="text-lg font-black font-mono text-slate-100">{variant.bounceRate}%</span>
                      </div>
                    </div>

                    {/* Progress representation */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Offers Clicked / Viewed</span>
                        <span>{variant.clicks.toLocaleString()} clicks</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isVariantB ? "bg-indigo-500" : "bg-slate-600"}`} 
                          style={{ width: `${(variant.clicks / variant.searches) * 100}%` }} 
                        />
                      </div>
                    </div>

                  </div>
                );
              })}

            </div>

            {/* Simulated Lift calculation */}
            {abTests[activeAbTestKey] && (
              <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-950 border border-indigo-900 rounded-lg">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-200 uppercase">Estimated Statistical Significance Reached</h4>
                    <p className="text-[11px] text-slate-450 leading-tight">Confidence score is 99.84% (p-value = 0.0016). Recommended to promote Variant B to 100% production routing.</p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-3 rounded-lg text-center shrink-0 min-w-[150px]">
                  <span className="text-[8px] font-mono text-indigo-400 block uppercase font-bold">REVENUE DELTA (LIFT)</span>
                  <span className="text-base font-black font-mono text-emerald-450">+13.36%</span>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: LAKEHOUSE DATA PIPELINE */}
      {/* ==================================================== */}
      {activeSubTab === "warehouse" && (
        <div className="space-y-6">
          
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-400" />
              Real-time FlySmart Lakehouse Data Warehouse Architecture Blueprint
            </h3>
            <p className="text-xs text-slate-400">
              Interactive visualization of our modern decoupled travel intelligence data architecture. Real-time client clicks and GDS logs are captured via Apache Kafka, transformed with Apache Spark, schema-managed by dbt, and queryable in our Snowflake database and Presto clusters.
            </p>

            {/* Warehouse Visual flow block */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-6 overflow-x-auto">
              <div className="min-w-[800px] flex items-stretch justify-between relative py-4">
                
                {/* Horizontal flow line arrows */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 border-t border-dashed border-slate-800 pointer-events-none" />

                {/* Block 1: Event Sources */}
                <div className="w-[170px] bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-4 relative z-10">
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono text-indigo-400 block uppercase font-bold">1. EVENTS SOURCE</span>
                    <h4 className="text-xs font-black text-slate-200">Raw Client Telemetry</h4>
                  </div>
                  <ul className="text-[9.5px] font-mono text-slate-450 space-y-1.5">
                    <li className="flex items-center gap-1.5"><MousePointerClick className="w-3 h-3 text-sky-400" /> Flight Searches</li>
                    <li className="flex items-center gap-1.5"><DollarSign className="w-3 h-3 text-emerald-400" /> Booking checkout</li>
                    <li className="flex items-center gap-1.5"><Cpu className="w-3 h-3 text-amber-500" /> GDS Cache misses</li>
                  </ul>
                  <div className="text-[8.5px] bg-slate-950 p-1.5 border border-slate-800 text-slate-500 font-mono text-center">
                    JSON Payload Format
                  </div>
                </div>

                {/* Arrow */}
                <div className="self-center z-10">
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </div>

                {/* Block 2: Ingestion & Buffering */}
                <div className="w-[170px] bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-4 relative z-10">
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono text-sky-400 block uppercase font-bold">2. INGESTION BUFFER</span>
                    <h4 className="text-xs font-black text-slate-200">Apache Kafka Cluster</h4>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Partition counts:</span>
                      <span className="text-slate-200">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Retention hours:</span>
                      <span className="text-slate-200">72 hrs</span>
                    </div>
                  </div>
                  <div className="text-[8.5px] bg-slate-950 p-1.5 border border-slate-850 text-sky-400 font-mono text-center">
                    Topic: `fct-telemetry`
                  </div>
                </div>

                {/* Arrow */}
                <div className="self-center z-10">
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </div>

                {/* Block 3: Distributed Stream Processing */}
                <div className="w-[170px] bg-slate-900/90 border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-4 relative z-10">
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono text-amber-500 block uppercase font-bold">3. TRANSFORM ENGINE</span>
                    <h4 className="text-xs font-black text-slate-200">Apache Spark / dbt</h4>
                  </div>
                  <p className="text-[9.5px] font-mono text-slate-450 leading-relaxed">
                    Minutely windowed aggregations running on Kubernetes pods to compute real-time Conversion rate & A/B significance index.
                  </p>
                  <div className="text-[8.5px] bg-slate-950 p-1.5 border border-slate-850 text-amber-500 font-mono text-center">
                    dbt Daily Materialization
                  </div>
                </div>

                {/* Arrow */}
                <div className="self-center z-10">
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </div>

                {/* Block 4: Target Warehouse Storage */}
                <div className="w-[170px] bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-4 relative z-10">
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono text-emerald-400 block uppercase font-bold">4. CLOUD WAREHOUSE</span>
                    <h4 className="text-xs font-black text-slate-200">Snowflake / BigQuery</h4>
                  </div>
                  <div className="space-y-1 text-[9.5px] font-mono text-slate-450">
                    <div>- `fact_bookings_v2`</div>
                    <div>- `dim_user_profiles`</div>
                    <div>- `fact_cache_performance`</div>
                  </div>
                  <div className="text-[8.5px] bg-emerald-950 text-emerald-400 border border-emerald-900/30 p-1.5 font-mono text-center rounded">
                    Parquet Optimized Columnar
                  </div>
                </div>

              </div>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sky-400" />
                Engineering Pipeline & Schema Specification Guidelines
              </h4>
              <p className="text-slate-450 leading-relaxed">
                Our streaming stack operates decoupled storage and compute. Event triggers emitted from client WebSockets bypass heavy OLTP relational limits. They stream straight into standard S3 buckets via Kafka, enabling low-cost analytical reads using distributed presto query configurations without degrading flight search engines.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: BI EXPLORER & SQL */}
      {/* ==================================================== */}
      {activeSubTab === "bi_explorer" && (
        <div className="space-y-6">
          
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-400 animate-pulse" />
                FlySmart Business Intelligence SQL Ad-Hoc Workspace
              </h3>
              <span className="text-[9px] font-mono text-slate-500 uppercase">Decoupled analytical query engine</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Query Templates Selection & Editor */}
              <div className="lg:col-span-4 space-y-4">
                
                <div className="space-y-2">
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">1. Select Query Template</label>
                  <div className="space-y-2">
                    {sqlTemplates.map((template, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSqlQuery(template.query)}
                        className="w-full text-left bg-slate-950 hover:bg-slate-900 border border-slate-900 p-2.5 rounded-xl transition-all block cursor-pointer"
                      >
                        <span className="text-xs font-bold text-slate-200 block">{template.name}</span>
                        <span className="text-[8.5px] font-mono text-slate-500 block truncate font-semibold mt-0.5">{template.query}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Controls and Export */}
                <div className="bg-slate-950 p-4 border border-slate-900 rounded-xl space-y-3">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Query Operations</span>
                  <div className="space-y-2">
                    <button
                      onClick={executeSqlQuery}
                      disabled={queryProcessing}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-slate-100 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      {queryProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-100" />
                          <span>Processing Trino Query...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 text-slate-100" />
                          <span>Execute Query (F5)</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        alert("Exporting query results payload.csv to download stream...");
                      }}
                      className="w-full bg-slate-900 border border-slate-850 text-slate-350 hover:text-slate-100 hover:bg-slate-850 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export to CSV File</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Live SQL editor & Result View */}
              <div className="lg:col-span-8 space-y-4">
                
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">2. SQL Query Editor (Read-Only Analytical Pool)</label>
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-xs">
                    <textarea
                      value={activeSqlQuery}
                      onChange={(e) => setActiveSqlQuery(e.target.value)}
                      className="w-full h-32 bg-transparent text-emerald-400 font-mono outline-none resize-none leading-relaxed border-none focus:ring-0"
                      placeholder="SELECT * FROM fact_bookings LIMIT 100;"
                    />
                  </div>
                </div>

                {/* Query execution tables */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">3. Query Results Table</label>
                  
                  <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden min-h-[200px]">
                    {queryProcessing ? (
                      <div className="flex items-center justify-center h-[200px] text-xs text-slate-500 gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                        <span>Scanning partitioned S3 parquet storage blocks...</span>
                      </div>
                    ) : queryResults ? (
                      <div className="overflow-x-auto text-xs">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 font-mono text-[9px] uppercase">
                              {queryColumns.map((col, idx) => (
                                <th key={idx} className="p-3 font-bold">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {queryResults.map((row, rowIdx) => (
                              <tr key={rowIdx} className="border-b border-slate-900 hover:bg-slate-900/50 transition-all font-mono font-semibold text-slate-300">
                                {queryColumns.map((col, colIdx) => {
                                  const value = row[col];
                                  return (
                                    <td key={colIdx} className="p-3">
                                      {typeof value === 'number' && col.includes('revenue') ? `$${value.toLocaleString()}` : value.toLocaleString()}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[200px] text-xs text-slate-500">
                        No active query payload computed. Click Execute Query to parse datasets.
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
