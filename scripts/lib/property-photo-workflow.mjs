import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// This offline workflow must release photo handles between previews on Windows.
sharp.cache(false);

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); };
const inside = (base, relative) => {
  const file = path.resolve(base, relative);
  assert(file.startsWith(path.resolve(base) + path.sep), 'Path must remain inside ' + base);
  return file;
};
const imagePattern = /\.(webp|jpe?g|png)$/i;
const asset = (root, url) => {
  assert(typeof url === 'string' && url.startsWith('/') && !url.includes('\\'), 'Expected a local photo URL');
  return inside(path.join(root, 'public'), url.slice(1));
};

/** Fast deployment check: previously reviewed pixels are protected by their hashes. */
export function checkPhotoPolicy(root) {
  const manifest = read(path.join(root, 'data/property-watermarks.json'));
  const covers = read(path.join(root, 'data/property-covers.json'));
  const policy = read(path.join(root, 'data/property-photo-policy.json'));
  assert.equal(manifest.caption, policy.caption);
  assert.equal(manifest.editedPhotographs, Object.keys(manifest.images).length);
  const sources = new Set();
  const outputs = new Set();
  for (const [url, item] of Object.entries(manifest.images)) {
    assert(url.startsWith('/properties/') && item.url.startsWith('/property-photos/'), 'Invalid photograph registry URL');
    assert(item.mask.startsWith('data/property-watermark-masks/'), 'Invalid mask registry path');
    assert(!outputs.has(item.url), 'Repeated display URL: ' + item.url);
    outputs.add(item.url); sources.add(url);
    for (const [file, expected] of [[asset(root, url), item.sourceSha256], [asset(root, item.url), item.sha256], [inside(path.join(root, 'data/property-watermark-masks'), path.relative('data/property-watermark-masks', item.mask)), item.maskSha256]]) {
      assert.equal(hash(fs.readFileSync(file)), expected, 'Photo or mask differs from its review: ' + path.relative(root, file));
    }
  }
  assert.deepEqual(Object.keys(manifest.unchanged).sort(), Object.keys(policy.historicalUnmarkedSources).sort(), 'New photographs must have Urban rise captions');
  for (const [url, item] of Object.entries(manifest.unchanged)) {
    assert.equal(item.sourceSha256, policy.historicalUnmarkedSources[url], 'Historical unmarked exception differs');
    sources.add(url);
    assert.equal(hash(fs.readFileSync(asset(root, url))), item.sourceSha256, 'Previously reviewed source changed: ' + url);
  }
  const files = fs.readdirSync(path.join(root, 'public/properties'), { recursive: true }).filter(name => imagePattern.test(name));
  for (const name of fs.readdirSync(path.join(root, 'public/property-photos'), { recursive: true }).filter(name => imagePattern.test(name))) {
    const url = '/property-photos/' + name.split(path.sep).join('/');
    assert(outputs.has(url), 'Unreviewed display photograph: ' + url);
  }
  const slugs = new Set();
  for (const name of files) {
    const url = '/properties/' + name.split(path.sep).join('/');
    slugs.add(name.split(path.sep)[0]);
    if (sources.has(url)) continue;
    const historicalHash = policy.historicalUnusedSources[url];
    assert(historicalHash, 'Unprepared photograph: ' + url + '. Use npm run photos:prepare before publishing.');
    assert.equal(hash(fs.readFileSync(asset(root, url))), historicalHash, 'Historical unused photograph changed: ' + url);
  }
  for (const slug of slugs) {
    const cover = covers[slug];
    assert(cover?.startsWith('/properties/' + slug + '/') && sources.has(cover), 'A reviewed exterior cover is required for ' + slug);
  }
  for (const [slug, url] of Object.entries(covers)) assert(slugs.has(slug) && sources.has(url), 'Stale exterior cover: ' + slug);
  return { properties: slugs.size, watermarkedPhotos: outputs.size, reviewedUnchangedPhotos: Object.keys(manifest.unchanged).length };
}

async function comparePixels(source, output, maskFile) {
  const [{ data: before, info }, { data: after, info: edited }, { data: mask, info: maskInfo }] = await Promise.all([
    sharp(source).removeAlpha().toColourspace('srgb').raw().toBuffer({ resolveWithObject: true }),
    sharp(output).removeAlpha().toColourspace('srgb').raw().toBuffer({ resolveWithObject: true }),
    sharp(maskFile).greyscale().raw().toBuffer({ resolveWithObject: true }),
  ]);
  assert.equal(edited.width, info.width); assert.equal(edited.height, info.height);
  assert.equal(info.channels, 3); assert.equal(edited.channels, 3);
  assert.equal(maskInfo.width, info.width, 'Mask width differs'); assert.equal(maskInfo.height, info.height, 'Mask height differs');
  assert.equal(mask.length, info.width * info.height);
  let changedPixels = 0, maskPixels = 0;
  for (let p = 0; p < mask.length; p++) {
    if (mask[p]) maskPixels++;
    const i = p * 3;
    if (before[i] !== after[i] || before[i + 1] !== after[i + 1] || before[i + 2] !== after[i + 2]) {
      assert(mask[p], 'Photo changed outside the caption'); changedPixels++;
    }
  }
  assert(changedPixels > 0 && maskPixels < mask.length * 0.06, 'Invalid caption area');
  return { width: info.width, height: info.height, changedPixels, maskPixels, changedOutsideMask: 0 };
}

