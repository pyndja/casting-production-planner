// ===== Logika kalkulasi casting (single source of truth) =====

import {
  WAX_SG,
  SPRUE_WEIGHT,
  SAFETY_MARGIN,
  getMetal,
  getFlask,
  type MetalType,
  type FlaskSize,
} from "./constants";
import type { Product, Som, SomLine } from "./types";

export interface CastingInput {
  waxWeight: number; // gram per pcs
  metalSg: number;
  machineCapacity: number; // gram
  orderQty: number;
}

export interface CastingResult {
  metalPerPiece: number;
  machineCapacity: number;
  availableCapacity: number;
  piecesPerTree: number;
  treesNeeded: number;
  totalMetal: number;
  totalWax: number;
  totalPiecesCapacity: number; // treesNeeded * piecesPerTree
  feasible: boolean;
  warning?: string;
}

/** Kalkulasi casting inti — dipakai ulang di semua level. */
export function calculateCasting(input: CastingInput): CastingResult {
  const { waxWeight, metalSg, machineCapacity, orderQty } = input;

  const metalPerPiece = waxWeight * (metalSg / WAX_SG);
  const availableCapacity = machineCapacity * SAFETY_MARGIN - SPRUE_WEIGHT;
  const totalWax = waxWeight * orderQty;
  const totalMetal = metalPerPiece * orderQty;

  if (availableCapacity <= 0) {
    return {
      metalPerPiece,
      machineCapacity,
      availableCapacity,
      piecesPerTree: 0,
      treesNeeded: 0,
      totalMetal,
      totalWax,
      totalPiecesCapacity: 0,
      feasible: false,
      warning:
        "Kapasitas mesin terlalu kecil untuk berat batang sprue. Pilih ukuran flask lebih besar.",
    };
  }

  const piecesPerTree = Math.floor(availableCapacity / metalPerPiece);

  if (piecesPerTree <= 0) {
    return {
      metalPerPiece,
      machineCapacity,
      availableCapacity,
      piecesPerTree: 0,
      treesNeeded: 0,
      totalMetal,
      totalWax,
      totalPiecesCapacity: 0,
      feasible: false,
      warning:
        "Berat logam per pcs terlalu besar untuk kapasitas flask yang dipilih.",
    };
  }

  const treesNeeded = Math.ceil(orderQty / piecesPerTree);

  return {
    metalPerPiece,
    machineCapacity,
    availableCapacity,
    piecesPerTree,
    treesNeeded,
    totalMetal,
    totalWax,
    totalPiecesCapacity: treesNeeded * piecesPerTree,
    feasible: true,
  };
}

/**
 * Resolusi flask: override (line/MO) > default BOM > undefined (user wajib pilih).
 */
export function resolveFlaskId(
  overrideId: string | undefined,
  bomFlaskId: string | undefined,
): string | undefined {
  return overrideId ?? bomFlaskId;
}

export interface ProductCastingResult {
  product: Product;
  quantity: number;
  metal?: MetalType;
  flask?: FlaskSize;
  needsFlask: boolean; // true jika flask belum terresolusi
  result?: CastingResult;
}

/** Kalkulasi casting untuk satu produk + qty (level BOM / MO). */
export function calculateProductCasting(
  product: Product,
  quantity: number,
  flaskOverrideId?: string,
): ProductCastingResult {
  const metal = getMetal(product.bom.metalTypeId);
  const flaskId = resolveFlaskId(flaskOverrideId, product.bom.flaskSizeId);
  const flask = getFlask(flaskId);

  if (!flask || !metal) {
    return {
      product,
      quantity,
      metal,
      flask,
      needsFlask: !flask,
    };
  }

  const result = calculateCasting({
    waxWeight: product.bom.waxWeight,
    metalSg: metal.sg,
    machineCapacity: flask.capacity,
    orderQty: quantity,
  });

  return { product, quantity, metal, flask, needsFlask: false, result };
}

// ===== Agregat level SOM =====

