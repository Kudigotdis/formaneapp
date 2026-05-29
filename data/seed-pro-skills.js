(function() {
  if (localStorage.getItem('foromane_pro_skills_seeded_v2')) return;

  var pros = window.SAMPLE_PROFESSIONALS;
  if (!pros || !pros.length) return;

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function pickRandom(arr, min, max) {
    var count = min + Math.floor(Math.random() * (max - min + 1));
    return shuffle(arr.slice()).slice(0, count);
  }

  function randomStars() {
    var roll = Math.random();
    if (roll < 0.2) return 1 + Math.floor(Math.random() * 2);
    if (roll < 0.8) return 3 + Math.floor(Math.random() * 2);
    return 5;
  }

  var raterIds = [];
  for (var r = 1; r <= 18; r++) raterIds.push('rater_' + r);

  function seedPro(pro) {
    var proId = pro.id;
    if (!proId || !pro.primaryTrade) return;

    var key = window.TRADE_TO_SKILL_KEY && window.TRADE_TO_SKILL_KEY[pro.primaryTrade];
    if (!key) {
      console.warn('seed-pro-skills: no skill key for trade "' + pro.primaryTrade + '" (pro ' + proId + ')');
      return;
    }
    var allSkills = window.TRADESMAN_SKILLS && window.TRADESMAN_SKILLS[key];
    if (!allSkills || !allSkills.length) {
      console.warn('seed-pro-skills: no skills for key "' + key + '" (pro ' + proId + ')');
      return;
    }

    var selectedSkills = pickRandom(allSkills, 4, 8);

    var ratingsData = {};
    selectedSkills.forEach(function(skillKey) {
      var numRatings = 12 + Math.floor(Math.random() * 7);
      var raters = {};
      var total = 0;
      var usedRaters = shuffle(raterIds.slice()).slice(0, numRatings);
      usedRaters.forEach(function(uid) {
        var stars = randomStars();
        raters[uid] = stars;
        total += stars;
      });
      ratingsData[skillKey] = {
        total: total,
        count: numRatings,
        raters: raters
      };
    });

    try {
      localStorage.setItem('foromane_pro_profile_' + proId, JSON.stringify({
        skills: selectedSkills,
        rateType: 'quote',
        rate: '',
        availability: 'available',
        description: pro.description || '',
        serviceAreas: [],
        portfolio: []
      }));
      localStorage.setItem('foromane_skill_ratings_' + proId, JSON.stringify(ratingsData));
    } catch(e) {
      console.warn('seed-pro-skills: failed to save for ' + proId, e);
    }
  }

  pros.forEach(seedPro);

  // Also seed DEMO_PROFILES tradespersons
  var demoPros = window.DEMO_PROFILES;
  if (demoPros && demoPros.length) {
    demoPros.forEach(function(p) {
      if (p.role === 'Tradesperson (Contractor)') seedPro(p);
    });
  }

  localStorage.setItem('foromane_pro_skills_seeded_v2', '1');
})();
