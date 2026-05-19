# GIGs Impact - Production-Ready Authentication System

## Overview

This is a fintech-grade authentication system with:
- **Access Tokens**: Short-lived JWTs (15 minutes)
- **Refresh Tokens**: Long-lived secure strings (7 days), hashed before storage
- **Token Rotation**: Automatic refresh token rotation with reuse detection
- **HTTP-Only Cookies**: Secure token storage, immune to XSS
- **Rate Limiting**: Brute-force protection on auth endpoints
- **Security Headers**: Helmet for common web vulnerabilities
- **Session Tracking**: IP and user-agent recording per session

---

## Quick Start

### 1. Prerequisites
```bash
# Node.js v16+
node --version

# PostgreSQL running
psql --version
```

### 2. Setup
```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Configure .env with your values
# - DATABASE CREDENTIALS
# - JWT_SECRET (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# - EMAIL settings
# - CLIENT_ORIGIN (your frontend URL)
```

### 3. Database
```bash
# Run migrations in order:
# 001_users.sql
# 002_categories.sql
# 003_posts.sql
# 004_comments.sql
# 005_donations.sql
# 006_newletters.sql
# 007_postViews.sql
# 008_password_reset.sql
# 009_refresh_tokens.sql (NEW)

psql -U postgres -d gigsimpact -f database/migrations/001_users.sql
psql -U postgres -d gigsimpact -f database/migrations/009_refresh_tokens.sql
```

### 4. Run Server
```bash
npm start
# Server runs on http://localhost:5000
```

---

## API ENDPOINTS

### 1. REGISTER - Create New Account
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }' \
  -c cookies.txt
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "author"
  }
}
```

**Security Notes:**
- Password hashed with bcrypt (10 rounds)
- Refresh token: secure random bytes, SHA-256 hashed, stored in DB
- Cookies set with httpOnly, secure (HTTPS in prod), sameSite=strict

---

### 2. LOGIN - Authenticate
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }' \
  -c cookies.txt
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "author"
  }
}
```

**Cookies Set:**
- `access_token`: JWT, 15 min expiry, httpOnly
- `refresh_token`: Random string, 7 day expiry, httpOnly

---

### 3. REFRESH TOKEN - Get New Access Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "author"
  }
}
```

**Security Notes:**
- **Token Rotation**: Old refresh token revoked, new one issued
- **Reuse Detection**: If token not found in DB → possible theft → deny
- **Automatic Refresh**: Client should call this before access token expires

---

### 4. GET CURRENT USER
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "author"
  }
}
```

---

### 5. LOGOUT - Current Device
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Security Notes:**
- Revokes current refresh token
- Clears cookies
- User remains logged in on other devices

---

### 6. LOGOUT ALL - All Devices
```bash
curl -X POST http://localhost:5000/api/auth/logout-all \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out from 3 device(s)",
  "data": {
    "revokedSessions": 3
  }
}
```

**Security Notes:**
- Revokes ALL refresh tokens for user
- Forces re-login on all devices
- Use after password change or suspicious activity

---

### 7. GET ACTIVE SESSIONS
```bash
curl -X GET http://localhost:5000/api/auth/active-sessions \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-uuid",
        "device": "Mozilla/5.0...",
        "ipAddress": "192.168.1.1",
        "createdAt": "2024-01-15T10:30:00Z",
        "expiresAt": "2024-01-22T10:30:00Z"
      }
    ]
  }
}
```

---

### 8. REQUEST PASSWORD RESET
```bash
curl -X POST http://localhost:5000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "If email exists, reset code has been sent"
}
```

**Security Notes:**
- Does NOT reveal if email exists (brute-force protection)
- Sends 6-digit code via email
- Code expires in 15 minutes

---

### 9. VERIFY RESET CODE
```bash
curl -X POST http://localhost:5000/api/auth/verify-reset-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "resetCode": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Reset code verified"
}
```

---

### 10. RESET PASSWORD
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "resetCode": "123456",
    "password": "NewPassword123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully. Please login again."
}
```

**Security Notes:**
- Revokes ALL refresh tokens (force re-login everywhere)
- Clears cookies
- New password hashed with bcrypt

---

## Security Architecture

### Token Strategy

```
┌─────────────────────────────────────────────────┐
│            CLIENT (Browser)                     │
│  - Receives tokens in HTTP-only cookies          │
│  - Cannot access via JavaScript (XSS safe)      │
│  - Cookies auto-sent with every request         │
└─────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────┐
│            SERVER (Node.js)                     │
│                                                  │
│  ACCESS TOKEN (JWT):                            │
│  ├─ Payload: user_id, email, role               │
│  ├─ Signed with JWT_SECRET                      │
│  ├─ Expires: 15 minutes                         │
│  ├─ Used for: Route authorization               │
│  └─ Stored: HTTP-only cookie                    │
│                                                  │
│  REFRESH TOKEN (Random String):                 │
│  ├─ 32 bytes random (256 bits entropy)          │
│  ├─ NOT a JWT (prevents token analysis)         │
│  ├─ Hashed: SHA-256 before DB storage           │
│  ├─ Expires: 7 days                             │
│  ├─ Rotated: New token on each refresh          │
│  └─ Stored: HTTP-only cookie + DB               │
│                                                  │
│  DATABASE (refresh_tokens table):               │
│  ├─ token_hash: SHA-256(refresh_token)          │
│  ├─ user_id: Foreign key                        │
│  ├─ expires_at: Expiration timestamp            │
│  ├─ revoked: Boolean for logout                 │
│  ├─ user_agent: Device tracking                 │
│  └─ ip_address: IP tracking                     │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Request Flow

