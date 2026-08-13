import React, { useState, useEffect, useMemo } from "react";
import { 
  CircleDollarSign, 
  TrendingDown, 
  Zap, 
  Layers, 
  Cpu, 
  Database, 
  HardDrive, 
  Network, 
  Scale, 
  Sparkles, 
  Flame, 
  Coins, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Gauge, 
  Info, 
  RefreshCw, 
  FileCode, 
  LineChart, 
  Minimize2, 
  FolderArchive, 
  Image as ImageIcon, 
  Bot, 
  MessageSquareShare
} from "lucide-react";

// --- TYPES & INTERFACES ---
type CostTab = "optimization_simulator" | "compute_spot" | "storage_network" | "db_queue" | "ml_api_costs";

interface CostMetric {
  id: string;
  name: string;
  category: "compute" | "storage" | "network" | "database" | "api" | "ml";
  unoptimizedCost: number;
  optimizedCost: number;
  strategy: string;
  details: string;
  impactLevel: "critical" | "high" | "medium";
}

export default function CloudCostOptimizationExplorer() {
  const [activeTab, setActiveTab] = useState<CostTab>("optimization_simulator");
  
  // Interactive Simulation Multipliers
  const [computeScale, setComputeScale] = useState<number>(100); // 0 to 200 percent load
  const [spotRatio, setSpotRatio] = useState<number>(0); // 0% to 100% of non-critical workloads
  const [coldStoragePercent, setColdStoragePercent] = useState<number>(20); // 0% to 100% of logs/backups
  const [brotliEnabled, setBrotliEnabled] = useState<boolean>(false);
  const [imageOptimizationEnabled, setImageOptimizationEnabled] = useState<boolean>(false);
  const [apiCollapsingEnabled, setApiCollapsingEnabled] = useState<boolean>(false);
  const [mlQuantizationEnabled, setMlQuantizationEnabled] = useState<boolean>(false);
  const [dbPoolingEnabled, setDbPoolingEnabled] = useState<boolean>(false);
  const [cdnCachingRatio, setCdnCachingRatio] = useState<number>(40); // 0% to 100% cache-hit ratio

  // Static list of Cost Metrics and Optimization Rules
  const costStrategies: CostMetric[] = useMemo(() => [
    {
      id: "compute_spot",
      name: "Compute (Spot Instances & K8s Autoscaling)",
      category: "compute",
      unoptimizedCost: 45000,
      optimizedCost: 11250,
      strategy: "GKE Autopilot + Spot instances for stateless workers",
      details: "Leverage spare capacity Spot VMs for non-critical queue consumers and API workers. Combined with horizontal pod autoscalers (HPA) targeting 75% target CPU and scale-to-zero serverless knative platforms during low-traffic windows (2 AM - 6 AM).",
      impactLevel: "critical"
    },
    {
      id: "db_connections",
      name: "Database Costs (Proxy Pooling & Read Replicas)",
      category: "database",
      unoptimizedCost: 28000,
      optimizedCost: 14500,
      strategy: "PgBouncer + read replicas with query routing rules",
      details: "Implement connection pooling to avoid resource saturation from ephemeral microservice connections. Divert intensive analytics and search indexing queries to read replicas, avoiding overprovisioning the primary write cluster.",
      impactLevel: "high"
    },
    {
      id: "storage_archival",
      name: "Storage (Lifecycle Policies & Cold Storage)",
      category: "storage",
      unoptimizedCost: 18000,
      optimizedCost: 3200,
      strategy: "Object lifecycle transitions to Archive Cold Storage",
      details: "Define strict lifecycle guidelines. Move transaction logs and telemetry metrics from Standard tier to Nearline after 14 days, Coldline after 30 days, and Archive/Glacier Deep Archive ($0.00099/GB/month) after 90 days with deterministic compliance purges.",
      impactLevel: "high"
    },
    {
      id: "bandwidth_cdn",
      name: "Egress Bandwidth & CDN Usage",
      category: "network",
      unoptimizedCost: 16500,
      optimizedCost: 2100,
      strategy: "Edge static asset caching & Cloudflare Tiered Caching",
      details: "Keep egress fees to an absolute minimum by utilizing Cloudflare's free peering connections with Google Cloud (Bandwidth Alliance). Leverage aggressive 1-year Cache-Control headers on static builds paired with cache-eviction hooks.",
      impactLevel: "critical"
    },
    {
      id: "payload_compression",
      name: "Asset Compression & Image Formats",
      category: "network",
      unoptimizedCost: 8500,
      optimizedCost: 1850,
      strategy: "Brotli level-11 payload compression & Next-Gen AVIF formats",
      details: "Compress all JSON API replies with Brotli rather than legacy Gzip, yielding an extra 20-30% transit byte reduction. Auto-convert legacy JPEG/PNG uploads to ultra-compressed AVIF formats on the fly using Cloud Run serverless media engines.",
      impactLevel: "medium"
    },
    {
      id: "ml_quantization",
      name: "ML Inference (Quantization & Cache Hits)",
      category: "ml",
      unoptimizedCost: 15000,
      optimizedCost: 4800,
      strategy: "FP16 to INT8 quantization & Semantic Embeddings Caching",
      details: "Quantize LLM weights to INT8 or FP8 precision, slashing expensive VRAM memory footprints by 50% without meaningful loss in accuracy. Establish Redis semantic cache layer to capture and instantly replay 30-45% of duplicate prompts.",
      impactLevel: "high"
    },
    {
      id: "api_abuse",
      name: "API Management (Request Collapsing & Batching)",
      category: "api",
      unoptimizedCost: 9500,
      optimizedCost: 3400,
      strategy: "Single-flight requests & queue message aggregation",
      details: "Utilize single-flight cache wrappers (e.g., Go singleflight or client-side batching) to collapse identical simultaneous backend API calls into a single execution, preventing thunderous herd scenarios on downstream core microservices.",
      impactLevel: "medium"
    }
  ], []);

  // Compute Live Calculated Cost Stream based on user variables
  const currentMonthlyCalculations = useMemo(() => {
    const scaleFactor = computeScale / 100;

    // 1. Compute Cost calculation
    // Base unopt is $45k. With spot instances we can reduce cost up to 70% of the active workload
    const spotDiscount = (spotRatio / 100) * 0.72; // max 72% off on compute spot
    const computeBase = 45000 * scaleFactor;
    const computeCost = computeBase * (1 - spotDiscount);

    // 2. Database Cost calculation
    // Base is $28k. Pooling and Read Replicas saves up to 48%
    const dbBase = 28000;
    const dbCost = dbPoolingEnabled ? dbBase * 0.52 : dbBase;

    // 3. Storage Cost calculation
    // Base is $18k. Moving to cold storage saves up to 82% of transitioned storage
    const storageTransFactor = coldStoragePercent / 100;
    const storageBase = 18000;
    const storageCost = (storageBase * (1 - storageTransFactor)) + (storageBase * storageTransFactor * 0.18);

    // 4. Bandwidth and CDN Cost calculation
    // Base is $16.5k. CDN caching hit ratio reduces egress fees proportionally (up to 85% off)
    const bandwidthBase = 16500;
    const cacheHitFactor = cdnCachingRatio / 100;
    const bandwidthCost = bandwidthBase * (1 - (cacheHitFactor * 0.85));

    // 5. Compression and Image Optimization
    // Base is $8.5k. Brotli saves 25%. Image optimization saves an extra 45%
    let compressionCost = 8500;
    if (brotliEnabled) compressionCost *= 0.75;
    if (imageOptimizationEnabled) compressionCost *= 0.55;

    // 6. ML Inference Cost calculation
    // Base is $15k. FP16->INT8 Quantization saves 68%
    let mlCost = 15000;
    if (mlQuantizationEnabled) mlCost *= 0.32;

    // 7. API costs
    // Base is $9.5k. Collapsing saves 64%
    let apiCost = 9500;
    if (apiCollapsingEnabled) apiCost *= 0.36;

    const totalUnoptimized = (45000 * scaleFactor) + 28000 + 18000 + 16500 + 8500 + 15000 + 9500;
    const totalOptimized = computeCost + dbCost + storageCost + bandwidthCost + compressionCost + mlCost + apiCost;
    const savings = totalUnoptimized - totalOptimized;
    const percentageSaved = totalUnoptimized > 0 ? (savings / totalUnoptimized) * 100 : 0;

    return {
      unoptimized: totalUnoptimized,
      optimized: totalOptimized,
      savings,
      percentageSaved,
      breakdown: {
        compute: computeCost,
        database: dbCost,
        storage: storageCost,
        network: bandwidthCost,
        compression: compressionCost,
        ml: mlCost,
        api: apiCost
      }
    };
  }, [
    computeScale,
    spotRatio,
    coldStoragePercent,
    brotliEnabled,
    imageOptimizationEnabled,
    apiCollapsingEnabled,
    mlQuantizationEnabled,
    dbPoolingEnabled,
    cdnCachingRatio
  ]);

  return (
    <div className="space-y-6" id="cloud-cost-optimization-explorer">
      
      {/* 1. Header with dynamic cost summary card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-40 bg-emerald-500/5 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-40 bg-indigo-500/5 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest font-black text-emerald-400">
                Cost Control Guard: ON
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-100 mt-1 tracking-tight flex items-center gap-2">
              <CircleDollarSign className="w-5.5 h-5.5 text-emerald-400" />
              <span>Enterprise Cloud Cost Optimization Strategy Hub</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed font-medium">
              Maximize efficiency without sacrificing performance. Tinker with spot ratio parameters, storage lifecycles, and edge-cache tuning to optimize database connections, payload compression, and ML inferences.
            </p>
          </div>

          {/* Core Monthly runrate meter */}
          <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl flex items-center gap-5 justify-between">
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">Projected Monthly Spend</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-rose-400/80 line-through font-mono">
                  ${Math.floor(currentMonthlyCalculations.unoptimized).toLocaleString()}
                </span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  ${Math.floor(currentMonthlyCalculations.optimized).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="h-10 w-[1px] bg-slate-850" />

            <div className="text-right">
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">Total Estimated Savings</span>
              <strong className="text-lg font-black text-indigo-400 font-mono block">
                ${Math.floor(currentMonthlyCalculations.savings).toLocaleString()}
              </strong>
              <span className="text-[10px] font-bold text-emerald-450 bg-emerald-950/30 border border-emerald-900/20 px-1.5 py-0.2 rounded font-mono">
                -{currentMonthlyCalculations.percentageSaved.toFixed(1)}% Cost Reduction
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-t border-slate-800/40 mt-4 pt-4 justify-between items-center flex-wrap gap-2">
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("optimization_simulator")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "optimization_simulator"
                  ? "bg-slate-900 border border-slate-800 text-emerald-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Cost Savings Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab("compute_spot")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "compute_spot"
                  ? "bg-slate-900 border border-slate-800 text-sky-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>Compute & Spot Tuning</span>
            </button>

            <button
              onClick={() => setActiveTab("storage_network")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "storage_network"
                  ? "bg-slate-900 border border-slate-800 text-indigo-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span>Storage & CDN Archival</span>
            </button>

            <button
              onClick={() => setActiveTab("db_queue")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "db_queue"
                  ? "bg-slate-900 border border-slate-800 text-amber-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database className="w-4 h-4 text-amber-400" />
              <span>DB Connection Pooling</span>
            </button>

            <button
              onClick={() => setActiveTab("ml_api_costs")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "ml_api_costs"
                  ? "bg-slate-900 border border-slate-800 text-teal-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>ML Quantize & APIs</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-950/40 px-3 py-1.5 border border-slate-800/40 rounded-lg">
            <span>Enterprise SLA Standard:</span>
            <strong className="text-emerald-400">99.99% Core Uptime Maintained</strong>
          </div>
        </div>
      </div>

      {/* 2. Sub-module Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main interactive area */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* A. Dynamic Interactive Cost Savings Simulator */}
          {activeTab === "optimization_simulator" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  <span>Interactive Real-time Cloud Bill Tuner</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manipulate real-time infrastructure parameters below to instantly view how scaling choices, edge caching, and data compression policies affect monthly cloud spending ratios.
                </p>
              </div>

              {/* Slider Panel Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Sliders Block Left */}
                <div className="space-y-4 bg-slate-950/30 border border-slate-850 p-4 rounded-xl">
                  <strong className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-2">
                    Compute & Database Scaling parameters
                  </strong>

                  {/* Compute Scale */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-bold">Total Workload Traffic</span>
                      <span className="font-mono font-bold text-sky-400">{computeScale}% Load</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={computeScale}
                      onChange={(e) => setComputeScale(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <span className="text-[9px] text-slate-500 block leading-normal">
                      Simulates aggregate query loads hitting microservice containers globally.
                    </span>
                  </div>

                  {/* Spot Instance utilization Ratio */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-bold">Spot Instance VM Ratio</span>
                      <span className="font-mono font-bold text-emerald-400">{spotRatio}% VMs</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={spotRatio}
                      onChange={(e) => setSpotRatio(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <span className="text-[9px] text-slate-500 block leading-normal">
                      Replaces dedicated VM nodes with cheap Spot/Preemptible VMs for state-free workers.
                    </span>
                  </div>

                  {/* CDN Caching efficiency */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-bold">CDN Edge Cache Hit Ratio</span>
                      <span className="font-mono font-bold text-indigo-400">{cdnCachingRatio}% Hit</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="98"
                      value={cdnCachingRatio}
                      onChange={(e) => setCdnCachingRatio(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-[9px] text-slate-500 block leading-normal">
                      Offloads dynamic network requests onto global cloud-edge point of presence caches.
                    </span>
                  </div>
                </div>

                {/* Sliders Block Right */}
                <div className="space-y-4 bg-slate-950/30 border border-slate-850 p-4 rounded-xl">
                  <strong className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-2">
                    Storage & Optimization Switches
                  </strong>

                  {/* Cold Storage Percent */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-bold">Cold Storage Lifecycle Shift</span>
                      <span className="font-mono font-bold text-amber-400">{coldStoragePercent}% Archived</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={coldStoragePercent}
                      onChange={(e) => setColdStoragePercent(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <span className="text-[9px] text-slate-500 block leading-normal">
                      Percentage of historic telemetry databases automatically transitioned into archive classes.
                    </span>
                  </div>

                  {/* Binary Switches for Compression, ML, APIs */}
                  <div className="space-y-2 pt-2 border-t border-slate-850/60 mt-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Middleware Patches</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* Brotli Compression */}
                      <button
                        onClick={() => setBrotliEnabled(!brotliEnabled)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                          brotliEnabled 
                            ? "bg-slate-900 border-indigo-500/30 text-indigo-400" 
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span className="font-bold">Brotli compression</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${brotliEnabled ? "bg-indigo-400" : "bg-slate-700"}`} />
                      </button>

                      {/* Image Formats */}
                      <button
                        onClick={() => setImageOptimizationEnabled(!imageOptimizationEnabled)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                          imageOptimizationEnabled 
                            ? "bg-slate-900 border-indigo-500/30 text-indigo-400" 
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span className="font-bold">AVIF image compression</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${imageOptimizationEnabled ? "bg-indigo-400" : "bg-slate-700"}`} />
                      </button>

                      {/* API Request collapsing */}
                      <button
                        onClick={() => setApiCollapsingEnabled(!apiCollapsingEnabled)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                          apiCollapsingEnabled 
                            ? "bg-slate-900 border-amber-550/30 text-amber-400" 
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span className="font-bold">API request collapse</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${apiCollapsingEnabled ? "bg-amber-400" : "bg-slate-700"}`} />
                      </button>

                      {/* ML model precision */}
                      <button
                        onClick={() => setMlQuantizationEnabled(!mlQuantizationEnabled)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                          mlQuantizationEnabled 
                            ? "bg-slate-900 border-emerald-500/30 text-emerald-400" 
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span className="font-bold">ML INT8 weights</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${mlQuantizationEnabled ? "bg-emerald-400" : "bg-slate-700"}`} />
                      </button>

                      {/* PG connection pooling */}
                      <button
                        onClick={() => setDbPoolingEnabled(!dbPoolingEnabled)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                          dbPoolingEnabled 
                            ? "bg-slate-900 border-emerald-500/30 text-emerald-400" 
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span className="font-bold">Connection pooling</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${dbPoolingEnabled ? "bg-emerald-400" : "bg-slate-700"}`} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Graphical Spend Breakdown */}
              <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-xl space-y-4">
                <span className="text-[11px] font-mono text-indigo-400 uppercase font-bold block border-b border-slate-850 pb-2">
                  Optimized Monthly Budget Allocation Breakdown
                </span>

                <div className="space-y-3 font-semibold text-xs text-slate-350">
                  {Object.entries(currentMonthlyCalculations.breakdown).map(([key, cost]) => {
                    const costNum = cost as number;
                    let barColor = "bg-sky-500";
                    let label = "Compute Workers";
                    if (key === "database") { barColor = "bg-amber-500"; label = "Database Cluster Servers"; }
                    if (key === "storage") { barColor = "bg-yellow-400"; label = "Compliance storage & backups"; }
                    if (key === "network") { barColor = "bg-indigo-500"; label = "Egress Network & CDN Nodes"; }
                    if (key === "compression") { barColor = "bg-emerald-500"; label = "Payload Transmission byte space"; }
                    if (key === "ml") { barColor = "bg-teal-500"; label = "ML Prompt Inference GPUs"; }
                    if (key === "api") { barColor = "bg-rose-500"; label = "External Third-party API proxies"; }

                    const percentage = currentMonthlyCalculations.optimized > 0 
                      ? (costNum / currentMonthlyCalculations.optimized) * 100 
                      : 0;

                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span>{label}</span>
                          <span className="font-mono text-slate-300 font-bold">
                            ${Math.floor(costNum).toLocaleString()} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850/40">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* B. Compute Spot instances & autoscaling specs */}
          {activeTab === "compute_spot" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-sky-400" />
                  <span>Compute: Spot VMs, HPA Tuning & Serverless Scale-to-Zero</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Compute expenses often occupy 40% of standard startup cloud expenditures. Our enterprise strategy isolates stateful primary processes from stateless worker tasks to maximize Spot VM utilization.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Autoscaler tuning card */}
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-sky-400 font-mono uppercase block border-b border-slate-850 pb-1.5">
                    Horizontal Pod Autoscaler (HPA) Tuning
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    Standard Kubernetes nodes spin up aggressively but delay scale-downs. We calibrate cooling windows and target metric thresholds to prevent compute resources from staying idle during off-peak hours.
                  </p>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-850">
                    <pre className="text-[10px] text-sky-450 font-mono">
                      {`targetCPUUtilizationPercentage: 75\nbehavior:\n  scaleDown:\n    stabilizationWindowSeconds: 120\n    policies:\n      - type: Percent\n        value: 10\n        periodSeconds: 60`}
                    </pre>
                  </div>
                </div>

                {/* Spot lifecycle controller */}
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-emerald-400 font-mono uppercase block border-b border-slate-850 pb-1.5">
                    Spot VM Intercept Handlers
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    Spot VMs offer up to 80% discount but can be preempted with a 30-second notification. Our container orchestration captures termination signals, instantly drains sockets, and shifts remaining transactions gracefully.
                  </p>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-850 text-[10.5px] font-mono text-slate-400 leading-relaxed">
                    <div className="flex justify-between border-b border-slate-850 pb-1">
                      <span>Stateless Workers</span>
                      <span className="text-emerald-400 font-bold">100% Spot Configured</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span>API Endpoints</span>
                      <span className="text-slate-300">Hybrid (30% On-Demand, 70% Spot)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* C. Storage network & CDN usage */}
          {activeTab === "storage_network" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-indigo-400" />
                  <span>Storage: Lifecycle Archives, Compression & Next-Gen AVIF Images</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Avoid paying Standard Hot Storage rates for cold access metrics or old transaction data. Our automation translates compliance assets and compresses network payloads dynamically.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Cold storage transitions */}
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 font-mono uppercase border-b border-slate-850 pb-1.5">
                    <FolderArchive className="w-4 h-4" /> Storage Classes
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal font-semibold">
                    GCS objects transition from Hot ($20/TB) to Nearline after 14 days, Coldline after 30, and Glacier Archive ($0.99/TB) after 90 days.
                  </p>
                </div>

                {/* Brotli & GZIP payload reduction */}
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 font-mono uppercase border-b border-slate-850 pb-1.5">
                    <Minimize2 className="w-4 h-4" /> Brotli compress
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal font-semibold">
                    Serving JSON APIs using Brotli compression yields files 25% smaller than standard Gzip, directly lowering egress bandwidth charges.
                  </p>
                </div>

                {/* AVIF next-gen media formats */}
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 font-mono uppercase border-b border-slate-850 pb-1.5">
                    <ImageIcon className="w-4 h-4" /> AVIF Conversion
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal font-semibold">
                    Converting raw passenger profile JPEG uploads to modern AVIF reduces binary payloads by 60% without hurting high-density resolutions.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* D. Database read replica and connection pooling */}
          {activeTab === "db_queue" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-400" />
                  <span>Database & Queue: Connection Multiplexing, Pools & Read Replicas</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Avoid primary database exhaust. Connection-pooling proxies aggregate transient requests, and intelligent replication schemas keep analytical loads off transactional engines.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 font-mono text-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase block border-b border-slate-850 pb-1.5">
                  Database Router Pipeline Schematic
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-900 p-3 rounded border border-slate-800 text-[11px]">
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Client API Nodes</span>
                    <strong>1,200 ephemeral pods</strong>
                  </div>
                  <div className="bg-slate-900 p-3 rounded border border-indigo-500/20 text-[11px] text-indigo-400">
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">PgBouncer Pool Proxy</span>
                    <strong>40 pooled sockets open</strong>
                  </div>
                  <div className="bg-slate-900 p-3 rounded border border-emerald-500/20 text-[11px] text-emerald-400">
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Cloud Spanner Engine</span>
                    <strong>Sustained low CPU bounds</strong>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 leading-relaxed font-semibold">
                  PgBouncer serves as an intermediate multiplexing proxy. Client requests acquire and release db handles in microseconds. This keeps database process thread allocations steady, avoiding expensive memory overprovisioning.
                </div>
              </div>
            </div>
          )}

          {/* E. ML and API Costs */}
          {activeTab === "ml_api_costs" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-400" />
                  <span>ML Inference & API costs: Quantization & Prompt Caching</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Inference hardware is highly expensive. Reduce prompt execution fees by employing INT8 model quantization and caching common intelligence loops on the fly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Quantization Card */}
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-teal-400 font-mono uppercase block border-b border-slate-850 pb-1.5">
                    FP16 to INT8 Quantization
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    Compressing large neural model weights from 16-bit floating point precision down to 8-bit integer formats cuts VRAM storage requirements in half. This permits hosting advanced LLM routers on standard, lower-tier GPU containers.
                  </p>
                </div>

                {/* API Request Collapsing Card */}
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-amber-400 font-mono uppercase block border-b border-slate-850 pb-1.5">
                    Semantic Prompt Caching
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    We process prompts with rapid semantic search engines (e.g., Redis VL) to identify incoming questions matching previously computed context vectors. This satisfies up to 35% of common user queries without calling expensive API loops.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Right Side Info Panel / Live Saving Ledger */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Optimization level indicator */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block border-b border-slate-850 pb-2">
              Optimization Level Meter
            </span>

            <div className="text-center py-3">
              <span className="text-4xl font-black font-mono tracking-tight text-emerald-400">
                {currentMonthlyCalculations.percentageSaved > 60 ? "CLASS A+" : currentMonthlyCalculations.percentageSaved > 40 ? "CLASS B" : "CLASS D"}
              </span>
              <span className="text-xs text-slate-400 block mt-1 uppercase font-bold tracking-wider">
                Cost Integrity Score
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold">Budget Efficiency Ratio</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {currentMonthlyCalculations.percentageSaved.toFixed(1)}% Saving
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${currentMonthlyCalculations.percentageSaved}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Saving Best Practices */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3 pt-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block border-b border-slate-850 pb-2">
              Enterprise Cost Controls
            </span>

            <ul className="space-y-2.5 text-[11px] text-slate-400 leading-normal font-semibold">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Enforce tag policies across all cloud resources to track monthly costs cleanly.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Deploy automated slack alert triggers on unexpected cloud cost spikes.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Run automated weekly scripts to clear orphan block storage volumes.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Ensure database connections use pooling proxies to avoid memory allocation exhaust.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
