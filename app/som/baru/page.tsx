"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PRODUCTS, PRODUCT_MAP, getProduct } from "@/data";
import { FLASK_SIZES, getFlask, getMetal } from "@/lib/constants";
import { addSom, generateSomId, getSomById } from "@/lib/store";
import type { SomLine } from "@/lib/types";
import { aggregateLines } from "@/lib/casting";
import { formatGram, formatInt } from "@/lib/format";
import { PageHeader, Card, Stepper, Badge } from "@/components/ui";
import { toast } from "@/lib/toast";

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

const STEPS = [{ label: "Info" }, { label: "Produk" }, { label: "Review" }];

function BuatSomForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromId = searchParams.get("from");

  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState("");
  const [lines, setLines] = useState<LineState[]>([emptyLine()]);

  const [customerError, setCustomerError] = useState("");
  const [lineErrors, setLineErrors] = useState<Record<number, string>>({});
  const [generalError, setGeneralError] = useState("");

  const customerRef = useRef<HTMLInputElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Prefill saat duplikat dari SOM lain (?from=<id>).
  useEffect(() => {
    if (!fromId) return;
    const src = getSomById(fromId);
    if (!src) return;
    setCustomer(src.customer);
    setLines(
      src.lines.map((l) => ({
        productId: l.productId,
        quantity: String(l.quantity),
        flaskSizeId:
          l.flaskSizeId ?? getProduct(l.productId)?.bom.flaskSizeId ?? "",
      })),
    );
  }, [fromId]);

  function update(idx: number, patch: Partial<LineState>) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
    setLineErrors((prev) => {
      if (!prev[idx]) return prev;
      const next = { ...prev };
      delete next[idx];
      return next;
    });
    setGeneralError("");
  }

  function onPickProduct(idx: number, productId: string) {
    const product = getProduct(productId);
    update(idx, { productId, flaskSizeId: product?.bom.flaskSizeId ?? "" });
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
    setGeneralError("");
  }

  function removeLine(idx: number) {
    setLines((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== idx),
    );
    setLineErrors({});
  }

  function scrollTo(el: HTMLElement | null) {
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus?.({ preventScroll: true });
  }

  function goToStep(i: number) {
    setStep(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateCustomer(): boolean {
    setCustomerError("");
    if (!customer.trim()) {
      setCustomerError("Nama customer wajib diisi.");
      scrollTo(customerRef.current);
      return false;
    }
    return true;
  }

  /** Validasi baris produk. Mengembalikan SomLine[] final bila valid. */
  function validateLines(): SomLine[] | null {
    setLineErrors({});
    setGeneralError("");

    const somLines: SomLine[] = [];
    const seen = new Set<string>();
    for (let idx = 0; idx < lines.length; idx++) {
      const ls = lines[idx];
      if (!ls.productId) continue;
      const product = getProduct(ls.productId);
      if (!product) continue;

      if (seen.has(ls.productId)) {
        setLineErrors({ [idx]: "Produk ini sudah dipilih di baris lain." });
        scrollTo(lineRefs.current[idx]);
        return null;
      }
      const qty = parseInt(ls.quantity, 10);
      if (!ls.quantity || isNaN(qty) || qty <= 0) {
        setLineErrors({ [idx]: "Isi jumlah pesanan yang valid (minimal 1)." });
        scrollTo(lineRefs.current[idx]);
        return null;
      }
      if (!ls.flaskSizeId) {
        setLineErrors({ [idx]: "Pilih ukuran flask untuk produk ini." });
        scrollTo(lineRefs.current[idx]);
        return null;
      }
      seen.add(ls.productId);
      somLines.push({
        productId: ls.productId,
        quantity: qty,
        flaskSizeId: ls.flaskSizeId,
      });
    }

    if (somLines.length === 0) {
      setGeneralError("Tambahkan minimal satu produk dengan jumlah pesanan.");
      return null;
    }
    return somLines;
  }

  function onNextFromInfo() {
    if (validateCustomer()) goToStep(1);
  }

  function onNextFromProduk() {
    if (validateLines()) goToStep(2);
  }

  function submit() {
    const somLines = validateLines();
    if (!somLines) {
      // Baris tidak valid lagi (mis. diubah manual via back) — kembali ke step Produk.
      goToStep(1);
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
    toast(`${orderNo} berhasil dibuat.`, "success");
    router.push(`/som/${id}`);
  }

  const usedProducts = new Set(lines.map((l) => l.productId).filter(Boolean));

  const reviewLines = lines.filter((l) => l.productId && l.quantity);
  const reviewSummary = aggregateLines(
    reviewLines.map((l) => ({
      productId: l.productId,
      quantity: parseInt(l.quantity, 10) || 0,
      flaskSizeId: l.flaskSizeId || undefined,
    })),
    PRODUCT_MAP,
  );

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
        description={
          fromId
            ? "Duplikat dari SOM sebelumnya — ubah seperlunya lalu simpan."
            : "Ikuti 3 langkah: info customer, produk dipesan, lalu review sebelum disimpan."
        }
      />

      <Stepper
        steps={STEPS}
        currentIndex={step}
        onStepClick={(i) => goToStep(i)}
      />

      {step === 0 && (
        <Card>
          <label className="block text-sm font-medium text-ink" htmlFor="cust">
            Customer
          </label>
          <input
            id="cust"
            ref={customerRef}
            value={customer}
            onChange={(e) => {
              setCustomer(e.target.value);
              setCustomerError("");
            }}
            aria-invalid={!!customerError}
            placeholder="Contoh: Toko Mas Melati — Bandung"
            className={`mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-gold ${
              customerError ? "border-red-400" : "border-border"
            }`}
          />
          {customerError && (
            <p className="mt-1.5 text-xs text-red-600">{customerError}</p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onNextFromInfo}
              className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink/90"
            >
              Lanjutkan →
            </button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <div className="mb-3 text-sm font-medium text-ink">Produk Dipesan</div>

          <div className="space-y-3">
            {lines.map((ls, idx) => {
              const product = getProduct(ls.productId);
              const metal = getMetal(product?.bom.metalTypeId);
              const noDefaultFlask = product && !product.bom.flaskSizeId;
              const lineError = lineErrors[idx];
              return (
                <div
                  key={idx}
                  ref={(el) => {
                    lineRefs.current[idx] = el;
                  }}
                  className={`rounded-lg border bg-background/60 p-3 ${
                    lineError ? "border-red-400" : "border-border"
                  }`}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_6rem_9rem_auto] sm:items-start">
                    <div>
                      <label className="sr-only" htmlFor={`product-${idx}`}>
                        Produk baris {idx + 1}
                      </label>
                      <select
                        id={`product-${idx}`}
                        value={ls.productId}
                        onChange={(e) => onPickProduct(idx, e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-gold"
                      >
                        <option value="">Pilih produk…</option>
                        {PRODUCTS.map((p) => (
                          <option
                            key={p.id}
                            value={p.id}
                            disabled={
                              usedProducts.has(p.id) && p.id !== ls.productId
                            }
                          >
                            {p.name}
                          </option>
                        ))}
                      </select>
                      {product && (
                        <div className="mt-1 px-1 text-xs text-muted">
                          {metal?.label} · {formatGram(product.bom.waxWeight)}{" "}
                          lilin
                          {noDefaultFlask && " · flask wajib dipilih"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="sr-only" htmlFor={`qty-${idx}`}>
                        Jumlah baris {idx + 1}
                      </label>
                      <input
                        id={`qty-${idx}`}
                        type="number"
                        min={1}
                        step={1}
                        inputMode="numeric"
                        value={ls.quantity}
                        onChange={(e) =>
                          update(idx, { quantity: e.target.value })
                        }
                        placeholder="Qty"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="sr-only" htmlFor={`flask-${idx}`}>
                        Flask baris {idx + 1}
                      </label>
                      <select
                        id={`flask-${idx}`}
                        value={ls.flaskSizeId}
                        onChange={(e) =>
                          update(idx, { flaskSizeId: e.target.value })
                        }
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
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      disabled={lines.length === 1}
                      aria-label={`Hapus produk baris ${idx + 1}`}
                      className="justify-self-start rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 sm:justify-self-auto"
                    >
                      Hapus
                    </button>
                  </div>

                  {lineError && (
                    <p className="mt-2 text-xs text-red-600">{lineError}</p>
                  )}
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

          {generalError && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {generalError}
            </p>
          )}

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => goToStep(0)}
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-gold/50 hover:bg-gold-soft/40"
            >
              ← Kembali
            </button>
            <button
              type="button"
              onClick={onNextFromProduk}
              className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink/90"
            >
              Lanjutkan →
            </button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wide text-muted">
              Customer
            </div>
            <div className="text-lg font-semibold text-ink">{customer}</div>
          </div>

          <div className="-mx-1 overflow-x-auto px-1">
            <table className="w-full min-w-[30rem] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="py-1 font-medium">Produk</th>
                  <th className="py-1 font-medium whitespace-nowrap">Qty</th>
                  <th className="py-1 font-medium whitespace-nowrap">Flask</th>
                  <th className="py-1 font-medium whitespace-nowrap">
                    Pohon (preview)
                  </th>
                </tr>
              </thead>
              <tbody>
                {reviewLines.map((ls, i) => {
                  const product = getProduct(ls.productId);
                  const flask = getFlask(ls.flaskSizeId);
                  const group = reviewSummary.groups
                    .flatMap((g) => g.lines)
                    .find((l) => l.product.id === ls.productId);
                  return (
                    <tr key={i} className="border-t border-border">
                      <td className="py-2 font-medium text-ink">
                        {product?.name}
                      </td>
                      <td className="py-2 whitespace-nowrap">
                        {formatInt(parseInt(ls.quantity, 10) || 0)}
                      </td>
                      <td className="py-2 whitespace-nowrap">
                        {flask?.label ?? "-"}
                      </td>
                      <td className="py-2 whitespace-nowrap font-semibold text-gold-strong">
                        {group?.result
                          ? `${formatInt(group.result.treesNeeded)} batang`
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="ink">
              {formatInt(reviewSummary.grandTotalTrees)} pohon lilin
            </Badge>
            <Badge tone="neutral">
              {formatInt(reviewSummary.grandTotalPieces)} pcs
            </Badge>
            <Badge tone="neutral">
              {reviewSummary.groups.length} run casting
            </Badge>
          </div>

          {reviewSummary.unresolved.length > 0 && (
            <p className="mt-4 rounded-lg border border-gold/40 bg-gold-soft px-3 py-2 text-xs text-gold-strong">
              Beberapa produk belum punya flask terpilih — kembali ke langkah
              Produk untuk melengkapinya.
            </p>
          )}

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-gold/50 hover:bg-gold-soft/40"
            >
              ← Kembali
            </button>
            <button
              type="button"
              onClick={submit}
              className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink/90"
            >
              Simpan & Hitung
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function BuatSomPage() {
  return (
    <Suspense fallback={<p className="text-muted">Memuat…</p>}>
      <BuatSomForm />
    </Suspense>
  );
}
