import Link from "next/link";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/som", label: "SOM" },
  { href: "/produk", label: "Produk & BOM" },
  { href: "/routing", label: "Routing" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gold font-serif text-sm font-bold text-ink">
              U
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-base font-semibold">
                UBS Gold
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-white/60">
                Casting Planner
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</div>

      <footer className="border-t border-border py-4 text-center text-xs text-muted">
        UBS Gold Casting Production Planner
      </footer>
    </div>
  );
}
