const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// --------------------------------------------------------------
// CONFIGURATION
// --------------------------------------------------------------
const DATA_DIR = './data/demo_data';          // where all demo files live
const PROMOS_FILE = 'wirog_promos.json.json';
const OUTPUT_FILE = 'demo_notes.json';

// Helper to pick random integer between min and max (inclusive)
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pick random element from array
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Simple emoji mapping based on category or title keywords
function getEmojiForItem(item) {
  const cat = (item.category || '').toLowerCase();
  const title = (item.title || '').toLowerCase();

  if (cat.includes('electrical') || title.includes('wire') || title.includes('cable') || title.includes('led'))
    return '⚡';
  if (cat.includes('plumbing') || title.includes('pipe') || title.includes('tap') || title.includes('geyser'))
    return '🚰';
  if (cat.includes('paint') || title.includes('paint') || title.includes('primer'))
    return '🎨';
  if (cat.includes('tile') || title.includes('flooring') || title.includes('quarry'))
    return '🧱';
  if (cat.includes('timber') || cat.includes('boards') || title.includes('plank') || title.includes('chipboard'))
    return '🪵';
  if (cat.includes('steel') || cat.includes('metal') || title.includes('rebar') || title.includes('angle iron'))
    return '🔩';
  if (cat.includes('cement') || cat.includes('concrete') || title.includes('sand') || title.includes('stone'))
    return '🏗️';
  if (cat.includes('roof') || title.includes('roof') || title.includes('corrugated'))
    return '🏠';
  if (cat.includes('solar') || title.includes('battery') || title.includes('inverter'))
    return '☀️';
  if (cat.includes('hardware') || cat.includes('fastener') || title.includes('screw') || title.includes('nail'))
    return '🔧';
  if (cat.includes('safety') || title.includes('vest') || title.includes('harness'))
    return '🦺';
  if (cat.includes('door') || cat.includes('window'))
    return '🚪';
  if (cat.includes('lighting') || title.includes('bulb') || title.includes('floodlight'))
    return '💡';
  if (cat.includes('generator') || title.includes('power'))
    return '⚙️';
  if (cat.includes('sanitaryware') || title.includes('toilet') || title.includes('basin'))
    return '🚽';

  return '📦'; // default
}

// Generate a random date between startDate and endDate (inclusive)
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Build a realistic note title based on user profile
function generateNoteTitle(user, usedTitles = new Set()) {
  const role = user.role;
  const primaryTrade = user.primaryTrade || '';
  const interests = user.interests || [];
  const firstName = user.firstName || 'User';

  let base = '';
  if (role === 'service_provider') {
    if (primaryTrade) {
      const trade = primaryTrade.toLowerCase();
      if (trade.includes('electrician')) base = 'Wiring Project';
      else if (trade.includes('plumber')) base = 'Plumbing Installation';
      else if (trade.includes('bricklayer')) base = 'Masonry Materials';
      else if (trade.includes('roofer')) base = 'Roofing Supplies';
      else if (trade.includes('carpenter')) base = 'Joinery List';
      else base = `${primaryTrade} Job Quote`;
    } else base = 'Client Job Materials';
  } else if (role === 'business_owner') {
    base = randomItem(['Restock Order', 'Bulk Purchase', 'Quote for Client', 'Monthly Inventory', 'Project Supplies']);
  } else if (role === 'staff') {
    base = randomItem(['Workshop Request', 'Job Site Order', 'Maintenance List', 'Stock Replenishment']);
  } else { // general_user
    base = randomItem([
      'Home Reno Materials', 'DIY Project', 'Weekend Fixes',
      'Garden Upgrade', 'Kitchen Refresh', 'Bathroom Makeover'
    ]);
  }

  // Add a bit of variation to avoid duplicate titles for same user
  let suffix = '';
  if (usedTitles.has(base)) {
    suffix = ` ${rand(1, 99)}`;
  }
  const title = base + suffix;
  usedTitles.add(title);
  return title;
}

