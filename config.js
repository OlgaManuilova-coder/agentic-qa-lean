// Import this file (`import './config.js'`) from any script or spec that needs configuration.
// It loads the layered env files into process.env and exits if a CORE variable is missing.
// Read values with process.env.X — there is no other access path.

import { loadEnv } from './scripts/lib/load-env.mjs';

export const CORE_VARS = ['FRONT_URL', 'STANDARD_USER', 'USER_PASSWORD'];

const { testEnv } = loadEnv();

const missing = CORE_VARS.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`[config] TEST_ENV=${testEnv}: missing required variables: ${missing.join(', ')}`);
  console.error('[config] Run `npm run env:check` for details.');
  process.exit(1);
}

export const TEST_ENV = testEnv;
