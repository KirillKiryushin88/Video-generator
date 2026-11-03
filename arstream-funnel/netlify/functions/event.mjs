// POST /api/event  { arm, type, gclid?, wbraid?, gbraid?, platform? }
// Updates bandit stats and keeps click IDs so verified follows can later be
// uploaded to Google Ads as offline conversions.
import { getStore } from "@netlify/blobs";
import { ARM_ID, EVENT_VALUE, applyEvent } from "../../lib/bandit.mjs";

const CLICK_ID = /^[A-Za-z0-9_-]{10,200}$/;
const PLATFORMS = new Set(["audiomack", "spotify", "youtube", "apple", "other"]);

export default async (req) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad json" }, { status: 400 });
  }
  const arm = String(body.arm || "").toLowerCase();
  const type = String(body.type || "");
  if (!ARM_ID.test(arm) || !(type in EVENT_VALUE)) {
    return Response.json({ error: "bad event" }, { status: 400 });
  }

  const store = getStore("funnel");
  // Read-modify-write is not atomic; fine for MVP traffic levels. Move to a
  // database with atomic increments (e.g. Supabase) once traffic grows.
  const stats = (await store.get("stats", { type: "json" })) || {};
  applyEvent(stats, arm, type);
  await store.setJSON("stats", stats);

  if (type !== "view" && type !== "preview_15s") {
    const clickId = ["gclid", "wbraid", "gbraid"].find((k) => CLICK_ID.test(body[k] || ""));
    if (clickId) {
      const platform = PLATFORMS.has(body.platform) ? body.platform : "other";
      const key = `clicks/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}`;
      await store.setJSON(key, {
        [clickId]: body[clickId],
        arm,
        type,
        platform,
        at: new Date().toISOString(),
      });
    }
  }
  return Response.json({ ok: true });
};

export const config = { path: "/api/event" };
