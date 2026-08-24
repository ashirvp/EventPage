"use client";
import { useState } from "react";
import type { Wish } from "@/lib/types";

export function WishModeration({ initial }: { initial: Wish[] }) {
  const [wishes, setWishes] = useState(initial);

  async function set(id: string, status: Wish["status"]) {
    setWishes((w) => w.map((x) => (x.id === id ? { ...x, status } : x)));
    await fetch("/api/moderate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch(() => {});
  }

  if (wishes.length === 0) return null;

  return (
    <div className="list">
      {wishes.map((w) => (
        <div className="list-row" key={w.id}>
          <div>
            <strong>{w.name}</strong>
            <div style={{ fontSize: ".85rem", color: "var(--app-muted)" }}>{w.message}</div>
          </div>
          <div className="row">
            <span className="pill">{w.status}</span>
            {w.status !== "approved" && (
              <button className="cta cta-ghost" onClick={() => set(w.id, "approved")}>✓</button>
            )}
            {w.status !== "hidden" && (
              <button className="cta cta-ghost" onClick={() => set(w.id, "hidden")}>✕</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
