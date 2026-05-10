/* ════════════════════════════════════════════════════════
   WIROG UTILS - Toast, modals, accordion, helpers
   ════════════════════════════════════════════════════════ */

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

function toggleAcc(header) {
  header.parentElement.classList.toggle('open');
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

window.showToast = showToast;
window.toggleAcc = toggleAcc;
window.openModal = openModal;
window.closeModal = closeModal;
window.escapeHtml = escapeHtml;
