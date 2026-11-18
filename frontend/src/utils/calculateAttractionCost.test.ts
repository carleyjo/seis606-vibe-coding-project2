import { calculateAttractionCost } from './calculateAttractionCost';

describe('calculateAttractionCost', () => {
  it('calculates adult and child admission together', () => {
    expect(calculateAttractionCost({
      adultPrice: 18,
      childPrice: 12,
      adults: 2,
      children: 1,
    })).toBe(48);
  });

  it('calculates adult-only admission', () => {
    expect(calculateAttractionCost({
      adultPrice: 20,
      childPrice: 10,
      adults: 3,
      children: 0,
    })).toBe(60);
  });

  it('calculates child-only admission', () => {
    expect(calculateAttractionCost({
      adultPrice: 25,
      childPrice: 8,
      adults: 0,
      children: 2,
    })).toBe(16);
  });

  it('returns zero for a free attraction with no visitors', () => {
    expect(calculateAttractionCost({
      adultPrice: 0,
      childPrice: 0,
      adults: 0,
      children: 0,
    })).toBe(0);
  });
});
