import { THEME_LIST } from "@/lib/themes";
import { PRODUCT_NAME } from "@/lib/config";
import { SUPABASE_CONFIGURED } from "@/lib/db";
import { NewInvite } from "@/components/builder/NewInvite";

export default function Landing() {
  return (
    <main className="page">
      <h1>
        Wedding invitations,
        <br />
        without the web developer.
      </h1>
      <p className="lede">
        Enter your names, your events and your verses. {PRODUCT_NAME} renders the
        invitation, in English, German or Turkish, and gives you one link to send.
      </p>

      <div className="row" style={{ marginTop: "2rem" }}>
        <NewInvite label="Start an invitation" />
        <a className="cta cta-ghost" href="/amir-leyla">See an example</a>
      </div>

      {!SUPABASE_CONFIGURED && (
        <p className="b-missing" style={{ marginTop: "1.5rem" }}>
          Demo mode: no database configured, so nothing you make here survives a
          restart. Add Supabase credentials to persist.
        </p>
      )}

      <h2 style={{ marginTop: "4rem" }}>Eight styles</h2>
      <p className="lede">Each one changes the palette, the type and the ornament — never the words.</p>

      <div className="showcase">
        {THEME_LIST.map((t) => (
          <div className="showcase-card" key={t.id}>
            <div className="showcase-band"
                 style={{ background: t.palette.bg, color: t.palette.accent }}>
              A &amp; L
            </div>
            <div className="showcase-meta">
              <strong>{t.name}</strong>
              <span>{t.blurb}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
