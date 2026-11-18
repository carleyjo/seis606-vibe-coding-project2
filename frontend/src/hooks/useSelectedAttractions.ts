import { useState } from 'react';
import type { SelectedAttraction } from '../components/SelectedAttractionsPanel';

export interface UseSelectedAttractionsResult {
  /** Attractions currently selected by the user. */
  selectedAttractions: SelectedAttraction[];
  /** Error shown after an add attempt for an already-selected attraction. */
  duplicateError: string | null;
  /** Adds an attraction unless its id is already selected. */
  addAttraction: (attraction: SelectedAttraction) => boolean;
  /** Removes an attraction by id. */
  removeAttraction: (attractionId: SelectedAttraction['id']) => void;
  /** Clears the current duplicate error message. */
  clearDuplicateError: () => void;
}

export function useSelectedAttractions(): UseSelectedAttractionsResult {
  const [selectedAttractions, setSelectedAttractions] = useState<SelectedAttraction[]>([]);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const addAttraction = (attraction: SelectedAttraction): boolean => {
    if (selectedAttractions.some((selected) => selected.id === attraction.id)) {
      setDuplicateError(`${attraction.name} is already in your trip plan.`);
      return false;
    }

    setSelectedAttractions((currentAttractions) => [...currentAttractions, attraction]);
    setDuplicateError(null);
    return true;
  };

  const removeAttraction = (attractionId: SelectedAttraction['id']) => {
    setSelectedAttractions((currentAttractions) =>
      currentAttractions.filter((attraction) => attraction.id !== attractionId),
    );
  };

  const clearDuplicateError = () => {
    setDuplicateError(null);
  };

  return {
    selectedAttractions,
    duplicateError,
    addAttraction,
    removeAttraction,
    clearDuplicateError,
  };
}
