export interface MicroserviceDoc {
  id: string;
  name: string;
  context: string;
  purpose: string;
  responsibilities: string[];
  restEndpoints: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    description: string;
    payload?: string;
    response?: string;
  }[];
  graphqlSchema: string;
  grpcInterfaces: string[];
  dbOwnership: {
    technology: string;
    description: string;
    tables: string[];
  };
  eventsPublished: string[];
  eventsConsumed: string[];
  scalingStrategy: string;
  deploymentStrategy: string;
  healthChecks: {
    livenessPath: string;
    readinessPath: string;
    startupTimeout: string;
  };
  monitoring: string[];
  caching: {
    technology: string;
    strategy: string;
    ttl: string;
  };
  security: string[];
  rateLimiting: string;
  failureHandling: string;
  retryStrategy: string;
}

export const MICROSERVICES_DOCS: MicroserviceDoc[] = [
  {
    id: "identity-service",
    name: "Identity & Session Manager Service",
    context: "Authentication Context",
    purpose: "Handles user onboarding, OAuth 2.1 authentication flow, security assertions, and real-time session tracking.",
    responsibilities: [
      "Manage client-cred exchanges and issue JWT authorization tokens.",
      "Support hardware passkeys (WebAuthn) and multi-factor authenticator enrollment.",
      "Verify and sign secure JSON Web Keys (JWKS).",
      "Revoke malicious or compromised sessions instantly."
    ],
    restEndpoints: [
      {
        method: "POST",
        path: "/api/v1/identity/users/register",
        description: "Creates a new user profile and triggers validation email flows.",
        payload: '{ "email": "traveler@domain.com", "password": "argon2_hash_base64", "device_fingerprint": "df_829fa" }',
        response: '{ "user_id": "usr_902ab...", "status": "pending_verification" }'
      },
      {
        method: "GET",
        path: "/api/v1/identity/.well-known/jwks.json",
        description: "Exposes active cryptographically-signed public keys for edge JWT token verifications.",
        response: '{ "keys": [{ "kty": "RSA", "kid": "key_v1", "n": "modulus_string", "e": "AQAB" }] }'
      }
    ],
    graphqlSchema: `type User {
  id: ID!
  email: String!
  status: String!
  createdAt: String!
}

extend type Query {
  me: User
}`,
    grpcInterfaces: [
      "rpc VerifyToken (VerifyTokenRequest) returns (VerifyTokenResponse);",
      "rpc RevokeSession (RevokeSessionRequest) returns (RevokeSessionResponse);"
    ],
    dbOwnership: {
      technology: "PostgreSQL (Cloud SQL, Citus-sharded on user_id)",
      description: "Stores credential hashes, salt arrays, device fingerprints, and active OAuth authorization states.",
      tables: ["auth_users", "auth_sessions", "oauth_authorizations"]
    },
    eventsPublished: [
      "auth.user.login.succeeded",
      "auth.user.account.locked",
      "auth.session.revoked"
    ],
    eventsConsumed: [
      "fraud.suspicious_activity.detected"
    ],
    scalingStrategy: "Horizontal scaling via KEDA (Kubernetes Event-driven Autoscaling) tracking inbound HTTP request counts and active TCP socket connections (HPA thresholds set at 80% CPU or 1500 concurrent requests).",
    deploymentStrategy: "Canary rollouts on GKE utilizing Argo Rollouts. Traffic shifts dynamically: 10% -> 25% -> 50% -> 100% over a 4-hour window, backed by Prometheus-driven automated rollback on latency degradation.",
    healthChecks: {
      livenessPath: "/healthz/liveness",
      readinessPath: "/healthz/readiness",
      startupTimeout: "15s"
    },
    monitoring: [
      "Total active token counts (Prometheus metric: identity_active_tokens)",
      "Authentication latency distributions parsed by device types",
      "Failed authorization attempt ratios (triggering automated security alarms on anomaly threshold spikes)"
    ],
    caching: {
      technology: "Redis Cluster (GCP Memorystore, in-memory)",
      strategy: "Write-through caching of active session states and verification codes.",
      ttl: "Session TTL matches 15-minute access token windows, utilizing background slide updates."
    },
    security: [
      "Strict encryption-at-rest for MFA secrets utilizing envelope key models (Google Cloud KMS).",
      "Credential storage parameterized with memory-hard Argon2id hash derivations.",
      "Transport layer protection strictly enforced via TLS 1.3 only."
    ],
    rateLimiting: "IP-based bucket limits set at 5 logins per minute for standard clients, backed by custom Cloudflare WAF credential stuffing protections.",
    failureHandling: "Fallback to edge-cached session assertions inside Cloudflare KV if primary PostgreSQL database instances experience localized latency spikes.",
    retryStrategy: "Exponential backoff on authentication-token verification calls: initial interval of 100ms, backoff multiplier of 2.0, max retries set to 3."
  },
  {
    id: "search-orchestrator",
    name: "Flight Search Orchestrator Service",
    context: "Flight Search Context",
    purpose: "Handles flight lookup queries by coordinating parallel sub-queries across multiple GDS and direct airline NDC adapters.",
    responsibilities: [
      "Orchestrate parallel outbound HTTP searches with sub-second aggregate merges.",
      "De-duplicate repeating flights and normalize booking taxonomy across suppliers.",
      "Check regional edge cache layers to prevent redundant supplier charges."
    ],
    restEndpoints: [
      {
        method: "GET",
        path: "/api/v1/search/flights",
        description: "Primary high-performance flight search endpoint supporting streamed Server-Sent Events.",
        payload: "?origin=FRA&destination=JFK&departure_date=2026-07-15",
        response: "[SSE Stream Content containing parsed flight itineraries]"
      }
    ],
    graphqlSchema: `type FlightItinerary {
  id: ID!
  carrier: String!
  price: Float!
  segments: [Segment!]!
}

type Query {
  searchFlights(origin: String!, destination: String!, date: String!): [FlightItinerary!]!
}`,
    grpcInterfaces: [
      "rpc GetSchedules (ScheduleRequest) returns (ScheduleResponse);",
      "rpc WarmRouteCache (WarmCacheRequest) returns (WarmCacheResponse);"
    ],
    dbOwnership: {
      technology: "Google Cloud Spanner (Global schedule indexing)",
      description: "Maintains consolidated worldwide operating schedules, aircraft details, and airport routing coordinates.",
      tables: ["flight_schedules", "airports", "aircraft_types"]
    },
    eventsPublished: [
      "search.query.submitted",
      "search.results.synthesized"
    ],
    eventsConsumed: [
      "pricing.cache.invalidated"
    ],
    scalingStrategy: "Scales on CPU utilization and incoming HTTP request queue depths via GKE Horizontal Pod Autoscaler (HPA targets 70% average CPU usage). Uses spot instances for parsing grids.",
    deploymentStrategy: "Blue-Green deployment on GKE. Keeps secondary live cluster fully pre-warmed to guarantee zero-packet search losses during active operational switches.",
    healthChecks: {
      livenessPath: "/healthz",
      readinessPath: "/ready",
      startupTimeout: "25s"
    },
    monitoring: [
      "Aggregate cache hit rates tracking L1 vs L2 vs L3 (Target: >94%)",
      "Parallel GDS adapter timeout statistics (Prometheus metric: search_adapter_timeouts)",
      "Total search-to-book funnel transition ratios"
    ],
    caching: {
      technology: "Multi-tier Cache (Cloudflare KV + Redis Cluster)",
      strategy: "Read-through caching for identical route queries.",
      ttl: "Adaptive TTL: 30 minutes for near flight dates (<7 days), extending up to 12 hours for schedules >30 days out."
    },
    security: [
      "Encryption of private user search parameters in transit via TLS 1.3.",
      "Strict sanitization of GDS endpoints credentials utilizing short-lived Vault variables."
    ],
    rateLimiting: "Enforced at API Gateway: basic clients limited to 60 searches per minute; partner API allocations dynamically set via DB configuration quotas.",
    failureHandling: "Circuit-breaker isolates failing GDS adapters, falling back automatically to local cache buffers or adjacent supplier NDC options without erroring the user search session.",
    retryStrategy: "No retries on live GDS search calls to prevent cascading downstream queue exhaustion. Local database lookups retry twice using jittered intervals."
  },
  {
    id: "pricing-service",
    name: "Fare Pricing & Quote Service",
    context: "Pricing Context",
    purpose: "Calculates live ticket prices, tax markups, currency conversions, and issues locked ticket quotes during checkouts.",
    responsibilities: [
      "Compute precise taxes and booking engine markups based on ticket categories.",
      "Issue 15-minute price guarantees (Quotes) preventing checkout rate changes.",
      "Re-verify flight seat class availabilities with provider adapters before issuing quotes."
    ],
    restEndpoints: [
      {
        method: "POST",
        path: "/api/v1/pricing/quotes/create",
        description: "Creates and seals a guaranteed price quote valid for 15 minutes.",
        payload: '{ "itinerary_id": "it_a901f", "cabin_class": "economy", "currency": "EUR" }',
        response: '{ "quote_id": "qte_9821f", "total_price": 505.50, "expires_at": "2026-06-28T04:15:00Z" }'
      }
    ],
    graphqlSchema: `type PriceQuote {
  id: ID!
  baseFare: Float!
  taxes: Float!
  currency: String!
  expiresAt: String!
}

extend type Mutation {
  createQuote(itineraryId: ID!, class: String!): PriceQuote!
}`,
    grpcInterfaces: [
      "rpc GetLiveQuote (QuoteRequest) returns (QuoteResponse);",
      "rpc ValidateQuoteStatus (ValidateRequest) returns (ValidateResponse);"
    ],
    dbOwnership: {
      technology: "PostgreSQL (Cloud SQL, multi-region replication)",
      description: "Stores pricing rules, airline surcharge guidelines, active price lock registries, and daily currency conversion rates.",
      tables: ["fare_rules", "airline_surcharges", "currency_exchange_rates"]
    },
    eventsPublished: [
      "pricing.fare.locked",
      "pricing.quote.expired"
    ],
    eventsConsumed: [
      "booking.state.completed",
      "booking.state.failed"
    ],
    scalingStrategy: "Horizontal Pod Autoscaler (HPA) targeting memory-intensive JVM or Go metrics (triggering pod scaling on 80% RAM allocations to handle large in-memory tax matrices).",
    deploymentStrategy: "Canary rollouts (5% incremental progression with a 2-hour stabilization delay) utilizing Istio service mesh traffic-shifting rules.",
    healthChecks: {
      livenessPath: "/health/live",
      readinessPath: "/health/ready",
      startupTimeout: "20s"
    },
    monitoring: [
      "Active price lock volume counts (Prometheus metric: pricing_active_locks)",
      "Quote-to-booking conversions tracking percentage efficiency",
      "Dynamic currency conversion calculation delay metrics"
    ],
    caching: {
      technology: "Redis Cluster (Local cache shards)",
      strategy: "Write-through caching of daily dynamic exchange rates.",
      ttl: "60 minutes for active exchange parameters; zero cache for transactional ticket quotes."
    },
    security: [
      "HMAC-SHA256 signature verifications on quote responses to prevent browser pricing hacks.",
      "Secure isolation of tax calculations parameters inside memory-locked processes."
    ],
    rateLimiting: "120 pricing quotes calculations per user IP per hour to protect downstream airline systems from scraping bots.",
    failureHandling: "Fallback to the last successfully calculated base rate + a defensive safety margin multiplier (+5%) if provider inventory systems exhibit transient errors.",
    retryStrategy: "Standard retry loop of 3 iterations utilizing random jitter parameters: initial delay 150ms, jitter index 0.5."
  },
  {
    id: "price-prediction-service",
    name: "Historical Predictor & Anomaly Service",
    context: "Price Prediction Context",
    purpose: "Analyzes trailing fare aggregates, generates 'buy or wait' recommendation verdicts, and flags mistake flight fares.",
    responsibilities: [
      "Generate price prediction curves utilizing deep regression models.",
      "Execute real-time sliding-window Z-score calculations over active fare search results.",
      "Publish mistake fare indicators to notifications queues in under 3 seconds."
    ],
    restEndpoints: [
      {
        method: "GET",
        path: "/api/v1/prediction/routes/forecast",
        description: "Retrieves price forecast parameters, typical ranges, and buy-wait suggestions.",
        payload: "?origin=FRA&destination=JFK&departure_date=2026-07-15",
        response: '{ "recommendation": "WAIT", "confidence": 0.88, "typical_price": 550.00, "forecasted_price_drop_eta": "2026-07-02" }'
      }
    ],
    graphqlSchema: `type ForecastResponse {
  verdict: String!
  confidence: Float!
  priceTrend: [PricePoint!]!
}

type PricePoint {
  date: String!
  amount: Float!
}

extend type Query {
  getForecast(origin: String!, destination: String!): ForecastResponse
}`,
    grpcInterfaces: [
      "rpc PredictRouteTrend (PredictRequest) returns (PredictResponse);",
      "rpc CheckAnomalyFare (AnomalyRequest) returns (AnomalyResponse);"
    ],
    dbOwnership: {
      technology: "ClickHouse (Columnar Big Data storage)",
      description: "Stores historical airline search results, pricing aggregations, flight trends, and anomaly records.",
      tables: ["route_price_aggregates", "historical_flight_trends", "anomaly_records"]
    },
    eventsPublished: [
      "prediction.anomaly.detected",
      "prediction.forecast.updated"
    ],
    eventsConsumed: [
      "search.query.submitted",
      "search.results.synthesized"
    ],
    scalingStrategy: "Autoscaling GPU pools on GKE based on deep learning model prediction queue depths via KEDA metrics (scales GPU nodes from 0 to 8 during daytime peak searches).",
    deploymentStrategy: "Shadow deployments (running new prediction models alongside production systems to validate predictions drift and accuracy metrics before routing live user sessions).",
    healthChecks: {
      livenessPath: "/health/liveness",
      readinessPath: "/health/readiness",
      startupTimeout: "60s"
    },
    monitoring: [
      "Prediction models mean absolute error (MAE) ratios",
      "Apache Flink stream event processing delays (Kafka to Flink lag)",
      "GPU core temperature and CUDA engine allocations"
    ],
    caching: {
      technology: "Redis Cluster + Cloud Storage",
      strategy: "Read-through caching for generated 12-month prediction curves.",
      ttl: "24-hour TTL, as historical patterns update on batch offline schedules."
    },
    security: [
      "Isolation of the Python machine learning environments in sandboxed container profiles.",
      "Network routing policies blocking direct outbound internet access from prediction grids."
    ],
    rateLimiting: "Rate limited to 300 prediction inquiries per user session per day to avoid denial-of-service on machine learning grids.",
    failureHandling: "Fallback to linear regression algorithms or simple trailing average charts if the deep-learning model servers experience hardware failures.",
    retryStrategy: "Single retry with immediate failover to secondary GKE GPU node cluster pools."
  },
  {
    id: "booking-orchestrator",
    name: "Booking & Orders Orchestrator",
    context: "Booking Context",
    purpose: "Maintains booking lifecycles, handles ticket passenger documentation, and runs Distributed Saga workflows during flight ticket purchases.",
    responsibilities: [
      "Orchestrate transactional seat reservation and payment captures using Saga Patterns.",
      "Build Passenger Name Records (PNR) via supplier integrations.",
      "Process flight adjustments, cancellation rules, and refund requests."
    ],
    restEndpoints: [
      {
        method: "POST",
        path: "/api/v1/bookings/ticket/create",
        description: "Initializes the ticket purchasing lifecycle under active price locks.",
        payload: '{ "quote_id": "qte_9821f", "passengers": [{ "passport_number": "EP1023", "name": "Alice" }] }',
        response: '{ "booking_id": "bkg_1029fa", "pnr": "ZP921A", "status": "reserved" }'
      }
    ],
    graphqlSchema: `type Booking {
  id: ID!
  pnr: String!
  status: String!
  totalAmount: Float!
  passengers: [Passenger!]!
}

type Passenger {
  name: String!
  passportNumber: String!
}

extend type Query {
  getBooking(id: ID!): Booking
}

extend type Mutation {
  cancelBooking(id: ID!): Boolean!
}`,
    grpcInterfaces: [
      "rpc GetBookingStatus (StatusRequest) returns (StatusResponse);",
      "rpc UpdateBookingState (StateUpdateRequest) returns (StateUpdateResponse);"
    ],
    dbOwnership: {
      technology: "Google Cloud Spanner (Global ACID Database)",
      description: "Authoritative repository for flight orders, reservation logs, and traveler itineraries. Syncs globally with TrueTime APIs.",
      tables: ["bookings", "passengers", "itinerary_legs", "booking_saga_logs"]
    },
    eventsPublished: [
      "booking.state.reserved",
      "booking.state.completed",
      "booking.state.failed",
      "booking.refund.processed"
    ],
    eventsConsumed: [
      "payment.charge.succeeded",
      "payment.charge.failed"
    ],
    scalingStrategy: "Manual floor scaling (min replicas=5) with CPU-based HPA rules (target 65% CPU) to prevent latency spikes during high-traffic ticket campaigns.",
    deploymentStrategy: "Strict rolling updates on GKE, allowing maximum 10% unavailable pods at any given time to protect in-flight checkout transactions.",
    healthChecks: {
      livenessPath: "/healthz/live",
      readinessPath: "/healthz/ready",
      startupTimeout: "15s"
    },
    monitoring: [
      "Saga checkout drop-off rates (Prometheus metric: booking_saga_failures)",
      "Average ticket issuance latency (Provider NDC API speed)",
      "Database read/write locks ratios"
    ],
    caching: {
      technology: "Redis Cluster (Ephemeral locks)",
      strategy: "Write-through caching of transient booking states.",
      ttl: "15 minutes, mapping directly to quote lock intervals."
    },
    security: [
      "Strict encryption-at-rest for passenger passport numbers utilizing AES-256 GCM envelopes.",
      "Access control assertions based on Open Policy Agent (OPA) attributes checking booking ownership."
    ],
    rateLimiting: "Limited to 10 active checkouts per user ID concurrently to protect system resources.",
    failureHandling: "Compensating transactions triggered automatically upon Saga failures: voids pending card captures and releases airline seat reservations.",
    retryStrategy: "Compensation steps utilize an 'infinite retry' model over Kafka with a dead-letter queue escalation to ensure ledger state consistency."
  },
  {
    id: "notification-service",
    name: "Multichannel Notification Engine",
    context: "Notifications Context",
    purpose: "Handles multichannel message dispatching (Email, SMS, Web Push, APNs, FCM) and respects user communications preferences.",
    responsibilities: [
      "Compile dynamic notification templates.",
      "Throttling and de-duplicating rapid-fire pricing alarms.",
      "Verify delivered notifications logs for compliance."
    ],
    restEndpoints: [
      {
        method: "PUT",
        path: "/api/v1/notifications/user/preferences",
        description: "Updates preference configurations for outgoing announcements.",
        payload: '{ "marketing_opt_in": false, "price_alerts_channel": "push", "flight_delays_channel": "sms" }',
        response: '{ "status": "updated_successfully" }'
      }
    ],
    graphqlSchema: `type NotificationPreference {
  userId: ID!
  smsEnabled: Boolean!
  emailEnabled: Boolean!
  pushEnabled: Boolean!
}

extend type Mutation {
  updatePreferences(userId: ID!, sms: Boolean!, email: Boolean!, push: Boolean!): NotificationPreference!
}`,
    grpcInterfaces: [
      "rpc SendDirectNotification (SendRequest) returns (SendResponse);",
      "rpc QueryUserPreferences (PrefRequest) returns (PrefResponse);"
    ],
    dbOwnership: {
      technology: "PostgreSQL (Cloud SQL, read replicas)",
      description: "Stores user contact points, communication rules, compiled notification templates, and dispatch audits.",
      tables: ["notification_logs", "user_notification_preferences", "message_templates"]
    },
    eventsPublished: [
      "notification.dispatch.sent",
      "notification.dispatch.failed"
    ],
    eventsConsumed: [
      "booking.state.completed",
      "prediction.anomaly.detected",
      "subscription.status.changed"
    ],
    scalingStrategy: "Scales dynamically on consumer queue lag metrics (using KEDA on Redis Streams to scale consumer pods up to 25 during major mistake fare events).",
    deploymentStrategy: "Canary rollouts on GKE utilizing Argo Rollouts to ensure notification dispatch grids do not drop messages during active system releases.",
    healthChecks: {
      livenessPath: "/health/live",
      readinessPath: "/health/ready",
      startupTimeout: "10s"
    },
    monitoring: [
      "Notification gateway delivery lag metrics",
      "Provider bounce and spam report ratios (Twilio, SendGrid API monitoring)",
      "Queue throughput velocities"
    ],
    caching: {
      technology: "In-memory LRU cache",
      strategy: "Local template file caching inside microservice memory footprints.",
      ttl: "60 minutes, updated on admin templates publication events."
    },
    security: [
      "Strict stripping of PII parameters (passports, passwords) before pushing to messaging templates.",
      "Outbound links signed using secure hashes to prevent session tampering."
    ],
    rateLimiting: "SMS limited to 1 message per user per minute; email alarms aggregated into digest messages.",
    failureHandling: "Auto-fallback routing: If APNs/FCM push fails or drops, automatically route critical itinerary changes via SMS.",
    retryStrategy: "Decaying exponential backoff for provider API gateways: retry 5 times, initial delay 500ms, scaling multiplier 1.5."
  },
  {
    id: "analytics-ingestion",
    name: "Analytics Clickstream Ingest Service",
    context: "Analytics Context",
    purpose: "Processes clickstream logging, tracking search metadata and system telemetries for BigQuery/Kafka streams.",
    responsibilities: [
      "Ingest high-throughput search telemetry payloads.",
      "Translate raw telemetry into structured analytical files (Parquet/Iceberg).",
      "Feed internal reporting dashboard calculations."
    ],
    restEndpoints: [
      {
        method: "POST",
        path: "/api/v1/analytics/telemetry/collect",
        description: "Ingestion endpoint for browser and mobile click logs.",
        payload: '{ "events": [{ "event_name": "search_click", "properties": { "route": "CDG-DXB" }, "timestamp": 1782012903 }] }',
        response: '{ "ingested": true, "count": 1 }'
      }
    ],
    graphqlSchema: `type SearchMetric {
  route: String!
  searchCount: Int!
  peakHour: Int!
}

extend type Query {
  getSearchTrends(route: String!): SearchMetric
}`,
    grpcInterfaces: [
      "rpc FetchSearchVolume (VolumeRequest) returns (VolumeResponse);"
    ],
    dbOwnership: {
      technology: "Apache Iceberg on S3 / Google BigQuery (Data Lake)",
      description: "Massive scale append-only analytical dataset containing historical click streams and operational metrics.",
      tables: ["search_metrics", "user_interaction_events", "daily_system_aggregates"]
    },
    eventsPublished: [
      "analytics.daily.rollup.completed"
    ],
    eventsConsumed: [
      "search.query.submitted",
      "search.results.synthesized"
    ],
    scalingStrategy: "Autoscaling on ingress bandwidth metrics and network adapter workloads, utilizing KEDA on Kafka partition volumes to scale parser pods.",
    deploymentStrategy: "Recreate or rolling updates. As the service is completely stateless and event-driven, minimal deployment restrictions apply.",
    healthChecks: {
      livenessPath: "/healthz",
      readinessPath: "/ready",
      startupTimeout: "10s"
    },
    monitoring: [
      "Data ingestion rate limits (BigQuery streams speed)",
      "Parsing error ratios on incoming telemetries",
      "Kafka consumer lag indexes"
    ],
    caching: {
      technology: "No caching engine",
      strategy: "Writes directly to buffer pools to prevent system delays.",
      ttl: "Zero caching applied."
    },
    security: [
      "Strict data scrubbing during ingestion pipelines to strip out IP addresses or credit card numbers.",
      "Access strictly controlled via IAM roles."
    ],
    rateLimiting: "IP-based ingestion bounds capped at 100 tracking metrics per second to prevent telemetry flood attacks.",
    failureHandling: "Local buffering inside memory-mapped files on GKE persistent volumes if downstream databases (BigQuery) experience outages.",
    retryStrategy: "No retries for browser client telemetry. Internal database ingestions retry up to 5 times using jittered parameters."
  },
  {
    id: "payment-processor",
    name: "Payment Gateway Service",
    context: "Payments Context",
    purpose: "Handles credit validations, gateway allocations, double-entry financial accounting ledgers, and PCI tokens.",
    responsibilities: [
      "Authorize and capture charge intents via Stripe and Adyen.",
      "Process double-entry ledger bookkeeping records.",
      "Verify financial transaction idempotencies."
    ],
    restEndpoints: [
      {
        method: "POST",
        path: "/api/v1/payments/charges/create",
        description: "Creates and captures immediate payment transactions.",
        payload: '{ "booking_id": "bkg_1029fa", "payment_token": "tok_visa", "amount": 505.50 }',
        response: '{ "transaction_id": "tx_82103f", "status": "succeeded" }'
      }
    ],
    graphqlSchema: `type PaymentTransaction {
  id: ID!
  bookingId: ID!
  amount: Float!
  status: String!
  createdAt: String!
}

extend type Mutation {
  processPayment(bookingId: ID!, token: String!): PaymentTransaction!
}`,
    grpcInterfaces: [
      "rpc AuthorizePayment (AuthRequest) returns (AuthResponse);",
      "rpc CapturePayment (CaptureRequest) returns (CaptureResponse);"
    ],
    dbOwnership: {
      technology: "PostgreSQL (Cloud SQL, Citus-sharded with active double-entry structures)",
      description: "Stores audit logs, financial ledger balance records, transaction journals, and payment parameters.",
      tables: ["payment_transactions", "financial_ledger_entries", "refund_audits"]
    },
    eventsPublished: [
      "payment.charge.succeeded",
      "payment.charge.failed",
      "payment.refund.completed"
    ],
    eventsConsumed: [
      "booking.state.reserved"
    ],
    scalingStrategy: "State-pinned Horizontal Pod Autoscaler (HPA) targeting memory metrics, with minimum pod sizes clamped to 4 replica instances across availability zones.",
    deploymentStrategy: "Rolling updates on GKE. Demands comprehensive automated unit/integration test sweeps before permitting code releases.",
    healthChecks: {
      livenessPath: "/health/live",
      readinessPath: "/health/ready",
      startupTimeout: "15s"
    },
    monitoring: [
      "Stripe payment latency trends",
      "Card capture failure rates divided by issuer banks",
      "Accounting ledger reconciliation drift indexes (must equal zero)"
    ],
    caching: {
      technology: "Redis Cluster (Idempotency Key registry)",
      strategy: "Write-through tracking of transactional idempotency keys.",
      ttl: "24 hours to prevent duplicate financial transaction charges."
    },
    security: [
      "Zero local storage of primary account numbers (PAN) or CVVs (strictly outsourced to Stripe token grids).",
      "Signed token exchanges enforcing TLS 1.3 with mandatory client certificates (mTLS)."
    ],
    rateLimiting: "Idempotency key checks block parallel processing attempts of identical booking charges.",
    failureHandling: "Auto-void routines: If the payment capture succeeded but downstream booking systems fail during seat reservations, immediately trigger compensating charge refunds.",
    retryStrategy: "No retries on declined card transactions. Network-related processor errors retry twice using 500ms intervals."
  },
  {
    id: "recommendation-engine",
    name: "Affinity & Deal Recommendation Engine",
    context: "Recommendations Context",
    purpose: "Computes personalized search suggestion models and constructs targeted deals matching customer lookups.",
    responsibilities: [
      "Analyze trailing searches to compile flight affinity parameters.",
      "Suggest hotel cross-sells based on the destination airport.",
      "Refresh home screen carousel recommendations."
    ],
    restEndpoints: [
      {
        method: "GET",
        path: "/api/v1/recommendations/routes/affinity",
        description: "Retrieves personalized trip deals based on computed user affinity scores.",
        payload: "?user_id=usr_902ab",
        response: '{ "recommendations": [{ "route": "JFK-CDG", "score": 0.94, "deal_price": 420.00 }] }'
      }
    ],
    graphqlSchema: `type DealRecommendation {
  route: String!
  score: Float!
  price: Float!
}

extend type Query {
  getDeals(userId: ID!): [DealRecommendation!]!
}`,
    grpcInterfaces: [
      "rpc GetRouteAffinity (AffinityRequest) returns (AffinityResponse);"
    ],
    dbOwnership: {
      technology: "PostgreSQL + JSONB (Cloud SQL, with active index partitions)",
      description: "Stores traveler affinity charts, recommendation profiles, and trending seasonal routes listings.",
      tables: ["user_recommendation_profiles", "route_trending_scores"]
    },
    eventsPublished: [
      "recommendations.profile.updated"
    ],
    eventsConsumed: [
      "search.query.submitted"
    ],
    scalingStrategy: "Horizontal Pod Autoscaler (HPA) targeting CPU utilization, scaling replicas during seasonal tourism campaigns (scaling parameters set at 75% CPU usage).",
    deploymentStrategy: "Canary rollouts (10% increments) utilizing Argo Rollouts to evaluate click-through tracking metrics before finalizing system releases.",
    healthChecks: {
      livenessPath: "/health/live",
      readinessPath: "/health/ready",
      startupTimeout: "20s"
    },
    monitoring: [
      "Recommendation click-through rate (CTR) scores",
      "Average suggestion calculations delays",
      "Dynamic data-drift index values"
    ],
    caching: {
      technology: "Redis Cluster (GCP Memorystore)",
      strategy: "Read-through caching for compiled recommendation arrays.",
      ttl: "6 hours, as user travel preferences evolve on slow sliding schedules."
    },
    security: [
      "Anonymization of personalization profiles during machine learning vector indexing.",
      "Strict data governance ensuring zero cross-user leakage."
    ],
    rateLimiting: "Capped at 50 requests per user session per minute to prevent scrapers from draining CPU cycles.",
    failureHandling: "Fallback to default static country-wide 'trending travel locations' if database tables exhibit latency anomalies.",
    retryStrategy: "Single retry to secondary query databases, with fallback to local defaults."
  },
  {
    id: "travel-doc-copilot",
    name: "Travel Doc Copilot (AI) Service",
    context: "Travel Intelligence Context",
    purpose: "Handles conversational chat queries via Gemini-3.5-flash and validates global entry/visa rules.",
    responsibilities: [
      "Drive natural language chat interfaces for itinerary planning.",
      "Ground user questions with real-time flight schedules and visa laws.",
      "Parse uploaded travel documents (e.g., passports) using multi-modal AI."
    ],
    restEndpoints: [
      {
        method: "POST",
        path: "/api/v1/intelligence/threads/chat",
        description: "Primary conversational interaction endpoint utilizing streamed tokens.",
        payload: '{ "thread_id": "th_2901a", "query": "Is a transit visa required in CDG for Indian passports?" }',
        response: '{ "response": "Yes, unless you hold a valid Schengen visa...", "grounded_sources": ["French consulate manual v2"] }'
      }
    ],
    graphqlSchema: `type ChatMessage {
  role: String!
  content: String!
  timestamp: String!
}

type ChatThread {
  id: ID!
  messages: [ChatMessage!]!
}

extend type Query {
  getThreadHistory(threadId: ID!): ChatThread
}

extend type Mutation {
  postMessage(threadId: ID!, content: String!): ChatMessage!
}`,
    grpcInterfaces: [
      "rpc AnalyzeVisaRequirements (VisaRequest) returns (VisaResponse);",
      "rpc GroundChatItinerary (GroundRequest) returns (GroundResponse);"
    ],
    dbOwnership: {
      technology: "PostgreSQL (Cloud SQL, sharded by thread_id) + Qdrant (Vector Database)",
      description: "Stores chat transcripts, dynamic embeddings of visa regulations, airline baggage parameters, and traveler document summaries.",
      tables: ["ai_conversation_threads", "visa_embeddings_registry", "baggage_rules_documents"]
    },
    eventsPublished: [
      "intelligence.itinerary.generated",
      "intelligence.visa_rule.queried"
    ],
    eventsConsumed: [
      "booking.state.completed"
    ],
    scalingStrategy: "Autoscaling GKE pods based on active WebSocket and HTTP connection metrics via KEDA (scale rules target 500 concurrent connections per pod replica).",
    deploymentStrategy: "Canary rollouts on GKE (5% increments) with automated rollbacks if Gemini API integration error rates exceed 1%.",
    healthChecks: {
      livenessPath: "/healthz",
      readinessPath: "/ready",
      startupTimeout: "30s"
    },
    monitoring: [
      "Gemini API endpoint roundtrip times (Target: <600ms first-chunk)",
      "Model tokens usage logs (Prometheus metric: ai_tokens_consumed)",
      "User chat feedback thumbs-up ratios"
    ],
    caching: {
      technology: "Redis Cluster (Context caching)",
      strategy: "Read-through caching for vector lookup indexes.",
      ttl: "12 hours for document embeddings, as consulate visa regulations update slowly."
    },
    security: [
      "Strict client-side redacting of user passports or credit card sequences before transmitting data to the Gemini API.",
      "Access token boundaries verified at gateway levels."
    ],
    rateLimiting: "Capped at 30 conversational queries per user per minute to control API costs.",
    failureHandling: "Fallback to rule-based destination FAQ matrices if Gemini API keys experience transient throttles.",
    retryStrategy: "Exponential backoff on Gemini API calls: initial retry delay 200ms, scaling factor 2.0, max attempts 3."
  },
  {
    id: "user-profile-service",
    name: "User Profiles & Preferences Service",
    context: "User Profiles Context",
    purpose: "Manages central customer profile data, traveler identities, passports records, and loyalty details.",
    responsibilities: [
      "Store traveler names, dates of birth, and identity credentials.",
      "Manage client frequent flyer program alignments.",
      "Verify and check security-encrypted traveler passport databases."
    ],
    restEndpoints: [
      {
        method: "GET",
        path: "/api/v1/profiles/customers/me",
        description: "Retrieves complete profile details for the logged-in customer.",
        response: '{ "profile": { "user_id": "usr_902ab", "first_name": "John", "loyalty_accounts": { "LH": "Miles992" } } }'
      }
    ],
    graphqlSchema: `type UserProfile {
  userId: ID!
  firstName: String!
  lastName: String!
  homeAirport: String
  loyaltyAccounts: [LoyaltyAccount!]!
}

type LoyaltyAccount {
  carrier: String!
  accountNumber: String!
}

extend type Query {
  myProfile: UserProfile
}`,
    grpcInterfaces: [
      "rpc FetchUserProfile (ProfileRequest) returns (ProfileResponse);",
      "rpc GetPassportDetails (PassportRequest) returns (PassportResponse);"
    ],
    dbOwnership: {
      technology: "PostgreSQL (Cloud SQL, sharded by user_id)",
      description: "Authoritative database for secure customer information, passenger details, and verified passport strings.",
      tables: ["user_profiles", "traveler_passport_records", "loyalty_registry"]
    },
    eventsPublished: [
      "user.profile.updated"
    ],
    eventsConsumed: [
      "auth.user.login.succeeded"
    ],
    scalingStrategy: "Horizontal Pod Autoscaler (HPA) targeting CPU utilization, scaling replicas when average pod CPU load exceeds 75%.",
    deploymentStrategy: "Canary rollouts (10% progression windows) backed by automated tests validation to ensure zero-downtime updates.",
    healthChecks: {
      livenessPath: "/health/live",
      readinessPath: "/health/ready",
      startupTimeout: "10s"
    },
    monitoring: [
      "Database query latencies (Target: <5ms read times)",
      "Profile-update volumes",
      "Password/passport cryptographic signature mismatch errors"
    ],
    caching: {
      technology: "Redis Cluster (GCP Memorystore)",
      strategy: "Read-through caching for logged-in profile data.",
      ttl: "4 hours, with instant invalidation events published upon profile update API triggers."
    },
    security: [
      "Envelope-level database column encryption utilizing Google KMS for passport and government numbers.",
      "Field-level redaction protocols on trace logs to prevent PII exposure."
    ],
    rateLimiting: "IP limits clamped at 100 profile inquiries per minute; passport updates limited to 3 attempts per hour.",
    failureHandling: "Fallback to read-only edge cached profiles inside Cloudflare KV if local database instances undergo replica promotions.",
    retryStrategy: "3 retries with exponential backoff on profile databases updates."
  },
  {
    id: "admin-console",
    name: "Admin & Operations Control",
    context: "Admin Context",
    purpose: "Handles pricing overrides, platform configurations, circuit-breaker triggers, and logs review parameters.",
    responsibilities: [
      "Manage dynamic markup percentages and pricing fees.",
      "Trigger manual override controls over airline integrations.",
      "Enforce compliance and SOC 2 logs verifications."
    ],
    restEndpoints: [
      {
        method: "POST",
        path: "/api/v1/admin/configs/adjust-markup",
        description: "Updates global booking dynamic markups parameters.",
        payload: '{ "markup_percentage": 2.5 }',
        response: '{ "status": "updated", "new_markup_percentage": 2.5 }'
      }
    ],
    graphqlSchema: `type SystemConfig {
  key: String!
  value: String!
  updatedBy: String!
  updatedAt: String!
}

extend type Query {
  getSystemConfigs: [SystemConfig!]!
}

extend type Mutation {
  setSystemConfig(key: String!, value: String!): SystemConfig!
}`,
    grpcInterfaces: [
      "rpc GetPlatformConfig (ConfigRequest) returns (ConfigResponse);"
    ],
    dbOwnership: {
      technology: "PostgreSQL (Cloud SQL, replication active)",
      description: "Stores system global variables, circuit breaker overrides, markup logs, and audit logs.",
      tables: ["system_configs", "operator_audit_logs", "gateways_circuit_breakers"]
    },
    eventsPublished: [
      "admin.config.changed",
      "admin.circuit_breaker.triggered"
    ],
    eventsConsumed: [
      "supplier.health.degraded"
    ],
    scalingStrategy: "Slight manual floor scaling (fixed to 2 replicas), as administrative operations do not experience massive consumer bursts.",
    deploymentStrategy: "Recreate or standard rolling updates. Fully protected by internal enterprise network routing profiles.",
    healthChecks: {
      livenessPath: "/health/live",
      readinessPath: "/health/ready",
      startupTimeout: "15s"
    },
    monitoring: [
      "Operator click audit tracking",
      "System variables deployment times",
      "API gateway routing changes metrics"
    ],
    caching: {
      technology: "In-memory cache",
      strategy: "Read-through caching for dynamic configuration variables.",
      ttl: "5 minutes, with instant invalidation events emitted upon admin adjustment API triggers."
    },
    security: [
      "Strict Multi-Factor Authentication (MFA) requirements for all operator profiles.",
      "Mandatory logging of all configuration changes to append-only tamper-evident tables."
    ],
    rateLimiting: "Limited to 15 transactions per operator per minute.",
    failureHandling: "Fallback to default environment-compiled properties files if database tables become unavailable.",
    retryStrategy: "Single retry with immediate error escalation logs sent to Slack/PagerDuty."
  },
  {
    id: "partner-gateway",
    name: "Partner Integrations Gateway",
    context: "Partner Integrations Context",
    purpose: "Handles API authorizations, keys tracking, quota restrictions, and multi-tenant billing calculations.",
    responsibilities: [
      "Verify and authorize partner API keys at gateway edges.",
      "Enforce multi-tenant rate limits based on subscription tiers.",
      "Process usage analytics files for B2B billing calculation."
    ],
    restEndpoints: [
      {
        method: "POST",
        path: "/api/v1/partners/accounts/keys",
        description: "Generates a new API access key for white-label developers.",
        payload: '{ "partner_id": "pt_301ea", "label": "staging-key" }',
        response: '{ "api_key": "fs_test_102ab...", "status": "active" }'
      }
    ],
    graphqlSchema: `type PartnerAccount {
  id: ID!
  companyName: String!
  tier: String!
  queriesThisMonth: Int!
}

extend type Query {
  getPartnerAccount(id: ID!): PartnerAccount
}`,
    grpcInterfaces: [
      "rpc ValidatePartnerKey (ValidateKeyRequest) returns (ValidateKeyResponse);"
    ],
    dbOwnership: {
      technology: "PostgreSQL (Cloud SQL, active replication)",
      description: "Stores partner accounts metadata, generated API hashes, allocated rate quotas, and trailing billing records.",
      tables: ["partner_accounts", "partner_api_keys", "billing_aggregates"]
    },
    eventsPublished: [
      "partner.quota.exceeded",
      "partner.key.generated"
    ],
    eventsConsumed: [
      "analytics.daily.rollup.completed"
    ],
    scalingStrategy: "Horizontal scaling via GKE HPA tracking CPU and concurrent connection metrics (HPA targets 70% CPU limit).",
    deploymentStrategy: "Canary rollouts (5% steps with a 4-hour monitoring delay) to avoid disrupting live business clients.",
    healthChecks: {
      livenessPath: "/health/live",
      readinessPath: "/health/ready",
      startupTimeout: "15s"
    },
    monitoring: [
      "Partner API response latencies",
      "Total transactions categorized by client accounts",
      "Quota usage curves tracking alert boundaries"
    ],
    caching: {
      technology: "Redis Cluster (API key registry cache)",
      strategy: "Read-through caching for active API key validation states.",
      ttl: "5 minutes to enable near-instant partner access revocations."
    },
    security: [
      "Storage of key hashes only (raw API keys are shown once to partners on creation and never stored).",
      "OAuth 2.1 authorization protocols strictly enforced for B2B API access."
    ],
    rateLimiting: "Dynamically resolved based on partner subscription tiers (e.g., Bronze: 50 QPS, Gold: 500 QPS, Enterprise: custom limits).",
    failureHandling: "Graceful degradation: If key database pools undergo downtime, allow cached key hashes to pass with last-known rates restrictions.",
    retryStrategy: "3 retries with exponential backoff on database updates."
  },
  {
    id: "subscription-manager",
    name: "User Subscription & Benefits Manager",
    context: "Subscriptions Context",
    purpose: "Handles membership states, recurring transaction schedules, premium alert systems, and corporate billing profiles.",
    responsibilities: [
      "Process subscription checkouts and renewal schedules.",
      "Synchronize premium status variables in user profile databases.",
      "Track plan features parameters mapping."
    ],
    restEndpoints: [
      {
        method: "POST",
        path: "/api/v1/subscriptions/billing/portal",
        description: "Creates and returns a Stripe billing portal session URL.",
        payload: '{ "user_id": "usr_902ab" }',
        response: '{ "portal_url": "https://billing.stripe.com/session/1029fa..." }'
      }
    ],
    graphqlSchema: `type UserSubscription {
  id: ID!
  planId: String!
  status: String!
  currentPeriodEnd: String!
}

extend type Query {
  getSubscription(userId: ID!): UserSubscription
}`,
    grpcInterfaces: [
      "rpc GetUserSubscription (SubscriptionRequest) returns (SubscriptionResponse);"
    ],
    dbOwnership: {
      technology: "PostgreSQL (Cloud SQL, sharded by user_id)",
      description: "Stores user membership schedules, premium alerts logs, billing logs, and invoice entries.",
      tables: ["user_subscriptions", "premium_features_matrix", "payment_invoices"]
    },
    eventsPublished: [
      "subscription.status.changed",
      "subscription.billing.past_due"
    ],
    eventsConsumed: [
      "payment.charge.succeeded"
    ],
    scalingStrategy: "Horizontal Pod Autoscaler (HPA) targeting memory metrics, scaling replica counts during platform promotions.",
    deploymentStrategy: "Canary rollouts on GKE (10% steps over 2 hours) utilizing Envoy routing rules.",
    healthChecks: {
      livenessPath: "/health/live",
      readinessPath: "/health/ready",
      startupTimeout: "15s"
    },
    monitoring: [
      "Subscription churn and expansion velocities",
      "Stripe webhook delay indexes",
      "Dynamic membership benefits sync lag"
    ],
    caching: {
      technology: "Redis Cluster",
      strategy: "Read-through caching for active subscription statuses.",
      ttl: "1 hour, with automatic cache clears triggered on Stripe status webhook events."
    },
    security: [
      "Stripe webhook signatures validated using SHA-256 HMAC tokens.",
      "Access control boundaries validated on all subscription edit actions."
    ],
    rateLimiting: "Limited to 15 subscription adjustment checkouts per user per minute.",
    failureHandling: "In the event of database communication failures, default to 'Active Premium' for existing cached sessions to avoid disrupting paid users.",
    retryStrategy: "Exponential backoff for webhook processing: retry up to 5 times over 12 hours with a multiplier of 2.0."
  },
  {
    id: "fraud-detector",
    name: "Real-time Fraud & Bot Detection",
    context: "Fraud Detection Context",
    purpose: "Analyzes booking parameters in real-time to compute fraud probability metrics and flag scraping bot attacks.",
    responsibilities: [
      "Calculate real-time risk scores for incoming flight bookings.",
      "Check traveler credentials against global credit card fraud registers.",
      "Detect automated scraper bots attempting to crawl prices."
    ],
    restEndpoints: [
      {
        method: "POST",
        path: "/api/v1/fraud/orders/evaluate",
        description: "Evaluates risk indexes for checkouts.",
        payload: '{ "booking_id": "bkg_1029fa", "ip_address": "198.51.100.12", "card_bin": "411111" }',
        response: '{ "risk_score": 0.08, "verdict": "approved" }'
      }
    ],
    graphqlSchema: `type FraudEvaluation {
  id: ID!
  bookingId: ID!
  riskScore: Float!
  verdict: String!
}

extend type Query {
  getEvaluation(bookingId: ID!): FraudEvaluation
}`,
    grpcInterfaces: [
      "rpc EvaluateFraudRisk (FraudRequest) returns (FraudResponse);"
    ],
    dbOwnership: {
      technology: "Google Cloud Bigtable (High-volume sequential logs)",
      description: "Stores real-time transactional risk profiles, blacklisted IP ranges, and scraper click fingerprints.",
      tables: ["fraud_evaluations", "ip_blacklist_registry", "scraper_fingerprints"]
    },
    eventsPublished: [
      "fraud.suspicious_activity.detected",
      "fraud.ip_range.blocked"
    ],
    eventsConsumed: [
      "booking.state.reserved"
    ],
    scalingStrategy: "Dynamic scaling on GKE tracking queue latencies via KEDA (scaling parser pods up during high-demand campaigns).",
    deploymentStrategy: "Canary rollouts (5% steps over a 2-hour window) to verify detection metrics accuracy before routing live transactions.",
    healthChecks: {
      livenessPath: "/health/live",
      readinessPath: "/health/ready",
      startupTimeout: "15s"
    },
    monitoring: [
      "Transaction evaluation latencies (Target: <15ms)",
      "False-positive ratios (Prometheus metric: fraud_false_positives)",
      "IP-block trigger volumes"
    ],
    caching: {
      technology: "Redis Cluster (Local lock sheets)",
      strategy: "Read-through caching for IP block lists.",
      ttl: "15 minutes, allowing fast global synchronization of blacklisted routes."
    },
    security: [
      "Advanced threat modeling and behavior analytics engines.",
      "Encrypted transit channels utilizing mTLS across all evaluation endpoints."
    ],
    rateLimiting: "IP checks are triggered on every transaction checkout flow.",
    failureHandling: "In the event of evaluation timeout or failure, allow the transaction to proceed but flag it for immediate manual operations review.",
    retryStrategy: "No retries on real-time checks to prevent transaction checkout blockages. Retries for offline analytical pipelines run up to 3 times."
  }
];
