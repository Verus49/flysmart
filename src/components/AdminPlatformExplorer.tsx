import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  CreditCard, 
  RotateCcw, 
  LifeBuoy, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Radio, 
  Search, 
  Brain, 
  BellRing, 
  FileText, 
  Flag, 
  Sliders, 
  ShieldCheck, 
  Database, 
  TrendingUp, 
  Cpu, 
  ShieldAlert, 
  Terminal, 
  SearchCode,
  Lock,
  RefreshCw,
  Plus,
  Trash2,
  Settings,
  AlertTriangle,
  Play,
  Save,
  Send,
  Ban,
  UserCheck,
  Check,
  ToggleLeft,
  ToggleRight,
  Sparkles
} from "lucide-react";

// Types definition
interface AdminUser {
  id: string;
  name: string;
  email: string;
  tier: "Free" | "Premium" | "Enterprise";
  status: "Active" | "Banned" | "Pending";
  joinedDate: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  priceUSD: number;
  subscribers: number;
  autoRenew: boolean;
}

interface RefundRequest {
  id: string;
  userEmail: string;
  amountUSD: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  timestamp: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  creator: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "In-Progress" | "Resolved";
  createdTime: string;
}

interface FeatureFlag {
  key: string;
  description: string;
  enabled: boolean;
  module: "Search" | "Pricing" | "Identity" | "ML";
}

interface SystemConfig {
  key: string;
  value: string;
  category: "GDS" | "Cache" | "RateLimit" | "Global";
  description: string;
}

interface RoleAssignment {
  id: string;
  adminName: string;
  email: string;
  role: "Super Admin" | "Support Engineer" | "Billing Admin" | "DevOps Engineer";
  permissions: string[];
}

interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  category: "User" | "Config" | "Security" | "Billing" | "FeatureFlag";
  timestamp: string;
}

interface SecurityEvent {
  id: string;
  ipAddress: string;
  eventType: "SQL Injection Attempt" | "Brute Force" | "Rate Limit Tripped" | "Corrupt JWT Token";
  severity: "Severe" | "High" | "Warning";
  timestamp: string;
  status: "Blocked" | "Flagged" | "Whitelisted";
}

