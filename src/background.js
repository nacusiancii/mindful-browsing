/**
 * @file background.js
 * @description The main service worker for the Mindful Browsing extension.
 * It initializes the extension, sets up listeners, and orchestrates the different modules.
 */

const SCHEMA_VERSIONS = {
  LOCAL: {
    LOG_ACTIVITY: 1,
    BASE: 0
  },
  SYNC: {
    BASE: 0
  }
}
const LOCAL_SCHEMA_VERSION = SCHEMA_VERSIONS.LOCAL.LOG_ACTIVITY;
const SYNC_SCHEMA_VERSION = SCHEMA_VERSIONS.SYNC.BASE;
let isMigrationRunning = false;

const isSchemaMigrationNeeded = (localState, syncState) => 
  localState?.localSchemaVersion < LOCAL_SCHEMA_VERSION || syncState?.syncSchemaVersion < SYNC_SCHEMA_VERSION;

const promisifyChromeStorage = (storageObj, methodName, ...args) =>
  new Promise((resolve,reject) => storageObj[methodName](...args, (...cbArgs)=>{
    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);

    if (cbArgs.length === 0) return resolve();
    if (cbArgs.length === 1) return resolve(cbArgs[0]);
    return resolve(cbArgs);
  }));

// --- Session Bypass Map ---
/**
 * Map to track session bypasses for tabId + hostname combinations with timestamps.
 * This prevents infinite loops when redirecting to mindful pause pages and allows
 * refreshing within a session window.
 * Should be cleaned up periodically to prevent memory leaks.
 * @type {Map<string, number>}
 */
const SESSION_BYPASS = new Map();
const BYPASS_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes
const cleanupExpiredBypasses = () => {
  const currentTime = Date.now();
  for (const [key, timestamp] of SESSION_BYPASS.entries()) {
    if (currentTime - timestamp >= BYPASS_EXPIRATION_TIME) {
      SESSION_BYPASS.delete(key);
    }
  }
};

// --- Storage Utilities ---
/**
 * Retrieves state from chrome.storage.sync.
 * @param {string|string[]|null} keys - A key or array of keys to retrieve. If null, retrieves the entire state.
 * @returns {Promise<object>} A promise that resolves with the retrieved state object.
 */
const getState = (keys = null) => 
  promisifyChromeStorage(chrome.storage.sync, 'get', keys);

/**
 * Updates the state in chrome.storage.sync.
 * @param {object} newState - An object containing the key-value pairs to update.
 * @returns {Promise<void>} A promise that resolves when the state has been updated.
 */
const setState = (newState) =>
  promisifyChromeStorage(chrome.storage.sync, 'set', newState);

/**
 * Retrieves state from chrome.storage.local.
 * @param {string|string[]|null} keys - A key or array of keys to retrieve. If null, retrieves the entire state.
 * @returns {Promise<object>} A promise that resolves with the retrieved state object.
 */
const getLocalState = (keys = null) =>
  promisifyChromeStorage(chrome.storage.local, 'get', keys);

/**
 * Updates the state in chrome.storage.local.
 * @param {object} newState - An object containing the key-value pairs to update.
 * @returns {Promise<void>} A promise that resolves when the state has been updated.
 */
const setLocalState = (newState) =>
  promisifyChromeStorage(chrome.storage.local, 'set', newState);

// Run cleanup every 2 minutes
setInterval(cleanupExpiredBypasses, 2 * 60 * 1000);

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

// --- Data Migration ---
/**
 * Migrates activityLog from chrome.storage.sync to chrome.storage.local.
 * This function is idempotent and safe to run multiple times.
 * @returns {Promise<boolean>} True if migration was performed, false if not needed
 */
