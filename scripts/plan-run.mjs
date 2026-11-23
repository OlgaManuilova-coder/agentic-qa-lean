#!/usr/bin/env node
// Plans a regression run: expands a selection and assigns suites to browser lanes.
// The regression-orchestrator agent runs this first and dispatches one test-runner per lane.
// Usage: npm run regression:plan -- <selection> [--lanes N] [--json]

import { loadEnv } from './lib/load-env.mjs';
import { expandSelection, loadManifest } from './lib/suites.mjs';
import { planLanes } from './lib/scheduler.mjs';

loadEnv();
const args = process.argv.slice(2);
const selection = args.find((a) => !a.startsWith('--')) || 'smoke';
const lanesArg = args.indexOf('--lanes');
const manifest = loadManifest();
const available = manifest.browserPool.filter((b) => b.status === 'available');
const requested = lanesArg >= 0 ? Number(args[lanesArg + 1]) : Number(process.env.MAX_LANES || available.length);
const laneCount = Math.max(1, Math.min(requested, available.length));

const suites = expandSelection(manifest, selection);
const plan = planLanes(suites, laneCount);
const byId = new Map(suites.map((s) => [s.id, s]));
const lanes = plan.lanes.map((l, i) => ({
  ...l,
  browserServer: available[i].serverName,
  suites: l.suites.map((id) => ({ id, file: byId.get(id).file, agent: byId.get(id).agent })),
}));

if (args.includes('--json')) {
  console.log(JSON.stringify({ selection, laneCount, makespan: plan.makespan, total: plan.total, lanes }, null, 2));
} else {
  console.log(`Selection "${selection}": ${suites.length} suites on ${laneCount} lane(s)`);
  for (const l of lanes) {
    console.log(`  lane ${l.lane} [${l.browserServer}] ~${l.minutes}m: ${l.suites.map((s) => s.id).join(', ') || '(idle)'}`);
  }
  console.log(`Estimated wall clock ~${plan.makespan}m (sequential would be ~${plan.total}m)`);
}
