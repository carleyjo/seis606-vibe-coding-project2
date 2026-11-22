<!--
Sync Impact Report
- Version change: Uninitialized scaffold -> 1.0.0
- Modified principles: Template placeholders -> five project-specific core principles
- Added sections: Security, Data and API Constraints; Development Workflow and Quality Gates
- Removed sections: None
- Follow-up TODOs: Confirm the original ratification date.
-->

# Travel Discovery Constitution

## Core Principles

### I. User-Driven Travel Recommendations
The application MUST accept a destination city, visit dates, car availability, and trip
budget. It MUST return tourist destinations in the selected city that fit the budget and
are open on at least one selected date. Recommendation behavior MUST be deterministic
and testable for the same input data.

### II. Accurate, Source-Grounded Information
Attraction details, opening information, costs, and relevant travel guidance MUST be
grounded in Wikivoyage data or a documented, approved supporting source when Wikivoyage
does not provide the required detail. The application MUST identify unavailable,
stale, or uncertain data rather than presenting it as verified fact.

### III. Accessible Transportation Guidance
When a user indicates they do not have a car, every returned attraction MUST include
available public transportation options when source data provides them. Missing
transportation data MUST be represented explicitly, and the application MUST NOT
invent routes, schedules, or fares.

### IV. Tested and Documented Interfaces
All code MUST have unit tests, and the test suite MUST maintain greater than 80%
coverage. All APIs MUST be documented with OpenAPI, including authentication,
request and response schemas, validation errors, and externally visible failure
responses. Changes to an API MUST update its OpenAPI documentation and tests in the
same change.

### V. Simple, Maintainable Architecture
The implementation MUST use the simplest architecture that satisfies the product
requirements. New abstractions, services, dependencies, and indirection MUST have a
specific demonstrated benefit; speculative generalization is prohibited. Components
MUST have clear responsibilities and be independently testable where practical.

## Security and Data Constraints

All endpoints MUST require authentication, including read-only and health-related
application endpoints unless an explicit exception is documented and approved in a
constitution amendment. Secrets, credentials, tokens, and private keys MUST never be
committed to source control, fixtures, logs, or documentation. Sensitive configuration
MUST be injected through the approved runtime secret mechanism. Inputs MUST be
validated at the application boundary, and external source failures MUST produce
explicit errors or clearly labeled unavailable data rather than silent fallbacks.

## Development Workflow and Quality Gates

Every feature change MUST include or update unit tests and maintain coverage above 80%.
API changes MUST include OpenAPI updates and contract-level tests. Pull requests MUST
include a compliance review covering authentication, secret handling, source
attribution, budget/date filtering, and car-versus-public-transport behavior.
Complexity that cannot be justified by a current requirement MUST be removed or
deferred. A change is complete only when its focused tests pass and its documentation
is synchronized.

## Governance

This constitution supersedes conflicting project practices. Amendments MUST describe
the reason for change, update the version and last-amended date, and preserve or
explicitly migrate affected behavior. Versioning follows semantic versioning:
MAJOR for incompatible governance changes or removals, MINOR for new or materially
expanded principles or sections, and PATCH for clarifications and non-semantic
corrections. Every implementation review MUST verify compliance with this document;
exceptions require written rationale, scope, owner, and an expiration or review date.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date | **Last Amended**: 2026-11-07
