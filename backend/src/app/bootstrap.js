import { createWikivoyageClient } from "../api/wikivoyage-client.js";
import { createSqlAttractionsClient } from "../api/sql-attractions-client.js";
import { searchRecommendations } from "../domain/recommendations.js";
import { addSelection, createSelectionState, removeSelection } from "../domain/selections.js";
import { createLocalTripStore } from "../storage/local-trip-store.js";

async function getLegacyPages(client, city) {
  const cityResults = await client.searchCity(city);
  const titles = (cityResults.query?.search || cityResults.search || []).map(result => result.title);
  const detailResults = titles.length ? await client.getPages(titles) : { query: { pages: [] } };
  return detailResults.query?.pages || detailResults.pages || [];
}

export function createTravelApp(options = {}) {
  const client = options.client || createWikivoyageClient(options);
  const sqlClient = options.sqlClient || createSqlAttractionsClient();
  const hybridClient = {
    async getSeeAttractions(city, search) {
      const local = await sqlClient.getSeeAttractions(city, search);
      if (local.attractions.length) return local;
      return client.getSeeAttractions
        ? client.getSeeAttractions(city)
        : {
            attractions: (client.searchCity && client.getPages)
              ? await getLegacyPages(client, city)
              : []
          };
    },
    getAttractionDetails: client.getAttractionDetails
      ? async attractions => {
          const localAttractions = attractions.filter(attraction => attraction.fullurl == null);
          const remoteAttractions = attractions.filter(attraction => attraction.fullurl != null);
          const detailedRemoteAttractions = remoteAttractions.length
            ? await client.getAttractionDetails(remoteAttractions)
            : [];
          return [...localAttractions, ...detailedRemoteAttractions];
        }
      : undefined
  };
  const app = {
    client: hybridClient,
    tripStore: options.tripStore || createLocalTripStore(options.storage),
    search: input => searchRecommendations(input, hybridClient)
  };
  app.createSelectionState = createSelectionState;
  app.addSelection = addSelection;
  app.removeSelection = removeSelection;
  return app;
}
