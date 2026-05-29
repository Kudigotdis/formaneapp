/* ═══════════════════════════════════════════════════════
   OVERVIEW TAB - KPI strip, payments, expiring promos
   ═══════════════════════════════════════════════════════ */

const OverviewTab = {
  render(container) {
    const data = window.Admin.data;
    const stats = data.getGlobalStats();
    const payments = data.getPaymentBreakdown();

    container.innerHTML = `
      <div class="section-title">KEY METRICS</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
        <div class="kpi-card">
          <div class="kpi-num" style="color:var(--orange);">${stats.totalPromos}</div>
          <div class="kpi-label">Total Promos</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num" style="color:#2e7d32;">${stats.activePromos}</div>
          <div class="kpi-label">Active</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num" style="color:#c62828;">${stats.pendingApprovals}</div>
          <div class="kpi-label">Pending</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">${stats.businessCount}</div>
          <div class="kpi-label">Businesses</div>
        </div>
      </div>

      <div class="section-title">SPENDING</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
        <div class="kpi-card" style="background:var(--orange-light);border:1px solid var(--orange);">
          <div class="kpi-num" style="color:var(--orange);">P${stats.totalBudgetSpent.toFixed(0)}</div>
          <div class="kpi-label">Total Spent</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">P${stats.avgCost.toFixed(0)}</div>
          <div class="kpi-label">Avg/Promo</div>
        </div>
      </div>

      <div class="section-title">PAYMENT METHODS</div>
      <div class="payment-grid">
        <div class="payment-item">
          <div class="payment-logo"><img src="assets/logos/btc_logo.png" style="height:24px;"></div>
          <div class="payment-amount">P${payments.BTC || 0}</div>
          <div class="payment-count">${payments.count.BTC || 0} txns</div>
        </div>
        <div class="payment-item">
          <div class="payment-logo"><img src="assets/logos/mascom_logo.png" style="height:24px;"></div>
          <div class="payment-amount">P${payments.Mascom || 0}</div>
          <div class="payment-count">${payments.count.Mascom || 0} txns</div>
        </div>
        <div class="payment-item">
          <div class="payment-logo"><img src="assets/logos/orange_logo.png" style="height:24px;"></div>
          <div class="payment-amount">P${payments.Orange || 0}</div>
          <div class="payment-count">${payments.count.Orange || 0} txns</div>
        </div>
        <div class="payment-item">
          <div class="payment-logo"><span style="font-weight:700;font-size:12px;">Bank</span></div>
          <div class="payment-amount">P${payments.Bank || 0}</div>
          <div class="payment-count">${payments.count.Bank || 0} txns</div>
        </div>
      </div>

      <div class="section-title">EXPIRING THIS WEEK (${stats.expiringThisWeek.length})</div>
      ${this.renderExpiring(stats.expiringThisWeek)}
    `;
  },

  renderExpiring(promos) {
    if (!promos || promos.length === 0) {
      return '<div style="text-align:center;padding:20px;color:var(--grey-dark);font-size:13px;">No promos expiring this week</div>';
    }

    return promos.slice(0, 10).map(p => `
      <div class="expiring-row">
        <div class="expiring-info">
          <div class="expiring-title">${p.title || 'Untitled'}</div>
          <div class="expiring-meta">${p.businessName || ''} · P${p.promo?.cost || 0}</div>
        </div>
        <div class="expiring-actions">
          <button class="btn-sm" style="background:#fff3e0;color:#e65100;border:1px solid #e65100;" 
            onclick="alert('Suspend ${p.id}')">Suspend</button>
          <button class="btn-sm" style="background:#ffebee;color:#c62828;border:1px solid #c62828;" 
            onclick="alert('Remove ${p.id}')">Remove</button>
        </div>
      </div>
    `).join('');
  }
};

window.OverviewTab = OverviewTab;