```
CLIENT REQUESTS PROTECTED ROUTE
│
├─ Browser sends cookies (access_token, refresh_token)
│
├─ Server receives request
│  ├─ Extract access_token from cookie
│  ├─ Verify JWT signature
│  ├─ Check expiration
│  ├─ Attach user to req.user
│  └─ Proceed to route handler
│
└─ SUCCESS or TOKEN EXPIRED
   ├─ SUCCESS: User authenticated, proceed
   └─ TOKEN EXPIRED: Return 401, client calls /refresh
      ├─ Server extracts refresh_token
      ├─ Hashes it (SHA-256)
      ├─ Looks up in DB by hash
      ├─ Validates:
      │  ├─ Not revoked
      │  ├─ Not expired
      │  └─ Found in DB
      ├─ ROTATION:
      │  ├─ Revoke old token
      │  ├─ Generate new tokens
      │  ├─ Store new refresh token hash
      │  └─ Set new cookies
      └─ Return success + user data
```

### Security Features

**1. Password Hashing**
- Algorithm: bcrypt
- Salt rounds: 10
- Resistant to: Brute-force, dictionary attacks

**2. Refresh Token Storage**
```
Plain token: only in client cookie
Hashed token: in database

If DB breached:
- Attacker gets hashes, not usable tokens
- Without plain token, cannot make valid requests
- Current sessions unaffected (rotation)
```

**3. Token Rotation**
```
User refreshes token:
1. Old token revoked in DB
2. New token generated
3. New hash stored in DB
4. New cookie set

If attacker steals old token:
- Token is revoked, requests fail
- New token issued, attacker can't use old one
```

**4. Reuse Detection**
```
If token used TWICE:
1. First use: Found in DB, rotated
2. Second use: Hash not found (revoked)
3. Action: Revoke ALL user tokens
4. Reason: Possible token theft detected
```

**5. HTTP-Only Cookies**
```
✓ Immune to XSS attacks
✓ Automatically sent with requests
✓ Cannot be read by JavaScript
✓ Cannot be stolen by document.cookie
✓ Safer than localStorage
```

**6. Rate Limiting**
- Login: 5 attempts per 15 minutes
- Password reset: 3 attempts per hour
- General: 100 requests per 15 minutes

**7. Security Headers (Helmet)**
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- Referrer-Policy

---

## Development vs Production

### Development (.env)
```bash
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

# Cookies are NOT secure (http allowed)
# HTTPS not required
```

### Production (.env)
```bash
NODE_ENV=production
CLIENT_ORIGIN=https://yourdomain.com
TRUST_PROXY=true

# Cookies MUST be secure (HTTPS only)
# JWT_SECRET: Use strong random value
# Email properly configured
```

---

## Database Schema

```sql
-- Refresh tokens table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL (FK to users),
  token_hash TEXT NOT NULL (SHA-256 hash),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP,
  user_agent TEXT,
  ip_address TEXT
);

-- Indexes for performance
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
```

---

## Client-Side Implementation

### React Example
```javascript
// src/api/auth.js
const API = 'http://localhost:5000/api';

// Login
export const login = async (email, password) => {
  const response = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // IMPORTANT: Send cookies
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// Protected request
export const getMe = async () => {
  const response = await fetch(`${API}/auth/me`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // IMPORTANT: Send cookies
  });
  
  if (response.status === 401) {
    // Token expired, try refreshing
    await refreshToken();
    return getMe(); // Retry
  }
  return response.json();
};

// Refresh token
export const refreshToken = async () => {
  const response = await fetch(`${API}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  
  if (!response.ok) {
    // Refresh failed, user must login again
    window.location.href = '/login';
  }
  return response.json();
};

// Logout
export const logout = async () => {
  await fetch(`${API}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  window.location.href = '/login';
};
```

### Axios Interceptor
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // IMPORTANT: Send cookies
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      
      try {
        await api.post('/auth/refresh');
        return api(original); // Retry original request
      } catch {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Environment Variables

```env
# Required
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gigsimpact
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=<64-char random string>

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password

# Optional
TRUST_PROXY=false
LOG_LEVEL=info
```

---

## Troubleshooting

### Cookies Not Being Set
- Check `CLIENT_ORIGIN` matches frontend exactly
- In dev: ensure `secure: false` in cookies
- Ensure `credentials: 'include'` on frontend requests

### Token Always Expired
- Check `JWT_SECRET` is same on server
- Verify system clock is synchronized
- Ensure `.env` is loaded before starting server

### Rate Limiting Too Strict
- Adjust `max` in rate limiter config
- Check if behind proxy (TRUST_PROXY setting)

### Database Connection Failed
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database exists: `createdb gigsimpact`
- Run migrations in order

---

## Performance Considerations

1. **Token Lookup**: Indexed by hash for O(1) lookup
2. **Session Tracking**: Minimal data (user_agent, ip)
3. **Token Rotation**: Automatic, no manual maintenance
4. **Cleanup**: Expired tokens should be cleaned periodically
   ```sql
   DELETE FROM refresh_tokens WHERE expires_at < NOW();
   ```

---

## Compliance & Standards

- ✓ OWASP Top 10 protections
- ✓ NIST password requirements (8+ chars)
- ✓ JWT RFC 7519 compliant
- ✓ CORS RFC 7231
- ✓ Secure cookie RFC 6265bis

---

## Support & Documentation

For more info:
- JWT: https://jwt.io
- Bcrypt: https://en.wikipedia.org/wiki/Bcrypt
- OWASP: https://owasp.org
- Express.js: https://expressjs.com
