import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkPhotoPolicy } from './lib/property-photo-workflow.mjs';

try {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  console.log('Property photograph policy passed:', checkPhotoPolicy(root));
} catch (error) {
  console.error(error.message); process.exitCode = 1;
}
