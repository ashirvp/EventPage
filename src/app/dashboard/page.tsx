import { redirect } from "next/navigation";
import { store } from "@/lib/db";
import { currentOwner } from "@/lib/auth";
import { messages } from "@/lib/i18n";
import { NewInvite } from "@/components/builder/NewInvite";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const owner = await currentOwner();
  if (!owner) redirect("/login");

  const db = await store();
  const invites = await db.listInvites(owner);
  const m = messages(invites[0]?.locale ?? "en");

  const counts = await Promise.all(
    invites.map((i) => db.countRsvps(i.id, owner)),
  );

  return (
    <main className="page">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>{m.b.dashboard}</h1>
        <NewInvite label={m.b.newInvite} />
      </div>

      <div className="list">
        {invites.map((invite, i) => (
          <div className="list-row" key={invite.id}>
            <div>
              <strong>{invite.partnerAName} &amp; {invite.partnerBName}</strong>
              <div style={{ fontSize: ".8rem", color: "var(--app-muted)" }}>
                /{invite.slug} · {counts[i].yes} × {m.rsvp.attending.toLowerCase()} · {counts[i].guests} {m.rsvp.guests.toLowerCase()}
              </div>
            </div>
            <div className="row">
              <span className="pill">
                {invite.status === "published" ? m.b.published : m.b.draft}
              </span>
              <a className="cta cta-ghost" href={`/edit/${invite.id}`}>{m.b.edit}</a>
              <a className="cta cta-ghost" href={`/dashboard/${invite.id}/rsvps`}>{m.b.responses}</a>
              <a className="cta cta-ghost"
                 href={invite.status === "published" ? `/${invite.slug}` : `/preview/${invite.id}`}>
                {m.b.view}
              </a>
            </div>
          </div>
        ))}
        {invites.length === 0 && <p className="lede">—</p>}
      </div>
    </main>
  );
}
