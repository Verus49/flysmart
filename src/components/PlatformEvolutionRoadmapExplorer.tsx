import React, { useState, useMemo } from "react";
import { 
  Milestone, 
  MapPin, 
  Layers, 
  Users, 
  Globe, 
  Code2, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  ArrowRight, 
  Send, 
  Terminal, 
  Database, 
  Network, 
  Coins, 
  Briefcase, 
  Activity, 
  Plane, 
  Hotel, 
  Car, 
  Train, 
  Ship, 
  Compass, 
  ShieldAlert, 
  FileText, 
  ChevronRight, 
  ExternalLink 
} from "lucide-react";

// --- TYPES & INTERFACES ---
type RoadmapYear = "Year 1" | "Year 2" | "Year 3" | "Year 4" | "Year 5";
type SubTabType = "roadmap_timeline" | "multitenant_architecture" | "developer_sdk_sandbox" | "partner_portal" | "specs";

interface RoadmapMilestone {
  id: string;
  year: RoadmapYear;
  quarter: string;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "planned";
  category: "Core Verticals" | "Value Added" | "Enterprise & Multi-tenant" | "Developer & Platform";
  icon: React.ReactNode;
  technicalCapabilities: string[];
}

export default function PlatformEvolutionRoadmapExplorer() {
  const [activeTab, setActiveTab] = useState<SubTabType>("roadmap_timeline");
  const [selectedYearFilter, setSelectedYearFilter] = useState<RoadmapYear | "All">("All");
  
  // Interactive Partner Sandbox States
  const [selectedTenantType, setSelectedTenantType] = useState<"affiliate" | "white_label" | "corporate">("white_label");
  const [activePartnerDomain, setActivePartnerDomain] = useState<string>("travel-unlimited.com");
  const [simulatedPartnerRps, setSimulatedPartnerRps] = useState<number>(145);
  const [apiResponseTime, setApiResponseTime] = useState<number>(32);
  const [apiLogs, setApiLogs] = useState<string[]>([
    "[INIT] Multi-tenant gateway routed tenant request 'travel-unlimited.com' through Edge Router.",
    "[AUTH] Partner token cryptographically verified against SPIFFE workload database.",
    "[GATEWAY] White-label JSON response generated with tenant custom layout profile in 28ms."
  ]);

  // Comprehensive 5-Year Roadmap Milestones Data
  const roadmapData: RoadmapMilestone[] = useMemo(() => [
    // Year 1
    {
      id: "M-101",
      year: "Year 1",
      quarter: "Q1-Q2",
      title: "Hotel & Lodging Consolidation Engine",
      description: "Integrate major global distribution systems (GDS) and directly negotiate APIs to construct a real-time, low-latency hotel inventory index.",
      status: "completed",
      category: "Core Verticals",
      icon: <Hotel className="w-5 h-5 text-sky-400" />,
      technicalCapabilities: [
        "Distributed inventory cache matching regional hot zones",
        "Overbooking avoidance algorithm on Google Spanner transactions",
        "Aggregated reviews pipeline with NLP sentiment filtering"
      ]
    },
    {
      id: "M-102",
      year: "Year 1",
      quarter: "Q3-Q4",
      title: "Car Rental & Ground Transit Hub",
      description: "Onboard premium global ground transit partners with precise geo-radius booking limits and dynamic cancellation webhooks.",
      status: "completed",
      category: "Core Verticals",
      icon: <Car className="w-5 h-5 text-sky-400" />,
      technicalCapabilities: [
        "Dynamic proximity location search using Redis Geospatial coordinates",
        "Instant transaction hold guarantees with direct fleet APIs",
        "Automatic flight-delay rescheduling buffer listeners"
      ]
    },
    // Year 2
    {
      id: "M-201",
      year: "Year 2",
      quarter: "Q1-Q2",
      title: "Railways & Cruise-Line Integration",
      description: "Onboard national rail carriers (AMTRAK, Eurostar, Shinkansen) alongside elite Cruise operators onto the central unified search graph.",
      status: "in_progress",
      category: "Core Verticals",
      icon: <Train className="w-5 h-5 text-emerald-400" />,
      technicalCapabilities: [
        "Multi-modal itinerary generation graph (Flight + Train ticket chaining)",
        "Real-time seat map synchronization utilizing high-frequency WebSockets",
        "Dynamic cabin inventory lock queues using Redis distributed locks"
      ]
    },
    {
      id: "M-202",
      year: "Year 2",
      quarter: "Q3-Q4",
      title: "Hyper-Local Experiences & Tour Marketplace",
      description: "Launch direct-to-host partner portal permitting micro-merchants and tour operators to register local experiences and secure tickets.",
      status: "planned",
      category: "Core Verticals",
      icon: <Compass className="w-5 h-5 text-emerald-400" />,
      technicalCapabilities: [
        "Direct-to-host payout system leveraging Stripe Custom Connect",
        "Dynamic capacity limits protection and mobile QR Ticket passes",
        "Offline-first client local verification tickets with symmetric encryption keys"
      ]
    },
    // Year 3
    {
      id: "M-301",
      year: "Year 3",
      quarter: "Q1-Q2",
      title: "Automated Travel Insurance & Smart Visa Assistance",
      description: "Build algorithmic, parameter-driven dynamic trip insurance calculators and instant passport/visa validation rules.",
      status: "planned",
      category: "Value Added",
      icon: <ShieldCheck className="w-5 h-5 text-indigo-400" />,
      technicalCapabilities: [
        "Instant visa-requirement mapping based on passenger passport routing history",
        "Algorithmic flight-delay parametric insurance payout on smart-contracts",
        "DLP-compliant scanning of customer document uploads"
      ]
    },
    {
      id: "M-302",
      year: "Year 3",
      quarter: "Q3-Q4",
      title: "Corporate Travel Manager & Expense Policy Engine",
      description: "Construct sophisticated enterprise business dashboards with customized expense rules, approval workflows, and multi-employee cards.",
      status: "planned",
      category: "Enterprise & Multi-tenant",
      icon: <Briefcase className="w-5 h-5 text-indigo-400" />,
      technicalCapabilities: [
        "Granular cost-center assignment and hierarchical approval limits",
        "Automated integration into accounting Ledgers (SAP, Workday)",
        "Single Sign-On (SSO) with Okta and Azure Active Directory SAML/OIDC"
      ]
    },
    // Year 4
    {
      id: "M-401",
      year: "Year 4",
      quarter: "Q1-Q2",
      title: "Multi-Tenant White-Label APIs & Tenant Gateway",
      description: "Permit sub-brands and travel agencies to run the complete FlySmart booking ecosystem under their own DNS, CSS theme, and custom markups.",
      status: "planned",
      category: "Enterprise & Multi-tenant",
      icon: <Layers className="w-5 h-5 text-amber-400" />,
      technicalCapabilities: [
        "Multi-tenant routing gateway matching HTTP Host headers on the fly",
        "Dynamic tenant CSS custom-theme hydration on edge servers",
        "Custom domain automatic SSL provision pipeline via Let's Encrypt APIs"
      ]
    },
    {
      id: "M-402",
      year: "Year 4",
      quarter: "Q3-Q4",
      title: "Partner Affiliate Marketplace & Settlement Engine",
      description: "Establish automated referral system and publisher console to aggregate multi-tenant analytics and distribute payouts.",
      status: "planned",
      category: "Developer & Platform",
      icon: <Coins className="w-5 h-5 text-amber-400" />,
      technicalCapabilities: [
        "Smart attribution pixel matching browser cookies without violating privacy regulations",
        "Asynchronous batch settlement engine parsing millions of transaction commission splits",
        "Real-time fraud-vector scoring on affiliate payouts"
      ]
    },
    // Year 5
    {
      id: "M-501",
      year: "Year 5",
      quarter: "Q1-Q2",
      title: "Developer Portal, Public SDKs & Event Mesh Webhooks",
      description: "Release public developer platforms with plug-and-play SDKs (Node, Python, Go) and strict event-driven push notification pipelines.",
      status: "planned",
      category: "Developer & Platform",
      icon: <Code2 className="w-5 h-5 text-teal-400" />,
      technicalCapabilities: [
        "Self-service sandbox credentials provisioning dashboard",
        "Algorithmic rate-limiting quotas matching developer tier pricing",
        "Durable webhook delivery retries with exponential backoffs"
      ]
    }
  ], []);

  // Filtered timeline milstones
  const filteredMilestones = useMemo(() => {
    if (selectedYearFilter === "All") return roadmapData;
    return roadmapData.filter(m => m.year === selectedYearFilter);
  }, [selectedYearFilter, roadmapData]);

  // Simulate partner SDK/API query execution
  const triggerSandboxQuery = (type: "search_hotels" | "book_train" | "calculate_insurance") => {
    const time = new Date().toTimeString().split(" ")[0];
    const trackingId = `TX-${Math.floor(Math.random() * 90000) + 10000}`;
    
    let queryPayload = "";
    let logsToAdd: string[] = [];

    if (type === "search_hotels") {
      queryPayload = `GET /v1/hotels?location=PARIS&checkin=2026-07-01&tenantId=${selectedTenantType}`;
      logsToAdd = [
        `[${time}] Received SDK Hotel query from tenant '${activePartnerDomain}'.`,
        `[${time}] Routing search request to Europe-west3 Cache clusters.`,
        `[${time}] Redis cache HIT: Returned 82 hotels matching parameters in ${apiResponseTime}ms.`
      ];
    } else if (type === "book_train") {
      queryPayload = `POST /v1/trains/book { route: "LON-PAR", seats: [14A], trackingId: "${trackingId}" }`;
      logsToAdd = [
        `[${time}] Received Train booking request from API worker '${activePartnerDomain}'.`,
        `[${time}] Acquiring distributed Redis lock on seat LON-PAR-14A.`,
        `[${time}] Distributed Spanner transactional commit successful. Seat confirmed in ${apiResponseTime + 15}ms.`
      ];
    } else {
      queryPayload = `GET /v1/insurance/quote?tripCost=2400&passengerAge=34&tenantId=${selectedTenantType}`;
      logsToAdd = [
        `[${time}] Received Insurance validation check from client SDK.`,
        `[${time}] Parameter parsed successfully against local actuarial algorithms.`,
        `[${time}] Actuarial quote returned: $42.10 premium calculation complete.`
      ];
    }

    setSimulatedPartnerRps(prev => prev + 1);
    setApiLogs(prev => [...logsToAdd, ...prev].slice(0, 15));
  };

  return (
    <div className="space-y-6" id="platform-evolution-roadmap-explorer">
      
      {/* 1. Header Segment */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-40 bg-teal-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-40 bg-indigo-500/5 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest font-black text-teal-450">
                ECOSYSTEM ENGINE: EXPANDABLE
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-100 mt-1 tracking-tight flex items-center gap-2">
              <Milestone className="w-5.5 h-5.5 text-teal-400" />
              <span>5-Year Platform Evolution & Partner Ecosystem Roadmap</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Explore FlySmart's 5-year scaling map. Track our structural evolution from standard flight reservations into a unified, multi-tenant travel marketplace supporting **Hotels, Car rentals, Trains, Cruises, Insurance, Visa assistance**, and direct-to-host **Developer APIs**.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-850 p-3 rounded-xl shrink-0">
            <div className="text-left">
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">Active Tenants</span>
              <strong className="text-sm font-black text-slate-200 font-mono">1,420 partners</strong>
            </div>
            <div className="h-8 w-[1px] bg-slate-850" />
            <div className="text-left">
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">API Performance</span>
              <strong className="text-sm font-black text-teal-450 font-mono">&lt; 35ms avg</strong>
            </div>
            <div className="h-8 w-[1px] bg-slate-850" />
            <div className="text-left">
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">Platform Architecture</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded font-mono bg-indigo-950 text-indigo-400 border border-indigo-500/20">
                MULTI-TENANT
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-t border-slate-800/40 mt-4 pt-4 justify-between items-center flex-wrap gap-2">
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("roadmap_timeline")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "roadmap_timeline"
                  ? "bg-slate-900 border border-slate-800 text-teal-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Milestone className="w-4 h-4 text-teal-400" />
              <span>5-Year Year-by-Year Roadmap</span>
            </button>

            <button
              onClick={() => setActiveTab("multitenant_architecture")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "multitenant_architecture"
                  ? "bg-slate-900 border border-slate-800 text-indigo-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Multi-tenant Architecture</span>
            </button>

            <button
              onClick={() => setActiveTab("developer_sdk_sandbox")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "developer_sdk_sandbox"
                  ? "bg-slate-900 border border-slate-800 text-sky-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-4 h-4 text-sky-400" />
              <span>Developer SDK Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab("partner_portal")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "partner_portal"
                  ? "bg-slate-900 border border-slate-800 text-emerald-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4 text-emerald-450" />
              <span>White-label & Affiliates Portal</span>
            </button>

            <button
              onClick={() => setActiveTab("specs")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "specs"
                  ? "bg-slate-900 border border-slate-800 text-amber-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>Schema & Specs</span>
            </button>
          </div>
        </div>

      </div>

      {/* 2. Primary Display Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Interactive Frame */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* A. Roadmap Timeline display */}
          {activeTab === "roadmap_timeline" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              
              {/* Year Filtering Row */}
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Milestone className="w-5 h-5 text-teal-400" />
                    <span>5-Year Evolution Milestone Ledger</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Filter by expansion year to examine critical milestones in the FlySmart corporate rollout strategy.
                  </p>
                </div>

                <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl">
                  {["All", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"].map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYearFilter(year as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedYearFilter === year 
                          ? "bg-teal-950 border border-teal-900/40 text-teal-400 font-black shadow" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milestones Flow */}
              <div className="space-y-4">
                {filteredMilestones.map((milestone) => (
                  <div 
                    key={milestone.id} 
                    className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl transition-all hover:bg-slate-950/75 relative"
                  >
                    {/* Corner Ribbon Status */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{milestone.quarter}</span>
                      <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-black tracking-wide ${
                        milestone.status === "completed" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/20" :
                        milestone.status === "in_progress" ? "bg-sky-950 text-sky-400 border border-sky-900/20 animate-pulse" :
                        "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}>
                        {milestone.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex gap-4">
                      {/* Icon Carrier */}
                      <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 shrink-0 h-fit">
                        {milestone.icon}
                      </div>

                      {/* Info and features */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase font-black">{milestone.year} • {milestone.category}</span>
                          <h4 className="text-sm font-black text-slate-100 mt-0.5">{milestone.title}</h4>
                        </div>

                        <p className="text-[11.5px] text-slate-400 leading-relaxed font-semibold">
                          {milestone.description}
                        </p>

                        <div className="pt-2 border-t border-slate-900/80">
                          <span className="text-[10px] font-mono text-slate-450 uppercase block font-semibold mb-1">Ecosystem Capability Upgrades</span>
                          <div className="flex flex-wrap gap-1.5">
                            {milestone.technicalCapabilities.map((cap, capIdx) => (
                              <span key={capIdx} className="text-[9.5px] font-mono bg-slate-900/80 border border-slate-850 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-teal-450" />
                                <span>{cap}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* B. Multi-tenant Architecture schema */}
          {activeTab === "multitenant_architecture" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span>Isolation Architecture: Multi-tenant & Logical Resource Sharding</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Our white-label platform isolates partner travel companies under a logically sharded multi-tenant directory using Google Cloud SQL schemas or isolated partition keys. Inspect the structural routing pipeline below.
                </p>
              </div>

              {/* Dynamic schema visualizer */}
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4 font-mono text-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase block border-b border-slate-850 pb-2">Multi-Tenant Dynamic Request Router</span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  
                  {/* Step 1 */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[9px] text-indigo-400 font-bold block uppercase">1. Host Header Ingress</span>
                    <strong className="text-[11px] text-slate-200">travel-unlimited.com</strong>
                    <p className="text-[9.5px] text-slate-500 leading-normal">
                      WAF intercepts domain host, checking tenant whitelist database.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[9px] text-indigo-400 font-bold block uppercase">2. Tenant Resolution</span>
                    <strong className="text-[11px] text-amber-400">Context: Tenant_ID: WT-902</strong>
                    <p className="text-[9.5px] text-slate-500 leading-normal">
                      Dynamic Middleware injects tenant configurations directly into local API contexts.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[9px] text-indigo-400 font-bold block uppercase">3. Sharded Queries</span>
                    <strong className="text-[11px] text-emerald-400">RLS Partition Key</strong>
                    <p className="text-[9.5px] text-slate-500 leading-normal">
                      PostgreSQL Row Level Security prevents any cross-tenant data leaks.
                    </p>
                  </div>

                </div>

                {/* DB Strategy details */}
                <div className="bg-slate-900/60 p-4 border border-slate-850 rounded-xl space-y-3">
                  <div className="text-[10px] font-bold text-slate-200 uppercase tracking-wide">Dynamic Tenant Isolation Tactics:</div>
                  <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1.5 leading-relaxed font-semibold">
                    <li><strong className="text-indigo-400 font-bold">Logically Sharded Storage:</strong> Database tables use a composite primary key index <code className="text-slate-300">(tenant_id, record_uuid)</code> matching Row Level Security policies.</li>
                    <li><strong className="text-indigo-400 font-bold">Custom Theme Hydration:</strong> Static site builds fetch branding files dynamically via edge-caches, updating styling, images, and markups instantly inside the user's browser.</li>
                    <li><strong className="text-indigo-400 font-bold">Unique API Quotas:</strong> Redis keeps strict individual API rate limits on a per-tenant token schema to prevent rogue affiliate scrapers from exhausting shared databases.</li>
                  </ul>
                </div>
              </div>

            </div>
          )}

          {/* C. Developer SDK Sandbox */}
          {activeTab === "developer_sdk_sandbox" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-sky-400" />
                  <span>Developer API Sandbox & Mock SDK Client</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Model year-5 developer onboarding. Select a partner tenant scope below, test dynamic SDK query calls, and review the live multi-tenant routing logs instantly.
                </p>
              </div>

              {/* Tenant Configurations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Active settings panel */}
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-4">
                  <span className="text-xs font-bold text-slate-200 font-mono uppercase block border-b border-slate-850 pb-1.5">
                    1. Sandbox Configurations
                  </span>

                  {/* Tenant select */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">Active Tenant Type:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {["white_label", "affiliate", "corporate"].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setSelectedTenantType(type as any);
                            setActivePartnerDomain(type === "white_label" ? "travel-unlimited.com" : type === "affiliate" ? "blogging-deals.net" : "acme-corp.org");
                          }}
                          className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                            selectedTenantType === type 
                              ? "bg-sky-950 border-sky-900/40 text-sky-400" 
                              : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-250"
                          }`}
                        >
                          {type.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Domain setup */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">Client Partner Domain:</span>
                    <input
                      type="text"
                      value={activePartnerDomain}
                      onChange={(e) => setActivePartnerDomain(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 font-mono text-xs text-sky-400 focus:outline-none focus:border-sky-700 font-bold"
                    />
                  </div>

                  {/* Performance parameters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">Simulated Client Load:</span>
                      <strong className="text-sm font-black text-slate-350 font-mono">{simulatedPartnerRps} r/s</strong>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">Simulated Latency:</span>
                      <strong className="text-sm font-black text-teal-450 font-mono">{apiResponseTime} ms</strong>
                    </div>
                  </div>
                </div>

                {/* Action panel */}
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono uppercase block border-b border-slate-850 pb-1.5">
                      2. Execute SDK Routines
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-semibold mt-2">
                      Fire triggers on simulated partner systems. This tests multi-tenant payload isolation parameters and returns database latency.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => triggerSandboxQuery("search_hotels")}
                      className="w-full flex items-center justify-between p-2 bg-slate-900 hover:bg-slate-850 text-xs font-mono text-slate-300 border border-slate-800 rounded-lg cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5"><Hotel className="w-4 h-4 text-sky-400" /> search_hotels()</span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      onClick={() => triggerSandboxQuery("book_train")}
                      className="w-full flex items-center justify-between p-2 bg-slate-900 hover:bg-slate-850 text-xs font-mono text-slate-300 border border-slate-800 rounded-lg cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5"><Train className="w-4 h-4 text-emerald-400" /> book_train()</span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      onClick={() => triggerSandboxQuery("calculate_insurance")}
                      className="w-full flex items-center justify-between p-2 bg-slate-900 hover:bg-slate-850 text-xs font-mono text-slate-300 border border-slate-800 rounded-lg cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-indigo-400" /> compute_insurance_quote()</span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Developer Logs */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                  <span className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    Ecosystem Gateway Router Trace
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono animate-pulse">Port 3000 Ingress</span>
                </div>

                <div className="space-y-1.5 font-mono text-[10.5px] max-h-[140px] overflow-y-auto">
                  {apiLogs.map((log, idx) => (
                    <div key={idx} className="p-2 bg-slate-900 rounded border border-slate-850/40 text-slate-400 font-semibold leading-normal">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* D. Partner Affiliate Marketplace */}
          {activeTab === "partner_portal" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>White-Label Admin Portal & Affiliate Marketplace</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enabling multi-tenant distribution requires distinct dashboards. White-label tenants require styling templates and margin controllers; affiliate publishers request commission ledgers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* White label settings */}
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-3.5">
                  <span className="text-xs font-bold text-indigo-400 font-mono uppercase block border-b border-slate-850 pb-1.5">
                    White-Label Theme & Markup Settings
                  </span>

                  <div className="space-y-3 text-xs leading-relaxed font-semibold text-slate-400">
                    <div>
                      <strong className="text-slate-200 block text-[11px]">Primary Domain:</strong>
                      <span className="text-sky-400 font-mono font-bold">travel.my-brand.com</span>
                    </div>
                    <div>
                      <strong className="text-slate-200 block text-[11px]">Dynamic Brand Colors:</strong>
                      <div className="flex gap-2 mt-1">
                        <span className="w-5 h-5 bg-teal-500 rounded border border-white/10" />
                        <span className="w-5 h-5 bg-slate-900 rounded border border-white/10" />
                        <span className="text-slate-500 text-[10px] font-mono">#0D9488, #0F172A</span>
                      </div>
                    </div>
                    <div>
                      <strong className="text-slate-200 block text-[11px]">Markup Override Margin:</strong>
                      <span className="font-mono text-emerald-400 font-bold">+12% on all aggregate flights & hotels</span>
                    </div>
                  </div>
                </div>

                {/* Affiliate settings */}
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-3.5">
                  <span className="text-xs font-bold text-emerald-450 font-mono uppercase block border-b border-slate-850 pb-1.5">
                    Affiliate Marketplace Settlements
                  </span>

                  <div className="space-y-3 text-xs leading-relaxed font-semibold text-slate-400">
                    <div>
                      <strong className="text-slate-200 block text-[11px]">Publisher Referral Link:</strong>
                      <span className="text-indigo-400 font-mono font-bold">flysmart.com/ref?publisher=travelblog</span>
                    </div>
                    <div>
                      <strong className="text-slate-200 block text-[11px]">Cookie Duration Threshold:</strong>
                      <span className="font-mono text-slate-300">30-Day attribution tracking</span>
                    </div>
                    <div>
                      <strong className="text-slate-200 block text-[11px]">Automatic payout rate:</strong>
                      <span className="font-mono text-emerald-400 font-bold">3% direct commission split upon transaction validation</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* E. Technical Specs */}
          {activeTab === "specs" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-amber-400" />
                  <span>Multi-Tenant Developer Schema Definitions</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Standardized database schemas utilized to track partner companies, active tenants, white-label configurations, and affiliate commission attributes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold block">Tenants PostgreSQL Schema</span>
                  <pre className="text-[10px] text-slate-400 font-mono bg-slate-900/80 p-2.5 rounded overflow-x-auto leading-normal">
                    {`CREATE TABLE tenant_configs (\n  tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  domain_name VARCHAR(255) UNIQUE NOT NULL,\n  tenant_type VARCHAR(50) DEFAULT 'white_label',\n  brand_name VARCHAR(100) NOT NULL,\n  custom_theme JSONB NOT NULL DEFAULT '{}',\n  markup_percentage DECIMAL(5, 2) DEFAULT 0.00,\n  status VARCHAR(20) DEFAULT 'active'\n);`}
                  </pre>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">Bookings Tenant isolation</span>
                  <pre className="text-[10px] text-slate-400 font-mono bg-slate-900/80 p-2.5 rounded overflow-x-auto leading-normal">
                    {`CREATE TABLE bookings (\n  booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  tenant_id UUID REFERENCES tenant_configs(tenant_id),\n  user_id UUID NOT NULL,\n  itinerary_payload JSONB NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP\n);\n\nALTER TABLE bookings ENABLE ROW LEVEL SECURITY;\nCREATE POLICY tenant_isolation_policy ON bookings \n  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::UUID);`}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side Info Panel / Evolution Phases */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Phase Meter */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block border-b border-slate-850 pb-2">
              Corporate Evolution Phase
            </span>

            <div className="text-center py-3">
              <span className="text-4xl font-black font-mono tracking-tight text-teal-400">
                PHASE 2
              </span>
              <span className="text-xs text-slate-400 block mt-1 uppercase font-bold tracking-wider">
                Multi-Modal Integration Active
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold">Total Roadmap Completion</span>
                <span className="font-mono text-teal-400 font-bold">45% Completed</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-teal-450 transition-all duration-500"
                  style={{ width: "45%" }}
                />
              </div>
            </div>
          </div>

          {/* Quick Checklist list */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3 pt-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block border-b border-slate-850 pb-2">
              Ecosystem Best Practices
            </span>

            <ul className="space-y-2.5 text-[11px] text-slate-400 leading-normal font-semibold">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>Expose API endpoints purely through developer-specific API keys wrapped in Redis cache checks.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>Enforce row-level security on all database targets to systematically avoid cross-tenant leaks.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>Provide SDK packages supporting major developer languages to shorten onboarding times.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
