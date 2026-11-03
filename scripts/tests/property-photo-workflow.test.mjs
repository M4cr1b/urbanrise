import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import sharp from 'sharp';
import { preparePhotos, checkPhotoPolicy } from '../lib/property-photo-workflow.mjs';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const tempParent = path.join(project, '.shots/property-workflow-tests');
const json = (file, data) => fs.writeFileSync(file, JSON.stringify(data));
async function fixture(t) {
  fs.mkdirSync(tempParent, { recursive: true });
  const root = fs.mkdtempSync(path.join(tempParent, 'test-'));
  t.after(() => {
    const resolved = fs.realpathSync(root);
    assert(resolved.startsWith(fs.realpathSync(tempParent) + path.sep));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  for (const dir of ['data', 'public/properties', 'public/property-photos', 'input']) fs.mkdirSync(path.join(root, dir), { recursive: true });
  const policy = JSON.parse(fs.readFileSync(path.join(project, 'data/property-photo-policy.json')));
  policy.historicalUnusedSources = {};
  policy.historicalUnmarkedSources = {};
  json(path.join(root, 'data/property-photo-policy.json'), policy);
  json(path.join(root, 'data/property-watermarks.json'), { caption: policy.caption, editedPhotographs: 0, images: {}, unchanged: {} });
  json(path.join(root, 'data/property-covers.json'), {});
  await sharp({ create: { width: 640, height: 480, channels: 3, background: '#266273' } }).jpeg().toFile(path.join(root, 'input/interior.jpg'));
  await sharp({ create: { width: 500, height: 800, channels: 3, background: '#afc8dc' } }).png().toFile(path.join(root, 'input/exterior.png'));
  const plan = { slug: 'test-house', sourceDirectory: 'input', sourcePlatformWatermarks: 'none', exterior: 'exterior.png', photos: [{ file: 'interior.jpg' }, { file: 'exterior.png', captionY: 0.7 }] };
  const planFile = path.join(root, 'plan.json'); json(planFile, plan);
  return { root, plan, planFile };
}

test('preview is separate from publication and approval is required', async t => {
  const { root, planFile } = await fixture(t);
  const result = await preparePhotos(root, planFile);
  assert.equal(result.applied, false);
  assert(fs.existsSync(path.join(result.preview, '01-urbanrise.webp')));
  assert.deepEqual(fs.readdirSync(path.join(root, 'public/properties')), []);
  assert.equal(checkPhotoPolicy(root).watermarkedPhotos, 0);
  await assert.rejects(preparePhotos(root, planFile, { apply: true }), /--apply --reviewed/);
});

test('approved photos retain pixels and dimensions, use the exterior, and cannot be stamped twice', async t => {
  const { root, planFile } = await fixture(t);
  await preparePhotos(root, planFile);
  const result = await preparePhotos(root, planFile, { apply: true, reviewed: true });
  assert.deepEqual(result.gallery, ['/properties/test-house/02.png', '/properties/test-house/01.jpg']);
  assert.deepEqual(checkPhotoPolicy(root), { properties: 1, watermarkedPhotos: 2, reviewedUnchangedPhotos: 0 });
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/property-watermarks.json')));
  for (const item of Object.values(manifest.images)) {
    assert.equal(item.changedOutsideMask, 0); assert(item.changedPixels > 0);
    const dimensions = await sharp(path.join(root, 'public', item.url)).metadata();
    assert.equal(dimensions.width, item.width); assert.equal(dimensions.height, item.height);
  }
  assert.deepEqual(fs.readFileSync(path.join(root, 'input/interior.jpg')), fs.readFileSync(path.join(root, 'public/properties/test-house/01.jpg')));
  await assert.rejects(preparePhotos(root, planFile), /already has reviewed photos/);
});

test('deployment rejects unprepared photos, missing covers and altered display copies', async t => {
  const { root, planFile } = await fixture(t);
  await preparePhotos(root, planFile);
  await preparePhotos(root, planFile, { apply: true, reviewed: true });
  const extra = path.join(root, 'public/properties/test-house/unprepared.jpg');
  fs.copyFileSync(path.join(root, 'input/interior.jpg'), extra);
  assert.throws(() => checkPhotoPolicy(root), /Unprepared photograph/);
  fs.unlinkSync(extra);
  const manifestFile = path.join(root, 'data/property-watermarks.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile));
  json(manifestFile, { ...manifest, unchanged: { '/properties/test-house/unprepared.jpg': {} } });
  assert.throws(() => checkPhotoPolicy(root), /New photographs must have Urban rise captions/);
  json(manifestFile, manifest);
  const coverFile = path.join(root, 'data/property-covers.json');
  const covers = JSON.parse(fs.readFileSync(coverFile)); json(coverFile, {});
  assert.throws(() => checkPhotoPolicy(root), /reviewed exterior cover/);
  json(coverFile, covers);
  fs.appendFileSync(path.join(root, 'public/property-photos/test-house/01-urbanrise.webp'), 'changed');
  assert.throws(() => checkPhotoPolicy(root), /differs from its review/);
});

test('old platform marks and an invalid exterior are rejected before publication', async t => {
  const { root, plan, planFile } = await fixture(t);
  json(planFile, { ...plan, sourcePlatformWatermarks: 'jiji' });
  await assert.rejects(preparePhotos(root, planFile), /individual editing first/);
  json(planFile, { ...plan, exterior: 'missing.jpg' });
  await assert.rejects(preparePhotos(root, planFile), /Select an exterior/);
  assert.deepEqual(fs.readdirSync(path.join(root, 'public/properties')), []);
});

test('changing a preview or its source invalidates approval', async t => {
  const { root, planFile } = await fixture(t);
  const result = await preparePhotos(root, planFile);
  fs.appendFileSync(path.join(result.preview, '01-urbanrise.webp'), 'changed');
  await assert.rejects(preparePhotos(root, planFile, { apply: true, reviewed: true }), /Preview was modified/);
  assert.deepEqual(fs.readdirSync(path.join(root, 'public/properties')), []);
  await preparePhotos(root, planFile);
  fs.appendFileSync(path.join(root, 'input/interior.jpg'), 'changed');
  await assert.rejects(preparePhotos(root, planFile, { apply: true, reviewed: true }), /Generate and inspect the preview/);
});

test('reviewed replacements are registered without adding a second caption', async t => {
  const { root, plan, planFile } = await fixture(t);
  const branded = await preparePhotos(root, planFile);
  const replacement = {
    ...plan,
    sourcePlatformWatermarks: 'reviewed-replacement',
    photos: plan.photos.map((photo, index) => {
      const stem = String(index + 1).padStart(2, '0');
      return { ...photo, editedFile: path.relative(root, path.join(branded.preview, stem + '-urbanrise.webp')), maskFile: path.relative(root, path.join(branded.preview, stem + '-mask.png')) };
    }),
  };
  json(planFile, replacement);
  const result = await preparePhotos(root, planFile);
  const originalPreview = await sharp(path.join(branded.preview, '01-urbanrise.webp')).removeAlpha().raw().toBuffer();
  const replacementPreview = await sharp(path.join(result.preview, '01-urbanrise.webp')).removeAlpha().raw().toBuffer();
  assert.deepEqual(replacementPreview, originalPreview, 'A reviewed caption was altered or stamped twice');
  await preparePhotos(root, planFile, { apply: true, reviewed: true });
  assert.equal(checkPhotoPolicy(root).watermarkedPhotos, 2);
});
