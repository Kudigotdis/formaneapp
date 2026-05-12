// admin/AdminData.js
class AdminData {
  constructor() {
    this.refresh();
  }

  refresh() {
    // Static imports (your existing globals)
    this.businesses = window.SAMPLE_BUSINESSES || {};
    this.promos       = window._promos || [];
    this.promoReqs    = JSON.parse(localStorage.getItem('wirog_promo_requests') || '[]');
    this.paymentReqs  = JSON.parse(localStorage.getItem('wirog_payment_requests') || '[]');
    this.artworkSubs  = JSON.parse(localStorage.getItem('wirog_artwork_submissions') || '[]');
    this.users        = window.DEMO_PROFILES || [];
    // associations (global variable from app.js)
    this.assoc = window.BUSINESS_ASSOCIATIONS || {};

    // Fast lookup maps
    this.businessMap = {};
    for (let b of Object.values(this.businesses)) {
      this.businessMap[b.id] = b;
    }

    this.userMap = {};
    this.users.forEach(u => this.userMap[u.id] = u);

    this.userToBiz = {};
    for (let [uid, data] of Object.entries(this.assoc)) {
      this.userToBiz[uid] = data.businessId;
    }
  }

  resolveBizId(userId, bizName) {
    if (this.userToBiz[userId]) return this.userToBiz[userId];
    // fallback by business name
    for (let bid in this.businessMap) {
      if (this.businessMap[bid].name === bizName) return bid;
    }
    return null;
  }

  // ======== UNIFIED REQUESTS ========
  getUnifiedRequests() {
    const promo = this.promoReqs.map(r => ({
      ...r,
      type: 'promo',
      businessId: this.resolveBizId(r.userId, r.businessName),
    }));
    const pay = this.paymentReqs.map(r => ({
      ...r,
      type: 'payment',
      businessId: this.resolveBizId(r.userId),
    }));
    const art = this.artworkSubs.map(r => ({
      ...r,
      type: 'artwork',
      businessId: this.resolveBizId(r.userId, r.businessName),
    }));
    return [...promo, ...pay, ...art].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // ======== GLOBAL STATS ========
  getGlobalStats() {
    const active = this.promos.filter(p => p.promo?.status !== 'suspended');
    const totalCost = active.reduce((s, p) => s + (p.promo?.cost || 0), 0);
    const pending = this.getUnifiedRequests().filter(r => r.status === 'pending').length;
    const now = Date.now();
    const weekMs = 7 * 24 * 3600 * 1000;
    const expiring = this.promos.filter(p => {
      if (!p.promo?.expiresAt) return false;
      const diff = new Date(p.promo.expiresAt) - now;
      return diff > 0 && diff <= weekMs;
    });
    return {
      totalPromos: this.promos.length,
      activePromos: active.length,
      pendingApprovals: pending,
      budgetSpent: totalCost,
      avgCost: active.length ? (totalCost / active.length).toFixed(2) : 0,
      businessCount: Object.keys(this.businessMap).length,
      expiring,
    };
  }

  // ======== PER BUSINESS STATS ========
  getBusinessStats(bizId) {
    const biz = this.businessMap[bizId];
    if (!biz) return null;
    const promos     = this.promos.filter(p => p.businessId === bizId);
    const catalogue  = (window._userItems || []).filter(i => i.businessId === bizId);
    const staffIds   = Object.entries(this.userToBiz)
                            .filter(([, bid]) => bid === bizId)
                            .map(([uid]) => uid);
    const payments   = this.paymentReqs.filter(r => staffIds.includes(r.userId));
    const artworks   = this.artworkSubs.filter(a => a.businessId === bizId);
    return { biz, promos, catalogue, payments, artworks, staff: staffIds.map(id => this.userMap[id]) };
  }

  // ======== PAYMENT METHODS BREAKDOWN ========
  getPaymentBreakdown() {
    const out = { Bank: 0, BTC: 0, Mascom: 0, Orange: 0 };
    this.paymentReqs.forEach(r => {
      if (out.hasOwnProperty(r.method)) out[r.method] += r.amount || 0;
    });
    return out;
  }
}

window.AdminData = AdminData;