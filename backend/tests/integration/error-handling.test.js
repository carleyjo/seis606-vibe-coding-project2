import test from "node:test";
import assert from "node:assert/strict";
import { createWikivoyageClient } from "../../src/api/wikivoyage-client.js";
import { searchRecommendations } from "../../src/domain/recommendations.js";

test("surfaces source failure after retries", async () => {
  const client = createWikivoyageClient({
    fetchImpl: async () => ({ ok: false, status: 400, headers: { get: () => null } }),
    limiter: operation => operation()
  });
  await assert.rejects(() => client.searchCity("Unavailable"), /request failed/);
});

test("source failure is not converted into successful recommendations", async () => {
  await assert.rejects(
    () => searchRecommendations({
      city: "London", startDate: "2026-12-01", endDate: "2026-12-02",
      adultCount: 1, childAges: [], hasCar: false, budget: 10
    }, { searchCity: async () => { throw new Error("source unavailable"); } }, {
      today: new Date("2026-11-16T00:00:00")
    }),
    /source unavailable/
  );
});
