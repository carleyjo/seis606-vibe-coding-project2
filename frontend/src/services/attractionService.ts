import { useCallback, useState } from 'react';
import type { TripSearchRequest } from '../types/TripSearchRequest';

export interface Attraction {
  id: string | number;
  name: string;
  description: string;
  adultPrice: number | null;
  childPrice: number | null;
  openDates: string[];
  transportationInfo: string;
  source: string;
}

interface AttractionSearchResponse {
  attractions: Attraction[];
}

export interface AttractionSearchState {
  attractions: Attraction[];
  isLoading: boolean;
  error: string | null;
}

export interface UseAttractionSearchResult extends AttractionSearchState {
  search: (request: TripSearchRequest) => Promise<void>;
  clearError: () => void;
}

const searchEndpoint = '/api/attractions/search';

function isAttraction(value: unknown): value is Attraction {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const attraction = value as Partial<Attraction>;
  return (
    (typeof attraction.id === 'string' || typeof attraction.id === 'number') &&
    typeof attraction.name === 'string' &&
    typeof attraction.description === 'string' &&
    (typeof attraction.adultPrice === 'number' || attraction.adultPrice === null) &&
    (typeof attraction.childPrice === 'number' || attraction.childPrice === null) &&
    Array.isArray(attraction.openDates) &&
    attraction.openDates.every((date) => typeof date === 'string') &&
    typeof attraction.transportationInfo === 'string' &&
    typeof attraction.source === 'string'
  );
}

function parseAttractions(payload: unknown): Attraction[] {
  const attractions = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === 'object' &&
        'attractions' in payload &&
        Array.isArray((payload as AttractionSearchResponse).attractions)
      ? (payload as AttractionSearchResponse).attractions
      : null;

  if (!attractions || !attractions.every(isAttraction)) {
    throw new Error('The attraction service returned an invalid response.');
  }

  return attractions;
}

/**
 * Searches the attraction API for results matching the supplied trip request.
 */
export async function searchAttractions(
  request: TripSearchRequest,
  signal?: AbortSignal,
): Promise<Attraction[]> {
  const response = await fetch(searchEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Attraction search failed with status ${response.status}.`);
  }

  return parseAttractions(await response.json());
}

/**
 * Provides loading, error, and result state for attraction searches.
 */
export function useAttractionSearch(): UseAttractionSearchResult {
  const [state, setState] = useState<AttractionSearchState>({
    attractions: [],
    isLoading: false,
    error: null,
  });

  const search = useCallback(async (request: TripSearchRequest) => {
    setState((currentState) => ({
      ...currentState,
      isLoading: true,
      error: null,
    }));

    try {
      const attractions = await searchAttractions(request);
      setState({ attractions, isLoading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to search attractions.';
      setState((currentState) => ({
        ...currentState,
        isLoading: false,
        error: message,
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState((currentState) => ({ ...currentState, error: null }));
  }, []);

  return { ...state, search, clearError };
}
