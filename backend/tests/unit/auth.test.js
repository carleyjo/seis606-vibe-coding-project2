import test from "node:test";
import assert from "node:assert/strict";
import { createLocalAuthStore } from "../../src/storage/local-auth-store.js";

function storage() {
  const data = new Map();
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key)
  };
}

test("registers and logs in a username without storing the password directly", async () => {
  const auth = createLocalAuthStore(storage());
  assert.equal(await auth.register("Alex", "secure-pass"), "Alex");
  assert.equal(auth.currentUser(), "Alex");
  auth.logout();
  assert.equal(await auth.login("alex", "secure-pass"), "Alex");
});

test("rejects duplicate users and incorrect credentials", async () => {
  const auth = createLocalAuthStore(storage());
  await auth.register("Alex", "secure-pass");
  await assert.rejects(() => auth.register("alex", "another-pass"), /already in use/);
  await assert.rejects(() => auth.login("Alex", "wrong-pass"), /incorrect/);
});
