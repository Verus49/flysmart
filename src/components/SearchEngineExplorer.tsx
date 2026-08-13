import React, { useState, useEffect } from "react";
import { SEARCH_STAGE_DOCS, SearchStageDoc } from "../data/searchDocs";
import { 
  Play, 
  RotateCw, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Database, 
  Cpu, 
  Layers, 
  Clock, 
  DollarSign, 
  Zap, 
  Split,
  Terminal,
  Code
} from "lucide-react";

interface SimulationState {
  step: "idle" | "cache_check" | "partner_routing" | "parallel_fetch" | "dedup" | "ranking" | "complete";
  routeType: "long_haul" | "regional_lcc" | "complex_unserved";
  cacheStatus: "hit" | "miss";
  providers: {
    name: string;
    selected: boolean;
    reason: string;
    latency: number;
    status: "pending" | "success" | "timeout" | "skipped";
    cost: number;
  }[];
  metrics: {
    totalDuration: number;
    apiCost: number;
    cacheEfficiency: string;
    flightsFound: number;
    dedupCount: number;
  };
  log: string[];
}

export default function SearchEngineExplorer() {
  const [selectedStageId, setSelectedStageId] = useState<string>("search-flow");
  const [sim, setSim] = useState<SimulationState>({
    step: "idle",
    routeType: "long_haul",
    cacheStatus: "miss",
    providers: [],
    metrics: { totalDuration: 0, apiCost: 0, cacheEfficiency: "0%", flightsFound: 0, dedupCount: 0 },
    log: []
  });

  const selectedStage = SEARCH_STAGE_DOCS.find(s => s.id === selectedStageId) || SEARCH_STAGE_DOCS[0];

  const runSimulation = (type: "long_haul" | "regional_lcc" | "complex_unserved") => {
    // Reset state
    const isCacheHit = Math.random() < 0.25 && type !== "complex_unserved"; // 25% chance of cache hit

    let initialProviders = [
      { name: "Sabre GDS", selected: true, reason: "Default premium inventory", latency: 0, status: "pending" as const, cost: 0.03 },
      { name: "Amadeus GDS", selected: true, reason: "Full-service coverage", latency: 0, status: "pending" as const, cost: 0.03 },
      { name: "Ryanair NDC", selected: false, reason: "Excluded: long-haul route", latency: 0, status: "skipped" as const, cost: 0 },
      { name: "Wizz Air NDC", selected: false, reason: "Excluded: long-haul route", latency: 0, status: "skipped" as const, cost: 0 }
    ];

    if (type === "regional_lcc") {
      initialProviders = [
        { name: "Sabre GDS", selected: false, reason: "Excluded: optimized for low-cost regionals", latency: 0, status: "skipped" as const, cost: 0 },
        { name: "Amadeus GDS", selected: true, reason: "Backup regional availability", latency: 0, status: "pending" as const, cost: 0.03 },
        { name: "Ryanair NDC", selected: true, reason: "Primary low-cost carrier route", latency: 0, status: "pending" as const, cost: 0.01 },
        { name: "Wizz Air NDC", selected: true, reason: "Secondary budget carrier route", latency: 0, status: "pending" as const, cost: 0.01 }
      ];
    } else if (type === "complex_unserved") {
      initialProviders = [
        { name: "Sabre GDS", selected: true, reason: "Global alliances required", latency: 0, status: "pending" as const, cost: 0.03 },
        { name: "Amadeus GDS", selected: true, reason: "Global alliances required", latency: 0, status: "pending" as const, cost: 0.03 },
        { name: "Ryanair NDC", selected: false, reason: "Excluded: long-haul unserved path", latency: 0, status: "skipped" as const, cost: 0 },
        { name: "Wizz Air NDC", selected: false, reason: "Excluded: long-haul unserved path", latency: 0, status: "skipped" as const, cost: 0 }
      ];
    }

    setSim({
      step: "cache_check",
      routeType: type,
      cacheStatus: isCacheHit ? "hit" : "miss",
      providers: initialProviders,
      metrics: { totalDuration: 0, apiCost: 0, cacheEfficiency: "0%", flightsFound: 0, dedupCount: 0 },
      log: [`[SYSTEM] Search query initiated for: ${type === "long_haul" ? "FRA ➔ JFK" : type === "regional_lcc" ? "LHR ➔ CDG" : "CDG ➔ SYD"}`]
    });
  };

  useEffect(() => {
    if (sim.step === "idle" || sim.step === "complete") return;

    const timer = setTimeout(() => {
      setSim(prev => {
        const nextLog = [...prev.log];
        let nextStep = prev.step;
        let nextProviders = [...prev.providers];
        let nextMetrics = { ...prev.metrics };

        if (prev.step === "cache_check") {
          nextLog.push("[L1/L2 CACHE] Checking Edge Cache and Redis Cluster memory tables...");
          if (prev.cacheStatus === "hit") {
            nextLog.push("[L2 CACHE] ★ Hit found in Redis cache! Age: 4m 12s. Bypassing external GDS routing.");
            nextLog.push("[SYSTEM] Normalizing cached results...");
            nextStep = "ranking";
            nextMetrics = {
              totalDuration: 18, // 18ms
              apiCost: 0, // $0
              cacheEfficiency: "100%",
              flightsFound: 42,
              dedupCount: 8
            };
          } else {
            nextLog.push("[L2 CACHE] Miss. Initializing Partner Selection Algorithm to filter active routes...");
            nextStep = "partner_routing";
          }
        } 
        else if (prev.step === "partner_routing") {
          nextLog.push("[PARTNER] Evaluating carrier coverage matrices & historic success rates...");
          prev.providers.forEach(p => {
            if (p.selected) {
              nextLog.push(`[PARTNER] Selected ${p.name} adapter - Reason: ${p.reason}`);
            } else {
              nextLog.push(`[PARTNER] Bypassed ${p.name} adapter - Reason: ${p.reason}`);
            }
          });
          nextStep = "parallel_fetch";
          nextLog.push("[ORCHESTRATOR] Spawning parallel Go-routine threads with strict contexts...");
        } 
        else if (prev.step === "parallel_fetch") {
          nextLog.push("[DISPATCH] Issuing parallel queries. Waiting for thread watchdogs...");
          
          let maxLatency = 0;
          let totalCost = 0;
          nextProviders = prev.providers.map(p => {
            if (!p.selected) return p;
            
            totalCost += p.cost;
            let finalLatency = 0;
            let finalStatus: "success" | "timeout" = "success";

            if (prev.routeType === "complex_unserved" && p.name === "Sabre GDS") {
              finalLatency = 1450; // Triggers the 1200ms timeout
              finalStatus = "timeout";
            } else if (p.name.includes("GDS")) {
              finalLatency = Math.floor(Math.random() * 400) + 600; // 600 - 1000ms
            } else {
              finalLatency = Math.floor(Math.random() * 250) + 200; // 200 - 450ms
            }

            maxLatency = Math.max(maxLatency, finalStatus === "timeout" ? 1200 : finalLatency);

            return {
              ...p,
              latency: finalLatency,
              status: finalStatus
            };
          });

          nextProviders.forEach(p => {
            if (p.selected) {
              if (p.status === "timeout") {
                nextLog.push(`[TIMEOUT] ⚠ ${p.name} failed to respond in 1200ms window! Execution severed.`);
                nextLog.push(`[FALLBACK] Initiating stale-cache backup queries for ${p.name}...`);
              } else {
                nextLog.push(`[SUCCESS] ${p.name} completed in ${p.latency}ms (Cost: $${p.cost.toFixed(2)})`);
              }
            }
          });

          nextStep = "dedup";
          nextMetrics.totalDuration = maxLatency;
          nextMetrics.apiCost = totalCost;
        } 
        else if (prev.step === "dedup") {
          nextLog.push("[NORMALIZER] Resolving XML/JSON carrier responses to unified travel schemas.");
          let deduped = prev.routeType === "long_haul" ? 14 : prev.routeType === "regional_lcc" ? 6 : 9;
          let found = prev.routeType === "long_haul" ? 38 : prev.routeType === "regional_lcc" ? 54 : 22;
          
          nextLog.push(`[DEDUP] Identified and merged ${deduped} duplicate/codeshare flight segments.`);
          nextLog.push(`[DEDUP] Successfully resolved multi-GDS overlaps. Net unique flights: ${found}`);
          
          nextStep = "ranking";
          nextMetrics.flightsFound = found;
          nextMetrics.dedupCount = deduped;
        } 
        else if (prev.step === "ranking") {
          nextLog.push("[RANKING] Calculating Multi-Criteria Value Scores (Price, Duration, Connections, Affinities)...");
          nextLog.push("[CACHING] Saving normalized unique records to Regional Redis Cluster (TTL: 30m)...");
          nextLog.push("[SYSTEM] Search pipeline successfully resolved. Returning JSON chunks via SSE.");
          nextStep = "complete";
        }

        return {
          ...prev,
          step: nextStep,
          providers: nextProviders,
          metrics: nextMetrics,
          log: nextLog
        };
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [sim.step]);

  return (
    <div className="space-y-6 animate-fadeIn" id="search-engine-explorer-root">
      {/* Dynamic Simulation Terminal Block */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <div className="text-[10px] bg-sky-950 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase max-w-max">
              Interactive Blueprint Simulator
            </div>
            <h2 className="text-lg font-black text-slate-100 tracking-tight mt-1.5 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-sky-400" />
              Live Flight Search Pipeline Simulation
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a typical query routing profile to trigger the parallel orchestrator and watch thread allocation, timeout controls, and de-confliction work in real-time.
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => runSimulation("long_haul")}
              disabled={sim.step !== "idle" && sim.step !== "complete"}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                sim.step !== "idle" && sim.step !== "complete"
                  ? "bg-slate-950 border-slate-900 text-slate-600"
                  : "bg-slate-900 border-slate-800 text-sky-400 hover:text-sky-300 hover:border-slate-700"
              }`}
            >
              <Play className="w-3 h-3" />
              Long-Haul (FRA-JFK)
            </button>
            <button
              onClick={() => runSimulation("regional_lcc")}
              disabled={sim.step !== "idle" && sim.step !== "complete"}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                sim.step !== "idle" && sim.step !== "complete"
                  ? "bg-slate-950 border-slate-900 text-slate-600"
                  : "bg-slate-900 border-slate-800 text-sky-400 hover:text-sky-300 hover:border-slate-700"
              }`}
            >
              <Play className="w-3 h-3" />
              Regional LCC (LHR-CDG)
            </button>
            <button
              onClick={() => runSimulation("complex_unserved")}
              disabled={sim.step !== "idle" && sim.step !== "complete"}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                sim.step !== "idle" && sim.step !== "complete"
                  ? "bg-slate-950 border-slate-900 text-slate-600"
                  : "bg-slate-900 border-slate-800 text-sky-400 hover:text-sky-300 hover:border-slate-700"
              }`}
            >
              <Play className="w-3 h-3" />
              Unserved Segment (CDG-SYD)
            </button>
          </div>
        </div>

        {/* Simulator grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Pipeline Status */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Thread Allocation & Supplier Adapters
            </div>
            
            {sim.step === "idle" ? (
              <div className="bg-slate-950/40 border border-dashed border-slate-800/80 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-2 h-[220px]">
                <Settings className="w-8 h-8 text-slate-600 animate-spin" style={{ animationDuration: "12s" }} />
                <span className="text-xs text-slate-400 font-semibold">Pipeline Dormant</span>
                <span className="text-[10px] text-slate-500 max-w-xs">
                  Choose a route option above to feed the orchestrator with live segment query descriptors.
                </span>
              </div>
            ) : (
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 space-y-3.5 h-[220px] overflow-y-auto scrollbar-thin">
                {sim.providers.map((p) => (
                  <div key={p.name} className="flex items-center justify-between border-b border-slate-900/60 pb-2 last:border-0 last:pb-0">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold font-mono text-slate-200 flex items-center gap-2">
                        {p.name}
                        {p.selected ? (
                          <span className="text-[9px] px-1 bg-emerald-950 text-emerald-400 border border-emerald-900/40 rounded">ACTIVE</span>
                        ) : (
                          <span className="text-[9px] px-1 bg-slate-900 text-slate-500 border border-slate-800 rounded">MUTED</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">{p.reason}</div>
                    </div>

                    <div className="text-right font-mono shrink-0">
                      {p.status === "skipped" && (
                        <span className="text-slate-600 text-xs">Skipped</span>
                      )}
                      {p.status === "pending" && (
                        <span className="text-sky-400 text-xs flex items-center gap-1">
                          <RotateCw className="w-3 h-3 animate-spin" />
                          Querying
                        </span>
                      )}
                      {p.status === "success" && (
                        <span className="text-emerald-400 text-xs">
                          {p.latency}ms
                        </span>
                      )}
                      {p.status === "timeout" && (
                        <span className="text-rose-500 text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Timeout
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Simulated Live Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Response Latency</div>
                <div className="text-xl font-black text-slate-200 mt-0.5 font-mono">
                  {sim.step === "idle" ? "0ms" : `${sim.metrics.totalDuration}ms`}
                </div>
              </div>
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
                <div className="text-[10px] text-slate-500 uppercase font-mono">API Surcharge Cost</div>
                <div className="text-xl font-black text-rose-400/90 mt-0.5 font-mono">
                  {sim.step === "idle" ? "$0.00" : `$${sim.metrics.apiCost.toFixed(2)}`}
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Console Logs */}
          <div className="lg:col-span-7 flex flex-col space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 justify-between">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-500" />
                Orchestration Console Stream
              </span>
              <span className="text-[10px] font-mono text-slate-600 lowercase">
                step: {sim.step}
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-900 font-mono text-[10px] leading-relaxed text-emerald-400/90 h-[260px] overflow-y-auto scrollbar-thin flex flex-col-reverse justify-end gap-1">
              {[...sim.log].reverse().map((line, idx) => (
                <div key={idx} className="animate-fadeIn">
                  <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  <span>{line}</span>
                </div>
              ))}
              {sim.step === "idle" && (
                <div className="text-slate-600 text-center py-20">
                  // System output terminal is idle.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Structured Engineering Specifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation panel */}
        <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
              <Split className="w-4 h-4 text-sky-400" />
              Engine Architecture Blocks
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Dive deep into specific engineering parameters of our high-concurrency, cost-minimizing flight search design.
            </p>
          </div>

          <div className="space-y-1.5">
            {SEARCH_STAGE_DOCS.map((stage) => {
              const isSelected = stage.id === selectedStageId;
              return (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStageId(stage.id)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all border flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-sky-950/30 border-sky-500/30 text-sky-400 shadow-lg shadow-sky-950/20"
                      : "bg-slate-950/30 border-slate-800/60 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800 hover:text-slate-200"
                  }`}
                >
                  <span className="font-bold text-xs tracking-wide">
                    {stage.title}
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-1">
                    {stage.shortDesc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected block details */}
        <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-black text-slate-100 tracking-tight">
              {selectedStage.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {selectedStage.details}
            </p>
          </div>

          {/* ASCII flowchart */}
          {selectedStage.flowchart && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Sequence Diagram / Component Interaction</div>
              <pre className="bg-slate-950/60 p-5 rounded-xl border border-slate-900 text-[10px] font-mono text-sky-400/90 leading-relaxed overflow-x-auto">
                {selectedStage.flowchart}
              </pre>
            </div>
          )}

          {/* Subsections with Technical Details */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Component Deep-Dive & Strict Constraints
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedStage.subsections.map((sub) => (
                <div key={sub.name} className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    {sub.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {sub.description}
                  </p>
                  <ul className="space-y-2 pt-1 border-t border-slate-900">
                    {sub.technicalDetails.map((detail, dIdx) => (
                      <li key={dIdx} className="text-[10px] text-slate-500 leading-relaxed flex gap-1.5">
                        <span className="text-sky-500 shrink-0">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
