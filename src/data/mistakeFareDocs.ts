export interface FareAnomaly {
  id: string;
  route: string;
  carrier: string;
  cabinClass: "Economy" | "Premium Economy" | "Business" | "First";
  detectedPriceUSD: number;
  historicalMedianUSD: number;
  anomalyType: 
    | "currency_conversion_error" 
    | "missing_fuel_surcharge" 
    | "tax_miscalculation" 
    | "booking_glitch_inventory" 
    | "fat_finger_base_fare"
    | "extreme_temporary_drop";
  confidenceScore: number; // 0 - 100
  status: "pending_review" | "approved_mistake" | "rejected_false_positive" | "partner_validated";
  metadata: {
    rawCurrencySymbol?: string;
    multiplierApplied?: number;
    baseFareUSD: number;
    fuelSurchargeUSD: number;
    taxesUSD: number;
    gdsSource: string;
    seatsAvailable: number;
  };
  detectedAt: string;
}

export interface DetectionRule {
  id: string;
  name: string;
  metric: string;
  thresholdValue: number | string;
  operator: "less_than" | "greater_than" | "deviates_by_zscore";
  isActive: boolean;
  description: string;
}

export interface MistakeFareStats {
  streamedCount: number;
  anomaliesDetected: number;
  falsePositivesSuppressed: number;
  activeMistakeFares: number;
}

export const INITIAL_ANOMALIES: FareAnomaly[] = [
  {
    id: "mfa-702",
    route: "HKG-LAX",
    carrier: "All Nippon Airways (ANA)",
    cabinClass: "First",
    detectedPriceUSD: 190,
    historicalMedianUSD: 16200,
    anomalyType: "currency_conversion_error",
    confidenceScore: 98,
    status: "pending_review",
    metadata: {
      rawCurrencySymbol: "HKD",
      multiplierApplied: 1, // HKD was taken as USD directly (1 HKD = 0.13 USD, standard was 16,000 HKD = 2,050 USD, but sold as $190 USD)
      baseFareUSD: 120,
      fuelSurchargeUSD: 50,
      taxesUSD: 20,
      gdsSource: "Amadeus GDS",
      seatsAvailable: 14
    },
    detectedAt: "2 minutes ago"
  },
  {
    id: "mfa-512",
    route: "LHR-SIN",
    carrier: "Singapore Airlines",
    cabinClass: "Business",
    detectedPriceUSD: 310,
    historicalMedianUSD: 4500,
    anomalyType: "missing_fuel_surcharge",
    confidenceScore: 94,
    status: "approved_mistake",
    metadata: {
      baseFareUSD: 290,
      fuelSurchargeUSD: 0, // Missing entirely due to downstream GDS database Sync error
      taxesUSD: 20,
      gdsSource: "Sabre GDS",
      seatsAvailable: 8
    },
    detectedAt: "15 minutes ago"
  },
  {
    id: "mfa-319",
    route: "JFK-CDG",
    carrier: "Air France",
    cabinClass: "Economy",
    detectedPriceUSD: 45,
    historicalMedianUSD: 680,
    anomalyType: "tax_miscalculation",
    confidenceScore: 89,
    status: "partner_validated",
    metadata: {
      baseFareUSD: 40,
      fuelSurchargeUSD: 5,
      taxesUSD: 0, // French solidarity tax omitted in GDS feed
      gdsSource: "Travelport",
      seatsAvailable: 45
    },
    detectedAt: "1 hour ago"
  }
];

export const DETECTION_RULES: DetectionRule[] = [
  {
    id: "rule-zscore",
    name: "Historical Z-Score Deviation",
    metric: "Historical Median Price",
    thresholdValue: -4.5,
    operator: "deviates_by_zscore",
    isActive: true,
    description: "Triggers if the fare price deviates from the 90-day moving median by more than 4.5 standard deviations."
  },
  {
    id: "rule-currency-match",
    name: "GDS Currency Cross-Check",
    metric: "Foreign Exchange Ratio",
    thresholdValue: "Mismatch 1:1",
    operator: "less_than",
    isActive: true,
    description: "Flags pricing that matches the raw numerical value of foreign currencies without applying correct FX multipliers."
  },
  {
    id: "rule-fuel-zero",
    name: "Null Fuel Surcharge Filter",
    metric: "YQ/YR Tax Code Value",
    thresholdValue: 0,
    operator: "less_than",
    isActive: true,
    description: "Flags premium-cabin fares where the critical YQ/YR fuel components read as zero while base remains standard."
  },
  {
    id: "rule-booking-glitch",
    name: "Inventory Glitch Trigger",
    metric: "Hidden Booking Sub-Classes",
    thresholdValue: "First Class Code A",
    operator: "greater_than",
    isActive: true,
    description: "Detects premium inventory leaked into low-tier promotional ticketing codes (e.g., First Class booked on Code N)."
  }
];
