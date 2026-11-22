export function validateTripSearch(input, today = new Date()) {
  const errors = [];
  const city = typeof input?.city === "string" ? input.city.trim() : "";
  if (!city) errors.push("City is required.");
  const start = new Date(`${input?.startDate}T00:00:00`);
  const end = new Date(`${input?.endDate}T00:00:00`);
  const todayDate = new Date(today);
  todayDate.setHours(0, 0, 0, 0);
  if (!Number.isFinite(start.getTime()) || !input?.startDate) errors.push("Start date is invalid.");
  if (!Number.isFinite(end.getTime()) || !input?.endDate) errors.push("End date is invalid.");
  if (Number.isFinite(start.getTime()) && start < todayDate) errors.push("Start date cannot be in the past.");
  if (Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && end < start) {
    errors.push("End date must be on or after start date.");
  }
  if (!Number.isInteger(input?.adultCount) || input.adultCount < 1) errors.push("At least one adult is required.");
  if (!Array.isArray(input?.childAges) || input.childAges.some(age => !Number.isInteger(age) || age < 0 || age > 17)) {
    errors.push("Child ages must be whole numbers from 0 through 17.");
  }
  if (typeof input?.hasCar !== "boolean") errors.push("Car availability is required.");
  if (typeof input?.budget !== "number" || !Number.isFinite(input.budget) || input.budget < 0) {
    errors.push("Budget must be a nonnegative number.");
  }
  return {
    valid: errors.length === 0,
    errors,
    value: { ...input, city }
  };
}
