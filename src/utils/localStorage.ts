// Server-safe: `window`/`localStorage` are unavailable during SSR. Models read
// their initial state from here at module-eval time, so this must degrade to a
// no-op (reads → null) on the server rather than throwing.
function getStorage(): Storage | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  return window.localStorage;
}

function get(key: string): any {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  try {
    return JSON.parse(storage.getItem(key));
  }
  catch (err) {
    console.error(err);
  }
  return null;
}

function set(key: string, value: any): boolean {
  const storage = getStorage();
  if (!storage) {
    return false;
  }
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  }
  catch (err) {
    console.error(err);
  }
  return false;
}

function remove(key: string): boolean {
  const storage = getStorage();
  if (storage) {
    storage.removeItem(key);
    return true;
  }
  return false;
}

export default {
  get,
  set,
  remove,
};
