import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { store } from "@/lib/db";
import { currentOwner } from "@/lib/auth";
import { Invite } from "@/components/invite/Invite";
import { formatShortDate } from "@/lib/datetime";
import { PRODUCT_NAME } from "@/lib/config";
import { BackButton } from "@/components/BackButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const owner = await currentOwner();
  if (!owner) return { title: PRODUCT_NAME };
  const { id } = await params;
  const invite = await (await store()).getInvite(id, owner);
  if (!invite) return { title: PRODUCT_NAME };

  const names = `${invite.partnerAName} & ${invite.partnerBName}`;
  const when = invite.events[0]
    ? formatShortDate(invite.events[0].startsAt, invite.locale, invite.timezone)
    : "";
  return { title: when ? `${names} | ${when}` : names };
}

/** The owner's view of a draft: the same renderer, with forms inert. */
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const owner = await currentOwner();
  if (!owner) redirect("/login");

  const { id } = await params;
  const invite = await (await store()).getInvite(id, owner);
  if (!invite) notFound();

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "fixed",
          top: "1rem",
          left: "1rem",
          zIndex: 99,
          background: "var(--app-surface, #fff)",
          border: "1px solid var(--app-line, #ccc)",
          borderRadius: "999px",
          padding: ".4rem 1rem",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <BackButton fallback={`/edit/${id}`} label="← Edit Invitation" />
      </div>
      <Invite invite={invite} live={false} />
    </div>
  );
}
