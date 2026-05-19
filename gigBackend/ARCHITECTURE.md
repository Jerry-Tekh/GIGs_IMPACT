# 🔐 Authentication System - Architecture Overview

## System Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser/App)                           │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │              HTTP-Only Cookies (Secure)                      │    │
│  │  ├─ access_token: JWT (15 min)                              │    │
│  │  └─ refresh_token: Random string (7 days)                   │    │
│  │                                                               │    │
│  │  Features:                                                    │    │
│  │  • Cannot be accessed by JavaScript (XSS safe)             │    │
│  │  • Auto-sent with CORS requests (credentials flag)         │    │
│  │  • Automatically cleared on logout                          │    │
│  │  • Only sent to configured domain (CORS)                   │    │
│  └──────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓ (Request with cookies)
┌────────────────────────────────────────────────────────────────────────┐
│                   SERVER (Express.js Backend)                          │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │              Security Middleware Stack                        │   │
│  ├─ Helmet: Security headers                                    │   │
│  ├─ CORS: Restrict to CLIENT_ORIGIN                            │   │
│  ├─ Rate Limiting: 5 login attempts / 15 min                   │   │
│  ├─ Request ID: Unique ID for tracing                          │   │
│  └─ Cookie Parser: Extract tokens from cookies                 │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                    ↓
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                      Routes                                   │   │
│  ├─ /auth/register      → Create account                        │   │
│  ├─ /auth/login         → Authenticate & create session         │   │
│  ├─ /auth/refresh       → Rotate tokens                         │   │
│  ├─ /auth/logout        → Revoke current token                  │   │
│  ├─ /auth/logout-all    → Revoke all tokens                     │   │
│  ├─ /auth/me            → Get current user (protected)          │   │
│  └─ /auth/active-sessions → List active devices (protected)     │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                    ↓
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                   Controllers/Logic                           │   │
│  ├─ Validate input                                               │   │
│  ├─ Hash passwords (bcrypt)                                      │   │
│  ├─ Generate tokens                                              │   │
│  ├─ Hash refresh tokens (SHA-256)                                │   │
│  ├─ Handle token rotation                                        │   │
│  └─ Send email codes                                             │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                    ↓
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │              Database (PostgreSQL)                            │   │
│  ├─ users table                                                   │   │
│  │  ├─ id, email, password (hashed), role, etc.                │   │
│  │                                                                │   │
│  ├─ refresh_tokens table (NEW)                                  │   │
│  │  ├─ id: UUID                                                 │   │
│  │  ├─ user_id: Foreign key to users                           │   │
│  │  ├─ token_hash: SHA-256(refresh_token)                      │   │
│  │  ├─ expires_at: 7 days from creation                        │   │
│  │  ├─ revoked: Boolean flag for logout                        │   │
│  │  ├─ user_agent: Device tracking                             │   │
│  │  └─ ip_address: Location tracking                           │   │
│  └────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Request/Response Flow

### Login Flow
```
1. User enters email/password
   └─→ POST /auth/login {email, password}

2. Server validates credentials
   ├─ Query: SELECT * FROM users WHERE email = ?
   ├─ Compare: bcrypt.compare(password, user.password)
   └─ If invalid → Return 401

3. Generate tokens
   ├─ Access Token: JWT.sign({user_id, email, role}, JWT_SECRET, {exp: 15m})
   └─ Refresh Token: crypto.randomBytes(32).toString('hex')

4. Hash refresh token
   └─ Token Hash: SHA-256(refresh_token)

5. Store token
   ├─ INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
   ├─ Values: (uuid, hash, NOW()+7days, 'Mozilla...', '192.168.1.1')
   └─ Index: idx_refresh_tokens_token_hash

6. Set cookies
   ├─ access_token cookie:
   │  ├─ httpOnly: true (JavaScript can't read)
   │  ├─ secure: true (HTTPS only in production)
   │  ├─ sameSite: 'strict' (No cross-site sending)
   │  └─ maxAge: 15 * 60 * 1000
   │
   └─ refresh_token cookie:
      ├─ httpOnly: true
      ├─ secure: true
      ├─ sameSite: 'strict'
      └─ maxAge: 7 * 24 * 60 * 60 * 1000

7. Return response
   └─ {success: true, data: {id, name, email, role}}
```

