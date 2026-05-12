// admin/views/OverviewTab.js
const OverviewTab = {
  render(container) {
    const stats = Admin.data.getGlobalStats();
    const payments = Admin.data.getPaymentBreakdown();

    container.innerHTML = `
      <div class="admin-card">
        <h2>Dashboard Overview</h2>
        <div class="kpi-strip">
          <div class="kpi"><strong>${stats.totalPromos}</strong><small>Total Promos</small></div>
          <div class="kpi"><strong>${stats.activePromos}</strong><small>Active</small></div>
          <div class="kpi"><strong>${stats.pendingApprovals}</strong><small>Pending</small></div>
          <div class="kpi"><strong>P${stats.budgetSpent.toFixed(2)}</strong><small>Total Spent</small></div>
          <div class="kpi"><strong>P${stats.avgCost}</strong><small>Avg Cost</small></div>
          <div class="kpi"><strong>${stats.businessCount}</strong><small>Businesses</small></div>
        </div>
      </div>

      <div class="admin-card">
        <h2>Payment Method Totals</h2>
        <table style="width:100%">
          <tr><th>Method</th><th>Amount (P)</th></tr>
          ${Object.entries(payments).map(([k,v]) => `<tr><td>${k}</td><td>${v.toFixed(2)}</td></tr>`).join('')}
        </table>
      </div>

      <div class="admin-card">
        <h2>Expiring This Week</h2>
        ${stats.expiring.length ? `
          <ul>
            ${stats.expiring.map(p => `
              <li>${p.title} – ${p.businessName} (expires ${new Date(p.promo.expiresAt).toLocaleDateString()})
                <button onclick="Admin.suspendPromo('${p.id}')">Suspend</button>
                <button onclick="Admin.removePromo('${p.id}')">Remove</button>
              </li>`).join('')}
          </ul>` : '<p>No promos expiring soon.</p>'}
      </div>
    `;
  }
};