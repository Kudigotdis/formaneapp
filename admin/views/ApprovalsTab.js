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
      if (r.items && r.items.length > 0) {
        const pending = r.items.filter(i => i.status === 'pending').length;
        details = `<strong>${r.category || 'Artwork'}</strong> · ${r.items.length} item${r.items.length !== 1 ? 's' : ''} · ${pending} pending`;
      } else {
        details = `<strong>${r.category || 'Artwork'}</strong> · ${r.boostDay || ''} · ${r.imageCount || 0} images`;
      }
    } else if (r.type === 'onboarding') {
      icon = '🏪';
      typeClass = 'type-onboarding';
      details = `<strong>${r.category || 'New Business'}</strong> · ${r.town || ''} · ${r.phone || ''}`;
    }

    const statusClass = r.status === 'pending' ? 'status-pending' : (r.status === 'approved' ? 'status-approved' : 'status-rejected');

    let bodyHtml = '';
    if (r.type === 'artwork' && r.items && r.items.length > 0) {
      bodyHtml = '<div style="margin-top:8px;border-top:1px solid var(--grey-light);padding-top:8px;">';
      r.items.forEach((item, idx) => {
        const itemStatusClass = item.status === 'pending' ? 'status-pending' : (item.status === 'approved' ? 'status-approved' : 'status-rejected');
        const thumbnailHtml = item.thumbnail
          ? `<img src="${item.thumbnail}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;flex-shrink:0;">`
          : `<div style="width:40px;height:40px;background:#eee;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px;">🖼</div>`;
        const scheduleStr = item.scheduledDate ? `${item.scheduledDay || ''} ${item.scheduledDate}` : 'No date';
        bodyHtml += `
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:${idx < r.items.length - 1 ? '1px solid #f0f0f0' : 'none'};">
            ${thumbnailHtml}
            <div style="flex:1;min-width:0;">
              <div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.title || 'Untitled'}</div>
              <div style="font-size:11px;color:var(--grey-dark);">${scheduleStr}</div>
            </div>
            <span style="font-size:11px;font-weight:600;color:${item.status === 'pending' ? 'var(--orange)' : (item.status === 'approved' ? '#2e7d32' : '#e74c3c')};text-transform:capitalize;white-space:nowrap;">${item.status}</span>
            ${item.status === 'pending' ? `
              <button class="btn-sm" style="background:#2e7d32;color:#fff;border:none;padding:2px 8px;font-size:10px;" onclick="Admin.approveArtworkItem('${r.id}','${item.id}')">✓</button>
              <button class="btn-sm" style="background:#e74c3c;color:#fff;border:none;padding:2px 8px;font-size:10px;" onclick="Admin.rejectArtworkItem('${r.id}','${item.id}')">✕</button>
            ` : ''}
          </div>`;
      });
      bodyHtml += '</div>';
    }

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
        ${bodyHtml}
        ${r.status === 'pending' ? (r.type === 'artwork' && r.items && r.items.length > 0 ? '' : `
          <div class="approval-actions">
            ${r.type === 'payment' && r.image ? `<button class="btn-sm" style="background:#1976d2;color:#fff;border:none;" onclick="Admin.viewPaymentProof('${r.id}')">View Proof</button>` : ''}
            <button class="btn-sm btn-approve" onclick="Admin.approveRequest('${r.type}','${r.id}')">Approve</button>
            <button class="btn-sm btn-reject" onclick="Admin.rejectRequest('${r.type}','${r.id}')">Reject</button>
          </div>
        `) : ''}
      </div>
    `;
  }
};

window.ApprovalsTab = ApprovalsTab;