var SkillRatings = {
  _getKey: function(proId) { return 'wirog_skill_ratings_' + proId; },

  _getData: function(proId) {
    try { return JSON.parse(localStorage.getItem(this._getKey(proId))) || {}; }
    catch { return {}; }
  },

  _saveData: function(proId, data) {
    localStorage.setItem(this._getKey(proId), JSON.stringify(data));
  },

  getSkillRatings: function(proId, skillKey) {
    var data = this._getData(proId);
    var s = data[skillKey];
    if (!s) return null;
    return {
      average: s.count > 0 ? (s.total / s.count).toFixed(1) : null,
      count: s.count || 0,
      total: s.total || 0
    };
  },

  getUserRating: function(proId, skillKey, userId) {
    var data = this._getData(proId);
    var s = data[skillKey];
    if (!s || !s.raters) return null;
    return s.raters[userId] || null;
  },

  rateSkill: function(proId, skillKey, stars, userId) {
    if (!userId || userId === 'guest') return false;
    stars = Math.max(1, Math.min(5, Math.round(stars)));
    var data = this._getData(proId);
    if (!data[skillKey]) {
      data[skillKey] = { total: 0, count: 0, raters: {} };
    }
    var s = data[skillKey];
    var prev = s.raters[userId];
    if (prev) {
      s.total = s.total - prev + stars;
    } else {
      s.total = s.total + stars;
      s.count = s.count + 1;
    }
    s.raters[userId] = stars;
    this._saveData(proId, data);
    return true;
  },

  hasRatedSkill: function(proId, skillKey, userId) {
    return this.getUserRating(proId, skillKey, userId) !== null;
  },

  getSkillDisplayName: function(camelKey) {
    return camelKey
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, function(s) { return s.toUpperCase(); })
      .trim();
  },

  getSkillsForTrade: function(displayName) {
    var key = window.TRADE_TO_SKILL_KEY && window.TRADE_TO_SKILL_KEY[displayName];
    if (!key) return [];
    var all = window.TRADESMAN_SKILLS && window.TRADESMAN_SKILLS[key];
    return all || [];
  }
};

window.SkillRatings = SkillRatings;
