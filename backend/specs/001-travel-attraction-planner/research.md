# Research: Budget-Aware Travel Attraction Planner

## Decision: Use the Wikivoyage MediaWiki Action API

**Rationale**: Wikivoyage exposes the standard Action API, including geosearch and
page-detail queries. `origin=*` supports anonymous browser cross-origin requests, and
the API does not require a key for public reads.

**Alternatives considered**:

- REST page summaries: simpler for a known article, but insufficient for geographic
  discovery and richer result fields.
- Wikidata Query Service: more structured, but less suitable for attraction prose and
  more sensitive to expensive browser queries.
- Wikimedia Enterprise: structured and scalable, but requires registration and paid or
  credentialed access, which conflicts with the small static app.

Sources: [Action API](https://www.mediawiki.org/wiki/API:Action_API),
[Geosearch](https://www.mediawiki.org/wiki/API:Geosearch),
[Cross-site requests](https://www.mediawiki.org/wiki/API:Cross-site_requests).

## Decision: Keep all public API reads client-side and secretless

**Rationale**: The selected public API does not require an API key. Adding a key to a
static bundle would not protect it. Any future server endpoint would require
authentication under the constitution and would be a separate architecture change.

**Alternatives considered**:

- Proxy through a backend: improves control and secret handling, but violates the
  current no-server constraint and adds unnecessary infrastructure.
- Put an API key in environment-substituted browser code: does not keep the key
  secret once shipped to users.

## Decision: Cache normalized results with bounded freshness

**Rationale**: Cache API responses and normalized attractions by canonical search key,
deduplicate in-flight requests, limit concurrency, and honor retry delays. Every cached
record includes fetched time and source URL so stale data is visible.

**Alternatives considered**:

- No cache: simpler but conflicts with the performance target and increases public API
  traffic.
- Unbounded cache: improves speed but risks displaying stale opening and price data.

Sources: [API etiquette](https://www.mediawiki.org/wiki/API:Etiquette),
[Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits),
[API usage guidelines](https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_API_Usage_Guidelines).

## Decision: Model uncertain commercial data explicitly

**Rationale**: Wikivoyage content is useful for discovery and source links but does not
reliably provide structured, current prices, child age bands, opening calendars, or
transit routes for every attraction. The domain model therefore distinguishes free,
known, estimated, and unknown values.

**Alternatives considered**:

- Infer missing values from prose or nearby attractions: unsafe and prohibited by the
  specification.
- Exclude all incomplete attractions: loses useful recommendations and conflicts with
  the requirement to allow unknown-cost selections.

## Decision: Use static-host CSP and HTTPS deployment controls

**Rationale**: A browser-only project cannot set HTTP response headers itself. The
  deployment configuration must set HTTPS redirects and a CSP allowing only the
  application origin and required Wikimedia endpoints. The plan does not invent a
  server implementation.

**Alternatives considered**:

- Meta-tag-only CSP: weaker than response headers and cannot replace hosting policy.
- No CSP: conflicts with the security requirements.

## Decision: Use browser-side SQLite for the local Bangkok database

**Rationale**: `database.sql` is loaded and executed by SQL.js in the user's browser.
This keeps the static GitHub Pages deployment backend-free while providing structured
attraction, child-price, closure, and public-transportation data for Bangkok.

**Alternatives considered**:

- A server-side SQLite endpoint: provides the same data but requires paid or managed
  hosting and would not fit the static deployment.
- Fetching a SQLite binary: requires a generated database artifact, whereas a SQL
  text file is transparent and simple to update.

**Security and deployment**: SQL.js uses WebAssembly. The static hosting CSP must allow
`'self'` scripts and WebAssembly compilation using `wasm-unsafe-eval` or a compatible
development allowance. The SQL text file is public static data, not an authentication
boundary.
