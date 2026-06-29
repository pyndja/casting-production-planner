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
];
