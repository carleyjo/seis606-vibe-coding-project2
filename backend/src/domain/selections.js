export function createSelectionState(budget, selections = []) {
  return { budget, selections: [...selections], aggregateStatus: "known", knownTotal: 0, remainingBudget: budget };
}

export function addSelection(state, attraction) {
  if (state.selections.some(item => item.id === attraction.id)) throw new Error("Attraction is already selected.");
  const nextSelections = [...state.selections, attraction];
  const hasUnknown = nextSelections.some(item => item.pricing.status === "unknown");
  const knownTotal = nextSelections.reduce((sum, item) => sum + (item.pricing.groupCost ?? 0), 0);
  if (!hasUnknown && knownTotal > state.budget) throw new Error("Selection exceeds the budget.");
  return {
    ...state,
    selections: nextSelections,
    aggregateStatus: hasUnknown ? "unknown" : "known",
    knownTotal,
    remainingBudget: hasUnknown ? null : state.budget - knownTotal
  };
}

export function removeSelection(state, attractionId) {
  const selections = state.selections.filter(item => item.id !== attractionId);
  const hasUnknown = selections.some(item => item.pricing.status === "unknown");
  const knownTotal = selections.reduce((sum, item) => sum + (item.pricing.groupCost ?? 0), 0);
  return {
    ...state,
    selections,
    aggregateStatus: hasUnknown ? "unknown" : "known",
    knownTotal,
    remainingBudget: hasUnknown ? null : state.budget - knownTotal
  };
}
