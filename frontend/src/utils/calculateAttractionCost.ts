export interface AttractionCostInput {
  /** Admission price for one adult. */
  adultPrice: number;
  /** Admission price for one child. */
  childPrice: number;
  /** Number of adult tickets. */
  adults: number;
  /** Number of child tickets. */
  children: number;
}

/**
 * Calculates the total admission cost for a travel group.
 */
export function calculateAttractionCost({
  adultPrice,
  childPrice,
  adults,
  children,
}: AttractionCostInput): number {
  return (adultPrice * adults) + (childPrice * children);
}

export default calculateAttractionCost;
