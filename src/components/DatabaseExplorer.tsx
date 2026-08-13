import React, { useState, useMemo } from "react";
import { DATABASE_DOCS, DatabaseEngineDoc, DbTable } from "../data/databaseDocs";
import { 
  Database, 
  Layers, 
  Workflow, 
  CheckCircle2, 
  Code, 
  BookOpen, 
  Server, 
  Zap, 
  Shield, 
  ChevronRight, 
  Clock, 
  RefreshCw, 
  HardDrive,
  Copy,
  Check
} from "lucide-react";

export default function DatabaseExplorer() {
  const [selectedEngineId, setSelectedEngineId] = useState<string>("postgresql");
  const [selectedTableName, setSelectedTableName] = useState<string>("");
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const selectedEngine = useMemo(() => {
    return DATABASE_DOCS.find(e => e.id === selectedEngineId) || DATABASE_DOCS[0];
  }, [selectedEngineId]);

  // Set the default table on engine change
  React.useEffect(() => {
    if (selectedEngine.tables.length > 0) {
      setSelectedTableName(selectedEngine.tables[0].name);
    } else {
      setSelectedTableName("");
    }
  }, [selectedEngineId, selectedEngine]);

  const selectedTable = useMemo(() => {
    return selectedEngine.tables.find(t => t.name === selectedTableName) || selectedEngine.tables[0];
  }, [selectedTableName, selectedEngine]);

  const handleCopyDdl = (ddlText: string) => {
    navigator.clipboard.writeText(ddlText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn" id="database-explorer-root">
      {/* Sidebar - Engine Select and Strengths */}
      <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5 backdrop-blur-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            Polyglot Database Mesh
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            FlySmart leverages the optimal database engine for each microservice boundary, matching workload patterns with database strengths.
          </p>
        </div>

        {/* Database selector */}
        <div className="space-y-1.5">
          {DATABASE_DOCS.map((engine) => {
            const isSelected = engine.id === selectedEngineId;
            return (
              <button
                key={engine.id}
                onClick={() => {
                  setSelectedEngineId(engine.id);
                }}
                className={`w-full text-left p-3.5 rounded-xl transition-all border flex flex-col gap-1 cursor-pointer ${
                  isSelected
                    ? "bg-sky-950/30 border-sky-500/30 text-sky-400 shadow-lg shadow-sky-950/20"
                    : "bg-slate-950/30 border-slate-800/60 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs tracking-wide">
                    {engine.name}
                  </span>
                  <span className="text-[8px] font-mono uppercase bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-slate-500 shrink-0">
                    {engine.id}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  {engine.role}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected engine properties */}
        <div className="border-t border-slate-800/80 pt-4 space-y-3">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Engine Capabilities:</div>
          <div className="space-y-2">
            {selectedEngine.strengths.map((strength, idx) => (
              <div key={idx} className="flex gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                <span>{strength}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 text-[10px] text-slate-500 leading-relaxed flex gap-2">
          <Workflow className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
          <span>Each microservice exclusively encapsulates its database. Transaction state transitions across microservices are handled by Kafka events or gRPC interfaces.</span>
        </div>
      </div>

      {/* Main Panel - Table list, SQL Schema and Policies */}
      <div className="lg:col-span-8 space-y-6">
        {/* Core database info card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4 gap-3">
            <div>
              <div className="text-[10px] bg-sky-950 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase max-w-max">
                {selectedEngine.role}
              </div>
              <h2 className="text-xl font-black text-slate-100 tracking-tight mt-1.5">
                {selectedEngine.name}
              </h2>
            </div>
            <div className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800/80 shrink-0">
              Tech Stack: {selectedEngine.technology}
            </div>
          </div>

          {/* Tables and DDL explorer */}
          {selectedEngine.tables.length > 0 && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Database Schema Registry ({selectedEngine.tables.length} {selectedEngine.id === "redis" ? "Key Patterns" : "Tables"} Managed)
              </div>

              {/* Table selectors */}
              <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/40">
                {selectedEngine.tables.map((table) => {
                  const isSelected = table.name === selectedTableName;
                  return (
                    <button
                      key={table.name}
                      onClick={() => setSelectedTableName(table.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-slate-900 text-sky-400 border border-slate-800" 
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                      }`}
                    >
                      {table.name}
                    </button>
                  );
                })}
              </div>

              {/* Selected table schema */}
              {selectedTable && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-mono font-bold text-sky-400">
                        {selectedEngine.id === "redis" ? "Redis Object Signature" : "DDL Create Schema"}
                      </span>
                      {selectedTable.partitioning && (
                        <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-900/40 px-2 py-0.5 rounded font-mono">
                          Partitioning: {selectedTable.partitioning}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {selectedTable.description}
                    </p>

                    {/* Code display with copy button */}
                    <div className="relative group mt-3">
                      <button
                        onClick={() => handleCopyDdl(selectedTable.ddl)}
                        className="absolute right-3 top-3 p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1.5 text-[10px]"
                        title="Copy schema DDL"
                      >
                        {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText ? "COPIED" : "COPY DDL"}</span>
                      </button>
                      <pre className="bg-slate-950/90 p-4 rounded-xl border border-slate-900 text-[11px] font-mono text-emerald-400/90 overflow-x-auto max-h-[300px] scrollbar-thin leading-relaxed">
                        {selectedTable.ddl}
                      </pre>
                    </div>
                  </div>

                  {/* Indexes definition if available */}
                  {selectedTable.indexes && selectedTable.indexes.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Optimized Indexes & Query Acceleration Strategies
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedTable.indexes.map((idx) => (
                          <div key={idx.name} className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-3.5 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-sky-400 font-bold">{idx.name}</span>
                              <span className="text-slate-500 bg-slate-950 border border-slate-800 px-1 rounded text-[9px] uppercase">{idx.type}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Indexed Keys: {idx.columns.join(", ")}
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                              {idx.purpose}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Operational database policies card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-400" />
            Reliability & Operations Blueprint
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedEngine.policies.map((policy) => (
              <div key={policy.title} className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  {policy.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {policy.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
