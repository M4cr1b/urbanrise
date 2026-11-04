import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { localTsLoader } from '../lib/load-local-ts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const load = localTsLoader(root);
const imports = load(path.join(root, 'src/lib/data/imported-properties.ts'));
const seed = load(path.join(root, 'src/lib/data/seed-source.ts'));
const { properties37To44 } = load(path.join(root, 'src/lib/data/properties-37-44.ts'));
const { properties45To51 } = load(path.join(root, 'src/lib/data/properties-45-51.ts'));
const allBundled = [...properties37To44, ...properties45To51];

test('all bundled listings have the registered exterior and branded gallery', () => {
  const additions = imports.unpublishedProperties([]);
  assert.equal(additions.length, allBundled.length);
  assert.equal(additions.reduce((sum, p) => sum + p.images.length, 0), allBundled.reduce((sum, p) => sum + p.images.length, 0));
  for (const p of additions) {
    assert.equal(p.images[0], `/property-photos/${p.id}/01-urbanrise.webp`);
    assert(p.images.every(url => url.startsWith(`/property-photos/${p.id}/`)));
  }
});

test('database changes replace bundled values without duplicate or stale filter results', () => {
  const original = imports.getImportedProperty(properties37To44[0].id);
  const updated = { ...original, askingPrice: 100000, status: 'Sold' };
  const additions = imports.unpublishedProperties([updated.id]);
  const merged = imports.mergeProperties([updated], additions);
  assert.equal(merged.length, allBundled.length);
  assert.equal(merged.find(p => p.id === updated.id).askingPrice, 100000);
  assert.equal(merged.filter(p => imports.matchesPropertyFilters(p, { status: 'Available' })).length, allBundled.length - 1);
  assert.equal(additions.filter(p => p.id === original.id).length, 0);
});

test('a published record outside active coverage cannot reappear from the bundle', () => {
  const id = properties37To44[1].id;
  assert(!imports.unpublishedProperties([id]).some(p => p.id === id));
  assert.equal(imports.getImportedProperty('unknown-listing'), null);
});

test('compound-house, beds, price, eco and locality searches keep exact matches', () => {
  const additions = imports.unpublishedProperties([]);
  const matches = f => additions.filter(p => imports.matchesPropertyFilters(p, f)).map(p => p.id);
  assert.deepEqual(matches({ type: 'Compound House' }), [properties37To44[1].id, properties37To44[2].id]);
  assert.deepEqual(matches({ query: 'aMrAhIa', minBeds: 3, maxBeds: 3, minPrice: 1170000, maxPrice: 1170000, minEcoRating: 'D', tenure: 'Leasehold', status: 'Available' }), [properties37To44[5].id]);
  assert.deepEqual(matches({ minEcoRating: 'C' }), properties45To51.filter(p => ['A', 'B', 'C'].includes(p.ecoRating)).map(p => p.id));
  assert.equal(matches({ status: 'Sold' }).length, 0);
  assert.equal(matches({ query: 'Adabraka' }).length, 3);
  assert.equal(matches({ query: 'Adenta' }).length, 5 + properties45To51.length);
});

test('credential-free source includes the same import, details and two compound houses', async () => {
  const properties = await seed.getProperties();
  for (const p of allBundled) {
    assert((await seed.getPropertyIds()).includes(p.id));
    assert.deepEqual(await seed.getPropertyById(p.id), imports.getImportedProperty(p.id));
  }
  assert.equal((await seed.searchProperties({ type: 'Compound House' })).length, 2);
  assert.equal(new Set(properties.map(p => p.id)).size, properties.length);
});

test('property 41 replacement retires the old listing in both bundled sources', async () => {
  const oldId = 'adenta-villa-ernestdoyi';
  const replacementId = 'adenta-ssnit-villa-mainstay';
  assert.equal(imports.getImportedProperty(oldId), null);
  assert.equal(await seed.getPropertyById(oldId), null);
  assert(!(await seed.getPropertyIds()).includes(oldId));
  assert.equal(imports.unpublishedProperties([]).filter(p => p.id === replacementId).length, 1);
  const replacement = imports.getImportedProperty(replacementId);
  assert.equal(replacement.agent.name, 'Mainstay Property Management');
  assert.equal(replacement.agent.phone, '+233592023296');
  assert.equal(replacement.agent.secondaryPhone, undefined);
  assert.equal(replacement.askingPrice, 2690000);
  assert.equal(replacement.images.length, 6);
});
