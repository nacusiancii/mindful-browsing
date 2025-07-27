// --- Default State ---
const defaultState = {
  mindfulSites: [
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "tiktok.com",
    "youtube.com",
    "reddit.com",
    "linkedin.com",
    "snapchat.com",
    "news.google.com",
  ],
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

// For use with importScripts in background.js
// This makes defaultState available globally when the script is loaded
self.defaultState = defaultState;
