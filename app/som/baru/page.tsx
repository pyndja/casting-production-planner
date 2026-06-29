"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRODUCTS, getProduct } from "@/data";
import { FLASK_SIZES, getMetal } from "@/lib/constants";
import { addSom, generateSomId } from "@/lib/store";
import type { SomLine } from "@/lib/types";
import { formatGram } from "@/lib/format";
import { PageHeader, Card } from "@/components/ui";

interface LineState {
  productId: string;
  quantity: string;
  flaskSizeId: string;
}

const emptyLine = (): LineState => ({
  productId: "",
  quantity: "",
  flaskSizeId: "",
});

export default function BuatSomPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState("");
  const [lines, setLines] = useState<LineState[]>([emptyLine()]);
  const [error, setError] = useState("");

  function update(idx: number, patch: Partial<LineState>) {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    );
  }

  function onPickProduct(idx: number, productId: string) {
    const product = getProduct(productId);
    // Auto-isi flask default dari BOM bila ada.
    update(idx, {
      productId,
      flaskSizeId: product?.bom.flaskSizeId ?? "",
    });
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(idx: number) {
    setLines((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== idx),
    );
  }

  function submit() {
    setError("");
    if (!customer.trim()) {
      setError("Nama customer wajib diisi.");
      return;
    }

    const somLines: SomLine[] = [];
    const seen = new Set<string>();
    for (const ls of lines) {
      if (!ls.productId) continue;
      const product = getProduct(ls.productId);
      if (!product) continue;
      if (seen.has(ls.productId)) {
        setError(`Produk "${product.name}" terpilih lebih dari sekali.`);
        return;
      }
      const qty = parseInt(ls.quantity, 10);
      if (!ls.quantity || isNaN(qty) || qty <= 0) {
        setError(`Isi jumlah yang valid untuk "${product.name}".`);
        return;
      }
      if (!ls.flaskSizeId) {
        setError(`Pilih ukuran flask untuk "${product.name}".`);
        return;
      }
      seen.add(ls.productId);
      somLines.push({
        productId: ls.productId,
        quantity: qty,
        flaskSizeId: ls.flaskSizeId,
      });
    }

    if (somLines.length === 0) {
      setError("Tambahkan minimal satu produk dengan jumlah pesanan.");
      return;
    }

    const { id, orderNo } = generateSomId();
    addSom({
      id,
      orderNo,
      customer: customer.trim(),
      date: new Date().toISOString().slice(0, 10),
      lines: somLines,
    });
    router.push(`/som/${id}`);
  }

  const usedProducts = new Set(lines.map((l) => l.productId).filter(Boolean));

  return (
    <div>
      <Link
        href="/som"
        className="mb-4 inline-block text-sm text-muted hover:text-gold-strong"
      >
        ← Kembali ke daftar SOM
      </Link>

      <PageHeader
        eyebrow="Order Baru"
        title="Buat SOM"
        description="Tentukan customer dan tambah produk yang dipesan. Tersimpan di browser ini."
      />

      <Card className="mb-5">
        <label className="block text-sm font-medium text-ink" htmlFor="cust">
          Customer
        </label>
        <input
          id="cust"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          placeholder="Contoh: Toko Mas Melati — Bandung"
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </Card>

      <Card>
        <div className="mb-3 text-sm font-medium text-ink">Produk Dipesan</div>

        <div className="space-y-3">
          {lines.map((ls, idx) => {
            const product = getProduct(ls.productId);
            const metal = getMetal(product?.bom.metalTypeId);
            const noDefaultFlask = product && !product.bom.flaskSizeId;
            return (
              <div
                key={idx}
                className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-background/60 p-3 sm:grid-cols-[1fr_6rem_9rem_auto] sm:items-start"
              >
                <div>
                  <select
                    value={ls.productId}
                    onChange={(e) => onPickProduct(idx, e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-gold"
                  >
                    <option value="">Pilih produk…</option>
                    {PRODUCTS.map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={usedProducts.has(p.id) && p.id !== ls.productId}
                      >
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {product && (
                    <div className="mt-1 px-1 text-xs text-muted">
                      {metal?.label} · {formatGram(product.bom.waxWeight)} lilin
                      {noDefaultFlask && " · flask wajib dipilih"}
                    </div>
                  )}
                </div>

                <input
                  type="number"
                  min={0}
                  value={ls.quantity}
                  onChange={(e) => update(idx, { quantity: e.target.value })}
                  placeholder="Qty"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-gold"
                />

                <select
                  value={ls.flaskSizeId}
                  onChange={(e) => update(idx, { flaskSizeId: e.target.value })}
                  className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-gold ${
                    noDefaultFlask && !ls.flaskSizeId
                      ? "border-gold/60"
                      : "border-border"
                  }`}
                >
                  <option value="">Pilih flask…</option>
                  {FLASK_SIZES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => removeLine(idx)}
                  disabled={lines.length === 1}
                  aria-label="Hapus produk"
                  className="justify-self-start rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 sm:justify-self-auto"
                >
                  Hapus
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addLine}
          className="mt-3 rounded-lg border border-dashed border-gold/60 px-4 py-2 text-sm font-medium text-gold-strong transition-colors hover:bg-gold-soft"
        >
          + Tambah Produk
        </button>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-5">
          <button
            type="button"
            onClick={submit}
            className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink/90"
          >
            Simpan & Hitung
          </button>
        </div>
      </Card>
    </div>
  );
}
