import React, { useState, useMemo } from "react";
import { SimulationParams, SimulationResults } from "../types";
import { CACHING_LAYERS, CACHE_DISCUSSIONS, CachingLayerDoc } from "../data/cachingDocs";
import { 
  TrendingUp, 
  DollarSign, 
  Gauge, 
  Zap, 
  BarChart3, 
  Percent, 
  HelpCircle,
  Database,
  ArrowRight,
  Globe,
  Cpu,
  MapPin,
  Brain,
  Compass,
  Search,
  Server,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Activity,
  ChevronRight,
  RefreshCw,
  FileText
} from "lucide-react";

const IconMap: Record<string, React.ComponentType<any>> = {
  Globe: Globe,
  Cpu: Cpu,
  MapPin: MapPin,
  Brain: Brain,
  Compass: Compass,
  Search: Search,
  Database: Database
};

export default function CacheSimulator() {
  const [activeSubTab, setActiveSubTab] = useState<"simulator" | "architecture">("architecture");
  const [selectedLayerId, setSelectedLayerId] = useState<string>("cloudflare");

  const [params, setParams] = useState<SimulationParams>({
    dailyQueries: 1500000, // 1.5M searches a day
    cacheHitRatio: 0.96,   // 96% default for 95%+ target
    gdsCostPerQuery: 0.02, // $0.02 Sabre/Amadeus fee
    cachedCostPerQuery: 0.0001, // $0.0001 Redis/CDN overhead
    dbWriteCostPerQuery: 0.0003, // Cloud Spanner sync overhead
    predictionModelScaleCost: 15000 // $15k per month for ML GPU scaling
  });

  const results = useMemo<SimulationResults>(() => {
    const q = params.dailyQueries;
    const hit = params.cacheHitRatio;
    const miss = 1 - hit;

    // Billing without caching (all hits go to GDS)
    const rawGdsCostDaily = q * params.gdsCostPerQuery;

    // Optimized Billing with Caching
    const uncachedCost = q * miss * params.gdsCostPerQuery;
    const cachedCost = q * hit * params.cachedCostPerQuery;
    const dbCost = q * miss * params.dbWriteCostPerQuery; // only sync transactional writes
    const mlMonthlyDaily = params.predictionModelScaleCost / 30;
    const optimizedCostDaily = uncachedCost + cachedCost + dbCost + mlMonthlyDaily;

    const dailySavings = Math.max(0, rawGdsCostDaily - optimizedCostDaily);
    const annualSavings = dailySavings * 365;

    // Latency Model: GDS is 1600ms, Redis/CDN is 30ms
    const averageSearchLatency = (hit * 30) + (miss * 1600);

    return {
      rawGdsCostDaily,
      optimizedCostDaily,
      dailySavings,
      annualSavings,
      averageSearchLatency,
      cacheHitsCount: Math.round(q * hit),
      uncachedHitsCount: Math.round(q * miss)
    };
  }, [params]);

  // Generate SVG chart data points for Latency vs Cache Hit Ratio
  const chartPoints = useMemo(() => {
    const points = [];
    for (let r = 0; r <= 1.01; r += 0.1) {
      const lat = (r * 30) + ((1 - r) * 1600);
      // Map x: 0% to 100% -> svg coordinate 40 to 360
      const x = 40 + r * 320;
      // Map y: 0ms to 1600ms -> svg coordinate 160 to 10 (inverted)
      const y = 160 - (lat / 1600) * 140;
      points.push({ x, y, ratio: Math.round(r * 100), latency: Math.round(lat) });
    }
    return points;
  }, []);

  const chartPath = chartPoints.map(p => `${p.x},${p.y}`).join(" L ");

  const selectedLayer = CACHING_LAYERS.find(l => l.id === selectedLayerId) || CACHING_LAYERS[0];

  return (
    <div className="space-y-6 animate-fadeIn" id="cache-simulator-root">
      
      {/* Caching Banner Section */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] bg-sky-950 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase max-w-max">
            Active-Active Distributed Topology
          </div>
          <h2 className="text-lg font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            Platform Multi-Layer Caching Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            An enterprise-grade high-concurrency caching structure targeting a <strong>&gt;95% Cache Hit Ratio</strong> to drastically optimize API lookup latencies and slash supplier pricing billing models.
          </p>
        </div>

        {/* Toggles */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 shrink-0">
          <button
            onClick={() => setActiveSubTab("architecture")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "architecture"
                ? "bg-sky-950 border border-sky-850 text-sky-400 shadow-md shadow-sky-950/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Caching Specification
          </button>
          <button
            onClick={() => setActiveSubTab("simulator")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "simulator"
                ? "bg-sky-950 border border-sky-850 text-sky-400 shadow-md shadow-sky-950/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Economic Simulator
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE SUBTAB CONTENT */}
      {activeSubTab === "architecture" ? (
        <div className="space-y-6">
          
          {/* Caching Layers Stack Explorer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Visual Stack of Layers (Left Column) */}
            <div className="lg:col-span-5 bg-slate-950/60 border border-slate-900 rounded-xl p-5 space-y-4">
              <div className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wide flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  Caching Request Pipeline (7 Layers)
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/10">
                  Target: &gt;95% Hits
                </span>
              </div>

              {/* Cache Layer Buttons representing the vertical stack */}
              <div className="space-y-2">
                {CACHING_LAYERS.map((layer, index) => {
                  const isSelected = layer.id === selectedLayerId;
                  const IconComponent = IconMap[layer.iconName] || Layers;
                  
                  return (
                    <button
                      key={layer.id}
                      onClick={() => setSelectedLayerId(layer.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                        isSelected 
                          ? "bg-sky-950/40 border-sky-500/30 text-sky-300 shadow-lg shadow-sky-950/30"
                          : "bg-slate-900/10 border-slate-900 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border transition-all ${
                          isSelected ? "bg-sky-900/50 border-sky-500/30 text-sky-400 animate-pulse" : "bg-slate-950 border-slate-900 text-slate-500 group-hover:text-slate-300"
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">{layer.name}</div>
                          <span className="text-[9px] font-mono text-slate-500 uppercase">{layer.type}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500 shrink-0">
                        <span>TTL: {layer.ttl.split(" ")[0]}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Layer Technical Specs (Right Column) */}
            <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-sm">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-sky-950 text-sky-400 border border-sky-850 rounded-xl">
                    {React.createElement(IconMap[selectedLayer.iconName] || Layers, { className: "w-5 h-5" })}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-100 tracking-tight">
                      {selectedLayer.name}
                    </h3>
                    <p className="text-[11px] font-mono text-sky-400 mt-0.5 uppercase tracking-wider">{selectedLayer.type}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed font-semibold">
                  {selectedLayer.description}
                </p>
              </div>

              {/* Key Values Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">TTL Expiration Policy</span>
                  <div className="text-xs font-bold text-slate-200">{selectedLayer.ttl}</div>
                </div>
                <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Eviction Mechanism</span>
                  <div className="text-xs font-bold text-slate-200">{selectedLayer.eviction}</div>
                </div>
                <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Payload Compression</span>
                  <div className="text-xs font-bold text-slate-200">{selectedLayer.compression}</div>
                </div>
                <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Pre-Warming Plan</span>
                  <div className="text-xs font-bold text-slate-200">{selectedLayer.warming}</div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Operational Details & Node Integration
                </h4>

                <ul className="space-y-2">
                  {selectedLayer.technicalDetails.map((detail, idx) => (
                    <li key={idx} className="p-3 bg-slate-950/30 border border-slate-900 rounded-lg text-xs text-slate-450 leading-relaxed flex gap-2 font-medium">
                      <span className="text-sky-500 shrink-0 font-mono">0{idx + 1}.</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Deep-Dive Architectural Discussions */}
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                Architectural Invalidation & Performance Strategies
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                A closer examination of the invalidation pipelines, replication grids, compression protocols, and hit-rate optimizations engineered to sustain our &gt;95% SLA.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CACHE_DISCUSSIONS.map((disc, idx) => (
                <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-sky-400 font-bold uppercase bg-sky-950/30 border border-sky-500/20 px-2 py-0.5 rounded-full">
                      Strategy {idx + 1}
                    </span>
                    <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">{disc.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                      <strong>Method:</strong> {disc.strategy}
                    </p>
                    <p className="text-[11px] text-emerald-400 leading-relaxed font-semibold">
                      <strong>Impact:</strong> {disc.impact}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-900 space-y-2">
                    <div className="text-[9px] font-mono text-slate-500 uppercase">Implementation Steps:</div>
                    <ul className="space-y-1.5">
                      {disc.implementation.map((step, sIdx) => (
                        <li key={sIdx} className="text-[10px] text-slate-500 leading-normal flex gap-1.5 font-medium">
                          <span className="text-sky-500 shrink-0">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Sliders Form Control */}
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              Simulation Inputs
            </h3>

            {/* Daily Searches */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Daily Flight Searches</span>
                <span className="text-sky-400 font-bold font-mono">
                  {params.dailyQueries.toLocaleString()} / day
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="5000000"
                step="50000"
                value={params.dailyQueries}
                onChange={(e) => setParams({ ...params, dailyQueries: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>100K</span>
                <span>2.5M (Medium Enterprise)</span>
                <span>5M</span>
              </div>
            </div>

            {/* Cache Hit Ratio */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Cache Hit Ratio Target</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {Math.round(params.cacheHitRatio * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.99"
                step="0.01"
                value={params.cacheHitRatio}
                onChange={(e) => setParams({ ...params, cacheHitRatio: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50%</span>
                <span>95% (Minimum Target)</span>
                <span>99% (Max Grid Optimization)</span>
              </div>
            </div>

            {/* GDS cost per lookup */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Sabre / Amadeus Fee (Per Query)</span>
                <span className="text-amber-400 font-bold font-mono">
                  ${params.gdsCostPerQuery.toFixed(3)}
                </span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.050"
                step="0.005"
                value={params.gdsCostPerQuery}
                onChange={(e) => setParams({ ...params, gdsCostPerQuery: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$0.005</span>
                <span>$0.020 (Avg. SLA Rate)</span>
                <span>$0.050</span>
              </div>
            </div>

            {/* Cache infrastructure cost */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Redis / CDN Cost (Per Query)</span>
                <span className="text-purple-400 font-bold font-mono">
                  ${params.cachedCostPerQuery.toFixed(5)}
                </span>
              </div>
              <input
                type="range"
                min="0.00001"
                max="0.00050"
                step="0.00001"
                value={params.cachedCostPerQuery}
                onChange={(e) => setParams({ ...params, cachedCostPerQuery: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$0.00001</span>
                <span>$0.00010 (Avg. Memstore)</span>
                <span>$0.00050</span>
              </div>
            </div>

            {/* ML prediction scale cost */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Inference / ML Infrastructure Scale</span>
                <span className="text-rose-400 font-bold font-mono">
                  ${params.predictionModelScaleCost.toLocaleString()} / month
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="50000"
                step="2500"
                value={params.predictionModelScaleCost}
                onChange={(e) => setParams({ ...params, predictionModelScaleCost: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$5,000</span>
                <span>$15,000 (GCP Cluster Config)</span>
                <span>$50,000</span>
              </div>
            </div>
          </div>

          {/* Simulator Outputs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Key Metrics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Estimated Annual Savings</div>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                    ${Math.round(results.annualSavings).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-none">
                    Saves ~${Math.round(results.dailySavings).toLocaleString()} daily
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-950/50 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Average Search Latency</div>
                  <div className="text-xl font-black text-sky-400 font-mono mt-0.5">
                    {results.averageSearchLatency.toFixed(1)} ms
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-none">
                    Direct provider queries take ~1,600ms
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full filter blur-xl pointer-events-none"></div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-800 pb-2 flex justify-between items-center">
                <span>Financial Comparison (Daily Overhead)</span>
                <span className="text-[10px] text-slate-500 normal-case font-normal">*Calculated based on GDS + DB queries</span>
              </h4>

              <div className="space-y-4">
                {/* Without Cache */}
                <div className="flex items-center justify-between p-3 bg-rose-950/20 border border-rose-950 rounded-xl text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-rose-400">Standard Meta-Search (No Cache)</div>
                    <div className="text-slate-400 text-[10px]">{params.dailyQueries.toLocaleString()} GDS Queries / day</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-rose-400 font-mono text-base">${Math.round(results.rawGdsCostDaily).toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">Total Provider Bill / Day</div>
                  </div>
                </div>

                <div className="flex justify-center my-1 text-slate-600">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>

                {/* With Platform Cache */}
                <div className="flex items-center justify-between p-3 bg-emerald-950/20 border border-emerald-950 rounded-xl text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-emerald-400">FlySmart Platform Topology</div>
                    <div className="text-slate-400 text-[10px] flex items-center gap-1">
                      <span>{results.cacheHitsCount.toLocaleString()} cached</span>
                      <span>•</span>
                      <span>{results.uncachedHitsCount.toLocaleString()} live</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-450 font-mono text-base">${Math.round(results.optimizedCostDaily).toLocaleString()}</div>
                    <div className="text-[10px] text-emerald-300 font-bold">Overhead Reduction of {((1 - results.optimizedCostDaily / results.rawGdsCostDaily) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphical Latency vs Cache Hit Curve */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-sky-400 animate-pulse" />
                <span>Performance Latency vs. Cache Hit Target</span>
              </h4>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Custom SVG Line Chart */}
                <div className="flex-1 w-full bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex items-center justify-center">
                  <svg className="w-full max-w-[380px] h-[180px]" viewBox="0 0 400 180">
                    {/* Grid lines */}
                    <line x1="40" y1="10" x2="360" y2="10" stroke="#1e293b" strokeDasharray="3,3" />
                    <line x1="40" y1="80" x2="360" y2="80" stroke="#1e293b" strokeDasharray="3,3" />
                    <line x1="40" y1="150" x2="360" y2="150" stroke="#1e293b" strokeDasharray="3,3" />

                    {/* Axes */}
                    <line x1="40" y1="10" x2="40" y2="150" stroke="#334155" />
                    <line x1="40" y1="150" x2="360" y2="150" stroke="#334155" />

                    {/* Y-axis Labels */}
                    <text x="32" y="15" fill="#475569" fontSize="9" textAnchor="end" fontFamily="monospace">1.6s</text>
                    <text x="32" y="85" fill="#475569" fontSize="9" textAnchor="end" fontFamily="monospace">800ms</text>
                    <text x="32" y="153" fill="#475569" fontSize="9" textAnchor="end" fontFamily="monospace">30ms</text>

                    {/* X-axis Labels */}
                    <text x="40" y="165" fill="#475569" fontSize="9" textAnchor="middle" fontFamily="monospace">0%</text>
                    <text x="200" y="165" fill="#475569" fontSize="9" textAnchor="middle" fontFamily="monospace">50%</text>
                    <text x="360" y="165" fill="#475569" fontSize="9" textAnchor="middle" fontFamily="monospace">100%</text>

                    {/* Connection Line */}
                    <path d={`M ${chartPath}`} fill="none" stroke="#0284c7" strokeWidth="2.5" />

                    {/* Area fill */}
                    <path d={`M 40,150 L ${chartPath} L 360,150 Z`} fill="url(#glow-grad)" className="opacity-40" />

                    {/* Current Operating Point Marker */}
                    {(() => {
                      const ratio = params.cacheHitRatio;
                      const lat = (ratio * 30) + ((1 - ratio) * 1600);
                      const markerX = 40 + ratio * 320;
                      const markerY = 160 - (lat / 1600) * 140;

                      return (
                        <g>
                          <circle cx={markerX} cy={markerY} r="6" fill="#10b981" className="animate-ping" />
                          <circle cx={markerX} cy={markerY} r="5" fill="#10b981" stroke="#022c22" strokeWidth="2" />
                          <text x={markerX} y={markerY - 12} fill="#10b981" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                            {Math.round(lat)}ms ({Math.round(ratio * 100)}%)
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                {/* Explanatory notes */}
                <div className="w-full sm:w-[180px] space-y-3 shrink-0 text-xs">
                  <div className="bg-slate-950/20 border border-slate-800 rounded-xl p-2.5 space-y-1">
                    <div className="font-semibold text-slate-300">Why does it bend?</div>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      Latency drops linearly as cache hits increase. When hits approach 95%+, almost all transactions return in sub-30ms, bringing the global SLA below 100ms.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-mono leading-none">
                    <Database className="w-3.5 h-3.5 text-purple-400" />
                    <span>Saves millions on NDC bills</span>
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
