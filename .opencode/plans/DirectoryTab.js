// admin/views/DirectoryTab.js
const DirectoryTab = {
  render(container) {
    const allBiz = Object.values(Admin.data.businesses);
    const q = AdminState.searchQuery.toLowerCase();
    const filtered = allBiz.filter(b => b.name.toLowerCase().includes(q) || b.location?.town?.toLowerCase().includes(q));

    container.innerHTML = `
      <div class="admin-card">
        <h2>Business Directory</h2>
        <input type="text" placeholder="Search business..." value="${AdminState.searchQuery}" 
               oninput="AdminState.searchQuery=this.value;Admin.refresh()" style="width:100%;padding:8px;margin-bottom:10px;">
        <div class="alpha-nav">
          ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => 
            `<button onclick="AdminState.searchQuery='${l.toLowerCase()}';Admin.refresh()">${l}</button>`).join('')}
        </div>
        <div class="biz-list">
          ${filtered.map(b => this.renderBizRow(b)).join('')}
        </div>
      </div>
    `;
  },

  renderBizRow(biz) {
    const stats = Admin.data.getBusinessStats(biz.id);
    const totalSpent = stats.promos.reduce((s,p) => s + (p.promo?.cost||0), 0);
    return `
      <div class="biz-row" onclick="AdminState.selectBiz('${biz.id}')">
        <span><strong>${biz.name}</strong> – ${biz.location?.town || ''}</span>
        <span>P${totalSpent.toFixed(2)} spent · ${stats.promos.length} promos</span>
        <span>➔</span>
      </div>`;
  }
};