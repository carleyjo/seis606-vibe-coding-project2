# Implementation Plan: Budget-Aware Travel Attraction Planner

**Branch**: `001-travel-attraction-planner` | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)

## Summary

Build a backend-free, modular ES6 client that searches Wikivoyage's public MediaWiki
API, normalizes attraction data, applies date, age-band, price, and budget rules, and
stores the current trip and bounded API cache in browser storage. The initial plan
focuses on the API/data/business-rule layer; presentation remains a thin progressive
enhancement over the contracts.

For destinations represented in the static attraction database, the app loads
`database.sql` and executes SQL.js in the browser. Bangkok is the initial local
database city. If the requested city has no SQL rows, the app falls back to
Wikivoyage. This architecture supports free deployment to GitHub Pages without a
backend API or database server.

Wikivoyage is a discovery and source-link provider, not a guaranteed authoritative
source for current prices, opening calendars, or transit routes. Unknown values remain
unknown, while free attractions are represented as zero cost and child prices use
published attraction-specific age bands.

## Technical Context

**Language/Version**: JavaScript ES2022 with ES6 modules

**Primary Dependencies**: Browser Fetch API, Web Storage API, Wikimedia Action API;
ESLint for static analysis; no runtime framework required

**Storage**: `localStorage` for current trip selections and bounded normalized cache;
no credentials or secrets stored client-side

**Testing**: ESLint plus a JavaScript unit-test runner selected during implementation;
tests MUST maintain greater than 80% coverage

**Target Platform**: Modern Chrome, Firefox, Safari, and Edge over HTTPS

**Project Type**: Backend-free progressive web application with a client API layer

**Performance Goals**: First useful dashboard state under 2 seconds on a 3G
connection when cached; valid uncached searches return within 10 seconds; bundle
remains below 100 KB before external data

**Constraints**: No backend server, no API key in client code, HTTPS-only external
requests, bounded cache TTL, request deduplication, polite concurrency and retries,
CSP supplied by the static hosting environment, mobile/tablet/desktop accessibility,
and no fabricated price, schedule, opening, or transit data

**Scale/Scope**: One browser user at a time; trip searches return a bounded result
set (default maximum 20 attractions); local data is temporary and may be cleared
when the browser storage is cleared

## Constitution Check

*GATE: Must pass before Phase 0 research and after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| User-driven recommendations | PASS | Search input and filtering rules are represented in the data model and contracts. |
| Source-grounded information | PASS | Wikivoyage URLs, freshness, unknown states, and attribution are required. |
| Accessible transportation guidance | PASS | No-car results include source-backed transit guidance or an unavailable state. |
| Tested and documented interfaces | PASS | Unit/coverage gates and an OpenAPI contract are included. |
| Simple architecture | PASS | Direct modules, browser storage, and one external source; no server or repository abstraction. |
| Security and data constraints | PASS with boundary note | No client secret is required for public reads; any future server endpoint must add authentication. CSP and HTTPS are deployment requirements. |

## Phase 0: Research

Research is recorded in [research.md](./research.md). Decisions:

- Use the Wikivoyage MediaWiki Action API for geographic discovery and article details.
- Use `origin=*`, bounded requests, caching, in-flight deduplication, and polite retries.
- Do not require an API key for public reads or expose a secret in browser code.
- Preserve article URLs, source freshness, and CC BY-SA attribution.
- Treat price, opening, and transit data as unknown unless the source provides reliable
  structured information; never infer missing values.

## Phase 1: Design and Contracts

Generated artifacts:

- [data-model.md](./data-model.md): trip, traveler, attraction, pricing, opening,
  transportation, source, cache, and selection entities.
- [contracts/openapi.yaml](./contracts/openapi.yaml): documented logical client API
  for search, attraction results, and selected-trip state. It is a contract artifact,
  not a claim that a server is required for the first release.
- [quickstart.md](./quickstart.md): validation scenarios for API calls, filtering,
  pricing, unknown data, caching, and selection behavior.

## Project Structure

```text
src/
├── api/
│   ├── wikivoyage-client.js
│   ├── request-cache.js
│   └── rate-limit.js
├── domain/
│   ├── search-validation.js
│   ├── attraction-normalizer.js
│   ├── pricing.js
│   ├── opening.js
│   ├── recommendations.js
│   └── selections.js
├── storage/
│   └── local-trip-store.js
└── app/
    └── bootstrap.js

tests/
├── unit/
├── contract/
└── integration/
```

**Structure Decision**: Use one small client project split by API, domain rules, and
storage. The frontend is intentionally limited to bootstrap/integration glue for this
plan; visual components are deferred until the backend/API behavior is verified.

## Complexity Tracking

No constitution violations require justification.
