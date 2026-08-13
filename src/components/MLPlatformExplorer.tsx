import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  INITIAL_MODELS, 
  FEATURE_STORE_RECORDS, 
  ROUTE_BASELINES, 
  MLModel, 
  FeatureStoreRecord, 
  PredictionPayload, 
  TrainingLog 
} from "../data/mlPlatformDocs";
import { 
  Brain, 
  Cpu, 
  Database, 
  TrendingUp, 
  Sliders, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Info, 
  Terminal, 
  FileText, 
  ShieldAlert, 
  BarChart4, 
  LineChart, 
  Layers, 
  Gauge, 
  Calendar, 
  CloudSnow, 
  Zap, 
  Send, 
  Flame,
  Tag,
  Sparkles
} from "lucide-react";

export default function MLPlatformExplorer() {
  // ML States
  const [models, setModels] = useState<MLModel[]>(JSON.parse(JSON.stringify(INITIAL_MODELS)));
  const [features, setFeatures] = useState<FeatureStoreRecord[]>(JSON.parse(JSON.stringify(FEATURE_STORE_RECORDS)));
  
  // Prediction sandbox form parameters
  const [selectedRoute, setSelectedRoute] = useState<string>("NYC-LON");
  const [bookingWindow, setBookingWindow] = useState<number>(30); // days before takeoff
  const [selectedSeason, setSelectedSeason] = useState<"summer" | "shoulder" | "winter" | "holiday_peak">("shoulder");
  const [fuelIndex, setFuelIndex] = useState<number>(114.2); // Jet Fuel index
  const [weatherAlert, setWeatherAlert] = useState<"low" | "medium" | "high">("low");
  const [demandFactor, setDemandFactor] = useState<number>(1.25); // Demand z-score
  
  // Simulation drift states
  const [driftInjected, setDriftInjected] = useState<boolean>(false);
  
  // Dynamic Retraining pipeline state
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingEpochs, setTrainingEpochs] = useState<TrainingLog[]>([]);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [trainingStatusText, setTrainingStatusText] = useState<string>("Ready");
  
  // Prediction results
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [isInferencing, setIsInferencing] = useState<boolean>(false);

  // Platform log terminal
  const [platformLogs, setPlatformLogs] = useState<string[]>([
    "[SYSTEM INITIALIZED] Airfare Pred MLEngine v2.1 booting up.",
    "[FEATURE STORE] Sync complete. Spark dynamic pipeline connected.",
    "[MODEL REGISTRY] Active model v2.1.0-ensemble-active validated against test harness (MAE: $14.20).",
    "[MONITORING] Online inference telemetry logs linked to Prometheus cluster."
  ]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Helper to add system log
  const addLog = (msg: string) => {
    const ts = new Date().toISOString().split("T")[1].substring(0, 8);
    setPlatformLogs(prev => [`[${ts}] ${msg}`, ...prev.slice(0, 29)]);
  };

  // Scroll to bottom of logs if wanted, but logs are top-down list
  useEffect(() => {
    // Keep logs updated
  }, [platformLogs]);

  // Handle Inject Data Drift
  const handleToggleDrift = () => {
    if (!driftInjected) {
      setDriftInjected(true);
      // Alter features in Feature Store to represent drift
      setFeatures(prev => prev.map(f => {
        if (f.featureName === "jet_fuel_price_index") {
          return { ...f, currentValue: "148.5", driftScorePSI: 0.48 }; // severe drift
        }
        if (f.featureName === "rolling_demand_7d_zscore") {
          return { ...f, currentValue: "+3.92", driftScorePSI: 0.32 }; // high drift
        }
        return f;
      }));
      setFuelIndex(148.5);
      setDemandFactor(3.92);
      addLog("[ALERT] Massive drift detected! Jet Fuel price spiked to 148.5 (PSI = 0.48). Rolling Demand z-score spiked to +3.92 (PSI = 0.32).");
      addLog("[MONITORING] Model version v2.1.0-ensemble-active performance degraded. Expected prediction accuracy declining.");
    } else {
      setDriftInjected(false);
      // Restore normal metrics
      setFeatures(JSON.parse(JSON.stringify(FEATURE_STORE_RECORDS)));
      setFuelIndex(114.2);
      setDemandFactor(1.25);
      addLog("[MONITORING] Feature store metrics stabilized. Drift indices cleared.");
    }
  };

  // Live calculation of prediction in client sandbox (incorporates standard models + inputs)
  const calculateFareEstimate = () => {
    setIsInferencing(true);
    addLog(`[INFERENCE] POST /api/v1/predict - Payload: { route: "${selectedRoute}", window: ${bookingWindow}d, season: "${selectedSeason}", fuel: ${fuelIndex}, demand: ${demandFactor} }`);
    
    setTimeout(() => {
      const routeInfo = ROUTE_BASELINES[selectedRoute] || { baselineUSD: 500, standardVolatility: 100 };
      
      // Calculate multiplier impact
      let seasonMultiplier = 1.0;
      if (selectedSeason === "summer") seasonMultiplier = 1.25;
      if (selectedSeason === "holiday_peak") seasonMultiplier = 1.45;
      if (selectedSeason === "winter") seasonMultiplier = 0.85;

      // Fuel price index contribution (indexed to 100 as baseline)
      const fuelImpact = (fuelIndex - 100) * 1.5;

      // Demand z-score multiplier
      const demandImpact = demandFactor * 45;

      // Booking window curves (urgency decay). Typically, price spikes exponentially as departure is near (< 7 days)
      let bookingWindowImpact = 0;
      if (bookingWindow <= 3) {
        bookingWindowImpact = routeInfo.standardVolatility * 1.6;
      } else if (bookingWindow <= 7) {
        bookingWindowImpact = routeInfo.standardVolatility * 1.1;
      } else if (bookingWindow <= 14) {
        bookingWindowImpact = routeInfo.standardVolatility * 0.4;
      } else if (bookingWindow >= 60) {
        bookingWindowImpact = -routeInfo.standardVolatility * 0.2; // early bird discount
      }

      // Weather penalty
      const weatherPenalty = weatherAlert === "high" ? 65 : weatherAlert === "medium" ? 25 : 0;

      // Final aggregation
      const baseEstimate = (routeInfo.baselineUSD * seasonMultiplier) + fuelImpact + demandImpact + bookingWindowImpact + weatherPenalty;
      const finalPrice = Math.max(120, Math.round(baseEstimate));

      // Compute Confidence Score based on Input uncertainties & Drift metrics
      let calculatedConfidence = 96; // base confidence
      if (driftInjected) {
        calculatedConfidence -= 25; // drop drastically
      }
      if (weatherAlert === "high") {
        calculatedConfidence -= 10;
      }
      if (bookingWindow < 5) {
        calculatedConfidence -= 8; // near takeoff volatility
      }

      // Clamping confidence
      calculatedConfidence = Math.max(45, Math.min(99, calculatedConfidence));

      setPredictedPrice(finalPrice);
      setConfidenceScore(calculatedConfidence);
      setIsInferencing(false);

      addLog(`[INFERENCE] Prediction finalized: $${finalPrice} USD (Confidence: ${calculatedConfidence}%). Model version used: v2.1.0-ensemble-active.`);
    }, 800);
  };

  // Run calculation on mounting
  useEffect(() => {
    calculateFareEstimate();
  }, [selectedRoute, bookingWindow, selectedSeason, fuelIndex, weatherAlert, demandFactor]);

  // Run training loop simulator
  const triggerRetraining = () => {
    if (isTraining) return;
    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingEpochs([]);
    setTrainingStatusText("Initializing pipeline...");
    addLog("[PIPELINE] Continuous Retraining pipeline triggered. Acquiring Spark cluster locks...");
    
    let currentStep = 0;
    const epochLogs: TrainingLog[] = [];

    const interval = setInterval(() => {
      currentStep++;
      const progressPercent = currentStep * 10;
      setTrainingProgress(progressPercent);

      if (currentStep === 1) {
        setTrainingStatusText("Fetching features from Redis store...");
        addLog("[TRAINING] Aggregating historical fares of past 365 days across all global GDS cache nodes...");
      } else if (currentStep === 2) {
        setTrainingStatusText("Applying feature engineering transforms...");
        addLog("[TRAINING] Feature pipeline complete. Normalized 14,500,000 row records.");
      } else if (currentStep >= 3 && currentStep <= 7) {
        // Simulating gradient boosting iteration runs
        const epochNum = currentStep - 2;
        const trainL = Math.max(120.5, 340.5 - (epochNum * 45.2) + Math.random() * 10);
        const valL = trainL + (8.5 + Math.random() * 5);
        const currentMae = Math.sqrt(trainL) * 0.9;
        
        const newEpoch: TrainingLog = {
          epoch: epochNum,
          trainLoss: parseFloat(trainL.toFixed(4)),
          valLoss: parseFloat(valL.toFixed(4)),
          mae: parseFloat(currentMae.toFixed(2)),
          status: "running"
        };
        epochLogs.push(newEpoch);
        setTrainingEpochs([...epochLogs]);
        setTrainingStatusText(`Fitting XGBoost Estimator - Iteration ${epochNum}/5`);
        addLog(`[TRAINING] Iteration ${epochNum}/5 - Loss: ${newEpoch.trainLoss} - Validation: ${newEpoch.valLoss} - MAE: $${newEpoch.mae}`);
      } else if (currentStep === 8) {
        setTrainingStatusText("Computing evaluation validation metrics...");
        addLog("[TRAINING] Offline test set evaluation completed. Calculating MAE, RMSE, MAPE, and R2 coefficients.");
      } else if (currentStep === 9) {
        setTrainingStatusText("Registering candidate in Model Registry...");
        addLog("[REGISTRY] v2.2.0-candidate-xgboost created. Passing performance checks (MAE: $13.80 vs baseline MAE: $14.20). Promoted to Candidate status.");
      } else if (currentStep === 10) {
        setTrainingStatusText("Retraining Completed");
        setIsTraining(false);
        clearInterval(interval);
        addLog("[PIPELINE] Retraining cycle finished. Model version v2.1.0 promoted to archives. New Production Model: v2.2.0-ensemble-active deployed successfully.");
        
        // Update models list in registry to promote the new model
        setModels(prev => {
          const updated = prev.map(m => {
            if (m.status === "production") {
              return { ...m, status: "archived" as const };
            }
            return m;
          });
          return [
            {
              version: "v2.2.0-ensemble-active",
              algorithm: "Optimized LightGBM + XGBoost + CatBoost Ensemble",
              status: "production" as const,
              metrics: { maeUSD: 13.80, rmseUSD: 21.10, mapePercent: 2.95, r2Score: 0.952 },
              deployedAt: "Just Now",
              trainedOnSamples: 15800000
            },
            ...updated
          ];
        });

        // Auto-stabilize drift if they trained after drift injection
        if (driftInjected) {
          setDriftInjected(false);
          setFeatures(JSON.parse(JSON.stringify(FEATURE_STORE_RECORDS)));
          addLog("[MONITORING] Newly compiled model architecture has integrated the drifted feature values. Production drift alarms cleared.");
        }
      }
    }, 1200);
  };

  // Calculate prediction line points for SVG chart
  const predictionChartPoints = useMemo(() => {
    const routeInfo = ROUTE_BASELINES[selectedRoute] || { baselineUSD: 500, standardVolatility: 100 };
    let points: { day: number; price: number }[] = [];
    
    // Simulate booking windows from 90 days out to departure (day 0)
    for (let day = 90; day >= 0; day -= 5) {
      let seasonMultiplier = 1.0;
      if (selectedSeason === "summer") seasonMultiplier = 1.25;
      if (selectedSeason === "holiday_peak") seasonMultiplier = 1.45;
      if (selectedSeason === "winter") seasonMultiplier = 0.85;

      const fuelImpact = (fuelIndex - 100) * 1.5;
      const demandImpact = demandFactor * 45;

      // Volatility curves
      let windowImpact = 0;
      if (day <= 3) {
        windowImpact = routeInfo.standardVolatility * 1.65;
      } else if (day <= 7) {
        windowImpact = routeInfo.standardVolatility * 1.15;
      } else if (day <= 14) {
        windowImpact = routeInfo.standardVolatility * 0.45;
      } else if (day <= 30) {
        windowImpact = routeInfo.standardVolatility * 0.15;
      } else {
        windowImpact = -routeInfo.standardVolatility * 0.18; // early booking discount
      }

      // Add a tiny sine wave for weekly micro-fluctuations
      const weekdayFluctuation = Math.sin(day * 0.5) * 15;

      const est = (routeInfo.baselineUSD * seasonMultiplier) + fuelImpact + demandImpact + windowImpact + weekdayFluctuation;
      points.push({ day, price: Math.max(120, Math.round(est)) });
    }
    return points;
  }, [selectedRoute, selectedSeason, fuelIndex, demandFactor]);

  // SVG Chart rendering math
  const chartHeight = 120;
  const chartWidth = 320;
  const maxPrice = Math.max(...predictionChartPoints.map(p => p.price)) * 1.1;
  const minPrice = Math.min(...predictionChartPoints.map(p => p.price)) * 0.9;
  
  const polylinePoints = useMemo(() => {
    return predictionChartPoints.map((p, idx) => {
      // mapping day (90 to 0) to X (0 to chartWidth)
      const x = ((90 - p.day) / 90) * chartWidth;
      // mapping price (min to max) to Y (chartHeight to 0)
      const y = chartHeight - ((p.price - minPrice) / (maxPrice - minPrice)) * chartHeight;
      return `${x},${y}`;
    }).join(" ");
  }, [predictionChartPoints, minPrice, maxPrice]);

  return (
    <div className="space-y-6 animate-fadeIn" id="ml-platform-root">
      
      {/* Top Banner Overview */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono font-black uppercase max-w-max">
            Predictive AI Pipeline
          </div>
          <h2 className="text-lg font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
            Airfare Trend Predictor & ML platform
          </h2>
          <p className="text-xs text-slate-400">
            A real-time visual sandbox showcasing an enterprise machine learning pipeline. It pulls real-time features from a Redis Feature Store (Fuel, Seasonality, Demand, Weather), coordinates model drift checks, serves online API inferences with confidence bounds, and runs continuous retraining feedback loops.
          </p>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-slate-950/85 border border-slate-900 px-3 py-2.5 rounded-xl text-center min-w-[100px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Active Model</span>
            <span className="text-xs font-black text-indigo-450 font-mono truncate max-w-[90px] inline-block">{models.find(m => m.status === "production")?.version.split("-")[0]}</span>
          </div>
          <div className="bg-slate-950/85 border border-slate-900 px-3 py-2.5 rounded-xl text-center min-w-[100px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">MAE Target</span>
            <span className="text-xs font-black text-emerald-450 font-mono">${models.find(m => m.status === "production")?.metrics.maeUSD.toFixed(2)}</span>
          </div>
          <div className="bg-slate-950/85 border border-slate-900 px-3 py-2.5 rounded-xl text-center min-w-[100px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Inference RTT</span>
            <span className="text-xs font-black text-sky-400 font-mono">18.5ms</span>
          </div>
          <div className="bg-slate-950/85 border border-slate-900 px-3 py-2.5 rounded-xl text-center min-w-[100px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Drift Alarms</span>
            <span className={`text-xs font-black font-mono ${driftInjected ? "text-rose-500 animate-pulse" : "text-slate-400"}`}>
              {driftInjected ? "ACTIVE" : "NOMINAL"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: API Predictor Sandbox & SVGs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Interactive Prediction Sandbox */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                  Online Inference API Playground
                </h3>
              </div>
              <span className="text-[8px] font-mono text-slate-500 uppercase">REST ENDPOINT: /api/v1/predict</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Form parameters */}
              <div className="md:col-span-5 space-y-4 text-xs font-semibold">
                
                {/* Route selector */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase">Target Flight Route</label>
                  <select
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded-lg text-slate-300 focus:outline-none"
                  >
                    <option value="NYC-LON">New York (JFK) ➜ London (LHR)</option>
                    <option value="HKG-LAX">Hong Kong (HKG) ➜ Los Angeles (LAX)</option>
                    <option value="SFO-NRT">San Francisco (SFO) ➜ Tokyo (NRT)</option>
                    <option value="CDG-DXB">Paris (CDG) ➜ Dubai (DXB)</option>
                  </select>
                </div>

                {/* Booking Window Days */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-slate-400 uppercase">Booking Window</span>
                    <span className="text-indigo-400 font-bold">{bookingWindow} Days out</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="90"
                    value={bookingWindow}
                    onChange={(e) => setBookingWindow(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                    <span>1d (Takeoff)</span>
                    <span>90d (Early bird)</span>
                  </div>
                </div>

                {/* Seasonal Period */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase">Seasonality Weights</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
                    <button
                      onClick={() => setSelectedSeason("summer")}
                      className={`py-1 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                        selectedSeason === "summer" ? "bg-slate-900 text-indigo-400" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Summer Peak
                    </button>
                    <button
                      onClick={() => setSelectedSeason("holiday_peak")}
                      className={`py-1 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                        selectedSeason === "holiday_peak" ? "bg-slate-900 text-indigo-400" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Holiday Max
                    </button>
                    <button
                      onClick={() => setSelectedSeason("shoulder")}
                      className={`py-1 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                        selectedSeason === "shoulder" ? "bg-slate-900 text-indigo-400" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Shoulder
                    </button>
                    <button
                      onClick={() => setSelectedSeason("winter")}
                      className={`py-1 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                        selectedSeason === "winter" ? "bg-slate-900 text-indigo-400" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Winter Low
                    </button>
                  </div>
                </div>

                {/* Weather Alert */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase">Adverse Weather Threat Level</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
                    {["low", "medium", "high"].map((level) => (
                      <button
                        key={level}
                        onClick={() => setWeatherAlert(level as any)}
                        className={`py-1 rounded text-[9px] font-bold uppercase cursor-pointer transition-colors ${
                          weatherAlert === level 
                            ? level === "high" 
                              ? "bg-rose-950 text-rose-400" 
                              : level === "medium"
                                ? "bg-amber-950 text-amber-400"
                                : "bg-emerald-950 text-emerald-400"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Graphical representation Output */}
              <div className="md:col-span-7 bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between space-y-4">
                
                {/* Visual predicted values */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Estimated Future Fare</span>
                    {isInferencing ? (
                      <span className="text-xl font-mono text-slate-400 font-bold animate-pulse">Calculating...</span>
                    ) : (
                      <span className="text-2xl font-black font-mono text-slate-100 flex items-baseline gap-1">
                        ${predictedPrice} <span className="text-[10px] text-slate-400 font-normal">USD</span>
                      </span>
                    )}
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Inference Confidence</span>
                    <span className={`text-sm font-black font-mono ${
                      confidenceScore && confidenceScore >= 85 
                        ? "text-emerald-400" 
                        : confidenceScore && confidenceScore >= 70 
                          ? "text-amber-500" 
                          : "text-rose-500"
                    }`}>
                      {confidenceScore}%
                    </span>
                  </div>
                </div>

                {/* SVG Visual line graph representing booking window trend */}
                <div className="border border-slate-900 rounded-lg p-2.5 bg-slate-900/20 relative">
                  <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-500">FARE TREND OVER BOOKING DECAY WINDOW (DAYS TO TAKEOFF)</div>
                  
                  {/* SVG Chart */}
                  <div className="h-[120px] w-full mt-4">
                    <svg className="w-full h-full overflow-visible">
                      {/* Grid guidelines */}
                      <line x1="0" y1="0" x2="100%" y2="0" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />
                      <line x1="0" y1="60" x2="100%" y2="60" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />
                      <line x1="0" y1="120" x2="100%" y2="120" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />

                      {/* Sparkles / Indicators at specific days */}
                      {/* Polyline points mapped */}
                      <polyline
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="2"
                        points={polylinePoints}
                        className="transition-all duration-500"
                      />

                      {/* Endpoint Indicator Dot */}
                      <circle 
                        cx={chartWidth} 
                        cy={chartHeight - ((predictionChartPoints[predictionChartPoints.length - 1].price - minPrice) / (maxPrice - minPrice)) * chartHeight}
                        r="3" 
                        fill="#f43f5e" 
                        className="animate-pulse"
                      />

                      {/* Selected Booking Window crosshair line */}
                      {(() => {
                        const targetX = ((90 - bookingWindow) / 90) * chartWidth;
                        const targetVal = predictionChartPoints.find(p => p.day <= bookingWindow)?.price || predictedPrice || 0;
                        const targetY = chartHeight - ((targetVal - minPrice) / (maxPrice - minPrice)) * chartHeight;
                        
                        return (
                          <g>
                            <line 
                              x1={targetX} 
                              y1="0" 
                              x2={targetX} 
                              y2={chartHeight} 
                              stroke="#4f46e5" 
                              strokeWidth="1" 
                              strokeDasharray="2,2" 
                            />
                            <circle cx={targetX} cy={targetY} r="4" fill="#4f46e5" stroke="#fff" strokeWidth="1" />
                          </g>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* Chart axis label */}
                  <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-900">
                    <span>90d (Early)</span>
                    <span>60d</span>
                    <span>30d</span>
                    <span>14d</span>
                    <span>7d</span>
                    <span className="text-rose-500">Takeoff (0d)</span>
                  </div>
                </div>

                {/* API Request Example visual block */}
                <div className="text-[8px] font-mono text-slate-500 flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-900">
                  <span>RESPONSE OK: {"{"} "predictedPrice": {predictedPrice}, "confidence": {confidenceScore} {"}"}</span>
                  <span className="text-emerald-400 font-bold uppercase text-[7px]">v2.1 ONLINE</span>
                </div>

              </div>

            </div>

          </div>

          {/* Model Monitoring & Drift Indicators */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 pb-3 gap-3">
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  Real-time Data Drift & Telemetry Monitor
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Evaluates Feature Stability (PSI) and Concept Drift relative to initial training distribution parameters.
                </p>
              </div>

              {/* Toggle to inject drift artificially */}
              <button
                onClick={handleToggleDrift}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-mono font-black border transition-all cursor-pointer ${
                  driftInjected 
                    ? "bg-rose-950/45 border-rose-500 text-rose-400 animate-pulse" 
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                }`}
              >
                {driftInjected ? "🛑 Drift Active (Clear)" : "⚠️ Inject Market Drift"}
              </button>
            </div>

            {/* Drift cards displaying feature stability indices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              
              {/* Feature PSI Card 1 */}
              <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Jet Fuel Index PSI</span>
                  <span className={`px-1 text-[8px] font-bold font-mono rounded ${
                    driftInjected ? "bg-rose-950 text-rose-400 animate-pulse" : "bg-emerald-950 text-emerald-400"
                  }`}>
                    {driftInjected ? "ALARM" : "NORMAL"}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black font-mono text-slate-200">
                    {driftInjected ? "0.48" : "0.08"}
                  </span>
                  <span className="text-[8px] text-slate-500 font-mono">PSI index</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-normal font-semibold">
                  {driftInjected ? "Platt's fuel index spiked due to Middle East crude disruptions." : "Fuel metrics are within baseline variance thresholds."}
                </p>
              </div>

              {/* Feature PSI Card 2 */}
              <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Concept Drift (KL-Div)</span>
                  <span className={`px-1 text-[8px] font-bold font-mono rounded ${
                    driftInjected ? "bg-amber-950 text-amber-400" : "bg-emerald-950 text-emerald-400"
                  }`}>
                    {driftInjected ? "WARNING" : "NORMAL"}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black font-mono text-slate-200">
                    {driftInjected ? "0.22" : "0.04"}
                  </span>
                  <span className="text-[8px] text-slate-500 font-mono">KL-Divergence</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-normal font-semibold">
                  {driftInjected ? "Target variable boundaries shifting. Customers buying late-notice." : "Core route pricing behaviors match historical profiles."}
                </p>
              </div>

              {/* Feature PSI Card 3 */}
              <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Demand Signal Z-Score</span>
                  <span className={`px-1 text-[8px] font-bold font-mono rounded ${
                    driftInjected ? "bg-rose-950 text-rose-400" : "bg-emerald-950 text-emerald-400"
                  }`}>
                    {driftInjected ? "SPIKED" : "NOMINAL"}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black font-mono text-slate-200">
                    {driftInjected ? "+3.92" : "+1.25"}
                  </span>
                  <span className="text-[8px] text-slate-500 font-mono">sigma</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-normal font-semibold">
                  {driftInjected ? "Hyper-demand outliers triggered on European routes." : "Dynamic tickets searches showing standard seasonal curve."}
                </p>
              </div>

            </div>

            {/* Automated mitigation alert banner */}
            {driftInjected && (
              <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3.5 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-rose-450 block">Drift Threshold Exceeded - Automated Action Queued</span>
                  <p className="text-[11px] text-slate-400 leading-normal font-semibold">
                    The platform's drift listener has detected features exceeding 0.25 PSI bounds. An autonomous retraining pipeline has been triggered using newly populated feature stores to compute updated network weights.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Feature Store, Training Logs, and Model Registry */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Spark & Redis Feature Store Deck */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                  Redis Enterprise Feature Store
                </h3>
              </div>
              <span className="text-[8px] font-mono text-slate-500">DYNAMIC SCHEMA</span>
            </div>

            {/* List of features */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {features.map((feat) => {
                const hasDrift = feat.driftScorePSI > 0.25;
                return (
                  <div key={feat.featureName} className="bg-slate-950 border border-slate-900 p-2.5 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between items-center font-mono">
                      <span className="font-bold text-slate-300">{feat.featureName}</span>
                      <span className={`text-[8px] px-1 rounded uppercase ${
                        hasDrift ? "bg-rose-950 text-rose-400 animate-pulse" : "bg-slate-900 text-slate-400"
                      }`}>
                        {feat.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold italic leading-normal">{feat.description}</p>
                    <div className="flex justify-between text-[10px] font-mono pt-1 text-slate-400">
                      <span>Val: <b className="text-slate-300">{feat.currentValue}</b></span>
                      <span>PSI: <b className={hasDrift ? "text-rose-400 font-bold" : "text-slate-500"}>{feat.driftScorePSI}</b></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Training Pipeline Sandbox CLI */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center gap-1.5">
                <RefreshCw className={`w-4 h-4 text-indigo-400 ${isTraining ? "animate-spin" : ""}`} />
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                  Continuous Retraining Pipeline
                </h3>
              </div>
              <span className="text-[8px] font-mono text-slate-500">TRAINING STATE</span>
            </div>

            {/* Pipeline progress bar */}
            <div className="space-y-2.5 bg-slate-950 border border-slate-900 p-3.5 rounded-xl font-semibold text-xs text-slate-400 leading-normal">
              <div className="flex justify-between items-center font-mono">
                <span>Status: <b className="text-slate-200">{trainingStatusText}</b></span>
                {isTraining && <span>{trainingProgress}%</span>}
              </div>

              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${trainingProgress}%` }}
                />
              </div>

              {/* Epoch logs CLI inside the training pipeline container */}
              {trainingEpochs.length > 0 && (
                <div className="bg-slate-900 p-2 rounded-lg font-mono text-[8px] text-indigo-400 space-y-1 max-h-[80px] overflow-y-auto">
                  {trainingEpochs.map(ep => (
                    <div key={ep.epoch}>
                      EPOCH {ep.epoch}/5 - Train Loss: {ep.trainLoss} - Val Loss: {ep.valLoss} - MAE: ${ep.mae}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Trigger */}
              <button
                disabled={isTraining}
                onClick={triggerRetraining}
                className={`w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-[10px] font-mono uppercase tracking-wider font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors ${
                  isTraining ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                Trigger Retraining Cycle
              </button>
            </div>
          </div>

          {/* Unified Model Registry Version Control */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                  Model Registry Repository
                </h3>
              </div>
              <span className="text-[8px] font-mono text-slate-500">PROD REGISTRY</span>
            </div>

            {/* List of models */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {models.map((mod) => {
                let statusBadge = "bg-slate-900 text-slate-500";
                if (mod.status === "production") statusBadge = "bg-emerald-950 text-emerald-400 border border-emerald-900/40 font-bold";
                if (mod.status === "shadow") statusBadge = "bg-sky-950 text-sky-400 border border-sky-900/40";
                
                return (
                  <div key={mod.version} className="bg-slate-950 border border-slate-900 p-3 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center font-mono">
                      <span className="font-bold text-slate-200">{mod.version}</span>
                      <span className={`text-[8px] px-1.5 py-0.2 rounded border uppercase ${statusBadge}`}>
                        {mod.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-[10px] text-slate-400 font-semibold leading-normal">
                      <div>Algorithm: <b className="text-slate-350">{mod.algorithm}</b></div>
                      <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-900/40 text-[9px] font-mono">
                        <span>MAE: <b className="text-emerald-400">${mod.metrics.maeUSD.toFixed(2)}</b></span>
                        <span>RMSE: <b className="text-slate-300">${mod.metrics.rmseUSD.toFixed(2)}</b></span>
                        <span>MAPE: <b className="text-slate-300">{mod.metrics.mapePercent.toFixed(2)}%</b></span>
                        <span>R²: <b className="text-slate-300">{mod.metrics.r2Score.toFixed(3)}</b></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Deep Production ML Specifications Section */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-slate-250 uppercase font-mono tracking-wide flex items-center gap-1.5">
            <FileText className="w-4.5 h-4.5 text-indigo-400" />
            Airfare Price Prediction Machine Learning Platform Production Specifications
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Production guidelines mapping the offline training orchestrations, feature store synchronizations, and real-time model serving constraints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed font-semibold">
          
          {/* Metric Columns */}
          <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-450" />
              1. Feature store & engineering
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              The Redis feature store maintains low-latency parameters sync'd from upstream microservices. Jet fuel index, booking windows decay curves, weather status, and holiday proximity multipliers are written daily and cached in memory.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>Cyclic Seasonality engineered using Sine/Cosine.</li>
              <li>Outliers clipped with robust Huber loss scaling.</li>
              <li>Real-time feature retrieval latency &lt; 2ms.</li>
            </ul>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-indigo-450" />
              2. Training pipeline & validation
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              The continuous retraining pipeline processes daily updates across global routes. Models are fitted on the past 365 days of tickets transaction history and evaluated against holdout testing windows.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>Automated retraining triggers when PSI exceeds 0.25.</li>
              <li>Validation enforces MAE must beat production by &gt;1%.</li>
              <li>Shadow model runs compare live prediction variances.</li>
            </ul>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-200 tracking-wide flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-450" />
              3. Online Inference & Monitoring
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal font-semibold">
              The online prediction API parses HTTP requests containing route IDs, dates, and holiday indices, serving inferences with estimated confidence score brackets that drop when feature drift is high.
            </p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-medium font-mono">
              <li>Confidence scores mapped to ensemble standard deviation.</li>
              <li>Telemetry hooks logs input payloads for drift audit.</li>
              <li>Average inference SLA capped at strict 35ms.</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}
