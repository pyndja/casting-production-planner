import type { CombinedTreeSuggestion } from "@/lib/casting";
import { formatGram, formatInt } from "@/lib/format";
import { WaxTreeSVG } from "./WaxTreeSVG";

// Palet kontras tinggi bertema batu permata — supaya perbedaan antar
// produk tetap jelas untuk mata yang kurang sensitif ke warna pastel/mirip
// (mis. pengguna usia lanjut). Tiap warna cukup gelap & jenuh, saling
// berjauhan secara hue maupun kecerahan, bukan cuma variasi gold pucat.
const PALETTE = [
  "#B8860B", // topaz / gold tua
  "#C0392B", // ruby merah
  "#1F618D", // sapphire biru
  "#1E8449", // emerald hijau
  "#6C3483", // amethyst ungu
];

/** Peta productId → warna, konsisten dipakai lintas kartu batang gabungan. */
export function buildProductColorMap(productIds: string[]): Map<string, string> {
  const map = new Map<string, string>();
  let i = 0;
  for (const id of productIds) {
    if (!map.has(id)) {
      map.set(id, PALETTE[i % PALETTE.length]);
      i++;
    }
  }
  return map;
}

interface CombinedTreeVisualProps {
  suggestion: CombinedTreeSuggestion;
  colorMap: Map<string, string>;
  availableCapacity: number;
}

/** Visualisasi 1 batang gabungan: pcs tiap produk diwarnai beda + legend. */
export function CombinedTreeVisual({
  suggestion,
  colorMap,
  availableCapacity,
}: CombinedTreeVisualProps) {
  const pieceColors = suggestion.batches.flatMap((b) =>
    Array(b.pieces).fill(colorMap.get(b.productId) ?? "#c8a64b"),
  );

  return (
    <div className="flex flex-col items-center rounded-lg border border-border bg-background/60 p-3">
      <WaxTreeSVG
        piecesPerTree={suggestion.totalPieces}
        pieceColors={pieceColors}
        width={140}
        height={188}
      />

      <div className="mt-2 space-y-1 text-xs">
        {suggestion.batches.map((b) => (
          <div key={b.productId} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: colorMap.get(b.productId) }}
              aria-hidden="true"
            />
            <span className="text-ink">{b.productName}</span>
            <span className="text-muted">({formatInt(b.pieces)} pcs)</span>
          </div>
        ))}
      </div>

      <div className="mt-2 text-center text-[11px] text-muted">
        {formatGram(suggestion.totalWeight, 0)} dari {formatGram(availableCapacity, 0)} kapasitas
      </div>
    </div>
  );
}
