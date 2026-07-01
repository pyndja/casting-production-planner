import { formatInt } from "@/lib/format";

interface WaxTreeSVGProps {
  piecesPerTree: number;
  treesNeeded?: number;
  width?: number;
  height?: number;
}

const TREE_COLOR = "#c8a64b";
const TREE_DARK = "#8a6d1f";

/**
 * Ilustrasi pohon lilin (wax tree) gaya ring-branch — 1 pohon representatif.
 * Trunk vertikal dengan cabang (ring) bertumpuk; setiap 1 pcs = 1 tingkat
 * cabang. Jika pcs lebih banyak dari batas tampil, sisanya ditumpuk radial
 * di cabang paling bawah supaya tetap terbaca.
 */
export function WaxTreeSVG({
  piecesPerTree,
  treesNeeded,
  width = 220,
  height = 296,
}: WaxTreeSVGProps) {
  // Skala seluruh elemen relatif terhadap ukuran dasar 220×296, supaya
  // komponen ini tetap proporsional saat dirender kecil (grid multi-batang).
  const scale = width / 220;

  const trunkX = width / 2;
  const trunkTop = 30 * scale;
  const baseY = height - 28 * scale;
  const trunkBottom = baseY - 26 * scale;

  // Setiap pcs = 1 tingkat cabang. Maksimal 6 tingkat ditampilkan; sisanya
  // (jika pcs > 6) ditumpuk radial di tingkat paling bawah.
  const maxLevels = 6;
  const ringCount = Math.max(1, Math.min(maxLevels, piecesPerTree));

  const piecesPerRing = Array(ringCount).fill(1) as number[];
  const overflow = piecesPerTree - ringCount;
  if (overflow > 0) {
    piecesPerRing[ringCount - 1] += overflow;
  }

  const ringAreaTop = trunkTop + 30 * scale;
  const ringAreaBottom = trunkBottom;
  const ringSpacing =
    ringCount > 1 ? (ringAreaBottom - ringAreaTop) / (ringCount - 1) : 0;
  const ringRx = 62 * scale;
  const ringRy = 16 * scale;
  const dotR = Math.max(1.5, 3.5 * scale);
  const strokeThin = Math.max(0.75, 1.5 * scale);
  const strokeMed = Math.max(1, 3 * scale);
  const strokeTrunk = Math.max(1.5, 4 * scale);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Pohon lilin dengan ${piecesPerTree} pcs`}
    >
      {/* base / stand */}
      <ellipse
        cx={trunkX}
        cy={baseY}
        rx={55 * scale}
        ry={12 * scale}
        fill="#1a1a1a"
      />

      {/* trunk */}
      <line
        x1={trunkX}
        y1={trunkTop}
        x2={trunkX}
        y2={baseY - 4 * scale}
        stroke={TREE_DARK}
        strokeWidth={strokeTrunk}
        strokeLinecap="round"
      />
      {/* knob */}
      <circle
        cx={trunkX}
        cy={trunkTop - 4 * scale}
        r={Math.max(2, 6 * scale)}
        fill={TREE_COLOR}
        stroke={TREE_DARK}
        strokeWidth={strokeThin}
      />

      {piecesPerRing.map((count, r) => {
        const ringY =
          ringCount > 1
            ? ringAreaTop + r * ringSpacing
            : (ringAreaTop + ringAreaBottom) / 2;

        const dots = [];
        for (let p = 0; p < count; p++) {
          const angle = (p / count) * Math.PI * 2 - Math.PI / 2;
          const px = trunkX + ringRx * Math.cos(angle);
          const py = ringY + ringRy * Math.sin(angle);
          const ix = trunkX + (ringRx - 6 * scale) * Math.cos(angle);
          const iy = ringY + (ringRy - 2 * scale) * Math.sin(angle);
          dots.push(
            <g key={p}>
              <line
                x1={ix}
                y1={iy}
                x2={px}
                y2={py}
                stroke={TREE_COLOR}
                strokeWidth={strokeThin}
              />
              <circle
                cx={px}
                cy={py}
                r={dotR}
                fill={TREE_COLOR}
                stroke={TREE_DARK}
                strokeWidth={strokeThin * 0.7}
              />
            </g>,
          );
        }

        return (
          <g key={r}>
            <ellipse
              cx={trunkX}
              cy={ringY}
              rx={ringRx}
              ry={ringRy}
              fill="none"
              stroke={TREE_COLOR}
              strokeWidth={strokeMed}
            />
            {dots}
          </g>
        );
      })}

      {treesNeeded != null && (
        <text
          x={trunkX}
          y={height - 6}
          textAnchor="middle"
          fontSize={Math.max(8, 11 * scale)}
          fill="#5b5347"
        >
          × {formatInt(treesNeeded)} pohon
        </text>
      )}
    </svg>
  );
}
