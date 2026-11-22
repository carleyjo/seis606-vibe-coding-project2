const STORAGE_KEY = "travel-attraction-planner:trip:v1";

export function createLocalTripStore(storage = globalThis.localStorage) {
  const available = storage && typeof storage.getItem === "function";
  return {
    save(value) {
      if (!available) return false;
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    load() {
      if (!available) return null;
      try {
        const value = storage.getItem(STORAGE_KEY);
        return value ? JSON.parse(value) : null;
      } catch {
        return null;
      }
    },
    clear() {
      if (!available) return false;
      try {
        storage.removeItem(STORAGE_KEY);
        return true;
      } catch {
        return false;
      }
    }
  };
}
