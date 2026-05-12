/* ═══════════════════════════════════════════════════════
   APPROVALS TAB - Unified queue for promo/payment/artwork
   ═══════════════════════════════════════════════════════ */

const ApprovalsTab = {
  render(container) {
    const data = window.Admin.data;
    const state = window.AdminState;
    const allRequests = data.getUnifiedRequests();
    
    let filtered = allRequests;
    if (state.approvalFilter !== 'all') {
      filtered = allRequests.filter(r => r.type === state.approvalFilter);
    }

    const pendingCount = allRequests.filter(r => r.status === 'pending').length;

    container.innerHTML = `
      <div style="margin-bottom:12px;">
        <span style="font-size:14px;font-weight:600;">PENDING APPROVALS</span>
        <span style="background:var(--orange);color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;margin-left:8px;">${pendingCount}</span>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;">
        <button class="pill ${state.approvalFilter === 'all' ? 'active' : ''}" 
          onclick="AdminState.setApprovalFilter('all')">All</button>
        <button class="pill ${state.approvalFilter === 'promo' ? 'active' : ''}" 
          onclick="AdminState.setApprovalFilter('promo')">Promos</button>
        <button class="pill ${state.approvalFilter === 'payment' ? 'active' : ''}" 
          onclick="AdminState.setApprovalFilter('payment')">Payments</button>
        <button class="pill ${state.approvalFilter === 'artwork' ? 'active' : ''}" 
          onclick="AdminState.setApprovalFilter('artwork')">Artwork</button>
        <button class="pill ${state.approvalFilter === 'onboarding' ? 'active' : ''}" 
          onclick="AdminState.setApprovalFilter('onboarding')">Onboarding</button>
      </div>
      ${this.renderRequests(filtered)}
    `;
  },

  renderRequests(requests) {
    if (!requests || requests.length === 0) {
      return '<div style="text-align:center;padding:30px;color:var(--grey-dark);">No requests</div>';
    }

    return requests.map(r => this.renderRequestCard(r)).join('');
  },

  renderRequestCard(r) {
    const data = window.Admin.data;
    const biz = r.businessId ? data.businessMap[r.businessId] : null;
    const bizName = biz?.name || r.businessName || 'Unknown';
    const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '';
    
    let icon = '', details = '', typeClass = '';
    
    if (r.type === 'promo') {
      icon = '📢';
      typeClass = 'type-promo';
      details = `<strong>${r.title || 'Promo Request'}</strong> · P${r.amount || 0} · ${r.durationDays || 0} days`;
    } else if (r.type === 'payment') {
      icon = '💳';
      typeClass = 'type-payment';
      details = `<strong>${r.method || 'Bank'}</strong> · P${r.amount || 0} · ${r.purpose || ''}`;
    } else if (r.type === 'artwork') {
      icon = '🎨';
      typeClass = 'type-artwork';
      details = `<strong>${r.category || 'Artwork'}</strong> · ${r.boostDay || ''} · ${r.imageCount || 0} images`;
    } else if (r.type === 'onboarding') {
      icon = '🏪';
      typeClass = 'type-onboarding';
      details = `<strong>${r.category || 'New Business'}</strong> · ${r.town || ''} · ${r.phone || ''}`;
    }

    const statusClass = r.status === 'pending' ? 'status-pending' : (r.status === 'approved' ? 'status-approved' : 'status-rejected');

    return `
      <div class="approval-card">
        <div class="approval-header">
          <div class="approval-icon ${typeClass}">${icon}</div>
          <div class="approval-info">
            <div class="approval-title">${bizName}</div>
            <div class="approval-meta">${details}</div>
            <div class="approval-date">${date} · <span class="${statusClass}">${r.status}</span></div>
          </div>
        </div>
        ${r.status === 'pending' ? `
          <div class="approval-actions">
            ${r.type === 'payment' && r.image ? `<button class="btn-sm" style="background:#1976d2;color:#fff;border:none;" onclick="Admin.viewPaymentProof('${r.id}')">View Proof</button>` : ''}
            <button class="btn-sm btn-approve" onclick="Admin.approveRequest('${r.type}','${r.id}')">Approve</button>
            <button class="btn-sm btn-reject" onclick="Admin.rejectRequest('${r.type}','${r.id}')">Reject</button>
          </div>
        ` : ''}
      </div>
    `;
  }
};

window.ApprovalsTab = ApprovalsTab;