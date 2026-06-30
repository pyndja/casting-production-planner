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
 * Trunk vertikal + beberapa cabang cincin bertumpuk; tiap pcs menempel radial.
 */
export function WaxTreeSVG({
  piecesPerTree,
  treesNeeded,
  width = 220,
  height = 296,
}: WaxTreeSVGProps) {
  const trunkX = width / 2;
  const trunkTop = 30;
  const baseY = height - 28;
  const trunkBottom = baseY - 26;

  const maxRings = 6;
  const perRingCap = 9;
  const ringCount = Math.min(
    maxRings,
    Math.max(1, Math.ceil(piecesPerTree / perRingCap)),
  );

  const piecesPerRing = Array(ringCount).fill(0) as number[];
  for (let i = 0; i < piecesPerTree; i++) {
    piecesPerRing[i % ringCount]++;
  }

  const ringAreaTop = trunkTop + 30;
  const ringAreaBottom = trunkBottom;
  const ringSpacing =
    ringCount > 1 ? (ringAreaBottom - ringAreaTop) / (ringCount - 1) : 0;
  const ringRx = 62;
  const ringRy = 16;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Pohon lilin dengan ${piecesPerTree} pcs`}
    >
      {/* base / stand */}
      <ellipse cx={trunkX} cy={baseY} rx={55} ry={12} fill="#1a1a1a" />

      {/* trunk */}
      <line
        x1={trunkX}
        y1={trunkTop}
        x2={trunkX}
        y2={baseY - 4}
        stroke={TREE_DARK}
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* knob */}
      <circle
        cx={trunkX}
        cy={trunkTop - 4}
        r={6}
        fill={TREE_COLOR}
        stroke={TREE_DARK}
        strokeWidth={1.5}
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
          const ix = trunkX + (ringRx - 6) * Math.cos(angle);
          const iy = ringY + (ringRy - 2) * Math.sin(angle);
          dots.push(
            <g key={p}>
              <line
                x1={ix}
                y1={iy}
                x2={px}
                y2={py}
                stroke={TREE_COLOR}
                strokeWidth={1.5}
              />
              <circle
                cx={px}
                cy={py}
                r={3.5}
                fill={TREE_COLOR}
                stroke={TREE_DARK}
                strokeWidth={1}
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
              strokeWidth={3}
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
          fontSize={11}
          fill="#5b5347"
        >
          × {formatInt(treesNeeded)} pohon
        </text>
      )}
    </svg>
  );
}
