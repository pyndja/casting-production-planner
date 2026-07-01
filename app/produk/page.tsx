import Link from "next/link";
import { PRODUCTS } from "@/data";
import { getFlask, getMetal } from "@/lib/constants";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatGram } from "@/lib/format";
import { PageHeader, Badge } from "@/components/ui";

export default function ProdukPage() {
  return (
    <div>
      <Link
        href="/"
        className="mb-4 inline-block text-sm text-muted hover:text-gold-strong"
      >
        ← Kembali ke Dashboard
      </Link>

      <PageHeader
        eyebrow="Master Data"
        title="Produk & BOM"
        description="Daftar produk emas beserta Bill of Materials standar per pcs."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p) => {
          const metal = getMetal(p.bom.metalTypeId);
          const flask = getFlask(p.bom.flaskSizeId);
          const stones = p.bom.stones.reduce((s, st) => s + st.count, 0);
          return (
            <Link
              key={p.id}
              href={`/produk/${p.id}`}
              className="block rounded-xl border border-border bg-surface p-5 transition-colors hover:border-gold/50 hover:bg-gold-soft/30"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif text-lg font-semibold text-ink">
                  {p.name}
                </h3>
                <Badge tone="gold">{CATEGORY_LABELS[p.category]}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted">{p.sku}</p>

              <dl className="mt-4 space-y-1.5 text-sm">
                <Row label="Logam" value={metal?.label ?? "-"} />
                <Row label="Berat lilin" value={formatGram(p.bom.waxWeight)} />
                <Row
                  label="Flask default"
                  value={flask?.label ?? "Pilih saat order"}
                />
                <Row label="Batu / pcs" value={stones > 0 ? `${stones}` : "-"} />
              </dl>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
