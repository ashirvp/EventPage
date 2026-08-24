import { THEME_LIST } from "@/lib/themes";
import { PRODUCT_NAME } from "@/lib/config";
import { SUPABASE_CONFIGURED } from "@/lib/db";
import { NewInvite } from "@/components/builder/NewInvite";

export default function Landing() {
  return (
    <main className="page">
      <div className="hero-badge">
        ✨ Digital Wedding Invitations
      </div>

      <h1>
        Wedding invitations,
        <br />
        <span className="gilt-animated">crafted with elegance.</span>
      </h1>

      <p className="lede" style={{ fontSize: "1.15rem", lineHeight: "1.7" }}>
        Enter your names, your events and your verses. {PRODUCT_NAME} renders a
        breathtaking digital invitation in English, German or Turkish — ready to send in one link.
      </p>

      <div className="row" style={{ marginTop: "2.2rem" }}>
        <NewInvite label="Start an invitation" />
        <a className="cta cta-ghost" href="/amir-leyla">
          See live example →
        </a>
      </div>

      {/* Moving Marquee Ticker Banner */}
      <div className="marquee-container">
        <div className="marquee-content">
          <div className="marquee-item">✨ Nikah &amp; Walima Presets</div>
          <div className="marquee-item">❖ 8 Artisan Styles</div>
          <div className="marquee-item">🌐 English • Deutsch • Türkçe</div>
          <div className="marquee-item">💌 Instant RSVPs &amp; Wishes</div>
          <div className="marquee-item">⚡ Zero Developer Needed</div>
          <div className="marquee-item">✨ Nikah &amp; Walima Presets</div>
          <div className="marquee-item">❖ 8 Artisan Styles</div>
          <div className="marquee-item">🌐 English • Deutsch • Türkçe</div>
          <div className="marquee-item">💌 Instant RSVPs &amp; Wishes</div>
          <div className="marquee-item">⚡ Zero Developer Needed</div>
        </div>
      </div>

      {!SUPABASE_CONFIGURED && (
        <p className="b-missing" style={{ marginTop: "1.5rem" }}>
          Demo mode: no database configured, so invitations render live in memory. Add Supabase credentials to persist long-term.
        </p>
      )}

      {/* Feature Highlights Grid */}
      <div className="features-grid">
        <div className="glass-panel">
          <div className="feature-icon">🎨</div>
          <strong style={{ fontSize: "1rem", display: "block", marginBottom: ".4rem" }}>
            8 Artisan Themes
          </strong>
          <span style={{ fontSize: ".84rem", color: "var(--app-muted)", lineHeight: "1.5" }}>
            Switch palette, typography, surface texture, and ornaments effortlessly.
          </span>
        </div>

        <div className="glass-panel">
          <div className="feature-icon">🌐</div>
          <strong style={{ fontSize: "1rem", display: "block", marginBottom: ".4rem" }}>
            3 Languages
          </strong>
          <span style={{ fontSize: ".84rem", color: "var(--app-muted)", lineHeight: "1.5" }}>
            English, German, and Turkish interface translations built into every layout.
          </span>
        </div>

        <div className="glass-panel">
          <div className="feature-icon">💌</div>
          <strong style={{ fontSize: "1rem", display: "block", marginBottom: ".4rem" }}>
            RSVPs &amp; Wishes
          </strong>
          <span style={{ fontSize: ".84rem", color: "var(--app-muted)", lineHeight: "1.5" }}>
            Collect guest attendance, dietary notes, and moderated wedding wishes directly.
          </span>
        </div>

        <div className="glass-panel">
          <div className="feature-icon">🔗</div>
          <strong style={{ fontSize: "1rem", display: "block", marginBottom: ".4rem" }}>
            Instant Share Link
          </strong>
          <span style={{ fontSize: ".84rem", color: "var(--app-muted)", lineHeight: "1.5" }}>
            Optimized WhatsApp preview cards and one-click URL sharing for all guests.
          </span>
        </div>
      </div>

      {/* Theme Showcase Section */}
      <div style={{ marginTop: "5rem" }}>
        <h2>Eight Artisan Styles</h2>
        <p className="lede">
          Each style re-imagines the palette, typography, and ornament — preserving your words beautifully.
        </p>

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
                    gap: ".4rem",
                    marginBottom: ".3rem",
                  }}
                >
                  <strong
                    style={{
                      color: t.palette.ink,
                      fontSize: ".9rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      minWidth: 0,
                    }}
                  >
                    {t.name}
                  </strong>
                  <span
                    className="pill"
                    style={{
                      fontSize: ".6rem",
                      padding: ".1rem .4rem",
                      borderColor: t.palette.rule,
                      color: t.palette.muted,
                      flexShrink: 0,
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
      </div>
    </main>
  );
}
