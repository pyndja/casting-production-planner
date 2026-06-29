import type { Product } from "@/lib/types";

// Produk emas contoh (termasuk yang menyerupai foto referensi: cincin pita berlian).
export const PRODUCTS: Product[] = [
  {
    id: "prd-cincin-solitaire",
    name: "Cincin Solitaire Berlian",
    sku: "RG-SOL-18K",
    category: "cincin",
    routingId: "rt-cincin",
    bom: {
      waxWeight: 3.2,
      metalTypeId: "18k",
      flaskSizeId: "3.5x4",
      stones: [{ type: "Berlian Brilliant", count: 1, sizeMm: 4.0, totalCarat: 0.25 }],
      notes: "Mata utama 1 berlian solitaire.",
    },
  },
  {
    id: "prd-cincin-pita",
    name: "Cincin Pita Berlian (Bow)",
    sku: "RG-BOW-18K",
    category: "cincin",
    routingId: "rt-cincin",
    bom: {
      waxWeight: 3.8,
      metalTypeId: "18k",
      flaskSizeId: "3.5x4",
      stones: [{ type: "Berlian Brilliant", count: 72, sizeMm: 1.2, totalCarat: 0.36 }],
      notes: "Motif pita penuh batu kecil (pavé).",
    },
  },
  {
    id: "prd-liontin-hati",
    name: "Liontin Hati Berlian",
    sku: "PD-HRT-18K",
    category: "liontin",
    routingId: "rt-liontin",
    bom: {
      waxWeight: 2.4,
      metalTypeId: "18k",
      flaskSizeId: "3x3",
      stones: [{ type: "Berlian Brilliant", count: 18, sizeMm: 1.0, totalCarat: 0.12 }],
    },
  },
  {
    id: "prd-kalung-figaro",
    name: "Kalung Rantai Figaro",
    sku: "NK-FIG-22K",
    category: "kalung",
    routingId: "rt-kalung",
    bom: {
      waxWeight: 8.5,
      metalTypeId: "22k",
      flaskSizeId: "4x6",
      stones: [],
      notes: "Rantai polos, dirangkai setelah casting.",
    },
  },
  {
    id: "prd-gelang-bangle",
    name: "Gelang Bangle Polos",
    sku: "BR-BNG-22K",
    category: "gelang",
    routingId: "rt-gelang",
    bom: {
      // Sengaja tanpa flaskSizeId → user wajib memilih flask saat kalkulasi.
      waxWeight: 11.0,
      metalTypeId: "22k",
      stones: [],
      notes: "BOM tanpa flask default; pilih flask saat order.",
    },
  },
];
