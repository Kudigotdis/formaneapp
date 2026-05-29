/* ════════════════════════════════════════════════════════
   FOROMANE STAFF - Business staff management & Join Business
   ════════════════════════════════════════════════════════ */

const PERMISSIONS = [
  { id: 'can_edit_items', label: 'Can edit items' },
  { id: 'can_add_items', label: 'Can add items' },
  { id: 'can_delete_items', label: 'Can delete items' },
  { id: 'can_manage_promos', label: 'Can manage promos' },
  { id: 'can_manage_catalogue', label: 'Can manage catalogue' },
  { id: 'can_manage_boosts', label: 'Can manage Facebook boosts' },
  { id: 'can_view_analytics', label: 'Can view analytics/KPI' }
];

function defaultPermissions() {
  const p = {};
  PERMISSIONS.forEach(perm => p[perm.id] = perm.id === 'can_edit_items');
  return p;
}

// ─── Data helpers ───

function getStaffPermKey(businessId) { return `foromane_staff_permissions_${businessId}`; }
function getPendingKey(businessId) { return `foromane_pending_staff_${businessId}`; }

function getStaffPermissions(businessId) {
  try {
    return JSON.parse(localStorage.getItem(getStaffPermKey(businessId))) || {};
  } catch { return {}; }
}

function saveStaffPermissions(businessId, perms) {
  localStorage.setItem(getStaffPermKey(businessId), JSON.stringify(perms));
}

function getPendingStaff(businessId) {
  try {
    return JSON.parse(localStorage.getItem(getPendingKey(businessId))) || [];
  } catch { return []; }
}

function savePendingStaff(businessId, pending) {
  localStorage.setItem(getPendingKey(businessId), JSON.stringify(pending));
}

function getStaffForBusiness(businessId) {
  const assoc = window.BUSINESS_ASSOCIATIONS || {};
  return Object.keys(assoc).filter(id => assoc[id].businessId === businessId && assoc[id].role === 'staff');
}

function getBusinessOwnerIds(businessId) {
  const assoc = window.BUSINESS_ASSOCIATIONS || {};
  return Object.keys(assoc).filter(id => assoc[id].businessId === businessId && assoc[id].role === 'owner');
}

function getUserProfile(userId) {
  const profiles = window.DEMO_PROFILES || [];
  const accounts = window.DEMO_ACCOUNTS || [];
  return profiles.find(p => p.id === userId) || accounts.find(a => a.id === userId) || null;
}

function getBusinessName(businessId) {
  const biz = (window.SAMPLE_BUSINESSES || []).find(b => b.id === businessId);
  return biz ? biz.name : businessId;
}

// ─── Navigation ───

window.openBusinessStaff = function(businessId, businessName) {
  document.getElementById('business-staff-content').dataset.bizId = businessId || '';
  document.getElementById('business-staff-content').dataset.bizName = businessName || '';
  renderBusinessStaff();
  goTo('view-business-staff');
};

// ─── Owner view: render staff management page ───

window.renderBusinessStaff = function() {
  const content = document.getElementById('business-staff-content');
  if (!content) return;
  const businessId = content.dataset.bizId;
  const businessName = content.dataset.bizName || 'My Business';
  if (!businessId) { content.innerHTML = '<p style="padding:20px;text-align:center;color:var(--grey-dark);">No business selected.</p>'; return; }

  const isOwner = getBusinessOwnerIds(businessId).includes(UserState.id);
  const isStaffMember = UserState.businessRole === 'staff' && getStaffForBusiness(businessId).includes(UserState.id);

  if (isStaffMember && !isOwner) {
    renderStaffView(content, businessId, businessName);
    return;
  }

  // Owner view
  const staffIds = getStaffForBusiness(businessId);
  const pendingList = getPendingStaff(businessId).filter(function(r) { return r.status !== 'rejected'; });
  const allPerms = getStaffPermissions(businessId);

  let staffHtml = staffIds.length === 0
    ? '<p style="font-size:13px;color:var(--grey-dark);padding:12px;text-align:center;">No staff members yet.</p>'
    : staffIds.map(userId => renderStaffAccordion(userId, businessId, allPerms[userId] || defaultPermissions())).join('');

  let pendingHtml = pendingList.length === 0
    ? '<p style="font-size:13px;color:var(--grey-dark);padding:12px;text-align:center;">No pending requests.</p>'
    : pendingList.map((req, idx) => renderPendingRequest(req, businessId, idx)).join('');

  content.innerHTML = `
    <div style="padding:12px;flex-shrink:0;display:flex;align-items:center;gap:12px;">
      <button class="biz-back-round" onclick="goBack()"><img src="assets/icons/solid/chevron-left_white.webp" alt="Back"></button>
      <h2 style="font-size:18px;font-weight:700;margin:0;">${businessName}</h2>
    </div>
    <div style="flex:1;overflow-y:auto;padding:0 12px 12px;">
      <h3 style="font-size:15px;font-weight:600;margin:12px 0 8px;display:flex;align-items:center;gap:6px;">
        <i class="fas fa-users" style="color:var(--orange);"></i> Staff (${staffIds.length})
      </h3>
      <div id="staff-list">${staffHtml}</div>

      ${pendingList.length > 0 ? '<hr style="border:none;border-top:1px solid var(--grey-light);margin:16px 0;">' : ''}

      <div id="pending-section" style="${pendingList.length === 0 ? 'display:none;' : ''}">
        <h3 style="font-size:15px;font-weight:600;margin:12px 0 8px;display:flex;align-items:center;gap:6px;">
          <i class="fas fa-clock" style="color:var(--orange);"></i> Pending (${pendingList.length})
        </h3>
        <div id="pending-list">${pendingHtml}</div>
      </div>
    </div>
  `;
};

