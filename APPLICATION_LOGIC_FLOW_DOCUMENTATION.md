# Application Logic Flow Documentation
## Understanding apiClient.js, auth.js, csrf.js & dashboardNavigation.js

**Last Updated:** April 29, 2026  
**Application:** GigImpact (Frontend)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Detailed File Breakdown](#detailed-file-breakdown)
4. [Complete Request Lifecycles](#complete-request-lifecycles)
5. [Security Patterns](#security-patterns)
6. [Key Concepts](#key-concepts)
7. [Quick Reference](#quick-reference)

---

## Executive Summary

Your application uses a **layered architecture** for handling HTTP requests, authentication, and CSRF security:

| Layer | File | Purpose |
|-------|------|---------|
| **Security** | `csrf.js` | CSRF token management and caching |
| **HTTP Communication** | `apiClient.js` | All API requests, auth refresh, CSRF integration |
| **Authentication** | `auth.js` | User login/logout, role-based routing, auth events |
| **Navigation** | `dashboardNavigation.js` | Role-based sidebar/menu structure |

**Key Pattern:** Each layer builds on the previous one, creating a clean separation of concerns.

---

## Architecture Overview

```
User Components
    ↓
┌─────────────────────────────────────────┐
│  dashboardNavigation.js                 │  (Determines which routes to show)
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  auth.js                                │  (Login, logout, get user, route)
│  - fetchCurrentUser()                   │
│  - logoutUser()                         │
│  - getDashboardPath()                   │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  apiClient.js                           │  (HTTP requests, token refresh)
│  - apiFetch()                           │
│  - createRequestOptions()               │
│  - refreshAccessToken()                 │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  csrf.js                                │  (CSRF token caching & fetching)
│  - fetchCsrfToken()                     │
│  - setCsrfToken()                       │
│  - getCachedCsrfToken()                 │
└─────────────────────────────────────────┘
    ↓
    Backend API Server
```

---

## Detailed File Breakdown

### 1. CSRF Security Layer (csrf.js) 🔒

**Purpose:** Manages Cross-Site Request Forgery (CSRF) tokens to prevent unauthorized API requests.

**How it works:**

```javascript
const csrfTokenCache = '';      // In-memory storage (cleared on logout)
const csrfPromise = null;       // Prevents duplicate requests
```

**Key Functions:**

#### `fetchCsrfToken({ force = false })`
- **What it does:** Gets CSRF token for state-changing requests
- **Returns:** String (CSRF token)
- **Smart caching:**
  - First call: Fetches from `/api/auth/csrf-token`
  - Subsequent calls: Returns cached token instantly
  - `force: true` bypasses cache and fetches fresh token
  - `csrfPromise` prevents multiple simultaneous requests

**Flow:**
```
fetchCsrfToken()
  ↓
  Check cache (csrfTokenCache)
  ↓
  If empty:
    - Create promise if not exists
    - fetch('/api/auth/csrf-token')
    - Parse response
    - Cache token
    - Return token
  ↓
  If exists:
    - Return cached token instantly
```

#### `setCsrfToken(token)`
- Manually sets token in cache
- Used rarely (mostly auto-managed)

#### `clearCsrfToken()`
- Clears cache
- Called on logout to prevent token reuse

#### `getCachedCsrfToken()`
- Returns current cached token without fetching
- Used for debugging/verification

**Security Feature:** The cache prevents token exposure in URLs while still enabling efficient request signing.

---

### 2. HTTP Client Layer (apiClient.js) 🌐

**Purpose:** Central hub for ALL HTTP communication. Handles CSRF, authentication, and token refresh automatically.

**Architecture:** Three-layer request processing

#### Layer 1: Request Building (`createRequestOptions`)

```javascript
const createRequestOptions = async (options = {}) => {
  const method = (fetchOptions.method || 'GET').toUpperCase();
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers
  };

  // For state-changing requests (POST, PUT, PATCH, DELETE)
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = await fetchCsrfToken();
    headers['X-CSRF-Token'] = csrfToken;
  }

  return {
    credentials: 'include',  // Send cookies (auth tokens)
    headers,
    ...fetchOptions
  };
};
```

**What happens:**
1. Normalizes HTTP method to uppercase
2. Creates base headers with Content-Type
3. Detects state-changing methods (POST/PUT/PATCH/DELETE)
4. Automatically fetches & adds CSRF token
5. Includes credentials flag (sends auth cookies)

**Important:** The `credentials: 'include'` flag ensures httpOnly cookies with refresh tokens are automatically sent with every request.

#### Layer 2: Response Handling (`parseResponse`)

```javascript
const parseResponse = async (response) => {
  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(payload?.message || 'Request failed');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};
```

**What happens:**
1. Parses response JSON
2. Checks response.ok status
3. If error (4xx/5xx): Creates Error object with status & payload
4. If success (2xx): Returns parsed data

#### Layer 3: Auto Token Refresh (`refreshAccessToken` & `apiFetch`)

**The Problem:** Access tokens expire (typically after 15 minutes).  
**The Solution:** Automatically refresh using refresh tokens stored in httpOnly cookies.

```javascript
const shouldAttemptRefresh = (path, options, response) => {
  // Only refresh if:
  // 1. Status is 401 (Unauthorized)
  // 2. User didn't explicitly skip refresh
  // 3. Request isn't already a refresh attempt
  return response.status === 401 && 
         !options.skipAuthRefresh && 
         path !== '/api/auth/refresh';
};

const refreshAccessToken = async () => {
  // refreshPromise prevents multiple simultaneous refreshes
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await request('/api/auth/refresh', {
        method: 'POST',
        skipAuthRefresh: true  // Prevent infinite loops
      });
      return parseResponse(response);
    })().finally(() => {
      refreshPromise = null;  // Clear after completion
    });
  }

  return refreshPromise;
};
```

**Main Function: `apiFetch(path, options)`**

```javascript
export const apiFetch = async (path, options = {}) => {
  // Step 1: Make request
  let response = await request(path, options);

  // Step 2: Check if token expired
  if (shouldAttemptRefresh(path, options, response)) {
    try {
      // Step 3: Refresh token (only once, due to refreshPromise)
      await refreshAccessToken();
      
      // Step 4: Retry original request with new token
      response = await request(path, options);
    } catch (_error) {
      // If refresh fails, let original 401 error surface
      // User will be redirected to login
    }
  }

  // Step 5: Parse and return response
  return parseResponse(response);
};
```

**Flow Chart:**

```
apiFetch('/api/posts', { method: 'POST', body: {...} })
  ↓
  createRequestOptions() - Add CSRF token
  ↓
  fetch('/api/posts', { POST, CSRF header, auth cookie })
  ↓
  Backend processes request
  ↓
  ┌─ Response 200/201/204 (Success)
  │  ↓
  │  parseResponse() - Return data
  │
  ├─ Response 401 (Token expired)
  │  ↓
  │  shouldAttemptRefresh() check
  │  ↓
  │  refreshAccessToken() - POST /api/auth/refresh
  │  ↓
  │  New token in httpOnly cookie
  │  ↓
  │  RETRY: fetch('/api/posts', { same request + new token })
  │  ↓
  │  parseResponse() - Return data
  │
  └─ Response 400/403/500 (Error)
     ↓
     parseResponse() - Throw error with details
```

**Critical Pattern: The `refreshPromise` Deduplication**

Imagine 5 requests fail with 401 simultaneously:

```
Request 1 fails with 401
  ↓ refreshPromise = undefined, create new promise
  ↓ Set refreshPromise to pending promise
  ↓ Send POST /api/auth/refresh

Request 2 fails with 401
  ↓ refreshPromise already exists
  ↓ WAIT for existing promise (don't send another refresh)

Request 3-5 fail with 401
  ↓ All WAIT for same refreshPromise

POST /api/auth/refresh completes
  ↓ All 5 requests retry simultaneously with new token
  ↓ refreshPromise = null (cleared)
```

**Why this matters:** Prevents 5 refresh requests to server (bad) instead of 1 (good).

---

### 3. Authentication Utilities (auth.js) 👤

**Purpose:** High-level authentication functions that use apiClient.js under the hood.

**Key Functions:**

#### `normalizeAuthUser(payload)`
- Handles different response formats from backend
- Extracts user data from `payload.data` or `payload.user` or uses payload directly
- Returns normalized user object

**Example:**
```javascript
normalizeAuthUser({ data: { id: 1, email: 'user@example.com' } })
// Returns: { id: 1, email: 'user@example.com' }
```

#### `notifyAuthChanged()`
- Dispatches a custom event: `AUTH_STATE_EVENT` ('gigimpact:auth-changed')
- Allows all components to listen and react to auth changes

**How components use it:**
```javascript
window.addEventListener('gigimpact:auth-changed', () => {
  // Refresh user data
  // Update sidebar
  // Redirect if needed
});
```

#### `fetchCurrentUser()`
- Gets logged-in user's data
- **Endpoint:** `GET /api/auth/me`
- **Process:**
  ```
  apiFetch('/api/auth/me')  // Via apiClient.js
    ↓
  Backend queries current user from session
    ↓
  Returns user: { id, email, role, name, ... }
    ↓
  normalizeAuthUser() processes response
    ↓
  Component receives user object
  ```

#### `logoutUser()`
- Ends user session
- **Process:**
  ```
  apiFetch('/api/auth/logout', { POST, skipAuthRefresh: true })
    ↓
  Backend:
    - Invalidates refresh token
    - Clears session
    - Deletes auth cookies
  ↓
  clearCsrfToken()  // Clear client-side CSRF cache
    ↓
  notifyAuthChanged()  // Tell all components user logged out
    ↓
  Components can redirect to /login
  ```

**Note:** `skipAuthRefresh: true` prevents attempting to refresh if logout request fails.

#### `getDashboardPath(role)`
- Maps user role to dashboard route
- Used for navigation after login

**Mapping:**
```javascript
'admin'   → '/admin/dashboard'
'author'  → '/author/dashboard'
'reader'  → '/reader/dashboard'
default   → '/login'
```

---

### 4. Navigation Structure (dashboardNavigation.js) 🗺️

**Purpose:** Provides role-based navigation items (sidebar/menu) for each user type.

#### `getNavigationForRole(role)`
- Returns array of navigation items for given role
- Each item has: `to` (route), `label` (text), `icon` (React icon component)

**Admin Navigation:**
```
├─ Dashboard        → /admin/dashboard
├─ Create Post      → /admin/createPost
├─ Manage Posts     → /admin/posts
└─ Manage Users     → /admin/users
```

**Author Navigation:**
```
├─ Dashboard        → /author/dashboard
├─ Create Post      → /author/createPost
└─ My Posts         → /author/posts
```

**Reader Navigation:**
```
├─ Dashboard        → /reader/dashboard
└─ Reading History  → /reader/dashboard#reading-history
```

**How it's used in components:**
```javascript
import { getNavigationForRole } from '../utils/dashboardNavigation';

function Sidebar({ userRole }) {
  const navItems = getNavigationForRole(userRole);
  
  return (
    <nav>
      {navItems.map(item => (
        <Link key={item.to} to={item.to}>
          <item.icon /> {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

---

## Complete Request Lifecycles

### Scenario 1: User Logs In

```
1. User enters credentials on /login page
2. Form submits to POST /api/auth/login

3. apiClient.js:
   ├─ createRequestOptions()
   ├─ Detects POST method
   ├─ Calls fetchCsrfToken() → caches token
   ├─ Adds X-CSRF-Token header
   └─ Sends with credentials: 'include'

4. Backend validates:
   ├─ CSRF token matches
   ├─ Email & password correct
   └─ Creates refresh token (stored in httpOnly cookie)

5. Backend returns:
   {
     data: {
       id: 123,
       email: 'user@example.com',
       role: 'author',
       name: 'John'
     }
   }

6. apiFetch() parses response → returns user object

7. normalizeAuthUser() extracts user data

8. getDashboardPath('author') → '/author/dashboard'

9. Component redirects to /author/dashboard

10. notifyAuthChanged() fires
    └─ All listening components update

11. getNavigationForRole('author') generates sidebar menu
    with: Dashboard, Create Post, My Posts
```

---

### Scenario 2: Making an Authenticated Request (Create Post)

```
1. User clicks "Create Post" button on /author/createPost

2. Form submits with data:
   {
     title: "Climate Action",
     content: "How to reduce carbon...",
     category: "Environment"
   }

3. Component calls:
   apiFetch('/api/posts', {
     method: 'POST',
     body: JSON.stringify(postData)
   })

4. apiClient.js - createRequestOptions():
   ├─ Recognizes method = 'POST'
   ├─ Calls fetchCsrfToken()
   │  └─ Returns cached token (no network call)
   ├─ Adds headers:
   │  ├─ Content-Type: application/json
   │  └─ X-CSRF-Token: abc123xyz...
   └─ Sets credentials: 'include'

5. fetch() sends request:
   POST /api/posts HTTP/1.1
   Host: backend.example.com
   Content-Type: application/json
   X-CSRF-Token: abc123xyz...
   Cookie: refreshToken=...; (auto-included by credentials)
   
   { title: "...", content: "...", ... }

6. Backend:
   ├─ Validates CSRF token ✓
   ├─ Validates refresh token in cookie ✓
   ├─ Creates post in database ✓
   └─ Returns 201 Created

7. apiClient.js - parseResponse():
   ├─ Parses JSON response
   ├─ Checks response.ok === true ✓
   └─ Returns parsed data

8. Component receives:
   {
     id: 456,
     title: "Climate Action",
     authorId: 123,
     createdAt: "2026-04-29T..."
   }

9. Component:
   ├─ Shows success message
   ├─ Redirects to /author/posts
   └─ Displays new post in list
```

---

### Scenario 3: Token Expires During Request

```
Timeline:
- User logged in 20 minutes ago
- Access token (15 min TTL) expired 5 minutes ago
- User is now making a request

─────────────────────────────────────────────

1. User clicks "Add Donation" on reader dashboard

2. Component calls:
   apiFetch('/api/donations', {
     method: 'POST',
     body: JSON.stringify({ amount: 100 })
   })

3. apiClient.js builds request:
   ├─ Adds CSRF token (cached)
   ├─ Adds auth cookie (contains expired access token)
   └─ Sends request

4. Backend checks token:
   ├─ Token has expired
   └─ Returns 401 Unauthorized

5. apiClient.js - shouldAttemptRefresh():
   ├─ Check: response.status === 401? YES ✓
   ├─ Check: skipAuthRefresh set? NO ✓
   ├─ Check: path === '/api/auth/refresh'? NO ✓
   └─ Result: TRUE, attempt refresh

6. apiClient.js - refreshAccessToken():
   ├─ Check: refreshPromise exists? NO
   ├─ Create new promise
   ├─ Send: POST /api/auth/refresh
   │  ├─ Method: POST
   │  ├─ skipAuthRefresh: true (prevent infinite loops)
   │  └─ Cookie: refreshToken (auto-included)
   │
   └─ Wait for response

7. Backend processes refresh request:
   ├─ Validates refresh token from cookie ✓
   ├─ Creates new access token
   ├─ Returns it in httpOnly cookie
   └─ Returns 200 OK

8. refreshAccessToken() resolves

9. apiFetch() RETRIES original request:
   POST /api/donations
   ├─ New access token in cookie (from step 7)
   ├─ CSRF token (re-fetched if needed)
   └─ Original body: { amount: 100 }

10. Backend processes with new token:
    ├─ Token valid ✓
    ├─ Creates donation record
    └─ Returns 201 Created

11. apiFetch() parseResponse():
    └─ Returns donation data to component

12. User sees success message
    (Never knew token expired!)

13. Component may call notifyAuthChanged()
    to ensure UI is up-to-date
```

**Diagram:**

```
Request Timeline:
─────────────────────────────────────────────────

T=0ms   POST /api/donations (expires token)
         ↓ 401 Unauthorized
         ↓
T=50ms  POST /api/auth/refresh (with refresh token)
         ↓ 200 OK (new access token)
         ↓
T=100ms POST /api/donations (retried with new token)
         ↓ 201 Created
         ↓
T=150ms Component receives data

Total time: ~150ms (imperceptible to user)
```

---

### Scenario 4: User Logs Out

```
1. User clicks "Logout" button

2. Component calls:
   logoutUser()

3. auth.js calls:
   apiFetch('/api/auth/logout', {
     method: 'POST',
     skipAuthRefresh: true
   })

4. apiClient.js:
   ├─ createRequestOptions()
   ├─ Adds CSRF token
   ├─ Includes auth cookies
   └─ Sends request

5. Backend:
   ├─ Invalidates refresh token in database
   ├─ Clears session
   ├─ Sends Set-Cookie headers to delete cookies
   └─ Returns 200 OK

6. auth.js continues:
   ├─ Calls clearCsrfToken()
   │  └─ Clears cached token
   ├─ Calls notifyAuthChanged()
   │  └─ Dispatches AUTH_STATE_EVENT
   └─ Returns

7. All components listening to AUTH_STATE_EVENT:
   ├─ Reset user data to null
   ├─ Clear cached data
   ├─ Redirect to /login
   └─ Hide protected routes

8. Browser state:
   ├─ Cookies deleted
   ├─ CSRF cache cleared
   ├─ User is fully logged out
   └─ Cannot make authenticated requests
```

---

## Security Patterns

### 1. CSRF Token Protection

**Problem:** Attacker tricks user into making unauthorized requests from another site.

**Solution:**
- Backend generates unique token for each session
- Token must be included in `X-CSRF-Token` header for state-changing requests
- Backend validates token before processing POST/PUT/PATCH/DELETE
- Token cached on frontend (csrf.js) to prevent duplication

**Tokens for:**
- Creating posts
- Updating profiles
- Deleting comments
- etc.

**NOT for:**
- GET requests (read-only, no state change)

---

### 2. Refresh Token Rotation

**Problem:** If access token leaked, attacker has limited time (15 min) before it expires.

**Solution:**
- Refresh token stored in httpOnly cookie (not accessible to JavaScript)
- Only sent over HTTPS
- Only sent to backend API
- Backend can revoke it at any time
- New refresh token issued on each refresh

**Flow:**
```
Login
  → Access Token (15 min TTL) returned in memory
  → Refresh Token (7 days TTL) in httpOnly cookie

After 15 min:
  → Access token expires
  → POST /api/auth/refresh sent (with refresh token cookie)
  → Backend issues new Access Token
  → Old Refresh Token revoked, new one issued
  → Process repeats
```

---

### 3. Automatic Token Refresh

**Problem:** User experience is poor if request fails and user must log in again.

**Solution:** apiClient.js automatically retries failed requests after refreshing token.

**Conditions for refresh attempt:**
- Response status is 401
- Request path is NOT `/api/auth/refresh` (prevent loops)
- `skipAuthRefresh` option NOT set to true

**Deduplication:**
- Multiple simultaneous 401s only trigger ONE refresh
- Other requests wait for that refresh to complete
- Prevents race conditions and multiple token refreshes

---

### 4. Secure Cookie Handling

**httpOnly Cookies:**
```javascript
// Frontend can't access these:
// document.cookie won't include refresh token
// JavaScript can't steal it
// Sent automatically with credentials: 'include'
```

**Secure Flag:**
```javascript
// Cookies only sent over HTTPS
// Prevents interception on unencrypted connections
```

**SameSite Flag:**
```javascript
// Cookies only sent from same origin
// Prevents CSRF attacks from other domains
```

---

### 5. Error Handling

**Graceful degradation:**
```javascript
// If refresh fails:
if (shouldAttemptRefresh(...)) {
  try {
    await refreshAccessToken();
    response = await request(path, options);
  } catch (_error) {
    // Don't throw, let original 401 surface
    // Component will redirect to /login
  }
}

return parseResponse(response);  // Throws original 401
```

---

## Key Concepts

### What is CSRF?

**Cross-Site Request Forgery (CSRF)**

Attacker tricks you into unknowingly making requests from their website:

```
1. You visit attacker.com while logged into bank.com
2. attacker.com secretly sends:
   POST bank.com/api/transfer { amount: 10000, to: attacker }
3. Browser automatically includes bank.com cookies
4. Bank sees request from you (by cookies) and transfers money
5. You're hacked!

Solution: CSRF tokens
- Each request must include a unique token
- Token not in cookies, in header or body
- Attacker can't read cross-origin token (CORS blocks it)
- Request fails without token
```

---

### What is Token Refresh?

**Access Token:** Short-lived (15 min), used for API requests

**Refresh Token:** Long-lived (7 days), used ONLY to get new access token

```
Normal flow:
1. Login → get access token + refresh token
2. Use access token for requests (15 min)
3. Token expires after 15 min
4. Send refresh token → get new access token
5. Continue using API with new token
6. Refresh token rotated (old one revoked)
```

**Why two tokens?**
- If access token leaked, damage is limited to 15 min
- Refresh token stays secure in httpOnly cookie
- User doesn't need to re-login for 7 days

---

### What is the `credentials: 'include'` Flag?

```javascript
// Without:
fetch('/api/posts')
// httpOnly cookies NOT sent
// Request fails authentication

// With credentials: 'include':
fetch('/api/posts', { credentials: 'include' })
// httpOnly cookies ARE sent
// Request succeeds authentication
```

**Required for:**
- Sending refresh tokens
- Sending session cookies
- Cross-origin requests to same API

---

### Why Use Event Dispatching for Auth Changes?

```javascript
// Without:
// Each component needs to manage auth state separately
// Logout in one component doesn't update others
// UI inconsistencies

// With notifyAuthChanged():
window.addEventListener('gigimpact:auth-changed', () => {
  // Called in ALL components simultaneously
  // Logout updates navbar, sidebar, guards, etc.
  // UI always consistent
});
```

---

## Quick Reference

### Import All Utilities

```javascript
import { apiFetch } from './utils/apiClient';
import { 
  fetchCurrentUser, 
  logoutUser, 
  getDashboardPath,
  notifyAuthChanged 
} from './utils/auth';
import { fetchCsrfToken } from './utils/csrf';
import { getNavigationForRole } from './utils/dashboardNavigation';
```

### Common Patterns

**Fetch user data:**
```javascript
const user = await fetchCurrentUser();
// Returns: { id, email, role, name, ... }
```

**Make POST request:**
```javascript
const post = await apiFetch('/api/posts', {
  method: 'POST',
  body: JSON.stringify({ title, content })
});
// CSRF token automatically added
// Auth cookie automatically included
```

**Handle auth changes:**
```javascript
window.addEventListener('gigimpact:auth-changed', () => {
  // Refresh user data
  const user = await fetchCurrentUser();
  // Update UI
});
```

**Get dashboard for user:**
```javascript
const dashboard = getDashboardPath(user.role);
// Returns: '/admin/dashboard' or '/author/dashboard' or '/reader/dashboard'
```

**Show role-based navigation:**
```javascript
const items = getNavigationForRole(user.role);
// items = [ { to, label, icon }, ... ]
```

---

### Error Handling

**Network errors:**
```javascript
try {
  const data = await apiFetch('/api/posts');
} catch (error) {
  if (error.status === 401) {
    // User logged out (token refresh failed)
    window.location.href = '/login';
  } else if (error.status === 403) {
    // User not authorized for this resource
    alert('You don\'t have permission');
  } else if (error.status === 400) {
    // Invalid request
    alert(error.message);
  } else {
    // Server error
    console.error('Server error:', error.message);
  }
}
```

---

### Environment Variables

Required in `.env` for frontend to work:

```
VITE_SERVER_URL=http://localhost:5000
```

Used by:
- `apiClient.js`: `buildApiUrl()` constructs full URL
- `csrf.js`: `buildApiUrl()` constructs CSRF endpoint URL

---

## Troubleshooting Guide

### Issue: CSRF Token Always Missing

**Symptom:** POST requests fail with "CSRF token missing"

**Causes:**
1. `VITE_SERVER_URL` not set in `.env`
2. `fetchCsrfToken()` endpoint failing
3. CSRF cache cleared unexpectedly

**Fix:**
```javascript
// Check 1: Verify endpoint
console.log(import.meta.env.VITE_SERVER_URL);  // Should be 'http://localhost:5000'

// Check 2: Manually fetch token
import { fetchCsrfToken } from './utils/csrf';
const token = await fetchCsrfToken({ force: true });
console.log(token);  // Should be non-empty string

// Check 3: Check browser cookies
console.log(document.cookie);  // Should include session cookies
```

---

### Issue: Token Refresh Loop

**Symptom:** Console shows repeated "POST /api/auth/refresh" requests

**Causes:**
1. Refresh endpoint broken
2. Refresh token expired
3. Backend returning 401 for refresh request

**Fix:**
```javascript
// The refreshPromise deduplication should prevent loops
// If looping, check:
1. Backend logs for /api/auth/refresh errors
2. Refresh token in database still valid
3. Backend returning new token correctly

// Temporary fix: Clear cookies and re-login
localStorage.clear();
sessionStorage.clear();
window.location.href = '/login';
```

---

### Issue: User Stays Logged In After Logout

**Symptom:** Navigating back to app shows user still logged in

**Causes:**
1. `notifyAuthChanged()` not fired
2. Components not listening to AUTH_STATE_EVENT
3. Cookies not cleared by backend

**Fix:**
```javascript
// Ensure components listen:
useEffect(() => {
  window.addEventListener('gigimpact:auth-changed', () => {
    setUser(null);
    navigate('/login');
  });
  
  return () => {
    window.removeEventListener('gigimpact:auth-changed', ...);
  };
}, []);

// Verify backend is clearing cookies:
// Set-Cookie headers should have Max-Age=0 or Expires=past-date
```

---

## Conclusion

Your application uses a **production-grade authentication system** with:

✓ CSRF protection for state-changing requests  
✓ Automatic token refresh (seamless UX)  
✓ Secure httpOnly cookie storage  
✓ Race condition prevention (refreshPromise)  
✓ Role-based navigation  
✓ Event-driven auth state management  

All four files work together as a cohesive security & communication layer.

---

**Document Version:** 1.0  
**Generated:** April 29, 2026  
**Framework:** React + Vite  
**Backend:** Node.js/Express  
