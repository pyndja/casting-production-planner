# Planning — Jewelry Manufacturing Casting Mockup

> Status: **v3 — semua fase (0–5) selesai.** Mockup siap demo/deploy.
> Terakhir diperbarui: 2026-06-29

---

## 1. Konteks & Tujuan

Aplikasi ini adalah **mockup untuk keperluan pitching/demo** alur produksi casting perhiasan, bukan sistem produksi final. Prioritas: alur terlihat meyakinkan saat dipresentasikan, cepat dibangun, dan mudah di-deploy.

Inti nilai yang dipamerkan: dari sebuah **order (SOM)**, sistem bisa menurunkan kebutuhan produksi sampai ke **kalkulasi casting** (jumlah pohon lilin, pcs per pohon, kebutuhan logam) di **tiga level**: SOM, BOM/produk, dan Manufacturing Order.

### Asumsi karena ini mockup
- **Tanpa autentikasi/login** (akan ditambahkan jika lanjut ke produksi).
- **Tanpa database sungguhan.** Pakai *seed data* realistis (TS/JSON) + `localStorage` untuk data yang dibuat saat demo (mis. SOM baru). Demo tetap terlihat "hidup" tanpa infra.
- **Standalone** — semua data master (produk, BOM, routing) dikelola di dalam aplikasi ini, tidak menarik dari ERP lain.

### Di luar scope (untuk mockup)
- Login, role, multi-tenant.
- Integrasi ERP / sumber data eksternal.
- Persistensi server (DB), audit trail, laporan kompleks.
- Manajemen inventori/stok aktual.

---

## 2. Keputusan Tech Stack

| Aspek | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Deployable ke Vercel, satu codebase FE+BE-ringan, ekosistem matang. |
| Styling | **Tailwind CSS** | Cepat, konsisten, tampilan profesional untuk demo. |
| Data | **Seed data (TS/JSON) + `localStorage`** | Tanpa infra DB; cukup untuk demo. Mudah di-swap ke DB nyata nanti. |
| Hosting | **Vercel** | Sesuai permintaan, nol konfigurasi untuk Next.js. |
| Backend terpisah | **Tidak** (untuk sekarang) | Skala mockup tidak memerlukan service backend tersendiri. |

> Catatan migrasi masa depan: ganti layer seed/`localStorage` dengan API routes + Postgres (Supabase/Neon/Vercel Postgres) tanpa mengubah komponen UI maupun fungsi kalkulasi.

---

## 3. Model Data (Entitas)

```
SOM (1) ──< SOMLine (n) >── (1) Product (1) ──── (1) BOM
                                  │
                                  └──< MO (n)  [diturunkan dari SOMLine]
Product (1) ──── (1) Routing >── (n) ProcessStep
```

### Product (Produk) — master
- `id`, `name`, `sku`, `category` (cincin/kalung/gelang/liontin)
- `defaultMetalType` (ref jenis logam)
- `imageUrl` (opsional, untuk tampilan demo)
- relasi ke 1 `BOM` dan 1 `Routing`

### BOM (Bill of Materials) — per produk, basis **1 pcs**
- `waxWeight` (gram lilin per pcs) — input utama kalkulasi casting
- `metalType` (jenis logam emas → SG)
- `flaskSize` (**opsional** — ukuran flask default). Jika kosong, user **wajib** memilih flask saat kalkulasi. Jika terisi, jadi default yang **bisa di-override**.
- Daftar material (level wajar untuk perhiasan emas, tidak terlalu dalam):
  - logam utama (emas) + karat
  - batu: `{ jenis (mis. Brilliant/berlian), jumlah, ukuran/pcs (mis. 1.2mm), berat ct }`
  - opsional: finding sederhana (kait/per) bila relevan

### Routing & ProcessStep — **berbeda per kategori produk**
- Setiap kategori punya template routing sendiri agar terlihat kompleksitas nyata pabrik.
- Contoh perbedaan:
  - **Cincin**: Cetak Lilin → Casting → Kikir → Pasang Batu → Poles → QC
  - **Kalung/Gelang** (berantai): Cetak Lilin → Casting → Rangkai/Solder → Kikir → Poles → QC
  - **Liontin polos**: Cetak Lilin → Casting → Kikir → Poles → QC
- Tahap **Casting** adalah tempat kalkulator pohon lilin berjalan (ada di semua routing).

