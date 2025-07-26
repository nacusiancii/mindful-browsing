/**
* @file background/handlers/messageHandler.js
* @description Handles runtime messages between extension components (popup, options, content scripts).
*/

import { getState, setState } from './storage.js';
import { logActivity } from './activityLogger.js';

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
            action: 'continued_mindfully',
            intention,
        });
        chrome.tabs.update(tabId, { url: targetSite });
    },

    async tookMindfulBreak({ targetSite, breakActivity, tabId }) {
        await logActivity({
            site: new URL(targetSite).hostname,
            timestamp: Date.now(),
            action: 'took_break',
            breakActivity,
        });
    }
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

export default addMessageListener;