export interface SomCastingGroup {
  key: string; // `${metalId}__${flaskId}`
  metal: MetalType;
  flask: FlaskSize;
  lines: ProductCastingResult[];
  totalTrees: number; // = jumlah run/flask untuk grup ini
  totalMetal: number;
  totalWax: number;
  totalPieces: number;
}

export interface SomCastingSummary {
  groups: SomCastingGroup[];
  unresolved: ProductCastingResult[]; // produk yang flask-nya belum dipilih
  grandTotalTrees: number;
  grandTotalPieces: number;
  metalByKarat: { metal: MetalType; totalMetal: number }[];
  totalStones: number;
}

/**
 * Agregat casting untuk seluruh SOM, dikelompokkan per (jenis logam × flask)
 * karena tiap kombinasi = run casting terpisah.
 */
export function aggregateSom(
  som: Som,
  productMap: Map<string, Product>,
): SomCastingSummary {
  const groupMap = new Map<string, SomCastingGroup>();
  const unresolved: ProductCastingResult[] = [];
  const metalTotals = new Map<string, { metal: MetalType; totalMetal: number }>();
  let totalStones = 0;

  for (const line of som.lines) {
    const product = productMap.get(line.productId);
    if (!product) continue;

    const pc = calculateProductCasting(product, line.quantity, line.flaskSizeId);

    // hitung total batu dari BOM
    const stonesPerPiece = product.bom.stones.reduce((s, st) => s + st.count, 0);
    totalStones += stonesPerPiece * line.quantity;

    if (pc.needsFlask || !pc.metal || !pc.flask || !pc.result) {
      unresolved.push(pc);
      continue;
    }

    // akumulasi emas per karat
    const mt = metalTotals.get(pc.metal.id) ?? {
      metal: pc.metal,
      totalMetal: 0,
    };
    mt.totalMetal += pc.result.totalMetal;
    metalTotals.set(pc.metal.id, mt);

    const key = `${pc.metal.id}__${pc.flask.id}`;
    const group =
      groupMap.get(key) ??
      ({
        key,
        metal: pc.metal,
        flask: pc.flask,
        lines: [],
        totalTrees: 0,
        totalMetal: 0,
        totalWax: 0,
        totalPieces: 0,
      } as SomCastingGroup);

    group.lines.push(pc);
    group.totalTrees += pc.result.treesNeeded;
    group.totalMetal += pc.result.totalMetal;
    group.totalWax += pc.result.totalWax;
    group.totalPieces += line.quantity;
    groupMap.set(key, group);
  }

  const groups = Array.from(groupMap.values());

  return {
    groups,
    unresolved,
    grandTotalTrees: groups.reduce((s, g) => s + g.totalTrees, 0),
    grandTotalPieces: groups.reduce((s, g) => s + g.totalPieces, 0),
    metalByKarat: Array.from(metalTotals.values()),
    totalStones,
  };
}

/**
 * Distribusi pcs riil ke tiap batang pohon: batang penuh sebesar
 * piecesPerTree, batang terakhir menampung sisanya (bisa kurang penuh).
 */
export function distributeTreePieces(
  orderQty: number,
  piecesPerTree: number,
  treesNeeded: number,
): number[] {
  const perTree: number[] = [];
  let remaining = orderQty;
  for (let i = 0; i < treesNeeded; i++) {
    const count = Math.min(piecesPerTree, remaining);
    perTree.push(count);
    remaining -= count;
  }
  return perTree;
}

// ===== Insight efisiensi (estimasi, bukan kalkulasi resmi MO) =====

export interface EfficiencyInsight {
  currentTrees: number;
  theoreticalMinTrees: number;
  potentialSavings: number; // currentTrees - theoreticalMinTrees, selalu >= 0
}

/**
 * Estimasi batas bawah teoretis jumlah batang untuk satu grup (metal×flask),
 * dihitung dari total berat logam dibagi kapasitas aman per batang — seolah
 * semua sisa kapasitas antar produk bisa dipadatkan sempurna. Ini cuma
 * insight/estimasi (bukan pengganti totalTrees per-produk yang dipakai untuk
 * MO), karena belum memperhitungkan tata letak fisik pcs di flask.
 */
