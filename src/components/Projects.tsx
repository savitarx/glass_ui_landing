import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import GlassCard from "./GlassCard";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import TiltCard from "./TiltCard";
import ScrollTop from "./ScrollTop";
import { navigate } from "../hooks/useRoute";

type Fact = { label: string; value: string };
type Stat = { value: string; label: string };
type Section = { heading: string; body: string; bullets?: string[] };

type Project = {
  title: string;
  desc: string;
  detail: string;
  meta: string;
  tech: string[];
  grad: string;
  /** one-line positioning statement shown under the title in the modal */
  tagline: string;
  /** engagement facts rendered as a definition grid */
  facts: Fact[];
  /** headline outcome numbers */
  stats: Stat[];
  /** the long-form case study */
  sections: Section[];
};

const PROJECTS: Project[] = [
  {
    title: "SIMS (Student Inventory Management System)",
    desc: " Centralized student records management system.",
    detail:
      "Every institution has resources that keep learning moving forward.SIMS ensures those resources are always organized, accessible, and ready when they’re needed most.",
    meta: "2026 · Product + Design System",
    tech: ["React", "Springboot","AWS"],
    grad: "linear-gradient(140deg,#b9a8ff,#8fb4ff)",
    tagline:
      "Smarter Inventory.Better Institutions",
    facts: [
      { label: "Timeline", value: "3 months" },
      { label: "Team", value: "2 designers · 3 engineers" },
      { label: "Engagement", value: "Product + Design System" },
      { label: "Platforms", value: "Web" },
    ],
    stats: [
      { value: "4.9★", label: "Customer rating" },
      { value: "90 days", label: "Time to ship" },
      { value: "24/7", label: "Support" },
    ],
    sections: [
      {
        heading: "The brief",
        body: "Every educational institution relies on resources that support learning. SIMS brings them together in one intelligent system, making inventory management simple, transparent, and reliable.",
      },
      {
        heading: "The challenge",
        body: "Every academic year brings a new wave of students and records. As institutions grow, managing inventory through spreadsheets and manual processes becomes increasingly difficult. What starts as a simple tracking system soon turns into a challenge of maintaining accuracy, accountability, and efficiency across the entire campus.",
        bullets: [
          "Thousands of new student resources are added every year, making manual tracking time-consuming and error-prone.",
          "Information stored across spreadsheets and departments leads to duplicate entries and delayed decision-making.",
          "Routine tasks like attendance,exams,ranking and details management consume valuable time that could be spent on education and administration.",
        ],
      },
      {
        heading: "What we built",
        body: "Every challenge presents an opportunity to innovate. We build thoughtful digital solutions that replace complexity with clarity, helping institutions work smarter, make informed decisions, and focus on what truly matters.",
        bullets: [
          "Bring operational data together in one secure platform, eliminating scattered records and disconnected workflows.",
          "Track, monitor, and manage every resource with real-time visibility, ensuring accuracy and accountability across the institution.",
          "Replace repetitive manual tasks with streamlined digital workflows, allowing administrators to focus on education rather than paperwork.",
          
        ],
      },
      {
        heading: "Under the hood",
        body: "Powered by Spring Boot and React, SIMS is built on a secure, scalable architecture designed for modern institutions. With Spring Security safeguarding every interaction and a cloud-powered database managing information seamlessly, the platform delivers reliability, performance, and peace of mind.",
      },
      {
        heading: "The outcome",
        body: "SIMS transformed inventory management into a streamlined digital experience, replacing manual processes with a centralized, secure, and efficient system. Institutions gain greater visibility, improved accountability, and the confidence to manage resources as they grow.",
      },
    ],
  },
  {
  title: "Clinical Management Software",
  desc: "Centralized patient care and hospital management system.",
  detail:
    "Designed to streamline every stage of the patient journey—from registration and consultation to pharmacy, laboratory, billing, and visit completion—through one secure, integrated platform.",
  meta: "2026 · Healthcare Management System",
  tech: ["React", "Spring Boot", "AWS"],
  grad: "linear-gradient(140deg,#8fd3f4,#84fab0)",
  tagline:
    "Connected Care. Smarter Healthcare.",
  facts: [
    { label: "Timeline", value: "3 months" },
    { label: "Team", value: "2 designers · 3 engineers" },
    { label: "Engagement", value: "Healthcare Management System" },
    { label: "Platforms", value: "Web" },
  ],
  stats: [
    { value: "8", label: "Core modules" },
    { value: "100%", label: "Digital workflow" },
    { value: "24/7", label: "Patient records access" },
  ],
  sections: [
    {
      heading: "The brief",
      body: "Healthcare providers require a seamless way to manage patient information, consultations, prescriptions, investigations, and billing. The Clinical Management Software centralizes every stage of care into a single digital platform, improving efficiency, accuracy, and patient experience.",
    },
    {
      heading: "The challenge",
      body: "Hospitals often rely on disconnected systems and manual processes, making patient management slow and error-prone. Coordinating information between doctors, nurses, pharmacies, laboratories, and billing departments becomes increasingly difficult as patient volume grows.",
      bullets: [
        "Patient information scattered across departments leads to delays and duplicate records.",
        "Manual prescriptions, investigations, and billing increase the risk of errors and longer waiting times.",
        "Lack of real-time coordination between clinical staff impacts workflow efficiency and patient care.",
      ],
    },
    {
      heading: "What we built",
      body: "We developed a fully integrated Clinical Management System that digitizes the complete patient lifecycle, allowing hospitals to manage consultations, prescriptions, diagnostics, pharmacy, and payments from a single platform.",
      bullets: [
        "Digitized the complete patient journey from registration to visit completion with real-time tracking.",
        "Integrated doctors, nurses, pharmacy, laboratory, and billing into one centralized workflow.",
        "Enabled electronic prescriptions, investigation requests, automated billing, and centralized patient history for faster, more accurate healthcare delivery.",
      ],
    },
    {
      heading: "Under the hood",
      body: "Built using React and Spring Boot, the platform follows a secure, scalable architecture with role-based access control. Integrated modules communicate seamlessly to provide real-time patient updates, digital prescriptions, inventory synchronization, and secure medical record management.",
    },
    {
      heading: "The outcome",
      body: "The Clinical Management Software replaced fragmented hospital processes with a unified digital ecosystem. By reducing paperwork, improving collaboration between departments, and maintaining complete patient histories, the platform enables hospitals to deliver faster, safer, and more efficient patient care.",
    },
  ],
},
 {
  title: "Website Design, Hosting & Management",
  desc: "End-to-end website development and cloud hosting solutions.",
  detail:
    "We design modern, high-performance websites, host them on secure cloud infrastructure, and provide continuous maintenance, monitoring, and optimization to keep your business online and growing.",
  meta: "2026 · Web Development & Cloud Services",
  tech: ["React", "Spring Boot", "AWS", "Cloudflare"],
  grad: "linear-gradient(140deg,#7dd3fc,#818cf8)",
  tagline:
    "Build. Host. Scale.",
  facts: [
    { label: "Hosting", value: "Cloud Infrastructure" },
    { label: "Security", value: "SSL + CDN" },
    { label: "Maintenance", value: "24/7 Monitoring" },
    { label: "Platforms", value: "Web" },
  ],
  stats: [
    { value: "99.98%", label: "Uptime SLA" },
    { value: "24/7", label: "Monitoring" },
    { value: "30 Days", label: "Backup Retention" },
  ],
  sections: [
    {
      heading: "The brief",
      body: "A business website should be more than an online presence—it should attract customers, perform reliably, and scale effortlessly. We provide complete website design, hosting, and management services under one roof.",
    },
    {
      heading: "The challenge",
      body: "Many businesses struggle with outdated websites, unreliable hosting, and ongoing maintenance. Managing security, updates, backups, and performance across multiple providers often leads to downtime and unnecessary complexity.",
      bullets: [
        "Slow-loading websites reduce customer engagement and search rankings.",
        "Managing hosting, domains, security, and maintenance separately increases operational overhead.",
        "Lack of regular updates and monitoring exposes websites to downtime and security risks.",
      ],
    },
    {
      heading: "What we built",
      body: "We deliver complete web solutions that combine custom design, enterprise-grade hosting, and proactive maintenance to ensure every website remains secure, fast, and available.",
      bullets: [
        "Designed responsive websites for businesses, e-commerce, portfolios, and custom web applications.",
        "Deployed websites on scalable cloud infrastructure with CDN, SSL, automated backups, and performance optimization.",
        "Provided continuous maintenance, SEO setup, analytics integration, content updates, and proactive monitoring.",
      ],
    },
    {
      heading: "Under the hood",
      body: "Powered by modern technologies including React, Spring Boot, AWS, and Cloudflare, every website is optimized for speed, scalability, and security. Automated deployments, SSL renewal, CDN caching, and daily backups ensure maximum reliability with minimal maintenance.",
    },
    {
      heading: "The outcome",
      body: "Businesses receive a fully managed digital platform that delivers exceptional performance, improved search visibility, stronger security, and reliable uptime—allowing them to focus on growth while we manage the technology.",
    },
  ],
},
  {
  title: "Cloud Deployments & Support Management",
  desc: "Scalable cloud deployment, migration, and managed infrastructure services.",
  detail:
    "Helping businesses migrate, deploy, and operate modern cloud infrastructure with secure architectures, automated deployments, disaster recovery, and 24/7 operational support.",
  meta: "2026 · Cloud Engineering & DevOps",
  tech: ["AWS", "Azure", "Google Cloud"],
  grad: "linear-gradient(140deg,#38bdf8,#6366f1)",
  tagline:
    "Deploy Faster. Operate Smarter.",
  facts: [
    { label: "Clouds", value: "AWS · Azure · GCP" },
    { label: "Deployment", value: "Cloud & Kubernetes" },
    { label: "Support", value: "24/7 Managed Services" },
    { label: "Platforms", value: "Cloud" },
  ],
  stats: [
    { value: "24/7", label: "Infrastructure Support" },
    { value: "99.99%", label: "High Availability" },
    { value: "Zero", label: "Downtime Migrations" },
  ],
  sections: [
    {
      heading: "The brief",
      body: "Modern organizations require reliable cloud infrastructure that can scale with business growth. Our Cloud Deployment & Support services cover everything from migration and deployment to continuous monitoring, maintenance, and operational support.",
    },
    {
      heading: "The challenge",
      body: "Migrating applications to the cloud while maintaining availability can be complex. Organizations also face challenges managing Kubernetes clusters, deployment pipelines, disaster recovery, and infrastructure reliability across multiple environments.",
      bullets: [
        "Cloud migrations require careful planning to minimize downtime and business disruption.",
        "Managing containers, Kubernetes clusters, and cloud infrastructure demands specialized expertise.",
        "Ensuring high availability, disaster recovery, and continuous monitoring increases operational complexity.",
      ],
    },
    {
      heading: "What we built",
      body: "We deliver end-to-end cloud deployment solutions that automate infrastructure provisioning, streamline application delivery, and provide continuous operational support for mission-critical systems.",
      bullets: [
        "Executed cloud migrations with zero-downtime deployment strategies and infrastructure modernization.",
        "Built Kubernetes platforms, serverless applications, CI/CD pipelines, and Infrastructure as Code using Terraform.",
        "Implemented disaster recovery, multi-region architectures, proactive monitoring, and 24/7 managed support services.",
      ],
    },
    {
      heading: "Under the hood",
      body: "Powered by Kubernetes, Terraform, AWS, Azure, and Google Cloud, the platform leverages Infrastructure as Code, automated CI/CD pipelines, container orchestration, monitoring, logging, and disaster recovery solutions to deliver secure, scalable, and resilient cloud environments.",
    },
    {
      heading: "The outcome",
      body: "Organizations gain a resilient cloud platform that accelerates software delivery, improves infrastructure reliability, minimizes downtime, and provides continuous operational support. With automated deployments and proactive monitoring, teams can focus on innovation instead of infrastructure management.",
    },
  ],
},
  {
    title: "Studio Muse",
    desc: "A creative portfolio engine with buttery transitions and rich media.",
    detail:
      "A portfolio engine for creatives who care about craft. WebGL-backed transitions, smart media handling, and a CMS that stays out of the way — every case study loads fast and animates smoothly, on any device.",
    meta: "2024 · Creative · Platform",
    tech: ["Astro", "WebGL", "Framer Motion"],
    grad: "linear-gradient(140deg,#c6b8ff,#ffb2d8)",
    tagline:
      "A portfolio engine for creatives who care about craft — fast, quiet, and out of the way.",
    facts: [
      { label: "Timeline", value: "4 months" },
      { label: "Team", value: "2 designers · 2 engineers" },
      { label: "Engagement", value: "Platform + CMS" },
      { label: "Users", value: "1,200 studios" },
    ],
    stats: [
      { value: "98", label: "Lighthouse performance" },
      { value: "60fps", label: "Held on mid-range mobile" },
      { value: "3.5×", label: "Faster case-study setup" },
    ],
    sections: [
      {
        heading: "The brief",
        body: "Studio Muse's customers are designers and photographers — an audience that will forgive almost anything except a site that feels cheap. The existing builder produced portfolios that loaded slowly and animated badly, which reflected on their work.",
      },
      {
        heading: "Motion with a budget",
        body: "Every transition had to earn its cost. We set a hard rule that no animation may touch a property that triggers layout, and that the whole page must hold 60fps on a four-year-old Android.",
        bullets: [
          "WebGL transitions between case studies, with a CSS fallback path",
          "Transform and opacity only — never width, height, or filter, in any animation",
          "All decorative motion pauses off-screen and respects reduced-motion",
        ],
      },
      {
        heading: "A CMS that disappears",
        body: "Astro renders the public site as static HTML with islands of interactivity, so a portfolio is cheap to host and near-instant to load. Editors work in a stripped-back interface built around dragging images into a page.",
        bullets: [
          "Static output with partial hydration only where interaction exists",
          "Automatic responsive derivatives generated on upload",
          "Draft previews that share a URL without exposing the whole account",
        ],
      },
      {
        heading: "The outcome",
        body: "Setting up a case study went from a long afternoon to under an hour, and portfolios built on the platform score in the high nineties on Lighthouse by default rather than after tuning.",
      },
    ],
  },
{
  title: "Research Cloud",
  desc: "Cloud-based research computing platform for institutions. (Currently in Development)",
  detail:
    "An upcoming self-service research computing platform that enables universities and research institutions to provision cloud workstations, GPU environments, and HPC workloads on demand while maintaining centralized governance, budget control, and security.",
  meta: "2026 · Research Computing Platform (In Development)",
  tech: [
    "Terraform",
    "GitHub Actions",
    "Amazon Cognito",
    "JupyterHub",
    "Amazon FSx",
    "CloudWatch"
  ],
  grad: "linear-gradient(140deg,#67e8f9,#8b5cf6)",
  tagline:
    "Accelerating Research. Powered by the Cloud.",
  facts: [
    { label: "Status", value: "In Development" },
    { label: "Cloud", value: "AWS" },
    { label: "Deployment", value: "Institution Managed" },
    { label: "Platforms", value: "Web" },
  ],
  stats: [
    { value: "GPU", label: "ML Workloads" },
    { value: "HPC", label: "Batch Computing" },
    { value: "24/7", label: "Planned Availability" },
  ],
  sections: [
    {
      heading: "The brief",
      body: "Research Cloud is an upcoming platform designed to simplify access to high-performance computing for universities and research institutions. Researchers will be able to launch GPU workstations, virtual desktops, and machine learning environments within minutes, while administrators maintain complete control over budgets, security, and resource allocation.",
    },
    {
      heading: "The challenge",
      body: "Many institutions depend on limited on-premise infrastructure, resulting in resource bottlenecks, long waiting times, and difficult-to-manage cloud environments. As research demands continue to grow, institutions require a scalable platform that balances computational power with governance and cost efficiency.",
      bullets: [
        "Researchers often wait for access to shared computing resources, slowing project timelines.",
        "Managing cloud costs and resource allocation across departments is difficult without centralized governance.",
        "Deploying specialized research environments manually increases operational complexity and maintenance overhead.",
      ],
    },
    {
      heading: "What we're building",
      body: "Research Cloud is currently under active development with a focus on delivering a secure, self-service platform that allows institutions to provision research infrastructure on demand while maintaining complete administrative oversight.",
      bullets: [
        "Self-service provisioning of virtual desktops, GPU workstations, machine learning environments, and HPC compute clusters.",
        "Integrated budget controls, project-based resource allocation, usage tracking, and automated cost management.",
        "Institution-wide governance with SSO integration, software catalogs, approval workflows, and automated resource lifecycle management.",
      ],
    },
    {
      heading: "Under the hood",
      body: "Built using React, Spring Boot, PostgreSQL, Docker, Kubernetes, and AWS cloud services, the platform leverages Amazon EKS for container orchestration, Amazon EC2 for scalable compute, Amazon S3 and Amazon FSx for secure research data storage, Amazon Cognito for authentication, Terraform for Infrastructure as Code, GitHub Actions for automated deployments, JupyterHub for machine learning environments, and CloudWatch for monitoring and operational insights. The architecture is currently being developed to deliver a secure, scalable, and enterprise-grade research computing platform.",
    },
    {
      heading: "Expected outcome",
      body: "Once completed, Research Cloud will provide institutions with a centralized research computing platform that accelerates innovation while reducing infrastructure complexity. Researchers will gain instant access to powerful computing resources, and administrators will benefit from improved governance, predictable cloud spending, and streamlined operations.",
    },
  ],
}
];

