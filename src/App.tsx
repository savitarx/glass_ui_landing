import { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "./hooks/useTheme";
import { useLenis } from "./hooks/useLenis";
import { usePointerGlow } from "./hooks/usePointerGlow";
import { usePerfTier } from "./hooks/usePerfTier";
import { useMascotMatch } from "./hooks/useMascotMatch";
import Background from "./components/Background";
// NOTE: the WebGL version (GlassBlob3D.tsx) is kept in the repo but no longer
// imported — MeshTransmissionMaterial re-rendered the scene several times per
// frame and pinned the GPU. AmbientOrb is the CSS equivalent and costs ~nothing.
import AmbientOrb from "./components/AmbientOrb";
import GlassFilters from "./components/GlassFilters";
import Preloader from "./components/Preloader";
import ThemeSwitch from "./components/ThemeSwitch";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import TechSphere from "./components/TechSphere";
import Reviews from "./components/Reviews";
import About from "./components/About";
import Help from "./components/Help";
import Footer from "./components/Footer";
import GetStarted from "./pages/GetStarted";
import Legal from "./pages/Legal";
import { useRoute } from "./hooks/useRoute";

function Shell() {
  const { loading, switching, theme } = useTheme();
  useLenis();
  usePointerGlow();
  // sets <html data-perf="high|low"> — CSS uses it to drop the costly blurs
  usePerfTier();
  // keeps the light-mode mascot plate matched to the page tone
  useMascotMatch();
  const route = useRoute();

  // Track connectivity — while offline, the loader stays up (slow ticks + msg).
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // The loader covers the page while loading OR while there's no connection.
  const showing = loading || !online;

  // Keep the loader in the DOM through its exit animation, then UNMOUNT it —
  // an always-mounted overlay (even faded) can linger as an invisible
  // click-blocker if its hide transition doesn't fully settle.
  const [loaderMounted, setLoaderMounted] = useState(true);
  useEffect(() => {
    if (showing) {
      setLoaderMounted(true);
      return;
    }
    const t = window.setTimeout(() => setLoaderMounted(false), 900);
    return () => window.clearTimeout(t);
  }, [showing]);

  // Same for the theme-switch overlay: it's a full-viewport z-110 sheet, so it
  // must leave the DOM when idle or it silently swallows every hover + click.
  const [switchMounted, setSwitchMounted] = useState(false);
  useEffect(() => {
    if (switching) {
      setSwitchMounted(true);
      return;
    }
    const t = window.setTimeout(() => setSwitchMounted(false), 800);
    return () => window.clearTimeout(t);
  }, [switching]);

  // Freeze scrolling while the loader is covering the page.
  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (showing) {
      document.documentElement.classList.add("lenis-stopped");
      lenis?.stop();
    } else {
      document.documentElement.classList.remove("lenis-stopped");
      lenis?.start();
    }
  }, [showing]);

  // The Get Started page is its own view — same background, orb and theme, but
  // no one-page nav or marketing sections around it.
  const isGetStarted = route === "/get-started";
  const isPrivacy = route === "/privacy";
  const isTerms = route === "/terms";
  // any standalone page: rendered without the one-page nav or marketing sections
  const isStandalone = isGetStarted || isPrivacy || isTerms;

  return (
    <>
      <a href="#home" className="skip-link">
        Skip to content
      </a>
      {loaderMounted && <Preloader done={!showing} offline={!online} />}
      {switchMounted && <ThemeSwitch show={switching} theme={theme} />}
      <GlassFilters />
      <Background />
      <AmbientOrb />

      {!isStandalone && <Navbar />}

      {/* ONE .stage element for every route.
          There used to be a separate .stage inside each branch, so changing
          route unmounted one and mounted the other — which RESTARTED the
          page-reveal animation. That animation has a 560ms delay with `both`
          fill, so the incoming page sat at opacity:0 for over half a second:
          the blank flash seen when navigating on mobile. Keeping the element
          mounted means the reveal plays once, on first load, and never again. */}
      <div className={`stage${showing ? "" : " stage--in"}`}>
        {isGetStarted && <GetStarted />}
        {isPrivacy && <Legal kind="privacy" />}
        {isTerms && <Legal kind="terms" />}

        {!isStandalone && (
          <>
            <main>
              <Hero />
              <div className="section-cv">
                <Projects />
              </div>
              <div className="section-cv">
                <TechSphere />
              </div>
              <div className="section-cv">
                <Reviews />
              </div>
              <div className="section-cv">
                <About />
              </div>
              <div className="section-cv">
                <Help />
              </div>
            </main>
            <div className="section-cv">
              <Footer />
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}
