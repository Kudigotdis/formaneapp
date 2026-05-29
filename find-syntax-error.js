const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fpath = path.join(dir, file);
      const stat = fs.statSync(fpath);
      if (stat.isDirectory() && !fpath.includes('node_modules') && !fpath.includes('.git')) {
        results = results.concat(walk(fpath));
      } else if (file.endsWith('.js')) {
        results.push(fpath);
      }
    }
  } catch(e) {}
  return results;
}

const files = walk('.');
let foundAny = false;

for (const f of files) {
  try {
    const code = fs.readFileSync(f, 'utf8');
    // Quick check: does this file have a return statement that might be at top level?
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      // A return at top level would be at the start of a line (after whitespace)
      if (/^return\s/.test(trimmed) || trimmed === 'return' || trimmed === 'return;') {
        // Check if we're inside a function - this is tricky
        // Let's just report all potential top-level returns
        const codeBefore = lines.slice(0, i).join('\n');
        // Count braces: if we're at depth 0, this is a top-level return
        let depth = 0;
        for (const ch of codeBefore) {
          if (ch === '{') depth++;
          if (ch === '}') depth--;
        }
        // Also count function keywords
        const funcMatches = codeBefore.match(/(function\s+\w*\s*\(|=>\s*\{|=>\s*$)/g);
        const funcCount = funcMatches ? funcMatches.length : 0;
        
        if (depth === 0 && funcCount === 0) {
          // But some returns might be inside arrow functions or methods
          // Let's check more carefully
          const lineBefore = i > 0 ? lines[i-1].trim() : '';
          if (!lineBefore.endsWith('=>') && !lineBefore.match(/^\s*\)\s*=>\s*$/)) {
            console.log(`POTENTIAL TOP-LEVEL RETURN in ${f}:${i+1}: ${trimmed}`);
            console.log(`  Line before: ${lineBefore}`);
            foundAny = true;
          }
        }
      }
    }
    
    // Now try to parse with V8's strict mode (same as module)
    try {
      new Function(code);
    } catch(e) {
      // Ignore - non-module scripts can have top-level return which is fine
      // Module scripts can't
    }
    
  } catch(e) {
    console.log(`ERROR reading ${f}: ${e.message}`);
  }
}

if (!foundAny) console.log('No potential top-level returns found');
