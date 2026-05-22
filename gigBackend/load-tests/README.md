# Signup Load Testing

This folder contains a `k6` load test for the registration endpoint:

- `register-load-test.js`

## What to test

For this application, the most useful tests around multiple signups are:

1. Baseline load test
   Measures normal traffic, such as 5 to 20 concurrent signup users.

2. Spike test
   Simulates a sudden burst, such as 50 to 100 users registering at once.

3. Soak test
   Keeps moderate signup traffic running for 30 to 60 minutes to catch pool exhaustion, memory growth, or mail backlog.

4. Breakpoint test
   Gradually increases concurrency until response times, DB connections, or error rates become unacceptable.

## Important notes for this app

- `/api/auth/register` requires both `Origin` and `X-CSRF-Token`.
- The app also uses rate limiting, so test results will include `429` if your traffic exceeds the configured limits.
- Signup sends verification email, which can become the bottleneck before PostgreSQL does.
- Use a staging database and a non-production mail provider or mocked email transport for load tests.

## Run the test

Install `k6`, then run:

```bash
k6 run gigBackend/load-tests/register-load-test.js
```

Or with custom environment values:

```bash
k6 run -e BASE_URL=http://localhost:5000 -e CLIENT_ORIGIN=http://localhost:5173 gigBackend/load-tests/register-load-test.js
```

## What success looks like

During the test, watch for:

- PostgreSQL connection count staying below your safe limit
- p95 signup latency staying under 2 seconds
- low `500` error rate
- controlled `429` responses instead of app crashes
- no duplicate-email race failures beyond expected `409`

## Recommended DB monitoring

Run this in PostgreSQL while the test is active:

```sql
SELECT count(*) AS total_connections
FROM pg_stat_activity;
```

```sql
SELECT state, count(*)
FROM pg_stat_activity
GROUP BY state;
```

## Current code observations

- The `users.email` column is already protected with a database `UNIQUE` constraint.
- The backend checks for an existing email before insert, so under concurrency the database constraint is the final safety net.
- The PostgreSQL pool config in `src/config/db.js` does not currently set an explicit pool `max`, so it falls back to the `pg` default.
