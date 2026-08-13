import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const ai = getGenAIClient();
      if (!ai) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY environment variable is not configured. Please set GEMINI_API_KEY in your server environment settings." 
        });
      }

      // System instruction defining the Chief Architect persona
      const systemInstruction = `You are the world-class Chief Software Architect for FlySmart (flysmart), a production-grade global Flight Intelligence Platform designed to serve millions of users. 
Your platform is NOT just a flight search website; it helps travelers find cheaper flights, predict future prices, detect mistake fares, recommend better routes, and provide AI assistance.

Core architecture characteristics of FlySmart:
- Ultra-fast search (Edge computing, Anycast routing, L1/L2 multi-tier caching: L1 CDN Edge <50ms, L2 Redis Cluster, L3 Spanner/NoSQL).
- Event-driven, modular microservices (Kafka/GCP PubSub event bus, Golang search adapters for NDC/GDS, Python ML engine for prediction, Java booking orchestration).
- Global Active-Active multi-region deployment on GCP (GKE, Cloud Spanner for transactional consistency, Cloud Run for serverless APIs, Bigtable for clickstreams).
- Cache Hit Ratio target: >92% to minimize infrastructure costs (GDS search queries cost $0.02 each, cached lookups cost $0.0001, saving 99.5% on flight query overhead).
- Mistake fare detection engine: Stream processing with Apache Flink, calculating standard deviation of fares on specific routes and alerting within seconds.
- Integration with GDS (Sabre, Amadeus, Travelport) and LCC direct NDC APIs using standardized XML/JSON parser adapter microservices.

We have fully designed FlySmart using Domain-Driven Design (DDD) with 15 highly-specific Bounded Contexts:
1. Authentication: Manages auth_users, auth_sessions, OAuth 2.1 tokens, passkeys, and rate limits. Emits auth.user.login.succeeded, auth.user.account.locked.
2. Search: Syncs flight_schedules from OAG, coordinates multi-GDS parallel queries, and manages cache indices. Emits search.query.submitted.
3. Pricing: Calculates fare locks and condition assessments, writing to fare_rules. Emits pricing.fare.locked.
4. Prediction: Runs ML models on route_price_aggregates for buy/wait verdicts. Emits prediction.anomaly.detected for mistake fares.
5. Booking: Directs distributed sagas over bookings and passengers. Emits booking.state.reserved and booking.state.completed.
6. Notifications: Sends multichannel alerts using notification_logs, preference-driven throttling.
7. Analytics: Tracks high-throughput search_metrics streams into BigQuery/Kafka.
8. Payments: Handles payments (Stripe/Adyen), ledger balances, and card registers. Emits payment.charge.succeeded, payment.charge.failed.
9. Recommendations: Runs affinity scores to update user_recommendation_profiles.
10. Travel Intelligence (AI): Drives LLM semantic agents, visa checks, OCR passport parsing, mapping to ai_conversation_threads.
11. User Profiles: Stores traveler profiles, passport logs, loyalty accounts. Emits user.profile.updated.
12. Admin: Configures system_configs flags, circuit-breaker margins, and system rule overrides. Emits admin.config.changed.
13. Partner Integrations: Authenticates keys for partner_accounts, logs queries for white-label invoice rollups.
14. Subscriptions: Operates user_subscriptions registers, membership plans, and billing intervals. Emits subscription.status.changed.
15. Fraud Detection: Computes risk factors on fraud_evaluations, detecting bot scraping and impossible-travel exploits.

Answer the user's questions in a highly professional, extremely technical, authoritative, and helpful manner. Do not simplify. Reference concrete tables, endpoints, and event structures from this DDD schema (e.g., Citus-sharded Postgres tables, Confluent Kafka events, Stripe hooks) and explain architectural patterns in detail. Include architectural diagrams or structured lists when helpful.`;

      const chatHistory = history ? history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })) : [];

      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
        history: chatHistory,
      });

      const response = await chat.sendMessage({ message: message });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate architect response" });
    }
  });

  // System Health Dashboard API route for real-time observability
  app.get("/api/system-health", (req, res) => {
    const isSpike = req.query.spike === "true";
    const isErrorSurge = req.query.errorSurge === "true";
    const now = new Date();
    
    // Generate history points (20 intervals leading up to now)
    const historyLength = 20;
    const requestRateHistory = [];
    const cacheMetricsHistory = [];
    
    const baseRps = isSpike ? 28500 : 14800;
    const errorFactor = isErrorSurge ? 3.8 : 0.08;

    for (let i = historyLength - 1; i >= 0; i--) {
      const timePoint = new Date(now.getTime() - i * 3000);
      const timeStr = timePoint.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const variance = (Math.sin(i * 0.5) * 800) + ((Math.random() - 0.5) * 600);
      const rps = Math.round(baseRps + variance + (i === 0 && isSpike ? 6000 : 0));
      
      const searchReqs = Math.round(rps * 0.58);
      const pricingReqs = Math.round(rps * 0.22);
      const bookingReqs = Math.round(rps * 0.12);
      const otherReqs = rps - (searchReqs + pricingReqs + bookingReqs);
      
      const err4xx = Math.round(rps * (errorFactor / 100) * 0.7);
      const err5xx = Math.round(rps * (errorFactor / 100) * 0.3);

      requestRateHistory.push({
        time: timeStr,
        requests: rps,
        searchReqs,
        pricingReqs,
        bookingReqs,
        otherReqs,
        error4xx: err4xx,
        error5xx: err5xx,
        latencyMs: Math.round(16 + (Math.random() * 6) + (isSpike ? 15 : 0))
      });

      const l1 = +(71 + Math.sin(i * 0.3) * 3 + (Math.random() - 0.5) * 1.5).toFixed(1);
      const l2 = +(23 - Math.sin(i * 0.3) * 2 + (Math.random() - 0.5) * 1.2).toFixed(1);
      const miss = +(100 - (l1 + l2)).toFixed(1);

      cacheMetricsHistory.push({
        time: timeStr,
        l1HitRate: l1,
        l2HitRate: l2,
        missRate: miss,
        gdsCostSavedDollars: Math.round((rps * ((l1 + l2) / 100)) * 0.02 * 3600 / 1000)
      });
    }

    const latestRps = requestRateHistory[requestRateHistory.length - 1].requests;
    const latestL1 = cacheMetricsHistory[cacheMetricsHistory.length - 1].l1HitRate;
    const latestL2 = cacheMetricsHistory[cacheMetricsHistory.length - 1].l2HitRate;
    const overallCacheHitRate = +(latestL1 + latestL2).toFixed(1);

    const errorLogs = [
      {
        id: "err-" + Math.floor(100000 + Math.random() * 900000),
        timestamp: new Date(now.getTime() - 4000).toISOString(),
        service: "search-adapter-sabre",
        level: isErrorSurge ? "CRITICAL" : "ERROR",
        statusCode: 504,
        message: "Sabre GDS NDC connection timeout after 450ms on route JFK-LHR",
        requestId: "req-9a8f7b-66a1",
        traceId: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
        stackTrace: "TimeoutError: Sabre XML Gateway HTTP 504 Gateway Timeout\n  at SabreAdapter.queryFlightOffers (/app/adapters/sabre.go:142)\n  at SearchOrchestrator.ParallelQuery (/app/services/search.go:88)",
        impact: "Fallback triggered: served L2 Redis cached fare snapshot (staleness 1.4s)"
      },
      {
        id: "err-" + Math.floor(100000 + Math.random() * 900000),
        timestamp: new Date(now.getTime() - 14000).toISOString(),
        service: "pricing-engine-locks",
        level: "WARN",
        statusCode: 429,
        message: "Amadeus FareLock rate-limit warning: 92% quota consumed in rolling window",
        requestId: "req-3f2e1a-88b9",
        traceId: "00-8ca12b4561a04d21b7ce339d0e0e4711-00a127bb0ba902c2-01",
        stackTrace: "QuotaWarning: RateLimiter bucket threshold exceeded\n  at AmadeusLimiter.AcquireToken (/app/pricing/limiter.go:64)",
        impact: "Throttled low-priority partner queries to preserve direct user booking locks"
      },
      {
        id: "err-" + Math.floor(100000 + Math.random() * 900000),
        timestamp: new Date(now.getTime() - 28000).toISOString(),
        service: "flink-mistake-fare-stream",
        level: "WARN",
        statusCode: 200,
        message: "Anomaly detection trigger: Flight NYC->TYO dropped by 68% ($310 vs $980 avg)",
        requestId: "req-7c4d0e-11f4",
        traceId: "00-11aa22bb33cc44dd55ee66ff77889900-1234567890abcdef-01",
        stackTrace: "FlinkStreamAlert: StandardDeviationExceeded (>3.2 sigma)\n  at FareAnomalyProcessor.processElement (/app/flink/anomaly.java:91)",
        impact: "Mistake fare event broadcasted to Kafka topic `prediction.anomaly.detected`"
      },
      {
        id: "err-" + Math.floor(100000 + Math.random() * 900000),
        timestamp: new Date(now.getTime() - 42000).toISOString(),
        service: "saga-booking-orchestrator",
        level: isErrorSurge ? "CRITICAL" : "ERROR",
        statusCode: 500,
        message: "Payment Gateway idempotent retry conflict on booking PNR `FL-88192`",
        requestId: "req-12ab34-cd56",
        traceId: "00-99887766554433221100aabbccddeeff-fedcba0987654321-01",
        stackTrace: "SagaCompensationError: Stripe charge state ambiguous during NetworkPartition\n  at SagaOrchestrator.CompensateTransaction (/app/sagas/booking.go:210)",
        impact: "Compensating transaction executed: released inventory lock, notified user via SMS"
      },
      {
        id: "err-" + Math.floor(100000 + Math.random() * 900000),
        timestamp: new Date(now.getTime() - 65000).toISOString(),
        service: "auth-gateway-oauth",
        level: "WARN",
        statusCode: 401,
        message: "JWT signature verification failed for expired token from IP 185.220.101.4",
        requestId: "req-00ff11-2233",
        traceId: "00-a1b2c3d4e5f60718293a4b5c6d7e8f90-0f9e8d7c6b5a4321-01",
        stackTrace: "TokenExpiredException: jwt expired at 2026-08-13T03:55:00Z\n  at AuthMiddleware.VerifyToken (/app/auth/jwt.go:78)",
        impact: "Blocked unauthorized request at Edge API Gateway layer"
      }
    ];

    const microservices = [
      { id: "search-adapter", name: "Go Multi-GDS Search Adapter", status: isSpike ? "degraded" : "healthy", rps: Math.round(latestRps * 0.58), latencyMs: 24, errorRate: +(errorFactor * 0.6).toFixed(2), cacheHitRate: 96.2, instances: 128, cpuUsage: isSpike ? 88.4 : 42.1, memoryUsageGb: 18.4 },
      { id: "pricing-engine", name: "Pricing & Fare Lock Service", status: "healthy", rps: Math.round(latestRps * 0.22), latencyMs: 14, errorRate: +(errorFactor * 0.3).toFixed(2), cacheHitRate: 91.8, instances: 64, cpuUsage: 38.6, memoryUsageGb: 12.2 },
      { id: "booking-saga", name: "Saga Booking Orchestrator", status: isErrorSurge ? "degraded" : "healthy", rps: Math.round(latestRps * 0.12), latencyMs: 42, errorRate: +(errorFactor * 1.2).toFixed(2), cacheHitRate: 84.5, instances: 32, cpuUsage: 51.2, memoryUsageGb: 8.6 },
      { id: "flink-mistake", name: "Apache Flink Mistake-Fare Stream", status: "healthy", rps: Math.round(latestRps * 0.95), latencyMs: 4, errorRate: 0.01, cacheHitRate: 99.1, instances: 24, cpuUsage: 29.3, memoryUsageGb: 32.0 },
      { id: "ml-predict", name: "Python ML Price Predictor", status: "healthy", rps: Math.round(latestRps * 0.18), latencyMs: 38, errorRate: 0.05, cacheHitRate: 94.0, instances: 48, cpuUsage: 61.4, memoryUsageGb: 28.5 },
      { id: "redis-cluster", name: "L2 Redis Multi-Region Cluster", status: "healthy", rps: Math.round(latestRps * 1.45), latencyMs: 1.2, errorRate: 0.00, cacheHitRate: 98.8, instances: 16, cpuUsage: 24.1, memoryUsageGb: 184.2 },
      { id: "spanner-db", name: "Cloud Spanner Global Database", status: "healthy", rps: Math.round(latestRps * 0.28), latencyMs: 8.5, errorRate: 0.02, cacheHitRate: 88.2, instances: 12, cpuUsage: 33.8, memoryUsageGb: 96.0 },
      { id: "kafka-eventbus", name: "Kafka Event Streaming Hub", status: "healthy", rps: Math.round(latestRps * 2.10), latencyMs: 2.1, errorRate: 0.00, cacheHitRate: 99.9, instances: 20, cpuUsage: 19.5, memoryUsageGb: 48.0 }
    ];

    res.json({
      timestamp: now.toISOString(),
      status: isErrorSurge ? "DEGRADED" : "HEALTHY",
      overview: {
        totalRps: latestRps,
        totalRpm: latestRps * 60,
        overallErrorRate: +(errorFactor).toFixed(2),
        avgLatencyMs: Math.round(18.4 + (isSpike ? 14 : 0)),
        p50LatencyMs: 11.2,
        p95LatencyMs: 41.8,
        p99LatencyMs: 86.4,
        cacheHitRate: overallCacheHitRate,
        l1EdgeHitRate: latestL1,
        l2RedisHitRate: latestL2,
        l3SpannerMissRate: +(100 - overallCacheHitRate).toFixed(1),
        gdsCostSavedPerMin: Math.round((latestRps * (overallCacheHitRate / 100)) * 0.02 * 60),
        gdsCostSavedPerHour: Math.round((latestRps * (overallCacheHitRate / 100)) * 0.02 * 3600),
        activeInstances: 344,
        activeConnections: Math.round(latestRps * 3.8)
      },
      requestRateHistory,
      cacheMetricsHistory,
      microservices,
      errorLogs
    });
  });

  // Health check route for Render & Cloud load balancers
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer();
