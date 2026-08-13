export interface AuthProviderInfo {
  id: string;
  name: string;
  type: string;
  description: string;
  securityTier: string;
  authFlow: string;
}

export interface RbacRole {
  role: string;
  description: string;
  permissions: string[];
  scope: string;
}

export interface SecurityPolicy {
  category: string;
  title: string;
  mechanism: string;
  threatMitigation: string;
  specification: string[];
}

export const AUTH_PROVIDERS: AuthProviderInfo[] = [
  {
    id: "email_password",
    name: "Standard Email & Password",
    type: "Traditional / Credentials",
    description: "Argon2id hashing with continuous salt updates, password complexity checks (entropy threshold >= 64 bits), and mandatory MFA enforcement.",
    securityTier: "Tier 2 (Moderate-High)",
    authFlow: "SRP (Secure Remote Password) protocol to prevent sending raw passwords over the wire."
  },
  {
    id: "google_oauth",
    name: "Google Workspace OIDC",
    type: "OAuth2 / OpenID Connect",
    description: "Enterprise federation allowing single-sign-on (SSO) mapped directly to corporate Google domains, validating ID tokens via JWKS keys.",
    securityTier: "Tier 3 (High-Trust SSO)",
    authFlow: "Authorization Code Flow with PKCE (Proof Key for Code Exchange) + dynamic nonce validation."
  },
  {
    id: "apple_signin",
    name: "Apple Private Sign-In",
    type: "OAuth2 / OpenID Connect",
    description: "Biometric-backed authentication, verifying Elliptic Curve (ES256) signed client assertions, allowing users to hide their real emails.",
    securityTier: "Tier 3 (High-Trust SSO)",
    authFlow: "Federated redirect validating user identity via public keys retrieved dynamically from Apple Key servers."
  },
  {
    id: "microsoft_oauth",
    name: "Microsoft Entra ID",
    type: "Active Directory / SAML / OIDC",
    description: "Federated authentication for tier-1 corporate accounts, partner travel agents, and commercial operators supporting automated RBAC synchronization.",
    securityTier: "Tier 4 (Sovereign Cloud SSO)",
    authFlow: "OIDC Client Credentials or Auth Code flow mapped to customized Active Directory tenant restrictions."
  },
  {
    id: "passkeys",
    name: "FIDO2 / WebAuthn Passkeys",
    type: "Cryptographic Hardware Sign-in",
    description: "Phishing-resistant biometrics (FaceID/TouchID) using WebAuthn standard. Relies on public-private keypairs secured in physical TPM/Secure Enclaves.",
    securityTier: "Tier 5 (Maximum Cryptographic)",
    authFlow: "Hardware Challenge-Response signing utilizing dynamic user credentials registered with our Authenticator servers."
  },
  {
    id: "magic_links",
    name: "Passwordless Magic Links",
    type: "Transient Tokens",
    description: "One-time-use cryptographic links delivered via transactional email channels, relying on secure localized SMTP transports and tight expiry bounds.",
    securityTier: "Tier 2 (Moderate)",
    authFlow: "HMAC-SHA256 signed token link with a strict 10-minute expiry window, invalidated immediately on access."
  }
];

export const RBAC_ROLES: RbacRole[] = [
  {
    role: "Global Administrator",
    description: "Root level control over global configurations, GDS contracts, system states, and master tenant setups.",
    permissions: [
      "system:write",
      "billing:write",
      "user:write",
      "user:impersonate",
      "partner:write",
      "audit:read"
    ],
    scope: "Global Cluster Root"
  },
  {
    role: "Operations Manager",
    description: "Manages pricing adjustments, supplier routing priorities, and partner credential configurations.",
    permissions: [
      "partner:read",
      "pricing:write",
      "flight:write",
      "user:read",
      "audit:read"
    ],
    scope: "Regional Ops Cluster"
  },
  {
    role: "Partner Developer",
    description: "Third-party developers querying our normalized Flight Intelligence Search APIs and flight data feeds.",
    permissions: [
      "flight:read",
      "api_key:write",
      "usage:read"
    ],
    scope: "Assigned Dev Tenant Only"
  },
  {
    role: "Frequent Traveler (Premium VIP)",
    description: "Registered B2C end-users accessing real-time search engine portals, price drop watches, and flight locks.",
    permissions: [
      "flight:read",
      "alerts:write",
      "booking:write"
    ],
    scope: "User Sandbox"
  }
];

