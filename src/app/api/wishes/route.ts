import { NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/db";
import { withinRateLimit } from "@/lib/ratelimit";
import { clientIp, hashIp } from "@/lib/iphash";

const Body = z.object({
  inviteId: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  message: z.string().trim().min(1).max(600),
  trap: z.string().max(200).optional(),
});

export async function GET(req: Request) {
  const inviteId = new URL(req.url).searchParams.get("inviteId");
  if (!inviteId) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const db = await store();
  if (!(await db.getPublishedById(inviteId))) {
    return NextResponse.json({ wishes: [] });
  }
  return NextResponse.json({ wishes: await db.listApprovedWishes(inviteId) });
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const { inviteId, trap, ...wish } = parsed.data;
  if (trap) return NextResponse.json({ ok: true });

  const db = await store();
  if (!(await db.getPublishedById(inviteId))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const ipHash = hashIp(clientIp(req));
  if (!(await withinRateLimit(db, "wishes", ipHash, 6, 60_000))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // Lands as pending: an unmoderated public wall attracts spam within days.
  await db.addWish(inviteId, { ...wish, ipHash });
  return NextResponse.json({ ok: true });
}
