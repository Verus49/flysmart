import React, { useState, useEffect, useMemo, useRef } from "react";
import { KAFKA_EVENTS, EventSpec, EventField } from "../data/eventDocs";
import { 
  Zap, 
  Terminal, 
  Cpu, 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Database, 
  Play, 
  RefreshCw, 
  Workflow, 
  Clock, 
  HelpCircle, 
  Layers, 
  Search, 
  Eye, 
  History, 
  Activity,
  User,
  AlertOctagon,
  ChevronRight,
  Sparkles,
  Volume2
} from "lucide-react";

interface StreamLog {
  timestamp: string;
  type: "info" | "success" | "warning" | "error" | "emit";
  message: string;
  payload?: any;
}

export default function EventExplorer() {
  const [selectedEventId, setSelectedEventId] = useState<string>("FlightSearched");
  const [errorRate, setErrorRate] = useState<number>(30); // 30% chance of consumer errors in simulator
  const [simulationLogs, setSimulationLogs] = useState<StreamLog[]>([]);
  const [isSimulatingStream, setIsSimulatingStream] = useState<boolean>(false);
  const [dlqCounter, setDlqCounter] = useState<number>(0);
  const [processedCounter, setProcessedCounter] = useState<number>(0);
  const [retryCounter, setRetryCounter] = useState<number>(0);
  
  const logTerminalEndRef = useRef<HTMLDivElement>(null);

  const selectedEvent = useMemo(() => {
    return KAFKA_EVENTS.find(e => e.id === selectedEventId) || KAFKA_EVENTS[0];
  }, [selectedEventId]);

  // Append logs helper
  const addLog = (message: string, type: "info" | "success" | "warning" | "error" | "emit", payload?: any) => {
    const time = new Date().toISOString().split("T")[1].substring(0, 8);
    setSimulationLogs(prev => [...prev, { timestamp: time, type, message, payload }]);
  };

  // Run a single Kafka Event Simulation cycle
  const runEventSimulation = async (eventSpec: EventSpec) => {
    if (isSimulatingStream) return;
    setIsSimulatingStream(true);
    setSimulationLogs([]);
    
    addLog(`[Kafka Producer] Preparing payload for Event: ${eventSpec.name} on topic: ${eventSpec.topic}`, "info");
    
    // Construct sample payload based on schemas
    const samplePayload: Record<string, any> = {};
    eventSpec.schema.forEach((field) => {
      samplePayload[field.name] = field.example;
    });

    await new Promise(resolve => setTimeout(resolve, 800));
    addLog(`[Kafka Producer] Dispatched event to partition cluster 0. (Metadata: v${eventSpec.version})`, "emit", samplePayload);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    addLog(`[Kafka Broker] Message validated against Avro Schema Registry. Acknowledged by replicas (min.insync.replicas=2)`, "success");

    await new Promise(resolve => setTimeout(resolve, 800));
    addLog(`[Kafka Consumers] Dispatched to customer consumer groups...`, "info");

    // Simulate multi-turn consumption with retries depending on simulated failure rate
    let attempt = 1;
    let maxAttempts = eventSpec.retryStrategy.maxAttempts;
    let isSuccess = false;

    // Roll random percentage to determine if first attempt fails
    let isFailing = Math.random() * 100 < errorRate;

    while (attempt <= maxAttempts && !isSuccess) {
      const consumerName = eventSpec.consumers[0]; // test with primary consumer
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isFailing) {
        addLog(`[Consumer Error] Attempt ${attempt}/${maxAttempts} failed on ${consumerName}: Simulated SQL Connection Lock.`, "warning");
        setRetryCounter(prev => prev + 1);
        attempt++;
        if (attempt <= maxAttempts) {
          addLog(`[Retry Coordinator] Exponential backoff triggered. Waiting ${eventSpec.retryStrategy.initialIntervalMs * attempt}ms before retry...`, "info");
          await new Promise(resolve => setTimeout(resolve, eventSpec.retryStrategy.initialIntervalMs * attempt));
          // Roll again
          isFailing = Math.random() * 100 < (errorRate * 0.7); // slightly better chance on retry
        }
      } else {
        isSuccess = true;
        addLog(`[Consumer Success] Event processed fully by: ${consumerName}. Database transactions committed.`, "success");
        setProcessedCounter(prev => prev + 1);
      }
    }

    if (!isSuccess) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      addLog(`[Dead-Letter Queue] Max attempts (${maxAttempts}) exceeded. Routing corrupted event envelope to DLQ topic: ${eventSpec.dlqTopic}`, "error", samplePayload);
      setDlqCounter(prev => prev + 1);
    }

    setIsSimulatingStream(false);
  };

  // Auto scroll terminal logs
  useEffect(() => {
    if (logTerminalEndRef.current) {
      logTerminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [simulationLogs]);

  return (
    <div className="space-y-6 animate-fadeIn" id="kafka-hub-root">
      
      {/* Upper overview header banner */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <div className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase max-w-max">
              High-Throughput Streaming Mesh
            </div>
            <h2 className="text-lg font-black text-slate-100 tracking-tight mt-1.5 flex items-center gap-2">
              <Workflow className="w-5 h-5 text-indigo-400 animate-pulse" />
              Event-Driven Kafka Orchestrator
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Analyze FlySmart's complete event architecture. Select an event schema below to audit producer/consumer relationships, review dead-letter queue routing, or simulate active stream payloads in real-time.
            </p>
          </div>
        </div>

        {/* Real-time stats panel counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Kafka Broker State</span>
            <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              CLUSTER_ONLINE
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Simulated Processed</span>
            <div className="text-xs font-bold text-slate-200 font-mono">{processedCounter} Events</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Simulated Retries</span>
            <div className="text-xs font-bold text-amber-500 font-mono">{retryCounter} Cycles</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase">DLQ Transfers</span>
            <div className="text-xs font-bold text-rose-400 font-mono">{dlqCounter} Messages</div>
          </div>
        </div>
      </div>

      {/* Main Dual Layout: Schema Inspector and Simulator Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand list of 10 events */}
        <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              Event Schema Directory
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal font-semibold">
              Select an event payload specification to review structures, consumers, and validation rules.
            </p>
          </div>

          <div className="space-y-1.5 max-h-[480px] overflow-y-auto scrollbar-thin">
            {KAFKA_EVENTS.map((event) => {
              const isSelected = event.id === selectedEventId;
              
              // Custom color-coded indicators for anomaly or failure topics
              const isHighPriority = event.id === "MistakeFareDetected" || event.id === "PartnerFailed";
              
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected 
                      ? "bg-indigo-950/30 border-indigo-500/30 text-indigo-450 shadow-lg shadow-indigo-950/20"
                      : "bg-slate-950/30 border-slate-900 text-slate-400 hover:bg-slate-900/40 hover:border-slate-800 hover:text-slate-200"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      {event.name}
                      {isHighPriority && (
                        <span className="text-[8px] bg-rose-950/40 text-rose-450 border border-rose-900/30 px-1 py-0.2 rounded font-mono uppercase font-bold">
                          alert
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-550 font-mono truncate max-w-[200px]">{event.topic}</p>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 opacity-30 group-hover:opacity-100 transition-opacity ${isSelected ? "text-indigo-400" : ""}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle and Right: Selected Schema and Active Simulator */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Detailed Schema Inspector Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-1.5">
                  <Database className="w-5 h-5 text-indigo-400" />
                  {selectedEvent.name} Specification
                </h3>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">{selectedEvent.topic}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-lg text-slate-400 font-mono font-bold">
                  Ver: {selectedEvent.version}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              {selectedEvent.description}
            </p>

            {/* Avro fields layout tables */}
            <div className="space-y-3">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Payload Schema Attributes (Fields)</div>
              
              <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-slate-900 text-slate-450 font-mono">
                      <th className="px-4 py-2.5">Field Name</th>
                      <th className="px-4 py-2.5">Data Type</th>
                      <th className="px-4 py-2.5">Diagnostic Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {selectedEvent.schema.map((field) => (
                      <tr key={field.name} className="hover:bg-slate-900/20">
                        <td className="px-4 py-3 font-mono font-bold text-sky-400">{field.name}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{field.type}</td>
                        <td className="px-4 py-3 text-slate-400">{field.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pipeline and orchestration params block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Producers and Consumers mapping */}
              <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-3">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Producer & Consumer Registry</div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-500">PRODUCER NODE:</span>
                    <p className="text-xs font-bold text-indigo-400">{selectedEvent.producer}</p>
                  </div>
                  <div className="border-t border-slate-900 pt-2">
                    <span className="text-[10px] text-slate-500">CONSUMERS LIST:</span>
                    <ul className="space-y-1 mt-1">
                      {selectedEvent.consumers.map((c, idx) => (
                        <li key={idx} className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Retry policies & DLQ rules */}
              <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-3">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Retry & DLQ Routing Strategy</div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-500">RETRY POLICY:</span>
                    <p className="text-xs font-bold text-amber-500">{selectedEvent.retryStrategy.backoffType}</p>
                    <span className="text-[10px] font-mono text-slate-500">
                      Max Attempts: {selectedEvent.retryStrategy.maxAttempts} • Initial Delay: {selectedEvent.retryStrategy.initialIntervalMs}ms
                    </span>
                  </div>
                  <div className="border-t border-slate-900 pt-2">
                    <span className="text-[10px] text-slate-500">DEAD-LETTER QUEUE TOPIC:</span>
                    <p className="text-xs font-mono font-bold text-rose-400">{selectedEvent.dlqTopic}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Replay and monitoring */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-2">
                <div className="text-[9px] font-mono text-slate-500 uppercase">Stream Replay Mechanism</div>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {selectedEvent.replayMechanism}
                </p>
              </div>
              <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-2">
                <div className="text-[9px] font-mono text-slate-500 uppercase">Production Monitoring Metrics</div>
                <ul className="space-y-1.5 font-mono text-[10px] text-indigo-400">
                  {selectedEvent.monitoringMetrics.map((m, idx) => (
                    <li key={idx} className="flex gap-1.5">
                      <span>•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Interactive Consumer Simulator Console */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4 gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Interactive Event Stream Simulator
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust simulated broker network failure probability metrics, then trigger an active transaction to visualize live retry retries and dead-letter queue handoffs.
                </p>
              </div>
            </div>

            {/* Sliders and trigger action buttons */}
            <div className="flex flex-col md:flex-row items-center gap-6 justify-between bg-slate-950 p-4 rounded-xl border border-slate-850">
              <div className="flex-1 w-full space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">Simulated Consumer Error Probability</span>
                  <span className={`font-mono font-bold ${errorRate > 50 ? "text-rose-400" : "text-amber-400"}`}>
                    {errorRate}% chance of failure
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={errorRate}
                  onChange={(e) => setErrorRate(parseInt(e.target.value))}
                  disabled={isSimulatingStream}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>0% (Perfect Network)</span>
                  <span>50% (High Congestion)</span>
                  <span>100% (Absolute Outage)</span>
                </div>
              </div>

              <button
                onClick={() => runEventSimulation(selectedEvent)}
                disabled={isSimulatingStream}
                className="w-full md:w-auto px-5 py-3.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-400 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {isSimulatingStream ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Simulating Stream...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Trigger {selectedEvent.name} Stream
                  </>
                )}
              </button>
            </div>

            {/* High contrast virtual log window */}
            <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 h-[300px] overflow-y-auto flex flex-col justify-between scrollbar-thin">
              <div className="space-y-2.5">
                {simulationLogs.length === 0 ? (
                  <div className="h-[250px] flex flex-col items-center justify-center text-slate-600 font-mono text-xs text-center space-y-2">
                    <Terminal className="w-8 h-8 text-slate-700 animate-pulse" />
                    <div>
                      <p className="font-bold">Virtual Kafka Log Terminal</p>
                      <p className="text-[10px] text-slate-650">Ready. Click 'Trigger' above to stream Kafka topic messages.</p>
                    </div>
                  </div>
                ) : (
                  simulationLogs.map((log, idx) => {
                    let color = "text-slate-400";
                    if (log.type === "success") color = "text-emerald-450 font-bold";
                    if (log.type === "warning") color = "text-amber-500 font-bold";
                    if (log.type === "error") color = "text-rose-400 font-bold";
                    if (log.type === "emit") color = "text-sky-400 font-bold";

                    return (
                      <div key={idx} className="font-mono text-[10px] space-y-1.5 border-b border-slate-900/40 pb-2">
                        <div className="flex items-start gap-2">
                          <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                          <span className={color}>{log.message}</span>
                        </div>
                        
                        {/* Render JSON payloads inside logs */}
                        {log.payload && (
                          <div className="ml-6 bg-slate-900/40 border border-slate-850 p-2.5 rounded-lg text-emerald-400 max-w-full overflow-x-auto text-[9px]">
                            <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={logTerminalEndRef} />
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
