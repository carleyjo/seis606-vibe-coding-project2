import { createRateLimiter, retryDelay } from "./rate-limit.js";
import { createRequestCache } from "./request-cache.js";

const API_URL = "https://en.wikivoyage.org/w/api.php";
const WIKIVOYAGE_BASE_URL = "https://en.wikivoyage.org/wiki/";

export function buildApiUrl(params = {}) {
  const url = new URL(API_URL);
  const query = {
    format: "json",
    formatversion: "2",
    origin: "*",
    ...params
  };
  Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  return url;
}

async function requestJson(url, fetchImpl, { maxAttempts = 3 } = {}) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(url);
      if (response.ok) return response.json();
      const error = new Error(`Wikivoyage request failed: ${response.status}`);
      error.retryAfter = response.headers?.get?.("retry-after");
      if (response.status < 500 && response.status !== 429) throw error;
      if (attempt === maxAttempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, retryDelay(error, attempt)));
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, retryDelay(error, attempt)));
    }
  }
  throw new Error("Wikivoyage request failed");
}

function getSection(wikitext, sectionName) {
  const heading = new RegExp(`^==\\s*${sectionName}\\s*==\\s*$`, "im");
  const match = heading.exec(wikitext);
  if (!match) return "";
  const sectionStart = match.index + match[0].length;
  const rest = wikitext.slice(sectionStart);
  const nextSection = /^==\s*[^=].*?==\s*$/m.exec(rest);
  return rest.slice(0, nextSection ? nextSection.index : rest.length);
}