### Protected Route Access
```
1. Browser makes request with cookies
   └─→ GET /api/posts
       Headers: Cookie: access_token=eyJ...; refresh_token=3f4...

2. Server receives request
   ├─ Extract: access_token from cookies
   ├─ Decode: JWT.verify(token, JWT_SECRET)
   ├─ Attach: req.user = {user_id, email, role}
   └─ Proceed to route handler

3. Return response
   └─ {success: true, data: {...}}
```

### Token Refresh Flow
```
1. Access token expires (15 min)
   └─→ Client gets 401 from protected route

2. Client calls refresh
   └─→ POST /auth/refresh
       Headers: Cookie: refresh_token=3f4...

3. Server validates refresh token
   ├─ Extract: refresh_token from cookie
   ├─ Hash: token_hash = SHA-256(refresh_token)
   ├─ Query: SELECT * FROM refresh_tokens WHERE token_hash = ?
   ├─ Validate:
   │  ├─ Token exists
   │  ├─ Not revoked
   │  └─ Not expired (expires_at > NOW())
   └─ If invalid → Return 401

4. ROTATE tokens
   ├─ Step 1: Revoke old token
   │  └─ UPDATE refresh_tokens SET revoked=true WHERE id=?
   │
   ├─ Step 2: Generate new tokens
   │  ├─ New access token (JWT)
   │  └─ New refresh token (random)
   │
   ├─ Step 3: Store new hash
   │  └─ INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ...)
   │
   └─ Step 4: Set new cookies
      ├─ access_token cookie (new JWT)
      └─ refresh_token cookie (new random)

5. Return success
   └─ {success: true, data: {id, name, email, role}}

6. Client retries original request with new access token
```

### Reuse Detection
```
Scenario: Token stolen before rotation

Timeline:
├─ T0: User logs in
│  ├─ Refresh token: abc123xyz...
│  ├─ Hash stored: SHA256(abc123xyz...)
│  └─ Token valid in DB
│
├─ T1: Attacker intercepts refresh token
│  └─ Attacker has: abc123xyz...
│
├─ T2: Legitimate user refreshes (first use)
│  ├─ Hash: SHA256(abc123xyz...)
│  ├─ Lookup: Found in DB
│  ├─ Rotate: Old hash revoked, new token issued
│  └─ User continues normally
│
└─ T3: Attacker tries stolen token (second use)
   ├─ Hash: SHA256(abc123xyz...)
   ├─ Lookup: NOT found (was revoked at T2!)
   ├─ Detection: Token reuse detected
   ├─ Action: Revoke ALL user tokens (logout all devices)
   └─ Response: 401 Unauthorized
      Message: "Session expired. Please login again."

Result: Attacker blocked, user must re-login
```

---

## File Organization

