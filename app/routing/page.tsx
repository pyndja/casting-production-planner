import Link from "next/link";
import { ROUTINGS } from "@/data";
import { CATEGORY_LABELS } from "@/lib/types";
import { PageHeader, Badge, Card } from "@/components/ui";

export default function RoutingPage() {
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
        title="Routing Produksi"
        description="Urutan tahap produksi berbeda per kategori produk. Tahap Casting adalah titik kalkulasi pohon lilin."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {ROUTINGS.map((r) => (
          <Card key={r.id}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="font-serif text-lg font-semibold text-ink">
                {r.name}
              </h3>
              <Badge tone="neutral">{CATEGORY_LABELS[r.category]}</Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
              {r.steps.map((step, i) => (
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
                  {i < r.steps.length - 1 && (
                    <span className="mx-1 text-muted" aria-hidden="true">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
