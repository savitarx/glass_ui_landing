import { Sparkles, Github, Twitter, Linkedin, Dribbble } from "lucide-react";
import GlassCard from "./GlassCard";
import { scrollToId } from "../hooks/useLenis";

const COLS = [
  { title: "Studio", links: ["Home", "Projects", "About Us", "Reviews"] },
  { title: "Support", links: ["Contact", "Help", "Privacy", "Terms"] },
];

export default function Footer() {
  return (
    <footer className="px-4 pb-10 pt-24 sm:pt-32">
      <GlassCard className="mx-auto max-w-6xl px-6 py-12 sm:px-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="grid h-9 w-9 place-items-center rounded-xl text-white"
                style={{
                  background: "linear-gradient(150deg, var(--accent), var(--accent-2))",
                }}
              >
                <Sparkles size={17} />
              </span>
              <span className="text-[1.05rem] font-semibold tracking-tight">
                Team Invisos
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[0.92rem] leading-relaxed text-soft">
              A design-led engineering studio crafting calm, premium digital
              experiences.
            </p>
            <div className="mt-5 flex gap-2.5">
              {[Twitter, Dribbble, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="grid h-9 w-9 place-items-center rounded-full text-soft transition-all duration-300 hover:text-[color:var(--text)]"
                  style={{
                    background: "var(--glass-inner)",
                    border: "1px solid var(--hairline)",
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLS.map((c) => (
            <div key={c.title}>
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-dim">
                {c.title}
              </div>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <button
                      onClick={() =>
                        scrollToId(
                          l.toLowerCase().replace("about us", "about").replace(" ", "")
                        )
                      }
                      className="text-[0.92rem] text-soft transition-colors duration-300 hover:text-[color:var(--text)]"
                    >
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[color:var(--hairline)] pt-6 text-[0.85rem] text-dim sm:flex-row">
          <span>© {new Date().getFullYear()} Team Invisos. All rights reserved.</span>
          <span>Crafted with care.</span>
        </div>
      </GlassCard>
    </footer>
  );
}