```
Authentication System Files:
│
├─ Core Utilities
│  └─ src/utils/tokenUtils.js
│     ├─ generateAccessToken()      → Creates JWT
│     ├─ generateRefreshToken()     → Creates random string
│     ├─ hashToken()                → SHA-256 hashing
│     ├─ verifyAccessToken()        → Validates JWT
│     └─ isRefreshTokenValid()       → Validates refresh token
│
├─ Database Operations
│  └─ src/models/RefreshTokenModel.js
│     ├─ storeRefreshToken()        → Save hash to DB
│     ├─ findRefreshTokenByHash()   → Lookup token
│     ├─ revokeRefreshToken()       → Mark as revoked
│     ├─ revokeAllUserTokens()      → Logout all devices
│     └─ getUserActiveTokens()      → List sessions
│
├─ Request Handlers
│  └─ src/controllers/AuthController.js
│     ├─ register()                 → POST /register
│     ├─ login()                    → POST /login
│     ├─ refresh()                  → POST /refresh
│     ├─ logout()                   → POST /logout
│     ├─ logoutAll()                → POST /logout-all
│     ├─ me()                       → GET /me
│     ├─ getActiveSessions()        → GET /active-sessions
│     └─ Password reset endpoints
│
├─ HTTP Middleware
│  ├─ src/middlewares/AuthMiddleware.js
│  │  ├─ protect()                  → JWT verification
│  │  └─ adminOnly()                → Role checking
│  │
│  └─ src/middlewares/securityMiddleware.js
│     ├─ securityHeaders()          → Helmet
│     ├─ corsConfig                 → CORS setup
│     ├─ requestIdMiddleware()      → Request tracing
│     ├─ generalLimiter             → Rate limiting
│     ├─ authLimiter                → Login rate limit
│     └─ errorHandler()             → Error handling
│
├─ Routes
│  └─ src/routes/AuthRoutes.js
│     └─ 10 endpoints
│
├─ Configuration
│  ├─ .env.example
│  ├─ index.js                      → Middleware setup
│  └─ src/config/db.js              → DB connection
│
└─ Database Schema
   ├─ database/migrations/001_users.sql
   └─ database/migrations/009_refresh_tokens.sql
```

---

## Data Flow Diagram

```
User Input
   ↓
┌─────────────────────────────────────────────┐
│ Express Routes                              │
│ /auth/login, /auth/register, etc.          │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│ Auth Middleware (protect)                   │
│ - Extract JWT from cookie                   │
│ - Verify signature                          │
│ - Check expiration                          │
│ - Attach user to req.user                   │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│ AuthController                              │
│ - Validate inputs                           │
│ - Generate tokens (tokenUtils)              │
│ - Hash refresh token (tokenUtils)           │
│ - Call database (RefreshTokenModel)         │
│ - Set cookies on response                   │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│ RefreshTokenModel                           │
│ - storeRefreshToken()                       │
│ - findRefreshTokenByHash()                  │
│ - revokeRefreshToken()                      │
│ - revokeAllUserTokens()                     │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│ PostgreSQL Database                         │
│ - users table (existing)                    │
│ - refresh_tokens table (new)                │
│ - Indexes on token_hash, user_id, expires_at
└─────────────────────────────────────────────┘
```

---

## Token Lifecycle Timeline

```
LOGIN (T=0)
├─ Access Token Created
│  ├─ Expires: T + 15 minutes
│  ├─ Stored: HTTP-only cookie
│  └─ Use: Request authentication
│
└─ Refresh Token Created
   ├─ Plain: 64-char random string (client has)
   ├─ Hash: SHA-256 version (DB has)
   ├─ Expires: T + 7 days
   ├─ Stored: HTTP-only cookie + DB (hashed)
   └─ Use: Refresh access token

REQUEST at T=5min
├─ Client sends access_token in cookie
├─ Server verifies JWT
├─ User authenticated
└─ Request proceeds

REQUEST at T=16min
├─ Client sends access_token (expired)
├─ Server returns 401
├─ Client calls /refresh with refresh_token
├─ Server validates refresh_token
└─ ROTATE:
   ├─ Old token revoked in DB
   ├─ New tokens generated
   ├─ New tokens set in cookies
   └─ Client retries original request

REQUEST at T=7days
├─ Refresh token expires
├─ /refresh fails with 401
├─ Client redirected to login
└─ User must authenticate again

LOGOUT at any time
├─ /logout endpoint called
├─ Current refresh token revoked in DB
├─ Cookies cleared
└─ Session ends (this device)

LOGOUT-ALL at any time
├─ /logout-all endpoint called
├─ ALL refresh tokens revoked in DB
├─ Cookies cleared
└─ All sessions end (all devices)
```

---

## Security Layers

