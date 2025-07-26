/**
 * @file background/config/defaults.js
 * @description Defines the default state for the extension. This is used on first installation
 * to populate chrome.storage with initial values.
 */

export const defaultState = {
  mindfulSites: [],
  settings: {
    enabled: true,
    showStats: true,
    gentleReminders: true,
    soundEnabled: false,
    pauseDuration: 30, // in seconds
    reflectionDelay: 20, // in seconds
    darkMode: false,
  },
  reflectionPrompts: [
    "How are you feeling right now?",
    "What brought you here in this moment?",
    "Is this aligned with your intentions for today?",
  ],
  mindfulBreaks: [
    { id: "meditate", label: "Meditate", enabled: true },
    { id: "walk", label: "Take a walk", enabled: true },
    { id: "tea", label: "Make tea/coffee", enabled: true },
    { id: "read", label: "Read something", enabled: true },
    { id: "organize", label: "Organize space", enabled: true },
    { id: "todos", label: "Check todos", enabled: true },
    { id: "projects", label: "Review old projects", enabled: true },
    { id: "connect", label: "Connect with loved ones", enabled: true },
  ],
  activityLog: [],
};
