export function createRateLimiter({ concurrency = 2, delayMs = 100 } = {}) {
  let active = 0;
  const queue = [];

  const drain = () => {
    while (active < concurrency && queue.length > 0) {
      const { operation, resolve, reject } = queue.shift();
      active += 1;
      Promise.resolve()
        .then(operation)
        .then(resolve, reject)
        .finally(() => {
          active -= 1;
          setTimeout(drain, delayMs);
        });
    }
  };

  return operation => new Promise((resolve, reject) => {
    queue.push({ operation, resolve, reject });
    drain();
  });
}

export function retryDelay(error, attempt) {
  const retryAfter = Number(error?.retryAfter);
  if (Number.isFinite(retryAfter) && retryAfter >= 0) {
    return retryAfter * 1000;
  }
  return Math.min(1000 * (2 ** attempt), 8000);
}
