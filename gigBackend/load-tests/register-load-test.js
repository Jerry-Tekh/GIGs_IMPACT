import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const CLIENT_ORIGIN = __ENV.CLIENT_ORIGIN || 'http://localhost:5173';

export const options = {
  scenarios: {
    signup_ramp: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 20 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000', 'p(99)<4000'],
    checks: ['rate>0.95'],
  },
};

function getCsrfTokenAndCookies() {
  const response = http.get(`${BASE_URL}/api/auth/csrf-token`, {
    headers: {
      Origin: CLIENT_ORIGIN,
    },
  });

  check(response, {
    'csrf token endpoint returned 200': (r) => r.status === 200,
    'csrf token present': (r) => Boolean(r.json('csrfToken')),
  });

  return response.json('csrfToken');
}

export default function () {
  const csrfToken = getCsrfTokenAndCookies();
  const unique = `${__VU}-${__ITER}-${Date.now()}`;

  const payload = JSON.stringify({
    full_name: `Load Test User ${unique}`,
    email: `loadtest-${unique}@example.com`,
    password: 'TestPass123!',
  });

  const response = http.post(`${BASE_URL}/api/auth/register`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Origin: CLIENT_ORIGIN,
      'X-CSRF-Token': csrfToken,
    },
  });

  check(response, {
    'register status is success or controlled failure': (r) => [201, 400, 403, 409, 429, 500].includes(r.status),
    'register success or rate-limited': (r) => [201, 429].includes(r.status),
  });

  sleep(1);
}
