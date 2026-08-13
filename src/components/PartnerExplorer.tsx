import React, { useState, useEffect, useMemo, useRef } from "react";
import { SUPPLIER_ADAPTERS, RESILIENCE_METRICS, PartnerAdapterDoc } from "../data/partnerDocs";
import { 
  Network, 
  Cpu, 
  Sliders, 
  Terminal, 
  Play, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Zap, 
  Activity, 
  Database, 
  Lock, 
  Gauge, 
  FileText, 
  Layers, 
  Globe, 
  HelpCircle, 
  ArrowRight,
  TrendingDown,
  Percent,
  PlusCircle,
  Code,
  ChevronRight
} from "lucide-react";

interface TelemetryLog {
  timestamp: string;
  type: "info" | "auth" | "circuit" | "quota" | "normalize" | "success" | "error";
  message: string;
  data?: any;
}

export default function PartnerExplorer() {
  const [activeSubTab, setActiveSubTab] = useState<"architecture" | "resilience" | "sandbox">("architecture");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("amadeus");
  const [customProviderName, setCustomProviderName] = useState<string>("");
  const [customProviderType, setCustomProviderType] = useState<string>("NDC REST");
  const [providers, setProviders] = useState<PartnerAdapterDoc[]>(SUPPLIER_ADAPTERS);

  // Sandbox simulation states
  const [simPartnerId, setSimPartnerId] = useState<string>("amadeus");
  const [circuitStatus, setCircuitStatus] = useState<Record<string, "CLOSED" | "HALF-OPEN" | "OPEN">>({
    amadeus: "CLOSED",
    duffel: "CLOSED",
    sabre: "CLOSED",
    travelport: "CLOSED"
  });
  const [tokenBuckets, setTokenBuckets] = useState<Record<string, number>>({
    amadeus: 100,
    duffel: 100,
    sabre: 100,
    travelport: 100
  });
  const [failureThreshold, setFailureThreshold] = useState<number>(30); // 30% default sandbox failure chance
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Selected details
  const selectedPartner = useMemo(() => {
    return providers.find(p => p.id === selectedPartnerId) || providers[0];
  }, [selectedPartnerId, providers]);

  // Log append helper
  const addLog = (message: string, type: TelemetryLog["type"], data?: any) => {
    const now = new Date();
    const ts = now.toISOString().split("T")[1].substring(0, 12);
    setTelemetryLogs(prev => [...prev, { timestamp: ts, type, message, data }]);
  };

  // Add custom provider (demonstrating adding new providers without changing search engine core)
  const handleAddCustomProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customProviderName.trim()) return;

    const id = customProviderName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    
    // Check duplicates
    if (providers.some(p => p.id === id)) {
      alert("An adapter with this identifier already exists.");
      return;
    }

    const newProvider: PartnerAdapterDoc = {
      id,
      name: `${customProviderName} Adapter`,
      type: `${customProviderType} (Auto-Registered)`,
      description: `Hot-loaded modular provider adapter conforming to FlySmart's standard IFlightSupplierAdapter specification. No core files were modified.`,
      dataFormat: "JSON (OpenAPI Schema Spec)",
      latencyAvg: "310ms",
      supportedFeatures: ["Standard Hold", "Dynamic Ancillaries", "Unified Pricing Feed"],
      sampleRequest: `// Registered ${customProviderName} Request\nPOST /v1/flights/search\n{\n  "from": "FRA",\n  "to": "SIN",\n  "date": "2026-09-12"\n}`,
      sampleResponse: `{\n  "results": [{\n    "itinerary_code": "${id}_segment_1",\n    "fare_usd": "630.00",\n    "carrier": "SQ"\n  }]\n}`,
      normalizedResponse: `{\n  "itineraryId": "it_${id}_01",\n  "supplier": "${customProviderName.toUpperCase()}",\n  "totalPriceUsd": 630.00,\n  "segments": [{\n    "carrier": "SQ",\n    "flightNumber": "26",\n    "origin": "FRA",\n    "destination": "SIN",\n    "departureTime": "2026-09-12T21:55:00Z",\n    "arrivalTime": "2026-09-13T16:05:00Z",\n    "durationMinutes": 730\n  }],\n  "ancillariesSupported": true\n}`
    };

    setProviders(prev => [...prev, newProvider]);
    setCircuitStatus(prev => ({ ...prev, [id]: "CLOSED" }));
    setTokenBuckets(prev => ({ ...prev, [id]: 100 }));
    setSelectedPartnerId(id);
    
    // Reset inputs
    setCustomProviderName("");
    
    // Trigger architectural success telemetry log if sandbox has logs
    addLog(`[Framework Registry] Successfully hot-loaded new adapter: ${customProviderName}. Bound to route pattern: travel.supplier.${id}.v1`, "success");
  };

  // Run dynamic search simulation with reliability routing, circuit breakers, quotas, and fallback mapping
  const runSearchSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setTelemetryLogs([]);

    const partner = providers.find(p => p.id === simPartnerId) || providers[0];
    const originalPartnerId = partner.id;

    addLog(`[Search Core] Dispatching query: FRA -> SIN (2026-09-12) to Provider Broker Router...`, "info");
    
    // 1. Quota & Rate-Limit Check
    await new Promise(r => setTimeout(r, 600));
    const currentQuota = tokenBuckets[originalPartnerId] || 100;
    if (currentQuota <= 10) {
      addLog(`[Rate Limiter] Blocked! Supplier ${partner.name} has consumed 90%+ of its rate quota bucket. Bucket tokens remaining: ${currentQuota}`, "quota");
      addLog(`[Router Engine] Active failover initiated to fallback partner...`, "circuit");
      // Fallback
      triggerFallbackSearch(originalPartnerId);
      setIsSimulating(false);
      return;
    }

    // Spend tokens
    setTokenBuckets(prev => ({ ...prev, [originalPartnerId]: Math.max(0, (prev[originalPartnerId] || 100) - 15) }));
    addLog(`[Rate Limiter] Quota verified for ${partner.name}. Rate limit token consumed. Bucket level: ${currentQuota - 15}/100`, "quota");

    // 2. Authentication Check
    await new Promise(r => setTimeout(r, 500));
    addLog(`[Auth Manager] Loading secure api credentials for ${partner.name}. Initiating OAuth validation token verification...`, "auth");
    await new Promise(r => setTimeout(r, 400));
    addLog(`[Auth Manager] Bearer credentials verified. API authentication token loaded successfully.`, "auth");

    // 3. Circuit Breaker Check
    await new Promise(r => setTimeout(r, 500));
    const currentCircuit = circuitStatus[originalPartnerId] || "CLOSED";
    addLog(`[Circuit Breaker] Checking health status of ${partner.name}. Current state: ${currentCircuit}`, "circuit");

    if (currentCircuit === "OPEN") {
      addLog(`[Circuit Breaker] BLOCKED! Health status is OPEN (Supplier is currently blacklisted due to consecutive failure thresholds). Bypassing direct API call entirely.`, "circuit");
      triggerFallbackSearch(originalPartnerId);
      setIsSimulating(false);
      return;
    }

    // 4. API Request Execution
    await new Promise(r => setTimeout(r, 700));
    addLog(`[Outbound Gateway] Dispatched raw request payload to supplier gateway. (Target latency: ${partner.latencyAvg})`, "info");
    
    // Roll random for failure or timeout
    const isError = Math.random() * 100 < failureThreshold;
    await new Promise(r => setTimeout(r, 800));

    if (isError) {
      addLog(`[Outbound Gateway] Connection failed! Target partner ${partner.name} returned 504 Gateway Timeout.`, "error");
      
      // Update Circuit status
      setCircuitStatus(prev => ({ ...prev, [originalPartnerId]: "OPEN" }));
      addLog(`[Circuit Breaker] Threshold tripped! Transferred ${partner.name} circuit from CLOSED to OPEN state. Active timeout blacklist active for 60 seconds.`, "circuit");
      
      // Initiate Fallback
      triggerFallbackSearch(originalPartnerId);
    } else {
      addLog(`[Outbound Gateway] Partner responded in ${partner.latencyAvg}. Response payload retrieved with status 200 OK.`, "success");
      
      // 5. Normalization Layer Conversion
      await new Promise(r => setTimeout(r, 600));
      addLog(`[Normalization Layer] Standardizing supplier output payload to FlySmart internal JSON schema...`, "info");
      await new Promise(r => setTimeout(r, 600));
      
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(partner.normalizedResponse);
      } catch (e) {
        parsedPayload = { error: "Payload schema mapping error." };
      }

      addLog(`[Normalization Layer] Payload converted successfully. Uniform schema ready for cache insertion and client transmission.`, "normalize", parsedPayload);
      addLog(`[Search Core] Aggregator combined 1 unified itinerary successfully.`, "success");
    }

    setIsSimulating(false);
  };

  // Secondary Fallback trigger
  const triggerFallbackSearch = async (failedId: string) => {
    addLog(`[Fallback Manager] Dynamic Failover Routing active. Querying standby supplier in fallback stack...`, "circuit");
    await new Promise(r => setTimeout(r, 800));
    
    // Find next fallback partner
    const standbys = providers.filter(p => p.id !== failedId);
    const standby = standbys[0] || providers[0];
    
    addLog(`[Fallback Manager] Routing search query to redundant supplier: ${standby.name}`, "info");
    await new Promise(r => setTimeout(r, 800));
    addLog(`[Outbound Gateway] Standby ${standby.name} responded 200 OK (Latency: ${standby.latencyAvg}).`, "success");
    
    // Normalize fallback
    await new Promise(r => setTimeout(r, 500));
    addLog(`[Normalization Layer] Normalized standby payload to internal UnifiedItinerary model successfully. Search SLA maintained.`, "normalize", JSON.parse(standby.normalizedResponse));
    addLog(`[Search Core] Aggregations completed via fallback paths with zero customer disruption.`, "success");
  };

  // Reset metrics
  const resetSimulatorMetrics = () => {
    setCircuitStatus({
      amadeus: "CLOSED",
      duffel: "CLOSED",
      sabre: "CLOSED",
      travelport: "CLOSED"
    });
    setTokenBuckets({
      amadeus: 100,
      duffel: 100,
      sabre: 100,
      travelport: 100
    });
    setTelemetryLogs([]);
    addLog("[Telemetry] Resilience metrics reset to baseline defaults.", "info");
  };

  // Auto scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [telemetryLogs]);

  return (
    <div className="space-y-6 animate-fadeIn" id="partner-framework-root">
      
      {/* Upper navigation header box */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase max-w-max">
            Modular Adapter Pattern Design
          </div>
          <h2 className="text-lg font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <Network className="w-5 h-5 text-emerald-400" />
            Partner Integration Framework
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            An open, extensible integration layer that standardizes legacy GDS, SOAP protocols, and modern REST NDC airlines. Add future API adapters seamlessly without modifying the core search code.
          </p>
        </div>

        {/* Action Toggles */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 shrink-0">
          <button
            onClick={() => setActiveSubTab("architecture")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "architecture"
                ? "bg-emerald-950 border border-emerald-850 text-emerald-400 shadow-md shadow-emerald-950/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Adapters & Normalization
          </button>
          <button
            onClick={() => setActiveSubTab("resilience")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "resilience"
                ? "bg-emerald-950 border border-emerald-850 text-emerald-400 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Reliability & Quotas
          </button>
          <button
            onClick={() => setActiveSubTab("sandbox")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "sandbox"
                ? "bg-emerald-950 border border-emerald-850 text-emerald-400 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Integration Sandbox
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE SUBTAB CONTENT */}
      {activeSubTab === "architecture" ? (
        <div className="space-y-6">
          
          {/* Main Dual Layout: Adapter list and details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Adapter directory and dynamic registry creation */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Existing adapters */}
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-5 space-y-3">
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    Registered Adapters
                  </span>
                  <span className="text-[10px] text-slate-500">Count: {providers.length}</span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {providers.map((p) => {
                    const isSelected = p.id === selectedPartnerId;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPartnerId(p.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                          isSelected 
                            ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300 shadow-lg"
                            : "bg-slate-900/10 border-slate-900 text-slate-400 hover:bg-slate-900/30"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold">{p.name}</div>
                          <div className="text-[9px] font-mono text-slate-500 uppercase">{p.type}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic registration form - proving core requires zero code modifications to add adapters */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    Hot-Load New Partner API
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Demonstrate adding a provider without writing any custom search code. Just configure credentials, choose protocol type, and register.
                  </p>
                </div>

                <form onSubmit={handleAddCustomProvider} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 uppercase">Supplier Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Qantas Direct, Sabre v5"
                      value={customProviderName}
                      onChange={(e) => setCustomProviderName(e.target.value)}
                      required
                      className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 uppercase">Adapter Integration Type</label>
                    <select
                      value={customProviderType}
                      onChange={(e) => setCustomProviderType(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-400 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Modern REST/JSON NDC">Modern REST/JSON NDC</option>
                      <option value="Legacy SOAP XML">Legacy SOAP XML</option>
                      <option value="B2B Aggregator Feed">B2B Aggregator Feed</option>
                      <option value="Direct Supplier API">Direct Supplier API</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Auto-Register & Mount Adapter
                  </button>
                </form>
              </div>

            </div>

            {/* Right detailed documentation panel showing RAW requests, responses and normalized internal structures */}
            <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-950 border border-emerald-850 rounded-xl text-emerald-400">
                      <Code className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-100 tracking-tight">{selectedPartner.name}</h3>
                      <p className="text-[10px] font-mono text-emerald-400 mt-0.5 uppercase tracking-wider">{selectedPartner.type}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                    <span className="text-slate-500 text-[10px] block uppercase">Data Format</span>
                    <span className="font-bold text-slate-300">{selectedPartner.dataFormat}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                    <span className="text-slate-500 text-[10px] block uppercase">Benchmark Latency</span>
                    <span className="font-bold text-sky-400">{selectedPartner.latencyAvg}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Provider Description</span>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {selectedPartner.description}
                </p>
              </div>

              {/* Supported endpoints checklist */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Adapter Capabilities & Functions Map</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPartner.supportedFeatures.map((feat, idx) => (
                    <div key={idx} className="bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side by side JSON translation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">Payload Normalization pipeline</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Standardized internal UnifiedItinerary schema</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Raw Supplier JSON/XML */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-500 uppercase">Raw Outbound Supplier Response</span>
                      <span className="text-[9px] bg-amber-950/30 text-amber-400 border border-amber-900/30 px-1.5 py-0.2 rounded font-mono">unparsed</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-3.5 overflow-x-auto font-mono text-[9px] text-slate-400 h-[240px] scrollbar-thin">
                      <pre className="leading-relaxed">{selectedPartner.sampleResponse}</pre>
                    </div>
                  </div>

                  {/* Standardized internal schema */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase">Normalized Uniform Output</span>
                      <span className="text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 px-1.5 py-0.2 rounded font-mono">Normalized</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-3.5 overflow-x-auto font-mono text-[9px] text-emerald-350 h-[240px] scrollbar-thin">
                      <pre className="leading-relaxed">{selectedPartner.normalizedResponse}</pre>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : activeSubTab === "resilience" ? (
        <div className="space-y-6">
          
          {/* Table display of security, rate limits, and fallback structures */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-1.5">
                <Gauge className="w-5 h-5 text-emerald-400" />
                Resiliency Matrix & Quota Settings
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                The framework enforces rigorous rate limiting, OAuth bearer key rotation, and automated fallback pathways to protect search performance SLAs against partner failures.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-900 text-slate-400 font-mono">
                    <th className="px-4 py-3">Control Policy</th>
                    <th className="px-4 py-3 text-emerald-400 font-bold">Amadeus GDS</th>
                    <th className="px-4 py-3 text-sky-400 font-bold">Duffel NDC</th>
                    <th className="px-4 py-3 text-amber-500 font-bold">Sabre GDS</th>
                    <th className="px-4 py-3 text-rose-400 font-bold">Travelport Core</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-350">
                  {RESILIENCE_METRICS.map((metric, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/15">
                      <td className="px-4 py-3.5 font-bold text-slate-200">{metric.metricName}</td>
                      <td className="px-4 py-3.5">{metric.amadeus}</td>
                      <td className="px-4 py-3.5">{metric.duffel}</td>
                      <td className="px-4 py-3.5">{metric.sabre}</td>
                      <td className="px-4 py-3.5">{metric.travelport}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Informational block detailing the Circuit Breaker transition states */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-emerald-400 uppercase font-mono">Closed State (Healthy)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  All requests route to the partner API. Failures are continuously recorded in the sliding execution window tracker.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-rose-400 uppercase font-mono">Open State (Tripped)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Supplier requests are short-circuited and auto-blocked immediately. Queries route automatically to preconfigured Standby redundancy nodes.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-bold text-amber-500 uppercase font-mono">Half-Open (Canary)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  After cold down periods (60s), a limited subset of test traffic is dispatched to test if the partner gateway has fully recovered.
                </p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls column */}
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">Sandbox Simulator Variables</h3>
              <p className="text-[11px] text-slate-500 mt-1">Adjust performance properties to stress-test error handling pipelines.</p>
            </div>

            {/* Select targeted adapter */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold block">Primary Dispatch Supplier</label>
              <select
                value={simPartnerId}
                onChange={(e) => setSimPartnerId(e.target.value)}
                disabled={isSimulating}
                className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-200"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Error probability slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">API Failure Probability</span>
                <span className="text-rose-400 font-bold font-mono">{failureThreshold}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={failureThreshold}
                onChange={(e) => setFailureThreshold(parseInt(e.target.value))}
                disabled={isSimulating}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>0% (Perfect)</span>
                <span>50% (Flaky Gateway)</span>
                <span>100% (Complete Outage)</span>
              </div>
            </div>

            {/* Action triggering */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={runSearchSimulation}
                disabled={isSimulating}
                className="px-4 py-3 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-450 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Routing...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Query API
                  </>
                )}
              </button>

              <button
                onClick={resetSimulatorMetrics}
                disabled={isSimulating}
                className="px-4 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset States
              </button>
            </div>

            {/* Live Circuit status badges inside panel */}
            <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-3">
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wide">Active Circuit Health Status</div>
              
              <div className="space-y-2">
                {providers.slice(0, 4).map((p) => {
                  const status = circuitStatus[p.id] || "CLOSED";
                  let statusColor = "bg-emerald-950 text-emerald-400 border-emerald-900/30";
                  if (status === "OPEN") statusColor = "bg-rose-950 text-rose-450 border-rose-900/30";

                  return (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-400">{p.name}</span>
                      <span className={`font-mono text-[9px] font-bold px-2 py-0.5 border rounded uppercase ${statusColor}`}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sandbox Terminal logs output */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Integration Telemetry Logs
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Observe rate limits, authentication tokens, and real-time normalized output transformations.</p>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 h-[380px] overflow-y-auto flex flex-col justify-between scrollbar-thin">
              <div className="space-y-3">
                {telemetryLogs.length === 0 ? (
                  <div className="h-[320px] flex flex-col items-center justify-center text-slate-650 font-mono text-xs text-center space-y-2">
                    <Terminal className="w-8 h-8 text-slate-700 animate-pulse" />
                    <div>
                      <p className="font-bold">Sandbox API Log Console</p>
                      <p className="text-[10px]">Select a partner supplier, then trigger 'Query API' to stream traces.</p>
                    </div>
                  </div>
                ) : (
                  telemetryLogs.map((log, idx) => {
                    let typeLabel = log.type.toUpperCase();
                    let color = "text-slate-400";
                    if (log.type === "success") color = "text-emerald-400 font-semibold";
                    if (log.type === "error") color = "text-rose-400 font-bold";
                    if (log.type === "auth") color = "text-indigo-400 font-mono";
                    if (log.type === "quota") color = "text-amber-500 font-semibold";
                    if (log.type === "circuit") color = "text-rose-500 font-bold";
                    if (log.type === "normalize") color = "text-sky-400 font-mono";

                    return (
                      <div key={idx} className="font-mono text-[10px] space-y-1.5 border-b border-slate-900/40 pb-2">
                        <div className="flex items-start gap-2 leading-relaxed">
                          <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                          <span className={`${color} shrink-0`}>[{typeLabel}]</span>
                          <span className="text-slate-300">{log.message}</span>
                        </div>
                        {log.data && (
                          <div className="ml-6 bg-slate-900/40 border border-slate-850 p-2.5 rounded-lg text-emerald-400 max-w-full overflow-x-auto text-[9px]">
                            <pre>{JSON.stringify(log.data, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={logEndRef} />
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
