export interface PartnerAdapterDoc {
  id: string;
  name: string;
  type: string;
  description: string;
  dataFormat: string;
  latencyAvg: string;
  supportedFeatures: string[];
  sampleRequest: string;
  sampleResponse: string;
  normalizedResponse: string;
}

export const SUPPLIER_ADAPTERS: PartnerAdapterDoc[] = [
  {
    id: "amadeus",
    name: "Amadeus GDS Adapter",
    type: "Traditional Legacy GDS (REST/JSON)",
    description: "The primary supplier for global legacy network carriers, international codeshares, and comprehensive baggage allowance rules.",
    dataFormat: "JSON (Enterprise REST API V2)",
    latencyAvg: "420ms",
    supportedFeatures: ["Hold Bookings", "Instant Ticketing", "Ancillary Selection", "Seat Map Selection"],
    sampleRequest: `// Amadeus Shopping Request
POST /v2/shopping/flight-offers
{
  "originDestinations": [{
    "id": "1",
    "originLocationCode": "FRA",
    "destinationLocationCode": "SIN",
    "departureDateTimeRange": { "date": "2026-09-12" }
  }],
  "travelers": [{ "id": "1", "travelerType": "ADULT" }],
  "sources": ["GDS"]
}`,
    sampleResponse: `{
  "data": [{
    "type": "flight-offer",
    "id": "1",
    "itineraries": [{
      "duration": "PT12H10M",
      "segments": [{
        "departure": { "iataCode": "FRA", "at": "2026-09-12T21:55:00" },
        "arrival": { "iataCode": "SIN", "at": "2026-09-13T16:05:00" },
        "carrierCode": "SQ",
        "number": "26"
      }]
    }],
    "price": { "currency": "EUR", "total": "595.00" }
  }]
}`,
    normalizedResponse: `{
  "itineraryId": "it_ama_7f82b3a9",
  "supplier": "AMADEUS",
  "totalPriceUsd": 645.50,
  "segments": [{
    "carrier": "SQ",
    "flightNumber": "26",
    "origin": "FRA",
    "destination": "SIN",
    "departureTime": "2026-09-12T21:55:00Z",
    "arrivalTime": "2026-09-13T16:05:00Z",
    "durationMinutes": 730
  }],
  "ancillariesSupported": true
}`
  },
  {
    id: "duffel",
    name: "Duffel NDC Adapter",
    type: "Modern NDC Aggregator (JSON/REST)",
    description: "Connects directly to airline NDC channels to access exclusive inventory, avoid traditional GDS booking surcharges, and provide rich ancillaries.",
    dataFormat: "JSON (Duffel API V1)",
    latencyAvg: "280ms",
    supportedFeatures: ["Direct Carrier Surcharges bypassed", "Extra Baggage purchasing", "Real-time Wi-Fi status flags", "Instant cancellation"],
    sampleRequest: `// Duffel Offer Request
POST /air/offers
{
  "slices": [{
    "origin": "FRA",
    "destination": "SIN",
    "departure_date": "2026-09-12"
  }],
  "passengers": [{ "type": "adult" }],
  "cabin_class": "economy"
}`,
    sampleResponse: `{
  "data": {
    "offers": [{
      "id": "off_0012bc8f",
      "total_amount": "610.00",
      "total_currency": "USD",
      "slices": [{
        "duration": "12h10m",
        "segments": [{
          "operating_carrier_flight_number": "26",
          "operating_carrier": { "iata_code": "SQ" },
          "origin": { "iata_code": "FRA" },
          "destination": { "iata_code": "SIN" }
        }]
      }]
    }]
  }
}`,
    normalizedResponse: `{
  "itineraryId": "it_duf_0012bc8f",
  "supplier": "DUFFEL",
  "totalPriceUsd": 610.00,
  "segments": [{
    "carrier": "SQ",
    "flightNumber": "26",
    "origin": "FRA",
    "destination": "SIN",
    "departureTime": "2026-09-12T21:55:00Z",
    "arrivalTime": "2026-09-13T16:05:00Z",
    "durationMinutes": 730
  }],
  "ancillariesSupported": true
}`
  },
  {
    id: "sabre",
    name: "Sabre GDS Adapter",
    type: "Enterprise SOAP / REST GDS Combo",
    description: "Robust US-focused GDS offering deep schedules, seat locks, high volume corporate reservations, and complex multi-city connections.",
    dataFormat: "REST / JSON (with SOAP backends)",
    latencyAvg: "550ms",
    supportedFeatures: ["Corporate Account Fares", "Seat Locks", "Group Bookings", "Complex re-routing logs"],
    sampleRequest: `// Sabre Bargain Finder Max Request
POST /v4/shop/flights
{
  "OTA_AirLowFareSearchRQ": {
    "OriginDestinationInformation": [{
      "DepartureDateTime": "2026-09-12T00:00:00",
      "OriginLocation": { "LocationCode": "FRA" },
      "DestinationLocation": { "LocationCode": "SIN" }
    }],
    "POS": { "Source": [{ "PseudoCityCode": "Y1X9" }] }
  }
}`,
    sampleResponse: `{
  "AirItineraryPricingInfo": [{
    "ItinTotalFare": {
      "EquivFare": { "Amount": "650.00", "CurrencyCode": "USD" }
    },
    "PTC_FareBreakdowns": {
      "PassengerTypeQuantity": { "Code": "ADT", "Quantity": 1 }
    }
  }]
}`,
    normalizedResponse: `{
  "itineraryId": "it_sab_99af21c0",
  "supplier": "SABRE",
  "totalPriceUsd": 650.00,
  "segments": [{
    "carrier": "SQ",
    "flightNumber": "26",
    "origin": "FRA",
    "destination": "SIN",
    "departureTime": "2026-09-12T21:55:00Z",
    "arrivalTime": "2026-09-13T16:05:00Z",
    "durationMinutes": 730
  }],
  "ancillariesSupported": false
}`
  },
  {
    id: "travelport",
    name: "Travelport Universal API Adapter",
    type: "Legacy XML/SOAP Gateway",
    description: "Connects to Galileo, Apollo, and Worldspan cores. Ideal for regional European and African budget lines and low-cost carrier mappings.",
    dataFormat: "SOAP XML (Galileo GDS Core)",
    latencyAvg: "780ms",
    supportedFeatures: ["Low Cost Carrier (LCC) integration", "Charter Flight support", "Secondary regional hubs"],
    sampleRequest: `<!-- Travelport LowFareSearchReq SOAP -->
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <LowFareSearchReq Origin="FRA" Destination="SIN" AuthorizedBy="FlySmart">
      <SearchAirLeg DepartureDate="2026-09-12" />
    </LowFareSearchReq>
  </s:Body>
</s:Envelope>`,
    sampleResponse: `<!-- Travelport LowFareSearchRsp -->
<s:Envelope>
  <s:Body>
    <LowFareSearchRsp TotalPrice="USD675.00">
      <AirSegment Carrier="SQ" FlightNumber="26" Origin="FRA" Dest="SIN" />
    </LowFareSearchRsp>
  </s:Body>
</s:Envelope>`,
    normalizedResponse: `{
  "itineraryId": "it_tvp_018a3e99",
  "supplier": "TRAVELPORT",
  "totalPriceUsd": 675.00,
  "segments": [{
    "carrier": "SQ",
    "flightNumber": "26",
    "origin": "FRA",
    "destination": "SIN",
    "departureTime": "2026-09-12T21:55:00Z",
    "arrivalTime": "2026-09-13T16:05:00Z",
    "durationMinutes": 730
  }],
  "ancillariesSupported": false
}`
  }
];

