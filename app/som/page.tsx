"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Som } from "@/lib/types";
import {
  getAllSoms,
  getCustomSoms,
  deleteSom,
  clearCustomSoms,
} from "@/lib/store";
import { PRODUCT_MAP } from "@/data";
import { formatDate, formatInt } from "@/lib/format";
import { PageHeader, Badge, Skeleton } from "@/components/ui";
import { toast } from "@/lib/toast";

export default function SomListPage() {
  const [soms, setSoms] = useState<Som[]>([]);
  const [customIds, setCustomIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  function refresh() {
    setSoms(getAllSoms());
    setCustomIds(new Set(getCustomSoms().map((s) => s.id)));
  }

  useEffect(() => {
    refresh();
    setLoaded(true);
  }, []);

  function onDelete(som: Som) {
    if (!confirm(`Hapus ${som.orderNo}? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }
    deleteSom(som.id);
    refresh();
    toast(`${som.orderNo} dihapus.`, "info");
  }

  function onReset() {
    if (!confirm("Hapus semua SOM demo yang kamu buat? Data seed tetap aman.")) {
      return;
    }
    clearCustomSoms();
    refresh();
    toast("Data demo direset.", "info");
  }

  const hasCustom = customIds.size > 0;

  return (
    <div>
      <PageHeader
        eyebrow="Order"
        title="Surat Order Marketing"
        description="Daftar order. Pilih SOM untuk melihat kalkulasi kebutuhan casting agregat."
        action={
          <div className="flex items-center gap-2">
            {hasCustom && (
              <button
                type="button"
                onClick={onReset}
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-red-300 hover:text-red-600"
              >
                Reset demo
              </button>
            )}
            <Link
              href="/som/baru"
              className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90"
            >
              + Buat SOM
            </Link>
          </div>
        }
      />

      {!loaded ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-3 w-28" />
              <Skeleton className="mt-5 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {soms.map((som) => {
            const totalPcs = som.lines.reduce((s, l) => s + l.quantity, 0);
            const isCustom = customIds.has(som.id);
            return (
              <div
                key={som.id}
                className="group relative rounded-xl border border-border bg-surface p-5 transition-colors hover:border-gold/50 hover:bg-gold-soft/30"
              >
                <Link href={`/som/${som.id}`} className="block">
                  <div className="flex items-center justify-between gap-2 pr-8">
                    <h3 className="font-serif text-lg font-semibold text-ink">
                      {som.orderNo}
                    </h3>
                    <div className="flex items-center gap-2">
                      {isCustom && <Badge tone="gold">Demo</Badge>}
                      <Badge tone="neutral">{formatDate(som.date)}</Badge>
                    </div>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{som.customer}</p>

                  <div className="mt-4 space-y-1 text-sm">
                    {som.lines.map((l, i) => {
                      const p = PRODUCT_MAP.get(l.productId);
                      return (
                        <div key={i} className="flex justify-between gap-2">
                          <span className="text-muted">
                            {p?.name ?? l.productId}
                          </span>
                          <span className="font-medium text-ink">
                            {formatInt(l.quantity)} pcs
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 border-t border-border pt-3 text-sm font-medium text-gold-strong">
                    Total {formatInt(totalPcs)} pcs · {som.lines.length} produk
                  </div>
                </Link>

                {isCustom && (
                  <button
                    type="button"
                    onClick={() => onDelete(som)}
                    aria-label={`Hapus ${som.orderNo}`}
                    className="absolute right-3 top-3 rounded-md p-1.5 text-muted opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M5 5l6 6M11 5l-6 6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
