import React, { useState, useEffect, useMemo } from "react";
import { 
  GitBranch, 
  GitPullRequest, 
  GitCommit, 
  Layers, 
  Server, 
  Cpu, 
  Database, 
  Terminal, 
  Play, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Globe, 
  Flame, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Settings, 
  Code, 
  Eye, 
  HelpCircle, 
  TrendingUp, 
  RotateCcw, 
  Clock, 
  Sliders, 
  Radio, 
  Download, 
  Plus, 
  FileText, 
  Copy, 
  Key, 
  CloudLightning,
  Workflow,
  Sparkles,
  RefreshCw as SyncIcon,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Percent,
  Compass
} from "lucide-react";

// Types for DevOps simulator state
type DeployEnvironment = "development" | "staging" | "production";
type DeploymentStrategy = "canary" | "blue-green";

interface PipelineStep {
  name: string;
  status: "idle" | "running" | "success" | "failed";
  durationSec: number;
  logs: string[];
}

interface ArgoApp {
  name: string;
  repoUrl: string;
  path: string;
  destCluster: string;
  syncStatus: "Synced" | "OutOfSync" | "Syncing" | "Degraded";
  healthStatus: "Healthy" | "Progressing" | "Suspended" | "Degraded";
  revision: string;
}

interface SecretItem {
  key: string;
  value: string;
  env: string;
  isMasked: boolean;
  lastUpdated: string;
}

interface TerraformResource {
  type: string;
  name: string;
  status: "Managed" | "Stale" | "Pending_Creation" | "Pending_Destruction";
  provider: "google" | "aws" | "kubernetes" | "helm";
  id: string;
}

