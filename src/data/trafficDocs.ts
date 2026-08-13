export interface GlobalRegion {
  id: string;
  name: string;
  code: string;
  latLong: { x: number; y: number }; // Coordinates on our pixel canvas
  status: "healthy" | "degraded" | "failed";
  latencyProfileMs: { [origin: string]: number }; // Latency from other global locations
  bgpState: "advertising" | "withdrawn" | "damping";
  healthCheckState: {
    status: "healthy" | "warning" | "unhealthy";
    consecutiveFailures: number;
    lastPingStatus: string;
    lastChecked: string;
  };
  details: string;
  backupRegionId: string;
}

export interface HealthCheckConfig {
  endpointPath: string;
  pingIntervalSec: number;
  timeoutMs: number;
  healthyThreshold: number;
  unhealthyThreshold: number;
  failoverGracePeriodSec: number;
  evaluateTargetHealth: boolean;
  deepCheckServices: {
    database: boolean;
    cache: boolean;
    gdsDirectConnect: boolean;
    kafkaQueue: boolean;
  };
}

export interface BGPRouteLog {
  timestamp: string;
  asNumber: string;
  action: "BGP_ADVERTISE" | "BGP_WITHDRAW" | "BGP_DAMP" | "TRAFFIC_REDIRECT" | "HEALTH_STATUS";
  peer: string;
  prefix: string;
  message: string;
}

export const GLOBAL_REGIONS: GlobalRegion[] = [
  {
    id: "us-east",
    name: "North America East (Northern Virginia)",
    code: "us-east-1",
    latLong: { x: 25, y: 35 },
    status: "healthy",
    latencyProfileMs: { "us-east": 8, "eu-west": 72, "ap-east": 210, "latam-south": 120 },
    bgpState: "advertising",
    healthCheckState: {
      status: "healthy",
      consecutiveFailures: 0,
      lastPingStatus: "HTTP 200 OK - database: ok, cache: ok, gds: ok",
      lastChecked: "Just now"
    },
    details: "Primary transatlantic bridge gateway. Handles 45% of total real-time flight stream volume.",
    backupRegionId: "eu-west"
  },
  {
    id: "eu-west",
    name: "Europe West (Frankfurt)",
    code: "eu-central-1",
    latLong: { x: 50, y: 25 },
    status: "healthy",
    latencyProfileMs: { "us-east": 74, "eu-west": 6, "ap-east": 180, "latam-south": 195 },
    bgpState: "advertising",
    healthCheckState: {
      status: "healthy",
      consecutiveFailures: 0,
      lastPingStatus: "HTTP 200 OK - database: ok, cache: ok, gds: ok",
      lastChecked: "Just now"
    },
    details: "Central NDC GDS aggregator. Directly peering with Lufthansa, Air France, and British Airways native APIs.",
    backupRegionId: "us-east"
  },
  {
    id: "ap-east",
    name: "Asia Pacific East (Singapore)",
    code: "ap-southeast-1",
    latLong: { x: 80, y: 65 },
    status: "healthy",
    latencyProfileMs: { "us-east": 220, "eu-west": 185, "ap-east": 12, "latam-south": 280 },
    bgpState: "advertising",
    healthCheckState: {
      status: "healthy",
      consecutiveFailures: 0,
      lastPingStatus: "HTTP 200 OK - database: ok, cache: ok, gds: ok",
      lastChecked: "Just now"
    },
    details: "High-volume APAC hub. Connects regional low-cost carriers (LCC) and regional distribution caches.",
    backupRegionId: "eu-west"
  },
  {
    id: "latam-south",
    name: "Latin America South (São Paulo)",
    code: "sa-east-1",
    latLong: { x: 38, y: 75 },
    status: "healthy",
    latencyProfileMs: { "us-east": 115, "eu-west": 190, "ap-east": 290, "latam-south": 15 },
    bgpState: "advertising",
    healthCheckState: {
      status: "healthy",
      consecutiveFailures: 0,
      lastPingStatus: "HTTP 200 OK - database: ok, cache: ok, gds: ok",
      lastChecked: "Just now"
    },
    details: "South American operations terminal. Handles LATAM Airlines and local partner airline flight mapping.",
    backupRegionId: "us-east"
  }
];

export const DEFAULT_HEALTH_CHECK_CONFIG: HealthCheckConfig = {
  endpointPath: "/api/v1/health/deep",
  pingIntervalSec: 5,
  timeoutMs: 1500,
  healthyThreshold: 2,
  unhealthyThreshold: 3,
  failoverGracePeriodSec: 10,
  evaluateTargetHealth: true,
  deepCheckServices: {
    database: true,
    cache: true,
    gdsDirectConnect: true,
    kafkaQueue: false
  }
};

export const TRAFFIC_ORIGINS = [
  { id: "nyc", name: "New York", latLong: { x: 23, y: 40 }, primaryRegion: "us-east" },
  { id: "lon", name: "London", latLong: { x: 45, y: 28 }, primaryRegion: "eu-west" },
  { id: "tok", name: "Tokyo", latLong: { x: 88, y: 42 }, primaryRegion: "ap-east" },
  { id: "sao", name: "São Paulo", latLong: { x: 39, y: 72 }, primaryRegion: "latam-south" }
];
