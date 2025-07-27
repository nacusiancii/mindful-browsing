// --- Default State ---
// Load default state from public JSON file
let loadDefaultState = async () => {
  try {
    const response = await fetch(chrome.runtime.getURL("default.json"));
    return await response.json();
  } catch (error) {
    console.error("Failed to load default state:", error);
    return {}; // Fallback to empty object
  }
};

const defaultState = await loadDefaultState();

// Export for React app compatibility
export { defaultState };
