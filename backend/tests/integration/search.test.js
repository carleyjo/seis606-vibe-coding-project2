import test from "node:test";
import assert from "node:assert/strict";
import { searchRecommendations } from "../../src/domain/recommendations.js";

test("returns open attractions within budget and unknown costs", async () => {
  const client = {
    searchCity: async () => ({ query: { search: [{ title: "Museum" }, { title: "Free Park" }, { title: "Unknown Place" }] } }),
    getPages: async () => ({
      query: {
        pages: [
          { pageid: 1, title: "Museum", fullurl: "https://example.test/museum", opening: { openDates: ["2026-12-02"] }, pricing: { adultPrice: 20 } },
          { pageid: 2, title: "Free Park", fullurl: "https://example.test/park", opening: { openDates: ["2026-12-01"] }, pricing: { free: true } },
          { pageid: 3, title: "Unknown Place", fullurl: "https://example.test/unknown", opening: { openDates: ["2026-12-01"] }, pricing: { status: "unknown" } }
        ]
      }
    })
  };
  const result = await searchRecommendations({
    city: "London", startDate: "2026-12-01", endDate: "2026-12-02",
    adultCount: 1, childAges: [], hasCar: true, budget: 25
  }, client, { today: new Date("2026-11-16T00:00:00") });
  assert.deepEqual(result.results.map(item => item.name), ["Museum", "Free Park", "Unknown Place"]);
  assert.equal(result.results[1].pricing.groupCost, 0);
  assert.equal(result.results[2].pricing.status, "unknown");
});

test("rejects invalid searches before calling the source", async () => {
  let called = false;
  await assert.rejects(
    () => searchRecommendations({
      city: "", startDate: "2026-12-01", endDate: "2026-12-02",
      adultCount: 1, childAges: [], hasCar: true, budget: 10
    }, { searchCity: async () => { called = true; }, getPages: async () => ({}) }, {
      today: new Date("2026-11-16T00:00:00")
    }),
    error => error.code === "INVALID_INPUT"
  );
  assert.equal(called, false);
});

test("returns an empty result when the city has no matching pages", async () => {
  const result = await searchRecommendations({
    city: "Nowhere", startDate: "2026-12-01", endDate: "2026-12-02",
    adultCount: 1, childAges: [], hasCar: true, budget: 10
  }, {
    searchCity: async () => ({ query: { search: [] } }),
    getPages: async () => { throw new Error("should not fetch pages"); }
  }, { today: new Date("2026-11-16T00:00:00") });
  assert.equal(result.noResults, true);
  assert.deepEqual(result.results, []);
});