function parseSeeSection(wikitext) {
  const section = getSection(wikitext, "See");
  const attractions = [];
  const templates = section.matchAll(/\{\{\s*see\b([\s\S]*?)\n\s*\}\}/gi);
  for (const match of templates) {
    const fields = {};
    const fieldPattern = /(?:^|\|)\s*([a-z][\w]*)\s*=\s*([\s\S]*?)(?=\s+\|\s*[a-z][\w]*\s*=|$)/gi;
    for (const field of match[1].matchAll(fieldPattern)) {
      fields[field[1].toLowerCase()] = field[2].trim();
    }
    const nameMatch = fields.name?.match(/\[\[([^|\]]+)/);
    const target = nameMatch?.[1]?.trim();
    const name = fields.name?.replace(/\[\[[^|\]]+\|?([^\]]*)\]\]/, "$1").trim();
    if (!target || !name) continue;
    const pageTitle = target.split("#")[0];
    const fragment = target.includes("#") ? `#${target.split("#").slice(1).join("#")}` : "";
    const articleUrl = `${WIKIVOYAGE_BASE_URL}${encodeURIComponent(pageTitle.replaceAll(" ", "_"))}${fragment}`;
    const price = fields.price?.toLowerCase() || "";
    attractions.push({
      pageid: fields.wikidata || `${pageTitle}#${name}`,
      title: name,
      extract: fields.content?.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2").replace(/\[\[([^\]]+)\]\]/g, "$1").trim() || null,
      fullurl: articleUrl,
      coordinates: fields.lat && fields.long ? { lat: Number(fields.lat), lon: Number(fields.long) } : null,
      pricing: /\bfree|no charge|gratis\b/.test(price) ? { free: true } : { status: "unknown" },
      opening: { status: "unknown" },
      transportation: null
    });
  }
  if (attractions.length === 0) {
    const cityTitle = wikitext.match(/^#?\s*([^=\n]+?)\s*$/m)?.[1]?.trim() || "Wikivoyage";
    for (const line of section.split("\n")) {
      const listing = line.match(/^\*\s+(?:'''([^']+)'''|\[\[([^|\]]+)(?:\|([^\]]+))?\]\])\.?\s*(.*)$/);
      if (!listing) continue;
      const target = listing[2] || cityTitle;
      const name = (listing[1] || listing[3] || target).trim();
      const description = listing[4]
        .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
        .replace(/\[\[([^\]]+)\]\]/g, "$1")
        .replace(/'''|''/g, "")
        .trim();
      attractions.push({
        pageid: `${target}#${name}`,
        title: name,
        extract: description || null,
        fullurl: `${WIKIVOYAGE_BASE_URL}${encodeURIComponent(target.replaceAll(" ", "_"))}`,
        coordinates: null,
        pricing: { status: "unknown" },
        opening: { status: "unknown" },
        transportation: null
      });
    }
  }
  return attractions;
}

function parseTemplateFields(template) {
  const fields = {};
  const fieldPattern = /(?:^|\|)\s*([a-z][\w]*)\s*=\s*([\s\S]*?)(?=\s+\|\s*[a-z][\w]*\s*=|$)/gi;
  for (const field of template.matchAll(fieldPattern)) fields[field[1].toLowerCase()] = field[2].trim();
  return fields;
}

function parsePrice(priceText = "") {
  const text = priceText.trim();
  if (!text) return { status: "unknown" };
  if (/\bfree|no charge|gratis\b/i.test(text)) return { free: true };
  const amount = text.match(/(?:[$€£]\s*)?(\d+(?:[.,]\d{1,2})?)/);
  if (!amount) return { status: "unknown" };
  const adultPrice = Number(amount[1].replace(",", "."));
  const currency = text.match(/[$€£]/)?.[0] || null;
  const ageBands = [...text.matchAll(/(?:[$€£]\s*)?(\d+(?:[.,]\d{1,2})?)\s+for\s+age\s+(\d+)\s*-\s*(\d+)/gi)]
    .map(match => ({
      minAge: Number(match[2]),
      maxAge: Number(match[3]),
      price: Number(match[1].replace(",", "."))
    }));
  return { adultPrice, ageBands, currency };
}

function parseAttractionDetail(wikitext, attraction) {
  const fragment = decodeURIComponent(attraction.fullurl.split("#")[1] || "");
  const templates = [...wikitext.matchAll(/\{\{\s*see\b[\s\S]*?\n\s*\}\}/gi)];
  const match = templates.find(item => {
    const fields = parseTemplateFields(item[0]);
    return (fragment && fields.wikidata === fragment)
      || fields.name?.toLowerCase().includes(attraction.title.toLowerCase())
      || fields.alt?.toLowerCase().includes(attraction.title.toLowerCase());
  });
  if (!match) return {};
  const fields = parseTemplateFields(match[0]);
  return {
    pricing: parsePrice(fields.price),
    opening: fields.hours ? { hours: fields.hours, status: "unknown" } : { status: "unknown" },
    transportation: fields.directions ? { details: fields.directions } : null,
    officialUrl: fields.url || null,
    description: fields.content || attraction.description
  };
}

export function createWikivoyageClient({
  fetchImpl = globalThis.fetch,
  cache = createRequestCache(),
  limiter = createRateLimiter()
} = {}) {
  if (typeof fetchImpl !== "function") throw new Error("A fetch implementation is required");

  const query = params => limiter(() => requestJson(buildApiUrl(params), fetchImpl));

  async function searchCity(city) {
    const key = `city:${city.trim().toLowerCase()}`;
    return cache.getOrFetch(key, () => query({
      action: "query",
      list: "search",
      srsearch: city.trim(),
      srlimit: 50
    }));
  }

  async function getSeeAttractions(city) {
    const key = `see:${city.trim().toLowerCase()}`;
    return cache.getOrFetch(key, async () => {
      const response = await query({
        action: "parse",
        page: city.trim(),
        prop: "wikitext"
      });
      return { attractions: parseSeeSection(response.parse?.wikitext || "") };
    });
  }

  async function getPages(titles) {
    const key = `pages:${[...titles].sort().join("|")}`;
    return cache.getOrFetch(key, () => query({
      action: "query",
      prop: "extracts|coordinates|info|pageimages",
      exintro: 1,
      explaintext: 1,
      inprop: "url",
      titles: titles.join("|")
    }));
  }

  async function getAttractionDetails(attractions) {
    const details = await Promise.all(attractions.map(async attraction => {
      const pageTitle = decodeURIComponent(attraction.fullurl.split("/wiki/")[1]?.split("#")[0] || attraction.title);
      const response = await query({ action: "parse", page: pageTitle, prop: "wikitext" });
      return { ...attraction, ...parseAttractionDetail(response.parse?.wikitext || "", attraction) };
    }));
    return details;
  }

  return { searchCity, getSeeAttractions, getAttractionDetails, getPages };
}

export { parseAttractionDetail, parseSeeSection };
