// admin/views/ApprovalsTab.js
const ApprovalsTab = {
  render(container) {
    const all = Admin.data.getUnifiedRequests();
    const filter = AdminState.approvalFilter;
    const filtered = filter === 'all' ? all : all.filter(r => r.type === filter);

    container.innerHTML = `
      <div class="admin-card">
        <h2>Pending Approvals</h2>
        <div class="filter-bar">
          <button class="${filter==='all'?'active':''}" onclick="setAppFilter('all')">All (${all.length})</button>
          <button class="${filter==='promo'?'active':''}" onclick="setAppFilter('promo')">Promos</button>
          <button class="${filter==='payment'?'active':''}" onclick="setAppFilter('payment')">Payments</button>
          <button class="${filter==='artwork'?'active':''}" onclick="setAppFilter('artwork')">Artwork</button>
        </div>
        <div class="requests-list">
          ${filtered.map(r => this.renderRequest(r)).join('')}
        </div>
      </div>
    `;
  },

  renderRequest(req) {
    const biz = Admin.data.businessMap[req.businessId] || {};
    let detail = '';
    if (req.type === 'promo') detail = `<strong>${req.title}</strong> – P${req.amount} for ${req.durationDays}d`;
    else if (req.type === 'payment') detail = `<strong>${req.method}</strong> – P${req.amount} (${req.purpose})`;
    else detail = `<strong>${req.category}</strong> – ${req.boostDay} (${req.imageCount} images)`;

    return `
      <div class="request-card ${req.status}">
        <div class="req-type">${this.icon(req.type)}</div>
        <div class="req-body">
          <div>${biz.name || req.businessName} – ${detail}</div>
          <small>${new Date(req.createdAt).toLocaleString()}</small>
        </div>
        <div class="req-actions">
          ${req.status === 'pending' ? `
            <button class="approve" onclick="adminApprove('${req.type}','${req.id}')">Approve</button>
            <button class="reject" onclick="adminReject('${req.type}','${req.id}')">Reject</button>
          ` : `<span class="badge status-${req.status}">${req.status}</span>`}
        </div>
      </div>`;
  },

  icon(type) {
    return { promo: '📢', payment: '💳', artwork: '🖼️' }[type];
  }
};

// global helpers
function setAppFilter(filter) {
  AdminState.approvalFilter = filter;
  Admin.refresh();
}