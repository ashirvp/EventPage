"use client";
import { useEffect, useState } from "react";
import { LOCALE_NAMES } from "@/lib/i18n";
import { LOCALES, type Locale } from "@/lib/types";

export function NewInvite({
  label,
  showSelect = true,
  className = "cta",
  flat = false,
  initialLocale = "en",
}: {
  label: string;
  showSelect?: boolean;
  className?: string;
  flat?: boolean;
  initialLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLocale(initialLocale);
  }, [initialLocale]);

  async function create() {
    setBusy(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const data = await res.json();
      if (data?.invite?.id) {
        window.location.href = `/edit/${data.invite.id}`;
      } else {
        setBusy(false);
      }
    } catch {
      setBusy(false);
    }
  }

  const content = (
    <>
      {showSelect && (
        <select
          className="select"
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
        >
          {LOCALES.map((l) => (
            <option key={l} value={l}>
              {LOCALE_NAMES[l]}
            </option>
          ))}
        </select>
      )}
      <button className={className} onClick={create} disabled={busy}>
        {busy ? "Starting…" : label}
      </button>
    </>
  );

  if (flat) return content;
  return <div className="row">{content}</div>;
}