export default function DevOpsPlatformExplorer() {
  // Navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<"ci_cd" | "gitops_argo" | "deployment_strategies" | "iac_terraform" | "secrets_compliance" | "dr_autoscaling">("ci_cd");
  
  // Environment selection
  const [selectedEnv, setSelectedEnv] = useState<DeployEnvironment>("production");

  // Telemetry tick
  const [ticks, setTicks] = useState<number>(0);

  // 1. CI/CD GitHub Actions simulator state
  const [commitMessage, setCommitMessage] = useState<string>("feat: optimize pricing precision & cached partner NDC lookups");
  const [isCommitRunning, setIsCommitRunning] = useState<boolean>(false);
  const [currentBuildTag, setCurrentBuildTag] = useState<string>("v2.1.0-release");
  const [buildHistory, setBuildHistory] = useState<{ tag: string; author: string; status: "success" | "failed"; timeAgo: string }[]>([
    { tag: "v2.0.9", author: "devops-bot", status: "success", timeAgo: "2 hours ago" },
    { tag: "v2.0.8", author: "lead-sre", status: "success", timeAgo: "1 day ago" },
    { tag: "v2.0.7", author: "m-aurelius", status: "success", timeAgo: "3 days ago" }
  ]);

  const [ciSteps, setCiSteps] = useState<PipelineStep[]>([
    { name: "Checkout Code & Setup Node", status: "idle", durationSec: 1.5, logs: [] },
    { name: "Lint & TypeScript Verification", status: "idle", durationSec: 3, logs: [] },
    { name: "Containerize (Docker Build --target production)", status: "idle", durationSec: 5, logs: [] },
    { name: "Trivy Security Container Scan & CVE Audit", status: "idle", durationSec: 2, logs: [] },
    { name: "Push Image to GitHub Container Registry (GHCR)", status: "idle", durationSec: 3, logs: [] }
  ]);

  const [activeStepIdx, setActiveStepIdx] = useState<number>(-1);
  const [ciOutputLogs, setCiOutputLogs] = useState<string[]>(["[SRE Pipeline] Idle. Trigger a commit to start build runner."]);

  // 2. ArgoCD state
  const [argoApps, setArgoApps] = useState<ArgoApp[]>([
    { name: "flysmart-gateway", repoUrl: "https://github.com/org/flysmart", path: "helm/flysmart-gateway", destCluster: "gke-prod-central", syncStatus: "Synced", healthStatus: "Healthy", revision: "v2.0.9" },
    { name: "search-api", repoUrl: "https://github.com/org/flysmart", path: "helm/search-api", destCluster: "gke-prod-central", syncStatus: "Synced", healthStatus: "Healthy", revision: "v2.0.9" },
    { name: "partner-aggregator", repoUrl: "https://github.com/org/flysmart", path: "helm/partner-aggregator", destCluster: "gke-prod-central", syncStatus: "Synced", healthStatus: "Healthy", revision: "v2.0.9" },
    { name: "ml-forecaster", repoUrl: "https://github.com/org/flysmart", path: "helm/ml-forecaster", destCluster: "gke-prod-central", syncStatus: "Synced", healthStatus: "Healthy", revision: "v2.0.9" }
  ]);
  const [isArgoSyncing, setIsArgoSyncing] = useState<boolean>(false);

  // 3. Deployment strategies (Production)
  const [activeStrategy, setActiveStrategy] = useState<DeploymentStrategy>("canary");
  const [canaryWeight, setCanaryWeight] = useState<number>(10); // 10% -> 25% -> 50% -> 100%
  const [blueGreenActiveColor, setBlueGreenActiveColor] = useState<"blue" | "green">("blue");
  const [simulatedErrorRate, setSimulatedErrorRate] = useState<number>(0.2); // healthy baseline %
  const [isDeployingStrategy, setIsDeployingStrategy] = useState<boolean>(false);
  const [activeDeploymentStepName, setActiveDeploymentStepName] = useState<string>("Ready");
  const [newVersionTag, setNewVersionTag] = useState<string>("v2.1.0");

  // 4. Secrets state
  const [secrets, setSecrets] = useState<SecretItem[]>([
    { key: "SABRE_API_KEY", value: "sb_prod_df928a301baee9d0f", env: "production", isMasked: true, lastUpdated: "2026-06-01" },
    { key: "AMADEUS_CLIENT_SECRET", value: "am_prod_0c18fa09939e", env: "production", isMasked: true, lastUpdated: "2026-06-01" },
    { key: "DATABASE_PASSWORD", value: "gcp_postgres_super_admin_secure_9011", env: "production", isMasked: true, lastUpdated: "2026-05-15" },
    { key: "GEMINI_API_KEY", value: "ai_studio_gemini_3_5_flash_key_0x82", env: "production", isMasked: true, lastUpdated: "2026-06-10" },
    { key: "REDIS_AUTH_TOKEN", value: "redis_cluster_master_shard_key_pass", env: "production", isMasked: true, lastUpdated: "2026-06-20" }
  ]);
  const [newSecretKey, setNewSecretKey] = useState<string>("");
  const [newSecretValue, setNewSecretValue] = useState<string>("");

  // 5. Terraform State Explorer
  const [terraformLogs, setTerraformLogs] = useState<string[]>([
    "gcp_vpc.prod_vpc: Refreshing state... [id=projects/flysmart-prod/global/networks/prod-vpc]",
    "google_container_cluster.prod_gke: Refreshing state... [id=projects/flysmart-prod/zones/europe-west1-d/clusters/gke-prod-central]",
    "google_sql_database_instance.prod_db: Refreshing state... [id=projects/flysmart-prod/instances/prod-postgres]",
    "google_kms_crypto_key.secrets_key: Refreshing state... [id=projects/flysmart-prod/locations/global/keyRings/kms-ring/cryptoKeys/secrets-key]",
    "Terraform State is matching Cloud actual parameters. No changes detected."
  ]);
  const [terraformResources, setTerraformResources] = useState<TerraformResource[]>([
    { type: "google_compute_network", name: "prod_vpc", status: "Managed", provider: "google", id: "prod-vpc" },
    { type: "google_compute_subnetwork", name: "prod_subnets", status: "Managed", provider: "google", id: "prod-subnets-eur" },
    { type: "google_container_cluster", name: "prod_gke", status: "Managed", provider: "google", id: "gke-prod-central" },
    { type: "google_container_node_pool", name: "gke_autoscaling_nodes", status: "Managed", provider: "google", id: "gke-node-pool-auto" },
    { type: "google_sql_database_instance", name: "prod_db", status: "Managed", provider: "google", id: "prod-postgres" },
    { type: "google_kms_key_ring", name: "kms_ring", status: "Managed", provider: "google", id: "kms-ring" },
    { type: "helm_release", name: "argocd_operator", status: "Managed", provider: "helm", id: "argocd" }
  ]);
  const [isTerraformRunning, setIsTerraformRunning] = useState<boolean>(false);

  // 6. Autoscaling & Disaster Recovery simulator state
  const [productionTrafficQps, setProductionTrafficQps] = useState<number>(380);
  const [gkeActivePodCount, setGkeActivePodCount] = useState<number>(8);
  const [drStatus, setDrStatus] = useState<"Standby" | "ActiveFailover" | "Restored">("Standby");
  const [drProgressLogs, setDrProgressLogs] = useState<string[]>([]);
  const [lastBackupTime, setLastBackupTime] = useState<string>("2026-06-27 12:00:00 UTC (Scheduled, Healthy)");
  const [isDrRunning, setIsDrRunning] = useState<boolean>(false);

  // HPA logic - Pods scale with dynamic Traffic slider
  useEffect(() => {
    const calculatedPods = Math.max(3, Math.min(30, Math.round(productionTrafficQps / 45)));
    setGkeActivePodCount(calculatedPods);
  }, [productionTrafficQps]);

  // Fluctuations & live metrics SRE telemetry sync
  useEffect(() => {
    const timer = setInterval(() => {
      setTicks(prev => prev + 1);

      // Fluctuate traffic slider slightly
      setProductionTrafficQps(prev => {
        const drift = Math.round((Math.random() - 0.5) * 16);
        return Math.min(600, Math.max(80, prev + drift));
      });

      // If deploying strategy and we have errors, let it fluctuate based on version
      if (isDeployingStrategy) {
        if (activeStrategy === "canary" && canaryWeight < 100) {
          // New version has higher error rates if we are simulating drift, otherwise clean
          setSimulatedErrorRate(prev => Math.min(8.5, Math.max(0.1, prev + (Math.random() - 0.5) * 0.4)));
        } else {
          setSimulatedErrorRate(prev => Math.min(2.0, Math.max(0.1, prev + (Math.random() - 0.5) * 0.1)));
        }
      } else {
        setSimulatedErrorRate(0.18 + Number((Math.random() * 0.08).toFixed(2)));
      }

    }, 3000);
    return () => clearInterval(timer);
  }, [isDeployingStrategy, activeStrategy, canaryWeight]);

  // CI/CD Run pipeline simulation helper
  const triggerGitHubCommit = () => {
    if (isCommitRunning) return;
    setIsCommitRunning(true);
    setActiveStepIdx(0);
    
    // Reset steps
    setCiSteps(prev => prev.map(s => ({ ...s, status: "idle" })));
    setCiOutputLogs([
      `[CI GitHub Runner] Initialized job triggered by commit: "${commitMessage}"`,
      `[CI GitHub Runner] Checkout branch: main • Repository: github.com/org/flysmart`
    ]);

    let step = 0;
    const runNextStep = () => {
      if (step >= ciSteps.length) {
        setIsCommitRunning(false);
        setActiveStepIdx(-1);
        setCurrentBuildTag(`v2.1.0-build-${Math.floor(100 + Math.random() * 900)}`);
        
        // Add to history
        setBuildHistory(prev => [
          { tag: `v2.1.0-b${Math.floor(100 + Math.random() * 900)}`, author: "lead-sre", status: "success", timeAgo: "Just now" },
          ...prev
        ]);

        // Outdate Argo application sync status
        setArgoApps(prev => prev.map(app => ({
          ...app,
          syncStatus: "OutOfSync",
          revision: `v2.0.9 (Next: ${newVersionTag})`
        })));

        setCiOutputLogs(prev => [
          ...prev,
          `[SUCCESS] Job completed in 14.5s. Container image pushed to ghcr.io/org/flysmart/gateway:${newVersionTag}`,
          `[ArgoCD Sync Notice] Git Repository updated. ArgoCD detected out-of-sync state on Helm release chart config.`
        ]);
        return;
      }

      setActiveStepIdx(step);
      setCiSteps(prev => prev.map((s, i) => i === step ? { ...s, status: "running" } : s));

      setTimeout(() => {
        setCiSteps(prev => prev.map((s, i) => {
          if (i === step) {
            return { ...s, status: "success" };
          }
          return s;
        }));

        const newLogs = [...getLogsForStep(step, newVersionTag)];
        setCiOutputLogs(prev => [...prev, ...newLogs]);

        step++;
        runNextStep();
      }, ciSteps[step].durationSec * 600); // Speed up transition
    };

    runNextStep();
  };

  // ArgoCD dynamic sync simulator
  const triggerArgoCDSync = () => {
    if (isArgoSyncing) return;
    setIsArgoSyncing(true);
    
    // Update individual app sync states
    setArgoApps(prev => prev.map(app => ({
      ...app,
      syncStatus: "Syncing"
    })));

    setTimeout(() => {
      setArgoApps(prev => prev.map(app => ({
        ...app,
        syncStatus: "Synced",
        healthStatus: "Healthy",
        revision: newVersionTag
      })));
      setIsArgoSyncing(false);
    }, 2500);
  };

  // Canary and Blue/Green deployment rollout simulator
  const executeRolloutStrategy = () => {
    if (isDeployingStrategy) return;
    setIsDeployingStrategy(true);
    setCanaryWeight(10);
    setActiveDeploymentStepName("Initializing Deployment Rollout");

    if (activeStrategy === "canary") {
      // Step-by-step canary increase
      let weight = 10;
      const progressCanary = () => {
        if (weight > 100) {
          setIsDeployingStrategy(false);
          setActiveDeploymentStepName("Canary Rollout Completed Successfully");
          setArgoApps(prev => prev.map(app => ({ ...app, revision: newVersionTag })));
          return;
        }
        setCanaryWeight(weight);
        setActiveDeploymentStepName(`Canary Routing active: ${weight}% New Version traffic`);
        
        // Simulating progressive testing verification
        setTimeout(() => {
          weight = weight === 10 ? 25 : weight === 25 ? 50 : weight === 50 ? 100 : 101;
          progressCanary();
        }, 1800);
      };
      progressCanary();
    } else {
      // Blue Green transition
      setActiveDeploymentStepName("Spinning up GREEN replica pod pools...");
      setTimeout(() => {
        setActiveDeploymentStepName("Running synthetic smoke checks on GREEN pool");
        setTimeout(() => {
          setActiveDeploymentStepName("Smoke checks OK. Adjusting ingress weights: GREEN 100%, BLUE 0%");
          setBlueGreenActiveColor("green");
          setTimeout(() => {
            setActiveDeploymentStepName("Tearing down old BLUE pods. Completed.");
            setIsDeployingStrategy(false);
          }, 1500);
        }, 1500);
      }, 1500);
    }
  };

  // Immediate Rollback trigger
  const executeRollback = () => {
    setIsDeployingStrategy(false);
    setCanaryWeight(0);
    setBlueGreenActiveColor("blue");
    setSimulatedErrorRate(0.18);
    setActiveDeploymentStepName("Rollback executed! Traffic redirected back to stable v2.0.9 replica pool.");
    setArgoApps(prev => prev.map(app => ({ ...app, revision: "v2.0.9", healthStatus: "Healthy" })));
  };

  // Secret management actions
  const addSecret = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecretKey || !newSecretValue) return;
    const newSec: SecretItem = {
      key: newSecretKey.toUpperCase().replace(/\s+/g, "_"),
      value: newSecretValue,
      env: "production",
      isMasked: true,
      lastUpdated: new Date().toISOString().split("T")[0]
    };
    setSecrets(prev => [...prev, newSec]);
    setNewSecretKey("");
    setNewSecretValue("");
  };

  const toggleSecretMask = (index: number) => {
    setSecrets(prev => prev.map((s, i) => i === index ? { ...s, isMasked: !s.isMasked } : s));
  };

  // Terraform action runner
  const runTerraformApply = () => {
    if (isTerraformRunning) return;
    setIsTerraformRunning(true);
    setTerraformLogs([
      "terraform apply -auto-approve",
      "google_compute_network.prod_vpc: Refreshing state... [id=prod-vpc]",
      "google_container_cluster.prod_gke: Modifying cluster properties...",
      "google_container_node_pool.gke_autoscaling_nodes: Adjusting min_node_count [3] and max_node_count [12]"
    ]);

    setTimeout(() => {
      setTerraformLogs(prev => [
        ...prev,
        "google_container_node_pool.gke_autoscaling_nodes: Modification completed in 3.4s",
        "google_kms_crypto_key.secrets_key: Ensuring active keys match rotative policies",
        "Apply complete! Resources: 0 added, 1 modified, 0 destroyed.",
        "Infrastructure state has been successfully updated in remote storage gs://prod-tf-state-bucket/prod.tfstate"
      ]);
      setTerraformResources(prev => prev.map(res => {
        if (res.name === "gke_autoscaling_nodes") {
          return { ...res, status: "Managed" };
        }
        return res;
      }));
      setIsTerraformRunning(false);
    }, 2500);
  };

  // Disaster Recovery failover drill
  const runDrFailoverDrill = () => {
    if (isDrRunning) return;
    setIsDrRunning(true);
    setDrStatus("ActiveFailover");
    setDrProgressLogs([
      "[1/5] Initiating DR Failure Drill from primary Zone: europe-west1 to backup Zone: us-east1",
      "[2/5] Traffic Router (Cloud CDN/Global Load Balancer) health probe redirected to us-east1 replica stack"
    ]);

    setTimeout(() => {
      setDrProgressLogs(prev => [
        ...prev,
        "[3/5] Promoting Standby Cloud SQL postgres replica in us-east1 to Primary Master",
        "[4/5] Restoring cloud storage write mounts to backup cluster nodes"
      ]);

      setTimeout(() => {
        setDrProgressLogs(prev => [
          ...prev,
          "[5/5] DR Drill Complete. 100% of global flight search queries served securely from US-East-1. Total data recovery loss RPO = 0, restoration speed RTO = 4.2 seconds."
        ]);
        setDrStatus("Restored");
        setLastBackupTime(`Completed Just Now (${new Date().toLocaleTimeString()} UTC)`);
        setIsDrRunning(false);
      }, 2000);
    }, 2000);
  };

  // Visual layout configurations (Helper codes to render inside interactive HCL editor)
  const terraformHclCode = `resource "google_container_cluster" "prod_gke" {
  name     = "gke-prod-central"
  location = "europe-west1-d"

  # Secure IAM Service Account mapping
  service_account = google_service_account.gke_sa.email

  # Enable IP-aliasing for VPC Native cluster setup
  ip_allocation_policy {
    cluster_ipv4_cidr_block  = "/14"
    services_ipv4_cidr_block = "/20"
  }

  # Multi-region failover network security rules
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  # Dynamic horizontal cluster autoscaler values
  cluster_autoscaling {
    enabled = true
    resource_limits {
      resource_type = "cpu"
      minimum       = 6
      maximum       = 32
    }
  }
}`;

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100" id="devops-infrastructure-command-center">
      
      {/* Page Title Panel */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] bg-sky-950 text-sky-400 border border-sky-500/20 px-2.5 py-0.5 rounded-full font-mono font-black uppercase max-w-max flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            Infrastructure-as-Code GitOps Environment Active
          </div>
          <h2 className="text-xl font-black tracking-tight mt-1 text-slate-100 flex items-center gap-2">
            <Workflow className="w-6 h-6 text-sky-400" />
            DevOps Continuous Delivery & Orchestration Platform
          </h2>
          <p className="text-xs text-slate-400">
            Model code commits, trigger CI testing jobs, synchronize Helm charts with ArgoCD, monitor Progressive Rollout weights (Canary / Blue-Green), audit secrets compliance, and run simulated cluster failover drills.
          </p>
        </div>

        {/* Global Pipeline Indicators */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950/85 p-3.5 rounded-xl border border-slate-850">
          <div className="text-center">
            <span className="text-[8px] font-mono text-slate-500 uppercase block">CI Pipeline</span>
            <span className={`text-[11px] font-mono font-bold ${isCommitRunning ? "text-indigo-400" : "text-slate-400"}`}>
              {isCommitRunning ? "RUNNING..." : "STANDBY"}
            </span>
          </div>
          <div className="border-l border-slate-800 h-6.5 mx-1" />
          <div className="text-center">
            <span className="text-[8px] font-mono text-slate-500 uppercase block">GitOps Sync</span>
            <span className="text-[11px] font-mono font-bold text-emerald-400">SYNCED</span>
          </div>
          <div className="border-l border-slate-800 h-6.5 mx-1" />
          <div className="text-center font-mono text-[10.5px]">
            <span className="text-[8px] text-slate-500 uppercase block">Live Deploy Strategy</span>
            <span className="text-amber-500 uppercase font-black">{activeStrategy}</span>
          </div>
        </div>
      </div>

      {/* Main DevOps Subtab Navigation bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-850 pb-2">
        <button
          onClick={() => setActiveSubTab("ci_cd")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "ci_cd" 
              ? "bg-slate-900 border border-slate-800 text-sky-400" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <GitBranch className="w-4 h-4 text-sky-400" />
          <span>GitHub CI Pipeline</span>
        </button>

        <button
          onClick={() => setActiveSubTab("gitops_argo")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "gitops_argo" 
              ? "bg-slate-900 border border-slate-800 text-emerald-450" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <SyncIcon className="w-4 h-4 text-emerald-400" />
          <span>ArgoCD Helm GitOps</span>
        </button>

        <button
          onClick={() => setActiveSubTab("deployment_strategies")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "deployment_strategies" 
              ? "bg-slate-900 border border-slate-800 text-amber-500" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Canary & Blue/Green Rollout</span>
        </button>

        <button
          onClick={() => setActiveSubTab("iac_terraform")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "iac_terraform" 
              ? "bg-slate-900 border border-slate-800 text-indigo-400" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Code className="w-4 h-4 text-indigo-400" />
          <span>Terraform State & IaC HCL</span>
        </button>

        <button
          onClick={() => setActiveSubTab("secrets_compliance")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "secrets_compliance" 
              ? "bg-slate-900 border border-slate-800 text-purple-400" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Lock className="w-4 h-4 text-purple-400" />
          <span>Secrets & Compliance Audit</span>
        </button>

        <button
          onClick={() => setActiveSubTab("dr_autoscaling")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "dr_autoscaling" 
              ? "bg-slate-900 border border-slate-800 text-rose-500" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Flame className="w-4 h-4 text-rose-500" />
          <span>DR Drill & Autoscaling</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* SUBTAB 1: GITHUB ACTIONS CI RUNNER PIPELINE */}
      {/* ==================================================== */}
      {activeSubTab === "ci_cd" && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Interactive Commit Panel */}
            <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <GitCommit className="w-4 h-4 text-sky-400" />
                Commit Code & Trigger Pipeline Runner
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Commit Message</label>
                  <input 
                    type="text" 
                    value={commitMessage} 
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Enter commit details..."
                    disabled={isCommitRunning}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Docker Image Tag</label>
                    <input 
                      type="text" 
                      value={newVersionTag} 
                      onChange={(e) => setNewVersionTag(e.target.value)}
                      placeholder="v2.1.0"
                      disabled={isCommitRunning}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Author Identity</label>
                    <div className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-400 font-mono">
                      lead-sre@flysmart.org
                    </div>
                  </div>
                </div>

                <button
                  onClick={triggerGitHubCommit}
                  disabled={isCommitRunning}
                  className="w-full py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <GitPullRequest className="w-4 h-4 text-white" />
                  <span>git push origin main</span>
                </button>
              </div>

              {/* Build History */}
              <div className="pt-4 border-t border-slate-850 space-y-3">
                <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">Commit Release History</span>
                <div className="space-y-2">
                  {buildHistory.map((history, idx) => (
                    <div key={idx} className="bg-slate-950/80 p-2.5 border border-slate-900 rounded-lg flex items-center justify-between text-xs font-mono">
                      <div className="space-y-0.5">
                        <span className="text-slate-200 font-bold">{history.tag}</span>
                        <p className="text-[10px] text-slate-500">Author: {history.author} • {history.timeAgo}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">Success</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Live Steps & Console Log Runner */}
            <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-400" />
                GitHub Actions Pipeline Build Executor (YAML Steps)
              </h3>

              {/* Pipeline Steps Flow */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                {ciSteps.map((step, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border text-center transition-all ${
                    step.status === "running" 
                      ? "bg-indigo-950/40 border-indigo-500 text-indigo-200 animate-pulse" 
                      : step.status === "success" 
                        ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-400" 
                        : "bg-slate-950 border-slate-900 text-slate-500"
                  }`}>
                    <span className="text-[8px] font-mono block mb-1">STEP {idx + 1}</span>
                    <span className="text-[10.5px] font-black leading-tight block truncate">{step.name}</span>
                    <span className="text-[9px] font-mono mt-1 block">
                      {step.status === "running" ? "Running..." : step.status === "success" ? `Success (${step.durationSec}s)` : "Pending"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shell Terminal Output */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4.5 font-mono text-[11px] leading-relaxed h-[220px] overflow-y-auto space-y-1">
                {ciOutputLogs.map((log, i) => (
                  <div key={i} className={`${
                    log.includes("[SUCCESS]") 
                      ? "text-emerald-400 font-bold" 
                      : log.includes("[ERROR]") 
                        ? "text-rose-500 font-bold animate-pulse" 
                        : log.includes("[SRE Pipeline]")
                          ? "text-indigo-400 font-bold"
                          : "text-slate-450"
                  }`}>
                    {log}
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* SUBTAB 2: ARGOCD GITOPS & HELM RELEASES */}
      {/* ==================================================== */}
      {activeSubTab === "gitops_argo" && (
        <div className="space-y-6">
          
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <SyncIcon className="w-4 h-4 text-emerald-450 animate-spin" />
                  ArgoCD Controller Kubernetes Operator Sandbox
                </h3>
                <p className="text-xs text-slate-400">ArgoCD synchronizes Kubernetes state with helm declarations stored under git branch. Sync is bidirectional and automated.</p>
              </div>

              {/* Sync buttons */}
              <button
                onClick={triggerArgoCDSync}
                disabled={isArgoSyncing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isArgoSyncing ? "animate-spin" : ""}`} />
                <span>ArgoCD Sync All Applications</span>
              </button>
            </div>

            {/* Argo applications grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {argoApps.map((app, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-slate-200">{app.name}</h4>
                      <p className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">{app.path}</p>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      app.syncStatus === "Synced" 
                        ? "bg-emerald-950 text-emerald-400 border-emerald-900/30" 
                        : app.syncStatus === "Syncing"
                          ? "bg-sky-950 text-sky-400 border-sky-900/30 animate-pulse"
                          : "bg-amber-950 text-amber-400 border-amber-900/30"
                    }`}>
                      {app.syncStatus}
                    </span>
                  </div>

                  <div className="text-[10.5px] font-mono text-slate-400 space-y-1 pt-1.5 border-t border-slate-900">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Destination:</span>
                      <span className="font-bold text-slate-300">{app.destCluster}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Revision:</span>
                      <span className="font-bold text-indigo-400">{app.revision}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="text-slate-500">Health:</span>
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Healthy
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* GitOps Sync diagram visualizer */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-3">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">GitOps Declaration Validation Loop</span>
              
              <div className="grid grid-cols-1 md:grid-cols-5 items-center justify-between text-center font-mono text-[10px] gap-4">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                  <span className="text-[8px] text-indigo-400 block uppercase">Git Hub Repository</span>
                  <span className="font-bold text-slate-300">/helm/values-prod.yaml</span>
                </div>

                <div className="flex flex-col items-center text-slate-600">
                  <ArrowRight className="w-4 h-4 text-emerald-500" />
                  <span className="text-[8px]">Git webhook trigger</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg relative">
                  <span className="text-[8px] text-emerald-450 block uppercase">ArgoCD Application</span>
                  <span className="font-bold text-slate-300">Desired State Checker</span>
                </div>

                <div className="flex flex-col items-center text-slate-600">
                  <ArrowRight className="w-4 h-4 text-emerald-500" />
                  <span className="text-[8px]">Helm install --atomic</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                  <span className="text-[8px] text-sky-400 block uppercase">GKE Cluster</span>
                  <span className="font-bold text-slate-300">Live K8s Resources</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* SUBTAB 3: DEPLOYMENT STRATEGIES & BLUE/GREEN */}
      {/* ==================================================== */}
      {activeSubTab === "deployment_strategies" && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Deploy Controller Control Panel */}
            <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-500" />
                Select Deployment Strategy & Trigger Rollout
              </h3>

              <div className="space-y-3">
                
                {/* Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveStrategy("canary")}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      activeStrategy === "canary" 
                        ? "bg-amber-950/40 border-amber-500 text-amber-400 font-bold" 
                        : "bg-slate-950 border-slate-900 text-slate-500"
                    }`}
                  >
                    <span className="text-[8.5px] font-mono uppercase block">Canary Releases</span>
                    <span className="text-[11px] leading-tight block">Incremental weight split</span>
                  </button>

                  <button
                    onClick={() => setActiveStrategy("blue-green")}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      activeStrategy === "blue-green" 
                        ? "bg-indigo-950/40 border-indigo-500 text-indigo-400 font-bold" 
                        : "bg-slate-950 border-slate-900 text-slate-500"
                    }`}
                  >
                    <span className="text-[8.5px] font-mono uppercase block">Blue-Green Rollout</span>
                    <span className="text-[11px] leading-tight block">Zero downtime switchover</span>
                  </button>
                </div>

                {/* Progressive actions */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-900 space-y-2.5 text-xs">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Progressive Configuration</span>
                  
                  {activeStrategy === "canary" ? (
                    <div className="space-y-2">
                      <div className="flex justify-between font-mono text-[10.5px]">
                        <span className="text-slate-400">Canary Traffic Weight:</span>
                        <span className="text-amber-500 font-bold">{canaryWeight}% Canary version</span>
                      </div>
                      <div className="flex gap-1">
                        {[10, 25, 50, 100].map(w => (
                          <button
                            key={w}
                            disabled={isDeployingStrategy}
                            onClick={() => setCanaryWeight(w)}
                            className={`flex-1 py-1 font-mono text-[10px] rounded border cursor-pointer ${
                              canaryWeight === w 
                                ? "bg-amber-950 text-amber-400 border-amber-500" 
                                : "bg-slate-900 border-slate-850 text-slate-400"
                            }`}
                          >
                            {w}%
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between font-mono text-[10.5px]">
                        <span className="text-slate-400">Active Production Stack:</span>
                        <span className={`font-bold uppercase ${
                          blueGreenActiveColor === "blue" ? "text-sky-400" : "text-emerald-400"
                        }`}>{blueGreenActiveColor} Pool</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          disabled={isDeployingStrategy}
                          onClick={() => setBlueGreenActiveColor("blue")}
                          className={`flex-1 py-1.5 text-xs font-bold rounded cursor-pointer border ${
                            blueGreenActiveColor === "blue" 
                              ? "bg-sky-950 text-sky-400 border-sky-500" 
                              : "bg-slate-900 border-slate-850 text-slate-400"
                          }`}
                        >
                          Switch to BLUE (v2.0.9)
                        </button>
                        <button
                          disabled={isDeployingStrategy}
                          onClick={() => setBlueGreenActiveColor("green")}
                          className={`flex-1 py-1.5 text-xs font-bold rounded cursor-pointer border ${
                            blueGreenActiveColor === "green" 
                              ? "bg-emerald-950 text-emerald-450 border-emerald-500" 
                              : "bg-slate-900 border-slate-850 text-slate-400"
                          }`}
                        >
                          Switch to GREEN (v2.1.0)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={executeRolloutStrategy}
                    disabled={isDeployingStrategy}
                    className="py-2.5 bg-gradient-to-r from-amber-600 to-indigo-600 rounded-xl text-xs font-bold cursor-pointer text-white flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Run Rollout</span>
                  </button>

                  <button
                    onClick={executeRollback}
                    className="py-2.5 bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Emergency Rollback</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Tracing, Ingress, Router visualizer */}
            <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-sky-400" />
                Live Ingress Traffic Controller & Route Diagnostics
              </h3>

              {/* Deployment execution status display */}
              <div className="bg-slate-950 border border-slate-850 p-4.5 rounded-xl text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-mono">Deployment Step Status:</span>
                  <span className="font-bold text-slate-200">{activeDeploymentStepName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-mono">Simulated Error Rate:</span>
                  <span className={`font-mono font-bold ${simulatedErrorRate > 1.0 ? "text-rose-500" : "text-emerald-450"}`}>
                    {simulatedErrorRate.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Traffic split visual dial */}
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Ingress Target Traffic Distribution</span>
                
                {activeStrategy === "canary" ? (
                  <div className="w-full space-y-3">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-sky-400">STABLE (v2.0.9): {100 - canaryWeight}%</span>
                      <span className="text-amber-500">CANARY (v2.1.0): {canaryWeight}%</span>
                    </div>
                    
                    <div className="w-full bg-slate-900 h-6.5 rounded-xl overflow-hidden relative flex items-center text-[10.5px] font-black">
                      <div className="h-full bg-sky-950 text-sky-400 text-left pl-3 flex items-center transition-all duration-500" style={{ width: `${100 - canaryWeight}%` }}>
                        {100 - canaryWeight}%
                      </div>
                      <div className="h-full bg-amber-950 text-amber-400 text-right pr-3 flex items-center justify-end transition-all duration-500" style={{ width: `${canaryWeight}%` }}>
                        {canaryWeight}%
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-sky-400">BLUE STACK (v2.0.9)</span>
                      <span className="text-emerald-450">GREEN STACK (v2.1.0)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center text-xs">
                      <div className={`p-3.5 rounded-xl border transition-all ${
                        blueGreenActiveColor === "blue" 
                          ? "bg-sky-950/30 border-sky-500 text-sky-400 font-black" 
                          : "bg-slate-900/40 border-slate-900 text-slate-600"
                      }`}>
                        <span>BLUE Pool (ACTIVE)</span>
                        <span className="block text-[10px] font-mono mt-1">100% Ingress traffic</span>
                      </div>

                      <div className={`p-3.5 rounded-xl border transition-all ${
                        blueGreenActiveColor === "green" 
                          ? "bg-emerald-950/30 border-emerald-500 text-emerald-400 font-black" 
                          : "bg-slate-900/40 border-slate-900 text-slate-600"
                      }`}>
                        <span>GREEN Pool (STANDBY)</span>
                        <span className="block text-[10px] font-mono mt-1">Ready for smoke checks</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* SUBTAB 4: TERRAFORM IAC HCL CONFIGURATION */}
      {/* ==================================================== */}
      {activeSubTab === "iac_terraform" && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* IaC State List */}
            <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-400" />
                  Terraform State Provider Resources
                </h3>
                <span className="text-[9px] text-slate-500 font-mono">gs://remote-backend</span>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {terraformResources.map((res, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs font-semibold font-mono">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 block max-w-[140px] truncate">{res.type}</span>
                        <span className="text-[8px] text-slate-500">({res.provider})</span>
                      </div>
                      <p className="text-[10px] text-slate-300">Name: {res.name}</p>
                    </div>

                    <span className="text-[9.5px] text-emerald-450 font-bold uppercase">{res.status}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-850">
                <button
                  onClick={runTerraformApply}
                  disabled={isTerraformRunning}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isTerraformRunning ? "animate-spin" : ""}`} />
                  <span>terraform apply -auto-approve</span>
                </button>
              </div>

            </div>

            {/* Live terraform logs & interactive HCL */}
            <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Code className="w-4 h-4 text-indigo-400" />
                Active HCL Config Declarations (main.tf)
              </h3>

              {/* HCL Editor */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[10.5px] leading-relaxed h-[230px] overflow-y-auto">
                <pre className="text-slate-300">{terraformHclCode}</pre>
              </div>

              {/* Terraform live outputs */}
              <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 font-mono text-[9.5px] text-slate-450 max-h-[110px] overflow-y-auto">
                {terraformLogs.map((log, i) => (
                  <div key={i} className={`${
                    log.includes("complete") || log.includes("remote") ? "text-emerald-400" : ""
                  }`}>
                    {log}
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* SUBTAB 5: SECRETS AUDITING & COMPLIANCE */}
      {/* ==================================================== */}
      {activeSubTab === "secrets_compliance" && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Secrets Manager Visual Vault */}
            <div className="lg:col-span-6 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-purple-400" />
                  KMS Encrypted Application Secrets Vault (Production)
                </h3>
                <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                  <Lock className="w-3 h-3 text-purple-400" /> GCP KMS Ring Active
                </span>
              </div>

              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {secrets.map((secret, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 font-bold block">{secret.key}</span>
                      <p className="text-[10px] text-purple-450">
                        Value: {secret.isMasked ? "••••••••••••••••" : secret.value}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSecretMask(i)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 cursor-pointer"
                        title={secret.isMasked ? "Reveal Secret" : "Hide Secret"}
                      >
                        {secret.isMasked ? <Eye className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-purple-450" />}
                      </button>
                      <span className="text-[8px] text-slate-500">{secret.lastUpdated}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Secret Form */}
              <form onSubmit={addSecret} className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-900 space-y-3">
                <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Inject KMS Secret Key</span>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="SECRET_KEY_NAME" 
                    value={newSecretKey}
                    onChange={(e) => setNewSecretKey(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs rounded px-2 py-1 outline-none text-slate-200"
                  />
                  <input 
                    type="password" 
                    placeholder="Secret value token..." 
                    value={newSecretValue}
                    onChange={(e) => setNewSecretValue(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs rounded px-2 py-1 outline-none text-slate-200"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-purple-900/40 hover:bg-purple-950 border border-purple-500/20 text-purple-400 rounded text-xs font-bold cursor-pointer"
                >
                  + Encrypt & Save to GCP KMS Keyring
                </button>
              </form>

            </div>

            {/* Compliance Guard Checks */}
            <div className="lg:col-span-6 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-450" />
                Compliance Guardrails & Automated Security Auditing (SOC2/PCI)
              </h3>

              <div className="space-y-2.5">
                <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-200 block">Kube-bench CIS Kubernetes Benchmark</span>
                    <p className="text-[10px] text-slate-500">100% of master/node security controls passing compliance standard rules.</p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-200 block">Automatic GKE Workload Identity IAM validation</span>
                    <p className="text-[10px] text-slate-500">Service accounts mapped strictly to minimum privilege requirements.</p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-200 block">At-Rest & In-Transit Cryptographic Key Rotations</span>
                    <p className="text-[10px] text-slate-500">Secrets encrypted using KMS hardware modules with dynamic envelope rotation rules.</p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-200 block">PCI-DSS Flight Reservation Cardholder isolation rules</span>
                    <p className="text-[10px] text-slate-500">Sensitive booking payment payload data restricted strictly under tokenized VPC namespaces.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-xl text-[10px] font-mono text-slate-500 leading-normal">
                <strong className="text-purple-400 uppercase block mb-1">CIS Benchmarks SLA Score</strong>
                Infrastructure achieves a combined compliance SLA of <strong>100.0%</strong>. Workload identity protection is verified hourly by continuous SRE cron audit runners.
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* SUBTAB 6: DISASTER RECOVERY & AUTOSCALING */}
      {/* ==================================================== */}
      {activeSubTab === "dr_autoscaling" && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-1">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">Active pod count (HPA)</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black font-mono text-slate-100">{gkeActivePodCount} pods</span>
                <span className="text-[10px] text-indigo-400 font-mono">Min 3, Max 30</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Aggregate traffic load auto-scaling</p>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-1">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">Regional Cluster Memory (GKE)</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black font-mono text-slate-100">{(gkeActivePodCount * 1.4).toFixed(1)} GB</span>
                <span className="text-[10px] text-slate-500 font-mono">Limit: 96.0 GB</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Auto allocated by Node Autoprovisioner</p>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-1">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">Last Database Backup Time</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-black font-mono text-slate-100 truncate max-w-[190px]">{lastBackupTime}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Continuous Wal-G transaction logs</p>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-1">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">Disaster Recovery RTO / RPO targets</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black font-mono text-indigo-400">RTO &lt; 5s</span>
                <span className="text-[10px] text-slate-500 font-mono">RPO = 0</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Multi-region real-time sync</p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Live Traffic Scale slider */}
            <div className="lg:col-span-6 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-sky-400" />
                Live Aggregate Ingress Queries Selector (HPA scaling simulator)
              </h3>

              <div className="space-y-4">
                <div className="space-y-1 bg-slate-950 p-4 rounded-xl border border-slate-900">
                  <div className="flex justify-between text-xs font-mono font-bold mb-2">
                    <span className="text-slate-400">Ingress Traffic QPS:</span>
                    <span className="text-sky-400 text-sm font-black">{productionTrafficQps} QPS</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="600" 
                    value={productionTrafficQps}
                    onChange={(e) => setProductionTrafficQps(Number(e.target.value))}
                    className="w-full cursor-pointer accent-sky-500 bg-slate-800 h-1.5 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between font-mono text-[9px] text-slate-500 mt-1">
                    <span>50 QPS (Low traffic)</span>
                    <span>300 QPS (Average)</span>
                    <span>600 QPS (Peak load scale)</span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs space-y-2.5">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Autoscaling Algorithm Event Stream</span>
                  <div className="space-y-1 font-mono text-[10px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Target CPU utilization setpoint:</span>
                      <span className="text-slate-200">75%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calculated target replicas scale:</span>
                      <span className="text-sky-400 font-bold">{gkeActivePodCount} pods</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* DR Active Failover Command */}
            <div className="lg:col-span-6 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                  Execute Production Disaster Failover Drill (Multi-Region)
                </h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Fails over traffic, promos database replica, and redirects global load balancer endpoints securely between active regions.
                </p>
              </div>

              {/* Live console logging for failover drill */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 font-mono text-[10px] leading-relaxed h-[130px] overflow-y-auto space-y-1">
                {drProgressLogs.length === 0 ? (
                  <div className="text-slate-500">[System] Disaster standby initialized. Ready to run failure validation.</div>
                ) : (
                  drProgressLogs.map((log, i) => (
                    <div key={i} className={`${log.includes("Complete") ? "text-emerald-400" : "text-slate-350"}`}>{log}</div>
                  ))
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={runDrFailoverDrill}
                  disabled={isDrRunning}
                  className="py-2.5 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CloudLightning className="w-4 h-4 text-white" />
                  <span>Execute Failover Drill</span>
                </button>

                <button
                  onClick={() => {
                    setDrStatus("Standby");
                    setDrProgressLogs([]);
                  }}
                  className="py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Reset Standby
                </button>
              </div>

            </div>

          </div>

          {/* DevOps Production Infrastructure Architecture layout */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-400" />
              Production Multi-Region Cloud Deployment Architecture Map
            </h3>

            {/* Map wrapper */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 overflow-x-auto">
              <div className="min-w-[700px] flex items-stretch justify-between text-center font-mono text-[10px] space-x-3">
                
                {/* 1. Global Load Balancer */}
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg w-44 flex flex-col justify-between">
                  <div className="font-bold text-slate-200 uppercase text-[9px] border-b border-slate-800 pb-1">Cloud CDN / Ingress</div>
                  <div className="space-y-1 text-slate-400 text-[8.5px] py-2">
                    <div className="bg-slate-950 p-1 rounded">Anycast Global IP</div>
                    <div className="bg-slate-950 p-1 rounded">SSL termination</div>
                    <div className="bg-slate-950 p-1 rounded">DDoS Shield Guard</div>
                  </div>
                  <p className="text-[7.5px] text-slate-500 leading-normal">Routes traffic dynamically based on SLA response times</p>
                </div>

                <div className="flex flex-col justify-center items-center text-slate-600">
                  <ArrowRight className="w-4 h-4 text-sky-400 animate-pulse" />
                  <span className="text-[8px] mt-1 text-slate-500">Route weight</span>
                </div>

                {/* 2. Primary Europe Zone */}
                <div className="bg-slate-900/80 border border-sky-500/20 p-3 rounded-lg w-52 space-y-2 relative">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-sky-950 text-sky-400 text-[8px] px-2 py-0.5 rounded-full border border-sky-500/20 font-black">ACTIVE - EUR CENTRAL</div>
                  <div className="font-bold text-slate-200 uppercase text-[9px] border-b border-slate-800 pb-1 mt-1">GKE Primary Cluster</div>
                  <div className="space-y-1 text-[8.5px] text-slate-400">
                    <div className="bg-slate-950 p-1 rounded flex justify-between"><span>Gateway (Go)</span><span className="text-emerald-400">Met SLA</span></div>
                    <div className="bg-slate-950 p-1 rounded flex justify-between"><span>Search API</span><span className="text-emerald-400">Active</span></div>
                    <div className="bg-slate-950 p-1 rounded flex justify-between"><span>ML Forecaster</span><span className="text-emerald-400">96.8%</span></div>
                  </div>
                  <p className="text-[8px] text-slate-500">Directly connected to local Redis Cluster</p>
                </div>

                <div className="flex flex-col justify-center items-center text-slate-600">
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                  <span className="text-[8px] mt-1 text-slate-500">Continuous Sync</span>
                </div>

                {/* 3. Backup US East Zone */}
                <div className="bg-slate-900/80 border border-rose-500/10 p-3 rounded-lg w-52 space-y-2 relative">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-rose-950 text-rose-400 text-[8px] px-2 py-0.5 rounded-full border border-rose-500/20 font-black">FAILOVER - US EAST</div>
                  <div className="font-bold text-slate-200 uppercase text-[9px] border-b border-slate-800 pb-1 mt-1">GKE Standby Cluster</div>
                  <div className="space-y-1 text-[8.5px] text-slate-400">
                    <div className="bg-slate-950 p-1 rounded flex justify-between"><span>Gateway Replica</span><span className="text-slate-500">Standby</span></div>
                    <div className="bg-slate-950 p-1 rounded flex justify-between"><span>Search API Rep</span><span className="text-slate-500">Standby</span></div>
                    <div className="bg-slate-950 p-1 rounded flex justify-between"><span>ML Replica</span><span className="text-slate-500">Standby</span></div>
                  </div>
                  <p className="text-[8px] text-slate-500">Multi-zone cluster replication target</p>
                </div>

              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

// Map pipeline step logs for live feedback simulation
function getLogsForStep(step: number, version: string): string[] {
  switch (step) {
    case 0:
      return [
        `[CI Step 1/5] node --version => v20.11.0`,
        `[CI Step 1/5] npm install --frozen-lockfile completed. Added 425 dependencies.`
      ];
    case 1:
      return [
        `[CI Step 2/5] npm run lint => No issues detected.`,
        `[CI Step 2/5] tsc --noEmit => TypeScript compilation successful.`
      ];
    case 2:
      return [
        `[CI Step 3/5] Docker build --target production -t ghcr.io/org/flysmart/gateway:${version} .`,
        `[CI Step 3/5] Docker layer cache hit ratio: 84.1%`,
        `[CI Step 3/5] Successfully built image layer hash sha256:7f49a21b8`
      ];
    case 3:
      return [
        `[CI Step 4/5] Trivy security scan summary: 0 Critical, 0 High, 2 Medium vulnerabilities checked.`,
        `[CI Step 4/5] Container is certified compliant under SRE production security parameters.`
      ];
    case 4:
      return [
        `[CI Step 5/5] Authorizing connection to GitHub Container Registry (GHCR)...`,
        `[CI Step 5/5] Pushed image ghcr.io/org/flysmart/gateway:${version} successfully. Size: 184MB.`
      ];
    default:
      return [];
  }
}
