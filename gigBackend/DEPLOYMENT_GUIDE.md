# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Security Audit
- [ ] All secrets in environment variables (not in code)
- [ ] No console.logs with sensitive data
- [ ] HTTPS/SSL configured
- [ ] CORS restricted to single domain
- [ ] Rate limiting enabled
- [ ] Helmet security headers enabled
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (HTTP-only cookies)
- [ ] CSRF protection in place

### 2. Database
- [ ] PostgreSQL running on secure host
- [ ] SSL enabled for connections
- [ ] Backups automated daily
- [ ] Connection pooling configured
- [ ] Indexes created on refresh_tokens table
- [ ] All migrations applied

### 3. Environment
- [ ] NODE_ENV=production
- [ ] JWT_SECRET is 64+ characters
- [ ] CLIENT_ORIGIN set to actual domain (no wildcards)
- [ ] Email service configured (Gmail/SendGrid)
- [ ] Database credentials strong
- [ ] All required vars in .env

### 4. Monitoring
- [ ] Error tracking (Sentry, Bugsnag)
- [ ] Uptime monitoring
- [ ] Log aggregation (ELK, Datadog)
- [ ] Performance monitoring
- [ ] Failed login alerts

### 5. Testing
- [ ] All endpoints tested
- [ ] Token refresh flow verified
- [ ] Rate limiting tested
- [ ] Error handling verified
- [ ] Database failover tested

---

## Deployment Steps

### Option 1: Railway / Render / Heroku

#### Railway.app
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Configure environment
railway env:set NODE_ENV production
railway env:set JWT_SECRET <your-secret>
railway env:set DB_HOST <pg-host>
# ... set all required vars

# Deploy
git push

# View logs
railway logs
```

#### Render.com
```yaml
# render.yaml
services:
  - type: web
    name: gigsimpact-backend
    env: node
    plan: starter
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        sync: false # Set in dashboard
      - key: DATABASE_URL
        fromDatabase:
          name: gigsimpact-db
          property: connectionString
```

### Option 2: AWS/DigitalOcean/Linode

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

```bash
# Build image
docker build -t gigsimpact-backend .

# Run container
docker run \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=<secret> \
  -e DB_HOST=<host> \
  # ... other env vars
  gigsimpact-backend
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./gigBackend
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: gigsimpact
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: gigsimpact
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Option 3: PM2 (Traditional VPS)

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'gigsimpact-api',
    script: './index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
    },
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
  }]
};

# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs gigsimpact-api

# Auto restart on reboot
pm2 startup
pm2 save
```

---

## Performance Optimization

### 1. Database Connection Pooling
```javascript
// config/db.js
const pool = new Pool({
  max: 20, // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 2. Caching Strategy
```javascript
// Cache active sessions for 5 minutes
const cache = new Map();

export const getUserActiveSessions = async (userId) => {
  const cacheKey = `sessions:${userId}`;
  const cached = cache.get(cacheKey);
  
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const sessions = await db.query(...);
  cache.set(cacheKey, {
    data: sessions,
    expires: Date.now() + 5 * 60 * 1000
  });
  
  return sessions;
};
```

### 3. Query Optimization
```javascript
// Good: Index on frequently searched columns
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

// Cleanup expired tokens daily
SELECT cron.schedule('cleanup-tokens', '0 2 * * *', $$
  DELETE FROM refresh_tokens WHERE expires_at < NOW();
$$);
```

### 4. Rate Limiting Optimization
```javascript
// Use Redis for distributed rate limiting
import RedisStore from 'rate-limit-redis';
import redis from 'redis';

const redisClient = redis.createClient();

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:', // Rate limit prefix
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

---

## Security Hardening

### 1. HTTPS/TLS
```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 2. HSTS Header
```javascript
// Already in helmet config
// Enforces HTTPS for all future requests
helmet({
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  }
});
```

### 3. DDoS Protection
```javascript
// Use Cloudflare or similar
// - Rate limiting
// - IP blocking
// - Bot detection
```

### 4. Audit Logging
```javascript
// Log all auth events
const logAuthEvent = async (userId, event, details) => {
  await db.query(
    `INSERT INTO auth_logs (user_id, event, details, timestamp)
     VALUES ($1, $2, $3, NOW())`,
    [userId, event, JSON.stringify(details)]
  );
};

// Use in auth controllers
logAuthEvent(user.id, 'LOGIN', { ip: req.ip });
logAuthEvent(user.id, 'TOKEN_REFRESH', { device: req.get('user-agent') });
```

---

## Monitoring Setup

### 1. Error Tracking (Sentry)
```bash
npm install @sentry/node
```

```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### 2. Log Aggregation (ELK Stack)
```javascript
// Send logs to Elasticsearch
const winston = require('winston');
const ElasticsearchTransport = require('winston-elasticsearch');

const logger = winston.createLogger({
  transports: [
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: process.env.ELASTICSEARCH_URL },
      index: 'gigsimpact-logs',
    }),
  ],
});
```

### 3. Performance Monitoring (DataDog)
```bash
npm install dd-trace
```

```javascript
const tracer = require('dd-trace').init();
```

### 4. Uptime Monitoring
```bash
# Use service like:
# - UptimeRobot (free)
# - PagerDuty (enterprise)
# - Datadog (all-in-one)

