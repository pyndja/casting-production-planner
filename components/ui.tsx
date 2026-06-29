import Link from "next/link";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gold-strong">
            <span className="h-px w-6 bg-gold" />
            {eyebrow}
          </div>
        )}
        <h1 className="mt-2 text-3xl font-semibold text-ink">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "gold" | "ink";
}) {
  const tones = {
    neutral: "border-border bg-background text-muted",
    gold: "border-gold/40 bg-gold-soft text-gold-strong",
    ink: "border-transparent bg-ink text-white",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function LinkCard({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-border bg-surface p-5 transition-colors hover:border-gold/50 hover:bg-gold-soft/30"
    >
      {children}
    </Link>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}
