/**
 * This demonstrates how your extension pieces communicate
 * Think of this as the "glue" between your components
 */

// === SCENARIO 1: User visits a mindful site ===
// 1. Navigation Handler detects the site
// 2. Redirects to mindful-pause.html with parameters
// 3. MindfulPause page needs to read these parameters and communicate back

// Current flow in navigationHandler.js:
// const redirectUrl = `${pauseUrl}?target=${encodeURIComponent(details.url)}&tabId=${details.tabId}`;

// === SCENARIO 2: MindfulPause page communicates ===
// The MindfulPause component needs to:
// 1. Read URL parameters (target site, tab ID)
// 2. Send messages to background when user continues
// 3. Handle the actual redirect

// Example of what MindfulPause needs to add:

// In MindfulPause component:
const getUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        targetSite: urlParams.get('target'),
        tabId: parseInt(urlParams.get('tabId'))
    };
};

const handleContinue = async (intention) => {
    const { targetSite, tabId } = getUrlParams();
    
    // Send message to background service
    const response = await chrome.runtime.sendMessage({
        action: 'proceedToSite',
        payload: { targetSite, intention, tabId }
    });
    
    if (response.success) {
        console.log('Successfully redirected to site');
    }
};

// === SCENARIO 3: Popup/Options pages communicate ===
// These pages need to:
// 1. Get current state from background
// 2. Save updated settings
// 3. Update the extension behavior

// Example popup communication:
const loadSettings = async () => {
    const state = await chrome.runtime.sendMessage({ action: 'getInitialData' });
    return state;
};

const saveSettings = async (newSettings) => {
    const response = await chrome.runtime.sendMessage({
        action: 'saveState',
        payload: newSettings
    });
    return response.success;
};

// === SCENARIO 4: Background service responds ===
// Your messageHandler.js already handles these messages perfectly!
// It routes them to the right functions and returns responses