import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/property-watermarks.json'), 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const asset = url => {
  const filename = path.resolve(root, 'public', url.replace(/^\//, ''));
  assert(filename.startsWith(path.join(root, 'public') + path.sep), 'Invalid image path');
  return filename;
};
const results = [];
try {
  for (const [sourceUrl, item] of Object.entries(manifest.images)) {
    const source = asset(sourceUrl);
    const output = asset(item.url);
    const maskFile = path.resolve(root, item.mask);
    assert(maskFile.startsWith(path.join(root, 'data/property-watermark-masks') + path.sep), 'Invalid mask path');
    assert.equal(sha(fs.readFileSync(source)), item.sourceSha256, 'Original photograph changed: ' + sourceUrl);
    assert.equal(sha(fs.readFileSync(output)), item.sha256, 'Edited photograph differs: ' + sourceUrl);
    assert.equal(sha(fs.readFileSync(maskFile)), item.maskSha256, 'Edit mask differs: ' + sourceUrl);
    const [{ data: before, info }, { data: after, info: edited }, mask] = await Promise.all([
      sharp(source).removeAlpha().toColourspace('srgb').raw().toBuffer({ resolveWithObject: true }),
      sharp(output).removeAlpha().toColourspace('srgb').raw().toBuffer({ resolveWithObject: true }),
      sharp(maskFile).greyscale().raw().toBuffer(),
    ]);
    assert.equal(info.width, item.width);
    assert.equal(info.height, item.height);
    assert.equal(edited.width, info.width);
    assert.equal(edited.height, info.height);
    assert.equal(info.channels, 3);
    assert.equal(edited.channels, 3);
    assert.equal(mask.length, info.width * info.height);
    let changed = 0, outside = 0, allowed = 0;
    for (let pixel = 0; pixel < mask.length; pixel++) {
      if (mask[pixel]) allowed++;
      const index = pixel * 3;
      if (before[index] === after[index] && before[index + 1] === after[index + 1] && before[index + 2] === after[index + 2]) continue;
      changed++;
      if (!mask[pixel]) outside++;
    }
    assert.equal(outside, 0, 'Photo pixels outside the approved lettering mask changed: ' + sourceUrl);
    assert.equal(changed, item.changedPixels, 'Unexpected edit pixel count: ' + sourceUrl);
    assert.equal(allowed, item.maskPixels, 'Unexpected mask pixel count: ' + sourceUrl);
    assert(changed > 0 && allowed < mask.length * 0.06, 'Unexpected edit extent: ' + sourceUrl);
    results.push({ source: sourceUrl, changedPixels: changed, changedOutsideMask: outside });
    if (results.length % 50 === 0) console.log('Verified ' + results.length + ' watermark variants');
  }
  for (const [url, item] of Object.entries(manifest.unchanged)) {
    assert.equal(sha(fs.readFileSync(asset(url))), item.sourceSha256, 'Unmarked photograph changed: ' + url);
  }
  assert.equal(results.length, manifest.editedPhotographs);
  const summary = { editedPhotographsVerified: results.length, originalPhotographsPreserved: true, dimensionsPreserved: true, changedOutsideLetteringMasks: 0, unmarkedPhotographsPreserved: Object.keys(manifest.unchanged).length };
  const outputDir = path.join(root, 'reports/property-audit-11-36');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'watermark-pixel-verification.json'), JSON.stringify({ ...summary, photographs: results }, null, 2));
  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
