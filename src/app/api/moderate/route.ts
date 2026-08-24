import { NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/db";
import { currentOwner } from "@/lib/auth";

const Body = z.object({
  id: z.string().min(1),
  status: z.enum(["pending", "approved", "hidden"]),
});

export async function POST(req: Request) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  // setWishStatus verifies the wish belongs to an invitation this owner holds.
  await (await store()).setWishStatus(parsed.data.id, owner, parsed.data.status);
  return NextResponse.json({ ok: true });
}
