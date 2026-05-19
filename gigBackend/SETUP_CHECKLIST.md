# Production-Ready Authentication System - Setup Checklist

## ✅ Files Created/Updated

### New Files
- [x] `database/migrations/009_refresh_tokens.sql` - Refresh token table schema
- [x] `src/utils/tokenUtils.js` - Token generation, hashing, verification
- [x] `src/models/RefreshTokenModel.js` - Refresh token database operations
- [x] `src/middlewares/securityMiddleware.js` - Helmet, CORS, rate limiting, request ID
- [x] `AUTH_SYSTEM_DOCUMENTATION.md` - Complete API documentation with examples
- [x] `.env.example` - Environment variable template

### Updated Files
- [x] `src/controllers/AuthController.js` - Complete rewrite with all endpoints
- [x] `src/routes/AuthRoutes.js` - New routes with all endpoints
- [x] `src/middlewares/AuthMiddleware.js` - Updated to use new tokenUtils
- [x] `index.js` - Security middleware integration
- [x] `package.json` - Added helmet and uuid dependencies

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies
```bash
cd gigBackend
npm install
```

This will install:
- `helmet` - Security headers
- `uuid` - Request IDs
- All other existing dependencies

### Step 2: Create Environment File
```bash
# Copy the example
cp .env.example .env

# Edit with your values
nano .env
```

**Required values to set:**
- `DB_HOST`, `DB_USER`, `DB_PASSWORD` - PostgreSQL credentials
- `JWT_SECRET` - Generate with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `CLIENT_ORIGIN` - Your frontend URL (http://localhost:5173 for dev)
- `EMAIL_*` - Email settings (Gmail requires app password)

### Step 3: Run Database Migrations
```bash
# PostgreSQL must be running
# Connect to your database

psql -U postgres -d gigsimpact -f database/migrations/001_users.sql
psql -U postgres -d gigsimpact -f database/migrations/002_categories.sql
# ... (run all numbered migrations in order)
psql -U postgres -d gigsimpact -f database/migrations/009_refresh_tokens.sql
```

Or use the seed file to populate test data:
```bash
psql -U postgres -d gigsimpact -f database/seed/seed.sql
```

### Step 4: Start the Server
```bash
npm start
```

Server will start on http://localhost:5000 with:
- Security headers enabled
- Rate limiting active
- CORS configured
- Database connected

---

## 🧪 Testing the System

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "SecureTest123!"
  }' \
  -c cookies.txt -v
```

Check response and that cookies are set (look for `Set-Cookie` headers)

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecureTest123!"
  }' \
  -c cookies.txt -v
```

### Test Protected Route
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Content-Type: application/json" \
  -b cookies.txt -v
```

Should return user data with status 200

### Test Token Refresh
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -b cookies.txt -v
```

Should return new tokens with status 200

### Test Rate Limiting
```bash
# Try logging in 6 times rapid-fire
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "wrong"
    }' \
    -w "\nAttempt $i - Status: %{http_code}\n"
done
```

6th request should get rate limited (429 status)

---

## 🔐 Security Checklist

Before going to production:

- [ ] **Environment Variables**
  - [ ] `JWT_SECRET` is 64+ characters, random, unique
  - [ ] `NODE_ENV=production`
  - [ ] `CLIENT_ORIGIN` set to actual domain
  - [ ] `DB_PASSWORD` is strong
  - [ ] Email credentials are app-specific passwords

- [ ] **Database**
  - [ ] PostgreSQL running with SSL
  - [ ] Backups configured
  - [ ] All migrations applied
  - [ ] Indexes created for `refresh_tokens` table

- [ ] **HTTPS**
  - [ ] SSL certificate installed
  - [ ] `secure: true` in cookie config (automatic with NODE_ENV=production)
  - [ ] Redirect HTTP → HTTPS

- [ ] **CORS**
  - [ ] `CLIENT_ORIGIN` restricted to your domain only
  - [ ] No wildcards (*) in production

- [ ] **Rate Limiting**
  - [ ] Auth endpoints protected
  - [ ] Appropriate limits set per endpoint

- [ ] **Logging**
  - [ ] Errors logged with request ID
  - [ ] No sensitive data in logs
  - [ ] Log rotation configured

