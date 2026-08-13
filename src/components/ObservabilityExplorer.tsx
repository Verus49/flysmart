import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Activity, 
  AlertTriangle, 
  ArrowRight, 
  BarChart3, 
  Bell, 
  Bot, 
  Bug, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Database, 
  Flame, 
  Gauge, 
  GitBranch, 
  Globe, 
  Heart, 
  LineChart, 
  Play, 
  Radio, 
  RefreshCw, 
  Server, 
  Shield, 
  Sparkles, 
  Terminal, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  ShieldAlert, 
  Layers, 
  Network, 
  ZapOff, 
  Users, 
  Sliders,
  Eye,
  Settings,
  HelpCircle,
  FileText,
  TrendingUp,
  Search,
  ChevronRight,
  ChevronDown
} from "lucide-react";

// ==========================================
// TYPES & SCHEMAS
// ==========================================
type ChaosMode = "STEADY" | "AMADEUS_LATENCY" | "SABRE_OUTAGE" | "REDIS_EVICTION" | "ML_DRIFT";

interface TraceSpan {
  id: string;
  name: string;
  service: string;
  durationMs: number;
  startTimeOffset: number;
  status: "OK" | "ERROR";
  errorDescription?: string;
  spanKind: "SERVER" | "CLIENT" | "PRODUCER" | "CONSUMER";
  attributes: Record<string, string | number | boolean>;
}

interface StructuredLog {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  service: string;
  message: string;
  traceId: string;
  spanId: string;
  attributes: Record<string, string>;
}

interface Incident {
  id: string;
  title: string;
  severity: "SEV-1" | "SEV-2" | "SEV-3";
  status: "INVESTIGATING" | "IDENTIFIED" | "MITIGATING" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
  owner: string;
  impactMinutes: number;
  incidentCommander: string;
  summary: string;
  timeline: { time: string; event: string }[];
}

