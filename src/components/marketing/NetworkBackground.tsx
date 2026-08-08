const NODES = [
  { x: 8, y: 15, delay: 0 },
  { x: 22, y: 42, delay: 0.6 },
  { x: 38, y: 12, delay: 1.2 },
  { x: 52, y: 58, delay: 0.3 },
  { x: 68, y: 24, delay: 1.8 },
  { x: 81, y: 46, delay: 0.9 },
  { x: 92, y: 18, delay: 1.5 },
  { x: 14, y: 78, delay: 2.1 },
  { x: 45, y: 85, delay: 0.4 },
  { x: 74, y: 80, delay: 1.1 },
];

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [1, 3],
  [2, 4],
  [3, 4],
  [4, 5],
  [5, 6],
  [3, 7],
  [3, 8],
  [5, 9],
  [8, 9],
];

/**
 * Fixed decorative SVG — an "intelligence network," not a hero illustration.
 * Purely presentational (aria-hidden); disabled entirely under
 * prefers-reduced-motion via the .network-node CSS rule.
 */
export function NetworkBackground() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      {EDGES.map(([a, b], i) => {
        const nodeA = NODES[a];
        const nodeB = NODES[b];
        if (!nodeA || !nodeB) return null;
        return (
          <line
            key={i}
            x1={nodeA.x}
            y1={nodeA.y}
            x2={nodeB.x}
            y2={nodeB.y}
            stroke="var(--accent-2)"
            strokeWidth="0.1"
            opacity="0.5"
          />
        );
      })}
      {NODES.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r="0.5"
          fill="var(--accent)"
          className="network-node"
          style={{ animationDelay: `${n.delay}s` }}
        />
      ))}
    </svg>
  );
}
