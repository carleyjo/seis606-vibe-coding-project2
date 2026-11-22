---

description: "Implementation tasks for the Travel Buddy MVP"
---

# Tasks: Budget-Aware Travel Attraction Planner

**Input**: Design documents from `/specs/001-travel-attraction-planner/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md),
[data-model.md](./data-model.md), [contracts/openapi.yaml](./contracts/openapi.yaml),
[quickstart.md](./quickstart.md)

**Scope**: Backend/API and domain behavior first. Visual UI components, styling, weather,
directions, and transportation costs are excluded from v1.

## Phase 1: Foundation and API Setup

**Goal**: Establish the ES6 module project, lint/test tooling, source boundaries, and
Wikivoyage client contract.

**Independent validation**: A clean project can lint, run unit tests, and import the
API modules without browser UI components.

- [X] T001 Create the JavaScript project structure in `src/api/`, `src/domain/`, `src/storage/`, `src/app/`, `tests/unit/`, `tests/contract/`, and `tests/integration/`.
- [X] T002 Configure ESLint and the unit-test runner in `package.json`, `eslint.config.js`, and `tests/setup.js`; add scripts for linting, unit tests, coverage, and build validation.
- [X] T003 [P] Create shared domain constants and status enums in `src/domain/constants.js` for pricing (`free`, `known`, `estimated`, `unknown`), source freshness, and transportation availability.
- [X] T004 [P] Add the logical API schemas and response error shapes from `contracts/openapi.yaml` to `src/api/contracts.js`.
- [X] T005 [P] Add the Wikivoyage endpoint configuration and request builder in `src/api/wikivoyage-client.js`, using the MediaWiki Action API, `origin=*`, a bounded result limit of 20, and HTTPS-only URLs.
- [X] T006 Implement bounded request caching and in-flight request deduplication in `src/api/request-cache.js`, storing canonical search keys, normalized responses, fetched timestamps, expiration timestamps, and source version.
- [X] T007 Implement request concurrency limits, retry/backoff behavior, and `Retry-After` handling in `src/api/rate-limit.js`; do not evade provider limits by rotating user agents or changing identities.
- [X] T008 [P] Add unit tests for the request builder, cache key normalization, cache expiration, and rate-limit retry behavior in `tests/unit/api/`.
- [X] T009 Add an API contract test in `tests/contract/search-contract.test.js` verifying `/searches` request/response shapes, `400` validation errors, `502` source failures, and required source attribution fields.

## Phase 2: User Story 1 - Find Attractions for a Trip (P1)

**Goal**: Search Wikivoyage, normalize attraction records, and return attractions in
the selected city that are open on at least one selected date and fit the budget when
their cost is known.

**Independent validation**: Given fixture source data and a valid trip search, results
contain only eligible attractions plus explicitly labeled unknown-cost attractions.

- [X] T010 [US1] Implement trip input validation in `src/domain/search-validation.js` for a trimmed city, valid future start/end dates, end date on or after start date, at least one adult, child ages from 0 through 17, required car choice, and a nonnegative budget.
- [X] T011 [US1] Add validation tests for valid searches and invalid city, date, adult-count, child-age, car-choice, and budget inputs in `tests/unit/domain/search-validation.test.js`.
- [X] T012 [US1] Implement Wikivoyage city discovery and article-detail fetching in `src/api/wikivoyage-client.js`, retaining stable page identity, article URL, coordinates, extract, and source metadata.
- [X] T013 [US1] Implement source-to-domain normalization in `src/domain/attraction-normalizer.js`, preserving unavailable or contradictory values as explicit unknown states and never inventing prices, hours, routes, or fares.
- [X] T014 [US1] Implement selected-date opening evaluation in `src/domain/opening.js`; return eligible only when source data confirms the attraction is open on at least one selected date, and return unknown when opening data is missing or contradictory.
- [X] T015 [US1] Implement search orchestration in `src/domain/recommendations.js` to validate input, load cached or fetched data, normalize results, apply opening eligibility, cap results at 20, and return source freshness status.
- [X] T016 [US1] Add fixture-based tests in `tests/unit/domain/attraction-normalizer.test.js` and `tests/unit/domain/opening.test.js` for open, closed, missing, and contradictory source data.
- [X] T017 [US1] Add end-to-end search integration tests in `tests/integration/search-flow.test.js` proving city/date filtering, no-results behavior, source failures, stale-cache fallback, and source URLs.

## Phase 3: User Story 2 - Calculate Group-Aware Prices (P1)

**Goal**: Calculate admission costs for adults and children using attraction-specific age
bands, include free attractions at zero, and preserve clear estimates or unknown costs.

**Independent validation**: Fixture attractions with different child age definitions
produce correct group totals and eligibility decisions.

- [X] T018 [US2] Implement pricing and age-band evaluation in `src/domain/pricing.js`, including inclusive/exclusive boundaries exactly as published by each attraction.
- [X] T019 [US2] Implement the pricing states in `src/domain/pricing.js`: free equals zero, known uses published adult/child prices, estimated uses the adult price when a child price is missing, and unknown has no fabricated numeric amount.
- [X] T020 [US2] Add pricing tests in `tests/unit/domain/pricing.test.js` for multiple child ages, boundary ages, zero children, free admission, missing child price estimates, unknown prices, and exact-budget equality.
- [X] T021 [US2] Integrate group pricing into `src/domain/recommendations.js` so known costs above budget are excluded, free attractions are included at zero, and unknown-cost attractions remain visible with a budget-impact disclaimer.
- [X] T022 [US2] Add contract and integration assertions in `tests/contract/search-contract.test.js` and `tests/integration/search-flow.test.js` for `free`, `known`, `estimated`, and `unknown` pricing statuses and disclaimers.

## Phase 4: User Story 3 - Select Attractions and Track Budget (P2)

**Goal**: Provide state operations for selecting multiple attractions, enforcing known-cost
budget limits, allowing unknown-cost selections, and persisting temporary trip state.

**Independent validation**: Selection operations add/remove attractions deterministically,
reject duplicates and known-budget overflow, and mark aggregates unknown when required.

- [X] T023 [US3] Implement selection operations in `src/domain/selections.js` for add, remove, duplicate detection, known-cost budget checks, and aggregate status (`known` or `unknown`).
- [X] T024 [US3] Add selection tests in `tests/unit/domain/selections.test.js` for adding known/free/unknown attractions, rejecting duplicates, rejecting known-cost overflow, removing selections, and unknown aggregate totals.
- [X] T025 [US3] Implement local trip persistence in `src/storage/local-trip-store.js` using `localStorage`, including schema versioning, serialization, safe parse failures, and clearing the current trip.
- [X] T026 [US3] Add storage tests in `tests/unit/storage/local-trip-store.test.js` for save/load/clear, malformed stored data, storage-unavailable behavior, and preservation of unknown-cost selections.
- [X] T027 [US3] Connect selection operations to the logical `/selections` contract in `src/app/bootstrap.js`, returning the selected IDs, aggregate status, known total when available, and unknown remaining budget when an unknown selection exists.
- [X] T028 [US3] Add selection-flow integration tests in `tests/integration/selection-flow.test.js` covering persistence across reload-like initialization and budget updates after add/remove operations.

## Phase 5: User Story 4 - Provide No-Car Transportation Information (P2)

**Goal**: Show source-backed public transportation information for no-car searches or
an explicit unavailable label, without calculating directions, fares, or parking costs.

**Independent validation**: No-car results include source-backed transportation data or
an unavailable state; car users are not blocked by missing transit data.

- [X] T029 [US4] Implement transportation normalization in `src/domain/attraction-normalizer.js` for source-backed modes and route notes, using `unavailable` when details are missing and excluding directions, fares, and parking costs.
- [X] T030 [US4] Update `src/domain/recommendations.js` to require transportation information only for no-car display data, never for car-user eligibility, and never invent route or schedule details.
- [X] T031 [US4] Add transportation tests in `tests/unit/domain/transportation.test.js` and `tests/integration/transportation-flow.test.js` for available transit, missing transit, car users, and explicit unavailable labels.

## Phase 6: Testing, Documentation, and Polish

**Goal**: Meet quality gates and make the API/domain layer reliable and documented before
any UI styling or component work.

**Independent validation**: Lint, tests, coverage, contract validation, and build checks
pass; all v1 exclusions remain absent from the implementation scope.

- [X] T032 [P] Add API and domain documentation comments plus source attribution guidance in `src/api/README.md` and `src/domain/README.md`, including Wikivoyage article URLs, CC BY-SA attribution, freshness labels, and unknown-data rules.
- [X] T033 [P] Add OpenAPI validation to the project scripts and update `contracts/openapi.yaml` whenever implementation response shapes change.
- [X] T034 [P] Add error-handling tests in `tests/integration/error-handling.test.js` for invalid input, source timeout, rate limiting, malformed source data, unavailable storage, and stale-cache fallback.
- [X] T035 [P] Add a coverage threshold configuration in `package.json` or the test-runner configuration requiring greater than 80% coverage across source modules.
- [X] T036 Run the full lint, unit, contract, integration, coverage, and build commands; fix failures and record the results in `quickstart.md`.
- [X] T037 Verify HTTPS-only external requests, CSP deployment requirements, absence of API keys or secrets in source, and no implementation of weather alerts, notifications, directions, parking costs, or public-transport costs in `tests/integration/security-scope.test.js`.
- [X] T038 Verify bundle size remains below 100 KB and cached first-use behavior meets the under-2-second cached dashboard target; record measurements in `quickstart.md`.

## Dependencies and Execution Order

### Story completion order

1. Phase 1 Foundation and API Setup
2. Phase 2 User Story 1 - Find Attractions
3. Phase 3 User Story 2 - Group Pricing
4. Phase 4 User Story 3 - Selection State
5. Phase 5 User Story 4 - Transportation
6. Phase 6 Testing, Documentation, and Polish

US2 depends on the normalized attraction records and search orchestration from US1.
US3 depends on US1 and US2 pricing statuses. US4 depends on normalized attraction
records from US1 but can begin after T013; final integration follows US3 for the MVP
sequence. Phase 6 depends on all implemented story behavior.

### Parallel execution examples

After T002:

- T003, T004, T005, T006, and T007 can proceed in parallel.
- T008 can begin after the API utility modules it tests are available.

After T013:

- T014 and T018 can proceed in parallel.
- T016 and T029 can proceed in parallel once their normalization contracts are fixed.

After T021:

- T023 and T029 can proceed in parallel.
- T020 and T022 can proceed in parallel.

During Phase 6:

- T032, T033, T034, T035, and T037 can proceed in parallel.
- T036 and T038 run after the implementation and test tasks.

## Implementation Strategy

1. Deliver the API client, normalization, validation, opening-date filtering, and
   known-budget MVP first (US1).
2. Add group pricing and age bands (US2) before allowing users to trust budget results.
3. Add local selection state and persistence (US3).
4. Add no-car transportation display data without directions or costs (US4).
5. Apply quality gates, documentation, security checks, and performance measurements.
6. Defer visual components and styling until these API/domain contracts are stable.

## MVP Scope

The MVP consists of Phases 1–3: API setup, attraction search/filtering, and accurate
group-aware pricing, including free and unknown-cost handling. Phase 4 is required for
the complete selection experience; Phase 5 completes no-car support.
