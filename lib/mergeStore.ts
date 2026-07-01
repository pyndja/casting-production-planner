// Penyimpanan MO Gabungan (batang lintas produk hasil "saran penggabungan").
// Sekali dibuat, dianggap "terpakai" — leftover produk terkait tidak
// disarankan lagi & ikut mengurangi total pohon yang ditampilkan.
import type { LeftoverBatch } from "./casting";

const KEY = "ubs_combined_mos";

export interface CreatedCombinedMo {
  id: string;
  somId: string;
  groupKey: string; // `${metalId}__${flaskId}`, samakan dengan SomCastingGroup.key
  voucherNo: string;
  metalLabel: string;
  flaskLabel: string;
  machineCapacity: number;
  availableCapacity: number;
  batches: LeftoverBatch[];
  totalPieces: number;
  totalWeight: number;
  createdAt: string;
}

function getAll(): CreatedCombinedMo[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as CreatedCombinedMo[];
  } catch {
    return [];
  }
}

function saveAll(list: CreatedCombinedMo[]): void {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getCombinedMosForSom(somId: string): CreatedCombinedMo[] {
  return getAll().filter((m) => m.somId === somId);
}

export function getAllCombinedMos(): CreatedCombinedMo[] {
  return getAll();
}

/** Reset semua MO Gabungan yang pernah dibuat (termasuk di SOM contoh/seed). */
export function clearAllCombinedMos(): void {
  localStorage.removeItem(KEY);
}

export function getCombinedMoById(id: string): CreatedCombinedMo | undefined {
  return getAll().find((m) => m.id === id);
}

export function addCombinedMo(mo: CreatedCombinedMo): void {
  const list = getAll();
  list.push(mo);
  saveAll(list);
}

export function deleteCombinedMo(id: string): void {
  saveAll(getAll().filter((m) => m.id !== id));
}

/** productId yang sisanya sudah "terpakai" di MO Gabungan grup ini. */
export function getMergedProductIds(somId: string, groupKey: string): Set<string> {
  const ids = new Set<string>();
  for (const mo of getCombinedMosForSom(somId)) {
    if (mo.groupKey !== groupKey) continue;
    for (const b of mo.batches) ids.add(b.productId);
  }
  return ids;
}

/** Total batang yang berhasil dihemat lewat semua MO Gabungan SOM ini. */
export function getTreeSavingsForSom(somId: string): number {
  return getCombinedMosForSom(somId).reduce(
    (sum, mo) => sum + (mo.batches.length - 1),
    0,
  );
}

export function generateMoId(): string {
  return `mo-gab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
