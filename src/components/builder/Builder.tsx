"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Invite as Renderer } from "@/components/invite/Invite";
import { Area, Section, Select, Text, Toggle } from "./Fields";
import { messages, LOCALE_NAMES } from "@/lib/i18n";
import { THEME_LIST } from "@/lib/themes";
import { EVENT_PRESETS, PRESET_KEYS, eventName } from "@/lib/presets";
import { versesFor } from "@/lib/verses";
import { utcIsoToWallTime, wallTimeToUtcIso } from "@/lib/datetime";
import { isSlugAvailableShape } from "@/lib/slug";
import { isFamilyNameLinked, setPartnerName } from "@/lib/linked";
import { LOCALES, OPENER_IDS, TRADITIONS } from "@/lib/types";
import type { Invite, Locale, OpenerId, SectionKey, ThemeId, Tradition } from "@/lib/types";

const TIMEZONES = [
  "Europe/Berlin", "Europe/Istanbul", "Europe/London", "Europe/Amsterdam",
  "Europe/Paris", "Asia/Kolkata", "Asia/Dubai", "America/New_York", "UTC",
];

const OPENER_LABEL: Record<OpenerId, Record<Locale, string>> = {
  veil: { en: "Veil", de: "Schleier", tr: "Perde" },
  foil: { en: "Scratch foil", de: "Rubbelfolie", tr: "Kazı kazan" },
  envelope: { en: "Envelope", de: "Umschlag", tr: "Zarf" },
  direct: { en: "Straight in", de: "Direkt", tr: "Doğrudan" },
};

const uid = () => Math.random().toString(36).slice(2, 10);

