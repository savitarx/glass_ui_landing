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

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(scene);

    const render = () => {
      // gentle multi-axis drift
      ay += 0.0022;
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
        el.style.transform = `translate(-50%, -50%) translate3d(${(x1 * R).toFixed(
          1
        )}px, ${(y2 * R).toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        el.style.opacity = (0.28 + depth * 0.72).toFixed(3);
        el.style.zIndex = String(Math.round(depth * 100));
        el.style.filter = depth < 0.5 ? `blur(${((0.5 - depth) * 2).toFixed(1)}px)` : "none";
      }
    };

    const loop = () => {
      if (visible) render();
      raf = requestAnimationFrame(loop);
    };
    render();
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
  }, []);

  return (
    <section id="stack" className="px-4 pt-24 sm:pt-32">
      <div className="mx-auto flex max-w-6xl flex-col items-center">
        <Reveal>
          <span
            className="text-[0.78rem] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--accent)" }}
          >
            Our Stack
          </span>
        </Reveal>

        <div ref={sceneRef} className="sphere-scene mt-8">
          <div className="sphere-glass" aria-hidden />
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

        <p className="typewriter">
          We are professionals in&nbsp;
          <span className="tw-word">{typed}</span>
          <span className="tw-caret" aria-hidden />
        </p>
      </div>
    </section>
  );
}
