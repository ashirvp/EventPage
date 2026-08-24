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
          <div
            className="showcase-card"
            key={t.id}
            style={{
              background: t.palette.surface,
              borderColor: t.palette.rule,
            }}
          >
            <div
              className="showcase-band"
              style={{
                background: t.palette.bg,
                color: t.palette.accent,
                borderBottom: `1px solid ${t.palette.rule}`,
              }}
            >
              <span style={{ fontWeight: 500 }}>A &amp; L</span>
            </div>
            <div className="showcase-meta">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: ".3rem",
                }}
              >
                <strong style={{ color: t.palette.ink }}>{t.name}</strong>
                <span
                  className="pill"
                  style={{
                    fontSize: ".6rem",
                    padding: ".1rem .4rem",
                    borderColor: t.palette.rule,
                    color: t.palette.muted,
                  }}
                >
                  {t.dark ? "Dark" : "Light"}
                </span>
              </div>
              <span style={{ color: t.palette.muted, fontSize: ".78rem" }}>{t.blurb}</span>

              {/* Theme color palette swatches */}
              <div
                style={{
                  display: "flex",
                  gap: ".35rem",
                  marginTop: ".75rem",
                  alignItems: "center",
                }}
              >
                <div
                  title={`Background: ${t.palette.bg}`}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: t.palette.bg,
                    border: `1px solid ${t.palette.rule}`,
                  }}
                />
                <div
                  title={`Accent: ${t.palette.accent}`}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: t.palette.accent,
                    border: `1px solid ${t.palette.rule}`,
                  }}
                />
                <div
                  title={`Rule: ${t.palette.rule}`}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: t.palette.rule,
                    border: `1px solid ${t.palette.rule}`,
                  }}
                />
                <div
                  title={`Ink: ${t.palette.ink}`}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: t.palette.ink,
                    border: `1px solid ${t.palette.rule}`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
