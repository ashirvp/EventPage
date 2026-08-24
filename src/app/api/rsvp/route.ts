import { NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/db";
import { withinRateLimit } from "@/lib/ratelimit";
import { clientIp, hashIp } from "@/lib/iphash";

const Body = z.object({
  inviteId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  attending: z.boolean(),
  guestCount: z.number().int().min(0).max(20),
  message: z.string().max(1000).default(""),
  trap: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const { inviteId, trap, ...rsvp } = parsed.data;

  // A filled honeypot means a bot. Answer 200 so it learns nothing.
  if (trap) return NextResponse.json({ ok: true });

  const db = await store();
  if (!(await db.getPublishedById(inviteId))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const ipHash = hashIp(clientIp(req));
  if (!(await withinRateLimit(db, "rsvps", ipHash, 8, 60_000))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  await db.addRsvp(inviteId, { ...rsvp, ipHash });
  return NextResponse.json({ ok: true });
}