export default function AdminPlatformExplorer() {
  // Navigation tabs for sub-modules
  const [adminTab, setAdminTab] = useState<"analytics" | "users_billing" | "ops_content" | "monitoring" | "security_logs">("analytics");

  // State 1: Users & Roles
  const [users, setUsers] = useState<AdminUser[]>([
    { id: "usr-101", name: "David Miller", email: "david.miller@corporate.com", tier: "Enterprise", status: "Active", joinedDate: "2026-01-15" },
    { id: "usr-102", name: "Sarah Connor", email: "sarah.c@sky.net", tier: "Premium", status: "Active", joinedDate: "2026-03-22" },
    { id: "usr-103", name: "Alex Mercer", email: "alex.m@genetec.org", tier: "Free", status: "Active", joinedDate: "2026-05-10" },
    { id: "usr-104", name: "Clara Oswald", email: "clara.oswald@tardis.org", tier: "Premium", status: "Pending", joinedDate: "2026-06-01" },
    { id: "usr-105", name: "John Doe", email: "bad_actor@spambot.cc", tier: "Free", status: "Banned", joinedDate: "2026-06-18" },
  ]);

  const [roles, setRoles] = useState<RoleAssignment[]>([
    { id: "role-1", adminName: "Nadia Romanova", email: "nadia.r@flysmart.admin", role: "Super Admin", permissions: ["write:config", "write:billing", "read:logs", "write:security"] },
    { id: "role-2", adminName: "Marcus Vance", email: "marcus.v@flysmart.admin", role: "Support Engineer", permissions: ["read:logs", "write:support", "read:users"] },
    { id: "role-3", adminName: "Elena Rostova", email: "elena.r@flysmart.admin", role: "Billing Admin", permissions: ["write:billing", "read:users", "read:logs"] },
    { id: "role-4", adminName: "Linus Vance", email: "linus.v@flysmart.admin", role: "DevOps Engineer", permissions: ["write:config", "read:logs", "write:security"] }
  ]);

  // State 2: Subscription & Billing
  const [plans, setPlans] = useState<SubscriptionPlan[]>([
    { id: "plan-free", name: "Basic Traveler", priceUSD: 0, subscribers: 12450, autoRenew: false },
    { id: "plan-premium", name: "Elite Frequent Flyer", priceUSD: 49, subscribers: 3520, autoRenew: true },
    { id: "plan-enterprise", name: "Corporate Global Concierge", priceUSD: 299, subscribers: 480, autoRenew: true }
  ]);

  const [refunds, setRefunds] = useState<RefundRequest[]>([
    { id: "ref-901", userEmail: "david.miller@corporate.com", amountUSD: 299, reason: "Duplicate corporate credit card charge during booking", status: "Pending", timestamp: "2026-06-27T10:30:00Z" },
    { id: "ref-902", userEmail: "clara.oswald@tardis.org", amountUSD: 49, reason: "Accidental tier renewal", status: "Pending", timestamp: "2026-06-27T14:45:00Z" },
    { id: "ref-903", userEmail: "customer.unhappy@gmail.com", amountUSD: 120, reason: "Mistake fare alert delayed by 15 mins", status: "Approved", timestamp: "2026-06-26T08:15:00Z" },
    { id: "ref-904", userEmail: "accidental_click@outlook.com", amountUSD: 49, reason: "Refund requested within 5-minute cooling off window", status: "Rejected", timestamp: "2026-06-25T19:22:00Z" }
  ]);

  const totalRefundedSum = useMemo(() => {
    return refunds
      .filter(r => r.status === "Approved")
      .reduce((sum, r) => sum + r.amountUSD, 0);
  }, [refunds]);

  // State 3: Support Tickets
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    { id: "tkt-001", creator: "david.miller@corporate.com", subject: "SABRE GDS sync failure returning 503 during booking flight DL-450", severity: "Critical", status: "Open", createdTime: "2026-06-27T20:00:00Z" },
    { id: "tkt-002", creator: "sarah.c@sky.net", subject: "Bespoke Personalization layout failing to render warm weather destinations", severity: "Medium", status: "In-Progress", createdTime: "2026-06-27T21:10:00Z" },
    { id: "tkt-003", creator: "alex.m@genetec.org", subject: "SMS notification alert delayed by over 8 minutes", severity: "High", status: "Open", createdTime: "2026-06-27T22:30:00Z" },
    { id: "tkt-004", creator: "timely.travels@enterprise.com", subject: "Corporate API credential token expired prematurely", severity: "High", status: "Resolved", createdTime: "2026-06-26T14:00:00Z" }
  ]);

  const [ticketSubjectInput, setTicketSubjectInput] = useState("");
  const [ticketSeverityInput, setTicketSeverityInput] = useState<"Critical" | "High" | "Medium" | "Low">("High");

  // State 4: Feature Flags & Config
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    { key: "enable_predictive_pricing", description: "Inject real-time predictive machine learning pricing weights", enabled: true, module: "Pricing" },
    { key: "enable_mistake_fare_alerts", description: "Run automated scraper detecting flight cost anomalies in real-time", enabled: true, module: "Search" },
    { key: "disable_search_caching", description: "Bypass secondary Redis layer to force active partner pings (Stress testing only)", enabled: false, module: "Search" },
    { key: "enable_ldp_differential_privacy", description: "Enforce local differential privacy on client telemetry exports", enabled: true, module: "Identity" },
    { key: "enable_collaborative_filtering", description: "Utilize Spark user matrix factorization vectors for travel rankings", enabled: true, module: "ML" }
  ]);

  const [configs, setConfigs] = useState<SystemConfig[]>([
    { key: "gds_sync_timeout_ms", value: "3500", category: "GDS", description: "Timeout limit for Sabre/Amadeus synchronous routing API calls" },
    { key: "max_search_queries_per_second", value: "2500", category: "RateLimit", description: "Global rate limiting cluster cap per API gateway tenant" },
    { key: "redis_cache_ttl_seconds", value: "180", category: "Cache", description: "Time-to-live parameter for active search result records" },
    { key: "mistake_fare_deviation_threshold", value: "82", category: "Global", description: "Standard deviation percentage anomaly score trigger limit" }
  ]);

  // State 5: System Telemetry (Simulated changing state)
  const [sysTelemetry, setSysTelemetry] = useState({
    cpuUsage: 42,
    ramUsage: 68,
    activeDbConnections: 142,
    apiSuccessRate: 99.85,
    searchesPerSecond: 184,
    cacheHitRatio: 84.6,
    activeAlertsCount: 2
  });

  // State 6: Alerts & Security Events
  const [infrastructureAlerts, setInfrastructureAlerts] = useState([
    { id: "alt-101", title: "Amadeus GDS Latency Anomaly", severity: "High", source: "Gateway-US-East", timestamp: "Just now", muted: false },
    { id: "alt-102", title: "High Memory Lock contention on core Redis shard-2", severity: "Critical", source: "Cache-Cluster-EU", timestamp: "4m ago", muted: false }
  ]);

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
    { id: "sec-01", ipAddress: "198.51.100.42", eventType: "SQL Injection Attempt", severity: "Severe", timestamp: "2026-06-27T22:45:00Z", status: "Blocked" },
    { id: "sec-02", ipAddress: "203.0.113.85", eventType: "Rate Limit Tripped", severity: "Warning", timestamp: "2026-06-27T22:50:00Z", status: "Flagged" },
    { id: "sec-03", ipAddress: "45.223.19.112", eventType: "Corrupt JWT Token", severity: "High", timestamp: "2026-06-27T22:55:00Z", status: "Blocked" },
    { id: "sec-04", ipAddress: "8.8.8.8", eventType: "Brute Force", severity: "High", timestamp: "2026-06-27T21:30:00Z", status: "Whitelisted" }
  ]);

  // State 7: Partner GDS Health
  const [partnersHealth, setPartnersHealth] = useState([
    { name: "Sabre GDS", type: "GDS Integration", latency: 240, status: "Healthy" },
    { name: "Amadeus GDS", type: "GDS Integration", latency: 680, status: "Degraded" },
    { name: "Travelport GDS", type: "GDS Integration", latency: 195, status: "Healthy" },
    { name: "Delta Air Lines API", type: "Direct API", latency: 120, status: "Healthy" },
    { name: "Singapore Airlines GDS", type: "Direct API", latency: 310, status: "Healthy" },
    { name: "Air France NDC Gateway", type: "Direct NDC", latency: 1400, status: "Unreachable" }
  ]);

  // State 8: Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: "log-201", adminEmail: "nadia.r@flysmart.admin", action: "Toggled predictive_pricing feature flag to ENABLED", category: "FeatureFlag", timestamp: "2026-06-27T21:40:00Z" },
    { id: "log-202", adminEmail: "linus.v@flysmart.admin", action: "Updated gds_sync_timeout_ms from 3000 to 3500", category: "Config", timestamp: "2026-06-27T22:05:00Z" },
    { id: "log-203", adminEmail: "nadia.r@flysmart.admin", action: "Approved refund of $299 to corporate client david.miller", category: "Billing", timestamp: "2026-06-27T22:30:00Z" },
    { id: "log-204", adminEmail: "nadia.r@flysmart.admin", action: "Banned suspicious user bad_actor@spambot.cc", category: "User", timestamp: "2026-06-27T22:50:00Z" },
    { id: "log-205", adminEmail: "marcus.v@flysmart.admin", action: "Assigned Critical ticket tkt-001 to Sabre Support Squad", category: "Security", timestamp: "2026-06-27T23:01:00Z" }
  ]);

  // State 9: Content Management
  const [systemBanners, setSystemBanners] = useState([
    { id: "banner-1", location: "Header Notification Area", content: "⚠️ Air France NDC network congestion may degrade booking processing temporarily.", active: true },
    { id: "banner-2", location: "Mistake Fare Promo Card", content: "🚨 ALERT: Roundtrip Business Flight anomaly from SFO to Milan for $340 detected!", active: true },
    { id: "banner-3", location: "New User Welcome Email footer", content: "Configure your destination preferences to filter personalized recommendations automatically.", active: false }
  ]);

  // State 10: ML Model Monitor & A/B testing ratios
  const [mlModels, setMlModels] = useState([
    { name: "Pricing_Regressor_v2.4", type: "Gradient Boosting", activeTrafficSplit: 85, latencyMs: 4, accuracyMAPE: "3.2%", status: "Live" },
    { name: "Pricing_Regressor_v2.5-Beta", type: "Neural Network Transformer", activeTrafficSplit: 15, latencyMs: 14, accuracyMAPE: "2.8%", status: "Shadowing" }
  ]);

  // Real-time telemetry tick simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setSysTelemetry(prev => {
        const errorFluctuation = Math.random() > 0.95 ? -1.2 : 0.05;
        const currentCpu = Math.min(95, Math.max(15, prev.cpuUsage + Math.round((Math.random() - 0.5) * 6)));
        const currentRam = Math.min(95, Math.max(30, prev.ramUsage + Math.round((Math.random() - 0.5) * 3)));
        const currentQps = Math.min(500, Math.max(80, prev.searchesPerSecond + Math.round((Math.random() - 0.5) * 20)));
        const currentHitRatio = Math.min(99.9, Math.max(60, Number((prev.cacheHitRatio + (Math.random() - 0.5) * 0.8).toFixed(1))));

        return {
          cpuUsage: currentCpu,
          ramUsage: currentRam,
          activeDbConnections: prev.activeDbConnections + Math.round((Math.random() - 0.5) * 4),
          apiSuccessRate: Number(Math.min(100, Math.max(95, prev.apiSuccessRate + errorFluctuation)).toFixed(2)),
          searchesPerSecond: currentQps,
          cacheHitRatio: currentHitRatio,
          activeAlertsCount: infrastructureAlerts.filter(a => !a.muted).length
        };
      });

      // Fluctuate partner latency
      setPartnersHealth(prev => prev.map(p => {
        const adjustment = Math.round((Math.random() - 0.5) * 25);
        const newLatency = Math.max(20, p.latency + adjustment);
        let newStatus = p.status;
        if (newLatency > 1200) newStatus = "Degraded";
        else if (newLatency > 500 && p.name.includes("Amadeus")) newStatus = "Degraded";
        else if (p.status !== "Unreachable") newStatus = "Healthy";
        return { ...p, latency: newLatency, status: newStatus };
      }));
    }, 3000);

    return () => clearInterval(timer);
  }, [infrastructureAlerts]);

  // Trigger custom admin action with logging
  const triggerAdminAction = (actionMsg: string, category: AuditLog["category"]) => {
    const newLog: AuditLog = {
      id: `log-${Date.now().toString().slice(-4)}`,
      adminEmail: "nn2611067@gmail.com", // Current user
      action: actionMsg,
      category,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // 1. User Handlers
  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === "Active" ? "Banned" : "Active";
        triggerAdminAction(`${nextStatus === "Banned" ? "Banned" : "Unbanned"} user account: ${u.email}`, "User");
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  // 2. Refund Handlers
  const handleRefundAction = (id: string, action: "Approved" | "Rejected") => {
    setRefunds(prev => prev.map(r => {
      if (r.id === id) {
        triggerAdminAction(`${action} refund ID: ${r.id} for amount $${r.amountUSD} corresponding to ${r.userEmail}`, "Billing");
        return { ...r, status: action };
      }
      return r;
    }));
  };

  // 3. Support Ticket Handlers
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubjectInput.trim()) return;

    const newTicket: SupportTicket = {
      id: `tkt-${Date.now().toString().slice(-3)}`,
      creator: "internal.systems@flysmart.admin",
      subject: ticketSubjectInput,
      severity: ticketSeverityInput,
      status: "Open",
      createdTime: new Date().toISOString()
    };

    setSupportTickets(prev => [newTicket, ...prev]);
    triggerAdminAction(`Opened support ticket: "${ticketSubjectInput}" with severity: ${ticketSeverityInput}`, "Security");
    setTicketSubjectInput("");
  };

  const handleResolveTicket = (ticketId: string) => {
    setSupportTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        triggerAdminAction(`Resolved support ticket: "${t.subject}"`, "Security");
        return { ...t, status: "Resolved" };
      }
      return t;
    }));
  };

  // 4. Feature Flag Handlers
  const handleToggleFeatureFlag = (key: string) => {
    setFeatureFlags(prev => prev.map(f => {
      if (f.key === key) {
        const nextState = !f.enabled;
        triggerAdminAction(`Toggled feature flag '${key}' to: ${nextState ? "ENABLED" : "DISABLED"}`, "FeatureFlag");
        return { ...f, enabled: nextState };
      }
      return f;
    }));
  };

  // 5. Config Handlers
  const handleUpdateConfigValue = (key: string, newValue: string) => {
    setConfigs(prev => prev.map(c => {
      if (c.key === key) {
        triggerAdminAction(`Updated configuration parameter [${key}] to: "${newValue}"`, "Config");
        return { ...c, value: newValue };
      }
      return c;
    }));
  };

  // 6. Security & IP Bans
  const handleToggleSecurityStatus = (id: string) => {
    setSecurityEvents(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === "Blocked" ? "Whitelisted" : "Blocked";
        triggerAdminAction(`Altered security firewall parameter for IP ${s.ipAddress} to: ${nextStatus}`, "Security");
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  // 7. Active Alerts
  const handleMuteAlert = (id: string) => {
    setInfrastructureAlerts(prev => prev.map(a => {
      if (a.id === id) {
        triggerAdminAction(`Muted infrastructure alert trigger: "${a.title}"`, "Config");
        return { ...a, muted: true };
      }
      return a;
    }));
  };

  // 8. Banner Content updater
  const handleUpdateBanner = (id: string, newContent: string) => {
    setSystemBanners(prev => prev.map(b => {
      if (b.id === id) {
        triggerAdminAction(`Modified layout banner [${b.location}] to content: "${newContent}"`, "Config");
        return { ...b, content: newContent };
      }
      return b;
    }));
  };

  // 9. Dispatch test alert
  const handleDispatchMockAlert = () => {
    const newAlert = {
      id: `alt-${Date.now().toString().slice(-3)}`,
      title: "Rate Limit Exceeded Anomaly on Edge Gateway SFO-4",
      severity: "High" as const,
      source: "Gateway-US-West",
      timestamp: "Just now",
      muted: false
    };
    setInfrastructureAlerts(prev => [newAlert, ...prev]);
    triggerAdminAction("Simulated/dispatched infrastructure alert SFO-4 exception", "Config");
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="internal-admin-panel">
      
      {/* Admin Panel Welcome Banner */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] bg-sky-950 text-sky-450 border border-sky-500/20 px-2.5 py-0.5 rounded-full font-mono font-black uppercase max-w-max flex items-center gap-1">
            <Radio className="w-3 h-3 text-rose-500 animate-ping" />
            Active Administration & Operations Command
          </div>
          <h2 className="text-lg font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            FlySmart Unified Internal Operations Platform
          </h2>
          <p className="text-xs text-slate-400">
            Secure administrative control interface. Coordinate system configurations, toggle feature flags, process financial refunds, manage client support ticket pipelines, and trace distributed telemetry streams.
          </p>
        </div>

        {/* Global Security Health Indicator */}
        <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl shrink-0 flex items-center gap-3 min-w-[220px]">
          <div className="relative shrink-0">
            <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 bg-emerald-500 rounded-full scale-150 opacity-20 animate-ping" />
          </div>
          <div className="text-left">
            <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">SYSTEM THREAT LEVEL</span>
            <span className="text-xs font-black font-mono text-slate-150 tracking-wide">SECURE / LEVEL-1 ALPHA</span>
            <span className="text-[9px] font-mono text-slate-450 block">Audit User: nn2611067@gmail.com</span>
          </div>
        </div>
      </div>

      {/* Internal Navigation Modules Row */}
      <div className="flex flex-wrap gap-2 border-b border-slate-850 pb-2">
        <button
          onClick={() => setAdminTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            adminTab === "analytics" 
              ? "bg-slate-900 border border-slate-850 text-sky-400" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Activity className="w-4 h-4 text-sky-400" />
          <span>Analytics & Telemetry</span>
        </button>

        <button
          onClick={() => setAdminTab("users_billing")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            adminTab === "users_billing" 
              ? "bg-slate-900 border border-slate-850 text-sky-400" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Users className="w-4 h-4 text-emerald-450" />
          <span>Users & Billing</span>
        </button>

        <button
          onClick={() => setAdminTab("ops_content")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            adminTab === "ops_content" 
              ? "bg-slate-900 border border-slate-850 text-sky-400" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>Ops & Content Management</span>
        </button>

        <button
          onClick={() => setAdminTab("monitoring")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            adminTab === "monitoring" 
              ? "bg-slate-900 border border-slate-850 text-sky-400" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Cpu className="w-4 h-4 text-amber-500" />
          <span>Monitoring & Partner Health</span>
        </button>

        <button
          onClick={() => setAdminTab("security_logs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            adminTab === "security_logs" 
              ? "bg-slate-900 border border-slate-850 text-sky-400" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Security & Audit Traces</span>
        </button>
      </div>

      {/* Main Core Viewport Tab Switcher */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* ==================== TAB 1: ANALYTICS & TELEMETRY ==================== */}
        {adminTab === "analytics" && (
          <div className="space-y-6">
            
            {/* Live Metrics Grid widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-slate-950 border border-slate-900 p-4.5 rounded-2xl space-y-2 relative overflow-hidden">
                <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">API Gateway Throughput</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black font-mono tracking-tight text-slate-100">
                    {sysTelemetry.searchesPerSecond} <span className="text-[11px] text-slate-500 font-normal">QPS</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">+12% vs last hr</span>
                </div>
                {/* Micro SVG line chart */}
                <svg className="w-full h-8 text-sky-500/30" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,15 Q15,10 30,18 T60,5 T90,12 L100,5" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>

              <div className="bg-slate-950 border border-slate-900 p-4.5 rounded-2xl space-y-2 relative overflow-hidden">
                <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Cache Hit Ratio</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black font-mono tracking-tight text-slate-100">
                    {sysTelemetry.cacheHitRatio}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">TTL: 180s</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${sysTelemetry.cacheHitRatio}%` }} />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-900 p-4.5 rounded-2xl space-y-2 relative overflow-hidden">
                <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">API Transaction Success</span>
                <div className="flex justify-between items-baseline">
                  <span className={`text-2xl font-black font-mono tracking-tight ${sysTelemetry.apiSuccessRate >= 99 ? "text-slate-100" : "text-rose-450"}`}>
                    {sysTelemetry.apiSuccessRate}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">TLS 1.3 Active</span>
                </div>
                {/* Visual bar graph micro */}
                <div className="flex items-end gap-1 h-6">
                  {[4, 5, 3, 6, 8, 7, 9, 8, 9, 10, 9, 8].map((v, i) => (
                    <div key={i} className="flex-1 bg-emerald-500/20 rounded-sm" style={{ height: `${v * 10}%` }} />
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-900 p-4.5 rounded-2xl space-y-2 relative overflow-hidden">
                <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Active Incidents</span>
                <div className="flex justify-between items-baseline">
                  <span className={`text-2xl font-black font-mono tracking-tight ${sysTelemetry.activeAlertsCount > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                    {sysTelemetry.activeAlertsCount} <span className="text-[11px] text-slate-500 font-normal">unresolved</span>
                  </span>
                  <button 
                    onClick={handleDispatchMockAlert} 
                    className="text-[8px] bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded font-mono uppercase cursor-pointer"
                  >
                    + Inject Alert
                  </button>
                </div>
                <div className="flex gap-2 items-center text-[10px] font-semibold text-slate-500 mt-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>2 external GDS integrations logged latency spikes</span>
                </div>
              </div>

            </div>

            {/* Master System Architecture Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* SVG Main Analytics Chart (Throughput & Cache Trends) */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                  <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                    Distributed Edge Traffic & Cache Efficiency Analytics
                  </h3>
                  <div className="flex items-center gap-4 text-[9px] font-mono">
                    <span className="flex items-center gap-1 text-slate-400">
                      <span className="w-2 h-2 bg-indigo-500 rounded-sm" /> Edge QPS throughput
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <span className="w-2 h-2 bg-sky-400 rounded-sm" /> Cache Misses
                    </span>
                  </div>
                </div>

                {/* SVG Graph rendering */}
                <div className="relative bg-slate-950 border border-slate-850 rounded-xl p-4 h-[240px] flex items-end">
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none opacity-10">
                    {[1, 2, 3, 4].map(l => (
                      <div key={l} className="border-b border-slate-100 w-full" />
                    ))}
                  </div>

                  {/* Graph Data lines represented elegantly as pure SVGs */}
                  <svg className="absolute inset-x-4 top-4 bottom-12 w-[calc(100%-2rem)] h-[180px]" viewBox="0 0 100 40" preserveAspectRatio="none">
                    {/* QPS Line */}
                    <path 
                      d="M 0,25 Q 10,20 20,30 T 40,12 T 60,8 T 80,18 T 100,5" 
                      fill="none" 
                      stroke="#6366f1" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />
                    <path 
                      d="M 0,25 Q 10,20 20,30 T 40,12 T 60,8 T 80,18 T 100,5 L 100,40 L 0,40 Z" 
                      fill="url(#qps-gradient)" 
                      opacity="0.15" 
                    />

                    {/* Misses Line */}
                    <path 
                      d="M 0,35 Q 15,38 30,22 T 60,25 T 90,32 L 100,28" 
                      fill="none" 
                      stroke="#38bdf8" 
                      strokeWidth="1.5" 
                      strokeDasharray="2"
                    />

                    {/* Gradients */}
                    <defs>
                      <linearGradient id="qps-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Horizontal Axis coordinates */}
                  <div className="w-full flex justify-between font-mono text-[8px] text-slate-500 pt-2 border-t border-slate-900">
                    <span>18:00 UTC</span>
                    <span>19:00 UTC</span>
                    <span>20:00 UTC</span>
                    <span>21:00 UTC</span>
                    <span>22:00 UTC</span>
                    <span>23:00 UTC (Current)</span>
                  </div>

                </div>

                <div className="bg-slate-950 p-3 rounded-xl text-[10px] font-mono text-slate-400 space-y-1">
                  <div className="text-slate-200 font-bold uppercase text-[9px]">Edge routing logs summary:</div>
                  <p className="leading-normal font-semibold">
                    The regional edge routers in Frankfurt, Tokyo, and San Francisco auto-negotiate BGP connections. All search workloads bypass heavy DB transactions, query-caching flight specs in a localized memory structure before syncing state to database shards in Dallas.
                  </p>
                </div>
              </div>

              {/* Infrastructure System Health & Metrics */}
              <div className="lg:col-span-4 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400 animate-spin" />
                  Cluster Resource Monitoring
                </h3>

                <div className="space-y-4">
                  {/* CPU Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-slate-400 uppercase">Kubernetes Nodes CPU</span>
                      <span className={`font-bold ${sysTelemetry.cpuUsage > 80 ? "text-rose-450" : "text-indigo-400"}`}>{sysTelemetry.cpuUsage}%</span>
                    </div>
                    <div className="w-full bg-slate-950 border border-slate-900 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${sysTelemetry.cpuUsage > 80 ? "bg-rose-500" : "bg-indigo-500"}`} 
                        style={{ width: `${sysTelemetry.cpuUsage}%` }} 
                      />
                    </div>
                  </div>

                  {/* RAM Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-slate-400 uppercase">Redis Memory Cache Allocation</span>
                      <span className="text-slate-250 font-bold font-mono">{sysTelemetry.ramUsage}%</span>
                    </div>
                    <div className="w-full bg-slate-950 border border-slate-900 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300" 
                        style={{ width: `${sysTelemetry.ramUsage}%` }} 
                      />
                    </div>
                  </div>

                  {/* Active Connections */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-slate-400 uppercase">PostgreSQL Thread Locks</span>
                      <span className="text-slate-250 font-bold font-mono">{sysTelemetry.activeDbConnections} / 500 pool</span>
                    </div>
                    <div className="w-full bg-slate-950 border border-slate-900 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 transition-all duration-300" 
                        style={{ width: `${(sysTelemetry.activeDbConnections / 500) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Alarm Threshold summary */}
                <div className="bg-slate-950 border border-slate-900 rounded-xl p-3.5 space-y-2 text-[10px] font-mono leading-relaxed">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Auto-Scale Trigger Specs</span>
                  <div className="flex justify-between text-slate-450 font-semibold">
                    <span>Horizontal Scale:</span>
                    <span>QPS &gt; 350 or CPU &gt; 78%</span>
                  </div>
                  <div className="flex justify-between text-slate-450 font-semibold">
                    <span>Active Gateway Nodes:</span>
                    <span>3 active (Max: 12 scaling)</span>
                  </div>
                  <div className="flex justify-between text-slate-450 font-semibold">
                    <span>Cloud SQL Replication:</span>
                    <span>Read replicas: 2 active (Geo-sync)</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 2: USERS & BILLING ==================== */}
        {adminTab === "users_billing" && (
          <div className="space-y-6">
            
            {/* Split layout: left column is User Management, right column is Subscription & Billing */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* User management & roles */}
              <div className="lg:col-span-7 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                  <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    Interactive Identity & User Management
                  </h3>
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-black">{users.length} registered profiles</span>
                </div>

                {/* Users List */}
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {users.map(u => {
                    const isBanned = u.status === "Banned";
                    return (
                      <div key={u.id} className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{u.name}</span>
                            <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded border uppercase ${
                              u.tier === "Enterprise" 
                                ? "bg-indigo-950 text-indigo-400 border-indigo-900/40" 
                                : u.tier === "Premium" 
                                  ? "bg-amber-950 text-amber-400 border-amber-900/40" 
                                  : "bg-slate-900 text-slate-400 border-slate-800"
                            }`}>
                              {u.tier}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-550 font-mono">{u.email} • Joined {u.joinedDate}</p>
                        </div>

                        {/* Status + Actions */}
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-mono font-bold uppercase ${
                            isBanned 
                              ? "text-rose-500" 
                              : u.status === "Pending" 
                                ? "text-amber-500" 
                                : "text-emerald-500"
                          }`}>
                            {u.status}
                          </span>

                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isBanned 
                                ? "bg-emerald-950/40 border-emerald-900/50 text-emerald-450 hover:bg-emerald-950/80" 
                                : "bg-rose-950/40 border-rose-900/50 text-rose-450 hover:bg-rose-950/80"
                            }`}
                            title={isBanned ? "Unban user" : "Ban user"}
                          >
                            {isBanned ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Roles assignment roster */}
                <div className="border-t border-slate-850 pt-4 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-450" />
                    Internal Admin RBAC (Role-Based Access Control)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-semibold">
                    {roles.map(r => (
                      <div key={r.id} className="bg-slate-950/80 border border-slate-900 p-3 rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-200 block leading-tight">{r.adminName}</span>
                            <span className="text-[9px] font-mono text-slate-500">{r.email}</span>
                          </div>
                          <span className="text-[8.5px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-900/30 px-1.5 rounded uppercase">
                            {r.role}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {r.permissions.map(p => (
                            <span key={p} className="bg-slate-900 border border-slate-850 text-[8px] font-mono px-1 rounded text-slate-450">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Subscriptions, MRR & Refund Queues */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Billing Summary Gauges */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                    <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-450" />
                      Subscription Operations & MRR
                    </h3>
                  </div>

                  {/* Pricing Plan structures */}
                  <div className="space-y-3">
                    {plans.map(p => (
                      <div key={p.id} className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-250 block">{p.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            ${p.priceUSD}/mo • {p.subscribers.toLocaleString()} subscribers
                          </span>
                        </div>

                        {/* Interactive Auto-renew toggle */}
                        <button
                          onClick={() => {
                            setPlans(prev => prev.map(pl => {
                              if (pl.id === p.id) {
                                const nextState = !pl.autoRenew;
                                triggerAdminAction(`Toggled auto-renew rules for tier [${pl.name}] to: ${nextState ? "TRUE" : "FALSE"}`, "Billing");
                                return { ...pl, autoRenew: nextState };
                              }
                              return pl;
                            }));
                          }}
                          className="flex items-center gap-1.5 font-mono text-[9px] text-slate-400 bg-slate-900 border border-slate-850 px-2.5 py-1 rounded hover:text-slate-200 cursor-pointer"
                        >
                          <span>Auto-Renew:</span>
                          {p.autoRenew ? (
                            <span className="text-emerald-450 font-bold uppercase">ON</span>
                          ) : (
                            <span className="text-slate-500 uppercase">OFF</span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Refund Requests Pending Queue */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                    <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4 text-rose-500" />
                      Refund Processing Gateways
                    </h3>
                    <div className="text-right">
                      <span className="text-[8px] font-mono text-slate-500 block">TOTAL REFUNDED</span>
                      <span className="text-xs font-black font-mono text-rose-450">${totalRefundedSum} USD</span>
                    </div>
                  </div>

                  {/* Refund Tickets list */}
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {refunds.map(r => {
                      const isPending = r.status === "Pending";
                      return (
                        <div key={r.id} className="bg-slate-950 border border-slate-900 p-3 rounded-xl space-y-2 text-xs font-semibold">
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-250 font-mono">{r.id}</span>
                            <span className="text-rose-450 font-bold font-mono">${r.amountUSD} USD</span>
                          </div>
                          
                          <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">{r.reason}</p>
                          <span className="text-[9px] font-mono text-slate-550 block truncate">{r.userEmail}</span>

                          <div className="flex justify-between items-center pt-1 border-t border-slate-900">
                            <span className={`text-[8px] font-mono font-bold uppercase ${
                              isPending 
                                ? "text-amber-500" 
                                : r.status === "Approved" 
                                  ? "text-emerald-500" 
                                  : "text-rose-500"
                            }`}>
                              {r.status}
                            </span>

                            {isPending && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleRefundAction(r.id, "Rejected")}
                                  className="px-2 py-0.5 rounded bg-rose-950/40 hover:bg-rose-950 border border-rose-900/30 text-[9px] font-bold text-rose-450 uppercase cursor-pointer"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleRefundAction(r.id, "Approved")}
                                  className="px-2 py-0.5 rounded bg-emerald-950/40 hover:bg-emerald-950 border border-emerald-900/30 text-[9px] font-bold text-emerald-450 uppercase cursor-pointer"
                                >
                                  Approve
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 3: OPERATIONS & CONTENT ==================== */}
        {adminTab === "ops_content" && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Feature Flags & Global Variables config */}
              <div className="lg:col-span-7 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                  <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <Flag className="w-4 h-4 text-indigo-400 animate-pulse" />
                    Distributed Feature Flag Configurations
                  </h3>
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Consul KV Sync Active</span>
                </div>

                <div className="space-y-2.5">
                  {featureFlags.map(f => (
                    <div 
                      key={f.key} 
                      className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl flex items-center justify-between gap-4 text-xs font-semibold"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <code className="text-indigo-450 font-bold font-mono">{f.key}</code>
                          <span className="bg-slate-900 border border-slate-850 text-[8px] font-mono px-1.5 py-0.2 rounded text-slate-450 uppercase">
                            {f.module}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{f.description}</p>
                      </div>

                      {/* Interactive toggle switch button */}
                      <button
                        onClick={() => handleToggleFeatureFlag(f.key)}
                        className="shrink-0 transition-all cursor-pointer text-slate-400 hover:text-slate-250"
                      >
                        {f.enabled ? (
                          <ToggleRight className="w-7 h-7 text-indigo-500" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-slate-600" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                {/* System variables */}
                <div className="border-t border-slate-850 pt-4 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    Global System-Wide Run-time Variables
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {configs.map(c => (
                      <div key={c.key} className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-1">
                        <div className="flex justify-between items-baseline">
                          <code className="text-[10px] font-mono text-slate-400 font-bold">{c.key}</code>
                          <span className="text-[8px] font-mono text-slate-550 uppercase">{c.category}</span>
                        </div>
                        
                        <p className="text-[9.5px] text-slate-550 font-semibold leading-normal pb-1.5">{c.description}</p>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            defaultValue={c.value}
                            onBlur={(e) => handleUpdateConfigValue(c.key, e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                            title="Click outside to save change"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <span className="text-[8.5px] font-mono text-slate-550 block mt-1">
                    ℹ️ Run-time variables update dynamically in memory on Redis. Edits do not require server redeployment.
                  </span>
                </div>

              </div>

              {/* Support Ticket Pipelines & Announcement CMS */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Active Support Tickets */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                    <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                      <LifeBuoy className="w-4 h-4 text-sky-400 animate-spin" />
                      Incident Support Tickets (Zendesk API Sync)
                    </h3>
                  </div>

                  {/* Create support ticket form inline */}
                  <form onSubmit={handleCreateTicket} className="space-y-2 bg-slate-950/55 p-3 rounded-xl border border-slate-900">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Open New Internal Support Case</span>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ticketSubjectInput}
                        onChange={(e) => setTicketSubjectInput(e.target.value)}
                        placeholder="E.g. GDS booking service returned 504 gateway timeout"
                        className="w-full bg-slate-900 border border-slate-800 text-xs px-2.5 py-1.5 rounded focus:outline-none text-slate-200 font-semibold"
                      />
                      
                      <select
                        value={ticketSeverityInput}
                        onChange={(e) => setTicketSeverityInput(e.target.value as any)}
                        className="bg-slate-900 border border-slate-800 text-[10px] rounded px-1 text-slate-350 focus:outline-none cursor-pointer"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>

                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 px-3 rounded text-[11px] font-bold uppercase transition-all shrink-0 cursor-pointer"
                      >
                        Open
                      </button>
                    </div>
                  </form>

                  {/* Tickets list */}
                  <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                    {supportTickets.map(t => {
                      const isOpen = t.status === "Open" || t.status === "In-Progress";
                      return (
                        <div key={t.id} className="bg-slate-950 border border-slate-900 p-3 rounded-xl space-y-1.5 text-xs font-semibold">
                          <div className="flex justify-between items-center">
                            <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
                              t.severity === "Critical" 
                                ? "bg-rose-950 text-rose-450 border-rose-900/40" 
                                : t.severity === "High" 
                                  ? "bg-amber-950 text-amber-450 border-amber-900/40" 
                                  : "bg-slate-900 text-slate-400 border-slate-800"
                            }`}>
                              {t.severity} Severity
                            </span>

                            <span className="text-[10px] text-slate-500 font-mono">{t.id}</span>
                          </div>

                          <h4 className="text-[11.5px] font-bold text-slate-200 leading-normal">{t.subject}</h4>
                          <p className="text-[10px] text-slate-550 font-mono">Creator: {t.creator}</p>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                            <span className={`text-[8.5px] font-mono font-bold uppercase ${
                              t.status === "Resolved" 
                                ? "text-emerald-500" 
                                : t.status === "In-Progress" 
                                  ? "text-amber-500" 
                                  : "text-rose-500"
                            }`}>
                              {t.status}
                            </span>

                            {isOpen && (
                              <button
                                onClick={() => handleResolveTicket(t.id)}
                                className="px-2 py-0.5 rounded bg-emerald-950/40 hover:bg-emerald-950 border border-emerald-900/30 text-[9px] font-bold text-emerald-450 uppercase cursor-pointer"
                              >
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Content Banner Announcement Management CMS */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Emergency Broadcast CMS Content Nodes
                  </h3>

                  <div className="space-y-3">
                    {systemBanners.map(b => (
                      <div key={b.id} className="bg-slate-950 border border-slate-900 p-3 rounded-xl space-y-1.5 text-xs font-semibold">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[9px] font-mono text-slate-400 font-bold">{b.location}</span>
                          
                          <button
                            onClick={() => {
                              setSystemBanners(prev => prev.map(sb => {
                                if (sb.id === b.id) {
                                  const nextState = !sb.active;
                                  triggerAdminAction(`Toggled broadcast active state for [${b.location}] to: ${nextState ? "TRUE" : "FALSE"}`, "Config");
                                  return { ...sb, active: nextState };
                                }
                                return sb;
                              }));
                            }}
                            className={`text-[8.5px] font-mono font-bold uppercase ${b.active ? "text-indigo-400" : "text-slate-550"} cursor-pointer`}
                          >
                            [{b.active ? "ACTIVE" : "DISABLED"}]
                          </button>
                        </div>

                        <input
                          type="text"
                          defaultValue={b.content}
                          onBlur={(e) => handleUpdateBanner(b.id, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-[11px] text-slate-250 font-semibold focus:outline-none focus:border-indigo-500"
                          title="Click outside to save message"
                        />
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 4: MONITORING & PARTNERS ==================== */}
        {adminTab === "monitoring" && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* External Global GDS & Airline Partners Health status */}
              <div className="lg:col-span-6 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                  <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <SearchCode className="w-4 h-4 text-sky-400 animate-pulse" />
                    Distributed GDS Partner Endpoint Integrations
                  </h3>
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase">Live Ping Polling: 30s</span>
                </div>

                <div className="space-y-2.5">
                  {partnersHealth.map(p => {
                    const isHealthy = p.status === "Healthy";
                    return (
                      <div key={p.name} className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-250 block">{p.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{p.type}</span>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div className="font-mono">
                            <span className="text-[8px] text-slate-500 block uppercase">PING LATENCY</span>
                            <span className={`text-[11px] font-bold ${p.latency > 1000 ? "text-rose-450 animate-pulse" : p.latency > 450 ? "text-amber-500" : "text-emerald-400"}`}>
                              {p.latency}ms
                            </span>
                          </div>

                          <div className="min-w-[70px]">
                            <button
                              onClick={() => {
                                setPartnersHealth(prev => prev.map(pt => {
                                  if (pt.name === p.name) {
                                    const nextStatus = pt.status === "Healthy" ? "Unreachable" : "Healthy";
                                    triggerAdminAction(`Simulated partner NDC state toggle for [${p.name}] to: ${nextStatus}`, "Config");
                                    return { ...pt, status: nextStatus, latency: nextStatus === "Unreachable" ? 0 : 150 };
                                  }
                                  return pt;
                                }));
                              }}
                              className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded border uppercase cursor-pointer ${
                                isHealthy 
                                  ? "bg-emerald-950 text-emerald-400 border-emerald-900/30" 
                                  : p.status === "Degraded" 
                                    ? "bg-amber-950 text-amber-400 border-amber-900/30" 
                                    : "bg-rose-950 text-rose-400 border-rose-900/30 animate-pulse"
                              }`}
                              title="Click to toggle simulated health override"
                            >
                              {p.status}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Machine learning models & prediction metrics monitoring */}
              <div className="lg:col-span-6 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                  <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-indigo-400 animate-spin" />
                    Predictive Machine Learning Operations (MLOps)
                  </h3>
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase">A/B Traffic split</span>
                </div>

                <div className="space-y-4">
                  {mlModels.map(model => (
                    <div key={model.name} className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl space-y-3 text-xs font-semibold">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-200 block">{model.name}</span>
                          <span className="text-[10px] text-slate-550 font-mono">{model.type}</span>
                        </div>
                        <span className="text-[8.5px] font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-900/40 px-1.5 py-0.2 rounded uppercase">
                          {model.status}
                        </span>
                      </div>

                      {/* Traffic control slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[9px] text-slate-500">
                          <span>Model Traffic Routing Allocation</span>
                          <span className="text-indigo-450 font-bold">{model.activeTrafficSplit}% Split</span>
                        </div>
                        
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={model.activeTrafficSplit}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setMlModels(prev => prev.map(m => {
                              if (m.name === model.name) {
                                triggerAdminAction(`Altered MLOps routing allocation for ${m.name} to: ${val}%`, "FeatureFlag");
                                return { ...m, activeTrafficSplit: val };
                              } else {
                                // Balance other split to sum to 100
                                return { ...m, activeTrafficSplit: 100 - val };
                              }
                            }));
                          }}
                          className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>

                      {/* Performance metrics */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-900/60 border border-slate-900 p-2 rounded text-center text-[10px] font-mono">
                        <div>
                          <span className="text-slate-500 block text-[8px] uppercase">Model Latency</span>
                          <b className="text-slate-300">{model.latencyMs}ms</b>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[8px] uppercase">Accuracy MAPE</span>
                          <b className="text-emerald-450">{model.accuracyMAPE}</b>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[8px] uppercase">Status Check</span>
                          <b className="text-indigo-400 uppercase">ONLINE</b>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Training status log */}
                <div className="border-t border-slate-850 pt-3.5 space-y-2 text-[10px] font-mono">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Spark/Kubeflow Training pipeline status</span>
                  
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 flex justify-between items-center">
                    <div>
                      <span className="text-slate-350 font-bold font-mono">RecSys_Model_Cosine_Daily</span>
                      <p className="text-[9px] text-slate-550">Last training epoch: v1.8 completed successfully 4 hrs ago</p>
                    </div>
                    <span className="text-emerald-400 text-[8.5px] font-mono uppercase font-black">SUCCESS (22m run)</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 5: SECURITY & AUDIT TRACES ==================== */}
        {adminTab === "security_logs" && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Security Incidents & Intrusion Detection */}
              <div className="lg:col-span-6 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                  <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                    Intrusion Firewall Security Logs
                  </h3>
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase">IDS Rules Version: v9.42</span>
                </div>

                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {securityEvents.map(evt => {
                    const isBlocked = evt.status === "Blocked";
                    return (
                      <div key={evt.id} className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl space-y-1.5 text-xs font-semibold">
                        <div className="flex justify-between">
                          <code className="text-[10px] font-mono font-bold text-slate-400">{evt.ipAddress}</code>
                          <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded border uppercase ${
                            evt.severity === "Severe" 
                              ? "bg-rose-950 text-rose-450 border-rose-900/40" 
                              : "bg-amber-950 text-amber-450 border-amber-900/40"
                          }`}>
                            {evt.severity}
                          </span>
                        </div>

                        <div className="flex justify-between items-baseline">
                          <h4 className="font-bold text-slate-200">{evt.eventType}</h4>
                          <span className="text-[9px] font-mono text-slate-500">Time: {evt.timestamp.split("T")[1].substring(0,8)}</span>
                        </div>

                        <div className="flex justify-between items-center pt-1.5 border-t border-slate-900">
                          <span className={`text-[9px] font-mono font-bold uppercase ${
                            isBlocked ? "text-rose-500" : evt.status === "Flagged" ? "text-amber-500" : "text-emerald-500"
                          }`}>
                            Action: {evt.status}
                          </span>

                          <button
                            onClick={() => handleToggleSecurityStatus(evt.id)}
                            className="text-[9px] font-mono text-indigo-400 hover:text-indigo-300 transition-colors uppercase cursor-pointer"
                          >
                            [Toggle {isBlocked ? "Allow IP" : "Block IP"}]
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Immutable Auditor Logs ledger */}
              <div className="lg:col-span-6 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                  <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    Auditable Security Access Ledger
                  </h3>
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase">Write Protocol: Immutable WORM</span>
                </div>

                {/* Audit log traces */}
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {auditLogs.map(log => (
                    <div key={log.id} className="bg-slate-950/80 border border-slate-900 p-2.5 rounded-lg space-y-1 text-[11px] font-semibold">
                      <div className="flex justify-between items-baseline font-mono text-[9px]">
                        <span className="text-slate-450 font-bold">{log.adminEmail}</span>
                        <span className="text-slate-550">{log.timestamp.split("T")[1].substring(0,8)}</span>
                      </div>
                      
                      <p className="text-slate-250 leading-relaxed font-sans">{log.action}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="bg-slate-900 text-slate-500 text-[8px] font-mono px-1 rounded border border-slate-850">
                          CATEGORY: {log.category.toUpperCase()}
                        </span>
                        <span className="text-[8px] font-mono text-slate-550">UID: {log.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Complete Unified Administrative Architectural Spec Documentation Section */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-slate-250 uppercase font-mono tracking-wide flex items-center gap-1.5">
            <FileText className="w-4.5 h-4.5 text-indigo-400" />
            Admin Platform System Architecture Specifications
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Complete technical blueprint of security roles, feature flags distribution, payment refunds sync, partner health metrics, and auditing protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed font-semibold">
          
          {/* Box 1 */}
          <div className="bg-slate-950/45 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-500" />
              1. Multi-Tenant RBAC Security
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              The internal platform enforces strict multi-tenant Role-Based Access Control (RBAC) integrated with Okta OIDC. Permission vectors are evaluated client-side, with API routes requiring corresponding signature hashes.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>Token generation uses RS256 signing keys.</li>
              <li>Administrative sessions expire after 15m.</li>
              <li>Failed attempts trigger immediate IP bans.</li>
            </ul>
          </div>

          {/* Box 2 */}
          <div className="bg-slate-950/45 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              2. Feature Flag Consensus Engine
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              Feature toggling employs Consul KV. When a flag toggles, Consul initiates a gRPC push stream to edge gateways, altering live traffic parameters within 100ms.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>Dual-validation avoids accidental flag tripping.</li>
              <li>A/B splits synced dynamically to Redis shards.</li>
              <li>Automated fallback on flag propagation timeouts.</li>
            </ul>
          </div>

          {/* Box 3 */}
          <div className="bg-slate-950/45 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-500" />
              3. Immutable Audit Ledger (WORM)
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              To guarantee compliance, administrative actions are piped to an immutable Write Once Read Many (WORM) storage structure. Security auditors can perform trace query lookups via specific hash segments.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>Cryptographic chaining secures audit logs.</li>
              <li>Log collection compliant with SOC2 trust indices.</li>
              <li>Automated rotation limits retention to 365 days.</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}
