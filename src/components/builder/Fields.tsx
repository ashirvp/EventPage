"use client";

export function Text({
  label, value, onChange, type = "text", ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      <input className="input" type={type} value={value}
             onChange={(e) => onChange(e.target.value)} {...rest} />
    </label>
  );
}

export function Area({
  label, value, onChange, rows = 3,
}: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      <textarea className="textarea" rows={rows} value={value}
                onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function Select<T extends string>({
  label, value, onChange, options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      <select className="select" value={value}
              onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked}
             onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function Section({
  title, summary, children, open, onToggle,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="b-section">
      <button type="button" className="b-head" aria-expanded={open} onClick={onToggle}>
        <span className="b-head-title">{title}</span>
        {/* An honest count, rather than a progress bar that overstates things. */}
        <span className="b-head-sum">{summary}</span>
        <span className="b-head-chev" aria-hidden="true">{open ? "–" : "+"}</span>
      </button>
      {open && <div className="b-body">{children}</div>}
    </section>
  );
}
