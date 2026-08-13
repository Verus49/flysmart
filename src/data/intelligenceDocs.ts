export interface IntelligenceFeatureDoc {
  id: string;
  name: string;
  category: "pricing" | "routing" | "quality" | "sustainability_safety";
  description: string;
  icon: string;
  inputs: string[];
  pipeline: string[];
  output: string;
  mlOpportunities: string[];
  dataRequirements: string[];
  futureImprovements: string[];
}

export const INTELLIGENCE_FEATURES: IntelligenceFeatureDoc[] = [
  {
    id: "price-prediction",
    name: "Price Prediction",
    category: "pricing",
    description: "Forecasts future fare fluctuations for specific routes and flight dates, assigning a confidence percentage to the predicted trend.",
    icon: "TrendingUp",
    inputs: [
      "Origin and destination airport IATA codes (e.g., FRA, JFK)",
      "Departure and return dates (days until departure)",
      "Cabin class selection",
      "Historical price lists from ClickHouse (last 3 years for matching segment, season, and day-of-week)",
      "Current real-time pricing quote",
      "Macro factors (fuel prices indices, airline-specific financial yields)"
    ],
    pipeline: [
      "Query ClickHouse to extract historical pricing vectors matching the route's seasonality (by week-of-year and day-of-week).",
      "Normalize fares to exclude local dynamic airport tax spikes.",
      "Feed the temporal vectors into a LightGBM or Prophet forecasting model running on Vertex AI.",
      "Adjust predictions using real-time search frequency changes (demand surges) tracked in Redis.",
      "Output a 14-day expected price trajectory curve."
    ],
    output: "JSON trajectory dataset containing date-points and 10th/50th/90th percentile estimated prices, plus a high-level trend tag ('RISING', 'STABLE', 'FALLING').",
    mlOpportunities: [
      "Utilize Long Short-Term Memory (LSTM) recurrent networks or custom transformer-based time series models (e.g., Temporal Fusion Transformers) to capture complex non-linear seasonal correlations.",
      "Reinforcement learning loop to auto-tune feature weights as predicted prices deviate from actual booked prices."
    ],
    dataRequirements: [
      "3+ years of comprehensive historical flight pricing archives (ClickHouse/BigQuery).",
      "Real-time search clickstream logs to calculate instantaneous route demand coefficients.",
      "Global holiday and event schedule database (to identify high-demand peaks like Oktoberfest or Super Bowl)."
    ],
    futureImprovements: [
      "Incorporate live web-scraping sentiment feeds (hotel occupancies, local festival announcements) to adjust prediction bounds.",
      "Multi-carrier joint model training using federated learning architectures."
    ]
  },
  {
    id: "buy-vs-wait",
    name: "Buy vs. Wait Recommendations",
    category: "pricing",
    description: "Formulates a definitive recommendation for consumers, specifying whether to finalize ticket purchase immediately or delay for lower pricing.",
    icon: "AlertCircle",
    inputs: [
      "Output of the Price Prediction trajectory model",
      "Current ticket price vs. historical minimum and median values for the route",
      "Days remaining until departure",
      "User preference weightings (risk tolerance: strict business travel vs. flexible leisure)"
    ],
    pipeline: [
      "Calculate the price differential delta: Current_Price - Predicted_Minimum_Fare.",
      "Construct a risk-adjusted decision tree based on days-to-departure (if days < 7, force 'BUY NOW' due to late-booking premium escalations).",
      "Run Monte Carlo simulations (10,000 iterations) using predicted volatility variables to estimate the probability of the price dropping by at least 5% before departure.",
      "Formulate recommendations with confidence scores."
    ],
    output: "Recommendation object: { recommendation: 'BUY_NOW' | 'WAIT', confidence_percentage: 84, max_expected_savings: 120.00, wait_limit_days: 5 }",
    mlOpportunities: [
      "Train a classification model (XGBoost) predicting the binary event of 'Price drops > $20 before T-3 days' to bypass complex Monte Carlo iterations.",
      "Personalize recommendations based on historic user reservation behaviors (e.g. price-sensitive vs. schedule-sensitive user classifications)."
    ],
    dataRequirements: [
      "Continuous price tracking logs capturing daily minimum/maximum bounds per route.",
      "Historical model performance logs to constantly retro-test and grade recommendation accuracy."
    ],
    futureImprovements: [
      "Price Drop Guarantee Insurance: Auto-integrate with neo-insurers to allow users to lock a fare for a small premium using wait-recommendation confidence bounds.",
      "Automated Booking Agent: Let users specify a target price, automatically capturing and booking the seat via GDS APIs if the threshold is breached."
    ]
  },
  {
    id: "historical-price-charts",
    name: "Historical Price Charts",
    category: "pricing",
    description: "Renders historical pricing bands for the route over the past 12 months to provide clear visual validation of current fare values.",
    icon: "BarChart3",
    inputs: [
      "Origin / Destination segment identifiers",
      "Month-of-year context",
      "ClickHouse OLAP pricing aggregates database"
    ],
    pipeline: [
      "Execute an aggregated SELECT query on ClickHouse 'historical_flight_trends' table, filtering by route and cabin class over the last 365 days.",
      "Group results by week, calculating the minimum, 25th percentile, median, and 75th percentile fares.",
      "Smooth the curve using a moving average window to eliminate isolated mistake fares or cancelled seat anomalies.",
      "Map current live quote onto the historical percentile distribution chart."
    ],
    output: "Cleaned payload of weekly pricing bands: { week_start: Date, min_fare: 450, median_fare: 620, max_fare: 950 }.",
    mlOpportunities: [
      "Anomaly detection models (Isolation Forests) to automatically filter out skewed pricing points (such as emergency charter flights or incorrect database loads) from historical charts.",
      "Clustering routes into 'volatility buckets' to automatically adjust chart rendering scales."
    ],
    dataRequirements: [
      "High-density database indexes in ClickHouse ordered by (origin, destination, query_date).",
      "Pre-aggregated daily historical pricing tables to keep query responses under 10ms."
    ],
    futureImprovements: [
      "Interactive multi-year comparison views overlaying year-on-year demand spikes.",
      "Incorporate ticket class distributions (e.g. Basic Economy vs Refundable Economy) directly into percentile charts."
    ]
  },
  {
    id: "alternative-airports",
    name: "Alternative Airport Recommendations",
    category: "routing",
    description: "Evaluates secondary airports near the selected origin or destination to suggest significantly cheaper or faster routing alternatives.",
    icon: "MapPin",
    inputs: [
      "Primary origin and destination airports (e.g., JFK)",
      "Target coordinates (latitude, longitude) of traveler's actual origin/destination",
      "Maximum acceptable transit distance (default: 100km)",
      "Ground transportation cost factors and travel times"
    ],
    pipeline: [
      "Query localized GIS databases to resolve adjacent airports within a 100km radius of the input points (e.g., LGA, EWR for JFK).",
      "Execute parallel, low-priority search queries for routes involving these secondary airports.",
      "Compute composite travel cost: Alternate_Flight_Fare + Ground_Transit_Fare.",
      "Compute total travel duration: Flight_Time + Airport_Transfer_Time.",
      "Filter out alternatives that do not yield at least 15% cost savings or 1 hour of time savings."
    ],
    output: "Array of alternative route objects, containing airport details, price differentials, travel times, and recommended transit modes.",
    mlOpportunities: [
      "Graph Neural Networks (GNN) to model complex inter-modal transfers (combining rail, bus, and flight paths) to dynamically optimize door-to-door transit.",
      "Demand estimation modeling to predict price reactions at secondary airports as primary hubs become saturated."
    ],
    dataRequirements: [
      "Global airport coordinates directory including helipads, municipal hubs, and regional nodes.",
      "Ground transit APIs (such as Google Maps Routes API, local rail databases) to calculate transfer times and train ticket pricing."
    ],
    futureImprovements: [
      "Integrated booking: Issue single-checkout tickets combining local high-speed rail links (e.g., Deutsche Bahn) directly with air travel segments.",
      "Dynamic traveler-tracking rideshare matching to minimize airport ground transport costs."
    ]
  },
  {
    id: "split-ticket-detection",
    name: "Split-Ticket (Virtual Interlining) Detection",
    category: "routing",
    description: "Discovers hidden cost-savings by combining separate, non-allied carrier tickets for a single journey, creating virtual connection points.",
    icon: "Layers",
    inputs: [
      "Search parameters (Origin, Destination, Date)",
      "Unified flight schemas from all GDS and direct LCC connections",
      "Minimum Connection Time (MCT) safety margins per transfer airport (typically GDS MCT + 90 minutes to allow baggage re-check)"
    ],
    pipeline: [
      "Construct a directed acyclic graph (DAG) of all flights departing on the selected date.",
      "Run shortest-path routing algorithms (modified Dijkstra or A*) to identify multi-hop paths that utilize separate airlines (e.g., EasyJet flight FRA-LHR combined with British Airways flight LHR-JFK).",
      "Filter connections where transfer time is less than the customized MCT boundary (minimum 2.5 hours required for international self-transfers).",
      "Compare the sum of individual ticket prices against the cheapest single through-ticket quote."
    ],
    output: "Split-itinerary package outlining separate carrier booking links, custom self-transfer connection warnings, and net savings summary.",
    mlOpportunities: [
      "Predictive delay correlation networks to dynamically adjust Minimum Connection Times based on real-time flight delay probabilities for specific carriers and terminals.",
      "Reinforcement learning models optimizing search graph sizes to prevent combinatoric processing explosions during peak query intervals."
    ],
    dataRequirements: [
      "Real-time flight arrival delay distributions grouped by airport, time-of-day, and carrier.",
      "Detailed airport terminal map configurations to calculate physical transit times between international arrival gates and domestic departure zones."
    ],
    futureImprovements: [
      "Virtual Interlining Guarantee: Partner with travel protection funds to offer instant rebooking insurance if the first separate ticket experiences a delay, causing a missed connection.",
      "Automated multi-carrier passenger check-in through a single application interface."
    ]
  },
  {
    id: "hidden-city-opportunities",
    name: "Hidden-City (Skiplagged) Opportunities",
    category: "routing",
    description: "Finds cheaper routes by booking a multi-leg ticket where the traveler's actual destination is the layover city, abandoning the final segment.",
    icon: "Compass",
    inputs: [
      "User desired segment (e.g., FRA ➔ JFK)",
      "Global airline flight schedules and multi-segment ticket prices"
    ],
    pipeline: [
      "Identify flights where the desired destination (JFK) acts as a transit node for a longer destination (e.g., FRA ➔ JFK ➔ MIA).",
      "Compare the through-ticket pricing (FRA-JFK-MIA) against the direct segment ticket pricing (FRA-JFK).",
      "If the through-ticket is cheaper, flag the opportunity.",
      "Apply strict constraints: Ticket must be booked as one-way only (airlines cancel remaining legs once a segment is skipped) and carry-on luggage only."
    ],
    output: "Hidden-city itinerary detail card with strict instructions: 'No checked bags. Book as a one-way ticket. Do not enter airline loyalty account.'",
    mlOpportunities: [
      "Anonymized pattern detection modeling to flag airline ticketing algorithms that are likely to trigger audits or cancellations for suspected skiplagged flyers.",
      "Price anomaly search optimization using deep heuristic searches."
    ],
    dataRequirements: [
      "Global multi-stop flight fare matrices spanning complex hub-and-spoke carrier paths.",
      "Real-time baggage enforcement rules cataloged by airline and cabin class."
    ],
    futureImprovements: [
      "Risk analysis dashboard assessing the likelihood of carrier loyalty penalty enforcements based on passenger booking volumes.",
      "Automated one-way split ticket grouping for return flight pairings."
    ]
  },
  {
    id: "nearby-airport-optimization",
    name: "Nearby Airport Cost Optimization",
    category: "routing",
    description: "Computes matrix grids evaluating surrounding departure and arrival airports to identify the absolute cheapest hub pairing.",
    icon: "Grid",
    inputs: [
      "Departure coordinates radius",
      "Arrival coordinates radius",
      "Traveler home location"
    ],
    pipeline: [
      "Resolve all active airports within 150km of the origin and destination points.",
      "Query cache systems for all permutations of origin-destination pairs.",
      "Sort combinations in a high-contrast pricing grid mapping saving margins.",
      "Recommend the optimal pairing based on transfer convenience indices."
    ],
    output: "Matrix layout dataset: [Origin Hub x Destination Hub] showing pricing coordinates and transit cost factors.",
    mlOpportunities: [
      "Cluster analysis classifying users into 'travel convenience cohorts' (business, leisure, extreme budget) to prioritize specific hub matches.",
      "Predictive pricing for multi-airport zones."
    ],
    dataRequirements: [
      "Geospatial airport indexes.",
      "Comprehensive regional ground transport schedules and average taxi/rideshare rates."
    ],
    futureImprovements: [
      "Dynamic pricing grids that adjust in real-time as the user modifies their maximum acceptable transfer radius slider.",
      "Direct integration with regional car-sharing platforms."
    ]
  },
  {
    id: "best-departure-dates",
    name: "Best Departure Dates Matrix",
    category: "pricing",
    description: "Calculates a 30-day flexible calendar matrix highlighting cheaper adjacent departure dates for the chosen itinerary.",
    icon: "Calendar",
    inputs: [
      "Target departure date +/- 7 days",
      "Stay duration parameters",
      "Pre-cached search trends databases"
    ],
    pipeline: [
      "Retrieve stored daily price minimums from ClickHouse for the route over a 15-day departure date window.",
      "Compile a grid of departure dates and return dates.",
      "Highlight the lowest pricing cells utilizing conditional color scales.",
      "Indicate date changes that trigger significant savings (e.g., departing on Thursday instead of Friday saves $150)."
    ],
    output: "Calendar grid dataset mapping departure dates, prices, and savings indicators.",
    mlOpportunities: [
      "Collaborative filtering to predict fare patterns on less-searched dates by matching with highly-trafficked sibling routes.",
      "Neural network models to estimate missing date values on sparse datasets."
    ],
    dataRequirements: [
      "ClickHouse index aggregation partitions covering broad historical search ranges.",
      "Airline flight frequency matrix schemas."
    ],
    futureImprovements: [
      "Dynamic interactive graphs allowing multi-month swipe tracking.",
      "Overlay local destination festival calendars to explain why specific date cells are heavily marked up."
    ]
  },
  {
    id: "best-return-dates",
    name: "Best Return Dates Optimization",
    category: "pricing",
    description: "Pinpoints the most economical return flights by analyzing the cost of extending or shortening the trip duration.",
    icon: "CalendarDays",
    inputs: [
      "Desired trip duration range (e.g., 5-9 days)",
      "Selected departure date",
      "Real-time fare records"
    ],
    pipeline: [
      "Filter the search cache for return flights matching the selected departure date.",
      "Evaluate pricing for trip durations spanning from desired minimum to maximum days.",
      "Identify if extending the trip by 1 day lowers the total ticket price (frequently occurring due to weekend stayover rules).",
      "Add hotel cost estimation to check if savings on airfare exceed the cost of an extra night's stay."
    ],
    output: "Duration vs Price optimization list mapping: [7 days stay: $600, 8 days stay: $480 (Save $120)].",
    mlOpportunities: [
      "Joint airfare-hotel dynamic pricing optimization models.",
      "Predictive modeling on length-of-stay (LoS) airline pricing algorithms."
    ],
    dataRequirements: [
      "Airline length-of-stay fare restriction rules databases.",
      "Average hotel dynamic pricing feeds for destination cities."
    ],
    futureImprovements: [
      "Complete 'Extended Vacation' bundle calculator combining flights, co-working spaces, and hotels for digital nomads.",
      "Automated flight-change cost analyzers."
    ]
  },
  {
    id: "layover-quality-scoring",
    name: "Layover Quality Evaluation",
    category: "quality",
    description: "Rates airport layovers based on terminal amenities, sleeping pods, lounge access, and transit stress, converting layovers from negative to positive experiences.",
    icon: "Coffee",
    inputs: [
      "Connecting airport IATA code (e.g., SIN, DXB)",
      "Layover duration (minutes)",
      "Arrival and departure terminal locations",
      "Time of day (overnight vs. midday transit)"
    ],
    pipeline: [
      "Query localized airport amenity database to retrieve scores for Wi-Fi speeds, restaurants, rest zones, and luxury transit lounges.",
      "Apply penalties for short, stressful connections (less than 60 minutes) or excessively long, exhausting transits (greater than 6 hours without lounge privileges).",
      "Evaluate terminal transfer requirements: Deduct points if layover requires terminal changes via public shuttle or passing back through border security.",
      "Calculate an aggregate Layover Quality Score on a 100-point index."
    ],
    output: "Score card object: { layover_score: 88, rating: 'Excellent', transit_stress: 'Low', features: ['Free sleeping zones', '24/7 dining', 'Terminal train connection'] }",
    mlOpportunities: [
      "Use Gemini models to parse thousands of unstructured passenger reviews on forums to automatically update airport amenity scores and highlight real-time complaints (e.g., 'Terminals undergoing construction, escalators offline').",
      "Sentiment analysis of airport transit reviews."
    ],
    dataRequirements: [
      "Structured index database of airport terminal amenities, lounge rules, and opening hours.",
      "Real-time security wait-time averages per terminal node."
    ],
    futureImprovements: [
      "In-app lounge pass voucher purchasing matching the layover window.",
      "Interactive walking path routing maps from arrival gate to departure gate."
    ]
  },
  {
    id: "flight-quality-score",
    name: "Overall Flight Quality Score",
    category: "quality",
    description: "A multi-factor index rating the overall passenger comfort of a flight, combining aircraft age, seat pitch, Wi-Fi availability, power outlets, and historical on-time performance.",
    icon: "ThumbsUp",
    inputs: [
      "Flight designator code and carrier",
      "Aircraft equipment code (e.g., Boeing 787-9, Airbus A320)",
      "Cabin class selection",
      "Historical arrival delay metrics"
    ],
    pipeline: [
      "Query aircraft tail register databases to determine the exact age of the plane allocated to the route.",
      "Map equipment configurations: Assign comfort ratings based on seat pitch (inches), layout configuration (e.g. 3-3-3 vs 2-4-2), seat type (lie-flat vs. standard recliner), and power outlet types.",
      "Query carrier databases to check Wi-Fi speed capability (Broadband vs. text-only vs. none).",
      "Deduct points based on the flight's 90-day historical delay index (e.g. if average delay >30 minutes, deduct 15 points).",
      "Compute final consolidated quality score (scale 1-10)."
    ],
    output: "Quality breakdown: { score: 8.4, metrics: { seat_comfort: 'Good (32\" pitch)', wifi: 'High-speed streaming', power: 'USB-C at seat', on_time_rate: '94%' } }",
    mlOpportunities: [
      "Regression model predicting passenger subjective satisfaction scores based on combined objective flight parameters.",
      "Predictive seat map assignment tracking to isolate best seat options on specific aircraft configurations."
    ],
    dataRequirements: [
      "Comprehensive global aircraft fleet equipment database.",
      "Real-time seat pitch, width, and inflight services specifications.",
      "Historical flight-by-flight arrival delay metrics."
    ],
    futureImprovements: [
      "Dynamic passenger VR seat reviews: Let users experience a 3D preview of the exact legroom before completing ticket reservations.",
      "Dynamic allergen notifications based on airline cabin standards."
    ]
  },
  {
    id: "baggage-comparison",
    name: "Baggage Cost & Rules Comparison",
    category: "quality",
    description: "Calculates the exact total cost of travel including checked and carry-on baggage, normalizing differing airline baggage allowances.",
    icon: "Briefcase",
    inputs: [
      "Selected flight itineraries",
      "Passenger baggage requirements (e.g., 1 carry-on, 2 checked bags)",
      "Airline baggage fee rules databases"
    ],
    pipeline: [
      "Parse the fine print of the ticket rules from the GDS response to extract included baggage limits.",
      "Evaluate extra luggage pricing matching the carrier's fee guidelines, accounting for price increases if purchased at the gate instead of during booking.",
      "Calculate dimensions and weight limits to highlight risk of oversize charges.",
      "Return normalized total price: Ticket_Price + Baggage_Surcharge_Price."
    ],
    output: "Baggage fee summary outlining dimensions, weight boundaries, and total added cost per carrier.",
    mlOpportunities: [
      "Natural Language Processing (NLP) models to automatically extract baggage fee terms from unstructured airline fare rules sheets.",
      "Predictive baggage pricing tracking."
    ],
    dataRequirements: [
      "Constantly updated directory of global airline baggage size limits, weight thresholds, and fee schedules."
    ],
    futureImprovements: [
      "Camera-based bag sizer: Allow passengers to scan their bags using their phone camera (AR) to automatically verify compatibility with the selected flight limits.",
      "Automated lost-luggage insurance bundling."
    ]
  },
  {
    id: "cancellation-flexibility",
    name: "Cancellation & Refund Flexibility Scoring",
    category: "quality",
    description: "Grades the ticket tier's refundability, change fees, and cancellation window terms, helping users understand financial risks.",
    icon: "RefreshCw",
    inputs: [
      "Fare booking code (class fare bases)",
      "Airline change/cancellation fee guidelines",
      "Passenger booking date vs flight date"
    ],
    pipeline: [
      "Analyze fare rules to identify refundability class (Fully Refundable, Voucher-only Refund, Non-Refundable).",
      "Calculate change penalties: Extract flat fees plus fare-difference calculation rules.",
      "Establish the 24-hour free cancellation grace period applicability under local transport laws (e.g., US DOT rules).",
      "Assign an intuitive flexibility index score (e.g., 'Risk: High', 'Flexibility: Maximum')."
    ],
    output: "Flexibility specifications: { refund_status: 'Voucher only', change_fee: '$150 + fare diff', cancel_window_hours: 24, flexibility_index: 'Moderate' }",
    mlOpportunities: [
      "NLP sequence-to-sequence transformers mapping complex legal airline contract syntax into structured parameters.",
      "Predictive ticket-refund risk modeling."
    ],
    dataRequirements: [
      "GDS fare category database mapping fare basis codes to operational refund conditions."
    ],
    futureImprovements: [
      "FlySmart Cancel-for-Any-Reason (CFAR) internal waiver generator, pricing the risk of cancellation dynamically to offer instant in-app flight refunds.",
      "Automated flight delay compensation tracker."
    ]
  },
  {
    id: "carbon-emissions",
    name: "Carbon Emissions Estimator",
    category: "sustainability_safety",
    description: "Calculates the carbon footprint of each flight segment, accounting for aircraft model efficiency, passenger load factor, and seating class density, recommending green alternatives.",
    icon: "Leaf",
    inputs: [
      "Flight distance (great-circle calculation)",
      "Aircraft model and engine types",
      "Seat class configuration (business class occupies up to 3x more physical space, increasing carbon share)"
    ],
    pipeline: [
      "Calculate flight distance using coordinates of origin and destination hubs.",
      "Apply localized fuel burn equations matching the aircraft type (e.g. Airbus A350 burns up to 25% less fuel per passenger-kilometer than older Boeing 777-200 models).",
      "Adjust emissions index based on class seat area factors: Economy (1.0 coefficient), Business (2.9 coefficient), First (4.0 coefficient).",
      "Compare result against regional route averages to calculate the 'Green Saving' ratio."
    ],
    output: "Emissions payload: { carbon_kg: 240, comparison_vs_average_percent: -18, rating: 'Eco-Friendly Option' }",
    mlOpportunities: [
      "Predictive fuel-burn neural network models mapping actual flight telemetry trajectories (wind currents, holding patterns) to calculate real-world emissions instead of static theoretical metrics.",
      "Carbon price estimation models for carbon-offset portfolios."
    ],
    dataRequirements: [
      "ICAO carbon emissions calculator data sheets.",
      "Detailed aircraft engine specs and passenger load factor historical tables."
    ],
    futureImprovements: [
      "Direct gold-standard carbon offset purchasing paths at checkout.",
      "Sustainable Aviation Fuel (SAF) certificate allocation tracking."
    ]
  },
  {
    id: "travel-advisories",
    name: "Travel Advisories & AI Safety Copilot",
    category: "sustainability_safety",
    description: "Synthesizes real-time travel safety warnings, entry visa rules, healthcare guidelines, and local custom protocols for the destination, using generative AI models.",
    icon: "ShieldAlert",
    inputs: [
      "Destination country and city",
      "Passenger nationality (for visa rules)",
      "Current real-time advisory feeds (State Dept, WHO, local consulates)",
      "Gemini API model context limits"
    ],
    pipeline: [
      "Query government state department feeds and health organization databases to retrieve the latest warnings for the destination.",
      "Incorporate visa restriction matrices matching the passenger's passport country against the destination country.",
      "Feed the collected context into the Gemini API (using gemini-2.5-flash) with structured schema constraints.",
      "Instruct Gemini to synthesize a concise, high-contrast travel brief covering security alerts, visa entry requirements, health protocols, and top cultural rules.",
      "Validate JSON schema output before caching in Redis (TTL: 12 hours)."
    ],
    output: "Synthesized AI Safety Briefing object: { safety_level: 'Exercise Normal Precautions', visa_required: true, health_notices: ['Yellow fever vaccine recommended'], localized_tips: [...] }",
    mlOpportunities: [
      "Integrate Gemini semantic search (RAG) over dynamic international custom handbooks to provide instantaneous, highly reliable visa responses to passenger travel questions.",
      "Real-time translation of foreign language emergency alerts."
    ],
    dataRequirements: [
      "Up-to-date government advisory API streams.",
      "IATA Timatic database containing global passport, visa, and health document requirements."
    ],
    futureImprovements: [
      "Live geo-located push alerts during trips: Instantly alert the user via the app if an active security alert, transportation strike, or weather anomaly occurs in their vicinity.",
      "Generative visa application assistant filling forms automatically."
    ]
  }
];
