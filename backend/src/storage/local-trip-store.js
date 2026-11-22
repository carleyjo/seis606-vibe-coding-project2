const STORAGE_KEY = "travel-attraction-planner:trip:v1";
const SAVED_TRIPS_KEY = "travel-attraction-planner:saved-trips:v1";

export function createLocalTripStore(storage = globalThis.localStorage, username = null) {
  const available = storage && typeof storage.getItem === "function";
  const tripKey = username
    ? `${STORAGE_KEY}:${encodeURIComponent(username)}`
    : STORAGE_KEY;
  const savedTripsKey = username
    ? `${SAVED_TRIPS_KEY}:${encodeURIComponent(username)}`
    : null;
  return {
    save(value) {
      if (!available) return false;
      try {
        storage.setItem(tripKey, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    load() {
      if (!available) return null;
      try {
        const value = storage.getItem(tripKey);
        return value ? JSON.parse(value) : null;
      } catch {
        return null;
      }
    },
    clear() {
      if (!available) return false;
      try {
        storage.removeItem(tripKey);
        return true;
      } catch {
        return false;
      }
    },
    saveNamed(name, value) {
      if (!available || !savedTripsKey) return false;
      try {
        const trips = readSavedTrips(storage, savedTripsKey);
        trips.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name, value });
        storage.setItem(savedTripsKey, JSON.stringify(trips));
        return true;
      } catch {
        return false;
      }
    },
    listNamed() {
      return !available || !savedTripsKey ? [] : readSavedTrips(storage, savedTripsKey);
    },
    loadNamed(id) {
      return this.listNamed().find(trip => trip.id === id) || null;
    },
    deleteNamed(id) {
      if (!available || !savedTripsKey) return false;
      try {
        const trips = readSavedTrips(storage, savedTripsKey);
        storage.setItem(savedTripsKey, JSON.stringify(trips.filter(trip => trip.id !== id)));
        return true;
      } catch {
        return false;
      }
    }
  };
}

function readSavedTrips(storage, key) {
  try {
    const value = storage.getItem(key);
    const trips = value ? JSON.parse(value) : [];
    return Array.isArray(trips) ? trips : [];
  } catch {
    return [];
  }
}
