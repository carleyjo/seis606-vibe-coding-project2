import { createTravelApp } from "./bootstrap.js";

const demoAttractions = [
  {
    pageid: "demo-museum",
    title: "City Museum",
    extract: "A sample museum for testing group pricing.",
    fullurl: "https://en.wikivoyage.org/",
    opening: { openDates: ["2026-12-01"] },
    pricing: { adultPrice: 18, ageBands: [{ minAge: 0, maxAge: 12, price: 8 }, { minAge: 13, maxAge: 17, price: 12 }] }
  },
  {
    pageid: "demo-park",
    title: "Riverside Park",
    extract: "A free sample attraction.",
    fullurl: "https://en.wikivoyage.org/",
    opening: { openDates: ["2026-12-01"] },
    pricing: { free: true }
  },
  {
    pageid: "demo-unknown",
    title: "Historic Market",
    extract: "A sample attraction with unknown admission cost.",
    fullurl: "https://en.wikivoyage.org/",
    opening: { openDates: ["2026-12-01"] },
    pricing: { status: "unknown" }
  }
];

const demoClient = {
  searchCity: async () => ({ query: { search: demoAttractions.map(item => ({ title: item.title })) } }),
  getPages: async () => ({ query: { pages: demoAttractions } })
};

const app = createTravelApp();
let selectionState = null;
let currentResults = [];

const form = document.querySelector("#search-form");
const results = document.querySelector("#results");
const message = document.querySelector("#message");
const selected = document.querySelector("#selected");
const budgetSummary = document.querySelector("#budget-summary");
const demoButton = document.querySelector("#demo-button");

function getInput() {
  return {
    city: document.querySelector("#city").value,
    startDate: document.querySelector("#start-date").value,
    endDate: document.querySelector("#end-date").value,
    adultCount: Number(document.querySelector("#adults").value),
    childAges: document.querySelector("#child-ages").value
      .split(",").map(value => value.trim()).filter(Boolean).map(Number),
    hasCar: document.querySelector("#has-car").checked,
    budget: Number(document.querySelector("#budget").value)
  };
}

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = type;
}

function renderSelection() {
  selected.innerHTML = "";
  if (!selectionState || selectionState.selections.length === 0) {
    selected.textContent = "No attractions selected.";
    budgetSummary.textContent = "";
    return;
  }
  selectionState.selections.forEach(attraction => {
    const item = document.createElement("li");
    item.textContent = attraction.name;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      selectionState = app.removeSelection(selectionState, attraction.id);
      app.tripStore.save(selectionState);
      renderSelection();
    });
    item.append(remove);
    selected.append(item);
  });
  budgetSummary.textContent = selectionState.aggregateStatus === "unknown"
    ? "Selected total: unknown (an attraction has an unknown cost)."
    : `Selected total: $${selectionState.knownTotal.toFixed(2)} | Remaining: $${selectionState.remainingBudget.toFixed(2)}`;
}

function renderResults() {
  results.innerHTML = "";
  currentResults.forEach(attraction => {
    const card = document.createElement("article");
    card.className = "card";
    const currency = attraction.pricing.currency || "$";
    const price = attraction.pricing.groupCost == null
      ? "Unknown cost"
      : `${currency}${attraction.pricing.groupCost.toFixed(2)}`;
    const heading = document.createElement("h3");
    heading.textContent = attraction.name;
    const description = document.createElement("p");
    description.textContent = attraction.description || "No description available.";
    const cost = document.createElement("p");
    cost.innerHTML = "<strong>Group cost:</strong> ";
    cost.append(price);
    if (attraction.sqlData?.datesClosed) {
      const closedDates = document.createElement("p");
      closedDates.innerHTML = `<strong>Closed dates:</strong> ${attraction.sqlData.datesClosed}`;
      card.append(closedDates);
    }
    if (attraction.sqlData?.daysOfWeekClosed) {
      const closedDays = document.createElement("p");
      closedDays.innerHTML = `<strong>Closed days:</strong> ${attraction.sqlData.daysOfWeekClosed}`;
      card.append(closedDays);
    }
    const childAges = getInput().childAges;
    if (attraction.sqlData?.childPriceNote
      && attraction.sqlData.childAgeLimit != null
      && childAges.some(age => age <= attraction.sqlData.childAgeLimit)) {
      const childNote = document.createElement("p");
      childNote.innerHTML = `<strong>Child price:</strong> ${attraction.sqlData.childPriceNote}`;
      card.append(childNote);
    }
    if (attraction.transportation?.status === "available" && attraction.transportation.details) {
      const transport = document.createElement("p");
      transport.innerHTML = `<strong>Public transport:</strong> ${attraction.transportation.details}`;
      card.append(transport);
    }
    const disclaimer = document.createElement("p");
    disclaimer.className = "muted";
    disclaimer.textContent = attraction.pricing.disclaimer || "Source: Wikivoyage";
    card.append(heading, description, cost, disclaimer);
    if (attraction.articleUrl) {
      const link = document.createElement("a");
      link.href = attraction.articleUrl;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = "View source";
      card.append(link);
    } else {
      const source = document.createElement("p");
      source.className = "muted";
      source.textContent = "Source: Local SQL";
      card.append(source);
    }
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Add to trip";
    button.addEventListener("click", () => {
      try {
        selectionState = app.addSelection(selectionState, attraction);
        app.tripStore.save(selectionState);
        renderSelection();
        showMessage(`${attraction.name} added.`, "success");
      } catch (error) {
        showMessage(error.message, "error");
      }
    });
    card.append(button);
    results.append(card);
  });
}

async function runSearch(client = app.client) {
  try {
    const input = getInput();
    selectionState = app.createSelectionState(input.budget);
    const result = await app.search(input, client);
    currentResults = result.results;
    renderResults();
    renderSelection();
    showMessage(result.noResults ? "No matching attractions found." : `${result.results.length} attractions found.`, result.noResults ? "error" : "success");
  } catch (error) {
    currentResults = [];
    renderResults();
    showMessage(error.message, "error");
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  runSearch();
});

demoButton.addEventListener("click", () => {
  document.querySelector("#start-date").value = "2026-12-01";
  document.querySelector("#end-date").value = "2026-12-01";
  runSearch(demoClient);
});

const saved = app.tripStore.load();
if (saved) {
  selectionState = saved;
  renderSelection();
}
