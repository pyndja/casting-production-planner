"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCombinedMoById, type CreatedCombinedMo } from "@/lib/mergeStore";
import { formatGram, formatInt } from "@/lib/format";
import { PageHeader, Badge, Card, Section, Skeleton } from "@/components/ui";
import { CapacityBar } from "@/components/CapacityBar";
import {
  CombinedTreeVisual,
  buildProductColorMap,
} from "@/components/CombinedTreeVisual";

export default function MoGabunganPage() {
  const params = useParams<{ id: string; moId: string }>();
  const [mo, setMo] = useState<CreatedCombinedMo | null | undefined>(undefined);

  useEffect(() => {
    setMo(getCombinedMoById(params.moId) ?? null);
  }, [params.moId]);

  if (mo === undefined) {
    return (
      <div>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-6 h-9 w-72" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        <Skeleton className="mt-8 h-16 w-full" />
        <Skeleton className="mt-6 h-72 w-full" />
      </div>
    );
  }

  if (mo === null) {
    return (
      <div>
        <p className="text-muted">MO Gabungan tidak ditemukan.</p>
        <Link href={`/som/${params.id}`} className="text-gold-strong">
          ← Kembali
        </Link>
      </div>
    );
  }

  const colorMap = buildProductColorMap(mo.batches.map((b) => b.productId));

  return (
    <div>
      <Link
        href={`/som/${params.id}`}
        className="mb-4 inline-block text-sm text-muted hover:text-gold-strong print:hidden"
      >
        ← Kembali ke SOM
      </Link>

      <PageHeader
        eyebrow="Manufacturing Order — Batang Gabungan"
        title={mo.voucherNo}
        description={`${mo.metalLabel} · Flask ${mo.flaskLabel} · dibuat ${new Date(
          mo.createdAt,
        ).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`}
        action={
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-gold/50 hover:bg-gold-soft/40 print:hidden"
          >
            Cetak
          </button>
        }
      />

      <div className="mb-6 rounded-lg border border-gold/40 bg-gold-soft px-4 py-3 text-sm text-gold-strong">
        MO ini menggabungkan sisa pcs dari {mo.batches.length} produk berbeda
        ke dalam satu batang casting yang sama. Setelah cor, pisahkan pcs
        sesuai warna sebelum lanjut ke tahap produksi masing-masing produk.
      </div>

      <Section title="Produk dalam Batang Ini">
        <Card>
          <div className="-mx-1 overflow-x-auto px-1">
            <table className="w-full min-w-[28rem] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="py-1 font-medium">Produk</th>
                  <th className="py-1 font-medium whitespace-nowrap">Pcs</th>
                  <th className="py-1 font-medium whitespace-nowrap">Berat</th>
                  <th className="py-1"></th>
                </tr>
              </thead>
              <tbody>
                {mo.batches.map((b) => (
                  <tr key={b.productId} className="border-t border-border">
                    <td className="py-2 font-medium text-ink">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: colorMap.get(b.productId) }}
                          aria-hidden="true"
                        />
                        {b.productName}
                      </span>
                    </td>
                    <td className="py-2 whitespace-nowrap">
                      {formatInt(b.pieces)}
                    </td>
                    <td className="py-2 whitespace-nowrap">
                      {formatGram(b.weight)}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap print:hidden">
                      <Link
                        href={`/som/${params.id}/mo/${b.productId}`}
                        className="text-xs text-gold-strong hover:underline"
                      >
                        Lihat MO produk →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      <Section title="Kapasitas & Visualisasi Batang">
        <Card>
          <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
            <div>
              <h4 className="mb-2 text-sm font-medium text-ink">
                Kapasitas Mesin per Batang
              </h4>
              <CapacityBar
                machineCapacity={mo.machineCapacity}
                metalUsed={mo.totalWeight}
              />
            </div>
            <div className="flex flex-col items-center">
              <h4 className="mb-2 text-sm font-medium text-ink">
                Pohon Lilin Gabungan
              </h4>
              <CombinedTreeVisual
                suggestion={mo}
                colorMap={colorMap}
                availableCapacity={mo.availableCapacity}
              />
            </div>
          </div>
        </Card>
      </Section>

      <p className="text-xs text-muted">
        <Badge tone="neutral">Catatan</Badge> Batang penuh milik tiap produk
        tidak berubah — MO ini hanya khusus untuk batang yang memadatkan sisa
        pcs antar produk sejenis (logam &amp; flask sama).
      </p>
    </div>
  );
}
