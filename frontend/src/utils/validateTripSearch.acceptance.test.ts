import { describe, expect, it } from 'vitest';
import { validateTripSearch } from './validateTripSearch';

// This acceptance test verifies the contract's business rule from the user's
// perspective: a trip search cannot proceed unless at least one adult travels.
describe('Trip search acceptance', () => {
  it('rejects a search with no adult travelers', () => {
    const result = validateTripSearch({
      city: 'Orlando',
      startDate: '2026-12-01',
      endDate: '2026-12-05',
      adults: 0,
      children: 2,
      budget: 500,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('At least one adult traveler is required');
  });

  it('allows a search with at least one adult traveler', () => {
    const result = validateTripSearch({
      city: 'Orlando',
      startDate: '2026-12-01',
      endDate: '2026-12-05',
      adults: 1,
      children: 0,
      budget: 500,
    });

    expect(result.valid).toBe(true);
  });
});
