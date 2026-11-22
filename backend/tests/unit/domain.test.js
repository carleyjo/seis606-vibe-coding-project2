import test from "node:test";
import assert from "node:assert/strict";
import { validateTripSearch } from "../../src/domain/search-validation.js";
import { calculatePricing } from "../../src/domain/pricing.js";
import { isOpenOnAnySelectedDate, openingStatus } from "../../src/domain/opening.js";
import { normalizeAttraction } from "../../src/domain/attraction-normalizer.js";
import { addSelection, createSelectionState, removeSelection } from "../../src/domain/selections.js";

const today = new Date("2026-11-16T00:00:00");
const valid = {
  city: "London",
  startDate: "2026-12-01",
  endDate: "2026-12-03",
  adultCount: 2,
  childAges: [5, 14],
  hasCar: false,
  budget: 100
};

test("validates a complete trip search", () => {
  assert.equal(validateTripSearch(valid, today).valid, true);
});

test("rejects invalid trip fields", () => {
  const result = validateTripSearch({
    ...valid,
    city: " ",
    startDate: "2026-11-01",
    endDate: "2026-10-01",
    adultCount: 0,
    childAges: [-1, 18],
    hasCar: "no",
    budget: -1
  }, today);
  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 7);
});

test("calculates attraction-specific child age bands", () => {
  const pricing = calculatePricing(valid, {
    adultPrice: 20,
    ageBands: [{ minAge: 0, maxAge: 12, price: 8 }, { minAge: 13, maxAge: 17, price: 12 }]
  });
  assert.deepEqual(pricing.childCosts, [8, 12]);
  assert.equal(pricing.groupCost, 60);
  assert.equal(pricing.status, "known");
});

test("handles free, estimated, and unknown pricing", () => {
  assert.equal(calculatePricing(valid, { free: true }).groupCost, 0);
  assert.equal(calculatePricing(valid, { adultPrice: 20 }).status, "estimated");
  assert.equal(calculatePricing(valid, { status: "unknown" }).groupCost, null);
});

test("evaluates opening dates", () => {
  assert.equal(openingStatus({ openDates: ["2026-12-02"] }, ["2026-12-01", "2026-12-02"]), "open");
  assert.equal(openingStatus({ openDates: ["2026-12-05"] }, ["2026-12-01"]), "closed");
  assert.equal(openingStatus({ status: "unknown" }, ["2026-12-01"]), "unknown");
  assert.equal(isOpenOnAnySelectedDate({ status: "unknown" }, ["2026-12-01"]), true);
});

test("normalizes source records and unavailable transport", () => {
  const attraction = normalizeAttraction({ pageid: 1, title: "Museum", fullurl: "https://example.test/museum" });
  assert.equal(attraction.id, "1");
  assert.equal(attraction.source.provider, "Wikivoyage");
  assert.equal(attraction.transportation.status, "unavailable");
});

test("manages known and unknown selections", () => {
  const known = { id: "known", pricing: { status: "known", groupCost: 25 } };
  const unknown = { id: "unknown", pricing: { status: "unknown", groupCost: null } };
  let state = addSelection(createSelectionState(30), known);
  assert.equal(state.remainingBudget, 5);
  assert.throws(() => addSelection(state, known), /already selected/);
  state = addSelection(state, unknown);
  assert.equal(state.aggregateStatus, "unknown");
  assert.equal(state.remainingBudget, null);
  assert.equal(removeSelection(state, "unknown").remainingBudget, 5);
  assert.throws(() => addSelection(createSelectionState(10), { id: "expensive", pricing: { status: "known", groupCost: 11 } }), /exceeds/);
});
