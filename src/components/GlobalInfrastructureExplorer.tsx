import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Globe, 
  Network, 
  Database, 
  Activity, 
  ShieldAlert, 
  RefreshCw, 
  Zap, 
  TrendingUp, 
  Info, 
  FileText, 
  Cloud, 
  Server, 
  Wifi, 
  Layers, 
  Compass, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRightLeft, 
  Gauge,
  HelpCircle,
  Eye,
  Sliders,
  Sparkles,
  Search,
  Check,
  ChevronRight,
  ShieldCheck,
  Code
} from "lucide-react";

// --- TYPES & INTERFACES ---
type ActiveSubModule = "traffic_failover" | "consistency_db" | "event_mesh" | "disaster_recovery" | "specs";
type ConsistencyModel = "strong_spanner" | "eventual_aurora";
type DisasterType = "backbone_blackout" | "earthquake_datacenter" | "ransomware_dns" | "undersea_cable_cut";

interface RegionNode {
  id: string;
  name: string;
  code: string;
  coordinates: { x: number; y: number }; // Percentage coordinate on simulated grid
  role: "primary_master" | "active_active" | "edge_replica" | "read_passive";
  status: "healthy" | "degraded" | "offline";
  avgPingMs: number;
  activeUsers: number;
  cacheHitRatio: number;
  dbReplicaLagMs: number;
  underMaintenance: boolean;
  notes: string;
  services: {
    cdnCache: "online" | "degraded" | "offline";
    eventStore: "online" | "degraded" | "offline";
    dbCluster: "online" | "degraded" | "offline";
  };
}

interface CrossRegionEvent {
  id: string;
  eventType: "FLIGHT_BOOKED" | "PASSENGER_CHECKIN" | "MISTAKE_FARE_TRIGGERED" | "BILLING_COMPLETED";
  originRegion: string;
  payload: string;
  timestamp: string;
  replicationTrace: Record<string, { status: "pending" | "replicated" | "delayed"; durationMs: number }>;
}

