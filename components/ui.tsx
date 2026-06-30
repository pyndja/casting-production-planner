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
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
      {action && <div className="shrink-0 whitespace-nowrap">{action}</div>}
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

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-border/60 ${className}`}
      aria-hidden="true"
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
      <p className="font-serif text-lg font-semibold text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
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
