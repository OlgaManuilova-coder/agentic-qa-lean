// © 2026 Olga Manuilova — Agentic QA Framework (lean edition). Apache License 2.0: keep this notice and the NOTICE file in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean
// Lane scheduler: Longest-Processing-Time-first with continuous refill.
//
// Why not "chunk the suites into batches of N and await each batch"? A batch barrier costs the
// slowest suite of every batch and leaves freed lanes idle. LPT + refill (always hand the next-longest
// suite to whichever lane frees up first) is near-optimal for a small number of lanes and degrades
// gracefully when estimates are wrong. Do not build a smarter bin-packer before measuring.

/**
 * @param {{id:string, estimatedMinutes:number}[]} suites
 * @param {number} laneCount
 * @returns {{ lanes: {lane:number, suites:string[], minutes:number}[], makespan:number, total:number }}
 */
export function planLanes(suites, laneCount) {
  if (!Number.isInteger(laneCount) || laneCount < 1) throw new Error('laneCount must be a positive integer');
  const lanes = Array.from({ length: laneCount }, (_, i) => ({ lane: i + 1, suites: [], minutes: 0 }));
  const ordered = [...suites].sort((a, b) => b.estimatedMinutes - a.estimatedMinutes || a.id.localeCompare(b.id));
  for (const s of ordered) {
    const lane = lanes.reduce((min, l) => (l.minutes < min.minutes ? l : min), lanes[0]);
    lane.suites.push(s.id);
    lane.minutes += s.estimatedMinutes;
  }
  const total = suites.reduce((n, s) => n + s.estimatedMinutes, 0);
  return { lanes, makespan: Math.max(0, ...lanes.map((l) => l.minutes)), total };
}
