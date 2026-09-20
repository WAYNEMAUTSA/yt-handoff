async function render() {
  const config = await getConfig();
  const content = document.getElementById("content");

  if (!isConfigured(config)) {
    content.innerHTML = `<div class="empty">Not set up yet. Open Settings to connect Firebase.</div>`;
    return;
  }

  const { latestEntry } = await chrome.storage.local.get(["latestEntry"]);

  if (!latestEntry || isExpired(latestEntry, config.expiryHours)) {
    content.innerHTML = `<div class="empty">Nothing waiting.</div>`;
    return;
  }

  content.innerHTML = `
    <div class="card">
      <div class="title">${escapeHtml(latestEntry.title || "A video")}</div>
      <div class="meta">Shared ${timeAgo(latestEntry.ts)}</div>
      <button id="switch-btn">Switch here</button>
    </div>
  `;

  document.getElementById("switch-btn").addEventListener("click", () => {
    chrome.tabs.create({ url: buildWatchUrl(latestEntry) });
    chrome.notifications.clear("continue-watching");
    window.close();
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById("refresh").addEventListener("click", async (e) => {
  e.target.textContent = "Checking...";
  await chrome.runtime.sendMessage({ type: "poll-now" });
  await render();
  e.target.textContent = "Check now";
});

document.getElementById("open-options").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

render();
