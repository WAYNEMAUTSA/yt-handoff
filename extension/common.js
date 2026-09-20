const DEFAULT_EXPIRY_HOURS = 6;

async function getConfig() {
  const stored = await chrome.storage.sync.get(["databaseURL", "secret", "expiryHours"]);
  return {
    databaseURL: (stored.databaseURL || "").replace(/\/+$/, ""),
    secret: stored.secret || "",
    expiryHours: typeof stored.expiryHours === "number" ? stored.expiryHours : DEFAULT_EXPIRY_HOURS,
  };
}

function isConfigured(config) {
  return Boolean(config.databaseURL && config.secret);
}

function entryUrl(config) {
  return `${config.databaseURL}/nowplaying/${config.secret}.json`;
}

async function fetchEntry(config) {
  const res = await fetch(entryUrl(config));
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return await res.json();
}

async function deleteEntry(config) {
  await fetch(entryUrl(config), { method: "DELETE" });
}

function isExpired(entry, expiryHours) {
  if (!entry || !entry.ts) return true;
  return (Date.now() - entry.ts) > expiryHours * 60 * 60 * 1000;
}

function buildWatchUrl(entry) {
  const params = new URLSearchParams();
  if (entry.list) {
    params.set("list", entry.list);
    if (typeof entry.index === "number" && entry.index >= 0) {
      params.set("index", String(entry.index + 1));
    }
  }
  if (typeof entry.t === "number" && entry.t > 0) {
    const REWIND_BUFFER_SECONDS = 8;
    const adjustedT = Math.max(0, Math.floor(entry.t) - REWIND_BUFFER_SECONDS);
    params.set("t", `${adjustedT}s`);
  }
  const base = `https://www.youtube.com/watch?v=${encodeURIComponent(entry.videoId)}`;
  const extra = params.toString();
  return extra ? `${base}&${extra}` : base;
}

function timeAgo(ts) {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.floor(minutes / 60)} hr ago`;
}
