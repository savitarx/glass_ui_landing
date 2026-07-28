/**
 * Softly illuminated environment. Fixed, non-interactive. Large blurred
 * pastel light sources with a warm top highlight and cool lower reflections —
 * only there to make the glass feel alive. No patterns, no motion.
 */
export default function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, var(--page-1) 0%, var(--page-2) 100%)",
      }}
    >
      {/* Layered ambient light sources — off-centre and asymmetric so the
          field feels natural, each drifting on its own very slow cycle. */}
      {/* warm key light, top, pulled off-centre to the left */}
      <div
        className="light-drift absolute -top-52 left-[38%] h-[60rem] w-[80rem] -translate-x-1/2 rounded-full blur-[130px]"
        style={{
          ["--ld" as string]: "34s",
          ["--ldx" as string]: "-2%",
          ["--ldy" as string]: "2%",
          background:
            "radial-gradient(circle, var(--blob-cream), transparent 62%)",
        }}
      />
      {/* lavender, upper-left */}
      <div
        className="light-drift absolute -top-40 -left-32 h-[52rem] w-[52rem] rounded-full blur-[120px]"
        style={{
          ["--ld" as string]: "29s",
          ["--ldx" as string]: "3.5%",
          ["--ldy" as string]: "-2%",
          background: "radial-gradient(circle, var(--blob-lav), transparent 66%)",
        }}
      />
      {/* soft blue, upper-right */}
      <div
        className="light-drift absolute top-[4%] right-[-16%] h-[48rem] w-[48rem] rounded-full blur-[120px]"
        style={{
          ["--ld" as string]: "31s",
          ["--ldx" as string]: "-3%",
          ["--ldy" as string]: "2.5%",
          background: "radial-gradient(circle, var(--blob-blue), transparent 66%)",
        }}
      />
      {/* violet, mid-left, drifting */}
      <div
        className="light-drift absolute top-[42%] -left-[10%] h-[40rem] w-[40rem] rounded-full blur-[130px]"
        style={{
          ["--ld" as string]: "37s",
          ["--ldx" as string]: "4%",
          ["--ldy" as string]: "-3%",
          background:
            "radial-gradient(circle, var(--blob-violet), transparent 68%)",
        }}
      />
      {/* white core glow, off-centre right — the subtle bright anchor */}
      <div
        className="light-drift absolute top-[30%] right-[16%] h-[30rem] w-[30rem] rounded-full blur-[110px]"
        style={{
          ["--ld" as string]: "24s",
          ["--ldx" as string]: "-2.5%",
          ["--ldy" as string]: "3%",
          background: "radial-gradient(circle, var(--blob-core), transparent 70%)",
        }}
      />
      {/* cool reflections, lower band */}
      <div
        className="light-drift absolute bottom-[-18%] left-[4%] h-[44rem] w-[44rem] rounded-full blur-[130px]"
        style={{
          ["--ld" as string]: "33s",
          ["--ldx" as string]: "3%",
          ["--ldy" as string]: "-2%",
          background: "radial-gradient(circle, var(--blob-pink), transparent 68%)",
        }}
      />
      <div
        className="light-drift absolute bottom-[2%] right-[2%] h-[42rem] w-[42rem] rounded-full blur-[130px]"
        style={{
          ["--ld" as string]: "28s",
          ["--ldx" as string]: "-3%",
          ["--ldy" as string]: "-2.5%",
          background: "radial-gradient(circle, var(--blob-mint), transparent 68%)",
        }}
      />
      {/* faint structural grid, masked to the centre */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(circle at 50% 26%, black, transparent 76%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 26%, black, transparent 76%)",
        }}
      />
    </div>
  );
}
