import { PRICING_STATUS } from "./constants.js";

function findBand(age, bands = []) {
  return bands.find(band => age >= band.minAge && age <= band.maxAge);
}

export function calculatePricing({ adultCount, childAges }, pricing = {}) {
  if (pricing.status === PRICING_STATUS.FREE || pricing.free === true) {
    return { status: PRICING_STATUS.FREE, groupCost: 0, disclaimer: null };
  }
  if (pricing.status === PRICING_STATUS.UNKNOWN || pricing.adultPrice == null) {
    return {
      status: PRICING_STATUS.UNKNOWN,
      groupCost: null,
      disclaimer: "Admission cost is unknown; budget impact cannot be determined."
    };
  }
  const adultPrice = Number(pricing.adultPrice);
  const currency = pricing.currency || null;
  const bands = pricing.ageBands || [];
  let estimated = false;
  const childCosts = childAges.map(age => {
    const band = findBand(age, bands);
    if (band?.price != null) return Number(band.price);
    estimated = true;
    return adultPrice;
  });
  const groupCost = adultCount * adultPrice + childCosts.reduce((sum, cost) => sum + cost, 0);
  return {
    status: estimated ? PRICING_STATUS.ESTIMATED : PRICING_STATUS.KNOWN,
    groupCost,
    adultPrice,
    currency,
    childCosts,
    disclaimer: estimated ? "A missing child price was estimated using the adult price." : null
  };
}

export function isWithinBudget(pricing, budget) {
  return pricing.status === PRICING_STATUS.UNKNOWN || pricing.groupCost <= budget;
}
