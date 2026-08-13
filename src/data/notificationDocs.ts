export interface NotificationChannel {
  id: string;
  name: string;
  protocol: string;
  latencyAvgMs: number;
  costPerMsgUSD: number;
  status: "active" | "throttled" | "degraded";
  description: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: "price_alert" | "mistake_fare" | "travel_reminder" | "general";
  defaultPriority: "high" | "medium" | "low";
  localization: {
    [locale: string]: {
      subject?: string;
      body: string;
    };
  };
}

export interface QueuedNotification {
  id: string;
  userId: string;
  channelId: string;
  priority: "high" | "medium" | "low";
  locale: string;
  templateId: string;
  variables: { [key: string]: string };
  status: "queued" | "sending" | "delivered" | "failed" | "retrying";
  retryCount: number;
  scheduledTime?: string;
  deliveryTracker?: {
    sentAt?: string;
    deliveredAt?: string;
    opened?: boolean;
    clicked?: boolean;
    unsubscribed?: boolean;
  };
}

export interface ChannelRateLimit {
  channelId: string;
  maxPerSecond: number;
  currentRunning: number;
  burstLimit: number;
}

export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  {
    id: "email",
    name: "Amazon SES Email Engine",
    protocol: "SMTP / AWS API",
    latencyAvgMs: 450,
    costPerMsgUSD: 0.0001,
    status: "active",
    description: "Ideal for rich HTML travel itineraries, invoice statements, and long-form weekly digest compilations."
  },
  {
    id: "push",
    name: "Firebase Cloud Messaging (FCM)",
    protocol: "WebPush / APNS / FCM",
    latencyAvgMs: 80,
    costPerMsgUSD: 0.0000,
    status: "active",
    description: "Ultra-low-latency real-time gate change alerts, boarding pass ready notifications, and instant price alerts."
  },
  {
    id: "sms",
    name: "Twilio Gateway SMS",
    protocol: "SMPP / Twilio REST",
    latencyAvgMs: 1200,
    costPerMsgUSD: 0.0075,
    status: "active",
    description: "Reliable, out-of-app channel for critical flight delays and urgent gate boarding reminders without data connection."
  },
  {
    id: "telegram",
    name: "Telegram Bot API",
    protocol: "HTTPS Webhook Bot",
    latencyAvgMs: 150,
    costPerMsgUSD: 0.0000,
    status: "active",
    description: "Developer-centric, fast chat channel utilized mostly for instant custom price alerts and system status alarms."
  },
  {
    id: "whatsapp",
    name: "Meta WhatsApp Business Cloud API",
    protocol: "WhatsApp Business API",
    latencyAvgMs: 300,
    costPerMsgUSD: 0.0150,
    status: "active",
    description: "Highly engaged conversational channel, perfect for interactive boarding passes and quick check-in confirmations."
  },
  {
    id: "slack",
    name: "Slack Incoming Webhooks",
    protocol: "Slack Webhook API",
    latencyAvgMs: 250,
    costPerMsgUSD: 0.0000,
    status: "active",
    description: "Corporate channel. Used to feed organization-wide discount codes, mistake fare flashes, and flight audit alerts."
  },
  {
    id: "discord",
    name: "Discord Webhook Bots",
    protocol: "Discord API",
    latencyAvgMs: 220,
    costPerMsgUSD: 0.0000,
    status: "active",
    description: "Community channel used heavily to broadcast public deal alerts and extreme mistake fare drops instantly."
  },
  {
    id: "webhook",
    name: "Custom Developer Webhooks",
    protocol: "HTTPS POST Webhook",
    latencyAvgMs: 500,
    costPerMsgUSD: 0.0002,
    status: "active",
    description: "B2B client callbacks. Forwards raw event JSON (e.g. flight cancelled) directly to partner systems."
  }
];

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "price-drop-nyc-lon",
    name: "Dynamic Route Price Drop Alert",
    type: "price_alert",
    defaultPriority: "medium",
    localization: {
      en: {
        subject: "✈️ Price Drop Alert: New York to London",
        body: "Great news, {{userName}}! The round-trip price for your tracked route NYC ➜ LON has dropped by {{dropPercent}}%. It is currently available for just ${{currentPrice}} USD. Book now before seats fill up!"
      },
      es: {
        subject: "✈️ Alerta de bajada de precio: Nueva York a Londres",
        body: "¡Buenas noticias, {{userName}}! El precio de ida y vuelta para tu ruta rastreada NYC ➜ LON ha bajado un {{dropPercent}}%. Actualmente está disponible por solo ${{currentPrice}} USD. ¡Reserva ya!"
      },
      ja: {
        subject: "✈️ 価格下落アラート：ニューヨーク ➜ ロンドン",
        body: "おめでとうございます、{{userName}}様！追跡中の路線 NYC ➜ LON の往復料金が {{dropPercent}}% 下落しました。現在はわずか ${{currentPrice}} USD でご利用いただけます。お早めにご予約ください！"
      },
      de: {
        subject: "✈️ Preissenkung: New York nach London",
        body: "Gute Nachrichten, {{userName}}! Der Hin- und Rückflugpreis für Ihre verfolgte Route NYC ➜ LON ist um {{dropPercent}}% gesunken. Aktuell verfügbar für nur ${{currentPrice}} USD. Jetzt buchen!"
      }
    }
  },
  {
    id: "mistake-fare-hkg-lax",
    name: "Extreme Mistake Fare Alert",
    type: "mistake_fare",
    defaultPriority: "high",
    localization: {
      en: {
        subject: "🚨 MISTAKE FARE: Hong Kong to Los Angeles - $190 USD First Class!",
        body: "URGENT MISTAKE FARE: ANA First Class round-trip from HKG to LAX is pricing at just ${{currentPrice}} USD (Standard is ${{standardPrice}} USD). This rate could be patched within minutes. Book immediately and do NOT call the airline!"
      },
      es: {
        subject: "🚨 TARIFA ERROR: Hong Kong a Los Ángeles - ¡$190 USD Primera Clase!",
        body: "TARIFA ERROR URGENTE: El boleto de ida y vuelta de Primera Clase de ANA desde HKG a LAX tiene un precio de solo ${{currentPrice}} USD (El estándar es ${{standardPrice}} USD). Tarifa de error activa. ¡Reserva inmediatamente!"
      },
      ja: {
        subject: "🚨 料金設定ミス発生：香港 ➜ ロサンゼルス ファーストクラスが $190 USD！",
        body: "緊急：ANA 香港 ➜ ロサンゼルス往復ファーストクラスが、設定ミスによりわずか ${{currentPrice}} USD（通常は ${{standardPrice}} USD）で販売されています！数分以内に修正される可能性があります。今すぐ発券し、航空会社への問い合わせは絶対にお控えください！"
      },
      de: {
        subject: "🚨 ERROR FARE: Hongkong nach Los Angeles - $190 USD First Class!",
        body: "DRINGENDE ERROR FARE: ANA First Class Hin- und Rückflug von HKG nach LAX kostet gerade nur ${{currentPrice}} USD (Standard ist ${{standardPrice}} USD). Dieser Tarif könnte jede Minute korrigiert werden. Sofort buchen!"
      }
    }
  },
  {
    id: "flight-delayed-reminder",
    name: "Urgent Flight Delay Update",
    type: "travel_reminder",
    defaultPriority: "high",
    localization: {
      en: {
        subject: "⚠️ Delay Notification: Flight FS-902 to Paris",
        body: "Travel update for {{userName}}: Your flight FS-902 from JFK to CDG is delayed by {{delayMinutes}} minutes due to ATC constraints. New estimated departure time: {{newDeparture}}. Gate {{gate}} remains unchanged."
      },
      es: {
        subject: "⚠️ Notificación de retraso: Vuelo FS-902 a París",
        body: "Actualización de viaje para {{userName}}: Tu vuelo FS-902 de JFK a CDG tiene un retraso de {{delayMinutes}} minutos. Nueva hora estimada de salida: {{newDeparture}}. La puerta {{gate}} se mantiene igual."
      },
      ja: {
        subject: "⚠️ 遅延通知：パリ行き FS-902便",
        body: "{{userName}}様、運航状況アップデート：JFK発CDG行きのFS-902便は、管制制限のため {{delayMinutes}} 分遅延しております。新しい出発予定時刻：{{newDeparture}}。搭乗ゲート {{gate}} は変更ありません。"
      },
      de: {
        subject: "⚠️ Verspätungsmeldung: Flug FS-902 nach Paris",
        body: "Flugstatus für {{userName}}: Ihr Flug FS-902 von JFK nach CDG verzögert sich um {{delayMinutes}} Minuten. Neue voraussichtliche Abflugzeit: {{newDeparture}}. Gate {{gate}} bleibt unverändert."
      }
    }
  }
];

