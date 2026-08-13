import React, { useState, useMemo } from "react";
import { 
  ShieldAlert, 
  UserCheck, 
  Terminal, 
  Database, 
  Network, 
  Coins, 
  TrendingDown, 
  Zap, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Users, 
  Code2, 
  Briefcase, 
  Activity, 
  Sliders, 
  HelpCircle,
  Clock,
  MessageSquare,
  Award,
  Lock,
  RefreshCw,
  Search,
  Filter
} from "lucide-react";

// --- TYPES & INTERFACES ---
type EngineerId = "google" | "booking" | "cloudflare" | "stripe" | "netflix";
type RiskCategory = "scalability_spof" | "security_compliance" | "operational_lockin" | "data_architecture" | "dx_maintenance";
type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

interface Engineer {
  id: EngineerId;
  name: string;
  role: string;
  company: string;
  avatarColor: string;
  focusArea: string;
  bio: string;
}

interface ArchitecturalReview {
  id: string;
  category: RiskCategory;
  severity: SeverityLevel;
  title: string;
  engineerId: EngineerId;
  critique: string;
  bottleneck: string;
  proposedAlternative: string;
  actionableStep: string;
  isMitigated: boolean;
}

export default function PrincipalEngineeringReviewExplorer() {
  const [selectedEngineer, setSelectedEngineer] = useState<EngineerId | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<RiskCategory | "all">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Custom states for interactive mitigations
  const [mitigationsState, setMitigationsState] = useState<Record<string, boolean>>({
    "REV-101": false,
    "REV-102": false,
    "REV-103": false,
    "REV-104": false,
    "REV-105": false,
    "REV-106": false,
    "REV-107": false,
    "REV-108": false,
    "REV-109": false,
    "REV-110": false,
  });

  // Engineers Profiles
  const engineers: Engineer[] = useMemo(() => [
    {
      id: "google",
      name: "Dr. Sanjay Ghemawat",
      role: "Distinguished Principal Engineer",
      company: "Google Cloud Platform",
      avatarColor: "border-sky-500 text-sky-400 bg-sky-950/40",
      focusArea: "Global Scale, Spanner ACID consistency & ML GPU Pipelines",
      bio: "Focuses on distributed databases, globally replicated storage bounds, and making sure Spanner locks do not degrade under high-concurrent transaction queries."
    },
    {
      id: "booking",
      name: "Marten de Boer",
      role: "VP & Chief Reservation Architect",
      company: "Booking.com",
      avatarColor: "border-blue-500 text-blue-400 bg-blue-950/40",
      focusArea: "High-Frequency GDS Inventory Caching & Partner APIs",
      bio: "Oversees GDS inventory sync pipelines, real-time overbooking mitigation vectors, and managing high-volume partner API caching topologies."
    },
    {
      id: "cloudflare",
      name: "Elisa Vance",
      role: "Principal Edge & Security Architect",
      company: "Cloudflare",
      avatarColor: "border-orange-500 text-orange-400 bg-orange-950/40",
      focusArea: "DDoS mitigation, Edge WAF, CDN caching & Brotli payloads",
      bio: "Specializes in modern internet security perimeter design, global low-latency CDN setups, and optimization of egress bytes across peering connections."
    },
    {
      id: "stripe",
      name: "Julian Sterling",
      role: "Lead Billing & Ledger Architect",
      company: "Stripe",
      avatarColor: "border-indigo-500 text-indigo-400 bg-indigo-950/40",
      focusArea: "Multi-tenant payouts, Ledger reconciliation & Idempotency",
      bio: "Designs distributed payment ledgers, multi-partner Stripe Connect schemes, and strict split-commission payouts with cryptographically safe auditing."
    },
    {
      id: "netflix",
      name: "Amara Okonjo",
      role: "Director of Platform Engineering",
      company: "Netflix Core Services",
      avatarColor: "border-rose-500 text-rose-400 bg-rose-950/40",
      focusArea: "Service Mesh, Resiliency boundaries & Chaos Testing",
      bio: "Pioneers microservices orchestration, circuit-breaker fault boundaries, automated pod autoscaling feedback loops, and chaotic stress frameworks."
    }
  ], []);

  // Structural Review Database
  const reviewsData: ArchitecturalReview[] = useMemo(() => [
    {
      id: "REV-101",
      category: "scalability_spof",
      severity: "CRITICAL",
      title: "Synchronous GDS Flight Booking Cascades (SPOF)",
      engineerId: "booking",
      critique: "The core reservation engine blocks threads waiting for third-party Amadeus/Sabre SOAP APIs. If a partner GDS experiences transient latencies, downstream HTTP thread pools quickly exhaust, leading to complete cluster-wide cascading failure.",
      bottleneck: "Synchronous socket blocking in GDS bridge pods.",
      proposedAlternative: "Implement a deferred ticket booking pattern: acknowledge requests instantly with a TX-UUID, enqueue details in a durable queue (RabbitMQ/Kafka), and process GDS bookings asynchronously, returning results via Server-Sent Events or WebSockets.",
      actionableStep: "Onboard Apache Kafka event streams for decoupled asynchronous checkout pipelines.",
      isMitigated: false
    },
    {
      id: "REV-102",
      category: "security_compliance",
      severity: "CRITICAL",
      title: "Insecure Partner API Key Storage Policy",
      engineerId: "cloudflare",
      critique: "Multi-tenant credentials and downstream white-label API keys reside in the primary transactional Spanner database without application-level envelope encryption. Any unauthorized backup leakage compromises all customer corporate secrets.",
      bottleneck: "Raw database persistence of third-party integration secret tokens.",
      proposedAlternative: "Transition secrets to dedicated cloud keystores (Google Cloud Secret Manager or HashiCorp Vault). Use envelope encryption (AES-255-GCM) with automated 90-day key rotations via Cloud KMS.",
      actionableStep: "Bind Google Cloud Secret Manager APIs to the application startup credential loader.",
      isMitigated: false
    },
    {
      id: "REV-103",
      category: "data_architecture",
      severity: "HIGH",
      title: "Lack of Connection Pooling on High-Scale Cloud SQL Primary Instance",
      engineerId: "google",
      critique: "Each serverless pod starts a cold database connection upon transaction start. At peak loads of 1,200+ microservice container instances, the PostgreSQL transactional memory limit is exhausted by thread-allocation management alone, leading to database crashes.",
      bottleneck: "Primary PG thread-allocation limit exhausted.",
      proposedAlternative: "Enforce intermediate PG connection-pooling multiplexers (such as PgBouncer) to recycle active database sockets in milliseconds.",
      actionableStep: "Provision standard PgBouncer proxies and rewrite application configurations to use pooled socket pools.",
      isMitigated: false
    },
    {
      id: "REV-104",
      category: "operational_lockin",
      severity: "HIGH",
      title: "Egress Bandwidth Egress Fee Saturation",
      engineerId: "cloudflare",
      critique: "Serving un-cached dynamic profile asset uploads from primary Object Buckets across GCP margins generates severe bandwidth egress charges. Millions of concurrent passenger inquiries rapidly inflate monthly cloud bills.",
      bottleneck: "Standard Object Storage bucket hosting without edge proxying.",
      proposedAlternative: "Route all static file storage targets behind Cloudflare Tiered Caching with optimized peer connections (e.g., GCP Bandwidth Alliance to bring egress fees down to $0.00).",
      actionableStep: "Configure custom CDN asset proxy subdomains mapped to private GCS buckets.",
      isMitigated: false
    },
    {
      id: "REV-105",
      category: "scalability_spof",
      severity: "HIGH",
      title: "Monolithic Distributed Transaction Lock Contention",
      engineerId: "google",
      critique: "Enforcing atomic transactions across globally-sharded Spanner tables for non-financial operations (like partner experience listings) degrades global write performance. Remote regions encounter severe locking contention overheads.",
      bottleneck: "Two-Phase Commit (2PC) write latency over international wide-area networks.",
      proposedAlternative: "Transition to Saga Orchestration using event-driven eventual consistency patterns for multi-step reservations. Isolate immediate Spanner transaction locks exclusively to financial ledger balances.",
      actionableStep: "Refactor multi-step hotel/experience reservation workflows into Saga Event Choreographies.",
      isMitigated: false
    },
    {
      id: "REV-106",
      category: "operational_lockin",
      severity: "MEDIUM",
      title: "Proprietary Spanner DDL Vendor Lock-In",
      engineerId: "stripe",
      critique: "Heavily leaning on proprietary Google Spanner SQL extensions and custom schema hooks makes migrating or mirroring database ledger states onto alternative on-premise relational clusters or other public clouds almost impossible.",
      bottleneck: "Direct coupling with cloud-specific cloud-native database engines.",
      proposedAlternative: "Implement database access abstraction layers via ORMs with multi-driver fallback (e.g., Drizzle, Prisma, or custom Go SQL wrappers). Standardize database schemas to be strictly PostgreSQL-compatible.",
      actionableStep: "Abstract direct SQL calls into generic database repositories that handle database-specific queries dynamically.",
      isMitigated: false
    },
    {
      id: "REV-107",
      category: "security_compliance",
      severity: "HIGH",
      title: "PCI-DSS Boundaries Violations on Ledger Schema",
      engineerId: "stripe",
      critique: "Passenger card parameters occasionally leak into telemetry logging systems and un-encrypted database buffers on retry failure. This breaches standard compliance mandates, risking substantial merchant fines.",
      bottleneck: "Raw transaction data logged on service exception catch blocks.",
      proposedAlternative: "Strip PCI metadata at the edge gateway. Tokenize payments strictly using Stripe Elements, avoiding raw card capture in internal API payload states entirely.",
      actionableStep: "Audit and enforce strict data-scrubbing middleware across the microservice logging frameworks.",
      isMitigated: false
    },
    {
      id: "REV-108",
      category: "dx_maintenance",
      severity: "MEDIUM",
      title: "Microservice Schema Drift & Contract Breakdown",
      engineerId: "netflix",
      critique: "Separate development teams deploy services independently using JSON payloads without compile-time contract testing. Minor changes in downstream schemas unexpectedly break billing, causing critical billing sync failures.",
      bottleneck: "Loose coupling of JSON payloads over HTTP without API contract validation.",
      proposedAlternative: "Adopt gRPC with Protocol Buffers (protobuf) as the primary inter-service transport mechanism to enforce strict compile-time API contracts.",
      actionableStep: "Migrate internal microservice communication pathways from raw JSON-HTTP to strict gRPC schemas.",
      isMitigated: false
    },
    {
      id: "REV-109",
      category: "scalability_spof",
      severity: "MEDIUM",
      title: "Missing Circuit-Breakers on Partner Travel Networks",
      engineerId: "netflix",
      critique: "When localized rail or GDS partner nodes experience downtime, the FlySmart client dashboard continues to fire identical retry loops, causing self-inflicted DDoS states on partner gateways and slow UX for customers.",
      bottleneck: "Repeated synchronous query loops with no failure-window boundaries.",
      proposedAlternative: "Incorporate circuit-breakers (e.g., Polly, Hystrix, or Envoy sidecar filters) with exponential back-off and fallback stub responses.",
      actionableStep: "Configure Envoy proxy sidecars to intercept partner egress and handle circuit-breaking transitions.",
      isMitigated: false
    },
    {
      id: "REV-110",
      category: "dx_maintenance",
      severity: "MEDIUM",
      title: "Absence of Distributed Tracing in Asynchronous Flows",
      engineerId: "netflix",
      critique: "Asynchronous booking events move through multiple queues and workers without unified correlation IDs, leaving developers blind when trying to track down isolated transaction failures across microservices.",
      bottleneck: "Orphaned telemetry spans across decoupled message workers.",
      proposedAlternative: "Inject OpenTelemetry context metadata into message headers (e.g., W3C Trace Context standards) to trace user workflows from ingress to database commits.",
      actionableStep: "Onboard OpenTelemetry SDKs and instrument core event emitters to preserve correlation contexts.",
      isMitigated: false
    }
  ], []);

  // Compute live review data based on search and filters
  const processedReviews = useMemo(() => {
    return reviewsData.filter(rev => {
      const matchEngineer = selectedEngineer === "all" || rev.engineerId === selectedEngineer;
      const matchCategory = selectedCategory === "all" || rev.category === selectedCategory;
      const matchSearch = searchTerm === "" || 
        rev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.critique.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.bottleneck.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.proposedAlternative.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchEngineer && matchCategory && matchSearch;
    });
  }, [selectedEngineer, selectedCategory, searchTerm, reviewsData]);

  // Compute review statistics
  const reviewStats = useMemo(() => {
    const total = reviewsData.length;
    let mitigatedCount = 0;
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;

    reviewsData.forEach(rev => {
      const isCurrentlyMitigated = mitigationsState[rev.id];
      if (isCurrentlyMitigated) mitigatedCount++;
      if (rev.severity === "CRITICAL") criticalCount++;
      if (rev.severity === "HIGH") highCount++;
      if (rev.severity === "MEDIUM") mediumCount++;
    });

    const activeCritical = reviewsData.filter(r => r.severity === "CRITICAL" && !mitigationsState[r.id]).length;
    const activeHigh = reviewsData.filter(r => r.severity === "HIGH" && !mitigationsState[r.id]).length;

    return {
      total,
      mitigated: mitigatedCount,
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      activeCritical,
      activeHigh,
      healthRatio: total > 0 ? ((mitigatedCount / total) * 100) : 100
    };
  }, [reviewsData, mitigationsState]);

  // Toggle dynamic mitigation simulate state
  const handleToggleMitigation = (id: string) => {
    setMitigationsState(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleMitigateAll = () => {
    const allMitigated: Record<string, boolean> = {};
    reviewsData.forEach(r => {
      allMitigated[r.id] = true;
    });
    setMitigationsState(allMitigated);
  };

  const handleResetAll = () => {
    const noneMitigated: Record<string, boolean> = {};
    reviewsData.forEach(r => {
      noneMitigated[r.id] = false;
    });
    setMitigationsState(noneMitigated);
  };

  return (
    <div className="space-y-6" id="principal-engineering-review-explorer">
      
      {/* 1. Expert Review Header Segment */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-40 bg-rose-500/5 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-40 bg-indigo-500/5 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest font-black text-rose-400">
                ARCHITECTURE ADVISORY BOARD ACTIVE
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-100 mt-1 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5.5 h-5.5 text-rose-500 animate-pulse" />
              <span>Cross-Company Principal Engineering Review & Critique</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              An independent evaluation panel composed of Principal Architects from **Google, Booking.com, Cloudflare, Stripe**, and **Netflix**. Dive into structural bottlenecks, single points of failure (SPOFs), compliance liabilities, and toggle solutions to view immediate system risk mitigation.
            </p>
          </div>

          {/* Quick Stats Panel */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-850 p-3 rounded-xl shrink-0">
            <div className="text-left">
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">Active Critical Risks</span>
              <strong className="text-sm font-black text-rose-400 font-mono">
                {reviewStats.activeCritical} / {reviewStats.critical}
              </strong>
            </div>
            <div className="h-8 w-[1px] bg-slate-850" />
            <div className="text-left">
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">System Security Score</span>
              <strong className="text-sm font-black text-teal-400 font-mono">
                {reviewStats.healthRatio.toFixed(0)}% Clear
              </strong>
            </div>
            <div className="h-8 w-[1px] bg-slate-850" />
            <div className="text-left">
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">Board Consensus</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded font-mono bg-amber-950 text-amber-400 border border-amber-900/20">
                ACTION REQUIRED
              </span>
            </div>
          </div>
        </div>

        {/* Global Controls & Simulator stats */}
        <div className="flex items-center justify-between border-t border-slate-800/40 mt-4 pt-4 flex-wrap gap-3">
          <div className="flex gap-2">
            <button
              onClick={handleMitigateAll}
              className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-400 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Simulate All Mitigations Applied
            </button>
            <button
              onClick={handleResetAll}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Reset Review Parameters
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Total Critiques Rendered: <strong className="text-slate-300 font-bold">{reviewStats.total}</strong> | Mitigated: <strong className="text-emerald-400 font-bold">{reviewStats.mitigated}</strong>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Filters Toolbar */}
      <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </span>
          <input
            type="text"
            placeholder="Search critiques, bottlenecks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-300 focus:outline-none focus:border-slate-700 font-medium"
          />
        </div>

        {/* Filters and controls */}
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 border border-slate-850 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="bg-transparent border-none text-xs text-slate-300 focus:outline-none font-bold cursor-pointer"
            >
              <option value="all">All Risk Classes</option>
              <option value="scalability_spof">Scalability & SPOFs</option>
              <option value="security_compliance">Security & Compliance</option>
              <option value="operational_lockin">Operations & Lock-in</option>
              <option value="data_architecture">Data Architectures</option>
              <option value="dx_maintenance">DX & Maintenance</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 border border-slate-850 rounded-lg">
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Expert Panelist:</span>
            <select
              value={selectedEngineer}
              onChange={(e) => setSelectedEngineer(e.target.value as any)}
              className="bg-transparent border-none text-xs text-slate-300 focus:outline-none font-bold cursor-pointer"
            >
              <option value="all">All Advisory Engineers</option>
              <option value="google">Google Cloud PE</option>
              <option value="booking">Booking.com Reservation VP</option>
              <option value="cloudflare">Cloudflare Edge PE</option>
              <option value="stripe">Stripe Ledger Architect</option>
              <option value="netflix">Netflix Platform Director</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Panelists Bios Slider Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {engineers.map((eng) => {
          const isActive = selectedEngineer === "all" || selectedEngineer === eng.id;
          return (
            <button
              key={eng.id}
              onClick={() => setSelectedEngineer(eng.id)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                selectedEngineer === eng.id 
                  ? "bg-slate-900 border-indigo-500/40 shadow-xl ring-1 ring-indigo-500/20" 
                  : isActive
                    ? "bg-slate-950/60 border-slate-850 hover:bg-slate-900/60"
                    : "bg-slate-950/20 border-slate-900/40 opacity-40 hover:opacity-75"
              }`}
            >
              <div>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${eng.avatarColor}`}>
                  {eng.company}
                </span>
                <h4 className="text-xs font-black text-slate-200 mt-2">{eng.name}</h4>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">
                  {eng.role}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-900/60 w-full">
                <span className="text-[8.5px] font-mono text-slate-500 block uppercase">Focus domain</span>
                <strong className="text-[9px] text-slate-300 font-bold block mt-0.5 truncate">{eng.focusArea}</strong>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Main Critique Flow / Actionable Recommendation Cards */}
      <div className="space-y-4">
        {processedReviews.length === 0 ? (
          <div className="bg-slate-950/40 border border-slate-850 p-10 text-center rounded-2xl">
            <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300 mt-3">No active advisory critiques match your search filters</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Try adjusting your advisor select filters or clear the active query input in the search bar.
            </p>
          </div>
        ) : (
          processedReviews.map((rev) => {
            const author = engineers.find(e => e.id === rev.engineerId);
            const isCurrentlyMitigated = mitigationsState[rev.id];

            return (
              <div 
                key={rev.id}
                className={`border rounded-2xl p-6 transition-all relative overflow-hidden ${
                  isCurrentlyMitigated 
                    ? "bg-emerald-950/10 border-emerald-900/30 shadow-sm" 
                    : "bg-slate-900/40 border-slate-800"
                }`}
              >
                {/* Visual Status Indicator Background */}
                <div className={`absolute top-0 left-0 bottom-0 w-[4px] ${
                  isCurrentlyMitigated 
                    ? "bg-emerald-500" 
                    : rev.severity === "CRITICAL" ? "bg-rose-500 animate-pulse" :
                      rev.severity === "HIGH" ? "bg-amber-500" : "bg-sky-500"
                }`} />

                {/* Card Header segment */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-800/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${
                        isCurrentlyMitigated 
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-900/30" 
                          : rev.severity === "CRITICAL" ? "bg-rose-950 text-rose-450 border border-rose-900/30" :
                            rev.severity === "HIGH" ? "bg-amber-950 text-amber-450 border border-amber-900/30" :
                            "bg-sky-950 text-sky-400 border border-sky-900/30"
                      }`}>
                        {isCurrentlyMitigated ? "MITIGATED" : `${rev.severity} RISK`}
                      </span>

                      <span className="text-slate-600 font-mono text-xs">|</span>

                      <span className="text-[10px] font-mono text-slate-400 uppercase font-black">
                        {rev.category.replace("_", " & ")}
                      </span>

                      <span className="text-slate-600 font-mono text-xs">|</span>

                      <span className="text-[10px] font-mono text-slate-500">ID: {rev.id}</span>
                    </div>

                    <h3 className="text-sm font-black text-slate-100 mt-2 flex items-center gap-2">
                      {isCurrentlyMitigated ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className={`w-4 h-4 shrink-0 ${
                          rev.severity === "CRITICAL" ? "text-rose-400 animate-pulse" : "text-amber-400"
                        }`} />
                      )}
                      <span>{rev.title}</span>
                    </h3>
                  </div>

                  {/* Advisor Identifier */}
                  <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-850 px-3.5 py-1.5 rounded-xl shrink-0 h-fit">
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-550 block font-black uppercase">Critiqued By</span>
                      <strong className="text-[10.5px] text-slate-300 font-bold block">{author?.name}</strong>
                    </div>
                    <div className="h-5 w-[1px] bg-slate-800" />
                    <span className="text-[10px] font-mono font-bold text-slate-400">{author?.company}</span>
                  </div>
                </div>

                {/* Grid Split: Critique vs Actionable Mitigation */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
                  
                  {/* Left: The Critique & Analysis */}
                  <div className="lg:col-span-6 space-y-3.5 border-b lg:border-b-0 lg:border-r border-slate-800/50 pb-5 lg:pb-0 lg:pr-6 text-xs text-slate-350">
                    <div>
                      <strong className="text-[10px] font-mono text-slate-500 uppercase block font-black">Advisory Panel Critique:</strong>
                      <p className="leading-relaxed mt-1 font-semibold text-slate-400">
                        {rev.critique}
                      </p>
                    </div>

                    <div className="bg-slate-950/50 border border-slate-850 p-3 rounded-lg flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block font-black">Identified Bottleneck:</span>
                        <span className="font-mono text-[11px] text-slate-300 font-bold">{rev.bottleneck}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: The Mitigation Strategy & Action */}
                  <div className="lg:col-span-6 space-y-4 flex flex-col justify-between text-xs text-slate-350">
                    <div className="space-y-3">
                      <div>
                        <strong className="text-[10px] font-mono text-indigo-400 uppercase block font-black">Proposed Enterprise Alternative:</strong>
                        <p className="leading-relaxed mt-1 font-semibold text-slate-400">
                          {rev.proposedAlternative}
                        </p>
                      </div>

                      <div className="bg-emerald-950/20 border border-emerald-900/10 p-3 rounded-lg flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-mono text-emerald-400 uppercase block font-black">Direct Mitigation Action:</span>
                          <span className="font-mono text-[11.5px] text-slate-300 font-bold">{rev.actionableStep}</span>
                        </div>
                      </div>
                    </div>

                    {/* Simulation Toggle Action */}
                    <div className="pt-3 border-t border-slate-850/60 mt-2 flex items-center justify-between">
                      <div className="text-[10px] text-slate-500 font-medium leading-normal max-w-xs">
                        {isCurrentlyMitigated 
                          ? "This protocol is currently simulated as active. DOWNSTREAM SLA is safe." 
                          : "Protocol inactive. Downgrade threats or service failure bounds are currently un-mitigated."}
                      </div>

                      <button
                        onClick={() => handleToggleMitigation(rev.id)}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all border cursor-pointer ${
                          isCurrentlyMitigated 
                            ? "bg-emerald-950 border-emerald-900 text-emerald-400" 
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {isCurrentlyMitigated ? "Disable Protocol Mitigation" : "Mitigate Risk Protocol"}
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
