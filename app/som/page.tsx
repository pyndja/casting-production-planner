"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Som } from "@/lib/types";
import { getAllSoms } from "@/lib/store";
import { PRODUCT_MAP } from "@/data";
import { formatDate, formatInt } from "@/lib/format";
import { PageHeader, Badge } from "@/components/ui";

export default function SomListPage() {
  const [soms, setSoms] = useState<Som[]>([]);

  useEffect(() => {
    setSoms(getAllSoms());
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Order"
        title="Surat Order Marketing"
        description="Daftar order. Pilih SOM untuk melihat kalkulasi kebutuhan casting agregat."
        action={
          <Link
            href="/som/baru"
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90"
          >
            + Buat SOM
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {soms.map((som) => {
          const totalPcs = som.lines.reduce((s, l) => s + l.quantity, 0);
          return (
            <Link
              key={som.id}
              href={`/som/${som.id}`}
              className="block rounded-xl border border-border bg-surface p-5 transition-colors hover:border-gold/50 hover:bg-gold-soft/30"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-serif text-lg font-semibold text-ink">
                  {som.orderNo}
                </h3>
                <Badge tone="neutral">{formatDate(som.date)}</Badge>
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
          );
        })}
      </div>
    </div>
  );
}
