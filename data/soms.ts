import type { Som } from "@/lib/types";

export const SOMS: Som[] = [
  {
    id: "som-2026-001",
    orderNo: "SOM-2026-001",
    customer: "Toko Mas Semar — Jakarta",
    date: "2026-06-20",
    lines: [
      { productId: "prd-cincin-solitaire", quantity: 50 },
      { productId: "prd-cincin-pita", quantity: 30 },
      { productId: "prd-liontin-hati", quantity: 20 },
    ],
  },
  {
    id: "som-2026-002",
    orderNo: "SOM-2026-002",
    customer: "UBS Gold — Surabaya Pusat",
    date: "2026-06-25",
    lines: [
      { productId: "prd-kalung-figaro", quantity: 25 },
      // Gelang BOM tak punya flask default → pilih flask di level order.
      { productId: "prd-gelang-bangle", quantity: 40, flaskSizeId: "4x6" },
    ],
  },
  {
    id: "som-2026-003",
    orderNo: "SOM-2026-003",
    customer: "Toko Berkat Mulia — Bandung",
    date: "2026-06-28",
    // Sengaja disusun agar Cincin Solitaire (sisa 1 pcs) & Cincin Pita
    // (sisa 2 pcs) sama-sama tidak penuh di batang terakhirnya — demo tetap
    // untuk fitur "insight efisiensi" (Level 1 & 2) tanpa perlu buat SOM baru.
    lines: [
      { productId: "prd-cincin-solitaire", quantity: 49 },
      { productId: "prd-cincin-pita", quantity: 32 },
    ],
  },
];
