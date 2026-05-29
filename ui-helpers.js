/**
 * UI HELPERS
 * General utility functions for the Foromane UI.
 */

function getFallbackImage(mode) {
    if (mode === 'offline') {
        return 'assets/media/offline-mode-image.png';
    }
    return 'assets/media/no_link.png';
}

window.getFallbackImage = getFallbackImage;
