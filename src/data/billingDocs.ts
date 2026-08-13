export interface BillingTier {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnually: number;
  description: string;
  includedSeats: number;
  seatPriceMonthly: number;
  apiQuota: string;
  includedFeatures: string[];
  stripePriceIdMonthly: string;
  stripePriceIdAnnually: string;
}

export interface BillingWebhookEvent {
  eventType: string;
  description: string;
  payloadTemplate: string;
  triggersLifecycleState: string;
}

export interface MetricQuota {
  name: string;
  unit: string;
  limitFree: number;
  limitPro: number;
  limitBusiness: number;
  limitEnterprise: string;
}

export const BILLING_TIERS: BillingTier[] = [
  {
    id: "free",
    name: "Developer Free",
    priceMonthly: 0,
    priceAnnually: 0,
    description: "Ideal for sandbox exploration, prototyping, and integrating simple flight search streams.",
    includedSeats: 1,
    seatPriceMonthly: 0,
    apiQuota: "5,000 / mo",
    includedFeatures: [
      "Standard Rest Search APIs",
      "Unified Schema Mapping",
      "Local Cache Mocking",
      "Public Developer Slack Support"
    ],
    stripePriceIdMonthly: "price_free_sandbox_m",
    stripePriceIdAnnually: "price_free_sandbox_y"
  },
  {
    id: "pro",
    name: "SaaS Professional",
    priceMonthly: 149,
    priceAnnually: 119,
    description: "Built for scaling regional flight booking platforms, independent travel agents, and active flight search widgets.",
    includedSeats: 3,
    seatPriceMonthly: 15,
    apiQuota: "150,000 / mo",
    includedFeatures: [
      "High-Priority NDC API Feeds",
      "Automated Failover Router (Circuit Breaker Access)",
      "Multi-provider Consolidation",
      "Up to 3 Corporate Seats Included",
      "99.9% Search Response SLA"
    ],
    stripePriceIdMonthly: "price_pro_flight_149_m",
    stripePriceIdAnnually: "price_pro_flight_119_y"
  },
  {
    id: "business",
    name: "Corporate Enterprise",
    priceMonthly: 799,
    priceAnnually: 649,
    description: "Engineered for high-volume corporate travel applications, larger teams, and dedicated agency operators.",
    includedSeats: 10,
    seatPriceMonthly: 12,
    apiQuota: "1,500,000 / mo",
    includedFeatures: [
      "All Pro Features",
      "Dynamic Ancillaries & Seat Selection Mapping",
      "Corporate Billing Consolidation",
      "Up to 10 Seats Included",
      "Dedicated Technical Account Manager",
      "mTLS & Custom Endpoint Domain Support"
    ],
    stripePriceIdMonthly: "price_biz_flight_799_m",
    stripePriceIdAnnually: "price_biz_flight_649_y"
  },
  {
    id: "enterprise",
    name: "Global Sovereign Alliance",
    priceMonthly: 2999,
    priceAnnually: 2499,
    description: "Sovereign cloud integration tailored for tier-1 national carriers, global OTAs, and airline networks.",
    includedSeats: 50,
    seatPriceMonthly: 10,
    apiQuota: "Unlimited (Metered pricing overrides)",
    includedFeatures: [
      "Unlimited Seats & Advanced Organization Hierarchy",
      "Custom GDS Native Protocol Bridges (SOAP XML direct)",
      "Zero-Latency Cache Infrastructure Co-location",
      "SAML 2.0 / SCIM IdP Federation Mapping",
      "99.999% SLA Guarantee with Liquidated Damages",
      "Custom Multi-Region Kubernetes Dedicated Cluster"
    ],
    stripePriceIdMonthly: "price_ent_flight_2999_m",
    stripePriceIdAnnually: "price_ent_flight_2499_y"
  }
];

export const METRIC_QUOTAS: MetricQuota[] = [
  {
    name: "Search Queries Metering",
    unit: "Requests / Month",
    limitFree: 5000,
    limitPro: 150000,
    limitBusiness: 1500000,
    limitEnterprise: "Custom / Negotiated"
  },
  {
    name: "Organization Seats",
    unit: "Registered Accounts",
    limitFree: 1,
    limitPro: 3,
    limitBusiness: 10,
    limitEnterprise: "Unlimited"
  },
  {
    name: "Active Webhooks Delivery",
    unit: "Target Endpoints",
    limitFree: 1,
    limitPro: 5,
    limitBusiness: 20,
    limitEnterprise: "Unlimited"
  },
  {
    name: "Cache Retention Time",
    unit: "Maximum Hours",
    limitFree: 1,
    limitPro: 12,
    limitBusiness: 72,
    limitEnterprise: "Infinite / Custom Rules"
  }
];

