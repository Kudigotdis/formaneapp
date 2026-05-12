// admin/views/AnalyticsTab.js
const AnalyticsTab = {
  render(container) {
    const bizId = AdminState.selectedBiz || Object.keys(Admin.data.businesses)[0];
    const stats = Admin.data.getBusinessStats(bizId) || { promos:[], catalogue:[], payments:[], artworks:[] };

    container.innerHTML = `
      <div class="admin-card">
        <h2>Analytics – ${stats.biz?.name || 'All Businesses'}</h2>
        <p>Total spent: P${stats.promos.reduce((s,p)=>s+(p.promo?.cost||0),0).toFixed(2)}</p>
        <p>Promos: ${stats.promos.length} | Catalogue: ${stats.catalogue.length} | Artworks: ${stats.artworks.length}</p>
      </div>
    `;
  }
};