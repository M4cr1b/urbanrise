import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { localTsLoader } from './lib/load-local-ts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const reference = read('data/property-reference-37-44.json');
const covers = read('data/property-covers.json');
const watermarks = read('data/property-watermarks.json');
const load = localTsLoader(root);
const { properties37To44: listings } = load(path.join(root, 'src/lib/data/properties-37-44.ts'));
const norm = value => String(value).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const numeric = value => Number(String(value).replace(/[^\d.]/g, ''));
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const fieldMap = {
  'PROPERTY ADDRESS': 'address', 'PROPERTY TYPE': 'type', STOREY: 'storey',
  'PROPERTY SIZE': 'floorAreaSqm', CONDITION: 'condition', FURNISHING: 'furnishing',
  BEDROOM: 'bedrooms', BATHROOMS: 'bathrooms', TOILET: 'toilets',
  'ASKING PRICE': 'askingPrice', 'PROPERTY STYLE': 'style', DISTRICT: 'district',
  'ECO RATING': 'ecoRating', TENURE: 'tenure', 'REMAINING LEASE TERMS': 'remainingLeaseTerm', STATUS: 'status',
};
const numericFields = ['PROPERTY SIZE', 'BEDROOM', 'BATHROOMS', 'TOILET', 'ASKING PRICE'];
let photos = 0, phones = 0;
assert.equal(listings.length, 8);
assert.equal(new Set(listings.map(p => p.id)).size, 8);
for (const [index, source] of reference.properties.entries()) {
  const property = listings[index], label = 'Property ' + source.number, fields = source.fields;
  assert.equal(source.number, index + 37);
  assert.equal(Object.keys(fields).length, 20, label);
  for (const [field, key] of Object.entries(fieldMap)) {
    const compare = numericFields.includes(field) ? numeric : norm;
    assert.equal(compare(property[key]), compare(fields[field]), label + ': ' + field);
  }
  assert.equal(property.region, 'Greater Accra', label);
  assert.equal(property.agent.name, fields.AGENT, label);
  const expectedPhones = fields.CONTACT.match(/\+233\d{9}/g);
  const actualPhones = [property.agent.phone, property.agent.secondaryPhone].filter(Boolean);
  assert.deepEqual(actualPhones, expectedPhones, label + ': exact documented phones');
  phones += actualPhones.length;
  const facilities = [...new Set(fields.FACILITIES.split(',').map(norm).filter(Boolean))];
  assert.deepEqual(property.facilities.map(norm), facilities, label + ': facilities');
  assert.deepEqual(property.greenFeatures.map(feature => norm(feature.label)), fields['GREEN FEATURES'] === 'Not specified' ? [] : fields['GREEN FEATURES'].split(',').map(norm), label + ': green features');
  for (const key of ['selfContained', 'coords', 'yearBuilt', 'listedDate', 'leaseYearsRemaining']) assert(!Object.hasOwn(property, key), label + ': undocumented ' + key);
  const gallery = read('data/property-photo-galleries/' + property.id + '.json');
  assert.deepEqual(property.images, gallery.images, label + ': generated gallery');
  assert.equal(covers[property.id], gallery.exterior, label + ': exterior');
  assert.equal(gallery.images[0], gallery.exterior, label + ': exterior first');
  assert.equal(gallery.images.length, source.proposedImageOrder.length, label + ': photo count');
  assert.equal(source.proposedImageOrder[0], source.proposedCover.filename, label + ': selected source exterior');
  const files = fs.readdirSync(path.join(root, 'public/properties', property.id));
  assert.equal(files.length, gallery.images.length, label + ': no unintended files');
  for (const [order, filename] of source.proposedImageOrder.entries()) {
    const original = source.images.find(image => image.filename === filename);
    const url = gallery.images[order], edited = watermarks.images[url];
    assert(edited, label + ': missing caption registration');
    assert.equal(hash(path.join(root, 'public', url)), original.sha256, label + ': source photograph association');
    assert.equal(edited.sourceSha256, original.sha256, label + ': registered source hash');
    assert.equal(hash(path.join(root, 'public', edited.url)), edited.sha256, label + ': reviewed output');
    assert.equal(edited.width, original.width, label + ': preserved width');
    assert.equal(edited.height, original.height, label + ': preserved height');
    photos++;
  }
}
assert.equal(listings.filter(p => p.type === 'Compound House').length, 2);
assert.equal(listings[3].storey, 'Single Storey');
assert.equal(photos, 63); assert.equal(phones, 10);
const result = { properties: 8, documentedFields: 160, exactContactNumbers: phones, associatedPhotos: photos, exteriorCovers: 8, compoundHouses: 2, originalDimensionsPreserved: true };

function flightValue(html, key) {
  const text = [...html.matchAll(/self\.__next_f\.push\((.*?)\)<\/script>/g)]
    .map(match => JSON.parse(match[1])).filter(row => typeof row[1] === 'string').map(row => row[1]).join('');
  const start = text.indexOf('"' + key + '":');
  assert(start >= 0, 'Page does not contain ' + key);
  const offset = start + key.length + 3;
  let depth = 0, quoted = false, escaped = false;
  for (let index = offset; index < text.length; index++) {
    const character = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') quoted = false;
    } else if (character === '"') quoted = true;
    else if (character === '[' || character === '{') depth++;
    else if (character === ']' || character === '}') {
      depth--;
      if (depth === 0) return JSON.parse(text.slice(offset, index + 1), (_key, value) => value === '$undefined' ? undefined : value);
    }
  }
  throw new Error('Incomplete ' + key + ' data');
}
const site = process.argv.find(argument => argument.startsWith('--site='))?.slice(7);
if (site) {
  const origin = new URL(site).origin;
  async function request(url) {
    const response = await fetch(origin + url, { signal: AbortSignal.timeout(60000) });
    assert.equal(response.status, 200, url + ': HTTP ' + response.status);
    return response;
  }
  const catalog = flightValue(await (await request('/search')).text(), 'properties');
  const { orderPropertyImages } = load(path.join(root, 'src/lib/data/property-images.ts'));
  assert.equal(new Set(catalog.map(p => p.id)).size, catalog.length, 'Duplicate catalog records');
  for (const property of listings) {
    const expected = { ...property, images: orderPropertyImages(property.id, property.images) };
    assert.deepEqual(catalog.find(p => p.id === property.id), expected, property.id + ': served listing differs');
    const html = await (await request('/property/' + property.id)).text();
    assert.deepEqual(flightValue(html, 'images'), expected.images, property.id + ': detail gallery');
    for (const phone of [property.agent.phone, property.agent.secondaryPhone].filter(Boolean)) assert(html.includes('tel:' + phone), property.id + ': missing contact ' + phone);
    const thumbnail = await request('/_next/image?' + new URLSearchParams({ url: expected.images[0], w: '1080', q: '90' }));
    assert(thumbnail.headers.get('content-type')?.startsWith('image/'), property.id + ': thumbnail content');
    await thumbnail.arrayBuffer();
  }
  const assets = listings.flatMap(property => property.images.map(url => watermarks.images[url]));
  let next = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (next < assets.length) {
      const image = assets[next++], response = await request(image.url);
      const actual = createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
      assert.equal(actual, image.sha256, 'Served photograph differs: ' + image.url);
    }
  }));
  Object.assign(result, { site: origin, catalogListings: catalog.length, detailPagesVerified: 8, optimizedExteriorThumbnailsVerified: 8, servedPhotographHashesVerified: 63 });
}
console.log(JSON.stringify(result, null, 2));
