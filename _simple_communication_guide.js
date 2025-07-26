/**
 * SIMPLE COMMUNICATION GUIDE
 * How your extension pieces talk to each other
 */

// === THE MISSING PIECES ===

// 1. URL Parameter Reading (in mindful-pause page)
// When navigationHandler redirects, the URL looks like:
// chrome-extension://[extension-id]/mindful-pause.html?target=https://facebook.com&tabId=123

function readMindfulPauseParams() {
    const url = new URL(window.location.href);
    return {
        targetSite: url.searchParams.get('target'),
        tabId: parseInt(url.searchParams.get('tabId'))
    };
}

// 2. Chrome API Access (TypeScript fix)
// Add this to your mindful-pause.tsx or create types file
declare global {
    interface Window {
        chrome: any;
    }
}

// 3. Basic communication pattern
async function communicateWithBackground() {
    try {
        // Get current extension state
        const state = await chrome.runtime.sendMessage({ action: 'getInitialData' });
        console.log('Current settings:', state.settings);
        
        // Save new settings
        const newSettings = { enabled: true, delay: 30 };
        const response = await chrome.runtime.sendMessage({
            action: 'saveState',
            payload: { settings: newSettings }
        });
        
        if (response.success) {
            console.log('Settings saved!');
        }
    } catch (error) {
        console.error('Communication failed:', error);
    }
}

// === THE ACTUAL FLOW ===

// Step 1: User visits mindful site
// navigationHandler.js detects and redirects to:
// mindful-pause.html?target=https://facebook.com&tabId=123

// Step 2: MindfulPause page loads and reads parameters
// const { targetSite, tabId } = readMindfulPauseParams();

// Step 3: When user clicks "Continue"
// chrome.runtime.sendMessage({
//     action: 'proceedToSite',
//     payload: { targetSite, intention: "I want to connect with friends", tabId }
// });

// Step 4: Background receives message and redirects
// messageHandler.js -> proceedToSite handler -> chrome.tabs.update(tabId, {url: targetSite})