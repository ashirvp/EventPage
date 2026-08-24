"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_NAMES } from "@/lib/i18n";
import { LOCALES, type Locale } from "@/lib/types";

export function NewInvite({ label }: { label: string }) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const data = await res.json();
      if (data?.invite?.id) router.push(`/edit/${data.invite.id}`);
      else setBusy(false);
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="row">
      <select className="select" style={{ width: "auto" }} value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}>
        {LOCALES.map((l) => (
          <option key={l} value={l}>{LOCALE_NAMES[l]}</option>
        ))}
      </select>
      <button className="cta" onClick={create} disabled={busy}>{label}</button>
    </div>
  );
}
