import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  NOTIFICATION_CHANNELS, 
  NOTIFICATION_TEMPLATES, 
  PRIORITY_QUEUES, 
  DIGEST_CHANNELS,
  NotificationChannel, 
  NotificationTemplate, 
  QueuedNotification 
} from "../data/notificationDocs";
import { 
  Mail, 
  MessageSquare, 
  Bell, 
  Send, 
  RefreshCw, 
  Clock, 
  Sliders, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  MousePointerClick, 
  UserMinus, 
  Cpu, 
  Database, 
  ShieldAlert, 
  Zap, 
  Languages, 
  Layers, 
  Activity, 
  Info, 
  ChevronRight, 
  Terminal, 
  Smartphone,
  Check,
  Flame,
  FileText
} from "lucide-react";

export default function NotificationExplorer() {
  // Config state
  const [channels, setChannels] = useState<NotificationChannel[]>(JSON.parse(JSON.stringify(NOTIFICATION_CHANNELS)));
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(NOTIFICATION_TEMPLATES[0].id);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("push");
  const [selectedLocale, setSelectedLocale] = useState<string>("en");
  const [selectedPriority, setSelectedPriority] = useState<"high" | "medium" | "low" | "auto">("auto");
  const [userName, setUserName] = useState<string>("Sarah Jenkins");
  
  // Custom template variables (reactive to template selection)
  const [varPrice, setVarPrice] = useState<string>("190");
  const [varStandardPrice, setVarStandardPrice] = useState<string>("1850");
  const [varDropPercent, setVarDropPercent] = useState<string>("35");
  const [varDelayMinutes, setVarDelayMinutes] = useState<string>("45");
  const [varGate, setVarGate] = useState<string>("B12");
  
  // Simulation Controls
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);
  const [rateLimitCapacity, setRateLimitCapacity] = useState<number>(3); // Max tokens in bucket
  const [tokenBucket, setTokenBucket] = useState<number>(3);
  const [unsubscribedChannels, setUnsubscribedChannels] = useState<string[]>([]);
  
  // Dynamic queue state
  const [queue, setQueue] = useState<QueuedNotification[]>([
    {
      id: "ntf-9021",
      userId: "usr-481",
      channelId: "push",
      priority: "high",
      locale: "en",
      templateId: "flight-delayed-reminder",
      variables: { userName: "Sarah Jenkins", delayMinutes: "45", newDeparture: "11:30 PM", gate: "B12" },
      status: "delivered",
      retryCount: 0,
      deliveryTracker: {
        sentAt: "22:50:01",
        deliveredAt: "22:50:02",
        opened: true,
        clicked: false
      }
    },
    {
      id: "ntf-4402",
      userId: "usr-481",
      channelId: "email",
      priority: "medium",
      locale: "es",
      templateId: "price-drop-nyc-lon",
      variables: { userName: "Sarah Jenkins", dropPercent: "35", currentPrice: "240" },
      status: "delivered",
      retryCount: 0,
      deliveryTracker: {
        sentAt: "22:50:45",
        deliveredAt: "22:50:47",
        opened: true,
        clicked: true
      }
    }
  ]);

  // Telemetry metric states
  const [rateLimitedAttempts, setRateLimitedAttempts] = useState<number>(0);
  const [unsubscribedAttempts, setUnsubscribedAttempts] = useState<number>(0);
  const [successfulDispatches, setSuccessfulDispatches] = useState<number>(2);
  const [retryTriggerCount, setRetryTriggerCount] = useState<number>(0);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "[SYSTEM INITIALIZED] Global Notification Gateway listening on port 8080.",
    "[RATE LIMITER] Redis Token-Bucket active with 3 req/sec burst limit.",
    "[WEBHOOKS] B2B callback validation key certified."
  ]);

  // Select active template config
  const activeTemplate = useMemo(() => {
    return NOTIFICATION_TEMPLATES.find(t => t.id === selectedTemplateId) || NOTIFICATION_TEMPLATES[0];
  }, [selectedTemplateId]);

  // Push system telemetry message
  const logTelemetry = (msg: string) => {
    const timestamp = new Date().toISOString().split("T")[1].substring(0, 8);
    setTelemetryLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 39)]);
  };

  // Unsubscribe channel toggling
  const toggleUnsubscribe = (channelId: string) => {
    if (unsubscribedChannels.includes(channelId)) {
      setUnsubscribedChannels(prev => prev.filter(c => c !== channelId));
      logTelemetry(`[OPTOUT ENGINE] User opted back in to Channel: ${channelId.toUpperCase()}`);
    } else {
      setUnsubscribedChannels(prev => [...prev, channelId]);
      logTelemetry(`[OPTOUT ENGINE] User opted out / unsubscribed from Channel: ${channelId.toUpperCase()}`);
    }
  };

  // Auto-refill Token Bucket for Rate Limiting simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTokenBucket(curr => Math.min(rateLimitCapacity, curr + 1));
    }, 1500);
    return () => clearInterval(interval);
  }, [rateLimitCapacity]);

  // Process message queue ticks (simulating asynchronous queues)
  useEffect(() => {
    const interval = setInterval(() => {
      setQueue(currQueue => {
        let queueChanged = false;
        const updated = currQueue.map(msg => {
          if (msg.status === "queued" || msg.status === "retrying") {
            queueChanged = true;
            // Token bucket check
            if (tokenBucket <= 0) {
              setRateLimitedAttempts(prev => prev + 1);
              logTelemetry(`[RATE LIMITER EXCEEDED] Throttle triggered for message ${msg.id}. Postponing dispatch.`);
              return msg; // remain in queued state
            }

            // Deduct 1 token
            setTokenBucket(t => Math.max(0, t - 1));

            // Simulating network failure or provider offline
            if (simulateFailure) {
              const nextRetry = msg.retryCount + 1;
              setRetryTriggerCount(prev => prev + 1);
              if (nextRetry > 2) {
                logTelemetry(`[DISPATCH FAILED] Max retries exhausted for message ${msg.id}. Transferring to Dead-Letter Queue (DLQ).`);
                return {
                  ...msg,
                  status: "failed",
                  retryCount: nextRetry
                };
              } else {
                logTelemetry(`[PROV_ERR] Channel upstream rejected payload. Rescheduling ${msg.id} for backoff retry #${nextRetry}.`);
                return {
                  ...msg,
                  status: "retrying",
                  retryCount: nextRetry
                };
              }
            }

            // Standard successful dispatch transition
            const now = new Date();
            const timeStr = now.toISOString().split("T")[1].substring(0, 8);
            logTelemetry(`[DISPATCHED] Message ${msg.id} successfully pushed over protocol ${channels.find(c => c.id === msg.channelId)?.protocol || "SMTP"}.`);
            setSuccessfulDispatches(prev => prev + 1);
            
            return {
              ...msg,
              status: "delivered",
              deliveryTracker: {
                sentAt: timeStr,
                deliveredAt: timeStr,
                opened: false,
                clicked: false
              }
            };
          }
          return msg;
        });

        return queueChanged ? updated : currQueue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tokenBucket, simulateFailure, channels]);

  // Trigger dynamic notification dispatch
  const handleDispatch = () => {
    const finalPriority = selectedPriority === "auto" ? activeTemplate.defaultPriority : selectedPriority;
    const isChannelBlocked = unsubscribedChannels.includes(selectedChannelId);

    // Build values dictionary
    const variables: { [key: string]: string } = { userName };
    if (activeTemplate.id.includes("price-drop")) {
      variables.dropPercent = varDropPercent;
      variables.currentPrice = varPrice;
    } else if (activeTemplate.id.includes("mistake-fare")) {
      variables.currentPrice = varPrice;
      variables.standardPrice = varStandardPrice;
    } else {
      variables.delayMinutes = varDelayMinutes;
      variables.newDeparture = "11:45 PM";
      variables.gate = varGate;
    }

    if (isChannelBlocked) {
      setUnsubscribedAttempts(prev => prev + 1);
      logTelemetry(`[OPTOUT BLOCKED] Aborted dispatch of ${activeTemplate.name}. User has unsubscribed from channel: ${selectedChannelId.toUpperCase()}`);
      return;
    }

    const newId = `ntf-${Math.floor(Math.random() * 9000) + 1000}`;
    const newMsg: QueuedNotification = {
      id: newId,
      userId: "usr-481",
      channelId: selectedChannelId,
      priority: finalPriority,
      locale: selectedLocale,
      templateId: selectedTemplateId,
      variables,
      status: "queued",
      retryCount: 0
    };

    logTelemetry(`[QUEUED] Enqueued new message ${newId} onto Priority Queue: ${finalPriority.toUpperCase()}. Ready for rate-limiter check.`);
    setQueue(prev => [newMsg, ...prev]);
  };

  // Simulate user interact actions (Open or Click)
  const triggerTelemetryAction = (msgId: string, action: "open" | "click") => {
    setQueue(prev => {
      return prev.map(msg => {
        if (msg.id === msgId && msg.deliveryTracker) {
          const tracker = { ...msg.deliveryTracker };
          if (action === "open") {
            tracker.opened = true;
            logTelemetry(`[TELEMETRY RECEIVED] Tracked event 'MESSAGE_OPEN' for ID ${msgId} over channel ${msg.channelId.toUpperCase()}.`);
          } else if (action === "click") {
            tracker.opened = true; // opening is implied by clicking
            tracker.clicked = true;
            logTelemetry(`[TELEMETRY RECEIVED] Tracked event 'LINK_CLICKED' for ID ${msgId} (Redirect target: tracking-redirect-proxy).`);
          }
          return {
            ...msg,
            deliveryTracker: tracker
          };
        }
        return msg;
      });
    });
  };

  // Unsubscribe directly via tracking click
  const triggerUnsubscribeAction = (msgId: string) => {
    setQueue(prev => {
      const target = prev.find(m => m.id === msgId);
      if (target) {
        toggleUnsubscribe(target.channelId);
        logTelemetry(`[TELEMETRY RECEIVED] User clicked 'UNSUBSCRIBE' headers/link on notification ${msgId}.`);
      }
      return prev.map(msg => {
        if (msg.id === msgId && msg.deliveryTracker) {
          return {
            ...msg,
            deliveryTracker: {
              ...msg.deliveryTracker,
              unsubscribed: true
            }
          };
        }
        return msg;
      });
    });
  };

  // Generate real-time preview of active notification layout
  const renderedOutput = useMemo(() => {
    const templateLoc = activeTemplate.localization[selectedLocale] || activeTemplate.localization["en"];
    let body = templateLoc.body;
    let subject = templateLoc.subject || "";

    // Replace variables
    body = body
      .replace("{{userName}}", userName)
      .replace("{{dropPercent}}", varDropPercent)
      .replace("{{currentPrice}}", varPrice)
      .replace("{{standardPrice}}", varStandardPrice)
      .replace("{{delayMinutes}}", varDelayMinutes)
      .replace("{{newDeparture}}", "11:45 PM")
      .replace("{{gate}}", varGate);

    if (subject) {
      subject = subject
        .replace("{{userName}}", userName)
        .replace("{{dropPercent}}", varDropPercent)
        .replace("{{currentPrice}}", varPrice)
        .replace("{{standardPrice}}", varStandardPrice)
        .replace("{{delayMinutes}}", varDelayMinutes)
        .replace("{{newDeparture}}", "11:45 PM")
        .replace("{{gate}}", varGate);
    }

    return { subject, body };
  }, [activeTemplate, selectedLocale, userName, varPrice, varStandardPrice, varDropPercent, varDelayMinutes, varGate]);

  return (
    <div className="space-y-6 animate-fadeIn" id="notification-platform-root">
      
      {/* Top Banner with Architecture Context */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-black uppercase max-w-max">
            Enterprise Edge Gateway
          </div>
          <h2 className="text-lg font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            High-Throughput Global Notification Platform
          </h2>
          <p className="text-xs text-slate-400">
            A real-time visual simulation of a distributed template-driven message broker. Features multi-channel routing with dynamic token-bucket rate limiting, localized prioritizations, automated retry backoffs, and telemetry event processors.
          </p>
        </div>

        {/* Aggregate Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-slate-950/85 border border-slate-900 px-3 py-2.5 rounded-xl text-center min-w-[100px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Dispatched</span>
            <span className="text-xs font-black text-emerald-400 font-mono">{successfulDispatches}</span>
          </div>
          <div className="bg-slate-950/85 border border-slate-900 px-3 py-2.5 rounded-xl text-center min-w-[100px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Throttled</span>
            <span className="text-xs font-black text-amber-500 font-mono">{rateLimitedAttempts}</span>
          </div>
          <div className="bg-slate-950/85 border border-slate-900 px-3 py-2.5 rounded-xl text-center min-w-[100px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Opt-Out Blocks</span>
            <span className="text-xs font-black text-indigo-400 font-mono">{unsubscribedAttempts}</span>
          </div>
          <div className="bg-slate-950/85 border border-slate-900 px-3 py-2.5 rounded-xl text-center min-w-[100px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Retry Invocations</span>
            <span className="text-xs font-black text-rose-450 font-mono">{retryTriggerCount}</span>
          </div>
        </div>
      </div>

      {/* Main Grid Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Hand Column: Trigger Console & Live Template Tuning */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 backdrop-blur-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Sliders className="w-4 h-4 text-emerald-450" />
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                Target User & Template Config
              </h3>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              {/* User Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Target User Profile</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl font-medium text-slate-200 focus:outline-none focus:border-slate-750"
                  placeholder="Sarah Jenkins"
                />
              </div>

              {/* Template Category Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Alert Template Category</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    const tid = e.target.value;
                    setSelectedTemplateId(tid);
                    if (tid.includes("price-drop")) {
                      setVarPrice("240");
                      setVarDropPercent("35");
                    } else if (tid.includes("mistake-fare")) {
                      setVarPrice("190");
                      setVarStandardPrice("1850");
                    } else {
                      setVarDelayMinutes("45");
                      setVarGate("B12");
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl font-medium text-slate-300 focus:outline-none"
                >
                  {NOTIFICATION_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Responsive Variable tuning fields */}
              <div className="bg-slate-950/55 border border-slate-900 p-3.5 rounded-xl space-y-3">
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Dynamic Message Interpolators</span>
                
                {selectedTemplateId.includes("price-drop") && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Current Price ($)</label>
                      <input
                        type="number"
                        value={varPrice}
                        onChange={(e) => setVarPrice(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 p-2 rounded-lg text-slate-300 font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Drop Percent (%)</label>
                      <input
                        type="number"
                        value={varDropPercent}
                        onChange={(e) => setVarDropPercent(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 p-2 rounded-lg text-slate-300 font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedTemplateId.includes("mistake-fare") && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Mistake Price ($)</label>
                      <input
                        type="number"
                        value={varPrice}
                        onChange={(e) => setVarPrice(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 p-2 rounded-lg text-slate-300 font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Standard Price ($)</label>
                      <input
                        type="number"
                        value={varStandardPrice}
                        onChange={(e) => setVarStandardPrice(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 p-2 rounded-lg text-slate-300 font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedTemplateId.includes("delayed") && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Delay (minutes)</label>
                      <input
                        type="number"
                        value={varDelayMinutes}
                        onChange={(e) => setVarDelayMinutes(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 p-2 rounded-lg text-slate-300 font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Gate Number</label>
                      <input
                        type="text"
                        value={varGate}
                        onChange={(e) => setVarGate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 p-2 rounded-lg text-slate-300 font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Localization Select */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Target Translation</label>
                  <span className="flex items-center gap-1 text-[9px] text-indigo-400"><Languages className="w-3.5 h-3.5" /> i18n Engaged</span>
                </div>
                <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 border border-slate-850 rounded-xl">
                  {[
                    { id: "en", label: "English" },
                    { id: "es", label: "Español" },
                    { id: "ja", label: "日本語" },
                    { id: "de", label: "Deutsch" }
                  ].map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocale(loc.id)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                        selectedLocale === loc.id ? "bg-slate-900 border border-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Protocol Channel Choice */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Transmission Channel & Protocol</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {channels.map(chan => {
                    const isSelected = selectedChannelId === chan.id;
                    const isBlocked = unsubscribedChannels.includes(chan.id);
                    return (
                      <button
                        key={chan.id}
                        onClick={() => setSelectedChannelId(chan.id)}
                        className={`p-2.5 rounded-xl text-left border flex flex-col justify-between h-14 cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-slate-950 border-emerald-500/50" 
                            : "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                        } ${isBlocked ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-[10px] font-bold truncate ${isSelected ? "text-emerald-400" : "text-slate-300"}`}>
                            {chan.id.toUpperCase()}
                          </span>
                          {isBlocked && (
                            <span className="text-[8px] bg-rose-950 text-rose-400 px-1 rounded uppercase font-black tracking-wider">
                              OPTOUT
                            </span>
                          )}
                        </div>
                        <span className="text-[8px] text-slate-500 font-mono truncate">{chan.protocol}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority override selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Priority Queue Mapping</label>
                <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 border border-slate-850 rounded-xl">
                  {[
                    { id: "auto", label: "Auto (SLA)" },
                    { id: "high", label: "High" },
                    { id: "medium", label: "Medium" },
                    { id: "low", label: "Low" }
                  ].map(pr => (
                    <button
                      key={pr.id}
                      onClick={() => setSelectedPriority(pr.id as any)}
                      className={`py-1 rounded-lg text-[9px] font-mono font-bold cursor-pointer transition-colors ${
                        selectedPriority === pr.id ? "bg-slate-900 border border-slate-800 text-sky-400" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* DISPATCH ACTION */}
              <button
                onClick={handleDispatch}
                className="w-full mt-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-2 uppercase transition-all shadow-lg hover:shadow-emerald-950/20"
              >
                <Send className="w-4 h-4" />
                Dispatch Dynamic Event
              </button>

            </div>
          </div>
        </div>

        {/* Center Column: Live Transmission Queue & Network Limiter */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Real-time Queue Processor */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                  Redis Priority Queue & Dispatcher
                </h3>
              </div>
              
              {/* Simulation fault injection */}
              <label className="flex items-center gap-1.5 text-[9px] text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => {
                    setSimulateFailure(e.target.checked);
                    logTelemetry(`[FAULT INJECTION] Upstream network errors toggled: ${e.target.checked ? "ON" : "OFF"}`);
                  }}
                  className="rounded border-slate-850 bg-slate-950 text-rose-500 focus:ring-0 w-3 h-3"
                />
                <span className="text-rose-400 font-bold">Infect Carrier Failures</span>
              </label>
            </div>

            {/* Token Bucket Health visual */}
            <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400 uppercase">Rate-Limiter (Token Bucket)</span>
                <span className="text-emerald-400 font-bold">{tokenBucket} / {rateLimitCapacity} Tokens</span>
              </div>
              
              {/* Battery-like progress bar */}
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden flex gap-0.5">
                {Array.from({ length: rateLimitCapacity }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-full flex-1 transition-all ${
                      idx < tokenBucket 
                        ? "bg-emerald-500" 
                        : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>

              {/* Slider to control rate limits */}
              <div className="flex justify-between items-center text-[9px] pt-1">
                <span className="text-slate-500">Peak Capacity</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={rateLimitCapacity}
                    onChange={(e) => setRateLimitCapacity(parseInt(e.target.value))}
                    className="w-16 h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="font-mono text-slate-300">{rateLimitCapacity} req/s</span>
                </div>
              </div>
            </div>

            {/* Live Queue Cards */}
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {queue.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                  [Empty Dispatch Pipeline]
                  <p className="text-[10px] text-slate-600 mt-1">No alerts currently flowing.</p>
                </div>
              ) : (
                queue.map((msg) => {
                  let statusBg = "bg-slate-900 border-slate-800 text-slate-400";
                  let statusLabel = msg.status.toUpperCase();
                  
                  if (msg.status === "delivered") {
                    statusBg = "bg-emerald-950/20 border-emerald-900/30 text-emerald-400";
                  } else if (msg.status === "failed") {
                    statusBg = "bg-rose-950/20 border-rose-900/30 text-rose-450";
                  } else if (msg.status === "retrying") {
                    statusBg = "bg-amber-950/20 border-amber-900/40 text-amber-400 animate-pulse";
                    statusLabel = `RETRYING (${msg.retryCount}/3)`;
                  } else if (msg.status === "queued") {
                    statusBg = "bg-sky-950/20 border-sky-900/30 text-sky-400 animate-pulse";
                  }

                  let priorityColor = "text-sky-400 bg-sky-950/30";
                  if (msg.priority === "high") priorityColor = "text-rose-400 bg-rose-950/30 border-rose-900/20";
                  if (msg.priority === "low") priorityColor = "text-slate-500 bg-slate-900";

                  const templateObj = NOTIFICATION_TEMPLATES.find(t => t.id === msg.templateId);

                  return (
                    <div 
                      key={msg.id}
                      className={`border p-3.5 rounded-xl space-y-3 transition-all relative ${statusBg}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold font-mono">{msg.id}</span>
                          <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded border uppercase ${priorityColor}`}>
                            {msg.priority}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono opacity-80">{msg.channelId.toUpperCase()}</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-300 truncate">
                          {templateObj?.name || "Dynamic Event Notification"}
                        </div>
                        
                        {/* Interactive triggers for telemetry */}
                        {msg.status === "delivered" && (
                          <div className="flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-lg border border-white/5">
                            <span className="text-[8px] font-mono text-slate-500 uppercase mr-1">Trace Event:</span>
                            
                            <button
                              disabled={msg.deliveryTracker?.opened}
                              onClick={() => triggerTelemetryAction(msg.id, "open")}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-0.5 transition-colors cursor-pointer ${
                                msg.deliveryTracker?.opened 
                                  ? "bg-slate-900 text-slate-500" 
                                  : "bg-emerald-950 text-emerald-400 border border-emerald-900/40 hover:bg-emerald-900"
                              }`}
                            >
                              <Eye className="w-2.5 h-2.5" />
                              Open
                            </button>

                            <button
                              disabled={msg.deliveryTracker?.clicked}
                              onClick={() => triggerTelemetryAction(msg.id, "click")}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-0.5 transition-colors cursor-pointer ${
                                msg.deliveryTracker?.clicked 
                                  ? "bg-slate-900 text-slate-500" 
                                  : "bg-sky-950 text-sky-400 border border-sky-900/40 hover:bg-sky-900"
                              }`}
                            >
                              <MousePointerClick className="w-2.5 h-2.5" />
                              Click
                            </button>

                            <button
                              disabled={msg.deliveryTracker?.unsubscribed}
                              onClick={() => triggerUnsubscribeAction(msg.id)}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-0.5 transition-colors ml-auto cursor-pointer ${
                                msg.deliveryTracker?.unsubscribed 
                                  ? "bg-rose-900/30 text-rose-400" 
                                  : "bg-rose-950 text-rose-400 border border-rose-900/40 hover:bg-rose-900"
                              }`}
                            >
                              <UserMinus className="w-2.5 h-2.5" />
                              Opt-Out
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Status timeline flags */}
                      <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 pt-1.5 border-t border-white/5">
                        <span>Retries: {msg.retryCount}/3</span>
                        <span className="font-bold uppercase tracking-wider">{statusLabel}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Hand Column: Phone Display Mock & Logs Terminal */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Smart Phone Interface Renderer */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                  Device Rendering Mock
                </h3>
              </div>
              <span className="text-[8px] font-mono text-slate-500 uppercase">Live Output</span>
            </div>

            {/* Simulated Phone UI */}
            <div className="bg-slate-950 rounded-2xl border-4 border-slate-850 p-3 h-[250px] relative overflow-hidden flex flex-col justify-between">
              
              {/* iPhone style status bar */}
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 px-1 border-b border-white/5 pb-1 select-none">
                <span>09:41 AM</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <span className="w-4 h-2 border border-slate-600 rounded-sm relative inline-block"><span className="absolute top-0.5 left-0.5 bottom-0.5 right-0.5 bg-slate-500 rounded-sm"></span></span>
                </div>
              </div>

              {/* Dynamic Notification Bubble */}
              <div className="my-auto space-y-3">
                {selectedChannelId === "email" ? (
                  /* Rich Email Presentation */
                  <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 shadow-xl space-y-2 text-[10px] leading-relaxed">
                    <div className="border-b border-slate-850 pb-1.5">
                      <div className="text-slate-500 flex justify-between font-mono text-[8px]">
                        <span>From: alerts@flysmart.io</span>
                        <span>To: {userName.toLowerCase()}@gmail.com</span>
                      </div>
                      <div className="font-bold text-slate-200 tracking-tight mt-1">{renderedOutput.subject}</div>
                    </div>
                    <p className="text-slate-400 leading-normal font-semibold italic">{renderedOutput.body}</p>
                    
                    {/* Unsubscribe standard footer link */}
                    <div className="text-[8px] text-slate-500 pt-1.5 border-t border-slate-850 flex items-center justify-between font-mono">
                      <span>Ref: {selectedTemplateId}</span>
                      <span className="underline cursor-pointer hover:text-slate-350">Unsubscribe</span>
                    </div>
                  </div>
                ) : selectedChannelId === "push" ? (
                  /* Mobile Push Banner */
                  <div className="bg-slate-900 border-l-4 border-emerald-500 rounded-r-xl rounded-l-md p-3 shadow-xl space-y-1.5">
                    <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span> FLYSMART GATEWAY</span>
                      <span>Now</span>
                    </div>
                    <p className="text-slate-200 text-[9px] font-bold leading-snug">{renderedOutput.body}</p>
                  </div>
                ) : selectedChannelId === "sms" ? (
                  /* SMS Chat Bubble */
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl max-w-[85%] self-start text-[10px] shadow-lg relative">
                    <div className="text-[8px] text-emerald-400 font-mono mb-1">SMS From: +1 (555) FLY-SMART</div>
                    <p className="text-slate-250 leading-relaxed font-semibold">{renderedOutput.body}</p>
                  </div>
                ) : (
                  /* Chat API style formats (Telegram, Slack, Discord, Whatsapp, Webhook) */
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-xl space-y-2">
                    <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 border-b border-slate-850 pb-1">
                      <span>{selectedChannelId.toUpperCase()} PAYLOAD DECK</span>
                      <span>JSON PROTOCOL</span>
                    </div>
                    {selectedChannelId === "webhook" ? (
                      <pre className="text-[8px] font-mono text-emerald-450 leading-normal overflow-x-auto select-all max-h-[110px]">
{`{
  "event": "${selectedTemplateId}",
  "channel": "webhook",
  "priority": "${selectedPriority === "auto" ? activeTemplate.defaultPriority : selectedPriority}",
  "recipient": "${userName}",
  "payload": {
    "body": "${renderedOutput.body.substring(0, 45)}..."
  }
}`}
                      </pre>
                    ) : (
                      <div className="space-y-1.5 text-[10px]">
                        <div className="font-bold text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block"></span>
                          {selectedChannelId === "slack" ? "#flysmart-deals" : selectedChannelId === "telegram" ? "FlySmartBot" : "Channel Feed"}
                        </div>
                        <p className="text-slate-400 leading-normal font-semibold italic">{renderedOutput.body}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* iPhone style home indicator bar */}
              <div className="w-20 h-1 bg-slate-800 rounded-full mx-auto mt-1 select-none" />
            </div>
          </div>

          {/* Real-time Telemetry Event CLI logs */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-450 animate-pulse" />
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                  Upstream Telemetry Logs
                </h3>
              </div>
              <span className="text-[8px] font-mono text-slate-500">REAL-TIME</span>
            </div>

            {/* Terminal Screen */}
            <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 h-[180px] overflow-y-auto font-mono text-[9px] scrollbar-thin text-slate-400 space-y-2">
              {telemetryLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed border-b border-white/5 pb-1 text-slate-350">
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Digest Notifications Section */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-5">
        <div className="border-b border-slate-850 pb-4">
          <h3 className="text-sm font-bold text-slate-250 uppercase font-mono tracking-wide flex items-center gap-1.5">
            <Clock className="w-4.5 h-4.5 text-indigo-400" />
            Asynchronous Notification Digest Consolidation (Low Priority)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Weekly summaries optimize messaging costs and prevent notification fatigue by coalescing low-urgency transactional updates into a unified dispatch block.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4 text-xs font-semibold leading-relaxed">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-3 gap-2">
                <span className="font-mono text-slate-350 uppercase text-xs">Accumulator Pipeline Specs</span>
                <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950/45 px-2 py-0.5 rounded border border-indigo-900/30 font-bold">Cron Active</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Trigger Interval</span>
                  <p className="text-slate-300 font-bold">{DIGEST_CHANNELS[0].frequency}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Coalescing Rules</span>
                  <p className="text-slate-400 text-[11px] leading-normal font-semibold font-mono">{DIGEST_CHANNELS[0].accumulationRules}</p>
                </div>
              </div>

              {/* Dynamic visualization flow of the digest consolidation */}
              <div className="pt-4 border-t border-slate-900 space-y-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Dynamic Accumulation Timeline (Sarah Jenkins)</span>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                  <div className="text-center bg-slate-950 p-2.5 rounded-lg border border-slate-850 w-full sm:w-auto shrink-0 min-w-[120px]">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block">Suppressed Alerts</span>
                    <span className="text-base font-black text-slate-200 font-mono">18 Pings</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 rotate-90 sm:rotate-0 hidden sm:block" />
                  <div className="text-slate-400 text-[11px] leading-relaxed font-semibold">
                    18 separate micro-price fluctuations between NYC, CDG, and NRT were intercepted by the scheduler during the week, bypassing immediate high-cost SMS/WhatsApp relays.
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 rotate-90 sm:rotate-0 hidden sm:block" />
                  <button 
                    onClick={() => {
                      logTelemetry("[DIGEST CRON] Executed manual consolidation pipeline sweep.");
                      logTelemetry("[DIGEST] Compiled 18 suppressed logs into Sunday Smart Travel digest mail.");
                      alert("Manual sweep triggered! 18 suppressed alerts consolidated into Sarah's Sunday digest mail.");
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 font-bold rounded-xl cursor-pointer shrink-0 text-center transition-colors font-mono uppercase"
                  >
                    Force Sweep Cron
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase block border-b border-slate-900 pb-2">Digest Layout Mock</span>
            
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 space-y-3 font-semibold text-xs leading-relaxed">
              <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200">Weekly Price Digest</span>
                <span className="text-[9px] font-mono text-slate-500">June 20 - June 27</span>
              </div>
              
              <div className="space-y-2 text-[11px] leading-relaxed">
                <p className="text-slate-400">Hi Sarah Jenkins, here are your top travel opportunities from this week:</p>
                <div className="space-y-1.5 font-mono">
                  <div className="flex justify-between text-[11px] bg-slate-950 p-2 rounded border border-white/5">
                    <span className="text-slate-300">✈️ NYC ➜ CDG</span>
                    <span className="text-emerald-400 font-bold">-$145 ($420)</span>
                  </div>
                  <div className="flex justify-between text-[11px] bg-slate-950 p-2 rounded border border-white/5">
                    <span className="text-slate-300">✈️ SFO ➜ NRT</span>
                    <span className="text-emerald-400 font-bold">-$280 ($680)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Production Engineering Specs Panel */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-slate-250 uppercase font-mono tracking-wide flex items-center gap-1.5">
            <FileText className="w-4.5 h-4.5 text-emerald-450" />
            Anycast BGP DNS & Notification Platform Engineering Blueprint
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            System architectural guidelines and protocol implementations for scaling global multi-channel message deliverability to millions of active clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed font-semibold">
          
          <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-450" />
              1. Scheduler & Token Bucket Throttling
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              The rate limiter sits directly behind our edge API gateway, utilizing high-performance Redis Key-Value hashes to manage user token buckets. Limits are calculated globally and partitioned by carrier limits (e.g. strict Twilio or WhatsApp SLA thresholds) to prevent provider blocks.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>Token leaks mapped via Redis Enterprise sliding windows.</li>
              <li>Burst support allowed up to 10 seconds of max pool.</li>
              <li>SLA-violating triggers automatically buffered back to disk.</li>
            </ul>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-450" />
              2. Open, Click, and Unsubscribe Telemetry
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              Every dispatched Email contains a transparent 1x1 base64 tracker GIF mapped to our redirection proxies. Links are dynamically modified during build time (e.g. <code>tracking-redirect-proxy/click?id=XYZ</code>) to capture real-time Click events before forwarding to final portals.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>RFC-8058 standard One-Click Unsubscribe headers appended.</li>
              <li>Opt-out status synced instantly across MongoDB & Redis cached vectors.</li>
              <li>Telemetry callbacks posted to Apache Kafka events stream.</li>
            </ul>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              3. Retry Backoffs & Dead-Letter Queues (DLQ)
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              If a delivery channel returns HTTP 429 or 5xx, the message broker implements exponential backoff retry cycles with randomized jitter coefficients. Messages that continue to fail after 3 consecutive loops are diverted to our persistent DLQ for engineering inspection.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>Exponential backoff interval: <code>T = Base * 2^retries + Jitter</code>.</li>
              <li>Alert thresholds instantly notify on-call slack lines.</li>
              <li>BGP fallback proxies utilized for secondary gateways.</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}