### SOM (Surat Order Marketing)
- `id`, `orderNo`, `customer`, `date`
- `lines: [{ productId, quantity }]`
- Contoh: `SOM-001` → 50 pcs Cincin X, 10 pcs Kalung K.

### Manufacturing Order (MO / Voucher)
- Diturunkan dari satu `SOMLine` (1 produk + qty).
- `id`, `voucherNo`, `productId`, `quantity`, `routingRef`, status per tahap.
- Menjalankan kalkulasi casting pada tahap Casting-nya.

---

## 4. Logika Kalkulasi Casting (single source of truth)

Konstanta (carry-over dari `index.html`):
- `WAX_SG = 0.95`
- `SPRUE_WEIGHT = 60 g`
- `SAFETY_MARGIN = 80%`
- Kapasitas flask: `3"x3" → 300g`, `3.5"x4" → 500g`, `4"x6" → 800g`
- SG logam (**fokus emas**, sesuai client UBS Gold):
  `24K → 19.3`, `22K → 17.8`, `18K → 15.5`, `14K → 13.5`, `9K → 11.2`

Rumus inti (diangkat jadi 1 fungsi TS murni, dipakai ulang di semua level):
1. `metalPerPiece = waxWeight × (metalSG / WAX_SG)`
2. `availableCapacity = (machineCapacity × 0.8) − SPRUE_WEIGHT`
3. `piecesPerTree = floor(availableCapacity / metalPerPiece)`
4. `treesNeeded = ceil(orderQty / piecesPerTree)`
5. `totalMetal = metalPerPiece × orderQty`

### Penerapan per level
- **BOM / Produk**: hitung untuk 1 produk + qty. Output = kalkulator yang sudah ada + ringkasan material BOM.
- **MO**: kalkulasi casting untuk 1 work order produk, dalam konteks routing (tahap casting). Sama dengan level BOM, dibungkus konteks proses.
- **SOM (agregat)** — **insight kunci**:
  - Hasil **dikelompokkan per kombinasi (jenis logam × ukuran flask)** karena satu run casting tidak boleh mencampur karat berbeda, dan tiap ukuran flask = batch terpisah (mis. "18K — 3.5"x4"" beda run dari "18K — 4"x6"").
  - Output per grup: total tree, total logam, total lilin, jumlah run/flask.
  - Plus rollup global: total batu/material, total semua tree, total emas per karat.

---

## 5. Halaman / Layar (untuk demo)

1. **Dashboard** — ringkasan + pintu masuk (jumlah SOM aktif, produk, dll).
2. **Master Produk + BOM** — daftar produk, lihat/edit BOM (seeded dgn contoh nyata + foto).
3. **Master Routing/Proses** — tahap produksi standar (seeded, sederhana).
4. **SOM — list & detail** — buat/lihat order dgn banyak baris produk.
5. **SOM detail → Kalkulasi** — agregat casting per jenis logam, bisa drill-down ke tiap produk (BOM) & MO.
6. **Manufacturing Order** — per produk: tampilkan routing + tahap casting dgn kalkulator + visualisasi pohon lilin & bar kapasitas (komponen reuse).

---

## 6. Breakdown Task

### Fase 0 — Setup ✅
- [x] Arsipkan `index.html` lama → `archive/index.html` (referensi, tidak dipakai lagi).
- [x] Inisialisasi proyek Next.js 16 (App Router) + TypeScript + Tailwind v4.
- [x] Struktur folder (`app/`, `components/`, `lib/`, `data/`).
- [x] Setup palet & token brand UBS Gold di `globals.css` + font Playfair/Inter (lihat §8).
- [x] Verifikasi build (`npm run build` lolos, root turbopack di-pin).

### Fase 1 — Core domain & kalkulasi ✅
- [x] Tipe TS semua entitas → `lib/types.ts` + konstanta `lib/constants.ts` (logam emas, flask).
- [x] Fungsi kalkulasi casting → `lib/casting.ts` (core + level produk + agregat SOM per logam×flask). Tervalidasi via tsx.
- [x] Seed data → `data/` (5 produk emas termasuk cincin pita dari foto, routing per kategori, 2 SOM contoh) + helper `data/index.ts`.