export default function GlobalInfrastructureExplorer() {
  const [subModule, setSubModule] = useState<ActiveSubModule>("traffic_failover");
  
  // Consistency Model State
  const [consistencyModel, setConsistencyModel] = useState<ConsistencyModel>("strong_spanner");
  
  // Custom Disaster Drill State
  const [activeDisaster, setActiveDisaster] = useState<DisasterType | null>(null);
  const [disasterRegionId, setDisasterRegionId] = useState<string | null>(null);

  // Region configurations across North America, Europe, Middle East, Asia, Australia
  const [regions, setRegions] = useState<RegionNode[]>([
    { 
      id: "na", 
      name: "North America (us-east1)", 
      code: "IAD-01", 
      coordinates: { x: 25, y: 35 }, 
      role: "primary_master", 
      status: "healthy", 
      avgPingMs: 12, 
      activeUsers: 84000, 
      cacheHitRatio: 96.2, 
      dbReplicaLagMs: 0, 
      underMaintenance: false,
      notes: "Primary Read/Write database Hub & global DNS registrar sync point.",
      services: { cdnCache: "online", eventStore: "online", dbCluster: "online" }
    },
    { 
      id: "eu", 
      name: "Europe (europe-west3)", 
      code: "FRA-02", 
      coordinates: { x: 50, y: 28 }, 
      role: "active_active", 
      status: "healthy", 
      avgPingMs: 19, 
      activeUsers: 62000, 
      cacheHitRatio: 94.8, 
      dbReplicaLagMs: 15, 
      underMaintenance: false,
      notes: "High-density active-active processing region connected via transatlantic dark fiber.",
      services: { cdnCache: "online", eventStore: "online", dbCluster: "online" }
    },
    { 
      id: "me", 
      name: "Middle East (me-central1)", 
      code: "DOH-03", 
      coordinates: { x: 64, y: 44 }, 
      role: "edge_replica", 
      status: "healthy", 
      avgPingMs: 41, 
      activeUsers: 19000, 
      cacheHitRatio: 89.1, 
      dbReplicaLagMs: 85, 
      underMaintenance: false,
      notes: "Sovereign-complying local read replicas and high-availability edge proxy caching.",
      services: { cdnCache: "online", eventStore: "online", dbCluster: "online" }
    },
    { 
      id: "as", 
      name: "Asia (asia-east1)", 
      code: "TPE-04", 
      coordinates: { x: 80, y: 48 }, 
      role: "active_active", 
      status: "healthy", 
      avgPingMs: 22, 
      activeUsers: 51000, 
      cacheHitRatio: 92.5, 
      dbReplicaLagMs: 42, 
      underMaintenance: false,
      notes: "Core Asia-Pacific traffic cluster processing real-time booking streams.",
      services: { cdnCache: "online", eventStore: "online", dbCluster: "online" }
    },
    { 
      id: "au", 
      name: "Australia (australia-southeast1)", 
      code: "SYD-05", 
      coordinates: { x: 88, y: 78 }, 
      role: "read_passive", 
      status: "healthy", 
      avgPingMs: 65, 
      activeUsers: 14000, 
      cacheHitRatio: 93.1, 
      dbReplicaLagMs: 195, 
      underMaintenance: false,
      notes: "Geo-routed passive failover cluster. Synchronous read cached, async database replication.",
      services: { cdnCache: "online", eventStore: "online", dbCluster: "online" }
    }
  ]);

  // Telemetry Metric Stream States
  const [globalRps, setGlobalRps] = useState<number>(3420);
  const [globalTrafficRouted, setGlobalTrafficRouted] = useState<number>(18491020);
  const [anycastConverged, setAnycastConverged] = useState<boolean>(true);

  // Cross-Region Messaging Logs & Stream Simulator
  const [crossRegionEvents, setCrossRegionEvents] = useState<CrossRegionEvent[]>([
    {
      id: "EV-9901",
      eventType: "FLIGHT_BOOKED",
      originRegion: "eu",
      payload: "Flight FS-829 (CDG -> DXB) booked by passenger Alex Rivera",
      timestamp: "23:45:10",
      replicationTrace: {
        na: { status: "replicated", durationMs: 78 },
        me: { status: "replicated", durationMs: 42 },
        as: { status: "replicated", durationMs: 195 },
        au: { status: "replicated", durationMs: 310 }
      }
    },
    {
      id: "EV-9902",
      eventType: "PASSENGER_CHECKIN",
      originRegion: "na",
      payload: "Passenger Clara Oswald checked in for FS-101 at JFK Terminal 4",
      timestamp: "23:46:15",
      replicationTrace: {
        eu: { status: "replicated", durationMs: 82 },
        me: { status: "replicated", durationMs: 120 },
        as: { status: "replicated", durationMs: 145 },
        au: { status: "replicated", durationMs: 290 }
      }
    }
  ]);

  const [simulatedLog, setSimulatedLog] = useState<string[]>([
    "[SYSTEM] Multi-region network interconnect status: healthy.",
    "[BGP] Global Anycast Prefix 192.0.2.0/24 advertised successfully across IAD, FRA, DOH, TPE, SYD.",
    "[DATABASE] Multi-Master replication streams: established. Active Spanner TrueTime nodes: 15/15."
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [simulatedLog]);

  // Log Message Helper
  const pushLog = (msg: string) => {
    const ts = new Date().toTimeString().split(" ")[0];
    setSimulatedLog(prev => [...prev, `[${ts}] ${msg}`].slice(-40)); // keep last 40
  };

  // Metric fluctuation loop
  useEffect(() => {
    const timer = setInterval(() => {
      // Fluctuate requests per second
      setGlobalRps(prev => {
        const delta = Math.floor((Math.random() - 0.5) * 120);
        return Math.max(1200, prev + delta);
      });

      // Increment aggregate traffic
      setGlobalTrafficRouted(prev => prev + Math.floor(Math.random() * 2500) + 500);

      // Fluctuate latency variables on healthy regions
      setRegions(current => {
        return current.map(reg => {
          if (reg.status === "healthy") {
            const pingDelta = Math.floor((Math.random() - 0.5) * 4);
            const userDelta = Math.floor((Math.random() - 0.5) * 300);
            
            // Adjust DB lag based on consistency model
            let baseLag = reg.dbReplicaLagMs;
            if (reg.role !== "primary_master") {
              if (consistencyModel === "strong_spanner") {
                // Strong consistency guarantees TrueTime bounds, replica lag stays sub-5ms (with slightly higher write latency)
                baseLag = Math.max(2, Math.floor(Math.random() * 4) + 1);
              } else {
                // Eventual consistency uses async replication, lag ranges 100-350ms
                if (reg.id === "eu") baseLag = Math.max(20, Math.floor(Math.random() * 30) + 15);
                if (reg.id === "me") baseLag = Math.max(80, Math.floor(Math.random() * 60) + 70);
                if (reg.id === "as") baseLag = Math.max(50, Math.floor(Math.random() * 40) + 40);
                if (reg.id === "au") baseLag = Math.max(180, Math.floor(Math.random() * 120) + 160);
              }
            }

            return {
              ...reg,
              avgPingMs: Math.max(8, reg.avgPingMs + pingDelta),
              activeUsers: Math.max(5000, reg.activeUsers + userDelta),
              dbReplicaLagMs: baseLag
            };
          }
          return reg;
        });
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [consistencyModel]);

  // Triggering Cross-Region Events via interactive UI
  const triggerCustomEvent = (type: CrossRegionEvent["eventType"]) => {
    const id = `EV-${Math.floor(Math.random() * 9000) + 1000}`;
    const ts = new Date().toTimeString().split(" ")[0];
    
    let payload = "";
    let origin = "na";
    if (type === "FLIGHT_BOOKED") {
      const flightNum = `FS-${Math.floor(Math.random() * 900) + 100}`;
      const destinations = ["LHR", "FRA", "SIN", "HND", "SYD"];
      payload = `Flight ${flightNum} booked to ${destinations[Math.floor(Math.random() * destinations.length)]}`;
      origin = ["na", "eu", "as"][Math.floor(Math.random() * 3)];
    } else if (type === "MISTAKE_FARE_TRIGGERED") {
      payload = `URGENT: Global automated pricing engine suspended due to anomalous fare rate drop ($42 to Hawaii)`;
      origin = "na";
    } else if (type === "PASSENGER_CHECKIN") {
      payload = `Passenger checked-in at biometric gate in Frankfurt Hub`;
      origin = "eu";
    } else {
      payload = `Payment settled: VISA gateway authorization succeeded ($820.00)`;
      origin = "na";
    }

    // Replication Latency Matrix based on distance from Origin
    const isStrong = consistencyModel === "strong_spanner";
    const baseMult = isStrong ? 2.5 : 1.0; // Strong consistency incurs commit path synchronous overhead

    const trace: Record<string, { status: "pending" | "replicated"; durationMs: number }> = {};
    regions.forEach(r => {
      if (r.id !== origin) {
        let latency = 50;
        if (origin === "na") {
          if (r.id === "eu") latency = 85;
          if (r.id === "me") latency = 140;
          if (r.id === "as") latency = 180;
          if (r.id === "au") latency = 240;
        } else if (origin === "eu") {
          if (r.id === "na") latency = 85;
          if (r.id === "me") latency = 60;
          if (r.id === "as") latency = 155;
          if (r.id === "au") latency = 295;
        } else {
          if (r.id === "na") latency = 180;
          if (r.id === "eu") latency = 155;
          if (r.id === "me") latency = 95;
          if (r.id === "au") latency = 120;
        }
        trace[r.id] = {
          status: "replicated",
          durationMs: Math.floor(latency * baseMult + Math.random() * 15)
        };
      }
    });

    const newEvent: CrossRegionEvent = {
      id,
      eventType: type,
      originRegion: origin,
      payload,
      timestamp: ts,
      replicationTrace: trace as any
    };

    setCrossRegionEvents(prev => [newEvent, ...prev].slice(0, 10));
    pushLog(`[EVENT MESH] Published global topic '${type}' from origin region '${origin.toUpperCase()}'.`);
    
    // Log trace metrics
    Object.entries(trace).forEach(([targetReg, info]) => {
      setTimeout(() => {
        pushLog(`[PUB/SUB] Event ${id} acknowledged by region ${targetReg.toUpperCase()} in ${info.durationMs}ms.`);
      }, info.durationMs);
    });
  };

  // DR DISASTER INJECTION DRILL
  const injectDisasterDrill = (type: DisasterType, targetRegId: string) => {
    setActiveDisaster(type);
    setDisasterRegionId(targetRegId);
    setAnycastConverged(false);

    let dName = "Core Fiber Severance";
    if (type === "earthquake_datacenter") dName = "Seismic Activity Power Outage";
    if (type === "ransomware_dns") dName = "Global BGP Ransomware Flood";
    if (type === "undersea_cable_cut") dName = "Pacific Rim Undersea Fiber Severance";

    pushLog(`[CRITICAL EVENT] Initiating DR Drill: '${dName}' on ${targetRegId.toUpperCase()}`);
    pushLog(`[SRE TELEMETRY] Deep Probes failed on ${targetRegId.toUpperCase()} datacenter.`);

    // Modify target region to offline or degraded
    setRegions(current => {
      return current.map(reg => {
        if (reg.id === targetRegId) {
          // Divert users
          pushLog(`[GEO-ROUTING] Diverting ${reg.activeUsers.toLocaleString()} users away from ${reg.name} with 10-second Anycast DNS record TTL.`);
          return {
            ...reg,
            status: "offline",
            avgPingMs: 999,
            activeUsers: 0,
            dbReplicaLagMs: -1,
            services: { cdnCache: "offline", eventStore: "offline", dbCluster: "offline" }
          };
        }
        return reg;
      });
    });

    // Simulate auto Geo-failover route after 3 seconds
    setTimeout(() => {
      setAnycastConverged(true);
      pushLog(`[BGP INTERCONNECT] Anycast routers finished path prepending. Diverted all traffic to closest geo-adjacent regional hubs.`);
      
      // Distribute dead region's users to other healthy regions
      setRegions(current => {
        const deadReg = current.find(r => r.id === targetRegId);
        const activeUsersToDivert = deadReg ? 50000 : 0; // standard chunk
        
        return current.map(reg => {
          if (reg.id !== targetRegId && reg.status === "healthy") {
            const addedUsers = Math.floor(activeUsersToDivert / 4);
            pushLog(`[ROUTE FAILOVER] Rerouted +${addedUsers.toLocaleString()} active user sockets to ${reg.name} successfully.`);
            return {
              ...reg,
              activeUsers: reg.activeUsers + addedUsers,
              avgPingMs: Math.floor(reg.avgPingMs * 1.15) // small latency penalty due to congestion
            };
          }
          return reg;
        });
      });
      pushLog(`[FAILOVER CONVERGED] Geo-failover drill complete. SRE SLA restored with RTO of 3.2 seconds!`);
    }, 3000);
  };

  // Recover DR Drill
  const recoverDisasterDrill = () => {
    if (!disasterRegionId) return;
    const recoveredId = disasterRegionId;
    setActiveDisaster(null);
    setDisasterRegionId(null);
    setAnycastConverged(true);

    pushLog(`[DR RECOVERY] Triggered failback sequence for region ${recoveredId.toUpperCase()}.`);
    pushLog(`[SYSTEM] Restoring database synchronization streams and BGP routing metrics...`);

    // Reset regions
    setRegions(current => {
      return current.map(reg => {
        if (reg.id === recoveredId) {
          return {
            ...reg,
            status: "healthy",
            avgPingMs: reg.id === "na" ? 12 : reg.id === "eu" ? 19 : reg.id === "me" ? 41 : reg.id === "as" ? 22 : 65,
            activeUsers: reg.id === "na" ? 84000 : reg.id === "eu" ? 62000 : reg.id === "me" ? 19000 : reg.id === "as" ? 51000 : 14000,
            dbReplicaLagMs: reg.id === "na" ? 0 : 25,
            services: { cdnCache: "online", eventStore: "online", dbCluster: "online" }
          };
        } else {
          // Remove overflow users
          const originalUsers = reg.id === "na" ? 84000 : reg.id === "eu" ? 62000 : reg.id === "me" ? 19000 : reg.id === "as" ? 51000 : 14000;
          return {
            ...reg,
            activeUsers: Math.min(reg.activeUsers, originalUsers + Math.floor(Math.random() * 2000)),
            avgPingMs: Math.max(10, Math.floor(reg.avgPingMs * 0.88))
          };
        }
      });
    });

    pushLog(`[BGP] Multi-pop Anycast Route advertisements complete. Dynamic user latency normalized.`);
  };

  // Static specs list
  const consistencySpecs = useMemo(() => {
    if (consistencyModel === "strong_spanner") {
      return {
        database: "Google Cloud Spanner (Multi-Region Dialect)",
        mechanism: "TrueTime API (GPS & Atomic Clocks) + 2-Phase Commit Paxos Consensus",
        writeLatency: "45ms - 65ms (Synchronous WAN Multi-region quorum validation)",
        readLatency: "1ms - 5ms (Local read replica bounding from nearest coordinate)",
        consistency: "Serializable transaction isolation globally (Strict serializability)",
        downside: "High write path penalty due to synchronous cross-region networking",
        idealFor: "Seat inventories, pricing engines, mistake fare flags, payment state ledgers"
      };
    } else {
      return {
        database: "AWS Aurora Global Database / Azure Cosmos DB",
        mechanism: "Asynchronous storage-level block replication stream (1-way physical pipeline)",
        writeLatency: "8ms - 15ms (Instant local primary commit, non-blocking on WAN replica acknowledgements)",
        readLatency: "1ms - 3ms (Asynchronous read from local regional replica database)",
        consistency: "Eventual consistency (Cross-region lag ranges from 15ms to 350ms depending on undersea cables)",
        downside: "Possibility of dirty reads or split-brain stale states during active network partitions",
        idealFor: "User notification logs, search history lists, flight reviews, dynamic recommendations"
      };
    }
  }, [consistencyModel]);

  return (
    <div className="space-y-6" id="global-distributed-infrastructure-explorer">
      
      {/* 1. Dashboard Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-40 bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-40 bg-emerald-500/5 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest font-black text-emerald-400">
                Enterprise Cloud Mesh: ACTIVE
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-100 mt-1 tracking-tight flex items-center gap-2">
              <Globe className="w-5.5 h-5.5 text-indigo-400" />
              <span>Globally Distributed Cloud Infrastructure & Network Mesh</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Explore and orchestrate the highly resilient, latency-optimized backbone supporting <strong>North America, Europe, Middle East, Asia, and Australia</strong>. Simulate physical undersea link outages, inspect multi-region Paxos-driven consistency mechanisms, and analyze real-time cross-region Event Streams.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-850 p-3 rounded-xl">
            <div className="text-left">
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">Total Mesh Traffic</span>
              <strong className="text-sm font-black text-slate-200 font-mono">{(globalTrafficRouted).toLocaleString()}</strong>
            </div>
            <div className="h-8 w-[1px] bg-slate-850" />
            <div className="text-left">
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">Global Load RPS</span>
              <strong className="text-sm font-black text-indigo-400 font-mono">{(globalRps).toLocaleString()} r/s</strong>
            </div>
            <div className="h-8 w-[1px] bg-slate-850" />
            <div className="text-left">
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">Anycast State</span>
              <span className={`text-xs font-black px-1.5 py-0.5 rounded font-mono ${anycastConverged ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20" : "bg-amber-950 text-amber-400 border border-amber-500/20 animate-pulse"}`}>
                {anycastConverged ? "CONVERGED" : "REROUTING"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-t border-slate-800/40 mt-4 pt-4 justify-between items-center flex-wrap gap-2">
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setSubModule("traffic_failover")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                subModule === "traffic_failover"
                  ? "bg-slate-900 border border-slate-800 text-sky-450 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Geo-Routing & Failover Simulator</span>
            </button>

            <button
              onClick={() => setSubModule("consistency_db")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                subModule === "consistency_db"
                  ? "bg-slate-900 border border-slate-800 text-indigo-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Consistency & Replication Lab</span>
            </button>

            <button
              onClick={() => setSubModule("event_mesh")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                subModule === "event_mesh"
                  ? "bg-slate-900 border border-slate-800 text-emerald-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              <span>Cross-Region Messaging Mesh</span>
            </button>

            <button
              onClick={() => setSubModule("disaster_recovery")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                subModule === "disaster_recovery"
                  ? "bg-slate-900 border border-slate-800 text-rose-450 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Automated DR Drills</span>
            </button>

            <button
              onClick={() => setSubModule("specs")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                subModule === "specs"
                  ? "bg-slate-900 border border-slate-800 text-teal-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code className="w-4 h-4 text-teal-400" />
              <span>Cloud Specs</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-950/40 px-3 py-1.5 border border-slate-800/40 rounded-lg">
            <span>Enterprise SLAs:</span>
            <strong className="text-emerald-400">99.999% Availability Guaranteed</strong>
          </div>
        </div>
      </div>

      {/* 2. Sub-module Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main interactive area */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* A. Geo-Routing & Failover Simulator */}
          {subModule === "traffic_failover" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-sky-400 animate-pulse" />
                  <span>Interactive Anycast DNS & BGP Latency Router</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Our core global system employs latency-based Geo-routing. Client queries to our static API IPs hit the nearest Tier-1 transit router where BGP routes traffic to the nearest healthy Point of Presence (PoP). If a region experiences an outage, routes dynamically shift!
                </p>
              </div>

              {/* Grid map of globally distributed nodes */}
              <div className="relative w-full h-[330px] bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden select-none">
                {/* Lat/Long Grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
                <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-650">GLOBAL ROUTER MATRIX (192.0.2.0/24)</div>

                {/* SVG connection lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  {/* Dynamic pathways between nodes */}
                  {regions.map((reg, idx) => {
                    if (reg.id === "na") return null;
                    const naNode = regions.find(r => r.id === "na")!;
                    
                    const x1 = `${naNode.coordinates.x}%`;
                    const y1 = `${naNode.coordinates.y}%`;
                    const x2 = `${reg.coordinates.x}%`;
                    const y2 = `${reg.coordinates.y}%`;

                    const isOffline = reg.status === "offline" || naNode.status === "offline";
                    const strokeColor = isOffline ? "#ef4444" : "#6366f1";
                    const isAnycastRerouting = !anycastConverged;

                    return (
                      <g key={reg.id}>
                        {/* Interactive path pipeline */}
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={strokeColor}
                          strokeWidth={isOffline ? "1" : "1.5"}
                          strokeDasharray={isOffline ? "4,4" : isAnycastRerouting ? "3,3" : "0"}
                          className="transition-all duration-1000"
                          opacity={isOffline ? "0.3" : "0.55"}
                        />
                        
                        {/* Flowing event packet */}
                        {!isOffline && (
                          <circle r="3" fill="#38bdf8">
                            <animateMotion
                              path={`M ${naNode.coordinates.x * 6.8} ${naNode.coordinates.y * 3.3} L ${reg.coordinates.x * 6.8} ${reg.coordinates.y * 3.3}`}
                              dur={`${reg.avgPingMs * 0.05}s`}
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Draw Region Nodes */}
                {regions.map((reg) => {
                  let statusColor = "border-emerald-500 text-emerald-400 bg-emerald-950/60 shadow-emerald-500/10";
                  if (reg.status === "degraded") {
                    statusColor = "border-amber-500 text-amber-400 bg-amber-950/60 shadow-amber-500/10";
                  } else if (reg.status === "offline") {
                    statusColor = "border-rose-500 text-rose-400 bg-rose-950/60 shadow-rose-500/10";
                  }

                  return (
                    <div
                      key={reg.id}
                      style={{ left: `${reg.coordinates.x}%`, top: `${reg.coordinates.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border p-2.5 shadow-xl transition-all duration-700 min-w-[150px] z-20 ${statusColor}`}
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-1.5">
                        <strong className="text-[10px] font-black tracking-wide font-mono block uppercase">{reg.id.toUpperCase()}: {reg.code}</strong>
                        <span className={`h-1.5 w-1.5 rounded-full ${reg.status === "healthy" ? "bg-emerald-400" : reg.status === "degraded" ? "bg-amber-400" : "bg-rose-500 animate-ping"}`} />
                      </div>

                      <div className="space-y-1 text-[9px] font-mono leading-relaxed">
                        <div className="flex justify-between">
                          <span className="text-slate-400">RTT Latency:</span>
                          <span className="font-bold">{reg.avgPingMs === 999 ? "∞" : `${reg.avgPingMs}ms`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Active Users:</span>
                          <span className="font-bold">{(reg.activeUsers).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Replica Lag:</span>
                          <span className="font-bold">{reg.dbReplicaLagMs === -1 ? "N/A" : `${reg.dbReplicaLagMs}ms`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">CDN Cache Hit:</span>
                          <span className="font-bold text-sky-450">{reg.cacheHitRatio}%</span>
                        </div>
                      </div>

                      {/* Manual Ingress Interfacer */}
                      <div className="mt-2 pt-1.5 border-t border-slate-800 flex justify-between gap-1">
                        {reg.status === "healthy" ? (
                          <button
                            onClick={() => injectDisasterDrill("undersea_cable_cut", reg.id)}
                            className="w-full text-center text-[8px] py-0.5 bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-900/40 rounded transition-all font-bold cursor-pointer"
                          >
                            Sever Link
                          </button>
                        ) : (
                          <button
                            onClick={recoverDisasterDrill}
                            className="w-full text-center text-[8px] py-0.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-900/40 rounded transition-all font-bold cursor-pointer"
                          >
                            Heal Region
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Geo Routing Control Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase font-mono">BGP Community Tag Matrix</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    Dynamic BGP community metrics used to steer routing preferences across global transit carriers. When regions fail, our edge load balancers automatically advertise prepended AS-Paths.
                  </p>
                  <div className="bg-slate-900 p-2 rounded border border-slate-850">
                    <pre className="text-[10px] text-indigo-400 font-mono">
                      {`AS64496::NA_PRIMARY   -> LocalPref 100\nAS64496::EU_TRANSIT   -> LocalPref 90\nAS64496::AS_EAST      -> LocalPref 80\nAS64496::REROUTED_FAILOVER -> LocalPref 40`}
                    </pre>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase font-mono">Global Routing Policy Controls</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">SLA Latency Boundary</span>
                      <span className="font-mono text-emerald-400">Healthy (&lt; 150ms)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">TTL (Anycast Record Cache)</span>
                      <span className="font-mono text-sky-400">10 Seconds</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">BGP Prefix Advertisements</span>
                      <span className="font-mono text-slate-300">Active (IPv4 / IPv6)</span>
                    </div>
                  </div>
                  <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-900 leading-normal flex items-start gap-1">
                    <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Try severing a link above to watch Anycast DNS automatically failover under 3.2 seconds without routing flapping.</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* B. Consistency & Replication Lab */}
          {subModule === "consistency_db" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-400" />
                    <span>Global Consistency Model & DB Replication Sandbox</span>
                  </h3>
                  
                  {/* Model Switcher */}
                  <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl">
                    <button
                      onClick={() => {
                        setConsistencyModel("strong_spanner");
                        pushLog("[DATABASE] Switched consistency engine to Strong Global Consistency via Paxos TrueTime API.");
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        consistencyModel === "strong_spanner" ? "bg-indigo-950 border border-indigo-900/40 text-indigo-400 shadow" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Strong Spanner
                    </button>
                    <button
                      onClick={() => {
                        setConsistencyModel("eventual_aurora");
                        pushLog("[DATABASE] Switched consistency engine to Eventual Consistency via Asynchronous Storage Replicas.");
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        consistencyModel === "eventual_aurora" ? "bg-indigo-950 border border-indigo-900/40 text-indigo-400 shadow" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Eventual Caching
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Consistency decisions directly dictate commit performance. **Strong Consistency** uses Multi-Region Paxos consensus where write commits wait for synchronous WAN quorum before completion. **Eventual Consistency** commits locally first, copying blocks asynchronously to remote edge hubs.
                </p>
              </div>

              {/* Spec Cards based on Active selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Architecture Card */}
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-indigo-400 font-mono uppercase">Replication State Map</span>
                    <span className="text-[10px] font-mono text-slate-500">Live Telemetry</span>
                  </div>

                  {consistencyModel === "strong_spanner" ? (
                    <div className="space-y-4">
                      {/* TrueTime visualizer */}
                      <div className="bg-slate-900 border border-indigo-950 p-3.5 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                            <Gauge className="w-3.5 h-3.5 text-indigo-400" /> TrueTime GPS Bounding
                          </span>
                          <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950/30 px-1 py-0.2 rounded border border-indigo-800/20 font-bold uppercase">Atomic Synced</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Spanner leverages physical GPS receivers and rubidium atomic clocks to guarantee global chronological order (Linearizability) without waiting for global locks.
                        </p>
                        <div className="bg-slate-950 p-2.5 rounded text-[10px] font-mono text-emerald-400 border border-slate-850 flex justify-between items-center">
                          <span>TrueTime uncertainty [ε]</span>
                          <span className="font-bold">±0.45 milliseconds</span>
                        </div>
                      </div>

                      {/* Paxos replication nodes */}
                      <div className="space-y-2 text-xs">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">WAN Synchronous Quorum Status</span>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2 bg-indigo-950/20 border border-indigo-500/20 rounded-lg text-center font-semibold text-[10px]">
                            <span className="block text-indigo-400 font-bold">us-east1</span>
                            <span>PROPOSER</span>
                          </div>
                          <div className="p-2 bg-indigo-950/20 border border-indigo-500/20 rounded-lg text-center font-semibold text-[10px]">
                            <span className="block text-indigo-400 font-bold">europe-west3</span>
                            <span>ACCEPTOR</span>
                          </div>
                          <div className="p-2 bg-indigo-950/20 border border-indigo-500/20 rounded-lg text-center font-semibold text-[10px]">
                            <span className="block text-indigo-400 font-bold">asia-east1</span>
                            <span>QUORUM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Eventual replicator */}
                      <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                            <RefreshCw className="w-3.5 h-3.5 text-emerald-450 animate-spin" /> Async Block Replication
                          </span>
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/30 px-1 py-0.2 rounded border border-emerald-850/20 font-bold uppercase">Streaming</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Writes commit instantly on the master node and propagate asynchronously over cross-region fiber pipelines. Remote replicas serve reads with sub-millisecond local speed but may experience replication lag.
                        </p>
                        <div className="bg-slate-950 p-2.5 rounded text-[10px] font-mono text-slate-300 border border-slate-850 flex justify-between items-center">
                          <span>Replication pipeline rate</span>
                          <span className="font-bold text-emerald-400">420 MB/second</span>
                        </div>
                      </div>

                      {/* Lag metrics */}
                      <div className="space-y-2 text-xs">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Replication Lag Map</span>
                        <div className="space-y-1.5 font-mono text-[10px]">
                          <div className="flex justify-between p-1.5 bg-slate-900 rounded border border-slate-850">
                            <span>FRA-02 (Europe)</span>
                            <span className="text-emerald-400 font-bold">Lag: ~15ms</span>
                          </div>
                          <div className="flex justify-between p-1.5 bg-slate-900 rounded border border-slate-850">
                            <span>DOH-03 (Middle East)</span>
                            <span className="text-amber-400 font-bold">Lag: ~85ms</span>
                          </div>
                          <div className="flex justify-between p-1.5 bg-slate-900 rounded border border-slate-850">
                            <span>SYD-05 (Australia)</span>
                            <span className="text-rose-400 font-bold">Lag: ~195ms</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Configuration Specs Column */}
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                  <div className="space-y-4 text-xs font-semibold">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block border-b border-slate-800 pb-2">Active Architecture Specifications</span>
                    
                    <div className="space-y-2.5 leading-relaxed text-slate-350">
                      <div>
                        <strong className="text-slate-100 block text-[11px]">Core Database Provider:</strong>
                        <span className="text-[11px] text-slate-400">{consistencySpecs.database}</span>
                      </div>
                      <div>
                        <strong className="text-slate-100 block text-[11px]">Sync Mechanism:</strong>
                        <span className="text-[11px] text-slate-400">{consistencySpecs.mechanism}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong className="text-slate-100 block text-[11px]">Write Latency:</strong>
                          <span className="text-[11px] text-rose-450">{consistencySpecs.writeLatency}</span>
                        </div>
                        <div>
                          <strong className="text-slate-100 block text-[11px]">Read Latency:</strong>
                          <span className="text-[11px] text-emerald-400">{consistencySpecs.readLatency}</span>
                        </div>
                      </div>
                      <div>
                        <strong className="text-slate-100 block text-[11px]">Consistency Guarantee:</strong>
                        <span className="text-[11px] text-indigo-400">{consistencySpecs.consistency}</span>
                      </div>
                      <div>
                        <strong className="text-slate-100 block text-[11px]">Potential Downsides:</strong>
                        <span className="text-[11px] text-slate-400">{consistencySpecs.downside}</span>
                      </div>
                      <div>
                        <strong className="text-slate-100 block text-[11px]">Ideal Core Use Case:</strong>
                        <span className="text-[11px] text-slate-400">{consistencySpecs.idealFor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 p-3 border border-slate-800/80 rounded-xl flex items-center gap-2 text-[11px] text-slate-400 leading-relaxed mt-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>FlySmart implements <strong>Google Spanner</strong> for inventory checkouts to avoid double-bookings and <strong>Redis caches</strong> globally for search.</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* C. Cross-Region Messaging Mesh */}
          {subModule === "event_mesh" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                  <span>Apache Kafka & Pub/Sub Cross-Region Event Mesh</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  When actions occur, microservices publish events to local messaging brokers. These events are replicated globally using high-throughput cross-region mirroring pipelines (Kafka MirrorMaker 2 / GCP Pub/Sub Subscriptions). Watch events stream and compute fiber transit times.
                </p>
              </div>

              {/* Event trigger dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Simulator controls */}
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-4">
                  <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200 font-mono uppercase">Mesh Event Publishers</span>
                    <span className="text-[10px] font-mono text-emerald-400">Mesh Active</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Instantly broadcast transaction topics onto the global backbone. These events simulate actual microservice messages routed to all five regional data lakes.
                  </p>

                  <div className="grid grid-cols-1 gap-2.5 pt-2">
                    <button
                      onClick={() => triggerCustomEvent("FLIGHT_BOOKED")}
                      className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span>Publish FLIGHT_BOOKED</span>
                      </span>
                      <Send className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    <button
                      onClick={() => triggerCustomEvent("PASSENGER_CHECKIN")}
                      className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-400" />
                        <span>Publish PASSENGER_CHECKIN</span>
                      </span>
                      <Send className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    <button
                      onClick={() => triggerCustomEvent("BILLING_COMPLETED")}
                      className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-sky-400" />
                        <span>Publish BILLING_COMPLETED</span>
                      </span>
                      <Send className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    <button
                      onClick={() => triggerCustomEvent("MISTAKE_FARE_TRIGGERED")}
                      className="w-full bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-450 py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                        <span>Publish MISTAKE_FARE_TRIGGERED</span>
                      </span>
                      <Send className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  </div>
                </div>

                {/* Live stream timeline */}
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="border-b border-slate-800 pb-2 mb-3 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-200 font-mono uppercase">Event Stream Telemetry</span>
                      <span className="text-[10px] font-mono text-slate-500">Last 10 Events</span>
                    </div>

                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {crossRegionEvents.map((evt) => (
                        <div key={evt.id} className="bg-slate-900 border border-slate-850 p-3 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-800 font-bold">
                              {evt.eventType}
                            </span>
                            <span className="text-[9px] font-mono text-slate-500">ID: {evt.id} • {evt.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-350 leading-relaxed font-semibold italic">"{evt.payload}"</p>
                          
                          {/* Trace speeds */}
                          <div className="pt-2 border-t border-slate-850/60">
                            <span className="text-[9px] font-mono text-slate-500 block mb-1">Mirroring Replication Lag Profile</span>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(evt.replicationTrace).map(([region, info]) => (
                                <span key={region} className="text-[9px] font-mono bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-850 flex items-center gap-1">
                                  <span>{region.toUpperCase()}:</span>
                                  <strong className="text-sky-450 font-bold">{(info as any).durationMs}ms</strong>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-850 pt-3 mt-4 text-[11px] text-slate-500 leading-relaxed flex items-start gap-1">
                    <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>Cross-region event pipelines stream asynchronously at gigabit wire speeds. Commitment bounds are kept isolated from direct API clients.</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* D. Disaster Recovery (DR) & Backup Drills */}
          {subModule === "disaster_recovery" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                  <span>SRE Disaster Recovery (DR) & Active Failover Drills</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Test our global disaster recovery tolerances. Standard SRE criteria mandates strict **RPO (Recovery Point Objective)** and **RTO (Recovery Time Objective)** levels to avoid flight data losses.
                </p>
              </div>

              {/* Active Disaster Panel */}
              {activeDisaster ? (
                <div className="bg-rose-950/25 border border-rose-800/40 p-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-450 font-black">
                      <AlertTriangle className="w-5 h-5 animate-bounce" />
                      <span className="text-sm font-mono uppercase tracking-wide">ACTIVE DRILL CATACLYSM INJECTED</span>
                    </div>
                    <span className="text-[10px] bg-rose-900/60 text-rose-400 px-2 py-0.5 rounded border border-rose-800/40 font-mono font-bold animate-pulse">CRITICAL WARNING</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-950 rounded-lg space-y-1">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Affected Region:</span>
                      <strong className="text-slate-200 text-sm font-bold uppercase">{disasterRegionId} Region Cluster</strong>
                    </div>

                    <div className="p-3.5 bg-slate-950 rounded-lg space-y-1">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Drill Vector:</span>
                      <strong className="text-rose-400 text-sm font-bold">
                        {activeDisaster === "backbone_blackout" ? "BGP Route Poisoning" : 
                         activeDisaster === "earthquake_datacenter" ? "Seismic Ingress Cut" :
                         activeDisaster === "ransomware_dns" ? "DNS Hijack Flood" : "Pacific Undersea Cable Severance"}
                      </strong>
                    </div>

                    <div className="p-3.5 bg-slate-950 rounded-lg space-y-1">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Mesh Status:</span>
                      <strong className={`text-sm font-bold ${anycastConverged ? "text-emerald-400" : "text-amber-400 animate-pulse"}`}>
                        {anycastConverged ? "FAILOVER CONVERGED" : "REROUTING IN PROGRESS..."}
                      </strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-normal font-semibold">
                    The health-check system detected a physical cluster failure on the <strong>{disasterRegionId?.toUpperCase()}</strong> core load balancer. AS-Path routing was withdrawn, propagating BGP routes in under 3.2 seconds. Multi-Region Spanner Paxos quorums resolved, ensuring <strong>0 transactions (0 RPO)</strong> were lost.
                  </p>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={recoverDisasterDrill}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-100 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-emerald-100" />
                      <span>Heal Region & Conclude Drill</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/60 border border-slate-900 p-8 rounded-xl text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-sm font-black text-slate-200">All Distributed Systems Nominal</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      SLA targets are stable, Anycast DNS is converging normally, and cross-region databases are synchronized. Launch a disaster recovery drill to evaluate our automated failover workflows.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto pt-4">
                    <button
                      onClick={() => injectDisasterDrill("undersea_cable_cut", "au")}
                      className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-all text-left text-xs space-y-1.5 cursor-pointer"
                    >
                      <strong className="text-slate-200 block font-bold">Cable Severance</strong>
                      <span className="text-[10px] text-slate-500 font-mono block">Target: AU Sydney</span>
                    </button>

                    <button
                      onClick={() => injectDisasterDrill("earthquake_datacenter", "as")}
                      className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-all text-left text-xs space-y-1.5 cursor-pointer"
                    >
                      <strong className="text-slate-200 block font-bold">Seismic Failure</strong>
                      <span className="text-[10px] text-slate-500 font-mono block">Target: AS Taiwan</span>
                    </button>

                    <button
                      onClick={() => injectDisasterDrill("backbone_blackout", "eu")}
                      className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-all text-left text-xs space-y-1.5 cursor-pointer"
                    >
                      <strong className="text-slate-200 block font-bold">Transit Blackout</strong>
                      <span className="text-[10px] text-slate-500 font-mono block">Target: EU Frankfurt</span>
                    </button>

                    <button
                      onClick={() => injectDisasterDrill("ransomware_dns", "me")}
                      className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-all text-left text-xs space-y-1.5 cursor-pointer"
                    >
                      <strong className="text-slate-200 block font-bold">DNS Hijacking</strong>
                      <span className="text-[10px] text-slate-500 font-mono block">Target: ME Doha</span>
                    </button>
                  </div>
                </div>
              )}

              {/* RPO / RTO Target Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-950/45 border border-slate-900 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">RPO (Recovery Point Objective)</span>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-2xl font-black text-slate-200 font-mono">0 Seconds</strong>
                    <span className="text-xs text-emerald-400 font-bold font-mono">No Transaction Loss</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal font-semibold">
                    Because flight seats, mistakes fares, and ledger payments employ multi-region synchronous Paxos writes, no database transactions can be lost or split during a complete datacenter blackout.
                  </p>
                </div>

                <div className="bg-slate-950/45 border border-slate-900 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">RTO (Recovery Time Objective)</span>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-2xl font-black text-indigo-400 font-mono">&lt; 15 Seconds</strong>
                    <span className="text-xs text-indigo-400 font-bold font-mono">Autonomous Failover</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal font-semibold">
                    Anycast BGP routes withdraw failed nodes within seconds. DNS TTL limits client caches to 10 seconds, forcing fully automated routing convergence without manual operations.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* E. Technical Specs Blueprint */}
          {subModule === "specs" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Code className="w-5 h-5 text-teal-400" />
                  <span>Globally Distributed Cloud Infrastructure Specifications</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Production CloudFormation, Terraform, and Kubernetes deployment architecture specs used to establish the multi-region mesh.
                </p>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                
                {/* Spec 1 */}
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-teal-400 block uppercase">1. Global Anycast BGP Peering Matrix</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    Advertised subnet blocks are routed over dual-redundant GCP Partner Interconnects / AWS Direct Connect pipes, terminating at local Equinix peering matrix hubs in Ashburn (us-east1), Frankfurt (europe-west3), Doha (me-central1), Taiwan (asia-east1), and Sydney (australia-southeast1).
                  </p>
                </div>

                {/* Spec 2 */}
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-teal-400 block uppercase">2. Cross-Region Event Mirroring</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    Event streams are synced with Apache Kafka MirrorMaker 2. Replication queues utilize SASL/SCRAM encryption over TLS 1.3 to guarantee that biometric passenger details remain secure under local GDPR and sovereign Middle Eastern privacy mandates.
                  </p>
                </div>

                {/* Spec 3 */}
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-teal-400 block uppercase">3. Multi-Region Active-Active Paxos Consensus Schema</span>
                  <pre className="text-[10px] text-slate-300 font-mono bg-slate-900 p-3 rounded border border-slate-850 overflow-x-auto leading-normal">
                    {`CREATE DATABASE SeatInventory\n  PRIMARY US (us-east1),\n  PRIMARY EU (europe-west3),\n  PRIMARY AS (asia-east1)\n  REPLICATE_TO ME (me-central1),\n  REPLICATE_TO AU (australia-southeast1)\n  WITH SYNC_PaxosQuorumThreshold = 0.67;\n\n-- TrueTime API synchronization boundaries\nALTER DATABASE SeatInventory SET COMMIT_TIMESTAMP_INTERVAL = '0.5ms';`}
                  </pre>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Right side logs & details */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Logs Console */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 uppercase font-mono flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-450" />
                SRE Live Operations Console
              </span>
              <span className="text-[9px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest border border-slate-850">
                CLI
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 h-[240px] overflow-y-auto font-mono text-[9px] border border-slate-900 leading-normal scrollbar-thin">
              <div className="space-y-2 text-slate-350">
                {simulatedLog.map((log, idx) => (
                  <div key={idx} className="border-b border-slate-900/40 pb-1 flex gap-1 items-start">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
                    <span>{log}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
            
            <button
              onClick={() => {
                setSimulatedLog([
                  "[SYSTEM] Multi-region network interconnect status: healthy.",
                  "[BGP] Global Anycast Prefix 192.0.2.0/24 advertised successfully across IAD, FRA, DOH, TPE, SYD.",
                  "[DATABASE] Multi-Master replication streams: established. Active Spanner TrueTime nodes: 15/15."
                ]);
              }}
              className="w-full py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Clear Live Log History
            </button>
          </div>

          {/* Quick FAQ / Specs panel */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <span className="text-xs font-bold text-slate-200 uppercase font-mono block border-b border-slate-800 pb-2">Mesh Tech Architecture</span>
            
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block">Smart Geo-Routing</strong>
                  <span className="text-[11px] text-slate-400 leading-normal">
                    Users in Frankfurt route directly to Europe (europe-west3) with sub-20ms latency while users in Sydney route to Australia with local read speeds.
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block">Sovereign Cloud Support</strong>
                  <span className="text-[11px] text-slate-400 leading-normal">
                    Middle Eastern (me-central1) data compliance protocols mirror metadata locally to comply with regional sovereign sovereign mandates.
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block">High-availability CDN</strong>
                  <span className="text-[11px] text-slate-400 leading-normal">
                    CDNs cache static routes and inventory schemas with dynamic edge cache purging triggers mapped across 250 global PoPs.
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// Minimal Terminal icon fallback
function Terminal(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}
