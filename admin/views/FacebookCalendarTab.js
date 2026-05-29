/* ═══════════════════════════════════════════════════════
   FACEBOOK CALENDAR TAB - Mon/Wed/Fri scheduling
   ═══════════════════════════════════════════════════════ */

const FacebookCalendarTab = {
  render(container) {
    const data = window.Admin.data;
    const state = window.AdminState;
    const schedule = data.getFacebookSchedule();
    const approved = data.getApprovedArtwork();

    const year = parseInt(state.fbCalendarMonth.split('-')[0]);
    const month = parseInt(state.fbCalendarMonth.split('-')[1]) - 1;
    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <div class="section-title" style="margin:0;">${monthName} ${year}</div>
        <input type="month" value="${state.fbCalendarMonth}" 
          onchange="AdminState.setFbMonth(this.value)"
          style="padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-size:13px;">
      </div>
      ${this.renderCalendar(year, month, schedule)}
      <div class="section-title" style="margin-top:20px;">UNASSIGNED APPROVED (${approved.length})</div>
      ${this.renderUnassigned(approved)}
    `;
  },

  renderCalendar(year, month, schedule) {
    const days = ['Monday', 'Wednesday', 'Friday'];
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    let html = '';

    days.forEach(day => {
      const dayIndex = { 'Monday': 1, 'Wednesday': 3, 'Friday': 5 }[day];

      let slots = [];
      for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === dayIndex) {
          const dateStr = d.toISOString().split('T')[0];
          const scheduled = schedule.filter(s => s.date === dateStr && s.slot === day);
          slots.push({ date: dateStr, day: day, posts: scheduled, display: d.getDate() });
        }
      }

      html += `
        <div class="fb-day-section">
          <div class="fb-day-header">${day}</div>
          ${slots.map(s => `
            <div class="fb-slot-row">
              <span class="fb-slot-date">${s.display}</span>
              <div class="fb-slot-posts">
                ${s.posts.length > 0 ? s.posts.map(p => `
                  <div class="fb-post-chip" title="${p.title || p.businessName || ''}">${p.title ? p.title.substring(0, 20) : (p.businessName || 'Post')}</div>
                `).join('') : '<span class="fb-slot-empty">Empty</span>'}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    });

    return html;
  },

  renderUnassigned(approved) {
    if (!approved || approved.length === 0) {
      return '<div style="text-align:center;padding:20px;color:var(--grey-dark);">No approved artwork waiting</div>';
    }

    return approved.map((a, idx) => {
      const scheduleStr = a.scheduledDate ? (a.scheduledDay || '') + ' ' + a.scheduledDate : (a.boostDay || '');
      const metaStr = scheduleStr + (a.title ? ' · ' + a.title : '') + (a.category ? ' · ' + a.category : '');
      const safeBizName = (a.businessName || 'Unknown').replace(/'/g, "\\'");
      const safeTitle = (a.title || '').replace(/'/g, "\\'");
      return `
        <div class="unassigned-row">
          <div class="unassigned-info">
            <div class="unassigned-biz">${a.businessName || 'Unknown'}</div>
            <div class="unassigned-meta">${metaStr}</div>
          </div>
          <div class="unassigned-actions">
            <select id="assign-select-${idx}" style="padding:4px 8px;border:1px solid var(--border);border-radius:4px;font-size:11px;">
              <option value="">Assign to...</option>
              <option value="Monday">Monday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Friday">Friday</option>
            </select>
            <button class="btn-sm" style="background:var(--orange);color:#fff;border:none;margin-left:4px;"
              onclick="Admin.assignArtwork('${a.submissionId || a.id}', '${a.id}', '${safeBizName}', '${safeTitle}', ${idx})">Assign</button>
          </div>
        </div>`;
    }).join('');
  }
};

window.FacebookCalendarTab = FacebookCalendarTab;