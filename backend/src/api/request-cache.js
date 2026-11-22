export function canonicalSearchKey(search) {
  return JSON.stringify({
    city: search.city.trim().toLowerCase(),
    startDate: search.startDate,
    endDate: search.endDate,
    adultCount: search.adultCount,
    childAges: [...search.childAges].sort((a, b) => a - b),
    hasCar: search.hasCar,
    budget: search.budget
  });
}

export function createRequestCache({ storage, ttlMs = 15 * 60 * 1000, now = Date.now } = {}) {
  const entries = new Map();
  const pending = new Map();

  function get(key) {
    const entry = entries.get(key);
    if (!entry) return null;
    return { ...entry, stale: now() >= entry.expiresAt };
  }

  async function getOrFetch(key, fetcher) {
    const cached = get(key);
    if (cached && !cached.stale) return cached.value;
    if (pending.has(key)) return pending.get(key);
    const request = Promise.resolve().then(fetcher).then(value => {
      entries.set(key, {
        value,
        fetchedAt: now(),
        expiresAt: now() + ttlMs
      });
      if (storage) storage.setItem(`travel-cache:${key}`, JSON.stringify(entries.get(key)));
      return value;
    }).finally(() => pending.delete(key));
    pending.set(key, request);
    return request;
  }

  return { get, getOrFetch };
}
