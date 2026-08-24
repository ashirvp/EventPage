export const LOCALES = ["en", "de", "tr"] as const;
export type Locale = (typeof LOCALES)[number];

export const THEME_IDS = [
  "ivory-gold",
  "onyx-champagne",
  "emerald-brass",
  "iznik-blue",
  "marble-gilt",
  "rosewater",
  "sand-terracotta",
  "kasavu",
] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export const OPENER_IDS = ["veil", "foil", "envelope", "direct"] as const;
export type OpenerId = (typeof OPENER_IDS)[number];

export const TRADITIONS = ["islamic", "christian"] as const;
export type Tradition = (typeof TRADITIONS)[number];

export type SectionKey =
  | "families"
  | "verses"
  | "events"
  | "rsvp"
  | "wishes"
  | "info"
  | "music";

export type InviteEvent = {
  id: string;
  sort: number;
  /** Preset key resolved per locale, or null when customName is used. */
  presetKey: string | null;
  customName: string | null;
  venueName: string;
  venueAddress: string;
  mapsUrl: string;
  /** ISO-8601 UTC instant. Never a bare "YYYY-MM-DD HH:mm" string. */
  startsAt: string;
  note: string;
};

export type Family = {
  id: string;
  side: "a" | "b";
  personName: string;
  parents: string;
  grandparents: string;
};

export type Verse = {
  id: string;
  sort: number;
  /** Key into the verse library, or null when the couple supplied their own. */
  libraryKey: string | null;
  /** Original-script line (Arabic for Qur'an verses); absent for most others. */
  customArabic: string | null;
  customText: string | null;
  customRef: string | null;
};

export type Invite = {
  id: string;
  ownerId: string;
  slug: string;
  status: "draft" | "published";
  /**
   * False while the slug tracks the couple's names. Set once someone edits the
   * address by hand, and effectively frozen at publish so links already sent
   * to guests keep working.
   */
  slugLocked: boolean;
  locale: Locale;
  /** Chooses the verse library and the scripture section's heading. */
  tradition: Tradition;
  theme: ThemeId;
  opener: OpenerId;
  /** IANA zone, e.g. "Europe/Berlin". Anchors every countdown. */
  timezone: string;
  partnerAName: string;
  partnerBName: string;
  heroImage: string | null;
  inviteCard: string | null;
  sections: Record<SectionKey, boolean>;
  rsvpDeadline: string | null;
  infoWeather: string;
  infoDress: string;
  infoParking: string;
  events: InviteEvent[];
  families: Family[];
  verses: Verse[];
  updatedAt: string;
};

export type Rsvp = {
  id: string;
  inviteId: string;
  name: string;
  attending: boolean;
  guestCount: number;
  message: string;
  createdAt: string;
};

export type Wish = {
  id: string;
  inviteId: string;
  name: string;
  message: string;
  status: "pending" | "approved" | "hidden";
  createdAt: string;
};
