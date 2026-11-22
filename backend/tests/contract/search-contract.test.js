import test from "node:test";
import assert from "node:assert/strict";
import { errorResponse, API_ERROR_CODES } from "../../src/api/contracts.js";

test("exposes documented search error shapes", () => {
  const response = errorResponse(API_ERROR_CODES.INVALID_INPUT, "Invalid search.", ["city"]);
  assert.deepEqual(response, {
    error: { code: "INVALID_INPUT", message: "Invalid search.", details: ["city"] }
  });
});
