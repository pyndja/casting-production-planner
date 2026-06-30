"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ToastType } from "@/lib/toast";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/som", label: "SOM" },
  { href: "/produk", label: "Produk & BOM" },
  { href: "/routing", label: "Routing" },
];

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Tutup menu mobile setiap pindah halaman.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Dengarkan event toast global.
  useEffect(() => {
    function onToast(e: Event) {
      const { message, type } = (e as CustomEvent).detail as {
        message: string;
        type: ToastType;
      };
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    }
    window.addEventListener("app:toast", onToast);
    return () => window.removeEventListener("app:toast", onToast);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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

          {/* Nav desktop */}
          <nav className="hidden items-center gap-1 text-sm md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white ${
                  isActive(item.href) ? "bg-white/10 text-white" : "text-white/80"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Tombol hamburger (mobile) */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/10 md:hidden"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Panel nav mobile */}
        {menuOpen && (
          <nav className="border-t border-white/10 px-4 py-2 text-sm md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`block rounded-md px-3 py-2.5 transition-colors hover:bg-white/10 ${
                  isActive(item.href)
                    ? "bg-white/10 text-white"
                    : "text-white/80"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</div>

      <footer className="border-t border-border py-4 text-center text-xs text-muted">
        UBS Gold Casting Production Planner
      </footer>

      {/* Toaster */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg ${
              t.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : t.type === "info"
                  ? "border-border bg-surface text-ink"
                  : "border-gold/40 bg-ink text-white"
            }`}
          >
            <span
              aria-hidden="true"
              className={t.type === "error" ? "text-red-500" : "text-gold"}
            >
              {t.type === "error" ? "⚠" : "✓"}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
