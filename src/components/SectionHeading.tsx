import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <Reveal>
        <span
          className="text-[0.78rem] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "var(--accent)" }}
        >
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="mt-3 text-[1.65rem] font-semibold tracking-[-0.02em] sm:text-[2.6rem]">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.12}>
          <p
            className={`mt-3 text-[0.94rem] leading-relaxed text-soft sm:mt-4 sm:text-[1.02rem] ${
              align === "center" ? "mx-auto max-w-2xl" : "max-w-xl"
            }`}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
