import { en } from "./en";
import { de } from "./de";
import { tr } from "./tr";
import type { Locale } from "../types";
import type { Messages } from "./en";

export type { Messages };

export const CATALOGUES: Record<Locale, Messages> = { en, de, tr };

export function messages(locale: Locale): Messages {
  return CATALOGUES[locale] ?? CATALOGUES.en;
}

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  tr: "Türkçe",
};

/** BCP-47 tag for the `lang` attribute. Turkish casing depends on this. */
export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  de: "de",
  tr: "tr",
};
