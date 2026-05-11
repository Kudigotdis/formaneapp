/* ════════════════════════════════════════════════════════
   WIROG AUTH - Authentication & account management
   ════════════════════════════════════════════════════════ */

const ADMIN_PASSWORD = 'kudigotbliss1987';

const Auth = {
  isGuest() {
    return UserState.id === 'guest';
  },

  isAdmin() {
    return UserState.role === 'Administrator';
  },

  isRealUser() {
    return UserState.id !== 'guest' && UserState.role !== 'Administrator';
  },

  async loginAsGuest() {
    const account = window.DEMO_ACCOUNTS.find(a => a.id === 'guest');
    if (!account) return;
    UserState.set(account.id, account.name, account.role, '', account.town, '');
    localStorage.setItem('wirog_userId', account.id);
    UserState.business = null;
    UserState.kpi = { ads: 0, views: 0, likes: 0, noteAdds: 0 };
    UserState.interests = [];
    updateAccountHero();
    resetBusinessCard();
    updateKPI();
    updateAccountUI();
    reloadNotesForUser();
    enterApp();
    renderPromos();
    showToast('Browsing as Guest');
  },

  async loginWithCredential() {
    const credential = document.getElementById('login-credential').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorEl = document.getElementById('login-error');
    errorEl.style.display = 'none';

    if (!credential || !password) {
      errorEl.textContent = 'Please enter your email/phone and password.';
      errorEl.style.display = 'block';
      return;
    }

    try {
      if (!WirogDB.db) {
        errorEl.textContent = 'Database unavailable. Try again.';
        errorEl.style.display = 'block';
        return;
      }

      const allCreds = await WirogDB.getAll('credentials');
      const credEntry = allCreds.find(c => c.credential === credential);
      if (!credEntry) {
        errorEl.textContent = 'No account found with that email/phone.';
        errorEl.style.display = 'block';
        return;
      }

      const profile = await WirogDB.get('profiles', credEntry.profileId);
      if (!profile) {
        errorEl.textContent = 'Account data not found.';
        errorEl.style.display = 'block';
        return;
      }

      if (profile.password !== password) {
        errorEl.textContent = 'Incorrect password.';
        errorEl.style.display = 'block';
        return;
      }

      this.switchToProfile(profile);
    } catch (e) {
      console.error('Login error:', e);
      errorEl.textContent = 'Login failed. Please try again.';
      errorEl.style.display = 'block';
    }
  },

  async register() {
    const firstName = document.getElementById('reg-firstname').value.trim();
    const surname = document.getElementById('reg-surname').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const role = document.getElementById('reg-role').value;
    const town = document.getElementById('reg-town').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const errorEl = document.getElementById('register-error');
    errorEl.style.display = 'none';

    if (!firstName || !surname) {
      errorEl.textContent = 'Please enter your first name and surname.';
      errorEl.style.display = 'block'; return;
    }
    if (!phone) {
      errorEl.textContent = 'Please enter your phone number.';
      errorEl.style.display = 'block'; return;
    }
    if (password.length < 6) {
      errorEl.textContent = 'Password must be at least 6 characters.';
      errorEl.style.display = 'block'; return;
    }
    if (password !== confirm) {
      errorEl.textContent = 'Passwords do not match.';
      errorEl.style.display = 'block'; return;
    }

    try {
      if (!WirogDB.db) {
        errorEl.textContent = 'Database unavailable. Try again.';
        errorEl.style.display = 'block';
        return;
      }

      const id = 'user_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const name = firstName + ' ' + surname;
      const initials = (firstName[0] + surname[0]).toUpperCase();
      const color = window.APP_COLORS[initials.charCodeAt(0) % window.APP_COLORS.length];

      const profile = { id, firstName, surname, name, role, town, phone, email, password, initials, color };

      await WirogDB.put('profiles', profile);
      // Enqueue profile create for background sync
      try {
        if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') {
          await window.SyncQueue.enqueue('profiles', profile, { clientId: id });
          if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{});
        }
      } catch(e) { console.warn('Failed to enqueue profile for sync:', e); }

      if (email) {
        const cred = { id: 'cred_email_' + email, credential: email, profileId: id };
        await WirogDB.put('credentials', cred);
        try { if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') { await window.SyncQueue.enqueue('credentials', cred, { clientId: id }); if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{}); } } catch(e) { console.warn('Failed to enqueue credential (email) for sync:', e); }
      }
      if (phone) {
        const cred2 = { id: 'cred_phone_' + phone, credential: phone, profileId: id };
        await WirogDB.put('credentials', cred2);
        try { if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') { await window.SyncQueue.enqueue('credentials', cred2, { clientId: id }); if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{}); } } catch(e) { console.warn('Failed to enqueue credential (phone) for sync:', e); }
      }

      closeModal('register-modal');
      this.switchToProfile(profile);
      showToast('Profile created! Welcome to Wirog!');
    } catch (e) {
      console.error('Registration error:', e);
      errorEl.textContent = 'Registration failed. Please try again.';
      errorEl.style.display = 'block';
    }
  },

  switchToProfile(profile) {
    UserState.set(profile.id, profile.name, profile.role, '', profile.town, profile.phone || '');
    UserState.firstName = profile.firstName || '';
    UserState.surname = profile.surname || '';
    localStorage.setItem('wirog_userId', profile.id);

    UserState.kpi = { ads: 0, views: 0, likes: 0, noteAdds: 0 };
    UserState.business = null;
    UserState.interests = [];

    updateAccountHero();
    resetBusinessCard();
    updateKPI();
    updateAccountUI();
    reloadNotesForUser();
    enterApp();
    renderPromos();
  },

  adminLogin() {
    const password = document.getElementById('admin-password-input').value.trim();
    const errorEl = document.getElementById('admin-pw-error');
    errorEl.style.display = 'none';

    if (password !== ADMIN_PASSWORD) {
      errorEl.textContent = 'Incorrect password.';
      errorEl.style.display = 'block';
      return;
    }

    closeModal('admin-pw-modal');
    const name = 'Admin';
    UserState.set('admin', name, 'Administrator', '', 'Gaborone', '');
    localStorage.setItem('wirog_userId', 'admin');
    UserState.business = null;
    UserState.kpi = { ads: 0, views: 0, likes: 0, noteAdds: 0 };
    UserState.interests = [];
    updateAccountHero();
    resetBusinessCard();
    updateKPI();
    updateAccountUI();
    enterApp();
    renderPromos();
    showToast('Welcome Admin');
  },

  logout() {
    UserState.clear();
    location.reload();
  }

};

window.Auth = Auth;
window.ADMIN_PASSWORD = ADMIN_PASSWORD;
