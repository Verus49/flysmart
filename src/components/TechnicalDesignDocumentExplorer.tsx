import React, { useState, useMemo } from "react";
import { 
  FileText, 
  Search, 
  Printer, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  ListOrdered, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Network, 
  Flame, 
  Layers, 
  GitBranch, 
  Activity, 
  TrendingUp, 
  Milestone, 
  Terminal, 
  ChevronRight,
  Info
} from "lucide-react";

// --- TYPES ---
type ChapterId = 
  | "executive_summary" 
  | "requirements" 
  | "domain_model" 
  | "system_architecture" 
  | "database_architecture" 
  | "event_api_standards" 
  | "security_model" 
  | "infrastructure" 
  | "ai_ml_architecture" 
  | "observability_dr" 
  | "devops_testing" 
  | "cost_scalability" 
  | "evolution_roadmap" 
  | "risks_questions" 
  | "implementation_phases";

interface Chapter {
  id: ChapterId;
  number: string;
  title: string;
  shortTitle: string;
  icon: React.ReactNode;
}

export default function TechnicalDesignDocumentExplorer() {
  const [activeChapter, setActiveChapter] = useState<ChapterId>("executive_summary");
  const [searchTerm, setSearchTerm] = useState("");
  const [printMode, setPrintMode] = useState(false);

  const chapters: Chapter[] = useMemo(() => [
    {
      id: "executive_summary",
      number: "1.0",
      title: "Executive Summary & Business Goals",
      shortTitle: "Exec Summary",
      icon: <BookOpen className="w-4 h-4 text-sky-400" />
    },
    {
      id: "requirements",
      number: "2.0",
      title: "Functional & Non-Functional Requirements",
      shortTitle: "Requirements",
      icon: <ListOrdered className="w-4 h-4 text-sky-400" />
    },
    {
      id: "domain_model",
      number: "3.0",
      title: "Domain-Driven Design (DDD) & Service Catalog",
      shortTitle: "Domain Model",
      icon: <Layers className="w-4 h-4 text-indigo-400" />
    },
    {
      id: "system_architecture",
      number: "4.0",
      title: "System Topology & Microservices Architecture",
      shortTitle: "System Topology",
      icon: <Cpu className="w-4 h-4 text-indigo-400" />
    },
    {
      id: "database_architecture",
      number: "5.0",
      title: "Database Architecture & Sharding Schema",
      shortTitle: "Database Design",
      icon: <Database className="w-4 h-4 text-emerald-400" />
    },
    {
      id: "event_api_standards",
      number: "6.0",
      title: "Event Catalog & API Design Standards",
      shortTitle: "Events & APIs",
      icon: <Terminal className="w-4 h-4 text-emerald-450" />
    },
    {
      id: "security_model",
      number: "7.0",
      title: "Zero-Trust Security & Regulatory Compliance",
      shortTitle: "Security Model",
      icon: <ShieldCheck className="w-4 h-4 text-rose-400" />
    },
    {
      id: "infrastructure",
      number: "8.0",
      title: "Global Cloud Infrastructure & Edge Network",
      shortTitle: "Infrastructure",
      icon: <Network className="w-4 h-4 text-sky-450" />
    },
    {
      id: "ai_ml_architecture",
      number: "9.0",
      title: "AI, ML Platform & Personalization Engine",
      shortTitle: "AI & ML Engine",
      icon: <Info className="w-4 h-4 text-teal-400" />
    },
    {
      id: "observability_dr",
      number: "10.0",
      title: "Telemetry, Observability & Disaster Recovery",
      shortTitle: "Observability & DR",
      icon: <Activity className="w-4 h-4 text-rose-500" />
    },
    {
      id: "devops_testing",
      number: "11.0",
      title: "CI/CD GitOps Pipeline & Testing Strategy",
      shortTitle: "CI/CD & DevOps",
      icon: <GitBranch className="w-4 h-4 text-purple-400" />
    },
    {
      id: "cost_scalability",
      number: "12.0",
      title: "Cloud Cost Optimization & Scalability Plan",
      shortTitle: "Cost & Scaling",
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />
    },
    {
      id: "evolution_roadmap",
      number: "13.0",
      title: "5-Year Ecosystem Evolution & Roadmap",
      shortTitle: "5-Year Roadmap",
      icon: <Milestone className="w-4 h-4 text-teal-400" />
    },
    {
      id: "risks_questions",
      number: "14.0",
      title: "Engineering Risks, Mitigations & Open Questions",
      shortTitle: "Risks & Questions",
      icon: <Flame className="w-4 h-4 text-amber-500" />
    },
    {
      id: "implementation_phases",
      number: "15.0",
      title: "Recommended Phased Implementation Strategy",
      shortTitle: "Phased Strategy",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    }
  ], []);

  // Filter sections by search term if active
  const isSearchMatch = (text: string) => {
    if (!searchTerm) return true;
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  };

  return (
    <div className="space-y-6 animate-fade-in" id="technical-design-document-explorer">
      
      {/* 1. Page Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-40 bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-40 bg-teal-500/5 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest font-black text-indigo-450">
                Specification Blueprint v1.0.0
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-100 mt-1 tracking-tight flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-indigo-400 animate-pulse" />
              <span>Technical Design Document (TDD)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
              Authoritative, enterprise-grade engineering specification for the **Flight Intelligence Platform**. Formatted for presentation to CTOs, engineering directors, and investors as the master blueprint for production rollout.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setPrintMode(!printMode)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                printMode 
                  ? "bg-indigo-950 border border-indigo-500/40 text-indigo-400" 
                  : "bg-slate-950 border border-slate-850 text-slate-350 hover:text-slate-100"
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>{printMode ? "Toggle Chapter View" : "Continuous Scroll"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Search & Navigation indicators */}
        <div className="flex items-center justify-between pt-4 gap-4 flex-wrap">
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-500" />
            </span>
            <input
              type="text"
              placeholder="Search specifications, schema attributes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-300 focus:outline-none focus:border-slate-700 font-medium"
            />
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Document Sign-off Status: <strong className="text-emerald-400 font-bold">APPROVED BY BOARD</strong>
          </div>
        </div>
      </div>

      {/* 2. Interactive Document Shell */}
      {printMode ? (
        /* Continuous Document Scroll View for print / full reading */
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-12 max-h-[800px] overflow-y-auto font-sans leading-relaxed text-slate-300">
          <div className="text-center border-b border-slate-850 pb-8 space-y-2">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-widest">Flight Intelligence Platform</span>
            <h2 className="text-2xl font-black text-slate-100">TECHNICAL SYSTEM DESIGN BLUEPRINT</h2>
            <p className="text-xs text-slate-500">Confidential | Enterprise Distribution Allowed</p>
          </div>

          {chapters.map((chap) => (
            <div key={chap.id} className="space-y-4 pt-4 border-t border-slate-850/60 first:border-0 first:pt-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-slate-950 px-2.5 py-1 border border-slate-850 rounded text-slate-400">{chap.number}</span>
                <h3 className="text-base font-black text-slate-100">{chap.title}</h3>
              </div>
              <div className="pl-2">
                <ChapterContent id={chap.id} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Standard Dual-Pane Tabbed Navigation View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Navigation Track */}
          <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-1.5 max-h-[600px] overflow-y-auto">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block px-3 mb-3 border-b border-slate-850 pb-2">
              TDD Table of Contents
            </span>

            {chapters.map((chap) => {
              const isSelected = activeChapter === chap.id;
              return (
                <button
                  key={chap.id}
                  onClick={() => {
                    setActiveChapter(chap.id);
                    // scroll parent container slightly to draw focus
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected 
                      ? "bg-slate-900 border border-slate-800 text-indigo-400 font-black shadow-lg" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-mono text-[10px] text-slate-500">{chap.number}</span>
                    <span className="truncate">{chap.shortTitle}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-400" : "text-slate-600"}`} />
                </button>
              );
            })}
          </div>

          {/* Right Active Specification Panel */}
          <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm min-h-[500px]">
            {/* Header of Active specification */}
            <div className="border-b border-slate-800/80 pb-5 mb-6">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <span>Flight Intelligence Platform TDD</span>
                <span>•</span>
                <span>Section {chapters.find(c => c.id === activeChapter)?.number}</span>
              </div>
              <h2 className="text-lg font-black text-slate-100 mt-1 flex items-center gap-2">
                {chapters.find(c => c.id === activeChapter)?.icon}
                <span>{chapters.find(c => c.id === activeChapter)?.title}</span>
              </h2>
            </div>

            {/* Spec Body Render */}
            <div className="font-sans leading-relaxed text-xs text-slate-350 space-y-6">
              <ChapterContent id={activeChapter} />
            </div>

            {/* Micro navigation footer */}
            <div className="border-t border-slate-850 mt-8 pt-4 flex justify-between items-center text-[10.5px]">
              <span className="text-slate-500 font-semibold">Author: Architecture Advisory Board</span>
              <button
                onClick={() => {
                  const currentIdx = chapters.findIndex(c => c.id === activeChapter);
                  const nextIdx = (currentIdx + 1) % chapters.length;
                  setActiveChapter(chapters[nextIdx].id);
                }}
                className="flex items-center gap-1.5 text-indigo-400 font-bold hover:text-indigo-300 transition-all cursor-pointer"
              >
                <span>Navigate Next Chapter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

// --- CHAPTER CONTENT RENDERING ENGINE ---
function ChapterContent({ id }: { id: ChapterId }) {
  switch (id) {
    case "executive_summary":
      return (
        <div className="space-y-4">
          <p className="text-xs leading-relaxed">
            The **Flight Intelligence Platform** is a highly resilient, globally distributed enterprise system designed to optimize and route airline flight reservations, compute live pricing corrections, track mistake-fares, and manage multi-tenant partner distribution pathways under high-concurrency peak SLA demands.
          </p>
          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2">
            <strong className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block font-black">Core Business Objectives</strong>
            <ul className="list-disc list-inside space-y-1.5 font-semibold text-slate-400">
              <li>Minimize aggregate third-party flight search execution latency down to **&lt; 35ms avg**.</li>
              <li>Consolidate distinct multi-modal travel vectors (**Hotels, Cars, Trains, Cruises**) onto a single transaction graph.</li>
              <li>Settle multi-tenant commission splits and white-label markups with real-time distributed ledger reconciliation.</li>
              <li>Integrate serverless AI agent co-pilots and quantize machine learning pipelines to maintain tight budget constraints.</li>
            </ul>
          </div>
        </div>
      );

    case "requirements":
      return (
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-black block">Core Functional Requirements (FR)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
              <div className="bg-slate-950/30 border border-slate-850 p-3 rounded-lg">
                <strong className="text-slate-200 block text-[11px]">FR-101: Multi-Modal Search</strong>
                <span className="text-slate-400 leading-normal block mt-1 font-semibold">Ability to chain regional high-speed rail carriers with standard flight carrier codes seamlessly.</span>
              </div>
              <div className="bg-slate-950/30 border border-slate-850 p-3 rounded-lg">
                <strong className="text-slate-200 block text-[11px]">FR-102: Margin Overrides</strong>
                <span className="text-slate-400 leading-normal block mt-1 font-semibold">Enable dynamic white-label configuration of ticket pricing overlays matching custom tenant rules.</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-900/60">
            <span className="text-[10px] font-mono text-teal-400 uppercase font-black block">Core Non-Functional Requirements (NFR)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
              <div className="bg-slate-950/30 border border-slate-850 p-3 rounded-lg">
                <strong className="text-slate-200 block text-[11px]">NFR-201: Peak Elastic Scalability</strong>
                <span className="text-slate-400 leading-normal block mt-1 font-semibold">Maintain a 99.99% availability footprint under high traffic triggers of up to 120,000 queries/min.</span>
              </div>
              <div className="bg-slate-950/30 border border-slate-850 p-3 rounded-lg">
                <strong className="text-slate-200 block text-[11px]">NFR-202: Zero-Leak Isolation</strong>
                <span className="text-slate-400 leading-normal block mt-1 font-semibold">PostgreSQL Row-Level Security policies ensure complete cryptographic isolation between tenants.</span>
              </div>
            </div>
          </div>
        </div>
      );

    case "domain_model":
      return (
        <div className="space-y-4">
          <p className="font-semibold text-slate-400">
            The platform's business rules are modeled using **Domain-Driven Design (DDD)** concepts, separating aggregates, entities, and value objects cleanly across explicit service bounds.
          </p>

          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[10.5px] leading-relaxed space-y-3">
            <span className="text-[9px] text-slate-500 uppercase block font-black border-b border-slate-850 pb-1">Explicit Domain Boundaries</span>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <strong className="text-sky-400 font-bold block">1. Inventory Domain</strong>
                <span>Manages seat mappings, cabin states, and GDS SOAP pipelines.</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <strong className="text-indigo-400 font-bold block">2. Settlement Domain</strong>
                <span>Tracks ledger split records, Stripe payout hooks, and affiliate logs.</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <strong className="text-teal-400 font-bold block">3. Personalization Domain</strong>
                <span>Hosts Redis vector storage matching user travel intent records.</span>
              </div>
            </div>
          </div>
        </div>
      );

    case "system_architecture":
      return (
        <div className="space-y-4">
          <p className="font-semibold text-slate-400">
            The microservices topology utilizes a decoupled, event-driven pattern communicating over high-throughput messaging brokers. External ingress is secured and aggregated via Envoy API Gateways.
          </p>
          <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-xl font-mono text-[11px] leading-normal space-y-2">
            <span className="text-[9px] text-slate-500 uppercase block font-black">Service Grid Topology Map</span>
            <div className="text-slate-450">
              [Internet Client Ingress] <span className="text-slate-600">--&gt;</span> [Cloudflare CDN Proxy] <span className="text-slate-600">--&gt;</span> [Envoy API Gateway Grid] <br />
              <div className="pl-6 text-indigo-400 border-l border-slate-800 mt-1">
                ├── [Search & Inventory microservice] (Stateless, 100% Spot instances)<br />
                ├── [Distributed Booking Ledger engine] (ACID guaranteed on Spanner)<br />
                └── [AI Co-pilot worker daemon] (Knative serverless instances, auto-scale-to-zero)
              </div>
            </div>
          </div>
        </div>
      );

    case "database_architecture":
      return (
        <div className="space-y-4">
          <p className="font-semibold text-slate-400">
            The data storage strategy pairs **Google Spanner** (for global transactional ledger integrity) with sharded **PostgreSQL/Cloud SQL** databases using PgBouncer for horizontal connection recycling.
          </p>

          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3 font-mono text-[10px] leading-relaxed">
            <span className="text-[9px] text-slate-500 uppercase block font-black border-b border-slate-850 pb-1">Spanner Interleaved schema</span>
            <pre className="text-slate-400 bg-slate-900/60 p-2 rounded">
              {`CREATE TABLE tenant_accounts (\n  tenant_id STRING(64) NOT NULL,\n  brand_name STRING(128),\n  markup_percentage NUMERIC\n) PRIMARY KEY (tenant_id);\n\nCREATE TABLE bookings (\n  tenant_id STRING(64) NOT NULL,\n  booking_id STRING(64) NOT NULL,\n  itinerary_payload BYTES(MAX)\n) PRIMARY KEY (tenant_id, booking_id),\nINTERLEAVE IN PARENT tenant_accounts ON DELETE CASCADE;`}
            </pre>
          </div>
        </div>
      );

    case "event_api_standards":
      return (
        <div className="space-y-4">
          <p className="font-semibold text-slate-400">
            API patterns enforce standard REST frameworks for external clients and highly optimized gRPC over HTTP/2 protocol interfaces for low-latency inter-service microservice boundaries.
          </p>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 font-mono text-[10.5px]">
            <span className="text-[9px] text-slate-500 uppercase block font-black border-b border-slate-850 pb-1">gRPC Protobuf payload Contract</span>
            <pre className="text-sky-400 bg-slate-900/60 p-2.5 rounded">
              {`syntax = "proto3";\n\nmessage FlightSearchRequest {\n  string origin_code = 1;\n  string destination_code = 2;\n  string departure_date = 3;\n  int32 passenger_count = 4;\n}\n\nservice FlightSearchService {\n  rpc SearchInventory(FlightSearchRequest) returns (stream FlightItinerary);\n}`}
            </pre>
          </div>
        </div>
      );

    case "security_model":
      return (
        <div className="space-y-4">
          <p className="font-semibold text-slate-400">
            Enforcing Zero-Trust isolation parameters. All network interfaces verify mutual TLS (mTLS) identities, and storage volumes utilize customer-managed keys (KMS) for full envelope encryption.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl">
              <strong className="text-xs text-slate-200 block border-b border-slate-850 pb-1 font-mono uppercase">mTLS Workload Identity</strong>
              <span className="text-slate-400 leading-normal block mt-1.5 font-semibold">SPIFFE/Spire identities enforce strict access tokens across individual pod communication channels.</span>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl">
              <strong className="text-xs text-slate-200 block border-b border-slate-850 pb-1 font-mono uppercase">PCI Compliance Boundaries</strong>
              <span className="text-slate-400 leading-normal block mt-1.5 font-semibold">Strict segregation of payment fields using Stripe tokenizer elements prevents raw credit-card leaks.</span>
            </div>
          </div>
        </div>
      );

    case "infrastructure":
      return (
        <div className="space-y-4">
          <p className="font-semibold text-slate-400">
            The platform is deployed globally inside Google Kubernetes Engine (GKE) clusters across multiple primary regions, leveraging Anycast DNS to minimize round-trip latencies.
          </p>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 font-mono text-[11px] leading-relaxed">
            <span className="text-[9px] text-slate-500 uppercase block font-black">Distributed Region Allocations</span>
            <div className="flex justify-between border-b border-slate-850 pb-1 font-semibold text-slate-400">
              <span>Europe Gateway Grid</span>
              <span className="text-sky-400">europe-west3 (Frankfurt)</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-1 font-semibold text-slate-400">
              <span>US East Core clusters</span>
              <span className="text-sky-400">us-east4 (N. Virginia)</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-400">
              <span>Asia Gateway Grid</span>
              <span className="text-sky-400">asia-east1 (Taiwan)</span>
            </div>
          </div>
        </div>
      );

    case "ai_ml_architecture":
      return (
        <div className="space-y-4">
          <p className="font-semibold text-slate-400">
            To prevent GPU over-provisioning fees, the machine learning inference engine uses standard quantized FP16 to INT8 models hosted on serverless GPUs, coupled with Redis semantic caches.
          </p>

          <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-2">
            <strong className="text-xs text-slate-200 block border-b border-slate-850 pb-1.5 font-mono uppercase">Inference Cache Engine</strong>
            <p className="text-slate-400 leading-relaxed font-semibold">
              We convert incoming natural language prompts into high-density vector embeddings, scanning standard Redis database caches first. This immediately resolves recurring search patterns, avoiding redundant LLM processing runs.
            </p>
          </div>
        </div>
      );

    case "observability_dr":
      return (
        <div className="space-y-4">
          <p className="font-semibold text-slate-400">
            Observability is managed using OpenTelemetry standards, mapping trace parameters continuously to trace transaction workflows from ingress gateways down to regional transactional commits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-400 font-semibold">
            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-1">
              <strong className="text-xs text-rose-400 font-mono block">DISASTER RECOVERY (RTO/RPO)</strong>
              <span>Target RTO (Recovery Time) is &lt; 5 minutes; RPO (Data Loss window) is 0 seconds via global Spanner replicas.</span>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-1">
              <strong className="text-xs text-sky-400 font-mono block">DISTRIBUTED TELEMETRY SPANS</strong>
              <span>W3C Trace Context standards preserve correlation IDs across decoupled event-queues and microservices.</span>
            </div>
          </div>
        </div>
      );

    case "devops_testing":
      return (
        <div className="space-y-4">
          <p className="font-semibold text-slate-400">
            Applying strict GitOps deployment mechanisms using ArgoCD. Declarative cluster states are managed inside security-hardened Git repositories, preventing manual drift.
          </p>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 font-mono text-[10px] leading-relaxed">
            <span className="text-[9px] text-slate-500 uppercase block font-black border-b border-slate-850 pb-1">GitOps Pipeline stages</span>
            <div className="text-slate-400 font-semibold space-y-1.5">
              <div>1. Commit Code <span className="text-slate-600">--&gt;</span> GitHub Actions compiles binaries and runs unit suites.</div>
              <div>2. Container Push <span className="text-slate-600">--&gt;</span> Build secure, lightweight OCI images checked by trivy vulnerability scanning.</div>
              <div>3. State Sync <span className="text-slate-600">--&gt;</span> ArgoCD identifies differences and deploys manifests onto GKE target clusters.</div>
            </div>
          </div>
        </div>
      );

    case "cost_scalability":
      return (
        <div className="space-y-4">
          <p className="font-semibold text-slate-400">
            Targeting the lowest possible operational costs. We enforce Spot VMs for stateless queue consumers and autoscale to zero on regional serverless tasks during off-peak hours (2 AM - 6 AM).
          </p>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2 text-slate-400 font-semibold">
            <div className="flex justify-between border-b border-slate-850 pb-1">
              <span>Spot Instance vm Discount</span>
              <span className="text-emerald-400 font-mono font-bold">-72% relative to On-Demand</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-1">
              <span>Brotli Payload transit reduction</span>
              <span className="text-emerald-400 font-mono font-bold">-25% bandwidth byte space</span>
            </div>
            <div className="flex justify-between">
              <span>AVIF next-gen media compression</span>
              <span className="text-emerald-400 font-mono font-bold">-60% media storage footprint</span>
            </div>
          </div>
        </div>
      );

    case "evolution_roadmap":
      return (
        <div className="space-y-4">
          <p className="font-semibold text-slate-400">
            Our 5-year evolution map transitions the core Flight platform from a localized, single-tenant system into an interconnected multi-tenant travel marketplace.
          </p>

          <div className="relative border-l border-indigo-500/30 pl-5 space-y-4 ml-2 text-xs text-slate-400 font-semibold">
            <div className="relative">
              <span className="absolute -left-7.5 top-0.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-900" />
              <strong className="text-slate-200 block text-[11px]">Year 1-2: Core Verticals</strong>
              <span>Integrate Hotels, Car Rentals, Railways, and high-frequency local cruise lines onto a shared inventory graph.</span>
            </div>
            <div className="relative">
              <span className="absolute -left-7.5 top-0.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-900" />
              <strong className="text-slate-200 block text-[11px]">Year 3-4: Value & Enterprise</strong>
              <span>Onboard corporate travel policies, dynamic travel insurance, multi-tenant white-label APIs, and split-commission settlement engines.</span>
            </div>
            <div className="relative">
              <span className="absolute -left-7.5 top-0.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-900" />
              <strong className="text-slate-200 block text-[11px]">Year 5: Global Developer SDKs</strong>
              <span>Release public developer portals, rate-limited subscription keys, and robust SDK packages across Node, Python, and Go.</span>
            </div>
          </div>
        </div>
      );

    case "risks_questions":
      return (
        <div className="space-y-4">
          <p className="font-semibold text-slate-400">
            Identify critical engineering risks across microservices boundaries, transaction locks, and GDS SOAP API failures.
          </p>

          <div className="space-y-3">
            <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5">
              <span className="text-[10px] bg-rose-950 text-rose-450 border border-rose-900/30 px-2 py-0.5 rounded font-mono font-bold shrink-0">CRITICAL</span>
              <div>
                <strong className="text-slate-200 block text-[11px] font-mono">Synchronous GDS thread blockages (SPOF)</strong>
                <span className="text-slate-450 leading-relaxed block mt-0.5">If Amadeus or Sabre APIs block, client sockets saturate. We must enforce asynchronous message queuing.</span>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5">
              <span className="text-[10px] bg-amber-950 text-amber-450 border border-amber-900/30 px-2 py-0.5 rounded font-mono font-bold shrink-0">HIGH</span>
              <div>
                <strong className="text-slate-200 block text-[11px] font-mono">Unpooled DB connection spikes</strong>
                <span className="text-slate-450 leading-relaxed block mt-0.5">At high peak scales, unpooled serverless container starts risk crashing primary DB schemas. Enforcing PgBouncer is required.</span>
              </div>
            </div>
          </div>
        </div>
      );

    case "implementation_phases":
      return (
        <div className="space-y-4">
          <p className="font-semibold text-slate-400">
            Our recommended rollout plan is organized into progressive, low-risk implementation phases to ensure continuous system SLA stability.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed font-semibold text-slate-400">
            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-1.5">
              <strong className="text-sky-400 font-bold block border-b border-slate-850 pb-1">Phase 1: Foundation (M1-M3)</strong>
              <span>Establish GKE container regions, Spanner multi-sharding schemas, and PgBouncer connection multiplexers.</span>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-1.5">
              <strong className="text-indigo-400 font-bold block border-b border-slate-850 pb-1">Phase 2: Decoupling (M4-M6)</strong>
              <span>Deploy Apache Kafka message queues, configure stateless workers, and isolate PCI logging variables strictly.</span>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-1.5">
              <strong className="text-teal-400 font-bold block border-b border-slate-850 pb-1">Phase 3: Ecosystem (M7-M12)</strong>
              <span>Deploy white-label theme configuration middleware, and host INT8 quantized neural models for smart recommendations.</span>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
