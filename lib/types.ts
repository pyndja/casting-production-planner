// ===== Tipe entitas domain =====

export type ProductCategory = "cincin" | "kalung" | "gelang" | "liontin";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  cincin: "Cincin",
  kalung: "Kalung",
  gelang: "Gelang",
  liontin: "Liontin",
};

/** Satu baris material batu dalam BOM (basis per 1 pcs). */
export interface BomStone {
  type: string; // mis. "Berlian Brilliant"
  count: number; // jumlah batu per pcs
  sizeMm?: number; // mis. 1.2
  totalCarat?: number; // total karat per pcs
}

/** Bill of Materials untuk 1 pcs produk. */
export interface Bom {
  waxWeight: number; // gram lilin per pcs
  metalTypeId: string; // ref METAL_TYPES
  flaskSizeId?: string; // opsional; jika kosong user wajib pilih saat kalkulasi
  stones: BomStone[];
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  imageUrl?: string;
  routingId: string;
  bom: Bom;
}

export interface ProcessStep {
  id: string;
  name: string;
  isCasting?: boolean;
}

/** Urutan proses produksi; berbeda per kategori. */
export interface Routing {
  id: string;
  name: string;
  category: ProductCategory;
  steps: ProcessStep[];
}

export interface SomLine {
  productId: string;
  quantity: number;
  flaskSizeId?: string; // override flask di level order
}

/** Surat Order Marketing. */
export interface Som {
  id: string;
  orderNo: string;
  customer: string;
  date: string; // ISO date
  lines: SomLine[];
}

/** Manufacturing Order / Voucher, diturunkan dari satu baris SOM. */
export interface ManufacturingOrder {
  id: string;
  voucherNo: string;
  somId: string;
  productId: string;
  quantity: number;
  flaskSizeId?: string;
}
