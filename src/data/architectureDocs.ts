import { DocTab, ArchitectureNode } from "../types";

export const ARCHITECTURE_DOCS: DocTab[] = [
  {
    id: "overview",
    title: "System Topology & Domain Separation",
    subtitle: "High-level overview of domain isolation, microservices, and structural layers.",
    content: `### 1. Architectural Overview & Design Style
FlySmart is designed as a **decentralized, global-scale, event-driven flight search and travel intelligence platform**. It avoids the traditional monolithic bottlenecks of legacy travel search portals by employing a highly decoupled microservices architecture. 

The system leverages **Domain-Driven Design (DDD)** principles to enforce clean boundaries between core capabilities, enabling each domain to scale independently based on its specific transactional or analytical workload.

\`\`\`
                                  [ Global Anycast Edge (Cloudflare CDN) ]
                                                    |
                                                    v
                                      [ API Gateway Grid (Envoy Proxy) ]
                                                    |
          +-----------------------+-----------------+-----------------------+---------------------+
          |                       |                                         |                     |
          v                       v                                         v                     v
    [ Search Service ]     [ Pricing Engine ]                        [ Fare Stream Engine ]  [ Assister Service ]
      (Go Microservice)     (Go / Python ML)                         (Apache Flink Worker)   (Node / LLM Gateway)
          |                       |                                         |                     |
          +-----------+-----------+--------------------+--------------------+                     |
                      |                                |                                          |
                      v                                v                                          v
             [ Redis Cache Grid ]             [ Event Bus (Kafka) ]                      [ Spanner Sync Manager ]
                      |                                |                                          |
                      v                                v                                          v
             [ GDS Adapters Grid ]         [ Analytics & Clickstream ]                   [ Cloud Spanner (Global) ]
            (Amadeus/Sabre/NDC API)               (Bigtable DB)
\`\`\`

---

### 2. Core Service Boundaries (DDD Isolation)
To guarantee ultra-high performance and isolation, the platform is structured into five core subdomains:

#### A. Global Search & Aggregation Domain (Read-Heavy, Latency-Critical)
*   **Bounded Context:** Responsible for translating multi-city or round-trip search queries from users into optimized provider search batches.
*   **Service Engine:** Custom **Golang Search Service** configured to execute queries asynchronously across multiple Global Distribution Systems (GDS) and Low-Cost Carrier (LCC) NDC endpoints.
*   **Read Pattern:** It prioritizes the **L1 Edge Cache** and **L2 Redis Cache Cluster** first. If a cache miss occurs, it invokes the provider endpoints concurrently, parses results, normalizes the schema, and streams chunks back to the client using **HTTP Server-Sent Events (SSE)**.

#### B. Price Prediction & Historical Forecasting Domain (Compute-Heavy)
*   **Bounded Context:** Performs real-time pricing analysis and historical forecasting (e.g., "should I buy now or wait?").
*   **Service Engine:** **Python (FastAPI + TensorFlow)** worker grid that parses pricing data off the event stream.
*   **Storage Pattern:** Consumes historical search logs from **Google Cloud Bigtable** and feeds them into deep learning regression models. Predictions are cached in Redis with high TTLs (24h) since historical trends change slowly.

#### C. Mistake Fare & Anomaly Detection Domain (Stream-Heavy, Near-Real-Time)
*   **Bounded Context:** Instantly detects fat-finger airline mistakes or pricing anomalies to notify users before carriers correct them.
*   **Service Engine:** Distributed **Apache Flink** stateful stream processor.
*   **Algorithmic Engine:** Uses a continuous sliding-window outlier detection algorithm, calculating the Z-score and standard deviation of fares across specific route corridors in real-time. Alerts are pushed within 2.5 seconds to the Event Bus.

#### D. Flight Route Optimization & Recommendation Domain (Graph-Heavy)
*   **Bounded Context:** Synthesizes custom flight routings (virtual interlining) by combining legs from multiple non-partner airlines to construct cheaper trips.
*   **Service Engine:** Graph optimization service written in **Rust** utilizing a modified Dijkstra's pathfinding algorithm on cached route maps.

#### E. Travel Intelligence & AI Assistant Domain (AI-Powered Chat)
*   **Bounded Context:** Provides natural language itinerary planning, automated visa checks, and real-time flight disruption assistants.
*   **Service Engine:** **Node.js Gateway** integrating server-side **Gemini API** utilizing search-grounding and retrieval-augmented generation (RAG) to reference current airline regulations and real-time delay feeds.

---

### 3. API-First & Mobile-First Integration
*   **API-First Approach:** Every microservice communicates via standardized, strongly typed contracts. Internal communication uses **gRPC (Protocol Buffers)** for microsecond-level serialization. External communication (public developers, white-label partners) is exposed via **REST OpenAPI v3** or **GraphQL** endpoints through the API Gateway.
*   **Mobile-First Design:** Search payloads are compressed using **Brotli** and response schemas are highly pruned to send only visible flight legs first. Remaining legs (baggage details, seat layouts) are lazy-loaded via parallel endpoints to minimize initial mobile layout blocking.`
  },
  {
    id: "caching",
    title: "Multi-Tier Caching & Cost Strategy",
    subtitle: "How FlySmart achieves 92%+ cache hits to bypass expensive GDS provider queries.",
    content: `### 1. The Financial Problem of Meta-Search
Legacy GDS providers (Sabre, Amadeus, Travelport) charge search fees ranging from **$0.01 to $0.05 per API query**, depending on search volume and agreement tiers. At millions of daily queries, a naive search architecture that queries providers on every page search will run up **millions of dollars in daily API costs**, destroying profit margins.

FlySmart resolves this through a sophisticated **Multi-Tier Cache Hydration Engine** that intercepts 92%+ of duplicate or similar queries, dropping provider transactional overhead by **over 95%**.

---

### 2. Multi-Tier Cache Topology

#### Tier 1: Anycast Edge Cache (CDN Layer)
*   **Technology:** Cloudflare Workers KV & Edge Cache.
*   **SLA:** < 15ms.
*   **Mechanism:** Standard search requests (e.g., origin, destination, date, class) are hashed. If an identical search was made in the last 15 minutes, the complete compressed JSON response is returned immediately from the nearest edge CDN point of presence without hitting the origin API gateway.

#### Tier 2: Distributed Distributed Cache (Redis Cluster)
*   **Technology:** Managed GCP Memorystore for Redis (Active-Active Replication across 3 regions).
*   **SLA:** < 3ms.
*   **Mechanism:** If Tier 1 misses, the query hits the API Gateway which queries the central Redis Cache. Redis stores parsed, normalized flight search results with an adaptive Time-To-Live (TTL).
*   **Adaptive TTL Algorithm:** 
    *   *Departure Date > 30 Days:* 12-Hour TTL (fares change slowly).
    *   *Departure Date 7-30 Days:* 4-Hour TTL.
    *   *Departure Date < 7 Days:* 30-Minute TTL (fares change rapidly near flight date).

#### Tier 3: Transactional Inventory (Cloud Spanner / Cloud SQL)
*   **Technology:** Global Cloud Spanner.
*   **SLA:** < 10ms.
*   **Mechanism:** Stably stores active booking details, custom user itineraries, loyalty points, and confirmed itineraries. This is the source-of-truth datastore requiring strict transactional ACID properties.

---

### 3. Asynchronous Cache Hydration & Prediction
To keep cached data fresh without forcing users to wait for live provider lookups during a cache miss, FlySmart uses **Predictive Hydration Workers**:

1.  **Search Stream Logging:** Every query is written to **Apache Kafka**.
2.  **Popularity Clustering:** A background service analyzes which routes and dates are being searched most frequently.
3.  **Background Hydration:** Pre-emptively sends low-priority, throttled batch queries to GDS providers during off-peak hours to hydrate Redis with upcoming travel windows (e.g., "Holiday Weekend" periods).
4.  **Instant-Decline TTL:** When flights sell out, airlines push NDC availability update events over WebSockets. The Event Consumer instantly purges or updates the respective Redis cache keys, ensuring search accuracy without stale inventory.`
  },
  {
    id: "scalability",
    title: "Global Scalability & Deployment",
    subtitle: "Active-Active multi-region deployment, Kubernetes grids, and Cloud Spanner integration.",
    content: `### 1. Global Active-Active Deployment
FlySmart operates on a global, multi-region architecture deployed across three principal geographic hubs: **us-central1 (Iowa)**, **europe-west3 (Frankfurt)**, and **asia-east1 (Taiwan)**. This layout ensures minimal network roundtrip times for travelers worldwide.

\`\`\`
       [ User in London ]                                           [ User in Tokyo ]
               |                                                            |
       (DNS Georouting)                                             (DNS Georouting)
               v                                                            v
     [ Edge: europe-west3 ]                                       [ Edge: asia-east1 ]
               |                                                            |
     +---------+---------+                                        +---------+---------+
     |                   |                                        |                   |
     v                   v                                        v                   v
 [ GKE App Node ]   [ Redis L2 Cache ]                        [ GKE App Node ]   [ Redis L2 Cache ]
     |                   |                                        |                   |
     +---------+---------+                                        +---------+---------+
               |                                                            |
               +----------------------------+  +----------------------------+
                                            v  v
                                 [ Cloud Spanner Database ]
                              (Global ACID Multi-Region Sync)
\`\`\`

---

### 2. Infrastructure Technologies

#### A. Container Orchestration: Google Kubernetes Engine (GKE)
*   Each region hosts a dedicated, auto-scaling GKE autopilot cluster.
*   Microservices are deployed in Docker containers. Auto-scaling is managed via **Horizontal Pod Autoscalers (HPA)** using custom Prometheus metrics:
    *   Search Services auto-scale based on **inflight search connections**.
    *   Fare Stream processors scale based on **Kafka partition lag**.

#### B. Storage: Google Cloud Spanner
*   To prevent double-booking issues or split-brain conditions across global database instances, FlySmart utilizes **Google Cloud Spanner**.
*   Spanner provides **external consistency (ACID)** at global scale, utilizing synchronized GPS atomic clocks (TrueTime API). 
*   This removes the need for complex, bug-prone distributed locking mechanisms when validating seat reservation inventories.

#### C. Message Bus: Apache Kafka (Confluent Cloud)
*   Serves as the high-throughput nervous system of the company.
*   Handles **100,000+ events per second** (search requests, user clicks, real-time airline flight changes).
*   Kafka topics are split by geographic region and consumer groups process messages asynchronously to update cache matrices, recalculate price predictions, and run fraud checks.

---

### 3. Failover & Disaster Recovery (DR) Strategy
*   **Anycast IP Routing:** If an entire cloud region suffers an outage (e.g., severe weather in europe-west3), DNS routers dynamically redirect traffic to the nearest healthy region (us-central1) in under 2 seconds.
*   **Database Survivability:** Cloud Spanner clusters are configured in a multi-region configuration with 3 read-write replicas and 2 witness nodes. The database can survive a complete regional loss with zero data loss (**RPO = 0**) and sub-second automatic failover (**RTO < 5s**).
*   **Degraded Search Mode:** If a core GDS integration goes down, the platform automatically switches to a "Cached-Only" state for that provider, clearly showing the user that the shown fare is a cached estimate, rather than throwing a system-wide error.`
  },
  {
    id: "techstack",
    title: "Technology Selection & Comparison Matrices",
    subtitle: "Under-the-hood analysis of technology selections vs alternatives and architectural justifications.",
    content: `### 1. Technology Selection Matrix
The architectural decisions of FlySmart are strictly driven by performance, concurrency capability, and cost-efficiency. Below is the official decision framework:

| Domain | Selected Technology | Alternative Considered | Primary Architectural Rationale for Selection |
| :--- | :--- | :--- | :--- |
| **Search Engine** | **Golang** | Java / Node.js | Golang excels at highly concurrent, network-bound workloads with tiny memory footprints and zero garbage-collection pauses. Ideal for parallel HTTP NDC provider queries. |
| **Global DB** | **Cloud Spanner** | Amazon Aurora Global | Spanner offers true horizontal write scalability globally with strict external consistency, bypassing Aurora's write-master bottleneck. |
| **Event Streaming** | **Apache Kafka** | RabbitMQ / SQS | Kafka supports persistent replayable log offsets and high partition throughput, which is vital for historical price analysis and streaming 100k events/sec. |
| **Stream Analytics**| **Apache Flink** | Apache Spark Streaming | Flink provides true sub-millisecond event-by-event processing. Spark is batch-oriented, making it too slow for immediate mistake fare detection. |
| **Cache Layer** | **Redis Cluster** | Memcached | Redis provides advanced native data structures (hashes, sorted sets, geospatial indexing) which are necessary for complex flight route indexes. |
| **AI Assistant** | **Gemini 3.5 Flash** | GPT-4o-mini / Llama 3 | Gemini 3.5 Flash provides extreme context windows (up to 2M tokens) and native multi-modal support, crucial for parsing multi-page visa rules and travel documents. |

---

### 2. Architectural Deep-Dives

#### Golang vs Node.js for Search & Parsing
When search queries are received, FlySmart needs to spawn up to **50 parallel outbound HTTP requests** to different LCC and GDS APIs, parse deeply-nested XML or JSON strings, and merge them into a single response. 
*   While Node.js is excellent for general asynchronous requests, its single-threaded nature causes significant CPU bottlenecks during heavy JSON/XML parsing at high scale. 
*   Golang's native goroutines allocate a mere **2KB of stack space** per routine, permitting the system to handle millions of simultaneous parser threads without thread context-switching overhead.

#### Why Cloud Spanner instead of PostgreSQL Replication?
In a global flight booking scenario, a customer in Frankfurt and another in Tokyo might try to purchase the exact last seat on a flight from London to New York at the exact same millisecond. 
*   Traditional PostgreSQL with read-replicas requires writing to a single primary database (e.g., in US-East) and replicating to Asia and Europe. This introduces a **150ms lag**, creating a high risk of double-bookings.
*   Cloud Spanner resolves this using multi-region synchronous commits powered by GPS clocks, guaranteeing that a seat is locked globally with absolute consistency, preventing downstream transaction failures.`
  },
  {
    id: "future",
    title: "Future Expansion & Roadmap",
    subtitle: "Strategic progression path to evolve FlySmart into a complete travel ecosystem.",
    content: `### 1. Phased Architecture Evolution
FlySmart is architected from day one to grow from a flight intelligence platform into a comprehensive travel companion ecosystem without requiring massive re-writes.

\`\`\`
 [Phase 1: Flights] ---> [Phase 2: Lodging & Cars] ---> [Phase 3: Visa & Insurance] ---> [Phase 4: B2B API Hub]
   - Cache Hydration       - Multi-Inventory Sync        - Grounding Assistants          - Tenant Isolation
   - Mistake Fares         - Geospatial Redis Hash       - Partner Affiliate Links       - Multi-Billion Scale
\`\`\`

---

### 2. Strategic Milestones

#### Phase 1: Core Flight Platform (Current State)
*   **Objectives:** Establish the L1/L2 global cache strategy, Golang concurrent search worker grid, and Apache Flink mistake fare engine.
*   **KPIs:** Cache hit ratio > 92%, average search response latency < 150ms, mistake fare detection lag < 3 seconds.

#### Phase 2: Lodging & Car Rentals (Q3 2026)
*   **Structural Additions:** Create a **Lodging microservice** and a **Geospatial Indexing service** inside Redis (utilizing \`GEOADD\` and \`GEORADIUS\` commands) to match hotels and car pickup locations within specific radii of airports.
*   **Database Integration:** Since hotel rates do not fluctuate on a second-by-second basis like flights, hotel pricing caches will employ a longer 24-Hour TTL, further minimizing provider lookup overheads.

#### Phase 3: Visa Check & Travel Insurance Integration (Q1 2027)
*   **AI Grounding Additions:** Deploy **Gemini-3.1-pro-preview** agent pipelines mapped with Google Search Grounding to scrape real-time consulate travel advisories and passport-visa regulations.
*   **B2B Affiliate Service:** Introduce a rule-based matching service to present custom-tailored travel insurance options based on the weather forecasts and geopolitical risk profiles of destination coordinates.

#### Phase 4: B2B Partner Integrations & White-Label Platform (Q4 2027)
*   **SaaS Layer Integration:** Construct an enterprise-tier **Tenant Management Service**.
*   **Architectural Separation:** External tenants will be assigned API keys which route through a specialized **API Gateway Policy Hub** enforcing multi-tier rate-limiting (e.g., Basic tenant: 100 QPS, Enterprise tenant: 10000 QPS).
*   **B2B billing stream:** Kafka will stream B2B analytics logs directly to an auto-scaling data warehouse (BigQuery) for billing and monetization reports.`
  }
];

