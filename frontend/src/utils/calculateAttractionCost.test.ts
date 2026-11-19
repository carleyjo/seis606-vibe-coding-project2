import { describe, expect, it } from 'vitest';
import { calculateAttractionCost } from './calculateAttractionCost';

describe('calculateAttractionCost', () => {
  it('calculates total cost for 2 adults and 3 children', () => {
    expect(calculateAttractionCost(20, 10, 2, 3)).toBe(70);
  });

  it('calculates total cost for 1 adult and 1 child', () => {
    expect(calculateAttractionCost(25, 15, 1, 1)).toBe(40);
  });

  it('calculates total cost for 2 adults and no children', () => {
    expect(calculateAttractionCost(25, 15, 2, 0)).toBe(50);
  });
});
