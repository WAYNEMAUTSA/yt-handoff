let qr = null;

async function load() {
  const c = await chrome.storage.sync.get(["databaseURL", "secret", "expiryHours"]);
  document.getElementById("databaseUrl").value = c.databaseURL || "";
  document.getElementById("secret").value = c.secret || "";
  document.getElementById("expiryHours").value = c.expiryHours || 6;
  if (c.databaseURL && c.secret) renderQr(c);
}

function renderQr(config) {
  const container = document.getElementById("qrcode");
  container.innerHTML = "";
  qr = new QRCode(container, {
    text: JSON.stringify({
      databaseURL: config.databaseURL,
      secret: config.secret,
      expiryHours: config.expiryHours,
    }),
    width: 200,
    height: 200,
  });
}

document.getElementById("generate").addEventListener("click", () => {
  document.getElementById("secret").value = crypto.randomUUID();
});

document.getElementById("save").addEventListener("click", async () => {
  const databaseURL = document.getElementById("databaseUrl").value.trim();
  const secret = document.getElementById("secret").value.trim();
  const expiryHours = parseFloat(document.getElementById("expiryHours").value) || 6;

  if (!databaseURL) {
    document.getElementById("status").textContent = "Please enter your Firebase Database URL first.";
    return;
  }
  if (!databaseURL.includes("firebaseio.com")) {
    document.getElementById("status").textContent =
      "That doesn't look like a Realtime Database URL (should end in firebaseio.com). Firestore URLs won't work here.";
    return;
  }
  if (!secret) {
    document.getElementById("status").textContent = "Please enter or generate a secret room code.";
    return;
  }

  const config = { databaseURL, secret, expiryHours };
  await chrome.storage.sync.set(config);
  document.getElementById("status").textContent = "Saved.";
  renderQr(config);
});

document.getElementById("test").addEventListener("click", async () => {
  const status = document.getElementById("status");
  const config = {
    databaseURL: document.getElementById("databaseUrl").value.trim().replace(/\/+$/, ""),
    secret: document.getElementById("secret").value.trim(),
  };
  if (!isConfigured(config)) {
    status.textContent = "Fill in both fields first.";
    return;
  }
  status.textContent = "Testing...";
  try {
    const res = await fetch(entryUrl(config));
    if (res.status === 401 || res.status === 403) {
      status.textContent = "Permission denied - check your Firebase Rules allow read/write on the 'nowplaying' path.";
      return;
    }
    if (!res.ok) {
      status.textContent = `Firebase responded with an error (status ${res.status}). Double-check the Database URL.`;
      return;
    }
    status.textContent = "Connected successfully.";
  } catch (e) {
    status.textContent = "Could not reach that address. Check your internet connection and that the URL starts with https://";
  }
});

load();