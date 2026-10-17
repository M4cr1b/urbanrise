import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { properties } = JSON.parse(fs.readFileSync(path.join(root, 'data/property-reference-11-36.json'), 'utf8'));
const covers = JSON.parse(fs.readFileSync(path.join(root, 'data/property-covers.json'), 'utf8'));
// The reference retains the database order; the website promotes reviewed covers.
const displayedImages = p => {
  const urls = p.images.map(i => i.url);
  return covers[p.slug] ? [covers[p.slug], ...urls.filter(url => url !== covers[p.slug])] : urls;
};
const siteArg = process.argv.find(a => a.startsWith('--site='));
const imagesOnly = process.argv.includes('--images-only');
const sha = data => createHash('sha256').update(data).digest('hex');
const norm = s => String(s ?? '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const num = s => Number(String(s).replace(/[^\d.]/g, ''));
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
async function pool(items, callback, concurrency = 3) {
  let index = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (index < items.length) {
      const item = items[index++];
      try { await callback(item); } catch (error) { errors.push(error.message); }
    }
  }));
}
function flightValue(html, key) {
  const text = [...html.matchAll(/self\.__next_f\.push\((.*?)\)<\/script>/g)]
    .map(m => JSON.parse(m[1])).filter(a => typeof a[1] === 'string').map(a => a[1]).join('');
  const start = text.indexOf('"' + key + '":');
  assert(start >= 0, 'Deployed page does not contain ' + key);
  const offset = start + key.length + 3;
  let depth = 0, quoted = false, escaped = false;
  for (let i = offset; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') quoted = false;
    } else if (c === '"') quoted = true;
    else if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') {
      depth--;
      if (depth === 0) return JSON.parse(text.slice(offset, i + 1), (_key, value) => value === '$undefined' ? undefined : value);
    }
  }
  throw new Error('Incomplete deployed ' + key + ' data');
}
async function request(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, url + ': HTTP ' + response.status);
  return response;
}
try {
  assert.equal(properties.length, 26);
  for (const [slug, url] of Object.entries(covers)) {
    const property = properties.find(p => p.slug === slug);
    assert(property?.images.some(image => image.url === url), 'Reviewed cover is not in the documented gallery: ' + slug);
  }
  for (const p of properties) {
    const files = fs.readdirSync(path.join(root, 'public/properties', p.slug)).filter(f => f.endsWith('.webp'));
    assert.equal(files.length, p.images.length, 'Unexpected local image count: property ' + p.number);
    for (const image of p.images) assert.equal(sha(fs.readFileSync(path.join(root, 'public', image.url))), image.sha256, 'Wrong source photograph: ' + image.url);
  }
  const result = { properties: 26, sourcePhotographs: properties.reduce((n, p) => n + p.images.length, 0), localPhotographsVerified: true, site: siteArg?.slice(7) ?? null, dataFieldsVerified: false, detailPagesVerified: 0, livePhotographsVerified: 0, optimizedThumbnailsVerified: 0 };
  if (siteArg) {
    const origin = new URL(siteArg.slice(7)).origin;
    const search = await request(origin + '/search');
    const listings = flightValue(await search.text(), 'properties');
    for (const p of properties) {
      const live = listings.find(l => l.id === p.slug);
      check(Boolean(live), 'Property ' + p.number + ' is missing from search');
      if (!live) continue;
      check(JSON.stringify(live.images) === JSON.stringify(displayedImages(p)), 'Property ' + p.number + ': gallery order, count or uniqueness differs');
      if (imagesOnly) continue;
      const f = p.fields;
      for (const [source, key] of Object.entries({ 'PROPERTY ADDRESS': 'address', 'PROPERTY TYPE': 'type', STOREY: 'storey', 'PROPERTY SIZE': 'floorAreaSqm', CONDITION: 'condition', FURNISHING: 'furnishing', BEDROOM: 'bedrooms', BATHROOMS: 'bathrooms', TOILET: 'toilets', 'ASKING PRICE': 'askingPrice', 'PROPERTY STYLE': 'style', DISTRICT: 'district', 'ECO RATING': 'ecoRating', TENURE: 'tenure', 'REMAINING LEASE TERMS': 'remainingLeaseTerm', STATUS: 'status' })) {
        const compare = ['PROPERTY SIZE', 'BEDROOM', 'BATHROOMS', 'TOILET', 'ASKING PRICE'].includes(source) ? num : norm;
        check(compare(f[source]) === compare(live[key]), 'Property ' + p.number + ': ' + source + ' differs');
      }
      check(norm(f.AGENT) === norm(live.agent.name), 'Property ' + p.number + ': agent differs');
      const expectedPhones = (f.CONTACT.match(/\+?233\d{9}/g) ?? []).map(norm).sort();
      const actualPhones = [live.agent.phone, live.agent.secondaryPhone].filter(Boolean).map(norm).sort();
      check(JSON.stringify(expectedPhones) === JSON.stringify(actualPhones), 'Property ' + p.number + ': exact documented phone set differs');
      const amenities = f.FACILITIES.split(',').map(norm).sort();
      check(JSON.stringify(amenities) === JSON.stringify(live.facilities.map(norm).sort()), 'Property ' + p.number + ': amenities differ');
      const green = p.number === 29 ? ['Balcony', 'Mature trees, lawn and landscaping'] : norm(f['GREEN FEATURES']) === 'notspecified' ? [] : f['GREEN FEATURES'].split(',');
      check(JSON.stringify(green.map(norm).sort()) === JSON.stringify(live.greenFeatures.map(g => norm(g.label)).sort()), 'Property ' + p.number + ': green features differ');
      if (f['SELF CONTAINED'] || f['SELF-CONTAINED']) check(live.selfContained === true, 'Property ' + p.number + ': self-contained value differs');
    }
    await pool(properties, async p => {
      const response = await request(origin + '/property/' + p.slug);
      const html = await response.text();
      const gallery = flightValue(html, 'images');
      check(JSON.stringify(gallery) === JSON.stringify(displayedImages(p)), 'Property ' + p.number + ': detail gallery differs');
      if (!imagesOnly) for (const phone of p.fields.CONTACT.match(/\+?233\d{9}/g) ?? []) check(html.includes('tel:' + phone), 'Property ' + p.number + ': documented phone absent from detail page: ' + phone);
      result.detailPagesVerified++;
    });
    await pool(properties.flatMap(p => p.images), async image => {
      const response = await request(origin + image.url);
      check(response.headers.get('content-type')?.startsWith('image/'), 'Image content type missing: ' + image.url);
      check(sha(Buffer.from(await response.arrayBuffer())) === image.sha256, 'Deployed source photograph differs: ' + image.url);
      result.livePhotographsVerified++;
    }, 4);
    await pool(properties, async p => {
      const response = await request(origin + '/_next/image?' + new URLSearchParams({ url: displayedImages(p)[0], w: '1080', q: '90' }));
      check(response.headers.get('content-type')?.startsWith('image/'), 'Optimized thumbnail is not an image: property ' + p.number);
      await response.arrayBuffer();
      result.optimizedThumbnailsVerified++;
    }, 2);
    result.dataFieldsVerified = !imagesOnly && errors.length === 0;
  }
  result.errors = errors;
  const outputDir = path.join(root, 'reports/property-audit-11-36');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, siteArg ? 'release-verification.json' : 'local-release-verification.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  if (errors.length) process.exitCode = 1;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
