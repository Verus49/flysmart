export interface MLModel {
  version: string;
  algorithm: string;
  status: "production" | "shadow" | "candidate" | "archived";
  metrics: {
    maeUSD: number;
    rmseUSD: number;
    mapePercent: number;
    r2Score: number;
  };
  deployedAt: string;
  trainedOnSamples: number;
}

export interface FeatureStoreRecord {
  featureName: string;
  category: "seasonality" | "demand" | "holiday" | "market_feed" | "external";
  valueType: "float" | "integer" | "categorical";
  lastUpdated: string;
  driftScorePSI: number; // Population Stability Index
  description: string;
  currentValue: string | number;
}

export interface PredictionPayload {
  route: string;
  bookingWindowDays: number;
  season: "summer" | "shoulder" | "winter" | "holiday_peak";
  fuelPriceIndex: number; // baseline 100
  weatherRisk: "low" | "medium" | "high";
  demandMultiplier: number;
}

export interface TrainingLog {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  mae: number;
  status: "pending" | "running" | "completed";
}

export const INITIAL_MODELS: MLModel[] = [
  {
    version: "v2.1.0-ensemble-active",
    algorithm: "LightGBM + XGBoost Stacking Ensemble",
    status: "production",
    metrics: { maeUSD: 14.20, rmseUSD: 22.45, mapePercent: 3.12, r2Score: 0.945 },
    deployedAt: "2026-06-15 08:30:00",
    trainedOnSamples: 14500000
  },
  {
    version: "v2.0.8-deep-lstm-shadow",
    algorithm: "Temporal Fusion Transformer (TFT)",
    status: "shadow",
    metrics: { maeUSD: 16.50, rmseUSD: 24.10, mapePercent: 3.65, r2Score: 0.921 },
    deployedAt: "2026-06-20 14:15:00",
    trainedOnSamples: 18000000
  },
  {
    version: "v1.9.4-ridge-baseline",
    algorithm: "ElasticNet Linear Autoregression",
    status: "archived",
    metrics: { maeUSD: 24.80, rmseUSD: 36.50, mapePercent: 5.80, r2Score: 0.852 },
    deployedAt: "2026-02-10 11:00:00",
    trainedOnSamples: 8500000
  }
];

export const FEATURE_STORE_RECORDS: FeatureStoreRecord[] = [
  {
    featureName: "sin_day_of_year",
    category: "seasonality",
    valueType: "float",
    lastUpdated: "5 minutes ago",
    driftScorePSI: 0.02,
    description: "Sine representation of day of year to capture annual cyclic seasonality.",
    currentValue: "0.866"
  },
  {
    featureName: "rolling_demand_7d_zscore",
    category: "demand",
    valueType: "float",
    lastUpdated: "Just now",
    driftScorePSI: 0.14,
    description: "7-day rolling ticket query volume normalized across route historical baselines.",
    currentValue: "+1.82"
  },
  {
    featureName: "upcoming_holiday_weight",
    category: "holiday",
    valueType: "float",
    lastUpdated: "Just now",
    driftScorePSI: 0.05,
    description: "Proximity weight based on major federal holidays within the 14-day flight departure window.",
    currentValue: "0.95"
  },
  {
    featureName: "jet_fuel_price_index",
    category: "market_feed",
    valueType: "float",
    lastUpdated: "1 hour ago",
    driftScorePSI: 0.28, // Indicates drift warning!
    description: "Daily Platt's global jet fuel index price (Indexed relative to Jan 2026 = 100).",
    currentValue: "114.2"
  },
  {
    featureName: "origin_dest_weather_alert_level",
    category: "external",
    valueType: "categorical",
    lastUpdated: "15 minutes ago",
    driftScorePSI: 0.08,
    description: "Unified index of storm, typhoon, or blizzard risks (0 = clear, 3 = severe).",
    currentValue: "1 (Low Risk)"
  },
  {
    featureName: "local_event_density_score",
    category: "external",
    valueType: "integer",
    lastUpdated: "10 minutes ago",
    driftScorePSI: 0.11,
    description: "Count of major sporting events, music festivals, or conventions exceeding 50,000 capacity near the arrival airport.",
    currentValue: "2 active"
  },
  {
    featureName: "booking_window_decay_factor",
    category: "demand",
    valueType: "float",
    lastUpdated: "Just now",
    driftScorePSI: 0.01,
    description: "Exponential decay coefficient representing urgency based on days remaining until takeoff.",
    currentValue: "-0.045"
  }
];

export const ROUTE_BASELINES: { [route: string]: { baselineUSD: number; standardVolatility: number } } = {
  "NYC-LON": { baselineUSD: 450, standardVolatility: 85 },
  "HKG-LAX": { baselineUSD: 980, standardVolatility: 220 },
  "SFO-NRT": { baselineUSD: 850, standardVolatility: 150 },
  "CDG-DXB": { baselineUSD: 620, standardVolatility: 110 }
};
