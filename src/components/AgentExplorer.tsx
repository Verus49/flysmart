import React, { useState, useEffect, useMemo, useRef } from "react";
import { AGENT_COMPONENT_DOCS, AgentComponentDoc } from "../data/agentDocs";
import { 
  Cpu, 
  Terminal, 
  Settings, 
  Bot, 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  User, 
  Sparkles, 
  Compass, 
  HelpCircle, 
  Play, 
  RotateCw, 
  Coffee, 
  Database, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Split,
  MessageSquare,
  Workflow,
  Zap,
  Globe,
  Plane,
  Clock,
  Briefcase
} from "lucide-react";

interface PipelineStage {
  name: string;
  status: "idle" | "running" | "success" | "error";
  details: string;
}

interface AgentSimState {
  currentQuery: string;
  isSimulating: boolean;
  activeStageIdx: number;
  stages: PipelineStage[];
  extractedEntities: Record<string, any>;
  toolCalled: string;
  toolParams: Record<string, any>;
  dbResult: any[];
  streamingText: string;
  showCards: boolean;
  cardsData: any[];
  compliancePassed: boolean;
}

const PRESET_QUERIES = [
  { id: "warm", label: "I want somewhere warm under $500." },
  { id: "europe", label: "I want the cheapest country in Europe." },
  { id: "nomad", label: "Find flights for digital nomads." },
  { id: "visa", label: "I need a visa-free destination." },
  { id: "overnight", label: "I only want overnight flights." }
];

