# Contributing to QuickKit

Thank you for considering a contribution to QuickKit. This document
describes how to develop, test, and propose changes to the project.

## Project goals

QuickKit is a privacy-conscious, local-first collection of everyday browser
utilities. The product scope is fixed: eight tools, Quick Command, and the
supporting pages (Home, Guide, Settings, About, Privacy). Please do not
propose unrelated utilities, an account system, a backend, a database,
server-side rendering, or new dependencies unless there is a strong reason.

## Development setup

```bash
bun install
bun run dev      # http://localhost:3000
bun run lint
bun run typecheck
bun test
```

Requires Bun and Node 18+. The project has **no database** — there is
nothing to provision.

## Architectural constraints (do not break)

These constraints are non-negotiable:

- Next.js 16 App Router at the repository root. No `/src`, no Pages Router.
- `output: "export"` static export. The production artifact is `/out`. No
  Node.js server, no Edge runtime, no serverless functions, no API routes
  for application behavior, no Server Actions, no dynamic routes, no ISR.
- No database, no ORM, no Prisma.
- One canonical tool catalog (`quickkit/catalog/tools.ts`) drives Home,
  Header, Footer, Guide, Quick Command, route resolution, related tools,
  SEO, sitemap, and `llms.txt`. Never create a second array of the eight
  tools.
- Each tool's engine is pure TypeScript with no React/Next/persistence
  knowledge. The graphical UI and Quick Command call the same engine. No
  duplicated calculation logic.
- The persistent root `AppRuntime` initializes shared systems exactly once.
  Page components consume them — they do not initialize duplicate instances.
- Tool working state lives in `useToolState(toolId, initialState)` from the
  session store. Sensitive values (passwords, PINs, QR payloads, raw text,
  random choice lists) are NEVER durably persisted.
- Internal navigation uses `AppLink` (which defaults to `prefetch={false}`).
  Do not import `next/link` directly elsewhere.
- No operation History feature. No `/history`. Recent Tools records only
  tool identities — never inputs, results, command strings, or any other
  content.
- Home renders one unified ranked tool collection. No separate
  All/Favorites/Recent sections. Ranking is favorites → recent → canonical.
- Footer attribution: `© 2026 Asaad`. Author name everywhere is `Asaad`.
  Never `Asaad Student`.
- No hidden SEO keyword content, no fake schema ratings/reviews, no
  `<meta name="keywords">`.

## Style

- TypeScript throughout, strict.
- Prefer the existing UI primitives in `quickkit/ui/`. Add a new primitive
  there only if it is genuinely used by multiple product areas.
- Use the QuickKit design tokens (CSS variables in
  `quickkit/styles/globals.css`) via Tailwind arbitrary-value classes
  (`bg-[var(--color-surface)]`, etc.). Avoid hardcoded arbitrary values.
- Avoid indigo and blue colors. The QuickKit palette is warm off-white /
  beige with a burnt-orange primary accent.
- Accessibility is required: semantic HTML, keyboard navigation, visible
  focus, ARIA labels, touch target sizing (≥44px), reduced-motion respect.

## Tests

Add or update tests in `tests/` whenever you change engine behavior. Run
`bun test` before submitting. Tests use `bun:test`.

## Committing

- Write clear commit messages.
- Do not commit secrets, `.env.local`, or build artifacts (`/out`,
  `.next/`).
- Do not push to a remote or rewrite Git history as part of a contribution
  unless asked.

## Reporting security issues

See [SECURITY.md](./SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the
MIT License.
