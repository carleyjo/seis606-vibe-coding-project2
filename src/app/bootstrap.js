import { createWikivoyageClient } from "../api/wikivoyage-client.js";
import { searchRecommendations } from "../domain/recommendations.js";
import { addSelection, createSelectionState, removeSelection } from "../domain/selections.js";
import { createLocalTripStore } from "../storage/local-trip-store.js";

export function createTravelApp(options = {}) {
  const client = options.client || createWikivoyageClient(options);
  const app = {
    client,
    tripStore: options.tripStore || createLocalTripStore(options.storage),
    search: input => searchRecommendations(input, client)
  };
  app.createSelectionState = createSelectionState;
  app.addSelection = addSelection;
  app.removeSelection = removeSelection;
  return app;
}
