// Thompson sampling over landing-page variants.
// Each arm keeps weighted successes (follow clicks, scored by quality) and views.
// Pure functions only, so the same code runs in the Netlify function and in tests.

export const ARM_ID = /^[a-z0-9][a-z0-9_-]{0,31}$/;

// Standard normal via Box-Muller.
function randn(rng) {
  let u = 0;
  while (u === 0) u = rng();
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Gamma(shape, 1) via Marsaglia-Tsang; shape > 0.
export function sampleGamma(shape, rng = Math.random) {
  if (shape < 1) {
    const u = rng() || Number.MIN_VALUE;
    return sampleGamma(shape + 1, rng) * Math.pow(u, 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x, v;
    do {
      x = randn(rng);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rng();
    if (u < 1 - 0.0331 * x ** 4) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

export function sampleBeta(a, b, rng = Math.random) {
  const x = sampleGamma(a, rng);
  const y = sampleGamma(b, rng);
  return x / (x + y);
}

// stats: { [armId]: { views: number, score: number } }
// score is the sum of conversion values (0..1 each), so it never exceeds views.
export function chooseArm(arms, stats = {}, rng = Math.random) {
  if (!arms.length) throw new Error("no arms");
  let best = arms[0];
  let bestDraw = -1;
  for (const arm of arms) {
    const s = stats[arm] || { views: 0, score: 0 };
    const views = Math.max(0, s.views || 0);
    const score = Math.min(Math.max(0, s.score || 0), views);
    const draw = sampleBeta(1 + score, 1 + views - score, rng);
    if (draw > bestDraw) {
      bestDraw = draw;
      best = arm;
    }
  }
  return best;
}

// Event weights: how much each funnel step is worth as evidence of a real follow.
export const EVENT_VALUE = {
  view: 0,
  preview_15s: 0.2,
  follow_click: 0.6,
  follow_click_after_preview: 1,
  follow_verified: 1,
};

// Apply one event to stats. "view" bumps views; others add score, capped so
// one visitor can contribute at most 1.0 (the client sends one best event).
export function applyEvent(stats, arm, type) {
  if (!(type in EVENT_VALUE)) throw new Error(`unknown event ${type}`);
  const s = stats[arm] || { views: 0, score: 0 };
  if (type === "view") s.views += 1;
  else s.score = Math.min(s.views, s.score + EVENT_VALUE[type]);
  stats[arm] = s;
  return stats;
}

export function parseArms(raw) {
  const arms = String(raw || "")
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter((a) => ARM_ID.test(a));
  return [...new Set(arms)].slice(0, 12);
}
