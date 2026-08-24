import { notFound, redirect } from "next/navigation";
import { store } from "@/lib/db";
import { currentOwner } from "@/lib/auth";
import { messages } from "@/lib/i18n";
import { ExportCsv } from "@/components/builder/RsvpTable";
import { WishModeration } from "@/components/builder/WishModeration";

export const dynamic = "force-dynamic";

export default async function RsvpsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const owner = await currentOwner();
  if (!owner) redirect("/login");

  const { id } = await params;
  const db = await store();
  const invite = await db.getInvite(id, owner);
  if (!invite) notFound();

  const m = messages(invite.locale);
  const [rows, totals, wishes] = await Promise.all([
    db.listRsvps(id, owner),
    db.countRsvps(id, owner),
    db.listAllWishes(id, owner),
  ]);

  return (
    <main className="page">
      <a className="b-back" href="/dashboard">← {m.b.dashboard}</a>
      <h1 style={{ marginTop: ".5rem" }}>{m.b.responses}</h1>
      <p className="lede">
        {totals.yes} · {totals.no} · {totals.guests} {m.rsvp.guests.toLowerCase()}
      </p>

      <div className="row" style={{ marginTop: "1rem" }}>
        <ExportCsv rows={rows} filename={`${invite.slug}-rsvps.csv`} />
      </div>

      {rows.length > 0 && (
        <table className="table" style={{ marginTop: "1.5rem" }}>
          <thead>
            <tr>
              <th>{m.rsvp.yourName}</th>
              <th>{m.b.responses}</th>
              <th>{m.rsvp.guests}</th>
              <th>{m.rsvp.message}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.attending ? m.rsvp.attending : m.rsvp.notAttending}</td>
                <td>{r.guestCount}</td>
                <td>{r.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: "3rem" }}>{m.wishes.heading}</h2>
      <WishModeration initial={wishes} />
    </main>
  );
}
