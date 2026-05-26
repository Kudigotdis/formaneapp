/**
 * MODE CONTROLLER
 * Manages the application's Tri-State mode (Online, Offline, Saved).
 */

export const WIROG_MODES = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    SAVED: 'saved'
};

let currentMode = localStorage.getItem('wirog_app_mode') || WIROG_MODES.SAVED;

/**
 * Updates the application mode and syncs the UI toggle group.
 * @param {string} mode - One of WIROG_MODES
 */
export const setAppMode = (mode) => {
    if (!Object.values(WIROG_MODES).includes(mode)) {
        console.error(`Invalid Mode: ${mode}`);
        return;
    }

    currentMode = mode;
    localStorage.setItem('wirog_app_mode', mode);

    // Update UI Toggle Buttons
    const buttons = {
        [WIROG_MODES.ONLINE]: document.querySelector('.btn-mode-online'),
        [WIROG_MODES.OFFLINE]: document.querySelector('.btn-mode-offline'),
        [WIROG_MODES.SAVED]: document.querySelector('.btn-mode-saved')
    };

    // Remove active class from all and add to current
    Object.values(buttons).forEach(btn => btn?.classList.remove('active'));
    
    if (buttons[mode]) {
        buttons[mode].classList.add('active');
    }

    console.log(`App Mode set to: ${mode}`);
    
    // Dispatch custom event for other modules to react (optional)
    window.dispatchEvent(new CustomEvent('wirogModeChanged', { detail: { mode } }));
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    setAppMode(currentMode);
});
