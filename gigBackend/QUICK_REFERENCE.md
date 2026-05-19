# 🚀 Quick Reference - All Commands

## Installation & Setup

### 1. Install Dependencies
```bash
cd gigBackend
npm install
```

**What gets installed:**
- helmet (security headers)
- uuid (request IDs)
- All existing dependencies

---

### 2. Create Environment File
```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env
# or
code .env
```

**Required values:**
```env
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=gigsimpact
DB_USER=postgres
DB_PASSWORD=yourpassword

JWT_SECRET=<generate-with-command-below>

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=app-password
```

### Generate JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 3. Setup Database

#### Create Database (if not exists)
```bash
createdb gigsimpact
```

#### Run Migrations (in order)
```bash
cd gigBackend

# Core tables
psql -U postgres -d gigsimpact -f database/migrations/001_users.sql
psql -U postgres -d gigsimpact -f database/migrations/002_categories.sql
psql -U postgres -d gigsimpact -f database/migrations/003_posts.sql
psql -U postgres -d gigsimpact -f database/migrations/004_comments.sql
psql -U postgres -d gigsimpact -f database/migrations/005_donations.sql
psql -U postgres -d gigsimpact -f database/migrations/006_newletters.sql
psql -U postgres -d gigsimpact -f database/migrations/007_postViews.sql
psql -U postgres -d gigsimpact -f database/migrations/008_password_reset.sql

# NEW: Auth system
psql -U postgres -d gigsimpact -f database/migrations/009_refresh_tokens.sql
```

#### Verify Migrations
```bash
psql -U postgres -d gigsimpact -c "\dt"
# Should show: users, refresh_tokens, categories, posts, etc.
```

---

### 4. Start Server
```bash
# Development
npm start

# With logs
npm start 2>&1 | tee server.log

# Watch mode (if configured)
npm run dev
```

**Expected output:**
```
╔════════════════════════════════════╗
║   GIGs Impact Backend              ║
║   Server running on port 5000      ║
║   Environment: development         ║
╚════════════════════════════════════╝
✓ Database connected successfully
```

---

## Testing Endpoints

### 1. Register (Create Account)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt \
  -v
```

**Expected:** 201 Created + user data + cookies set

---

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt \
  -v
```

**Expected:** 200 OK + user data + cookies set

---

### 3. Get Current User (Protected Route)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -v
```

**Expected:** 200 OK + user data (id, name, email, role)

---

### 4. Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -v
```

**Expected:** 200 OK + new user data + new cookies set

---

### 5. Get Active Sessions
```bash
curl -X GET http://localhost:5000/api/auth/active-sessions \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -v
```

**Expected:** 200 OK + array of active sessions with IPs and devices

---

### 6. Logout (Current Device)
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -v
```

**Expected:** 200 OK + "Logged out successfully"

---

### 7. Logout All Devices
```bash
# First login again
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}' \
  -c cookies.txt

# Then logout all
curl -X POST http://localhost:5000/api/auth/logout-all \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -v
```

**Expected:** 200 OK + "Logged out from X device(s)"

---

### 8. Password Reset - Request Code
```bash
curl -X POST http://localhost:5000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}' \
  -v
```

**Expected:** 200 OK + "Reset code sent to email"

---

### 9. Password Reset - Verify Code
```bash
curl -X POST http://localhost:5000/api/auth/verify-reset-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "resetCode": "123456"
  }' \
  -v
```

**Expected:** 200 OK + "Reset code verified" (or 401 if invalid)

---

### 10. Password Reset - Set New Password
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "resetCode": "123456",
    "password": "NewPassword123!"
  }' \
  -v
```

**Expected:** 200 OK + "Password reset successfully. Please login again."

---

## Testing Rate Limiting

### Test Login Rate Limit (5 attempts per 15 min)
```bash
# Run 6 times rapid-fire
for i in {1..6}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

**Expected:** 
- Attempts 1-5: 401 (Invalid credentials)
- Attempt 6: 429 (Too many requests)

---

## Development Commands

### Check Database Status
```bash
# List all tables
psql -U postgres -d gigsimpact -c "\dt"

# Check refresh_tokens table
psql -U postgres -d gigsimpact -c "SELECT COUNT(*) FROM refresh_tokens;"

# Check users
psql -U postgres -d gigsimpact -c "SELECT id, email, role FROM users;"

# View active tokens for a user
psql -U postgres -d gigsimpact -c "
  SELECT id, token_hash, expires_at, revoked 
  FROM refresh_tokens 
  WHERE user_id = 'user-uuid' 
  LIMIT 5;"
```

### Check Server Status
```bash
# Health check
curl http://localhost:5000/health

# Check server logs
tail -f ~/.npm/server.log
```

### Database Cleanup
```bash
# Delete expired tokens (manual cleanup)
psql -U postgres -d gigsimpact -c "DELETE FROM refresh_tokens WHERE expires_at < NOW();"

# Reset database (development only!)
psql -U postgres -d gigsimpact -c "
  TRUNCATE refresh_tokens;
  TRUNCATE users CASCADE;"
