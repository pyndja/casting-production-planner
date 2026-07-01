import type { CastingResult } from "@/lib/casting";
import { formatGram, formatInt } from "@/lib/format";
import { CapacityBar } from "./CapacityBar";
import { WaxTreeGrid } from "./WaxTreeGrid";

interface CastingResultCardProps {
  result: CastingResult;
  metalLabel: string;
  flaskLabel: string;
  quantity: number;
  title?: string;
}

/** Kartu hasil kalkulasi casting lengkap: metrik + bar kapasitas + pohon lilin. */
export function CastingResultCard({
  result,
  metalLabel,
  flaskLabel,
  quantity,
  title,
}: CastingResultCardProps) {
  if (!result.feasible) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {result.warning ?? "Kalkulasi tidak dapat dilakukan."}
      </div>
    );
  }

  const metalPerTree = result.metalPerPiece * result.piecesPerTree;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      {title && (
        <h3 className="mb-1 text-lg font-semibold text-ink">{title}</h3>
      )}
      <p className="mb-4 text-xs text-muted">
        {metalLabel} · Flask {flaskLabel} · {formatInt(quantity)} pcs
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Logam / pcs" value={formatGram(result.metalPerPiece)} />
        <Stat label="Pcs / pohon" value={formatInt(result.piecesPerTree)} />
        <Stat label="Pohon dibutuhkan" value={`${formatInt(result.treesNeeded)}`} accent />
        <Stat label="Total logam" value={formatGram(result.totalMetal)} />
      </div>

      <div className="mt-4 rounded-lg bg-gold-soft px-4 py-3 text-center text-sm font-semibold text-gold-strong">
        {formatInt(result.treesNeeded)} pohon × {formatInt(result.piecesPerTree)}{" "}
        pcs = {formatInt(result.totalPiecesCapacity)} pcs (pesanan{" "}
        {formatInt(quantity)} pcs)
      </div>

      <div className="mt-5">
        <h4 className="mb-2 text-sm font-medium text-ink">
          Kapasitas Mesin per Batang
        </h4>
        <CapacityBar
          machineCapacity={result.machineCapacity}
          metalUsed={metalPerTree}
        />
      </div>

      <div className="mt-6">
        <h4 className="mb-3 text-sm font-medium text-ink">
          Pohon Lilin — {formatInt(result.treesNeeded)} batang aktual
        </h4>
        <WaxTreeGrid
          quantity={quantity}
          piecesPerTree={result.piecesPerTree}
          treesNeeded={result.treesNeeded}
        />
      </div>
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
        accent ? "border-gold/40 bg-gold-soft" : "border-border bg-background"
      }`}
    >
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold text-ink">{value}</div>
    </div>
  );
}
