importScripts("common.js");
async function ensureOffscreen() {
  const existing = await chrome.offscreen.hasDocument?.();
  if (existing) return;
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["BLOBS"],
    justification: "Keep a live connection to Firebase for instant notifications",
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "nowplaying-live") {
    handleLiveEntry(msg.entry);
  }
});

async function handleLiveEntry(entry) {
  const config = await getConfig();
  if (isExpired(entry, config.expiryHours)) return;

  await chrome.storage.local.set({ latestEntry: entry });
  const { lastNotifiedTs } = await chrome.storage.local.get(["lastNotifiedTs"]);
  if (lastNotifiedTs === entry.ts) return;

  await chrome.storage.local.set({ lastNotifiedTs: entry.ts });
  notify(entry);
}

const ALARM_NAME = "poll-nowplaying";
const NOTIFICATION_ID = "continue-watching";

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
  ensureOffscreen();
  poll();
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
  ensureOffscreen();
  poll();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) poll();
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === "poll-now") {
    poll().then(() => sendResponse({ ok: true }));
    return true;
  }
});

async function poll() {
  const config = await getConfig();
  if (!isConfigured(config)) return;

  let entry;
  try {
    entry = await fetchEntry(config);
  } catch (e) {
    console.warn("Could not reach Firebase", e);
    return;
  }

  if (!entry || !entry.videoId) {
    await chrome.storage.local.remove(["latestEntry"]);
    return;
  }

  if (isExpired(entry, config.expiryHours)) {
    await chrome.storage.local.remove(["latestEntry"]);
    deleteEntry(config).catch(() => {});
    return;
  }

  await chrome.storage.local.set({ latestEntry: entry });

  const { lastNotifiedTs } = await chrome.storage.local.get(["lastNotifiedTs"]);
  if (lastNotifiedTs === entry.ts) return;

  await chrome.storage.local.set({ lastNotifiedTs: entry.ts });
  notify(entry);
}

function notify(entry) {
  chrome.notifications.create(NOTIFICATION_ID, {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Continue watching on this device?",
    message: entry.title || "A video",
    buttons: [{ title: "Switch here" }],
    priority: 2,
    requireInteraction: true,
  });
}

async function openEntry() {
  const { latestEntry } = await chrome.storage.local.get(["latestEntry"]);
  if (!latestEntry) return;
  chrome.tabs.create({ url: buildWatchUrl(latestEntry) });
  chrome.notifications.clear(NOTIFICATION_ID);
}

chrome.notifications.onClicked.addListener((id) => { if (id === NOTIFICATION_ID) openEntry(); });
chrome.notifications.onButtonClicked.addListener((id) => { if (id === NOTIFICATION_ID) openEntry(); });