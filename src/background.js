/**
 * @file background.js
 * @description The main service worker for the Mindful Browsing extension.
 * It initializes the extension, sets up listeners, and orchestrates the different modules.
 */

// --- Storage Utilities ---
/**
 * Retrieves state from chrome.storage.sync.
 * @param {string|string[]|null} keys - A key or array of keys to retrieve. If null, retrieves the entire state.
 * @returns {Promise<object>} A promise that resolves with the retrieved state object.
 */
const getState = (keys = null) =>
  new Promise((resolve) => chrome.storage.sync.get(keys, resolve));

/**
 * Updates the state in chrome.storage.sync.
 * @param {object} newState - An object containing the key-value pairs to update.
 * @returns {Promise<void>} A promise that resolves when the state has been updated.
 */
const setState = (newState) =>
  new Promise((resolve) => chrome.storage.sync.set(newState, resolve));

// --- Default State ---
// Function to load default state from JSON file
const loadDefaultState = async () => {
  try {
    const response = await fetch(chrome.runtime.getURL("default.json"));
    return await response.json();
  } catch (error) {
    console.error("Failed to load default state:", error);
    return {}; // Fallback to empty object
  }
};

// --- Activity Logger ---
/**
 * Logs a new activity to the activityLog in chrome.storage.
 * @param {object} activity - The activity object to log.
 * @prop {string} activity.site - The site the activity relates to.
 * @prop {number} activity.timestamp - The timestamp of the activity.
 * @prop {string} activity.action - The type of action taken (e.g., 'continued_mindfully', 'took_break').
 * @prop {string} [activity.intention] - The user's stated intention, if applicable.
 * @prop {string} [activity.breakActivity] - The chosen break activity, if applicable.
 */
const logActivity = async (activity) => {
  try {
    const { activityLog = [] } = await getState("activityLog");
    const newLog = [activity, ...activityLog].slice(0, 1000);
    await setState({ activityLog: newLog });
  } catch (error) {
    console.error(error);
  }
};

// --- Navigation Handler ---
const addNavListener = () =>
  chrome.webNavigation.onBeforeNavigate.addListener(handleNav, {
    url: [{ schemes: ["http", "https"] }],
  });

const handleNav = async (details) => {
  if (details.frameId !== 0) return; // Ignore sub-frames

  const { settings, mindfulSites = [] } = await getState([
    "settings",
    "mindfulSites",
  ]);

  if (!settings?.enabled) return;

  try {
    const url = new URL(details.url);
    const isMindfulSite = mindfulSites.some((site) =>
      url.hostname.includes(site)
    );

    if (isMindfulSite) {
      const pauseUrl = chrome.runtime.getURL("mindful-pause.html");
      const redirectUrl = `${pauseUrl}?target=${encodeURIComponent(
        details.url
      )}&tabId=${details.tabId}`;
      chrome.tabs.update(details.tabId, { url: redirectUrl });
    }
  } catch (error) {
    console.error("Error handling navigation:", error);
  }
};

// --- Message Handler ---
const MESSAGE_HANDLERS = {
  async getInitialData() {
    return getState();
  },

  async saveState(payload) {
    await setState(payload);
    return { success: true };
  },

  async proceedToSite({ targetSite, intention, tabId }) {
    await logActivity({
      site: new URL(targetSite).hostname,
      timestamp: Date.now(),
      action: "continued_mindfully",
      intention,
    });
    chrome.tabs.update(tabId, { url: targetSite });
  },

  async tookMindfulBreak({ targetSite, breakActivity, tabId }) {
    await logActivity({
      site: new URL(targetSite).hostname,
      timestamp: Date.now(),
      action: "took_break",
      breakActivity,
    });
  },

  async logPause({ site, timestamp, tabId }) {
    await logActivity({
      site: new URL(site).hostname,
      timestamp: timestamp || Date.now(),
      action: "took_pause",
      tabId,
    });
  },

  async getMindfulBreaks() {
    const { mindfulBreaks = [] } = await getState("mindfulBreaks");
    return mindfulBreaks;
  },
};

const addMessageListener = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
      const handler = MESSAGE_HANDLERS[message.action];
      if (!handler) {
        console.warn("Unknown message action:", message.action);
        return;
      }
      handler(message.payload, sender)
        .then((result) => sendResponse(result))
        .catch((err) => sendResponse({ success: false, error: err.message }));
    } catch (error) {
      console.error(`Error handling "${message.action}":`, error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep message channel open for async response
  });
};

// --- Installation Listener ---
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Mindful Browsing extension installed/updated", details);
  if (details.reason === "install") {
    // On first install, populate storage with default state
    loadDefaultState()
      .then((defaultState) => setState(defaultState))
      .catch((error) => console.error("Failed to set default state:", error));
    // Open the onboarding page for the user
    chrome.tabs.create({ url: "onboarding.html" });
  }
});

// --- Initialize Listeners ---
// Start listening for navigation events to intercept mindful sites
console.log("Initializing navigation listener");
addNavListener();

// Start listening for messages from other parts of the extension
console.log("Initializing message listener");
addMessageListener();

console.log("Mindful Browsing service worker started.");
// --- Initialize Default State if not present ---
getState().then((state) => {
  if (!state || Object.keys(state).length === 0) {
    console.log("No state found, initializing with default state.");
    loadDefaultState()
      .then((defaultState) => setState(defaultState))
      .catch((error) => console.error("Failed to set default state:", error));
  }
});
