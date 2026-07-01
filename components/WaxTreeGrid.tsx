"use client";

import { useEffect, useRef, useState } from "react";
import { distributeTreePieces } from "@/lib/casting";
import { formatInt } from "@/lib/format";
import { Badge } from "./ui";
import { WaxTreeSVG } from "./WaxTreeSVG";

interface WaxTreeGridProps {
  quantity: number;
  piecesPerTree: number;
  treesNeeded: number;
}

const MINI_WIDTH = 92;
const MINI_HEIGHT = 124;
const GAP = 16; // px, harus sama dengan class gap-4 di container
const FALLBACK_PER_ROW = 6; // dipakai sebelum lebar kontainer terukur

/**
 * Menghitung berapa kartu (lebar MINI_WIDTH + GAP) yang pas muat dalam satu
 * baris kontainer, mengikuti lebar render sebenarnya (bereaksi ke resize).
 * Ini yang menentukan batas tampil default, supaya baris pertama selalu
 * penuh — tidak overflow di kontainer sempit, tidak nanggung di kontainer
 * lebar.
 */
function useTreesPerRow(ref: React.RefObject<HTMLDivElement | null>) {
  const [perRow, setPerRow] = useState(FALLBACK_PER_ROW);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const compute = () => {
      const width = el.clientWidth;
      const count = Math.max(1, Math.floor((width + GAP) / (MINI_WIDTH + GAP)));
      setPerRow(count);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return perRow;
}

/**
 * Menampilkan batang pohon lilin sesuai hasil kalkulasi riil: N batang,
 * masing-masing dengan jumlah pcs aktualnya. Tampilan default dibatasi tepat
 * satu baris penuh (dihitung dari lebar kontainer) supaya tidak ada baris
 * kedua yang nanggung — sisanya diringkas jadi "+N batang lain" yang bisa
 * diklik untuk membuka semuanya. Jika batang terakhir tidak penuh (ada sisa
 * pcs), batang itu selalu ditampilkan di baris pertama — tidak pernah
 * tersembunyi di balik ringkasan. Jika semua batang pas penuh (tidak ada
 * sisa), tidak ada perlakuan khusus.
 */
export function WaxTreeGrid({
  quantity,
  piecesPerTree,
  treesNeeded,
}: WaxTreeGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const perRow = useTreesPerRow(containerRef);
  const [expanded, setExpanded] = useState(false);

  const perTree = distributeTreePieces(quantity, piecesPerTree, treesNeeded);
  const lastIndex = perTree.length - 1;
  const lastIsPartial = lastIndex >= 0 && perTree[lastIndex] < piecesPerTree;
  const needsCutoff = perTree.length > perRow;

  // Jika batang terakhir tidak penuh, sisakan 1 slot di baris pertama supaya
  // batang itu selalu tampil, tidak ikut "ditelan" oleh ringkasan tersembunyi.
  // Kartu ringkasan "+N" juga butuh 1 slot bila memang ada yang disembunyikan.
  let head: number[];
  let middleHidden: number[];
  if (!needsCutoff) {
    head = perTree;
    middleHidden = [];
  } else if (lastIsPartial) {
    const headCount = Math.max(0, perRow - 2);
    head = perTree.slice(0, headCount);
    middleHidden = perTree.slice(headCount, lastIndex);
  } else {
    const headCount = Math.max(0, perRow - 1);
    head = perTree.slice(0, headCount);
    middleHidden = perTree.slice(headCount, perTree.length);
  }
  const hiddenPcs = middleHidden.reduce((a, b) => a + b, 0);

  function renderTree(pcs: number, index: number) {
    const isPartial = index === lastIndex && lastIsPartial;
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
    <div ref={containerRef} className="flex flex-wrap gap-4">
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

      {lastIsPartial && lastIndex >= head.length && renderTree(perTree[lastIndex], lastIndex)}
    </div>
  );
}
