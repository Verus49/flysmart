import React, { useState, useEffect, useMemo } from "react";
import { 
  Network,
  Activity,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Clock,
  Settings,
  Sliders,
  Radio,
  Copy,
  Plus,
  ArrowRight,
  Database,
  Globe,
  RefreshCw,
  Terminal,
  FileCode,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  Key,
  Flame,
  Unlock,
  Lock,
  Workflow
} from "lucide-react";

// Types for Gateway Simulator
type GatewaySubTab = "routing" | "security" | "resiliency" | "caching" | "federation" | "gitops";
type VersioningStrategy = "header" | "url_path" | "query_param";
type LbAlgorithm = "round_robin" | "least_conn" | "ip_hash";
type CompressionType = "none" | "gzip" | "brotli";
type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF-OPEN";

interface SimulatedBackendNode {
  id: string;
  name: string;
  region: string;
  weight: number;
  connections: number;
  isHealthy: boolean;
  responseTimeMs: number;
}

interface RequestStepLog {
  stage: string;
  status: "success" | "warning" | "error" | "info";
  message: string;
}

export default function ApiGatewayExplorer() {
  const [activeSubTab, setActiveSubTab] = useState<GatewaySubTab>("routing");

  // Telemetry tick
  const [metricsTick, setMetricsTick] = useState<number>(0);
  const [requestsCount, setRequestsCount] = useState<number>(1829402);
  const [p99Latency, setP99Latency] = useState<number>(14.2);
  const [averageLatency, setAverageLatency] = useState<number>(4.2);
  const [errorRate, setErrorRate] = useState<number>(0.04);

  // --- 1. ROUTING & TRANSCODING STATE ---
  const [routeProtocol, setRouteProtocol] = useState<"REST" | "GraphQL" | "gRPC">("REST");
  const [versionStrategy, setVersionStrategy] = useState<VersioningStrategy>("header");
  const [apiVersion, setApiVersion] = useState<string>("v2");
  const [isUrlValidationEnabled, setIsUrlValidationEnabled] = useState<boolean>(true);

  // --- 2. AUTHENTICATION & RATE LIMITING STATE ---
  const [rateLimitCapacity, setRateLimitCapacity] = useState<number>(100);
  const [rateLimitRefillRate, setRateLimitRefillRate] = useState<number>(10);
  const [currentTokens, setCurrentTokens] = useState<number>(100);
  const [jwtIssuer, setJwtIssuer] = useState<string>("https://auth.flysmart.internal");
  const [jwtScopes, setJwtScopes] = useState<string[]>(["flights:read", "booking:create"]);
  const [tokenTampered, setTokenTampered] = useState<boolean>(false);
  const [jwtExpTime, setJwtExpTime] = useState<number>(3600); // 1 hour

  // --- 3. RESILIENCY & LOAD BALANCING STATE ---
  // Circuit Breaker Config
  const [cbFailureThreshold, setCbFailureThreshold] = useState<number>(50); // %
  const [cbRecoveryTimeout, setCbRecoveryTimeout] = useState<number>(5000); // ms
  const [cbMaxRetries, setCbMaxRetries] = useState<number>(3);
  const [cbRetryBackoff, setCbRetryBackoff] = useState<number>(200); // ms
  const [cbState, setCbState] = useState<CircuitBreakerState>("CLOSED");
  const [failuresCount, setFailuresCount] = useState<number>(0);
  
  // Load Balancing Config
  const [lbAlgorithm, setLbAlgorithm] = useState<LbAlgorithm>("round_robin");
  const [backendNodes, setBackendNodes] = useState<SimulatedBackendNode[]>([
    { id: "node-1", name: "gke-us-east-pod1", region: "us-east-1", weight: 50, connections: 12, isHealthy: true, responseTimeMs: 4 },
    { id: "node-2", name: "gke-us-east-pod2", region: "us-east-1", weight: 50, connections: 8, isHealthy: true, responseTimeMs: 6 },
    { id: "node-3", name: "gke-eu-west-pod1", region: "eu-west-1", weight: 80, connections: 24, isHealthy: true, responseTimeMs: 12 },
    { id: "node-4", name: "gke-eu-west-pod2", region: "eu-west-1", weight: 20, connections: 4, isHealthy: false, responseTimeMs: 95 } // Degraded/unhealthy node
  ]);

  // --- 4. CACHING & COMPRESSION STATE ---
  const [cacheTtl, setCacheTtl] = useState<number>(60); // seconds
  const [compressionType, setCompressionType] = useState<CompressionType>("brotli");
  const [cacheBypassHeader, setCacheBypassHeader] = useState<boolean>(false);
  const [simulatedCache, setSimulatedCache] = useState<Record<string, { data: string; expiresAt: number }>>({
    "/api/v2/flights/search?from=JFK&to=LHR": { data: '{"results": 142}', expiresAt: Date.now() + 120000 },
    "/api/v2/partners/ndc/offers": { data: '{"offers": 89}', expiresAt: Date.now() + 45000 }
  });

  // --- 5. SCHEMA FEDERATION STATE ---
  const [selectedSubgraph, setSelectedSubgraph] = useState<"Flights" | "Pricing" | "Identity" | "Baggage">("Flights");

  // --- Request Simulator State ---
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0); // percentage
  const [simulationLogs, setSimulationLogs] = useState<RequestStepLog[]>([]);
  const [simulationResult, setSimulationResult] = useState<{
    statusCode: number;
    latencyMs: number;
    headers: Record<string, string>;
    body: string;
  } | null>(null);

  // Auto-refill tokens for Rate Limiting simulation
  useEffect(() => {
    const refillInterval = setInterval(() => {
      setCurrentTokens(prev => {
        const next = prev + (rateLimitRefillRate / 10);
        return next > rateLimitCapacity ? rateLimitCapacity : Math.round(next * 10) / 10;
      });
    }, 100);

    return () => clearInterval(refillInterval);
  }, [rateLimitCapacity, rateLimitRefillRate]);

  // Periodically fluctuate dashboard metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetricsTick(t => t + 1);
      setRequestsCount(prev => prev + Math.floor(Math.random() * 45) + 15);
      setAverageLatency(prev => {
        const drift = (Math.random() - 0.5) * 0.4;
        return Math.max(2.8, Math.min(6.2, parseFloat((prev + drift).toFixed(2))));
      });
      setP99Latency(prev => {
        const drift = (Math.random() - 0.5) * 1.2;
        return Math.max(11.5, Math.min(18.5, parseFloat((prev + drift).toFixed(1))));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // --- COMPUTE REAL-TIME DERIVED CONFIGS FOR GITOPS ---
  const envoyConfig = useMemo(() => {
    return `static_resources:
  listeners:
  - name: external_gateway_listener
    address:
      socket_address: { address: 0.0.0.0, port_value: 443 }
    filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          stat_prefix: ingress_http
          route_config:
            name: local_route
            virtual_hosts:
            - name: flysmart_edge
              domains: ["api.flysmart.com"]
              routes:
              - match: { prefix: "/api/${apiVersion}" }
                route:
                  cluster: gke_backend_cluster
                  timeout: 3.000s
                  retry_policy:
                    retry_on: "5xx,connect-failure,refused-stream"
                    num_retries: ${cbMaxRetries}
                    per_try_timeout: 0.250s
                    retry_back_off:
                      base_interval: 0.050s
                      max_interval: ${cbRetryBackoff / 1000}s
          http_filters:
          - name: envoy.filters.http.jwt_authn
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.filters.http.jwt_authn.v3.JwtAuthentication
              providers:
                flysmart_idp:
                  issuer: ${jwtIssuer}
                  audiences: ["api.flysmart.com"]
                  remote_jwks:
                    http_uri:
                      uri: ${jwtIssuer}/.well-known/jwks.json
                      cluster: auth_service
                      timeout: 1s
                    cache_duration: 300s
          - name: envoy.filters.http.local_ratelimit
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.filters.http.local_ratelimit.v3.LocalRateLimit
              stat_prefix: local_rate_limiter
              token_bucket:
                max_tokens: ${rateLimitCapacity}
                tokens_per_fill: ${rateLimitRefillRate}
                fill_interval: 1s
          - name: envoy.filters.http.router
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router`;
  }, [apiVersion, cbMaxRetries, cbRetryBackoff, jwtIssuer, rateLimitCapacity, rateLimitRefillRate]);

  const kongConfig = useMemo(() => {
    return `_format_version: "3.0"
services:
  - name: flysmart-core-service
    url: http://internal-lb.gke.prod.central
    routes:
      - name: secure-v2-api
        paths:
          - /api/${apiVersion}
        protocols:
          - https
    plugins:
      - name: jwt
        config:
          key_claim_name: kid
          secret_is_base64: false
          claims_to_verify:
            - exp
            - nbf
      - name: rate-limiting
        config:
          second: ${rateLimitRefillRate}
          hour: ${rateLimitCapacity * 10}
          policy: redis
          redis_host: cache-cluster-001.internal
          redis_port: 6379
      - name: response-transformer
        config:
          add:
            headers:
              - "X-FlySmart-Gateway-Version: 2.8-prod"
              - "X-Content-Type-Options: nosniff"
      - name: request-validator
        config:
          body_schema: "v2-validation-spec"
          allowed_content_types:
            - application/json
            - application/x-protobuf`;
  }, [apiVersion, rateLimitCapacity, rateLimitRefillRate]);

  const apolloConfig = useMemo(() => {
    return `# Apollo Router Schema Federation Configuration
federation:
  supergraph: supergraph-schema.graphql
  subgraphs:
    flights:
      routing_url: http://flights-subgraph.prod.svc.cluster.local:4001
    pricing:
      routing_url: http://pricing-subgraph.prod.svc.cluster.local:4002
    identity:
      routing_url: http://identity-subgraph.prod.svc.cluster.local:4003
    baggage:
      routing_url: http://baggage-subgraph.prod.svc.cluster.local:4004

headers:
  all:
    request:
      - propagate:
          matching: ^x-flysmart-.*
      - set:
          name: "x-gateway-transcoder"
          value: "apollo-router-federation"

traffic_shaping:
  all:
    compression:
      type: ${compressionType === "none" ? "none" : compressionType}
    timeout: 3.5s
    deduplication:
      filtered_headers: ["Authorization"]

caching:
  redis:
    urls: ["redis://cache-cluster-001.internal:6379"]
  subgraphs:
    all:
      max_age: ${cacheTtl}s`;
  }, [compressionType, cacheTtl]);

  // Handle single manual addition of mock node
  const handleAddNode = () => {
    const id = `node-${backendNodes.length + 1}`;
    setBackendNodes([
      ...backendNodes,
      {
        id,
        name: `gke-eu-west-pod${backendNodes.length - 1}`,
        region: "eu-west-1",
        weight: 50,
        connections: 0,
        isHealthy: true,
        responseTimeMs: 8
      }
    ]);
  };

  // Toggle backend node health
  const toggleNodeHealth = (id: string) => {
    setBackendNodes(nodes =>
      nodes.map(n => (n.id === id ? { ...n, isHealthy: !n.isHealthy } : n))
    );
  };

  // Run the full step-by-step request flow simulation
  const runSimulator = () => {
    if (simulationActive) return;
    setSimulationActive(true);
    setSimulationProgress(0);
    setSimulationResult(null);
    
    const logs: RequestStepLog[] = [
      { stage: "ingress", status: "info", message: `[Gateway Ingress] Received API call routing target: /api/${apiVersion}/flights/search` }
    ];
    setSimulationLogs([...logs]);

    // Delay schedule for processing steps
    let step = 0;
    const totalSteps = 6;
    const stepDuration = 400;

    const interval = setInterval(() => {
      step++;
      setSimulationProgress((step / totalSteps) * 100);

      if (step === 1) {
        // Step 1: Request Validation
        if (isUrlValidationEnabled) {
          logs.push({
            stage: "validation",
            status: "success",
            message: `[Schema Matcher] URI matched static endpoints. Query parameters schema checks passed.`
          });
        } else {
          logs.push({
            stage: "validation",
            status: "warning",
            message: `[Schema Matcher] Strict request validation bypassed.`
          });
        }
      } else if (step === 2) {
        // Step 2: Auth Verification
        if (tokenTampered) {
          logs.push({
            stage: "auth",
            status: "error",
            message: `[JWT Validator] Signature verification failed! Key mismatch detected.`
          });
          setSimulationResult({
            statusCode: 401,
            latencyMs: 1.5,
            headers: {
              "Content-Type": "application/json",
              "WWW-Authenticate": 'Bearer error="invalid_token", error_description="The signature is invalid"',
              "X-FlySmart-Trace": "tr_err_auth_8a2d1"
            },
            body: JSON.stringify({ error: "Unauthorized", message: "JWT Signature Mismatch", code: "AUTH_SIG_INVALID" }, null, 2)
          });
          clearInterval(interval);
          setSimulationActive(false);
          return;
        } else {
          logs.push({
            stage: "auth",
            status: "success",
            message: `[JWT Validator] Valid signature. Claims verified: issuer "${jwtIssuer}", Scopes: [${jwtScopes.join(", ")}].`
          });
        }
      } else if (step === 3) {
        // Step 3: Rate Limiting check
        if (currentTokens < 1) {
          logs.push({
            stage: "ratelimit",
            status: "error",
            message: `[Token Bucket] Token deficit! Current bucket has 0 tokens remaining. Throttling active.`
          });
          setSimulationResult({
            statusCode: 429,
            latencyMs: 1.2,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "2",
              "X-RateLimit-Limit": rateLimitCapacity.toString(),
              "X-RateLimit-Remaining": "0"
            },
            body: JSON.stringify({ error: "Too Many Requests", message: "API limit exceeded. Refill bucket is throttled.", retry_after_sec: 2 }, null, 2)
          });
          clearInterval(interval);
          setSimulationActive(false);
          return;
        } else {
          setCurrentTokens(prev => Math.max(0, prev - 1));
          logs.push({
            stage: "ratelimit",
            status: "success",
            message: `[Token Bucket] Request authorized. Consumed 1 token. Remaining: ${Math.floor(currentTokens - 1)} tokens.`
          });
        }
      } else if (step === 4) {
        // Step 4: Caching layer
        if (!cacheBypassHeader) {
          logs.push({
            stage: "cache",
            status: "success",
            message: `[Distributed Cache] Cache hit! Response resolved directly from standard Edge-Redis layer without upstream routing.`
          });
          
          const rawPayload = `{"results": 142, "origin": "JFK", "destination": "LHR", "cache_status": "HIT", "source": "NDC_Aggregator"}`;
          const finalSizeKB = compressionType === "brotli" ? 3.4 : compressionType === "gzip" ? 5.8 : 15.2;

          setSimulationResult({
            statusCode: 200,
            latencyMs: 1.8,
            headers: {
              "Content-Type": "application/json",
              "X-Cache": "HIT",
              "Cache-Control": `public, max-age=${cacheTtl}`,
              "Content-Encoding": compressionType === "none" ? "identity" : compressionType,
              "Content-Length": `${Math.round(finalSizeKB * 1024)}`,
              "Vary": "Accept-Encoding"
            },
            body: rawPayload
          });
          clearInterval(interval);
          setSimulationActive(false);
          return;
        } else {
          logs.push({
            stage: "cache",
            status: "warning",
            message: `[Distributed Cache] Cache bypassed. Header 'Cache-Control: no-cache' parsed. Upstream routing enforced.`
          });
        }
      } else if (step === 5) {
        // Step 5: Circuit Breaker & Resiliency
        if (cbState === "OPEN") {
          logs.push({
            stage: "resiliency",
            status: "error",
            message: `[Circuit Breaker] Gateway state is OPEN. Fast-failing upstream routing request to prevent backend cascade failures.`
          });
          setSimulationResult({
            statusCode: 503,
            latencyMs: 2.1,
            headers: {
              "Content-Type": "application/json",
              "X-Circuit-State": "OPEN",
              "Retry-After": "5"
            },
            body: JSON.stringify({ error: "Service Unavailable", message: "Circuit breaker is active. Upstream service disabled temporarily.", code: "GATEWAY_CB_ACTIVE" }, null, 2)
          });
          clearInterval(interval);
          setSimulationActive(false);
          return;
        } else {
          logs.push({
            stage: "resiliency",
            status: "success",
            message: `[Circuit Breaker] State is ${cbState}. Upstream check passed.`
          });
        }
      } else if (step === 6) {
        // Step 6: Load Balancing & Upstream Routing
        const healthyNodes = backendNodes.filter(n => n.isHealthy);
        if (healthyNodes.length === 0) {
          logs.push({
            stage: "loadbalancer",
            status: "error",
            message: `[Load Balancer] CRITICAL: No healthy upstream servers identified in region targets!`
          });
          setFailuresCount(prev => {
            const next = prev + 1;
            if (next >= 3) setCbState("OPEN");
            return next;
          });
          setSimulationResult({
            statusCode: 502,
            latencyMs: 125,
            headers: {
              "Content-Type": "application/json",
              "X-FlySmart-Gateway-Error": "GATEWAY_LB_ZERO_HOSTS"
            },
            body: JSON.stringify({ error: "Bad Gateway", message: "No healthy upstream hosts found in GKE active clusters.", code: "UPSTREAM_HOST_FAILURE" }, null, 2)
          });
        } else {
          // Select based on LB Algorithm
          let targetNode = healthyNodes[0];
          if (lbAlgorithm === "round_robin") {
            targetNode = healthyNodes[Math.floor(Math.random() * healthyNodes.length)];
          } else if (lbAlgorithm === "least_conn") {
            targetNode = [...healthyNodes].sort((a, b) => a.connections - b.connections)[0];
          } else {
            targetNode = healthyNodes[0]; // fallback
          }

          logs.push({
            stage: "loadbalancer",
            status: "success",
            message: `[Router] Upstream target resolved: ${targetNode.name} (${targetNode.region}). Protocol matched: http/2 gRPC transcoding.`
          });

          const rawPayload = `{"results": 142, "origin": "JFK", "destination": "LHR", "cache_status": "MISS", "served_by": "${targetNode.name}"}`;
          const finalSizeKB = compressionType === "brotli" ? 3.4 : compressionType === "gzip" ? 5.8 : 15.2;

          setSimulationResult({
            statusCode: 200,
            latencyMs: targetNode.responseTimeMs + 2,
            headers: {
              "Content-Type": "application/json",
              "X-Cache": "MISS",
              "X-Upstream-Server": targetNode.name,
              "Content-Encoding": compressionType === "none" ? "identity" : compressionType,
              "Content-Length": `${Math.round(finalSizeKB * 1024)}`
            },
            body: rawPayload
          });
        }
        clearInterval(interval);
        setSimulationActive(false);
      }
      setSimulationLogs([...logs]);
    }, stepDuration);
  };

  // Reset circuit breaker failure count
  const resetCircuitBreaker = () => {
    setFailuresCount(0);
    setCbState("CLOSED");
  };

  return (
    <div className="space-y-6" id="api-gateway-control-center">
      {/* 1. Header & Live Gateway Telemetry */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-40 bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-semibold">Gateway Core Status: Active-Active</span>
            </div>
            <h2 className="text-xl font-black text-slate-100 mt-1 tracking-tight flex items-center gap-2">
              <Network className="w-5 h-5 text-sky-400" />
              <span>Edge API Gateway Orchestrator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Enterprise routing proxy deployed across global Cloud Run regions, coordinating OAuth/JWT verification, deep request validation, schema federation, and failure recovery.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-400">
              CLUSTER: <strong className="text-sky-400">gke-global-mesh</strong>
            </span>
            <span className="text-[10px] font-mono bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-400">
              ENGINE: <strong className="text-indigo-400">Envoy proxy v1.30</strong>
            </span>
          </div>
        </div>

        {/* Dynamic Telemetry Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Requests Routed</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-lg font-bold text-slate-100 font-mono">
                {requestsCount.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">+{Math.floor(Math.random() * 20) + 10} r/s</span>
            </div>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Avg Gateway Overhead</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-lg font-bold text-sky-400 font-mono">
                {averageLatency}ms
              </span>
              <span className="text-[10px] text-slate-500 font-mono">p99: {p99Latency}ms</span>
            </div>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">TLS Termination Ratio</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-lg font-bold text-indigo-400 font-mono">100.0%</span>
              <span className="text-[10px] text-indigo-400 font-mono">HTTP/2 TLSv1.3</span>
            </div>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Gateway Error Rate</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-lg font-bold text-rose-500 font-mono">
                {(errorRate * 100).toFixed(3)}%
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">SLA Target &lt;0.05%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Policy Sub Tabs */}
        <div className="lg:col-span-3 space-y-2">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-3 mb-2">
            Gateway Modules
          </div>
          {[
            { id: "routing", label: "Routing & Transcoding", icon: Workflow, color: "text-sky-400" },
            { id: "security", label: "Security & Auth", icon: Shield, color: "text-indigo-400" },
            { id: "resiliency", label: "Resiliency & CB", icon: Zap, color: "text-rose-500" },
            { id: "caching", label: "Cache & Compression", icon: Sliders, color: "text-emerald-400" },
            { id: "federation", label: "Schema Federation", icon: Layers, color: "text-amber-400" },
            { id: "gitops", label: "GitOps Declarative Specs", icon: FileCode, color: "text-teal-400" }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id as GatewaySubTab)}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 border ${
                  activeSubTab === item.id
                    ? "bg-slate-900 border-slate-800 text-sky-400 shadow-xl"
                    : "border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab Specific Sub-Console */}
        <div className="lg:col-span-9 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm min-h-[440px]">
          {/* A. Routing Tab */}
          {activeSubTab === "routing" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-sky-400" />
                  <span>Request Routing & Protocol Transcoding</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure endpoints, map versions, and allow dynamic protocol transcoding (e.g., HTTP REST payloads converted instantly to high-speed upstream gRPC/gRPC-Web calls).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                    <label className="text-[11px] font-mono text-slate-400 uppercase block">Active Gateway Protocol</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["REST", "GraphQL", "gRPC"].map((proto) => (
                        <button
                          key={proto}
                          onClick={() => setRouteProtocol(proto as any)}
                          className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                            routeProtocol === proto
                              ? "bg-sky-950/40 border-sky-500/30 text-sky-400"
                              : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {proto}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                    <label className="text-[11px] font-mono text-slate-400 uppercase block">API Version Routing Model</label>
                    <div className="space-y-2">
                      {[
                        { id: "header", label: "Accept Header Routing", desc: "Accept: application/vnd.flysmart.v2+json" },
                        { id: "url_path", label: "URL Path Parameter", desc: "api.flysmart.com/v2/flights" },
                        { id: "query_param", label: "Query Parameter Selector", desc: "/flights?api_version=v2" }
                      ].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setVersionStrategy(item.id as VersioningStrategy)}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                            versionStrategy === item.id
                              ? "bg-slate-900 border-slate-700 text-slate-200"
                              : "border-slate-800/60 hover:border-slate-800 text-slate-400"
                          }`}
                        >
                          <div>
                            <span className="text-xs font-semibold block text-slate-200">{item.label}</span>
                            <span className="text-[10px] text-slate-500 block font-mono mt-0.5">{item.desc}</span>
                          </div>
                          <Radio className={`w-4 h-4 text-sky-400 ${versionStrategy === item.id ? "opacity-100" : "opacity-30"}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Routing Topology Visual */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase block mb-3">Gateway Routing Topology Map</span>
                    
                    <div className="space-y-4">
                      {/* Gateway Core Node */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between relative">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 bg-sky-950 border border-sky-500/20 rounded-lg flex items-center justify-center">
                            <Workflow className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold block text-slate-100">FlySmart API Edge</span>
                            <span className="text-[10px] text-slate-500 block">Ingress Filter Rules</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-sky-950/40 border border-sky-500/20 text-sky-400 px-2 py-0.5 rounded">
                          HTTP/2 TLS
                        </span>
                      </div>

                      {/* Path Arrows */}
                      <div className="flex justify-center my-1">
                        <div className="h-6 w-0.5 border-l border-dashed border-slate-800"></div>
                      </div>

                      {/* Transcoder middleware */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 bg-indigo-950 border border-indigo-500/20 rounded-lg flex items-center justify-center">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold block text-slate-100">Transcoder Middleware</span>
                            <span className="text-[10px] text-slate-500 block">Mapping {routeProtocol} to upstream schemas</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">
                          {routeProtocol === "REST" ? "JSON-to-HTTP" : routeProtocol === "gRPC" ? "gRPC Transcoding" : "Federated Node"}
                        </span>
                      </div>

                      {/* Path Arrows */}
                      <div className="flex justify-center my-1">
                        <div className="h-6 w-0.5 border-l border-dashed border-slate-800"></div>
                      </div>

                      {/* Backend Target */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 bg-emerald-950 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Database className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold block text-slate-100">Target Microservices Mesh</span>
                            <span className="text-[10px] text-slate-500 block">GKE Private Cluster IP Pods</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                          Internal VPC
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Strict URL Input Validation</span>
                    <button
                      onClick={() => setIsUrlValidationEnabled(!isUrlValidationEnabled)}
                      className={`font-semibold px-2.5 py-1 rounded transition-all ${
                        isUrlValidationEnabled
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-950 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {isUrlValidationEnabled ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B. Security Tab */}
          {activeSubTab === "security" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  <span>Security: JWT Authentication & Token-Bucket Rate Limiter</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Secure inbound traffic using OAuth2 standards and prevent Denial of Service (DoS) attacks with highly responsive, granular rate limits based on Token Buckets.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Auth Settings */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block border-b border-slate-800 pb-2">JWT Signature Guard</span>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase block">Configured JWT Issuer (iss)</label>
                    <input
                      type="text"
                      value={jwtIssuer}
                      onChange={(e) => setJwtIssuer(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase block">Granted Scopes</label>
                    <div className="flex flex-wrap gap-1.5">
                      {["flights:read", "booking:create", "partners:all", "admin:write"].map((scope) => {
                        const hasScope = jwtScopes.includes(scope);
                        return (
                          <button
                            key={scope}
                            onClick={() => {
                              if (hasScope) {
                                setJwtScopes(jwtScopes.filter(s => s !== scope));
                              } else {
                                setJwtScopes([...jwtScopes, scope]);
                              }
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                              hasScope
                                ? "bg-indigo-950/60 border-indigo-500/20 text-indigo-400"
                                : "bg-slate-950 border-slate-800/80 text-slate-500"
                            }`}
                          >
                            {scope}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>JWT Security Status</span>
                      <span className={tokenTampered ? "text-rose-400" : "text-emerald-400"}>
                        {tokenTampered ? "Tampered Token" : "Verified Safe"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Instruct the client request validator to simulate signature verification key failures.
                    </p>
                    <button
                      onClick={() => setTokenTampered(!tokenTampered)}
                      className={`w-full py-2 rounded-lg text-xs font-semibold transition-all border ${
                        tokenTampered
                          ? "bg-emerald-950 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-950/60 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {tokenTampered ? "Restore Authenticator Signature Key" : "Simulate Invalid Auth Signature Match"}
                    </button>
                  </div>
                </div>

                {/* Rate Limiter Settings */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase block border-b border-slate-800 pb-2 mb-3">Token Bucket Rate Limiter</span>
                    
                    <div className="space-y-4">
                      {/* Token Bucket Visual */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-semibold">Active Refill Bucket Status</span>
                          <span className="text-sky-400 font-mono font-bold">{Math.floor(currentTokens)} / {rateLimitCapacity} Tokens</span>
                        </div>
                        
                        {/* Visual fill gauge */}
                        <div className="w-full bg-slate-950 rounded-full h-3.5 border border-slate-800/80 overflow-hidden relative">
                          <div 
                            className={`h-full transition-all duration-100 ${
                              currentTokens < (rateLimitCapacity * 0.2) 
                                ? "bg-rose-500" 
                                : currentTokens < (rateLimitCapacity * 0.5) 
                                ? "bg-amber-500" 
                                : "bg-sky-400"
                            }`}
                            style={{ width: `${(currentTokens / rateLimitCapacity) * 100}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>Bucket empty threshold (0)</span>
                          <span>Max Capacity ({rateLimitCapacity})</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Bucket Peak Capacity (Burst limit)</span>
                            <span className="text-slate-300 font-mono font-semibold">{rateLimitCapacity} reqs</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="500"
                            step="10"
                            value={rateLimitCapacity}
                            onChange={(e) => {
                              setRateLimitCapacity(parseInt(e.target.value));
                              setCurrentTokens(parseInt(e.target.value));
                            }}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Refill Rate per Second</span>
                            <span className="text-slate-300 font-mono font-semibold">{rateLimitRefillRate} req/s</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="100"
                            step="1"
                            value={rateLimitRefillRate}
                            onChange={(e) => setRateLimitRefillRate(parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 p-3 border border-slate-800/60 rounded-xl flex items-center gap-2 text-[11px] text-slate-400 leading-relaxed mt-4">
                    <Activity className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Real-time Redis backend synchronization prevents bypass and ensures atomic rate enforcement across multiple cluster nodes.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* C. Resiliency Tab */}
          {activeSubTab === "resiliency" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-rose-500" />
                  <span>Resiliency: Circuit Breaker, Retries & Load Balancing</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Prevent cascading server failures with an intelligent automated Circuit Breaker state machine, exponential retry strategies, and balanced cluster georouting.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Resiliency Settings */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block border-b border-slate-800 pb-2">Circuit Breaker & Retries Configuration</span>
                  
                  {/* CB State Machine Status */}
                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">State Machine Mode</span>
                      <span className={`text-sm font-black tracking-wider block mt-0.5 ${
                        cbState === "CLOSED" 
                          ? "text-emerald-400" 
                          : cbState === "OPEN" 
                          ? "text-rose-400" 
                          : "text-amber-400 animate-pulse"
                      }`}>
                        ● STATE_{cbState}
                      </span>
                    </div>
                    
                    <div className="flex gap-1">
                      {["CLOSED", "OPEN", "HALF-OPEN"].map((st) => (
                        <button
                          key={st}
                          onClick={() => setCbState(st as CircuitBreakerState)}
                          className={`text-[9px] font-mono px-2 py-1 rounded border transition-all ${
                            cbState === st
                              ? "bg-slate-950 border-slate-700 text-sky-400"
                              : "bg-slate-950/40 border-slate-800/60 text-slate-500"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Failure Threshold ratio</span>
                      <span className="font-mono font-semibold text-slate-300">{cbFailureThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={cbFailureThreshold}
                      onChange={(e) => setCbFailureThreshold(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-slate-400">Recovery Wait Timeout</span>
                      <span className="font-mono font-semibold text-slate-300">{(cbRecoveryTimeout / 1000).toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="10000"
                      step="500"
                      value={cbRecoveryTimeout}
                      onChange={(e) => setCbRecoveryTimeout(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-500 uppercase block">Max Retry Attempts</label>
                        <select 
                          value={cbMaxRetries} 
                          onChange={(e) => setCbMaxRetries(parseInt(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none"
                        >
                          {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} retries</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-500 uppercase block">Backoff base interval</label>
                        <select 
                          value={cbRetryBackoff} 
                          onChange={(e) => setCbRetryBackoff(parseInt(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none"
                        >
                          {[100, 200, 500, 1000].map(v => <option key={v} value={v}>{v}ms backoff</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-slate-400 block">Consecutive Upstream Failures</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">Triggers State-Change to OPEN if threshold reached</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-400 bg-rose-950 border border-rose-500/20 px-2 py-0.5 rounded text-xs">{failuresCount} / 3</span>
                      <button 
                        onClick={resetCircuitBreaker}
                        className="p-1 rounded hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-all border border-slate-800/80"
                        title="Reset state and failures"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Load Balancing Settings */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase block border-b border-slate-800 pb-2 mb-3">Load Balancer Targets</span>
                    
                    <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase pb-1 border-b border-slate-900/60 mb-1">
                        <span>Node Name</span>
                        <span>Region</span>
                        <span>Weight</span>
                        <span>Health</span>
                      </div>
                      
                      {backendNodes.map((node) => (
                        <div key={node.id} className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2 flex items-center justify-between text-xs font-mono">
                          <div className="flex flex-col">
                            <span className="text-slate-200 font-semibold">{node.name}</span>
                            <span className="text-[9px] text-slate-500">conn: {node.connections} | latency: {node.responseTimeMs}ms</span>
                          </div>
                          <span className="text-slate-400">{node.region}</span>
                          <span className="text-indigo-400">{node.weight}%</span>
                          <button
                            onClick={() => toggleNodeHealth(node.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              node.isHealthy
                                ? "bg-emerald-950 text-emerald-400 border-emerald-500/10"
                                : "bg-rose-950 text-rose-400 border-rose-500/10"
                            }`}
                          >
                            {node.isHealthy ? "ONLINE" : "OFFLINE"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">ALGORITHM:</span>
                      <select
                        value={lbAlgorithm}
                        onChange={(e) => setLbAlgorithm(e.target.value as LbAlgorithm)}
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-300 focus:outline-none"
                      >
                        <option value="round_robin">Round Robin</option>
                        <option value="least_conn">Least Connections</option>
                        <option value="ip_hash">IP Hash</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={handleAddNode}
                      className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-850 text-slate-300 font-semibold rounded border border-slate-800 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Scale Node</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* D. Caching Tab */}
          {activeSubTab === "caching" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  <span>Distributed Cache & Compression Optimization</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tune distributed Redis caching values and request compression engines directly in the API pipeline to improve response speed and save WAN egress bandwidth.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                    <span className="text-[11px] font-mono text-slate-400 uppercase block border-b border-slate-800 pb-2">Cache Parameters</span>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Default Cache TTL (Time-To-Live)</span>
                        <span className="text-emerald-400 font-mono font-semibold">{cacheTtl}s</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="300"
                        step="5"
                        value={cacheTtl}
                        onChange={(e) => setCacheTtl(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2">
                      <div className="flex flex-col">
                        <span className="text-slate-300 font-semibold">Enable Bypass Headers</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">Allows 'Cache-Control: no-cache' to fetch upstream</span>
                      </div>
                      <button
                        onClick={() => setCacheBypassHeader(!cacheBypassHeader)}
                        className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
                          cacheBypassHeader
                            ? "bg-emerald-950 text-emerald-400 border-emerald-500/20"
                            : "bg-slate-900 text-slate-400 border-slate-800"
                        }`}
                      >
                        {cacheBypassHeader ? "ENABLED" : "DISABLED"}
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                    <span className="text-[11px] font-mono text-slate-400 uppercase block border-b border-slate-800 pb-2">Payload Compression Options</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "none", label: "Identity", desc: "No compression" },
                        { id: "gzip", label: "Gzip v1.2", desc: "Balanced" },
                        { id: "brotli", label: "Brotli v1.1", desc: "Extreme ratio" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setCompressionType(item.id as CompressionType)}
                          className={`p-2 rounded-xl text-left border transition-all ${
                            compressionType === item.id
                              ? "bg-slate-900 border-slate-700 text-slate-200"
                              : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <span className="text-xs font-bold block">{item.label}</span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Performance stats simulation */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase block mb-3">Gateway Compression & Latency Simulation</span>
                    
                    <div className="space-y-4">
                      {/* Size chart */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Mock Search Flight Payload Size</span>
                        
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400">Uncompressed JSON</span>
                              <span className="text-slate-300 font-mono font-bold">150.4 KB</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-2">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: "100%" }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-emerald-400 font-semibold">Compressed Size ({compressionType})</span>
                              <span className="text-slate-300 font-mono font-bold">
                                {compressionType === "none" ? "150.4 KB" : compressionType === "gzip" ? "32.8 KB (-78%)" : "18.2 KB (-87%)"}
                              </span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-2">
                              <div 
                                className="bg-emerald-400 h-full rounded-full transition-all duration-300" 
                                style={{ width: compressionType === "none" ? "100%" : compressionType === "gzip" ? "22%" : "12%" }} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cache Hit metrics */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-300 font-semibold block">Simulated Latency Comparison</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">Cache Hit (Edge Redis) vs Service Upstream Routing</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-400 block font-mono">HIT: ~1.8ms</span>
                          <span className="text-[10px] text-slate-500 block font-mono">MISS: ~18.5ms</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 p-3 border border-slate-800/60 rounded-xl text-[11px] text-slate-400 leading-relaxed mt-4">
                    <span>Vary Header caching policy propagates on edge CDN layers to verify safe routing depending on Accept-Encoding payloads.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* E. Schema Federation Tab */}
          {activeSubTab === "federation" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>GraphQL Schema Federation & Apollo Router Planner</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Design unified schema models across independent team microservices. The supergraph dynamically plans queries across Flights, Booking, and Accounts services.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subgraphs explorer */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block border-b border-slate-800 pb-2">GraphQL Federated Subgraphs</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Flights", fields: "Query.searchFlights, Flight.airline", url: "http://flights-svc:4001" },
                      { name: "Pricing", fields: "Flight.prices, Query.outliers", url: "http://pricing-svc:4002" },
                      { name: "Identity", fields: "Query.me, User.preferences", url: "http://identity-svc:4003" },
                      { name: "Baggage", fields: "Flight.allowance, Query.claims", url: "http://baggage-svc:4004" }
                    ].map((sub) => (
                      <div
                        key={sub.name}
                        onClick={() => setSelectedSubgraph(sub.name as any)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedSubgraph === sub.name
                            ? "bg-slate-900 border-amber-500/20 text-slate-200"
                            : "bg-slate-950 border-slate-800 hover:border-slate-800 text-slate-400"
                        }`}
                      >
                        <span className="text-xs font-bold block text-slate-200">{sub.name} Subgraph</span>
                        <span className="text-[10px] text-slate-500 block font-mono mt-0.5 truncate">{sub.fields}</span>
                        <span className="text-[9px] text-amber-500 block font-mono mt-1">{sub.url}</span>
                      </div>
                    ))}
                  </div>

                  {/* Schema fields viewer */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 font-mono text-xs text-sky-300 space-y-1 overflow-x-auto">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1 font-semibold">Active Subgraph Schema Spec ({selectedSubgraph})</span>
                    {selectedSubgraph === "Flights" && (
                      <pre className="text-[10px] leading-relaxed">
{`type Flight @key(fields: "id") {
  id: ID!
  flightNumber: String!
  origin: String!
  destination: String!
  scheduledDeparture: String!
}`}
                      </pre>
                    )}
                    {selectedSubgraph === "Pricing" && (
                      <pre className="text-[10px] leading-relaxed">
{`extend type Flight @key(fields: "id") {
  id: ID! @external
  prices: [Price!]! @requires(fields: "origin")
}
type Price {
  amount: Float!
  currency: String!
}`}
                      </pre>
                    )}
                    {selectedSubgraph === "Identity" && (
                      <pre className="text-[10px] leading-relaxed">
{`type User @key(fields: "id") {
  id: ID!
  email: String!
  preferences: TravelPreferences
}`}
                      </pre>
                    )}
                    {selectedSubgraph === "Baggage" && (
                      <pre className="text-[10px] leading-relaxed">
{`extend type Flight @key(fields: "id") {
  id: ID! @external
  baggageAllowance: Int!
}`}
                      </pre>
                    )}
                  </div>
                </div>

                {/* Execution query planner visual */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase block border-b border-slate-800 pb-2 mb-3">Gateway GraphQL Query Execution Plan</span>
                    
                    <div className="space-y-3 font-mono text-[10px] text-slate-300">
                      <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                        <span className="text-amber-500 font-bold block">1. Fetch (Flights Subgraph)</span>
                        <span className="text-slate-500 block">Fetch raw fields: origin, destination, scheduledDeparture</span>
                      </div>
                      
                      <div className="flex items-center justify-center py-0.5">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 rotate-90" />
                      </div>

                      <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                        <span className="text-amber-500 font-bold block">2. Flatten & Correlate Entities</span>
                        <span className="text-slate-500 block">Inject "id" references to match subgraphs @key mapping</span>
                      </div>

                      <div className="flex items-center justify-center py-0.5">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 rotate-90" />
                      </div>

                      <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                        <span className="text-emerald-500 font-bold block">3. Parallel Fetch (Pricing & Baggage Subgraphs)</span>
                        <span className="text-slate-500 block">Resolve fields (prices, baggageAllowance) in parallel batches</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 p-3 border border-slate-800/60 rounded-xl flex items-center gap-2 text-[11px] text-slate-400 leading-relaxed mt-4">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Apollo Supergraph query resolution limits N+1 requests automatically by compiling execution plans into binary WebAssembly nodes.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* F. GitOps Tab */}
          {activeSubTab === "gitops" && (
            <div className="space-y-4">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-teal-400" />
                  <span>GitOps Declarative Infrastructure as Code</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  These system-generated configurations are completely valid and updated in real-time according to parameters chosen on the other screens. Copy and apply them directly in your pipelines.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Envoy config */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col h-[340px] justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">envoy.yaml Spec</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Production Ingress Route Config</span>
                    <div className="bg-slate-900 rounded-lg p-2.5 font-mono text-[9px] text-sky-300 mt-3 h-[210px] overflow-y-auto border border-slate-800">
                      <pre>{envoyConfig}</pre>
                    </div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(envoyConfig)}
                    className="w-full mt-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-[10px] font-mono uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Envoy Config</span>
                  </button>
                </div>

                {/* Kong config */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col h-[340px] justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">kong.yml Declarative</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Kong Gateway Declarative DB-less setup</span>
                    <div className="bg-slate-900 rounded-lg p-2.5 font-mono text-[9px] text-indigo-300 mt-3 h-[210px] overflow-y-auto border border-slate-800">
                      <pre>{kongConfig}</pre>
                    </div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(kongConfig)}
                    className="w-full mt-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-[10px] font-mono uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Kong Config</span>
                  </button>
                </div>

                {/* Apollo Router config */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col h-[340px] justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">router.yaml Apollo Spec</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">GraphQL Supergraph Execution</span>
                    <div className="bg-slate-900 rounded-lg p-2.5 font-mono text-[9px] text-amber-300 mt-3 h-[210px] overflow-y-auto border border-slate-800">
                      <pre>{apolloConfig}</pre>
                    </div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(apolloConfig)}
                    className="w-full mt-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-[10px] font-mono uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Apollo Config</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Gateway Pipeline Live Request Simulator */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-semibold block">Interactive Sandbox</span>
            <h3 className="text-base font-bold text-slate-100 mt-1">
              Gateway Request-Response Pipeline Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute a simulated API request through the designed Gateway. Watch it step through each validation, auth, rate limit, cache, CB, and load balancing policy filter live.
            </p>
          </div>
          
          <button
            onClick={runSimulator}
            disabled={simulationActive}
            className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
              simulationActive
                ? "bg-slate-850 text-slate-500 border border-slate-800/80 cursor-not-allowed"
                : "bg-sky-500 text-slate-950 hover:bg-sky-400 hover:shadow-sky-500/20"
            }`}
          >
            {simulationActive ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Pipeline...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Execute Request Pipeline</span>
              </>
            )}
          </button>
        </div>

        {/* Live visualization map */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center bg-slate-950/30 p-4 border border-slate-800/80 rounded-xl relative overflow-hidden">
          {/* Timeline progress line */}
          <div className="absolute left-6 right-6 top-[40px] hidden md:block h-0.5 bg-slate-800/80 z-0">
            <div 
              className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-400 transition-all duration-300"
              style={{ width: `${simulationProgress}%` }}
            />
          </div>

          {[
            { id: "validation", label: "1. Validation", sub: "Schema Match", icon: SlidersHorizontal },
            { id: "auth", label: "2. Security Check", sub: "Signature/Scope", icon: Shield },
            { id: "ratelimit", label: "3. Rate Limit", sub: "Token Bucket", icon: Activity },
            { id: "cache", label: "4. Cache Guard", sub: "Redis Lookup", icon: Sliders },
            { id: "resiliency", label: "5. CB Check", sub: "Outage Guard", icon: Zap },
            { id: "loadbalancer", label: "6. Routing Node", sub: "LB Upstream", icon: Network }
          ].map((step, idx) => {
            const Icon = step.icon;
            // Determine active/success state
            const hasPassed = simulationProgress > ((idx) / 6 * 100);
            const isCurrentlyActive = simulationProgress >= ((idx) / 6 * 100) && simulationProgress <= ((idx + 1) / 6 * 100);
            
            // Check errors
            let isFailed = false;
            if (tokenTampered && step.id === "auth" && hasPassed) isFailed = true;
            if (currentTokens < 1 && step.id === "ratelimit" && hasPassed) isFailed = true;
            if (cbState === "OPEN" && step.id === "resiliency" && hasPassed) isFailed = true;

            return (
              <div 
                key={step.id} 
                className={`flex flex-col items-center p-3 rounded-xl border z-10 relative transition-all ${
                  isFailed
                    ? "bg-rose-950/40 border-rose-500/20 text-rose-400"
                    : isCurrentlyActive
                    ? "bg-sky-950/40 border-sky-500/40 text-sky-400 shadow-lg shadow-sky-500/5 scale-105"
                    : hasPassed
                    ? "bg-slate-900 border-slate-700 text-slate-100"
                    : "bg-slate-950 border-slate-900 text-slate-500"
                }`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center border mb-2 ${
                  isFailed
                    ? "bg-rose-900/30 border-rose-500/20"
                    : isCurrentlyActive
                    ? "bg-sky-900/30 border-sky-500/30 text-sky-400"
                    : hasPassed
                    ? "bg-indigo-950/20 border-indigo-500/20 text-indigo-400"
                    : "bg-slate-950 border-slate-900 text-slate-500"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold tracking-tight text-center">{step.label}</span>
                <span className="text-[9px] text-slate-500 font-mono text-center mt-0.5">{step.sub}</span>
              </div>
            );
          })}
        </div>

        {/* Simulation Output Consoles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Logs Console */}
          <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col h-[280px]">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2 border-b border-slate-900 pb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>Gateway Engine Pipeline Logs</span>
            </span>
            <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1.5 pr-2">
              {simulationLogs.length === 0 ? (
                <div className="text-slate-600 italic flex items-center justify-center h-full">
                  Click 'Execute Request Pipeline' to view real-time gateway steps.
                </div>
              ) : (
                simulationLogs.map((log, index) => (
                  <div key={index} className={`flex items-start gap-1.5 ${
                    log.status === "error" ? "text-rose-400" : log.status === "warning" ? "text-amber-400" : log.status === "info" ? "text-sky-400" : "text-emerald-400"
                  }`}>
                    <span className="text-[9px] font-bold shrink-0">
                      [{log.status.toUpperCase()}]
                    </span>
                    <span className="text-slate-300 leading-relaxed">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Response Payload Console */}
          <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col h-[280px]">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2 border-b border-slate-900 pb-1.5 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>HTTP/2 Payload response output</span>
            </span>
            <div className="flex-1 overflow-y-auto font-mono text-[10px] pr-2">
              {!simulationResult ? (
                <div className="text-slate-600 italic flex items-center justify-center h-full text-center p-4">
                  Response output will be rendered upon execution completion.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Status header */}
                  <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400">STATUS RESPONSE:</span>
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      simulationResult.statusCode === 200
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-950 text-rose-400 border border-rose-500/20"
                    }`}>
                      {simulationResult.statusCode} {simulationResult.statusCode === 200 ? "OK" : simulationResult.statusCode === 401 ? "UNAUTHORIZED" : simulationResult.statusCode === 429 ? "TOO MANY REQUESTS" : "GATEWAY ERROR"}
                    </span>
                  </div>

                  {/* Headers */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Response Headers:</span>
                    <div className="bg-slate-900/30 p-2 rounded border border-slate-900 space-y-0.5 text-slate-400">
                      {Object.entries(simulationResult.headers).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-slate-500 font-bold">{k}:</span> {v}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* JSON Body */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Body Payload:</span>
                    <pre className="bg-slate-900/60 p-2 rounded border border-slate-900 text-sky-300 overflow-x-auto text-[9px] leading-relaxed">
                      {simulationResult.body}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
