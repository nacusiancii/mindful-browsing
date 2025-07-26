/**
 * @file background.js
 * @description The main service worker for the Mindful Browsing extension.
 * It initializes the extension, sets up listeners, and orchestrates the different modules.
 */

import { defaultState } from "./service/default";
import addMessageListener from "./service/messageHandler";
import addNavListener from "./service/navigationHandler";
import { setState } from "./service/storage";

// --- Installation Listener ---

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // On first install, populate storage with default state
    setState(defaultState);

    // Open the onboarding page for the user
    chrome.tabs.create({ url: "onboarding.html" });
  }
});

// --- Initialize Listeners ---

// Start listening for navigation events to intercept mindful sites
addNavListener();

// Start listening for messages from other parts of the extension
addMessageListener();

console.log("Mindful Browsing service worker started.");
