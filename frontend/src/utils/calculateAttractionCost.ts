export function calculateAttractionCost(
  adultPrice: number,
  childPrice: number,
  adults: number,
  children: number
): number {
  return (adultPrice * adults) + (childPrice * children);
}

export default calculateAttractionCost;
