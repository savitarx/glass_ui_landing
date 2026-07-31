import { ArrowLeft } from "lucide-react";
import GlassCard from "../components/GlassCard";
import Reveal from "../components/Reveal";
import ScrollTop from "../components/ScrollTop";
import { navigate } from "../hooks/useRoute";
import { RECIPIENT } from "../lib/sendInquiry";

type Section = { heading: string; body: string; bullets?: string[] };

const UPDATED = "30 July 2026";

const PRIVACY: Section[] = [
  {
    heading: "What we collect",
    body: "Only what you choose to send us. If you fill in the Get Started form, we receive the details you enter so we can reply to your enquiry.",
    bullets: [
      "Your name and work email — so we can respond",
      "Company name, project type, budget and timeline — if you provide them",
      "Anything you write in the project description or reference field",
    ],
  },
  {
    heading: "What we don't collect",
    body: "This site runs no analytics, no advertising pixels and no third-party trackers. We do not set cookies for tracking, and we do not build a profile of you across sites.",
  },
  {
    heading: "How your enquiry reaches us",
    body: "Form submissions are delivered by email to our studio inbox. They are not stored in a database on this site, and they are not shared with anyone outside Invisos.",
  },
  {
    heading: "How long we keep it",
    body: "Enquiry emails are retained while a conversation is active and for a reasonable period afterwards for our records. You can ask us to delete yours at any time and we will do so.",
  },
  {
    heading: "Your rights",
    body: "You can ask what we hold about you, ask for it to be corrected, or ask for it to be deleted. Write to us and we'll action it — no forms, no friction.",
  },
  {
    heading: "Changes",
    body: "If this policy changes materially, the date at the top of this page changes with it.",
  },
];

const TERMS: Section[] = [
  {
    heading: "About these terms",
    body: "These terms cover your use of this website. They are not the contract for a project — engagements are governed by a separate written agreement signed by both parties.",
  },
  {
    heading: "Using this site",
    body: "You are welcome to browse, read and enquire. Please don't attempt to disrupt the site, access it by automated means at a disruptive rate, or misrepresent your identity when contacting us.",
  },
  {
    heading: "Enquiries are not a contract",
    body: "Submitting the Get Started form starts a conversation. It does not create a binding agreement, reserve capacity, or commit either side to anything until we have both signed a proposal.",
  },
  {
    heading: "Our work and content",
    body: "The design, copy, code and visual assets on this site belong to Invisos unless credited otherwise. Case studies describing client projects are shown with permission and remain the property of their owners.",
    bullets: [
      "Don't reproduce the site's design or copy as your own",
      "Client names and logos remain the property of those clients",
    ],
  },
  {
    heading: "Accuracy",
    body: "We keep this site current, but figures such as timelines, availability and indicative pricing can change. Nothing here is a formal quote.",
  },
  {
    heading: "Liability",
    body: "The site is provided as-is. To the extent permitted by law, we aren't liable for losses arising from your use of it. Nothing here limits liability that cannot lawfully be limited.",
  },
];

export default function Legal({ kind }: { kind: "privacy" | "terms" }) {
  const isPrivacy = kind === "privacy";
  const sections = isPrivacy ? PRIVACY : TERMS;

  return (
    <main className="gs-page relative z-[1] mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-16">
      <div className="gs-wash gs-wash--b" aria-hidden />

      <Reveal>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="group mb-10 inline-flex items-center gap-2 text-[0.9rem] font-medium text-dim transition-colors hover:text-[color:var(--text)]"
        >
          <ArrowLeft
            size={16}
            className="transition-transform duration-300 group-hover:-translate-x-0.5"
          />
          Back to Invisos
        </button>
      </Reveal>

      <header className="mb-10 sm:mb-14">
        <Reveal>
          <span
            className="text-[0.72rem] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--accent)" }}
          >
            Legal
          </span>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-4 text-[1.75rem] font-semibold leading-[1.08] tracking-[-0.03em] sm:mt-5 sm:text-[2.8rem]">
            {isPrivacy ? "Privacy Policy" : "Terms of Service"}
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-3 text-[0.88rem] text-dim sm:text-[0.95rem]">
            Last updated {UPDATED}
          </p>
        </Reveal>
      </header>

      <Reveal delay={0.16}>
        <GlassCard className="px-6 py-8 sm:px-10 sm:py-12">
          <p className="text-[0.95rem] leading-relaxed text-soft sm:text-[1.02rem]">
            {isPrivacy
              ? "Invisos is a small studio. We ask for as little as possible, we don't track you, and we only use what you send us to reply to you."
              : "Plain terms for a small studio site. If anything here is unclear, ask us — we'd rather explain than hide behind wording."}
          </p>

          <div className="mt-10 space-y-9">
            {sections.map((s) => (
              <section key={s.heading}>
                <h2 className="text-[1.02rem] font-semibold tracking-tight sm:text-[1.15rem]">
                  {s.heading}
                </h2>
                <p className="mt-2.5 text-[0.92rem] leading-relaxed text-soft sm:text-[1rem]">
                  {s.body}
                </p>
                {s.bullets && (
                  <ul className="mt-4 space-y-2.5">
                    {s.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex gap-3 text-[0.9rem] leading-relaxed text-soft sm:text-[0.97rem]"
                      >
                        <span
                          className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: "var(--accent)" }}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <GlassCard
            lite
            radius="rounded-[20px]"
            className="mt-12 p-5 text-[0.9rem] leading-relaxed text-soft"
          >
            Questions about {isPrivacy ? "your data" : "these terms"}? Email us
            at{" "}
            <a
              href={`mailto:${RECIPIENT}`}
              className="font-medium underline decoration-1 underline-offset-2"
              style={{ color: "var(--link)" }}
            >
              {RECIPIENT}
            </a>{" "}
            or{" "}
            <button
              type="button"
              onClick={() => navigate("/get-started")}
              className="font-medium underline decoration-1 underline-offset-2"
              style={{ color: "var(--link)" }}
            >
              start a conversation
            </button>
            .
          </GlassCard>
        </GlassCard>
      </Reveal>

      <ScrollTop />
    </main>
  );
}
