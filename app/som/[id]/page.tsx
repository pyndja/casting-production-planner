"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Som } from "@/lib/types";
import { getSomById, isCustomSom, deleteSom } from "@/lib/store";
import { PRODUCT_MAP } from "@/data";
import {
  aggregateSom,
  calculateEfficiencyInsight,
  suggestLeftoverMerge,
  type CombinedTreeSuggestion,
  type SomCastingGroup,
  type SomCastingSummary,
} from "@/lib/casting";
import { SAFETY_MARGIN, SPRUE_WEIGHT } from "@/lib/constants";
import {
  getCombinedMosForSom,
  getMergedProductIds,
  getTreeSavingsForSom,
  addCombinedMo,
  generateMoId,
  type CreatedCombinedMo,
} from "@/lib/mergeStore";
import { formatDate, formatGram, formatInt } from "@/lib/format";
import { PageHeader, Badge, Card, Section, Skeleton } from "@/components/ui";
import { toast } from "@/lib/toast";
import {
  CombinedTreeVisual,
  buildProductColorMap,
} from "@/components/CombinedTreeVisual";

export default function SomDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [som, setSom] = useState<Som | null | undefined>(undefined);
  const [summary, setSummary] = useState<SomCastingSummary | null>(null);
  const [custom, setCustom] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [combinedMos, setCombinedMos] = useState<CreatedCombinedMo[]>([]);

  function toggleGroup(key: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  useEffect(() => {
    const found = getSomById(params.id);
    setSom(found ?? null);
    setCustom(isCustomSom(params.id));
    if (found) {
      setSummary(aggregateSom(found, PRODUCT_MAP));
      setCombinedMos(getCombinedMosForSom(found.id));
    }
  }, [params.id]);

  function onDelete() {
    if (!som) return;
    if (!confirm(`Hapus ${som.orderNo}? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }
    deleteSom(som.id);
    toast(`${som.orderNo} dihapus.`, "info");
    router.push("/som");
  }

  function createCombinedMo(
    group: SomCastingGroup,
    suggestion: CombinedTreeSuggestion,
  ) {
    if (!som) return;
    const availableCapacity = group.flask.capacity * SAFETY_MARGIN - SPRUE_WEIGHT;
    const existingCount = getCombinedMosForSom(som.id).length;
    const id = generateMoId();
    const mo: CreatedCombinedMo = {
      id,
      somId: som.id,
      groupKey: group.key,
      voucherNo: `MO-${som.orderNo.replace("SOM-", "")}-GABUNGAN-${existingCount + 1}`,
      metalLabel: group.metal.label,
      flaskLabel: group.flask.label,
      machineCapacity: group.flask.capacity,
      availableCapacity,
      batches: suggestion.batches,
      totalPieces: suggestion.totalPieces,
      totalWeight: suggestion.totalWeight,
      createdAt: new Date().toISOString(),
    };
    addCombinedMo(mo);
    setCombinedMos(getCombinedMosForSom(som.id));
    toast(`${mo.voucherNo} dibuat — total pohon diperbarui.`, "success");
  }

  if (som === undefined) {
    return (
      <div>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-6 h-9 w-64" />
        <Skeleton className="mt-3 h-4 w-80" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="mt-8 h-48 w-full" />
      </div>
    );
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

  const treeSavings = getTreeSavingsForSom(som.id);

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
        action={
          <div className="flex items-center gap-2">
            <Link
              href={`/som/baru?from=${som.id}`}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-gold/50 hover:bg-gold-soft/40"
            >
              Duplikat
            </Link>
            {custom && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-red-300 hover:text-red-600"
              >
                Hapus
              </button>
            )}
          </div>
        }
      />

      {summary && (
        <>
          <Section title="Ringkasan Kebutuhan Casting">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat
                label="Total pohon lilin"
                value={formatInt(summary.grandTotalTrees - treeSavings)}
                accent
              />
              <Stat label="Total pcs" value={formatInt(summary.grandTotalPieces)} />
              <Stat label="Total batu" value={`${formatInt(summary.totalStones)} butir`} />
              <Stat
                label="Run casting"
                value={`${summary.groups.length} batch`}
              />
            </div>

            {treeSavings > 0 && (
              <p className="mt-3 text-xs text-muted">
                Sudah hemat {formatInt(treeSavings)} batang lewat{" "}
                {formatInt(combinedMos.length)} MO Gabungan yang dibuat.
              </p>
            )}

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
              {summary.groups.map((g) => {
                const mergedIds = getMergedProductIds(som.id, g.key);
                const insight = calculateEfficiencyInsight(g);
                const merge = suggestLeftoverMerge(g, mergedIds);
                const isExpanded = expandedGroups.has(g.key);
                const availableCapacity =
                  g.flask.capacity * SAFETY_MARGIN - SPRUE_WEIGHT;
                const groupCombinedMos = combinedMos.filter(
                  (m) => m.groupKey === g.key,
                );
                const colorMap = merge
                  ? buildProductColorMap(
                      merge.combinedTrees.flatMap((c) =>
                        c.batches.map((b) => b.productId),
                      ),
                    )
                  : new Map<string, string>();

                const adjustedLines = g.lines.map((ln) => ({
                  line: ln,
                  displayTrees:
                    ln.result!.treesNeeded -
                    (mergedIds.has(ln.product.id) ? 1 : 0),
                }));
                const adjustedGroupTotalTrees =
                  adjustedLines.reduce((sum, l) => sum + l.displayTrees, 0) +
                  groupCombinedMos.length;

                return (
                <Card key={g.key}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-serif text-lg font-semibold text-ink">
                      {g.metal.label} · Flask {g.flask.label}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge tone="ink">
                        {formatInt(adjustedGroupTotalTrees)} pohon
                      </Badge>
                      <Badge tone="neutral">{formatGram(g.totalMetal, 0)} logam</Badge>
                      <Badge tone="neutral">{formatInt(g.totalPieces)} pcs</Badge>
                    </div>
                  </div>

                  <div className="-mx-1 overflow-x-auto px-1">
                    <table className="w-full min-w-[34rem] text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted">
                          <th className="py-1 font-medium">Produk</th>
                          <th className="py-1 font-medium whitespace-nowrap">Qty</th>
                          <th className="py-1 font-medium whitespace-nowrap">g/pcs</th>
                          <th className="py-1 font-medium whitespace-nowrap">pcs/pohon</th>
                          <th className="py-1 font-medium whitespace-nowrap">Pohon</th>
                          <th className="py-1"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {adjustedLines.map(({ line: ln, displayTrees }) => (
                          <tr key={ln.product.id} className="border-t border-border">
                            <td className="py-2 font-medium text-ink">
                              {ln.product.name}
                              {mergedIds.has(ln.product.id) && (
                                <span className="ml-1.5">
                                  <Badge tone="neutral">sisa digabung</Badge>
                                </span>
                              )}
                            </td>
                            <td className="py-2 whitespace-nowrap">
                              {formatInt(ln.quantity)}
                            </td>
                            <td className="py-2 whitespace-nowrap">
                              {formatGram(ln.result!.metalPerPiece)}
                            </td>
                            <td className="py-2 whitespace-nowrap">
                              {formatInt(ln.result!.piecesPerTree)}
                            </td>
                            <td className="py-2 font-semibold text-gold-strong whitespace-nowrap">
                              {formatInt(displayTrees)}
                            </td>
                            <td className="py-2 text-right whitespace-nowrap">
                              <Link
                                href={`/som/${som.id}/mo/${ln.product.id}`}
                                className="text-xs text-gold-strong hover:underline"
                              >
                                Lihat MO →
                              </Link>
                            </td>
                          </tr>
                        ))}
                        {groupCombinedMos.map((mo) => (
                          <tr key={mo.id} className="border-t border-border bg-gold-soft/40">
                            <td className="py-2 font-medium text-ink">
                              → Batang Gabungan (
                              {mo.batches.map((b) => b.productName).join(" + ")})
                            </td>
                            <td className="py-2 whitespace-nowrap">
                              {formatInt(mo.totalPieces)}
                            </td>
                            <td className="py-2 whitespace-nowrap">-</td>
                            <td className="py-2 whitespace-nowrap">-</td>
                            <td className="py-2 font-semibold text-gold-strong whitespace-nowrap">
                              1
                            </td>
                            <td className="py-2 text-right whitespace-nowrap">
                              <Link
                                href={`/som/${som.id}/mo-gabungan/${mo.id}`}
                                className="text-xs text-gold-strong hover:underline"
                              >
                                Lihat MO Gabungan →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cuma tampil kalau ada ≥2 produk & belum ada MO Gabungan
                      dibuat untuk grup ini — dengan 1 produk saja, sisa
                      kapasitas tiap batang tidak mungkin ditutup. */}
                  {insight.potentialSavings > 0 &&
                    g.lines.length > 1 &&
                    groupCombinedMos.length === 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Badge tone="gold">
                          Estimasi teoretis: bisa hemat hingga{" "}
                          {formatInt(insight.potentialSavings)} batang jika
                          sisa kapasitas antar produk sejenis dipadatkan
                          sempurna
                        </Badge>
                      </div>
                    )}

                  {merge && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => toggleGroup(g.key)}
                        className="rounded-lg border border-dashed border-gold/60 px-4 py-2 text-sm font-medium text-gold-strong transition-colors hover:bg-gold-soft"
                      >
                        {isExpanded ? "Sembunyikan saran" : "Lihat saran penggabungan"}
                        {" — "}
                        {formatInt(merge.originalLeftoverTreeCount)} batang sisa
                        bisa dipadatkan jadi {formatInt(merge.combinedTrees.length)}{" "}
                        (hemat {formatInt(merge.treesSaved)})
                      </button>

                      {isExpanded && (
                        <div className="mt-3 rounded-lg border border-border bg-background/40 p-3">
                          <p className="mb-3 text-xs text-muted">
                            Saran ini hanya memadatkan sisa pcs dari batang
                            terakhir tiap produk (yang belum penuh) — batang
                            yang sudah penuh tidak diubah. Setelah cor, pcs
                            tiap produk perlu dipilah kembali sesuai warna.
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {merge.combinedTrees.map((suggestion, i) => (
                              <div key={i}>
                                <div className="mb-1 text-center text-xs font-medium text-ink">
                                  Batang gabungan #{i + 1}
                                </div>
                                <CombinedTreeVisual
                                  suggestion={suggestion}
                                  colorMap={colorMap}
                                  availableCapacity={availableCapacity}
                                />
                                <button
                                  type="button"
                                  onClick={() => createCombinedMo(g, suggestion)}
                                  className="mt-2 block w-full rounded-lg bg-ink px-3 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-ink/90"
                                >
                                  Buat MO Gabungan →
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
                );
              })}
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
