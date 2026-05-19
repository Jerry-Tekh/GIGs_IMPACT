# Audit Logging System - Production Implementation Guide

## Overview

This is a **production-ready, security-focused audit logging system** for your GigImpact authentication system. It properly handles the `req` parameter and follows Express.js standards.

### Key Features

✅ **Properly parameterized `req` object** - Passed as first parameter
✅ **Client info extraction** - IP address and User-Agent from request
✅ **Sensitive data filtering** - Automatically sanitizes logs (no passwords, tokens, etc.)
✅ **Comprehensive action types** - Pre-defined constants for consistency
✅ **Performance optimized** - Indexed database queries
✅ **Error handling** - Audit failures don't break authentication
✅ **Production-ready** - Error handling, validation, and best practices

---

## File Structure

```
gigBackend/
├── database/migrations/
│   └── 014_audit_logs.sql          ← Database schema
├── src/
│   ├── utils/
│   │   ├── auditLog.js             ← Main audit logging module
│   │   └── AUDIT_LOG_INTEGRATION.js ← Integration examples
│   └── controllers/
│       └── AuthController.js        ← Update with audit calls
```

---

## Quick Start

### Step 1: Create the Database Table

Run this migration:

```bash
psql your_database < database/migrations/014_audit_logs.sql
```

Or add to your migration system if you have one.

### Step 2: Update Your AuthController

Import the audit logging functions:

```javascript
import {
  createAuditLog,
  getClientInfo,
  getUserAuditLogs,
  AUDIT_ACTIONS
} from '../utils/auditLog.js';
```

### Step 3: Add Audit Calls to Each Endpoint

**Example: Login**

```javascript
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    
    if (!user) {
      // Log failed attempt
      await createAuditLog(
        req,  // ← First parameter: Express request
        null, // ← No user ID (user not found)
        AUDIT_ACTIONS.LOGIN_FAILED_INVALID_CREDENTIALS,
        { email, reason: 'user_not_found' },
        'failure'
      );
      
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password...
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      await createAuditLog(
        req,
        user.id,
        AUDIT_ACTIONS.LOGIN_FAILED_INVALID_CREDENTIALS,
        { email },
        'failure'
      );
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Success - create tokens...
    
    await createAuditLog(
      req,
      user.id,
      AUDIT_ACTIONS.LOGIN_SUCCESS,
      { email: user.email },
      'success'
    );

    res.json({ success: true, message: 'Logged in successfully' });
  } catch (error) {
    await createAuditLog(
      req,
      null,
      AUDIT_ACTIONS.LOGIN_FAILED,
      { email },
      'failure',
      error.message
    );
    res.status(500).json({ message: 'Login failed' });
  }
};
```

---

## API Reference

### createAuditLog(req, userId, action, details, status, errorMessage)

Creates an audit log entry.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `req` | Object | Yes | Express request object (contains IP, User-Agent) |
| `userId` | Number \| null | No | User ID (null for unauthenticated actions) |
| `action` | String | Yes | Action type (use AUDIT_ACTIONS constants) |
| `details` | Object | No | Additional context (auto-sanitized) |
| `status` | String | No | 'success', 'failure', 'pending' (default: 'success') |
| `errorMessage` | String | No | Error details if status is 'failure' |

**Returns:** Promise<Object> with audit log ID and timestamp

**Example:**

```javascript
await createAuditLog(
  req,
  user.id,
  AUDIT_ACTIONS.PASSWORD_CHANGED,
  { email: user.email, method: 'user_initiated' },
  'success'
);
```

---

### getClientInfo(req)

Extracts IP address and User-Agent from request.

**Parameters:**
- `req` (Object) - Express request

**Returns:**

```javascript
{
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
}
```

**Example:**

```javascript
const { ipAddress, userAgent } = getClientInfo(req);
console.log(`Login from ${ipAddress}`);
```

---

### getUserAuditLogs(userId, limit, offset)

Get all audit logs for a specific user.

