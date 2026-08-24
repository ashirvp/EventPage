"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setState(error ? "error" : "sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return <p className="lede">Check your inbox — the link signs you straight in.</p>;
  }

  return (
    <form onSubmit={submit} style={{ marginTop: "1.5rem", maxWidth: "22rem" }}>
      <label className="field">
        <span className="label">Email</span>
        <input className="input" type="email" required autoComplete="email"
               value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <button className="cta" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send me a link"}
      </button>
      {state === "error" && <p className="b-missing" style={{ marginTop: ".75rem" }}>That didn&apos;t work. Try again.</p>}
    </form>
  );
}
