import React, { useState, useEffect, useCallback } from "react";
import { 
  Activity, 
  Server, 
  Database, 
  Zap, 
  ShieldAlert, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Download, 
  SlidersHorizontal, 
  Search, 
  Terminal, 
  Cpu, 
  Layers, 
  DollarSign,
  Copy,
  ChevronDown,
  ChevronUp,
  Flame,
  Radio,
  Filter
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  Legend 
} from "recharts";

interface OverviewMetrics {
  totalRps: number;
  totalRpm: number;
  overallErrorRate: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  cacheHitRate: number;
  l1EdgeHitRate: number;
  l2RedisHitRate: number;
  l3SpannerMissRate: number;
  gdsCostSavedPerMin: number;
  gdsCostSavedPerHour: number;
  activeInstances: number;
  activeConnections: number;
}

interface RequestRatePoint {
  time: string;
  requests: number;
  searchReqs: number;
  pricingReqs: number;
  bookingReqs: number;
  otherReqs: number;
  error4xx: number;
  error5xx: number;
  latencyMs: number;
}

interface CacheMetricPoint {
  time: string;
  l1HitRate: number;
  l2HitRate: number;
  missRate: number;
  gdsCostSavedDollars: number;
}

interface MicroserviceHealth {
  id: string;
  name: string;
  status: "healthy" | "degraded" | "critical";
  rps: number;
  latencyMs: number;
  errorRate: number;
  cacheHitRate: number;
  instances: number;
  cpuUsage: number;
  memoryUsageGb: number;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  service: string;
  level: "CRITICAL" | "ERROR" | "WARN";
  statusCode: number;
  message: string;
  requestId: string;
  traceId: string;
  stackTrace: string;
  impact: string;
}

interface HealthDataResponse {
  timestamp: string;
  status: "HEALTHY" | "DEGRADED" | "CRITICAL";
  overview: OverviewMetrics;
  requestRateHistory: RequestRatePoint[];
  cacheMetricsHistory: CacheMetricPoint[];
  microservices: MicroserviceHealth[];
  errorLogs: ErrorLog[];
}

