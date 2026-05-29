/* ═══════════════════════════════════════════════════════
   ANALYTICS TAB - Spending, catalogue, monthly history
   ═══════════════════════════════════════════════════════ */

const AnalyticsTab = {
  expandedMonth: null,

  render(container) {
    const data = window.Admin.data;
    const state = window.AdminState;
    const stats = data.getGlobalStats();
    
    const businesses = data.getBusinesses();
    const selectedBiz = state.analyticsBizId || (businesses[0] && businesses[0].id);

    container.innerHTML = `
      <div style="margin-bottom:12px;">
        <select onchange="AdminState.setAnalyticsBiz(this.value)" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:13px;">
          <option value="">All Businesses</option>
          ${businesses.map(b => `
            <option value="${b.id}" ${b.id === selectedBiz ? 'selected' : ''}>${b.name}</option>
          `).join('')}
        </select>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;">
        <button class="pill ${state.analyticsRange === 'this_month' ? 'active' : ''}" 
          onclick="AdminState.setAnalyticsRange('this_month')">This Month</button>
        <button class="pill ${state.analyticsRange === 'last_month' ? 'active' : ''}" 
          onclick="AdminState.setAnalyticsRange('last_month')">Last Month</button>
        <button class="pill ${state.analyticsRange === '3_months' ? 'active' : ''}" 
          onclick="AdminState.setAnalyticsRange('3_months')">3 Months</button>
        <button class="pill ${state.analyticsRange === 'all_time' ? 'active' : ''}" 
          onclick="AdminState.setAnalyticsRange('all_time')">All Time</button>
      </div>
      ${this.renderAnalytics(selectedBiz, state.analyticsRange)}
    `;
  },

  renderAnalytics(bizId, range) {
    const data = window.Admin.data;
    let yearMonth = new Date().toISOString().slice(0, 7);
    if (range === 'last_month') {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      yearMonth = d.toISOString().slice(0, 7);
    }

    const analytics = data.getMonthlyAnalytics(bizId, yearMonth);
    const businesses = data.getBusinesses();

    let totalSpend = 0, totalViews = 0, totalPromos = 0;
    
    if (bizId) {
      const bs = businesses.find(b => b.id === bizId);
      totalSpend = bs?.totalSpend || 0;
      totalPromos = bs?.totalPromos || 0;
      const stats = data.getBusinessStats(bizId);
      totalViews = stats?.totalViews || 0;
    } else {
      totalSpend = data.getGlobalStats().totalBudgetSpent;
      totalPromos = data.getGlobalStats().totalPromos;
      totalViews = data.getGlobalStats().totalPromos * 50;
    }

    return `
      <div class="section-title">SPENDING OVERVIEW</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
        <div class="kpi-card">
          <div class="kpi-num" style="color:var(--orange);">P${totalSpend.toFixed(0)}</div>
          <div class="kpi-label">Total Spent</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">${totalPromos}</div>
          <div class="kpi-label">Total Promos</div>
        </div>
      </div>

      <div class="section-title">CATALOGUE PERFORMANCE</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
        <div class="kpi-card">
          <div class="kpi-num" style="color:#1976d2;">${totalViews}</div>
          <div class="kpi-label">Total Views</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">${analytics.promoCount}</div>
          <div class="kpi-label">This Month</div>
        </div>
      </div>

      <div class="section-title">PROMO PERFORMANCE</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
        <div class="kpi-card">
          <div class="kpi-num">${analytics.views}</div>
          <div class="kpi-label">Impressions</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">${analytics.likes}</div>
          <div class="kpi-label">Likes</div>
        </div>
      </div>

      <div class="section-title">MONTHLY HISTORY</div>
      ${this.renderMonthlyHistory(bizId)}
    `;
  },

  renderMonthlyHistory(bizId) {
    const data = window.Admin.data;
    const months = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toISOString().slice(0, 7));
    }

    return months.map(m => {
      const name = new Date(m + '-01').toLocaleString('default', { month: 'short', year: 'numeric' });
      const analytics = data.getMonthlyAnalytics(bizId, m);
      const isExpanded = window.AdminState.expandedMonth === m;
      
      return `
        <div>
          <div class="month-row" onclick="Admin.toggleMonthDrilldown('${m}')">
            <span class="month-name">${name}</span>
            <div style="display:flex;align-items:center;gap:12px;">
              <span style="font-size:11px;color:var(--grey-dark);">P${analytics.spending} · ${analytics.views} views</span>
              <span class="month-arrow" style="${isExpanded ? 'transform:rotate(90deg);' : ''}">▶</span>
            </div>
          </div>
          ${isExpanded ? this.renderMonthDetail(bizId, m, analytics) : ''}
        </div>
      `;
    }).join('');
  },

  renderMonthDetail(bizId, yearMonth, analytics) {
    const data = window.Admin.data;
    const biz = bizId ? data.businessMap[bizId] : null;
    const monthName = new Date(yearMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });
    
    return `
      <div style="background:#fff;padding:12px;border-radius:8px;margin:8px 0 16px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <div style="font-size:13px;font-weight:600;margin-bottom:12px;">${monthName}</div>
        
        <div class="section-title" style="margin:12px 0 6px;">PROMOS (${analytics.promos.length})</div>
        ${analytics.promos.length > 0 ? analytics.promos.map(p => `
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--grey-light);font-size:12px;">
            <span>${p.title || 'Untitled'}</span>
            <span style="color:var(--orange);">P${p.promo?.cost || 0}</span>
          </div>
        `).join('') : '<div style="font-size:12px;color:var(--grey-dark);">No promos this month</div>'}
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;">
          <div style="background:var(--bg);padding:10px;border-radius:6px;text-align:center;">
            <div style="font-size:16px;font-weight:700;color:var(--orange);">P${analytics.spending}</div>
            <div style="font-size:10px;color:var(--grey-dark);">Spending</div>
          </div>
          <div style="background:var(--bg);padding:10px;border-radius:6px;text-align:center;">
            <div style="font-size:16px;font-weight:700;color:#1976d2;">${analytics.views}</div>
            <div style="font-size:10px;color:var(--grey-dark);">Views</div>
          </div>
        </div>
      </div>
    `;
  }
};

window.AnalyticsTab = AnalyticsTab;