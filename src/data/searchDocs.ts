export interface SearchStageDoc {
  id: string;
  name?: string;
  title: string;
  shortDesc: string;
  details: string;
  flowchart?: string;
  subsections: {
    name: string;
    description: string;
    technicalDetails: string[];
  }[];
}

export const SEARCH_STAGE_DOCS: SearchStageDoc[] = [
  {
    id: "search-flow",
    title: "1. End-to-End Search Orchestration Flow",
    shortDesc: "Comprehensive trace of a user's flight query from Edge HTTP ingress through multi-GDS parallel requests to streamed JSON responses.",
    flowchart: `[User Browser]
       │ (1) POST /api/v1/search/flights (Origin, Dest, Date, Class)
       ▼
[Cloudflare Edge CDN]
       │ (2) Rate Limiting & Edge Cache Lookup (L1 Cache)
       ▼
[FlySmart API Gateway]
       │ (3) Auth & Quota validation; JWT claims check
       ▼
[Search Orchestrator Microservice]
       │
       ├─── (4) Redis Cluster Query (L2 Regional Cache)
       │         ├── [Hit: Return results with fresh currency converter metrics]
       │         └── [Miss: Continue to Supplier Routing Engine]
       │
       ├─── (5) Partner Selection & Parallel API Router (GDS / LCCs)
       │         ├─── Sabre GDS Adapter (gRPC)  ───► [Sabre SOAP API]
       │         ├─── Amadeus GDS Adapter (gRPC) ──► [Amadeus JSON API]
       │         └─── LCC Direct NDC Adapter    ───► [Ryanair/Wizz NDC REST]
       │
       ├─── (6) Aggregator & Stream Normalization Node
       │         ├── Parse and unify XML/JSON schemas
       │         ├── Deduplicate identical flight codes
       │         └── Apply dynamic markups & currency translation
       │
       ├─── (7) Flight Ranking & Sorting Engine (Z-score + Click Affinities)
       ▼
[User Browser] (8) Chunked Server-Sent Events (SSE) Stream Render`,
    details: "The search orchestration pipeline is fully asynchronous and non-blocking, designed to minimize user perceived latency by utilizing Server-Sent Events (SSE) to stream search updates progressively. Rather than waiting for the slowest airline supplier to respond, results are pushed in multi-part chunks as fast as each adapter completes its cycle.",
    subsections: [
      {
        name: "Ingress & Edge Verification",
        description: "How incoming HTTP flight query descriptors are validated, authorized, and matched with tenant parameters.",
        technicalDetails: [
          "Cloudflare Edge intercepts queries, evaluating Web Application Firewall (WAF) parameters and geolocating origin requests.",
          "Gateway checks JWT signature and extracts passenger tier properties (Standard vs Premium) to resolve downstream SLA classes.",
          "Query sanitization: Airport IATA codes are matched against three-letter ISO configurations; flight dates are asserted against current UTC (date must be between current day and 362 days out)."
        ]
      },
      {
        name: "SSE Streaming Architecture",
        description: "Streaming chunked payload strategies to maintain low Time-To-First-Flight (TTFF) indexes.",
        technicalDetails: [
          "An HTTP 200 OK connection is established with Content-Type: text/event-stream.",
          "First Chunk (within 80ms): Emits regional schedules and cached itineraries matching query profiles.",
          "Subsequent Chunks (within 350ms - 1500ms): Streams live supplier inventories as fast as individual adapters return, with an incremental 'progress_factor' parameter."
        ]
      }
    ]
  },
  {
    id: "partner-routing",
    name: "Partner Selection & Parallel Requests",
    title: "2. Intelligent Partner Selection & Parallel Dispatching",
    shortDesc: "How the router dynamically selects which GDS or Low-Cost Carrier (LCC) NDC endpoints to hit, avoiding unnecessary external API costs.",
    flowchart: `           [Query: FRA -> JFK, Date: T-3 Days]
                         │
                         ▼
             [Partner Selection Node]
                         │
        ┌────────────────┴────────────────┐
        ▼ (Condition Checked)             ▼ (Condition Checked)
[Query Route in GDS Area?]         [Is route served by LCC?]
        │ YES                             │ YES
        ▼                                 ▼
[Enable Sabre & Amadeus adapters]   [Enable Ryanair NDC adapter]
        │                                 │
        └────────────────┬────────────────┘
                         ▼
       [Parallel Executor (Go Goroutines)]
        ├── Thread 1: Sabre GDS (Timeout 1200ms)
        ├── Thread 2: Amadeus GDS (Timeout 1200ms)
        └── Thread 3: Ryanair NDC (Timeout 800ms)`,
    details: "Each external GDS query costs the platform money (typically $0.02 to $0.04 per search). To prevent financial leakage, the Partner Selection module dynamically suppresses redundant provider queries if a route has low flight probabilities or is exclusively served by low-cost regional carriers.",
    subsections: [
      {
        name: "Dynamic Supplier Exclusion",
        description: "Dynamic heuristic rules blocking redundant GDS queries based on geographical routing classes.",
        technicalDetails: [
          "Static schedule lookup: Before initiating external queries, the system checks the local Spanner table 'flight_schedules' to verify which airlines actually operate on the requested route.",
          "Inter-continental routing: Excludes pure low-cost carrier (LCC) APIs like Ryanair, Hungarian Wizz Air, or easyJet for long-haul routes (e.g., LHR to LAX).",
          "Domestic European routes: Suppresses heavy-duty legacy GDS queries if local low-cost NDC connectors (e.g. EasyJet API) have historical flight occupancy exceeding 92% on that segment."
        ]
      },
      {
        name: "Parallel Dispatch Thread Pools",
        description: "Go Goroutines and context propagation models managing outbound network connections.",
        technicalDetails: [
          "For every selected supplier, a dedicated non-blocking thread/goroutine is spawned using Go 'context' namespaces.",
          "Outbound HTTP client calls utilize HTTP/2 keep-alive connection pools to eliminate TCP handshake delays (pre-warmed connections are kept active inside adapter pods).",
          "Context propagation: If the user cancels their search or leaves the webpage, the HTTP client context is cancelled instantly, triggering deep socket termination across all outbound supplier connections to conserve container bandwidth."
        ]
      }
    ]
  },
  {
    id: "timeout-fallbacks",
    name: "Timeout Handling & Fallbacks",
    title: "3. Resilient Timeout Handling & Fallback Strategies",
    shortDesc: "Mechanisms to protect the search engine against slow supplier API times, avoiding page hangs.",
    flowchart: `[Goroutine Outbound Dispatch]
       │
       ├─── Thread 1: Sabre API  ───► [Timeout Watchdog: 1200ms]
       │                                   │ (Exceeded)
       │                                   ▼
       │                             [Isolate Sabre] ──► [Fallback to L2 Redis Cache (Stale=True)]
       │
       └─── Thread 2: Ryanair API ──► [Timeout Watchdog: 800ms]
                                           │ (Completed in 400ms)
                                           ▼
                                     [Parse Success] ──► [Merge to Stream]`,
    details: "Airline booking engines are notoriously unstable, with network latencies frequently spiking above 5 seconds. FlySmart implements hard timeout boundaries on all outbound requests, ensuring a single slow supplier does not degrade the core user experience.",
    subsections: [
      {
        name: "Multi-Tiered Watchdog Clamps",
        description: "Enforcing SLA time windows across different supplier segments.",
        technicalDetails: [
          "Legacy GDS Clamps: Hard timeout set to 1200ms. If Sabre or Amadeus fails to respond within this window, the socket is severed and the search stream processes adjacent data.",
          "Low-Cost Carrier (LCC) Clamps: Hard timeout set to 800ms. Direct regional APIs have smaller network footprints and are isolated faster.",
          "Premium vs. Standard SLA: Standard users get a 1200ms maximum aggregate window to minimize server runtime costs; Premium membership search workflows can extend the wait window up to 1800ms if searching highly complex multi-city routes."
        ]
      },
      {
        name: "Dynamic Fallback Strategies",
        description: "Graceful degradation models when live lookups fail or time out.",
        technicalDetails: [
          "Stale-Cache Fallback: If a primary GDS timeout is triggered, the system retrieves cached itineraries from Redis or ClickHouse with an age up to 12 hours, marked with a UI visual indicator: 'Prices from 4 hours ago'.",
          "Consolidated Code-Share Fallback: If Lufthansa NDC fails, the system automatically checks co-operating code-share carrier results (e.g., United Airlines listings) to infer seat status parameters.",
          "Graceful Error Isolation: Failures of specific adapters increment regional circuit-breaker scores. If an adapter exceeds a 25% failure rate over 60 seconds, the gateway trips the circuit, routing all requests to stale caches for 30 seconds."
        ]
      }
    ]
  },
  {
    id: "normalization-dedup",
    name: "Normalization & Deduplication",
    title: "4. Schema Normalization & Duplicate De-confliction",
    shortDesc: "Translating disparate carrier taxonomy into unified JSON formats, resolving identical code-share listings.",
    flowchart: `[Raw Sabre XML (SOAP)]  ──────┐
                               ▼
[Raw Amadeus JSON (REST)] ───► [Normalization Adapters] ──► [Unified Flight JSON Object]
                               ▲
[Raw Ryanair JSON (NDC)] ──────┘
                               │
                               ▼
                    [Deduplication Processor]
                               │ Checks: Flight Number, Depart Time, Equipment
                               ▼
                     [Code-Share De-conflicter]
                               │ Keeps lowest base price; lists alternative operating carriers
                               ▼
                    [Dynamic Markups Engine]`,
    details: "A single physical aircraft flight is frequently marketed by multiple airlines under different flight numbers (code-sharing). Showing the same flight multiple times with varying prices looks unprofessional. The Normalization Engine de-conflicts and deduplicates these entries in real time.",
    subsections: [
      {
        name: "Data Normalization (Unified Schema)",
        description: "Translating SOAP/XML schemas into a unified, lightweight internal JSON schema.",
        technicalDetails: [
          "Unified IATA representation: All cabin classes are mapped to: ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST.",
          "Baggage specs normalization: Converts unstructured baggage text (e.g. '2PC', '23kg', 'Baggage Not Included') into a structured JSON configuration block: { 'checked_allowance_pcs': 2, 'checked_max_weight_kg': 23, 'carry_on_included': true }.",
          "Tax separation: Base fares, fuel surcharges (YQ/YR taxes), and airport service fees are split out to guarantee compliance with local pricing display laws."
        ]
      },
      {
        name: "Code-Share De-duplication Logic",
        description: "How identical physical journeys are identified and combined.",
        technicalDetails: [
          "Unique Flight Keys: For every flight segment, the system compiles a compound hash: hash(departure_airport + arrival_airport + departure_time_utc + airline_operating_carrier + flight_number).",
          "Code-Share Resolution: If different marketing airlines point to the same operating carrier key, the engine merges the rows. It preserves the lowest available price, while appending an array of marketing carriers as metadata: marketing_partners: ['LH', 'UA', 'AC'].",
          "Seat Inventory Allocation: De-confliction merges seat vacancy metrics, opting for the most conservative remaining seat count returned across provider APIs."
        ]
      }
    ]
  },
  {
    id: "ranking-sorting",
    name: "Ranking, Sorting & Pagination",
    title: "5. Multi-dimensional Ranking & Pagination Engine",
    shortDesc: "Sorting search results by value, duration, price, and affinity models, using cursor-based pagination.",
    flowchart: `[Raw Merged Flight Results]
           │
           ▼
[Dynamic Markups Calculation]  ──► [Apply user specific loyalty overrides]
           │
           ▼
[Ranking Scoring Filter]
           │ Calculates Value Score:
           │ S = w1 * (Price / MinPrice) + w2 * (Duration / MinDuration) + w3 * (Stops / MaxStops)
           ▼
[Affinity Profile Adjustment]  ──► [Boost preferred carriers/airports based on DB profile]
           │
           ▼
[Cursor-Based Paginated Array] ──► [Slice Page 1: Rows 0-19]`,
    details: "Simply sorting flights by 'cheapest' is no longer sufficient. FlySmart calculates a multi-dimensional 'Best Value' score (balancing price, duration, stopovers, and user historical affinities) to highlight the most relevant flights first.",
    subsections: [
      {
        name: "Value Score Algorithm",
        description: "Mathematical formulation of the platform's multi-criteria sorting parameters.",
        technicalDetails: [
          "Formula: Value_Score = (base_price * 0.5) + (total_duration_minutes * 0.3) + (stop_penalty_factor * 0.2) - (user_affinity_multiplier * 50).",
          "Stop Penalty: Non-stop flights get a penalty of 0; 1-stop flights add 120 points; 2+ stops add 360 points to the value score (lower scores rank higher in the 'Best' tab).",
          "Affinity Tuning: Users with active profiles indicating a preference for Lufthansa get a 5% ranking score boost on LH-operated itineraries."
        ]
      },
      {
        name: "State-free Pagination",
        description: "Enforcing cursor-based pagination models across streamed chunk records.",
        technicalDetails: [
          "To avoid maintaining massive server-side search states in memory, pagination uses a stateless cursor token.",
          "The cursor token is a base64 encoded JSON string: { 'search_id': 'sch_820a', 'offset': 20, 'checksum': 'abc102' }.",
          "When the client requests page 2, the orchestrator retrieves the compiled array from the Redis search cache, slices the subsequent 20 records, and dispatches them with minimal overhead."
        ]
      }
    ]
  },
  {
    id: "cache-topology",
    name: "Caching & Price Freshness",
    title: "6. Cache Topology, Warming & Freshness Protection",
    shortDesc: "Three-tier caching layout maximizing hit rates while preventing stale fare book errors.",
    flowchart: `[Search Query]
       │
       ├── Tier 1: Cloudflare Edge KV (TTL: 15s) ────► [Fastest response for high-volume scrapers]
       │
       ├── Tier 2: Redis Regional Cluster (TTL: 30m) ──► [Core search cache, sharded by route]
       │
       └── Tier 3: ClickHouse OLAP Archive (TTL: 7d) ──► [Historical aggregates, prediction model feed]
                                  ▲
                                  │ (Warming Pipeline)
                 [Kafka Event: booking.completed]
                                  │
                   [Update historical avg pricing]`,
    details: "To minimize expensive supplier API charges, FlySmart operates a high-performance three-tier caching system. This structure is paired with active background warming pipelines and transaction validations to ensure users rarely experience expired pricing at checkout.",
    subsections: [
      {
        name: "The Three-Tier Cache Layout",
        description: "Separation of concerns across localized, regional, and cold-storage caching buffers.",
        technicalDetails: [
          "Tier 1 (Edge): Cloudflare KV stores completed search result index packages for 15 seconds. Protects backend services from distributed scraping attacks on identical queries.",
          "Tier 2 (Regional): Redis Cluster caches normalized flight lists with adaptive TTL (30 minutes for flight dates within 7 days; up to 12 hours for schedules >30 days out).",
          "Tier 3 (Analytical): ClickHouse stores every search result permanently in compressed formats, powering historical trends analysis and machine learning prediction models."
        ]
      },
      {
        name: "Background Cache Warming Engine",
        description: "Proactive calculation of high-volume routes before users search them.",
        technicalDetails: [
          "A background cron daemon running on GKE analyzes ClickHouse search logs to identify the top 500 global travel corridors (e.g. LHR-JFK, FRA-CDG).",
          "During off-peak hours (01:00 to 04:00 UTC), the warming worker triggers silent low-priority queries via supplier connections to prepopulate Redis caches, boosting daytime cache hit rates to over 92%.",
          "Warming rates are dynamically throttled if airline APIs indicate quota limits are nearing exhaustion."
        ]
      },
      {
        name: "Price Freshness & Expiry Guard",
        description: "Validating fare status parameters before initiating checkout transactions.",
        technicalDetails: [
          "Double-Check Lock: When a user clicks 'Select Flight', the Pricing Service performs a lightweight live XML call to the supplier to verify that the seat class ('K' class) is still active at that specific fare.",
          "Dynamic Expiring Quotes: If the live recheck matches the cached search price, the system writes a signed Quote object to PostgreSQL valid for exactly 15 minutes, protecting the user from subsequent fare changes during checkout."
        ]
      }
    ]
  }
];
