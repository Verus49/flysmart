import React, { useState, useEffect, useMemo } from "react";
import { 
  FareAnomaly, 
  DetectionRule, 
  INITIAL_ANOMALIES, 
  DETECTION_RULES 
} from "../data/mistakeFareDocs";
import { 
  AlertOctagon, 
  TrendingDown, 
  Percent, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Settings, 
  RefreshCw, 
  Sliders, 
  Terminal, 
  ShieldAlert, 
  Users, 
  MapPin, 
  Globe2, 
  BadgeAlert, 
  DollarSign, 
  Inbox, 
  FileCheck, 
  Radio, 
  Bell, 
  BookOpen, 
  Flame,
  ArrowRight
} from "lucide-react";

export default function MistakeFareExplorer() {
  // Application state
  const [anomalies, setAnomalies] = useState<FareAnomaly[]>(JSON.parse(JSON.stringify(INITIAL_ANOMALIES)));
  const [rules, setRules] = useState<DetectionRule[]>(DETECTION_RULES);
  const [selectedAnomaly, setSelectedAnomaly] = useState<FareAnomaly | null>(INITIAL_ANOMALIES[0]);
  
  // Statistical threshold adjustments
  const [zScoreThreshold, setZScoreThreshold] = useState<number>(-4.5);
  const [mlSensitivity, setMlSensitivity] = useState<number>(85); // 0-100% confidence minimum
  const [currencyCrossCheck, setCurrencyCrossCheck] = useState<boolean>(true);
  const [fuelZeroFilter, setFuelZeroFilter] = useState<boolean>(true);
  
  // Real-time stream simulator
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(3000); // ms per feed item
  const [streamedCount, setStreamedCount] = useState<number>(24810);
  const [anomaliesFound, setAnomaliesFound] = useState<number>(142);
  const [falsePositivesSuppressed, setFalsePositivesSuppressed] = useState<number>(1182);

  // Live simulation log
  const [streamLogs, setStreamLogs] = useState<{ id: number; text: string; isAnomaly: boolean }[]>([
    { id: 1, text: "PARSED: GDS Sabre | DL-382 (JFK-LHR) Economy - $540 USD (Nominal, Z-score: -0.22)", isAnomaly: false },
    { id: 2, text: "PARSED: GDS Amadeus | JL-12 (HND-SFO) Business - $3200 USD (Nominal, Z-score: -0.45)", isAnomaly: false },
    { id: 3, text: "PARSED: GDS Sabre | SQ-21 (EWR-SIN) Business - $5500 USD (Nominal, Z-score: -0.11)", isAnomaly: false }
  ]);

  // Handle stream feed updates
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // Core simulation of GDS records stream
      setStreamedCount(prev => prev + 1);
      
      const routes = [
        { r: "MIA-MAD", c: "Iberia", cb: "Economy", b: 420, v: 90 },
        { r: "LAX-SYD", c: "Qantas", cb: "Business", b: 3400, v: 450 },
        { r: "SFO-NRT", c: "Japan Airlines", cb: "First", b: 12500, v: 1200 },
        { r: "JFK-DXB", c: "Emirates", cb: "First", b: 14500, v: 1600 },
        { r: "CDG-HKG", c: "Cathay Pacific", cb: "Premium Economy", b: 920, v: 140 },
        { r: "ORD-LHR", c: "British Airways", cb: "Business", b: 2800, v: 310 }
      ];

      const route = routes[Math.floor(Math.random() * routes.length)];
      
      // Deciding if we inject a rare anomaly randomly (10% chance)
      const injectAnomaly = Math.random() < 0.15;
      
      if (injectAnomaly) {
        const anomalyTypes: FareAnomaly["anomalyType"][] = [
          "currency_conversion_error",
          "missing_fuel_surcharge",
          "tax_miscalculation",
          "fat_finger_base_fare"
        ];
        const aType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
        
        let multiplier = 1;
        let pUSD = 150;
        let description = "";

        if (aType === "currency_conversion_error") {
          // Omitted FX multiplication: e.g. base fare was supposed to be 34,000 JPY ($310 USD) but posted as 34 JPY ($0.31 USD)
          pUSD = Math.round(route.b * 0.05);
          description = `Currency multiplier mismatch applied. Sold at face value in target currency.`;
        } else if (aType === "missing_fuel_surcharge") {
          pUSD = Math.round(route.b * 0.3);
          description = `Omission of core surcharge tax component from ticketing distribution.`;
        } else {
          pUSD = Math.round(Math.random() * 80 + 30);
          description = `Extreme mathematical drop relative to 12-week moving mean.`;
        }

        // Apply z-score filtering logic (simulating false-positive suppression rules)
        const computedZScore = (pUSD - route.b) / route.v;
        const confidence = Math.round(Math.min(99, Math.max(40, Math.abs(computedZScore) * 15)));

        // If the confidence is below sensitivity, we suppress it
        if (confidence < mlSensitivity) {
          setFalsePositivesSuppressed(prev => prev + 1);
          setStreamLogs(prev => [
            { id: Date.now(), text: `⚠️ [SUPPRESSED FALSE-POS] ${route.c} (${route.r}) ${route.cb} - $${pUSD} USD (Confidence ${confidence}% < threshold)`, isAnomaly: false },
            ...prev.slice(0, 5)
          ]);
        } else {
          setAnomaliesFound(prev => prev + 1);
          
          const newAnomaly: FareAnomaly = {
            id: `mfa-${Math.floor(Math.random() * 900 + 100)}`,
            route: route.r,
            carrier: route.c,
            cabinClass: route.cb as any,
            detectedPriceUSD: pUSD,
            historicalMedianUSD: route.b,
            anomalyType: aType,
            confidenceScore: confidence,
            status: "pending_review",
            metadata: {
              rawCurrencySymbol: aType === "currency_conversion_error" ? "JPY" : "USD",
              baseFareUSD: Math.round(pUSD * 0.7),
              fuelSurchargeUSD: aType === "missing_fuel_surcharge" ? 0 : Math.round(pUSD * 0.2),
              taxesUSD: Math.round(pUSD * 0.1),
              gdsSource: ["Amadeus", "Sabre", "Travelport"][Math.floor(Math.random() * 3)],
              seatsAvailable: Math.floor(Math.random() * 30 + 5)
            },
            detectedAt: "Just now"
          };

          setAnomalies(prev => [newAnomaly, ...prev]);
          setStreamLogs(prev => [
            { id: Date.now(), text: `🚨 [ALERT] DETECTED ${newAnomaly.anomalyType.toUpperCase()} on ${newAnomaly.carrier} ${newAnomaly.route} ${newAnomaly.cabinClass} ($${newAnomaly.detectedPriceUSD} vs $${newAnomaly.historicalMedianUSD})`, isAnomaly: true },
            ...prev.slice(0, 5)
          ]);
        }

      } else {
        // Nominal feed item
        const randVariation = (Math.random() - 0.5) * route.v * 0.5;
        const price = Math.round(route.b + randVariation);
        const computedZScore = (price - route.b) / route.v;

        setStreamLogs(prev => [
          { id: Date.now(), text: `PARSED: GDS Feed | ${route.c} (${route.r}) ${route.cb} - $${price} USD (Z-score: ${computedZScore.toFixed(2)})`, isAnomaly: false },
          ...prev.slice(0, 5)
        ]);
      }

    }, streamSpeed);

    return () => clearInterval(interval);
  }, [isStreaming, streamSpeed, zScoreThreshold, mlSensitivity]);

  // Handle Review Actions
  const handleReviewStatus = (id: string, action: "approve" | "reject" | "partner") => {
    setAnomalies(prev => prev.map(a => {
      if (a.id === id) {
        if (action === "approve") return { ...a, status: "approved_mistake" as const };
        if (action === "reject") return { ...a, status: "rejected_false_positive" as const };
        if (action === "partner") return { ...a, status: "partner_validated" as const };
      }
      return a;
    }));

    // Update selected view if currently open
    if (selectedAnomaly && selectedAnomaly.id === id) {
      setSelectedAnomaly(prev => {
        if (!prev) return null;
        if (action === "approve") return { ...prev, status: "approved_mistake" as const };
        if (action === "reject") return { ...prev, status: "rejected_false_positive" as const };
        if (action === "partner") return { ...prev, status: "partner_validated" as const };
        return prev;
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="mistake-fare-root">
      
      {/* Top Banner Overview */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] bg-rose-950 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-mono font-black uppercase max-w-max">
            Anomaly Detection Engine
          </div>
          <h2 className="text-lg font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse" />
            Automated Mistake-Fare Detection & Mitigation Platform
          </h2>
          <p className="text-xs text-slate-400">
            Automates the screening of global distribution system (GDS) pricing streams. Evaluates statistical deviations, missing surcharges, and FX multiplier errors, feeding anomalies to a rapid review queue with partner lock-outs and recovery protocols.
          </p>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-slate-950/85 border border-slate-900 px-3.5 py-2.5 rounded-xl text-center min-w-[110px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">GDS Parsed</span>
            <span className="text-xs font-black text-slate-100 font-mono">{streamedCount.toLocaleString()}</span>
          </div>
          <div className="bg-slate-950/85 border border-slate-900 px-3.5 py-2.5 rounded-xl text-center min-w-[110px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Anomalies Detected</span>
            <span className="text-xs font-black text-rose-500 font-mono">{anomaliesFound}</span>
          </div>
          <div className="bg-slate-950/85 border border-slate-900 px-3.5 py-2.5 rounded-xl text-center min-w-[110px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Suppressed (FP)</span>
            <span className="text-xs font-black text-emerald-400 font-mono">{falsePositivesSuppressed}</span>
          </div>
          <div className="bg-slate-950/85 border border-slate-900 px-3.5 py-2.5 rounded-xl text-center min-w-[110px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Active GDS Stream</span>
            <span className="text-xs font-black text-indigo-400 font-mono flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Stream Log & Configuration */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* GDS Real-time Parser Simulator */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                  GDS Real-time Ticket Feed
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={streamSpeed}
                  onChange={(e) => setStreamSpeed(parseInt(e.target.value))}
                  className="bg-slate-950 text-[10px] text-slate-400 border border-slate-900 px-2 py-1 rounded focus:outline-none font-semibold cursor-pointer"
                >
                  <option value={1500}>Fast stream (1.5s)</option>
                  <option value={3000}>Normal (3s)</option>
                  <option value={5000}>Slow (5s)</option>
                </select>
                <button
                  onClick={() => setIsStreaming(!isStreaming)}
                  className={`px-2 py-1 rounded text-[10px] font-semibold cursor-pointer font-mono ${
                    isStreaming ? "bg-rose-950 text-rose-400" : "bg-slate-950 text-slate-400"
                  }`}
                >
                  {isStreaming ? "PAUSE" : "RESUME"}
                </button>
              </div>
            </div>

            {/* Simulated Live Stream Terminal */}
            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl font-mono text-[9px] h-[180px] overflow-y-auto space-y-2 select-none">
              {streamLogs.map((log) => (
                <div 
                  key={log.id} 
                  className={`leading-normal border-b border-slate-900/40 pb-1.5 ${
                    log.isAnomaly ? "text-rose-400 font-bold" : "text-slate-400"
                  }`}
                >
                  {log.text}
                </div>
              ))}
            </div>
          </div>

          {/* Core Settings & Math Threshold Adjustments */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-850 pb-2.5">
              <Sliders className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                Algorithm & Filter Calibration
              </h3>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              
              {/* Statistical Z-Score Threshold Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-slate-400 uppercase">Statistical Z-Score Boundary</span>
                  <span className="text-rose-400 font-bold">{zScoreThreshold}σ</span>
                </div>
                <input
                  type="range"
                  min="-7.0"
                  max="-2.5"
                  step="0.5"
                  value={zScoreThreshold}
                  onChange={(e) => setZScoreThreshold(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-rose-500"
                />
                <p className="text-[9px] text-slate-500 font-medium leading-relaxed font-mono">
                  Standard deviations away from 90d routes base-fares. Smaller value expands the detection net.
                </p>
              </div>

              {/* Machine learning confidence threshold */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-slate-400 uppercase">ML Confidence Sensitivity</span>
                  <span className="text-rose-400 font-bold">{mlSensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={mlSensitivity}
                  onChange={(e) => setMlSensitivity(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-rose-500"
                />
                <p className="text-[9px] text-slate-500 font-medium leading-relaxed font-mono">
                  Ensemble validation probability floor before raising critical alert. Suppresses false indicators.
                </p>
              </div>

              {/* Active Rules Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-850">
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Active Filtering Subsystems</span>
                
                <label className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-900 cursor-pointer">
                  <span className="text-[11px] text-slate-300">Raw Currency FX cross-match</span>
                  <input
                    type="checkbox"
                    checked={currencyCrossCheck}
                    onChange={(e) => setCurrencyCrossCheck(e.target.checked)}
                    className="accent-rose-500 w-3.5 h-3.5 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-900 cursor-pointer">
                  <span className="text-[11px] text-slate-300">Null premium fuel-surcharge filter</span>
                  <input
                    type="checkbox"
                    checked={fuelZeroFilter}
                    onChange={(e) => setFuelZeroFilter(e.target.checked)}
                    className="accent-rose-500 w-3.5 h-3.5 cursor-pointer"
                  />
                </label>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Review Queue & Active Anomalies */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Review Queue Split Panel */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* List of Detected anomalies */}
            <div className="md:col-span-5 bg-slate-900/40 border border-slate-850 rounded-2xl p-4 backdrop-blur-sm space-y-3.5 max-h-[500px] overflow-y-auto">
              <span className="text-[10px] font-mono text-slate-400 uppercase block tracking-wide border-b border-slate-850 pb-1.5">
                Live Incident Queue ({anomalies.filter(a => a.status === "pending_review").length} active)
              </span>

              {anomalies.filter(a => a.status === "pending_review" || a.status === "approved_mistake" || a.status === "partner_validated").length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-[11px] text-slate-500 font-semibold font-mono">All queues clear. Monitoring feeds.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {anomalies.map((item) => {
                    const isSelected = selectedAnomaly?.id === item.id;
                    let badgeClass = "text-slate-400 border-slate-800";
                    if (item.status === "approved_mistake") badgeClass = "bg-rose-950/40 text-rose-400 border-rose-900/40";
                    if (item.status === "partner_validated") badgeClass = "bg-emerald-950/40 text-emerald-400 border-emerald-900/40";
                    if (item.status === "pending_review") badgeClass = "bg-amber-950/40 text-amber-400 border-amber-900/40 animate-pulse";

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedAnomaly(item)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-slate-950 border-rose-500/40 shadow-lg" 
                            : "bg-slate-950/60 border-slate-900 hover:border-slate-800"
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono font-black text-slate-100">{item.carrier}</span>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.2 rounded border ${badgeClass}`}>
                            {item.status.replace("_", " ")}
                          </span>
                        </div>

                        <div className="flex justify-between items-baseline mt-1">
                          <span className="text-[11px] font-mono text-slate-400 font-bold">{item.route} - {item.cabinClass}</span>
                          <span className="text-xs font-mono font-black text-rose-500">${item.detectedPriceUSD}</span>
                        </div>

                        <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-900/60">
                          <span>Confidence: <b>{item.confidenceScore}%</b></span>
                          <span>{item.detectedAt}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Deep Anomaly details & triage dashboard */}
            <div className="md:col-span-7 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
              {selectedAnomaly ? (
                <div className="space-y-4">
                  <div className="border-b border-slate-850 pb-3 flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">INCIDENT DETAILS</span>
                      <h4 className="text-xs font-mono font-black text-slate-200">
                        {selectedAnomaly.id} ➜ {selectedAnomaly.carrier}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Anomalous Price</span>
                      <span className="text-sm font-mono font-black text-rose-500">${selectedAnomaly.detectedPriceUSD} USD</span>
                    </div>
                  </div>

                  {/* Pricing Breakdown Card */}
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-3.5 space-y-2.5 text-xs font-semibold text-slate-400">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Ticketing Metadata breakdown</span>
                    
                    <div className="grid grid-cols-2 gap-y-2 font-mono text-[10px]">
                      <div className="flex justify-between pr-4 border-r border-slate-900">
                        <span>Base Fare:</span>
                        <b className="text-slate-300">${selectedAnomaly.metadata.baseFareUSD}</b>
                      </div>
                      <div className="flex justify-between pl-4">
                        <span>Fuel Surcharge:</span>
                        <b className={selectedAnomaly.anomalyType === "missing_fuel_surcharge" ? "text-rose-500 font-bold" : "text-slate-300"}>
                          ${selectedAnomaly.metadata.fuelSurchargeUSD}
                        </b>
                      </div>
                      <div className="flex justify-between pr-4 border-r border-slate-900">
                        <span>Taxes & Fees:</span>
                        <b className={selectedAnomaly.anomalyType === "tax_miscalculation" ? "text-rose-500 font-bold" : "text-slate-300"}>
                          ${selectedAnomaly.metadata.taxesUSD}
                        </b>
                      </div>
                      <div className="flex justify-between pl-4">
                        <span>Raw Currency:</span>
                        <b className="text-slate-300">{selectedAnomaly.metadata.rawCurrencySymbol || "USD"}</b>
                      </div>
                    </div>

                    {/* Explanatory badge for anomaly nature */}
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850 text-[10px] font-medium leading-relaxed">
                      <span className="text-rose-400 font-black block uppercase text-[8px] font-mono mb-0.5">Anomaly Class Analysis</span>
                      {selectedAnomaly.anomalyType === "currency_conversion_error" && (
                        "Cross-currency pricing mismatch: Base fare value directly posted in target exchange rates 1:1, leaving the GDS to compute total fare below the minimum allowed index threshold."
                      )}
                      {selectedAnomaly.anomalyType === "missing_fuel_surcharge" && (
                        "YQ/YR fuel surcharge fields empty on intercontinental partner code-share routes. Sub-booking class was published without mandatory joint-venture tax attachments."
                      )}
                      {selectedAnomaly.anomalyType === "tax_miscalculation" && (
                        "Downstream regional transport tax omitted by Sabre distribution caches. Pricing engine served a bare net fare to wholesale ticketing platforms."
                      )}
                      {selectedAnomaly.anomalyType === "fat_finger_base_fare" && (
                        "Base fare error: Human data entry misplacement resulting in decimal position shifting (e.g. posting $150 instead of $1,500)."
                      )}
                      {selectedAnomaly.anomalyType === "extreme_temporary_drop" && (
                        "Flash seat liquidation matching local competitor algorithms but dropping below absolute cost threshold. Triggered automatic validation blocks."
                      )}
                    </div>
                  </div>

                  {/* Actions Dashboard */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Resolve and mitigation commands</span>
                    
                    {selectedAnomaly.status === "pending_review" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleReviewStatus(selectedAnomaly.id, "reject")}
                          className="py-2 rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          Reject (False Pos)
                        </button>
                        
                        <button
                          onClick={() => handleReviewStatus(selectedAnomaly.id, "approve")}
                          className="py-2 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900 text-rose-400 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Publish Mistake-Fare
                        </button>
                      </div>
                    ) : (
                      <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 font-mono text-[10px] text-slate-350">
                        {selectedAnomaly.status === "approved_mistake" ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-rose-500" />
                            <span>MISTAKE-FARE PUBLISHED AND ALERTS DISPATCHED</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-slate-500" />
                            <span>SUPPRESSED AS FALSE-POSITIVE (SENT TO ML FEEDBACK)</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Mitigation Protocol Options */}
                    {selectedAnomaly.status === "approved_mistake" && (
                      <div className="bg-slate-950 border border-rose-900/30 rounded-xl p-3 space-y-2">
                        <span className="text-[8px] font-mono text-rose-450 uppercase block font-bold">Active Mitigation Lockouts</span>
                        <div className="space-y-1.5 text-[10px] font-medium leading-normal text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            <span>Dispatching partner blocks to OTA platforms (Expedia, Booking.com)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            <span>Activating automatic recovery refunds for non-ticketed bookings</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="text-center py-20 space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold">Select an incident from the left queue to audit ticketing details.</p>
                </div>
              )}

              {/* Documentation Hook */}
              <div className="text-[8px] font-mono text-slate-500 bg-slate-950 p-2 rounded border border-slate-900 mt-4">
                AUTONOMOUS RESPONSE: In the event of an approved mistake-fare, the system triggers API lockouts to GDS endpoints within 40 seconds, preventing mass routing exploitation while legal validation protocols execute.
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Production Anomaly detection specifications */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-slate-250 uppercase font-mono tracking-wide flex items-center gap-1.5">
            <FileCheck className="w-4.5 h-4.5 text-rose-400" />
            Automated Mistake-Fare Architecture Specifications
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Production flow mapping the pipeline ingestion thresholds, streaming algorithms, and automated airline protection protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed font-semibold">
          
          {/* Column 1 */}
          <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-rose-450" />
              1. Statistical Anomaly & Z-Score
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              Incoming GDS pricing records are evaluated against 12-week moving averages and variance matrices. Any record dropping past -4.5 sigma is flagged for critical conversion check.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>Handles currency FX translation check.</li>
              <li>Calculates routing market density indexes.</li>
              <li>Calculates seasonal variance tolerances.</li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-450" />
              2. ML False-Positive Suppression
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              Our LightGBM classifier suppresses false positives such as budget airlines promo campaigns, charter liquidations, and authentic early-bird discounts.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>Flags historical promotions profiles.</li>
              <li>Evaluates cabin class inventory allocations.</li>
              <li>Suppresses intentional marketing pricing peaks.</li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-rose-450" />
              3. Automated Partner Lockout & Alerting
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              When a genuine mistake-fare is published, automated endpoints push lockouts to GDS channels, preventing global travel agents from issuing tickets until airline legal reviews are finalized.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>Triggers Sabre/Amadeus ticket issue blocks.</li>
              <li>Dispatches email alerts to subscriber lists.</li>
              <li>Runs legal compliance validation checklists.</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}
