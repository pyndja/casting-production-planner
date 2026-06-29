import { SPRUE_WEIGHT } from "@/lib/constants";
import { formatGram } from "@/lib/format";

interface CapacityBarProps {
  machineCapacity: number; // gram
  metalUsed: number; // gram logam dalam satu pohon penuh
}

/** Bar kapasitas mesin per batang: sprue + logam terpakai vs margin aman. */
export function CapacityBar({ machineCapacity, metalUsed }: CapacityBarProps) {
  const spruePct = Math.min((SPRUE_WEIGHT / machineCapacity) * 100, 100);
  const metalPct = (metalUsed / machineCapacity) * 100;
  const usedPct = Math.min(spruePct + metalPct, 100);
  const marginPct = Math.max(100 - usedPct, 0);
  const totalUsed = SPRUE_WEIGHT + metalUsed;
  const overLimit = totalUsed > machineCapacity;

  return (
    <div>
      <div className="relative h-8 w-full overflow-hidden rounded-lg border border-border bg-[#eee9e1]">
        <div
          className="absolute top-0 h-full bg-[#a98a5b]"
          style={{ left: 0, width: `${spruePct}%` }}
        />
        <div
          className={`absolute top-0 h-full ${overLimit ? "bg-red-600" : "bg-gold"}`}
          style={{
            left: `${spruePct}%`,
            width: `${Math.min(metalPct, 100 - spruePct)}%`,
          }}
        />
        <div
          className="absolute top-0 h-full bg-[#dcd3c4]"
          style={{ left: `${usedPct}%`, width: `${marginPct}%` }}
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <Legend color="#a98a5b" label={`Sprue (${SPRUE_WEIGHT} g)`} />
        <Legend color="var(--gold)" label="Logam terpakai" />
        <Legend color="#dcd3c4" label="Margin aman" />
      </div>

      <p className={`mt-2 text-xs ${overLimit ? "text-red-600" : "text-muted"}`}>
        {overLimit
          ? `Peringatan: total beban (${formatGram(totalUsed)}) melebihi kapasitas mesin (${formatGram(machineCapacity)}).`
          : `${formatGram(totalUsed)} terpakai dari ${formatGram(machineCapacity)} kapasitas (margin aman 20% diperhitungkan).`}
      </p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-sm"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
