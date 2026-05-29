const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MAX_WIDTH = 800;
const QUALITY = 78;

const IMAGE_DIRS = [
  'assets/images/categories_examples',
  'assets/images/profile_pictures_dummy',
  'assets/images/company_logos_dummy',
  'assets/categories',
  'assets/media',
];

const KEEP_ORIGINAL = [
  'assets/media/no_link.png',
  'assets/media/offline-mode-image.png',
  'assets/media/foromane_place_holder_image.webp',
  'assets/media/foromane_place_holder_image_blank.webp',
  'assets/media/foromane_place_holder_image_blog_image_placeholder.webp',
  'assets/media/foromane_place_holder_image_blog_image_placeholder_2.webp',
  'assets/media/foromane_place_holder_image_blog_image_placeholder_3.webp',
];

const FORMAT_MAP = {
  '.jpg': 'jpeg',
  '.jpeg': 'jpeg',
  '.png': 'png',
  '.webp': 'webp',
  '.avif': 'avif',
};

async function getFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = await getFiles(full);
      files.push(...sub);
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

async function optimizeFile(src) {
  const ext = path.extname(src).toLowerCase();
  const format = FORMAT_MAP[ext];
  if (!format) return null;

  try {
    const metadata = await sharp(src).metadata();
    const needsResize = metadata.width > MAX_WIDTH || metadata.height > MAX_WIDTH;

    let pipeline = sharp(src);
    if (needsResize) {
      pipeline = pipeline.resize({
        width: MAX_WIDTH,
        height: MAX_WIDTH,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const opts = { quality: QUALITY };
    if (format === 'png') opts.compressionLevel = 9;
    if (format === 'avif') opts.quality = QUALITY - 10;

    await pipeline[format](opts).toFile(src + '.tmp');
    fs.renameSync(src + '.tmp', src);

    return fs.statSync(src).size;
  } catch (err) {
    try { if (fs.existsSync(src + '.tmp')) fs.unlinkSync(src + '.tmp'); } catch (_) {}
    return null;
  }
}

async function main() {
  console.log('🔍 Scanning image directories...\n');

  const allFiles = [];
  for (const dir of IMAGE_DIRS) {
    const fullDir = path.join(ROOT, dir);
    if (!fs.existsSync(fullDir)) {
      console.log(`  ⚠ Directory not found: ${dir}`);
      continue;
    }
    const files = await getFiles(fullDir);
    allFiles.push(...files.map(f => ({
      fullPath: f,
      relPath: path.relative(ROOT, f).replace(/\\/g, '/'),
    })));
  }

  console.log(`  Found ${allFiles.length} files.\n`);

  let processed = 0;
  let skipped = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const { fullPath, relPath } of allFiles) {
    const ext = path.extname(relPath).toLowerCase();
    const format = FORMAT_MAP[ext];
    if (!format || relPath.endsWith('.tmp')) {
      skipped++;
      continue;
    }

    if (KEEP_ORIGINAL.includes(relPath)) {
      skipped++;
      continue;
    }

    const before = fs.statSync(fullPath).size;
    totalBefore += before;

    process.stdout.write(`  ${relPath}... `);
    const after = await optimizeFile(fullPath);
    if (after !== null) {
      totalAfter += after;
      processed++;
      const pct = ((1 - after / before) * 100).toFixed(1);
      process.stdout.write(`✓ (${(after / 1024).toFixed(1)}KB, -${pct}%)\n`);
    } else {
      skipped++;
      process.stdout.write(`✗\n`);
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('  Results:');
  console.log(`  Files processed:    ${processed}`);
  console.log(`  Files skipped:      ${skipped}`);
  console.log(`  Total before:       ${(totalBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Total after:        ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Total saved:        ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(2)} MB (${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)`);
  console.log('═══════════════════════════════════════\n');
}

main().catch(console.error);
