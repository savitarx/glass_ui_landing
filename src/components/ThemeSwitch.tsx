import { Sun, Moon } from "lucide-react";

/**
 * Theme-switch loader: a big glass toggle. When the theme flips, the knob
 * slides between the sun (light) and moon (dark) sides. Shown ONLY while
 * switching themes — never on initial load.
 */
export default function ThemeSwitch({
  show,
  theme,
}: {
  show: boolean;
  theme: "light" | "dark";
}) {
  return (
    <div
      className={`tswitch-overlay${show ? "" : " tswitch-overlay--gone"}`}
      aria-hidden={!show}
    >
      <div className="tswitch" data-dark={theme === "dark"}>
        <span className="tswitch-ico tswitch-ico--sun">
          <Sun size={26} strokeWidth={2.2} />
        </span>
        <span className="tswitch-ico tswitch-ico--moon">
          <Moon size={24} strokeWidth={2.2} />
        </span>
        <span className="tswitch-knob" />
      </div>
      <div className="tswitch-label">
        {theme === "dark" ? "Dark mode" : "Light mode"}
      </div>
    </div>
  );
}
