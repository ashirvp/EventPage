"use client";
import { useEffect, useState } from "react";
import { THEMES, themeVars } from "@/lib/themes";
import { messages, HTML_LANG } from "@/lib/i18n";
import { eventName } from "@/lib/presets";
import { VERSES_BY_KEY, BISMILLAH } from "@/lib/verses";
import { formatEventDate, formatEventTime, formatShortDate } from "@/lib/datetime";
import { LOCALES, type Invite as InviteData, type Locale, type Wish } from "@/lib/types";
import { Ornament, Rule } from "./Ornament";
import { Reveal } from "./Reveal";
import { Countdown } from "./Countdown";
import { Opener } from "./Opener";
import { RsvpForm, WishesBoard, MusicToggle } from "./Forms";

export type InviteProps = {
  invite: InviteData;
  wishes?: Wish[];
  /** False inside the builder and draft previews: forms render but never post. */
  live?: boolean;
  /** Scopes fixed positioning so the renderer can sit inside a phone frame. */
  scoped?: boolean;
};

export function Invite({ invite, wishes = [], live = true, scoped = false }: InviteProps) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(invite.locale);
  const theme = THEMES[invite.theme] ?? THEMES["ivory-gold"];

  useEffect(() => {
    setCurrentLocale(invite.locale);
  }, [invite.locale]);

  const m = messages(currentLocale);
  const [opened, setOpened] = useState(invite.opener === "direct");

  const tz = invite.timezone;
  const primary = invite.events[0];
  const names = { a: invite.partnerAName, b: invite.partnerBName };

  return (
    <div
      className={`invite surface-${theme.surface} ${scoped ? "preview-scope" : ""}`}
      lang={HTML_LANG[currentLocale]}
      style={themeVars(theme) as React.CSSProperties}
    >
      {/* Floating Language Switcher Bar */}
      <div className="lang-switcher" aria-label="Select language">
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            className={`lang-btn ${currentLocale === l ? "is-active" : ""}`}
            onClick={() => setCurrentLocale(l)}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="invite-body">
      {!opened ? (
        <Opener
          opener={invite.opener}
          theme={theme}
          names={names}
          dateLabel={primary ? formatEventDate(primary.startsAt, currentLocale, tz) : undefined}
          m={m}
          onOpen={() => setOpened(true)}
        />
      ) : (
        <>
          <header className="cover" id="top">
            <div>
              <p className="eyebrow">{m.hero.theWeddingOf}</p>
              <h1 className="cover-names display gilt">
                {names.a}<span className="cover-amp">&amp;</span>{names.b}
              </h1>
              <Rule id={theme.ornament} />
              {primary && (
                <>
                  <p style={{ letterSpacing: ".05em" }}>
                    {formatEventDate(primary.startsAt, currentLocale, tz)}
                  </p>
                  <p className="eyebrow" style={{ marginTop: ".35rem" }}>{primary.venueAddress}</p>
                  <div style={{ marginTop: "2rem" }}>
                    <p className="eyebrow" style={{ marginBottom: ".6rem" }}>{m.hero.seeYouIn}</p>
                    <Countdown targetIso={primary.startsAt} m={m} />
                  </div>
                </>
              )}
            </div>
          </header>

          {invite.sections.verses && invite.verses.length > 0 && (
            <section className="section" id="verses">
              <div className="wrap center">
                <Reveal>
                  {invite.tradition === "islamic" && (
                    <p className="arabic" style={{ marginBottom: "1.5rem" }} dir="rtl" lang="ar">
                      {BISMILLAH}
                    </p>
                  )}
                  <p className="eyebrow">{m.verses.sub}</p>
                  <h2 className="section-title">{m.verses.heading[invite.tradition]}</h2>
                  <Rule id={theme.ornament} />
                  <div className="stack">
                    {invite.verses.map((v) => {
                      const lib = v.libraryKey ? VERSES_BY_KEY.get(v.libraryKey) : undefined;
                      const original = v.customArabic ?? lib?.original ?? "";
                      const text = v.customText ?? lib?.text[currentLocale] ?? "";
                      const ref = v.customRef ?? lib?.ref[currentLocale] ?? "";
                      const rtl = invite.tradition === "islamic";
                      return (
                        <blockquote className="card" key={v.id}>
                          {original && (
                            <p className="arabic" dir={rtl ? "rtl" : "ltr"} lang={rtl ? "ar" : undefined}>
                              {original}
                            </p>
                          )}
                          {text && <p style={{ marginTop: ".75rem", fontStyle: "italic" }}>{text}</p>}
                          {ref && <p className="eyebrow" style={{ marginTop: ".6rem" }}>{ref}</p>}
                        </blockquote>
                      );
                    })}
                  </div>
                </Reveal>
              </div>
            </section>
          )}

          {invite.sections.families && invite.families.length > 0 && (
            <section className="section" id="couple">
              <div className="wrap center">
                <Reveal>
                  <h2 className="section-title">{m.families.heading}</h2>
                  <Rule id={theme.ornament} />
                  <div className="grid-2">
                    {invite.families.map((f) => (
                      <div className="card center" key={f.id}>
                        <p className="eyebrow">{f.side === "a" ? m.families.groom : m.families.bride}</p>
                        <p className="display" style={{ fontSize: "1.6rem", marginBlock: ".35rem" }}>{f.personName}</p>
                        {f.parents && <p style={{ fontSize: ".92rem" }}>{f.parents}</p>}
                        {f.grandparents && <p className="note" style={{ marginTop: ".4rem" }}>{f.grandparents}</p>}
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
            </section>
          )}

          {invite.sections.events && invite.events.length > 0 && (
            <section className="section" id="events">
              <div className="wrap center">
                <Reveal>
                  <p className="eyebrow">{m.events.sub}</p>
                  <h2 className="section-title">{m.events.heading}</h2>
                  <Rule id={theme.ornament} />
                  <div className="stack">
                    {invite.events.map((e) => (
                      <article className="card center" key={e.id}>
                        <p className="display" style={{ fontSize: "1.5rem" }}>
                          {eventName(e.presetKey, e.customName, currentLocale)}
                        </p>
                        <p style={{ marginTop: ".5rem" }}>{e.venueName}</p>
                        <p className="note">{e.venueAddress}</p>
                        <div className="rule" aria-hidden="true"><Ornament id={theme.ornament} size={16} /></div>
                        <p style={{ fontSize: ".95rem" }}>{formatEventDate(e.startsAt, currentLocale, tz)}</p>
                        <p style={{ fontSize: ".95rem" }}>
                          {formatEventTime(e.startsAt, currentLocale, tz)}{e.note ? ` — ${e.note}` : ""}
                        </p>
                        {e.mapsUrl && (
                          <p style={{ marginTop: "1rem" }}>
                            <a className="btn btn-ghost" href={e.mapsUrl} target="_blank" rel="noopener noreferrer">
                              {m.events.viewLocation}
                            </a>
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </Reveal>
              </div>
            </section>
          )}

          {invite.sections.rsvp && (
            <section className="section" id="rsvp">
              <div className="wrap">
                <Reveal className="center">
                  <h2 className="section-title">{m.rsvp.heading}</h2>
                  <Rule id={theme.ornament} />
                  <div style={{ textAlign: "left" }}>
                    <RsvpForm
                      inviteId={invite.id}
                      m={m}
                      live={live}
                      deadlineLabel={
                        invite.rsvpDeadline
                          ? formatShortDate(`${invite.rsvpDeadline}T12:00:00.000Z`, currentLocale, tz)
                          : null
                      }
                    />
                  </div>
                </Reveal>
              </div>
            </section>
          )}

          {invite.sections.wishes && (
            <section className="section" id="wishes">
              <div className="wrap">
                <Reveal className="center">
                  <p className="eyebrow">{m.wishes.sub}</p>
                  <h2 className="section-title">{m.wishes.heading}</h2>
                  <Rule id={theme.ornament} />
                  <div style={{ textAlign: "left" }}>
                    <WishesBoard inviteId={invite.id} m={m} live={live} seed={wishes} />
                  </div>
                </Reveal>
              </div>
            </section>
          )}

          {invite.sections.info && (
            <section className="section" id="info">
              <div className="wrap center">
                <Reveal>
                  <h2 className="section-title">{m.info.heading}</h2>
                  <Rule id={theme.ornament} />
                  <div className="stack">
                    {([
                      [m.info.weather, invite.infoWeather],
                      [m.info.dress, invite.infoDress],
                      [m.info.parking, invite.infoParking],
                    ] as const)
                      .filter(([, body]) => Boolean(body))
                      .map(([label, body]) => (
                        <div className="card" key={label}>
                          <p className="eyebrow">{label}</p>
                          <p style={{ marginTop: ".35rem" }}>{body}</p>
                        </div>
                      ))}
                  </div>
                </Reveal>
              </div>
            </section>
          )}

          <footer className="section center">
            <div className="wrap">
              <Ornament id={theme.ornament} size={26} />
              <p className="display" style={{ fontSize: "1.8rem", marginTop: ".5rem" }}>
                {names.a} &amp; {names.b}
              </p>
              {primary && (
                <p className="eyebrow" style={{ marginTop: ".4rem" }}>
                  {formatShortDate(primary.startsAt, currentLocale, tz)}
                </p>
              )}
              <p className="note" style={{ marginTop: "1rem" }}>{m.footer.withLove}</p>
            </div>
          </footer>

        </>
      )}
      </div>
      {/* Outside .invite-body: containment would break its fixed position. */}
      {opened && invite.sections.music && <MusicToggle m={m} />}
    </div>
  );
}
