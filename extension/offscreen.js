let currentEventSource = null;

async function start() {
  const config = await new Promise((resolve) => {
    chrome.storage.sync.get(["databaseURL", "secret"], resolve);
  });
  if (!config.databaseURL || !config.secret) return;

  if (currentEventSource) currentEventSource.close();

  const url = `${config.databaseURL.replace(/\/+$/, "")}/nowplaying/${config.secret}.json`;
  currentEventSource = new EventSource(url);

  currentEventSource.addEventListener("put", (e) => {
    try {
      const payload = JSON.parse(e.data);
      if (payload && payload.data && payload.data.videoId) {
        chrome.runtime.sendMessage({ type: "nowplaying-live", entry: payload.data });
      }
    } catch (err) {
      console.warn("Bad event payload", err);
    }
  });

  currentEventSource.onerror = () => {
    // Auto-reconnects on its own; nothing to do here.
  };
}

start();