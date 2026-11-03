// GET /api/variant?arms=a,b,c&src=youtube  ->  { arm: "b", segment: "youtube" }
// Picks the landing variant with Thompson sampling on stored per-segment stats.
import { getStore } from "@netlify/blobs";
import { chooseArm, parseArms, segmentOf } from "../../lib/bandit.mjs";

export default async (req) => {
  const params = new URL(req.url).searchParams;
  const arms = parseArms(params.get("arms"));
  if (!arms.length) return Response.json({ error: "arms required" }, { status: 400 });
  const segment = segmentOf(params.get("src"));

  let stats = {};
  try {
    stats = (await getStore("funnel").get("stats", { type: "json" })) || {};
  } catch {
    // Store unavailable: empty stats give a uniform choice.
  }
  return Response.json(
    { arm: chooseArm(arms, stats, segment), segment },
    { headers: { "cache-control": "no-store" } },
  );
};

export const config = { path: "/api/variant" };