const migrateActivityLogData = () => {
  const performMigration = () => Promise.all([
    getState('activityLog'),
    getLocalState('activityLog')
  ]).then(([syncData, localData]) => [
      ...(syncData?.activityLog || []), 
      ...(localData?.activityLog || [])
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 1000))
    .then((finalActivityLog) => setLocalState({ activityLog: finalActivityLog }))
    .then(() => promisifyChromeStorage(chrome.storage.sync, 'remove', ['activityLog']))
    .then(() => setLocalState({ localSchemaVersion: SCHEMA_VERSIONS.LOCAL.LOG_ACTIVITY }))
    .then(() => {
      console.log("Activity log migration completed successfully");
      return true;
    })
    .catch((error) => {
      console.error("Failed to migrate activity log data:", error);
      return false;
    });

  return getLocalState('localSchemaVersion')
    .then((localState) => localState?.localSchemaVersion || SCHEMA_VERSIONS.LOCAL.BASE)
    .catch(() => SCHEMA_VERSIONS.LOCAL.BASE) // default to 0 if localSchemaVersion fetch fails
    .then((localSchemaVersion) => localSchemaVersion < SCHEMA_VERSIONS.LOCAL.LOG_ACTIVITY)
    .then((shouldMigrate) => {
      if (shouldMigrate) {
        console.log("Starting activity log data migration...");
        return performMigration();
      }
      console.log("Activity log migration not needed, skipping...");
      return false;
    })
    .catch((error) => {
      console.error("Failed to check migration status:", error);
      return false;
    });
};

// since only migration as of now, directly calling that migration function
const performMigrations = () => {
  if (isMigrationRunning) return;
  isMigrationRunning = true;
  migrateActivityLogData()
    .finally(() => isMigrationRunning = false);
};

// --- Activity Logger ---
/**
 * Logs a new activity to the activityLog in chrome.storage.local.
 * @param {object} activity - The activity object to log.
 * @prop {string} activity.site - The site the activity relates to.
 * @prop {number} activity.timestamp - The timestamp of the activity.
 * @prop {string} activity.action - The type of action taken (e.g., 'continued_mindfully', 'took_break').
 * @prop {string} [activity.intention] - The user's stated intention, if applicable.
 * @prop {string} [activity.breakActivity] - The chosen break activity, if applicable.
 */
const logActivity = async (activity) => {
  try {
    const { activityLog } = await getLocalState("activityLog");
    const newLog = [activity, ...(activityLog || [])].slice(0, 1000);
    await setLocalState({ activityLog: newLog });
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
      // Check for session bypass
      const bypassKey = `${details.tabId}_${url.hostname}`;
      const bypassTimestamp = SESSION_BYPASS.get(bypassKey);

      if (bypassTimestamp) {
        // Check if bypass is still valid (within 5-minute window)
        const currentTime = Date.now();
        if (currentTime - bypassTimestamp < BYPASS_EXPIRATION_TIME) {
          // Allow navigation to proceed without removing the bypass
          return;
        } else {
          // Bypass has expired, remove it
          SESSION_BYPASS.delete(bypassKey);
        }
      }

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
const messageHandlers = {
  async getInitialData() {
    return {
      ...(await getState()),
      ...(await getLocalState()),
    };
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

    // Add session bypass with timestamp before updating the tab URL
    const bypassKey = `${tabId}_${new URL(targetSite).hostname}`;
    SESSION_BYPASS.set(bypassKey, Date.now());

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
      const handler = messageHandlers[message.action];
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
  } else if (details.reason === "update") {
    console.log("Extension updated, checking for data migration...");
    Promise.all([getLocalState('localSchemaVersion'), getState('syncSchemaVersion')])
      .then(([localState, syncState]) => {
        if (isSchemaMigrationNeeded(localState, syncState)) {
          performMigrations();
        }
      })
      .catch((error) => console.error("Failed to execute schema migration:", error));
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
      .then((defaultState) => setState({...defaultState, 
        syncSchemaVersion: SYNC_SCHEMA_VERSION}))
      .then(() => getLocalState())
      .then((localState) => setLocalState({
        ...localState, localSchemaVersion: LOCAL_SCHEMA_VERSION}))
      .catch((error) => console.error("Failed to set default state:", error));
  } else {
    Promise.all([getLocalState('localSchemaVersion'), getState('syncSchemaVersion')])
      .then(([localState, syncState]) => {
        if (isSchemaMigrationNeeded(localState, syncState)) {
          performMigrations();
        }
      })
      .catch((error) => console.error("Failed to execute schema migration:", error));
  }
});
