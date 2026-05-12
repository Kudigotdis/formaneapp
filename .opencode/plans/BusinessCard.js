// admin/views/BusinessCard.js
const BusinessCard = {
  render(container) {
    const bizId = AdminState.selectedBiz;
    if (!bizId) { container.innerHTML = '<p>Select a business.</p>'; return; }
    const data = Admin.data.getBusinessStats(bizId);
    const biz = data.biz;

    container.innerHTML = `
      <div class="admin-card">
        <button onclick="AdminState.selectedBiz=null;AdminState.changeTab('directory')">← Back</button>
        <h2>${biz.name}</h2>
        <p>${biz.location?.town} · ${biz.phone}</p>
        <p>Subscription: ${biz.subscription || 'none'}</p>
      </div>
      <div class="admin-card">
        <h3>Stats</h3>
        <div>Total Spent: P${data.promos.reduce((s,p)=>s+(p.promo?.cost||0),0).toFixed(2)}</div>
        <div>Active Promos: ${data.promos.filter(p=>p.promo?.status!=='suspended').length}</div>
        <div>Catalogue Items: ${data.catalogue.length}</div>
        <div>Staff: ${data.staff.length ? data.staff.map(u=>u?.name||'Unknown').join(', ') : 'None'}</div>
      </div>
      <div class="admin-card">
        <h3>Catalogue</h3>
        ${data.catalogue.length ? '<ul>'+data.catalogue.map(i=>`<li>${i.name} – P${i.price}</li>`).join('')+'</ul>' : '<p>No items</p>'}
      </div>
      <div class="admin-card">
        <h3>Promos</h3>
        ${data.promos.length ? '<ul>'+data.promos.map(p=>`<li>${p.title} (${p.promo?.status||'active'})</li>`).join('')+'</ul>' : '<p>No promos</p>'}
      </div>
      <div class="admin-card">
        <h3>Payments</h3>
        ${data.payments.length ? '<ul>'+data.payments.map(p=>`<li>${p.method} – P${p.amount} (${p.status})</li>`).join('')+'</ul>' : '<p>No payments</p>'}
      </div>
    `;
  }
};