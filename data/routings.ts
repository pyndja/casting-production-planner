import type { Routing } from "@/lib/types";

// Routing berbeda per kategori — menunjukkan kompleksitas alur pabrik.
export const ROUTINGS: Routing[] = [
  {
    id: "rt-cincin",
    name: "Routing Cincin (bermata)",
    category: "cincin",
    steps: [
      { id: "s1", name: "Cetak Lilin" },
      { id: "s2", name: "Casting", isCasting: true },
      { id: "s3", name: "Kikir / Grinding" },
      { id: "s4", name: "Pasang Batu" },
      { id: "s5", name: "Poles" },
      { id: "s6", name: "QC" },
    ],
  },
  {
    id: "rt-kalung",
    name: "Routing Kalung (berantai)",
    category: "kalung",
    steps: [
      { id: "s1", name: "Cetak Lilin" },
      { id: "s2", name: "Casting", isCasting: true },
      { id: "s3", name: "Rangkai / Solder" },
      { id: "s4", name: "Kikir / Grinding" },
      { id: "s5", name: "Poles" },
      { id: "s6", name: "QC" },
    ],
  },
  {
    id: "rt-gelang",
    name: "Routing Gelang (polos)",
    category: "gelang",
    steps: [
      { id: "s1", name: "Cetak Lilin" },
      { id: "s2", name: "Casting", isCasting: true },
      { id: "s3", name: "Kikir / Grinding" },
      { id: "s4", name: "Poles" },
      { id: "s5", name: "QC" },
    ],
  },
  {
    id: "rt-liontin",
    name: "Routing Liontin (bermata)",
    category: "liontin",
    steps: [
      { id: "s1", name: "Cetak Lilin" },
      { id: "s2", name: "Casting", isCasting: true },
      { id: "s3", name: "Kikir / Grinding" },
      { id: "s4", name: "Pasang Batu" },
      { id: "s5", name: "Poles" },
      { id: "s6", name: "QC" },
    ],
  },
];