function renderStaffAccordion(userId, businessId, perms) {
  const profile = getUserProfile(userId);
  const name = profile ? profile.name : userId;
  const initials = profile ? (profile.initials || name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()) : userId.slice(0, 2).toUpperCase();
  const color = profile ? (profile.color || '#888') : '#888';

  const checkedCount = PERMISSIONS.filter(p => perms[p.id]).length;
  const ownerId = getBusinessOwnerIds(businessId)[0] || 'Unknown';
  const ownerProfile = getUserProfile(ownerId);
  const ownerName = ownerProfile ? ownerProfile.name : ownerId;

  const permsHtml = PERMISSIONS.map(p => `
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;padding:4px 0;cursor:pointer;">
      <input type="checkbox" ${perms[p.id] ? 'checked' : ''} onchange="toggleStaffPerm('${userId}','${businessId}','${p.id}',this)">
      ${p.label}
    </label>
  `).join('');

  return `
    <div class="sub-accordion">
      <div class="sub-accordion-header" onclick="toggleSubAcc(this)">
        <div style="display:flex;align-items:center;gap:10px;flex:1;">
          <div class="avatar" style="width:30px;height:30px;font-size:12px;background:${color};flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;font-weight:600;">${initials}</div>
          <span style="flex:1;">${name}</span>
          <span style="font-size:11px;color:var(--grey-dark);background:var(--grey-light);padding:2px 6px;border-radius:4px;">Permissions: ${checkedCount}/${PERMISSIONS.length}</span>
        </div>
        <span class="chevron" style="font-size:10px;color:var(--grey-mid);">▼</span>
      </div>
      <div class="sub-accordion-body">
        <div style="padding:8px 0;">
          ${permsHtml}
        </div>
        <div style="font-size:11px;color:var(--grey-dark);padding:4px 0 8px;border-top:1px solid var(--grey-light);margin-top:4px;padding-top:8px;">
          Granted by: <strong>${ownerName}</strong>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn-sm" style="background:var(--orange);color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:12px;" onclick="saveStaffPerms('${userId}','${businessId}')">Save</button>
          <button class="btn-sm" style="background:#e74c3c;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:12px;" onclick="removeStaff('${userId}','${businessId}')">Remove</button>
        </div>
      </div>
    </div>
  `;
}

