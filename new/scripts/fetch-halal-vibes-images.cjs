#!/usr/bin/env node
/**
 * Fetch high-confidence images for Halal Vibes entries missing photos.
 * Only applies matches when source is official (og:image) or same-brand reuse.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const ENTRIES_PATH = path.join(ROOT, 'halal-vibes/entries.js');
const IMGS_DIR = path.join(ROOT, 'halal-vibes/imgs');
const REPORT_PATH = path.join(__dirname, 'halal-vibes-image-report.json');

/** slug -> { type: 'reuse'|'fetch', ... } */
const CURATED = {
  'urban-skillet-santa-monica': {
    type: 'reuse',
    image: 'halal-vibes/imgs/urban.png',
    reason: 'Same Urban Skillet brand as San Diego entry (already uses urban.png)',
  },
  'susiecakes-del-mar': {
    type: 'fetch',
    url: 'https://www.susiecakes.com/',
    verify: ['susiecakes', 'SusieCakes'],
  },
  'big-shoulders-coffee-chicago': {
    type: 'fetch',
    url: 'https://www.bigshoulderscoffee.com/',
    verify: ['big shoulders', 'bigshoulders'],
  },
  'stumptown-cafe-portland': {
    type: 'fetch',
    url: 'https://www.stumptowncoffee.com/pages/locations',
    verify: ['stumptown'],
  },
  'stans-donut-shop-santa-clara': {
    type: 'fetch',
    url: 'https://www.stansdonuts.com/',
    verify: ['stan', 'donut'],
  },
  'halalstreet-hot-pot-newark': {
    type: 'fetch',
    url: 'https://www.halalstreet.com/',
    verify: ['halalstreet', 'halal street'],
  },
  'mazra-redwood-city': {
    type: 'fetch',
    url: 'https://www.mazra.com/',
    verify: ['mazra'],
  },
  'cracked-and-battered-san-francisco': {
    type: 'fetch',
    url: 'https://www.crackedandbattered.com/',
    verify: ['cracked', 'battered'],
  },
  'house-of-mandi-anaheim': {
    type: 'fetch',
    url: 'https://www.houseofmandi.com/',
    verify: ['mandi', 'house of mandi'],
  },
  'craft-by-smoke-and-fire-anaheim': {
    type: 'fetch',
    url: 'https://www.craftbysmokeandfire.com/',
    verify: ['craft', 'smoke'],
  },
  'alforon-mediterranean-lebanese-san-diego': {
    type: 'fetch',
    url: 'https://www.alforon.com/',
    verify: ['alforon'],
  },
  'pakwan-restaurant-san-francisco': {
    type: 'fetch',
    url: 'https://www.pakwancuisine.com/',
    verify: ['pakwan'],
  },
  'big-mug-coffee-santa-clara': {
    type: 'fetch',
    url: 'https://www.bigmugcoffeeroaster.com/',
    verify: ['big mug', 'bigmug'],
  },
  'busboys-and-poets-dc': {
    type: 'fetch',
    url: 'https://www.busboysandpoets.com/',
    verify: ['busboys', 'poets'],
  },
  'perch-los-angeles': {
    type: 'fetch',
    url: 'https://perch.la/',
    verify: ['perch'],
  },
  'area-31-miami': {
    type: 'fetch',
    url: 'https://area31restaurant.com/',
    verify: ['area 31', 'area31'],
  },
  'dukes-malibu': {
    type: 'fetch',
    url: 'https://www.dukesmalibu.com/',
    verify: ['duke', 'malibu'],
  },
  'cafe-luna-san-diego': {
    type: 'fetch',
    url: 'https://www.cafelunasd.com/',
    verify: ['cafe luna', 'cafeluna'],
  },
  'chicken-gs-mountain-view': {
    type: 'fetch',
    url: 'https://www.chickengs.com/',
    verify: ['chicken g', 'chickengs'],
  },
  'zankou-chicken-valencia': {
    type: 'fetch',
    url: 'https://zankouchicken.com/',
    verify: ['zankou'],
  },
  'dough-burger-san-jose': {
    type: 'fetch',
    url: 'https://www.doughburger.com/',
    verify: ['dough burger', 'doughburger'],
  },
  'habibiz-san-jose': {
    type: 'fetch',
    url: 'https://www.habibiz.com/',
    verify: ['habibiz'],
  },
  'el-halal-amigos-san-jose': {
    type: 'fetch',
    url: 'https://www.elhalalamigos.com/',
    verify: ['halal amigos', 'elhalalamigos'],
  },
  'the-burger-shop-fremont': {
    type: 'fetch',
    url: 'https://www.theburgershopfremont.com/',
    verify: ['burger shop'],
  },
  'mikes-red-tacos-mira-mesa': {
    type: 'fetch',
    url: 'https://www.mikesredtacos.com/',
    verify: ['mike', 'red tacos', 'mikesred'],
  },
  'nyc-halal-eats-lombard': {
    type: 'fetch',
    url: 'https://www.nychalaleats.com/',
    verify: ['halal eats', 'nychalal'],
  },
  'new-york-chicken-gyro-pasadena': {
    type: 'fetch',
    url: 'https://www.nychickenandgyro.com/',
    verify: ['chicken', 'gyro'],
  },
  'talkin-tacos-washington-dc': {
    type: 'fetch',
    url: 'https://talkintacos.net/',
    verify: ['talkin', 'tacos'],
  },
  'nazs-halal-food-sterling': {
    type: 'fetch',
    url: 'https://www.nazshalalfood.com/',
    verify: ['naz', 'halal'],
  },
  'tasa2go-fullerton': {
    type: 'fetch',
    url: 'https://www.tasa2go.com/',
    verify: ['tasa2go', 'tasa'],
  },
  'living-room-coffeehouse-la-jolla': {
    type: 'fetch',
    url: 'https://livingroomcafe.com/',
    verify: ['living room'],
  },
  'egglet-la-jolla': {
    type: 'fetch',
    url: 'https://www.egglet.com/',
    verify: ['egglet'],
  },
  'batch-and-box-la-jolla': {
    type: 'fetch',
    url: 'https://www.batchandbox.com/',
    verify: ['batch', 'box'],
  },
  'mr-shawarma-pacific-beach': {
    type: 'fetch',
    url: 'https://www.mrshawarmapb.com/',
    verify: ['shawarma', 'mrshawarma'],
  },
  'sincerly-syria-hollywood': {
    type: 'fetch',
    url: 'https://www.sincerlysyria.com/',
    verify: ['sincerly', 'syria'],
  },
  'hh-brazilian-steakhouse-beverlywood': {
    type: 'fetch',
    url: 'https://www.hhbraziliansteakhouse.com/',
    verify: ['brazilian', 'steakhouse'],
  },
  'kunduz-kabob-san-diego': {
    type: 'fetch',
    url: 'https://www.kunduzkabob.com/',
    verify: ['kunduz'],
  },
  'mal-al-sham-san-diego': {
    type: 'fetch',
    url: 'https://www.maalsham.com/',
    verify: ['sham', 'maalsham', 'mal al'],
  },
  'pacific-coast-grill-san-diego': {
    type: 'fetch',
    url: 'https://www.pacificcoastgrill.com/',
    verify: ['pacific coast', 'grill'],
  },
};