export function calculateEfficiencyInsight(
  group: SomCastingGroup,
): EfficiencyInsight {
  const availableCapacity = group.flask.capacity * SAFETY_MARGIN - SPRUE_WEIGHT;
  const theoreticalMinTrees =
    availableCapacity > 0
      ? Math.ceil(group.totalMetal / availableCapacity)
      : group.totalTrees;

  return {
    currentTrees: group.totalTrees,
    theoreticalMinTrees,
    potentialSavings: Math.max(0, group.totalTrees - theoreticalMinTrees),
  };
}

export interface LeftoverBatch {
  productId: string;
  productName: string;
  pieces: number;
  metalPerPiece: number;
  weight: number;
}

export interface CombinedTreeSuggestion {
  batches: LeftoverBatch[];
  totalPieces: number;
  totalWeight: number;
}

export interface GroupMergeSuggestion {
  originalLeftoverTreeCount: number;
  combinedTrees: CombinedTreeSuggestion[];
  treesSaved: number;
}

/**
 * Saran konkret (bisa langsung diterapkan): kumpulkan sisa pcs dari batang
 * terakhir tiap produk (yang tidak penuh) dalam grup metal×flask yang sama,
 * lalu padatkan pakai bin-packing greedy (first-fit, terbesar dulu) ke
 * batang gabungan sesedikit mungkin. Batang yang sudah penuh tidak diutak-
 * atik — hanya sisa yang dipadatkan. Return null kalau tidak ada peluang
 * penggabungan (kurang dari 2 sisa, atau tidak ada penghematan nyata).
 *
 * `excludeProductIds` — produk yang sisanya sudah dipakai di MO Gabungan
 * yang sudah dibuat sebelumnya, supaya tidak disarankan ulang.
 */
export function suggestLeftoverMerge(
  group: SomCastingGroup,
  excludeProductIds?: Set<string>,
): GroupMergeSuggestion | null {
  const availableCapacity = group.flask.capacity * SAFETY_MARGIN - SPRUE_WEIGHT;
  if (availableCapacity <= 0) return null;

  const leftovers: LeftoverBatch[] = [];
  for (const line of group.lines) {
    if (!line.result) continue;
    if (excludeProductIds?.has(line.product.id)) continue;
    const { piecesPerTree, treesNeeded, metalPerPiece } = line.result;
    const perTree = distributeTreePieces(line.quantity, piecesPerTree, treesNeeded);
    const last = perTree[perTree.length - 1];
    if (last != null && last < piecesPerTree) {
      leftovers.push({
        productId: line.product.id,
        productName: line.product.name,
        pieces: last,
        metalPerPiece,
        weight: last * metalPerPiece,
      });
    }
  }

  if (leftovers.length < 2) return null;

  // First-fit, terbesar dulu — cukup untuk jumlah produk kecil khas SOM.
  const sorted = [...leftovers].sort((a, b) => b.weight - a.weight);
  const bins: CombinedTreeSuggestion[] = [];
  for (const batch of sorted) {
    const bin = bins.find((b) => b.totalWeight + batch.weight <= availableCapacity);
    if (bin) {
      bin.batches.push(batch);
      bin.totalWeight += batch.weight;
      bin.totalPieces += batch.pieces;
    } else {
      bins.push({ batches: [batch], totalWeight: batch.weight, totalPieces: batch.pieces });
    }
  }

  const treesSaved = leftovers.length - bins.length;
  if (treesSaved <= 0) return null;

  return { originalLeftoverTreeCount: leftovers.length, combinedTrees: bins, treesSaved };
}

/** Helper agregat langsung dari daftar produk (tanpa objek SOM). */
export function aggregateLines(
  lines: SomLine[],
  productMap: Map<string, Product>,
): SomCastingSummary {
  return aggregateSom(
    { id: "_", orderNo: "_", customer: "_", date: "", lines },
    productMap,
  );
}
