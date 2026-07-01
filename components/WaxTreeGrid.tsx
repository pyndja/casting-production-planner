"use client";

import { useState } from "react";
import { distributeTreePieces } from "@/lib/casting";
import { formatInt } from "@/lib/format";
import { Badge } from "./ui";
import { WaxTreeSVG } from "./WaxTreeSVG";

interface WaxTreeGridProps {
  quantity: number;
  piecesPerTree: number;
  treesNeeded: number;
}

const MAX_SHOWN = 12;
const MINI_WIDTH = 92;
const MINI_HEIGHT = 124;

/**
 * Menampilkan batang pohon lilin sesuai hasil kalkulasi riil: N batang,
 * masing-masing dengan jumlah pcs aktualnya. Batang terakhir (yang sering
 * tidak penuh) selalu ditampilkan — tidak pernah tersembunyi di balik
 * ringkasan "+N batang lain" — supaya sisa produksi selalu terlihat tanpa
 * perlu klik apa pun. Batang tersembunyi lainnya bisa dibuka lewat klik.
 */
export function WaxTreeGrid({
  quantity,
  piecesPerTree,
  treesNeeded,
}: WaxTreeGridProps) {
  const [expanded, setExpanded] = useState(false);
  const perTree = distributeTreePieces(quantity, piecesPerTree, treesNeeded);
  const lastIndex = perTree.length - 1;

  // Sisakan 1 slot untuk batang terakhir supaya selalu tampil, tidak ikut
  // "ditelan" oleh ringkasan batang tersembunyi.
  const headCount = Math.max(0, MAX_SHOWN - 1);
  const head = perTree.slice(0, Math.min(headCount, lastIndex));
  const middleHidden = perTree.slice(head.length, lastIndex);
  const hiddenPcs = middleHidden.reduce((a, b) => a + b, 0);

  function renderTree(pcs: number, index: number) {
    const isLast = index === lastIndex;
    const isPartial = isLast && pcs < piecesPerTree && lastIndex > 0;
    return (
      <div key={index} className="flex flex-col items-center">
        <WaxTreeSVG piecesPerTree={pcs} width={MINI_WIDTH} height={MINI_HEIGHT} />
        <div className="mt-1 text-center text-xs leading-tight">
          <div className="font-medium text-ink">Batang {index + 1}</div>
          <div className="text-muted">{formatInt(pcs)} pcs</div>
          {isPartial && (
            <div className="mt-1">
              <Badge tone="gold">Sisa, belum penuh</Badge>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
      {head.map((pcs, i) => renderTree(pcs, i))}

      {middleHidden.length > 0 && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label={`Tampilkan ${middleHidden.length} batang lain (${hiddenPcs} pcs)`}
          className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border text-center text-xs text-muted transition-colors hover:border-gold/50 hover:bg-gold-soft/30 hover:text-gold-strong"
          style={{ width: MINI_WIDTH, height: MINI_HEIGHT }}
        >
          <div className="font-serif text-lg font-semibold text-ink">
            +{middleHidden.length}
          </div>
          <div>batang lain</div>
          <div>({formatInt(hiddenPcs)} pcs)</div>
          <div className="mt-1.5 underline">Lihat semua</div>
        </button>
      )}

      {expanded && middleHidden.map((pcs, i) => renderTree(pcs, head.length + i))}

      {middleHidden.length > 0 && expanded && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border text-center text-xs text-muted transition-colors hover:border-gold/50 hover:bg-gold-soft/30 hover:text-gold-strong"
          style={{ width: MINI_WIDTH, height: MINI_HEIGHT }}
        >
          <div>Sembunyikan</div>
          <div>{middleHidden.length} batang</div>
        </button>
      )}

      {lastIndex >= 0 && lastIndex >= head.length && renderTree(perTree[lastIndex], lastIndex)}
    </div>
  );
}
