/**
 * Search criteria submitted when looking for attractions.
 */
export interface TripSearchRequest {
  /** Destination city where the traveler wants to find attractions. */
  city: string;

  /** Trip start date in ISO 8601 date format (YYYY-MM-DD). */
  startDate: string;

  /** Trip end date in ISO 8601 date format (YYYY-MM-DD). */
  endDate: string;

  /** Number of adult travelers in the group. */
  adults: number;

  /** Number of child travelers in the group. */
  children: number;

  /** Total attraction budget for the travel group, in the chosen currency. */
  budget: number;

  /** Whether the travel group has access to a car. */
  hasCar: boolean;
}
