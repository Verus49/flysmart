export interface CachingLayerDoc {
  id: string;
  name: string;
  type: string;
  description: string;
  ttl: string;
  eviction: string;
  compression: string;
  warming: string;
  replicated: boolean;
  iconName: string;
  technicalDetails: string[];
  flowchart?: string;
}

export const CACHING_LAYERS: CachingLayerDoc[] = [
  {
    id: "cloudflare",
    name: "Layer 1: Cloudflare Edge Cache & Argo",
    type: "Global Edge Content Delivery Network",
    description: "Serves static static assets, client bundle fragments, and geolocalized API response payloads closest to the user's origin coordinates.",
    ttl: "14 Days (Assets) / 5 Minutes (Config API)",
    eviction: "Automatic FIFO / Purge-on-Deploy",
    compression: "Brotli (level 11) for text, WebP/AVIF for icons",
    warming: "Cloudflare Cache Reserve & Active pre-fetches",
    replicated: true,
    iconName: "Globe",
    technicalDetails: [
      "Secures global ingress points, handles SSL/TLS termination, and applies DDoS protection.",
      "Uses Argo Smart Routing to bypass internet congestion paths, decreasing TTFB (Time to First Byte) by up to 35%.",
      "Strips unnecessary headers and minifies client JSON structures before distribution."
    ]
  },
  {
    id: "static",
    name: "Layer 2: Memory-Mapped Static Cache",
    type: "Local App Server RAM (Node Memory / LRU)",
    description: "Caches rarely changing metadata such as IATA airport codes, city-to-airport mapping definitions, airline logos, and timezone offsets.",
    ttl: "30 Days with manual webhook purges",
    eviction: "Least Recently Used (LRU) - Maximum size 50,000 keys",
    compression: "In-memory raw objects (no compression for zero-CPU retrieval overhead)",
    warming: "Pre-loaded into RAM on microservice server boot",
    replicated: false,
    iconName: "Cpu",
    technicalDetails: [
      "Provides absolute zero-network latency (<0.1ms) for common static lookup values.",
      "Automatically loaded from database during the health-check pre-warming boot sequence.",
      "Configured with Node-Cache or tiny-lru in JavaScript memory heaps."
    ]
  },
  {
    id: "geo",
    name: "Layer 3: Geolocalized Routing Cache",
    type: "Distributed Redis Cluster (Regional)",
    description: "Stores coordinate maps and airport proximity indexes to quickly resolve fuzzy location inputs (e.g., 'somewhere near Munich') to flight search codes.",
    ttl: "24 Hours",
    eviction: "Volatile-LRU",
    compression: "Snappy Binary Serialization",
    warming: "Asynchronous background worker recalculates overnight grids",
    replicated: true,
    iconName: "MapPin",
    technicalDetails: [
      "Maintains index grids of latitude/longitude vectors mapped to high-efficiency geohash strings.",
      "Resolves radial queries ('flights within 150 miles') instantly using Redis Geo Commands.",
      "Replicated across core cloud regions (JFK, FRA, SIN) to guarantee rapid regional lookup speeds."
    ]
  },
  {
    id: "prediction",
    name: "Layer 4: AI Fare Prediction Cache",
    type: "Redis Enterprise Read-Replicas + Vector DB",
    description: "Stores pre-computed fare projections, price charts, and neural net trends compiled by the ML pipeline to satisfy informational questions instantly.",
    ttl: "6 Hours",
    eviction: "Least Frequently Used (LFU)",
    compression: "MessagePack for structured tabular data structures",
    warming: "Continuous offline pipeline processes popular routes and writes directly to prediction indexes",
    replicated: true,
    iconName: "Brain",
    technicalDetails: [
      "Houses trend predictions so pricing charts do not require continuous CPU-heavy ML inference requests.",
      "Provides vector lookup capabilities for semantically matching similar queries (e.g., 'flights in early July' maps directly to 'flights in late June').",
      "Saves up to $15K monthly in GPU inference scale costs."
    ]
  },
  {
    id: "destination",
    name: "Layer 5: Destination & Context Cache",
    type: "ElastiCache / MemoryDB",
    description: "Maintains comprehensive destination details including real-time weather scores, visa criteria, tourist indexes, and safety ratings.",
    ttl: "12 Hours (Weather) / 7 Days (Visas)",
    eviction: "AllKeys-LRU",
    compression: "Gzip Compression for large multi-paragraph details",
    warming: "Warmed on-demand with background cron refreshes for top 500 tourism hubs",
    replicated: false,
    iconName: "Compass",
    technicalDetails: [
      "Aggregates details from third-party APIs (IATA Timatic, OpenWeather, NomadList) to avoid API limit penalties.",
      "Frees the conversational LLM from calling high-latency external APIs directly mid-query.",
      "Applies real-time validation layers to ensure visa rules are updated per nationality matrix."
    ]
  },
  {
    id: "search-cache",
    name: "Layer 6: Aggregated Search Cache",
    type: "ClickHouse Aggregate Tables & Indexes",
    description: "Caches high-performance search queries and route index grids, providing flexible combinations of dates and budgets without live carrier GDS calls.",
    ttl: "1 Hour",
    eviction: "TTL-based expiry",
    compression: "Columnar LZ4 (ClickHouse Native)",
    warming: "Cron-based pre-fetching of the top 1,000 global commercial corridors",
    replicated: true,
    iconName: "Search",
    technicalDetails: [
      "Permits rich, complex tabular filtering (e.g., matching multi-city patterns under $500) within milliseconds.",
      "Aggregates raw real-time Sabre/Amadeus search logs into pre-computed pricing buckets.",
      "Utilizes ClickHouse materialized views to update route price indices incrementally."
    ]
  },
  {
    id: "redis-flight",
    name: "Layer 7: Redis Real-time Flight Cache (L2)",
    type: "Memory-Resident Redis Cluster (High Write-Through)",
    description: "The primary transactional defense line holding active seat availability, flight leg configurations, and precise pricing quotes for live booking pipelines.",
    ttl: "15 Minutes (Dynamic fares) / 1 Hour (Schedules)",
    eviction: "Volatile-LRU",
    compression: "Protocol Buffers (Protobuf) for ultrathin binary payloads",
    warming: "Write-through caching during active client flight queries",
    replicated: true,
    iconName: "Database",
    technicalDetails: [
      "Stores exact flight options returned from live Sabre/Amadeus GDS XML queries, preventing redundant API lookup charges.",
      "Features a strict 15-minute expiration cycle to avoid presenting stale fares during checkouts.",
      "Handles up to 100,000 concurrent writes/sec using Redis Cluster horizontal partitioning."
    ]
  }
];

