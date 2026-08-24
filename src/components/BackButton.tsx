"use client";
import { useRouter } from "next/navigation";

export function BackButton({
  fallback = "/dashboard",
  label = "← Back",
  className = "b-back",
}: {
  fallback?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      window.location.href = fallback;
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={className}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        font: "inherit",
      }}
    >
      {label}
    </button>
  );
}
