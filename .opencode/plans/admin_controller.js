// admin/admin.js
const Admin = {
  data: null,

  init() {
    this.data = new AdminData();
    this.render();
  },

  render() {
    const container = document.getElementById('view-admin');
    if (!container) return;

    let innerHTML = `
      <div class="admin-header">
        <h1>Admin Panel</h1>
        <div class="tab-nav">
          <button class="${AdminState.activeTab==='overview'?'active':''}" onclick="AdminState.changeTab('overview')">Overview</button>
          <button class="${AdminState.activeTab==='approvals'?'active':''}" onclick="AdminState.changeTab('approvals')">Approvals</button>
          <button class="${AdminState.activeTab==='fbcalendar'?'active':''}" onclick="AdminState.changeTab('fbcalendar')">Facebook</button>
          <button class="${AdminState.activeTab==='directory'?'active':''}" onclick="AdminState.changeTab('directory')">Directory</button>
          <button class="${AdminState.activeTab==='analytics'?'active':''}" onclick="AdminState.changeTab('analytics')">Analytics</button>
        </div>
      </div>
      <div id="admin-content"></div>
    `;
    container.innerHTML = innerHTML;

    const content = document.getElementById('admin-content');
    switch (AdminState.activeTab) {
      case 'overview':   OverviewTab.render(content); break;
      case 'approvals':  ApprovalsTab.render(content); break;
      case 'fbcalendar': FacebookCalendar.render(content); break;
      case 'directory':  AdminState.selectedBiz ? BusinessCard.render(content) : DirectoryTab.render(content); break;
      case 'analytics':  AnalyticsTab.render(content); break;
    }
  },

  refresh() {
    this.data.refresh();
    this.render();
  },

  // Action methods
  async approvePromoRequest(reqId) { /* … */ },
  async rejectPromoRequest(reqId, reason) { /* … */ },
  suspendPromo(promoId) { /* … */ },
  removePromo(promoId) { /* … */ },
};

// Hook into app view change
// In your app.js when switching to view-admin:
// if (targetView === 'admin') Admin.init();