import test from "node:test";
import assert from "node:assert/strict";
import { buildApiUrl, parseAttractionDetail, parseSeeSection } from "../../src/api/wikivoyage-client.js";
import { canonicalSearchKey, createRequestCache } from "../../src/api/request-cache.js";
import { createRateLimiter } from "../../src/api/rate-limit.js";
import { createWikivoyageClient } from "../../src/api/wikivoyage-client.js";

test("builds a CORS-enabled Wikivoyage API URL", () => {
  const url = buildApiUrl({ action: "query", list: "search", srsearch: "London" });
  assert.equal(url.protocol, "https:");
  assert.equal(url.searchParams.get("origin"), "*");
  assert.equal(url.searchParams.get("srsearch"), "London");
});

test("extracts attractions from a Wikivoyage See section", () => {
  const attractions = parseSeeSection(`==See==
===Landmarks===
* {{see
| name=[[Paris/7th arrondissement#Q243|Eiffel Tower]]
| lat=48.858 | long=2.2953 | price=Free
| content=An iconic [[landmark|Paris landmark]].
}}
==Do==
`);
  assert.equal(attractions.length, 1);
  assert.equal(attractions[0].title, "Eiffel Tower");
  assert.equal(attractions[0].pricing.free, true);
  assert.equal(attractions[0].coordinates.lat, 48.858);
});

test("extracts bold bullet attractions from a Wikivoyage See section", () => {
  const attractions = parseSeeSection(`==See==
===Landmarks===
* '''Buckingham Palace'''. The London residence of the King.
* '''Tower Bridge'''. A famous bridge in London.
==Do==
`);
  assert.deepEqual(attractions.map(item => item.title), ["Buckingham Palace", "Tower Bridge"]);
});

test("extracts published price and hours from an attraction detail listing", () => {
  const detail = parseAttractionDetail(`==See==
* {{see
| name=La Tour Eiffel | alt=The Eiffel Tower
| hours=09:30-23:45
| price=€25 (€12 for age 12-24) to the top by lift.
| wikidata=Q243
}}
`, {
    title: "Eiffel Tower",
    fullurl: "https://en.wikivoyage.org/wiki/Paris/7th_arrondissement#Q243"
  });
  assert.equal(detail.pricing.adultPrice, 25);
  assert.deepEqual(detail.pricing.ageBands, [{ minAge: 12, maxAge: 24, price: 12 }]);
  assert.equal(detail.opening.hours, "09:30-23:45");
});

test("canonicalizes equivalent searches", () => {
  const a = { city: " London ", startDate: "2026-12-01", endDate: "2026-12-02", adultCount: 1, childAges: [12, 4], hasCar: false, budget: 50 };
  const b = { ...a, city: "london", childAges: [4, 12] };
  assert.equal(canonicalSearchKey(a), canonicalSearchKey(b));
});

test("deduplicates concurrent cache fetches and expires entries", async () => {
  let now = 0;
  let calls = 0;
  const cache = createRequestCache({ ttlMs: 10, now: () => now });
  const fetcher = async () => { calls += 1; return { value: calls }; };
  const [a, b] = await Promise.all([cache.getOrFetch("x", fetcher), cache.getOrFetch("x", fetcher)]);
  assert.deepEqual(a, b);
  assert.equal(calls, 1);
  now = 20;
  await cache.getOrFetch("x", fetcher);
  assert.equal(calls, 2);
});

test("queues API operations through the rate limiter", async () => {
  const run = createRateLimiter({ concurrency: 1, delayMs: 0 });
  const order = [];
  const first = run(async () => { order.push("first"); return 1; });
  const second = run(async () => { order.push("second"); return 2; });
  assert.deepEqual(await Promise.all([first, second]), [1, 2]);
  assert.deepEqual(order, ["first", "second"]);
});

test("fetches city and page data through the Wikivoyage client", async () => {
  const requests = [];
  const fetchImpl = async url => {
    requests.push(url);
    return {
      ok: true,
      json: async () => ({ query: { search: [{ title: "Museum" }], pages: [{ title: "Museum" }] } })
    };
  };
  const client = createWikivoyageClient({
    fetchImpl,
    limiter: createRateLimiter({ concurrency: 5, delayMs: 0 }),
    cache: createRequestCache()
  });
  assert.equal((await client.searchCity("London")).query.search[0].title, "Museum");
  assert.equal((await client.getPages(["Museum"])).query.pages[0].title, "Museum");
  assert.equal(requests.length, 2);
  assert.equal(new URL(requests[0]).searchParams.get("origin"), "*");
});

test("retries a transient Wikivoyage response", async () => {
  let attempts = 0;
  const client = createWikivoyageClient({
    fetchImpl: async () => {
      attempts += 1;
      if (attempts === 1) return { ok: false, status: 503, headers: { get: () => null } };
      return { ok: true, json: async () => ({ query: { search: [] } }) };
    },
    limiter: createRateLimiter({ concurrency: 5, delayMs: 0 }),
    cache: createRequestCache()
  });
  assert.deepEqual((await client.searchCity("Retry City")).query.search, []);
  assert.equal(attempts, 2);
});
