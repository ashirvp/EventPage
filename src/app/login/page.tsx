import { SUPABASE_CONFIGURED } from "@/lib/db";
import { LoginForm } from "@/components/LoginForm";
import { PRODUCT_NAME } from "@/lib/config";
import { BackButton } from "@/components/BackButton";

export default function LoginPage() {
  return (
    <main className="page">
      <div style={{ marginBottom: "1rem" }}>
        <BackButton fallback="/" label="← Home" />
      </div>
      <h1>{PRODUCT_NAME}</h1>
      {SUPABASE_CONFIGURED ? (
        <>
          <p className="lede">
            No password. Enter your email and we&apos;ll send a link that signs you in.
          </p>
          <LoginForm />
        </>
      ) : (
        <>
          <p className="lede">
            Running in demo mode — no database is configured, so there is nothing
            to sign in to. Everything works; nothing survives a restart.
          </p>
          <p style={{ marginTop: "1.5rem" }}>
            <a className="cta" href="/dashboard">Continue</a>
          </p>
        </>
      )}
    </main>
  );
}
