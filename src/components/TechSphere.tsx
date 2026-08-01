import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

type Tech = { name: string; slug: string; color: string };

const DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/";

const TECH: Tech[] = [
  { name: "React.js", slug: "react/react-original", color: "#61DAFB" },
  { name: "TypeScript", slug: "typescript/typescript-original", color: "#3178C6" },
  { name: "HTML5", slug: "html5/html5-original", color: "#E34F26" },
  { name: "CSS3", slug: "css3/css3-original", color: "#1572B6" },
  { name: "Tailwind CSS", slug: "tailwindcss/tailwindcss-original", color: "#38BDF8" },
  { name: "React Router", slug: "reactrouter/reactrouter-original", color: "#F44250" },
  { name: "Axios", slug: "axios/axios-plain", color: "#5A29E4" },
  { name: "Vite", slug: "vitejs/vitejs-original", color: "#646CFF" },
  { name: "Framer Motion", slug: "framermotion/framermotion-original", color: "#0055FF" },
  { name: "Java", slug: "java/java-original", color: "#E76F00" },
  { name: "Spring Boot", slug: "spring/spring-original", color: "#6DB33F" },
  { name: "Spring Security", slug: "spring/spring-original", color: "#6DB33F" },
  { name: "AWS Cloud", slug: "amazonwebservices/amazonwebservices-original-wordmark", color: "#FF9900" },
  { name: "Postgres", slug: "postgresql/postgresql-original", color: "#4169E1" },
  { name: "Postman", slug: "postman/postman-original", color: "#FF6C37" },
  { name: "GitHub", slug: "github/github-original", color: "#5B6472" },
];

const N = TECH.length;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
// even distribution on a unit sphere (Fibonacci)
const BASE = TECH.map((t, i) => {
  const y = 1 - (i / (N - 1)) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const th = GOLDEN * i;
  return { t, x: Math.cos(th) * r, y, z: Math.sin(th) * r };
});

function initials(name: string) {
  return name
    .replace(/\.js$/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TechIcon({ t }: { t: Tech }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <span className="tech-mono" style={{ background: t.color }}>
        {initials(t.name)}
      </span>
    );
  }
  return (
    <img
      className="tech-logo"
      src={`${DEVICON}${t.slug}.svg`}
      alt={t.name}
      loading="lazy"
      onError={() => setErr(true)}
    />
  );
}

/* Typewriter that types a word, holds, deletes, then moves to the next. */
function useTypewriter(words: string[]) {
  const [text, setText] = useState("");
  useEffect(() => {
    let i = 0;
    let cur = "";
    let deleting = false;
    let timer: number;
    const step = () => {
      const w = words[i % words.length];
      if (!deleting) {
        cur = w.slice(0, cur.length + 1);
        setText(cur);
        if (cur === w) {
          deleting = true;
          timer = window.setTimeout(step, 1400);
          return;
        }
        timer = window.setTimeout(step, 80);
      } else {
        cur = w.slice(0, cur.length - 1);
        setText(cur);
        if (cur === "") {
          deleting = false;
          i += 1;
          timer = window.setTimeout(step, 380);
          return;
        }
        timer = window.setTimeout(step, 42);
      }
    };
    timer = window.setTimeout(step, 500);
    return () => window.clearTimeout(timer);
  }, [words]);
  return text;
}

const WORDS = TECH.map((t) => t.name);

