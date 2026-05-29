/**
 * MODE CONTROLLER
 * Manages the application's Tri-State mode (Online, Offline, Saved).
 */

const FOROMANE_MODES = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    SAVED: 'saved'
};
window.FOROMANE_MODES = FOROMANE_MODES;

let currentMode = localStorage.getItem('foromane_app_mode') || FOROMANE_MODES.SAVED;

/**
 * Updates the application mode and syncs the UI toggle group.
 * @param {string} mode - One of FOROMANE_MODES
 */
const setAppMode = (mode) => {
    if (!Object.values(FOROMANE_MODES).includes(mode)) {
        console.error(`Invalid Mode: ${mode}`);
        return;
    }

    currentMode = mode;
    localStorage.setItem('foromane_app_mode', mode);

    // Update UI Toggle Buttons
    const buttons = {
        [FOROMANE_MODES.ONLINE]: document.querySelector('.btn-mode-online'),
        [FOROMANE_MODES.OFFLINE]: document.querySelector('.btn-mode-offline'),
        [FOROMANE_MODES.SAVED]: document.querySelector('.btn-mode-saved')
    };

    // Remove active class from all and add to current
    Object.values(buttons).forEach(btn => { if (btn) btn.classList.remove('active'); });
    
    if (buttons[mode]) {
        buttons[mode].classList.add('active');
    }

    console.log('App Mode set to: ' + mode);

    window.dispatchEvent(new CustomEvent('foromaneModeChanged', { detail: { mode } }));
};

window.setAppMode = setAppMode;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    setAppMode(currentMode);
});
