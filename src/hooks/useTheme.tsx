import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  loading: boolean; // initial load / refresh (orbital loader)
  switching: boolean; // theme switch (toggle-switch loader)
}

const Ctx = createContext<ThemeCtx>({
  theme: "light",
  toggle: () => {},
  loading: true,
  switching: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("invisos-theme") as Theme | null;
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  // Orbital loader = first load / refresh only.
  const [loading, setLoading] = useState(true);
  // Toggle-switch loader = theme switching only.
  const [switching, setSwitching] = useState(false);
  const switchingRef = useRef(false);

  // Apply the theme to <html>.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("invisos-theme", theme);
    root.style.colorScheme = theme;
    // keep the root bg in sync with the pre-paint inline script (no flash / overscroll mismatch)
    root.style.background = theme === "dark" ? "#16161f" : "#eeecf8";
  }, [theme]);

  // Initial load: dismiss once fonts are ready + a calm minimum time.
  useEffect(() => {
    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    };
    // letters rise in (~1s) → hold ~1s → then dismiss (letters leave)
    const min = new Promise<void>((r) => setTimeout(r, 1950));
    const fonts =
      document.fonts && document.fonts.ready
        ? document.fonts.ready
        : Promise.resolve();
    Promise.all([min, fonts]).then(finish);
    const safety = setTimeout(finish, 4000); // never hang
    return () => clearTimeout(safety);
  }, []);

  // Theme switch: show the toggle-switch loader, flip the theme mid-way (the
  // knob slides + colours cross-fade under the overlay), then dismiss.
  const toggle = useCallback(() => {
    if (switchingRef.current) return;
    switchingRef.current = true;
    setSwitching(true);
    window.setTimeout(() => {
      setTheme((t) => (t === "light" ? "dark" : "light"));
      window.setTimeout(() => {
        setSwitching(false);
        switchingRef.current = false;
      }, 1000);
    }, 320);
  }, []);

  return (
    <Ctx.Provider value={{ theme, toggle, loading, switching }}>
      {children}
    </Ctx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(Ctx);
}
