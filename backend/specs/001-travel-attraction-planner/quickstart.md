# Quickstart Validation Guide

This guide validates the API/domain layer before visual frontend work.

## Prerequisites

- A modern browser and HTTPS-capable static host.
- JavaScript dependencies installed after implementation.
- Network access to `https://en.wikivoyage.org/w/api.php`.
- SQL.js browser assets in `vendor/` and the static SQL data file `database.sql`.

## Required validation commands

Run the repository's configured install, lint, unit-test, coverage, and build commands
after implementation. The exact package scripts are not yet present because this
repository currently contains specification artifacts only.

Expected quality gates:

- ESLint passes.
- Unit tests pass with coverage greater than 80% (currently 23 tests, 99.74% lines,
  87.93% branches, and 100% functions).
- Source size is below 100 KB before external data (currently 14,991 bytes).
- OpenAPI contract validation passes.

## Scenario checks

1. Submit a valid city/date/group/budget search and verify results include source URLs.
2. Verify attractions closed for every selected date are excluded.
3. Verify known group cost uses each child's attraction-specific age band.
4. Verify missing child price uses the adult price and displays an estimate disclaimer.
5. Verify free attractions are included with group cost zero.
6. Verify unknown-cost attractions are displayed and selectable with an unknown-cost
   disclaimer; aggregate total and remaining budget become unknown.
7. Verify known selections cannot exceed the budget and duplicate selections are rejected.
8. Verify no-car results show source-backed transit guidance or an unavailable label.
9. Repeat a search and verify cached normalized data avoids a duplicate network request.
10. Simulate source failure and verify an explicit error or clearly labeled stale cache.
11. Inspect deployment headers for HTTPS enforcement and a restrictive CSP.

See [data-model.md](./data-model.md) for states and
[contracts/openapi.yaml](./contracts/openapi.yaml) for request/response shapes.