function fetchText(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HalalVibesBot/1.0)' } }, (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 5) {
          const next = new URL(res.headers.location, url).href;
          res.resume();
          return resolve(fetchText(next, redirects + 1));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

function extractMeta(html, prop) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${prop}["']`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1].trim();
  }
  return null;
}

function extractOgImage(html, baseUrl) {
  const raw =
    extractMeta(html, 'og:image') ||
    extractMeta(html, 'og:image:secure_url') ||
    extractMeta(html, 'twitter:image');
  if (!raw) return null;
  try {
    return new URL(raw, baseUrl).href;
  } catch {
    return null;
  }
}

function verifyPage(html, url, terms) {
  const hay = (html + ' ' + url).toLowerCase();
  return terms.some((t) => hay.includes(t.toLowerCase()));
}

function downloadFile(url, dest, redirects = 0) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 5) {
        const next = new URL(res.headers.location, url).href;
        res.resume();
        return resolve(downloadFile(next, dest, redirects + 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`Download HTTP ${res.statusCode}`));
      }
      const ct = (res.headers['content-type'] || '').toLowerCase();
      if (!ct.includes('image')) {
        res.resume();
        return reject(new Error(`Not an image: ${ct}`));
      }
      const ws = fs.createWriteStream(dest);
      res.pipe(ws);
      ws.on('finish', () => ws.close(() => resolve({ contentType: ct, size: fs.statSync(dest).size })));
      ws.on('error', reject);
    }).on('error', reject);
  });
}

