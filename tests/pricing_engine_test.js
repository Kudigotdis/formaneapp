const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// Load pricing-engine.js into a VM context with a window object
const code = fs.readFileSync(require('path').join(__dirname, '..', 'pricing-engine.js'), 'utf8');
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const PE = sandbox.window.PricingEngine;
if (!PE) throw new Error('PricingEngine not loaded');

// Tests
// 1) calcPrice basic
const res1 = PE.calcPrice(100, [{ name: 'Add 1', value: 2, rate: 10 }], { urgency: true }, { type: 'percent', value: 10 });
assert.strictEqual(Math.round(res1.total), 130); // 100+20=120 *1.2=144 -10% =129.6 -> ~130

// 2) calculateTierPrice bulk
const tierRes = PE.calculateTierPrice(10, 20, { type: 'bulk', rules: [{ minQty: 10, price: 9 }, { minQty: 50, price: 8 }] });
assert.strictEqual(tierRes.effectivePrice, 9);
assert.strictEqual(tierRes.total, 180);

// 3) calcPromoCost local vs nationwide
const local = PE.calcPromoCost(3, 'local', 'Gaborone', false);
assert.strictEqual(local.total, 0);
const nat = PE.calcPromoCost(5, 'nationwide', 'Gaborone', false);
assert.ok(nat.total >= 100);

// 4) getUnitsForCategory
const units = PE.getUnitsForCategory('Boards & Timber');
assert.ok(Array.isArray(units) && units.includes('per meter'));

// 5) generateTags
const tags = PE.generateTags(['Boards & Timber','Timber'], 'Meranti Planks 22x144mm', 'Good wood', ['CustomTag']);
assert.ok(Array.isArray(tags) && tags.includes('22x144mm'));

console.log('PricingEngine tests passed');
