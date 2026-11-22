const USERS_KEY = "travel-attraction-planner:users:v1";
const CURRENT_USER_KEY = "travel-attraction-planner:current-user:v1";

export function createLocalAuthStore(storage = globalThis.localStorage) {
  const available = storage && typeof storage.getItem === "function";

  return {
    async register(username, password) {
      const normalizedUsername = normalizeUsername(username);
      validateCredentials(normalizedUsername, password);
      const users = readUsers(storage, available);
      if (users.some(user => user.username.toLowerCase() === normalizedUsername.toLowerCase())) {
        throw new Error("That username is already in use.");
      }
      users.push({ username: normalizedUsername, passwordHash: await hashPassword(password) });
      writeUsers(storage, users);
      setCurrentUser(storage, normalizedUsername);
      return normalizedUsername;
    },
    async login(username, password) {
      const normalizedUsername = normalizeUsername(username);
      validateCredentials(normalizedUsername, password);
      const users = readUsers(storage, available);
      const user = users.find(item => item.username.toLowerCase() === normalizedUsername.toLowerCase());
      if (!user || user.passwordHash !== await hashPassword(password)) {
        throw new Error("Username or password is incorrect.");
      }
      setCurrentUser(storage, user.username);
      return user.username;
    },
    currentUser() {
      if (!available) return null;
      try {
        return storage.getItem(CURRENT_USER_KEY);
      } catch {
        return null;
      }
    },
    logout() {
      if (!available) return false;
      try {
        storage.removeItem(CURRENT_USER_KEY);
        return true;
      } catch {
        return false;
      }
    }
  };
}

function normalizeUsername(username) {
  return typeof username === "string" ? username.trim() : "";
}

function validateCredentials(username, password) {
  if (username.length < 2) throw new Error("Username must be at least 2 characters.");
  if (typeof password !== "string" || password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
}

async function hashPassword(password) {
  const bytes = new globalThis.TextEncoder().encode(password);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function readUsers(storage, available) {
  if (!available) return [];
  try {
    const value = storage.getItem(USERS_KEY);
    const users = value ? JSON.parse(value) : [];
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function writeUsers(storage, users) {
  storage.setItem(USERS_KEY, JSON.stringify(users));
}

function setCurrentUser(storage, username) {
  storage.setItem(CURRENT_USER_KEY, username);
}
