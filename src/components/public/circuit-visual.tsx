export function CircuitVisual() {
  return (
    <svg
      viewBox="0 0 480 480"
      className="h-full w-full"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* connective circuit lines */}
      <g stroke="var(--border)" strokeWidth="1.5" fill="none">
        <path d="M80 380 L80 260 L180 260 L180 140" />
        <path d="M180 140 L280 140 L280 60" />
        <path d="M180 260 L300 260 L300 340 L400 340" />
        <path d="M280 140 L380 140 L380 220" />
        <path d="M80 380 L200 380 L200 420" />
      </g>

      {/* animated pulse traveling one path — the single orchestrated motion moment */}
      <circle r="4" fill="var(--gold)">
        <animateMotion
          dur="4s"
          repeatCount="indefinite"
          path="M80 380 L80 260 L180 260 L180 140 L280 140 L280 60"
        />
      </circle>

      {/* nodes */}
      {[
        [80, 380],
        [180, 260],
        [180, 140],
        [280, 140],
        [280, 60],
        [300, 260],
        [300, 340],
        [400, 340],
        [380, 220],
        [200, 420],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="18" fill="url(#nodeGlow)" />
          <circle cx={cx} cy={cy} r="4" fill="var(--gold)" />
          <circle cx={cx} cy={cy} r="7" stroke="var(--brand-secondary, var(--gold))" strokeWidth="1" fill="none" opacity="0.4" />
        </g>
      ))}
    </svg>
  );
}
