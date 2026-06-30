"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Som } from "@/lib/types";
import { getAllSoms } from "@/lib/store";
import { PRODUCTS, PRODUCT_MAP, ROUTINGS } from "@/data";
import { aggregateSom } from "@/lib/casting";
import { formatDate, formatInt } from "@/lib/format";
import { Skeleton } from "@/components/ui";

export default function Dashboard() {
  const [soms, setSoms] = useState<Som[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSoms(getAllSoms());
    setLoaded(true);
  }, []);

  const totalTrees = soms.reduce(
    (sum, s) => sum + aggregateSom(s, PRODUCT_MAP).grandTotalTrees,
    0,
  );
  const totalPcs = soms.reduce(
    (sum, s) => sum + s.lines.reduce((a, l) => a + l.quantity, 0),
    0,
  );

  return (
    <div>
      {/* Hero */}
      <div className="mb-10 rounded-2xl border border-border bg-gradient-to-br from-ink to-[#2a2620] px-8 py-12 text-white">
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gold">
          <span className="h-px w-6 bg-gold" />
          UBS Gold · Trust in Gold
        </div>
        <h1 className="mt-3 max-w-2xl font-serif text-4xl font-semibold leading-tight">
          Casting Production Planner
        </h1>
        <p className="mt-3 max-w-xl text-white/70">
          Dari Surat Order Marketing hingga kebutuhan pohon lilin per batang —
          kalkulasi casting perhiasan emas yang presisi di setiap level produksi.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/som"
            className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-strong"
          >
            Lihat Order (SOM)
          </Link>
          <Link
            href="/som/baru"
            className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            + Buat SOM
          </Link>
        </div>
      </div>

      {/* KPI */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Order (SOM)" value={loaded ? formatInt(soms.length) : null} />
        <Kpi label="Produk" value={formatInt(PRODUCTS.length)} />
        <Kpi
          label="Total pcs dipesan"
          value={loaded ? formatInt(totalPcs) : null}
        />
        <Kpi
          label="Total pohon lilin"
          value={loaded ? formatInt(totalTrees) : null}
          accent
        />
      </div>

      {/* Recent SOM */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
              Order Terbaru
            </h2>
            <Link href="/som" className="text-sm text-gold-strong hover:underline">
              Semua →
            </Link>
          </div>
          <div className="space-y-3">
            {!loaded &&
              [0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-[4.5rem] w-full" />
              ))}
            {loaded &&
              soms.slice(0, 4).map((som) => {
              const pcs = som.lines.reduce((a, l) => a + l.quantity, 0);
              const trees = aggregateSom(som, PRODUCT_MAP).grandTotalTrees;
              return (
                <Link
                  key={som.id}
                  href={`/som/${som.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-gold/50 hover:bg-gold-soft/30"
                >
                  <div>
                    <div className="font-serif font-semibold text-ink">
                      {som.orderNo}
                    </div>
                    <div className="text-xs text-muted">
                      {som.customer} · {formatDate(som.date)}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold text-gold-strong">
                      {formatInt(trees)} pohon
                    </div>
                    <div className="text-xs text-muted">
                      {formatInt(pcs)} pcs
                    </div>
                  </div>
                </Link>
              );
            })}
            {loaded && soms.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-surface/60 px-5 py-8 text-center">
                <p className="text-sm text-muted">Belum ada order.</p>
                <Link
                  href="/som/baru"
                  className="mt-3 inline-block rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90"
                >
                  + Buat SOM pertama
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">
            Master Data
          </h2>
          <div className="space-y-3">
            <QuickLink
              href="/produk"
              title="Produk & BOM"
              sub={`${PRODUCTS.length} produk emas`}
            />
            <QuickLink
              href="/routing"
              title="Routing Produksi"
              sub={`${ROUTINGS.length} alur per kategori`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | null;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        accent ? "border-gold/40 bg-gold-soft" : "border-border bg-surface"
      }`}
    >
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      {value === null ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : (
        <div className="mt-2 font-serif text-3xl font-semibold text-ink">
          {value}
        </div>
      )}
    </div>
  );
}

function QuickLink({
  href,
  title,
  sub,
}: {
  href: string;
  title: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-gold/50 hover:bg-gold-soft/30"
    >
      <div className="font-medium text-ink">{title}</div>
      <div className="text-xs text-muted">{sub}</div>
      <div className="mt-1 text-sm text-gold-strong">Buka →</div>
    </Link>
  );
}
