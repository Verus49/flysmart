export interface DbTable {
  name: string;
  description: string;
  ddl: string;
  indexes: { name: string; columns: string[]; type: string; purpose: string }[];
  partitioning?: string;
}

export interface DatabaseEngineDoc {
  id: string;
  name: string;
  role: string;
  technology: string;
  strengths: string[];
  tables: DbTable[];
  policies: { title: string; details: string }[];
}

export const DATABASE_DOCS: DatabaseEngineDoc[] = [
  {
    id: "postgresql",
    name: "PostgreSQL (Citus Sharded + Highly Available)",
    role: "Core Transactional Storage (OLTP)",
    technology: "Google Cloud SQL / Citus Sharded Postgres 16",
    strengths: [
      "Strict ACID compliance for booking and financial ledgers.",
      "Citus horizontal sharding by user_id to handle massive scale.",
      "Multi-region read replicas with automated streaming replication.",
      "Rich JSONB document indexing for extensible traveler profiles."
    ],
    tables: [
      {
        name: "auth_users",
        description: "Stores core customer credentials, secure multi-factor authentication secrets, and lock states.",
        ddl: `CREATE TABLE auth_users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- Argon2id hash
  mfa_secret VARCHAR(128),              -- Encrypted via Cloud KMS
  status VARCHAR(32) NOT NULL DEFAULT 'pending_verification', -- 'active', 'locked'
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`,
        indexes: [
          { name: "idx_auth_users_email", columns: ["email"], type: "B-Tree", purpose: "Fast sub-millisecond lookup during user login flows." },
          { name: "idx_auth_users_status", columns: ["status"], type: "B-Tree", purpose: "Filtering of locked accounts and maintenance routines." }
        ],
        partitioning: "Sharded horizontally using Citus extension on 'user_id' hash values."
      },
      {
        name: "user_profiles",
        description: "Maintains traveler demographic details, home airport preferences, and encrypted passport data.",
        ddl: `CREATE TABLE user_profiles (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(user_id) ON DELETE CASCADE,
  first_name VARCHAR(128) NOT NULL,
  last_name VARCHAR(128) NOT NULL,
  date_of_birth DATE,
  home_airport CHAR(3),                 -- IATA Code (e.g., 'FRA')
  passport_encrypted BYTEA,             -- Envelope AES-256-GCM encrypted
  passport_kms_key_id VARCHAR(128),     -- Google Cloud KMS key path
  loyalty_accounts JSONB DEFAULT '{}',  -- e.g., {"LH": "LH12038", "UA": "UA90218"}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`,
        indexes: [
          { name: "idx_profiles_user_id", columns: ["user_id"], type: "B-Tree", purpose: "Instant retrieval of profile parameters on user session hydration." },
          { name: "idx_profiles_loyalty_gin", columns: ["loyalty_accounts"], type: "GIN", purpose: "Dynamic indexing of nested loyalty program account numbers." }
        ],
        partitioning: "Co-located horizontally on the same database shard node as auth_users via Citus on 'user_id'."
      },
      {
        name: "bookings",
        description: "Authoritative repository for flight orders, reservation statuses, and total checkout quotes.",
        ddl: `CREATE TABLE bookings (
  booking_id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(user_id),
  pnr VARCHAR(8) UNIQUE,                -- Supplier Passenger Name Record (e.g. 'XP291A')
  quote_id UUID NOT NULL,               -- Tied to dynamic pricing lock
  total_amount NUMERIC(12, 4) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(32) NOT NULL DEFAULT 'reserved', -- 'reserved', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (booking_id, created_at)   -- Compound key enabling date partitioning
);`,
        indexes: [
          { name: "idx_bookings_user_id", columns: ["user_id"], type: "B-Tree", purpose: "Retrieve traveler booking history dashboards." },
          { name: "idx_bookings_pnr", columns: ["pnr"], type: "B-Tree", purpose: "Quick search by global carrier reference codes." }
        ],
        partitioning: "Range partitioned by year-month on 'created_at' to streamline operational database sizing."
      },
      {
        name: "passengers",
        description: "Captures travelers designated under individual booking structures.",
        ddl: `CREATE TABLE passengers (
  passenger_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  booking_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  first_name VARCHAR(128) NOT NULL,
  last_name VARCHAR(128) NOT NULL,
  passport_number VARCHAR(64) NOT NULL,  -- Cryptographically encrypted columns
  nationality CHAR(2) NOT NULL,          -- ISO 3166-1 alpha-2 code
  FOREIGN KEY (booking_id, booking_created_at) REFERENCES bookings(booking_id, created_at) ON DELETE CASCADE
);`,
        indexes: [
          { name: "idx_passengers_booking_id", columns: ["booking_id"], type: "B-Tree", purpose: "Load traveler arrays under a single ticket view." }
        ]
      },
      {
        name: "payment_transactions",
        description: "Logs credit card charges, transaction identifiers, and processing gateways outcomes.",
        ddl: `CREATE TABLE payment_transactions (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  gateway_name VARCHAR(64) NOT NULL,     -- 'Stripe', 'Adyen'
  external_charge_id VARCHAR(255) UNIQUE,-- Gateway transaction hash
  amount NUMERIC(12, 4) NOT NULL,
  currency CHAR(3) NOT NULL,
  status VARCHAR(32) NOT NULL,           -- 'succeeded', 'failed', 'refunded'
  idempotency_key VARCHAR(255) UNIQUE,   -- Double-charge prevention
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`,
        indexes: [
          { name: "idx_payments_booking_id", columns: ["booking_id"], type: "B-Tree", purpose: "Audit trails matching checkout orders." },
          { name: "idx_payments_idempotency", columns: ["idempotency_key"], type: "B-Tree", purpose: "Enforce API level payment double-entry safeguards." }
        ]
      },
      {
        name: "financial_ledger_entries",
        description: "Implements strict immutable double-entry auditing for platform accounting reconciliations.",
        ddl: `CREATE TABLE financial_ledger_entries (
  ledger_id BIGSERIAL PRIMARY KEY,
  transaction_id UUID REFERENCES payment_transactions(transaction_id),
  account_code VARCHAR(32) NOT NULL,     -- e.g. 'REV_FLIGHTS', 'CASH_GATEWAY'
  debit NUMERIC(12, 4) DEFAULT 0.0,
  credit NUMERIC(12, 4) DEFAULT 0.0,
  reconciled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`,
        indexes: [
          { name: "idx_ledger_account_code", columns: ["account_code"], type: "B-Tree", purpose: "Fast balance aggregations for billing close cycles." },
          { name: "idx_ledger_reconciled", columns: ["reconciled"], type: "B-Tree", purpose: "Filter non-reconciled rows for automated daily ledger audits." }
        ]
      },
      {
        name: "user_subscriptions",
        description: "Manages premium tier benefits status, interval terms, and Stripe billing links.",
        ddl: `CREATE TABLE user_subscriptions (
  subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(user_id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  plan_tier VARCHAR(32) NOT NULL DEFAULT 'free', -- 'free', 'silver', 'gold'
  status VARCHAR(32) NOT NULL,           -- 'active', 'past_due', 'canceled'
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`,
        indexes: [
          { name: "idx_subs_user_id", columns: ["user_id"], type: "B-Tree", purpose: "Dynamic subscription validation on user API Gateway access." }
        ],
        partitioning: "Co-located horizontally on user_id across database shard configurations."
      }
    ],
    policies: [
      {
        title: "Replication Topology",
        details: "We provision Google Cloud SQL PostgreSQL databases with High Availability configured across secondary Availability Zones utilizing synchronous physical streaming replication. Read scale is satisfied via 3 localized read replica instances geo-routed nearest to inbound gateway API traffic edges."
      },
      {
        title: "Continuous Automated Backups & PITR",
        details: "Automated incremental daily snapshots are retained for 35 days. Write-Ahead Logs (WAL) are archived continuously (every 60 seconds) into multi-region Google Cloud Object Storage, permitting sub-minute Point-In-Time Recovery (PITR) to recover states from any arbitrary timestamp inside the 35-day backup window."
      },
      {
        title: "Multi-Region Strategy",
        details: "Primary database processes handle writes globally. In adjacent regions, read replicas satisfy local user reads in under 5ms. In case of primary regional failures, automated failover triggers promote the secondary availability zone replica to master in under 15 seconds with zero data loss (RPO=0, RTO < 15s)."
      },
      {
        title: "Data Optimization & PgBouncer",
        details: "To protect database nodes from process exhaustion, connection pooling is handled by PgBouncer instances running inside sidecars on Kubernetes, operating in 'transaction' pooling mode. Maximum active client links scale comfortably to 20,000 threads while maintaining fixed connections of 100 threads to physical Postgres kernels."
      }
    ]
  },
  {
    id: "redis",
    name: "Redis Cluster (In-Memory Fast State)",
    role: "Caching, Sessions, Rate Limiting & Distributed Locking",
    technology: "Google Cloud Memorystore Redis Cluster v7.2",
    strengths: [
      "Sub-millisecond query execution speeds entirely in-memory.",
      "Native key expiry configurations streamlining dynamic locks.",
      "High performance Redis Sentinel replication topologies.",
      "Atomic operations facilitating precise rate limit counters."
    ],
    tables: [
      {
        name: "Key Structure: session:{user_id}",
        description: "In-memory token hashes providing instantaneous session state evaluations.",
        ddl: `Key Type: Hash
Fields:
  - token_hash: SHA256 string validation
  - device_id: Client fingerprint identifier
  - user_tier: Premium status tier ('free', 'gold')
  - expires_at: UNIX epoch limit
TTL: 900 seconds (15 minutes sliding window)`,
        indexes: [
          { name: "Direct key lookup", columns: ["session:{user_id}"], type: "Direct Memory", purpose: "Fast user authentication parsing at edge API gateways." }
        ]
      },
      {
        name: "Key Structure: rate:ip:{ip_address}",
        description: "Implements high-speed Sliding Window log parameters to block denial of service threats.",
        ddl: `Key Type: Sorted Set (ZSET)
Members:
  - Value: Epoch milliseconds timestamp
  - Score: Epoch milliseconds timestamp
Operations: ZADD on arrival, ZREMRANGEBYSCORE to trim windows, ZCARD to check count thresholds.
TTL: 60 seconds`,
        indexes: []
      },
      {
        name: "Key Structure: quote:lock:{quote_id}",
        description: "Guarantees ticket pricing calculations are locked during the 15-minute checkout sequence.",
        ddl: `Key Type: Hash
Fields:
  - total_amount: 505.50
  - carrier_itinerary_ref: Supplier locator
  - seat_class: 'K' class
TTL: 900 seconds (15 minutes strictly enforced)`,
        indexes: []
      },
      {
        name: "Key Structure: dlock:seat:{flight_id}:{seat_no}",
        description: "Distributed Mutex lock to prevent double bookings of seats during Saga operations.",
        ddl: `Key Type: String
Value: Unique booking_id UUID
Command: SET dlock:seat:... booking_id NX PX 30000
TTL: 30,000 milliseconds (30 seconds auto-expiration to prevent deadlocks)`,
        indexes: []
      }
    ],
    policies: [
      {
        title: "Eviction Policies & Eviction Rules",
        details: "We configure Redis instances with 'volatile-lru' (Least Recently Used with active expiry parameters) eviction rules. Under high memory situations, transient query result cache entries are cleared, while critical in-flight transaction locks and session databases are fully protected."
      },
      {
        title: "Persistence Safeguards",
        details: "Redis maintains high availability using a primary-standby architecture across distinct subzones. Persistence utilizes AOF (Append-Only File) configured with 'appendfsync everysec' paired with background RDB snapshots hourly, balancing durability and processing speed."
      },
      {
        title: "Caching Patterns",
        details: "We use a 'Cache-Aside' (Read-Through) configuration for flight search schedules, while utilizing 'Write-Through' mechanics for session state registers. Invalidation is managed via Kafka: any admin update to pricing or carrier rules immediately publishes invalidation events to clear cached keys globally."
      }
    ]
  },
  {
    id: "clickhouse",
    name: "ClickHouse (OLAP Columnar Analytic Engine)",
    role: "High-Throughput Streaming & Columnar Analytics",
    technology: "Self-hosted ClickHouse Cluster on GKE using local NVMe drives",
    strengths: [
      "Extremely fast columnar compression (LZ4/ZSTD) maximizing disk storage ratios.",
      "Handles up to millions of ingested logs per second effortlessly.",
      "Optimized for scanning billions of rows in under a second.",
      "Vectorized query execution taking advantage of hardware pipelines."
    ],
    tables: [
      {
        name: "search_metrics",
        description: "High-volume clickstream logs capturing search configurations, user locations, and search filters.",
        ddl: `CREATE TABLE search_metrics (
  event_date Date,
  event_time DateTime64(3, 'UTC'),
  user_id UUID,
  origin LowCardinality(String),          -- e.g. 'FRA'
  destination LowCardinality(String),     -- e.g. 'JFK'
  departure_date Date,
  cabin_class LowCardinality(String),     -- e.g. 'economy'
  device_platform Enum('web'=1, 'ios'=2, 'android'=3),
  response_time_ms UInt32,
  results_count UInt16
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (origin, destination, event_date, cabin_class)
SETTINGS index_granularity = 8192;`,
        indexes: [
          { name: "minmax_departure", columns: ["departure_date"], type: "minmax", purpose: "Fast date boundaries skipping on historical range queries." }
        ],
        partitioning: "Partitioned by Year-Month of 'event_date' to enable fast partition drop maintenance."
      },
      {
        name: "historical_flight_trends",
        description: "Tracks dynamic pricing aggregations over historical flights to construct prediction trends.",
        ddl: `CREATE TABLE historical_flight_trends (
  query_date Date,
  flight_id String,
  carrier LowCardinality(String),
  departure_date Date,
  cabin_class LowCardinality(String),
  base_fare Float32,
  tax_fare Float32,
  seat_availability_index UInt8
) ENGINE = ReplacingMergeTree(query_date)
PARTITION BY toYYYYMM(departure_date)
ORDER BY (carrier, departure_date, flight_id, cabin_class);`,
        indexes: [],
        partitioning: "Partitioned by departure month."
      },
      {
        name: "anomaly_records",
        description: "Tracks detected mistake flight fares, pricing trend variances, and security anomaly audits.",
        ddl: `CREATE TABLE anomaly_records (
  detected_time DateTime64(3, 'UTC'),
  flight_id String,
  origin LowCardinality(String),
  destination LowCardinality(String),
  base_fare Float32,
  standard_deviation Float32,
  confidence_score Float32,
  verdict Enum('flagged'=1, 'dismissed'=2, 'escalated'=3)
) ENGINE = MergeTree()
ORDER BY (detected_time, origin, destination);`,
        indexes: []
      }
    ],
    policies: [
      {
        title: "Ingestion Pipeline Strategy",
        details: "To protect ClickHouse from resource starvation from tiny direct writes, log streams are bundled using Kafka. Confluent streams route telemetries to clickstream topics, which ClickHouse consumes via the ClickHouse Kafka Engine using bulk micro-batches (minimum 10,000 rows or 5-second intervals)."
      },
      {
        title: "Data Optimization & Projections",
        details: "We use ClickHouse Projection Indices to maintain alternative sorting patterns inside identical tables, preventing secondary table duplications. ClickHouse tables employ LZ4 compression for fast query speeds, and ZSTD for archived older partitions to save 70% of storage space."
      },
      {
        title: "Cold Storage & Tiered Storage",
        details: "We implement ClickHouse Multi-Volume Tiered Storage: Hot partitions (less than 14 days old) reside on local high-performance NVMe SSDs to sustain high-speed queries. Partitions older than 14 days are automatically migrated to Google Cloud Storage (Object Storage buckets) via ClickHouse's S3 Disk integration, providing unlimited storage at minimal cost."
      }
    ]
  },
  {
    id: "object_storage",
    name: "Object Storage (Data Lake & Documents)",
    role: "Unstructured File Storage & Analytic Archives",
    technology: "Google Cloud Storage (GCS) / AWS S3",
    strengths: [
      "99.999999999% ('11 nines') of durability guarantees.",
      "Cost-effective tiered lifecycles.",
      "Supports massive parallel read bandwidth.",
      "Native IAM and key encryption integrations."
    ],
    tables: [
      {
        name: "Bucket: clickstream-raw-archives",
        description: "Stores historical analytic logs in structured compressed formats (Apache Parquet/Iceberg) for long-term machine learning training.",
        ddl: `Path Schema: gs://flysmart-analytics/clickstream/year={YYYY}/month={MM}/day={DD}/*.parquet
Format: Apache Parquet
Security: Server-Side Encryption (SSE-KMS) with customer-managed keys.`,
        indexes: []
      },
      {
        name: "Bucket: passenger-documents",
        description: "Stores traveler uploaded passport scans, visa documentation images, and dynamic invoice PDFs.",
        ddl: `Path Schema: gs://flysmart-passengers/documents/{booking_id}/{passenger_id}_passport.enc
Format: Multi-modal Image / PDF binaries
Security: Dual-layer encryption (Application level AES-GCM-256 envelope + GCS bucket-level encryption).`,
        indexes: []
      },
      {
        name: "Bucket: travel-regulations-source",
        description: "Stores raw regulatory handbooks, consulate guidelines, and baggage files parsed by Gemini models.",
        ddl: `Path Schema: gs://flysmart-intelligence/regulations/{country_code}/*.pdf
Format: Text / PDF
Security: Standard bucket ACLs with IAM read-only access for travel-doc-copilot microservice models.`,
        indexes: []
      }
    ],
    policies: [
      {
        title: "Lifecycle & Retention Policies",
        details: "GDPR compliance rules are enforced via automated storage tier lifecycles: Clickstream raw files in 'flysmart-analytics' are moved to Nearline storage after 90 days, Coldline after 180 days, and automatically deleted after 365 days unless flagged for active ML modeling. Passenger passport images are strictly purged within 7 days of complete itinerary returns."
      },
      {
        title: "Multi-Region Redundancy",
        details: "Object Storage buckets are configured using GCS 'Multi-Region' configurations (e.g. US or EU dual-regions). GCS guarantees instant sub-second access to files in any region, providing strong operational redundancy during regional outages."
      },
      {
        title: "Backups Strategy",
        details: "Bucket Object Versioning is enabled to prevent accidental deletion or overwriting of files. Version histories are preserved for 30 days, shielding critical operational logs and customer invoices from user errors or systemic security incidents."
      }
    ]
  }
];
