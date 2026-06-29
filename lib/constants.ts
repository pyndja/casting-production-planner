// ===== Konstanta kalkulasi casting (carry-over dari mockup awal) =====

export const WAX_SG = 0.95;
export const SPRUE_WEIGHT = 60; // gram per pohon
export const SAFETY_MARGIN = 0.8; // 80% kapasitas mesin yang dipakai

export interface MetalType {
  id: string;
  label: string;
  sg: number;
}

// Fokus emas, sesuai client UBS Gold.
export const METAL_TYPES: MetalType[] = [
  { id: "24k", label: "Emas 24K", sg: 19.3 },
  { id: "22k", label: "Emas 22K", sg: 17.8 },
  { id: "18k", label: "Emas 18K", sg: 15.5 },
  { id: "14k", label: "Emas 14K", sg: 13.5 },
  { id: "9k", label: "Emas 9K", sg: 11.2 },
];

export interface FlaskSize {
  id: string;
  label: string;
  capacity: number; // kapasitas mesin (gram)
}

export const FLASK_SIZES: FlaskSize[] = [
  { id: "3x3", label: '3" × 3"', capacity: 300 },
  { id: "3.5x4", label: '3.5" × 4"', capacity: 500 },
  { id: "4x6", label: '4" × 6"', capacity: 800 },
];

export function getMetal(id: string | undefined): MetalType | undefined {
  return METAL_TYPES.find((m) => m.id === id);
}

export function getFlask(id: string | undefined): FlaskSize | undefined {
  return FLASK_SIZES.find((f) => f.id === id);
}
