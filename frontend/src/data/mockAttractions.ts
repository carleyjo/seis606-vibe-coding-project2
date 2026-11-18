export interface MockAttraction {
  /** Stable identifier for the attraction. */
  id: number;
  /** Attraction name displayed to travelers. */
  name: string;
  /** Short description of the attraction. */
  description: string;
  /** Admission price for one adult. */
  adultPrice: number;
  /** Admission price for one child. */
  childPrice: number;
  /** Dates when the attraction is open, in YYYY-MM-DD format. */
  openDates: string[];
  /** Available transportation guidance. */
  transportationInfo: string;
  /** Source attribution for the attraction data. */
  source: string;
}

export const mockAttractions: MockAttraction[] = [
  {
    id: 1,
    name: 'Riverside Art Museum',
    description: 'Explore a rotating collection of local and international artwork.',
    adultPrice: 18,
    childPrice: 12,
    openDates: ['2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20'],
    transportationInfo: 'Bus routes 4 and 12 stop nearby.',
    source: 'TravelBuddy sample data',
  },
  {
    id: 2,
    name: 'City Botanical Garden',
    description: 'Walk through seasonal gardens, glasshouses, and peaceful trails.',
    adultPrice: 12,
    childPrice: 7,
    openDates: ['2026-11-17', '2026-11-18', '2026-11-20', '2026-11-21'],
    transportationInfo: 'Light rail Greenway stop is a five-minute walk away.',
    source: 'TravelBuddy sample data',
  },
  {
    id: 3,
    name: 'Historic Market Hall',
    description: 'Sample local flavors and browse independent makers under one roof.',
    adultPrice: 0,
    childPrice: 0,
    openDates: ['2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21'],
    transportationInfo: 'Bus routes 2 and 8 stop at Old Town.',
    source: 'TravelBuddy sample data',
  },
  {
    id: 4,
    name: 'Lakeside Science Center',
    description: 'Discover hands-on exhibits about space, nature, and engineering.',
    adultPrice: 22,
    childPrice: 14,
    openDates: ['2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21'],
    transportationInfo: 'Take the blue train line to Lakeside Station.',
    source: 'TravelBuddy sample data',
  },
  {
    id: 5,
    name: 'Heritage Theater Tour',
    description: 'Step behind the scenes at a beautifully restored historic theater.',
    adultPrice: 16,
    childPrice: 10,
    openDates: ['2026-11-17', '2026-11-19', '2026-11-21'],
    transportationInfo: 'Downtown bus and train connections are available.',
    source: 'TravelBuddy sample data',
  },
  {
    id: 6,
    name: 'Summit View Lookout',
    description: 'Take in panoramic city views from a scenic hilltop overlook.',
    adultPrice: 8,
    childPrice: 5,
    openDates: ['2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21'],
    transportationInfo: 'Shuttle bus service runs from Central Station.',
    source: 'TravelBuddy sample data',
  },
  {
    id: 7,
    name: 'Maritime History Museum',
    description: 'Learn about regional waterways through artifacts and interactive displays.',
    adultPrice: 14,
    childPrice: 8,
    openDates: ['2026-11-18', '2026-11-19', '2026-11-20'],
    transportationInfo: 'Harbor tram stop is directly outside the museum.',
    source: 'TravelBuddy sample data',
  },
  {
    id: 8,
    name: 'Riverside Walking Tour',
    description: 'Join a guided walk through the city’s landmarks and waterfront history.',
    adultPrice: 10,
    childPrice: 6,
    openDates: ['2026-11-17', '2026-11-18', '2026-11-20', '2026-11-21'],
    transportationInfo: 'Meet near the Riverside bus terminal; no train required.',
    source: 'TravelBuddy sample data',
  },
];

export default mockAttractions;
