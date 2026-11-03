// GET /api/variant?arms=a,b,c  ->  { arm: "b" }
// Picks the landing variant with Thompson sampling on stored stats.
import { getStore } from "@netlify/blobs";
import { chooseArm, parseArms } from "../../lib/bandit.mjs";

export default async (req) => {
  const arms = parseArms(new URL(req.url).searchParams.get("arms"));
  if (!arms.length) return Response.json({ error: "arms required" }, { status: 400 });

  let stats = {};
  try {
    stats = (await getStore("funnel").get("stats", { type: "json" })) || {};
  } catch {
    // Store unavailable: fall back to uniform choice via empty stats.
  }
  return Response.json(
    { arm: chooseArm(arms, stats) },
    { headers: { "cache-control": "no-store" } },
  );
};

export const config = { path: "/api/variant" };