export interface CacheDiscussions {
  title: string;
  strategy: string;
  impact: string;
  implementation: string[];
}

export const CACHE_DISCUSSIONS: CacheDiscussions[] = [
  {
    title: "Dynamic TTL & Freshness Policies",
    strategy: "Adaptive TTL based on flight volatility coefficient indicators.",
    impact: "Reduces stale price displays during booking by 98% while retaining max cache efficiency.",
    implementation: [
      "Fares on high-demand routes (e.g., LHR-JFK departing within 48h) receive a low TTL of 5 minutes.",
      "Schedules and seat configurations are given a much higher TTL of 2 hours, as seats fluctuate less than dynamic fares.",
      "Standard long-haul seasonal fares (departing 90+ days in the future) are assigned a robust 1-hour TTL."
    ]
  },
  {
    title: "Active Cache Invalidation & Event Pipelines",
    strategy: "Event-driven architecture using Apache Kafka or Google Cloud Pub/Sub CDC.",
    impact: "Syncs internal cache instantly with Spanner database updates in under 20ms.",
    implementation: [
      "When a seat is booked or reservation details are locked, a write event is dispatched to Spanner.",
      "Spanner Debezium CDC listener intercepts the transaction log and fires a lightweight invalidation signal.",
      "Redis handles targeted key deletion (DEL schema:flight_route:*) rather than costly global cache flushes."
    ]
  },
  {
    title: "Active Pre-Warming & Trend Analysis",
    strategy: "Predictive background warming of popular route grids during off-peak windows.",
    impact: "Eliminates 'cold start' latency spikes for morning travelers, pre-emptively solving 80% of morning queries.",
    implementation: [
      "ML pipelines analyze user search patterns and isolate top flight trends for the upcoming 48 hours.",
      "Scheduled Celery/Go workers pre-fetch Amadeus GDS rates for these top routes between 02:00-04:00 AM.",
      "Results are directly injected into ClickHouse and Redis layers, ensuring first-searches encounter 100% warm states."
    ]
  },
  {
    title: "Regional Replication & Multi-Cloud Mesh",
    strategy: "Active-Active regional database syncing using global Redis Enterprise networks.",
    impact: "Achieves sub-30ms global response times regardless of the user's geographical continent.",
    implementation: [
      "Redis instances are deployed in Frankfurt (EU-West), Singapore (Asia-Pacific), and Northern Virginia (US-East).",
      "Uses conflict-free replicated data types (CRDTs) to replicate session buffers in under 120ms cross-ocean.",
      "Local load-balancers automatically route ingress traffic to the geographically nearest cache nodes."
    ]
  },
  {
    title: "Optimized Binary Serialization & Compression",
    strategy: "Protocol Buffers and MessagePack serialization paired with Brotli algorithms.",
    impact: "Decreases memory consumption by 72%, directly reducing infrastructure spending and latency.",
    implementation: [
      "Replaces bulky, verbose JSON strings in Redis with high-performance binary Protocol Buffers.",
      "Compression algorithms are dynamically selected: Snappy is used for rapid cache reads (<1ms), while Brotli-11 is used for highly compressed CDN static assets.",
      "Decreases standard payload packet sizes, optimizing network throughput across low-bandwidth mobile connections."
    ]
  }
];
