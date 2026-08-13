export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  category: 'ingress' | 'service' | 'storage' | 'event' | 'external';
  description: string;
  techStack: string;
  latencySLA: string;
  scaleCapacity: string;
  failoverPlan: string;
  x: number;
  y: number;
}

export interface DocTab {
  id: string;
  title: string;
  subtitle: string;
  content: string;
}

export interface SimulationParams {
  dailyQueries: number;
  cacheHitRatio: number; // 0 to 1
  gdsCostPerQuery: number; // e.g. $0.015
  cachedCostPerQuery: number; // e.g. $0.0001
  dbWriteCostPerQuery: number; // e.g. $0.0005
  predictionModelScaleCost: number; // e.g. $12000 per month
}

export interface SimulationResults {
  rawGdsCostDaily: number;
  optimizedCostDaily: number;
  dailySavings: number;
  annualSavings: number;
  averageSearchLatency: number; // ms
  cacheHitsCount: number;
  uncachedHitsCount: number;
}