```

---

## Debugging

### View All Cookies
```bash
cat cookies.txt
```

### Decode JWT Token
```bash
# Extract access token from cookie
ACCESS_TOKEN=$(grep -oP 'access_token=\K[^ ]+' cookies.txt)

# Decode (requires jq)
echo $ACCESS_TOKEN | base64 -d

# Or use online tool: jwt.io
```

### Check Network Requests
```bash
# Add -v for verbose output
curl -X GET http://localhost:5000/api/auth/me \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -v

# Shows:
# - Request headers
# - Response headers (including Set-Cookie)
# - Response body
```

### Check Database Connection
```bash
# Test connection
psql -U postgres -d gigsimpact -c "SELECT 1;"

# Should return: 1
```

---

## Useful PostgreSQL Commands

```bash
# Connect to database
psql -U postgres -d gigsimpact

# Once connected:
\dt              # List all tables
\d users         # Describe users table
\d refresh_tokens # Describe refresh_tokens table
\x               # Toggle expanded display
SELECT * FROM users LIMIT 5;
SELECT COUNT(*) FROM refresh_tokens;
\q               # Quit
```

---

## Frontend Integration Test

### React/Axios Example
```javascript
// Test login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // IMPORTANT!
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
console.log(data); // Should show success + user data

// Test protected route
const meResponse = await fetch('http://localhost:5000/api/auth/me', {
  credentials: 'include'
});

const user = await meResponse.json();
console.log(user); // Should show user data
```

---

## Deployment Commands

### Docker Build & Run
```bash
# Build image
docker build -t gigsimpact-backend .

# Run container
docker run \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=<secret> \
  -e DB_HOST=<host> \
  -e DB_PORT=5432 \
  -e DB_NAME=gigsimpact \
  -e DB_USER=postgres \
  -e DB_PASSWORD=<password> \
  -e CLIENT_ORIGIN=https://yourdomain.com \
  gigsimpact-backend
```

### PM2 Deployment
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start index.js --name "gigsimpact-api"

# View logs
pm2 logs gigsimpact-api

# Monitor
pm2 monit

# Restart
pm2 restart gigsimpact-api

# Stop
pm2 stop gigsimpact-api

# Delete
pm2 delete gigsimpact-api
```

### Railway CLI Deployment
```bash
# Install
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

---

## Monitoring & Logging

### View Server Logs
```bash
# From npm start
tail -f server.log

# From PM2
pm2 logs gigsimpact-api --lines 100

# Specific error
pm2 logs gigsimpact-api --err
```

### Check Error Rate
```bash
# Count errors in log
grep -i error server.log | wc -l

# View recent errors
grep -i error server.log | tail -20
```

### Monitor Active Connections
```bash
# PostgreSQL connections
psql -U postgres -d gigsimpact -c "
  SELECT datname, count(*) 
  FROM pg_stat_activity 
  GROUP BY datname;"
```

---

## Cleanup & Reset

### Remove Cookies
```bash
rm cookies.txt
```

### Delete .env (if needed)
```bash
rm .env
# Then copy again: cp .env.example .env
```

### Reset Database (Development Only)
```bash
# Drop and recreate database
dropdb gigsimpact
createdb gigsimpact

# Rerun migrations
psql -U postgres -d gigsimpact -f database/migrations/001_users.sql
# ... etc for all migrations
```

### Clear node_modules (if needed)
```bash
rm -rf node_modules
npm install
```

---

## Environment-Specific Commands

### Development
```bash
NODE_ENV=development
PORT=5000
TRUST_PROXY=false
```

### Production
```bash
NODE_ENV=production
PORT=5000
TRUST_PROXY=true
# Requires HTTPS, strong JWT_SECRET, real email service
```

---

## Troubleshooting Commands

### Test Database Connection
```bash
psql -U postgres -d gigsimpact -c "SELECT 1;"
```

### Check Port Availability
```bash
# On port 5000
lsof -i :5000

# Kill process if needed
kill -9 <PID>
```

### Check Environment Variables
```bash
# View all env vars
env | grep -E "^(NODE_ENV|PORT|DB_|JWT_|CLIENT_|EMAIL_)"

# Check if .env file exists
ls -la .env

# View .env content (careful with secrets!)
cat .env
```

### Verify Installation
```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check PostgreSQL version
psql --version

# List installed packages
npm list --depth=0
```

---

## Complete Workflow Example

```bash
# 1. Setup
cd gigBackend
npm install
cp .env.example .env
# Edit .env with your credentials

# 2. Database
createdb gigsimpact
psql -U postgres -d gigsimpact -f database/migrations/001_users.sql
# ... run other migrations ...
psql -U postgres -d gigsimpact -f database/migrations/009_refresh_tokens.sql

# 3. Start server
npm start

# 4. Test registration (in another terminal)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","password":"SecurePass123!"}' \
  -c cookies.txt

# 5. Test protected route
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt

# 6. Test refresh
curl -X POST http://localhost:5000/api/auth/refresh \
  -b cookies.txt

# 7. Test logout
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

---

This is your complete command reference! 🚀

For detailed explanations, see the documentation files.
