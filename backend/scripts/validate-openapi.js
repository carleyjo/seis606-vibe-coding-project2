import { readFile } from "node:fs/promises";

const document = await readFile("specs/001-travel-attraction-planner/contracts/openapi.yaml", "utf8");
for (const required of ["openapi: 3.0.3", "  /searches:", "  /selections:", "TripSearch:", "SelectionState:"]) {
  if (!document.includes(required)) throw new Error(`OpenAPI contract is missing ${required}`);
}