export async function preparePhotos(root, planFile, { apply = false, reviewed = false } = {}) {
  const plan = read(planFile);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(plan.slug), 'A lowercase property slug is required');
  assert(['none', 'reviewed-replacement'].includes(plan.sourcePlatformWatermarks), 'Use clean photos or a reviewed replacement with its pixel mask. Old lettering needs individual editing first.');
  const replacement = plan.sourcePlatformWatermarks === 'reviewed-replacement';
  assert(typeof plan.sourceDirectory === 'string' && plan.sourceDirectory.length > 0, 'Set sourceDirectory in the plan');
  assert(Array.isArray(plan.photos) && plan.photos.length > 0, 'List the photographs explicitly');
  assert(plan.photos.every(photo => photo && typeof photo.file === 'string' && photo.file.length > 0), 'Every photograph needs a filename');
  assert.equal(new Set(plan.photos.map(photo => photo.file.toLowerCase())).size, plan.photos.length, 'Repeated source filename');
  assert(plan.photos.some(photo => photo.file === plan.exterior), 'Select an exterior photograph from this gallery');
  const policy = read(path.join(root, 'data/property-photo-policy.json'));
  const manifestFile = path.join(root, 'data/property-watermarks.json');
  const coverFile = path.join(root, 'data/property-covers.json');
  const manifest = read(manifestFile), covers = read(coverFile);
  assert(!covers[plan.slug] && !Object.keys(manifest.images).some(url => url.startsWith('/properties/' + plan.slug + '/')), 'This property already has reviewed photos; do not overwrite them');
  for (const dir of ['public/properties', 'public/property-photos', 'data/property-watermark-masks']) {
    assert(!fs.existsSync(inside(path.join(root, dir), plan.slug)), 'Destination already exists: ' + dir + '/' + plan.slug);
  }
  const sourceDirectory = path.resolve(path.dirname(planFile), plan.sourceDirectory);
  const inputs = plan.photos.map((photo, index) => {
    assert.equal(path.basename(photo.file), photo.file, 'Use a filename, not a path');
    assert(imagePattern.test(photo.file), 'Supported source formats: JPEG, PNG and WebP');
    const source = inside(sourceDirectory, photo.file);
    assert(!fs.lstatSync(source).isSymbolicLink(), 'Source photos must be regular files');
    const stem = String(index + 1).padStart(2, '0');
    let editedSource, editedMask;
    if (replacement) {
      assert(typeof photo.editedFile === 'string' && typeof photo.maskFile === 'string', 'Every replacement needs editedFile and maskFile, relative to the plan');
      editedSource = path.resolve(path.dirname(planFile), photo.editedFile);
      editedMask = path.resolve(path.dirname(planFile), photo.maskFile);
    } else assert(!photo.editedFile && !photo.maskFile, 'Use reviewed-replacement mode for already edited photographs');
    return { photo, source, stem, originalUrl: `/properties/${plan.slug}/${stem}${path.extname(photo.file).toLowerCase()}`, sourceSha256: hash(fs.readFileSync(source)), editedSource, editedMask, editedSha256: replacement ? hash(fs.readFileSync(editedSource)) : undefined, editedMaskSha256: replacement ? hash(fs.readFileSync(editedMask)) : undefined };
  });
  const fingerprint = hash(Buffer.from(JSON.stringify({ plan, policy, inputs: inputs.map(({ sourceSha256, editedSha256, editedMaskSha256 }) => ({ sourceSha256, editedSha256, editedMaskSha256 })) })));
  const preview = inside(path.join(root, '.shots/property-preparation'), plan.slug + '/' + fingerprint.slice(0, 16));
  const reviewFile = path.join(preview, 'review.json');
  if (!apply) {
    const images = {};
    fs.mkdirSync(preview, { recursive: true });
    for (const { photo, source, stem, originalUrl, sourceSha256, editedSource, editedMask } of inputs) {
      const metadata = await sharp(source).metadata();
      assert(!metadata.orientation || metadata.orientation === 1, 'Supply an upright photo without EXIF rotation: ' + photo.file);
      assert(!metadata.pages || metadata.pages === 1, 'Animated photos are not supported');
      assert(!metadata.hasAlpha, 'Supply an opaque property photograph');
      const { data, info } = await sharp(source).removeAlpha().toColourspace('srgb').raw().toBuffer({ resolveWithObject: true });
      const { width, height } = info;
      assert(width >= 100 && height >= 100, 'Photo is too small for a readable caption');
      const yRatio = photo.captionY ?? policy.captionY;
      assert(Number.isFinite(yRatio) && yRatio >= 0.1 && yRatio <= 0.9, 'captionY must be between 0.1 and 0.9');
      const fontSize = Math.max(8, Math.round(width * policy.fontWidthRatio));
      const output = path.join(preview, stem + '-urbanrise.webp'), maskFile = path.join(preview, stem + '-mask.png');
      if (replacement) {
        const edited = await sharp(editedSource).removeAlpha().toColourspace('srgb').raw().toBuffer({ resolveWithObject: true });
        assert.equal(edited.info.width, width, 'Replacement width differs');
        assert.equal(edited.info.height, height, 'Replacement height differs');
        await sharp(edited.data, { raw: edited.info }).webp({ lossless: true }).toFile(output);
        await sharp(editedMask).greyscale().png().toFile(maskFile);
        const metrics = await comparePixels(source, output, maskFile);
        images[originalUrl] = { url: `/property-photos/${plan.slug}/${stem}-urbanrise.webp`, mask: `data/property-watermark-masks/${plan.slug}/${stem}.png`, sourceSha256, sha256: hash(fs.readFileSync(output)), maskSha256: hash(fs.readFileSync(maskFile)), ...metrics, fontSize: photo.fontSize ?? fontSize, brand: { method: 'reviewed-platform-replacement' } };
        continue;
      }
      const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><text x="50%" y="${Math.round(height * yRatio)}" text-anchor="middle" font-family="${policy.fontFamily}" font-size="${fontSize}" fill="black" fill-opacity="${policy.fillOpacity}" stroke="white" stroke-opacity="${policy.outlineOpacity}" stroke-width="1" paint-order="stroke">${policy.caption}</text></svg>`);
      const overlay = await sharp(svg).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const mask = Buffer.alloc(width * height);
      for (let i = 0; i < mask.length; i++) mask[i] = overlay.data[i * 4 + 3] ? 255 : 0;
      await sharp(data, { raw: info }).composite([{ input: svg }]).webp({ lossless: true }).toFile(output);
      await sharp(mask, { raw: { width, height, channels: 1 } }).png().toFile(maskFile);
      const metrics = await comparePixels(source, output, maskFile);
      images[originalUrl] = { url: `/property-photos/${plan.slug}/${stem}-urbanrise.webp`, mask: `data/property-watermark-masks/${plan.slug}/${stem}.png`, sourceSha256, sha256: hash(fs.readFileSync(output)), maskSha256: hash(fs.readFileSync(maskFile)), ...metrics, fontSize, brand: { method: 'new-transparent-caption', captionY: yRatio } };
    }
    const cover = inputs.find(item => item.photo.file === plan.exterior).originalUrl;
    const gallery = [cover, ...inputs.map(item => item.originalUrl).filter(url => url !== cover)];
    write(reviewFile, { fingerprint, slug: plan.slug, cover, gallery, images });
    return { preview, reviewFile, images: inputs.length, applied: false };
  }
  assert(reviewed, 'Inspect every preview, confirm the exterior and caption position, then use --apply --reviewed');
  assert(fs.existsSync(reviewFile), 'Generate and inspect the preview before applying');
  const review = read(reviewFile);
  assert.equal(review.fingerprint, fingerprint, 'The plan or source photos changed after preview');
  assert.deepEqual(Object.keys(review.images), inputs.map(item => item.originalUrl), 'Review gallery differs');
  for (const { source, stem, originalUrl, sourceSha256 } of inputs) {
    const item = review.images[originalUrl];
    assert.equal(item.sourceSha256, sourceSha256);
    assert.equal(item.url, `/property-photos/${plan.slug}/${stem}-urbanrise.webp`);
    assert.equal(item.mask, `data/property-watermark-masks/${plan.slug}/${stem}.png`);
    const output = path.join(preview, stem + '-urbanrise.webp'), mask = path.join(preview, stem + '-mask.png');
    assert.equal(hash(fs.readFileSync(output)), item.sha256, 'Preview was modified');
    assert.equal(hash(fs.readFileSync(mask)), item.maskSha256, 'Preview mask was modified');
    const metrics = await comparePixels(source, output, mask);
    for (const [key, value] of Object.entries(metrics)) assert.equal(item[key], value);
  }
  const expectedCover = inputs.find(item => item.photo.file === plan.exterior).originalUrl;
  assert.equal(review.cover, expectedCover, 'Exterior selection changed');
  assert.deepEqual(review.gallery, [expectedCover, ...inputs.map(item => item.originalUrl).filter(url => url !== expectedCover)]);
  for (const { source, stem, originalUrl } of inputs) {
    const item = review.images[originalUrl];
    for (const [from, to] of [[source, asset(root, originalUrl)], [path.join(preview, stem + '-urbanrise.webp'), asset(root, item.url)], [path.join(preview, stem + '-mask.png'), inside(root, item.mask)]]) {
      fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL);
    }
    manifest.images[originalUrl] = item;
  }
  manifest.editedPhotographs = Object.keys(manifest.images).length;
  covers[plan.slug] = review.cover;
  write(manifestFile, manifest); write(coverFile, covers);
  write(path.join(root, 'data/property-photo-galleries', plan.slug + '.json'), { id: plan.slug, exterior: review.cover, images: review.gallery });
  return { preview, images: inputs.length, applied: true, gallery: review.gallery };
}
