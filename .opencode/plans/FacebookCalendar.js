// admin/views/FacebookCalendar.js
const FacebookCalendar = {
  render(container) {
    // Simple month/week grid - shows upcoming Mon/Wed/Fri
    const now = new Date();
    const year = parseInt(AdminState.fbCalendarMonth.split('-')[0]);
    const month = parseInt(AdminState.fbCalendarMonth.split('-')[1]) - 1;
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const postsByDate = {}; // you'd populate from wirog_facebook_schedule (separate LS key)
    // For demo, just render the days with Mon/Wed/Fri highlights
    let html = '<div class="admin-card"><h2>Facebook Schedule</h2>';
    html += `<input type="month" value="${AdminState.fbCalendarMonth}" onchange="AdminState.fbCalendarMonth=this.value;Admin.refresh()">`;
    html += '<div class="calendar-grid">';
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dow = date.getDay(); // Sun=0, Mon=1, Wed=3, Fri=5
      const isPostDay = (dow === 1 || dow === 3 || dow === 5);
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const posts = postsByDate[dateStr] || [];
      html += `<div class="cal-day ${isPostDay ? 'post-day' : ''}">
        <div class="date">${d}</div>
        <div class="posts">${posts.map(p=>`<span>${p.title}</span>`).join('')}</div>
        ${isPostDay ? '<button onclick="alert(\'Add post to '+dateStr+'\')">+</button>' : ''}
      </div>`;
    }
    html += '</div></div>';
    container.innerHTML = html;
  }
};