export default function SystemHealthDashboard() {
  const [healthData, setHealthData] = useState<HealthDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(3); // 0 means paused
  const [isSpikeMode, setIsSpikeMode] = useState<boolean>(false);
  const [isErrorSurgeMode, setIsErrorSurgeMode] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [copiedTraceId, setCopiedTraceId] = useState<string | null>(null);

  // Error log filters
  const [logSearchQuery, setLogSearchQuery] = useState<string>("");
  const [selectedLogLevel, setSelectedLogLevel] = useState<string>("ALL");
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>("ALL");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Client-side fallback generator if API fails or in static mode
  const generateFallbackData = useCallback((): HealthDataResponse => {
    const now = new Date();
    const historyLength = 20;
    const reqHistory: RequestRatePoint[] = [];
    const cacheHistory: CacheMetricPoint[] = [];
    const baseRps = isSpikeMode ? 29200 : 14800;
    const errRate = isErrorSurgeMode ? 3.8 : 0.08;

    for (let i = historyLength - 1; i >= 0; i--) {
      const timePoint = new Date(now.getTime() - i * 3000);
      const timeStr = timePoint.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const variance = (Math.sin(i * 0.5) * 850) + ((Math.random() - 0.5) * 500);
      const rps = Math.round(baseRps + variance + (i === 0 && isSpikeMode ? 5500 : 0));
      
      const searchReqs = Math.round(rps * 0.58);
      const pricingReqs = Math.round(rps * 0.22);
      const bookingReqs = Math.round(rps * 0.12);
      const otherReqs = rps - (searchReqs + pricingReqs + bookingReqs);

      reqHistory.push({
        time: timeStr,
        requests: rps,
        searchReqs,
        pricingReqs,
        bookingReqs,
        otherReqs,
        error4xx: Math.round(rps * (errRate / 100) * 0.7),
        error5xx: Math.round(rps * (errRate / 100) * 0.3),
        latencyMs: Math.round(18 + Math.random() * 5 + (isSpikeMode ? 14 : 0))
      });

      const l1 = +(72.1 + Math.sin(i * 0.3) * 2.5).toFixed(1);
      const l2 = +(22.5 - Math.sin(i * 0.3) * 1.8).toFixed(1);
      const miss = +(100 - (l1 + l2)).toFixed(1);

      cacheHistory.push({
        time: timeStr,
        l1HitRate: l1,
        l2HitRate: l2,
        missRate: miss,
        gdsCostSavedDollars: Math.round((rps * ((l1 + l2) / 100)) * 0.02 * 3600 / 1000)
      });
    }

    const latestRps = reqHistory[reqHistory.length - 1].requests;
    const latestL1 = cacheHistory[cacheHistory.length - 1].l1HitRate;
    const latestL2 = cacheHistory[cacheHistory.length - 1].l2HitRate;
    const totalHit = +(latestL1 + latestL2).toFixed(1);

    return {
      timestamp: now.toISOString(),
      status: isErrorSurgeMode ? "DEGRADED" : "HEALTHY",
      overview: {
        totalRps: latestRps,
        totalRpm: latestRps * 60,
        overallErrorRate: errRate,
        avgLatencyMs: Math.round(18.4 + (isSpikeMode ? 14 : 0)),
        p50LatencyMs: 11.2,
        p95LatencyMs: 41.8,
        p99LatencyMs: 86.4,
        cacheHitRate: totalHit,
        l1EdgeHitRate: latestL1,
        l2RedisHitRate: latestL2,
        l3SpannerMissRate: +(100 - totalHit).toFixed(1),
        gdsCostSavedPerMin: Math.round((latestRps * (totalHit / 100)) * 0.02 * 60),
        gdsCostSavedPerHour: Math.round((latestRps * (totalHit / 100)) * 0.02 * 3600),
        activeInstances: 344,
        activeConnections: Math.round(latestRps * 3.8)
      },
      requestRateHistory: reqHistory,
      cacheMetricsHistory: cacheHistory,
      microservices: [
        { id: "search-adapter", name: "Go Multi-GDS Search Adapter", status: isSpikeMode ? "degraded" : "healthy", rps: Math.round(latestRps * 0.58), latencyMs: 24, errorRate: +(errRate * 0.6).toFixed(2), cacheHitRate: 96.2, instances: 128, cpuUsage: isSpikeMode ? 88.4 : 42.1, memoryUsageGb: 18.4 },
        { id: "pricing-engine", name: "Pricing & Fare Lock Service", status: "healthy", rps: Math.round(latestRps * 0.22), latencyMs: 14, errorRate: +(errRate * 0.3).toFixed(2), cacheHitRate: 91.8, instances: 64, cpuUsage: 38.6, memoryUsageGb: 12.2 },
        { id: "booking-saga", name: "Saga Booking Orchestrator", status: isErrorSurgeMode ? "degraded" : "healthy", rps: Math.round(latestRps * 0.12), latencyMs: 42, errorRate: +(errRate * 1.2).toFixed(2), cacheHitRate: 84.5, instances: 32, cpuUsage: 51.2, memoryUsageGb: 8.6 },
        { id: "flink-mistake", name: "Apache Flink Mistake-Fare Stream", status: "healthy", rps: Math.round(latestRps * 0.95), latencyMs: 4, errorRate: 0.01, cacheHitRate: 99.1, instances: 24, cpuUsage: 29.3, memoryUsageGb: 32.0 },
        { id: "ml-predict", name: "Python ML Price Predictor", status: "healthy", rps: Math.round(latestRps * 0.18), latencyMs: 38, errorRate: 0.05, cacheHitRate: 94.0, instances: 48, cpuUsage: 61.4, memoryUsageGb: 28.5 },
        { id: "redis-cluster", name: "L2 Redis Multi-Region Cluster", status: "healthy", rps: Math.round(latestRps * 1.45), latencyMs: 1.2, errorRate: 0.00, cacheHitRate: 98.8, instances: 16, cpuUsage: 24.1, memoryUsageGb: 184.2 },
        { id: "spanner-db", name: "Cloud Spanner Global Database", status: "healthy", rps: Math.round(latestRps * 0.28), latencyMs: 8.5, errorRate: 0.02, cacheHitRate: 88.2, instances: 12, cpuUsage: 33.8, memoryUsageGb: 96.0 },
        { id: "kafka-eventbus", name: "Kafka Event Streaming Hub", status: "healthy", rps: Math.round(latestRps * 2.10), latencyMs: 2.1, errorRate: 0.00, cacheHitRate: 99.9, instances: 20, cpuUsage: 19.5, memoryUsageGb: 48.0 }
      ],
      errorLogs: [
        {
          id: "err-104921",
          timestamp: new Date(now.getTime() - 4000).toISOString(),
          service: "search-adapter-sabre",
          level: isErrorSurgeMode ? "CRITICAL" : "ERROR",
          statusCode: 504,
          message: "Sabre GDS NDC connection timeout after 450ms on route JFK-LHR",
          requestId: "req-9a8f7b-66a1",
          traceId: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
          stackTrace: "TimeoutError: Sabre XML Gateway HTTP 504 Gateway Timeout\n  at SabreAdapter.queryFlightOffers (/app/adapters/sabre.go:142)\n  at SearchOrchestrator.ParallelQuery (/app/services/search.go:88)",
          impact: "Fallback triggered: served L2 Redis cached fare snapshot (staleness 1.4s)"
        },
        {
          id: "err-298102",
          timestamp: new Date(now.getTime() - 14000).toISOString(),
          service: "pricing-engine-locks",
          level: "WARN",
          statusCode: 429,
          message: "Amadeus FareLock rate-limit warning: 92% quota consumed in rolling window",
          requestId: "req-3f2e1a-88b9",
          traceId: "00-8ca12b4561a04d21b7ce339d0e0e4711-00a127bb0ba902c2-01",
          stackTrace: "QuotaWarning: RateLimiter bucket threshold exceeded\n  at AmadeusLimiter.AcquireToken (/app/pricing/limiter.go:64)",
          impact: "Throttled low-priority partner queries to preserve direct user booking locks"
        },
        {
          id: "err-382910",
          timestamp: new Date(now.getTime() - 28000).toISOString(),
          service: "flink-mistake-fare-stream",
          level: "WARN",
          statusCode: 200,
          message: "Anomaly detection trigger: Flight NYC->TYO dropped by 68% ($310 vs $980 avg)",
          requestId: "req-7c4d0e-11f4",
          traceId: "00-11aa22bb33cc44dd55ee66ff77889900-1234567890abcdef-01",
          stackTrace: "FlinkStreamAlert: StandardDeviationExceeded (>3.2 sigma)\n  at FareAnomalyProcessor.processElement (/app/flink/anomaly.java:91)",
          impact: "Mistake fare event broadcasted to Kafka topic `prediction.anomaly.detected`"
        },
        {
          id: "err-482019",
          timestamp: new Date(now.getTime() - 42000).toISOString(),
          service: "saga-booking-orchestrator",
          level: isErrorSurgeMode ? "CRITICAL" : "ERROR",
          statusCode: 500,
          message: "Payment Gateway idempotent retry conflict on booking PNR `FL-88192`",
          requestId: "req-12ab34-cd56",
          traceId: "00-99887766554433221100aabbccddeeff-fedcba0987654321-01",
          stackTrace: "SagaCompensationError: Stripe charge state ambiguous during NetworkPartition\n  at SagaOrchestrator.CompensateTransaction (/app/sagas/booking.go:210)",
          impact: "Compensating transaction executed: released inventory lock, notified user via SMS"
        },
        {
          id: "err-591028",
          timestamp: new Date(now.getTime() - 65000).toISOString(),
          service: "auth-gateway-oauth",
          level: "WARN",
          statusCode: 401,
          message: "JWT signature verification failed for expired token from IP 185.220.101.4",
          requestId: "req-00ff11-2233",
          traceId: "00-a1b2c3d4e5f60718293a4b5c6d7e8f90-0f9e8d7c6b5a4321-01",
          stackTrace: "TokenExpiredException: jwt expired at 2026-08-13T03:55:00Z\n  at AuthMiddleware.VerifyToken (/app/auth/jwt.go:78)",
          impact: "Blocked unauthorized request at Edge API Gateway layer"
        }
      ]
    };
  }, [isSpikeMode, isErrorSurgeMode]);

  // Fetch telemetry metrics from backend mock API
  const fetchTelemetry = useCallback(async () => {
    try {
      const url = `/api/system-health?spike=${isSpikeMode}&errorSurge=${isErrorSurgeMode}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: HealthDataResponse = await response.json();
      setHealthData(data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.warn("Failed to fetch system-health API, using live fallback metrics", err);
      setHealthData(generateFallbackData());
      setLastUpdated(new Date());
      setLoading(false);
    }
  }, [isSpikeMode, isErrorSurgeMode, generateFallbackData]);

  // Initial load and polling interval
  useEffect(() => {
    fetchTelemetry();

    if (refreshIntervalSec === 0) return;

    const timer = setInterval(() => {
      fetchTelemetry();
    }, refreshIntervalSec * 1000);

    return () => clearInterval(timer);
  }, [fetchTelemetry, refreshIntervalSec]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTraceId(text);
    setTimeout(() => setCopiedTraceId(null), 2000);
  };

  const handleExportJSON = () => {
    if (!healthData) return;
    const blob = new Blob([JSON.stringify(healthData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flysmart-telemetry-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !healthData) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center p-12 bg-slate-900/40 border border-slate-800 rounded-2xl backdrop-blur-sm">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-300">Connecting to Real-time System Telemetry Feed...</p>
        <p className="text-xs text-slate-500 mt-1">Ingesting metrics from 344 microservice nodes & Multi-Tier Edge Caches</p>
      </div>
    );
  }

  const { overview, requestRateHistory, cacheMetricsHistory, microservices, errorLogs } = healthData;

  // Filter error logs
  const filteredLogs = errorLogs.filter((log) => {
    const matchesQuery = 
      log.message.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.service.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.traceId.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.requestId.toLowerCase().includes(logSearchQuery.toLowerCase());

    const matchesLevel = selectedLogLevel === "ALL" || log.level === selectedLogLevel;
    const matchesService = selectedServiceFilter === "ALL" || log.service.includes(selectedServiceFilter);

    return matchesQuery && matchesLevel && matchesService;
  });

  return (
    <div className="space-y-6">
      {/* --- DASHBOARD HEADER & CONTROLS --- */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl relative overflow-hidden">
        {/* Subtle background gradient glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-950/80 border border-sky-500/30 text-sky-400">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-slate-100 tracking-tight">Real-Time System Health & Telemetry Dashboard</h2>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border ${
                    healthData.status === "HEALTHY" 
                      ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30" 
                      : "bg-rose-950/80 text-rose-400 border-rose-500/30 animate-pulse"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${healthData.status === "HEALTHY" ? "bg-emerald-400 animate-ping" : "bg-rose-400"}`} />
                    {healthData.status === "HEALTHY" ? "SYSTEM OPERATIONAL" : "DEGRADED PERFORMANCE"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Monitoring live request rates, multi-tier cache efficiency, microservices cluster health, and real-time trace exceptions.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Telemetry Control Toolbar */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 border border-slate-800 p-2 rounded-xl">
            {/* Auto Refresh selector */}
            <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Refresh:</span>
              <select 
                value={refreshIntervalSec} 
                onChange={(e) => setRefreshIntervalSec(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value={1}>1s Live</option>
                <option value={3}>3s Normal</option>
                <option value={5}>5s Eco</option>
                <option value={0}>Paused</option>
              </select>
            </div>

            <div className="h-4 w-px bg-slate-800 mx-0.5" />

            {/* Traffic Spike Simulation Toggle */}
            <button
              onClick={() => setIsSpikeMode(!isSpikeMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSpikeMode 
                  ? "bg-amber-950 border border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/10" 
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
              title="Simulate sudden 2x search traffic spike"
            >
              <Flame className={`w-3.5 h-3.5 ${isSpikeMode ? "text-amber-400 animate-bounce" : ""}`} />
              <span>{isSpikeMode ? "Traffic Spike ON" : "Simulate Spike"}</span>
            </button>

            {/* Error Surge Simulation Toggle */}
            <button
              onClick={() => setIsErrorSurgeMode(!isErrorSurgeMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isErrorSurgeMode 
                  ? "bg-rose-950 border border-rose-500/40 text-rose-300 shadow-lg shadow-rose-500/10" 
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
              title="Simulate GDS upstream outage / error surge"
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${isErrorSurgeMode ? "text-rose-400 animate-pulse" : ""}`} />
              <span>{isErrorSurgeMode ? "Error Surge ON" : "Simulate Outage"}</span>
            </button>

            <div className="h-4 w-px bg-slate-800 mx-0.5" />

            {/* Manual Refresh button */}
            <button
              onClick={fetchTelemetry}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Manual Telemetry Pull"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Export Telemetry JSON */}
            <button
              onClick={handleExportJSON}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Download Diagnostics JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Ticker info */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Cluster Nodes: <strong className="text-slate-200">{overview.activeInstances} Active Pods</strong></span>
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="hidden sm:inline">Active Socket Connections: <strong className="text-slate-200">{overview.activeConnections.toLocaleString()}</strong></span>
          </div>

          <div className="text-slate-500">
            Last Synced: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* --- TOP METRIC KPI CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Real-Time Request Rate */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Request Throughput</span>
            <div className="p-2 rounded-xl bg-sky-950/60 text-sky-400 border border-sky-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100 font-mono tracking-tight">{overview.totalRps.toLocaleString()}</span>
            <span className="text-xs font-bold text-sky-400 font-mono">req/sec</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>RPM: <strong className="text-slate-200 font-mono">{(overview.totalRpm / 1000).toFixed(1)}k</strong></span>
            <span className="text-slate-500">Avg Latency: <strong className="text-emerald-400 font-mono">{overview.avgLatencyMs}ms</strong></span>
          </div>
        </div>

        {/* KPI 2: Multi-Tier Cache Efficiency */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Multi-Tier Cache Hit Ratio</span>
            <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">{overview.cacheHitRate}%</span>
            <span className="text-xs font-semibold text-slate-400">Hit Rate</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>L1 Edge: <strong className="text-sky-300 font-mono">{overview.l1EdgeHitRate}%</strong></span>
            <span>L2 Redis: <strong className="text-indigo-300 font-mono">{overview.l2RedisHitRate}%</strong></span>
            <span>Miss: <strong className="text-rose-400 font-mono">{overview.l3SpannerMissRate}%</strong></span>
          </div>
        </div>

        {/* KPI 3: GDS API Cost Savings */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cached GDS Savings</span>
            <div className="p-2 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100 font-mono tracking-tight">${overview.gdsCostSavedPerHour.toLocaleString()}</span>
            <span className="text-xs font-bold text-indigo-400 font-mono">/ hour</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Rate: <strong className="text-slate-200 font-mono">${overview.gdsCostSavedPerMin.toLocaleString()}/min</strong></span>
            <span className="text-slate-500">Minimizes GDS XML query fees</span>
          </div>
        </div>

        {/* KPI 4: Global Error Rate */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Global Error Rate</span>
            <div className={`p-2 rounded-xl border ${overview.overallErrorRate > 1.0 ? "bg-rose-950/80 text-rose-400 border-rose-500/30" : "bg-slate-950 text-slate-400 border-slate-800"}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono tracking-tight ${overview.overallErrorRate > 1.0 ? "text-rose-400" : "text-slate-100"}`}>
              {overview.overallErrorRate}%
            </span>
            <span className="text-xs font-semibold text-slate-400">SLO &lt;0.1%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>p95 Latency: <strong className="text-amber-400 font-mono">{overview.p95LatencyMs}ms</strong></span>
            <span>p99 Latency: <strong className="text-rose-400 font-mono">{overview.p99LatencyMs}ms</strong></span>
          </div>
        </div>
      </div>

      {/* --- REAL-TIME CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Real-time Request Rate & Breakdown Stream */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-400" />
                <span>Request Throughput Breakdown (req/sec)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Stream of search adapters, fare locks, booking sagas, and 4xx/5xx responses</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">3s Windows</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={requestRateHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSearch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorPricing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorBooking" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px", color: "#f8fafc" }}
                  itemStyle={{ padding: "2px 0" }}
                />
                <Area type="monotone" dataKey="searchReqs" name="Search Queries" stackId="1" stroke="#38bdf8" fill="url(#colorSearch)" />
                <Area type="monotone" dataKey="pricingReqs" name="Fare Locks" stackId="1" stroke="#818cf8" fill="url(#colorPricing)" />
                <Area type="monotone" dataKey="bookingReqs" name="Booking Sagas" stackId="1" stroke="#34d399" fill="url(#colorBooking)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800/60 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400">Search Parallel Engine</div>
              <div className="text-sky-400 font-bold font-mono mt-0.5">{requestRateHistory[requestRateHistory.length - 1]?.searchReqs.toLocaleString()} rps</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400">Pricing & Lock Engine</div>
              <div className="text-indigo-400 font-bold font-mono mt-0.5">{requestRateHistory[requestRateHistory.length - 1]?.pricingReqs.toLocaleString()} rps</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400">Saga Booking Engine</div>
              <div className="text-emerald-400 font-bold font-mono mt-0.5">{requestRateHistory[requestRateHistory.length - 1]?.bookingReqs.toLocaleString()} rps</div>
            </div>
          </div>
        </div>

        {/* CHART 2: Multi-Tier Cache Hit Rate & Cost Savings Stream */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Multi-Tier Cache Efficiency Stream (%)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">L1 CDN Edge vs L2 Redis Cluster vs L3 Direct Spanner lookups</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">Target &gt;92%</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cacheMetricsHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorL1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorL2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px", color: "#f8fafc" }}
                  formatter={(value: any) => [`${value}%`]}
                />
                <Area type="monotone" dataKey="l1HitRate" name="L1 Edge CDN Hit Rate" stackId="1" stroke="#38bdf8" fill="url(#colorL1)" />
                <Area type="monotone" dataKey="l2HitRate" name="L2 Redis Cluster Hit Rate" stackId="1" stroke="#34d399" fill="url(#colorL2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800/60 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400">L1 CDN Edge (&lt;50ms)</div>
              <div className="text-sky-400 font-bold font-mono mt-0.5">{overview.l1EdgeHitRate}%</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400">L2 Redis Cluster</div>
              <div className="text-emerald-400 font-bold font-mono mt-0.5">{overview.l2RedisHitRate}%</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400">L3 Cache Miss Rate</div>
              <div className="text-rose-400 font-bold font-mono mt-0.5">{overview.l3SpannerMissRate}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MICROSERVICES CLUSTER HEALTH GRID --- */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" />
              <span>Microservices Cluster Mesh Status ({microservices.length} Core Services)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Live CPU utilization, memory allocations, and latency across GKE node pools</p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg">
            Total Pod Pods: <strong className="text-sky-400">{overview.activeInstances}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {microservices.map((service) => (
            <div 
              key={service.id} 
              className={`bg-slate-950/80 border rounded-xl p-4 transition-all hover:scale-[1.01] ${
                service.status === "healthy" 
                  ? "border-slate-800 hover:border-sky-500/30" 
                  : "border-amber-500/40 bg-amber-950/10"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="truncate">
                  <h4 className="text-xs font-bold text-slate-200 truncate">{service.name}</h4>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">{service.instances} Pod Replica Instances</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                  service.status === "healthy" 
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" 
                    : "bg-amber-950 text-amber-400 border border-amber-500/30 animate-pulse"
                }`}>
                  {service.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px]">RPS</span>
                  <strong className="text-slate-200 font-mono">{service.rps.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Latency</span>
                  <strong className="text-emerald-400 font-mono">{service.latencyMs}ms</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CPU Load</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${service.cpuUsage > 80 ? "bg-amber-400" : "bg-sky-400"}`}
                        style={{ width: `${Math.min(100, service.cpuUsage)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-300">{service.cpuUsage}%</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Cache Hit</span>
                  <strong className="text-sky-300 font-mono">{service.cacheHitRate}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- REAL-TIME ERROR LOG STREAM TABLE --- */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-rose-400" />
              <span>Real-Time Error Log & Exception Stream</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Live trace logs, GDS gateway exceptions, and automated fallback mitigations</p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search trace IDs, logs..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 w-44 sm:w-56"
              />
            </div>

            {/* Level Selector */}
            <select
              value={selectedLogLevel}
              onChange={(e) => setSelectedLogLevel(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="ALL">All Levels</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="ERROR">ERROR</option>
              <option value="WARN">WARN</option>
            </select>
          </div>
        </div>

        {/* Error Log List */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2 opacity-60" />
              No matching error logs found in current stream window.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div key={log.id} className="p-3 sm:p-4 hover:bg-slate-900/40 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider shrink-0 ${
                          log.level === "CRITICAL"
                            ? "bg-rose-950 text-rose-400 border border-rose-500/40"
                            : log.level === "ERROR"
                            ? "bg-amber-950 text-amber-400 border border-amber-500/40"
                            : "bg-sky-950 text-sky-400 border border-sky-500/40"
                        }`}>
                          {log.level}
                        </span>

                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                          {log.service}
                        </span>

                        <span className="text-xs font-semibold text-slate-200 truncate">{log.message}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono text-slate-500">
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-sans text-xs cursor-pointer"
                        >
                          <span>{isExpanded ? "Hide Trace" : "View Stack"}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Impact Note pill */}
                    <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2 pl-2 border-l-2 border-sky-500/40">
                      <span className="font-semibold text-sky-300">Automated Mitigation:</span>
                      <span className="text-slate-300">{log.impact}</span>
                    </div>

                    {/* Expanded Stack Trace Details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 bg-slate-900/60 p-3 rounded-lg">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                          <div>
                            Request ID: <strong className="text-slate-200">{log.requestId}</strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Trace ID: <strong className="text-slate-200">{log.traceId.substring(0, 24)}...</strong></span>
                            <button
                              onClick={() => copyToClipboard(log.traceId)}
                              className="p-1 hover:bg-slate-800 rounded text-sky-400 cursor-pointer"
                              title="Copy OpenTelemetry Trace ID"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            {copiedTraceId === log.traceId && (
                              <span className="text-[10px] text-emerald-400">Copied!</span>
                            )}
                          </div>
                        </div>

                        <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-rose-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          {log.stackTrace}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
