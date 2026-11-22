import { createTravelApp } from "./bootstrap.js";
import { createLocalAuthStore } from "../storage/local-auth-store.js";
import { createLocalTripStore } from "../storage/local-trip-store.js";

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
const authStore = createLocalAuthStore();
let selectionState = null;
let currentResults = [];
let currentUser = null;
let tripStore = app.tripStore;

const form = document.querySelector("#search-form");
const results = document.querySelector("#results");
const message = document.querySelector("#message");
const selected = document.querySelector("#selected");
const budgetSummary = document.querySelector("#budget-summary");
const demoButton = document.querySelector("#demo-button");
const accountForm = document.querySelector("#account-form");
const accountStatus = document.querySelector("#account-status");
const registerButton = document.querySelector("#register-button");
const logoutButton = document.querySelector("#logout-button");
const saveTripControls = document.querySelector("#save-trip-controls");
const savedTrips = document.querySelector("#saved-trips");
const savedTripList = document.querySelector("#saved-trip-list");
const tripName = document.querySelector("#trip-name");
const saveTripButton = document.querySelector("#save-trip-button");

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

function showNoResultsMessage(city) {
  message.textContent = "Wiki Voyage data unclear. Learn more about your city here: ";
  const link = document.createElement("a");
  link.href = getCityWikiVoyageUrl(city);
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = city.trim();
  message.append(link);
  message.className = "error";
}

function getCityWikiVoyageUrl(city) {
  return `https://en.wikivoyage.org/wiki/${encodeURIComponent(city.trim().replace(/\s+/g, "_"))}`;
}

function showCityWikiVoyageLink(city) {
  const cityHelp = document.querySelector("#city-help");
  cityHelp.textContent = "Learn more about your city here: ";
  const link = document.createElement("a");
  link.href = getCityWikiVoyageUrl(city);
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = city.trim();
  cityHelp.append(link);
}

function updateCityQuery(city) {
  const url = new URL(globalThis.location.href);
  if (city.trim()) {
    url.searchParams.set("city", city.trim());
  } else {
    url.searchParams.delete("city");
  }
  globalThis.history.replaceState({}, "", url);
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
      tripStore.save(selectionState);
      renderSelection();
    });
    item.append(remove);
    selected.append(item);
  });
  budgetSummary.textContent = selectionState.aggregateStatus === "unknown"
    ? "Selected total: unknown (an attraction has an unknown cost)."
    : `Selected total: $${selectionState.knownTotal.toFixed(2)} | Remaining: $${selectionState.remainingBudget.toFixed(2)}`;
}

function renderSavedTrips() {
  if (!currentUser) {
    savedTrips.hidden = true;
    savedTripList.innerHTML = "";
    return;
  }
  savedTrips.hidden = false;
  savedTripList.innerHTML = "";
  const trips = tripStore.listNamed();
  if (trips.length === 0) {
    savedTripList.textContent = "No saved trips yet.";
    return;
  }
  trips.forEach(trip => {
    const item = document.createElement("li");
    const load = document.createElement("button");
    load.type = "button";
    load.textContent = `Load ${trip.name}`;
    load.addEventListener("click", () => {
      selectionState = trip.value;
      renderSelection();
      showMessage(`${trip.name} loaded.`, "success");
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      tripStore.deleteNamed(trip.id);
      renderSavedTrips();
      showMessage(`${trip.name} deleted.`, "success");
    });
    item.append(trip.name, " ", load, " ", remove);
    savedTripList.append(item);
  });
}

function updateAccountUi() {
  const loggedIn = Boolean(currentUser);
  accountStatus.textContent = loggedIn
    ? `Logged in as ${currentUser}.`
    : "Log in or create an account to save your trips.";
  document.querySelector("#username").disabled = loggedIn;
  document.querySelector("#password").disabled = loggedIn;
  if (loggedIn) document.querySelector("#password").value = "";
  accountForm.querySelector('button[type="submit"]').hidden = loggedIn;
  registerButton.hidden = loggedIn;
  logoutButton.hidden = !loggedIn;
  saveTripControls.hidden = !loggedIn;
  renderSavedTrips();
}

function showAccountMessage(text, type = "") {
  accountStatus.textContent = text;
  accountStatus.className = type;
}

async function setLoggedInUser(username) {
  currentUser = username;
  document.querySelector("#username").value = username;
  document.querySelector("#password").value = "";
  tripStore = createLocalTripStore(localStorage, username);
  selectionState = tripStore.load();
  updateAccountUi();
  if (selectionState) renderSelection();
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
        tripStore.save(selectionState);
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
    updateCityQuery(input.city);
    selectionState = app.createSelectionState(input.budget);
    const result = await app.search(input, client);
    currentResults = result.results;
    renderResults();
    renderSelection();
    if (result.noResults) {
      showNoResultsMessage(input.city);
    } else {
      showMessage(`${result.results.length} attractions found.`, "success");
    }
    showCityWikiVoyageLink(input.city);
  } catch (error) {
    currentResults = [];
    renderResults();
    showMessage(error.message, "error");
  }
}

accountForm.addEventListener("submit", async event => {
  event.preventDefault();
  try {
    const username = await authStore.login(
      document.querySelector("#username").value,
      document.querySelector("#password").value
    );
    await setLoggedInUser(username);
    showAccountMessage(`Logged in as ${username}.`, "success");
  } catch (error) {
    showAccountMessage(error.message, "error");
  }
});

registerButton.addEventListener("click", async () => {
  try {
    const username = await authStore.register(
      document.querySelector("#username").value,
      document.querySelector("#password").value
    );
    await setLoggedInUser(username);
    showAccountMessage(`Account created. Logged in as ${username}.`, "success");
  } catch (error) {
    showAccountMessage(error.message, "error");
  }
});

logoutButton.addEventListener("click", () => {
  authStore.logout();
  currentUser = null;
  tripStore = app.tripStore;
  selectionState = null;
  renderSelection();
  updateAccountUi();
  showAccountMessage("You have been logged out.", "success");
});

saveTripButton.addEventListener("click", () => {
  const name = tripName.value.trim();
  if (!name) {
    showMessage("Enter a name for this trip.", "error");
    return;
  }
  if (!selectionState || selectionState.selections.length === 0) {
    showMessage("Add at least one attraction before saving.", "error");
    return;
  }
  if (tripStore.saveNamed(name, selectionState)) {
    tripName.value = "";
    renderSavedTrips();
    showMessage(`${name} saved.`, "success");
  } else {
    showMessage("This trip could not be saved.", "error");
  }
});

form.addEventListener("submit", event => {
  event.preventDefault();
  runSearch();
});

demoButton.addEventListener("click", () => {
  document.querySelector("#start-date").value = "2026-12-01";
  document.querySelector("#end-date").value = "2026-12-01";
  runSearch(demoClient);
});

const savedUser = authStore.currentUser();
if (savedUser) {
  setLoggedInUser(savedUser);
} else {
  selectionState = tripStore.load();
  if (selectionState) renderSelection();
}
updateAccountUi();

const queryCity = new URL(globalThis.location.href).searchParams.get("city");
if (queryCity) {
  document.querySelector("#city").value = queryCity;
  runSearch();
}
