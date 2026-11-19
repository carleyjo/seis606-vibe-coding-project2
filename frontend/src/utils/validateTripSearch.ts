export interface TripSearchValidationInput {
  city: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  budget: number;
}

export interface TripSearchValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTripSearch({
  city,
  adults,
  budget,
}: TripSearchValidationInput): TripSearchValidationResult {
  const errors: string[] = [];

  if (!city.trim()) {
    errors.push('City cannot be empty');
  }

  if (adults < 1) {
    errors.push('At least one adult traveler is required');
  }

  if (budget < 0) {
    errors.push('Budget must be non-negative');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