export const SECURITY_POLICIES: SecurityPolicy[] = [
  {
    category: "Token Management",
    title: "Double-Token Strategy (Access & Refresh)",
    mechanism: "Short-lived Access JWTs (15-min lifetime) combined with opaque, crypto-random Refresh Tokens stored with cryptographically-hashed keys in Redis state stores.",
    threatMitigation: "Limits the attack window of compromised access tokens. Allows immediate state revocation by wiping session hashes in the Redis database cluster.",
    specification: [
      "Access Token: Signed using RS256 algorithm with keys rotated every 24 hours.",
      "Refresh Token: 32-byte secure random string with strict Rotation (RTR). Every token exchange revokes the old parent token and issues a child node.",
      "Cookie Setup: HTTPOnly, Secure, SameSite=Strict, and Partitioned (CHIPS compatible) to protect against CSRF and clickjacking."
    ]
  },
  {
    category: "Service Authentication",
    title: "S2S Authentication (mTLS & SPIFFE/SPIRE)",
    mechanism: "All internal microservice-to-microservice traffic is encrypted and authenticated using mutual TLS (mTLS) with short-lived X.509 certificates managed by Envoy/Istio sidecars.",
    threatMitigation: "Eliminates hardcoded passwords or credentials in service configurations. Prevents service spoofing and lateral network expansion inside the Kubernetes cluster.",
    specification: [
      "Certificates: Issued dynamically via SPIFFE/SPIRE with a maximum lifetime of 12 hours.",
      "Automatic Rotation: Background sidecar tasks refresh TLS materials before expiration without service downtime.",
      "Fallback Rule: Bypassing mTLS immediately trips circuit breakers and reports to the Network Security operations center."
    ]
  },
  {
    category: "Partner APIs & Credentials",
    title: "API Keys & Secrets Management",
    mechanism: "API keys are hashed on creation using SHA-256 before database commit. Server secrets are fetched dynamically at runtime using HashiCorp Vault or AWS Secrets Manager.",
    threatMitigation: "Prevents raw secrets leakage from SQL logs, database backups, or environment variable logging.",
    specification: [
      "Client Secret: Hashed in DB (client sees secret once at creation).",
      "API Key Signature: Dynamic client-signed HMAC signature recommended for high-priority transaction feeds.",
      "Key Rotation: Dynamic secret lease durations with automatic alert notifications sent when expiration approaches."
    ]
  },
  {
    category: "Abuse & Threat Prevention",
    title: "Multi-Layer Bot & DDoS Defense",
    mechanism: "Token Bucket rate limiting on edge API gateways paired with Cloudflare Turnstile CAPTCHA and machine-learning anomaly detection for browser behavior.",
    threatMitigation: "Mitigates credential stuffing, API key scraping, credential spraying, and malicious flight scraping from unauthorized competitors.",
    specification: [
      "IP Rate Limit: Strict limit of 10 login attempts per minute per IP segment.",
      "Turnstile Injection: Adaptive triggers load CAPTCHA challenges dynamically if flight searches exceed standard human limits (e.g., >30 searches/min).",
      "Device Trust: Captures canvas fingerprints and JA3 TLS signatures to verify actual human browser profiles."
    ]
  },
  {
    category: "Administrative Supervision",
    title: "Audit Logs & User Impersonation",
    mechanism: "User Impersonation is highly audited. Admins must generate a cryptographic lease signed by their specific token to act as a traveler. Every session logs traces.",
    threatMitigation: "Mitigates admin power abuse, compliance gaps, and internal security leaks regarding customer profile access.",
    specification: [
      "Lease Expiry: Admin session impersonation expires automatically after 30 minutes.",
      "Immutable Audit Log: Dispatched directly to a write-once-read-many (WORM) storage tier like AWS S3 with Object Lock or secure cloud audit grids.",
      "Dual Authorization: Production impersonation over high-net-worth VIP clients requires active dual-admin approval."
    ]
  }
];

export const JWT_HEADER_EXAMPLE = `{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "prod-auth-key-v1"
}`;

export const JWT_PAYLOAD_EXAMPLE = `{
  "iss": "https://auth.flysmart.travel",
  "sub": "usr_9921b3f62c0e",
  "aud": "https://api.flysmart.travel",
  "exp": 1782638400,
  "iat": 1782637500,
  "name": "Niels Bohr",
  "email": "niels.bohr@flysmart.travel",
  "scope": "flight:read alert:write booking:write",
  "identity_provider": "google_oauth",
  "roles": ["Partner Developer"],
  "tenant_id": "ten_00192a88",
  "mfa_verified": true,
  "device_trust_score": 0.98
}`;
