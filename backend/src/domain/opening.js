export function openingStatus(opening, selectedDates) {
  if (!opening || opening.status === "unknown") return "unknown";
  const openDates = new Set(opening.openDates || []);
  return selectedDates.some(date => openDates.has(date)) ? "open" : "closed";
}

export function isOpenOnAnySelectedDate(opening, selectedDates) {
  const status = openingStatus(opening, selectedDates);
  return status === "open" || status === "unknown";
}
