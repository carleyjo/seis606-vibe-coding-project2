import test from "node:test";
import assert from "node:assert/strict";
import { normalizeAttraction } from "../../src/domain/attraction-normalizer.js";

test("normalizes available and unavailable transportation without costs", () => {
  const available = normalizeAttraction({
    title: "Museum",
    transportation: { modes: ["bus"], routeNotes: "Take route 1", sourceUrl: "https://example.test/transit" }
  });
  const unavailable = normalizeAttraction({ title: "Park" });
  assert.equal(available.transportation.status, "available");
  assert.deepEqual(available.transportation.modes, ["bus"]);
  assert.equal(unavailable.transportation.status, "unavailable");
  assert.equal(Object.hasOwn(available.transportation, "fare"), false);
});
