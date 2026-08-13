import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  GLOBAL_REGIONS, 
  DEFAULT_HEALTH_CHECK_CONFIG, 
  TRAFFIC_ORIGINS, 
  GlobalRegion, 
  HealthCheckConfig, 
  BGPRouteLog 
} from "../data/trafficDocs";
import { 
  Globe, 
  Activity, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  Check, 
  Server, 
  Network, 
  Wifi, 
  WifiOff, 
  Settings, 
  Sliders, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Shield, 
  Zap, 
  TrendingUp, 
  Info, 
  FileText, 
  Ban, 
  Database, 
  Clock,
  Volume2
} from "lucide-react";

export default function TrafficExplorer() {
  const [regions, setRegions] = useState<GlobalRegion[]>(JSON.parse(JSON.stringify(GLOBAL_REGIONS)));
  const [hcConfig, setHcConfig] = useState<HealthCheckConfig>(DEFAULT_HEALTH_CHECK_CONFIG);
  
  // Simulation Active states
  const [isTrafficSimulating, setIsTrafficSimulating] = useState<boolean>(true);
  const [activeDisasterRegionId, setActiveDisasterRegionId] = useState<string | null>(null);
  const [disasterType, setDisasterType] = useState<"fiber_cut" | "power_blackout" | "datacenter_fire" | "sovereign_cloud_ban">("fiber_cut");
  const [autoPolling, setAutoPolling] = useState<boolean>(true);
  
  // Log Terminal state
  const [bgpLogs, setBgpLogs] = useState<BGPRouteLog[]>([
    { timestamp: "22:49:10", asNumber: "AS64496", action: "BGP_ADVERTISE", peer: "Global_Tier1_Upstreams", prefix: "192.0.2.0/24", message: "Anycast IP prefix 192.0.2.0/24 advertised from all 4 regional PoPs." },
    { timestamp: "22:49:11", asNumber: "AS64496", action: "HEALTH_STATUS", peer: "Anycast_DNS_HealthCheck", prefix: "all", message: "Health checks initialized. Path /api/v1/health/deep returned 200 OK across all clusters." }
  ]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Active metrics & stats
  const [polledCount, setPolledCount] = useState<number>(1);
  const [activeConnections, setActiveConnections] = useState<number>(245000);
  const [totalTrafficRouted, setTotalTrafficRouted] = useState<number>(4829100);

  // Helper to add BGP log
  const addLog = (message: string, action: BGPRouteLog["action"], prefix: string = "192.0.2.0/24") => {
    const now = new Date();
    const ts = now.toISOString().split("T")[1].substring(0, 12);
    setBgpLogs(prev => [
      ...prev, 
      { timestamp: ts, asNumber: "AS64496", action, peer: "Global_Tier1_Upstreams", prefix, message }
    ]);
  };

  // Run dynamic background traffic ticks
  useEffect(() => {
    if (!isTrafficSimulating) return;

    const timer = setInterval(() => {
      // Fluctuate active connections and aggregate traffic
      setActiveConnections(prev => {
        const delta = Math.floor((Math.random() - 0.5) * 8000);
        return Math.max(120000, prev + delta);
      });
      setTotalTrafficRouted(prev => prev + Math.floor(Math.random() * 500) + 100);

      // Trigger automatic health check poll simulation if enabled
      if (autoPolling) {
        setPolledCount(prev => prev + 1);
        
        // Iterate through all regions and check health
        setRegions(currentRegions => {
          return currentRegions.map(reg => {
            const hasDisaster = reg.id === activeDisasterRegionId;
            let currentStatus = reg.status;
            let hcState = { ...reg.healthCheckState };
            
            if (hasDisaster) {
              // Increment failures
              hcState.consecutiveFailures = Math.min(hcConfig.unhealthyThreshold, hcState.consecutiveFailures + 1);
              hcState.lastPingStatus = `HTTP 503 Service Unavailable - Timeout (${hcConfig.timeoutMs}ms) exceeded`;
              
              if (hcState.consecutiveFailures >= hcConfig.unhealthyThreshold) {
                hcState.status = "unhealthy";
                currentStatus = "failed";
              } else {
                hcState.status = "warning";
                currentStatus = "degraded";
              }
            } else {
              // Recover failures
              hcState.consecutiveFailures = Math.max(0, hcState.consecutiveFailures - 1);
              if (hcState.consecutiveFailures === 0) {
                hcState.status = "healthy";
                currentStatus = "healthy";
                hcState.lastPingStatus = "HTTP 200 OK - database: ok, cache: ok, gds: ok";
              } else if (hcState.consecutiveFailures < hcConfig.unhealthyThreshold) {
                hcState.status = "warning";
              }
            }

            hcState.lastChecked = "Just now";

            return {
              ...reg,
              status: currentStatus,
              healthCheckState: hcState
            };
          });
        });
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [isTrafficSimulating, activeDisasterRegionId, autoPolling, hcConfig]);

  // Scroll terminal logs to bottom when updated
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [bgpLogs]);

  // Handle disaster injection
  const handleInjectDisaster = (regionId: string) => {
    setActiveDisasterRegionId(regionId);
    
    // Select description based on disaster type
    let disasterName = "Fiber Line Cut";
    if (disasterType === "power_blackout") disasterName = "Grid Power Outage";
    if (disasterType === "datacenter_fire") disasterName = "Fire & Thermal Lockout";
    if (disasterType === "sovereign_cloud_ban") disasterName = "Sovereign IP Restriction";

    addLog(`[CRITICAL ALERT] Disaster injected in ${regionId.toUpperCase()} region! Cause: ${disasterName}. Path /api/v1/health/deep failing checks.`, "HEALTH_STATUS");
    
    // Simulate initial failover warning state
    setRegions(prev => {
      return prev.map(reg => {
        if (reg.id === regionId) {
          const hcState = { ...reg.healthCheckState };
          hcState.consecutiveFailures = 1;
          hcState.status = "warning";
          hcState.lastPingStatus = `HTTP 503 - Internal Server Error - Connection refused`;
          return {
            ...reg,
            status: "degraded",
            healthCheckState: hcState
          };
        }
        return reg;
      });
    });

    addLog(`Consecutive failures count initialized. Target state transitions to WARNING. Threshold set to: ${hcConfig.unhealthyThreshold} consecutive retries.`, "HEALTH_STATUS");
  };

  // Run dynamic BGP withdrawal simulation
  const handleTriggerBgpWithdrawal = (regionId: string) => {
    setRegions(prev => {
      return prev.map(reg => {
        if (reg.id === regionId) {
          return {
            ...reg,
            bgpState: "withdrawn"
          };
        }
        return reg;
      });
    });

    const regObj = regions.find(r => r.id === regionId);
    const regCode = regObj?.code || "unknown";
    addLog(`[BGP ROUTE WITHDRAWAL] Broadcasting BGP Route Withdrawal from PoP ${regionId.toUpperCase()} (${regCode}).`, "BGP_WITHDRAW");
    addLog(`AS-Path modified. Withdrawing Anycast Prefix 192.0.2.0/24 from AS64496 neighbor transit peers.`, "BGP_WITHDRAW");
    addLog(`[Anycast DNS] Routing converged. All DNS traffic originating near ${regionId.toUpperCase()} automatically redirected to nearest healthy latency peer.`, "TRAFFIC_REDIRECT");
  };

  // Recover region from disaster
  const handleRecoverRegion = (regionId: string) => {
    if (activeDisasterRegionId === regionId) {
      setActiveDisasterRegionId(null);
    }

    setRegions(prev => {
      return prev.map(reg => {
        if (reg.id === regionId) {
          return {
            ...reg,
            status: "healthy",
            bgpState: "advertising",
            healthCheckState: {
              status: "healthy",
              consecutiveFailures: 0,
              lastPingStatus: "HTTP 200 OK - database: ok, cache: ok, gds: ok",
              lastChecked: "Just now"
            }
          };
        }
        return reg;
      });
    });

    addLog(`[RECOVERY FLOW] Health status resolved in ${regionId.toUpperCase()} cluster. Initiating BGP advertisement.`, "HEALTH_STATUS");
    addLog(`[BGP ADVERTISEMENT] Re-broadcasting Anycast Prefix 192.0.2.0/24 from PoP ${regionId.toUpperCase()} with original MED of 100.`, "BGP_ADVERTISE");
    addLog(`Anycast DNS routing re-stabilized. Normal latency-based routing paths restored.`, "TRAFFIC_REDIRECT");
  };

  // Compute active, degraded, and failed metrics
  const regionMetrics = useMemo(() => {
    let healthyCount = 0;
    let degradedCount = 0;
    let failedCount = 0;
    
    regions.forEach(r => {
      if (r.status === "healthy") healthyCount++;
      if (r.status === "degraded") degradedCount++;
      if (r.status === "failed") failedCount++;
    });

    return { healthyCount, degradedCount, failedCount };
  }, [regions]);

  return (
    <div className="space-y-6 animate-fadeIn" id="traffic-explorer-root">
      
      {/* Upper header banner */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] bg-sky-950 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono font-black uppercase max-w-max">
            Global Infrastructure Resiliency
          </div>
          <h2 className="text-lg font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-400 animate-pulse" />
            Anycast DNS & Latency-Based Traffic Control
          </h2>
          <p className="text-xs text-slate-400">
            Design and simulate autonomous disaster failovers. Anycast DNS advertises the same visual IP prefix globally, utilizing BGP path prepend filters and deep health checking to redirect requests during large-scale network blackouts.
          </p>
        </div>

        {/* Mini stats counters */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="bg-slate-950/80 border border-slate-900 px-3.5 py-2.5 rounded-xl text-center min-w-[90px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Connections</span>
            <span className="text-xs font-black text-sky-450 font-mono">{(activeConnections).toLocaleString()}</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-900 px-3.5 py-2.5 rounded-xl text-center min-w-[90px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Active PoPs</span>
            <span className="text-xs font-black text-emerald-450 font-mono">{regionMetrics.healthyCount}/{regions.length}</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-900 px-3.5 py-2.5 rounded-xl text-center min-w-[90px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Routed Requests</span>
            <span className="text-xs font-black text-slate-200 font-mono">{(totalTrafficRouted).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Topology Map & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Topology Canvas */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                  Autonomous WAN BGP & DNS Routing Topology
                </h3>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Healthy</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse"></span> Degraded</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Disaster Failover</span>
              </div>
            </div>

            {/* Simulated Map Canvas Container */}
            <div className="relative w-full h-[320px] bg-slate-950/90 rounded-xl border border-slate-900 overflow-hidden select-none">
              
              {/* Subtle Grid Lines / Latitude Longitude Markers */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-40" />

              {/* Draw any routing paths/lines dynamically */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {TRAFFIC_ORIGINS.map((origin) => {
                  // Find destination region. If the primary is down, find its backup
                  let primaryDest = regions.find(r => r.id === origin.primaryRegion);
                  let finalDest = primaryDest;
                  
                  if (primaryDest && primaryDest.status === "failed") {
                    // Failover path activated!
                    finalDest = regions.find(r => r.id === primaryDest.backupRegionId);
                  }

                  if (!finalDest || !primaryDest) return null;

                  const isFailoverRoute = finalDest.id !== primaryDest.id;
                  const strokeColor = isFailoverRoute ? "#f43f5e" : "#0ea5e9";
                  const strokeDash = isFailoverRoute ? "4,4" : "0";

                  // Convert percentages to approximate absolute pixel coordinates
                  const x1 = `${origin.latLong.x}%`;
                  const y1 = `${origin.latLong.y}%`;
                  const x2 = `${finalDest.latLong.x}%`;
                  const y2 = `${finalDest.latLong.y}%`;

                  return (
                    <g key={origin.id}>
                      {/* Interactive Routing Line */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={strokeColor}
                        strokeWidth={isFailoverRoute ? "1.5" : "1"}
                        strokeDasharray={strokeDash}
                        opacity={isFailoverRoute ? "0.9" : "0.5"}
                        className="transition-all duration-1000"
                      />
                      
                      {/* Flowing animated packet dot */}
                      <circle r="3" fill={strokeColor} opacity="0.8">
                        <animateMotion
                          path={`M ${origin.latLong.x * 6.5} ${origin.latLong.y * 3.2} L ${finalDest.latLong.x * 6.5} ${finalDest.latLong.y * 3.2}`}
                          dur={isFailoverRoute ? "3s" : "4s"}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}
              </svg>

              {/* Render Traffic Origins (Client Users) */}
              {TRAFFIC_ORIGINS.map((origin) => {
                const primaryReg = regions.find(r => r.id === origin.primaryRegion);
                const isRerouted = primaryReg?.status === "failed";

                return (
                  <div
                    key={origin.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 cursor-help"
                    style={{ left: `${origin.latLong.x}%`, top: `${origin.latLong.y}%` }}
                    title={`Traffic origin: ${origin.name}. Standard routing target: ${origin.primaryRegion}`}
                  >
                    <div className="w-5 h-5 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center shadow-lg relative">
                      <span className="text-[8px] text-slate-400 font-bold font-mono uppercase">{origin.id}</span>
                      
                      {/* Ring beacon indicating healthy or failover redirection */}
                      <span className={`absolute inset-0 rounded-full border ${
                        isRerouted ? "border-rose-500 animate-ping" : "border-sky-400/60 animate-pulse"
                      }`} />
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-850 p-2 rounded-lg text-[9px] text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-semibold shadow-xl">
                      <div>User Region: <b>{origin.name}</b></div>
                      <div className={isRerouted ? "text-rose-400" : "text-sky-400"}>
                        {isRerouted ? `Rerouted to backup → ${primaryReg?.backupRegionId.toUpperCase()}` : `Routing to primary → ${origin.primaryRegion.toUpperCase()}`}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Render Global Regional PoPs */}
              {regions.map((reg) => {
                const isDisaster = reg.id === activeDisasterRegionId;
                
                let colorClass = "bg-emerald-950 border-emerald-500 text-emerald-400 shadow-emerald-950/20";
                if (reg.status === "degraded") {
                  colorClass = "bg-amber-950 border-amber-500 text-amber-400 shadow-amber-950/20";
                } else if (reg.status === "failed") {
                  colorClass = "bg-rose-950 border-rose-500 text-rose-400 shadow-rose-950/20";
                }

                return (
                  <div
                    key={reg.id}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border p-2.5 ${colorClass} shadow-xl z-25 min-w-[125px] transition-all duration-500`}
                    style={{ left: `${reg.latLong.x}%`, top: `${reg.latLong.y}%` }}
                  >
                    <div className="flex items-center justify-between gap-1.5 border-b border-white/5 pb-1 mb-1.5">
                      <span className="text-[10px] font-black tracking-wide font-mono uppercase">{reg.id}</span>
                      <span className="text-[8px] font-mono opacity-80">{reg.code}</span>
                    </div>

                    <div className="space-y-1 font-semibold">
                      {/* BGP Status */}
                      <div className="flex items-center justify-between text-[8px] opacity-90">
                        <span>BGP Route</span>
                        <span className={`font-mono px-1 rounded uppercase ${
                          reg.bgpState === "advertising" ? "bg-emerald-900/40 text-emerald-300" : "bg-rose-900/40 text-rose-300"
                        }`}>
                          {reg.bgpState === "advertising" ? "ADVERT" : "WITHDRAWN"}
                        </span>
                      </div>

                      {/* Ping Health check */}
                      <div className="flex items-center justify-between text-[8px] opacity-90">
                        <span>Deep Probe</span>
                        <span className="font-mono text-[7px]">
                          {reg.healthCheckState.status === "healthy" ? "PASS" : `FAIL (${reg.healthCheckState.consecutiveFailures})`}
                        </span>
                      </div>
                    </div>

                    {/* Simple status badge */}
                    {reg.status === "failed" && (
                      <span className="absolute -top-2 -right-2 bg-rose-500 text-slate-950 font-black text-[8px] px-1 py-0.2 rounded uppercase tracking-wider animate-pulse shadow">
                        DEAD
                      </span>
                    )}
                  </div>
                );
              })}

            </div>
          </div>

          {/* Disaster Simulation Control Center */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 pb-3 gap-3">
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Regional Catastrophe & Disaster Injection Deck
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">Select a simulated cataclysmic vector and target any global routing region to test anycast failover routing convergence.</p>
              </div>

              {/* Disaster type choice */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 self-start sm:self-center">
                <button
                  onClick={() => setDisasterType("fiber_cut")}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                    disasterType === "fiber_cut" ? "bg-rose-950 border border-rose-900/40 text-rose-450" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Fiber Line Cut
                </button>
                <button
                  onClick={() => setDisasterType("power_blackout")}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                    disasterType === "power_blackout" ? "bg-rose-950 border border-rose-900/40 text-rose-450" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Power Grid Outage
                </button>
                <button
                  onClick={() => setDisasterType("datacenter_fire")}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                    disasterType === "datacenter_fire" ? "bg-rose-950 border border-rose-900/40 text-rose-450" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  DC Thermal Fire
                </button>
                <button
                  onClick={() => setDisasterType("sovereign_cloud_ban")}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                    disasterType === "sovereign_cloud_ban" ? "bg-rose-950 border border-rose-900/40 text-rose-450" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  IP Ban / Blockade
                </button>
              </div>
            </div>

            {/* Region selectors for Injection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {regions.map((reg) => {
                const isTarget = reg.id === activeDisasterRegionId;
                const isAnycastWithdrawn = reg.bgpState === "withdrawn";

                return (
                  <div 
                    key={reg.id}
                    className={`bg-slate-950 border rounded-xl p-4 flex flex-col justify-between space-y-4 ${
                      isTarget 
                        ? "border-rose-500/40 bg-rose-950/5" 
                        : "border-slate-900 hover:border-slate-800"
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-200 block font-mono">{reg.name}</span>
                      <p className="text-[10px] text-slate-500 leading-normal font-semibold italic">{reg.details}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      {reg.status === "failed" ? (
                        <div className="space-y-1.5 w-full">
                          <div className="text-[9px] text-rose-400 font-mono flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-500" />
                            Cluster Dead / SLA Blown
                          </div>

                          {/* BGP Route manual manipulation */}
                          {isAnycastWithdrawn ? (
                            <button
                              onClick={() => handleRecoverRegion(reg.id)}
                              className="w-full py-1.5 bg-emerald-950/45 hover:bg-emerald-950/70 border border-emerald-850 text-emerald-400 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                            >
                              Revive & Re-Advertise Prefix
                            </button>
                          ) : (
                            <button
                              onClick={() => handleTriggerBgpWithdrawal(reg.id)}
                              className="w-full py-1.5 bg-rose-900 hover:bg-rose-800 text-slate-100 text-[10px] font-black rounded-lg cursor-pointer transition-colors"
                            >
                              Withdraw Anycast BGP Prefix
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleInjectDisaster(reg.id)}
                          className="w-full py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-450 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          Inject Catastrophe
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick reset button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setRegions(JSON.parse(JSON.stringify(GLOBAL_REGIONS)));
                  setActiveDisasterRegionId(null);
                  addLog("Global infrastructure grid reset. All anycast metrics restored to healthy baselines.", "HEALTH_STATUS");
                }}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Global Topology Grid
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Health Check Specs & BGP Terminal */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Health-Check Configuration and Testing Board */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 backdrop-blur-sm space-y-5">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-sky-400" />
                Active Failover Health-Check Criteria
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Customize DNS failover parameters. Fine-tuning thresholds prevents "flapping routes" and avoids premature route withdrawals.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-4 text-xs font-semibold">
              
              {/* Endpoint Path */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Probing Endpoint Path</span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/30 px-1 py-0.2 rounded font-bold uppercase">Deep Probes Active</span>
                </div>
                <input
                  type="text"
                  value={hcConfig.endpointPath}
                  onChange={(e) => setHcConfig(prev => ({ ...prev, endpointPath: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-850 p-2 rounded-lg text-xs font-mono text-slate-250 focus:outline-none"
                />
              </div>

              {/* Sliding sliders */}
              <div className="space-y-3 pt-2">
                
                {/* Ping interval slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline text-[10px]">
                    <span className="font-mono text-slate-400 uppercase">Ping Probe Interval</span>
                    <span className="text-sky-450 font-mono font-bold">{hcConfig.pingIntervalSec} Seconds</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={hcConfig.pingIntervalSec}
                    onChange={(e) => setHcConfig(prev => ({ ...prev, pingIntervalSec: parseInt(e.target.value) }))}
                    className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-sky-500"
                  />
                </div>

                {/* Connection Timeout */}
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline text-[10px]">
                    <span className="font-mono text-slate-400 uppercase">Timeout Limit Threshold</span>
                    <span className="text-sky-450 font-mono font-bold">{hcConfig.timeoutMs} Milliseconds</span>
                  </div>
                  <input
                    type="range"
                    min="250"
                    max="5000"
                    step="250"
                    value={hcConfig.timeoutMs}
                    onChange={(e) => setHcConfig(prev => ({ ...prev, timeoutMs: parseInt(e.target.value) }))}
                    className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-sky-500"
                  />
                </div>

                {/* Unhealthy threshold */}
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline text-[10px]">
                    <span className="font-mono text-slate-400 uppercase">Unhealthy Failover Threshold</span>
                    <span className="text-rose-400 font-mono font-bold">{hcConfig.unhealthyThreshold} Consecutive Failures</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={hcConfig.unhealthyThreshold}
                    onChange={(e) => setHcConfig(prev => ({ ...prev, unhealthyThreshold: parseInt(e.target.value) }))}
                    className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-rose-500"
                  />
                </div>

              </div>

              {/* Service Deep Checks Checkboxes */}
              <div className="space-y-2 pt-3 border-t border-slate-900">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Deep Integration Checks</span>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-350">
                    <input
                      type="checkbox"
                      checked={hcConfig.deepCheckServices.database}
                      onChange={(e) => setHcConfig(prev => ({
                        ...prev,
                        deepCheckServices: { ...prev.deepCheckServices, database: e.target.checked }
                      }))}
                      className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <Database className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cross-Region Database Sync Check</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-350">
                    <input
                      type="checkbox"
                      checked={hcConfig.deepCheckServices.cache}
                      onChange={(e) => setHcConfig(prev => ({
                        ...prev,
                        deepCheckServices: { ...prev.deepCheckServices, cache: e.target.checked }
                      }))}
                      className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <Zap className="w-3.5 h-3.5 text-slate-500" />
                    <span>In-Memory Redis Replication Status</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-350">
                    <input
                      type="checkbox"
                      checked={hcConfig.deepCheckServices.gdsDirectConnect}
                      onChange={(e) => setHcConfig(prev => ({
                        ...prev,
                        deepCheckServices: { ...prev.deepCheckServices, gdsDirectConnect: e.target.checked }
                      }))}
                      className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <Server className="w-3.5 h-3.5 text-slate-500" />
                    <span>Direct NDC Airline Pipe Carrier Ping</span>
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Real-time BGP Route Logs Terminal */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-450 animate-pulse" />
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                  BGP Router CLI Output (AS64496)
                </h3>
              </div>
              <span className="text-[8px] font-mono text-slate-500 uppercase">CLI STREAM</span>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 h-[210px] overflow-y-auto font-mono text-[9px] scrollbar-thin">
              <div className="space-y-2.5">
                {bgpLogs.map((log, idx) => {
                  let badgeColor = "text-sky-400 bg-sky-950/40 border border-sky-900/30";
                  if (log.action === "BGP_WITHDRAW") badgeColor = "text-rose-400 bg-rose-950/40 border border-rose-900/30 font-bold";
                  if (log.action === "HEALTH_STATUS") badgeColor = "text-slate-400 bg-slate-900 border border-slate-850";
                  if (log.action === "TRAFFIC_REDIRECT") badgeColor = "text-amber-400 bg-amber-950/40 border border-amber-900/30 font-semibold";

                  return (
                    <div key={idx} className="border-b border-slate-900/40 pb-2 space-y-1">
                      <div className="flex items-center justify-between gap-2 text-slate-550">
                        <span>[{log.timestamp}]</span>
                        <span className="text-[8px]">{log.asNumber} • Peer: {log.peer}</span>
                      </div>
                      <div className="flex items-start gap-1.5 leading-relaxed">
                        <span className={`px-1.5 py-0.2 rounded text-[7px] font-bold uppercase shrink-0 ${badgeColor}`}>
                          {log.action}
                        </span>
                        <span className="text-slate-300 leading-normal">{log.message}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Deep Engineering Specs Accordion Section */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-slate-250 uppercase font-mono tracking-wide flex items-center gap-1.5">
            <FileText className="w-4.5 h-4.5 text-sky-400" />
            Anycast BGP DNS & Latency-Based Failover Production Specifications
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Production configurations outlining deep medical, network layer, and state-machine policies implemented across FlySmart WAN edge locations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed font-semibold">
          
          <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-450" />
              1. Layer-3 BGP Prefix Routing
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              The FlySmart global Anycast network advertises the IPv4 subnet <code>192.0.2.0/24</code> and IPv6 subnet <code>2001:db8::/32</code> across all regional border gateways. Tier-1 transit providers route requests to the nearest PoP using standard shortest AS-Path values.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>AS-Path Prepending utilized for regional tuning.</li>
              <li>BGP community tags configured for local preferencing.</li>
              <li>SLA Route flaps stabilized by BGP Damping timers.</li>
            </ul>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-450" />
              2. Deep vs. Shallow Health Criteria
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              Shallow health checks ping physical ingress routers. FlySmart implements **Deep Health Checks** at <code>/api/v1/health/deep</code> that actively verify critical database replication, Redis state, and direct NDC protocol links.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>Active connections are drained if success drops below 95%.</li>
              <li>503 responses trigger immediate AS-Path withdrawal.</li>
              <li>Route fails over dynamically in under 15 seconds.</li>
            </ul>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-sky-450" />
              3. DNS TTL & Latency Metrics
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              DNS record TTL values are set to a strict 10 seconds. In latency-based routing, real-time telemetry updates DNS mapping tables based on round-trip latency profiles (RTT) gathered from regional client pings.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>Active EDNS client subnet (ECS) parameters applied.</li>
              <li>Anycast failback uses a 5-minute cooldown damping.</li>
              <li>Average global RTT rerouting converges in &lt; 12s.</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}
