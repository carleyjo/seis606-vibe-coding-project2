import { MAX_RESULTS, SOURCE_STATUS } from "./constants.js";
import { calculatePricing, isWithinBudget } from "./pricing.js";
import { isOpenOnAnySelectedDate } from "./opening.js";
import { validateTripSearch } from "./search-validation.js";
import { normalizeAttraction } from "./attraction-normalizer.js";

function datesBetween(startDate, endDate) {
  const dates = [];
  for (let date = new Date(`${startDate}T00:00:00`); date <= new Date(`${endDate}T00:00:00`); date.setDate(date.getDate() + 1)) {
    dates.push(date.toISOString().slice(0, 10));
  }
  return dates;
}

export async function searchRecommendations(input, client, { today = new Date() } = {}) {
  const validation = validateTripSearch(input, today);
  if (!validation.valid) {
    const error = new Error(validation.errors.join(" "));
    error.code = "INVALID_INPUT";
    throw error;
  }
  let pages = client.getSeeAttractions
    ? (await client.getSeeAttractions(validation.value.city, validation.value)).attractions || []
    : await getLegacyPages(client, validation.value.city);
  if (client.getAttractionDetails && pages.length) pages = await client.getAttractionDetails(pages);
  const dates = datesBetween(validation.value.startDate, validation.value.endDate);
  const results = pages.map(normalizeAttraction)
    .map(attraction => ({
      ...attraction,
      pricing: calculatePricing(validation.value, attraction.pricing)
    }))
    .filter(attraction => isOpenOnAnySelectedDate(attraction.opening, dates))
    .filter(attraction => isWithinBudget(attraction.pricing, validation.value.budget))
    .slice(0, MAX_RESULTS);
  return {
    results,
    sourceStatus: SOURCE_STATUS.FRESH,
    search: validation.value,
    noResults: results.length === 0
  };
}

async function getLegacyPages(client, city) {
  const cityResults = await client.searchCity(city);
  const titles = (cityResults.query?.search || cityResults.search || []).map(result => result.title);
  const detailResults = titles.length ? await client.getPages(titles) : { query: { pages: [] } };
  return detailResults.query?.pages || detailResults.pages || [];
}