- [ ] **Monitoring**
  - [ ] Error tracking (Sentry, etc.)
  - [ ] Uptime monitoring
  - [ ] Failed login tracking

- [ ] **Code**
  - [ ] No hardcoded secrets
  - [ ] All SQL parameterized
  - [ ] Input validation on all endpoints

---

##  API Endpoints Summary

### Public Endpoints
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/register` |  | Create account |
| POST | `/api/auth/login` | | Login |
| POST | `/api/auth/refresh` |  | Get new access token |
| POST | `/api/auth/request-password-reset` | | Request reset code |
| POST | `/api/auth/verify-reset-code` | | Verify reset code |
| POST | `/api/auth/reset-password` | | Reset password |

### Protected Endpoints (require access_token)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/auth/logout` | ✅ | Logout current device |
| POST | `/api/auth/logout-all` | ✅ | Logout all devices |
| GET | `/api/auth/active-sessions` | ✅ | List active sessions |

---

## Frontend Integration

### Fetch API
```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // IMPORTANT!
  body: JSON.stringify({ email, password })
});

// Protected request
const me = await fetch('http://localhost:5000/api/auth/me', {
  credentials: 'include' // IMPORTANT!
});
```

### Axios
```javascript
// Create instance with credentials
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true // IMPORTANT!
});

// Use in requests
const { data } = await api.get('/auth/me');
```

**Key:** Always set `credentials: 'include'` or `withCredentials: true`

---

## 📊 Database Schema

```
users (existing)
├─ id (UUID)
├─ full_name
├─ email
├─ password (hashed)
├─ role
└─ ...

refresh_tokens (NEW)
├─ id (UUID)
├─ user_id (FK → users.id)
├─ token_hash (SHA-256 hashed)
├─ expires_at
├─ created_at
├─ revoked (boolean)
├─ revoked_at (timestamp)
├─ user_agent (for session tracking)
└─ ip_address (for session tracking)

Indexes:
├─ idx_refresh_tokens_user_id
├─ idx_refresh_tokens_token_hash
├─ idx_refresh_tokens_expires_at
└─ idx_refresh_tokens_revoked
```

---

## 🔍 Monitoring & Logging

### Key Logs to Check
```javascript
// Server startup
console.log('✓ Database connected successfully');

// Per request
console.log(`[${req.id}] ${req.method} ${req.path}`);

// Errors
console.error(`[${req.id}] Error:`, {
  message: err.message,
  path: req.path,
  method: req.method
});
```

### Request IDs
Every request gets unique ID for tracing:
```
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
```

---

## 🆘 Common Issues & Solutions

### Issue: "Cookies not being set"
**Solution:**
- Check `CLIENT_ORIGIN` in `.env` matches frontend exactly
- Ensure `credentials: 'include'` on frontend requests
- In dev: cookies require same-origin or credentials flag

### Issue: "Token always expired"
**Solution:**
- Verify `JWT_SECRET` is same on server
- Check system clock synchronization
- Ensure `NODE_ENV` is correct

### Issue: "Rate limit too restrictive"
**Solution:**
- Adjust limits in `src/middlewares/securityMiddleware.js`
- For development: increase max attempts

### Issue: "Database connection failed"
**Solution:**
```bash
# Verify PostgreSQL running
psql -U postgres -l

# Create database if needed
createdb gigsimpact

# Run migrations
psql -U postgres -d gigsimpact -f database/migrations/001_users.sql
```

---

## 📞 Support Commands

```bash
# Check server health
curl http://localhost:5000/health

# Test database
npm run test-db

# View logs
tail -f ~/.pm2/logs/app-error.log

# Install dependencies
npm install

# Start development
npm start
```

---

## 🎯 Next Steps

1. **Testing** - Run test cases above
2. **Frontend Integration** - Update React/Vue app to use new endpoints
3. **Email Setup** - Configure Gmail/SendGrid
4. **Deployment** - Deploy to production with proper env vars
5. **Monitoring** - Set up error tracking and uptime monitoring

---

*Generated: 2024*
*For support, refer to AUTH_SYSTEM_DOCUMENTATION.md*
