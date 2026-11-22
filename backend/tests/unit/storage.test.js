import test from "node:test";
import assert from "node:assert/strict";
import { createLocalTripStore } from "../../src/storage/local-trip-store.js";

function storage() {
  const data = new Map();
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key)
  };
}

test("saves, loads, and clears local trip state", () => {
  const store = createLocalTripStore(storage());
  assert.equal(store.save({ selections: ["1"] }), true);
  assert.deepEqual(store.load(), { selections: ["1"] });
  assert.equal(store.clear(), true);
  assert.equal(store.load(), null);
});

test("returns null for malformed or unavailable storage", () => {
  const broken = { getItem: () => "{", setItem: () => { throw new Error("blocked"); }, removeItem: () => { throw new Error("blocked"); } };
  const store = createLocalTripStore(broken);
  assert.equal(store.load(), null);
  assert.equal(store.save({}), false);
  assert.equal(store.clear(), false);
  assert.equal(createLocalTripStore(null).load(), null);
});
