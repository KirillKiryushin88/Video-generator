// Thompson sampling over landing-page variants, learned separately per traffic
// segment (YouTube viewers and Search users respond to different hooks).
// Pure functions only, so the same code runs in the Netlify function and in tests.

export const ARM_ID = /^[a-z0-9][a-z0-9_-]{0,31}$/;
export const SEGMENTS = ["youtube", "search", "social", "other"];

// How much a segment borrows from the pooled stats of all segments while its own
// data is thin. 0.1 = ten pooled observations count like one local one.
export const POOL_WEIGHT = 0.1;

export function segmentOf(source) {
  const s = String(source || "").toLowerCase();
  if (/youtube|^yt|ytmusic/.test(s)) return "youtube";
  if (/google|search|gads|adwords|bing/.test(s)) return "search";
  if (/instagram|^ig$|facebook|^fb$|tiktok|meta/.test(s)) return "social";
  return "other";
}

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

function clean(s) {
  const views = Math.max(0, (s && s.views) || 0);
  const score = Math.min(Math.max(0, (s && s.score) || 0), views);
  return { views, score };
}

// Sum stats of one arm across all segments.
export function pooled(stats, arm) {
  let views = 0;
  let score = 0;
  for (const seg of Object.values(stats || {})) {
    const s = clean(seg && seg[arm]);
    views += s.views;
    score += s.score;
  }
  return { views, score };
}

// stats: { [segment]: { [armId]: { views, score } } }
// score is the sum of conversion values (0..1 each), so it never exceeds views.
export function chooseArm(arms, stats = {}, segment = "other", rng = Math.random) {
  if (!arms.length) throw new Error("no arms");
  const local = stats[segment] || {};
  let best = arms[0];
  let bestDraw = -1;
  for (const arm of arms) {
    const own = clean(local[arm]);
    const all = pooled(stats, arm);
    const a = 1 + own.score + POOL_WEIGHT * (all.score - own.score);
    const b = 1 + (own.views - own.score) + POOL_WEIGHT * (all.views - all.score - (own.views - own.score));
    const draw = sampleBeta(a, b, rng);
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

// Apply one event. "view" bumps views; others add score, capped so the score
// can never exceed views in a segment.
export function applyEvent(stats, segment, arm, type) {
  if (!(type in EVENT_VALUE)) throw new Error(`unknown event ${type}`);
  if (!SEGMENTS.includes(segment)) throw new Error(`unknown segment ${segment}`);
  const seg = (stats[segment] = stats[segment] || {});
  const s = (seg[arm] = seg[arm] || { views: 0, score: 0 });
  if (type === "view") s.views += 1;
  else s.score = Math.min(s.views, s.score + EVENT_VALUE[type]);
  return stats;
}

export function parseArms(raw) {
  const arms = String(raw || "")
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter((a) => ARM_ID.test(a));
  return [...new Set(arms)].slice(0, 12);
}
