import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  BILLING_TIERS, 
  METRIC_QUOTAS, 
  STRIPE_WEBHOOKS, 
  DUNNING_STEPS, 
  CANCELLATION_STEPS,
  BillingTier,
  BillingWebhookEvent,
  MetricQuota
} from "../data/billingDocs";
import { 
  CreditCard, 
  Layers, 
  Activity, 
  RefreshCw, 
  Plus, 
  Minus, 
  Check, 
  HelpCircle, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Terminal, 
  Sliders, 
  Play, 
  Lock, 
  Sparkles, 
  BadgePercent, 
  Coins, 
  Percent, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  Building, 
  UserPlus, 
  Settings, 
  Ban, 
  ArrowRight,
  Receipt,
  RotateCcw
} from "lucide-react";

interface BillingEventLog {
  timestamp: string;
  type: "stripe_webhook" | "quota_alert" | "db_update" | "dunning_attempt" | "coupon_applied" | "seat_provisioned" | "system";
  message: string;
  data?: any;
}

export default function SubscriptionExplorer() {
  const [activeSubTab, setActiveSubTab] = useState<"pricing-seats" | "metering-billing" | "webhooks" | "dunning-cancel" | "specs">("pricing-seats");
  
  // Interactive Billing Cycle
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("pro");
  const [seatCount, setSeatCount] = useState<number>(3); // Initializing seats for selected Pro plan (includes 3, max seats depend on tiers)

  // API Metering Simulator state
  const [simulatedUsage, setSimulatedUsage] = useState<number>(102450); // Current query usage count
  const [taxRate, setTaxRate] = useState<number>(8.5); // Default regional tax %
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  
  // Webhook Simulator state
  const [selectedWebhookEvent, setSelectedWebhookEvent] = useState<string>("checkout.session.completed");
  const [webhookLogs, setWebhookLogs] = useState<BillingEventLog[]>([
    { timestamp: "22:45:10", type: "system", message: "Billing service initialized. Active connection established to Stripe Live Gateway." },
    { timestamp: "22:45:12", type: "system", message: "Stripe webhook endpoint signature verification key loaded: whsec_v9a3b821..." }
  ]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Dunning Recovery Sandbox state
  const [dunningActive, setDunningActive] = useState<boolean>(false);
  const [currentDunningStep, setCurrentDunningStep] = useState<number>(0);
  const [recoveryLog, setRecoveryLog] = useState<string[]>([]);
  const recoveryLogEndRef = useRef<HTMLDivElement>(null);

  // Computed Billing Tier details
  const currentPlan = useMemo(() => {
    return BILLING_TIERS.find(t => t.id === selectedPlanId) || BILLING_TIERS[1];
  }, [selectedPlanId]);

  // Adjust seat count based on plan limits
  useEffect(() => {
    if (seatCount < currentPlan.includedSeats) {
      setSeatCount(currentPlan.includedSeats);
    }
  }, [selectedPlanId]);

  // Calculate prices based on seats and cycles
  const pricingCalculation = useMemo(() => {
    const basePrice = billingCycle === "monthly" ? currentPlan.priceMonthly : currentPlan.priceAnnually;
    const extraSeats = Math.max(0, seatCount - currentPlan.includedSeats);
    const seatPrice = currentPlan.seatPriceMonthly;
    const extraSeatCost = extraSeats * seatPrice * (billingCycle === "annually" ? 12 : 1);
    
    const subtotal = (basePrice * (billingCycle === "annually" ? 12 : 1)) + extraSeatCost;
    
    // Apply discount if any
    const discountAmount = appliedDiscount ? (subtotal * (appliedDiscount.percent / 100)) : 0;
    const discountedSubtotal = subtotal - discountAmount;
    
    const calculatedTax = discountedSubtotal * (taxRate / 100);
    const grandTotal = discountedSubtotal + calculatedTax;

    return {
      basePrice,
      extraSeats,
      extraSeatCost,
      subtotal,
      discountAmount,
      discountedSubtotal,
      calculatedTax,
      grandTotal
    };
  }, [currentPlan, billingCycle, seatCount, appliedDiscount, taxRate]);

  // Add Log helper
  const addBillingLog = (message: string, type: BillingEventLog["type"], data?: any) => {
    const now = new Date();
    const ts = now.toISOString().split("T")[1].substring(0, 12);
    setWebhookLogs(prev => [...prev, { timestamp: ts, type, message, data }]);
  };

  // Trigger Coupon Application
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    
    if (cleanCode === "SPRING50") {
      setAppliedDiscount({ code: "SPRING50", percent: 50 });
      addBillingLog("[Promo Engine] Valid coupon: SPRING50 successfully applied. 50% discount mapped to current draft invoice.", "coupon_applied");
    } else if (cleanCode === "ALLIANCE_GDS") {
      setAppliedDiscount({ code: "ALLIANCE_GDS", percent: 20 });
      addBillingLog("[Promo Engine] Enterprise Partner coupon: ALLIANCE_GDS applied. 20% discount mapped.", "coupon_applied");
    } else {
      alert("Invalid Coupon Code. Try 'SPRING50' or 'ALLIANCE_GDS' to test calculations.");
    }
    setCouponCode("");
  };

  // Simulate API usage query metering
  const handleSimulateApiQueries = (count: number) => {
    const prev = simulatedUsage;
    const next = prev + count;
    setSimulatedUsage(next);

    // Dynamic alerts based on quotas
    let maxQuota = 150000;
    if (selectedPlanId === "free") maxQuota = 5000;
    if (selectedPlanId === "business") maxQuota = 1500000;
    if (selectedPlanId === "enterprise") maxQuota = 99999999;

    addBillingLog(`[Usage Meter] Metered flight search event received. Added +${count.toLocaleString()} search entries to organization billing state.`, "quota_alert");

    if (next >= maxQuota) {
      addBillingLog(`[Quota Alert] Warning: Organization has exceeded its search query quota limits (${maxQuota.toLocaleString()}). Applying soft limit throttling.`, "quota_alert");
    } else if (next >= maxQuota * 0.8) {
      addBillingLog(`[Quota Alert] Attention: Organization has consumed 80%+ of monthly search query allocations.`, "quota_alert");
    }
  };

  // Dispatch mock Stripe webhook
  const handleDispatchWebhook = async () => {
    const selectedEvent = STRIPE_WEBHOOKS.find(ev => ev.eventType === selectedWebhookEvent) || STRIPE_WEBHOOKS[0];
    
    addBillingLog(`[Webhook Ingress] Received POST /v1/billing/webhooks from Stripe Gateway...`, "stripe_webhook");
    
    // Verify signature simulation
    await new Promise(r => setTimeout(r, 450));
    addBillingLog(`[Security Verify] Validated Stripe webhook cryptographic header signature (stripe-signature: t=178...,v1=sig_hash). Verification success.`, "stripe_webhook");
    
    await new Promise(r => setTimeout(r, 400));
    addBillingLog(`[JSON Parse] Successfully unpacked webhook payload body for transaction ID: ${selectedEvent.eventType}`, "stripe_webhook", JSON.parse(selectedEvent.payloadTemplate));

    // Update database & lifecycle states
    await new Promise(r => setTimeout(r, 500));
    let lifecycleTrigger = selectedEvent.triggersLifecycleState;
    
    if (selectedEvent.eventType === "invoice.payment_failed") {
      addBillingLog(`[DB Service] Mapped billing past-due transaction flags to Org database. Initiating active billing grace period...`, "db_update");
    } else if (selectedEvent.eventType === "customer.subscription.deleted") {
      addBillingLog(`[DB Service] Downgraded organization status to Developer Free. API search priority keys suspended immediately.`, "db_update");
    } else {
      addBillingLog(`[DB Service] Renewed API Search quotas successfully. Updated next billing epoch timer. DB Transaction committed.`, "db_update");
    }

    addBillingLog(`[Gateway Engine] Completed webhook execution cycle. Standard HTTP 200 OK returned to Stripe sender IP.`, "stripe_webhook");
  };

  // Run automatic dunning recovery simulation loop
  const handleRunDunningSimulation = async () => {
    if (dunningActive) return;
    setDunningActive(true);
    setCurrentDunningStep(0);
    setRecoveryLog([]);

    const logMsg = (msg: string) => {
      setRecoveryLog(prev => [...prev, `[Dunning Core] ${msg}`]);
    };

    logMsg("Initializing payment failure recovery schedule...");
    
    for (let i = 0; i < DUNNING_STEPS.length; i++) {
      setCurrentDunningStep(i);
      const step = DUNNING_STEPS[i];
      await new Promise(r => setTimeout(r, 1200));
      logMsg(`Transitioning to ${step.day} - Action: ${step.action}`);
      logMsg(`Outcome State: ${step.status}. Mechanism: ${step.mechanism}`);
      
      // If user clicks or fails card, let's keep running the loop
      if (i === 1) {
        logMsg("Checking card auto-updater tokens... No updated card tokens detected from Visa Account Updater (VAU) network.");
      }
      if (i === 3) {
        logMsg("SLA Throttling triggered. Outbound NDC queries throttled to standard developer baseline rate.");
      }
    }
    
    logMsg("Recovery pipeline completed. Subscription terminated and marked as canceled in DB.");
    setDunningActive(false);
  };

  // Auto scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [webhookLogs]);

  useEffect(() => {
    if (recoveryLogEndRef.current) {
      recoveryLogEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [recoveryLog]);

  return (
    <div className="space-y-6 animate-fadeIn" id="billing-sub-root">
      
      {/* Title & upper information banner */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] bg-sky-950 text-sky-450 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase max-w-max">
            Enterprise Billing Engine
          </div>
          <h2 className="text-lg font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-sky-400" />
            SaaS Subscription & Metering Platform
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Engineered with multi-tier organization accounts, Seat licensing calculations, metered usage tracking, robust Stripe webhooks integrations, automatic dunning, and cancellation grace periods.
          </p>
        </div>

        {/* Tab navigation buttons */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab("pricing-seats")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "pricing-seats"
                ? "bg-sky-950 border border-sky-850 text-sky-400 shadow-md shadow-sky-950/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Plans & Seats
          </button>
          <button
            onClick={() => setActiveSubTab("metering-billing")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "metering-billing"
                ? "bg-sky-950 border border-sky-850 text-sky-400 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Metering & Taxes
          </button>
          <button
            onClick={() => setActiveSubTab("webhooks")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "webhooks"
                ? "bg-sky-950 border border-sky-850 text-sky-400 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Stripe Webhooks
          </button>
          <button
            onClick={() => setActiveSubTab("dunning-cancel")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "dunning-cancel"
                ? "bg-sky-950 border border-sky-850 text-sky-400 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Dunning & Off-ramp
          </button>
          <button
            onClick={() => setActiveSubTab("specs")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "specs"
                ? "bg-sky-950 border border-sky-850 text-sky-400 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Architecture Specs
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE SUBTAB CONTENT */}

      {activeSubTab === "pricing-seats" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Billing cycle selection slider */}
          <div className="flex justify-center items-center gap-3 bg-slate-950/40 p-3 border border-slate-900 rounded-xl max-w-max mx-auto">
            <span className={`text-xs font-bold transition-all ${billingCycle === "monthly" ? "text-sky-400" : "text-slate-500"}`}>
              Monthly Invoicing
            </span>
            <button
              onClick={() => setBillingCycle(prev => prev === "monthly" ? "annually" : "monthly")}
              className="w-12 h-6 bg-slate-900 border border-slate-800 rounded-full relative p-0.5 transition-colors focus:outline-none"
            >
              <span className={`block w-4.5 h-4.5 rounded-full bg-sky-400 shadow-md transition-transform ${
                billingCycle === "annually" ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
            <span className={`text-xs font-bold transition-all flex items-center gap-1.5 ${billingCycle === "annually" ? "text-sky-400" : "text-slate-500"}`}>
              Annually Billing
              <span className="text-[9px] bg-emerald-950 text-emerald-450 border border-emerald-900/30 px-1.5 py-0.2 rounded font-black font-mono">
                SAVE 20%
              </span>
            </span>
          </div>

          {/* Pricing Tiers Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {BILLING_TIERS.map((tier) => {
              const isSelected = tier.id === selectedPlanId;
              const price = billingCycle === "monthly" ? tier.priceMonthly : tier.priceAnnually;
              
              return (
                <div 
                  key={tier.id}
                  className={`bg-slate-900/30 border rounded-2xl p-5 flex flex-col justify-between transition-all space-y-5 relative ${
                    isSelected 
                      ? "border-sky-500/40 bg-sky-950/5 shadow-xl shadow-sky-950/10" 
                      : "border-slate-850 hover:bg-slate-900/10"
                  }`}
                >
                  {tier.id === "business" && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black bg-sky-500 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-200">{tier.name}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{tier.description}</p>
                    
                    <div className="pt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-100 font-mono">
                        ${price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold font-mono">
                        / month
                      </span>
                    </div>

                    <div className="text-[9px] text-sky-400 font-mono uppercase bg-sky-950/30 border border-sky-900/20 px-2 py-0.5 rounded max-w-max">
                      API Quota: {tier.apiQuota}
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-3.5 border-t border-slate-900/60 flex-1 flex flex-col justify-between">
                    <ul className="space-y-2 text-[11px] text-slate-400 font-medium">
                      {tier.includedFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-sky-450 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        setSelectedPlanId(tier.id);
                        setSeatCount(tier.includedSeats);
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                        isSelected
                          ? "bg-sky-950 border border-sky-850 text-sky-400"
                          : "bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400"
                      }`}
                    >
                      {isSelected ? "Active Core Tier Selection" : "Select Subscription"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Seat Licensing & Org Accounts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Seat adjustments */}
            <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-100 tracking-tight flex items-center gap-1.5">
                    <Users className="w-4.5 h-4.5 text-sky-400" />
                    Seat Licensing & Organization Provisioning
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Adjust corporate seat variables. Factoring in included seats for plan vs extra seat surcharges.</p>
                </div>
                <span className="text-[10px] font-mono bg-sky-950 border border-sky-900 px-2.5 py-0.5 rounded text-sky-450">
                  Tier: {currentPlan.name}
                </span>
              </div>

              {/* Slider / Controls */}
              <div className="bg-slate-950 border border-slate-900 p-5 rounded-xl space-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">Total Organization Seat Count</span>
                    <span className="text-[10px] text-slate-500 font-medium">Includes {currentPlan.includedSeats} base seats. Extra seats billed at ${currentPlan.seatPriceMonthly}/mo.</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSeatCount(prev => Math.max(currentPlan.includedSeats, prev - 1))}
                      className="p-1.5 bg-slate-900 border border-slate-850 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer disabled:opacity-30"
                      disabled={seatCount <= currentPlan.includedSeats}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-base font-black font-mono text-slate-200 w-8 text-center">{seatCount}</span>
                    <button
                      onClick={() => setSeatCount(prev => prev + 1)}
                      className="p-1.5 bg-slate-900 border border-slate-850 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min={currentPlan.includedSeats}
                  max="100"
                  step="1"
                  value={seatCount}
                  onChange={(e) => setSeatCount(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />

                <div className="grid grid-cols-3 gap-4 text-xs font-semibold pt-2 border-t border-slate-900/50">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Base Allocation</span>
                    <p className="text-slate-300">{currentPlan.includedSeats} Seats Included</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Extra Seat Unit Price</span>
                    <p className="text-slate-300">${currentPlan.seatPriceMonthly}/month</p>
                  </div>
                  <div className="space-y-1 font-mono text-sky-400">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Total Additional Cost</span>
                    <p className="font-bold">+${pricingCalculation.extraSeatCost.toLocaleString()}/cycle</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Feature Flags map for active plan */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Active Subscription Feature Flags</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">FEATURE_FAILOVER_CIRCUIT_BREAKER</span>
                    {selectedPlanId !== "free" ? (
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-900/30 px-1.5 py-0.2 rounded uppercase font-bold">Unlocked</span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-950 border border-slate-850 px-1.5 py-0.2 rounded uppercase font-bold">Locked</span>
                    )}
                  </div>

                  <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">FEATURE_ANCILLARIES_SEAT_MAP</span>
                    {["business", "enterprise"].includes(selectedPlanId) ? (
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-900/30 px-1.5 py-0.2 rounded uppercase font-bold">Unlocked</span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-950 border border-slate-850 px-1.5 py-0.2 rounded uppercase font-bold">Locked</span>
                    )}
                  </div>

                  <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">FEATURE_MTLS_ENDPOINTS</span>
                    {["business", "enterprise"].includes(selectedPlanId) ? (
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-900/30 px-1.5 py-0.2 rounded uppercase font-bold">Unlocked</span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-950 border border-slate-850 px-1.5 py-0.2 rounded uppercase font-bold">Locked</span>
                    )}
                  </div>

                  <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">FEATURE_SCIM_PROVISIONING</span>
                    {selectedPlanId === "enterprise" ? (
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-900/30 px-1.5 py-0.2 rounded uppercase font-bold">Unlocked</span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-950 border border-slate-850 px-1.5 py-0.2 rounded uppercase font-bold">Locked</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Mock Draft Invoice */}
            <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-sky-400" />
                  Stripe Pro Forma Draft Invoice
                </h4>
              </div>

              {/* Invoice lines */}
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-[11px] text-slate-400 space-y-4">
                
                <div className="flex justify-between text-slate-500 border-b border-slate-900 pb-2">
                  <span>METADATA CLAUSE</span>
                  <span>STRIPE_PROD_DRAFT</span>
                </div>

                <div className="space-y-2 border-b border-slate-900/60 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-200">{currentPlan.name}</div>
                      <div className="text-[9px] text-slate-500">Subscription Base Charge ({billingCycle})</div>
                    </div>
                    <span className="font-bold text-slate-250">${(pricingCalculation.basePrice * (billingCycle === "annually" ? 12 : 1)).toLocaleString()}.00</span>
                  </div>

                  {pricingCalculation.extraSeats > 0 && (
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-300">Additional Surcharge Seats</div>
                        <div className="text-[9px] text-slate-500">+{pricingCalculation.extraSeats} extra seats at ${currentPlan.seatPriceMonthly}/mo</div>
                      </div>
                      <span className="font-bold text-slate-250">+${pricingCalculation.extraSeatCost.toLocaleString()}.00</span>
                    </div>
                  )}
                </div>

                {/* Subtotal & tax */}
                <div className="space-y-1.5 border-b border-slate-900/60 pb-3">
                  <div className="flex justify-between font-semibold">
                    <span>Subtotal</span>
                    <span>${pricingCalculation.subtotal.toLocaleString()}.00</span>
                  </div>

                  {appliedDiscount && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Promo Coupon Applied ({appliedDiscount.code} -{appliedDiscount.percent}%)</span>
                      <span>-${pricingCalculation.discountAmount.toLocaleString()}.00</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Regional SUT / VAT ({taxRate}%)</span>
                    <span>+${pricingCalculation.calculatedTax.toFixed(2)}</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-baseline text-xs font-black text-slate-100 font-mono">
                  <span>GRAND TOTAL (USD)</span>
                  <span className="text-sky-400 text-sm">${pricingCalculation.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon input form */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5 pt-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase block">Apply Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. SPRING50 (Save 50%)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-850 p-2 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-950 hover:bg-sky-900 border border-sky-850 text-sky-400 text-xs font-black rounded-lg cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 italic">Try applying <b>SPRING50</b> or <b>ALLIANCE_GDS</b> for corporate testing.</p>
              </form>

            </div>

          </div>

        </div>
      )}

      {activeSubTab === "metering-billing" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Quota Limits Directory & Simulators */}
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">API Metering & Usage Sandbox</h3>
              <p className="text-[11px] text-slate-500 mt-1">Simulate concurrent search API requests to observe the live metering engine and SLA threshold alerts.</p>
            </div>

            {/* Current plan limits */}
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-3.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Subscription Quotas</span>
                
                {METRIC_QUOTAS.map((mq, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-300">{mq.name}</span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{mq.unit}</span>
                    </div>
                    <div className="font-mono text-[10px] text-sky-400 font-semibold">
                      Pro Allocation Limit: <span className="text-slate-200">{mq.limitPro.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Usage Progress bar */}
              {(() => {
                let maxQuota = 150000;
                if (selectedPlanId === "free") maxQuota = 5000;
                if (selectedPlanId === "business") maxQuota = 1500000;
                if (selectedPlanId === "enterprise") maxQuota = 99999999;
                
                const ratio = Math.min(100, (simulatedUsage / maxQuota) * 100);
                
                return (
                  <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-baseline text-xs font-semibold">
                      <span className="text-slate-300">Live Metered Usage Indicator</span>
                      <span className="font-mono text-sky-400">{simulatedUsage.toLocaleString()} / {maxQuota.toLocaleString()}</span>
                    </div>
                    
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          ratio > 90 ? "bg-rose-500" : ratio > 75 ? "bg-amber-500" : "bg-sky-400"
                        }`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      If usage exceeds allotments, automatic overages (e.g., $1.50 per 1,000 additional queries) are queued for the active billing cycle.
                    </p>
                  </div>
                );
              })()}

              {/* Inject API queries */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Inject Outbound Query Packets</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSimulateApiQueries(1000)}
                    className="py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    +1,000 queries
                  </button>
                  <button
                    onClick={() => handleSimulateApiQueries(15000)}
                    className="py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    +15,000 queries
                  </button>
                  <button
                    onClick={() => handleSimulateApiQueries(50000)}
                    className="py-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-350 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    +50,000 queries
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Real-time Usage Meter Telemetry logs */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
                SaaS Usage Metering & Quota Telemetry
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Real-time traces capturing API payload volumes, database transactions, and dynamic overage billing triggers.</p>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 h-[350px] overflow-y-auto flex flex-col justify-between scrollbar-thin">
              <div className="space-y-3 font-mono text-[10px]">
                {webhookLogs.length === 0 ? (
                  <div className="h-[290px] flex flex-col items-center justify-center text-slate-650 space-y-2">
                    <Terminal className="w-8 h-8 text-slate-700 animate-pulse" />
                    <p>Log Console standby.</p>
                  </div>
                ) : (
                  webhookLogs.map((log, idx) => {
                    let color = "text-slate-400";
                    if (log.type === "stripe_webhook") color = "text-indigo-400 font-semibold";
                    if (log.type === "quota_alert") color = "text-amber-500 font-bold";
                    if (log.type === "coupon_applied") color = "text-emerald-400 font-bold";
                    if (log.type === "db_update") color = "text-sky-450 font-semibold";

                    return (
                      <div key={idx} className="space-y-1.5 border-b border-slate-900/40 pb-2">
                        <div className="flex items-start gap-2 leading-relaxed">
                          <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                          <span className={`${color} shrink-0`}>[{log.type.toUpperCase()}]</span>
                          <span className="text-slate-300">{log.message}</span>
                        </div>
                        {log.data && (
                          <div className="ml-6 bg-slate-900/40 border border-slate-850 p-2.5 rounded-lg text-emerald-450 max-w-full overflow-x-auto text-[9px]">
                            <pre>{JSON.stringify(log.data, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={logEndRef} />
              </div>
            </div>

          </div>

        </div>
      )}

      {activeSubTab === "webhooks" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Select Webhook Event Type */}
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">Stripe Webhook Gateway Ingress</h3>
              <p className="text-[11px] text-slate-500 mt-1">Select an asynchronous Stripe event payload and dispatch it to test state-machine parsing.</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Select Webhook Event (Type)</label>
                <select
                  value={selectedWebhookEvent}
                  onChange={(e) => setSelectedWebhookEvent(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-200"
                >
                  {STRIPE_WEBHOOKS.map(sw => (
                    <option key={sw.eventType} value={sw.eventType}>{sw.eventType}</option>
                  ))}
                </select>
              </div>

              {/* Event Description */}
              {(() => {
                const ev = STRIPE_WEBHOOKS.find(sw => sw.eventType === selectedWebhookEvent) || STRIPE_WEBHOOKS[0];
                return (
                  <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-2">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold tracking-wider">Internal Pipeline Action Mapping</span>
                    <p className="text-[11px] text-slate-350 leading-relaxed font-semibold">
                      {ev.description}
                    </p>
                    <div className="text-[10px] text-sky-400 font-mono">
                      State Transition on Success: <span className="font-bold">{ev.triggersLifecycleState}</span>
                    </div>
                  </div>
                );
              })()}

              <button
                onClick={handleDispatchWebhook}
                className="w-full py-2.5 bg-sky-950 hover:bg-sky-900 border border-sky-850 text-sky-400 text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                Dispatch Cryptographic Webhook
              </button>
            </div>

          </div>

          {/* Raw Webhook JSON Template */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-sm font-black text-slate-100 tracking-tight">Active Stripe Webhook Payload Body</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Signed payload sent dynamically to verify server parsing logic</p>
              </div>
              <span className="text-[9px] font-mono text-slate-500">HTTPS POST Payload</span>
            </div>

            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 overflow-x-auto font-mono text-[9px] text-slate-400 h-[280px] scrollbar-thin">
              <pre className="leading-relaxed">
                {(() => {
                  const ev = STRIPE_WEBHOOKS.find(sw => sw.eventType === selectedWebhookEvent) || STRIPE_WEBHOOKS[0];
                  return ev.payloadTemplate;
                })()}
              </pre>
            </div>
          </div>

        </div>
      )}

      {activeSubTab === "dunning-cancel" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Timeline and Trigger dunning */}
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">Failed Payment Dunning Recovery</h3>
              <p className="text-[11px] text-slate-500 mt-1">Test the automatic payment recovery timeline triggered when credit card authorizations fail.</p>
            </div>

            <button
              onClick={handleRunDunningSimulation}
              disabled={dunningActive}
              className="w-full py-2.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-400 text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dunningActive ? 'animate-spin' : ''}`} />
              Run 21-Day Dunning Simulator
            </button>

            {/* Timelines list */}
            <div className="space-y-3.5">
              {DUNNING_STEPS.map((step, idx) => {
                const isCurrent = idx === currentDunningStep && dunningActive;
                return (
                  <div 
                    key={idx}
                    className={`p-3.5 border rounded-xl space-y-1.5 transition-all ${
                      isCurrent 
                        ? "bg-rose-950/20 border-rose-500/40 animate-pulse text-rose-350 shadow-lg" 
                        : "bg-slate-950 border-slate-900 text-slate-400"
                    }`}
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-slate-200">{step.day} - {step.action}</span>
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 border rounded uppercase ${
                        step.status === "Active (Grace Period)" 
                          ? "bg-emerald-950 text-emerald-400 border-emerald-900/20" 
                          : step.status === "Terminated / Revoked"
                          ? "bg-slate-900 text-slate-500 border-slate-800"
                          : "bg-rose-950 text-rose-450 border-rose-900/20"
                      }`}>{step.status}</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-400 font-semibold">
                      {step.mechanism}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Retention Cancellation Flow & Dunning live logs */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
            
            {/* Live simulator console logs */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-250 uppercase tracking-wide">Dunning Recovery Sandbox Engine Terminal</span>
              
              <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 h-[160px] overflow-y-auto font-mono text-[9px] text-slate-400 scrollbar-thin">
                {recoveryLog.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-650">
                    Terminal idle. Click 'Run 21-Day Dunning Simulator' to launch traces.
                  </div>
                ) : (
                  recoveryLog.map((log, idx) => (
                    <div key={idx} className="border-b border-slate-900/60 pb-1 flex items-start gap-1 leading-relaxed">
                      <span className="text-rose-400 shrink-0">&gt;&gt;</span>
                      <span className="text-slate-350">{log}</span>
                    </div>
                  ))
                )}
                <div ref={recoveryLogEndRef} />
              </div>
            </div>

            {/* Churn Retention Off-ramp specs */}
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">Churn Cancellation Off-Ramp Flow</h3>
                <p className="text-[11px] text-slate-500 mt-1">To protect customer trust and lifetime value (LTV), cancellation workflows are standardized as constructive retention opportunities.</p>
              </div>

              <div className="space-y-3">
                {CANCELLATION_STEPS.map((step, idx) => (
                  <div key={idx} className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex items-start gap-3.5 text-xs font-semibold leading-relaxed">
                    <span className="bg-sky-950 text-sky-400 border border-sky-850 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold font-mono text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-slate-200 font-bold font-mono text-[11px] uppercase tracking-wide">{step.title}</h4>
                      <p className="text-slate-400 mt-1 leading-normal font-semibold">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {activeSubTab === "specs" && (
        <div className="space-y-6">
          
          {/* Production specifications for subscription, webhook verify and marketplace details */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-sky-400" />
                SaaS Subscription Infrastructure Production Specs
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Technical parameters governing multi-tenant corporate accounts, cryptographic webhook signatures, and marketplace APIs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Webhook security specs */}
              <div className="bg-slate-950/60 border border-slate-900 p-5 rounded-xl space-y-3.5">
                <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wide flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-sky-450" />
                  Webhook Signature Cryptography
                </h4>
                
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                  Every webhook request is verified dynamically before committing to databases to prevent mock client intrusion or spoofed events.
                </p>

                <div className="bg-slate-900/40 border border-slate-850 p-3 rounded-lg font-mono text-[10px] text-slate-400 leading-normal space-y-1.5">
                  <div>1. Extract <code>Stripe-Signature</code> headers.</div>
                  <div>2. Split header to extract timestamp (<code>t</code>) and signature (<code>v1</code>).</div>
                  <div>3. Compute standard HMAC-SHA256 signature using raw payload body + webhook secret (<code>whsec_...</code>).</div>
                  <div>4. Enforce strict timing comparison checks (maximum 5-minute tolerance) to defend against replay attacks.</div>
                </div>
              </div>

              {/* Seat licensing & Corporate Billing specs */}
              <div className="bg-slate-950/60 border border-slate-900 p-5 rounded-xl space-y-3.5">
                <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wide flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-sky-450" />
                  Corporate Organization Billing Matrix
                </h4>

                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                  Enterprise organization models support centralized corporate payment mechanisms mapped dynamically to downstream business divisions.
                </p>

                <ul className="text-[10px] text-slate-400 space-y-2 list-disc pl-4 leading-relaxed font-semibold">
                  <li><b>Centralized Invoicing:</b> Master accounts settle monthly consolidated usages across child agency tenants automatically.</li>
                  <li><b>Seat Synchronization:</b> Integrates with SCIM 2.0 to dynamically provision or deprovision seat licenses based on Active Directory memberships.</li>
                  <li><b>Custom Contracts override:</b> Negotiated GDS baseline SLA agreements mapped directly to customized enterprise metadata clauses in Stripe objects.</li>
                </ul>
              </div>

              {/* Future marketplace integration */}
              <div className="bg-slate-950/60 border border-slate-900 p-5 rounded-xl space-y-3.5">
                <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wide flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-450 animate-pulse" />
                  Future Marketplace Billing Framework
                </h4>

                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                  To expand into a transactional travel marketplace, the billing service exposes standard multi-party APIs to manage regional travel vendor settlements.
                </p>

                <ul className="text-[10px] text-slate-400 space-y-2 list-disc pl-4 leading-relaxed font-semibold">
                  <li><b>Stripe Connect Integration:</b> Leverages Express accounts to automate split payouts between Flight Intelligence platform and external operators (e.g., carbon offset vendors, local airport transport providers).</li>
                  <li><b>Fee Splitting Rule Engine:</b> Applies fixed or percent commissions per seat purchase or search volume referral before dispatcher settlement.</li>
                  <li><b>Dynamic Ledger Auditing:</b> Sub-second ledger writes trace each split payment transaction back to master contract accounts.</li>
                </ul>
              </div>

              {/* SLA & Refund Policies */}
              <div className="bg-slate-950/60 border border-slate-900 p-5 rounded-xl space-y-3.5">
                <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-450" />
                  SLA Service Level & Refund Safeguards
                </h4>

                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                  Rigorous automated checks govern SLA violations and dynamic refund processing inside the administrative console.
                </p>

                <ul className="text-[10px] text-slate-400 space-y-2 list-disc pl-4 leading-relaxed font-semibold">
                  <li><b>SLA Violations tracking:</b> Dynamic checks continuously evaluate carrier query timeouts. Drops below 99.9% auto-dispatches discount coupon codes.</li>
                  <li><b>Stripe Refund Pipelines:</b> Administrator impersonation panels verify Jira approval hashes before initiating instant Stripe refund transactions.</li>
                  <li><b>Audit traces:</b> Every manual invoice override or coupon injection dispatches WORM security traces.</li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
