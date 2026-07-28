import { WifiOff } from "lucide-react";

/**
 * Orbital loader: a glowing central dot, a ring of 8 nodes, and a rotating
 * line that sweeps around lighting each node as it passes. Theme-aware.
 * Shown on initial load / refresh.
 *
 * When `offline`, the ticks slow right down (via --orbit-t) and a
 * "No internet" message + description appears — only in that case.
 */
const N = 8;
const R = 62;
const C = 100;

const NODES = Array.from({ length: N }, (_, i) => {
  const a = (i / N) * 2 * Math.PI; // 0 = right, clockwise
  return {
    x: +(C + R * Math.cos(a)).toFixed(2),
    y: +(C + R * Math.sin(a)).toFixed(2),
    frac: (i / N).toFixed(4),
  };
});

export default function Preloader({
  done,
  offline = false,
}: {
  done: boolean;
  offline?: boolean;
}) {
  return (
    <div
      className={`preloader${done ? " preloader--gone" : ""}${
        offline ? " preloader--offline" : ""
      }`}
      aria-hidden={done}
      aria-label={offline ? "No internet connection" : "Loading"}
      role="status"
    >
      <div className="preloader__stack">
        <svg className="orbit" viewBox="0 0 200 200" width="240" height="240">
          <defs>
            <radialGradient id="orbitGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
              <stop offset="55%" stopColor="currentColor" stopOpacity="0.12" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle className="orbit-bloom" cx={C} cy={C} r="40" fill="url(#orbitGlow)" />

          {NODES.map((n, i) => (
            <circle
              key={i}
              className="orbit-node"
              cx={n.x}
              cy={n.y}
              r="8"
              style={{ animationDelay: `calc(var(--orbit-t) * ${n.frac})` }}
            />
          ))}

          <line className="orbit-sweep" x1={C} y1={C} x2={C + R} y2={C} />
          <circle className="orbit-core" cx={C} cy={C} r="7.5" />
        </svg>

        {offline && (
          <div className="preloader__offline">
            <span className="preloader__offline-icon">
              <WifiOff size={20} strokeWidth={2.2} />
            </span>
            <h3>No internet connection</h3>
            <p>
              We can't reach the network right now. This page will continue
              automatically the moment you're back online.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
