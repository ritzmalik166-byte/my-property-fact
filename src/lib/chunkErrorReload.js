const RELOAD_KEY = "mpf-chunk-reload-at";
const RELOAD_COOLDOWN_MS = 10000;

export function isChunkLoadError(error) {
  if (!error) return false;
  const text = `${error.name || ""} ${error.message || ""}`;
  return /ChunkLoadError|Loading chunk [\w-]+ failed|Loading CSS chunk|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    text,
  );
}

export function reloadOnChunkError(error) {
  if (typeof window === "undefined" || !isChunkLoadError(error)) return false;
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return false; // avoid reload loops
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    /* storage blocked: still reload once */
  }
  window.location.reload();
  return true;
}