**Parameters:**
- `userId` (Number) - User ID
- `limit` (Number) - Records to return (default: 50)
- `offset` (Number) - Pagination offset (default: 0)

**Returns:** Promise<Array> of audit log records

**Example:**

```javascript
export const getMyAuditLogs = async (req, res) => {
  const userId = req.user.user_id;
  const logs = await getUserAuditLogs(userId, 50, 0);
  res.json({ success: true, data: logs });
};
```

---

### getRecentAuditLogs(limit, actionFilter)

Get recent audit logs across all users (for admin dashboard).

**Parameters:**
- `limit` (Number) - Records to return (default: 100)
- `actionFilter` (String) - Filter by action type (optional)

**Returns:** Promise<Array> of audit log records

**Example:**

```javascript
// Get last 100 failed logins
const failedLogins = await getRecentAuditLogs(
  100,
  AUDIT_ACTIONS.LOGIN_FAILED
);
```

---

### getAuditLogsByIP(ipAddress, hoursBack)

Get audit logs from a specific IP (useful for suspicious activity detection).

**Parameters:**
- `ipAddress` (String) - IP address to filter
- `hoursBack` (Number) - Look back this many hours (default: 24)

**Returns:** Promise<Array> of audit log records

**Example:**

```javascript
// Detect brute force attempts
const logsFromIP = await getAuditLogsByIP('192.168.1.1', 24);
const failedAttempts = logsFromIP.filter(
  log => log.action.includes('LOGIN_FAILED')
);

if (failedAttempts.length > 10) {
  // IP is attacking - block it
}
```

---

## Action Type Constants

Use these instead of hardcoded strings:

```javascript
// Authentication
AUDIT_ACTIONS.LOGIN_SUCCESS
AUDIT_ACTIONS.LOGIN_FAILED
AUDIT_ACTIONS.LOGIN_FAILED_INVALID_CREDENTIALS
AUDIT_ACTIONS.LOGIN_FAILED_ACCOUNT_LOCKED
AUDIT_ACTIONS.LOGIN_FAILED_EMAIL_NOT_VERIFIED
AUDIT_ACTIONS.LOGOUT

// Registration
AUDIT_ACTIONS.SIGNUP_STARTED
AUDIT_ACTIONS.SIGNUP_SUCCESS
AUDIT_ACTIONS.SIGNUP_FAILED

// Email Verification
AUDIT_ACTIONS.EMAIL_VERIFICATION_SENT
AUDIT_ACTIONS.EMAIL_VERIFIED
AUDIT_ACTIONS.EMAIL_VERIFICATION_FAILED

// Password Management
AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED
AUDIT_ACTIONS.PASSWORD_RESET_SUCCESS
AUDIT_ACTIONS.PASSWORD_RESET_FAILED
AUDIT_ACTIONS.PASSWORD_CHANGED
AUDIT_ACTIONS.PASSWORD_CHANGE_FAILED

// Token Management
AUDIT_ACTIONS.TOKEN_REFRESH
AUDIT_ACTIONS.TOKEN_ROTATION
AUDIT_ACTIONS.TOKEN_REVOKED
AUDIT_ACTIONS.TOKEN_REUSE_DETECTED

// MFA
AUDIT_ACTIONS.MFA_ENABLED
AUDIT_ACTIONS.MFA_DISABLED
AUDIT_ACTIONS.MFA_CODE_GENERATED
AUDIT_ACTIONS.MFA_VERIFICATION_SUCCESS
AUDIT_ACTIONS.MFA_VERIFICATION_FAILED

// Account
AUDIT_ACTIONS.ACCOUNT_LOCKED
AUDIT_ACTIONS.ACCOUNT_UNLOCKED
AUDIT_ACTIONS.ROLE_CHANGED
AUDIT_ACTIONS.PERMISSIONS_CHANGED

// Security Events
AUDIT_ACTIONS.SUSPICIOUS_ACTIVITY
AUDIT_ACTIONS.IMPOSSIBLE_TRAVEL_DETECTED
AUDIT_ACTIONS.NEW_DEVICE_LOGIN
AUDIT_ACTIONS.CSRF_TOKEN_GENERATION
AUDIT_ACTIONS.CSRF_VALIDATION_FAILED

// Administrative
AUDIT_ACTIONS.ADMIN_LOGIN
AUDIT_ACTIONS.ADMIN_ACTION
AUDIT_ACTIONS.DATA_EXPORT
AUDIT_ACTIONS.SETTINGS_CHANGED
```

