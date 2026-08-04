// Central API base URL resolution.
//
// Order of precedence:
//   1. VITE_BACKEND_URL environment variable (if set), e.g. a custom backend URL.
//   2. Development: fall back to the local backend (http://localhost:3000).
//   3. Production: use the same origin, so requests go to /api/* on the
//      deployed Vercel project (single-project setup, no CORS needed).
const configured = import.meta.env.VITE_BACKEND_URL;

export const BASE_URL = configured
  ? configured.replace(/\/+$/, "")
  : import.meta.env.DEV
  ? "http://localhost:3000"
  : "";