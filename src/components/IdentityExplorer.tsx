import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  AUTH_PROVIDERS, 
  RBAC_ROLES, 
  SECURITY_POLICIES, 
  JWT_HEADER_EXAMPLE, 
  JWT_PAYLOAD_EXAMPLE,
  AuthProviderInfo,
  RbacRole,
  SecurityPolicy
} from "../data/authDocs";
import { 
  Shield, 
  Key, 
  UserCheck, 
  Fingerprint, 
  Lock, 
  Eye, 
  Terminal, 
  Cpu, 
  RefreshCw, 
  Sliders, 
  AlertOctagon, 
  Server, 
  CheckCircle, 
  Database, 
  LogOut, 
  Plus, 
  X, 
  Play, 
  Activity, 
  RotateCw, 
  Clock, 
  UserX,
  User,
  Check,
  Zap,
  Flame,
  Globe,
  Smartphone,
  CheckCircle2,
  FileText,
  AlertTriangle
} from "lucide-react";

interface UserSession {
  id: string;
  userId: string;
  email: string;
  device: string;
  ip: string;
  location: string;
  trustScore: number;
  lastActive: string;
}

interface AuditLog {
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  status: "SUCCESS" | "WARNING" | "CRITICAL";
  details: string;
}

export default function IdentityExplorer() {
  const [activeSubTab, setActiveSubTab] = useState<"auth-flows" | "jwt-rbac" | "sessions-audit" | "protection" | "specs">("jwt-rbac");
  
  // JWT & RBAC Simulator state
  const [selectedProvider, setSelectedProvider] = useState<string>("google_oauth");
  const [customUserId, setCustomUserId] = useState<string>("usr_flyer_7719");
  const [customEmail, setCustomEmail] = useState<string>("amelia.earhart@flysmart.travel");
  const [selectedRole, setSelectedRole] = useState<string>("Frequent Traveler (Premium VIP)");
  const [mfaVerified, setMfaVerified] = useState<boolean>(true);
  const [deviceTrustScore, setDeviceTrustScore] = useState<number>(0.95);
  const [testPermissionScope, setTestPermissionScope] = useState<string>("booking:write");
  const [permissionCheckResult, setPermissionCheckResult] = useState<{ allowed: boolean; reason: string } | null>(null);
  
  // Sessions & Admin Impersonation states
  const [sessions, setSessions] = useState<UserSession[]>([
    { id: "ses_01", userId: "usr_flyer_7719", email: "amelia.earhart@flysmart.travel", device: "macOS - Safari 19.1", ip: "182.91.44.20", location: "Tokyo, JP", trustScore: 0.98, lastActive: "Just Now" },
    { id: "ses_02", userId: "usr_flyer_7719", email: "amelia.earhart@flysmart.travel", device: "iPhone 17 Pro - App", ip: "182.91.44.22", location: "Tokyo, JP", trustScore: 0.95, lastActive: "3 min ago" },
    { id: "ses_03", userId: "usr_flyer_7719", email: "amelia.earhart@flysmart.travel", device: "Ubuntu Linux - Chrome (Headless)", ip: "45.112.9.215", location: "Frankfurt, DE", trustScore: 0.42, lastActive: "15 min ago" }
  ]);
  const [impersonationMode, setImpersonationMode] = useState<boolean>(false);
  const [impersonatorName, setImpersonatorName] = useState<string>("admin_alan_turing");
  const [impersonationTicket, setImpersonationTicket] = useState<string>("TICKET-SEC-8821");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { timestamp: "22:31:02", actor: "system_core", action: "CREDENTIAL_ROTATION", target: "RS256_KEYS", status: "SUCCESS", details: "Rotated production API signing public-private key pair dynamically." },
    { timestamp: "22:35:14", actor: "google_oauth", action: "USER_FEDERATED_LOGIN", target: "usr_flyer_7719", status: "SUCCESS", details: "OIDC assertion successfully validated with Google Identity." },
    { timestamp: "22:35:16", actor: "device_trust", action: "TRUST_EVALUATION", target: "usr_flyer_7719", status: "SUCCESS", details: "Computed trust index (0.95) based on canvas signature and location pairing." }
  ]);

  // Rate Limiting & Bot Protection Simulator states
  const [rateLimitTokens, setRateLimitTokens] = useState<number>(100);
  const [isTrafficRunning, setIsTrafficRunning] = useState<boolean>(false);
  const [trafficMode, setTrafficMode] = useState<"standard" | "bot_scraping" | "ddos_attack">("standard");
  const [blockedRequestsCount, setBlockedRequestsCount] = useState<number>(0);
  const [turnstileActivated, setTurnstileActivated] = useState<boolean>(false);
  const [botLogs, setBotLogs] = useState<string[]>([]);
  const botLogEndRef = useRef<HTMLDivElement>(null);

  // Computed live JWT payload
  const generatedJwtPayload = useMemo(() => {
    const roleObj = RBAC_ROLES.find(r => r.role === selectedRole);
    const scopeStr = roleObj ? roleObj.permissions.join(" ") : "flight:read";
    
    const payload = {
      iss: "https://auth.flysmart.travel",
      sub: customUserId,
      aud: "https://api.flysmart.travel",
      exp: Math.floor(Date.now() / 1000) + 900, // 15 mins
      iat: Math.floor(Date.now() / 1000),
      name: impersonationMode ? `[IMPERSONATED BY ${impersonatorName}] Amelia Earhart` : "Amelia Earhart",
      email: customEmail,
      scope: scopeStr,
      identity_provider: selectedProvider,
      roles: [selectedRole],
      tenant_id: "ten_vip_fleet",
      mfa_verified: mfaVerified,
      device_trust_score: parseFloat(deviceTrustScore.toString()),
      ...(impersonationMode && {
        impersonator: impersonatorName,
        impersonation_ticket: impersonationTicket,
        audit_secured: true
      })
    };
    return JSON.stringify(payload, null, 2);
  }, [selectedProvider, customUserId, customEmail, selectedRole, mfaVerified, deviceTrustScore, impersonationMode, impersonatorName, impersonationTicket]);

  // Handle Dynamic permission check
  const handleCheckPermission = () => {
    const roleObj = RBAC_ROLES.find(r => r.role === selectedRole);
    if (!roleObj) return;

    const hasPerm = roleObj.permissions.includes(testPermissionScope) || roleObj.permissions.includes("system:write");
    
    setPermissionCheckResult({
      allowed: hasPerm,
      reason: hasPerm 
        ? `Role '${selectedRole}' explicitly possesses scope '${testPermissionScope}' inside the active policy definition.`
        : `Access Denied: Scope '${testPermissionScope}' is not bound to role '${selectedRole}'. Requires Operations level privileges.`
    });

    // Add to Audit Logs
    addAuditLog(
      impersonationMode ? `impersonated:${impersonatorName}` : customUserId,
      "RBAC_PER_CHECK",
      testPermissionScope,
      hasPerm ? "SUCCESS" : "WARNING",
      `Dynamic evaluation for scope request. Result: ${hasPerm ? 'AUTHORIZED' : 'DENIED'}`
    );
  };

  // Add dynamic audit log helper
  const addAuditLog = (actor: string, action: string, target: string, status: AuditLog["status"], details: string) => {
    const now = new Date();
    const ts = now.toISOString().split("T")[1].substring(0, 8);
    setAuditLogs(prev => [
      { timestamp: ts, actor, action, target, status, details },
      ...prev
    ]);
  };

  // Revoke Session
  const handleRevokeSession = (sessionId: string) => {
    const ses = sessions.find(s => s.id === sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (ses) {
      addAuditLog(
        impersonationMode ? `impersonated:${impersonatorName}` : "sys_admin",
        "SESSION_REVOKED",
        sessionId,
        "CRITICAL",
        `Terminated session on ${ses.device} associated with ${ses.email}. Cache cleared.`
      );
    }
  };

  // Turn Impersonation On / Off
  const toggleImpersonation = () => {
    if (!impersonationMode) {
      // Turn on
      if (!impersonationTicket.trim()) {
        alert("An active approval ticket is required for immutable security auditing.");
        return;
      }
      setImpersonationMode(true);
      addAuditLog(
        impersonatorName,
        "IMPERSONATION_STARTED",
        customUserId,
        "CRITICAL",
        `Admin initiated cryptographic impersonation lease under ticket ${impersonationTicket}. All activity mapped and signed.`
      );
    } else {
      // Turn off
      setImpersonationMode(false);
      addAuditLog(
        impersonatorName,
        "IMPERSONATION_ENDED",
        customUserId,
        "SUCCESS",
        `Admin terminated active impersonation session. Restored standard context.`
      );
    }
  };

  // Bot & Rate limit loop simulation
  useEffect(() => {
    let interval: any = null;
    if (isTrafficRunning) {
      interval = setInterval(() => {
        let cost = 1;
        let speedLabel = "Standard Client Search Request";
        if (trafficMode === "bot_scraping") {
          cost = 12;
          speedLabel = "Parallel Scraper Core Query";
        } else if (trafficMode === "ddos_attack") {
          cost = 25;
          speedLabel = "Distributed Volumetric TCP Flood Query";
        }

        setRateLimitTokens(prev => {
          const next = Math.max(0, prev - cost);
          
          if (next <= 20 && !turnstileActivated && (trafficMode !== "standard")) {
            setTurnstileActivated(true);
            setBotLogs(logs => [...logs, `[Security Gateway] Threshold tripped! Activating dynamic Cloudflare Turnstile cryptographic challenges...`]);
          }

          if (next === 0) {
            setBlockedRequestsCount(b => b + (trafficMode === "standard" ? 1 : 5));
            setBotLogs(logs => [...logs, `[APIGateway] ERROR: 429 Too Many Requests. Blocked attack fingerprint.`]);
            return 0;
          }

          setBotLogs(logs => [...logs, `[APIGateway] Passed 200 OK - Received ${speedLabel}. Cost: ${cost} tokens. Current level: ${next}/100`]);
          return next;
        });

      }, 800);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isTrafficRunning, trafficMode, turnstileActivated]);

  // Token recovery tick
  useEffect(() => {
    const recoveryTimer = setInterval(() => {
      setRateLimitTokens(prev => {
        if (prev < 100) {
          return Math.min(100, prev + 8);
        }
        return 100;
      });
    }, 1500);
    return () => clearInterval(recoveryTimer);
  }, []);

  // Scroll bot logs to bottom
  useEffect(() => {
    if (botLogEndRef.current) {
      botLogEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [botLogs]);

  return (
    <div className="space-y-6 animate-fadeIn" id="identity-auth-root">
      
      {/* Upper Information Banner */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] bg-sky-950 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase max-w-max">
            Enterprise Identity Architecture
          </div>
          <h2 className="text-lg font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-400" />
            Auth & Identity Platform (IDP)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standardizing secure decentralized authentication, short-lived JWT signatures, dynamic RBAC permission evaluation, session trust telemetry, and granular rate limits across global search edges.
          </p>
        </div>

        {/* Top-level sub-navigation tab list */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab("auth-flows")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "auth-flows"
                ? "bg-sky-950 border border-sky-850 text-sky-450 shadow-md shadow-sky-950/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            Federation & MFA
          </button>
          <button
            onClick={() => setActiveSubTab("jwt-rbac")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "jwt-rbac"
                ? "bg-sky-950 border border-sky-850 text-sky-450 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            JWT & RBAC Lab
          </button>
          <button
            onClick={() => setActiveSubTab("sessions-audit")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "sessions-audit"
                ? "bg-sky-950 border border-sky-850 text-sky-450 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Sessions & Audit
          </button>
          <button
            onClick={() => setActiveSubTab("protection")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "protection"
                ? "bg-sky-950 border border-sky-850 text-sky-450 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Bot & Rate Gateway
          </button>
          <button
            onClick={() => setActiveSubTab("specs")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "specs"
                ? "bg-sky-950 border border-sky-850 text-sky-450 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Production Specs
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}

      {activeSubTab === "auth-flows" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Identity Federation Providers Directory */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4" />
                Supported Identity Factors
              </h3>
              <p className="text-[11px] text-slate-500">
                FlySmart maps disparate federated OAuth identities to a central secure profile database using verified emails or decentralized biometrics.
              </p>

              <div className="space-y-3">
                {AUTH_PROVIDERS.map((prov) => (
                  <button
                    key={prov.id}
                    onClick={() => setSelectedProvider(prov.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                      selectedProvider === prov.id
                        ? "bg-sky-950/30 border-sky-500/30 text-sky-300"
                        : "bg-slate-900/10 border-slate-900 hover:bg-slate-900/30 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold">{prov.name}</span>
                      <span className="text-[9px] bg-slate-950 border border-slate-850 px-1.5 py-0.2 rounded text-slate-500 font-mono">
                        {prov.id === "passkeys" ? "Phishing-Resist" : "Standard"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                      {prov.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Identity Handshake Specification Document */}
          <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-100 tracking-tight">Identity Handshake & MFA Specifications</h3>
              <p className="text-xs text-slate-400 mt-1">Production parameters securing outbound authentication flow limits and hardware factors.</p>
            </div>

            {/* Selected provider detail display */}
            {(() => {
              const info = AUTH_PROVIDERS.find(p => p.id === selectedProvider) || AUTH_PROVIDERS[0];
              return (
                <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <span className="text-sm font-bold text-sky-300">{info.name} Protocol</span>
                    <span className="text-[10px] font-mono text-sky-400 bg-sky-950/40 border border-sky-900/30 px-2 py-0.5 rounded uppercase font-bold">
                      {info.securityTier}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Provider Type Class</span>
                      <p className="text-slate-300">{info.type}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">OIDC Cryptographic Flow</span>
                      <p className="text-slate-300 font-mono text-[10px]">{info.authFlow}</p>
                    </div>
                  </div>

                  {/* Flow Diagram for OIDC Flow with PKCE */}
                  <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Dynamic Exchange Loop (Auth Code + PKCE)</span>
                    
                    <div className="space-y-2.5 font-mono text-[10px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="bg-sky-950 text-sky-400 border border-sky-850 w-5 h-5 rounded-full flex items-center justify-center font-bold">1</span>
                        <span>Client generates cryptographically random <code>code_verifier</code> and hashes it to create <code>code_challenge</code>.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-sky-950 text-sky-400 border border-sky-850 w-5 h-5 rounded-full flex items-center justify-center font-bold">2</span>
                        <span>Redirects user to IDP with <code>code_challenge</code>. IDP prompts for login, MFA, and validates credentials.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-sky-950 text-sky-400 border border-sky-850 w-5 h-5 rounded-full flex items-center justify-center font-bold">3</span>
                        <span>IDP redirects back to Flight Intelligence with one-time <code>auth_code</code>.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-sky-950 text-sky-400 border border-sky-850 w-5 h-5 rounded-full flex items-center justify-center font-bold">4</span>
                        <span>Backend exchanges <code>auth_code</code> + original <code>code_verifier</code>. IDP validates, responds with <b>JWT Access & Refresh Tokens</b>.</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Device Trust & Multi-Factor Authentication Policies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-2.5">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  MFA Multi-Channel Policy
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  All write scopes and logins from non-trusted browser environments require secondary verification.
                </p>
                <ul className="text-[10px] text-slate-400 space-y-1.5 list-disc pl-4 font-semibold">
                  <li><b>FIDO2 WebAuthn:</b> Primary fallback (Phishing-free Biometrics).</li>
                  <li><b>TOTP (Authenticator Apps):</b> SHA-1 30-second token rotation keys.</li>
                  <li><b>SMS OTP:</b> Deprecated due to SIM-swapping. Limited strictly to initial enrollment bypass.</li>
                </ul>
              </div>

              <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-2.5">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Contextual Device Trust Score
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Our API gateway continuously evaluates browser trust values based on contextual parameters.
                </p>
                <ul className="text-[10px] text-slate-400 space-y-1.5 list-disc pl-4 font-semibold">
                  <li><b>IP Geo-Velocity Check:</b> Flagged if logins occur across extreme geographical distances too fast.</li>
                  <li><b>JA3 Fingerprint Matching:</b> Flags if User-Agent headers mismatch raw TLS handshake protocols.</li>
                  <li><b>MFA Persistence:</b> Extends session trust for 30 days if MFA succeeds from the same device ID.</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeSubTab === "jwt-rbac" && (
        <div className="space-y-6">
          {/* JWT & RBAC Interactive Playground */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Input Variables panel */}
            <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div>
                <h3 className="text-xs font-mono font-bold text-sky-450 uppercase tracking-wide">JWT Payload Parameters</h3>
                <p className="text-[11px] text-slate-500 mt-1">Configure user attributes to dynamically sign and compile an enterprise JWT bearer token.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Provider Login Source</label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-200"
                  >
                    {AUTH_PROVIDERS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Subject Identifier (sub)</label>
                  <input
                    type="text"
                    value={customUserId}
                    onChange={(e) => setCustomUserId(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-250 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">User Email</label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-250 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Assigned RBAC Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-200"
                  >
                    {RBAC_ROLES.map(r => (
                      <option key={r.role} value={r.role}>{r.role}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 uppercase">MFA State</label>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setMfaVerified(!mfaVerified)}
                        className={`w-full py-2 border rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          mfaVerified 
                            ? "bg-emerald-950/40 border-emerald-850 text-emerald-450" 
                            : "bg-slate-950 border-slate-850 text-slate-500"
                        }`}
                      >
                        {mfaVerified ? "MFA Active (2FA)" : "MFA Bypassed"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 uppercase">Device Trust</label>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setDeviceTrustScore(prev => prev === 0.95 ? 0.35 : 0.95)}
                        className={`w-full py-2 border rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          deviceTrustScore >= 0.8 
                            ? "bg-sky-950/40 border-sky-850 text-sky-400" 
                            : "bg-rose-950/40 border-rose-850 text-rose-400"
                        }`}
                      >
                        {deviceTrustScore >= 0.8 ? "Secure (0.95)" : "Suspicious (0.35)"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Dynamic RBAC Policy Evaluator */}
              <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-3.5">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wide font-bold">RBAC Permission Gateway Check</div>
                
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase block">Required Resource API Scope</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. flight:write, user:impersonate"
                      value={testPermissionScope}
                      onChange={(e) => setTestPermissionScope(e.target.value)}
                      className="flex-1 text-xs bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-slate-200 font-mono"
                    />
                    <button
                      onClick={handleCheckPermission}
                      className="px-4 py-2 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-400 text-xs font-black rounded-lg transition-all cursor-pointer"
                    >
                      Verify Scope
                    </button>
                  </div>
                </div>

                {permissionCheckResult && (
                  <div className={`p-3.5 rounded-lg border text-xs leading-normal flex items-start gap-2.5 animate-fadeIn ${
                    permissionCheckResult.allowed 
                      ? "bg-emerald-950/30 border-emerald-900/40 text-emerald-300"
                      : "bg-rose-950/30 border-rose-900/40 text-rose-350"
                  }`}>
                    {permissionCheckResult.allowed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">{permissionCheckResult.allowed ? "ACCESS GRANTED" : "ACCESS DENIED"}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{permissionCheckResult.reason}</div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Dynamic visual representation of JSON Web Token (JWT) Header, Payload and Cryptographic RS256 signature block */}
            <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-5">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-100 tracking-tight">Active JWT Bearer Token Assembly</h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Signed symmetrically/asymmetrically using standard RFC 7519</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-sky-400 bg-sky-950/30 border border-sky-900/40 px-2 py-0.5 rounded">
                  <Activity className="w-3 h-3 animate-pulse" />
                  Live Compiled
                </div>
              </div>

              {/* JWT Structure visualization */}
              <div className="space-y-4 font-mono text-[10px]">
                
                {/* Header (Red/Amber) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-amber-500">
                    <span className="font-bold">JWT HEADER (Metadata)</span>
                    <span className="text-[8px] bg-amber-950/30 border border-amber-900/20 px-1 rounded">RS256 Signature Type</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 text-amber-300">
                    <pre className="overflow-x-auto leading-relaxed">{JWT_HEADER_EXAMPLE}</pre>
                  </div>
                </div>

                {/* Payload (Purple/Blue) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-indigo-400">
                    <span className="font-bold">JWT PAYLOAD (Claims & Scopes)</span>
                    <span className="text-[8px] bg-indigo-950/30 border border-indigo-900/20 px-1 rounded">Expiring in 15m</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 text-sky-450 h-[260px] overflow-y-auto scrollbar-thin">
                    <pre className="overflow-x-auto leading-relaxed">{generatedJwtPayload}</pre>
                  </div>
                </div>

                {/* Signature (Green/Emerald) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="font-bold">CRYPTOGRAPHIC SIGNATURE</span>
                    <span className="text-[8px] bg-emerald-950/40 border border-emerald-900/20 px-1 rounded">Valid HMAC-SHA256 hash</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 text-emerald-500 break-all leading-normal">
                    HMACSHA256(<br/>
                    &nbsp;&nbsp;base64UrlEncode(header) + "." + base64UrlEncode(payload),<br/>
                    &nbsp;&nbsp;<span className="text-slate-500">rsa_private_signing_key_secret_rotated_daily</span><br/>
                    ) <span className="text-sky-400 font-bold">=&gt; sY_1aK4uHjB...2kLp9X1qW_zR7tYe4P</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {activeSubTab === "sessions-audit" && (
        <div className="space-y-6">
          
          {/* Active Sessions Cache (Redis storage simulation) & User Impersonation panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Impersonation Controls & Rules */}
            <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">Secure User Impersonation</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Simulate administrative account impersonation for traveler support auditing.</p>
                </div>
                {impersonationMode ? (
                  <span className="flex items-center gap-1 text-[9px] font-mono text-rose-450 bg-rose-950 border border-rose-900 px-2 py-0.5 rounded animate-pulse font-bold">
                    IMPERSONATING
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-slate-500 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded">
                    STANDBY
                  </span>
                )}
              </div>

              {impersonationMode && (
                <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl text-xs text-amber-400 leading-relaxed space-y-1 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[10px] font-mono">Warning: Active Impersonation Context</span>
                    Every transaction, flight modification, search trigger, or page view performed under this session is signed with cryptographic headers mapping back to impersonating agent <b>{impersonatorName}</b>.
                  </div>
                </div>
              )}

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Administrator Username</label>
                  <input
                    type="text"
                    disabled={impersonationMode}
                    value={impersonatorName}
                    onChange={(e) => setImpersonatorName(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Jira/Approval Security Ticket</label>
                  <input
                    type="text"
                    disabled={impersonationMode}
                    placeholder="e.g. JIRA-SEC-1120"
                    value={impersonationTicket}
                    onChange={(e) => setImpersonationTicket(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Target Traveler Account</label>
                  <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg flex items-center justify-between text-xs">
                    <div className="space-y-0.5 font-mono">
                      <div className="font-bold text-slate-300">Amelia Earhart</div>
                      <div className="text-[10px] text-slate-500">{customUserId}</div>
                    </div>
                    <span className="text-[10px] font-mono bg-sky-950/40 text-sky-450 px-1.5 py-0.2 border border-sky-900/30 rounded">
                      VIP Traveler
                    </span>
                  </div>
                </div>

                <button
                  onClick={toggleImpersonation}
                  className={`w-full py-2.5 border rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    impersonationMode
                      ? "bg-rose-950 hover:bg-rose-900 border-rose-800 text-rose-400"
                      : "bg-sky-950 hover:bg-sky-900 border-sky-850 text-sky-400"
                  }`}
                >
                  {impersonationMode ? (
                    <>
                      <UserX className="w-3.5 h-3.5" />
                      Terminate Support Session
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      Initiate Audit-Signed Impersonation
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Right Column: Active Session state cache (Redis simulation) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-100 tracking-tight">Active Redis Session Key-Value Registry</h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Simulating immediate session revocation over distributed caching grids</p>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-900/30 px-2 py-0.5 rounded font-bold">
                    REDIS ACTIVE
                  </span>
                </div>

                <div className="space-y-3">
                  {sessions.length === 0 ? (
                    <div className="h-[120px] flex flex-col items-center justify-center text-slate-600 text-xs font-mono space-y-1">
                      <CheckCircle className="w-6 h-6 text-slate-700" />
                      <p>All sessions successfully revoked.</p>
                    </div>
                  ) : (
                    sessions.map((ses) => (
                      <div key={ses.id} className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl flex items-center justify-between gap-4">
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-sky-400" />
                            <span className="font-bold text-slate-200">{ses.device}</span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.2 border rounded ${
                              ses.trustScore >= 0.8 
                                ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/20" 
                                : "bg-rose-950/30 text-rose-450 border-rose-900/20"
                            }`}>
                              Trust Score: {ses.trustScore}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] text-slate-500 font-semibold">
                            <div>IP: <span className="text-slate-400">{ses.ip}</span></div>
                            <div>Region: <span className="text-slate-400">{ses.location}</span></div>
                            <div>Last Active: <span className="text-slate-400">{ses.lastActive}</span></div>
                            <div>Key: <span className="text-sky-450">session:{ses.id}</span></div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRevokeSession(ses.id)}
                          className="px-3 py-1.5 hover:bg-rose-950 border border-slate-850 hover:border-rose-900 text-slate-400 hover:text-rose-400 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Revoke
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Immutable Audit Trail Log Stream */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">Immutable System Audit Logs</h3>
                <p className="text-[11px] text-slate-500 mt-1">Real-time trace visualization conforming to WORM (Write Once Read Many) enterprise logging requirements.</p>
              </div>
              <span className="text-[9px] font-mono text-slate-500">FORMAT: JSON STREAM</span>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-900 overflow-hidden font-mono text-[10px]">
              <div className="grid grid-cols-12 bg-slate-900/50 border-b border-slate-900 px-4 py-2 text-slate-400 font-bold uppercase">
                <div className="col-span-1">Timestamp</div>
                <div className="col-span-2 text-indigo-400">Actor</div>
                <div className="col-span-3">Action Class</div>
                <div className="col-span-2">Target</div>
                <div className="col-span-4">Audit Details / Cryptographic Payload</div>
              </div>

              <div className="divide-y divide-slate-900 max-h-[220px] overflow-y-auto scrollbar-thin">
                {auditLogs.map((log, idx) => {
                  let badge = "text-emerald-400 bg-emerald-950/20 border-emerald-900/30";
                  if (log.status === "WARNING") badge = "text-amber-500 bg-amber-950/20 border-amber-900/30";
                  if (log.status === "CRITICAL") badge = "text-rose-400 bg-rose-950/30 border-rose-900/40 animate-pulse font-bold";

                  return (
                    <div key={idx} className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-slate-900/10 text-slate-350">
                      <div className="col-span-1 text-slate-500">{log.timestamp}</div>
                      <div className="col-span-2 text-indigo-400 font-semibold truncate pr-2">{log.actor}</div>
                      <div className="col-span-3">
                        <span className={`px-2 py-0.5 border rounded text-[9px] uppercase ${badge}`}>
                          {log.action}
                        </span>
                      </div>
                      <div className="col-span-2 text-slate-400 truncate pr-2">{log.target}</div>
                      <div className="col-span-4 text-slate-400 text-[10px] font-semibold truncate" title={log.details}>
                        {log.details}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}

      {activeSubTab === "protection" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Edge Security Settings & Traffic Injectors */}
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">Threat & DDoS Gateways</h3>
              <p className="text-[11px] text-slate-500 mt-1">Stress-test API edge token bucket rate limit systems under realistic standard vs bot conditions.</p>
            </div>

            {/* Traffic injection profile selectors */}
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">Attack / Scraping Traffic Profile</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setTrafficMode("standard"); setTurnstileActivated(false); }}
                    className={`p-2.5 border rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                      trafficMode === "standard"
                        ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                        : "bg-slate-950 border-slate-900 text-slate-500"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span className="text-[10px] font-bold">Standard User</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setTrafficMode("bot_scraping"); }}
                    className={`p-2.5 border rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                      trafficMode === "bot_scraping"
                        ? "bg-amber-950/30 border-amber-500/30 text-amber-300"
                        : "bg-slate-950 border-slate-900 text-slate-500"
                    }`}
                  >
                    <Zap className="w-4 h-4 animate-pulse" />
                    <span className="text-[10px] font-bold">Flight Scraper</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setTrafficMode("ddos_attack"); }}
                    className={`p-2.5 border rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                      trafficMode === "ddos_attack"
                        ? "bg-rose-950/30 border-rose-500/30 text-rose-350"
                        : "bg-slate-950 border-slate-900 text-slate-500"
                    }`}
                  >
                    <Flame className="w-4 h-4 animate-bounce text-rose-500" />
                    <span className="text-[10px] font-bold">Volumetric DDoS</span>
                  </button>
                </div>
              </div>

              {/* Start / Stop Traffic Dispatch */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => setIsTrafficRunning(!isTrafficRunning)}
                  className={`py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                    isTrafficRunning
                      ? "bg-rose-950 hover:bg-rose-900 border-rose-800 text-rose-400"
                      : "bg-sky-950 hover:bg-sky-900 border-sky-850 text-sky-400"
                  }`}
                >
                  {isTrafficRunning ? (
                    <>
                      <LogOut className="w-3.5 h-3.5" />
                      Stop Traffic
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Dispatch Traffic
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setRateLimitTokens(100);
                    setBlockedRequestsCount(0);
                    setTurnstileActivated(false);
                    setBotLogs([]);
                  }}
                  className="py-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Reset Rates
                </button>
              </div>

              {/* Live Gate state metrics */}
              <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-3.5">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wide">Live Edge Mitigation Metrics</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono block">Token Bucket Remaining</span>
                    <span className={`text-lg font-black font-mono ${
                      rateLimitTokens > 40 ? "text-emerald-450" : rateLimitTokens > 15 ? "text-amber-450 animate-pulse" : "text-rose-500 animate-pulse"
                    }`}>{rateLimitTokens} / 100</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono block">Blocked Requests (429)</span>
                    <span className={`text-lg font-black font-mono ${
                      blockedRequestsCount > 0 ? "text-rose-400 animate-pulse" : "text-slate-500"
                    }`}>{blockedRequestsCount}</span>
                  </div>
                </div>

                {turnstileActivated && (
                  <div className="bg-amber-950/20 border border-amber-900/30 p-3 rounded-xl flex items-center gap-2 text-[10px] text-amber-450 animate-fadeIn">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span><b>CAPTCHA Challenged:</b> Flight scraper threshold crossed. Turnstile token validation required to resume API calls.</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Real-time Edge API Firewall Tracer logs console */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-sky-400" />
                Edge Gateway Firewall Tracer
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Real-time edge server traces capturing request payload signatures and active throttling states.</p>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 h-[350px] overflow-y-auto flex flex-col justify-between scrollbar-thin font-mono text-[10px]">
              <div className="space-y-2.5">
                {botLogs.length === 0 ? (
                  <div className="h-[290px] flex flex-col items-center justify-center text-slate-650 text-center space-y-2">
                    <Terminal className="w-8 h-8 text-slate-700 animate-pulse" />
                    <div>
                      <p className="font-bold">Edge API Firewall Log Console</p>
                      <p className="text-[9px]">Select a traffic profile and click 'Dispatch Traffic' to generate packet traces.</p>
                    </div>
                  </div>
                ) : (
                  botLogs.map((log, idx) => {
                    let color = "text-slate-400";
                    if (log.includes("429 Too Many Requests") || log.includes("Blocked")) {
                      color = "text-rose-400 font-bold";
                    } else if (log.includes("CAPTCHA")) {
                      color = "text-amber-500 font-semibold";
                    } else if (log.includes("Cost:")) {
                      color = "text-emerald-400 font-semibold";
                    }

                    return (
                      <div key={idx} className={`leading-relaxed ${color} border-b border-slate-900/60 pb-1.5`}>
                        {log}
                      </div>
                    );
                  })
                )}
                <div ref={botLogEndRef} />
              </div>
            </div>

          </div>

        </div>
      )}

      {activeSubTab === "specs" && (
        <div className="space-y-6">
          
          {/* Production Ready Engineering Specs & Architectural Details */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-sky-400" />
                Flight Intelligence platform: Identity Production Specifications
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enterprise guidelines and mathematical paradigms governing token cryptographic operations, secrets rotation frequency, and SSO federation blueprints.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SECURITY_POLICIES.map((policy, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-900 p-5 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wide">{policy.title}</h4>
                  </div>
                  
                  <div className="text-[11px] font-mono bg-sky-950/20 text-sky-350 border border-sky-900/20 p-2.5 rounded-lg">
                    <span className="text-[9px] text-sky-400 block font-bold uppercase">Mechanism Class</span>
                    {policy.mechanism}
                  </div>

                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    <b>Threat Mitigation:</b> {policy.threatMitigation}
                  </p>

                  <div className="space-y-1.5 pt-1.5 border-t border-slate-900">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Engine Specs</span>
                    <ul className="text-[10px] text-slate-400 space-y-1 list-disc pl-4 leading-relaxed font-semibold">
                      {policy.specification.map((spec, sIdx) => (
                        <li key={sIdx}>{spec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* SSO Federation Roadmap (Future Support Matrix) */}
            <div className="bg-slate-950/40 border border-slate-900 p-6 rounded-xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-sky-450 uppercase tracking-wide">SSO Federation & Enterprise SAML 2.0 Roadmap</h3>
              <p className="text-[11px] text-slate-400 leading-normal font-semibold">
                To expand into Tier-1 global airline alliances (e.g., Star Alliance, Oneworld), the IDP incorporates an extensible SSO connector module mapped directly behind our JWT Gateway.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-lg space-y-1.5">
                  <span className="text-xs font-bold text-slate-200 block">SAML 2.0 Federation</span>
                  <p className="text-[10px] text-slate-400 leading-normal font-semibold">
                    Support XML-based assertion exchanges from partner operator IDPs using verified secure certificate signing keys.
                  </p>
                </div>
                
                <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-lg space-y-1.5">
                  <span className="text-xs font-bold text-slate-200 block">SCIM 2.0 Provisioning</span>
                  <p className="text-[10px] text-slate-400 leading-normal font-semibold">
                    Automate enterprise identity synchronization and offboarding (joiners, movers, leavers) via standard SCIM API endpoints.
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-lg space-y-1.5">
                  <span className="text-xs font-bold text-slate-200 block">Dynamic Tenant Routing</span>
                  <p className="text-[10px] text-slate-400 leading-normal font-semibold">
                    Identify corporate users by email domain and dynamically route OIDC redirection parameters to company-specific tenants.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