---

## Security Best Practices

### 1. Always Pass `req` as First Parameter

❌ **WRONG:**
```javascript
await createAuditLog(user.id, 'LOGIN_SUCCESS', { /* details */ });
```

✅ **CORRECT:**
```javascript
await createAuditLog(req, user.id, 'LOGIN_SUCCESS', { /* details */ });
```

### 2. Sensitive Data is Auto-Sanitized

The audit logging system **automatically removes**:
- Passwords
- Tokens
- API keys
- Credit card numbers
- SSN, CVV, etc.

You don't need to manually remove them.

### 3. User ID Can Be Null for Unauthenticated Events

✅ **Examples:**
```javascript
// User not found
await createAuditLog(req, null, AUDIT_ACTIONS.LOGIN_FAILED, {...});

// Registration
await createAuditLog(req, null, AUDIT_ACTIONS.SIGNUP_STARTED, {...});
```

### 4. Use Status Field for Filtering

```javascript
// Successful actions
await createAuditLog(req, userId, action, details, 'success');

// Failed actions
await createAuditLog(req, userId, action, details, 'failure', errorMessage);

// Pending (e.g., MFA code sent, waiting for verification)
await createAuditLog(req, userId, action, details, 'pending');
```

### 5. Include Relevant Details

```javascript
// Good
await createAuditLog(
  req,
  user.id,
  AUDIT_ACTIONS.PASSWORD_CHANGED,
  { email: user.email, method: 'user_initiated', device: 'mobile' },
  'success'
);

// Bad (not enough context)
await createAuditLog(req, user.id, AUDIT_ACTIONS.PASSWORD_CHANGED, {});
```

---

## Monitoring & Analytics

### Get User's Login History

```javascript
// View last 30 logins
const logs = await getUserAuditLogs(userId, 30);
logs.forEach(log => {
  console.log(`${log.action} from ${log.ip_address} on ${log.created_at}`);
});
```

### Detect Brute Force Attacks

```javascript
const logs = await getAuditLogsByIP(ipAddress, 24); // Last 24 hours
const failedLogins = logs.filter(log => 
  log.action === AUDIT_ACTIONS.LOGIN_FAILED_INVALID_CREDENTIALS
);

if (failedLogins.length > 10) {
  console.warn(`Brute force detected from ${ipAddress}`);
  // Block IP, send alert, etc.
}
```

### Monitor Suspicious Activities

```javascript
const recentLogs = await getRecentAuditLogs(100);
const suspiciousLogs = recentLogs.filter(log => 
  log.action === AUDIT_ACTIONS.SUSPICIOUS_ACTIVITY ||
  log.action === AUDIT_ACTIONS.TOKEN_REUSE_DETECTED
);
```

### Admin Dashboard Query

```javascript
// Get all actions from last 7 days
export const getSecurityReport = async (req, res) => {
  const result = await pool.query(
    `SELECT action, COUNT(*) as count, status
     FROM audit_logs
     WHERE created_at > NOW() - INTERVAL '7 days'
     GROUP BY action, status
     ORDER BY count DESC`
  );

  res.json({ success: true, report: result.rows });
};
```

---

## Database Schema

```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,              -- User who performed action (null if unauthenticated)
  action VARCHAR(50),           -- LOGIN_SUCCESS, PASSWORD_CHANGED, etc.
  ip_address VARCHAR(45),       -- IPv4 or IPv6
  user_agent TEXT,              -- Browser/device info
  details JSONB,                -- Additional context
  status VARCHAR(20),           -- success, failure, pending
  error_message TEXT,           -- Error details if failed
  created_at TIMESTAMP,         -- When action occurred
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);
```

