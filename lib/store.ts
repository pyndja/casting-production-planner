// Penyimpanan SOM: gabungan seed data + SOM buatan user (localStorage).
import { SOMS } from "@/data";
import type { Som } from "./types";

const KEY = "ubs_custom_soms";

export function getCustomSoms(): Som[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as Som[];
  } catch {
    return [];
  }
}

export function getAllSoms(): Som[] {
  return [...SOMS, ...getCustomSoms()];
}

export function getSomById(id: string): Som | undefined {
  return getAllSoms().find((s) => s.id === id);
}

export function addSom(som: Som): void {
  const list = getCustomSoms();
  list.push(som);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function deleteSom(id: string): void {
  const list = getCustomSoms().filter((s) => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function clearCustomSoms(): void {
  localStorage.removeItem(KEY);
}

export function isCustomSom(id: string): boolean {
  return getCustomSoms().some((s) => s.id === id);
}

export function generateSomId(): { id: string; orderNo: string } {
  const n = getCustomSoms().length + 1;
  const stamp = Date.now().toString().slice(-4);
  return {
    id: `som-custom-${stamp}`,
    orderNo: `SOM-DEMO-${String(n).padStart(3, "0")}`,
  };
}
