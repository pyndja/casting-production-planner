# UBS Gold — Casting Production Planner (Mockup)

Mockup untuk perencanaan produksi casting perhiasan emas. Dari **SOM (Surat Order Marketing)** sistem menurunkan kebutuhan casting (jumlah pohon lilin, pcs per pohon, kebutuhan logam) di tiga level: **SOM (agregat) → BOM/produk → Manufacturing Order**.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Data: seed data (`data/`) + `localStorage` (tanpa database)
- Deploy: Vercel

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). (Gunakan `localhost`, bukan `127.0.0.1`.)

```bash
npm run build   # build produksi
```

## Struktur

- `lib/` — konstanta, tipe entitas, fungsi kalkulasi casting (`casting.ts`), store.
- `data/` — seed produk, BOM, routing, SOM.
- `components/` — komponen UI (kartu hasil, bar kapasitas, pohon lilin SVG, shell).
- `app/` — halaman: dashboard, `/som`, `/som/[id]`, `/som/[id]/mo/[productId]`, `/produk`, `/routing`.

## Dokumentasi

Lihat [.claude/PLANNING.md](.claude/PLANNING.md) untuk model data, logika kalkulasi, dan keputusan desain. Mockup awal single-file diarsipkan di `archive/index.html`.
