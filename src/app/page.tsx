"use client";
import { useState } from "react";
import { THEME_LIST } from "@/lib/themes";
import { SUPABASE_CONFIGURED } from "@/lib/db";
import { NewInvite } from "@/components/builder/NewInvite";
import { LOCALES, type Locale } from "@/lib/types";
import { LOCALE_NAMES, messages } from "@/lib/i18n";

export default function Landing() {
  const [selectedLocale, setSelectedLocale] = useState<Locale>("en");
  const m = messages(selectedLocale);
  const l = m.landing;

  return (
    <main className="page">
      {/* Top Header Bar with Badge on Left and Language Select Dropdown on Top Right */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div className="hero-badge" style={{ marginBottom: 0 }}>
          {l.badge}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: ".45rem" }}>
          <span className="note" style={{ fontSize: ".75rem", textTransform: "uppercase", letterSpacing: ".06em" }}>Language:</span>
          <select
            className="select"
            style={{
              width: "auto",
              padding: ".25rem .75rem",
              fontSize: ".82rem",
              borderRadius: "999px",
              minHeight: "36px",
              height: "36px",
              borderColor: "var(--app-line)",
              background: "var(--app-surface)",
              color: "var(--app-ink)",
              cursor: "pointer",
              fontWeight: 500,
            }}
            value={selectedLocale}
            onChange={(e) => setSelectedLocale(e.target.value as Locale)}
          >
            {LOCALES.map((loc) => (
              <option key={loc} value={loc}>
                {LOCALE_NAMES[loc]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="hero-grid">
        <div>
          <h1>
            {l.h1Line1}
            <br />
            <span className="gilt-animated">{l.h1Line2}</span>
          </h1>

          <p className="lede" style={{ fontSize: "1.15rem", lineHeight: "1.7" }}>
            {l.lede}
          </p>

          <div className="row" style={{ marginTop: "2rem" }}>
            <NewInvite label={l.startBtn} showSelect={false} initialLocale={selectedLocale} />
            <a className="cta cta-ghost" href="/amir-leyla">
              {l.seeExample}
            </a>
          </div>
        </div>

        {/* Animated Digital Card Mockup on Right Side */}
        <div className="hero-card-preview">
          <span className="hero-card-tag">{l.mockupTag}</span>
          <p className="eyebrow" style={{ fontSize: ".7rem", letterSpacing: ".2em", marginTop: ".6rem" }}>
            {m.hero.theWeddingOf}
          </p>
          <h2 className="display gilt-animated" style={{ fontSize: "2.2rem", marginBlock: ".4rem" }}>
            {l.mockupHeading}
          </h2>
          <div style={{ color: "var(--app-accent)", marginBlock: ".6rem", fontSize: "1.1rem" }}>
            ❖ ❖ ❖
          </div>
          <p style={{ fontSize: ".95rem", fontWeight: 500 }}>{l.mockupDate}</p>
          <p className="note" style={{ marginTop: ".25rem" }}>{l.mockupVenue}</p>

          <div style={{ marginTop: "1.4rem", display: "flex", gap: ".5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <span className="pill" style={{ background: "color-mix(in srgb, var(--app-accent) 12%, transparent)", borderColor: "color-mix(in srgb, var(--app-accent) 30%, transparent)", color: "var(--app-accent)" }}>
              {l.mockupRsvp}
            </span>
            <span className="pill" style={{ background: "color-mix(in srgb, var(--app-accent) 12%, transparent)", borderColor: "color-mix(in srgb, var(--app-accent) 30%, transparent)", color: "var(--app-accent)" }}>
              {l.mockupWishes}
            </span>
          </div>
        </div>
      </div>

      {/* Moving Marquee Ticker Banner */}
      <div className="marquee-container">
        <div className="marquee-content">
          <div className="marquee-item">{l.marquee.presets}</div>
          <div className="marquee-item">{l.marquee.themes}</div>
          <div className="marquee-item">{l.marquee.languages}</div>
          <div className="marquee-item">{l.marquee.rsvps}</div>
          <div className="marquee-item">{l.marquee.noDev}</div>
          <div className="marquee-item">{l.marquee.presets}</div>
          <div className="marquee-item">{l.marquee.themes}</div>
          <div className="marquee-item">{l.marquee.languages}</div>
          <div className="marquee-item">{l.marquee.rsvps}</div>
          <div className="marquee-item">{l.marquee.noDev}</div>
        </div>
      </div>

      {!SUPABASE_CONFIGURED && (
        <p className="b-missing" style={{ marginTop: "1.5rem" }}>
          {l.demoMode}
        </p>
      )}

      {/* Feature Highlights Grid */}
      <div className="features-grid">
        <div className="glass-panel">
          <div className="feature-icon">🎨</div>
          <strong style={{ fontSize: "1rem", display: "block", marginBottom: ".4rem" }}>
            {l.features.themesTitle}
          </strong>
          <span style={{ fontSize: ".84rem", color: "var(--app-muted)", lineHeight: "1.5" }}>
            {l.features.themesDesc}
          </span>
        </div>

        <div className="glass-panel">
          <div className="feature-icon">🌐</div>
          <strong style={{ fontSize: "1rem", display: "block", marginBottom: ".4rem" }}>
            {l.features.langTitle}
          </strong>
          <span style={{ fontSize: ".84rem", color: "var(--app-muted)", lineHeight: "1.5" }}>
            {l.features.langDesc}
          </span>
        </div>

        <div className="glass-panel">
          <div className="feature-icon">💌</div>
          <strong style={{ fontSize: "1rem", display: "block", marginBottom: ".4rem" }}>
            {l.features.rsvpTitle}
          </strong>
          <span style={{ fontSize: ".84rem", color: "var(--app-muted)", lineHeight: "1.5" }}>
            {l.features.rsvpDesc}
          </span>
        </div>

        <div className="glass-panel">
          <div className="feature-icon">🔗</div>
          <strong style={{ fontSize: "1rem", display: "block", marginBottom: ".4rem" }}>
            {l.features.shareTitle}
          </strong>
          <span style={{ fontSize: ".84rem", color: "var(--app-muted)", lineHeight: "1.5" }}>
            {l.features.shareDesc}
          </span>
        </div>
      </div>

      {/* Theme Showcase Section */}
      <div style={{ marginTop: "5rem" }}>
        <h2>{l.showcaseTitle}</h2>
        <p className="lede">
          {l.showcaseLede}
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
                    {t.dark ? l.dark : l.light}
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
