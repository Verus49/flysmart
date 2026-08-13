import React, { useState, useMemo } from "react";
import { MICROSERVICES_DOCS, MicroserviceDoc } from "../data/microservicesDocs";
import { 
  Database, 
  Globe2, 
  ArrowRightLeft, 
  Workflow, 
  Search, 
  CheckCircle2, 
  Code, 
  Sparkles, 
  FileText,
  Cpu,
  Shield,
  Zap,
  Activity,
  Sliders,
  AlertTriangle,
  Server
} from "lucide-react";

export default function MicroservicesExplorer() {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(MICROSERVICES_DOCS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "apis" | "events" | "devops" | "resilience">("overview");

  // Filter services based on query
  const filteredServices = useMemo(() => {
    return MICROSERVICES_DOCS.filter(service => {
      const query = searchQuery.toLowerCase();
      return (
        service.name.toLowerCase().includes(query) ||
        service.context.toLowerCase().includes(query) ||
        service.purpose.toLowerCase().includes(query) ||
        service.responsibilities.some(r => r.toLowerCase().includes(query)) ||
        service.dbOwnership.technology.toLowerCase().includes(query) ||
        service.restEndpoints.some(a => a.path.toLowerCase().includes(query))
      );
    });
  }, [searchQuery]);

  const selectedService = useMemo(() => {
    return MICROSERVICES_DOCS.find(s => s.id === selectedServiceId) || MICROSERVICES_DOCS[0];
  }, [selectedServiceId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="microservices-explorer-root">
      {/* Sidebar Microservice List */}
      <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-4 backdrop-blur-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Microservices Grid Catalog</h3>
          <p className="text-xs text-slate-500 mt-1">
            Browse and query the architectural specifications of the platform's 15 primary services.
          </p>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search services, db technologies, endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-[10px] text-slate-500 hover:text-slate-300 font-mono"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* List of Microservices */}
        <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredServices.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No microservices match your query.
            </div>
          ) : (
            filteredServices.map((service) => {
              const isSelected = service.id === selectedService.id;
              return (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedServiceId(service.id);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-sky-950/30 border-sky-500/30 text-sky-400 shadow-lg shadow-sky-950/20"
                      : "bg-slate-950/30 border-slate-800/60 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-xs tracking-wide truncate pr-2">
                      {service.name}
                    </span>
                    <span className="text-[8px] font-mono uppercase bg-slate-950 border border-slate-800/80 px-1 rounded text-slate-500 shrink-0">
                      {service.id.split('-')[0]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[9px] text-slate-500 font-mono">
                    <span className="truncate">{service.context}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-[10px] text-slate-500 leading-relaxed flex gap-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
          <span>Every microservice owns its data store exclusively. Inter-service data sharing is executed solely via strongly typed gRPC APIs or asynchronous events.</span>
        </div>
      </div>

      {/* Main Details Panel */}
      <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl space-y-6">
        {/* Service Heading */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                {selectedService.context}
              </span>
              <span className="text-[10px] bg-slate-950 text-slate-500 border border-slate-800 px-2 py-0.5 rounded-full font-mono font-bold">
                K8s POD: {selectedService.id}-*
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-100 tracking-tight mt-2 flex items-center gap-2">
              <Server className="w-6 h-6 text-sky-500" />
              {selectedService.name}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              {selectedService.purpose}
            </p>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-950 rounded-xl max-w-max border border-slate-800/40">
          <button
            onClick={() => setActiveSubTab("overview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              activeSubTab === "overview" ? "bg-slate-900 text-sky-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Profile & Data</span>
          </button>

          <button
            onClick={() => setActiveSubTab("apis")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              activeSubTab === "apis" ? "bg-slate-900 text-sky-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>2. Interfaces & APIs</span>
          </button>

          <button
            onClick={() => setActiveSubTab("events")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              activeSubTab === "events" ? "bg-slate-900 text-sky-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>3. Event Mesh</span>
          </button>

          <button
            onClick={() => setActiveSubTab("devops")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              activeSubTab === "devops" ? "bg-slate-900 text-sky-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>4. Scaling & DevOps</span>
          </button>

          <button
            onClick={() => setActiveSubTab("resilience")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              activeSubTab === "resilience" ? "bg-slate-900 text-sky-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>5. Resilience & Rate Limits</span>
          </button>
        </div>

        {/* Tab content rendering */}
        <div className="space-y-4">
          {activeSubTab === "overview" && (
            <div className="space-y-5 animate-fadeIn">
              {/* Responsibilities */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Core Responsibilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedService.responsibilities.map((resp, idx) => (
                    <div key={idx} className="bg-slate-950/40 border border-slate-800/80 p-3.5 rounded-xl flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-300 leading-relaxed">{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DB Ownership */}
              <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sky-400">
                  <Database className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Exclusive Database Ownership</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-mono font-bold text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {selectedService.dbOwnership.technology}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{selectedService.dbOwnership.description}</p>
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Encapsulated Schemas / Tables:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedService.dbOwnership.tables.map((table) => (
                        <span key={table} className="text-[10px] font-mono bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded text-sky-500">
                          {table}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cache Strategy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Caching Parameters
                  </h4>
                  <div className="text-xs space-y-1">
                    <div><span className="text-slate-500 font-mono">Store:</span> <span className="text-slate-300 font-semibold">{selectedService.caching.technology}</span></div>
                    <div><span className="text-slate-500 font-mono">Strategy:</span> <span className="text-slate-300">{selectedService.caching.strategy}</span></div>
                    <div><span className="text-slate-500 font-mono">Default TTL:</span> <span className="text-sky-400 font-mono font-semibold">{selectedService.caching.ttl}</span></div>
                  </div>
                </div>

                {/* Security Framework */}
                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-sky-500" />
                    Security Framework
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {selectedService.security.map((sec, idx) => (
                      <li key={idx}>{sec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "apis" && (
            <div className="space-y-5 animate-fadeIn">
              {/* REST Endpoints */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">REST (OpenAPI v3 Contract)</h3>
                <div className="space-y-3">
                  {selectedService.restEndpoints.map((endpoint, idx) => (
                    <div key={idx} className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 bg-slate-950 p-2 px-3 border-b border-slate-800 justify-between flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            endpoint.method === 'POST' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/30' :
                            endpoint.method === 'GET' ? 'bg-sky-950 text-sky-400 border border-sky-800/30' :
                            endpoint.method === 'PUT' ? 'bg-amber-950 text-amber-400 border border-amber-800/30' :
                            'bg-rose-950 text-rose-400 border border-rose-800/30'
                          }`}>
                            {endpoint.method}
                          </span>
                          <span className="text-xs font-mono text-slate-200 font-semibold">{endpoint.path}</span>
                        </div>
                        <span className="text-xs text-slate-400 italic">{endpoint.description}</span>
                      </div>
                      <div className="p-3 bg-slate-950/20 grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[10px]">
                        {endpoint.payload && (
                          <div className="space-y-1">
                            <span className="text-slate-500 block">HTTP REQUEST BODY:</span>
                            <pre className="bg-slate-950 p-2 rounded border border-slate-900 overflow-x-auto text-amber-400">{endpoint.payload}</pre>
                          </div>
                        )}
                        <div className={endpoint.payload ? "space-y-1" : "space-y-1 col-span-2"}>
                          <span className="text-slate-500 block">HTTP RESPONSE BODY (200 OK):</span>
                          <pre className="bg-slate-950 p-2 rounded border border-slate-900 overflow-x-auto text-emerald-400">{endpoint.response}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GraphQL Schema & gRPC */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-pink-500" />
                    GraphQL Schema Snippet
                  </h4>
                  <pre className="bg-slate-950 p-3 rounded border border-slate-900 font-mono text-[10px] text-pink-400 overflow-x-auto max-h-[160px] scrollbar-thin">
                    {selectedService.graphqlSchema}
                  </pre>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Workflow className="w-3.5 h-3.5 text-teal-400" />
                    Internal gRPC (Protobuf v3)
                  </h4>
                  <div className="space-y-2 font-mono text-[10px] text-teal-300">
                    <div className="text-[9px] text-slate-500">SERVICE CONTRACT:</div>
                    <div className="bg-slate-950 p-3 rounded border border-slate-900 space-y-1">
                      {selectedService.grpcInterfaces.map((item, idx) => (
                        <div key={idx}>{item}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "events" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Published Events */}
                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ArrowRightLeft className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Events Published to Kafka</h4>
                  </div>
                  {selectedService.eventsPublished.length === 0 ? (
                    <div className="text-xs text-slate-500 italic">No events published directly.</div>
                  ) : (
                    <div className="space-y-2">
                      {selectedService.eventsPublished.map((event) => (
                        <div key={event} className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                          <span className="text-xs font-mono text-emerald-400 truncate">{event}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Consumed Events */}
                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sky-400">
                    <ArrowRightLeft className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Events Consumed from Kafka</h4>
                  </div>
                  {selectedService.eventsConsumed.length === 0 ? (
                    <div className="text-xs text-slate-500 italic">No asynchronous events consumed.</div>
                  ) : (
                    <div className="space-y-2">
                      {selectedService.eventsConsumed.map((event) => (
                        <div key={event} className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"></span>
                          <span className="text-xs font-mono text-sky-400 truncate">{event}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Event Broker Schema */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Kafka Event Mesh Topology:</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  FlySmart operates Confluent Cloud Apache Kafka clusters as its asynchronous communication fabric. Topics utilize Avro schemas managed via Schema Registry. Partitioning keys are pinned (typically by <code className="text-sky-500 font-mono">user_id</code> or <code className="text-sky-500 font-mono">booking_id</code>) to preserve exact sequence orderings across message partitions.
                </p>
              </div>
            </div>
          )}

          {activeSubTab === "devops" && (
            <div className="space-y-5 animate-fadeIn">
              {/* Scaling & Deployment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-sky-500" />
                    Scaling Strategy
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedService.scalingStrategy}</p>
                </div>

                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    Deployment Strategy
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedService.deploymentStrategy}</p>
                </div>
              </div>

              {/* Health Checks & Monitoring */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kubernetes Pod Health Probes</h4>
                  <div className="text-xs space-y-2 font-mono">
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500">Liveness probe:</span>
                      <span className="text-emerald-400">{selectedService.healthChecks.livenessPath}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500">Readiness probe:</span>
                      <span className="text-emerald-400">{selectedService.healthChecks.readinessPath}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Startup timeout:</span>
                      <span className="text-amber-400">{selectedService.healthChecks.startupTimeout}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prometheus & Grafana SLO Metrics</h4>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {selectedService.monitoring.map((metric, idx) => (
                      <li key={idx} className="truncate">{metric}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "resilience" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Rate Limiting */}
                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    Rate Limiting
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedService.rateLimiting}</p>
                </div>

                {/* Failure Handling */}
                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Failure Handling
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedService.failureHandling}</p>
                </div>

                {/* Retry Strategy */}
                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Workflow className="w-3.5 h-3.5" />
                    Retry Strategy
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedService.retryStrategy}</p>
                </div>
              </div>

              {/* Envoy API mesh summary */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Istio Mesh Resiliency Policies:</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Inter-service communication is wrapped inside Istio sidecar proxies, implementing automated circuit-breaking configurations (consecutive gateway failures set to 5, sleep window set to 30 seconds) to prevent cascading microservice starvation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