### Fase 2 — Komponen UI reusable ✅
- [x] `<WaxTreeSVG>` (port ring-branch) → `components/WaxTreeSVG.tsx`.
- [x] `<CapacityBar>` → `components/CapacityBar.tsx`.
- [x] `<CastingResultCard>` (metrik + bar + pohon) → `components/CastingResultCard.tsx`.
- [x] Layout app + navigasi (`<AppShell>` header brand UBS Gold) + helper format. Verifikasi visual via screenshot.

### Fase 3 — Halaman master ✅
- [x] Halaman Produk (list `/produk` + detail `/produk/[id]` dgn BOM, batu, routing, pratinjau kalkulasi).
- [x] Halaman Routing `/routing` (per kategori, tahap Casting di-highlight).
- [x] UI primitives (`components/ui.tsx`: PageHeader, Badge, Card, Section). Verifikasi visual.

### Fase 4 — SOM & MO + kalkulasi multi-level ✅
- [x] Halaman SOM list `/som` + form buat SOM `/som/baru` (simpan ke `localStorage` via `lib/store.ts`).
- [x] Kalkulasi level BOM/produk (di halaman detail produk).
- [x] Kalkulasi level MO `/som/[id]/mo/[productId]` (routing + casting card).
- [x] Kalkulasi agregat level SOM `/som/[id]` (group per logam × flask, rollup emas per karat). Verifikasi visual.

### Fase 5 — Polish demo ✅
- [x] Dashboard `/` (hero brand + KPI + order terbaru + shortcut master data).
- [x] Penyesuaian visual/branding untuk pitching (palet emas/hitam, serif headline).
- [x] Data demo final + uji alur presentasi end-to-end (SOM → agregat → MO → kalkulasi).

---

## 8. Branding — UBS Gold (calon client)

- **Perusahaan**: PT Untung Bersama Sejahtera (UBS Gold), manufaktur emas & perhiasan, Surabaya, 40+ tahun.
- **Tagline**: "Trust in Gold" / "Be YOU Be GOLDEN — #Iam24K".
- **Tone**: minimalis, modern, aspirational, premium namun accessible.
- **Palet usulan** (gaya brand emas klasik):
  - Emas/gold: `#C8A64B` – `#D4AF37` (aksen utama)
  - Hitam pekat: `#111111` (teks/header)
  - Putih/abu netral: `#FFFFFF`, `#F5F4F1` (background)
- **Tipografi**: serif elegan untuk judul + sans-serif bersih untuk body (mis. Playfair/Cormorant + Inter) — final menyusul.
- **Penggunaan di mockup**: header dengan nama/logo placeholder "UBS Gold", aksen emas pada tombol & angka hasil, layout lapang/clean untuk kesan premium saat pitching.
- Catatan: pakai placeholder logo bila aset resmi tidak tersedia; jangan klaim afiliasi resmi pada mockup.

---

## 9. Keputusan (resolved — dari open questions)

1. **Routing**: apakah semua produk pakai routing standar yang sama, atau berbeda per kategori? (untuk mockup bisa 1 template dulu)
**Jawab**: Coba dibedakan per kategori karena client ini agak rumit, supaya terlihat ada yang beda.

2. **Flask per produk**: ukuran flask ditentukan per produk (di BOM) atau dipilih saat kalkulasi? (saat ini diasumsikan default di BOM, bisa override)
**Jawab**: Ikut seperti yang sekarang, ada yang diasumsikan default di BOM namun memang bisa di override dan ukuran flask ini tidak wajib ada di BOM. Jadi ketika tidak ada ukuran flask pada BOM nantinya user wajib pilih sendiri ukuran flask nya

3. **SOM agregat**: selain group per jenis logam, perlukah juga group per ukuran flask?
**Jawab**: Perlu, aku ingin meskipun untuk demo ini cukup detail agar bisa mengambil hati dan perhatian dari calon client

4. **Material/batu**: seberapa detail BOM perlu ditampilkan untuk demo? (cukup jumlah batu + logam, atau daftar material penuh?)
**Jawab**: Cukup detail tapi jangan terlalu dalam, sesuai yang kamu ketahui untuk manufacturing perhiasan emas saja.

5. **Branding**: ada logo/nama perusahaan/warna brand yang perlu dipakai di mockup?
**Jawab**: Jika kamu bisa mengambil dari https://ubsgold.com/ boleh, ini calon client nya

6. **Nasib `index.html`**: dijadikan referensi lalu diarsipkan, atau tetap dipertahankan terpisah?
**Jawab**: Dijadikan referensi lalu diarsipkan saja, karena ini tidak akan terpakai juga.