export const STRIPE_WEBHOOKS: BillingWebhookEvent[] = [
  {
    eventType: "checkout.session.completed",
    description: "Dispatched when an initial checkout or upgrade is completed. Activates corresponding license parameters in our database.",
    payloadTemplate: `{
  "id": "evt_chk_10293",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_a1b2c3",
      "customer": "cus_N7x81jK3",
      "subscription": "sub_1Qp9b0F29X",
      "amount_total": 14900,
      "currency": "usd",
      "metadata": {
        "org_id": "org_travel_alliance",
        "tier_id": "pro"
      }
    }
  }
}`,
    triggersLifecycleState: "ACTIVE"
  },
  {
    eventType: "invoice.paid",
    description: "Sent on successful cyclical renewal. Extends active billing epoch for 30 or 365 days and provisions quota balances.",
    payloadTemplate: `{
  "id": "evt_inv_paid_3820",
  "type": "invoice.paid",
  "data": {
    "object": {
      "id": "in_1Op9c8F29X",
      "customer": "cus_N7x81jK3",
      "subscription": "sub_1Qp9b0F29X",
      "amount_paid": 14900,
      "status": "paid",
      "next_payment_attempt": null
    }
  }
}`,
    triggersLifecycleState: "RENEWED"
  },
  {
    eventType: "invoice.payment_failed",
    description: "Sent when automatic charge attempts fail. Transitions state to PAST_DUE and initiates the smart retry dunning flow.",
    payloadTemplate: `{
  "id": "evt_inv_fail_7730",
  "type": "invoice.payment_failed",
  "data": {
    "object": {
      "id": "in_1Op9c8F29X",
      "customer": "cus_N7x81jK3",
      "subscription": "sub_1Qp9b0F29X",
      "attempt_count": 1,
      "next_payment_attempt": 1782724800,
      "billing_reason": "subscription_cycle"
    }
  }
}`,
    triggersLifecycleState: "PAST_DUE"
  },
  {
    eventType: "customer.subscription.deleted",
    description: "Triggered at the end of the current period if subscription cancellation is finalized. Revokes feature scopes.",
    payloadTemplate: `{
  "id": "evt_sub_del_2190",
  "type": "customer.subscription.deleted",
  "data": {
    "object": {
      "id": "sub_1Qp9b0F29X",
      "customer": "cus_N7x81jK3",
      "status": "canceled"
    }
  }
}`,
    triggersLifecycleState: "REVOKED_CANCELED"
  }
];

export const DUNNING_STEPS = [
  {
    day: "Day 1 (Failure)",
    action: "Invoice Payment Failed Event",
    status: "Active (Grace Period)",
    mechanism: "Email notice sent to customer billing contact. Card auto-updater checked for updated network tokens. Temporary 14-day soft grace period applied."
  },
  {
    day: "Day 3 (Retry 1)",
    action: "Smart Retry Dispatch #1",
    status: "Active (Grace Period)",
    mechanism: "Stripe Smart Retry engine analyzes telemetry (bank traffic, time of day) and retries card. Soft notification shown inside the application console."
  },
  {
    day: "Day 7 (Retry 2)",
    action: "Smart Retry Dispatch #2 & Notification",
    status: "Degraded API Limits",
    mechanism: "Second retry executed. Platform enforces read-only access (flight bookings blocked, queries throttled to developer baseline free limits)."
  },
  {
    day: "Day 14 (Retry 3)",
    action: "Final Card Retry",
    status: "Throttled Access",
    mechanism: "Third retry. Alert notification flag raised on executive billing dashboard. Technical support assigned to initiate high-touch outreach."
  },
  {
    day: "Day 21 (Final Revoke)",
    action: "Subscription Termination",
    status: "Terminated / Revoked",
    mechanism: "Stripe subscription officially transitions to canceled status. Org data locked, API keys disabled, credentials moved to archive vaults."
  }
];

export const CANCELLATION_STEPS = [
  {
    step: "1. Intent Captured",
    title: "Downgrade Offer Presentation",
    description: "Instead of canceling immediately, offer a 50% discount for three months or the option to 'Pause Subscription' for 30-90 days to preserve historical search configurations."
  },
  {
    step: "2. Churn Feedback",
    title: "Granular Feedback Survey",
    description: "Prompt user for specific churn categories (pricing constraints, lacking GDS carriers, performance latency, projects on hold) to trigger feedback loops to the product core."
  },
  {
    step: "3. Soft Off-ramp",
    title: "Grace Period & Dev Baseline Lock",
    description: "Subscription continues functioning until the current epoch ends. When expired, the account auto-downgrades to the 'Developer Free Sandbox' rather than losing all dashboards."
  }
];
