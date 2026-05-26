/* ════════════════════════════════════════════════════════
   WIROG PRICING ENGINE — Master Unit Variable Library +
   Formula Engine + Tier Rules + Modifiers + Promo Calculator
   ════════════════════════════════════════════════════════ */

window.PricingEngine = (function () {

  /* ─── 1. MASTER UNIT VARIABLE LIBRARY ─── */
  // Organised by the 27 top-level WIROG product categories
  const UNIT_LIBRARY = {
    'Attire & Uniform': ['each', 'per set', 'per pack', 'per dozen', 'per box'],
    'Bathroom & Kitchen': ['each', 'per set', 'per unit', 'per pack', 'per box'],
    'Boards & Timber': ['per meter', 'per length', 'per board', 'per pack', 'per m³', 'per sheet'],
    'Building Materials': ['per kg', 'per bag', 'per unit', 'per pack', 'per load'],
    'Cement & Aggregates': ['per kg', 'per bag', 'per ton', 'per load', 'per m³'],
    'Chemicals': ['per litre', 'per kg', 'per drum', 'per tin', 'per pack'],
    'Design & Plans': ['per hour', 'per project', 'per m²', 'per set', 'each'],
    'Doors & Windows': ['each', 'per set', 'per m²', 'per unit', 'per pair'],
    'Electrical': ['per meter', 'per roll', 'per unit', 'per box', 'per pack', 'each'],
    'Gardening & Outdoor Living': ['each', 'per kg', 'per bag', 'per unit', 'per set'],
    'Generators & Power Solutions': ['each', 'per unit', 'per set', 'per day', 'per hour'],
    'Geysers & Heating': ['each', 'per unit', 'per set', 'per litre', 'per pack'],
    'Hardware & Fasteners': ['per kg', 'per box', 'per pack', 'per unit', 'each'],
    'Home Decor': ['each', 'per set', 'per meter', 'per pack', 'per roll'],
    'Lighting': ['each', 'per unit', 'per pack', 'per set', 'per box'],
    'Paint': ['per litre', 'per 5L', 'per 20L', 'per tin', 'per set'],
    'Partitioning': ['per m²', 'per sheet', 'per panel', 'per pack', 'each'],
    'Plumbing': ['per meter', 'per fitting', 'per set', 'per bundle', 'each', 'per unit'],
    'Pre-builds & Shipping Containers': ['each', 'per unit', 'per m²', 'per set'],
    'Roofing & Ceiling': ['per sheet', 'per meter', 'per bundle', 'per pack', 'per m²'],
    'Safety & Security': ['each', 'per unit', 'per set', 'per pack', 'per box'],
    'Sanitaryware': ['each', 'per set', 'per unit', 'per pack'],
    'Solar Supplies': ['each', 'per unit', 'per set', 'per panel', 'per pack'],
    'Shelving & Storage': ['each', 'per unit', 'per set', 'per pack'],
    'Steel & Metal Products': ['per kg', 'per meter', 'per sheet', 'per length', 'per ton'],
    'Tiles & Flooring': ['per m²', 'per box', 'per tile', 'per roll', 'per pack'],
    'Tools & Equipment': ['each', 'per set', 'per day', 'per hour', 'per pack']
  };

  // Default fallback units
  const DEFAULT_UNITS = ['each', 'per meter', 'per kg', 'per hour', 'per day', 'per m²', 'per box', 'per set'];

  function getUnitsForCategory(categoryName) {
    if (!categoryName) return DEFAULT_UNITS;
    // Try exact match first
    if (UNIT_LIBRARY[categoryName]) return UNIT_LIBRARY[categoryName];
    // Try case-insensitive match
    const key = Object.keys(UNIT_LIBRARY).find(
      k => k.toLowerCase() === categoryName.toLowerCase()
    );
    if (key) return UNIT_LIBRARY[key];
    return DEFAULT_UNITS;
  }

  /* ─── 2. PRICING FORMULA ENGINE ─── */
  // P_f = [B + Σ(V_i · R_i)] · M ± D
  // B = basePrice
  // V_i = variable value (qty of add-on), R_i = variable rate (price per unit)
  // M = combined modifier multiplier
  // D = discount (flat or percentage)

  function calcPrice(basePrice, variables, modifiers, discount) {
    const base = Number(basePrice) || 0;

    // Variables: Σ(V_i · R_i)
    let variableTotal = 0;
    const variableBreakdown = (variables || []).map(v => {
      const val = Number(v.value) || 0;
      const rate = Number(v.rate) || 0;
      const sub = val * rate;
      variableTotal += sub;
      return { name: v.name, value: val, rate, subtotal: sub };
    });

    // Modifiers: combined M
    let modifierMultiplier = 1;
    const modifierBreakdown = [];
    const MODIFIER_RATES = {
      urgency: 0.2,      // +20%
      nightShift: 0.5,   // +50%
      remoteArea: 0.3,   // +30%
      hazard: 1.0        // +100%
    };
    if (modifiers) {
      ['urgency', 'nightShift', 'remoteArea', 'hazard'].forEach(key => {
        if (modifiers[key]) {
          const rate = MODIFIER_RATES[key];
          modifierMultiplier += rate;
          modifierBreakdown.push({ name: key, rate });
        }
      });
    }

    // Subtotal before discount
    const subtotal = base + variableTotal;
    const multiplied = subtotal * modifierMultiplier;

    // Discount: D
    let discountAmount = 0;
    if (discount) {
      if (discount.type === 'flat') {
        discountAmount = Math.min(Number(discount.value) || 0, multiplied);
      } else if (discount.type === 'percent') {
        discountAmount = multiplied * ((Number(discount.value) || 0) / 100);
      }
    }

    const total = multiplied - discountAmount;

    return {
      base,
      variableTotal,
      variableBreakdown,
      modifierMultiplier,
      modifierBreakdown,
      subtotal,
      multiplied,
      discountAmount,
      discount: discount || { type: 'none', value: 0 },
      total: Math.max(0, total),
      breakdown: [
        { label: 'Base Price', amount: base },
        ...variableBreakdown.map(v => ({ label: v.name, amount: v.subtotal })),
        ...modifierBreakdown.map(m => ({ label: m.name + ' (' + (m.rate * 100) + '%)', amount: subtotal * m.rate })),
        { label: 'Discount', amount: -discountAmount },
        { label: 'Total', amount: Math.max(0, total) }
      ]
    };
  }

  /* ─── 3. TIER RULES ENGINE ─── */
  function calculateTierPrice(basePrice, qty, tiers) {
    if (!tiers || !tiers.rules || tiers.rules.length === 0 || !qty) {
      return { effectivePrice: basePrice, total: basePrice * (qty || 1), tierApplied: null, savings: 0 };
    }

    const type = tiers.type || 'bulk';
    const rules = tiers.rules.sort((a, b) => (a.minQty || a.from || a.minSpend || 0) - (b.minQty || b.from || b.minSpend || 0));

    let effectivePrice = basePrice;
    let tierApplied = null;
    let total = 0;

    if (type === 'bulk') {
      // Flat price per unit if qty >= threshold
      const matched = [...rules].reverse().find(r => qty >= (r.minQty || 0));
      if (matched) {
        effectivePrice = matched.price;
        tierApplied = matched;
      }
      total = effectivePrice * qty;
    } else if (type === 'stepped') {
      // Iterative pricing per tier bracket
      total = 0;
      let remaining = qty;
      for (const rule of rules) {
        const from = rule.from || 0;
        const to = rule.to || Infinity;
        const bracketSize = Math.min(remaining, to - from + 1);
        if (bracketSize > 0) {
          total += bracketSize * rule.price;
          remaining -= bracketSize;
          tierApplied = rule;
        }
        if (remaining <= 0) break;
      }
      if (remaining > 0) total += remaining * basePrice;
      effectivePrice = total / qty;
    } else if (type === 'threshold') {
      // Conditional discount on total spend
      const spend = basePrice * qty;
      const matched = [...rules].reverse().find(r => spend >= (r.minSpend || 0));
      if (matched) {
        const discountPct = (matched.discount || 0) / 100;
        total = spend * (1 - discountPct);
        tierApplied = matched;
        effectivePrice = total / qty;
      } else {
        total = spend;
      }
    }

    const originalTotal = basePrice * qty;
    return {
      effectivePrice: Math.round(effectivePrice * 100) / 100,
      total: Math.round(total * 100) / 100,
      tierApplied,
      savings: Math.round((originalTotal - total) * 100) / 100
    };
  }

  /* ─── 4. PROMO COST CALCULATOR ─── */
  // 1 free promo per week per business
  // P25.00 per item to promote for 3 days minimum
  // +P15.00 per day after 3
  // Free to promote in their city
  // +P100.00 for nationwide

  function calcPromoCost(days, region, userTown, freeUsedThisWeek) {
    const minDays = 3;
    const effectiveDays = Math.max(minDays, Number(days) || minDays);

    // Free if promoting in own town
    if (region === 'local') {
      const extraDays = Math.max(0, effectiveDays - minDays);
      return {
        free: true,
        base: 0,
        extraDays,
        extraDaysCost: 0,
        nationalBoost: 0,
        total: 0,
        effectiveDays,
        breakdown: [
          { label: 'Free local promo', amount: 0 }
        ]
      };
    }

    // Free weekly credit
    const base = (freeUsedThisWeek || region === 'nationwide') ? 25 : 0;
    const extraDays = Math.max(0, effectiveDays - minDays);
    const extraDaysCost = extraDays * 15;
    const nationalBoost = region === 'nationwide' ? 100 : 0;
    const total = (freeUsedThisWeek ? base : 0) + extraDaysCost + nationalBoost;

    const breakdown = [];
    if (!freeUsedThisWeek && region !== 'nationwide') {
      breakdown.push({ label: 'Free promo credit', amount: 0 });
    } else {
      breakdown.push({ label: 'Base (' + effectiveDays + ' days)', amount: base });
    }
    if (extraDays > 0) breakdown.push({ label: 'Extra ' + extraDays + ' day(s) @ P15/day', amount: extraDaysCost });
    if (nationalBoost > 0) breakdown.push({ label: 'Nationwide boost', amount: nationalBoost });
    breakdown.push({ label: 'Total', amount: total });

    return {
      free: total === 0,
      base,
      extraDays,
      extraDaysCost,
      nationalBoost,
      total,
      effectiveDays,
      breakdown
    };
  }

  /* ─── 5. REAL-TIME PREVIEW RENDERER ─── */

  function renderPricingPreview(containerId, state) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const result = calcPrice(
      state.basePrice,
      state.variables,
      state.modifiers,
      state.discount
    );

    const tierResult = calculateTierPrice(
      result.total,
      state.qty || 1,
      state.tiers
    );

    let html = '<div class="pricing-preview" style="background:#fafafa;border:1px solid var(--grey-light);border-radius:var(--radius);padding:12px;margin-top:10px;">';
    html += '<div style="font-size:12px;font-weight:700;color:var(--orange);margin-bottom:8px;">PRICING PREVIEW</div>';

    html += '<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;"><span>Base Price</span><span>P ' + result.base.toFixed(2) + '</span></div>';

    if (result.variableBreakdown.length > 0) {
      result.variableBreakdown.forEach(v => {
        html += '<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;color:var(--text-sub);"><span>' + v.name + ' (' + v.value + ' × P' + v.rate.toFixed(2) + ')</span><span>+ P ' + v.subtotal.toFixed(2) + '</span></div>';
      });
    }

    if (result.modifierBreakdown.length > 0) {
      result.modifierBreakdown.forEach(m => {
        html += '<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;color:var(--text-sub);"><span>' + m.name.replace(/([A-Z])/g,' $1').trim() + ' (' + (m.rate * 100) + '%)</span><span>+ P ' + (result.subtotal * m.rate).toFixed(2) + '</span></div>';
      });
    }

    if (result.discountAmount > 0) {
      html += '<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;color:#2e7d32;"><span>Discount</span><span>- P ' + result.discountAmount.toFixed(2) + '</span></div>';
    }

    html += '<div style="border-top:1px solid var(--grey-light);margin:6px 0;"></div>';
    html += '<div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700;color:var(--orange);"><span>Unit Price</span><span>P ' + result.total.toFixed(2) + '</span></div>';

    if (tierResult.tierApplied) {
      html += '<div style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;color:#2e7d32;"><span>Tier applied (saved P' + tierResult.savings.toFixed(2) + ')</span><span>P ' + tierResult.total.toFixed(2) + ' for ' + (state.qty || 1) + '</span></div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  /* ─── 6. TAG AUTO-GENERATOR ─── */
  // Generates tags from category tree path and item data

  function generateTags(categoryPath, title, desc, customTags) {
    const tags = [];

    // From category path
    if (categoryPath && Array.isArray(categoryPath)) {
      categoryPath.forEach(p => {
        if (p && !tags.includes(p)) tags.push(p);
      });
    }

    // From category emoji map
    if (categoryPath && categoryPath.length > 0) {
      const leaf = categoryPath[categoryPath.length - 1];
      if (leaf) tags.push(leaf);
    }

    // From title — extract materials, dimensions, etc.
    if (title) {
      const materialWords = ['steel','wood','timber','copper','plastic','aluminium','glass','stone','concrete','brass','iron','pvc','rubber','ceramic','marble','granite','acrylic','fiberglass'];
      const lower = title.toLowerCase();
      materialWords.forEach(m => {
        if (lower.includes(m) && !tags.includes(m.charAt(0).toUpperCase() + m.slice(1))) {
          tags.push(m.charAt(0).toUpperCase() + m.slice(1));
        }
      });

      // Extract dimensions like 22x144mm, 300x300mm, 2.4m
      const dimMatch = title.match(/\d+(?:\.\d+)?[xX×]\d+(?:\.\d+)?(?:mm|cm|m)?/);
      if (dimMatch && !tags.includes(dimMatch[0])) tags.push(dimMatch[0]);
    }

    // Custom tags
    if (customTags && Array.isArray(customTags)) {
      customTags.forEach(t => {
        if (t && !tags.includes(t)) tags.push(t);
      });
    }

    return tags;
  }

  /* ─── PUBLIC API ─── */
  return {
    UNIT_LIBRARY,
    DEFAULT_UNITS,
    getUnitsForCategory,
    calcPrice,
    calculateTierPrice,
    calcPromoCost,
    renderPricingPreview,
    generateTags,
    MODIFIER_RATES: { urgency: 0.2, nightShift: 0.5, remoteArea: 0.3, hazard: 1.0 }
  };

})();
