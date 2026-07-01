"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Som } from "@/lib/types";
import { getSomById } from "@/lib/store";
import { getProduct, getRoutingForProduct } from "@/data";
import { calculateProductCasting, type ProductCastingResult } from "@/lib/casting";
import { getCombinedMosForSom, type CreatedCombinedMo } from "@/lib/mergeStore";
import { formatGram, formatInt } from "@/lib/format";
import { PageHeader, Badge, Card, Section, Skeleton } from "@/components/ui";
import { CastingResultCard } from "@/components/CastingResultCard";

export default function MoPage() {
  const params = useParams<{ id: string; productId: string }>();
  const [som, setSom] = useState<Som | null | undefined>(undefined);
  const [pc, setPc] = useState<ProductCastingResult | null>(null);
  const [mergedInto, setMergedInto] = useState<CreatedCombinedMo | null>(null);

  useEffect(() => {
    const found = getSomById(params.id);
    setSom(found ?? null);
    if (found) {
      const line = found.lines.find((l) => l.productId === params.productId);
      const product = getProduct(params.productId);
      if (line && product) {
        setPc(calculateProductCasting(product, line.quantity, line.flaskSizeId));
      }
      const mo = getCombinedMosForSom(found.id).find((m) =>
        m.batches.some((b) => b.productId === params.productId),
      );
      setMergedInto(mo ?? null);
    }
  }, [params.id, params.productId]);

  if (som === undefined) {
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
  if (som === null || !pc) {
    return (
      <div>
        <p className="text-muted">Manufacturing Order tidak ditemukan.</p>
        <Link href="/som" className="text-gold-strong">
          ← Kembali
        </Link>
      </div>
    );
  }

  const routing = getRoutingForProduct(pc.product);
  const voucherNo = `MO-${som.orderNo.replace("SOM-", "")}-${pc.product.sku}`;

  const mergedBatch = mergedInto?.batches.find(
    (b) => b.productId === params.productId,
  );
  // Kalau sisa batang terakhir sudah digabung ke MO lain, batang dedicated
  // produk ini cuma yang penuh saja — sisanya dicor bersama produk lain.
  const displayResult =
    mergedBatch && pc.result
      ? {
          ...pc.result,
          treesNeeded: pc.result.treesNeeded - 1,
          totalPiecesCapacity:
            (pc.result.treesNeeded - 1) * pc.result.piecesPerTree,
        }
      : pc.result;
  const displayQuantity =
    mergedBatch && pc.result
      ? (pc.result.treesNeeded - 1) * pc.result.piecesPerTree
      : pc.quantity;

  return (
    <div>
      <Link
        href={`/som/${som.id}`}
        className="mb-4 inline-block text-sm text-muted hover:text-gold-strong"
      >
        ← Kembali ke {som.orderNo}
      </Link>

      <PageHeader
        eyebrow="Manufacturing Order"
        title={pc.product.name}
        description={`${voucherNo} · dari ${som.orderNo} · ${formatInt(pc.quantity)} pcs`}
      />

      <Section title="Routing Produksi">
        <Card>
          <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
            {routing?.steps.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <span
                  className={`rounded-md px-2.5 py-1 text-sm ${
                    step.isCasting
                      ? "bg-gold-soft font-medium text-gold-strong"
                      : "bg-background text-ink"
                  }`}
                >
                  {step.name}
                </span>
                {i < routing.steps.length - 1 && (
                  <span className="mx-1 text-muted" aria-hidden="true">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {mergedBatch && mergedInto && (
        <div className="mb-6 rounded-lg border border-gold/40 bg-gold-soft px-4 py-3 text-sm text-gold-strong">
          Sisa {formatInt(mergedBatch.pieces)} pcs ({formatGram(mergedBatch.weight)})
          dari pesanan ini sudah digabung ke batang bersama produk lain — lihat{" "}
          <Link
            href={`/som/${som.id}/mo-gabungan/${mergedInto.id}`}
            className="underline hover:no-underline"
          >
            {mergedInto.voucherNo}
          </Link>
          . Kalkulasi di bawah cuma untuk batang dedicated produk ini.
        </div>
      )}

      <Section title="Kalkulasi Tahap Casting">
        {pc.needsFlask ? (
          <Card className="border-gold/40 bg-gold-soft">
            <p className="text-sm text-gold-strong">
              Produk ini belum punya ukuran flask. Pilih flask pada SOM untuk
              menghitung kebutuhan casting.
            </p>
          </Card>
        ) : (
          displayResult &&
          pc.metal &&
          pc.flask && (
            <CastingResultCard
              result={displayResult}
              metalLabel={pc.metal.label}
              flaskLabel={pc.flask.label}
              quantity={displayQuantity}
            />
          )
        )}
      </Section>

      <p className="text-xs text-muted">
        <Badge tone="neutral">Catatan</Badge> Kalkulasi casting memakai rumus
        yang sama di semua level (BOM, MO, agregat SOM).
      </p>
    </div>
  );
}
