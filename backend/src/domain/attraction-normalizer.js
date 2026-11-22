import { PRICING_STATUS, TRANSPORT_STATUS } from "./constants.js";

export function normalizeAttraction(raw = {}) {
  const page = raw.page || raw;
  const title = page.title || page.name || "Unnamed attraction";
  const localSql = page.sqlData != null;
  const articleUrl = page.fullurl || page.articleUrl || (localSql
    ? null
    : `https://en.wikivoyage.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`);
  const rawPricing = page.pricing || {};
  const pricing = rawPricing.free
    ? { status: PRICING_STATUS.FREE, free: true }
    : rawPricing.status === PRICING_STATUS.UNKNOWN || rawPricing.adultPrice == null
      ? { status: PRICING_STATUS.UNKNOWN }
      : { ...rawPricing, status: rawPricing.status || PRICING_STATUS.KNOWN };
  const transport = page.transportation || null;
  return {
    id: String(page.pageid || page.id || title.toLowerCase().replaceAll(/\s+/g, "-")),
    name: title,
    description: page.extract || page.description || null,
    articleUrl,
    officialUrl: page.officialUrl || null,
    coordinates: page.coordinates || null,
    pricing,
    opening: page.opening || { status: "unknown" },
    sqlData: page.sqlData || null,
    transportation: transport
      ? { status: TRANSPORT_STATUS.AVAILABLE, ...transport, sourceUrl: transport.sourceUrl || articleUrl }
      : { status: TRANSPORT_STATUS.UNAVAILABLE, sourceUrl: articleUrl },
    source: {
      provider: localSql ? "Local SQL" : "Wikivoyage",
      articleUrl,
      retrievedAt: new Date().toISOString(),
      license: "CC BY-SA 4.0",
      freshnessStatus: "fresh"
    }
  };
}