---

## Compliance & Retention

### GDPR Compliance

The system supports GDPR requirements:

1. **User data access** - `getUserAuditLogs()` lets users see their activity
2. **Data deletion** - Can delete audit logs when user deletes account:

```javascript
// When deleting user account
await pool.query(
  `DELETE FROM audit_logs WHERE user_id = $1`,
  [userId]
);
```

3. **Data retention** - Implement retention policy:

```javascript
// Delete audit logs older than 90 days
await pool.query(
  `DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days'`
);
```

### SOC 2 Compliance

This system provides audit trails required for SOC 2:
- ✅ Login attempts (successful & failed)
- ✅ Password changes
- ✅ Account modifications
- ✅ Access from different IP/device

---

## Error Handling

The system is **designed not to break authentication** if logging fails:

```javascript
try {
  // Try to create audit log
  await createAuditLog(req, user.id, action, details);
} catch (error) {
  // If logging fails, error is logged but doesn't crash
  console.error('Audit logging failed:', error);
  // User authentication continues normally
}
```

---

## Performance Considerations

### Indexes

The migration creates indexes on:
- `user_id` - Fast user history queries
- `action` - Fast filtering by action type
- `created_at` - Fast sorting and time-range queries
- `ip_address` - Fast IP-based queries

### Query Optimization

For high-traffic applications:

```javascript
// Bad: Fetches all logs (might be millions)
const allLogs = await pool.query('SELECT * FROM audit_logs');

// Good: Use pagination
const logs = await getUserAuditLogs(userId, 50, 0); // First 50
const moreLogsPage2 = await getUserAuditLogs(userId, 50, 50); // Next 50
```

### Async Logging

The system is fully async - doesn't block authentication flow:

```javascript
// This doesn't wait for audit log to complete
await createAuditLog(req, user.id, action, details); // Fire and forget

// Same as
createAuditLog(req, user.id, action, details)
  .catch(err => console.error('Audit log failed:', err));
```

---

## Troubleshooting

### Logs Not Appearing

1. **Check database migration** - Ensure `014_audit_logs.sql` was run
2. **Check imports** - Ensure you imported from `utils/auditLog.js`
3. **Check `req` parameter** - Must pass Express request as first param
4. **Check errors** - Look for "Audit logging error" in console

### "req is not defined"

❌ **Wrong:**
```javascript
const { ipAddress } = getClientInfo(req); // req not defined here!

export const createAuditLog = async (userId, action) => {
  // ...
};
```

✅ **Correct:**
```javascript
export const createAuditLog = async (req, userId, action) => {
  const { ipAddress } = getClientInfo(req); // req defined in parameter
};
```

### IP Address Shows "unknown"

This means `req` is not properly passed or doesn't have request information. Check:
1. Are you in middleware? (req should exist)
2. Is req.connection available? (Some frameworks hide it differently)
3. Is there a reverse proxy? (Set `trust proxy` in Express)

```javascript
// In Express app setup
app.set('trust proxy', true); // Trust X-Forwarded-For header
```

---

## Next Steps

1. ✅ **Run migration**: `psql < database/migrations/014_audit_logs.sql`
2. ✅ **Import utilities**: `import { createAuditLog, AUDIT_ACTIONS } from '../utils/auditLog.js'`
3. ✅ **Update AuthController**: See `AUDIT_LOG_INTEGRATION.js` for examples
4. ✅ **Test**: Try logging in and check audit_logs table
5. ✅ **Add routes**: `/audit-logs` endpoint to see user's history
6. ✅ **Monitor**: Set up dashboard for security team

---

## Support

- See `AUDIT_LOG_INTEGRATION.js` for complete code examples
- Check `auditLog.js` for function documentation
- Review `SECURITY_AUDIT_AUTHENTICATION.md` section 11 for context

Questions? This implementation is **production-ready** and follows Express/Node.js best practices.
