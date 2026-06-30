"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Som } from "@/lib/types";
import { getSomById } from "@/lib/store";
import { getProduct, getRoutingForProduct } from "@/data";
import { calculateProductCasting, type ProductCastingResult } from "@/lib/casting";
import { formatInt } from "@/lib/format";
import { PageHeader, Badge, Card, Section, Skeleton } from "@/components/ui";
import { CastingResultCard } from "@/components/CastingResultCard";

export default function MoPage() {
  const params = useParams<{ id: string; productId: string }>();
  const [som, setSom] = useState<Som | null | undefined>(undefined);
  const [pc, setPc] = useState<ProductCastingResult | null>(null);

  useEffect(() => {
    const found = getSomById(params.id);
    setSom(found ?? null);
    if (found) {
      const line = found.lines.find((l) => l.productId === params.productId);
      const product = getProduct(params.productId);
      if (line && product) {
        setPc(calculateProductCasting(product, line.quantity, line.flaskSizeId));
      }
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

      <Section title="Kalkulasi Tahap Casting">
        {pc.needsFlask ? (
          <Card className="border-gold/40 bg-gold-soft">
            <p className="text-sm text-gold-strong">
              Produk ini belum punya ukuran flask. Pilih flask pada SOM untuk
              menghitung kebutuhan casting.
            </p>
          </Card>
        ) : (
          pc.result &&
          pc.metal &&
          pc.flask && (
            <CastingResultCard
              result={pc.result}
              metalLabel={pc.metal.label}
              flaskLabel={pc.flask.label}
              quantity={pc.quantity}
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