export default function ObservabilityExplorer() {
  // Chaos injection control
  const [chaosMode, setChaosMode] = useState<ChaosMode>("STEADY");
  
  // Navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<"slo_dash" | "tracing" | "logs_errors" | "synthetic_edge" | "ml_observability" | "incidents">("slo_dash");

  // Dynamic telemetry tick
  const [ticks, setTicks] = useState<number>(0);

  // Error budget states
  const [errorBudgetRemaining, setErrorBudgetRemaining] = useState<number>(98.42);
  const [totalRequests, setTotalRequests] = useState<number>(1854200);
  const [failedRequests, setFailedRequests] = useState<number>(1240);

  // Incidents list
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: "INC-8812",
      title: "Excessive timeouts on Amadeus GDS flights availability queries",
      severity: "SEV-2",
      status: "RESOLVED",
      createdAt: "2026-06-27 10:14:02",
      updatedAt: "2026-06-27 11:30:15",
      owner: "Reliability Engineering (SRE)",
      impactMinutes: 76,
      incidentCommander: "Marcus Aurelius (SRE Lead)",
      summary: "Amadeus NDC direct API endpoints experienced packet loss within the Frankfurt region. Traffic was dynamically redirected to our Sabre cache pool.",
      timeline: [
        { time: "10:14", event: "Automated Prometheus alert fired: 'Amadeus P99 Latency > 1500ms'" },
        { time: "10:18", event: "Incident bridge established. Marcus Aurelius assigned as Incident Commander." },
        { time: "10:35", event: "Identified routing problem in EU-Central-1 ISP gateway." },
        { time: "11:10", event: "Circuit breaker activated. Dynamic rerouting to standby Sabre endpoints completed." },
        { time: "11:30", event: "Error rates back to normal baseline. Incident declared resolved." }
      ]
    }
  ]);

  // Log buffer
  const [logs, setLogs] = useState<StructuredLog[]>([]);
  const [logFilterService, setLogFilterService] = useState<string>("all");
  const [logFilterLevel, setLogFilterLevel] = useState<string>("all");

  // Dynamic profiling states
  const [cpuProfile, setCpuProfile] = useState<{ name: string; pct: number }[]>([
    { name: "HTTP Request Parsing (Go Gateway)", pct: 14 },
    { name: "JSON Serialization (Search Service)", pct: 28 },
    { name: "Redis Cache Key Hashing", pct: 6 },
    { name: "Gemini Vector Tokenization", pct: 32 },
    { name: "Garbage Collection cycles", pct: 12 },
    { name: "Cryptography & TLS Overheads", pct: 8 }
  ]);

  // Capacity Planning values
  const [storageUtilization, setStorageUtilization] = useState<number>(68.4);
  const [memoryUtilization, setMemoryUtilization] = useState<number>(59.2);
  const [egressSlaUtilization, setEgressSlaUtilization] = useState<number>(42.1);
  const [predictedLimitDays, setPredictedLimitDays] = useState<number>(145);

  // ML models validation drift
  const [mlDataDrift, setMlDataDrift] = useState<number>(0.04); // Kolmogorov-Smirnov metric
  const [predictionMAPE, setPredictionMAPE] = useState<number>(3.15); // Mean Absolute Percentage Error

  // Dynamic values fluctuating depending on Chaos mode
  const currentMetrics = useMemo(() => {
    let multiplier = 1.0;
    let baseLatency = 142;
    let baseCpu = 38;
    let availability = 99.98;
    let qps = 480 + Math.floor(Math.random() * 20);

    if (chaosMode === "AMADEUS_LATENCY") {
      baseLatency = 1250;
      baseCpu = 52;
      availability = 99.45;
      qps = 420;
    } else if (chaosMode === "SABRE_OUTAGE") {
      baseLatency = 2480;
      baseCpu = 85;
      availability = 96.12;
      qps = 310;
    } else if (chaosMode === "REDIS_EVICTION") {
      baseLatency = 450;
      baseCpu = 78;
      availability = 99.85;
      qps = 540; // spike as cache miss causes downstream storm
    } else if (chaosMode === "ML_DRIFT") {
      baseLatency = 165;
      baseCpu = 48;
      availability = 99.96;
    }

    return {
      latencyMs: baseLatency + Math.floor((Math.random() - 0.5) * 15),
      cpuPct: Math.min(100, Math.max(5, baseCpu + Math.floor((Math.random() - 0.5) * 4))),
      availabilityPct: availability,
      qps: qps
    };
  }, [chaosMode, ticks]);

  // Cache stats dynamically calculated based on chaos mode
  const cacheStats = useMemo(() => {
    let hitRatio = 89.4;
    let evictions = 12;
    let readsMs = 1.8;

    if (chaosMode === "REDIS_EVICTION") {
      hitRatio = 34.2;
      evictions = 4510;
      readsMs = 14.2;
    } else if (chaosMode === "SABRE_OUTAGE" || chaosMode === "AMADEUS_LATENCY") {
      hitRatio = 94.1; // More GDS errors cause cache bypass or high cache reads of backup rates
      readsMs = 2.1;
    }

    return {
      hitRatio: Number((hitRatio + (Math.random() - 0.5) * 0.8).toFixed(2)),
      evictions: Math.round(evictions + Math.random() * 5),
      readsMs: Number((readsMs + (Math.random() - 0.5) * 0.2).toFixed(2))
    };
  }, [chaosMode, ticks]);

  // ML statistics drift
  const mlStats = useMemo(() => {
    let accuracy = 96.85;
    let mape = 3.14;
    let dataDrift = 0.04; // low drift is healthy

    if (chaosMode === "ML_DRIFT") {
      accuracy = 78.42;
      mape = 22.15;
      dataDrift = 0.45; // extreme feature drift
    }

    return {
      accuracyPercent: Number((accuracy + (Math.random() - 0.5) * 0.3).toFixed(2)),
      mapePercent: Number((mape + (Math.random() - 0.5) * 0.1).toFixed(2)),
      driftValue: Number((dataDrift + (Math.random() - 0.5) * 0.01).toFixed(3))
    };
  }, [chaosMode, ticks]);

  // Unified SLO target state calculations
  const totalSLICounts = useMemo(() => {
    let reqs = totalRequests + 1200;
    let fails = failedRequests;

    if (chaosMode === "SABRE_OUTAGE") {
      fails += 145;
    } else if (chaosMode === "AMADEUS_LATENCY") {
      fails += 34;
    } else if (chaosMode === "REDIS_EVICTION") {
      fails += 12;
    }

    return {
      requests: reqs,
      fails: fails,
      budget: Number(Math.max(0, errorBudgetRemaining - (fails / reqs) * 100).toFixed(4))
    };
  }, [chaosMode, ticks]);

  // Generate logs on telemetry ticks
  useEffect(() => {
    const timer = setInterval(() => {
      setTicks(prev => prev + 1);

      // Accumulate requests & failed counts
      setTotalRequests(prev => prev + Math.floor(25 + Math.random() * 15));
      if (chaosMode !== "STEADY") {
        setFailedRequests(prev => prev + Math.floor(1 + Math.random() * 4));
        setErrorBudgetRemaining(prev => Math.max(0, prev - (0.0002 + Math.random() * 0.0008)));
      } else {
        if (Math.random() > 0.85) {
          setFailedRequests(prev => prev + 1);
        }
      }

      // Live profiling fluctuations
      setCpuProfile(prev => prev.map(item => {
        let f = (Math.random() - 0.5) * 1.5;
        if (chaosMode === "SABRE_OUTAGE" && item.name.includes("JSON")) f += 4;
        if (chaosMode === "REDIS_EVICTION" && item.name.includes("Redis")) f += 6;
        return { ...item, pct: Math.max(1, Math.min(90, Math.round(item.pct + f))) };
      }));

      // Generate actual structured logs based on active chaos state
      const randomTraceId = () => "tr_" + Math.random().toString(16).substr(2, 16);
      const randomSpanId = () => "sp_" + Math.random().toString(16).substr(2, 16);
      
      const newLogs: StructuredLog[] = [];
      const timestamp = new Date().toISOString().split("T")[1].substring(0, 8);
      const tId = randomTraceId();

      // standard trace
      if (chaosMode === "STEADY") {
        newLogs.push({
          timestamp,
          level: "INFO",
          service: "flysmart-gateway",
          message: "Ingressed search flights request route='/v2/flights/search'",
          traceId: tId,
          spanId: randomSpanId(),
          attributes: { "http.method": "GET", "client.ip": "185.220.101.44" }
        });
        if (Math.random() > 0.6) {
          newLogs.push({
            timestamp,
            level: "INFO",
            service: "search-service",
            message: "Redis cache hit for key 'air_NYC_LON_2026-06-28'",
            traceId: tId,
            spanId: randomSpanId(),
            attributes: { "cache.key": "air_NYC_LON", "cache.type": "redis" }
          });
        }
      } else if (chaosMode === "AMADEUS_LATENCY") {
        newLogs.push({
          timestamp,
          level: "WARN",
          service: "search-service",
          message: "Amadeus GDS partner API took 1280ms to respond. Violating internal 500ms soft SLA.",
          traceId: tId,
          spanId: randomSpanId(),
          attributes: { "partner.name": "Amadeus", "http.status_code": "200" }
        });
      } else if (chaosMode === "SABRE_OUTAGE") {
        newLogs.push({
          timestamp,
          level: "ERROR",
          service: "partner-aggregator",
          message: "Sabre NDC flight reservation call failed with 504 Gateway Timeout. Max retries [3] exceeded.",
          traceId: tId,
          spanId: randomSpanId(),
          attributes: { "partner.name": "Sabre", "error.class": "java.net.SocketTimeoutException" }
        });
        newLogs.push({
          timestamp,
          level: "ERROR",
          service: "search-service",
          message: "Aggregating fallback rates failed. Exception cascading down thread stack. Internal code: EX-GDS-901",
          traceId: tId,
          spanId: randomSpanId(),
          attributes: { "error.code": "EX-GDS-901", "trace.cascade": "true" }
        });
      } else if (chaosMode === "REDIS_EVICTION") {
        newLogs.push({
          timestamp,
          level: "WARN",
          service: "cache-layer",
          message: "Redis memory threshold reached maxmemory='16GB'. Eviction policy volatile-lru active. Terminating stale keys.",
          traceId: tId,
          spanId: randomSpanId(),
          attributes: { "redis.evictions": "4150", "redis.memory": "16.1GB" }
        });
      } else if (chaosMode === "ML_DRIFT") {
        newLogs.push({
          timestamp,
          level: "WARN",
          service: "ml-forecaster",
          message: "Price forecast input distribution check failed. Kolmogorov-Smirnov score: 0.45 exceeds warning threshold of 0.15.",
          traceId: tId,
          spanId: randomSpanId(),
          attributes: { "model.version": "v3.2", "ks_test_drift": "0.45" }
        });
      }

      setLogs(prev => [ ...newLogs, ...prev ].slice(0, 50));

    }, 3000);

    return () => clearInterval(timer);
  }, [chaosMode]);

  // Initialize initial mock logs once on load
  useEffect(() => {
    const initialLogs: StructuredLog[] = [
      { timestamp: "23:14:02", level: "INFO", service: "flysmart-gateway", message: "Gateway instance initialized on dynamic container port 3000", traceId: "tr_init01", spanId: "sp_init01", attributes: { "env": "production" } },
      { timestamp: "23:14:05", level: "INFO", service: "cache-layer", message: "Successfully connected to Redis cluster with 3 master shards", traceId: "tr_init02", spanId: "sp_init02", attributes: { "redis.shards": "3" } },
      { timestamp: "23:14:10", level: "INFO", service: "search-service", message: "Established secure RPC gRPC channel with Partner Aggregator Engine", traceId: "tr_init03", spanId: "sp_init03", attributes: { "grpc.version": "1.52" } },
      { timestamp: "23:15:00", level: "INFO", service: "ml-forecaster", message: "Loaded Fare_Trend_Regressor_v3.2 weights into GPU memory sandbox", traceId: "tr_init04", spanId: "sp_init04", attributes: { "cuda.version": "12.1" } }
    ];
    setLogs(initialLogs);
  }, []);

  // Sync simulated active incidents based on chaos mode
  useEffect(() => {
    if (chaosMode === "SABRE_OUTAGE") {
      // Check if incident already exists
      const exists = incidents.some(inc => inc.id === "INC-9912");
      if (!exists) {
        const timestampStr = new Date().toISOString().replace("T", " ").substring(0, 19);
        const newInc: Incident = {
          id: "INC-9912",
          title: "Sabre NDC API Complete Outage - Cascading HTTP 504",
          severity: "SEV-1",
          status: "INVESTIGATING",
          createdAt: timestampStr,
          updatedAt: timestampStr,
          owner: "FlySmart On-Call SRE Crew",
          impactMinutes: 1,
          incidentCommander: "Marcus Aurelius (SRE Lead)",
          summary: "Core Sabre flight searching & ticketing pipelines are returning socket exceptions, causing our client-facing search funnel to drop by 22%. Error budgets are draining at 8.4x normal rates.",
          timeline: [
            { time: "Just Now", event: "Automated alert: 'Sabre GDS success rate plummeted below 75%'" },
            { time: "Just Now", event: "SEV-1 incident declared automatically. Pagers dispatched to primary/secondary on-call rosters." }
          ]
        };
        setIncidents(prev => [newInc, ...prev]);
        setActiveSubTab("incidents"); // Auto switch for immediate feedback!
      }
    } else if (chaosMode === "AMADEUS_LATENCY") {
      const exists = incidents.some(inc => inc.id === "INC-9913");
      if (!exists) {
        const timestampStr = new Date().toISOString().replace("T", " ").substring(0, 19);
        const newInc: Incident = {
          id: "INC-9913",
          title: "Amadeus API Latency SLA Violation - P99 > 1500ms",
          severity: "SEV-2",
          status: "IDENTIFIED",
          createdAt: timestampStr,
          updatedAt: timestampStr,
          owner: "API Gateway Crew",
          impactMinutes: 5,
          incidentCommander: "Sarah Connor (Platform Lead)",
          summary: "Gateway latency averages skyrocketed due to an unannounced Amadeus network routing alteration in the European central hub.",
          timeline: [
            { time: "5m ago", event: "Prometheus alert triggered: 'Amadeus P99 API Latency SLA exceeded'" },
            { time: "3m ago", event: "Identified packet loss in AWS Transit Gateway. Traffic throttling configured to protect cache layer." }
          ]
        };
        setIncidents(prev => [newInc, ...prev]);
        setActiveSubTab("incidents");
      }
    }
  }, [chaosMode]);

  // Generate interactive distributed tracing spans based on chaos
  const traceSpans = useMemo<TraceSpan[]>(() => {
    const baseTraceId = "tr_abc123xyz";
    
    let gatewayDuration = 185;
    let cacheDuration = 2.4;
    let authDuration = 12;
    let partnerDuration = 140;
    let parserDuration = 30;

    let gatewayStatus: "OK" | "ERROR" = "OK";
    let partnerStatus: "OK" | "ERROR" = "OK";
    let cacheStatus: "OK" | "ERROR" = "OK";
    let partnerErrDesc = "";

    if (chaosMode === "AMADEUS_LATENCY") {
      partnerDuration = 1180;
      gatewayDuration = 1240;
    } else if (chaosMode === "SABRE_OUTAGE") {
      partnerDuration = 2200;
      gatewayDuration = 2260;
      partnerStatus = "ERROR";
      gatewayStatus = "ERROR";
      partnerErrDesc = "java.net.SocketTimeoutException: Connect timed out (Sabre Endpoint)";
    } else if (chaosMode === "REDIS_EVICTION") {
      cacheDuration = 45; // high seek latency
      partnerDuration = 135;
      gatewayDuration = 240;
      cacheStatus = "ERROR"; // warnings
    }

    return [
      {
        id: "sp_01",
        name: "GET /api/v2/flights/search",
        service: "flysmart-gateway",
        durationMs: gatewayDuration,
        startTimeOffset: 0,
        status: gatewayStatus,
        spanKind: "SERVER",
        attributes: { "http.method": "GET", "http.status_code": gatewayStatus === "ERROR" ? 504 : 200, "client.ip": "45.231.114.2", "grpc.calls": 2 }
      },
      {
        id: "sp_02",
        name: "Check Session Token",
        service: "identity-service",
        durationMs: authDuration,
        startTimeOffset: 4,
        status: "OK",
        spanKind: "SERVER",
        attributes: { "auth.type": "JWT", "user.tier": "Elite Frequent Flyer" }
      },
      {
        id: "sp_03",
        name: "Lookup Flight Rates Cache",
        service: "cache-layer",
        durationMs: cacheDuration,
        startTimeOffset: 18,
        status: cacheStatus,
        spanKind: "CLIENT",
        attributes: { "cache.driver": "ioredis", "cache.key": "nyc-lon-2026-06-28", "cache.hit": chaosMode === "REDIS_EVICTION" ? "false" : "true" }
      },
      {
        id: "sp_04",
        name: "Query GDS Partner API",
        service: "partner-aggregator",
        durationMs: partnerDuration,
        startTimeOffset: 24,
        status: partnerStatus,
        errorDescription: partnerErrDesc,
        spanKind: "CLIENT",
        attributes: { "partner.name": "Sabre NDC API", "partner.endpoint": "https://api.sabre.com/v4/shop/flights", "http.retries": 3 }
      },
      {
        id: "sp_05",
        name: "Parse Partner XML Response",
        service: "search-service",
        durationMs: partnerStatus === "ERROR" ? 0 : parserDuration,
        startTimeOffset: 24 + partnerDuration,
        status: partnerStatus,
        spanKind: "SERVER",
        attributes: { "xml.namespaces": 4, "itinerary.count": partnerStatus === "ERROR" ? 0 : 142 }
      }
    ];
  }, [chaosMode]);

  // Synthetic global latency simulation
  const syntheticMonitoring = useMemo(() => {
    let multiplier = 1.0;
    if (chaosMode === "SABRE_OUTAGE") multiplier = 2.4;
    if (chaosMode === "AMADEUS_LATENCY") multiplier = 1.8;

    return [
      { region: "US-East (N. Virginia)", endpoint: "GET /healthz", dnsSec: 0.012, handMs: 24, totalMs: Math.round(48 * multiplier), status: "Healthy" },
      { region: "US-West (Oregon)", endpoint: "GET /healthz", dnsSec: 0.015, handMs: 28, totalMs: Math.round(52 * multiplier), status: "Healthy" },
      { region: "EU-Central (Frankfurt)", endpoint: "GET /healthz", dnsSec: 0.008, handMs: 14, totalMs: Math.round(184 * (chaosMode === "AMADEUS_LATENCY" ? 4.5 : 1)), status: chaosMode === "AMADEUS_LATENCY" ? "Degraded" : "Healthy" },
      { region: "AP-Northeast (Tokyo)", endpoint: "GET /healthz", dnsSec: 0.022, handMs: 42, totalMs: Math.round(112 * multiplier), status: "Healthy" }
    ];
  }, [chaosMode]);

  // Alert Rules Status (Prometheus / Alertmanager representation)
  const alertRules = useMemo(() => {
    return [
      {
        id: "rule-1",
        name: "P99 Gateway Latency Critical SLA Limit",
        expr: "histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1.2",
        duration: "2m",
        severity: "critical",
        status: (chaosMode === "SABRE_OUTAGE" || chaosMode === "AMADEUS_LATENCY") ? "FIRING" : "OK"
      },
      {
        id: "rule-2",
        name: "Partner API Response Status Error Cascade",
        expr: "sum(rate(partner_gds_api_errors_total[2m])) by (partner) / sum(rate(partner_gds_api_requests_total[2m])) > 0.1",
        duration: "1m",
        severity: "critical",
        status: (chaosMode === "SABRE_OUTAGE") ? "FIRING" : "OK"
      },
      {
        id: "rule-3",
        name: "Redis Cache Severe Hit Miss Deficit",
        expr: "redis_keyspace_hits_total / (redis_keyspace_hits_total + redis_keyspace_misses_total) < 0.5",
        duration: "5m",
        severity: "warning",
        status: (chaosMode === "REDIS_EVICTION") ? "FIRING" : "OK"
      },
      {
        id: "rule-4",
        name: "Fare Prediction Regressor Outlier Drift",
        expr: "kolmogorov_smirnov_drift_score{model='Fare_Trend_Regressor'} > 0.25",
        duration: "10m",
        severity: "warning",
        status: (chaosMode === "ML_DRIFT") ? "FIRING" : "OK"
      }
    ];
  }, [chaosMode]);

  // Business KPIs impacted by chaos
  const businessKPIs = useMemo(() => {
    let baseSearches = 4850;
    let conversionRate = 2.84;
    let lostRevEstimate = 0;

    if (chaosMode === "SABRE_OUTAGE") {
      conversionRate = 0.85; // dropped significantly due to failures
      lostRevEstimate = 42500;
    } else if (chaosMode === "AMADEUS_LATENCY") {
      conversionRate = 1.62; // dropped due to latency abandonments
      lostRevEstimate = 18400;
    } else if (chaosMode === "REDIS_EVICTION") {
      conversionRate = 2.25;
      lostRevEstimate = 4100;
    }

    return {
      searchesPerMin: Math.round(baseSearches + (Math.random() - 0.5) * 80),
      conversionPct: conversionRate,
      estimatedLostRevenueUSD: lostRevEstimate
    };
  }, [chaosMode, ticks]);

  // Filter logs locally
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchService = logFilterService === "all" || log.service === logFilterService;
      const matchLevel = logFilterLevel === "all" || log.level === logFilterLevel;
      return matchService && matchLevel;
    });
  }, [logs, logFilterService, logFilterLevel]);

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100" id="observability-and-reliability-command-center">
      
      {/* Platform Header */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-mono font-black uppercase max-w-max flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            Active Prometheus / OpenTelemetry Agent Mesh
          </div>
          <h2 className="text-xl font-black tracking-tight mt-1 text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-rose-500" />
            Reliability & Observability Engineering Center (SRE)
          </h2>
          <p className="text-xs text-slate-400">
            Real-time Distributed Tracing, Logs aggregation, Prometheus SLO monitoring, ML drift validation, and interactive Incident Response. Fully maps to architectural SLA objectives.
          </p>
        </div>

        {/* Quick Steady/Chaos state toggle controls */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 lg:max-w-md w-full">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            SRE Outage & Chaos Injection Console
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            <button
              onClick={() => setChaosMode("STEADY")}
              className={`px-1.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-all uppercase ${
                chaosMode === "STEADY" 
                  ? "bg-emerald-950 text-emerald-450 border border-emerald-500/30 font-black shadow-md shadow-emerald-950/20" 
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Steady
            </button>
            <button
              onClick={() => setChaosMode("AMADEUS_LATENCY")}
              className={`px-1.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-all uppercase ${
                chaosMode === "AMADEUS_LATENCY" 
                  ? "bg-amber-950 text-amber-400 border border-amber-500/30 font-black" 
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
              title="Inject severe latency in Amadeus GDS calls"
            >
              Amadeus Latency
            </button>
            <button
              onClick={() => setChaosMode("SABRE_OUTAGE")}
              className={`px-1.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-all uppercase ${
                chaosMode === "SABRE_OUTAGE" 
                  ? "bg-rose-950 text-rose-400 border border-rose-500/30 font-black" 
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
              title="Sabre NDC GDS API complete outage"
            >
              Sabre Outage
            </button>
            <button
              onClick={() => setChaosMode("REDIS_EVICTION")}
              className={`px-1.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-all uppercase ${
                chaosMode === "REDIS_EVICTION" 
                  ? "bg-sky-950 text-sky-400 border border-sky-500/30 font-black" 
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
              title="Trigger memory eviction storm on Redis clusters"
            >
              Redis Evict
            </button>
            <button
              onClick={() => setChaosMode("ML_DRIFT")}
              className={`px-1.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-all uppercase ${
                chaosMode === "ML_DRIFT" 
                  ? "bg-indigo-950 text-indigo-450 border border-indigo-500/30 font-black" 
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
              title="Inject feature drift in fare forecaster ML models"
            >
              ML Drift
            </button>
          </div>
        </div>
      </div>

      {/* SRE Sub navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-850 pb-2">
        <button
          onClick={() => setActiveSubTab("slo_dash")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "slo_dash" 
              ? "bg-slate-900 border border-slate-800 text-indigo-400" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Gauge className="w-4 h-4 text-indigo-400" />
          <span>SLO / SLI & Capacity Planning</span>
        </button>

        <button
          onClick={() => setActiveSubTab("tracing")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "tracing" 
              ? "bg-slate-900 border border-slate-800 text-rose-500" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <GitBranch className="w-4 h-4 text-rose-500" />
          <span>Distributed Tracing Spans</span>
        </button>

        <button
          onClick={() => setActiveSubTab("logs_errors")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "logs_errors" 
              ? "bg-slate-900 border border-slate-800 text-sky-400" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Terminal className="w-4 h-4 text-sky-400" />
          <span>Structured Logs & Profiling</span>
        </button>

        <button
          onClick={() => setActiveSubTab("synthetic_edge")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "synthetic_edge" 
              ? "bg-slate-900 border border-slate-800 text-amber-500" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Globe className="w-4 h-4 text-amber-500" />
          <span>Synthetic Edge & Cache SLAs</span>
        </button>

        <button
          onClick={() => setActiveSubTab("ml_observability")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "ml_observability" 
              ? "bg-slate-900 border border-slate-800 text-indigo-450" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Bot className="w-4 h-4 text-indigo-400" />
          <span>ML Model Observability</span>
        </button>

        <button
          onClick={() => setActiveSubTab("incidents")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
            activeSubTab === "incidents" 
              ? "bg-slate-900 border border-slate-800 text-rose-500 font-black" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Flame className="w-4 h-4 text-rose-500" />
          <span>Incident War Room</span>
          {incidents.some(i => i.status !== "RESOLVED") && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce border border-slate-950">
              {incidents.filter(i => i.status !== "RESOLVED").length}
            </span>
          )}
        </button>
      </div>

      {/* ==================================================== */}
      {/* SUB-TAB 1: UNIFIED SLO/SLI & CAPACITY PLANNING */}
      {/* ==================================================== */}
      {activeSubTab === "slo_dash" && (
        <div className="space-y-6">
          
          {/* Live Golden Signals Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-950 border border-slate-900 p-4.5 rounded-xl space-y-2">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">SLA/SLI Availability Target</span>
              <div className="flex justify-between items-baseline">
                <span className={`text-xl font-black font-mono tracking-tight ${
                  currentMetrics.availabilityPct > 99.8 ? "text-slate-100" : "text-rose-500 animate-pulse"
                }`}>
                  {currentMetrics.availabilityPct}%
                </span>
                <span className="text-[10px] text-emerald-450 font-mono">Target: &gt;99.9%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${currentMetrics.availabilityPct > 99.8 ? "bg-emerald-500" : "bg-rose-500"}`} 
                  style={{ width: `${currentMetrics.availabilityPct}%` }} 
                />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4.5 rounded-xl space-y-2">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">Gateway Latency P99</span>
              <div className="flex justify-between items-baseline">
                <span className={`text-xl font-black font-mono tracking-tight ${
                  currentMetrics.latencyMs < 500 ? "text-slate-100" : "text-amber-500"
                }`}>
                  {currentMetrics.latencyMs} ms
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Soft Limit: 500ms</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${currentMetrics.latencyMs < 500 ? "bg-indigo-500" : "bg-amber-500"}`} 
                  style={{ width: `${Math.min(100, (currentMetrics.latencyMs / 1500) * 100)}%` }} 
                />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4.5 rounded-xl space-y-2">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">Global Throughput (QPS)</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black font-mono tracking-tight text-slate-100">{currentMetrics.qps}</span>
                <span className="text-[10px] text-slate-500 font-mono">Nodes: 4 clusters</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400" style={{ width: `${(currentMetrics.qps / 700) * 100}%` }} />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4.5 rounded-xl space-y-2">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">System Host Aggregate CPU</span>
              <div className="flex justify-between items-baseline">
                <span className={`text-xl font-black font-mono tracking-tight ${
                  currentMetrics.cpuPct < 80 ? "text-slate-100" : "text-rose-500 animate-pulse"
                }`}>
                  {currentMetrics.cpuPct}%
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Limit: 90% threshold</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${currentMetrics.cpuPct < 80 ? "bg-emerald-500" : "bg-rose-500"}`} 
                  style={{ width: `${currentMetrics.cpuPct}%` }} 
                />
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SLO status & Error budget burn rate panel */}
            <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-indigo-400" />
                  Service Level Objectives (SLO) & Monthly Error Budgets
                </h3>
                <span className="text-[9px] text-indigo-400 font-mono uppercase font-black">Period: 30d sliding</span>
              </div>

              <div className="space-y-4">
                
                {/* Latency SLO card */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="space-y-1 w-full md:w-3/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-200">SLO-1: Fast Flight Searching Latency</span>
                      <span className="text-[8.5px] font-mono font-bold uppercase bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded">p99 &lt; 500ms</span>
                    </div>
                    <p className="text-[11px] text-slate-450 leading-tight">
                      99% of all `/v2/flights/search` requests must terminate in under 500ms at client egress.
                    </p>
                    <div className="flex items-center gap-4 text-[10.5px] font-mono text-slate-500 pt-1">
                      <span>Requests checked: <strong className="text-slate-300">{(totalSLICounts.requests).toLocaleString()}</strong></span>
                      <span>SLI Met: <strong className="text-slate-300">99.87%</strong></span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4 shrink-0">
                    <div className="text-center bg-slate-900/40 border border-slate-800 p-2.5 rounded-lg w-28">
                      <span className="text-[8px] font-mono text-slate-500 uppercase block">Remaining Budget</span>
                      <span className={`text-base font-black font-mono ${
                        totalSLICounts.budget > 10 ? "text-emerald-400" : "text-rose-500"
                      }`}>{totalSLICounts.budget}%</span>
                    </div>
                    <div className="text-center bg-slate-900/40 border border-slate-800 p-2.5 rounded-lg w-24">
                      <span className="text-[8px] font-mono text-slate-500 uppercase block">Burn Rate</span>
                      <span className={`text-base font-black font-mono ${
                        chaosMode === "STEADY" ? "text-slate-400" : "text-rose-500 animate-pulse"
                      }`}>{chaosMode === "STEADY" ? "1.0x" : chaosMode === "SABRE_OUTAGE" ? "8.4x" : "3.2x"}</span>
                    </div>
                  </div>
                </div>

                {/* Availability SLO card */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="space-y-1 w-full md:w-3/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-200">SLO-2: Gateway Availability Index</span>
                      <span className="text-[8.5px] font-mono font-bold uppercase bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded">Yield &gt; 99.9%</span>
                    </div>
                    <p className="text-[11px] text-slate-450 leading-tight">
                      Aggregate success rate (errors exclude 4xx codes) must exceed 99.9% across any continuous 30d epoch.
                    </p>
                    <div className="flex items-center gap-4 text-[10.5px] font-mono text-slate-500 pt-1">
                      <span>Total failures: <strong className="text-rose-400">{totalSLICounts.fails}</strong></span>
                      <span>Availability SLI: <strong className="text-emerald-400">{currentMetrics.availabilityPct}%</strong></span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4 shrink-0">
                    <div className="text-center bg-slate-900/40 border border-slate-800 p-2.5 rounded-lg w-28">
                      <span className="text-[8px] font-mono text-slate-500 uppercase block">Remaining Budget</span>
                      <span className={`text-base font-black font-mono ${
                        chaosMode === "STEADY" ? "text-emerald-400" : "text-rose-500"
                      }`}>{chaosMode === "STEADY" ? "98.42%" : "91.14%"}</span>
                    </div>
                    <div className="text-center bg-slate-900/40 border border-slate-800 p-2.5 rounded-lg w-24">
                      <span className="text-[8px] font-mono text-slate-500 uppercase block">Status</span>
                      <span className={`text-xs font-black font-mono px-2 py-0.5 rounded ${
                        chaosMode === "STEADY" 
                          ? "bg-emerald-950/40 text-emerald-450 border border-emerald-500/20" 
                          : "bg-rose-950/40 text-rose-400 border border-rose-500/20"
                      }`}>{chaosMode === "STEADY" ? "HEALTHY" : "BREACH RISK"}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Dynamic Warning Message */}
              {chaosMode !== "STEADY" && (
                <div className="bg-rose-950/30 border border-rose-500/20 rounded-xl p-3.5 flex items-center gap-3 animate-pulse">
                  <ZapOff className="w-5 h-5 text-rose-500 shrink-0" />
                  <div className="text-[11px] text-rose-200 leading-tight">
                    <strong>Critical Error Budget Depletion Event:</strong> Burn rate is currently elevated. Active incident war room page has been provisioned. Review dynamic tracing spans and gateway logs immediately.
                  </div>
                </div>
              )}
            </div>

            {/* Capacity Planning & Business KPI panel */}
            <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <LineChart className="w-4 h-4 text-sky-400" />
                Active Capacity Planning & Business KPIs
              </h3>

              {/* Capacity Progress gauges */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Database Storage Capacity</span>
                    <span className="font-bold text-slate-300">{storageUtilization}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500" style={{ width: `${storageUtilization}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Regional Memory Overhead</span>
                    <span className="font-bold text-slate-300">{memoryUtilization}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${memoryUtilization}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">AWS Cross-Region Egress SLA</span>
                    <span className="font-bold text-slate-300">{egressSlaUtilization}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${egressSlaUtilization}%` }} />
                  </div>
                </div>
              </div>

              {/* Predicted headroom */}
              <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">Predicted Storage Headroom</span>
                  <p className="font-bold text-slate-250 leading-tight">{predictedLimitDays} Days Remaining</p>
                </div>
                <span className="text-[10px] font-mono bg-indigo-950 text-indigo-400 px-2 py-1 rounded">No Scaling Needed</span>
              </div>

              {/* Business KPIs */}
              <div className="pt-3 border-t border-slate-850 space-y-3">
                <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">Business Telemetry Correlation</span>
                
                <div className="grid grid-cols-2 gap-2 text-center text-[10.5px]">
                  <div className="bg-slate-950/80 p-2.5 border border-slate-900 rounded-lg">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block">Funnel Yield</span>
                    <span className="text-xs font-black font-mono text-emerald-450">{businessKPIs.conversionPct}%</span>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 border border-slate-900 rounded-lg">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block">Lost Rev (Est)</span>
                    <span className={`text-xs font-black font-mono ${
                      businessKPIs.estimatedLostRevenueUSD > 0 ? "text-rose-400 font-bold" : "text-slate-400"
                    }`}>${businessKPIs.estimatedLostRevenueUSD.toLocaleString()}</span>
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-400 leading-normal text-center bg-slate-950/40 p-2 rounded">
                  Every 100ms of extra GDS latency results in an estimated <strong className="text-indigo-400">$2,400 USD</strong> in booking dropouts per hour.
                </p>
              </div>

            </div>

          </div>

          {/* SRE Architecture Design Diagram Panel */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-rose-500" />
              Unified SRE Production Telemetry Collection Architecture
            </h3>
            
            {/* Visual mapping chart */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-6 overflow-x-auto">
              <div className="min-w-[650px] flex items-center justify-between text-center font-mono text-[10px] space-x-4">
                
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg w-40 space-y-2">
                  <div className="font-bold text-slate-200 uppercase text-[9px] border-b border-slate-800 pb-1">Microservices Nodes</div>
                  <div className="space-y-1 text-slate-400 text-[8.5px]">
                    <div className="bg-slate-950 p-1 rounded">FlySmart Gateway (Go)</div>
                    <div className="bg-slate-950 p-1 rounded">Search API (Node.js)</div>
                    <div className="bg-slate-950 p-1 rounded">gRPC Aggregator (Java)</div>
                  </div>
                  <p className="text-[8px] text-slate-500">Injects OpenTelemetry SDK Spans & Metrics</p>
                </div>

                <div className="text-slate-500 flex flex-col items-center">
                  <ArrowRight className="w-4 h-4 text-rose-500" />
                  <span className="text-[8px] uppercase font-bold text-slate-600 mt-1">OTLP / gRPC</span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg w-44 space-y-2 relative">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-rose-950 text-rose-400 text-[8px] px-1.5 py-0.5 rounded-full border border-rose-500/20 font-black">OTEL COLLECTOR</div>
                  <div className="font-bold text-slate-200 uppercase text-[9px] border-b border-slate-800 pb-1 mt-1">OpenTelemetry Gateway</div>
                  <div className="text-[8.5px] text-slate-400 space-y-1">
                    <div className="bg-slate-950 p-1 rounded">Processors & Batching</div>
                    <div className="bg-slate-950 p-1 rounded">Exporters Translation</div>
                  </div>
                  <p className="text-[8px] text-slate-500">Receives tracing + metrics in unified format</p>
                </div>

                <div className="text-slate-500 flex flex-col items-center">
                  <ArrowRight className="w-4 h-4 text-indigo-400" />
                  <span className="text-[8px] uppercase font-bold text-slate-600 mt-1">Export Multiplex</span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg w-40 space-y-2">
                  <div className="font-bold text-slate-200 uppercase text-[9px] border-b border-slate-800 pb-1">Ingestion Shards</div>
                  <div className="space-y-1 text-slate-400 text-[8.5px]">
                    <div className="bg-emerald-950/40 text-emerald-450 border border-emerald-500/10 p-1 rounded">Prometheus (Metrics)</div>
                    <div className="bg-rose-950/40 text-rose-450 border border-rose-500/10 p-1 rounded">Tempo (Tracing)</div>
                    <div className="bg-sky-950/40 text-sky-450 border border-sky-500/10 p-1 rounded">Loki (Aggregated Logs)</div>
                  </div>
                </div>

                <div className="text-slate-500 flex flex-col items-center">
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                  <span className="text-[8px] uppercase font-bold text-slate-600 mt-1">Dashboard & Alarm</span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg w-36 space-y-1.5">
                  <div className="font-bold text-slate-200 uppercase text-[9px] border-b border-slate-800 pb-1">SRE Visualization</div>
                  <p className="bg-slate-950 p-1.5 rounded text-[8.5px] text-indigo-400 font-bold">Grafana Core Dashboards</p>
                  <p className="bg-slate-950 p-1.5 rounded text-[8.5px] text-rose-500 font-bold">Alertmanager Pagers</p>
                </div>

              </div>
            </div>
          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 2: DISTRIBUTED TRACING SPANS */}
      {/* ==================================================== */}
      {activeSubTab === "tracing" && (
        <div className="space-y-6">
          
          {/* Distributed tracing span visualizer */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-2.5">
              <div className="space-y-0.5">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-rose-500" />
                  Interactive Request Span Waterfall (Jaeger/Tempo format)
                </h3>
                <p className="text-xs text-slate-400">Trace parent-child call depth during a standard ticket search. Click to inspect metadata attributes.</p>
              </div>

              <div className="font-mono text-[10.5px] bg-slate-950 border border-slate-850 px-3 py-1 rounded-lg">
                Trace ID: <span className="font-bold text-indigo-400">tr_abc123xyz_flight_lookup</span>
              </div>
            </div>

            {/* Waterfall block */}
            <div className="space-y-3.5 bg-slate-950 border border-slate-850 p-5 rounded-xl">
              
              {traceSpans.map((span, idx) => {
                const totalDuration = traceSpans[0].durationMs;
                const pctStart = (span.startTimeOffset / totalDuration) * 100;
                const pctWidth = (span.durationMs / totalDuration) * 100;
                
                return (
                  <div key={span.id} className="space-y-1">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                        <span className="font-bold text-slate-200">{span.name}</span>
                        <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-850 px-1.5 py-0.25 rounded">
                          {span.service}
                        </span>
                        {span.status === "ERROR" && (
                          <span className="text-[9px] font-mono bg-rose-950 text-rose-400 border border-rose-500/25 px-1.5 py-0.25 rounded font-bold animate-pulse">
                            Error
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-slate-400 font-bold">{span.durationMs} ms</span>
                    </div>

                    <div className="h-6.5 w-full bg-slate-900/40 border border-slate-900/80 rounded relative flex items-center overflow-hidden">
                      {/* Visual bar */}
                      <div 
                        className={`absolute h-full rounded transition-all duration-700 ${
                          span.status === "ERROR" 
                            ? "bg-rose-500/30 border-l-3 border-rose-500" 
                            : "bg-indigo-500/35 border-l-3 border-indigo-500"
                        }`}
                        style={{ 
                          left: `${pctStart}%`, 
                          width: `${Math.max(2, pctWidth)}%` 
                        }}
                      />

                      <div className="absolute right-3 text-[9px] font-mono text-slate-500">
                        Span ID: {span.id}
                      </div>
                    </div>

                    {/* Attribute block */}
                    <div className="pl-5 text-[10px] font-mono text-slate-450 flex flex-wrap gap-x-4 gap-y-1">
                      {Object.entries(span.attributes).map(([k, v]) => (
                        <span key={k}>
                          <strong className="text-slate-500">{k}:</strong> <span className="text-slate-300">{String(v)}</span>
                        </span>
                      ))}
                      {span.errorDescription && (
                        <span className="text-rose-400 font-bold block w-full mt-0.5">
                          exception: {span.errorDescription}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Explanation panel */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs text-slate-400 space-y-1.5 leading-relaxed">
              <span className="text-[9.5px] font-mono font-black text-rose-500 uppercase block">Trace Cascade SRE Analysis</span>
              <p>
                In steady states, the `Lookup Flight Rates Cache` span resolves in &lt; 3ms. However, during outages, a cache miss prompts a cascading gRPC lookup down to the partner aggregator. Under Sabre outages, notice that the final span `Parse Partner XML Response` is never reached because the parent client-call times out after 2200ms.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 3: STRUCTURED LOGGING & PERFORMANCE PROFILING */}
      {/* ==================================================== */}
      {activeSubTab === "logs_errors" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Performance Profiling / Flame Graph representation */}
          <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-sky-400" />
              Continuous Performance Profiling (CPU Allocation)
            </h3>
            
            <p className="text-xs text-slate-400">
              Go/pprof compiler thread mapping. Helps identify algorithmic blockages during high QPS loads.
            </p>

            <div className="space-y-3.5 pt-2">
              {cpuProfile.map((prof, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-slate-350">
                    <span>{prof.name}</span>
                    <span className="font-bold text-slate-200">{prof.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded border border-slate-900 overflow-hidden relative">
                    <div 
                      className={`h-full transition-all duration-700 ${
                        prof.pct > 30 ? "bg-rose-500/40" : "bg-indigo-500/40"
                      }`} 
                      style={{ width: `${prof.pct}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl text-[10px] font-mono text-slate-500 leading-normal">
              <span className="text-[9px] text-sky-400 font-bold block uppercase mb-1">Profiling Optimization Goal</span>
              JSON serialization accounts for over 28% of overall search-service CPU execution cycles. Migration to binary Protobuf/gRPC contracts reduces serialization clock ticks by 85%.
            </div>
          </div>

          {/* Structured JSON Log Buffer */}
          <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col min-h-[450px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-2.5 shrink-0">
              <div className="space-y-0.5">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  Distributed Log Stream Aggregator (Loki Shard)
                </h3>
                <p className="text-xs text-slate-400">Structured log streams with contextual correlation tracing tags.</p>
              </div>

              {/* Log filter controls */}
              <div className="flex gap-2 shrink-0">
                <select 
                  value={logFilterService} 
                  onChange={(e) => setLogFilterService(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-[10.5px] font-mono outline-none cursor-pointer text-slate-300"
                >
                  <option value="all">All Services</option>
                  <option value="flysmart-gateway">flysmart-gateway</option>
                  <option value="search-service">search-service</option>
                  <option value="partner-aggregator">partner-aggregator</option>
                  <option value="cache-layer">cache-layer</option>
                  <option value="ml-forecaster">ml-forecaster</option>
                </select>

                <select 
                  value={logFilterLevel} 
                  onChange={(e) => setLogFilterLevel(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-[10.5px] font-mono outline-none cursor-pointer text-slate-300"
                >
                  <option value="all">All Levels</option>
                  <option value="INFO">INFO</option>
                  <option value="WARN">WARN</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>
            </div>

            {/* Log stream buffer */}
            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-850 p-4 font-mono text-[10.5px] overflow-y-auto max-h-[380px] space-y-2.5">
              
              {filteredLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-12">No matching logs found in this Loki buffer.</div>
              ) : (
                filteredLogs.map((log, idx) => {
                  let badgeColor = "text-sky-400 bg-sky-950/40 border border-sky-500/10";
                  if (log.level === "WARN") badgeColor = "text-amber-400 bg-amber-950/40 border border-amber-500/10";
                  if (log.level === "ERROR") badgeColor = "text-rose-500 bg-rose-950/40 border border-rose-500/10 animate-pulse";
                  
                  return (
                    <div key={idx} className="border-b border-slate-900/60 pb-2 last:border-0 hover:bg-slate-900/20 px-1 py-0.5 rounded transition-all">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-slate-500 font-bold">{log.timestamp}</span>
                        <span className={`text-[8px] px-1.5 py-0.25 font-bold rounded ${badgeColor}`}>
                          {log.level}
                        </span>
                        <span className="text-slate-300 font-semibold text-[10px]">{log.service}</span>
                        <div className="flex-1" />
                        <span className="text-slate-500 text-[9px]">trace_id={log.traceId}</span>
                      </div>
                      <p className="text-slate-300 whitespace-pre-wrap">{log.message}</p>
                      
                      {/* Sub attributes if existing */}
                      {Object.keys(log.attributes).length > 0 && (
                        <div className="text-[9px] text-slate-550 flex gap-3 mt-1 pt-1 border-t border-slate-900/40">
                          {Object.entries(log.attributes).map(([k, v]) => (
                            <span key={k}>
                              {k}=<span className="text-slate-450">"{String(v)}"</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

            </div>
          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 4: SYNTHETIC EDGE & CACHE MONITORING */}
      {/* ==================================================== */}
      {activeSubTab === "synthetic_edge" && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Synthetic monitoring regional health */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-500" />
                Global Synthetic Monitoring & Edge Pings
              </h3>
              
              <p className="text-xs text-slate-400">
                Hourly automated end-to-end user flows validated from distributed regional locations.
              </p>

              <div className="space-y-3.5 pt-2">
                {syntheticMonitoring.map((m, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-200">{m.region}</span>
                      <span className={`text-[8.5px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                        m.status === "Healthy" 
                          ? "bg-emerald-950 text-emerald-450 border border-emerald-500/20" 
                          : "bg-amber-950 text-amber-400 border border-amber-500/20"
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                      <div className="bg-slate-900 p-1 rounded">
                        <span className="text-slate-500 block text-[8px] uppercase">DNS Look</span>
                        <span className="text-slate-350">{m.dnsSec}s</span>
                      </div>
                      <div className="bg-slate-900 p-1 rounded">
                        <span className="text-slate-500 block text-[8px] uppercase">TLS Hand</span>
                        <span className="text-slate-350">{m.handMs}ms</span>
                      </div>
                      <div className="bg-slate-900 p-1 rounded">
                        <span className="text-slate-500 block text-[8px] uppercase">E2E Lat</span>
                        <span className="text-indigo-400 font-bold">{m.totalMs}ms</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Redis Cache Monitoring details */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Database className="w-4 h-4 text-sky-400" />
                Redis Cache Cluster Telemetry & Key TTLs
              </h3>
              
              <p className="text-xs text-slate-400">
                Core database caching statistics showing evictions, memory utilization thresholds, and reads ms.
              </p>

              <div className="space-y-4 pt-2">
                <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl space-y-2.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Cache Hit Rate Ratio</span>
                  <div className="flex justify-between items-baseline">
                    <span className={`text-xl font-black font-mono ${
                      cacheStats.hitRatio > 50 ? "text-emerald-400" : "text-rose-500 animate-pulse"
                    }`}>{cacheStats.hitRatio}%</span>
                    <span className="text-[10px] text-slate-500 font-mono">Minimum Target: &gt;80%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${cacheStats.hitRatio > 50 ? "bg-emerald-500" : "bg-rose-500"}`} 
                      style={{ width: `${cacheStats.hitRatio}%` }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl text-center">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Stale Key Evictions</span>
                    <span className={`text-base font-black font-mono ${
                      cacheStats.evictions > 100 ? "text-rose-400" : "text-slate-300"
                    }`}>{cacheStats.evictions} keys/m</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl text-center">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Avg Seek Latency</span>
                    <span className="text-base font-black font-mono text-indigo-400">{cacheStats.readsMs} ms</span>
                  </div>
                </div>

                <p className="text-[10.5px] text-slate-400 leading-normal bg-slate-950/40 p-2.5 rounded">
                  {chaosMode === "REDIS_EVICTION" ? (
                    <strong className="text-rose-400">Severe Redis Eviction Storm:</strong>
                  ) : (
                    <strong>Steady State:</strong>
                  )} Caching holds active airline listings for 180 seconds. Cache evictions occur automatically under volatile-lru policy to maintain aggregate 16GB memory limitations.
                </p>
              </div>
            </div>

            {/* Prometheus Alertmanager Active definitions */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-rose-500" />
                Active Prometheus Alarm Configurations
              </h3>
              
              <p className="text-xs text-slate-400">
                Evaluation thresholds for active Slack, Webhook, and PagerDuty alert triggers.
              </p>

              <div className="space-y-2.5 pt-1">
                {alertRules.map(rule => (
                  <div key={rule.id} className="bg-slate-950 border border-slate-900 p-3 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-200 truncate max-w-[180px]">{rule.name}</span>
                      <span className={`text-[8.5px] font-mono px-1.5 py-0.25 rounded ${
                        rule.status === "FIRING" 
                          ? "bg-rose-950 text-rose-400 border border-rose-500/20 animate-pulse font-black" 
                          : "bg-slate-900 text-slate-500"
                      }`}>
                        {rule.status}
                      </span>
                    </div>
                    <code className="text-[8.5px] font-mono text-slate-500 block bg-slate-900/50 p-1.5 rounded truncate">
                      {rule.expr}
                    </code>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 5: ML MODEL OBSERVABILITY */}
      {/* ==================================================== */}
      {activeSubTab === "ml_observability" && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* ML price forecasting drift validation panel */}
            <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  Machine Learning Model Performance & Feature Drift Engine
                </h3>
                <span className="text-[9px] text-slate-500 font-mono uppercase">Model: Fare_Trend_Regressor_v3.2</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1">
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase block font-bold">Model Mean Absolute Error</span>
                  <p className={`text-xl font-black font-mono tracking-tight ${
                    mlStats.mapePercent > 10 ? "text-rose-400 animate-pulse" : "text-emerald-440"
                  }`}>{mlStats.mapePercent}% MAE</p>
                  <span className="text-[10px] text-slate-550 block">Warning Threshold: &gt;5%</span>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1">
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase block font-bold">Kolmogorov-Smirnov Data Drift</span>
                  <p className={`text-xl font-black font-mono tracking-tight ${
                    mlStats.driftValue > 0.2 ? "text-rose-400 animate-pulse" : "text-emerald-440"
                  }`}>{mlStats.driftValue}</p>
                  <span className="text-[10px] text-slate-550 block">Drift Threshold: &gt;0.15</span>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1">
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase block font-bold">Total ML Inferences/min</span>
                  <p className="text-xl font-black font-mono tracking-tight text-slate-100">8,540 inferences</p>
                  <span className="text-[10px] text-slate-550 block">Response p95: 14ms</span>
                </div>
              </div>

              {/* Data distribution drift chart */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-3">
                <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">Feature Distribution Divergence (Real-time vs Baseline training)</span>
                
                <div className="h-[120px] flex items-end justify-between px-4 pb-2 border-b border-slate-900 relative">
                  
                  {/* Drift explanation line graph */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    {/* Baseline curve */}
                    <path d="M 0,40 Q 30,10 50,5 Q 70,10 100,40" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="3,3" />
                    {/* Current real-time curve */}
                    {chaosMode === "ML_DRIFT" ? (
                      <path d="M 0,40 Q 20,30 40,15 Q 60,5 100,40" fill="none" stroke="#f43f5e" strokeWidth="2.5" />
                    ) : (
                      <path d="M 0,40 Q 30,10 50,6 Q 70,10 100,40" fill="none" stroke="#10b981" strokeWidth="2" />
                    )}
                  </svg>

                  <div className="absolute top-2 right-4 text-[9px] font-mono space-y-1 flex flex-col">
                    <span className="text-indigo-400">● Training Baseline</span>
                    <span className={chaosMode === "ML_DRIFT" ? "text-rose-500" : "text-emerald-400"}>
                      ● Real-time (KS: {mlStats.driftValue})
                    </span>
                  </div>

                </div>
                <div className="w-full flex justify-between font-mono text-[9px] text-slate-500">
                  <span>-3.0σ (Standard Deviations)</span>
                  <span>Mean</span>
                  <span>+3.0σ</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-850 leading-relaxed">
                <span className="text-[9px] text-indigo-400 font-mono uppercase font-black block mb-1">Drift Analysis SRE Playbook</span>
                Model accuracy degrades during unexpected summer holidays or sudden airline pricing drops. Drift alerts notify the data engineering group to trigger automatic model retrain DAG pipeline schedules.
              </div>
            </div>

            {/* Model validation diagnostics */}
            <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-450" />
                Active Model Versions & Health
              </h3>
              
              <p className="text-xs text-slate-400">
                Evaluation results across our three active edge inference neural networks.
              </p>

              <div className="space-y-3 pt-1">
                <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-200">Fare_Trend_Regressor_v3.2</span>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-500">RMSE Error: $14.50</span>
                    <span className="text-emerald-450 font-bold">Accuracy: {mlStats.accuracyPercent}%</span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-200">Mistake_Fare_Classifier_v5.0</span>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-500">Precision Rate: 99.1%</span>
                    <span className="text-emerald-450 font-bold">Accuracy: 99.15%</span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-200">User_LTV_Predictor_v1.1</span>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-500">MAPE Error: 5.4%</span>
                    <span className="text-emerald-450 font-bold">Accuracy: 94.58%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 6: ACTIVE INCIDENT WAR ROOM */}
      {/* ==================================================== */}
      {activeSubTab === "incidents" && (
        <div className="space-y-6">
          
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
              <div className="space-y-0.5">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                  Active SRE Incident Response Rooms
                </h3>
                <p className="text-xs text-slate-400">Review status, owners, timelines, and action post-mortems for operational anomalies.</p>
              </div>
              <span className="text-[9px] font-mono text-slate-500 uppercase">On-call Escalation SLA: 15m</span>
            </div>

            {/* List of active/previous incidents */}
            <div className="space-y-5">
              
              {incidents.map(inc => (
                <div key={inc.id} className={`p-5 rounded-xl border ${
                  inc.status !== "RESOLVED" 
                    ? "bg-rose-950/20 border-rose-500/35" 
                    : "bg-slate-950 border-slate-900"
                } space-y-4`}>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-900">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-black uppercase bg-rose-950 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded">
                          {inc.severity}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">ID: {inc.id}</span>
                        <span className={`text-[9px] font-mono font-bold uppercase ${
                          inc.status !== "RESOLVED" ? "text-rose-400 animate-pulse" : "text-emerald-400"
                        }`}>
                          ● {inc.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-200 tracking-tight">{inc.title}</h4>
                    </div>

                    <div className="text-right text-[10.5px] font-mono space-y-0.5">
                      <div>Owner: <span className="font-bold text-slate-350">{inc.owner}</span></div>
                      <div>Incident Commander: <span className="font-bold text-slate-350">{inc.incidentCommander}</span></div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded border border-slate-900/50">
                    {inc.summary}
                  </p>

                  {/* Incident timelines */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">Incident Log Timeline</span>
                    
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto font-mono text-[10.5px] pl-2 border-l border-slate-800">
                      {inc.timeline.map((item, i) => (
                        <div key={i} className="flex gap-4">
                          <span className="text-indigo-400 shrink-0 font-bold">{item.time}</span>
                          <span className="text-slate-400">{item.event}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active incident controls */}
                  {inc.status !== "RESOLVED" && (
                    <div className="bg-slate-900/60 p-4.5 rounded-xl border border-slate-850/80 space-y-3.5">
                      <span className="text-[9.5px] font-mono font-black text-indigo-400 uppercase block">Incident Action Playbook Tasks</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-center text-[10.5px]">
                        <button 
                          onClick={() => {
                            setChaosMode("STEADY");
                            setIncidents(prev => prev.map(i => i.id === inc.id ? { 
                              ...i, 
                              status: "RESOLVED",
                              updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
                              timeline: [...i.timeline, { time: "Just Now", event: "Chaos injected fault cleared. Metric baselines healthy." }, { time: "Just Now", event: "Incident resolved by engineer manual verification." }]
                            } : i));
                          }}
                          className="bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-500/25 text-emerald-400 font-bold py-1.5 rounded-lg cursor-pointer transition-all uppercase"
                        >
                          Mark as Resolved
                        </button>
                        
                        <a 
                          href="https://flysmart.slack.com/archives/incident-war-room" 
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 font-bold py-1.5 rounded-lg cursor-pointer transition-all uppercase flex items-center justify-center gap-1"
                        >
                          <Bot className="w-4 h-4 text-sky-400" />
                          Slack Incident Bridge
                        </a>

                        <button 
                          onClick={() => {
                            setIncidents(prev => prev.map(i => i.id === inc.id ? { 
                              ...i, 
                              status: "MITIGATING",
                              timeline: [...i.timeline, { time: "Just Now", event: "Manual circuit-breaker activated. Standby routing pools primed." }]
                            } : i));
                          }}
                          className="bg-indigo-950/60 hover:bg-indigo-950 border border-indigo-500/25 text-indigo-400 font-bold py-1.5 rounded-lg cursor-pointer transition-all uppercase"
                        >
                          Trigger Standby Failover
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))}

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
