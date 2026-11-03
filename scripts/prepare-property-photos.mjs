import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { preparePhotos } from './lib/property-photo-workflow.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const plans = args.filter(arg => !arg.startsWith('--'));
try {
  if (plans.length !== 1 || args.some(arg => arg.startsWith('--') && !['--apply', '--reviewed'].includes(arg)) || (args.includes('--reviewed') && !args.includes('--apply'))) throw new Error('Usage: npm run photos:prepare -- path/to/plan.json [--apply --reviewed]');
  console.log(JSON.stringify(await preparePhotos(root, path.resolve(plans[0]), { apply: args.includes('--apply'), reviewed: args.includes('--reviewed') }), null, 2));
} catch (error) {
  console.error(error.message); process.exitCode = 1;
}
