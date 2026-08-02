import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import GlassCard from "../components/GlassCard";
import Reveal from "../components/Reveal";
import { navigate } from "../hooks/useRoute";
import { useAuth } from "../hooks/useAuth";
import { RECIPIENT } from "../lib/sendInquiry";

/** Google's mark, inlined so there's no external request. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.7 1.22 9.19 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export default function Login() {
  const { user, loading, available, error, signIn } = useAuth();
  const [busy, setBusy] = useState(false);

  /* Already signed in (or just signed in) → go straight to the enquiry form.
     Runs as an effect so it also covers landing here with a live session. */
  useEffect(() => {
    if (!loading && user) navigate("/get-started");
  }, [loading, user]);

  const onSignIn = async () => {
    setBusy(true);
    const ok = await signIn();
    setBusy(false);
    if (ok) navigate("/get-started");
  };

  return (
    <main className="gs-page relative z-[1] mx-auto flex min-h-[80vh] max-w-2xl items-center px-4 py-10 sm:px-8 sm:py-16">
      <div className="gs-wash gs-wash--a" aria-hidden />

      <div className="w-full">
        <Reveal>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group mb-8 inline-flex items-center gap-2 text-[0.9rem] font-medium text-dim transition-colors hover:text-[color:var(--text)]"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
            Back to Invisos
          </button>
        </Reveal>

        <Reveal delay={0.06}>
          <GlassCard className="px-6 py-10 text-center sm:px-12 sm:py-14">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
              style={{
                background:
                  "linear-gradient(160deg, var(--accent), var(--accent-2))",
                boxShadow:
                  "0 14px 34px -14px color-mix(in srgb, var(--accent) 70%, transparent)",
              }}
            >
              <Lock size={22} color="#fff" />
            </motion.div>

            <h1 className="mt-7 text-[1.6rem] font-semibold tracking-[-0.03em] sm:text-[2.1rem]">
              Sign in to continue
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[0.93rem] leading-relaxed text-soft sm:text-[1rem]">
              We ask you to sign in so we know enquiries come from a real,
              verified address — and so we can reply to the right person.
            </p>

            <button
              type="button"
              onClick={onSignIn}
              disabled={busy || !available}
              className="gs-choice mx-auto mt-8 inline-flex items-center justify-center gap-3 rounded-full px-7 py-3.5 text-[0.95rem] font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  Signing in…
                  <span className="gs-spinner" aria-hidden />
                </>
              ) : (
                <>
                  <GoogleMark />
                  Continue with Google
                </>
              )}
            </button>

            {!available && (
              <p className="mx-auto mt-5 max-w-sm text-[0.85rem]" style={{ color: "#e0576f" }}>
                Sign-in isn't configured on this deployment yet. You can still
                reach us at{" "}
                <a
                  href={`mailto:${RECIPIENT}`}
                  className="font-medium underline underline-offset-2"
                  style={{ color: "var(--link)" }}
                >
                  {RECIPIENT}
                </a>
                .
              </p>
            )}
            {error && (
              <p role="alert" className="mt-5 text-[0.85rem]" style={{ color: "#e0576f" }}>
                {error}
              </p>
            )}

            <div
              className="mx-auto mt-9 flex max-w-sm items-start gap-3 rounded-2xl p-4 text-left text-[0.85rem] leading-relaxed text-soft"
              style={{
                background: "var(--glass-inner)",
                border: "1px solid var(--hairline)",
              }}
            >
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0"
                style={{ color: "var(--accent)" }}
              />
              <span>
                We only read your name and email address, and we never post
                anything. Your session lasts 2 days.
              </span>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </main>
  );
}