function ProjectModal({ p, onClose }: { p: Project; onClose: () => void }) {
  /* The panel's backdrop blur is only enabled once the entrance animation has
     finished, and is dropped again the moment it starts leaving. Blurring a
     moving/scaling element re-computes the filter every frame — gating it keeps
     open/close buttery while still giving real glass while you read. */
  const [settled, setSettled] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  // Fallback: don't rely solely on the animation callback firing — if it's ever
  // missed the panel would never get its glass back.
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(true), 420);
    return () => window.clearTimeout(t);
  }, []);

  // Rendered into <body> via a portal so it escapes the .stage transform
  // context — otherwise position:fixed anchors to that tall element and the
  // panel lands far below the viewport.
  return createPortal(
    /* The padding on this flex container IS the breathing room around the
       dialog — the panel is capped at 100% of that inset box, so the gap is
       equal on all four sides at every breakpoint. */
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-5 sm:p-8 lg:p-12">
      <motion.div
        className="modal-scrim absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      {/* SHELL — carries the glass. Deliberately does NOT scroll: the
          .glass-sheen edge-catch and reflection are absolutely positioned, so
          when they lived on the scrolling element they scrolled with the
          content and their bottom edge drew a stray line across the text. */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={p.title}
        className={`glass glass-sheen glass-nodrift modal-shell relative z-10 flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-[28px]${
          settled ? " is-settled" : ""
        }`}
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.98 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => setSettled(true)}
      >
        {/* top gloss — a fixed sheen across the shell, independent of scroll */}
        <span className="modal-gloss" aria-hidden />

        {/* close button is pinned to the shell, so it never scrolls */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-30 grid h-9 w-9 place-items-center rounded-full text-white/90 transition-colors hover:bg-black/60"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <X size={18} />
        </button>

        {/* SCROLLER — only this moves */}
        <div
          /* data-lenis-prevent tells the smooth-scroll library to ignore wheel
             and touch events that start inside this element. Without it Lenis
             preventDefault()s them for the page and the dialog never scrolls. */
          ref={scrollerRef}
          data-lenis-prevent
          className="modal-scroll relative z-10 overflow-y-auto overflow-x-hidden"
        >
        {/* cover */}
        <div
          className="relative h-44 w-full sm:h-56"
          style={{ background: p.grad }}
        >
          <div className="absolute inset-0 bg-white/10" />
          {/* fade the cover into the panel body */}
          <div
            className="absolute inset-x-0 bottom-0 h-24"
            style={{
              background: "linear-gradient(to top, var(--modal-bg), transparent)",
            }}
          />
        </div>

        <div className="px-6 pb-8 pt-6 sm:px-10 sm:pb-12 sm:pt-8">
          <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-dim sm:text-[0.75rem]">
            {p.meta}
          </div>
          <h3 className="mt-2 text-[1.6rem] font-semibold tracking-tight sm:text-[2.15rem]">
            {p.title}
          </h3>
          <p className="mt-3 max-w-2xl text-[1rem] leading-relaxed text-soft sm:text-[1.1rem]">
            {p.tagline}
          </p>

          {/* headline outcome numbers */}
          <div className="mt-7 grid grid-cols-3 gap-3">
            {p.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl px-3 py-4 text-center sm:px-4"
                style={{
                  background: "var(--glass-inner)",
                  border: "1px solid var(--hairline)",
                }}
              >
                <div className="text-[1.15rem] font-semibold tracking-tight sm:text-[1.5rem]">
                  {s.value}
                </div>
                <div className="mt-1 text-[0.68rem] leading-tight text-dim sm:text-[0.75rem]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* engagement facts */}
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y py-6 sm:grid-cols-4" style={{ borderColor: "var(--hairline)" }}>
            {p.facts.map((f) => (
              <div key={f.label}>
                <dt className="text-[0.68rem] uppercase tracking-wider text-dim sm:text-[0.72rem]">
                  {f.label}
                </dt>
                <dd className="mt-1 text-[0.88rem] font-medium sm:text-[0.95rem]">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* the long-form case study */}
          <div className="mt-8 space-y-8">
            {p.sections.map((s) => (
              <section key={s.heading}>
                <h4 className="text-[1.05rem] font-semibold tracking-tight sm:text-[1.2rem]">
                  {s.heading}
                </h4>
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

          {/* stack */}
          <div className="mt-9">
            <div className="text-[0.68rem] uppercase tracking-wider text-dim sm:text-[0.72rem]">
              Built with
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-full px-3.5 py-1.5 text-[0.75rem] font-medium text-dim sm:text-[0.8rem]"
                  style={{
                    background: "var(--glass-inner)",
                    border: "1px solid var(--hairline)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* had no onClick at all, so it did nothing. Closes the dialog first
              so the scroll-lock is released before the route changes. */}
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/get-started");
            }}
            className="gs-submit mt-9 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.9rem] font-medium text-white sm:text-[0.95rem]"
          >
            Contact Now <ArrowUpRight size={17} />
          </button>
        </div>
        </div>

        {/* returns the dialog's own scroller to the top, not the page */}
        <ScrollTop scroller={scrollerRef} threshold={260} className="scroll-top--in-modal" />
      </motion.div>
    </div>,
    document.body
  );
}

export default function Projects() {
  const [active, setActive] = useState<Project | null>(null);

  /* Scroll-lock + Escape + glow-freeze are driven by `active`, NOT by the
     modal's mount lifecycle. If the exit animation ever stalls, the dialog
     may linger in the DOM — tying cleanup to unmount would leave the page
     scroll-locked. Keyed on state, everything releases the moment it closes. */
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    document.addEventListener("keydown", onKey);
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    const root = document.documentElement;
    root.classList.add("lenis-stopped");
    // pauses the pointer-driven glow so the blurred page behind stops
    // repainting on every cursor move while the dialog is up
    root.setAttribute("data-modal-open", "");
    lenis?.stop();
    return () => {
      document.removeEventListener("keydown", onKey);
      root.classList.remove("lenis-stopped");
      root.removeAttribute("data-modal-open");
      lenis?.start();
    };
  }, [active]);

  return (
    <section id="projects" className="px-4 pt-14 sm:pt-20">
      <GlassCard className="mx-auto max-w-6xl px-6 py-12 sm:px-12 sm:py-16">
        <SectionHeading
          eyebrow="Our Craft"
          title="How we bring ideas to life "
          subtitle="Every project begins with an idea. These are a few of the digital experiences we’ve imagined, designed, and engineered from concept to launch. Select a card to explore the journey."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 0.08} className="h-full">
              <TiltCard className="group h-full">
                <GlassCard
                  lite
                  glow
                  radius="rounded-[26px]"
                  role="button"
                  tabIndex={0}
                  aria-label={`${p.title} — view project details`}
                  onClick={() => setActive(p)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActive(p);
                    }
                  }}
                  className="flex h-full cursor-pointer flex-col overflow-hidden p-4 transition-shadow duration-400 hover:shadow-glass-hover"
                >
                  <div
                    className="relative mb-5 h-40 w-full overflow-hidden rounded-[18px]"
                    style={{ background: p.grad }}
                  >
                    <div className="absolute inset-0 bg-white/10" />
                    <div className="absolute -inset-y-4 -left-1/3 w-1/3 rotate-12 bg-white/25 blur-md transition-transform duration-700 group-hover:translate-x-[420%]" />
                  </div>

                  <h3 className="text-[1.1rem] font-semibold tracking-tight sm:text-[1.15rem]">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-soft sm:text-[0.92rem]">
                    {p.desc}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded-full px-3 py-1 text-[0.7rem] font-medium text-dim sm:text-[0.72rem]"
                        style={{
                          background: "var(--glass-inner)",
                          border: "1px solid var(--hairline)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* mt-auto, not mt-5: the card is a flex column of varying
                      content (description length and how many rows the tech
                      tags wrap onto), so a fixed top margin left this label
                      floating at a different height in every card. Auto margin
                      absorbs the slack and pins it to the bottom, so it lines
                      up across the row without touching any text above it. */}
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[0.9rem] font-medium accent">
                    View project
                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </GlassCard>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </GlassCard>

      <AnimatePresence>
        {active && <ProjectModal p={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}
