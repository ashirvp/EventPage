import { NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/db";
import { currentOwner } from "@/lib/auth";
import { LOCALES } from "@/lib/types";

const Body = z.object({ locale: z.enum(LOCALES).default("en") });

export async function POST(req: Request) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  const locale = parsed.success ? parsed.data.locale : "en";

  const invite = await (await store()).createInvite(owner, locale);
  return NextResponse.json({ invite });
}