export const PRIORITY_QUEUES = [
  {
    id: "high",
    name: "Urgent Out-of-Band (High Priority)",
    slaMs: 1500,
    bufferSize: "Infinite",
    description: "Allocated for real-time safety, gate changes, mistake fares, and immediate critical travel notifications."
  },
  {
    id: "medium",
    name: "Transactional Core (Medium Priority)",
    slaMs: 30000,
    bufferSize: "1,000,000 slots",
    description: "Standard ticketing confirmations, price drop alerts, check-in window openings, and password resets."
  },
  {
    id: "low",
    name: "Asynchronous Digest (Low Priority)",
    slaMs: 14400000, // 4 hours
    bufferSize: "Unlimited",
    description: "Weekly price fluctuation digests, low-urgency partner offers, travel newsletters, and marketing."
  }
];

export const DIGEST_CHANNELS = [
  {
    id: "weekly-digest",
    name: "Sunday Morning Smart Travel Digest",
    frequency: "Every Sunday at 08:00 AM Local",
    accumulationRules: "Aggregates all route price alerts with net variance > 5% over the preceding 7 days.",
    samplePayload: {
      user: "Sarah Jenkins",
      period: "June 20 - June 27",
      totalAlertsSuppressed: 18,
      topDeals: [
        { route: "NYC ➜ CDG", priceDelta: "-$145", currentPrice: "$420" },
        { route: "SFO ➜ NRT", priceDelta: "-$280", currentPrice: "$680" }
      ]
    }
  }
];