function extFromUrl(url, contentType) {
  const u = url.split('?')[0].toLowerCase();
  if (u.endsWith('.png')) return '.png';
  if (u.endsWith('.webp')) return '.webp';
  if (u.endsWith('.gif')) return '.gif';
  if (u.endsWith('.jpeg') || u.endsWith('.jpg')) return '.jpg';
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('webp')) return '.webp';
  return '.jpg';
}

async function main() {
  const file = fs.readFileSync(ENTRIES_PATH, 'utf8');
  const entries = eval(file.match(/const HALAL_VIBES_ENTRIES = (\[[\s\S]*\]);/)[1]);
  const missing = entries.filter((e) => !e.image);
  const slugOf = (e) => e.slug || e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const report = { applied: [], skipped: [], failed: [] };

  for (const entry of missing) {
    const slug = slugOf(entry);
    const cfg = CURATED[slug];
    if (!cfg) {
      report.skipped.push({ slug, title: entry.title, reason: 'no curated source' });
      continue;
    }

    if (cfg.type === 'reuse') {
      const rel = cfg.image;
      const abs = path.join(ROOT, rel);
      if (!fs.existsSync(abs)) {
        report.failed.push({ slug, reason: 'reuse file missing', image: rel });
        continue;
      }
      entry.image = rel;
      report.applied.push({ slug, title: entry.title, image: rel, method: 'reuse', reason: cfg.reason });
      continue;
    }

    try {
      const html = await fetchText(cfg.url);
      if (!verifyPage(html, cfg.url, cfg.verify)) {
        report.failed.push({ slug, reason: 'page verification failed', url: cfg.url });
        continue;
      }
      const imgUrl = extractOgImage(html, cfg.url);
      if (!imgUrl) {
        report.failed.push({ slug, reason: 'no og:image', url: cfg.url });
        continue;
      }
      const tmp = path.join(IMGS_DIR, `_tmp_${slug}`);
      const meta = await downloadFile(imgUrl, tmp);
      if (meta.size < 3000) {
        fs.unlinkSync(tmp);
        report.failed.push({ slug, reason: 'image too small', imgUrl });
        continue;
      }
      const ext = extFromUrl(imgUrl, meta.contentType);
      const filename = `${slug}${ext}`;
      const dest = path.join(IMGS_DIR, filename);
      fs.renameSync(tmp, dest);
      entry.image = `halal-vibes/imgs/${filename}`;
      report.applied.push({ slug, title: entry.title, image: entry.image, method: 'fetch', url: cfg.url, imgUrl });
    } catch (err) {
      report.failed.push({ slug, title: entry.title, reason: err.message, url: cfg.url });
    }
  }

  // Write updated entries.js
  let out = file;
  for (const item of report.applied) {
    const entry = entries.find((e) => slugOf(e) === item.slug);
    if (!entry) continue;
    const slugRe = entry.slug ? `slug: "${entry.slug}"` : `title: "${entry.title.replace(/"/g, '\\"')}"`;
    const blockRe = new RegExp(
      `(\\{[\\s\\S]*?${slugRe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?image:\\s*)null`,
      'm'
    );
    if (blockRe.test(out)) {
      out = out.replace(blockRe, `$1"${entry.image}"`);
    }
  }
  fs.writeFileSync(ENTRIES_PATH, out);
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log('Applied:', report.applied.length);
  console.log('Failed:', report.failed.length);
  console.log('Skipped (no source):', report.skipped.length);
  console.log('\nApplied:');
  report.applied.forEach((a) => console.log(`  ✓ ${a.slug} -> ${a.image}`));
  console.log('\nFailed:');
  report.failed.forEach((f) => console.log(`  ✗ ${f.slug}: ${f.reason}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
