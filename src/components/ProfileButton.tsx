import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Send } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { navigate } from "../hooks/useRoute";

/** First name only — the pill has to stay small next to the nav links. */
function shortName(name?: string | null, email?: string | null) {
  const n = (name ?? "").trim();
  if (n) return n.split(/\s+/)[0];
  const e = (email ?? "").trim();
  return e ? e.split("@")[0] : "Account";
}

function initial(name?: string | null, email?: string | null) {
  return shortName(name, email).charAt(0).toUpperCase() || "?";
}

/**
 * Signed-in replacement for the Get Started button: a compact glass pill with
 * the user's avatar and first name, opening a small menu.
 */
export default function ProfileButton({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;
  const name = shortName(user.displayName, user.email);

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="profile-pill glass-lite glass-sheen"
        title={user.email ?? undefined}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            referrerPolicy="no-referrer"
            className="profile-pill__img"
          />
        ) : (
          <span className="profile-pill__initial">
            {initial(user.displayName, user.email)}
          </span>
        )}
        <span className="profile-pill__name">{name}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="profile-menu glass glass-sheen"
          >
            <div className="profile-menu__id">
              <div className="profile-menu__name">
                {user.displayName || name}
              </div>
              <div className="profile-menu__mail">{user.email}</div>
            </div>

            <button
              type="button"
              role="menuitem"
              className="profile-menu__item"
              onClick={() => {
                setOpen(false);
                onNavigate?.();
                navigate("/get-started");
              }}
            >
              <Send size={15} />
              Start a project
            </button>

            <button
              type="button"
              role="menuitem"
              className="profile-menu__item"
              onClick={async () => {
                setOpen(false);
                await signOut();
                navigate("/");
              }}
            >
              <LogOut size={15} />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