export function Builder({ initial, siteUrl }: { initial: Invite; siteUrl: string }) {
  const [invite, setInvite] = useState<Invite>(initial);
  // Held apart from `invite`: the server owns the address while it follows the
  // names, and echoing its value back into `invite` would retrigger autosave.
  const [slug, setSlug] = useState(initial.slug);
  const [slugLocked, setSlugLocked] = useState(initial.slugLocked);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<string | null>("couple");
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  const m = messages(invite.locale);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  /** Autosave. There is no Save button, so nothing can be lost by forgetting. */
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      setSaving(true);
      const { id, ownerId, updatedAt, heroImage, inviteCard, slug: _s, ...rest } = invite;
      void id; void ownerId; void updatedAt; void heroImage; void inviteCard; void _s;
      // Only send an address when the owner has taken control of it.
      const body = slugLocked ? { ...rest, slugLocked: true, slug } : { ...rest, slugLocked: false };
      try {
        const res = await fetch(`/api/invite/${invite.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => null);
        setSlugError(res.ok ? null : (data?.error ?? "save_failed"));
        const derived = data?.invite?.slug;
        if (res.ok && derived && derived !== slug) setSlug(derived);
      } catch {
        setSlugError("save_failed");
      } finally {
        setSaving(false);
      }
    }, 700);

    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [invite, slug, slugLocked]);

  const set = useCallback(<K extends keyof Invite>(key: K, value: Invite[K]) => {
    setInvite((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Couple names flow into the family blocks until someone edits them there. */
  const setName = (side: "a" | "b", value: string) =>
    setInvite((p) => setPartnerName(p, side, value));

  const setSection = (key: SectionKey, on: boolean) =>
    setInvite((p) => ({ ...p, sections: { ...p.sections, [key]: on } }));

  /** Reported at publish time rather than as red fields while still typing. */
  const missing = useMemo(() => {
    const out: string[] = [];
    if (!invite.partnerAName.trim() || !invite.partnerBName.trim()) {
      out.push(m.b.sections.couple);
    }
    if (invite.events.length === 0) out.push(m.b.sections.events);
    if (invite.events.some((e) => !e.venueName.trim())) out.push(m.b.f.venueName);
    return out;
  }, [invite, m]);

  const url = `${siteUrl}/${slug}`;
  const published = invite.status === "published";

  async function togglePublish() {
    if (!published && missing.length) return;
    set("status", published ? "draft" : "published");
  }

  const summary = {
    couple: `${invite.partnerAName} & ${invite.partnerBName}`,
    style: THEME_LIST.find((t) => t.id === invite.theme)?.name ?? "",
    events: invite.events.length
      ? String(invite.events.length)
      : m.b.notAdded,
    families: invite.families.length ? String(invite.families.length) : m.b.notAdded,
    verses: invite.verses.length ? String(invite.verses.length) : m.b.notAdded,
    rsvp: invite.sections.rsvp ? "on" : "off",
    wishes: invite.sections.wishes ? "on" : "off",
    info: invite.sections.info ? "on" : "off",
  };

  const toggle = (k: string) => setOpen((cur) => (cur === k ? null : k));

  return (
    <div className="builder">
      <div className="b-form">
        <header className="b-topbar">
          <a className="b-back" href="/dashboard">← {m.b.dashboard}</a>
          <span className="b-save">{saving ? `${m.b.saving}…` : m.b.saved}</span>
        </header>

        <Section title={m.b.sections.couple} summary={summary.couple}
                 open={open === "couple"} onToggle={() => toggle("couple")}>
          <Text label={m.b.f.partnerA} value={invite.partnerAName}
                onChange={(v) => setName("a", v)} />
          <Text label={m.b.f.partnerB} value={invite.partnerBName}
                onChange={(v) => setName("b", v)} />
          <Select label={m.b.f.language} value={invite.locale}
                  onChange={(v) => set("locale", v)}
                  options={LOCALES.map((l) => ({ value: l, label: LOCALE_NAMES[l] }))} />
          <Select label={m.b.f.timezone} value={invite.timezone}
                  onChange={(v) => set("timezone", v)}
                  options={TIMEZONES.map((t) => ({ value: t, label: t.replace("_", " ") }))} />
          <div className="b-address">
            <span className="label">{m.b.f.slug}</span>
            {slugLocked ? (
              <input
                className="input" value={slug} inputMode="url"
                aria-invalid={!isSlugAvailableShape(slug)}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              />
            ) : (
              <p className="b-address-preview">/{slug}</p>
            )}
            <p className="note">
              {published
                ? m.b.f.addressFrozen
                : slugLocked
                  ? ""
                  : m.b.f.addressFollowsNames}
            </p>
            {!slugLocked && !published && (
              <button type="button" className="b-linkbtn" onClick={() => setSlugLocked(true)}>
                {m.b.f.editAddress}
              </button>
            )}
          </div>
        </Section>

        <Section title={m.b.sections.style} summary={summary.style}
                 open={open === "style"} onToggle={() => toggle("style")}>
          <span className="label">{m.b.f.theme}</span>
          <div className="theme-grid">
            {THEME_LIST.map((t) => (
              <button key={t.id} type="button"
                      className={`theme-card ${invite.theme === t.id ? "is-on" : ""}`}
                      aria-pressed={invite.theme === t.id}
                      onClick={() => set("theme", t.id as ThemeId)}>
                <span className="theme-swatch" style={{ background: t.palette.bg }}>
                  <span style={{ background: t.palette.accent }} />
                  <span style={{ background: t.palette.rule }} />
                  <span style={{ background: t.palette.ink }} />
                </span>
                <span className="theme-name">{t.name}</span>
                <span className="theme-blurb">{t.blurb}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: "1.25rem" }}>
            <Select label={m.b.f.opener} value={invite.opener}
                    onChange={(v) => set("opener", v)}
                    options={OPENER_IDS.map((o) => ({
                      value: o, label: OPENER_LABEL[o][invite.locale],
                    }))} />
          </div>
        </Section>

        <Section title={m.b.sections.events} summary={summary.events}
                 open={open === "events"} onToggle={() => toggle("events")}>
          {invite.events.map((e, i) => (
            <div className="b-item" key={e.id}>
              <Select label={m.b.f.eventName} value={e.presetKey ?? "custom"}
                      onChange={(v) => {
                        const events = [...invite.events];
                        events[i] = v === "custom"
                          ? { ...e, presetKey: null, customName: e.customName ?? "" }
                          : { ...e, presetKey: v, customName: null };
                        set("events", events);
                      }}
                      options={[
                        ...PRESET_KEYS.map((k) => ({ value: k, label: EVENT_PRESETS[k][invite.locale] })),
                        { value: "custom", label: "…" },
                      ]} />
              {e.presetKey === null && (
                <Text label={m.b.f.eventName} value={e.customName ?? ""}
                      onChange={(v) => {
                        const events = [...invite.events];
                        events[i] = { ...e, customName: v };
                        set("events", events);
                      }} />
              )}
              <Text label={m.b.f.venueName} value={e.venueName}
                    onChange={(v) => {
                      const events = [...invite.events];
                      events[i] = { ...e, venueName: v };
                      set("events", events);
                    }} />
              <Text label={m.b.f.venueAddress} value={e.venueAddress}
                    onChange={(v) => {
                      const events = [...invite.events];
                      events[i] = { ...e, venueAddress: v };
                      set("events", events);
                    }} />
              <Text label={m.b.f.startsAt} type="datetime-local"
                    value={utcIsoToWallTime(e.startsAt, invite.timezone)}
                    onChange={(v) => {
                      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return;
                      const events = [...invite.events];
                      events[i] = { ...e, startsAt: wallTimeToUtcIso(v, invite.timezone) };
                      set("events", events);
                    }} />
              <Text label={m.b.f.note} value={e.note}
                    onChange={(v) => {
                      const events = [...invite.events];
                      events[i] = { ...e, note: v };
                      set("events", events);
                    }} />
              <Text label={m.b.f.mapsUrl} value={e.mapsUrl} inputMode="url"
                    onChange={(v) => {
                      const events = [...invite.events];
                      events[i] = { ...e, mapsUrl: v };
                      set("events", events);
                    }} />
              <button type="button" className="b-remove"
                      onClick={() => set("events", invite.events.filter((x) => x.id !== e.id))}>
                {m.b.f.remove}
              </button>
            </div>
          ))}
          {invite.events.length < 10 && (
            <button type="button" className="b-add" onClick={() => set("events", [
              ...invite.events,
              {
                id: uid(), sort: invite.events.length, presetKey: "reception",
                customName: null, venueName: "", venueAddress: "", mapsUrl: "",
                startsAt: invite.events.at(-1)?.startsAt ?? new Date().toISOString(),
                note: "",
              },
            ])}>+ {m.b.f.addEvent}</button>
          )}
        </Section>

        <Section title={m.b.sections.families} summary={summary.families}
                 open={open === "families"} onToggle={() => toggle("families")}>
          <Toggle label={m.b.f.showSection} checked={invite.sections.families}
                  onChange={(v) => setSection("families", v)} />
          {invite.families.map((f, i) => (
            <div className="b-item" key={f.id}>
              <Select label={m.b.f.side} value={f.side}
                      onChange={(v) => {
                        const families = [...invite.families];
                        families[i] = { ...f, side: v };
                        set("families", families);
                      }}
                      options={[
                        { value: "a" as const, label: m.families.groom },
                        { value: "b" as const, label: m.families.bride },
                      ]} />
              <Text label={m.b.f.personName} value={f.personName}
                    onChange={(v) => {
                      const families = [...invite.families];
                      families[i] = { ...f, personName: v };
                      set("families", families);
                    }} />
              {isFamilyNameLinked(invite, f.id) && (
                <p className="note" style={{ marginTop: "-.6rem", marginBottom: "1rem" }}>
                  {m.b.f.followsCouple}
                </p>
              )}
              <Area label={m.b.f.parents} value={f.parents} rows={2}
                    onChange={(v) => {
                      const families = [...invite.families];
                      families[i] = { ...f, parents: v };
                      set("families", families);
                    }} />
              <Area label={m.b.f.grandparents} value={f.grandparents} rows={2}
                    onChange={(v) => {
                      const families = [...invite.families];
                      families[i] = { ...f, grandparents: v };
                      set("families", families);
                    }} />
              <button type="button" className="b-remove"
                      onClick={() => set("families", invite.families.filter((x) => x.id !== f.id))}>
                {m.b.f.remove}
              </button>
            </div>
          ))}
          {invite.families.length < 6 && (
            <button type="button" className="b-add" onClick={() => set("families", [
              ...invite.families,
              { id: uid(), side: "a", personName: "", parents: "", grandparents: "" },
            ])}>+ {m.b.f.addFamily}</button>
          )}
        </Section>

        <Section title={m.b.sections.verses} summary={summary.verses}
                 open={open === "verses"} onToggle={() => toggle("verses")}>
          <Toggle label={m.b.f.showSection} checked={invite.sections.verses}
                  onChange={(v) => setSection("verses", v)} />
          <Select label={m.b.f.tradition} value={invite.tradition}
                  onChange={(t: Tradition) =>
                    // Verses from the other tradition are dropped: keeping them
                    // would render a heading that contradicts its contents.
                    setInvite((p) => {
                      const kept = p.verses.filter((x) =>
                        !x.libraryKey || versesFor(t).some((lv) => lv.key === x.libraryKey),
                      );
                      // Never leave the section empty after a switch: seed the
                      // new tradition's first two so the preview stays whole.
                      const seeded = kept.length
                        ? kept
                        : versesFor(t).slice(0, 2).map((lv, i) => ({
                            id: uid(), sort: i, libraryKey: lv.key,
                            customArabic: null, customText: null, customRef: null,
                          }));
                      return { ...p, tradition: t, verses: seeded };
                    })}
                  options={TRADITIONS.map((t) => ({
                    value: t, label: m.verses.source[t],
                  }))} />
          <div className="verse-list">
            {versesFor(invite.tradition).map((v) => {
              const chosen = invite.verses.some((x) => x.libraryKey === v.key);
              return (
                <button key={v.key} type="button"
                        className={`verse-pick ${chosen ? "is-on" : ""}`}
                        aria-pressed={chosen}
                        onClick={() => set("verses", chosen
                          ? invite.verses.filter((x) => x.libraryKey !== v.key)
                          : [...invite.verses, {
                              id: uid(), sort: invite.verses.length, libraryKey: v.key,
                              customArabic: null, customText: null, customRef: null,
                            }])}>
                  <span className="verse-ref">{v.ref[invite.locale]}</span>
                  <span className="verse-text">{v.text[invite.locale]}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title={m.b.sections.rsvp} summary={summary.rsvp}
                 open={open === "rsvp"} onToggle={() => toggle("rsvp")}>
          <Toggle label={m.b.f.showSection} checked={invite.sections.rsvp}
                  onChange={(v) => setSection("rsvp", v)} />
          <Text label={m.b.f.rsvpDeadline} type="date" value={invite.rsvpDeadline ?? ""}
                onChange={(v) => set("rsvpDeadline", v || null)} />
        </Section>

        <Section title={m.b.sections.wishes} summary={summary.wishes}
                 open={open === "wishes"} onToggle={() => toggle("wishes")}>
          <Toggle label={m.b.f.showSection} checked={invite.sections.wishes}
                  onChange={(v) => setSection("wishes", v)} />
        </Section>

        <Section title={m.b.sections.info} summary={summary.info}
                 open={open === "info"} onToggle={() => toggle("info")}>
          <Toggle label={m.b.f.showSection} checked={invite.sections.info}
                  onChange={(v) => setSection("info", v)} />
          <Area label={m.b.f.weather} value={invite.infoWeather}
                onChange={(v) => set("infoWeather", v)} />
          <Area label={m.b.f.dress} value={invite.infoDress}
                onChange={(v) => set("infoDress", v)} />
          <Area label={m.b.f.parking} value={invite.infoParking}
                onChange={(v) => set("infoParking", v)} />
        </Section>

        <div className="b-publish">
          {missing.length > 0 && !published && (
            <p className="b-missing">{m.b.missing}: {missing.join(", ")}</p>
          )}
          {slugError && <p className="b-missing">{slugError}</p>}
          <button className="btn b-publish-btn" onClick={togglePublish}
                  disabled={!published && missing.length > 0}>
            {published ? m.b.unpublish : m.b.publish}
          </button>
          {published && (
            <div className="b-share">
              <code>{url}</code>
              <button type="button" onClick={() => {
                navigator.clipboard?.writeText(url).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }).catch(() => {});
              }}>{copied ? m.b.copied : m.b.copyLink}</button>
              <a href={`https://wa.me/?text=${encodeURIComponent(`${invite.partnerAName} & ${invite.partnerBName} — ${url}`)}`}
                 target="_blank" rel="noopener noreferrer">{m.b.shareWhatsapp}</a>
            </div>
          )}
        </div>
      </div>

      <aside className={`b-preview ${showPreview ? "is-open" : ""}`}>
        <div className="phone">
          <Renderer invite={invite} live={false} scoped />
        </div>
      </aside>

      <button className="b-preview-toggle btn" onClick={() => setShowPreview((v) => !v)}>
        {showPreview ? m.b.closePreview : m.b.preview}
      </button>
    </div>
  );
}