# Endpoint for monitoring
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});
```

---

## Backup & Disaster Recovery

### 1. Database Backups
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="gigsimpact"
DB_USER="postgres"

pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### 2. AWS S3 Backup
```javascript
const aws = require('aws-sdk');
const s3 = new aws.S3();

const backupToS3 = async () => {
  const backup = await backupDatabase();
  
  await s3.putObject({
    Bucket: 'gigsimpact-backups',
    Key: `postgres/backup_${Date.now()}.sql.gz`,
    Body: backup,
  }).promise();
};

// Schedule daily
schedule('0 2 * * *', backupToS3);
```

---

## SSL Certificate Setup

### Let's Encrypt (Free)
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Renew automatically
sudo certbot renew --quiet
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Rollback Plan

### Blue-Green Deployment
```bash
# Keep two environments: BLUE (current) and GREEN (new)

# Deploy to GREEN
git pull origin main
npm install
npm start # On separate port, e.g., 5001

# Test GREEN thoroughly
curl http://localhost:5001/health

# Switch traffic
# Update Nginx/proxy to point to port 5001

# If issues, switch back to BLUE (port 5000)
```

### Zero-Downtime Deployment with PM2
```bash
# Update code
git pull origin main

# Install dependencies
npm install --production

# Restart with zero downtime
pm2 gracefulReload gigsimpact-api

# Verify
pm2 logs gigsimpact-api
```

---

## Post-Deployment

### 1. Verify Deployment
```bash
# Health check
curl https://yourdomain.com/health

# Test login
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Check logs
pm2 logs gigsimpact-api | grep -i error
```

### 2. Monitor Metrics
- CPU usage < 70%
- Memory usage < 80%
- Database connections < 10
- Error rate < 0.1%

### 3. Security Scan
```bash
# Run security audit
npm audit

# Check dependencies for vulnerabilities
npm audit fix

# OWASP ZAP scanning
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://yourdomain.com
```

---

## Scaling Strategy

### 1. Horizontal Scaling
```javascript
// Load balance multiple instances
// Use Nginx or cloud load balancer

upstream backend {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

### 2. Database Replication
```sql
-- PostgreSQL Replication
-- Configure on primary server
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET max_wal_senders = 10;
ALTER SYSTEM SET wal_keep_segments = 64;
```

### 3. Caching Layer
```javascript
// Add Redis for token caching
import redis from 'redis';
const cache = redis.createClient();

// Cache user sessions
await cache.set(`user:${user.id}`, JSON.stringify(user), 'EX', 300);
```

---

## Cost Optimization

### Recommended Providers
1. **Database**: Railway ($30/mo) or AWS RDS
2. **Backend**: Render ($7+/mo) or Railway
3. **CDN**: Cloudflare (free tier)
4. **Email**: SendGrid (free for 100/day)
5. **Monitoring**: Sentry (free tier)

### Estimated Monthly Cost (Production)
- Database: $30-50
- Server: $10-30
- Email: $10
- Monitoring: Free-20
- **Total**: ~$60-110/month

---

## Support Contacts

- PostgreSQL Issues: https://www.postgresql.org/support/
- Node.js Help: https://nodejs.org/en/
- Express.js Docs: https://expressjs.com
- JWT Guide: https://jwt.io
- OWASP: https://owasp.org

---

*Last Updated: 2024*
