/* ════════════════════════════════════════════════════════
   FOROMANE AUTH - Authentication & account management
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
    localStorage.setItem('foromane_userId', account.id);
    UserState.business = null;
    UserState.kpi = { ads: 0, views: 0, likes: 0, noteAdds: 0 };
    UserState.interests = [];
    enterApp();
    renderPromos();
    updateAccountHero();
    resetBusinessCard();
    updateKPI();
    updateAccountUI();
    reloadNotesForUser();
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
      if (!ForomaneDB.db) {
        errorEl.textContent = 'Database unavailable. Try again.';
        errorEl.style.display = 'block';
        return;
      }

      const allCreds = await ForomaneDB.getAll('credentials');
      const credEntry = allCreds.find(c => c.credential === credential);
      if (!credEntry) {
        errorEl.textContent = 'No account found with that email/phone.';
        errorEl.style.display = 'block';
        return;
      }

      const profile = await ForomaneDB.get('profiles', credEntry.profileId);
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
    const firstName = document.getElementById('id-firstname').value.trim();
    const surname = document.getElementById('id-surname').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const town = document.getElementById('loc-town').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const errorEl = document.getElementById('register-error');
    errorEl.style.display = 'none';

    if (!firstName || !surname) {
      errorEl.textContent = 'Please enter your first name and surname.';
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

    const photoPreview = document.getElementById('reg-photo-preview');
    const photo = photoPreview && photoPreview.src ? photoPreview.src : '';

    try {
      if (!ForomaneDB.db) {
        errorEl.textContent = 'Database unavailable. Try again.';
        errorEl.style.display = 'block';
        return;
      }

      const id = 'user_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const name = firstName + ' ' + surname;
      const initials = (firstName[0] + surname[0]).toUpperCase();
      const color = window.APP_COLORS[initials.charCodeAt(0) % window.APP_COLORS.length];
      const role = 'General User';

      const profile = {
        id, firstName, surname, name, role, town, email, password, initials, color, photo,
        username: UserState.username || localStorage.getItem('foromane_username') || '',
        dateOfBirth: UserState.dateOfBirth || localStorage.getItem('foromane_dob') || '',
        gender: UserState.gender || localStorage.getItem('foromane_gender') || '',
        nationality: UserState.nationality || localStorage.getItem('foromane_nationality') || '',
        race: UserState.race || localStorage.getItem('foromane_race') || '',
        contacts: UserState.contacts || JSON.parse(localStorage.getItem('foromane_contacts') || '{"mobiles":[],"whatsapps":[],"social":{}}'),
        location: UserState.location || JSON.parse(localStorage.getItem('foromane_location') || '{"town":"","area":""}'),
        interests: UserState.interests || JSON.parse(localStorage.getItem('foromane_interests') || '[]')
      };

      await ForomaneDB.put('profiles', profile);
      try {
        if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') {
          await window.SyncQueue.enqueue('profiles', profile, { clientId: id });
          if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{});
        }
      } catch(e) { console.warn('Failed to enqueue profile for sync:', e); }

      if (email) {
        const cred = { id: 'cred_email_' + email, credential: email, profileId: id };
        await ForomaneDB.put('credentials', cred);
        try { if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') { await window.SyncQueue.enqueue('credentials', cred, { clientId: id }); if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{}); } } catch(e) { console.warn('Failed to enqueue credential (email) for sync:', e); }
      }
      const phone = document.getElementById('reg-phone').value.trim();
      if (phone) {
        const cred2 = { id: 'cred_phone_' + phone, credential: phone, profileId: id };
        await ForomaneDB.put('credentials', cred2);
        try { if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') { await window.SyncQueue.enqueue('credentials', cred2, { clientId: id }); if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{}); } } catch(e) { console.warn('Failed to enqueue credential (phone) for sync:', e); }
      }

      closeModal('register-modal');
      this.switchToProfile(profile);

      try {
        if (window.DriveAPI && typeof window.DriveAPI.isSignedIn === 'function' && window.DriveAPI.isSignedIn()) {
          window.DriveAPI.ensureUserFolder(profile.id).catch(function(e) {
            console.warn('Failed to create Drive user folder:', e);
          });
        }
      } catch(e) { console.warn('Drive folder creation error:', e); }

      showToast('Profile created! Welcome to Foromane!');
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
    UserState.username = profile.username || '';
    UserState.dateOfBirth = profile.dateOfBirth || '';
    UserState.gender = profile.gender || '';
    UserState.nationality = profile.nationality || '';
    UserState.race = profile.race || '';
    UserState.contacts = profile.contacts || { mobiles:[], whatsapps:[], social:{} };
    UserState.location = profile.location || { town: profile.town || '', area: '' };
    UserState.interests = profile.interests || [];
    localStorage.setItem('foromane_userId', profile.id);
    if (profile.photo) localStorage.setItem('foromane_photo', profile.photo);
    localStorage.setItem('foromane_username', UserState.username);
    localStorage.setItem('foromane_dob', UserState.dateOfBirth);
    localStorage.setItem('foromane_gender', UserState.gender);
    localStorage.setItem('foromane_nationality', UserState.nationality);
    localStorage.setItem('foromane_race', UserState.race);
    UserState._persistContacts();
    UserState._persistLocation();
    UserState._persistInterests();

    UserState.kpi = { ads: 0, views: 0, likes: 0, noteAdds: 0 };
    UserState.business = null;

    // If Drive is signed in, ensure Drive folders exist
    try {
      if (window.DriveAPI && typeof window.DriveAPI.isSignedIn === 'function' && window.DriveAPI.isSignedIn()) {
        window.DriveAPI.ensureUserFolder(profile.id).catch(function(e) {
          console.warn('Failed to ensure Drive user folder:', e);
        });
      }
    } catch(e) { console.warn('Drive folder error:', e); }

    enterApp();
    renderPromos();
    updateAccountHero();
    resetBusinessCard();
    updateKPI();
    updateAccountUI();
    reloadNotesForUser();
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
    localStorage.setItem('foromane_userId', 'admin');
    UserState.business = null;
    UserState.kpi = { ads: 0, views: 0, likes: 0, noteAdds: 0 };
    UserState.interests = [];
    enterApp();
    renderPromos();
    updateAccountHero();
    resetBusinessCard();
    updateKPI();
    updateAccountUI();
    showToast('Welcome Admin');
  },

  logout() {
    UserState.clear();
    location.reload();
  }

};

window.Auth = Auth;
window.ADMIN_PASSWORD = ADMIN_PASSWORD;