export default function TechSphere() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLDivElement | null)[]>([]);
  const typed = useTypewriter(WORDS);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let R = (scene.clientWidth / 2) * 0.72;
    const onResize = () => {
      R = (scene.clientWidth / 2) * 0.72;
    };
    window.addEventListener("resize", onResize);

    let ay = 0;
    let raf = 0;
    let visible = true;
    let last = 0;

    // PERF: the loop is fully stopped when the sphere scrolls away, instead of
    // ticking every frame just to skip the work. Nothing is scheduled at all
    // while it is off screen.
    const io = new IntersectionObserver(
      ([e]) => {
        const now = e.isIntersecting;
        if (now === visible) return;
        visible = now;
        if (visible && !reduce && !raf) {
          last = 0;
          raf = requestAnimationFrame(loop);
        } else if (!visible && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 }
    );
    io.observe(scene);

    /* Rotation is time-based (radians per second) rather than per-frame, so
       the speed is identical at 30fps, 60fps or 120fps. It used to add a fixed
       amount per frame, which meant capping the loop to 30fps silently halved
       the spin. */
    const SPIN = 0.22; // rad/s
    const render = (dtMs = 0) => {
      // gentle multi-axis drift
      ay += SPIN * (dtMs / 1000);
      const ax = -0.32 * Math.sin(ay * 0.6);
      const cy = Math.cos(ay);
      const sy = Math.sin(ay);
      const cx = Math.cos(ax);
      const sx = Math.sin(ax);

      for (let i = 0; i < BASE.length; i++) {
        const el = tiles.current[i];
        if (!el) continue;
        const b = BASE[i];
        // rotate around Y then X
        const x1 = b.x * cy + b.z * sy;
        const z1 = -b.x * sy + b.z * cy;
        const y2 = b.y * cx - z1 * sx;
        const z2 = b.y * sx + z1 * cx;

        const depth = (z2 + 1) / 2; // 0 (back) .. 1 (front)
        const scale = 0.55 + depth * 0.55; // 0.55 .. 1.10
        // billboard: only translate + scale, no 3D rotation → always crisp
        /* Full precision — rounding to 0.1px made the drift visibly step
           between positions instead of gliding. */
        el.style.transform = `translate(-50%, -50%) translate3d(${x1 * R}px, ${
          y2 * R
        }px, 0) scale(${scale})`;
        /* back-facing tiles used to drop to 0.28, which read as "some icons
           aren't moving" because they were too faint to track */
        el.style.opacity = String(0.42 + depth * 0.58);
        // PERF: zIndex is only written when it actually changes — every write
        // re-sorts the stacking context.
        const z = String(Math.round(depth * 100));
        if (el.dataset.z !== z) {
          el.style.zIndex = z;
          el.dataset.z = z;
        }
        // PERF: a per-tile `filter: blur()` that changed every frame forced a
        // fresh raster of each back-facing tile, every frame. Depth now reads
        // from opacity + scale alone, which are pure compositor properties.
      }
    };

    /* Runs at the display's native rate. The previous 30fps cap is what made
       the spin look steppy: it skipped every other frame, so the tiles jumped
       twice as far each time they moved. The work per frame is tiny — two
       compositor-only style writes per tile — so uncapped is both smoother and
       still cheap. It is fully cancelled while off screen (see the observer). */
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!last) last = t;
      const dt = t - last;
      last = t;
      // clamp so returning from a background tab doesn't jump the globe
      render(Math.min(dt, 100));
    };
    render(0);
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
  }, []);

  return (
    <section id="stack" className="px-4 pt-14 sm:pt-20">
      {/* Copy on the left, sphere on the right. Stacks to copy-then-sphere on
          phones, where both are scaled down to sit inside one screen. */}
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-6">
        {/* ---- Left: typography ---- */}
        <div className="text-center lg:pr-4 lg:text-left">
          <Reveal>
            <span
              className="text-[0.78rem] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--accent)" }}
            >
              Our Stack
            </span>
          </Reveal>

          <Reveal delay={0.06}>
            <h2 className="mt-4 text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[2.6rem] lg:text-[3.2rem]">
              The tools behind
              <br />
              every build
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mx-auto mt-5 max-w-md text-[0.98rem] leading-relaxed text-soft sm:text-[1.08rem] lg:mx-0">
              A deliberately small, deeply understood toolkit — chosen so we can
              move fast without trading away reliability.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="typewriter">
              We are professionals in&nbsp;
              <span className="tw-word">{typed}</span>
              <span className="tw-caret" aria-hidden />
            </p>
          </Reveal>
        </div>

        {/* ---- Right: the glass sphere ---- */}
        <div className="flex justify-center lg:justify-end">
          <div ref={sceneRef} className="sphere-scene">
            <div className="sphere-glass" aria-hidden>
              <span className="sphere-spec" />
              <span className="sphere-rim" />
            </div>
            {BASE.map((b, i) => (
              <div
                key={b.t.name}
                ref={(el) => (tiles.current[i] = el)}
                className="tech-tag"
                title={b.t.name}
              >
                <TechIcon t={b.t} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
