export interface BoundedContext {
  id: string;
  title: string;
  purpose: string;
  responsibilities: string[];
  tables: {
    name: string;
    description: string;
    columns: string[];
  }[];
  apis: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    description: string;
    payload?: string;
    response?: string;
  }[];
  eventsEmitted: {
    name: string;
    description: string;
    payload: string;
  }[];
  eventsConsumed: {
    name: string;
    description: string;
    trigger: string;
  }[];
  dependencies: string[];
  futureExtensions: string[];
}

export const DDD_CONTEXTS: BoundedContext[] = [
  {
    id: "authentication",
    title: "Authentication Context",
    purpose: "Handles global identity provisioning, session management, secure OAuth2.1/OIDC token exchanges, multi-factor credential validations, and cryptographic assertion signings.",
    responsibilities: [
      "Issue, rotate, and revoke JWT and opaque access/refresh tokens.",
      "Support standard social login providers and high-security passkeys (WebAuthn).",
      "Inject authorization headers into API Gateway contexts for downstream role/attribute validation.",
      "Enforce credential-stuffing prevention and sign-on rate limiting."
    ],
    tables: [
      {
        name: "auth_users",
        description: "Primary credentials database. Highly secured and sharded by user identity.",
        columns: [
          "user_id (UUID, PRIMARY KEY)",
          "email_hash (VARCHAR, UNIQUE INDEX)",
          "password_hash (VARCHAR)",
          "mfa_secret (VARCHAR, ENCRYPTED)",
          "status (ENUM: pending, active, locked)",
          "failed_attempts (INT)",
          "created_at (TIMESTAMP)",
          "updated_at (TIMESTAMP)"
        ]
      },
      {
        name: "auth_sessions",
        description: "Active user sessions mapped to physical user agents and geographic regions.",
        columns: [
          "session_id (VARCHAR, PRIMARY KEY)",
          "user_id (UUID, FOREIGN KEY)",
          "refresh_token_jti (UUID, UNIQUE)",
          "ip_address (INET)",
          "user_agent (TEXT)",
          "expires_at (TIMESTAMP)",
          "is_revoked (BOOLEAN)"
        ]
      }
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/auth/login",
        description: "Validates credentials and returns Access (JWT) and Refresh (Opaque) token pairs.",
        payload: '{ "email": "user@domain.com", "password": "secure_hash", "client_id": "flysmart-spa" }',
        response: '{ "access_token": "eyJhb...", "refresh_token": "rt_876fa...", "expires_in": 3600 }'
      },
      {
        method: "POST",
        path: "/api/v1/auth/refresh",
        description: "Rotates active refresh token, revoking the old token in accordance with standard RFC6749 protocols.",
        payload: '{ "refresh_token": "rt_876fa..." }',
        response: '{ "access_token": "eyJhb...", "refresh_token": "rt_912ba...", "expires_in": 3600 }'
      }
    ],
    eventsEmitted: [
      {
        name: "auth.user.login.succeeded",
        description: "Fires when user successfully logs in, carrying metadata about origin country and security markers.",
        payload: '{ "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", "timestamp": "2026-06-28T04:00:00Z", "ip": "192.0.2.1", "country": "DE" }'
      },
      {
        name: "auth.user.account.locked",
        description: "Fires when brute force limits are exceeded on a specific credentials context.",
        payload: '{ "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", "reason": "excessive_failed_attempts", "lock_expiry": "2026-06-28T05:00:00Z" }'
      }
    ],
    eventsConsumed: [
      {
        name: "fraud.suspicious_activity.detected",
        description: "If high fraud probability is triggered, instantly revoke sessions or lock credentials.",
        trigger: "Forces active session database sets to flag 'is_revoked = true' for the suspect identifier."
      }
    ],
    dependencies: [
      "Fraud Detection Context (for anomaly risk ratings)"
    ],
    futureExtensions: [
      "Decentralized identity claims via W3C verifiable credentials.",
      "Hardware token key attestation using FIDO2 enterprise policies."
    ]
  },
  {
    id: "search",
    title: "Flight Search Context",
    purpose: "Handles high-volume flight route calculations, parallel schedule fannings, and unifies fragmented partner responses into a standardized, high-speed schema.",
    responsibilities: [
      "Coordinate concurrent sub-queries across multiple Global Distribution Systems (GDS: Sabre, Amadeus) and direct carrier NDC APIs.",
      "Expose lightning-fast route autocomplete and calendar fare matrix projections.",
      "Translate disparate supplier responses (SOAP XML, REST JSON) into the unified FlySmart contract.",
      "Implement aggressive multi-tier lookup strategies (L1/L2 Cache before hitting costly external connections)."
    ],
    tables: [
      {
        name: "flight_schedules",
        description: "Synchronized weekly operating flight lists compiled from OAG and Innovata global schedule data.",
        columns: [
          "schedule_id (UUID, PRIMARY KEY)",
          "carrier_code (VARCHAR(3))",
          "flight_number (VARCHAR(5))",
          "departure_airport (VARCHAR(3))",
          "arrival_airport (VARCHAR(3))",
          "operating_days (BIT(7))",
          "effective_from (DATE)",
          "effective_to (DATE)"
        ]
      }
    ],
    apis: [
      {
        method: "GET",
        path: "/api/v1/flights/search",
        description: "The high-volume landing search API, returning streamed flight lists via Server-Sent Events (SSE).",
        payload: "Query parameters: ?origin=FRA&destination=JFK&departure_date=2026-07-15&adults=1&cabin_class=economy",
        response: "Stream of chunks containing flight itineraries: { 'itinerary_id': 'it_908a...', 'legs': [...] }"
      }
    ],
    eventsEmitted: [
      {
        name: "search.query.submitted",
        description: "Published to track clickstream velocity and trigger predictive pre-warming of caching grids.",
        payload: '{ "search_id": "sh_1a2b3c", "origin": "FRA", "destination": "JFK", "departure_date": "2026-07-15", "pax_count": 1 }'
      }
    ],
    eventsConsumed: [
      {
        name: "pricing.cache.invalidated",
        description: "Triggered when an airline pushes live schedule cancellations or price updates, forcing local L2 index purges.",
        trigger: "Instantly deletes key matches inside the Redis Cache Grid matching route-departure hashes."
      }
    ],
    dependencies: [
      "Partner Integrations Context (for external provider access)",
      "User Profiles Context (for customized loyalty-preferred routing)"
    ],
    futureExtensions: [
      "Dynamic multi-modal route calculations (e.g., combining German rail segments with transatlantic carrier options)."
    ]
  },
  {
    id: "pricing",
    title: "Pricing Context",
    purpose: "Performs continuous inventory pricing calculations, aggregates localized fare brackets, and drives live ticketing margin distributions.",
    responsibilities: [
      "Calculate real-time fare pricing based on passenger combinations, baggage limits, and partner markups.",
      "Perform currency conversions and compute variable booking class availability configurations.",
      "Verify fare conditions and carrier baggage regulations."
    ],
    tables: [
      {
        name: "fare_rules",
        description: "Holds strict booking class parameters, cancellation refund windows, and carry-on allowances.",
        columns: [
          "rule_id (UUID, PRIMARY KEY)",
          "carrier_code (VARCHAR(3))",
          "fare_basis (VARCHAR(10))",
          "change_penalty (NUMERIC(10,2))",
          "refund_penalty (NUMERIC(10,2))",
          "cabin_class (VARCHAR(15))",
          "updated_at (TIMESTAMP)"
        ]
      }
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/pricing/quote",
        description: "Locks fare rate for 15 minutes to guarantee price stability during checkout payment processing.",
        payload: '{ "itinerary_id": "it_908a...", "fare_basis": "QHE3", "passenger_details": [...] }',
        response: '{ "quote_id": "qt_543fe...", "total_base_fare": 420.00, "taxes": 85.50, "currency": "USD", "lock_expires_at": "2026-06-28T04:15:00Z" }'
      }
    ],
    eventsEmitted: [
      {
        name: "pricing.fare.locked",
        description: "Triggered when a price quote is successfully reserved, committing inventory lockouts.",
        payload: '{ "quote_id": "qt_543fe...", "total_price": 505.50, "lock_expiry": "2026-06-28T04:15:00Z" }'
      }
    ],
    eventsConsumed: [
      {
        name: "booking.state.completed",
        description: "Fires when ticketing concludes, releasing locked quota bounds.",
        trigger: "Updates pricing lookup locks to 'consumed' state."
      }
    ],
    dependencies: [
      "Search Context"
    ],
    futureExtensions: [
      "Ancillary bundles machine-learning pricing optimization (personalized bag + seat bundle margins)."
    ]
  },
  {
    id: "prediction",
    title: "Price Prediction Context",
    purpose: "Executes deep learning predictive algorithms over historical database tables to forecast route pricing trends and detect anomaly fares.",
    responsibilities: [
      "Generate 'buy vs wait' recommendation verdicts for searches.",
      "Feed sliding-window mistake fare alarms utilizing Apache Flink state streams.",
      "Expose historical flight pricing graphs for up to a 12-month trailing horizon."
    ],
    tables: [
      {
        name: "route_price_aggregates",
        description: "Aggregated daily median fares used to train deep prediction layers. Partitioned by route hash.",
        columns: [
          "aggregate_id (UUID, PRIMARY KEY)",
          "origin_airport (VARCHAR(3))",
          "destination_airport (VARCHAR(3))",
          "departure_month (INT)",
          "median_fare (NUMERIC(10,2))",
          "lowest_recorded (NUMERIC(10,2))",
          "recorded_date (DATE)"
        ]
      }
    ],
    apis: [
      {
        method: "GET",
        path: "/api/v1/prediction/forecast",
        description: "Retrieves price trajectory parameters, prediction bands, and booking urgency verdicts.",
        payload: "Query parameters: ?origin=FRA&destination=JFK&departure_date=2026-07-15",
        response: '{ "verdict": "BUY", "confidence": 0.94, "trend": "upward", "price_history": [...], "forecast_path": [...] }'
      }
    ],
    eventsEmitted: [
      {
        name: "prediction.anomaly.detected",
        description: "Broadcasts instantly when standard deviation algorithms tag a potential mistake fare error.",
        payload: '{ "route": "FRA-JFK", "typical_fare": 650.00, "detected_fare": 95.00, "z_score": -4.8, "carrier": "LH" }'
      }
    ],
    eventsConsumed: [
      {
        name: "search.query.submitted",
        description: "Uses search traffic velocities to run continuous drift training loops.",
        trigger: "Feeds online feature stores to keep forecasting models aligned with immediate peak demands."
      }
    ],
    dependencies: [
      "Analytics Context"
    ],
    futureExtensions: [
      "Geopolitical risk factors and major-event schedules integrated into forecasting vectors (e.g., estimating ticket demand spikes near newly scheduled World Cup brackets)."
    ]
  },
  {
    id: "booking",
    title: "Booking Context",
    purpose: "Orchestrates multi-phase flight reservations, Passenger Name Record (PNR) constructions, and governs transactional booking state-machine lifecycles.",
    responsibilities: [
      "Coordinate Distributed Saga workflows during ticket reservations.",
      "Manage transition pipelines (Pending → Quoted → Reserved → Ticketed → Cancelled/Failed).",
      "Store authoritative ticket manifests, handling infant/child/pet bookings."
    ],
    tables: [
      {
        name: "bookings",
        description: "Transactional order record storage. Multi-region Active-Active synced in Cloud Spanner.",
        columns: [
          "booking_id (UUID, PRIMARY KEY)",
          "booking_reference_pnr (VARCHAR(6), INDEX)",
          "user_id (UUID, INDEX)",
          "quote_id (UUID)",
          "booking_status (VARCHAR(20))",
          "total_price (NUMERIC(10,2))",
          "created_at (TIMESTAMP)",
          "updated_at (TIMESTAMP)"
        ]
      },
      {
        name: "passengers",
        description: "Full traveler documentation mapped to physical itineraries.",
        columns: [
          "passenger_id (UUID, PRIMARY KEY)",
          "booking_id (UUID, FOREIGN KEY)",
          "first_name (VARCHAR(60))",
          "last_name (VARCHAR(60))",
          "passport_number (VARCHAR(30), ENCRYPTED)",
          "date_of_birth (DATE)",
          "gender (VARCHAR(1))"
        ]
      }
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/bookings/create",
        description: "Kicks off transaction booking sequence. Expects complete traveler and locked quote associations.",
        payload: '{ "quote_id": "qt_543fe...", "passengers": [{ "first_name": "John", "last_name": "Doe", "passport": "EP102394" }] }',
        response: '{ "booking_id": "bk_982ba...", "status": "reserved", "pnr": "XY76FA", "expiry_limit": "2026-06-28T04:15:00Z" }'
      }
    ],
    eventsEmitted: [
      {
        name: "booking.state.reserved",
        description: "Signals successful reservation at GDS/airline level, awaiting payment confirm step.",
        payload: '{ "booking_id": "bk_982ba...", "total_fare": 505.50, "pnr": "XY76FA" }'
      },
      {
        name: "booking.state.completed",
        description: "Ticketing sequence concluded. Auth state sealed.",
        payload: '{ "booking_id": "bk_982ba...", "user_email": "john.doe@example.com", "ticket_numbers": ["016-1234567890"] }'
      }
    ],
    eventsConsumed: [
      {
        name: "payment.charge.succeeded",
        description: "Fires from Stripe API integration. Instantly kicks off actual ticket issuance at airline.",
        trigger: "Updates database record from 'reserved' to 'completed' and triggers downstream airline ticketing API."
      },
      {
        name: "payment.charge.failed",
        description: "Refund or decline event, initiating cancel rollback steps.",
        trigger: "Triggers saga rollback workflow to release airline temporary seat locks."
      }
    ],
    dependencies: [
      "Authentication Context",
      "Payments Context",
      "Pricing Context"
    ],
    futureExtensions: [
      "Automated flight disruption rebooking worker (rebooks travelers on the next alternative leg within 5 seconds of receiving major carrier delay warnings)."
    ]
  },
  {
    id: "notifications",
    title: "Notifications Context",
    purpose: "Governs multichannel communication dispatch systems (email, SMS, web pushes, mobile apps) and tracks client notifications receipts.",
    responsibilities: [
      "Orchestrate templated alerts based on immediate system events.",
      "Enforce user delivery channel controls (e.g. email-only, SMS-only for urgent delay updates).",
      "Throttle duplicate announcements and compile historical dispatch files."
    ],
    tables: [
      {
        name: "notification_logs",
        description: "Audits outgoing logs to protect security rules.",
        columns: [
          "log_id (UUID, PRIMARY KEY)",
          "user_id (UUID, INDEX)",
          "channel (ENUM: email, sms, push)",
          "template_id (VARCHAR(30))",
          "recipient (VARCHAR(200))",
          "sent_status (ENUM: pending, sent, failed)",
          "dispatched_at (TIMESTAMP)"
        ]
      }
    ],
    apis: [
      {
        method: "PUT",
        path: "/api/v1/notifications/preferences",
        description: "Updates dispatch rule parameters for the logged-in profile.",
        payload: '{ "price_alerts": "push", "flight_updates": "sms", "newsletter": "none" }',
        response: '{ "status": "updated_successfully" }'
      }
    ],
    eventsEmitted: [
      {
        name: "notification.dispatch.sent",
        description: "Fires when SMS/email passes downstream gateways.",
        payload: '{ "log_id": "nl_4210a...", "recipient": "+15550199", "channel": "sms" }'
      }
    ],
    eventsConsumed: [
      {
        name: "booking.state.completed",
        description: "Listens to trigger immediate flight purchase confirmations with itinerary details.",
        trigger: "Loads transactional email templates and queues SMTP senders."
      },
      {
        name: "prediction.anomaly.detected",
        description: "Triggers instant notifications to users subscribed to matching routes.",
        trigger: "Pulls subscriber matching caches and fires SMS/Push grids."
      }
    ],
    dependencies: [
      "User Profiles Context"
    ],
    futureExtensions: [
      "Dynamic multi-language translations powered by AI translation pipelines."
    ]
  },
  {
    id: "analytics",
    title: "Analytics Context",
    purpose: "Ingests billions of telemetry logs, search volumes, and conversion variables to construct optimization metrics and training files.",
    responsibilities: [
      "Store high-throughput clickstream data.",
      "Compile dashboard statistics showing route lookup demands.",
      "Calculate real-time operational search KPI trends."
    ],
    tables: [
      {
        name: "search_metrics",
        description: "High-volume click logs written to parquet files on Cloud Storage and synced in BigQuery.",
        columns: [
          "search_metric_id (BIGINT, PRIMARY KEY)",
          "origin_airport (VARCHAR(3))",
          "destination_airport (VARCHAR(3))",
          "departure_date (DATE)",
          "user_agent (TEXT)",
          "session_id (VARCHAR(40))",
          "created_at (TIMESTAMP)"
        ]
      }
    ],
    apis: [
      {
        method: "GET",
        path: "/api/v1/analytics/dashboard/demands",
        description: "Retrieves aggregate numbers for internal marketing desks.",
        payload: "Query parameters: ?start_date=2026-06-01&end_date=2026-06-28",
        response: '{ "top_routes": [{ "route": "LHR-JFK", "searches": 450200 }], "conversion_rate": 0.024 }'
      }
    ],
    eventsEmitted: [
      {
        name: "analytics.daily.rollup.completed",
        description: "Emitted when daily calculations finish processing to trigger report generation.",
        payload: '{ "date": "2026-06-27", "total_searches": 1500000, "cache_hit_rate": 0.925 }'
      }
    ],
    eventsConsumed: [
      {
        name: "search.query.submitted",
        description: "Ingests every query log immediately into the data pipeline.",
        trigger: "Streams search record data points directly into Apache Kafka partition logs."
      }
    ],
    dependencies: [
      "Search Context"
    ],
    futureExtensions: [
      "Automated marketing budget allocation based on immediate conversion drops."
    ]
  },
  {
    id: "payments",
    title: "Payments Context",
    purpose: "Governs financial charge allocations, credit validation layers, secure double-entry accounting ledgers, and PCI-compliant tokens.",
    responsibilities: [
      "Handle payments via Stripe, Adyen, and regional payment options.",
      "Authorize, capture, and void currency locks.",
      "Enforce idempotency checks on financial transactions to avoid accidental double-charges."
    ],
    tables: [
      {
        name: "payment_transactions",
        description: "Audited financial journal matching transactions.",
        columns: [
          "transaction_id (UUID, PRIMARY KEY)",
          "booking_id (UUID, INDEX)",
          "payment_gateway_ref (VARCHAR(100))",
          "amount (NUMERIC(10,2))",
          "currency (VARCHAR(3))",
          "status (ENUM: preauth, captured, declined, refunded)",
          "error_code (VARCHAR(20))",
          "created_at (TIMESTAMP)"
        ]
      }
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/payments/charge",
        description: "Fires immediate payment authorizations across selected processor gateways.",
        payload: '{ "booking_id": "bk_982ba...", "payment_token": "tok_visa...", "amount": 505.50, "currency": "USD" }',
        response: '{ "transaction_id": "tx_2091a...", "status": "captured", "auth_code": "AU_876A" }'
      }
    ],
    eventsEmitted: [
      {
        name: "payment.charge.succeeded",
        description: "Informs booking context to finalize seat issuance.",
        payload: '{ "transaction_id": "tx_2091a...", "booking_id": "bk_982ba...", "amount": 505.50 }'
      },
      {
        name: "payment.charge.failed",
        description: "Triggers booking reservation cancellations.",
        payload: '{ "booking_id": "bk_982ba...", "reason": "insufficient_funds", "code": "card_declined" }'
      }
    ],
    eventsConsumed: [
      {
        name: "booking.state.reserved",
        description: "Listens to initialize payment window checks.",
        trigger: "Generates payment intent IDs."
      }
    ],
    dependencies: [
      "Booking Context"
    ],
    futureExtensions: [
      "Unified direct corporate credit lines and invoicing systems for B2B portal clients."
    ]
  },
  {
    id: "recommendations",
    title: "Recommendations Context",
    purpose: "Builds personalized search suggestion matrices and dynamic destination offerings utilizing individual customer search history files.",
    responsibilities: [
      "Analyze historical searches to suggest relevant deals.",
      "Manage home screen dynamic search carousels.",
      "Suggest hotel or car rental add-ons based on the destination airport."
    ],
    tables: [
      {
        name: "user_recommendation_profiles",
        description: "Holds computed affinity scores for origins, destinations, and cabin classes.",
        columns: [
          "profile_id (UUID, PRIMARY KEY)",
          "user_id (UUID, UNIQUE INDEX)",
          "preferred_origin (VARCHAR(3))",
          "affinity_score_map (JSONB)",
          "last_updated (TIMESTAMP)"
        ]
      }
    ],
    apis: [
      {
        method: "GET",
        path: "/api/v1/recommendations/deals",
        description: "Retrieves personalized trip deals based on affinity scores.",
        payload: "Query parameters: ?limit=5",
        response: '{ "deals": [{ "destination": "MAD", "score": 0.92, "lowest_fare": 350.00 }] }'
      }
    ],
    eventsEmitted: [
      {
        name: "recommendations.profile.updated",
        description: "Emitted when calculations complete, updating other caching systems.",
        payload: '{ "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", "top_affinity": "MAD" }'
      }
    ],
    eventsConsumed: [
      {
        name: "search.query.submitted",
        description: "Tracks active search histories to update user affinities in real-time.",
        trigger: "Invokes recommendation background jobs to recalculate recommendation rankings."
      }
    ],
    dependencies: [
      "User Profiles Context",
      "Search Context"
    ],
    futureExtensions: [
      "Joint-profile friend recommendation systems (e.g., matching travel suggestions for groups based on multiple individual search histories)."
    ]
  },
  {
    id: "travelintelligence",
    title: "Travel Intelligence (AI) Context",
    purpose: "Operates semantic planning systems, automated visa requirements lookups, and orchestrates conversational chat engines via Gemini-3.5-flash.",
    responsibilities: [
      "Drive interactive conversation sessions with users.",
      "Ground queries with flight schedules, booking inventories, and current destination visa rules.",
      "Perform multi-lingual itinerary translations and summarize baggage laws."
    ],
    tables: [
      {
        name: "ai_conversation_threads",
        description: "Stores chat session transcripts and model context tokens.",
        columns: [
          "thread_id (UUID, PRIMARY KEY)",
          "user_id (UUID, INDEX)",
          "summary (TEXT)",
          "conversation_history (JSONB)",
          "created_at (TIMESTAMP)",
          "updated_at (TIMESTAMP)"
        ]
      }
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/intelligence/chat",
        description: "Primary conversational interaction endpoint. Supports search grounding integration.",
        payload: '{ "thread_id": "td_123ba...", "message": "Do I need a visa for Japan if I hold a German passport?" }',
        response: '{ "reply": "No, German passport holders do not require a tourist visa for stays up to 90 days...", "suggested_followups": [...] }'
      }
    ],
    eventsEmitted: [
      {
        name: "intelligence.itinerary.generated",
        description: "Fires when user saves an AI-constructed travel plan.",
        payload: '{ "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", "destinations": ["TYO", "OSA"], "days": 7 }'
      }
    ],
    eventsConsumed: [
      {
        name: "booking.state.completed",
        description: "Pre-emptively scans destination country rules to prepare visa and travel advisories.",
        trigger: "Pre-warms chat cache with relevant entry requirements for the traveler's destination."
      }
    ],
    dependencies: [
      "Search Context",
      "Booking Context"
    ],
    futureExtensions: [
      "Dynamic OCR parsing of passenger documents (analyzing uploaded passports or visas to automatically flag entry validation issues before departure)."
    ]
  },
  {
    id: "userprofiles",
    title: "User Profiles Context",
    purpose: "Hosts core customer information, traveler preferences, stored payment configurations, and loyalty membership rosters.",
    responsibilities: [
      "Store traveler names, dates of birth, passports, and redress numbers.",
      "Hold home-airport preferences, dietary requests, and seat choices.",
      "Handle secure tokenized payment card registers."
    ],
    tables: [
      {
        name: "user_profiles",
        description: "General profile store containing customer configurations.",
        columns: [
          "user_id (UUID, PRIMARY KEY)",
          "first_name (VARCHAR(60))",
          "last_name (VARCHAR(60))",
          "phone_number (VARCHAR(20))",
          "home_airport (VARCHAR(3))",
          "loyalty_programs (JSONB)",
          "updated_at (TIMESTAMP)"
        ]
      }
    ],
    apis: [
      {
        method: "GET",
        path: "/api/v1/profiles/me",
        description: "Retrieves complete details for the currently logged-in customer.",
        payload: "Requires active auth session header",
        response: '{ "user_id": "9b1d...", "first_name": "Jane", "home_airport": "FRA", "loyalty_programs": {"LH": "98129"} }'
      }
    ],
    eventsEmitted: [
      {
        name: "user.profile.updated",
        description: "Published when user changes seat options, passport details, or loyalty information.",
        payload: '{ "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", "home_airport_changed_to": "CDG" }'
      }
    ],
    eventsConsumed: [
      {
        name: "auth.user.login.succeeded",
        description: "Saves active analytics login coordinates.",
        trigger: "Updates 'last_login' records for the logging user."
      }
    ],
    dependencies: [
      "Authentication Context"
    ],
    futureExtensions: [
      "Decentralized digital travel ID storage matching dynamic global terminal validation standards."
    ]
  },
  {
    id: "admin",
    title: "Admin Context",
    purpose: "Coordinates internal system operations, partner billing parameters, operational controls, and microservice parameters.",
    responsibilities: [
      "Manage pricing markups and dynamic service fee percentage tables.",
      "Block malicious search queries or shut down leaking API integrations.",
      "Audit logs across systems to satisfy SOC 2 regulations."
    ],
    tables: [
      {
        name: "system_configs",
        description: "Global runtime flags, circuit-breaker rules, and dynamic margin percentages.",
        columns: [
          "config_key (VARCHAR(100), PRIMARY KEY)",
          "config_value (JSONB)",
          "updated_by (UUID)",
          "updated_at (TIMESTAMP)"
        ]
      }
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/admin/circuit-breakers/toggle",
        description: "Manually triggers circuit breaker isolation over GDS/airline API integration points.",
        payload: '{ "connector_id": "conn_sabre_flights", "force_open": true }',
        response: '{ "status": "sabre_connector_forced_open_active" }'
      }
    ],
    eventsEmitted: [
      {
        name: "admin.config.changed",
        description: "Informs API gateways and microservices to immediately refresh dynamic variables.",
        payload: '{ "config_key": "global_markup_pct", "new_value": { "percentage": 1.5 } }'
      }
    ],
    eventsConsumed: [
      {
        name: "supplier.health.degraded",
        description: "Automatically opens circuit breakers if GDS response times skyrocket.",
        trigger: "Updates dynamic rules inside API gateways to redirect traffic to alternative NDC connectors."
      }
    ],
    dependencies: [
      "Partner Integrations Context"
    ],
    futureExtensions: [
      "Autonomic self-healing microservice clusters that isolate degraded routing paths dynamically using anomaly prediction models."
    ]
  },
  {
    id: "partnerintegrations",
    title: "Partner Integrations Context",
    purpose: "Handles partner API contracts, client credentials, system usage logs, and multi-tenant rate-limiting validations.",
    responsibilities: [
      "Provision and authenticate external partner API keys.",
      "Enforce API rate limits per account tier.",
      "Track B2B queries and calculate monthly white-label bills."
    ],
    tables: [
      {
        name: "partner_accounts",
        description: "B2B client registers detailing tiers, budgets, and rate configurations.",
        columns: [
          "partner_id (UUID, PRIMARY KEY)",
          "company_name (VARCHAR(100))",
          "tier (ENUM: basic, professional, enterprise)",
          "api_key_hash (VARCHAR(64), UNIQUE INDEX)",
          "monthly_query_quota (BIGINT)",
          "is_active (BOOLEAN)"
        ]
      }
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/partners/keys/generate",
        description: "Generates a new API key for the partner account.",
        payload: '{ "partner_id": "pt_301ea...", "label": "production-key" }',
        response: '{ "api_key": "fs_live_a1b2...", "status": "active" }'
      }
    ],
    eventsEmitted: [
      {
        name: "partner.quota.exceeded",
        description: "Broadcasts when client exceeds their daily rate limits.",
        payload: '{ "partner_id": "pt_301ea...", "quota_limit": 500000, "current_usage": 500012 }'
      }
    ],
    eventsConsumed: [
      {
        name: "analytics.daily.rollup.completed",
        description: "Aggregates billing logs to update partner balance summaries.",
        trigger: "Runs ledger calculations to update current API usage and generate monthly invoices."
      }
    ],
    dependencies: [
      "Analytics Context"
    ],
    futureExtensions: [
      "Self-service sandbox playgrounds for developer partners to test APIs with mocked data."
    ]
  },
  {
    id: "subscriptions",
    title: "Subscriptions Context",
    purpose: "Manages recurring user membership programs, premium alert subscriptions, and corporate account invoicing states.",
    responsibilities: [
      "Register subscription purchases and renewals.",
      "Expose endpoints to track billing cycles and payment intervals.",
      "Synchronize premium status fields dynamically across User Profile tables."
    ],
    tables: [
      {
        name: "user_subscriptions",
        description: "Authoritative membership ledger. Partitioned by expiration dates.",
        columns: [
          "subscription_id (UUID, PRIMARY KEY)",
          "user_id (UUID, INDEX)",
          "plan_id (VARCHAR(30))",
          "status (ENUM: active, trialing, past_due, canceled)",
          "current_period_start (TIMESTAMP)",
          "current_period_end (TIMESTAMP)",
          "stripe_subscription_id (VARCHAR(100))"
        ]
      }
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/subscriptions/checkout",
        description: "Redirects customer to Stripe Checkout portals for membership upgrades.",
        payload: '{ "plan_id": "premium_monthly", "success_url": "https://flysmart.com/success" }',
        response: '{ "checkout_session_url": "https://checkout.stripe.com/pay/cs_live..." }'
      }
    ],
    eventsEmitted: [
      {
        name: "subscription.status.changed",
        description: "Announces billing updates. Grants premium access permissions in the target profile.",
        payload: '{ "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", "new_status": "active", "plan": "premium_monthly" }'
      }
    ],
    eventsConsumed: [
      {
        name: "payment.charge.succeeded",
        description: "Validates subscription purchases upon billing webhook receipts.",
        trigger: "Updates the subscription registry to mark the status as 'active' and extends the expiration date."
      }
    ],
    dependencies: [
      "Payments Context",
      "User Profiles Context"
    ],
    futureExtensions: [
      "Shared family subscription packages with variable seat distributions."
    ]
  },
  {
    id: "fraud",
    title: "Fraud Detection Context",
    purpose: "Analyzes booking parameters in real-time to compute fraud probability metrics and flag chargebacks or automated exploit bots.",
    responsibilities: [
      "Calculate transaction risk ratings during checkout sequences.",
      "Check booking IP locations against standard credit card coordinates.",
      "Flag automated scraping bots trying to crawl prices."
    ],
    tables: [
      {
        name: "fraud_evaluations",
        description: "Stores real-time transactions analysis files.",
        columns: [
          "evaluation_id (UUID, PRIMARY KEY)",
          "booking_id (UUID, INDEX)",
          "risk_score (FLOAT)",
          "flagged_rules (JSONB)",
          "status (ENUM: approved, flagged, blocked)",
          "evaluated_at (TIMESTAMP)"
        ]
      }
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/fraud/evaluate",
        description: "Calculates instant risk scores for incoming reservation orders.",
        payload: '{ "booking_id": "bk_982ba...", "ip_address": "198.51.100.12", "card_bin": "411111" }',
        response: '{ "evaluation_id": "ev_732ea...", "risk_score": 0.12, "status": "approved" }'
      }
    ],
    eventsEmitted: [
      {
        name: "fraud.suspicious_activity.detected",
        description: "Fires to block suspect profiles and protect ticketing inventories.",
        payload: '{ "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", "reason": "impossible_travel_distance", "score": 0.95 }'
      }
    ],
    eventsConsumed: [
      {
        name: "booking.state.reserved",
        description: "Automatically triggers a fraud review for every new booking reservation.",
        trigger: "Evaluates the booking details and updates the fraud analysis ledger."
      }
    ],
    dependencies: [
      "Booking Context"
    ],
    futureExtensions: [
      "Federated zero-knowledge proof checks to validate user identities without exposing private passports."
    ]
  }
];
