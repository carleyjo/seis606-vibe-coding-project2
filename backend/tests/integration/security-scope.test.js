import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("client source contains no secrets or out-of-scope feature modules", async () => {
  const source = await readFile(new URL("../../src/domain/recommendations.js", import.meta.url), "utf8");
  assert.equal(/\b(api[_-]?key|secret|password)\b/i.test(source), false);
  assert.equal(/\b(weather|parking|directions)\b/i.test(source), false);
});
