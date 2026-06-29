import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getRoutingForProduct, PRODUCTS } from "@/data";
import { getFlask, getMetal, FLASK_SIZES } from "@/lib/constants";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatGram, formatInt } from "@/lib/format";
import { calculateProductCasting } from "@/lib/casting";
import { PageHeader, Badge, Card, Section } from "@/components/ui";
import { CastingResultCard } from "@/components/CastingResultCard";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

const PREVIEW_QTY = 100;

export default async function ProdukDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const metal = getMetal(product.bom.metalTypeId);
  const flask = getFlask(product.bom.flaskSizeId);
  const routing = getRoutingForProduct(product);
  const stonesPerPiece = product.bom.stones.reduce((s, st) => s + st.count, 0);

  // Pratinjau kalkulasi. Jika BOM tanpa flask, asumsikan flask terbesar.
  const previewFlaskId = product.bom.flaskSizeId ?? FLASK_SIZES[2].id;
  const pc = calculateProductCasting(product, PREVIEW_QTY, previewFlaskId);

  return (
    <div>
      <Link
        href="/produk"
        className="mb-4 inline-block text-sm text-muted hover:text-gold-strong"
      >
        ← Kembali ke daftar produk
      </Link>

      <PageHeader
        eyebrow={CATEGORY_LABELS[product.category]}
        title={product.name}
        description={`SKU ${product.sku}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Bill of Materials (per 1 pcs)">
          <Card>
            <dl className="space-y-2.5 text-sm">
              <Row label="Logam" value={metal?.label ?? "-"} />
              <Row label="Berat lilin" value={formatGram(product.bom.waxWeight)} />
              <Row
                label="Flask default"
                value={flask?.label ?? "— (pilih saat order)"}
              />
              <Row
                label="Total batu"
                value={stonesPerPiece > 0 ? `${stonesPerPiece} pcs` : "Tanpa batu"}
              />
            </dl>

            {product.bom.stones.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Rincian Batu
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted">
                      <th className="py-1 font-medium">Jenis</th>
                      <th className="py-1 font-medium">Jumlah</th>
                      <th className="py-1 font-medium">Ukuran</th>
                      <th className="py-1 font-medium">Total ct</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.bom.stones.map((st, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="py-1.5">{st.type}</td>
                        <td className="py-1.5">{st.count}</td>
                        <td className="py-1.5">
                          {st.sizeMm ? `${st.sizeMm} mm` : "-"}
                        </td>
                        <td className="py-1.5">
                          {st.totalCarat ? `${st.totalCarat} ct` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {product.bom.notes && (
              <p className="mt-4 rounded-lg bg-background px-3 py-2 text-xs text-muted">
                {product.bom.notes}
              </p>
            )}
          </Card>
        </Section>

        <Section title="Routing Produksi">
          <Card>
            {routing ? (
              <>
                <p className="mb-3 text-sm font-medium text-ink">
                  {routing.name}
                </p>
                <ol className="space-y-2">
                  {routing.steps.map((step, i) => (
                    <li key={step.id} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-medium text-white">
                        {i + 1}
                      </span>
                      <span className="text-sm text-ink">{step.name}</span>
                      {step.isCasting && <Badge tone="gold">Casting</Badge>}
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="text-sm text-muted">Routing tidak ditemukan.</p>
            )}
          </Card>
        </Section>
      </div>

      <Section title={`Pratinjau Kalkulasi Casting (${formatInt(PREVIEW_QTY)} pcs)`}>
        {!product.bom.flaskSizeId && (
          <p className="mb-3 rounded-lg border border-gold/40 bg-gold-soft px-3 py-2 text-xs text-gold-strong">
            BOM produk ini tidak punya flask default — pratinjau memakai asumsi
            flask {getFlask(previewFlaskId)?.label}. Saat order, flask wajib
            dipilih.
          </p>
        )}
        {pc.result && pc.metal && pc.flask && (
          <CastingResultCard
            result={pc.result}
            metalLabel={pc.metal.label}
            flaskLabel={pc.flask.label}
            quantity={pc.quantity}
          />
        )}
      </Section>
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
