import { wallTimeToUtcIso } from "./datetime";
import { suggestSlug } from "./slug";
import type { Invite, Locale, SectionKey, Tradition } from "./types";

/**
 * A new invitation is never blank. It arrives as a complete, working example
 * in the chosen language, turning the user's task from creating into editing.
 */

const SEED_TEXT: Record<
  Locale,
  { a: string; b: string; weather: string; dress: string; parking: string; note1: string; note2: string; parentsA: string; parentsB: string }
> = {
  en: {
    a: "Amir",
    b: "Leyla",
    weather: "Warm and dry, with cool evenings — a light shawl is a good idea.",
    dress: "Traditional or elegant formal wear is warmly encouraged.",
    parking: "On-site parking is available. Arriving a little early is recommended.",
    note1: "Nikah, followed by lunch",
    note2: "Reception and dinner",
    parentsA: "Son of",
    parentsB: "Daughter of",
  },
  de: {
    a: "Amir",
    b: "Leyla",
    weather: "Warm und trocken, abends kühl — ein leichter Schal lohnt sich.",
    dress: "Traditionelle oder elegante festliche Kleidung ist herzlich willkommen.",
    parking: "Parkplätze sind vor Ort vorhanden. Etwas früher da zu sein, lohnt sich.",
    note1: "Nikah, anschliessend Mittagessen",
    note2: "Empfang und Abendessen",
    parentsA: "Sohn von",
    parentsB: "Tochter von",
  },
  tr: {
    a: "Amir",
    b: "Leyla",
    weather: "Sıcak ve kuru, akşamları serin — ince bir şal iyi olur.",
    dress: "Geleneksel ya da şık resmî kıyafet memnuniyetle karşılanır.",
    parking: "Mekânda otopark mevcuttur. Biraz erken gelmenizi öneririz.",
    note1: "Nikâh, ardından öğle yemeği",
    note2: "Karşılama ve akşam yemeği",
    parentsA: "Oğlu",
    parentsB: "Kızı",
  },
};

const DEFAULT_SECTIONS: Record<SectionKey, boolean> = {
  events: true,
  families: true,
  verses: true,
  rsvp: true,
  wishes: true,
  info: true,
  music: false,
};

export function seedInvite(opts: {
  id: string;
  ownerId: string;
  locale: Locale;
  tradition?: Tradition;
  timezone?: string;
  now?: Date;
}): Invite {
  const { id, ownerId, locale } = opts;
  const tradition = opts.tradition ?? "islamic";
  const timezone = opts.timezone ?? "Europe/Berlin";
  const t = SEED_TEXT[locale];

  // Default to a date far enough out that the countdown reads sensibly.
  const now = opts.now ?? new Date();
  const year = now.getUTCFullYear() + 1;

  return {
    id,
    ownerId,
    slug: suggestSlug(t.a, t.b, locale),
    status: "draft",
    slugLocked: false,
    locale,
    tradition,
    theme: "ivory-gold",
    opener: "veil",
    timezone,
    partnerAName: t.a,
    partnerBName: t.b,
    heroImage: null,
    inviteCard: null,
    sections: { ...DEFAULT_SECTIONS },
    rsvpDeadline: `${year}-05-30`,
    infoWeather: t.weather,
    infoDress: t.dress,
    infoParking: t.parking,
    events: [
      {
        id: `${id}-e1`,
        sort: 0,
        presetKey: "nikah",
        customName: null,
        venueName: "Merkez Camii",
        venueAddress: "Köln, Deutschland",
        mapsUrl: "",
        startsAt: wallTimeToUtcIso(`${year}-06-12T12:00`, timezone),
        note: t.note1,
      },
      {
        id: `${id}-e2`,
        sort: 1,
        presetKey: "reception",
        customName: null,
        venueName: "Sala Ballsaal",
        venueAddress: "Düsseldorf, Deutschland",
        mapsUrl: "",
        startsAt: wallTimeToUtcIso(`${year}-06-13T18:00`, timezone),
        note: t.note2,
      },
    ],
    families: [
      {
        id: `${id}-f1`,
        side: "a",
        personName: t.a,
        parents: `${t.parentsA} …`,
        grandparents: "",
      },
      {
        id: `${id}-f2`,
        side: "b",
        personName: t.b,
        parents: `${t.parentsB} …`,
        grandparents: "",
      },
    ],
    verses: [
      ...(tradition === "islamic"
        ? [
            { id: `${id}-v1`, sort: 0, libraryKey: "ar-rum-30-21", customArabic: null, customText: null, customRef: null },
            { id: `${id}-v2`, sort: 1, libraryKey: "an-naba-78-8", customArabic: null, customText: null, customRef: null },
          ]
        : [
            { id: `${id}-v1`, sort: 0, libraryKey: "1-cor-13-4", customArabic: null, customText: null, customRef: null },
            { id: `${id}-v2`, sort: 1, libraryKey: "mark-10-9", customArabic: null, customText: null, customRef: null },
          ]),
    ],
    updatedAt: new Date().toISOString(),
  };
}
