// admin/AdminState.js
const AdminState = {
  activeTab: 'overview',           // overview | approvals | fbcalendar | directory | analytics
  selectedBiz: null,
  approvalFilter: 'all',           // all | promo | payment | artwork
  searchQuery: '',
  analyticsMonth: new Date().toISOString().slice(0, 7),

  changeTab(tab) {
    this.activeTab = tab;
    Admin.refresh();
  },

  selectBiz(bizId) {
    this.selectedBiz = bizId;
    Admin.refresh();
  },
};