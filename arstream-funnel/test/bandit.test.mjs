import { test } from "node:test";
import assert from "node:assert/strict";
import { chooseArm, applyEvent, parseArms, sampleBeta, segmentOf, pooled } from "../lib/bandit.mjs";

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

function simulate(truthBySeg, n, seed) {
  const r = rng(seed);
  const stats = {};
  const picks = {};
  const arms = Object.keys(Object.values(truthBySeg)[0]);
  const segs = Object.keys(truthBySeg);
  for (let i = 0; i < n; i++) {
    const seg = segs[i % segs.length];
    const arm = chooseArm(arms, stats, seg, r);
    picks[seg] = picks[seg] || {};
    picks[seg][arm] = (picks[seg][arm] || 0) + 1;
    applyEvent(stats, seg, arm, "view");
    if (r() < truthBySeg[seg][arm]) applyEvent(stats, seg, arm, "follow_click_after_preview");
  }
  return { stats, picks };
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
  const { picks } = simulate({ other: { a: 0.05, b: 0.15, c: 0.08 } }, 5000, 7);
  assert.ok(picks.other.b > picks.other.a + picks.other.c, JSON.stringify(picks));
});

test("segments learn different winners", () => {
  const { picks } = simulate(
    {
      youtube: { films: 0.2, electronic: 0.05 },
      search: { films: 0.04, electronic: 0.18 },
    },
    8000,
    11,
  );
  assert.ok(picks.youtube.films > picks.youtube.electronic, JSON.stringify(picks));
  assert.ok(picks.search.electronic > picks.search.films, JSON.stringify(picks));
});

test("unexplored arms still get traffic", () => {
  const r = rng(3);
  const stats = { other: { a: { views: 50, score: 2 } } };
  const seen = new Set();
  for (let i = 0; i < 200; i++) seen.add(chooseArm(["a", "new"], stats, "other", r));
  assert.ok(seen.has("new"));
});

test("score never exceeds views and pooling sums segments", () => {
  const stats = {};
  applyEvent(stats, "youtube", "a", "view");
  applyEvent(stats, "youtube", "a", "follow_verified");
  applyEvent(stats, "youtube", "a", "follow_verified");
  applyEvent(stats, "search", "a", "view");
  assert.equal(stats.youtube.a.score, 1);
  assert.deepEqual(pooled(stats, "a"), { views: 2, score: 1 });
});

test("input validation", () => {
  assert.deepEqual(parseArms("Hook-A, hook-a,../x,b_2,"), ["hook-a", "b_2"]);
  assert.throws(() => applyEvent({}, "other", "a", "bogus"));
  assert.throws(() => applyEvent({}, "mars", "a", "view"));
  assert.equal(segmentOf("youtube"), "youtube");
  assert.equal(segmentOf("google"), "search");
  assert.equal(segmentOf("ig"), "social");
  assert.equal(segmentOf(""), "other");
});
