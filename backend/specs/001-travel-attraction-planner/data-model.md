# Data Model: Budget-Aware Travel Attraction Planner

## TripSearch

Represents one submitted search.

| Field | Type | Rules |
|---|---|---|
| `city` | string | Required, trimmed, recognized by the discovery step |
| `startDate` | ISO date | Required, not in the past |
| `endDate` | ISO date | Required, on or after `startDate` |
| `adultCount` | integer | Required, at least 1 |
| `childAges` | integer[] | Each age is a whole number from 0 through 17 |
| `hasCar` | boolean | Required |
| `budget` | nonnegative decimal | Admission budget for the full group only |

## Attraction

| Field | Type | Rules |
|---|---|---|
| `id` | string | Stable normalized identifier derived from source page identity |
| `name` | string | Required when shown |
| `description` | string | Source-backed; may be unavailable |
| `articleUrl` | URL | Required for attribution |
| `officialUrl` | URL or unknown | Optional source-backed link |
| `coordinates` | latitude/longitude or unknown | Never inferred |
| `pricing` | Pricing | Free, known, estimated, or unknown |
| `opening` | OpeningSchedule or unknown | Must support selected-date evaluation |
| `transportation` | TransportationInfo or unavailable | Required for no-car display when available |
| `source` | SourceRecord | Required |

## Pricing

`status` is one of `free`, `known`, `estimated`, or `unknown`.

- `free`: group cost is exactly zero.
- `known`: adult and applicable child-band prices are source-backed.
- `estimated`: a missing child price uses the adult price and is visibly labeled.
- `unknown`: no reliable group cost exists; it is selectable but has unknown budget impact.

An attraction's `ageBands` contain inclusive/exclusive boundaries exactly as published by
the attraction. Boundary interpretation is preserved in source notes when ambiguous.

## OpeningSchedule

Contains source-backed regular hours, closures, and exceptions. Eligibility is true
when the attraction is confirmed open on at least one selected date. Missing or
contradictory opening data yields `unknown`, not an assumed open state.

## TransportationInfo

Contains source-backed public transport modes, route notes, and source URL. Missing
data is represented as `unavailable`; no route, schedule, or fare is generated.

## SourceRecord

Contains `provider`, `articleUrl`, `retrievedAt`, `license`, and `freshnessStatus`.
Wikivoyage attribution and a link to the source article are required for displayed
content.

## AttractionSelection

Contains `attractionId`, `groupCost` (`known`, `zero`, or `unknown`), and selected time.
Duplicate attraction IDs are prohibited. Known-cost selections cannot exceed the budget.
If any selected cost is unknown, the aggregate total and remaining budget are displayed
as unknown.

## CacheEntry

Contains canonical search key, normalized response, fetched timestamp, expiration
timestamp, and source version. Expired entries may be shown only as explicitly stale
fallback data after a fetch failure.

## Relationships and lifecycle

`TripSearch` produces zero or more `Attraction` records. A `TripSearch` owns zero or
more `AttractionSelection` records. Each `Attraction` has one or more `SourceRecord`
references and may have one `CacheEntry`.

Lifecycle: validate input → discover pages → normalize data → evaluate opening and
budget eligibility → display results → select/remove attractions → persist current
trip locally.