```
Layer 1: Network Level
├─ HTTPS only (secure: true in production)
├─ HSTS header (force HTTPS)
└─ TLS 1.3+ (recommended)

Layer 2: Token Storage
├─ HTTP-only cookies (immune to XSS)
├─ sameSite=strict (prevent CSRF)
├─ secure flag (HTTPS only)
└─ path=/ (not accessible by subpaths)

Layer 3: Token Generation
├─ Access JWT: Signed with JWT_SECRET
├─ Refresh token: 256-bit cryptographically random
└─ Reset code: 6-digit numeric (not JWT)

Layer 4: Token Storage in DB
├─ Refresh tokens stored as SHA-256 hash
├─ Original token never stored
├─ If DB breached: hashes unusable
└─ Attacker still needs original token

Layer 5: Token Validation
├─ JWT signature verification
├─ Expiration checking
├─ Revocation checking (refresh tokens)
├─ IP/User-Agent tracking
└─ Rate limiting on auth endpoints

Layer 6: Password Security
├─ Bcrypt hashing (10 rounds)
├─ Never logged or transmitted
├─ Salted and random per user
└─ 8+ character minimum

Layer 7: Application Security
├─ Input validation (email, password length)
├─ SQL injection prevention (parameterized queries)
├─ CORS restriction (CLIENT_ORIGIN only)
├─ Security headers (Helmet)
└─ Request rate limiting
```

---

## Performance Considerations

```
Database Queries (optimized):

Token Lookup (O(1)):
└─ CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash)
   └─ Lookups: < 1ms per query

Token Cleanup (O(n)):
└─ DELETE FROM refresh_tokens WHERE expires_at < NOW()
   └─ Schedule: Daily via cron

User Lookup (O(1)):
└─ CREATE INDEX ON users(email)
   └─ Lookups: < 1ms per query

Scaling Strategy:
├─ Connection pooling (max 20)
├─ Read replicas for user lookups
├─ Redis cache for active sessions
└─ Load balancer with sticky sessions
```

---

## Error Handling

```
Input Validation Errors (400)
├─ Missing fields
├─ Invalid email format
├─ Password too short
└─ Return: Safe message, no SQL details

Authentication Errors (401)
├─ Invalid credentials
├─ Token expired
├─ Token invalid
├─ Token not found (reuse detection)
└─ Return: Safe message, prompt login

Authorization Errors (403)
├─ Insufficient role
├─ No token provided
└─ Return: Safe message, not authenticated

Rate Limit Errors (429)
├─ Too many login attempts
├─ Too many reset requests
└─ Return: Retry-After header

Server Errors (500)
├─ Database connection failed
├─ Email send failed
├─ Internal errors
└─ Return: Generic message, log details internally
```

---

## Monitoring Points

```
Key Metrics to Track:

Login Attempts:
└─ Failed logins per IP (detect brute force)
└─ Successful logins per user (detect anomalies)

Token Operations:
├─ Token refresh count (normal: 2-3 per user per day)
├─ Token reuse detection (should be rare)
└─ Token expiration rate

Session Activity:
├─ Active sessions per user (usual: 1-3)
├─ New device logins (detect compromise)
└─ Logout-all operations (unusual events)

Security Events:
├─ Rate limit hits
├─ Invalid token attempts
├─ Password reset attempts
└─ Failed email sends
```

---

## Deployment Architecture

```
Production Setup:

┌─────────────────────────────────────────────────────┐
│                   CDN / CloudFlare                  │
│  (DDoS protection, caching, SSL termination)        │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│              Load Balancer (Nginx)                  │
│  (SSL termination, request routing, rate limiting)  │
└────────────┬──────────────────┬─────────────────────┘
             ↓                  ↓
        ┌─────────────┐  ┌─────────────┐
        │ Backend 1   │  │ Backend 2   │
        │ (Node.js)   │  │ (Node.js)   │
        │ :5000       │  │ :5000       │
        └─────────────┘  └─────────────┘
             ↓                  ↓
        ┌──────────────────────────────────┐
        │   Redis Cache (optional)         │
        │   (Session cache, rate limit)    │
        └──────────────────────────────────┘
             ↓                  ↓
        ┌──────────────────────────────────┐
        │   PostgreSQL Primary + Replica   │
        │   (Main + Standby)               │
        └──────────────────────────────────┘
```

---

This completes the production-ready authentication system! 🚀
