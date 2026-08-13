import React, { useState } from "react";
import { ARCHITECTURE_DOCS, ARCHITECTURE_NODES } from "./data/architectureDocs";
import { ArchitectureNode, DocTab } from "./types";
import ArchitectureDiagram from "./components/ArchitectureDiagram";
import CacheSimulator from "./components/CacheSimulator";
import ArchitectChat from "./components/ArchitectChat";
import DddExplorer from "./components/DddExplorer";
import MicroservicesExplorer from "./components/MicroservicesExplorer";
import DatabaseExplorer from "./components/DatabaseExplorer";
import SearchEngineExplorer from "./components/SearchEngineExplorer";
import IntelligenceExplorer from "./components/IntelligenceExplorer";
import AgentExplorer from "./components/AgentExplorer";
import EventExplorer from "./components/EventExplorer";
import PartnerExplorer from "./components/PartnerExplorer";
import IdentityExplorer from "./components/IdentityExplorer";
import SubscriptionExplorer from "./components/SubscriptionExplorer";
import TrafficExplorer from "./components/TrafficExplorer";
import NotificationExplorer from "./components/NotificationExplorer";
import MLPlatformExplorer from "./components/MLPlatformExplorer";
import MistakeFareExplorer from "./components/MistakeFareExplorer";
import PersonalizationExplorer from "./components/PersonalizationExplorer";
import AdminPlatformExplorer from "./components/AdminPlatformExplorer";
import EnterpriseAnalyticsPlatform from "./components/EnterpriseAnalyticsPlatform";
import ObservabilityExplorer from "./components/ObservabilityExplorer";
import DevOpsPlatformExplorer from "./components/DevOpsPlatformExplorer";
import ApiGatewayExplorer from "./components/ApiGatewayExplorer";
import FrontendPlatformExplorer from "./components/FrontendPlatformExplorer";
import GlobalInfrastructureExplorer from "./components/GlobalInfrastructureExplorer";
import SecurityArchitectureExplorer from "./components/SecurityArchitectureExplorer";
import CloudCostOptimizationExplorer from "./components/CloudCostOptimizationExplorer";
import PlatformEvolutionRoadmapExplorer from "./components/PlatformEvolutionRoadmapExplorer";
import PrincipalEngineeringReviewExplorer from "./components/PrincipalEngineeringReviewExplorer";
import TechnicalDesignDocumentExplorer from "./components/TechnicalDesignDocumentExplorer";
import SystemHealthDashboard from "./components/SystemHealthDashboard";
import FlyBetterLandingPage from "./components/FlyBetterLandingPage";
import { 
  Globe, 
  Map, 
  BookOpen, 
  BarChart3, 
  Bot, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Coins, 
  Layers,
  Sparkles,
  Info,
  Server,
  Database,
  Network,
  Shield,
  ShieldAlert,
  Milestone,
  Bell,
  Brain,
  AlertOctagon,
  Settings,
  Workflow,
  Layout,
  Smartphone
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"landing" | "health" | "diagram" | "specs" | "ddd" | "microservices" | "database" | "search" | "intelligence" | "agent" | "events" | "simulator" | "partners" | "identity" | "billing" | "traffic" | "notifications" | "mlplatform" | "mistakefare" | "personalization" | "admin" | "analytics" | "observability" | "devops" | "apigateway" | "frontend" | "infrastructure" | "security" | "cost" | "evolution" | "review" | "tdd_doc" | "chat">("landing");
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(ARCHITECTURE_NODES[0]);
  const [activeDocSection, setActiveDocSection] = useState<string>("overview");

  const currentDoc = ARCHITECTURE_DOCS.find(doc => doc.id === activeDocSection) || ARCHITECTURE_DOCS[0];

  const parseDocMarkdown = (text: string) => {
    // Elegant custom renderer for the documentation tabs
    return text.split("\n").map((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("###")) {
        return (
          <h3 key={index} className="text-base font-bold text-slate-100 mt-6 mb-3 border-l-2 border-sky-400 pl-3">
            {trimmed.replace("###", "").trim()}
          </h3>
        );
      }
      if (trimmed.startsWith("####")) {
        return (
          <h4 key={index} className="text-sm font-semibold text-sky-400 mt-4 mb-2">
            {trimmed.replace("####", "").trim()}
          </h4>
        );
      }
      if (trimmed.startsWith("`") && trimmed.endsWith("`") && trimmed.length > 2) {
        return (
          <pre key={index} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 my-4 font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
            {trimmed.replace(/`/g, "")}
          </pre>
        );
      }
      if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
        // Split bullet key and description for nice alignment
        const bulletText = trimmed.substring(1).trim();
        const firstBoldIndex = bulletText.indexOf(":");
        if (firstBoldIndex !== -1) {
          const boldPart = bulletText.substring(0, firstBoldIndex + 1);
          const normalPart = bulletText.substring(firstBoldIndex + 1);
          return (
            <li key={index} className="ml-5 list-disc text-slate-300 pl-1 my-2 leading-relaxed">
              <strong className="text-slate-100 font-semibold">{boldPart}</strong>
              <span className="text-slate-300">{normalPart}</span>
            </li>
          );
        }
        return (
          <li key={index} className="ml-5 list-disc text-slate-300 pl-1 my-2 leading-relaxed">
            {bulletText}
          </li>
        );
      }
      if (trimmed === "---") {
        return <hr key={index} className="border-slate-800/80 my-6" />;
      }
      if (trimmed === "" || line === "") {
        return <div key={index} className="h-2" />;
      }
      
      // Look for codeblocks
      if (trimmed.includes("```")) {
        return null; // Skip code fence markers in custom render
      }

      // Format bold markdown inline
      const boldRegex = /\*\*(.*?)\*\*/g;
      const htmlLine = trimmed.replace(boldRegex, '<strong class="font-bold text-slate-100">$1</strong>');
      return (
        <p key={index} className="text-slate-300 leading-relaxed text-sm my-3" dangerouslySetInnerHTML={{ __html: htmlLine }} />
      );
    });
  };

  if (activeTab === "landing") {
    return (
      <FlyBetterLandingPage 
        onSwitchToDeveloperTab={() => setActiveTab("diagram")} 
        onSwitchToHealthTab={() => setActiveTab("health")} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-300">
      
      {/* Visual Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center text-slate-100 shadow-md shadow-sky-950">
            <Globe className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-100">FLY<span className="text-sky-400">SMART</span></h1>
              <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                Enterprise Blueprint
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">
              Global Flight Intelligence Platform Architecture Portal
            </p>
          </div>
        </div>

        {/* System Health Indicators */}
        <div className="flex items-center gap-6 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <div>
              <div className="text-slate-500 leading-none">GLOBAL SLA</div>
              <div className="text-slate-200 mt-0.5">99.99% ACTIVE</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <div>
              <div className="text-slate-500 leading-none">LATENCY SLA</div>
              <div className="text-slate-200 mt-0.5">&lt; 15ms EDGE</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-purple-400" />
            <div>
              <div className="text-slate-500 leading-none">CACHE TARGET</div>
              <div className="text-slate-200 mt-0.5">&gt; 92.0% RATE</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Concept Introduction Banner */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-600/5 rounded-full filter blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 text-xs text-sky-400 font-mono font-bold tracking-wider uppercase">
                <Sparkles className="w-4 h-4" /> Chief Architect Blueprint
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">
                Designing the Future of Distributed Flight Intelligence
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Welcome to the official <strong>FlySmart Technical Blueprint Hub</strong>. FlySmart is a global meta-search and predictive routing engine designed for ultra-high concurrency, absolute consistency, and minimized provider query overheads. This portal maps our domain separation, caching strategy, and global scalability, backed by an interactive cost simulator and our AI consulting bot.
              </p>
            </div>
            
            {/* Quick Action Tabs */}
            <div className="shrink-0 flex flex-wrap md:flex-col gap-2">
              <button 
                onClick={() => {
                  setActiveTab("specs");
                  setActiveDocSection("caching");
                }}
                className="text-left text-xs bg-slate-950 border border-slate-800 hover:border-sky-500/50 p-3 rounded-xl transition-all w-[180px]"
              >
                <div className="font-semibold text-slate-200">How do we save $9M+?</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Explore Caching Strategy</div>
              </button>
              <button 
                onClick={() => {
                  setActiveTab("specs");
                  setActiveDocSection("overview");
                }}
                className="text-left text-xs bg-slate-950 border border-slate-800 hover:border-sky-500/50 p-3 rounded-xl transition-all w-[180px]"
              >
                <div className="font-semibold text-slate-200">Go vs Node Parser Benchmarks</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Domain Separation Doc</div>
              </button>
            </div>
          </div>
        </section>

        {/* Tab Navigation Controls */}
        <div className="border-b border-slate-800 flex flex-wrap gap-1 p-1 bg-slate-950 rounded-xl max-w-fit">
          <button
            onClick={() => setActiveTab("landing")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide bg-sky-950 border border-sky-500/30 text-sky-400 hover:text-white transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>0. End-User Redesign Landing Page</span>
          </button>

          <button
            onClick={() => setActiveTab("health")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === "health" 
                ? "bg-sky-950/80 border border-sky-500/40 text-sky-400 shadow-lg shadow-sky-500/10" 
                : "bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 hover:text-white"
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>0.1 System Health Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("diagram")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "diagram" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Map className="w-4 h-4" />
            <span>1. Interactive System Topology</span>
          </button>

          <button
            onClick={() => setActiveTab("specs")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "specs" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>2. Architectural Specifications</span>
          </button>

          <button
            onClick={() => setActiveTab("ddd")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "ddd" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. Domain Driven Design (DDD)</span>
          </button>

          <button
            onClick={() => setActiveTab("microservices")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "microservices" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Server className="w-4 h-4" />
            <span>4. Microservices Blueprint</span>
          </button>

          <button
            onClick={() => setActiveTab("database")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "database" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>5. Database Architecture Blueprint</span>
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "search" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>6. Flight Search Engine Blueprint</span>
          </button>

          <button
            onClick={() => setActiveTab("intelligence")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "intelligence" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>7. Flight Intelligence Engine</span>
          </button>

          <button
            onClick={() => setActiveTab("agent")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "agent" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>8. AI-powered Travel Agent</span>
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "events" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>9. Kafka Event-Driven Hub</span>
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "simulator" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>10. Cache Hit & Cost Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab("partners")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "partners" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Network className="w-4 h-4 text-emerald-400" />
            <span>11. Partner Integration Framework</span>
          </button>

          <button
            onClick={() => setActiveTab("identity")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "identity" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-4 h-4 text-sky-450" />
            <span>12. Enterprise Identity & Auth</span>
          </button>

          <button
            onClick={() => setActiveTab("billing")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "billing" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Coins className="w-4 h-4 text-emerald-450" />
            <span>13. Subscription & Billing</span>
          </button>

          <button
            onClick={() => setActiveTab("traffic")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "traffic" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-4 h-4 text-sky-450 animate-pulse" />
            <span>14. Global Traffic & Disaster</span>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "notifications" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bell className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>15. Global Notification Platform</span>
          </button>

          <button
            onClick={() => setActiveTab("mlplatform")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "mlplatform" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>16. Predictive Pricing ML Platform</span>
          </button>

          <button
            onClick={() => setActiveTab("mistakefare")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "mistakefare" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>17. Automated Mistake-Fare Platform</span>
          </button>

          <button
            onClick={() => setActiveTab("personalization")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "personalization" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>18. AI Personalization Engine</span>
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "admin" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings className="w-4 h-4 text-sky-400 animate-pulse" />
            <span>19. Internal Administration Platform</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "analytics" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>20. Enterprise Analytics Platform</span>
          </button>

          <button
            onClick={() => setActiveTab("observability")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "observability" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-4 h-4 text-rose-500" />
            <span>21. SRE Observability Center</span>
          </button>

          <button
            onClick={() => setActiveTab("devops")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "devops" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Workflow className="w-4 h-4 text-sky-400" />
            <span>22. DevOps Orchestration Platform</span>
          </button>

          <button
            onClick={() => setActiveTab("apigateway")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "apigateway" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Network className="w-4 h-4 text-sky-400" />
            <span>23. Edge API Gateway Control Center</span>
          </button>

          <button
            onClick={() => setActiveTab("frontend")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "frontend" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layout className="w-4 h-4 text-sky-400" />
            <span>24. Omni-Channel Frontend Platform</span>
          </button>

          <button
            onClick={() => setActiveTab("infrastructure")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "infrastructure" 
                ? "bg-slate-900 border border-slate-800 text-sky-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>25. Globally Distributed Infrastructure</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "security" 
                ? "bg-slate-900 border border-slate-800 text-rose-455" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-4 h-4 text-rose-500" />
            <span>26. Cybersecurity & Threat Shield</span>
          </button>

          <button
            onClick={() => setActiveTab("cost")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "cost" 
                ? "bg-slate-900 border border-slate-800 text-emerald-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>27. Cloud Cost Optimization</span>
          </button>

          <button
            onClick={() => setActiveTab("evolution")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "evolution" 
                ? "bg-slate-900 border border-slate-800 text-teal-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Milestone className="w-4 h-4 text-teal-400" />
            <span>28. 5-Year Platform Evolution</span>
          </button>

          <button
            onClick={() => setActiveTab("review")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "review" 
                ? "bg-slate-900 border border-slate-800 text-rose-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>29. Principal Engineering Review</span>
          </button>

          <button
            onClick={() => setActiveTab("tdd_doc")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "tdd_doc" 
                ? "bg-slate-900 border border-slate-800 text-indigo-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>30. Technical Design Document (TDD)</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "chat" 
                ? "bg-slate-900 border border-slate-800 text-sky-450" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>31. Consult AI Chief Architect</span>
          </button>
        </div>

        {/* Tab Contents */}
        <section className="min-h-[500px]">
          {activeTab === "health" && (
            <SystemHealthDashboard />
          )}

          {activeTab === "diagram" && (
            <div className="space-y-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-slate-200">Global Microservices Map & Grid Topology</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  FlySmart partitions transactions across global edges and caches, isolating stateful stream analytics from stateless parallel search routines. Toggle components on the map to inspect specifications.
                </p>
              </div>
              <ArchitectureDiagram 
                selectedNode={selectedNode} 
                onSelectNode={(node) => setSelectedNode(node)} 
              />
            </div>
          )}

          {activeTab === "specs" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Document Side Navigation Index */}
              <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-1 backdrop-blur-sm">
                <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-3 mb-3 pb-2 border-b border-slate-800">
                  Documentation Index
                </h4>
                {ARCHITECTURE_DOCS.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDocSection(doc.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      activeDocSection === doc.id
                        ? "bg-sky-950/40 border border-sky-500/20 text-sky-400"
                        : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
                    }`}
                  >
                    <span>{doc.title}</span>
                  </button>
                ))}
                
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-[11px] text-slate-500 leading-relaxed mt-4 flex gap-2">
                  <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <span>These blueprints depict production systems and do not contain simulated placeholders or simplified data pipelines.</span>
                </div>
              </div>

              {/* Renders Selected Document markdown */}
              <div className="lg:col-span-9 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl space-y-4">
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-slate-100">{currentDoc.title}</h3>
                  <p className="text-xs text-slate-400 italic mt-1">{currentDoc.subtitle}</p>
                </div>
                <div className="border-t border-slate-800/80 pt-4">
                  <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                    {parseDocMarkdown(currentDoc.content)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ddd" && (
            <DddExplorer />
          )}

          {activeTab === "microservices" && (
            <MicroservicesExplorer />
          )}

          {activeTab === "database" && (
            <DatabaseExplorer />
          )}

          {activeTab === "search" && (
            <SearchEngineExplorer />
          )}

          {activeTab === "intelligence" && (
            <IntelligenceExplorer />
          )}

          {activeTab === "agent" && (
            <AgentExplorer />
          )}

          {activeTab === "events" && (
            <EventExplorer />
          )}

          {activeTab === "simulator" && (
            <CacheSimulator />
          )}

          {activeTab === "partners" && (
            <PartnerExplorer />
          )}

          {activeTab === "identity" && (
            <IdentityExplorer />
          )}

          {activeTab === "billing" && (
            <SubscriptionExplorer />
          )}

          {activeTab === "traffic" && (
            <TrafficExplorer />
          )}

          {activeTab === "notifications" && (
            <NotificationExplorer />
          )}

          {activeTab === "mlplatform" && (
            <MLPlatformExplorer />
          )}

          {activeTab === "mistakefare" && (
            <MistakeFareExplorer />
          )}

          {activeTab === "personalization" && (
            <PersonalizationExplorer />
          )}

          {activeTab === "admin" && (
            <AdminPlatformExplorer />
          )}

          {activeTab === "analytics" && (
            <EnterpriseAnalyticsPlatform />
          )}

          {activeTab === "observability" && (
            <ObservabilityExplorer />
          )}

          {activeTab === "devops" && (
            <DevOpsPlatformExplorer />
          )}

          {activeTab === "apigateway" && (
            <ApiGatewayExplorer />
          )}

          {activeTab === "frontend" && (
            <FrontendPlatformExplorer />
          )}

          {activeTab === "infrastructure" && (
            <GlobalInfrastructureExplorer />
          )}

          {activeTab === "security" && (
            <SecurityArchitectureExplorer />
          )}

          {activeTab === "cost" && (
            <CloudCostOptimizationExplorer />
          )}

          {activeTab === "evolution" && (
            <PlatformEvolutionRoadmapExplorer />
          )}

          {activeTab === "review" && (
            <PrincipalEngineeringReviewExplorer />
          )}

          {activeTab === "tdd_doc" && (
            <TechnicalDesignDocumentExplorer />
          )}

          {activeTab === "chat" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8">
                <ArchitectChat />
              </div>
              <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-sm text-xs">
                <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-sky-400" />
                  <span>Architect Agent Overview</span>
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  This conversation uses a server-side agent powered by <strong>Gemini 3.5 Flash</strong>. It is instantiated with specialized system parameters containing FlySmart's complete structural configurations.
                </p>
                <div className="space-y-2.5">
                  <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/80">
                    <div className="font-semibold text-slate-300">Supported Scenarios:</div>
                    <ul className="list-disc pl-4 text-slate-400 space-y-1 text-[11px] mt-1.5 leading-relaxed">
                      <li>Kafka log format & data pipelines.</li>
                      <li>Flink outlier standard deviations.</li>
                      <li>Active-active BGP georouting failover step-by-step.</li>
                      <li>Go goroutine memory layout comparisons.</li>
                    </ul>
                  </div>
                  <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/80">
                    <div className="font-semibold text-slate-300">Paid API Configuration:</div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Key storage is proxied on the container backend, keeping secrets isolated from client script exposure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-800 bg-slate-950/40 py-6 text-center text-[10px] font-mono text-slate-500 uppercase tracking-widest shrink-0 mt-12">
        <span>© {new Date().getFullYear()} FlySmart Technologies Inc. • Engineered with Global Redundancy • Confidential Blueprint v2.8</span>
      </footer>
    </div>
  );
}
