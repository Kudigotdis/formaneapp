/* ════════════════════════════════════════════════════════
   WIROG ADMIN - Analytics dashboard for admin users
   ════════════════════════════════════════════════════════ */

function renderAdmin() {
  const content = document.getElementById('admin-content');
  if (!content) return;

  const promos = window._promos || [];
  const now = new Date();

  // Time-based groupings
  const thisMonth = promos.filter(p => {
    if (!p.promo || !p.promo.expiresAt) return false;
    const d = new Date(p.promo.expiresAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisWeek = promos.filter(p => {
    if (!p.promo || !p.promo.expiresAt) return false;
    const d = new Date(p.promo.expiresAt);
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
    return d >= weekStart;
  });
  const today = promos.filter(p => {
    if (!p.promo || !p.promo.expiresAt) return false;
    const d = new Date(p.promo.expiresAt);
    return d.toDateString() === now.toDateString();
  });

  // Category breakdown
  const catCounts = {};
  promos.forEach(p => {
    const c = p.category || 'General';
    if (!catCounts[c]) catCounts[c] = { total: 0, views: 0, likes: 0, addedToNotes: 0 };
    catCounts[c].total++;
    if (p.kpi) {
      catCounts[c].views += p.kpi.views || 0;
      catCounts[c].likes += p.kpi.likes || 0;
      catCounts[c].addedToNotes += p.kpi.addedToNotes || 0;
    }
  });
  const sortedCats = Object.keys(catCounts).sort((a, b) => catCounts[b].total - catCounts[a].total);

  // KPI totals
  const totalViews = promos.reduce((s, p) => s + (p.kpi?.views || 0), 0);
  const totalLikes = promos.reduce((s, p) => s + (p.kpi?.likes || 0), 0);
  const totalNotes = promos.reduce((s, p) => s + (p.kpi?.addedToNotes || 0), 0);

  // Budget info (aggregate promo costs)
  const totalBudget = promos.reduce((s, p) => s + (p.promo?.cost || 0), 0);
  const totalPromos = promos.length;
  const activePromos = promos.filter(p => p.promo?.status === 'active' || (!p.promo?.expiresAt || new Date(p.promo.expiresAt) > now));

  content.innerHTML = `
    <div style="background:#2a2a2a;padding:16px;color:white;position:sticky;top:0;z-index:10;">
      <button onclick="navTab('view-account','nav-account')" style="background:none;border:none;color:white;font-size:14px;cursor:pointer;display:flex;align-items:center;gap:6px;padding:0;margin-bottom:10px;">
        <img src="assets/icons/solid/chevron-left_white.webp" style="width:16px;height:16px;"> Back
      </button>
      <h2 style="font-family:var(--font-head);font-size:20px;font-weight:700;margin:0;">Admin Dashboard</h2>
      <p style="font-size:12px;color:rgba(255,255,255,0.6);margin:4px 0 0 0;">${activePromos.length} active · ${totalPromos} total promos</p>
    </div>
    <div style="padding:12px;">

      <!-- KPI Strip -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-num">${totalViews}</div><div class="kpi-label">Views</div></div>
        <div class="kpi-card"><div class="kpi-num">${totalLikes}</div><div class="kpi-label">Likes</div></div>
        <div class="kpi-card"><div class="kpi-num">${totalNotes}</div><div class="kpi-label">Note Adds</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
        <div class="kpi-card" style="background:var(--orange-light);border:1px solid var(--orange);">
          <div class="kpi-num" style="color:var(--orange);">P ${totalBudget.toFixed(2)}</div>
          <div class="kpi-label">Total Budget Spent</div>
        </div>
        <div class="kpi-card" style="background:var(--orange-light);border:1px solid var(--orange);">
          <div class="kpi-num" style="color:var(--orange);">P ${totalPromos > 0 ? (totalBudget / totalPromos).toFixed(2) : '0.00'}</div>
          <div class="kpi-label">Avg Cost / Promo</div>
        </div>
      </div>

      <!-- Time-based counts -->
      <div style="margin-bottom:16px;">
        <div class="section-title">Promos Overview</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px;">
          <div class="time-card"><div class="time-num">${today.length}</div><div class="time-label">Today</div></div>
          <div class="time-card"><div class="time-num">${thisWeek.length}</div><div class="time-label">This Week</div></div>
          <div class="time-card"><div class="time-num">${thisMonth.length}</div><div class="time-label">This Month</div></div>
        </div>
      </div>

      <!-- Category breakdown -->
      <div class="section-title">By Category</div>
      <div style="margin-top:8px;">
        ${sortedCats.slice(0, 20).map((c, i) => {
          const d = catCounts[c];
          const pct = totalPromos > 0 ? ((d.total / totalPromos) * 100).toFixed(1) : '0';
          return `
            <div class="cat-row">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
                <span style="font-size:13px;font-weight:600;">${c}</span>
                <span style="font-size:12px;color:var(--grey-dark);">${d.total} (${pct}%)</span>
              </div>
              <div style="display:flex;gap:12px;font-size:11px;color:var(--grey-dark);">
                <span>👁 ${d.views}</span>
                <span>❤ ${d.likes}</span>
                <span>📋 ${d.addedToNotes}</span>
              </div>
              <div class="cat-bar" style="width:${pct}%;"></div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Recent Promos -->
      <div class="section-title" style="margin-top:16px;">Recent Promos</div>
      <div style="margin-top:8px;">
        ${promos.slice(0, 10).map(p => {
          const expires = p.promo?.expiresAt ? new Date(p.promo.expiresAt).toLocaleDateString() : 'N/A';
          return `
            <div class="recent-promo-row">
              <div><span style="font-weight:600;font-size:13px;">${p.title}</span><br><span style="font-size:11px;color:var(--grey-dark);">${p.businessName} · ${p.category || 'General'}</span></div>
              <div style="text-align:right;font-size:11px;color:var(--grey-dark);">Exp: ${expires}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="height:32px;"></div>
    </div>
  `;
}

if (!document.getElementById('admin-styles')) {
  const adminStyles = document.createElement('style');
  adminStyles.id = 'admin-styles';
  adminStyles.textContent = `
    .kpi-card { background:white;border-radius:10px;padding:12px;text-align:center;box-shadow:var(--card-shadow); }
    .kpi-num { font-family:var(--font-head);font-size:24px;font-weight:800; }
    .kpi-label { font-size:11px;color:var(--grey-dark);margin-top:2px; }
    .time-card { background:white;border-radius:10px;padding:12px;text-align:center;box-shadow:var(--card-shadow); }
    .time-num { font-family:var(--font-head);font-size:20px;font-weight:800;color:var(--orange); }
    .time-label { font-size:11px;color:var(--grey-dark);margin-top:2px; }
    .cat-row { margin-bottom:10px;padding:8px 10px;background:white;border-radius:8px;box-shadow:var(--card-shadow);position:relative;overflow:hidden; }
    .cat-bar { position:absolute;bottom:0;left:0;height:3px;background:var(--orange);border-radius:0 2px 0 0;transition:width 0.3s; }
    .recent-promo-row { display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--grey-light); }
  `;
  document.head.appendChild(adminStyles);
}

window.renderAdmin = renderAdmin;
