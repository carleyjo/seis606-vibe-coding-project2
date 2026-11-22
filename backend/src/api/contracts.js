export const API_ERROR_CODES = Object.freeze({
  INVALID_INPUT: "INVALID_INPUT",
  SOURCE_UNAVAILABLE: "SOURCE_UNAVAILABLE",
  STORAGE_UNAVAILABLE: "STORAGE_UNAVAILABLE",
  SELECTION_INVALID: "SELECTION_INVALID"
});

export function errorResponse(code, message, details = []) {
  return { error: { code, message, details } };
}
