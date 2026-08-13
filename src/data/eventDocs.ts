export interface EventField {
  name: string;
  type: string;
  description: string;
  example: string;
}

export interface EventSpec {
  id: string;
  name: string;
  topic: string;
  description: string;
  version: string;
  producer: string;
  consumers: string[];
  retryStrategy: {
    backoffType: string;
    maxAttempts: number;
    initialIntervalMs: number;
    maxIntervalMs: number;
  };
  dlqTopic: string;
  replayMechanism: string;
  monitoringMetrics: string[];
  schema: EventField[];
}

export const KAFKA_EVENTS: EventSpec[] = [
  {
    id: "FlightSearched",
    name: "FlightSearched",
    topic: "travel.search.v1.flight-searched",
    description: "Emitted whenever a traveler performs a flight search. Hydrates search index aggregates, search caches, and prediction learning models.",
    version: "1.2.0 (Avro Schema-Reg compatible)",
    producer: "Search API Gateway (stateless node service)",
    consumers: [
      "ClickHouse Analytics Consumer (Materialized view sink)",
      "ML Prediction ingestion engine",
      "Dynamic User Personalization service"
    ],
    retryStrategy: {
      backoffType: "Exponential Backoff with jitter",
      maxAttempts: 3,
      initialIntervalMs: 500,
      maxIntervalMs: 5000
    },
    dlqTopic: "travel.search.v1.flight-searched-dlq",
    replayMechanism: "Replayable by offset. Standard retention is 7 days in raw tier S3/GCS parquet files.",
    monitoringMetrics: [
      "kafka.consumer.lag (by consumer group)",
      "search.rate.per_second",
      "search.response.latency_ms"
    ],
    schema: [
      { name: "event_id", type: "UUID (string)", description: "Globally unique identifier for tracing this event instance.", example: "71e5c3c0-3f74-4b53-b09e-71b3dc951e73" },
      { name: "timestamp", type: "ISO-8601 String", description: "Absolute timestamp when the search query was submitted.", example: "2026-06-27T22:36:37.104Z" },
      { name: "user_id", type: "String (Nullable)", description: "The identifier of the logged-in user, or null if anonymous traveler.", example: "usr_9921b3f62c0e" },
      { name: "origin_airport", type: "String (IATA Code)", description: "3-letter airport code where flight segment begins.", example: "FRA" },
      { name: "destination_airport", type: "String (IATA Code)", description: "3-letter airport code of the primary destination.", example: "SIN" },
      { name: "departure_date", type: "String (YYYY-MM-DD)", description: "Requested outbound departure date.", example: "2026-09-12" },
      { name: "cabin_class", type: "Enum (ECONOMY, BUSINESS, FIRST)", description: "Preferred travel compartment tier.", example: "ECONOMY" },
      { name: "pax_adults", type: "Integer", description: "Number of adult passengers.", example: "1" }
    ]
  },
  {
    id: "PriceDropped",
    name: "PriceDropped",
    topic: "travel.pricing.v1.price-dropped",
    description: "Fired when the pricing engine registers a price decrease on a tracked corridor matching user alert parameters.",
    version: "1.0.1 (JSON Schema)",
    producer: "Dynamic Pricing Engine (running continuous cache variance triggers)",
    consumers: [
      "User Notifications Broker (Push/Email dispatcher)",
      "Active Analytics dashboard compiler",
      "Affiliate API syndication partner sink"
    ],
    retryStrategy: {
      backoffType: "Exponential Backoff (No jitter)",
      maxAttempts: 5,
      initialIntervalMs: 1000,
      maxIntervalMs: 30000
    },
    dlqTopic: "travel.pricing.v1.price-dropped-dlq",
    replayMechanism: "Replayable via Kafka Connect offset reset. Active state store holds last 30 drops.",
    monitoringMetrics: [
      "pricing.drop.magnitude_percentage",
      "notification.dispatch.rate_per_sec",
      "notification.delivery.latency_ms"
    ],
    schema: [
      { name: "alert_id", type: "UUID (string)", description: "ID of the specific AlertCreated object that matched this drop.", example: "alert_003f290d-293e" },
      { name: "route_key", type: "String", description: "Dashed corridor matching origin, destination and airline carrier.", example: "LHR-JFK-BA" },
      { name: "previous_fare", type: "Decimal (string-serialized)", description: "The prior lowest dynamic fare registered in last 12h.", example: "520.00" },
      { name: "current_fare", type: "Decimal (string-serialized)", description: "The new drop price detected in the latest GDS check.", example: "390.00" },
      { name: "drop_percentage", type: "Float", description: "The variance calculated between old and new fares.", example: "25.0" },
      { name: "currency", type: "String (ISO-4217)", description: "Pricing scale currency ISO representation.", example: "USD" }
    ]
  },
  {
    id: "PredictionGenerated",
    name: "PredictionGenerated",
    topic: "travel.ai.v2.prediction-generated",
    description: "Emitted by the Machine Learning model batch runners. Indicates a new pricing trajectory model has been calculated for a route.",
    version: "2.0.0 (Protobuf/Avro)",
    producer: "AI Inference Worker Pool (GPU Serverless cluster)",
    consumers: [
      "FlySmart Prediction Cache Layer",
      "Notification Dispatcher (for price-lock recommendations)"
    ],
    retryStrategy: {
      backoffType: "Constant Interval Backoff",
      maxAttempts: 2,
      initialIntervalMs: 2000,
      maxIntervalMs: 2000
    },
    dlqTopic: "travel.ai.v2.prediction-generated-dlq",
    replayMechanism: "Replayable by feeding ClickHouse source search logs back into the ML pipeline worker.",
    monitoringMetrics: [
      "inference.accuracy.probability",
      "ml.generation.throughput_per_min",
      "gpu.utilization_percent"
    ],
    schema: [
      { name: "route_code", type: "String", description: "IATA flight route string.", example: "FRA-SIN" },
      { name: "target_month", type: "String (YYYY-MM)", description: "The month-range calculated for travel.", example: "2026-09" },
      { name: "confidence_score", type: "Float", description: "The accuracy percentage calculated by the transformer model.", example: "0.89" },
      { name: "recommendation", type: "Enum (BUY, WAIT, SELL)", description: "The calculated consumer call for the fare trajectory.", example: "BUY" },
      { name: "expected_variance_usd", type: "Float", description: "Estimated price swing variance over next 14 days.", example: "85.50" }
    ]
  },
  {
    id: "BookingStarted",
    name: "BookingStarted",
    topic: "travel.transaction.v1.booking-started",
    description: "Fired immediately when a traveler clicks 'Initiate Booking'. Locks seat inventory in the local cache and spawns GDS holding reservations.",
    version: "1.1.0 (Avro)",
    producer: "Checkout Frontend API Service",
    consumers: [
      "Transactional Seat Reservation Coordinator",
      "Telemetry & Fraud Prevention Audit Hub",
      "Email Marketing (Abandoned checkout flows)"
    ],
    retryStrategy: {
      backoffType: "Exponential Backoff with Immediate retry",
      maxAttempts: 4,
      initialIntervalMs: 200,
      maxIntervalMs: 4000
    },
    dlqTopic: "travel.transaction.v1.booking-started-dlq",
    replayMechanism: "Replay restricted on booking transactions to prevent double-reservation processing. Safe offsets only.",
    monitoringMetrics: [
      "booking.concurrency.count",
      "gds.hold.response.time_ms",
      "fraud.rejection.ratio"
    ],
    schema: [
      { name: "booking_session_id", type: "UUID (string)", description: "Primary session key holding transaction state.", example: "book_3f3a2c20-a9cb" },
      { name: "user_id", type: "String", description: "The registered customer purchasing the itinerary.", example: "usr_f023ac55" },
      { name: "flight_itinerary_payload", type: "JSON string", description: "Complete passenger cabin list, baggage, segment keys, and schedules.", example: '{"carrier":"SQ","segments":[{"num":"26","from":"FRA","to":"SIN"}]}' },
      { name: "locked_price_usd", type: "Decimal (string)", description: "The locked checkout rate verified in search cache.", example: "680.00" },
      { name: "inventory_expiry_timestamp", type: "ISO-8601 String", description: "Hard lock limit. If reservation is uncompleted by this offset, seats release.", example: "2026-06-27T22:51:37.104Z" }
    ]
  },
  {
    id: "BookingCompleted",
    name: "BookingCompleted",
    topic: "travel.transaction.v1.booking-completed",
    description: "Emitted when a transaction succeeds. Invoices credit card processing gateways, issues airline ticketing logs, and saves history.",
    version: "1.4.2 (Avro Schema-Reg)",
    producer: "Saga Transaction Orchestrator Service",
    consumers: [
      "E-ticketing & Email Gateway Service",
      "IATA BSP Reporting Module",
      "Loyalty Program Mileage Incrementor",
      "ClickHouse Finance Analytics engine"
    ],
    retryStrategy: {
      backoffType: "Exponential Backoff with Dead-Letter Alert Routing",
      maxAttempts: 6,
      initialIntervalMs: 1000,
      maxIntervalMs: 60000
    },
    dlqTopic: "travel.transaction.v1.booking-completed-dlq",
    replayMechanism: "Idempotency guaranteed. Replaying events will only trigger confirmation status queries, never duplicate ticket issues.",
    monitoringMetrics: [
      "completed.transactions.volume_daily",
      "payment.success_rate_percent",
      "mileage.issuance.lag_seconds"
    ],
    schema: [
      { name: "ticket_number_pnr", type: "String (PNR)", description: "The GDS issued Passenger Name Record (6-digit alphanumeric code).", example: "K9Z1YX" },
      { name: "booking_session_id", type: "UUID (string)", description: "The transaction identifier linked to BookingStarted.", example: "book_3f3a2c20-a9cb" },
      { name: "total_paid_amount", type: "Decimal (string)", description: "The complete transaction pricing billed.", example: "680.00" },
      { name: "payment_status", type: "Enum (CHARGED, CAPTURED)", description: "The state of financial processing.", example: "CAPTURED" },
      { name: "issue_timestamp", type: "ISO-8601 String", description: "Ticketing system completion time.", example: "2026-06-27T22:38:12.449Z" }
    ]
  },
  {
    id: "UserRegistered",
    name: "UserRegistered",
    topic: "travel.identity.v1.user-registered",
    description: "Fires whenever a new traveler creates an account. Seeds user profiles, initiates frequent flyer alignments, and sends welcomes.",
    version: "1.0.0 (JSON Schema)",
    producer: "Auth Service / Firebase Trigger Relay",
    consumers: [
      "User Profile database seed, active email campaign tool",
      "Loyalty Engine initialization module"
    ],
    retryStrategy: {
      backoffType: "Exponential Backoff",
      maxAttempts: 3,
      initialIntervalMs: 500,
      maxIntervalMs: 5000
    },
    dlqTopic: "travel.identity.v1.user-registered-dlq",
    replayMechanism: "Replayable by reading old offsets to recover missing welcome notifications.",
    monitoringMetrics: [
      "registrations.count_daily",
      "activation_funnel_rate",
      "auth.gateway.latency_ms"
    ],
    schema: [
      { name: "user_id", type: "String", description: "The unique identifier generated for the customer account.", example: "usr_f023ac55" },
      { name: "email_address", type: "String (Email)", description: "The primary email address used for registration.", example: "traveler@example.com" },
      { name: "nationality", type: "String (Country Code)", description: "ISO 2-letter country identifier for immigration routines.", example: "DE" },
      { name: "loyalty_alliance_tier", type: "String", description: "Default membership tier on account instantiation.", example: "BRONZE" }
    ]
  },
  {
    id: "SubscriptionPurchased",
    name: "SubscriptionPurchased",
    topic: "travel.billing.v1.subscription-purchased",
    description: "Emitted when a user purchases Premium status (e.g., FlySmart VIP Pass for lounge access, zero fees, custom agent support).",
    version: "1.1.0 (JSON)",
    producer: "Stripe Webhook Gateway / Billing microservice",
    consumers: [
      "User Context Cache (enables real-time VIP routing flags)",
      "Financial Accounting Ledger",
      "VIP Support Queue Provisioner"
    ],
    retryStrategy: {
      backoffType: "Exponential Backoff (Heavy limits)",
      maxAttempts: 5,
      initialIntervalMs: 1000,
      maxIntervalMs: 30000
    },
    dlqTopic: "travel.billing.v1.subscription-purchased-dlq",
    replayMechanism: "Replayable via transactional database ledger audit trails.",
    monitoringMetrics: [
      "active.subscriptions.churn_rate",
      "mrr.impact_usd",
      "stripe.sync.errors"
    ],
    schema: [
      { name: "subscription_id", type: "String", description: "The transaction key issued by payment providers.", example: "sub_1N42iY" },
      { name: "user_id", type: "String", description: "The active client upgrading account privileges.", example: "usr_f023ac55" },
      { name: "plan_tier", type: "String", description: "The active plan rate chosen (VIP, PLATINUM, ENTERPRISE).", example: "VIP" },
      { name: "amount_paid", type: "Decimal", description: "Pricing scale fee collected.", example: "29.99" },
      { name: "expiry_date", type: "ISO-8601 Date String", description: "The standard subscription period limit.", example: "2027-06-27T00:00:00Z" }
    ]
  },
  {
    id: "AlertCreated",
    name: "AlertCreated",
    topic: "travel.alerts.v1.alert-created",
    description: "Fires when a user establishes a custom budget watch (e.g., 'Track flight FRA-SIN under $700'). Registers route into continuous polling queues.",
    version: "1.0.0 (Avro)",
    producer: "Alert Management Microservice",
    consumers: [
      "Pricing Alert Watcher Engine",
      "Ad-hoc Crawler Orchestrator"
    ],
    retryStrategy: {
      backoffType: "Exponential Backoff",
      maxAttempts: 3,
      initialIntervalMs: 400,
      maxIntervalMs: 3000
    },
    dlqTopic: "travel.alerts.v1.alert-created-dlq",
    replayMechanism: "Fully replayable. Events re-hydrate Redis alert mapping hashes if cluster fails.",
    monitoringMetrics: [
      "total.active.alerts.tracked",
      "alert.creation.velocity_hour",
      "redis.alert.memory_kb"
    ],
    schema: [
      { name: "alert_id", type: "UUID (string)", description: "The unique locator generated for the budget tracker.", example: "alert_003f290d-293e" },
      { name: "user_id", type: "String", description: "The traveler requesting notifications.", example: "usr_f023ac55" },
      { name: "route_string", type: "String (IATA dashed)", description: "The target sector of airports tracked.", example: "FRA-SIN" },
      { name: "threshold_usd", type: "Decimal", description: "The target maximum budget. Alert fires when dynamic prices drop below this value.", example: "700.00" }
    ]
  },
  {
    id: "MistakeFareDetected",
    name: "MistakeFareDetected",
    topic: "travel.anomaly.v1.mistake-fare-detected",
    description: "Emitted by outlier models when a retrieved GDS price has a standard deviation variance exceeding limits (e.g. 90% below historic average, pricing typos).",
    version: "1.3.0 (Avro)",
    producer: "Anomaly Detection Microservice (Flink analytics runner)",
    consumers: [
      "Ticketing Gateway (locks dynamic fare reservation checkouts automatically)",
      "Internal NOC Alert pager system",
      "FlySmart Premium notification channel (VIP notification path)"
    ],
    retryStrategy: {
      backoffType: "Immediate High-Priority Retries with low limits",
      maxAttempts: 2,
      initialIntervalMs: 100,
      maxIntervalMs: 1000
    },
    dlqTopic: "travel.anomaly.v1.mistake-fare-detected-dlq",
    replayMechanism: "No replay permitted on dynamic outlier alarms; alerts are actioned in real-time or bypassed to prevent stale queues.",
    monitoringMetrics: [
      "mistake_fare.variance_index",
      "noc.notification.latency_ms",
      "auto_freeze.itineraries.count"
    ],
    schema: [
      { name: "anomaly_id", type: "UUID (string)", description: "The diagnostic record identifying this anomaly trigger.", example: "anom_7a03f442" },
      { name: "origin_route", type: "String", description: "Dashed airports sector code.", example: "CDG-NRT" },
      { name: "detected_price", type: "Decimal", description: "The suspicious dynamic pricing value caught in stream.", example: "45.00" },
      { name: "historic_average_price", type: "Decimal", description: "The historical 12-month mean average price for the route.", example: "890.00" },
      { name: "standard_deviation_delta", type: "Float", description: "The standard deviations variance score registered (Sigma).", example: "-6.8" },
      { name: "carrier_code", type: "String (IATA)", description: "The flight carrier that issued the pricing.", example: "AF" }
    ]
  },
  {
    id: "PartnerFailed",
    name: "PartnerFailed",
    topic: "travel.reliability.v1.partner-failed",
    description: "Fires when third-party APIs (Amadeus, Sabre, Timatic, Stripe) timeout or return consecutive 5xx server faults.",
    version: "1.0.0 (JSON Schema)",
    producer: "Resilient API Watchdog Engine",
    consumers: [
      "NOC Pager Duty broker",
      "Dynamic Route Failover Service (downgrades caches automatically)",
      "Circuit Breaker Management microservice"
    ],
    retryStrategy: {
      backoffType: "Exponential Backoff (Alerts must fire immediately)",
      maxAttempts: 3,
      initialIntervalMs: 300,
      maxIntervalMs: 2000
    },
    dlqTopic: "travel.reliability.v1.partner-failed-dlq",
    replayMechanism: "Replayed in development labs to stress-test secondary degradation routines.",
    monitoringMetrics: [
      "partner.consecutive_timeouts",
      "circuit_breaker.state_tripped",
      "fallback.cache.hydration_ratio"
    ],
    schema: [
      { name: "failure_id", type: "UUID (string)", description: "Diagnostic identifier.", example: "fail_00b21a99" },
      { name: "partner_name", type: "String", description: "The targeted external provider service.", example: "AMADEUS_GDS" },
      { name: "endpoint_queried", type: "String", description: "The downstream API URL path.", example: "/v2/shopping/flight-offers" },
      { name: "http_status_returned", type: "Integer", description: "The network error status code (or 0 for timeout).", example: "504" },
      { name: "response_latency_ms", type: "Integer", description: "The threshold length registered.", example: "2800" },
      { name: "active_failover_initiated", type: "Boolean", description: "True if circuit breaker triggered and routed queries to local cache.", example: "true" }
    ]
  }
];
