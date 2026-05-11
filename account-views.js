// account-views.js — add-item modal behaviour, artwork submission flow, and promo requests UI
(function(){
  // Utilities to read categories and locations already loaded on the page
  function getAllCategories() {
    return (window.WIROG_PRODUCT_CATEGORIES && window.WIROG_PRODUCT_CATEGORIES.categories) || [];
  }

  function getTowns() {
    try {
      return (window.LOCATIONS = window.LOCATIONS || null) || null;
    } catch(e) { return null; }
  }

  // Simple render of category pills into the item-cat-list inside add-item modal
  function renderItemCategoryList() {
    const list = document.getElementById('item-cat-list');
    if(!list) return;
    list.innerHTML = '';
    const cats = getAllCategories();
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'pill';
      btn.textContent = cat.name;
      btn.dataset.id = cat.id;
      btn.onclick = () => btn.classList.toggle('pill-selected');
      list.appendChild(btn);
    });
  }

  // Hook modal open to prefill creator and town list
  window.openAddItemModal = function(){
    const user = window.User && window.User.current || {name:'You'};
    const sheet = document.getElementById('add-item-modal');
    if(!sheet) return;
    sheet.style.display = 'block';
    document.getElementById('item-title').focus();
    document.getElementById('item-town').value = 'Gaborone';
    renderItemCategoryList();
    populateTownSelects();
  };

  window.saveAddItem = function(){
    // Minimal save: collect fields and persist to localStorage (simulate save)
    const item = {
      title: document.getElementById('item-title').value || 'Untitled',
      desc: document.getElementById('item-desc').value || '',
      price: parseFloat(document.getElementById('item-price').value || 0),
      town: document.getElementById('item-town').value || 'Gaborone',
      area: document.getElementById('item-area').value || '',
      tags: Array.from(document.querySelectorAll('#item-tag-container .tag')).map(t=>t.textContent)
    };
    const items = JSON.parse(localStorage.getItem('wirog_items')||'[]');
    items.push(item);
    localStorage.setItem('wirog_items', JSON.stringify(items));
    showToast('Item saved to your catalogue. Promo options unlocked.');
    closeModal('add-item-modal');
  };

  window.deleteAddItem = function(){
    // clear form
    document.getElementById('item-title').value = '';
    document.getElementById('item-desc').value = '';
    document.getElementById('item-price').value = '';
    document.getElementById('item-tag-container').innerHTML = '';
    showToast('Item cleared.');
  };

  function populateTownSelects(){
    // Populate any select with id ending in -town from locations.json
    const locData = window.LOCATIONS || null;
    if(!locData) return;
    const towns = [];
    (locData.districts||[]).forEach(d=> (d.towns||[]).forEach(t=> towns.push(t.name)));
    const selects = document.querySelectorAll('select[id$="-town"]');
    selects.forEach(s=>{
      s.innerHTML = '';
      towns.forEach(tn=>{ const opt = document.createElement('option'); opt.value = tn; opt.textContent = tn; s.appendChild(opt); });
      s.value = 'Gaborone';
    });
  }

  // Artwork submission view minimal implementation
  window.openArtworkSubmission = function(){
    const modal = document.getElementById('artwork-submission-view') || createArtworkView();
    modal.style.display = 'block';
  };

  function createArtworkView(){
    const div = document.createElement('div');
    div.id = 'artwork-submission-view';
    div.className = 'modal-overlay';
    div.innerHTML = `
      <div class="modal-sheet">
        <div class="modal-header"><span class="modal-title">Submit Artwork for Boost</span><button class="modal-close" onclick="closeModal('artwork-submission-view')"><img src="assets/icons/solid/xmark_orange.webp"></button></div>
        <div class="modal-body">
          <label>Upload Artwork (max 12)</label>
          <input type="file" id="art-upload" accept="image/*" multiple onchange="handleArtworkFiles(this.files)">
          <div id="art-previews" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;"></div>
          <label>Boost Day</label>
          <div style="display:flex;gap:8px;">
            <button class="pill" onclick="selectBoostDay('monday')">Monday</button>
            <button class="pill" onclick="selectBoostDay('wednesday')">Wednesday</button>
            <button class="pill" onclick="selectBoostDay('friday')">Friday</button>
          </div>
          <label>Category</label>
          <select id="art-category"></select>
          <div style="margin-top:12px;display:flex;gap:8px;"><button class="btn" onclick="submitArtwork()">Submit for Boost</button><button class="btn btn-outline" onclick="closeModal('artwork-submission-view')">Cancel</button></div>
        </div>
      </div>
    `;
    document.body.appendChild(div);
    const sel = document.getElementById('art-category');
    getAllCategories().forEach(c=>{ const o=document.createElement('option'); o.value=c.id; o.textContent=c.name; sel.appendChild(o); });
    return div;
  }

  window.handleArtworkFiles = function(files){
    const container = document.getElementById('art-previews');
    container.innerHTML = '';
    const max = Math.min(12, files.length);
    for(let i=0;i<max;i++){
      const f = files[i];
      const img = document.createElement('img');
      img.style.width='120px'; img.style.height='120px'; img.style.objectFit='cover'; img.style.borderRadius='6px';
      const reader = new FileReader();
      reader.onload = e=> img.src = e.target.result;
      reader.readAsDataURL(f);
      container.appendChild(img);
    }
  };

  window.selectBoostDay = function(day){
    document.querySelectorAll('#artwork-submission-view .pill').forEach(b=>b.classList.remove('pill-selected'));
    const btn = Array.from(document.querySelectorAll('#artwork-submission-view .pill')).find(b=>b.textContent.toLowerCase().includes(day));
    if(btn) btn.classList.add('pill-selected');
    document.getElementById('artwork-boost-day') && (document.getElementById('artwork-boost-day').value = day);
  };

  window.submitArtwork = function(){
    showToast('Artwork submitted and pending admin review.');
    closeModal('artwork-submission-view');
  };

  // Promo requests view: simple admin queue rendering
  window.renderPromoRequests = function(){
    const modal = document.getElementById('promo-requests-view') || createPromoRequestsView();
    modal.style.display = 'block';
    // populate list using account.js renderer if available
    setTimeout(()=>{ try { window.renderPromoRequestsList && window.renderPromoRequestsList(); } catch(e){} }, 60);
  };

  function createPromoRequestsView(){
    const div = document.createElement('div');
    div.id = 'promo-requests-view';
    div.className = 'modal-overlay';
    div.innerHTML = `
      <div class="modal-sheet">
        <div class="modal-header"><span class="modal-title">Promo Requests (Admin)</span><button class="modal-close" onclick="closeModal('promo-requests-view')"><img src="assets/icons/solid/xmark_orange.webp"></button></div>
        <div class="modal-body" id="promo-requests-list" style="max-height:60vh;overflow-y:auto;"></div>
      </div>
    `;
    document.body.appendChild(div);
    return div;
  }

  // Expose helper to populate categories and towns on load
  document.addEventListener('DOMContentLoaded', function(){
    // Try to load external locations.json into window.LOCATIONS for use
    fetch('locations.json').then(r=>r.json()).then(json=>{ window.LOCATIONS = json; populateTownSelects(); }).catch(()=>{});
    // Populate boost counter
    try { const b = parseInt(localStorage.getItem('wirog_boosts_remaining') || '12',10); const el = document.getElementById('boost-counter'); if(el) el.textContent = String(b); } catch(e){}
  });

  // Exports for console/debug
  window.WirogAccountViews = { openAddItemModal, saveAddItem, deleteAddItem, openArtworkSubmission, renderPromoRequests };

})();
