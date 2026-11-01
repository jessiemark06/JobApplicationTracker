# Security and performance changes

## Implemented protections

- Login is limited to five attempts per minute per IP and normalized email.
- Registration is limited to three attempts per minute per IP.
- Rate limits use Laravel's configured cache store, so production deployments should use a shared cache such as Redis when multiple application servers are used.
- Sanctum personal access tokens expire after 60 minutes by default. A new login revokes the user's previous personal access tokens, limiting the lifetime of leaked credentials.
- Token prefixes make accidental token disclosure easier to detect in logs and secret-scanning tools.
- The frontend no longer persists bearer tokens in `localStorage`; tokens are kept in `sessionStorage` and removed when the browser session ends.
- On startup, the frontend validates a stored token against `/profile`. Expired or invalid sessions are cleared instead of rendering authenticated pages with stale data.
- Protected routes show a session-check loading state, and login/register controls prevent duplicate submissions.

## Recommended production configuration

1. Set `APP_DEBUG=false`.
2. Serve both frontend and backend over HTTPS.
3. Set `SANCTUM_STATEFUL_DOMAINS` to the exact frontend hostnames when using Sanctum's cookie-based SPA authentication.
4. Configure a shared Redis cache for rate limiting when the backend runs on more than one instance.
5. Prefer Sanctum's HttpOnly, Secure, SameSite cookie flow for a first-party deployment. `sessionStorage` reduces persistence but cannot prevent a same-origin XSS vulnerability from reading a bearer token.
6. Add a strict Content Security Policy and keep frontend dependencies audited and up to date.

## Why pages appeared slow

Authenticated pages make API requests after the React route renders. The dashboard makes separate requests for companies, applications, and interviews, so its visible content depends on network responses. The session-validation request also runs once on application startup to prevent stale tokens from being trusted.

The loading UI now clearly identifies session validation and form submission progress. Dashboard loading remains bounded by the data request and displays a spinner with a complete status message rather than an ambiguous blank area. Further performance work can combine dashboard data into one backend endpoint and add caching for infrequently changing reference data.

