/* ════════════════════════════════════════════════════════
   WIROG ADMIN - Redirects to Super Admin Dashboard
   ════════════════════════════════════════════════════════ */

function renderAdmin() {
  if (window.Admin) {
    window.Admin.init();
  }
}

window.renderAdmin = renderAdmin;