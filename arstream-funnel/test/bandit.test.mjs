import { test } from "node:test";
import assert from "node:assert/strict";
import { chooseArm, applyEvent, parseArms, sampleBeta } from "../lib/bandit.mjs";

// Deterministic PRNG (mulberry32) so the tests are stable.
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test("beta samples stay in (0,1) and track the mean", () => {
  const r = rng(1);
  let sum = 0;
  for (let i = 0; i < 4000; i++) {
    const x = sampleBeta(30, 70, r);
    assert.ok(x > 0 && x < 1);
    sum += x;
  }
  assert.ok(Math.abs(sum / 4000 - 0.3) < 0.01);
});

test("bandit converges on the better arm", () => {
  const r = rng(7);
  const truth = { a: 0.05, b: 0.15, c: 0.08 };
  const stats = {};
  const picks = { a: 0, b: 0, c: 0 };
  for (let i = 0; i < 5000; i++) {
    const arm = chooseArm(["a", "b", "c"], stats, r);
    picks[arm]++;
    applyEvent(stats, arm, "view");
    if (r() < truth[arm]) applyEvent(stats, arm, "follow_click_after_preview");
  }
  assert.ok(picks.b > picks.a + picks.c, JSON.stringify(picks));
});

test("unexplored arms still get traffic", () => {
  const r = rng(3);
  const stats = { a: { views: 50, score: 2 } };
  const seen = new Set();
  for (let i = 0; i < 200; i++) seen.add(chooseArm(["a", "new"], stats, r));
  assert.ok(seen.has("new"));
});

test("score never exceeds views", () => {
  const stats = {};
  applyEvent(stats, "a", "view");
  applyEvent(stats, "a", "follow_verified");
  applyEvent(stats, "a", "follow_verified");
  assert.equal(stats.a.score, 1);
});

test("parseArms filters junk and dedupes", () => {
  assert.deepEqual(parseArms("Hook-A, hook-a,../x,b_2,"), ["hook-a", "b_2"]);
  assert.throws(() => applyEvent({}, "a", "bogus"));
});
