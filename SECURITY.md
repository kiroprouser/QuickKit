# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in QuickKit, please report it
responsibly:

1. Open a private security advisory on the QuickKit GitHub repository
   (preferred), or
2. Open an issue labeled `security` with enough detail to reproduce.

Please do not publish exploits publicly until a fix has been released.

## Threat model

QuickKit is a client-only static-export web app. There is:

- No backend, no API server, no serverless functions.
- No database, no ORM, no Prisma.
- No account system, no authentication, no sessions.
- No analytics, no tracking pixels, no third-party scripts.
- No server-side processing of user input whatsoever.

All calculations run in the user's browser. Generated passwords, PINs, QR
payloads, raw Text Tool content, and Random Picker choice lists live only
in memory and are never persisted. The only durable state is theme,
favorites, Recent Tools (tool identities only — never inputs or results),
and the haptics preference, stored in `localStorage` under a single key
with a schema version, validation, and corruption fallback.

## What this means

- **XSS in tool inputs:** the engines process user-typed input but render
  results as text or canvas output (no `dangerouslySetInnerHTML` on user
  data). QR payloads are encoded by the `qrcode` library into a matrix.
- **CSRF:** there is no server, so there is no CSRF surface.
- **Insecure randomness:** the Password, PIN, coin, dice, and random
  integer tools use `window.crypto.getRandomValues` with rejection
  sampling for unbiased distributions. The only fallback path is
  `Math.random`, used only when `window.crypto` is unavailable (extremely
  rare in modern browsers).
- **Service worker:** the SW caches only first-party static assets. It
  does not intercept or cache cross-origin traffic and does not transmit
  user data anywhere.
- **No secrets in the repository:** the only `.env` value is
  `NEXT_PUBLIC_SITE_URL` (the public production URL). Do not add secrets.

## Scope

This policy covers the QuickKit source in this repository. It does not
cover dependencies — report dependency CVEs upstream.

## Disclosure

QuickKit is a small, focused project. We will acknowledge security reports
within 7 days and aim to ship a fix within 30 days for verified issues.
