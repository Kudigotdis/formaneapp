/* ═══════════════════════════════════════════════════════
   DIRECTORY TAB - A-Z business search with drill-down
   ═══════════════════════════════════════════════════════ */

const DirectoryTab = {
  render(container) {
    const data = window.Admin.data;
    const state = window.AdminState;
    const businesses = data.getBusinesses();

    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const hasBiz = {};
    businesses.forEach(b => {
      const letter = (b.name || '').charAt(0).toUpperCase();
      hasBiz[letter] = true;
    });

    let filtered = businesses;
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = businesses.filter(b => 
        b.name?.toLowerCase().includes(q) || 
        b.category?.toLowerCase().includes(q)
      );
    }
    if (state.alphaFilter) {
      filtered = filtered.filter(b => (b.name || '').toUpperCase().startsWith(state.alphaFilter));
    }

    container.innerHTML = `
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Search businesses..." value="${state.searchQuery}"
          oninput="AdminState.setSearch(this.value)">
      </div>
      <div class="alpha-nav">
        ${alpha.map(l => `
          <button class="alpha-btn ${state.alphaFilter === l ? 'active' : ''} ${hasBiz[l] ? 'has-biz' : ''}"
            onclick="AdminState.setAlphaFilter('${l}')">${l}</button>
        `).join('')}
      </div>
      <div class="biz-list">
        ${filtered.map(b => this.renderBusinessRow(b)).join('')}
      </div>
    `;
  },

  renderBusinessRow(biz) {
    return `
      <div class="biz-row" onclick="Admin.showBusinessCard('${biz.id}')">
        <div class="biz-avatar" style="background:${biz.color || '#fd7600'};">
          ${biz.initials || 'B'}
        </div>
        <div class="biz-details">
          <div class="biz-name">${biz.name || 'Unknown'}</div>
          <div class="biz-meta">${biz.category || ''} · ${biz.location || ''}</div>
          <div class="biz-stats">
            <span>P${biz.totalSpend || 0}</span>
            <span>${biz.totalPromos || 0} promos</span>
            <span class="biz-active">${biz.activePromos || 0} active</span>
          </div>
        </div>
        <i class="fas fa-chevron-right" style="color:var(--grey-mid);font-size:12px;"></i>
      </div>
    `;
  }
};

window.DirectoryTab = DirectoryTab;