export const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: "edge",
    label: "Global Anycast CDN",
    category: "ingress",
    description: "Multi-region distributed edge content delivery network routing global user requests to the closest physical server, serving static resources, and handling Tier 1 cached search responses.",
    techStack: "Cloudflare Workers KV / Edge HTML",
    latencySLA: "< 15 ms",
    scaleCapacity: "10,000,000+ concurrent users",
    failoverPlan: "Automatic dynamic IP failover with border gateway protocol routing.",
    x: 400,
    y: 60
  },
  {
    id: "apigateway",
    label: "API Gateway Grid",
    category: "ingress",
    description: "Centrally manages external requests, validating OAuth tokens, rate-limiting B2B partners, compression (Brotli), and routing requests to internal microservices via gRPC.",
    techStack: "Envoy Proxy / Envoy WASM / Kong",
    latencySLA: "< 2 ms",
    scaleCapacity: "500,000 requests per second",
    failoverPlan: "Active-Active regional gateway load balancers with health-checking endpoints.",
    x: 400,
    y: 150
  },
  {
    id: "searchservice",
    label: "Golang Search Engine",
    category: "service",
    description: "The core computational engine of the search pipeline. Orchestrates parallel asynchronous requests to multiple airline NDC endpoints and global distribution systems (Sabre/Amadeus) on a cache miss.",
    techStack: "Golang / gRPC / Protobuf",
    latencySLA: "< 80 ms (Cache Hit), < 1800 ms (Cache Miss)",
    scaleCapacity: "100,000 concurrent parser threads",
    failoverPlan: "Auto-scaling GKE pod replica replication across 3 separate availability zones.",
    x: 180,
    y: 260
  },
  {
    id: "pricingengine",
    label: "AI Price Predictor",
    category: "service",
    description: "Analyzes real-time fare trends and applies deep learning algorithms on historical big data logs to recommend whether a user should book flights immediately or wait for price drops.",
    techStack: "Python / FastAPI / TensorFlow",
    latencySLA: "< 45 ms",
    scaleCapacity: "2,500 inference operations per second",
    failoverPlan: "Fallback to simplified local heuristics algorithm if AI GPU grid experiences outage.",
    x: 330,
    y: 260
  },
  {
    id: "farestream",
    label: "Mistake Fare Stream",
    category: "service",
    description: "Stateful stream processing worker that monitors active flight search results to calculate outlier Z-scores and instantly trigger alert notifications when anomaly rates indicate a fare mistake.",
    techStack: "Apache Flink / Java / Stream API",
    latencySLA: "< 5 ms processing latency",
    scaleCapacity: "150,000 events analyzed per second",
    failoverPlan: "Restart from persistent RocksDB checkpoints with zero loss of window state.",
    x: 480,
    y: 260
  },
  {
    id: "assistant",
    label: "AI Itinerary Planner",
    category: "service",
    description: "Provides natural-language travel support, complex itinerary creation, automated visa validations, and cancellation flight change rebooking solutions.",
    techStack: "Node.js / Express / Gemini-3.5-flash / Search Grounding",
    latencySLA: "Streamed responses under 100ms first-chunk",
    scaleCapacity: "50,000 parallel conversational threads",
    failoverPlan: "Fallback to deterministic rule-based FAQ matrix on API key exceptions.",
    x: 630,
    y: 260
  },
  {
    id: "rediscluster",
    label: "Redis Cache Grid (L2)",
    category: "storage",
    description: "Centrally stores parsed and unified flight listings with adaptive TTLs. Serves as the primary barrier preventing heavy, redundant billing from GDS search API providers.",
    techStack: "Memorystore for Redis / Active-Active Clusters",
    latencySLA: "< 1.5 ms read latency",
    scaleCapacity: "4.5 TB multi-tenant memory cache pool",
    failoverPlan: "Master-replica fast failover (under 1 second) with cross-region replication.",
    x: 180,
    y: 380
  },
  {
    id: "kafka",
    label: "Apache Kafka Log Bus",
    category: "event",
    description: "The global real-time event pipeline linking all microservices. Publishes clickstream analytics, pricing events, mistake alerts, and search log records for analytical ingestion.",
    techStack: "Kafka Core / Confluent / Zookeeperless Mode",
    latencySLA: "< 4 ms persistence delay",
    scaleCapacity: "2,000,000 persistent messages per second",
    failoverPlan: "Triple partition replication (min.insync.replicas=2) with automated broker election.",
    x: 400,
    y: 380
  },
  {
    id: "spannersync",
    label: "Database Sync Manager",
    category: "storage",
    description: "Handles distributed transactional operations, synchronizing confirmed flight reservations, B2B user credit transactions, and personal traveler itineraries.",
    techStack: "Cloud Spanner / Java Transaction Sync",
    latencySLA: "< 10 ms global commit delay",
    scaleCapacity: "10,000 global transactions per second",
    failoverPlan: "5-way regional database replica failover with TrueTime GPS synchronization.",
    x: 630,
    y: 380
  },
  {
    id: "providergds",
    label: "GDS & LCC NDC Adapters",
    category: "external",
    description: "Normalizes incoming and outgoing SOAP/XML and JSON API structures from legacy Sabre/Amadeus and modern direct airline interfaces into a single strongly-typed schema.",
    techStack: "Golang Adapter Modules / XML-JSON Serializers",
    latencySLA: "Subject to external API network (typically 1200ms - 3000ms)",
    scaleCapacity: "Dynamic client pool allocation",
    failoverPlan: "Circuit breaker pattern with exponential backoff; switch to cache-only mock fallback.",
    x: 180,
    y: 490
  },
  {
    id: "bigtable",
    label: "Historical Bigtable Logs",
    category: "storage",
    description: "Hosts billions of rows of flight searches and pricing data points, providing rapid sequential read access to feed prediction models with history patterns.",
    techStack: "GCP Cloud Bigtable / SSTable Indexes",
    latencySLA: "< 9 ms query speed",
    scaleCapacity: "800 TB of analytical storage",
    failoverPlan: "SSTable replication across 3 separate geographic GCP storage areas.",
    x: 400,
    y: 490
  }
];
