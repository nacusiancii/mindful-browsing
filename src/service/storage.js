/**
 * @file background/utils/storage.js
 * @description A set of utility functions to abstract interactions with chrome.storage.sync.
 * This provides a clean and promise-based API for getting and setting extension state.
 */

/**
 * Retrieves state from chrome.storage.sync.
 * @param {string|string[]|null} keys - A key or array of keys to retrieve. If null, retrieves the entire state.
 * @returns {Promise<object>} A promise that resolves with the retrieved state object.
 */
const getState = (keys = null) => 
    new Promise(resolve => chrome.storage.sync.get(keys, resolve));


/**
 * Updates the state in chrome.storage.sync.
 * @param {object} newState - An object containing the key-value pairs to update.
 * @returns {Promise<void>} A promise that resolves when the state has been updated.
 */
const setState = newState => 
    new Promise(resolve=>chrome.storage.sync.set(newState,resolve));

export {getState,setState}