export default function AgentExplorer() {
  const [selectedCompId, setSelectedCompId] = useState<string>("intent-detection");
  const [customInput, setCustomInput] = useState<string>("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [sim, setSim] = useState<AgentSimState>({
    currentQuery: PRESET_QUERIES[0].label,
    isSimulating: false,
    activeStageIdx: -1,
    stages: [
      { name: "Semantic Intent & Entity Extraction", status: "idle", details: "Pending extraction models..." },
      { name: "Dynamic Tool Routing", status: "idle", details: "Evaluating tool call signatures..." },
      { name: "GDS Database Query Integration", status: "idle", details: "Waiting for flight database dispatch..." },
      { name: "Personalization Scoring Index", status: "idle", details: "Scoring options against profile affinities..." },
      { name: "Output Generation & Stream", status: "idle", details: "Formatting streaming token outputs..." },
      { name: "Compliance & Safety Guardrails", status: "idle", details: "Running policy validators..." }
    ],
    extractedEntities: {},
    toolCalled: "",
    toolParams: {},
    dbResult: [],
    streamingText: "",
    showCards: false,
    cardsData: [],
    compliancePassed: false
  });

  const selectedComp = AGENT_COMPONENT_DOCS.find(c => c.id === selectedCompId) || AGENT_COMPONENT_DOCS[0];

  // Run the full AI Agent Pipeline simulation
  const runAgentPipeline = (queryText: string) => {
    if (sim.isSimulating) return;

    // Resolve simulated responses based on the query selected
    let entities: Record<string, any> = {};
    let toolName = "";
    let toolParams: Record<string, any> = {};
    let dbRows: any[] = [];
    let assistantText = "";
    let cards: any[] = [];

    const normalizedQuery = queryText.toLowerCase();

    if (normalizedQuery.includes("warm") || normalizedQuery.includes("500")) {
      entities = { intent: "leisure_discover", weather: "WARM", budget_limit: 500 };
      toolName = "discover_destinations_by_budget";
      toolParams = { weather_profile: "WARM", max_price_usd: 500, region: "any" };
      dbRows = [
        { name: "Tenerife, Spain", code: "TFS", price: 380, temp: "24°C", score: 94, reason: "Excellent sub-tropical climate. Flight routes are heavily populated by low-cost carriers, yielding high seat availability." },
        { name: "Malaga, Spain", code: "AGP", price: 340, temp: "22°C", score: 88, reason: "Mediterranean coastal hub with active LCC and premium carrier routes from major EU airports." }
      ];
      assistantText = "I have queried global weather grids and current dynamic fare cache tables. I extracted a budget limit of $500 and a weather preference for warm conditions. Sourced from ClickHouse pricing logs and Sabre GDS adapters, here are the top matching flights under your budget limits:";
      cards = dbRows;
    } 
    else if (normalizedQuery.includes("cheapest") || normalizedQuery.includes("europe")) {
      entities = { intent: "regional_cheapest", region: "EUROPE" };
      toolName = "get_cheapest_regional_destinations";
      toolParams = { region_code: "EU", limit: 3 };
      dbRows = [
        { name: "Warsaw, Poland", code: "WAW", price: 140, temp: "18°C", score: 92, reason: "Incredibly high low-cost carrier density from Wizz Air and Ryanair hubs. Ground index transit costs are very affordable." },
        { name: "Budapest, Hungary", code: "BUD", price: 155, temp: "19°C", score: 89, reason: "Major Eastern European hub with optimized secondary flight paths across standard carrier networks." }
      ];
      assistantText = "By scanning the active European flight sector matrices across both premium and low-cost carrier networks, I have compiled the absolute cheapest destinations. These options bypass traditional long-haul hub surcharges:";
      cards = dbRows;
    } 
    else if (normalizedQuery.includes("digital") || normalizedQuery.includes("nomad")) {
      entities = { intent: "nomad_routing", filters: { co_working: true, high_speed_internet: true } };
      toolName = "get_digital_nomad_hubs";
      toolParams = { min_internet_mbps: 50, safety_index: "high" };
      dbRows = [
        { name: "Lisbon, Portugal", code: "LIS", price: 480, temp: "21°C", score: 96, reason: "Fiber optic infrastructure, active nomad communities, and flexible long-stay accommodation options linked by TAP Air." },
        { name: "Tallinn, Estonia", code: "TLL", price: 390, temp: "15°C", score: 91, reason: "The pioneer of e-residency. Incredibly streamlined public Wi-Fi networks and direct connection segments across Northern Europe." }
      ];
      assistantText = "To retrieve the best digital nomad recommendations, I cross-referenced flight pricing scales with verified co-working directories and broadband speed indices. Here are outstanding destinations offering high connectivity and manageable travel budgets:";
      cards = dbRows;
    } 
    else if (normalizedQuery.includes("visa") || normalizedQuery.includes("free")) {
      entities = { intent: "visa_free_search", passport_nationality: "German" };
      toolName = "check_visa_free_destinations";
      toolParams = { nationality: "German", max_duration_days: 90 };
      dbRows = [
        { name: "Singapore", code: "SIN", price: 690, temp: "30°C", score: 95, reason: " जर्मनी (Germany) passport holders enjoy instant 90-day visa-exempt entry. SIN airport layover facilities are rated best worldwide." },
        { name: "Istanbul, Turkey", code: "IST", price: 310, temp: "21°C", score: 90, reason: "German citizens do not require entry visas. Serviced heavily by Turkish Airlines with robust dynamic connectivity schedules." }
      ];
      assistantText = "By consulting the live IATA Timatic global immigration database, I validated countries that grant immediate visa-exempt entry for German citizens. The optimal flight pairings extracted from our reservation logs are:";
      cards = dbRows;
    } 
    else if (normalizedQuery.includes("overnight")) {
      entities = { intent: "flight_schedule_filter", time_preference: "OVERNIGHT" };
      toolName = "search_flights_by_schedule";
      toolParams = { origin: "FRA", destination: "JFK", allowed_departure_hours: "21:00-05:00" };
      dbRows = [
        { name: "Singapore Airlines (SQ26)", code: "FRA-JFK", price: 680, temp: "21:00 departure", score: 97, reason: "Departing Frankfurt at 21:55, arriving in JFK at 00:15+1. Standard comfort index of 9.2 with premium seating configurations." },
        { name: "Delta Air Lines (DL107)", code: "FRA-JFK", price: 590, temp: "22:30 departure", score: 90, reason: "Excellent red-eye scheduling arriving in New York during off-peak customs hours, saving up to 45 minutes on arrival queues." }
      ];
      assistantText = "I have filtered all scheduled departures between Frankfurt (FRA) and New York (JFK) to only select overnight 'red-eye' flights. These options let you rest in cabin transit and avoid losing daytime hours:";
      cards = dbRows;
    } 
    else {
      // Custom generic query fallback
      entities = { intent: "general_flight_search", keyword: queryText };
      toolName = "search_flights_generic";
      toolParams = { phrase: queryText };
      dbRows = [
        { name: "Frankfurt to JFK", code: "FRA-JFK", price: 620, temp: "Flexible", score: 85, reason: "Matches generic search profiles. Pre-cached median pricing reflects stable seasonal curves." }
      ];
      assistantText = `I have completed an indexing scan for your custom query: "${queryText}". Our AI routing module has isolated standard flight patterns that match your description:`;
      cards = dbRows;
    }

    setSim({
      currentQuery: queryText,
      isSimulating: true,
      activeStageIdx: 0,
      stages: [
        { name: "Semantic Intent & Entity Extraction", status: "running", details: "Evaluating query tokens via Gemini vector embeddings..." },
        { name: "Dynamic Tool Routing", status: "idle", details: "Evaluating tool call signatures..." },
        { name: "GDS Database Query Integration", status: "idle", details: "Waiting for flight database dispatch..." },
        { name: "Personalization Scoring Index", status: "idle", details: "Scoring options against profile affinities..." },
        { name: "Output Generation & Stream", status: "idle", details: "Formatting streaming token outputs..." },
        { name: "Compliance & Safety Guardrails", status: "idle", details: "Running policy validators..." }
      ],
      extractedEntities: {},
      toolCalled: "",
      toolParams: {},
      dbResult: [],
      streamingText: "",
      showCards: false,
      cardsData: cards,
      compliancePassed: false
    });

    // Stage 1: Intent Extraction complete after 1200ms
    setTimeout(() => {
      setSim(prev => {
        const nextStages = [...prev.stages];
        nextStages[0] = { name: "Semantic Intent & Entity Extraction", status: "success", details: `Extracted intent: "${entities.intent}"` };
        nextStages[1] = { name: "Dynamic Tool Routing", status: "running", details: "Selecting matching API function schema from registry..." };
        return {
          ...prev,
          activeStageIdx: 1,
          stages: nextStages,
          extractedEntities: entities
        };
      });

      // Stage 2: Tool Routing complete after 1000ms
      setTimeout(() => {
        setSim(prev => {
          const nextStages = [...prev.stages];
          nextStages[1] = { name: "Dynamic Tool Routing", status: "success", details: `Routed to function: ${toolName}()` };
          nextStages[2] = { name: "GDS Database Query Integration", status: "running", details: "Querying GDS tables and localized cache indexes..." };
          return {
            ...prev,
            activeStageIdx: 2,
            stages: nextStages,
            toolCalled: toolName,
            toolParams: toolParams
          };
        });

        // Stage 3: DB query complete after 1200ms
        setTimeout(() => {
          setSim(prev => {
            const nextStages = [...prev.stages];
            nextStages[2] = { name: "GDS Database Query Integration", status: "success", details: `Retrieved ${dbRows.length} rows from travel catalog.` };
            nextStages[3] = { name: "Personalization Scoring Index", status: "running", details: "Processing dynamic multi-factor scoring functions..." };
            return {
              ...prev,
              activeStageIdx: 3,
              stages: nextStages,
              dbResult: dbRows
            };
          });

          // Stage 4: Personalization complete after 900ms
          setTimeout(() => {
            setSim(prev => {
              const nextStages = [...prev.stages];
              nextStages[3] = { name: "Personalization Scoring Index", status: "success", details: "Personalized scores successfully generated." };
              nextStages[4] = { name: "Output Generation & Stream", status: "running", details: "Generating server-sent event tokens..." };
              return {
                ...prev,
                activeStageIdx: 4,
                stages: nextStages
              };
            });

            // Stage 5: Streaming start. Progressive text output simulation
            let wordIndex = 0;
            const words = assistantText.split(" ");
            const interval = setInterval(() => {
              setSim(prev => {
                if (wordIndex >= words.length) {
                  clearInterval(interval);
                  
                  // Stage 5 completed, move to Stage 6: Safety Guardrails
                  setTimeout(() => {
                    setSim(prevSafety => {
                      const finalStages = [...prevSafety.stages];
                      finalStages[4] = { name: "Output Generation & Stream", status: "success", details: "Stream complete. SSE pipeline closed." };
                      finalStages[5] = { name: "Compliance & Safety Guardrails", status: "running", details: "Checking output for proprietary data leaks & financial disclaimers..." };
                      return {
                        ...prevSafety,
                        activeStageIdx: 5,
                        stages: finalStages,
                        showCards: true
                      };
                    });

                    // Stage 6 complete after 800ms
                    setTimeout(() => {
                      setSim(prevDone => {
                        const finalStages = [...prevDone.stages];
                        finalStages[5] = { name: "Compliance & Safety Guardrails", status: "success", details: "Policy constraints matched. 100% compliant." };
                        return {
                          ...prevDone,
                          activeStageIdx: 6,
                          isSimulating: false,
                          stages: finalStages,
                          compliancePassed: true
                        };
                      });
                    }, 800);

                  }, 600);

                  return prev;
                }

                const wordToAdd = words[wordIndex] + " ";
                wordIndex++;
                return {
                  ...prev,
                  streamingText: prev.streamingText + wordToAdd
                };
              });
            }, 45); // ~200wpm

          }, 900);

        }, 1200);

      }, 1000);

    }, 1200);
  };

  // Trigger initial simulation on load
  useEffect(() => {
    runAgentPipeline(PRESET_QUERIES[0].label);
  }, []);

  // Auto-scroll chat results
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [sim.streamingText, sim.showCards]);

  return (
    <div className="space-y-6 animate-fadeIn" id="agent-explorer-root">
      
      {/* Dynamic Simulation Sandbox Box */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <div className="text-[10px] bg-sky-950 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase max-w-max">
              Agent Performance Sandbox
            </div>
            <h2 className="text-lg font-black text-slate-100 tracking-tight mt-1.5 flex items-center gap-2">
              <Bot className="w-5 h-5 text-sky-400" />
              AI Travel Agent Sandbox & Pipeline Tracer
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select or submit a semantic traveler query to trace the orchestration pipeline in real-time, visualizing entity extraction models, function routing nodes, and custom card injections.
            </p>
          </div>
        </div>

        {/* Input prompt bar and presets */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PRESET_QUERIES.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setCustomInput("");
                  runAgentPipeline(preset.label);
                }}
                disabled={sim.isSimulating}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  sim.currentQuery === preset.label
                    ? "bg-sky-950 border-sky-500/30 text-sky-400"
                    : sim.isSimulating
                    ? "bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Or type a custom request (e.g., I want to go to Tokyo for 2 weeks)..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && customInput.trim() && !sim.isSimulating) {
                  runAgentPipeline(customInput);
                }
              }}
              disabled={sim.isSimulating}
              className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-sky-500/40 font-semibold disabled:opacity-50"
            />
            <button
              onClick={() => {
                if (customInput.trim() && !sim.isSimulating) {
                  runAgentPipeline(customInput);
                }
              }}
              disabled={sim.isSimulating || !customInput.trim()}
              className="px-4 py-2.5 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-400 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              Ask Agent
            </button>
          </div>
        </div>

        {/* Simulator Dual Column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Trace Pipeline Logs */}
          <div className="lg:col-span-5 bg-slate-950/60 border border-slate-900 rounded-xl p-5 space-y-4">
            <div className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wide flex items-center gap-1.5 justify-between">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-sky-400" />
                Pipeline Orchestrator Trace
              </span>
              <span className="text-[10px] font-mono text-slate-600">
                active: {sim.isSimulating ? "STREAMS_ALIGNED" : "IDLE"}
              </span>
            </div>

            {/* Stages walk list */}
            <div className="space-y-3.5">
              {sim.stages.map((stage, idx) => {
                const isCurrent = idx === sim.activeStageIdx;
                const isSuccess = stage.status === "success";
                const isRunning = stage.status === "running";
                
                return (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-lg border transition-all ${
                      isCurrent 
                        ? "bg-sky-950/20 border-sky-500/30 text-sky-300"
                        : isSuccess
                        ? "bg-slate-900/20 border-slate-800 text-slate-400"
                        : "bg-slate-950/20 border-slate-950 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isCurrent ? "bg-sky-900 text-sky-400" : isSuccess ? "bg-slate-900 text-slate-500" : "bg-slate-950 text-slate-700"
                        }`}>
                          0{idx + 1}
                        </span>
                        {stage.name}
                      </span>

                      <div className="shrink-0 font-mono text-[10px]">
                        {isRunning && (
                          <span className="text-sky-400 flex items-center gap-1">
                            <RotateCw className="w-3 h-3 animate-spin" />
                            processing
                          </span>
                        )}
                        {isSuccess && (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            done
                          </span>
                        )}
                        {stage.status === "idle" && (
                          <span className="text-slate-700">idle</span>
                        )}
                      </div>
                    </div>

                    <p className={`text-[10px] mt-1.5 font-mono ${isCurrent ? "text-sky-400" : isSuccess ? "text-slate-500" : "text-slate-700"}`}>
                      &gt; {stage.details}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* JSON State Output */}
            {sim.activeStageIdx >= 1 && (
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-900 space-y-2">
                <div className="text-[9px] font-mono text-slate-500 uppercase">Context State Variables</div>
                <div className="text-[10px] font-mono text-emerald-400 space-y-1 overflow-x-auto leading-relaxed">
                  <div>{`{`}</div>
                  <div className="pl-4 text-sky-400">"intent": "{sim.extractedEntities.intent}",</div>
                  {sim.toolCalled && (
                    <div className="pl-4 text-indigo-400">"dispatched_tool": "{sim.toolCalled}()",</div>
                  )}
                  {sim.toolParams && (
                    <div className="pl-4 text-amber-500">"parameters": {JSON.stringify(sim.toolParams, null, 2)},</div>
                  )}
                  <div className="pl-4 text-slate-500">"compliance_check": {sim.compliancePassed ? "true" : "false"}</div>
                  <div>{`}`}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Chat Dialog Box */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-900 rounded-xl h-[470px] flex flex-col justify-between overflow-hidden">
            
            {/* Chat header */}
            <div className="bg-slate-900/50 border-b border-slate-900/80 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-950 text-sky-400 rounded-lg border border-sky-800/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">AI Flight Intelligence Specialist</h4>
                  <p className="text-[10px] text-slate-500">Model: gemini-2.5-flash • Connected to ClickHouse & GDS</p>
                </div>
              </div>

              {sim.compliancePassed && (
                <div className="flex items-center gap-1.5 text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded-full font-mono uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Secured
                </div>
              )}
            </div>

            {/* Chat conversation area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
              
              {/* User message */}
              <div className="flex items-start gap-2.5 max-w-[85%]">
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-none">
                  <p className="text-xs font-semibold text-slate-200">{sim.currentQuery}</p>
                </div>
              </div>

              {/* Agent message stream */}
              {sim.streamingText && (
                <div className="flex items-start gap-2.5 max-w-[95%]">
                  <div className="p-2 bg-sky-950 text-sky-400 border border-sky-800/30 rounded-lg shrink-0">
                    <Bot className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl rounded-tl-none space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                      {sim.streamingText}
                    </p>

                    {/* Rich card inclusions */}
                    {sim.showCards && sim.cardsData.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 animate-fadeIn">
                        {sim.cardsData.map((item, idx) => (
                          <div key={idx} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 shadow-lg relative group overflow-hidden">
                            
                            <div className="absolute top-0 right-0 p-1 bg-sky-950 text-sky-400 rounded-bl text-[8px] font-mono uppercase border-l border-b border-sky-800/20 font-bold">
                              Score: {item.score}%
                            </div>

                            <div className="space-y-0.5">
                              <h5 className="text-xs font-black text-slate-200 flex items-center gap-1">
                                <Globe className="w-3.5 h-3.5 text-sky-400" />
                                {item.name}
                              </h5>
                              <span className="text-[10px] font-mono text-slate-500 uppercase">{item.code} • {item.temp}</span>
                            </div>

                            <div className="flex items-baseline justify-between pt-1 border-t border-slate-900">
                              <span className="text-[10px] text-slate-500 font-mono">Fare Quote:</span>
                              <span className="text-sm font-black text-emerald-400 font-mono">${item.price}</span>
                            </div>

                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              {item.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat disclaimers */}
            <div className="bg-slate-900/20 border-t border-slate-900 p-3 text-[9px] text-slate-500 font-mono flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Safety disclaimer: Dynamic airfares fluctuate instantly. Quotes are illustrative. No private coordinates are parsed or shared.</span>
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
              Agent Architecture Blocks
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Analyze the precise technical specifications, pipelines, and loops designed for our high-availability conversational AI Agent.
            </p>
          </div>

          <div className="space-y-1.5">
            {AGENT_COMPONENT_DOCS.map((comp) => {
              const isSelected = comp.id === selectedCompId;
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompId(comp.id)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all border flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-sky-950/30 border-sky-500/30 text-sky-400 shadow-lg shadow-sky-950/20"
                      : "bg-slate-950/30 border-slate-800/60 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800 hover:text-slate-200"
                  }`}
                >
                  <span className="font-bold text-xs tracking-wide">
                    {comp.title}
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-1">
                    {comp.shortDesc}
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
              {selectedComp.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {selectedComp.details}
            </p>
          </div>

          {/* ASCII flowchart */}
          {selectedComp.flowchart && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Sequence Diagram / Component Interaction</div>
              <pre className="bg-slate-950/60 p-5 rounded-xl border border-slate-900 text-[10px] font-mono text-sky-400/90 leading-relaxed overflow-x-auto">
                {selectedComp.flowchart}
              </pre>
            </div>
          )}

          {/* Subsections with Technical Details */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Component Deep-Dive & Strict Constraints
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedComp.subsections.map((sub) => (
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
