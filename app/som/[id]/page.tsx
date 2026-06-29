"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Som } from "@/lib/types";
import { getSomById } from "@/lib/store";
import { PRODUCT_MAP } from "@/data";
import { aggregateSom, type SomCastingSummary } from "@/lib/casting";
import { formatDate, formatGram, formatInt } from "@/lib/format";
import { PageHeader, Badge, Card, Section } from "@/components/ui";

export default function SomDetailPage() {
  const params = useParams<{ id: string }>();
  const [som, setSom] = useState<Som | null | undefined>(undefined);
  const [summary, setSummary] = useState<SomCastingSummary | null>(null);

  useEffect(() => {
    const found = getSomById(params.id);
    setSom(found ?? null);
    if (found) setSummary(aggregateSom(found, PRODUCT_MAP));
  }, [params.id]);

  if (som === undefined) {
    return <p className="text-muted">Memuat…</p>;
  }
  if (som === null) {
    return (
      <div>
        <p className="text-muted">SOM tidak ditemukan.</p>
        <Link href="/som" className="text-gold-strong">
          ← Kembali
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/som"
        className="mb-4 inline-block text-sm text-muted hover:text-gold-strong"
      >
        ← Kembali ke daftar SOM
      </Link>

      <PageHeader
        eyebrow="Surat Order Marketing"
        title={som.orderNo}
        description={`${som.customer} · ${formatDate(som.date)}`}
      />

      {summary && (
        <>
          <Section title="Ringkasan Kebutuhan Casting">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Total pohon lilin" value={formatInt(summary.grandTotalTrees)} accent />
              <Stat label="Total pcs" value={formatInt(summary.grandTotalPieces)} />
              <Stat label="Total batu" value={formatInt(summary.totalStones)} />
              <Stat
                label="Run casting"
                value={`${summary.groups.length} batch`}
              />
            </div>

            {summary.metalByKarat.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {summary.metalByKarat.map((m) => (
                  <Badge key={m.metal.id} tone="gold">
                    {m.metal.label}: {formatGram(m.totalMetal, 0)}
                  </Badge>
                ))}
              </div>
            )}
          </Section>

          <Section title="Batch Casting (per Jenis Logam × Ukuran Flask)">
            <div className="space-y-4">
              {summary.groups.map((g) => (
                <Card key={g.key}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-serif text-lg font-semibold text-ink">
                      {g.metal.label} · Flask {g.flask.label}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge tone="ink">{formatInt(g.totalTrees)} pohon</Badge>
                      <Badge tone="neutral">{formatGram(g.totalMetal, 0)} logam</Badge>
                      <Badge tone="neutral">{formatInt(g.totalPieces)} pcs</Badge>
                    </div>
                  </div>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted">
                        <th className="py-1 font-medium">Produk</th>
                        <th className="py-1 font-medium">Qty</th>
                        <th className="py-1 font-medium">g/pcs</th>
                        <th className="py-1 font-medium">pcs/pohon</th>
                        <th className="py-1 font-medium">Pohon</th>
                        <th className="py-1"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.lines.map((ln) => (
                        <tr key={ln.product.id} className="border-t border-border">
                          <td className="py-2 font-medium text-ink">
                            {ln.product.name}
                          </td>
                          <td className="py-2">{formatInt(ln.quantity)}</td>
                          <td className="py-2">
                            {formatGram(ln.result!.metalPerPiece)}
                          </td>
                          <td className="py-2">
                            {formatInt(ln.result!.piecesPerTree)}
                          </td>
                          <td className="py-2 font-semibold text-gold-strong">
                            {formatInt(ln.result!.treesNeeded)}
                          </td>
                          <td className="py-2 text-right">
                            <Link
                              href={`/som/${som.id}/mo/${ln.product.id}`}
                              className="text-xs text-gold-strong hover:underline"
                            >
                              Lihat MO →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              ))}
            </div>
          </Section>

          {summary.unresolved.length > 0 && (
            <Section title="Perlu Pemilihan Flask">
              <Card className="border-gold/40 bg-gold-soft">
                <p className="text-sm text-gold-strong">
                  Produk berikut belum punya ukuran flask — wajib dipilih sebelum
                  casting:
                </p>
                <ul className="mt-2 list-inside list-disc text-sm text-ink">
                  {summary.unresolved.map((u) => (
                    <li key={u.product.id}>{u.product.name}</li>
                  ))}
                </ul>
              </Card>
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        accent ? "border-gold/40 bg-gold-soft" : "border-border bg-surface"
      }`}
    >
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-xl font-semibold text-ink">{value}</div>
    </div>
  );
}
