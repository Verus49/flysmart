import React, { useState, useMemo } from "react";
import { DDD_CONTEXTS, BoundedContext } from "../data/dddDocs";
import { 
  Database, 
  Globe2, 
  ArrowRightLeft, 
  Compass, 
  Workflow, 
  GitFork, 
  Search, 
  CheckCircle2, 
  Tag,
  Code,
  Sparkles,
  RefreshCw,
  HelpCircle,
  FileText
} from "lucide-react";

export default function DddExplorer() {
  const [selectedContextId, setSelectedContextId] = useState<string>(DDD_CONTEXTS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "database" | "api" | "events" | "dependencies">("overview");

  // Filter contexts based on query
  const filteredContexts = useMemo(() => {
    return DDD_CONTEXTS.filter(context => {
      const query = searchQuery.toLowerCase();
      return (
        context.title.toLowerCase().includes(query) ||
        context.purpose.toLowerCase().includes(query) ||
        context.responsibilities.some(r => r.toLowerCase().includes(query)) ||
        context.tables.some(t => t.name.toLowerCase().includes(query)) ||
        context.apis.some(a => a.path.toLowerCase().includes(query))
      );
    });
  }, [searchQuery]);

  const selectedContext = useMemo(() => {
    return DDD_CONTEXTS.find(c => c.id === selectedContextId) || DDD_CONTEXTS[0];
  }, [selectedContextId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="ddd-explorer-root">
      {/* Sidebar Domain List */}
      <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-4 backdrop-blur-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Bounded Contexts Catalog</h3>
          <p className="text-xs text-slate-500 mt-1">
            Explore 15 isolated DDD domains defining FlySmart's core architectural layout.
          </p>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search domains, tables, APIs..."
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

        {/* List of Contexts */}
        <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredContexts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No bounded contexts match your query.
            </div>
          ) : (
            filteredContexts.map((context) => {
              const isSelected = context.id === selectedContext.id;
              return (
                <button
                  key={context.id}
                  onClick={() => {
                    setSelectedContextId(context.id);
                    // Retain sub-tab view or reset to overview if needed
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1 ${
                    isSelected
                      ? "bg-sky-950/30 border-sky-500/30 text-sky-400 shadow-lg shadow-sky-950/20"
                      : "bg-slate-950/30 border-slate-800/60 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-xs tracking-wide">
                      {context.title.replace(" Context", "")}
                    </span>
                    <span className="text-[9px] font-mono uppercase bg-slate-950 border border-slate-800/80 px-1.5 py-0.5 rounded text-slate-500">
                      {context.id}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                    {context.purpose}
                  </p>
                </button>
              );
            })
          )}
        </div>

        <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-[10px] text-slate-500 leading-relaxed flex gap-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5 animate-pulse" />
          <span>Every bounded context adheres strictly to Shared-Nothing architectures, asserting complete autonomy over its underlying database.</span>
        </div>
      </div>

      {/* Main Details Panel */}
      <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl space-y-6">
        {/* Context Heading */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                Bounded Context
              </span>
              <span className="text-[10px] bg-slate-950 text-slate-500 border border-slate-800 px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                DDD Blueprint v1.0
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-100 tracking-tight mt-1.5">
              {selectedContext.title}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mt-2 max-w-2xl">
              {selectedContext.purpose}
            </p>
          </div>
        </div>

        {/* Sub-Tabs for Details */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-950 rounded-xl max-w-max border border-slate-800/40">
          <button
            onClick={() => setActiveSubTab("overview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              activeSubTab === "overview"
                ? "bg-slate-900 text-sky-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Overview & Responsibilities</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab("database")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              activeSubTab === "database"
                ? "bg-slate-900 text-sky-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Schema ({selectedContext.tables.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("api")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              activeSubTab === "api"
                ? "bg-slate-900 text-sky-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>APIs ({selectedContext.apis.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("events")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              activeSubTab === "events"
                ? "bg-slate-900 text-sky-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Events ({selectedContext.eventsEmitted.length + selectedContext.eventsConsumed.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("dependencies")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              activeSubTab === "dependencies"
                ? "bg-slate-900 text-sky-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>System Integration</span>
          </button>
        </div>

        {/* Sub-Tab Contents */}
        <div className="mt-4 border-t border-slate-800/40 pt-5 min-h-[300px]">
          {/* OVERVIEW SUB-TAB */}
          {activeSubTab === "overview" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase">
                  Primary Domain Responsibilities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedContext.responsibilities.map((resp, i) => (
                    <div 
                      key={i}
                      className="bg-slate-950/30 border border-slate-800/80 p-4 rounded-xl flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300 leading-relaxed">{resp}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-200 mb-2">Microservices Implementation Note</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This bounded context maps directly to a GKE namespace container squad, sharing a deployment pipeline but keeping individual database clusters separate to avoid cross-domain schema dependencies.
                </p>
              </div>
            </div>
          )}

          {/* DATABASE SUB-TAB */}
          {activeSubTab === "database" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase mb-2">
                  Owned DB Tables & Logical Schemas
                </h4>
                <p className="text-xs text-slate-500">
                  These relational structures are exclusively modifiable by {selectedContext.title}. Cross-domain access must navigate API layers.
                </p>
              </div>

              <div className="space-y-6">
                {selectedContext.tables.map((table, idx) => (
                  <div key={idx} className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="bg-slate-900/60 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-sky-400" />
                        <span className="font-mono font-bold text-xs text-slate-200">{table.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80">
                        PostgreSQL Shard
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-xs text-slate-400">{table.description}</p>
                      
                      {/* Grid listing schema columns */}
                      <div className="border-t border-slate-800/60 pt-3">
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                          Column Layout & Integrity Constraints
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {table.columns.map((col, colIdx) => {
                            const isPK = col.includes("PRIMARY KEY");
                            const isFK = col.includes("FOREIGN KEY");
                            return (
                              <div 
                                key={colIdx} 
                                className={`font-mono text-[11px] p-2 rounded flex items-center justify-between ${
                                  isPK 
                                    ? "bg-emerald-950/10 border border-emerald-500/20 text-emerald-400" 
                                    : isFK 
                                    ? "bg-purple-950/10 border border-purple-500/20 text-purple-400"
                                    : "bg-slate-950/50 border border-slate-900 text-slate-300"
                                }`}
                              >
                                <span>{col}</span>
                                {isPK && <span className="text-[9px] font-sans font-bold uppercase bg-emerald-950 px-1 py-0.5 rounded border border-emerald-500/30 text-emerald-500">PK</span>}
                                {isFK && <span className="text-[9px] font-sans font-bold uppercase bg-purple-950 px-1 py-0.5 rounded border border-purple-500/30 text-purple-500">FK</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API CONTRACTS SUB-TAB */}
          {activeSubTab === "api" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase mb-2">
                  Exposed API Contracts
                </h4>
                <p className="text-xs text-slate-500">
                  Public and internal endpoints adhering strictly to OpenAPI 3.1 definitions. Backed by BFF orchestration routing.
                </p>
              </div>

              <div className="space-y-5">
                {selectedContext.apis.map((api, idx) => {
                  let badgeColor = "bg-sky-950 text-sky-400 border-sky-500/30";
                  if (api.method === "POST") badgeColor = "bg-emerald-950 text-emerald-400 border-emerald-500/30";
                  if (api.method === "PUT") badgeColor = "bg-amber-950 text-amber-400 border-amber-500/30";
                  if (api.method === "DELETE") badgeColor = "bg-rose-950 text-rose-400 border-rose-500/30";

                  return (
                    <div key={idx} className="bg-slate-950/30 border border-slate-800/80 rounded-xl overflow-hidden">
                      <div className="bg-slate-900/40 px-4 py-3 flex flex-wrap items-center gap-3 border-b border-slate-800">
                        <span className={`font-mono font-extrabold text-xs px-2 py-0.5 rounded border ${badgeColor}`}>
                          {api.method}
                        </span>
                        <span className="font-mono text-xs text-slate-200 select-all font-semibold">
                          {api.path}
                        </span>
                        <span className="ml-auto text-[10px] text-slate-500">
                          JSON Payload
                        </span>
                      </div>
                      
                      <div className="p-4 space-y-3.5">
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {api.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          {api.payload && (
                            <div className="space-y-1">
                              <div className="text-[10px] font-mono text-slate-500 uppercase">Request Sample:</div>
                              <pre className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg font-mono text-[10px] text-sky-300 overflow-x-auto">
                                {api.payload}
                              </pre>
                            </div>
                          )}
                          {api.response && (
                            <div className="space-y-1">
                              <div className="text-[10px] font-mono text-slate-500 uppercase">Response 200 OK:</div>
                              <pre className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg font-mono text-[10px] text-emerald-400 overflow-x-auto">
                                {api.response}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EVENTS SUB-TAB */}
          {activeSubTab === "events" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase mb-2">
                  Asynchronous Event Integrations
                </h4>
                <p className="text-xs text-slate-500">
                  Pub/Sub transactions driven by Apache Kafka (Confluent Cloud) for event replaying and loose domain coupling.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Emitted events */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                    <h5 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
                      Events Emitted (Outbox)
                    </h5>
                  </div>
                  {selectedContext.eventsEmitted.length === 0 ? (
                    <div className="text-xs text-slate-600 p-4 border border-dashed border-slate-800 rounded-xl">
                      No events emitted.
                    </div>
                  ) : (
                    selectedContext.eventsEmitted.map((event, idx) => (
                      <div key={idx} className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-sky-400 font-bold select-all">
                            {event.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {event.description}
                        </p>
                        <div className="space-y-1">
                          <div className="text-[9px] font-mono text-slate-600 uppercase">Topic Payload (Avro):</div>
                          <pre className="bg-slate-950 border border-slate-900 p-2 rounded text-[10px] font-mono text-sky-300 overflow-x-auto">
                            {event.payload}
                          </pre>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Consumed events */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <h5 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
                      Events Consumed (Inbox)
                    </h5>
                  </div>
                  {selectedContext.eventsConsumed.length === 0 ? (
                    <div className="text-xs text-slate-600 p-4 border border-dashed border-slate-800 rounded-xl">
                      No events consumed.
                    </div>
                  ) : (
                    selectedContext.eventsConsumed.map((event, idx) => (
                      <div key={idx} className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-purple-400 font-bold">
                            {event.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {event.description}
                        </p>
                        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-900 flex flex-col gap-1">
                          <span className="text-[9px] font-mono text-slate-500 uppercase">Downstream Trigger:</span>
                          <span className="text-xs text-slate-300 leading-relaxed font-semibold">
                            {event.trigger}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SYSTEM INTEGRATION SUB-TAB */}
          {activeSubTab === "dependencies" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase mb-2">
                  System Dependencies & Future Plans
                </h4>
                <p className="text-xs text-slate-500">
                  Domain coupling constraints and the long-term expansion roadmap for {selectedContext.title}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-4">
                  <h5 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
                    <GitFork className="w-4 h-4 text-sky-400" />
                    <span>Domain Dependencies</span>
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedContext.dependencies.map((dep, i) => (
                      <span 
                        key={i} 
                        className="text-xs bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5"
                      >
                        <Tag className="w-3 h-3 text-sky-500" />
                        {dep}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    All cross-domain service boundaries must utilize HTTP mock integrations during integration environments to maintain build autonomy.
                  </p>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-4">
                  <h5 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>Future Extensions Roadmap</span>
                  </h5>
                  <ul className="space-y-2">
                    {selectedContext.futureExtensions.map((ext, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <span className="text-emerald-500 mt-1 shrink-0">•</span>
                        <span>{ext}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