// Select promo items that fit the user's context (optional filtering)
function selectContextualItems(user, allPromos, count) {
  const role = user.role;
  const primaryTrade = (user.primaryTrade || '').toLowerCase();
  const interests = (user.interests || []).map(i => i.toLowerCase());

  // Helper: does a promo match the user's specialty?
  function matchesContext(promo) {
    const cat = (promo.category || '').toLowerCase();
    const title = (promo.title || '').toLowerCase();

    if (role === 'service_provider') {
      if (primaryTrade.includes('electrician') && (cat.includes('electrical') || title.includes('wire') || title.includes('led') || cat.includes('lighting')))
        return true;
      if (primaryTrade.includes('plumber') && (cat.includes('plumbing') || title.includes('pipe') || title.includes('tap') || title.includes('toilet')))
        return true;
      if (primaryTrade.includes('bricklayer') && (cat.includes('cement') || cat.includes('building materials') || title.includes('brick') || title.includes('stone')))
        return true;
      if (primaryTrade.includes('roofer') && (cat.includes('roof') || title.includes('sheet') || title.includes('tile')))
        return true;
      if (primaryTrade.includes('carpenter') && (cat.includes('timber') || cat.includes('boards') || title.includes('wood')))
        return true;
      // fallback – any item
      return true;
    }
    if (role === 'business_owner') {
      // owners can buy anything, but bias toward bulk or high‑value items
      return (promo.discountPercent > 10) || (promo.promoPrice > 500);
    }
    if (role === 'staff') {
      // staff picks items from their business category if known
      if (user.linkedBusiness && promo.businessId === user.linkedBusiness) return true;
      return true;
    }
    // general user – pick items from their interests if any
    if (interests.length > 0) {
      return interests.some(interest => cat.includes(interest) || title.includes(interest));
    }
    return true;
  }

  // First try to get contextual items
  let contextual = allPromos.filter(p => matchesContext(p));
  if (contextual.length < count) {
    contextual = allPromos; // fallback to all promos
  }

  // Shuffle and pick
  const shuffled = [...contextual];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

// Build a single note object
function buildNote(user, promos, noteIndex, usedTitles) {
  const numItems = rand(2, 6);
  const selectedPromos = selectContextualItems(user, promos, numItems);
  const items = selectedPromos.map(promo => {
    const qty = rand(1, 15);
    const price = promo.promoPrice;
    return {
      title: promo.title,
      emoji: getEmojiForItem(promo),
      business: promo.businessName,
      price: price,
      unit: promo.unit,
      qty: qty
    };
  });

  const grandTotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  const createdAt = randomDate(new Date(2026, 2, 1), new Date(2026, 5, 15)).toISOString();

  const noteId = `note-${Date.now()}-${user.id}-${noteIndex}-${crypto.randomBytes(4).toString('hex')}`;

  return {
    id: noteId,
    userId: user.id,
    title: generateNoteTitle(user, usedTitles),
    thumbnail: '',
    createdAt: createdAt,
    grandTotal: grandTotal,
    items: items
  };
}

// --------------------------------------------------------------
// MAIN
// --------------------------------------------------------------
async function main() {
  try {
    // 1. Read all promo items
    const promosRaw = await fs.readFile(path.join(DATA_DIR, PROMOS_FILE), 'utf8');
    const promosData = JSON.parse(promosRaw.replace(/^\uFEFF/, ''));
    const allPromos = promosData.promos || promosData; // handle both {promos:[]} or direct array

    // 2. Find all demo_profiles_*.json files
    const files = await fs.readdir(DATA_DIR);
    const profileFiles = files.filter(f => f.startsWith('demo_profiles_') && f.endsWith('.json'));

    if (profileFiles.length === 0) {
      throw new Error(`No demo_profiles_*.json files found in ${DATA_DIR}`);
    }

    // 3. Aggregate all user profiles
    let allUsers = [];
    for (const file of profileFiles) {
      const content = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
      const users = JSON.parse(content.replace(/^\uFEFF/, ''));
      // some files may be array of users, or have a "profiles" key? inspect first element
      if (Array.isArray(users)) {
        allUsers.push(...users);
      } else if (users.profiles && Array.isArray(users.profiles)) {
        allUsers.push(...users.profiles);
      } else {
        console.warn(`Skipping ${file}: unexpected structure`);
      }
    }

    console.log(`Loaded ${allUsers.length} user profiles.`);

    // 4. Generate notes for each user
    const allNotes = [];
    for (const user of allUsers) {
      // skip users without id
      if (!user.id) {
        console.warn('Skipping user without id:', user);
        continue;
      }

      const numNotes = rand(3, 5);
      const usedTitles = new Set();

      for (let i = 0; i < numNotes; i++) {
        const note = buildNote(user, allPromos, i, usedTitles);
        allNotes.push(note);
      }
    }

    console.log(`Generated ${allNotes.length} notes.`);

    // 5. Write output file
    const outputPath = path.join(DATA_DIR, OUTPUT_FILE);
    await fs.writeFile(outputPath, JSON.stringify({ notes: allNotes }, null, 2), 'utf8');
    console.log(`Notes saved to ${outputPath}`);
  } catch (err) {
    console.error('Error generating notes:', err);
    process.exit(1);
  }
}

main();