export interface ResilienceMetric {
  metricName: string;
  amadeus: string;
  duffel: string;
  sabre: string;
  travelport: string;
}

export const RESILIENCE_METRICS: ResilienceMetric[] = [
  {
    metricName: "Default Rate Limit (Per Min)",
    amadeus: "5,000 / min",
    duffel: "10,000 / min",
    sabre: "3,000 / min",
    travelport: "1,500 / min"
  },
  {
    metricName: "Active Authentication Token Strategy",
    amadeus: "OAuth2 client_credentials (expires 30m)",
    duffel: "Stateless API Bearer Token (secret key header)",
    sabre: "Session Token Binary handshake (refresh on use)",
    travelport: "HTTP Basic Authentication over TLS"
  },
  {
    metricName: "Circuit Breaker Latency Threshold",
    amadeus: "1,200 ms",
    duffel: "800 ms",
    sabre: "1,500 ms",
    travelport: "2,000 ms"
  },
  {
    metricName: "Configured Retry Attempts (Attempts/Interval)",
    amadeus: "3 attempts / 300ms backoff",
    duffel: "2 attempts / 150ms backoff",
    sabre: "3 attempts / 500ms backoff",
    travelport: "2 attempts / 1000ms backoff"
  },
  {
    metricName: "Fallback Priority Supplier Node",
    amadeus: "Duffel NDC",
    duffel: "Amadeus GDS",
    sabre: "Amadeus GDS",
    travelport: "Sabre GDS"
  }
];