function renderPendingRequest(req, businessId, idx) {
  const profile = getUserProfile(req.userId);
  const name = profile ? profile.name : req.userId;
  const initials = profile ? (profile.initials || name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()) : '?';
  const color = profile ? (profile.color || '#888') : '#888';
  const date = req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : 'recently';

  return `
    <div class="sub-accordion" style="margin-bottom:8px;">
      <div class="sub-accordion-body" style="display:block;border-top:none;padding:10px 12px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="avatar" style="width:32px;height:32px;font-size:13px;background:${color};flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;font-weight:600;">${initials}</div>
          <div style="flex:1;">
            <div style="font-weight:600;font-size:14px;">${name}</div>
            <div style="font-size:11px;color:var(--grey-dark);">Requested ${date}</div>
          </div>
          <div style="display:flex;gap:6px;">
            <button class="btn-sm" style="background:var(--green, #27ae60);color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;" onclick="approveStaff(${idx},'${businessId}')">Approve</button>
            <button class="btn-sm" style="background:#e74c3c;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;" onclick="rejectStaff(${idx},'${businessId}')">Reject</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─── Staff member view ───

function renderStaffView(content, businessId, businessName) {
  const perms = getStaffPermissions(businessId)[UserState.id] || defaultPermissions();
  const checkedCount = PERMISSIONS.filter(p => perms[p.id]).length;

  const permsHtml = PERMISSIONS.map(p => `
    <div style="display:flex;align-items:center;gap:8px;font-size:13px;padding:6px 0;">
      <span style="color:${perms[p.id] ? 'var(--green, #27ae60)' : 'var(--grey-mid)'};">${perms[p.id] ? '✓' : '✗'}</span>
      ${p.label}
    </div>
  `).join('');

  content.innerHTML = `
    <div style="padding:12px;flex-shrink:0;display:flex;align-items:center;gap:12px;">
      <button class="biz-back-round" onclick="goBack()"><img src="assets/icons/solid/chevron-left_white.webp" alt="Back"></button>
      <h2 style="font-size:18px;font-weight:700;margin:0;">${businessName}</h2>
    </div>
    <div style="flex:1;overflow-y:auto;padding:0 12px 12px;">
      <div style="text-align:center;padding:20px 0;">
        <div class="avatar" style="width:48px;height:48px;font-size:20px;margin:0 auto;background:var(--orange);display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;font-weight:600;">${UserState.name ? UserState.name[0].toUpperCase() : '?'}</div>
        <h3 style="margin:8px 0 4px;">${UserState.name || 'Staff Member'}</h3>
        <p style="font-size:12px;color:var(--grey-dark);margin:0;">Staff · ${businessName}</p>
      </div>
      <div style="background:var(--grey-light);border-radius:8px;padding:12px;margin-bottom:16px;">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px;">Your Permissions (${checkedCount}/${PERMISSIONS.length})</div>
        ${permsHtml}
      </div>
      <button class="btn" style="width:100%;background:#e74c3c;color:#fff;border:none;padding:10px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;" onclick="leaveBusiness('${businessId}')">
        <i class="fas fa-sign-out-alt"></i> Leave Business
      </button>
    </div>
  `;
}

// ─── Permission actions ───

window._staffPermCache = {};

window.toggleStaffPerm = function(userId, businessId, permId, el) {
  if (!window._staffPermCache[businessId]) window._staffPermCache[businessId] = {};
  if (!window._staffPermCache[businessId][userId]) {
    const stored = getStaffPermissions(businessId);
    window._staffPermCache[businessId][userId] = { ...(stored[userId] || defaultPermissions()) };
  }
  window._staffPermCache[businessId][userId][permId] = el.checked;
};

window.saveStaffPerms = function(userId, businessId) {
  const allPerms = getStaffPermissions(businessId);
  const cached = window._staffPermCache[businessId] && window._staffPermCache[businessId][userId];
  allPerms[userId] = cached ? { ...cached } : (allPerms[userId] || defaultPermissions());
  saveStaffPermissions(businessId, allPerms);
  delete window._staffPermCache[businessId][userId];
  renderBusinessStaff();
  showToast('Permissions saved');
};

// ─── Staff management actions ───

window.approveStaff = function(idx, businessId) {
  const pending = getPendingStaff(businessId);
  const req = pending[idx];
  if (!req) return;

  // Add to BUSINESS_ASSOCIATIONS
  const assoc = window.BUSINESS_ASSOCIATIONS || {};
  assoc[req.userId] = { businessId, role: 'staff' };
  window.BUSINESS_ASSOCIATIONS = assoc;

  // Set default permissions
  const allPerms = getStaffPermissions(businessId);
  allPerms[req.userId] = defaultPermissions();
  saveStaffPermissions(businessId, allPerms);

  // Remove from pending
  pending.splice(idx, 1);
  savePendingStaff(businessId, pending);

  renderBusinessStaff();
  showToast('Staff approved');
};

window.rejectStaff = function(idx, businessId) {
  const pending = getPendingStaff(businessId);
  if (pending[idx]) {
    pending[idx].status = 'rejected';
    pending[idx].rejectedAt = Date.now();
  }
  savePendingStaff(businessId, pending);
  renderBusinessStaff();
  showToast('Request rejected');
};

window.removeStaff = function(userId, businessId) {
  if (!confirm('Remove this staff member?')) return;

  const assoc = window.BUSINESS_ASSOCIATIONS || {};
  delete assoc[userId];
  window.BUSINESS_ASSOCIATIONS = assoc;

  const allPerms = getStaffPermissions(businessId);
  delete allPerms[userId];
  saveStaffPermissions(businessId, allPerms);

  renderBusinessStaff();
  showToast('Staff removed');
};

window.leaveBusiness = function(businessId) {
  if (!confirm('Leave this business? You will lose access to its features.')) return;

  const assoc = window.BUSINESS_ASSOCIATIONS || {};
  delete assoc[UserState.id];
  window.BUSINESS_ASSOCIATIONS = assoc;

  const allPerms = getStaffPermissions(businessId);
  delete allPerms[UserState.id];
  saveStaffPermissions(businessId, allPerms);

  UserState.business = null;
  UserState.businessRole = null;
  renderBusinessCard();
  goBack();
  showToast('You have left the business');
};

// ─── Join Business flow ───

window.openJoinBusiness = function() {
  const overlay = document.createElement('div');
  overlay.id = 'join-biz-overlay';
  overlay.className = 'modal-overlay';
  overlay.style.display = 'block';
  overlay.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-header">
        <span class="modal-title">Join a Business</span>
        <button class="modal-close" onclick="closeJoinBusiness()"><img src="assets/icons/solid/xmark_orange.webp" style="width:18px;height:18px;"></button>
      </div>
      <div class="modal-body">
        <input type="text" id="join-biz-search" placeholder="Search business name..." style="width:100%;padding:10px;font-size:14px;border:1px solid var(--grey-light);border-radius:8px;box-sizing:border-box;" oninput="searchBusinesses(this.value)">
        <div id="join-biz-results" style="margin-top:12px;max-height:300px;overflow-y:auto;"></div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('join-biz-search').focus();
};

window.closeJoinBusiness = function() {
  const el = document.getElementById('join-biz-overlay');
  if (el) el.remove();
};

window.searchBusinesses = function(term) {
  const termClean = term.toLowerCase().trim();
  const results = document.getElementById('join-biz-results');
  if (!results) return;

  if (!termClean) {
    results.innerHTML = '<p style="font-size:13px;color:var(--grey-dark);text-align:center;padding:16px;">Type a business name to search</p>';
    return;
  }

  const allBiz = window.SAMPLE_BUSINESSES || [];
  const matched = allBiz.filter(b => b.name.toLowerCase().includes(termClean));

  if (matched.length === 0) {
    results.innerHTML = '<p style="font-size:13px;color:var(--grey-dark);text-align:center;padding:16px;">No businesses found</p>';
    return;
  }

  results.innerHTML = matched.map(b => {
    const alreadyAssociated = window.BUSINESS_ASSOCIATIONS && window.BUSINESS_ASSOCIATIONS[UserState.id] && window.BUSINESS_ASSOCIATIONS[UserState.id].businessId === b.id;
    const alreadyPending = getPendingStaff(b.id).some(function(r) { return r.userId === UserState.id && r.status !== 'rejected'; });
    const disabled = alreadyAssociated || alreadyPending;
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid var(--grey-light);cursor:${disabled ? 'default' : 'pointer'};opacity:${disabled ? 0.5 : 1};" onclick="${disabled ? '' : "requestJoinBusiness('" + b.id + "','" + b.name.replace(/'/g, "\\'") + "')"}">
        <div class="avatar" style="width:36px;height:36px;font-size:14px;background:${b.color || '#888'};flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;font-weight:600;">${b.initials || b.name[0]}</div>
        <div style="flex:1;">
          <div style="font-weight:600;font-size:14px;">${b.name}</div>
          <div style="font-size:11px;color:var(--grey-dark);">${b.category} · ${b.location}</div>
        </div>
        ${alreadyAssociated ? '<span style="font-size:11px;color:var(--green, #27ae60);font-weight:600;">Member</span>' : (alreadyPending ? '<span style="font-size:11px;color:var(--orange);font-weight:600;">Pending</span>' : '<span style="font-size:11px;color:var(--orange);font-weight:600;">Request</span>')}
      </div>
    `;
  }).join('');
};

window.requestJoinBusiness = function(businessId, businessName) {
  const pending = getPendingStaff(businessId);
  if (pending.some(function(r) { return r.userId === UserState.id && r.status !== 'rejected'; })) {
    showToast('Request already sent');
    return;
  }
  if (window.BUSINESS_ASSOCIATIONS && window.BUSINESS_ASSOCIATIONS[UserState.id] && window.BUSINESS_ASSOCIATIONS[UserState.id].businessId === businessId) {
    showToast('You are already associated with this business');
    return;
  }

  pending.push({ userId: UserState.id, requestedAt: Date.now() });
  savePendingStaff(businessId, pending);
  closeJoinBusiness();
  showToast('Request sent to business owner');
};
