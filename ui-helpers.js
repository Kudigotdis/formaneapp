/**
 * UI HELPERS
 * General utility functions for the Wirog UI.
 */

/**
 * Returns a fallback image path based on the current application mode.
 * @param {string} mode - The current WIROG_MODE
 * @returns {string} - Path to the fallback image
 */
export const getFallbackImage = (mode) => {
    // If specifically in OFFLINE mode, show the specialized offline placeholder
    if (mode === 'offline') {
        return 'assets/media/offline-mode-image.png';
    }

    // Default fallback for SAVED, ONLINE, or when data is simply missing
    return 'assets/media/no_link.png';
};
