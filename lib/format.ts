// ===== Helper format angka (locale id-ID) =====

export function formatNumber(num: number, decimals = 2): string {
  return num.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function formatGram(num: number, decimals = 2): string {
  return `${formatNumber(num, decimals)} g`;
}

export function formatInt(num: number): string {
  return formatNumber(num, 0);
}

export function formatDate(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
